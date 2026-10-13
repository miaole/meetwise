/**
 * usage-calibration-reconciler.ts — usage 对账校准的域级 reconciler（MODEL-OP-00 收尾 P2/P3）。
 *
 * 职责（把纯模块 usage-reconciliation 接线到持久层，四原语复用不重实现）：
 *  - P2：读 estimate↔provider usage 配对（ai_usage_calibration_pairs_scoped，全 outcome）→ 按
 *    (service,model) 分组 → 逐组建 UsageObservation[] → 复用 `reconcileUsage` 导出版本化保守因子 →
 *    观测逐条幂等落库（低估显式 under_estimated + metric 告警，绝不静默）→ 因子内容寻址落库（insert-only）。
 *  - P3：`resolveLatestCalibratedFactor` 读最新因子 → `toCalibratedFactor` 双校验（estimator 已知 +
 *    因子版本前缀匹配 algo + 数值域）→ 合法返回 `CalibratedFactor`，否则 null（缺因子/版本未知
 *    fail-closed 退回未精化估算，绝不猜测、绝不超窗）。
 *
 * 单调性：全史路径（reconcileUsageCalibration·v1 未动）由「每组读全历史」隐式达成；
 * 加窗路径（reconcileUsageCalibrationWindowed·AG-COST2）单调性显式承载——因子合并
 * factor' = max(factor_prev, rawMax_增量×(1+safety))（裁决项②(a)·factor 尺度取 max·保上界
 * 只升不降）+ 水位线 GREATEST 单调推进绝不回拨；同内容同版本、同 key 同观测幂等（并发批不重复）。
 * 诚实 seam：本模块是域级 reconciler + db wrapper 的真实执行；真实 worker loop 调度（定时/事件触发）
 * 不在本件范围，调用方自选何时触发。
 */
import { createHash } from 'node:crypto';
import {
  isKnownEstimatorVersion, reconcileUsage, CALIBRATION_ALGORITHM_VERSION,
  type CalibratedFactor, type EstimatorVersion, type UsageObservation,
} from './usage-reconciliation.ts';
import {
  asPrincipal, listUsageCalibrationPairs, listUsageCalibrationPairsSince,
  getUsageCalibrationWatermark, upsertUsageCalibrationWatermark,
  insertUsageCalibrationFactor, insertUsageCalibrationObservation,
  latestUsageCalibrationFactor, type Client, type DbPool, type UsageCalibrationFactorRow, type UsageCalibrationPair,
} from '@meetwise/db';
import { getMetrics, METRIC } from './metrics.ts';

export interface ReconcileUsageCalibrationInput {
  /** RLS owner；所有读写都在该 principal 的短事务内。 */
  owner: string;
  /** 观测批次标识（幂等 PK 分量）；同一批重复执行不重复落观测。 */
  batch: string;
  /** AG-12 语义修订（原 blanket 缺省盖章已根除）：可选估算器过滤——缺省 = 全部已注册估算器组各自
   *  对账（worker tick 不传 = 全组）；显式传入 = 只对账该估算器组。未知值 fail-closed。 */
  estimator?: EstimatorVersion;
}

export interface ReconcileUsageCalibrationGroupResult {
  service: string;
  model: string;
  /** AG-12：组键第三元（per-row 归因透传）——组内估算器齐性由分组保证，归因可观测。 */
  estimator: EstimatorVersion;
  /** 本组观测总数（含 providerInputTokens=0 的无信号观测）。 */
  observationCount: number;
  /** 本组有效观测数（providerInputTokens ≥ 1，参与因子计算）。 */
  informativeCount: number;
  /** 导出因子；informativeCount > 0 才有，否则 null（无校准信号）。 */
  factor: CalibratedFactor | null;
  hasUnderEstimate: boolean;
  underEstimateCount: number;
}

export type ReconcileUsageCalibrationResult =
  | { ok: true; groups: ReconcileUsageCalibrationGroupResult[] }
  | { ok: false; error: string };

const FACTOR_VERSION_SUFFIX = /^[0-9a-f]{64}$/;

