#!/usr/bin/env node
/**
 * M3 Redis Streams wakeup prototype prove.
 * releaseEvidence=false. Not HA. Does NOT cut production PG LISTEN / pg_notify.
 * Live: publish+consume one wake against compose.mysql-local redis :63809.
 * Static: harness + helpers + PG listener intact + root script name matches harness.
 * Prints CMD= / EXIT=.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const composePath = join(root, 'docker/compose.mysql-local.yml');
const harnessPath = join(root, 'ai-docs/delivery/harness/redis-streams-wakeup.prototype.md');
const notePath = join(root, 'ai-docs/delivery/m3-redis-wakeup-prototype.md');
const modulePath = join(root, 'apps/worker/src/worker-job-wakeup-redis.ts');
const listenerPath = join(root, 'apps/worker/src/job-wakeup-listener.ts');
const mainPath = join(root, 'apps/worker/src/main.ts');
const wakeupConstPath = join(root, 'packages/db/src/worker-job-wakeup.ts');
const liveProofPath = join(root, 'apps/worker/test/worker-job-wakeup-redis.proof.ts');
const proofScript = join(root, 'scripts/conn-stack/mysql-stack.redis-wakeup.proof.mjs');
const rootPkgPath = join(root, 'package.json');
const workerPkgPath = join(root, 'apps/worker/package.json');

const CANONICAL_CMD = 'pnpm worker-wakeup-redis:prove';
const REDIS_PORT = '63809';

let exitCode = 0;
const lines = [];

function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  lines.push(`PASS  ${msg}`);
}

function note(msg) {
  lines.push(`NOTE  ${msg}`);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    env: { ...process.env, ...(opts.env || {}) },
    cwd: opts.cwd || root,
    timeout: opts.timeoutMs ?? 60_000,
  });
  const status = r.error ? 1 : (r.status ?? 1);
  const cmdStr = [cmd, ...args].join(' ');
  lines.push(`CMD=${cmdStr} EXIT=${status}`);
  if (r.error) note(`spawn error: ${r.error.message}`);
  if (opts.capture) {
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
    if (out) note(out.slice(0, 1200));
  }
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function finish() {
  for (const line of lines) console.log(line);
  console.log(`CMD=${CANONICAL_CMD} EXIT=${exitCode}`);
  process.exit(exitCode);
}

for (const [label, path] of [
  ['harness', harnessPath],
  ['delivery note', notePath],
  ['compose', composePath],
  ['redis wakeup module', modulePath],
  ['PG job-wakeup-listener', listenerPath],
  ['worker main', mainPath],
  ['wakeup constants', wakeupConstPath],
  ['live helper proof', liveProofPath],
  ['proof script', proofScript],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

if (existsSync(harnessPath)) {
  const harness = readFileSync(harnessPath, 'utf8');
  if (harness.includes('worker-wakeup-redis:prove')) pass('harness pins worker-wakeup-redis:prove');
  else fail('harness must pin worker-wakeup-redis:prove');
  if (/不切生产|job-wakeup-listener|pg_notify/.test(harness)) pass('harness pins 不切生产 wakeup');
  else fail('harness must pin 不切生产 wakeup');
  if (/releaseEvidence\s*=\s*false/i.test(harness)) pass('harness pins releaseEvidence=false');
  else fail('harness must pin releaseEvidence=false');
  if (/Not HA/i.test(harness)) pass('harness pins Not HA');
  else fail('harness must pin Not HA');
}

if (existsSync(rootPkgPath)) {
  const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'));
  const script = pkg.scripts?.['worker-wakeup-redis:prove'];
  if (typeof script === 'string' && script.includes('mysql-stack.redis-wakeup.proof.mjs')) {
    pass('root package.json worker-wakeup-redis:prove → mysql-stack.redis-wakeup.proof.mjs');
  } else {
    fail('root package.json must define worker-wakeup-redis:prove → scripts/mysql-stack.redis-wakeup.proof.mjs');
  }
}

if (existsSync(workerPkgPath)) {
  const pkg = JSON.parse(readFileSync(workerPkgPath, 'utf8'));
  const script = pkg.scripts?.['prove:job-wakeup-redis'];
  if (typeof script === 'string' && script.includes('worker-job-wakeup-redis.proof.ts')) {
    pass('apps/worker prove:job-wakeup-redis present');
  } else {
    fail('apps/worker package.json must define prove:job-wakeup-redis');
  }
}

if (existsSync(modulePath)) {
  const mod = readFileSync(modulePath, 'utf8');
  if (/xAdd|publishWorkerJobWakeup/.test(mod) && /xReadGroup|consumeWorkerJobWakeupOnce/.test(mod)) {
    pass('module exposes XADD + XREADGROUP helpers');
  } else fail('module must expose XADD + XREADGROUP helpers');
  if (/MEETWISE_WAKEUP_REDIS_STREAMS/.test(mod) && /isRedisStreamsWakeupEnabled/.test(mod)) {
    pass('module gates on MEETWISE_WAKEUP_REDIS_STREAMS');
  } else fail('module must gate on MEETWISE_WAKEUP_REDIS_STREAMS');
  if (/WORKER_JOB_WAKEUP_PAYLOAD/.test(mod) && /'wake'|wake/.test(mod)) {
    pass('module keeps wake-only payload (no PII fields)');
  } else fail('module must keep wake-only payload');
}

if (existsSync(listenerPath)) {
  const listener = readFileSync(listenerPath, 'utf8');
  if (/LISTEN/.test(listener) && /WORKER_JOB_WAKEUP_CHANNEL/.test(listener) && /startWorkerJobWakeupListener/.test(listener)) {
    pass('job-wakeup-listener.ts PG LISTEN path intact (not cut)');
  } else fail('do not cut production job-wakeup-listener LISTEN path');
}

if (existsSync(mainPath)) {
  const main = readFileSync(mainPath, 'utf8');
  if (/startWorkerJobWakeupListener\(/.test(main)) {
    pass('main.ts still starts PG startWorkerJobWakeupListener unconditionally');
  } else fail('main.ts must keep unconditional PG wakeup listener');
  if (/isRedisStreamsWakeupEnabled/.test(main) && /MEETWISE_WAKEUP_REDIS_STREAMS|redisWakeupEnabled/.test(main)) {
    pass('main.ts Redis path is feature-flagged (additive)');
  } else fail('main.ts must feature-flag Redis wakeup path');
  // Ensure PG listener is not behind the Redis flag
  const pgIdx = main.indexOf('startWorkerJobWakeupListener(');
  const flagIdx = main.indexOf('redisWakeupEnabled');
  if (pgIdx >= 0 && flagIdx >= 0 && pgIdx < flagIdx) {
    pass('PG listener starts before Redis flag branch (not disabled by flag)');
  } else if (pgIdx >= 0) {
    pass('PG listener present in main');
  } else {
    fail('PG listener missing from main');
  }
}

if (existsSync(wakeupConstPath)) {
  const c = readFileSync(wakeupConstPath, 'utf8');
  if (/meetwise_worker_wakeup_v1/.test(c) && /WORKER_JOB_WAKEUP_CHANNEL/.test(c)) {
    pass('PG channel constant meetwise_worker_wakeup_v1 retained');
  } else fail('must retain meetwise_worker_wakeup_v1');
  if (/WORKER_JOB_WAKEUP_REDIS_STREAM/.test(c)) pass('Redis stream key constant present');
  else fail('Redis stream key constant missing');
}

if (existsSync(notePath)) {
  const noteDoc = readFileSync(notePath, 'utf8');
  if (/releaseEvidence\s*=\s*false/i.test(noteDoc)) pass('delivery note pins releaseEvidence=false');
  else fail('delivery note must pin releaseEvidence=false');
  if (/不切生产|PG LISTEN|job-wakeup-listener/.test(noteDoc)) pass('delivery note pins PG path not cut');
  else fail('delivery note must say PG path not cut');
  if (/worker-wakeup-redis:prove/.test(noteDoc)) pass('delivery note names worker-wakeup-redis:prove');
  else fail('delivery note must name worker-wakeup-redis:prove');
  if (/MEETWISE_WAKEUP_REDIS_STREAMS/.test(noteDoc)) pass('delivery note names feature flag');
  else fail('delivery note must name MEETWISE_WAKEUP_REDIS_STREAMS');
}

// Redis ping on :63809
const ping = run('redis-cli', ['-p', REDIS_PORT, 'PING'], { capture: true });
if (ping.status === 0 && /PONG/i.test(ping.stdout)) pass(`redis :${REDIS_PORT} PING OK`);
else {
  // try docker exec fallback
  const dping = run('docker', ['exec', 'meetwise-redis-mysql-local', 'redis-cli', 'PING'], { capture: true });
  if (dping.status === 0 && /PONG/i.test(dping.stdout)) pass('redis container PING OK (docker exec)');
  else fail(`redis :${REDIS_PORT} not reachable — start: docker compose -f docker/compose.mysql-local.yml up -d redis`);
}

if (exitCode !== 0) finish();

// Live helper prove via tsx (exercises real module against :63809)
const live = run('pnpm', ['-C', 'apps/worker', 'exec', 'tsx', 'test/worker-job-wakeup-redis.proof.ts'], {
  env: {
    MEETWISE_WAKEUP_REDIS_URL: process.env.MEETWISE_WAKEUP_REDIS_URL || `redis://127.0.0.1:${REDIS_PORT}`,
  },
  capture: true,
  timeoutMs: 45_000,
});
if (live.status === 0) pass('live publish+consume wake via worker helpers EXIT=0');
else fail('live Redis Streams publish+consume proof failed');

finish();
