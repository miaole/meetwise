-- 0079_rag_control_acl_allowlist.sql
--
-- Control-plane procedures are callable only through the dedicated executor.
-- 0073 removed the legacy app_role grant, but a later direct ACL grant to a
-- gateway, privacy, or qbank capability would otherwise evade an app_role-only
-- catalog check.  This migration revokes known incompatible capability
-- grants; the startup catalog gate rejects any remaining unknown direct ACL.

REVOKE USAGE ON SCHEMA rag_control FROM PUBLIC, app_role, app_gateway_role,
  privacy_worker_executor, qbank_control_executor, rag_control_login;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rag_control FROM PUBLIC, app_role,
  app_gateway_role, privacy_worker_executor, qbank_control_executor,
  rag_control_login, rag_runtime_definer;

-- The two reviewed schema consumers retain distinct, minimal reasons for
-- USAGE: the control executor invokes the fixed control procedures; the
-- runtime definer resolves dynamic physical vector tables but has no control
-- procedure EXECUTE privilege.
GRANT USAGE ON SCHEMA rag_control TO rag_control_executor, rag_runtime_definer;
