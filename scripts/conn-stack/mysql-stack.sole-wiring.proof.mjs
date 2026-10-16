#!/usr/bin/env node
/**
 * Sole-stack wiring prove — MySQL + Qdrant + Redis connectivity + env attestation.
 *
 * Advances isolated sole track past permanent EXIT=3 dead-end for the *allowlisted*
 * wiring target only. Does NOT default isolated to sole. Does NOT retire E2E_PG_IMAGE.
 * Does NOT claim disposable per-run fixtures, RAG migrated, fixtures retired, HA, or
 * releaseEvidence=true.
 *
 * Ports (compose.mysql-local.yml local-dev placeholders only — never .env*):
 *   MySQL 127.0.0.1:33069 · Redis 127.0.0.1:63809 · Qdrant http://127.0.0.1:6333/readyz
 *
 * releaseEvidence=false · Not HA · local green ≠ HA · 本绿≠已迁 · ≠ cutover
 */
import { existsSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const composePath = join(root, 'docker/compose.mysql-local.yml');
const scriptPath = join(root, 'scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs');
const receiptRoot = join(root, '.tmp', 'sole-stack-receipts');

const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = process.env.MYSQL_PORT || '33069';
const MYSQL_USER = process.env.MYSQL_USER || 'meetwise';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'meetwise_dev_password';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'meetwise';
const REDIS_URL = process.env.REDIS_URL || `redis://127.0.0.1:63809`;
const QDRANT_URL = (process.env.QDRANT_URL || 'http://127.0.0.1:6333').replace(/\/$/, '');
const QDRANT_READYZ = `${QDRANT_URL}/readyz`;
const STACK = 'mysql-qdrant-redis';

let exitCode = 0;
const lines = [];
const startedAt = new Date();

function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}
function pass(msg) {
  lines.push(`PASS  ${msg}`);
}
function which(bin) {
  const r = spawnSync('sh', ['-c', `command -v ${bin}`], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
}
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    env: process.env,
    cwd: root,
    timeout: opts.timeoutMs ?? 30_000,
  });
  const status = r.error ? 1 : (r.status ?? 1);
  lines.push(`CMD=${[cmd, ...args].join(' ')} EXIT=${status}`);
  if (r.error) lines.push(`NOTE  spawn error: ${r.error.message}`);
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

if (!existsSync(composePath)) fail(`compose missing: ${composePath}`);
else pass(`compose present: ${composePath}`);
if (!existsSync(scriptPath)) fail(`proof script missing: ${scriptPath}`);
else pass(`proof script present: ${scriptPath}`);

const isolationStack = String(process.env.E2E_ISOLATION_STACK ?? '').trim();
const isolated = String(process.env.E2E_ISOLATED ?? '').trim();
if (isolationStack === STACK) pass(`E2E_ISOLATION_STACK=${STACK}`);
else {
  // Standalone conn-stack path allowed, but must not pretend runner sole track.
  lines.push(`NOTE  E2E_ISOLATION_STACK=${isolationStack || '(unset)'} — standalone sole-wiring; runner path sets ${STACK}`);
}
if (isolated === '1') pass('E2E_ISOLATED=1 (via isolated runner)');
else lines.push('NOTE  E2E_ISOLATED unset — standalone sole-wiring (conn-stack)');

// Forbid inheriting cloud data-plane when run under isolated runner.
const forbidden = [
  'DATABASE_URL', 'DATABASE_SSL_CA_PATH', 'QBANK_CONTROL_DATABASE_URL',
  'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
  'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
  'LANGSMITH_API_KEY', 'DASHSCOPE_API_KEY',
];
const leaked = [
  ...forbidden.filter((k) => process.env[k]),
  ...Object.keys(process.env).filter((k) => k.startsWith('LANGFUSE_')),
];
if (isolated === '1' && leaked.length) fail(`cloud data-plane leaked under isolated sole: ${leaked.join(',')}`);
else if (isolated === '1') pass('cloud data-plane/tracing vars absent under isolated sole');

// Env pin when runner injects sole URLs
if (process.env.REDIS_URL && !/63809/.test(process.env.REDIS_URL)) {
  fail(`REDIS_URL must point at compose redis :63809 (got non-63809)`);
} else if (process.env.REDIS_URL) {
  pass(`REDIS_URL attested loopback sole redis (${REDIS_URL.replace(/:[^:@/]+@/, ':***@')})`);
}
if (process.env.QDRANT_URL && !/6333/.test(process.env.QDRANT_URL)) {
  fail('QDRANT_URL must point at compose qdrant :6333');
} else if (process.env.QDRANT_URL) {
  pass(`QDRANT_URL attested ${QDRANT_URL}`);
}
if (process.env.MYSQL_PORT && process.env.MYSQL_PORT !== '33069') {
  fail('MYSQL_PORT must be compose published 33069 for sole-wiring');
} else if (process.env.MYSQL_PORT) {
  pass(`MYSQL_PORT attested ${MYSQL_PORT}`);
}

