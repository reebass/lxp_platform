from typing import Optional
from pydantic import BaseModel

class ProcessDocumentRequest(BaseModel):
    document_id: str
    tenant_id: str

class AskRequest(BaseModel):
    tenant_id: Optional[str] = None
    question: str
