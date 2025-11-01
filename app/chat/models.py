# app/chat_langgraph/models.py

from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.globals.db import Base


if TYPE_CHECKING:
    # only for mypy/type hints—won't execute at runtime
    from app.auth.models import User  


class Conversation(Base):
    """
    Tracks thread_id to user_id mapping for Langgraph conversations.
    The actual conversation data is stored in PostgresSaver checkpoints.
    """
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    thread_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User")
