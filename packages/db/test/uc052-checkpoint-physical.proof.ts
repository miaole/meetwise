/**
 * UC-E2E-052 · GAP-PRIV-CHECKPOINT-FENCE-ONLY prove.
 * Real PG + real PostgresSaver API (setup/put/putWrites/getTuple). Ban MemorySaver.
 * C-CASECOUNT: skip/missing → EXIT≠0. Porcelain dirty → EXIT≠0.
 *
 * Disclosure 2: seal privacy_epoch+target_set_digest after begin — see harness §Disclosure 2
 * and packages/db/src/uc052-checkpoint-physical.ts sealCheckpointErasureAuthz.
 */
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { emptyCheckpoint, uuid6 } from '@langchain/langgraph-checkpoint';
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor,
  assertIsolatedTestTarget, enrollCheckpointThread, type Client,
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
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import {
  withCheckpointAccess, PrincipalBoundCheckpointPool, type CheckpointAccess,
} from '../../../apps/worker/src/checkpoint-principal.ts';

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
  'NHP-052-CKPT-RACE-TRIGGER',
  'HP-052-CKPT-01',
  'C-DIGEST-JWS',
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
function allPositive(c: { checkpoints: number; blobs: number; writes: number }): boolean {
  return c.checkpoints > 0 && c.blobs > 0 && c.writes > 0;
}

type Saver = PostgresSaver;

