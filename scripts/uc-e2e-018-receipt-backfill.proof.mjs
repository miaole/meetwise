#!/usr/bin/env node
/**
 * Prove: machine-only emitter guard refuses hand-written / edited JSON.
 * Also asserts gatherer prefers uc018-receipt-backfill overlays when valid,
 * and fail-closes (BACKFILL-FAILED) when proveExit≠0 or proveExit missing —
 * Ban silent legacy green.
 */
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
  EMITTED_BY,
  sha256Text,
  validateMachineEmittedReceipt,
  isBackfillReceiptShape,
  isPreferableBackfillReceipt,
} from './lib/uc018-receipt-backfill-guard.mjs';
import { stackFact, unobservedFact, TRACKED_IMAGES } from './lib/uc018-receipt-backfill-facts.mjs';
import { REFUSE_REASONS, evaluate } from './lib/uc-covered-evaluator.mjs';

const root = process.cwd();
let failed = 0;
function pass(msg) { console.log('PASS ', msg); }
function fail(msg) { console.error('FAIL ', msg); failed++; }

const tmp = join(root, '.tmp/uc018-receipt-backfill-prove');
mkdirSync(tmp, { recursive: true });
const logPath = join(tmp, 'sample.log');
const logBody = 'synthetic prove log line\nEXIT=0\n';
writeFileSync(logPath, logBody);
const digest = createHash('sha256').update(logBody, 'utf8').digest('hex');

function sourcedStackOk() {
  return {
    postgres: stackFact(true, 'log-parse', { line: 1, regex: 'synthetic' }),
    postgresSaver: stackFact(true, 'log-parse', { line: 1, regex: 'synthetic' }),
    memorySaver: stackFact(false, 'log-parse', { line: 1, regex: 'synthetic' }),
    mysql: stackFact(false, 'log-parse', { line: 1, regex: 'synthetic' }),
    qdrant: stackFact(false, 'log-parse', { line: 1, regex: 'synthetic' }),
  };
}
function imageDigestsOk() {
  const o = {};
  for (const img of TRACKED_IMAGES) {
    o[img] = { imageDigest: 'not-started', started: false, source: 'log-parse' };
  }
  return o;
}

const good = {
  emittedBy: EMITTED_BY,
  ranAt: new Date().toISOString(),
  targetSha: 'a'.repeat(40),
  wrapperSha: 'b'.repeat(40),
  runnerCommitSha: 'a'.repeat(40),
  cmd: 'pnpm uc018:sole:prove',
  exit: 0,
  logPath,
  stdoutDigest: digest,
  disclosure: 'EOR@targetSha ≠ proven at tip (code drift).',
  stack: sourcedStackOk(),
  imageDigests: imageDigestsOk(),
};
{
  const v = validateMachineEmittedReceipt(good, { root });
  if (v.ok) pass('valid machine receipt accepted');
  else fail('valid machine receipt rejected: ' + v.reason);
}

// Hand-written: missing emittedBy
{
  const bad = { ...good, emittedBy: 'human-paste' };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && v.reason === 'emittedBy-mismatch') pass('hand-written emittedBy rejected');
  else fail('expected emittedBy-mismatch got ' + JSON.stringify(v));
}

// Edited digest
{
  const bad = { ...good, stdoutDigest: '0'.repeat(64) };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && v.reason === 'stdoutDigest-mismatch') pass('edited stdoutDigest rejected');
  else fail('expected stdoutDigest-mismatch got ' + JSON.stringify(v));
}

// Missing disclosure clause
{
  const bad = { ...good, disclosure: 'looks fine' };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && v.reason === 'disclosure-missing-eor-clause') pass('missing EOR disclosure rejected');
  else fail('expected disclosure-missing-eor-clause got ' + JSON.stringify(v));
}

// runnerCommitSha !== targetSha
{
  const bad = { ...good, runnerCommitSha: 'c'.repeat(40) };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && v.reason === 'runnerCommitSha-ne-targetSha') pass('runner/target mismatch rejected');
  else fail('expected runnerCommitSha-ne-targetSha got ' + JSON.stringify(v));
}

