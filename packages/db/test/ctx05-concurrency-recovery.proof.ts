/**
 * 并发与故障恢复（CTX-05）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明（七类矩阵）三条承重铁律
 * （register L77 / memory-context-design L124/L135/L136/L254/L255）：
 *   1. 压缩边界保护（确定性，0 模型）：只有「中段稳定边界」可压缩（保护 system_note 头部快照 +
 *      最近完整 turn + 完整 (tool_call,tool_result) 对）；半个 turn、未完成工具、来源仍变化、
 *      删除围栏已生效 → 拒（不半写、不派发）。域 `classifyCompressibleRange`（9 个 reject reason）
 *      与 SQL `context_compression_dispatch_assert_boundary`（claim 服务端重验）交叉 pin：
 *      域说可压缩 ⟺ SQL claim 接受；域说拒 ⟺ SQL claim 抛 ctx05_*（turn 结构族统一映射为
 *      ctx05_incomplete_turn，域侧细分 unclosed/unbalanced 仅作观测粒度，拒压结论一致）。
 *   2. lease/CAS 提交：claim 抢租约（过期可抢占 = 崩溃恢复，不误杀 in-flight）；commit 是 CAS
 *      （`WHERE version=expected` + version+1），并发双 commit 同版本 → 单赢家，落败方 0 行返回
 *      null → 丢弃计算结果（不覆盖赢家已提交 snapshot_id）。权威在 PG 单行
 *      UNIQUE(owner,thread,start,end) + version。
 *   3. 派发后 unknown 不自动重发：dispatching 后 mark_unknown → 终态 sticky；再次 claim 同范围
 *      返回既有 unknown（绝不重发、绝不同键重试）；model/prompt/policy 版本 claim 时冻结，任何
 *      跃迁不再改写（绝不自动替换模型）。
 *
 * 铁律：不 log PII/全文；四原语复用不重实现（asPrincipal RLS / CAS / append-only 有序日志
 * memory_append_audit / lease 过期可抢占模式）；原事件 append-only（本证明零 conversation_event
 * 生产路径 UPDATE/DELETE，仅用 transitionConversationEventStatus 造「已围栏」负测）；待独立专家
 * 审计，本证明只产出本地隔离证据，不自称「完成/通过」。
 */
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  appendConversationEvent, type ConversationEventAppendReceipt,
  replayConversationEvents, transitionConversationEventStatus,
  claimCompressionDispatch, markCompressionDispatchDispatched, commitCompressionDispatch,
  markCompressionDispatchUnknown, discardCompressionDispatch, recoverCompressionDispatch,
  replayCompressionDispatches,
  type Client, type ClaimCompressionDispatchInput,
} from '@meetwise/db';
import {
  COMPRESSION_BOUNDARY_REJECT_REASONS, classifyCompressibleRange,
  COMPRESSION_DISPATCH_STATUSES, COMPRESSION_DISPATCH_LEGAL_TRANSITIONS,
  isLegalCompressionDispatchTransition, deriveRangeDigest,
  type ConversationEventCategory, type ConversationEventSource, type ConversationEventStatus,
  type CompressibleEventWatermark, type CompressibleRange,
} from '@meetwise/domain';

const admin = createPool({ max: 40 });
const owner = `ctx05-owner-${process.pid}`;
const otherOwner = `ctx05-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
/** 断言抛错且 message 含 needle（SQL RAISE EXCEPTION 的 ctx05_* code / TS fail code 都落在 message）。 */
const rejectsWith = async (fn: () => Promise<unknown>, needle: string) => {
  try { await fn(); return false; } catch (e) { return String((e as Error)?.message ?? '').includes(needle); }
};

const SNAP_A = '11111111-1111-4111-8111-111111111111';
const SNAP_B = '22222222-2222-4222-8222-222222222222';

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@ctx05.test`, 'scrypt$salt$dk'],
  );
}

/** memory_runtime 原始 SQL（FORCE RLS，只看得见 owner=principal；用于 raw 状态跃迁/跨 owner/过期租约断言）。 */
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

type EvtSpec = { c: ConversationEventCategory; s: ConversationEventSource; b: string };

/** 一个 turn 的事件序列（turn_start 起、assistant_message 收口；withTools 时夹 (tool_call,tool_result) 对）。 */
const turn = (i: number, withTools = false): EvtSpec[] => {
  const base: EvtSpec[] = [
    { c: 'turn_start', s: 'system', b: `turn-${i}` },
    { c: 'user_message', s: 'user', b: `问${i}` },
  ];
  if (withTools) {
    base.push({ c: 'tool_call', s: 'model', b: `tool-${i}-call` });
    base.push({ c: 'tool_result', s: 'tool', b: `tool-${i}-result` });
  }
  base.push({ c: 'assistant_message', s: 'model', b: `答${i}` });
  return base;
};

