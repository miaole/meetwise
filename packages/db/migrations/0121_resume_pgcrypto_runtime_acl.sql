-- The API runtime encrypts resume and transcript artifacts inside owner-scoped
-- transactions.  A hardened extension ACL must not remove these two exact
-- pgcrypto capabilities from app_role, while PUBLIC and the optional-argument
-- overloads remain denied.
DO $$
BEGIN
  IF to_regprocedure('public.pgp_sym_encrypt(text,text)') IS NULL
     OR to_regprocedure('public.pgp_sym_decrypt(bytea,text)') IS NULL THEN
    RAISE EXCEPTION 'resume_pgcrypto_functions_missing';
  END IF;
END
$$;

REVOKE ALL ON FUNCTION pgp_sym_encrypt(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION pgp_sym_decrypt(bytea,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION pgp_sym_encrypt(text,text) TO app_role;
GRANT EXECUTE ON FUNCTION pgp_sym_decrypt(bytea,text) TO app_role;