// Prose-only JSON (no log binding fields)
{
  const prose = { knife: 'fake', exit: 0, gitSha: 'deadbeef', note: 'I swear it passed' };
  const v = validateMachineEmittedReceipt(prose, { root });
  if (!v.ok) pass('prose JSON rejected (' + v.reason + ')');
  else fail('prose JSON unexpectedly accepted');
}

// D-A: stack fact without source rejected
{
  const bad = {
    ...good,
    stack: {
      ...sourcedStackOk(),
      postgresSaver: true, // hardcoded bare boolean — no source
    },
  };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && String(v.reason).includes('source')) pass('stack fact without source rejected (' + v.reason + ')');
  else fail('expected stack-source reject got ' + JSON.stringify(v));
}

// D-A / images: missing imageDigest field rejected
{
  const imgs = imageDigestsOk();
  delete imgs['minio/minio:latest'].imageDigest;
  const bad = { ...good, imageDigests: imgs };
  const v = validateMachineEmittedReceipt(bad, { root });
  if (!v.ok && String(v.reason).includes('imageDigest')) pass('missing imageDigest field rejected (' + v.reason + ')');
  else fail('expected imageDigest-field-missing got ' + JSON.stringify(v));
}

if (!isBackfillReceiptShape(good)) fail('isBackfillReceiptShape false for good');
else pass('isBackfillReceiptShape true for good');
if (isBackfillReceiptShape({ exit: 0 })) fail('shape too loose');
else pass('isBackfillReceiptShape false for thin object');
if (!isPreferableBackfillReceipt(good)) fail('preferable false for exit=0 good');
else pass('isPreferableBackfillReceipt true for exit=0');
if (isPreferableBackfillReceipt({ ...good, exit: 1 })) fail('preferable true for exit=1');
else pass('isPreferableBackfillReceipt false for exit=1');

