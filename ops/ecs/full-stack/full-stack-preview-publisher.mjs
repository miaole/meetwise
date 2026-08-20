#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { createHash, createPublicKey, randomBytes, verify } from 'node:crypto';
import { constants as fsConstants, fstatSync, lstatSync } from 'node:fs';
import { chmod, lstat, mkdir, mkdtemp, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { canonicalJson, manifestFingerprint, publishManifestAtomically, signManifest, verifyManifest } from '../preview-release-manifest.mjs';

const DIGEST = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const REQUIRED_FORBIDDEN = Object.freeze(['answerEvents', 'consumptions', 'invalidApplicationStates', 'invalidInterviewStates', 'invalidJobStates', 'invalidResumeStates', 'modelInvocations', 'nonCatalogAccounts', 'numericScores', 'paymentOrders', 'queuedOrRunningJobs', 'rawAnswerJobs']);
const CAPACITY_PROFILE = 'large-v1-successor';
const CAPACITY_DATASET_ID = 'preview-large-v1-successor';
const DEEP_USAGE_DATASET_ID = 'preview-deep-usage-v1';
const DEEP_USAGE_SCENARIO_ID = 'deep-usage-v1';
const DEEP_USAGE_PHASE = 'verified_online_projection';
const DEEP_USAGE_UNPROVEN = Object.freeze(['database_forbidden_counters', 'RLS_cross_owner_matrix', 'model_and_payment_side_effects']);
const DEEP_USAGE_SESSION_COUNT = 3;
const PATHS = Object.freeze({
  approval: '/etc/meetwise/full-stack-release.json',
  target: '/etc/meetwise/preview-synthetic-target.json',
  verification: `/var/lib/meetwise-preview-synthetic/${CAPACITY_DATASET_ID}/verification.json`,
  dbReceipt: `/var/lib/meetwise-preview-synthetic/${CAPACITY_DATASET_ID}/post-db-verification.json`,
  datasetManifest: `/var/lib/meetwise-preview-synthetic/${CAPACITY_DATASET_ID}/manifest.json`,
  maintenance: `/var/lib/meetwise-preview-synthetic/${CAPACITY_DATASET_ID}/maintenance.json`,
  deepUsage: `/var/lib/meetwise-preview-synthetic/${DEEP_USAGE_DATASET_ID}/scenario.json`,
  entitlement: '/var/lib/meetwise-preview-controller/preview-showcase-entitlement.json',
  privateKey: '/etc/meetwise/preview-release-ed25519.pem',
  publicKey: '/etc/meetwise/preview-release-ed25519.pub.pem',
  publicManifest: '/usr/share/meetwise-preview/preview-release-manifest.json',
  state: '/var/lib/meetwise-preview-controller/full-stack-publication.json',
  staging: '/var/lib/meetwise-preview-controller/full-stack-internal-staging.json',
  publicVerification: '/etc/meetwise/full-stack-public-verification.json',
  probeReceiptPublicKey: '/etc/meetwise/probe-receipt-ed25519.pub.pem',
  ledger: '/var/lib/meetwise-preview-controller/full-stack-release-ledger.json',
});
const CONTROLLER_LOCK = '/run/meetwise-preview-controller/controller.lock';

/**
 * The publication manifest is not the release transaction.  The former only
 * describes a public surface; this ledger describes every mutating step that
 * precedes it and survives a runner failure or an ECS reboot.  Keep this
 * state machine deliberately small and explicit: a command may only advance
 * one edge, with the caller's transaction token and expected phase bound to
 * the compare-and-swap.
 */
export const FULL_STACK_RELEASE_PHASES = Object.freeze([
  'preflighted', 'snapshotted', 'edge_closed', 'quiesced', 'migrating', 'migrated',
  'backend_ready', 'web_internal_ready', 'receipts_ready', 'probe_published',
  'edge_probing', 'confirmed_pending_pages', 'pages_enabled', 'committed',
  'rollback_pending', 'rolled_back', 'forward_only_maintenance',
]);

const FULL_STACK_PHASE_TRANSITIONS = Object.freeze({
  preflighted: new Set(['snapshotted', 'rollback_pending']),
  snapshotted: new Set(['edge_closed', 'rollback_pending']),
  edge_closed: new Set(['quiesced', 'rollback_pending']),
  quiesced: new Set(['migrating', 'rollback_pending']),
  migrating: new Set(['migrated', 'rollback_pending']),
  migrated: new Set(['backend_ready', 'rollback_pending']),
  backend_ready: new Set(['web_internal_ready', 'rollback_pending']),
  web_internal_ready: new Set(['receipts_ready', 'rollback_pending']),
  receipts_ready: new Set(['probe_published', 'rollback_pending']),
  probe_published: new Set(['edge_probing', 'rollback_pending']),
  edge_probing: new Set(['confirmed_pending_pages', 'rollback_pending']),
  confirmed_pending_pages: new Set(['pages_enabled', 'rollback_pending']),
  pages_enabled: new Set(['committed', 'rollback_pending']),
  rollback_pending: new Set(['rolled_back', 'forward_only_maintenance']),
  committed: new Set(),
  rolled_back: new Set(),
  forward_only_maintenance: new Set(),
});

const TRANSACTION_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const RELEASE_ID = /^[a-f0-9]{40}-fullstack-[0-9]{8}-[1-9][0-9]*-[1-9][0-9]*$/;
const TOKEN = /^[a-f0-9]{64}$/;

function assertTransactionShape(value) {
  if (!value || value.schemaVersion !== 1 || !TRANSACTION_ID.test(value.transactionId ?? '') || !RELEASE_ID.test(value.release ?? '') || !COMMIT.test(value.commit ?? '') || !COMMIT.test(value.tree ?? '') || !Number.isSafeInteger(value.generation) || value.generation < 1 || !FULL_STACK_RELEASE_PHASES.includes(value.phase) || !DIGEST.test(value.tokenDigest ?? '') || !Number.isFinite(Date.parse(value.updatedAt ?? ''))) throw new Error('full_stack_release_ledger_invalid');
  if (!['rollback_pre_migration', 'rollback_compatible', 'forward_only_maintenance'].includes(value.recoveryPolicy)) throw new Error('full_stack_release_recovery_policy_invalid');
  for (const [field, pattern] of [['controllerDigest', DIGEST], ['composeSpecDigest', DIGEST], ['sourceArchiveDigest', DIGEST], ['backendImageDigest', IMAGE_DIGEST], ['webImageDigest', IMAGE_DIGEST], ['schemaBefore', DIGEST], ['schemaAfter', DIGEST]]) {
    if (value[field] !== null && value[field] !== undefined && !pattern.test(value[field])) throw new Error(`full_stack_release_${field}_invalid`);
  }
  if (!Number.isSafeInteger(value.recoveryAttempts) || value.recoveryAttempts < 0 || (value.committedAt !== null && value.committedAt !== undefined && !Number.isFinite(Date.parse(value.committedAt)))) throw new Error('full_stack_release_recovery_metadata_invalid');
  for (const key of ['predecessor', 'candidate']) if (!value[key] || typeof value[key] !== 'object' || Array.isArray(value[key])) throw new Error(`full_stack_release_${key}_bundle_invalid`);
  return value;
}

export function createFullStackReleaseLedger({ transactionId, release, commit, tree, generation, token, controllerDigest = null, composeSpecDigest = null, sourceArchiveDigest = null, backendImageDigest = null, webImageDigest = null, schemaBefore = null, schemaAfter = null, predecessor = {}, candidate = {}, recoveryPolicy = 'rollback_pre_migration', now = new Date().toISOString() }) {
  if (!TRANSACTION_ID.test(transactionId ?? '') || !RELEASE_ID.test(release ?? '') || !COMMIT.test(commit ?? '') || !COMMIT.test(tree ?? '') || !Number.isSafeInteger(generation) || generation < 1 || !TOKEN.test(token ?? '')) throw new Error('full_stack_release_begin_argument_invalid');
  const ledger = {
    schemaVersion: 1, transactionId, release, commit, tree, generation, phase: 'preflighted', updatedAt: now,
    controllerDigest, composeSpecDigest, sourceArchiveDigest, backendImageDigest, webImageDigest, schemaBefore, schemaAfter,
    predecessor: { ...predecessor }, candidate: { ...candidate },
    recoveryPolicy, tokenDigest: sha256(token), lastErrorCode: null, recoveryAttempts: 0,
    committedAt: null,
  };
  return assertTransactionShape(ledger);
}

function assertLedgerIdentity(ledger, { transactionId, release, token }) {
  assertTransactionShape(ledger);
  if (ledger.transactionId !== transactionId || ledger.release !== release || !TOKEN.test(token ?? '') || ledger.tokenDigest !== sha256(token)) throw new Error('full_stack_release_token_mismatch');
}

function assertLedgerPatch(patch, mutableFields) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch) || Object.keys(patch).some((key) => !mutableFields.has(key))) throw new Error('full_stack_release_patch_invalid');
}

function patchMatchesLedger(ledger, patch) {
  return Object.entries(patch).every(([key, value]) => canonicalJson(ledger[key]) === canonicalJson(value));
}

export function transitionFullStackReleaseLedger(ledger, { transactionId, release, token, expectedPhase, nextPhase, patch = {}, now = new Date().toISOString() }) {
  assertLedgerIdentity(ledger, { transactionId, release, token });
  if (!FULL_STACK_RELEASE_PHASES.includes(nextPhase) || !FULL_STACK_RELEASE_PHASES.includes(expectedPhase)) throw new Error('full_stack_release_phase_invalid');
  const mutableFields = new Set(['schemaAfter', 'candidate', 'lastErrorCode', 'recoveryAttempts', 'committedAt']);
  assertLedgerPatch(patch, mutableFields);
  // Exact retries are safe: the successful result is returned without changing
  // the timestamp or any candidate facts. A retry with a different patch still
  // has to be made against the current phase and is rejected by the caller's
  // identity/receipt checks below.
  if (ledger.phase === nextPhase) {
    const isRetryOfImmediatePredecessor = FULL_STACK_RELEASE_PHASES.some((phase) => phase === expectedPhase && FULL_STACK_PHASE_TRANSITIONS[phase]?.has(nextPhase));
    if (isRetryOfImmediatePredecessor && patchMatchesLedger(ledger, patch)) return ledger;
    throw new Error('full_stack_release_phase_conflict');
  }
  if (ledger.phase !== expectedPhase) throw new Error('full_stack_release_phase_conflict');
  if (!FULL_STACK_PHASE_TRANSITIONS[expectedPhase]?.has(nextPhase)) throw new Error('full_stack_release_transition_invalid');
  const next = { ...ledger, ...patch, phase: nextPhase, updatedAt: now };
  if (nextPhase === 'committed') next.committedAt = now;
  return assertTransactionShape(next);
}

