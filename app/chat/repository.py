from sqlalchemy.orm import Session
from app.chat.models import Conversation
from typing import List

def get_conversation_by_thread_id(db: Session, thread_id: str, user_id: int) -> Conversation | None:
    return (
        db.query(Conversation)
          .filter_by(thread_id=thread_id, user_id=user_id)
          .first()
    )

def create_conversation(db: Session, thread_id: str, user_id: int, title: str) -> Conversation:
    conv = Conversation(thread_id=thread_id, user_id=user_id, title=title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

def get_or_create_conversation(db: Session, thread_id: str, user_id: int, title: str) -> Conversation:
    conv = get_conversation_by_thread_id(db, thread_id, user_id)
    if conv is None:
        conv = create_conversation(db, thread_id, user_id, title)
    return conv

def list_conversations_by_user(db: Session, user_id: int) -> List[Conversation]:
    return (
        db.query(Conversation)
          .filter(Conversation.user_id == user_id)
          .order_by(Conversation.created_at.desc())
          .all()
    )

def delete_conversation(db: Session, thread_id: str, user_id: int):
    db.query(Conversation).filter_by(thread_id=thread_id, user_id=user_id).delete()
    db.commit()
