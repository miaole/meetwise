/**
 * 记忆治理（MEM-00）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 契约先行：MemoryFactWrite zod schema 校验 + assertMemoryFactContentSafe PII 护栏（双校验）
 *   - 事实准入状态机：无同意不采集(fail-closed) / data fence(digest 二次重验) / 幂等重放
 *   - 单值 active CAS：同 (owner,purpose,fact_key) 且 multi_value=false 至多一条 active（部分唯一索引 + NOT EXISTS 双承重）
 *   - 撤回同意 fence：revoke 使 epoch+1 并 fence 同 purpose active fact；re-grant 不复活旧 fact
 *   - 两阶段召回：第一阶段 DB 硬过滤(expired/revoked 不进候选) + 第二阶段 hydrate 重验(digest 篡改不吐内容)
 *   - generation / context_snapshot 显式状态机
 *   - memory_audit_event append-only 有序(seq 1..N) + 跨 owner 同名 stream 不撞 seq
 *   - 账户级删除**复用冻结 PrivacyAuthorizationIssuer**：issue/consume/claim/purge 全链 + 跨域 sink fail-closed
 *   - app_role 无原始表读 / 无 issue 权限；getMemoriesByRefIds owner 硬过滤修复
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  recordMemoryFact, grantMemoryConsent, revokeMemoryConsent, confirmMemoryFact, revokeMemoryFact,
  recallMemoryCandidates, hydrateMemoryFacts, startMemoryGeneration, activateMemoryGeneration, retireMemoryGeneration,
  issueMemoryContextSnapshot, consumeMemoryContextSnapshot, voidMemoryContextSnapshot,
  beginMemoryAccountErasure, claimMemoryTarget, purgeMemoryTarget, getMemoriesByRefIds, episodeSeen,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot, type Client,
} from '@meetwise/db';
import {
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  verifyPrivacyAuthorizationSnapshot, PrivacyAuthzKeyRegistry, memoryContentDigest, assertMemoryFactContentSafe,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';
import { MemoryFactWrite } from '@meetwise/contracts';

const admin = createPool();
const owner = `mem-owner-${process.pid}`;
const otherOwner = `mem-other-${process.pid}`;
const worker = `mem-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-2026-01');

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
const throwsSync = (fn: () => unknown) => { try { fn(); return false; } catch { return true; } };

// 签发器专用 principal（SET LOCAL ROLE privacy_issuer + 绑定 owner GUC）。与 INT 证明同源，
// 模拟未来 issuer 服务登录；生产由独立 provisioning + 启动门禁接线（本任务不落地）。
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

async function insertAccount(ownerId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [ownerId, `${ownerId}@mem.test`, 'scrypt$salt$dk'],
  );
}

/** 默认事实写入（派生摘要、无 PII）。policyVersion/multiValue 必填（契约 output 形状）。 */
function factWrite(overrides: Partial<MemoryFactWrite> = {}): MemoryFactWrite {
  return {
    factKey: 'distributed-lock',
    content: '分布式锁掌握较弱，需强化锁粒度与租约续期',
    kind: 'weakness',
    purpose: 'interview_prep',
    allowedDataClass: 'dimension_label',
    sourceType: 'model_summary',
    policyVersion: 'memory-policy-v1',
    multiValue: false,
    ...overrides,
  };
}

const grant = (userId: string, purpose: MemoryFactWrite['purpose'], policyVersion = 'memory-policy-v1') =>
  asPrincipal(admin, userId, (c) => grantMemoryConsent(c, purpose, policyVersion));
const revoke = (userId: string, purpose: MemoryFactWrite['purpose']) =>
  asPrincipal(admin, userId, (c) => revokeMemoryConsent(c, purpose));
const record = (userId: string, w: MemoryFactWrite, digest = memoryContentDigest(w.content)) =>
  asPrincipal(admin, userId, (c) => recordMemoryFact(c, w, digest));
