from app.repositories.base_repository import BaseRepository
from app.repositories.interfaces import ISnapshotRepository
from app.models.document import AnalysisSnapshot

class SnapshotRepository(BaseRepository, ISnapshotRepository):
    def get_snapshot(self, document_id: str, analysis_type: str, document_hash: str = None, user_id: str = None) -> AnalysisSnapshot:
        query = self.db.query(AnalysisSnapshot).filter(
            AnalysisSnapshot.document_id == document_id,
            AnalysisSnapshot.analysis_type == analysis_type
        )
        if document_hash:
            query = query.filter(AnalysisSnapshot.document_hash == document_hash)
        return query.first()

    def create_snapshot(self, snapshot: AnalysisSnapshot, user_id: str = None) -> AnalysisSnapshot:
        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

    def update_snapshot(self, snapshot: AnalysisSnapshot, user_id: str = None) -> AnalysisSnapshot:
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

    def delete_snapshot(self, snapshot_id: str, user_id: str = None) -> bool:
        snapshot = self.db.query(AnalysisSnapshot).filter(AnalysisSnapshot.id == snapshot_id).first()
        if snapshot:
            self.db.delete(snapshot)
            self.db.commit()
            return True
        return False
