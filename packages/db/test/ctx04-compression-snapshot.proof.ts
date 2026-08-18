/**
 * 可验证压缩快照（CTX-04）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明（七类矩阵）：
 *  - ① 正常：draft(status=draft,cas_version=1,first_kept_event_id 由 DB 派生=end+1) → activate
 *    (draft→active,CAS 1→2) → hydrate(仅 active) 端到端；source_range_digest 与 domain
 *    deriveSummaryRangeDigest 逐字节一致；summary_content_digest 与 deriveSummaryContentDigest
 *    （MEM-02 content_digest 同公式）逐字节一致。
 *  - ② 异常：span 越界 / content_digest 失配 / 来源范围未冻结(seq 越界) / 无保留边界(seq_end=最大)
 *    → 拒且不落半写；activate 非 draft / supersede 非 active → 静默落败(null)。
 *  - ③ 特殊：UTF-8 多字节 span 边界（字节偏移非 code-point）round-trip + 重放一致性（同 source
 *    range 同 digest → 同 firstKeptEventId + 同 source_range_digest）。
 *  - ④ 逃逸通道：cross-owner replay=0 泄 + memory_runtime raw SELECT FORCE RLS=0 + 原事件
 *    append-only（app_role raw UPDATE/DELETE conversation_event 被拒）+ app_role 无表写权限
 *    （raw INSERT status=active 被拒 → 模型输出只能经 draft 函数硬编码 'draft'）。
 *  - ⑤ 高并发：activate CAS 单赢家（同 expected_cas_version 并发只有一个赢，pool=max 真并发）。
 *  - ⑥ 复杂：activate 自动 supersede 精确同 (start,end) range 旧 active（非重叠区间；重叠不同 range
 *    可并存多 active，重叠区间协调归 CTX-05）+ 旧行保留(status=superseded 非原地 UPDATE)。
 *  - ⑦ 刁钻：状态机单向（raw UPDATE 非法回退被触发器拒）+ claim 无法回溯 → 零模型调用（backfill
 *    计数替身 0 调用，正对照证明丢弃路径真走且合法路径也零模型补全）。
 *
 * 铁律：不 log PII/全文；四原语复用不重实现（CAS/幂等键/RLS/memory_append_audit 有序日志）；
 * 原事件 append-only（本证明零 conversation_event 生产路径 UPDATE/DELETE）；待独立专家审计，
 * 本证明只产出本地隔离证据，不自称「完成/通过」。
 */
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  appendConversationEvent, type ConversationEventAppendReceipt,
  draftCompressionSnapshot, activateCompressionSnapshot, supersedeCompressionSnapshot,
  hydrateCompressionSnapshots, replayCompressionSnapshots,
  type Client, type DraftCompressionSnapshotInput,
} from '@meetwise/db';
import {
  COMPRESSION_SNAPSHOT_STATUSES, COMPRESSION_SNAPSHOT_LEGAL_TRANSITIONS,
  isLegalCompressionSnapshotTransition, deriveCompressionSnapshotSourceArtifactDigest,
  traceCompressionSnapshotClaims,
  deriveSummaryContentDigest, deriveSummaryRangeDigest, assertSummaryClaimSpan, canonicalSummaryClaimSpan,
  type SummaryClaim,
} from '@meetwise/domain';

const admin = createPool({ max: 40 });
const owner = `ctx04-owner-${process.pid}`;
const otherOwner = `ctx04-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

const utf8Len = (s: string) => new TextEncoder().encode(s).length;
const HASH64 = 'a'.repeat(64);

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@ctx04.test`, 'scrypt$salt$dk'],
  );
}

/** memory_runtime 原始 SQL（FORCE RLS，只看得见 owner=principal；用于 raw 状态跃迁/跨 owner 断言）。 */
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
  entries: Array<{ sequence: number; eventDigest: string }>;
  eventIdBySeq: (seq: number) => string;
  rangeDigest: (from: number, to: number) => string;
}

