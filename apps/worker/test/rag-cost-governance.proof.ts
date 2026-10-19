/** 费用治理启动门：开发可观察，生产缺任一价格/预算字段必须拒绝启动。缺用量以外的实量拒绝不依赖数据库。 */
import type { Embedder } from '@meetwise/ai-runtime';
import type { DbPool } from '@meetwise/db';
import { budgetedQbankEmbedding, RagCostError, resolveRagCostGovernance, type RagCostGovernanceConfig } from '../src/rag-cost-governance.ts';

let failures = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const fails = (env: NodeJS.ProcessEnv, code: string) => {
  try { resolveRagCostGovernance(env); return false; } catch (error) { return String(error).includes(code); }
};

const development = resolveRagCostGovernance({ NODE_ENV: 'development' });
check('开发默认 observe，保留本地样例可运行性', development.mode === 'observe' && development.maxInputTokens === 16_000);
check('生产不能以 observe 启动', fails({ NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'observe' }, 'rag_cost_enforcement_required_in_production'));
check('生产缺价格表或月度预算配置即拒绝启动', fails({ NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'enforce' }, 'rag_cost_invalid_provider'));
const production = resolveRagCostGovernance({
  NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'enforce', RAG_EMBED_MAX_INPUT_TOKENS: '16000',
  RAG_EMBED_BILLING_PROVIDER: 'dashscope', RAG_EMBED_BILLING_MODEL: 'text-embedding-v4', RAG_EMBED_BILLING_REGION: 'cn-beijing',
  RAG_EMBED_PRICE_REVISION: '2026-08-03', RAG_EMBED_INPUT_MICRO_CNY_PER_MILLION: '500000',
  RAG_EMBED_PRICE_SOURCE_URL: 'https://help.aliyun.com/zh/model-studio/text-embedding-v4',
  RAG_EMBED_MONTHLY_BUDGET_MICRO_CNY: '100000000', RAG_EMBED_BUDGET_SCOPE: 'rag-embedding-prod',
});
check('生产只有完整的价格 revision、硬预算、输入上界时才进入 enforce', production.mode === 'enforce'
  && production.maxInputTokens === 16_000 && production.inputMicroCnyPerMillion === 500_000 && production.monthlyBudgetMicroCny === 100_000_000);

// 预留和派发必须先返回，范围检查才跑得到。结算语句仍默认抛错，避免把估算写进账。
function scriptedPool(): { pool: DbPool; settleTokens: unknown[] } {
  const settleTokens: unknown[] = [];
  const empty = { rows: [], rowCount: 0 };
  const client = {
    async query(sql: unknown, params?: unknown[]) {
      const text = typeof sql === 'string' ? sql : String(sql);
      if (text.includes('ai_cost_settle')) {
        settleTokens.push(params?.[3]);
        throw new Error('proof_settle_queried');
      }
      if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK' || text.startsWith('SET LOCAL ROLE ') || text.includes('set_config')) return empty;
      if (text.includes('ai_cost_reserve_text_scoped')) {
        return { rows: [{ decision: 'reserved', reserved_micro_cny: 1000, price_revision: 'r-proof' }], rowCount: 1 };
      }
      if (text.includes('ai_cost_mark_dispatched_scoped') || text.includes('ai_cost_mark_unknown_scoped') || text.includes('ai_cost_release_scoped')) {
        return { rows: [{ ok: true }], rowCount: 1 };
      }
      throw new Error(`proof_query_refused:${text}`);
    },
    release() { /* 假连接无会话可释放 */ },
  };
  return { pool: { async connect() { return client; } } as unknown as DbPool, settleTokens };
}

const rejectCfg: RagCostGovernanceConfig = {
  mode: 'enforce', provider: 'proof', model: 'embed-proof', region: 'cn-test', priceRevision: 'r-proof',
  inputMicroCnyPerMillion: 1_000_000, priceSourceUrl: 'https://pricing.invalid/proof', monthlyBudgetMicroCny: 3_000,
  scopeId: 'rag-proof-reject', maxInputTokens: 1000,
};

async function rejectReported(name: string, inputTokens: number | null): Promise<void> {
  const script = scriptedPool();
  let calls = 0;
  const embedder: Embedder = {
    dim: 512, id: 'embed-proof',
    async embed(texts) { calls++; return texts.map(() => [1, 0]); },
    async embedWithUsage(texts) {
      calls++;
      return { vectors: texts.map(() => [1, 0]), inputTokens: inputTokens as unknown as number };
    },
  };
  const outcome = await budgetedQbankEmbedding(script.pool, 'rag-proof-owner', embedder, rejectCfg)(
    ['中文测试'], { cacheKey: name, invocationId: name, mode: 'claimed' },
  ).then((vectors) => ({ rejected: false, vectors })).catch((error: unknown) => ({ rejected: true, error }));
  const error = outcome.rejected ? outcome.error : undefined;
  const message = error instanceof Error ? error.message : '';
  const code = error instanceof RagCostError ? error.code : '';
  const ok = outcome.rejected && calls === 1 && script.settleTokens.length === 0
    && message === 'external_outcome_unknown' && code === 'external_outcome_unknown';
  check(name, ok);
  if (!ok) console.log(`  detail calls=${calls} settles=${script.settleTokens.join(',')} message=${message} code=${code}`);
}

rejectReported('空值拒绝且不按文本估算入账', null)
  .then(() => rejectReported('小数拒绝且不按文本估算入账', 1.5))
  .then(() => rejectReported('负数拒绝且不按文本估算入账', -1))
  .then(() => {
    console.log(`\n${failures === 0 ? '✓ RAG 费用治理启动门全部通过' : `✗ ${failures} 项失败`}`);
    process.exit(failures === 0 ? 0 : 1);
  })
  .catch((error) => { console.error(error); process.exit(1); });
