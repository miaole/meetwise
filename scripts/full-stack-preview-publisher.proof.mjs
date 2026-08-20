import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { canonicalJson, verifyManifest } from '../ops/ecs/preview-release-manifest.mjs';
import { assertExternalProbeReceiptV2, composeFullStackManifest, surfaceReceipt } from '../ops/ecs/full-stack/full-stack-preview-publisher.mjs';
import { createHash, sign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha = (value) => createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
const now = Date.now();
const cumulative = { accounts: 220, jobs: 1024, applications: 10072, resumes: 600, interviews: 6180 };
const target = { schemaVersion: 1, database: 'meetwise_cloud_test', expectedDbRole: 'meetwise_preview_audit', rdsEndpoint: 'pgm-test.pg.rds.aliyuncs.com', rdsPort: 5432, tlsServername: 'pgm-test.pg.rds.aliyuncs.com', releasePath: '/srv/meetwise-full-stack/releases/r1', releaseTreeDigest: '1'.repeat(64), apiContractDigest: '2'.repeat(64), schemaLedgerDigest: '3'.repeat(64), schemaHead: '0123_user_facing_context_snapshots.sql', factoryDigest: '6'.repeat(64), approvedProfiles: { 'large-v1-successor': { datasetId: 'preview-large-v1-successor', profile: 'large-v1-successor', successorOf: 'large-v1', catalogDigest: '7'.repeat(64), expectedCumulative: cumulative } } };
const targetDigest = sha(target);
const approval = { schemaVersion: 1, generation: 1, mode: 'public-full-stack', releaseDigest: 'abcdef0', commit: 'a'.repeat(40), tree: 'b'.repeat(40), webBuildSha256: '4'.repeat(64), staticAssetsSha256: '5'.repeat(64), origin: 'https://preview.tail0000000.ts.net', releasePath: target.releasePath, releaseTreeDigest: target.releaseTreeDigest, apiContractDigest: target.apiContractDigest, targetDigest, images: { backend: `sha256:${'c'.repeat(64)}`, web: `sha256:${'d'.repeat(64)}` } };
const capacityProfile = target.approvedProfiles['large-v1-successor'];
const dbUnsigned = { schemaVersion: 1, receiptLayer: 'capacity', phase: 'post', status: 'verified', datasetId: 'preview-large-v1-successor', profile: 'large-v1-successor', targetDigest, catalogDigest: capacityProfile.catalogDigest, factoryDigest: target.factoryDigest, identity: { database: target.database, role: target.expectedDbRole, endpoint: target.rdsEndpoint, port: target.rdsPort, tlsServername: target.tlsServername }, counts: cumulative, verifiedAt: new Date(now - 1_000).toISOString(), releasePath: target.releasePath, releaseTreeDigest: target.releaseTreeDigest, apiContractDigest: target.apiContractDigest, schemaLedgerDigest: target.schemaLedgerDigest, schemaHead: '0123_user_facing_context_snapshots', forbidden: Object.fromEntries(['answerEvents', 'consumptions', 'invalidApplicationStates', 'invalidInterviewStates', 'invalidJobStates', 'invalidResumeStates', 'modelInvocations', 'nonCatalogAccounts', 'numericScores', 'paymentOrders', 'queuedOrRunningJobs', 'rawAnswerJobs'].map((key) => [key, 0])) };
const dbReceipt = { ...dbUnsigned, receiptDigest: sha(dbUnsigned) };
const verificationUnsigned = { schemaVersion: 2, receiptLayer: 'capacity', profile: 'large-v1-successor', datasetId: 'preview-large-v1-successor', catalogDigest: capacityProfile.catalogDigest, targetDigest, loadReceiptDigest: '8'.repeat(64), observations: { ...cumulative, numericScores: 0 }, dbReceiptDigest: dbReceipt.receiptDigest, verifiedAt: new Date(now - 500).toISOString() };
const verification = { ...verificationUnsigned, verificationDigest: sha(verificationUnsigned) };
const deepObservations = { sessions: [
  { slot: 'natural-terminal', applicationId: 'app-1', interviewId: 'iv-1', status: 'completed', issuedTurns: 5, answeredTurns: 5, phase: 'terminal' },
  { slot: 'abandon-after-3', applicationId: 'app-2', interviewId: 'iv-2', status: 'abandoned', issuedTurns: 3, answeredTurns: 3, phase: 'abandoned' },
  { slot: 'abandon-after-5', applicationId: 'app-3', interviewId: 'iv-3', status: 'abandoned', issuedTurns: 5, answeredTurns: 5, phase: 'abandoned' },
], recruiterTalentCount: 3, recruiterStatuses: ['assessment_unavailable'], oldZeroHistory: 2, verifiedAt: new Date(now - 400).toISOString() };
const deepUnsigned = { schemaVersion: 1, receiptLayer: 'deep-usage', datasetId: 'preview-deep-usage-v1', scenarioId: 'deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1-successor', targetDigest, releaseIdentity: `${approval.commit}:${approval.tree}`, phase: 'verified_online_projection', observations: deepObservations, sessionCount: 3 };
const deepReceipt = { ...deepUnsigned, receiptDigest: sha(JSON.stringify(deepUnsigned)), unproven: ['database_forbidden_counters', 'RLS_cross_owner_matrix', 'model_and_payment_side_effects'] };
const deepUsage = { schemaVersion: 1, scenarioId: 'deep-usage-v1', apiBaseUrl: 'http://127.0.0.1:8787', receiptLayer: 'deep-usage', datasetId: 'preview-deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1-successor', targetDigest, releaseIdentity: `${approval.commit}:${approval.tree}`, sessionCount: 3, phase: 'verified_online_projection', accounts: {}, sessions: deepObservations.sessions.map((session) => ({ slot: session.slot, mode: session.slot === 'natural-terminal' ? 'continue' : 'abandon', interviewId: session.interviewId, phase: session.phase, appliedTurns: session.answeredTurns })), observations: deepObservations, receiptDigest: deepReceipt.receiptDigest, deepUsageReceipt: deepReceipt };
const grantEpoch = new Date(now).toISOString().slice(0, 10);
const entitlementUnsigned = { schemaVersion: 1, receiptKind: 'preview-showcase-entitlement', phase: 'granted', operation: 'create', ownerUserId: 'candidate-preview', ownerEmail: 'previewc@meetwise.com', ownerRole: 'candidate', bucketId: '00000000-0000-4000-8000-000000000301', kind: 'gift', unitsTotal: 6, unitsReserved: 0, unitsConsumed: 3, unitsAvailable: 3, expiresAt: new Date(now + 86_400_000).toISOString(), sourceOrderId: `preview-showcase-gift:v2:${grantEpoch}:previewc@meetwise.com`, grantEpoch, targetDigest, releaseIdentity: `${approval.commit}:${approval.tree}`, schemaHead: target.schemaHead, schemaLedgerDigest: target.schemaLedgerDigest, verifiedAt: new Date(now - 300).toISOString(), paymentOrderTouched: false };
const entitlement = { ...entitlementUnsigned, receiptDigest: sha(entitlementUnsigned) };
const evidence = { approval, target, verification, dbReceipt, datasetManifest: { schemaVersion: 2, datasetId: 'preview-large-v1-successor', status: 'ready', targetDigest, catalogDigest: capacityProfile.catalogDigest, counts: cumulative, completedAt: new Date(now - 250).toISOString(), loadReceiptDigest: verification.loadReceiptDigest, verificationDigest: verification.verificationDigest }, maintenance: { schemaVersion: 1, status: 'restored', targetDigest, datasetId: 'preview-large-v1-successor', catalogDigest: capacityProfile.catalogDigest, restoredAt: new Date(now - 100).toISOString(), nginxWasActive: true, workerWasActive: true }, deepUsage, entitlement, rootHtml: '<title>Meetwise 知面</title><a href="/login">登录</a>', loginHtml: '<h1>登录 / 注册</h1><input name="email"><input name="password">', privateKey: privatePem, now };
const manifest = composeFullStackManifest(evidence);
assert.equal(verifyManifest(manifest, publicPem).mode, 'public-full-stack-probe');
assert.equal(manifest.receipts.blackbox, surfaceReceipt(evidence.rootHtml, evidence.loginHtml).digest);
// compose 单机：runtime 身份 = sha256(approval.images)（backend/web 两镜像），不再是源码树摘要。
assert.equal(manifest.receipts.runtime, sha(approval.images));

// The external control repository is the sole receipt-shape authority. Keep a
// real signed v2 receipt here so the ECS consumer is tested against the exact
// closed recursive contract rather than source-text fragments.
const probeOrigin = 'https://preview.tail0000000.ts.net';
const probeNonce = 'a'.repeat(64);
const probeManifest = 'b'.repeat(64);
const probeRoot = 'c'.repeat(64);
const probeBlackbox = 'd'.repeat(64);
const probeVerifier = {
  repository: 'miaole/meetwise-deploy-control',
  workflow: 'verify-meetwise-public-origin',
  ref: 'refs/heads/main',
  commit: 'e'.repeat(40),
  runId: '123',
  sourceSha256: 'f'.repeat(64),
  workflowSha256: '1'.repeat(64),
  packageLockSha256: '2'.repeat(64),
};
const probePage = (path, bodyHash, markerHash) => ({
  path,
  status: 200,
  headers: { 'content-type': 'text/html; charset=utf-8' },
  bodyHash,
  bodyStored: false,
  markerHashes: [markerHash],
  negativeMarkerHashes: [],
});
const probeUnproven = (reason) => ({ status: 'unproven', reason });
const probeAccount = (role, loginPath, pagePath, bodyHash, markerHash, emailHash) => ({
  role,
  accountEmailSha256: emailHash,
  loginPath,
  sessionCookie: { httpOnly: true, secure: true, roleCookie: role },
  pages: [probePage(pagePath, bodyHash, markerHash)],
  roleBoundary: role === 'candidate'
    ? { status: 'verified', path: '/recruiter/jobs', markerHashes: ['3'.repeat(64)] }
    : probeUnproven('no safe recruiter-to-candidate negative write-free contract is available'),
  api: probeUnproven('privacy export is intentionally omitted because Playwright API responses may buffer personal data'),
  sse: probeUnproven('no stable persisted interview-or-quiz id is permitted for the short verifier'),
  worker: probeUnproven('no business object is created by the short verifier'),
  semanticAssertionCount: 1,
});
const probeUnsigned = {
  schemaVersion: 2,
  origin: probeOrigin,
  probeNonce,
  checkedAt: new Date(now - 1_000).toISOString(),
  manifestSha256: probeManifest,
  rootStatus: 200,
  loginStatus: 200,
  manifestStatus: 200,
  rootUrl: `${probeOrigin}/`,
  loginUrl: `${probeOrigin}/login`,
  manifestUrl: `${probeOrigin}/preview-release-manifest.json`,
  rootSha256: probeRoot,
  blackboxSha256: probeBlackbox,
  signingKeyId: 'probe-receipt-ed25519-v2',
  verifier: probeVerifier,
  e2e: {
    status: 'passed_pages_only',
    scope: 'browser_auth_pages_only',
    complete: false,
    noCookieProtectedRedirect: { origin: probeOrigin, pathname: '/login', search: '?next=%2Fdashboard' },
    accounts: {
      candidate: probeAccount('candidate', '/dashboard', '/dashboard', '4'.repeat(64), '5'.repeat(64), '6'.repeat(64)),
      recruiter: probeAccount('recruiter', '/recruiter/jobs', '/recruiter/jobs', '7'.repeat(64), '8'.repeat(64), '9'.repeat(64)),
    },
    sensitiveResponseBodies: 'not_stored',
  },
};
const signedProbeReceipt = (unsigned) => ({ ...unsigned, signature: sign(null, Buffer.from(canonicalJson(unsigned)), privateKey).toString('base64') });
const probeReceipt = signedProbeReceipt(probeUnsigned);
assert.equal(assertExternalProbeReceiptV2(probeReceipt, {
  origin: probeOrigin,
  probeNonce,
  manifestSha256: probeManifest,
  rootSha256: probeRoot,
  blackboxSha256: probeBlackbox,
  publicKeyPem: publicPem,
  activationAt: new Date(now - 5_000).toISOString(),
  deadlineAt: new Date(now + 600_000).toISOString(),
  now,
}).signingKeyId, 'probe-receipt-ed25519-v2');
assert.throws(() => assertExternalProbeReceiptV2({ ...probeReceipt, unexpected: true }, {
  origin: probeOrigin, probeNonce, manifestSha256: probeManifest, rootSha256: probeRoot, blackboxSha256: probeBlackbox, publicKeyPem: publicPem,
  activationAt: new Date(now - 5_000).toISOString(), deadlineAt: new Date(now + 600_000).toISOString(), now,
}));
const probeMutation = (mutate) => {
  const candidate = structuredClone(probeUnsigned);
  mutate(candidate);
  return signedProbeReceipt(candidate);
};
assert.throws(() => assertExternalProbeReceiptV2(probeMutation((value) => { value.e2e.status = 'passed'; }), {
  origin: probeOrigin, probeNonce, manifestSha256: probeManifest, rootSha256: probeRoot, blackboxSha256: probeBlackbox, publicKeyPem: publicPem,
  activationAt: new Date(now - 5_000).toISOString(), deadlineAt: new Date(now + 600_000).toISOString(), now,
}));
assert.throws(() => assertExternalProbeReceiptV2(probeMutation((value) => { value.e2e.accounts.candidate.api.reason = 'authorization: raw'; }), {
  origin: probeOrigin, probeNonce, manifestSha256: probeManifest, rootSha256: probeRoot, blackboxSha256: probeBlackbox, publicKeyPem: publicPem,
  activationAt: new Date(now - 5_000).toISOString(), deadlineAt: new Date(now + 600_000).toISOString(), now,
}));

const allowedOverlay = { schemaVersion: 1, scope: 'fixed-preview-candidate', ownerUserId: 'candidate-preview', deepUsageReceiptDigest: '9'.repeat(64), interviewIds: ['iv-1', 'iv-2', 'iv-3'], applicationIds: ['app-1', 'app-2', 'app-3'], interviews: 3, applicationExceptions: 3, modelInvocations: 17, consumptions: 3, answerEvents: 13, limits: { interviews: 500, applicationExceptions: 500, modelInvocations: 10000, consumptions: 500, answerEvents: 10000 } };
const overlayDbUnsigned = { ...dbUnsigned, counts: { ...cumulative, interviews: cumulative.interviews + 3 }, capacityCounts: cumulative, attestationMode: 'capacity_with_fixed_deep_overlay', allowedOverlay };
const overlayDbReceipt = { ...overlayDbUnsigned, receiptDigest: sha(overlayDbUnsigned) };
const overlayVerificationUnsigned = { ...verificationUnsigned, observations: { ...verificationUnsigned.observations, fixedDeepOverlay: allowedOverlay }, rawObservations: { ...verificationUnsigned.observations, interviews: verificationUnsigned.observations.interviews + 3 }, dbReceiptDigest: overlayDbReceipt.receiptDigest };
const overlayVerification = { ...overlayVerificationUnsigned, verificationDigest: sha(overlayVerificationUnsigned) };
const overlayDatasetManifest = { ...evidence.datasetManifest, verificationDigest: overlayVerification.verificationDigest };
assert.equal(composeFullStackManifest({ ...evidence, verification: overlayVerification, dbReceipt: overlayDbReceipt, datasetManifest: overlayDatasetManifest }).receiptComposition.deepUsage, deepReceipt.receiptDigest);
for (const mutation of [
  { dbReceipt: { ...dbReceipt, forbidden: { ...dbReceipt.forbidden, modelInvocations: 1 } } },
  { maintenance: { ...evidence.maintenance, status: 'maintenance' } },
  { datasetManifest: { ...evidence.datasetManifest, status: 'verifying' } },
  { approval: { ...approval, targetDigest: '9'.repeat(64) } },
  { approval: { ...approval, images: undefined } },
  { approval: { ...approval, images: { backend: `sha256:${'e'.repeat(64)}`, web: 'latest' } } },
  { target: { ...target, database: 'meetwise_preview' } },
  { deepUsage: { ...deepUsage, phase: 'ready_limited' } },
  { deepUsage: { ...deepUsage, deepUsageReceipt: { ...deepReceipt, observations: { ...deepObservations, sessions: [] } } } },
  { deepUsage: { ...deepUsage, deepUsageReceipt: { ...deepReceipt, receiptDigest: 'f'.repeat(64) } } },
  { loginHtml: '<h1>unexpected page</h1>' },
]) assert.throws(() => composeFullStackManifest({ ...evidence, ...mutation }));
assert.equal(manifest.receiptComposition.capacity, verification.verificationDigest);
assert.equal(manifest.receiptComposition.deepUsage, deepReceipt.receiptDigest);
assert.match(manifest.receiptComposition.digest, /^[a-f0-9]{64}$/);
const publisherSource = readFileSync(new URL('../ops/ecs/full-stack/full-stack-preview-publisher.mjs', import.meta.url), 'utf8');
assert.ok(publisherSource.indexOf("pendingState('publishing'") < publisherSource.indexOf('durableJson(PATHS.publicManifest, manifest'));
assert.ok(publisherSource.indexOf("pendingState('revoking'") < publisherSource.indexOf('durableJson(PATHS.publicManifest, revoked'));
assert.match(publisherSource, /state\?\.status === 'publishing'/);
assert.ok(publisherSource.includes("['verified', 'revoking_stop_pending', 'revoking'].includes(state.status)"));
assert.ok(publisherSource.indexOf("'enable', '--now', 'meetwise-full-stack-revocation-retry.timer'") < publisherSource.indexOf("pendingState('revoking_stop_pending'"));
assert.ok(publisherSource.includes("timerState.trim() !== 'active'"));
assert.ok(publisherSource.includes("['verified', 'edge_probing', 'confirmed_pending_public', 'restoring_confirmed_edge'].includes(state.status)"));
assert.ok(publisherSource.includes('full_stack_web_start_not_permitted'));
assert.ok(publisherSource.indexOf("pendingState('revoking_stop_pending'") < publisherSource.indexOf("runCompose(['stop', 'web'])", publisherSource.indexOf('async function revoke()')));
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
assert.match(publisherSource, /Date\.now\(\) \+ 600_000/);
assert.match(publisherSource, /randomBytes\(32\)/);
assert.match(publisherSource, /assertExternalProbeReceiptV2/);
assert.match(publisherSource, /receipt\.probeNonce !== probeNonce/);
assert.match(publisherSource, /receipt\.rootSha256 !== rootSha256/);
assert.match(publisherSource, /receipt\.blackboxSha256 !== blackboxSha256/);
assert.match(publisherSource, /noCookieProtectedRedirect/);
assert.match(publisherSource, /status !== 'passed_pages_only'/);
assert.match(publisherSource, /scope !== 'browser_auth_pages_only'/);
assert.match(publisherSource, /complete !== false/);
assert.match(publisherSource, /sessionCookie/);
assert.match(publisherSource, /markerHashes/);
assert.match(publisherSource, /roleBoundary/);
assert.match(publisherSource, /account\.api/);
assert.match(publisherSource, /value\.status !== 'unproven'/);
assert.doesNotMatch(publisherSource, /api\.path !== '\/api\/privacy\/export'/);
assert.match(publisherSource, /mode: 'public-full-stack-probe'/);
assert.match(publisherSource, /mode: 'public-full-stack'/);
assert.ok(publisherSource.indexOf("status: 'confirmed_pending_public'") < publisherSource.indexOf('durableJson(PATHS.publicManifest, finalManifest'));
assert.match(publisherSource, /Date\.now\(\) >= Date\.parse\(probe\.deadlineAt\)/);
assert.match(publisherSource, /\[approval\.origin, probe\.deadlineAt\]/);
const revokeStart = publisherSource.indexOf('async function revoke()');
const revokeWebStop = publisherSource.indexOf("runCompose(['stop', 'web'])", revokeStart);
const revokedWrite = publisherSource.indexOf('durableJson(PATHS.publicManifest, revoked', revokeWebStop);
const pagesReceipt = publisherSource.indexOf('full_stack_pages_revocation_pending', revokeWebStop);
const revokeEdgeClose = publisherSource.indexOf("run('/usr/local/sbin/full-stack-preview-edge-close'", pagesReceipt);
assert.ok(revokeWebStop < revokedWrite && revokedWrite < pagesReceipt && pagesReceipt < revokeEdgeClose);
assert.match(publisherSource, /state\.status === 'verified' && state\.publicConfirmedAt && manifest\.mode === 'public-full-stack'/);
assert.match(publisherSource, /restoring_confirmed_edge/);
assert.match(publisherSource, /command === 'restore-confirmed-edge'/);
assert.match(publisherSource, /command === 'resume-revocation'/);
// compose 单机：publish 不再读源码树 symlink，改为按镜像摘要校验 compose 配置；web 启停全部走 runCompose。
assert.match(publisherSource, /runtimeImageDigest\(approval\)/);
assert.match(publisherSource, /full_stack_images_invalid/);
assert.match(publisherSource, /assertComposeImageBinding\(approval\)/);
assert.match(publisherSource, /receipts: \{ runtime, /);
assert.ok(!publisherSource.includes('/srv/meetwise-full-stack/current'), 'publish must not read the source-tree symlink under compose');
assert.ok(!publisherSource.includes('releaseTreeDigest(currentRelease)'), 'publish must not recompute the source-tree digest');
assert.ok(!publisherSource.includes("'restart', 'meetwise-web.service'"), 'web start must go through runCompose, not systemctl');
assert.ok(!publisherSource.includes("'stop', 'meetwise-web.service'"), 'web stop must go through runCompose, not systemctl');
console.log('full-stack preview publisher proof passed');
