/**
 * @meetwise/domain · 评分 operation 路由与成本（SCOR-04）纯域原语（零 IO、零模型、零 db）。
 *
 * 评分作用域决策原语（seam-before-wiring，**尚未被任何生产入口调用**）。本模块把
 * interview-scoring-measurement.md §6「成本、模型与降级」的四行 operation 路由表**编码**成
 * 可测纯函数，但**不是运行时单一真相**：生产评分路径 evaluate-answer → invokeEvaluationOnce →
 * `invoke()` 完全旁路本模块，运行时 operation 强制现由 MODEL-OP 的 `model-operation-registry.ts`
 * （`interview.answer-scoring.v1` maxDispatches:1 / fallback / meter）+ `invoke.ts` 承担。
 * 本模块待 MODEL-OP 接线后作为评分策略层被消费（见下方跨侧词汇映射）：
 *   - 确定性步骤（question/answer identity、长度、跳过、注入、span/hash、公式聚合）= 0 次模型调用，
 *     失败语义为明确拒绝/澄清/`unscored`。
 *   - rubric criterion 证据抽取 = 受限低成本文本模型，**至多一次已登记 attempt**；unknown 不重发，
 *     转 `unscored`/`review_required`。
 *   - 高风险/抽样复核 = 独立模型或人工，仅按风险/分歧/抽样/B 端用途触发，**不覆盖原结果**
 *     （新增 scorecard/review 版本）。
 *   - 报告叙事 = 只消费已通过用途门的 scorecard，不重新猜总分，失败只使报告不可用（`report_unavailable`）。
 *
 * 每 operation 有 operation 预算、最大 attempt、预算整笔消费（评分作用域微厘，非真实每 token 计量）、降级。
 * 供应商请求已派发后**无自动模型替换 / 无同键重试**：调用前冻结 input/rubric/用途/预算，调用后只结算同一冻结版本。
 *
 * ⚠️ MODEL-OP 边界（硬约束）：本模块只建**评分作用域**的 operation 路由/attempt/预算消费。它**不**是
 * 跨切面统一模型出口/成本计量（MODEL-OP-01…04）——不重做 `invoke()` 的 durable claim / ai_cost
 * settle、不改 `model-operation-registry`/`model-operation-binding`/`usage-reconciliation`。
 * 模型调用通过本模块定义的 `ScoringModelTransport` seam 注入（类型镜像 ai-runtime `ModelResult`），
 * 真实 model 归 MODEL-OP 侧的 `modelFor`/`openAICompatibleClient`；proof 用 fake transport 捕获
 * attempt 计数/预算/降级语义，绝不做真实付费/网络调用。
 *
 * 「已登记 attempt」的持久化根不在本模块（本模块零 db）：它已由 SCOR-01/02 迁移 0100 的
 * `score_request` 状态机（claimed → dispatched → scored/fenced）提供；本模块是它的**决策前置层**
 * ——决定哪一步该走哪条 operation、允许几次 attempt、预算够不够、失败往哪个 ScoreCard 状态降级。
 */

/* ── 跨侧词汇映射（漂移 pin）：接线时必须逐条对齐，否则绕过 score_request 状态机/幂等 ──
 * 本模块 ScoringOperationKind  ↔  MODEL-OP operationId                 ↔  DB score_request 状态机
 *   deterministic              ↔  （无；确定性步骤绝不进模型注册表）      ↔  不派发（无 request 行）
 *   criterion_evidence         ↔  interview.answer-scoring.v1          ↔  claimed → dispatched → scored/fenced
 *   selective_review           ↔  （registry 尚无专属 operationId；      ↔  claimed → dispatched → scored
 *                                   复核独立 attempt/计量/版本，接线时须先登记，否则复用 answer-scoring 台账）
 *   report_narrative           ↔  report.narrative.v1                  ↔  claimed → dispatched → scored/fenced
 * 计量：本模块 SCORING_COST_METER='micro_cny' 预算整笔消费 ↔ MODEL-OP meter:'text-tokens' 真实每 token 定价
 *      （真实定价/结算归 MODEL-OP-02 price book，本模块只做评分作用域预算上限锚，不扩权全局成本计量）。
 * attempt：本模块 maxAttempts（模型 operation 恒 1）↔ MODEL-OP maxDispatches:1（至多一次已登记派发）。
 */
