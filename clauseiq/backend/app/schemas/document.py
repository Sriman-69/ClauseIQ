from pydantic import BaseModel
from typing import Optional, List

class DocumentBase(BaseModel):
    filename: str
    content_hash: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: str
    
    class Config:
        orm_mode = True

class Chunk(BaseModel):
    id: str
    document_id: str
    page: int
    section: Optional[str]
    content: str
    
    class Config:
        orm_mode = True
