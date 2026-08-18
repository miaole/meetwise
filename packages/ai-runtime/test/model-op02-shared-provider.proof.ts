/**
 * MODEL-OP-02 — 共享 provider 准入 / 费用账本 / 并发 + 断路器 的真 PG 隔离证明。
 *
 * 目标：证明「不再让各适配器各自限流」这一单一权威成立——同一分区的准入决策、跨副本
 * 并发槽、持久断路器状态机、逐调用钱账本，全部由迁移 0120 的 SECURITY DEFINER 过程
 * （ai_model_admission_acquire_scoped / ai_model_admission_record_scoped）裁决，
 * 应用侧不本地持有并发/断路器状态。
 *
 * 运行方式：经 scripts/run-e2e-isolated.mjs 的 `model-op02:prove` gate（一次性 pgvector
 * 容器 + 全量迁移）。不 require 任何真实 provider；确定性 stub/seam。
 */
import { z } from 'zod';
import {
  asPrincipal, assertIsolatedTestTarget, createPool, type ModelAdmissionPartition,
} from '@meetwise/db';
import {
  invoke, admitSharedModelOperation, recordSharedModelOperation, resolveModelAdmissionPartition,
  type Model, type ModelCostPolicy,
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const OWNER = 'model-op02-owner';
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const SCOPE = `op02-scope-${suffix}`;
const PROVIDER = `proof-provider-${suffix}`;
const MODEL = `proof-model-${suffix}`;
const REGION = 'cn-proof';
const REVISION = 'proof-r1';
const Schema = z.object({ answer: z.string().min(1) });

/** 计费策略（provider/model/region 进 ai_cost_price_book；scope 进 ai_cost_budget_policy）。 */
const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: PROVIDER, model: MODEL, region: REGION, priceRevision: REVISION,
  maxInputTokens: 1000, maxOutputTokens: 500,
};

/** 从 registry 的 wired operation 派生准入分区（服务器派生，绝不 caller 供）。 */
const scorerPartition = resolveModelAdmissionPartition({ operation: { id: 'interview.answer-scoring.v1', businessRevision: 'op02' } })!;

/** 计费 Model：prepare 返回 cost policy；call 返回脚本化结果并计数（确定性 stub）。 */
function billable(result: ReturnType<Model['call']>, calls: { n: number }): Model {
  return {
    requestDigest: 'e'.repeat(64),
    async call() { calls.n++; return result; },
    prepare() { return { ready: true as const, execute: () => this.call(1), cost: policy }; },
  };
}

/** 直接走共享权威 acquire（承认）后立即以 no_signal 释放槽，避免污染并发槽计数。 */
async function admitAndRelease(partition: ModelAdmissionPartition, opts: { scopeId?: string; idempotencyKey: string }) {
  const a = await admitSharedModelOperation(pool, OWNER, { partition, scopeId: opts.scopeId, idempotencyKey: opts.idempotencyKey });
  if (a.ok) await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, a.lease, 'no_signal'));
  return a;
}

async function main() {
  await assertIsolatedTestTarget(pool);

  // ── 预置：计费价格表 + 项目预算（billed invoke 用）。 ──────────────────────────
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,$4,1000000,2000000,'https://example.test/op02',clock_timestamp())`,
    [PROVIDER, MODEL, REGION, REVISION],
  );
  await pool.query(
    `INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1000000,true)`, [SCOPE],
  );

  // ── 测试 1：准入 fail-closed（7 wired allowed / 8 unwired blocked / 未知 unknown）+ 种子静态不变量。 ──
  const policyRows = await pool.query(
    `SELECT admission_status, count(*)::int n FROM ai_model_admission_policy GROUP BY admission_status ORDER BY admission_status`,
  );
  const allowedSeed = Number(policyRows.rows.find((r) => r.admission_status === 'allowed')?.n ?? 0);
  const blockedSeed = Number(policyRows.rows.find((r) => r.admission_status === 'blocked')?.n ?? 0);
  A('迁移种子：7 个 wired=allowed + 8 个 unwired=blocked（与 registry 逐条对齐）', allowedSeed === 7 && blockedSeed === 8);

  // 7 个 wired operation 的分区都可从 registry 派生（resolve 返回分区）。
  const wiredIds = [
    'interview.competency-planning.v1', 'interview.question-generation.v1', 'interview.answer-scoring.v1',
    'interview.quiz-generation.v1', 'resume.diagnosis.v1', 'report.narrative.v1', 'resume.ocr.v1',
  ];
  const wiredPartitions = wiredIds.map((id) => resolveModelAdmissionPartition({ operation: { id, businessRevision: 'op02' } }));
  A('7 个 wired operation 全部解析出准入分区（无 undefined）', wiredPartitions.every((p) => p !== undefined));

  // 直接对 DB 层调用：未知 operation 无行 → operation_unknown；blocked 行 → operation_blocked。
  const unknownAcquire = await admitSharedModelOperation(pool, OWNER, {
    partition: { providerAccount: 'dashscope-main', region: 'cn-beijing', modelOrRecipe: 'planner', operationId: 'proof.unknown.v1' },
    idempotencyKey: 'op02:unknown-op',
  });
  A('未知 operation（无策略行）→ operation_unknown（fail-closed）', unknownAcquire.ok === false && unknownAcquire.error === 'model_admission_operation_unknown');
  const blockedAcquire = await admitSharedModelOperation(pool, OWNER, {
    partition: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'rerank', operationId: 'qbank.rerank.v1' },
    idempotencyKey: 'op02:blocked-op',
  });
  A('未接线 native operation（blocked 行）→ operation_blocked（fail-closed）', blockedAcquire.ok === false && blockedAcquire.error === 'model_admission_operation_blocked');

  // ── 测试 2：项目（tenant 预算 scope）准入。 ─────────────────────────────────────
  const scopedAdmitted = await admitAndRelease(scorerPartition, { scopeId: SCOPE, idempotencyKey: 'op02:proj-admitted' });
  A('billed scope 有 enabled 预算 → admitted', scopedAdmitted.ok === true);
  const scopedMissing = await admitSharedModelOperation(pool, OWNER, { partition: scorerPartition, scopeId: `op02-missing-${suffix}`, idempotencyKey: 'op02:proj-missing' });
  A('billed scope 无预算策略 → project_missing（fail-closed）', scopedMissing.ok === false && scopedMissing.error === 'model_admission_project_missing');
  await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1000000,false)`, [`op02-disabled-${suffix}`]);
  const scopedDisabled = await admitSharedModelOperation(pool, OWNER, { partition: scorerPartition, scopeId: `op02-disabled-${suffix}`, idempotencyKey: 'op02:proj-disabled' });
  A('billed scope 预算 disabled → project_disabled（fail-closed）', scopedDisabled.ok === false && scopedDisabled.error === 'model_admission_project_disabled');
  const unbilled = await admitAndRelease(scorerPartition, { idempotencyKey: 'op02:unbilled' });
  A('unbilled（无 scope）→ 跳过项目检查仍 admitted', unbilled.ok === true);

  // ── 测试 3：断路器状态机（closed→open→half_open→closed；fail-closed）。 ─────────
  // 专用分区（阈值 2 / 冷却 60s）：2 次 failure → open；open 未冷却 → breaker_open。
  const breakerPartition = { providerAccount: PROVIDER, region: REGION, modelOrRecipe: 'proof-breaker', operationId: 'proof.breaker.v1' };
  await pool.query(
    `INSERT INTO ai_model_admission_policy(provider_account,region,model_or_recipe,operation_id,admission_status,meter,max_concurrency,breaker_threshold,breaker_cooldown_ms)
     VALUES($1,$2,$3,$4,'allowed','text-tokens',2,2,60000) ON CONFLICT (provider_account,region,model_or_recipe,operation_id) DO UPDATE SET breaker_threshold=2, breaker_cooldown_ms=60000, max_concurrency=2`,
    [breakerPartition.providerAccount, breakerPartition.region, breakerPartition.modelOrRecipe, breakerPartition.operationId],
  );
  // 清干净该分区历史状态（隔离容器每次全新，但显式清理保证可重跑）。
  await pool.query(`DELETE FROM ai_model_breaker_state WHERE operation_id='proof.breaker.v1'`);
  await pool.query(`DELETE FROM ai_model_concurrency_lease WHERE operation_id='proof.breaker.v1'`);

  const trip = async (key: string) => {
    const a = await admitSharedModelOperation(pool, OWNER, { partition: breakerPartition, idempotencyKey: key });
    if (a.ok) await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, a.lease, 'failure'));
    return a;
  };
  await trip('op02:break:f1');
  await trip('op02:break:f2');
  const openRow = await pool.query(`SELECT phase,consecutive_failures FROM ai_model_breaker_state WHERE operation_id='proof.breaker.v1'`);
  A('阈值 2 次 failure → open（显式 enum 非布尔汤）', openRow.rows[0]?.phase === 'open' && Number(openRow.rows[0]?.consecutive_failures) === 2);
  const openAcquire = await admitSharedModelOperation(pool, OWNER, { partition: breakerPartition, idempotencyKey: 'op02:break:open' });
  A('open 未冷却 → breaker_open（确定性拒绝，零外呼）', openAcquire.ok === false && openAcquire.error === 'model_circuit_open');
  // 强制冷却到期：把 cooldown 置 0 → 下次 acquire 进入 half_open。
  await pool.query(`UPDATE ai_model_admission_policy SET breaker_cooldown_ms=0 WHERE operation_id='proof.breaker.v1'`);
  const halfOpen = await admitSharedModelOperation(pool, OWNER, { partition: breakerPartition, idempotencyKey: 'op02:break:half' });
  A('冷却到期 → half_open 单探针 acquired（probe 获取成功）', halfOpen.ok === true);
  const halfOpenRow = await pool.query(`SELECT phase FROM ai_model_breaker_state WHERE operation_id='proof.breaker.v1'`);
  A('half_open 探针已持久化到 breaker 行', halfOpenRow.rows[0]?.phase === 'half_open');
  const halfBusy = await admitSharedModelOperation(pool, OWNER, { partition: breakerPartition, idempotencyKey: 'op02:break:busy' });
  A('half_open 探针被占 → breaker_half_open_busy（单探针，不批量重试）', halfBusy.ok === false && halfBusy.error === 'model_circuit_half_open');
  // 探针 success → closed 复位。
  if (halfOpen.ok) {
    await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, halfOpen.lease, 'success'));
  }
  const closedRow = await pool.query(`SELECT phase,consecutive_failures FROM ai_model_breaker_state WHERE operation_id='proof.breaker.v1'`);
  A('探针 success → closed（failure 复位）', closedRow.rows[0]?.phase === 'closed' && Number(closedRow.rows[0]?.consecutive_failures) === 0);
  // 再 trip 到 open，冷却 → half_open，探针 failure → 重新 open。
  await pool.query(`UPDATE ai_model_admission_policy SET breaker_threshold=2, breaker_cooldown_ms=60000 WHERE operation_id='proof.breaker.v1'`);
  await trip('op02:break:g1');
  await trip('op02:break:g2');
  await pool.query(`UPDATE ai_model_admission_policy SET breaker_cooldown_ms=0 WHERE operation_id='proof.breaker.v1'`);
  const halfOpen2 = await admitSharedModelOperation(pool, OWNER, { partition: breakerPartition, idempotencyKey: 'op02:break:half2' });
  if (halfOpen2.ok) {
    await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, halfOpen2.lease, 'failure'));
  }
  const reOpenRow = await pool.query(`SELECT phase FROM ai_model_breaker_state WHERE operation_id='proof.breaker.v1'`);
  A('探针 failure → 重新 open（不吞掉失败）', reOpenRow.rows[0]?.phase === 'open');

  // ── 测试 4：并发租约（max_concurrency 内并发 / 满额拒绝 / release 复用 / 过期自愈）。 ──
  const concPartition = { providerAccount: PROVIDER, region: REGION, modelOrRecipe: 'proof-concurrency', operationId: 'proof.concurrency.v1' };
  await pool.query(
    `INSERT INTO ai_model_admission_policy(provider_account,region,model_or_recipe,operation_id,admission_status,meter,max_concurrency,breaker_threshold,breaker_cooldown_ms)
     VALUES($1,$2,$3,$4,'allowed','text-tokens',2,10,30000) ON CONFLICT (provider_account,region,model_or_recipe,operation_id) DO UPDATE SET max_concurrency=2`,
    [concPartition.providerAccount, concPartition.region, concPartition.modelOrRecipe, concPartition.operationId],
  );
  await pool.query(`DELETE FROM ai_model_concurrency_lease WHERE operation_id='proof.concurrency.v1'`);
  const conc1 = await admitSharedModelOperation(pool, OWNER, { partition: concPartition, idempotencyKey: 'op02:conc:1' });
  const conc2 = await admitSharedModelOperation(pool, OWNER, { partition: concPartition, idempotencyKey: 'op02:conc:2' });
  A('max_concurrency=2 内两个并发 acquire 均 admitted（槽 0/1）', conc1.ok === true && conc2.ok === true);
  const conc3 = await admitSharedModelOperation(pool, OWNER, { partition: concPartition, idempotencyKey: 'op02:conc:3' });
  A('满额第三个 acquire → concurrency_exhausted（fail-closed）', conc3.ok === false && conc3.error === 'model_concurrency_exhausted');
  // 释放 conc1 的槽 → 第三个 acquire 复用。
  if (conc1.ok) await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, conc1.lease, 'no_signal'));
  const conc4 = await admitSharedModelOperation(pool, OWNER, { partition: concPartition, idempotencyKey: 'op02:conc:4' });
  A('release 后槽可复用（第 4 个 acquire admitted）', conc4.ok === true);
  // 过期槽自愈：把 conc2 槽 lease_expires_at 拨回过去 → 新 acquire 直接复用，不泄漏。
  if (conc2.ok) {
    await pool.query(
      `UPDATE ai_model_concurrency_lease SET lease_expires_at=clock_timestamp()-interval '1 second'
       WHERE operation_id='proof.concurrency.v1' AND slot_index=$1`, [conc2.lease.slotIndex],
    );
  }
  const conc5 = await admitSharedModelOperation(pool, OWNER, { partition: concPartition, idempotencyKey: 'op02:conc:5' });
  A('过期槽自愈（lease 过期后可被新 acquire 复用）', conc5.ok === true);

  // ── 测试 5：费用账本（钱记录；settled 真实金额 + 版本化价格策略 + partition；幂等）。 ──
  // 直接 record：rejected（0 扣费）+ unknown（待对账）。
  const feeAdmit = await admitSharedModelOperation(pool, OWNER, { partition: scorerPartition, idempotencyKey: 'op02:fee:rejected' });
  if (feeAdmit.ok) {
    await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, feeAdmit.lease, 'no_signal', {
      scopeId: SCOPE, priceRevision: REVISION, inputTokens: 0, outputTokens: 0, settledMicroCny: 0, feeStatus: 'rejected', reasonCode: 'proof_rejected',
    }));
  }
  const rejectedRow = await pool.query(`SELECT fee_status,settled_micro_cny,price_revision,provider_account,region,model_or_recipe,operation_id FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key='op02:fee:rejected'`, [OWNER]);
  A('费用账本 rejected：0 扣费 + 版本化价格策略 + 四字段 partition', rejectedRow.rows[0]?.fee_status === 'rejected'
    && Number(rejectedRow.rows[0]?.settled_micro_cny) === 0 && rejectedRow.rows[0]?.price_revision === REVISION
    && rejectedRow.rows[0]?.provider_account === 'dashscope-main' && rejectedRow.rows[0]?.region === 'cn-beijing'
    && rejectedRow.rows[0]?.model_or_recipe === 'scorer' && rejectedRow.rows[0]?.operation_id === 'interview.answer-scoring.v1');
  // 幂等：同 owner+key 再 record 一次不新增行（ON CONFLICT DO NOTHING）。
  const feeAdmitAgain = await admitSharedModelOperation(pool, OWNER, { partition: scorerPartition, idempotencyKey: 'op02:fee:rejected' });
  if (feeAdmitAgain.ok) {
    await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, feeAdmitAgain.lease, 'no_signal', {
      scopeId: SCOPE, priceRevision: REVISION, inputTokens: 0, outputTokens: 0, settledMicroCny: 0, feeStatus: 'rejected', reasonCode: 'proof_rejected_again',
    }));
  }
  const rejectedCount = await pool.query(`SELECT count(*)::int n FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key='op02:fee:rejected'`, [OWNER]);
  A('费用账本幂等：同 owner+key 只落一行（金额/策略不漂移）', Number(rejectedCount.rows[0]?.n) === 1);

  // ── 测试 6：invoke 端到端（admission→breaker→并发→settle→fee ledger；replay 幂等）。 ──
  const goodCalls = { n: 0 };
  const good = billable(Promise.resolve({ ok: true as const, raw: { answer: 'ok' }, usage: { inputTokens: 100, outputTokens: 200 } }), goodCalls);
  const goodResult = await invoke({
    idempotencyKey: 'op02:settle', operation: { id: 'interview.answer-scoring.v1', businessRevision: 'op02:settle' },
    schema: Schema, businessValidate: () => null, model: good,
  }, pool, OWNER);
  const settleFee = await pool.query(
    `SELECT fee_status,settled_micro_cny,price_revision,input_tokens,output_tokens FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key='op02:settle'`, [OWNER],
  );
  A('invoke 成功 → fee ledger settled（真实扣费 500 micro_cny + 双向 token + 版本化策略）',
    'value' in goodResult && goodCalls.n === 1
      && settleFee.rows[0]?.fee_status === 'settled' && Number(settleFee.rows[0]?.settled_micro_cny) === 500
      && Number(settleFee.rows[0]?.input_tokens) === 100 && Number(settleFee.rows[0]?.output_tokens) === 200
      && settleFee.rows[0]?.price_revision === REVISION);
  // replay 幂等：同 idempotencyKey 再 invoke → durable claim 命中缓存/终态，零第二次外呼。
  const replayCalls = { n: 0 };
  const replay = await invoke({
    idempotencyKey: 'op02:settle', operation: { id: 'interview.answer-scoring.v1', businessRevision: 'op02:settle' },
    schema: Schema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), replayCalls),
  }, pool, OWNER);
  const settleFeeCount = await pool.query(`SELECT count(*)::int n FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key='op02:settle'`, [OWNER]);
  A('invoke replay 幂等：零第二次外呼且 fee ledger 仍只一行', replayCalls.n === 0 && Number(settleFeeCount.rows[0]?.n) === 1);

  // ── 测试 7：breaker_open 时 invoke 确定性拒绝（零外呼、claim=failed）。 ─────────
  // 把 scorer 分区断路器 trip 到 open（阈值 5），invoke 应返回 model_circuit_open 且零外呼。
  for (let i = 0; i < 5; i++) {
    const a = await admitSharedModelOperation(pool, OWNER, { partition: scorerPartition, idempotencyKey: `op02:trip:${i}` });
    if (a.ok) await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, a.lease, 'failure'));
  }
  const breakerCalls = { n: 0 };
  const breakerInvoke = await invoke({
    idempotencyKey: 'op02:breaker-open', operation: { id: 'interview.answer-scoring.v1', businessRevision: 'op02:breaker-open' },
    schema: Schema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), breakerCalls),
  }, pool, OWNER);
  const breakerInvocation = await pool.query(`SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key='op02:breaker-open'`, [OWNER]);
  A('breaker_open → invoke 返回 model_circuit_open、零外呼、durable claim=failed',
    'error' in breakerInvoke && breakerInvoke.error === 'model_circuit_open' && breakerCalls.n === 0
      && breakerInvocation.rows[0]?.status === 'failed' && breakerInvocation.rows[0]?.error_code === 'model_circuit_open');
  // 清理：把 scorer 断路器复位（避免后续其它分区测试被连带拒绝——虽然本证明已收尾）。
  await pool.query(`UPDATE ai_model_breaker_state SET phase='closed', consecutive_failures=0, opened_at=NULL, half_open_probe_token=NULL, half_open_probe_expires_at=NULL WHERE operation_id='interview.answer-scoring.v1'`);

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ MODEL-OP-02 共享 provider 准入/账本/并发/断路器全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
