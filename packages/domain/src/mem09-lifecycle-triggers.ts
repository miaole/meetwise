/**
 * mem09-lifecycle-triggers.ts — MEM-09 生命周期触发策略（触发条件编排层，纯决策，非执行）。
 *
 * 这是记忆治理轨道的**最终集成/编排件**：把六个动作（事件落库 / 候选摘要 / 强制压缩 /
 * 长期事实写入 / embedding 索引 / recall）分为六个**独立触发器**，每个触发器只回答
 * 「**何时触发**」（允许触发 / 必须先满足 / 不允许触发），**绝不回答「如何执行」**。
 * 六个动作的「如何执行」分别住在已建好的模块里（CTX-03 事件源 / MEM-02 摘要 + CTX-05 边界 /
 * CTX-02 预算 + CTX-05 压缩派发 / MEM-13 事实裁决 / MEM-11 索引 generation + MEM-14 召回），
 * 本模块通过**引用**（import classifyCompressibleRange / 镜像其显式 enum / 消费其返回结果）
 * 复用，**不重实现任何机制**（对账表见 `.tmp/mem09-lifecycle-triggers-pregen-gate.md` §1）。
 *
 * 两条硬规则（memory-context-design.md L136/L137）：
 *   1. 强制压缩只在「**模型派发前**」完整渲染估算超过可用输入预算时运行——消费 CTX-02 预算结果，
 *      **不是**「收到 provider 超窗错误后盲目压缩重发」。
 *   2. 长期事实只由**用户确认**或**受信业务事实**激活——复用 MEM-13 状态机（模型只可提出 candidate）。
 *
 * 显式 enum（禁布尔汤）：触发器名 / 触发理由(allow reason) / 阻断理由(block reason) /
 * 前置条件(precondition) 全部是显式 enum；决策状态 `fire/blocked` 显式 enum；判决的
 * `blockReason` / `unmetPreconditions` 是 enum 值，不是布尔组合。所有 enum 输入 fail-closed
 * （未知值 → `invalid_trigger_input`，绝不静默放行）。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 *
 * seam-before-wiring 诚实披露（对照 SCOR-04 范式）：
 *   - 真实模型调用（摘要/压缩/事实/embedding 的实际 model invocation）归 MODEL-OP；本模块零模型。
 *   - `force_compression` 的 budget status 是**本地 seam enum**（镜像 CTX-02 `CONTEXT_BUDGET_STATUSES`
 *     within_budget/degraded/rejected）：domain 不能 import ai-runtime（包边界），运行时接线时把真实
 *     `planDispatchBudget` 结果映射进来。本模块不宣称已构成「触发→执行」闭环。
 *   - 跨 owner 隔离由被复用的 DB 层 RLS（0099/0102/0105）承重，不在本纯决策层（本层无 owner 字段可伪造）。
 */
import { CONVERSATION_EVENT_CATEGORIES, CONVERSATION_EVENT_SOURCES } from './ctx03-event-source.ts';
import { classifyCompressibleRange } from './ctx05-compression-boundary.ts';
import type {
  CompressibleEventWatermark, CompressibleRange, CompressionBoundaryRejectReason,
} from './ctx05-compression-boundary.ts';

/* ═════════════════════════ 公共：触发器身份 + 判决形状 ═════════════════════════ */

/** 六个生命周期触发器（显式 enum，非布尔汤；register L96 MEM-09 六动作）。 */
export const LIFECYCLE_TRIGGERS = [
  'event_ingest', 'summary_candidate', 'force_compression', 'fact_write', 'index_generation', 'memory_recall',
] as const;
export type LifecycleTrigger = (typeof LIFECYCLE_TRIGGERS)[number];

/** 判决状态（显式 enum）：fire=允许触发；blocked=拒绝（带明确 blockReason）。 */
export const LIFECYCLE_TRIGGER_DECISIONS = ['fire', 'blocked'] as const;
export type LifecycleTriggerDecision = (typeof LIFECYCLE_TRIGGER_DECISIONS)[number];

/* ═════════════════════════ ① event_ingest：原始事件落库 ═════════════════════════ */

export const EVENT_INGEST_ALLOW_REASONS = [
  'user_input_accepted', 'tool_result_accepted', 'business_state_change', 'model_output_recorded',
] as const;
export type EventIngestAllowReason = (typeof EVENT_INGEST_ALLOW_REASONS)[number];

