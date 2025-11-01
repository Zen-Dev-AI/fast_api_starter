"""
RAG Schemas
Pydantic models for request/response validation
"""

from pydantic import BaseModel

class UploadResponse(BaseModel):
    """Response model for file upload endpoints"""
    status: str
    filename: str
    message: str = ""


class ErrorResponse(BaseModel):
    """Response model for error cases"""
    error: str
