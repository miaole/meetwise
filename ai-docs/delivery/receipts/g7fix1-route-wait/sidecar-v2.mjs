#!/usr/bin/env node
// G7P-5 start-step capture knife · sidecar v2 (SELECT-only frozen projection · 1000ms)
// Discipline (CMOP03-D nail five items — v2 policy carrier = this file + exec receipt §sidecar):
//  1. anchor = wrapper stdout `E2E_POSTGRES_READY label=post-migrate` (Ban container_found anchor)
//  2. 42P01 family before first-ok tick => class `pending` (not failure budget)
//  3. stop-needle counter armed ONLY post-first-ok (5 consecutive failures => stop)
//  4. v2 policy in writing (this file + exec receipt)
//  5. must-read faces: interview_job (status/attempts) + ai_model_invocation (dual count) every tick
// + CMOP03-E/G7P-4 forward discipline: exact container name+port binding (parsed from wrapper log),
//   created_at >= runStart window (timestamptz via to_timestamp), migrations relevance = count=152 & max=0151
//   (152-face pin, G7P-4 run 实测 applied=152 latest=0151) — mismatch => discard+register (Ban prefix-match误靶).
// Zero row content / zero PII: aggregates only. est live <=25 dual-count; chain cumulative 0+0+14 起点·硬帽 200.
import { readFileSync, existsSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const wrapperLog = process.argv[2];
const outDir = '.tmp/g7fix1-sidecar'; // g7fix1-route-wait re-home (provenance: receipts/g7p5-start-capture/sidecar-v2.mjs @941425c6, logic unchanged)
mkdirSync(outDir, { recursive: true });
const ticksPath = `${outDir}/ticks.jsonl`;
const finalPath = `${outDir}/final.json`;
const stopPath = `${outDir}/STOP`;
const POLL_MS = 1000;
const MAX_CONSECUTIVE_FAILURES_POST_OK = 5;
const runStartMs = Date.now();

let buf = '';
let offset = 0;
let anchorSeen = false;          // E2E_POSTGRES_READY label=post-migrate
let container = null, port = null;
let correlationChecked = false, correlationMatch = null;
let firstOkSeen = false;
let consecutiveFailures = 0;
let stopped = null;
let tickNo = 0;
const state = { pending42P01: 0, fallbackUsed: false };

function log(m) { console.log(`[sidecar ${new Date().toISOString()}] ${m}`); }
function tickLine(obj) { appendFileSync(ticksPath, JSON.stringify(obj) + '\n'); }

function readNew() {
  if (!existsSync(wrapperLog)) return false;
  const s = readFileSync(wrapperLog, 'utf8');
  if (s.length > offset) { buf = s.slice(offset); offset = s.length; return true; }
  return false;
}

function scan() {
  if (!readNew()) return;
  for (const line of buf.split('\n')) {
    const m = line.match(/E2E isolated PostgreSQL: (\S+) on 127\.0\.0\.1:(\d+)/);
    if (m && (!container || m[1] !== container)) {
      container = m[1]; port = m[2];
      anchorSeen = false; firstOkSeen = false; consecutiveFailures = 0; correlationChecked = false;
      log(`CONTAINER BIND exact=${container} port=${port}`);
      tickLine({ ts: new Date().toISOString(), phase: 'container', container, port });
    }
    if (/E2E_POSTGRES_READY label=post-migrate/.test(line) && !anchorSeen) {
      anchorSeen = true;
      log(`ANCHOR post-migrate seen (v2 anchor; Ban container_found anchor) container=${container}`);
      tickLine({ ts: new Date().toISOString(), phase: 'anchor', anchored: true, runStart: new Date(runStartMs).toISOString() });
    }
  }
}

function sh(cmd, args, timeoutMs = 8000) {
  return execFileSync(cmd, args, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] });
}

