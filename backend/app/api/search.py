from typing import List

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.database import SearchHistory
from app.models.schemas import SearchHistoryResponse, SearchResponse
from app.services.search_service import SearchService

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search", response_model=SearchResponse)
def search(
    request: Request,
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    index = request.app.state.index
    result = SearchService.search_with_timing(index, q, limit, db)

    timing = result["timing"]
    record = SearchHistory(
        user_id=1,
        query=q,
        result_count=len(result["results"]),
        latency_ms=timing["total_ms"],
        tokenization_ms=timing["tokenization_ms"],
        index_lookup_ms=timing["index_lookup_ms"],
        candidate_collection_ms=timing["candidate_collection_ms"],
        scoring_ms=timing["scoring_ms"],
        ranking_ms=timing["ranking_ms"],
        db_fetch_ms=timing["db_fetch_ms"],
        dsa_time_ms=timing["dsa_time_ms"],
        total_ms=timing["total_ms"],
        candidate_count=result["candidate_count"],
        dataset_size=index.doc_count,
    )
    db.add(record)
    db.commit()

    return {
        "query": q,
        "results": result["results"],
        "timing": timing,
        "candidate_count": result["candidate_count"],
    }


@router.get("/search/autocomplete")
def autocomplete(request: Request, q: str = Query(""), limit: int = 10):
    suggestions = SearchService.get_autocomplete_suggestions(request.app.state.index, q, limit)
    return {"suggestions": suggestions}


@router.get("/search-history", response_model=List[SearchHistoryResponse])
def search_history(limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)):
    return (
        db.query(SearchHistory)
        .order_by(SearchHistory.created_at.desc())
        .limit(limit)
        .all()
    )
