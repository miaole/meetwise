#!/usr/bin/env node
/**
 * TOKSTREAM-S2 — vendor text-SSE capability probe (stage-2 pre-gate knife).
 *
 * REQUEST rev3 @a8f2f67e (唯一蓝本) · zero product code · scripts/-only.
 *
 * Probes (each runs EXACTLY once per run-id; retry margin 2 is bound to A/B
 * transport-level transient faults only; 4xx and probe C are never retried):
 *   A — non-stream chat baseline (current production call shape).
 *   B — SSE stream (stream=true + stream_options.include_usage=true; NO
 *       incremental_output — that is a DashScope-native parameter, not a
 *       compatible-mode field). Collects TTFT / chunk interval curve /
 *       incremental stitch / usage, grades T0-T3 (graded equivalence, never
 *       byte-equality), and classifies the stream terminal shape.
 *   C — well-formed but nonexistent model id: classifies the error surface
 *       (HTTP-status-first vs mid-stream error frame vs silent cutoff) as
 *       stage-2 sse-pump error-handling design input.
 *
 * Hard guards:
 *   - The endpoint profile env must be EXPLICITLY pinned to dashscope-cn-beijing
 *     (ambient default is another vendor; a wrong-vendor key would turn auth
 *     failures into a false "vendor has no streaming" verdict).
 *   - Pre-flight family assertion: the response `model` field must belong to
 *     the same family as the requested model before any A/B result is credited.
 *   - Key travels in process memory only (authorized loader injects it via
 *     env); value is never logged, never persisted; archives are redacted.
 *   - One-shot: a run-id with existing receipts is refused (no probe re-runs).
 *
 * This script makes NO claims: it records observed facts and graded verdicts
 * for the coordinator's three-way interpretation. releaseEvidence=false.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RECEIPT_BASE = join(REPO_ROOT, 'ai-docs/delivery/receipts/tokstream-s2-probe');
const SELF_PATH = fileURLToPath(import.meta.url);
const RUN_STARTED_AT = new Date().toISOString();
/** Probe A answer text (module-scoped so B's stitch grading can consume it). */
let probeAText = '';
/** B's stitch grading is only creditable when probe A actually completed. */
let probeACompleted = false;

// ---------------------------------------------------------------------------
// Pins (REQUEST rev3 §1 — verbatim)
// ---------------------------------------------------------------------------
const ENDPOINT_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const REQUIRED_PROFILE = 'dashscope-cn-beijing';
const PROBE_MODEL = 'qwen-plus';
const PROBE_C_MODEL = 'qwen-nonexistent-probe';
const PROMPT = '请用不超过80个字说明：SSE（Server-Sent Events）与 WebSocket 的一个关键区别。';
const MAX_TOKENS = 192;
const TEMPERATURE = 0;
const SEED = 42;
const TIMEOUT_A_MS = 60_000;
const TIMEOUT_B_MS = 120_000;
const IDLE_B_MS = 30_000;
const TIMEOUT_C_MS = 60_000;
const IDLE_C_MS = 30_000;
const RETRY_MARGIN = 2; // A/B transport-transient faults only
const ERROR_BODY_CAP = 2_000;
const PRICE_INPUT_CNY_PER_1M = 0.8; // console-reported, NOT independently verified
const PRICE_OUTPUT_CNY_PER_1M = 2; // console-reported, NOT independently verified
const PRICE_BOOK_CITATION =
  'console-reported price book via coordinator 2026-09-23 (g7-freetier-reprove-guard.ts G7_CONSOLE_PRICE_BOOK qwen-plus row); NOT independently verified';

