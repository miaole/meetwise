#!/usr/bin/env node
/**
 * Pure proof for the prepare-time preview composition contract.
 * It does not read /etc/meetwise, connect to RDS, invoke runuser, or write a
 * release artifact.  The real prepare command remains root/controller-only.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { buildPlan, sha256 } from './preview-synthetic-data/catalog.mjs';
import { factoryDigest as loaderFactoryDigest, FACTORY_FILES as LOADER_FACTORY_FILES } from './preview-synthetic-data/loader.mjs';
import { factoryDigest as dbFactoryDigest, FACTORY_FILES as DB_FACTORY_FILES } from './preview-synthetic-data/db-verify.mjs';
import { validateReceiptLayers } from './preview-account-scenarios/runner.mjs';
import { buildApproval, buildTarget, factoryDigest as prepareFactoryDigest, isExactApprovalRetry } from '../ops/ecs/full-stack/prepare-full-stack-release.mjs';
import { assertFullStackPrepareLedger, createFullStackReleaseLedger } from '../ops/ecs/full-stack/full-stack-preview-publisher.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'ops/ecs/full-stack/prepare-full-stack-release.mjs'), 'utf8');
const counts = Object.freeze({ accounts: 220, jobs: 1_000, applications: 10_000, resumes: 600, interviews: 6_000 });
const previous = {
  schemaVersion: 1,
  targetId: 'preview-target-proof',
  rdsInstanceId: 'pgm-proof',
  rdsEndpoint: 'pgm-proof.pg.rds.aliyuncs.com',
  rdsPort: 5432,
  tlsServername: 'pgm-proof.pg.rds.aliyuncs.com',
  expectedDbRole: 'meetwise_preview_audit',
  database: 'meetwise_cloud_test',
  apiBaseUrl: 'http://127.0.0.1:8787',
  approvedProfiles: {
    'showcase-v1': { datasetId: 'preview-showcase-v1', maxDurationSeconds: 600, expectedBaseline: counts, expectedCumulative: counts },
    'large-v1': { datasetId: 'preview-large-v1', maxDurationSeconds: 3_600, expectedBaseline: counts, expectedCumulative: counts },
  },
};
const catalogDigests = {
  'showcase-v1': buildPlan('showcase-v1', 'preview-showcase-v1').catalogDigest,
  'large-v1': buildPlan('large-v1', 'preview-large-v1').catalogDigest,
  'large-v1-successor': buildPlan('large-v1-successor', 'preview-large-v1-successor').catalogDigest,
};
const fakeFactory = 'f'.repeat(64);

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('factory composition includes verifier-env and the deep account runner everywhere', () => {
  const expected = ['catalog.mjs', 'db-verify.mjs', 'loader.mjs', 'target-inspect.mjs', 'verifier-env.mjs', '../preview-account-scenarios/runner.mjs'];
  assert.deepEqual([...LOADER_FACTORY_FILES], expected);
  assert.deepEqual([...DB_FACTORY_FILES], expected);
  assert.equal(prepareFactoryDigest(root, sha256), loaderFactoryDigest());
  assert.equal(prepareFactoryDigest(root, sha256), dbFactoryDigest());
  assert.match(source, /full-stack-verifier\.env/);
  assert.doesNotMatch(source, /childScript = .*full-stack-migrate\.env/);
});

test('target and approval bind successor capacity, deep receipt schema, and both Chinese-facing identities', () => {
  const target = buildTarget(previous, {
    releasePath: '/srv/meetwise-full-stack/releases/proof',
    releaseTreeDigest: '1'.repeat(64),
    apiContractDigest: '2'.repeat(64),
    schemaHead: '0123_user_facing_context_snapshots.sql',
    schemaLedgerDigest: '3'.repeat(64),
    factoryDigest: fakeFactory,
    catalogDigests,
    sha256,
  });
  const successor = target.approvedProfiles['large-v1-successor'];
  assert.equal(successor.datasetId, 'preview-large-v1-successor');
  assert.equal(successor.successorOf, 'large-v1');
  assert.deepEqual(successor.expectedBaseline, counts);
  assert.equal(successor.expectedCumulative.accounts, counts.accounts + 2);
  assert.equal(successor.expectedCumulative.jobs, counts.jobs + 30);
  assert.equal(successor.expectedCumulative.applications, counts.applications + 30);
  assert.equal(successor.expectedCumulative.resumes, counts.resumes + 12);
  assert.equal(successor.expectedCumulative.interviews, counts.interviews);
  assert.deepEqual(successor.fixedAccounts.map(({ email, role, displayName }) => ({ email, role, displayName })), [
    { email: 'previewc@meetwise.com', role: 'candidate', displayName: '预览求职者 C 端' },
    { email: 'previewb@meetwise.com', role: 'recruiter', displayName: '预览招聘方 B 端' },
  ]);
  assert.equal(target.previewData.capacity.profile, 'large-v1-successor');
  assert.equal(target.previewData.capacity.datasetId, 'preview-large-v1-successor');
  assert.equal(target.previewData.capacity.receiptSchema.receiptLayer, 'capacity');
  assert.equal(target.previewData.deepUsage.datasetId, 'preview-deep-usage-v1');
  assert.equal(target.previewData.deepUsage.predecessorCapacityDatasetId, 'preview-large-v1-successor');
  assert.equal(target.previewData.deepUsage.receiptSchema.receiptLayer, 'deep-usage');
  assert.equal(target.previewData.verifier.readOnly, true);
  assert.equal(target.previewData.verifier.requiredEnv.includes('PREVIEW_VERIFY_DATABASE_URL'), true);
  assert.equal(target.previewData.verifier.requiredEnv.includes('PREVIEW_VERIFY_EXPECTED_DATABASE'), true);
  assert.equal(target.previewData.verifier.requiredEnv.includes('PREVIEW_VERIFY_EXPECTED_ROLE'), true);
  assert.equal(target.previewData.verifier.expectedDatabase, 'meetwise_cloud_test');
  assert.equal(target.previewData.verifier.expectedRole, 'meetwise_preview_audit');
  assert.equal(target.database, 'meetwise_cloud_test');
  assert.equal(target.expectedDbRole, 'meetwise_preview_audit');
  assert.equal(target.previewData.verifier.forbiddenEnv.includes('DATABASE_URL'), true);
  const { compositionDigest, ...composition } = target.previewData;
  assert.equal(compositionDigest, sha256(composition));
  assert.doesNotMatch(JSON.stringify(target), /"(?:password|secret)"\s*:/i);

  const proofOrigin = ['https://p', 'tailx', 'ts', 'net'].join('.');
  const approval = buildApproval({
    generation: 1, commit: 'a'.repeat(40), tree: 'b'.repeat(40), releaseDigest: 'abcdef0',
    origin: proofOrigin, webBuildSha256: '4'.repeat(64), staticAssetsSha256: '5'.repeat(64),
    backendImageDigest: `sha256:${'6'.repeat(64)}`, webImageDigest: `sha256:${'7'.repeat(64)}`,
    releasePath: target.releasePath, releaseTreeDigest: target.releaseTreeDigest, apiContractDigest: target.apiContractDigest,
    targetDigest: sha256(target), previewData: target.previewData,
  });
  assert.deepEqual(approval.previewData, target.previewData);
  const upgradedLegacyIdentity = buildTarget({ ...previous, database: 'meetwise_preview', expectedDbRole: 'meetwise_migrate' }, {
    releasePath: '/srv/meetwise-full-stack/releases/proof', releaseTreeDigest: '1'.repeat(64), apiContractDigest: '2'.repeat(64),
    schemaHead: '0123_user_facing_context_snapshots.sql', schemaLedgerDigest: '3'.repeat(64), factoryDigest: fakeFactory, catalogDigests, sha256,
  });
  assert.equal(upgradedLegacyIdentity.database, 'meetwise_cloud_test');
  assert.equal(upgradedLegacyIdentity.expectedDbRole, 'meetwise_preview_audit');
  assert.throws(() => buildTarget(previous, {
    releasePath: '/srv/meetwise-full-stack/releases/proof', releaseTreeDigest: '1'.repeat(64), apiContractDigest: '2'.repeat(64),
    schemaHead: '0123_user_facing_context_snapshots.sql', schemaLedgerDigest: '3'.repeat(64), factoryDigest: fakeFactory, catalogDigests, sha256,
    verifierContract: { readOnly: true, requiredEnv: ['PREVIEW_VERIFY_DATABASE_URL'], expectedDatabase: 'meetwise_preview', expectedRole: 'meetwise_migrate', forbiddenEnv: [] },
  }), /prepare_verifier_contract_invalid/);
});

test('composition accepts a deep receipt without applying capacity zero-side-effect rules to it', () => {
  const result = validateReceiptLayers(
    { schemaVersion: 1, receiptLayer: 'capacity', datasetId: 'preview-large-v1-successor', profile: 'large-v1-successor', targetDigest: 'a'.repeat(64), releaseIdentity: 'proof-release', forbidden: { answerEvents: 0 } },
    { schemaVersion: 1, receiptLayer: 'deep-usage', datasetId: 'preview-deep-usage-v1', scenarioId: 'deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1-successor', targetDigest: 'a'.repeat(64), releaseIdentity: 'proof-release', phase: 'verified_online_projection', observations: { sessions: [{ phase: 'terminal', answeredTurns: 5 }] }, unproven: ['database_forbidden_counters'] },
  );
  assert.equal(result.capacityProfile, 'large-v1-successor');
  assert.throws(() => validateReceiptLayers(
    { schemaVersion: 1, receiptLayer: 'capacity', datasetId: 'preview-large-v1' },
    { schemaVersion: 1, receiptLayer: 'deep-usage', datasetId: 'preview-deep-usage-v1', scenarioId: 'deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1', phase: 'verified_online_projection' },
  ), /capacity_receipt_layer_invalid/);
});

test('source contract forbids generic DB inheritance and keeps passwords outside root artifacts', () => {
  assert.match(source, /PREVIEW_VERIFY_DATABASE_URL/);
  assert.match(source, /PREVIEW_VERIFY_DATABASE_SSL_CA_PATH/);
  assert.match(source, /PREVIEW_VERIFY_PG_TLS_SERVERNAME/);
  assert.match(source, /PREVIEW_VERIFY_EXPECTED_DATABASE/);
  assert.match(source, /PREVIEW_VERIFY_EXPECTED_ROLE/);
  assert.match(source, /meetwise_cloud_test/);
  assert.match(source, /meetwise_preview_audit/);
  assert.match(source, /BEGIN READ ONLY ISOLATION LEVEL REPEATABLE READ/);
  assert.match(source, /unsafe_verifier_env/);
  assert.match(source, /prepare_fixed_preview_credentials_persisted/);
  assert.match(source, /prepare_preview_credentials_persisted/);
  assert.doesNotMatch(source, /connectionString:\s*process\.env\.DATABASE_URL/);
  assert.doesNotMatch(source, /DATABASE_URL=.*compute/);
  assert.match(source, /COMPUTE_TIMEOUT_SECONDS = 600/);
  assert.match(source, /'--kill-after=5s', `\$\{COMPUTE_TIMEOUT_SECONDS\}s`/);
  assert.match(source, /prepare_compute_timeout/);
  assert.match(source, /finalizeLedgerPrepare\(\{/);
  assert.match(source, /stdio\[9\] = 9/);
  const finalCas = source.indexOf('finalizeLedgerPrepare({');
  const artifactWrite = source.indexOf('durableWriteJson(TARGET_PATH');
  assert.ok(finalCas < artifactWrite);
  assert.doesNotMatch(source, /computeArgs[\s\S]{0,800}recovery-token/);
});

test('forced receiver forwards all ten prepare parameters to fake sudo in order', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'meetwise-receiver-proof-'));
  const incoming = join(tempDir, 'incoming');
  const fakeBin = join(tempDir, 'bin');
  const capture = join(tempDir, 'sudo-argv.txt');
  const rootDispatch = join(tempDir, 'root-dispatch');
  const receiver = join(tempDir, 'receiver.sh');
  mkdirSync(incoming, { mode: 0o700 });
  mkdirSync(fakeBin, { mode: 0o700 });
  writeFileSync(join(fakeBin, 'sudo'), '#!/bin/sh\nprintf \'%s\\n\' "$@" > "$CAPTURE"\n', { mode: 0o700 });
  // The production receiver runs on GNU/Linux; this proof also runs on the
  // macOS developer host, whose stat has no `-c` flag.  Stub only the one
  // bounded mode query used before sudo dispatch.
  writeFileSync(join(fakeBin, 'stat'), '#!/bin/sh\n[ "$1" = "-c" ] && [ "$2" = "%a" ] && { printf "700\\n"; exit 0; }\nexit 1\n', { mode: 0o700 });
  writeFileSync(rootDispatch, '#!/bin/sh\nexit 0\n', { mode: 0o700 });
  const receiverSource = readFileSync(join(root, 'ops/ecs/full-stack/meetwise-cd-receive.sh'), 'utf8')
    .replace(/^ROOT_DISPATCH=.*$/m, `ROOT_DISPATCH=${rootDispatch}`)
    .replace(/^INCOMING=.*$/m, `INCOMING=${incoming}`);
  writeFileSync(receiver, receiverSource, { mode: 0o700 });
  const transactionId = 'tx-prepare-proof';
  const release = `${'a'.repeat(40)}-fullstack-20260820-1-1`;
  const token = 'd'.repeat(64);
  const commit = 'b'.repeat(40);
  const tree = 'c'.repeat(40);
  const origin = 'https://preview.tail0000000.ts.net';
  const webBuild = 'f'.repeat(64);
  const staticAssets = '1'.repeat(64);
  const backend = `sha256:${'2'.repeat(64)}`;
  const web = `sha256:${'3'.repeat(64)}`;
  const prepareArgs = [transactionId, release, token, commit, tree, origin, webBuild, staticAssets, backend, web];
  const result = spawnSync('/bin/bash', [receiver], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH ?? ''}`, CAPTURE: capture, SSH_ORIGINAL_COMMAND: ['meetwise-cd', 'prepare', ...prepareArgs].join(' ') },
  });
  try {
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(readFileSync(capture, 'utf8').trimEnd().split('\n'), [rootDispatch, 'prepare', ...prepareArgs]);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('prepare identity is behavioral: only migrated exact-ledger retries may reuse an approval', () => {
  const transactionId = 'tx-prepare-proof';
  const release = `${'a'.repeat(40)}-fullstack-20260820-1-1`;
  const commit = 'b'.repeat(40);
  const tree = 'c'.repeat(40);
  const token = 'd'.repeat(64);
  const ledger = {
    ...createFullStackReleaseLedger({ transactionId, release, commit, tree, generation: 17, token, now: new Date().toISOString() }),
    phase: 'migrated',
  };
  const identity = { transactionId, release, commit, tree, token };
  assert.equal(assertFullStackPrepareLedger(ledger, identity).generation, 17);
  assert.throws(() => assertFullStackPrepareLedger({ ...ledger, phase: 'quiesced' }, identity), /full_stack_prepare_ledger_identity_mismatch/);
  assert.throws(() => assertFullStackPrepareLedger(ledger, { ...identity, token: 'e'.repeat(64) }), /full_stack_release_token_mismatch/);
  assert.throws(() => assertFullStackPrepareLedger(ledger, { ...identity, commit: 'e'.repeat(40) }), /full_stack_prepare_ledger_identity_mismatch/);
  assert.throws(() => assertFullStackPrepareLedger(ledger, { ...identity, tree: 'e'.repeat(40) }), /full_stack_prepare_ledger_identity_mismatch/);

  const proofOrigin = ['https://p', 'tailx', 'ts', 'net'].join('.');
  const expected = {
    commit, tree, origin: proofOrigin,
    webBuildSha256: 'f'.repeat(64), staticAssetsSha256: '1'.repeat(64),
    backendImageDigest: `sha256:${'2'.repeat(64)}`, webImageDigest: `sha256:${'3'.repeat(64)}`,
    releasePath: `/srv/meetwise-full-stack/releases/${release}`, generation: 17,
  };
  const approval = {
    schemaVersion: 1, commit, tree, origin: expected.origin,
    webBuildSha256: expected.webBuildSha256, staticAssetsSha256: expected.staticAssetsSha256,
    images: { backend: expected.backendImageDigest, web: expected.webImageDigest },
    releasePath: expected.releasePath, generation: 17,
    previewData: { capacity: { profile: 'large-v1-successor' }, deepUsage: { scenarioId: 'deep-usage-v1' } },
  };
  assert.equal(isExactApprovalRetry(approval, expected), true);
  assert.equal(isExactApprovalRetry({ ...approval, generation: 16 }, expected), false, 'old-generation approval cannot be reused');
  assert.equal(isExactApprovalRetry({ ...approval, generation: 18 }, expected), false, 'future-generation approval cannot be reused');

  // Exercise the same controller CLI that root calls, including its read →
  // identity check → heartbeat path. A static regex cannot prove wrong-token
  // or wrong-phase requests leave the durable ledger untouched.
  const tempDir = mkdtempSync(join(tmpdir(), 'meetwise-prepare-ledger-'));
  const ledgerPath = join(tempDir, 'ledger.json');
  const publisherPath = join(root, 'ops/ecs/full-stack/full-stack-preview-publisher.mjs');
  const writeLedger = (value) => writeFileSync(ledgerPath, `${JSON.stringify(value)}\n`, { mode: 0o600 });
  const runPrepare = (overrides = {}) => spawnSync(process.execPath, [publisherPath, 'ledger-prepare', '--path', ledgerPath,
    '--transaction-id', overrides.transactionId ?? transactionId, '--release', overrides.release ?? release,
    '--token', overrides.token ?? token, '--commit', overrides.commit ?? commit, '--tree', overrides.tree ?? tree], { encoding: 'utf8' });
  try {
    writeLedger(ledger);
    const success = runPrepare();
    assert.equal(success.status, 0, success.stderr);
    assert.equal(JSON.parse(success.stdout).generation, 17);
    for (const [label, overrides, reason] of [
      ['wrong phase', { phase: 'quiesced' }, 'full_stack_prepare_ledger_identity_mismatch'],
      ['wrong token', { token: 'e'.repeat(64) }, 'full_stack_release_token_mismatch'],
      ['wrong commit', { commit: 'e'.repeat(40) }, 'full_stack_prepare_ledger_identity_mismatch'],
      ['wrong tree', { tree: 'e'.repeat(40) }, 'full_stack_prepare_ledger_identity_mismatch'],
    ]) {
      writeLedger({ ...ledger, ...(overrides.phase ? { phase: overrides.phase } : {}) });
      const beforeBytes = readFileSync(ledgerPath, 'utf8');
      const beforeHeartbeat = JSON.parse(beforeBytes).heartbeatAt;
      const result = runPrepare(overrides);
      assert.notEqual(result.status, 0, `${label} must fail closed`);
      assert.match(result.stderr, new RegExp(reason));
      assert.equal(readFileSync(ledgerPath, 'utf8'), beforeBytes, `${label} must not rewrite the ledger`);
      assert.equal(JSON.parse(readFileSync(ledgerPath, 'utf8')).heartbeatAt, beforeHeartbeat, `${label} must not heartbeat`);
    }
    const expired = new Date(Date.now() - 1_200_000).toISOString();
    const expiredLedger = { ...ledger, heartbeatAt: expired, leaseExpiresAt: new Date(Date.parse(expired) + 900_000).toISOString() };
    writeLedger(expiredLedger);
    const expiredBefore = readFileSync(ledgerPath, 'utf8');
    const expiredResult = runPrepare();
    assert.equal(expiredResult.status, 75, expiredResult.stderr);
    assert.match(expiredResult.stderr, /full_stack_release_lease_expired/);
    assert.equal(readFileSync(ledgerPath, 'utf8'), expiredBefore, 'expired lease must not rewrite the ledger');
    assert.equal(JSON.parse(readFileSync(ledgerPath, 'utf8')).heartbeatAt, expired, 'expired lease must not heartbeat');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

let passed = 0;
for (const [name, fn] of tests) {
  try { await fn(); passed += 1; process.stdout.write(`ok - ${name}\n`); }
  catch (error) { process.stderr.write(`not ok - ${name}\n${error.stack}\n`); process.exitCode = 1; break; }
}
if (!process.exitCode) process.stdout.write(`${passed}/${tests.length} prepare full-stack release proofs passed\n`);