// Gatherer D-B cases
{
  const g = await import('./lib/uc-covered-real-gatherer.mjs');
  if (typeof g.readReceiptPreferBackfill !== 'function') {
    fail('gatherer missing readReceiptPreferBackfill export');
  } else {
    pass('gatherer exports readReceiptPreferBackfill');
  }
  if (g.WAITING_USER_BACKFILL_STATUS !== 'MISSING-EVIDENCE') {
    fail('WAITING_USER_BACKFILL_STATUS=' + g.WAITING_USER_BACKFILL_STATUS);
  } else pass('waiting_user = MISSING-EVIDENCE constant');

  const recvRoot = join(tmp, 'receipts');
  mkdirSync(join(recvRoot, 'uc018-receipt-backfill'), { recursive: true });
  const legacyRel = 'legacy-green.json';
  writeFileSync(join(recvRoot, legacyRel), JSON.stringify({
    exit: 0,
    gitSha: 'd'.repeat(40),
    evidenceOfRecord: true,
    note: 'legacy would look green',
  }));

  // Case 1: exit=1 backfill must NOT be preferred; flag BACKFILL-FAILED path
  const failBf = {
    ...good,
    exit: 1,
    logPath: 'uc018-receipt-backfill/exit1.log',
  };
  const exit1Log = join(recvRoot, 'uc018-receipt-backfill/exit1.log');
  writeFileSync(exit1Log, logBody);
  failBf.stdoutDigest = createHash('sha256').update(logBody, 'utf8').digest('hex');
  failBf.logPath = exit1Log; // absolute ok for shape; gatherer only checks shape fields
  // gatherer uses relative under receipt root — write relative path receipt
  const failBfDisk = {
    ...failBf,
    logPath: 'uc018-receipt-backfill/exit1.log',
    stdoutDigest: createHash('sha256').update(logBody, 'utf8').digest('hex'),
  };
  writeFileSync(join(recvRoot, 'uc018-receipt-backfill/EXIT1.json'), JSON.stringify(failBfDisk));
  // Fix: readReceiptPreferBackfill joins receiptRoot + backfillRel file name
  writeFileSync(join(recvRoot, 'uc018-receipt-backfill/CASE-EXIT1.json'), JSON.stringify(failBfDisk));
  const r1 = g.readReceiptPreferBackfill(recvRoot, 'CASE-EXIT1.json', legacyRel);
  if (r1 && r1._backfillFailed === true && r1._source === 'backfill-failed' && r1.exit === 1) {
    pass('D-B exit=1 backfill not preferred (flagged backfill-failed)');
  } else {
    fail('D-B exit=1 expected backfill-failed got ' + JSON.stringify({
      source: r1?._source, failed: r1?._backfillFailed, exit: r1?.exit, eor: r1?.evidenceOfRecord,
    }));
  }
  if (r1 && r1.evidenceOfRecord === true) fail('D-B exit=1 must not keep evidenceOfRecord=true');
  else pass('D-B exit=1 evidenceOfRecord forced false');
  // Must not wash to legacy exit 0
  if (r1 && r1.note === 'legacy would look green') fail('D-B exit=1 silently fell back to legacy');
  else pass('D-B exit=1 no silent legacy fallback');

  // Evaluator surfaces BACKFILL-FAILED
  const col = {
    status: 'partial',
    nhpIds: ['NHP-018-NEG-01'],
    prove: { cmd: 'x', exit: 1, gitSha: 'a'.repeat(40), committed: true, shaMatchesCommitted: true, uncommitted: false, staleSha: false },
    dual: { e2eHa: 'PASS', ragRoute: 'PASS' },
    stack: { postgres: true, postgresSaver: true, memorySaver: false, mysql: false, qdrant: false },
    receipts: {
      evidenceOfRecord: false,
      implementerOnly: false,
      capacityRepresentative: false,
      targetEnv: 'docker-isolated',
      present: true,
      missing: true,
      backfillFailed: true,
    },
  };
  // Use evaluate with minimal input — call evaluateColumn via evaluate
  const ev = evaluate({
    columns: {
      NEG: col, FAULT: col, BOUND: col, ADV: col, PERF: col, LOAD: col,
    },
    section11: { businessPathMet: false, openGaps: ['GAP-X'], status: 'partial' },
  });
  const reasons = ev.reasons || [];
  if (reasons.includes(REFUSE_REASONS.BACKFILL_FAILED) || reasons.includes('BACKFILL-FAILED')) {
    pass('D-B evaluator emits BACKFILL-FAILED reason');
  } else {
    fail('D-B missing BACKFILL-FAILED in reasons=' + reasons.join(','));
  }

  // Case 2: missing proveExit
  const miss = { ...failBfDisk };
  delete miss.exit;
  writeFileSync(join(recvRoot, 'uc018-receipt-backfill/CASE-NOEXIT.json'), JSON.stringify(miss));
  const r2 = g.readReceiptPreferBackfill(recvRoot, 'CASE-NOEXIT.json', legacyRel);
  if (r2 && r2._backfillFailed === true && r2._backfillFailReason === 'missing-or-invalid-proveExit') {
    pass('D-B missing proveExit flagged backfill-failed');
  } else {
    fail('D-B missing proveExit got ' + JSON.stringify({
      source: r2?._source, failed: r2?._backfillFailed, reason: r2?._backfillFailReason, exit: r2?.exit,
    }));
  }
  if (r2 && r2.note === 'legacy would look green') fail('D-B missing exit silently fell back to legacy');
  else pass('D-B missing exit no silent legacy fallback');
}

rmSync(tmp, { recursive: true, force: true });

console.log(failed === 0
  ? '\nCMD=pnpm uc018:receipt-backfill:prove EXIT=0'
  : `\nCMD=pnpm uc018:receipt-backfill:prove EXIT=1 failures=${failed}`);
process.exit(failed === 0 ? 0 : 1);