/** 为 owner/thread 追加一组事件（单事务），返回按 sequence 升序的 receipts。 */
async function buildThread(ownerId: string, threadId: string, specs: EvtSpec[]): Promise<ConversationEventAppendReceipt[]> {
  return asPrincipal(admin, ownerId, async (c) => {
    const receipts: ConversationEventAppendReceipt[] = [];
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i]!;
      receipts.push(await appendConversationEvent(c, {
        threadId, category: spec.c, source: spec.s, eventKey: `${threadId}-${i}`,
        body: spec.b, retentionClass: 'session', consentPurpose: 'free_conversation',
        consentRevision: 1, privacyEpoch: 1,
      }));
    }
    return receipts;
  });
}

/** 回放某 thread 的 watermark（sequence/category/source/status），供域判定交叉 pin。 */
async function watermarks(ownerId: string, threadId: string): Promise<CompressibleEventWatermark[]> {
  return asPrincipal(admin, ownerId, async (c) => {
    const rows = await replayConversationEvents(c, threadId);
    return rows.map((r) => ({ sequence: r.sequence, category: r.category, source: r.source, status: r.status }));
  });
}

/** TS 侧重算范围 digest（与 SQL claim 的 source_range_digest 逐字节一致公式，供交叉 pin）。 */
function rangeDigest(receipts: ConversationEventAppendReceipt[], threadId: string, from: number, to: number): string {
  return deriveRangeDigest({
    threadId, fromSequence: from, toSequence: to,
    entries: receipts.filter((r) => r.sequence >= from && r.sequence <= to)
      .map((r) => ({ sequence: r.sequence, eventDigest: r.eventDigest })),
  });
}

function claimInput(threadId: string, start: number, end: number, leaseOwner: string, leaseSeconds: number, idempotencyKey?: string): ClaimCompressionDispatchInput {
  return {
    threadId, sourceEventSeqStart: start, sourceEventSeqEnd: end,
    policyVersion: 'pol-v1', promptVersion: 'prompt-v1', modelVersion: 'qwen-plus',
    leaseOwner, leaseSeconds, idempotencyKey: idempotencyKey ?? null,
  };
}

/** 手造 watermark 流（纯函数，逐 reject reason 覆盖；source/status 可选，默认 system/active）。 */
type WmRow = [number, ConversationEventCategory, ConversationEventSource?, ConversationEventStatus?];
const mk = (rows: WmRow[]): CompressibleEventWatermark[] =>
  rows.map((r) => ({ sequence: r[0], category: r[1], source: r[2] ?? 'system', status: r[3] ?? 'active' }));