/** 必须先满足（design L132）：加密工件 / owner RLS / purpose·consent / retention / privacy epoch / 追加顺序。 */
export const EVENT_INGEST_PRECONDITIONS = [
  'artifact_encrypted', 'owner_rls_bound', 'purpose_consent', 'retention', 'privacy_epoch', 'append_order',
] as const;
export type EventIngestPrecondition = (typeof EVENT_INGEST_PRECONDITIONS)[number];

/** 不允许触发（design L132）：流式裸 token / 模型内部推理 / 未过 schema 校验 / 未过业务校验。 */
export const EVENT_INGEST_BLOCK_REASONS = [
  'streaming_raw_token', 'model_internal_reasoning', 'schema_validation_failed', 'business_validation_failed',
] as const;
export type EventIngestBlockReason = (typeof EVENT_INGEST_BLOCK_REASONS)[number];

/** 校验结果（显式 enum，非布尔汤）。 */
export const EVENT_INGEST_VALIDATION_STATUSES = ['passed', 'failed'] as const;
export type EventIngestValidationStatus = (typeof EVENT_INGEST_VALIDATION_STATUSES)[number];

/** 模型可合法产出的事件类别（assistant_message 用户可见回复 + tool_call 工具发起），其余类别 + source=model 视为内部推理。 */
const MODEL_INGESTIBLE_CATEGORIES: ReadonlySet<string> = new Set(['assistant_message', 'tool_call']);

export interface EventIngestTriggerInput {
  /** 事件类别（ConversationEventCategory；未知值=流式裸 token / 未成形的片段）。 */
  category: string;
  /** 事件来源（ConversationEventSource：user/model/tool/system）。 */
  source: string;
  schemaValidation: EventIngestValidationStatus;
  businessValidation: EventIngestValidationStatus;
  /** 必须先满足：加密工件 / owner RLS / purpose·consent / retention / privacy epoch / 追加顺序。 */
  artifactEncrypted: boolean;
  ownerRlsBound: boolean;
  purposeConsent: boolean;
  retentionPresent: boolean;
  privacyEpochPresent: boolean;
  appendOrdered: boolean;
}

export function evaluateEventIngestTrigger(input: EventIngestTriggerInput): LifecycleTriggerVerdict {
  const category = input?.category ?? '';
  const source = input?.source ?? '';
  // 伪造/未知校验结果 → fail-closed（绝不把「未声明校验」当「已过」）。
  if (!(EVENT_INGEST_VALIDATION_STATUSES as readonly string[]).includes(input?.schemaValidation ?? ''))
    return blocked('event_ingest', 'invalid_trigger_input');
  if (!(EVENT_INGEST_VALIDATION_STATUSES as readonly string[]).includes(input?.businessValidation ?? ''))
    return blocked('event_ingest', 'invalid_trigger_input');
  // 不允许触发：未过 schema / 业务校验的写入（先于任何允许判定，fail-closed）。
  if (input?.schemaValidation === 'failed') return blocked('event_ingest', 'schema_validation_failed');
  if (input?.businessValidation === 'failed') return blocked('event_ingest', 'business_validation_failed');
  // 不允许触发：流式裸 token（类别不在冻结事件类别 enum 内）。
  if (!(CONVERSATION_EVENT_CATEGORIES as readonly string[]).includes(category)) return blocked('event_ingest', 'streaming_raw_token');
  // 伪造/未知来源 → fail-closed（绝不把未知来源当合法事件写库）。
  if (!(CONVERSATION_EVENT_SOURCES as readonly string[]).includes(source)) return blocked('event_ingest', 'invalid_trigger_input');
  // 不允许触发：模型内部推理（source=model 但非 assistant_message / tool_call）。
  if (source === 'model' && !MODEL_INGESTIBLE_CATEGORIES.has(category)) return blocked('event_ingest', 'model_internal_reasoning');

  const unmet = unmetOf(
    ['artifact_encrypted', 'owner_rls_bound', 'purpose_consent', 'retention', 'privacy_epoch', 'append_order'] as const,
    {
      artifact_encrypted: input?.artifactEncrypted === true,
      owner_rls_bound: input?.ownerRlsBound === true,
      purpose_consent: input?.purposeConsent === true,
      retention: input?.retentionPresent === true,
      privacy_epoch: input?.privacyEpochPresent === true,
      append_order: input?.appendOrdered === true,
    },
  );
  if (unmet.length > 0) return blocked('event_ingest', 'precondition_unmet', unmet);

  const allowReason: EventIngestAllowReason =
    source === 'user' ? 'user_input_accepted'
    : source === 'tool' ? 'tool_result_accepted'
    : source === 'system' ? 'business_state_change'
    : 'model_output_recorded';
  return fired('event_ingest', allowReason);
}

