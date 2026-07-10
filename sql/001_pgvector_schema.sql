-- Autonomous Self-Evolving AI Orchestrator — Supabase / Postgres + pgvector
-- Run this in the Supabase SQL Editor once after creating your project.
-- Embedding dim defaults to 384 (all-MiniLM-L6-v2 / hashing fallback).

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Core memory nodes (vectorized interactions, facts, lessons, tool results)
CREATE TABLE IF NOT EXISTS memory_nodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content         TEXT NOT NULL,
    content_type    TEXT NOT NULL DEFAULT 'interaction',
    -- interaction | tool_result | fact | preference | correction | lesson | search
    embedding       vector(384),
    importance      DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    emotional_weight DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    -- -1.0 .. 1.0 (negative = aversive / correction pressure)
    temporal_weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    forgotten       BOOLEAN NOT NULL DEFAULT FALSE,
    session_id      TEXT,
    source          TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_memory_nodes_created
    ON memory_nodes (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_nodes_type
    ON memory_nodes (content_type);

CREATE INDEX IF NOT EXISTS idx_memory_nodes_forgotten
    ON memory_nodes (forgotten)
    WHERE forgotten = FALSE;

-- IVFFlat index for cosine similarity (build after you have some rows)
-- CREATE INDEX IF NOT EXISTS idx_memory_nodes_embedding
--     ON memory_nodes USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_memory_nodes_embedding_hnsw
    ON memory_nodes USING hnsw (embedding vector_cosine_ops);

-- Directed relationships between memories (synaptic graph)
CREATE TABLE IF NOT EXISTS memory_edges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_id     UUID NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
    to_id       UUID NOT NULL REFERENCES memory_nodes(id) ON DELETE CASCADE,
    relation    TEXT NOT NULL DEFAULT 'related',
    -- related | supports | contradicts | derived_from | about_user
    weight      DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (from_id, to_id, relation)
);

CREATE INDEX IF NOT EXISTS idx_memory_edges_from ON memory_edges (from_id);
CREATE INDEX IF NOT EXISTS idx_memory_edges_to ON memory_edges (to_id);

-- Append-only interaction / evolution logs (scanned by nightly cron)
CREATE TABLE IF NOT EXISTS interaction_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  TEXT,
    role        TEXT NOT NULL,
    content     TEXT NOT NULL,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interaction_logs_created
    ON interaction_logs (created_at DESC);

-- Baseline lessons written by Self-Correction phase
CREATE TABLE IF NOT EXISTS core_lessons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson      TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'general',
    confidence  DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    source_run  TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evolution run audit trail
CREATE TABLE IF NOT EXISTS evolution_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at     TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'running',
    phase_results   JSONB NOT NULL DEFAULT '{}'::jsonb,
    error           TEXT
);

-- Semantic search RPC used by the Python client
CREATE OR REPLACE FUNCTION match_memory_nodes(
    query_embedding vector(384),
    match_count int DEFAULT 8,
    min_importance float DEFAULT 0.0,
    include_forgotten boolean DEFAULT false
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    content_type TEXT,
    importance DOUBLE PRECISION,
    emotional_weight DOUBLE PRECISION,
    temporal_weight DOUBLE PRECISION,
    forgotten BOOLEAN,
    session_id TEXT,
    source TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    similarity DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        m.id,
        m.content,
        m.content_type,
        m.importance,
        m.emotional_weight,
        m.temporal_weight,
        m.forgotten,
        m.session_id,
        m.source,
        m.metadata,
        m.created_at,
        (1 - (m.embedding <=> query_embedding))::DOUBLE PRECISION AS similarity
    FROM memory_nodes m
    WHERE m.embedding IS NOT NULL
      AND (include_forgotten OR m.forgotten = FALSE)
      AND m.importance >= min_importance
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
$$;
