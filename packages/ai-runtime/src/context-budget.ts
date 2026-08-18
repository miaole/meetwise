/**
 * context-budget.ts — CTX-02 派发前预算器（纯、确定性：无 DB / 网络 / 墙钟 / 随机数）。
 *
 * 职责：把一次模型派发的全部输入组件——系统提示、权限快照、schema、工具、RAG 检索材料、
 * recent turns、候选摘要，加上本轮不可信 user 数据——逐项计入总预算，与「每模型 / 每 service」的
 * contextWindow / maxOutput / toolReserve / safetyMargin 对齐。预算不足时**确定性降级**
 * （按 policy.trimOrder 裁剪低优先级材料 / 减少 recent turns）或**拒绝**（明确错误码），
 * **绝不静默截断后假装完整**。
 *
 * 关键设计（为什么）：
 *  - **估算器版本化 + 校准复用（四原语复用不重实现）**：缺权威 tokenizer 时用 `utf8-bytes-v1`
 *    保守上界（UTF-8 字节数恒 ≥ 渲染文本 token 数——每个 token 至少消耗 1 字节源文本，多字节字符
 *    只会让字节数更大，不存在「字节数 < token 数」的反例）。估算原语复用 model-client 的
 *    `byteEstimate`，校准复用 usage-reconciliation 的 `refineEstimate`；未知版本 fail-closed。
 *  - **catalog 即授权根**：contextWindow / maxOutput / toolReserve / safetyMargin / estimator 一律
 *    从不可变的 `ModelCostPolicy`（绑定 ai_cost_price_book 行，调用方不得自造）读取；`trimOrder` /
 *    `allowDegrade` 是「裁剪策略」，不是新的准入目录——对齐「component ledger 是预算分解，不是 catalog」。
 *  - **显式 enum 状态**：within_budget / degraded / rejected。degraded 必显式列出被裁剪组件，
 *    rejected 必带错误码——「裁了却不报」或「裁了却标 within_budget」都是 bug，proof 硬断言。
 *  - **不可约组件永不裁剪**：system / permission_snapshot / schema / user_data 裁掉会改变语义或
 *    安全边界（权限快照被裁 = 越权面被静默收窄；schema 被裁 = 结构化输出契约丢失），只在 trimOrder
 *    列出的组件上降级。
 */
import { isKnownEstimatorVersion, refineEstimate, type CalibratedFactor, type EstimatorVersion } from './usage-reconciliation.ts';
import { byteEstimate } from './model-client.ts';
import type { ModelCostPolicy } from './invoke.ts';

/** 显式 enum：预算结果状态。degraded = 确定性降级后仍可派发（已裁低优先级材料）；rejected = 裁无可裁仍超 → 拒绝。 */
export const CONTEXT_BUDGET_STATUSES = ['within_budget', 'degraded', 'rejected'] as const;
export type ContextBudgetStatus = (typeof CONTEXT_BUDGET_STATUSES)[number];

/** 预算组件的固定身份（名字即「预算的分桶」，不是授权目录——准入仍归 catalog/ModelCostPolicy）。 */
export const CONTEXT_BUDGET_COMPONENT_IDS = [
  'system',
  'permission_snapshot',
  'schema',
  'tools',
  'user_data',
  'rag',
  'recent_turns',
  'summary',
] as const;
export type ContextBudgetComponentId = (typeof CONTEXT_BUDGET_COMPONENT_IDS)[number];

/** 一次派发的全部组件输入（已渲染为文本）。recentTurns 最新在前；降级时从**尾部（最旧）**开始减少。 */
export interface ContextBudgetComponents {
  /** 稳定系统指令（可信、可缓存前缀）。 */
  system: string;
  /** 服务端授权快照（安全边界，不可裁剪）。 */
  permissionSnapshot: string;
  /** 结构化输出 schema 文本（不可裁剪）。 */
  schema: string;
  /** 已渲染的工具信封定义（v1 工具未接线 → 空串）。 */
  tools: string;
  /** 本轮不可信 user 数据（数据围栏内容：题/答等）。 */
  userData: string;
  /** RAG 检索素材（不可信证据数据，可裁剪）。 */
  rag: string;
  /** 最近完整 turn（最新在前；每项已含 role 与渲染格式）。降级从尾部减少。 */
  recentTurns: readonly string[];
  /** 候选摘要（L5 未接线 → 空串；可裁剪，最不关键）。 */
  summary: string;
}

