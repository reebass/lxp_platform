from fastapi import APIRouter
from app.models.schemas import AskRequest
from app.services.ai_service import ask_question

router = APIRouter()

@router.post("/ask")
async def ask_route(request: AskRequest):
    return await ask_question(request.tenant_id, request.question)
