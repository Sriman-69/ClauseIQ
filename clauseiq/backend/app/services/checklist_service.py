import json
import uuid
import re
from app.core.config import settings
from app.db.session import get_db
from app.models.document import Document, Chunk, AnalysisSnapshot, Metrics
from app.schemas.analysis import ChecklistResponse
from app.core.exceptions import QuotaExceededException
from app.services.ai_service import AIService

class ChecklistService:
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

    async def generate_checklist(self, document_id: str) -> list:
        document = self.db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")

        # 1. Check Snapshot/Cache
        snapshot = self.db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.document_id == document_id,
            AnalysisSnapshot.document_hash == document.content_hash,
            AnalysisSnapshot.analysis_type == 'checklist'
        ).first()

        if snapshot:
            self._log_metric("cache_hit")
            return json.loads(snapshot.result_json)

        self._log_metric("cache_miss")

        chunks = self.db.query(Chunk).filter(Chunk.document_id == document_id).order_by(Chunk.page).all()
        content = "\n\n".join([f"Page {chunk.page}: {chunk.content}" for chunk in chunks])

        prompt = f"""
        You are a compliance officer. Evaluate this document against standard legal/business requirements.
        Output a JSON array of objects, where each object matches:
        {{
            "title": "str",
            "status": "present|missing|unclear",
            "explanation": "str",
            "citation": "str (quote the exact text or say 'None')"
        }}
        
        Document Content:
        {content}
        """

        try:
            result = await self.ai_service.generate_json(prompt)
        except QuotaExceededException:
            print("Checklist: Falling back to heuristic rules.")
            # OFFLINE FALLBACK: Heuristic Checks
            text_lower = content.lower()
            checks = [
                ("Termination Clause", ["terminate", "termination"]),
                ("Confidentiality", ["confidential", "nda", "non-disclosure"]),
                ("Indemnification", ["indemnify", "indemnification", "hold harmless"]),
                ("Governing Law", ["governing law", "jurisdiction", "courts of"]),
                ("Force Majeure", ["force majeure", "act of god", "unforeseeable"])
            ]
            
            result = []
            for title, keywords in checks:
                present = any(kw in text_lower for kw in keywords)
                result.append({
                    "title": title,
                    "status": "present" if present else "missing",
                    "explanation": "Evaluated via offline heuristics." if present else "Keyword not found.",
                    "citation": "Offline Mode Fallback"
                })

        # 3. Save Snapshot
        new_snapshot = AnalysisSnapshot(
            id=str(uuid.uuid4()),
            document_id=document_id,
            document_hash=document.content_hash,
            analysis_type="checklist",
            result_json=json.dumps(result)
        )
        self.db.add(new_snapshot)
        self.db.commit()
            
        return result
