# deps.py or app/dependencies/checkpointer.py
from langgraph.checkpoint.postgres import PostgresSaver
from app.globals.settings import settings

# checkpointer = PostgresSaver.from_conn_string(DB_URI)

# def get_checkpointer():
#     return checkpointer