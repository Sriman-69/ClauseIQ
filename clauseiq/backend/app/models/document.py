from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String, index=True)
    content_hash = Column(String, unique=True, index=True)
    storage_path = Column(String)

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, index=True)
    page = Column(Integer)
    section = Column(String, nullable=True)
    content = Column(Text)
