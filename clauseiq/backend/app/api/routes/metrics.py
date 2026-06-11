from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.metrics_repository import MetricsRepository

router = APIRouter()

@router.get("")
def get_metrics(db: Session = Depends(get_db)):
    metrics_repo = MetricsRepository(db)
    metrics_data = metrics_repo.get_all(user_id=None)
    
    stats = {
        "uploads": 0,
        "chat": 0,
        "gemini_call": 0,
        "cache_hit": 0,
        "cache_miss": 0
    }
    
    for m in metrics_data:
        if m.action in stats:
            stats[m.action] += m.count
            
    total_analyses = stats["cache_hit"] + stats["cache_miss"]
    savings_pct = (stats["cache_hit"] / total_analyses * 100) if total_analyses > 0 else 0
            
    return {
        "metrics": stats,
        "api_savings_percentage": round(savings_pct, 2)
    }
