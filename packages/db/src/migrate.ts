/**
 * 版本化迁移运行器（生产）：替掉"drop+recreate 引导 DDL + init-scripts 只跑一次"。
 * 铁律:① schema_migrations 追踪已应用版本 ② 只跑待应用、按序、各自事务 ③ advisory 锁(一次一个迁移者,防并发双应用)
 *       ④ checksum 守卫:已应用的迁移内容变了 → 报错(禁止改历史迁移,防漂移) ⑤ 幂等:重跑=已应用跳过。
 * 迁移文件须**增量、非破坏**(CREATE TABLE IF NOT EXISTS / ALTER ... ADD COLUMN IF NOT EXISTS),绝不 DROP 丢数据。
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import type { Pool, PoolClient } from 'pg';

/**
 * Non-transactional migration classes are deliberately narrow.  PostgreSQL
 * forbids `CREATE INDEX CONCURRENTLY` inside a transaction, so
 * `concurrent-index` stays a single parsed statement executed outside one.
 * `multi-statement` (#179 fix 2) runs an annotated file statement-by-statement,
 * each statement in its own short transaction with per-step ledger progress
 * (resumable), for split-phase DDL such as NOT VALID -> VALIDATE.  Everything
 * else remains fully transactional.
 */
export type MigrationExecutionMode = 'transactional' | 'concurrent-index' | 'multi-statement';
export interface Migration {
  version: string;
  sql: string;
  executionMode?: MigrationExecutionMode;
}

function migrationError(code: string): Error & { code: string } {
  return Object.assign(new Error(code), { code });
}

/**
 * Split SQL into top-level statements with comments, quoted strings and
 * dollar-quoted bodies collapsed to whitespace.  Transaction-control
 * detection and `multi-statement` execution share this scanner so both see
 * identical statement boundaries.
 */
function splitTopLevelStatements(sql: string): string[] {
  const statements: string[] = [];
  let statement = '';
  for (let i = 0; i < sql.length;) {
    const ch = sql[i] ?? '';
    const next = sql[i + 1] ?? '';
    if (ch === '-' && next === '-') {
      i += 2;
      while (i < sql.length && sql[i] !== '\n') i++;
      statement += ' ';
      continue;
    }
    if (ch === '/' && next === '*') {
      let depth = 1;
      i += 2;
      while (i < sql.length && depth > 0) {
        if (sql[i] === '/' && sql[i + 1] === '*') { depth++; i += 2; }
        else if (sql[i] === '*' && sql[i + 1] === '/') { depth--; i += 2; }
        else i++;
      }
      statement += ' ';
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      statement += ' ';
      i++;
      while (i < sql.length) {
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) { i += 2; continue; }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (ch === '$') {
      const tag = sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0];
      if (tag) {
        statement += ' ';
        i += tag.length;
        const end = sql.indexOf(tag, i);
        i = end === -1 ? sql.length : end + tag.length;
        continue;
      }
    }
    if (ch === ';') {
      statements.push(statement);
      statement = '';
      i++;
      continue;
    }
    statement += ch;
    i++;
  }
  statements.push(statement);
  return statements;
}

/** Return true when a top-level SQL statement can control the runner transaction. */
export function containsTopLevelTransactionControl(sql: string): boolean {
  return splitTopLevelStatements(sql).some((value) => /^\s*(?:BEGIN|COMMIT|ROLLBACK|END|ABORT)(?:\s+(?:WORK|TRANSACTION))?\b|^\s*(?:START|PREPARE)\s+TRANSACTION\b/i.test(value));
}

/**
 * Statements of a `multi-statement` migration in file order.  The mode
 * annotation is itself a comment and never reaches the database; empty
 * segments (stray semicolons) are dropped.
 */
function multiStatementSteps(sql: string): string[] {
  const stripped = sql.replace(/^\s*--\s*@migration-mode\s+multi-statement\s*$/gmi, '');
  return splitTopLevelStatementsVerbatim(stripped)
    .filter((value) => splitTopLevelStatements(value).some((segment) => segment.trim() !== ''));
}

/**
 * Verbatim top-level statements for execution: the same boundary scanner as
 * splitTopLevelStatements, but every byte outside a boundary semicolon is
 * preserved — string literals, comments and dollar-quoted bodies reach
 * PostgreSQL exactly as reviewed, while quoted semicolons still cannot split
 * a statement.  The collapsing scanner above stays the transaction-control
 * detector; this one only produces executable text.
 */
function splitTopLevelStatementsVerbatim(sql: string): string[] {
  const statements: string[] = [];
  let statement = '';
  for (let i = 0; i < sql.length;) {
    const ch = sql[i] ?? '';
    const next = sql[i + 1] ?? '';
    if (ch === '-' && next === '-') {
      statement += '--';
      i += 2;
      while (i < sql.length && sql[i] !== '\n') { statement += sql[i]; i++; }
      continue;
    }
    if (ch === '/' && next === '*') {
      let depth = 1;
      statement += '/*';
      i += 2;
      while (i < sql.length && depth > 0) {
        if (sql[i] === '/' && sql[i + 1] === '*') { depth++; statement += '/*'; i += 2; }
        else if (sql[i] === '*' && sql[i + 1] === '/') { depth--; statement += '*/'; i += 2; }
        else { statement += sql[i] ?? ''; i++; }
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      statement += ch;
      i++;
      while (i < sql.length) {
        statement += sql[i];
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) { statement += sql[i + 1]; i += 2; continue; }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (ch === '$') {
      const tag = sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0];
      if (tag) {
        const end = sql.indexOf(tag, i + tag.length);
        const stop = end === -1 ? sql.length : end + tag.length;
        statement += sql.slice(i, stop);
        i = stop;
        continue;
      }
    }
    if (ch === ';') {
      statements.push(statement);
      statement = '';
      i++;
      continue;
    }
    statement += ch;
    i++;
  }
  statements.push(statement);
  return statements;
}

function tagMigrationFailure(error: unknown, version: string): unknown {
  // Preserve the driver error for callers that need its SQLSTATE, while adding
  // only the immutable manifest version. No SQL text or target metadata is
  // copied into the error surface.
  if (error && typeof error === 'object') {
    try { Object.assign(error, { migrationVersion: version }); }
    catch { /* a frozen foreign error still propagates unchanged */ }
  }
  return error;
}

type ConcurrentIndexStatement = {
  statement: string;
  indexName: string;
  tableName: string;
  keyColumns: string[];
  unique: boolean;
  usingBtree: true;
  predicateColumn?: string;
};

function concurrentIndexStatement(sql: string): ConcurrentIndexStatement {
  const statement = sql
    .replace(/^\s*--\s*@migration-mode\s+concurrent-index\s*$/gmi, '')
    .replace(/--[^\n]*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
  // Do not widen this without a separately reviewed execution mode.  In
  // particular, the pattern accepts exactly one CREATE INDEX CONCURRENTLY
  // statement and therefore cannot hide DDL/DML after a semicolon.
  const safe = /^CREATE\s+(UNIQUE\s+)?INDEX\s+CONCURRENTLY\s+IF\s+NOT\s+EXISTS\s+([A-Za-z_][A-Za-z0-9_]*)\s+ON\s+(?:public\.)?([A-Za-z_][A-Za-z0-9_]*)\s*\(([^;]+)\)(?:\s+WHERE\s+([A-Za-z_][A-Za-z0-9_]*)\s+IS\s+NULL)?;\s*$/is;
  const matched = statement.match(safe);
  if (!matched?.[2] || !matched[3] || !matched[4]) throw migrationError('migration_concurrent_index_sql_invalid');
  const keyColumns = matched[4].split(',').map((column) => column.trim());
  if (keyColumns.length === 0 || keyColumns.some((column) => !/^[A-Za-z_][A-Za-z0-9_]*(?:\s+(?:ASC|DESC))?$/i.test(column)))
    throw migrationError('migration_concurrent_index_sql_invalid');
  return {
    statement, indexName: matched[2], tableName: matched[3], keyColumns,
    unique: Boolean(matched[1]), usingBtree: true,
    ...(matched[5] ? { predicateColumn: matched[5] } : {}),
  };
}

function concurrentIndexTimeoutMs(): number {
  const raw = process.env.MIGRATION_CONCURRENT_INDEX_TIMEOUT_MS;
  if (raw === undefined || raw === '') return 300_000;
  if (!/^\d+$/.test(raw)) throw migrationError('migration_concurrent_index_timeout_invalid');
  const timeout = Number(raw);
  if (!Number.isSafeInteger(timeout) || timeout < 30_000 || timeout > 900_000)
    throw migrationError('migration_concurrent_index_timeout_invalid');
  return timeout;
}

/**
 * Explicit byte-order (UTF-16 code unit) comparator for migration versions
 * (#140 runner half).  A collation-sensitive sort (localeCompare) can order
 * the same manifest differently per environment, which the ledger contiguous
 * prefix check then experiences as a different migration history; byte order
 * is total and environment-independent.
 */
export function migrationVersionByteCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Session-level statement/lock timeout for the transactional arm (#179 fix 1,
 * #115 runner half).  The arm previously ran bare and silently inherited
 * whatever the pool configured (principal.ts `PG_STATEMENT_TIMEOUT_MS ??
 * 15000` / `PG_IDLE_TX_TIMEOUT_MS ?? 15000`) with no lock_timeout at all — a
 * same-file asymmetry against the concurrent-index arm.  Runner defaults are
 * explicit and above the 15s pool defaults; env tuning follows the
 * PG_*_TIMEOUT_MS naming family; the pool-level production defaults themselves
 * stay byte-identical (this is a runner-scoped session override only).
 */
function transactionalMigrationTimeoutMs(
  envName: 'MIGRATION_STATEMENT_TIMEOUT_MS' | 'MIGRATION_LOCK_TIMEOUT_MS',
  fallbackMs: number,
): number {
  const raw = process.env[envName];
  if (raw === undefined || raw === '') return fallbackMs;
  if (!/^\d+$/.test(raw)) throw migrationError('migration_transactional_timeout_invalid');
  const timeout = Number(raw);
  if (!Number.isSafeInteger(timeout) || timeout < 1_000 || timeout > 900_000)
    throw migrationError('migration_transactional_timeout_invalid');
  return timeout;
}

function normalizeIndexFragment(fragment: string): string {
  return fragment.replace(/[\s()"']/g, '').toLowerCase();
}

type ConcurrentIndexState = {
  valid: boolean; ready: boolean; live: boolean; unique: boolean; access_method: string; index_rel_kind: string; table_name: string; table_schema: string;
  key_columns: string[]; predicate: string | null;
};

async function fetchConcurrentIndexState(client: PoolClient, indexName: string): Promise<ConcurrentIndexState | null> {
  const row = await client.query<ConcurrentIndexState>(
    `SELECT i.indisvalid AS valid, i.indisready AS ready, i.indislive AS live, i.indisunique AS unique, am.amname AS access_method, index_rel.relkind AS index_rel_kind,
            t.relname AS table_name, n.nspname AS table_schema,
            ARRAY(SELECT pg_get_indexdef(i.indexrelid, s.n, true)
                    FROM generate_series(1, i.indnkeyatts) AS s(n)
                    ORDER BY s.n) AS key_columns,
            pg_get_expr(i.indpred, i.indrelid) AS predicate
       FROM pg_index i
       JOIN pg_class index_rel ON index_rel.oid=i.indexrelid
       JOIN pg_am am ON am.oid=index_rel.relam
       JOIN pg_class t ON t.oid=i.indrelid
       JOIN pg_namespace n ON n.oid=t.relnamespace
      WHERE i.indexrelid=to_regclass($1)`,
    [`public.${indexName}`],
  );
  return row.rows[0] ?? null;
}

function concurrentIndexStateMatchesDefinition(state: ConcurrentIndexState | null, concurrent: ConcurrentIndexStatement): boolean {
  const expectedKeys = concurrent.keyColumns.map(normalizeIndexFragment);
  const actualKeys = state?.key_columns?.map(normalizeIndexFragment) ?? [];
  const expectedPredicate = concurrent.predicateColumn ? `${concurrent.predicateColumn}ISNULL`.toLowerCase() : null;
  const actualPredicate = state?.predicate ? normalizeIndexFragment(state.predicate) : null;
  return state !== null
    && state.table_schema === 'public'
    && state.table_name === concurrent.tableName
    && state.index_rel_kind === 'i'
    && state.access_method === 'btree'
    && state.unique === concurrent.unique
    && actualKeys.length === expectedKeys.length
    && actualKeys.every((column, index) => column === expectedKeys[index])
    && actualPredicate === expectedPredicate;
}

function concurrentIndexStateIsValid(state: ConcurrentIndexState | null): boolean {
  return state?.valid === true && state.ready === true && state.live === true;
}

async function assertConcurrentIndexDefinition(client: PoolClient, concurrent: ConcurrentIndexStatement): Promise<void> {
  const state = await fetchConcurrentIndexState(client, concurrent.indexName);
  if (!concurrentIndexStateMatchesDefinition(state, concurrent)) throw migrationError('migration_concurrent_index_definition_mismatch');
  if (!concurrentIndexStateIsValid(state)) throw migrationError('migration_concurrent_index_not_valid');
}

/**
 * #145: a failed concurrent build (cancel, timeout, constraint violation) can
 * leave an INVALID physical index behind.  `IF NOT EXISTS` then no-ops on
 * every restart while the check above keeps failing, so recovery previously
 * required a manual DROP.  When — and only when — the leftover index exactly
 * matches this migration's reviewed manifest declaration is it the runner's
 * own half-built product: drop it and retry the build exactly once (cleanup
 * is logged and observed).  A definition mismatch is NOT ours to touch and
 * still fails closed; a retry that fails again fails loud with the same
 * tagged error — this is a bounded single heal at the detection point, not a
 * retry-to-green loop (R-22 / DDL-failure semantics otherwise unchanged).
 * Requires a transaction-free session (DROP INDEX CONCURRENTLY contract).
 */
async function assertOrHealConcurrentIndexDefinition(
  client: PoolClient,
  concurrent: ConcurrentIndexStatement,
  version: string,
  onCleanup?: (event: { version: string; indexName: string }) => void,
): Promise<void> {
  const state = await fetchConcurrentIndexState(client, concurrent.indexName);
  if (!concurrentIndexStateMatchesDefinition(state, concurrent)) throw migrationError('migration_concurrent_index_definition_mismatch');
  if (concurrentIndexStateIsValid(state)) return;
  await client.query(`DROP INDEX CONCURRENTLY IF EXISTS public.${concurrent.indexName}`);
  console.error(`migration_invalid_index_cleanup version=${version} index=${concurrent.indexName} action=drop_invalid_retry`);
  try { onCleanup?.({ version, indexName: concurrent.indexName }); }
  catch { /* an observer failure must never gate the bounded retry */ }
  try {
    await client.query(concurrent.statement);
  } catch { /* final liveness is re-asserted below; a raw retry failure surfaces as the tagged error */ }
  const retryState = await fetchConcurrentIndexState(client, concurrent.indexName);
  if (!concurrentIndexStateMatchesDefinition(retryState, concurrent) || !concurrentIndexStateIsValid(retryState))
    throw migrationError('migration_concurrent_index_not_valid');
}

/**
 * A migration ledger is trusted only when it is the exact, checksummed prefix
 * of the reviewed manifest.  A ledger containing `0002` but not the
 * destructive `0001_baseline` is not a partial deployment: it is an unknown
 * target and must fail before any DDL can replay the baseline.
 */
function canonicalMigrations(migrations: Migration[]): Array<Migration & { checksum: string }> {
  const ordered = [...migrations]
    .map((migration) => ({ ...migration, checksum: createHash('sha256').update(migration.sql).digest('hex') }))
    .sort((a, b) => migrationVersionByteCompare(a.version, b.version));
  for (let i = 0; i < ordered.length; i++) {
    if (!ordered[i]?.version) throw migrationError('migration_manifest_version_missing');
    if (i > 0 && ordered[i - 1]?.version === ordered[i]?.version)
      throw migrationError(`migration_manifest_duplicate_version:${ordered[i]?.version}`);
    const migration = ordered[i];
    // Transaction-control granularity: the scanner splits on top-level
    // semicolons before matching, so for a multi-statement file this is
    // already a per-statement rejection — only a real top-level
    // BEGIN/COMMIT inside some statement fails (adjudication 4: per-statement).
    if (migration?.executionMode !== 'concurrent-index'
      && containsTopLevelTransactionControl(migration?.sql ?? ''))
      throw migrationError(`migration_transaction_control_forbidden:${migration?.version}`);
  }
  return ordered;
}

export interface MigrationRunOptions {
  /**
   * Observer for #145 authorized invalid-index cleanups.  Exactly one event
   * fires per drop+retry heal; production also logs each cleanup to stderr.
   */
  onConcurrentIndexCleanup?: (event: { version: string; indexName: string }) => void;
}

export async function runMigrations(pool: Pool, migrations: Migration[], options: MigrationRunOptions = {}): Promise<{ applied: string[]; skipped: string[] }> {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', ['meetwise_migrations']);   // 串行化迁移者
    const ordered = canonicalMigrations(migrations);
    // A versioned baseline may contain legacy destructive bootstrap SQL. Never create a
    // fresh ledger over an existing public schema: that would make a non-empty target
    // look bootstrap-safe and could replay DROP statements. This check performs only
    // catalog reads and fails before the ledger DDL or any migration SQL.
    const ledger = await client.query("SELECT to_regclass('public.schema_migrations') AS name");
    if (ledger.rows[0]?.name === null) {
      const existing = await client.query(
        // Both runner bookkeeping tables are excluded from the census — the
        // guard detects foreign/business tables, not the runner's own ledger
        // infrastructure (schema_migrations was always exempt; the
        // multi-statement side table is the same class of object).
        "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT IN ('schema_migrations', 'schema_migrations_steps') ORDER BY tablename",
      );
      if ((existing.rowCount ?? 0) > 0) {
        throw migrationError('migration_uninitialized_nonempty_database');
      }
    }
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    // Per-statement progress ledger for `multi-statement` migrations (#179
    // fix 2 storage ruling: side table).  Rows exist only while a version is
    // mid-flight and are deleted in the same transaction that appends the
    // completed version, so schema_migrations keeps exactly one row per
    // applied version and every existing ledger invariant (counting, checksum
    // reconciliation, contiguous prefix) reads it exactly as before.
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations_steps (version text NOT NULL, step_index integer NOT NULL, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (version, step_index))');
    // Byte order on both sides of the prefix reconciliation: the manifest is
    // byte-sorted above, so the ledger read must be ordered by an explicit
    // collation-stable sort (COLLATE "C") and never by the database default
    // collation, or two environments could disagree on what "prefix" means.
    const doneRows = (await client.query<{ version: string; checksum: string }>('SELECT version, checksum FROM schema_migrations ORDER BY version COLLATE "C"')).rows;
    const done = new Map<string, string>(doneRows.map((r) => [r.version, r.checksum]));
    const manifest = new Map(ordered.map((m) => [m.version, m]));
    // This entire validation runs after only catalog/ledger reads.  Do it
    // before the first migration transaction, rather than discovering a bad
    // historic entry midway through a destructive baseline.
    for (const row of doneRows) {
      const expected = manifest.get(row.version);
      if (!expected) throw migrationError(`migration_ledger_unknown_version:${row.version}`);
      if (expected.checksum !== row.checksum) throw migrationError(`migration_drift:${row.version}`);
    }
    const expectedPrefix = ordered.slice(0, doneRows.length);
    if (expectedPrefix.length !== doneRows.length || expectedPrefix.some((m, index) => m.version !== doneRows[index]?.version))
      throw migrationError('migration_ledger_not_contiguous_prefix');
    // Step-progress rows must reference a manifest version and never coexist
    // with a completed ledger row (completion deletes them atomically).  A
    // foreign or tampered side table fails closed before any DDL.
    const stepRows = (await client.query<{ version: string; step_index: number; checksum: string }>('SELECT version, step_index, checksum FROM schema_migrations_steps')).rows;
    for (const row of stepRows) {
      if (!manifest.has(row.version)) throw migrationError(`migration_steps_unknown_version:${row.version}`);
      if (done.has(row.version)) throw migrationError(`migration_steps_completed_version:${row.version}`);
    }
    const applied: string[] = [], skipped: string[] = [];
    for (const m of ordered) {
      const checksum = m.checksum;
      const prev = done.get(m.version);
      if (prev !== undefined) {
        if (prev !== checksum) throw new Error(`migration_drift:${m.version} 已应用但内容已改(checksum 不符)——禁止改历史迁移`);
        // The ledger proves what this runner once recorded, not that an
        // operator has not since removed a concurrently-created index. Check
        // the narrowly-declared physical object on every replay so a missing
        // or invalid index cannot hide behind an old ledger row.
        if (m.executionMode === 'concurrent-index') {
          const concurrent = concurrentIndexStatement(m.sql);
          await assertConcurrentIndexDefinition(client, concurrent);
        }
        skipped.push(m.version);
        continue;                                                                            // 幂等:已应用跳过
      }
      if (m.executionMode === 'concurrent-index') {
        // CREATE INDEX CONCURRENTLY cannot be part of a transaction.  The
        // physical index is idempotent (`IF NOT EXISTS`); only after it
        // succeeds do we append the immutable ledger in its own transaction.
        const concurrent = concurrentIndexStatement(m.sql);
        // A concurrent build needs more time than the API connection default,
        // but it must remain bounded.  The session settings are restored even
        // when PostgreSQL leaves an invalid index after a failed build.
        const priorStatementTimeout = await client.query<{ statement_timeout: string }>('SHOW statement_timeout');
        const priorLockTimeout = await client.query<{ lock_timeout: string }>('SHOW lock_timeout');
        const timeout = concurrentIndexTimeoutMs();
        try {
          await client.query("SELECT set_config('statement_timeout',$1,false), set_config('lock_timeout','2s',false)", [String(timeout)]);
          await client.query(concurrent.statement);
          // A cancelled/failed CREATE UNIQUE INDEX CONCURRENTLY can leave an
          // invalid physical index behind. `IF NOT EXISTS` would subsequently
          // return success without repairing it, so never advance the ledger
          // unless PostgreSQL reports the exact intended definition live.
          // #145: on this fresh-execution path a leftover INVALID index that
          // exactly matches the manifest declaration is the runner's own
          // half-built product and is dropped and rebuilt exactly once; the
          // ledger-replay path above keeps failing closed without cleanup.
          await assertOrHealConcurrentIndexDefinition(client, concurrent, m.version, options.onConcurrentIndexCleanup);
        } finally {
          const statementTimeout = priorStatementTimeout.rows[0]?.statement_timeout ?? '0';
          const lockTimeout = priorLockTimeout.rows[0]?.lock_timeout ?? '0';
          await client.query("SELECT set_config('statement_timeout',$1,false), set_config('lock_timeout',$2,false)", [statementTimeout, lockTimeout]);
        }
        await client.query('BEGIN');
        try {
          await client.query('INSERT INTO schema_migrations(version, checksum) VALUES ($1,$2)', [m.version, checksum]);
          await client.query('COMMIT');
          applied.push(m.version);
        } catch (e) { await client.query('ROLLBACK'); throw tagMigrationFailure(e, m.version); }
        continue;
      }
      if (m.executionMode === 'multi-statement') {
        // #179 fix 2: split-phase DDL (e.g. NOT VALID -> VALIDATE) must not
        // hold a single transaction over the whole file.  Each statement
        // commits on its own with a per-step ledger row, so a crash resumes at
        // the first unrecorded statement instead of replaying completed ones.
        // The completed version enters schema_migrations atomically with the
        // deletion of its step rows, so the three ledger guards (counting,
        // checksum reconciliation, contiguous prefix) never see a partial
        // version.  A failed statement stops the run fail-loud with recorded
        // steps kept — recorded progress is the mode's whole point.
        const steps = multiStatementSteps(m.sql);
        const recorded = new Map(stepRows.filter((row) => row.version === m.version).map((row) => [row.step_index, row.checksum]));
        for (let index = 0; index < steps.length; index++) {
          const stepSql = steps[index] ?? '';
          const stepChecksum = createHash('sha256').update(stepSql).digest('hex');
          const recordedStep = recorded.get(index);
          if (recordedStep !== undefined) {
            if (recordedStep !== stepChecksum) throw migrationError(`migration_step_drift:${m.version}#${index}`);
            continue;                                                                          // 断点续跑:已记账句 skip
          }
          await client.query('BEGIN');
          try {
            await client.query(stepSql);
            await client.query('INSERT INTO schema_migrations_steps(version, step_index, checksum) VALUES ($1,$2,$3)', [m.version, index, stepChecksum]);
            await client.query('COMMIT');
          } catch (e) { await client.query('ROLLBACK'); throw tagMigrationFailure(e, m.version); }
        }
        await client.query('BEGIN');
        try {
          await client.query('INSERT INTO schema_migrations(version, checksum) VALUES ($1,$2)', [m.version, checksum]);
          await client.query('DELETE FROM schema_migrations_steps WHERE version = $1', [m.version]);
          await client.query('COMMIT');
          applied.push(m.version);
        } catch (e) { await client.query('ROLLBACK'); throw tagMigrationFailure(e, m.version); }
        continue;
      }
      // #179 fix 1 / #115: mirror the concurrent-index arm exactly — read the
      // prior session values, bound statement_timeout and lock_timeout for the
      // migration+ledger transaction, restore in finally (win or lose).  A
      // timeout fires as a statement cancellation: the whole transaction
      // (migration + ledger row) rolls back and the run fails loud — no
      // retry-to-green, zero ledger progress.
      const priorStatementTimeout = await client.query<{ statement_timeout: string }>('SHOW statement_timeout');
      const priorLockTimeout = await client.query<{ lock_timeout: string }>('SHOW lock_timeout');
      const statementTimeout = transactionalMigrationTimeoutMs('MIGRATION_STATEMENT_TIMEOUT_MS', 60_000);
      const lockTimeout = transactionalMigrationTimeoutMs('MIGRATION_LOCK_TIMEOUT_MS', 15_000);
      await client.query('BEGIN');
      try {
        await client.query("SELECT set_config('statement_timeout',$1,false), set_config('lock_timeout',$2,false)", [String(statementTimeout), String(lockTimeout)]);
        await client.query(m.sql);                                                           // 迁移与记录同一事务 → 要么全成要么全回滚
        await client.query('INSERT INTO schema_migrations(version, checksum) VALUES ($1,$2)', [m.version, checksum]);
        await client.query('COMMIT');
        applied.push(m.version);
      } catch (e) { await client.query('ROLLBACK'); throw tagMigrationFailure(e, m.version); }
      finally {
        const restoreStatementTimeout = priorStatementTimeout.rows[0]?.statement_timeout ?? '0';
        const restoreLockTimeout = priorLockTimeout.rows[0]?.lock_timeout ?? '0';
        await client.query("SELECT set_config('statement_timeout',$1,false), set_config('lock_timeout',$2,false)", [restoreStatementTimeout, restoreLockTimeout]);
      }
    }
    return { applied, skipped };
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['meetwise_migrations']);
    client.release();
  }
}

/** 从目录读增量迁移文件(版本=文件名)。生产启动时 runMigrations(pool, loadMigrations(dir))。 */
export function loadMigrations(dir: string): Migration[] {
  return readdirSync(dir).filter((f) => f.endsWith('.sql')).sort().map((f) => {
    const sql = readFileSync(`${dir}/${f}`, 'utf8');
    return {
      version: f.replace(/\.sql$/, ''),
      sql,
      executionMode: /^\s*--\s*@migration-mode\s+concurrent-index\s*$/mi.test(sql) ? 'concurrent-index'
        : /^\s*--\s*@migration-mode\s+multi-statement\s*$/mi.test(sql) ? 'multi-statement'
        : 'transactional',
    };
  });
}
