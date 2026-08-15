-- 0089_qbank_taxonomy_definer_manifest.sql
--
-- The 0086 taxonomy release/scope/manifest guards are part of the QBank
-- integrity boundary.  They must share the same dedicated NOLOGIN owner as
-- the generation and artifact guard functions: otherwise a migration-role
-- owner can replace a taxonomy guard after the worker startup catalog check
-- has accepted the rest of the manifest.  Ownership transfer itself is
-- performed by the explicit deploy-time provisioner, never by this migration
-- account; that provisioner is required to hand off the complete manifest and
-- then verify it through the low-privilege control login.

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
       'qbank_generation_question_evidence(text,text[],integer)'::regprocedure,
       'qbank_taxonomy_release_guard()'::regprocedure,
       'qbank_taxonomy_scope_guard()'::regprocedure,
       'qbank_taxonomy_manifest_hash(text)'::regprocedure,
       'qbank_chunk_serving_scope_guard()'::regprocedure
     )
  )
$$;
REVOKE ALL ON FUNCTION qbank_is_generation_control_definer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_is_generation_control_definer() TO app_role, qbank_control_executor;
