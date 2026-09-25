import json
import os
from typing import Dict, List

from sqlalchemy.orm import Session

from app.dsa.inverted_index import InvertedIndex
from app.models.database import Document, DocumentTerm, Term


def load_index_from_db(db: Session) -> InvertedIndex:
    """Reconstruct in-memory inverted index from PostgreSQL on startup."""
    index = InvertedIndex()
    docs = db.query(Document).filter(Document.status == "active").all()
    for doc in docs:
        terms_freq: Dict[str, int] = {}
        doc_terms = (
            db.query(DocumentTerm, Term)
            .join(Term, DocumentTerm.term_id == Term.id)
            .filter(DocumentTerm.document_id == doc.id)
            .all()
        )
        for dt, term in doc_terms:
            terms_freq[term.term] = dt.frequency
        if terms_freq:
            index.add_document(doc.id, terms_freq)
    return index


def persist_document_terms(db: Session, doc_id: int, terms_freq: Dict[str, int]) -> int:
    """Store document-term relationships in DB."""
    affected = 0
    for term_str, freq in terms_freq.items():
        term = db.query(Term).filter(Term.term == term_str).first()
        if not term:
            term = Term(term=term_str)
            db.add(term)
            db.flush()
        doc_term = (
            db.query(DocumentTerm)
            .filter(DocumentTerm.document_id == doc_id, DocumentTerm.term_id == term.id)
            .first()
        )
        if doc_term:
            doc_term.frequency = freq
        else:
            db.add(DocumentTerm(document_id=doc_id, term_id=term.id, frequency=freq, positions=json.dumps([])))
        affected += 1
    return affected


def remove_document_terms(db: Session, doc_id: int) -> List[str]:
    """Remove all term associations for a document, return removed term strings."""
    old_terms = []
    doc_terms = (
        db.query(DocumentTerm, Term)
        .join(Term, DocumentTerm.term_id == Term.id)
        .filter(DocumentTerm.document_id == doc_id)
        .all()
    )
    for dt, term in doc_terms:
        old_terms.append(term.term)
        db.delete(dt)
    return old_terms


def cleanup_orphan_terms(db: Session):
    """Remove terms with no document associations."""
    terms = db.query(Term).all()
    for term in terms:
        count = db.query(DocumentTerm).filter(DocumentTerm.term_id == term.id).count()
        if count == 0:
            db.delete(term)


def ensure_upload_dir(upload_dir: str):
    os.makedirs(upload_dir, exist_ok=True)
