"""
RAG Module
Retrieval-Augmented Generation functionality for the FastAPI application
"""

from .router import router
from .dependencies import get_vector_store, get_embedding_model, get_pinecone_client
from .services import process_and_index
from .schemas import  UploadResponse, ErrorResponse
from .utils import validate_file_type, clean_text, estimate_tokens

__all__ = [
    "router",
    "get_vector_store",
    "get_embedding_model", 
    "get_pinecone_client",
    "process_and_index", 
    "UploadResponse", 
    "ErrorResponse",
    "validate_file_type",
    "clean_text",
    "estimate_tokens",
]