#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { createHash, createPublicKey, randomBytes } from 'node:crypto';
import { fstatSync, lstatSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { lstat, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { promisify } from 'node:util';
import { canonicalJson, manifestFingerprint, publishManifestAtomically, signManifest, verifyManifest } from '../preview-release-manifest.mjs';

const DIGEST = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const REQUIRED_FORBIDDEN = Object.freeze(['answerEvents', 'consumptions', 'invalidApplicationStates', 'invalidInterviewStates', 'invalidJobStates', 'invalidResumeStates', 'modelInvocations', 'nonCatalogAccounts', 'numericScores', 'paymentOrders', 'queuedOrRunningJobs', 'rawAnswerJobs']);
const PATHS = Object.freeze({
  approval: '/etc/meetwise/full-stack-release.json',
  target: '/etc/meetwise/preview-synthetic-target.json',
  verification: '/var/lib/meetwise-preview-synthetic/preview-large-v1/verification.json',
  dbReceipt: '/var/lib/meetwise-preview-synthetic/preview-large-v1/post-db-verification.json',
  datasetManifest: '/var/lib/meetwise-preview-synthetic/preview-large-v1/manifest.json',
  maintenance: '/var/lib/meetwise-preview-synthetic/preview-large-v1/maintenance.json',
  privateKey: '/etc/meetwise/preview-release-ed25519.pem',
  publicKey: '/etc/meetwise/preview-release-ed25519.pub.pem',
  publicManifest: '/usr/share/meetwise-preview/preview-release-manifest.json',
  state: '/var/lib/meetwise-preview-controller/full-stack-publication.json',
  staging: '/var/lib/meetwise-preview-controller/full-stack-internal-staging.json',
  publicVerification: '/etc/meetwise/full-stack-public-verification.json',
});
const CONTROLLER_LOCK = '/run/meetwise-preview-controller/controller.lock';

const sha256 = (value) => createHash('sha256').update(typeof value === 'string' || value instanceof Uint8Array ? value : canonicalJson(value)).digest('hex');

function without(object, key) { const copy = { ...object }; delete copy[key]; return copy; }

function releaseTreeDigest(root) {
  const rows = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`release_symlink_rejected:${relative(root, path)}`);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) rows.push([relative(root, path), sha256(readFileSync(path))]);
    }
  };
  for (const scope of ['apps/api', 'packages/contracts', 'packages/db']) visit(join(root, scope));
  return sha256(rows);
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