/* ═════════════════════════ ② summary_candidate：候选摘要 ═════════════════════════ */

export const SUMMARY_CANDIDATE_ALLOW_REASONS = ['range_stable', 'approaching_budget_threshold'] as const;
export type SummaryCandidateAllowReason = (typeof SUMMARY_CANDIDATE_ALLOW_REASONS)[number];

/** 必须先满足（design L133）：来源事件已提交 / 绑定 source range·digest·version / 结果先校验 claim→source span。 */
export const SUMMARY_CANDIDATE_PRECONDITIONS = [
  'source_events_committed', 'bound_source_range_digest_version', 'claim_span_validation',
] as const;
export type SummaryCandidatePrecondition = (typeof SUMMARY_CANDIDATE_PRECONDITIONS)[number];

/**
 * 不允许触发（design L133）：半个 turn / 未完成工具 / 来源仍会变化 / 删除围栏已生效。
 * 这些阻断理由**复用 CTX-05 `classifyCompressibleRange` 的判定结果映射而来**（不重写 turn/tool 结构分析）：
 * 半 turn=incomplete_turn/start_not_turn_boundary；来源仍会变化=end_not_turn_boundary/includes_recent_turn；
 * 未完成工具=unclosed_tool/unbalanced_tool；删除围栏已生效=source_fenced；受保护头部=includes_system_snapshot。
 */
export const SUMMARY_CANDIDATE_BLOCK_REASONS = [
  'range_invalid', 'half_turn', 'tool_causal_incomplete', 'source_still_mutable',
  'deletion_fence_active', 'protected_header',
] as const;
export type SummaryCandidateBlockReason = (typeof SUMMARY_CANDIDATE_BLOCK_REASONS)[number];

export interface SummaryCandidateTriggerInput {
  /** 该 thread 的完整事件流 watermark（复用 CTX-05 判定模型，含 status 以检测围栏）。 */
  events: readonly CompressibleEventWatermark[];
  /** 候选摘要范围（[startSeq, endSeq]，含端点）。 */
  range: CompressibleRange;
  sourceCommitted: boolean;
  boundSourceRange: boolean;
  claimSpanValidation: boolean;
  /** 后台已发现该范围接近未来预算阈值（可选调度提示；仍须边界稳定才触发）。 */
  backgroundBudgetApproach: boolean;
}

/** CTX-05 边界拒因 → MEM-09 摘要阻断理由（复用映射，不重写判定）。 */
export function mapCompressionBoundaryToSummaryBlock(reason: CompressionBoundaryRejectReason): SummaryCandidateBlockReason {
  switch (reason) {
    case 'source_fenced': return 'deletion_fence_active';
    case 'includes_system_snapshot': return 'protected_header';
    case 'start_not_turn_boundary':
    case 'incomplete_turn': return 'half_turn';
    case 'end_not_turn_boundary':
    case 'includes_recent_turn': return 'source_still_mutable';
    case 'unclosed_tool':
    case 'unbalanced_tool': return 'tool_causal_incomplete';
    case 'range_invalid': return 'range_invalid';
    default: {
      // 运行时穷尽守卫：CTX-05 未来新增拒因时必须同步在上方新增映射分支——case 一旦补全，TS 会把
      // 这里的 `reason` 收窄成 never（`_exhaustiveCheck` 编译期红），漏加即编译失败（新增 CTX-05 拒因
      // 必须同步此处）。运行期若仍被非法值（经 cast / 畸形数据）绕过，fail-closed 降级为 range_invalid，
      // 绝不静默返回 undefined（保证 verdict.blockReason 永远是合法 enum）。
      const _exhaustiveCheck: never = reason;
      return 'range_invalid';
    }
  }
}

