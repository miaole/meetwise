/**
 * GAP-PRIV-04 向量面擦除收尾 DB 证明（隔离 PostgreSQL · pgvector · 0141）。
 *
 * prove 六件套（PRE dual mw-privacy-int C-P4-4 / mw-e2e-ha C-EH-2 · 不弱化 · 不替换）：
 *   ① 未授权擦除红（真入口：0125 claim 十项 fail-closed 链 + sweep 无授权跳过）
 *   ② 授权后 ANN recall=0（真 ANN 查询 annSearchLegacy `<=>` HNSW probe ·
 *      擦除前正对照 hit ≥1 证 probe 非空转 · Ban 行数 proxy 替代 ANN）
 *   ③ 目标行数=0（per (owner_user_id, kind) 快照）
 *   ④ 残留=0（0125 :348-355 同口径 · purge 内建 55000 fail-closed）
 *   ⑤ 跨 subject intact + qbank intact（content_hash+embedding 聚合 digest 等值断言）
 *   ⑥ 公开 DELETE=503（`pnpm privacy-erasure:http:prove` 同 ledger 入账 · 本证明外同列）
 * 附加：0141 lease 绑定 DELETE fence（app_role 无授权自删红 / 错 token 红）·
 *      0091 local_erased receipt 落账（既有函数 · guard 零语义改动）·
 *      INT sink='vector' 诚实 no-target（无 target + feed 不出 + claim sink_forbidden）。
 * 诚实披露：本地隔离 PG 行级证据 ≠ 生产云端彻底删除；HNSW 索引内部页 / WAL / 备份 /
 *   副本不在行级证据面；releaseEvidence=false；本 sweep completed ≠ 账户删除完成。
 */
import { createHash } from 'node:crypto';
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  beginMemoryVectorChunkErasure, claimMemoryVectorChunkTarget, purgeMemoryVectorChunkTarget,
  isMemoryVectorChunkErasureActive, annSearchLegacy,
  runVectorPlaneErasureTick, listClaimableVectorChunkTargets, recordVectorPlaneLocalErasedReceipt,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot,
  type Client,
} from '@meetwise/db';
import {
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';

const admin = createPool({ max: 40 });
const owner = `vplane-owner-${process.pid}`;
const otherOwner = `vplane-other-${process.pid}`;
const fenceOwner = `vplane-fence-${process.pid}`;
const intOwner = `vplane-int-${process.pid}`;
const noAuthzOwner = `vplane-noauthz-${process.pid}`;
const worker = `vplane-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-vplane-01');
const HASH = 'a'.repeat(64);
const HASH_FENCE = 'b'.repeat(64);
const HASH_INT = 'c'.repeat(64);
const HASH_NOAUTHZ = 'd'.repeat(64);

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
const rejectsMsg = async (fn: () => Promise<unknown>, needle: string) => {
  try { await fn(); return false; } catch (e) { return e instanceof Error && e.message.includes(needle); }
};

/** 确定性 512 维向量（LCG）——owner 主向量与查询向量逐字节同源，正对照必命中。 */
function makeVec(seed: number): string {
  let x = seed >>> 0;
  const parts: number[] = [];
  for (let i = 0; i < 512; i++) {
    x = (Math.imul(1103515245, x) + 12345) >>> 0;
    parts.push((((x >>> 8) % 20000) - 10000) / 100000);
  }
  return '[' + parts.join(',') + ']';
}
const VEC_A = makeVec(20260);
const VEC_B = makeVec(20261);
const VEC_C = makeVec(20262);

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

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@vplane.test`, 'scrypt$salt$dk'],
  );
}

async function insertChunk(id: string, ownerId: string, kind: 'memory' | 'qbank', vec: string): Promise<void> {
  await admin.query(
    `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
     VALUES ($1,$2,$3,$4,$5,$6::vector)`,
    [id, ownerId, kind, `ref-${id}`, createHash('sha256').update(id).digest('hex'), vec],
  );
}

async function planeStat(ownerId: string, kind: 'memory' | 'qbank'): Promise<{ n: number; d: string }> {
  const r = await admin.query<{ n: string; d: string }>(
    `SELECT count(*) AS n,
            encode(digest(string_agg(content_hash || ':' || embedding::text, E'\n' ORDER BY content_hash, id), 'sha256'), 'hex') AS d
       FROM vector_chunk WHERE owner_user_id=$1 AND kind=$2`, [ownerId, kind]);
  return { n: Number(r.rows[0]?.n ?? 0), d: r.rows[0]?.d ?? '' };
}