/** CTX-02 预算策略：窗口/输出/工具 reserve/安全余量来自 ModelCostPolicy（授权根），trimOrder/allowDegrade 是裁剪策略。 */
export interface ContextBudgetPolicy {
  /** 逻辑 service key（来源追溯，不参与公式）。 */
  service?: string;
  contextWindowTokens: number;
  maxOutputTokens: number;
  maxInputTokens: number;
  safetyMarginTokens: number;
  toolReserveTokens: number;
  estimator: EstimatorVersion;
  /** 可选校准因子（usage 对账导出）；存在则精化估算，仍是上界。 */
  calibration?: CalibratedFactor;
  /** 允许降级的组件，按「先裁谁」排序（第一个最先裁）。未列出的组件不可约，绝不裁剪。 */
  trimOrder: readonly ContextBudgetComponentId[];
  /** false 时超预算直接 rejected，不做降级（用于不可降级服务，如评分/报告）。 */
  allowDegrade: boolean;
}

/** 单个组件的预算分账。 */
export interface ContextBudgetComponentEntry {
  component: ContextBudgetComponentId;
  /** 降级后实际计入的 token（估算）。 */
  tokens: number;
  /** 降级前原始 token（估算）；未裁剪时 == tokens。 */
  originalTokens: number;
  /** 是否被确定性降级裁剪（丢内容 / 减少轮次）。 */
  trimmed: boolean;
}

export type ContextBudgetError = 'context_budget_policy_invalid' | 'context_budget_exceeded';

/** CTX-02 预算计划：逐项明细 + renderedInput + availableInput + reserve + safetyMargin + 显式 enum 状态。 */
export interface ContextBudgetPlan {
  status: ContextBudgetStatus;
  estimator: EstimatorVersion;
  service?: string;
  contextWindowTokens: number;
  maxOutputTokens: number;
  maxInputTokens: number;
  safetyMarginTokens: number;
  toolReserveTokens: number;
  /** contextWindow − maxOutput − toolReserve − safetyMargin（文档公式）。 */
  availableInputTokens: number;
  /** Σ 组件（降级后）token。 */
  renderedInputTokens: number;
  /** 逐组件分账。 */
  components: ContextBudgetComponentEntry[];
  /** degraded 时被裁剪的组件列表（显式暴露，绝不静默）。 */
  trimmedComponents: ContextBudgetComponentId[];
  /** rejected 时明确错误码；其余状态为 undefined。 */
  error?: ContextBudgetError;
  /** 估算是否被 usage 校准因子精化（true = refined estimate 应用了 calibration）。 */
  calibrated: boolean;
}

/** 预算决策：plan 恒可用（含 rejected 状态）；ok:false 仅保留给「配置/策略非法」（fail-closed）。 */
export type ContextBudgetDecision =
  | { ok: true; plan: ContextBudgetPlan }
  | { ok: false; error: ContextBudgetError };

/** 保守估算器：版本化 + 可选校准。utf8-bytes-v1 = UTF-8 字节数（恒 ≥ 渲染文本 token），未知版本 fail-closed。 */
export function estimateContextTokens(value: string, estimator: EstimatorVersion, calibration?: CalibratedFactor): number {
  if (!isKnownEstimatorVersion(estimator)) {
    // fail-closed：未知估算器版本的语义无法确定（未来新增版本必须先登记进 KNOWN_ESTIMATOR_VERSIONS），绝不猜测。
    throw new Error('context_estimator_unknown');
  }
  if (value.length === 0) return 0; // 空组件 0 token；refineEstimate 要求 ≥1，空串不套校准因子（0×factor=0）。
  const raw = byteEstimate(value); // 复用 model-client 的保守估算原语（四原语复用，不重实现字节计数）。
  return calibration ? refineEstimate(raw, calibration) : raw; // 复用 usage-reconciliation 的精化（上界不变、更贴真实）。
}

/** 默认裁剪顺序：先裁可选摘要（派生物、最不关键）→ 再裁 RAG（支撑证据）→ 最后减少 recent turns（尽量保留会话连续性）。 */
export const DEFAULT_TRIM_ORDER: readonly ContextBudgetComponentId[] = ['summary', 'rag', 'recent_turns'];

const MAX_CONTEXT_WINDOW_TOKENS = 2_000_000;
/** 不可约组件（裁掉会改语义/安全边界），误入 trimOrder 即配置非法。 */
const IRREDUCIBLE_COMPONENTS = new Set<ContextBudgetComponentId>(['system', 'permission_snapshot', 'schema', 'user_data']);

function validPositive(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1 && value <= MAX_CONTEXT_WINDOW_TOKENS;
}
function validNonNegative(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= MAX_CONTEXT_WINDOW_TOKENS;
}

