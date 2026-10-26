/**
 * AG-36 · checkpoint schema version self-check prove (ring 3). pnpm prove:checkpoint-schema-selfcheck
 *
 * Isolated loopback PG only (run-e2e-isolated family · assertIsolatedTestTarget).
 * Arms:
 *  ① constant ↔ installed vendor binding: the vendor does not export its
 *    migration list, so the proof resolves the installed
 *    @langchain/langgraph-checkpoint-postgres package through its package
 *    entry and counts the entries of dist/migrations.js from disk. A vendor
 *    upgrade that changes the count turns this proof red and forces the
 *    "new reviewed migration + EXPECTED_CHECKPOINT_MIGRATIONS bump in the
 *    same commit" flow (deep-importing vendor internals stays banned for
 *    runtime paths; layout changes fail loud here by design).
 *  ② match + mismatch arms on the full REAL migration set (loadMigrations +
 *    runMigrations over ../migrations, the migrate.proof.ts in-process form):
 *    0043 seeds checkpoint_migrations (0)-(4) and 0045 REVOKEs the table from
 *    app_role — a 0043-only manual-seed shape is forbidden here because it
 *    would keep the 0043 GRANT effective and fake the arm ④ negative red.
 *    The assert passes pristine and fails closed in both drift directions
 *    (behind: v4 missing / ahead: extra v5 / NULL: empty table via COALESCE).
 *  ③ 0043 byte hash invariant against the dbhy1 ledger value (zero-migration
 *    invariant: this prove never rewrites history).
 *  ④ identity reachability machine assertion: positive — the migrate login
 *    (this pool) actually runs the assert (0045 keeps checkpoint
 *    bookkeeping with the migration login); negative — app_role inside a
 *    single checked-out client transaction (BEGIN + SET LOCAL ROLE, dbhy1
 *    form: pool.query across connections loses SET ROLE) must get
 *    SQLSTATE 42501 on the same assert. SET ROLE success is asserted first
 *    (current_user = app_role) so a refused SET ROLE cannot pass vacuously.
 *    If a future migration re-grants the read, this arm turns red and forces
 *    a gate-locus review.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CHECKPOINT_MIGRATIONS_VERSION_MISMATCH,
  EXPECTED_CHECKPOINT_MIGRATIONS,
  assertCheckpointMigrationsCurrent,
  assertIsolatedTestTarget,
  createPool,
  loadMigrations,
  runMigrations,
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};

interface VersionMismatchError extends Error { code?: string }

async function throwsVersionMismatch(run: () => Promise<void>): Promise<boolean> {
  try {
    await run();
    return false;
  } catch (e) {
    const error = e as VersionMismatchError;
    return error instanceof Error
      && typeof error.message === 'string'
      && error.message.startsWith(CHECKPOINT_MIGRATIONS_VERSION_MISMATCH)
      && error.code === CHECKPOINT_MIGRATIONS_VERSION_MISMATCH;
  }
}

/**
 * Ring 3 ①: count the installed vendor migration entries without importing
 * vendor internals — package-entry resolution locates the install, then the
 * dist/migrations.js source is read from disk and its `return [ ... ]` array
 * is measured (one template literal per migration). Any vendor layout change
 * fails loud here and forces human review instead of silently passing.
 */
