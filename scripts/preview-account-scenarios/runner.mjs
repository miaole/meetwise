#!/usr/bin/env node
/**
 * deep-usage-v1 for the two fixed public preview accounts.
 *
 * This runner is deliberately an API-only, non-root control.  It never imports
 * @meetwise/db, never reads migration/model/signing secrets, and never writes a
 * derived interview/question/event/report/score row directly.  The only
 * durable state is a small, secret-free resume ledger containing IDs and
 * question identities.  A trusted operator must grant the finite gift bucket
 * separately before this program can begin a paid interview.
 */
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIXED_PREVIEW_ACCOUNTS } from '../preview-synthetic-data/catalog.mjs';

export const SCENARIO_ID = 'deep-usage-v1';
export const CAPACITY_DATASET_ID = 'preview-large-v1-successor';
export const DEEP_USAGE_DATASET_ID = 'preview-deep-usage-v1';
export const LOOPBACK_DEFAULT = 'http://127.0.0.1:8787';
export const PREVIEW_ACCOUNTS = Object.freeze({
  candidate: FIXED_PREVIEW_ACCOUNTS.find((account) => account.role === 'candidate'),
  recruiter: FIXED_PREVIEW_ACCOUNTS.find((account) => account.role === 'recruiter'),
});
export const RECEIPT_LAYERS = Object.freeze({ capacity: 'capacity', deepUsage: 'deep-usage' });
export const CAPACITY_RECEIPT_SCHEMA_VERSION = 1;
export const DEEP_USAGE_RECEIPT_SCHEMA_VERSION = 1;
export const DEEP_USAGE_UNPROVEN = Object.freeze(['database_forbidden_counters', 'RLS_cross_owner_matrix', 'model_and_payment_side_effects']);
export const SESSION_TARGETS = Object.freeze([
  Object.freeze({ slot: 'natural-terminal', mode: 'continue', minAppliedTurns: 5 }),
  Object.freeze({ slot: 'abandon-after-3', mode: 'abandon', minAppliedTurns: 3 }),
  Object.freeze({ slot: 'abandon-after-5', mode: 'abandon', minAppliedTurns: 5 }),
]);
export const MAX_TURNS = 8;
const TERMINAL_EVENTS = new Set(['report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable', 'error']);
const QUESTION_ACTION_EVENTS = new Set(['question_ready', 'clarification_needed']);
const QUESTION_ID_RE = /^q-v(\d+)-t(\d+)-c(\d+)$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Do not accept `localhost`: a user-controlled hosts file/DNS layer could make
// it resolve away from the ECS loopback interface.  The runner is intended for
// the concrete API bind addresses only.
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1']);
const DIGEST_RE = /^[a-f0-9]{64}$/;
const RELEASE_IDENTITY_RE = /^[A-Za-z0-9._:@+/=-]{1,256}$/;

export function sha256(value) {
  return createHash('sha256').update(String(value), 'utf8').digest('hex');
}

