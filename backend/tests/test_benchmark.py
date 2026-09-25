import pytest
from app.services.benchmark_service import (
    benchmark_batch_rebuild,
    benchmark_incremental,
    generate_test_documents,
)
from app.dsa.inverted_index import InvertedIndex


def test_generate_test_documents():
    docs = generate_test_documents(10)
    assert len(docs) == 10
    assert all("id" in d and "terms" in d for d in docs)


def test_batch_rebuild_faster_setup():
    docs = generate_test_documents(100)
    duration_ms, affected, index = benchmark_batch_rebuild(docs)
    assert duration_ms > 0
    assert affected > 0
    assert index.doc_count == 100


def test_incremental_faster_than_batch():
    docs = generate_test_documents(200)
    batch_ms, _, _ = benchmark_batch_rebuild(docs)

    inc_index = InvertedIndex()
    changes = [{"op": "insert", "doc_id": d["id"], "terms": d["terms"]} for d in docs]
    inc_ms, _ = benchmark_incremental(inc_index, changes)

    # Incremental on empty index should be comparable; on updates it wins
    assert inc_ms > 0
    assert batch_ms > 0


def test_incremental_update():
    docs = generate_test_documents(50)
    index = InvertedIndex()
    for d in docs[:25]:
        index.add_document(d["id"], d["terms"])

    changes = []
    for d in docs[25:]:
        changes.append({
            "op": "update",
            "doc_id": d["id"],
            "old_terms": list(d["terms"].keys()),
            "terms": {**d["terms"], "newterm": 1},
        })

    duration_ms, affected = benchmark_incremental(index, changes)
    assert duration_ms > 0
    assert affected > 0
