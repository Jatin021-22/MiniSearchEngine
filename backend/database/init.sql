-- MiniSearch PostgreSQL schema (also managed by SQLAlchemy)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500),
  filename VARCHAR(255),
  owner_id INT REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active',
  file_hash VARCHAR(64) UNIQUE,
  content_preview TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS terms (
  id SERIAL PRIMARY KEY,
  term VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS document_terms (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id) ON DELETE CASCADE,
  term_id INT REFERENCES terms(id) ON DELETE CASCADE,
  frequency INT DEFAULT 1,
  positions TEXT,
  UNIQUE(document_id, term_id)
);

CREATE TABLE IF NOT EXISTS index_operations (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id),
  operation VARCHAR(50),
  affected_terms INT,
  duration_ms FLOAT,
  status VARCHAR(50) DEFAULT 'success',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_history (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  query VARCHAR(500),
  result_count INT,
  latency_ms FLOAT,
  tokenization_ms FLOAT,
  index_lookup_ms FLOAT,
  candidate_collection_ms FLOAT,
  scoring_ms FLOAT,
  ranking_ms FLOAT,
  db_fetch_ms FLOAT,
  dsa_time_ms FLOAT,
  total_ms FLOAT,
  candidate_count INT,
  dataset_size INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_timing ON search_history(total_ms DESC);
CREATE INDEX IF NOT EXISTS idx_search_date ON search_history(created_at DESC);

CREATE TABLE IF NOT EXISTS benchmarks (
  id SERIAL PRIMARY KEY,
  method VARCHAR(50),
  dataset_size INT,
  operation VARCHAR(50),
  duration_ms FLOAT,
  memory_mb FLOAT,
  affected_terms INT,
  created_at TIMESTAMP DEFAULT NOW()
);
