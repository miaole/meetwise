import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPlan, FIXED_PREVIEW_ACCOUNTS, PROFILE_CONFIGS, sha256 } from './catalog.mjs';
import { allowedInterviewStates, resolveOutputDir } from './db-verify.mjs';
import { ApiClient, applyPlan, assertLoopbackBaseUrl, buildTargetReattestationState, derivePassword, isVerificationContinuableState, persistTargetReattestation, resolveFixedPreviewCredentials, routeTargetBundle, targetScopedDatasetStatePath, validateDbReceipt, verifyPlan } from './loader.mjs';
import { buildVerifierProcessEnv, forbiddenGenericDatabaseEnv, resolveReadOnlyVerifierEnv } from './verifier-env.mjs';
import { validateReceiptLayers } from '../preview-account-scenarios/runner.mjs';

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function proofBinding(plan, expected) {
  return { targetDigest: 'a'.repeat(64), target: { database: 'meetwise_cloud_test', expectedDbRole: 'meetwise_preview_audit', rdsEndpoint: 'pgm-proof.pg.rds.aliyuncs.com', rdsPort: 5432, tlsServername: 'pgm-proof.pg.rds.aliyuncs.com', schemaLedgerDigest: 'b'.repeat(64), schemaHead: '0089_proof.sql', releasePath: '/proof/release', releaseTreeDigest: 'c'.repeat(64), apiContractDigest: 'd'.repeat(64), factoryDigest: 'e'.repeat(64) }, approval: { maxDurationSeconds: 3600, expectedBaseline: { accounts: 0, jobs: 0, applications: 0, resumes: 0, interviews: 0 }, expectedCumulative: expected } };
}

function proofDbReceipt(plan, binding, counts, overlay = null) {
  const forbidden = Object.fromEntries(['answerEvents', 'consumptions', 'invalidApplicationStates', 'invalidInterviewStates', 'invalidJobStates', 'invalidResumeStates', 'modelInvocations', 'nonCatalogAccounts', 'numericScores', 'paymentOrders', 'queuedOrRunningJobs', 'rawAnswerJobs'].map((key) => [key, 0]));
  const unsigned = { schemaVersion: 1, phase: 'post', status: 'verified', datasetId: plan.datasetId, profile: plan.profileName, targetDigest: binding.targetDigest, releaseIdentity: binding.releaseIdentity ?? null, catalogDigest: plan.catalogDigest, factoryDigest: binding.target.factoryDigest, identity: { database: binding.target.database, role: binding.target.expectedDbRole, endpoint: binding.target.rdsEndpoint, port: 5432, tlsServername: binding.target.tlsServername, serverAddr: null }, schemaHead: '0089_proof', schemaLedgerDigest: binding.target.schemaLedgerDigest, releasePath: binding.target.releasePath, releaseTreeDigest: binding.target.releaseTreeDigest, apiContractDigest: binding.target.apiContractDigest, counts, ...(overlay ? { capacityCounts: { ...counts, interviews: counts.interviews - overlay.interviews }, attestationMode: 'capacity_with_fixed_deep_overlay', allowedOverlay: overlay } : {}), forbidden, verifiedAt: new Date().toISOString() };
  return { ...unsigned, receiptDigest: sha256(unsigned) };
}

