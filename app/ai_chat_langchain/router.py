from fastapi import APIRouter
from fastapi import  Request
from fastapi.responses import StreamingResponse

from ..ai_chat_openai.schemas import ChatRequest
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage

model = init_chat_model("gpt-4o-mini", model_provider="openai")


router = APIRouter(prefix="/langchain", tags=["ai-chat", "langchain"])

@router.post("/chat-stream")
async def lang_chain_stream(request: Request, body: ChatRequest):
    async def chat_stream():
        messages = [
            HumanMessage(body.prompt),
        ]

        # model.invoke(messages)
        for token in model.stream(messages):
            yield f"data: {token.content}\n\n"

    return StreamingResponse(chat_stream(), media_type="text/event-stream")



