from fastapi import APIRouter, HTTPException
from typing import List
from app.services.checklist_service import ChecklistService
from app.schemas.analysis import ChecklistItem

router = APIRouter()
checklist_service = ChecklistService()

@router.post("/documents/{document_id}/checklist", response_model=List[ChecklistItem])
async def generate_checklist(document_id: str):
    try:
        return await checklist_service.generate_checklist(document_id)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
