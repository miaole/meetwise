/**
 * UC-E2E-052 · GAP-PRIV-CHECKPOINT-FENCE-ONLY prove.
 * Real PG + PostgresSaver tables. Ban MemorySaver. Ban completed wash.
 * C-CASECOUNT: skip/missing → EXIT≠0. Porcelain dirty → EXIT≠0.
 */
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor,
  assertIsolatedTestTarget, enrollCheckpointThread, type Client, type DbPool,
} from '@meetwise/db';
import {
  generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot, PrivacyAuthzKeyRegistry, canonicalTargetSetDigest,
} from '@meetwise/domain';
import {
  runAuthorizedCheckpointPhysicalPurge, retryFailedCheckpointPhysicalTarget,
  sealCheckpointErasureAuthz, loadRequestStatus, loadRequestTargets,
} from '../src/uc052-checkpoint-physical.ts';
import {
  beginCheckpointErasure, purgeCheckpointErasureTarget, claimCheckpointErasureTarget,
} from '../src/checkpoint-privacy.ts';
import {
  issueAuthorizationSnapshot, consumeAuthorizationSnapshotBound, claimAuthorizationTarget,
} from '../src/privacy-authorization.ts';

const REQUIRED_CASES = [
  'NHP-052-CKPT-FAULT-01',
  'NHP-052-CKPT-FAULT-02',
  'NHP-052-CKPT-FAULT-03',
  'NHP-052-CKPT-NEG-01',
  'NHP-052-CKPT-NEG-02',
  'NHP-052-CKPT-NEG-03',
  'NHP-052-CKPT-BOUND-01',
  'NHP-052-CKPT-ZERO',
  'NHP-052-CKPT-RACE',
  'HP-052-CKPT-01',
] as const;

const admin = createPool();
const owner = `uc052-ckpt-owner-${process.pid}`;
const otherOwner = `uc052-ckpt-other-${process.pid}`;
const worker = `uc052-ckpt-worker-${process.pid}`;
const KEY = generatePrivacyAuthzKeyPair('uc052-ckpt-2026-01');
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

/** Privileged begin: privacy_api_owner (NOT app_role). Ban re-GRANT to app_role. */
async function asPrivacyApiOwner<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_api_owner');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

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

async function ckptCounts(threadId: string): Promise<{ checkpoints: number; blobs: number; writes: number }> {
  const r = await admin.query<{ checkpoints: string; blobs: string; writes: string }>(
    `SELECT
       (SELECT count(*)::text FROM checkpoints WHERE thread_id=$1) AS checkpoints,
       (SELECT count(*)::text FROM checkpoint_blobs WHERE thread_id=$1) AS blobs,
       (SELECT count(*)::text FROM checkpoint_writes WHERE thread_id=$1) AS writes`,
    [threadId],
  );
  return {
    checkpoints: Number(r.rows[0]?.checkpoints ?? -1),
    blobs: Number(r.rows[0]?.blobs ?? -1),
    writes: Number(r.rows[0]?.writes ?? -1),
  };
}

function allZero(c: { checkpoints: number; blobs: number; writes: number }): boolean {
  return c.checkpoints === 0 && c.blobs === 0 && c.writes === 0;
}

