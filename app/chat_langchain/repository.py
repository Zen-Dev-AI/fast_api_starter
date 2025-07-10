from sqlalchemy.orm import Session
from .models import Conversation, Message

def get_conversation(db: Session, thread_id: str, user_id: int) -> Conversation | None:
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

def create_message(db: Session, conversation_id: int, role: str, content: str) -> Message:
    msg = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_messages_by_conversation_id(db: Session, conversation_id: int) -> list[Message]:
    return (
        db.query(Message)
          .filter_by(conversation_id=conversation_id)
          .order_by(Message.timestamp)
          .all()
    )


def list_conversations_by_user(db: Session, user_id: int) -> list[Conversation]:
    return (
        db.query(Conversation)
          .filter(Conversation.user_id == user_id)
          .order_by(Conversation.created_at.desc())
          .all()
    )

def delete_conversation(db: Session, conversation_id: int):
    db.query(Conversation).filter_by(id=conversation_id).delete()
    db.commit()
