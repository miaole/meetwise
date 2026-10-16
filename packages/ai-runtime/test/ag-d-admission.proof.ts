/**
 * AG-D-ADMISSION（AG 修复轨刀 D·AG-01 准入拒绝去终态化）真 PG 隔离证明。
 *
 * 目标：证明「准入拒绝（熔断开/并发满/预算尽=known-not-sent 零外呼零费用）不再写 failed 终态」——
 * 三拒绝点（invoke.ts 共享准入/本地 admission/预算尽）对瞬时准入族改走 0179
 * `ai_model_release_refused_claim_scoped` 案A 可写最小形释放（lease_token 承袭+lease 即刻过期+
 * status 留 claimed+error_code/completed_at 零写），同键重试走 0130 expired-claimed 重领=真重试；
 * 族外确定性拒绝（配置/failover policy/payload·cost-scope·logical-node mismatch/privacy fence）
 * 维持 failed 终态与既有门语义零放宽（负臂）。
 *
 * 运行方式：经 scripts/run-e2e-isolated.mjs 的 `ag-d-admission:prove` gate（一次性 pgvector
 * 容器 + 全量版本化迁移含 0179）。不 require 任何真实 provider；确定性 stub/seam。
 */
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  asPrincipal, assertIsolatedTestTarget, claimModelInvocation, completeModelInvocation, createPool,
  failModelInvocationClaim, markModelInvocationDispatched, releaseRefusedModelInvocationClaim,
  type ModelAdmissionPartition,
} from '@meetwise/db';
import {
  invoke, admitSharedModelOperation, recordSharedModelOperation, resolveModelAdmissionPartition,
  ADMISSION_REFUSAL_RETRYABLE_CODES, isAdmissionRefusalRetryable,
  type Model, type ModelCostPolicy,
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const OWNER = `ag-d-adm-${process.pid}`;
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const PROVIDER = `agd-provider-${suffix}`;
const MODEL = `agd-model-${suffix}`;
const REGION = 'cn-proof';
const REVISION = 'agd-r1';
const Schema = z.object({ answer: z.string().min(1) });

/** 计费策略（provider/model/region 进 ai_cost_price_book；scope 进 ai_cost_budget_policy）。 */
const policy: ModelCostPolicy = {
  scopeId: `agd-scope-${suffix}`, provider: PROVIDER, model: MODEL, region: REGION, priceRevision: REVISION,
  maxInputTokens: 1000, maxOutputTokens: 500,
};

function billable(result: ReturnType<Model['call']>, calls: { n: number }): Model {
  return {
    requestDigest: 'e'.repeat(64),
    async call() { calls.n++; return result; },
    prepare() { return { ready: true as const, execute: () => this.call(1), cost: policy }; },
  };
}

/** 案A 账本释放形断言（§2-1 rev3 修正形）：claimed+token 承袭非空+lease 即刻过期+零终态痕。 */
function releasedClaimShape(row: {
  status: string; error_code: string | null; lease_token: string | null;
  lease_expires_at: string | null; completed_at: string | null;
} | undefined): boolean {
  return !!row && row.status === 'claimed' && row.error_code === null && row.lease_token !== null
    && row.completed_at === null && row.lease_expires_at !== null
    && new Date(row.lease_expires_at).getTime() <= Date.now();
}

/** 真实现：按 owner+key 读账本行五列。 */
const claimRow = async (key: string) => (await pool.query<{
  status: string; error_code: string | null; lease_token: string | null;
  lease_expires_at: string | null; completed_at: string | null;
 }>(
  `SELECT status,error_code,lease_token::text,lease_expires_at::text,completed_at::text
     FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`, [OWNER, key],
)).rows[0];

async function main() {
  await assertIsolatedTestTarget(pool);

  // ── 预置：计费价格表 + 项目预算（billed invoke 用）。 ──────────────────────────
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,$4,1000000,2000000,'https://example.test/agd',clock_timestamp())`,
    [PROVIDER, MODEL, REGION, REVISION],
  );
  await pool.query(
    `INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)`, [policy.scopeId],
  );

  // ── 臂 0：拒绝族单一权威（纯函数面）——六码全集与 0179 SQL 白名单同源。 ─────────
  A('拒绝族常量=六码（三准入码+预算+本地 admission 两码）',
    ADMISSION_REFUSAL_RETRYABLE_CODES.size === 6
      && ['model_circuit_open', 'model_circuit_half_open', 'model_concurrency_exhausted', 'cost_budget_exhausted', 'model_admission_timeout', 'model_admission_failed']
        .every((c) => ADMISSION_REFUSAL_RETRYABLE_CODES.has(c)));
  A('族外确定性拒绝恒 false（failover policy mismatch/配置族不在族内）',
    !isAdmissionRefusalRetryable('model_failover_cost_policy_mismatch')
    && !isAdmissionRefusalRetryable('model_admission_operation_blocked')
    && !isAdmissionRefusalRetryable('cost_policy_missing') && !isAdmissionRefusalRetryable('cost_price_missing')
    && !isAdmissionRefusalRetryable(undefined));

  // ── 臂 1（函数级·案A 承袭直证）：seed claim → release → token 原值承袭+即刻过期 → 同键重领 execute。 ──
  const seedKey = `agd:seed:${suffix}`;
  const seedToken = randomUUID();
  const seeded = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: seedKey, requestDigest: 'a'.repeat(64), leaseToken: seedToken, leaseSeconds: 60,
  }));
  A('seed claim=execute（fixture 就位）', seeded.action === 'execute');
  const released = await asPrincipal(pool, OWNER, (c) =>
    releaseRefusedModelInvocationClaim(c, OWNER, seedKey, seedToken, 'model_circuit_open'));
  A('release（族内码）→ true', released === true);
  const afterRelease = await claimRow(seedKey);
  A('案A 承袭直证：status=claimed+lease_token 原值承袭零改+lease_expires_at 即刻过期+error_code/completed_at 零写',
    afterRelease?.status === 'claimed' && afterRelease.lease_token === seedToken
      && afterRelease.error_code === null && afterRelease.completed_at === null
      && afterRelease.lease_expires_at !== null && new Date(afterRelease.lease_expires_at).getTime() <= Date.now());
  const reclaimed = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: seedKey, requestDigest: 'a'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  A('释放后同键重 claim=execute 且 token 重领覆写（0130:211-212·键未毒化）',
    reclaimed.action === 'execute' && reclaimed.leaseToken !== seedToken);

  // ── 臂 2（函数级负臂）：白名单外码 RAISE；stale token/异 status → false（permit 撤回不残留）。 ──
  let whitelistRaised = '';
  try {
    await asPrincipal(pool, OWNER, (c) =>
      releaseRefusedModelInvocationClaim(c, OWNER, seedKey, seedToken, 'model_failover_cost_policy_mismatch'));
  } catch (e) {
    whitelistRaised = e instanceof Error ? e.message : String(e);
  }
  A('白名单外码（确定性 failover mismatch）→ RAISE invalid_input（拒绝码不经账本行承载）',
    whitelistRaised.includes('ai_model_release_refused_claim_invalid_input'));
  const staleToken = await asPrincipal(pool, OWNER, (c) =>
    releaseRefusedModelInvocationClaim(c, OWNER, seedKey, randomUUID(), 'model_circuit_open'));
  A('stale token → false（CAS=不得释放他人重领所得·permit 撤回）', staleToken === false);

  // ── 臂 3（熔断臂·三臂①）：5×failure trip → invoke 拒 model_circuit_open 零外呼 → 账本释放形 → 复位后同键重 claim=execute。 ──
  const breakerPartition: ModelAdmissionPartition = resolveModelAdmissionPartition({ operation: { id: 'interview.quiz-generation.v1', businessRevision: 'agd' } })!;
  await pool.query(`DELETE FROM ai_model_breaker_state WHERE operation_id=$1`, [breakerPartition.operationId]);
  await pool.query(`DELETE FROM ai_model_concurrency_lease WHERE operation_id=$1`, [breakerPartition.operationId]);
  for (let i = 0; i < 5; i++) {
    const a = await admitSharedModelOperation(pool, OWNER, { partition: breakerPartition, idempotencyKey: `agd:trip:${i}:${suffix}` });
    if (a.ok) await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, a.lease, 'failure'));
  }
  const breakerCalls = { n: 0 };
  const breakerKey = `agd:breaker:${suffix}`;
  const breakerInvoke = await invoke({
    idempotencyKey: breakerKey, operation: { id: 'interview.quiz-generation.v1', businessRevision: 'agd:breaker' },
    schema: Schema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), breakerCalls),
  }, pool, OWNER);
  A('熔断臂：invoke 返回 model_circuit_open、零外呼、零钱面（known-not-sent）',
    'error' in breakerInvoke && breakerInvoke.error === 'model_circuit_open' && breakerCalls.n === 0);
  A('熔断臂：账本=案A 释放形（非 failed 终态·零 completed_at）', releasedClaimShape(await claimRow(breakerKey)));
  const breakerPhase = await pool.query(`SELECT phase,consecutive_failures FROM ai_model_breaker_state WHERE operation_id=$1`, [breakerPartition.operationId]);
  A('熔断臂：breaker 相位不变（no_signal 恒持·零失败计数放大）',
    breakerPhase.rows[0]?.phase === 'open' && Number(breakerPhase.rows[0]?.consecutive_failures) === 5);
  await pool.query(`UPDATE ai_model_breaker_state SET phase='closed', consecutive_failures=0, opened_at=NULL, half_open_probe_token=NULL, half_open_probe_expires_at=NULL WHERE operation_id=$1`, [breakerPartition.operationId]);
  const breakerRetry = await invoke({
    idempotencyKey: breakerKey, operation: { id: 'interview.quiz-generation.v1', businessRevision: 'agd:breaker' },
    schema: Schema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'breaker-retry-ok' }, usage: { inputTokens: 100, outputTokens: 200 } }), breakerCalls),
  }, pool, OWNER);
  const breakerRetryRow = await claimRow(breakerKey);
  const breakerRetryOutcome = 'error' in breakerRetry ? `error:${breakerRetry.error}` : `value:${breakerRetry.value.answer}`;
  A(`熔断臂：复位后同键重 claim=execute（真外呼+succeeded·30s 窗过后不再 replay failed）[${breakerRetryOutcome}]`,
    'value' in breakerRetry && breakerRetry.value.answer === 'breaker-retry-ok' && breakerCalls.n === 1
      && breakerRetryRow?.status === 'succeeded' && breakerRetryRow.completed_at !== null);

  // ── 臂 4（并发臂·三臂②）：专用分区槽满 → 拒 model_concurrency_exhausted → 释放形 → 还槽后同键可执行。 ──
  const concPartition: ModelAdmissionPartition = resolveModelAdmissionPartition({ operation: { id: 'resume.diagnosis.v1', businessRevision: 'agd' } })!;
  await pool.query(
    `UPDATE ai_model_admission_policy SET max_concurrency=1 WHERE provider_account=$1 AND region=$2 AND model_or_recipe=$3 AND operation_id=$4`,
    [concPartition.providerAccount, concPartition.region, concPartition.modelOrRecipe, concPartition.operationId],
  );
  await pool.query(`DELETE FROM ai_model_concurrency_lease WHERE operation_id=$1`, [concPartition.operationId]);
  const slot = await admitSharedModelOperation(pool, OWNER, { partition: concPartition, idempotencyKey: `agd:conc-hold:${suffix}` });
  A('并发臂：槽位 fixture 就位（1/1 占满）', slot.ok === true);
  const concCalls = { n: 0 };
  const concKey = `agd:conc:${suffix}`;
  const concInvoke = await invoke({
    idempotencyKey: concKey, operation: { id: 'resume.diagnosis.v1', businessRevision: 'agd:conc' },
    schema: Schema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), concCalls),
  }, pool, OWNER);
  A('并发臂：invoke 返回 model_concurrency_exhausted、零外呼',
    'error' in concInvoke && concInvoke.error === 'model_concurrency_exhausted' && concCalls.n === 0);
  A('并发臂：账本=案A 释放形', releasedClaimShape(await claimRow(concKey)));
  if (slot.ok) await asPrincipal(pool, OWNER, (c) => recordSharedModelOperation(c, OWNER, slot.lease, 'no_signal'));
  const concRetry = await invoke({
    idempotencyKey: concKey, operation: { id: 'resume.diagnosis.v1', businessRevision: 'agd:conc' },
    schema: Schema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'conc-retry-ok' }, usage: { inputTokens: 100, outputTokens: 200 } }), concCalls),
  }, pool, OWNER);
  const concRetryRow = await claimRow(concKey);
  const concRetryOutcome = 'error' in concRetry ? `error:${concRetry.error}` : `value:${concRetry.value.answer}`;
  A(`并发臂：还槽后同键重 claim=execute（真外呼+succeeded）[${concRetryOutcome}]`,
    'value' in concRetry && concRetry.value.answer === 'conc-retry-ok' && concCalls.n === 1 && concRetryRow?.status === 'succeeded');

  // ── 臂 5（预算臂·三臂③）：budget scope 打满 → 拒 cost_budget_exhausted → 释放形 → 窗口复位后同键可执行。 ──
  const budgetScope = `agd-budget-${suffix}`;
  await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1,true)`, [budgetScope]);
  const budgetCalls = { n: 0 };
  const budgetKey = `agd:budget:${suffix}`;
  const budgetInvoke = await invoke({
    idempotencyKey: budgetKey, operation: { id: 'interview.competency-planning.v1', businessRevision: 'agd:budget' },
    schema: Schema, businessValidate: () => null,
    model: {
      requestDigest: 'e'.repeat(64),
      async call() { budgetCalls.n++; return { ok: true as const, raw: { answer: 'must-not-send' } }; },
      prepare() { return { ready: true as const, execute: () => this.call(1), cost: { ...policy, scopeId: budgetScope } }; },
    },
  }, pool, OWNER);
  A('预算臂：invoke 返回 cost_budget_exhausted、零外呼、零预留冻结',
    'error' in budgetInvoke && budgetInvoke.error === 'cost_budget_exhausted' && budgetCalls.n === 0);
  A('预算臂：账本=案A 释放形', releasedClaimShape(await claimRow(budgetKey)));
  const frozenReservations = await pool.query(
    `SELECT count(*)::int n FROM ai_cost_reservation WHERE request_owner_user_id=$1 AND idempotency_key=$2`, [OWNER, budgetKey]);
  A('预算臂：零钱面残留（无 reservation 行=零预留冻结）', Number(frozenReservations.rows[0]?.n) === 0);
  await pool.query(`UPDATE ai_cost_budget_month SET limit_micro_cny=100000000 WHERE scope_id=$1`, [budgetScope]);
  const budgetRetry = await invoke({
    idempotencyKey: budgetKey, operation: { id: 'interview.competency-planning.v1', businessRevision: 'agd:budget' },
    schema: Schema, businessValidate: () => null,
    model: {
      requestDigest: 'e'.repeat(64),
      async call() { budgetCalls.n++; return { ok: true as const, raw: { answer: 'budget-retry-ok' }, usage: { inputTokens: 100, outputTokens: 200 } }; },
      prepare() { return { ready: true as const, execute: () => this.call(1), cost: { ...policy, scopeId: budgetScope } }; },
    },
  }, pool, OWNER);
  const budgetRetryRow = await claimRow(budgetKey);
  const budgetRetryOutcome = 'error' in budgetRetry ? `error:${budgetRetry.error}` : `value:${budgetRetry.value.answer}`;
  A(`预算臂：窗口复位后同键重 claim=execute（真外呼+succeeded）[${budgetRetryOutcome}] calls=${budgetCalls.n}`,
    'value' in budgetRetry && budgetRetry.value.answer === 'budget-retry-ok' && budgetCalls.n === 1 && budgetRetryRow?.status === 'succeeded');

  // ── 负臂（既有门回归·语义零放宽）：cached 重放/payload·logical_node mismatch/dispatching wait/确定性 failed 终态原样。 ──
  const replayCalls = { n: 0 };
  const cached = await invoke({
    idempotencyKey: concKey, operation: { id: 'resume.diagnosis.v1', businessRevision: 'agd:conc' },
    schema: Schema, businessValidate: () => null,
    model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), replayCalls),
  }, pool, OWNER);
  A('负臂：succeeded cached 重放原样（0130:171-173·零第二次外呼）',
    'value' in cached && cached.value.answer === 'conc-retry-ok' && replayCalls.n === 0);
  const mismatchCalls = { n: 0 };
  const mismatch = await invoke({
    idempotencyKey: concKey, operation: { id: 'resume.diagnosis.v1', businessRevision: 'agd:conc' },
    schema: Schema, businessValidate: () => null,
    model: { ...billable(Promise.resolve({ ok: true as const, raw: { answer: 'x' } }), mismatchCalls), requestDigest: 'd'.repeat(64) },
  }, pool, OWNER);
  A('负臂：payload digest mismatch 恒 failed 原样（0130:163-169）',
    'error' in mismatch && mismatch.error === 'idempotency_key_payload_mismatch' && mismatchCalls.n === 0);
  const lnA = `agd:ln:${suffix}`;
  await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: lnA, logicalNodeKey: 'node-a', requestDigest: 'b'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  const lnMismatch = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: lnA, logicalNodeKey: 'node-b', requestDigest: 'b'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  A('负臂：logical_node mismatch 恒 failed 原样（0130:191-193）',
    lnMismatch.action === 'failed' && lnMismatch.error === 'idempotency_key_logical_node_mismatch');
  const dispKey = `agd:disp:${suffix}`;
  const dispToken = randomUUID();
  await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: dispKey, requestDigest: 'c'.repeat(64), leaseToken: dispToken, leaseSeconds: 60,
  }));
  const marked = await asPrincipal(pool, OWNER, (c) => markModelInvocationDispatched(c, OWNER, dispKey, dispToken));
  const wait = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: dispKey, requestDigest: 'c'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  A('负臂：dispatching wait 原样（0130:187-189·禁自动重发）', marked === true && wait.action === 'wait');
  const detKey = `agd:det:${suffix}`;
  const detToken = randomUUID();
  await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: detKey, requestDigest: 'f'.repeat(64), leaseToken: detToken, leaseSeconds: 60,
  }));
  const detFailed = await asPrincipal(pool, OWNER, (c) =>
    failModelInvocationClaim(c, OWNER, detKey, detToken, 'privacy_fenced_pre_dispatch'));
  const detReplay = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: detKey, requestDigest: 'f'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  const detRow = await claimRow(detKey);
  A('负臂：族外确定性拒绝 failed 终态原样（privacy fence 同形·0130:179-181 重放 failed 不放宽）',
    detFailed === true && detReplay.action === 'failed' && detReplay.error === 'privacy_fenced_pre_dispatch'
      && detRow?.status === 'failed' && detRow.completed_at !== null);
  const cachedComplete = await asPrincipal(pool, OWNER, async (c) => {
    if (reclaimed.action !== 'execute') return false;
    const dispatched = await markModelInvocationDispatched(c, OWNER, seedKey, reclaimed.leaseToken);
    if (!dispatched) return false;
    return completeModelInvocation(c, { owner: OWNER, idempotencyKey: seedKey, output: { answer: 'seeded-ok' } });
  });
  const cachedClaim = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: seedKey, requestDigest: 'a'.repeat(64), leaseToken: randomUUID(), leaseSeconds: 60,
  }));
  A('负臂：succeeded 可重放 cached 原样（臂 1 重领后 complete→cached）',
    cachedComplete === true && cachedClaim.action === 'cached');

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ AG-D 准入拒绝去终态化（案A 释放可重试）全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