/** Stable UUIDv4-shaped identity.  It is a client retry identity, not a DB ID. */
export function stableUuid(seed) {
  const bytes = Buffer.from(sha256(seed), 'hex');
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = bytes.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

export function assertNonRootUid(uid = typeof process.getuid === 'function' ? process.getuid() : undefined) {
  if (uid === 0) throw new Error('preview_scenario_must_not_run_as_root');
  if (!Number.isInteger(uid) || uid < 1) throw new Error('preview_scenario_requires_real_non_root_uid');
  return uid;
}

export function assertLoopbackBaseUrl(raw = LOOPBACK_DEFAULT) {
  const url = new URL(raw);
  if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.has(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('preview_scenario_api_must_be_loopback_http');
  }
  return url.toString().replace(/\/$/, '');
}

/** Read the two fixed passwords only at the execution boundary. */
export function resolvePreviewCredentials(env = process.env) {
  const candidatePassword = env[PREVIEW_ACCOUNTS.candidate.credentialEnv];
  const recruiterPassword = env[PREVIEW_ACCOUNTS.recruiter.credentialEnv];
  if (typeof candidatePassword !== 'string' || candidatePassword.length < 8 || candidatePassword.length > 128 || typeof recruiterPassword !== 'string' || recruiterPassword.length < 8 || recruiterPassword.length > 128) {
    throw new Error('preview_account_credentials_missing');
  }
  return Object.freeze({ candidatePassword, recruiterPassword });
}

/**
 * A deep receipt is a release-scoped attestation, not a forever-valid
 * progress cache.  The controller must pass the target manifest digest and a
 * stable release identity (for example commit/tree) on every run.  Keeping
 * this contract at the runner boundary prevents an old target's scenario
 * file from being silently reused after a successor deployment.
 */
export function assertReleaseBinding({ targetDigest, releaseIdentity } = {}) {
  if (!DIGEST_RE.test(targetDigest ?? '')) throw new Error('preview_target_digest_invalid');
  if (!RELEASE_IDENTITY_RE.test(releaseIdentity ?? '')) throw new Error('preview_release_identity_invalid');
  return Object.freeze({ targetDigest, releaseIdentity });
}

/**
 * Derive an immutable target/release-specific state filename from the
 * operator-provided base path.  The old base/target file is never replaced;
 * a successor gets a new ledger and must re-attest the current API state.
 */
export function targetScopedStatePath(statePath, binding) {
  const { targetDigest, releaseIdentity } = assertReleaseBinding(binding);
  const target = resolve(statePath);
  const releaseTag = sha256(releaseIdentity).slice(0, 16);
  return `${target}.target-${targetDigest}-${releaseTag}`;
}

function assertSafeStatePath(path, { allowMissingLeaf = true } = {}) {
  const target = resolve(path);
  let current = target;
  for (;;) {
    try {
      const stat = lstatSync(current);
      if (stat.isSymbolicLink()) throw new Error(`state_path_must_not_contain_symlink:${current}`);
      if (current !== target && !stat.isDirectory()) throw new Error(`state_parent_must_be_directory:${current}`);
      if (current === target && (!stat.isFile() || (stat.mode & 0o022) !== 0)) throw new Error(`unsafe_scenario_state_file:${target}`);
      return target;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      if (!allowMissingLeaf && current === target) throw error;
      const parent = dirname(current);
      if (parent === current) throw error;
      current = parent;
    }
  }
}

/**
 * Capacity and deep-usage receipts are separate evidence layers.  The
 * capacity layer is the successor of the historical large-v1 catalog.  Its
 * zero-side-effect counters are checked only on the capacity receipt itself;
 * a deep-usage receipt is allowed to carry its own legal progress/evidence and
 * is never parsed through the capacity forbidden-counter contract.
 */
export function validateReceiptComposition({ capacityReceipt, deepUsageReceipt } = {}) {
  if (!capacityReceipt || capacityReceipt.receiptLayer !== RECEIPT_LAYERS.capacity || capacityReceipt.datasetId !== CAPACITY_DATASET_ID || capacityReceipt.profile !== 'large-v1-successor') throw new Error('capacity_receipt_layer_invalid');
  if (capacityReceipt.schemaVersion !== undefined && capacityReceipt.schemaVersion !== CAPACITY_RECEIPT_SCHEMA_VERSION) throw new Error('capacity_receipt_schema_invalid');
  if (capacityReceipt.forbidden && Object.values(capacityReceipt.forbidden).some((value) => value !== 0)) throw new Error('capacity_receipt_forbidden_side_effect');
  if (!deepUsageReceipt || deepUsageReceipt.receiptLayer !== RECEIPT_LAYERS.deepUsage || deepUsageReceipt.schemaVersion !== DEEP_USAGE_RECEIPT_SCHEMA_VERSION || deepUsageReceipt.datasetId !== DEEP_USAGE_DATASET_ID || deepUsageReceipt.scenarioId !== SCENARIO_ID || deepUsageReceipt.phase !== 'verified_online_projection' || deepUsageReceipt.predecessorCapacityDatasetId !== CAPACITY_DATASET_ID || !DIGEST_RE.test(deepUsageReceipt.targetDigest ?? '') || !RELEASE_IDENTITY_RE.test(deepUsageReceipt.releaseIdentity ?? '')) throw new Error('deep_usage_receipt_layer_invalid');
  if (DIGEST_RE.test(capacityReceipt.targetDigest ?? '') && capacityReceipt.releaseIdentity !== undefined && (capacityReceipt.targetDigest !== deepUsageReceipt.targetDigest || capacityReceipt.releaseIdentity !== deepUsageReceipt.releaseIdentity)) throw new Error('receipt_release_binding_mismatch');
  if (capacityReceipt.datasetId === deepUsageReceipt.datasetId) throw new Error('receipt_layers_must_be_distinct');
  return { capacityDatasetId: capacityReceipt.datasetId, deepUsageDatasetId: deepUsageReceipt.datasetId, deepUsageScenarioId: deepUsageReceipt.scenarioId, capacityProfile: 'large-v1-successor' };
}

export function validateReceiptLayers(capacityReceipt, deepUsageReceipt) {
  return validateReceiptComposition({ capacityReceipt, deepUsageReceipt });
}

/**
 * Validate the complete deep-usage receipt persisted by the API-only runner.
 * This is intentionally independent from the capacity zero-side-effect
 * contract: deep usage records online progress and explicitly lists what the
 * runner did not prove.  The digest covers every receipt field except the
 * digest itself and the unproven disclosure list.
 */
export function validateDeepUsageReceipt(receipt) {
  if (!receipt || receipt.schemaVersion !== DEEP_USAGE_RECEIPT_SCHEMA_VERSION
    || receipt.receiptLayer !== RECEIPT_LAYERS.deepUsage
    || receipt.datasetId !== DEEP_USAGE_DATASET_ID
    || receipt.scenarioId !== SCENARIO_ID
    || receipt.predecessorCapacityDatasetId !== CAPACITY_DATASET_ID
    || receipt.phase !== 'verified_online_projection'
    || !DIGEST_RE.test(receipt.targetDigest ?? '')
    || !RELEASE_IDENTITY_RE.test(receipt.releaseIdentity ?? '')
    || !receipt.observations || receipt.sessionCount !== SESSION_TARGETS.length
    || JSON.stringify(receipt.unproven) !== JSON.stringify(DEEP_USAGE_UNPROVEN)
    || !/^[a-f0-9]{64}$/.test(receipt.receiptDigest ?? '')) {
    throw new Error('deep_usage_receipt_invalid');
  }
  const { receiptDigest, unproven, ...unsigned } = receipt;
  if (sha256(JSON.stringify(unsigned)) !== receiptDigest) throw new Error('deep_usage_receipt_digest_invalid');
  const attestationMode = receipt.attestationMode ?? 'initial_load';
  if (!['initial_load', 'api_read_only'].includes(attestationMode)) throw new Error('deep_usage_attestation_mode_invalid');
  if (attestationMode === 'api_read_only' && (!DIGEST_RE.test(receipt.predecessorTargetDigest ?? '') || !RELEASE_IDENTITY_RE.test(receipt.predecessorReleaseIdentity ?? ''))) throw new Error('deep_usage_predecessor_binding_invalid');
  return receipt;
}

function safeJson(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

/** Atomic 0600 state file; no token, password, question text, answer text or body is written. */
export function writeDurableState(path, value) {
  const target = assertSafeStatePath(path);
  const parent = dirname(target);
  mkdirSync(parent, { recursive: true, mode: 0o700 });
  assertSafeStatePath(target);
  try {
    const existing = lstatSync(target);
    if (existing.isSymbolicLink()) throw new Error(`state_file_must_not_be_symlink:${target}`);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const temp = `${target}.tmp-${process.pid}-${randomUUID()}`;
  // O_EXCL prevents a low-privilege sibling from replacing the temporary path
  // with a symlink before the atomic rename.
  writeFileSync(temp, safeJson(value), { mode: 0o600, flag: 'wx' });
  const fd = openSync(temp, 'r');
  try { fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(temp, target);
  const parentFd = openSync(parent, 'r');
  try { fsyncSync(parentFd); } finally { closeSync(parentFd); }
  return target;
}

export function readState(path) {
  try {
    const target = assertSafeStatePath(path, { allowMissingLeaf: true });
    const stat = lstatSync(target);
    if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o022) !== 0) throw new Error('unsafe_scenario_state_file');
    return JSON.parse(readFileSync(target, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function initialState(apiBaseUrl, binding) {
  return {
    schemaVersion: 1,
    scenarioId: SCENARIO_ID,
    apiBaseUrl,
    targetDigest: binding.targetDigest,
    releaseIdentity: binding.releaseIdentity,
    receiptLayer: RECEIPT_LAYERS.deepUsage,
    datasetId: DEEP_USAGE_DATASET_ID,
    predecessorCapacityDatasetId: CAPACITY_DATASET_ID,
    sessionCount: SESSION_TARGETS.length,
    phase: 'new',
    accounts: {},
    resumeId: null,
    sessions: SESSION_TARGETS.map((target) => ({
      slot: target.slot,
      mode: target.mode,
      minAppliedTurns: target.minAppliedTurns,
      applicationId: null,
      interviewId: null,
      phase: 'unassigned',
      cursor: '0',
      seenQuestionIds: [],
      lastQuestion: null,
      submissions: {},
      appliedQuestionIds: [],
      appliedTurns: 0,
      terminalEvent: null,
      abandon: null,
    })),
    observations: null,
    deepUsageReceipt: null,
    receiptDigest: null,
  };
}

function assertStateShape(state, apiBaseUrl, binding) {
  if (!state || state.schemaVersion !== 1 || state.scenarioId !== SCENARIO_ID || state.apiBaseUrl !== apiBaseUrl || state.targetDigest !== binding.targetDigest || state.releaseIdentity !== binding.releaseIdentity || state.receiptLayer !== RECEIPT_LAYERS.deepUsage || state.datasetId !== DEEP_USAGE_DATASET_ID || state.predecessorCapacityDatasetId !== CAPACITY_DATASET_ID || state.sessionCount !== SESSION_TARGETS.length || !Array.isArray(state.sessions) || state.sessions.length !== SESSION_TARGETS.length) {
    throw new Error('scenario_state_identity_mismatch');
  }
  if (state.deepUsageReceipt !== null) {
    validateDeepUsageReceipt(state.deepUsageReceipt);
    if (state.receiptDigest !== state.deepUsageReceipt.receiptDigest) throw new Error('scenario_state_receipt_digest_mismatch');
  } else if (state.receiptDigest !== null) {
    throw new Error('scenario_state_receipt_missing');
  }
  for (const session of state.sessions) {
    if (!SESSION_TARGETS.some((target) => target.slot === session.slot && target.mode === session.mode && target.minAppliedTurns === session.minAppliedTurns)) {
      throw new Error(`scenario_state_target_mismatch:${session.slot}`);
    }
  }
}

function assertSessionIdentityComplete(state) {
  if (!state || !state.accounts?.candidate?.userId || !state.accounts?.recruiter?.userId || typeof state.resumeId !== 'string' || state.resumeId.length === 0) throw new Error('scenario_predecessor_identity_incomplete');
  if (!Array.isArray(state.sessions) || state.sessions.length !== SESSION_TARGETS.length) throw new Error('scenario_predecessor_sessions_incomplete');
  for (const session of state.sessions) {
    if (typeof session.applicationId !== 'string' || session.applicationId.length === 0 || typeof session.interviewId !== 'string' || session.interviewId.length === 0 || !Number.isInteger(session.appliedTurns) || session.appliedTurns < session.minAppliedTurns || !['terminal', 'abandoned'].includes(session.phase)) {
      throw new Error(`scenario_predecessor_session_incomplete:${session?.slot ?? 'unknown'}`);
    }
  }
  return state;
}

function assertBusinessIdentityComplete(state) {
  assertSessionIdentityComplete(state);
  if (!state.observations || !Array.isArray(state.observations.sessions) || state.observations.sessions.length !== SESSION_TARGETS.length || !Number.isInteger(state.observations.recruiterTalentCount) || !Array.isArray(state.observations.recruiterStatuses)) throw new Error('scenario_predecessor_observations_incomplete');
  for (const observed of state.observations.sessions) {
    const session = state.sessions.find((row) => row.slot === observed?.slot);
    if (!session || observed.interviewId !== session.interviewId || !Number.isInteger(observed.answeredTurns) || observed.answeredTurns < session.appliedTurns) throw new Error(`scenario_predecessor_observation_mismatch:${observed?.slot ?? 'unknown'}`);
  }
  if (!state.deepUsageReceipt || state.receiptDigest !== state.deepUsageReceipt.receiptDigest || JSON.stringify(state.deepUsageReceipt.observations) !== JSON.stringify(state.observations)) throw new Error('scenario_predecessor_receipt_incomplete');
  validateDeepUsageReceipt(state.deepUsageReceipt);
  if (state.deepUsageReceipt.targetDigest !== state.targetDigest || state.deepUsageReceipt.releaseIdentity !== state.releaseIdentity || state.deepUsageReceipt.phase !== 'verified_online_projection') throw new Error('scenario_predecessor_receipt_binding_invalid');
  checkNoAnswerBodyInState(state);
  return state;
}

function predecessorBinding(state) {
  return assertReleaseBinding({ targetDigest: state?.targetDigest, releaseIdentity: state?.releaseIdentity });
}

/**
 * Discover only the fixed base file or direct target-scoped siblings. Every
 * candidate is a regular, non-group/world-writable file whose embedded
 * target/release binding reproduces its filename. Symlinks and malformed
 * matching entries fail closed instead of becoming predecessor inputs.
 */
export function discoverPredecessorState(statePath, currentBinding, apiBaseUrl) {
  const base = assertSafeStatePath(statePath, { allowMissingLeaf: true });
  const parent = dirname(base);
  let entries;
  try {
    const parentStat = lstatSync(parent);
    if (parentStat.isSymbolicLink() || !parentStat.isDirectory() || (parentStat.mode & 0o022) !== 0) throw new Error(`unsafe_scenario_state_directory:${parent}`);
    entries = readdirSync(parent, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
  const prefix = `${basename(base)}.target-`;
  const candidates = [];
  const paths = [base, ...entries.filter((entry) => entry.name.startsWith(prefix) && !entry.name.includes('.tmp-')).map((entry) => join(parent, entry.name))];
  for (const candidatePath of paths) {
    const stat = (() => { try { return lstatSync(candidatePath); } catch (error) { if (error?.code === 'ENOENT') return null; throw error; } })();
    if (!stat) continue;
    if (stat.isSymbolicLink()) throw new Error(`scenario_predecessor_symlink:${candidatePath}`);
    if (!stat.isFile() || (stat.mode & 0o022) !== 0) {
      if (candidatePath !== base) throw new Error(`unsafe_scenario_predecessor_file:${candidatePath}`);
      continue;
    }
    const state = readState(candidatePath);
    if (!state || state.apiBaseUrl !== apiBaseUrl) continue;
    assertStateShape(state, apiBaseUrl, predecessorBinding(state));
    assertBusinessIdentityComplete(state);
    if (state.phase !== 'verified_online_projection') continue;
    if (candidatePath !== base && targetScopedStatePath(base, predecessorBinding(state)) !== resolve(candidatePath)) throw new Error(`scenario_predecessor_filename_binding_invalid:${candidatePath}`);
    const verifiedAt = Date.parse(state.observations?.verifiedAt ?? '');
    candidates.push({ path: resolve(candidatePath), state, verifiedAt: Number.isFinite(verifiedAt) ? verifiedAt : stat.mtimeMs });
  }
  candidates.sort((a, b) => b.verifiedAt - a.verifiedAt || b.path.localeCompare(a.path));
  return candidates.find(({ state }) => state.targetDigest === currentBinding.targetDigest && state.releaseIdentity === currentBinding.releaseIdentity) ?? candidates[0] ?? null;
}

export function buildReattestationState(predecessor, apiBaseUrl, binding) {
  if (!predecessor?.state) throw new Error('scenario_predecessor_missing');
  const source = assertBusinessIdentityComplete(predecessor.state);
  const next = structuredClone(source);
  next.apiBaseUrl = apiBaseUrl;
  next.targetDigest = binding.targetDigest;
  next.releaseIdentity = binding.releaseIdentity;
  next.phase = 'reattesting';
  next.observations = null;
  next.deepUsageReceipt = null;
  next.receiptDigest = null;
  next.reattestationMode = 'api_read_only';
  next.predecessorTargetDigest = source.targetDigest;
  next.predecessorReleaseIdentity = source.releaseIdentity;
  return next;
}

export class PreviewApiClient {
  constructor(baseUrl = LOOPBACK_DEFAULT, fetchImpl = fetch) {
    this.baseUrl = assertLoopbackBaseUrl(baseUrl);
    this.fetchImpl = fetchImpl;
  }

  async request(path, { method = 'GET', token, body, headers = {}, expected = [200], timeoutMs = 20_000 } = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        signal: controller.signal,
        redirect: 'error',
        headers: {
          accept: 'application/json',
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await response.text();
      let payload = null;
      try { payload = text ? JSON.parse(text) : null; } catch { payload = { raw: text.slice(0, 120) }; }
      if (!expected.includes(response.status)) {
        throw Object.assign(new Error(`preview_http_${response.status}:${path}:${payload?.error ?? 'unexpected_response'}`), { status: response.status, payload });
      }
      return { status: response.status, payload };
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Replays the exact JSON body and headers; safe only for API routes whose contract is idempotent. */
  async requestRetry(path, options = {}, attempts = 3) {
    let lastError;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const result = await this.request(path, options);
        return result;
      } catch (error) {
        lastError = error;
        if (error?.status && error.status !== 429) throw error;
        if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, error?.status === 429 ? 1_050 : 120 * (attempt + 1)));
      }
    }
    throw lastError ?? new Error(`preview_request_failed:${path}`);
  }

  async sse(path, { token, lastEventId = '0', timeoutMs = 120_000, onEvent }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'error',
        headers: { accept: 'text/event-stream', 'last-event-id': String(lastEventId), authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error(`preview_sse_http_${response.status}:${path}`);
      if (!response.body?.getReader) throw new Error('preview_sse_body_missing');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const flush = async (frame) => {
        const lines = frame.split(/\r?\n/);
        let id = null; let event = 'message'; const data = [];
        for (const line of lines) {
          if (line.startsWith('id:')) id = line.slice(3).trim();
          else if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
        }
        if (!event || event === 'message' && data.length === 0) return null;
        let payload = null;
        try { payload = data.length ? JSON.parse(data.join('\n')) : null; } catch { throw new Error('preview_sse_invalid_json'); }
        const value = { id: id ?? String(lastEventId), kind: event, payload };
        await onEvent?.(value);
        return value;
      };
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) {
          buffer += decoder.decode();
          if (buffer.trim()) await flush(buffer);
          throw new Error('preview_sse_ended_without_action');
        }
        buffer += decoder.decode(chunk.value, { stream: true });
        let boundary;
        while ((boundary = buffer.search(/\r?\n\r?\n/)) >= 0) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, '');
          const value = await flush(frame);
          if (value && (QUESTION_ACTION_EVENTS.has(value.kind) || TERMINAL_EVENTS.has(value.kind))) return value;
        }
      }
    } finally {
      clearTimeout(timeout);
      controller.abort();
    }
  }
}

function jsonField(payload, field, label) {
  const value = payload?.[field];
  if (typeof value !== 'string' || value.length === 0) throw new Error(`preview_missing_${label}`);
  return value;
}

function validateQuestionIdentity(payload) {
  const questionId = jsonField(payload, 'questionId', 'question_id');
  const stateVersion = payload?.stateVersion;
  const turn = payload?.turn;
  const match = QUESTION_ID_RE.exec(questionId);
  if (!match || !Number.isInteger(stateVersion) || !Number.isInteger(turn) || Number(match[1]) !== stateVersion || Number(match[2]) !== turn || stateVersion < 1 || turn < 0) {
    throw new Error('preview_question_identity_invalid');
  }
  return { questionId, stateVersion, turn };
}

function answerFor(interviewId, question) {
  // The answer is generated on demand and is intentionally never put in state.
  return `合成预览回答：interview=${interviewId} turn=${question.turn}；说明目标、取舍、验证和复盘。`;
}

function currentAppliedTurns(session) {
  return Array.isArray(session.appliedQuestionIds) ? session.appliedQuestionIds.length : 0;
}

async function login(api, account, password, { allowProvision = true } = {}) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new Error(`invalid_password:${account.key}`);
  let result;
  try {
    result = await api.request('/auth/login', { method: 'POST', body: { email: account.email, password } });
  } catch (error) {
    // Provisioning is still an ordinary public API operation, not a database
    // shortcut.  A 409 race is resolved by logging in again; every other
    // error remains fail-closed.  Passwords never enter state/receipt.
    if (error?.status !== 401) throw error;
    if (!allowProvision) throw new Error(`preview_reattestation_login_required:${account.key}`);
    try {
      result = await api.request('/auth/signup', { method: 'POST', body: { email: account.email, password, role: account.role } });
    } catch (signupError) {
      if (signupError?.status !== 409) throw signupError;
      result = await api.request('/auth/login', { method: 'POST', body: { email: account.email, password } });
    }
  }
  if (result.payload?.role !== account.role || typeof result.payload?.userId !== 'string' || typeof result.payload?.token !== 'string') throw new Error(`account_identity_mismatch:${account.key}`);
  return { userId: result.payload.userId, token: result.payload.token };
}

function persist(statePath, state) {
  writeDurableState(statePath, state);
}

function setCursor(session, id) {
  const current = Number(session.cursor ?? 0);
  const next = Number(id);
  if (Number.isSafeInteger(next) && next >= current) session.cursor = String(next);
}

function handleEvent(session, event) {
  setCursor(session, event.id);
  const payload = event.payload ?? {};
  if (QUESTION_ACTION_EVENTS.has(event.kind)) {
    const identity = validateQuestionIdentity(payload);
    if (!session.seenQuestionIds.includes(identity.questionId)) session.seenQuestionIds.push(identity.questionId);
    session.lastQuestion = identity;
  } else if (event.kind === 'answer_evaluated' || event.kind === 'answer_unscored') {
    const questionId = jsonField(payload, 'questionId', 'answer_question_id');
    const submission = session.submissions[questionId];
    if (!submission) throw new Error(`preview_answer_event_without_submission:${questionId}`);
    if (event.kind === 'answer_evaluated') {
      if (payload.answerId !== submission.answerId || payload.answerHash !== submission.answerHash) throw new Error('preview_answer_identity_mismatch');
    }
    if (!session.appliedQuestionIds.includes(questionId)) session.appliedQuestionIds.push(questionId);
    session.appliedTurns = currentAppliedTurns(session);
  } else if (TERMINAL_EVENTS.has(event.kind)) {
    session.terminalEvent = { kind: event.kind, reason: typeof payload.reason === 'string' ? payload.reason : null };
    if (event.kind === 'report_ready' || event.kind === 'assessment_unavailable') session.phase = 'terminal';
    else session.phase = 'failed';
  }
  return session;
}

function checkNoAnswerBodyInState(state) {
  const serialized = JSON.stringify(state);
  if (serialized.includes('合成预览回答') || /"answer"\s*:/.test(serialized) || /"password"\s*:/.test(serialized) || /"token"\s*:/.test(serialized)) {
    throw new Error('scenario_state_contains_secret_or_answer_body');
  }
}

function chooseApplication(applications, jobIds, used) {
  return applications
    .filter((app) => app && app.status === 'invited' && app.interview_id == null && jobIds.has(app.job_id) && !used.has(app.id))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))[0] ?? null;
}

