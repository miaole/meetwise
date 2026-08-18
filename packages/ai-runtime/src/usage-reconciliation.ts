/**
 * usage-reconciliation.ts — usage 对账与保守估算校准因子(纯、确定性 seam,非供应商 tokenizer)。
 *
 * 定位(自包含:不 import model-client/invoke,类型自给):派发前的 `byteEstimate`
 * (utf8-bytes-v1)对渲染**文本 token** 是保守上界(每个 token 至少消耗 1 字节源文本,
 * UTF-8 多字节字符只会让字节数更大,不存在「字节数 < token 数」的反例)。供应商上报 usage
 * 只作异步对账/校准证据,绝不替代前置预算。本模块从 (estimate, provider usage) 观测历史
 * 导出**版本化的保守校准因子**:它必须仍支配(≥)所有已观测 usage 并带安全余量——是"上界精化",
 * 不是"取均值"。
 *
 * 语义边界(重要):`byteEstimate` 支配的是**渲染文本 token**;供应商完整 `prompt_tokens` 还含
 * 消息框架/特殊/schema token(不在被计字符串内),故 `providerInputTokens > estimateInputTokens`
 * 是短输入/框架开销下的**预期失效模式**,而非"数学不变量被击穿"——它由 reserve + safetyMargin
 * + 本模块对账记录误差兜底。因此:
 *  - 任何 `providerInputTokens > estimateInputTokens` 都必须显式标记 `underEstimated`,
 *    绝不静默吞掉(低估必须可见,否则对账失去意义)。
 *  - 校准因子是已观测最坏比率的上界(max,单调不减),加观测绝不破坏既有上界;
 *    精化后估算仍 ≥ 所有已观测 provider usage。
 *  - 未知估算器版本 fail-closed,绝不猜测估算语义。
 *
 * 纯性:无 DB、无网络、无墙钟(`observedAtMs` 由调用方注入,本模块不读 Date.now)。
 * 接线(把估算值串到 invoke、落库)由调用方负责,本模块只给干净的公共 API(因子尚未应用回派发)。
 */
import { createHash } from 'node:crypto';

/** 已登记的保守估算器版本。新增估算器必须显式加入,否则 fail-closed(绝不猜测未知估算语义)。 */
export const KNOWN_ESTIMATOR_VERSIONS = ['utf8-bytes-v1'] as const;
export type EstimatorVersion = (typeof KNOWN_ESTIMATOR_VERSIONS)[number];

/** 校准算法版本:因子公式/余量语义一旦改变必须递增,防止旧版本因子与新算法混用(版本化承重)。 */
export const CALIBRATION_ALGORITHM_VERSION = 'calibration-v1';
/** 默认安全余量(比例):在已观测最坏比率上再上浮 10%,为未来未观测样本留头寸,避免"贴着观测值精化"。 */
export const DEFAULT_SAFETY_MARGIN = 0.10;
/** 安全余量上限(比例):100% 以上视为配置错误而非"更保守"——更保守应换估算器,不是无上限余量。 */
export const MAX_SAFETY_MARGIN = 1.0;
/** 观测 token 数上界(≈最长上下文窗口):防退化观测(如 provider=9e15)让 factor 越过 MAX_SAFE_INTEGER 在 refineEstimate 里静默失真。 */
const MAX_INPUT_TOKEN_BOUND = 2_000_000;

/** 单条观测:一次派发前的保守估算 vs 供应商上报 usage 的配对记录。 */
export interface UsageObservation {
  /** 估算器版本,与 estimateInputTokens 的来源版本严格绑定;未知版本 fail-closed。 */
  estimator: EstimatorVersion;
  /** 派发前保守估算的输入 token(utf8-bytes-v1 = UTF-8 字节数,是真实 token 数的保守上界)。 */
  estimateInputTokens: number;
  /** 供应商上报输入 token(prompt_tokens);仅作校准证据,不作准入/扣费权威。 */
  providerInputTokens: number;
  /** 供应商上报输出 token(completion_tokens);不参与输入因子计算,仅作落库证据。 */
  providerOutputTokens: number;
  /** 逻辑 service key(来源追溯)。 */
  service: string;
  /** 实际供应商模型标识(来源追溯)。 */
  model: string;
  /** 观测批次(异步对账的批标识)。 */
  batch: string;
  /** 观测时间(epoch ms)。由调用方注入(如 Date.now());本模块不读墙钟,保证确定性。 */
  observedAtMs: number;
}

