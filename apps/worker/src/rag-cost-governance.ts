/**
 * 运行时 RAG 费用护栏。
 *
 * `enforce` 的调用顺序是：短事务预留 → 短事务标记已派发 → 外部 embedding → 短事务结算。
 * 一旦派发后的结果丢失，账本进入 unknown 并向上返回确定性降级码；不能把同一请求再发一次。
 */
import {
  asPrincipal, markAiCostDispatched, markAiCostUnknown, releaseAiCost, reserveAiCost, settleAiCost,
  type DbPool, type QbankEmbeddingCallContext,
} from '@meetwise/db';
import { getMetrics, METRIC, type Embedder } from '@meetwise/ai-runtime';

export interface RagCostGovernanceConfig {
  mode: 'observe' | 'enforce';
  provider?: string;
  model?: string;
  region?: string;
  priceRevision?: string;
  inputMicroCnyPerMillion?: number;
  priceSourceUrl?: string;
  monthlyBudgetMicroCny?: number;
  scopeId?: string;
  maxInputTokens: number;
}

function boundedPositive(raw: string | undefined, name: string, fallback?: number): number {
  if (raw === undefined && fallback !== undefined) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 1_000_000_000) throw new Error(`rag_cost_invalid_${name}`);
  return n;
}

function required(raw: string | undefined, name: string, pattern: RegExp): string {
  if (!raw || !pattern.test(raw)) throw new Error(`rag_cost_invalid_${name}`);
  return raw;
}

/** Production refuses to boot RAG in observation-only mode; development can retain low-friction local runs. */
export function resolveRagCostGovernance(env: NodeJS.ProcessEnv = process.env): RagCostGovernanceConfig {
  const production = env.NODE_ENV?.trim().toLowerCase() === 'production';
  const modeRaw = env.RAG_COST_ENFORCEMENT ?? (production ? 'enforce' : 'observe');
  if (modeRaw !== 'observe' && modeRaw !== 'enforce') throw new Error('rag_cost_invalid_mode');
  if (production && modeRaw !== 'enforce') throw new Error('rag_cost_enforcement_required_in_production');
  const maxInputTokens = boundedPositive(env.RAG_EMBED_MAX_INPUT_TOKENS, 'max_input_tokens', 16_000);
  if (modeRaw === 'observe') return { mode: 'observe', maxInputTokens };
  return {
    mode: 'enforce', maxInputTokens,
    provider: required(env.RAG_EMBED_BILLING_PROVIDER, 'provider', /^[A-Za-z0-9._-]{1,80}$/),
    model: required(env.RAG_EMBED_BILLING_MODEL, 'model', /^[A-Za-z0-9._:-]{1,160}$/),
    region: required(env.RAG_EMBED_BILLING_REGION, 'region', /^[A-Za-z0-9._-]{1,80}$/),
    priceRevision: required(env.RAG_EMBED_PRICE_REVISION, 'price_revision', /^[A-Za-z0-9._:-]{1,80}$/),
    inputMicroCnyPerMillion: boundedPositive(env.RAG_EMBED_INPUT_MICRO_CNY_PER_MILLION, 'input_micro_cny_per_million'),
    priceSourceUrl: required(env.RAG_EMBED_PRICE_SOURCE_URL, 'price_source_url', /^https:\/\/.{1,1992}$/),
    monthlyBudgetMicroCny: boundedPositive(env.RAG_EMBED_MONTHLY_BUDGET_MICRO_CNY, 'monthly_budget_micro_cny'),
    scopeId: required(env.RAG_EMBED_BUDGET_SCOPE, 'budget_scope', /^[A-Za-z0-9._:-]{1,160}$/),
  };
}

