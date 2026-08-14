-- 0075_privacy_erasure_authorization_pause.sql
--
-- `app.principal_user` is an RLS routing value, not an unforgeable identity.
-- A login that can execute arbitrary SQL as app_role can set it to another
-- user.  The old checkpoint-erasure entrypoints are SECURITY DEFINER and used
-- that value as their ownership check, so keeping them callable would let such
-- a login erase a victim's known interview thread.
--
-- There is no reviewed authorization-snapshot issuer yet.  Fail closed at the
-- database boundary until the future privacy API/executor can verify a
-- short-lived, single-use, object-bound authorization grant.  The physical
-- checkpoint target worker remains a separate capability, but it cannot be
-- reached from an untrusted runtime because no new request/target can start.

REVOKE EXECUTE ON FUNCTION revoke_checkpoint_thread(text) FROM app_role;
REVOKE EXECUTE ON FUNCTION privacy_begin_checkpoint_erasure(text,text) FROM app_role;
