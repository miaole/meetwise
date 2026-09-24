/**
 * UC-E2E-052 Line B · internal authorized erasure prove.
 * Real PG via run-e2e-isolated. Ban MemorySaver/MySQL/Qdrant. Ban completed.
 * Request terminal = pending_external (externals retention_pending).
 * C-CASECOUNT: every REQUIRED_CASE must run or EXIT≠0.
 */
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor,
  assertIsolatedTestTarget, type Client,
} from '@meetwise/db';
import {
  generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot, PrivacyAuthzKeyRegistry, canonicalTargetSetDigest,
} from '@meetwise/domain';
import {
  runAuthorizedInterviewErasure, retryFailedLocalTarget, loadRequestStatus, loadRequestTargets,
  reassessRequestStatus, attachExternalRetentionPendingTargets,
} from '../src/uc052-internal-erasure.ts';
import {
  beginInterviewProjectionErasure, purgeInterviewProjectionTarget,
} from '../src/int-transcript-projection.ts';
import {
  issueAuthorizationSnapshot, consumeAuthorizationSnapshotBound, claimAuthorizationTarget,
} from '../src/privacy-authorization.ts';

const REQUIRED_CASES = [
  'NHP-050-FAULT-01',
  'NHP-050-FAULT-02',
  'NHP-050-FAULT-03',
  'NHP-050-FAULT-04',
  'NHP-050-FAULT-05',
  'NHP-050-NEG-02',
  'NHP-050-NEG-03',
  'NHP-050-BOUND-01',
  'NHP-050-NEG-01',
  'HP-050-01',
] as const;

const admin = createPool();
const owner = `uc052-owner-${process.pid}`;
const otherOwner = `uc052-other-${process.pid}`;
const worker = `uc052-worker-${process.pid}`;
const KEY = generatePrivacyAuthzKeyPair('uc052-del-2026-01');
const NOW_SEC = Math.floor(Date.now() / 1000);
const keys = { privateKeyPem: KEY.privateKeyPem, publicJwk: KEY.publicJwk, kid: KEY.kid };

