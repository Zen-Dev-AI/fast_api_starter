from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, MessagesState
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.postgres import PostgresSaver
import logging
from app.globals.settings import settings
from app.globals.dependencies import get_checkpointer
from .schemas import ChatRequest
from fastapi import  Depends

router = APIRouter(prefix="/langgraph", tags=["ai-chat", "langgraph"])

def build_graph(model_name: str, temperature: float, checkpointer):
    model = init_chat_model(model_name, model_provider="openai", temperature=temperature)

    def call_model(state: MessagesState):
        try:
            response = model.invoke(state["messages"])
            return {"messages": [response]}
        except Exception as e:
            logging.error(f"Error in call_model: {e}", exc_info=True)
            return {"messages": [], "error": str(e)}

    builder = StateGraph(MessagesState)
    builder.add_node("call_model", call_model)
    builder.set_entry_point("call_model")
    builder.set_finish_point("call_model")

    return builder.compile(checkpointer=checkpointer)



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
