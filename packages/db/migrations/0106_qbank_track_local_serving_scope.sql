-- 0106_qbank_track_local_serving_scope.sql
--
-- RAG-FUNNEL-04 / track-local retrieval: the "hard filter happens BEFORE
-- retrieval, never global Top-K then app-layer filter" rule.
--
-- 0097 already turned `qbank_generation_chunk` into a per-(ref, reviewed leaf)
-- projection with NOT NULL `taxonomy_version`/`serving_scope_id`, and its
-- header explicitly deferred "the track-local hard filter that de-duplicates
-- per requested leaf" to RAG-FUNNEL-04.  This migration delivers that filter
-- as a *session-GUC predicate* inside the five existing SECURITY DEFINER
-- retrieval functions, plus the persisted `qbank_retrieval_plan` state machine
-- that freezes which leaf a planner round is allowed to read.
--
-- WHY a GUC predicate inside the existing functions (same signature), and NOT
-- a new parameter or a new function:
--  * principal.ts seals `QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST` (31 functions)
--    and `assertQbankControlDefinerOwnership` fails on any *unexpected*
--    SECURITY DEFINER function in `public`.  Adding a parameter changes the
--    signature and would trip the manifest; adding a helper function adds a
--    SECURITY DEFINER object.  Rewriting only the BODY keeps owner/ACL/
--    `search_path`/signature identical, so the handoff-closure proof stays green.
--  * `app.qbank_serving_scope` / `app.qbank_taxonomy_version` are custom
--    (dotted) GUCs set by TypeScript via `set_config(name, value, true)` inside
--    the same `asPrincipal` transaction, exactly like the established
--    `app.principal_user`.  `current_setting(name, true)` reads them from the
--    session context that survives the SECURITY DEFINER role switch, and
--    returns NULL when unset -- which is the legacy no-filter path, keeping
--    `rag-generation:prove` (which calls retrieval without any scope) green.
--
-- WHY fail-closed: both GUCs unset => legacy no-filter; both set and equal the
-- row's projection leaf => match; EITHER set alone => 0 rows (a half-scoped
-- request must never silently degrade to "all tracks").  A track that does not
-- match the requested leaf therefore returns zero rows *before* ORDER BY/LIMIT,
-- so a chunk that would rank Top-K globally is excluded in the DB, not by an
-- application-side drop after a global Top-K.
--
-- WHY NULLIF(..., ''): after `set_config(name, value, true)` (SET LOCAL) commits
-- on a pooled connection, PostgreSQL registers the custom dotted GUC with an
-- empty-string session placeholder, so `current_setting(name, true)` returns ''
-- rather than NULL on the next transaction that never set it.  A real serving
-- scope / taxonomy version is validated to be non-empty (SERVING_SCOPE_RE /
-- TAXONOMY_VERSION_RE), so treating '' as "unset" is lossless and keeps the
-- legacy no-filter branch reachable across pooled-connection reuse.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- ────────────────────────────────────────────────────────────────────────────
-- 1) Track-local scope predicate, rewritten into the five bounded retrieval
--    readers.  The predicate is inlined (no helper function) so no new public
--    SECURITY DEFINER object is introduced.  `g.taxonomy_version` /
--    `g.serving_scope_id` exist since 0097 (NOT NULL projection facets).
-- ────────────────────────────────────────────────────────────────────────────

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
    JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=a.ref_id
   ORDER BY a.dist
   LIMIT (SELECT k FROM requested)
$$;

CREATE OR REPLACE FUNCTION qbank_generation_lexical_search(p_generation text, p_query text, p_k integer)
RETURNS TABLE(ref_id text, lexical_score double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH requested AS (
    SELECT greatest(1, least(coalesce(p_k, 1), 200))::integer AS k
  ), active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), q AS (
    SELECT plainto_tsquery('simple', qbank_search_terms(left(coalesce(p_query,''), 12000))) AS tsq
  )
  SELECT g.ref_id, ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq)::double precision
    FROM active a
    JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.visible
    JOIN qbank_chunk ch ON ch.ref_id=g.ref_id
    JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id
    CROSS JOIN q
   WHERE q.tsq <> ''::tsquery
     AND to_tsvector('simple', qbank_search_terms(ch.content)) @@ q.tsq
     AND (
            (NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NULL
             AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NULL)
            OR (
              NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
              AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
              AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
              AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
            )
          )
   ORDER BY ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq) DESC, g.ref_id
   LIMIT (SELECT k FROM requested)
