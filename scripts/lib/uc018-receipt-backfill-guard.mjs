/**
 * UC018 receipt-backfill · machine-only receipt guard.
 *
 * Mechanism (two layers):
 *   1. Structural fields + SHA-256 digest of the captured prove log file
 *      (stdoutDigest binds the exact log bytes — any log byte flip rejects).
 *   2. HMAC-SHA256 emitter authentication (GAP-BACKFILL-EMITTER-UNAUTHENTICATED):
 *      the emitter signs a canonical serialization of the whole receipt
 *      (everything except the HMAC tag itself — including the log digest),
 *      so a writer who can rewrite BOTH the JSON and the log still cannot
 *      produce a verifying pair without the key. The key comes from the
 *      process environment at run time (env UC018_RECEIPT_HMAC_KEY);
 *      no default key in the repo; no key value ever logged.
 *
 * Fail-closed rules:
 *   - validateMachineEmittedReceipt / verifyReceiptAuthenticity default to
 *     requireAuth=true: a receipt with a valid log digest but no HMAC tag is
 *     REJECTED (`hmac-missing`). Callers that must tolerate pre-HMAC legacy
 *     receipts opt in with requireAuth:false — the result is then labeled
 *     `authStatus:'unsigned-legacy'`, never treated as signed.
 *   - A present-but-bad signature (wrong/truncated/malformed tag, unknown
 *     scheme) rejects even with requireAuth:false.
 *   - Missing key at verification time → reject (`hmac-key-missing`).
 *
 * isBackfillReceiptShape / isPreferableBackfillReceipt stay auth-agnostic on
 * purpose: the gatherer (`readReceiptPreferBackfill`) keeps its current
 * semantics for receipts already on disk (Ban silent coverage-verdict change).
 * Strict authentication for evidence audits goes through
 * verifyMachineReceiptFile / verifyReceiptAuthenticity.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import {
  validateStackSources,
  validateImageDigests,
} from './uc018-receipt-backfill-facts.mjs';

export const EMITTED_BY = 'uc018-receipt-backfill-emit';

/** HMAC scheme + env var name for the emitter key (value never logged/committed). */
export const HMAC_SCHEME = 'HMAC-SHA256';
export const HMAC_KEY_ENV = 'UC018_RECEIPT_HMAC_KEY';

const HMAC_HEX_RE = /^[0-9a-f]{64}$/;

export function sha256File(filePath) {
  const buf = readFileSync(filePath);
  return createHash('sha256').update(buf).digest('hex');
}

export function sha256Text(text) {
  return createHash('sha256').update(String(text), 'utf8').digest('hex');
}

/**
 * Deterministic JSON serialization (recursively sorted object keys, stable
 * number/string escaping via JSON.stringify). Lets the HMAC be computed over
 * the receipt CONTENT rather than incidental on-disk whitespace/key order.
 */
