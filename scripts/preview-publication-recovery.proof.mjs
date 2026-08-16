import assert from 'node:assert/strict';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { decidePublicationReconciliation } from '../ops/ecs/preview-publication-recovery.mjs';
import { clearCurrentPointer, inspectCurrentPointer, switchCurrentPointer } from '../ops/ecs/preview-current-pointer.mjs';
import { clearServingPermit, decideServingPermit, issueServingPermit, validateServingPermit } from '../ops/ecs/preview-serving-permit.mjs';

const root = process.cwd();
const recoverySource = await readFile(resolve(root, 'ops/ecs/preview-publication-recovery.mjs'), 'utf8');
const currentSource = await readFile(resolve(root, 'ops/ecs/preview-current-pointer.mjs'), 'utf8');
const permitSource = await readFile(resolve(root, 'ops/ecs/preview-serving-permit.mjs'), 'utf8');
const reconcileSource = await readFile(resolve(root, 'ops/ecs/reconcile-preview-publication.sh'), 'utf8');
const ensureSource = await readFile(resolve(root, 'ops/ecs/ensure-preview-web-serving.sh'), 'utf8');
const bootRecoverySource = await readFile(resolve(root, 'ops/ecs/recover-preview-publication.sh'), 'utf8');
const bootRecoveryUnitSource = await readFile(resolve(root, 'ops/ecs/systemd/meetwise-preview-recovery.service'), 'utf8');
const controllerSource = await readFile(resolve(root, 'ops/ecs/controller-lib.sh'), 'utf8');
const unitSource = await readFile(resolve(root, 'ops/ecs/systemd/meetwise-web-preview.service'), 'utf8');
const installerSource = await readFile(resolve(root, 'ops/ecs/install-preview-controller.sh'), 'utf8');

const releaseDigest = 'a'.repeat(40);
const predecessorDigest = 'b'.repeat(40);
const fingerprint = 'c'.repeat(64);
const ledger = (state, overrides = {}) => ({
  schemaVersion: 1,
  generation: overrides.generation ?? 7,
  state,
  releaseDigest: overrides.releaseDigest ?? releaseDigest,
  fingerprint: overrides.fingerprint ?? fingerprint,
  pages: overrides.pages ?? 'disabled',
});
const current = (state = 'present', overrides = {}) => ({
  state,
  releaseDigest: overrides.releaseDigest ?? releaseDigest,
  ...overrides,
});
const manifest = (status = 'verified', overrides = {}) => ({
  status,
  releaseDigest: overrides.releaseDigest ?? releaseDigest,
  fingerprint: overrides.fingerprint ?? fingerprint,
  expired: overrides.expired ?? false,
});

const directory = await mkdtemp(resolve(tmpdir(), 'meetwise-preview-publication-'));
const releaseRoot = resolve(directory, 'releases');
const pointer = resolve(directory, 'current');
const permitPath = resolve(directory, 'state', 'serving-permit.json');
const releaseDirectory = resolve(releaseRoot, releaseDigest);
const predecessorDirectory = resolve(releaseRoot, predecessorDigest);