function validatePolicy(policy: ContextBudgetPolicy): ContextBudgetError | null {
  if (!isKnownEstimatorVersion(policy.estimator)
    || !validPositive(policy.contextWindowTokens)
    || !validPositive(policy.maxOutputTokens)
    || !validPositive(policy.maxInputTokens)
    // safetyMarginTokens 可为 0（「不留余量」是合法但激进的策略）；toolReserve 同理非负即可。
    || !validNonNegative(policy.safetyMarginTokens)
    || !validNonNegative(policy.toolReserveTokens)) {
    return 'context_budget_policy_invalid';
  }
  for (const id of policy.trimOrder) {
    // 不可约组件误入 trimOrder → 配置错误（裁 system/权限快照会改语义/越权），fail-closed。
    if (IRREDUCIBLE_COMPONENTS.has(id)) return 'context_budget_policy_invalid';
    // trimOrder 里出现未知组件标识也是配置错误（未来新增组件必须先加入 CONTEXT_BUDGET_COMPONENT_IDS）。
    if (!(CONTEXT_BUDGET_COMPONENT_IDS as readonly string[]).includes(id)) return 'context_budget_policy_invalid';
  }
  // 重复组件在 trimOrder 里是配置错误（同一组件不该被裁两次，歧义）。
  if (new Set(policy.trimOrder).size !== policy.trimOrder.length) return 'context_budget_policy_invalid';
  return null;
}

/** 从 ModelCostPolicy（catalog/授权根）构建预算策略：窗口/输出/reserve/余量只从不可变 cost policy 读，裁剪策略由 opts 显式给。 */
export function contextBudgetPolicyFromCostPolicy(costPolicy: ModelCostPolicy, opts: {
  service?: string;
  trimOrder?: readonly ContextBudgetComponentId[];
  allowDegrade?: boolean;
  calibration?: CalibratedFactor;
} = {}): ContextBudgetPolicy {
  const contextWindowTokens = costPolicy.contextWindowTokens;
  const safetyMarginTokens = costPolicy.contextSafetyMarginTokens;
  const estimator = costPolicy.contextEstimator;
  // 授权根字段缺省或非法即 fail-closed：窗口/输出是派发预算的硬前提，绝不静默给默认值（默认值会让「未配置」悄悄变成「可派发」）。
  // safetyMarginTokens 必须 validPositive(≥1)：transport 层 planContextBudget 对同一 catalog 字段用 validPositive 拒绝 0 余量，
  // 若这里接受 0，会产生「预算器放行、实发却被 transport 拒为 model_context_policy_invalid」的口径分裂（审计 MEDIUM-2）。
  if (contextWindowTokens === undefined || estimator === undefined
    || safetyMarginTokens === undefined || !validPositive(safetyMarginTokens)) {
    throw new Error('context_budget_policy_invalid');
  }
  return {
    service: opts.service,
    contextWindowTokens,
    maxOutputTokens: costPolicy.maxOutputTokens,
    maxInputTokens: costPolicy.maxInputTokens,
    safetyMarginTokens,
    toolReserveTokens: costPolicy.contextToolReserveTokens ?? 0,
    estimator,
    calibration: opts.calibration,
    trimOrder: opts.trimOrder ?? DEFAULT_TRIM_ORDER,
    allowDegrade: opts.allowDegrade ?? true,
  };
}

function componentTokens(id: ContextBudgetComponentId, components: ContextBudgetComponents, policy: ContextBudgetPolicy): number {
  const estimate = (text: string) => estimateContextTokens(text, policy.estimator, policy.calibration);
  switch (id) {
    case 'system': return estimate(components.system);
    case 'permission_snapshot': return estimate(components.permissionSnapshot);
    case 'schema': return estimate(components.schema);
    case 'tools': return estimate(components.tools);
    case 'user_data': return estimate(components.userData);
    case 'rag': return estimate(components.rag);
    case 'recent_turns': return components.recentTurns.reduce((sum, turn) => sum + estimate(turn), 0);
    case 'summary': return estimate(components.summary);
  }
}

function renderedInputTokens(components: ContextBudgetComponents, policy: ContextBudgetPolicy): number {
  return CONTEXT_BUDGET_COMPONENT_IDS.reduce((sum, id) => sum + componentTokens(id, components, policy), 0);
}

function buildPlan(
  policy: ContextBudgetPolicy,
  working: ContextBudgetComponents,
  originalTokens: ReadonlyMap<ContextBudgetComponentId, number>,
  trimmed: ReadonlySet<ContextBudgetComponentId>,
  availableInputTokens: number,
  status: ContextBudgetStatus,
  error?: ContextBudgetError,
): ContextBudgetPlan {
  const components = CONTEXT_BUDGET_COMPONENT_IDS.map((id) => ({
    component: id,
    tokens: componentTokens(id, working, policy),
    originalTokens: originalTokens.get(id)!,
    trimmed: trimmed.has(id),
  }));
  return {
    status,
    estimator: policy.estimator,
    service: policy.service,
    contextWindowTokens: policy.contextWindowTokens,
    maxOutputTokens: policy.maxOutputTokens,
    maxInputTokens: policy.maxInputTokens,
    safetyMarginTokens: policy.safetyMarginTokens,
    toolReserveTokens: policy.toolReserveTokens,
    availableInputTokens,
    renderedInputTokens: components.reduce((sum, entry) => sum + entry.tokens, 0),
    components,
    trimmedComponents: [...trimmed],
    calibrated: policy.calibration !== undefined,
    ...(error !== undefined ? { error } : {}),
  };
}

