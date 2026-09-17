#!/usr/bin/env node
/**
 * M1 ping prove — read-only connectivity to local mysql / redis / qdrant.
 * releaseEvidence=false. Not HA. Not production. Does not touch .env*.
 * Requires docker compose plugin; missing compose ⇒ EXIT≠0 (red), never silent green.
 * Pings host-published ports from docker/compose.mysql-local.yml (33069 / 63809 / 6333).
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const composePath = join(root, 'docker/compose.mysql-local.yml');
const scriptPath = join(root, 'scripts/conn-stack/mysql-stack.ping.proof.mjs');

const MYSQL_USER = 'meetwise';
const MYSQL_PASSWORD = 'meetwise_dev_password'; // local compose.dev-style only
const MYSQL_HOST = '127.0.0.1';
const MYSQL_PORT = '33069';
const REDIS_PORT = '63809';
const QDRANT_READYZ = 'http://127.0.0.1:6333/readyz';

let exitCode = 0;
const lines = [];

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
  const cmdStr = [cmd, ...args].join(' ');
  lines.push(`CMD=${cmdStr} EXIT=${status}`);
  if (r.error) lines.push(`NOTE  spawn error: ${r.error.message}`);
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

if (!existsSync(composePath)) {
  fail(`compose missing: ${composePath}`);
} else {
  pass(`compose present: ${composePath}`);
}

if (!existsSync(scriptPath)) {
  fail(`proof script missing: ${scriptPath}`);
} else {
  pass(`proof script present: ${scriptPath}`);
}

// Hard gate: docker compose plugin must be available (no silent green)
const composeVer = run('docker', ['compose', 'version']);
if (composeVer.status !== 0) {
  fail('docker compose plugin unavailable — M1 ping prove cannot be green');
  for (const line of lines) console.log(line);
  console.log(`CMD=node ${scriptPath} EXIT=${exitCode}`);
  process.exit(exitCode);
}
pass('docker compose plugin available');

const cfg = run('docker', ['compose', '-f', composePath, 'config']);
if (cfg.status !== 0) {
  fail('docker compose config failed');
} else {
  pass('docker compose config OK');
}

// --- mysql read-only ping (host port 33069) ---
let mysqlOk = false;
if (which('mysqladmin')) {
  const m = run('mysqladmin', [
    'ping',
    `-h${MYSQL_HOST}`,
    `-P${MYSQL_PORT}`,
    `-u${MYSQL_USER}`,
    `-p${MYSQL_PASSWORD}`,
  ]);
  mysqlOk = m.status === 0;
} else if (which('mysql')) {
  const m = run('mysql', [
    `-h${MYSQL_HOST}`,
    `-P${MYSQL_PORT}`,
    `-u${MYSQL_USER}`,
    `-p${MYSQL_PASSWORD}`,
    '-e',
    'SELECT 1',
  ]);
  mysqlOk = m.status === 0;
} else {
  // Ephemeral client on host network — still hits published host port (honest when host CLI absent)
  const m = run('docker', [
    'run',
    '--rm',
    '--network',
    'host',
    'mysql:8.4',
    'mysqladmin',
    'ping',
    `-h${MYSQL_HOST}`,
    `-P${MYSQL_PORT}`,
    `-u${MYSQL_USER}`,
    `-p${MYSQL_PASSWORD}`,
  ]);
  mysqlOk = m.status === 0;
  lines.push('NOTE  host mysqladmin/mysql absent; used docker run --network host mysql:8.4 mysqladmin');
}
if (mysqlOk) pass('mysql read-only ping OK');
else fail('mysql read-only ping failed');

// --- redis read-only ping (host port 63809) ---
let redisOk = false;
if (which('redis-cli')) {
  const r = run('redis-cli', ['-p', REDIS_PORT, 'PING']);
  redisOk = r.status === 0 && /\bPONG\b/i.test(r.stdout);
} else {
  const r = run('docker', [
    'run',
    '--rm',
    '--network',
    'host',
    'redis:7-alpine',
    'redis-cli',
    '-p',
    REDIS_PORT,
    'PING',
  ]);
  redisOk = r.status === 0 && /\bPONG\b/i.test(r.stdout);
  lines.push('NOTE  host redis-cli absent; used docker run --network host redis:7-alpine redis-cli');
}
if (redisOk) pass('redis read-only ping OK');
else fail('redis read-only ping failed');

// --- qdrant readyz (host port 6333) ---
let qdrantOk = false;
if (which('curl')) {
  const q = run('curl', ['-sf', QDRANT_READYZ]);
  qdrantOk = q.status === 0;
} else {
  fail('curl unavailable for qdrant readyz');
}
if (qdrantOk) pass('qdrant readyz OK');
else if (which('curl')) fail('qdrant readyz failed');

lines.push('NOTE  releaseEvidence=false; Not HA; local-dev stack only');

for (const line of lines) console.log(line);
console.log(`CMD=node ${scriptPath} EXIT=${exitCode}`);
process.exit(exitCode);
