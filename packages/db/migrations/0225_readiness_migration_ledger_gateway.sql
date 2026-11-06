-- 0225_readiness_migration_ledger_gateway.sql
--
-- #92 readiness deepening added a migration-ledger read to /readyz/api, but the
-- probe runs on the bare NOINHERIT runtime login outside `asPrincipal()`.  That
-- login deliberately holds no table grants, so `SELECT max(version) FROM
-- schema_migrations` was permission denied and readiness reported a permanent
-- false `migration_mismatch` 503 under the canonical production identity.
--
-- Complete the #92 design through the established gateway-metadata pattern
-- (0040/0041/0042): one reviewed, fixed SECURITY DEFINER read executed via
-- app_gateway_role.  The runtime login still receives no table grant (the
-- ledger itself stays write-protected and business tables stay unreadable).
--
-- The body is plpgsql with a `to_regclass` short-circuit:  worlds that replay
-- migration files as raw SQL without the migrate runner's ledger bootstrap
-- (drift:prove temp databases) have no `schema_migrations` table;  plpgsql
-- bodies are never validated for table existence at CREATE time, and the
-- probe returns NULL there instead of erroring.  Semantics unchanged:  once
-- the real migrate runner has bootstrapped the ledger, readiness sees the
-- true latest version,  and a missing/unreadable ledger still degrades to
-- `migration_mismatch` (fail-closed).
--
-- The `app_gateway_role` DO guard below mirrors the 0040/0041 defensive
-- convention:  in the normal chain 0040 has already created the role,  but a
-- replay of just this file (hotfix cherry-pick onto an older base) still
-- grants cleanly instead of failing on a missing role.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_gateway_role') THEN
    CREATE ROLE app_gateway_role NOLOGIN;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION gateway_migration_ledger_max()
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF to_regclass('public.schema_migrations') IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN max(version COLLATE "C") FROM public.schema_migrations;
END;
$$;

REVOKE ALL ON FUNCTION gateway_migration_ledger_max() FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_migration_ledger_max() TO app_gateway_role;
