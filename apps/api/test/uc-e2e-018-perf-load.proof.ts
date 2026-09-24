/**
 * UC-E2E-018 PERF/LOAD prove — NHP-018-PERF-01 + NHP-018-LOAD-01
 *
 * Method freeze (Step A ancestor required): nearest-rank · client e2e hrtime ·
 * timeout 10s=error · warmup 10 excluded · 3 repeat runs all-must-pass ·
 * caps Docker --cpus=2 --memory=4g · Ban post-hoc retune.
 *
 * Mouth: POST /api/interview/:id/abandon via real Nest HTTP (_neg-harness).
 * Stack: isolated real Postgres (run-e2e-isolated) · Ban MySQL/Qdrant fixtures.
 * Graph: LOAD seeds ai_graph_run · abandon path safe-terminates (PostgresSaver-
 * aligned product path on PG; no MySQL cutover).
 *
 * EXIT=0 only if ALL 3 runs of BOTH cases meet frozen thresholds + caps enforced.
 * Miss ⇒ EXIT≠0 · stay case-only · honest. Ban invent covered · §1.1 stays partial.
 *
 *   pnpm uc018:perf-load:prove
 *   pnpm -C apps/api prove:uc018-perf-load  (raw; needs isolated env + caps child)
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { asPrincipal, availableUnits, reserveEntitlement } from '@meetwise/db';
import { boot } from './_neg-harness';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const RAW_DIR = join(ROOT, '.tmp/uc018-perf-load-receipts');
const TRACKED_DIR = join(ROOT, 'ai-docs/delivery/receipts/uc018-perf-load');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const REQUEST_TIMEOUT_MS = 10_000;
const WARMUP = 10;
const REPEAT_RUNS = 3;
const PERF = { N: 100, c: 10, p50: 250, p95: 750, p99: 1500, errMax: 0.005 };
const LOAD = { N: 50, c: 20, errMax: 0.01 };

mkdirSync(RAW_DIR, { recursive: true });
mkdirSync(TRACKED_DIR, { recursive: true });

function gitSha(): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function machineInfo() {
  const read = (p: string) => {
    try {
      return readFileSync(p, 'utf8').trim();
    } catch {
      return '';
    }
  };
  const cpuinfo = read('/proc/cpuinfo');
  const model = (cpuinfo.match(/model name\s*:\s*(.+)/) || [])[1] || 'unknown';
  const cpuCount = (cpuinfo.match(/^processor\s*:/gm) || []).length || 0;
  const memTotalKb = Number((read('/proc/meminfo').match(/MemTotal:\s*(\d+)/) || [])[1] || 0);
  const kernel = read('/proc/sys/kernel/osrelease') || read('/proc/version').slice(0, 120);
  return {
    cpuModel: model,
    cpuCount,
    memTotalBytes: memTotalKb * 1024,
    kernel,
    platform: process.platform,
    node: process.version,
  };
}

function loadCapsEvidence(): Record<string, unknown> {
  if (!existsSync(CAPS_PATH)) {
    return {
      enforced: false,
      blocker: 'caps_evidence_file_missing',
      detail: `expected ${CAPS_PATH} from capped child wrapper`,
    };
  }
  try {
    return JSON.parse(readFileSync(CAPS_PATH, 'utf8')) as Record<string, unknown>;
  } catch (e) {
    return { enforced: false, blocker: 'caps_evidence_parse_failed', detail: String(e) };
  }
}

/** nearest-rank: p = sortedAsc[ceil(q·n) - 1] (1-indexed rank). */
function percentileNearestRank(sortedAsc: number[], q: number): number | null {
  if (sortedAsc.length === 0) return null;
  const rank = Math.ceil(q * sortedAsc.length);
  return sortedAsc[Math.min(Math.max(rank, 1), sortedAsc.length) - 1]!;
}

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!, i);
    }
  });
  await Promise.all(workers);
  return out;
}

type Sample = {
  ok: boolean;
  timedOut: boolean;
  status?: number;
  latencyMs?: number;
  error?: string;
};

