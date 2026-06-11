from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.risk_service import RiskService
from app.schemas.analysis import RiskResponse

router = APIRouter()

@router.get("/documents/{document_id}/risks", response_model=RiskResponse)
async def analyze_risks(document_id: str, db: Session = Depends(get_db)):
    try:
        risk_service = RiskService(db)
        return await risk_service.analyze_risks(document_id)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