// ---------------------------------------------------------------------------
// CLI + one-shot guard
// ---------------------------------------------------------------------------
function argValue(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function fail(code, detail) {
  process.stderr.write(`tokstream_probe_abort:${code}${detail ? `: ${detail}` : ''}\n`);
  process.exit(3);
}

const RUN_ID = (argValue('--run-id') ?? RUN_STARTED_AT.slice(0, 10)).trim();
if (!/^[A-Za-z0-9._-]+$/.test(RUN_ID)) fail('run_id_invalid', RUN_ID);
const RUN_DIR = join(RECEIPT_BASE, RUN_ID);
if (existsSync(RUN_DIR) && readdirSync(RUN_DIR).length > 0) {
  fail('rerun_forbidden', `run-id ${RUN_ID} already has receipts — each probe runs exactly once (REQUEST Ban)`);
}

// ---------------------------------------------------------------------------
// Environment guards (fail-closed, before any network call)
// ---------------------------------------------------------------------------
const profile = (process.env.MODEL_ENDPOINT_PROFILE ?? '').trim();
if (profile !== REQUIRED_PROFILE) {
  fail('profile_not_pinned_dashscope', `MODEL_ENDPOINT_PROFILE must be explicitly "${REQUIRED_PROFILE}"`);
}
const apiKey = (process.env.MODEL_API_KEY ?? '').trim();
if (!apiKey) fail('model_api_key_missing', 'authorized loader must inject MODEL_API_KEY into process env');
// Legacy free-URL override variables must be absent (same semantics as the
// text endpoint registry: free endpoint URLs are never resolvable inputs).
const legacyOverrides = Object.keys(process.env).filter((name) => /^(MODEL|DASHSCOPE)_[A-Z0-9_]*BASE_URL$/.test(name));
if (legacyOverrides.length > 0) fail('legacy_url_override_present', legacyOverrides.sort().join(','));

// ---------------------------------------------------------------------------
// Redaction (defense-in-depth; discipline follows the G7P redact lineage)
// ---------------------------------------------------------------------------
const REDACT_RULES = [
  { re: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/g, to: 'Bearer [REDACTED_TOKEN]' },
  { re: /\bsk-[A-Za-z0-9]{8,}\b/g, to: 'sk-[REDACTED_KEY]' },
  { re: /\b(api[_-]?key|access[_-]?token|authorization)\s*[:=]\s*['"]?[^'")\s,}]+['"]?/gi, to: '$1=[REDACTED_SECRET]' },
  { re: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, to: '[REDACTED_JWT]' },
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, to: '[REDACTED_EMAIL]' },
  { re: /\b[a-f0-9]{32,}\b/gi, to: '[REDACTED_HEX]' },
  { re: /\bMODEL_API_KEY=([^\s"']+)/g, to: 'MODEL_API_KEY=[REDACTED_KEY]' },
];

function redact(input) {
  let out = String(input);
  for (const rule of REDACT_RULES) out = out.replace(rule.re, rule.to);
  return out;
}

/**
 * Redact an artifact payload while preserving receipt self-attestation
 * digests: values under any `*"sha256": "<hex>"` key are staged out before
 * redaction and re-inserted after it (digests are not secrets).
 */
function redactArtifact(payload) {
  const PASS = '\u0000SHA_PASS\u0000';
  const keep = [];
  const staged = String(payload).replace(/("(?:\w*sha256)"\s*:\s*")([a-f0-9]{64})(")/gi, (_m, head, hex, tail) => {
    keep.push(hex);
    return `${head}${PASS}${keep.length - 1}${tail}`;
  });
  return redact(staged).replace(new RegExp(`${PASS}(\\d+)`, 'g'), (_m, idx) => keep[Number(idx)]);
}

function cap(text, limit = ERROR_BODY_CAP) {
  const s = String(text);
  return s.length <= limit ? s : `${s.slice(0, limit)}…[capped ${s.length} bytes]`;
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function writeReceipt(name, value) {
  const payload = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  const redacted = redactArtifact(payload);
  writeFileSync(join(RUN_DIR, name), redacted, 'utf8');
  return { file: name, sha256: sha256(redacted), bytes: Buffer.byteLength(redacted) };
}

// ---------------------------------------------------------------------------
// Shared request helpers
// ---------------------------------------------------------------------------
function chatBody(extra) {
  return {
    model: PROBE_MODEL,
    messages: [{ role: 'user', content: PROMPT }],
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    seed: SEED,
    ...extra,
  };
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
}

/** Transient transport class = network-level throw, 408/429, or 5xx. 4xx never. */
function transientHttpStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

function classifyThrowable(error) {
  const name = error?.name ?? '';
  const message = redact(cap(error?.message ?? String(error), 300));
  if (name === 'TimeoutError' || name === 'AbortError') {
    return { transient: true, class: 'timeout_or_abort', message };
  }
  return { transient: true, class: 'network_throw', message };
}

async function readBodyCapped(res) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  while (text.length <= ERROR_BODY_CAP) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  try {
    await reader.cancel();
  } catch {
    /* body already consumed or closed */
  }
  return text;
}

/** Pre-flight family assertion: response model must be same family as requested. */
function sameFamily(responseModel, requested) {
  return typeof responseModel === 'string' && (responseModel === requested || responseModel.startsWith(`${requested}-`));
}

// ---------------------------------------------------------------------------
// T0-T3 graded stitch comparison (never byte-equality)
// ---------------------------------------------------------------------------
function stitchCompare(textA, textB) {
  const nA = String(textA).replace(/\s+/g, ' ').trim();
  const nB = String(textB).replace(/\s+/g, ' ').trim();
  const T0 = nA === nB;
  const anchorLen = Math.min(50, nA.length);
  const prefixAnchor = nA.slice(0, anchorLen);
  const suffixAnchor = anchorLen > 0 ? nA.slice(-anchorLen) : '';
  const T1 = nB.startsWith(prefixAnchor) && nB.endsWith(suffixAnchor);
  const lengthRatio = nA.length > 0 ? Math.abs(nA.length - nB.length) / nA.length : nB.length === 0 ? 0 : Infinity;
  const T2 = lengthRatio <= 0.1;
  return {
    normalized: {
      lenA: nA.length,
      lenB: nB.length,
      lengthRatio: Number.isFinite(lengthRatio) ? Number(lengthRatio.toFixed(4)) : null,
    },
    prefixAnchor,
    suffixAnchor,
    T0: { pass: T0, definition: 'normalized equality (trim + whitespace collapse)' },
    T1: { pass: T1, anchorLen, definition: 'prefix+suffix anchor (50 chars)' },
    T2: { pass: T2, band: '|Δ|/len ≤ 10%', lengthRatio: Number.isFinite(lengthRatio) ? Number(lengthRatio.toFixed(4)) : null },
    T3FilledBy: 'per-chunk delta vs accumulated-snapshot qualifier (overlapViolations=0 ∧ resendViolations=0)',
  };
}

// ---------------------------------------------------------------------------
// Probe A — non-stream baseline
// ---------------------------------------------------------------------------
async function probeAOnce() {
  const startedAt = new Date().toISOString();
  const t0 = performance.now();
  let res;
  try {
    res = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(chatBody({})),
      signal: AbortSignal.timeout(TIMEOUT_A_MS),
    });
  } catch (error) {
    return { ok: false, transient: true, summary: { probe: 'A', startedAt, outcome: classifyThrowable(error) } };
  }
  const ttfbMs = Math.round(performance.now() - t0);
  if (!res.ok) {
    const body = await readBodyCapped(res);
    const transient = transientHttpStatus(res.status);
    return {
      ok: false,
      transient,
      summary: {
        probe: 'A',
        startedAt,
        outcome: { class: transient ? 'transient_http_status' : 'http_4xx_no_retry', status: res.status, transient },
        httpBodyRedacted: redact(cap(body)),
      },
    };
  }
  const raw = await res.text();
  const totalMs = Math.round(performance.now() - t0);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      transient: false,
      summary: { probe: 'A', startedAt, outcome: { class: 'non_json_body', status: res.status, transient: false } },
    };
  }
  const choice0 = Array.isArray(parsed?.choices) ? parsed.choices[0] : undefined;
  const content = typeof choice0?.message?.content === 'string' ? choice0.message.content : null;
  const model = typeof parsed?.model === 'string' ? parsed.model : null;
  return {
    ok: true,
    transient: false,
    summary: {
      probe: 'A',
      startedAt,
      outcome: { class: 'completed', status: res.status, transient: false },
      facts: {
        ttfbMs,
        totalMs,
        bytes: raw.length,
        model,
        familyCredited: sameFamily(model, PROBE_MODEL),
        shape: {
          choicesCount: Array.isArray(parsed?.choices) ? parsed.choices.length : null,
          contentFace: choice0?.message ? 'choices[0].message.content (single segment)' : null,
          finishReason: choice0?.finish_reason ?? null,
          usagePresent: parsed?.usage != null,
          idPresent: typeof parsed?.id === 'string',
          createdPresent: parsed?.created != null,
        },
        usage: parsed?.usage ?? null,
        content,
        contentSha256: content != null ? sha256(content) : null,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Probe B — SSE stream
// ---------------------------------------------------------------------------
/** Longest k such that acc.endsWith(delta.slice(0, k)) — overlap resend detector. */
function overlapResend(acc, delta) {
  const max = Math.min(acc.length, delta.length);
  for (let k = max; k > 0; k -= 1) {
    if (acc.endsWith(delta.slice(0, k))) return k;
  }
  return 0;
}

async function probeBOnce() {
  const startedAt = new Date().toISOString();
  const t0 = performance.now();
  let res;
  try {
    res = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(chatBody({ stream: true, stream_options: { include_usage: true } })),
      signal: AbortSignal.timeout(TIMEOUT_B_MS),
    });
  } catch (error) {
    return { ok: false, transient: true, summary: { probe: 'B', startedAt, outcome: classifyThrowable(error) } };
  }
  if (!res.ok) {
    const body = await readBodyCapped(res);
    const transient = transientHttpStatus(res.status);
    return {
      ok: false,
      transient,
      summary: {
        probe: 'B',
        startedAt,
        outcome: { class: transient ? 'transient_http_status' : 'http_4xx_no_retry', status: res.status, transient },
        httpBodyRedacted: redact(cap(body)),
      },
    };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let acc = '';
  let ttftMs = null;
  let lastTick = t0;
  let chunkCount = 0;
  let nonEmptyDeltas = 0;
  let overlapViolations = 0;
  let resendViolations = 0;
  let finishReason = null;
  let usage = null;
  let usageChunkEmptyChoices = false;
  let doneSeen = false;
  let errorFrame = null;
  let modelSeen = null;
  let familyCredited = true;
  let streamIoFault = null;
  let idleCutoff = false;
  let overallCutoff = false;
  const curve = [];
  const rawLines = [];

  const recordLine = (payload, kind, extra = {}) => {
    const now = performance.now();
    const tMs = Math.round(now - t0);
    const dtMs = Math.round(now - lastTick);
    lastTick = now;
    chunkCount += 1;
    curve.push({ i: chunkCount, tMs, dtMs, kind, ...extra });
    rawLines.push({ tMs, line: redact(payload) });
  };

  const handleData = (payload) => {
    const data = payload.slice(5).trim();
    if (data === '[DONE]') {
      doneSeen = true;
      recordLine(payload, 'done');
      return;
    }
    let obj;
    try {
      obj = JSON.parse(data);
    } catch {
      recordLine(payload, 'unparseable');
      return;
    }
    if (obj && typeof obj === 'object' && obj.error) {
      errorFrame = obj;
      recordLine(payload, 'error', { errorCode: obj.error?.code ?? null });
      return;
    }
    if (typeof obj?.model === 'string') {
      if (modelSeen === null) modelSeen = obj.model;
      if (!sameFamily(obj.model, PROBE_MODEL)) familyCredited = false;
    }
    const choice0 = Array.isArray(obj?.choices) ? obj.choices[0] : undefined;
    const deltaContent = typeof choice0?.delta?.content === 'string' ? choice0.delta.content : null;
    const finish = choice0?.finish_reason ?? null;
    const snapshot = acc;
    if (deltaContent !== null && deltaContent.length > 0) {
      // T3 qualifier — delta vs accumulated snapshot BEFORE appending:
      // a resend (full or overlapping) would square-grow under naive concat.
      const overlap = overlapResend(snapshot, deltaContent);
      const resendFull = snapshot.length > 0 && deltaContent.startsWith(snapshot);
      if (overlap > 0) overlapViolations += 1;
      if (resendFull) resendViolations += 1;
      acc = snapshot + deltaContent;
      if (ttftMs === null) ttftMs = Math.round(performance.now() - t0);
      nonEmptyDeltas += 1;
      recordLine(payload, 'delta', {
        deltaLen: deltaContent.length,
        accLenBefore: snapshot.length,
        accLenAfter: acc.length,
        overlap,
        resendFull,
      });
      return;
    }
    if (finish) finishReason = finish;
    if (obj?.usage != null) {
      usage = obj.usage;
      usageChunkEmptyChoices = Array.isArray(obj?.choices) && obj.choices.length === 0;
    }
    recordLine(payload, finish ? 'finish' : obj?.usage != null ? 'usage' : deltaContent !== null ? 'empty_delta' : 'other', {
      finish,
      emptyChoices: Array.isArray(obj?.choices) ? obj.choices.length === 0 : null,
      hasUsage: obj?.usage != null,
    });
  };

  const overallTimer = setTimeout(() => {
    overallCutoff = true;
    try {
      reader.cancel().catch(() => {});
    } catch {
      /* noop */
    }
  }, TIMEOUT_B_MS);

  try {
    while (true) {
      const idle = setTimeout(() => {
        idleCutoff = true;
        try {
          reader.cancel().catch(() => {});
        } catch {
          /* noop */
        }
      }, IDLE_B_MS);
      let chunk;
      try {
        chunk = await reader.read();
      } finally {
        clearTimeout(idle);
      }
      const { done, value } = chunk;
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) handleData(trimmed);
      }
      if (doneSeen) {
        try {
          await reader.cancel();
        } catch {
          /* noop */
        }
        break;
      }
    }
    if (!doneSeen && buffer.trim().startsWith('data:')) handleData(buffer.trim());
  } catch (error) {
    if (!idleCutoff && !overallCutoff) streamIoFault = classifyThrowable(error);
  } finally {
    clearTimeout(overallTimer);
  }

  const totalMs = Math.round(performance.now() - t0);
  const transportFault =
    streamIoFault ??
    (idleCutoff && !doneSeen
      ? { transient: true, class: 'idle_cutoff', message: `no bytes for ${IDLE_B_MS}ms` }
      : overallCutoff && !doneSeen
        ? { transient: true, class: 'overall_deadline', message: `stream exceeded ${TIMEOUT_B_MS}ms` }
        : null);

  if (transportFault) {
    return {
      ok: false,
      transient: true,
      summary: { probe: 'B', startedAt, outcome: transportFault, partial: { chunkCount, accLen: acc.length } },
    };
  }

  const grading = stitchCompare(probeAText, acc);
  grading.T3 = {
    pass: overlapViolations === 0 && resendViolations === 0,
    overlapViolations,
    resendViolations,
    definition: 'delta-vs-accumulated diagnostic: every non-empty delta is pure new content (no full/overlap resend)',
  };
  const bPass =
    probeACompleted &&
    chunkCount >= 3 &&
    nonEmptyDeltas >= 2 &&
    doneSeen &&
    familyCredited &&
    (grading.T0.pass || (grading.T1.pass && grading.T2.pass && grading.T3.pass));

  return {
    ok: true,
    transient: false,
    summary: {
      probe: 'B',
      startedAt,
      outcome: { class: 'completed', status: res.status, transient: false },
      facts: {
        ttftMs,
        totalMs,
        chunkCount,
        nonEmptyDeltas,
        doneSeen,
        finishReason,
        finishStopSeen: finishReason === 'stop',
        usageSeen: usage != null,
        usageChunkEmptyChoices,
        usage,
        model: modelSeen,
        familyCredited,
        errorFrameSeen: errorFrame != null,
        streamEndedByEofWithoutDone: !doneSeen && !idleCutoff && !overallCutoff,
        stitchedText: acc,
        stitchedSha256: sha256(acc),
        bPass,
        grading,
      },
      curve,
    },
    rawLines,
  };
}

