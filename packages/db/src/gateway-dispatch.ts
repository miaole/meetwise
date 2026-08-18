/**
 * Fixed cross-owner dispatch metadata seam. The gateway returns only owner
 * identifiers; each job action must immediately re-enter `asPrincipal`.
 */
import { asGateway, type DbPool } from './principal.ts';

export type GatewayDispatchWork = 'interview' | 'quiz' | 'diagnosis' | 'report' | 'commerce';

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
