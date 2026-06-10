from app.services.search_service import SearchService
from app.schemas.chat import ChatResponse, Citation
import google.generativeai as genai
from app.core.config import settings

class ChatService:
    def __init__(self):
        self.search_service = SearchService()
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def chat(self, query: str, conversation_id: str = None) -> ChatResponse:
        # Retrieve context
        search_results = await self.search_service.search(query=query, top_k=3)

        context = ""
        citations = []
        for res in search_results:
            context += f"Source: {res.document_name}, Page: {res.page_number}\nContent: {res.content}\n\n"
            citations.append(Citation(
                document_name=res.document_name,
                page_number=res.page_number,
                section=res.section
            ))

        # Build prompt
        prompt = f"""
        You are a helpful legal research assistant. Answer the user's question based on the provided context.
        Your answer must be grounded in the provided sources.
        
        Context:
        {context}
        
        Question: {query}
        
        Answer:
        """

        # Generate response
        response = self.model.generate_content(prompt)

        return ChatResponse(response=response.text, citations=citations)