import { createHash } from 'node:crypto';
import { isScoreCardScorable, type ScoreCardStatus } from './scoring-fact-root.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/* ── ① operation 分类（§6 路由表第 1 列「默认执行器」的代码化）────────────── */

export const SCORING_OPERATION_KINDS = [
  'deterministic', 'criterion_evidence', 'selective_review', 'report_narrative',
] as const;
export type ScoringOperationKind = (typeof SCORING_OPERATION_KINDS)[number];

/**
 * 确定性步骤（§6 第 1 行）：纯确定性代码，0 次模型调用。逐项枚举，**绝不**出现在模型 operation
 * 注册表里（对齐 ai-runtime `DETERMINISTIC_NODE_MATRIX` 的「确定性节点 dispatch 计数恒 0」语义）。
 */
export const DETERMINISTIC_SCORING_STEPS = [
  'question_answer_identity',      // 题/答身份
  'answer_length_check',           // 长度
  'skip_check',                    // 跳过
  'injection_handling',            // 注入（按数据处理，不喂模型）
  'span_hash_verification',        // span/hash 复验
  'deterministic_formula_aggregation', // 公式聚合（模型不输出自由总分）
] as const;
export type DeterministicScoringStep = (typeof DETERMINISTIC_SCORING_STEPS)[number];

/** 模型步骤（§6 第 2/3/4 行）：各自受限、各自计量、各自降级。 */
export const MODEL_SCORING_STEPS = [
  'rubric_criterion_evidence',     // ② rubric criterion 证据抽取（受限低成本文本模型）
  'selective_review',              // ③ 高风险/抽样复核（独立模型或人工）
  'report_narrative',              // ④ 报告叙事（文本模型）
] as const;
export type ModelScoringStep = (typeof MODEL_SCORING_STEPS)[number];

export type ScoringStep = DeterministicScoringStep | ModelScoringStep;

/** 确定性/模型步骤 → operation 的路由（§6 第 2 列「默认执行器」）。未知 step fail-closed。 */
export function routeScoringStep(step: ScoringStep): ScoringOperationKind {
  if ((DETERMINISTIC_SCORING_STEPS as readonly string[]).includes(step)) return 'deterministic';
  if (step === 'rubric_criterion_evidence') return 'criterion_evidence';
  if (step === 'selective_review') return 'selective_review';
  if (step === 'report_narrative') return 'report_narrative';
  return fail('scoring_step_unknown');
}

/* ── ② 冻结 operation 路由表（预算/attempt/计量/降级）────────────────────── */

/**
 * 评分作用域 operation 预算上限（微厘 micro-CNY，1 微厘 = 1e-6 元）。这是保守占位策略常量，
 * 仅作评分域内「单次派发预算上限」的代码锚；真实每 token 定价/结算归 MODEL-OP-02 price book，
 * 此处不扩权全局成本计量（已知留白，见 proof 头注释）。
 */
export const SCORING_CRITERION_EVIDENCE_BUDGET_MICRO_CNY = 20_000;
export const SCORING_SELECTIVE_REVIEW_BUDGET_MICRO_CNY = 60_000;
export const SCORING_REPORT_NARRATIVE_BUDGET_MICRO_CNY = 80_000;

export const SCORING_COST_METER = 'micro_cny' as const;
export type ScoringCostMeter = typeof SCORING_COST_METER;

