from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import benchmarks, documents, search
from app.config import settings
from app.dependencies import get_db
from app.models.database import init_db
from app.services.index_service import load_index_from_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = next(get_db())
    try:
        app.state.index = load_index_from_db(db)
        print(f"Index reconstructed: {app.state.index.doc_count} docs, {len(app.state.index.index)} terms")
    finally:
        db.close()
    yield


app = FastAPI(title="MiniSearch API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(search.router)
app.include_router(benchmarks.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "index_loaded": hasattr(app.state, "index")}
