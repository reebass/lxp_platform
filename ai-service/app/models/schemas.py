from typing import Optional
from pydantic import BaseModel

class ProcessDocumentRequest(BaseModel):
    document_id: str
    tenant_id: str

class AskRequest(BaseModel):
    tenant_id: Optional[str] = None
    question: str

class GenerateTextRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    action: str  # 'summarize' | 'format_steps' | 'suggest_title' | 'generate'
