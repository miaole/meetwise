/**
 * W3 / R-22: connection-acquisition retry for the one-shot migrate deployment
 * job.  Retry covers ONLY "cannot reach the database" (connect-level faults);
 * migration semantics — runMigrations, the advisory lock, transactions,
 * checksums, DDL — are never retried and stay fail-loud (migrate.ts iron law:
 * re-running skips already-applied versions, but this layer does not rely on
 * that for DDL).  compose governance (`restart: "no"`) is untouched: this
 * absorbs second-scale jitter inside the process; a budget exhaustion exits 1
 * so the `service_completed_successfully` gate keeps failing loudly.
 */
import type { DbPool } from './principal.ts';

/** Errno-level connect faults (system errors surfaced by pg's socket layer). */
const CONNECT_ERRNOS: ReadonlySet<string> = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET']);
/**
 * PostgreSQL SQLSTATE connect-class faults: 57P01 admin_shutdown (server
 * shutting down / backend terminated administratively), 53300
 * too_many_connections (pool exhausted at the server).
 */
const CONNECT_SQLSTATES: ReadonlySet<string> = new Set(['57P01', '53300']);
/** pg-protocol's connection-teardown message family (no SQLSTATE attached). */
const CONNECT_MESSAGE = /^(?:Connection terminated|server closed the connection|socket closed unexpectedly|timeout expired)/i;

export type ConnectErrorClass = 'connect' | 'fatal';

/**
 * Classify an error: 'connect' = transient cannot-reach / connection-lost
 * class eligible for backoff; 'fatal' = everything else (SQL/DDL/transaction/
 * checksum/logic failures) — never retried.
 */
export function classifyConnectError(error: unknown): ConnectErrorClass {
  if (error !== null && typeof error === 'object') {
    const e = error as { code?: unknown; message?: unknown };
    if (typeof e.code === 'string' && CONNECT_ERRNOS.has(e.code)) return 'connect';
    if (typeof e.code === 'string' && CONNECT_SQLSTATES.has(e.code)) return 'connect';
    if (typeof e.message === 'string' && CONNECT_MESSAGE.test(e.message)) return 'connect';
  }
  return 'fatal';
}

export interface ConnectRetryDeps {
  /** Injectable pause (proofs pass a recording fake; default real timer). */
  sleep?: (ms: number) => Promise<void>;
  /** Injectable clock (proofs pass a stepped fake; default Date.now). */
  now?: () => number;
  /** Injectable sink for the structured retry log (default console.error). */
  log?: (line: string) => void;
}

/** Exponential backoff ceiling per wait (env-independent constant). */
const BACKOFF_CAP_MS = 15000;

/**
 * Run `op` with bounded exponential backoff while the failure classifies as
 * connect-level.  Budget (default 30s) and base (default 1s) come from env so
 * the proof harness can shorten them.  Every wait is deadline-clamped and the
 * per-attempt wait is capped at 15s — no unbounded await.  On fatal-class
 * errors, or budget exhaustion, the error is rethrown verbatim for the caller
 * to fail loud (migrate-cli `process.exit(1)` path is unchanged).  The log
 * line carries only attempt/class/timing/error name+message — never
 * connection strings or credentials.
 */
export async function withConnectRetry<T>(op: () => Promise<T>, deps: ConnectRetryDeps = {}): Promise<T> {
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const now = deps.now ?? Date.now;
  const log = deps.log ?? ((line: string) => console.error(line));
  const baseMs = Number(process.env.MIGRATE_CONNECT_RETRY_BASE_MS ?? 1000);
  const budgetMs = Number(process.env.MIGRATE_CONNECT_BUDGET_MS ?? 30000);
  const deadline = now() + budgetMs;
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      return await op();
    } catch (error) {
      // DDL / transaction / checksum / logic failures never enter the retry
      // path — rethrow immediately.
      if (classifyConnectError(error) !== 'connect') throw error;
      if (now() >= deadline) {
        log(`migrate_connect_retry: budget_exhausted budget_ms=${budgetMs} attempts=${attempt} class=connect error_name=${error instanceof Error ? error.name : 'non_error'}`);
        throw error;
      }
      const remaining = deadline - now();
      const waitMs = Math.max(0, Math.min(BACKOFF_CAP_MS, baseMs * 2 ** Math.min(attempt - 1, 10), remaining));
      log(`migrate_connect_retry: attempt=${attempt} class=connect backoff_ms=${waitMs} error_name=${error instanceof Error ? error.name : 'non_error'} error_message=${error instanceof Error ? error.message : String(error)}`);
      if (waitMs > 0) await sleep(waitMs);
    }
  }
}

/**
 * Connect-level warm-up for a pool: acquire a connection with the bounded
 * retry and release it.  Used by the migrate job (and its same-chain cost
 * configure step) before any semantic operation so that deployment-window
 * database jitter is absorbed HERE and nowhere else.
 */
export async function warmUpPool(pool: DbPool, deps: ConnectRetryDeps = {}): Promise<void> {
  await withConnectRetry(async () => {
    const client = await pool.connect();
    client.release();
  }, deps);
}
