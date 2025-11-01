from sqlalchemy.orm import Session
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import HumanMessage, SystemMessage
from datetime import datetime
from typing import List
from . import repository
from .models import Conversation
from .schemas import ConversationSummary
from .dependencies import build_graph

def get_or_create_conversation(db: Session, thread_id: str, user_id: int, title: str) -> Conversation:
    return repository.get_or_create_conversation(db, thread_id, user_id, title)

def get_conversations_by_user(db: Session, checkpointer: PostgresSaver, user_id: int) -> List[ConversationSummary]:
    """
    Get all conversations for a user with summary information from checkpointer
    """
    # Get all thread_ids for this user
    user_conversations = repository.list_conversations_by_user(db, user_id)
    
    conversations = []
    
    # Build graph to get state snapshots
    graph = build_graph(checkpointer)
    
    for conv in user_conversations:
        # Get conversation details from checkpointer using graph.get_state()
        config: RunnableConfig = {"configurable": {"thread_id": conv.thread_id}}
        
        try:
            # Get the state snapshot for this thread
            state_snapshot = graph.get_state(config)
            
            last_message_at = None
            message_count = 0
            
            if state_snapshot and state_snapshot.values:
                messages = state_snapshot.values.get('messages', [])
                message_count = len(messages)
                
                # Get timestamp from the checkpoint metadata
                if hasattr(state_snapshot, 'metadata') and state_snapshot.metadata:
                    last_message_at = state_snapshot.metadata.get('created_at')
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
    
    # Delete from checkpointer using graph
    graph = build_graph(checkpointer)
    config: RunnableConfig = {"configurable": {"thread_id": thread_id}}
    
    # Clear the thread state
    try:
        graph.update_state(config, None, as_node="__start__")
    except Exception:
        # Fallback to direct checkpointer delete if graph method fails
        checkpointer.delete_thread(thread_id)