async function requestTargets(requestId: string): Promise<string[]> {
  const r = await admin.query<{ sink: string }>(
    'SELECT sink FROM privacy_deletion_target WHERE request_id=$1 ORDER BY sink', [requestId]);
  return r.rows.map((row) => row.sink);
}

function signAccountSnapshot(ownerId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: ownerId,
    purpose: 'account_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}

async function issueAndConsume(ownerId: string, begun: { privacyEpoch: number; targets: { sink: string; resourceHmac: string }[] }) {
  const targets: PrivacyAuthzTarget[] = begun.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  const signed = signAccountSnapshot(ownerId, begun.privacyEpoch, targets);
  await asIssuer(ownerId, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: ownerId, interviewId: ownerId,
    purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch,
    targetSetDigest: signed.targetSetDigest, expiresAt: new Date(signed.expiresAtMs),
  }));
  await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, signed.jti, worker));
  return { signed, targets };
}

async function main() {
  await assertIsolatedTestTarget(admin);
  for (const u of [owner, otherOwner, fenceOwner, intOwner, noAuthzOwner]) await insertAccount(u);

  /* 种子：owner memory×3（可 ANN 区分）+ owner qbank×1 + 他户 memory×1 + 系统 qbank×1 */
  await insertChunk('vp-mem-1', owner, 'memory', VEC_A);
  await insertChunk('vp-mem-2', owner, 'memory', VEC_B);
  await insertChunk('vp-mem-3', owner, 'memory', VEC_C);
  await insertChunk('vp-qbank-owner', owner, 'qbank', VEC_A);
  await insertChunk('vp-mem-other', otherOwner, 'memory', VEC_B);
  await insertChunk('vp-qbank-sys', '__system_qbank__', 'qbank', VEC_C);
  await insertChunk('vp-mem-fence', fenceOwner, 'memory', VEC_A);
  await insertChunk('vp-mem-noauthz', noAuthzOwner, 'memory', VEC_B);

  /* ── 擦除前快照（六件套③⑤基线 + ②正对照） ─────────────────────────────── */
  const preOwnerMem = await planeStat(owner, 'memory');
  const preOtherMem = await planeStat(otherOwner, 'memory');
  const preOwnerQbank = await planeStat(owner, 'qbank');
  const preSysQbank = await planeStat('__system_qbank__', 'qbank');
  const probe = makeVec(20260); // = VEC_A 逐字节同源（真 ANN 查询向量）
  const preHits = await asPrincipal(admin, owner, (c) => annSearchLegacy(c, 'memory', JSON.parse(probe), 5));
  A('②正对照 擦除前真 ANN probe（HNSW <=>）命中 ≥1（probe 非空转）', preHits.length >= 1);
  A('②正对照 命中首挑为主向量 vp-mem-1（ref-id 精确）', preHits.some((h) => h.refId === 'ref-vp-mem-1'));
  A('前置快照 owner memory=3 / other memory=1 / owner qbank=1 / system qbank=1',
    preOwnerMem.n === 3 && preOtherMem.n === 1 && preOwnerQbank.n === 1 && preSysQbank.n === 1);

  /* ── begin + 写围栏（0125 原链） ───────────────────────────────────────── */
  const begun = await asPrincipal(admin, owner, (c) => beginMemoryVectorChunkErasure(c, HASH));
  A('①begin: fenced + 恰 1 target memory_vector_chunk',
    begun.requestStatus === 'fenced' && begun.targets.length === 1 && begun.targets[0]?.sink === 'memory_vector_chunk');
  A('②INT sink=vector 诚实 no-target：本 request 无 sink=vector target',
    !(await requestTargets(begun.requestId)).includes('vector')
    && (await requestTargets(begun.requestId)).join(',') === 'memory_vector_chunk');
  A('①写围栏激活（isMemoryVectorChunkErasureActive）',
    await asPrincipal(admin, owner, (c) => isMemoryVectorChunkErasureActive(c, owner)));

  /* ── ① 未授权红（真入口 · 0125 claim 十项 fail-closed 链） ─────────────── */
  const targetId = (await admin.query<{ id: string }>(
    'SELECT id FROM privacy_deletion_target WHERE request_id=$1 AND sink=$2',
    [begun.requestId, 'memory_vector_chunk'])).rows[0]!.id;
  A('①未授权红 真 claim 入口：伪造 jti（ledger 无此 snapshot）→ 42501 拒',
    await rejectsMsg(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      claimMemoryVectorChunkTarget(c, 'no-such-jti-vplane', targetId, worker)), 'privacy_authorization_snapshot_not_found'));

  /* issued 未消费 → sweep jti feed 无授权跳过（无授权不删）+ claim 真入口红 */
  const issuedOnly = signAccountSnapshot(owner, begun.privacyEpoch,
    begun.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: issuedOnly.jti, keyId: KEY.kid, actor: owner, interviewId: owner,
    purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch,
    targetSetDigest: issuedOnly.targetSetDigest, expiresAt: new Date(issuedOnly.expiresAtMs),
  }));
  A('①未授权红 issued（未 consume）→ claim 真入口 42501 not_consumed 拒',
    await rejectsMsg(() => asPrivacyWorkerPrincipal(admin, owner, (c) =>
      claimMemoryVectorChunkTarget(c, issuedOnly.jti, targetId, worker)), 'privacy_authorization_snapshot_not_consumed'));
  const tickNoAuthz = await runVectorPlaneErasureTick({
    asExecutor: <T>(fn: (c: Client) => Promise<T>) => asPrivacyWorkerExecutor(admin, fn),
    asWorkerPrincipal: <T>(o: string, fn: (c: Client) => Promise<T>) => asPrivacyWorkerPrincipal(admin, o, fn),
    workerId: `${worker}-noauthz`,
  });
  A('①未授权红 sweep 产品路径：无 consumed 授权 → 诚实跳过（claimed=0 erased=0 skipped=1）',
    tickNoAuthz.claimed === 0 && tickNoAuthz.erased === 0 && tickNoAuthz.skippedUnauthorized === 1);
  A('①未授权红 跳过后 owner memory 行数仍=3（无授权未删）',
    (await planeStat(owner, 'memory')).n === 3);

  /* ── 授权（issuer 链）→ 产品 sweep 步（feed→jti feed→claim→purge→receipt） ── */
  const { signed } = await issueAndConsume(owner, begun);
  A('①begin: SQL digest 与 TS canonicalTargetSetDigest 逐字节相等',
    begun.targetSetDigest === canonicalTargetSetDigest(
      begun.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }))));
  const tick = await runVectorPlaneErasureTick({
    asExecutor: <T>(fn: (c: Client) => Promise<T>) => asPrivacyWorkerExecutor(admin, fn),
    asWorkerPrincipal: <T>(o: string, fn: (c: Client) => Promise<T>) => asPrivacyWorkerPrincipal(admin, o, fn),
    workerId: `${worker}-main`,
  });
  A('③④sweep 产品路径：claimed=1 erased=1 receipted=1 skipped=0',
    tick.claimed === 1 && tick.erased === 1 && tick.receipted === 1 && tick.skippedUnauthorized === 0);

  const reqStatus = (await admin.query<{ status: string }>(
    'SELECT status FROM privacy_erasure_request WHERE id=$1', [begun.requestId])).rows[0]?.status;
  A('④request completed（0091 completed guard 原样通过）', reqStatus === 'completed');

  /* ── 候选 C：0091 既有函数落 local_erased receipt（零语义改动） ──────────── */
  const receipt = (await admin.query<{ receipt_kind: string; receipt_hash: string; recorded_by: string }>(
    'SELECT receipt_kind, receipt_hash, recorded_by FROM privacy_deletion_receipt WHERE target_id=$1',
    [targetId])).rows[0];
  const expectedHash = createHash('sha256').update(`${targetId}:vector_plane:local_erased:3`).digest('hex');
  A('C:0091 receipt local_erased 落账（既有 privacy_record_deletion_receipt · hash 可复算）',
    !!receipt && receipt.receipt_kind === 'local_erased' && receipt.receipt_hash === expectedHash
    && receipt.recorded_by === `${worker}-main`);

  /* ── ② ANN recall=0（真 ANN 查询 · 非行数 proxy）＋ ③ 行数=0 ＋ ④ 残留=0 ── */
  const postHits = await asPrincipal(admin, owner, (c) => annSearchLegacy(c, 'memory', JSON.parse(probe), 5));
  A('②ANN recall=0：擦除后同一 probe（生产 annSearchLegacy HNSW <=>）0 hit', postHits.length === 0);
  const postGlobal = await admin.query<{ n: string }>(
    `SELECT count(*) AS n FROM (SELECT id FROM vector_chunk
       WHERE owner_user_id=$1 AND kind='memory'
       ORDER BY embedding <=> $2::vector LIMIT 5) t`, [owner, probe]);
  A('②ANN recall=0（admin 侧同查询向量直探，行级 0 hit）', Number(postGlobal.rows[0]?.n ?? 0) === 0);
  const postOwnerMem = await planeStat(owner, 'memory');
  A('③目标行数=0：owner memory 3→0', postOwnerMem.n === 0 && preOwnerMem.n === 3);
  A('④残留=0（0125 :348-355 同口径显式 count）', postOwnerMem.n === 0);

  /* ── ⑤ 跨 subject intact + qbank intact（digest 等值断言，非仅无报错） ──── */
  const postOtherMem = await planeStat(otherOwner, 'memory');
  const postOwnerQbank = await planeStat(owner, 'qbank');
  const postSysQbank = await planeStat('__system_qbank__', 'qbank');
  A('⑤跨 subject intact：他户 memory 行数与 digest 逐字节相等',
    postOtherMem.n === preOtherMem.n && postOtherMem.d === preOtherMem.d);
  A('⑤qbank intact：owner qbank 行数与 digest 逐字节相等',
    postOwnerQbank.n === preOwnerQbank.n && postOwnerQbank.d === preOwnerQbank.d);
  A('⑤qbank intact：系统 qbank 行数与 digest 逐字节相等',
    postSysQbank.n === preSysQbank.n && postSysQbank.d === preSysQbank.d);
  const otherHits = await asPrincipal(admin, otherOwner, (c) => annSearchLegacy(c, 'memory', JSON.parse(VEC_B), 5));
  A('⑤跨 subject 检索面 intact：他户 ANN probe 仍命中', otherHits.length >= 1);

  /* ── 0141 lease 绑定 DELETE fence（关 app_role 无授权自删已披露缺口） ───── */
  A('fence: app_role 无 purge 上下文自删 memory 行 → 42501 拒（0141 前 可删）',
    await rejectsMsg(() => asPrincipal(admin, fenceOwner, (c) =>
      c.query("DELETE FROM vector_chunk WHERE owner_user_id=$1 AND kind='memory'", [fenceOwner])),
    'vector_plane_erasure_delete_not_authorized'));
  A('fence: qbank DELETE 不受 0141 影响（admin 清理路径在位）',
    !(await rejects(() => admin.query("DELETE FROM vector_chunk WHERE id='vp-qbank-sys'"))));
  await insertChunk('vp-qbank-sys', '__system_qbank__', 'qbank', VEC_C); // 复位系统 qbank 行

  /* fenceOwner 授权流：错 token DELETE 红 → 正 purge 绿（fence 不拦授权路径） */
  const begunFence = await asPrincipal(admin, fenceOwner, (c) => beginMemoryVectorChunkErasure(c, HASH_FENCE));
  const fenceTargetId = (await admin.query<{ id: string }>(
    'SELECT id FROM privacy_deletion_target WHERE request_id=$1 AND sink=$2',
    [begunFence.requestId, 'memory_vector_chunk'])).rows[0]!.id;
  const { signed: signedFence } = await issueAndConsume(fenceOwner, begunFence);
  const fenceClaim = await asPrivacyWorkerPrincipal(admin, fenceOwner, (c) =>
    claimMemoryVectorChunkTarget(c, signedFence.jti, fenceTargetId, worker));
  A('fence: fenceOwner claim 恰一租约', !!fenceClaim?.leaseToken);
  const wrongTokenDelete = () => asPrincipal(admin, fenceOwner, async (c) => {
    await c.query("SELECT set_config('app.privacy_target_id',$1,true), set_config('app.privacy_lease_token','00000000-0000-4000-8000-0000000000bad',true)",
      [fenceTargetId]);
    await c.query("DELETE FROM vector_chunk WHERE owner_user_id=$1 AND kind='memory'", [fenceOwner]);
  });
  A('fence: lease 上下文但错 token → 42501 拒（token 绑定生效）',
    await rejectsMsg(wrongTokenDelete, 'vector_plane_erasure_delete_not_authorized'));
  const purgedFence = await asPrivacyWorkerPrincipal(admin, fenceOwner, (c) =>
    purgeMemoryVectorChunkTarget(c, fenceTargetId, fenceClaim!.leaseToken));
  A('fence: 正 token 物理 purge 绿（fence 不拦授权路径）+ request completed',
    purgedFence.status === 'erased' && purgedFence.requestStatus === 'completed');
  await asPrivacyWorkerPrincipal(admin, fenceOwner, (c) =>
    recordVectorPlaneLocalErasedReceipt(c, fenceTargetId, purgedFence.deletedCount, worker));
  A('fence: fenceOwner local_erased receipt 落账（deletedCount=1 可复算）',
    (await admin.query<{ n: string }>(
      'SELECT count(*) AS n FROM privacy_deletion_receipt WHERE target_id=$1 AND receipt_kind=$2',
      [fenceTargetId, 'local_erased'])).rows[0]?.n === '1');

  /* ── INT sink='vector' fail-closed（诚实 no-target · 不假造作用域键） ───── */
  const begunInt = await asPrincipal(admin, intOwner, (c) => beginMemoryVectorChunkErasure(c, HASH_INT));
  const { signed: signedInt } = await issueAndConsume(intOwner, begunInt);
  const intTargetId = (await admin.query<{ id: string }>(
    'SELECT id FROM privacy_deletion_target WHERE request_id=$1 AND sink=$2',
    [begunInt.requestId, 'memory_vector_chunk'])).rows[0]!.id;
  await admin.query(
    `INSERT INTO privacy_deletion_target(request_id, sink, resource_hmac, status)
     VALUES ($1::uuid,'vector',encode(hmac($2,'vplane-fixture','sha256'),'hex'),'pending')`,
    [begunInt.requestId, begunInt.requestId]);
  const feedRows = await asPrivacyWorkerExecutor(admin, (c) => listClaimableVectorChunkTargets(c));
  A('INT: 假造 sink=vector target 不进 0141 feed（feed 仅真靶 memory_vector_chunk）',
    feedRows.length === 1 && feedRows[0]?.targetId === intTargetId);
  A('INT: 假造 sink=vector target 经真 claim 入口 → 42501 sink_forbidden 拒',
    await rejectsMsg(async () => asPrivacyWorkerPrincipal(admin, intOwner, async (c) =>
      claimMemoryVectorChunkTarget(c, signedInt.jti,
        (await admin.query<{ id: string }>(
          "SELECT id FROM privacy_deletion_target WHERE request_id=$1 AND sink='vector'",
          [begunInt.requestId])).rows[0]!.id, worker)),
      'privacy_authorization_sink_forbidden'));
  // 清除假造行（防 live-drift 拖累真靶）：drift 防线本身是 0125 十项链的一环——
  // 假造行在场时真靶 claim 同样会被 drift 拒，这里清除后真靶恢复可行使。
  await admin.query("DELETE FROM privacy_deletion_target WHERE request_id=$1 AND sink='vector'", [begunInt.requestId]);
  A('INT: 假造行清除后 request 仅剩 memory_vector_chunk target',
    (await requestTargets(begunInt.requestId)).join(',') === 'memory_vector_chunk');
  const intClaim = await asPrivacyWorkerPrincipal(admin, intOwner, (c) =>
    claimMemoryVectorChunkTarget(c, signedInt.jti, intTargetId, worker));
  const purgedInt = await asPrivacyWorkerPrincipal(admin, intOwner, (c) =>
    purgeMemoryVectorChunkTarget(c, intTargetId, intClaim!.leaseToken));
  A('INT: 正靶（memory_vector_chunk）不被假造行拖累，物理 purge 照常绿',
    purgedInt.status === 'erased');

  /* ── 无授权 owner 面行 intact（sweep 跳过未删） ─────────────────────────── */
  A('no-authz owner memory 行 intact（sweep 跳过=未删）',
    (await planeStat(noAuthzOwner, 'memory')).n === 1);

  await admin.end();
  console.log(failures === 0
    ? '\n✓ GAP-PRIV-04 向量面擦除收尾 DB 证明通过（本地隔离 · releaseEvidence=false · ≠ 云端彻底删除 · HNSW 内部页/WAL/备份不在行级证据面 · 公开 DELETE=503 同列入账见 privacy-erasure:http:prove）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });
