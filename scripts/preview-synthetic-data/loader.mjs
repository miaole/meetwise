#!/usr/bin/env node
import { createHmac } from 'node:crypto';
import { chmodSync, closeSync, fstatSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildLongResume, buildPlan, sha256 } from './catalog.mjs';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);
const STATE_ROOT = '/var/lib/meetwise-preview-synthetic';
const SEED_FILE = '/etc/meetwise/preview-synthetic.seed';
const TARGET_FILE = '/etc/meetwise/preview-synthetic-target.json';
const API_BASE_URL = 'http://127.0.0.1:8787';
const REQUIRED_FORBIDDEN_KEYS = Object.freeze(['answerEvents', 'consumptions', 'invalidApplicationStates', 'invalidInterviewStates', 'invalidJobStates', 'invalidResumeStates', 'modelInvocations', 'nonCatalogAccounts', 'numericScores', 'paymentOrders', 'queuedOrRunningJobs', 'rawAnswerJobs']);

function factoryDigest() {
  const root = dirname(fileURLToPath(import.meta.url));
  return sha256(['catalog.mjs', 'db-verify.mjs', 'loader.mjs', 'target-inspect.mjs'].map((name) => [name, sha256(readFileSync(join(root, name)))]));
}

export function derivePassword(seed, email) {
  return `Mw9!${createHmac('sha256', seed).update(`preview-synthetic-password:v1:${email}`).digest('base64url').slice(0, 24)}`;
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
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== mode) throw new Error(`unsafe_root_file:${path}`);
  return readFileSync(path);
}

function assertRootDirectory(path, mode) {
  const stat = lstatSync(path);
  const permissions = stat.mode & 0o777;
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (mode === null ? (permissions & 0o022) !== 0 : permissions !== mode)) throw new Error(`unsafe_root_directory:${path}`);
}

function validateTarget(target, profileName, datasetId) {
  if (target?.schemaVersion !== 1 || target.database !== 'meetwise_preview' || target.apiBaseUrl !== API_BASE_URL) throw new Error('invalid_synthetic_target');
  if (!/^pgm-[a-z0-9]+$/.test(target.rdsInstanceId ?? '') || target.rdsEndpoint !== `${target.rdsInstanceId}.pg.rds.aliyuncs.com` || target.tlsServername !== target.rdsEndpoint || target.rdsPort !== 5432 || target.expectedDbRole !== 'meetwise_migrate' || !/^0[0-9]{3}_[a-z0-9_]+\.sql$/.test(target.schemaHead ?? '') || !/^[a-f0-9]{64}$/.test(target.schemaLedgerDigest ?? '') || !/^[a-f0-9]{64}$/.test(target.releaseTreeDigest ?? '') || !/^[a-f0-9]{64}$/.test(target.apiContractDigest ?? '') || target.factoryDigest !== factoryDigest()) throw new Error('invalid_synthetic_target_binding');
  const approval = target.approvedProfiles?.[profileName];
  if (target.successorOfTargetDigest !== undefined && !/^[a-f0-9]{64}$/.test(target.successorOfTargetDigest)) throw new Error('invalid_target_predecessor');
  if (!approval || approval.datasetId !== datasetId || !Number.isSafeInteger(approval.maxDurationSeconds) || approval.maxDurationSeconds < 60) throw new Error('profile_not_approved');
  return { target, targetDigest: sha256(target), approval };
}

