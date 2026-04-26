from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateTextRequest
from app.core.dependencies import llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

# Action-specific system prompts for microlearning content
SYSTEM_PROMPTS = {
    "summarize": (
        "You are a microlearning content editor. "
        "Summarize the following text into a concise, clear version suitable for a single learning slide. "
        "Keep it short (3-5 sentences max). Preserve the key information. "
        "CRITICAL: Respond in the SAME language as the input text."
    ),
    "format_steps": (
        "You are a microlearning content editor. "
        "Reformat the following text as a numbered step-by-step list. "
        "Each step should be clear and actionable. "
        "CRITICAL: Respond in the SAME language as the input text."
    ),
    "suggest_title": (
        "You are a microlearning content editor. "
        "Based on the following text, suggest a short, catchy title (5-8 words max). "
        "Return ONLY the title, nothing else. No quotes, no explanation. "
        "CRITICAL: Respond in the SAME language as the input text."
    ),
    "generate": (
        "You are a microlearning content creator. "
        "Generate educational content based on the user's prompt. "
        "Write clear, engaging text suitable for a single learning slide (3-6 sentences). "
        "CRITICAL: Respond in the SAME language as the input text."
    ),
}


@router.post("/generate/text")
async def generate_text_route(request: GenerateTextRequest):
    system_prompt = SYSTEM_PROMPTS.get(request.action)
    if not system_prompt:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown action: {request.action}. Valid: {list(SYSTEM_PROMPTS.keys())}",
        )

    # Build prompt with optional context
    messages = [("system", system_prompt)]
    if request.context:
        messages.append(("system", f"Additional context:\n{request.context}"))
    messages.append(("human", "{prompt}"))

    chain = ChatPromptTemplate.from_messages(messages) | llm | StrOutputParser()

    try:
        result = await chain.ainvoke({"prompt": request.prompt})
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
