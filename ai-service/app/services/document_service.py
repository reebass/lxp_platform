import io
import os
import pdfplumber
import docx
from fastapi import HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.dependencies import supabase, embeddings_model

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

def process_document(document_id: str, tenant_id: str) -> dict:
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
