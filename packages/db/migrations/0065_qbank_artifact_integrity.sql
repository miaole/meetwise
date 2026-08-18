-- 0065_qbank_artifact_integrity.sql
--
-- A published qbank question is an immutable composite artifact.  Prior
-- migrations made every *required* part visible at read time, but an optional
-- mapped part could be revoked and the reader would return a silently partial
-- artifact.  They also relied on application code to keep pool/source hashes
-- aligned.  This migration makes those conditions database invariants.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';

CREATE OR REPLACE FUNCTION qbank_pool_requires_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  source_hash text;
  source_status text;
BEGIN
  SELECT content_hash, status INTO source_hash, source_status
    FROM qbank_source
   WHERE id=NEW.source_id;
  IF source_status IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'qbank_pool_source_not_approved' USING ERRCODE='check_violation';
  END IF;
  IF source_hash IS DISTINCT FROM NEW.content_hash THEN
    RAISE EXCEPTION 'qbank_pool_source_content_hash_mismatch' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_pool_requires_approved() FROM PUBLIC, app_role;

CREATE OR REPLACE FUNCTION qbank_chunk_requires_approved_pool()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM qbank_pool_entry p
      JOIN qbank_source s ON s.id=p.source_id
     WHERE p.ref_id=NEW.ref_id
       AND p.source_id=NEW.source_id
       AND p.content_hash=NEW.content_hash
       AND s.content_hash=NEW.content_hash
       AND s.status='approved'
  ) THEN
    RAISE EXCEPTION 'qbank_chunk_requires_matching_approved_pool_source' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_chunk_requires_approved_pool() FROM PUBLIC, app_role;

CREATE OR REPLACE FUNCTION qbank_question_artifact_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP='DELETE' THEN
    RAISE EXCEPTION 'qbank_question_published_artifact_delete_forbidden' USING ERRCODE='check_violation';
  END IF;

  IF TG_OP='INSERT' THEN
    IF NEW.state <> 'draft' THEN
      RAISE EXCEPTION 'qbank_question_must_start_draft' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.artifact_hash IS DISTINCT FROM OLD.artifact_hash
     OR NEW.competency IS DISTINCT FROM OLD.competency
     OR NEW.difficulty IS DISTINCT FROM OLD.difficulty THEN
    RAISE EXCEPTION 'qbank_question_artifact_immutable' USING ERRCODE='check_violation';
  END IF;
  IF OLD.state='draft' AND NEW.state='published' THEN
    IF NOT EXISTS (
      SELECT 1
        FROM qbank_question_chunk qc
       WHERE qc.question_id=NEW.id AND qc.role='prompt' AND qc.required
    ) OR NOT EXISTS (
      SELECT 1
        FROM qbank_question_chunk qc
       WHERE qc.question_id=NEW.id AND qc.role='rubric' AND qc.required
    ) THEN
      RAISE EXCEPTION 'qbank_question_publish_requires_required_prompt_and_rubric' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'qbank_question_state_immutable_after_publish' USING ERRCODE='check_violation';
END;
$$;
REVOKE ALL ON FUNCTION qbank_question_artifact_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_question_artifact_guard ON qbank_question;
CREATE TRIGGER trg_qbank_question_artifact_guard
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_question
  FOR EACH ROW EXECUTE FUNCTION qbank_question_artifact_guard();

CREATE OR REPLACE FUNCTION qbank_question_chunk_artifact_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  question_state text;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'qbank_question_chunk_artifact_immutable' USING ERRCODE='check_violation';
  END IF;
  SELECT state INTO question_state FROM qbank_question WHERE id=NEW.question_id;
  -- PostgreSQL executes BEFORE INSERT triggers before ON CONFLICT resolution.
  -- Permit only the exact idempotent re-insert that the application will then
  -- skip; a new or altered mapping on a published receipt remains forbidden.
  IF question_state='published' THEN
    IF EXISTS (
      SELECT 1 FROM qbank_question_chunk
       WHERE question_id=NEW.question_id
         AND ref_id=NEW.ref_id
         AND role=NEW.role
         AND ordinal=NEW.ordinal
         AND required=NEW.required
    ) THEN
      RETURN NULL;
    END IF;
    RAISE EXCEPTION 'qbank_question_chunk_requires_draft_question' USING ERRCODE='check_violation';
  END IF;
  IF question_state IS DISTINCT FROM 'draft' THEN
    RAISE EXCEPTION 'qbank_question_chunk_requires_draft_question' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_question_chunk_artifact_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_question_chunk_artifact_guard ON qbank_question_chunk;
CREATE TRIGGER trg_qbank_question_chunk_artifact_guard
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_question_chunk
  FOR EACH ROW EXECUTE FUNCTION qbank_question_chunk_artifact_guard();

CREATE OR REPLACE FUNCTION qbank_generation_question_evidence(
  p_generation text, p_hit_refs text[], p_chars integer
) RETURNS TABLE(question_id text, hit_rank integer, evidence jsonb)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH hit AS (
    SELECT u.ref_id, u.ord::integer AS hit_rank
      FROM unnest(p_hit_refs) WITH ORDINALITY AS u(ref_id, ord)
  ), selected AS (
    SELECT qc.question_id, min(h.hit_rank) AS hit_rank
      FROM hit h
      JOIN qbank_question_chunk qc ON qc.ref_id=h.ref_id
      JOIN qbank_question q ON q.id=qc.question_id AND q.state='published'
     GROUP BY qc.question_id
  ), expected AS (
    SELECT question_id, count(*)::integer AS mapped_count
      FROM qbank_question_chunk
     GROUP BY question_id
  ), all_parts AS (
    SELECT s.question_id, s.hit_rank, qc.ref_id, qc.role, qc.ordinal, qc.required,
           left(ch.content, greatest(1, least(p_chars, 800))) AS excerpt
      FROM selected s
      JOIN qbank_question_chunk qc ON qc.question_id=s.question_id
      JOIN qbank_generation_chunk g ON g.generation_id=p_generation AND g.ref_id=qc.ref_id AND g.visible
      JOIN qbank_chunk ch ON ch.ref_id=qc.ref_id
      JOIN qbank_retrieval_candidate rc ON rc.ref_id=ch.ref_id AND rc.content_hash=ch.content_hash
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
  SELECT c.question_id, c.hit_rank, c.evidence
    FROM complete c
    JOIN expected e ON e.question_id=c.question_id
   WHERE c.returned_count=e.mapped_count
     AND c.prompt_count=1
     AND c.rubric_count>=1
     AND c.required_count>=2
   ORDER BY c.hit_rank, c.question_id
$$;
REVOKE ALL ON FUNCTION qbank_generation_question_evidence(text,text[],integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_question_evidence(text,text[],integer) TO app_role;