const composeVer = run('docker', ['compose', 'version']);
if (composeVer.status !== 0) fail('docker compose plugin unavailable');
else pass('docker compose plugin available');

// --- mysql ---
let mysqlOk = false;
if (which('mysqladmin')) {
  mysqlOk = run('mysqladmin', ['ping', `-h${MYSQL_HOST}`, `-P${MYSQL_PORT}`, `-u${MYSQL_USER}`, `-p${MYSQL_PASSWORD}`]).status === 0;
} else {
  mysqlOk = run('docker', [
    'run', '--rm', '--network', 'host', 'mysql:8.4',
    'mysqladmin', 'ping', `-h${MYSQL_HOST}`, `-P${MYSQL_PORT}`, `-u${MYSQL_USER}`, `-p${MYSQL_PASSWORD}`,
  ]).status === 0;
  lines.push('NOTE  host mysqladmin absent; used docker run --network host mysql:8.4 mysqladmin');
}
if (mysqlOk) pass('mysql sole-wiring ping OK');
else fail('mysql sole-wiring ping failed — start: docker compose -f docker/compose.mysql-local.yml up -d mysql');

// --- redis ---
let redisOk = false;
const redisPortMatch = REDIS_URL.match(/:(\d+)(?:\/|$)/);
const redisPort = redisPortMatch ? redisPortMatch[1] : '63809';
if (which('redis-cli')) {
  const r = run('redis-cli', ['-p', redisPort, 'PING']);
  redisOk = r.status === 0 && /\bPONG\b/i.test(r.stdout);
} else {
  const r = run('docker', ['run', '--rm', '--network', 'host', 'redis:7-alpine', 'redis-cli', '-p', redisPort, 'PING']);
  redisOk = r.status === 0 && /\bPONG\b/i.test(r.stdout);
  lines.push('NOTE  host redis-cli absent; used docker run --network host redis:7-alpine redis-cli');
}
if (redisOk) pass('redis sole-wiring ping OK');
else fail('redis sole-wiring ping failed — start: docker compose -f docker/compose.mysql-local.yml up -d redis');

// --- qdrant ---
let qdrantOk = false;
if (which('curl')) {
  qdrantOk = run('curl', ['-sf', QDRANT_READYZ]).status === 0;
} else fail('curl unavailable for qdrant readyz');
if (qdrantOk) pass('qdrant sole-wiring readyz OK');
else if (which('curl')) fail('qdrant sole-wiring readyz failed — start: docker compose -f docker/compose.mysql-local.yml up -d qdrant');

lines.push('NOTE  sole-wiring EXIT=0 ⇒ compose MySQL+Qdrant+Redis reachable + env attested only');
lines.push('NOTE  ≠ fixtures retired · ≠ isolated default switched · ≠ disposable per-run sole fixtures');
lines.push('NOTE  ≠ Qdrant-backed RAG/memory default · ≠ E2E_PG_IMAGE retired · ≠ cutover · ≠ migrated');
lines.push('NOTE  releaseEvidence=false · Not HA · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence');

const finishedAt = new Date();
try {
  mkdirSync(receiptRoot, { recursive: true, mode: 0o700 });
  const id = `${finishedAt.toISOString().replace(/[:.]/g, '-')}-${process.pid}-${randomUUID()}`;
  const finalPath = join(receiptRoot, `${id}.json`);
  const partialPath = join(receiptRoot, `${id}.partial.json`);
  const receipt = {
    schemaVersion: 1,
    class: 'local_untrusted_sole_stack_wiring_receipt',
    stack: STACK,
    target: 'sole-stack:wiring:prove',
    outcome: exitCode === 0 ? 'passed' : 'failed',
    exitCode,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    compose: 'docker/compose.mysql-local.yml',
    ports: { mysql: MYSQL_PORT, redis: redisPort, qdrant: '6333' },
    probes: { mysql: mysqlOk, redis: redisOk, qdrant: qdrantOk },
    database: MYSQL_DATABASE,
    releaseEvidence: false,
    notHa: true,
    claimsForbidden: [
      'fixtures_retired',
      'isolated_default_switched_to_sole',
      'disposable_sole_isolation',
      'qdrant_backed_rag_default',
      'e2e_pg_image_retired',
      'cutover',
      'migrated',
      'HA',
      'releaseEvidence=true',
    ],
    dataHandling: 'no_env_secrets_or_connection_passwords_persisted',
  };
  writeFileSync(partialPath, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  renameSync(partialPath, finalPath);
  lines.push(`RECEIPT file=${relative(root, finalPath)} release_evidence=false`);
} catch (err) {
  fail(`receipt write failed: ${err instanceof Error ? err.message : 'unknown'}`);
}

for (const line of lines) console.log(line);
console.log(`CMD=node ${scriptPath} EXIT=${exitCode}`);
process.exit(exitCode);
