import hashlib
import io
import os
import time
from dataclasses import dataclass
from typing import Dict, List, Optional

import pdfplumber
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.dsa.inverted_index import InvertedIndex
from app.dsa.ranking import Ranker
from app.dsa.tokenizer import Tokenizer
from app.models.database import Document, IndexOperation
from app.services.index_service import ensure_upload_dir, persist_document_terms, remove_document_terms


@dataclass
class TimingMetrics:
    tokenization_ms: float = 0.0
    index_lookup_ms: float = 0.0
    candidate_collection_ms: float = 0.0
    scoring_ms: float = 0.0
    ranking_ms: float = 0.0
    db_fetch_ms: float = 0.0
    total_ms: float = 0.0

    def to_dict(self) -> dict:
        dsa = self.index_lookup_ms + self.candidate_collection_ms + self.scoring_ms + self.ranking_ms
        return {
            "tokenization_ms": round(self.tokenization_ms, 2),
            "index_lookup_ms": round(self.index_lookup_ms, 2),
            "candidate_collection_ms": round(self.candidate_collection_ms, 2),
            "scoring_ms": round(self.scoring_ms, 2),
            "ranking_ms": round(self.ranking_ms, 2),
            "db_fetch_ms": round(self.db_fetch_ms, 2),
            "dsa_time_ms": round(dsa, 2),
            "total_ms": round(self.total_ms, 2),
        }


class SearchService:
    @staticmethod
    def search_with_timing(index: InvertedIndex, query: str, limit: int, db: Session) -> Dict:
        total_start = time.perf_counter()
        timing = TimingMetrics()

        token_start = time.perf_counter()
        query_terms = Tokenizer.tokenize_query(query)
        timing.tokenization_ms = (time.perf_counter() - token_start) * 1000

        if not query_terms:
            timing.total_ms = (time.perf_counter() - total_start) * 1000
            return {"results": [], "timing": timing.to_dict(), "candidate_count": 0, "query_terms": []}

        lookup_start = time.perf_counter()
        posting_lists = {}
        for term in query_terms:
            if term in index.index:
                posting_lists[term] = index.index[term]
        timing.index_lookup_ms = (time.perf_counter() - lookup_start) * 1000

        candidate_start = time.perf_counter()
        candidates = set()
        for posting_list in posting_lists.values():
            candidates.update(posting_list.get_all_doc_ids())
        timing.candidate_collection_ms = (time.perf_counter() - candidate_start) * 1000

        scoring_start = time.perf_counter()
        scores = {}
        for doc_id in candidates:
            score = 0.0
            for term in query_terms:
                if term in posting_lists:
                    score += posting_lists[term].get_frequency(doc_id)
            if score > 0:
                scores[doc_id] = score
        timing.scoring_ms = (time.perf_counter() - scoring_start) * 1000

        ranking_start = time.perf_counter()
        top_k = Ranker.top_k(candidates, scores, k=limit)
        timing.ranking_ms = (time.perf_counter() - ranking_start) * 1000

        db_start = time.perf_counter()
        results = []
        for doc_id, score in top_k:
            doc = db.query(Document).filter(Document.id == doc_id, Document.status == "active").first()
            if doc:
                results.append({
                    "id": doc.id,
                    "title": doc.title,
                    "score": score,
                    "filename": doc.filename,
                    "content_preview": doc.content_preview,
                })
        timing.db_fetch_ms = (time.perf_counter() - db_start) * 1000
        timing.total_ms = (time.perf_counter() - total_start) * 1000

        return {
            "results": results,
            "timing": timing.to_dict(),
            "candidate_count": len(candidates),
            "query_terms": query_terms,
        }

    @staticmethod
    def get_autocomplete_suggestions(index: InvertedIndex, prefix: str, limit: int = 10) -> List[str]:
        prefix = prefix.lower()
        if not prefix:
            return []
        matches = [t for t in index.index.keys() if t.startswith(prefix)]
        matches.sort()
        return matches[:limit]