export function updateFullStackReleaseLedger(ledger, { transactionId, release, token, expectedPhase, patch = {}, now = new Date().toISOString() }) {
  assertLedgerIdentity(ledger, { transactionId, release, token });
  if (ledger.phase !== expectedPhase) throw new Error('full_stack_release_phase_conflict');
  const mutableFields = new Set(['schemaAfter', 'candidate', 'lastErrorCode', 'recoveryAttempts', 'committedAt']);
  const allowSchemaBefore = ledger.phase === 'quiesced' && ledger.schemaBefore === null;
  if (allowSchemaBefore) mutableFields.add('schemaBefore');
  assertLedgerPatch(patch, mutableFields);
  if (Object.hasOwn(patch, 'schemaBefore') && ledger.schemaBefore !== null) throw new Error('full_stack_release_schema_before_immutable');
  return assertTransactionShape({ ...ledger, ...patch, updatedAt: now });
}

export function decideFullStackReleaseRecovery(ledger) {
  assertTransactionShape(ledger);
  if (['committed', 'rolled_back', 'forward_only_maintenance'].includes(ledger.phase)) return { action: 'noop', phase: ledger.phase };
  if (ledger.phase === 'preflighted') return { action: 'discard_unmutated_transaction', phase: ledger.phase };
  if (ledger.phase === 'migrating') return { action: 'reprobe_migration', phase: ledger.phase };
  if (ledger.phase === 'rollback_pending') {
    if (ledger.lastErrorCode?.includes('forward_only') || ledger.recoveryPolicy === 'forward_only_maintenance') return { action: 'forward_only_maintenance', phase: ledger.phase };
    return { action: 'rollback_compatible', phase: ledger.phase };
  }
  if (['snapshotted', 'edge_closed', 'quiesced'].includes(ledger.phase) && ledger.recoveryPolicy === 'rollback_pre_migration') return { action: 'restore_pre_migration_snapshot', phase: ledger.phase };
  if (['migrated', 'backend_ready', 'web_internal_ready', 'receipts_ready', 'probe_published', 'edge_probing', 'confirmed_pending_pages', 'pages_enabled'].includes(ledger.phase) && (!ledger.schemaBefore || !ledger.schemaAfter)) return { action: 'forward_only_maintenance', phase: ledger.phase };
  if (['migrated', 'backend_ready', 'web_internal_ready', 'receipts_ready', 'probe_published', 'edge_probing', 'confirmed_pending_pages', 'pages_enabled'].includes(ledger.phase)
    && ledger.schemaBefore !== ledger.schemaAfter) return { action: 'forward_only_maintenance', phase: ledger.phase };
  if (ledger.recoveryPolicy === 'forward_only_maintenance') return { action: 'forward_only_maintenance', phase: ledger.phase };
  return { action: 'rollback_compatible', phase: ledger.phase };
}

export function canGarbageCollectFullStackRollback(ledger, pagesFingerprint) {
  assertTransactionShape(ledger);
  return ledger.phase === 'committed' && DIGEST.test(pagesFingerprint ?? '') && ledger.candidate?.pagesFingerprint === pagesFingerprint;
}

