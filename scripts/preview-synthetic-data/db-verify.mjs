#!/usr/bin/env node
import { createRequire } from 'node:module';
import { closeSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIXED_PREVIEW_ACCOUNTS, sha256 } from './catalog.mjs';
import { EXPECTED_DATABASE, EXPECTED_ROLE, resolveReadOnlyVerifierEnv } from './verifier-env.mjs';

// 降权执行（P0-1）：与 loader.mjs 同，db-verify 由 root 或 meetwise-synthetic（uid/gid 2001）运行。
const SYNTHETIC_UID = 2001;
const SYNTHETIC_GID = 2001;
const trustedUid = (uid, gid) => (uid === 0 && gid === 0) || (uid === SYNTHETIC_UID && gid === SYNTHETIC_GID);
// root 拥有（组 root 或 meetwise-synthetic）或 meetwise-synthetic 拥有的文件（rootJson 用）。
const trustedOwner = (uid, gid) => (uid === 0 && (gid === 0 || gid === SYNTHETIC_GID)) || (uid === SYNTHETIC_UID && gid === SYNTHETIC_GID);

const STATE_ROOT = '/var/lib/meetwise-preview-synthetic';
const TARGET_FILE = '/etc/meetwise/preview-synthetic-target.json';
const DEEP_USAGE_STATE_FILE = '/var/lib/meetwise-preview-synthetic/preview-deep-usage-v1/scenario.json';
const FIXED_MUTABLE_LIMITS = Object.freeze({ interviews: 500, applicationExceptions: 500, modelInvocations: 10000, consumptions: 500, answerEvents: 10000 });

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

