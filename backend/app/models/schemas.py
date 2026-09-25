from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    title: str
    filename: str
    status: str
    content_preview: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SearchResultItem(BaseModel):
    id: int
    title: str
    score: float
    filename: Optional[str] = None
    content_preview: Optional[str] = None


class TimingMetrics(BaseModel):
    tokenization_ms: float
    index_lookup_ms: float
    candidate_collection_ms: float
    scoring_ms: float
    ranking_ms: float
    db_fetch_ms: float
    dsa_time_ms: float
    total_ms: float


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    timing: TimingMetrics
    candidate_count: int


class IndexStatsResponse(BaseModel):
    term_count: int
    doc_count: int
    operation_count: int
    search_count: int


class BenchmarkResponse(BaseModel):
    id: int
    method: str
    dataset_size: int
    operation: str
    duration_ms: float
    memory_mb: float
    affected_terms: int
    created_at: datetime

    class Config:
        from_attributes = True


class IndexOperationResponse(BaseModel):
    id: int
    document_id: Optional[int]
    operation: str
    affected_terms: int
    duration_ms: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SearchHistoryResponse(BaseModel):
    id: int
    query: str
    result_count: int
    latency_ms: float
    tokenization_ms: float = 0
    index_lookup_ms: float = 0
    candidate_collection_ms: float = 0
    scoring_ms: float = 0
    ranking_ms: float = 0
    db_fetch_ms: float = 0
    dsa_time_ms: float = 0
    total_ms: float = 0
    candidate_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
