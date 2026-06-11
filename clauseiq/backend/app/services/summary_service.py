import json
from app.models.document import Document, Chunk, AnalysisSnapshot
from app.repositories.document_repository import DocumentRepository
from app.repositories.snapshot_repository import SnapshotRepository
from app.repositories.metrics_repository import MetricsRepository
from app.repositories.chunk_repository import ChunkRepository
from app.core.exceptions import QuotaExceededException
from app.services.ai_service import AIService

class SummaryService:
    def __init__(self, db):
        self.db = db
        self.document_repo = DocumentRepository(db)
        self.snapshot_repo = SnapshotRepository(db)
        self.metrics_repo = MetricsRepository(db)
        self.chunk_repo = ChunkRepository(db)
        self.ai_service = AIService()

    def _log_metric(self, action: str):
        self.metrics_repo.increment(action)

    async def generate_summary(self, document_id: str) -> dict:
        document = self.document_repo.get_by_id(document_id, user_id=None)
        if not document:
            raise ValueError("Document not found")

        # 1. Check Snapshot/Cache
        snapshot = self.snapshot_repo.get_snapshot(document_id, "summary", document.content_hash, user_id=None)

        if snapshot:
            self._log_metric("cache_hit")
            return json.loads(snapshot.result_json)

        self._log_metric("cache_miss")

        chunks = self.chunk_repo.get_chunks(document_id, user_id=None)
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
            document_id=document_id,
            document_hash=document.content_hash,
            analysis_type="summary",
            result_json=json.dumps(result)
        )
        self.snapshot_repo.create_snapshot(new_snapshot, user_id=None)

        return result
