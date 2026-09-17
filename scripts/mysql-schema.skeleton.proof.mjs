#!/usr/bin/env node
/**
 * MySQL schema skeleton prove — apply packages/db-mysql migrations to
 * compose.mysql-local and verify tables. releaseEvidence=false. Not HA.
 * Does NOT claim RLS equivalence. Does NOT delete/weaken PG migrations.
 * Does NOT cut vector. No .env* secrets.
 *
 * Gate: mysql healthy (compose up -d mysql if needed) → migrate → SELECT 1 /
 * SHOW TABLES includes expected names. Prints CMD= EXIT=.
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const composePath = join(root, 'docker/compose.mysql-local.yml');
const migrationPath = join(root, 'packages/db-mysql/migrations/0001_skeleton.sql');
const migrateScript = join(root, 'scripts/mysql-migrate-local.mjs');
const proofScript = join(root, 'scripts/mysql-schema.skeleton.proof.mjs');
const pkgJson = join(root, 'packages/db-mysql/package.json');
const harnessPath = join(root, 'ai-docs/delivery/harness/mysql-schema.skeleton.md');
const rootPkgJson = join(root, 'package.json');
const containerName = 'meetwise-mysql-local';

const EXPECTED_TABLES = ['mw_schema_migrations', 'owner_principal', 'job_queue'];

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
    env: process.env,
    cwd: root,
    timeout: opts.timeoutMs ?? 120_000,
  });
  const status = r.error ? 1 : (r.status ?? 1);
  const cmdStr = [cmd, ...args].join(' ');
  lines.push(`CMD=${cmdStr} EXIT=${status}`);
  if (r.error) note(`spawn error: ${r.error.message}`);
  if (opts.capture && (r.stdout || r.stderr)) {
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
    if (out) note(out.slice(0, 600));
  }
  return { status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function finish() {
  for (const line of lines) console.log(line);
  console.log(`CMD=node ${proofScript} EXIT=${exitCode}`);
  process.exit(exitCode);
}

// --- static presence ---
for (const [label, path] of [
  ['harness', harnessPath],
  ['compose', composePath],
  ['migration 0001', migrationPath],
  ['migrate script', migrateScript],
  ['proof script', proofScript],
  ['db-mysql package.json', pkgJson],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

if (exitCode !== 0) finish();

// Harness CMD table must match package.json script names (no drift / hedged alias)
if (existsSync(harnessPath) && existsSync(rootPkgJson)) {
  const harness = readFileSync(harnessPath, 'utf8');
  const rootPkg = JSON.parse(readFileSync(rootPkgJson, 'utf8'));
  const scripts = rootPkg.scripts || {};
  if (scripts['mysql-schema:skeleton:prove'] === 'node scripts/mysql-schema.skeleton.proof.mjs') {
    pass('package.json mysql-schema:skeleton:prove → scripts/mysql-schema.skeleton.proof.mjs');
  } else {
    fail('package.json must define mysql-schema:skeleton:prove → node scripts/mysql-schema.skeleton.proof.mjs');
  }
  if (scripts['mysql:migrate:local'] === 'node scripts/mysql-migrate-local.mjs') {
    pass('package.json mysql:migrate:local → scripts/mysql-migrate-local.mjs');
  } else {
    fail('package.json must define mysql:migrate:local → node scripts/mysql-migrate-local.mjs');
  }
  if (/pnpm mysql-schema:skeleton:prove/.test(harness) && /pnpm mysql:migrate:local/.test(harness)) {
    pass('harness CMD table pins pnpm mysql:migrate:local + mysql-schema:skeleton:prove');
  } else {
    fail('harness must pin pnpm mysql:migrate:local and pnpm mysql-schema:skeleton:prove');
  }
  if (/releaseEvidence\s*=\s*false/i.test(harness) && /Not HA/i.test(harness)) {
    pass('harness pins releaseEvidence=false + Not HA');
  } else {
    fail('harness must pin releaseEvidence=false and Not HA');
  }
  if (/≠\s*RLS|tenant ≠ RLS|应用层 tenant ≠ RLS/.test(harness)) {
    pass('harness pins app tenant ≠ RLS');
  } else {
    fail('harness must pin 应用层 tenant ≠ RLS');
  }
}

// Static pins in migration SQL
const sql = readFileSync(migrationPath, 'utf8');
if (/utf8mb4/i.test(sql) && /ENGINE\s*=\s*InnoDB/i.test(sql)) {
  pass('0001_skeleton.sql pins utf8mb4 + InnoDB');
} else {
  fail('0001_skeleton.sql must use utf8mb4 + InnoDB');
}
if (/owner_user_id/.test(sql)) pass('0001_skeleton.sql has owner_user_id columns');
else fail('0001_skeleton.sql must include owner_user_id');
if (/≠\s*RLS|NOT an RLS|not an RLS|≠ RLS/i.test(sql)) {
  pass('0001_skeleton.sql states NOT an RLS equivalent');
} else {
  fail('0001_skeleton.sql must state NOT an RLS equivalent');
}
for (const t of EXPECTED_TABLES) {
  if (new RegExp(`CREATE TABLE IF NOT EXISTS ${t}\\b`, 'i').test(sql)) {
    pass(`0001 defines table: ${t}`);
  } else {
    fail(`0001 missing CREATE TABLE IF NOT EXISTS ${t}`);
  }
}

// PG migrations must still exist (do not delete)
const pgMig = join(root, 'packages/db/migrations/0001_baseline.sql');
if (existsSync(pgMig)) pass('PG migrations intact (packages/db/migrations/0001_baseline.sql)');
else fail('PG migrations missing — must not delete PG migrations');

const principal = join(root, 'packages/db/src/principal.ts');
if (existsSync(principal)) {
  const p = readFileSync(principal, 'utf8');
  if (/asPrincipal/.test(p) && /set_config\('app\.principal_user'/.test(p)) {
    pass('principal.ts RLS path intact (asPrincipal + set_config)');
  } else {
    fail('principal.ts must keep asPrincipal + set_config (do not weaken RLS)');
  }
} else {
  fail('principal.ts missing');
}

// docker compose plugin required
const composeVer = run('docker', ['compose', 'version']);
if (composeVer.status !== 0) {
  fail('docker compose plugin unavailable — cannot prove mysql schema skeleton');
  finish();
}
pass('docker compose plugin available');

// Ensure mysql is up (redis/qdrant optional)
function mysqlHealthy() {
  const insp = spawnSync(
    'docker',
    ['inspect', '-f', '{{.State.Health.Status}}', containerName],
    { encoding: 'utf8' },
  );
  if (insp.status === 0 && String(insp.stdout).trim() === 'healthy') return true;
  // Fallback: ping via exec
  const ping = spawnSync(
    'docker',
    ['exec', containerName, 'mysqladmin', 'ping', '-h127.0.0.1', '-umeetwise', '-pmeetwise_dev_password'],
    { encoding: 'utf8', timeout: 15_000 },
  );
  return ping.status === 0;
}

if (!mysqlHealthy()) {
  note('mysql not healthy — starting via compose up -d mysql');
  const up = run(
    'docker',
    ['compose', '-f', composePath, 'up', '-d', 'mysql'],
    { timeoutMs: 180_000, capture: true },
  );
  if (up.status !== 0) {
    fail('compose up -d mysql failed');
    finish();
  }
  // Wait for healthy (up to ~90s)
  let ready = false;
  for (let i = 0; i < 30; i++) {
    spawnSync('sleep', ['3']);
    if (mysqlHealthy()) {
      ready = true;
      break;
    }
  }
  if (!ready) {
    fail('mysql did not become healthy after compose up -d mysql');
    finish();
  }
  pass('mysql healthy after compose up -d mysql');
} else {
  pass('mysql container healthy');
}

// Apply migrations
const migrate = run('node', [migrateScript], { timeoutMs: 180_000, capture: true });
if (migrate.status !== 0) {
  fail('mysql-migrate-local.mjs failed');
  finish();
}
pass('mysql-migrate-local.mjs EXIT=0');

// SELECT 1 + SHOW TABLES via docker exec
const select1 = run(
  'docker',
  [
    'exec',
    containerName,
    'mysql',
    '-h127.0.0.1',
    '-umeetwise',
    '-pmeetwise_dev_password',
    'meetwise',
    '-N',
    '-e',
    'SELECT 1',
  ],
  { capture: true },
);
if (select1.status === 0 && select1.stdout.trim().split('\n').pop() === '1') {
  pass('SELECT 1 ok');
} else if (select1.status === 0 && /1/.test(select1.stdout)) {
  pass('SELECT 1 ok');
} else {
  fail('SELECT 1 failed');
}

const show = run(
  'docker',
  [
    'exec',
    containerName,
    'mysql',
    '-h127.0.0.1',
    '-umeetwise',
    '-pmeetwise_dev_password',
    'meetwise',
    '-N',
    '-e',
    'SHOW TABLES',
  ],
  { capture: true },
);
if (show.status !== 0) {
  fail('SHOW TABLES failed');
} else {
  const tables = new Set(
    show.stdout
      .split('\n')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  note(`SHOW TABLES => ${[...tables].sort().join(', ') || '(empty)'}`);
  for (const t of EXPECTED_TABLES) {
    if (tables.has(t.toLowerCase())) pass(`SHOW TABLES includes ${t}`);
    else fail(`SHOW TABLES missing ${t}`);
  }
}

// Soft honesty pins
pass('honesty: app-layer owner_user_id ≠ RLS equivalent; releaseEvidence=false; Not HA');
pass('honesty: this prove green ≠ cutover / ≠ privacy parity / ≠ full migration port');

finish();
