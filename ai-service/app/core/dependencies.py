import os
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

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

ASK_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a knowledgeable, friendly mentor — warm, encouraging, and easy to talk to.\n"
        "Your goal is to help the user genuinely understand the material, not just recite it.\n\n"

        "## Tone & Style\n"
        "- Be conversational, empathetic, and human. Write as though you are a trusted expert friend.\n"
        "- Use soft, encouraging language (e.g. 'Great question!', 'Let me break that down for you.').\n"
        "- When explaining complex concepts, simplify them into everyday language.\n"
        "- Keep answers focused and clear — avoid unnecessary jargon.\n\n"

        "## Language Rule (CRITICAL)\n"
        "You MUST ALWAYS respond in the exact same language the user used in their question.\n"
        "This rule overrides everything else.\n\n"

        "## 3-Tier Knowledge & Boundary Rules (CRITICAL)\n"
        "Tier 1 (RAG Context): Always prioritize answering using the provided {context}.\n"
        "Tier 2 (Platform Knowledge): If the {context} is empty or lacks the answer, use the {platform_knowledge} below to guide the user.\n"
        "Tier 3 (Strict Boundary & Humor): If the user asks general, non-educational questions (e.g. weather, currency, recipes, general trivia) "
        "that are NOT in the context and NOT about the platform, you MUST NOT answer the question. "
        "Instead, politely and with a touch of humor refuse. For example: "
        "'I only know about learning and development here! For questions about the weather or the dollar exchange rate, you're better off asking my famous colleague ChatGPT.'\n\n"

        "Platform Knowledge:\n{platform_knowledge}\n\n"

        "Context:\n{context}",
    ),
    ("human", "{question}"),
])

ask_chain = ASK_PROMPT | llm | StrOutputParser()
