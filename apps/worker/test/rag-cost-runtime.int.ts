/** 真 PostgreSQL + fake provider 集成：预留在外部调用前提交，成功结算；未知结果冻结后不再触发第二次 provider 调用。 */
import { fileURLToPath } from 'node:url';
import { createPool, loadMigrations, runMigrations } from '@meetwise/db';
import type { Embedder } from '@meetwise/ai-runtime';
import { budgetedQbankEmbedding, configureRagCostGovernance, resolveRagCostGovernance } from '../src/rag-cost-governance.ts';

const pool = createPool();
const suffix = `${Date.now()}-${process.pid}`;
const owner = `rag-cost-runtime-owner-${suffix}`;
const scope = `rag-cost-runtime-${suffix}`;
const model = `embed-proof-${process.pid}`;
let failures = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

async function main() {
  await pool.query("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_role') THEN CREATE ROLE app_role NOLOGIN; END IF; END $$");
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))).filter((m) => m.version >= '0033_ai_cost_governance'));
  const cfg = resolveRagCostGovernance({
    NODE_ENV: 'production', RAG_COST_ENFORCEMENT: 'enforce', RAG_EMBED_MAX_INPUT_TOKENS: '1000',
    RAG_EMBED_BILLING_PROVIDER: 'proof', RAG_EMBED_BILLING_MODEL: model, RAG_EMBED_BILLING_REGION: 'cn-test',
    RAG_EMBED_PRICE_REVISION: `r-${suffix}`, RAG_EMBED_INPUT_MICRO_CNY_PER_MILLION: '1000000',
    RAG_EMBED_PRICE_SOURCE_URL: 'https://pricing.invalid/proof', RAG_EMBED_MONTHLY_BUDGET_MICRO_CNY: '3000', RAG_EMBED_BUDGET_SCOPE: scope,
  });
  await configureRagCostGovernance(pool, cfg);
  let calls = 0;
  const okEmbedder: Embedder = {
    dim: 512, id: model,
    async embed(texts) { calls++; return texts.map(() => [1, 0]); },
    async embedWithUsage(texts) { calls++; return { vectors: texts.map(() => [1, 0]), inputTokens: 200 }; },
  };
  const embed = budgetedQbankEmbedding(pool, owner, okEmbedder, cfg);
  const vectors = await embed(['不持久化的查询文本'], { cacheKey: 'opaque-cache-key', invocationId: `ok-${suffix}`, mode: 'claimed' });
  const settled = await pool.query('SELECT status,settled_micro_cny FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2', [scope, `ok-${suffix}`]);
  check('调用前预留、provider 返回 usage 后按实际 token 结算', calls === 1 && vectors.length === 1
    && settled.rows[0]?.status === 'settled' && Number(settled.rows[0]?.settled_micro_cny) === 200);

  let uncertainCalls = 0;
  const uncertainEmbedder: Embedder = {
    dim: 512, id: model,
    async embed() { uncertainCalls++; throw new Error('transport_lost_after_dispatch'); },
  };
  const uncertain = budgetedQbankEmbedding(pool, owner, uncertainEmbedder, cfg);
  const context = { cacheKey: 'opaque-unknown-key', invocationId: `unknown-${suffix}`, mode: 'claimed' as const };
  const first = await uncertain(['private query'], context).then(() => false).catch((error) => error?.code === 'external_outcome_unknown');
  const second = await uncertain(['private query'], context).then(() => false).catch((error) => String(error).includes('rag_cost_unknown'));
  const unknown = await pool.query('SELECT status,reason_code FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2', [scope, context.invocationId]);
  check('派发后传输结果未知：账本冻结，同一 invocation 不会触发第二次 provider 调用', first && second && uncertainCalls === 1
    && unknown.rows[0]?.status === 'unknown' && unknown.rows[0]?.reason_code === 'external_outcome_unknown');

  console.log(`\n${failures === 0 ? '✓ RAG 费用运行时集成全部通过' : `✗ ${failures} 项失败`}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(async (error) => { console.error(error); await pool.end().catch(() => undefined); process.exit(1); });