// ---------------------------------------------------------------------------
// Probe C — error surface classification (NEVER retried, no margin)
// ---------------------------------------------------------------------------
async function probeCOnce() {
  const startedAt = new Date().toISOString();
  const t0 = performance.now();
  let res;
  try {
    res = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(chatBody({ model: PROBE_C_MODEL, stream: true, stream_options: { include_usage: true } })),
      signal: AbortSignal.timeout(TIMEOUT_C_MS),
    });
  } catch (error) {
    return {
      ok: true,
      summary: { probe: 'C', startedAt, errorSurface: 'network_throw', outcome: classifyThrowable(error) },
    };
  }
  if (!res.ok) {
    const body = await readBodyCapped(res);
    return {
      ok: true,
      summary: {
        probe: 'C',
        startedAt,
        errorSurface: 'http_status_first',
        totalMs: Math.round(performance.now() - t0),
        status: res.status,
        httpBodyRedacted: redact(cap(body)),
      },
    };
  }
  // HTTP 200 — the error, if any, must live inside the stream.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let sawDone = false;
  let sawFinish = false;
  let sawContent = false;
  let errorFrame = null;
  const rawLines = [];
  let idleCutoff = false;
  const idleTimer = setTimeout(() => {
    idleCutoff = true;
    try {
      reader.cancel().catch(() => {});
    } catch {
      /* noop */
    }
  }, IDLE_C_MS);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        rawLines.push({ tMs: Math.round(performance.now() - t0), line: redact(trimmed) });
        if (data === '[DONE]') {
          sawDone = true;
          continue;
        }
        try {
          const obj = JSON.parse(data);
          if (obj?.error) errorFrame = obj;
          const delta = Array.isArray(obj?.choices) ? obj.choices[0]?.delta?.content : undefined;
          if (typeof delta === 'string' && delta.length > 0) sawContent = true;
          if (Array.isArray(obj?.choices) && obj.choices[0]?.finish_reason) sawFinish = true;
        } catch {
          /* keep raw line only */
        }
      }
    }
  } catch (error) {
    rawLines.push({
      tMs: Math.round(performance.now() - t0),
      line: redact(cap(`read_error: ${error?.message ?? error}`, 300)),
    });
  } finally {
    clearTimeout(idleTimer);
  }
  let errorSurface;
  if (errorFrame) errorSurface = 'mid_stream_error_frame';
  else if (sawDone || sawFinish || sawContent) errorSurface = 'unexpected_success';
  else if (idleCutoff) errorSurface = 'silent_cutoff_idle';
  else errorSurface = 'silent_cutoff_eof';
  return {
    ok: true,
    summary: {
      probe: 'C',
      startedAt,
      errorSurface,
      totalMs: Math.round(performance.now() - t0),
      status: res.status,
      sawDone,
      sawFinish,
      sawContent,
      errorFrameRedacted: errorFrame ? redact(cap(JSON.stringify(errorFrame))) : null,
    },
    rawLines,
  };
}

