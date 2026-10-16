#!/usr/bin/env node
/**
 * Meetwise HA multi-instance probe — beyond skeleton (track #3).
 *
 * releaseEvidence=false ALWAYS · haStatus=NOT_HA ALWAYS in this slice
 * Dual stub/compose /livez + optional fault-inject ≠ production HA.
 *
 * Modes:
 *   (default)           → probe A+B /livez; receipt NOT_HA; EXIT=0 if ran
 *                         (dual missing → note GAP but EXIT=0 unless --require-dual)
 *   --with-bring-up-stub→ bring-up --stub then probe
 *   --with-fault-inject → run fault-inject.mjs after dual live (compose kill if auth; else stub)
 *   --with-shared       → run prove-shared-state --prove (needs compose-shared + auth)
 *   --require-evidence  → need dual livez + kill receipt + shared receipt
 *                         → without all three EXIT=1 fail-closed
 *                         (even with local sharedOk: still EXIT=1 — refuse HA /
 *                          production topology/CI/review missing)
 *   --require-dual      → EXIT=1 if both /livez not 200
 *
 * Never writes haStatus=HA or releaseEvidence=true.
 */
import { existsSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const BRING_UP = join(ROOT, 'scripts/ha/bring-up-dual.mjs');
const FAULT = join(ROOT, 'scripts/ha/fault-inject.mjs');
const PROVE_SHARED = join(ROOT, 'scripts/ha/prove-shared-state.mjs');
const EVIDENCE_DIR =
  process.env.MEETWISE_HA_PROBE_EVIDENCE_DIR ||
  join(ROOT, '.tmp/ha-evidence');

const HOST = process.env.HA_PROBE_HOST ?? '127.0.0.1';
const PORT_A = Number(process.env.HA_PROBE_PORT_A ?? '18787');
const PORT_B = Number(process.env.HA_PROBE_PORT_B ?? '18788');

const argv = process.argv.slice(2);
const withBringUp = argv.includes('--with-bring-up-stub');
const withFault = argv.includes('--with-fault-inject');
const withShared = argv.includes('--with-shared');
const requireEvidence =
  argv.includes('--require-evidence') ||
  process.env.MEETWISE_HA_REQUIRE_EVIDENCE === '1';
const requireDual = argv.includes('--require-dual');

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];

function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(
    `[ha:probe:multi] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`,
  );
}

function request(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: HOST, port, path: urlPath, method: 'GET', timeout: 2000 },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            text: Buffer.concat(chunks).toString('utf8'),
          }),
        );
      },
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('request_timeout')));
    req.end();
  });
}

async function probeLivez(port, label) {
  try {
    const res = await request(port, '/livez');
    let instanceId = '';
    try {
      instanceId = JSON.parse(res.text).instanceId ?? '';
    } catch {
      /* ignore */
    }
    const ok = res.status === 200;
    note(
      `livez ${label}`,
      ok,
      `port=${port} status=${res.status}${instanceId ? ` id=${instanceId}` : ''}`,
    );
    return { ok, instanceId, status: res.status };
  } catch (err) {
    note(
      `livez ${label}`,
      false,
      `port=${port} unreachable: ${err instanceof Error ? err.message : err}`,
    );
    return { ok: false, instanceId: '', status: 0 };
  }
}


async function probeLivezQuiet(port) {
  try {
    const res = await request(port, '/livez');
    let instanceId = '';
    try {
      instanceId = JSON.parse(res.text).instanceId ?? '';
    } catch {
      /* ignore */
    }
    return { ok: res.status === 200, instanceId, status: res.status };
  } catch {
    return { ok: false, instanceId: '', status: 0 };
  }
}

function listEvidence(dir) {
  if (!dir || !existsSync(dir)) return [];
  try {
    return readdirSync(dir).filter((f) => !f.startsWith('.'));
  } catch {
    return [];
  }
}

