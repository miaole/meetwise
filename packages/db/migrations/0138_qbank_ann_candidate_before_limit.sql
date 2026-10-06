-- 0138_qbank_ann_candidate_before_limit.sql
--
-- GAP-RAG-03 · R3 filter-locus（Line AN-RAG-R3 · harness
-- ai-docs/delivery/harness/gap-rag-03-r3-filter-locus.md §4.1 C-1）.
--
-- Defect D-ANN-1 (0106:84-91): `qbank_generation_ann_search` applied the
-- approved-source predicate (`JOIN qbank_retrieval_candidate`) AFTER the inner
-- `ORDER BY g.embedding <=> p_embedding LIMIT greatest(k*8,40)`.  When 40+
-- visible-but-unapproved in-scope rows are nearer than every approved row, the
-- inner LIMIT is exhausted by rows the outer JOIN then drops -> Top-K
-- starvation (K=5 returns 0).  That is a post-Top-K filter, which the R3 ADR
-- (PG-retained; Ban Qdrant payload filter / app-layer post-Top-K / MySQL
-- FULLTEXT) forbids.
--
-- Fix: the ONLY change versus 0106:62-91 is that the candidate JOIN moves into
-- the `ann` CTE, directly after the `qbank_generation_chunk` JOIN, so every hard
-- filter (active generation · visible · scope/taxonomy GUC · approved source)
-- is a WHERE/JOIN predicate BEFORE the inner ORDER BY / LIMIT.  The outer query
-- keeps `ORDER BY a.dist LIMIT k`.
--
-- Signature / RETURNS / LANGUAGE sql STABLE SECURITY DEFINER /
-- `SET search_path = public, pg_temp` are byte-identical to 0106:55-61;
-- CREATE OR REPLACE keeps owner/ACL, so
-- `QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST` is unchanged (same mechanism as the
-- 0106 header :14-21).  Lexical / distances functions, HNSW index,
-- hnsw.ef_search and hnsw.iterative_scan are deliberately untouched
-- (R3-HNSW-COMPLETENESS stays OPEN).  GAP-RAG-03 stays OPEN.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

CREATE OR REPLACE FUNCTION qbank_generation_ann_search(p_generation text, p_embedding vector, p_k integer)
RETURNS TABLE(ref_id text, distance double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH requested AS (
    SELECT greatest(1, least(coalesce(p_k, 1), 50))::integer AS k
  ), active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), ann AS (
    SELECT g.ref_id, g.embedding <=> p_embedding AS dist
      FROM active a
      JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.visible
      JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id
     WHERE (
            (NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NULL
             AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NULL)
            OR (
              NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
              AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
              AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
              AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
            )
          )
     ORDER BY g.embedding <=> p_embedding
     LIMIT (SELECT greatest(k * 8, 40) FROM requested)
  )
  SELECT a.ref_id, a.dist::double precision
    FROM ann a
   ORDER BY a.dist
   LIMIT (SELECT k FROM requested)
$$;