async function preflight(api, state, credentials, statePath, { allowProvision = true } = {}) {
  const candidate = await login(api, PREVIEW_ACCOUNTS.candidate, credentials.candidatePassword, { allowProvision });
  const recruiter = await login(api, PREVIEW_ACCOUNTS.recruiter, credentials.recruiterPassword, { allowProvision });
  if (state.accounts.candidate?.userId && state.accounts.candidate.userId !== candidate.userId) throw new Error('preview_candidate_identity_drift');
  if (state.accounts.recruiter?.userId && state.accounts.recruiter.userId !== recruiter.userId) throw new Error('preview_recruiter_identity_drift');
  state.accounts = { candidate: { userId: candidate.userId }, recruiter: { userId: recruiter.userId } };
  const resumes = (await api.request('/resume', { token: candidate.token })).payload?.resumes;
  const resume = Array.isArray(resumes) ? resumes.find((row) => row?.status === 'ingested' && typeof row.id === 'string') : null;
  if (!resume) throw new Error('preview_ingested_resume_required');
  if (state.resumeId && state.resumeId !== resume.id) throw new Error('preview_resume_binding_drift');
  state.resumeId = resume.id;
  const jobs = (await api.request('/recruiter/jobs', { token: recruiter.token })).payload?.jobs;
  if (!Array.isArray(jobs) || jobs.length < 3) throw new Error('preview_recruiter_jobs_insufficient');
  const jobIds = new Set(jobs.map((job) => job?.id).filter((id) => typeof id === 'string'));
  const applications = (await api.request('/applications', { token: candidate.token })).payload?.applications;
  if (!Array.isArray(applications)) throw new Error('preview_applications_response_invalid');
  const used = new Set(state.sessions.map((session) => session.applicationId).filter(Boolean));
  for (const session of state.sessions) {
    if (session.applicationId) continue;
    const app = chooseApplication(applications, jobIds, used);
    if (!app) {
      if (applications.some((item) => item?.status === 'in_progress' && item?.interview_id && !used.has(item.id))) throw new Error('preview_untracked_in_progress_application');
      throw new Error('preview_invited_application_insufficient');
    }
    session.applicationId = app.id;
    used.add(app.id);
    session.phase = 'assigned';
  }
  const entitlement = await api.request('/commerce/entitlement', { token: candidate.token });
  const availableUnits = Number(entitlement.payload?.availableUnits);
  if (!Number.isInteger(availableUnits) || availableUnits < 0) throw new Error('preview_entitlement_response_invalid');
  const needsStart = state.sessions.filter((session) => !session.interviewId && session.phase !== 'terminal' && session.phase !== 'abandoned').length;
  if (availableUnits < needsStart) {
    throw new Error(`preview_entitlement_grant_required:need=${needsStart}:available=${availableUnits}`);
  }
  state.phase = 'preflight_ready';
  state.observations = { initialAvailableUnits: availableUnits, jobCount: jobs.length, applicationCount: applications.length };
  persist(statePath, state);
  checkNoAnswerBodyInState(state);
  return { candidate, recruiter, jobs, applications, availableUnits };
}

