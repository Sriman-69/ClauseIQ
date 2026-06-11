from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from app.db.session import get_db
from app.services.export_service import ExportService
from app.schemas.analysis import ExportResponse

router = APIRouter()

@router.post("/documents/{document_id}/export", response_model=ExportResponse)
async def generate_export(document_id: str, format: str = "pdf", db: Session = Depends(get_db)):
    try:
        export_service = ExportService(db)
        return await export_service.export_report(document_id, export_format=format)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/download/{filename}")
async def download_export(filename: str):
    file_path = os.path.join("exports", filename)
    if os.path.exists(file_path):
        if filename.endswith(".json"):
            media_type = "application/json"
        elif filename.endswith(".docx"):
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            media_type = "application/pdf"
        return FileResponse(path=file_path, filename=filename, media_type=media_type)
    raise HTTPException(status_code=404, detail="File not found")
