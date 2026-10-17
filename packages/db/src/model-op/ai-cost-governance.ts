/**
 * AI 费用账本的应用侧契约。数据库过程仍是并发预算与状态机的唯一真相，本文件不做
 * 金额运算。本地决策缓存是唯一的有状态面：只缓存终态拒绝（budget_exhausted）的
 * 短窗重放（TTL=AI_COST_EXHAUSTED_CACHE_TTL_MS），绝不缓存授予（reserved/held
 * 族）——授予面每次必须直达权威 SQL 函数，本地状态因此永远无法把预算打穿；
 * 排空态（预算耗尽后）的重放免掉对全局热点行 (policy, month) 的排队上锁。
 */
import type { Client } from '../principal.ts';

/**
 * 排空态决策短窗 TTL（模块常量，非 env）：写后窗内同 (scope, period) 的
 * budget_exhausted 短路重放；预算调增/回补的生效延迟因此 ≤TTL（保守误拒面，
 * 零资损零丢单）。
 */
export const AI_COST_EXHAUSTED_CACHE_TTL_MS = 30_000;

interface ExhaustedCacheEntry { expiresAt: number }
const exhaustedDecisionCache = new Map<string, ExhaustedCacheEntry>();

function exhaustedCacheKey(scopeId: string, period: string): string {
  return `${scopeId}\u0000${period}`;
}

/** 与 SQL 同式派生 period（0033:86/0204:76：to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM')）。 */
function currentUtcPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

/** 测试缝：清空决策缓存（用例间复位，保证既有语义 proof 观察到权威 SQL 行为零漂）。 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- 缝名为契约钉面（测试 seam 双下划线惯例·非代码标识符风格·行内豁免沿 env-schema 先例形）
export function __resetAiCostExhaustedCacheForTest(): void {
  exhaustedDecisionCache.clear();
}

/**
 * 命中=窗内重放终态拒绝（零 SQL，热点行零触碰）；失效通道①=TTL 到期（惰性逐出），
 * 通道③=period 翻月键自然分片。
 */
function shortCircuitExhausted(scopeId: string): AiCostReservationDecision | undefined {
  const key = exhaustedCacheKey(scopeId, currentUtcPeriod());
  const entry = exhaustedDecisionCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    exhaustedDecisionCache.delete(key);
    return undefined;
  }
  return { decision: 'budget_exhausted', reservedMicroCny: 0, priceRevision: undefined };
}

/** 只写终态拒绝；任一次 reserve 返回非 exhausted 即清键（通道②自愈——仅当后续
 *  reserve 实际到达 SQL 且返回非 exhausted 才生效，settle/release 等预算回流
 *  路径不触发清键）。 */
function recordExhaustedDecision(scopeId: string, decision: AiCostDecision): void {
  const key = exhaustedCacheKey(scopeId, currentUtcPeriod());
  if (decision === 'budget_exhausted') {
    exhaustedDecisionCache.set(key, { expiresAt: Date.now() + AI_COST_EXHAUSTED_CACHE_TTL_MS });
  } else {
    exhaustedDecisionCache.delete(key);
  }
}

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
  const decision = String(row.decision) as AiCostDecision;
  recordExhaustedDecision(input.scopeId, decision);
  return { decision, reservedMicroCny: Number(row.reserved_micro_cny), priceRevision: row.price_revision ? String(row.price_revision) : undefined };
}

export async function reserveAiTextCost(c: Client, input: AiTextCostReservationInput): Promise<AiCostReservationDecision> {
  const cached = shortCircuitExhausted(input.scopeId);
  if (cached) return cached;
  const r = await c.query(
    'SELECT decision,reserved_micro_cny,price_revision FROM ai_cost_reserve_text_scoped($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [input.scopeId, input.requestOwner, input.idempotencyKey, input.provider, input.model, input.region, input.priceRevision, input.maxInputTokens, input.maxOutputTokens],
  );
  const row = r.rows[0];
  if (!row) throw new Error('ai_text_cost_reservation_no_decision');
  const decision = String(row.decision) as AiCostDecision;
  recordExhaustedDecision(input.scopeId, decision);
  return { decision, reservedMicroCny: Number(row.reserved_micro_cny), priceRevision: row.price_revision ? String(row.price_revision) : undefined };
}

export async function markAiCostDispatched(c: Client, scopeId: string, requestOwner: string, idempotencyKey: string): Promise<boolean> {
  const r = await c.query('SELECT ai_cost_mark_dispatched_scoped($1,$2,$3) AS ok', [scopeId, requestOwner, idempotencyKey]);
  return r.rows[0]?.ok === true;
}

export async function settleAiCost(c: Client, scopeId: string, requestOwner: string, idempotencyKey: string, actualInputTokens: number): Promise<number> {
  const r = await c.query('SELECT ai_cost_settle_scoped($1,$2,$3,$4) AS micro_cny', [scopeId, requestOwner, idempotencyKey, actualInputTokens]);
  return Number(r.rows[0]?.micro_cny);
}

/** AG-11/EG-B2：settle 结果扩 overage 标记（真实消耗超预留的显式打标；SQL 侧 scoped
 *  wrapper settle 后回读 reservation 行）。调用方据此计数告警，结算本身不拒绝。
 *  #48/#49：第 6 参 actualCachedInputTokens=缓存命中输入 token 实量（供应商未回报按 0
 *  传=现行保守语义）；SQL 侧六参无 DEFAULT，漏传即报错显形。 */
export interface AiTextCostSettleResult {
  microCny: number;
  overage: boolean;
}

export async function settleAiTextCost(
  c: Client, scopeId: string, requestOwner: string, idempotencyKey: string, actualInputTokens: number, actualOutputTokens: number,
  actualCachedInputTokens: number,
): Promise<AiTextCostSettleResult> {
  const r = await c.query('SELECT micro_cny, overage FROM ai_cost_settle_text_scoped($1,$2,$3,$4,$5,$6)', [scopeId, requestOwner, idempotencyKey, actualInputTokens, actualOutputTokens, actualCachedInputTokens]);
  const row = r.rows[0];
  return { microCny: Number(row?.micro_cny), overage: row?.overage === true };
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