function fakeApi() {
  const data = { accounts: new Map(), jobs: new Map(), applications: new Map(), resumes: new Map(), interviews: new Map(), forbidden: 0 };
  const server = createServer(async (request, response) => {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
    const send = (status, payload) => { response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(payload)); };
    const token = String(request.headers.authorization ?? '').replace(/^Bearer /, '');
    const account = [...data.accounts.values()].find((row) => row.token === token);
    if (request.url === '/auth/signup') {
      if (data.accounts.has(body.email)) return send(409, { error: 'email_taken' });
      const row = { ...body, userId: `u_${data.accounts.size + 1}`, token: `t_${data.accounts.size + 1}` }; data.accounts.set(body.email, row); return send(200, row);
    }
    if (request.url === '/auth/login') { const row = data.accounts.get(body.email); return row && row.password === body.password ? send(200, row) : send(401, { error: 'invalid_credentials' }); }
    if (!account) return send(401, { error: 'unauthenticated' });
    if (request.url === '/privacy/consent' && request.method === 'POST') return send(200, { recorded: true });
    if (request.url === '/resume' && request.method === 'GET') return send(200, { resumes: [...data.resumes.values()].filter((row) => row.owner === account.userId) });
    if (request.url === '/resume' && request.method === 'POST') {
      if (body.text.length > 60_000) return send(400, { error: 'invalid', issues: [{ code: 'too_big', maximum: 60_000 }] });
      const digest = body.text; let row = [...data.resumes.values()].find((item) => item.owner === account.userId && item.digest === digest);
      if (!row) { row = { id: `r_${data.resumes.size + 1}`, resumeId: `r_${data.resumes.size + 1}`, owner: account.userId, digest }; data.resumes.set(row.id, row); }
      return send(200, { resumeId: row.id, status: 'ingested' });
    }
    if (request.url === '/recruiter/jobs' && request.method === 'POST') {
      const key = `${account.userId}:${request.headers['idempotency-key']}`; let row = data.jobs.get(key);
      if (!row) { row = { id: `j_${data.jobs.size + 1}`, owner_user_id: account.userId, ...body }; data.jobs.set(key, row); }
      return send(200, { id: row.id });
    }
    if (request.url === '/recruiter/jobs' && request.method === 'GET') return send(200, { jobs: [...data.jobs.values()].filter((row) => row.owner_user_id === account.userId) });
    if (request.url === '/recruiter/talent' && request.method === 'GET') return send(200, { talents: [...data.applications.values()].filter((row) => data.jobs.get(row.jobKey)?.owner_user_id === account.userId).map((row) => ({ ...row, score: null })) });
    if (request.url === '/applications' && request.method === 'GET') return send(200, { applications: [...data.applications.values()].filter((row) => row.candidate === account.userId).map((row) => ({ id: row.applicationId, job_id: row.jobId, status: row.status, score: null })) });
    const apply = request.url.match(/^\/jobs\/([^/]+)\/apply$/);
    if (apply) { const key = `${account.userId}:${apply[1]}`; let row = data.applications.get(key); if (!row) { row = { applicationId: `a_${data.applications.size + 1}`, candidate: account.userId, jobId: apply[1], jobKey: [...data.jobs.entries()].find(([, job]) => job.id === apply[1])?.[0], status: 'invited' }; data.applications.set(key, row); } return send(200, row); }
    const decline = request.url.match(/^\/applications\/([^/]+)\/decline$/);
    if (decline) { const row = [...data.applications.values()].find((item) => item.applicationId === decline[1] && item.candidate === account.userId); if (row) row.status = 'declined'; return send(200, { applicationId: decline[1], status: row ? 'declined' : 'noop' }); }
    if (request.url === '/interview' && request.method === 'POST') { let row = [...data.interviews.values()].find((item) => item.owner === account.userId && item.status === 'created'); if (!row) { row = { interviewId: `i_${data.interviews.size + 1}`, owner: account.userId, status: 'created' }; data.interviews.set(row.interviewId, row); } return send(200, row); }
    if (request.url === '/interview?limit=200' && request.method === 'GET') return send(200, { interviews: [...data.interviews.values()].filter((row) => row.owner === account.userId).map((row) => ({ id: row.interviewId, status: row.status })) });
    const abandon = request.url.match(/^\/interview\/([^/]+)\/abandon$/);
    if (abandon) { const row = data.interviews.get(abandon[1]); if (row) row.status = 'abandoned'; return send(200, { abandoned: true, alreadyAbandoned: row?.status === 'abandoned' }); }
    data.forbidden += 1; return send(404, { error: 'unexpected_route' });
  });
  return { data, server };
}