/** 单条观测的对账结论。 */
export interface UsageObservationVerdict {
  /** 在输入数组中的下标,便于调用方定位违约观测落库/告警。 */
  index: number;
  observation: UsageObservation;
  /** providerInputTokens > estimateInputTokens:保守估算被击穿,承重不变量违约,绝不静默。 */
  underEstimated: boolean;
  /** providerInputTokens / estimateInputTokens;provider 未上报输入(0)时为 0(无校准信号)。 */
  inputRatio: number;
}

/** 版本化保守校准因子(上界精化结果)。 */
export interface CalibratedFactor {
  estimator: EstimatorVersion;
  /** 确定性版本标识:由估算器版本 + 校准算法 + 余量 + 观测内容摘要派生,内容变则版本变。 */
  factorVersion: string;
  /** 保守校准因子 c:精化估算 = ceil(c * estimate)。恒 ≥ 所有已观测比率,并带安全余量。 */
  factor: number;
  /** 未加余量的已观测最坏比率(= max(providerInputTokens / estimateInputTokens))。 */
  rawMaxRatio: number;
  /** 实际采用的安全余量(比例)。 */
  safetyMargin: number;
  /** 参与因子计算的观测数(providerInputTokens ≥ 1)。 */
  observationCount: number;
  /** 是否观测到低估违约(任一 providerInputTokens > estimateInputTokens)。 */
  hasUnderEstimate: boolean;
}

export type ReconciliationError =
  | 'usage_estimator_unknown'
  | 'usage_observation_invalid'
  | 'usage_safety_margin_invalid';

export type ReconciliationOutcome =
  | { ok: true; verdicts: UsageObservationVerdict[]; calibration: CalibratedFactor | null }
  | { ok: false; error: ReconciliationError; index?: number };

export interface ReconciliationOptions {
  /** 显式声明的估算器版本;缺省取首条观测的版本。空历史必须显式给出,否则 fail-closed。 */
  estimator?: EstimatorVersion;
  /** 安全余量(比例),默认 DEFAULT_SAFETY_MARGIN。 */
  safetyMargin?: number;
}

function isSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

/** 非空且长度有界的标识字符串(service/model/batch 等来源标识)。 */
function isNonEmptyIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 1 && value.length <= 256;
}

export function isKnownEstimatorVersion(value: unknown): value is EstimatorVersion {
  return typeof value === 'string' && (KNOWN_ESTIMATOR_VERSIONS as readonly string[]).includes(value);
}

/**
 * 校验单条观测。估算器必须与声明版本一致:当前只有一个已知版本,任何不一致即"未知语义",
 * 一律 fail-closed(未来登记第二个估算器时,这里应区分 `usage_estimator_mismatch`
 * 与 `usage_estimator_unknown` 两种错误)。
 */
function validateObservation(obs: UsageObservation, declared: EstimatorVersion): ReconciliationError | null {
  if (!isKnownEstimatorVersion(obs.estimator) || obs.estimator !== declared) return 'usage_estimator_unknown';
  // estimate 必须 ≥1 且不超窗口上界:估算器总是产出非空 system + 结构化输出 reserve,0/越界都意味着来源损坏或退化观测,而非"无输入"。
  if (!isSafeInteger(obs.estimateInputTokens) || obs.estimateInputTokens < 1 || obs.estimateInputTokens > MAX_INPUT_TOKEN_BOUND) return 'usage_observation_invalid';
  if (!isSafeInteger(obs.providerInputTokens) || obs.providerInputTokens < 0 || obs.providerInputTokens > MAX_INPUT_TOKEN_BOUND) return 'usage_observation_invalid';
  if (!isSafeInteger(obs.providerOutputTokens) || obs.providerOutputTokens < 0 || obs.providerOutputTokens > MAX_INPUT_TOKEN_BOUND) return 'usage_observation_invalid';
  if (!isNonEmptyIdentifier(obs.service)) return 'usage_observation_invalid';
  if (!isNonEmptyIdentifier(obs.model)) return 'usage_observation_invalid';
  if (!isNonEmptyIdentifier(obs.batch)) return 'usage_observation_invalid';
  if (!Number.isFinite(obs.observedAtMs) || obs.observedAtMs < 0) return 'usage_observation_invalid';
  return null;
}

/**
 * 观测的内容身份(参与因子版本摘要)。用 JSON.stringify 生成结构化身份,天然无分隔符碰撞
 * (字段值本身被 JSON 转义)。刻意排除 providerOutputTokens/batch/observedAtMs:
 * 输出与输入因子无关,时间/批次是摄入元数据而非校准内容——同内容必得同版本,时钟不扰动版本。
 */
function observationContentIdentity(obs: UsageObservation): string {
  return JSON.stringify([obs.service, obs.model, obs.estimateInputTokens, obs.providerInputTokens]);
}