function rootJson(path) {
  const stat = lstatSync(path);
  const permissions = stat.mode & 0o777;
  // target 档 root 写、synthetic 只读落盘为 0640，root 执行仍读 0600；都无组/他人写位。
  if (!stat.isFile() || stat.isSymbolicLink() || !trustedOwner(stat.uid, stat.gid) || (permissions !== 0o600 && permissions !== 0o640)) throw new Error(`unsafe_root_json:${path}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function rootJsonOrNull(path) {
  try { return rootJson(path); }
  catch (error) { if (error?.code === 'ENOENT') return null; throw error; }
}

function trustedDeepUsageIdentity() {
  const state = rootJson(DEEP_USAGE_STATE_FILE);
  const receipt = state?.deepUsageReceipt;
  if (state?.phase !== 'verified_online_projection' || receipt?.schemaVersion !== 1 || receipt.receiptLayer !== 'deep-usage' || receipt.datasetId !== 'preview-deep-usage-v1' || receipt.scenarioId !== 'deep-usage-v1' || receipt.phase !== 'verified_online_projection' || !Array.isArray(receipt.observations?.sessions) || receipt.observations.sessions.length !== 3 || !/^[a-f0-9]{64}$/.test(receipt.receiptDigest ?? '')) throw new Error('db_verify_deep_usage_receipt_invalid');
  const { receiptDigest, unproven, ...unsigned } = receipt;
  if (sha256(JSON.stringify(unsigned)) !== receiptDigest || !Array.isArray(unproven)) throw new Error('db_verify_deep_usage_receipt_digest_invalid');
  const sessions = receipt.observations.sessions.map((session) => ({ applicationId: session?.applicationId, interviewId: session?.interviewId }));
  if (sessions.some(({ applicationId, interviewId }) => typeof applicationId !== 'string' || applicationId.length === 0 || typeof interviewId !== 'string' || interviewId.length === 0) || new Set(sessions.map(({ applicationId }) => applicationId)).size !== 3 || new Set(sessions.map(({ interviewId }) => interviewId)).size !== 3) throw new Error('db_verify_deep_usage_identity_invalid');
  return { receiptDigest, sessions };
}

function durableWrite(path, value) {
  const temp = `${path}.tmp-${process.pid}`; writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  let fd = openSync(temp, 'r'); fsyncSync(fd); closeSync(fd); renameSync(temp, path); fd = openSync(dirname(path), 'r'); fsyncSync(fd); closeSync(fd);
}

function releaseDigest(root) {
  const rows = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`release_symlink_rejected:${relative(root, path)}`);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) rows.push([relative(root, path), sha256(readFileSync(path))]);
    }
  };
  for (const scope of ['apps/api', 'packages/contracts', 'packages/db']) visit(join(root, scope));
  return sha256(rows);
}

function parseArgs() {
  const values = Object.fromEntries(process.argv.slice(2).reduce((rows, value, index, all) => index % 2 === 0 ? [...rows, [value, all[index + 1]]] : rows, []));
  const profile = values['--profile']; const datasetId = values['--dataset-id']; const phase = values['--phase'];
  const layer = values['--layer'] ?? 'capacity';
  if (!['showcase-v1', 'large-v1', 'large-v1-successor'].includes(profile) || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(datasetId ?? '') || !['pre', 'post'].includes(phase) || !['capacity', 'deep-usage'].includes(layer)) throw new Error('usage: db-verify.mjs --profile showcase-v1|large-v1|large-v1-successor --dataset-id id --phase pre|post [--layer capacity|deep-usage]');
  return { profile, datasetId, phase, layer, outputDir: values['--output-dir'] };
}

const RELEASE_IDENTITY_RE = /^[A-Za-z0-9._:@+/=-]{1,256}$/;

/**
 * The loader may direct receipts into exactly one legacy directory or the
 * target/release child derived here.  Keeping this allowlist in db-verify
 * prevents an arbitrary CLI path from becoming a receipt write primitive.
 */
export function resolveOutputDir({ datasetId, targetDigest, releaseIdentity, outputDir } = {}) {
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(datasetId ?? '') || !/^[a-f0-9]{64}$/.test(targetDigest ?? '') || !RELEASE_IDENTITY_RE.test(releaseIdentity ?? '')) throw new Error('db_verify_output_binding_invalid');
  if (outputDir !== undefined && (typeof outputDir !== 'string' || outputDir.length === 0)) throw new Error('db_verify_output_dir_invalid');
  const legacyDir = resolve(join(STATE_ROOT, datasetId));
  const scopedDir = resolve(join(legacyDir, `.target-${targetDigest}-${sha256(releaseIdentity).slice(0, 16)}`));
  const candidate = resolve(outputDir ?? legacyDir);
  if (candidate !== legacyDir && candidate !== scopedDir) throw new Error('db_verify_output_dir_not_allowed');
  return candidate;
}

function assertOutputDirectory(path, { create = false } = {}) {
  if (create) mkdirSync(path, { recursive: true, mode: 0o700 });
  const root = resolve(STATE_ROOT);
  const parts = relative(root, resolve(path)).split('/').filter(Boolean);
  let current = root;
  for (const part of parts) {
    current = join(current, part);
    const stat = lstatSync(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`unsafe_db_verify_output_directory:${path}`);
  }
  const stat = lstatSync(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || !trustedUid(stat.uid, stat.gid) || (stat.mode & 0o777) !== 0o700) throw new Error(`unsafe_db_verify_output_directory:${path}`);
}

export const CAPACITY_INTERVIEW_STATES = Object.freeze(['abandoned']);
// Deep usage has its own receipt and is never folded into the historical
// capacity receipt.  These are legal interview states for the independent
// deep-usage snapshot; the caller still binds individual IDs to that receipt.
export const DEEP_USAGE_INTERVIEW_STATES = Object.freeze(['created', 'active', 'completed', 'abandoned', 'failed']);

function catalogEmailPattern(profile) {
  const generated = String.raw`preview\.[bc]\.[0-9]{3}@synthetic\.meetwise\.invalid`;
  if (profile !== 'large-v1-successor') return `^${generated}$`;
  const fixed = FIXED_PREVIEW_ACCOUNTS.map((account) => account.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return `^(?:${generated}|${fixed})$`;
}

export function allowedInterviewStates(phase, recovery, layer = 'capacity') {
  if (layer === 'deep-usage') return [...DEEP_USAGE_INTERVIEW_STATES];
  return phase === 'pre' && recovery ? ['created', ...CAPACITY_INTERVIEW_STATES] : [...CAPACITY_INTERVIEW_STATES];
}

async function main() {
  if (!trustedUid(process.getuid?.() ?? -1, process.getgid?.() ?? -1)) throw new Error('db_verify_requires_trusted_uid');
  const { profile, datasetId, phase, layer, outputDir } = parseArgs();
  const target = rootJson(TARGET_FILE); const targetDigest = sha256(target); const approval = target.approvedProfiles?.[profile];
  if (!approval || approval.datasetId !== datasetId || target.database !== EXPECTED_DATABASE || target.expectedDbRole !== EXPECTED_ROLE) throw new Error('db_verify_target_not_approved');
  if (target.factoryDigest !== factoryDigest()) throw new Error('db_verify_factory_mismatch');
  const verifierEnv = resolveReadOnlyVerifierEnv(process.env);
  if (verifierEnv.expectedDatabase !== target.database || verifierEnv.expectedRole !== target.expectedDbRole) throw new Error('db_verify_verifier_contract_target_mismatch');
  const databaseUrl = new URL(verifierEnv.databaseUrl);
  if (databaseUrl.hostname !== target.rdsEndpoint || Number(databaseUrl.port || 5432) !== target.rdsPort || verifierEnv.tlsServername !== target.tlsServername) throw new Error('db_verify_endpoint_mismatch');
  const releaseIdentity = target.releaseIdentity ?? `tree:${target.releaseTreeDigest}`;
  const datasetDir = resolveOutputDir({ datasetId, targetDigest, releaseIdentity, outputDir });
  assertOutputDirectory(datasetDir, { create: outputDir === undefined });
  const state = rootJsonOrNull(join(datasetDir, 'manifest.json'));
  if (phase === 'post' && !state) throw new Error('db_verify_manifest_missing');
  if (state && (state.datasetId !== datasetId || state.catalogDigest !== approval.catalogDigest || state.targetDigest !== targetDigest || !['loading', 'loaded_unverified', 'verifying', 'ready'].includes(state.status))) throw new Error('db_verify_manifest_mismatch');
  const require = createRequire('/srv/meetwise-full-stack/current/packages/db/package.json'); const pg = require('pg');
  const ssl = { ca: readFileSync(verifierEnv.caPath, 'utf8'), rejectUnauthorized: true, servername: verifierEnv.tlsServername };
  const pool = new pg.Pool({ connectionString: verifierEnv.databaseUrl, ssl, max: 1 }); const client = await pool.connect();
  const scalar = async (query, params = []) => Number((await client.query(query, params)).rows[0].n);
  try {
    await client.query('BEGIN READ ONLY ISOLATION LEVEL REPEATABLE READ');
    const identity = (await client.query('SELECT current_database() AS database, current_user AS role, inet_server_addr()::text AS server_addr, inet_server_port() AS server_port')).rows[0];
    if (identity.database !== target.database || identity.role !== target.expectedDbRole || Number(identity.server_port ?? target.rdsPort) !== target.rdsPort) throw new Error('db_verify_wrong_identity');
    const ledger = (await client.query('SELECT version, checksum FROM schema_migrations ORDER BY version')).rows;
    const schemaLedgerDigest = sha256(ledger); const schemaHead = ledger.at(-1)?.version;
    if (schemaLedgerDigest !== target.schemaLedgerDigest || `${schemaHead}.sql` !== target.schemaHead) throw new Error('db_verify_schema_mismatch');
    const releasePath = realpathSync('/srv/meetwise-full-stack/current');
    if (releasePath !== target.releasePath || releaseDigest(releasePath) !== target.releaseTreeDigest || sha256(readFileSync(join(releasePath, 'packages/contracts/src/openapi.ts'))) !== target.apiContractDigest) throw new Error('db_verify_release_mismatch');
    const counts = {
      accounts: await scalar('SELECT count(*) n FROM user_account'), jobs: await scalar('SELECT count(*) n FROM job_posting'), applications: await scalar('SELECT count(*) n FROM job_application'), resumes: await scalar('SELECT count(*) n FROM resume'), interviews: await scalar('SELECT count(*) n FROM interview'),
      recruiters: await scalar("SELECT count(*) n FROM user_account WHERE role='recruiter'"), candidates: await scalar("SELECT count(*) n FROM user_account WHERE role='candidate'"), declined: await scalar("SELECT count(*) n FROM job_application WHERE status='declined'"), invited: await scalar("SELECT count(*) n FROM job_application WHERE status='invited'"),
    };
    const keys = ['accounts', 'jobs', 'applications', 'resumes', 'interviews']; const recovery = phase === 'pre' && state !== null;
    const reattestation = profile === 'large-v1-successor' && state?.reattestationMode === 'api_read_only';
    let overlay = null;
    if (reattestation) {
      const fixedOwners = (await client.query('SELECT id FROM user_account WHERE email=$1 AND role=$2 AND status=$3', ['previewc@meetwise.com', 'candidate', 'active'])).rows;
      if (fixedOwners.length !== 1) throw new Error('db_verify_fixed_overlay_owner_invalid');
      const ownerUserId = fixedOwners[0].id;
      const deepIdentity = trustedDeepUsageIdentity();
      const interviewIds = deepIdentity.sessions.map(({ interviewId }) => interviewId);
      const applicationIds = deepIdentity.sessions.map(({ applicationId }) => applicationId);
      const exactInterviews = (await client.query('SELECT id, application_id FROM interview WHERE owner_user_id=$1 AND id=ANY($2::text[])', [ownerUserId, interviewIds])).rows;
      const exactApplications = (await client.query('SELECT id, interview_id FROM job_application WHERE candidate_user_id=$1 AND id=ANY($2::text[])', [ownerUserId, applicationIds])).rows;
      const expectedPairs = new Set(deepIdentity.sessions.map(({ applicationId, interviewId }) => `${applicationId}:${interviewId}`));
      const actualInterviewPairs = new Set(exactInterviews.map((row) => `${row.application_id}:${row.id}`));
      const actualApplicationPairs = new Set(exactApplications.map((row) => `${row.id}:${row.interview_id}`));
      if (actualInterviewPairs.size !== 3 || actualApplicationPairs.size !== 3 || [...expectedPairs].some((pair) => !actualInterviewPairs.has(pair) || !actualApplicationPairs.has(pair))) throw new Error('db_verify_fixed_overlay_identity_mismatch');
      overlay = {
        schemaVersion: 1,
        scope: 'fixed-preview-candidate',
        ownerUserId,
        deepUsageReceiptDigest: deepIdentity.receiptDigest,
        interviewIds: [...interviewIds].sort(),
        applicationIds: [...applicationIds].sort(),
        interviews: await scalar('SELECT count(*) n FROM interview WHERE owner_user_id=$1', [ownerUserId]),
        applicationExceptions: await scalar("SELECT count(*) n FROM job_application WHERE candidate_user_id=$1 AND status NOT IN ('invited','declined')", [ownerUserId]),
        modelInvocations: await scalar('SELECT count(*) n FROM ai_model_invocation WHERE owner_user_id=$1', [ownerUserId]),
        consumptions: await scalar('SELECT count(*) n FROM entitlement_consumption WHERE owner_user_id=$1', [ownerUserId]),
        answerEvents: await scalar("SELECT count(*) n FROM interview_event WHERE owner_user_id=$1 AND kind='answer_evaluated'", [ownerUserId]),
        limits: { ...FIXED_MUTABLE_LIMITS },
      };
      const invalidOverlayInterviews = await scalar("SELECT count(*) n FROM interview WHERE owner_user_id=$1 AND status NOT IN ('created','active','completed','abandoned','failed')", [ownerUserId]);
      const invalidOverlayApplications = await scalar("SELECT count(*) n FROM job_application WHERE candidate_user_id=$1 AND status NOT IN ('invited','declined','in_progress','assessment_unavailable')", [ownerUserId]);
      if (invalidOverlayInterviews !== 0 || invalidOverlayApplications !== 0 || Object.entries(FIXED_MUTABLE_LIMITS).some(([key, limit]) => overlay[key] < (key === 'interviews' ? 3 : 0) || overlay[key] > limit)) throw new Error('db_verify_fixed_overlay_state_invalid');
    }
    const interviewStates = allowedInterviewStates(phase, recovery, layer);
    const forbidden = {
      nonCatalogAccounts: await scalar(`SELECT count(*) n FROM user_account WHERE email !~ '${catalogEmailPattern(profile)}'`), numericScores: await scalar('SELECT count(*) n FROM job_application WHERE score IS NOT NULL'), invalidApplicationStates: overlay ? await scalar("SELECT count(*) n FROM job_application WHERE status NOT IN ('invited','declined') AND candidate_user_id<>$1", [overlay.ownerUserId]) : await scalar("SELECT count(*) n FROM job_application WHERE status NOT IN ('invited','declined')"), invalidResumeStates: await scalar("SELECT count(*) n FROM resume WHERE status <> 'ingested'"), invalidInterviewStates: overlay ? await scalar("SELECT count(*) n FROM interview WHERE status<>'abandoned' AND owner_user_id<>$1", [overlay.ownerUserId]) : await scalar(`SELECT count(*) n FROM interview WHERE status NOT IN (${interviewStates.map((state) => `'${state}'`).join(',')})`), invalidJobStates: await scalar("SELECT count(*) n FROM job_posting WHERE status <> 'open'"), queuedOrRunningJobs: await scalar("SELECT count(*) n FROM interview_job WHERE status IN ('queued','running')"), rawAnswerJobs: await scalar("SELECT count(*) n FROM interview_job WHERE payload ? 'answer'"), modelInvocations: overlay ? await scalar('SELECT count(*) n FROM ai_model_invocation WHERE owner_user_id<>$1', [overlay.ownerUserId]) : await scalar('SELECT count(*) n FROM ai_model_invocation'), paymentOrders: await scalar('SELECT count(*) n FROM payment_order'), consumptions: overlay ? await scalar('SELECT count(*) n FROM entitlement_consumption WHERE owner_user_id<>$1', [overlay.ownerUserId]) : await scalar('SELECT count(*) n FROM entitlement_consumption'), answerEvents: overlay ? await scalar("SELECT count(*) n FROM interview_event WHERE kind='answer_evaluated' AND owner_user_id<>$1", [overlay.ownerUserId]) : await scalar("SELECT count(*) n FROM interview_event WHERE kind='answer_evaluated'"),
    };
    if (Object.values(forbidden).some((value) => value !== 0)) throw new Error(`db_verify_forbidden_side_effect:${JSON.stringify(forbidden)}`);
    const capacityCounts = { ...counts, interviews: counts.interviews - (overlay?.interviews ?? 0) };
    const countMismatch = recovery
      ? (reattestation ? keys.some((key) => capacityCounts[key] !== approval.expectedCumulative[key]) : keys.some((key) => counts[key] < approval.expectedBaseline[key] || counts[key] > approval.expectedCumulative[key]))
      : keys.some((key) => capacityCounts[key] !== (phase === 'pre' ? approval.expectedBaseline[key] : approval.expectedCumulative[key]));
    if (countMismatch) throw new Error(`db_verify_count_mismatch:${JSON.stringify(counts)}`);
    const receipt = { schemaVersion: 1, phase, status: 'verified', recovery, receiptLayer: layer, datasetId, profile, targetDigest, releaseIdentity, catalogDigest: state?.catalogDigest ?? approval.catalogDigest, factoryDigest: target.factoryDigest, identity: { database: identity.database, role: identity.role, endpoint: databaseUrl.hostname, port: target.rdsPort, tlsServername: verifierEnv.tlsServername, serverAddr: identity.server_addr ?? null }, schemaHead, schemaLedgerDigest, releasePath, releaseTreeDigest: target.releaseTreeDigest, apiContractDigest: target.apiContractDigest, counts, capacityCounts, ...(overlay ? { attestationMode: 'capacity_with_fixed_deep_overlay', allowedOverlay: overlay } : {}), forbidden, verifiedAt: new Date().toISOString() };
    receipt.receiptDigest = sha256(receipt); durableWrite(join(datasetDir, `${phase}-db-verification.json`), receipt); process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; } finally { client.release(); await pool.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'db_verify_failed'}\n`); process.exitCode = 1; });
