# 🔎 MiniSearch

<div align="center">

🚀 **Full-Stack Streaming Search Engine with Incremental Indexing**

<br/>

<p><b>A DSA + DBMS + Full-Stack project for maintaining fast search over continuously changing documents.</b></p>

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge\&logo=python\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge\&logo=postgresql\&logoColor=white)
![DSA](https://img.shields.io/badge/Custom-DSA-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Academic%20Project-blue?style=for-the-badge)

<br/>

[Overview](#-overview) · [Features](#-features) · [Architecture](#-architecture) · [DSA](#-data-structures--algorithms) · [Tech Stack](#-technology-stack) · [Setup](#-setup) · [API](#-api-endpoints) · [Benchmarks](#-algorithm-lab) · [Future Scope](#-future-scope)

</div>

---

# 🧠 Overview

**MiniSearch** is a full-stack document search system that explores how search indexes can remain **fast and responsive while documents are continuously inserted, updated, and deleted**.

Instead of rebuilding the complete inverted index after every document change, MiniSearch uses **incremental index maintenance** to update only the posting structures affected by the changed document.

The project combines:

* 🧠 **Data Structures & Algorithms**
* 🗄️ **Database Management**
* ⚡ **Incremental Indexing**
* 🔍 **Document Search**
* 🌐 **Full-Stack Web Development**
* 📊 **Performance Benchmarking**

### 🎯 Core Research Question

> **Can incremental indexing reduce update work compared with rebuilding the entire inverted index after every change?**

MiniSearch measures this experimentally through a controlled comparison between **full index rebuilding** and **incremental index updates**.

---

# ✨ Features

## 🔍 Search & Indexing

| Feature                    | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| ⚡ **Incremental Indexing** | Updates only affected posting lists when documents change |
| 📄 **PDF / TXT Support**   | Upload and index document content                         |
| 🔎 **Full-Text Search**    | Search indexed documents using query terms                |
| 🔄 **Document Updates**    | Remove old postings and insert new document terms         |
| 🗑️ **Document Deletion**  | Remove affected document IDs from posting structures      |
| 📊 **Search Timing**       | Displays phase-by-phase search performance                |
| 🏆 **Top-K Ranking**       | Uses a heap to efficiently select top results             |

The document pipeline follows:

```text
Upload
   ↓
Validation
   ↓
Text Extraction
   ↓
Normalization
   ↓
Tokenization
   ↓
Inverted Index
   ↓
Candidate Retrieval
   ↓
Ranking
   ↓
Top-K Results
```

---

# 🧠 Data Structures & Algorithms

MiniSearch implements custom data structures as the core of its search engine.

## 🗺️ Hash Map — Inverted Index

Maps search terms to their posting lists.

```text
term → posting list
```

**Expected lookup:** `O(1)`

Used for fast term-based access to indexed documents.

---

## 🔗 Skip List — Posting Lists

Skip Lists maintain ordered document postings while supporting dynamic operations.

**Expected complexity:**

```text
Search   → O(log n)
Insert   → O(log n)
Delete   → O(log n)
```

Higher levels allow the structure to skip over multiple nodes during traversal.

MiniSearch uses a Skip List because it provides a dynamic ordered structure that is relatively straightforward to implement and explain compared with a full B-Tree.

---

## 🏆 Heap — Top-K Ranking

A heap is used to efficiently select the best `K` candidates instead of fully sorting every candidate.

Approximate complexity:

```text
O(C log K)
```

where `C` represents the number of candidates.

The project treats these as **algorithmic expectations, not guaranteed wall-clock timings**.

---

# 🔄 Incremental Index Maintenance

One of the main concepts behind MiniSearch is updating the index without rebuilding everything.

### ➕ Insert

```text
Document arrives
      ↓
Extract terms
      ↓
Find / create postings
      ↓
Insert document ID
      ↓
Persist operation
```

### ✏️ Update

```text
Old version
     ↓
Remove old postings
     ↓
Insert new postings
     ↓
Preserve version history
```

### 🗑️ Delete

```text
Document
    ↓
Find affected terms
    ↓
Remove document ID
    ↓
Record operation
    ↓
Exclude from future results
```

Only the posting structures affected by the changed document are modified.

---

# 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │  React Frontend  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  FastAPI REST API│
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
      ┌─────────────────┐          ┌─────────────────┐
      │   Custom DSA    │          │   PostgreSQL    │
      │     Engine      │          │                 │
      ├─────────────────┤          ├─────────────────┤
      │ Hash Map        │          │ Documents       │
      │ Inverted Index  │          │ Users           │
      │ Skip List       │          │ Versions        │
      │ Heap / Top-K    │          │ Terms           │
      │ Ranking         │          │ Operations      │
      └─────────────────┘          │ Search History │
                                   │ Benchmarks      │
                                   └─────────────────┘
```

The architecture separates the **fast active retrieval structure** from the **persistent relational database state**. PostgreSQL acts as the durable source of truth, while the in-memory DSA structures support fast retrieval.

---

# 🔎 Search Execution

A search request follows this process:

```text
Query
  ↓
Normalize
  ↓
Hash Lookup
  ↓
Posting Lists
  ↓
Candidate Generation
  ↓
Scoring
  ↓
Top-K Heap
  ↓
Results
```

The basic scoring approach can combine:

* Term frequency
* Query-term coverage
* Title match

Search timing can separately track:

```text
DSA Time
Database Time
Total API Time
```

This helps distinguish algorithmic retrieval work from database/I/O overhead.

---

# 🗄️ Database Design

PostgreSQL stores the persistent state of the system.

Key areas include:

* 👤 Users
* 📄 Documents
* 🔄 Document Versions
* 🔤 Terms
* 🔗 Document Terms
* 📝 Operations
* 🔎 Search History
* 📊 Benchmark Data

```text
PostgreSQL
     │
     ├── Users
     ├── Documents
     ├── Versions
     ├── Terms
     ├── Document Terms
     ├── Operations
     ├── Search History
     └── Benchmarks
```

PostgreSQL provides durable persistence while the custom DSA engine provides the active search structure.

---

# 🧪 Algorithm Lab

MiniSearch includes a controlled benchmark comparing two approaches.

### Baseline — Full Index Rebuild

```text
Dataset
   ↓
Rebuild complete index
   ↓
Measure
```

### MiniSearch — Incremental Update

```text
Dataset
   ↓
Identify affected terms
   ↓
Update affected postings
   ↓
Measure
```

The benchmark can evaluate:

| Metric             | Purpose                          |
| ------------------ | -------------------------------- |
| 📄 Documents       | Dataset size                     |
| ⏱️ Update Time     | Time required to process updates |
| 🔎 Search Latency  | Search response performance      |
| 📋 Candidate Count | Number of retrieved candidates   |
| 📊 Result Count    | Number of returned results       |
| 🧠 DSA Time        | Time spent in data structures    |
| 💾 Memory          | Memory consumption               |
| ✅ Correctness      | Result/index correctness         |

The project does **not assume the outcome beforehand**; the benchmark is intended to measure whether incremental maintenance reduces update work.

---

# 🛠️ Technology Stack

## Frontend

* React 18
* Vite
* TailwindCSS
* GSAP
* Recharts

## Backend

* Python
* FastAPI
* SQLAlchemy

## Database

* PostgreSQL
* SQLAlchemy ORM

## Data Structures

* Hash Map
* Inverted Index
* Skip List
* Heap / Top-K

## Document Processing

* PDF extraction
* TXT processing
* Text normalization
* Tokenization

---

# 📁 Project Structure

```text
MiniSearchEngine/
│
├── backend/
│   ├── app/
│   │   ├── dsa/
│   │   │   ├── SkipList
│   │   │   ├── InvertedIndex
│   │   │   ├── Ranker
│   │   │   └── Tokenizer
│   │   │
│   │   ├── api/
│   │   │   └── REST routes
│   │   │
│   │   ├── services/
│   │   │   └── business logic
│   │   │
│   │   └── models/
│   │       └── database models
│   │
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── database/
│   └── init.sql
│
├── SETUP.md
└── README.md
```

---

# ⚙️ Setup

## 1. Clone Repository

```bash
git clone https://github.com/Jatin021-22/MiniSearch.git
cd MiniSearch
```

---

## 2. Backend Setup

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/minisearch
```

> Never commit your `.env` file or database credentials to GitHub.

---

## 3. Database Setup

Make sure PostgreSQL is running.

Create the database:

```sql
CREATE DATABASE minisearch;
```

Then execute the project's database initialization script:

```text
database/init.sql
```

For the complete database setup and testing walkthrough, see **[SETUP.md](SETUP.md)**.

---

## 4. Start Backend

```bash
cd backend
python main.py
```

The API will be available at:

```text
http://localhost:8000
```

---

## 5. Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

# 🔌 API Endpoints

| Method   | Endpoint                | Description              |
| -------- | ----------------------- | ------------------------ |
| `POST`   | `/api/documents/upload` | Upload PDF/TXT document  |
| `GET`    | `/api/search?q=keyword` | Search indexed documents |
| `PUT`    | `/api/documents/{id}`   | Update a document        |
| `DELETE` | `/api/documents/{id}`   | Delete a document        |
| `GET`    | `/api/index/stats`      | View index statistics    |
| `POST`   | `/api/benchmarks/run`   | Run benchmark            |
| `GET`    | `/api/benchmarks`       | View benchmark history   |
| `GET`    | `/api/health`           | API health check         |

---

# 🧪 Testing

Run the backend tests:

```bash
cd backend
pytest tests/ -v
```

Testing covers areas such as:

* Skip List operations
* Inverted Index operations
* Upload → Search integration
* Update/Delete correctness
* Benchmark validation
* Recovery / reconstruction

---

# 💡 Design Decisions

### Why Incremental Indexing?

Instead of rebuilding the complete index after every document change, MiniSearch identifies affected terms and updates only their posting structures.

### Why Skip List?

Skip Lists provide dynamically ordered posting lists with expected logarithmic search, insertion, and deletion operations.

### Why Hash Map?

A hash map provides fast average-case lookup from a search term to its posting list.

### Why Heap?

A heap allows MiniSearch to select the best `K` candidates without fully sorting every candidate.

### Why PostgreSQL?

PostgreSQL provides persistent relational storage and acts as the durable source of truth for the system.

---

# 📊 Project Goals

MiniSearch investigates whether an incrementally maintained search index can:

* Reduce unnecessary update work
* Maintain correct search results
* Support continuously changing documents
* Provide measurable search and update timings
* Combine custom DSA with persistent database storage
* Demonstrate the practical relationship between DSA, DBMS, and full-stack development

---

# 🚀 Future Scope

Potential extensions include:

* 🌳 B-Tree comparison
* 🔤 Trie-based indexing
* ✏️ Typo correction
* 📊 TF-IDF ranking
* 🔎 BM25 ranking
* 💾 Index snapshots
* ⚙️ Background indexing
* 📈 Extended benchmark analysis

These are planned/future extensions rather than core features of the current implementation.

---

# 🎓 Academic Context

**MiniSearch** is a DSA + DBMS + Full-Stack academic project focused on:

> **Incremental Search Index Maintenance for Continuously Changing Documents**

The project demonstrates how custom data structures, database persistence, indexing algorithms, and a modern web interface can be combined into a working search system.

---

# 🤝 Contributing

Contributions and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the changes
5. Submit a pull request

---

# 📄 License

This project is available under the **MIT License**.

---

---

<div align="center">

⭐ **If you find MiniSearch interesting, consider giving the repository a star!**

</div>