test('planner is deterministic and keeps long resume body private', () => {
  const a = buildPlan('showcase-v1', 'proof-showcase'); const b = buildPlan('showcase-v1', 'proof-showcase');
  assert.equal(a.catalogDigest, b.catalogDigest); assert.equal(a.resumes.some((row) => 'text' in row), false);
  assert.equal(a.privateObjects.resumes.find((row) => row.text.length === 59_800).text.length, 59_800);
});
test('password derivation is deterministic and account-scoped', () => { const seed = Buffer.alloc(32, 7); assert.equal(derivePassword(seed, 'a@example.com'), derivePassword(seed, 'a@example.com')); assert.notEqual(derivePassword(seed, 'a@example.com'), derivePassword(seed, 'b@example.com')); });
test('network target is loopback only', () => { assert.equal(assertLoopbackBaseUrl('http://127.0.0.1:8787'), 'http://127.0.0.1:8787'); assert.throws(() => assertLoopbackBaseUrl('https://example.com')); assert.throws(() => assertLoopbackBaseUrl('http://127.0.0.1:8787?token=x')); });
test('db verifier output directory is target-scoped and not arbitrary CLI input', () => {
  const targetDigest = 'a'.repeat(64); const releaseIdentity = 'proof-commit/proof-tree';
  const scoped = `/var/lib/meetwise-preview-synthetic/proof-receipt/.target-${targetDigest}-${sha256(releaseIdentity).slice(0, 16)}`;
  assert.match(scoped, new RegExp(`\\.target-${targetDigest}-[a-f0-9]{16}$`));
  assert.equal(resolveOutputDir({ datasetId: 'proof-receipt', targetDigest, releaseIdentity, outputDir: scoped }), scoped);
  assert.equal(resolveOutputDir({ datasetId: 'proof-receipt', targetDigest, releaseIdentity, outputDir: '/var/lib/meetwise-preview-synthetic/proof-receipt' }), '/var/lib/meetwise-preview-synthetic/proof-receipt');
  assert.throws(() => resolveOutputDir({ datasetId: 'proof-receipt', targetDigest, releaseIdentity, outputDir: '/tmp/unsafe-receipt-dir' }), /db_verify_output_dir_not_allowed/);
  assert.throws(() => resolveOutputDir({ datasetId: 'proof-receipt', targetDigest, releaseIdentity, outputDir: `${scoped}/nested` }), /db_verify_output_dir_not_allowed/);
});
test('DB verification admits created interviews only during interrupted preflight recovery', () => {
  assert.deepEqual(allowedInterviewStates('pre', false), ['abandoned']);
  assert.deepEqual(allowedInterviewStates('pre', true), ['created', 'abandoned']);
  assert.deepEqual(allowedInterviewStates('post', true), ['abandoned']);
});
test('successor catalog adds the fixed Chinese-facing B/C identities without mutating large-v1', () => {
  const historical = buildPlan('large-v1', 'proof-large-v1');
  const historicalReplay = buildPlan('large-v1', 'proof-large-v1');
  const successor = buildPlan('large-v1-successor', 'proof-large-v1-successor');
  assert.equal(PROFILE_CONFIGS['large-v1-successor'].successorOf, 'large-v1');
  assert.deepEqual(successor.catalogLayers, ['capacity', 'deep-usage']);
  assert.equal('fixedAccounts' in historical, false);
  assert.equal(historical.catalogDigest, '933b20aac662ab0d42d26c56e171834277ac5d93b07a8b8dcb7b38bbcf86b969');
  assert.equal(historical.catalogDigest, historicalReplay.catalogDigest);
  assert.deepEqual(successor.fixedAccounts, FIXED_PREVIEW_ACCOUNTS);
  assert.deepEqual(successor.fixedAccounts.map(({ email, role }) => ({ email, role })), [
    { email: 'previewc@meetwise.com', role: 'candidate' },
    { email: 'previewb@meetwise.com', role: 'recruiter' },
  ]);
  assert.doesNotMatch(JSON.stringify(successor), /"(?:password|secret)"\s*:/i);
  assert.equal(successor.fixedAccounts.some((account) => Object.hasOwn(account, 'password') || Object.hasOwn(account, 'secret')), false);
  assert.equal(successor.resumes.some((resume) => typeof resume.textDigest !== 'string' || resume.textChars < 1), false);
  assert.equal(successor.jobs.filter((job) => job.ownerKey === 'preview-recruiter').length, 30);
  assert.equal(successor.applications.filter((application) => application.candidateKey === 'preview-candidate').length, 30);
  assert.equal(successor.resumes.filter((resume) => resume.candidateKey === 'preview-candidate').length, 12);
  assert.ok(successor.jobs.filter((job) => job.ownerKey === 'preview-recruiter').every((job) => /预览招聘岗位/.test(job.title) && /合成岗位/.test(job.description)));
  assert.ok(successor.privateObjects.resumes.find((resume) => resume.candidateKey === 'preview-candidate' && resume.text.length === 59_800));
});
test('successor fixed credentials resolve only into memory', () => {
  const credentials = resolveFixedPreviewCredentials({ PREVIEW_C_PASSWORD: 'candidate-proof-secret', PREVIEW_B_PASSWORD: 'recruiter-proof-secret' });
  assert.deepEqual(Object.keys(credentials).sort(), ['preview-candidate', 'preview-recruiter']);
  assert.equal(credentials['preview-candidate'], 'candidate-proof-secret');
  assert.equal(credentials['preview-recruiter'], 'recruiter-proof-secret');
  assert.throws(() => resolveFixedPreviewCredentials({ PREVIEW_C_PASSWORD: 'present8' }), /fixed_preview_password_missing:preview-recruiter/);
  assert.throws(() => resolveFixedPreviewCredentials({ PREVIEW_C_PASSWORD: '123456', PREVIEW_B_PASSWORD: 'recruiter-proof-secret' }), /fixed_preview_password_invalid:preview-candidate/);
});
test('capacity and deep-usage interview states and receipts are separate evidence layers', () => {
  assert.deepEqual(allowedInterviewStates('post', false, 'capacity'), ['abandoned']);
  assert.deepEqual(allowedInterviewStates('pre', false, 'deep-usage'), ['created', 'active', 'completed', 'abandoned', 'failed']);
  assert.deepEqual(allowedInterviewStates('post', false, 'deep-usage'), ['created', 'active', 'completed', 'abandoned', 'failed']);
  assert.deepEqual(validateReceiptLayers(
    { receiptLayer: 'capacity', profile: 'large-v1-successor', datasetId: 'preview-large-v1-successor' },
    { schemaVersion: 1, receiptLayer: 'deep-usage', datasetId: 'preview-deep-usage-v1', scenarioId: 'deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1-successor', targetDigest: 'a'.repeat(64), releaseIdentity: 'proof-release', phase: 'verified_online_projection' },
  ), { capacityDatasetId: 'preview-large-v1-successor', deepUsageDatasetId: 'preview-deep-usage-v1', deepUsageScenarioId: 'deep-usage-v1', capacityProfile: 'large-v1-successor' });
  assert.throws(() => validateReceiptLayers(
    { receiptLayer: 'capacity', profile: 'large-v1-successor', datasetId: 'preview-large-v1-successor' },
    { receiptLayer: 'capacity', datasetId: 'preview-deep-usage-v1', scenarioId: 'deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1-successor', targetDigest: 'a'.repeat(64), releaseIdentity: 'proof-release', phase: 'verified_online_projection' },
  ), /deep_usage_receipt_layer_invalid/);
});
test('candidate loader receives only the explicit read-only verifier contract', () => {
  const env = {
    PREVIEW_VERIFY_DATABASE_URL: 'postgresql://verify@pgm-proof.pg.rds.aliyuncs.com:5432/meetwise_cloud_test',
    PREVIEW_VERIFY_DATABASE_SSL_CA_PATH: '/run/secrets/rds_ca',
    PREVIEW_VERIFY_PG_TLS_SERVERNAME: 'pgm-proof.pg.rds.aliyuncs.com',
    PREVIEW_VERIFY_EXPECTED_DATABASE: 'meetwise_cloud_test',
    PREVIEW_VERIFY_EXPECTED_ROLE: 'meetwise_preview_audit',
    PATH: '/usr/bin',
    HOME: '/var/lib/meetwise-preview-synthetic',
  };
  assert.deepEqual(resolveReadOnlyVerifierEnv(env), {
    databaseUrl: env.PREVIEW_VERIFY_DATABASE_URL,
    caPath: env.PREVIEW_VERIFY_DATABASE_SSL_CA_PATH,
    tlsServername: env.PREVIEW_VERIFY_PG_TLS_SERVERNAME,
    expectedDatabase: env.PREVIEW_VERIFY_EXPECTED_DATABASE,
    expectedRole: env.PREVIEW_VERIFY_EXPECTED_ROLE,
  });
  assert.throws(() => resolveReadOnlyVerifierEnv({ ...env, DATABASE_URL: 'postgresql://migration.invalid/meetwise_cloud_test' }), /generic_database_env_forbidden/);
  assert.throws(() => resolveReadOnlyVerifierEnv({ ...env, PREVIEW_VERIFY_EXPECTED_DATABASE: 'meetwise_preview' }), /read_only_contract_missing/);
  assert.throws(() => resolveReadOnlyVerifierEnv({ ...env, PREVIEW_VERIFY_EXPECTED_ROLE: 'meetwise_migrate' }), /read_only_contract_missing/);
  assert.throws(() => resolveReadOnlyVerifierEnv({ ...env, PREVIEW_VERIFY_DATABASE_URL: 'postgresql://127.0.0.1/meetwise_cloud_test' }), /database_url_invalid/);
  assert.throws(() => resolveReadOnlyVerifierEnv({ ...env, PREVIEW_VERIFY_DATABASE_URL: 'postgresql://[::1]/meetwise_cloud_test' }), /database_url_invalid/);
  assert.throws(() => resolveReadOnlyVerifierEnv({ ...env, PREVIEW_VERIFY_DATABASE_URL: 'postgresql://verify@pgm-proof.pg.rds.aliyuncs.com:5432/meetwise_preview' }), /database_identity_invalid/);
  assert.throws(() => resolveReadOnlyVerifierEnv({ ...env, PREVIEW_VERIFY_DATABASE_SSL_CA_PATH: 'relative/ca.pem' }), /tls_contract_invalid/);
  const childEnv = buildVerifierProcessEnv(env);
  assert.deepEqual(Object.keys(childEnv).sort(), ['HOME', 'NODE_ENV', 'PATH', 'PREVIEW_VERIFY_DATABASE_SSL_CA_PATH', 'PREVIEW_VERIFY_DATABASE_URL', 'PREVIEW_VERIFY_EXPECTED_DATABASE', 'PREVIEW_VERIFY_EXPECTED_ROLE', 'PREVIEW_VERIFY_PG_TLS_SERVERNAME'].sort());
  for (const key of forbiddenGenericDatabaseEnv) assert.equal(key in childEnv, false, `verifier child must not receive ${key}`);
});
test('production Compose application services are read-only and privilege-dropped', () => {
  const compose = readFileSync(new URL('../../docker/compose.prod.yml', import.meta.url), 'utf8');
  assert.match(compose, /^x-container-runtime-security: &container-runtime-security$/m);
  for (const service of ['migrate', 'api', 'worker', 'web']) {
    assert.match(compose, new RegExp(`\\n  ${service}:\\n\\s+<<: \\*container-runtime-security`));
  }
  assert.match(compose, /read_only: true/);
  assert.match(compose, /cap_drop:\n\s+- ALL/);
  assert.match(compose, /security_opt:\n\s+- no-new-privileges:true/);
  assert.match(compose, /tmpfs:\n\s+- \/tmp:rw,noexec,nosuid,nodev,size=64m/);
});
test('verification restart accepts both pre-verify and in-progress durable states', () => {
  assert.equal(isVerificationContinuableState('loaded_unverified'), true);
  assert.equal(isVerificationContinuableState('verifying'), true);
  assert.equal(isVerificationContinuableState('loading'), false);
  assert.equal(isVerificationContinuableState('ready'), false);
});
test('redirect responses never forward credential-bearing request bodies', async () => {
  let sinkRequests = 0;
  const sink = createServer((_request, response) => { sinkRequests += 1; response.end('unexpected'); });
  await new Promise((resolve) => sink.listen(0, '127.0.0.1', resolve));
  const redirect = createServer((_request, response) => { response.writeHead(307, { location: `http://127.0.0.1:${sink.address().port}/sink` }); response.end(); });
  await new Promise((resolve) => redirect.listen(0, '127.0.0.1', resolve));
  try {
    const api = new ApiClient(`http://127.0.0.1:${redirect.address().port}`);
    await assert.rejects(api.request('/auth/signup', { method: 'POST', body: { email: 'proof@example.com', password: 'secret-proof' } }));
    assert.equal(sinkRequests, 0);
  } finally { await new Promise((resolve) => redirect.close(resolve)); await new Promise((resolve) => sink.close(resolve)); }
});
test('rate-limit retry is bounded and replays the identical request', async () => {
  let calls = 0;
  const api = new ApiClient('http://127.0.0.1:8787', async (_url, init) => {
    calls += 1;
    const payload = calls === 1 ? { error: 'too_many_attempts' } : { ok: true, body: JSON.parse(init.body) };
    return new Response(JSON.stringify(payload), { status: calls === 1 ? 429 : 200, headers: { 'content-type': 'application/json' } });
  });
  const result = await api.request('/auth/signup', { method: 'POST', body: { email: 'proof@example.com' } });
  assert.equal(calls, 2); assert.equal(result.payload.body.email, 'proof@example.com');
});
test('DB receipts reject digest, target, forbidden and stale mutations', () => {
  const plan = buildPlan('showcase-v1', 'proof-receipt'); const expected = { accounts: 8, jobs: 24, applications: 72, resumes: 18, interviews: 180 }; const binding = proofBinding(plan, expected); const receipt = proofDbReceipt(plan, binding, expected);
  assert.equal(validateDbReceipt(receipt, { plan, targetBinding: binding, phase: 'post' }).status, 'verified');
  assert.throws(() => validateDbReceipt({ ...receipt, receiptDigest: '0'.repeat(64) }, { plan, targetBinding: binding, phase: 'post' }));
  const forbidden = structuredClone(receipt); forbidden.forbidden.numericScores = 1; forbidden.receiptDigest = sha256(Object.fromEntries(Object.entries(forbidden).filter(([key]) => key !== 'receiptDigest'))); assert.throws(() => validateDbReceipt(forbidden, { plan, targetBinding: binding, phase: 'post' }));
  const wrongTarget = { ...receipt, targetDigest: 'f'.repeat(64) }; wrongTarget.receiptDigest = sha256(Object.fromEntries(Object.entries(wrongTarget).filter(([key]) => key !== 'receiptDigest'))); assert.throws(() => validateDbReceipt(wrongTarget, { plan, targetBinding: binding, phase: 'post' }));
  const oldIdentityBinding = { ...binding, target: { ...binding.target, database: 'meetwise_preview', expectedDbRole: 'meetwise_migrate' } };
  assert.throws(() => validateDbReceipt(receipt, { plan, targetBinding: oldIdentityBinding, phase: 'post' }), /db_receipt_target_mismatch/);
});
test('capacity re-attestation accepts only the fixed candidate deep-usage overlay', () => {
  const plan = buildPlan('large-v1-successor', 'preview-large-v1-successor');
  const expected = { accounts: 220, jobs: 1024, applications: 10072, resumes: 600, interviews: 6180 };
  const binding = proofBinding(plan, expected);
  const overlay = { schemaVersion: 1, scope: 'fixed-preview-candidate', ownerUserId: 'candidate-preview', deepUsageReceiptDigest: '9'.repeat(64), interviewIds: ['deep_1', 'deep_2', 'deep_3'], applicationIds: ['app_1', 'app_2', 'app_3'], interviews: 3, applicationExceptions: 3, modelInvocations: 17, consumptions: 3, answerEvents: 13, limits: { interviews: 500, applicationExceptions: 500, modelInvocations: 10000, consumptions: 500, answerEvents: 10000 } };
  const receipt = proofDbReceipt(plan, binding, { ...expected, interviews: expected.interviews + overlay.interviews }, overlay);
  assert.equal(validateDbReceipt(receipt, { plan, targetBinding: binding, phase: 'post' }).attestationMode, 'capacity_with_fixed_deep_overlay');
  const foreignInterview = structuredClone(receipt); foreignInterview.capacityCounts.interviews += 1; foreignInterview.receiptDigest = sha256(Object.fromEntries(Object.entries(foreignInterview).filter(([key]) => key !== 'receiptDigest')));
  assert.throws(() => validateDbReceipt(foreignInterview, { plan, targetBinding: binding, phase: 'post' }), /count_mismatch/);
  const tooSmall = structuredClone(receipt); tooSmall.allowedOverlay.interviews = 2; tooSmall.receiptDigest = sha256(Object.fromEntries(Object.entries(tooSmall).filter(([key]) => key !== 'receiptDigest')));
  assert.throws(() => validateDbReceipt(tooSmall, { plan, targetBinding: binding, phase: 'post' }), /overlay_invalid/);
  const extraSession = structuredClone(receipt); extraSession.allowedOverlay.interviewIds.push('deep_4'); extraSession.receiptDigest = sha256(Object.fromEntries(Object.entries(extraSession).filter(([key]) => key !== 'receiptDigest')));
  assert.throws(() => validateDbReceipt(extraSession, { plan, targetBinding: binding, phase: 'post' }), /overlay_invalid/);
  const overLimit = structuredClone(receipt); overLimit.allowedOverlay.modelInvocations = overLimit.allowedOverlay.limits.modelInvocations + 1; overLimit.receiptDigest = sha256(Object.fromEntries(Object.entries(overLimit).filter(([key]) => key !== 'receiptDigest')));
  assert.throws(() => validateDbReceipt(overLimit, { plan, targetBinding: binding, phase: 'post' }), /overlay_invalid/);
});
test('showcase apply, replay and verify preserve exact counts and forbidden routes zero', async () => {
  const { data, server } = fakeApi(); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const port = server.address().port; const root = mkdtempSync(join(tmpdir(), 'mw-synthetic-proof-')); const statePath = join(root, 'manifest.json'); const credentialPath = join(root, 'credentials.json');
    const plan = buildPlan('showcase-v1', 'proof-showcase'); const api = new ApiClient(`http://127.0.0.1:${port}`); const seed = Buffer.alloc(32, 9); const expected = { accounts: 8, jobs: 24, applications: 72, resumes: 18, interviews: 180 }; const binding = proofBinding(plan, expected);
    const first = await applyPlan({ plan, api, seed, statePath, credentialPath, targetBinding: binding }); const before = { accounts: data.accounts.size, jobs: data.jobs.size, applications: data.applications.size, resumes: data.resumes.size, interviews: data.interviews.size };
    const replay = await applyPlan({ plan, api, seed, statePath, credentialPath, targetBinding: binding }); const after = { accounts: data.accounts.size, jobs: data.jobs.size, applications: data.applications.size, resumes: data.resumes.size, interviews: data.interviews.size };
    assert.deepEqual(after, before); assert.deepEqual(first.counts, { accounts: 8, jobs: 24, applications: 72, resumes: 18, interviews: 180 }); assert.equal(replay.receiptDigest, first.receiptDigest);
    const verification = await verifyPlan({ plan, api, seed, statePath, targetBinding: binding, dbReceipt: proofDbReceipt(plan, binding, first.counts) }); assert.equal(verification.observations.numericScores, 0); assert.equal(data.forbidden, 0);
    assert.equal(JSON.parse(readFileSync(credentialPath, 'utf8')).credentials.length, 8);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
test('successor fixed B/C slice is real Chinese API data and idempotent', async () => {
  const { data, server } = fakeApi(); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const full = buildPlan('large-v1-successor', 'proof-fixed-successor');
    const recruiter = full.recruiters.find((account) => account.fixedPreviewAccount);
    const candidate = full.candidates.find((account) => account.fixedPreviewAccount);
    const jobs = full.jobs.filter((job) => job.ownerKey === recruiter.key);
    const applications = full.applications.filter((application) => application.candidateKey === candidate.key);
    const resumes = full.privateObjects.resumes.filter((resume) => resume.candidateKey === candidate.key);
    const plan = { ...full, catalogDigest: 'proof-fixed-successor-catalog', recruiters: [recruiter], candidates: [candidate], jobs, applications, resumes: resumes.map(({ key, candidateKey, text }) => ({ key, candidateKey, textChars: text.length, textDigest: sha256(text) })), interviews: [], privateObjects: { resumes } };
    const expected = { accounts: 2, jobs: jobs.length, applications: applications.length, resumes: resumes.length, interviews: 0 };
    const binding = proofBinding(plan, expected);
    const fixedPreviewCredentials = { 'preview-candidate': 'candidate-proof-secret', 'preview-recruiter': 'recruiter-proof-secret' };
    const root = mkdtempSync(join(tmpdir(), 'mw-fixed-successor-proof-')); const statePath = join(root, 'manifest.json'); const credentialPath = join(root, 'credentials.json'); const api = new ApiClient(`http://127.0.0.1:${server.address().port}`); const seed = Buffer.alloc(32, 19);
    const first = await applyPlan({ plan, api, seed, statePath, credentialPath, targetBinding: binding, fixedPreviewCredentials });
    const before = { accounts: data.accounts.size, jobs: data.jobs.size, applications: data.applications.size, resumes: data.resumes.size, interviews: data.interviews.size };
    const replay = await applyPlan({ plan, api, seed, statePath, credentialPath, targetBinding: binding, fixedPreviewCredentials });
    const after = { accounts: data.accounts.size, jobs: data.jobs.size, applications: data.applications.size, resumes: data.resumes.size, interviews: data.interviews.size };
    assert.deepEqual(first.counts, expected); assert.deepEqual(after, before); assert.equal(replay.loadReceiptDigest, first.loadReceiptDigest);
    assert.equal(data.accounts.get('previewc@meetwise.com')?.role, 'candidate'); assert.equal(data.accounts.get('previewb@meetwise.com')?.role, 'recruiter');
    assert.equal(data.jobs.size, 30); assert.equal(data.applications.size, 30); assert.equal(data.resumes.size, 12);
    const persisted = JSON.parse(readFileSync(credentialPath, 'utf8'));
    assert.equal(persisted.credentials.length, 2); assert.doesNotMatch(JSON.stringify(persisted), /password|candidate-proof-secret|recruiter-proof-secret/i);
    const verification = await verifyPlan({ plan, api, seed, statePath, targetBinding: binding, dbReceipt: proofDbReceipt(plan, binding, expected), fixedPreviewCredentials });
    assert.equal(verification.observations.accounts, 2); assert.equal(verification.observations.jobs, 30); assert.equal(data.forbidden, 0);
    const fixedOwner = data.accounts.get('previewc@meetwise.com').userId;
    for (let index = 1; index <= 3; index += 1) data.interviews.set(`deep_${index}`, { interviewId: `deep_${index}`, owner: fixedOwner, status: 'abandoned' });
    const successorBinding = { ...binding, targetDigest: '9'.repeat(64), releaseIdentity: 'proof-successor-commit/proof-successor-tree', target: { ...binding.target, successorOfTargetDigest: binding.targetDigest } };
    const successorStatePath = targetScopedDatasetStatePath(statePath, successorBinding);
    persistTargetReattestation({ sourceStatePath: statePath, targetStatePath: successorStatePath, plan, targetBinding: successorBinding });
    await applyPlan({ plan, api, seed, statePath: successorStatePath, credentialPath: join(root, 'successor-credentials.json'), targetBinding: successorBinding, fixedPreviewCredentials });
    const overlay = { schemaVersion: 1, scope: 'fixed-preview-candidate', ownerUserId: fixedOwner, deepUsageReceiptDigest: '8'.repeat(64), interviewIds: ['deep_1', 'deep_2', 'deep_3'], applicationIds: ['app_1', 'app_2', 'app_3'], interviews: 3, applicationExceptions: 3, modelInvocations: 13, consumptions: 3, answerEvents: 13, limits: { interviews: 500, applicationExceptions: 500, modelInvocations: 10000, consumptions: 500, answerEvents: 10000 } };
    const successorDbReceipt = proofDbReceipt(plan, successorBinding, { ...expected, interviews: 3 }, overlay);
    const successorVerification = await verifyPlan({ plan, api, seed, statePath: successorStatePath, targetBinding: successorBinding, dbReceipt: successorDbReceipt, fixedPreviewCredentials });
    assert.equal(successorVerification.rawObservations.interviews, 3);
    assert.equal(successorVerification.observations.interviews, 0);
    assert.equal(successorVerification.observations.fixedDeepOverlay.interviews, 3);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
test('target N to N+1 re-attestation is read-only and leaves predecessor receipt immutable', async () => {
  const { data, server } = fakeApi(); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const full = buildPlan('showcase-v1', 'proof-reattestation');
    const candidate = full.candidates[2]; const recruiter = full.recruiters[0]; const job = full.jobs.find((row) => row.ownerKey === recruiter.key); const resume = full.privateObjects.resumes.find((row) => row.candidateKey === candidate.key); const application = { ...full.applications.find((row) => row.candidateKey === candidate.key), jobKey: job.key, decline: true }; const interview = full.interviews.find((row) => row.candidateKey === candidate.key);
    const plan = { ...full, catalogDigest: 'proof-reattestation-catalog', recruiters: [recruiter], candidates: [candidate], jobs: [job], applications: [application], resumes: [{ key: resume.key, candidateKey: resume.candidateKey, textChars: resume.text.length, textDigest: 'proof' }], interviews: [interview], privateObjects: { resumes: [resume] } };
    const expected = { accounts: 2, jobs: 1, applications: 1, resumes: 1, interviews: 1 }; const oldBinding = proofBinding(plan, expected); const oldStateRoot = mkdtempSync(join(tmpdir(), 'mw-reattest-proof-')); const oldStatePath = join(oldStateRoot, 'manifest.json'); const credentialPath = join(oldStateRoot, 'credentials.json'); const api = new ApiClient(`http://127.0.0.1:${server.address().port}`); const seed = Buffer.alloc(32, 21);
    const loaded = await applyPlan({ plan, api, seed, statePath: oldStatePath, credentialPath, targetBinding: oldBinding });
    await verifyPlan({ plan, api, seed, statePath: oldStatePath, targetBinding: oldBinding, dbReceipt: proofDbReceipt(plan, oldBinding, expected) });
    const oldManifestBytes = readFileSync(oldStatePath, 'utf8'); const oldVerificationPath = join(oldStateRoot, 'verification.json'); const oldVerificationBytes = readFileSync(oldVerificationPath, 'utf8');
    const newBinding = { ...oldBinding, targetDigest: 'f'.repeat(64), releaseIdentity: 'proof-commit-successor/proof-tree-successor', target: { ...oldBinding.target, successorOfTargetDigest: oldBinding.targetDigest } };
    assert.deepEqual(routeTargetBundle({ legacyState: JSON.parse(oldManifestBytes), targetState: null, plan, targetBinding: newBinding }), { mode: 'reattestation', predecessorTargetDigest: oldBinding.targetDigest });
    const newStatePath = targetScopedDatasetStatePath(oldStatePath, newBinding);
    const cloned = persistTargetReattestation({ sourceStatePath: oldStatePath, targetStatePath: newStatePath, plan, targetBinding: newBinding });
    assert.deepEqual(routeTargetBundle({ legacyState: JSON.parse(oldManifestBytes), targetState: cloned, plan, targetBinding: newBinding }), { mode: 'reattestation', predecessorTargetDigest: oldBinding.targetDigest });
    assert.equal(cloned.reattestationMode, 'api_read_only'); assert.equal(cloned.predecessorTargetDigest, oldBinding.targetDigest);
    const mutationRequests = []; const originalFetch = api.fetchImpl; const countingApi = new ApiClient(api.baseUrl, async (url, init) => { const response = await originalFetch(url, init); if (init.method === 'POST' || init.method === 'PATCH' || init.method === 'DELETE') mutationRequests.push({ path: new URL(url).pathname, status: response.status }); return response; });
    const reattested = await applyPlan({ plan, api: countingApi, seed, statePath: newStatePath, credentialPath: join(oldStateRoot, '.target-credentials.json'), targetBinding: newBinding });
    assert.equal(reattested.status, 'loaded_unverified'); assert.deepEqual(mutationRequests, [], 'reattestation apply must not call any API mutation');
    const newReceipt = await verifyPlan({ plan, api: countingApi, seed, statePath: newStatePath, targetBinding: newBinding, dbReceipt: proofDbReceipt(plan, newBinding, expected) });
    assert.equal(newReceipt.targetDigest, newBinding.targetDigest); assert.equal(newReceipt.releaseIdentity, newBinding.releaseIdentity); assert.equal(newReceipt.attestationMode, 'api_read_only'); assert.equal(newReceipt.predecessorTargetDigest, oldBinding.targetDigest); assert.equal(newReceipt.priorVerificationDigest, JSON.parse(oldVerificationBytes).verificationDigest);
    assert.ok(mutationRequests.every(({ path }) => path === '/auth/login'), `unexpected reattestation mutation endpoints: ${mutationRequests.map(({ path }) => path).join(',')}`);
    assert.equal(readFileSync(oldStatePath, 'utf8'), oldManifestBytes); assert.equal(readFileSync(oldVerificationPath, 'utf8'), oldVerificationBytes); assert.notEqual(newReceipt.verificationDigest, JSON.parse(oldVerificationBytes).verificationDigest); assert.equal(data.forbidden, 0); assert.equal(loaded.status, 'loaded_unverified');
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
test('committed responses lost at every mutation boundary resume without duplicates', async () => {
  const { data, server } = fakeApi(); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const full = buildPlan('showcase-v1', 'proof-response-loss');
    const candidate = full.candidates[2]; const recruiter = full.recruiters[0]; const job = full.jobs.find((row) => row.ownerKey === recruiter.key); const resume = full.privateObjects.resumes.find((row) => row.candidateKey === candidate.key); const application = { ...full.applications.find((row) => row.candidateKey === candidate.key), jobKey: job.key, decline: true }; const interview = full.interviews.find((row) => row.candidateKey === candidate.key);
    const plan = { ...full, catalogDigest: 'proof-response-loss-catalog', recruiters: [recruiter], candidates: [candidate], jobs: [job], applications: [application], resumes: [{ key: resume.key, candidateKey: resume.candidateKey, textChars: resume.text.length, textDigest: 'proof' }], interviews: [interview], privateObjects: { resumes: [resume] } };
    const dropped = new Set();
    const lossFetch = async (url, init) => {
      const response = await fetch(url, init); const path = new URL(url).pathname; const body = init.body ? JSON.parse(init.body) : {};
      const key = path === '/auth/signup' ? 'signup' : path === '/privacy/consent' ? 'consent' : path === '/resume' && init.method === 'POST' && body.text?.length <= 60_000 ? 'resume' : path === '/recruiter/jobs' ? 'job' : /^\/jobs\/.+\/apply$/.test(path) ? 'application' : /^\/applications\/.+\/decline$/.test(path) ? 'decline' : path === '/interview' && init.method === 'POST' ? 'interview-create' : /^\/interview\/.+\/abandon$/.test(path) ? 'interview-abandon' : null;
      if (key && !dropped.has(key)) { dropped.add(key); throw new Error(`simulated_response_loss:${key}`); }
      return response;
    };
    const root = mkdtempSync(join(tmpdir(), 'mw-synthetic-loss-proof-')); const statePath = join(root, 'manifest.json'); const credentialPath = join(root, 'credentials.json'); const api = new ApiClient(`http://127.0.0.1:${server.address().port}`, lossFetch); const seed = Buffer.alloc(32, 11);
    let state;
    for (let attempt = 0; attempt < 10; attempt += 1) { try { state = await applyPlan({ plan, api, seed, statePath, credentialPath }); break; } catch (error) { if (!String(error.message).startsWith('simulated_response_loss:')) throw error; } }
    assert.equal(state.status, 'loaded_unverified'); assert.deepEqual([...dropped].sort(), ['application', 'consent', 'decline', 'interview-abandon', 'interview-create', 'job', 'resume', 'signup']);
    assert.deepEqual({ accounts: data.accounts.size, jobs: data.jobs.size, applications: data.applications.size, resumes: data.resumes.size, interviews: data.interviews.size }, { accounts: 2, jobs: 1, applications: 1, resumes: 1, interviews: 1 });
    assert.equal(data.forbidden, 0);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

let passed = 0;
for (const [name, fn] of tests) { try { await fn(); passed += 1; process.stdout.write(`ok - ${name}\n`); } catch (error) { process.stderr.write(`not ok - ${name}\n${error.stack}\n`); process.exitCode = 1; break; } }
if (!process.exitCode) process.stdout.write(`${passed}/${tests.length} preview synthetic data proofs passed\n`);
