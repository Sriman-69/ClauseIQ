from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatQuery, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat(query: ChatQuery):
    """
    Chat with the RAG system.
    """
    response = await chat_service.chat(
        query=query.query, 
        conversation_id=query.conversation_id
    )
    return response
