#!/usr/bin/env node
/**
 * Meetwise HA dual-instance bring-up — multi-instance track (beyond skeleton).
 *
 * releaseEvidence=false · Not HA · never claim production HA
 *
 * Modes:
 *   (default)     → assess prereqs; if real dual API cannot start →
 *                   result=PREREQ_GAP / haStatus=NOT_HA / EXIT=0 (honest gap)
 *                   with --require-instances → EXIT=1 fail-closed
 *   --stub        → start dual /livez stub daemon (C2 probe path only)
 *   --compose     → attempt docker/compose.ha-dual.yml; missing image/auth → GAP
 *   --compose-shared → compose.ha-dual.yml + compose.ha-dual.shared.yml
 *                   (attach sole-stack MySQL/Redis network; C3 path; still Not HA)
 *   --compose-pg     → compose.ha-dual.yml + compose.ha-dual.pg.yml
 *                   (Nest Postgres sidecar for auth/session; needs NEST_PG_AUTHORIZED;
 *                    still Not HA; ≠ production HA)
 *                   Can combine with --compose-shared (pg + sole overlays)
 *   --build       → with --compose/--compose-shared: build local image first
 *   --compose-down→ docker compose down (includes shared overlay file if present)
 *   --stop-stub   → stop stub daemon
 *
 * Real Nest api-a/api-b requires:
 *   MEETWISE_HA_DUAL_AUTHORIZED=1
 *   MEETWISE_HA_BACKEND_IMAGE (default meetwise-backend:ha-dual-local) present
 * Image build: pnpm ha:dual:build-image
 * C3 shared overlay additionally needs sole-stack network + (for prove)
 *   MEETWISE_HA_SHARED_AUTHORIZED=1
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const COMPOSE_REAL = join(ROOT, 'docker/compose.ha-dual.yml');
const COMPOSE_SHARED = join(ROOT, 'docker/compose.ha-dual.shared.yml');
const COMPOSE_PG = join(ROOT, 'docker/compose.ha-dual.pg.yml');
const COMPOSE_SKELETON = join(ROOT, 'docker/compose.ha-dual.skeleton.yml');
const COMPOSE = existsSync(COMPOSE_REAL) ? COMPOSE_REAL : COMPOSE_SKELETON;
const STUB = join(ROOT, 'scripts/ha/dual-livez-stub.mjs');
const BUILD_IMAGE = join(ROOT, 'scripts/ha/build-backend-image.mjs');
const DEFAULT_IMAGE = 'meetwise-backend:ha-dual-local';
const HOST = process.env.HA_PROBE_HOST ?? '127.0.0.1';
const PORT_A = Number(process.env.HA_PROBE_PORT_A ?? '18787');
const PORT_B = Number(process.env.HA_PROBE_PORT_B ?? '18788');

const args = process.argv.slice(2);
const wantStub = args.includes('--stub');
const wantComposeShared = args.includes('--compose-shared');
const wantComposePg = args.includes('--compose-pg');
const wantCompose = args.includes('--compose') || wantComposeShared || wantComposePg;
const wantBuild = args.includes('--build');
const wantComposeDown = args.includes('--compose-down');
const wantStopStub = args.includes('--stop-stub');
const requireInstances =
  args.includes('--require-instances') ||
  process.env.MEETWISE_HA_REQUIRE_INSTANCES === '1';

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];

function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(`[ha:bring-up-dual] ${ok ? 'PASS' : 'GAP'} ${step}${detail ? ` — ${detail}` : ''}`);
}

function printReceipt(fields) {
  const lines = [
    '===== RECEIPT ha:bring-up-dual =====',
    `result: ${fields.result}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `host: ${HOST}`,
    `portA: ${PORT_A}`,
    `portB: ${PORT_B}`,
    `mode: ${fields.mode}`,
    `composeFile: ${COMPOSE}`,
    `requireInstances: ${requireInstances}`,
  ];
  if (fields.image) lines.push(`imageTag: ${fields.image}`);
  if (fields.gap) lines.push(`gap: ${fields.gap}`);
  if (fields.prereq) lines.push(`prereq: ${fields.prereq}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  for (const s of steps) {
    lines.push(`step: ${s.ok ? 'PASS' : 'GAP'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`);
  }
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

function probe(port) {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: HOST, port, path: '/livez', method: 'GET', timeout: 1500 },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            ok: res.statusCode === 200,
            status: res.statusCode ?? 0,
            text: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.on('error', (err) => resolve({ ok: false, status: 0, text: String(err.message) }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, text: 'timeout' });
    });
    req.end();
  });
}

function dockerImageExists(image) {
  const r = spawnSync('docker', ['image', 'inspect', image], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return r.status === 0;
}

function assessRealApiPrereqs() {
  const image = process.env.MEETWISE_HA_BACKEND_IMAGE ?? DEFAULT_IMAGE;
  note(
    'compose.ha-dual present',
    existsSync(COMPOSE_REAL),
    existsSync(COMPOSE_REAL) ? COMPOSE_REAL : `MISSING real compose; fallback=${COMPOSE}`,
  );
  note('compose skeleton present', existsSync(COMPOSE_SKELETON), COMPOSE_SKELETON);
  const imageOk = dockerImageExists(image);
  note(
    'backend image present',
    imageOk,
    imageOk
      ? image
      : `${image} missing — run: pnpm ha:dual:build-image (or node scripts/ha/build-backend-image.mjs)`,
  );
  const authEnv = Boolean(process.env.MEETWISE_HA_DUAL_AUTHORIZED);
  note(
    'MEETWISE_HA_DUAL_AUTHORIZED',
    authEnv,
    authEnv
      ? 'set'
      : 'unset — refuse real compose dual bring-up (PREREQ: MEETWISE_HA_DUAL_AUTHORIZED=1)',
  );
  // Placeholders / skeleton tags are never authorized for HA claim.
  const authorized =
    authEnv && imageOk && !/skeleton-not-for-prod/i.test(image);
  note(
    'dual API authorized',
    authorized,
    authorized
      ? 'MEETWISE_HA_DUAL_AUTHORIZED + non-skeleton image present'
      : 'need MEETWISE_HA_DUAL_AUTHORIZED=1 AND image tag present (non-skeleton)',
  );
  const prereqParts = [];
  if (!authEnv) prereqParts.push('MEETWISE_HA_DUAL_AUTHORIZED=1');
  if (!imageOk) prereqParts.push(`image:${image}`);
  if (/skeleton-not-for-prod/i.test(image)) {
    prereqParts.push('non-skeleton image tag (not meetwise-backend:skeleton-not-for-prod)');
  }
  return {
    image,
    imageOk,
    authEnv,
    authorized,
    prereq: prereqParts.length
      ? prereqParts.join(' + ')
      : 'none — authorized path open (still Not HA)',
  };
}

async function waitLivez(label, port, attempts = 20) {
  for (let i = 0; i < attempts; i++) {
    const r = await probe(port);
    if (r.ok) {
      note(`livez ${label}`, true, `port=${port} status=${r.status}`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  note(`livez ${label}`, false, `port=${port} never 200`);
  return false;
}

function runBuildImage() {
  note('build local image', true, BUILD_IMAGE);
  const r = spawnSync(process.execPath, [BUILD_IMAGE], {
    encoding: 'utf8',
    cwd: ROOT,
    env: process.env,
  });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  note('build-backend-image exit', r.status === 0, `exit=${r.status}`);
  return r.status === 0;
}

async function main() {
  note('honesty banner', true, 'releaseEvidence=false; claimProductionHA=false; Not HA');

  if (wantStopStub) {
    const r = spawnSync(process.execPath, [STUB, '--stop'], {
      encoding: 'utf8',
      cwd: ROOT,
    });
    process.stdout.write(r.stdout || '');
    process.stderr.write(r.stderr || '');
    printReceipt({
      result: 'STUB_STOPPED',
      mode: 'STUB_LIVEZ_ONLY',
      note: 'stub stop requested; still Not HA',
    });
    console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --stop-stub EXIT=0`);
    process.exit(0);
  }

  if (wantComposeDown) {
    const downArgs = ['compose', '-f', COMPOSE_REAL];
    if (existsSync(COMPOSE_SHARED)) {
      downArgs.push('-f', COMPOSE_SHARED);
    }
    if (existsSync(COMPOSE_PG)) {
      downArgs.push('-f', COMPOSE_PG);
    }
    downArgs.push('down', '--remove-orphans');
    const r = spawnSync('docker', downArgs, { encoding: 'utf8', cwd: ROOT });
    process.stdout.write(r.stdout || '');
    process.stderr.write(r.stderr || '');
    note('compose down', r.status === 0, `exit=${r.status}`);
    printReceipt({
      result: r.status === 0 ? 'COMPOSE_DOWN' : 'FAIL',
      mode: 'COMPOSE_DOWN',
      note: 'compose down complete — still Not HA; releaseEvidence=false',
    });
    console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose-down EXIT=${r.status === 0 ? 0 : 1}`);
    process.exit(r.status === 0 ? 0 : 1);
  }

  if (wantStub || process.env.MEETWISE_HA_DUAL_STUB === '1') {
    spawnSync(process.execPath, [STUB, '--stop'], { encoding: 'utf8', cwd: ROOT });
    const r = spawnSync(process.execPath, [STUB, '--daemon'], {
      encoding: 'utf8',
      cwd: ROOT,
    });
    process.stdout.write(r.stdout || '');
    process.stderr.write(r.stderr || '');
    if (r.status !== 0) {
      printReceipt({
        result: 'FAIL',
        mode: 'STUB_LIVEZ_ONLY',
        gap: 'stub daemon failed to start',
      });
      console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --stub EXIT=1`);
      process.exit(1);
    }
    const aOk = await waitLivez('A', PORT_A);
    const bOk = await waitLivez('B', PORT_B);
    const dual = aOk && bOk;
    printReceipt({
      result: dual ? 'DUAL_STUB_UP' : 'FAIL',
      mode: 'STUB_LIVEZ_ONLY',
      note: dual
        ? 'dual stub /livez up — C2 machinery only; ≠ Nest API; ≠ shared-state; ≠ fault-inject prove; Not HA'
        : 'stub started but dual livez not both 200',
      gap: dual ? undefined : 'dual stub livez incomplete',
    });
    const exit = dual ? 0 : 1;
    console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --stub EXIT=${exit}`);
    process.exit(exit);
  }

  if (wantCompose) {
    if (!existsSync(COMPOSE_REAL)) {
      printReceipt({
        result: 'PREREQ_GAP',
        mode: 'COMPOSE_REFUSED',
        gap: 'docker/compose.ha-dual.yml missing — real compose path not landed',
        prereq: 'land docker/compose.ha-dual.yml',
      });
      const exit = requireInstances ? 1 : 0;
      console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose EXIT=${exit}`);
      process.exit(exit);
    }

    if (wantBuild) {
      const built = runBuildImage();
      if (!built) {
        printReceipt({
          result: 'PREREQ_GAP',
          mode: 'COMPOSE_REFUSED',
          gap: 'local image build failed — cannot compose up',
          prereq: `build ${process.env.MEETWISE_HA_BACKEND_IMAGE ?? DEFAULT_IMAGE}`,
        });
        const exit = requireInstances ? 1 : 0;
        console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose --build EXIT=${exit}`);
        process.exit(exit);
      }
    }

    const prereq = assessRealApiPrereqs();
    if (!prereq.authorized || !prereq.imageOk) {
      printReceipt({
        result: 'PREREQ_GAP',
        mode: 'COMPOSE_REFUSED',
        image: prereq.image,
        gap: 'backend image missing and/or MEETWISE_HA_DUAL_AUTHORIZED unset — refuse compose up',
        prereq: prereq.prereq,
        note: 'use --stub for C2 stub path; or: pnpm ha:dual:build-image then MEETWISE_HA_DUAL_AUTHORIZED=1 pnpm ha:dual:bring-up -- --compose; still Not HA',
      });
      const exit = requireInstances ? 1 : 0;
      console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose EXIT=${exit}`);
      process.exit(exit);
    }

    // Stop stub if it occupies the same ports.
    spawnSync(process.execPath, [STUB, '--stop'], { encoding: 'utf8', cwd: ROOT });

    if (wantComposeShared) {
      if (!existsSync(COMPOSE_SHARED)) {
        printReceipt({
          result: 'PREREQ_GAP',
          mode: 'COMPOSE_SHARED_REFUSED',
          gap: 'docker/compose.ha-dual.shared.yml missing',
          prereq: 'land docker/compose.ha-dual.shared.yml',
        });
        const exit = requireInstances ? 1 : 0;
        console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose-shared EXIT=${exit}`);
        process.exit(exit);
      }
      const netCheck = spawnSync(
        'docker',
        ['network', 'inspect', 'meetwise-mysql-local_default'],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
      const netOk = netCheck.status === 0;
      note(
        'sole-stack network present',
        netOk,
        netOk
          ? 'meetwise-mysql-local_default'
          : 'missing — docker compose -f docker/compose.mysql-local.yml up -d mysql redis',
      );
      if (!netOk) {
        printReceipt({
          result: 'PREREQ_GAP',
          mode: 'COMPOSE_SHARED_REFUSED',
          image: prereq.image,
          gap: 'sole-stack docker network meetwise-mysql-local_default missing',
          prereq: 'docker compose -f docker/compose.mysql-local.yml up -d mysql redis',
          note: 'C3 shared overlay needs sole MySQL/Redis network; Not HA; releaseEvidence=false',
        });
        const exit = requireInstances ? 1 : 0;
        console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose-shared EXIT=${exit}`);
        process.exit(exit);
      }
    }

    if (wantComposePg) {
      if (!existsSync(COMPOSE_PG)) {
        printReceipt({
          result: 'PREREQ_GAP',
          mode: 'COMPOSE_PG_REFUSED',
          gap: 'docker/compose.ha-dual.pg.yml missing',
          prereq: 'land docker/compose.ha-dual.pg.yml',
        });
        const exit = requireInstances ? 1 : 0;
        console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose-pg EXIT=${exit}`);
        process.exit(exit);
      }
      const nestPgAuth = Boolean(process.env.MEETWISE_HA_NEST_PG_AUTHORIZED);
      note(
        'MEETWISE_HA_NEST_PG_AUTHORIZED',
        nestPgAuth,
        nestPgAuth
          ? 'set'
          : 'unset — refuse Nest PG dual bring-up (PREREQ: MEETWISE_HA_NEST_PG_AUTHORIZED=1)',
      );
      if (!nestPgAuth) {
        printReceipt({
          result: 'PREREQ_GAP',
          mode: 'COMPOSE_PG_REFUSED',
          image: prereq.image,
          gap: 'MEETWISE_HA_NEST_PG_AUTHORIZED unset — refuse Nest PG overlay',
          prereq: 'MEETWISE_HA_NEST_PG_AUTHORIZED=1 (+ preferably pnpm ha:prepare:nest-pg first)',
          note: 'Nest session remains GAP without authorized PG; Not HA; releaseEvidence=false',
        });
        const exit = requireInstances ? 1 : 0;
        console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose-pg EXIT=${exit}`);
        process.exit(exit);
      }
      const prepPath = join(
        process.env.MEETWISE_HA_PROBE_EVIDENCE_DIR || join(ROOT, '.tmp/ha-evidence'),
        'nest-pg-prepare.json',
      );
      let prepOk = false;
      if (existsSync(prepPath)) {
        try {
          const prep = JSON.parse(readFileSync(prepPath, 'utf8'));
          prepOk = prep.nestPgReady === true || prep.status === 'OK';
        } catch {
          prepOk = false;
        }
      }
      note(
        'nest-pg-prepare receipt',
        prepOk,
        prepOk
          ? prepPath
          : 'missing/not OK — run: MEETWISE_HA_NEST_PG_AUTHORIZED=1 pnpm ha:prepare:nest-pg',
      );
      if (!prepOk) {
        printReceipt({
          result: 'PREREQ_GAP',
          mode: 'COMPOSE_PG_REFUSED',
          image: prereq.image,
          gap: 'nest-pg-prepare.json missing — migrate/runtime login not proven ready',
          prereq: 'MEETWISE_HA_NEST_PG_AUTHORIZED=1 pnpm ha:prepare:nest-pg',
          note: 'refuse dual Nest with PG overlay before migrate; Not HA; releaseEvidence=false',
        });
        const exit = requireInstances ? 1 : 0;
        console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} --compose-pg EXIT=${exit}`);
        process.exit(exit);
      }
    }

    const upArgs = ['compose', '-f', COMPOSE_REAL];
    if (wantComposeShared) {
      upArgs.push('-f', COMPOSE_SHARED);
    }
    if (wantComposePg) {
      upArgs.push('-f', COMPOSE_PG);
    }
    upArgs.push('up', '-d', '--remove-orphans', '--force-recreate');
    const up = spawnSync('docker', upArgs, {
      encoding: 'utf8',
      cwd: ROOT,
      env: {
        ...process.env,
        MEETWISE_HA_BACKEND_IMAGE: prereq.image,
      },
    });
    process.stdout.write(up.stdout || '');
    process.stderr.write(up.stderr || '');
    note(
      wantComposePg
        ? wantComposeShared
          ? 'compose-shared+pg up'
          : 'compose-pg up'
        : wantComposeShared
          ? 'compose-shared up'
          : 'compose up',
      up.status === 0,
      `exit=${up.status}`,
    );
    if (up.status !== 0) {
      printReceipt({
        result: 'FAIL',
        mode: wantComposeShared ? 'COMPOSE_SHARED' : 'COMPOSE_PROFILE',
        image: prereq.image,
        gap: 'docker compose up failed',
        note: 'compose refused/failed; still Not HA; releaseEvidence=false',
      });
      console.log(
        `CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} ${wantComposeShared ? '--compose-shared' : '--compose'} EXIT=1`,
      );
      process.exit(1);
    }

    const aOk = await waitLivez('A', PORT_A, 80);
    const bOk = await waitLivez('B', PORT_B, 80);
    const dual = aOk && bOk;
    const modeLabel = wantComposePg
      ? wantComposeShared
        ? 'COMPOSE_HA_DUAL_SHARED_PG'
        : 'COMPOSE_HA_DUAL_PG'
      : wantComposeShared
        ? 'COMPOSE_HA_DUAL_SHARED'
        : 'COMPOSE_HA_DUAL';
    const resultLabel = dual
      ? wantComposePg
        ? wantComposeShared
          ? 'DUAL_COMPOSE_SHARED_PG_UP'
          : 'DUAL_COMPOSE_PG_UP'
        : wantComposeShared
          ? 'DUAL_COMPOSE_SHARED_UP'
          : 'DUAL_COMPOSE_UP'
      : 'FAIL';
    const noteLabel = dual
      ? wantComposePg
        ? 'compose dual Nest + Postgres sidecar — Nest session prove path open (ha:prove:nest-session -- --prove); STILL Not HA; releaseEvidence=false; claimProductionHA=false; ≠ production HA'
        : wantComposeShared
          ? 'compose dual Nest /livez + sole-stack network — C1/C2 + C3 path ready for prove-shared-state; STILL Not HA; releaseEvidence=false; claimProductionHA=false'
          : 'compose dual Nest /livez up — C1/C2 local path only; C3 shared needs --compose-shared + prove-shared-state; ≠ production HA; releaseEvidence=false; claimProductionHA=false'
      : 'compose attempted but dual livez incomplete';
    const flagLabel = [
      wantComposePg ? '--compose-pg' : null,
      wantComposeShared ? '--compose-shared' : null,
      !wantComposePg && !wantComposeShared ? '--compose' : null,
    ]
      .filter(Boolean)
      .join(' ');
    printReceipt({
      result: resultLabel,
      mode: modeLabel,
      image: prereq.image,
      note: noteLabel,
      gap: dual ? undefined : 'compose dual livez incomplete',
    });
    const exit = dual ? 0 : 1;
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} ${flagLabel} EXIT=${exit}`,
    );
    process.exit(exit);
  }

  // Default: assess only.
  const prereq = assessRealApiPrereqs();
  const aNow = await probe(PORT_A);
  const bNow = await probe(PORT_B);
  note('livez A currently', aNow.ok, `port=${PORT_A} status=${aNow.status}`);
  note('livez B currently', bNow.ok, `port=${PORT_B} status=${bNow.status}`);

  if (aNow.ok && bNow.ok) {
    printReceipt({
      result: 'DUAL_ALREADY_UP',
      mode: 'EXTERNAL',
      image: prereq.image,
      note: 'both ports answer /livez — still Not HA until shared-state + fault-inject + CI + independent review; releaseEvidence=false',
    });
    console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} EXIT=0`);
    process.exit(0);
  }

  printReceipt({
    result: 'PREREQ_GAP',
    mode: 'ASSESS',
    image: prereq.image,
    gap: prereq.imageOk
      ? 'MEETWISE_HA_DUAL_AUTHORIZED unset or skeleton image — set MEETWISE_HA_DUAL_AUTHORIZED=1 then --compose; or use --stub'
      : `${prereq.image} missing — pnpm ha:dual:build-image; then MEETWISE_HA_DUAL_AUTHORIZED=1 --compose; or use --stub`,
    prereq: prereq.prereq,
    note: 'honest gap — cannot start two real APIs without prereqs; Not HA; releaseEvidence=false',
  });
  const exit = requireInstances ? 1 : 0;
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} EXIT=${exit}`);
  process.exit(exit);
}

main().catch((err) => {
  printReceipt({
    result: 'FAIL',
    mode: 'ERROR',
    gap: err instanceof Error ? err.message : String(err),
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/bring-up-dual.mjs')} EXIT=1`);
  process.exit(1);
});
