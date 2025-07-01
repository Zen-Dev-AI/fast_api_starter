from fastapi import APIRouter
from fastapi import  Request
from fastapi.responses import StreamingResponse
from openai import  OpenAIError
from .schemas import ChatRequest
from .dependencies import client

router = APIRouter(prefix="/todos", tags=["todos"])

@router.post("/chat-stream")
async def chat_stream(request: Request, body: ChatRequest):
    async def event_generator():
        try:
            stream = client.chat.completions.create(
                model="gpt-3.5-turbo", 
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