function psql(sql) {
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

const win = `to_timestamp(${runStartMs}/1000.0)`; // timestamptz window (schema: created_at timestamptz both tables)
const QUERIES = {
  ai_model_invocation_status: `SELECT status, count(*) FROM ai_model_invocation WHERE created_at >= ${win} GROUP BY status ORDER BY status`,
  interview_job_status: `SELECT status, count(*), max(attempts) FROM interview_job WHERE created_at >= ${win} GROUP BY status ORDER BY status`,
  migration_relevance: `SELECT count(*)||'/'||coalesce(max(version),'none') FROM schema_migrations`,
};

function correlation() {
  const r = psql(QUERIES.migration_relevance);
  if (!r.ok) { correlationMatch = false; tickLine({ ts: new Date().toISOString(), phase: 'correlation', error: r.err }); return; }
  const [count, maxv] = (r.rows[0] || '').split('/');
  const match = Number(count) === 152 && maxv === '0151';
  correlationChecked = true; correlationMatch = match;
  tickLine({ ts: new Date().toISOString(), phase: 'correlation', migrations: Number(count), max: maxv, expected: 152, expectedMax: '0151', match });
  log(`CORRELATION migrations=${count} max=${maxv} match=${match}${match ? '' : ' (DISCARD+REGISTER per forward discipline)'}`);
}

function poll() {
  const t = { ts: new Date().toISOString(), phase: 'poll', queries: {} };
  let anyOk = false, saw42P01 = false;
  for (const [name, sql] of Object.entries(QUERIES)) {
    if (name === 'migration_relevance') continue;
    const r = psql(sql);
    t.queries[name] = r.ok ? { ok: true, via: r.via, rows: r.rows.slice(0, 12) } : { ok: false, err: r.err };
    if (r.ok) anyOk = true; else if (/42P01|does not exist/.test(r.err || '')) saw42P01 = true;
  }
  if (!anyOk && saw42P01) { t.class = 'pending-migration'; state.pending42P01 += 1; tickLine(t); return t; }
  if (anyOk) {
    if (!firstOkSeen) { firstOkSeen = true; log('first-ok tick (stop-needle ARMED post-first-ok)'); }
    consecutiveFailures = 0;
    t.class = 'ok';
  } else {
    t.class = anchorSeen ? 'post-anchor-error' : 'pre-anchor-error';
    if (firstOkSeen) {
      consecutiveFailures += 1;
      t.consecutiveFailuresPostOk = consecutiveFailures;
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES_POST_OK) stopped = `stop-needle: ${consecutiveFailures} consecutive failures post-first-ok`;
    }
  }
  tickLine(t);
  return t;
}

log(`sidecar v2 start; wrapperLog=${wrapperLog}; runStart=${runStartMs}; discipline: post-migrate anchor / 42P01 pending / stop-needle armed post-first-ok (>=5) / per-query guarded / SELECT-only aggregates / migrations 152+0151 relevance / est<=25 dual-count chain 0+0+14 cap200`);
let lastPoll = null;
let pollCount = 0;
while (!stopped) {
  scan();
  if (existsSync(stopPath)) { stopped = 'STOP sentinel by orchestrator (wrapper exited)'; break; }
  if (Date.now() - runStartMs > 45 * 60 * 1000) { stopped = 'max duration cap 45m'; break; }
  if (container && anchorSeen) {
    if (!correlationChecked) correlation();
    if (correlationMatch) { lastPoll = poll(); pollCount += 1; } else { stopped = 'correlation mismatch => discard (registered)'; break; }
  }
  if (stopped) break;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, POLL_MS);
}
const summary = {
  discipline: 'sidecar v2 (post-migrate anchor / 42P01 pending / stop-needle armed post-first-ok / per-query guarded / SELECT-only aggregates / migrations 152+0151 relevance)',
  wrapperLog, container, port, anchorSeen, firstOkSeen, correlationChecked, correlationMatch,
  pending42P01Ticks: state.pending42P01, fallbackUsed: state.fallbackUsed,
  runStartMs, runStartIso: new Date(runStartMs).toISOString(),
  pollCount, lastPoll, stoppedReason: stopped,
};
writeFileSync(finalPath, JSON.stringify(summary, null, 2));
log(`STOPPED: ${stopped}; pending42P01=${state.pending42P01} anchorSeen=${anchorSeen} firstOk=${firstOkSeen} correlationMatch=${correlationMatch}`);
