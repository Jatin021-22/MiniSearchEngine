import pytest
from app.dsa.inverted_index import InvertedIndex
from app.services.search_service import SearchService
from app.models.database import Document, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    session.add(Document(id=1, title="Python Guide", filename="python.txt", file_hash="abc", status="active"))
    session.add(Document(id=2, title="Database Design", filename="db.txt", file_hash="def", status="active"))
    session.commit()
    yield session
    session.close()


class TestInvertedIndex:
    def test_add_document(self):
        index = InvertedIndex()
        affected = index.add_document(1, {"python": 5, "code": 2})
        assert affected == 2
        assert index.doc_count == 1
        assert "python" in index.index

    def test_remove_document(self):
        index = InvertedIndex()
        index.add_document(1, {"python": 5, "code": 2})
        affected = index.remove_document(1, ["python", "code"])
        assert affected == 2
        assert index.doc_count == 0

    def test_update_document(self):
        index = InvertedIndex()
        index.add_document(1, {"python": 5})
        index.update_document(1, ["python"], {"java": 3})
        assert index.search_terms(["java"])[1] == 3
        assert "python" not in index.index

    def test_search_terms(self):
        index = InvertedIndex()
        index.add_document(1, {"python": 5, "database": 3})
        index.add_document(2, {"python": 2})
        scores = index.search_terms(["python"])
        assert scores[1] == 5
        assert scores[2] == 2


class TestSearchTiming:
    def test_search_timing_accuracy(self, sample_index, db_session):
        result = SearchService.search_with_timing(sample_index, "python database", 10, db_session)
        timing = result["timing"]
        assert timing["tokenization_ms"] >= 0
        assert timing["total_ms"] > 0
        assert timing["dsa_time_ms"] >= 0

    def test_search_timing_consistency(self, sample_index, db_session):
        times = []
        for _ in range(5):
            result = SearchService.search_with_timing(sample_index, "python", 10, db_session)
            times.append(result["timing"]["total_ms"])
        avg = sum(times) / len(times)
        variance = max(times) - min(times)
        assert variance < avg * 2 or avg < 1

    def test_empty_query_terms(self, sample_index, db_session):
        result = SearchService.search_with_timing(sample_index, "the a an", 10, db_session)
        assert result["results"] == []


class TestBatchVsIncremental:
    def test_batch_equals_incremental(self):
        from app.services.benchmark_service import generate_test_documents, benchmark_batch_rebuild, benchmark_incremental

        docs = generate_test_documents(50)
        batch_ms, _, batch_index = benchmark_batch_rebuild(docs)

        inc_index = InvertedIndex()
        changes = [{"op": "insert", "doc_id": d["id"], "terms": d["terms"]} for d in docs]
        inc_ms, _ = benchmark_incremental(inc_index, changes)

        assert inc_index.doc_count == batch_index.doc_count
        assert len(inc_index.index) == len(batch_index.index)
        for term in batch_index.index:
            assert term in inc_index.index
