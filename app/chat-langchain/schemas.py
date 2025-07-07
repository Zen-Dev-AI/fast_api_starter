from pydantic import BaseModel

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union

class ChatRequest(BaseModel):
    prompt: str
    model_name: str
    system_message: str | None = None
    temperature: float = 0.7
    thread_id: str
