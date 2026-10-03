/**
 * UC018 receipt-backfill · machine receipt guard.
 *
 * Structural fields + SHA-256 of the log file, plus HMAC-SHA256 over the
 * canonical receipt claims and the log bytes.
 *
 * Key: process env MEETWISE_UC018_BACKFILL_HMAC_KEY only.
 * Ban a default key, Ban committing a key, Ban reading .env*.
 * Missing key, missing tag, or bad tag fails closed.
 * There is no optional-pass branch in verifySignedReceipt.
 *
 * Legacy receipts with no emitterHmac field stay readable as UNSIGNED
 * historical evidence. ok on that path is not a signature. signed is false.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import {
  validateStackSources,
  validateImageDigests,
} from './uc018-receipt-backfill-facts.mjs';

export const EMITTED_BY = 'uc018-receipt-backfill-emit';

/** Process environment only. No default. No .env file. */
export const HMAC_KEY_ENV = 'MEETWISE_UC018_BACKFILL_HMAC_KEY';
export const HMAC_ALG = 'HMAC-SHA256';
const HMAC_DOMAIN = 'MEETWISE-UC018-BACKFILL-HMAC-v1\n';

export function sha256File(filePath) {
  const buf = readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

export function sha256Text(text) {
  return createHash('sha256').update(String(text), 'utf8').digest('hex');
}

/**
 * Stable JSON (sorted keys). Undefined object fields are omitted.
 * @param {unknown} value
 * @returns {string | undefined}
 */
function stableStringify(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map((v) => stableStringify(v) ?? 'null').join(',') + ']';
  }
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

/**
 * Binds receipt claims (every field except emitterHmac) and the raw log bytes.
 * A bare SHA-256 of the log is not this payload.
 * @param {object} receipt
 * @param {Buffer | string} logBytes
 */
export function canonicalSignedBytes(receipt, logBytes) {
  const body = { ...receipt };
  delete body.emitterHmac;
  const bodyBuf = Buffer.from(stableStringify(body), 'utf8');
  const logBuf = Buffer.isBuffer(logBytes) ? logBytes : Buffer.from(logBytes);
  return Buffer.concat([
    Buffer.from(HMAC_DOMAIN, 'utf8'),
    Buffer.from(String(bodyBuf.length) + '\n', 'utf8'),
    bodyBuf,
    Buffer.from('\n', 'utf8'),
    Buffer.from(String(logBuf.length) + '\n', 'utf8'),
    logBuf,
  ]);
}

/**
 * @param {object} [opts]
 * @returns {string | null}
 */
export function resolveHmacKey(opts = {}) {
  if (Object.prototype.hasOwnProperty.call(opts, 'hmacKey')) {
    const k = opts.hmacKey;
    return typeof k === 'string' && k.length > 0 ? k : null;
  }
  const env = Object.prototype.hasOwnProperty.call(opts, 'env') ? (opts.env || {}) : process.env;
  const raw = env[HMAC_KEY_ENV];
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

function tagsEqual(a, b) {
  const ba = Buffer.from(String(a), 'utf8');
  const bb = Buffer.from(String(b), 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Classification only. Never returns signed:true.
 * Absence of emitterHmac → unsigned historical. Presence without a tag → tag-missing.
 * @param {object} receipt
 */
export function classifyReceiptAuth(receipt) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return { signed: false, legacy: false, auth: 'not-a-receipt' };
  }
  if (!Object.prototype.hasOwnProperty.call(receipt, 'emitterHmac')) {
    return { signed: false, legacy: true, auth: 'unsigned-historical' };
  }
  const hmac = receipt.emitterHmac;
  const tag = hmac && typeof hmac === 'object' ? hmac.tag : undefined;
  if (typeof tag !== 'string' || tag.length === 0) {
    return { signed: false, legacy: false, auth: 'tag-missing' };
  }
  return { signed: false, legacy: false, auth: 'unverified' };
}

/**
 * Fail closed. No branch returns ok when the tag or key is missing.
 * @param {object} receipt
 * @param {{ logBytes: Buffer | string, key: string }} opts
 */
export function verifySignedReceipt(receipt, opts = {}) {
  const key = Object.prototype.hasOwnProperty.call(opts, 'key')
    ? (typeof opts.key === 'string' && opts.key.length > 0 ? opts.key : null)
    : resolveHmacKey(opts);
  if (!key) {
    return { ok: false, signed: false, reason: 'hmac-key-missing' };
  }
  const hmac = receipt && typeof receipt === 'object' ? receipt.emitterHmac : undefined;
  const tag = hmac && typeof hmac === 'object' ? hmac.tag : undefined;
  if (typeof tag !== 'string' || tag.length === 0) {
    return { ok: false, signed: false, reason: 'hmac-tag-missing' };
  }
  if (!hmac.alg || hmac.alg !== HMAC_ALG) {
    return { ok: false, signed: false, reason: 'hmac-tag-bad' };
  }
  if (!/^[0-9a-f]{64}$/.test(tag)) {
    return { ok: false, signed: false, reason: 'hmac-tag-bad' };
  }
  if (opts.logBytes == null) {
    return { ok: false, signed: false, reason: 'hmac-log-required' };
  }
  const expected = createHmac('sha256', key)
    .update(canonicalSignedBytes(receipt, opts.logBytes))
    .digest('hex');
  if (!tagsEqual(expected, tag)) {
    return { ok: false, signed: false, reason: 'hmac-tag-bad' };
  }
  return { ok: true, signed: true, auth: 'hmac-sha256' };
}

/**
 * Attach emitterHmac. Missing key fails closed (does not invent a tag).
 * @param {object} receipt
 * @param {Buffer | string} logBytes
 * @param {string} key
 */
export function attachEmitterHmac(receipt, logBytes, key) {
  if (typeof key !== 'string' || key.length === 0) {
    return { ok: false, reason: 'hmac-key-missing' };
  }
  if (logBytes == null) {
    return { ok: false, reason: 'hmac-log-required' };
  }
  const draft = { ...receipt };
  delete draft.emitterHmac;
  const tag = createHmac('sha256', key)
    .update(canonicalSignedBytes(draft, logBytes))
    .digest('hex');
  return {
    ok: true,
    receipt: {
      ...draft,
      emitterHmac: { alg: HMAC_ALG, tag },
    },
  };
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
  'stack',
  'imageDigests',
];

function finishAuth(receipt, logAbs, opts) {
  const cls = classifyReceiptAuth(receipt);
  if (cls.legacy) {
    return { ok: true, signed: false, auth: 'unsigned-historical' };
  }
  let logBytes;
  try {
    logBytes = readFileSync(logAbs);
  } catch (e) {
    return { ok: false, signed: false, reason: `log-read-fail:${e.message}` };
  }
  const key = resolveHmacKey(opts);
  return verifySignedReceipt(receipt, { logBytes, key });
}

/**
 * @param {object} receipt
 * @param {{ root?: string, requireLogFile?: boolean, hmacKey?: string, env?: NodeJS.ProcessEnv }} [opts]
 * @returns {{ ok: true, signed: boolean, auth?: string } | { ok: false, reason: string, signed?: boolean }}
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

  const stackV = validateStackSources(receipt.stack);
  if (!stackV.ok) return stackV;

  const imgV = validateImageDigests(receipt.imageDigests);
  if (!imgV.ok) return imgV;

  const requireLog = opts.requireLogFile !== false;
  if (!requireLog) {
    const cls = classifyReceiptAuth(receipt);
    if (cls.legacy) return { ok: true, signed: false, auth: 'unsigned-historical' };
    return { ok: false, signed: false, reason: 'hmac-log-required' };
  }

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
  return finishAuth(receipt, logAbs, opts);
}

/**
 * Structural shape for a machine backfill candidate.
 * exit must be an integer (0 or nonzero). Missing exit ⇒ false.
 * Preferability (exit===0) is enforced by readReceiptPreferBackfill, not here.
 * HMAC is not part of shape: legacy unsigned receipts stay shape-valid.
 * Shape-valid is not signed.
 */
export function isBackfillReceiptShape(receipt) {
  if (!receipt || typeof receipt !== 'object') return false;
  if (receipt.emittedBy !== EMITTED_BY) return false;
  if (typeof receipt.exit !== 'number' || !Number.isInteger(receipt.exit)) return false;
  if (!receipt.targetSha || !receipt.wrapperSha || !receipt.ranAt) return false;
  if (!receipt.stdoutDigest || !receipt.logPath) return false;
  if (!receipt.stack || typeof receipt.stack !== 'object') return false;
  if (!receipt.imageDigests || typeof receipt.imageDigests !== 'object') return false;
  return true;
}

/** Preferable evidence: shape OK + proveExit === 0. Not an HMAC verdict. */
export function isPreferableBackfillReceipt(receipt) {
  return isBackfillReceiptShape(receipt) && receipt.exit === 0;
}