export function canonicalJson(value) {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value)
    .filter((k) => value[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

/**
 * Canonical HMAC payload: the whole receipt except the `auth.hmac` tag itself.
 * Every other field — including auth.scheme/keyId/keyFingerprint, stdoutDigest
 * (log-bytes binding), logPath, exit, stack, imageDigests, disclosure — is
 * covered, so ANY payload mutation (or any extra injected field) breaks the tag.
 */
export function receiptAuthPayload(receipt) {
  if (receipt && typeof receipt === 'object' && receipt.auth && typeof receipt.auth === 'object') {
    const { hmac, ...authMeta } = receipt.auth;
    return canonicalJson({ ...receipt, auth: authMeta });
  }
  return canonicalJson(receipt);
}

function hmacDigest(payload, hmacKey) {
  return createHmac('sha256', hmacKey).update(payload, 'utf8').digest('hex');
}

/** Non-reversible key fingerprint recorded per receipt (rotation tracking; not a secret). */
export function hmacKeyFingerprint(hmacKey) {
  return sha256Text(hmacKey).slice(0, 12);
}

/**
 * Sign a receipt. Returns the `auth` object to attach to the receipt.
 * Throws (fail closed) when no key is provided — Ban a repo default key.
 * @param {object} receipt receipt WITHOUT auth (or with a previous auth that gets replaced)
 * @param {string} hmacKey secret from the process environment
 * @param {{ keyId?: string }} [opts]
 */
export function computeReceiptAuth(receipt, hmacKey, opts = {}) {
  if (typeof hmacKey !== 'string' || !hmacKey.length) {
    const e = new Error(`hmac-key-missing: set ${HMAC_KEY_ENV} (value is never logged or committed)`);
    e.code = 'HMAC-KEY-MISSING';
    throw e;
  }
  const authMeta = {
    scheme: HMAC_SCHEME,
    keyId: opts.keyId || `env:${HMAC_KEY_ENV}`,
    keyFingerprint: hmacKeyFingerprint(hmacKey),
  };
  // Sign over exactly what verification will canonicalize: auth meta without the tag.
  const payload = receiptAuthPayload({ ...receipt, auth: authMeta });
  return { ...authMeta, hmac: hmacDigest(payload, hmacKey) };
}

/**
 * Verify receipt authenticity (HMAC layer only — structural/log checks live in
 * validateMachineEmittedReceipt).
 *
 * - No auth tag + requireAuth (default true)  → { ok:false, reason:'hmac-missing' }
 * - No auth tag + requireAuth:false           → { ok:true, authed:false, authStatus:'unsigned-legacy' }
 *   (old HMAC-free receipts are labeled, never silently treated as signed)
 * - Present-but-bad tag (any mode)            → reject (wrong/truncated/unknown scheme)
 * - Key missing at verify time                → reject 'hmac-key-missing' (fail closed)
 *
 * @param {object} receipt
 * @param {{ requireAuth?: boolean, hmacKey?: string }} [opts]
 */
export function verifyReceiptAuthenticity(receipt, opts = {}) {
  const auth = receipt && typeof receipt === 'object' ? receipt.auth : null;
  if (!auth || typeof auth !== 'object') {
    if (opts.requireAuth === false) {
      return { ok: true, authed: false, authStatus: 'unsigned-legacy' };
    }
    return { ok: false, reason: 'hmac-missing', authed: false, authStatus: 'unsigned' };
  }
  if (auth.scheme !== HMAC_SCHEME) {
    return { ok: false, reason: 'hmac-scheme-unsupported', authed: false, authStatus: 'invalid' };
  }
  if (typeof auth.hmac !== 'string' || !HMAC_HEX_RE.test(auth.hmac)) {
    return { ok: false, reason: 'hmac-truncated-or-malformed', authed: false, authStatus: 'invalid' };
  }
  const hmacKey = typeof opts.hmacKey === 'string' && opts.hmacKey.length
    ? opts.hmacKey
    : process.env[HMAC_KEY_ENV];
  if (typeof hmacKey !== 'string' || !hmacKey.length) {
    return { ok: false, reason: 'hmac-key-missing', authed: false, authStatus: 'invalid' };
  }
  const expected = hmacDigest(receiptAuthPayload(receipt), hmacKey);
  const got = Buffer.from(auth.hmac, 'hex');
  const want = Buffer.from(expected, 'hex');
  if (got.length !== want.length || !timingSafeEqual(got, want)) {
    return { ok: false, reason: 'hmac-invalid', authed: false, authStatus: 'invalid' };
  }
  return {
    ok: true,
    authed: true,
    authStatus: 'signed-valid',
    keyFingerprint: typeof auth.keyFingerprint === 'string' ? auth.keyFingerprint : null,
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

/**
 * @param {object} receipt
 * @param {{ root?: string, requireLogFile?: boolean, requireAuth?: boolean, hmacKey?: string }} [opts]
 * @returns {{ ok: true, authed: boolean, authStatus: string } | { ok: false, reason: string }}
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
    // Structural-only mode still verifies a present HMAC tag (fail closed),
    // and labels unsigned receipts instead of silently treating them as signed.
    const authV = verifyReceiptAuthenticity(receipt, {
      requireAuth: opts.requireAuth !== false,
      hmacKey: opts.hmacKey,
    });
    if (!authV.ok) return authV;
    return { ok: true, authed: authV.authed, authStatus: authV.authStatus };
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
  // Auth check LAST so log-byte tampering still reports the specific
  // `stdoutDigest-mismatch` reason; a forged pair fails on whichever layer
  // the attacker touches first, and a bad/missing tag fails closed here.
  const authV = verifyReceiptAuthenticity(receipt, {
    requireAuth: opts.requireAuth !== false,
    hmacKey: opts.hmacKey,
  });
  if (!authV.ok) return authV;
  return { ok: true, authed: authV.authed, authStatus: authV.authStatus };
}

/**
 * Verify a receipt exactly as it sits on disk (byte-level honesty: parse the
 * file, then structural + log-digest + HMAC checks). JSON parse failure is a
 * reject, so single-byte tampering anywhere in the file cannot pass.
 * @param {string} absPath
 * @param {{ root?: string, requireAuth?: boolean, hmacKey?: string }} [opts]
 */
export function verifyMachineReceiptFile(absPath, opts = {}) {
  let text;
  try {
    text = readFileSync(absPath, 'utf8');
  } catch (e) {
    return { ok: false, reason: `receipt-read-fail:${e.message}` };
  }
  let receipt;
  try {
    receipt = JSON.parse(text);
  } catch (e) {
    return { ok: false, reason: `receipt-json-parse-fail:${e.message}` };
  }
  return validateMachineEmittedReceipt(receipt, opts);
}

/**
 * Structural shape for a machine backfill candidate.
 * exit must be an integer (0 or nonzero). Missing exit ⇒ false.
 * Preferability (exit===0) is enforced by readReceiptPreferBackfill, not here.
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

/** Preferable evidence: shape OK + proveExit === 0. */
export function isPreferableBackfillReceipt(receipt) {
  return isBackfillReceiptShape(receipt) && receipt.exit === 0;
}
