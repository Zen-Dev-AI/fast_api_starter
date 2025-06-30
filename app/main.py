from dotenv import load_dotenv
from fastapi import FastAPI
from app.globals.db import Base, engine
from app.todo.router import router as todo_router
from app.globals.settings import settings
from app.auth.router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.responses import StreamingResponse

from pydantic import BaseModel

from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

origins = [
    settings.FRONT_END_ORIGIN]


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:5173"],            
    allow_credentials=True,
    allow_methods=["*"],             
    allow_headers=["*"],              
)

app = FastAPI()

class ChatRequest(BaseModel):
    prompt: str

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI, OpenAIError
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONT_END_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat-stream")
async def chat_stream(request: Request, body: ChatRequest):
    async def event_generator():
        try:
            stream = client.chat.completions.create(
                model="gpt-4",  # or gpt-4.1
                messages=[{"role": "user", "content": body.prompt}],
                stream=True,
            )

            for chunk in stream:
                if await request.is_disconnected():
                    break
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    yield f"data: {delta.content}\n\n"

            yield "data: [DONE]\n\n"

        except OpenAIError as oe:
            yield f"data: [ERROR] OpenAI error: {str(oe)}\n\n"
        except Exception as e:
            yield f"data: [ERROR] Server error: {str(e)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/ping")
async def root():
    return {"message": "Hello Pong!"}

#create db tables 
Base.metadata.create_all(bind=engine)

#routers
app.include_router(todo_router)
app.include_router(auth_router)

print("Server Started")
