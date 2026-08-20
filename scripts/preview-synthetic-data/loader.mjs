#!/usr/bin/env node
import { createHmac } from 'node:crypto';
import { chmodSync, closeSync, fstatSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FIXED_PREVIEW_ACCOUNTS, buildLongResume, buildPlan, sha256 } from './catalog.mjs';
import { buildVerifierProcessEnv, EXPECTED_DATABASE, EXPECTED_ROLE, forbiddenGenericDatabaseEnv } from './verifier-env.mjs';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
const STATE_ROOT = '/var/lib/meetwise-preview-synthetic';
const SEED_FILE = '/etc/meetwise/preview-synthetic.seed';
const TARGET_FILE = '/etc/meetwise/preview-synthetic-target.json';
const API_BASE_URL = 'http://127.0.0.1:8787';
// 降权执行（P0-1 修复）：tarball 合成脚本改由 meetwise-synthetic（uid/gid 2001，provision 固定）
// 运行，不再强制 root。root 与 meetwise-synthetic 同为可信执行者；其余 uid 一律拒绝，
// 防被任意低权限进程（如 web 容器逃逸）冒充。uid/gid 必须成对匹配，杜绝跨用户伪造。
const SYNTHETIC_UID = 2001;
const SYNTHETIC_GID = 2001;
const trustedUid = (uid, gid) => (uid === 0 && gid === 0) || (uid === SYNTHETIC_UID && gid === SYNTHETIC_GID);
// 文件/目录所有权（assertRootFile/Directory 用）：root 拥有（组 root 或 meetwise-synthetic），
// 或 meetwise-synthetic 拥有。降权后 seed/target/env 是 root:meetwise-synthetic 0640（root 写、
// synthetic 只读），/etc/meetwise 是 root:meetwise-synthetic 0710（synthetic 需 traverse 读内部
// 文件，但无组读权限故不能列目录/窥探签名私钥），STATE_ROOT 是 meetwise-synthetic 0700。
const trustedOwner = (uid, gid) => (uid === 0 && (gid === 0 || gid === SYNTHETIC_GID)) || (uid === SYNTHETIC_UID && gid === SYNTHETIC_GID);
const REQUIRED_FORBIDDEN_KEYS = Object.freeze(['answerEvents', 'consumptions', 'invalidApplicationStates', 'invalidInterviewStates', 'invalidJobStates', 'invalidResumeStates', 'modelInvocations', 'nonCatalogAccounts', 'numericScores', 'paymentOrders', 'queuedOrRunningJobs', 'rawAnswerJobs']);

export const FACTORY_FILES = Object.freeze([
  'catalog.mjs',
  'db-verify.mjs',
  'loader.mjs',
  'target-inspect.mjs',
  'verifier-env.mjs',
  '../preview-account-scenarios/runner.mjs',
]);

export function factoryDigest() {
  const root = dirname(fileURLToPath(import.meta.url));
  return sha256(FACTORY_FILES.map((name) => [name, sha256(readFileSync(join(root, name)))]));
}

export function derivePassword(seed, email) {
  return `Mw9!${createHmac('sha256', seed).update(`preview-synthetic-password:v1:${email}`).digest('base64url').slice(0, 24)}`;
}

/** Resolve controller-provisioned B/C passwords at the process boundary only. */
export function resolveFixedPreviewCredentials(env = process.env) {
  const values = {};
  for (const account of FIXED_PREVIEW_ACCOUNTS) {
    const password = env[account.credentialEnv];
    // Keep the shared auth contract intact.  In particular, the historical
    // six-character demo password must not be accepted as a special preview
    // bypass; a missing/short value fails before any API mutation.
    if (typeof password !== 'string' || password.length === 0) throw new Error(`fixed_preview_password_missing:${account.key}`);
    if (password.length < 8 || password.length > 128) throw new Error(`fixed_preview_password_invalid:${account.key}`);
    values[account.key] = password;
  }
  return Object.freeze(values);
}

function passwordForAccount(account, seed, fixedPreviewCredentials) {
  if (account.fixedPreviewAccount) {
    const password = fixedPreviewCredentials?.[account.key];
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new Error(`fixed_preview_password_invalid:${account.key}`);
    return password;
  }
  return derivePassword(seed, account.email);
}

export function assertLoopbackBaseUrl(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.has(url.hostname) || url.username || url.password || url.search || url.hash) throw new Error('base_url_must_be_loopback_http');
  return url.toString().replace(/\/$/, '');
}

export class ApiClient {
  constructor(baseUrl, fetchImpl = fetch) { this.baseUrl = assertLoopbackBaseUrl(baseUrl); this.fetchImpl = fetchImpl; }
  async request(path, { method = 'GET', token, body, headers = {}, expected = [200] } = {}) {
    for (let attempt = 0; attempt < 240; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000);
      try {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
          method,
          signal: controller.signal,
          redirect: 'error',
          headers: { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        const text = await response.text();
        let payload = null;
        try { payload = text ? JSON.parse(text) : null; } catch { payload = { raw: text.slice(0, 200) }; }
        if (response.status === 429 && attempt < 239) { await new Promise((resolve) => setTimeout(resolve, 1_050)); continue; }
        if (!expected.includes(response.status)) throw Object.assign(new Error(`http_${response.status}:${path}:${payload?.error ?? 'unexpected_response'}`), { status: response.status, payload });
        return { status: response.status, payload };
      } finally { clearTimeout(timeout); }
    }
    throw new Error(`rate_limit_retry_exhausted:${path}`);
  }
}

