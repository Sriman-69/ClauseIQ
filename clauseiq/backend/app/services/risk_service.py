import json
import uuid
import re
from app.core.config import settings
from app.db.session import get_db
from app.models.document import Document, Chunk, AnalysisSnapshot, Metrics
from app.schemas.analysis import RiskResponse
from app.core.exceptions import QuotaExceededException
from app.services.ai_service import AIService

class RiskService:
    def __init__(self):
        self.db = next(get_db())
        self.ai_service = AIService()

    def _log_metric(self, action: str):
        metric = self.db.query(Metrics).filter(Metrics.action == action).first()
        if metric:
            metric.count += 1
        else:
            self.db.add(Metrics(action=action, count=1))
        self.db.commit()

    async def analyze_risks(self, document_id: str) -> dict:
        document = self.db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")

        # 1. Check Snapshot/Cache
        snapshot = self.db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.document_id == document_id,
            AnalysisSnapshot.document_hash == document.content_hash,
            AnalysisSnapshot.analysis_type == 'risks'
        ).first()

        if snapshot:
            self._log_metric("cache_hit")
            return json.loads(snapshot.result_json)

        self._log_metric("cache_miss")

        chunks = self.db.query(Chunk).filter(Chunk.document_id == document_id).order_by(Chunk.page).all()
        content = "\n\n".join([f"Page {chunk.page}: {chunk.content}" for chunk in chunks])

        prompt = f"""
        You are a risk management AI. Analyze the document and identify high, medium, and low risks.
        Output a JSON object matching this schema:
        {{
            "high_risks": [{{"risk": "str", "severity": "high", "reason": "str", "citation": "str"}}],
            "medium_risks": [{{"risk": "str", "severity": "medium", "reason": "str", "citation": "str"}}],
            "low_risks": [{{"risk": "str", "severity": "low", "reason": "str", "citation": "str"}}],
            "assumptions": ["str"]
        }}
        
        Document Content:
        {content}
        """

        try:
            result = await self.ai_service.generate_json(prompt)
        except QuotaExceededException:
            print("Risk Analysis: Falling back to heuristic rules.")
            # OFFLINE FALLBACK: Heuristic Checks
            text_lower = content.lower()
            medium_risks = []
            
            if "liability" in text_lower:
                medium_risks.append({"risk": "Liability Clause Present", "severity": "medium", "reason": "Detected via heuristic offline mode.", "citation": "Various"})
            if "punitive damages" in text_lower:
                medium_risks.append({"risk": "Punitive Damages Mentioned", "severity": "medium", "reason": "Detected via heuristic offline mode.", "citation": "Various"})
                
            result = {
                "high_risks": [],
                "medium_risks": medium_risks,
                "low_risks": [],
                "assumptions": ["AI quota exhausted. Used offline risk heuristics."]
            }

        # 3. Save Snapshot
        new_snapshot = AnalysisSnapshot(
            id=str(uuid.uuid4()),
            document_id=document_id,
            document_hash=document.content_hash,
            analysis_type="risks",
            result_json=json.dumps(result)
        )
        self.db.add(new_snapshot)
        self.db.commit()
            
        return result