function printReceipt(fields) {
  const lines = [
    '===== RECEIPT ha:probe:multi =====',
    `result: ${fields.result}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `host: ${HOST}`,
    `portA: ${PORT_A}`,
    `portB: ${PORT_B}`,
    `requireEvidence: ${requireEvidence}`,
    `requireDual: ${requireDual}`,
    `evidenceDir: ${EVIDENCE_DIR}`,
    `ladder: ${fields.ladder ?? 'C2_partial_possible; C3_shared=GAP; C4_fault=GAP; D=not_open'}`,
    `sharedOk: ${fields.sharedOk === true}`,
    `nestSessionOk: ${fields.nestSessionOk === true}`,
  ];
  if (fields.failReason) lines.push(`failReason: ${fields.failReason}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  for (const s of steps) {
    lines.push(
      `step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`,
    );
  }
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

async function main() {
  note(
    'honesty banner',
    true,
    'releaseEvidence=false; haStatus=NOT_HA; multi-track ≠ production HA',
  );

  const harnessMulti = join(
    ROOT,
    'ai-docs/delivery/harness/ha-track.multi-instance.md',
  );
  if (existsSync(harnessMulti)) {
    const t = readFileSync(harnessMulti, 'utf8');
    note(
      'multi harness present',
      /releaseEvidence\s*=\s*false/i.test(t) && /Not HA|NOT_HA/i.test(t),
      harnessMulti,
    );
  } else {
    note('multi harness present', false, harnessMulti);
  }

  if (withBringUp) {
    const r = spawnSync(process.execPath, [BRING_UP, '--stub'], {
      encoding: 'utf8',
      cwd: ROOT,
    });
    process.stderr.write(r.stderr || '');
    note('bring-up stub', r.status === 0, `exit=${r.status}`);
  }

  let a = await probeLivez(PORT_A, 'A');
  let b = await probeLivez(PORT_B, 'B');
  let dualLive = a.ok && b.ok;
  note(
    'dual livez',
    dualLive,
    dualLive
      ? 'both ports 200 — C2 machinery only; still NOT_HA'
      : 'missing dual /livez',
  );

  if (withShared) {
    if (!process.env.MEETWISE_HA_SHARED_AUTHORIZED) {
      note(
        'shared prove auth',
        false,
        'MEETWISE_HA_SHARED_AUTHORIZED unset — prove-shared will PREREQ/GAP',
      );
    }
    const r = spawnSync(process.execPath, [PROVE_SHARED, '--prove'], {
      encoding: 'utf8',
      cwd: ROOT,
      env: process.env,
    });
    process.stderr.write(r.stderr || '');
    // keep stdout quieter; prove prints its own receipt to stdout
    process.stdout.write(r.stdout || '');
    note('prove-shared-state', r.status === 0, `exit=${r.status}`);
  }

  if (withFault) {

    if (!dualLive) {
      note('fault-inject skipped', false, 'need dual livez first');
    } else {
      const faultArgs = [FAULT];
      if (process.env.MEETWISE_HA_FAULT_AUTHORIZED) {
        faultArgs.push('--kill');
        if (
          process.env.MEETWISE_HA_SHARED_AUTHORIZED ||
          process.env.MEETWISE_HA_FAULT_SHARED_SURVIVOR === '1'
        ) {
          faultArgs.push('--with-shared-survivor');
        }
      }
      const r = spawnSync(process.execPath, faultArgs, {
        encoding: 'utf8',
        cwd: ROOT,
        env: process.env,
      });
      process.stderr.write(r.stderr || '');
      process.stdout.write(r.stdout || '');
      note('fault-inject', r.status === 0, `exit=${r.status}`);
      // After fault: A should be down, B up — retry briefly (port recycle race).
      let postOk = false;
      for (let i = 0; i < 20; i++) {
        await new Promise((res) => setTimeout(res, 100));
        a = await probeLivezQuiet(PORT_A);
        b = await probeLivezQuiet(PORT_B);
        if (!a.ok && b.ok) {
          postOk = true;
          break;
        }
      }
      note(
        'livez A-post-fault',
        !a.ok,
        `port=${PORT_A} status=${a.status} (expect down)`,
      );
      note(
        'livez B-post-fault',
        b.ok,
        `port=${PORT_B} status=${b.status}${b.instanceId ? ` id=${b.instanceId}` : ''}`,
      );
      dualLive = false; // post-fault dual is intentionally broken on A
      note(
        'post-fault A down / B up',
        postOk,
        `A=${a.status} B=${b.status}; faultExit=${r.status}`,
      );
    }
  }

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const evidenceFiles = listEvidence(EVIDENCE_DIR);
  const hasKill = evidenceFiles.some((f) => /kill|fault|inject|a-down/i.test(f));
  const hasSharedOk = evidenceFiles.some(
    (f) => /shared/i.test(f) && !/\.GAP\./i.test(f) && !/GAP/i.test(f),
  );
  // Treat explicit *.GAP.json as NOT satisfying shared bar.
  const hasSharedGapMarker = evidenceFiles.some((f) => /shared.*GAP/i.test(f));
  const hasNestSessionGap = evidenceFiles.some((f) => /nest-session.*GAP|nest-session\.GAP/i.test(f));
  const hasNestSessionOkFile = evidenceFiles.some((f) => /nest-session\.OK\.json$/i.test(f));
  let nestSessionOk = false;
  if (hasNestSessionOkFile) {
    try {
      const ok = JSON.parse(
        readFileSync(join(EVIDENCE_DIR, 'nest-session.OK.json'), 'utf8'),
      );
      nestSessionOk = ok.nestSessionOk === true && ok.status === 'OK';
    } catch {
      nestSessionOk = false;
    }
  }
  // GAP marker wins over stale OK if both somehow present.
  if (hasNestSessionGap && nestSessionOk) nestSessionOk = false;
  note(
    'evidence dir',
    evidenceFiles.length > 0,
    `files=${evidenceFiles.length} kill=${hasKill} sharedOk=${hasSharedOk} sharedGapMarker=${hasSharedGapMarker} nestSessionGap=${hasNestSessionGap} nestSessionOk=${nestSessionOk}`,
  );
  note(
    'Nest business session',
    nestSessionOk,
    nestSessionOk
      ? 'nest-session.OK.json — LOCAL sticky Nest session proven; STILL Not HA; releaseEvidence=false'
      : hasNestSessionGap
        ? 'nest-session.GAP.json present — Nest session still GAP (need Nest PG dual + --prove)'
        : 'Nest session not closed — run ha:prove:nest-session -- --prove after compose-pg; C3 SHARED_OK ≠ Nest session',
  );

  // Full evidence bar (still ≠ production HA): dual live BEFORE fault + kill + real shared.
  // After --with-fault-inject, dualLive is false by design; use pre-fault flag.
  const hadDualBeforeFault = steps.some(
    (s) => s.step === 'dual livez' && s.ok,
  );
  const realMultiEvidence = hadDualBeforeFault && hasKill && hasSharedOk;
  note(
    'multi-instance evidence bar',
    realMultiEvidence,
    realMultiEvidence
      ? 'dual+kill+shared present — STILL releaseEvidence=false; STILL Not production HA'
      : 'incomplete — shared-state and/or kill and/or dual missing (fail-closed for --require-evidence)',
  );

  const hasComposeFault = evidenceFiles.some((f) =>
    /fault-shared-survivor|kill-A/i.test(f),
  );
  const hasSurvivorShared = evidenceFiles.some((f) =>
    /fault-shared-survivor/i.test(f),
  );
  let c4 = 'GAP';
  if (hasSurvivorShared) c4 = 'local_compose_kill_A+shared_survivor';
  else if (hasKill && withFault) c4 = 'local_or_stub_kill_A';
  else if (hasKill) c4 = 'kill_receipt_present';
  const ladder = hasSharedOk
    ? `C2_partial_possible; C3_shared=local_redis_mysql_prove; C4_fault=${c4}; D=not_open`
    : `C2_partial_possible; C3_shared=GAP; C4_fault=${c4}; D=not_open`;

  if (requireEvidence) {
    printReceipt({
      result: 'FAIL',
      sharedOk: hasSharedOk,
      nestSessionOk,
      ladder,
      failReason: realMultiEvidence
        ? 'local evidence seen but production topology/CI/review missing — refuse HA; use without --require-evidence for stub partial'
        : 'MEETWISE_HA_REQUIRE_EVIDENCE / --require-evidence set but dual+kill+shared receipts incomplete (shared usually GAP on stub)',
      note: 'fail-closed; haStatus=NOT_HA; releaseEvidence=false',
    });
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/probe.multi.mjs')} --require-evidence EXIT=1`,
    );
    process.exit(1);
  }

  if (requireDual && !hadDualBeforeFault) {
    printReceipt({
      result: 'FAIL',
      sharedOk: hasSharedOk,
      nestSessionOk,
      ladder,
      failReason: '--require-dual set but both /livez were not 200',
      note: 'Not HA; releaseEvidence=false',
    });
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/probe.multi.mjs')} --require-dual EXIT=1`,
    );
    process.exit(1);
  }

  let result = 'MULTI_TRACK';
  if (hasSharedOk && hadDualBeforeFault) {
    result = 'DUAL_SHARED_PARTIAL';
  } else if (withFault && steps.some((s) => s.step === 'fault-inject' && s.ok)) {
    result = hasSurvivorShared
      ? 'DUAL_COMPOSE_FAULT_SHARED_PARTIAL'
      : hasComposeFault
        ? 'DUAL_COMPOSE_FAULT_PARTIAL'
        : 'DUAL_STUB_FAULT_PARTIAL';
  } else if (hadDualBeforeFault) {
    result = 'DUAL_LIVEZ_PARTIAL';
  } else {
    result = 'MULTI_TRACK_GAP';
  }

  printReceipt({
    result,
    sharedOk: hasSharedOk,
    nestSessionOk,
    ladder,
    note:
      hasSharedOk
        ? nestSessionOk
          ? 'C3 local shared + LOCAL Nest session OK — STILL Not HA; ladder C/D not green; releaseEvidence=false; ≠ production HA'
          : 'C3 local shared receipts present — STILL Not HA; Nest business session GAP unless nest-session.OK.json; ladder C/D not green; releaseEvidence=false'
        : nestSessionOk
          ? 'LOCAL Nest session OK without C3 shared — STILL Not HA; C3 may still be GAP; ladder C/D not green; releaseEvidence=false'
          : 'multi-instance track beyond skeleton — Not HA; C3 shared=GAP unless --with-shared after compose-shared; Nest session GAP; ladder C/D not green; releaseEvidence=false',
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/probe.multi.mjs')} EXIT=0`);
  process.exit(0);
}

main().catch((err) => {
  printReceipt({
    result: 'FAIL',
    failReason: err instanceof Error ? err.stack ?? err.message : String(err),
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/probe.multi.mjs')} EXIT=1`);
  process.exit(1);
});
