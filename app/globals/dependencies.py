from app.globals.db import SessionLocal
from langgraph.checkpoint.postgres import PostgresSaver
from fastapi import Request


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_checkpointer(request: Request) -> PostgresSaver:
    return request.app.state.checkpointer