export function composeFullStackManifest({ approval, target, verification, dbReceipt, datasetManifest, maintenance, rootHtml, loginHtml, privateKey, now = Date.now() }) {
  if (approval?.schemaVersion !== 1 || !Number.isSafeInteger(approval.generation) || approval.generation < 1 || approval.mode !== 'public-full-stack' || !COMMIT.test(approval.commit ?? '') || !COMMIT.test(approval.tree ?? '') || !DIGEST.test(approval.webBuildSha256 ?? '') || !DIGEST.test(approval.staticAssetsSha256 ?? '')) throw new Error('full_stack_approval_invalid');
  const targetDigest = sha256(target);
  const profile = target.approvedProfiles?.['large-v1'];
  if (!profile || profile.datasetId !== 'preview-large-v1' || !DIGEST.test(profile.catalogDigest ?? '') || !DIGEST.test(target.factoryDigest ?? '') || target.database !== 'meetwise_preview' || target.expectedDbRole !== 'meetwise_migrate') throw new Error('full_stack_target_profile_invalid');
  if (approval.releasePath !== target.releasePath || approval.releaseTreeDigest !== target.releaseTreeDigest || approval.apiContractDigest !== target.apiContractDigest || approval.targetDigest !== targetDigest) throw new Error('full_stack_target_binding_invalid');
  if (verification?.schemaVersion !== 2 || verification.datasetId !== profile.datasetId || verification.catalogDigest !== profile.catalogDigest || verification.targetDigest !== targetDigest || !DIGEST.test(verification.loadReceiptDigest ?? '') || !DIGEST.test(verification.verificationDigest ?? '') || sha256(without(verification, 'verificationDigest')) !== verification.verificationDigest) throw new Error('full_stack_synthetic_receipt_invalid');
  if (dbReceipt?.schemaVersion !== 1 || dbReceipt.phase !== 'post' || dbReceipt.status !== 'verified' || dbReceipt.datasetId !== profile.datasetId || dbReceipt.profile !== 'large-v1' || dbReceipt.targetDigest !== targetDigest || !DIGEST.test(dbReceipt.receiptDigest ?? '') || sha256(without(dbReceipt, 'receiptDigest')) !== dbReceipt.receiptDigest || verification.dbReceiptDigest !== dbReceipt.receiptDigest) throw new Error('full_stack_database_receipt_invalid');
  if (dbReceipt.releasePath !== target.releasePath || dbReceipt.releaseTreeDigest !== target.releaseTreeDigest || dbReceipt.apiContractDigest !== target.apiContractDigest || dbReceipt.schemaLedgerDigest !== target.schemaLedgerDigest || `${dbReceipt.schemaHead}.sql` !== target.schemaHead) throw new Error('full_stack_database_target_invalid');
  if (dbReceipt.catalogDigest !== profile.catalogDigest || dbReceipt.factoryDigest !== target.factoryDigest || dbReceipt.identity?.database !== target.database || dbReceipt.identity?.role !== target.expectedDbRole || dbReceipt.identity?.endpoint !== target.rdsEndpoint || dbReceipt.identity?.port !== target.rdsPort || dbReceipt.identity?.tlsServername !== target.tlsServername) throw new Error('full_stack_database_identity_invalid');
  if (Object.entries(profile.expectedCumulative ?? {}).some(([key, value]) => dbReceipt.counts?.[key] !== value) || verification.observations?.numericScores !== 0 || verification.observations?.accounts !== profile.expectedCumulative.accounts || verification.observations?.jobs !== profile.expectedCumulative.jobs || verification.observations?.applications !== profile.expectedCumulative.applications || verification.observations?.resumes !== profile.expectedCumulative.resumes || verification.observations?.interviews !== profile.expectedCumulative.interviews) throw new Error('full_stack_count_mismatch');
  const verifiedAt = Date.parse(verification.verifiedAt ?? ''); const dbVerifiedAt = Date.parse(dbReceipt.verifiedAt ?? '');
  if (![verifiedAt, dbVerifiedAt].every(Number.isFinite) || verifiedAt > now + 30_000 || dbVerifiedAt > now + 30_000 || now - verifiedAt > 24 * 60 * 60 * 1000 || now - dbVerifiedAt > 24 * 60 * 60 * 1000) throw new Error('full_stack_receipt_stale');
  if (JSON.stringify(Object.keys(dbReceipt.forbidden ?? {}).sort()) !== JSON.stringify([...REQUIRED_FORBIDDEN]) || Object.values(dbReceipt.forbidden).some((value) => value !== 0)) throw new Error('full_stack_forbidden_side_effect');
  if (datasetManifest?.schemaVersion !== 2 || datasetManifest.datasetId !== profile.datasetId || datasetManifest.status !== 'ready' || datasetManifest.targetDigest !== targetDigest || datasetManifest.catalogDigest !== profile.catalogDigest || datasetManifest.loadReceiptDigest !== verification.loadReceiptDigest || datasetManifest.verificationDigest !== verification.verificationDigest || !Number.isFinite(Date.parse(datasetManifest.completedAt ?? '')) || ['accounts', 'jobs', 'applications', 'resumes', 'interviews'].some((key) => !Number.isSafeInteger(datasetManifest.counts?.[key]) || datasetManifest.counts[key] < 0)) throw new Error('full_stack_dataset_not_ready');
  if (maintenance?.schemaVersion !== 1 || maintenance.status !== 'restored' || maintenance.targetDigest !== targetDigest || maintenance.datasetId !== verification.datasetId || maintenance.catalogDigest !== profile.catalogDigest || !Number.isFinite(Date.parse(maintenance.restoredAt ?? '')) || maintenance.nginxWasActive !== true || maintenance.workerWasActive !== true) throw new Error('full_stack_maintenance_not_restored');
  if (!rootHtml.includes('Meetwise 知面') || !rootHtml.includes('href="/login"') || !loginHtml.includes('name="email"') || !loginHtml.includes('name="password"') || !loginHtml.includes('登录 / 注册')) throw new Error('full_stack_surface_invalid');
  const surface = surfaceReceipt(rootHtml, loginHtml);
  return signManifest({
    schemaVersion: 1, status: 'verified', releaseDigest: approval.releaseDigest, commit: approval.commit, tree: approval.tree,
    webBuildSha256: approval.webBuildSha256, staticAssetsSha256: approval.staticAssetsSha256, origin: approval.origin,
    mode: 'public-full-stack-probe', issuedAt: new Date(now).toISOString(), expiresAt: new Date(now + 13 * 24 * 60 * 60 * 1000).toISOString(), revoked: false,
    receipts: { runtime: target.releaseTreeDigest, synthetic: verification.verificationDigest, database: dbReceipt.receiptDigest, edge: surface.root.sha256, blackbox: surface.digest },
    signingKeyId: 'ecs-preview-ed25519-v1',
  }, privateKey);
}

