/**
 * PrivacyAuthorizationIssuer DB 证明（INT-TRANSCRIPT-00）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 签发器 owner 绑定（不能自报 owner / 跨 owner 签发 / 非 00 purpose fail-closed）
 *   - jti 单次 CAS 消费（重放/未知/过期 = 0；20 并发单 winner）
 *   - 受约束 claim 重验（owner/scope/subject/epoch/digest/live-digest 漂移全拒绝）
 *   - 逐 sink receipt + no-forge-completed（pending_external/failed_cleanup/未 erase 不得 completed）
 *   - app_role（API runtime）无 issue/consume 权限
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot, consumeAuthorizationSnapshotBound, claimAuthorizationTarget,
  recordDeletionReceipt, resolveDeletionReceipt, assertPrivacyAuthorizationIssuerIdentity,
  type Client,
} from '@meetwise/db';
import {
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot, PrivacyAuthzKeyRegistry, type PrivacyAuthzTarget,
} from '@meetwise/domain';

const admin = createPool();
const owner = `privacy-authz-owner-${process.pid}`;
const otherOwner = `privacy-authz-other-${process.pid}`;
const worker = `privacy-authz-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-2026-01');

const R1 = '1'.repeat(64), R2 = '2'.repeat(64), R3 = '3'.repeat(64), R4 = '4'.repeat(64);
const T = (r1 = R1, r2 = R2, r3 = R3): PrivacyAuthzTarget[] => [
  { kind: 'checkpoint_rows', resource: r1 },
  { kind: 'oss', resource: r2 },
  { kind: 'redis', resource: r3 },
];

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

// 签发器专用 principal（SET LOCAL ROLE privacy_issuer + 绑定 owner GUC）。只在测试里
// 模拟未来 issuer 服务的登录；生产由独立 provisioning + 启动门禁接线（本任务不落地）。
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

let hashCounter = 0;
const nextHash = () => (++hashCounter).toString().padStart(64, '0');

async function insertInterview(ownerId: string, interviewId: string): Promise<void> {
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, ownerId],
  );
}
async function insertRequest(
  id: string, ownerId: string, subjectId: string, scope: string, epoch: number | null, digest: string | null, status = 'fenced',
): Promise<void> {
  await admin.query(
    `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status,privacy_epoch,target_set_digest)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, ownerId, scope, subjectId, nextHash(), status, epoch, digest],
  );
}
async function insertTarget(id: string, requestId: string, sink: string, resource: string, status = 'pending'): Promise<void> {
  await admin.query(
    'INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status) VALUES ($1,$2,$3,$4,$5)',
    [id, requestId, sink, resource, status],
  );
}
// 直接写账本行（绕过 issue 校验），用于 H2 负路径：精确控制 owner/interview/purpose/epoch/
// digest/expiresAt 中任意一字段与验签 JWS 错配，从而证明 bound consume 逐字段 fail-closed。
async function insertSnapshotMismatch(
  verified: { jti: string; owner: string; interview: string; purpose: string; privacyEpoch: number; targetSetDigest: string; expiresAtMs: number },
  overrides: { ownerUserId?: string; interviewId?: string; purpose?: string; privacyEpoch?: number; targetSetDigest?: string; expiresAt?: string } = {},
): Promise<void> {
  await admin.query(
    `INSERT INTO privacy_authorization_snapshot
       (jti,issuer_id,key_id,actor,owner_user_id,interview_id,purpose,privacy_epoch,target_set_digest,status,issued_at,expires_at)
     VALUES ($1,'meetwise-privacy-authz-v1',$2,$3,$4,$5,$6,$7,$8,'issued',now(),$9)`,
    [verified.jti, KEY.kid, verified.owner,
      overrides.ownerUserId ?? verified.owner,
      overrides.interviewId ?? verified.interview,
      overrides.purpose ?? verified.purpose,
      overrides.privacyEpoch ?? verified.privacyEpoch,
      overrides.targetSetDigest ?? verified.targetSetDigest,
      overrides.expiresAt ?? new Date(verified.expiresAtMs).toISOString()],
  );
}
function signSnapshot(ownerId: string, interviewId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: interviewId,
    purpose: 'interview_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}
async function issueSigned(ownerId: string, interviewId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  const signed = signSnapshot(ownerId, interviewId, epoch, targets);
  await asIssuer(ownerId, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: ownerId, interviewId,
    purpose: 'interview_data_erasure', privacyEpoch: epoch, targetSetDigest: signed.targetSetDigest,
    expiresAt: new Date(signed.expiresAtMs),
  }));
  return signed;
}
const consume = (jti: string) => asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, jti, worker));
const claim = (ownerId: string, jti: string, targetId: string) =>
  asPrivacyWorkerPrincipal(admin, ownerId, (c) => claimAuthorizationTarget(c, jti, targetId, worker, 60));

async function main() {
  await assertIsolatedTestTarget(admin);
  // L11：catalog 门禁——issuer/guard 角色 flag 与 membership 封闭（不抛即通过）。
  await assertPrivacyAuthorizationIssuerIdentity(admin);
  A('catalog gate: privacy_issuer/privacy_guard_owner 非登录/非继承/非超管且 membership 封闭(L11)', true);

  /* ── A. 签发器 owner 绑定 ─────────────────────────────────────────────── */
  const ivA = '00000000-0000-4000-8000-0000000000a1';
  const ivOther = '00000000-0000-4000-8000-0000000000a2';
  await insertInterview(owner, ivA);
  await insertInterview(otherOwner, ivOther);

  const signedA = signSnapshot(owner, ivA, 3, T());
  const issuedA = await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signedA.jti, keyId: KEY.kid, actor: owner, interviewId: ivA,
    purpose: 'interview_data_erasure', privacyEpoch: 3, targetSetDigest: signedA.targetSetDigest,
    expiresAt: new Date(signedA.expiresAtMs),
  }));
  A('签发器写入的 owner 恒等于已认证 principal(不可自报)', issuedA.ownerUserId === owner);
  A('签发器可为自己拥有的面试签发', issuedA.snapshotId.length > 0);
  A('跨 owner 签发(principal=owner 签 otherOwner 的面试)拒绝',
    await rejects(() => asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: signSnapshot(owner, ivOther, 3, T()).jti, keyId: KEY.kid, actor: owner, interviewId: ivOther,
      purpose: 'interview_data_erasure', privacyEpoch: 3, targetSetDigest: signedA.targetSetDigest,
      expiresAt: new Date(Date.now() + 600_000),
    }))));
  A('非 00 purpose(resume_data_erasure) fail-closed',
    await rejects(() => asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: signSnapshot(owner, ivA, 3, T()).jti, keyId: KEY.kid, actor: owner, interviewId: ivA,
      purpose: 'resume_data_erasure', privacyEpoch: 3, targetSetDigest: signedA.targetSetDigest,
      expiresAt: new Date(Date.now() + 600_000),
    }))));

  // 连接两层：worker 先验签（domain），通过后才有资格 consume（db）。
  const registry = new PrivacyAuthzKeyRegistry();
  registry.activate(KEY.kid, KEY.publicJwk);
  const v = verifyPrivacyAuthorizationSnapshot({ jws: signedA.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW_SEC });
  A('worker 验签还原 owner/jti/digest(与 DB 账本对齐)', v !== null && v.owner === owner && v.jti === signedA.jti && v.targetSetDigest === signedA.targetSetDigest);

  /* ── B. jti 单次 CAS 消费 ─────────────────────────────────────────────── */
  const consumedA = await consume(signedA.jti);
  A('消费 issued jti 成功并还原 owner/epoch/digest',
    consumedA.ownerUserId === owner && consumedA.privacyEpoch === 3 && consumedA.targetSetDigest === signedA.targetSetDigest);
  A('重放同一 jti 拒绝(replay=0)', await rejects(() => consume(signedA.jti)));
  A('未知 jti 拒绝', await rejects(() => consume('00000000-0000-4000-8000-0000000000ff')));

  // 过期快照直接插账本（issue 函数拒绝签发过期），consume 必须 fail-closed。
  const expiredJti = '00000000-0000-4000-8000-0000000000e1';
  await admin.query(
    `INSERT INTO privacy_authorization_snapshot
       (jti,issuer_id,key_id,actor,owner_user_id,interview_id,purpose,privacy_epoch,target_set_digest,status,issued_at,expires_at)
     VALUES ($1,'meetwise-privacy-authz-v1',$2,$3,$4,$5,'interview_data_erasure',3,$6,'issued',now()-interval '2 hours',now()-interval '1 hour')`,
    [expiredJti, KEY.kid, owner, owner, ivA, signedA.targetSetDigest],
  );
  A('过期快照 consume 拒绝', await rejects(() => consume(expiredJti)));

  /* ── C. 20 并发单 winner（jti 原子 CAS） ──────────────────────────────── */
  const raceJti = signSnapshot(owner, ivA, 4, T()).jti;
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: raceJti, keyId: KEY.kid, actor: owner, interviewId: ivA,
    purpose: 'interview_data_erasure', privacyEpoch: 4, targetSetDigest: canonicalTargetSetDigest(T()),
    expiresAt: new Date(Date.now() + 600_000),
  }));
  const race = await Promise.all(
    Array.from({ length: 20 }, () => consume(raceJti).then(() => 'ok', () => 'rejected')),
  );
  A('20 并发 consume 仅一个 winner', race.filter((r) => r === 'ok').length === 1 && race.filter((r) => r === 'rejected').length === 19);

  /* ── D. 受约束 claim 重验 ─────────────────────────────────────────────── */
  // 基线：happy path。
  const ivD = '00000000-0000-4000-8000-0000000000d1';
  const reqD = '00000000-0000-4000-8000-0000000000d2';
  const tgtD1 = '00000000-0000-4000-8000-0000000000d3';
  const tgtD2 = '00000000-0000-4000-8000-0000000000d4';
  const tgtD3 = '00000000-0000-4000-8000-0000000000d5';
  await insertInterview(owner, ivD);
  await insertRequest(reqD, owner, ivD, 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtD1, reqD, 'checkpoint_rows', R1);
  await insertTarget(tgtD2, reqD, 'oss', R2);
  await insertTarget(tgtD3, reqD, 'redis', R3);
  const signedD = await issueSigned(owner, ivD, 3, T());
  await consume(signedD.jti);
  const claimedD = await claim(owner, signedD.jti, tgtD1);
  A('happy path: consume 后 claim 目标成功并签发租约', claimedD !== null && claimedD.leaseToken.length > 0 && claimedD.targetId === tgtD1);
  A('claim 前未 consume 拒绝(issued 而非 consumed)', await rejects(() => claim(owner, signedA.jti, tgtD1)));
  A('伪造 principal(≠ snapshot.owner) claim 拒绝', await rejects(() => claim('forged-owner', signedD.jti, tgtD2)));

  // owner 不匹配：snapshot 属于 owner，request 属于 otherOwner。
  const reqOwnerMismatch = '00000000-0000-4000-8000-0000000000d6';
  const tgtOwnerMismatch = '00000000-0000-4000-8000-0000000000d7';
  await insertRequest(reqOwnerMismatch, otherOwner, ivOther, 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtOwnerMismatch, reqOwnerMismatch, 'checkpoint_rows', R1);
  A('cross-owner claim(snapshot owner ≠ request owner)拒绝',
    await rejects(() => claim(owner, signedD.jti, tgtOwnerMismatch)));

  // epoch 不匹配。
  const reqEpoch = '00000000-0000-4000-8000-0000000000d8';
  const tgtEpoch = '00000000-0000-4000-8000-0000000000d9';
  await insertRequest(reqEpoch, owner, ivD, 'interview_data', 99, canonicalTargetSetDigest(T()));
  await insertTarget(tgtEpoch, reqEpoch, 'checkpoint_rows', R1);
  A('epoch 不匹配 claim 拒绝', await rejects(() => claim(owner, signedD.jti, tgtEpoch)));

  // digest 不匹配。
  const reqDigest = '00000000-0000-4000-8000-0000000000da';
  const tgtDigest = '00000000-0000-4000-8000-0000000000db';
  await insertRequest(reqDigest, owner, ivD, 'interview_data', 3, 'f'.repeat(64));
  await insertTarget(tgtDigest, reqDigest, 'checkpoint_rows', R1);
  A('digest 不匹配 claim 拒绝', await rejects(() => claim(owner, signedD.jti, tgtDigest)));

  // subject 不匹配。
  const reqSubject = '00000000-0000-4000-8000-0000000000dc';
  const tgtSubject = '00000000-0000-4000-8000-0000000000dd';
  await insertRequest(reqSubject, owner, 'wrong-subject', 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtSubject, reqSubject, 'checkpoint_rows', R1);
  A('subject 不匹配 claim 拒绝', await rejects(() => claim(owner, signedD.jti, tgtSubject)));

  // scope 不匹配。
  const reqScope = '00000000-0000-4000-8000-0000000000de';
  const tgtScope = '00000000-0000-4000-8000-0000000000df';
  await insertRequest(reqScope, owner, ivD, 'resume_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtScope, reqScope, 'checkpoint_rows', R1);
  A('scope 不匹配 claim 拒绝', await rejects(() => claim(owner, signedD.jti, tgtScope)));

  // 签发后增删 target（live digest 漂移）。
  const reqDrift = '00000000-0000-4000-8000-0000000000e2';
  const tgtDrift1 = '00000000-0000-4000-8000-0000000000e3';
  const tgtDrift2 = '00000000-0000-4000-8000-0000000000e4';
  const tgtDrift3 = '00000000-0000-4000-8000-0000000000e5';
  const tgtDriftExtra = '00000000-0000-4000-8000-0000000000e6';
  await insertRequest(reqDrift, owner, ivD, 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtDrift1, reqDrift, 'checkpoint_rows', R1);
  await insertTarget(tgtDrift2, reqDrift, 'oss', R2);
  await insertTarget(tgtDrift3, reqDrift, 'redis', R3);
  const signedDrift = await issueSigned(owner, ivD, 3, T());
  await consume(signedDrift.jti);
  // 签发并消费后再塞第 4 个 target → 重算 digest 漂移。
  await insertTarget(tgtDriftExtra, reqDrift, 'langfuse', R4);
  A('签发后新增 target(live digest 漂移) claim 拒绝', await rejects(() => claim(owner, signedDrift.jti, tgtDrift1)));

  /* ── E. 逐 sink receipt + no-forge-completed ──────────────────────────── */
  // receipt 写入 owner-scoped。
  const reqReceipt = '00000000-0000-4000-8000-0000000000e7';
  const tgtReceipt = '00000000-0000-4000-8000-0000000000e8';
  await insertRequest(reqReceipt, owner, ivD, 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtReceipt, reqReceipt, 'checkpoint_rows', R1);
  const receiptId = await asPrivacyWorkerPrincipal(admin, owner, (c) =>
    recordDeletionReceipt(c, tgtReceipt, 'local_erased', 'a'.repeat(64), worker));
  A('worker 为自己的 target 写 receipt 成功', receiptId.length > 0);
  A('跨 owner 写 receipt 拒绝', await rejects(() => asPrivacyWorkerPrincipal(admin, otherOwner, (c) =>
    recordDeletionReceipt(c, tgtReceipt, 'local_erased', 'a'.repeat(64), worker))));

  // 未全部 erased 不得 completed。
  const reqIncomplete = '00000000-0000-4000-8000-0000000000e9';
  const tgtIncomplete = '00000000-0000-4000-8000-0000000000ea';
  await insertRequest(reqIncomplete, owner, ivD, 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtIncomplete, reqIncomplete, 'redis', R3, 'retention_pending');
  A('有 retention_pending target 不得伪造 completed',
    await rejects(() => admin.query("UPDATE privacy_erasure_request SET status='completed' WHERE id=$1", [reqIncomplete])));

  // 有 failed_cleanup receipt 不得 completed（即使 target 全 erased）。
  const reqFailedReceipt = '00000000-0000-4000-8000-0000000000eb';
  const tgtFailedReceipt = '00000000-0000-4000-8000-0000000000ec';
  await insertRequest(reqFailedReceipt, owner, ivD, 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtFailedReceipt, reqFailedReceipt, 'checkpoint_rows', R1, 'erased');
  await admin.query(
    `INSERT INTO privacy_deletion_receipt(request_id,target_id,receipt_kind,receipt_hash,recorded_by)
     VALUES ($1,$2,'failed_cleanup',$3,$4)`,
    [reqFailedReceipt, tgtFailedReceipt, 'b'.repeat(64), worker],
  );
  A('有 failed_cleanup receipt 不得伪造 completed',
    await rejects(() => admin.query("UPDATE privacy_erasure_request SET status='completed' WHERE id=$1", [reqFailedReceipt])));

  // 全 erased + 仅 local_erased receipt → 可 completed。
  const reqOk = '00000000-0000-4000-8000-0000000000ed';
  const tgtOk = '00000000-0000-4000-8000-0000000000ee';
  await insertRequest(reqOk, owner, ivD, 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtOk, reqOk, 'checkpoint_rows', R1, 'erased');
  await admin.query(
    `INSERT INTO privacy_deletion_receipt(request_id,target_id,receipt_kind,receipt_hash,recorded_by)
     VALUES ($1,$2,'local_erased',$3,$4)`,
    [reqOk, tgtOk, 'c'.repeat(64), worker],
  );
  const completedOk = await admin.query<{ status: string }>(
    "UPDATE privacy_erasure_request SET status='completed' WHERE id=$1 RETURNING status", [reqOk]);
  A('全 erased + 无坏 receipt 可 completed', completedOk.rows[0]?.status === 'completed');

  /* ── F. app_role（API runtime）无 issue/consume 权限 ──────────────────── */
  A('app_role 无 issue 权限',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM privacy_issue_authorization_snapshot($1,$2,$3,$4,$5,$6,$7,$8)',
      ['00000000-0000-4000-8000-0000000000f1', KEY.kid, owner, ivA, 'interview_data_erasure', 3, canonicalTargetSetDigest(T()), new Date(Date.now() + 600_000).toISOString()]))));
  A('app_role 无 consume 权限',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM privacy_consume_authorization_snapshot($1,$2)', [signedA.jti, worker]))));

  /* ── G. H1 跨层：TS digest 与 SQL string_agg 逐字节相等 ───────────────── */
  const ivG = '00000000-0000-4000-8000-0000000000b1';
  const reqG = '00000000-0000-4000-8000-0000000000b2';
  const tgtG1 = '00000000-0000-4000-8000-0000000000b3';
  const tgtG2 = '00000000-0000-4000-8000-0000000000b4';
  const tgtG3 = '00000000-0000-4000-8000-0000000000b5';
  await insertInterview(owner, ivG);
  await insertRequest(reqG, owner, ivG, 'interview_data', 3, canonicalTargetSetDigest(T()));
  await insertTarget(tgtG1, reqG, 'checkpoint_rows', R1);
  await insertTarget(tgtG2, reqG, 'oss', R2);
  await insertTarget(tgtG3, reqG, 'redis', R3);
  const sqlDigest = await admin.query<{ d: string | null }>(
    "SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex') AS d FROM privacy_deletion_target d WHERE d.request_id=$1",
    [reqG],
  );
  A('H1 跨层: TS digest 与 SQL string_agg 逐字节相等', sqlDigest.rows[0]?.d === canonicalTargetSetDigest(T()));

  /* ── H. H2 跨层加密绑定（verify ↔ consume） ───────────────────────────── */
  const ivH2 = '00000000-0000-4000-8000-0000000000b6';
  await insertInterview(owner, ivH2);
  const registryH2 = new PrivacyAuthzKeyRegistry();
  registryH2.activate(KEY.kid, KEY.publicJwk);
  const signedH2 = signSnapshot(owner, ivH2, 3, T());
  // 账本写入与 JWS 不同的 digest（模拟账本被篡改/错配）。
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signedH2.jti, keyId: KEY.kid, actor: owner, interviewId: ivH2,
    purpose: 'interview_data_erasure', privacyEpoch: 3, targetSetDigest: 'f'.repeat(64),
    expiresAt: new Date(signedH2.expiresAtMs),
  }));
  const verifiedH2 = verifyPrivacyAuthorizationSnapshot({ jws: signedH2.jws, resolveJwk: registryH2.resolve.bind(registryH2), nowSec: NOW_SEC });
  A('H2 前置: 验签成功还原 digest', verifiedH2 !== null && verifiedH2.targetSetDigest === signedH2.targetSetDigest);
  if (verifiedH2) {
    A('H2: 账本 target_set_digest 与验签 JWS 不一致 → 消费后强制拒绝',
      await rejects(() => asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, verifiedH2, worker))));
  }
  const signedH2ok = await issueSigned(owner, ivH2, 4, T());
  const verifiedH2ok = verifyPrivacyAuthorizationSnapshot({ jws: signedH2ok.jws, resolveJwk: registryH2.resolve.bind(registryH2), nowSec: NOW_SEC });
  if (verifiedH2ok) {
    const boundOk = await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, verifiedH2ok, worker));
    A('H2: 账本与验签一致 → bound consume 成功', boundOk.privacyEpoch === 4 && boundOk.targetSetDigest === signedH2ok.targetSetDigest);
  }

  // H2 补全：owner/interview/purpose/epoch/expiresAt 各自错配 → bound consume 强制拒绝
  //（修复前只比 epoch/digest/expiresAt，owner/interview/purpose 错配会漏过）。每个用例用
  // 全新 jti，避免前一用例 consume 已把 jti 烧掉导致“already consumed”而非 mismatch。
  const bindVerify = (s: { jws: string }) =>
    verifyPrivacyAuthorizationSnapshot({ jws: s.jws, resolveJwk: registryH2.resolve.bind(registryH2), nowSec: NOW_SEC });
  const boundRejects = async (overrides: (s: ReturnType<typeof signSnapshot>) => Parameters<typeof insertSnapshotMismatch>[1]) => {
    const s = signSnapshot(owner, ivH2, 3, T());
    const v = bindVerify(s);
    if (!v) return false;
    await insertSnapshotMismatch(v, overrides(s));
    return rejects(() => asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, v, worker)));
  };
  A('H2: owner 错配 → bound consume 拒绝', await boundRejects(() => ({ ownerUserId: 'forged-owner' })));
  A('H2: interview 错配 → bound consume 拒绝', await boundRejects(() => ({ interviewId: '00000000-0000-4000-8000-0000000000c0' })));
  A('H2: purpose 错配 → bound consume 拒绝', await boundRejects(() => ({ purpose: 'resume_data_erasure' })));
  A('H2: epoch 错配 → bound consume 拒绝', await boundRejects(() => ({ privacyEpoch: 99 })));
  A('H2: expiresAt 错配 → bound consume 拒绝', await boundRejects((s) => ({ expiresAt: new Date(s.expiresAtMs + 1000).toISOString() })));

  // M6(b)：SQL 侧 issuer_id 第三份拷贝 pin——账本 issuer_id 漂移 → consume 拒绝（fail-closed）。
  const signedIss = signSnapshot(owner, ivH2, 3, T());
  const verifiedIss = bindVerify(signedIss);
  if (verifiedIss) {
    await insertSnapshotMismatch(verifiedIss, {});
    await admin.query("UPDATE privacy_authorization_snapshot SET issuer_id='meetwise-privacy-authz-v2' WHERE jti=$1", [signedIss.jti]);
    A('M6(b): 账本 issuer_id 漂移 → consume 拒绝',
      await rejects(() => asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshotBound(c, verifiedIss, worker))));
  }

  /* ── I. F1 解死锁：external_pending 收据不再回滚本地删除，resolve 可推进 completed ── */
  const ivF1 = '00000000-0000-4000-8000-0000000000b7';
  const reqF1 = '00000000-0000-4000-8000-0000000000b8';
  const tgtLocal = '00000000-0000-4000-8000-0000000000b9';
  const tgtExt = '00000000-0000-4000-8000-0000000000ba';
  const leaseToken = '00000000-0000-4000-8000-0000000000bb';
  const threadF1 = `privacy-f1-thread-${process.pid}`;
  await insertInterview(owner, ivF1);
  await insertRequest(reqF1, owner, ivF1, 'interview_data', 3, canonicalTargetSetDigest(T()), 'fenced');
  await insertTarget(tgtLocal, reqF1, 'checkpoint_rows', R1);
  await insertTarget(tgtExt, reqF1, 'oss', R2, 'erased');
  await admin.query(
    "INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch) VALUES ($1,$2,$3,$4,NULL)",
    [tgtLocal, reqF1, owner, threadF1],
  );
  await admin.query(
    "INSERT INTO privacy_deletion_receipt(request_id,target_id,receipt_kind,receipt_hash,recorded_by) VALUES ($1,$2,'external_pending',$3,$4)",
    [reqF1, tgtExt, 'e'.repeat(64), worker],
  );
  await admin.query(
    "UPDATE privacy_deletion_target SET status='leased',lease_owner=$3,lease_token=$4,lease_expires_at=now()+interval '60 seconds' WHERE id=$1 AND request_id=$2",
    [tgtLocal, reqF1, worker, leaseToken],
  );
  const f1Purged = await asPrivacyWorkerPrincipal(admin, owner, (c) =>
    c.query<{ status: string; request_status: string }>("SELECT * FROM privacy_purge_checkpoint_target($1,$2)", [tgtLocal, leaseToken]));
  A('F1: 带 external_pending 收据 purge 落 pending_external、不回滚本地删除',
    f1Purged.rows[0]?.status === 'erased' && f1Purged.rows[0]?.request_status === 'pending_external');
  const f1Target = await admin.query<{ status: string }>('SELECT status FROM privacy_deletion_target WHERE id=$1', [tgtLocal]);
  A('F1: 本地 target 已 erased(未因 guard 回滚)', f1Target.rows[0]?.status === 'erased');
  const f1Resolved = await asPrivacyWorkerPrincipal(admin, owner, (c) => resolveDeletionReceipt(c, tgtExt, worker));
  A('F1: resolve external_pending→external_confirmed 并推进 completed',
    f1Resolved.receiptKind === 'external_confirmed' && f1Resolved.requestStatus === 'completed');

  /* ── J. M1 单向状态 / M2+M3 guard ─────────────────────────────────────── */
  const ivM1 = '00000000-0000-4000-8000-0000000000bc';
  await insertInterview(owner, ivM1);
  const signedM1 = await issueSigned(owner, ivM1, 5, T());
  await consume(signedM1.jti);
  A('M1: consumed→issued 回滚重放被单向 guard 拒绝',
    await rejects(() => admin.query("UPDATE privacy_authorization_snapshot SET status='issued' WHERE jti=$1", [signedM1.jti])));
  const reqM2 = '00000000-0000-4000-8000-0000000000bd';
  A('M2/M3: 直插 status=completed(零 target)被 guard 拒绝',
    await rejects(() => admin.query(
      "INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status) VALUES ($1,$2,'interview_data',$3,$4,'completed')",
      [reqM2, owner, 'iv-m2-subject', '6'.repeat(64)],
    )));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ PrivacyAuthorizationIssuer DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });
