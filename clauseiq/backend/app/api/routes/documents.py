from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

from app.schemas.document import Document, DocumentCreate
from app.services.document_service import DocumentService

router = APIRouter()
document_service = DocumentService()

@router.post("/documents/upload", response_model=Document)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document for processing.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    document = await document_service.create_document(file=file)
    return document

@router.get("/documents/{document_id}", response_model=Document)
async def get_document(document_id: str):
    """
    Get document details.
    """
    document = await document_service.get_document(document_id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.get("/documents/", response_model=List[Document])
async def get_documents():
    """
    Get all documents.
    """
    documents = await document_service.get_all_documents()
    return documents
