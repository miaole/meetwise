/**
 * Fixed cross-owner dispatch metadata seam. The gateway returns only owner
 * identifiers; each job action must immediately re-enter `asPrincipal`.
 */
import { asGateway, type DbPool } from '../principal.ts';

export type GatewayDispatchWork = 'interview' | 'quiz' | 'diagnosis' | 'report' | 'commerce' | 'job_route';

export interface GatewayJobGauge {
  queue: 'interview_job' | 'report' | 'quiz_job' | 'diagnosis_job';
  queued: number;
  runningExpired: number;
  dead: number;
}

export interface GatewayCostBudgetSnapshot {
  monthlyLimitMicroCny: number;
  usedMicroCny: number;
  unknownCount: number;
}

export async function gatewayDispatchOwners(pool: DbPool, work: GatewayDispatchWork): Promise<string[]> {
  const result = await asGateway(pool, (c) =>
    c.query('SELECT owner_user_id FROM gateway_dispatch_owners($1)', [work]));
  return result.rows.map((row) => String(row.owner_user_id));
}

/** Only returns principals with stale post-dispatch model calls; no invocation content is exposed to the gateway role. */
export async function gatewayModelInvocationOwners(pool: DbPool, olderThanMs: number): Promise<string[]> {
  const result = await asGateway(pool, (c) =>
    c.query('SELECT owner_user_id FROM gateway_model_invocation_owners($1)', [olderThanMs]));
  return result.rows.map((row) => String(row.owner_user_id));
}

/** Only returns principals with a succeeded invocation whose trace row is missing (UC-028 A2 recon backfill diff set); idempotency keys and invocation content never cross the seam — each owner's anti-join re-enters `asPrincipal`. */
export async function gatewayTraceReconMissingOwners(pool: DbPool, limit: number): Promise<string[]> {
  const result = await asGateway(pool, (c) =>
    c.query('SELECT owner_user_id FROM gateway_trace_recon_missing_owners($1)', [limit]));
  return result.rows.map((row) => String(row.owner_user_id));
}

export interface GatewayModelInvocationBacklog {
  dispatchingAged: number;
  unknownUnresolved: number;
}

/** Aggregate backlog water level for post-dispatch model calls: aged-dispatching depth and unresolved unknown stock; counts only, never owners or invocation content. */
export async function gatewayModelInvocationBacklog(pool: DbPool, olderThanMs: number): Promise<GatewayModelInvocationBacklog> {
  const result = await asGateway(pool, (c) =>
    c.query('SELECT dispatching_aged,unknown_unresolved FROM gateway_model_invocation_backlog($1)', [olderThanMs]));
  const row = result.rows[0];
  return {
    dispatchingAged: Number(row?.dispatching_aged) || 0,
    unknownUnresolved: Number(row?.unknown_unresolved) || 0,
  };
}

/** Global operational gauges expose only aggregate counts, never jobs, users, prompts, or payment details. */
export async function gatewayJobGauges(pool: DbPool): Promise<GatewayJobGauge[]> {
  const result = await asGateway(pool, (c) => c.query('SELECT * FROM gateway_job_gauges()'));
  return result.rows.map((row) => ({
    queue: String(row.queue) as GatewayJobGauge['queue'],
    queued: Number(row.queued) || 0,
    runningExpired: Number(row.running_expired) || 0,
    dead: Number(row.dead) || 0,
  }));
}

/** A budget snapshot is intentionally one configured scope's aggregate, with no request-owner dimension. */
export async function gatewayCostBudgetSnapshot(pool: DbPool, scopeId: string): Promise<GatewayCostBudgetSnapshot | undefined> {
  const result = await asGateway(pool, (c) => c.query(
    'SELECT * FROM gateway_cost_budget_snapshot($1)', [scopeId]));
  const row = result.rows[0];
  return row ? {
    monthlyLimitMicroCny: Number(row.monthly_limit_micro_cny),
    usedMicroCny: Number(row.used_micro_cny),
    unknownCount: Number(row.unknown_count) || 0,
  } : undefined;
}

/** Only returns principals with estimate↔provider usage pairs eligible for calibration reconcile; no invocation content. */
export async function gatewayUsageCalibrationOwners(pool: DbPool): Promise<string[]> {
  const result = await asGateway(pool, (c) =>
    c.query('SELECT owner_user_id FROM gateway_usage_calibration_owners()'));
  return result.rows.map((row) => String(row.owner_user_id));
}

/**
 * 加窗枚举（AG-COST2 件④）：走 SECURITY DEFINER `gateway_usage_calibration_owners_v2(p_since)`，
 * 只返回 `completed_at > since` 窗口内有新配对的 owner。v1 wrapper 保留不动（对照/回滚面）。
 * `since` 允许 `'-infinity'`（tick 首跑无水位线时=与 v1 等价的全量枚举）。
 */
export async function gatewayUsageCalibrationOwnersSince(pool: DbPool, since: Date | string): Promise<string[]> {
  const result = await asGateway(pool, (c) =>
    c.query('SELECT owner_user_id FROM gateway_usage_calibration_owners_v2($1)', [since]));
  return result.rows.map((row) => String(row.owner_user_id));
}

/**
 * 水位线整批下界（AG-COST2 件⑤ EXEC 细化）：MIN(last_completed_at) 跨 owner；无行 → null
 * （tick 以 -infinity 全量枚举一次=首跑 v1 等价·此后单调收窄）。
 */
export async function gatewayUsageCalibrationWatermarkFloor(pool: DbPool): Promise<Date | null> {
  const result = await asGateway(pool, (c) =>
    c.query('SELECT gateway_usage_calibration_watermark_floor() AS floor_ts'));
  const row = result.rows[0];
  return row?.floor_ts ? new Date(row.floor_ts) : null;
}
