import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { canonicalJson, verifyManifest } from '../ops/ecs/preview-release-manifest.mjs';
import { composeFullStackManifest, surfaceReceipt } from '../ops/ecs/full-stack/full-stack-preview-publisher.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha = (value) => createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
const now = Date.now();
const cumulative = { accounts: 220, jobs: 1024, applications: 10072, resumes: 600, interviews: 6180 };
const target = { schemaVersion: 1, database: 'meetwise_preview', expectedDbRole: 'meetwise_migrate', rdsEndpoint: 'pgm-test.pg.rds.aliyuncs.com', rdsPort: 5432, tlsServername: 'pgm-test.pg.rds.aliyuncs.com', releasePath: '/srv/meetwise-full-stack/releases/r1', releaseTreeDigest: '1'.repeat(64), apiContractDigest: '2'.repeat(64), schemaLedgerDigest: '3'.repeat(64), schemaHead: '0089_qbank_taxonomy_definer_manifest.sql', factoryDigest: '6'.repeat(64), approvedProfiles: { 'large-v1': { datasetId: 'preview-large-v1', catalogDigest: '7'.repeat(64), expectedCumulative: cumulative } } };
const targetDigest = sha(target);
const approval = { schemaVersion: 1, generation: 1, mode: 'public-full-stack', releaseDigest: 'abcdef0', commit: 'a'.repeat(40), tree: 'b'.repeat(40), webBuildSha256: '4'.repeat(64), staticAssetsSha256: '5'.repeat(64), origin: 'https://preview.tail0000000.ts.net', releasePath: target.releasePath, releaseTreeDigest: target.releaseTreeDigest, apiContractDigest: target.apiContractDigest, targetDigest };
const dbUnsigned = { schemaVersion: 1, phase: 'post', status: 'verified', datasetId: 'preview-large-v1', profile: 'large-v1', targetDigest, catalogDigest: target.approvedProfiles['large-v1'].catalogDigest, factoryDigest: target.factoryDigest, identity: { database: target.database, role: target.expectedDbRole, endpoint: target.rdsEndpoint, port: target.rdsPort, tlsServername: target.tlsServername }, counts: cumulative, verifiedAt: new Date(now - 1_000).toISOString(), releasePath: target.releasePath, releaseTreeDigest: target.releaseTreeDigest, apiContractDigest: target.apiContractDigest, schemaLedgerDigest: target.schemaLedgerDigest, schemaHead: '0089_qbank_taxonomy_definer_manifest', forbidden: Object.fromEntries(['answerEvents', 'consumptions', 'invalidApplicationStates', 'invalidInterviewStates', 'invalidJobStates', 'invalidResumeStates', 'modelInvocations', 'nonCatalogAccounts', 'numericScores', 'paymentOrders', 'queuedOrRunningJobs', 'rawAnswerJobs'].map((key) => [key, 0])) };
const dbReceipt = { ...dbUnsigned, receiptDigest: sha(dbUnsigned) };
const verificationUnsigned = { schemaVersion: 2, datasetId: 'preview-large-v1', catalogDigest: target.approvedProfiles['large-v1'].catalogDigest, targetDigest, loadReceiptDigest: '8'.repeat(64), observations: { ...cumulative, numericScores: 0 }, dbReceiptDigest: dbReceipt.receiptDigest, verifiedAt: new Date(now - 500).toISOString() };
const verification = { ...verificationUnsigned, verificationDigest: sha(verificationUnsigned) };
const evidence = { approval, target, verification, dbReceipt, datasetManifest: { schemaVersion: 2, datasetId: 'preview-large-v1', status: 'ready', targetDigest, catalogDigest: target.approvedProfiles['large-v1'].catalogDigest, counts: cumulative, completedAt: new Date(now - 250).toISOString(), loadReceiptDigest: verification.loadReceiptDigest, verificationDigest: verification.verificationDigest }, maintenance: { schemaVersion: 1, status: 'restored', targetDigest, datasetId: 'preview-large-v1', catalogDigest: target.approvedProfiles['large-v1'].catalogDigest, restoredAt: new Date(now - 100).toISOString(), nginxWasActive: true, workerWasActive: true }, rootHtml: '<title>Meetwise 知面</title><a href="/login">登录</a>', loginHtml: '<h1>登录 / 注册</h1><input name="email"><input name="password">', privateKey: privatePem, now };
const manifest = composeFullStackManifest(evidence);
assert.equal(verifyManifest(manifest, publicPem).mode, 'public-full-stack-probe');
assert.equal(manifest.receipts.blackbox, surfaceReceipt(evidence.rootHtml, evidence.loginHtml).digest);
for (const mutation of [
  { dbReceipt: { ...dbReceipt, forbidden: { ...dbReceipt.forbidden, modelInvocations: 1 } } },
  { maintenance: { ...evidence.maintenance, status: 'maintenance' } },
  { datasetManifest: { ...evidence.datasetManifest, status: 'verifying' } },
  { approval: { ...approval, targetDigest: '9'.repeat(64) } },
  { loginHtml: '<h1>unexpected page</h1>' },
]) assert.throws(() => composeFullStackManifest({ ...evidence, ...mutation }));
const publisherSource = readFileSync(new URL('../ops/ecs/full-stack/full-stack-preview-publisher.mjs', import.meta.url), 'utf8');
assert.ok(publisherSource.indexOf("pendingState('publishing'") < publisherSource.indexOf('durableJson(PATHS.publicManifest, manifest'));
assert.ok(publisherSource.indexOf("pendingState('revoking'") < publisherSource.indexOf('durableJson(PATHS.publicManifest, revoked'));
assert.match(publisherSource, /state\?\.status === 'publishing'/);
assert.ok(publisherSource.includes("['verified', 'revoking_stop_pending', 'revoking'].includes(state.status)"));
assert.ok(publisherSource.indexOf("'enable', '--now', 'meetwise-full-stack-revocation-retry.timer'") < publisherSource.indexOf("pendingState('revoking_stop_pending'"));
assert.ok(publisherSource.includes("timerState.trim() !== 'active'"));
assert.ok(publisherSource.includes("['verified', 'edge_probing', 'confirmed_pending_public', 'restoring_confirmed_edge'].includes(state.status)"));
assert.ok(publisherSource.includes('full_stack_web_start_not_permitted'));
assert.ok(publisherSource.indexOf("pendingState('revoking_stop_pending'") < publisherSource.indexOf("'stop', 'meetwise-web.service'", publisherSource.indexOf('async function revoke()')));
assert.match(publisherSource, /full-stack-preview-edge-close/);
assert.match(publisherSource, /command === 'recover'/);
assert.match(publisherSource, /currentManifest = null/);
assert.match(publisherSource, /full_stack_existing_manifest_not_active/);
assert.match(publisherSource, /full_stack_release_successor_invalid/);
assert.match(publisherSource, /full-stack-internal-staging\.json/);
assert.match(publisherSource, /command === 'stage'/);
assert.match(publisherSource, /command === 'verify-public'/);
assert.match(publisherSource, /predecessorManifestSha256/);
assert.match(publisherSource, /status: 'edge_probing'/);
assert.match(publisherSource, /full-stack-public-verification\.json/);
assert.match(publisherSource, /Date\.now\(\) \+ 60_000/);
assert.match(publisherSource, /randomBytes\(32\)/);
assert.match(publisherSource, /receipt\.probeNonce !== state\.probeNonce/);
assert.match(publisherSource, /receipt\.rootSha256 !== manifest\.receipts\?\.edge/);
assert.match(publisherSource, /receipt\.blackboxSha256 !== manifest\.receipts\?\.blackbox/);
assert.match(publisherSource, /mode: 'public-full-stack-probe'/);
assert.match(publisherSource, /mode: 'public-full-stack'/);
assert.ok(publisherSource.indexOf("status: 'confirmed_pending_public'") < publisherSource.indexOf('durableJson(PATHS.publicManifest, finalManifest'));
assert.match(publisherSource, /Date\.now\(\) >= Date\.parse\(probe\.deadlineAt\)/);
assert.match(publisherSource, /\[approval\.origin, probe\.deadlineAt\]/);
const revokeStart = publisherSource.indexOf('async function revoke()');
const revokeWebStop = publisherSource.indexOf("'stop', 'meetwise-web.service'", revokeStart);
const revokedWrite = publisherSource.indexOf('durableJson(PATHS.publicManifest, revoked', revokeWebStop);
const pagesReceipt = publisherSource.indexOf('full_stack_pages_revocation_pending', revokeWebStop);
const revokeEdgeClose = publisherSource.indexOf("run('/usr/local/sbin/full-stack-preview-edge-close'", pagesReceipt);
assert.ok(revokeWebStop < revokedWrite && revokedWrite < pagesReceipt && pagesReceipt < revokeEdgeClose);
assert.match(publisherSource, /state\.status === 'verified' && state\.publicConfirmedAt && manifest\.mode === 'public-full-stack'/);
assert.match(publisherSource, /restoring_confirmed_edge/);
assert.match(publisherSource, /command === 'restore-confirmed-edge'/);
assert.match(publisherSource, /command === 'resume-revocation'/);
console.log('full-stack preview publisher proof passed');