function redactReceipt<T extends Record<string, unknown>>(r: T): T {
  const s = JSON.stringify(r);
  // Strip anything that looks like secrets / DSNs / cookies (defense in depth).
  const cleaned = s
    .replace(/postgres(ql)?:\/\/[^"'\s]+/gi, '[redacted-dsn]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/("password"\s*:\s*")[^"]+"/gi, '$1[redacted]"')
    .replace(/("PGPASSWORD"\s*:\s*")[^"]+"/gi, '$1[redacted]"')
    .replace(/meetwise_dev_password/gi, '[redacted]');
  return JSON.parse(cleaned) as T;
}

function writeReceipts(name: string, body: Record<string, unknown>) {
  const redacted = redactReceipt(body);
  const rawPath = join(RAW_DIR, name);
  const trackedPath = join(TRACKED_DIR, name);
  writeFileSync(rawPath, `${JSON.stringify(redacted, null, 2)}\n`);
  writeFileSync(trackedPath, `${JSON.stringify(redacted, null, 2)}\n`);
  return { rawPath, trackedPath };
}

console.log('UC-E2E-018 PERF/LOAD prove · NHP-018-PERF-01 + NHP-018-LOAD-01');
console.log('NOTE: Method freeze nearest-rank · timeout=10s=error · warmup=10 · runs=3 · caps Docker 2cpu/4GiB');
console.log('NOTE: local ≠ production capacity ≠ HA · PERF/LOAD partial ≠ UC covered · §1.1 stays partial');

const caps = loadCapsEvidence();
const capsEnforced = caps.enforced === true;
if (!capsEnforced) {
  console.log(`FAIL  caps not enforced: ${JSON.stringify(caps)}`);
}

const h = await boot();
const A_ = h.U('userA');
const S = Date.now().toString(36);
const sha = gitSha();
const machine = machineInfo();

// Privacy stubs (same as abandon HTTP / ADV)
await h.pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM interview i
     WHERE i.id = target_interview AND i.owner_user_id = principal
  );
END $$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);

await h.pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text,
    ADD COLUMN IF NOT EXISTS job_title_snapshot text,
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now()
`);

// Top up entitlement for N=100 + warmup + LOAD + margin
await h.pool.query(
  `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
   VALUES ('userA','paid',800.0, now()+interval '300 days')`,
);

async function timedAbandon(id: string): Promise<Sample> {
  const t0 = process.hrtime.bigint();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${h.base}/interview/${id}/abandon`, {
      method: 'POST',
      headers: { ...A_, 'content-type': 'application/json' },
      body: '{}',
      signal: ac.signal,
    });
    await res.json().catch(() => ({}));
    const latencyMs = Number(process.hrtime.bigint() - t0) / 1e6;
    clearTimeout(timer);
    const ok = res.status === 200;
    return { ok, timedOut: false, status: res.status, latencyMs, error: ok ? undefined : `http_${res.status}` };
  } catch (e: any) {
    clearTimeout(timer);
    const timedOut = e?.name === 'AbortError' || ac.signal.aborted;
    const latencyMs = Number(process.hrtime.bigint() - t0) / 1e6;
    return {
      ok: false,
      timedOut,
      latencyMs,
      error: timedOut ? 'timeout' : String(e?.code || e?.message || e),
    };
  }
}

async function seedAbandonTargets(prefix: string, count: number, withGraph: boolean): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = `${prefix}_${i}_${S}`;
    ids.push(id);
    await h.pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
      [id],
    );
    await asPrincipal(h.pool, 'userA', (c) =>
      reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
    if (withGraph) {
      await h.pool.query(
        `INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status, version)
         VALUES ('interview', $1, 'userA', 'active', 0)`,
        [id],
      );
    }
  }
  return ids;
}

type RunStats = {
  run: number;
  caseId: string;
  N: number;
  c: number;
  warmup: number;
  latenciesMs: number[];
  p50: number | null;
  p95: number | null;
  p99: number | null;
  errorCount: number;
  timeoutCount: number;
  errorRate: number;
  passed: boolean;
  missReasons: string[];
  start: string;
  end: string;
  doubleReleaseCount?: number;
  stuckReservationCount?: number;
  stuckGraphCount?: number;
};