export interface ScoringOperationPolicy {
  readonly operation: ScoringOperationKind;
  /** 模型调用次数上限：确定性 = 0；其余 = 1（至多一次已登记 attempt）。 */
  readonly maxModelCalls: 0 | 1;
  /** 已登记 attempt 上限（模型 operation 恒 1；确定性恒 0）。 */
  readonly maxAttempts: number;
  /** 单次派发的评分作用域预算上限（微厘）。 */
  readonly operationBudgetMicroCny: number;
  /** 拒绝/失败后的确定性降级（§6 第 4 列「失败语义」）。 */
  readonly degradationOnRefusal: ScoringDegradation;
}

/** 降级目标：ScoreCard 状态（`unscored`/`review_required`）或报告不可用（非 ScoreCard 状态）。 */
export type ScoringDegradation = 'unscored' | 'review_required' | 'report_unavailable';

/**
 * 冻结 operation 路由表（§6 路由表的代码化，逐列一致）：
 *   - deterministic：0 次模型调用，失败 `unscored`。
 *   - criterion_evidence：至多 1 次已登记 attempt，失败（含 unknown）`review_required`/`unscored`。
 *   - selective_review：独立 1 次 attempt，失败仍 `review_required`（复核失败不覆盖原结果）。
 *   - report_narrative：1 次 attempt，失败只 `report_unavailable`（不重新猜总分）。
 */
export const SCORING_OPERATION_POLICIES: Readonly<Record<ScoringOperationKind, ScoringOperationPolicy>> = Object.freeze({
  deterministic: Object.freeze({
    operation: 'deterministic', maxModelCalls: 0, maxAttempts: 0,
    operationBudgetMicroCny: 0, degradationOnRefusal: 'unscored',
  }),
  criterion_evidence: Object.freeze({
    operation: 'criterion_evidence', maxModelCalls: 1, maxAttempts: 1,
    operationBudgetMicroCny: SCORING_CRITERION_EVIDENCE_BUDGET_MICRO_CNY, degradationOnRefusal: 'review_required',
  }),
  selective_review: Object.freeze({
    operation: 'selective_review', maxModelCalls: 1, maxAttempts: 1,
    operationBudgetMicroCny: SCORING_SELECTIVE_REVIEW_BUDGET_MICRO_CNY, degradationOnRefusal: 'review_required',
  }),
  report_narrative: Object.freeze({
    operation: 'report_narrative', maxModelCalls: 1, maxAttempts: 1,
    operationBudgetMicroCny: SCORING_REPORT_NARRATIVE_BUDGET_MICRO_CNY, degradationOnRefusal: 'report_unavailable',
  }),
});

/** 取 operation policy；未知 operation fail-closed。 */
export function scoringOperationPolicy(operation: ScoringOperationKind): ScoringOperationPolicy {
  const policy = SCORING_OPERATION_POLICIES[operation];
  if (!policy) return fail('scoring_operation_unknown');
  return policy;
}

/* ── ③ 失败语义 → 降级（§6 第 4 列）────────────────────────────────────── */

export type ScoringFailureKind =
  | 'pre_dispatch_refusal'        // 派发前确定性拒绝（schema/校验/非法输入）
  | 'known_not_executed'          // 供应商明确负响应，未执行
  | 'external_outcome_unknown'    // 已派发后外部结果不明（超时/5xx/网络）
  | 'budget_exceeded'             // 预算不足
  | 'max_attempts_exceeded';      // attempt 上限已到

/**
 * operation × 失败 → 降级（§6 第 4 列 + §5「没有足够证据则无分，不取模型猜测的中性分」）：
 *   - report_narrative：**任何**失败只 `report_unavailable`（不重新猜总分、不产出 score）。
 *   - selective_review：复核失败仍 `review_required`（复核是裁决通道，失败不改写原卡）。
 *   - criterion_evidence：unknown → `review_required`（结果不明不判 0 分）；其余明确拒绝 → `unscored`。
 *   - deterministic：`unscored`（明确拒绝/澄清/unscored，绝不伪装成候选人 0 分）。
 */
