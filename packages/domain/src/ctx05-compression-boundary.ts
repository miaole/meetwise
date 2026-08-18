/**
 * 并发与故障恢复（CTX-05）纯域原语：压缩边界保护（可压缩范围判定）。
 *
 * 这是「压缩边界稳定判定」的确定性、零模型、零 IO、零 db 实现。它回答一个可重放、可伪造
 * 无门的问题：给定一个事件流的 watermark（sequence/category/source/status）与一个候选压缩
 * 范围 [startSeq, endSeq]，这个范围是「稳定边界」吗？只有「中段」（非头部系统/授权快照、
 * 非尾部最近完整 turn）才可压缩；半个 turn、未完成工具、来源仍会变化、删除围栏已生效 →
 * 一律拒（不半写、不派发）。
 *
 * 与迁移 0117_ctx05_compression_dispatch.sql 的 `context_compression_dispatch_assert_boundary`
 * 是同一判定模型的 TS 镜像（proof 做 TS↔SQL 交叉 pin：域说可压缩 ⟺ SQL claim 接受；域说
 * 拒 ⟺ SQL claim 抛 ctx05_*）。这里的**不重实现**：
 *   - 删除根（fenced→purged 的 begin/claim/purge 归 CTX-06）；
 *   - 真实模型压缩调用（MODEL-OP；本模块零模型）；
 *   - MEM-02 summary / MEM-03 摘要树 / CTX-04 snapshot 本体。
 *
 * 为什么 turn 结构必须在「纯函数」里显式建模，而不是靠 reducer 里的启发式：
 *   - 「完整 turn」是压缩安全的前提：只有已收口（最后一条是 assistant_message、工具全关闭）
 *     的 turn 才不会再变，把它压进摘要才不会丢失「仍可能追加」的内容。靠运行时顺手判断会
 *     把「半 turn 看起来也像一段话」误当成可摘要，导致摘要把未完成的用户意图冻结成既成事实。
 *   - (tool_call, tool_result) 只能成对压缩（memory-context-design §5 第 5 步）：单边压缩会
 *     破坏工具往返的因果，重放时无法还原「模型调了什么工具、拿到什么结果」。
 */
import type {
  ConversationEventCategory, ConversationEventSource, ConversationEventStatus,
} from './ctx03-event-source.ts';

/** 单个事件的压缩边界判定用 watermark（与 0108 replay 吐出的字段同形，含 status 以检测围栏）。 */
export interface CompressibleEventWatermark {
  sequence: number;
  category: ConversationEventCategory;
  source: ConversationEventSource;
  status: ConversationEventStatus;
}

/** 压缩范围（事件序半开/闭区间 [startSeq, endSeq]，含端点）。 */
export interface CompressibleRange {
  startSeq: number;
  endSeq: number;
}

/** 判定结果：compressible=true 时 reason=null；否则 reason 是稳定 code（上层按 code 分支，不散播正文）。 */
export interface CompressionBoundaryVerdict {
  compressible: boolean;
  reason: CompressionBoundaryRejectReason | null;
}

/** 拒压 reason 显式枚举（稳定 code，proof/SQL 交叉 pin 用）。 */
export const COMPRESSION_BOUNDARY_REJECT_REASONS = [
  'range_invalid',
  'source_fenced',
  'includes_system_snapshot',
  'start_not_turn_boundary',
  'end_not_turn_boundary',
  'incomplete_turn',
  'unclosed_tool',
  'unbalanced_tool',
  'includes_recent_turn',
] as const;
export type CompressionBoundaryRejectReason = (typeof COMPRESSION_BOUNDARY_REJECT_REASONS)[number];

/**
 * 压缩派发状态机（显式 enum，单向）：claimed→dispatching→committed/unknown/discarded，claimed→discarded。
 * 与迁移 0117 `context_compression_dispatch.status` CHECK 逐值一致（漂移即证明失败）。committed/unknown/
 * discarded 均为终态（无出边）——「派发后 unknown 不自动重发」由「unknown 无出边 + claim 只回放既有行」承重。
 */
export const COMPRESSION_DISPATCH_STATUSES = [
  'claimed', 'dispatching', 'committed', 'unknown', 'discarded',
] as const;
export type CompressionDispatchStatus = (typeof COMPRESSION_DISPATCH_STATUSES)[number];

