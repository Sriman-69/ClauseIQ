from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import documents, chat, summary, checklist, risks, export, comparison, metrics
from app.core.config import settings
from app.db.session import engine
from app.models.document import Base
from app.core.exceptions import QuotaExceededException

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.exception_handler(QuotaExceededException)
async def quota_exceeded_handler(request: Request, exc: QuotaExceededException):
    return JSONResponse(
        status_code=429,
        content={
            "status": "quota_exceeded",
            "message": exc.message,
            "retry_later": True
        }
    )

app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(summary.router, prefix="/api/v1", tags=["summary"])
app.include_router(checklist.router, prefix="/api/v1", tags=["checklist"])
app.include_router(risks.router, prefix="/api/v1", tags=["risks"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])
app.include_router(comparison.router, prefix="/api/v1", tags=["comparison"])
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["metrics"])

@app.get("/")
async def root():
    return {"message": "Welcome to ClauseIQ"}