async function readFullStackReleaseLedger(path = PATHS.ledger) {
  try {
    const directory = path.replace(/\/[^/]+$/, '') || '/';
    const directoryStat = await lstat(directory);
    const protectedPath = path === PATHS.ledger || path.startsWith('/var/lib/meetwise-');
    if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink() || (protectedPath && (directoryStat.uid !== 0 || directoryStat.gid !== 0 || (directoryStat.mode & 0o777) !== 0o700))) throw new Error('full_stack_release_ledger_directory_invalid');
    const stat = await lstat(path);
    if (!stat.isFile() || stat.isSymbolicLink() || (protectedPath && (stat.uid !== 0 || stat.gid !== 0)) || (stat.mode & 0o777) !== 0o600) throw new Error('full_stack_release_ledger_permissions_invalid');
    return assertTransactionShape(JSON.parse(await readFile(path, 'utf8')));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function assertLedgerMutationLock(path) {
  if (path === PATHS.ledger || path.startsWith('/var/lib/meetwise-')) assertInheritedControllerLock();
}

async function ensureLedgerDirectory(path) {
  const directory = path.replace(/\/[^/]+$/, '') || '/';
  const protectedPath = path === PATHS.ledger || path.startsWith('/var/lib/meetwise-');
  try {
    const stat = await lstat(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink() || (protectedPath && (stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o700))) throw new Error('full_stack_release_ledger_directory_invalid');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const stat = await lstat(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink() || (protectedPath && (stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o700))) throw new Error('full_stack_release_ledger_directory_invalid');
  }
  return directory;
}

async function writeFullStackReleaseLedger(path, ledger) {
  assertTransactionShape(ledger);
  const directory = await ensureLedgerDirectory(path);
  const temporary = `${path}.tmp-${process.pid}-${randomBytes(8).toString('hex')}`;
  try {
    await writeFile(temporary, `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600 });
    const handle = await open(temporary, 'r');
    await handle.sync();
    await handle.close();
    await rename(temporary, path);
    await chmod(path, 0o600);
    const directoryHandle = await open(directory, 'r');
    await directoryHandle.sync();
    await directoryHandle.close();
  } finally {
    await rm(temporary, { force: true });
  }
  return ledger;
}

async function removeFullStackReleaseLedger(path) {
  const directory = path.replace(/\/[^/]+$/, '') || '/';
  try { await rm(path); } catch (error) { if (error?.code === 'ENOENT') return; throw error; }
  const directoryHandle = await open(directory, 'r');
  await directoryHandle.sync();
  await directoryHandle.close();
}

function parseLedgerCliArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]; const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error('full_stack_ledger_cli_argument_invalid');
    const normalized = key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    args[normalized] = value;
  }
  return args;
}

async function ledgerInitCli(args) {
  const path = args.path ?? PATHS.ledger;
  assertLedgerMutationLock(path);
  const existing = await readFullStackReleaseLedger(path);
  const requested = createFullStackReleaseLedger({
    transactionId: args.transactionId, release: args.release, commit: args.commit, tree: args.tree,
    generation: Number(args.generation), token: args.token, controllerDigest: args.controllerDigest ?? null,
    composeSpecDigest: args.composeSpecDigest ?? null, sourceArchiveDigest: args.sourceArchiveDigest ?? null, backendImageDigest: args.backendImageDigest ?? null,
    webImageDigest: args.webImageDigest ?? null, schemaBefore: args.schemaBefore ?? null,
    schemaAfter: args.schemaAfter ?? null, predecessor: args.predecessorJson ? JSON.parse(args.predecessorJson) : {},
    candidate: args.candidateJson ? JSON.parse(args.candidateJson) : {}, recoveryPolicy: args.recoveryPolicy ?? 'rollback_pre_migration',
  });
  if (existing) {
    assertLedgerIdentity(existing, { transactionId: requested.transactionId, release: requested.release, token: args.token });
    const immutableFields = ['commit', 'tree', 'generation', 'controllerDigest', 'composeSpecDigest', 'sourceArchiveDigest', 'backendImageDigest', 'webImageDigest', 'schemaBefore', 'schemaAfter', 'recoveryPolicy'];
    if (immutableFields.some((field) => existing[field] !== requested[field]) || sha256(existing.predecessor) !== sha256(requested.predecessor)) throw new Error('full_stack_release_existing_identity_conflict');
    process.stdout.write(`${JSON.stringify(existing)}\n`); return;
  }
  await writeFullStackReleaseLedger(path, requested);
  process.stdout.write(`${JSON.stringify(requested)}\n`);
}

async function ledgerTransitionCli(args) {
  const path = args.path ?? PATHS.ledger;
  assertLedgerMutationLock(path);
  const current = await readFullStackReleaseLedger(path);
  if (!current) throw new Error('full_stack_release_ledger_missing');
  const next = transitionFullStackReleaseLedger(current, {
    transactionId: args.transactionId, release: args.release, token: args.token,
    expectedPhase: args.expectedPhase, nextPhase: args.nextPhase,
    patch: args.patchJson ? JSON.parse(args.patchJson) : {},
  });
  if (next !== current) await writeFullStackReleaseLedger(path, next);
  process.stdout.write(`${JSON.stringify(next)}\n`);
}

async function ledgerUpdateCli(args) {
  const path = args.path ?? PATHS.ledger;
  assertLedgerMutationLock(path);
  const current = await readFullStackReleaseLedger(path);
  if (!current) throw new Error('full_stack_release_ledger_missing');
  const next = updateFullStackReleaseLedger(current, {
    transactionId: args.transactionId, release: args.release, token: args.token,
    expectedPhase: args.expectedPhase, patch: args.patchJson ? JSON.parse(args.patchJson) : {},
  });
  if (next !== current) await writeFullStackReleaseLedger(path, next);
  process.stdout.write(`${JSON.stringify(next)}\n`);
}

async function ledgerRecoverCli(args) {
  const path = args.path ?? PATHS.ledger;
  assertLedgerMutationLock(path);
  const current = await readFullStackReleaseLedger(path);
  if (!current) { process.stdout.write('{"action":"no_ledger"}\n'); return; }
  assertLedgerIdentity(current, { transactionId: args.transactionId, release: args.release, token: args.token });
  const decision = decideFullStackReleaseRecovery(current);
  if (decision.action === 'reprobe_migration') { process.stdout.write(`${JSON.stringify(decision)}\n`); return; }
  if (current.phase === 'rollback_pending') {
    process.stdout.write(`${JSON.stringify(decision)}\n`); return;
  }
  if (decision.action === 'discard_unmutated_transaction') {
    await removeFullStackReleaseLedger(path);
    process.stdout.write(`${JSON.stringify(decision)}\n`); return;
  }
  if (decision.action === 'forward_only_maintenance') {
    const next = transitionFullStackReleaseLedger(current, { transactionId: args.transactionId, release: args.release, token: args.token, expectedPhase: current.phase, nextPhase: 'rollback_pending', patch: { recoveryAttempts: current.recoveryAttempts + 1, lastErrorCode: 'reboot_recovery_forward_only' } });
    await writeFullStackReleaseLedger(path, next);
    process.stdout.write(`${JSON.stringify({ ...decision, phase: next.phase })}\n`); return;
  }
  const next = transitionFullStackReleaseLedger(current, { transactionId: args.transactionId, release: args.release, token: args.token, expectedPhase: current.phase, nextPhase: 'rollback_pending', patch: { recoveryAttempts: current.recoveryAttempts + 1, lastErrorCode: 'reboot_recovery_rollback_pending' } });
  await writeFullStackReleaseLedger(path, next);
  process.stdout.write(`${JSON.stringify({ ...decision, phase: next.phase })}\n`);
}

function trustedLedgerTransition(ledger, { expectedPhase, nextPhase, patch = {}, now = new Date().toISOString() }) {
  assertTransactionShape(ledger);
  const mutableFields = new Set(['schemaAfter', 'candidate', 'lastErrorCode', 'recoveryAttempts', 'committedAt']);
  assertLedgerPatch(patch, mutableFields);
  if (ledger.phase === nextPhase) {
    if (FULL_STACK_PHASE_TRANSITIONS[expectedPhase]?.has(nextPhase) && patchMatchesLedger(ledger, patch)) return ledger;
    throw new Error('full_stack_release_phase_conflict');
  }
  if (ledger.phase !== expectedPhase || !FULL_STACK_PHASE_TRANSITIONS[expectedPhase]?.has(nextPhase)) throw new Error('full_stack_release_phase_conflict');
  const next = { ...ledger, ...patch, phase: nextPhase, updatedAt: now };
  if (nextPhase === 'committed') next.committedAt = now;
  return assertTransactionShape(next);
}

async function ledgerRecoverSystemCli(args) {
  if (process.getuid?.() !== 0) throw new Error('full_stack_system_recovery_requires_root');
  const path = args.path ?? PATHS.ledger;
  if (path !== PATHS.ledger) throw new Error('full_stack_system_recovery_path_invalid');
  assertLedgerMutationLock(path);
  const current = await readFullStackReleaseLedger(path);
  if (!current) { process.stdout.write('{"action":"no_ledger"}\n'); return; }
  const decision = decideFullStackReleaseRecovery(current);
  if (decision.action === 'reprobe_migration') { process.stdout.write(`${JSON.stringify(decision)}\n`); return; }
  if (decision.action === 'discard_unmutated_transaction') {
    await removeFullStackReleaseLedger(path);
    process.stdout.write(`${JSON.stringify(decision)}\n`); return;
  }
  if (['noop'].includes(decision.action)) { process.stdout.write(`${JSON.stringify(decision)}\n`); return; }
  if (current.phase === 'rollback_pending') { process.stdout.write(`${JSON.stringify(decision)}\n`); return; }
  const next = trustedLedgerTransition(current, { expectedPhase: current.phase, nextPhase: 'rollback_pending', patch: { recoveryAttempts: current.recoveryAttempts + 1, lastErrorCode: `system_recovery_${decision.action}` } });
  await writeFullStackReleaseLedger(path, next);
  process.stdout.write(`${JSON.stringify({ ...decision, phase: next.phase })}\n`);
}

async function ledgerSystemTransitionCli(args) {
  if (process.getuid?.() !== 0) throw new Error('full_stack_system_recovery_requires_root');
  const path = args.path ?? PATHS.ledger;
  if (path !== PATHS.ledger) throw new Error('full_stack_system_recovery_path_invalid');
  assertLedgerMutationLock(path);
  const current = await readFullStackReleaseLedger(path);
  if (!current) throw new Error('full_stack_release_ledger_missing');
  const next = trustedLedgerTransition(current, { expectedPhase: args.expectedPhase, nextPhase: args.nextPhase, patch: args.patchJson ? JSON.parse(args.patchJson) : {} });
  if (next !== current) await writeFullStackReleaseLedger(path, next);
  process.stdout.write(`${JSON.stringify(next)}\n`);
}

// Docker Compose 单机：app 层（api/worker/web）由容器启动/停止，控制面（funnel/manifest/nonce）
// 仍由本 publisher 管。--project-directory 让 compose 在 /srv/meetwise-compose 自动加载 .env
// （含 ${...:?...} 云凭据）；-f 必须用绝对路径 —— docker compose 的 -f 相对 CWD 解析而非
// project-directory，publisher 以 root 跑时 CWD 不定，相对路径会解析到 /docker/compose.prod.yml。
const COMPOSE = Object.freeze({ directory: '/srv/meetwise-compose', file: '/srv/meetwise-compose/docker/compose.prod.yml' });
const runCompose = (args, opts = {}) => promisify(execFile)('/usr/bin/docker', ['compose', '--project-directory', COMPOSE.directory, '-f', COMPOSE.file, ...args], { maxBuffer: 100_000, ...opts });

const sha256 = (value) => createHash('sha256').update(typeof value === 'string' || value instanceof Uint8Array ? value : canonicalJson(value)).digest('hex');

function without(object, key) { const copy = { ...object }; delete copy[key]; return copy; }

const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/;
const COMPOSE_IMAGES = Object.freeze(['backend', 'web']);

// compose 单机：runtime 身份从「源码树摘要」换成「容器镜像摘要」。backend 镜像被 migrate/api/worker
// 三服务共用（同一 Dockerfile、不同 command），web 是 apps/web/Dockerfile 的独立镜像，故是两个镜像。
// 为什么按 @sha256 内容摘要标识、而非 tag：tag（含 latest）可变会漂移，只有 @sha256 与 CI 构建产物
// 一一对应；若 .env 只给 tag，下面的 config 校验会暴露无 @sha256 的引用从而 fail-closed。
function runtimeImageDigest(approval) {
  const images = approval?.images;
  if (!images || JSON.stringify(Object.keys(images).sort()) !== JSON.stringify([...COMPOSE_IMAGES]) || Object.values(images).some((value) => !IMAGE_DIGEST.test(value))) throw new Error('full_stack_images_invalid');
  return sha256(images);
}

// publish 前验证 compose 配置里 migrate/api/worker/web 的镜像引用都按 @sha256 钉死，且摘要 == approval.images。
// 这保证 manifest 声称的 runtime（sha256(images)）与实际 `docker compose up` 将运行的镜像逐字一致。
// 为什么读 `config` 而非 inspect 运行中容器：publish 时 web 尚未启动，config 是唯一同时覆盖四服务的静态事实。
async function assertComposeImageBinding(approval) {
  runtimeImageDigest(approval);
  const { stdout } = await runCompose(['config', '--format', 'json'], { maxBuffer: 5_000_000 });
  const config = JSON.parse(stdout);
  const digestOf = (ref) => (typeof ref === 'string' && ref.includes('@sha256:') ? ref.slice(ref.lastIndexOf('@sha256:') + 1) : null);
  for (const service of ['migrate', 'api', 'worker']) if (digestOf(config?.services?.[service]?.image) !== approval.images.backend) throw new Error('full_stack_current_release_mismatch');
  if (digestOf(config?.services?.web?.image) !== approval.images.web) throw new Error('full_stack_current_release_mismatch');
}

function assertInheritedControllerLock() {
  if (process.env.MEETWISE_FULL_STACK_PUBLICATION_LOCK_FD !== '9') throw new Error('full_stack_controller_lock_required');
  const path = lstatSync(CONTROLLER_LOCK); const fd = fstatSync(9);
  if (!path.isFile() || path.isSymbolicLink() || path.uid !== 0 || path.gid !== 0 || (path.mode & 0o777) !== 0o600 || path.dev !== fd.dev || path.ino !== fd.ino) throw new Error('full_stack_controller_lock_invalid');
}

export function surfaceReceipt(rootHtml, loginHtml) {
  const root = { status: 200, bytes: Buffer.byteLength(rootHtml), sha256: sha256(rootHtml) };
  const login = { status: 200, bytes: Buffer.byteLength(loginHtml), sha256: sha256(loginHtml) };
  return { root, login, digest: sha256({ root, login }) };
}

function assertDeepUsageReceipt(receipt) {
  if (!receipt || receipt.schemaVersion !== 1 || receipt.receiptLayer !== 'deep-usage' || receipt.datasetId !== DEEP_USAGE_DATASET_ID || receipt.scenarioId !== DEEP_USAGE_SCENARIO_ID || receipt.predecessorCapacityDatasetId !== CAPACITY_DATASET_ID || !DIGEST.test(receipt.targetDigest ?? '') || !/^[A-Za-z0-9._:@+/=-]{1,256}$/.test(receipt.releaseIdentity ?? '') || receipt.phase !== DEEP_USAGE_PHASE || receipt.sessionCount !== DEEP_USAGE_SESSION_COUNT || !Array.isArray(receipt.unproven) || JSON.stringify(receipt.unproven) !== JSON.stringify(DEEP_USAGE_UNPROVEN) || !DIGEST.test(receipt.receiptDigest ?? '')) throw new Error('full_stack_deep_usage_receipt_invalid');
  const observations = receipt.observations;
  if (!observations || !Array.isArray(observations.sessions) || observations.sessions.length !== DEEP_USAGE_SESSION_COUNT || observations.sessions.some((session) => !session || typeof session !== 'object' || typeof session.slot !== 'string' || typeof session.applicationId !== 'string' || session.applicationId.length === 0 || typeof session.interviewId !== 'string' || !Number.isSafeInteger(session.issuedTurns) || !Number.isSafeInteger(session.answeredTurns) || session.issuedTurns < session.answeredTurns || session.answeredTurns < 3 || typeof session.phase !== 'string')) throw new Error('full_stack_deep_usage_observations_invalid');
  const interviewIds = observations.sessions.map((session) => session.interviewId);
  const applicationIds = observations.sessions.map((session) => session.applicationId);
  if (new Set(interviewIds).size !== DEEP_USAGE_SESSION_COUNT || new Set(applicationIds).size !== DEEP_USAGE_SESSION_COUNT || !Number.isSafeInteger(observations.recruiterTalentCount) || observations.recruiterTalentCount < 1 || !Array.isArray(observations.recruiterStatuses) || observations.recruiterStatuses.length === 0) throw new Error('full_stack_deep_usage_observations_invalid');
  const { receiptDigest, unproven, ...unsigned } = receipt;
  if (sha256(JSON.stringify(unsigned)) !== receiptDigest) throw new Error('full_stack_deep_usage_receipt_digest_invalid');
  return receipt;
}

function assertEntitlementReceipt(receipt, { targetDigest, releaseIdentity, now }) {
  if (!receipt || receipt.schemaVersion !== 1 || receipt.receiptKind !== 'preview-showcase-entitlement' || receipt.phase !== 'granted' || !['create', 'replayed'].includes(receipt.operation) || receipt.ownerEmail !== 'previewc@meetwise.com' || receipt.ownerRole !== 'candidate' || receipt.kind !== 'gift' || receipt.unitsTotal !== 6 || !Number.isFinite(receipt.unitsReserved) || !Number.isFinite(receipt.unitsConsumed) || !Number.isFinite(receipt.unitsAvailable) || receipt.unitsReserved < 0 || receipt.unitsConsumed < 0 || receipt.unitsAvailable < 3 || receipt.unitsReserved + receipt.unitsConsumed + receipt.unitsAvailable !== receipt.unitsTotal || !/^\d{4}-\d{2}-\d{2}$/.test(receipt.grantEpoch ?? '') || receipt.sourceOrderId !== `preview-showcase-gift:v2:${receipt.grantEpoch}:previewc@meetwise.com` || receipt.paymentOrderTouched !== false || receipt.targetDigest !== targetDigest || receipt.releaseIdentity !== releaseIdentity || !DIGEST.test(receipt.receiptDigest ?? '')) throw new Error('full_stack_entitlement_receipt_invalid');
  const verifiedAt = Date.parse(receipt.verifiedAt ?? ''); const expiresAt = Date.parse(receipt.expiresAt ?? '');
  if (!Number.isFinite(verifiedAt) || !Number.isFinite(expiresAt) || verifiedAt > now + 30_000 || expiresAt <= now) throw new Error('full_stack_entitlement_receipt_stale');
  const { receiptDigest, ...unsigned } = receipt;
  if (sha256(unsigned) !== receiptDigest) throw new Error('full_stack_entitlement_receipt_digest_invalid');
  return receipt;
}

function assertDeepUsageState(state) {
  if (!state || state.schemaVersion !== 1 || state.receiptLayer !== 'deep-usage' || state.datasetId !== DEEP_USAGE_DATASET_ID || state.scenarioId !== DEEP_USAGE_SCENARIO_ID || state.predecessorCapacityDatasetId !== CAPACITY_DATASET_ID || !DIGEST.test(state.targetDigest ?? '') || typeof state.releaseIdentity !== 'string' || state.phase !== DEEP_USAGE_PHASE || state.sessionCount !== DEEP_USAGE_SESSION_COUNT || !Array.isArray(state.sessions) || state.sessions.length !== DEEP_USAGE_SESSION_COUNT || state.receiptDigest === null || !state.deepUsageReceipt) throw new Error('full_stack_deep_usage_state_invalid');
  const receipt = assertDeepUsageReceipt(state.deepUsageReceipt);
  if (state.receiptDigest !== receipt.receiptDigest || state.targetDigest !== receipt.targetDigest || state.releaseIdentity !== receipt.releaseIdentity || state.observations === null || state.observations === undefined) throw new Error('full_stack_deep_usage_state_invalid');
  if (sha256(state.observations) !== sha256(receipt.observations)) throw new Error('full_stack_deep_usage_state_observations_invalid');
  const observedBySlot = new Map(receipt.observations.sessions.map((session) => [session.slot, session]));
  if (state.sessions.some((session) => !session || typeof session !== 'object' || typeof session.slot !== 'string' || typeof session.interviewId !== 'string' || typeof session.phase !== 'string' || !Number.isSafeInteger(session.appliedTurns) || session.appliedTurns < 3 || !observedBySlot.has(session.slot) || observedBySlot.get(session.slot).interviewId !== session.interviewId || observedBySlot.get(session.slot).phase !== session.phase || observedBySlot.get(session.slot).answeredTurns < session.appliedTurns)) throw new Error('full_stack_deep_usage_state_sessions_invalid');
  return receipt;
}

function deepUsageCompositionDigest(verification, deepUsageReceipt, entitlementReceipt) {
  return sha256({
    schemaVersion: 1,
    capacity: { receiptLayer: 'capacity', profile: CAPACITY_PROFILE, datasetId: CAPACITY_DATASET_ID, verificationDigest: verification.verificationDigest, dbReceiptDigest: verification.dbReceiptDigest },
    deepUsage: { receiptLayer: 'deep-usage', datasetId: DEEP_USAGE_DATASET_ID, scenarioId: DEEP_USAGE_SCENARIO_ID, predecessorCapacityDatasetId: CAPACITY_DATASET_ID, targetDigest: deepUsageReceipt.targetDigest, releaseIdentity: deepUsageReceipt.releaseIdentity, receiptDigest: deepUsageReceipt.receiptDigest },
    entitlement: { receiptKind: 'preview-showcase-entitlement', receiptDigest: entitlementReceipt.receiptDigest },
  });
}

function assertReceiptComposition(composition, verification, deepUsageReceipt, entitlementReceipt) {
  const expected = { schemaVersion: 1, capacity: verification.verificationDigest, deepUsage: deepUsageReceipt.receiptDigest, entitlement: entitlementReceipt.receiptDigest, digest: deepUsageCompositionDigest(verification, deepUsageReceipt, entitlementReceipt) };
  if (!composition || composition.schemaVersion !== expected.schemaVersion || composition.capacity !== expected.capacity || composition.deepUsage !== expected.deepUsage || composition.entitlement !== expected.entitlement || composition.digest !== expected.digest || !DIGEST.test(composition.digest)) throw new Error('full_stack_receipt_composition_invalid');
  return expected;
}

export function composeFullStackManifest({ approval, target, verification, dbReceipt, datasetManifest, maintenance, deepUsage, entitlement, rootHtml, loginHtml, privateKey, now = Date.now() }) {
  if (approval?.schemaVersion !== 1 || !Number.isSafeInteger(approval.generation) || approval.generation < 1 || approval.mode !== 'public-full-stack' || !COMMIT.test(approval.commit ?? '') || !COMMIT.test(approval.tree ?? '') || !DIGEST.test(approval.webBuildSha256 ?? '') || !DIGEST.test(approval.staticAssetsSha256 ?? '')) throw new Error('full_stack_approval_invalid');
  const runtime = runtimeImageDigest(approval);
  const targetDigest = sha256(target);
  const profile = target.approvedProfiles?.[CAPACITY_PROFILE];
  if (!profile || profile.datasetId !== CAPACITY_DATASET_ID || profile.successorOf !== 'large-v1' || !DIGEST.test(profile.catalogDigest ?? '') || !DIGEST.test(target.factoryDigest ?? '') || target.database !== 'meetwise_cloud_test' || target.expectedDbRole !== 'meetwise_preview_audit') throw new Error('full_stack_target_profile_invalid');
  if (approval.releasePath !== target.releasePath || approval.releaseTreeDigest !== target.releaseTreeDigest || approval.apiContractDigest !== target.apiContractDigest || approval.targetDigest !== targetDigest) throw new Error('full_stack_target_binding_invalid');
  if (verification?.schemaVersion !== 2 || verification.receiptLayer !== 'capacity' || verification.profile !== CAPACITY_PROFILE || verification.datasetId !== profile.datasetId || verification.catalogDigest !== profile.catalogDigest || verification.targetDigest !== targetDigest || !DIGEST.test(verification.loadReceiptDigest ?? '') || !DIGEST.test(verification.verificationDigest ?? '') || sha256(without(verification, 'verificationDigest')) !== verification.verificationDigest) throw new Error('full_stack_synthetic_receipt_invalid');
  if (dbReceipt?.schemaVersion !== 1 || dbReceipt.receiptLayer !== 'capacity' || dbReceipt.phase !== 'post' || dbReceipt.status !== 'verified' || dbReceipt.datasetId !== profile.datasetId || dbReceipt.profile !== CAPACITY_PROFILE || dbReceipt.targetDigest !== targetDigest || !DIGEST.test(dbReceipt.receiptDigest ?? '') || sha256(without(dbReceipt, 'receiptDigest')) !== dbReceipt.receiptDigest || verification.dbReceiptDigest !== dbReceipt.receiptDigest) throw new Error('full_stack_database_receipt_invalid');
  if (dbReceipt.releasePath !== target.releasePath || dbReceipt.releaseTreeDigest !== target.releaseTreeDigest || dbReceipt.apiContractDigest !== target.apiContractDigest || dbReceipt.schemaLedgerDigest !== target.schemaLedgerDigest || `${dbReceipt.schemaHead}.sql` !== target.schemaHead) throw new Error('full_stack_database_target_invalid');
  if (dbReceipt.catalogDigest !== profile.catalogDigest || dbReceipt.factoryDigest !== target.factoryDigest || dbReceipt.identity?.database !== target.database || dbReceipt.identity?.role !== target.expectedDbRole || dbReceipt.identity?.endpoint !== target.rdsEndpoint || dbReceipt.identity?.port !== target.rdsPort || dbReceipt.identity?.tlsServername !== target.tlsServername) throw new Error('full_stack_database_identity_invalid');
  const deepUsageReceipt = assertDeepUsageState(deepUsage);
  if (deepUsageReceipt.targetDigest !== targetDigest || deepUsageReceipt.releaseIdentity !== `${approval.commit}:${approval.tree}`) throw new Error('full_stack_deep_usage_release_binding_invalid');
  const capacityCounts = dbReceipt.attestationMode === 'capacity_with_fixed_deep_overlay' ? dbReceipt.capacityCounts : dbReceipt.counts;
  if (dbReceipt.attestationMode === 'capacity_with_fixed_deep_overlay') {
    const overlay = dbReceipt.allowedOverlay;
    const limits = { interviews: 500, applicationExceptions: 500, modelInvocations: 10000, consumptions: 500, answerEvents: 10000 };
    const deepInterviewIds = deepUsageReceipt.observations.sessions.map((session) => session.interviewId).sort();
    const deepApplicationIds = deepUsageReceipt.observations.sessions.map((session) => session.applicationId).sort();
    if (overlay?.schemaVersion !== 1 || overlay.scope !== 'fixed-preview-candidate' || typeof overlay.ownerUserId !== 'string' || !/^[a-f0-9]{64}$/.test(overlay.deepUsageReceiptDigest ?? '') || !Array.isArray(overlay.interviewIds) || JSON.stringify([...overlay.interviewIds].sort()) !== JSON.stringify(deepInterviewIds) || !Array.isArray(overlay.applicationIds) || JSON.stringify([...overlay.applicationIds].sort()) !== JSON.stringify(deepApplicationIds) || JSON.stringify(overlay.limits) !== JSON.stringify(limits) || Object.entries(limits).some(([key, limit]) => !Number.isSafeInteger(overlay[key]) || overlay[key] < (key === 'interviews' ? 3 : 0) || overlay[key] > limit)) throw new Error('full_stack_database_overlay_invalid');
    if (verification.observations?.fixedDeepOverlay?.ownerUserId !== overlay.ownerUserId || verification.observations.fixedDeepOverlay.interviews !== overlay.interviews || verification.rawObservations?.interviews - verification.observations?.interviews !== overlay.interviews) throw new Error('full_stack_api_overlay_invalid');
  }
  if (Object.entries(profile.expectedCumulative ?? {}).some(([key, value]) => capacityCounts?.[key] !== value) || verification.observations?.numericScores !== 0 || verification.observations?.accounts !== profile.expectedCumulative.accounts || verification.observations?.jobs !== profile.expectedCumulative.jobs || verification.observations?.applications !== profile.expectedCumulative.applications || verification.observations?.resumes !== profile.expectedCumulative.resumes || verification.observations?.interviews !== profile.expectedCumulative.interviews) throw new Error('full_stack_count_mismatch');
  const verifiedAt = Date.parse(verification.verifiedAt ?? ''); const dbVerifiedAt = Date.parse(dbReceipt.verifiedAt ?? '');
  if (![verifiedAt, dbVerifiedAt].every(Number.isFinite) || verifiedAt > now + 30_000 || dbVerifiedAt > now + 30_000 || now - verifiedAt > 24 * 60 * 60 * 1000 || now - dbVerifiedAt > 24 * 60 * 60 * 1000) throw new Error('full_stack_receipt_stale');
  if (JSON.stringify(Object.keys(dbReceipt.forbidden ?? {}).sort()) !== JSON.stringify([...REQUIRED_FORBIDDEN]) || Object.values(dbReceipt.forbidden).some((value) => value !== 0)) throw new Error('full_stack_forbidden_side_effect');
  if (datasetManifest?.schemaVersion !== 2 || datasetManifest.datasetId !== profile.datasetId || datasetManifest.status !== 'ready' || datasetManifest.targetDigest !== targetDigest || datasetManifest.catalogDigest !== profile.catalogDigest || datasetManifest.loadReceiptDigest !== verification.loadReceiptDigest || datasetManifest.verificationDigest !== verification.verificationDigest || !Number.isFinite(Date.parse(datasetManifest.completedAt ?? '')) || ['accounts', 'jobs', 'applications', 'resumes', 'interviews'].some((key) => !Number.isSafeInteger(datasetManifest.counts?.[key]) || datasetManifest.counts[key] < 0)) throw new Error('full_stack_dataset_not_ready');
  if (maintenance?.schemaVersion !== 1 || maintenance.status !== 'restored' || maintenance.targetDigest !== targetDigest || maintenance.datasetId !== verification.datasetId || maintenance.catalogDigest !== profile.catalogDigest || !Number.isFinite(Date.parse(maintenance.restoredAt ?? '')) || maintenance.nginxWasActive !== true || maintenance.workerWasActive !== true) throw new Error('full_stack_maintenance_not_restored');
  const entitlementReceipt = assertEntitlementReceipt(entitlement, { targetDigest, releaseIdentity: `${approval.commit}:${approval.tree}`, now });
  const receiptComposition = { schemaVersion: 1, capacity: verification.verificationDigest, deepUsage: deepUsageReceipt.receiptDigest, entitlement: entitlementReceipt.receiptDigest, digest: deepUsageCompositionDigest(verification, deepUsageReceipt, entitlementReceipt) };
  if (!rootHtml.includes('Meetwise 知面') || !rootHtml.includes('href="/login"') || !loginHtml.includes('name="email"') || !loginHtml.includes('name="password"') || !loginHtml.includes('登录 / 注册')) throw new Error('full_stack_surface_invalid');
  const surface = surfaceReceipt(rootHtml, loginHtml);
  return signManifest({
    schemaVersion: 1, status: 'verified', generation: approval.generation, releaseDigest: approval.releaseDigest, commit: approval.commit, tree: approval.tree,
    webBuildSha256: approval.webBuildSha256, staticAssetsSha256: approval.staticAssetsSha256, origin: approval.origin,
    mode: 'public-full-stack-probe', issuedAt: new Date(now).toISOString(), expiresAt: new Date(now + 13 * 24 * 60 * 60 * 1000).toISOString(), revoked: false,
    receipts: { runtime, synthetic: verification.verificationDigest, database: dbReceipt.receiptDigest, edge: surface.root.sha256, blackbox: surface.digest },
    receiptComposition,
    signingKeyId: 'ecs-preview-ed25519-v1',
  }, privateKey);
}

async function rootJson(path, mode) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== mode) throw new Error(`unsafe_root_file:${path}`);
  return JSON.parse(await readFile(path, 'utf8'));
}

// P0-1 降权：目标档与合成回执改由 meetwise-synthetic（uid/gid 2001）读/写，所有权/权限模型
// 从「root:root 0600」放宽为「root 或 meetwise-synthetic 拥有、无组/他人写位、0600|0640」。
// 只用于目标档（0640 root:meetwise-synthetic）与 verification/dbReceipt/manifest/maintenance
// 回执（0600 meetwise-synthetic）。审批档/签名私钥/发布状态档仍走 rootJson/rootText（root:root
// 0600），绝不本函数放行——否则合成账号可伪造门控档让 publisher 签假 manifest。
const SYNTHETIC_UID = 2001;
const SYNTHETIC_GID = 2001;
const trustedOwner = (uid, gid) => (uid === 0 && (gid === 0 || gid === SYNTHETIC_GID)) || (uid === SYNTHETIC_UID && gid === SYNTHETIC_GID);
// fd 化防 TOCTOU：这 5 份档里的 4 份合成回执落在 /var/lib/meetwise-preview-synthetic/... 这个
// synthetic 独占（0700）目录，合成账号本就是其写者。若用「lstat 路径 → 再 readFile 路径」两段式，
// 被入侵的合成账号可在两次 syscall 之间把回执换成符号链接指向任意文件，诱使 root publisher 读到
// 非预期目标。故改为 open(O_NOFOLLOW) 一次拿 fd（符号链接直接 ELOOP 拒绝）→ 对同一 fd fstat 校验
// 属主/模式 → 从同一 fd 读，全程锚定同一 inode，杜绝路径级 TOCTOU（与本文件 fstatSync(9) 锁校验同风格）。
async function syntheticOwnedJson(path) {
  const handle = await open(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    const permissions = stat.mode & 0o777;
    if (!stat.isFile() || !trustedOwner(stat.uid, stat.gid) || (permissions !== 0o600 && permissions !== 0o640)) throw new Error(`unsafe_synthetic_file:${path}`);
    return JSON.parse(await handle.readFile('utf8'));
  } finally {
    await handle.close();
  }
}

async function rootText(path, mode) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== mode) throw new Error(`unsafe_root_file:${path}`);
  return readFile(path, 'utf8');
}

async function boundedSurface(origin, path) {
  const host = new URL(origin).host;
  const { stdout } = await promisify(execFile)('/usr/bin/curl', ['--fail', '--silent', '--show-error', '--max-time', '20', '--max-filesize', '2000000', '-H', `Host: ${host}`, `http://127.0.0.1${path}`], { maxBuffer: 2_000_000 });
  return stdout;
}

async function optionalRootJson(path, mode) {
  try { return await rootJson(path, mode); } catch (error) { if (error?.code === 'ENOENT') return null; throw error; }
}

async function assertTrustedLedgerGeneration(generation) {
  const ledger = await rootJson(PATHS.ledger, 0o600);
  if (ledger.schemaVersion !== 1 || !Number.isSafeInteger(ledger.generation) || ledger.generation < 1 || ledger.generation !== generation || !['receipts_ready', 'probe_published', 'edge_probing', 'confirmed_pending_pages', 'pages_enabled', 'committed'].includes(ledger.phase)) throw new Error('full_stack_trusted_generation_mismatch');
  return ledger;
}

async function durableJson(path, value, mode) {
  const scratch = await mkdtemp('/run/meetwise-full-stack-publication.');
  try {
    const temporary = `${scratch}/record.json`;
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
    await publishManifestAtomically(temporary, path, mode);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}

function committedState(status, manifest, generation, timestampKey) {
  return { schemaVersion: 2, generation, status, manifestSha256: manifestFingerprint(manifest), releaseDigest: manifest.releaseDigest, [timestampKey]: new Date().toISOString() };
}

function pendingState(status, manifest, generation) {
  return { ...committedState(status, manifest, generation, status === 'publishing' ? 'publishingAt' : 'revokingAt'), pendingManifest: manifest };
}

function assertManifestBinding(manifest, approval, target, verification, dbReceipt, deepUsage, entitlement, modes = ['public-full-stack-probe', 'public-full-stack']) {
  const deepUsageReceipt = assertDeepUsageState(deepUsage);
  const entitlementReceipt = assertEntitlementReceipt(entitlement, { targetDigest: approval.targetDigest, releaseIdentity: `${approval.commit}:${approval.tree}`, now: Date.now() });
  if (!modes.includes(manifest.mode) || !Number.isSafeInteger(manifest.generation) || manifest.generation < 1 || manifest.generation !== approval.generation || manifest.releaseDigest !== approval.releaseDigest || manifest.commit !== approval.commit || manifest.tree !== approval.tree || manifest.origin !== approval.origin || manifest.receipts?.runtime !== runtimeImageDigest(approval) || manifest.receipts?.synthetic !== verification.verificationDigest || manifest.receipts?.database !== dbReceipt.receiptDigest) throw new Error('full_stack_existing_manifest_binding_invalid');
  assertReceiptComposition(manifest.receiptComposition, verification, deepUsageReceipt, entitlementReceipt);
}

async function stage() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_stage_requires_root');
  assertInheritedControllerLock();
  // Stage is intentionally receipt-blind.  Receipt files are produced only
  // after the candidate is quiesced/migrated and the internal Web is ready;
  // reading them here would let a stale predecessor receipt authorize a new
  // release before its data gate has run.
  const [approval, target, publicKey, state, manifest] = await Promise.all([
    rootJson(PATHS.approval, 0o600), syntheticOwnedJson(PATHS.target), rootText(PATHS.publicKey, 0o644), optionalRootJson(PATHS.state, 0o600), optionalRootJson(PATHS.publicManifest, 0o644),
  ]);
  if (approval?.schemaVersion !== 1 || !Number.isSafeInteger(approval.generation) || approval.generation < 1 || approval.mode !== 'public-full-stack' || approval.targetDigest !== sha256(target)) throw new Error('full_stack_stage_approval_invalid');
  await assertTrustedLedgerGeneration(approval.generation);
  await promisify(execFile)('/usr/local/sbin/full-stack-preview-funnel-close', [], { maxBuffer: 100_000 });
  let predecessorStatus = null; let predecessorGeneration = null; let predecessorManifestSha256 = null;
  if (state === null) {
    if (manifest) {
      verifyManifest(manifest, publicKey, { allowExpired: true });
      if (!Number.isSafeInteger(manifest.generation) || manifest.generation !== approval.generation || manifest.releaseDigest !== approval.releaseDigest || manifest.commit !== approval.commit || manifest.tree !== approval.tree || manifest.origin !== approval.origin || manifest.receipts?.runtime !== runtimeImageDigest(approval)) throw new Error('full_stack_stage_predecessor_binding_invalid');
      if (manifest.status !== 'verified' || manifest.revoked !== false) throw new Error('full_stack_stage_predecessor_invalid');
      predecessorStatus = 'adopt'; predecessorManifestSha256 = manifestFingerprint(manifest);
    } else if (approval.generation !== 1) throw new Error('full_stack_stage_generation_invalid');
  } else {
    if (!manifest || !['verified', 'revoked'].includes(state.status) || state.manifestSha256 !== manifestFingerprint(manifest)) throw new Error('full_stack_stage_predecessor_invalid');
    verifyManifest(manifest, publicKey, { allowExpired: state.status === 'revoked' });
    if (state.status === 'revoked' && approval.generation !== state.generation + 1) throw new Error('full_stack_stage_generation_invalid');
    if (state.status === 'verified' && approval.generation !== state.generation) throw new Error('full_stack_stage_requires_revoked_predecessor');
    predecessorStatus = state.status; predecessorGeneration = state.generation; predecessorManifestSha256 = state.manifestSha256;
  }
  await durableJson(PATHS.staging, { schemaVersion: 1, status: 'internal_staging', generation: approval.generation, targetDigest: approval.targetDigest, predecessorStatus, predecessorGeneration, predecessorManifestSha256 }, 0o600);
  process.stdout.write('internal_staging\n');
}

async function publish() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_publish_requires_root');
  assertInheritedControllerLock();
  const [approval, target, verification, dbReceipt, datasetManifest, maintenance, deepUsage, entitlement, privateKey, publicKey] = await Promise.all([
    rootJson(PATHS.approval, 0o600), syntheticOwnedJson(PATHS.target), syntheticOwnedJson(PATHS.verification), syntheticOwnedJson(PATHS.dbReceipt), syntheticOwnedJson(PATHS.datasetManifest), syntheticOwnedJson(PATHS.maintenance), syntheticOwnedJson(PATHS.deepUsage), rootJson(PATHS.entitlement, 0o600), rootText(PATHS.privateKey, 0o600), rootText(PATHS.publicKey, 0o644),
  ]);
  await assertTrustedLedgerGeneration(approval.generation);
  if (createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }) !== createPublicKey(publicKey).export({ type: 'spki', format: 'pem' })) throw new Error('full_stack_signing_key_mismatch');
  // compose 单机：runtime 身份 = 容器镜像摘要。publish 前验证 compose 配置里 migrate/api/worker/web
  // 的镜像引用都按 @sha256 钉死且 == approval.images，保证 manifest 声称的 runtime 与实际将运行的镜像一致。
  await assertComposeImageBinding(approval);
  let state = await optionalRootJson(PATHS.state, 0o600);
  let currentManifest = await optionalRootJson(PATHS.publicManifest, 0o644);
  const trustedPublicKey = createPublicKey(privateKey).export({ type: 'spki', format: 'pem' });
  if (state?.status === 'revoking') throw new Error('full_stack_release_revocation_in_progress');
  if (state?.status === 'revoked') {
    if (approval.generation !== state.generation + 1) throw new Error('full_stack_release_successor_invalid');
    if (!currentManifest || state.manifestSha256 !== manifestFingerprint(currentManifest)) throw new Error('full_stack_publication_state_mismatch');
    verifyManifest(currentManifest, trustedPublicKey, { allowExpired: true });
    state = null;
    currentManifest = null;
  }
  if (state?.status === 'publishing') {
    const pending = state.pendingManifest;
    verifyManifest(pending, trustedPublicKey);
    assertManifestBinding(pending, approval, target, verification, dbReceipt, deepUsage, entitlement);
    if (state.generation !== approval.generation || state.manifestSha256 !== manifestFingerprint(pending)) throw new Error('full_stack_publication_state_mismatch');
    await durableJson(PATHS.publicManifest, pending, 0o644);
    await durableJson(PATHS.state, committedState('verified', pending, state.generation, 'publishedAt'), 0o600);
    process.stdout.write(`${state.manifestSha256}\n`); return;
  }
  if (state?.status === 'verified') {
    if (!currentManifest) throw new Error('full_stack_publication_state_mismatch');
    verifyManifest(currentManifest, trustedPublicKey);
    assertManifestBinding(currentManifest, approval, target, verification, dbReceipt, deepUsage, entitlement);
    if (state.generation !== approval.generation || state.releaseDigest !== approval.releaseDigest || state.manifestSha256 !== manifestFingerprint(currentManifest)) throw new Error('full_stack_publication_state_mismatch');
    process.stdout.write(`${state.manifestSha256}\n`); return;
  }
  if (state !== null) throw new Error('full_stack_publication_state_invalid');
  const [rootHtml, loginHtml] = await Promise.all([boundedSurface(approval.origin, '/'), boundedSurface(approval.origin, '/login')]);
  const manifest = composeFullStackManifest({ approval, target, verification, dbReceipt, datasetManifest, maintenance, deepUsage, entitlement, rootHtml, loginHtml, privateKey });
  if (currentManifest) {
    verifyManifest(currentManifest, trustedPublicKey);
    if (currentManifest.status !== 'verified' || currentManifest.revoked !== false) throw new Error('full_stack_existing_manifest_not_active');
    assertManifestBinding(currentManifest, approval, target, verification, dbReceipt, deepUsage, entitlement);
    await durableJson(PATHS.state, committedState('verified', currentManifest, approval.generation, 'adoptedAt'), 0o600);
    process.stdout.write(`${manifestFingerprint(currentManifest)}\n`); return;
  }
  await durableJson(PATHS.state, pendingState('publishing', manifest, approval.generation), 0o600);
  await durableJson(PATHS.publicManifest, manifest, 0o644);
  await durableJson(PATHS.state, committedState('verified', manifest, approval.generation, 'publishedAt'), 0o600);
  process.stdout.write(`${manifestFingerprint(manifest)}\n`);
}

