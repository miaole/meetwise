-- 0087_qbank_control_definer_corpus_dependency.sql
--
-- 0086 extends the immutable question-artifact trigger with reviewed metadata.
-- Under the documented low-privilege deployment shape that trigger runs as an
-- isolated NOLOGIN owner with FORCE RLS still enabled.  Its reads of the
-- curator predicate and corpus fact chain (source -> pool -> chunk) must
-- therefore be part of the same owner/policy manifest.  Leaving one relation
-- with the migration owner lets a catalog gate appear healthy while a real
-- control executor fails artifact ingest at runtime.
--
-- This migration deliberately does not ALTER OWNER.  A deployment operator
-- must transfer the exact manifest to a dedicated owner and the startup gate
-- rejects every other shape; silently assigning it to the migrator would turn
-- a DDL credential into an undisclosed long-lived capability.

-- This invoker helper is called by the immutable artifact trigger while its
-- isolated owner is subject to FORCE RLS.  Pin its lookup path and ACL rather
-- than inheriting the migration session's path or PUBLIC execution grant.
CREATE OR REPLACE FUNCTION qbank_is_curator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM qbank_curator
     WHERE user_id = current_setting('app.principal_user', true)
  )
$$;
REVOKE ALL ON FUNCTION qbank_is_curator() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_is_curator() TO app_role, qbank_control_executor;

CREATE OR REPLACE FUNCTION qbank_is_generation_control_definer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT current_user IN (
    SELECT pg_get_userbyid(proowner)
      FROM pg_proc
     WHERE oid IN (
       'qbank_generation_chunk_only_building()'::regprocedure,
       'qbank_prepare_generation_partition(text)'::regprocedure,
       'qbank_validate_generation(text)'::regprocedure,
       'qbank_activate_generation(text)'::regprocedure,
       'qbank_mark_generation_failed(text,text)'::regprocedure,
       'qbank_pool_requires_approved()'::regprocedure,
       'qbank_chunk_requires_approved_pool()'::regprocedure,
       'qbank_question_chunk_requires_visible_source()'::regprocedure,
       'qbank_question_artifact_guard()'::regprocedure,
       'qbank_question_chunk_artifact_guard()'::regprocedure,
       'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
     )
  )
$$;
REVOKE ALL ON FUNCTION qbank_is_generation_control_definer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_is_generation_control_definer() TO app_role, qbank_control_executor;

-- These are row policies, not grants.  The only additional effective reader
-- is the common NOLOGIN owner (which owns the exact relations below); app
-- runtime roles remain unable to issue raw SELECT because 0067 revoked their
-- relation privileges.
DROP POLICY IF EXISTS p_qbank_source_control_definer ON qbank_source;
CREATE POLICY p_qbank_source_control_definer ON qbank_source FOR SELECT TO PUBLIC
  USING (qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_pool_control_definer ON qbank_pool_entry;
CREATE POLICY p_qbank_pool_control_definer ON qbank_pool_entry FOR SELECT TO PUBLIC
  USING (qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_chunk_control_definer ON qbank_chunk;
CREATE POLICY p_qbank_chunk_control_definer ON qbank_chunk FOR SELECT TO PUBLIC
  USING (qbank_is_generation_control_definer());

-- Do not make the isolated trigger owner a reader of the public retrieval
-- view.  That view intentionally has a separate runtime-facing ownership
-- boundary.  The trigger needs the same integrity predicate, not the view's
-- capability, so evaluate the approved source/pool/chunk chain directly
-- under the exact corpus policies above.
CREATE OR REPLACE FUNCTION qbank_question_chunk_requires_visible_source()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM qbank_chunk ch
      JOIN qbank_pool_entry p
        ON p.ref_id=ch.ref_id
       AND p.source_id=ch.source_id
       AND p.content_hash=ch.content_hash
      JOIN qbank_source s
        ON s.id=p.source_id
       AND s.status='approved'
       AND s.content_hash=p.content_hash
     WHERE ch.ref_id=NEW.ref_id
       AND (
         p.content_hash=left(encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'), 32)
         OR p.content_hash=encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex')
       )
  ) THEN
    RAISE EXCEPTION 'qbank_question_chunk_requires_visible_source' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_question_chunk_requires_visible_source() FROM PUBLIC, app_role;
