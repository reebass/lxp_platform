from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import document, chat

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

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI Service is running"}

app.include_router(document.router, tags=["Documents"])
app.include_router(chat.router, tags=["Chat"])