async function runSession(api, state, session, candidate, statePath) {
  if (!session.interviewId) {
    const started = await api.requestRetry(`/applications/${encodeURIComponent(session.applicationId)}/start`, {
      method: 'POST', token: candidate.token, body: { resumeId: state.resumeId }, expected: [200],
    });
    if (!['started', 'reused'].includes(started.payload?.status) || typeof started.payload?.interviewId !== 'string') throw new Error(`preview_application_start_failed:${session.slot}`);
    session.interviewId = started.payload.interviewId;
    session.phase = 'started';
    persist(statePath, state);
  }
  if (session.phase === 'assigned') session.phase = 'started';
  if (session.phase === 'started') {
    await api.requestRetry(`/interview/${encodeURIComponent(session.interviewId)}/begin`, {
      method: 'POST', token: candidate.token, headers: { 'resume-id': state.resumeId }, expected: [202],
    });
    session.phase = 'running';
    persist(statePath, state);
  }
  if (session.phase === 'abandoned' || session.phase === 'terminal' || session.phase === 'failed' || session.phase === 'limited') return;
  while (session.phase === 'running') {
    if (session.appliedTurns >= MAX_TURNS) {
      session.phase = 'limited';
      persist(statePath, state);
      return;
    }
    let action;
    try {
      action = await api.sse(`/interview/${encodeURIComponent(session.interviewId)}/events`, {
        token: candidate.token,
        lastEventId: session.cursor,
        onEvent: async (event) => { handleEvent(session, event); persist(statePath, state); },
      });
    } catch (error) {
      // Cursor and identities have already been persisted by onEvent.  The
      // operator can rerun and reconnect; do not invent a terminal state.
      if (String(error?.message).startsWith('preview_sse_ended_without_action')) throw new Error(`preview_sse_recoverable:${session.slot}`);
      throw error;
    }
    if (TERMINAL_EVENTS.has(action.kind)) {
      persist(statePath, state);
      return;
    }
    if (!QUESTION_ACTION_EVENTS.has(action.kind)) throw new Error('preview_sse_action_invalid');
    const question = validateQuestionIdentity(action.payload);
    const existing = session.submissions[question.questionId];
    if (existing) {
      session.lastQuestion = question;
      persist(statePath, state);
      continue;
    }
    if (session.mode === 'abandon' && session.appliedTurns >= session.minAppliedTurns) {
      const abandoned = await api.requestRetry(`/interview/${encodeURIComponent(session.interviewId)}/abandon`, { method: 'POST', token: candidate.token, expected: [200] });
      if (!abandoned.payload?.abandoned) throw new Error(`preview_abandon_failed:${session.slot}`);
      session.abandon = { released: abandoned.payload.released ?? null };
      session.phase = 'abandoned';
      persist(statePath, state);
      return;
    }
    const answer = answerFor(session.interviewId, question);
    const answerId = stableUuid(`${SCENARIO_ID}:${session.interviewId}:${question.questionId}`);
    const answerHash = sha256(answer);
    if (!UUID_RE.test(answerId)) throw new Error('preview_answer_id_invalid');
    session.lastQuestion = question;
    session.submissions[question.questionId] = {
      questionId: question.questionId,
      stateVersion: question.stateVersion,
      turn: question.turn,
      answerId,
      answerHash,
      status: 'planned',
      jobId: null,
    };
    persist(statePath, state);
    const result = await api.requestRetry(`/interview/${encodeURIComponent(session.interviewId)}/turn`, {
      method: 'POST', token: candidate.token, expected: [202],
      body: { questionId: question.questionId, stateVersion: question.stateVersion, answerId, answerHash, turn: question.turn, answer },
    });
    if (!result.payload?.accepted || typeof result.payload?.jobId !== 'string') throw new Error(`preview_turn_not_accepted:${session.slot}`);
    session.submissions[question.questionId] = { ...session.submissions[question.questionId], status: result.payload.replayed ? 'replayed' : 'accepted', jobId: result.payload.jobId };
    persist(statePath, state);
    checkNoAnswerBodyInState(state);
  }
}

