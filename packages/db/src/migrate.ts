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
 * `concurrent-index` is deliberately the only non-transactional migration
 * class.  PostgreSQL forbids `CREATE INDEX CONCURRENTLY` inside a transaction,
 * but allowing arbitrary SQL outside one would break the migration atomicity
 * invariant.  The runner validates this narrow form before executing it.
 */
export type MigrationExecutionMode = 'transactional' | 'concurrent-index';
export interface Migration {
  version: string;
  sql: string;
  executionMode?: MigrationExecutionMode;
}

function migrationError(code: string): Error & { code: string } {
  return Object.assign(new Error(code), { code });
}

/** Return true when a top-level SQL statement can control the runner transaction. */
export function containsTopLevelTransactionControl(sql: string): boolean {
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
  return statements.some((value) => /^\s*(?:BEGIN|COMMIT|ROLLBACK|END|ABORT)(?:\s+(?:WORK|TRANSACTION))?\b|^\s*(?:START|PREPARE)\s+TRANSACTION\b/i.test(value));
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

function normalizeIndexFragment(fragment: string): string {
  return fragment.replace(/[\s()"']/g, '').toLowerCase();
}

async function assertConcurrentIndexDefinition(
  client: PoolClient,
  concurrent: ConcurrentIndexStatement,
): Promise<void> {
  const row = await client.query<{
    valid: boolean; ready: boolean; live: boolean; unique: boolean; access_method: string; index_rel_kind: string; table_name: string; table_schema: string;
    key_columns: string[]; predicate: string | null;
  }>(
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
    [`public.${concurrent.indexName}`],
  );
  const actual = row.rows[0];
  const expectedKeys = concurrent.keyColumns.map(normalizeIndexFragment);
  const actualKeys = actual?.key_columns?.map(normalizeIndexFragment) ?? [];
  const expectedPredicate = concurrent.predicateColumn ? `${concurrent.predicateColumn}ISNULL`.toLowerCase() : null;
  const actualPredicate = actual?.predicate ? normalizeIndexFragment(actual.predicate) : null;
  const definitionMatches = actual?.table_schema === 'public'
    && actual.table_name === concurrent.tableName
    && actual.index_rel_kind === 'i'
    && actual.access_method === 'btree'
    && actual.unique === concurrent.unique
    && actualKeys.length === expectedKeys.length
    && actualKeys.every((column, index) => column === expectedKeys[index])
    && actualPredicate === expectedPredicate;
  if (!definitionMatches) throw migrationError('migration_concurrent_index_definition_mismatch');
  if (actual?.valid !== true || actual.ready !== true || actual.live !== true)
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
    .sort((a, b) => a.version.localeCompare(b.version));
  for (let i = 0; i < ordered.length; i++) {
    if (!ordered[i]?.version) throw migrationError('migration_manifest_version_missing');
    if (i > 0 && ordered[i - 1]?.version === ordered[i]?.version)
      throw migrationError(`migration_manifest_duplicate_version:${ordered[i]?.version}`);
    const migration = ordered[i];
    if (migration?.executionMode !== 'concurrent-index'
      && containsTopLevelTransactionControl(migration?.sql ?? ''))
      throw migrationError(`migration_transaction_control_forbidden:${migration?.version}`);
  }
  return ordered;
}

export async function runMigrations(pool: Pool, migrations: Migration[]): Promise<{ applied: string[]; skipped: string[] }> {
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
        "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'schema_migrations' ORDER BY tablename",
      );
      if ((existing.rowCount ?? 0) > 0) {
        throw migrationError('migration_uninitialized_nonempty_database');
      }
    }
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const doneRows = (await client.query<{ version: string; checksum: string }>('SELECT version, checksum FROM schema_migrations ORDER BY version')).rows;
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
          await assertConcurrentIndexDefinition(client, concurrent);
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
      await client.query('BEGIN');
      try {
        await client.query(m.sql);                                                           // 迁移与记录同一事务 → 要么全成要么全回滚
        await client.query('INSERT INTO schema_migrations(version, checksum) VALUES ($1,$2)', [m.version, checksum]);
        await client.query('COMMIT');
        applied.push(m.version);
      } catch (e) { await client.query('ROLLBACK'); throw tagMigrationFailure(e, m.version); }
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
      executionMode: /^\s*--\s*@migration-mode\s+concurrent-index\s*$/mi.test(sql) ? 'concurrent-index' : 'transactional',
    };
  });
}
