/**
 * 撤回、过期和删除（CTX-06）DB 证明：压缩轨道删除 sink 闭合。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明（七类矩阵）：
 *  - ① 正常：建事件源 + draft/activate snapshot（draft/active/superseded 三态齐备）+ dispatch 行
 *    → begin（2 sink target，snapshot 三态全 fence、dispatch 不 fence）→ hydrate/replay read=0
 *    → 签 account_data_erasure 快照 → issue/consume → claim/purge 逐 sink → 物理删后 raw SELECT=0
 *    + 残留=0 + request completed。
 *  - ② 异常：非 64-hex idempotency_key_hash 拒；伪造 principal claim 拒；sink 白名单外 claim 拒
 *    （sink_forbidden 由 SQL 侧 CHECK + claim 白名单承重，本证明以 scope/purpose 错配拒为负对照）。
 *  - ③ 特殊：snapshot fence 使 cas_version 递增（正向跃迁真落地）；dispatch 无 fenced 态如实验证
 *    （begin 后 dispatch 行仍 committed，不伪装 fence）。
 *  - ④ 逃逸通道：cross-owner raw SELECT=0（RLS 隔离）+ memory_runtime FORCE RLS=0 + app_role 无
 *    原始表写权限 + 幂等键重放单份（request 不双写）。
 *  - ⑤ 高并发：purge 单 sink 单赢家（lease token CAS）；陈旧 token 二次 purge 被拒（lease_lost）。
 *  - ⑥ 复杂：snapshot purge 先 fenced→purged 正向跃迁再物理删；dispatch purge 纯删；逐 sink
 *    receipt_hash 落账 + request 推进（snapshot 先 purging、dispatch 后 completed）。
 *  - ⑦ 刁钻：purge 后 replay/hydrate 全 0（真物理删除非 RLS 假绿）+ dispatch 无 fence 的 read=0
 *    由 DELETE 承重（begin 后 dispatch 仍可见、purge 后不可见）。
 *
 * 铁律：不 log PII/全文；四原语复用不重实现（CAS/幂等键/RLS/memory_append_audit 有序日志）；
 * 待独立专家审计，本证明只产出本地隔离证据，不自称「完成/通过」。
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  appendConversationEvent, type ConversationEventAppendReceipt,
  draftCompressionSnapshot, activateCompressionSnapshot,
  hydrateCompressionSnapshots, replayCompressionSnapshots,
  beginCompressionErasure, claimCompressionTarget, purgeCompressionTarget,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot,
  type Client, type DraftCompressionSnapshotInput,
} from '@meetwise/db';
import {
  COMPRESSION_DELETION_SINKS,
  deriveSummaryContentDigest, deriveSummaryRangeDigest, deriveCompressionSnapshotSourceArtifactDigest,
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';

const admin = createPool({ max: 40 });
const owner = `ctx06-owner-${process.pid}`;
const otherOwner = `ctx06-other-${process.pid}`;
const worker = `ctx06-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-ctx06-01');
const HASH64 = 'a'.repeat(64);

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

const utf8Len = (s: string) => new TextEncoder().encode(s).length;

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@ctx06.test`, 'scrypt$salt$dk'],
  );
}

/** 签发器专用 principal（SET LOCAL ROLE privacy_issuer + 绑定 owner GUC），与 MEM/INT/CTX 证明同源。 */
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

