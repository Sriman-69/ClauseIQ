from fastapi import APIRouter, HTTPException
from app.services.summary_service import SummaryService
from app.schemas.analysis import SummaryResponse

router = APIRouter()
summary_service = SummaryService()

@router.get("/documents/{document_id}/summary", response_model=SummaryResponse)
async def generate_summary(document_id: str):
    try:
        return await summary_service.generate_summary(document_id)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
