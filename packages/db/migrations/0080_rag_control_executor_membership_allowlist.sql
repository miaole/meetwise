-- 0080_rag_control_executor_membership_allowlist.sql
--
-- A clean function ACL is insufficient if a request-path capability can SET
-- ROLE to rag_control_executor.  Remove known incompatible memberships during
-- upgrade; startup additionally rejects any later unexpected member closure.

REVOKE rag_control_executor FROM app_role, app_gateway_role,
  privacy_worker_executor, qbank_control_executor, rag_runtime_definer;