function installedVendorMigrationCount(): number {
  const require = createRequire(import.meta.url);
  const vendorRoot = dirname(require.resolve('@langchain/langgraph-checkpoint-postgres/package.json'));
  const source = readFileSync(join(vendorRoot, 'dist', 'migrations.js'), 'utf8');
  const returnStart = source.indexOf('return [');
  const returnEnd = source.indexOf('];', returnStart);
  if (returnStart < 0 || returnEnd < 0) throw new Error('checkpoint_vendor_migration_list_unreadable');
  const backticks = source.slice(returnStart, returnEnd).match(/`/g) ?? [];
  const count = backticks.length / 2;
  if (!Number.isInteger(count) || count <= 0) throw new Error('checkpoint_vendor_migration_list_unreadable');
  return count;
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(pool);
  try {
    // ① constant ↔ installed vendor binding (vendor upgrade = red = re-review)
    const vendorCount = installedVendorMigrationCount();
    check('① EXPECTED_CHECKPOINT_MIGRATIONS === installed vendor migration count',
      vendorCount === EXPECTED_CHECKPOINT_MIGRATIONS,
      `vendor=${vendorCount} expected=${EXPECTED_CHECKPOINT_MIGRATIONS}`);

    // ③ 0043 byte hash invariant (dbhy1 ledger value · zero-migration invariant)
    const migration43 = readFileSync(fileURLToPath(new URL('../migrations/0043_langgraph_checkpoint_least_privilege.sql', import.meta.url)));
    const hash43 = createHash('sha256').update(migration43).digest('hex');
    check('③ 0043 sha256 === dbhy1 ledger f12c3026…9123 (history untouched)',
      hash43 === 'f12c3026f0624d012de988fd0f77310cde9d4128defc8fc18bc502075d7e9123', hash43);

    // ② 装库形前置: full REAL migration set (0043 seeds + 0045 REVOKE) — never 0043-only manual seeds
    const migrationDir = fileURLToPath(new URL('../migrations', import.meta.url));
    const migrations = loadMigrations(migrationDir);
    check('② full real migration set carries 0043 (seeds 0..4) and 0045 (REVOKE app_role)',
      migrations.some((m) => m.version === '0043_langgraph_checkpoint_least_privilege')
      && migrations.some((m) => m.version === '0045_checkpoint_thread_rls'),
      `total=${migrations.length}`);
    const run = await runMigrations(pool, migrations);
    check('② runMigrations applied the full set on the isolated cluster', run.skipped.length === 0, `applied=${run.applied.length}`);
    const seeds = await pool.query<{ v: number }>('SELECT v FROM checkpoint_migrations ORDER BY v');
    check('② 0043 seed shape: checkpoint_migrations = v 0..4',
      JSON.stringify(seeds.rows.map((r) => r.v)) === '[0,1,2,3,4]',
      JSON.stringify(seeds.rows.map((r) => r.v)));

    // ② match arm — migrate login, pristine full load
    let matchError: unknown;
    try { await assertCheckpointMigrationsCurrent(pool); } catch (e) { matchError = e; }
    check('② match arm: assert passes on migrate login after full real load',
      matchError === undefined, matchError instanceof Error ? matchError.message : '');

    // ② mismatch arms — strict equality is fail-closed in both directions + NULL empty table
    await pool.query('DELETE FROM checkpoint_migrations WHERE v = 4');
    check('② mismatch arm (behind: v4 missing) → checkpoint_migrations_version_mismatch',
      await throwsVersionMismatch(() => assertCheckpointMigrationsCurrent(pool)));
    await pool.query('INSERT INTO checkpoint_migrations(v) VALUES (4)');
    await pool.query('INSERT INTO checkpoint_migrations(v) VALUES (5)');
    check('② mismatch arm (ahead: extra v5) → checkpoint_migrations_version_mismatch',
      await throwsVersionMismatch(() => assertCheckpointMigrationsCurrent(pool)));
    await pool.query('DELETE FROM checkpoint_migrations WHERE v = 5');
    await pool.query('TRUNCATE checkpoint_migrations');
    check('② mismatch arm (NULL: empty table via COALESCE) → checkpoint_migrations_version_mismatch',
      await throwsVersionMismatch(() => assertCheckpointMigrationsCurrent(pool)));
    await pool.query('INSERT INTO checkpoint_migrations(v) SELECT generate_series(0, 4)');

    // ④ positive arm — migrate login is the reachable identity (0045 stance)
    let positiveError: unknown;
    try { await assertCheckpointMigrationsCurrent(pool); } catch (e) { positiveError = e; }
    check('④ positive arm: migrate login runs the assert (migration bookkeeping stays with migration login)',
      positiveError === undefined, positiveError instanceof Error ? positiveError.message : '');

    // ④ negative arm — app_role must be denied: single checkout client,
    // BEGIN + SET LOCAL ROLE (dbhy1 form), SET ROLE success asserted first.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL ROLE app_role');
      const who = await client.query<{ u: string }>('SELECT current_user AS u');
      check('④ negative arm pre-assert: SET LOCAL ROLE app_role succeeded (no vacuous 42501)',
        who.rows[0]?.u === 'app_role', String(who.rows[0]?.u));
      let negativeSqlState = 'none';
      try {
        await assertCheckpointMigrationsCurrent(client);
      } catch (e) {
        negativeSqlState = String((e as { code?: string }).code ?? 'none');
      }
      check('④ negative arm: app_role SELECT checkpoint_migrations → SQLSTATE 42501 (0045 REVOKE machine guard)',
        negativeSqlState === '42501', `sqlstate=${negativeSqlState}`);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
  console.log(failures === 0
    ? '\n✓ checkpoint schema version self-check prove PASS (isolated evidence only)'
    : `\n✗ ${failures} checkpoint schema self-check assertion(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async () => {
  await pool.end().catch(() => undefined);
  console.error('checkpoint_schema_selfcheck_prove_failed');
  process.exit(1);
});