// ---------------------------------------------------------------------------
// Driver — one attempt per probe; margin 2 only for A/B transport-transient
// ---------------------------------------------------------------------------
async function withMargin(label, once) {
  const attempts = [];
  let last = null;
  for (let n = 1; n <= 1 + RETRY_MARGIN; n += 1) {
    last = await once();
    attempts.push(last.summary);
    if (last.ok || !last.transient) break;
    process.stderr.write(
      `tokstream_probe:${label}: attempt ${n} transport-transient (${last.summary?.outcome?.class ?? 'unknown'}) — margin left: ${1 + RETRY_MARGIN - n}\n`,
    );
  }
  return { attempts, final: last };
}

function attemptLedger(run) {
  return run.attempts.map((summary, idx) => ({
    attempt: idx + 1,
    outcomeClass: summary?.outcome?.class ?? null,
    transient: summary?.outcome?.transient ?? null,
  }));
}

function estCostCny(usage) {
  const prompt = Number(usage?.prompt_tokens ?? 0);
  const completion = Number(usage?.completion_tokens ?? 0);
  return Number(((prompt * PRICE_INPUT_CNY_PER_1M + completion * PRICE_OUTPUT_CNY_PER_1M) / 1e6).toFixed(6));
}

function maxTokenUpperBoundCny() {
  return Number(((MAX_TOKENS * PRICE_OUTPUT_CNY_PER_1M) / 1e6).toFixed(6));
}

