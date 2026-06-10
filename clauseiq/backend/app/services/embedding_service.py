import google.generativeai as genai
from app.core.config import settings
from app.vector_store.faiss import FAISSVectorStore
from typing import List

class EmbeddingService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = "models/embedding-001"
        self.vector_store = FAISSVectorStore()

    async def embed_single(self, text: str) -> List[float]:
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type="RETRIEVAL_DOCUMENT"
        )
        return result['embedding']

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        # Gemini API currently doesn't have a native batch embedding endpoint
        # so we do it sequentially.
        # In a production system, you might use asyncio.gather for concurrency
        embeddings = []
        for text in texts:
            embeddings.append(await self.embed_single(text))
        return embeddings
