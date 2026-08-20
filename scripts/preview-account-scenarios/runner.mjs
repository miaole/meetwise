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
import { closeSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCENARIO_ID = 'deep-usage-v1';
export const LOOPBACK_DEFAULT = 'http://127.0.0.1:8787';
export const PREVIEW_ACCOUNTS = Object.freeze({
  candidate: Object.freeze({ key: 'preview-candidate', email: 'previewc@meetwise.com', role: 'candidate' }),
  recruiter: Object.freeze({ key: 'preview-recruiter', email: 'previewb@meetwise.com', role: 'recruiter' }),
});
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

function safeJson(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

/** Atomic 0600 state file; no token, password, question text, answer text or body is written. */
export function writeDurableState(path, value) {
  const target = resolve(path);
  const parent = dirname(target);
  mkdirSync(parent, { recursive: true, mode: 0o700 });
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
    const target = resolve(path);
    const stat = lstatSync(target);
    if (stat.isSymbolicLink() || !stat.isFile() || (stat.mode & 0o022) !== 0) throw new Error('unsafe_scenario_state_file');
    return JSON.parse(readFileSync(target, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function initialState(apiBaseUrl) {
  return {
    schemaVersion: 1,
    scenarioId: SCENARIO_ID,
    apiBaseUrl,
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
    receiptDigest: null,
  };
}

function assertStateShape(state, apiBaseUrl) {
  if (!state || state.schemaVersion !== 1 || state.scenarioId !== SCENARIO_ID || state.apiBaseUrl !== apiBaseUrl || !Array.isArray(state.sessions) || state.sessions.length !== SESSION_TARGETS.length) {
    throw new Error('scenario_state_identity_mismatch');
  }
  for (const session of state.sessions) {
    if (!SESSION_TARGETS.some((target) => target.slot === session.slot && target.mode === session.mode && target.minAppliedTurns === session.minAppliedTurns)) {
      throw new Error(`scenario_state_target_mismatch:${session.slot}`);
    }
  }
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

async function login(api, account, password) {
  // The fixed showcase accounts are intentionally the operator-specified
  // `123456` credentials.  Do not run signup/password validation here: this
  // control only logs in to already-provisioned accounts.
  if (typeof password !== 'string' || password.length === 0) throw new Error(`missing_password:${account.key}`);
  const result = await api.request('/auth/login', { method: 'POST', body: { email: account.email, password } });
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

async function preflight(api, state, credentials, statePath) {
  const candidate = await login(api, PREVIEW_ACCOUNTS.candidate, credentials.candidatePassword);
  const recruiter = await login(api, PREVIEW_ACCOUNTS.recruiter, credentials.recruiterPassword);
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

async function verifyOnline(api, state, candidate, recruiter, statePath) {
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
    observed.push({ slot: session.slot, interviewId: session.interviewId, status: row.status, issuedTurns: issued, answeredTurns: answered, phase: session.phase });
  }
  const talent = (await api.request('/recruiter/talent', { token: recruiter.token })).payload?.talents;
  if (!Array.isArray(talent)) throw new Error('preview_talent_projection_invalid');
  if (talent.some((row) => row?.score !== null)) throw new Error('preview_numeric_score_must_be_null');
  const statuses = new Set(talent.map((row) => row?.status));
  if (!statuses.has('in_progress') && !statuses.has('assessment_unavailable')) throw new Error('preview_b_projection_has_no_deep_state');
  const oldZeroHistory = list.filter((row) => Number(row?.issued_turns) === 0 && Number(row?.answered_turns) === 0).length;
  state.observations = { ...state.observations, sessions: observed, recruiterTalentCount: talent.length, recruiterStatuses: [...statuses].sort(), oldZeroHistory, verifiedAt: new Date().toISOString() };
  const unsigned = { schemaVersion: 1, scenarioId: SCENARIO_ID, phase: 'verified_online_projection', observations: state.observations, sessionCount: state.sessions.length };
  state.receiptDigest = sha256(JSON.stringify(unsigned));
  state.phase = state.sessions.some((session) => session.phase === 'limited') ? 'ready_limited' : 'verified_online_projection';
  persist(statePath, state);
  checkNoAnswerBodyInState(state);
  return { ...unsigned, phase: state.phase, receiptDigest: state.receiptDigest, unproven: ['database_forbidden_counters', 'RLS_cross_owner_matrix', 'model_and_payment_side_effects'] };
}

export async function runScenario({ apiBaseUrl = LOOPBACK_DEFAULT, statePath = '.tmp/preview-account-scenarios/deep-usage-v1.json', candidatePassword, recruiterPassword, fetchImpl = fetch, uid } = {}) {
  assertNonRootUid(uid);
  const baseUrl = assertLoopbackBaseUrl(apiBaseUrl);
  const api = new PreviewApiClient(baseUrl, fetchImpl);
  let state = readState(statePath) ?? initialState(baseUrl);
  assertStateShape(state, baseUrl);
  const credentials = { candidatePassword, recruiterPassword };
  const context = await preflight(api, state, credentials, statePath);
  state.phase = 'running';
  persist(statePath, state);
  for (const session of state.sessions) {
    await runSession(api, state, session, context.candidate, statePath);
    checkNoAnswerBodyInState(state);
  }
  return verifyOnline(api, state, context.candidate, context.recruiter, statePath);
}

export async function verifyScenario({ apiBaseUrl = LOOPBACK_DEFAULT, statePath = '.tmp/preview-account-scenarios/deep-usage-v1.json', candidatePassword, recruiterPassword, fetchImpl = fetch, uid } = {}) {
  assertNonRootUid(uid);
  const baseUrl = assertLoopbackBaseUrl(apiBaseUrl);
  const api = new PreviewApiClient(baseUrl, fetchImpl);
  const state = readState(statePath);
  assertStateShape(state, baseUrl);
  const candidate = await login(api, PREVIEW_ACCOUNTS.candidate, candidatePassword);
  const recruiter = await login(api, PREVIEW_ACCOUNTS.recruiter, recruiterPassword);
  return verifyOnline(api, state, candidate, recruiter, statePath);
}

function parseArgs(argv) {
  const args = { command: argv[2] ?? 'run', apiBaseUrl: process.env.PREVIEW_API_BASE_URL ?? LOOPBACK_DEFAULT, statePath: process.env.PREVIEW_SCENARIO_STATE ?? '.tmp/preview-account-scenarios/deep-usage-v1.json' };
  for (let i = 3; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--api' && argv[i + 1]) { args.apiBaseUrl = argv[++i]; continue; }
    if (value === '--state' && argv[i + 1]) { args.statePath = argv[++i]; continue; }
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
    const receipt = await fn({ apiBaseUrl: args.apiBaseUrl, statePath: args.statePath, candidatePassword: process.env.PREVIEW_C_PASSWORD, recruiterPassword: process.env.PREVIEW_B_PASSWORD });
    process.stdout.write(`${JSON.stringify({ scenarioId: SCENARIO_ID, phase: receipt.phase, receiptDigest: receipt.receiptDigest, observations: receipt.observations, unproven: receipt.unproven }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`preview scenario stopped: ${error?.message ?? 'unknown_error'}\n`);
    process.exitCode = 1;
  }
}
