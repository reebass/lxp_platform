from fastapi import APIRouter
from app.models.schemas import ProcessDocumentRequest
from app.services.document_service import process_document

router = APIRouter()

@router.post("/process-document")
async def process_document_route(request: ProcessDocumentRequest):
    return process_document(request.document_id, request.tenant_id)
