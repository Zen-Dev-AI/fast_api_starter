from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    model_name: str
    system_message: str | None = None
    temperature: float = 0.7
