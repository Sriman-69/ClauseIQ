from fastapi import APIRouter
from app.db.session import get_db
from app.models.document import Metrics

router = APIRouter()

@router.get("/")
def get_metrics():
    db = next(get_db())
    metrics_data = db.query(Metrics).all()
    
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