export function degradeScoringOperation(operation: ScoringOperationKind, failure: ScoringFailureKind): ScoringDegradation {
  switch (operation) {
    case 'report_narrative': return 'report_unavailable';
    case 'selective_review': return 'review_required';
    case 'criterion_evidence':
      return failure === 'external_outcome_unknown' ? 'review_required' : 'unscored';
    case 'deterministic': return 'unscored';
    default: return fail('scoring_operation_unknown');
  }
}

/* ── ④ 冻结派发（调用前冻结 input/rubric/用途/预算）──────────────────────── */

export interface FreezeScoringDispatchInput {
  operation: ScoringOperationKind;
  /** 已通过的、不可变的数据输入（评分：题目+答案；报告：已过用途门的 scorecard 引用）。 */
  input: string;
  /** 冻结的 rubric（criterion/权重/锚点/上限；报告叙事无 rubric，传用途门声明）。 */
  rubric: string;
  /** 本次派发预留的评分作用域预算（微厘；必须 ≤ operation 预算上限）。 */
  usageBudgetMicroCny: number;
}

export interface ScoringFrozenDispatch {
  /** sha256(operation + inputDigest + rubricDigest + budget + meter)：派发/结算的不可变锚。 */
  frozenVersion: string;
  operation: ScoringOperationKind;
  inputDigest: string;
  rubricDigest: string;
  usageBudgetMicroCny: number;
  meter: ScoringCostMeter;
}

/** 冻结派发：把 input/rubric/用途/预算钉成一个 frozenVersion，调用后只结算这同一版本。 */
export function freezeScoringDispatch(input: FreezeScoringDispatchInput): ScoringFrozenDispatch {
  if (!input || typeof input !== 'object') return fail('scoring_freeze_invalid');
  const policy = scoringOperationPolicy(input.operation);
  // 确定性步骤无模型派发可冻结：任何把它当「可调模型步骤」的调用都是路由腐败，fail-closed。
  if (policy.maxModelCalls === 0) return fail('scoring_deterministic_has_no_dispatch');
  if (!Number.isSafeInteger(input.usageBudgetMicroCny) || input.usageBudgetMicroCny < 0)
    return fail('scoring_budget_invalid');
  if (input.usageBudgetMicroCny > policy.operationBudgetMicroCny) return fail('scoring_budget_over_cap');
  if (typeof input.input !== 'string' || input.input.length === 0) return fail('scoring_freeze_input_invalid');
  if (typeof input.rubric !== 'string' || input.rubric.length === 0) return fail('scoring_freeze_rubric_invalid');
  const inputDigest = sha256(input.input);
  const rubricDigest = sha256(input.rubric);
  const frozenVersion = sha256(JSON.stringify([
    input.operation, inputDigest, rubricDigest, input.usageBudgetMicroCny, SCORING_COST_METER,
  ]));
  return {
    frozenVersion, operation: input.operation, inputDigest, rubricDigest,
    usageBudgetMicroCny: input.usageBudgetMicroCny, meter: SCORING_COST_METER,
  };
}

/* ── ⑤ attempt 台账（至多一次已登记 attempt / 无同键重试 / 只结算同一冻结版本）── */

export interface ScoringAttemptLedger {
  operation: ScoringOperationKind;
  /** 已登记 attempt 数（授权一次 +1；封顶 = policy.maxAttempts）。 */
  attempts: number;
  /** 派发后单向置 true：此后无同键重试、无自动模型替换（§6 最后一段）。 */
  dispatched: boolean;
  /** 派发时冻结的版本锚（settle 只接受它）。 */
  dispatchedFrozenVersion: string | null;
  /** 已结算的冻结版本（null = 未结算；结算一次后不可再结）。 */
  settledFrozenVersion: string | null;
  /** 已消费的评分作用域预算（微厘；整笔消费，非真实每 token 计量——归 MODEL-OP-02 price book）。 */
  consumedBudgetMicroCny: number;
  /** operation 预算上限（微厘，来自 policy）。 */
  capMicroCny: number;
}

