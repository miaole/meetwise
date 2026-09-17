#!/usr/bin/env node
/**
 * Meetwise HA fault-inject STUB — kill A / prove B still serving (local only).
 *
 * releaseEvidence=false · Not HA · stub kill ≠ production failover ≠ HA green
 *
 * Behavior:
 *   - Needs dual /livez up first (bring-up --stub).
 *   - If stub pid file present: stop dual stub, restart B-only survivor,
 *     verify A down + B up; write receipts under .tmp/ha-evidence/.
 *   - Else if HA_FAULT_KILL_CMD set: run that, then verify A down + B up.
 *   - Else: PREREQ_GAP / honesty pin (refuse blind kill).
 *   - Shared-state on THIS stub path remains GAP (livez-only). For compose kill +
 *     shared survivor see scripts/ha/fault-inject.mjs (C4 local path; still Not HA).
 *   - NEVER releaseEvidence=true / haStatus=HA.
 *
 *   --allow-gap → EXIT=0 with STUBBED_GAP when dual not up (docs path).
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const PID_PATH = join(ROOT, '.tmp/ha-dual-stub.pids.json');
const EVIDENCE_DIR = join(ROOT, '.tmp/ha-evidence');
const STUB = join(ROOT, 'scripts/ha/dual-livez-stub.mjs');
const HOST = process.env.HA_PROBE_HOST ?? '127.0.0.1';
const PORT_A = Number(process.env.HA_PROBE_PORT_A ?? '18787');
const PORT_B = Number(process.env.HA_PROBE_PORT_B ?? '18788');
const allowGap = process.argv.includes('--allow-gap');

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];

function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(
    `[ha:fault-inject:stub] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`,
  );
}

function probe(port) {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: HOST, port, path: '/livez', method: 'GET', timeout: 1500 },
      (res) => {
        res.resume();
        res.on('end', () =>
          resolve({ ok: res.statusCode === 200, status: res.statusCode ?? 0 }),
        );
      },
    );
    req.on('error', () => resolve({ ok: false, status: 0 }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0 });
    });
    req.end();
  });
}

function printReceipt(fields) {
  const lines = [
    '===== RECEIPT ha:fault-inject:stub =====',
    `result: ${fields.result}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `faultInject: ${fields.faultInject}`,
    `sharedState: GAP`,
    `host: ${HOST}`,
    `portA: ${PORT_A}`,
    `portB: ${PORT_B}`,
  ];
  if (fields.gap) lines.push(`gap: ${fields.gap}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  for (const s of steps) {
    lines.push(
      `step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`,
    );
  }
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

function writeEvidence(name, body) {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const path = join(EVIDENCE_DIR, name);
  writeFileSync(path, JSON.stringify(body, null, 2));
  return path;
}

async function wait(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  note(
    'honesty banner',
    true,
    'releaseEvidence=false; fault-inject stub ≠ production HA',
  );

  const a0 = await probe(PORT_A);
  const b0 = await probe(PORT_B);
  note('pre dual livez A', a0.ok, `status=${a0.status}`);
  note('pre dual livez B', b0.ok, `status=${b0.status}`);

  if (!a0.ok || !b0.ok) {
    printReceipt({
      result: allowGap ? 'STUBBED_GAP' : 'FAIL',
      faultInject: 'STUBBED_NOT_RUN',
      gap: 'dual /livez not up — cannot fault-inject; bring-up with --stub first',
      note: 'fault-inject remains stubbed/honesty-pinned until dual instances exist',
    });
    const exit = allowGap ? 0 : 1;
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/fault-inject.stub.mjs')} EXIT=${exit}`,
    );
    process.exit(exit);
  }

  const killCmd = process.env.HA_FAULT_KILL_CMD;
  let method = 'unknown';

  if (killCmd) {
    method = 'HA_FAULT_KILL_CMD';
    const r = spawnSync(killCmd, {
      shell: true,
      encoding: 'utf8',
      cwd: ROOT,
    });
    note('external kill cmd', r.status === 0, `status=${r.status}`);
  } else if (existsSync(PID_PATH)) {
    method = 'STUB_RESTART_B_ONLY';
    const stop = spawnSync(process.execPath, [STUB, '--stop'], {
      encoding: 'utf8',
      cwd: ROOT,
    });
    note('stop dual stub', stop.status === 0, `status=${stop.status}`);
    await wait(150);
    const startB = spawnSync(process.execPath, [STUB, '--daemon', '--b-only'], {
      encoding: 'utf8',
      cwd: ROOT,
    });
    note(
      'restart B-only survivor',
      startB.status === 0,
      `status=${startB.status}`,
    );
    await wait(400);
  } else {
    printReceipt({
      result: allowGap ? 'STUBBED_GAP' : 'FAIL',
      faultInject: 'STUBBED_NOT_RUN',
      gap: 'no stub pid file and HA_FAULT_KILL_CMD unset — refuse blind kill of unknown process',
      note: 'honesty pin: fault-inject not runnable without stub pid or authorized kill cmd',
    });
    const exit = allowGap ? 0 : 1;
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/fault-inject.stub.mjs')} EXIT=${exit}`,
    );
    process.exit(exit);
  }

  const a1 = await probe(PORT_A);
  const b1 = await probe(PORT_B);
  note('post A down', !a1.ok, `A status=${a1.status} (expect down)`);
  note('post B still serving', b1.ok, `B status=${b1.status}`);

  const killPath = writeEvidence('kill-A.receipt.json', {
    method,
    at: new Date().toISOString(),
    portA: PORT_A,
    portB: PORT_B,
    aDown: !a1.ok,
    bStillServing: b1.ok,
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    note: 'stub fault-inject receipt — Not production HA; shared-state still GAP',
  });
  const bPath = writeEvidence('B-still-serving.receipt.json', {
    port: PORT_B,
    status: b1.status,
    ok: b1.ok,
    at: new Date().toISOString(),
    haStatus: 'NOT_HA',
    releaseEvidence: false,
  });
  // Explicit marker that shared-state was NOT proven (C3 GAP).
  writeEvidence('shared-state.GAP.json', {
    status: 'GAP',
    reason: 'STUB_LIVEZ_ONLY has no shared DB/session path',
    haStatus: 'NOT_HA',
    releaseEvidence: false,
  });
  note('wrote kill receipt', true, killPath);
  note('wrote B-still-serving receipt', true, bPath);

  const ok = !a1.ok && b1.ok;
  printReceipt({
    result: ok ? 'STUB_FAULT_PARTIAL' : 'FAIL',
    faultInject: ok ? 'STUB_A_DOWN_B_UP' : 'STUB_INCOMPLETE',
    note: ok
      ? 'A down + B serving on stub path — STILL Not HA; shared-state (C3) GAP; no CI; releaseEvidence=false'
      : 'fault-inject stub did not achieve A-down + B-up',
    gap: ok
      ? 'shared-state C3 still GAP; real Nest API dual still GAP'
      : 'A-down/B-up not both true',
  });
  const exit = ok ? 0 : 1;
  console.log(
    `CMD=node ${join(ROOT, 'scripts/ha/fault-inject.stub.mjs')} EXIT=${exit}`,
  );
  process.exit(exit);
}

main().catch((err) => {
  printReceipt({
    result: 'FAIL',
    faultInject: 'ERROR',
    gap: err instanceof Error ? err.stack ?? err.message : String(err),
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/fault-inject.stub.mjs')} EXIT=1`);
  process.exit(1);
});
