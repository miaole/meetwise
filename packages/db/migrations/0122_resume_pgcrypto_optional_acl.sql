-- 0121 is already present in the controlled cloud ledger and is immutable.
-- Complete its least-privilege boundary by explicitly denying the optional
-- cipher-parameter overloads to both PUBLIC and the application runtime role.
DO $$
BEGIN
  IF to_regprocedure('public.pgp_sym_encrypt(text,text,text)') IS NULL
     OR to_regprocedure('public.pgp_sym_decrypt(bytea,text,text)') IS NULL THEN
    RAISE EXCEPTION 'resume_pgcrypto_optional_functions_missing';
  END IF;
END
$$;

REVOKE ALL ON FUNCTION public.pgp_sym_encrypt(text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pgp_sym_decrypt(bytea,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pgp_sym_encrypt(text,text,text) FROM app_role;
REVOKE ALL ON FUNCTION public.pgp_sym_decrypt(bytea,text,text) FROM app_role;
