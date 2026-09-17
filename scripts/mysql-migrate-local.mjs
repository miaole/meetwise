#!/usr/bin/env node
/**
 * Apply packages/db-mysql/migrations/*.sql against compose.mysql-local MySQL
 * (host 127.0.0.1:33069, db meetwise). Local-dev placeholder credentials only
 * (same class as docker/compose.mysql-local.yml). No .env* secrets.
 * releaseEvidence=false. Not HA. Does not claim RLS equivalence.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = join(root, 'packages/db-mysql/migrations');
const composePath = join(root, 'docker/compose.mysql-local.yml');
const containerName = 'meetwise-mysql-local';

const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = process.env.MYSQL_PORT || '33069';
const MYSQL_USER = process.env.MYSQL_USER || 'meetwise';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'meetwise_dev_password';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'meetwise';

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

function which(bin) {
  const r = spawnSync('sh', ['-c', `command -v ${bin}`], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
}

function containerRunning() {
  const r = spawnSync(
    'docker',
    ['inspect', '-f', '{{.State.Running}}', containerName],
    { encoding: 'utf8' },
  );
  return r.status === 0 && String(r.stdout).trim() === 'true';
}

/** Run SQL text; returns { status, stdout, stderr, cmd }. */
function runSql(sql, label) {
  const argsBase = [
    `-h${MYSQL_HOST}`,
    `-P${MYSQL_PORT}`,
    `-u${MYSQL_USER}`,
    `-p${MYSQL_PASSWORD}`,
    MYSQL_DATABASE,
    '-e',
    sql,
  ];

  if (containerRunning()) {
    // Prefer in-container client (honest against the named local compose service).
    const cmd = ['docker', 'exec', '-i', containerName, 'mysql', ...argsBase.map((a) => {
      // Inside the container, connect via localhost:3306, not host-published 33069.
      if (a.startsWith('-h')) return '-h127.0.0.1';
      if (a.startsWith('-P')) return '-P3306';
      return a;
    })];
    const r = spawnSync(cmd[0], cmd.slice(1), {
      encoding: 'utf8',
      cwd: root,
      timeout: 60_000,
      input: '',
    });
    const status = r.error ? 1 : (r.status ?? 1);
    const cmdStr = `docker exec -i ${containerName} mysql … (${label})`;
    lines.push(`CMD=${cmdStr} EXIT=${status}`);
    if (r.error) note(`spawn error: ${r.error.message}`);
    if (status !== 0 && (r.stderr || r.stdout)) {
      note((r.stderr || r.stdout).trim().slice(0, 500));
    }
    return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  }

  if (which('mysql')) {
    const r = spawnSync('mysql', argsBase, {
      encoding: 'utf8',
      cwd: root,
      timeout: 60_000,
    });
    const status = r.error ? 1 : (r.status ?? 1);
    lines.push(`CMD=mysql … (${label}) EXIT=${status}`);
    if (r.error) note(`spawn error: ${r.error.message}`);
    if (status !== 0 && (r.stderr || r.stdout)) {
      note((r.stderr || r.stdout).trim().slice(0, 500));
    }
    return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  }

  // Ephemeral client on host network hitting published 33069.
  const r = spawnSync(
    'docker',
    [
      'run',
      '--rm',
      '--network',
      'host',
      'mysql:8.4',
      'mysql',
      ...argsBase,
    ],
    { encoding: 'utf8', cwd: root, timeout: 120_000 },
  );
  const status = r.error ? 1 : (r.status ?? 1);
  lines.push(`CMD=docker run --rm --network host mysql:8.4 mysql … (${label}) EXIT=${status}`);
  if (r.error) note(`spawn error: ${r.error.message}`);
  if (status !== 0 && (r.stderr || r.stdout)) {
    note((r.stderr || r.stdout).trim().slice(0, 500));
  }
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function runSqlFile(filePath, version) {
  const sql = readFileSync(filePath, 'utf8');
  // Pipe file via stdin to mysql client.
  const buildArgs = (host, port) => [
    `-h${host}`,
    `-P${port}`,
    `-u${MYSQL_USER}`,
    `-p${MYSQL_PASSWORD}`,
    MYSQL_DATABASE,
  ];

  if (containerRunning()) {
    const r = spawnSync(
      'docker',
      ['exec', '-i', containerName, 'mysql', ...buildArgs('127.0.0.1', '3306')],
      { encoding: 'utf8', cwd: root, timeout: 120_000, input: sql },
    );
    const status = r.error ? 1 : (r.status ?? 1);
    lines.push(`CMD=docker exec -i ${containerName} mysql < ${version}.sql EXIT=${status}`);
    if (r.error) note(`spawn error: ${r.error.message}`);
    if (status !== 0 && (r.stderr || r.stdout)) {
      note((r.stderr || r.stdout).trim().slice(0, 800));
    }
    return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  }

  if (which('mysql')) {
    const r = spawnSync('mysql', buildArgs(MYSQL_HOST, MYSQL_PORT), {
      encoding: 'utf8',
      cwd: root,
      timeout: 120_000,
      input: sql,
    });
    const status = r.error ? 1 : (r.status ?? 1);
    lines.push(`CMD=mysql < ${version}.sql EXIT=${status}`);
    if (status !== 0 && (r.stderr || r.stdout)) {
      note((r.stderr || r.stdout).trim().slice(0, 800));
    }
    return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  }

  // docker run with stdin — mount not required when piping SQL on stdin
  const r = spawnSync(
    'docker',
    ['run', '--rm', '-i', '--network', 'host', 'mysql:8.4', 'mysql', ...buildArgs(MYSQL_HOST, MYSQL_PORT)],
    { encoding: 'utf8', cwd: root, timeout: 180_000, input: sql },
  );
  const status = r.error ? 1 : (r.status ?? 1);
  lines.push(`CMD=docker run -i --network host mysql:8.4 mysql < ${version}.sql EXIT=${status}`);
  if (status !== 0 && (r.stderr || r.stdout)) {
    note((r.stderr || r.stdout).trim().slice(0, 800));
  }
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function checksum(sql) {
  return createHash('sha256').update(sql).digest('hex');
}

if (!existsSync(migrationsDir)) {
  fail(`migrations dir missing: ${migrationsDir}`);
  for (const line of lines) console.log(line);
  console.log(`CMD=node scripts/mysql-migrate-local.mjs EXIT=${exitCode}`);
  process.exit(exitCode);
}

if (!existsSync(composePath)) {
  fail(`compose missing: ${composePath}`);
} else {
  pass(`compose present: ${composePath}`);
}

const files = readdirSync(migrationsDir)
  .filter((f) => /^\d{4}_.+\.sql$/i.test(f))
  .sort();

if (files.length === 0) {
  fail('no migration files matching NNNN_*.sql');
} else {
  pass(`found ${files.length} migration file(s)`);
}

// Probe connectivity
const probe = runSql('SELECT 1 AS ok;', 'SELECT 1');
if (probe.status !== 0) {
  fail('MySQL not reachable on local compose target (start: docker compose -f docker/compose.mysql-local.yml up -d mysql)');
  for (const line of lines) console.log(line);
  console.log(`CMD=node scripts/mysql-migrate-local.mjs EXIT=${exitCode}`);
  process.exit(exitCode);
}
pass('MySQL SELECT 1 ok');

// Read applied versions (table may not exist yet)
const applied = new Set();
const listApplied = runSql(
  "SELECT version FROM mw_schema_migrations ORDER BY version;",
  'list applied',
);
if (listApplied.status === 0) {
  for (const line of listApplied.stdout.split('\n')) {
    const v = line.trim();
    if (v && v !== 'version') applied.add(v);
  }
  pass(`applied ledger readable (${applied.size} version(s))`);
} else {
  note('mw_schema_migrations not present yet (expected before 0001)');
}

for (const file of files) {
  const version = file.replace(/\.sql$/i, '');
  if (applied.has(version)) {
    pass(`skip already applied: ${version}`);
    continue;
  }
  const full = join(migrationsDir, file);
  const sql = readFileSync(full, 'utf8');
  const sum = checksum(sql);
  const appliedFile = runSqlFile(full, version);
  if (appliedFile.status !== 0) {
    fail(`apply failed: ${version}`);
    break;
  }
  const record = runSql(
    `INSERT INTO mw_schema_migrations (version, checksum) VALUES ('${version.replace(/'/g, "''")}', '${sum}');`,
    `record ${version}`,
  );
  if (record.status !== 0) {
    fail(`record failed: ${version}`);
    break;
  }
  pass(`applied ${version}`);
}

for (const line of lines) console.log(line);
console.log(`CMD=node scripts/mysql-migrate-local.mjs EXIT=${exitCode}`);
process.exit(exitCode);