$$;

CREATE OR REPLACE FUNCTION qbank_generation_distances(p_generation text, p_embedding vector, p_refs text[])
RETURNS TABLE(ref_id text, distance double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), requested AS (
    SELECT ref_id
      FROM unnest(coalesce(p_refs, ARRAY[]::text[])) WITH ORDINALITY AS input(ref_id, ord)
     ORDER BY ord
     LIMIT 200
  )
  SELECT g.ref_id, (g.embedding <=> p_embedding)::double precision
    FROM active a
    JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.visible
    JOIN requested input ON input.ref_id=g.ref_id
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
$$;

CREATE OR REPLACE FUNCTION qbank_generation_evidence(p_generation text, p_refs text[], p_chars integer)
RETURNS TABLE(ref_id text, excerpt text)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), requested AS (
    SELECT ref_id, ord
      FROM unnest(coalesce(p_refs, ARRAY[]::text[])) WITH ORDINALITY AS input(ref_id, ord)
     ORDER BY ord
     LIMIT 50
  )
  SELECT input.ref_id, left(ch.content, greatest(1, least(coalesce(p_chars, 1), 1200)))
    FROM requested input
    JOIN active a ON true
    JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.ref_id=input.ref_id AND g.visible
    JOIN qbank_chunk ch ON ch.ref_id=g.ref_id
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
   ORDER BY input.ord
$$;

CREATE OR REPLACE FUNCTION qbank_generation_question_evidence(
  p_generation text, p_hit_refs text[], p_chars integer
) RETURNS TABLE(question_id text, hit_rank integer, evidence jsonb)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), hit AS (
    SELECT input.ref_id, input.ord::integer AS hit_rank
      FROM unnest(coalesce(p_hit_refs, ARRAY[]::text[])) WITH ORDINALITY AS input(ref_id, ord)
     ORDER BY input.ord
     LIMIT 50
  ), selected AS (
    SELECT qc.question_id, min(hit.hit_rank) AS hit_rank
      FROM hit
      JOIN qbank_question_chunk qc ON qc.ref_id=hit.ref_id
      JOIN qbank_question q ON q.id=qc.question_id AND q.state='published'
     GROUP BY qc.question_id
  ), expected AS (
    SELECT question_id, count(*)::integer AS mapped_count
      FROM qbank_question_chunk
     GROUP BY question_id
  ), all_parts AS (
    SELECT selected.question_id, selected.hit_rank, qc.ref_id, qc.role, qc.ordinal, qc.required,
           left(ch.content, greatest(1, least(coalesce(p_chars, 1), 800))) AS excerpt
      FROM selected
      JOIN qbank_question_chunk qc ON qc.question_id=selected.question_id
      JOIN active a ON true
      JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.ref_id=qc.ref_id AND g.visible
      JOIN qbank_chunk ch ON ch.ref_id=qc.ref_id
      JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=ch.ref_id AND candidate.content_hash=ch.content_hash
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
  ), complete AS (
    SELECT question_id, min(hit_rank) AS hit_rank,
           count(*)::integer AS returned_count,
           count(*) FILTER (WHERE role='prompt') AS prompt_count,
           count(*) FILTER (WHERE role='rubric') AS rubric_count,
           count(*) FILTER (WHERE required) AS required_count,
           jsonb_agg(jsonb_build_object(
             'refId', ref_id, 'role', role, 'ordinal', ordinal, 'required', required, 'excerpt', excerpt
           ) ORDER BY CASE role
             WHEN 'prompt' THEN 0 WHEN 'rubric' THEN 1 WHEN 'follow_up' THEN 2
             WHEN 'example' THEN 3 WHEN 'anti_pattern' THEN 4 ELSE 5 END, ordinal, ref_id) AS evidence
      FROM all_parts
     GROUP BY question_id
  )
  SELECT complete.question_id, complete.hit_rank, complete.evidence
    FROM complete
    JOIN expected ON expected.question_id=complete.question_id
   WHERE complete.returned_count=expected.mapped_count
     AND complete.prompt_count=1
     AND complete.rubric_count>=1
     AND complete.required_count>=2
   ORDER BY complete.hit_rank, complete.question_id