/**
 * 建 attempt 台账（评分作用域，纯内存；持久化根是 SCOR-01 score_request 状态机）。
 * `capMicroCny` 可选：默认 = operation 预算上限；调用方可给更紧的 per-request 子预算
 * （≤ operation 上限，超则 fail-closed）。这是「operation 预算」在单次派发上的可强制、可测锚：
 * 冻结派发只校验 ≤ operation 上限，authorize 再校验 ≤ 台账剩余子预算。
 */
export function createScoringAttemptLedger(operation: ScoringOperationKind, capMicroCny?: number): ScoringAttemptLedger {
  const policy = scoringOperationPolicy(operation);
  const cap = capMicroCny === undefined ? policy.operationBudgetMicroCny : capMicroCny;
  if (!Number.isSafeInteger(cap) || cap < 0 || cap > policy.operationBudgetMicroCny)
    return fail('scoring_ledger_cap_invalid');
  return {
    operation, attempts: 0, dispatched: false, dispatchedFrozenVersion: null,
    settledFrozenVersion: null, consumedBudgetMicroCny: 0, capMicroCny: cap,
  };
}

/** 剩余可消费预算（微厘）。 */
export function remainingScoringBudget(ledger: ScoringAttemptLedger): number {
  return Math.max(0, ledger.capMicroCny - ledger.consumedBudgetMicroCny);
}

export type ScoringAttemptError =
  | 'deterministic_step_no_model_call'
  | 'frozen_operation_mismatch'
  | 'max_attempts_exceeded'
  | 'already_dispatched_no_retry'
  | 'budget_exceeded';

export type ScoringAttemptDecision =
  | { ok: true; next: ScoringAttemptLedger }
  | { ok: false; error: ScoringAttemptError };

/**
 * 授权一次 attempt（§6 第 3 列「至多一次已登记 attempt」+ 预算门）。纯函数，不改入参：
 *   - 确定性 operation → 拒（0 模型调用是构造性事实，不是「预算为 0」的巧合）。
 *   - frozen.operation ≠ ledger.operation → 拒（跨 operation 混算，防回填/混算 SCOR-E5）。
 *   - 已派发 → 拒 `already_dispatched_no_retry`（无同键重试）。
 *   - attempts 已到上限 → 拒 `max_attempts_exceeded`。
 *   - 预留预算 > 剩余 → 拒 `budget_exceeded`（预算不足降级/拒绝）。
 */
export function authorizeScoringAttempt(
  ledger: ScoringAttemptLedger, frozen: ScoringFrozenDispatch,
): ScoringAttemptDecision {
  const policy = scoringOperationPolicy(ledger.operation);
  if (frozen.operation !== ledger.operation) return { ok: false, error: 'frozen_operation_mismatch' };
  if (policy.maxModelCalls === 0) return { ok: false, error: 'deterministic_step_no_model_call' };
  if (ledger.dispatched) return { ok: false, error: 'already_dispatched_no_retry' };
  if (ledger.attempts >= policy.maxAttempts) return { ok: false, error: 'max_attempts_exceeded' };
  if (frozen.usageBudgetMicroCny > remainingScoringBudget(ledger)) return { ok: false, error: 'budget_exceeded' };
  return { ok: true, next: { ...ledger, attempts: ledger.attempts + 1 } };
}

/** 标记派发：记录冻结版本锚 + dispatched 单向置 true。派发后无同键重试、无自动模型替换。 */
export function markScoringDispatched(ledger: ScoringAttemptLedger, frozenVersion: string): ScoringAttemptLedger {
  if (ledger.dispatched) return fail('scoring_already_dispatched');
  if (ledger.attempts < 1) return fail('scoring_dispatch_without_attempt');
  return { ...ledger, dispatched: true, dispatchedFrozenVersion: frozenVersion };
}

export type ScoringSettleDecision =
  | { ok: true; next: ScoringAttemptLedger }
  | { ok: false; error: 'already_settled' | 'frozen_version_mismatch' | 'budget_exceeded' | 'not_dispatched' };