/** Installs a revisioned operator configuration. A rate change requires a new revision; old reservations keep their captured rate. */
export async function configureRagCostGovernance(pool: DbPool, cfg: RagCostGovernanceConfig): Promise<void> {
  if (cfg.mode !== 'enforce') return;
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query(
      `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,source_url,effective_at)
       VALUES($1,$2,$3,$4,$5,$6,clock_timestamp())
       ON CONFLICT(provider,model,region,revision) DO NOTHING`,
      [cfg.provider, cfg.model, cfg.region, cfg.priceRevision, cfg.inputMicroCnyPerMillion, cfg.priceSourceUrl],
    );
    const stored = await c.query(
      'SELECT input_micro_cny_per_million,source_url FROM ai_cost_price_book WHERE provider=$1 AND model=$2 AND region=$3 AND revision=$4',
      [cfg.provider, cfg.model, cfg.region, cfg.priceRevision],
    );
    if (stored.rowCount !== 1 || Number(stored.rows[0]?.input_micro_cny_per_million) !== cfg.inputMicroCnyPerMillion || stored.rows[0]?.source_url !== cfg.priceSourceUrl) {
      throw new Error('rag_cost_price_revision_conflict');
    }
    await c.query(
      `INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled)
       VALUES($1,$2,true)
       ON CONFLICT(scope_id) DO UPDATE SET monthly_limit_micro_cny=EXCLUDED.monthly_limit_micro_cny,enabled=true,updated_at=clock_timestamp()`,
      [cfg.scopeId, cfg.monthlyBudgetMicroCny],
    );
    await c.query('COMMIT');
  } catch (error) {
    await c.query('ROLLBACK');
    throw error;
  } finally { c.release(); }
}

export class RagCostError extends Error {
  constructor(readonly code: string) { super(code); this.name = 'RagCostError'; }
}

function metricDecision(decision: string, microCny = 0): void {
  const metrics = getMetrics();
  metrics.inc(METRIC.ragCostDecisions, { decision });
  if (microCny > 0) metrics.inc(METRIC.ragCostSettledMicroCny, undefined, microCny);
}

/** Returns an `embed` callback compatible with the qbank claim protocol. It never stores raw query text. */
export function budgetedQbankEmbedding(
  pool: DbPool, owner: string, embedder: Embedder, cfg: RagCostGovernanceConfig,
): (texts: string[], context: QbankEmbeddingCallContext) => Promise<number[][]> {
  return async (texts, context) => {
    if (cfg.mode === 'observe') {
      metricDecision('observe');
      return embedder.embed(texts);
    }
    const reserved = await asPrincipal(pool, owner, (c) => reserveAiCost(c, {
      scopeId: cfg.scopeId!, requestOwner: owner, idempotencyKey: context.invocationId,
      provider: cfg.provider!, model: cfg.model!, region: cfg.region!, maxInputTokens: cfg.maxInputTokens,
    }));
    metricDecision(reserved.decision, 0);
    if (reserved.decision !== 'reserved') throw new RagCostError(`rag_cost_${reserved.decision}`);
    const dispatched = await asPrincipal(pool, owner, (c) => markAiCostDispatched(c, cfg.scopeId!, owner, context.invocationId));
    if (!dispatched) {
      // No provider call has happened before this point. Release only a still-reserved row; if the row was changed
      // by an unexpected concurrent actor the release is a no-op and the state remains inspectable.
      await asPrincipal(pool, owner, (c) => releaseAiCost(c, cfg.scopeId!, owner, context.invocationId, 'dispatch_not_confirmed')).catch(() => undefined);
      throw new RagCostError('rag_cost_dispatch_state');
    }
    try {
      const result = embedder.embedWithUsage
        ? await embedder.embedWithUsage(texts)
        : { vectors: await embedder.embed(texts) };
      const actualTokens = result.inputTokens ?? cfg.maxInputTokens;
      if (!Number.isInteger(actualTokens) || actualTokens < 0 || actualTokens > cfg.maxInputTokens) {
        throw new Error('provider_usage_out_of_reserved_range');
      }
      const settled = await asPrincipal(pool, owner, (c) => settleAiCost(c, cfg.scopeId!, owner, context.invocationId, actualTokens));
      metricDecision('settled', settled);
      return result.vectors;
    } catch (error) {
      // The request had already been declared dispatched.  A timeout, malformed provider response or failed settlement
      // cannot prove that no billable work happened, so retain the reservation and block replay.
      const reason = (error as { code?: unknown } | undefined)?.code;
      await asPrincipal(pool, owner, (c) => markAiCostUnknown(c, cfg.scopeId!, owner, context.invocationId,
        typeof reason === 'string' && /^[A-Za-z0-9._:-]{1,120}$/.test(reason) ? reason : 'external_outcome_unknown')).catch(() => undefined);
      metricDecision('unknown');
      throw Object.assign(new RagCostError('external_outcome_unknown'), { code: 'external_outcome_unknown' });
    }
  };
}
