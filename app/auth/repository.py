from sqlalchemy.orm import Session
from .models import User
from app.auth.utils import  hash_password
from fastapi import HTTPException
from .models import User
from app.globals.db import SessionLocal

def get_user_by_email(email: str) -> User | None:
    with SessionLocal() as db:
        return db.query(User).filter(User.email == email).first()


def register_user(email: str, password: str, db: Session):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=email, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user