export function validateDbReceipt(receipt, { plan, targetBinding, phase, notBefore = 0 }) {
  if (!receipt || receipt.schemaVersion !== 1 || receipt.phase !== phase || receipt.status !== 'verified' || receipt.datasetId !== plan.datasetId || receipt.profile !== plan.profileName || receipt.targetDigest !== targetBinding.targetDigest || receipt.catalogDigest !== plan.catalogDigest) throw new Error('db_receipt_identity_mismatch');
  const { receiptDigest, ...unsigned } = receipt;
  if (!/^[a-f0-9]{64}$/.test(receiptDigest ?? '') || sha256(unsigned) !== receiptDigest) throw new Error('db_receipt_digest_invalid');
  const target = targetBinding.target;
  if (receipt.identity?.database !== target.database || receipt.identity?.role !== target.expectedDbRole || receipt.identity?.endpoint !== target.rdsEndpoint || receipt.identity?.port !== target.rdsPort || receipt.identity?.tlsServername !== target.tlsServername || receipt.schemaLedgerDigest !== target.schemaLedgerDigest || `${receipt.schemaHead}.sql` !== target.schemaHead || receipt.releasePath !== target.releasePath || receipt.releaseTreeDigest !== target.releaseTreeDigest || receipt.apiContractDigest !== target.apiContractDigest) throw new Error('db_receipt_target_mismatch');
  if (!receipt.forbidden || JSON.stringify(Object.keys(receipt.forbidden).sort()) !== JSON.stringify(REQUIRED_FORBIDDEN_KEYS) || Object.values(receipt.forbidden).some((value) => value !== 0)) throw new Error('db_receipt_forbidden_side_effect');
  if (receipt.factoryDigest !== target.factoryDigest) throw new Error('db_receipt_factory_mismatch');
  const baseline = targetBinding.approval.expectedBaseline; const cumulative = targetBinding.approval.expectedCumulative;
  if (!baseline || !cumulative) throw new Error('db_receipt_expected_counts_missing');
  const countKeys = ['accounts', 'jobs', 'applications', 'resumes', 'interviews'];
  const countsInvalid = phase === 'pre' && receipt.recovery === true
    ? countKeys.some((key) => receipt.counts?.[key] < baseline[key] || receipt.counts?.[key] > cumulative[key])
    : countKeys.some((key) => receipt.counts?.[key] !== (phase === 'pre' ? baseline[key] : cumulative[key]));
  if (countsInvalid) throw new Error('db_receipt_count_mismatch');
  const verifiedAt = Date.parse(receipt.verifiedAt ?? '');
  if (!Number.isFinite(verifiedAt) || verifiedAt < notBefore || verifiedAt > Date.now() + 30_000) throw new Error('db_receipt_stale_or_future');
  return receipt;
}

export function isVerificationContinuableState(status) {
  return status === 'loaded_unverified' || status === 'verifying';
}

function validateCommittedReady(verification, manifest, { targetDigest, catalogDigest }) {
  if (!verification || !manifest || manifest.status !== 'ready' || manifest.targetDigest !== targetDigest || verification.targetDigest !== targetDigest || manifest.catalogDigest !== catalogDigest || verification.catalogDigest !== catalogDigest || manifest.verificationDigest !== verification.verificationDigest) throw new Error('committed_ready_not_satisfied');
  const { verificationDigest, ...unsigned } = verification;
  if (!/^[a-f0-9]{64}$/.test(verificationDigest ?? '') || sha256(unsigned) !== verificationDigest) throw new Error('showcase_verification_digest_invalid');
  return verification;
}

function validateShowcaseGate(showcase, manifest, targetBinding) {
  return validateCommittedReady(showcase, manifest, { targetDigest: targetBinding.targetDigest, catalogDigest: targetBinding.approval.requiredShowcaseCatalogDigest });
}

