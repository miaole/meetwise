-- 0072_qbank_question_evidence_definer_rls.sql
--
-- 0071 added FORCE RLS policies for immutable question artifacts, but the
-- public bounded reader `qbank_generation_question_evidence` also runs as
-- SECURITY DEFINER.  A deployment that correctly moves the eight writer
-- functions and seven tables to the isolated owner while leaving this reader
-- with a different migration owner would make every complete question package
-- disappear or error at read time.  Keep it in the same reviewed owner set;
-- worker startup verifies the complete set before it can schedule a rebuild.

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
       'qbank_question_chunk_artifact_guard()'::regprocedure,
       'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
     )
  )
$$;
REVOKE ALL ON FUNCTION qbank_is_generation_control_definer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_is_generation_control_definer() TO app_role, qbank_control_executor;
