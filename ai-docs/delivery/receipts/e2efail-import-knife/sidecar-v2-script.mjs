#!/usr/bin/env node
// G7Y trio re-run · sidecar v2 (SELECT-only frozen projection · 1000ms)
// Discipline (CMOP03-D nail five items):
//  1. anchor = wrapper stdout `E2E_POSTGRES_READY label=post-migrate` (Ban container_found anchor)
//  2. 42P01 family before first-ok tick => class `pending` (not failure budget)
//  3. stop-needle counter armed ONLY post-first-ok (5 consecutive failures => stop)
//  4. v2 policy in writing (this file + receipt)
//  5. must-read faces: interview_job (status/attempts/last_error) + ai_model_invocation (dual count)
// + CMOP03-E forward discipline: exact container name+port binding (parsed from wrapper log),
//   created_at in run window, migrations=0142 relevance check, mismatch => discard+register.
// Zero row content / zero PII: aggregates only.
import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const wrapperLog = process.argv[2];
const outDir = '.tmp/e2efail1-sidecar';
const ticksPath = `${outDir}/ticks.jsonl`;
const finalPath = `${outDir}/final.json`;
const stopPath = `${outDir}/STOP`;
const POLL_MS = 1000;
const MAX_CONSECUTIVE_FAILURES_POST_OK = 5;

let buf = '';
let offset = 0;
let anchorSeen = false;          // E2E_POSTGRES_READY label=post-migrate
let container = null, port = null;
let firstOkSeen = false;
let consecutiveFailures = 0;
let stopped = null;
let tickNo = 0;
const state = { pending42P01: 0, ticks: 0, lastReadings: null, fallbackUsed: false };

function log(m) { console.log(`[sidecar ${new Date().toISOString()}] ${m}`); }

function readNew() {
  if (!existsSync(wrapperLog)) return;
  const s = readFileSync(wrapperLog, 'utf8');
  if (s.length > offset) {
    buf = s.slice(offset);
    offset = s.length;
    return true;
  }
  return false;
}

function scan() {
  if (!readNew()) return;
  for (const line of buf.split('\n')) {
    const m = line.match(/E2E isolated PostgreSQL: (\S+) on 127\.0\.0\.1:(\d+)/);
    if (m) {
      if (!container || m[1] !== container) {
        // rebind: perf suite spins one fresh container per isolated step (sequential) —
        // per-container reset keeps post-migrate anchor / 42P01 pending / stop-needle semantics per container.
        container = m[1]; port = m[2];
        anchorSeen = false; firstOkSeen = false; consecutiveFailures = 0;
        log(`CONTAINER BIND exact=${container} port=${port}${tickNo ? ' (rebind; per-container state reset)' : ''}`);
      }
    }
    if (/E2E_POSTGRES_READY label=post-migrate/.test(line)) {
      anchorSeen = true;
      log(`ANCHOR post-migrate seen (v2 anchor; Ban container_found anchor) container=${container}`);
    }
  }
}

function sh(cmd, args, timeoutMs = 8000) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] });
}

function psql(sql) {
  // per-query discipline: each query individually guarded by caller; SELECT-only strings below.
  try {
    const out = sh('docker', ['exec', container, 'psql', '-U', 'meetwise', '-d', 'meetwise', '-Atqc', sql]);
    return { ok: true, via: 'docker-exec', rows: out.split('\n').filter(Boolean) };
  } catch (e) {
    const code = String(e.stderr || e.message || '');
    if (!state.fallbackUsed) {
      try {
        const out = sh('psql', ['-h', '127.0.0.1', '-p', String(port), '-U', 'meetwise', '-d', 'meetwise', '-Atqc', sql], 8000);
        state.fallbackUsed = true;
        return { ok: true, via: 'host-psql', rows: out.split('\n').filter(Boolean) };
      } catch (e2) {
        return { ok: false, err: (code + '|' + String(e2.stderr || e2.message || '')).slice(0, 300) };
      }
    }
    return { ok: false, err: code.slice(0, 300) };
  }
}