/** 确定性、顺序无关的因子版本:对观测内容身份排序后做内容摘要,内容变则版本变。 */
function buildFactorVersion(estimator: EstimatorVersion, safetyMargin: number, identities: readonly string[]): string {
  const canonical = identities.slice().sort();
  const digest = createHash('sha256')
    .update(JSON.stringify([CALIBRATION_ALGORITHM_VERSION, estimator, safetyMargin.toFixed(6), canonical]))
    .digest('hex');
  return `${estimator}.${CALIBRATION_ALGORITHM_VERSION}.${digest}`;
}

/**
 * 对账 + 版本化保守校准。
 *  ① 逐条检测低估 → 标记 underEstimated(并汇总到 hasUnderEstimate);
 *  ② 在历史上算保守校准因子(= 已观测最坏比率 × (1 + 余量),支配所有观测);
 *  ③ 确定性、版本化(factorVersion 由内容摘要派生)。
 * 未知版本/非法观测/非法余量一律 fail-closed。
 */
export function reconcileUsage(
  observations: readonly UsageObservation[],
  options: ReconciliationOptions = {},
): ReconciliationOutcome {
  const safetyMargin = options.safetyMargin ?? DEFAULT_SAFETY_MARGIN;
  // 余量必须是有限、非负且不过大的比例;NaN/负值/超大均 fail-closed(不让坏配置静默污染扣费上界)。
  if (!Number.isFinite(safetyMargin) || safetyMargin < 0 || safetyMargin > MAX_SAFETY_MARGIN) {
    return { ok: false, error: 'usage_safety_margin_invalid' };
  }
  const declared = options.estimator ?? observations[0]?.estimator;
  // 空历史且未声明版本,或声明了未知版本:都无法确定估算语义 → fail-closed,绝不猜测。
  // 若未知版本来自首条观测(而非显式 options 或空历史),失败应指向该观测下标,便于调用方定位违约来源。
  if (!isKnownEstimatorVersion(declared)) {
    return {
      ok: false,
      error: 'usage_estimator_unknown',
      ...(options.estimator === undefined && observations.length > 0 ? { index: 0 } : {}),
    };
  }

  const verdicts: UsageObservationVerdict[] = [];
  const identities: string[] = [];
  let rawMaxRatio = 0;      // 已观测最坏比率上界;0 = 尚无有效输入观测
  let informativeCount = 0; // providerInputTokens ≥ 1 的观测数(才有校准信号)
  let hasUnderEstimate = false;

  for (const [index, obs] of observations.entries()) {
    const error = validateObservation(obs, declared);
    if (error) return { ok: false, error, index };
    // 低估 = 保守估算被真实 usage 击穿。必须显式标记;它会同时把 rawMaxRatio 顶到 >1,
    // 使因子放大回安全上界(绝不静默吞掉违约,也不让违约观测漏出上界之外)。
    const underEstimated = obs.providerInputTokens > obs.estimateInputTokens;
    const inputRatio = obs.providerInputTokens >= 1 ? obs.providerInputTokens / obs.estimateInputTokens : 0;
    verdicts.push({ index, observation: obs, underEstimated, inputRatio });
    if (underEstimated) hasUnderEstimate = true;
    if (obs.providerInputTokens >= 1) {
      informativeCount += 1;
      if (inputRatio > rawMaxRatio) rawMaxRatio = inputRatio;
      identities.push(observationContentIdentity(obs));
    }
  }

  let calibration: CalibratedFactor | null = null;
  if (informativeCount > 0) {
    // 保守上界 = 已观测最坏比率 × (1 + 余量)。max 只随观测增加而单调不减,
    // 故加观测绝不破坏既有上界(因子单调性),精化估算恒 ≥ 所有已观测 provider usage。
    const factor = rawMaxRatio * (1 + safetyMargin);
    calibration = {
      estimator: declared,
      factorVersion: buildFactorVersion(declared, safetyMargin, identities),
      factor,
      rawMaxRatio,
      safetyMargin,
      observationCount: informativeCount,
      hasUnderEstimate,
    };
  }
  return { ok: true, verdicts, calibration };
}

/** 用校准因子精化一条估算:ceil(factor * estimate)。仍是上界(≥ 所有已观测 provider usage),只是更贴真实 token。 */
export function refineEstimate(estimateInputTokens: number, calibration: CalibratedFactor): number {
  if (!isSafeInteger(estimateInputTokens) || estimateInputTokens < 1) {
    throw new Error('usage_refine_estimate_invalid');
  }
  return Math.ceil(calibration.factor * estimateInputTokens);
}
