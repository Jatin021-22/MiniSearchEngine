from typing import List

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.database import Benchmark, IndexOperation, SearchHistory
from app.models.schemas import BenchmarkResponse, IndexOperationResponse, IndexStatsResponse
from app.services.benchmark_service import BenchmarkService

router = APIRouter(prefix="/api", tags=["benchmarks", "index"])


@router.get("/index/stats", response_model=IndexStatsResponse)
def index_stats(request: Request, db: Session = Depends(get_db)):
    index = request.app.state.index
    op_count = db.query(IndexOperation).count()
    search_count = db.query(SearchHistory).count()

    return {
        "term_count": len(index.index),
        "doc_count": index.doc_count,
        "operation_count": op_count,
        "search_count": search_count,
    }


@router.get("/index/operations", response_model=List[IndexOperationResponse])
def index_operations(limit: int = 50, db: Session = Depends(get_db)):
    return (
        db.query(IndexOperation)
        .order_by(IndexOperation.created_at.desc())
        .limit(limit)
        .all()
    )


@router.post("/benchmarks/run")
def run_benchmark(
    method: str = Query(..., pattern="^(batch_rebuild|incremental)$"),
    dataset_size: int = Query(100, ge=10, le=10000),
    operation: str = Query("insert", pattern="^(insert|update|delete)$"),
    db: Session = Depends(get_db),
):
    return BenchmarkService.run_benchmark(db, method, dataset_size, operation)


@router.get("/benchmarks", response_model=List[BenchmarkResponse])
def get_benchmarks(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Benchmark).order_by(Benchmark.created_at.desc()).limit(limit).all()


@router.get("/benchmarks/comparison")
def benchmark_comparison(
    dataset_size: int = Query(100),
    operation: str = Query("insert"),
    db: Session = Depends(get_db),
):
    return BenchmarkService.get_comparison(db, dataset_size, operation)
