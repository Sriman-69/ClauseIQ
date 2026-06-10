import json
import uuid
import re
from app.db.session import get_db
from app.models.document import Document, Chunk, Clause
from app.core.exceptions import QuotaExceededException
from app.services.ai_service import AIService

class ClauseExtractionService:
    def __init__(self):
        self.db = next(get_db())
        self.ai_service = AIService()

    async def extract_clauses(self, document_id: str):
        document = self.db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise ValueError("Document not found")

        chunks = self.db.query(Chunk).filter(Chunk.document_id == document_id).order_by(Chunk.page).all()
        content = "\n\n".join([f"Page {chunk.page}: {chunk.content}" for chunk in chunks])

        prompt = f"""
        You are a legal document parsing AI.
        Extract all major clauses from the following document.
        Output a valid JSON array of objects matching this schema:
        [{{
            "clause_id": "str (e.g. 1.1 or 3A)",
            "title": "str",
            "content": "str"
        }}]
        
        If clause numbering is unavailable, invent logical sequential IDs (e.g. C1, C2).
        Extract the full content of the clause, summarizing only if the clause is extremely long.
        
        Document Content:
        {content}
        """
        
        clauses_data = []
        try:
            clauses_data = await self.ai_service.generate_json(prompt)
        except QuotaExceededException:
            print("Clause Extraction: Quota exceeded, falling back to Regex heuristic.")
            # HYBRID FALLBACK: Regex grouping
            sections = re.split(r'\n(?=\d+\.\d*|\bArticle\b|\bSection\b)', content, flags=re.IGNORECASE)
            for i, sec in enumerate(sections):
                if not sec.strip(): continue
                lines = sec.strip().split('\n')
                title = lines[0][:100]
                clauses_data.append({
                    "clause_id": f"R-{i+1}",
                    "title": title,
                    "content": sec.strip()
                })

        for c_data in clauses_data:
            clause = Clause(
                id=str(uuid.uuid4()),
                document_id=document_id,
                clause_identifier=c_data.get('clause_id', 'Unknown'),
                title=c_data.get('title', 'Untitled'),
                content=c_data.get('content', '')
            )
            self.db.add(clause)
        self.db.commit()


