from langgraph.checkpoint.postgres import PostgresSaver
from fastapi import Request

def get_checkpointer(request: Request) -> PostgresSaver:
    return request.app.state.checkpointer