const checks = [
  ['only matching verified ledger, manifest and current may serve publicly', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledger('verified'), manifest: manifest(), current: current() }), { action: 'serve_public' })],
  ['unpublished matching release is loopback-only even with a revoked predecessor manifest', () => {
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledger('active_unpublished'), manifest: null, current: current() }), { action: 'serve_loopback' });
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledger('active_unpublished'), manifest: manifest('revoked', { releaseDigest: predecessorDigest }), current: current() }), { action: 'serve_loopback' });
  }],
  ['an edge probe is explicitly permitted only during the in-flight release and boot recovery aborts it', () => {
    const edgeLedger = ledger('edge_probing');
    assert.deepEqual(decideServingPermit({ ledger: edgeLedger, manifest: null, current: current() }), {
      action: 'serve_edge_probe', releaseDigest, generation: 7, fingerprint,
    });
    assert.deepEqual(decidePublicationReconciliation({ ledger: edgeLedger, manifest: null, current: current() }), {
      action: 'abort_edge_probe', releaseDigest,
    });
    assert.equal(decidePublicationReconciliation({ ledger: edgeLedger, manifest: manifest(), current: current() }).action, 'revoke_public_manifest');
    assert.equal(decideServingPermit({ ledger: edgeLedger, manifest: manifest(), current: current() }).action, 'block');
  }],
  ['staged candidate pointer is never treated as activated', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledger('staged'), manifest: null, current: current() }), { action: 'block', reason: 'preview_reconcile_current_or_state_mismatch' })],
  ['publish crash or a pointer mismatch revokes the actual public manifest first', () => {
    assert.equal(decidePublicationReconciliation({ ledger: ledger('publishing'), manifest: manifest(), current: current() }).action, 'revoke_public_manifest');
    assert.equal(decidePublicationReconciliation({ ledger: ledger('verified'), manifest: manifest(), current: current('present', { releaseDigest: predecessorDigest }) }).action, 'revoke_public_manifest');
  }],
  ['expired verified manifest never returns a public serving action', () =>
    assert.equal(decidePublicationReconciliation({ ledger: ledger('verified'), manifest: manifest('verified', { expired: true }), current: current() }).action, 'revoke_public_manifest')],
  ['confirmed revocation requires matching release, fingerprint and disabled Pages state', () => {
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledger('revoked'), manifest: manifest('revoked'), current: current('absent') }), { action: 'disabled' });
    assert.equal(decidePublicationReconciliation({ ledger: ledger('revoked'), manifest: manifest('revoked', { fingerprint: 'd'.repeat(64) }), current: current('absent') }).action, 'confirm_revocation');
  }],
  ['missing public manifest during publishing or verified state fails closed', () => {
    assert.equal(decidePublicationReconciliation({ ledger: ledger('publishing'), manifest: null, current: current() }).action, 'block');
    assert.equal(decidePublicationReconciliation({ ledger: ledger('verified'), manifest: null, current: current() }).action, 'block');
  }],
  ['invalid current pointer is never eligible for local or public serving', () => {
    assert.equal(decidePublicationReconciliation({ ledger: ledger('active_unpublished'), manifest: null, current: current('invalid', { reason: 'bad' }) }).action, 'block');
    assert.equal(decideServingPermit({ ledger: ledger('verified'), manifest: manifest(), current: current('invalid', { reason: 'bad' }) }).action, 'block');
  }],
  ['current pointer replacement is exercised with durable rename-and-parent-sync helper', async () => {
    await mkdir(releaseDirectory, { recursive: true });
    await mkdir(predecessorDirectory, { recursive: true });
    assert.equal((await inspectCurrentPointer(pointer, releaseRoot)).state, 'absent');
    assert.equal((await switchCurrentPointer({ pointerPath: pointer, releaseRoot, releaseDirectory })).releaseDigest, releaseDigest);
    assert.equal((await switchCurrentPointer({ pointerPath: pointer, releaseRoot, releaseDirectory: predecessorDirectory })).releaseDigest, predecessorDigest);
    await clearCurrentPointer(pointer);
    assert.equal((await inspectCurrentPointer(pointer, releaseRoot)).state, 'absent');
  }],
  ['serving permit is durable and binds mode, release, ledger generation and fingerprint', async () => {
    const publicDecision = decideServingPermit({ ledger: ledger('verified'), current: current(), manifest: manifest() });
    await issueServingPermit(permitPath, publicDecision);
    assert.equal((await validateServingPermit(permitPath, publicDecision)).mode, 'public');
    const staleGeneration = decideServingPermit({ ledger: ledger('verified', { generation: 8 }), current: current(), manifest: manifest() });
    await assert.rejects(() => validateServingPermit(permitPath, staleGeneration), /preview_permit_mismatch/);
    await clearServingPermit(permitPath);
    await assert.rejects(() => validateServingPermit(permitPath, publicDecision));
  }],
  ['pointer and permit helpers fsync their containing directory after atomic replacement', () => {
    assert.match(currentSource, /await rename\(temporary, pointerPath\);/);
    assert.match(currentSource, /await syncDirectory\(pointerParent\);/);
    assert.match(permitSource, /await rename\(temporary, path\);/);
    assert.match(permitSource, /await syncDirectory\(dirname\(path\)\);/);
  }],
  ['reconciliation catches unreadable manifests and disables edge, permit, Web and candidates', () => {
    assert.match(reconcileSource, /preview_reconcile_public_manifest_unverifiable/);
    assert.match(reconcileSource, /controller_disable_serving/);
    assert.match(controllerSource, /controller_stop_preview_candidates/);
    assert.match(controllerSource, /systemctl stop --wait meetwise-web-preview\.service/);
    assert.match(reconcileSource, /preview_reconcile_public_manifest_missing/);
    assert.match(reconcileSource, /controller_ledger_transition "\$state" failed/);
  }],
  ['boot recovery owns mutation while every Web start only validates the exact permit before Node', () => {
    assert.match(unitSource, /ExecStartPre=\+\/usr\/local\/lib\/meetwise-preview-controller\/ensure-preview-web-serving\.sh/);
    assert.match(unitSource, /Requires=meetwise-preview-recovery\.service/);
    assert.doesNotMatch(ensureSource, /controller_lock/);
    assert.doesNotMatch(ensureSource, /controller_reconcile_publication/);
    assert.match(ensureSource, /controller_validate_serving_permit/);
    assert.match(bootRecoverySource, /controller_lock/);
    assert.match(bootRecoverySource, /controller_reconcile_publication/);
    assert.match(bootRecoveryUnitSource, /Before=meetwise-web-preview\.service/);
  }],
  ['child control-plane scripts require an inherited file descriptor lock rather than an environment assertion', () => {
    assert.match(controllerSource, /\/run\/meetwise-preview-controller\/controller\.lock/);
    assert.doesNotMatch(controllerSource, /\/run\/lock\/meetwise-preview-controller/);
    assert.match(controllerSource, /\/proc\/\$\$\/fd\/9/);
    assert.match(controllerSource, /flock -n 9/);
    assert.doesNotMatch(controllerSource, /MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD/);
  }],
  ['installer payload rejects direct sudo execution and requires independent verified bootstrap staging', () => {
    assert.match(installerSource, /controller installer must run only from the verified bootstrap payload/);
    assert.match(installerSource, /bootstrap_parent=\/var\/lib\/meetwise-preview-bootstrap/);
    assert.match(installerSource, /\^verified-controller-\[a-f0-9\]\{64\}\$/);
    assert.match(installerSource, /receipt\.bootstrapSlot !== basename\(bootstrapRoot\)/);
    assert.match(installerSource, /receipt\.expectedArchiveSha256 !== archiveSha256/);
    assert.match(installerSource, /controller installer invocation path must be canonical and non-symlinked/);
    assert.doesNotMatch(installerSource, /usage: sudo install-preview-controller\.sh/);
  }],
  ['recovery policy remains current-aware rather than ledger-only', () => {
    assert.match(recoverySource, /currentMatches\(ledger, current\)/);
    assert.match(recoverySource, /manifest\.expired/);
    assert.doesNotMatch(recoverySource, /action: 'stable'/);
  }],
];

try {
  for (const [name, check] of checks) {
    await check();
    console.log(`✓ ${name}`);
  }
  console.log(`preview publication recovery ${checks.length}/${checks.length} assertions passed; ECS fault-injection and releaseEvidence remain pending`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
