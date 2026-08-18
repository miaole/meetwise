/**
 * usage-calibration.ts — usage 对账校准因子的数据访问层（MODEL-OP-00 收尾 P2/P3 持久化接线）。
 *
 * 纯数据访问、零模型/域依赖（DAG 最底层）。四原语落地：
 *  - 幂等：观测日志 PK(owner,batch,invocation_idempotency_key) + ON CONFLICT DO NOTHING；
 *    因子 PK(owner,service,model,estimator,factor_version) 内容寻址，同内容同版本只落一份。
 *  - CAS：因子只 INSERT、绝不 UPDATE/DELETE（版本化 insert-only 单调历史）；同版本并发批幂等。
 *  - RLS：两张表 owner 绑定 FORCE RLS，本层所有写/读都在 asPrincipal 的 principal 事务内。
 *  - 持久有序日志：观测逐条落库（reconciliation_status 显式 within_estimate/under_estimated），
 *    低估绝不静默吞掉。
 *
 * 读面 `listUsageCalibrationPairs` 走 SECURITY DEFINER `ai_usage_calibration_pairs_scoped(owner)`：
 * ai_model_logical_node_header 对 app_role REVOKE ALL（0085），只能经 SECURITY DEFINER 读 frozen model。
 */
import type { Client } from './principal.ts';

/** estimate↔provider usage 配对（成功 + 校验失败的可计费调用；unknown 无 usage 不产出）。 */
export interface UsageCalibrationPair {
  idempotencyKey: string;
  service: string;
  model: string;
  estimateInputTokens: number;
  providerInputTokens: number;
  providerOutputTokens: number;
  observedAtMs: number;
}

/** ai_usage_calibration 单行投影（域侧 toCalibratedFactor 再校验一次，双校验不重实现）。 */
export interface UsageCalibrationFactorRow {
  estimator: string;
  factorVersion: string;
  factor: number;
  rawMaxRatio: number;
  safetyMargin: number;
  observationCount: number;
  hasUnderEstimate: boolean;
}

export async function listUsageCalibrationPairs(c: Client, owner: string): Promise<UsageCalibrationPair[]> {
  const r = await c.query(
    `SELECT idempotency_key, service, model, estimate_input_tokens, provider_input_tokens, provider_output_tokens, observed_at_ms
       FROM ai_usage_calibration_pairs_scoped($1)`,
    [owner],
  );
  return r.rows.map((row) => ({
    idempotencyKey: String(row.idempotency_key),
    service: String(row.service),
    model: String(row.model),
    estimateInputTokens: Number(row.estimate_input_tokens),
    providerInputTokens: Number(row.provider_input_tokens),
    providerOutputTokens: Number(row.provider_output_tokens),
    observedAtMs: Number(row.observed_at_ms),
  }));
}

export interface InsertUsageCalibrationFactorInput {
  owner: string;
  service: string;
  model: string;
  estimator: string;
  factorVersion: string;
  factor: number;
  rawMaxRatio: number;
  safetyMargin: number;
  observationCount: number;
  hasUnderEstimate: boolean;
}

/** 内容寻址 + ON CONFLICT DO NOTHING：同版本并发批幂等单份，绝不覆盖旧因子。 */
export async function insertUsageCalibrationFactor(c: Client, input: InsertUsageCalibrationFactorInput): Promise<boolean> {
  const r = await c.query(
    `INSERT INTO ai_usage_calibration(owner_user_id,service,model,estimator,factor_version,factor,raw_max_ratio,safety_margin,observation_count,under_estimate_flag)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (owner_user_id,service,model,estimator,factor_version) DO NOTHING`,
    [
      input.owner, input.service, input.model, input.estimator, input.factorVersion,
      input.factor, input.rawMaxRatio, input.safetyMargin, input.observationCount,
      input.hasUnderEstimate ? 'present' : 'none',
    ],
  );
  return (r.rowCount ?? 0) === 1;
}

export interface InsertUsageCalibrationObservationInput {
  owner: string;
  batch: string;
  idempotencyKey: string;
  service: string;
  model: string;
  estimator: string;
  estimateInputTokens: number;
  providerInputTokens: number;
  providerOutputTokens: number;
  /** providerInputTokens > estimateInputTokens：低估显式落库（绝不静默）。 */
  underEstimated: boolean;
  observedAtMs: number;
}

/** 观测日志幂等落库：PK(owner,batch,invocation_idempotency_key) 保证同一批同一调用只落一份。 */
export async function insertUsageCalibrationObservation(c: Client, input: InsertUsageCalibrationObservationInput): Promise<boolean> {
  const r = await c.query(
    `INSERT INTO ai_usage_calibration_observation(owner_user_id,batch,invocation_idempotency_key,service,model,estimator,estimate_input_tokens,provider_input_tokens,provider_output_tokens,reconciliation_status,observed_at_ms)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (owner_user_id,batch,invocation_idempotency_key) DO NOTHING`,
    [
      input.owner, input.batch, input.idempotencyKey, input.service, input.model, input.estimator,
      input.estimateInputTokens, input.providerInputTokens, input.providerOutputTokens,
      input.underEstimated ? 'under_estimated' : 'within_estimate', input.observedAtMs,
    ],
  );
  return (r.rowCount ?? 0) === 1;
}

/** 最新因子（insert-only 历史里 created_at 最新的一条）。调用方负责 principal 事务（RLS 生效）。 */
export async function latestUsageCalibrationFactor(
  c: Client, owner: string, service: string, model: string, estimator: string,
): Promise<UsageCalibrationFactorRow | null> {
  const r = await c.query(
    `SELECT estimator, factor_version, factor, raw_max_ratio, safety_margin, observation_count, under_estimate_flag
       FROM ai_usage_calibration
      WHERE owner_user_id=$1 AND service=$2 AND model=$3 AND estimator=$4
      ORDER BY created_at DESC, factor_version DESC
      LIMIT 1`,
    [owner, service, model, estimator],
  );
  const row = r.rows[0];
  if (!row) return null;
  return {
    estimator: String(row.estimator),
    factorVersion: String(row.factor_version),
    factor: Number(row.factor),
    rawMaxRatio: Number(row.raw_max_ratio),
    safetyMargin: Number(row.safety_margin),
    observationCount: Number(row.observation_count),
    hasUnderEstimate: String(row.under_estimate_flag) === 'present',
  };
}
