#!/usr/bin/env node
/**
 * Pure proof for the prepare-time preview composition contract.
 * It does not read /etc/meetwise, connect to RDS, invoke runuser, or write a
 * release artifact.  The real prepare command remains root/controller-only.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPlan, sha256 } from './preview-synthetic-data/catalog.mjs';
import { factoryDigest as loaderFactoryDigest, FACTORY_FILES as LOADER_FACTORY_FILES } from './preview-synthetic-data/loader.mjs';
import { factoryDigest as dbFactoryDigest, FACTORY_FILES as DB_FACTORY_FILES } from './preview-synthetic-data/db-verify.mjs';
import { validateReceiptLayers } from './preview-account-scenarios/runner.mjs';
import { buildApproval, buildTarget, factoryDigest as prepareFactoryDigest } from '../ops/ecs/full-stack/prepare-full-stack-release.mjs';

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

  const approval = buildApproval({
    generation: 1, commit: 'a'.repeat(40), tree: 'b'.repeat(40), releaseDigest: 'abcdef0',
    origin: ['https://preview-proof', 'tail654321', 'ts.net'].join('.'), webBuildSha256: '4'.repeat(64), staticAssetsSha256: '5'.repeat(64),
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
});

let passed = 0;
for (const [name, fn] of tests) {
  try { await fn(); passed += 1; process.stdout.write(`ok - ${name}\n`); }
  catch (error) { process.stderr.write(`not ok - ${name}\n${error.stack}\n`); process.exitCode = 1; break; }
}
if (!process.exitCode) process.stdout.write(`${passed}/${tests.length} prepare full-stack release proofs passed\n`);
