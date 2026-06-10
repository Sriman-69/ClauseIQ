from app.services.embedding_service import EmbeddingService
from app.schemas.search import SearchResultItem
from typing import List

class SearchService:
    def __init__(self):
        self.embedding_service = EmbeddingService()

    async def search(self, query: str, top_k: int = 5) -> List[SearchResultItem]:
        query_embedding = await self.embedding_service.embed_single(query)
        results = self.embedding_service.vector_store.search(query_embedding, top_k)
        
        print("Query:", query)
        print("Results:", results)
        
        search_results = []
        for result in results:
            metadata = result['metadata']
            search_results.append(
                SearchResultItem(
                    document_name=metadata.get('document_name', ''),
                    page_number=metadata.get('page', 0),
                    section=metadata.get('section'),
                    content=result['content'],
                    score=result['score']
                )
            )
        return search_results