// --- run probes (A then B then C; order matters: B's grading needs A's text) ---
mkdirSync(RUN_DIR, { recursive: true });

const probeARun = await withMargin('A', probeAOnce);
const aSummary = probeARun.final?.summary ?? null;
probeAText = aSummary?.facts?.content ?? '';
probeACompleted = aSummary?.outcome?.class === 'completed';
const aReceipt = writeReceipt('probe-a.json', { probe: 'A', attempts: probeARun.attempts });

const probeBRun = await withMargin('B', probeBOnce);
const bSummary = probeBRun.final?.summary ?? null;
const bReceipt = writeReceipt('probe-b.json', { probe: 'B', attempts: probeBRun.attempts });
const bSseText = (probeBRun.final?.rawLines ?? []).map((row) => `t=${row.tMs}ms ${row.line}`).join('\n');
const bSseReceipt = writeReceipt('probe-b-sse-chunks.redacted.txt', `${bSseText}\n`);

const probeCRun = await probeCOnce();
const cSummary = probeCRun.summary ?? null;
const cReceipt = writeReceipt('probe-c.json', { probe: 'C', attempts: [cSummary], note: 'probe C is never retried (REQUEST pin)' });
const cSseText = (probeCRun.rawLines ?? []).map((row) => `t=${row.tMs}ms ${row.line}`).join('\n');
const cSseReceipt = cSseText ? writeReceipt('probe-c-sse-chunks.redacted.txt', `${cSseText}\n`) : null;