async function runPerf(run: number): Promise<RunStats> {
  const start = new Date().toISOString();
  const prefix = `IV_P018_R${run}`;
  const ids = await seedAbandonTargets(prefix, PERF.N + WARMUP, false);
  const warmupIds = ids.slice(0, WARMUP);
  const measuredIds = ids.slice(WARMUP);

  for (const id of warmupIds) await timedAbandon(id);

  const samples = await mapPool(measuredIds, PERF.c, (id) => timedAbandon(id));
  const latencies = samples.filter((s) => s.ok && s.latencyMs != null).map((s) => s.latencyMs!).sort((a, b) => a - b);
  const errorCount = samples.filter((s) => !s.ok).length;
  const timeoutCount = samples.filter((s) => s.timedOut).length;
  const errorRate = errorCount / PERF.N;
  const p50 = percentileNearestRank(latencies, 0.5);
  const p95 = percentileNearestRank(latencies, 0.95);
  const p99 = percentileNearestRank(latencies, 0.99);
  const missReasons: string[] = [];
  if (p50 == null || p50 > PERF.p50) missReasons.push(`p50 ${p50} > ${PERF.p50}`);
  if (p95 == null || p95 > PERF.p95) missReasons.push(`p95 ${p95} > ${PERF.p95}`);
  if (p99 == null || p99 > PERF.p99) missReasons.push(`p99 ${p99} > ${PERF.p99}`);
  if (errorRate > PERF.errMax) missReasons.push(`errRate ${errorRate} > ${PERF.errMax}`);
  if (!capsEnforced) missReasons.push('caps_not_enforced');
  const end = new Date().toISOString();
  const stats: RunStats = {
    run, caseId: 'NHP-018-PERF-01', N: PERF.N, c: PERF.c, warmup: WARMUP,
    latenciesMs: latencies, p50, p95, p99, errorCount, timeoutCount, errorRate,
    passed: missReasons.length === 0, missReasons, start, end,
  };
  writeReceipts(`nhp-018-perf-01-run${run}.json`, {
    caseId: 'NHP-018-PERF-01',
    gitSha: sha,
    command: 'pnpm uc018:perf-load:prove',
    method: {
      percentile: 'nearest-rank',
      clock: 'client-hrtime-full-http-roundtrip',
      requestTimeoutMs: REQUEST_TIMEOUT_MS,
      warmup: WARMUP,
      repeatRuns: REPEAT_RUNS,
      disclosure: 'at N=100 nearest-rank p99 is the 99th-rank sample (near-worst; statistically weak)',
    },
    caps,
    N: PERF.N,
    c: PERF.c,
    warmup: WARMUP,
    thresholds: { p50: PERF.p50, p95: PERF.p95, p99: PERF.p99, errMax: PERF.errMax },
    rawLatenciesMs: latencies,
    p50, p95, p99,
    errorCount, timeoutCount, errorRate,
    start, end,
    machine,
    passed: stats.passed,
    missReasons,
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
  });
  console.log(
    `PERF run${run}: p50=${p50?.toFixed(1)} p95=${p95?.toFixed(1)} p99=${p99?.toFixed(1)} ` +
      `err=${errorCount} timeout=${timeoutCount} passed=${stats.passed}` +
      (missReasons.length ? ` miss=${missReasons.join(';')}` : ''),
  );
  return stats;
}