async function rootJson(path, mode) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== mode) throw new Error(`unsafe_root_file:${path}`);
  return JSON.parse(await readFile(path, 'utf8'));
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

function assertManifestBinding(manifest, approval, target, verification, dbReceipt, modes = ['public-full-stack-probe', 'public-full-stack']) {
  if (!modes.includes(manifest.mode) || manifest.releaseDigest !== approval.releaseDigest || manifest.commit !== approval.commit || manifest.tree !== approval.tree || manifest.origin !== approval.origin || manifest.receipts?.runtime !== target.releaseTreeDigest || manifest.receipts?.synthetic !== verification.verificationDigest || manifest.receipts?.database !== dbReceipt.receiptDigest) throw new Error('full_stack_existing_manifest_binding_invalid');
}

async function stage() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_stage_requires_root');
  assertInheritedControllerLock();
  const [approval, target, verification, dbReceipt, publicKey, state, manifest] = await Promise.all([
    rootJson(PATHS.approval, 0o600), rootJson(PATHS.target, 0o600), rootJson(PATHS.verification, 0o600), rootJson(PATHS.dbReceipt, 0o600), rootText(PATHS.publicKey, 0o644), optionalRootJson(PATHS.state, 0o600), optionalRootJson(PATHS.publicManifest, 0o644),
  ]);
  if (approval?.schemaVersion !== 1 || !Number.isSafeInteger(approval.generation) || approval.generation < 1 || approval.mode !== 'public-full-stack' || approval.targetDigest !== sha256(target)) throw new Error('full_stack_stage_approval_invalid');
  await promisify(execFile)('/usr/local/sbin/full-stack-preview-funnel-close', [], { maxBuffer: 100_000 });
  let predecessorStatus = null; let predecessorGeneration = null; let predecessorManifestSha256 = null;
  if (state === null) {
    if (manifest) {
      verifyManifest(manifest, publicKey, { allowExpired: true });
      assertManifestBinding(manifest, approval, target, verification, dbReceipt);
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
  const [approval, target, verification, dbReceipt, datasetManifest, maintenance, privateKey, publicKey] = await Promise.all([
    rootJson(PATHS.approval, 0o600), rootJson(PATHS.target, 0o600), rootJson(PATHS.verification, 0o600), rootJson(PATHS.dbReceipt, 0o600), rootJson(PATHS.datasetManifest, 0o600), rootJson(PATHS.maintenance, 0o600), rootText(PATHS.privateKey, 0o600), rootText(PATHS.publicKey, 0o644),
  ]);
  if (createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }) !== createPublicKey(publicKey).export({ type: 'spki', format: 'pem' })) throw new Error('full_stack_signing_key_mismatch');
  const currentRelease = await realpath('/srv/meetwise-full-stack/current');
  if (currentRelease !== target.releasePath || releaseTreeDigest(currentRelease) !== target.releaseTreeDigest) throw new Error('full_stack_current_release_mismatch');
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
    assertManifestBinding(pending, approval, target, verification, dbReceipt);
    if (state.generation !== approval.generation || state.manifestSha256 !== manifestFingerprint(pending)) throw new Error('full_stack_publication_state_mismatch');
    await durableJson(PATHS.publicManifest, pending, 0o644);
    await durableJson(PATHS.state, committedState('verified', pending, state.generation, 'publishedAt'), 0o600);
    process.stdout.write(`${state.manifestSha256}\n`); return;
  }
  if (state?.status === 'verified') {
    if (!currentManifest) throw new Error('full_stack_publication_state_mismatch');
    verifyManifest(currentManifest, trustedPublicKey);
    assertManifestBinding(currentManifest, approval, target, verification, dbReceipt);
    if (state.generation !== approval.generation || state.releaseDigest !== approval.releaseDigest || state.manifestSha256 !== manifestFingerprint(currentManifest)) throw new Error('full_stack_publication_state_mismatch');
    process.stdout.write(`${state.manifestSha256}\n`); return;
  }
  if (state !== null) throw new Error('full_stack_publication_state_invalid');
  const [rootHtml, loginHtml] = await Promise.all([boundedSurface(approval.origin, '/'), boundedSurface(approval.origin, '/login')]);
  const manifest = composeFullStackManifest({ approval, target, verification, dbReceipt, datasetManifest, maintenance, rootHtml, loginHtml, privateKey });
  if (currentManifest) {
    verifyManifest(currentManifest, trustedPublicKey);
    if (currentManifest.status !== 'verified' || currentManifest.revoked !== false) throw new Error('full_stack_existing_manifest_not_active');
    assertManifestBinding(currentManifest, approval, target, verification, dbReceipt);
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
      await run('/usr/bin/timeout', ['--kill-after=1s', '15s', '/usr/bin/systemctl', 'stop', 'meetwise-web.service'], { maxBuffer: 100_000 });
      const { stdout: activeState } = await run('/usr/bin/timeout', ['--kill-after=1s', '5s', '/usr/bin/systemctl', 'show', '--property=ActiveState', '--value', 'meetwise-web.service'], { maxBuffer: 100_000 });
      if (!['inactive', 'failed'].includes(activeState.trim())) throw new Error('full_stack_revoke_web_still_active');
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
    await promisify(execFile)('/usr/bin/timeout', ['--kill-after=1s', '15s', '/usr/bin/systemctl', 'stop', 'meetwise-web.service'], { maxBuffer: 100_000 });
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
  if (state.status !== 'verified' || !state.publicConfirmedAt || state.generation !== approval.generation) throw new Error('full_stack_public_verify_state_invalid');
  const [manifest, rootHtml, loginHtml] = await Promise.all([rootJson(PATHS.publicManifest, 0o644), boundedSurface(approval.origin, '/'), boundedSurface(approval.origin, '/login')]);
  verifyManifest(manifest, publicKey);
  if (manifest.mode !== 'public-full-stack' || manifestFingerprint(manifest) !== state.manifestSha256 || manifest.origin !== approval.origin || !rootHtml.includes('Meetwise 知面') || !rootHtml.includes('href="/login"') || !loginHtml.includes('name="email"') || !loginHtml.includes('name="password"')) throw new Error('full_stack_public_verify_failed');
  process.stdout.write(`${state.manifestSha256}\n`);
}