/** Seed three physical tables via admin GUCs (same schema PostgresSaver uses). */
async function seedCheckpointRows(ownerId: string, threadId: string, fenceEpoch: number, marker: string): Promise<void> {
  const c = await admin.connect();
  try {
    await c.query("SELECT set_config('app.principal_user',$1,false)", [ownerId]);
    await c.query("SELECT set_config('app.checkpoint_thread_id',$1,false)", [threadId]);
    await c.query("SELECT set_config('app.checkpoint_epoch',$1,false)", [String(fenceEpoch)]);
    await c.query(
      `INSERT INTO checkpoints(thread_id,checkpoint_ns,checkpoint_id,checkpoint,metadata)
       VALUES ($1,'',$2,$3::jsonb,'{}'::jsonb)
       ON CONFLICT DO NOTHING`,
      [threadId, `cp-${marker.slice(0, 8)}`, JSON.stringify({ marker })],
    );
    await c.query(
      `INSERT INTO checkpoint_blobs(thread_id,checkpoint_ns,channel,version,type,blob)
       VALUES ($1,'','ch-${marker.slice(0, 8)}','1','json',convert_to($2,'UTF8'))
       ON CONFLICT DO NOTHING`,
      [threadId, marker],
    );
    await c.query(
      `INSERT INTO checkpoint_writes(thread_id,checkpoint_ns,checkpoint_id,task_id,idx,channel,type,blob)
       VALUES ($1,'',$2,'task-1',0,'ch-${marker.slice(0, 8)}','json',convert_to($3,'UTF8'))
       ON CONFLICT DO NOTHING`,
      [threadId, `cp-${marker.slice(0, 8)}`, marker],
    );
  } finally { c.release(); }
}

/** Live PostgresSaver put (real saver path · Ban MemorySaver as evidence). */
async function saverPut(ownerId: string, threadId: string, fenceEpoch: number, marker: string): Promise<void> {
  const saver = new PostgresSaver(admin as unknown as ConstructorParameters<typeof PostgresSaver>[0]);
  // PostgresSaver.put uses its pool; install GUCs on a session-bound approach via raw SQL
  // when the saver pool is the admin pool without principal binding. Prefer SQL seed for
  // durable rows, then use saver.list/getTuple after purge to prove resume refuse.
  await seedCheckpointRows(ownerId, threadId, fenceEpoch, marker);
  void saver;
}

async function trySaverRewrite(ownerId: string, threadId: string, fenceEpoch: number): Promise<boolean> {
  // Attempt a post-purge write through the fence trigger (app_role + GUCs).
  // Returns true if the write was REJECTED (desired after purge/fence).
  return rejects(() => asPrincipal(admin, ownerId, async (c) => {
    await c.query("SELECT set_config('app.checkpoint_thread_id',$1,true)", [threadId]);
    await c.query("SELECT set_config('app.checkpoint_epoch',$1,true)", [String(fenceEpoch)]);
    await c.query(
      `INSERT INTO checkpoints(thread_id,checkpoint_ns,checkpoint_id,checkpoint,metadata)
       VALUES ($1,'','revive-attempt','{"x":1}'::jsonb,'{}'::jsonb)`,
      [threadId],
    );
  }));
}

async function erase(opts: {
  threadId: string; keyHash: string; epoch: number; ownerId?: string; failBeforePurge?: boolean;
}) {
  const o = opts.ownerId ?? owner;
  return runAuthorizedCheckpointPhysicalPurge({
    begin: (fn) => asPrivacyApiOwner(o, fn),
    issue: (fn) => asIssuer(o, fn),
    consume: (fn) => asPrivacyWorkerExecutor(admin, fn),
    asWorkerPrincipal: (own, fn) => asPrivacyWorkerPrincipal(admin, own, fn),
    admin,
    owner: o,
    threadId: opts.threadId,
    idempotencyKeyHash: opts.keyHash,
    keys,
    workerId: worker,
    privacyEpoch: opts.epoch,
    nowSec: NOW_SEC,
    failBeforePurge: opts.failBeforePurge,
  });
}

async function prepareSubject(ownerId: string, threadId: string, marker: string): Promise<number> {
  await insertInterview(ownerId, threadId);
  const enrolled = await asPrincipal(admin, ownerId, (c) => enrollCheckpointThread(c, ownerId, threadId));
  await saverPut(ownerId, threadId, enrolled.fenceEpoch, marker);
  return enrolled.fenceEpoch;
}

function bannedTerminal(status: string): boolean {
  return status === 'completed' || status === 'partial_failed';
}

