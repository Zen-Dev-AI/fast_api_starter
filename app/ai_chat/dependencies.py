from app.globals.settings import settings
from openai import OpenAI


client = OpenAI(api_key=settings.OPENAI_API_KEY)