async function runLoad(run: number): Promise<RunStats> {
  const start = new Date().toISOString();
  const prefix = `IV_L018_R${run}`;
  const ids = await seedAbandonTargets(prefix, LOAD.N + WARMUP, true);
  const warmupIds = ids.slice(0, WARMUP);
  const measuredIds = ids.slice(WARMUP);

  for (const id of warmupIds) await timedAbandon(id);

  const samples = await mapPool(measuredIds, LOAD.c, (id) => timedAbandon(id));
  const latencies = samples.filter((s) => s.ok && s.latencyMs != null).map((s) => s.latencyMs!).sort((a, b) => a - b);
  const errorCount = samples.filter((s) => !s.ok).length;
  const timeoutCount = samples.filter((s) => s.timedOut).length;
  const errorRate = errorCount / LOAD.N;
  const p50 = percentileNearestRank(latencies, 0.5);
  const p95 = percentileNearestRank(latencies, 0.95);
  const p99 = percentileNearestRank(latencies, 0.99);

  // DB-level: no double-release (≤1 consumption row per reservation key; released once)
  const dbl = await h.pool.query(
    `SELECT COALESCE(SUM(cnt - 1), 0)::int AS excess
       FROM (
         SELECT idempotency_key, count(*)::int AS cnt
           FROM entitlement_consumption
          WHERE owner_user_id='userA' AND idempotency_key LIKE $1
          GROUP BY idempotency_key
         HAVING count(*) > 1
       ) t`,
    [`${prefix}_%`],
  );
  const doubleReleaseCount = Number(dbl.rows[0]?.excess ?? 0);

  const stuck = await h.pool.query(
    `SELECT count(*)::int AS n FROM entitlement_consumption
      WHERE owner_user_id='userA' AND idempotency_key LIKE $1 AND status='reserved'`,
    [`${prefix}_%`],
  );
  const stuckReservationCount = Number(stuck.rows[0]?.n ?? 0);

  const stuckGraph = await h.pool.query(
    `SELECT count(*)::int AS n FROM ai_graph_run
      WHERE owner_user_id='userA' AND thread_id LIKE $1
        AND status NOT IN ('safely_terminated','completed','failed')`,
    [`${prefix}_%`],
  );
  const stuckGraphCount = Number(stuckGraph.rows[0]?.n ?? 0);

  const missReasons: string[] = [];
  if (errorRate > LOAD.errMax) missReasons.push(`errRate ${errorRate} > ${LOAD.errMax}`);
  if (doubleReleaseCount > 0) missReasons.push(`doubleReleaseCount=${doubleReleaseCount}`);
  if (stuckReservationCount > 0) missReasons.push(`stuckReservationCount=${stuckReservationCount}`);
  if (stuckGraphCount > 0) missReasons.push(`stuckGraphCount=${stuckGraphCount}`);
  if (!capsEnforced) missReasons.push('caps_not_enforced');

  const end = new Date().toISOString();
  const stats: RunStats = {
    run, caseId: 'NHP-018-LOAD-01', N: LOAD.N, c: LOAD.c, warmup: WARMUP,
    latenciesMs: latencies, p50, p95, p99, errorCount, timeoutCount, errorRate,
    passed: missReasons.length === 0, missReasons, start, end,
    doubleReleaseCount, stuckReservationCount, stuckGraphCount,
  };
  writeReceipts(`nhp-018-load-01-run${run}.json`, {
    caseId: 'NHP-018-LOAD-01',
    gitSha: sha,
    command: 'pnpm uc018:perf-load:prove',
    method: {
      percentile: 'nearest-rank',
      clock: 'client-hrtime-full-http-roundtrip',
      requestTimeoutMs: REQUEST_TIMEOUT_MS,
      warmup: WARMUP,
      repeatRuns: REPEAT_RUNS,
    },
    caps,
    N: LOAD.N,
    c: LOAD.c,
    warmup: WARMUP,
    thresholds: { errMax: LOAD.errMax, noDoubleRelease: true, noStuckReservations: true },
    rawLatenciesMs: latencies,
    p50, p95, p99,
    errorCount, timeoutCount, errorRate,
    doubleReleaseCount, stuckReservationCount, stuckGraphCount,
    sqlChecks: {
      doubleReleaseExcessRows: doubleReleaseCount,
      stuckReserved: stuckReservationCount,
      nonTerminalGraphRuns: stuckGraphCount,
    },
    start, end,
    machine,
    passed: stats.passed,
    missReasons,
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
  });
  console.log(
    `LOAD run${run}: p50=${p50?.toFixed(1)} p95=${p95?.toFixed(1)} p99=${p99?.toFixed(1)} ` +
      `err=${errorCount} timeout=${timeoutCount} dblRel=${doubleReleaseCount} stuck=${stuckReservationCount} ` +
      `stuckGraph=${stuckGraphCount} passed=${stats.passed}` +
      (missReasons.length ? ` miss=${missReasons.join(';')}` : ''),
  );
  return stats;
}

const perfRuns: RunStats[] = [];
const loadRuns: RunStats[] = [];
for (let r = 1; r <= REPEAT_RUNS; r++) {
  perfRuns.push(await runPerf(r));
  loadRuns.push(await runLoad(r));
}

const allPass = capsEnforced && perfRuns.every((x) => x.passed) && loadRuns.every((x) => x.passed);
const summary = {
  knife: 'UC-E2E-018-PERF-LOAD',
  gap: 'GAP-UC018-PERF-LOAD',
  gitSha: sha,
  command: 'pnpm uc018:perf-load:prove',
  caps,
  capsEnforced,
  methodFreezeAncestorRequired: true,
  perfRuns: perfRuns.map(({ latenciesMs: _l, ...rest }) => rest),
  loadRuns: loadRuns.map(({ latenciesMs: _l, ...rest }) => rest),
  allPass,
  elevateEligible: allPass,
  haStatus: 'NOT_HA',
  releaseEvidence: false,
  claimProductionHA: false,
  note: 'PERF/LOAD partial ≠ UC covered · §1.1 stays partial · local ≠ capacity ≠ HA',
  machine,
};
writeReceipts('summary.json', summary);

console.log(`\nSUMMARY allPass=${allPass} capsEnforced=${capsEnforced}`);
console.log(`CMD=pnpm uc018:perf-load:prove EXIT=${allPass ? 0 : 1}`);
process.exit(allPass ? 0 : 1);
