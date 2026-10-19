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

  // ── AG-24:预留 0083 九参口 revision 绑定断言臂（红事实 B：封死「新预留按 latest 隐式选价」双轨）──
  const bound = await pool.query('SELECT price_revision FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2', [scope, `ok-${suffix}`]);
  check('AG-24：预留行绑定 cfg.priceRevision（≠NULL·0083 九参口精确查价·封死 latest 隐式选价）', bound.rows[0]?.price_revision === cfg.priceRevision);

  const cfg2 = { ...cfg, priceRevision: `r2-${suffix}` };
  await configureRagCostGovernance(pool, cfg2);
  const mismatch = await budgetedQbankEmbedding(pool, owner, okEmbedder, cfg2)(['不持久化的查询文本'], { cacheKey: 'opaque-mismatch-key', invocationId: `ok-${suffix}`, mode: 'claimed' })
    .then(() => false)
    .catch((error) => error instanceof Error && error.message === 'rag_cost_binding_mismatch');
  check('AG-24：同 invocationId 换 revision 重放 → binding_mismatch 确定性拒绝（fail-closed·绝不静默按新价放行）', mismatch);

  const cfg3 = { ...cfg, priceRevision: `missing-${suffix}` };
  const missing = await budgetedQbankEmbedding(pool, owner, okEmbedder, cfg3)(['不持久化的查询文本'], { cacheKey: 'opaque-missing-key', invocationId: `missing-${suffix}`, mode: 'claimed' })
    .then(() => false)
    .catch((error) => error instanceof Error && error.message === 'rag_cost_price_missing');
  check('AG-24：价格本缺行 → price_missing 确定性拒绝（启动期对表断言保正常路径·运行期兜确定性码）', missing);

  const identicalVectors = await budgetedQbankEmbedding(pool, owner, okEmbedder, cfg)(['不持久化的查询文本'], { cacheKey: 'opaque-ident-key', invocationId: `ident-${suffix}`, mode: 'claimed' });
  const identical = await pool.query('SELECT status,settled_micro_cny FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2', [scope, `ident-${suffix}`]);
  check('AG-24：同输入同 revision 结算金额恒等（settle 按预留行捕获单价·绑定前后计费语义零变化）',
    identicalVectors.length === 1 && identical.rows[0]?.status === 'settled' && Number(identical.rows[0]?.settled_micro_cny) === 200);

  const observeVectors = await budgetedQbankEmbedding(pool, owner, { dim: 512, id: model, async embed(texts) { return texts.map(() => [1, 0]); } }, { mode: 'observe', maxInputTokens: 1000 })(['不持久化的查询文本'], { cacheKey: 'opaque-observe-key', invocationId: `observe-${suffix}`, mode: 'claimed' });
  const observeRows = await pool.query('SELECT count(*)::int n FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2', [scope, `observe-${suffix}`]);
  check('AG-24：observe 模式零账本触（零预留行·直连 embedder·零位移动臂）', observeVectors.length === 1 && Number(observeRows.rows[0]?.n) === 0);

  const usageScope = `rag-cost-runtime-usage-${suffix}`;
  const usageCfg = { ...cfg, scopeId: usageScope };
  await configureRagCostGovernance(pool, usageCfg);
  const usageReservation = async (invocationId: string) => {
    const found = await pool.query(
      'SELECT status,settled_micro_cny,reason_code FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2',
      [usageScope, invocationId],
    );
    return found.rows[0];
  };
  const vectorsOf = (texts: string[]) => texts.map(() => [1, 0]);

  const omitEmbedder: Embedder = {
    dim: 512, id: model,
    async embed(texts) { return vectorsOf(texts); },
    async embedWithUsage(texts) { return { vectors: vectorsOf(texts) }; },
  };
  const omitCjkId = `usage-omit-cjk-${suffix}`;
  const omitCjkVectors = await budgetedQbankEmbedding(pool, owner, omitEmbedder, usageCfg)(['中文测试'], { cacheKey: 'usage-omit-cjk', invocationId: omitCjkId, mode: 'claimed' });
  const omitCjk = await usageReservation(omitCjkId);
  const omitCjkSettled = Number(omitCjk?.settled_micro_cny);
  check('缺用量按段估算结算，中文测试实结 4，不是上限也不是 16000', omitCjkVectors.length === 1
    && omitCjk?.status === 'settled' && omitCjkSettled === 4 && omitCjkSettled !== 1000 && omitCjkSettled !== 16000);

  const omitAsciiId = `usage-omit-ascii-${suffix}`;
  const omitAsciiVectors = await budgetedQbankEmbedding(pool, owner, omitEmbedder, usageCfg)(['a', 'a'], { cacheKey: 'usage-omit-ascii', invocationId: omitAsciiId, mode: 'claimed' });
  const omitAscii = await usageReservation(omitAsciiId);
  const omitAsciiSettled = Number(omitAscii?.settled_micro_cny);
  check('缺用量逐段相加，两段 a 实结 2，不是拼接后的 1 也不是上限', omitAsciiVectors.length === 2
    && omitAscii?.status === 'settled' && omitAsciiSettled === 2 && omitAsciiSettled !== 1 && omitAsciiSettled !== 1000);

  let zeroCalls = 0;
  const zeroEmbedder: Embedder = {
    dim: 512, id: model,
    async embed(texts) { zeroCalls++; return vectorsOf(texts); },
    async embedWithUsage(texts) { zeroCalls++; return { vectors: vectorsOf(texts), inputTokens: 0 }; },
  };
  const zeroId = `usage-zero-${suffix}`;
  const zeroVectors = await budgetedQbankEmbedding(pool, owner, zeroEmbedder, usageCfg)(['中文测试'], { cacheKey: 'usage-zero', invocationId: zeroId, mode: 'claimed' });
  const zeroRow = await usageReservation(zeroId);
  const zeroSettled = zeroRow?.settled_micro_cny;
  check('实量 0 照旧记 0 且状态为 settled，不改走文本估算 4', zeroCalls === 1 && zeroVectors.length === 1
    && zeroRow?.status === 'settled' && zeroSettled !== null && zeroSettled !== undefined && Number(zeroSettled) === 0 && Number(zeroSettled) !== 4);

  let embedOnlyCalls = 0;
  const embedOnly: Embedder = {
    dim: 512, id: model,
    async embed(texts) { embedOnlyCalls++; return vectorsOf(texts); },
  };
  const embedOnlyId = `usage-embed-only-${suffix}`;
  const embedOnlyVectors = await budgetedQbankEmbedding(pool, owner, embedOnly, usageCfg)(['中文测试'], { cacheKey: 'usage-embed-only', invocationId: embedOnlyId, mode: 'claimed' });
  const embedOnlyRow = await usageReservation(embedOnlyId);
  check('只有 embed 时按缺用量估算，中文测试实结 4', embedOnlyCalls === 1 && embedOnlyVectors.length === 1
    && embedOnlyRow?.status === 'settled' && Number(embedOnlyRow?.settled_micro_cny) === 4);

  const clampedId = `usage-clamp-${suffix}`;
  const clampedVectors = await budgetedQbankEmbedding(pool, owner, omitEmbedder, usageCfg)(['中'.repeat(1001)], { cacheKey: 'usage-clamp', invocationId: clampedId, mode: 'claimed' });
  const clamped = await usageReservation(clampedId);
  check('缺用量估算超过上限时先截断再结算，实结 1000 且不是 unknown', clampedVectors.length === 1
    && clamped?.status === 'settled' && clamped?.status !== 'unknown' && Number(clamped?.settled_micro_cny) === 1000);

  let overCalls = 0;
  const overEmbedder: Embedder = {
    dim: 512, id: model,
    async embed(texts) { overCalls++; return vectorsOf(texts); },
    async embedWithUsage(texts) { overCalls++; return { vectors: vectorsOf(texts), inputTokens: 1001 }; },
  };
  const overId = `usage-over-${suffix}`;
  const overCode = await budgetedQbankEmbedding(pool, owner, overEmbedder, usageCfg)(['中文测试'], { cacheKey: 'usage-over', invocationId: overId, mode: 'claimed' })
    .then(() => '')
    .catch((error: { code?: string }) => error?.code ?? '');
  const overRow = await usageReservation(overId);
  const overSettled = overRow?.settled_micro_cny;
  check('大于上限的实量仍拒绝：嵌入一次、原因 external_outcome_unknown、行 unknown、实结为空', overCalls === 1
    && overCode === 'external_outcome_unknown' && overCode !== 'rag_cost_budget_exhausted'
    && overRow?.status === 'unknown' && overRow?.reason_code === 'external_outcome_unknown'
    && (overSettled === null || overSettled === undefined) && overSettled !== 1000 && overSettled !== 4
    && Number(overSettled) !== 1000 && Number(overSettled) !== 4);

  console.log(`\n${failures === 0 ? '✓ RAG 费用运行时集成全部通过' : `✗ ${failures} 项失败`}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(async (error) => { console.error(error); await pool.end().catch(() => undefined); process.exit(1); });
