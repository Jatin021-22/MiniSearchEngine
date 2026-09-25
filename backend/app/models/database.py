from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    email = Column(String(255), unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    title = Column(String(500))
    filename = Column(String(255))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="active")
    file_hash = Column(String(64), unique=True)
    content_preview = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Term(Base):
    __tablename__ = "terms"
    id = Column(Integer, primary_key=True)
    term = Column(String(255), unique=True)


class DocumentTerm(Base):
    __tablename__ = "document_terms"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    term_id = Column(Integer, ForeignKey("terms.id", ondelete="CASCADE"))
    frequency = Column(Integer, default=1)
    positions = Column(Text, nullable=True)
    __table_args__ = (UniqueConstraint("document_id", "term_id"),)


class IndexOperation(Base):
    __tablename__ = "index_operations"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    operation = Column(String(50))
    affected_terms = Column(Integer, default=0)
    duration_ms = Column(Float, default=0.0)
    status = Column(String(50), default="success")
    created_at = Column(DateTime, default=datetime.utcnow)


class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    query = Column(String(500))
    result_count = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    tokenization_ms = Column(Float, default=0.0)
    index_lookup_ms = Column(Float, default=0.0)
    candidate_collection_ms = Column(Float, default=0.0)
    scoring_ms = Column(Float, default=0.0)
    ranking_ms = Column(Float, default=0.0)
    db_fetch_ms = Column(Float, default=0.0)
    dsa_time_ms = Column(Float, default=0.0)
    total_ms = Column(Float, default=0.0)
    candidate_count = Column(Integer, default=0)
    dataset_size = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Benchmark(Base):
    __tablename__ = "benchmarks"
    id = Column(Integer, primary_key=True)
    method = Column(String(50))
    dataset_size = Column(Integer)
    operation = Column(String(50))
    duration_ms = Column(Float)
    memory_mb = Column(Float, default=0.0)
    affected_terms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_database_url() -> str:
    url = settings.database_url
    if settings.sqlite_fallback:
        try:
            import psycopg2  # noqa: F401
        except ImportError:
            url = "sqlite:///./minisearch.db"
    return url


engine = create_engine(get_database_url(), connect_args={"check_same_thread": False} if "sqlite" in get_database_url() else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(User).first():
            db.add(User(name="Default User", email="user@minisearch.local"))
            db.commit()
    finally:
        db.close()
