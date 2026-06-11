from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.chat import ChatQuery, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(query: ChatQuery, db: Session = Depends(get_db)):
    """
    Chat with the RAG system.
    """
    try:
        chat_service = ChatService(db)
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