export function evaluateSummaryCandidateTrigger(input: SummaryCandidateTriggerInput): LifecycleTriggerVerdict {
  // 边界稳定性复用 CTX-05 classifyCompressibleRange（确定性重算，绝不采信调用方自报「稳定」标志——伪造条件无法通过）。
  const boundary = classifyCompressibleRange([...(input?.events ?? [])], input?.range ?? { startSeq: 0, endSeq: 0 });
  if (!boundary.compressible) return blocked('summary_candidate', mapCompressionBoundaryToSummaryBlock(boundary.reason!));

  const unmet = unmetOf(
    ['source_events_committed', 'bound_source_range_digest_version', 'claim_span_validation'] as const,
    {
      source_events_committed: input?.sourceCommitted === true,
      bound_source_range_digest_version: input?.boundSourceRange === true,
      claim_span_validation: input?.claimSpanValidation === true,
    },
  );
  if (unmet.length > 0) return blocked('summary_candidate', 'precondition_unmet', unmet);

  return fired('summary_candidate', input?.backgroundBudgetApproach ? 'approaching_budget_threshold' : 'range_stable');
}

/* ═════════════════════════ ③ force_compression：强制压缩 ═════════════════════════ */

/**
 * 派发前预算状态 seam（镜像 CTX-02 `CONTEXT_BUDGET_STATUSES` within_budget/degraded/rejected）。
 * domain 不能 import ai-runtime（包边界），运行时接线时把真实 `planDispatchBudget` 结果映射进来。
 */
export const FORCE_COMPRESSION_BUDGET_STATUSES = ['within_budget', 'degraded', 'rejected'] as const;
export type ForceCompressionBudgetStatus = (typeof FORCE_COMPRESSION_BUDGET_STATUSES)[number];

/** 派发阶段（显式 enum）：pre_dispatch=派发前（唯一允许压缩）；provider_overwindow=收到超窗错误后（禁）；dispatched_unknown=已派发结果 unknown（禁重发）。 */
export const FORCE_COMPRESSION_DISPATCH_PHASES = ['pre_dispatch', 'provider_overwindow', 'dispatched_unknown'] as const;
export type ForceCompressionDispatchPhase = (typeof FORCE_COMPRESSION_DISPATCH_PHASES)[number];

export const FORCE_COMPRESSION_ALLOW_REASONS = ['pre_dispatch_budget_exceeded'] as const;
export type ForceCompressionAllowReason = (typeof FORCE_COMPRESSION_ALLOW_REASONS)[number];

/** 必须先满足（design L136）：预算含全部组件（系统/授权/schema/工具/RAG/snapshot/recent turns/输出 reserve/安全余量）+ 有可用已验证摘要或确定性降级路径。 */
export const FORCE_COMPRESSION_PRECONDITIONS = ['full_budget_accounted', 'verified_summary_or_degrade_path'] as const;
export type ForceCompressionPrecondition = (typeof FORCE_COMPRESSION_PRECONDITIONS)[number];

/** 不允许触发（design L136）：预算未超（无需压缩）；provider 超窗错误后盲目压缩重发；已派发 unknown 同键重试。 */
export const FORCE_COMPRESSION_BLOCK_REASONS = [
  'budget_within_limits', 'retroactive_overwindow_compress', 'dispatched_unknown_resend',
] as const;
export type ForceCompressionBlockReason = (typeof FORCE_COMPRESSION_BLOCK_REASONS)[number];

export interface ForceCompressionTriggerInput {
  dispatchPhase: ForceCompressionDispatchPhase;
  budgetStatus: ForceCompressionBudgetStatus;
  fullBudgetAccounted: boolean;
  verifiedSummaryOrDegradePath: boolean;
}

export function evaluateForceCompressionTrigger(input: ForceCompressionTriggerInput): LifecycleTriggerVerdict {
  // 伪造/未知派发阶段、预算状态 → fail-closed（伪造「超限」预算结果无法绕过）。
  if (!(FORCE_COMPRESSION_DISPATCH_PHASES as readonly string[]).includes(input?.dispatchPhase ?? ''))
    return blocked('force_compression', 'invalid_trigger_input');
  if (!(FORCE_COMPRESSION_BUDGET_STATUSES as readonly string[]).includes(input?.budgetStatus ?? ''))
    return blocked('force_compression', 'invalid_trigger_input');
  // 硬规则 1：已派发 unknown → 绝不重发（CTX-05 unknown sticky 复用，0 重发）。
  if (input?.dispatchPhase === 'dispatched_unknown') return blocked('force_compression', 'dispatched_unknown_resend');
  // 硬规则 1：provider 超窗错误后 → 绝不盲目压缩重发（design L136「不允许」）。
  if (input?.dispatchPhase === 'provider_overwindow') return blocked('force_compression', 'retroactive_overwindow_compress');
  // 硬规则 1：派发前但预算未超 → 无需压缩（不触发）。
  if (input?.budgetStatus === 'within_budget') return blocked('force_compression', 'budget_within_limits');

  const unmet = unmetOf(
    ['full_budget_accounted', 'verified_summary_or_degrade_path'] as const,
    {
      full_budget_accounted: input?.fullBudgetAccounted === true,
      verified_summary_or_degrade_path: input?.verifiedSummaryOrDegradePath === true,
    },
  );
  if (unmet.length > 0) return blocked('force_compression', 'precondition_unmet', unmet);

  // budgetStatus ∈ {degraded, rejected} 都意味着「完整渲染估算曾超限」（degraded=超限后确定性裁剪；rejected=裁无可裁仍超）。
  return fired('force_compression', 'pre_dispatch_budget_exceeded');
}