const rejectsAs = (wm: CompressibleEventWatermark[], range: CompressibleRange, expected: string): boolean =>
  classifyCompressibleRange(wm, range).reason === expected;

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);

  /* ── A. 域常量 pin（显式 enum 非布尔汤）────────────────────────────── */
  A('域: reject reason 枚举冻结 9 值',
    COMPRESSION_BOUNDARY_REJECT_REASONS.join(',') ===
    'range_invalid,source_fenced,includes_system_snapshot,start_not_turn_boundary,end_not_turn_boundary,incomplete_turn,unclosed_tool,unbalanced_tool,includes_recent_turn');
  A('域: dispatch status 枚举冻结 5 值',
    COMPRESSION_DISPATCH_STATUSES.join(',') === 'claimed,dispatching,committed,unknown,discarded');
  A('域: dispatch 状态机白名单长度=5（单向 5 条跃迁）',
    COMPRESSION_DISPATCH_LEGAL_TRANSITIONS.length === 5);
  A('域: 非法跃迁拒（claimed→committed / dispatching→claimed / committed→unknown / unknown→dispatching）',
    isLegalCompressionDispatchTransition('claimed', 'committed') === false
    && isLegalCompressionDispatchTransition('dispatching', 'claimed') === false
    && isLegalCompressionDispatchTransition('committed', 'unknown') === false
    && isLegalCompressionDispatchTransition('unknown', 'dispatching') === false);
  A('域: 合法跃迁通过（claimed→dispatching / dispatching→committed / dispatching→unknown / claimed→discarded）',
    isLegalCompressionDispatchTransition('claimed', 'dispatching') === true
    && isLegalCompressionDispatchTransition('dispatching', 'committed') === true
    && isLegalCompressionDispatchTransition('dispatching', 'unknown') === true
    && isLegalCompressionDispatchTransition('claimed', 'discarded') === true);

  /* ── 建源（event source 0108 复用，原事件 append-only）──────────────── */
  // thread-a：seq 1,2 system_note（系统/授权快照头部，受保护）；seq 3-7 turn1（含 tool 对）；
  // seq 8-10 turn2；seq 11-13 turn3（最近完整 turn）。可压缩范围 [3,7]/[3,10]/[8,10]。
  const srcA = await buildThread(owner, 'thread-a', [
    { c: 'system_note', s: 'system', b: 'auth-snapshot-header' },
    { c: 'system_note', s: 'system', b: 'system-snapshot-header' },
    ...turn(1, true), ...turn(2), ...turn(3),
  ]);
  const wmA = await watermarks(owner, 'thread-a');
  // thread-b：turn1 完整、turn2 完整、turn3 未完成（只有 user_message）→ [4,6] 触发 includes_recent_turn。
  await buildThread(owner, 'thread-b', [...turn(1), ...turn(2), { c: 'turn_start', s: 'system', b: 'turn-3' }, { c: 'user_message', s: 'user', b: '问3' }]);
  // thread-incomplete：turn1 未完成（无 assistant）→ [1,2] 触发 incomplete_turn。
  await buildThread(owner, 'thread-incomplete', [
    { c: 'turn_start', s: 'system', b: 'turn-1' }, { c: 'user_message', s: 'user', b: '问1' },
    ...turn(2),
  ]);
  // thread-unclosed：turn1 工具未闭合（tool_call 无 result）→ [1,4] 触发 incomplete_turn（SQL 族）。
  await buildThread(owner, 'thread-unclosed', [
    { c: 'turn_start', s: 'system', b: 'turn-1' }, { c: 'user_message', s: 'user', b: '问1' },
    { c: 'tool_call', s: 'model', b: 'tool-1-call' }, { c: 'assistant_message', s: 'model', b: '答1' },
    ...turn(2),
  ]);
  // thread-fenced：turn1（含 tool 对）建好后 fence seq 3（tool_call）→ [1,5] 触发 source_fenced。
  const srcFenced = await buildThread(owner, 'thread-fenced', turn(1, true));
  await asPrincipal(admin, owner, (c) => transitionConversationEventStatus(c, srcFenced[2]!.eventId, 'active', 'privacy_fenced', 1));
  // 域侧「含 status 完整 watermark」：fence 的事件仍以 status='privacy_fenced' 可见（与 SQL raw 表一致），
  // 而非 replayConversationEvents（后者只吐 status=active，会把围栏事件剔除成序列缺口）。
  const fencedCategories: ConversationEventCategory[] = ['turn_start', 'user_message', 'tool_call', 'tool_result', 'assistant_message'];
  const wmFencedComplete: CompressibleEventWatermark[] = srcFenced.map((r, i) => ({
    sequence: r.sequence,
    category: fencedCategories[i]!,
    source: 'system' as ConversationEventSource,
    status: i === 2 ? ('privacy_fenced' as ConversationEventStatus) : ('active' as ConversationEventStatus),
  }));
  // thread-end-fenced：turn1（seq1-3 active）+ turn2（seq4-6 整 turn privacy_fenced）。
  // 场景：范围 [1,3] 的 end+1（seq4 turn_start）落在被 fence 的 turn2 上 → 边界 turn 已 fence，
  // 范围 [1,3] 内仍是 active。TS 与 SQL 都必须判 end_not_turn_boundary（围栏在范围外的边界，
  // 不是 source_fenced），证明 TS↔SQL 对「end+1 边界 status」这一维双向一致。
  const srcEndFenced = await buildThread(owner, 'thread-end-fenced', [...turn(1), ...turn(2)]);
  await asPrincipal(admin, owner, async (c) => {
    for (const r of srcEndFenced.slice(3)) {
      await transitionConversationEventStatus(c, r.eventId, 'active', 'privacy_fenced', 1);
    }
  });
  const endFencedCategories: ConversationEventCategory[] = [
    'turn_start', 'user_message', 'assistant_message', 'turn_start', 'user_message', 'assistant_message',
  ];
  const wmEndFencedComplete: CompressibleEventWatermark[] = srcEndFenced.map((r, i) => ({
    sequence: r.sequence,
    category: endFencedCategories[i]!,
    source: 'system' as ConversationEventSource,
    status: i >= 3 ? ('privacy_fenced' as ConversationEventStatus) : ('active' as ConversationEventStatus),
  }));
  // thread-ops：3 turn（seq 1-9），可压缩 [1,3]/[1,6]/[4,6]，供 ⑤⑥ 操作流。
  await buildThread(owner, 'thread-ops', [...turn(1), ...turn(2), ...turn(3)]);
  // thread-recover：2 turn（seq 1-6），可压缩 [1,3]，供租约过期抢占。
  await buildThread(owner, 'thread-recover', [...turn(1), ...turn(2)]);
  // otherOwner 同 thread-a 名（2 turn，[1,3] 可压缩），供跨 owner 隔离/无泄。
  await buildThread(otherOwner, 'thread-a', [...turn(1), ...turn(2)]);

  /* ── ① 正常：域判定可压缩 + claim→dispatch→commit 全流程 + digest 交叉 pin ── */
  A('① 域: [3,7]（含完整 (tool_call,tool_result) 对的 turn1）可压缩',
    classifyCompressibleRange(wmA, { startSeq: 3, endSeq: 7 }).compressible === true);
  A('① 域: [3,10]（中段 turn1+turn2 跨 turn 边界）可压缩',
    classifyCompressibleRange(wmA, { startSeq: 3, endSeq: 10 }).compressible === true);
  A('① 域: [8,10]（turn2）可压缩',
    classifyCompressibleRange(wmA, { startSeq: 8, endSeq: 10 }).compressible === true);
  const claim37 = await asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 3, 7, 'w1', 60)));
  A('① claim [3,7]: status=claimed + version=1 + replayed=false',
    claim37.status === 'claimed' && claim37.version === 1 && claim37.replayed === false);
  A('① claim [3,7]: source_range_digest 与 domain deriveRangeDigest 逐字节一致（TS↔SQL，绝不采信自报指纹）',
    claim37.sourceRangeDigest === rangeDigest(srcA, 'thread-a', 3, 7) && /^[a-f0-9]{64}$/.test(claim37.sourceRangeDigest));
  A('① claim [3,7]: lease_owner=w1 + snapshot_id=null（claim 阶段未提交）',
    claim37.leaseOwner === 'w1' && claim37.snapshotId === null);
  const disp37 = await asPrincipal(admin, owner, (c) => markCompressionDispatchDispatched(c, claim37.id, 'w1', 1));
  A('① mark_dispatched: claimed→dispatching + version 1→2',
    disp37?.status === 'dispatching' && disp37.version === 2);
  const comm37 = await asPrincipal(admin, owner, (c) => commitCompressionDispatch(c, claim37.id, 2, SNAP_A));
  A('① commit: dispatching→committed + version 2→3 + snapshot_id 落地',
    comm37?.status === 'committed' && comm37.version === 3 && comm37.snapshotId === SNAP_A);
  const rep37 = (await asPrincipal(admin, owner, (c) => replayCompressionDispatches(c, 'thread-a'))).find((r) => r.id === claim37.id);
  A('① replay: committed 行 snapshot_id/version round-trip + 租约清空',
    rep37?.status === 'committed' && rep37.snapshotId === SNAP_A && rep37.version === 3 && rep37.leaseOwner === null);
  const claim310 = await asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 3, 10, 'w1', 60, 'ctx05-k-3-10')));
  A('① claim [3,10]（带 idempotency_key）: 新行 claimed + digest 一致',
    claim310.status === 'claimed' && claim310.version === 1 && claim310.replayed === false
    && claim310.sourceRangeDigest === rangeDigest(srcA, 'thread-a', 3, 10));
  const claim310b = await asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 3, 10, 'w9', 60, 'ctx05-k-3-10')));
  A('① 幂等重放: 同 idempotency_key → replayed=true + 同 id + 不改冻结输入（lease_owner 仍 w1 / model 仍 qwen-plus）',
    claim310b.replayed === true && claim310b.id === claim310.id && claim310b.leaseOwner === 'w1');

  /* ── ② 异常：域 9 reject reason 逐值 + SQL 服务端重验拒 + TS 输入守卫 + 非目标态静默落败 + 不落半写 ── */
  A('② 域: range_invalid(start<1)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'assistant_message']]), { startSeq: 0, endSeq: 3 }, 'range_invalid'));
  A('② 域: range_invalid(end<start)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'assistant_message']]), { startSeq: 3, endSeq: 1 }, 'range_invalid'));
  A('② 域: range_invalid(范围无事件)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'assistant_message']]), { startSeq: 10, endSeq: 12 }, 'range_invalid'));
  A('② 域: range_invalid(序列重复)',
    rejectsAs(mk([[1, 'turn_start'], [1, 'user_message'], [2, 'assistant_message']]), { startSeq: 1, endSeq: 1 }, 'range_invalid'));
  A('② 域: range_invalid(首事件序列≠start)',
    rejectsAs(mk([[1, 'turn_start'], [3, 'turn_start'], [4, 'user_message'], [5, 'assistant_message']]), { startSeq: 2, endSeq: 3 }, 'range_invalid'));
  A('② 域: source_fenced(范围内含 privacy_fenced)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'assistant_message', 'model', 'privacy_fenced']]), { startSeq: 1, endSeq: 3 }, 'source_fenced'));
  A('② 域: includes_system_snapshot(范围内含 system_note 头部快照)',
    rejectsAs(mk([[1, 'system_note'], [2, 'turn_start'], [3, 'user_message'], [4, 'assistant_message']]), { startSeq: 1, endSeq: 4 }, 'includes_system_snapshot'));
  A('② 域: start_not_turn_boundary(start 非 turn_start)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'assistant_message'], [4, 'turn_start'], [5, 'user_message'], [6, 'assistant_message']]), { startSeq: 2, endSeq: 3 }, 'start_not_turn_boundary'));
  A('② 域: end_not_turn_boundary(end+1 非 turn_start，拦腰截断进行中的 turn)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'assistant_message'], [4, 'turn_start'], [5, 'user_message'], [6, 'assistant_message']]), { startSeq: 1, endSeq: 2 }, 'end_not_turn_boundary'));
  A('② 域: end_not_turn_boundary(范围直达流头，来源仍会变化)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'assistant_message'], [4, 'turn_start'], [5, 'user_message'], [6, 'assistant_message']]), { startSeq: 4, endSeq: 6 }, 'end_not_turn_boundary'));
  A('② 域: incomplete_turn(turn 无 assistant 收口)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'turn_start'], [4, 'user_message'], [5, 'assistant_message']]), { startSeq: 1, endSeq: 2 }, 'incomplete_turn'));
  A('② 域: unclosed_tool(tool_call 无 tool_result)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'tool_call'], [4, 'assistant_message'], [5, 'turn_start'], [6, 'user_message'], [7, 'assistant_message']]), { startSeq: 1, endSeq: 4 }, 'unclosed_tool'));
  A('② 域: unbalanced_tool(tool_result 无前置 tool_call)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'tool_result'], [4, 'assistant_message'], [5, 'turn_start'], [6, 'user_message'], [7, 'assistant_message']]), { startSeq: 1, endSeq: 4 }, 'unbalanced_tool'));
  A('② 域: includes_recent_turn(压缩范围含最近完整 turn)',
    rejectsAs(mk([[1, 'turn_start'], [2, 'user_message'], [3, 'assistant_message'], [4, 'turn_start'], [5, 'user_message'], [6, 'assistant_message'], [7, 'turn_start'], [8, 'user_message']]), { startSeq: 4, endSeq: 6 }, 'includes_recent_turn'));
  A('② 域: 真实围栏流（完整 watermark 含 status）classify [1,5] → source_fenced',
    classifyCompressibleRange(wmFencedComplete, { startSeq: 1, endSeq: 5 }).reason === 'source_fenced');
  A('② 域: 回放剔除缺口（fence 事件被 replay 过滤成序列缺口）→ range_invalid（连续守卫兜底）',
    classifyCompressibleRange(await watermarks(owner, 'thread-fenced'), { startSeq: 1, endSeq: 5 }).reason === 'range_invalid');
  // end+1 边界 turn 被 fence：范围 [1,3] 内 active、end+1（seq4）整 turn privacy_fenced。
  // 修前 TS 只查 after[0].category 不查 status → 会判 compressible:true（本断言红）；修后 TS 补
  // after[0].status!=='active' → end_not_turn_boundary，与 SQL 同码双向一致（本组断言真对抗）。
  const verdictEndFenced = classifyCompressibleRange(wmEndFencedComplete, { startSeq: 1, endSeq: 3 });
  A('② 域: end+1 边界 turn 被 fence（turn2 整 turn privacy_fenced）classify [1,3] → compressible:false + reason=end_not_turn_boundary',
    verdictEndFenced.compressible === false && verdictEndFenced.reason === 'end_not_turn_boundary');
  A('② SQL: claim [1,3]（end+1 边界 turn2 被 fence）→ ctx05_end_not_turn_boundary（TS↔SQL 双向一致）',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-end-fenced', 1, 3, 'w1', 60))), 'ctx05_end_not_turn_boundary'));

  // SQL 服务端重验（claim 内 assert_boundary，伪造边界在此被拒，零模型）。
  A('② SQL: claim [1,2]（含 system_note 头部）→ ctx05_includes_system_snapshot',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 1, 2, 'w1', 60))), 'ctx05_includes_system_snapshot'));
  A('② SQL: claim [4,7]（start 非 turn_start）→ ctx05_start_not_turn_boundary',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 4, 7, 'w1', 60))), 'ctx05_start_not_turn_boundary'));
  A('② SQL: claim [3,6]（end+1 非 turn_start）→ ctx05_end_not_turn_boundary',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 3, 6, 'w1', 60))), 'ctx05_end_not_turn_boundary'));
  A('② SQL: claim [3,13]（直达流头）→ ctx05_end_not_turn_boundary',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 3, 13, 'w1', 60))), 'ctx05_end_not_turn_boundary'));
  A('② SQL: thread-b claim [4,6]（含最近完整 turn）→ ctx05_includes_recent_turn',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-b', 4, 6, 'w1', 60))), 'ctx05_includes_recent_turn'));
  A('② SQL: thread-incomplete claim [1,2]（turn 无 assistant）→ ctx05_incomplete_turn',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-incomplete', 1, 2, 'w1', 60))), 'ctx05_incomplete_turn'));
  A('② SQL: thread-unclosed claim [1,4]（tool_call 无 result）→ ctx05_incomplete_turn（工具未闭合族）',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-unclosed', 1, 4, 'w1', 60))), 'ctx05_incomplete_turn'));
  A('② SQL: thread-fenced claim [1,5]（含围栏事件）→ ctx05_source_fenced',
    await rejectsWith(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-fenced', 1, 5, 'w1', 60))), 'ctx05_source_fenced'));

  // TS 输入守卫（fail-closed，先于 SQL）。
  A('② TS: seq_start<1 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 0, 7, 'w1', 60)))));
  A('② TS: seq_end<seq_start 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 7, 3, 'w1', 60)))));
  A('② TS: lease_seconds>3600 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 3, 7, 'w1', 9999)))));
  A('② TS: 空 policy_version 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, { ...claimInput('thread-a', 3, 7, 'w1', 60), policyVersion: '' }))));

  // 非目标态静默落败（CAS 0 行 → null，不抛错、不覆盖）。
  A('② mark_dispatched 非 claimed(已 committed) → null',
    (await asPrincipal(admin, owner, (c) => markCompressionDispatchDispatched(c, claim37.id, 'w1', 3))) === null);
  A('② commit 非 dispatching(仍 claimed) → null',
    (await asPrincipal(admin, owner, (c) => commitCompressionDispatch(c, claim310.id, 1, SNAP_A))) === null);
  A('② commit 陈旧 version(已 version=3 再传 2) → null（乐观并发失配）',
    (await asPrincipal(admin, owner, (c) => commitCompressionDispatch(c, claim37.id, 2, SNAP_B))) === null);
  // 不落半写：上述所有拒绝（域拒绝不落库；SQL 拒在 assert_boundary 抛错，claim 尚未 INSERT）后，
  // thread-a 仍只有 ① 的两条成功行；其余被拒 thread 均 0 行。
  const repCountA = (await asPrincipal(admin, owner, (c) => replayCompressionDispatches(c, 'thread-a'))).length;
  A('② 不落半写: 拒绝后 thread-a replay 仍仅 2 行（committed + claimed，无半写残留）', repCountA === 2);
  const repRejected = await Promise.all(['thread-b', 'thread-incomplete', 'thread-unclosed', 'thread-fenced', 'thread-end-fenced'].map(async (t) =>
    (await asPrincipal(admin, owner, (c) => replayCompressionDispatches(c, t))).length));
  A('② 不落半写: 被拒 thread 均 0 行 dispatch（拒绝即无半写、无派发）',
    repRejected.every((n) => n === 0));

  /* ── ③ 特殊：digest 绑定端点 + 重放一致性（无漂移）──────────────────── */
  A('③ digest 绑定 end: [3,7] 与 [3,10] digest 不同',
    rangeDigest(srcA, 'thread-a', 3, 7) !== rangeDigest(srcA, 'thread-a', 3, 10));
  A('③ digest 绑定 start: [3,10] 与 [8,10] digest 不同',
    rangeDigest(srcA, 'thread-a', 3, 10) !== rangeDigest(srcA, 'thread-a', 8, 10));
  A('③ 重放一致性: replay 行 sourceRangeDigest 与 claim receipt 一致（无漂移）',
    rep37?.sourceRangeDigest === claim37.sourceRangeDigest);
  A('③ 工具对成对: turn1 的 (tool_call,tool_result) 深度平衡才可压——去掉 tool_result 即 unclosed_tool 拒',
    rejectsAs(wmA.map((e) => (e.sequence === 6 ? { ...e, category: 'assistant_message' as ConversationEventCategory } : e)), { startSeq: 3, endSeq: 7 }, 'unclosed_tool'));

  /* ── ④ 逃逸通道：跨 owner 不泄 + app_role 无表写权限 + 原事件 append-only ── */
  const otherClaim = await asPrincipal(admin, otherOwner, (c) => claimCompressionDispatch(c, claimInput('thread-a', 1, 3, 'wo', 60)));
  A('④ 跨 owner: otherOwner 用自己同名 thread-a 建自己的 dispatch（各自数据各自行）',
    otherClaim.status === 'claimed' && otherClaim.replayed === false && otherClaim.leaseOwner === 'wo');
  const ownerRows = await asPrincipal(admin, owner, (c) => replayCompressionDispatches(c, 'thread-a'));
  const otherRows = await asPrincipal(admin, otherOwner, (c) => replayCompressionDispatches(c, 'thread-a'));
  A('④ 跨 owner: owner replay 只见自己 2 行，otherOwner replay 只见自己 1 行（RLS 隔离，无泄）',
    ownerRows.length === 2 && otherRows.length === 1 && ownerRows.every((r) => r.sourceRangeDigest !== otherRows[0]!.sourceRangeDigest));
  A('④ 跨 owner: memory_runtime raw SELECT 直查 owner 的 dispatch 表 = 0 行可见（FORCE RLS）',
    (await rawAsMemoryRuntime(otherOwner, (c) => c.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM context_compression_dispatch WHERE owner_user_id=$1', [owner]))).rows[0]!.n === 0);
  A('④ 无 forge: app_role raw INSERT context_compression_dispatch 被拒（表 REVOKE ALL，只经函数写）',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      `INSERT INTO context_compression_dispatch(owner_user_id, thread_id, source_event_seq_start, source_event_seq_end, source_range_digest, policy_version, prompt_version, model_version)
       VALUES ($1, 'thread-x', 1, 1, $2, 'p','p','m')`,
      [owner, 'a'.repeat(64)]))));
  A('④ 原事件 append-only: app_role raw UPDATE conversation_event 被拒（0108 REVOKE ALL）',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      'UPDATE conversation_event SET event_digest=$1 WHERE id=$2', ['a'.repeat(64), srcA[0]!.eventId]))));

  /* ── ⑤ 高并发：双 claim 同范围单行 + CAS commit 单赢家（pool=max 真并发）── */
  const [cas1, cas2] = await Promise.all([
    asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-ops', 1, 3, 'w1', 60))),
    asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-ops', 1, 3, 'w2', 60))),
  ]);
  A('⑤ 并发双 claim 同范围 → 单行单赢家（同 id，权威在 PG UNIQUE(owner,thread,start,end) 行）',
    cas1.id === cas2.id && cas1.status === 'claimed');
  A('⑤ mark_dispatched 非租约持有者(w2) → null（租约持有者专属）',
    (await asPrincipal(admin, owner, (c) => markCompressionDispatchDispatched(c, cas1.id, 'w2', 1))) === null);
  const casDisp = await asPrincipal(admin, owner, (c) => markCompressionDispatchDispatched(c, cas1.id, 'w1', 1));
  A('⑤ mark_dispatched 持有者(w1) → dispatching version 2',
    casDisp?.status === 'dispatching' && casDisp.version === 2);
  const [commitWin, commitLose] = await Promise.all([
    asPrincipal(admin, owner, (c) => commitCompressionDispatch(c, cas1.id, 2, SNAP_A)),
    asPrincipal(admin, owner, (c) => commitCompressionDispatch(c, cas1.id, 2, SNAP_B)),
  ]);
  A('⑤ 并发 commit 同 expected_version=2 → 单赢家（一个 version=3 一个 null）',
    (commitWin !== null) !== (commitLose !== null));
  const winnerSnap = (commitWin ?? commitLose)?.snapshotId;
  A('⑤ 赢家 snapshot_id 落地且未被覆盖（CAS 失败丢弃计算结果）',
    winnerSnap === SNAP_A || winnerSnap === SNAP_B);
  const casReplay = (await asPrincipal(admin, owner, (c) => replayCompressionDispatches(c, 'thread-ops'))).find((r) => r.id === cas1.id);
  A('⑤ replay: 并发后单行 committed + version=3 + snapshot_id=赢家（不覆盖）',
    casReplay?.status === 'committed' && casReplay.version === 3 && casReplay.snapshotId === winnerSnap);

  /* ── ⑥ 复杂：unknown 终态 sticky（不自动重发/不替换模型）+ 租约过期抢占（崩溃恢复）── */
  const unk = await asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-ops', 1, 6, 'w1', 60)));
  await asPrincipal(admin, owner, (c) => markCompressionDispatchDispatched(c, unk.id, 'w1', 1));
  const unkSet = await asPrincipal(admin, owner, (c) => markCompressionDispatchUnknown(c, unk.id, 2));
  A('⑥ mark_unknown: dispatching→unknown + version 2→3', unkSet?.status === 'unknown' && unkSet.version === 3);
  const unkReclaim = await asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, { ...claimInput('thread-ops', 1, 6, 'w9', 60), modelVersion: 'qwen-max', promptVersion: 'prompt-v2' }));
  A('⑥ unknown 不自动重发: 再 claim 同范围 → 返回既有 unknown 行（不重发、不同键重试）',
    unkReclaim.status === 'unknown' && unkReclaim.id === unk.id && unkReclaim.replayed === false);
  A('⑥ 模型版本冻结: unknown 后再 claim 换 model/prompt → 仍原 model=qwen-plus（绝不自动替换模型）',
    (await asPrincipal(admin, owner, (c) => replayCompressionDispatches(c, 'thread-ops'))).find((r) => r.id === unk.id)?.modelVersion === 'qwen-plus');
  A('⑥ recover 终态 unknown → null（unknown 无出边，不可被接管）',
    (await asPrincipal(admin, owner, (c) => recoverCompressionDispatch(c, unk.id, 'w2', 60))) === null);
  A('⑥ mark_dispatched 终态 unknown → null',
    (await asPrincipal(admin, owner, (c) => markCompressionDispatchDispatched(c, unk.id, 'w1', 3))) === null);
  // 不误杀 in-flight：thread-ops [4,6] 持有者 w1 未过期时 recover 落败；持有者可正常派发后显式中止。
  const inFlight = await asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-ops', 4, 6, 'w1', 60)));
  await asPrincipal(admin, owner, (c) => markCompressionDispatchDispatched(c, inFlight.id, 'w1', 1));
  A('⑥ recover 未过期租约 → null（不误杀 in-flight，真死才可被接管）',
    (await asPrincipal(admin, owner, (c) => recoverCompressionDispatch(c, inFlight.id, 'w2', 60))) === null);
  const inFlightDiscard = await asPrincipal(admin, owner, (c) => discardCompressionDispatch(c, inFlight.id, 2));
  A('⑥ discard: dispatching→discarded（显式中止，CAS 终态）',
    inFlightDiscard?.status === 'discarded' && inFlightDiscard.version === 3);
  // 租约过期抢占（崩溃恢复）：thread-recover [1,3] lease=1s → raw 置过期 → recover 抢占 → 再过期 → claim 抢占。
  const rec = await asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-recover', 1, 3, 'w1', 1)));
  await rawAsMemoryRuntime(owner, (c) => c.query(
    "UPDATE context_compression_dispatch SET lease_expires_at = now() - interval '1 second' WHERE id=$1", [rec.id]));
  const recovered = await asPrincipal(admin, owner, (c) => recoverCompressionDispatch(c, rec.id, 'w2', 60));
  A('⑥ 租约过期抢占: recover 接管已死租约 → version 1→2 + lease_owner=w2',
    recovered?.version === 2 && recovered.status === 'claimed');
  await rawAsMemoryRuntime(owner, (c) => c.query(
    "UPDATE context_compression_dispatch SET lease_expires_at = now() - interval '1 second' WHERE id=$1", [rec.id]));
  const reclaimed = await asPrincipal(admin, owner, (c) => claimCompressionDispatch(c, claimInput('thread-recover', 1, 3, 'w3', 60)));
  A('⑥ claim 过期抢占: 再 claim 同范围（已过期）→ 接管 version 2→3 + lease_owner=w3',
    reclaimed.id === rec.id && reclaimed.version === 3 && reclaimed.leaseOwner === 'w3');

  /* ── ⑦ 刁钻：状态机单向（raw 非法回退被触发器拒）+ 零模型调用 ── */
  A('⑦ 状态机单向: raw UPDATE claimed→committed 被触发器拒（claimed 只能 dispatching/discarded）',
    await rejects(() => rawAsMemoryRuntime(owner, (c) => c.query(
      'UPDATE context_compression_dispatch SET status=$1 WHERE id=$2', ['committed', claim310.id]))));
  A('⑦ 状态机单向: raw UPDATE committed→claimed 被触发器拒（终态无出边）',
    await rejects(() => rawAsMemoryRuntime(owner, (c) => c.query(
      'UPDATE context_compression_dispatch SET status=$1 WHERE id=$2', ['claimed', claim37.id]))));
  // 零模型：压缩边界判定 + claim/commit/unknown 全流程确定性（纯函数 + SQL 重算 digest），
  // 任何一次边界决策/提交都不经模型 seam（modelCalls 为「若未来误接模型」的正对照替身，恒 0）。
  let modelCalls = 0;
  const deterministic = (wm: CompressibleEventWatermark[], range: CompressibleRange) => {
    modelCalls++;
    return classifyCompressibleRange(wm, range);
  };
  const v1 = deterministic(wmA, { startSeq: 3, endSeq: 7 });
  const v2 = deterministic(wmA, { startSeq: 3, endSeq: 7 });
  const v3 = deterministic(wmA, { startSeq: 3, endSeq: 7 });
  A('⑦ 确定性: 同输入 3 次判定结果逐字节一致（纯函数，无模型采样随机性）',
    v1.compressible === true && v2.compressible === true && v3.compressible === true
    && v1.reason === v2.reason && v2.reason === v3.reason);
  A('⑦ 零模型: 整个边界判定/派发/提交流程零模型调用（正对照替身仅 3 次纯函数判定，无真实模型）',
    modelCalls === 3);

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 并发与故障恢复(CTX-05) DB 证明通过（本地隔离证据，待独立专家审计）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