async function revoke() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_revoke_requires_root');
  assertInheritedControllerLock();
  const [manifest, privateKey, publicKey, state] = await Promise.all([rootJson(PATHS.publicManifest, 0o644), rootText(PATHS.privateKey, 0o600), rootText(PATHS.publicKey, 0o644), rootJson(PATHS.state, 0o600)]);
  if (createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }) !== createPublicKey(publicKey).export({ type: 'spki', format: 'pem' })) throw new Error('full_stack_signing_key_mismatch');
  if (state.status === 'revoked') { process.stdout.write(`${state.manifestSha256}\n`); return; }
  if (!['verified', 'revoking_stop_pending', 'revoking'].includes(state.status)) throw new Error('full_stack_publication_state_mismatch');
  const run = promisify(execFile);
  let revoked;
  if (state.status === 'verified') {
    verifyManifest(manifest, publicKey, { allowExpired: true });
    if (state.manifestSha256 !== manifestFingerprint(manifest)) throw new Error('full_stack_publication_state_mismatch');
    revoked = signManifest({ ...without(manifest, 'signature'), status: 'revoked', revoked: true, issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString() }, privateKey);
    try {
      await run('/usr/bin/systemctl', ['enable', '--now', 'meetwise-full-stack-revocation-retry.timer'], { maxBuffer: 100_000 });
      const { stdout: timerState } = await run('/usr/bin/timeout', ['--kill-after=1s', '5s', '/usr/bin/systemctl', 'show', '--property=ActiveState', '--value', 'meetwise-full-stack-revocation-retry.timer'], { maxBuffer: 100_000 });
      if (timerState.trim() !== 'active') throw new Error('full_stack_revocation_supervisor_inactive');
    } catch (error) {
      try { await run('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 }); } catch { /* physical closure is best effort before refusing the intent */ }
      throw error;
    }
    await durableJson(PATHS.state, pendingState('revoking_stop_pending', revoked, state.generation), 0o600);
    try { await run('/usr/bin/systemctl', ['start', '--no-block', 'meetwise-full-stack-revocation-retry.service'], { maxBuffer: 100_000 }); } catch { /* active timer is the fallback owner */ }
  } else {
    revoked = state.pendingManifest;
    verifyManifest(revoked, publicKey, { allowExpired: true });
    if (state.manifestSha256 !== manifestFingerprint(revoked)) throw new Error('full_stack_publication_state_mismatch');
  }
  if (state.status !== 'revoking') {
    try {
      // 关 web 容器：docker compose stop 是粘性的（手动 stop 后 restart:unless-stopped 不会自动拉起），
      // 故无需再设 ExecStartPre 门，web 的 start/stop 由本状态机显式控制。
      await runCompose(['stop', 'web']);
      const { stdout: running } = await runCompose(['ps', '--status', 'running', '-q', 'web']);
      if (running.trim() !== '') throw new Error('full_stack_revoke_web_still_active');
    } catch (error) {
      try { await run('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 }); } catch { /* retry remains fail-closed */ }
      throw error;
    }
    await durableJson(PATHS.state, pendingState('revoking', revoked, state.generation), 0o600);
  }
  await durableJson(PATHS.publicManifest, revoked, 0o644);
  const fingerprint = manifestFingerprint(revoked);
  let pages = null;
  try {
    const { stdout } = await run('/usr/bin/curl', ['--fail', '--silent', '--show-error', '--max-time', '20', `https://miaole.github.io/meetwise/preview-link-state.json?manifest=${fingerprint}`], { maxBuffer: 100_000 });
    pages = JSON.parse(stdout);
  } catch { /* retryable */ }
  if (pages?.state !== 'disabled' || pages?.manifestSha256 !== fingerprint) throw Object.assign(new Error('full_stack_pages_revocation_pending'), { exitCode: 75 });
  await run('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 });
  await durableJson(PATHS.state, committedState('revoked', revoked, state.generation, 'revokedAt'), 0o600);
  try { await run('/usr/bin/systemctl', ['disable', '--now', 'meetwise-full-stack-revocation-retry.timer'], { maxBuffer: 100_000 }); } catch { /* terminal state remains authoritative */ }
  process.stdout.write(`${fingerprint}\n`);
}

async function recover() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_recovery_requires_root');
  assertInheritedControllerLock();
  const [state, manifest, publicKey] = await Promise.all([
    optionalRootJson(PATHS.state, 0o600), optionalRootJson(PATHS.publicManifest, 0o644), rootText(PATHS.publicKey, 0o644),
  ]);
  const staging = await optionalRootJson(PATHS.staging, 0o600);
  if (staging) {
    if (staging.schemaVersion !== 1 || staging.status !== 'internal_staging' || !Number.isSafeInteger(staging.generation) || !DIGEST.test(staging.targetDigest ?? '')) throw new Error('full_stack_staging_invalid');
    if (state === null) {
      if (staging.predecessorStatus === 'adopt') {
        if (!manifest || staging.predecessorGeneration !== null || staging.predecessorManifestSha256 !== manifestFingerprint(manifest)) throw new Error('full_stack_staging_predecessor_mismatch');
        verifyManifest(manifest, publicKey, { allowExpired: true });
      } else if (staging.predecessorStatus !== null || staging.predecessorGeneration !== null || staging.predecessorManifestSha256 !== null) throw new Error('full_stack_staging_predecessor_mismatch');
    } else if (!['verified', 'revoked'].includes(state.status) || staging.predecessorStatus !== state.status || staging.predecessorGeneration !== state.generation || staging.predecessorManifestSha256 !== state.manifestSha256 || !manifest || state.manifestSha256 !== manifestFingerprint(manifest)) throw new Error('full_stack_staging_predecessor_mismatch');
    await promisify(execFile)('/usr/local/sbin/full-stack-preview-funnel-close', [], { maxBuffer: 100_000 });
    process.stdout.write('internal_staging\n');
    return;
  }
  if (state === null) throw new Error('full_stack_publication_state_missing');
  if (state.status === 'edge_probing') {
    await promisify(execFile)('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 });
    return expireProbe();
  }
  if (state.status === 'confirmed_pending_public') {
    await promisify(execFile)('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 });
    verifyManifest(state.pendingManifest, publicKey);
    await durableJson(PATHS.publicManifest, state.pendingManifest, 0o644);
    await durableJson(PATHS.state, { ...committedState('restoring_confirmed_edge', state.pendingManifest, state.generation, 'restoringAt'), publicConfirmedAt: state.publicConfirmedAt }, 0o600);
    process.stdout.write('restoring_confirmed_edge\n');
    return;
  }
  if (state.status === 'restoring_confirmed_edge') {
    await promisify(execFile)('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 });
    process.stdout.write('restoring_confirmed_edge\n');
    return;
  }
  if (['revoking_stop_pending', 'revoking'].includes(state.status)) {
    await runCompose(['stop', 'web']);
    // 与 revoke() 对齐：stop 之后必须确认 web 容器已不在 running，否则 fail-closed。
    // 残留 running web 会把已吊销的 manifest 继续打给公网，产生「吊销后仍可访问」的窗口。
    const { stdout: running } = await runCompose(['ps', '--status', 'running', '-q', 'web']);
    if (running.trim() !== '') throw new Error('full_stack_recovery_web_still_active');
    verifyManifest(state.pendingManifest, publicKey, { allowExpired: true });
    if (state.status === 'revoking_stop_pending') await durableJson(PATHS.state, pendingState('revoking', state.pendingManifest, state.generation), 0o600);
    await durableJson(PATHS.publicManifest, state.pendingManifest, 0o644);
    process.stdout.write('revoking\n');
    return;
  }
  if (state.status === 'publishing') {
    try { await promisify(execFile)('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 }); } catch { /* remain fail-closed */ }
    throw new Error('full_stack_publication_incomplete');
  }
  if (!['verified', 'revoked'].includes(state.status) || !manifest) throw new Error('full_stack_publication_state_invalid');
  verifyManifest(manifest, publicKey, { allowExpired: state.status === 'revoked' });
  if (state.manifestSha256 !== manifestFingerprint(manifest) || (state.status === 'verified' && (manifest.status !== 'verified' || manifest.revoked !== false)) || (state.status === 'revoked' && (manifest.status !== 'revoked' || manifest.revoked !== true))) throw new Error('full_stack_publication_state_mismatch');
  if (state.status === 'revoked') {
    try { await promisify(execFile)('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 }); } catch { /* remain fail-closed */ }
    throw new Error('full_stack_release_revoked');
  }
  process.stdout.write(`${state.manifestSha256}\n`);
}

async function verifyPublic() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_public_verify_requires_root');
  assertInheritedControllerLock();
  const [approval, state, publicKey] = await Promise.all([rootJson(PATHS.approval, 0o600), rootJson(PATHS.state, 0o600), rootText(PATHS.publicKey, 0o644)]);
  await assertTrustedLedgerGeneration(approval.generation);
  if (state.status !== 'verified' || !state.publicConfirmedAt || state.generation !== approval.generation) throw new Error('full_stack_public_verify_state_invalid');
  const [manifest, rootHtml, loginHtml] = await Promise.all([rootJson(PATHS.publicManifest, 0o644), boundedSurface(approval.origin, '/'), boundedSurface(approval.origin, '/login')]);
  verifyManifest(manifest, publicKey);
  if (manifest.mode !== 'public-full-stack' || !Number.isSafeInteger(manifest.generation) || manifest.generation !== approval.generation || manifestFingerprint(manifest) !== state.manifestSha256 || manifest.origin !== approval.origin || !rootHtml.includes('Meetwise 知面') || !rootHtml.includes('href="/login"') || !loginHtml.includes('name="email"') || !loginHtml.includes('name="password"')) throw new Error('full_stack_public_verify_failed');
  process.stdout.write(`${state.manifestSha256}\n`);
}

async function activate() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_activation_requires_root');
  assertInheritedControllerLock();
  const [approval, state, manifest, publicKey] = await Promise.all([rootJson(PATHS.approval, 0o600), rootJson(PATHS.state, 0o600), rootJson(PATHS.publicManifest, 0o644), rootText(PATHS.publicKey, 0o644)]);
  await assertTrustedLedgerGeneration(approval.generation);
  verifyManifest(manifest, publicKey);
  if (manifest.mode !== 'public-full-stack-probe' || !Number.isSafeInteger(manifest.generation) || manifest.generation !== approval.generation || state.status !== 'verified' || state.generation !== approval.generation || state.manifestSha256 !== manifestFingerprint(manifest) || manifest.origin !== approval.origin) throw new Error('full_stack_activation_state_invalid');
  const activationAt = new Date().toISOString();
  // GitHub schedules the fixed external verifier and confirm as separate jobs.
  // A ten-minute hard lease absorbs runner queue latency while the independent
  // systemd timer still closes Web/Funnel if confirmation never arrives.
  const probe = { ...state, status: 'edge_probing', expectedOrigin: approval.origin, probeNonce: randomBytes(32).toString('hex'), activationAt, deadlineAt: new Date(Date.now() + 600_000).toISOString() };
  await durableJson(PATHS.state, probe, 0o600);
  const run = promisify(execFile);
  try {
    await run('/usr/bin/systemctl', ['restart', 'meetwise-full-stack-edge-probe-expiry.timer'], { maxBuffer: 100_000, timeout: 20_000, killSignal: 'SIGKILL' });
    await runCompose(['up', '-d', 'web']);
    await Promise.all([boundedSurface(approval.origin, '/'), boundedSurface(approval.origin, '/login')]);
    if (Date.now() >= Date.parse(probe.deadlineAt)) throw new Error('full_stack_activation_deadline_expired');
    await run('/usr/local/sbin/full-stack-preview-funnel-enable', [approval.origin, probe.deadlineAt], { maxBuffer: 100_000, timeout: 20_000, killSignal: 'SIGKILL' });
    if (Date.now() >= Date.parse(probe.deadlineAt)) throw new Error('full_stack_activation_deadline_expired');
  } catch (error) {
    let closed = false;
    try { await run('/usr/local/sbin/full-stack-preview-edge-close', [], { maxBuffer: 100_000 }); closed = true; } catch { /* keep edge_probing so the watchdog retries */ }
    if (closed) {
      try { await run('/usr/bin/systemctl', ['stop', 'meetwise-full-stack-edge-probe-expiry.timer'], { maxBuffer: 100_000 }); } catch { /* timer retry is harmless while edge is closed */ }
      await durableJson(PATHS.state, committedState('verified', manifest, state.generation, 'activationAbortedAt'), 0o600);
    }
    throw error;
  }
  process.stdout.write(`${state.manifestSha256}\n`);
}

async function probeNonce() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_probe_nonce_requires_root');
  // 只读命令：不参与 controller 锁。activate() 已写入 64-hex nonce；这里仅供 ECS 之外的
  // 验证器（GitHub Actions）在十分钟硬窗口内取回 nonce，绝不写任何状态、不碰密钥、不打印
  // 其它字段——泄露面被严格限定为这一个 nonce。
  const state = await rootJson(PATHS.state, 0o600);
  if (state.status !== 'edge_probing' || !/^[a-f0-9]{64}$/.test(state.probeNonce ?? '')) throw new Error('full_stack_probe_nonce_unavailable');
  process.stdout.write(`${state.probeNonce}\n`);
}

async function expireProbe() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_probe_expiry_requires_root');
  assertInheritedControllerLock();
  const [state, manifest, approval] = await Promise.all([rootJson(PATHS.state, 0o600), rootJson(PATHS.publicManifest, 0o644), rootJson(PATHS.approval, 0o600)]);
  const run = promisify(execFile);
  if (state.status === 'edge_probing') {
    await durableJson(PATHS.state, committedState('verified', manifest, state.generation, 'probeExpiredAt'), 0o600);
    process.stdout.write(`${state.manifestSha256}\n`); return;
  }
  if (state.status === 'confirmed_pending_public') {
    verifyManifest(state.pendingManifest, await rootText(PATHS.publicKey, 0o644));
    await durableJson(PATHS.publicManifest, state.pendingManifest, 0o644);
    await durableJson(PATHS.state, { ...committedState('restoring_confirmed_edge', state.pendingManifest, state.generation, 'restoringAt'), publicConfirmedAt: state.publicConfirmedAt }, 0o600);
    return restoreConfirmedEdgeInternal(state.pendingManifest, approval, state.generation, state.publicConfirmedAt);
  }
  // The physical-first expiry may have raced a valid confirmation. Restore
  // the already-confirmed edge only when the durable state and final manifest
  // agree; otherwise leave the edge closed.
  if (state.status === 'verified' && state.publicConfirmedAt && manifest.mode === 'public-full-stack' && state.manifestSha256 === manifestFingerprint(manifest)) {
    await durableJson(PATHS.state, { ...committedState('restoring_confirmed_edge', manifest, state.generation, 'restoringAt'), publicConfirmedAt: state.publicConfirmedAt }, 0o600);
    return restoreConfirmedEdgeInternal(manifest, approval, state.generation, state.publicConfirmedAt);
  }
  process.stdout.write('no_edge_probe\n');
}

async function restoreConfirmedEdgeInternal(manifest, approval, generation, publicConfirmedAt) {
  const run = promisify(execFile);
  await runCompose(['up', '-d', 'web']);
  await Promise.all([boundedSurface(approval.origin, '/'), boundedSurface(approval.origin, '/login')]);
  await run('/usr/local/sbin/full-stack-preview-funnel-enable', [approval.origin], { maxBuffer: 100_000 });
  await durableJson(PATHS.state, { ...committedState('verified', manifest, generation, 'edgeRestoredAt'), publicConfirmedAt }, 0o600);
  process.stdout.write(`${manifestFingerprint(manifest)}\n`);
}

async function restoreConfirmedEdge() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_edge_restore_requires_root');
  assertInheritedControllerLock();
  const [approval, state, manifest, publicKey] = await Promise.all([rootJson(PATHS.approval, 0o600), rootJson(PATHS.state, 0o600), rootJson(PATHS.publicManifest, 0o644), rootText(PATHS.publicKey, 0o644)]);
  verifyManifest(manifest, publicKey);
  if (['revoked', 'revoking_stop_pending', 'revoking'].includes(state.status) || (state.status === 'verified' && manifest.mode === 'public-full-stack-probe' && !state.publicConfirmedAt)) { process.stdout.write('no_confirmed_edge\n'); return; }
  if (!['verified', 'restoring_confirmed_edge'].includes(state.status) || !state.publicConfirmedAt || manifest.mode !== 'public-full-stack' || state.generation !== approval.generation || state.manifestSha256 !== manifestFingerprint(manifest)) throw new Error('full_stack_edge_restore_state_invalid');
  if (state.status === 'verified') await durableJson(PATHS.state, { ...committedState('restoring_confirmed_edge', manifest, state.generation, 'restoringAt'), publicConfirmedAt: state.publicConfirmedAt }, 0o600);
  return restoreConfirmedEdgeInternal(manifest, approval, state.generation, state.publicConfirmedAt);
}

async function confirmPublic() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_public_confirmation_requires_root');
  assertInheritedControllerLock();
  const [approval, state, manifest, receipt, privateKey, publicKey, probeReceiptPublicKey] = await Promise.all([rootJson(PATHS.approval, 0o600), rootJson(PATHS.state, 0o600), rootJson(PATHS.publicManifest, 0o644), rootJson(PATHS.publicVerification, 0o600), rootText(PATHS.privateKey, 0o600), rootText(PATHS.publicKey, 0o644), rootText(PATHS.probeReceiptPublicKey, 0o644)]);
  await assertTrustedLedgerGeneration(approval.generation);
  if (state.status === 'verified' && state.publicConfirmedAt && manifest.mode === 'public-full-stack' && state.generation === approval.generation && state.manifestSha256 === manifestFingerprint(manifest)) { process.stdout.write(`${state.manifestSha256}\n`); return; }
  const checkedAt = Date.parse(receipt.checkedAt ?? '');
  const activationAt = Date.parse(state.activationAt ?? ''); const deadlineAt = Date.parse(state.deadlineAt ?? '');
  if (createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }) !== createPublicKey(publicKey).export({ type: 'spki', format: 'pem' })) throw new Error('full_stack_signing_key_mismatch');
  // ADR-0021：回执签名必须由 ECS 之外的验证器（GitHub Actions 私钥）签发。ECS 只有公钥，
  // 无法自签自证公开可用。签名绑定 probeNonce + manifestSha256 + checkedAt + 表面哈希。
  const receiptSignatureValid = receipt.signingKeyId === 'probe-receipt-ed25519-v1'
    && typeof receipt.signature === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(receipt.signature)
    && verify(null, Buffer.from(canonicalJson(without(receipt, 'signature'))), createPublicKey(probeReceiptPublicKey), Buffer.from(receipt.signature, 'base64'));
  if (!receiptSignatureValid) throw new Error('full_stack_probe_receipt_signature_invalid');
  if (manifest.mode !== 'public-full-stack-probe' || !Number.isSafeInteger(manifest.generation) || manifest.generation !== approval.generation || state.status !== 'edge_probing' || state.generation !== approval.generation || state.manifestSha256 !== manifestFingerprint(manifest) || receipt.schemaVersion !== 1 || receipt.origin !== approval.origin || receipt.probeNonce !== state.probeNonce || receipt.manifestSha256 !== state.manifestSha256 || receipt.rootStatus !== 200 || receipt.loginStatus !== 200 || receipt.manifestStatus !== 200 || receipt.rootUrl !== `${approval.origin}/` || receipt.loginUrl !== `${approval.origin}/login` || receipt.manifestUrl !== `${approval.origin}/preview-release-manifest.json` || receipt.rootSha256 !== manifest.receipts?.edge || receipt.blackboxSha256 !== manifest.receipts?.blackbox || !Number.isFinite(checkedAt) || !Number.isFinite(activationAt) || !Number.isFinite(deadlineAt) || checkedAt < activationAt || checkedAt >= deadlineAt || Date.now() >= deadlineAt) throw new Error('full_stack_public_confirmation_invalid');
  const finalManifest = signManifest({ ...without(manifest, 'signature'), mode: 'public-full-stack', issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString() }, privateKey);
  const publicConfirmedAt = new Date().toISOString();
  await durableJson(PATHS.state, { ...state, status: 'confirmed_pending_public', probeManifest: manifest, pendingManifest: finalManifest, publicConfirmedAt }, 0o600);
  await durableJson(PATHS.publicManifest, finalManifest, 0o644);
  await durableJson(PATHS.state, { ...committedState('verified', finalManifest, state.generation, 'publicConfirmedAt'), publicConfirmedAt }, 0o600);
  await promisify(execFile)('/usr/bin/systemctl', ['stop', 'meetwise-full-stack-edge-probe-expiry.timer'], { maxBuffer: 100_000 });
  process.stdout.write(`${manifestFingerprint(finalManifest)}\n`);
}

async function resumeRevocation() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_revocation_resume_requires_root');
  assertInheritedControllerLock();
  const state = await rootJson(PATHS.state, 0o600);
  if (!['revoking_stop_pending', 'revoking'].includes(state.status)) { process.stdout.write('no_revocation_pending\n'); return; }
  return revoke();
}

async function assertWebStartPermitted() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_web_start_gate_requires_root');
  const [state, staging] = await Promise.all([optionalRootJson(PATHS.state, 0o600), optionalRootJson(PATHS.staging, 0o600)]);
  if (staging) {
    if (staging.schemaVersion !== 1 || staging.status !== 'internal_staging') throw new Error('full_stack_web_start_staging_invalid');
    await promisify(execFile)('/usr/local/sbin/full-stack-preview-funnel-close', [], { maxBuffer: 100_000 });
    process.stdout.write('loopback_staging_permitted\n');
    return;
  }
  if (!state || !['verified', 'edge_probing', 'confirmed_pending_public', 'restoring_confirmed_edge'].includes(state.status)) throw new Error('full_stack_web_start_not_permitted');
  process.stdout.write(`${state.status}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  (command === 'stage' ? stage() : command === 'publish' ? publish() : command === 'activate' ? activate() : command === 'confirm-public' ? confirmPublic() : command === 'probe-nonce' ? probeNonce() : command === 'expire-probe' ? expireProbe() : command === 'restore-confirmed-edge' ? restoreConfirmedEdge() : command === 'resume-revocation' ? resumeRevocation() : command === 'revoke' ? revoke() : command === 'recover' ? recover() : command === 'verify-public' ? verifyPublic() : command === 'assert-web-start-permitted' ? assertWebStartPermitted() : command === 'ledger-init' ? ledgerInitCli(parseLedgerCliArgs(process.argv.slice(3))) : command === 'ledger-transition' ? ledgerTransitionCli(parseLedgerCliArgs(process.argv.slice(3))) : command === 'ledger-update' ? ledgerUpdateCli(parseLedgerCliArgs(process.argv.slice(3))) : command === 'ledger-recover' ? ledgerRecoverCli(parseLedgerCliArgs(process.argv.slice(3))) : command === 'ledger-recover-system' ? ledgerRecoverSystemCli(parseLedgerCliArgs(process.argv.slice(3))) : command === 'ledger-system-transition' ? ledgerSystemTransitionCli(parseLedgerCliArgs(process.argv.slice(3))) : command === 'ledger-read' ? readFullStackReleaseLedger(parseLedgerCliArgs(process.argv.slice(3)).path).then((ledger) => process.stdout.write(`${JSON.stringify(ledger)}\n`)) : Promise.reject(new Error('usage: full-stack-preview-publisher.mjs stage|publish|activate|confirm-public|probe-nonce|expire-probe|restore-confirmed-edge|resume-revocation|revoke|recover|verify-public|assert-web-start-permitted|ledger-init|ledger-transition|ledger-update|ledger-recover|ledger-recover-system|ledger-system-transition|ledger-read')))
    .catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'full_stack_publication_failed'}\n`); process.exitCode = error?.exitCode ?? 1; });
}
