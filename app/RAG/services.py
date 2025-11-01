"""
RAG Services
Contains text processing and document indexing logic with dependency injection
"""

from langchain.schema import Document
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.RAG.utils import clean_text


def process_and_index(contents: bytes, filename: str, vector_store: PineconeVectorStore) -> str:
    """
    Process text file contents and index them in the vector store.
    
    Args:
        contents: File contents as bytes
        filename: Name of the source file
        vector_store: Vector store instance (injected dependency)
        
    Returns:
        Status message with number of chunks processed
    """
    # Decode the text content from bytes
    try:
        text_content = contents.decode('utf-8')
    except UnicodeDecodeError:
        # Try other encodings if UTF-8 fails
        try:
            text_content = contents.decode('latin-1')
        except UnicodeDecodeError:
            text_content = contents.decode('utf-8', errors='ignore')


    # Clean the text first
    text = clean_text(text_content)
    
    # Initialize the text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )
    
    # Split the text into chunks and create documents
    documents = text_splitter.create_documents([text])

    # Embed and upsert to vector store
    vector_store.add_documents(documents)
    
    return f"Uploaded: {len(documents)} chunks from {filename}"

