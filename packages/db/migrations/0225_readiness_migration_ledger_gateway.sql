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
-- ledger itself stays write-protected and business tables stay unreadable);
-- fail-closed semantics are unchanged:  when the function is not executable or
-- the ledger is missing, the probe still degrades to `migration_mismatch`.

CREATE OR REPLACE FUNCTION gateway_migration_ledger_max()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT max(version COLLATE "C") FROM public.schema_migrations
$$;

REVOKE ALL ON FUNCTION gateway_migration_ledger_max() FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_migration_ledger_max() TO app_gateway_role;