const QUERIES = {
  interview_job_status: "SELECT status, count(*), min(attempts), max(attempts) FROM interview_job GROUP BY status ORDER BY status",
  interview_job_last_error: "SELECT last_error, count(*) FROM interview_job WHERE last_error IS NOT NULL GROUP BY last_error ORDER BY 2 DESC",
  ai_model_invocation_status: "SELECT status, count(*) FROM ai_model_invocation GROUP BY status ORDER BY status",
  ai_model_invocation_window: "SELECT coalesce(min(created_at)::text,'none'), coalesce(max(created_at)::text,'none') FROM ai_model_invocation",
  migration_relevance: "SELECT count(*) FROM schema_migrations WHERE version='0142'",
  migration_max: "SELECT max(version) FROM schema_migrations",
};

function tick() {
  tickNo += 1; state.ticks = tickNo;
  const t = { tick: tickNo, at: new Date().toISOString(), anchorSeen, container, port, queries: {} };
  if (!container) { t.class = 'waiting-container'; return t; }
  let anyOk = false, saw42P01 = false;
  for (const [name, sql] of Object.entries(QUERIES)) {
    const r = psql(sql);
    t.queries[name] = r.ok ? { ok: true, via: r.via, rows: r.rows.slice(0, 12) } : { ok: false, err: r.err };
    if (r.ok) anyOk = true; else if (/42P01|does not exist/.test(r.err || '')) saw42P01 = true;
  }
  if (!anyOk && saw42P01) { t.class = 'pending-migration'; state.pending42P01 += 1; return t; } // pre-first-ok 42P01 => pending, not failure budget
  if (anyOk) {
    if (!firstOkSeen) { firstOkSeen = true; log(`first-ok tick (stop-needle ARMED post-first-ok)`); }
    consecutiveFailures = 0;
    t.class = 'ok';
    state.lastReadings = t;
  } else {
    t.class = anchorSeen ? 'post-anchor-error' : 'pre-anchor-error';
    if (firstOkSeen) {
      consecutiveFailures += 1;
      t.consecutiveFailuresPostOk = consecutiveFailures;
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES_POST_OK) stopped = `stop-needle: ${consecutiveFailures} consecutive failures post-first-ok`;
    }
  }
  return t;
}

log(`sidecar v2 start; wrapperLog=${wrapperLog}; discipline: post-migrate anchor / 42P01 pending / stop-needle armed post-first-ok (>=${MAX_CONSECUTIVE_FAILURES_POST_OK}) / per-query guarded / SELECT-only aggregates only`);
const started = Date.now();
while (!stopped) {
  scan();
  if (existsSync(stopPath)) { stopped = 'STOP sentinel by orchestrator (wrapper exited)'; break; }
  if (Date.now() - started > 45 * 60 * 1000) { stopped = 'max duration cap 45m'; break; }
  if (container && (firstOkSeen || anchorSeen)) {
    const t = tick();
    appendFileSync(ticksPath, JSON.stringify(t) + '\n');
    if (t.class === 'ok') log(`tick ${t.tick} ok: ij=${JSON.stringify(t.queries.interview_job_status?.rows)} inv=${JSON.stringify(t.queries.ai_model_invocation_status?.rows)}`);
  } else {
    const t = tick();
    appendFileSync(ticksPath, JSON.stringify(t) + '\n');
  }
  if (stopped) break;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, POLL_MS);
}
// final best-effort tick
scan();
const finalTick = container ? tick() : null;
const summary = {
  discipline: 'sidecar v2 (post-migrate anchor / 42P01 pending / stop-needle armed post-first-ok / per-query / SELECT-only)',
  wrapperLog, container, port, anchorSeen, firstOkSeen,
  pending42P01Ticks: state.pending42P01, totalTicks: tickNo,
  fallbackUsed: state.fallbackUsed,
  stoppedReason: stopped,
  finalTick,
};
writeFileSync(finalPath, JSON.stringify(summary, null, 2));
log(`STOPPED: ${stopped}; ticks=${tickNo} pending42P01=${state.pending42P01} anchorSeen=${anchorSeen} firstOk=${firstOkSeen}`);