/**
 * 把一条 ai_usage_calibration 行校验成可用的 CalibratedFactor（双校验，fail-closed）。
 * 拒绝：未知 estimator、因子版本不匹配 `<estimator>.<algo>.<sha256>` 形态、数值域非法、无有效观测。
 */
export function toCalibratedFactor(row: UsageCalibrationFactorRow): CalibratedFactor | null {
  if (!isKnownEstimatorVersion(row.estimator)) return null;
  const prefix = `${row.estimator}.${CALIBRATION_ALGORITHM_VERSION}.`;
  if (!row.factorVersion.startsWith(prefix)) return null;
  if (!FACTOR_VERSION_SUFFIX.test(row.factorVersion.slice(prefix.length))) return null;
  if (!Number.isFinite(row.factor) || row.factor <= 0) return null;
  if (!Number.isFinite(row.rawMaxRatio) || row.rawMaxRatio < 0) return null;
  if (!Number.isFinite(row.safetyMargin) || row.safetyMargin < 0 || row.safetyMargin > 1) return null;
  if (!Number.isSafeInteger(row.observationCount) || row.observationCount < 1) return null;
  return {
    estimator: row.estimator,
    factorVersion: row.factorVersion,
    factor: row.factor,
    rawMaxRatio: row.rawMaxRatio,
    safetyMargin: row.safetyMargin,
    observationCount: row.observationCount,
    hasUnderEstimate: row.hasUnderEstimate,
  };
}

/** 读最新因子并双校验；缺因子/未知版本/非法值 → null（P3 fail-closed 退回未精化）。 */
export async function resolveLatestCalibratedFactor(
  c: Client, owner: string, service: string, model: string, estimator: EstimatorVersion = 'utf8-bytes-v1',
): Promise<CalibratedFactor | null> {
  if (!isKnownEstimatorVersion(estimator)) return null;
  const row = await latestUsageCalibrationFactor(c, owner, service, model, estimator);
  return row ? toCalibratedFactor(row) : null;
}

/**
 * AG-12：分组键由二元组 (service,model) 升三元组 (service,model,estimator)——每组内估算器天然齐性，
 * observations 按行自带 estimator 构造（blanket 整组盖章已根除：字节口径与 CJK 口径比率不可比，
 * 混入同组会损坏因子语义）。行携带未注册版本即 fail-closed（绝不猜测估算语义）。
 */
function groupByServiceModelEstimator(pairs: UsageCalibrationPair[]): { service: string; model: string; estimator: EstimatorVersion; pairs: UsageCalibrationPair[] }[] {
  const groups = new Map<string, { service: string; model: string; estimator: EstimatorVersion; pairs: UsageCalibrationPair[] }>();
  for (const p of pairs) {
    if (!isKnownEstimatorVersion(p.estimator)) throw new Error('usage_estimator_unknown');
    const key = JSON.stringify([p.service, p.model, p.estimator]);
    let g = groups.get(key);
    if (!g) { g = { service: p.service, model: p.model, estimator: p.estimator, pairs: [] }; groups.set(key, g); }
    g.pairs.push(p);
  }
  return [...groups.values()];
}

/**
 * 域级 reconciler：读全历史配对 → 分组对账 → 幂等持久化观测 + 版本化因子。
 * 全部写在一个 principal 事务内；任一组 fail-closed（非法观测）则整体回滚（绝不静默部分提交）。
 * 低估观测逐条显式落库（under_estimated）并在提交后累加 metric 告警。
 */