const confirm = (userId: string, id: string) => asPrincipal(admin, userId, (c) => confirmMemoryFact(c, id));
const recall = (userId: string, purpose?: MemoryFactWrite['purpose']) =>
  asPrincipal(admin, userId, (c) => recallMemoryCandidates(c, purpose));
const hydrate = (userId: string, ids: string[]) => asPrincipal(admin, userId, (c) => hydrateMemoryFacts(c, ids));

function signAccountSnapshot(ownerId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: ownerId,
    purpose: 'account_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);

  /* ── A. 契约先行 + 双校验 + 无同意不采集 + data fence + 幂等 ─────────────── */
  const w1 = factWrite({ idempotencyKey: 'idem-a' });
  A('契约: MemoryFactWrite.parse 通过(字段形状冻结)', MemoryFactWrite.parse(w1).factKey === w1.factKey);
  A('契约: 非法 kind 被 schema 拒绝', !MemoryFactWrite.safeParse({ ...w1, kind: 'bogus' }).success);
  A('双校验②: PII 内容被 assertMemoryFactContentSafe 拒绝(fail-closed)',
    throwsSync(() => assertMemoryFactContentSafe('联系手机 13800138000')));
  A('双校验②: 合法派生摘要通过护栏', throwsSync(() => assertMemoryFactContentSafe(w1.content)) === false);
  A('无同意不采集: 未 grant 的 purpose 拒绝', await rejects(() => record(owner, w1)));

  const consentA = await grant(owner, 'interview_prep');
  A('grant consent 返回 granted/revision=1/epoch=1',
    consentA.status === 'granted' && consentA.consentRevision === 1 && consentA.privacyEpoch === 1);
  const consentA2 = await grant(owner, 'interview_prep');
  A('重复 grant 幂等(同 id, revision 不增)',
    consentA2.purpose === 'interview_prep' && consentA2.consentRevision === 1);

  const r1 = await record(owner, w1);
  A('record fact 落 candidate(created=true)', r1.status === 'candidate' && r1.created === true);
  const fact1Id = r1.id;
  A('data fence: 篡改 digest 的 record 拒绝',
    await rejects(() => record(owner, w1, 'f'.repeat(64))));
  const r1replay = await record(owner, w1);
  A('幂等重放: 同 idempotency_key 返回既有行(created=false)',
    r1replay.created === false && r1replay.id === fact1Id);

  /* ── B. confirm + 单值 active CAS + 多值 ─────────────────────────────────── */
  const c1 = await confirm(owner, fact1Id);
  A('confirm: candidate→active', c1 !== null && c1.status === 'active');
  A('confirm 已 active 返回空(单向)', (await confirm(owner, fact1Id)) === null);
  const recalledA = await recall(owner, 'interview_prep');
  A('两阶段召回①: active fact 进入候选 ID 集', recalledA.length === 1 && recalledA[0] === fact1Id);
  // M2：非 owner 召回/水合必须 0 行——owner 的 fact id 传给 otherOwner 也不吐（owner 硬过滤防串户）。
  A('非 owner recall=0: otherOwner 召回 interview_prep 不串 owner 的 fact',
    (await recall(otherOwner, 'interview_prep')).length === 0);
  A('非 owner hydrate=0: otherOwner 拿 owner 的 fact id 水合返回空',
    (await hydrate(otherOwner, [fact1Id])).length === 0);

  // 单值 active：同 (purpose,fact_key) 且 multi_value=false 的第二条 confirm 必须落败。
  const w2 = factWrite({ idempotencyKey: 'idem-b', content: '分布式锁概念熟悉，但实战细节待巩固' });
  const r2 = await record(owner, w2);
  const c2 = await confirm(owner, r2.id);
  A('单值 active CAS: 同 key 第二条 multi_value=false confirm 落败',
    r2.status === 'candidate' && c2 === null);
  // 多值 fact 不受单值唯一约束。
  const w3 = factWrite({ idempotencyKey: 'idem-c', multiValue: true, content: '分布式锁的两种实现各有利弊' });
  const r3 = await record(owner, w3);
  const c3 = await confirm(owner, r3.id);
  A('多值 fact: 同 key multi_value=true 可再 active', c3 !== null && c3.status === 'active');
  // 单条事实撤回（active→fenced，不 bump 全局 epoch）。
  const rf = await asPrincipal(admin, owner, (c) => revokeMemoryFact(c, fact1Id));
  A('revoke_fact: active→fenced(单条级别, 不 bump epoch)', rf !== null && rf.status === 'fenced');
  const recalledB = await recall(owner, 'interview_prep');
  A('撤回后 recall 不含该 fact(仅剩多值 fact3)', recalledB.length === 1 && recalledB[0] === r3.id);

  /* ── C. 撤回同意 fence + re-grant 不复活旧 fact ──────────────────────────── */
  await grant(owner, 'career');
  const wC1 = factWrite({ idempotencyKey: 'idem-c1', factKey: 'career-goal', kind: 'fact', purpose: 'career', content: '长期目标是成为分布式系统方向的面试官' });
  const rC1 = await record(owner, wC1);
  await confirm(owner, rC1.id);
  A('career fact active 且召回', (await recall(owner, 'career')).length === 1);
  const epochAfterRevoke = await revoke(owner, 'career');
  A('revoke consent 返回 epoch+1(单调 fence)', epochAfterRevoke === 2);
  A('revoke 后 recall 立即归零(异步窗口内停止召回)', (await recall(owner, 'career')).length === 0);
  const consentC2 = await grant(owner, 'career');
  A('re-grant 使 consent_revision+1(epoch 不重置)',
    consentC2.consentRevision === 2 && consentC2.privacyEpoch === 2);
  const wC2 = factWrite({ idempotencyKey: 'idem-c2', factKey: 'career-goal-2', kind: 'fact', purpose: 'career', content: '短期目标是补齐数据库索引实践' });
  const rC2 = await record(owner, wC2);
  await confirm(owner, rC2.id);
  const recalledC = await recall(owner, 'career');
  A('re-grant 后只召回新 fact(旧 fact revision 落后不复活)', recalledC.length === 1 && recalledC[0] === rC2.id);

  /* ── D. 两阶段召回硬过滤 + hydrate 重验 ──────────────────────────────────── */
  await grant(owner, 'preference');
  const wD1 = factWrite({ idempotencyKey: 'idem-d1', factKey: 'pref-lang', kind: 'preference', purpose: 'preference', content: '偏好中文讲解' });
  const rD1 = await record(owner, wD1);
  await confirm(owner, rD1.id);
  A('preference fact active 召回', (await recall(owner, 'preference')).length === 1);
  await admin.query("UPDATE memory_fact SET expires_at=now()-interval '1 hour' WHERE id=$1", [rD1.id]);
  A('硬过滤: 已过期 fact 不进候选', (await recall(owner, 'preference')).length === 0);

  const wD2 = factWrite({ idempotencyKey: 'idem-d2', factKey: 'pref-comm', kind: 'preference', purpose: 'preference', content: '偏好先看整体再抠细节' });
  const rD2 = await record(owner, wD2);
  await confirm(owner, rD2.id);
  const hydD2 = await hydrate(owner, [rD2.id]);
  A('hydrate 重验通过才吐内容(digest 一致)',
    hydD2.length === 1 && hydD2[0]!.id === rD2.id && hydD2[0]!.content === wD2.content);
  await admin.query('UPDATE memory_fact SET content=$1 WHERE id=$2', ['内容被篡改', rD2.id]);
  A('hydrate 重验: content 被篡改(digest 不一致)不吐内容', (await hydrate(owner, [rD2.id])).length === 0);

  /* ── E. generation 显式状态机(单 active CAS) ────────────────────────────── */
  const g1 = await asPrincipal(admin, owner, (c) => startMemoryGeneration(c, 'gen-v1'));
  A('start generation → building', g1.status === 'building');
  const g1a = await asPrincipal(admin, owner, (c) => activateMemoryGeneration(c, g1.id));
  A('activate → active', g1a !== null && g1a.status === 'active');
  const g2 = await asPrincipal(admin, owner, (c) => startMemoryGeneration(c, 'gen-v2'));
  const g2a = await asPrincipal(admin, owner, (c) => activateMemoryGeneration(c, g2.id));
  A('激活新 generation 退役旧 active(单 active CAS)', g2a !== null && g2a.status === 'active');
  const g1status = await admin.query<{ status: string }>('SELECT status FROM memory_index_generation WHERE id=$1', [g1.id]);
  A('旧 generation 被降为 deprecated', g1status.rows[0]?.status === 'deprecated');
  const g2r = await asPrincipal(admin, owner, (c) => retireMemoryGeneration(c, g2.id));
  A('retire → retired', g2r !== null && g2r.status === 'retired');

  /* ── F. context_snapshot 状态机 ──────────────────────────────────────────── */
  const issueSnap = (digest: string) => asPrincipal(admin, owner, (c) =>
    issueMemoryContextSnapshot(c, 'preference', digest, { summary: '上下文摘要' }));
  A('snapshot: 非法 digest(非 64-hex)拒绝', await rejects(() => issueSnap('not-hex')));
  const s1 = await issueSnap('1'.repeat(64));
  A('issue snapshot → issued', s1.status === 'issued');
  const s1c = await asPrincipal(admin, owner, (c) => consumeMemoryContextSnapshot(c, s1.id));
  A('consume: issued→consumed(单次)', s1c !== null && s1c.status === 'consumed');
  A('重复 consume 返回空(单向)', (await asPrincipal(admin, owner, (c) => consumeMemoryContextSnapshot(c, s1.id))) === null);
  const s2 = await issueSnap('2'.repeat(64));
  const s2v = await asPrincipal(admin, owner, (c) => voidMemoryContextSnapshot(c, s2.id));
  A('void: issued→voided', s2v !== null && s2v.status === 'voided');

  /* ── G. append-only 有序审计 + 跨 owner 不撞 seq ─────────────────────────── */
  const factStream = `memfact:${fact1Id}`;
  const factEvents = await admin.query<{ seq: string; kind: string }>(
    'SELECT seq, kind FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key=$2 ORDER BY seq',
    [owner, factStream],
  );
  A('审计事件 append-only 有序(record→confirm→revoke seq 1..3)',
    factEvents.rows.length === 3
    && factEvents.rows.map((x) => Number(x.seq)).join(',') === '1,2,3'
    && factEvents.rows.map((x) => x.kind).join(',') === 'record,confirm,revoke');
  await grant(otherOwner, 'career');
  await revoke(otherOwner, 'career');
  const ownerSeq = await admin.query<{ seq: string }>(
    'SELECT seq FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key=$2 ORDER BY seq', [owner, 'memconsent:career']);
  const otherSeq = await admin.query<{ seq: string }>(
    'SELECT seq FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key=$2 ORDER BY seq', [otherOwner, 'memconsent:career']);
  A('跨 owner 同名 stream 各自独立 seq(均从 1 起, 不互撞)',
    ownerSeq.rows.length === 1 && Number(ownerSeq.rows[0]!.seq) === 1
    && otherSeq.rows.length === 1 && Number(otherSeq.rows[0]!.seq) === 1);

  /* ── H. 账户级删除：复用冻结 issuer + MEM claim/purge ────────────────────── */
  const HASH_A = 'a'.repeat(64);
  A('begin erasure: 非 64-hex idempotency_key_hash 拒绝',
    await rejects(() => asPrincipal(admin, owner, (c) => beginMemoryAccountErasure(c, 'short-hash'))));
  const begun = await asPrincipal(admin, owner, (c) => beginMemoryAccountErasure(c, HASH_A));
  A('begin erasure: 落 fenced request + 3 个可解析 MEM target',
    begun.requestStatus === 'fenced' && begun.targets.length === 3
    && begun.targets.map((t) => t.sink).sort().join(',') === 'memory_context_snapshot,memory_embedding,memory_fact');
  const targets: PrivacyAuthzTarget[] = begun.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  A('H1 跨层: SQL target_set_digest 与 TS canonicalTargetSetDigest 逐字节相等',
    begun.targetSetDigest === canonicalTargetSetDigest(targets));
  A('begin erasure 同步 fence: 全部 active fact 立即停止召回',
    (await recall(owner)).length === 0);
  const consentsAfter = await admin.query<{ status: string }>(
    'SELECT status FROM memory_consent WHERE owner_user_id=$1', [owner]);
  A('begin erasure 撤回全部 granted consent',
    consentsAfter.rows.length > 0 && consentsAfter.rows.every((x) => x.status === 'revoked'));
  const begunReplay = await asPrincipal(admin, owner, (c) => beginMemoryAccountErasure(c, HASH_A));
  A('begin erasure 幂等: 同 hash 重放返回同一 request(replayed=true)',
    begunReplay.requestId === begun.requestId && begunReplay.replayed === true);

  // 复用冻结 issuer：签 account_data_erasure 快照并落到冻结 issue 函数。
  const signed = signAccountSnapshot(owner, begun.privacyEpoch, targets);
  const issued = await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: owner, interviewId: owner,
    purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch, targetSetDigest: signed.targetSetDigest,
    expiresAt: new Date(signed.expiresAtMs),
  }));
  A('issuer(account): owner 恒等于已认证 principal(不可自报)', issued.ownerUserId === owner);
  A('issuer(account): 跨 owner 签发他人账户删除拒绝',
    await rejects(() => asIssuer(otherOwner, (c) => issueAuthorizationSnapshot(c, {
      jti: signed.jti, keyId: KEY.kid, actor: otherOwner, interviewId: owner,
      purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch, targetSetDigest: signed.targetSetDigest,
      expiresAt: new Date(signed.expiresAtMs),
    }))));
  A('issuer: 非 account/interview 目的(resume_data_erasure)仍 fail-closed',
    await rejects(() => asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
      jti: signed.jti, keyId: KEY.kid, actor: owner, interviewId: owner,
      purpose: 'resume_data_erasure', privacyEpoch: begun.privacyEpoch, targetSetDigest: signed.targetSetDigest,
      expiresAt: new Date(signed.expiresAtMs),
    }))));

  const registry = new PrivacyAuthzKeyRegistry();
  registry.activate(KEY.kid, KEY.publicJwk);
  const verified = verifyPrivacyAuthorizationSnapshot({ jws: signed.jws, resolveJwk: registry.resolve.bind(registry), nowSec: NOW_SEC });
  A('worker 验签还原 owner/jti/digest(与账本对齐)',
    verified !== null && verified.owner === owner && verified.jti === signed.jti && verified.targetSetDigest === signed.targetSetDigest);

  const consumed = await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, signed.jti, worker));
  A('consume 消费 account 快照成功(冻结函数 purpose-agnostic)',
    consumed.purpose === 'account_data_erasure' && consumed.privacyEpoch === begun.privacyEpoch);

  // MEM claim：受约束租约（owner/scope/sink/epoch/digest 全重验）。claim 需要 target 的 uuid
  // id（不是 resource_hmac），故按 (request, sink) 从账本反查 target 行 id。
  const targetRows = await admin.query<{ id: string; sink: string }>(
    'SELECT id, sink FROM privacy_deletion_target WHERE request_id=$1 ORDER BY sink', [begun.requestId]);
  const tid = (sink: string) => targetRows.rows.find((r) => r.sink === sink)!.id;
  const claimed = await asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryTarget(c, signed.jti, tid('memory_fact'), worker, 60));
  A('MEM claim: 消费后受约束 claim 目标成功并签发租约',
    claimed !== null && claimed.leaseToken.length > 0 && claimed.targetId === tid('memory_fact'));
  A('claim 后重复 claim 同目标返回空(租约占用中，非安全违规)',
    (await asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryTarget(c, signed.jti, tid('memory_fact'), worker, 60))) === null);
  A('伪造 principal(≠ snapshot.owner) claim 拒绝',
    await rejects(() => asPrivacyWorkerPrincipal(admin, otherOwner, (c) => claimMemoryTarget(c, signed.jti, tid('memory_embedding'), worker, 60))));

  // 一个 issued 未 consume 的快照 → MEM claim 必须拒绝(not_consumed)。signed2 用不同 jti + 同
  // epoch/targets，账本 digest 仍与 request 对齐；未 consume 使其在 claim 第一步即被拒。
  const signed2 = signAccountSnapshot(owner, begun.privacyEpoch, targets);
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signed2.jti, keyId: KEY.kid, actor: owner, interviewId: owner,
    purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch, targetSetDigest: signed2.targetSetDigest,
    expiresAt: new Date(signed2.expiresAtMs),
  }));
  A('claim 前未 consume 拒绝(issued 而非 consumed)',
    await rejects(() => asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryTarget(c, signed2.jti, tid('memory_embedding'), worker, 60))));

  // 跨域 sink fail-closed：独立账本(account_data + consumed snapshot + INT 域 'event' target)。
  // sink 归属校验在 digest/live-digest 之前触发，故无需真实 target 集对齐也能证明 sink_forbidden。
  const intReq = '00000000-0000-4000-8000-0000000000e1';
  const intSnapJti = '00000000-0000-4000-8000-0000000000e2';
  const intTarget = '00000000-0000-4000-8000-0000000000e3';
  await admin.query(
    `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status,privacy_epoch,target_set_digest)
     VALUES ($1,$2,'account_data',$2,$3,'fenced',$4,$5)`,
    [intReq, owner, 'b'.repeat(64), begun.privacyEpoch, 'c'.repeat(64)],
  );
  await admin.query(
    'INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status) VALUES ($1,$2,$3,$4,$5)',
    [intTarget, intReq, 'event', 'e'.repeat(64), 'pending'],
  );
  await admin.query(
    `INSERT INTO privacy_authorization_snapshot
       (jti,issuer_id,key_id,actor,owner_user_id,interview_id,purpose,privacy_epoch,target_set_digest,status,issued_at,expires_at)
     VALUES ($1,'meetwise-privacy-authz-v1',$2,$3,$4,$4,'account_data_erasure',$5,$6,'consumed',now(),now()+interval '10 minutes')`,
    [intSnapJti, KEY.kid, owner, owner, begun.privacyEpoch, 'c'.repeat(64)],
  );
  A('跨域 sink: MEM claim 对 INT sink(event) fail-closed',
    await rejects(() => asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryTarget(c, intSnapJti, intTarget, worker, 60))));

  /* ── M1. MEM claim 十道重验的对抗断言（防假绿：此前只测 owner/not-consumed/sink 三道）── */
  // 每例一张独立账本（owner + account_data scope + 1 个 memory_fact target + consumed snapshot），
  // 全字段可控；逐字段篡改证明各道 fail-closed 重验各自独立生效（安全违规 → RAISE）。
  let advSeq = 0;
  const hex12 = (n: number) => n.toString(16).padStart(12, '0');
  async function seedClaimLedger(opts: { issuedAt?: string; expiresAt?: string } = {}) {
    const suffix = hex12(++advSeq);
    const reqId = `00000000-0000-4000-8000-${suffix}`;
    const targetId = `00000000-0000-4000-9000-${suffix}`;
    const jti = `00000000-0000-4000-a000-${suffix}`;
    const idemHash = 'c'.repeat(52) + suffix;
    const hmac = 'ab'.repeat(32); // 64-hex，resource_hmac 强制 64-hex
    const epoch = 1;
    const digest = canonicalTargetSetDigest([{ kind: 'memory_fact', resource: hmac }]);
    await admin.query(
      `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status,privacy_epoch,target_set_digest)
       VALUES ($1,$2,'account_data',$2,$3,'fenced',$4,$5)`,
      [reqId, owner, idemHash, epoch, digest],
    );
    await admin.query(
      'INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status) VALUES ($1,$2,$3,$4,$5)',
      [targetId, reqId, 'memory_fact', hmac, 'pending'],
    );
    await admin.query(
      `INSERT INTO privacy_authorization_snapshot
         (jti,issuer_id,key_id,actor,owner_user_id,interview_id,purpose,privacy_epoch,target_set_digest,status,issued_at,expires_at)
       VALUES ($1,'meetwise-privacy-authz-v1',$2,$3,$4,$4,'account_data_erasure',$5,$6,'consumed',${opts.issuedAt ?? 'now()'},${opts.expiresAt ?? "now() + interval '10 minutes'"})`,
      [jti, KEY.kid, owner, owner, epoch, digest],
    );
    return { reqId, targetId, jti, epoch, digest, hmac };
  }
  const claimJti = (jti: string, targetId: string) =>
    asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryTarget(c, jti, targetId, worker, 60));
  {
    const L = await seedClaimLedger();
    await admin.query('UPDATE privacy_erasure_request SET privacy_epoch=$1 WHERE id=$2', [L.epoch + 1, L.reqId]);
    A('claim 对抗: epoch 不匹配拒绝(epoch_mismatch)', await rejects(() => claimJti(L.jti, L.targetId)));
  }
  {
    const L = await seedClaimLedger();
    await admin.query('UPDATE privacy_deletion_target SET resource_hmac=$1 WHERE id=$2', ['cd'.repeat(32), L.targetId]);
    A('claim 对抗: 篡改 target 致活 digest 漂移拒绝(target_drift)', await rejects(() => claimJti(L.jti, L.targetId)));
  }
  {
    const L = await seedClaimLedger();
    await admin.query('UPDATE privacy_erasure_request SET subject_id=$1 WHERE id=$2', [otherOwner, L.reqId]);
    A('claim 对抗: subject 不匹配拒绝(subject_mismatch)', await rejects(() => claimJti(L.jti, L.targetId)));
  }
  {
    const L = await seedClaimLedger();
    await admin.query("UPDATE privacy_erasure_request SET scope='interview_data' WHERE id=$1", [L.reqId]);
    A('claim 对抗: scope 不匹配拒绝(scope_mismatch)', await rejects(() => claimJti(L.jti, L.targetId)));
  }
  {
    const L = await seedClaimLedger();
    await admin.query("UPDATE privacy_authorization_snapshot SET issuer_id='evil-issuer' WHERE jti=$1", [L.jti]);
    A('claim 对抗: issuer 不匹配拒绝(issuer_mismatch)', await rejects(() => claimJti(L.jti, L.targetId)));
  }
  {
    const L = await seedClaimLedger({ issuedAt: "now() - interval '50 minutes'", expiresAt: "now() - interval '10 minutes'" });
    A('claim 对抗: 过期快照拒绝(expired)', await rejects(() => claimJti(L.jti, L.targetId)));
  }

  // 逐 sink 物理清除 + 残留=0 校验 → 全 erased 后 request completed。
  const purge = (userId: string, targetId: string, token: string) =>
    asPrivacyWorkerPrincipal(admin, userId, (c) => purgeMemoryTarget(c, targetId, token));
  A('purge: 错误 lease token 拒绝(lease_lost)',
    await rejects(() => purge(owner, tid('memory_fact'), '00000000-0000-4000-8000-0000000000ff')));
  const purgedFact = await purge(owner, tid('memory_fact'), claimed!.leaseToken);
  A('purge memory_fact: 物理清除 + 残留=0 校验通过',
    purgedFact.status === 'erased' && purgedFact.deletedCount >= 1);
  const claimedEmb = await asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryTarget(c, signed.jti, tid('memory_embedding'), worker, 60));
  const purgedEmb = claimedEmb ? await purge(owner, tid('memory_embedding'), claimedEmb.leaseToken) : null;
  A('purge memory_embedding: erased', purgedEmb !== null && purgedEmb.status === 'erased');
  const claimedSnap = await asPrivacyWorkerPrincipal(admin, owner, (c) => claimMemoryTarget(c, signed.jti, tid('memory_context_snapshot'), worker, 60));
  const purgedSnap = claimedSnap ? await purge(owner, tid('memory_context_snapshot'), claimedSnap.leaseToken) : null;
  A('purge memory_context_snapshot: erased 且 request 推进 completed',
    purgedSnap !== null && purgedSnap.status === 'erased' && purgedSnap.requestStatus === 'completed');
  const factLeft = await admin.query<{ n: string }>('SELECT count(*) AS n FROM memory_fact WHERE owner_user_id=$1', [owner]);
  A('删除后 memory_fact 残留=0', Number(factLeft.rows[0]?.n) === 0);

  /* ── I. app_role 无原始表读 / 无 issue / 无 audit 直接写 ──────────────────── */
  A('app_role 无 memory_fact 原始 SELECT(表级 REVOKE)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_fact'))));
  A('app_role 无 memory_append_audit EXECUTE(只授 memory_runtime)',
    await rejects(() => asPrincipal(admin, owner, (c) =>
      c.query("SELECT * FROM memory_append_audit('s','k','{}'::jsonb)"))));
  A('app_role 无 privacy issue 权限',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      'SELECT * FROM privacy_issue_authorization_snapshot($1,$2,$3,$4,$5,$6,$7,$8)',
      ['00000000-0000-4000-8000-0000000000f1', KEY.kid, owner, owner, 'account_data_erasure', 1, 'a'.repeat(64), new Date(Date.now() + 600_000).toISOString()]))));

  /* ── J. getMemoriesByRefIds owner 硬过滤修复(RLS 之上再加租户过滤) ───────── */
  const mem1 = '00000000-0000-4000-8000-0000000000a1';
  const mem2 = '00000000-0000-4000-8000-0000000000a2';
  await admin.query(
    "INSERT INTO user_memory(id, owner_user_id, kind, content, salience) VALUES ($1,$2,'skill',$3,1.0),($4,$5,'skill',$3,1.0)",
    [mem1, owner, 'owner 的派生摘要', mem2, otherOwner],
  );
  const refClient = await admin.connect();
  let refRows: { id: string }[] = [];
  try {
    refRows = await getMemoriesByRefIds(refClient, owner, [mem1, mem2]);
  } finally { refClient.release(); }
  A('getMemoriesByRefIds: owner 硬过滤(即使 RLS 被绕开也不串户)',
    refRows.length === 1 && refRows[0]!.id === mem1);

  // H1：episodeSeen 同款 owner 硬过滤修复（此前 owner 参数被忽略，传任一题面即可判出他人 episode）。
  const epId = '00000000-0000-4000-8000-0000000000b1';
  await admin.query(
    "INSERT INTO user_memory(id, owner_user_id, kind, content, salience) VALUES ($1,$2,'episode',$3,1.0)",
    [epId, owner, '分布式锁 的 租约续期'],
  );
  const epClient = await admin.connect();
  let epSeenOwner = false; let epSeenOther = true;
  try {
    epSeenOwner = await episodeSeen(epClient, owner, '分布式锁 的 租约续期');
    epSeenOther = await episodeSeen(epClient, otherOwner, '分布式锁 的 租约续期');
  } finally { epClient.release(); }
  A('episodeSeen: owner 命中(归一化后精确匹配)', epSeenOwner === true);
  A('episodeSeen: otherOwner 不串户(owner 硬过滤在 RLS 被绕开时仍生效)', epSeenOther === false);

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 记忆治理(MEM-00) DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });
