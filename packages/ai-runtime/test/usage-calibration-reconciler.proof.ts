/**
 * usage-calibration-reconciler.proof — MODEL-OP-00 收尾承重证明：P1 全 outcome estimate 落库 + P2 异步
 * reconciler 接线 + P3 因子应用（读面双校验 fail-closed）。纯 fake transport + 隔离 PostgreSQL。
 *
 * 承重断言：
 *  P1：ai_model_invocation.estimate_input_tokens 在 claim 时落库，覆盖 success / schema-失败 / business-失败 /
 *      unknown 全 outcome（修掉 persistTrace 只在 !error 落 estimate 的偏置缺口）。
 *  P2：域级 reconcileUsageCalibration 读 estimate↔provider usage 配对 → 分组 reconcileUsage → 版本化因子 +
 *      观测日志落库；低估显式 under_estimated + model_estimate_calibration_underestimated_total 告警（绝不静默）。
 *  P3：resolveLatestCalibratedFactor 读最新因子 → toCalibratedFactor 双校验 → 合法返回 CalibratedFactor，
 *      缺因子/伪造版本/未知 estimator → null（fail-closed 退回未精化）。
 *
 * 七类矩阵：
 *  ①正常 全 outcome estimate + 配对不再偏置；②异常 未知 estimator / 非法因子 fail-closed；
 *  ③特殊 低估显式落库 + 告警不静默；④逃逸 跨 owner 读=0 / 伪造版本拒 / 跨 service 不串扰；
 *  ⑤并发 同批幂等单份 / 因子内容寻址不覆盖；⑥复杂 因子只放大(≥已观测 usage)、单调不减、缺因子退回未精化；
 *  ⑦刁钻 空历史 / 零观测(无信号)/ 畸形版本 / 因子版本内容变则版本变。
 *
 * 安全性：assertIsolatedTestTarget 证明容器 nonce 后才触碰任何表。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { assertIsolatedTestTarget, asPrincipal, createPool } from '@meetwise/db';
import {
  invoke, createMetrics, setMetrics, getMetrics, METRIC,
  reconcileUsageCalibration, resolveLatestCalibratedFactor, toCalibratedFactor,
  refineEstimate,
  type Model, type ModelCostPolicy, type ModelResult,
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `recon-${suffix}`;
const OWNER2 = `recon-other-${suffix}`;
const SCOPE = `scope-recon-${suffix}`;
const SERVICE = 'svc-recon';
const SERVICE_B = 'svc-recon-b';
const MODEL = 'm-recon';

const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: 'p-recon', model: MODEL, region: 'cn-proof', priceRevision: 'recon-r1',
  maxInputTokens: 1000, maxOutputTokens: 500,
};
const Schema = z.object({ answer: z.string().min(1) });

interface Scenario { planEstimate: number; execute: ModelResult }
function fakeModel(digest: string, scenario: Scenario): Model {
  return {
    requestDigest: digest,
    call: async () => scenario.execute,
    prepare: () => ({
      ready: true as const,
      cost: policy,
      execute: async () => scenario.execute,
      estimateInputTokens: scenario.planEstimate,
    }),
  };
}

async function runInvocation(key: string, service: string, scenario: Scenario, businessValidate: (v: unknown) => string | null = () => null) {
  return invoke({
    idempotencyKey: key, service, schema: Schema, businessValidate,
    model: fakeModel(sha256(`${service}:${key}`), scenario),
  }, pool, OWNER);
}

async function invocationRow(key: string) {
  const r = await pool.query(
    `SELECT status, estimate_input_tokens AS e, input_tokens AS i, output_tokens AS o, error_code AS err
       FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`,
    [OWNER, key],
  );
  return r.rows[0] ?? null;
}
async function observationCount(batch: string, owner = OWNER) {
  const r = await pool.query(
    `SELECT count(*)::int n FROM ai_usage_calibration_observation WHERE owner_user_id=$1 AND batch=$2`, [owner, batch]);
  return Number(r.rows[0]?.n ?? 0);
}
async function factorCount(owner = OWNER) {
  const r = await pool.query(`SELECT count(*)::int n FROM ai_usage_calibration WHERE owner_user_id=$1`, [owner]);
  return Number(r.rows[0]?.n ?? 0);
}
const metricCalibrationUnder = () => {
  const m = getMetrics().render().match(/model_estimate_calibration_underestimated_total\s+(\d+)/);
  return Number(m?.[1] ?? 0);
};

async function main() {
  await assertIsolatedTestTarget(pool);

  await pool.query(sql('../../db/sql/01_schema.sql'));
  for (const f of ['0033_ai_cost_governance.sql', '0035_ai_cost_principal_scope.sql', '0036_ai_text_cost_governance.sql', '0037_ai_model_invocation_durable_claim.sql', '0056_model_invocation_reconcile.sql', '0057_model_invocation_cost_scope.sql', '0083_ai_text_cost_price_revision_binding.sql', '0085_ai_model_logical_node_dispatch_slot.sql', '0088_ai_model_invocation_controlled_state_machine.sql', '0119_usage_reconciliation_wiring.sql', '0130_model_invocation_same_key_claim_join.sql']) {
    await pool.query(sql(`../../db/migrations/${f}`));
  }
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES('p-recon','m-recon','cn-proof','recon-r1',1000000,2000000,'https://example.test/usage-calibration-reconciler',clock_timestamp())`,
  );
  await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)`, [SCOPE]);
  setMetrics(createMetrics());

  // ==========================================================================
  // ① 正常：全 outcome estimate 落库 + 配对不再偏置
  // ==========================================================================
  const successKey = `recon-ok:${suffix}`;
  const schemaFailKey = `recon-schema:${suffix}`;
  const businessFailKey = `recon-biz:${suffix}`;
  const unknownKey = `recon-unknown:${suffix}`;

  const okResult = await runInvocation(successKey, SERVICE, { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 50, outputTokens: 20 } } });
  const schemaResult = await runInvocation(schemaFailKey, SERVICE, { planEstimate: 100, execute: { ok: true, raw: { answer: 42 }, usage: { inputTokens: 150, outputTokens: 20 } } });
  const bizResult = await runInvocation(businessFailKey, SERVICE, { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 60, outputTokens: 20 } } }, () => 'business');
  const unknownResult = await runInvocation(unknownKey, SERVICE, { planEstimate: 100, execute: { ok: false, kind: 'transient', externalOutcome: 'unknown' } });

  const okRow = await invocationRow(successKey);
  const schemaRow = await invocationRow(schemaFailKey);
  const bizRow = await invocationRow(businessFailKey);
  const unknownRow = await invocationRow(unknownKey);

  A('① 成功：estimate_input_tokens 在 claim 落库(100)且 input_tokens=50 配对', 'value' in okResult && okRow?.e === 100 && okRow?.i === 50 && okRow?.status === 'succeeded');
  A('① schema-失败：estimate 落库(100)且 usage 仍 settle(input=150)，不再偏置', 'error' in schemaResult && schemaResult.error === 'schema_validation_failed' && schemaRow?.e === 100 && schemaRow?.i === 150 && schemaRow?.status === 'failed');
  A('① business-失败：estimate 落库(100)且 usage 仍 settle(input=60)', 'error' in bizResult && bizResult.error === 'business:business' && bizRow?.e === 100 && bizRow?.i === 60 && bizRow?.status === 'failed');
  A('① unknown：estimate 落库(100)、无 usage(input NULL)', 'error' in unknownResult && unknownResult.error === 'external_outcome_unknown' && unknownRow?.e === 100 && unknownRow?.i === null && unknownRow?.status === 'unknown');

  // ==========================================================================
  // ②③ P2：reconcile → 分组因子 + 观测日志 + 低估显式 + 告警不静默
  // ==========================================================================
  const batch1 = `batch1-${suffix}`;
  const r1 = await reconcileUsageCalibration(pool, { owner: OWNER, batch: batch1 });
  const g1 = r1.ok ? r1.groups.find((g) => g.service === SERVICE && g.model === MODEL) : undefined;

  A('② P2 reconcile ok，且只 1 组(unknown 无 usage 不配对)', r1.ok && r1.groups.length === 1);
  A('② P2 组 observationCount=3(成功+schema+business；unknown 排除)', g1?.observationCount === 3);
  A('② P2 组 informativeCount=3(全部 providerInput≥1)', g1?.informativeCount === 3);
  A('② P2 rawMaxRatio=1.5、factor=1.65(1.5×1.1)、hasUnderEstimate', g1?.factor != null && Math.abs(g1.factor.rawMaxRatio - 1.5) < 1e-9 && Math.abs(g1.factor.factor - 1.65) < 1e-9 && g1.factor.hasUnderEstimate === true);
  A('② P2 factorVersion 形态 `utf8-bytes-v1.calibration-v1.<sha256>`', g1?.factor != null && /^utf8-bytes-v1\.calibration-v1\.[0-9a-f]{64}$/.test(g1.factor.factorVersion));
  A('② P2 观测日志落库 3 条(全历史)，因子落库 1 条', await observationCount(batch1) === 3 && await factorCount() === 1);

  const underRows = await pool.query(
    `SELECT reconciliation_status, provider_input_tokens FROM ai_usage_calibration_observation WHERE owner_user_id=$1 AND batch=$2 ORDER BY invocation_idempotency_key`,
    [OWNER, batch1],
  );
  const underStatuses = underRows.rows.map((r) => r.reconciliation_status);
  A('③ 低估样本显式 under_estimated(绝不静默)；其余 within_estimate', underStatuses.filter((s) => s === 'under_estimated').length === 1 && underStatuses.filter((s) => s === 'within_estimate').length === 2);
  A('③ model_estimate_calibration_underestimated_total 计数=1', metricCalibrationUnder() === 1);

  // ==========================================================================
  // ② 异常：未知 estimator / 非法因子 fail-closed
  // ==========================================================================
  const badEstimator = await reconcileUsageCalibration(pool, { owner: OWNER, batch: `b-bad-${suffix}`, estimator: 'bogus-v9' as never });
  A('② 未知 estimator → fail-closed（error，不落任何观测/因子）', badEstimator.ok === false && badEstimator.error === 'usage_estimator_unknown');
  A('② 非法因子：伪造版本后缀(非 64hex) → toCalibratedFactor null', toCalibratedFactor({ estimator: 'utf8-bytes-v1', factorVersion: 'utf8-bytes-v1.calibration-v1.' + 'z'.repeat(64), factor: 1.65, rawMaxRatio: 1.5, safetyMargin: 0.1, observationCount: 3, hasUnderEstimate: true }) === null);
  A('② 非法因子：版本前缀 algo 不符 → null', toCalibratedFactor({ estimator: 'utf8-bytes-v1', factorVersion: 'utf8-bytes-v1.other-v1.' + 'a'.repeat(64), factor: 1.65, rawMaxRatio: 1.5, safetyMargin: 0.1, observationCount: 3, hasUnderEstimate: false }) === null);
  A('② 非法因子：未知 estimator → null', toCalibratedFactor({ estimator: 'nope' as never, factorVersion: 'utf8-bytes-v1.calibration-v1.' + 'a'.repeat(64), factor: 1.65, rawMaxRatio: 1.5, safetyMargin: 0.1, observationCount: 3, hasUnderEstimate: false }) === null);
  A('② 非法因子：factor<=0 / observationCount<1 → null', toCalibratedFactor({ estimator: 'utf8-bytes-v1', factorVersion: 'utf8-bytes-v1.calibration-v1.' + 'a'.repeat(64), factor: 0, rawMaxRatio: 1.5, safetyMargin: 0.1, observationCount: 3, hasUnderEstimate: false }) === null && toCalibratedFactor({ estimator: 'utf8-bytes-v1', factorVersion: 'utf8-bytes-v1.calibration-v1.' + 'a'.repeat(64), factor: 1.65, rawMaxRatio: 1.5, safetyMargin: 0.1, observationCount: 0, hasUnderEstimate: false }) === null);

  // ==========================================================================
  // ④ 逃逸：跨 owner 读=0 / 跨 service 不串扰 / 未知 (service,model) 无因子
  // ==========================================================================
  A('④ 跨 owner 读=0（RLS 隔离）', await observationCount(batch1, OWNER2) === 0 && await factorCount(OWNER2) === 0);
  const noServiceFactor = await asPrincipal(pool, OWNER, (c) => resolveLatestCalibratedFactor(c, OWNER, 'no-such-service', MODEL));
  A('④ 未知 (service,model) → resolveLatestCalibratedFactor null（不串扰）', noServiceFactor === null);

  // 第二组（同 model 不同 service）→ 独立因子，证明分组不串扰。
  const groupBKey = `recon-b:${suffix}`;
  await runInvocation(groupBKey, SERVICE_B, { planEstimate: 200, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 40, outputTokens: 10 } } });
  const rB = await reconcileUsageCalibration(pool, { owner: OWNER, batch: `batch-b-${suffix}` });
  const gB = rB.ok ? rB.groups.find((g) => g.service === SERVICE_B) : undefined;
  const factorA = await asPrincipal(pool, OWNER, (c) => resolveLatestCalibratedFactor(c, OWNER, SERVICE, MODEL));
  const factorB = await asPrincipal(pool, OWNER, (c) => resolveLatestCalibratedFactor(c, OWNER, SERVICE_B, MODEL));
  A('④ 跨 service 分组独立：factorVersion 互异、各自读回各自', gB?.factor != null && factorA != null && factorB != null && factorA.factorVersion !== factorB.factorVersion && factorB.factorVersion === gB!.factor!.factorVersion);

  // ==========================================================================
  // ⑤ 并发：同批幂等单份 / 因子内容寻址不覆盖
  // ==========================================================================
  const idemBatch = `batch-idem-${suffix}`;
  const i1 = await reconcileUsageCalibration(pool, { owner: OWNER, batch: idemBatch });
  const idemObsAfterFirst = await observationCount(idemBatch);
  const idemFactorAfterFirst = await factorCount();
  const i2 = await reconcileUsageCalibration(pool, { owner: OWNER, batch: idemBatch });
  A('⑤ 同批重跑幂等：观测/因子条数不变（ON CONFLICT DO NOTHING）', i1.ok && i2.ok && idemObsAfterFirst === 4 && (await observationCount(idemBatch)) === idemObsAfterFirst && (await factorCount()) === idemFactorAfterFirst);

  const concBatch = `batch-conc-${suffix}`;
  const [c1, c2] = await Promise.all([
    reconcileUsageCalibration(pool, { owner: OWNER, batch: concBatch }),
    reconcileUsageCalibration(pool, { owner: OWNER, batch: concBatch }),
  ]);
  const concObs = await observationCount(concBatch);
  // 此刻全历史配对：SERVICE 3 条(success/schema/business) + SERVICE_B 1 条 → 并发批应恰好 4 条、不重复。
  A('⑤ 并发同批双写：两事务都成功、观测不重复(全历史 4 条)', c1.ok && c2.ok && concObs === 4);

  // ==========================================================================
  // ⑥ 复杂：因子只放大(≥已观测 usage)、单调不减、缺因子退回未精化
  // ==========================================================================
  const refined = factorA != null ? refineEstimate(100, factorA) : 0;
  A('⑥ refineEstimate 精化后 ≥ 已观测 provider usage(150)', refined >= 150);
  // 追加一条更高比率观测(provider=200/estimate=100=2.0) → 因子应只升不降。
  const higherKey = `recon-higher:${suffix}`;
  await runInvocation(higherKey, SERVICE, { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 200, outputTokens: 20 } } });
  const rHigher = await reconcileUsageCalibration(pool, { owner: OWNER, batch: `batch-higher-${suffix}` });
  const gHigher = rHigher.ok ? rHigher.groups.find((g) => g.service === SERVICE) : undefined;
  A('⑥ 因子单调不减：追加更高比率后 factor(≈2.2) > 旧(≈1.65)', gHigher?.factor != null && factorA != null && gHigher.factor.factor > factorA.factor && Math.abs(gHigher.factor.factor - 2.2) < 1e-9);
  A('⑥ 缺因子 (空组) → resolveLatestCalibratedFactor null（fail-closed 退回未精化）', (await asPrincipal(pool, OWNER, (c) => resolveLatestCalibratedFactor(c, OWNER, 'empty-svc', MODEL))) === null);

  // ==========================================================================
  // ⑦ 刁钻：空历史 / 零观测(无信号) / 因子版本内容变则版本变
  // ==========================================================================
  const rEmpty = await reconcileUsageCalibration(pool, { owner: OWNER2, batch: `empty-${suffix}` });
  A('⑦ 空历史 owner → ok 且 groups=[]，不落任何观测/因子', rEmpty.ok && rEmpty.groups.length === 0 && (await observationCount(`empty-${suffix}`, OWNER2)) === 0 && (await factorCount(OWNER2)) === 0);
  // 零观测：providerInput=0（无校准信号）→ factor=null 但观测仍落库。
  const zeroKey = `recon-zero:${suffix}`;
  const zeroBatch = `batch-zero-${suffix}`;
  await runInvocation(zeroKey, 'svc-zero', { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 0, outputTokens: 0 } } });
  const rZero = await reconcileUsageCalibration(pool, { owner: OWNER, batch: zeroBatch });
  const gZero = rZero.ok ? rZero.groups.find((g) => g.service === 'svc-zero') : undefined;
  A('⑦ 零观测(provider=0)：informativeCount=0、factor=null（无校准信号）', gZero?.observationCount === 1 && gZero?.informativeCount === 0 && gZero?.factor === null);
  const zeroObs = await pool.query(
    `SELECT reconciliation_status FROM ai_usage_calibration_observation WHERE owner_user_id=$1 AND service='svc-zero' AND batch=$2`,
    [OWNER, zeroBatch],
  );
  A('⑦ 零观测 provider=0 仍显式 within_estimate 落库 1 条', zeroObs.rowCount === 1 && zeroObs.rows[0]?.reconciliation_status === 'within_estimate');
  // 因子版本内容变则版本变：同内容同版本(幂等已证)，不同内容不同版本(④ 已证 factorA!==factorB)。

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ usage 对账校准 reconciler 全七类矩阵通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'usage_calibration_reconciler_proof_failed');
  await pool.end();
  process.exit(1);
});