export async function reconcileUsageCalibration(pool: DbPool, input: ReconcileUsageCalibrationInput): Promise<ReconcileUsageCalibrationResult> {
  // AG-12：input.estimator 修订为可选过滤（缺省 = 全部已注册估算器组各自对账）；显式传入未知值仍 fail-closed。
  if (input.estimator !== undefined && !isKnownEstimatorVersion(input.estimator)) return { ok: false, error: 'usage_estimator_unknown' };
  if (typeof input.owner !== 'string' || input.owner.length < 1 || input.owner.length > 512) return { ok: false, error: 'usage_calibration_owner_invalid' };
  if (typeof input.batch !== 'string' || input.batch.length < 1 || input.batch.length > 256) return { ok: false, error: 'usage_calibration_batch_invalid' };

  const committed = await asPrincipal(pool, input.owner, async (c) => {
    const pairs = await listUsageCalibrationPairs(c, input.owner);
    const groups = groupByServiceModelEstimator(pairs)
      .filter((g) => input.estimator === undefined || g.estimator === input.estimator);
    const results: ReconcileUsageCalibrationGroupResult[] = [];
    let totalUnderEstimated = 0;

    for (const group of groups) {
      const { service, model, estimator: groupEstimator, pairs: groupPairs } = group;
      // 每组内估算器齐性由三元组分组保证：observations 按行自带 estimator 构造（绝不整组盖章）。
      const observations: UsageObservation[] = groupPairs.map((p) => ({
        estimator: groupEstimator,
        estimateInputTokens: p.estimateInputTokens,
        providerInputTokens: p.providerInputTokens,
        providerOutputTokens: p.providerOutputTokens,
        service: p.service,
        model: p.model,
        batch: input.batch,
        observedAtMs: p.observedAtMs,
      }));
      const outcome = reconcileUsage(observations, { estimator: groupEstimator });
      if (!outcome.ok) throw new Error(`usage_calibration_reconcile_failed:${outcome.error}`);

      let underEstimateCount = 0;
      for (const verdict of outcome.verdicts) {
        const pair = groupPairs[verdict.index]!;
        await insertUsageCalibrationObservation(c, {
          owner: input.owner, batch: input.batch, idempotencyKey: pair.idempotencyKey,
          service: verdict.observation.service, model: verdict.observation.model, estimator: verdict.observation.estimator,
          estimateInputTokens: verdict.observation.estimateInputTokens,
          providerInputTokens: verdict.observation.providerInputTokens,
          providerOutputTokens: verdict.observation.providerOutputTokens,
          underEstimated: verdict.underEstimated, observedAtMs: verdict.observation.observedAtMs,
        });
        if (verdict.underEstimated) underEstimateCount += 1;
      }

      if (outcome.calibration) {
        await insertUsageCalibrationFactor(c, {
          owner: input.owner, service, model, estimator: outcome.calibration.estimator,
          factorVersion: outcome.calibration.factorVersion, factor: outcome.calibration.factor,
          rawMaxRatio: outcome.calibration.rawMaxRatio, safetyMargin: outcome.calibration.safetyMargin,
          observationCount: outcome.calibration.observationCount, hasUnderEstimate: outcome.calibration.hasUnderEstimate,
        });
      }

      totalUnderEstimated += underEstimateCount;
      results.push({
        service, model,
        estimator: groupEstimator,
        observationCount: observations.length,
        informativeCount: outcome.calibration?.observationCount ?? 0,
        factor: outcome.calibration,
        hasUnderEstimate: outcome.calibration?.hasUnderEstimate ?? false,
        underEstimateCount,
      });
    }

    return { ok: true as const, groups: results, totalUnderEstimated };
  });

  // metric 在提交后累加：回滚不虚增告警计数（counter 是本实例真实事件数）。
  getMetrics().inc(METRIC.modelEstimateCalibrationUnderestimated, undefined, committed.totalUnderEstimated);
  return { ok: true, groups: committed.groups };
}

// ============================================================================
// AG-COST2（AG-07 迁移四件套 + 因子合并语义）：加窗增量路径。
// 读 owner 水位线 → v2(p_since=水位线) 取 completed_at 增量 → 写观测/合并因子 →
// 推进水位线至本批 max(completed_at)。全部同一 principal 事务：失败整体回滚、水位线不前移
// （at-least-once 幂等重放安全；观测 ON CONFLICT DO NOTHING 去重由 0177 新 PK 兜底）。
// ============================================================================