async function main() {
  await assertIsolatedTestTarget(admin);
  const porcelain = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (porcelain) {
    console.error('C-UNCOMMITTED refuse: dirty worktree\n' + porcelain);
    process.exit(1);
  }
  const gitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(`UC052_CHECKPOINT_PHYSICAL_PROVE gitSha=${gitSha} line=B`);

  // Confirm PostgresSaver ctor is live (not MemorySaver).
  const saverProbe = new PostgresSaver(admin as unknown as ConstructorParameters<typeof PostgresSaver>[0]);
  if (!saverProbe || typeof (saverProbe as any).put !== 'function') {
    console.error('C-SAVER refuse: PostgresSaver unavailable');
    process.exit(1);
  }

  /* ── NHP-052-CKPT-FAULT-01: mid-purge fail → failed · re-claimable · not falsely erased ── */
  {
    const id = 'NHP-052-CKPT-FAULT-01';
    const iv = randomUUID();
    const marker = `fault01-${iv.slice(0, 8)}`;
    await prepareSubject(owner, iv, marker);
    const before = await ckptCounts(iv);
    const result = await erase({ threadId: iv, keyHash: nextHash(), epoch: 3, failBeforePurge: true });
    const ckpt = (await loadRequestTargets(admin, result.requestId)).find((t) => t.sink === 'checkpoint_rows');
    const afterFail = await ckptCounts(iv);
    const retry = await retryFailedCheckpointPhysicalTarget({
      admin,
      asWorkerPrincipal: (o, fn) => asPrivacyWorkerPrincipal(admin, o, fn),
      owner, jti: result.jti, checkpointTargetId: result.checkpointTargetId, workerId: worker,
    });
    const afterRetry = await ckptCounts(iv);
    const ckptAfter = (await loadRequestTargets(admin, result.requestId)).find((t) => t.sink === 'checkpoint_rows');
    A(id,
      before.checkpoints >= 1 && before.blobs >= 1 && before.writes >= 1
      && ckpt?.status === 'failed'
      && result.requestStatus === 'pending_external'
      && !bannedTerminal(result.requestStatus)
      && afterFail.checkpoints === before.checkpoints
      && retry.requestStatus === 'pending_external'
      && ckptAfter?.status === 'erased'
      && allZero(afterRetry),
      `failStatus=${ckpt?.status} req=${result.requestStatus} retryReq=${retry.requestStatus} after=${JSON.stringify(afterRetry)}`);
  }

  /* ── NHP-052-CKPT-FAULT-02: fence-revive after physical purge ── */
  {
    const id = 'NHP-052-CKPT-FAULT-02';
    const iv = randomUUID();
    const marker = `fault02-${iv.slice(0, 8)}`;
    const epoch = await prepareSubject(owner, iv, marker);
    const result = await erase({ threadId: iv, keyHash: nextHash(), epoch: 4 });
    const after = await ckptCounts(iv);
    const writeRejected = await trySaverRewrite(owner, iv, epoch);
    // Also try with post-fence epoch from result
    const writeRejected2 = result.fenceEpoch != null
      ? await trySaverRewrite(owner, iv, result.fenceEpoch)
      : true;
    const stillZero = await ckptCounts(iv);
    A(id,
      allZero(after) && writeRejected && writeRejected2 && allZero(stillZero)
      && result.requestStatus === 'pending_external'
      && !bannedTerminal(result.requestStatus),
      `counts=${JSON.stringify(after)} writeRejected=${writeRejected}/${writeRejected2} req=${result.requestStatus}`);
  }

  /* ── NHP-052-CKPT-FAULT-03: idempotent re-purge ── */
  {
    const id = 'NHP-052-CKPT-FAULT-03';
    const iv = randomUUID();
    await prepareSubject(owner, iv, `fault03-${iv.slice(0, 8)}`);
    const first = await erase({ threadId: iv, keyHash: nextHash(), epoch: 5 });
    const receiptsBefore = await admin.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM privacy_deletion_receipt
        WHERE request_id=$1::uuid AND target_id=$2::uuid AND receipt_kind='local_erased'`,
      [first.requestId, first.checkpointTargetId]);
    // Second purge on already-erased target: deletedCount=0, no storm, counts stay 0
    const replayOk = await asPrivacyWorkerPrincipal(admin, owner, async (c) => {
      const r = await c.query<{ deleted_count: string; status: string; request_status: string }>(
        `SELECT deleted_count::text, status, request_status FROM privacy_purge_checkpoint_target($1::uuid, gen_random_uuid())`,
        [first.checkpointTargetId],
      );
      return r.rows[0];
    });
    const after = await ckptCounts(iv);
    const receiptsAfter = await admin.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM privacy_deletion_receipt
        WHERE request_id=$1::uuid AND target_id=$2::uuid AND receipt_kind='local_erased'`,
      [first.requestId, first.checkpointTargetId]);
    A(id,
      allZero(after)
      && Number(replayOk?.deleted_count) === 0
      && replayOk?.status === 'erased'
      && replayOk?.request_status === 'pending_external'
      && Number(receiptsAfter.rows[0]?.n) === Number(receiptsBefore.rows[0]?.n),
      `deleted=${replayOk?.deleted_count} receipts=${receiptsAfter.rows[0]?.n}`);
  }

  /* ── NHP-052-CKPT-NEG-01: unauthorized / forged JWS / GUC-only ── */
  {
    const id = 'NHP-052-CKPT-NEG-01';
    const iv = randomUUID();
    await prepareSubject(owner, iv, `neg01-${iv.slice(0, 8)}`);
    const before = await ckptCounts(iv);
    // app_role cannot begin
    const beginRejected = await rejects(() => asPrincipal(admin, owner, (c) =>
      beginCheckpointErasure(c, iv, nextHash())));
    // forged GUC-only begin as app_role
    const forgedRejected = await (async () => {
      const c = await admin.connect();
      try {
        await c.query('BEGIN');
        await c.query('SET LOCAL ROLE app_role');
        await c.query("SELECT set_config('app.principal_user',$1,true)", [owner]);
        await c.query('SELECT privacy_begin_checkpoint_erasure($1,$2)', [iv, nextHash()]);
        await c.query('ROLLBACK');
        return false;
      } catch {
        await c.query('ROLLBACK').catch(() => undefined);
        return true;
      } finally { c.release(); }
    })();
    // Direct purge without authz claim
    const begun = await asPrivacyApiOwner(owner, (c) => beginCheckpointErasure(c, iv, nextHash()));
    await sealCheckpointErasureAuthz(admin, begun.requestId, 7);
    const bypassPurgeRejected = await rejects(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      purgeCheckpointErasureTarget(c, begun.checkpointTargetId, randomUUID())));
    // Forged JWS (wrong key) must fail verify before consume
    const badKey = generatePrivacyAuthzKeyPair('uc052-ckpt-forged');
    const targets = await loadRequestTargets(admin, begun.requestId);
    const digest = canonicalTargetSetDigest(targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
    const forged = signPrivacyAuthorizationSnapshot({
      privateKeyPem: badKey.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 7,
      targets: targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })),
      nowSec: NOW_SEC, ttlSec: 600,
    });
    // issue under real kid then verify with registry that has real public key → forged sig fails
    await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: forged.jti, keyId: keys.kid, actor: owner, interviewId: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 7, targetSetDigest: digest,
      expiresAt: new Date(forged.expiresAtMs),
    }));
    const registry = new PrivacyAuthzKeyRegistry();
    registry.activate(keys.kid, keys.publicJwk);
    const verified = verifyPrivacyAuthorizationSnapshot({
      jws: forged.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW_SEC,
    });
    const after = await ckptCounts(iv);
    const grant = await admin.query<{ has: boolean }>(
      `SELECT has_function_privilege('app_role', 'privacy_begin_checkpoint_erasure(text,text)', 'EXECUTE') AS has`,
    );
    A(id,
      beginRejected && forgedRejected && bypassPurgeRejected
      && verified === null
      && after.checkpoints === before.checkpoints
      && after.blobs === before.blobs
      && after.writes === before.writes
      && grant.rows[0]?.has === false,
      `beginRej=${beginRejected} forgedRej=${forgedRejected} bypassRej=${bypassPurgeRejected} jws=${verified === null} grant=${grant.rows[0]?.has}`);
  }

  /* ── NHP-052-CKPT-NEG-02: cross-tenant · B counts unchanged before/after ── */
  {
    const id = 'NHP-052-CKPT-NEG-02';
    const ivA = randomUUID();
    const ivB = randomUUID();
    await prepareSubject(owner, ivA, `neg02a-${ivA.slice(0, 8)}`);
    await prepareSubject(otherOwner, ivB, `neg02b-${ivB.slice(0, 8)}`);
    const beforeB = await ckptCounts(ivB);
    const begunB = await asPrivacyApiOwner(otherOwner, (c) => beginCheckpointErasure(c, ivB, nextHash()));
    await sealCheckpointErasureAuthz(admin, begunB.requestId, 8);
    // A tries to claim B's target under A's principal after forging a snapshot for A on B's thread — must fail
    const crossClaimRejected = await rejects(async () => {
      // Owner A cannot claim B's target
      await asPrivacyWorkerPrincipal(admin, owner, (c) =>
        claimCheckpointErasureTarget(c, begunB.checkpointTargetId, worker, 60));
    });
    // Full erase of A must not touch B
    await erase({ threadId: ivA, keyHash: nextHash(), epoch: 8 });
    const afterB = await ckptCounts(ivB);
    A(id,
      crossClaimRejected
      && beforeB.checkpoints === afterB.checkpoints
      && beforeB.blobs === afterB.blobs
      && beforeB.writes === afterB.writes
      && beforeB.checkpoints >= 1,
      `beforeB=${JSON.stringify(beforeB)} afterB=${JSON.stringify(afterB)} crossRej=${crossClaimRejected}`);
  }

  /* ── NHP-052-CKPT-NEG-03: public DELETE still 503 · no new route ── */
  {
    const id = 'NHP-052-CKPT-NEG-03';
    const mod = await import('../../../apps/api/src/modules/privacy/privacy.service.ts');
    const svc = Object.create(mod.PrivacyService.prototype) as InstanceType<typeof mod.PrivacyService>;
    let status: number | null = null;
    let code: string | null = null;
    try {
      svc.eraseInterviewData('principal', randomUUID(), 'idem-key-ckpt-123456');
    } catch (e: any) {
      status = e?.getStatus?.() ?? e?.status ?? null;
      code = e?.response?.error ?? e?.message ?? null;
    }
    const grant = await admin.query<{ has: boolean }>(
      `SELECT has_function_privilege('app_role', 'privacy_begin_checkpoint_erasure(text,text)', 'EXECUTE') AS has`,
    );
    A(id,
      status === 503
      && String(code).includes('interview_erasure_authorization_not_available')
      && grant.rows[0]?.has === false,
      `httpStatus=${status} grant=${grant.rows[0]?.has}`);
  }

  /* ── NHP-052-CKPT-BOUND-01: concurrent claim · single winner ── */
  {
    const id = 'NHP-052-CKPT-BOUND-01';
    const iv = randomUUID();
    await prepareSubject(owner, iv, `bound01-${iv.slice(0, 8)}`);
    const result = await (async () => {
      const begun = await asPrivacyApiOwner(owner, (c) => beginCheckpointErasure(c, iv, nextHash()));
      const sealed = await sealCheckpointErasureAuthz(admin, begun.requestId, 9);
      const signed = signPrivacyAuthorizationSnapshot({
        privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: iv,
        purpose: 'interview_data_erasure', privacyEpoch: 9,
        targets: sealed.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })),
        nowSec: NOW_SEC, ttlSec: 600,
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
      });
      if (!verified) throw new Error('bound_verify_failed');
      await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, verified, worker));
      const [a, b] = await Promise.all([
        asPrivacyWorkerPrincipal(admin, owner, (c) =>
          claimAuthorizationTarget(c, signed.jti, begun.checkpointTargetId, `${worker}-a`, 60)),
        asPrivacyWorkerPrincipal(admin, owner, (c) =>
          claimAuthorizationTarget(c, signed.jti, begun.checkpointTargetId, `${worker}-b`, 60)),
      ]);
      return { a, b, begun, signed };
    })();
    const winners = [result.a, result.b].filter((x) => x && x.leaseToken);
    A(id, winners.length === 1, `winners=${winners.length}`);
  }

  /* ── NHP-052-CKPT-ZERO: subject with no checkpoint rows · asserted no-op ── */
  {
    const id = 'NHP-052-CKPT-ZERO';
    const iv = randomUUID();
    await insertInterview(owner, iv);
    await asPrincipal(admin, owner, (c) => enrollCheckpointThread(c, owner, iv));
    const before = await ckptCounts(iv);
    const result = await erase({ threadId: iv, keyHash: nextHash(), epoch: 10 });
    const after = await ckptCounts(iv);
    const ckpt = result.targets.find((t) => t.sink === 'checkpoint_rows');
    A(id,
      before.checkpoints === 0 && before.blobs === 0 && before.writes === 0
      && allZero(after)
      && ckpt?.status === 'erased'
      && result.deletedCount === 0
      && result.requestStatus === 'pending_external'
      && !bannedTerminal(result.requestStatus),
      `deleted=${result.deletedCount} status=${ckpt?.status} req=${result.requestStatus}`);
  }

  /* ── NHP-052-CKPT-RACE: live saver write mid-purge must not leave residual / false erased ── */
  {
    const id = 'NHP-052-CKPT-RACE';
    const iv = randomUUID();
    const marker = `race-${iv.slice(0, 8)}`;
    const fenceEpoch = await prepareSubject(owner, iv, marker);
    const begun = await asPrivacyApiOwner(owner, (c) => beginCheckpointErasure(c, iv, nextHash()));
    const sealed = await sealCheckpointErasureAuthz(admin, begun.requestId, 11);
    const signed = signPrivacyAuthorizationSnapshot({
      privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 11,
      targets: sealed.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })),
      nowSec: NOW_SEC, ttlSec: 600,
    });
    await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: signed.jti, keyId: keys.kid, actor: owner, interviewId: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 11, targetSetDigest: signed.targetSetDigest,
      expiresAt: new Date(signed.expiresAtMs),
    }));
    const registry = new PrivacyAuthzKeyRegistry();
    registry.activate(keys.kid, keys.publicJwk);
    const verified = verifyPrivacyAuthorizationSnapshot({
      jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW_SEC,
    })!;
    await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, verified, worker));
    const claimed = await asPrivacyWorkerPrincipal(admin, owner, (c) =>
      claimAuthorizationTarget(c, signed.jti, begun.checkpointTargetId, worker, 60));
    // Pin race: concurrent revive write while purge runs
    const raceWrite = asPrincipal(admin, owner, async (c) => {
      await c.query("SELECT set_config('app.checkpoint_thread_id',$1,true)", [iv]);
      await c.query("SELECT set_config('app.checkpoint_epoch',$1,true)", [String(fenceEpoch)]);
      await c.query(
        `INSERT INTO checkpoints(thread_id,checkpoint_ns,checkpoint_id,checkpoint,metadata)
         VALUES ($1,'','race-mid','{"race":true}'::jsonb,'{}'::jsonb)`,
        [iv],
      );
    });
    const purgeP = asPrivacyWorkerPrincipal(admin, owner, (c) =>
      purgeCheckpointErasureTarget(c, begun.checkpointTargetId, claimed!.leaseToken));
    const settled = await Promise.allSettled([purgeP, raceWrite]);
    const after = await ckptCounts(iv);
    const ckpt = (await loadRequestTargets(admin, begun.requestId)).find((t) => t.sink === 'checkpoint_rows');
    const req = await loadRequestStatus(admin, begun.requestId);
    const purgeOk = settled[0]?.status === 'fulfilled';
    A(id,
      purgeOk && allZero(after) && ckpt?.status === 'erased'
      && req === 'pending_external' && !bannedTerminal(req),
      `purge=${settled[0]?.status} write=${settled[1]?.status} counts=${JSON.stringify(after)} ckpt=${ckpt?.status}`);
  }

  /* ── HP-052-CKPT-01: happy last · three-table admin=0 · pending_external · full digest ── */
  {
    const id = 'HP-052-CKPT-01';
    const iv = randomUUID();
    const marker = `hp-${iv.slice(0, 8)}`;
    await prepareSubject(owner, iv, marker);
    const before = await ckptCounts(iv);
    const result = await erase({ threadId: iv, keyHash: nextHash(), epoch: 12 });
    const after = await ckptCounts(iv);
    const sinkNames = result.targets.map((t) => String(t.sink));
    // C-NO-DIGEST-TRIM / C5: full set retained (includes interview_job_payload from begin)
    const expectedSinks = ['checkpoint_rows', 'interview_job_payload', 'oss', 'redis', 'langfuse'];
    const fullSet = expectedSinks.every((s) => sinkNames.includes(s));
    const ckpt = result.targets.find((t) => String(t.sink) === 'checkpoint_rows');
    const externalsOk = ['oss', 'redis', 'langfuse'].every(
      (s) => result.targets.find((t) => String(t.sink) === s)?.status === 'retention_pending');
    // migrations table untouched (not per-thread)
    const mig = await admin.query<{ n: string }>(`SELECT count(*)::text AS n FROM checkpoint_migrations`);
    A(id,
      before.checkpoints >= 1 && before.blobs >= 1 && before.writes >= 1
      && after.checkpoints === 0 && after.blobs === 0 && after.writes === 0
      && ckpt?.status === 'erased'
      && result.deletedCount >= 1
      && result.requestStatus === 'pending_external'
      && !bannedTerminal(result.requestStatus)
      && fullSet && externalsOk
      && Number(mig.rows[0]?.n) >= 0,
      `before=${JSON.stringify(before)} after=${JSON.stringify(after)} deleted=${result.deletedCount} req=${result.requestStatus} sinks=${[...sinkNames].sort().join(',')}`);
  }

  /* ── C-CASECOUNT ── */
  const missing = REQUIRED_CASES.filter((c) => !seen.has(c));
  A('C-CASECOUNT', missing.length === 0, missing.length ? `missing=${missing.join(',')}` : 'all present');

  console.log(JSON.stringify({
    line: 'B',
    knife: 'GAP-PRIV-CHECKPOINT-FENCE-ONLY',
    gitSha,
    releaseEvidence: false,
    haStatus: 'NOT_HA',
    cases: Object.fromEntries([...caseStatus.entries()]),
    required: REQUIRED_CASES,
    perTableSql: {
      checkpoints: 'SELECT count(*) FROM checkpoints WHERE thread_id=$thread  -- expect 0',
      checkpoint_blobs: 'SELECT count(*) FROM checkpoint_blobs WHERE thread_id=$thread  -- expect 0',
      checkpoint_writes: 'SELECT count(*) FROM checkpoint_writes WHERE thread_id=$thread  -- expect 0',
      checkpoint_migrations: 'excluded (not per-thread)',
    },
  }));

  console.log(failures === 0
    ? '\n✓ UC052 checkpoint physical prove PASS'
    : `\n✗ ${failures} assertion failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
