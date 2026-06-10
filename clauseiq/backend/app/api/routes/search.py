from fastapi import APIRouter, HTTPException
from app.schemas.search import SearchQuery, SearchResult
from app.services.search_service import SearchService

router = APIRouter()
search_service = SearchService()

@router.post("/search", response_model=SearchResult)
async def search(query: SearchQuery):
    """
    Perform a semantic search.
    """
    results = await search_service.search(query=query.query, top_k=query.top_k)
    if not results:
        return {"results": []}
    return {"results": results}
