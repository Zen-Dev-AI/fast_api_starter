from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.checkpoint.postgres import PostgresSaver
import logging
from app.globals.settings import settings
from app.globals.dependencies import get_checkpointer
from .utils import build_graph
from .schemas import ChatRequest
from fastapi import  Depends

router = APIRouter(prefix="/langgraph", tags=["ai-chat", "langgraph"])


@router.post("/chat-stream")
def chat_stream(
    body: ChatRequest,
    checkpointer: PostgresSaver = Depends(get_checkpointer)
):
    messages = []
    if body.system_message:
        messages.append(SystemMessage(content=body.system_message))
    messages.append(HumanMessage(content=body.prompt))

    graph = build_graph(body.model_name, body.temperature, checkpointer)

    def streamer():
        try:
            for chunk in graph.stream(
                {"messages": messages},
                config={"configurable": {"thread_id": body.thread_id}},
                stream_mode="messages"
            ):
                if chunk:
                    yield f"data: {chunk}\n\n"
        except Exception as e:
            logging.error(f"Streaming error: {e}", exc_info=True)
            yield f"data: [STREAM_ERROR] {str(e)}\n\n"

    return StreamingResponse(streamer(), media_type="text/event-stream")
