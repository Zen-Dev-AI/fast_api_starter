from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from .schemas import ChatRequest
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage

router = APIRouter(prefix="/langgraph", tags=["ai-chat", "langchain", "langgraph"])

@router.post("/chat-stream")
async def lang_chain_stream(request: Request, body: ChatRequest):
    model = init_chat_model(body.model_name, model_provider="openai", temperature=body.temperature)

    async def chat_stream():
        messages = []
        if body.system_message:
            messages.append(SystemMessage(content=body.system_message))
        messages.append(HumanMessage(content=body.prompt))

        for token in model.stream(messages):
            yield f"data: {token.content}\n\n"

    return StreamingResponse(chat_stream(), media_type="text/event-stream")




