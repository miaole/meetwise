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
 * 单调性：每组读**全历史**配对（因子只升不降）；同内容同版本、同 batch 同观测幂等（并发批不重复）。
 * 诚实 seam：本模块是域级 reconciler + db wrapper 的真实执行；真实 worker loop 调度（定时/事件触发）
 * 不在本件范围，调用方自选何时触发。
 */
import {
  isKnownEstimatorVersion, reconcileUsage, CALIBRATION_ALGORITHM_VERSION,
  type CalibratedFactor, type EstimatorVersion, type UsageObservation,
} from './usage-reconciliation.ts';
import {
  asPrincipal, listUsageCalibrationPairs, insertUsageCalibrationFactor, insertUsageCalibrationObservation,
  latestUsageCalibrationFactor, type Client, type DbPool, type UsageCalibrationFactorRow, type UsageCalibrationPair,
} from '@meetwise/db';
import { getMetrics, METRIC } from './metrics.ts';

export interface ReconcileUsageCalibrationInput {
  /** RLS owner；所有读写都在该 principal 的短事务内。 */
  owner: string;
  /** 观测批次标识（幂等 PK 分量）；同一批重复执行不重复落观测。 */
  batch: string;
  /** 估算器版本；缺省 utf8-bytes-v1。未知版本 fail-closed。 */
  estimator?: EstimatorVersion;
}

export interface ReconcileUsageCalibrationGroupResult {
  service: string;
  model: string;
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

function groupByServiceModel(pairs: UsageCalibrationPair[]): { service: string; model: string; pairs: UsageCalibrationPair[] }[] {
  const groups = new Map<string, { service: string; model: string; pairs: UsageCalibrationPair[] }>();
  for (const p of pairs) {
    const key = JSON.stringify([p.service, p.model]);
    let g = groups.get(key);
    if (!g) { g = { service: p.service, model: p.model, pairs: [] }; groups.set(key, g); }
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
  const estimator: EstimatorVersion = input.estimator ?? 'utf8-bytes-v1';
  if (!isKnownEstimatorVersion(estimator)) return { ok: false, error: 'usage_estimator_unknown' };
  if (typeof input.owner !== 'string' || input.owner.length < 1 || input.owner.length > 512) return { ok: false, error: 'usage_calibration_owner_invalid' };
  if (typeof input.batch !== 'string' || input.batch.length < 1 || input.batch.length > 256) return { ok: false, error: 'usage_calibration_batch_invalid' };

  const committed = await asPrincipal(pool, input.owner, async (c) => {
    const pairs = await listUsageCalibrationPairs(c, input.owner);
    const groups = groupByServiceModel(pairs);
    const results: ReconcileUsageCalibrationGroupResult[] = [];
    let totalUnderEstimated = 0;

    for (const group of groups) {
      const { service, model, pairs: groupPairs } = group;
      const observations: UsageObservation[] = groupPairs.map((p) => ({
        estimator,
        estimateInputTokens: p.estimateInputTokens,
        providerInputTokens: p.providerInputTokens,
        providerOutputTokens: p.providerOutputTokens,
        service: p.service,
        model: p.model,
        batch: input.batch,
        observedAtMs: p.observedAtMs,
      }));
      const outcome = reconcileUsage(observations, { estimator });
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
