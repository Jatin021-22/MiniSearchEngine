import pytest
from app.dsa.skip_list import SkipList


class TestSkipListInsertSearch:
    def test_empty_list(self):
        sl = SkipList()
        assert sl.search(1) is False

    def test_single_insert(self):
        sl = SkipList()
        sl.insert(1, {"freq": 5})
        assert sl.search(1) is True

    def test_multiple_inserts(self):
        sl = SkipList()
        for i in range(1, 101):
            sl.insert(i, {"freq": i})
        for i in range(1, 101):
            assert sl.search(i) is True

    def test_insert_update(self):
        sl = SkipList()
        sl.insert(1, {"freq": 5})
        sl.insert(1, {"freq": 10})
        assert sl.get_frequency(1) == 10


class TestSkipListDelete:
    def test_delete_existing(self):
        sl = SkipList()
        sl.insert(1, {})
        assert sl.delete(1) is True
        assert sl.search(1) is False

    def test_delete_nonexistent(self):
        sl = SkipList()
        assert sl.delete(99) is False

    def test_delete_from_multiple(self):
        sl = SkipList()
        for i in range(1, 11):
            sl.insert(i, {})
        sl.delete(5)
        assert sl.search(5) is False
        assert sl.search(4) is True
        assert sl.search(6) is True


class TestSkipListRangeQuery:
    def test_range_query_basic(self):
        sl = SkipList()
        for i in range(1, 11):
            sl.insert(i, {})
        result = sl.range_query(3, 7)
        assert result == [3, 4, 5, 6, 7]

    def test_range_query_empty(self):
        sl = SkipList()
        sl.insert(1, {})
        assert sl.range_query(5, 10) == []

    def test_range_query_single(self):
        sl = SkipList()
        for i in [1, 5, 10]:
            sl.insert(i, {})
        assert sl.range_query(5, 5) == [5]


class TestSkipListTraversal:
    def test_get_all_doc_ids(self):
        sl = SkipList()
        for i in [3, 1, 7, 2]:
            sl.insert(i, {})
        assert sl.get_all_doc_ids() == [1, 2, 3, 7]

    def test_len(self):
        sl = SkipList()
        assert len(sl) == 0
        sl.insert(1, {})
        sl.insert(2, {})
        assert len(sl) == 2

    def test_get_frequency(self):
        sl = SkipList()
        sl.insert(1, {"freq": 42})
        assert sl.get_frequency(1) == 42
        assert sl.get_frequency(99) == 0


class TestSkipListStress:
    @pytest.mark.parametrize("n", [10, 50, 100, 500])
    def test_insert_search_stress(self, n):
        sl = SkipList()
        for i in range(n):
            sl.insert(i, {"freq": i})
        for i in range(n):
            assert sl.search(i) is True

    @pytest.mark.parametrize("n", [10, 50, 100])
    def test_delete_all(self, n):
        sl = SkipList()
        for i in range(n):
            sl.insert(i, {})
        for i in range(n):
            sl.delete(i)
        assert len(sl) == 0

    def test_large_range_query(self):
        sl = SkipList()
        for i in range(1000):
            sl.insert(i, {})
        result = sl.range_query(100, 200)
        assert len(result) == 101
        assert result[0] == 100
        assert result[-1] == 200