// --- stitch comparison artifact (A vs B) ---
const bFacts = bSummary?.facts ?? null;
const stitchReceipt = writeReceipt('stitch-compare.json', {
  promptSha256: sha256(PROMPT),
  pinnedParams: { model: PROBE_MODEL, maxTokens: MAX_TOKENS, temperature: TEMPERATURE, seed: SEED },
  a: { sha256: aSummary?.facts?.contentSha256 ?? null, len: probeAText.length, usage: aSummary?.facts?.usage ?? null },
  b: { sha256: bFacts?.stitchedSha256 ?? null, len: (bFacts?.stitchedText ?? '').length, usage: bFacts?.usage ?? null },
  grading: bFacts?.grading ?? null,
  bPass: bFacts?.bPass ?? false,
});

// --- three-way verdict (facts only; interpretation authority = coordinator) ---
const aCompleted = aSummary?.outcome?.class === 'completed';
const bCompleted = bSummary?.outcome?.class === 'completed';
const familyOk = Boolean(aSummary?.facts?.familyCredited && bFacts?.familyCredited);
let bVerdict;
if (!bCompleted) bVerdict = 'B_TRANSPORT_INCONCLUSIVE (margin exhausted; results not credited)';
else if (!familyOk) bVerdict = 'B_NOT_CREDITED (pre-flight model-family assertion failed; results not credited)';
else if (bFacts?.bPass === true) bVerdict = 'B_PASS (operational definition met: chunk≥3 ∧ nonEmptyDelta≥2 ∧ [DONE] ∧ (T0 ∨ (T1∧T2∧T3)))';
else if (!probeACompleted) bVerdict = 'B_NOT_CREDITED (probe A did not complete; stitch grading has no baseline)';
else bVerdict = 'B_SHAPE_ANOMALY (stream completed but operational definition NOT met — vendor capability face registered as-is)';