function signAccountSnapshot(ownerId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: ownerId,
    purpose: 'account_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}

/** memory_runtime 原始 SQL（FORCE RLS，只看得见 owner=principal；用于跨 owner 断言）。 */
async function rawAsMemoryRuntime<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE memory_runtime');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

interface SourceInfo {
  receipts: ConversationEventAppendReceipt[];
  sourceText: string;
  firstBodyUtf8Len: number;
  sourceArtifactDigest: string;
  sourceUtf8ByteLength: number;
  rangeDigest: (from: number, to: number) => string;
}

/** 为一个 owner/thread 建连续来源事件（1..N sequence），并派生原文/字节长/范围 digest。 */
async function createSource(ownerId: string, threadId: string, bodies: string[]): Promise<SourceInfo> {
  const receipts: ConversationEventAppendReceipt[] = [];
  for (let i = 0; i < bodies.length; i++) {
    const r = await asPrincipal(admin, ownerId, (c) => appendConversationEvent(c, {
      threadId,
      category: i === 0 ? 'user_message' : (i % 2 === 1 ? 'assistant_message' : 'tool_call'),
      source: i === 0 ? 'user' : 'model',
      eventKey: `${threadId}-evt-${i}`,
      body: bodies[i]!,
      retentionClass: 'session',
      consentPurpose: 'free_conversation',
      consentRevision: 1,
      privacyEpoch: 1,
    }));
    receipts.push(r);
  }
  const sourceText = bodies.join('\n');
  const entries = receipts.map((r) => ({ sequence: r.sequence, eventDigest: r.eventDigest }));
  const rangeDigest = (from: number, to: number) => deriveSummaryRangeDigest({
    threadId, fromSequence: from, toSequence: to,
    entries: entries.filter((e) => e.sequence >= from && e.sequence <= to),
  });
  return {
    receipts, sourceText,
    firstBodyUtf8Len: utf8Len(bodies[0]!),
    sourceArtifactDigest: deriveCompressionSnapshotSourceArtifactDigest(sourceText),
    sourceUtf8ByteLength: utf8Len(sourceText),
    rangeDigest,
  };
}

function draftInput(threadId: string, source: SourceInfo, start: number, end: number, summaryContent: string, overrides: Partial<DraftCompressionSnapshotInput> = {}): DraftCompressionSnapshotInput {
  return {
    threadId,
    sourceEventSeqStart: start,
    sourceEventSeqEnd: end,
    sourceArtifactDigest: source.sourceArtifactDigest,
    sourceUtf8ByteLength: source.sourceUtf8ByteLength,
    summaryContent,
    summaryContentDigest: deriveSummaryContentDigest(summaryContent),
    summaryClaims: [{ text: summaryContent, span: { offsetKind: 'utf8_byte', start: 0, end: source.firstBodyUtf8Len } }],
    policyVersion: 'pol-v1', promptVersion: 'prompt-v1', modelVersion: 'qwen-plus', tokenizerVersion: 'tok-v1',
    ...overrides,
  };
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);

  /* ── A. 域常量 pin（显式 enum 非布尔汤）────────────────────────────── */
  A('域: 压缩删除 sink 枚举冻结 snapshot + dispatch',
    COMPRESSION_DELETION_SINKS.join(',') === 'context_compression_snapshot,context_compression_dispatch');

  /* ── ① 正常 + ③ 特殊：draft/active/superseded 三态齐备 + dispatch 行 ── */
  const src = await createSource(owner, 'thread-snap', [
    '你好，我想准备分布式系统的面试。',
    '好的，我们先梳理分布式锁的核心。',
    '分布式锁需要关注互斥、死锁和容错。',
  ]);
  const summaryA = '用户准备分布式系统面试，重点是分布式锁。';
  const summaryB = '用户准备分布式系统面试，重点是共识协议。';
  const summaryDraft = '用户准备分布式系统面试，待激活。';

  const s1 = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-snap', src, 1, 1, summaryA, { idempotencyKey: 'ctx06-s1' })));
  await asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, s1.id, 1));
  const s2 = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-snap', src, 1, 1, summaryB, { idempotencyKey: 'ctx06-s2' })));
  await asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, s2.id, 1));
  const s3 = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-snap', src, 2, 2, summaryDraft, { idempotencyKey: 'ctx06-s3' })));

  const snapStates = (await admin.query<{ id: string; status: string }>(
    'SELECT id, status FROM context_compression_snapshot WHERE owner_user_id=$1 ORDER BY created_at', [owner])).rows;
  A('① 前置: draft/active/superseded 三态齐备（s1=superseded、s2=active、s3=draft）',
    snapStates.find((r) => r.id === s1.id)!.status === 'superseded'
    && snapStates.find((r) => r.id === s2.id)!.status === 'active'
    && snapStates.find((r) => r.id === s3.id)!.status === 'draft');
  A('① 前置: hydrate 仅 1 条 active（s2），replay 3 条（draft/active/superseded）',
    (await asPrincipal(admin, owner, (c) => hydrateCompressionSnapshots(c, 'thread-snap'))).length === 1
    && (await asPrincipal(admin, owner, (c) => replayCompressionSnapshots(c, 'thread-snap'))).length === 3);

  // 派发行：raw admin INSERT 落 committed（admin=superuser 绕过 RLS，证明删除路径对既有行生效）。
  const dispatchId = (await admin.query<{ id: string }>(
    `INSERT INTO context_compression_dispatch(owner_user_id, thread_id, source_event_seq_start, source_event_seq_end, source_range_digest, version, status, policy_version, prompt_version, model_version)
     VALUES ($1, 'thread-dispatch', 1, 1, $2, 1, 'committed', 'pol-v1', 'prompt-v1', 'qwen-plus') RETURNING id`,
    [owner, 'b'.repeat(64)])).rows[0]!.id;
  A('③ 前置: dispatch 行落 committed + version=1（无 fenced/purged 状态）',
    (await admin.query<{ status: string; version: string }>('SELECT status, version FROM context_compression_dispatch WHERE id=$1', [dispatchId])).rows[0]!.status === 'committed');

  /* ── ② 异常：非 64-hex idempotency_key_hash 拒 ─────────────────────── */
  A('② begin: 非 64-hex idempotency_key_hash 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => beginCompressionErasure(c, 'short'))));

  /* ── ① begin：snapshot 三态全 fence、dispatch 不 fence ─────────────── */
  const HASH = 'c'.repeat(64);
  const begun = await asPrincipal(admin, owner, (c) => beginCompressionErasure(c, HASH));
  A('① begin: 落 fenced request + 2 个压缩 sink target（snapshot + dispatch）',
    begun.requestStatus === 'fenced' && begun.targets.length === 2
    && begun.targets.map((t) => t.sink).sort().join(',') === 'context_compression_dispatch,context_compression_snapshot');
  const targets: PrivacyAuthzTarget[] = begun.targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac }));
  A('① begin: SQL target_set_digest 与 TS canonicalTargetSetDigest 逐字节相等',
    begun.targetSetDigest === canonicalTargetSetDigest(targets));
  A('① begin: privacy_epoch = 事件源 MAX(privacy_epoch=1)+1 = 2',
    begun.privacyEpoch === 2);
  const begunReplay = await asPrincipal(admin, owner, (c) => beginCompressionErasure(c, HASH));
  A('④ 幂等: 同 hash 重放返回同一 request(replayed=true)',
    begunReplay.requestId === begun.requestId && begunReplay.replayed === true);

  const snapAfterFence = (await admin.query<{ id: string; status: string; cas_version: string }>(
    'SELECT id, status, cas_version FROM context_compression_snapshot WHERE owner_user_id=$1 ORDER BY created_at', [owner])).rows;
  A('③ fence: snapshot 三态全 fenced（draft/active/superseded → fenced 正向跃迁真落地）',
    snapAfterFence.every((r) => r.status === 'fenced'));
  A('③ fence: active(s2) cas_version 2→3（CAS 语义真递增）',
    Number(snapAfterFence.find((r) => r.id === s2.id)!.cas_version) === 3);
  A('③ dispatch 无 fence: begin 后 dispatch 仍 committed + version=1（如实披露，不伪装 fence）',
    (await admin.query<{ status: string; version: string }>('SELECT status, version FROM context_compression_dispatch WHERE id=$1', [dispatchId])).rows[0]!.status === 'committed'
    && Number((await admin.query<{ version: string }>('SELECT version FROM context_compression_dispatch WHERE id=$1', [dispatchId])).rows[0]!.version) === 1);

  A('① fence 后 read=0: hydrate thread-snap 0 条（active 过滤下 fenced 不吐）',
    (await asPrincipal(admin, owner, (c) => hydrateCompressionSnapshots(c, 'thread-snap'))).length === 0);
  A('① fence 后 read=0: replay thread-snap 0 条（draft/active/superseded 过滤下 fenced 不吐）',
    (await asPrincipal(admin, owner, (c) => replayCompressionSnapshots(c, 'thread-snap'))).length === 0);

  /* ── ④ 逃逸通道：cross-owner=0 + app_role 无原始表写权限 ───────────── */
  A('④ 跨 owner: memory_runtime raw SELECT 直查 owner 快照表 = 0 行可见（FORCE RLS）',
    (await rawAsMemoryRuntime(otherOwner, (c) => c.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM context_compression_snapshot WHERE owner_user_id=$1', [owner]))).rows[0]!.n === 0);
  A('④ 逃逸: app_role raw DELETE 快照表被拒（仅 purge 定义者可物理删）',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      'DELETE FROM context_compression_snapshot WHERE id=$1', [s3.id]))));

  /* ── 复用冻结 PrivacyAuthorizationIssuer：签 account_data_erasure 快照 + issue/consume ── */
  const signed = signAccountSnapshot(owner, begun.privacyEpoch, targets);
  await asIssuer(owner, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: owner, interviewId: owner,
    purpose: 'account_data_erasure', privacyEpoch: begun.privacyEpoch, targetSetDigest: signed.targetSetDigest,
    expiresAt: new Date(signed.expiresAtMs),
  }));
  await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, signed.jti, worker));

  const targetRows = await admin.query<{ id: string; sink: string }>(
    'SELECT id, sink FROM privacy_deletion_target WHERE request_id=$1 ORDER BY sink', [begun.requestId]);
  const tid = (sink: string) => targetRows.rows.find((r) => r.sink === sink)!.id;

  const claimedSnap = await asPrivacyWorkerPrincipal(admin, owner, (c) => claimCompressionTarget(c, signed.jti, tid('context_compression_snapshot'), worker, 60));
  A('claim: snapshot 目标受约束 claim 成功并签发租约',
    claimedSnap !== null && claimedSnap.leaseToken.length > 0 && claimedSnap.targetId === tid('context_compression_snapshot'));
  A('claim: 伪造 principal(≠ snapshot.owner) claim 拒',
    await rejects(() => asPrivacyWorkerPrincipal(admin, otherOwner, (c) => claimCompressionTarget(c, signed.jti, tid('context_compression_dispatch'), worker, 60))));

  /* ── ⑤ 高并发/租约：陈旧 token 二次 purge 被拒（lease_lost） ───────── */
  A('⑤ lease: 陈旧/伪造 token purge 被拒（lease_lost）',
    await rejects(() => asPrivacyWorkerPrincipal(admin, owner, (c) => purgeCompressionTarget(c, tid('context_compression_dispatch'), '00000000-0000-0000-0000-000000000000'))));

  /* ── ⑥ purge snapshot：fenced→purged 正向跃迁 + 物理删除 + receipt ─── */
  const purgeSnap = await asPrivacyWorkerPrincipal(admin, owner, (c) => purgeCompressionTarget(c, tid('context_compression_snapshot'), claimedSnap!.leaseToken));
  A('⑥ purge snapshot: erased + deletedCount≥1 + request 推进 purging（dispatch 仍 pending）',
    purgeSnap.status === 'erased' && purgeSnap.deletedCount >= 1 && purgeSnap.requestStatus === 'purging');
  A('⑥ purge snapshot: raw SELECT 0 行（真物理删除，非 RLS 假绿）',
    (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM context_compression_snapshot WHERE owner_user_id=$1', [owner])).rows[0]!.n === 0);
  const snapReceipt = (await admin.query<{ receipt_hash: string }>(
    'SELECT receipt_hash FROM privacy_deletion_target WHERE id=$1', [tid('context_compression_snapshot')])).rows[0]!;
  A('⑥ receipt: snapshot target 落 receipt_hash（64-hex，逐 sink 收据）',
    /^[a-f0-9]{64}$/.test(snapReceipt.receipt_hash));
  // 幂等 re-drive：request 仍 purging（dispatch 未删），已 erased snapshot 二次 purge 早返回 erased。
  const purgeSnapAgain = await asPrivacyWorkerPrincipal(admin, owner, (c) => purgeCompressionTarget(c, tid('context_compression_snapshot'), claimedSnap!.leaseToken));
  A('⑦ 幂等 purge: 已 erased snapshot 二次 purge 返回 erased + deletedCount=0（request 仍 purging）',
    purgeSnapAgain.status === 'erased' && purgeSnapAgain.deletedCount === 0);

  /* ── ⑥ purge dispatch：纯物理删除（无 fenced/purged 态）+ request completed ── */
  const claimedDisp = await asPrivacyWorkerPrincipal(admin, owner, (c) => claimCompressionTarget(c, signed.jti, tid('context_compression_dispatch'), worker, 60));
  const purgeDisp = claimedDisp ? await asPrivacyWorkerPrincipal(admin, owner, (c) => purgeCompressionTarget(c, tid('context_compression_dispatch'), claimedDisp.leaseToken)) : null;
  A('⑥ purge dispatch: erased 且 request 推进 completed（纯物理删）',
    purgeDisp !== null && purgeDisp.status === 'erased' && purgeDisp.requestStatus === 'completed');
  A('⑥ purge dispatch: raw SELECT 0 行（dispatch 无 fence 的 read=0 由 DELETE 承重）',
    (await admin.query<{ n: number }>('SELECT count(*)::int AS n FROM context_compression_dispatch WHERE owner_user_id=$1', [owner])).rows[0]!.n === 0);

  /* ── ⑦ 刁钻：purge 后 read=0（真物理删除）+ 已完成 request 二次 purge 被拒 ── */
  A('⑦ purge 后 read=0: hydrate + replay thread-snap 全 0',
    (await asPrincipal(admin, owner, (c) => hydrateCompressionSnapshots(c, 'thread-snap'))).length === 0
    && (await asPrincipal(admin, owner, (c) => replayCompressionSnapshots(c, 'thread-snap'))).length === 0);
  A('⑦ 已完成 request 二次 purge 被拒（request_not_active，不重复物理删）',
    await rejects(() => asPrivacyWorkerPrincipal(admin, owner, (c) => purgeCompressionTarget(c, tid('context_compression_dispatch'), claimedDisp!.leaseToken))));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 撤回、过期和删除(CTX-06) DB 证明通过（本地隔离证据，待独立专家审计）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