let failures = 0;
const seen = new Set<string>();
const caseStatus = new Map<string, string>();
const A = (id: string, ok: boolean, detail = '') => {
  seen.add(id);
  caseStatus.set(id, ok ? 'pass' : 'fail');
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail ? ` · ${detail}` : ''}`);
  if (!ok) failures++;
};
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

let hashCounter = 0;
const nextHash = () => (++hashCounter).toString(16).padStart(64, '0');

async function asIssuer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_issuer');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

async function insertInterview(ownerId: string, interviewId: string): Promise<void> {
  await admin.query(
    `INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions)
     VALUES ($1,$2,'active',0,0,'[]'::jsonb)`,
    [interviewId, ownerId],
  );
}
async function insertEvent(ownerId: string, interviewId: string, seq: number, kind: string): Promise<void> {
  await asPrincipal(admin, ownerId, (c) => c.query(
    `INSERT INTO interview_event(owner_user_id, stream_key, seq, kind, payload)
     VALUES (current_setting('app.principal_user', true), $1, $2, $3, '{}'::jsonb)`,
    [interviewId, seq, kind],
  ));
}
async function insertGraphRun(ownerId: string, interviewId: string): Promise<void> {
  await asPrincipal(admin, ownerId, (c) => c.query(
    `INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status)
     VALUES ('mock-interview', $1, current_setting('app.principal_user', true), 'completed')`,
    [interviewId],
  ));
}
async function insertReportFixtures(ownerId: string, interviewId: string): Promise<void> {
  await asPrincipal(admin, ownerId, async (c) => {
    await c.query(
      `INSERT INTO ai_report(owner_user_id, interview_id)
       VALUES (current_setting('app.principal_user', true), $1)`, [interviewId]);
    await c.query(
      `INSERT INTO assessment_report(id, owner_user_id, interview_id)
       VALUES ($1, current_setting('app.principal_user', true), $2)`, [randomUUID(), interviewId]);
    await c.query(
      `INSERT INTO learning_plan(id, owner_user_id, interview_id)
       VALUES ($1, current_setting('app.principal_user', true), $2)`, [randomUUID(), interviewId]);
    await c.query(
      `INSERT INTO learning_progress(owner_user_id, interview_id, topic)
       VALUES (current_setting('app.principal_user', true), $1, 'topic-1')`, [interviewId]);
    await c.query(
      `INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level)
       VALUES ($1, current_setting('app.principal_user', true), $2, 'mid', 'senior')`, [randomUUID(), interviewId]);
    await c.query(
      `INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating)
       VALUES (current_setting('app.principal_user', true), $1, 0, 'up')`, [interviewId]);
  });
}

async function eventCount(interviewId: string): Promise<number> {
  const r = await admin.query<{ n: string }>(`SELECT count(*)::text AS n FROM interview_event WHERE stream_key=$1`, [interviewId]);
  return Number(r.rows[0]?.n ?? -1);
}
async function graphCount(interviewId: string): Promise<number> {
  const r = await admin.query<{ n: string }>(`SELECT count(*)::text AS n FROM ai_graph_run WHERE thread_id=$1`, [interviewId]);
  return Number(r.rows[0]?.n ?? -1);
}
async function reportCount(interviewId: string): Promise<number> {
  const r = await admin.query<{ n: string }>(
    `SELECT (
       (SELECT count(*) FROM ai_report WHERE interview_id=$1)
     + (SELECT count(*) FROM assessment_report WHERE interview_id=$1)
     + (SELECT count(*) FROM learning_plan WHERE interview_id=$1)
     + (SELECT count(*) FROM learning_progress WHERE interview_id=$1)
     + (SELECT count(*) FROM career_path WHERE interview_id=$1)
     + (SELECT count(*) FROM question_feedback WHERE interview_id=$1)
     )::text AS n`, [interviewId]);
  return Number(r.rows[0]?.n ?? -1);
}

async function erase(opts: {
  interviewId: string; keyHash: string; epoch: number; failSink?: 'event' | 'ai_graph_run' | 'report'; ownerId?: string;
}) {
  const o = opts.ownerId ?? owner;
  // Phase 1: begin (commits) then admin attaches externals + reseals digest.
  const begun = await asPrincipal(admin, o, (c) =>
    beginInterviewProjectionErasure(c, opts.interviewId, opts.keyHash, opts.epoch));
  await attachExternalRetentionPendingTargets(admin, begun.requestId, opts.interviewId, opts.keyHash);
  // Phase 2: authorize + purge (consume opens its own short executor txn)
  return runAuthorizedInterviewErasure({
    preBegun: { requestId: begun.requestId, privacyEpoch: opts.epoch },
    issue: (fn) => asIssuer(o, fn),
    consume: (fn) => asPrivacyWorkerExecutor(admin, fn),
    asWorkerPrincipal: (own, fn) => asPrivacyWorkerPrincipal(admin, own, fn),
    admin,
    owner: o,
    interviewId: opts.interviewId,
    keys,
    workerId: worker,
    nowSec: NOW_SEC,
    failSink: opts.failSink,
  });
}

async function seedSubject(interviewId: string, ownerId = owner): Promise<void> {
  await insertInterview(ownerId, interviewId);
  await insertEvent(ownerId, interviewId, 1, 'question_ready');
  await insertEvent(ownerId, interviewId, 2, 'answer_evaluated');
  await insertGraphRun(ownerId, interviewId);
  await insertReportFixtures(ownerId, interviewId);
}

function bannedRequestTerminal(status: string): boolean {
  return status === 'completed' || status === 'partial_failed';
}

function targetFingerprint(targets: Array<{ sink: string; targetId: string; status?: string }>): string {
  return targets.map((t) => `${t.sink}:${t.targetId}:${t.status ?? ''}`).sort().join('|');
}

async function receiptCount(requestId: string): Promise<number> {
  const r = await admin.query<{ n: string }>(
    `SELECT count(*)::text AS n FROM privacy_deletion_receipt WHERE request_id=$1::uuid`, [requestId]);
  return Number(r.rows[0]?.n ?? -1);
}

async function main() {
  await assertIsolatedTestTarget(admin);
  const porcelain = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (porcelain) {
    console.error('C-UNCOMMITTED refuse: dirty worktree\n' + porcelain);
    process.exit(1);
  }
  const gitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(`UC052_INTERNAL_ERASURE_PROVE gitSha=${gitSha} line=B`);

  /* ── NHP-050-FAULT-01: one local sink fails → target failed · request pending_external ── */
  {
    const id = 'NHP-050-FAULT-01';
    const iv = randomUUID();
    await seedSubject(iv);
    const key = nextHash();
    const result = await erase({ interviewId: iv, keyHash: key, epoch: 3, failSink: 'report' });
    const targets = await loadRequestTargets(admin, result.requestId);
    const failed = targets.find((t) => t.sink === 'report');
    const status = await loadRequestStatus(admin, result.requestId);
    const eventZero = (await eventCount(iv)) === 0;
    const graphZero = (await graphCount(iv)) === 0;
    A(id,
      failed?.status === 'failed'
      && status === 'pending_external'
      && !bannedRequestTerminal(status)
      && eventZero && graphZero,
      `req=${status} report=${failed?.status} event=${await eventCount(iv)} graph=${await graphCount(iv)}`);
    // retry re-claim
    const retry = await retryFailedLocalTarget({
      admin,
      asWorkerPrincipal: (o, fn) => asPrivacyWorkerPrincipal(admin, o, fn),
      owner, jti: result.jti, targetId: failed!.targetId, workerId: worker,
    });
    const after = await loadRequestTargets(admin, result.requestId);
    const reportAfter = after.find((t) => t.sink === 'report');
    const retryOk = reportAfter?.status === 'erased' && retry.requestStatus === 'pending_external';
    if (!retryOk) { failures++; console.log(`FAIL  ${id} retry · report=${reportAfter?.status} req=${retry.requestStatus}`); }
    else console.log(`PASS  ${id} retry · report=${reportAfter?.status} req=${retry.requestStatus}`);
  }

  /* ── NHP-050-FAULT-02: retry idempotency / second begin replay ── */
  {
    const id = 'NHP-050-FAULT-02';
    const iv = randomUUID();
    await seedSubject(iv);
    const key = nextHash();
    const first = await erase({ interviewId: iv, keyHash: key, epoch: 4 });
    const firstProjIds = first.targets
      .filter((x) => x.sink !== 'oss' && x.sink !== 'redis' && x.sink !== 'langfuse')
      .map((x) => x.targetId).sort().join(',');
    // second begin with same key via projection = replay → same request + same target ids
    const replay = await asPrincipal(admin, owner, (c) =>
      beginInterviewProjectionErasure(c, iv, key, 4));
    const replayIds = replay.targets.map((x) => x.targetId).sort().join(',');
    A(id,
      replay.replayed === true
      && replay.requestId === first.requestId
      && first.requestStatus === 'pending_external'
      && !bannedRequestTerminal(first.requestStatus)
      && firstProjIds === replayIds
      && replayIds.split(',').length === 4,
      `replayed=${replay.replayed} sameReq=${replay.requestId === first.requestId} idsMatch=${firstProjIds === replayIds}`);
  }

  /* ── NHP-050-FAULT-03: fence-revive after purge ── */
  {
    const id = 'NHP-050-FAULT-03';
    const iv = randomUUID();
    await seedSubject(iv);
    const result = await erase({ interviewId: iv, keyHash: nextHash(), epoch: 5 });
    const late = await rejects(() => insertEvent(owner, iv, 99, 'late_revive'));
    A(id,
      late && (await eventCount(iv)) === 0 && result.requestStatus === 'pending_external',
      `lateRejected=${late} req=${result.requestStatus}`);
  }

  /* ── NHP-050-FAULT-04: digest / epoch drift refuse ── */
  {
    const id = 'NHP-050-FAULT-04';
    const iv = randomUUID();
    await seedSubject(iv);
    const key = nextHash();
    const begun = await asPrincipal(admin, owner, (c) => beginInterviewProjectionErasure(c, iv, key, 6));
    await attachExternalRetentionPendingTargets(admin, begun.requestId, iv, key);
    const targets = await loadRequestTargets(admin, begun.requestId);
    const signTargets = targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
    // Sign with WRONG epoch
    const signedBad = signPrivacyAuthorizationSnapshot({
      privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 99, targets: signTargets, nowSec: NOW_SEC, ttlSec: 600,
    });
    await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: signedBad.jti, keyId: keys.kid, actor: owner, interviewId: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 99, targetSetDigest: signedBad.targetSetDigest,
      expiresAt: new Date(signedBad.expiresAtMs),
    }));
    const registry = new PrivacyAuthzKeyRegistry();
    registry.activate(keys.kid, keys.publicJwk);
    const verified = verifyPrivacyAuthorizationSnapshot({
      jws: signedBad.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW_SEC,
    });
    // consume may succeed (ledger matches signed 99) but claim fails vs request epoch 6
    let claimRejected = false;
    if (verified) {
      await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, verified, worker));
      const eventT = targets.find((t) => t.sink === 'event')!;
      claimRejected = await rejects(() =>
        asPrivacyWorkerPrincipal(admin, owner, (c) => claimAuthorizationTarget(c, signedBad.jti, eventT.targetId, worker, 60)));
    }
    const status = await reassessRequestStatus(admin, begun.requestId);
    const afterTargets = await loadRequestTargets(admin, begun.requestId);
    const bySink = Object.fromEntries(afterTargets.map((x) => [x.sink, x.status]));
    const localsPending = ['event', 'ai_graph_run', 'report', 'checkpoint_rows']
      .every((s) => bySink[s] === 'pending');
    const externalsRp = ['oss', 'redis', 'langfuse']
      .every((s) => bySink[s] === 'retention_pending');
    A(id,
      claimRejected
      && status === 'purging'
      && !bannedRequestTerminal(status)
      && localsPending
      && externalsRp,
      `claimRejected=${claimRejected} req=${status} localsPending=${localsPending} externalsRp=${externalsRp}`);
  }

  /* ── NHP-050-FAULT-05: already-erased re-request ── */
  {
    const id = 'NHP-050-FAULT-05';
    const iv = randomUUID();
    await seedSubject(iv);
    const key = nextHash();
    const first = await erase({ interviewId: iv, keyHash: key, epoch: 7 });
    const fingerBefore = targetFingerprint(await loadRequestTargets(admin, first.requestId));
    const receiptsBefore = await receiptCount(first.requestId);
    const secondResult = await erase({ interviewId: iv, keyHash: nextHash(), epoch: 8 }).then(
      (r) => ({ outcome: 'created' as const, requestId: r.requestId }),
      () => ({ outcome: 'refused' as const, requestId: null as string | null }),
    );
    const fingerAfter = targetFingerprint(await loadRequestTargets(admin, first.requestId));
    const receiptsAfter = await receiptCount(first.requestId);
    const eventStillZero = (await eventCount(iv)) === 0;
    const graphStillZero = (await graphCount(iv)) === 0;
    const reportStillZero = (await reportCount(iv)) === 0;
    const status = await loadRequestStatus(admin, first.requestId);
    // New request allowed, but first-request ledger + receipts must be unchanged (no duplicate effective erasure)
    const firstLedgerStable = fingerBefore === fingerAfter && receiptsBefore === receiptsAfter;
    const noDupEffective = secondResult.outcome === 'refused'
      || (secondResult.requestId !== null && secondResult.requestId !== first.requestId && firstLedgerStable)
      || (secondResult.requestId === first.requestId && firstLedgerStable);
    A(id,
      eventStillZero && graphStillZero && reportStillZero
      && status === 'pending_external'
      && !bannedRequestTerminal(status)
      && firstLedgerStable
      && noDupEffective,
      `second=${secondResult.outcome} sameReq=${secondResult.requestId === first.requestId} ledgerStable=${firstLedgerStable} receipts=${receiptsBefore}->${receiptsAfter} req=${status}`);
  }

  /* ── NHP-050-NEG-02: unauthorized (forged JWS / no verify) ── */
  {
    const id = 'NHP-050-NEG-02';
    const iv = randomUUID();
    await seedSubject(iv);
    const key = nextHash();
    const begun = await asPrincipal(admin, owner, (c) => beginInterviewProjectionErasure(c, iv, key, 2));
    await attachExternalRetentionPendingTargets(admin, begun.requestId, iv, key);
    const targets = await loadRequestTargets(admin, begun.requestId);
    const eventT = targets.find((t) => t.sink === 'event')!;
    // GUC-only claim without snapshot → must refuse
    const noSnap = await rejects(() =>
      asPrivacyWorkerPrincipal(admin, owner, (c) =>
        claimAuthorizationTarget(c, randomUUID(), eventT.targetId, worker, 60)));
    // Forged jws verify fails
    const registry = new PrivacyAuthzKeyRegistry();
    registry.activate(keys.kid, keys.publicJwk);
    const forged = verifyPrivacyAuthorizationSnapshot({
      jws: 'eyJhbGciOiJFUzI1NiIsImtpZCI6InVjMDUyLWRlbC0yMDI2LTAxIn0.e30.YWJj',
      resolveJwk: registry.resolve.bind(registry), nowSec: NOW_SEC,
    });
    const countsUnchanged = (await eventCount(iv)) === 2;
    A(id, noSnap && forged === null && countsUnchanged, `noSnap=${noSnap} forgedNull=${forged === null}`);
  }

  /* ── NHP-050-NEG-03: cross-tenant DB/claim ── */
  {
    const id = 'NHP-050-NEG-03';
    const ivA = randomUUID();
    const ivB = randomUUID();
    await seedSubject(ivA, owner);
    await seedSubject(ivB, otherOwner);
    const key = nextHash();
    const begun = await asPrincipal(admin, owner, (c) => beginInterviewProjectionErasure(c, ivA, key, 3));
    await attachExternalRetentionPendingTargets(admin, begun.requestId, ivA, key);
    const targets = await loadRequestTargets(admin, begun.requestId);
    const eventT = targets.find((t) => t.sink === 'event')!;
    const signTargets = targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
    const signed = signPrivacyAuthorizationSnapshot({
      privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: ivA,
      purpose: 'interview_data_erasure', privacyEpoch: 3, targets: signTargets, nowSec: NOW_SEC, ttlSec: 600,
    });
    await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: signed.jti, keyId: keys.kid, actor: owner, interviewId: ivA,
      purpose: 'interview_data_erasure', privacyEpoch: 3, targetSetDigest: signed.targetSetDigest,
      expiresAt: new Date(signed.expiresAtMs),
    }));
    const registry = new PrivacyAuthzKeyRegistry();
    registry.activate(keys.kid, keys.publicJwk);
    const verified = verifyPrivacyAuthorizationSnapshot({
      jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW_SEC,
    })!;
    await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, verified, worker));
    const cross = await rejects(() =>
      asPrivacyWorkerPrincipal(admin, otherOwner, (c) =>
        claimAuthorizationTarget(c, signed.jti, eventT.targetId, worker, 60)));
    const bEvents = await eventCount(ivB);
    A(id, cross && bEvents === 2, `crossRejected=${cross} bEvents=${bEvents}`);
  }

  /* ── NHP-050-BOUND-01: concurrent claim → one winner · lease ── */
  {
    const id = 'NHP-050-BOUND-01';
    const iv = randomUUID();
    await seedSubject(iv);
    const key = nextHash();
    const begun = await asPrincipal(admin, owner, (c) => beginInterviewProjectionErasure(c, iv, key, 9));
    await attachExternalRetentionPendingTargets(admin, begun.requestId, iv, key);
    const targets = await loadRequestTargets(admin, begun.requestId);
    const eventT = targets.find((t) => t.sink === 'event')!;
    const signTargets = targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
    const signed = signPrivacyAuthorizationSnapshot({
      privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 9, targets: signTargets, nowSec: NOW_SEC, ttlSec: 600,
    });
    await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: signed.jti, keyId: keys.kid, actor: owner, interviewId: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 9, targetSetDigest: signed.targetSetDigest,
      expiresAt: new Date(signed.expiresAtMs),
    }));
    const registry = new PrivacyAuthzKeyRegistry();
    registry.activate(keys.kid, keys.publicJwk);
    const verified = verifyPrivacyAuthorizationSnapshot({
      jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW_SEC,
    })!;
    await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, verified, worker));
    const [a, b] = await Promise.all([
      asPrivacyWorkerPrincipal(admin, owner, (c) => claimAuthorizationTarget(c, signed.jti, eventT.targetId, `${worker}-a`, 60)),
      asPrivacyWorkerPrincipal(admin, owner, (c) => claimAuthorizationTarget(c, signed.jti, eventT.targetId, `${worker}-b`, 60)),
    ]);
    const winners = [a, b].filter((x) => x && x.leaseToken);
    const nTargets = (await loadRequestTargets(admin, begun.requestId)).filter((t) => t.sink === 'event').length;
    A(id,
      winners.length === 1 && nTargets === 1,
      `winners=${winners.length} a=${!!a?.leaseToken} b=${!!b?.leaseToken} eventTargets=${nTargets}`);
  }

  /* ── NHP-050-NEG-01: public DELETE still 503 (service pin · no new route) ── */
  {
    const id = 'NHP-050-NEG-01';
    // Import service method — pure throw, no HTTP server required.
    const mod = await import('../../../apps/api/src/modules/privacy/privacy.service.ts');
    const svc = Object.create(mod.PrivacyService.prototype) as InstanceType<typeof mod.PrivacyService>;
    let status: number | null = null;
    let code: string | null = null;
    try {
      svc.eraseInterviewData('principal', randomUUID(), 'idem-key-12345678');
    } catch (e: any) {
      status = e?.getStatus?.() ?? e?.status ?? null;
      code = e?.response?.error ?? e?.message ?? null;
    }
    // Also confirm no app_role EXECUTE on privacy_begin_checkpoint_erasure
    const grant = await admin.query<{ has: boolean }>(
      `SELECT has_function_privilege('app_role', 'privacy_begin_checkpoint_erasure(text,text)', 'EXECUTE') AS has`,
    );
    A(id,
      status === 503
      && String(code).includes('interview_erasure_authorization_not_available')
      && grant.rows[0]?.has === false,
      `httpStatus=${status} grant=${grant.rows[0]?.has}`);
  }

  /* ── HP-050-01: happy path last ── */
  {
    const id = 'HP-050-01';
    const iv = randomUUID();
    await seedSubject(iv);
    const result = await erase({ interviewId: iv, keyHash: nextHash(), epoch: 11 });
    const targets = await loadRequestTargets(admin, result.requestId);
    const localsOk = ['event', 'ai_graph_run', 'report'].every((s) =>
      targets.find((t) => t.sink === s)?.status === 'erased');
    const externalsOk = ['oss', 'redis', 'langfuse'].every((s) =>
      targets.find((t) => t.sink === s)?.status === 'retention_pending');
    A(id,
      result.requestStatus === 'pending_external'
      && !bannedRequestTerminal(result.requestStatus)
      && localsOk && externalsOk
      && (await eventCount(iv)) === 0
      && (await graphCount(iv)) === 0
      && (await reportCount(iv)) === 0,
      `req=${result.requestStatus} localsOk=${localsOk} externalsOk=${externalsOk}`);
  }

  /* ── C-CASECOUNT ── */
  const missing = REQUIRED_CASES.filter((c) => !seen.has(c));
  A('C-CASECOUNT', missing.length === 0, missing.length ? `missing=${missing.join(',')}` : 'all present');

  // Per-sink SQL assert summary (C-SQL-PER-SINK)
  console.log(JSON.stringify({
    line: 'B',
    gitSha,
    releaseEvidence: false,
    haStatus: 'NOT_HA',
    cases: Object.fromEntries([...caseStatus.entries()]),
    required: REQUIRED_CASES,
    perSinkSql: {
      event: 'SELECT count(*) FROM interview_event WHERE stream_key=$interviewId  -- expect 0',
      ai_graph_run: 'SELECT count(*) FROM ai_graph_run WHERE thread_id=$interviewId  -- expect 0',
      report: 'SELECT count(*) FROM ai_report+assessment_report+learning_plan+learning_progress+career_path+question_feedback WHERE interview_id=$interviewId  -- expect 0',
      checkpoint_rows: 'fence-only erased at begin (no physical checkpoint purge this knife)',
      oss_redis_langfuse: "status='retention_pending' on privacy_deletion_target",
    },
  }));

  console.log(failures === 0
    ? '\n✓ UC052 internal erasure prove PASS'
    : `\n✗ ${failures} assertion failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
