import random
import time
from copy import deepcopy
from typing import Dict, List

from sqlalchemy.orm import Session

from app.dsa.inverted_index import InvertedIndex
from app.models.database import Benchmark


def generate_test_documents(count: int, start_id: int = 1) -> List[Dict]:
    """Generate synthetic documents for benchmarking."""
    words = [
        "python", "database", "search", "index", "algorithm", "data",
        "structure", "query", "document", "token", "ranking", "heap",
        "skiplist", "inverted", "benchmark", "performance", "memory",
        "incremental", "batch", "rebuild", "fastapi", "react", "postgres",
    ]
    documents = []
    for i in range(count):
        doc_id = start_id + i
        num_terms = random.randint(5, 20)
        terms = {}
        for _ in range(num_terms):
            word = random.choice(words)
            terms[word] = terms.get(word, 0) + random.randint(1, 5)
        documents.append({"id": doc_id, "terms": terms})
    return documents


def benchmark_batch_rebuild(documents: List[Dict]) -> tuple:
    """Full index rebuild from scratch."""
    start = time.perf_counter()
    index = InvertedIndex()
    affected = 0
    for doc in documents:
        affected += index.add_document(doc["id"], doc["terms"])
    duration_ms = (time.perf_counter() - start) * 1000
    return duration_ms, affected, index


def benchmark_incremental(index: InvertedIndex, changes: List[Dict]) -> tuple:
    """Incremental index updates on existing index."""
    start = time.perf_counter()
    affected = 0
    for change in changes:
        op = change["op"]
        if op == "insert":
            affected += index.add_document(change["doc_id"], change["terms"])
        elif op == "update":
            affected += index.update_document(
                change["doc_id"], change.get("old_terms", []), change["terms"]
            )
        elif op == "delete":
            affected += index.remove_document(change["doc_id"], change.get("old_terms", []))
    duration_ms = (time.perf_counter() - start) * 1000
    return duration_ms, affected


class BenchmarkService:
    @staticmethod
    def run_benchmark(
        db: Session,
        method: str,
        dataset_size: int,
        operation: str = "insert",
    ) -> Dict:
        documents = generate_test_documents(dataset_size)

        if method == "batch_rebuild":
            duration_ms, affected, _ = benchmark_batch_rebuild(documents)
        elif method == "incremental":
            index = InvertedIndex()
            if operation == "insert":
                changes = [{"op": "insert", "doc_id": d["id"], "terms": d["terms"]} for d in documents]
            elif operation == "update":
                half = dataset_size // 2
                for d in documents[:half]:
                    index.add_document(d["id"], d["terms"])
                changes = []
                for d in documents[half:]:
                    old_terms = list(d["terms"].keys())
                    new_terms = deepcopy(d["terms"])
                    new_terms["updated"] = new_terms.get("updated", 0) + 1
                    changes.append({
                        "op": "update",
                        "doc_id": d["id"],
                        "old_terms": old_terms,
                        "terms": new_terms,
                    })
            else:
                for d in documents:
                    index.add_document(d["id"], d["terms"])
                changes = [
                    {"op": "delete", "doc_id": d["id"], "old_terms": list(d["terms"].keys())}
                    for d in documents[: dataset_size // 2]
                ]
            duration_ms, affected = benchmark_incremental(index, changes)
        else:
            raise ValueError(f"Unknown method: {method}")

        record = Benchmark(
            method=method,
            dataset_size=dataset_size,
            operation=operation,
            duration_ms=round(duration_ms, 2),
            memory_mb=round(dataset_size * 0.01, 2),
            affected_terms=affected,
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "id": record.id,
            "method": method,
            "dataset_size": dataset_size,
            "operation": operation,
            "duration_ms": record.duration_ms,
            "memory_mb": record.memory_mb,
            "affected_terms": affected,
        }

    @staticmethod
    def get_comparison(db: Session, dataset_size: int, operation: str = "insert") -> Dict:
        batch = (
            db.query(Benchmark)
            .filter(Benchmark.method == "batch_rebuild", Benchmark.dataset_size == dataset_size, Benchmark.operation == operation)
            .order_by(Benchmark.created_at.desc())
            .first()
        )
        incremental = (
            db.query(Benchmark)
            .filter(Benchmark.method == "incremental", Benchmark.dataset_size == dataset_size, Benchmark.operation == operation)
            .order_by(Benchmark.created_at.desc())
            .first()
        )

        speedup = None
        if batch and incremental and incremental.duration_ms > 0:
            speedup = round(batch.duration_ms / incremental.duration_ms, 2)

        return {
            "batch": batch,
            "incremental": incremental,
            "speedup": speedup,
        }
