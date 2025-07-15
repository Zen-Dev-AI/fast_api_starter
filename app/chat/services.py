from sqlalchemy.orm import Session
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import HumanMessage, SystemMessage
from datetime import datetime
from typing import List
from . import repository
from .models import Conversation
from .schemas import ConversationSummary

def get_or_create_conversation(db: Session, thread_id: str, user_id: int, title: str) -> Conversation:
    return repository.get_or_create_conversation(db, thread_id, user_id, title)

def get_conversations_by_user(db: Session, checkpointer: PostgresSaver, user_id: int) -> List[ConversationSummary]:
    """
    Get all conversations for a user with summary information from checkpointer
    """
    # Get all thread_ids for this user
    user_conversations = repository.list_conversations_by_user(db, user_id)
    
    conversations = []
    
    for conv in user_conversations:
        # Get conversation details from checkpointer
        config: RunnableConfig = {"configurable": {"thread_id": conv.thread_id}}
        
        try:
            # Get the latest checkpoint for this thread
            checkpoints = list(checkpointer.list(config, limit=1))
            
            last_message_at = None
            message_count = 0
            
            if checkpoints:
                checkpoint_tuple = checkpoints[0]
                channel_values = checkpoint_tuple.checkpoint.get('channel_values', {})
                messages = channel_values.get('messages', [])
                message_count = len(messages)
                
                # Get timestamp from the checkpoint
                if hasattr(checkpoint_tuple, 'metadata') and checkpoint_tuple.metadata:
                    last_message_at = checkpoint_tuple.metadata.get('created_at')
                    if isinstance(last_message_at, str):
                        try:
                            last_message_at = datetime.fromisoformat(last_message_at.replace('Z', '+00:00'))
                        except:
                            last_message_at = None
            
            conversations.append(ConversationSummary(
                thread_id=conv.thread_id,
                title=conv.title,
                created_at=conv.created_at,
                last_message_at=last_message_at or conv.created_at,
                message_count=message_count
            ))
            
        except Exception as e:
            # If there's an error getting checkpoint data, still include the conversation
            conversations.append(ConversationSummary(
                thread_id=conv.thread_id,
                title=conv.title,
                created_at=conv.created_at,
                last_message_at=conv.created_at,
                message_count=0
            ))
    
    return conversations

def delete_conversation(db: Session, checkpointer: PostgresSaver, thread_id: str, user_id: int):
    """
    Delete conversation from both database and checkpointer
    """
    # Delete from database
    repository.delete_conversation(db, thread_id, user_id)
    
    # Delete from checkpointer
    checkpointer.delete_thread(thread_id)
