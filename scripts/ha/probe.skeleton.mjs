#!/usr/bin/env node
/**
 * Meetwise HA dual-instance probe SKELETON.
 *
 * Default: fail-closed / mark NOT_HA. Does not claim production HA.
 * releaseEvidence is always false in this skeleton.
 *
 * Modes:
 *   (default)              → receipt haStatus=NOT_HA, result=SKELETON, EXIT=0
 *                            (skeleton path OK; NOT HA green)
 *   --require-evidence     → without real dual-instance evidence → EXIT=1
 *   MEETWISE_HA_PROBE_EVIDENCE_DIR=/path
 *                            → reads receipts from dir; still releaseEvidence=false;
 *                              still claimProductionHA=false; local evidence ≠ prod HA
 *
 * Future real prove (NOT this file): start api-a/api-b, write shared state,
 * kill A, read from B, print RECEIPT. That path is documented in
 * ai-docs/delivery/harness/ha-track.skeleton.md only.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

const requireEvidence =
  process.argv.includes('--require-evidence') ||
  process.env.MEETWISE_HA_REQUIRE_EVIDENCE === '1';

const PORT_A = Number(process.env.HA_PROBE_PORT_A ?? '18787');
const PORT_B = Number(process.env.HA_PROBE_PORT_B ?? '18788');
const HOST = process.env.HA_PROBE_HOST ?? '127.0.0.1';
const EVIDENCE_DIR = process.env.MEETWISE_HA_PROBE_EVIDENCE_DIR ?? '';

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];

function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(`[ha:probe:skeleton] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`);
}

function request(port, method, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: HOST,
        port,
        path: urlPath,
        method,
        timeout: 2_000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            text: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('request_timeout'));
    });
    req.end();
  });
}

async function probeLivez(port, label) {
  try {
    const res = await request(port, 'GET', '/livez');
    const ok = res.status === 200;
    note(`livez ${label}`, ok, `port=${port} status=${res.status}`);
    return ok;
  } catch (err) {
    note(
      `livez ${label}`,
      false,
      `port=${port} unreachable: ${err instanceof Error ? err.message : err}`,
    );
    return false;
  }
}

function listEvidenceFiles(dir) {
  if (!dir || !existsSync(dir)) return [];
  try {
    return readdirSync(dir).filter((f) => !f.startsWith('.'));
  } catch {
    return [];
  }
}

function printReceipt({ result, haStatus, failReason }) {
  const lines = [
    '===== RECEIPT ha:probe:skeleton =====',
    `result: ${result}`,
    `haStatus: ${haStatus}`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `host: ${HOST}`,
    `portA: ${PORT_A}`,
    `portB: ${PORT_B}`,
    `requireEvidence: ${requireEvidence}`,
    `evidenceDir: ${EVIDENCE_DIR || '(none)'}`,
    `note: SKELETON only — Not HA; local dual-instance green (if any) ≠ production HA`,
  ];
  if (failReason) lines.push(`failReason: ${failReason}`);
  for (const s of steps) {
    lines.push(
      `step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`,
    );
  }
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

async function main() {
  note('skeleton banner', true, 'releaseEvidence=false; claimProductionHA=false');

  const harness = join(ROOT, 'ai-docs/delivery/harness/ha-track.skeleton.md');
  if (existsSync(harness)) {
    const text = readFileSync(harness, 'utf8');
    note(
      'harness present',
      /releaseEvidence\s*=\s*false/i.test(text) && /Not HA|非 HA/i.test(text),
      harness,
    );
  } else {
    note('harness present', false, harness);
  }

  // Optional opportunistic probe — never upgrades to HA claim.
  const aUp = await probeLivez(PORT_A, 'A');
  const bUp = await probeLivez(PORT_B, 'B');
  const dualLive = aUp && bUp;
  note(
    'dual livez',
    dualLive,
    dualLive
      ? 'both ports answered 200 (still NOT production HA; no fault-inject yet)'
      : 'missing dual /livez — expected for skeleton-only environments',
  );

  const evidenceFiles = listEvidenceFiles(EVIDENCE_DIR);
  const hasKillReceipt = evidenceFiles.some((f) => /kill|fault|inject|a-down/i.test(f));
  const hasSharedReceipt = evidenceFiles.some((f) => /shared|cart|session|state/i.test(f));
  note(
    'evidence dir',
    evidenceFiles.length > 0,
    EVIDENCE_DIR
      ? `files=${evidenceFiles.length} killReceipt=${hasKillReceipt} sharedReceipt=${hasSharedReceipt}`
      : 'MEETWISE_HA_PROBE_EVIDENCE_DIR unset',
  );

  // Real multi-instance evidence bar (still ≠ production HA).
  const realMultiEvidence = dualLive && hasKillReceipt && hasSharedReceipt;

  if (realMultiEvidence) {
    note(
      'multi-instance evidence bar',
      true,
      'dual livez + kill + shared receipts present — STILL releaseEvidence=false; STILL Not production HA',
    );
    printReceipt({
      result: 'LOCAL_EVIDENCE_PARTIAL',
      haStatus: 'NOT_HA',
      failReason:
        'local dual-instance evidence seen but fault-inject+CI+independent review+prod topology not complete; NOT production HA',
    });
    // Fail closed on "HA green": never EXIT=0 with HA claim.
    // EXIT=0 only when not requiring HA; here we mark NOT_HA explicitly.
    const exit = requireEvidence ? 1 : 0;
    console.log(`CMD=node ${join(ROOT, 'scripts/ha/probe.skeleton.mjs')} EXIT=${exit}`);
    process.exit(exit);
  }

  // Default skeleton path: no real evidence.
  note(
    'multi-instance evidence bar',
    false,
    'no real dual-instance + fault-inject receipts — fail-closed / NOT_HA',
  );

  if (requireEvidence) {
    printReceipt({
      result: 'FAIL',
      haStatus: 'NOT_HA',
      failReason:
        'MEETWISE_HA_REQUIRE_EVIDENCE / --require-evidence set but dual livez + kill + shared receipts missing',
    });
    console.log(`CMD=node ${join(ROOT, 'scripts/ha/probe.skeleton.mjs')} --require-evidence EXIT=1`);
    process.exit(1);
  }

  printReceipt({
    result: 'SKELETON',
    haStatus: 'NOT_HA',
    failReason:
      'skeleton-only run; multi-instance + fault-inject prove not executed; Not HA',
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/probe.skeleton.mjs')} EXIT=0`);
  process.exit(0);
}

main().catch((err) => {
  printReceipt({
    result: 'FAIL',
    haStatus: 'NOT_HA',
    failReason: err instanceof Error ? err.stack ?? err.message : String(err),
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/probe.skeleton.mjs')} EXIT=1`);
  process.exit(1);
});
