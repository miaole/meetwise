-- 0071_qbank_artifact_control_definer_rls.sql
--
-- 0070 made low-privilege generation SECURITY DEFINER functions usable under
-- FORCE RLS.  The same owner shape also executes the three immutable question
-- artifact trigger functions.  Without their exact owners in the predicate,
-- a non-superuser deployment can build an empty generation but fails when it
-- links a newly approved prompt/rubric to its question artifact.  That is a
-- data-plane availability failure, not a test-only ownership detail.
--
-- The worker's catalog gate requires all listed writers and their seven
-- control tables to share one NOLOGIN/NOINHERIT/NOSUPERUSER/NOBYPASSRLS role.
-- This migration only expresses the RLS half of that invariant; it never
-- silently transfers ownership to an arbitrary migration account.

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
       'qbank_question_chunk_requires_visible_source()'::regprocedure,
       'qbank_question_artifact_guard()'::regprocedure,
       'qbank_question_chunk_artifact_guard()'::regprocedure
     )
  )
$$;
REVOKE ALL ON FUNCTION qbank_is_generation_control_definer() FROM PUBLIC;
-- RLS evaluates all permissive policies, so these two non-owner invokers need
-- EXECUTE only to calculate the boolean.  They receive no table privilege and
-- the function returns false for both roles.
GRANT EXECUTE ON FUNCTION qbank_is_generation_control_definer() TO app_role, qbank_control_executor;

ALTER TABLE qbank_question FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_question_chunk FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_qbank_question_control_definer ON qbank_question;
CREATE POLICY p_qbank_question_control_definer ON qbank_question FOR ALL TO PUBLIC
  USING (qbank_is_generation_control_definer())
  WITH CHECK (qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_question_chunk_control_definer ON qbank_question_chunk;
CREATE POLICY p_qbank_question_chunk_control_definer ON qbank_question_chunk FOR ALL TO PUBLIC
  USING (qbank_is_generation_control_definer())
  WITH CHECK (qbank_is_generation_control_definer());