class DocumentService:
    ALLOWED_EXTENSIONS = {".pdf", ".txt"}

    @staticmethod
    def _compute_hash(content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    def extract_text(filename: str, content: bytes) -> str:
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".txt":
            return content.decode("utf-8", errors="ignore")
        if ext == ".pdf":
            text_parts = []
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            return "\n".join(text_parts)
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    @staticmethod
    async def upload_document(file: UploadFile, db: Session, index: InvertedIndex) -> Dict:
        start = time.perf_counter()
        ensure_upload_dir(settings.upload_dir)

        filename = file.filename or "unknown"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in DocumentService.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are allowed")

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        file_hash = DocumentService._compute_hash(content)
        existing = db.query(Document).filter(Document.file_hash == file_hash, Document.status == "active").first()
        if existing:
            raise HTTPException(status_code=409, detail="Document already exists")

        text = DocumentService.extract_text(filename, content)
        terms_freq = Tokenizer.tokenize(text)
        if not terms_freq:
            raise HTTPException(status_code=400, detail="No indexable content found")

        title = os.path.splitext(filename)[0]
        preview = text[:500] if text else ""

        doc = Document(
            title=title,
            filename=filename,
            file_hash=file_hash,
            content_preview=preview,
            owner_id=1,
            status="active",
        )
        db.add(doc)
        db.flush()

        filepath = os.path.join(settings.upload_dir, f"{doc.id}_{filename}")
        with open(filepath, "wb") as f:
            f.write(content)

        affected = index.add_document(doc.id, terms_freq)
        persist_document_terms(db, doc.id, terms_freq)

        duration_ms = (time.perf_counter() - start) * 1000
        op = IndexOperation(
            document_id=doc.id,
            operation="insert",
            affected_terms=affected,
            duration_ms=duration_ms,
            status="success",
        )
        db.add(op)
        db.commit()
        db.refresh(doc)

        return {
            "id": doc.id,
            "title": doc.title,
            "filename": doc.filename,
            "terms_indexed": len(terms_freq),
            "duration_ms": round(duration_ms, 2),
        }

    @staticmethod
    async def update_document(doc_id: int, file: UploadFile, db: Session, index: InvertedIndex) -> Dict:
        start = time.perf_counter()
        doc = db.query(Document).filter(Document.id == doc_id, Document.status == "active").first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        content = await file.read()
        text = DocumentService.extract_text(file.filename or doc.filename, content)
        new_terms = Tokenizer.tokenize(text)
        old_terms = remove_document_terms(db, doc_id)

        index.update_document(doc_id, old_terms, new_terms)
        persist_document_terms(db, doc_id, new_terms)

        doc.filename = file.filename or doc.filename
        doc.title = os.path.splitext(doc.filename)[0]
        doc.content_preview = text[:500]
        doc.file_hash = DocumentService._compute_hash(content)

        duration_ms = (time.perf_counter() - start) * 1000
        op = IndexOperation(
            document_id=doc_id,
            operation="update",
            affected_terms=len(old_terms) + len(new_terms),
            duration_ms=duration_ms,
        )
        db.add(op)
        db.commit()

        return {"id": doc_id, "title": doc.title, "duration_ms": round(duration_ms, 2)}

    @staticmethod
    def delete_document(doc_id: int, db: Session, index: InvertedIndex) -> Dict:
        start = time.perf_counter()
        doc = db.query(Document).filter(Document.id == doc_id, Document.status == "active").first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        old_terms = remove_document_terms(db, doc_id)
        affected = index.remove_document(doc_id, old_terms)
        doc.status = "deleted"

        duration_ms = (time.perf_counter() - start) * 1000
        op = IndexOperation(
            document_id=doc_id,
            operation="delete",
            affected_terms=affected,
            duration_ms=duration_ms,
        )
        db.add(op)
        db.commit()

        return {"id": doc_id, "status": "deleted", "duration_ms": round(duration_ms, 2)}

    @staticmethod
    def get_document(doc_id: int, db: Session) -> Optional[Document]:
        return db.query(Document).filter(Document.id == doc_id).first()

    @staticmethod
    def list_documents(db: Session, skip: int = 0, limit: int = 50) -> List[Document]:
        return (
            db.query(Document)
            .filter(Document.status == "active")
            .order_by(Document.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_document_history(doc_id: int, db: Session) -> List[IndexOperation]:
        return (
            db.query(IndexOperation)
            .filter(IndexOperation.document_id == doc_id)
            .order_by(IndexOperation.created_at.desc())
            .all()
        )
