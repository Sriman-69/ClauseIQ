import fitz  # PyMuPDF
from app.models.document import Chunk
from app.repositories.chunk_repository import ChunkRepository
from app.storage.local import LocalStorageProvider
from app.services.embedding_service import EmbeddingService

class ParserService:
    def __init__(self, db, storage_provider=None):
        self.db = db
        self.chunk_repo = ChunkRepository(db)
        self.storage_provider = storage_provider or LocalStorageProvider()
        self.embedding_service = EmbeddingService()

    async def parse_document(self, document):
        local_path = self.storage_provider.get_file_path(document.storage_path)
        doc = fitz.open(local_path)
        chunks = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            
            # Simple chunking by splitting text into paragraphs
            paragraphs = text.split('\n\n')
            for para in paragraphs:
                if para.strip():
                    db_chunk = Chunk(
                        document_id=document.id,
                        page=page_num + 1,
                        content=para.strip()
                    )
                    self.chunk_repo.add_chunk(db_chunk)
                    chunks.append(db_chunk)
        
        # Embed chunks
        contents = [chunk.content for chunk in chunks]
        print("Chunks created:", len(contents))
        embeddings = await self.embedding_service.embed_batch(contents)
        print("Embeddings created:", len(embeddings))

        # Store embeddings in FAISS
        print("Saving to FAISS...")
        self.embedding_service.vector_store.add_embeddings(embeddings, [{
            "document_id": str(chunk.document_id), 
            "user_id": None,
            "page": chunk.page, 
            "section": chunk.section, 
            "document_name": document.filename,
            "content": chunk.content
        } for chunk in chunks])

        # Extract structured clauses for Phase 4 version comparison
        try:
            from app.services.clause_extraction_service import ClauseExtractionService
            clause_service = ClauseExtractionService(self.db)
            await clause_service.extract_clauses(document.id)
            print("Clauses extracted and saved.")
        except Exception as e:
            print(f"Clause extraction failed: {e}")