const cVerdict = `C_ERROR_SURFACE=${cSummary?.errorSurface ?? 'unknown'}`;

const threeWay = {
  bVerdict,
  cVerdict,
  interpretationInputs: {
    B_PASS: 'stage-2 streaming implementation design REQUEST can be established',
    B_SHAPE_ANOMALY: 'vendor capability face registered as-is; stage-2 evaluates segment pseudo-streaming downgrade',
    C: 'error surface feeds stage-2 sse-pump error-handling design',
  },
};

const scriptBytes = readFileSync(SELF_PATH);
const scriptSha256 = createHash('sha256').update(scriptBytes).digest('hex');

const costA = aSummary?.facts?.usage ? estCostCny(aSummary.facts.usage) : null;
const costB = bFacts?.usage ? estCostCny(bFacts.usage) : null;
const manifest = {
  knife: 'tokstream-s2-probe',
  requestBlueprint: 'REQUEST rev3 @a8f2f67e (ai-docs/delivery/harness/tokstream-s2-probe.md)',
  runId: RUN_ID,
  startedAt: RUN_STARTED_AT,
  finishedAt: new Date().toISOString(),
  scriptSha256,
  nodeVersion: process.version,
  guards: {
    endpointProfilePinned: REQUIRED_PROFILE,
    legacyUrlOverridesAbsent: true,
    preflightFamilyAssertion: 'response model must be same family as requested model before A/B credited',
    oneShot: 'run-id with existing receipts is refused',
  },
  pins: {
    endpoint: ENDPOINT_URL,
    model: PROBE_MODEL,
    probeCModel: PROBE_C_MODEL,
    maxTokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    seed: SEED,
    promptSha256: sha256(PROMPT),
    noIncrementalOutputParam: true,
    streamOptionsIncludeUsage: true,
  },
  keyHandling: 'MODEL_API_KEY injected via authorized loader into process env; value never logged/persisted; archives redacted; name-only accounting',
  attemptsLedger: { A: attemptLedger(probeARun), B: attemptLedger(probeBRun), C: [{ attempt: 1, note: 'never retried' }] },
  verdicts: { A: aSummary?.outcome?.class ?? 'unknown', bVerdict, cVerdict, threeWayNote: 'three-way interpretation authority = coordinator (Ban self-approve)' },
  estimatedCostCny: {
    probeA: costA,
    probeB: costB,
    probeC: cSummary?.errorSurface === 'http_status_first' ? 0 : null,
    probeCNote: cSummary?.errorSurface === 'http_status_first' ? 'rejected before generation (server-side), zero billed' : 'billing shape unknown; recorded as-is',
    perProbeUpperBoundWithoutUsage: maxTokenUpperBoundCny(),
    totalKnown: Number((((costA ?? 0) + (costB ?? 0))).toFixed(6)),
    formula: `(prompt_tokens×${PRICE_INPUT_CNY_PER_1M} + completion_tokens×${PRICE_OUTPUT_CNY_PER_1M}) / 1e6`,
    priceBookCitation: PRICE_BOOK_CITATION,
    actualSpendCny: null,
  },
  receipts: [aReceipt, bReceipt, bSseReceipt, cReceipt, ...(cSseReceipt ? [cSseReceipt] : []), stitchReceipt],
};

const manifestReceipt = writeReceipt('run-manifest.json', manifest);

process.stdout.write(
  [
    `tokstream_s2_probe: run=${RUN_ID}`,
    `A=${manifest.verdicts.A}`,
    `B=${bVerdict}`,
    `C=${cVerdict}`,
    `attempts: A=${probeARun.attempts.length}/3 B=${probeBRun.attempts.length}/3 C=1/1`,
    `familyCredited(A,B)=${Boolean(aSummary?.facts?.familyCredited)},${Boolean(bFacts?.familyCredited)}`,
    `estimatedCostCny=${manifest.estimatedCostCny.totalKnown} (upper bound per probe without usage=${maxTokenUpperBoundCny()}) · actualSpendCny=null`,
    `scriptSha256=${scriptSha256}`,
    `receipts=${RUN_DIR} (${[manifestReceipt, ...manifest.receipts].length} files)`,
    '',
  ].join('\n'),
);
