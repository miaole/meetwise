import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { decidePublicationReconciliation } from '../ops/ecs/preview-publication-recovery.mjs';
import { publishManifestAtomically } from '../ops/ecs/preview-release-manifest.mjs';

const root = process.cwd();
const ledger = await readFile(resolve(root, 'ops/ecs/preview-release-ledger.mjs'), 'utf8');
const manifest = await readFile(resolve(root, 'ops/ecs/preview-release-manifest.mjs'), 'utf8');
const reconcile = await readFile(resolve(root, 'ops/ecs/reconcile-preview-publication.sh'), 'utf8');
const revoke = await readFile(resolve(root, 'ops/ecs/revoke-preview-pages-link.sh'), 'utf8');
const release = await readFile(resolve(root, 'ops/ecs/release-preview-web.sh'), 'utf8');

const fingerprint = 'b'.repeat(64);
const releaseDigest = 'a'.repeat(40);
const ledgerState = (state, overrides = {}) => ({
  schemaVersion: 1,
  generation: 1,
  state,
  releaseDigest: overrides.releaseDigest ?? releaseDigest,
  fingerprint: overrides.fingerprint ?? fingerprint,
});
const manifestState = (status, overrides = {}) => ({
  status,
  releaseDigest: overrides.releaseDigest ?? releaseDigest,
  fingerprint: overrides.fingerprint ?? fingerprint,
});
const directory = await mkdtemp(resolve(tmpdir(), 'meetwise-preview-publication-'));

const checks = [
  ['unpublished release without a public manifest is stable', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('active_unpublished'), manifest: null }), { action: 'stable' })],
  ['publishing without a public manifest blocks rather than switching release', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('publishing'), manifest: null }), { action: 'block', reason: 'preview_reconcile_public_manifest_missing' })],
  ['verified ledger and identical verified public manifest are stable', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('verified'), manifest: manifestState('verified') }), { action: 'stable' })],
  ['crash after manifest publication and before verified state revokes first', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('publishing'), manifest: manifestState('verified') }), { action: 'revoke_public_manifest', releaseDigest, fingerprint })],
  ['ledger rollback after public manifest publication revokes first', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('active_unpublished'), manifest: manifestState('verified') }), { action: 'revoke_public_manifest', releaseDigest, fingerprint })],
  ['different release or fingerprint never silently proceeds', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('verified'), manifest: manifestState('verified', { fingerprint: 'c'.repeat(64) }) }), { action: 'revoke_public_manifest', releaseDigest, fingerprint: 'c'.repeat(64) })],
  ['public revoked state confirms a nonterminal ledger before release work', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('publishing'), manifest: manifestState('revoked') }), { action: 'confirm_revocation', releaseDigest, fingerprint })],
  ['terminal revoked ledger does not rewrite a public revocation', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('revoked'), manifest: manifestState('revoked', { fingerprint: 'd'.repeat(64) }) }), { action: 'stable' })],
  ['invalid signed-manifest summary blocks', () =>
    assert.deepEqual(decidePublicationReconciliation({ ledger: ledgerState('verified'), manifest: { status: 'verified', releaseDigest, fingerprint: 'invalid' } }), { action: 'block', reason: 'preview_reconcile_public_manifest_invalid' })],
  ['ledger write syncs file and parent directory before returning', () => {
    assert.match(ledger, /await handle\.sync\(\);/);
    assert.match(ledger, /await directory\.sync\(\);/);
  }],
  ['public manifest publication syncs file and parent directory before returning', () => {
    assert.match(manifest, /publishManifestAtomically/);
    assert.match(manifest, /await handle\.sync\(\);/);
    assert.match(manifest, /await directory\.sync\(\);/);
  }],
  ['public manifest replacement is exercised against a temporary root', async () => {
    const source = resolve(directory, 'source.json');
    const destination = resolve(directory, 'public', 'preview-release-manifest.json');
    await writeFile(source, '{"state":"first"}\n');
    await publishManifestAtomically(source, destination);
    assert.equal(await readFile(destination, 'utf8'), '{"state":"first"}\n');
    await writeFile(source, '{"state":"second"}\n');
    await publishManifestAtomically(source, destination);
    assert.equal(await readFile(destination, 'utf8'), '{"state":"second"}\n');
  }],
  ['every release attempt reconciles before reading state or staging a candidate', () => {
    const reconcileAt = release.indexOf('controller_reconcile_publication');
    const ledgerAt = release.indexOf('ledger="$(controller_ledger_read)"');
    const prepareAt = release.indexOf('prepare-preview-web-release.sh');
    assert.ok(reconcileAt >= 0 && reconcileAt < ledgerAt && ledgerAt < prepareAt);
  }],
  ['reconciliation derives decisions from the verified public manifest and only then invokes revocation', () => {
    assert.match(reconcile, /verifyManifest\(manifest, publicKey, \{ allowExpired: true \}\)/);
    assert.match(reconcile, /revoke-preview-pages-link\.sh/);
    assert.match(reconcile, /preview publication reconciliation failed/);
  }],
  ['an unreconcilable public-manifest state disables the Funnel edge before returning failure', () => {
    const disableAt = reconcile.indexOf('tailscale funnel --https=443 off');
    const failureAt = reconcile.indexOf('preview publication reconciliation failed');
    assert.ok(disableAt >= 0 && disableAt < failureAt);
  }],
  ['revocation persists the ledger only after receiving the disabled Pages receipt', () => {
    const receiptAt = revoke.indexOf('receipt_confirmed=1');
    const transitionAt = revoke.indexOf('controller_ledger_transition "$ledger_state" revoked');
    assert.ok(receiptAt >= 0 && receiptAt < transitionAt);
  }],
];

try {
  for (const [name, check] of checks) {
    await check();
    console.log(`✓ ${name}`);
  }
  console.log(`preview publication recovery ${checks.length}/${checks.length} assertions passed; releaseEvidence=false`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
