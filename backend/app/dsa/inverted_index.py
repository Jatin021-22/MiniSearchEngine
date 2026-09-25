"""Hash-map inverted index with Skip List posting lists."""
from typing import Dict, List, Set

from app.dsa.skip_list import SkipList


class InvertedIndex:
    def __init__(self):
        self.index: Dict[str, SkipList] = {}
        self.doc_count = 0
        self._doc_ids: Set[int] = set()

    def add_document(self, doc_id: int, terms_freq: Dict[str, int]) -> int:
        """Add document terms to index. Returns affected term count."""
        affected = 0
        is_new = doc_id not in self._doc_ids
        for term, freq in terms_freq.items():
            if term not in self.index:
                self.index[term] = SkipList()
            self.index[term].insert(doc_id, {"freq": freq})
            affected += 1
        if is_new:
            self._doc_ids.add(doc_id)
            self.doc_count += 1
        return affected

    def remove_document(self, doc_id: int, old_terms: List[str]) -> int:
        """Remove document postings for given terms."""
        affected = 0
        for term in old_terms:
            if term in self.index:
                if self.index[term].delete(doc_id):
                    affected += 1
                if len(self.index[term]) == 0:
                    del self.index[term]
        if doc_id in self._doc_ids:
            self._doc_ids.discard(doc_id)
            self.doc_count = max(0, self.doc_count - 1)
        return affected

    def update_document(self, doc_id: int, old_terms: List[str], new_terms: Dict[str, int]) -> int:
        """Update document: remove old postings, add new."""
        affected = self.remove_document(doc_id, old_terms)
        # Re-add doc to count since remove decremented it
        if doc_id not in self._doc_ids:
            self._doc_ids.add(doc_id)
            self.doc_count += 1
        affected += self.add_document(doc_id, new_terms)
        return affected

    def search_terms(self, query_terms: List[str]) -> Dict[int, float]:
        """Return {doc_id: score} for matching documents."""
        candidates: Set[int] = set()
        posting_lists = {}
        for term in query_terms:
            if term in self.index:
                posting_lists[term] = self.index[term]
                candidates.update(self.index[term].get_all_doc_ids())

        scores: Dict[int, float] = {}
        for doc_id in candidates:
            score = 0.0
            for term in query_terms:
                if term in posting_lists:
                    score += posting_lists[term].get_frequency(doc_id)
            if score > 0:
                scores[doc_id] = score
        return scores

    def get_document_terms(self, doc_id: int) -> List[str]:
        """Get all terms associated with a document."""
        terms = []
        for term, posting_list in self.index.items():
            if posting_list.search(doc_id):
                terms.append(term)
        return terms

    def clear(self):
        self.index.clear()
        self._doc_ids.clear()
        self.doc_count = 0