/**
 * 结算：只结算**同一冻结版本**（§6「调用后只可将同一冻结版本结算」）。金额是本次派发预留预算的
 * **整笔消费**（consumedBudgetMicroCny），非真实每 token 计量（真实定价/结算归 MODEL-OP-02 price book）。
 *   - 未派发 → 拒；已结算 → 拒 `already_settled`。
 *   - frozenVersion ≠ dispatchedFrozenVersion → 拒 `frozen_version_mismatch`（模型/输入/rubric/预算
 *     在派发后被替换都改变 frozenVersion → 跨版本结算被拒，无自动模型替换）。
 *   - 预算消费 超剩余 → 拒 `budget_exceeded`。
 */
export function settleScoringDispatch(
  ledger: ScoringAttemptLedger, frozenVersion: string, consumedBudgetMicroCny: number,
): ScoringSettleDecision {
  if (!ledger.dispatched || ledger.dispatchedFrozenVersion === null) return { ok: false, error: 'not_dispatched' };
  if (ledger.settledFrozenVersion !== null) return { ok: false, error: 'already_settled' };
  if (frozenVersion !== ledger.dispatchedFrozenVersion) return { ok: false, error: 'frozen_version_mismatch' };
  if (!Number.isSafeInteger(consumedBudgetMicroCny) || consumedBudgetMicroCny < 0) return fail('scoring_settle_cost_invalid');
  if (consumedBudgetMicroCny > remainingScoringBudget(ledger)) return { ok: false, error: 'budget_exceeded' };
  return {
    ok: true,
    next: { ...ledger, settledFrozenVersion: frozenVersion, consumedBudgetMicroCny: ledger.consumedBudgetMicroCny + consumedBudgetMicroCny },
  };
}

/* ── ⑥ 模型 seam（评分作用域，镜像 ai-runtime ModelResult；真实 model 归 MODEL-OP）── */

export type ScoringModelOutcome =
  | { ok: true; raw: unknown }
  | { ok: false; kind: 'deterministic' | 'transient'; externalOutcome?: 'known_not_executed' | 'unknown' };

/** 评分作用域模型 seam：注入真实 modelFor/openAICompatibleClient 或 proof 的 fake transport。 */
export type ScoringModelTransport = (frozen: ScoringFrozenDispatch, attempt: number) => Promise<ScoringModelOutcome>;

export interface ScoringOperationRun {
  /** 终局台账（attempts/dispatched/settled 已推进）。 */
  ledger: ScoringAttemptLedger;
  /** 本次派发终局。 */
  status: 'ok' | 'known_not_executed' | 'unknown' | 'degraded';
  /** 降级（仅非 ok 时非 null）。 */
  degradation: ScoringDegradation | null;
  /** 已结算冻结版本（仅 ok 时非 null）。 */
  settledVersion: string | null;
  /** 模型输出（仅 ok 时非 undefined）。 */
  raw?: unknown;
}

function failureKindForAuthError(error: ScoringAttemptError): ScoringFailureKind {
  // 预算不足 → 预算降级；已派发后被拒（无同键重试）→ 沿用原派发的 unknown 语义（不得假装「未派发」）；
  // 其余（attempt 上限/确定性步骤/跨 operation 混算）→ 派发前拒绝。
  if (error === 'budget_exceeded') return 'budget_exceeded';
  if (error === 'already_dispatched_no_retry') return 'external_outcome_unknown';
  return 'pre_dispatch_refusal';
}

/**
 * 跑一次评分作用域模型 operation（至多一次已登记 attempt + 无同键重试 + 只结算同一冻结版本）。
 * 纯编排：不建全局模型出口，只把授权 → 派发 → 单次 transport → 结算/降级串起来。transport 注入。
 */
