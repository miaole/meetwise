/**
 * 真 PostgreSQL 费用护栏证明：并发预算 CAS、派发前拒绝、结算差额返还、未知外部结果冻结，以及 app_role 无法改账本。
 */
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, asPrincipal, createPool, loadMigrations, markAiCostDispatched, markAiCostUnknown,
  releaseAiCost, reserveAiCost, runMigrations, settleAiCost,
} from '../src/index.ts';

const pool = createPool();
const owner = `cost-proof-owner-${Date.now()}-${process.pid}`;
const scope = `cost-proof-${Date.now()}-${process.pid}`;
const provider = `proof-provider-${process.pid}`;
const model = `proof-model-${process.pid}`;
const region = `cn-proof-${process.pid}`;
let failures = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const reservation = (idempotencyKey: string, maxInputTokens: number) => asPrincipal(pool, owner, (c) => reserveAiCost(c, {
  scopeId: scope, requestOwner: owner, idempotencyKey,
  provider, model, region, maxInputTokens,
}));

async function main() {
  await assertIsolatedTestTarget(pool);
  // 0033 只依赖 app_role 角色本身；本 proof 不重跑会 DROP 真实数据的 baseline。
  await pool.query("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_role') THEN CREATE ROLE app_role NOLOGIN; END IF; END $$");
  const migDir = fileURLToPath(new URL('../migrations', import.meta.url));
  await runMigrations(pool, loadMigrations(migDir).filter((m) => m.version >= '0033_ai_cost_governance'));
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,'r1',1000000,'https://pricing.invalid/proof',clock_timestamp())`, [provider, model, region],
  );
  await pool.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny) VALUES($1,2000)', [scope]);

  const first = await reservation('r1', 1000);
  const duplicate = await reservation('r1', 1000);
  check('首次预留按整型 micro-CNY 记账；相同幂等键不会二次扣减',
    first.decision === 'reserved' && first.reservedMicroCny === 1000 && duplicate.decision === 'held');
  const dispatched = await asPrincipal(pool, owner, (c) => markAiCostDispatched(c, scope, owner, 'r1'));
  const settled = await asPrincipal(pool, owner, (c) => settleAiCost(c, scope, owner, 'r1', 600));
  const monthAfterSettle = await pool.query('SELECT reserved_micro_cny,settled_micro_cny FROM ai_cost_budget_month WHERE scope_id=$1', [scope]);
  check('派发后按供应商实际 token 结算，未用预留回到月度可用额', dispatched && settled === 600
    && Number(monthAfterSettle.rows[0]?.reserved_micro_cny) === 0 && Number(monthAfterSettle.rows[0]?.settled_micro_cny) === 600);

  const second = await reservation('r2', 1400);
  const over = await reservation('r3', 1);
  check('预算达到上限前在外部调用前拒绝，不产生 dispatch 状态', second.decision === 'reserved' && over.decision === 'budget_exhausted');
  const released = await asPrincipal(pool, owner, (c) => releaseAiCost(c, scope, owner, 'r2', 'local_preflight_rejected'));
  const afterRelease = await pool.query('SELECT reserved_micro_cny,settled_micro_cny FROM ai_cost_budget_month WHERE scope_id=$1', [scope]);
  check('未派发预留可释放；已结算额保持不可回退', released && Number(afterRelease.rows[0]?.reserved_micro_cny) === 0 && Number(afterRelease.rows[0]?.settled_micro_cny) === 600);

  const unknownReserve = await reservation('r4', 1000);
  await asPrincipal(pool, owner, (c) => markAiCostDispatched(c, scope, owner, 'r4'));
  const unknownMarked = await asPrincipal(pool, owner, (c) => markAiCostUnknown(c, scope, owner, 'r4', 'external_outcome_unknown'));
  const unknownRetry = await reservation('r4', 1000);
  const unknownRelease = await asPrincipal(pool, owner, (c) => releaseAiCost(c, scope, owner, 'r4', 'caller_claims_failure'));
  check('派发后响应丢失冻结预算并拒绝重发/自动释放，避免重复收费', unknownReserve.decision === 'reserved' && unknownMarked
    && unknownRetry.decision === 'unknown' && !unknownRelease);

  const directDenied = await asPrincipal(pool, owner, (c) => c.query('SELECT * FROM ai_cost_budget_month')).then(() => false).catch(() => true);
  const impersonationDenied = await asPrincipal(pool, 'another-principal', (c) => reserveAiCost(c, {
    scopeId: scope, requestOwner: owner, idempotencyKey: 'impersonation', provider, model, region, maxInputTokens: 1,
  })).then(() => false).catch((error) => (error as any)?.code === '42501');
  check('app_role 不能直接读取或篡改总预算；费用函数也拒绝伪造他人 owner', directDenied && impersonationDenied);

  const raceScope = `${scope}-race`;
  await pool.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny) VALUES($1,2000)', [raceScope]);
  const raced = await Promise.all(Array.from({ length: 5 }, (_, i) => asPrincipal(pool, owner, (c) => reserveAiCost(c, {
    scopeId: raceScope, requestOwner: owner, idempotencyKey: `race-${i}`,
    provider, model, region, maxInputTokens: 1000,
  }))));
  const reservedCount = raced.filter((r) => r.decision === 'reserved').length;
  const raceMonth = await pool.query('SELECT reserved_micro_cny,settled_micro_cny FROM ai_cost_budget_month WHERE scope_id=$1', [raceScope]);
  check('5 个并发预留竞争 2000 micro-CNY，只有 2 个成功且账本绝不超额', reservedCount === 2
    && Number(raceMonth.rows[0]?.reserved_micro_cny) === 2000 && Number(raceMonth.rows[0]?.settled_micro_cny) === 0);

  console.log(`\n${failures === 0 ? '✓ AI 费用预算状态机全部通过' : `✗ ${failures} 项失败`}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(async (error) => { console.error(error); await pool.end().catch(() => undefined); process.exit(1); });