/* ═════════════════════════ ④ fact_write：长期事实写入 ═════════════════════════ */

/** 事实生产者（显式 enum；模型摘要 / 评分猜测 / 闲聊是「不可激活」来源，用户确认 / 受信业务事实是「可激活」来源）。 */
export const FACT_WRITE_PRODUCERS = [
  'model_summary', 'scoring_guess', 'casual_chat', 'user_confirmation', 'business_fact',
] as const;
export type FactWriteProducer = (typeof FACT_WRITE_PRODUCERS)[number];

/** 目标状态（只接受 candidate / active；其余 MEM-13 状态是 confirm/correct/revoke/expire 的受控转移，不是「写入」）。 */
export const FACT_WRITE_TARGET_STATUSES = ['candidate', 'active'] as const;
export type FactWriteTargetStatus = (typeof FACT_WRITE_TARGET_STATUSES)[number];

/** 来源信任（镜像 MEM-13 source_trust：business_fact 激活要求 trusted）。 */
export const FACT_WRITE_SOURCE_TRUSTS = ['trusted', 'untrusted'] as const;
export type FactWriteSourceTrust = (typeof FACT_WRITE_SOURCE_TRUSTS)[number];

export const FACT_WRITE_ALLOW_REASONS = ['model_candidate', 'user_confirmation', 'business_fact'] as const;
export type FactWriteAllowReason = (typeof FACT_WRITE_ALLOW_REASONS)[number];

/** 必须先满足（design L137）：来源 span / purpose / consent / 有效期 / 冲突关系 / 写前校验。 */
export const FACT_WRITE_PRECONDITIONS = [
  'source_span', 'purpose', 'consent', 'valid_until', 'conflict_relationship', 'write_validation',
] as const;
export type FactWritePrecondition = (typeof FACT_WRITE_PRECONDITIONS)[number];

/** 不允许触发（design L137）：模型摘要 / 评分猜测 / 闲聊直接升级 active；未受信 business_fact；非法目标状态。 */
export const FACT_WRITE_BLOCK_REASONS = [
  'model_summary_upgrade', 'score_guess_upgrade', 'casual_chat_upgrade', 'untrusted_business_fact', 'invalid_target_status',
] as const;
export type FactWriteBlockReason = (typeof FACT_WRITE_BLOCK_REASONS)[number];

export interface FactWriteTriggerInput {
  producer: FactWriteProducer;
  /** 目标状态（candidate / active；其它 MEM-13 状态判 invalid_target_status）。 */
  targetStatus: string;
  sourceTrust: FactWriteSourceTrust;
  sourceSpanPresent: boolean;
  purposePresent: boolean;
  consentPresent: boolean;
  validUntilPresent: boolean;
  conflictRelationshipPresent: boolean;
  writeValidationPassed: boolean;
}

