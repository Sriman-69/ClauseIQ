from app.repositories.base_repository import BaseRepository
from app.repositories.interfaces import IMetricsRepository
from app.models.document import Metrics
from typing import List

class MetricsRepository(BaseRepository, IMetricsRepository):
    def increment(self, action: str, user_id: str = None) -> Metrics:
        metric = self.db.query(Metrics).filter(Metrics.action == action).first()
        if metric:
            metric.count += 1
        else:
            metric = Metrics(action=action, count=1)
            self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        return metric

    def get_metric(self, action: str, user_id: str = None) -> Metrics:
        return self.db.query(Metrics).filter(Metrics.action == action).first()

    def get_all(self, user_id: str = None) -> List[Metrics]:
        return self.db.query(Metrics).all()
