from app.repositories.base_repository import BaseRepository
from app.repositories.interfaces import IActivityLogRepository
from app.models.activity_log import ActivityLog
from typing import List, Optional

class ActivityLogRepository(BaseRepository, IActivityLogRepository):
    def log_activity(self, user_id: str, action: str, document_id: Optional[str] = None) -> ActivityLog:
        log_entry = ActivityLog(
            user_id=user_id,
            action=action,
            document_id=document_id
        )
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry

    def get_user_logs(self, user_id: str) -> List[ActivityLog]:
        return self.db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.timestamp.desc()).all()
