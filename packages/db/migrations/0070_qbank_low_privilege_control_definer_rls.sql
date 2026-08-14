-- 0070_qbank_low_privilege_control_definer_rls.sql
--
-- The four generation transition functions are SECURITY DEFINER because
-- partition creation needs a schema/table owner while the dedicated control
-- login must remain NOLOGIN/NO-CREATE.  FORCE RLS still applies to a
-- non-superuser function owner, however.  0066 granted the invoker
-- (`qbank_control_executor`) policies only, so a correctly low-privileged
-- function/table owner could be denied while a superuser owner would mask the
-- defect.  Permit only the *current owners of these four exact functions* at
-- the RLS layer.  Raw table grants remain unchanged: request roles cannot use
-- this policy as a direct read or write capability.
--
-- Deployment invariant, exercised by qbank-integrity-upgrade.proof.ts: the
-- four function owners and the five generation-control table owners are the
-- same NOSUPERUSER/NOBYPASSRLS role.  The migration deliberately does not
-- silently transfer ownership: an upgrade with a different DDL authority must
-- be repaired explicitly rather than turning a migration account into an
-- undisclosed permanent privilege path.

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
       'qbank_prepare_generation_partition(text)'::regprocedure,
       'qbank_validate_generation(text)'::regprocedure,
       'qbank_activate_generation(text)'::regprocedure,
       'qbank_mark_generation_failed(text,text)'::regprocedure
     )
  )
$$;
REVOKE ALL ON FUNCTION qbank_is_generation_control_definer() FROM PUBLIC;
-- RLS considers every permissive policy before it can choose the matching
-- one, so both request and control roles need EXECUTE merely to evaluate this
-- boolean predicate.  It returns false for either role and exposes neither
-- table data nor a write capability.
GRANT EXECUTE ON FUNCTION qbank_is_generation_control_definer() TO app_role, qbank_control_executor;

-- Older permissive source policies still call the legacy
-- `qbank_is_curator()` predicate while PostgreSQL assembles the policy OR
-- expression.  The control executor already has the restricted corpus-table
-- grants required to build a generation; it also needs this non-sensitive
-- curator allowlist read so that evaluating those legacy predicates cannot
-- turn an otherwise valid candidate snapshot into a permission error.
GRANT SELECT ON qbank_curator TO qbank_control_executor;

-- Ownership transfer during a low-privilege deployment must not accidentally
-- drop the executor's narrow callable surface.  Reassert the four exact
-- entrypoints; no request role receives EXECUTE here.
REVOKE ALL ON FUNCTION qbank_prepare_generation_partition(text), qbank_validate_generation(text),
  qbank_activate_generation(text), qbank_mark_generation_failed(text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION qbank_prepare_generation_partition(text), qbank_validate_generation(text),
  qbank_activate_generation(text), qbank_mark_generation_failed(text,text) TO qbank_control_executor;

DROP POLICY IF EXISTS p_qbank_generation_control_definer ON qbank_vector_generation;
CREATE POLICY p_qbank_generation_control_definer ON qbank_vector_generation FOR ALL TO PUBLIC
  USING (qbank_is_generation_control_definer())
  WITH CHECK (qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_generation_chunk_control_definer ON qbank_generation_chunk;
CREATE POLICY p_qbank_generation_chunk_control_definer ON qbank_generation_chunk FOR ALL TO PUBLIC
  USING (qbank_is_generation_control_definer())
  WITH CHECK (qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_corpus_epoch_control_definer ON qbank_corpus_epoch;
CREATE POLICY p_qbank_corpus_epoch_control_definer ON qbank_corpus_epoch FOR ALL TO PUBLIC
  USING (qbank_is_generation_control_definer())
  WITH CHECK (qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_active_generation_control_definer ON qbank_active_generation;
CREATE POLICY p_qbank_active_generation_control_definer ON qbank_active_generation FOR ALL TO PUBLIC
  USING (qbank_is_generation_control_definer())
  WITH CHECK (qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_cache_epoch_control_definer ON qbank_cache_epoch;
CREATE POLICY p_qbank_cache_epoch_control_definer ON qbank_cache_epoch FOR ALL TO PUBLIC
  USING (qbank_is_generation_control_definer())
  WITH CHECK (qbank_is_generation_control_definer());