/** 加窗合并的因子版本：内容寻址哈希输入含 prev factorVersion（合并链可审计）+ 增量自身版本。 */
export function buildMergedFactorVersion(prevFactorVersion: string, incremental: CalibratedFactor): string {
  const digest = createHash('sha256')
    .update(JSON.stringify([
      CALIBRATION_ALGORITHM_VERSION, incremental.estimator, incremental.safetyMargin.toFixed(6),
      'merge-v1', prevFactorVersion, incremental.factorVersion,
    ]))
    .digest('hex');
  return `${incremental.estimator}.${CALIBRATION_ALGORITHM_VERSION}.${digest}`;
}

/**
 * 因子合并语义（AG-COST2 件④·任务书公式·裁决项②(a) factor 尺度 max）：
 *   factor' = max(factor_prev, rawMax_增量 × (1 + safety))
 * incremental.factor 恰为 rawMax_增量×(1+safety)（reconcileUsage :205 同式），故在 factor 尺度取
 * max。两肩同式同 safety（DEFAULT_SAFETY_MARGIN 常量）→ 保上界、只升不降（prev factor 高于增量时
 * 保留 prev 绝不静默缩水）。伴随语义：observationCount' = prev+增量（单调不减·CHECK ≥1 维持）·
 * hasUnderEstimate' = prev OR 增量·rawMaxRatio' = max 两肩有效值·safetyMargin' = 增量侧采用常量。
 * 无 prev（首窗）由调用方直接落普通全量计算结果=现语义。
 */
export function mergeCalibratedFactorWithPrev(prev: UsageCalibrationFactorRow, incremental: CalibratedFactor): CalibratedFactor {
  return {
    estimator: incremental.estimator,
    factorVersion: buildMergedFactorVersion(prev.factorVersion, incremental),
    factor: Math.max(prev.factor, incremental.factor),
    rawMaxRatio: Math.max(prev.rawMaxRatio, incremental.rawMaxRatio),
    safetyMargin: incremental.safetyMargin,
    observationCount: prev.observationCount + incremental.observationCount,
    hasUnderEstimate: prev.hasUnderEstimate || incremental.hasUnderEstimate,
  };
}

export type ReconcileUsageCalibrationWindowedResult =
  | { ok: true; groups: ReconcileUsageCalibrationGroupResult[]; watermarkFrom: Date; watermarkTo: Date | null }
  | { ok: false; error: string };

/**
 * 加窗域级 reconciler：水位线增量读 → 合并因子落库 → 水位线单调推进（同一 principal 事务）。
 * 窗口空（无新配对）→ ok 且零写（水位线不推进——无观测即无新水位，单调语义下不空转回拨）。
 */