export async function runScoringModelOperation(opts: {
  ledger: ScoringAttemptLedger;
  frozen: ScoringFrozenDispatch;
  transport: ScoringModelTransport;
}): Promise<ScoringOperationRun> {
  const auth = authorizeScoringAttempt(opts.ledger, opts.frozen);
  // `ok === false`（非 `!ok`）在 strictNullChecks:false 下仍正确收窄判别（apps/api 也编译本文件）。
  if (auth.ok === false) {
    return {
      ledger: opts.ledger,
      status: 'degraded',
      degradation: degradeScoringOperation(opts.ledger.operation, failureKindForAuthError(auth.error)),
      settledVersion: null,
    };
  }
  // 授权通过（attempt +1）→ 派发（冻结版本锚）→ 至多一次 transport 调用。
  const dispatched = markScoringDispatched(auth.next, opts.frozen.frozenVersion);
  // attempt 序号从 dispatched.attempts 取（maxAttempts 恒 1 时语义等价，但不与派发台账脱节、更诚实）。
  let outcome: ScoringModelOutcome;
  try {
    outcome = await opts.transport(opts.frozen, dispatched.attempts);
  } catch {
    // transport 抛异常（同步 throw / 未捕获 reject）：不得让异常 reject 本函数而跳过降级。
    // 归一为 transient+unknown（原因码 transport_throw 不入类型面，避免与 MODEL-OP ModelResult 漂移），
    // 走既有「已派发后外部结果不明」降级语义：不静默吞成成功/known_not_executed、不重发、不自动换模型。
    outcome = { ok: false, kind: 'transient', externalOutcome: 'unknown' };
  }
  if (outcome.ok === true) {
    // 结算 = 本次派发预留预算的**整笔消费**（usageBudgetMicroCny），非真实每 token 计量
    // （真实每 token 定价/结算归 MODEL-OP-02 price book，本模块只消费预留预算锚）。
    const settle = settleScoringDispatch(dispatched, opts.frozen.frozenVersion, opts.frozen.usageBudgetMicroCny);
    if (settle.ok === false) {
      // 结算失败（只可能 budget_exceeded，因为版本/幂等已满足）→ 降级，不返回结果。
      return {
        ledger: dispatched,
        status: 'degraded',
        degradation: degradeScoringOperation(opts.ledger.operation, 'budget_exceeded'),
        settledVersion: null,
      };
    }
    return { ledger: settle.next, status: 'ok', degradation: null, settledVersion: opts.frozen.frozenVersion, raw: outcome.raw };
  }
  const knownNotExecuted = outcome.externalOutcome === 'known_not_executed'
    || (outcome.externalOutcome === undefined && outcome.kind === 'deterministic');
  if (knownNotExecuted) {
    return {
      ledger: dispatched,
      status: 'known_not_executed',
      degradation: degradeScoringOperation(opts.ledger.operation, 'known_not_executed'),
      settledVersion: null,
    };
  }
  // 已派发后外部结果不明（timeout/5xx/网络）：不重发、不自动换模型、不结算为成功；降级走 unknown 语义。
  return {
    ledger: dispatched,
    status: 'unknown',
    degradation: degradeScoringOperation(opts.ledger.operation, 'external_outcome_unknown'),
    settledVersion: null,
  };
}

/* ── ⑦ 选择性复核（独立 attempt/计量；仅风险/分歧/抽样/B 端用途触发；不覆盖原结果）── */

export interface SelectiveReviewTrigger {
  highRisk: boolean;
  disagreement: boolean;
  sampled: boolean;
  bEndUsage: boolean;
}

/** 是否触发选择性复核（§6 第 3 行「仅按风险、分歧、抽样或 B 端用途触发」）。 */
export function reviewTriggered(trigger: SelectiveReviewTrigger): boolean {
  if (!trigger || typeof trigger !== 'object') return fail('scoring_review_trigger_invalid');
  if (typeof trigger.highRisk !== 'boolean' || typeof trigger.disagreement !== 'boolean'
    || typeof trigger.sampled !== 'boolean' || typeof trigger.bEndUsage !== 'boolean') {
    return fail('scoring_review_trigger_invalid');
  }
  return trigger.highRisk || trigger.disagreement || trigger.sampled || trigger.bEndUsage;
}

