# app/langgraph/router.py

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from app.globals.db import SessionLocal
from .schemas import ChatRequest, MessageOut, ConversationOut
from . import services
from app.globals.dependencies import get_db
from app.auth.jwt import get_current_user
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain.chat_models import init_chat_model
from app.auth.models import User
from fastapi import HTTPException
import json

router = APIRouter(prefix="/langchain", tags=["ai-chat", "langchain"])

@router.post("/chat-stream")
def chat_stream(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = services.get_or_create_conversation(db, body.thread_id, current_user.id, body.prompt)
    if body.system_message:
        services.save_message(db, conv.id, "system", body.system_message)
    services.save_message(db, conv.id, "user", body.prompt)

    history = services.get_messages_for_conversation(db, conv.id)
    if not history:
        raise HTTPException(500, "Failed to load conversation history")

    lc_messages: list = []
    for msg in history:
        if msg.role == "system":
            lc_messages.append(SystemMessage(content=msg.content))
        elif msg.role == "user":
            lc_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            lc_messages.append(AIMessage(content=msg.content))
        else:
            # fallback
            lc_messages.append(HumanMessage(content=msg.content))

    model = init_chat_model(body.model_name, model_provider="openai")
    assistant_content = ""

    def stream_generator():
        nonlocal assistant_content
        try:
            for chunk in model.stream(lc_messages):
                text = chunk.content if isinstance(chunk.content, str) else str(chunk.content)
                assistant_content += text
                yield f"data: {chunk.model_dump_json()}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        else:
            with SessionLocal() as session:
                services.save_message(session, conv.id, "assistant", assistant_content)

    return StreamingResponse(stream_generator(), media_type="text/event-stream")


@router.get(
    "/conversations/{thread_id}/messages",
    response_model=List[MessageOut],
)
def get_conversation_messages(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = services.get_conversation(db, thread_id, current_user.id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = services.get_messages_for_conversation(db, conv.id)
    return messages


@router.get(
    "/conversations",
    response_model=List[ConversationOut],
    summary="List all conversations for the current user",
)
def list_my_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve all Conversation records belonging to the authenticated user,
    ordered from newest to oldest.
    """
    return services.list_conversations_by_user(db, current_user.id)