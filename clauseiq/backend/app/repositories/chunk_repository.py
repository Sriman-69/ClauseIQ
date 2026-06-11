from app.repositories.base_repository import BaseRepository
from app.repositories.interfaces import IChunkRepository
from app.models.document import Chunk
from typing import List

class ChunkRepository(BaseRepository, IChunkRepository):
    def add_chunk(self, chunk: Chunk, user_id: str) -> Chunk:
        chunk.user_id = user_id
        self.db.add(chunk)
        self.db.commit()
        self.db.refresh(chunk)
        return chunk

    def get_chunks(self, document_id: str, user_id: str) -> List[Chunk]:
        return self.db.query(Chunk).filter(
            Chunk.document_id == document_id,
            Chunk.user_id == user_id
        ).order_by(Chunk.page).all()
