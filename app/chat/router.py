import json
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, SystemMessage, BaseMessage
from langchain_core.runnables.config import RunnableConfig
from langgraph.checkpoint.postgres import PostgresSaver
from sqlalchemy.orm import Session
from app.globals.settings import settings
from app.globals.dependencies import get_db
from app.auth.jwt import get_current_user
from app.auth.models import User
from .dependencies import get_checkpointer
from .utils import build_graph
from .schemas import ChatHistoryResponse, ChatRequest, ConversationsResponse,  MessageResponse
from . import services
from fastapi import Depends

router = APIRouter(prefix="/chat", tags=["ai-chat", "langgraph"])



@router.get("/chat-history/{thread_id}", response_model=ChatHistoryResponse)
def get_chat_history(
    thread_id: str,
    checkpointer: PostgresSaver = Depends(get_checkpointer)
):
    config: RunnableConfig = {"configurable": {"thread_id": thread_id}, "run_name": thread_id}

    graph = build_graph(checkpointer)    
    state_snapshot = graph.get_state(config)

    history_messages = []
    if state_snapshot:
        history_messages = state_snapshot.values.get("messages", [])

    print(f"Retrieved {history_messages} messages for thread {thread_id}")

    # Process messages for the response
    messages = []
    for message in history_messages:
        if isinstance(message, HumanMessage):
            role = "user"
        elif isinstance(message, SystemMessage):
            role = "system"
        else:
            role = "assistant"
        
        messages.append(MessageResponse(
            role=role,
            content=str(message.content),
            id=getattr(message, 'id', '')
        ))
    print(f"Processed {messages} messages for response")
    # return "test"
    return ChatHistoryResponse(messages=messages)

@router.post("/chat-stream")
def chat_stream(
    body: ChatRequest,
    checkpointer: PostgresSaver = Depends(get_checkpointer),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    # Create or get conversation record for this user
    services.get_or_create_conversation(db, body.thread_id, current_user.id, body.prompt[:50])
    
    config: RunnableConfig = {"configurable": {"thread_id": body.thread_id}, "run_name": body.thread_id} 
    
    graph = build_graph(checkpointer=checkpointer, model_name=body.model_name, temperature=body.temperature )
    state_snapshot = graph.get_state(config)

    history_messages = []
    if state_snapshot:
        history_messages = state_snapshot.values.get("messages", [])

    # Process messages for the response
    messages = []
    for message in history_messages:
        if isinstance(message, HumanMessage):
            role = "user"
        elif isinstance(message, SystemMessage):
            role = "system"
        else:
            role = "assistant"
        
        messages.append(MessageResponse(
            role=role,
            content=str(message.content),
            id=getattr(message, 'id', '')
        ))
    
    print(messages)

    if body.system_message:
        messages.append(SystemMessage(content=body.system_message))
    messages.append(HumanMessage(content=body.prompt))


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

@router.get(
    "/conversations",
    response_model=ConversationsResponse,
    summary="List all conversations for the current user",
)
def list_my_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    checkpointer: PostgresSaver = Depends(get_checkpointer),
):
    """
    Retrieve all conversation records belonging to the authenticated user,
    with summary information from the checkpointer.
    """
    conversations = services.get_conversations_by_user(db, checkpointer, current_user.id)
    return ConversationsResponse(conversations=conversations)

@router.delete(
    "/conversations/{thread_id}", 
    status_code=204,
    summary="Delete a conversation and all its messages",
)
def delete_conversation(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    checkpointer: PostgresSaver = Depends(get_checkpointer),
):
    """
    Delete a conversation from both the database and checkpointer
    """
    # Verify the conversation belongs to the current user
    conv = services.repository.get_conversation_by_thread_id(db, thread_id, current_user.id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    services.delete_conversation(db, checkpointer, thread_id, current_user.id)
    return Response(status_code=204)
