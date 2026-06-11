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
    try:
        response = await chat_service.chat(
            query=query.query, 
            document_id=query.document_id,
            conversation_id=query.conversation_id
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
