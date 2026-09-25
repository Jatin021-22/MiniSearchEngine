"""Heap-based top-K ranking for search results."""
import heapq
from typing import Dict, List, Tuple


class Ranker:
    @staticmethod
    def score_document(doc_id: int, query_terms: list, term_freqs: Dict[str, int]) -> float:
        return float(sum(term_freqs.get(t, 0) for t in query_terms))

    @staticmethod
    def top_k(candidates: set, scores: Dict[int, float], k: int = 10) -> List[Tuple[int, float]]:
        """Return top-k (doc_id, score) pairs using heap."""
        scored = [(scores.get(doc_id, 0), doc_id) for doc_id in candidates]
        top = heapq.nlargest(k, scored)
        return [(doc_id, score) for score, doc_id in top]
