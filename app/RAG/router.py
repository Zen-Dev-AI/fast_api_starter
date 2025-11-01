"""
RAG Router
FastAPI routes for Retrieval-Augmented Generation functionality with dependency injection
"""

from typing import List, TypedDict
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends
from langchain_pinecone import PineconeVectorStore
from pydantic import BaseModel

from app.RAG.schemas import UploadResponse, ErrorResponse
from app.RAG.services import process_and_index
from app.RAG.dependencies import get_vector_store
from app.RAG.utils import validate_file_type

from langchain_core.documents import Document

from langgraph.graph import START, StateGraph

from langchain.chat_models import init_chat_model



llm = init_chat_model(
        model="gpt-3.5-turbo",
        model_provider="openai",
        temperature=0.7,
)



class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

class ChatRequest(BaseModel):
    prompt: str



router = APIRouter(prefix="/rag", tags=["ai-chat", "langgraph"])

@router.post("/model-res-test", response_model=dict)
def model_response_test(
    body: ChatRequest,
    vector_store: PineconeVectorStore = Depends(get_vector_store),
):


    # def analyze_query(state: State):
    #     structured_llm = llm.with_structured_output(Search)
    #     query = structured_llm.invoke(state["question"])
    #     return {"query": query}


    def retrieve(state: State):
        query = body.prompt
        retrieved_docs = vector_store.similarity_search(
            query=query,
            k=3,  # Number of documents to retrieve
        )
        return {"context": retrieved_docs}


    graph_builder = StateGraph(State).add_sequence([ retrieve])
    graph_builder.add_edge(START, "retrieve")
    graph = graph_builder.compile()

    # Initialize state with the user's question
    initial_state: State = {
        "question": body.prompt,
        "context": [],
        "answer": ""
    }
    
    try:
        # Run the RAG graph
        result = graph.invoke(initial_state)
        
        # Return the response
        return {
            "status": "success",
            "question": body.prompt,
            "answer": result["answer"],
            "context_count": len(result["context"]),
            "retrieved_docs": [
                {
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "metadata": doc.metadata
                } 
                for doc in result["context"]
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "question": body.prompt,
            "error": str(e),
            "answer": None
        }

@router.post("/upload-vector-test", response_model=str)
async def upload_dummy_documents(
    vector_store: PineconeVectorStore = Depends(get_vector_store),
):
    """Upload dummy documents to the vector store for testing different vector store configurations."""
    dummy_docs = [
        Document(
            page_content="This is the first dummy chunk of text. It's short and sweet.",
            metadata={"source": "dummy1.txt", "chunk": 1},
        ),
        Document(
            page_content="Here's the second chunk, also made up for testing purposes.",
            metadata={"source": "dummy1.txt", "chunk": 2},
        ),
        # Test RAG by asking a question about Elly. 
        Document(
            page_content="Elly is a product manager and works at microsoft.",
            metadata={"source": "dummy1.txt", "chunk": 3},
        ),
    ]

    try:
        vector_store.add_documents(dummy_docs)
        return f"Added {len(dummy_docs)} dummy documents"
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/upload-file", response_model=UploadResponse | ErrorResponse)
async def upload_txt_file(
    file: UploadFile = File(...),
    bg: BackgroundTasks = BackgroundTasks(),
    vector_store: PineconeVectorStore = Depends(get_vector_store)
):
    """
    Upload a TXT file for processing and indexing.
    File processing happens in the background.
    """
    # Validate file has a name and is a .txt file
    if not file.filename:
        return ErrorResponse(error="File must have a filename")
    
    if not validate_file_type(file.filename, ['.txt']):
        return ErrorResponse(error="Only .txt files are supported")
    
    try:
        contents = await file.read()
        # Schedule heavy work in the background with injected dependency
        bg.add_task(process_and_index, contents, file.filename, vector_store)
        # Return immediately
        return UploadResponse(
            status="processing", 
            filename=file.filename,
            message="File uploaded successfully and is being processed"
        )
    except Exception as e:
        return ErrorResponse(error=f"Failed to process file: {str(e)}")