async function verifyOnline(api, state, candidate, recruiter, statePath, binding) {
  const list = (await api.request('/interview?limit=200', { token: candidate.token })).payload?.interviews;
  if (!Array.isArray(list)) throw new Error('preview_interview_list_invalid');
  const byId = new Map(list.map((item) => [item?.id, item]));
  const observed = [];
  for (const session of state.sessions) {
    if (!session.interviewId) throw new Error(`preview_session_missing_interview:${session.slot}`);
    const row = byId.get(session.interviewId);
    if (!row) throw new Error(`preview_interview_projection_missing:${session.slot}`);
    const issued = Number(row.issued_turns); const answered = Number(row.answered_turns);
    if (!Number.isInteger(issued) || !Number.isInteger(answered) || issued < answered || answered < session.appliedTurns) throw new Error(`preview_progress_projection_mismatch:${session.slot}`);
    if (session.appliedTurns < 3) throw new Error(`preview_deep_usage_min_turns_not_met:${session.slot}`);
    if (session.slot === 'natural-terminal' && session.appliedTurns < 5 && !session.terminalEvent) throw new Error('preview_natural_session_neither_five_turns_nor_terminal');
    if (typeof session.applicationId !== 'string' || session.applicationId.length === 0) throw new Error(`preview_session_missing_application:${session.slot}`);
    observed.push({ slot: session.slot, applicationId: session.applicationId, interviewId: session.interviewId, status: row.status, issuedTurns: issued, answeredTurns: answered, phase: session.phase });
  }
  const talent = (await api.request('/recruiter/talent', { token: recruiter.token })).payload?.talents;
  if (!Array.isArray(talent)) throw new Error('preview_talent_projection_invalid');
  if (talent.some((row) => row?.score !== null)) throw new Error('preview_numeric_score_must_be_null');
  const statuses = new Set(talent.map((row) => row?.status));
  if (!statuses.has('in_progress') && !statuses.has('assessment_unavailable')) throw new Error('preview_b_projection_has_no_deep_state');
  const oldZeroHistory = list.filter((row) => Number(row?.issued_turns) === 0 && Number(row?.answered_turns) === 0).length;
  state.observations = { ...state.observations, sessions: observed, recruiterTalentCount: talent.length, recruiterStatuses: [...statuses].sort(), oldZeroHistory, verifiedAt: new Date().toISOString() };
  const attestationMode = state.reattestationMode === 'api_read_only' ? 'api_read_only' : 'initial_load';
  const unsigned = { schemaVersion: 1, receiptLayer: RECEIPT_LAYERS.deepUsage, datasetId: DEEP_USAGE_DATASET_ID, scenarioId: SCENARIO_ID, predecessorCapacityDatasetId: CAPACITY_DATASET_ID, targetDigest: binding.targetDigest, releaseIdentity: binding.releaseIdentity, attestationMode, ...(attestationMode === 'api_read_only' ? { predecessorTargetDigest: state.predecessorTargetDigest, predecessorReleaseIdentity: state.predecessorReleaseIdentity } : {}), phase: 'verified_online_projection', observations: state.observations, sessionCount: state.sessions.length };
  state.receiptDigest = sha256(JSON.stringify(unsigned));
  state.phase = state.sessions.some((session) => session.phase === 'limited') ? 'ready_limited' : 'verified_online_projection';
  state.receiptLayer = unsigned.receiptLayer;
  state.datasetId = unsigned.datasetId;
  state.predecessorCapacityDatasetId = unsigned.predecessorCapacityDatasetId;
  state.targetDigest = unsigned.targetDigest;
  state.releaseIdentity = unsigned.releaseIdentity;
  state.sessionCount = unsigned.sessionCount;
  state.deepUsageReceipt = { ...unsigned, receiptDigest: state.receiptDigest, unproven: [...DEEP_USAGE_UNPROVEN] };
  persist(statePath, state);
  checkNoAnswerBodyInState(state);
  return state.deepUsageReceipt;
}

