/**
 * MEM-09 生命周期触发策略证明（纯域，确定性，零 IO、零模型、零 db）。 `pnpm mem09-lifecycle-triggers:prove`
 *
 * 钉死「六触发器（事件落库/候选摘要/强制压缩/长期事实写入/embedding 索引/recall）的
 * 允许触发 / 必须先满足 / 不允许触发」显式 enum 决策层不变量，以及两条硬规则：
 *   1. 强制压缩只在「派发前」总预算超限时运行（非 provider 超窗错误后盲目压缩重发）。
 *   2. 长期事实只由用户确认或受信业务事实激活（模型只 candidate，复用 MEM-13 状态机）。
 *
 * 5 条对抗路径（register L96 MEM-09）真实编码（删触发器条件/改恒真会红，非恒真占位）：
 *   半 turn（CTX-05 边界拒）、未知工具（CTX-05 unclosed_tool 拒）、撤回后（CTX-06/MEM-10/11 fence 拒）、
 *   预算不足（CTX-02 rejected/降级）、provider unknown（CTX-05 unknown sticky 不重发）。
 *
 * seam-before-wiring 诚实披露：本证明只验证**触发决策层**；真实模型调用归 MODEL-OP，运行时接线
 * （把 fire 决策接到 0112 摘要 / 0117 压缩派发 / 0099 事实裁决 / 0102 索引 / 0105 召回）是后续接线，
 * 不宣称已构成「触发→执行」闭环。跨 owner 隔离由被复用的 DB 层 RLS（0099/0102/0105）承重（本层无
 * owner 字段可伪造），由 `memory-fact-adjudication:prove` / `memory-index-generation:prove` /
 * `memory-two-stage-recall:prove` 回归钉死，本件只断言决策层 owner-agnostic 确定性。
 */
import {
  LIFECYCLE_TRIGGERS, LIFECYCLE_TRIGGER_DECISIONS,
  mapCompressionBoundaryToSummaryBlock,
  evaluateEventIngestTrigger, evaluateSummaryCandidateTrigger, evaluateForceCompressionTrigger,
  evaluateFactWriteTrigger, evaluateIndexGenerationTrigger, evaluateMemoryRecallTrigger,
  evaluateLifecycleTrigger,
} from '../src/index.ts';
import type {
  CompressibleEventWatermark, ConversationEventCategory, ConversationEventSource, ConversationEventStatus,
  EventIngestTriggerInput, SummaryCandidateTriggerInput,
  ForceCompressionTriggerInput, FactWriteTriggerInput, IndexGenerationTriggerInput,
  MemoryRecallTriggerInput,
} from '../src/index.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const wm = (sequence: number, category: ConversationEventCategory, source: ConversationEventSource = 'system', status: ConversationEventStatus = 'active'): CompressibleEventWatermark =>
  ({ sequence, category, source, status });

/** 稳定双 turn（turn1 完整 + turn2 完整）：range {1,3} 覆盖 turn1 → CTX-05 判可压缩。 */
const VALID_TWO_TURNS: CompressibleEventWatermark[] = [
  wm(1, 'turn_start'), wm(2, 'user_message', 'user'), wm(3, 'assistant_message', 'model'),
  wm(4, 'turn_start'), wm(5, 'user_message', 'user'), wm(6, 'assistant_message', 'model'),
];

const validSummaryInput = (over: Partial<SummaryCandidateTriggerInput> = {}): SummaryCandidateTriggerInput => ({
  events: VALID_TWO_TURNS, range: { startSeq: 1, endSeq: 3 },
  sourceCommitted: true, boundSourceRange: true, claimSpanValidation: true,
  backgroundBudgetApproach: false, ...over,
});

const validFactInput = (over: Partial<FactWriteTriggerInput> = {}): FactWriteTriggerInput => ({
  producer: 'user_confirmation', targetStatus: 'active', sourceTrust: 'trusted',
  sourceSpanPresent: true, purposePresent: true, consentPresent: true,
  validUntilPresent: true, conflictRelationshipPresent: true, writeValidationPassed: true, ...over,
});

const validIndexInput = (over: Partial<IndexGenerationTriggerInput> = {}): IndexGenerationTriggerInput => ({
  sourceKind: 'verified_fact', sourceFenced: false,
  sourceVersionDigestPresent: true, embeddingRevisionPresent: true, purposePresent: true,
  expiryPresent: true, privacyEpochPresent: true, deletionTargetAvailable: true,
  vectorHitAsFact: false, ...over,
});

