from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.globals.settings import settings

DATABASE_URL = settings.DB_URL

engine = create_engine(
    DATABASE_URL, echo=True
)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

class Base(DeclarativeBase):
    pass
