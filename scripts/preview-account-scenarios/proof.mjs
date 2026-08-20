#!/usr/bin/env node
/** Pure behavior proof for runner invariants.  It uses an in-process HTTP fake;
 * it does not import the DB package and never contacts ECS/RDS/model providers. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, readFileSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PREVIEW_ACCOUNTS,
  RECEIPT_LAYERS,
  SESSION_TARGETS,
  assertLoopbackBaseUrl,
  assertNonRootUid,
  assertReleaseBinding,
  discoverPredecessorState,
  readState,
  resolvePreviewCredentials,
  runScenario,
  sha256,
  stableUuid,
  targetScopedStatePath,
  validateDeepUsageReceipt,
  validateReceiptLayers,
} from './runner.mjs';

function json(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(value));
}

async function bodyOf(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

function fakePreviewServer() {
  const data = {
    users: new Map([
      ['token-c', { email: PREVIEW_ACCOUNTS.candidate.email, userId: 'candidate-preview', role: 'candidate' }],
      ['token-b', { email: PREVIEW_ACCOUNTS.recruiter.email, userId: 'recruiter-preview', role: 'recruiter' }],
    ]),
    jobs: Array.from({ length: 3 }, (_, i) => ({ id: `job-${i + 1}`, status: 'open' })),
    resumes: [{ id: 'resume-preview', status: 'ingested' }],
    applications: Array.from({ length: 3 }, (_, i) => ({ id: `app-${i + 1}`, job_id: `job-${i + 1}`, interview_id: null, status: 'invited', score: null })),
    interviews: new Map(),
    availableUnits: 3,
    nextInterview: 1,
    responseLossInjected: false,
  };
  const auth = (request) => data.users.get(String(request.headers.authorization ?? '').replace(/^Bearer /, '')) ?? null;
  const addEvent = (interview, kind, payload) => {
    const seq = interview.events.length + 1;
    interview.events.push({ seq, kind, payload });
    return seq;
  };
  const issueQuestion = (interview, turn) => addEvent(interview, 'question_ready', { questionId: `q-v${turn + 1}-t${turn}-c0`, stateVersion: turn + 1, turn, competency: 'synthetic' });
  const appForInterview = (id) => [...data.interviews.values()].find((item) => item.id === id);
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const principal = auth(request);
    const body = request.method === 'POST' ? await bodyOf(request) : {};
    if (url.pathname === '/auth/login' && request.method === 'POST') {
      const row = [...data.users.entries()].find(([, item]) => item.email === body.email && typeof body.password === 'string' && body.password.length > 0);
      return row ? json(response, 200, { token: row[0], userId: row[1].userId, role: row[1].role }) : json(response, 401, { error: 'invalid_credentials' });
    }
    if (!principal) return json(response, 401, { error: 'unauthenticated' });
    if (url.pathname === '/resume' && request.method === 'GET') return json(response, 200, { resumes: data.resumes });
    if (url.pathname === '/recruiter/jobs' && request.method === 'GET' && principal.role === 'recruiter') return json(response, 200, { jobs: data.jobs });
    if (url.pathname === '/applications' && request.method === 'GET') return json(response, 200, { applications: data.applications });
    if (url.pathname === '/commerce/entitlement' && request.method === 'GET') return json(response, 200, { availableUnits: data.availableUnits });
    if (url.pathname === '/recruiter/talent' && request.method === 'GET' && principal.role === 'recruiter') return json(response, 200, { talents: data.applications });
    const start = url.pathname.match(/^\/applications\/(app-[1-3])\/start$/);
    if (start && request.method === 'POST') {
      const app = data.applications.find((item) => item.id === start[1]);
      if (!app) return json(response, 404, { error: 'not_found_or_forbidden' });
      if (!app.interview_id) {
        const id = `iv-${data.nextInterview++}`;
        const interview = { id, appId: app.id, status: 'created', events: [], submissions: new Map() };
        data.interviews.set(id, interview); app.interview_id = id; app.status = 'in_progress'; data.availableUnits -= 1;
      }
      return json(response, 200, { applicationId: app.id, status: 'reused', interviewId: app.interview_id });
    }
    const begin = url.pathname.match(/^\/interview\/(iv-\d+)\/begin$/);
    if (begin && request.method === 'POST') {
      const interview = data.interviews.get(begin[1]);
      if (!interview) return json(response, 404, { error: 'not_found_or_forbidden' });
      if (interview.events.length === 0) issueQuestion(interview, 0);
      interview.status = 'active';
      return json(response, 202, { accepted: true, jobId: `start-${interview.id}` });
    }
    const events = url.pathname.match(/^\/interview\/(iv-\d+)\/events$/);
    if (events && request.method === 'GET') {
      const interview = data.interviews.get(events[1]);
      if (!interview) return json(response, 404, { error: 'not_found_or_forbidden' });
      const after = Number(request.headers['last-event-id'] ?? 0);
      response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
      for (const event of interview.events.filter((item) => item.seq > after)) response.write(`id: ${event.seq}\nevent: ${event.kind}\ndata: ${JSON.stringify(event.payload)}\n\n`);
      response.end();
      return;
    }
    const turn = url.pathname.match(/^\/interview\/(iv-\d+)\/turn$/);
    if (turn && request.method === 'POST') {
      const interview = data.interviews.get(turn[1]);
      if (!interview) return json(response, 404, { error: 'not_found_or_forbidden' });
      if (interview.submissions.has(body.answerId)) return json(response, 202, { accepted: true, replayed: true, jobId: interview.submissions.get(body.answerId) });
      const jobId = `answer-${interview.id}-${interview.submissions.size + 1}`;
      interview.submissions.set(body.answerId, jobId);
      addEvent(interview, 'answer_evaluated', { questionId: body.questionId, answerId: body.answerId, answerHash: body.answerHash, stateVersion: body.stateVersion, turn: body.turn, score: 84, competency: 'synthetic' });
      const target = data.applications.find((item) => item.id === interview.appId)?.id;
      if (target === 'app-1' && interview.submissions.size >= 5) {
        interview.status = 'completed';
        const app = data.applications.find((item) => item.id === interview.appId); app.status = 'assessment_unavailable';
        addEvent(interview, 'report_ready', {});
      } else if (target === 'app-3' && interview.submissions.size === 1) {
        const turn = interview.submissions.size;
        addEvent(interview, 'clarification_needed', { questionId: `q-v${turn + 1}-t${turn}-c1`, stateVersion: turn + 1, turn, hint: '请补充一个具体例子' });
      } else issueQuestion(interview, interview.submissions.size);
      if (!data.responseLossInjected) {
        data.responseLossInjected = true;
        // The server has committed the idempotent submission.  The client sees
        // a transport loss and must replay the exact same TurnDto.
        response.destroy();
        return;
      }
      return json(response, 202, { accepted: true, replayed: false, jobId });
    }
    const abandon = url.pathname.match(/^\/interview\/(iv-\d+)\/abandon$/);
    if (abandon && request.method === 'POST') {
      const interview = data.interviews.get(abandon[1]);
      if (!interview) return json(response, 404, { error: 'not_found_or_forbidden' });
      if (interview.status !== 'abandoned' && interview.status !== 'completed') { interview.status = 'abandoned'; data.availableUnits += 1; }
      return json(response, 200, { abandoned: true, released: 'released' });
    }
    if (url.pathname === '/interview' && request.method === 'GET') {
      const historical = Array.from({ length: 2 }, (_, i) => ({ id: `old-${i + 1}`, status: 'abandoned', current_question_index: null, issued_turns: 0, answered_turns: 0, current_turn: null, processing_turn: null }));
      const current = [...data.interviews.values()].map((item) => ({
        id: item.id, status: item.status === 'active' ? 'created' : item.status, current_question_index: item.events.filter((e) => e.kind === 'question_ready').length - 1,
        issued_turns: item.events.filter((e) => e.kind === 'question_ready').length, answered_turns: item.events.filter((e) => e.kind === 'answer_evaluated').length,
        current_turn: item.events.filter((e) => e.kind === 'question_ready').at(-1)?.payload.turn ?? null, processing_turn: null,
      }));
      return json(response, 200, { interviews: [...historical, ...current] });
    }
    return json(response, 404, { error: 'unexpected_route' });
  });
  return { server, data };
}

async function main() {
  const tests = [];
  const test = (name, fn) => tests.push([name, fn]);
  test('rejects root and public API targets', () => {
    assert.throws(() => assertNonRootUid(0), /must_not_run_as_root/);
    assert.throws(() => assertLoopbackBaseUrl('https://public.example/'), /loopback/);
    assert.throws(() => assertLoopbackBaseUrl('http://localhost:8787/'), /loopback/);
    assert.equal(assertNonRootUid(2001), 2001);
  });
  test('target/release binding is mandatory and scopes successor state', () => {
    const base = join(tmpdir(), 'deep-usage-v1.json');
    const n = { targetDigest: 'a'.repeat(64), releaseIdentity: 'commit-a/tree-a' };
    const n1 = { targetDigest: 'b'.repeat(64), releaseIdentity: 'commit-b/tree-b' };
    assert.deepEqual(assertReleaseBinding(n), n);
    assert.notEqual(targetScopedStatePath(base, n), targetScopedStatePath(base, n1));
    assert.throws(() => assertReleaseBinding({ ...n, targetDigest: 'not-a-digest' }), /target_digest_invalid/);
    assert.throws(() => assertReleaseBinding({ ...n, releaseIdentity: 'contains whitespace' }), /release_identity_invalid/);
  });
  test('stable identities are retry-safe and contract-shaped', () => {
    assert.equal(stableUuid('same'), stableUuid('same'));
    assert.notEqual(stableUuid('same'), stableUuid('other'));
    assert.match(stableUuid('same'), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.match(sha256('answer'), /^[a-f0-9]{64}$/);
  });
  test('fixed B/C credentials are env-only and receipt layers cannot be conflated', () => {
    const credentials = resolvePreviewCredentials({ PREVIEW_C_PASSWORD: 'candidate-proof-secret', PREVIEW_B_PASSWORD: 'recruiter-proof-secret' });
    assert.deepEqual(Object.keys(credentials).sort(), ['candidatePassword', 'recruiterPassword']);
    assert.equal(credentials.candidatePassword, 'candidate-proof-secret');
    assert.equal(credentials.recruiterPassword, 'recruiter-proof-secret');
    assert.throws(() => resolvePreviewCredentials({ PREVIEW_C_PASSWORD: '', PREVIEW_B_PASSWORD: 'present' }), /credentials_missing/);
    assert.deepEqual(validateReceiptLayers(
      { receiptLayer: RECEIPT_LAYERS.capacity, profile: 'large-v1-successor', datasetId: 'preview-large-v1-successor' },
      { schemaVersion: 1, receiptLayer: RECEIPT_LAYERS.deepUsage, datasetId: 'preview-deep-usage-v1', scenarioId: 'deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1-successor', targetDigest: 'a'.repeat(64), releaseIdentity: 'proof-release', phase: 'verified_online_projection' },
    ), { capacityDatasetId: 'preview-large-v1-successor', deepUsageDatasetId: 'preview-deep-usage-v1', deepUsageScenarioId: 'deep-usage-v1', capacityProfile: 'large-v1-successor' });
    assert.throws(() => validateReceiptLayers(
      { schemaVersion: 1, receiptLayer: RECEIPT_LAYERS.capacity, datasetId: 'preview-large-v1' },
      { schemaVersion: 1, receiptLayer: RECEIPT_LAYERS.deepUsage, datasetId: 'preview-deep-usage-v1', scenarioId: 'deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1', targetDigest: 'a'.repeat(64), releaseIdentity: 'proof-release', phase: 'verified_online_projection' },
    ), /capacity_receipt_layer_invalid/);
    assert.throws(() => validateReceiptLayers(
      { schemaVersion: 1, receiptLayer: RECEIPT_LAYERS.capacity, profile: 'large-v1-successor', datasetId: 'preview-large-v1-successor', forbidden: { answerEvents: 1 } },
      { schemaVersion: 1, receiptLayer: RECEIPT_LAYERS.deepUsage, datasetId: 'preview-deep-usage-v1', scenarioId: 'deep-usage-v1', predecessorCapacityDatasetId: 'preview-large-v1-successor', targetDigest: 'a'.repeat(64), releaseIdentity: 'proof-release', phase: 'verified_online_projection' },
    ), /capacity_receipt_forbidden_side_effect/);
  });
  test('real API-shaped scenario resumes after committed response loss', async () => {
    const fake = fakePreviewServer();
    await new Promise((resolve) => fake.server.listen(0, '127.0.0.1', resolve));
    const port = fake.server.address().port;
    const root = mkdtempSync(join(tmpdir(), 'meetwise-preview-scenario-proof-'));
    const statePath = join(root, 'deep-usage-v1.json');
    const target = { targetDigest: 'a'.repeat(64), releaseIdentity: 'proof-commit-a/proof-tree-a' };
    try {
      const receipt = await runScenario({ apiBaseUrl: `http://127.0.0.1:${port}`, statePath, ...target, uid: 2001, candidatePassword: stableUuid('proof-candidate-credential'), recruiterPassword: stableUuid('proof-recruiter-credential') });
      assert.equal(receipt.phase, 'verified_online_projection');
      assert.equal(receipt.attestationMode, 'initial_load');
      assert.equal(receipt.receiptLayer, RECEIPT_LAYERS.deepUsage);
      assert.equal(receipt.datasetId, 'preview-deep-usage-v1');
      assert.equal(receipt.predecessorCapacityDatasetId, 'preview-large-v1-successor');
      assert.doesNotMatch(JSON.stringify(receipt), /"(?:password|token|secret)"\s*:/i);
      const scopedStatePath = targetScopedStatePath(statePath, target);
      const state = readState(scopedStatePath);
      assert.equal(state.sessions.length, SESSION_TARGETS.length);
      assert.equal(state.sessions[0].phase, 'terminal');
      assert.equal(state.sessions[0].appliedTurns, 5);
      assert.equal(state.sessions[1].phase, 'abandoned');
      assert.equal(state.sessions[1].appliedTurns, 3);
      assert.equal(state.sessions[2].phase, 'abandoned');
      assert.equal(state.sessions[2].appliedTurns, 5);
      assert.equal(state.receiptLayer, RECEIPT_LAYERS.deepUsage);
      assert.equal(state.datasetId, 'preview-deep-usage-v1');
      assert.equal(state.predecessorCapacityDatasetId, 'preview-large-v1-successor');
      assert.equal(state.targetDigest, target.targetDigest);
      assert.equal(state.releaseIdentity, target.releaseIdentity);
      assert.equal(state.sessionCount, SESSION_TARGETS.length);
      assert.deepEqual(validateDeepUsageReceipt(state.deepUsageReceipt), receipt);
      assert.equal(state.deepUsageReceipt.receiptDigest, state.receiptDigest);
      const serialized = readFileSync(scopedStatePath, 'utf8');
      assert.doesNotMatch(serialized, /合成预览回答|"password"\s*:|"token"\s*:|"answer"\s*:/);
      assert.equal(fake.data.responseLossInjected, true);
      assert.equal(fake.data.interviews.size, 3);
      assert.equal(fake.data.availableUnits, 2, 'first session consumes one; two abandoned sessions release');
      assert.ok(state.observations.oldZeroHistory >= 2);
      assert.ok(state.observations.recruiterStatuses.includes('assessment_unavailable'));
      assert.ok(state.observations.recruiterStatuses.includes('in_progress'));
      // A successor target must not reuse the N ledger/receipt.  With a new
      // binding the fake API is re-attested into a different target-scoped
      // state path, while the N receipt remains byte-for-byte unchanged.
      const oldBytes = readFileSync(scopedStatePath, 'utf8');
      const successor = { targetDigest: 'b'.repeat(64), releaseIdentity: 'proof-commit-b/proof-tree-b' };
      const poisonedPath = `${statePath}.target-${'c'.repeat(64)}-poison`;
      symlinkSync(scopedStatePath, poisonedPath);
      assert.throws(() => discoverPredecessorState(statePath, successor, `http://127.0.0.1:${port}`), /scenario_predecessor_symlink/);
      unlinkSync(poisonedPath);
      const mutationRequests = [];
      const successorFetch = async (url, init = {}) => {
        const method = String(init.method ?? 'GET').toUpperCase();
        const path = new URL(url).pathname;
        if (method !== 'GET' && path !== '/auth/login') mutationRequests.push({ method, path });
        return fetch(url, init);
      };
      const successorReceipt = await runScenario({ apiBaseUrl: `http://127.0.0.1:${port}`, fetchImpl: successorFetch, statePath, ...successor, uid: 2001, candidatePassword: stableUuid('proof-candidate-credential'), recruiterPassword: stableUuid('proof-recruiter-credential') });
      assert.equal(successorReceipt.targetDigest, successor.targetDigest);
      assert.equal(successorReceipt.releaseIdentity, successor.releaseIdentity);
      assert.equal(successorReceipt.attestationMode, 'api_read_only');
      assert.equal(successorReceipt.predecessorTargetDigest, target.targetDigest);
      assert.equal(successorReceipt.predecessorReleaseIdentity, target.releaseIdentity);
      assert.deepEqual(mutationRequests, [], 'successor re-attestation must not start/begin/turn/abandon/signup');
      assert.notEqual(targetScopedStatePath(statePath, target), targetScopedStatePath(statePath, successor));
      assert.match(successorReceipt.receiptDigest, /^[a-f0-9]{64}$/);
      const successorState = readState(targetScopedStatePath(statePath, successor));
      assert.equal(successorState.reattestationMode, 'api_read_only');
      assert.deepEqual(successorState.accounts, state.accounts);
      assert.deepEqual(successorState.sessions.map(({ applicationId, interviewId }) => ({ applicationId, interviewId })), state.sessions.map(({ applicationId, interviewId }) => ({ applicationId, interviewId })));
      assert.equal(successorState.deepUsageReceipt.attestationMode, 'api_read_only');
      assert.equal(readFileSync(scopedStatePath, 'utf8'), oldBytes);
    } finally {
      await new Promise((resolve) => fake.server.close(resolve));
    }
  });
  let passed = 0;
  for (const [name, fn] of tests) {
    try { await fn(); passed += 1; process.stdout.write(`ok - ${name}\n`); }
    catch (error) { process.stderr.write(`not ok - ${name}\n${error.stack}\n`); process.exitCode = 1; break; }
  }
  if (!process.exitCode) process.stdout.write(`${passed}/${tests.length} preview account scenario proofs passed\n`);
}

await main();
