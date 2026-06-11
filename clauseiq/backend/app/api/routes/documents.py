from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

from app.schemas.document import Document, DocumentCreate, ClauseResponse
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
    
    try:
        document = await document_service.create_document(file=file)
        return document
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents/{document_id}/version", response_model=Document)
async def upload_new_version(document_id: str, file: UploadFile = File(...)):
    """
    Upload a new version of an existing document.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        document = await document_service.create_document(file=file, parent_document_id=document_id)
        return document
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

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

@router.get("/documents/{document_id}/clauses", response_model=List[ClauseResponse])
async def get_document_clauses(document_id: str):
    """
    Get all extracted clauses for a document.
    """
    clauses = await document_service.get_clauses(document_id=document_id)
    return clauses
