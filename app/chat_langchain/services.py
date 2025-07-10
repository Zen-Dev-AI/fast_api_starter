# app/langgraph/services.py

from sqlalchemy.orm import Session
from . import repository
from .models import Conversation, Message

def get_conversation(db: Session, thread_id: str, user_id: int) -> Conversation | None:
    return repository.get_conversation(db, thread_id, user_id)

def create_conversation(db: Session, thread_id: str, user_id: int, body_prompt) -> Conversation:
    return repository.create_conversation(db, thread_id, user_id, body_prompt)

def get_or_create_conversation(db: Session, thread_id: str, user_id: int, body_prompt: str) -> Conversation:
    conv = get_conversation(db, thread_id, user_id )
    if conv is None:
        conv = create_conversation(db, thread_id, user_id, body_prompt)
    return conv

def save_message(db: Session, conversation_id: int, role: str, content: str) -> Message:
    return repository.create_message(db, conversation_id, role, content)

def get_messages_for_conversation(db: Session, conversation_id: int):
    return repository.get_messages_by_conversation_id(db, conversation_id)


def list_conversations_by_user(db: Session, user_id: int) -> list[Conversation]:
    return repository.list_conversations_by_user(db, user_id)
