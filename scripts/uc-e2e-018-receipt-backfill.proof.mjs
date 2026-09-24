#!/usr/bin/env node
/**
 * Prove: machine-only emitter guard refuses hand-written / edited JSON.
 * Also asserts gatherer prefers uc018-receipt-backfill overlays when valid.
 */
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
  EMITTED_BY,
  sha256Text,
  validateMachineEmittedReceipt,
  isBackfillReceiptShape,
} from './lib/uc018-receipt-backfill-guard.mjs';

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

if (!isBackfillReceiptShape(good)) fail('isBackfillReceiptShape false for good');
else pass('isBackfillReceiptShape true for good');
if (isBackfillReceiptShape({ exit: 0 })) fail('shape too loose');
else pass('isBackfillReceiptShape false for thin object');

// Gatherer helper import (path wiring exists)
{
  const g = await import('./lib/uc-covered-real-gatherer.mjs');
  if (typeof g.readReceiptPreferBackfill !== 'function') {
    fail('gatherer missing readReceiptPreferBackfill export');
  } else {
    pass('gatherer exports readReceiptPreferBackfill');
  }
  if (typeof g.WAITING_USER_BACKFILL_STATUS !== 'string') {
    fail('missing WAITING_USER_BACKFILL_STATUS');
  } else if (g.WAITING_USER_BACKFILL_STATUS !== 'MISSING-EVIDENCE') {
    fail('WAITING_USER_BACKFILL_STATUS=' + g.WAITING_USER_BACKFILL_STATUS);
  } else pass('waiting_user = MISSING-EVIDENCE constant');
}

rmSync(tmp, { recursive: true, force: true });

console.log(failed === 0
  ? '\nCMD=pnpm uc018:receipt-backfill:prove EXIT=0'
  : `\nCMD=pnpm uc018:receipt-backfill:prove EXIT=1 failures=${failed}`);
process.exit(failed === 0 ? 0 : 1);
