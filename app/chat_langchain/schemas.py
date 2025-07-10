from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    prompt: str
    model_name: str
    system_message: Optional[str] = None
    temperature: float = 0.7
    thread_id: str

class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime


class ConversationOut(BaseModel):
    id: int
    thread_id: str
    title: str
    created_at: datetime




