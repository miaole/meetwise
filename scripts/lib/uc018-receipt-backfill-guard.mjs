/**
 * UC018 receipt-backfill · machine-only receipt guard (HMAC-free).
 *
 * Mechanism: structural fields + SHA-256 digest of the captured prove log file.
 * Limits (disclosed): not cryptographic authentication of the emitter process;
 * an attacker with write access to both JSON and log can forge a matching pair.
 * Purpose: refuse *hand-written* / prose-pasted JSON that lacks a real log binding
 * or invents fields without an on-disk log digest match.
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

export const EMITTED_BY = 'uc018-receipt-backfill-emit';

export function sha256File(filePath) {
  const buf = readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

export function sha256Text(text) {
  return createHash('sha256').update(String(text), 'utf8').digest('hex');
}

const REQUIRED = [
  'emittedBy',
  'ranAt',
  'targetSha',
  'wrapperSha',
  'runnerCommitSha',
  'cmd',
  'exit',
  'logPath',
  'stdoutDigest',
  'disclosure',
];

/**
 * @param {object} receipt
 * @param {{ root?: string, requireLogFile?: boolean }} [opts]
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function validateMachineEmittedReceipt(receipt, opts = {}) {
  if (!receipt || typeof receipt !== 'object') {
    return { ok: false, reason: 'receipt-not-object' };
  }
  if (receipt.emittedBy !== EMITTED_BY) {
    return { ok: false, reason: 'emittedBy-mismatch' };
  }
  for (const k of REQUIRED) {
    if (receipt[k] == null || receipt[k] === '') {
      return { ok: false, reason: `missing-field:${k}` };
    }
  }
  if (typeof receipt.exit !== 'number' || !Number.isInteger(receipt.exit)) {
    return { ok: false, reason: 'exit-not-int' };
  }
  if (receipt.runnerCommitSha !== receipt.targetSha) {
    return { ok: false, reason: 'runnerCommitSha-ne-targetSha' };
  }
  if (!/EOR@targetSha ≠ proven at tip/i.test(String(receipt.disclosure))) {
    return { ok: false, reason: 'disclosure-missing-eor-clause' };
  }
  const requireLog = opts.requireLogFile !== false;
  if (!requireLog) return { ok: true };

  const root = opts.root || process.cwd();
  const logAbs = isAbsolute(receipt.logPath)
    ? receipt.logPath
    : join(root, receipt.logPath);
  if (!existsSync(logAbs)) {
    return { ok: false, reason: 'log-file-missing' };
  }
  let digest;
  try {
    digest = sha256File(logAbs);
  } catch (e) {
    return { ok: false, reason: `log-read-fail:${e.message}` };
  }
  if (digest !== receipt.stdoutDigest) {
    return { ok: false, reason: 'stdoutDigest-mismatch' };
  }
  return { ok: true };
}

/** Soft check for gatherer (log may be gitignored under .tmp — allow missing log if digest present + emittedBy). */
export function isBackfillReceiptShape(receipt) {
  if (!receipt || typeof receipt !== 'object') return false;
  if (receipt.emittedBy !== EMITTED_BY) return false;
  if (typeof receipt.exit !== 'number') return false;
  if (!receipt.targetSha || !receipt.wrapperSha || !receipt.ranAt) return false;
  if (!receipt.stdoutDigest || !receipt.logPath) return false;
  return true;
}
