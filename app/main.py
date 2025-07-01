from dotenv import load_dotenv
from fastapi import FastAPI
from app.globals.db import Base, engine
from app.globals.settings import settings
from fastapi.middleware.cors import CORSMiddleware

#router
from app.todo.router import router as todo_router
from app.auth.router import router as auth_router
from app.ai_chat_langchain_basic.router import router as chat_router_lang


load_dotenv()

app = FastAPI()

origins = [
    settings.FRONT_END_ORIGIN
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def root():
    return {"message": "Hello!"}

#create db tables 
Base.metadata.create_all(bind=engine)

#routers
app.include_router(todo_router)
app.include_router(auth_router)
app.include_router(chat_router_lang)

print("Server Started")