const validRecallInput = (over: Partial<MemoryRecallTriggerInput> = {}): MemoryRecallTriggerInput => ({
  routeNeedsCrossTurnContext: true, subjectPurposeAuthorized: true,
  businessTruthChecked: true, governanceFiltered: true, resultFrozenIntoSnapshot: true,
  unconditionalRecall: false, highImpactDecisionContext: false, sourceFenced: false, ...over,
});

const validForceInput = (over: Partial<ForceCompressionTriggerInput> = {}): ForceCompressionTriggerInput => ({
  dispatchPhase: 'pre_dispatch', budgetStatus: 'rejected',
  fullBudgetAccounted: true, verifiedSummaryOrDegradePath: true, ...over,
});

async function main() {
  /* ═══ ① 正常：每触发器在满足条件时真触发、不满足时拒 ═══════════════ */
  A('① 六触发器 enum 恰为 register L96 六动作，判决 enum 恰为 fire/blocked',
    LIFECYCLE_TRIGGERS.length === 6
    && (LIFECYCLE_TRIGGERS as readonly string[]).includes('event_ingest')
    && (LIFECYCLE_TRIGGERS as readonly string[]).includes('summary_candidate')
    && (LIFECYCLE_TRIGGERS as readonly string[]).includes('force_compression')
    && (LIFECYCLE_TRIGGERS as readonly string[]).includes('fact_write')
    && (LIFECYCLE_TRIGGERS as readonly string[]).includes('index_generation')
    && (LIFECYCLE_TRIGGERS as readonly string[]).includes('memory_recall')
    && LIFECYCLE_TRIGGER_DECISIONS.length === 2);

  // 事件落库：四种合法来源各自 fire + 缺前置条件 block。
  {
    const base = { category: 'user_message', source: 'user', schemaValidation: 'passed', businessValidation: 'passed', artifactEncrypted: true, ownerRlsBound: true, purposeConsent: true, retentionPresent: true, privacyEpochPresent: true, appendOrdered: true } as const;
    A('① 事件落库 user 输入 → fire user_input_accepted',
      evaluateEventIngestTrigger({ ...base }).decision === 'fire'
      && evaluateEventIngestTrigger({ ...base }).allowReason === 'user_input_accepted');
    A('① 事件落库 tool_result → fire tool_result_accepted',
      evaluateEventIngestTrigger({ ...base, category: 'tool_result', source: 'tool' }).allowReason === 'tool_result_accepted');
    A('① 事件落库 system_note → fire business_state_change',
      evaluateEventIngestTrigger({ ...base, category: 'system_note', source: 'system' }).allowReason === 'business_state_change');
    A('① 事件落库 assistant_message(model) → fire model_output_recorded（完整 turn 需记录模型回复）',
      evaluateEventIngestTrigger({ ...base, category: 'assistant_message', source: 'model' }).allowReason === 'model_output_recorded');
    const r = evaluateEventIngestTrigger({ ...base, privacyEpochPresent: false });
    A('① 事件落库缺 privacy epoch → blocked precondition_unmet 且未满足列表含 privacy_epoch（非布尔汤）',
      r.decision === 'blocked' && r.blockReason === 'precondition_unmet' && r.unmetPreconditions.includes('privacy_epoch'));
  }

  // 候选摘要：稳定双 turn → fire；缺前置条件 → blocked。
  {
    const ok = evaluateSummaryCandidateTrigger(validSummaryInput());
    A('① 候选摘要稳定边界 → fire range_stable', ok.decision === 'fire' && ok.allowReason === 'range_stable');
    A('① 候选摘要后台接近预算阈值 → fire approaching_budget_threshold（仍须边界稳定）',
      evaluateSummaryCandidateTrigger(validSummaryInput({ backgroundBudgetApproach: true })).allowReason === 'approaching_budget_threshold');
    const r = evaluateSummaryCandidateTrigger(validSummaryInput({ sourceCommitted: false }));
    A('① 候选摘要来源未提交 → blocked precondition_unmet 含 source_events_committed',
      r.decision === 'blocked' && r.blockReason === 'precondition_unmet' && r.unmetPreconditions.includes('source_events_committed'));
  }

  // 强制压缩：派发前+超限 → fire；预算未超 → blocked。
  {
    A('① 强制压缩派发前+预算超限(rejected) → fire pre_dispatch_budget_exceeded',
      evaluateForceCompressionTrigger(validForceInput()).decision === 'fire'
      && evaluateForceCompressionTrigger(validForceInput()).allowReason === 'pre_dispatch_budget_exceeded');
    A('① 强制压缩派发前+预算超限后确定性裁剪(degraded) → fire（degraded 亦为「曾超限」）',
      evaluateForceCompressionTrigger(validForceInput({ budgetStatus: 'degraded' })).decision === 'fire');
    A('① 强制压缩预算未超(within_budget) → blocked budget_within_limits（无需压缩）',
      evaluateForceCompressionTrigger(validForceInput({ budgetStatus: 'within_budget' })).blockReason === 'budget_within_limits');
  }

  // 长期事实：user_confirmation / business_fact(trusted) 激活 → fire；model candidate → fire。
  {
    A('① 长期事实 user_confirmation 激活 active → fire user_confirmation',
      evaluateFactWriteTrigger(validFactInput({ producer: 'user_confirmation', targetStatus: 'active' })).allowReason === 'user_confirmation');
    A('① 长期事实 business_fact(trusted) 激活 active → fire business_fact',
      evaluateFactWriteTrigger(validFactInput({ producer: 'business_fact', targetStatus: 'active', sourceTrust: 'trusted' })).allowReason === 'business_fact');
    A('① 长期事实 model 提 candidate → fire model_candidate（模型只可 candidate）',
      evaluateFactWriteTrigger(validFactInput({ producer: 'model_summary', targetStatus: 'candidate' })).allowReason === 'model_candidate');
    A('① 长期事实 user_confirmation/business_fact + candidate → allowReason 为其真实 producer（非误标 model_candidate）',
      evaluateFactWriteTrigger(validFactInput({ producer: 'user_confirmation', targetStatus: 'candidate' })).allowReason === 'user_confirmation'
      && evaluateFactWriteTrigger(validFactInput({ producer: 'business_fact', targetStatus: 'candidate', sourceTrust: 'trusted' })).allowReason === 'business_fact');
  }

  // 索引：已验证事实 → fire；已验证摘要 / 授权事件片段 → fire。
  {
    A('① 索引 verified_fact → fire verified_fact_frozen',
      evaluateIndexGenerationTrigger(validIndexInput()).allowReason === 'verified_fact_frozen');
    A('① 索引 verified_summary → fire verified_summary_frozen',
      evaluateIndexGenerationTrigger(validIndexInput({ sourceKind: 'verified_summary' })).allowReason === 'verified_summary_frozen');
    A('① 索引 authorized_event_fragment → fire authorized_event_fragment',
      evaluateIndexGenerationTrigger(validIndexInput({ sourceKind: 'authorized_event_fragment' })).allowReason === 'authorized_event_fragment');
  }

  // recall：路由需要 + 授权允许 → fire；无条件召回 → blocked。
  {
    A('① recall 路由需要跨 turn 上下文且授权允许 → fire route_requires_memory',
      evaluateMemoryRecallTrigger(validRecallInput()).allowReason === 'route_requires_memory');
    A('① recall 每次请求无条件召回 → blocked unconditional_recall',
      evaluateMemoryRecallTrigger(validRecallInput({ unconditionalRecall: true })).blockReason === 'unconditional_recall');
  }

  /* ═══ ② 异常：5 条对抗路径全拒，0 错误派生物、0 重发 ═══════════════ */
  // 半 turn（CTX-05 边界拒：incomplete_turn → half_turn）。
  {
    const halfTurn: CompressibleEventWatermark[] = [
      wm(1, 'turn_start'), wm(2, 'user_message', 'user'),
      wm(3, 'turn_start'), wm(4, 'user_message', 'user'), wm(5, 'assistant_message', 'model'),
    ];
    const r = evaluateSummaryCandidateTrigger(validSummaryInput({ events: halfTurn, range: { startSeq: 1, endSeq: 2 } }));
    A('② 半 turn → 候选摘要 blocked half_turn（复用 CTX-05 边界判定，0 派生）',
      r.decision === 'blocked' && r.blockReason === 'half_turn');
  }
  // 未知工具（CTX-05 unclosed_tool → tool_causal_incomplete）。
  {
    const unclosedTool: CompressibleEventWatermark[] = [
      wm(1, 'turn_start'), wm(2, 'user_message', 'user'), wm(3, 'tool_call', 'model'), wm(4, 'assistant_message', 'model'),
      wm(5, 'turn_start'), wm(6, 'user_message', 'user'), wm(7, 'assistant_message', 'model'),
    ];
    const r = evaluateSummaryCandidateTrigger(validSummaryInput({ events: unclosedTool, range: { startSeq: 1, endSeq: 4 } }));
    A('② 未知工具（unclosed_tool）→ 候选摘要 blocked tool_causal_incomplete（0 派生）',
      r.decision === 'blocked' && r.blockReason === 'tool_causal_incomplete');
  }
  // 撤回后（CTX-05 source_fenced → deletion_fence_active）——摘要侧 fence 拒。
  {
    const fenced: CompressibleEventWatermark[] = VALID_TWO_TURNS.map((e, i) => (i === 1 ? { ...e, status: 'privacy_fenced' } : e));
    const r = evaluateSummaryCandidateTrigger(validSummaryInput({ events: fenced, range: { startSeq: 1, endSeq: 3 } }));
    A('② 撤回后（source_fenced）→ 候选摘要 blocked deletion_fence_active（0 派生）',
      r.decision === 'blocked' && r.blockReason === 'deletion_fence_active');
  }
  // 预算不足（CTX-02 rejected）但无已验证摘要 → 确定性降级/拒绝，不盲目压缩。
  {
    const r = evaluateForceCompressionTrigger(validForceInput({ budgetStatus: 'rejected', verifiedSummaryOrDegradePath: false }));
    A('② 预算不足(rejected)但无已验证摘要 → blocked precondition_unmet（确定性降级/拒绝，非盲目压缩）',
      r.decision === 'blocked' && r.blockReason === 'precondition_unmet'
      && r.unmetPreconditions.includes('verified_summary_or_degrade_path'));
  }
  // provider unknown（CTX-05 unknown sticky 不重发）。
  {
    const r = evaluateForceCompressionTrigger(validForceInput({ dispatchPhase: 'dispatched_unknown' }));
    A('② provider unknown（已派发结果 unknown）→ blocked dispatched_unknown_resend（0 重发）',
      r.decision === 'blocked' && r.blockReason === 'dispatched_unknown_resend');
  }

  /* ═══ ③ 特殊：撤回后 fence 拒 + 长期事实仅 confirm/business_fact 激活 ═══════════════ */
  {
    const idx = evaluateIndexGenerationTrigger(validIndexInput({ sourceFenced: true }));
    A('③ 撤回后 → 索引 generation blocked source_fenced（旧 generation 同步失效）',
      idx.decision === 'blocked' && idx.blockReason === 'source_fenced');
    const rec = evaluateMemoryRecallTrigger(validRecallInput({ sourceFenced: true }));
    A('③ 撤回后 → recall blocked source_fenced（0 召回）',
      rec.decision === 'blocked' && rec.blockReason === 'source_fenced');
  }
  {
    // 模型摘要 / 评分猜测 / 闲聊直接升级 active → 全部拒（硬规则 2）。
    A('③ 模型摘要直接 active → blocked model_summary_upgrade',
      evaluateFactWriteTrigger(validFactInput({ producer: 'model_summary', targetStatus: 'active' })).blockReason === 'model_summary_upgrade');
    A('③ 评分猜测直接 active → blocked score_guess_upgrade',
      evaluateFactWriteTrigger(validFactInput({ producer: 'scoring_guess', targetStatus: 'active' })).blockReason === 'score_guess_upgrade');
    A('③ 一次闲聊直接 active → blocked casual_chat_upgrade',
      evaluateFactWriteTrigger(validFactInput({ producer: 'casual_chat', targetStatus: 'active' })).blockReason === 'casual_chat_upgrade');
    A('③ 未受信 business_fact 激活 → blocked untrusted_business_fact',
      evaluateFactWriteTrigger(validFactInput({ producer: 'business_fact', targetStatus: 'active', sourceTrust: 'untrusted' })).blockReason === 'untrusted_business_fact');
    A('③ 模型 candidate 不激活：model_summary + candidate 仅 fire model_candidate（不产生 active）',
      evaluateFactWriteTrigger(validFactInput({ producer: 'model_summary', targetStatus: 'candidate' })).allowReason === 'model_candidate');
  }

  /* ═══ ④ 逃逸通道：伪造触发器条件 / 跨 owner / 伪造 budget 结果 ═══════════════ */
  {
    // 伪造「边界稳定」声明：候选摘要不采信调用方标志，边界由 events+range 确定性重算。
    // range {4,6} 覆盖「最近完整 turn」（turn3 未收口，turn2 是最近完整 turn）→ CTX-05 保护最近 turn。
    const threeTurns: CompressibleEventWatermark[] = [
      wm(1, 'turn_start'), wm(2, 'user_message', 'user'), wm(3, 'assistant_message', 'model'),
      wm(4, 'turn_start'), wm(5, 'user_message', 'user'), wm(6, 'assistant_message', 'model'),
      wm(7, 'turn_start'), wm(8, 'user_message', 'user'), // turn3 未收口
    ];
    const forgedStable = evaluateSummaryCandidateTrigger(validSummaryInput({ events: threeTurns, range: { startSeq: 4, endSeq: 6 } }));
    A('④ 伪造「稳定范围」声明（实际覆盖最近完整 turn）→ blocked source_still_mutable（重算边界，不采信标志）',
      forgedStable.decision === 'blocked' && forgedStable.blockReason === 'source_still_mutable');
  }
  {
    // 伪造 budget 结果：即使伪造「超限」，派发后 unknown / provider 超窗仍拒（阶段门支配）。
    const forgedResend = evaluateForceCompressionTrigger(validForceInput({ budgetStatus: 'rejected', dispatchPhase: 'dispatched_unknown' }));
    A('④ 伪造 budget「超限」+ 已派发 unknown → 仍 blocked dispatched_unknown_resend（0 重发）',
      forgedResend.blockReason === 'dispatched_unknown_resend');
    const forgedOverwindow = evaluateForceCompressionTrigger(validForceInput({ budgetStatus: 'rejected', dispatchPhase: 'provider_overwindow' }));
    A('④ 伪造 budget「超限」+ provider 超窗 → 仍 blocked retroactive_overwindow_compress（不盲目压缩重发）',
      forgedOverwindow.blockReason === 'retroactive_overwindow_compress');
    const forgedPhase = evaluateForceCompressionTrigger(validForceInput({ dispatchPhase: 'banana' as never }));
    A('④ 伪造派发阶段(banana) → blocked invalid_trigger_input（fail-closed）',
      forgedPhase.blockReason === 'invalid_trigger_input');
    const forgedBudget = evaluateForceCompressionTrigger(validForceInput({ budgetStatus: 'banana' as never }));
    A('④ 伪造预算状态(banana) → blocked invalid_trigger_input（fail-closed，绝不静默当「超限」）',
      forgedBudget.blockReason === 'invalid_trigger_input');
  }
  {
    // 伪造事实生产者：未知 producer 激活 active → 拒（绝不把未知来源当「可激活」）。
    const forgedProducer = evaluateFactWriteTrigger(validFactInput({ producer: 'admin_override' as never, targetStatus: 'active' }));
    A('④ 伪造事实生产者(admin_override) 激活 active → blocked invalid_trigger_input（0 错误激活）',
      forgedProducer.blockReason === 'invalid_trigger_input');
    const forgedSourceKind = evaluateIndexGenerationTrigger(validIndexInput({ sourceKind: 'banana' as never }));
    A('④ 伪造索引来源种类(banana) → blocked invalid_trigger_input（绝不把未知来源当「已授权片段」）',
      forgedSourceKind.blockReason === 'invalid_trigger_input');
    // 跨 owner：本决策层无 owner 字段可伪造，判定 owner-agnostic（真实跨 owner=0 由被复用 RLS 承重）。
    const a = evaluateFactWriteTrigger(validFactInput());
    const b = evaluateFactWriteTrigger(validFactInput());
    A('④ 跨 owner：决策层无 owner 字段（owner-agnostic 确定性，同输入两次逐字节相等；真实隔离归 0099/0102/0105 RLS）',
      JSON.stringify(a) === JSON.stringify(b) && a.trigger === 'fact_write');
  }

  /* ═══ ⑤ 高并发：同触发器并发单赢家=复用回归 ═══════════════ */
  {
    // 本域纯函数无共享状态；真正并发单赢家由 CTX-05 lease/CAS + 0099 partial unique index 承重（回归见下）。
    const x = evaluateForceCompressionTrigger(validForceInput());
    const y = evaluateForceCompressionTrigger(validForceInput());
    A('⑤ 并发确定性：同触发器同输入并发 N 次 → 判决逐字节相等（无隐藏状态/随机；真正单赢家归 CTX-05/0099 CAS）',
      JSON.stringify(x) === JSON.stringify(y) && x.decision === 'fire');
    const s1 = evaluateSummaryCandidateTrigger(validSummaryInput());
    const s2 = evaluateSummaryCandidateTrigger(validSummaryInput());
    A('⑤ 候选摘要并发确定性：同输入两次 → 逐字节相等（复用 classifyCompressibleRange 确定性）',
      JSON.stringify(s1) === JSON.stringify(s2));
  }

  /* ═══ ⑥ 复杂：强制压缩只在派发前预算超限、非 provider 超窗错误后 ═══════════════ */
  {
    // 硬规则 1 全景：同一「超限」预算，唯一允许触发的阶段是 pre_dispatch。
    const pre = evaluateForceCompressionTrigger(validForceInput({ dispatchPhase: 'pre_dispatch', budgetStatus: 'rejected' }));
    const over = evaluateForceCompressionTrigger(validForceInput({ dispatchPhase: 'provider_overwindow', budgetStatus: 'rejected' }));
    const unk = evaluateForceCompressionTrigger(validForceInput({ dispatchPhase: 'dispatched_unknown', budgetStatus: 'rejected' }));
    A('⑥ 强制压缩只在派发前超限 fire；provider 超窗/已派发 unknown 同超限预算一律 blocked（非「超窗后盲目压缩重发」）',
      pre.decision === 'fire' && over.blockReason === 'retroactive_overwindow_compress' && unk.blockReason === 'dispatched_unknown_resend');
    // 硬规则 1 补充：即使压缩前前置条件缺一（无完整预算分账），也 blocked（不半写）。
    const noBudget = evaluateForceCompressionTrigger(validForceInput({ fullBudgetAccounted: false }));
    A('⑥ 派发前超限但预算分账不全 → blocked precondition_unmet（含 full_budget_accounted，不半写）',
      noBudget.blockReason === 'precondition_unmet' && noBudget.unmetPreconditions.includes('full_budget_accounted'));
  }

  /* ═══ ⑦ 刁钻：空输入 / 畸形 span / 六触发器隔离互不串扰 ═══════════════ */
  {
    const e0 = evaluateEventIngestTrigger(undefined as unknown as EventIngestTriggerInput);
    const s0 = evaluateSummaryCandidateTrigger(undefined as unknown as SummaryCandidateTriggerInput);
    const f0 = evaluateForceCompressionTrigger(undefined as unknown as ForceCompressionTriggerInput);
    const w0 = evaluateFactWriteTrigger(undefined as unknown as FactWriteTriggerInput);
    const i0 = evaluateIndexGenerationTrigger(undefined as unknown as IndexGenerationTriggerInput);
    const r0 = evaluateMemoryRecallTrigger(undefined as unknown as MemoryRecallTriggerInput);
    A('⑦ 空输入六触发器全部 fail-closed blocked（0 崩溃、0 错误 fire）',
      [e0, s0, f0, w0, i0, r0].every((v) => v.decision === 'blocked'));
  }
  {
    // 畸形 span：范围反序 / 起点非 turn 边界。
    const reversed = evaluateSummaryCandidateTrigger(validSummaryInput({ range: { startSeq: 99, endSeq: 1 } }));
    A('⑦ 畸形范围（start>end）→ blocked range_invalid', reversed.blockReason === 'range_invalid');
    const offBoundary = evaluateSummaryCandidateTrigger(validSummaryInput({ range: { startSeq: 2, endSeq: 3 } }));
    A('⑦ 畸形范围（起点非 turn_start）→ blocked half_turn', offBoundary.blockReason === 'half_turn');
  }
  {
    // 六触发器隔离：只改一个触发器的输入，其余五个判决不变（纯独立函数，互不串扰）。
    const baseline = [
      evaluateEventIngestTrigger({ category: 'user_message', source: 'user', schemaValidation: 'passed', businessValidation: 'passed', artifactEncrypted: true, ownerRlsBound: true, purposeConsent: true, retentionPresent: true, privacyEpochPresent: true, appendOrdered: true }),
      evaluateSummaryCandidateTrigger(validSummaryInput()),
      evaluateForceCompressionTrigger(validForceInput()),
      evaluateFactWriteTrigger(validFactInput()),
      evaluateIndexGenerationTrigger(validIndexInput()),
      evaluateMemoryRecallTrigger(validRecallInput()),
    ].map((v) => JSON.stringify(v));
    const afterMutation = [
      evaluateEventIngestTrigger({ category: 'user_message', source: 'user', schemaValidation: 'passed', businessValidation: 'passed', artifactEncrypted: true, ownerRlsBound: true, purposeConsent: true, retentionPresent: true, privacyEpochPresent: true, appendOrdered: true }),
      evaluateSummaryCandidateTrigger(validSummaryInput()),
      evaluateForceCompressionTrigger(validForceInput()),
      evaluateFactWriteTrigger(validFactInput({ producer: 'model_summary', targetStatus: 'active' })), // 只改 fact_write → 拒
      evaluateIndexGenerationTrigger(validIndexInput()),
      evaluateMemoryRecallTrigger(validRecallInput()),
    ].map((v) => JSON.stringify(v));
    A('⑦ 六触发器隔离：只改 fact_write 输入，其余五个判决逐字节不变（互不串扰）',
      baseline[0] === afterMutation[0] && baseline[1] === afterMutation[1]
      && baseline[2] === afterMutation[2] && baseline[4] === afterMutation[4]
      && baseline[5] === afterMutation[5] && afterMutation[3] !== baseline[3]);
  }
  {
    // 编排入口：按触发器名路由到对应决策函数（与直接调用逐字节一致）。
    const direct = evaluateForceCompressionTrigger(validForceInput());
    const routed = evaluateLifecycleTrigger({ trigger: 'force_compression', input: validForceInput() });
    A('⑦ 编排入口按触发器名路由：force_compression 直接调用 vs 分派 → 逐字节一致',
      JSON.stringify(direct) === JSON.stringify(routed));
    A('⑦ 编排入口未知触发器名 → fail-closed invalid_trigger_input 且 verdict.trigger 仍是合法 enum（非运行时垃圾值）',
      (() => {
        const v = evaluateLifecycleTrigger({ trigger: 'banana' } as never);
        return v.blockReason === 'invalid_trigger_input'
          && (LIFECYCLE_TRIGGERS as readonly string[]).includes(v.trigger);
      })());
  }
  {
    // 映射表：CTX-05 9 个边界拒因 → MEM-09 摘要阻断理由，全部覆盖（跨模块复用不重实现）。
    A('⑦ CTX-05→MEM-09 摘要阻断理由映射表 9 项全对（复用判定，不重写 turn/tool 分析）',
      mapCompressionBoundaryToSummaryBlock('source_fenced') === 'deletion_fence_active'
      && mapCompressionBoundaryToSummaryBlock('includes_system_snapshot') === 'protected_header'
      && mapCompressionBoundaryToSummaryBlock('start_not_turn_boundary') === 'half_turn'
      && mapCompressionBoundaryToSummaryBlock('incomplete_turn') === 'half_turn'
      && mapCompressionBoundaryToSummaryBlock('end_not_turn_boundary') === 'source_still_mutable'
      && mapCompressionBoundaryToSummaryBlock('includes_recent_turn') === 'source_still_mutable'
      && mapCompressionBoundaryToSummaryBlock('unclosed_tool') === 'tool_causal_incomplete'
      && mapCompressionBoundaryToSummaryBlock('unbalanced_tool') === 'tool_causal_incomplete'
      && mapCompressionBoundaryToSummaryBlock('range_invalid') === 'range_invalid');
  }

  console.log(fail === 0
    ? '\n✓ 生命周期触发策略（MEM-09 触发条件编排层）域证明通过（纯域证据；真实模型调用归 MODEL-OP，运行时接线 seam-before-wiring）'
    : `\n✗ ${fail} 个断言失败`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