export function evaluateFactWriteTrigger(input: FactWriteTriggerInput): LifecycleTriggerVerdict {
  // 伪造/未知生产者或来源信任 → fail-closed（绝不把未知来源当「可激活」）。
  if (!(FACT_WRITE_PRODUCERS as readonly string[]).includes(input?.producer ?? ''))
    return blocked('fact_write', 'invalid_trigger_input');
  if (!(FACT_WRITE_SOURCE_TRUSTS as readonly string[]).includes(input?.sourceTrust ?? ''))
    return blocked('fact_write', 'invalid_trigger_input');
  const target = input?.targetStatus;
  if (target !== 'candidate' && target !== 'active') return blocked('fact_write', 'invalid_target_status');

  // 硬规则 2：只有用户确认或受信业务事实可激活 active（复用 MEM-13 状态机：模型/评分猜测/闲聊只 candidate）。
  if (target === 'active') {
    if (input?.producer === 'model_summary') return blocked('fact_write', 'model_summary_upgrade');
    if (input?.producer === 'scoring_guess') return blocked('fact_write', 'score_guess_upgrade');
    if (input?.producer === 'casual_chat') return blocked('fact_write', 'casual_chat_upgrade');
    if (input?.producer === 'business_fact' && input?.sourceTrust !== 'trusted') return blocked('fact_write', 'untrusted_business_fact');
  }

  const unmet = unmetOf(
    ['source_span', 'purpose', 'consent', 'valid_until', 'conflict_relationship', 'write_validation'] as const,
    {
      source_span: input?.sourceSpanPresent === true,
      purpose: input?.purposePresent === true,
      consent: input?.consentPresent === true,
      valid_until: input?.validUntilPresent === true,
      conflict_relationship: input?.conflictRelationshipPresent === true,
      write_validation: input?.writeValidationPassed === true,
    },
  );
  if (unmet.length > 0) return blocked('fact_write', 'precondition_unmet', unmet);

  // allowReason 必须从实际 producer 推导（审计 minor-1：不得硬编码 'model_candidate'）。
  // 模型派生产物（model_summary / scoring_guess / casual_chat）只能 candidate → model_candidate；
  // user_confirmation / business_fact 即便目标仍是 candidate 也标其真实 producer，绝不误标为 model_candidate。
  const allowReason: FactWriteAllowReason =
    input!.producer === 'user_confirmation' ? 'user_confirmation'
    : input!.producer === 'business_fact' ? 'business_fact'
    : 'model_candidate';
  return fired('fact_write', allowReason);
}

/* ═════════════════════════ ⑤ index_generation：embedding / 向量索引 ═════════════════════════ */

/** 索引来源种类（显式 enum）：已验证摘要 / 已验证事实 / 有授权+脱敏规则的事件片段 / 全量原文（禁）。 */
export const INDEX_GENERATION_SOURCE_KINDS = [
  'verified_summary', 'verified_fact', 'authorized_event_fragment', 'raw_corpus',
] as const;
export type IndexGenerationSourceKind = (typeof INDEX_GENERATION_SOURCE_KINDS)[number];

export const INDEX_GENERATION_ALLOW_REASONS = [
  'verified_summary_frozen', 'verified_fact_frozen', 'authorized_event_fragment',
] as const;
export type IndexGenerationAllowReason = (typeof INDEX_GENERATION_ALLOW_REASONS)[number];

/** 必须先满足（design L138）：source version·digest / embedding revision / purpose / expiry / privacy epoch / 删除 target 已可用。 */
export const INDEX_GENERATION_PRECONDITIONS = [
  'source_version_digest', 'embedding_revision', 'purpose', 'expiry', 'privacy_epoch', 'deletion_target',
] as const;
export type IndexGenerationPrecondition = (typeof INDEX_GENERATION_PRECONDITIONS)[number];

/** 不允许触发（design L138）：全量原文无差别外送 embedding / 把 vector hit 当作事实 / 撤回后 fence。 */
export const INDEX_GENERATION_BLOCK_REASONS = [
  'raw_corpus_indiscriminate_embedding', 'vector_hit_as_fact', 'source_fenced',
] as const;
export type IndexGenerationBlockReason = (typeof INDEX_GENERATION_BLOCK_REASONS)[number];

export interface IndexGenerationTriggerInput {
  sourceKind: IndexGenerationSourceKind;
  sourceFenced: boolean;
  sourceVersionDigestPresent: boolean;
  embeddingRevisionPresent: boolean;
  purposePresent: boolean;
  expiryPresent: boolean;
  privacyEpochPresent: boolean;
  deletionTargetAvailable: boolean;
  vectorHitAsFact: boolean;
}

