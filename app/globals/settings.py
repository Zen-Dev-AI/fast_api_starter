from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    app_name: str = "FastAPI App"
    SECRET_KEY: str = ""
    FRONT_END_ORIGIN: str = ""
    DB_URL: str = ''
    OPENAI_API_KEY: str = ''

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
