import json
import uuid
import collections
from app.core.config import settings
from app.db.session import get_db
from app.models.document import Document, Chunk, AnalysisSnapshot, Metrics
from app.schemas.analysis import SummaryResponse
from app.core.exceptions import QuotaExceededException
from app.services.ai_service import AIService

class SummaryService:
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

    async def generate_summary(self, document_id: str) -> dict:
        document = self.db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")

        # 1. Check Snapshot/Cache
        snapshot = self.db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.document_id == document_id,
            AnalysisSnapshot.document_hash == document.content_hash,
            AnalysisSnapshot.analysis_type == 'summary'
        ).first()

        if snapshot:
            self._log_metric("cache_hit")
            return json.loads(snapshot.result_json)

        self._log_metric("cache_miss")

        chunks = self.db.query(Chunk).filter(Chunk.document_id == document_id).order_by(Chunk.page).all()
        content = "\n\n".join([f"Page {chunk.page}: {chunk.content}" for chunk in chunks])

        prompt = f"""
        You are a legal research assistant. Analyze the following document and provide a comprehensive structured summary.
        Output valid JSON matching this schema:
        {{
            "executive_summary": "str",
            "purpose": "str",
            "key_obligations": ["str"],
            "important_clauses": ["str"],
            "penalties": ["str"],
            "exceptions": ["str"],
            "takeaways": ["str"]
        }}
        
        Document Content:
        {content}
        """

        try:
            result = await self.ai_service.generate_json(prompt)
        except QuotaExceededException:
            # OFFLINE FALLBACK: Extractive Summary
            print("Summary: Falling back to extractive heuristic.")
            # Simplistic extraction: Just grab the first few chunks
            extractive_text = " ".join([c.content for c in chunks[:2]])
            result = {
                "executive_summary": extractive_text[:500] + "...",
                "purpose": "Extracted automatically (Offline Mode)",
                "key_obligations": ["Offline extraction unavailable"],
                "important_clauses": ["Offline extraction unavailable"],
                "penalties": ["Offline extraction unavailable"],
                "exceptions": ["Offline extraction unavailable"],
                "takeaways": ["AI quota exhausted. Displaying partial fallback data."]
            }

        # 3. Save Snapshot
        new_snapshot = AnalysisSnapshot(
            id=str(uuid.uuid4()),
            document_id=document_id,
            document_hash=document.content_hash,
            analysis_type="summary",
            result_json=json.dumps(result)
        )
        self.db.add(new_snapshot)
        self.db.commit()

        return result
