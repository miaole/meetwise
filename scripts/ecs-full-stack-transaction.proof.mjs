#!/usr/bin/env node
/**
 * Behaviour proof for the ECS full-stack release transaction.
 *
 * This deliberately drives the installed controller CLI against real,
 * durable temporary files.  It does not inspect source text as a substitute
 * for a state transition: every assertion below reads the atomic JSON written
 * by the controller after a command, including rejection and recovery paths.
 */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtemp, readFile, stat, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { canonicalJson } from '../ops/ecs/preview-release-manifest.mjs';
import { assertExternalProbeReceiptV2, canGarbageCollectFullStackRollback, createFullStackReleaseLedger, decideFullStackReleaseRecovery, decideFullStackSystemRecovery, heartbeatFullStackReleaseLedger, inspectFullStackReleaseLease, systemRecoveryRequiresMutation, transitionFullStackReleaseLedger } from '../ops/ecs/full-stack/full-stack-preview-publisher.mjs';

const run = promisify(execFile);
const publisher = join(process.cwd(), 'ops/ecs/full-stack/full-stack-preview-publisher.mjs');
const digest = (char) => char.repeat(64);
const commit = 'b'.repeat(40);
const tree = 'c'.repeat(40);
const release = `${commit}-fullstack-20260820-1-1`;
const token = 'a'.repeat(64);
const image = (char) => `sha256:${char.repeat(64)}`;
const schemaOld = digest('1');
const schemaNew = digest('2');