function durableWriteJson(path, value, mode = 0o600) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.tmp-${process.pid}`;
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode });
  const fd = openSync(temp, 'r'); fsyncSync(fd); closeSync(fd);
  renameSync(temp, path);
  const dirFd = openSync(dirname(path), 'r'); fsyncSync(dirFd); closeSync(dirFd);
}

function loadJson(path, fallback) { try { return JSON.parse(readFileSync(path, 'utf8')); } catch (error) { if (error?.code === 'ENOENT') return fallback; throw error; } }

function assertRootFile(path, mode) {
  const stat = lstatSync(path);
  const permissions = stat.mode & 0o777;
  // seed/target（root 写、synthetic 只读）落盘为 0640，root 执行仍读 0600；两者都无组/他人写位，
  // 保证 synthetic 只能读、不能改写门控档。其余 mode 参数仍按精确匹配（向后兼容）。
  const modeOk = mode === 0o600 ? (permissions === 0o600 || permissions === 0o640) : permissions === mode;
  if (!stat.isFile() || stat.isSymbolicLink() || !trustedOwner(stat.uid, stat.gid) || !modeOk) throw new Error(`unsafe_root_file:${path}`);
  return readFileSync(path);
}

function assertRootDirectory(path, mode) {
  const stat = lstatSync(path);
  const permissions = stat.mode & 0o777;
  if (!stat.isDirectory() || stat.isSymbolicLink() || !trustedOwner(stat.uid, stat.gid) || (mode === null ? (permissions & 0o022) !== 0 : permissions !== mode)) throw new Error(`unsafe_root_directory:${path}`);
}

function validateTarget(target, profileName, datasetId) {
  if (target?.schemaVersion !== 1 || target.database !== EXPECTED_DATABASE || target.apiBaseUrl !== API_BASE_URL) throw new Error('invalid_synthetic_target');
  if (!/^pgm-[a-z0-9]+$/.test(target.rdsInstanceId ?? '') || target.rdsEndpoint !== `${target.rdsInstanceId}.pg.rds.aliyuncs.com` || target.tlsServername !== target.rdsEndpoint || target.rdsPort !== 5432 || target.expectedDbRole !== EXPECTED_ROLE || !/^0[0-9]{3}_[a-z0-9_]+\.sql$/.test(target.schemaHead ?? '') || !/^[a-f0-9]{64}$/.test(target.schemaLedgerDigest ?? '') || !/^[a-f0-9]{64}$/.test(target.releaseTreeDigest ?? '') || !/^[a-f0-9]{64}$/.test(target.apiContractDigest ?? '') || target.factoryDigest !== factoryDigest()) throw new Error('invalid_synthetic_target_binding');
  const approval = target.approvedProfiles?.[profileName];
  if (target.successorOfTargetDigest !== undefined && !/^[a-f0-9]{64}$/.test(target.successorOfTargetDigest)) throw new Error('invalid_target_predecessor');
  if (!approval || approval.datasetId !== datasetId || !Number.isSafeInteger(approval.maxDurationSeconds) || approval.maxDurationSeconds < 60) throw new Error('profile_not_approved');
  // Target files created before the scoped-bundle rollout have no explicit
  // release identity. The release tree digest is the immutable fallback and
  // is already bound by targetDigest/releaseTreeDigest.
  const releaseIdentity = target.releaseIdentity ?? `tree:${target.releaseTreeDigest}`;
  if (!/^[A-Za-z0-9._:@+/=-]{1,256}$/.test(releaseIdentity)) throw new Error('invalid_target_release_identity');
  return { target, targetDigest: sha256(target), releaseIdentity, approval };
}

export function validateDbReceipt(receipt, { plan, targetBinding, phase, notBefore = 0, layer = 'capacity' }) {
  if (!receipt || receipt.schemaVersion !== 1 || receipt.phase !== phase || receipt.status !== 'verified' || (receipt.receiptLayer ?? 'capacity') !== layer || receipt.datasetId !== plan.datasetId || receipt.profile !== plan.profileName || receipt.targetDigest !== targetBinding.targetDigest || receipt.catalogDigest !== plan.catalogDigest) throw new Error('db_receipt_identity_mismatch');
  const { receiptDigest, ...unsigned } = receipt;
  if (!/^[a-f0-9]{64}$/.test(receiptDigest ?? '') || sha256(unsigned) !== receiptDigest) throw new Error('db_receipt_digest_invalid');
  const target = targetBinding.target;
  if (target.database !== EXPECTED_DATABASE || target.expectedDbRole !== EXPECTED_ROLE || receipt.identity?.database !== target.database || receipt.identity?.role !== target.expectedDbRole || receipt.identity?.endpoint !== target.rdsEndpoint || receipt.identity?.port !== target.rdsPort || receipt.identity?.tlsServername !== target.tlsServername || receipt.schemaLedgerDigest !== target.schemaLedgerDigest || `${receipt.schemaHead}.sql` !== target.schemaHead || receipt.releasePath !== target.releasePath || receipt.releaseTreeDigest !== target.releaseTreeDigest || receipt.apiContractDigest !== target.apiContractDigest || (targetBinding.releaseIdentity && receipt.releaseIdentity !== targetBinding.releaseIdentity)) throw new Error('db_receipt_target_mismatch');
  if (!receipt.forbidden || JSON.stringify(Object.keys(receipt.forbidden).sort()) !== JSON.stringify(REQUIRED_FORBIDDEN_KEYS) || Object.values(receipt.forbidden).some((value) => value !== 0)) throw new Error('db_receipt_forbidden_side_effect');
  if (receipt.factoryDigest !== target.factoryDigest) throw new Error('db_receipt_factory_mismatch');
  const baseline = targetBinding.approval.expectedBaseline; const cumulative = targetBinding.approval.expectedCumulative;
  if (!baseline || !cumulative) throw new Error('db_receipt_expected_counts_missing');
  const countKeys = ['accounts', 'jobs', 'applications', 'resumes', 'interviews'];
  const effectiveCounts = receipt.attestationMode === 'capacity_with_fixed_deep_overlay' ? receipt.capacityCounts : receipt.counts;
  if (receipt.attestationMode === 'capacity_with_fixed_deep_overlay') {
    const overlay = receipt.allowedOverlay;
    const limits = { interviews: 500, applicationExceptions: 500, modelInvocations: 10000, consumptions: 500, answerEvents: 10000 };
    if (plan.profileName !== 'large-v1-successor' || overlay?.schemaVersion !== 1 || overlay.scope !== 'fixed-preview-candidate' || typeof overlay.ownerUserId !== 'string' || overlay.ownerUserId.length === 0 || !/^[a-f0-9]{64}$/.test(overlay.deepUsageReceiptDigest ?? '') || !Array.isArray(overlay.interviewIds) || overlay.interviewIds.length !== 3 || new Set(overlay.interviewIds).size !== 3 || !Array.isArray(overlay.applicationIds) || overlay.applicationIds.length !== 3 || new Set(overlay.applicationIds).size !== 3 || JSON.stringify(overlay.limits) !== JSON.stringify(limits) || Object.entries(limits).some(([key, limit]) => !Number.isSafeInteger(overlay[key]) || overlay[key] < (key === 'interviews' ? 3 : 0) || overlay[key] > limit)) throw new Error('db_receipt_overlay_invalid');
  }
  const countsInvalid = phase === 'pre' && receipt.recovery === true
    ? (receipt.attestationMode === 'capacity_with_fixed_deep_overlay' ? countKeys.some((key) => effectiveCounts?.[key] !== cumulative[key]) : countKeys.some((key) => effectiveCounts?.[key] < baseline[key] || effectiveCounts?.[key] > cumulative[key]))
    : countKeys.some((key) => effectiveCounts?.[key] !== (phase === 'pre' ? baseline[key] : cumulative[key]));
  if (countsInvalid) throw new Error('db_receipt_count_mismatch');
  const verifiedAt = Date.parse(receipt.verifiedAt ?? '');
  if (!Number.isFinite(verifiedAt) || verifiedAt < notBefore || verifiedAt > Date.now() + 30_000) throw new Error('db_receipt_stale_or_future');
  return receipt;
}

export function isVerificationContinuableState(status) {
  return status === 'loaded_unverified' || status === 'verifying';
}

function validateCommittedReady(verification, manifest, { targetDigest, catalogDigest, releaseIdentity = null }) {
  if (!verification || !manifest || manifest.status !== 'ready' || manifest.targetDigest !== targetDigest || verification.targetDigest !== targetDigest || manifest.catalogDigest !== catalogDigest || verification.catalogDigest !== catalogDigest || manifest.verificationDigest !== verification.verificationDigest || (releaseIdentity && verification.releaseIdentity && verification.releaseIdentity !== releaseIdentity) || (releaseIdentity && manifest.releaseIdentity && manifest.releaseIdentity !== releaseIdentity)) throw new Error('committed_ready_not_satisfied');
  const { verificationDigest, ...unsigned } = verification;
  if (!/^[a-f0-9]{64}$/.test(verificationDigest ?? '') || sha256(unsigned) !== verificationDigest) throw new Error('showcase_verification_digest_invalid');
  return verification;
}

/**
 * Build a new manifest for a successor target without touching the committed
 * predecessor manifest.  Only API projection checks may run against the
 * returned state; all object IDs and the original load provenance are kept.
 * The caller should persist it under `targetScopedDatasetStatePath` so the
 * predecessor verification/receipt remains immutable.
 */
export function buildTargetReattestationState({ state, plan, targetBinding } = {}) {
  if (!state || state.status !== 'ready' || state.datasetId !== plan?.datasetId || state.catalogDigest !== plan?.catalogDigest || typeof state.targetDigest !== 'string' || state.targetDigest === targetBinding?.targetDigest) throw new Error('reattestation_source_not_committed_ready');
  if (targetBinding?.target?.successorOfTargetDigest !== state.targetDigest) throw new Error('reattestation_target_not_successor');
  const required = [
    ...plan.recruiters.map((account) => ['accounts', account.key]),
    ...plan.candidates.map((account) => ['accounts', account.key]),
    ...plan.jobs.map((job) => ['jobs', job.key]),
    ...plan.applications.map((application) => ['applications', application.key]),
    ...plan.privateObjects.resumes.map((resume) => ['resumes', resume.key]),
    ...plan.interviews.map((interview) => ['interviews', interview.key]),
  ];
  if (required.some(([collection, key]) => !state[collection]?.[key])) throw new Error('reattestation_object_provenance_incomplete');
  return {
    ...structuredClone(state),
    status: 'loaded_unverified',
    targetDigest: targetBinding.targetDigest,
    releaseIdentity: targetBinding.releaseIdentity,
    reattestationMode: 'api_read_only',
    predecessorTargetDigest: state.targetDigest,
    predecessorVerificationDigest: state.verificationDigest ?? null,
    reattestedAt: new Date().toISOString(),
  };
}

export function targetScopedDatasetStatePath(statePath, targetBinding) {
  const digest = targetBinding?.targetDigest;
  const releaseIdentity = targetBinding?.releaseIdentity ?? targetBinding?.target?.releaseIdentity ?? 'target-only';
  if (!/^[a-f0-9]{64}$/.test(digest ?? '')) throw new Error('reattestation_target_digest_invalid');
  if (!/^[A-Za-z0-9._:@+/=-]{1,256}$/.test(releaseIdentity)) throw new Error('reattestation_release_identity_invalid');
  const source = resolve(statePath);
  const releaseTag = sha256(releaseIdentity).slice(0, 16);
  return join(dirname(source), `.target-${digest}-${releaseTag}`, 'manifest.json');
}

export function targetScopedDatasetDir(datasetDir, targetBinding) {
  return dirname(targetScopedDatasetStatePath(join(resolve(datasetDir), 'manifest.json'), targetBinding));
}

export function persistTargetReattestation({ sourceStatePath, targetStatePath, plan, targetBinding } = {}) {
  const source = loadJson(sourceStatePath, null);
  const state = buildTargetReattestationState({ state: source, plan, targetBinding });
  durableWriteJson(targetStatePath, state);
  return state;
}

function validateShowcaseGate(showcase, manifest, targetBinding) {
  return validateCommittedReady(showcase, manifest, { targetDigest: targetBinding.targetDigest, catalogDigest: targetBinding.approval.requiredShowcaseCatalogDigest });
}

export async function applyPlan({ plan, api, seed, statePath, credentialPath, targetBinding = { targetDigest: 'test-target', approval: { maxDurationSeconds: 3600 } }, fixedPreviewCredentials = null, onProgress = () => {} }) {
  const publicPlan = { ...plan }; delete publicPlan.privateObjects;
  const startedAt = Date.now();
  let state = loadJson(statePath, { schemaVersion: 2, datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, targetDigest: targetBinding.targetDigest, releaseIdentity: targetBinding.releaseIdentity ?? null, status: 'loading', accounts: {}, jobs: {}, applications: {}, resumes: {}, interviews: {} });
  if (state.datasetId !== plan.datasetId || state.catalogDigest !== plan.catalogDigest) throw new Error('dataset_manifest_conflict');
  const hadTargetBinding = typeof state.targetDigest === 'string';
  const targetUpgraded = state.targetDigest && state.targetDigest !== targetBinding.targetDigest;
  if (targetUpgraded && targetBinding.target.successorOfTargetDigest !== state.targetDigest) throw new Error('dataset_target_conflict');
  if (state.releaseIdentity && targetBinding.releaseIdentity && state.releaseIdentity !== targetBinding.releaseIdentity && !targetUpgraded) throw new Error('dataset_release_identity_conflict');
  if (plan.recruiters.some((account) => account.fixedPreviewAccount) || plan.candidates.some((account) => account.fixedPreviewAccount)) {
    if (!fixedPreviewCredentials) throw new Error('fixed_preview_credentials_required');
    for (const account of FIXED_PREVIEW_ACCOUNTS) {
      const password = fixedPreviewCredentials[account.key];
      if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new Error(`fixed_preview_password_invalid:${account.key}`);
    }
  }
  state.targetDigest = targetBinding.targetDigest;
  if (targetBinding.releaseIdentity) state.releaseIdentity = targetBinding.releaseIdentity;
  if (state.status === 'ready' && hadTargetBinding && !targetUpgraded) return state;
  if (state.status === 'ready' && (!hadTargetBinding || targetUpgraded)) state.status = 'loading';
  if (state.status === 'loaded_unverified' || state.status === 'verifying') return state;
  const tokens = new Map();
  const credentials = [];
  const persist = () => durableWriteJson(statePath, state);
  const guardDuration = () => { if ((Date.now() - startedAt) / 1000 > targetBinding.approval.maxDurationSeconds) throw new Error('dataset_duration_limit_exceeded'); };
  const authAccount = async (account) => {
    const password = passwordForAccount(account, seed, fixedPreviewCredentials);
    let result;
    if (!state.accounts[account.key]) {
      try { result = await api.request('/auth/signup', { method: 'POST', body: { email: account.email, password, role: account.role } }); }
      catch (error) {
        if (error.status !== 409) throw error;
        result = await api.request('/auth/login', { method: 'POST', body: { email: account.email, password } });
      }
      state.accounts[account.key] = { email: account.email, role: account.role, persona: account.persona, userId: result.payload.userId };
      persist();
    } else result = await api.request('/auth/login', { method: 'POST', body: { email: account.email, password } });
    tokens.set(account.key, result.payload.token);
    // The credential file is a resumability index, not a secret store.  The
    // password remains in this process only (fixed passwords come from env;
    // generated passwords are re-derived from the seed on the next run).
    credentials.push({ key: account.key, email: account.email, role: account.role, persona: account.persona });
    onProgress('account', account.key);
  };
  for (const account of [...plan.recruiters, ...plan.candidates]) { guardDuration(); await authAccount(account); }
  durableWriteJson(credentialPath, { schemaVersion: 2, datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, credentials });

  for (const resume of plan.privateObjects.resumes) {
    guardDuration();
    const token = tokens.get(resume.candidateKey);
    if (!state.resumes[resume.key]) {
      await api.request('/privacy/consent', { method: 'POST', token, body: { purpose: 'resume_processing' } });
      const result = await api.request('/resume', { method: 'POST', token, body: { text: resume.text } });
      state.resumes[resume.key] = { candidateKey: resume.candidateKey, resumeId: result.payload.resumeId, textDigest: sha256(resume.text), textChars: resume.text.length, status: result.payload.status };
      persist();
    }
    onProgress('resume', resume.key);
  }
  if (!state.boundaryResumeChecked) {
    const token = tokens.get(plan.candidates.find((account) => account.persona === 'long-resume-candidate')?.key ?? plan.candidates[0].key);
    const before = await api.request('/resume', { token });
    const result = await api.request('/resume', { method: 'POST', token, body: { text: buildLongResume(60_001) }, expected: [400] });
    const after = await api.request('/resume', { token });
    if (!['invalid', 'validation_error'].includes(result.payload?.error) || before.payload.resumes.length !== after.payload.resumes.length) throw new Error('oversize_resume_zero_write_not_proven');
    state.boundaryResumeChecked = true; persist();
  }

  for (const job of plan.jobs) {
    guardDuration();
    if (!state.jobs[job.key]) {
      const result = await api.request('/recruiter/jobs', { method: 'POST', token: tokens.get(job.ownerKey), headers: { 'idempotency-key': `${plan.datasetId}:${job.key}` }, body: { title: job.title, description: job.description, competencies: job.competencies } });
      state.jobs[job.key] = { ownerKey: job.ownerKey, jobId: result.payload.id };
      persist();
    }
    onProgress('job', job.key);
  }

  for (const application of plan.applications) {
    guardDuration();
    const token = tokens.get(application.candidateKey);
    if (!state.applications[application.key]) {
      const jobId = state.jobs[application.jobKey].jobId;
      const result = await api.request(`/jobs/${encodeURIComponent(jobId)}/apply`, { method: 'POST', token });
      state.applications[application.key] = { candidateKey: application.candidateKey, jobKey: application.jobKey, applicationId: result.payload.applicationId, status: 'invited' };
      persist();
    }
    if (application.decline && state.applications[application.key].status !== 'declined') {
      const applicationId = state.applications[application.key].applicationId;
      const result = await api.request(`/applications/${encodeURIComponent(applicationId)}/decline`, { method: 'POST', token });
      if (!['declined', 'noop'].includes(result.payload.status)) throw new Error('unexpected_decline_status');
      state.applications[application.key].status = 'declined'; persist();
    }
    onProgress('application', application.key);
  }

  for (const interview of plan.interviews) {
    guardDuration();
    const token = tokens.get(interview.candidateKey);
    if (!state.interviews[interview.key]) {
      const result = await api.request('/interview', { method: 'POST', token });
      state.interviews[interview.key] = { candidateKey: interview.candidateKey, interviewId: result.payload.interviewId, status: result.payload.status };
      persist();
    }
    if (state.interviews[interview.key].status !== 'abandoned') {
      const id = state.interviews[interview.key].interviewId;
      const result = await api.request(`/interview/${encodeURIComponent(id)}/abandon`, { method: 'POST', token });
      if (!result.payload.abandoned) throw new Error('interview_abandon_failed');
      state.interviews[interview.key].status = 'abandoned'; persist();
    }
    onProgress('interview', interview.key);
  }
  state.status = 'loaded_unverified'; state.loadedAt = new Date().toISOString();
  state.counts = { accounts: Object.keys(state.accounts).length, jobs: Object.keys(state.jobs).length, applications: Object.keys(state.applications).length, resumes: Object.keys(state.resumes).length, interviews: Object.keys(state.interviews).length };
  state.loadReceiptDigest = sha256({ datasetId: state.datasetId, catalogDigest: state.catalogDigest, targetDigest: state.targetDigest, counts: state.counts });
  persist();
  return state;
}

export async function verifyPlan({ plan, api, seed, statePath, targetBinding = { targetDigest: 'test-target', approval: { expectedCumulative: null } }, dbReceipt = null, fixedPreviewCredentials = null }) {
  const state = loadJson(statePath, null);
  if (!state || !['loaded_unverified', 'verifying', 'ready'].includes(state.status) || state.catalogDigest !== plan.catalogDigest || state.targetDigest !== targetBinding.targetDigest || (targetBinding.releaseIdentity && state.releaseIdentity && state.releaseIdentity !== targetBinding.releaseIdentity)) throw new Error('dataset_not_loaded');
  if (state.status === 'ready') {
    const readyReceipt = loadJson(join(dirname(statePath), 'verification.json'), null) ?? (() => { throw new Error('ready_verification_missing'); })();
    if (dbReceipt) validateDbReceipt(dbReceipt, { plan, targetBinding, phase: 'post' });
    return readyReceipt;
  }
  state.status = 'verifying'; durableWriteJson(statePath, state);
  const observations = { accounts: 0, jobs: 0, applications: 0, resumes: 0, interviews: 0, numericScores: 0, declined: 0, invited: 0 };
  for (const account of [...plan.recruiters, ...plan.candidates]) {
    const password = passwordForAccount(account, seed, fixedPreviewCredentials);
    const login = await api.request('/auth/login', { method: 'POST', body: { email: account.email, password } });
    if (login.payload.role !== account.role || login.payload.userId !== state.accounts[account.key]?.userId) throw new Error(`account_identity_mismatch:${account.key}`);
    observations.accounts += 1;
    if (account.role === 'recruiter') {
      const jobs = await api.request('/recruiter/jobs', { token: login.payload.token }); observations.jobs += jobs.payload.jobs.length;
      const ownStateIds = Object.values(state.jobs).filter((row) => row.ownerKey === account.key).map((row) => row.jobId);
      if (!ownStateIds.every((id) => jobs.payload.jobs.some((row) => row.id === id))) throw new Error(`job_projection_mismatch:${account.key}`);
      const talent = await api.request('/recruiter/talent', { token: login.payload.token }); observations.applications += talent.payload.talents.length;
      observations.numericScores += talent.payload.talents.filter((row) => row.score !== null).length;
      observations.declined += talent.payload.talents.filter((row) => row.status === 'declined').length;
      observations.invited += talent.payload.talents.filter((row) => row.status === 'invited').length;
    } else {
      const resumes = await api.request('/resume', { token: login.payload.token }); observations.resumes += resumes.payload.resumes.length;
      const interviews = await api.request('/interview?limit=200', { token: login.payload.token }); observations.interviews += interviews.payload.interviews.length;
      const applications = await api.request('/applications', { token: login.payload.token });
      const stateResumeIds = Object.values(state.resumes).filter((row) => row.candidateKey === account.key).map((row) => row.resumeId);
      const stateInterviewIds = Object.values(state.interviews).filter((row) => row.candidateKey === account.key).map((row) => row.interviewId);
      const stateApplicationIds = Object.values(state.applications).filter((row) => row.candidateKey === account.key).map((row) => row.applicationId);
      if (!stateResumeIds.every((id) => resumes.payload.resumes.some((row) => row.id === id)) || !stateInterviewIds.every((id) => interviews.payload.interviews.some((row) => row.id === id)) || !stateApplicationIds.every((id) => applications.payload.applications.some((row) => row.id === id))) throw new Error(`candidate_projection_mismatch:${account.key}`);
    }
  }
  if (plan.profileName === 'large-v1-successor') {
    // Fixed identities are part of the successor catalog and were already
    // authenticated/provisioned by the common account loop.  Keep a public
    // identity projection in the receipt, but never persist credentials.
    observations.fixedPreviewAccounts = FIXED_PREVIEW_ACCOUNTS.map(({ key, email, role }) => ({ key, email, role }));
  }
  if (observations.numericScores !== 0) throw new Error('numeric_recruiter_score_detected');
  validateDbReceipt(dbReceipt, { plan, targetBinding, phase: 'post' });
  const rawObservations = { ...observations };
  if (dbReceipt.attestationMode === 'capacity_with_fixed_deep_overlay') {
    const overlay = dbReceipt.allowedOverlay;
    if (observations.interviews < overlay.interviews) throw new Error('api_overlay_count_mismatch');
    observations.interviews -= overlay.interviews;
    observations.fixedDeepOverlay = { ...overlay };
  }
  const expected = targetBinding.approval.expectedCumulative;
  if (expected && ['accounts', 'jobs', 'applications', 'resumes', 'interviews'].some((key) => observations[key] !== expected[key])) throw new Error('api_cumulative_count_mismatch');
  const priorVerification = loadJson(join(dirname(statePath), 'verification.json'), null);
  const receipt = { schemaVersion: 2, ...(plan.profileName === 'large-v1-successor' ? { receiptLayer: 'capacity', profile: 'large-v1-successor', fixedAccountCatalog: FIXED_PREVIEW_ACCOUNTS.map(({ email, role, key }) => ({ email, role, key })) } : {}), datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, targetDigest: targetBinding.targetDigest, releaseIdentity: targetBinding.releaseIdentity ?? null, loadReceiptDigest: state.loadReceiptDigest, observations, ...(dbReceipt.attestationMode === 'capacity_with_fixed_deep_overlay' ? { rawObservations } : {}), dbReceiptDigest: dbReceipt.receiptDigest, priorVerificationDigest: state.predecessorVerificationDigest ?? priorVerification?.verificationDigest ?? null, attestationMode: state.reattestationMode ?? 'initial_load', predecessorTargetDigest: state.predecessorTargetDigest ?? null, verifiedAt: new Date().toISOString() };
  receipt.verificationDigest = sha256(receipt);
  durableWriteJson(join(dirname(statePath), 'verification.json'), receipt);
  state.status = 'ready'; state.completedAt = receipt.verifiedAt; state.verificationDigest = receipt.verificationDigest; durableWriteJson(statePath, state);
  return receipt;
}

function parseArgs(argv) {
  const out = { command: argv[2], profile: 'showcase-v1', datasetId: 'preview-showcase-v1' };
  for (let i = 3; i < argv.length; i += 2) {
    const key = argv[i]; const value = argv[i + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error(`invalid_argument:${key ?? ''}`);
    const name = key.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase()); out[name] = value;
  }
  return out;
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: options.stdio ?? 'inherit', timeout: options.timeout ?? 30_000, env: options.env ?? process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`command_failed:${command}:${result.status ?? 'signal'}`);
}

function assertCandidateLoaderEnvironment(env = process.env) {
  if (forbiddenGenericDatabaseEnv.some((key) => typeof env[key] === 'string' && env[key].length > 0)) {
    throw new Error('candidate_loader_migration_database_env_forbidden');
  }
}

// compose 单机：维护窗口要静默的「worker」已从系统 service 变成容器，nginx 仍是宿主 systemd。
// 为什么保留 meetwise-worker.service 这一标识：maintenance 回执的 workerWasActive 字段与 publisher
// 校验逐字绑定，不能换名；只在控制面做 名字→(compose|systemctl) 的分派，回执形状不变。
const COMPOSE_DIR = '/srv/meetwise-compose';
const COMPOSE_FILE = '/srv/meetwise-compose/docker/compose.prod.yml';
const COMPOSE_SERVICES = new Set(['meetwise-worker.service']);

function composeWorkerRunning() {
  // compose 单机下 worker 是 restart:unless-stopped 容器。「active」= running 或 restarting
  // （crash-loop 回退期仍会被拉起），只有手动 `docker compose stop` 之后的 exited（粘性停止）
  // 才算 inactive。旧的 `ps --status running -q` 只认 running 会漏掉 restarting → workerWasActive
  // 误判 false 卡死发布、stop 守卫跳过 restarting worker 与装载写库形成数据竞争。
  // 降权后 meetwise-synthetic 不在 docker 组，docker 查询/启停一律经窄 sudo。改用 `ps --status`
  // 判定，弃用 docker inspect：inspect 需按动态容器 id 逐个查，无法写成窄 sudo 规则（sudoers 用
  // `docker inspect *` 通配会泄露容器 env 里的 DB/模型密钥，比降权本身更危险）。
  const statusActive = (status) => runPrivilegedCapture('/usr/bin/docker', ['compose', '--project-directory', COMPOSE_DIR, '-f', COMPOSE_FILE, 'ps', '--status', status, '-q', 'worker']).trim() !== '';
  return statusActive('running') || statusActive('restarting');
}

function serviceIsActive(name) {
  if (COMPOSE_SERVICES.has(name)) return composeWorkerRunning();
  const result = spawnSync('/usr/bin/systemctl', ['show', name, '--property=LoadState', '--property=ActiveState', '--no-pager'], { encoding: 'utf8', timeout: 10_000 });
  if (result.error || result.status !== 0) throw new Error(`service_state_query_failed:${name}`);
  const values = Object.fromEntries(result.stdout.trim().split('\n').map((line) => line.split('=', 2)));
  if (values.LoadState !== 'loaded' || !['active', 'inactive'].includes(values.ActiveState)) throw new Error(`service_state_not_stable:${name}:${values.LoadState ?? 'unknown'}:${values.ActiveState ?? 'unknown'}`);
  return values.ActiveState === 'active';
}

// 维护窗口的服务启停：root 下直接调；meetwise-synthetic 下经窄 sudo（sudoers 只放行
// systemctl stop|start nginx 与 docker compose ps|stop|up worker，见 provision-meetwise-synthetic.sh）。
function runPrivileged(command, args) {
  if (process.getuid?.() === 0) return runCommand(command, args);
  return runCommand('/usr/bin/sudo', [command, ...args]);
}

// 同 runPrivileged，但捕获 stdout 供 composeWorkerRunning 判定容器状态。docker 查询与启停
// 一样走 sudo（meetwise-synthetic 不在 docker 组，加入 docker 组 = 经 socket 变相 root，禁止）。
function runPrivilegedCapture(command, args) {
  const argv = process.getuid?.() === 0 ? [command, ...args] : ['/usr/bin/sudo', command, ...args];
  const result = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', timeout: 10_000, env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`command_failed:${command}:${result.status ?? 'signal'}`);
  return result.stdout;
}

function controlService(name, action) {
  if (COMPOSE_SERVICES.has(name)) runPrivileged('/usr/bin/docker', ['compose', '--project-directory', COMPOSE_DIR, '-f', COMPOSE_FILE, action === 'start' ? 'up' : 'stop', ...(action === 'start' ? ['-d'] : []), 'worker']);
  else runPrivileged('/usr/bin/systemctl', [action, name]);
}

function restoreMaintenanceServices(maintenance, maintenancePath) {
  const errors = [];
  for (const [name, wanted] of [['meetwise-worker.service', maintenance.workerWasActive], ['nginx.service', maintenance.nginxWasActive]]) {
    try {
      const active = serviceIsActive(name);
      if (wanted && !active) controlService(name, 'start');
      if (!wanted && active) controlService(name, 'stop');
      if (serviceIsActive(name) !== wanted) throw new Error(`service_restore_mismatch:${name}`);
    } catch (error) { errors.push(error); }
  }
  if (errors.length) throw new AggregateError(errors, 'preview_services_restart_failed');
  durableWriteJson(maintenancePath, { ...maintenance, status: 'restored', restoredAt: new Date().toISOString() });
}

function validateMaintenance(maintenance, plan, targetBinding) {
  if (!maintenance || maintenance.status !== 'maintenance' || maintenance.datasetId !== plan.datasetId || maintenance.catalogDigest !== plan.catalogDigest || maintenance.targetDigest !== targetBinding.targetDigest || typeof maintenance.nginxWasActive !== 'boolean' || typeof maintenance.workerWasActive !== 'boolean') throw new Error('maintenance_ledger_mismatch');
  return maintenance;
}

const BUNDLE_ARTIFACTS = Object.freeze(['manifest.json', 'verification.json', 'pre-db-verification.json', 'post-db-verification.json', 'maintenance.json']);

function readTrustedJsonIfPresent(path) {
  try {
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`unsafe_receipt_artifact:${path}`);
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function writeCredentialIndex(path, plan, state) {
  const credentials = [...plan.recruiters, ...plan.candidates].map((account) => ({
    key: account.key,
    email: account.email,
    role: account.role,
    persona: account.persona,
    userId: state.accounts?.[account.key]?.userId ?? null,
  }));
  durableWriteJson(path, { schemaVersion: 2, datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, credentials });
}

function assertScopedDirectory(path) {
  mkdirSync(path, { recursive: true, mode: 0o700 });
  assertRootDirectory(path, 0o700);
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`unsafe_target_bundle_symlink:${join(path, entry.name)}`);
  }
}

/**
 * Pure routing decision used by the filesystem materializer and its proof.
 * A target-scoped directory can only replay its own target; an old ready
 * legacy manifest is an immutable predecessor input and routes to a new
 * read-only re-attestation bundle.  No filesystem or API mutation happens in
 * this helper.
 */
export function routeTargetBundle({ legacyState = null, targetState = null, plan, targetBinding } = {}) {
  const identityMatches = (state) => state && state.datasetId === plan?.datasetId && state.catalogDigest === plan?.catalogDigest;
  if (targetState) {
    if (!identityMatches(targetState) || targetState.targetDigest !== targetBinding?.targetDigest) throw new Error('target_bundle_identity_conflict');
    if (targetState.releaseIdentity && targetBinding?.releaseIdentity && targetState.releaseIdentity !== targetBinding.releaseIdentity) throw new Error('target_bundle_release_identity_conflict');
    return { mode: targetState.reattestationMode === 'api_read_only' ? 'reattestation' : 'canonical', predecessorTargetDigest: targetState.predecessorTargetDigest ?? null };
  }
  if (!legacyState) return { mode: 'initial', predecessorTargetDigest: null };
  if (!identityMatches(legacyState)) throw new Error('legacy_bundle_identity_conflict');
  if (legacyState.targetDigest === targetBinding?.targetDigest) return { mode: 'legacy_migrated', predecessorTargetDigest: null };
  if (legacyState.status !== 'ready') throw new Error('legacy_predecessor_not_ready_for_reattestation');
  if (targetBinding?.target?.successorOfTargetDigest !== legacyState.targetDigest) throw new Error('reattestation_target_not_successor');
  return { mode: 'reattestation', predecessorTargetDigest: legacyState.targetDigest };
}

/**
 * Materialize the canonical target bundle. Legacy datasetDir/manifest.json is
 * read as a predecessor only; it is never overwritten or renamed. A ready
 * predecessor gets a new API-read-only manifest, while a same-target legacy
 * bundle is copied into the canonical directory for replay.
 */
export function materializeTargetBundle({ legacyDir, targetDir, plan, targetBinding }) {
  assertScopedDirectory(legacyDir);
  if (resolve(targetDir) === resolve(legacyDir)) throw new Error('target_bundle_must_be_scoped');
  assertScopedDirectory(targetDir);
  const manifestPath = join(targetDir, 'manifest.json');
  const existing = readTrustedJsonIfPresent(manifestPath);
  const legacyManifest = readTrustedJsonIfPresent(join(legacyDir, 'manifest.json'));
  const route = routeTargetBundle({ legacyState: legacyManifest, targetState: existing, plan, targetBinding });
  if (route.mode === 'canonical' || route.mode === 'reattestation') return route;
  if (route.mode === 'initial') return route;
  if (route.mode === 'legacy_migrated') {
    for (const name of BUNDLE_ARTIFACTS) {
      const value = readTrustedJsonIfPresent(join(legacyDir, name));
      if (value !== null) durableWriteJson(join(targetDir, name), value);
    }
    // Old credential files may contain passwords. Never copy them; generate a
    // secret-free replacement from the manifest/account projection.
    writeCredentialIndex(join(targetDir, 'credentials.json'), plan, legacyManifest);
    return route;
  }
  const state = buildTargetReattestationState({ state: legacyManifest, plan, targetBinding });
  durableWriteJson(manifestPath, state);
  writeCredentialIndex(join(targetDir, 'credentials.json'), plan, legacyManifest);
  return { mode: 'reattestation', predecessorTargetDigest: legacyManifest.targetDigest };
}

function bundlePaths(targetDir) {
  return {
    targetStateDir: targetDir,
    manifestPath: join(targetDir, 'manifest.json'),
    verificationPath: join(targetDir, 'verification.json'),
    preDbVerificationPath: join(targetDir, 'pre-db-verification.json'),
    postDbVerificationPath: join(targetDir, 'post-db-verification.json'),
    maintenancePath: join(targetDir, 'maintenance.json'),
    credentialsPath: join(targetDir, 'credentials.json'),
    receiptBundlePath: join(targetDir, 'receipt-bundle.json'),
  };
}

function writeReceiptBundle(paths, { plan, targetBinding, receipt, dbReceipt, mode }) {
  durableWriteJson(paths.receiptBundlePath, {
    schemaVersion: 1,
    datasetId: plan.datasetId,
    profile: plan.profileName,
    targetDigest: targetBinding.targetDigest,
    releaseIdentity: targetBinding.releaseIdentity,
    mode,
    targetStateDir: paths.targetStateDir,
    paths: { ...paths },
    receipts: { verificationDigest: receipt.verificationDigest, databaseReceiptDigest: dbReceipt.receiptDigest },
  });
}

function replayOutput(receipt, paths, mode) {
  return { ...receipt, replayed: true, targetStateDir: paths.targetStateDir, receiptBundlePath: paths.receiptBundlePath, receiptPaths: paths, bundleMode: mode };
}

function inheritedGlobalLockIsValid(lockPath) {
  if (process.env.MEETWISE_SYNTHETIC_LOCK_FD !== '9') return false;
  try {
    const descriptor = fstatSync(9); const path = lstatSync(lockPath);
    if (!descriptor.isFile() || !path.isFile() || path.isSymbolicLink() || !trustedUid(path.uid, path.gid) || (path.mode & 0o777) !== 0o600 || descriptor.dev !== path.dev || descriptor.ino !== path.ino) return false;
    const parent = process.ppid;
    const parentExecutable = realpathSync(`/proc/${parent}/exe`);
    const parentDescriptor = statSync(`/proc/${parent}/fd/9`);
    return parentExecutable === '/usr/bin/flock' && parentDescriptor.dev === descriptor.dev && parentDescriptor.ino === descriptor.ino;
  } catch { return false; }
}

async function main() {
  const args = parseArgs(process.argv);
  const plan = buildPlan(args.profile, args.datasetId);
  const publicPlan = { ...plan }; delete publicPlan.privateObjects;
  // Even the pure plan command must not run inside a shell that has inherited
  // a migration/runtime connection string; keeping this guard before the
  // early return makes the candidate-loader boundary uniform for every mode.
  assertCandidateLoaderEnvironment(process.env);
  if (args.command === 'plan') { process.stdout.write(`${JSON.stringify(publicPlan, null, 2)}\n`); return; }
  if (!['apply', 'verify', 'run'].includes(args.command)) throw new Error('usage: loader.mjs plan|apply|verify|run [--profile name --dataset-id id]');
  if (!trustedUid(process.getuid?.() ?? -1, process.getgid?.() ?? -1)) throw new Error('apply_and_verify_require_trusted_uid');
  if (Object.keys(args).some((key) => !['command', 'profile', 'datasetId'].includes(key))) throw new Error('unsafe_path_or_target_override');
  assertRootDirectory('/etc/meetwise', null); assertRootDirectory(STATE_ROOT, 0o700);
  const seed = assertRootFile(SEED_FILE, 0o600);
  if (seed.length < 32) throw new Error('synthetic_seed_too_short');
  const target = JSON.parse(assertRootFile(TARGET_FILE, 0o600).toString('utf8'));
  const targetBinding = validateTarget(target, args.profile, args.datasetId);
  if (targetBinding.approval.catalogDigest !== plan.catalogDigest) throw new Error('approved_catalog_digest_mismatch');
  // The historical dataset directory is retained as an immutable predecessor
  // input. Every target/release now gets its own canonical child directory.
  const datasetDir = join(STATE_ROOT, args.datasetId);
  const targetDir = targetScopedDatasetDir(datasetDir, targetBinding);
  const api = new ApiClient(API_BASE_URL);
  mkdirSync(datasetDir, { recursive: true, mode: 0o700 }); assertRootDirectory(datasetDir, 0o700);
  const lockPath = join(STATE_ROOT, 'global.apply.lock');
  if (!inheritedGlobalLockIsValid(lockPath)) {
    const lockFd = openSync(lockPath, 'a', 0o600); const lockStat = lstatSync(lockPath);
    if (!lockStat.isFile() || lockStat.isSymbolicLink() || !trustedUid(lockStat.uid, lockStat.gid)) { closeSync(lockFd); throw new Error('unsafe_global_lock_file'); }
    if ((lockStat.mode & 0o777) !== 0o600) chmodSync(lockPath, 0o600);
    const stdio = ['inherit', 'inherit', 'inherit', 'ignore', 'ignore', 'ignore', 'ignore', 'ignore', 'ignore', lockFd];
    const child = spawnSync('/usr/bin/flock', ['--exclusive', '--nonblock', '9', process.execPath, process.argv[1], ...process.argv.slice(2)], { stdio, env: { ...process.env, MEETWISE_SYNTHETIC_LOCK_FD: '9' } });
    closeSync(lockFd);
    if (child.error) throw child.error;
    process.exitCode = child.status ?? 1; return;
  }
  const bundle = materializeTargetBundle({ legacyDir: datasetDir, targetDir, plan, targetBinding });
  const paths = bundlePaths(targetDir);
  if (args.profile === 'large-v1' || args.profile === 'large-v1-successor') {
    const showcaseLegacyDir = join(STATE_ROOT, 'preview-showcase-v1');
    const showcaseDir = targetScopedDatasetDir(showcaseLegacyDir, targetBinding);
    const showcaseScopedManifest = readTrustedJsonIfPresent(join(showcaseDir, 'manifest.json'));
    const showcaseLegacyManifest = readTrustedJsonIfPresent(join(showcaseLegacyDir, 'manifest.json'));
    const showcaseManifest = showcaseScopedManifest ?? (showcaseLegacyManifest?.targetDigest === targetBinding.targetDigest ? showcaseLegacyManifest : null);
    const showcase = readTrustedJsonIfPresent(join(showcaseDir, 'verification.json')) ?? (showcaseLegacyManifest?.targetDigest === targetBinding.targetDigest ? readTrustedJsonIfPresent(join(showcaseLegacyDir, 'verification.json')) : null);
    validateShowcaseGate(showcase, showcaseManifest, targetBinding);
    if (args.command !== 'run') throw new Error('large_requires_atomic_run_command');
  }
  const verifierProcessEnv = args.command === 'run' ? buildVerifierProcessEnv(process.env) : null;
  const fixedPreviewCredentials = args.profile === 'large-v1-successor' ? resolveFixedPreviewCredentials(process.env) : null;
  if (args.command === 'run') {
    const startedAt = Date.now();
    const statePath = paths.manifestPath; const verificationPath = paths.verificationPath; const maintenancePath = paths.maintenancePath;
    const existingManifest = loadJson(statePath, null); const existingVerification = loadJson(verificationPath, null); let maintenance = loadJson(maintenancePath, null);
    const readOnlyReattestation = bundle.mode === 'reattestation' || existingManifest?.reattestationMode === 'api_read_only';
    if (existingManifest?.status === 'ready') {
      const receipt = validateCommittedReady(existingVerification, existingManifest, { targetDigest: targetBinding.targetDigest, catalogDigest: plan.catalogDigest, releaseIdentity: targetBinding.releaseIdentity });
      if (maintenance?.status === 'maintenance') restoreMaintenanceServices(validateMaintenance(maintenance, plan, targetBinding), maintenancePath);
      else if (maintenance && maintenance.status !== 'restored') throw new Error('maintenance_ledger_mismatch');
      const dbReceipt = loadJson(paths.postDbVerificationPath, null);
      validateDbReceipt(dbReceipt, { plan, targetBinding, phase: 'post' });
      writeReceiptBundle(paths, { plan, targetBinding, receipt, dbReceipt, mode: 'replay' });
      process.stdout.write(`${JSON.stringify(replayOutput(receipt, paths, 'replay'), null, 2)}\n`); return;
    }
    if (readOnlyReattestation) {
      if (maintenance?.status === 'maintenance') {
        // A prior process may have died after arming a maintenance ledger. It
        // is safe to restore that ledger before read-only re-attestation; no
        // API object mutation is allowed on this path.
        restoreMaintenanceServices(validateMaintenance(maintenance, plan, targetBinding), maintenancePath);
        maintenance = loadJson(maintenancePath, null);
      } else if (maintenance && maintenance.status !== 'restored') {
        throw new Error('maintenance_ledger_mismatch');
      }
      if (!maintenance) {
        const now = new Date().toISOString();
        maintenance = { schemaVersion: 1, status: 'restored', datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, targetDigest: targetBinding.targetDigest, releaseIdentity: targetBinding.releaseIdentity, nginxWasActive: serviceIsActive('nginx.service'), workerWasActive: serviceIsActive('meetwise-worker.service'), armedAt: now, restoredAt: now, attestationMode: 'api_read_only' };
        durableWriteJson(maintenancePath, maintenance);
      }
    } else {
      if (maintenance?.status === 'maintenance') {
        validateMaintenance(maintenance, plan, targetBinding);
      } else {
        maintenance = { schemaVersion: 1, status: 'maintenance', datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, targetDigest: targetBinding.targetDigest, releaseIdentity: targetBinding.releaseIdentity, nginxWasActive: serviceIsActive('nginx.service'), workerWasActive: serviceIsActive('meetwise-worker.service'), armedAt: new Date().toISOString() };
        durableWriteJson(maintenancePath, maintenance);
      }
    }
    let restorePending = !readOnlyReattestation;
    try {
      if (!readOnlyReattestation) {
        if (serviceIsActive('nginx.service')) controlService('nginx.service', 'stop');
        if (serviceIsActive('meetwise-worker.service')) controlService('meetwise-worker.service', 'stop');
      }
      const verifier = join(dirname(process.argv[1]), 'db-verify.mjs');
      runCommand(process.execPath, [verifier, '--profile', args.profile, '--dataset-id', args.datasetId, '--phase', 'pre', '--output-dir', targetDir], { timeout: 120_000, env: verifierProcessEnv });
      const preflight = loadJson(paths.preDbVerificationPath, null); validateDbReceipt(preflight, { plan, targetBinding, phase: 'pre', notBefore: startedAt });
      const state = readOnlyReattestation
        ? loadJson(statePath, null)
        : await applyPlan({ plan, api, seed, statePath, credentialPath: paths.credentialsPath, targetBinding, fixedPreviewCredentials, onProgress: (kind, key) => process.stderr.write(`progress ${kind} ${key}\n`) });
      if (!isVerificationContinuableState(state.status)) throw new Error(`unexpected_loaded_state:${state.status}`);
      runCommand(process.execPath, [verifier, '--profile', args.profile, '--dataset-id', args.datasetId, '--phase', 'post', '--output-dir', targetDir], { timeout: 120_000, env: verifierProcessEnv });
      const dbReceipt = loadJson(paths.postDbVerificationPath, null); validateDbReceipt(dbReceipt, { plan, targetBinding, phase: 'post', notBefore: startedAt });
      const receipt = await verifyPlan({ plan, api, seed, statePath, targetBinding, dbReceipt, fixedPreviewCredentials });
      if (restorePending) {
        restoreMaintenanceServices(maintenance, maintenancePath);
        restorePending = false;
      }
      writeReceiptBundle(paths, { plan, targetBinding, receipt, dbReceipt, mode: readOnlyReattestation ? 'reattestation' : bundle.mode });
      process.stdout.write(`${JSON.stringify({ ...receipt, targetStateDir: paths.targetStateDir, receiptBundlePath: paths.receiptBundlePath, receiptPaths: paths, bundleMode: readOnlyReattestation ? 'reattestation' : bundle.mode }, null, 2)}\n`);
    } finally {
      if (restorePending && maintenance?.status === 'maintenance') {
        restoreMaintenanceServices(maintenance, maintenancePath);
      }
    }
  } else if (args.command === 'apply') {
    const state = await applyPlan({ plan, api, seed, statePath: paths.manifestPath, credentialPath: paths.credentialsPath, targetBinding, fixedPreviewCredentials, onProgress: (kind, key) => process.stderr.write(`progress ${kind} ${key}\n`) });
    process.stdout.write(`${JSON.stringify({ datasetId: state.datasetId, status: state.status, counts: state.counts, loadReceiptDigest: state.loadReceiptDigest, targetStateDir: paths.targetStateDir, receiptBundlePath: paths.receiptBundlePath, receiptPaths: paths, bundleMode: bundle.mode }, null, 2)}\n`);
  } else {
    const dbReceipt = loadJson(paths.postDbVerificationPath, null);
    const receipt = await verifyPlan({ plan, api, seed, statePath: paths.manifestPath, targetBinding, dbReceipt, fixedPreviewCredentials });
    writeReceiptBundle(paths, { plan, targetBinding, receipt, dbReceipt, mode: bundle.mode });
    process.stdout.write(`${JSON.stringify({ ...receipt, targetStateDir: paths.targetStateDir, receiptBundlePath: paths.receiptBundlePath, receiptPaths: paths, bundleMode: bundle.mode }, null, 2)}\n`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'preview_synthetic_loader_failed'}\n`); process.exitCode = 1; });
