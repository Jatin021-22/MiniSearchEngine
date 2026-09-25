# MiniSearch

A full-stack document search system with an incrementally maintained inverted index. Built with React + FastAPI + PostgreSQL.

## Features

- **Incremental Indexing** — Insert, update, and delete documents without full index rebuilds
- **Custom DSA** — Skip List posting lists, hash-map inverted index, heap-based top-K ranking
- **Detailed Search Timing** — Phase-by-phase breakdown (tokenization, lookup, scoring, ranking, DB fetch)
- **Algorithm Lab** — Side-by-side batch rebuild vs incremental benchmark comparison
- **Glassmorphic UI** — React 18 + TailwindCSS + GSAP animations + Recharts

## Project Structure

```
MiniSearchEngine/
├── backend/          # FastAPI + SQLAlchemy + custom DSA
│   ├── app/
│   │   ├── dsa/      # SkipList, InvertedIndex, Ranker, Tokenizer
│   │   ├── api/      # REST routes
│   │   ├── services/ # Business logic
│   │   └── models/   # SQLAlchemy models + Pydantic schemas
│   └── tests/
└── frontend/         # React + Vite + TailwindCSS
    └── src/
        ├── pages/    # Dashboard, Search, Upload, Algorithm Lab, etc.
        ├── components/
        ├── hooks/
        └── services/
```

For database creation, PostgreSQL vs SQLite, and a full testing walkthrough, see **[SETUP.md](SETUP.md)**.

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python main.py
```

The API runs at `http://localhost:8000`. SQLite is used automatically if PostgreSQL is unavailable.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI runs at `http://localhost:5173` with API proxy to port 8000.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload PDF/TXT |
| GET | `/api/search?q=keyword` | Search with timing breakdown |
| PUT | `/api/documents/{id}` | Update document |
| DELETE | `/api/documents/{id}` | Delete document |
| GET | `/api/index/stats` | Index statistics |
| POST | `/api/benchmarks/run` | Run benchmark |
| GET | `/api/benchmarks` | Benchmark history |
| GET | `/api/health` | Health check |

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

## Design Decisions

- **Skip List for posting lists** — O(log n) insert/delete/search vs O(n) for sorted arrays
- **In-memory index + PostgreSQL persistence** — Fast searches with crash recovery on restart
- **Incremental updates** — Only affected terms are modified, avoiding full rebuilds
- **Heap top-K ranking** — O(n log k) instead of O(n log n) full sort
- **Phase timing** — Separates DSA operations from I/O for performance analysis

## Deployment

- **Frontend**: Deploy `frontend/` to Vercel (`npm run build`)
- **Backend**: Deploy `backend/` to Render with PostgreSQL add-on
- Set `DATABASE_URL` environment variable on Render
- Set `VITE_API_URL` or configure proxy for production API URL