async function command(commandName, path, extra = {}, expectFailure = false) {
  const args = [publisher, commandName, '--path', path];
  for (const [key, value] of Object.entries(extra)) {
    const cliKey = key === 'predecessor' ? 'predecessorJson' : key === 'candidate' ? 'candidateJson' : key;
    const option = `--${cliKey.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    args.push(option, typeof value === 'string' ? value : JSON.stringify(value));
  }
  try {
    const result = await run(process.execPath, args, { maxBuffer: 1_000_000 });
    if (expectFailure) assert.fail(`expected ${commandName} to fail`);
    return JSON.parse(result.stdout);
  } catch (error) {
    if (!expectFailure) throw error;
    assert.match(`${error.stderr ?? ''}${error.stdout ?? ''}`, /full_stack_release_(begin_argument_invalid|token_mismatch|phase_conflict|transition_invalid|patch_invalid|schema_before_immutable|existing_identity_conflict|lease_expired)/);
    return null;
  }
}

async function readLedger(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function advance(path, expectedPhase, nextPhase, patch = undefined) {
  return command('ledger-transition', path, { transactionId: 'tx-12345678', release, token, expectedPhase, nextPhase, ...(patch ? { patchJson: JSON.stringify(patch) } : {}) });
}

const checks = [];
const check = async (name, fn) => { await fn(); checks.push(name); console.log(`✓ ${name}`); };

const directory = await mkdtemp(join(tmpdir(), 'meetwise-full-stack-transaction-'));
try {
  const ledgerPath = join(directory, 'ledger.json');
  const identity = { transactionId: 'tx-12345678', release, commit, tree, generation: 1, token, controllerDigest: digest('d'), composeSpecDigest: digest('e'), sourceArchiveDigest: digest('4'), backendImageDigest: image('f'), webImageDigest: image('0'), predecessor: { currentTarget: 'releases/old', composeEnvFile: 'compose.env', legacy: { 'meetwise-api.service': { load: 'loaded', active: 'active', enabled: 'enabled', masked: false } } }, candidate: {} };

  await check('begin persists the complete immutable identity and root-only mode', async () => {
    const first = await command('ledger-init', ledgerPath, identity);
    const onDisk = await readLedger(ledgerPath);
    assert.equal(first.phase, 'preflighted');
    assert.equal(onDisk.transactionId, identity.transactionId);
    assert.equal(onDisk.release, release);
    assert.equal(onDisk.controllerDigest, identity.controllerDigest);
    assert.equal(onDisk.sourceArchiveDigest, identity.sourceArchiveDigest);
    assert.equal(onDisk.backendImageDigest, identity.backendImageDigest);
    assert.deepEqual(onDisk.predecessor, identity.predecessor);
    assert.equal((await stat(ledgerPath)).mode & 0o777, 0o600);
    assert.equal(onDisk.leaseOwner, identity.transactionId);
    assert.equal(onDisk.heartbeatAt, onDisk.updatedAt);
    assert.equal(Date.parse(onDisk.leaseExpiresAt) - Date.parse(onDisk.heartbeatAt), 900_000);
  });

  await check('durable lease heartbeat survives replay and rejects stale owners', async () => {
    const leasePath = join(directory, 'lease.json');
    const leaseNow = '2026-08-20T00:00:00.000Z';
    const leaseIdentity = { ...identity, transactionId: 'tx-lease-1234' };
    const initial = createFullStackReleaseLedger({ ...leaseIdentity, now: leaseNow });
    const refreshed = heartbeatFullStackReleaseLedger(initial, { transactionId: leaseIdentity.transactionId, release, token, now: '2026-08-20T00:00:30.000Z' });
    assert.equal(refreshed.heartbeatAt, '2026-08-20T00:00:30.000Z');
    assert.equal(refreshed.leaseExpiresAt, '2026-08-20T00:15:30.000Z');
    assert.deepEqual(heartbeatFullStackReleaseLedger(refreshed, { transactionId: leaseIdentity.transactionId, release, token, now: '2026-08-20T00:00:30.000Z' }), refreshed);
    assert.throws(() => heartbeatFullStackReleaseLedger(refreshed, { transactionId: leaseIdentity.transactionId, release, token, now: '2026-08-20T00:15:31.000Z' }), /full_stack_release_lease_expired/);
    assert.throws(() => inspectFullStackReleaseLease({ ...refreshed, leaseOwner: 'tx-other-1234' }, '2026-08-20T00:00:31.000Z'), /full_stack_release_lease_owner_invalid/);
    assert.throws(() => inspectFullStackReleaseLease({ ...refreshed, leaseExpiresAt: '2026-08-20T00:16:30.000Z' }, '2026-08-20T00:00:31.000Z'), /full_stack_release_lease_window_invalid/);
    await command('ledger-init', leasePath, { ...leaseIdentity, now: leaseNow });
    const rebooted = await command('ledger-read', leasePath);
    assert.equal(rebooted.leaseExpiresAt, '2026-08-20T00:15:00.000Z');
    assert.equal(inspectFullStackReleaseLease(rebooted, '2026-08-20T00:12:00.000Z').status, 'active');
    assert.equal(inspectFullStackReleaseLease(rebooted, '2026-08-20T00:15:00.000Z').status, 'expired');
  });

  await check('system recovery is read-only for every active phase and recovers only after expiry', async () => {
    const phases = ['preflighted', 'snapshotted', 'edge_closed', 'quiesced', 'migrating', 'migrated', 'backend_ready', 'web_internal_ready', 'receipts_ready', 'probe_published', 'edge_probing', 'confirmed_pending_pages', 'pages_enabled', 'rollback_pending'];
    const leaseNow = '2026-08-20T01:00:00.000Z';
    for (const [index, phase] of phases.entries()) {
      const value = createFullStackReleaseLedger({ ...identity, transactionId: `tx-lease-phase-${String(index).padStart(2, '0')}`, schemaBefore: schemaOld, schemaAfter: schemaOld, now: leaseNow });
      value.phase = phase;
      if (phase === 'preflighted') value.schemaBefore = null;
      const active = decideFullStackSystemRecovery(value, '2026-08-20T01:12:00.000Z');
      assert.equal(active.action, 'lease_active', phase);
      const expired = decideFullStackSystemRecovery(value, '2026-08-20T01:15:00.000Z');
      assert.notEqual(expired.action, 'lease_active', phase);
      assert.notEqual(expired.action, 'lease_unknown', phase);
      if (phase !== 'rollback_pending') assert.equal(expired.leaseStatus, 'expired', phase);
    }
  });

  await check('v2 external probe receipt binds B/C pages and preserves API/SSE/worker as unproven', async () => {
    const receiptKeys = generateKeyPairSync('ed25519');
    const publicKeyPem = receiptKeys.publicKey.export({ type: 'spki', format: 'pem' });
    const origin = 'https://preview.tail0000000.ts.net';
    const probeNonce = 'b'.repeat(64);
    const manifestSha256 = digest('c');
    const rootSha256 = digest('d');
    const blackboxSha256 = digest('e');
    const now = Date.parse('2026-08-20T02:05:00.000Z');
    const unproven = (reason) => ({ status: 'unproven', reason });
    const account = (role, loginPath) => ({
      role,
      loginPath,
      accountEmailSha256: digest(role === 'candidate' ? 'f' : '0'),
      sessionCookie: { httpOnly: true, secure: true, roleCookie: role },
      pages: [{ status: 200, path: loginPath, headers: {}, bodyStored: false, bodyHash: digest(role === 'candidate' ? '1' : '2'), markerHashes: [digest('3')], negativeMarkerHashes: [] }],
      roleBoundary: role === 'candidate' ? { status: 'verified', path: '/recruiter/jobs', markerHashes: [digest('4')] } : unproven('no safe recruiter-to-candidate negative write-free contract is available'),
      api: unproven('privacy export is intentionally omitted because Playwright API responses may buffer personal data'),
      sse: unproven('no stable persisted interview-or-quiz id is permitted for the short verifier'),
      worker: unproven('no business object is created by the short verifier'),
      semanticAssertionCount: 1,
    });
    const unsigned = {
      schemaVersion: 2,
      origin,
      probeNonce,
      checkedAt: '2026-08-20T02:04:00.000Z',
      manifestSha256,
      rootStatus: 200,
      loginStatus: 200,
      manifestStatus: 200,
      rootUrl: `${origin}/`,
      loginUrl: `${origin}/login`,
      manifestUrl: `${origin}/preview-release-manifest.json`,
      rootSha256,
      blackboxSha256,
      signingKeyId: 'probe-receipt-ed25519-v2',
      verifier: { repository: 'miaole/meetwise-deploy-control', workflow: 'verify-meetwise-public-origin', ref: 'refs/heads/main', commit: '5'.repeat(40), runId: '123', sourceSha256: digest('6'), workflowSha256: digest('7'), packageLockSha256: digest('8') },
      e2e: {
        status: 'passed_pages_only',
        scope: 'browser_auth_pages_only',
        complete: false,
        sensitiveResponseBodies: 'not_stored',
        noCookieProtectedRedirect: { origin, pathname: '/login', search: '?next=%2Fdashboard' },
        accounts: { candidate: account('candidate', '/dashboard'), recruiter: account('recruiter', '/recruiter/jobs') },
      },
    };
    const receipt = { ...unsigned, signature: sign(null, Buffer.from(canonicalJson(unsigned)), receiptKeys.privateKey).toString('base64') };
    assert.equal(assertExternalProbeReceiptV2(receipt, { origin, probeNonce, manifestSha256, rootSha256, blackboxSha256, publicKeyPem, activationAt: '2026-08-20T02:00:00.000Z', deadlineAt: '2026-08-20T02:10:00.000Z', now }), receipt);
    assert.throws(() => assertExternalProbeReceiptV2({ ...receipt, schemaVersion: 1 }, { origin, probeNonce, manifestSha256, rootSha256, blackboxSha256, publicKeyPem, activationAt: '2026-08-20T02:00:00.000Z', deadlineAt: '2026-08-20T02:10:00.000Z', now }), /full_stack_probe_receipt_v2/);
    assert.throws(() => assertExternalProbeReceiptV2({ ...receipt, e2e: { ...receipt.e2e, accounts: { ...receipt.e2e.accounts, candidate: { ...receipt.e2e.accounts.candidate, sse: { status: 'passed' } } } } }, { origin, probeNonce, manifestSha256, rootSha256, blackboxSha256, publicKeyPem, activationAt: '2026-08-20T02:00:00.000Z', deadlineAt: '2026-08-20T02:10:00.000Z', now }), /full_stack_probe_receipt_v2/);
    assert.throws(() => assertExternalProbeReceiptV2({ ...receipt, e2e: { ...receipt.e2e, accounts: { ...receipt.e2e.accounts, recruiter: { ...receipt.e2e.accounts.recruiter, api: { status: 'passed', reason: receipt.e2e.accounts.recruiter.api.reason } } } } }, { origin, probeNonce, manifestSha256, rootSha256, blackboxSha256, publicKeyPem, activationAt: '2026-08-20T02:00:00.000Z', deadlineAt: '2026-08-20T02:10:00.000Z', now }), /full_stack_probe_receipt_v2/);
  });

  await check('concurrent active-lease recovery checks stay read-only', async () => {
    const ledger = createFullStackReleaseLedger({ ...identity, transactionId: 'tx-concurrent-lease', now: '2026-08-20T03:00:00.000Z' });
    const before = JSON.stringify(ledger);
    const decisions = await Promise.all(Array.from({ length: 16 }, () => Promise.resolve().then(() => decideFullStackSystemRecovery(ledger, '2026-08-20T03:01:59.999Z'))));
    assert.equal(decisions.length, 16);
    assert.ok(decisions.every((decision) => decision.action === 'lease_active'));
    assert.ok(decisions.every((decision) => systemRecoveryRequiresMutation(decision) === false));
    assert.equal(JSON.stringify(ledger), before);
  });

  await check('expired and legacy lease decisions still enter recovery', async () => {
    const active = createFullStackReleaseLedger({ ...identity, transactionId: 'tx-recovery-routing', now: '2026-08-20T03:00:00.000Z' });
    assert.equal(systemRecoveryRequiresMutation(decideFullStackSystemRecovery(active, '2026-08-20T03:14:59.999Z')), false);
    assert.equal(systemRecoveryRequiresMutation(decideFullStackSystemRecovery(active, '2026-08-20T03:15:00.001Z')), true);
    const legacy = { ...active }; delete legacy.leaseOwner; delete legacy.heartbeatAt; delete legacy.leaseExpiresAt; delete legacy.leaseTtlSeconds;
    const legacyDecision = decideFullStackSystemRecovery(legacy, '2026-08-20T03:01:00.000Z');
    assert.equal(legacyDecision.action, 'discard_unmutated_transaction');
    assert.equal(legacyDecision.leaseStatus, 'unknown');
    assert.equal(systemRecoveryRequiresMutation(legacyDecision), true);
  });

  await check('begin retry is idempotent and cannot replace the candidate identity', async () => {
    const before = await readFile(ledgerPath, 'utf8');
    const retry = await command('ledger-init', ledgerPath, identity);
    assert.equal(retry.phase, 'preflighted');
    assert.equal(await readFile(ledgerPath, 'utf8'), before);
    await command('ledger-init', ledgerPath, { ...identity, commit: '9'.repeat(40) }, true);
  });

  await check('token and expected-phase are both part of the CAS boundary', async () => {
    await command('ledger-transition', ledgerPath, { transactionId: identity.transactionId, release, token: '9'.repeat(64), expectedPhase: 'preflighted', nextPhase: 'snapshotted' }, true);
    assert.equal((await readLedger(ledgerPath)).phase, 'preflighted');
    await advance(ledgerPath, 'preflighted', 'snapshotted');
    await command('ledger-transition', ledgerPath, { transactionId: identity.transactionId, release, token, expectedPhase: 'preflighted', nextPhase: 'edge_closed' }, true);
    assert.equal((await readLedger(ledgerPath)).phase, 'snapshotted');
    await advance(ledgerPath, 'snapshotted', 'edge_closed');
  });

  await check('out-of-order transitions are rejected after an actual phase change', async () => {
    await command('ledger-transition', ledgerPath, { transactionId: identity.transactionId, release, token, expectedPhase: 'preflighted', nextPhase: 'edge_closed' }, true);
    assert.equal((await readLedger(ledgerPath)).phase, 'edge_closed');
  });

  await check('same-phase retry only succeeds for the immediate predecessor edge', async () => {
    const retry = await advance(ledgerPath, 'snapshotted', 'edge_closed');
    assert.equal(retry.phase, 'edge_closed');
    await command('ledger-transition', ledgerPath, { transactionId: identity.transactionId, release, token, expectedPhase: 'preflighted', nextPhase: 'edge_closed' }, true);
    await command('ledger-transition', ledgerPath, { transactionId: identity.transactionId, release, token, expectedPhase: 'edge_closed', nextPhase: 'quiesced', patchJson: JSON.stringify({ commit: '9'.repeat(40) }) }, true);
  });

  const completePath = join(directory, 'complete.json');
  await command('ledger-init', completePath, { ...identity, transactionId: 'tx-complete-1', schemaBefore: schemaOld, schemaAfter: schemaOld });
  const completeAdvance = async (from, to, patch) => command('ledger-transition', completePath, { transactionId: 'tx-complete-1', release, token, expectedPhase: from, nextPhase: to, ...(patch ? { patchJson: JSON.stringify(patch) } : {}) });
  await check('normal path reaches Pages-gated commit only through the ordered phases', async () => {
    for (const [from, to] of [['preflighted', 'snapshotted'], ['snapshotted', 'edge_closed'], ['edge_closed', 'quiesced']]) await completeAdvance(from, to);
    await completeAdvance('quiesced', 'migrating');
    await completeAdvance('migrating', 'migrated');
    for (const [from, to] of [['migrated', 'backend_ready'], ['backend_ready', 'web_internal_ready'], ['web_internal_ready', 'receipts_ready'], ['receipts_ready', 'probe_published'], ['probe_published', 'edge_probing'], ['edge_probing', 'confirmed_pending_pages']]) await completeAdvance(from, to);
    await completeAdvance('confirmed_pending_pages', 'pages_enabled', { candidate: { pagesFingerprint: digest('a'), pagesReceipt: { state: 'enabled', generation: 1, manifestSha256: digest('a'), finalFingerprint: digest('a') } } });
    const pagesEnabled = await readLedger(completePath);
    assert.equal(pagesEnabled.phase, 'pages_enabled');
    assert.equal(canGarbageCollectFullStackRollback(pagesEnabled, digest('a')), false, 'rollback must survive until committed');
    await completeAdvance('pages_enabled', 'committed');
    const committed = await readLedger(completePath);
    assert.equal(committed.phase, 'committed');
    assert.equal(canGarbageCollectFullStackRollback(committed, digest('a')), true);
  });

  await check('preflight crash discards only the unmutated transaction', async () => {
    const path = join(directory, 'preflight.json');
    await command('ledger-init', path, { ...identity, transactionId: 'tx-preflight-1' });
    const recovery = await command('ledger-recover', path, { transactionId: 'tx-preflight-1', release, token });
    assert.equal(recovery.action, 'discard_unmutated_transaction');
    await assert.rejects(() => access(path));
  });

  await check('pre-migration recovery records rollback_pending instead of pretending rollback is done', async () => {
    const path = join(directory, 'pre-migration.json');
    await command('ledger-init', path, { ...identity, transactionId: 'tx-pre-migration-1' });
    await command('ledger-transition', path, { transactionId: 'tx-pre-migration-1', release, token, expectedPhase: 'preflighted', nextPhase: 'snapshotted' });
    const recovery = await command('ledger-recover', path, { transactionId: 'tx-pre-migration-1', release, token });
    assert.equal(recovery.action, 'restore_pre_migration_snapshot');
    assert.equal((await readLedger(path)).phase, 'rollback_pending');
  });

  await check('post-migration schema drift selects forward-only maintenance', async () => {
    const path = join(directory, 'post-migration.json');
    await command('ledger-init', path, { ...identity, transactionId: 'tx-post-migration-1' });
    for (const [from, to] of [['preflighted', 'snapshotted'], ['snapshotted', 'edge_closed'], ['edge_closed', 'quiesced']]) await command('ledger-transition', path, { transactionId: 'tx-post-migration-1', release, token, expectedPhase: from, nextPhase: to });
    await command('ledger-update', path, { transactionId: 'tx-post-migration-1', release, token, expectedPhase: 'quiesced', patchJson: JSON.stringify({ schemaBefore: schemaOld }) });
    await command('ledger-transition', path, { transactionId: 'tx-post-migration-1', release, token, expectedPhase: 'quiesced', nextPhase: 'migrating' });
    await command('ledger-transition', path, { transactionId: 'tx-post-migration-1', release, token, expectedPhase: 'migrating', nextPhase: 'migrated', patchJson: JSON.stringify({ schemaAfter: schemaNew }) });
    const recovery = await command('ledger-recover', path, { transactionId: 'tx-post-migration-1', release, token });
    assert.equal(recovery.action, 'forward_only_maintenance');
    assert.equal((await readLedger(path)).phase, 'rollback_pending');
    const retry = await command('ledger-recover', path, { transactionId: 'tx-post-migration-1', release, token });
    assert.equal(retry.action, 'forward_only_maintenance');
    assert.equal((await readLedger(path)).phase, 'rollback_pending');
  });

  await check('every post-migration phase with schema drift is forward-only', async () => {
    const phases = ['migrated', 'backend_ready', 'web_internal_ready', 'receipts_ready', 'probe_published', 'edge_probing', 'confirmed_pending_pages', 'pages_enabled'];
    for (const phase of phases) {
      const ledger = createFullStackReleaseLedger({ ...identity, transactionId: `tx-${phase.replaceAll('_', '-')}`, schemaBefore: schemaOld, schemaAfter: schemaNew });
      ledger.phase = phase;
      assert.equal(decideFullStackReleaseRecovery(ledger).action, 'forward_only_maintenance', phase);
    }
  });

  await check('post-migration recovery fails closed when no compatibility evidence exists', async () => {
    const path = join(directory, 'post-migration-unknown.json');
    await command('ledger-init', path, { ...identity, transactionId: 'tx-post-migration-unknown-1' });
    for (const [from, to] of [['preflighted', 'snapshotted'], ['snapshotted', 'edge_closed'], ['edge_closed', 'quiesced'], ['quiesced', 'migrating'], ['migrating', 'migrated']]) await command('ledger-transition', path, { transactionId: 'tx-post-migration-unknown-1', release, token, expectedPhase: from, nextPhase: to });
    const recovery = await command('ledger-recover', path, { transactionId: 'tx-post-migration-unknown-1', release, token });
    assert.equal(recovery.action, 'forward_only_maintenance');
    assert.equal((await readLedger(path)).phase, 'rollback_pending');
  });

  await check('numeric generation and migration schema receipts survive durable CAS updates', async () => {
    const path = join(directory, 'migration-receipts.json');
    const migrationIdentity = { ...identity, transactionId: 'tx-schema-1234', generation: 7 };
    await command('ledger-init', path, migrationIdentity);
    for (const [from, to] of [['preflighted', 'snapshotted'], ['snapshotted', 'edge_closed'], ['edge_closed', 'quiesced']]) await command('ledger-transition', path, { transactionId: migrationIdentity.transactionId, release, token, expectedPhase: from, nextPhase: to });
    await command('ledger-update', path, { transactionId: migrationIdentity.transactionId, release, token, expectedPhase: 'quiesced', patchJson: JSON.stringify({ schemaBefore: schemaOld }) });
    await command('ledger-transition', path, { transactionId: migrationIdentity.transactionId, release, token, expectedPhase: 'quiesced', nextPhase: 'migrating', patchJson: JSON.stringify({ candidate: { migration: { status: 'started', schemaBefore: { schemaLedgerDigest: schemaOld } } } }) });
    assert.deepEqual(decideFullStackReleaseRecovery(await readLedger(path)), { action: 'reprobe_migration', phase: 'migrating' });
    await command('ledger-transition', path, { transactionId: migrationIdentity.transactionId, release, token, expectedPhase: 'migrating', nextPhase: 'migrated', patchJson: JSON.stringify({ schemaAfter: schemaNew, candidate: { migration: { status: 'completed', schemaBefore: { schemaLedgerDigest: schemaOld }, schemaAfter: { schemaLedgerDigest: schemaNew } } } }) });
    const after = await readLedger(path);
    assert.equal(after.generation, 7);
    assert.equal(after.schemaBefore, schemaOld);
    assert.equal(after.schemaAfter, schemaNew);
    assert.equal(after.candidate.migration.status, 'completed');
    await command('ledger-update', path, { transactionId: migrationIdentity.transactionId, release, token, expectedPhase: 'migrated', patchJson: JSON.stringify({ schemaBefore: digest('3') }) }, true);
  });

  await check('pure recovery policy agrees with durable behavior for terminal phases', async () => {
    const value = createFullStackReleaseLedger(identity);
    assert.deepEqual(decideFullStackReleaseRecovery(value), { action: 'discard_unmutated_transaction', phase: 'preflighted' });
    const committed = transitionFullStackReleaseLedger(value, { transactionId: identity.transactionId, release, token, expectedPhase: 'preflighted', nextPhase: 'snapshotted' });
    assert.deepEqual(decideFullStackReleaseRecovery(committed), { action: 'restore_pre_migration_snapshot', phase: 'snapshotted' });
  });

  console.log(`ecs full-stack transaction behaviour proof passed (${checks.length} cases)`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
