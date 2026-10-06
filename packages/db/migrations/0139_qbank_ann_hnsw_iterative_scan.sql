-- 0139_qbank_ann_hnsw_iterative_scan.sql
--
-- GAP-RAG-03 · R3-HNSW-COMPLETENESS（Line AQ · harness
-- ai-docs/delivery/harness/aq-gap-rag-03-r3-hnsw-completeness.md CC-H1..CC-H8）.
--
-- After 0138 moved `JOIN qbank_retrieval_candidate` before the inner ORDER BY /
-- LIMIT (filter-locus safety), the planner prefers a candidate-driven nest/merge
-- + Sort on small fixtures and does not take `qgc_hnsw_visible_*`
-- (`HNSW_NOT_EXERCISED`).  When an ordered HNSW path *is* chosen (larger
-- candidate sets, or prove GUCs `enable_seqscan=off` + `enable_sort=off`),
-- pgvector's default `hnsw.iterative_scan=off` stops after one ef_search batch
-- and post-filters — F-STARVE-shaped corpora then under-fill / return 0.
--
-- Fix (minimal): pin `hnsw.iterative_scan=strict_order` on
-- `qbank_generation_ann_search` so filtered HNSW keeps scanning until LIMIT
-- rows pass the candidate/scope predicates, preserving distance order.
-- Function body, signature, SECURITY DEFINER, search_path, and ACL are
-- unchanged from 0138 (ALTER FUNCTION SET only).  Manifest seal accepts
-- additional proconfig entries that still contain the required search_path
-- (principal.ts `@>`).  Ban MySQL FULLTEXT · Ban Qdrant vector truth.
-- GAP-RAG-03 `:71` stays OPEN · coveredCount=8 · NOT_HA · releaseEvidence=false.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

ALTER FUNCTION qbank_generation_ann_search(text, vector, integer)
  SET hnsw.iterative_scan = 'strict_order';
