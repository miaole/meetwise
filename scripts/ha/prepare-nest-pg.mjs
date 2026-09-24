#!/usr/bin/env node
/**
 * Prepare Nest-compatible Postgres for HA dual session prove.
 *
 * releaseEvidence=false · Not HA · claimProductionHA=false
 *
 * Steps (authorized path):
 *   1) require MEETWISE_HA_NEST_PG_AUTHORIZED=1
 *   2) docker compose -f compose.ha-dual.yml -f compose.ha-dual.pg.yml up -d postgres
 *   3) wait pg_isready / TCP
 *   4) migrate as migrator (POSTGRES_USER meetwise)
 *   5) provisionRuntimeLogin meetwise_ha_runtime
 *   6) write .tmp/ha-evidence/nest-pg-prepare.json (no secrets beyond local-dev placeholders already in compose)
 *
 * Does NOT start api-a/api-b (use bring-up --compose-pg).
 * Does NOT read/write .env*.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import net from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const COMPOSE_REAL = join(ROOT, 'docker/compose.ha-dual.yml');
const COMPOSE_PG = join(ROOT, 'docker/compose.ha-dual.pg.yml');
const EVIDENCE_DIR =
  process.env.MEETWISE_HA_PROBE_EVIDENCE_DIR ||
  join(ROOT, '.tmp/ha-evidence');

const HOST_PG = process.env.HA_NEST_PG_HOST ?? '127.0.0.1';
const PORT_PG = Number(process.env.HA_NEST_PG_PORT ?? '54339');
const MIGRATE_URL =
  process.env.HA_NEST_PG_MIGRATE_URL ??
  `postgresql://meetwise:meetwise_ha_pg_dev_password@${HOST_PG}:${PORT_PG}/meetwise`;
const RUNTIME_USER = process.env.HA_NEST_PG_RUNTIME_USER ?? 'meetwise_ha_runtime';
const RUNTIME_PASSWORD =
  process.env.HA_NEST_PG_RUNTIME_PASSWORD ?? 'meetwise_ha_runtime_dev_pw';

const argv = process.argv.slice(2);
const requireReady =
  argv.includes('--require-ready') ||
  process.env.MEETWISE_HA_REQUIRE_NEST_PG === '1';
const authorized = Boolean(process.env.MEETWISE_HA_NEST_PG_AUTHORIZED);

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];

function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(
    `[ha:prepare:nest-pg] ${ok ? 'PASS' : 'GAP'} ${step}${detail ? ` — ${detail}` : ''}`,
  );
}

function printReceipt(fields) {
  const lines = [
    '===== RECEIPT ha:prepare:nest-pg =====',
    `result: ${fields.result}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `nestPgReady: ${fields.nestPgReady === true}`,
    `authorized: ${authorized}`,
    `host: ${HOST_PG}`,
    `port: ${PORT_PG}`,
    `runtimeUser: ${RUNTIME_USER}`,
  ];
  if (fields.gap) lines.push(`gap: ${fields.gap}`);
  if (fields.prereq) lines.push(`prereq: ${fields.prereq}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  for (const s of steps) {
    lines.push(
      `step: ${s.ok ? 'PASS' : 'GAP'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`,
    );
  }
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

function waitTcp(host, port, attempts = 40) {
  return new Promise((resolve) => {
    let i = 0;
    const tryOnce = () => {
      const sock = net.connect({ host, port }, () => {
        sock.end();
        resolve(true);
      });
      sock.on('error', () => {
        sock.destroy();
        i += 1;
        if (i >= attempts) resolve(false);
        else setTimeout(tryOnce, 250);
      });
    };
    tryOnce();
  });
}

async function main() {
  note(
    'honesty banner',
    true,
    'releaseEvidence=false; Not HA; Nest PG prepare ≠ production HA',
  );
  note('compose.ha-dual.yml present', existsSync(COMPOSE_REAL), COMPOSE_REAL);
  note('compose.ha-dual.pg.yml present', existsSync(COMPOSE_PG), COMPOSE_PG);
  note(
    'MEETWISE_HA_NEST_PG_AUTHORIZED',
    authorized,
    authorized
      ? 'set'
      : 'unset — refuse PG prepare (PREREQ: MEETWISE_HA_NEST_PG_AUTHORIZED=1)',
  );

  if (!existsSync(COMPOSE_REAL) || !existsSync(COMPOSE_PG)) {
    printReceipt({
      result: 'PREREQ_GAP',
      nestPgReady: false,
      gap: 'compose ha-dual and/or ha-dual.pg missing',
      prereq: 'land docker/compose.ha-dual.yml + docker/compose.ha-dual.pg.yml',
      note: 'Not HA; releaseEvidence=false',
    });
    const exit = requireReady ? 1 : 0;
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/prepare-nest-pg.mjs')} EXIT=${exit}`,
    );
    process.exit(exit);
  }

  if (!authorized) {
    printReceipt({
      result: 'PREREQ_GAP',
      nestPgReady: false,
      gap: 'MEETWISE_HA_NEST_PG_AUTHORIZED unset — refuse Nest PG sidecar prepare',
      prereq: 'MEETWISE_HA_NEST_PG_AUTHORIZED=1',
      note: 'honest GAP — Nest session remains unproven without PG; Not HA; releaseEvidence=false',
    });
    const exit = requireReady ? 1 : 0;
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/prepare-nest-pg.mjs')} EXIT=${exit}`,
    );
    process.exit(exit);
  }

  const up = spawnSync(
    'docker',
    [
      'compose',
      '-f',
      COMPOSE_REAL,
      '-f',
      COMPOSE_PG,
      'up',
      '-d',
      '--remove-orphans',
      'postgres',
    ],
    { encoding: 'utf8', cwd: ROOT },
  );
  process.stdout.write(up.stdout || '');
  process.stderr.write(up.stderr || '');
  note('compose postgres up', up.status === 0, `exit=${up.status}`);
  if (up.status !== 0) {
    printReceipt({
      result: 'FAIL',
      nestPgReady: false,
      gap: 'docker compose up postgres failed',
      note: 'Not HA; releaseEvidence=false',
    });
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/prepare-nest-pg.mjs')} EXIT=1`,
    );
    process.exit(1);
  }

  const tcpOk = await waitTcp(HOST_PG, PORT_PG, 60);
  note('postgres TCP ready', tcpOk, `${HOST_PG}:${PORT_PG}`);
  if (!tcpOk) {
    printReceipt({
      result: 'FAIL',
      nestPgReady: false,
      gap: 'postgres TCP never ready',
      note: 'Not HA; releaseEvidence=false',
    });
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/prepare-nest-pg.mjs')} EXIT=1`,
    );
    process.exit(1);
  }

  // Brief settle for postmaster accept after TCP open.
  await new Promise((r) => setTimeout(r, 1500));

  const migrateEnv = {
    ...process.env,
    DATABASE_URL: MIGRATE_URL,
    DATABASE_SSL_MODE: 'disable',
    APP_RUNTIME_DB_USER: RUNTIME_USER,
    APP_RUNTIME_DB_PASSWORD: RUNTIME_PASSWORD,
    // Avoid ambient PG* conflicting with DATABASE_URL.
    PGHOST: '',
    PGPORT: '',
    PGUSER: '',
    PGPASSWORD: '',
    PGDATABASE: '',
  };
  const mig = spawnSync('pnpm', ['-C', 'packages/db', 'migrate'], {
    encoding: 'utf8',
    cwd: ROOT,
    env: migrateEnv,
    maxBuffer: 20 * 1024 * 1024,
  });
  process.stdout.write(mig.stdout || '');
  process.stderr.write(mig.stderr || '');
  note('packages/db migrate + runtime provision', mig.status === 0, `exit=${mig.status}`);
  if (mig.status !== 0) {
    printReceipt({
      result: 'FAIL',
      nestPgReady: false,
      gap: 'migrate / provisionRuntimeLogin failed',
      note: 'Nest session still GAP; Not HA; releaseEvidence=false',
    });
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/prepare-nest-pg.mjs')} EXIT=1`,
    );
    process.exit(1);
  }

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const receiptPath = join(EVIDENCE_DIR, 'nest-pg-prepare.json');
  const receipt = {
    status: 'OK',
    at: new Date().toISOString(),
    nestPgReady: true,
    host: HOST_PG,
    port: PORT_PG,
    runtimeUser: RUNTIME_USER,
    migrateUrlHostPort: `${HOST_PG}:${PORT_PG}`,
    containerDns: 'postgres:5432',
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    note:
      'Nest PG sidecar migrated + runtime login provisioned — still Not HA; run ha:dual:bring-up -- --compose-pg then ha:prove:nest-session -- --prove',
  };
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  note('wrote nest-pg-prepare.json', true, receiptPath);

  printReceipt({
    result: 'NEST_PG_READY',
    nestPgReady: true,
    note:
      'local Nest PG ready for dual auth/session — STILL Not HA; releaseEvidence=false; ≠ production HA',
  });
  console.log(
    `CMD=node ${join(ROOT, 'scripts/ha/prepare-nest-pg.mjs')} EXIT=0`,
  );
  process.exit(0);
}

main().catch((err) => {
  printReceipt({
    result: 'FAIL',
    nestPgReady: false,
    gap: err instanceof Error ? err.stack ?? err.message : String(err),
    note: 'Not HA; releaseEvidence=false',
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/prepare-nest-pg.mjs')} EXIT=1`);
  process.exit(1);
});
