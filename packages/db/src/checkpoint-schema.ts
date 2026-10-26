/**
 * AG-36 · LangGraph checkpoint schema version self-check.
 *
 * Migration 0043 hand-mirrors the @langchain/langgraph-checkpoint-postgres
 * 1.0.4 migration list so the runtime never executes vendor DDL ("Package
 * upgrades that alter this schema require a new reviewed migration before
 * deployment" — 0043 header). That discipline used to be prose-only. This
 * module turns it into a machine gate carried by the migrate service:
 *
 * - The vendor does not export its migration list at runtime (dist/index.js
 *   exports only PostgresSaver; package exports expose no ./migrations
 *   subpath), so the expected version lives as this in-repo constant and is
 *   bound to the *installed* vendor package by
 *   prove:checkpoint-schema-selfcheck (a vendor upgrade that changes the
 *   migration count turns that proof red and forces the
 *   new-reviewed-migration + constant-bump flow in the same commit).
 * - 0043 seeds checkpoint_migrations with v = 0..(EXPECTED-1), i.e. the
 *   expected MAX(v) is "migration count - 1" (5 migrations → MAX = 4).
 * - The gate is strict equality and therefore fail-closed in both drift
 *   directions: MAX below expected = vendor upgraded without the mirrored
 *   0043 follow-up; MAX above expected (or NULL/empty table, via COALESCE)
 *   = rollback without backfill. Any mismatch throws
 *   checkpoint_migrations_version_mismatch.
 * - Gate locus: packages/db/src/migrate-cli.ts post-flight, executed with the
 *   migration login — the only identity that may read checkpoint_migrations
 *   after 0045 REVOKEs it from app_role. A mismatch fails the deployment
 *   window (migrate job exit 1) instead of surfacing as runtime SQL errors.
 */
import type { Client, DbPool } from './principal.ts';

export const EXPECTED_CHECKPOINT_MIGRATIONS = 5;

export const CHECKPOINT_MIGRATIONS_VERSION_MISMATCH = 'checkpoint_migrations_version_mismatch';

/**
 * Asserts the deployed checkpoint_migrations ledger is current with
 * EXPECTED_CHECKPOINT_MIGRATIONS. Accepts a pool or a checked-out client;
 * callers must hold a read grant on checkpoint_migrations (migrate login).
 */
export async function assertCheckpointMigrationsCurrent(client: Client | DbPool): Promise<void> {
  const result = await client.query('SELECT COALESCE(MAX(v), -1) AS max_v FROM checkpoint_migrations');
  const actualMax = Number(result.rows[0]?.max_v ?? -1);
  const expectedMax = EXPECTED_CHECKPOINT_MIGRATIONS - 1;
  if (actualMax !== expectedMax) {
    throw Object.assign(
      new Error(`${CHECKPOINT_MIGRATIONS_VERSION_MISMATCH}: MAX(v)=${actualMax} expected=${expectedMax}`),
      { code: CHECKPOINT_MIGRATIONS_VERSION_MISMATCH },
    );
  }
}