$$;

REVOKE ALL ON FUNCTION qbank_generation_ann_search(text, vector, integer),
  qbank_generation_lexical_search(text, text, integer),
  qbank_generation_distances(text, vector, text[]),
  qbank_generation_evidence(text, text[], integer),
  qbank_generation_question_evidence(text, text[], integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_ann_search(text, vector, integer),
  qbank_generation_lexical_search(text, text, integer),
  qbank_generation_distances(text, vector, text[]),
  qbank_generation_evidence(text, text[], integer),
  qbank_generation_question_evidence(text, text[], integer) TO app_role;

-- ────────────────────────────────────────────────────────────────────────────
-- 2) Persisted retrieval-plan state machine (RAG-FUNNEL-04 freeze).
--
-- A plan is one planner round for ONE leaf of one immutable route snapshot.
-- The idempotency key `plan_key` is the server-derived digest of the frozen
-- plan content, so a replay of the same round is a no-op (principal-scoped
-- UNIQUE).  Transitions are CAS (`UPDATE … WHERE status=$from`) and audited in
-- `qbank_retrieval_plan_event` with a per-owner monotonic event_seq.  No
-- SECURITY DEFINER function is introduced: transitions live in
-- packages/db/src/qbank-track-local-retrieval.ts under asPrincipal, mirroring
-- 0104's pattern, so principal.ts's sealed manifest stays untouched.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qbank_retrieval_plan (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  snapshot_id text NOT NULL,
  route_scope_digest text NOT NULL CHECK (route_scope_digest ~ '^[0-9a-f]{64}$'),
  leaf_track_id text NOT NULL CHECK (leaf_track_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  competency_id text NOT NULL CHECK (char_length(competency_id) BETWEEN 1 AND 64),
  difficulty integer NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  seniority text CHECK (seniority IS NULL OR char_length(seniority) BETWEEN 1 AND 64),
  question_kind text CHECK (question_kind IS NULL OR char_length(question_kind) BETWEEN 1 AND 64),
  generation_id text NOT NULL CHECK (generation_id ~ '^qgen-[0-9a-f-]{36}$'),
  recipe_id text NOT NULL CHECK (recipe_id ~ '^qrecipe-[0-9a-f]{32}$'),
  policy_version text NOT NULL CHECK (char_length(policy_version) BETWEEN 1 AND 64),
  plan_key text NOT NULL CHECK (plan_key ~ '^[0-9a-f]{64}$'),
  status text NOT NULL CHECK (status IN ('prepared', 'dispatched', 'served', 'recheck_failed', 'superseded')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (owner_user_id, plan_key),
  FOREIGN KEY (snapshot_id) REFERENCES interview_route_snapshot(interview_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3) Plan/recheck outbox (candidate-owned, append-only).  (owner_user_id,
--    event_seq) is monotonic per owner; event_seq is allocated under the same
--    transaction that holds the plan row lock.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qbank_retrieval_plan_event (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  event_seq bigint NOT NULL CHECK (event_seq > 0),
  plan_id text NOT NULL,
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('prepared', 'dispatched', 'served', 'recheck_failed', 'superseded')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, event_seq)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Grants + RLS.  A retrieval plan is candidate-owned (the interview session's
-- principal); app_role gets principal-scoped access and never a role-elevating
-- write path.
-- ────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON qbank_retrieval_plan FROM PUBLIC;
REVOKE ALL ON qbank_retrieval_plan_event FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON qbank_retrieval_plan TO app_role;
GRANT SELECT, INSERT ON qbank_retrieval_plan_event TO app_role;

ALTER TABLE qbank_retrieval_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_retrieval_plan FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_retrieval_plan_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_retrieval_plan_event FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_qbank_retrieval_plan_owner ON qbank_retrieval_plan;
CREATE POLICY p_qbank_retrieval_plan_owner ON qbank_retrieval_plan
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_qbank_retrieval_plan_event_owner ON qbank_retrieval_plan_event;
CREATE POLICY p_qbank_retrieval_plan_event_owner ON qbank_retrieval_plan_event
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