export async function applyPlan({ plan, api, seed, statePath, credentialPath, targetBinding = { targetDigest: 'test-target', approval: { maxDurationSeconds: 3600 } }, onProgress = () => {} }) {
  const publicPlan = { ...plan }; delete publicPlan.privateObjects;
  const startedAt = Date.now();
  let state = loadJson(statePath, { schemaVersion: 2, datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, targetDigest: targetBinding.targetDigest, status: 'loading', accounts: {}, jobs: {}, applications: {}, resumes: {}, interviews: {} });
  if (state.datasetId !== plan.datasetId || state.catalogDigest !== plan.catalogDigest) throw new Error('dataset_manifest_conflict');
  const hadTargetBinding = typeof state.targetDigest === 'string';
  const targetUpgraded = state.targetDigest && state.targetDigest !== targetBinding.targetDigest;
  if (targetUpgraded && targetBinding.target.successorOfTargetDigest !== state.targetDigest) throw new Error('dataset_target_conflict');
  state.targetDigest = targetBinding.targetDigest;
  if (state.status === 'ready' && hadTargetBinding && !targetUpgraded) return state;
  if (state.status === 'ready' && (!hadTargetBinding || targetUpgraded)) state.status = 'loading';
  if (state.status === 'loaded_unverified' || state.status === 'verifying') return state;
  const tokens = new Map();
  const credentials = [];
  const persist = () => durableWriteJson(statePath, state);
  const guardDuration = () => { if ((Date.now() - startedAt) / 1000 > targetBinding.approval.maxDurationSeconds) throw new Error('dataset_duration_limit_exceeded'); };
  const authAccount = async (account) => {
    const password = derivePassword(seed, account.email);
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
    credentials.push({ key: account.key, email: account.email, password, role: account.role, persona: account.persona });
    onProgress('account', account.key);
  };
  for (const account of [...plan.recruiters, ...plan.candidates]) { guardDuration(); await authAccount(account); }
  durableWriteJson(credentialPath, { schemaVersion: 1, datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, credentials });

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

export async function verifyPlan({ plan, api, seed, statePath, targetBinding = { targetDigest: 'test-target', approval: { expectedCumulative: null } }, dbReceipt = null }) {
  const state = loadJson(statePath, null);
  if (!state || !['loaded_unverified', 'verifying', 'ready'].includes(state.status) || state.catalogDigest !== plan.catalogDigest || state.targetDigest !== targetBinding.targetDigest) throw new Error('dataset_not_loaded');
  if (state.status === 'ready') return loadJson(join(dirname(statePath), 'verification.json'), null) ?? (() => { throw new Error('ready_verification_missing'); })();
  state.status = 'verifying'; durableWriteJson(statePath, state);
  const observations = { accounts: 0, jobs: 0, applications: 0, resumes: 0, interviews: 0, numericScores: 0, declined: 0, invited: 0 };
  for (const account of [...plan.recruiters, ...plan.candidates]) {
    const password = derivePassword(seed, account.email);
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
  if (observations.numericScores !== 0) throw new Error('numeric_recruiter_score_detected');
  const expected = targetBinding.approval.expectedCumulative;
  if (expected && ['accounts', 'jobs', 'applications', 'resumes', 'interviews'].some((key) => observations[key] !== expected[key])) throw new Error('api_cumulative_count_mismatch');
  validateDbReceipt(dbReceipt, { plan, targetBinding, phase: 'post' });
  const priorVerification = loadJson(join(dirname(statePath), 'verification.json'), null);
  const receipt = { schemaVersion: 2, datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, targetDigest: targetBinding.targetDigest, loadReceiptDigest: state.loadReceiptDigest, observations, dbReceiptDigest: dbReceipt.receiptDigest, priorVerificationDigest: priorVerification?.verificationDigest ?? null, verifiedAt: new Date().toISOString() };
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
  const result = spawnSync(command, args, { stdio: options.stdio ?? 'inherit', timeout: options.timeout ?? 30_000, env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`command_failed:${command}:${result.status ?? 'signal'}`);
}

function serviceIsActive(name) {
  const result = spawnSync('/usr/bin/systemctl', ['show', name, '--property=LoadState', '--property=ActiveState', '--no-pager'], { encoding: 'utf8', timeout: 10_000 });
  if (result.error || result.status !== 0) throw new Error(`service_state_query_failed:${name}`);
  const values = Object.fromEntries(result.stdout.trim().split('\n').map((line) => line.split('=', 2)));
  if (values.LoadState !== 'loaded' || !['active', 'inactive'].includes(values.ActiveState)) throw new Error(`service_state_not_stable:${name}:${values.LoadState ?? 'unknown'}:${values.ActiveState ?? 'unknown'}`);
  return values.ActiveState === 'active';
}

function restoreMaintenanceServices(maintenance, maintenancePath) {
  const errors = [];
  for (const [name, wanted] of [['meetwise-worker.service', maintenance.workerWasActive], ['nginx.service', maintenance.nginxWasActive]]) {
    try {
      const active = serviceIsActive(name);
      if (wanted && !active) runCommand('/usr/bin/systemctl', ['start', name]);
      if (!wanted && active) runCommand('/usr/bin/systemctl', ['stop', name]);
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

function inheritedGlobalLockIsValid(lockPath) {
  if (process.env.MEETWISE_SYNTHETIC_LOCK_FD !== '9') return false;
  try {
    const descriptor = fstatSync(9); const path = lstatSync(lockPath);
    if (!descriptor.isFile() || !path.isFile() || path.isSymbolicLink() || path.uid !== 0 || path.gid !== 0 || (path.mode & 0o777) !== 0o600 || descriptor.dev !== path.dev || descriptor.ino !== path.ino) return false;
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
  if (args.command === 'plan') { process.stdout.write(`${JSON.stringify(publicPlan, null, 2)}\n`); return; }
  if (!['apply', 'verify', 'run'].includes(args.command)) throw new Error('usage: loader.mjs plan|apply|verify|run [--profile name --dataset-id id]');
  if (process.getuid?.() !== 0) throw new Error('apply_and_verify_require_root');
  if (Object.keys(args).some((key) => !['command', 'profile', 'datasetId'].includes(key))) throw new Error('unsafe_path_or_target_override');
  assertRootDirectory('/etc/meetwise', null); assertRootDirectory(STATE_ROOT, 0o700);
  const seed = assertRootFile(SEED_FILE, 0o600);
  if (seed.length < 32) throw new Error('synthetic_seed_too_short');
  const target = JSON.parse(assertRootFile(TARGET_FILE, 0o600).toString('utf8'));
  const targetBinding = validateTarget(target, args.profile, args.datasetId);
  if (targetBinding.approval.catalogDigest !== plan.catalogDigest) throw new Error('approved_catalog_digest_mismatch');
  const datasetDir = join(STATE_ROOT, args.datasetId);
  const api = new ApiClient(API_BASE_URL);
  mkdirSync(datasetDir, { recursive: true, mode: 0o700 }); assertRootDirectory(datasetDir, 0o700);
  const lockPath = join(STATE_ROOT, 'global.apply.lock');
  if (!inheritedGlobalLockIsValid(lockPath)) {
    const lockFd = openSync(lockPath, 'a', 0o600); const lockStat = lstatSync(lockPath);
    if (!lockStat.isFile() || lockStat.isSymbolicLink() || lockStat.uid !== 0 || lockStat.gid !== 0) { closeSync(lockFd); throw new Error('unsafe_global_lock_file'); }
    if ((lockStat.mode & 0o777) !== 0o600) chmodSync(lockPath, 0o600);
    const stdio = ['inherit', 'inherit', 'inherit', 'ignore', 'ignore', 'ignore', 'ignore', 'ignore', 'ignore', lockFd];
    const child = spawnSync('/usr/bin/flock', ['--exclusive', '--nonblock', '9', process.execPath, process.argv[1], ...process.argv.slice(2)], { stdio, env: { ...process.env, MEETWISE_SYNTHETIC_LOCK_FD: '9' } });
    closeSync(lockFd);
    if (child.error) throw child.error;
    process.exitCode = child.status ?? 1; return;
  }
  if (args.profile === 'large-v1') {
    const showcase = loadJson(join(STATE_ROOT, 'preview-showcase-v1', 'verification.json'), null);
    const showcaseManifest = loadJson(join(STATE_ROOT, 'preview-showcase-v1', 'manifest.json'), null);
    validateShowcaseGate(showcase, showcaseManifest, targetBinding);
    if (args.command !== 'run') throw new Error('large_requires_atomic_run_command');
  }
  if (args.command === 'run') {
    const startedAt = Date.now(); const statePath = join(datasetDir, 'manifest.json'); const verificationPath = join(datasetDir, 'verification.json'); const maintenancePath = join(datasetDir, 'maintenance.json');
    const existingManifest = loadJson(statePath, null); const existingVerification = loadJson(verificationPath, null); let maintenance = loadJson(maintenancePath, null);
    if (existingManifest?.status === 'ready') {
      const receipt = validateCommittedReady(existingVerification, existingManifest, { targetDigest: targetBinding.targetDigest, catalogDigest: plan.catalogDigest });
      if (maintenance?.status === 'maintenance') restoreMaintenanceServices(validateMaintenance(maintenance, plan, targetBinding), maintenancePath);
      else if (maintenance && maintenance.status !== 'restored') throw new Error('maintenance_ledger_mismatch');
      process.stdout.write(`${JSON.stringify({ ...receipt, replayed: true }, null, 2)}\n`); return;
    }
    if (maintenance?.status === 'maintenance') {
      validateMaintenance(maintenance, plan, targetBinding);
    } else {
      maintenance = { schemaVersion: 1, status: 'maintenance', datasetId: plan.datasetId, catalogDigest: plan.catalogDigest, targetDigest: targetBinding.targetDigest, nginxWasActive: serviceIsActive('nginx.service'), workerWasActive: serviceIsActive('meetwise-worker.service'), armedAt: new Date().toISOString() };
      durableWriteJson(maintenancePath, maintenance);
    }
    let committedReady = false;
    try {
      if (serviceIsActive('nginx.service')) runCommand('/usr/bin/systemctl', ['stop', 'nginx.service']);
      if (serviceIsActive('meetwise-worker.service')) runCommand('/usr/bin/systemctl', ['stop', 'meetwise-worker.service']);
      runCommand(process.execPath, [join(dirname(process.argv[1]), 'db-verify.mjs'), '--profile', args.profile, '--dataset-id', args.datasetId, '--phase', 'pre'], { timeout: 120_000 });
      const preflight = loadJson(join(datasetDir, 'pre-db-verification.json'), null); validateDbReceipt(preflight, { plan, targetBinding, phase: 'pre', notBefore: startedAt });
      const state = await applyPlan({ plan, api, seed, statePath, credentialPath: join(datasetDir, 'credentials.json'), targetBinding, onProgress: (kind, key) => process.stderr.write(`progress ${kind} ${key}\n`) });
      if (!isVerificationContinuableState(state.status)) throw new Error(`unexpected_loaded_state:${state.status}`);
      runCommand(process.execPath, [join(dirname(process.argv[1]), 'db-verify.mjs'), '--profile', args.profile, '--dataset-id', args.datasetId, '--phase', 'post'], { timeout: 120_000 });
      const dbReceipt = loadJson(join(datasetDir, 'post-db-verification.json'), null); validateDbReceipt(dbReceipt, { plan, targetBinding, phase: 'post', notBefore: startedAt });
      const receipt = await verifyPlan({ plan, api, seed, statePath, targetBinding, dbReceipt });
      committedReady = true;
      process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    } finally {
      if (committedReady) {
        restoreMaintenanceServices(maintenance, maintenancePath);
      }
    }
  } else if (args.command === 'apply') {
    const state = await applyPlan({ plan, api, seed, statePath: join(datasetDir, 'manifest.json'), credentialPath: join(datasetDir, 'credentials.json'), targetBinding, onProgress: (kind, key) => process.stderr.write(`progress ${kind} ${key}\n`) });
    process.stdout.write(`${JSON.stringify({ datasetId: state.datasetId, status: state.status, counts: state.counts, loadReceiptDigest: state.loadReceiptDigest }, null, 2)}\n`);
  } else {
    const dbReceipt = loadJson(join(datasetDir, 'post-db-verification.json'), null);
    const receipt = await verifyPlan({ plan, api, seed, statePath: join(datasetDir, 'manifest.json'), targetBinding, dbReceipt });
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'preview_synthetic_loader_failed'}\n`); process.exitCode = 1; });
