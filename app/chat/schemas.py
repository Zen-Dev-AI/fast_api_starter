from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ChatRequest(BaseModel):
    prompt: str
    model_name: str
    system_message: str | None = None
    temperature: float = 0.7
    thread_id: str

class ConversationSummary(BaseModel):
    thread_id: str
    title: str
    created_at: datetime
    last_message_at: Optional[datetime] = None
    message_count: int = 0

class ConversationsResponse(BaseModel):
    conversations: List[ConversationSummary]


class MessageResponse(BaseModel):
    role: str
    content: str
    id: str

class ChatHistoryResponse(BaseModel):
    messages: List[MessageResponse]
