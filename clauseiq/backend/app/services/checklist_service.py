import json
from app.models.document import Document, Chunk, AnalysisSnapshot
from app.repositories.document_repository import DocumentRepository
from app.repositories.snapshot_repository import SnapshotRepository
from app.repositories.metrics_repository import MetricsRepository
from app.repositories.chunk_repository import ChunkRepository
from app.core.exceptions import QuotaExceededException
from app.services.ai_service import AIService

class ChecklistService:
    def __init__(self, db):
        self.db = db
        self.document_repo = DocumentRepository(db)
        self.snapshot_repo = SnapshotRepository(db)
        self.metrics_repo = MetricsRepository(db)
        self.chunk_repo = ChunkRepository(db)
        self.ai_service = AIService()

    def _log_metric(self, action: str):
        self.metrics_repo.increment(action)

    async def generate_checklist(self, document_id: str) -> list:
        document = self.document_repo.get_by_id(document_id, user_id=None)
        if not document:
            raise ValueError("Document not found")

        # 1. Check Snapshot/Cache
        snapshot = self.snapshot_repo.get_snapshot(document_id, "checklist", document.content_hash, user_id=None)

        if snapshot:
            self._log_metric("cache_hit")
            return json.loads(snapshot.result_json)

        self._log_metric("cache_miss")

        chunks = self.chunk_repo.get_chunks(document_id, user_id=None)
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
            document_id=document_id,
            document_hash=document.content_hash,
            analysis_type="checklist",
            result_json=json.dumps(result)
        )
        self.snapshot_repo.create_snapshot(new_snapshot, user_id=None)
            
        return result
