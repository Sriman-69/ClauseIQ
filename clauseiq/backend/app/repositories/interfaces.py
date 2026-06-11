from abc import ABC, abstractmethod
from typing import List, Optional
from app.models.document import Document, Chunk, Clause, AnalysisSnapshot, Metrics

class IDocumentRepository(ABC):
    @abstractmethod
    def get_by_id(self, document_id: str, user_id: str = None) -> Optional[Document]:
        pass

    @abstractmethod
    def get_by_hash(self, content_hash: str, user_id: str = None) -> Optional[Document]:
        pass

    @abstractmethod
    def create(self, db_document: Document, user_id: str = None) -> Document:
        pass

    @abstractmethod
    def update(self, db_document: Document, user_id: str = None) -> Document:
        pass

    @abstractmethod
    def delete(self, document_id: str, user_id: str = None) -> bool:
        pass

    @abstractmethod
    def get_all(self, user_id: str = None) -> List[Document]:
        pass

    @abstractmethod
    def get_versions(self, document_id: str, user_id: str = None) -> List[Document]:
        pass

class IChunkRepository(ABC):
    @abstractmethod
    def add_chunk(self, chunk: Chunk, user_id: str = None) -> Chunk:
        pass

    @abstractmethod
    def get_chunks(self, document_id: str, user_id: str = None) -> List[Chunk]:
        pass

class IClauseRepository(ABC):
    @abstractmethod
    def create_clause(self, clause: Clause, user_id: str = None) -> Clause:
        pass

    @abstractmethod
    def get_document_clauses(self, document_id: str, user_id: str = None) -> List[Clause]:
        pass

    @abstractmethod
    def delete_document_clauses(self, document_id: str, user_id: str = None) -> None:
        pass

class ISnapshotRepository(ABC):
    @abstractmethod
    def get_snapshot(self, document_id: str, analysis_type: str, document_hash: str = None, user_id: str = None) -> Optional[AnalysisSnapshot]:
        pass

    @abstractmethod
    def create_snapshot(self, snapshot: AnalysisSnapshot, user_id: str = None) -> AnalysisSnapshot:
        pass

    @abstractmethod
    def update_snapshot(self, snapshot: AnalysisSnapshot, user_id: str = None) -> AnalysisSnapshot:
        pass

    @abstractmethod
    def delete_snapshot(self, snapshot_id: str, user_id: str = None) -> bool:
        pass

class IMetricsRepository(ABC):
    @abstractmethod
    def increment(self, action: str, user_id: str = None) -> Metrics:
        pass

    @abstractmethod
    def get_metric(self, action: str, user_id: str = None) -> Optional[Metrics]:
        pass

    @abstractmethod
    def get_all(self, user_id: str = None) -> List[Metrics]:
        pass

class IUserRepository(ABC):
    pass