/** 为一个 owner/thread 建连续来源事件（1..N sequence），并派生原文/字节长/范围 digest + 事件 id 索引。 */
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
  const eventIdBySeq = (seq: number) => {
    const r = receipts.find((x) => x.sequence === seq);
    if (!r) throw new Error(`no event at seq ${seq}`);
    return r.eventId;
  };
  const rangeDigest = (from: number, to: number) => deriveSummaryRangeDigest({
    threadId, fromSequence: from, toSequence: to,
    entries: entries.filter((e) => e.sequence >= from && e.sequence <= to),
  });
  return {
    receipts, sourceText,
    firstBodyUtf8Len: utf8Len(bodies[0]!),
    sourceArtifactDigest: deriveCompressionSnapshotSourceArtifactDigest(sourceText),
    sourceUtf8ByteLength: utf8Len(sourceText),
    entries, eventIdBySeq, rangeDigest,
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
    // 默认 claim 指向首 body 的完整 span（[0, firstBodyUtf8Len]），恒落在 source 内。
    summaryClaims: [{ text: '用户准备分布式系统面试', span: { offsetKind: 'utf8_byte', start: 0, end: source.firstBodyUtf8Len } }],
    policyVersion: 'pol-v1', promptVersion: 'prompt-v1', modelVersion: 'qwen-plus', tokenizerVersion: 'tok-v1',
    ...overrides,
  };
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);

  /* ── A. 域常量 pin（显式 enum 非布尔汤）────────────────────────────── */
  A('域: status 枚举冻结 draft/active/superseded/fenced/purged',
    COMPRESSION_SNAPSHOT_STATUSES.join(',') === 'draft,active,superseded,fenced,purged');
  A('域: 状态机白名单长度=6（单向 6 条跃迁）',
    COMPRESSION_SNAPSHOT_LEGAL_TRANSITIONS.length === 6);
  A('域: 单向非法跃迁拒（draft→superseded / active→draft / purged→active / fenced→active）',
    isLegalCompressionSnapshotTransition('draft', 'superseded') === false
    && isLegalCompressionSnapshotTransition('active', 'draft') === false
    && isLegalCompressionSnapshotTransition('purged', 'active') === false
    && isLegalCompressionSnapshotTransition('fenced', 'active') === false);
  A('域: 合法跃迁通过（draft→active / active→superseded / fenced→purged）',
    isLegalCompressionSnapshotTransition('draft', 'active') === true
    && isLegalCompressionSnapshotTransition('active', 'superseded') === true
    && isLegalCompressionSnapshotTransition('fenced', 'purged') === true);
  A('域 span: offsetKind≠utf8_byte 拒',
    await rejects(() => { assertSummaryClaimSpan({ offsetKind: 'utf16' as never, start: 0, end: 3 }); return Promise.resolve(); }));
  A('域 span: canonical = utf8_byte:start:end',
    canonicalSummaryClaimSpan({ offsetKind: 'utf8_byte', start: 21, end: 36 }) === 'utf8_byte:21:36');

  /* ── ① 正常：draft→activate→hydrate 端到端 ─────────────────────────── */
  const srcA = await createSource(owner, 'thread-a', [
    '你好，我想准备分布式系统的面试。',
    '好的，我们先梳理分布式锁的核心。',
    'tool:search("分布式锁")',
    '分布式锁需要关注互斥、死锁和容错。',
  ]);
  const summaryContentA = '用户准备分布式系统面试，重点是分布式锁。';
  const s1 = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 2, summaryContentA, { idempotencyKey: 'ctx04-a-1' })));
  A('① draft: status=draft + cas_version=1 + replayed=false',
    s1.status === 'draft' && s1.casVersion === 1 && s1.replayed === false);
  A('① draft: first_kept_event_id 由 DB 派生 = source_event_seq_end+1 的事件（seq=3）',
    s1.firstKeptEventId === srcA.eventIdBySeq(3));
  A('① draft: source_range_digest 与 domain deriveSummaryRangeDigest 逐字节一致（TS↔SQL）',
    s1.sourceRangeDigest === srcA.rangeDigest(1, 2) && /^[a-f0-9]{64}$/.test(s1.sourceRangeDigest));
  A('① draft: summary_content_digest 与 deriveSummaryContentDigest（MEM-02 content_digest 同公式）逐字节一致',
    s1.summaryContentDigest === deriveSummaryContentDigest(summaryContentA));
  const s1Replay = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 2, summaryContentA, { idempotencyKey: 'ctx04-a-1' })));
  A('① 幂等: 同 idempotency_key 重放 → replayed=true + 同 id + 同 firstKeptEventId',
    s1Replay.replayed === true && s1Replay.id === s1.id && s1Replay.firstKeptEventId === s1.firstKeptEventId);
  const a1 = await asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, s1.id, 1));
  A('① activate: draft→active 成功且 cas_version 1→2',
    a1?.status === 'active' && a1.casVersion === 2);
  const hydratedA = await asPrincipal(admin, owner, (c) => hydrateCompressionSnapshots(c, 'thread-a'));
  A('① hydrate: 仅 1 条 active 且 firstKeptEventId/claims round-trip',
    hydratedA.length === 1 && hydratedA[0]!.id === s1.id && hydratedA[0]!.status === 'active'
    && hydratedA[0]!.firstKeptEventId === srcA.eventIdBySeq(3)
    && hydratedA[0]!.summaryClaims.length === 1 && hydratedA[0]!.casVersion === 2);

  /* ── ② 异常：非法输入 fail-closed + 非目标态静默落败 ───────────────── */
  A('② TS: summary content_digest 失配 拒（服务端重算，不采信自报指纹）',
    await rejects(() => asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 2, summaryContentA, { summaryContentDigest: 'f'.repeat(64) })))));
  A('② SQL: claim span end 越界 拒（end > source_utf8_byte_length → 丢弃摘要）',
    await rejects(() => asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 2, summaryContentA, {
      summaryClaims: [{ text: 'x', span: { offsetKind: 'utf8_byte', start: 0, end: 999999 } }],
    })))));
  A('② SQL: 来源范围未冻结(seq 越界) 拒（TS 通过、SQL fail-closed）',
    await rejects(() => asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 99, summaryContentA)))));
  A('② SQL: 无保留边界(seq_end=最大 seq，无 end+1 事件) 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 4, summaryContentA)))));
  // 不落半写：上述 4 次失败 draft 后该 thread 仍只有 s1 一条（0 半写行残留）。
  const countAfterRejects = await asPrincipal(admin, owner, (c) => replayCompressionSnapshots(c, 'thread-a'));
  A('② 不落半写: 失败 draft 后 replay 仍仅 1 条（无半写行残留）',
    countAfterRejects.length === 1);
  const s2draft = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 2, '另一条 draft', { idempotencyKey: 'ctx04-a-2' })));
  A('② activate 非 draft(已 active 的 s1 再 activate) → 静默落败 null',
    (await asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, s1.id, 2))) === null);
  A('② supersede 非 active(draft) → 静默落败 null',
    (await asPrincipal(admin, owner, (c) => supersedeCompressionSnapshot(c, s2draft.id, 1))) === null);

  /* ── ③ 特殊：UTF-8 多字节 span 边界 + 重放一致性 ───────────────────── */
  const focus = '分布式系统';
  const focusStart = utf8Len('你好，我想准备');
  const focusEnd = focusStart + utf8Len(focus);
  A('③ 字节语义: 中文 5 字符 = 15 字节（utf8_byte 非 UTF-16 code-point）',
    utf8Len(focus) === 15 && focus.length === 5);
  const s3 = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 2, summaryContentA, {
    idempotencyKey: 'ctx04-a-3',
    summaryClaims: [{ text: '用户准备分布式系统面试', span: { offsetKind: 'utf8_byte', start: focusStart, end: focusEnd } }],
  })));
  const replayed3 = await asPrincipal(admin, owner, (c) => replayCompressionSnapshots(c, 'thread-a')).then((rows) => rows.filter((r) => r.id === s3.id));
  A('③ 多字节 span round-trip: 字节边界 span 被接受且原样回读(span.start/end=字节偏移)',
    s3.status === 'draft' && replayed3.length === 1
    && replayed3[0]!.summaryClaims[0]!.span.start === focusStart && replayed3[0]!.summaryClaims[0]!.span.end === focusEnd);
  // 重放一致性：同 source range [1..2] 同 summary → 同 firstKeptEventId + 同 source_range_digest（不同 idempotency_key，两条独立行）。
  const s3b = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcA, 1, 2, summaryContentA, { idempotencyKey: 'ctx04-a-3b' })));
  A('③ 重放一致性: 同 source range 同 digest → 同 firstKeptEventId + 同 source_range_digest',
    s3b.id !== s3.id && s3b.firstKeptEventId === s3.firstKeptEventId && s3b.sourceRangeDigest === s3.sourceRangeDigest
    && s3b.firstKeptEventId === srcA.eventIdBySeq(3));

  /* ── ④ 逃逸通道：cross-owner=0 + 原事件 append-only + app_role 无表写权限 ── */
  const otherSummaryDigest = deriveSummaryContentDigest('别人的摘要');
  const srcOther = await createSource(otherOwner, 'thread-a', ['我自己的面试内容', '另一条内容']);
  await asPrincipal(admin, otherOwner, (c) => draftCompressionSnapshot(c, draftInput('thread-a', srcOther, 1, 1, '别人的摘要', { idempotencyKey: 'ctx04-other-1' })));
  const ownerReplay = await asPrincipal(admin, owner, (c) => replayCompressionSnapshots(c, 'thread-a'));
  const otherReplay = await asPrincipal(admin, otherOwner, (c) => replayCompressionSnapshots(c, 'thread-a'));
  A('④ 跨 owner: owner replay thread-a 不泄 otherOwner 摘要（RLS 隔离）',
    ownerReplay.length >= 1 && ownerReplay.every((r) => r.summaryContentDigest !== otherSummaryDigest));
  A('④ 跨 owner: otherOwner replay thread-a 只见自己 1 条摘要',
    otherReplay.length === 1 && otherReplay.every((r) => r.summaryContentDigest === otherSummaryDigest));
  A('④ 跨 owner: memory_runtime raw SELECT 直查 owner 快照表 = 0 行可见（FORCE RLS）',
    (await rawAsMemoryRuntime(otherOwner, (c) => c.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM context_compression_snapshot WHERE owner_user_id=$1', [owner]))).rows[0]!.n === 0);
  // 原事件 append-only：app_role 对 conversation_event 无 UPDATE/DELETE（0108 REVOKE ALL）。
  A('④ 原事件 append-only: app_role raw UPDATE conversation_event 被拒',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      'UPDATE conversation_event SET event_digest=$1 WHERE id=$2', [HASH64, srcA.receipts[0]!.eventId]))));
  A('④ 原事件 append-only: app_role raw DELETE FROM conversation_event 被拒',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      'DELETE FROM conversation_event WHERE id=$1', [srcA.receipts[0]!.eventId]))));
  // app_role 对快照表 REVOKE ALL：模型输出只能经 draft 函数（SQL 硬编码 status='draft'），无法 forge active。
  A('④ 无 forge active: app_role raw INSERT status=active 被拒（仅 draft 函数可写）',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      `INSERT INTO context_compression_snapshot(id, owner_user_id, thread_id, source_event_seq_start, source_event_seq_end, source_range_digest, source_artifact_digest, source_utf8_byte_length, policy_version, prompt_version, model_version, tokenizer_version, summary_content_digest, summary_claims, first_kept_event_id, status)
       VALUES (gen_random_uuid(), $1, 'thread-escape', 1, 1, $2, $2, 3, 'p','p','m','t', $2, '[]'::jsonb, $3, 'active')`,
      [owner, HASH64, srcA.receipts[0]!.eventId]))));

  /* ── ⑤ 高并发：activate CAS 单赢家（pool=max 真并发）───────────────── */
  const srcCas = await createSource(owner, 'thread-cas', ['并发摘要来源', '第二条', '第三条']);
  const sCas = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-cas', srcCas, 1, 1, '并发摘要内容')));
  const [casWin, casLose] = await Promise.all([
    asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, sCas.id, 1)),
    asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, sCas.id, 1)),
  ]);
  A('⑤ CAS 并发: 同 expected_cas_version=1 并发 activate 只有一个赢家(cas_version 2)',
    (casWin !== null) !== (casLose !== null) && (casWin?.casVersion ?? casLose?.casVersion) === 2);
  A('⑤ CAS 陈旧 version: 已到 cas_version=2 再传 1 落败返回 null（乐观并发失配）',
    (await asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, sCas.id, 1))) === null);

  /* ── ⑥ 复杂：activate 自动 supersede 精确同 (start,end) range 旧 active + 旧行保留（重叠不同 range 并存，重叠协调归 CTX-05） ──── */
  const srcSup = await createSource(owner, 'thread-supersede', ['版本一：分布式锁', '版本二：共识协议', '版本三：Raft']);
  const sv1 = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-supersede', srcSup, 1, 1, '版本一摘要', { idempotencyKey: 'sup-v1' })));
  await asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, sv1.id, 1));
  const sv2 = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-supersede', srcSup, 1, 1, '版本二摘要', { idempotencyKey: 'sup-v2' })));
  await asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, sv2.id, 1));
  const v1After = (await admin.query<{ status: string; cas_version: string }>(
    'SELECT status, cas_version FROM context_compression_snapshot WHERE id=$1', [sv1.id])).rows[0]!;
  const v2After = (await admin.query<{ status: string; cas_version: string }>(
    'SELECT status, cas_version FROM context_compression_snapshot WHERE id=$1', [sv2.id])).rows[0]!;
  A('⑥ activate 自动 supersede: 同 range 旧 active(sv1) → superseded，新(sv2) → active',
    v1After.status === 'superseded' && v2After.status === 'active');
  const hydSup = await asPrincipal(admin, owner, (c) => hydrateCompressionSnapshots(c, 'thread-supersede'));
  const repSup = await asPrincipal(admin, owner, (c) => replayCompressionSnapshots(c, 'thread-supersede'));
  A('⑥ 单 active: hydrate 只回 active 新版本(1 条)，replay 回旧+新(2 条)',
    hydSup.length === 1 && hydSup[0]!.id === sv2.id
    && repSup.length === 2 && repSup.map((r) => r.status).sort().join(',') === 'active,superseded');

  /* ── ⑦ 刁钻：状态机单向（raw 非法跃迁拒）+ claim 无法回溯 → 零模型调用 ── */
  const srcTm = await createSource(owner, 'thread-state', ['状态机来源', '第二条']);
  const sTm = await asPrincipal(admin, owner, (c) => draftCompressionSnapshot(c, draftInput('thread-state', srcTm, 1, 1, '状态机摘要')));
  await asPrincipal(admin, owner, (c) => activateCompressionSnapshot(c, sTm.id, 1));
  A('⑦ 状态机单向: raw UPDATE active→draft 被触发器拒（非法回退）',
    await rejects(() => rawAsMemoryRuntime(owner, (c) => c.query(
      'UPDATE context_compression_snapshot SET status=$1 WHERE id=$2', ['draft', sTm.id]))));
  A('⑦ 状态机单向: raw UPDATE active→purged 被触发器拒（active 只能 superseded/fenced）',
    await rejects(() => rawAsMemoryRuntime(owner, (c) => c.query(
      'UPDATE context_compression_snapshot SET status=$1 WHERE id=$2', ['purged', sTm.id]))));
  // 零模型调用：伪造 claim（span 越界 / digest 失配）→ 丢弃且 backfill 计数 0；合法路径也 0。
  let modelCalls = 0;
  const backfill = () => { modelCalls++; return 'forged-completion'; };
  const forgedOutOfBounds = traceCompressionSnapshotClaims({
    sourceText: srcA.sourceText,
    sourceArtifactDigest: srcA.sourceArtifactDigest,
    sourceUtf8ByteLength: srcA.sourceUtf8ByteLength,
    claims: [{ text: 'x', span: { offsetKind: 'utf8_byte', start: 0, end: 999999 } }],
    backfill,
  });
  A('⑦ claim 无法回溯(span 越界) → traceable=false 且丢弃该 claim',
    forgedOutOfBounds.traceable === false && forgedOutOfBounds.droppedClaimIndices.length === 1
    && forgedOutOfBounds.reason === 'claim_span_out_of_bounds');
  const forgedDigest = traceCompressionSnapshotClaims({
    sourceText: srcA.sourceText,
    sourceArtifactDigest: 'f'.repeat(64),
    sourceUtf8ByteLength: srcA.sourceUtf8ByteLength,
    claims: [{ text: 'x', span: { offsetKind: 'utf8_byte', start: 0, end: 3 } }],
    backfill,
  });
  A('⑦ claim 无法回溯(digest 逐字节失配) → traceable=false 丢弃摘要',
    forgedDigest.traceable === false && forgedDigest.reason === 'source_digest_mismatch');
  // 负测（补 reason 4 态中唯一未覆盖的 source_length_mismatch）：调用方自报 sourceUtf8ByteLength
  // 与真实源文本字节长失配（digest 匹配、长度失配）→ 走长度失配分支，整条摘要 traceable=false。
  const forgedLength = traceCompressionSnapshotClaims({
    sourceText: srcA.sourceText,
    sourceArtifactDigest: srcA.sourceArtifactDigest,
    sourceUtf8ByteLength: srcA.sourceUtf8ByteLength + 1,
    claims: [{ text: 'x', span: { offsetKind: 'utf8_byte', start: 0, end: 3 } }],
    backfill,
  });
  A('⑦ claim 无法回溯(source_utf8_byte_length 失配) → traceable=false 丢弃摘要',
    forgedLength.traceable === false && forgedLength.droppedClaimIndices.length === 0
    && forgedLength.reason === 'source_length_mismatch');
  const validTrace = traceCompressionSnapshotClaims({
    sourceText: srcA.sourceText,
    sourceArtifactDigest: srcA.sourceArtifactDigest,
    sourceUtf8ByteLength: srcA.sourceUtf8ByteLength,
    claims: [{ text: 'x', span: { offsetKind: 'utf8_byte', start: 0, end: 3 } }],
    backfill,
  });
  A('⑦ 正对照: 合法 claim 回溯通过 traceable=true',
    validTrace.traceable === true && validTrace.droppedClaimIndices.length === 0);
  A('⑦ 零模型调用: 伪造 claim 丢弃路径 + 合法路径 backfill 均为 0 次（绝不 call 模型补全）',
    modelCalls === 0);

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 可验证压缩快照(CTX-04) DB 证明通过（本地隔离证据，待独立专家审计）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