export type SelectiveReviewDecision = 'review' | 'skip';

/** 选择性复核决策：四触发源任一命中 → review；否则 skip（不做默认「高质量模型再打一次分」）。 */
export function classifySelectiveReview(trigger: SelectiveReviewTrigger): SelectiveReviewDecision {
  return reviewTriggered(trigger) ? 'review' : 'skip';
}

/**
 * 复核是否独立于原评分版本：复核走独立 attempt/计量 + 独立冻结版本（新增 scorecard/review 版本，
 * 不覆盖原结果）。两个 frozenVersion 不同即证明复核不会改写原卡的结算版本。
 */
export function reviewIsIndependentVersion(originalFrozenVersion: string, reviewFrozenVersion: string): boolean {
  return typeof originalFrozenVersion === 'string' && typeof reviewFrozenVersion === 'string'
    && originalFrozenVersion.length > 0 && reviewFrozenVersion.length > 0
    && originalFrozenVersion !== reviewFrozenVersion;
}

/* ── ⑧ 报告叙事门（只消费已通过用途门的 scorecard；失败只使报告不可用）──────── */

/**
 * 报告叙事只能消费已通过用途门的 scorecard（§6 第 4 行）：只有 `practice_eligible`（C 端练习反馈）
 * 与 `b_review_eligible`（经校准 release + 人工复核的 B 端辅助）通过用途门。复用 SCOR-01 的
 * `isScoreCardScorable` 作为单一真相；`unscored/review_required/calibration_blocked/evidence_invalid`
 * 均未过门，报告不得消费（不把无分/待审状态当素材、不重新猜总分）。
 */
export function canReportConsume(status: ScoreCardStatus): boolean {
  return isScoreCardScorable(status);
}

/** 报告叙事不重新猜总分的构造性保证：report_narrative 的降级恒 `report_unavailable`，永不产出 score。 */
export function reportNeverProducesScore(): boolean {
  return SCORING_OPERATION_POLICIES.report_narrative.degradationOnRefusal === 'report_unavailable'
    && SCORING_OPERATION_POLICIES.report_narrative.operation === 'report_narrative';
}

/* ── ⑨ 路由表静态不变量门（proof 用：表自身一致性，非运行时校验）─────────── */

/** 校验 §6 路由表自身的静态不变量：唯一性/0 模型确定性/1 attempt 模型/非空降级/无重叠。 */
export function validateScoringOperationRouting(): string[] {
  const problems: string[] = [];
  const seen = new Set<ScoringOperationKind>();
  for (const kind of SCORING_OPERATION_KINDS) {
    if (seen.has(kind)) problems.push(`duplicate_operation:${kind}`);
    seen.add(kind);
    const policy = SCORING_OPERATION_POLICIES[kind];
    if (!policy) { problems.push(`policy_missing:${kind}`); continue; }
    if (policy.maxModelCalls === 0 && policy.maxAttempts !== 0) problems.push(`deterministic_attempt_nonzero:${kind}`);
    if (policy.maxModelCalls === 1 && policy.maxAttempts !== 1) problems.push(`model_attempt_not_one:${kind}`);
    if (policy.operationBudgetMicroCny < 0) problems.push(`negative_budget:${kind}`);
    if (policy.degradationOnRefusal === 'report_unavailable' && kind !== 'report_narrative')
      problems.push(`report_only_degradation_elsewhere:${kind}`);
  }
  // 确定性步骤路由到 deterministic；模型步骤路由到非 deterministic operation。
  for (const step of DETERMINISTIC_SCORING_STEPS) if (routeScoringStep(step) !== 'deterministic') problems.push(`deterministic_step_misrouted:${step}`);
  for (const step of MODEL_SCORING_STEPS) if (routeScoringStep(step) === 'deterministic') problems.push(`model_step_misrouted:${step}`);
  return problems;
}
