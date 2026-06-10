import fitz  # PyMuPDF
from app.models.document import Chunk
from app.db.session import get_db
from app.services.embedding_service import EmbeddingService
import uuid

class ParserService:
    def __init__(self):
        self.db = next(get_db())
        self.embedding_service = EmbeddingService()

    async def parse_document(self, document):
        doc = fitz.open(document.storage_path)
        chunks = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            
            # Simple chunking by splitting text into paragraphs
            paragraphs = text.split('\n\n')
            for para in paragraphs:
                if para.strip():
                    chunk_id = str(uuid.uuid4())
                    db_chunk = Chunk(
                        id=chunk_id,
                        document_id=document.id,
                        page=page_num + 1,
                        content=para.strip()
                    )
                    self.db.add(db_chunk)
                    chunks.append(db_chunk)
        
        self.db.commit()

        # Embed chunks
        contents = [chunk.content for chunk in chunks]
        embeddings = await self.embedding_service.embed_batch(contents)

        # Store embeddings in FAISS
        self.embedding_service.vector_store.add_embeddings(embeddings, [{"document_id": str(chunk.document_id), "chunk_id": str(chunk.id), "page": chunk.page, "section": chunk.section, "document_name": document.filename} for chunk in chunks])
