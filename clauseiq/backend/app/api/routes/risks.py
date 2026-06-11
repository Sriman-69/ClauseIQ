from fastapi import APIRouter, HTTPException
from app.services.risk_service import RiskService
from app.schemas.analysis import RiskResponse

router = APIRouter()
risk_service = RiskService()

@router.get("/documents/{document_id}/risks", response_model=RiskResponse)
async def analyze_risks(document_id: str):
    try:
        return await risk_service.analyze_risks(document_id)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