export function evaluateIndexGenerationTrigger(input: IndexGenerationTriggerInput): LifecycleTriggerVerdict {
  // 伪造/未知来源种类 → fail-closed（绝不把未知来源当「已授权事件片段」）。
  if (!(INDEX_GENERATION_SOURCE_KINDS as readonly string[]).includes(input?.sourceKind ?? ''))
    return blocked('index_generation', 'invalid_trigger_input');
  if (input?.sourceKind === 'raw_corpus') return blocked('index_generation', 'raw_corpus_indiscriminate_embedding');
  if (input?.vectorHitAsFact === true) return blocked('index_generation', 'vector_hit_as_fact');
  // 撤回后（CTX-06/MEM-10/11 fence）：来源 manifest 已 fenced → 索引 generation 拒（旧 generation 同步失效）。
  if (input?.sourceFenced === true) return blocked('index_generation', 'source_fenced');

  const unmet = unmetOf(
    ['source_version_digest', 'embedding_revision', 'purpose', 'expiry', 'privacy_epoch', 'deletion_target'] as const,
    {
      source_version_digest: input?.sourceVersionDigestPresent === true,
      embedding_revision: input?.embeddingRevisionPresent === true,
      purpose: input?.purposePresent === true,
      expiry: input?.expiryPresent === true,
      privacy_epoch: input?.privacyEpochPresent === true,
      deletion_target: input?.deletionTargetAvailable === true,
    },
  );
  if (unmet.length > 0) return blocked('index_generation', 'precondition_unmet', unmet);

  const allowReason: IndexGenerationAllowReason =
    input!.sourceKind === 'verified_summary' ? 'verified_summary_frozen'
    : input!.sourceKind === 'verified_fact' ? 'verified_fact_frozen'
    : 'authorized_event_fragment';
  return fired('index_generation', allowReason);
}

/* ═════════════════════════ ⑥ memory_recall：记忆召回 ═════════════════════════ */

export const MEMORY_RECALL_ALLOW_REASONS = ['route_requires_memory'] as const;
export type MemoryRecallAllowReason = (typeof MEMORY_RECALL_ALLOW_REASONS)[number];

/** 必须先满足（design L139）：先查当前业务真相和精确实体 / 再按 owner·purpose·consent·epoch·status·time 过滤 / 结果进本轮冻结 snapshot。 */
export const MEMORY_RECALL_PRECONDITIONS = [
  'business_truth_checked', 'governance_filtered', 'result_frozen_into_snapshot',
] as const;
export type MemoryRecallPrecondition = (typeof MEMORY_RECALL_PRECONDITIONS)[number];

/** 不允许触发（design L139）：每次请求无条件召回 / 高影响决策直接以记忆摘要作事实依据 / 撤回后 fence / 路由不需要 / 授权不允许。 */
export const MEMORY_RECALL_BLOCK_REASONS = [
  'unconditional_recall', 'high_impact_decision_recall', 'source_fenced',
  'route_not_requiring_memory', 'authorization_not_allowed',
] as const;
export type MemoryRecallBlockReason = (typeof MEMORY_RECALL_BLOCK_REASONS)[number];

export interface MemoryRecallTriggerInput {
  routeNeedsCrossTurnContext: boolean;
  subjectPurposeAuthorized: boolean;
  businessTruthChecked: boolean;
  governanceFiltered: boolean;
  resultFrozenIntoSnapshot: boolean;
  unconditionalRecall: boolean;
  highImpactDecisionContext: boolean;
  sourceFenced: boolean;
}

export function evaluateMemoryRecallTrigger(input: MemoryRecallTriggerInput): LifecycleTriggerVerdict {
  if (input?.unconditionalRecall === true) return blocked('memory_recall', 'unconditional_recall');
  if (input?.highImpactDecisionContext === true) return blocked('memory_recall', 'high_impact_decision_recall');
  // 撤回后 fence 拒：召回前围栏已生效 → 0 召回（复用 MEM-14 两阶段召回硬过滤 + MEM-07 数据围栏）。
  if (input?.sourceFenced === true) return blocked('memory_recall', 'source_fenced');
  // 允许触发的两个前提（design L139）：路由明确需要跨 turn/跨会话 且 主体/purpose/授权范围允许。
  if (input?.routeNeedsCrossTurnContext !== true) return blocked('memory_recall', 'route_not_requiring_memory');
  if (input?.subjectPurposeAuthorized !== true) return blocked('memory_recall', 'authorization_not_allowed');

  const unmet = unmetOf(
    ['business_truth_checked', 'governance_filtered', 'result_frozen_into_snapshot'] as const,
    {
      business_truth_checked: input?.businessTruthChecked === true,
      governance_filtered: input?.governanceFiltered === true,
      result_frozen_into_snapshot: input?.resultFrozenIntoSnapshot === true,
    },
  );
  if (unmet.length > 0) return blocked('memory_recall', 'precondition_unmet', unmet);

  return fired('memory_recall', 'route_requires_memory');
}

