import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPlan, sha256 } from './catalog.mjs';
import { allowedInterviewStates } from './db-verify.mjs';
import { ApiClient, applyPlan, assertLoopbackBaseUrl, derivePassword, isVerificationContinuableState, validateDbReceipt, verifyPlan } from './loader.mjs';

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function proofBinding(plan, expected) {
  return { targetDigest: 'a'.repeat(64), target: { database: 'meetwise_preview', expectedDbRole: 'meetwise_migrate', rdsEndpoint: 'pgm-proof.pg.rds.aliyuncs.com', rdsPort: 5432, tlsServername: 'pgm-proof.pg.rds.aliyuncs.com', schemaLedgerDigest: 'b'.repeat(64), schemaHead: '0089_proof.sql', releasePath: '/proof/release', releaseTreeDigest: 'c'.repeat(64), apiContractDigest: 'd'.repeat(64), factoryDigest: 'e'.repeat(64) }, approval: { maxDurationSeconds: 3600, expectedBaseline: { accounts: 0, jobs: 0, applications: 0, resumes: 0, interviews: 0 }, expectedCumulative: expected } };
}

function proofDbReceipt(plan, binding, counts) {
  const forbidden = Object.fromEntries(['answerEvents', 'consumptions', 'invalidApplicationStates', 'invalidInterviewStates', 'invalidJobStates', 'invalidResumeStates', 'modelInvocations', 'nonCatalogAccounts', 'numericScores', 'paymentOrders', 'queuedOrRunningJobs', 'rawAnswerJobs'].map((key) => [key, 0]));
  const unsigned = { schemaVersion: 1, phase: 'post', status: 'verified', datasetId: plan.datasetId, profile: plan.profileName, targetDigest: binding.targetDigest, catalogDigest: plan.catalogDigest, factoryDigest: binding.target.factoryDigest, identity: { database: binding.target.database, role: binding.target.expectedDbRole, endpoint: binding.target.rdsEndpoint, port: 5432, tlsServername: binding.target.tlsServername, serverAddr: null }, schemaHead: '0089_proof', schemaLedgerDigest: binding.target.schemaLedgerDigest, releasePath: binding.target.releasePath, releaseTreeDigest: binding.target.releaseTreeDigest, apiContractDigest: binding.target.apiContractDigest, counts, forbidden, verifiedAt: new Date().toISOString() };
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
test('DB verification admits created interviews only during interrupted preflight recovery', () => {
  assert.deepEqual(allowedInterviewStates('pre', false), ['abandoned']);
  assert.deepEqual(allowedInterviewStates('pre', true), ['created', 'abandoned']);
  assert.deepEqual(allowedInterviewStates('post', true), ['abandoned']);
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
