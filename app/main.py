
from dotenv import load_dotenv

from fastapi import FastAPI
from app.globals.db import Base, engine
from app.todo.router import router as todo_router
from sqlalchemy import inspect


load_dotenv()

app = FastAPI()

@app.get("/ping")
async def root():
    return {"message": "Hello Pong!"}

Base.metadata.create_all(bind=engine)
print(inspect(engine).get_table_names())
app.include_router(todo_router)


