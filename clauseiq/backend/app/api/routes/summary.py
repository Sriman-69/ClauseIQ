from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.summary_service import SummaryService
from app.schemas.analysis import SummaryResponse

router = APIRouter()

@router.get("/documents/{document_id}/summary", response_model=SummaryResponse)
async def generate_summary(document_id: str, db: Session = Depends(get_db)):
    try:
        summary_service = SummaryService(db)
        return await summary_service.generate_summary(document_id)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