export async function reconcileUsageCalibrationWindowed(
  pool: DbPool, input: ReconcileUsageCalibrationInput,
): Promise<ReconcileUsageCalibrationWindowedResult> {
  // AG-12：input.estimator 修订为可选过滤（缺省 = 全部已注册估算器组各自对账）；显式传入未知值仍 fail-closed。
  if (input.estimator !== undefined && !isKnownEstimatorVersion(input.estimator)) return { ok: false, error: 'usage_estimator_unknown' };
  if (typeof input.owner !== 'string' || input.owner.length < 1 || input.owner.length > 512) return { ok: false, error: 'usage_calibration_owner_invalid' };
  if (typeof input.batch !== 'string' || input.batch.length < 1 || input.batch.length > 256) return { ok: false, error: 'usage_calibration_batch_invalid' };

  const committed = await asPrincipal(pool, input.owner, async (c) => {
    const since = (await getUsageCalibrationWatermark(c, input.owner)) ?? new Date(0);
    const pairs = await listUsageCalibrationPairsSince(c, input.owner, since);
    if (pairs.length === 0) return { ok: true as const, groups: [] as ReconcileUsageCalibrationGroupResult[], watermarkFrom: since, watermarkTo: null };

    const groups = groupByServiceModelEstimator(pairs)
      .filter((g) => input.estimator === undefined || g.estimator === input.estimator);
    const results: ReconcileUsageCalibrationGroupResult[] = [];
    let totalUnderEstimated = 0;

    for (const group of groups) {
      const { service, model, estimator: groupEstimator, pairs: groupPairs } = group;
      // 每组内估算器齐性由三元组分组保证：observations 按行自带 estimator 构造（绝不整组盖章）。
      const observations: UsageObservation[] = groupPairs.map((p) => ({
        estimator: groupEstimator,
        estimateInputTokens: p.estimateInputTokens,
        providerInputTokens: p.providerInputTokens,
        providerOutputTokens: p.providerOutputTokens,
        service: p.service,
        model: p.model,
        batch: input.batch,
        observedAtMs: p.observedAtMs,
      }));
      const outcome = reconcileUsage(observations, { estimator: groupEstimator });
      if (!outcome.ok) throw new Error(`usage_calibration_reconcile_failed:${outcome.error}`);

      let underEstimateCount = 0;
      for (const verdict of outcome.verdicts) {
        const pair = groupPairs[verdict.index]!;
        await insertUsageCalibrationObservation(c, {
          owner: input.owner, batch: input.batch, idempotencyKey: pair.idempotencyKey,
          service: verdict.observation.service, model: verdict.observation.model, estimator: verdict.observation.estimator,
          estimateInputTokens: verdict.observation.estimateInputTokens,
          providerInputTokens: verdict.observation.providerInputTokens,
          providerOutputTokens: verdict.observation.providerOutputTokens,
          underEstimated: verdict.underEstimated, observedAtMs: verdict.observation.observedAtMs,
        });
        if (verdict.underEstimated) underEstimateCount += 1;
      }

      // 合并语义：读 prev（同 principal 事务内·RLS 自有行）→ 有 prev 走 max 合并 insert-only
      // 新版本（绝不 UPDATE/DELETE 旧行）；无 prev（首窗）= 普通全量计算结果原样落库=现语义。
      // AG-12：prev 按组键第三元 estimator 精确读取（v1/v2 因子历史互不串窗）。
      const prev = outcome.calibration
        ? await latestUsageCalibrationFactor(c, input.owner, service, model, groupEstimator)
        : null;
      const effective = outcome.calibration && prev
        ? mergeCalibratedFactorWithPrev(prev, outcome.calibration)
        : outcome.calibration;
      if (effective) {
        await insertUsageCalibrationFactor(c, {
          owner: input.owner, service, model, estimator: effective.estimator,
          factorVersion: effective.factorVersion, factor: effective.factor,
          rawMaxRatio: effective.rawMaxRatio, safetyMargin: effective.safetyMargin,
          observationCount: effective.observationCount, hasUnderEstimate: effective.hasUnderEstimate,
        });
      }

      totalUnderEstimated += underEstimateCount;
      results.push({
        service, model,
        estimator: groupEstimator,
        observationCount: observations.length,
        informativeCount: outcome.calibration?.observationCount ?? 0,
        factor: effective,
        hasUnderEstimate: effective?.hasUnderEstimate ?? false,
        underEstimateCount,
      });
    }

    // 水位线推进至本批 max(completed_at)（GREATEST 单调·与因子/观测同事务·失败整体回滚不前移）。
    // +1ms：observed_at_ms 系 completed_at 的毫秒量化（extract(epoch)*1000 截断），直接回填 maxMs
    // 会让边界配对（completed_at 落在 [maxMs, maxMs+1ms) 微秒尾）在下窗被 > 严格谓词重吞——
    // 幂等不致错但 observationCount 跨窗重复相加；+1ms 半开区间语义（已对账完成=窗口左闭右闭）
    // 恰好严格排除边界·单调性由 GREATEST 独立保证（EXEC 细化·勘误注随 REQUEST 登记面）。
    const watermarkTo = await upsertUsageCalibrationWatermark(c, input.owner, new Date(Math.max(...pairs.map((p) => p.observedAtMs)) + 1));
    return { ok: true as const, groups: results, watermarkFrom: since, watermarkTo };
  });

  // metric 在提交后累加：回滚不虚增告警计数（counter 是本实例真实事件数）。
  getMetrics().inc(METRIC.modelEstimateCalibrationUnderestimated, undefined, committed.totalUnderEstimated);
  return { ok: true, groups: committed.groups, watermarkFrom: committed.watermarkFrom, watermarkTo: committed.watermarkTo };
}