export async function runScenario({ apiBaseUrl = LOOPBACK_DEFAULT, statePath = '.tmp/preview-account-scenarios/deep-usage-v1.json', targetDigest, releaseIdentity, candidatePassword, recruiterPassword, fetchImpl = fetch, uid } = {}) {
  assertNonRootUid(uid);
  const baseUrl = assertLoopbackBaseUrl(apiBaseUrl);
  const binding = assertReleaseBinding({ targetDigest, releaseIdentity });
  const scopedStatePath = targetScopedStatePath(statePath, binding);
  const api = new PreviewApiClient(baseUrl, fetchImpl);
  let state = readState(scopedStatePath);
  let reattestation = false;
  if (!state) {
    const predecessor = discoverPredecessorState(statePath, binding, baseUrl);
    if (predecessor) {
      if (predecessor.state.targetDigest === binding.targetDigest && predecessor.state.releaseIdentity === binding.releaseIdentity) {
        state = structuredClone(predecessor.state);
        persist(scopedStatePath, state);
      } else {
        state = buildReattestationState(predecessor, baseUrl, binding);
        persist(scopedStatePath, state);
        reattestation = true;
      }
    } else {
      state = initialState(baseUrl, binding);
    }
  } else if (state.reattestationMode === 'api_read_only') {
    // A partially completed successor must remain read-only on retry; never
    // fall back to the initial three-interview mutation path.
    assertSessionIdentityComplete(state);
    reattestation = true;
  }
  assertStateShape(state, baseUrl, binding);
  const credentials = { candidatePassword, recruiterPassword };
  const context = await preflight(api, state, credentials, scopedStatePath, { allowProvision: !reattestation });
  if (reattestation) {
    // preflight is projection-only here; discard its progress snapshot before
    // the target-bound verification receipt is rebuilt from current API data.
    state.phase = 'reattesting';
    state.observations = null;
    persist(scopedStatePath, state);
    return verifyOnline(api, state, context.candidate, context.recruiter, scopedStatePath, binding);
  }
  state.phase = 'running';
  persist(scopedStatePath, state);
  for (const session of state.sessions) {
    await runSession(api, state, session, context.candidate, scopedStatePath);
    checkNoAnswerBodyInState(state);
  }
  return verifyOnline(api, state, context.candidate, context.recruiter, scopedStatePath, binding);
}

