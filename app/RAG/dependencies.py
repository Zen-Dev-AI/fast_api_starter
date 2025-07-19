"""
RAG Dependencies and Configuration
Handles Pinecone vector store setup and embedding configuration with dependency injection
"""

from functools import lru_cache
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document
from app.globals.config import settings


@lru_cache()
def get_pinecone_client() -> Pinecone:
    """Initialize and return Pinecone client (cached)"""
    return Pinecone(api_key=settings.PINECONE_API_KEY)


@lru_cache()
def get_embedding_model() -> OpenAIEmbeddings:
    """Initialize and return OpenAI embedding model (cached)"""
    return OpenAIEmbeddings(model="text-embedding-3-small", dimensions=1536)


def get_vector_store() -> PineconeVectorStore:
    """
    Dependency function to get vector store instance.
    This will be injected into FastAPI endpoints.
    """
    pc = get_pinecone_client()
    pinecone_index = pc.Index(settings.PINECONE_INDEX_NAME)
    embedding = get_embedding_model()
    
    return PineconeVectorStore(index=pinecone_index, embedding=embedding)