/** Real PostgresSaver put + putWrites so all three physical tables are populated. */
async function saverSeed(
  saver: Saver, access: CheckpointAccess, marker: string,
): Promise<{ config: { configurable: { thread_id: string; checkpoint_ns: string; checkpoint_id: string } } }> {
  const checkpoint = emptyCheckpoint();
  checkpoint.id = uuid6(Date.now());
  checkpoint.ts = new Date().toISOString();
  checkpoint.channel_values = { privacy_marker: marker };
  checkpoint.channel_versions = { privacy_marker: 1 };
  const config = { configurable: { thread_id: access.threadId, checkpoint_ns: '' } };
  const newVersions = { privacy_marker: 1 };
  const next = await withCheckpointAccess(access, () =>
    saver.put(config, checkpoint, { source: 'input', step: -1, parents: {} }, newVersions));
  const writeConfig = {
    configurable: {
      thread_id: access.threadId,
      checkpoint_ns: '',
      checkpoint_id: String(next.configurable?.checkpoint_id ?? checkpoint.id),
    },
  };
  await withCheckpointAccess(access, () =>
    saver.putWrites(writeConfig, [['privacy_marker', marker]], `task-${marker.slice(0, 8)}`));
  return { config: writeConfig as any };
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

async function prepareSubject(
  saver: Saver, ownerId: string, threadId: string, marker: string,
): Promise<{ fenceEpoch: number; access: CheckpointAccess }> {
  await insertInterview(ownerId, threadId);
  const enrolled = await asPrincipal(admin, ownerId, (c) => enrollCheckpointThread(c, ownerId, threadId));
  const access: CheckpointAccess = {
    owner: ownerId, threadId: enrolled.threadId, fenceEpoch: enrolled.fenceEpoch,
  };
  await saverSeed(saver, access, marker);
  const counts = await ckptCounts(threadId);
  if (!allPositive(counts)) {
    throw Object.assign(new Error('saver_seed_incomplete'), { code: 'saver_seed_incomplete', counts });
  }
  return { fenceEpoch: enrolled.fenceEpoch, access };
}

function bannedTerminal(status: string): boolean {
  return status === 'completed' || status === 'partial_failed';
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
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

  // setup() on admin-backed saver (DDL-capable / migrations already applied in isolate).
  // Then PrincipalBoundCheckpointPool + PostgresSaver for real put/putWrites/getTuple (Ban MemorySaver).
  const setupSaver = new PostgresSaver(admin as unknown as ConstructorParameters<typeof PostgresSaver>[0]);
  await setupSaver.setup();
  // Do NOT end admin pool — shared with proof.
  const saver = new PostgresSaver(new PrincipalBoundCheckpointPool(admin).asPool());
  if (typeof saver.put !== 'function' || typeof saver.putWrites !== 'function') {
    console.error('C-SAVER refuse: PostgresSaver API missing put/putWrites');
    process.exit(1);
  }

  try {
  /* ── NHP-052-CKPT-FAULT-01: mid-purge fail → failed · re-claimable · not falsely erased ── */
  {
    const id = 'NHP-052-CKPT-FAULT-01';
    const iv = randomUUID();
    const marker = `fault01-${iv.slice(0, 8)}`;
    await prepareSubject(saver, owner, iv, marker);
    const before = await ckptCounts(iv);
    const result = await erase({ threadId: iv, keyHash: nextHash(), epoch: 3, failBeforePurge: true });
    const ckpt = (await loadRequestTargets(admin, result.requestId)).find((t) => String(t.sink) === 'checkpoint_rows');
    const afterFail = await ckptCounts(iv);
    const retry = await retryFailedCheckpointPhysicalTarget({
      admin,
      asWorkerPrincipal: (o, fn) => asPrivacyWorkerPrincipal(admin, o, fn),
      owner, jti: result.jti, checkpointTargetId: result.checkpointTargetId, workerId: worker,
    });
    const afterRetry = await ckptCounts(iv);
    const ckptAfter = (await loadRequestTargets(admin, result.requestId)).find((t) => String(t.sink) === 'checkpoint_rows');
    A(id,
      allPositive(before)
      && ckpt?.status === 'failed'
      && result.requestStatus === 'pending_external'
      && !bannedTerminal(result.requestStatus)
      && afterFail.checkpoints === before.checkpoints
      && retry.requestStatus === 'pending_external'
      && ckptAfter?.status === 'erased'
      && allZero(afterRetry),
      `failStatus=${ckpt?.status} req=${result.requestStatus} retryReq=${retry.requestStatus} after=${JSON.stringify(afterRetry)}`);
  }

  /* ── NHP-052-CKPT-FAULT-02: fence-revive via real saver getTuple/put after physical purge ── */
  {
    const id = 'NHP-052-CKPT-FAULT-02';
    const iv = randomUUID();
    const marker = `fault02-${iv.slice(0, 8)}`;
    const { access } = await prepareSubject(saver, owner, iv, marker);
    const result = await erase({ threadId: iv, keyHash: nextHash(), epoch: 4 });
    const after = await ckptCounts(iv);
    const cfg = { configurable: { thread_id: iv, checkpoint_ns: '' } };
    let getTupleResult: 'empty' | 'present' | 'threw' = 'empty';
    try {
      const tup = await withCheckpointAccess(access, () => saver.getTuple(cfg));
      getTupleResult = tup === undefined ? 'empty' : 'present';
    } catch { getTupleResult = 'threw'; }
    let putResult: 'refused' | 'REVIVED' = 'refused';
    try {
      const cp = emptyCheckpoint();
      cp.id = uuid6(Date.now());
      cp.channel_values = { revive: true };
      cp.channel_versions = { revive: 1 };
      await withCheckpointAccess(access, () =>
        saver.put(cfg, cp, { source: 'input', step: -1, parents: {} }, { revive: 1 }));
      const afterPut = await ckptCounts(iv);
      if (afterPut.checkpoints > 0 || afterPut.blobs > 0 || afterPut.writes > 0) {
        putResult = 'REVIVED';
      }
    } catch {
      putResult = 'refused';
    }
    const stillZero = await ckptCounts(iv);
    const reviveOk = (getTupleResult === 'empty' || getTupleResult === 'threw')
      && putResult === 'refused'
      && allZero(stillZero);
    if (putResult === 'REVIVED') {
      A(id, false, `PRODUCT_GAP saver REVIVED thread counts=${JSON.stringify(stillZero)}`);
      console.error('C-REVIVE PRODUCT_GAP: real PostgresSaver.put succeeded after purge and rows returned');
      failures++;
      console.log(JSON.stringify({ line: 'B', revive: 'REVIVED', gitSha, stop: true }));
      process.exit(1);
    }
    A(id,
      allZero(after) && reviveOk
      && result.requestStatus === 'pending_external'
      && !bannedTerminal(result.requestStatus),
      `counts=${JSON.stringify(after)} getTuple=${getTupleResult} put=${putResult} req=${result.requestStatus}`);
  }

  /* ── NHP-052-CKPT-FAULT-03: idempotent re-purge ── */
  {
    const id = 'NHP-052-CKPT-FAULT-03';
    const iv = randomUUID();
    await prepareSubject(saver, owner, iv, `fault03-${iv.slice(0, 8)}`);
    const first = await erase({ threadId: iv, keyHash: nextHash(), epoch: 5 });
    const receiptsBefore = await admin.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM privacy_deletion_receipt
        WHERE request_id=$1::uuid AND target_id=$2::uuid AND receipt_kind='local_erased'`,
      [first.requestId, first.checkpointTargetId]);
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
    await prepareSubject(saver, owner, iv, `neg01-${iv.slice(0, 8)}`);
    const before = await ckptCounts(iv);
    const beginRejected = await rejects(() => asPrincipal(admin, owner, (c) =>
      beginCheckpointErasure(c, iv, nextHash())));
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
    const begun = await asPrivacyApiOwner(owner, (c) => beginCheckpointErasure(c, iv, nextHash()));
    await sealCheckpointErasureAuthz(admin, begun.requestId, 7);
    const bypassPurgeRejected = await rejects(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      purgeCheckpointErasureTarget(c, begun.checkpointTargetId, randomUUID())));
    const badKey = generatePrivacyAuthzKeyPair('uc052-ckpt-forged');
    const targets = await loadRequestTargets(admin, begun.requestId);
    const digest = canonicalTargetSetDigest(targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
    const forged = signPrivacyAuthorizationSnapshot({
      privateKeyPem: badKey.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 7,
      targets: targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })),
      nowSec: NOW_SEC, ttlSec: 600,
    });
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
      && allPositive(before)
      && after.checkpoints === before.checkpoints
      && after.blobs === before.blobs
      && after.writes === before.writes
      && grant.rows[0]?.has === false,
      `beginRej=${beginRejected} forgedRej=${forgedRejected} bypassRej=${bypassPurgeRejected} jws=${verified === null} grant=${grant.rows[0]?.has}`);
  }

  /* ── NHP-052-CKPT-NEG-02: cross-tenant · B seeded via real saver · counts unchanged ── */
  {
    const id = 'NHP-052-CKPT-NEG-02';
    const ivA = randomUUID();
    const ivB = randomUUID();
    await prepareSubject(saver, owner, ivA, `neg02a-${ivA.slice(0, 8)}`);
    await prepareSubject(saver, otherOwner, ivB, `neg02b-${ivB.slice(0, 8)}`);
    const beforeB = await ckptCounts(ivB);
    const begunB = await asPrivacyApiOwner(otherOwner, (c) => beginCheckpointErasure(c, ivB, nextHash()));
    await sealCheckpointErasureAuthz(admin, begunB.requestId, 8);
    const crossClaimRejected = await rejects(async () => {
      await asPrivacyWorkerPrincipal(admin, owner, (c) =>
        claimCheckpointErasureTarget(c, begunB.checkpointTargetId, worker, 60));
    });
    await erase({ threadId: ivA, keyHash: nextHash(), epoch: 8 });
    const afterB = await ckptCounts(ivB);
    A(id,
      crossClaimRejected
      && allPositive(beforeB)
      && beforeB.checkpoints === afterB.checkpoints
      && beforeB.blobs === afterB.blobs
      && beforeB.writes === afterB.writes,
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
    await prepareSubject(saver, owner, iv, `bound01-${iv.slice(0, 8)}`);
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
      return { a, b };
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
    const ckpt = result.targets.find((t) => String(t.sink) === 'checkpoint_rows');
    A(id,
      before.checkpoints === 0 && before.blobs === 0 && before.writes === 0
      && allZero(after)
      && ckpt?.status === 'erased'
      && result.deletedCount === 0
      && result.requestStatus === 'pending_external'
      && !bannedTerminal(result.requestStatus),
      `deleted=${result.deletedCount} status=${ckpt?.status} req=${result.requestStatus}`);
  }

  /* ── NHP-052-CKPT-RACE: real saver.put/putWrites mid-purge (FOR UPDATE barrier) ── */
  {
    const id = 'NHP-052-CKPT-RACE';
    const iv = randomUUID();
    const marker = `race-${iv.slice(0, 8)}`;
    const { access } = await prepareSubject(saver, owner, iv, marker);
    const before = await ckptCounts(iv);
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

    // Deterministic interleaving: HOLD locks all three physical tables FOR UPDATE so
    // privacy_purge_checkpoint_target's DELETEs block. While purge is waiting, run
    // real saver.put + putWrites. Then COMMIT hold → purge proceeds.
    // interleaveForce=row-FOR-UPDATE-barrier-on-checkpoints+blobs+writes
    const hold = await admin.connect();
    let racePut: 'refused' | 'ok' | 'REVIVED' = 'refused';
    let purgeStatus: string = 'pending';
    try {
      await hold.query('BEGIN');
      await hold.query('SELECT 1 FROM checkpoints WHERE thread_id=$1 FOR UPDATE', [iv]);
      await hold.query('SELECT 1 FROM checkpoint_blobs WHERE thread_id=$1 FOR UPDATE', [iv]);
      await hold.query('SELECT 1 FROM checkpoint_writes WHERE thread_id=$1 FOR UPDATE', [iv]);

      const purgeP = asPrivacyWorkerPrincipal(admin, owner, (c) =>
        purgeCheckpointErasureTarget(c, begun.checkpointTargetId, claimed!.leaseToken));
      // Give purge time to enter and block on our row locks.
      await sleep(80);

      const cfg = { configurable: { thread_id: iv, checkpoint_ns: '' } };
      try {
        const cp = emptyCheckpoint();
        cp.id = uuid6(Date.now());
        cp.channel_values = { race_mid: marker };
        cp.channel_versions = { race_mid: 1 };
        await withCheckpointAccess(access, () =>
          saver.put(cfg, cp, { source: 'loop', step: 0, parents: {} }, { race_mid: 1 }));
        await withCheckpointAccess(access, () =>
          saver.putWrites(
            { configurable: { thread_id: iv, checkpoint_ns: '', checkpoint_id: cp.id } },
            [['race_mid', marker]],
            `race-task-${marker.slice(0, 8)}`,
          ));
        racePut = 'ok';
      } catch {
        racePut = 'refused';
      }

      await hold.query('COMMIT');
      const purged = await purgeP;
      purgeStatus = 'fulfilled';
      void purged;
    } catch (e) {
      await hold.query('ROLLBACK').catch(() => undefined);
      purgeStatus = 'failed';
      throw e;
    } finally {
      hold.release();
    }

    const after = await ckptCounts(iv);
    // Post-purge real saver revive check
    let postGet: 'empty' | 'present' | 'threw' = 'empty';
    try {
      const tup = await withCheckpointAccess(access, () =>
        saver.getTuple({ configurable: { thread_id: iv, checkpoint_ns: '' } }));
      postGet = tup === undefined ? 'empty' : 'present';
    } catch { postGet = 'threw'; }
    let postPut: 'refused' | 'REVIVED' = 'refused';
    try {
      const cp = emptyCheckpoint();
      cp.id = uuid6(Date.now());
      cp.channel_values = { post: 1 };
      cp.channel_versions = { post: 1 };
      await withCheckpointAccess(access, () =>
        saver.put({ configurable: { thread_id: iv, checkpoint_ns: '' } }, cp,
          { source: 'input', step: -1, parents: {} }, { post: 1 }));
      const c2 = await ckptCounts(iv);
      if (!allZero(c2)) postPut = 'REVIVED';
    } catch { postPut = 'refused'; }

    if (postPut === 'REVIVED' || (racePut === 'ok' && !allZero(after))) {
      console.error(`C-RACE PRODUCT_GAP racePut=${racePut} postPut=${postPut} after=${JSON.stringify(after)}`);
      A(id, false, `REVIVED racePut=${racePut} postPut=${postPut}`);
      process.exit(1);
    }

    const ckpt = (await loadRequestTargets(admin, begun.requestId)).find((t) => String(t.sink) === 'checkpoint_rows');
    const req = await loadRequestStatus(admin, begun.requestId);
    A(id,
      allPositive(before)
      && purgeStatus === 'fulfilled'
      && allZero(after)
      && (postGet === 'empty' || postGet === 'threw')
      && postPut === 'refused'
      && ckpt?.status === 'erased'
      && req === 'pending_external'
      && !bannedTerminal(req),
      `interleave=FOR_UPDATE_barrier racePut=${racePut} postGet=${postGet} postPut=${postPut} counts=${JSON.stringify(after)}`);
  }

  /* ── NHP-052-CKPT-RACE-TRIGGER: extra fence-trigger INSERT race (retained) ── */
  {
    const id = 'NHP-052-CKPT-RACE-TRIGGER';
    const iv = randomUUID();
    const marker = `trig-${iv.slice(0, 8)}`;
    const { access, fenceEpoch } = await prepareSubject(saver, owner, iv, marker);
    const begun = await asPrivacyApiOwner(owner, (c) => beginCheckpointErasure(c, iv, nextHash()));
    const sealed = await sealCheckpointErasureAuthz(admin, begun.requestId, 13);
    const signed = signPrivacyAuthorizationSnapshot({
      privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 13,
      targets: sealed.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })),
      nowSec: NOW_SEC, ttlSec: 600,
    });
    await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: signed.jti, keyId: keys.kid, actor: owner, interviewId: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 13, targetSetDigest: signed.targetSetDigest,
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
    const ckpt = (await loadRequestTargets(admin, begun.requestId)).find((t) => String(t.sink) === 'checkpoint_rows');
    const req = await loadRequestStatus(admin, begun.requestId);
    void access;
    A(id,
      settled[0]?.status === 'fulfilled' && allZero(after) && ckpt?.status === 'erased'
      && req === 'pending_external' && !bannedTerminal(req),
      `purge=${settled[0]?.status} write=${settled[1]?.status} counts=${JSON.stringify(after)}`);
  }

  /* ── C-DIGEST-JWS: Disclosure 2 — sealed digest ≡ JWS signed digest · full target set ── */
  {
    const id = 'C-DIGEST-JWS';
    const iv = randomUUID();
    await prepareSubject(saver, owner, iv, `digest-${iv.slice(0, 8)}`);
    const begun = await asPrivacyApiOwner(owner, (c) => beginCheckpointErasure(c, iv, nextHash()));
    // Before seal: epoch/digest must be NULL (begin does not set them — 0096 L147–218)
    const pre = await admin.query<{ privacy_epoch: string | null; target_set_digest: string | null }>(
      `SELECT privacy_epoch::text, target_set_digest FROM privacy_erasure_request WHERE id=$1::uuid`,
      [begun.requestId],
    );
    const sealed = await sealCheckpointErasureAuthz(admin, begun.requestId, 14);
    const live = canonicalTargetSetDigest(
      sealed.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })),
    );
    const signed = signPrivacyAuthorizationSnapshot({
      privateKeyPem: keys.privateKeyPem, kid: keys.kid, actor: owner, owner, interview: iv,
      purpose: 'interview_data_erasure', privacyEpoch: 14,
      targets: sealed.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })),
      nowSec: NOW_SEC, ttlSec: 600,
    });
    const sinkNames = sealed.targets.map((t) => String(t.sink)).sort();
    const expected = ['checkpoint_rows', 'interview_job_payload', 'langfuse', 'oss', 'redis'];
    A(id,
      pre.rows[0]?.privacy_epoch == null
      && pre.rows[0]?.target_set_digest == null
      && sealed.targetSetDigest === live
      && signed.targetSetDigest === sealed.targetSetDigest
      && expected.every((s) => sinkNames.includes(s))
      && sealed.targets.length === 5,
      `preEpochNull=${pre.rows[0]?.privacy_epoch == null} preDigNull=${pre.rows[0]?.target_set_digest == null} jwsEq=${signed.targetSetDigest === sealed.targetSetDigest} sinks=${sinkNames.join(',')}`);
  }

  /* ── HP-052-CKPT-01: happy last · three-table admin=0 · pending_external · full digest ── */
  {
    const id = 'HP-052-CKPT-01';
    const iv = randomUUID();
    const marker = `hp-${iv.slice(0, 8)}`;
    const { access } = await prepareSubject(saver, owner, iv, marker);
    const before = await ckptCounts(iv);
    const result = await erase({ threadId: iv, keyHash: nextHash(), epoch: 12 });
    const after = await ckptCounts(iv);
    const sinkNames = result.targets.map((t) => String(t.sink));
    const expectedSinks = ['checkpoint_rows', 'interview_job_payload', 'oss', 'redis', 'langfuse'];
    const fullSet = expectedSinks.every((s) => sinkNames.includes(s));
    const ckpt = result.targets.find((t) => String(t.sink) === 'checkpoint_rows');
    const externalsOk = ['oss', 'redis', 'langfuse'].every(
      (s) => result.targets.find((t) => String(t.sink) === s)?.status === 'retention_pending');
    // Post-happy real saver getTuple/put must stay empty/refused
    let getEmpty = true;
    try {
      const tup = await withCheckpointAccess(access, () =>
        saver.getTuple({ configurable: { thread_id: iv, checkpoint_ns: '' } }));
      getEmpty = tup === undefined;
    } catch { getEmpty = true; }
    const putRefused = await rejects(() => withCheckpointAccess(access, async () => {
      const cp = emptyCheckpoint();
      cp.id = uuid6(Date.now());
      cp.channel_values = { x: 1 };
      cp.channel_versions = { x: 1 };
      await saver.put({ configurable: { thread_id: iv, checkpoint_ns: '' } }, cp,
        { source: 'input', step: -1, parents: {} }, { x: 1 });
    }));
    const mig = await admin.query<{ n: string }>(`SELECT count(*)::text AS n FROM checkpoint_migrations`);
    A(id,
      allPositive(before)
      && after.checkpoints === 0 && after.blobs === 0 && after.writes === 0
      && ckpt?.status === 'erased'
      && result.deletedCount >= 1
      && result.requestStatus === 'pending_external'
      && !bannedTerminal(result.requestStatus)
      && fullSet && externalsOk
      && getEmpty && putRefused
      && result.targetSetDigest === canonicalTargetSetDigest(
        result.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })))
      && Number(mig.rows[0]?.n) >= 0,
      `before=${JSON.stringify(before)} after=${JSON.stringify(after)} deleted=${result.deletedCount} req=${result.requestStatus} getEmpty=${getEmpty} putRefused=${putRefused}`);
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
    raceInterleave: 'FOR UPDATE barrier on checkpoints+blobs+writes while privacy_purge_checkpoint_target blocked; concurrent real saver.put/putWrites; then COMMIT hold',
    disclosure2: {
      beginNoEpochDigest: '0096 L147-218',
      claimNeedsEpochDigest: '0091 L369-383',
      seal: 'packages/db/src/uc052-checkpoint-physical.ts sealCheckpointErasureAuthz',
      jwsEqSealed: 'runAuthorizedCheckpointPhysicalPurge asserts signed.targetSetDigest === sealed.targetSetDigest',
    },
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
  } finally {
    // Ban ending shared admin pool via PrincipalBoundCheckpointPool.end
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
