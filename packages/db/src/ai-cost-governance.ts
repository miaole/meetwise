/**
 * AI 费用账本的应用侧契约。数据库过程才是并发预算与状态机的真相；此文件不缓存
 * 决策、不做金额运算，避免多 worker 的本地状态把预算打穿。
 */
import type { Client } from './principal.ts';

export type AiCostDecision = 'reserved' | 'held' | 'unknown' | 'settled' | 'released' | 'policy_missing' | 'price_missing' | 'binding_mismatch' | 'budget_exhausted';
export interface AiCostReservationInput {
  scopeId: string;
  requestOwner: string;
  idempotencyKey: string;
  provider: string;
  model: string;
  region: string;
  maxInputTokens: number;
}
export interface AiCostReservationDecision {
  decision: AiCostDecision;
  reservedMicroCny: number;
  priceRevision: string | undefined;
}

/** 文本/视觉模型费用：输入、输出均在派发前按上限预留，成功后按实收 token 结算。 */
export interface AiTextCostReservationInput extends AiCostReservationInput {
  /** Caller-selected immutable price row; the database must never choose latest. */
  priceRevision: string;
  maxInputTokens: number;
  maxOutputTokens: number;
}

export async function reserveAiCost(c: Client, input: AiCostReservationInput): Promise<AiCostReservationDecision> {
  const r = await c.query(
    'SELECT decision,reserved_micro_cny,price_revision FROM ai_cost_reserve_scoped($1,$2,$3,$4,$5,$6,$7)',
    [input.scopeId, input.requestOwner, input.idempotencyKey, input.provider, input.model, input.region, input.maxInputTokens],
  );
  const row = r.rows[0];
  if (!row) throw new Error('ai_cost_reservation_no_decision');
  return { decision: String(row.decision) as AiCostDecision, reservedMicroCny: Number(row.reserved_micro_cny), priceRevision: row.price_revision ? String(row.price_revision) : undefined };
}

export async function reserveAiTextCost(c: Client, input: AiTextCostReservationInput): Promise<AiCostReservationDecision> {
  const r = await c.query(
    'SELECT decision,reserved_micro_cny,price_revision FROM ai_cost_reserve_text_scoped($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [input.scopeId, input.requestOwner, input.idempotencyKey, input.provider, input.model, input.region, input.priceRevision, input.maxInputTokens, input.maxOutputTokens],
  );
  const row = r.rows[0];
  if (!row) throw new Error('ai_text_cost_reservation_no_decision');
  return { decision: String(row.decision) as AiCostDecision, reservedMicroCny: Number(row.reserved_micro_cny), priceRevision: row.price_revision ? String(row.price_revision) : undefined };
}

export async function markAiCostDispatched(c: Client, scopeId: string, requestOwner: string, idempotencyKey: string): Promise<boolean> {
  const r = await c.query('SELECT ai_cost_mark_dispatched_scoped($1,$2,$3) AS ok', [scopeId, requestOwner, idempotencyKey]);
  return r.rows[0]?.ok === true;
}

export async function settleAiCost(c: Client, scopeId: string, requestOwner: string, idempotencyKey: string, actualInputTokens: number): Promise<number> {
  const r = await c.query('SELECT ai_cost_settle_scoped($1,$2,$3,$4) AS micro_cny', [scopeId, requestOwner, idempotencyKey, actualInputTokens]);
  return Number(r.rows[0]?.micro_cny);
}

export async function settleAiTextCost(
  c: Client, scopeId: string, requestOwner: string, idempotencyKey: string, actualInputTokens: number, actualOutputTokens: number,
): Promise<number> {
  const r = await c.query('SELECT ai_cost_settle_text_scoped($1,$2,$3,$4,$5) AS micro_cny', [scopeId, requestOwner, idempotencyKey, actualInputTokens, actualOutputTokens]);
  return Number(r.rows[0]?.micro_cny);
}

/** 仅当模型端点返回了明确的、未执行请求的拒绝响应时调用；超时和 5xx 必须进 unknown。 */
export async function markAiTextCostRejected(c: Client, scopeId: string, requestOwner: string, idempotencyKey: string): Promise<boolean> {
  const r = await c.query('SELECT ai_cost_mark_rejected_scoped($1,$2,$3) AS ok', [scopeId, requestOwner, idempotencyKey]);
  return r.rows[0]?.ok === true;
}

export async function releaseAiCost(c: Client, scopeId: string, requestOwner: string, idempotencyKey: string, reason: string): Promise<boolean> {
  const r = await c.query('SELECT ai_cost_release_scoped($1,$2,$3,$4) AS ok', [scopeId, requestOwner, idempotencyKey, reason]);
  return r.rows[0]?.ok === true;
}

export async function markAiCostUnknown(c: Client, scopeId: string, requestOwner: string, idempotencyKey: string, reason: string): Promise<boolean> {
  const r = await c.query('SELECT ai_cost_mark_unknown_scoped($1,$2,$3,$4) AS ok', [scopeId, requestOwner, idempotencyKey, reason]);
  return r.rows[0]?.ok === true;
}

/**
 * Reconciliation receives the immutable scope captured in the model
 * invocation at claim time.  Owner/key alone are deliberately insufficient:
 * the same principal can use the same idempotency text in two independent
 * budgets, and freezing both would corrupt the unrelated budget.
 */
export async function markAiCostsUnknownForModelReconcile(
  c: Client, scopeId: string, requestOwner: string, idempotencyKey: string,
): Promise<number> {
  const r = await c.query(
    'SELECT ai_cost_mark_unknown_for_model_reconcile_scoped($1,$2,$3,$4) AS changed',
    [scopeId, requestOwner, idempotencyKey, 'model_terminalization_reconcile'],
  );
  return Number(r.rows[0]?.changed) || 0;
}
