import io
import os
import tempfile
from uuid import UUID

import pdfplumber
import docx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel
from supabase import create_client, Client

load_dotenv()

# ---------------------------------------------------------------------------
# Supabase & OpenAI clients (initialised once at startup)
# ---------------------------------------------------------------------------
SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

embeddings_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=os.environ["OPENAI_API_KEY"],
)

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    openai_api_key=os.environ["OPENAI_API_KEY"],
)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="LXP AI Service",
    description="AI processing microservice for the LXP platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class ProcessDocumentRequest(BaseModel):
    document_id: str
    tenant_id: str


class AskRequest(BaseModel):
    tenant_id: str
    question: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_text(file_bytes: bytes, extension: str) -> str:
    """Extract plain text from a file given its raw bytes and extension."""
    ext = extension.lower().lstrip(".")

    if ext == "pdf":
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join(
                page.extract_text() or "" for page in pdf.pages
            )

    if ext == "docx":
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join(paragraph.text for paragraph in doc.paragraphs)

    if ext == "txt":
        return file_bytes.decode("utf-8")

    raise ValueError(f"Unsupported file extension: .{ext}")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI Service is running"}


@app.post("/process-document")
async def process_document(request: ProcessDocumentRequest):
    document_id = request.document_id
    tenant_id = request.tenant_id

    try:
        # ------------------------------------------------------------------
        # 1. Fetch document metadata from Supabase
        # ------------------------------------------------------------------
        meta_response = (
            supabase.table("documents")
            .select("file_path, name")
            .eq("id", document_id)
            .single()
            .execute()
        )

        if not meta_response.data:
            raise HTTPException(status_code=404, detail="Document not found")

        meta = meta_response.data
        file_path: str = meta["file_path"]
        file_extension: str = meta.get("file_extension") or ""

        # Fallback: infer extension from file name if not stored separately
        if not file_extension and meta.get("name"):
            file_extension = os.path.splitext(meta["name"])[-1]

        # ------------------------------------------------------------------
        # 2. Download file from Supabase Storage into memory
        # ------------------------------------------------------------------
        file_bytes: bytes = supabase.storage.from_("tenant_documents").download(
            file_path
        )

        # ------------------------------------------------------------------
        # 3. Extract text
        # ------------------------------------------------------------------
        raw_text = _extract_text(file_bytes, file_extension)

        if not raw_text.strip():
            raise ValueError("No text could be extracted from the document.")

        # ------------------------------------------------------------------
        # 4. Split into chunks
        # ------------------------------------------------------------------
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
        )
        chunks: list[str] = splitter.split_text(raw_text)

        # ------------------------------------------------------------------
        # 5. Embed all chunks
        # ------------------------------------------------------------------
        vectors: list[list[float]] = embeddings_model.embed_documents(chunks)

        # ------------------------------------------------------------------
        # 6. Bulk-insert into document_chunks
        # ------------------------------------------------------------------
        rows = [
            {
                "document_id": document_id,
                "tenant_id": tenant_id,
                "content": chunk,
                "embedding": vector,
                "metadata": {"chunk_index": idx},
            }
            for idx, (chunk, vector) in enumerate(zip(chunks, vectors))
        ]

        supabase.table("document_chunks").insert(rows).execute()

        # ------------------------------------------------------------------
        # 7. Mark document as ready
        # ------------------------------------------------------------------
        supabase.table("documents").update({"status": "ready"}).eq(
            "id", document_id
        ).execute()

        return {
            "status": "success",
            "document_id": document_id,
            "chunks_created": len(rows),
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is (e.g. 404 above)
        raise

    except Exception as exc:
        # Mark document as errored, then surface a 500
        try:
            supabase.table("documents").update({"status": "error"}).eq(
                "id", document_id
            ).execute()
        except Exception:
            pass  # best-effort; don't mask the original error

        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(exc)}",
        ) from exc


# ---------------------------------------------------------------------------
# /ask  — RAG retrieval + generation
# ---------------------------------------------------------------------------

ASK_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a knowledgeable, friendly mentor — warm, encouraging, and easy to talk to. "
        "Your goal is to help the user genuinely understand the material, not just recite it.\n\n"

        "## Tone & Style\n"
        "- Be conversational, empathetic, and human. Write as though you are a trusted expert friend.\n"
        "- Use soft, encouraging language (e.g. 'Great question!', 'Let me break that down for you.').\n"
        "- When explaining complex concepts, simplify them into everyday language. "
        "Use relatable analogies or real-world examples where helpful.\n"
        "- Keep answers focused and clear — avoid unnecessary jargon.\n\n"

        "## Language Rule (CRITICAL)\n"
        "You MUST ALWAYS respond in the exact same language the user used in their question. "
        "This rule overrides everything else — even if the context is in a different language.\n\n"

        "## Knowledge Boundaries (CRITICAL)\n"
        "- You must base your answer STRICTLY on the provided context below. "
        "Do NOT use any external knowledge or make anything up.\n"
        "- If the context does not contain the answer, respond warmly but honestly with EXACTLY this phrase: "
        "\"I don't have enough information to answer that.\"\n"
        "- Do not hallucinate facts, figures, or details not present in the context.\n\n"

        "Context:\n{context}",
    ),
    ("human", "{question}"),
])

ask_chain = ASK_PROMPT | llm | StrOutputParser()


@app.post("/ask")
async def ask(request: AskRequest):
    tenant_id = request.tenant_id
    question = request.question

    try:
        # 1. Embed the question
        query_vector: list[float] = embeddings_model.embed_query(question)

        # 2. Vector search via Supabase RPC
        rpc_response = supabase.rpc(
            "match_document_chunks",
            {
                "query_embedding": query_vector,
                "match_threshold": 0.4,
                "match_count": 5,
                "p_tenant_id": tenant_id,
            },
        ).execute()

        chunks = rpc_response.data or []

        # 3. No relevant chunks found
        if not chunks:
            return {
                "answer": "I don't have enough information to answer that.",
                "sources": [],
            }

        # 4. Assemble context and collect source document names
        context = "\n\n".join(chunk["content"] for chunk in chunks)
        unique_source_ids = list(
            {chunk["document_id"] for chunk in chunks if chunk.get("document_id")}
        )

        source_names: list[str] = []
        if unique_source_ids:
            names_res = (
                supabase.table("documents")
                .select("name")
                .in_("id", unique_source_ids)
                .execute()
            )
            source_names = [r["name"] for r in (names_res.data or [])]

        # 5. Generate answer
        answer: str = await ask_chain.ainvoke(
            {"context": context, "question": question}
        )

        return {"answer": answer, "sources": source_names}

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Ask failed: {str(exc)}",
        ) from exc
