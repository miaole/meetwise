-- 0098_qbank_active_source_id_executor_grant.sql
--
-- RAG-FUNNEL-01 closed the §6 sealed-manifest handoff, but 0094 §B revoked the
-- dedupe reader `qbank_active_source_id(text)` from PUBLIC and granted EXECUTE
-- only to app_role.  That was a correct request-side seal but an over-broad
-- classification for the *curation* dedup path: `proposeSource`
-- (qbank-curation.ts) resolves an already-active source id for a known exact
-- content_hash under `asQbankControlExecutor`.  Under concurrent identical
-- imports, every losing proposer hits `ON CONFLICT (content_hash) DO NOTHING`
-- (rowCount=0) and then calls `qbank_active_source_id($1)`, which failed with
-- 42501 (permission denied for function qbank_active_source_id) because the
-- trusted executor lacked EXECUTE.
--
-- This is a misclassification, not a security defect:
--   * the executor already holds SELECT/INSERT/UPDATE/DELETE on qbank_source
--     (0066) with an RLS policy of `true`, so the SECURITY DEFINER reader adds
--     no data-plane surface;
--   * the function returns only an opaque id for a known exact hash (0013
--     header), never content or PII;
--   * app_role keeps its existing EXECUTE, PUBLIC stays revoked, and
--     qbank_source_guard_update keeps its PUBLIC/app_role revoke.
--
-- FORWARD-COMPATIBLE: this does NOT edit 0094.  The manifest in principal.ts
-- (QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST) is flipped in lockstep
-- (allowExecutorExecute true, allowAppRoleExecute unchanged) so the startup
-- catalog gate and the deploy-time provisioner agree on the executor grant.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

GRANT EXECUTE ON FUNCTION qbank_active_source_id(text) TO qbank_control_executor;