/* ═════════════════════════ 公共：判决类型 + 分派入口 ═════════════════════════ */

export type LifecycleTriggerAllowReason =
  | EventIngestAllowReason | SummaryCandidateAllowReason | ForceCompressionAllowReason
  | FactWriteAllowReason | IndexGenerationAllowReason | MemoryRecallAllowReason;

export type LifecycleTriggerBlockReason =
  | EventIngestBlockReason | SummaryCandidateBlockReason | ForceCompressionBlockReason
  | FactWriteBlockReason | IndexGenerationBlockReason | MemoryRecallBlockReason
  | 'precondition_unmet' | 'invalid_trigger_input';

export type LifecycleTriggerPrecondition =
  | EventIngestPrecondition | SummaryCandidatePrecondition | ForceCompressionPrecondition
  | FactWritePrecondition | IndexGenerationPrecondition | MemoryRecallPrecondition;

/** 触发器判决（显式 enum：blockReason / unmetPreconditions 非布尔汤）。 */
export interface LifecycleTriggerVerdict {
  trigger: LifecycleTrigger;
  decision: LifecycleTriggerDecision;
  allowReason: LifecycleTriggerAllowReason | null;
  blockReason: LifecycleTriggerBlockReason | null;
  unmetPreconditions: readonly LifecycleTriggerPrecondition[];
}

/** 编排请求（discriminated union：按触发器名路由到独立决策函数）。 */
export type LifecycleTriggerRequest =
  | { trigger: 'event_ingest'; input: EventIngestTriggerInput }
  | { trigger: 'summary_candidate'; input: SummaryCandidateTriggerInput }
  | { trigger: 'force_compression'; input: ForceCompressionTriggerInput }
  | { trigger: 'fact_write'; input: FactWriteTriggerInput }
  | { trigger: 'index_generation'; input: IndexGenerationTriggerInput }
  | { trigger: 'memory_recall'; input: MemoryRecallTriggerInput };

/** 编排入口：按触发器名分派到对应独立决策函数（六触发器隔离，互不串扰）。 */
export function evaluateLifecycleTrigger(request: LifecycleTriggerRequest): LifecycleTriggerVerdict {
  switch (request?.trigger) {
    case 'event_ingest': return evaluateEventIngestTrigger(request.input);
    case 'summary_candidate': return evaluateSummaryCandidateTrigger(request.input);
    case 'force_compression': return evaluateForceCompressionTrigger(request.input);
    case 'fact_write': return evaluateFactWriteTrigger(request.input);
    case 'index_generation': return evaluateIndexGenerationTrigger(request.input);
    case 'memory_recall': return evaluateMemoryRecallTrigger(request.input);
    default:
      // 未知/缺失触发器名（只能经非法 cast 或畸形运行时数据到达——discriminated union 已在编译期把
      // 合法触发器名钉死，switch 也覆盖了全部 6 个 case）。fail-closed 拒绝；verdict.trigger 必须始终是
      // 合法 enum，绝不把运行时垃圾值（如 'banana'）塞进 verdict.trigger。这里统一回填 'event_ingest'
      // 作占位（真正信息在 blockReason=invalid_trigger_input）。
      return blocked('event_ingest', 'invalid_trigger_input');
  }
}

/* ═════════════════════════ 内部 helper（非导出） ═════════════════════════ */

function fired(trigger: LifecycleTrigger, allowReason: LifecycleTriggerAllowReason): LifecycleTriggerVerdict {
  return { trigger, decision: 'fire', allowReason, blockReason: null, unmetPreconditions: [] };
}

function blocked(
  trigger: LifecycleTrigger,
  blockReason: LifecycleTriggerBlockReason,
  unmetPreconditions: readonly LifecycleTriggerPrecondition[] = [],
): LifecycleTriggerVerdict {
  return { trigger, decision: 'blocked', allowReason: null, blockReason, unmetPreconditions };
}

/** 把「具名前置条件是否满足」的布尔事实转成「未满足前置条件」的显式 enum 列表（判决不吐布尔汤）。 */
function unmetOf<K extends string>(
  keys: readonly K[],
  facts: Readonly<Record<K, boolean>>,
): LifecycleTriggerPrecondition[] {
  const unmet: LifecycleTriggerPrecondition[] = [];
  for (const k of keys) if (facts[k] !== true) unmet.push(k as LifecycleTriggerPrecondition);
  return unmet;
}
