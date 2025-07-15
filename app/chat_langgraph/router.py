import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables.config import RunnableConfig
from langgraph.checkpoint.postgres import PostgresSaver
import logging
from app.globals.settings import settings
from .dependencies import get_checkpointer
from .utils import build_graph
from pydantic import BaseModel
from typing import List
from .schemas import ChatRequest
from fastapi import Depends

class MessageResponse(BaseModel):
    role: str
    content: str
    id: str

class ChatHistoryResponse(BaseModel):
    messages: List[MessageResponse]

router = APIRouter(prefix="/langgraph", tags=["ai-chat", "langgraph"])

@router.get("/chat-history/{thread_id}", response_model=ChatHistoryResponse)
def get_chat_history(
    thread_id: str,
    checkpointer: PostgresSaver = Depends(get_checkpointer)
):
    config: RunnableConfig = {"configurable": {"thread_id": thread_id}, "run_name": thread_id}
    conversation_tuple = checkpointer.get_tuple(config)
    
    messages = []
    if conversation_tuple:
        channel_values = conversation_tuple[1].get('channel_values', {})
        history_messages = channel_values.get('messages', [])
        for message in history_messages:
            # Get the role based on message type
            if isinstance(message, HumanMessage):
                role = "user"
            elif isinstance(message, SystemMessage):
                role = "system"
            else:
                role = "assistant"
                
            # Ensure content is a string
            content = message.content
            if not isinstance(content, str):
                content = str(content) if content is not None else ""

            messages.append(MessageResponse(
                role=role,
                content=content,
                id=getattr(message, 'id', '')
            ))
    
    return ChatHistoryResponse(messages=messages)

@router.post("/chat-stream")
def chat_stream(
    body: ChatRequest,
    checkpointer: PostgresSaver = Depends(get_checkpointer)
):
    
    config: RunnableConfig = {"configurable": {"thread_id": body.thread_id}, "run_name": body.thread_id}

    # 2. Use the checkpointer's 'get' method which handles the decoding for you
    conversation_tuple = checkpointer.get_tuple(config)
    
    messages = []
    if conversation_tuple:
        # Extract messages from channel_values
        channel_values = conversation_tuple[1].get('channel_values', {})
        history_messages = channel_values.get('messages', [])
        for message in history_messages:
            print(f"Role: {message.__class__.__name__}, Content: {message.content}")
            messages.append(message)
    
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
                if chunk and isinstance(chunk, tuple) and len(chunk) > 0:
                    ai_message = chunk[0]
                    content = getattr(ai_message, 'content', '')
                    yield f"data: {json.dumps({'content': content})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"


    return StreamingResponse(streamer(), media_type="text/event-stream")
