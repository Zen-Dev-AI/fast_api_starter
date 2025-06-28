from dotenv import load_dotenv
from fastapi import FastAPI
from app.globals.db import Base, engine
from app.todo.router import router as todo_router
from app.globals.settings import settings
from app.auth.router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware


origins = [
    settings.FRONT_END_ORIGIN
]


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            
    allow_credentials=True,
    allow_methods=["*"],             
    allow_headers=["*"],              
)

@app.get("/ping")
async def root():
    return {"message": "Hello Pong!"}

#create db tables 
Base.metadata.create_all(bind=engine)

#routers
app.include_router(todo_router)
app.include_router(auth_router)

print("Server Started")
