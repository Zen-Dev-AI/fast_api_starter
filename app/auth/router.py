from fastapi import APIRouter, Depends, HTTPException
from app.auth.schemas import LoginRequest, RegisterRequest
from app.auth.utils import verify_password
from app.auth.jwt import create_access_token, get_current_user, EXPIRE_MIN
from app.auth.models import User
from sqlalchemy.orm import Session
from datetime import timedelta
from app.auth.repository import get_user_by_email, register_user
from app.globals.dependencies import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(email=data.email, password=data.password, db=db)
    if not user:
        raise HTTPException(status_code=500, detail="Something went wrong, please try again")
    token = create_access_token({"sub": user.email}, timedelta(minutes=EXPIRE_MIN))
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}

@router.post("/login")
def login(data: LoginRequest):
    user = get_user_by_email(data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token({"sub": user.email}, timedelta(minutes=EXPIRE_MIN))
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}

@router.get("/user")
def user(user: User = Depends(get_current_user)):
    return {"email": user.email, "user_id": user.id}
