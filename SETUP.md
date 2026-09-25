# MiniSearch — Full Setup & Testing Guide

You can run MiniSearch in two ways:

| Mode | Best for | Database name |
|------|----------|---------------|
| **SQLite (default)** | Quick local testing | `minisearch.db` (auto-created) |
| **PostgreSQL** | Production / viva demo | `minisearch` |

---

## Part 1 — Prerequisites

Install these first:

1. **Python 3.10+** — check: `python --version`
2. **Node.js 18+** — check: `node --version`
3. **Git** (optional)

For PostgreSQL only:

4. **PostgreSQL 14+** — [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

---

## Part 2 — Choose Your Database

### Option A: SQLite (easiest — recommended first)

No database server needed. Tables are created automatically when the backend starts.

**You do not need to create a database manually.**

The file will appear here after first run:

```
e:\MiniSearchEngine\backend\minisearch.db
```

Skip to **Part 3** if you use this option.

---

### Option B: PostgreSQL (full setup)

#### Step 1 — Install PostgreSQL

During installation, note:

- **Username:** usually `postgres`
- **Password:** e.g. `postgres` (remember this)
- **Port:** `5432` (default)

#### Step 2 — Create the database

**Method 1 — pgAdmin (GUI)**

1. Open **pgAdmin**
2. Connect to your local server
3. Right-click **Databases** → **Create** → **Database**
4. Set:
   - **Database name:** `minisearch`
   - **Owner:** `postgres`
5. Click **Save**

**Method 2 — SQL Shell (psql)**

Open **SQL Shell (psql)** from the Start menu:

```sql
-- Login with your postgres password when prompted
CREATE DATABASE minisearch;
```

**Method 3 — PowerShell**

```powershell
psql -U postgres -c "CREATE DATABASE minisearch;"
```

#### Step 3 — Create backend `.env`

In `backend/`, create a file named `.env` (you can copy from `.env.example`):

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/minisearch
SQLITE_FALLBACK=true
UPLOAD_DIR=uploads
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

**Connection string format:**

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Example:

```
postgresql://postgres:postgres@localhost:5432/minisearch
```

#### Step 4 — Tables are auto-created

You do **not** need to run `init.sql` manually. SQLAlchemy creates these tables on startup:

| Table | Purpose |
|-------|---------|
| `users` | Default user |
| `documents` | Uploaded files metadata |
| `terms` | Vocabulary |
| `document_terms` | Term frequencies per document |
| `index_operations` | Insert/update/delete log |
| `search_history` | Search queries + timing breakdown |
| `benchmarks` | Algorithm Lab results |

Optional: you can run `backend/database/init.sql` in pgAdmin if you want to inspect the schema manually.

---

## Part 3 — Backend Setup

Open **Terminal 1** (PowerShell):

```powershell
cd e:\MiniSearchEngine\backend

# Create virtual environment (first time only)
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start API server
python main.py
```

**Success looks like:**

```
Index reconstructed: 0 docs, 0 terms
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Keep this terminal open.

---

## Part 4 — Frontend Setup

Open **Terminal 2** (PowerShell):

```powershell
cd e:\MiniSearchEngine\frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**Success looks like:**

```
Local:   http://localhost:5173/
```

Open in browser: **http://localhost:5173**

---

## Part 5 — Verify Backend Is Working

Before using the UI, test the API.

### Test 1 — Health check

In a **third terminal** or browser:

```
http://localhost:8000/api/health
```

Expected:

```json
{"status":"ok","index_loaded":true}
```

### Test 2 — Index stats

```
http://localhost:8000/api/index/stats
```

Expected (empty at start):

```json
{
  "term_count": 0,
  "doc_count": 0,
  "operation_count": 0,
  "search_count": 0
}
```

### Test 3 — API docs

Open:

```
http://localhost:8000/docs
```

You can test all endpoints from Swagger UI here.

---

## Part 6 — Step-by-Step UI Testing

### Test 1 — Upload a document

1. Go to **Upload** (`http://localhost:5173/upload`)
2. Create a test file `test-doc.txt`:

```text
Python is a powerful programming language.
Database systems store and retrieve data efficiently.
Search engines use inverted indexes for fast queries.
Python database search algorithms are important for performance.
```

3. Drag the file into the upload zone (or click **Browse Files**)
4. You should see a green toast: e.g. `Uploaded "test-doc" — X terms indexed`

**Verify:**

- **Dashboard** → Documents count increases
- **Index Monitor** → Vocabulary size increases

---

### Test 2 — Search with timing

1. Go to **Search**
2. Search for: `python database`
3. You should see:
   - Ranked results
   - Latency badge (e.g. `⚡ 4.00ms`)
4. Click **Show timing breakdown**

Expected phases:

- Tokenization
- Index Lookup
- Candidate Collection
- Scoring
- Ranking
- DB Fetch
- DSA Time
- Total

---

### Test 3 — Document details

1. Click a search result
2. You should see:
   - Title, filename, preview
   - Created/Updated dates
3. Click **Version History** → should show an `insert` operation

---

### Test 4 — Delete document

1. On Document Details, click **Delete Document**
2. Confirm
3. Search again — document should not appear
4. **Index Monitor** → document count decreases

---

### Test 5 — Algorithm Lab (batch vs incremental)

1. Go to **Algorithm Lab**
2. Set **Dataset Size:** `100`
3. Workload: **insert**
4. Click **Run Batch Rebuild** → wait for toast
5. Click **Run Incremental** → wait for toast
6. You should see:
   - Side-by-side bar chart
   - Speedup ratio (incremental usually faster for updates)
   - Comparison table

---

### Test 6 — History page

1. Go to **History**
2. **Search History** — your queries with timing columns
3. **Indexing History** — upload/delete operations

---

### Test 7 — Index recovery (important for viva)

This proves PostgreSQL/SQLite persistence works.

1. Upload a document and search for it (confirm results)
2. Stop the backend (`Ctrl+C` in Terminal 1)
3. Start again: `python main.py`
4. You should see: `Index reconstructed: 1 docs, X terms`
5. Search again — same results should appear **without re-uploading**

---

## Part 7 — Automated Tests (pytest)

In backend terminal:

```powershell
cd e:\MiniSearchEngine\backend
.\venv\Scripts\activate
pytest tests/ -v
```

Expected: **33 passed**

This validates:

- Skip List operations
- Inverted index correctness
- Search timing
- Batch vs incremental equivalence

---

## Part 8 — API Testing with PowerShell (optional)

### Upload via API

```powershell
curl -X POST "http://localhost:8000/api/documents/upload" `
  -F "file=@C:\path\to\test-doc.txt"
```

### Search via API

```powershell
curl "http://localhost:8000/api/search?q=python&limit=10"
```

### Run benchmark via API

```powershell
curl -X POST "http://localhost:8000/api/benchmarks/run?method=incremental&dataset_size=100&operation=insert"
```

---

## Part 9 — Troubleshooting

| Problem | Fix |
|---------|-----|
| `ModuleNotFoundError: No module named 'app'` | Run from `backend/` folder; activate venv |
| Backend won't start on port 8000 | Another app is using it; stop it or change port in `main.py` |
| Frontend shows network errors | Ensure backend is running on port 8000 |
| PostgreSQL connection failed | Check `.env` password, database name `minisearch`, PostgreSQL service running |
| Upload fails "Only PDF and TXT" | Use `.txt` or `.pdf` only |
| Upload fails "No indexable content" | File has no real words (only stopwords) |
| Empty search results | Upload a document first; use words that exist in the file |
| `minisearch.db` not found | Normal before first run; created after backend starts |

### Check PostgreSQL is running (Windows)

```powershell
Get-Service -Name postgresql*
```

Start if stopped:

```powershell
Start-Service postgresql-x64-16
```

(Replace `16` with your version.)

---

## Quick Checklist

```
[ ] Python venv created and activated
[ ] pip install -r requirements.txt
[ ] (Optional) PostgreSQL database "minisearch" created
[ ] (Optional) backend/.env configured
[ ] python main.py → running on :8000
[ ] npm install && npm run dev → running on :5173
[ ] /api/health returns {"status":"ok"}
[ ] Upload test-doc.txt succeeds
[ ] Search "python" returns results + timing
[ ] Algorithm Lab shows speedup
[ ] Restart backend → index reconstructs
[ ] pytest tests/ -v → 33 passed
```

---

## Recommended path

1. **Start with SQLite** (no DB setup) — get everything working in ~10 minutes
2. **Switch to PostgreSQL** when ready for demo/viva
3. Run the **restart test** (Part 6, Test 7) — that is the key success criterion