/**
 * 派发前预算主入口。
 * 1. 校验策略（fail-closed）。
 * 2. 算 availableInput（contextWindow − maxOutput − toolReserve − safetyMargin）。
 * 3. 算 renderedInput = Σ 8 组件；超 availableInput 或 maxInputTokens 时，按 trimOrder 确定性降级。
 * 4. 降级后仍超 → rejected（明确错误码）；否则 within_budget / degraded。
 * 绝不返回「静默截断后仍标 within_budget」的结果。
 */
export function planDispatchBudget(components: ContextBudgetComponents, policy: ContextBudgetPolicy): ContextBudgetDecision {
  const invalid = validatePolicy(policy);
  if (invalid) return { ok: false, error: invalid };

  const availableInputTokens = policy.contextWindowTokens - policy.maxOutputTokens - policy.toolReserveTokens - policy.safetyMarginTokens;
  // 窗口 < 输出+reserve+余量 → 任何输入都放不下，配置非法（而非「预算不足」，因为这不是输入的问题）。
  if (availableInputTokens < 1) return { ok: false, error: 'context_budget_policy_invalid' };

  // 工作副本：recentTurns 会被从尾部减少；summary/rag 会被清空。原输入保留用于 originalTokens 报告。
  const working: ContextBudgetComponents = {
    ...components,
    recentTurns: components.recentTurns.slice(),
  };

  // 降级前逐项 token（用于报告 trimmed 与「裁了多少」）。
  const originalTokens = new Map<ContextBudgetComponentId, number>();
  for (const id of CONTEXT_BUDGET_COMPONENT_IDS) originalTokens.set(id, componentTokens(id, components, policy));

  const isOver = () => {
    const input = renderedInputTokens(working, policy);
    return input > availableInputTokens || input > policy.maxInputTokens;
  };

  const trimmed = new Set<ContextBudgetComponentId>();

  if (isOver() && !policy.allowDegrade) {
    // 不可降级服务超预算 → 直接拒绝，绝不静默截断。
    return { ok: true, plan: buildPlan(policy, working, originalTokens, trimmed, availableInputTokens, 'rejected', 'context_budget_exceeded') };
  }

  // 外层 while 反复遍历 trimOrder：recent_turns 每次只丢最旧一轮，若只走一遍 trimOrder 则每个组件最多裁一个单位，
  // recent_turns 也就最多裁一轮。长会话（mock-interview 是 CTX 首要动机）可能 10 轮才裁 1 轮即被拒（审计 MEDIUM-1），
  // 故必须反复遍历直到 fit。progressed 保证确定性终止：一整轮遍历没裁到任何单位 = 裁无可裁，退出 while，
  // 交由下方「仍超 → rejected」处理——绝不无限循环、绝不静默截断，且同输入必同输出（无随机、无墙钟）。
  let progressed = true;
  while (isOver() && progressed) {
    progressed = false;
    for (const id of policy.trimOrder) {
      if (!isOver()) break;
      // 逐级降级：每轮裁一个「单位」，裁完重算。summary/rag 一次清空；recent_turns 每次丢最旧一轮。
      if (id === 'summary') {
        if (working.summary !== '') { working.summary = ''; trimmed.add('summary'); progressed = true; }
      } else if (id === 'rag') {
        if (working.rag !== '') { working.rag = ''; trimmed.add('rag'); progressed = true; }
      } else if (id === 'recent_turns') {
        if (working.recentTurns.length > 0) { working.recentTurns = working.recentTurns.slice(0, -1); trimmed.add('recent_turns'); progressed = true; }
      } else {
        // 不可约组件不应出现在 trimOrder（validatePolicy 已拒），但防御性 fail-closed 双保险。
        return { ok: false, error: 'context_budget_policy_invalid' };
      }
    }
  }

  if (isOver()) {
    // 裁无可裁仍超 → 拒绝，明确错误码，绝不静默截断。
    return { ok: true, plan: buildPlan(policy, working, originalTokens, trimmed, availableInputTokens, 'rejected', 'context_budget_exceeded') };
  }

  const status: ContextBudgetStatus = trimmed.size > 0 ? 'degraded' : 'within_budget';
  return { ok: true, plan: buildPlan(policy, working, originalTokens, trimmed, availableInputTokens, status) };
}
