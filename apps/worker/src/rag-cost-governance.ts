/**
 * 运行时 RAG 费用护栏。
 *
 * `enforce` 传入存储且全部命中：按输入顺序返回已有向量，不预留、不外呼、不写账本。
 * 其余 enforce：短事务预留 → 标记已派发 → 嵌入（有存储时只嵌未命中）→ 有存储则回填 → 短事务结算。
 * 一旦派发后的结果丢失，账本进入 unknown 并向上返回确定性降级码；不能把同一请求再发一次。
 */
import { createHash } from 'node:crypto';
import {
  asPrincipal, markAiCostDispatched, markAiCostUnknown, releaseAiCost, reserveAiTextCost, settleAiCost,
  type DbPool, type QbankEmbeddingCallContext,
} from '@meetwise/db';
import { cjkWeightedEstimate, getMetrics, METRIC, type Embedder, type EmbeddingStore } from '@meetwise/ai-runtime';

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
  pool: DbPool, owner: string, embedder: Embedder, cfg: RagCostGovernanceConfig, store?: EmbeddingStore,
): (texts: string[], context: QbankEmbeddingCallContext) => Promise<number[][]> {
  return async (texts, context) => {
    if (cfg.mode === 'observe') {
      metricDecision('observe');
      return embedder.embed(texts);
    }
    // 键与进程内缓存相同：模型 id、维度、文本 sha256。id 用调用方传入的嵌入器，不使用包装器的 +cache。
    let pending: { keys: string[]; cached: (number[] | null)[]; misses: { i: number; text: string }[] } | undefined;
    if (store) {
      const keys = texts.map((text) => `${embedder.id}:${embedder.dim}:${createHash('sha256').update(text).digest('hex')}`);
      const cached = await store.getMany(keys);
      const misses: { i: number; text: string }[] = [];
      texts.forEach((text, i) => { if (!cached[i]) misses.push({ i, text }); });
      if (misses.length === 0) return cached as number[][];
      pending = { keys, cached, misses };
    }
    const missTexts = pending ? pending.misses.map((item) => item.text) : texts;
    // 预留走 0083 九参 text 口(语义:Caller-selected immutable price row;the database must never choose
    // latest)——绑定 cfg.priceRevision,封死「新预留按时点 latest 隐式选价与配置 revision 脱钩」双轨
    // (EG-B4·红事实 B)。embedding 无输出:maxOutputTokens=0(0083 input+output≥1 校验容忍 output=0)。
    // 换 revision 同键重放→binding_mismatch→rag_cost_binding_mismatch 确定性拒绝(fail-closed,绝不静默
    // 按新价放行);价格本缺行→price_missing→rag_cost_price_missing(启动期 configureRagCostGovernance
    // 对表断言已保正常路径零新增拒绝面)。settle/release/dispatched/unknown 四件原样零字节:结算按预留行
    // 捕获单价(old reservations keep their captured rate),预留绑死后结算自动随行。
    const reserved = await asPrincipal(pool, owner, (c) => reserveAiTextCost(c, {
      scopeId: cfg.scopeId!, requestOwner: owner, idempotencyKey: context.invocationId,
      provider: cfg.provider!, model: cfg.model!, region: cfg.region!, priceRevision: cfg.priceRevision!,
      maxInputTokens: cfg.maxInputTokens, maxOutputTokens: 0,
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
        ? await embedder.embedWithUsage(missTexts)
        : { vectors: await embedder.embed(missTexts) };
      // 只有缺失（=== undefined）按这次实际嵌入的各段估算，并在范围检查前截到上限。在场实量不截断。
      const reportedTokens = result.inputTokens;
      const actualTokens = reportedTokens === undefined
        ? Math.min(missTexts.reduce((sum, text) => sum + cjkWeightedEstimate(text), 0), cfg.maxInputTokens)
        : reportedTokens;
      if (!Number.isInteger(actualTokens) || actualTokens < 0 || actualTokens > cfg.maxInputTokens) {
        throw new Error('provider_usage_out_of_reserved_range');
      }
      const ready = pending;
      if (ready && store) {
        if (result.vectors.length !== ready.misses.length) throw new Error('provider_usage_out_of_reserved_range');
        const written = ready.misses.map((item, j) => {
          const vec = result.vectors[j];
          const key = ready.keys[item.i];
          if (!vec || key === undefined) throw new Error('provider_usage_out_of_reserved_range');
          return { key, vec };
        });
        await store.putMany(written);
        ready.misses.forEach((item, j) => { ready.cached[item.i] = written[j]!.vec; });
      }
      const settled = await asPrincipal(pool, owner, (c) => settleAiCost(c, cfg.scopeId!, owner, context.invocationId, actualTokens));
      metricDecision('settled', settled);
      return ready ? ready.cached as number[][] : result.vectors;
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
