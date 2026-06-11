from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.services.checklist_service import ChecklistService
from app.schemas.analysis import ChecklistItem

router = APIRouter()

@router.get("/documents/{document_id}/checklist", response_model=List[ChecklistItem])
async def generate_checklist(document_id: str, db: Session = Depends(get_db)):
    try:
        checklist_service = ChecklistService(db)
        return await checklist_service.generate_checklist(document_id)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
