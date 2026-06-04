"""FastAPI math tutor chatbot service."""

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.engine import generate_response

load_dotenv()

app = FastAPI(title="Math Game AI Tutor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_history: list[ChatMessage] = Field(default_factory=list)
    user_progress: dict | None = None


class ChatResponse(BaseModel):
    response: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        history = [m.model_dump() for m in request.conversation_history]
        text = await generate_response(
            request.message,
            conversation_history=history,
            user_progress=request.user_progress,
        )
        return ChatResponse(response=text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
