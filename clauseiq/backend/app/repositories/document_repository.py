from app.repositories.base_repository import BaseRepository
from app.repositories.interfaces import IDocumentRepository
from app.models.document import Document, Chunk
from typing import List

class DocumentRepository(BaseRepository, IDocumentRepository):
    def get_by_id(self, document_id: str, user_id: str = None) -> Document:
        # Ignore user_id for now, preparing for ownership-based checks in the future
        return self.db.query(Document).filter(Document.id == document_id).first()

    def get_by_hash(self, content_hash: str, user_id: str = None) -> Document:
        return self.db.query(Document).filter(Document.content_hash == content_hash).first()

    def create(self, db_document: Document, user_id: str = None) -> Document:
        self.db.add(db_document)
        self.db.commit()
        self.db.refresh(db_document)
        return db_document

    def update(self, db_document: Document, user_id: str = None) -> Document:
        self.db.commit()
        self.db.refresh(db_document)
        return db_document

    def delete(self, document_id: str, user_id: str = None) -> bool:
        doc = self.get_by_id(document_id, user_id=user_id)
        if doc:
            self.db.delete(doc)
            self.db.commit()
            return True
        return False

    def get_all(self, user_id: str = None) -> List[Document]:
        return self.db.query(Document).all()

    def get_versions(self, document_id: str, user_id: str = None) -> List[Document]:
        return self.db.query(Document).filter(
            (Document.id == document_id) | (Document.parent_document_id == document_id)
        ).all()
