-- 0067_qbank_control_plane_read_boundary.sql
--
-- 0066 moved qbank writes to a dedicated executor, but three escalation paths
-- remained: a previously polluted executor role could retain privilege, an
-- app runtime could forge the old curator GUC to read raw corpus rows, and a
-- caller could invoke SECURITY DEFINER retrieval functions against a retired
-- generation.  This migration makes the public data-plane an explicit,
-- bounded API: active-generation metadata plus active-generation search and
-- evidence only.  Raw source/chunk/artifact tables stay control-plane only.

-- Repair a role that was created or manually altered before this migration.
-- `NOINHERIT` is not enough: an inherited dangerous role can still be entered
-- explicitly with SET ROLE.  The executor itself must therefore have no role
-- memberships at all.
ALTER ROLE qbank_control_executor NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB
  NOCREATEROLE NOREPLICATION NOBYPASSRLS;
-- Application identities never create public-schema objects.  Leaving the
-- PostgreSQL default PUBLIC CREATE grant would let a mis-mounted control
-- credential create shadow objects despite its role attributes.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

DO $$
DECLARE granted_role text;
BEGIN
  FOR granted_role IN
    SELECT parent.rolname
      FROM pg_auth_members membership
      JOIN pg_roles parent ON parent.oid=membership.roleid
      JOIN pg_roles member ON member.oid=membership.member
     WHERE member.rolname='qbank_control_executor'
  LOOP
    EXECUTE format('REVOKE %I FROM qbank_control_executor', granted_role);
  END LOOP;
END $$;

-- Request roles must never read the controlled corpus directly.  In
-- particular, `qbank_is_curator()` is legacy, GUC-based routing context and
-- cannot be an authorization root for raw source/chunk reads.
REVOKE SELECT ON qbank_source, qbank_pool_entry, qbank_chunk,
  qbank_embedding_recipe, qbank_vector_generation, qbank_generation_chunk,
  qbank_question, qbank_question_chunk, qbank_active_generation,
  qbank_corpus_epoch FROM PUBLIC, app_role;
REVOKE SELECT ON qbank_retrieval_candidate FROM PUBLIC, app_role;
REVOKE EXECUTE ON FUNCTION qbank_search_terms(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION qbank_search_terms(text) TO qbank_control_executor;

-- The only metadata a request needs before embedding a query.  It neither
-- exposes retired generations nor falls back to a same-dimension old recipe.
CREATE OR REPLACE FUNCTION qbank_active_generation_metadata()
RETURNS TABLE(generation_id text, recipe_id text)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT a.generation_id, g.recipe_id
    FROM qbank_active_generation a
    JOIN qbank_vector_generation g ON g.id=a.generation_id AND g.state='active'
   WHERE a.singleton=true
$$;
REVOKE ALL ON FUNCTION qbank_active_generation_metadata() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_active_generation_metadata() TO app_role;

-- Every externally executable retrieval/evidence function independently
-- checks the active pointer.  TypeScript continues to check the expected
-- recipe before calling these functions, but a direct SQL caller now cannot
-- resurrect a retired/building generation.  Bounds are also in SQL so a
-- caller cannot turn an oversized p_k/refs array into unbounded work.
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
