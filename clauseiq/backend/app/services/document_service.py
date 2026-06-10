import hashlib
import uuid
from fastapi import UploadFile
from typing import List

from app.db.session import get_db
from app.models.document import Document
from app.services.parser_service import ParserService

class DocumentService:
    def __init__(self):
        self.db = next(get_db())
        self.parser_service = ParserService()

    async def create_document(self, file: UploadFile) -> Document:
        content = await file.read()
        content_hash = hashlib.md5(content).hexdigest()

        db_document = self.db.query(Document).filter(Document.content_hash == content_hash).first()
        if db_document:
            return db_document

        document_id = str(uuid.uuid4())
        
        import os
        
        # Store the file
        UPLOAD_DIR = "uploads"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        storage_path = os.path.join(UPLOAD_DIR, f"{document_id}_{file.filename}")
        
        with open(storage_path, "wb") as f:
            f.write(content)

        db_document = Document(
            id=document_id,
            filename=file.filename,
            content_hash=content_hash,
            storage_path=storage_path
        )
        self.db.add(db_document)
        self.db.commit()
        self.db.refresh(db_document)

        # Parse and chunk the document
        await self.parser_service.parse_document(db_document)

        return db_document

    async def get_document(self, document_id: str) -> Document:
        return self.db.query(Document).filter(Document.id == document_id).first()

    async def get_all_documents(self) -> List[Document]:
        return self.db.query(Document).all()