export async function verifyScenario({ apiBaseUrl = LOOPBACK_DEFAULT, statePath = '.tmp/preview-account-scenarios/deep-usage-v1.json', targetDigest, releaseIdentity, candidatePassword, recruiterPassword, fetchImpl = fetch, uid } = {}) {
  assertNonRootUid(uid);
  const baseUrl = assertLoopbackBaseUrl(apiBaseUrl);
  const binding = assertReleaseBinding({ targetDigest, releaseIdentity });
  const scopedStatePath = targetScopedStatePath(statePath, binding);
  const api = new PreviewApiClient(baseUrl, fetchImpl);
  const state = readState(scopedStatePath);
  assertStateShape(state, baseUrl, binding);
  const candidate = await login(api, PREVIEW_ACCOUNTS.candidate, candidatePassword, { allowProvision: false });
  const recruiter = await login(api, PREVIEW_ACCOUNTS.recruiter, recruiterPassword, { allowProvision: false });
  return verifyOnline(api, state, candidate, recruiter, scopedStatePath, binding);
}

function parseArgs(argv) {
  const args = { command: argv[2] ?? 'run', apiBaseUrl: process.env.PREVIEW_API_BASE_URL ?? LOOPBACK_DEFAULT, statePath: process.env.PREVIEW_SCENARIO_STATE ?? '.tmp/preview-account-scenarios/deep-usage-v1.json', targetDigest: process.env.PREVIEW_TARGET_DIGEST, releaseIdentity: process.env.PREVIEW_RELEASE_IDENTITY };
  for (let i = 3; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--api' && argv[i + 1]) { args.apiBaseUrl = argv[++i]; continue; }
    if (value === '--state' && argv[i + 1]) { args.statePath = argv[++i]; continue; }
    if (value === '--target-digest' && argv[i + 1]) { args.targetDigest = argv[++i]; continue; }
    if (value === '--release-identity' && argv[i + 1]) { args.releaseIdentity = argv[++i]; continue; }
    throw new Error(`invalid_argument:${value}`);
  }
  return args;
}

const isDirectExecution = process.argv[1]
  ? realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectExecution) {
  try {
    const args = parseArgs(process.argv);
    const fn = args.command === 'verify' ? verifyScenario : runScenario;
    const credentials = resolvePreviewCredentials(process.env);
    const receipt = await fn({ apiBaseUrl: args.apiBaseUrl, statePath: args.statePath, targetDigest: args.targetDigest, releaseIdentity: args.releaseIdentity, ...credentials });
    const binding = assertReleaseBinding({ targetDigest: args.targetDigest, releaseIdentity: args.releaseIdentity });
    process.stdout.write(`${JSON.stringify({ scenarioId: SCENARIO_ID, phase: receipt.phase, receiptDigest: receipt.receiptDigest, attestationMode: receipt.attestationMode ?? 'initial_load', predecessorTargetDigest: receipt.predecessorTargetDigest ?? null, predecessorReleaseIdentity: receipt.predecessorReleaseIdentity ?? null, targetStatePath: targetScopedStatePath(args.statePath, binding), observations: receipt.observations, unproven: receipt.unproven }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`preview scenario stopped: ${error?.message ?? 'unknown_error'}\n`);
    process.exitCode = 1;
  }
}
