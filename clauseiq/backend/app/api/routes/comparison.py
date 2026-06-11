import json
from fastapi import APIRouter, HTTPException
from app.schemas.comparison import ComparisonRequest, ComparisonDashboardResponse
from app.services.comparison_service import ComparisonService
from app.services.comparison_export_service import ComparisonExportService
from app.db.session import get_db
from app.models.document import AnalysisSnapshot, Document

router = APIRouter()
comparison_service = ComparisonService()
export_service = ComparisonExportService()

@router.post("/compare")
async def compare_documents(request: ComparisonRequest):
    try:
        db = next(get_db())
        cache_key = f"{request.doc_a_id}_{request.doc_b_id}"
        
        # Check cache
        cached = db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.document_id == cache_key,
            AnalysisSnapshot.analysis_type == 'comparison'
        ).first()
        
        if cached:
            return json.loads(cached.result_json)
        
        result = await comparison_service.compare_documents(request.doc_a_id, request.doc_b_id)
        
        # Calculate Risk Delta and Compliance Delta simply
        risk_increased = []
        risk_decreased = []
        high_compliance = []
        for m in result.get('modified', []):
            ri = m['analysis']['risk_impact'].lower()
            ci = m['analysis']['compliance_impact'].lower()
            if 'increase' in ri or 'high' in ri: risk_increased.append(m['old_clause']['title'])
            if 'decrease' in ri or 'low' in ri: risk_decreased.append(m['old_clause']['title'])
            if 'high' in ci: high_compliance.append(m['old_clause']['title'])
            
        final_response = {
            "comparison_id": cache_key,
            "comparison_result": result,
            "risk_delta": {
                "risk_increased": risk_increased,
                "risk_decreased": risk_decreased,
                "new_risks": [c['title'] for c in result.get('added', [])],
                "removed_risks": [c['title'] for c in result.get('removed', [])]
            },
            "compliance_impact": {
                "HIGH": high_compliance,
                "MEDIUM": [],
                "LOW": []
            }
        }
        
        import uuid
        cache_entry = AnalysisSnapshot(
            id=str(uuid.uuid4()),
            document_id=cache_key,
            analysis_type="comparison",
            result_json=json.dumps(final_response)
        )
        db.add(cache_entry)
        db.commit()
        
        return final_response
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/compare/{comparison_id}")
async def get_comparison(comparison_id: str):
    try:
        db = next(get_db())
        cached = db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.document_id == comparison_id,
            AnalysisSnapshot.analysis_type == 'comparison'
        ).first()
        if cached:
            return json.loads(cached.result_json)
        raise HTTPException(status_code=404, detail="Comparison not found")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/comparison")
async def export_comparison(request: ComparisonRequest):
    try:
        db = next(get_db())
        doc_a = db.query(Document).filter(Document.id == request.doc_a_id).first()
        doc_b = db.query(Document).filter(Document.id == request.doc_b_id).first()
        
        cache_key = f"{request.doc_a_id}_{request.doc_b_id}"
        cached = db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.document_id == cache_key,
            AnalysisSnapshot.analysis_type == 'comparison'
        ).first()
        
        if cached:
            result = json.loads(cached.result_json)
        else:
            result = await compare_documents(request)
            
        download = await export_service.export_comparison_report(doc_a.filename, doc_b.filename, result['comparison_result'])
        return download
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