/** 单向状态机白名单（与 0117 assert_context_compression_dispatch_status_oneway 逐值一致）。 */
export const COMPRESSION_DISPATCH_LEGAL_TRANSITIONS: ReadonlyArray<readonly [CompressionDispatchStatus, CompressionDispatchStatus]> = [
  ['claimed', 'dispatching'], ['claimed', 'discarded'],
  ['dispatching', 'committed'], ['dispatching', 'unknown'], ['dispatching', 'discarded'],
];

/** 单向跃迁合法性（与 0117 触发器同源，供 proof 交叉校验）。 */
export function isLegalCompressionDispatchTransition(from: CompressionDispatchStatus, to: CompressionDispatchStatus): boolean {
  if (from === to) return true;
  return COMPRESSION_DISPATCH_LEGAL_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

/** 单个 turn（turn_start 起，至下一条 turn_start 前）的结构分析结果。 */
interface TurnAnalysis {
  /** 该 turn 是否已收口（可被摘要的安全前提）。 */
  complete: boolean;
  /** 不完整时的稳定 reason（complete=true 时为 null）。 */
  reason: CompressionBoundaryRejectReason | null;
  startSeq: number;
  endSeq: number;
}

const reject = (reason: CompressionBoundaryRejectReason): CompressionBoundaryVerdict =>
  ({ compressible: false, reason });

/**
 * 分析一个 turn（事件已按 sequence 升序、以 turn_start 开头）。为什么把「工具深度」当硬约束：
 * tool_call 使深度 +1、tool_result 使深度 -1；深度一旦为负说明出现了没有前置 tool_call 的
 * tool_result（工具往返被切断），深度在 turn 尾非 0 说明还有未收回的 tool_call。两种情况都
 * 意味着工具因果不完整，压缩后重放无法还原，故判不完整。
 */
function analyzeTurn(events: CompressibleEventWatermark[]): TurnAnalysis {
  const startSeq = events[0]!.sequence;
  const endSeq = events[events.length - 1]!.sequence;
  let depth = 0;
  let minDepth = 0;
  let hasUser = false;
  let hasAssistant = false;
  for (const e of events) {
    if (e.category === 'user_message') hasUser = true;
    if (e.category === 'assistant_message') hasAssistant = true;
    if (e.category === 'tool_call') depth += 1;
    if (e.category === 'tool_result') depth -= 1;
    if (depth < minDepth) minDepth = depth;
  }
  if (!hasUser) return { complete: false, reason: 'incomplete_turn', startSeq, endSeq };
  if (!hasAssistant) return { complete: false, reason: 'incomplete_turn', startSeq, endSeq };
  if (minDepth < 0) return { complete: false, reason: 'unbalanced_tool', startSeq, endSeq };
  if (depth !== 0) return { complete: false, reason: 'unclosed_tool', startSeq, endSeq };
  // 收口条件：turn 的最后一条必须是 assistant_message（模型最终回答）。若结尾仍是 tool_result/
  //   tool_call/user_message，说明 turn 还在等下一轮输出，属于「半个 turn」。
  if (events[events.length - 1]!.category !== 'assistant_message') {
    return { complete: false, reason: 'incomplete_turn', startSeq, endSeq };
  }
  return { complete: true, reason: null, startSeq, endSeq };
}

/** 把按 sequence 升序的事件流按 turn_start 切段（含一个不完整尾段）。 */
function segmentTurns(sorted: CompressibleEventWatermark[]): CompressibleEventWatermark[][] {
  const turns: CompressibleEventWatermark[][] = [];
  let current: CompressibleEventWatermark[] = [];
  for (const e of sorted) {
    if (e.category === 'turn_start') {
      if (current.length > 0) turns.push(current);
      current = [e];
    } else if (current.length > 0) {
      current.push(e);
    }
    // 出现在首个 turn_start 之前的游离事件（如头部 system_note）不进入任何 turn——它们由
    // 系统快照保护单独拦截，不参与 turn 结构。
  }
  if (current.length > 0) turns.push(current);
  return turns;
}

/**
 * 确定性压缩边界判定。`events` 必须是该 thread 的完整事件流 watermark（按 sequence 升序，
 * 含 status；头部 system_note 与尾部未完成 turn 都要传进来，否则「中段」与「最近 turn」判定会失真）。
 *
 * 判定链（任一步 fail 即拒，绝不半写/派发）：
 *   1. range 基本合法（1 <= start <= end）+ 范围内事件序列连续（中段缺一即 range_invalid，
 *      兜住「事件已被 fence 剔除 / purge 删除」造成的不可还原缺口）。
 *   2. 范围内不得含删除围栏（status != 'active'）——围栏已生效的范围内容将被物理清除，
 *      压缩它等于把将死内容冻结进摘要。
 *   3. 范围内不得含 system_note（系统快照 + 授权快照是受保护头部，绝不压缩）。
 *   4. start 必须是 turn_start（范围起始对齐 turn 边界，否则就是「半个 turn」的前半被切走）。
 *   5. end 必须是 turn 边界：end+1 必须是 active 的 turn_start（否则范围把正在进行的 turn 拦腰
 *      截断，「来源仍会变化」；end+1 的边界 turn 已被 fence → 同样「来源仍会变化」，与 SQL
 *      assert_boundary 的 `e.status='active'` 要求逐字一致）。
 *   6. 范围内每个 turn 都必须已收口（user+assistant 齐全、工具深度平衡、结尾 assistant_message）。
 *   7. 全流最近的完整 turn 必须落在范围之后（保护「最近完整 turn」，防止把最新已确定事实压进摘要）。
 */
export function classifyCompressibleRange(
  events: CompressibleEventWatermark[],
  range: CompressibleRange,
): CompressionBoundaryVerdict {
  if (!Number.isSafeInteger(range.startSeq) || !Number.isSafeInteger(range.endSeq)
      || range.startSeq < 1 || range.endSeq < range.startSeq) {
    return reject('range_invalid');
  }
  // 防御性排序 + 去重守卫：replay 输出本身有序，但纯函数不应静默信任调用方传入的顺序。
  const sorted = [...events].sort((a, b) => a.sequence - b.sequence);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i]!.sequence === sorted[i - 1]!.sequence) return reject('range_invalid');
  }

  const inRange = sorted.filter((e) => e.sequence >= range.startSeq && e.sequence <= range.endSeq);
  if (inRange.length === 0) return reject('range_invalid');
  if (inRange[0]!.sequence !== range.startSeq) return reject('range_invalid');
  // 范围必须是连续冻结区间：中段缺一（被 fence 且从回放里剔除、或已 purge 物理删除）即非连续，
  // 压缩会吞掉不可还原的缺口——与 SQL claim 的 `v_n != (end-start+1)` 同源，拒为 range_invalid。
  // 若调用方传「含 status 的完整 watermark」（fence 未删除、status 仍可见），下方 source_fenced 会
  // 以更精确的 reason 命中；本守卫兜住「事件已被从回放剔除」的缺口场景。
  for (let i = 1; i < inRange.length; i++) {
    if (inRange[i]!.sequence !== inRange[i - 1]!.sequence + 1) return reject('range_invalid');
  }

  if (inRange.some((e) => e.status !== 'active')) return reject('source_fenced');
  if (inRange.some((e) => e.category === 'system_note')) return reject('includes_system_snapshot');
  if (inRange[0]!.category !== 'turn_start') return reject('start_not_turn_boundary');

  const after = sorted.filter((e) => e.sequence > range.endSeq);
  if (after.length === 0) return reject('end_not_turn_boundary'); // 范围直达流头：来源仍会变化
  if (after[0]!.sequence !== range.endSeq + 1) return reject('range_invalid'); // 序列不连续
  if (after[0]!.category !== 'turn_start') return reject('end_not_turn_boundary');
  // end+1 的边界 turn 必须仍是 active（已被 fence 的边界 turn 同样意味着「来源仍会变化」）——
  // 与 SQL assert_boundary 的 `e.sequence = p_end+1 AND e.status='active' AND e.category='turn_start'`
  // 逐字一致，同码 end_not_turn_boundary（不是 source_fenced / range_invalid：围栏落在范围外的边界）。
  if (after[0]!.status !== 'active') return reject('end_not_turn_boundary');

  // 范围内每个 turn 必须已收口。范围两端都对齐 turn_start，故范围内恰是整数个完整 turn。
  const turns = segmentTurns(inRange);
  for (const turn of turns) {
    const analysis = analyzeTurn(turn);
    if (!analysis.complete) return reject(analysis.reason!);
  }

  // 最近完整 turn 保护：全流最后一个完整 turn 的起点必须 > endSeq。
  const allTurns = segmentTurns(sorted).map((turn) => analyzeTurn(turn));
  const completeTurns = allTurns.filter((t) => t.complete);
  if (completeTurns.length === 0) return reject('includes_recent_turn');
  if (completeTurns[completeTurns.length - 1]!.startSeq <= range.endSeq) {
    return reject('includes_recent_turn');
  }

  return { compressible: true, reason: null };
}