async function activate() {
  if (process.getuid?.() !== 0) throw new Error('full_stack_activation_requires_root');
  assertInheritedControllerLock();
  const [approval, state, manifest, publicKey] = await Promise.all([rootJson(PATHS.approval, 0o600), rootJson(PATHS.state, 0o600), rootJson(PATHS.publicManifest, 0o644), rootText(PATHS.publicKey, 0o644)]);
  verifyManifest(manifest, publicKey);
  if (manifest.mode !== 'public-full-stack-probe' || state.status !== 'verified' || state.generation !== approval.generation || state.manifestSha256 !== manifestFingerprint(manifest) || manifest.origin !== approval.origin) throw new Error('full_stack_activation_state_invalid');
  const activationAt = new Date().toISOString();
  const probe = { ...state, status: 'edge_probing', expectedOrigin: approval.origin, probeNonce: randomBytes(32).toString('hex'), activationAt, deadlineAt: new Date(Date.now() + 60_000).toISOString() };
  await durableJson(PATHS.state, probe, 0o600);
  const run = promisify(execFile);
  try {
    await run('/usr/bin/systemctl', ['restart', 'meetwise-full-stack-edge-probe-expiry.timer'], { maxBuffer: 100_000, timeout: 20_000, killSignal: 'SIGKILL' });
    await run('/usr/bin/systemctl', ['restart', 'meetwise-web.service'], { maxBuffer: 100_000, timeout: 20_000, killSignal: 'SIGKILL' });
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
  await run('/usr/bin/systemctl', ['restart', 'meetwise-web.service'], { maxBuffer: 100_000, timeout: 20_000, killSignal: 'SIGKILL' });
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
  const [approval, state, manifest, receipt, privateKey, publicKey] = await Promise.all([rootJson(PATHS.approval, 0o600), rootJson(PATHS.state, 0o600), rootJson(PATHS.publicManifest, 0o644), rootJson(PATHS.publicVerification, 0o600), rootText(PATHS.privateKey, 0o600), rootText(PATHS.publicKey, 0o644)]);
  if (state.status === 'verified' && state.publicConfirmedAt && manifest.mode === 'public-full-stack' && state.generation === approval.generation && state.manifestSha256 === manifestFingerprint(manifest)) { process.stdout.write(`${state.manifestSha256}\n`); return; }
  const checkedAt = Date.parse(receipt.checkedAt ?? '');
  const activationAt = Date.parse(state.activationAt ?? ''); const deadlineAt = Date.parse(state.deadlineAt ?? '');
  if (createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }) !== createPublicKey(publicKey).export({ type: 'spki', format: 'pem' })) throw new Error('full_stack_signing_key_mismatch');
  if (manifest.mode !== 'public-full-stack-probe' || state.status !== 'edge_probing' || state.generation !== approval.generation || state.manifestSha256 !== manifestFingerprint(manifest) || receipt.schemaVersion !== 1 || receipt.origin !== approval.origin || receipt.probeNonce !== state.probeNonce || receipt.manifestSha256 !== state.manifestSha256 || receipt.rootStatus !== 200 || receipt.loginStatus !== 200 || receipt.manifestStatus !== 200 || receipt.rootUrl !== `${approval.origin}/` || receipt.loginUrl !== `${approval.origin}/login` || receipt.manifestUrl !== `${approval.origin}/preview-release-manifest.json` || receipt.rootSha256 !== manifest.receipts?.edge || receipt.blackboxSha256 !== manifest.receipts?.blackbox || !Number.isFinite(checkedAt) || !Number.isFinite(activationAt) || !Number.isFinite(deadlineAt) || checkedAt < activationAt || checkedAt >= deadlineAt || Date.now() >= deadlineAt) throw new Error('full_stack_public_confirmation_invalid');
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
  (command === 'stage' ? stage() : command === 'publish' ? publish() : command === 'activate' ? activate() : command === 'confirm-public' ? confirmPublic() : command === 'expire-probe' ? expireProbe() : command === 'restore-confirmed-edge' ? restoreConfirmedEdge() : command === 'resume-revocation' ? resumeRevocation() : command === 'revoke' ? revoke() : command === 'recover' ? recover() : command === 'verify-public' ? verifyPublic() : command === 'assert-web-start-permitted' ? assertWebStartPermitted() : Promise.reject(new Error('usage: full-stack-preview-publisher.mjs stage|publish|activate|confirm-public|expire-probe|restore-confirmed-edge|resume-revocation|revoke|recover|verify-public|assert-web-start-permitted')))
    .catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'full_stack_publication_failed'}\n`); process.exitCode = error?.exitCode ?? 1; });
}
