/**
 * Durable text-model billing proof against PostgreSQL.  It injects a model that
 * has “accepted then lost response” semantics and proves the same logical key
 * is not dispatched twice, while a successful call settles input+output cost.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool } from '@meetwise/db';
import { z } from 'zod';
import { failoverModel, invoke, modelFor, rateLimitedModel, type Model, type ModelClient, type ModelCostPolicy } from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const OWNER = 'modelCostOwner';
const SCOPE = 'text-model-proof';
const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: 'proof-provider', model: 'proof-model', region: 'cn-proof', priceRevision: 'proof-r1', maxInputTokens: 1000, maxOutputTokens: 500,
};
const Schema = z.object({ answer: z.string().min(1) });

function billable(result: ReturnType<Model['call']>, calls: { n: number }): Model {
  return {
    requestDigest: 'a'.repeat(64),
    async call() { calls.n++; return result; },
    prepare() { return { ready: true as const, execute: () => this.call(1), cost: policy }; },
  };
}

async function main() {
  await pool.query(sql('../../db/sql/01_schema.sql'));
  for (const f of ['0033_ai_cost_governance.sql', '0035_ai_cost_principal_scope.sql', '0036_ai_text_cost_governance.sql', '0037_ai_model_invocation_durable_claim.sql', '0056_model_invocation_reconcile.sql', '0057_model_invocation_cost_scope.sql', '0083_ai_text_cost_price_revision_binding.sql', '0085_ai_model_logical_node_dispatch_slot.sql', '0088_ai_model_invocation_controlled_state_machine.sql', '0119_usage_reconciliation_wiring.sql', '0128_model_invocation_same_key_claim_join.sql']) {
    await pool.query(sql(`../../db/migrations/${f}`));
  }
  await pool.query(`DELETE FROM ai_model_invocation WHERE owner_user_id=$1`, [OWNER]);
  await pool.query(`DELETE FROM ai_cost_reservation WHERE scope_id=$1`, [SCOPE]);
  await pool.query(`DELETE FROM ai_cost_budget_month WHERE scope_id=$1`, [SCOPE]);
  await pool.query(`DELETE FROM ai_cost_budget_policy WHERE scope_id=$1`, [SCOPE]);
  await pool.query(`DELETE FROM ai_cost_price_book WHERE provider=$1 AND model=$2 AND region=$3`, [policy.provider, policy.model, policy.region]);
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,'proof-r1',1000000,2000000,'https://example.test/pricing',clock_timestamp())`,
    [policy.provider, policy.model, policy.region],
  );
  await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1000000,true)`, [SCOPE]);

  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,'proof-r2',9000000,9000000,'https://example.test/pricing-r2',clock_timestamp())`,
    [policy.provider, policy.model, policy.region],
  );

  // A successful response with usage settles exact input + output cost.
  const goodCalls = { n: 0 };
  const good = billable(Promise.resolve({ ok: true as const, raw: { answer: 'ok' }, usage: { inputTokens: 100, outputTokens: 200 } }), goodCalls);
  const goodResult = await invoke({ idempotencyKey: 'cost:good', schema: Schema, businessValidate: () => null, model: good }, pool, OWNER);
  const goodRow = await pool.query(`SELECT status,settled_micro_cny,input_tokens_actual,output_tokens_actual FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key='cost:good'`, [SCOPE]);
  A('输入+输出 token 在派发前预留、成功后按实收结算', 'value' in goodResult && goodCalls.n === 1 && goodRow.rows[0]?.status === 'settled' && Number(goodRow.rows[0]?.settled_micro_cny) === 500 && Number(goodRow.rows[0]?.input_tokens_actual) === 100 && Number(goodRow.rows[0]?.output_tokens_actual) === 200);
  const revisionRow = await pool.query(`SELECT price_revision,input_micro_cny_per_million,output_micro_cny_per_million FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key='cost:good'`, [SCOPE]);
  A('策略指定 r1 时即使 r2 更晚也只冻结 r1 的费率', revisionRow.rows[0]?.price_revision === 'proof-r1'
    && Number(revisionRow.rows[0]?.input_micro_cny_per_million) === 1000000
    && Number(revisionRow.rows[0]?.output_micro_cny_per_million) === 2000000);

  const missingPriceCalls = { n: 0 };
  const missingPrice = billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), missingPriceCalls);
  const missingPriceResult = await invoke({ idempotencyKey: 'cost:missing-price', schema: Schema, businessValidate: () => null,
    model: { ...missingPrice, prepare() { return { ready: true as const, execute: () => missingPrice.call(1), cost: { ...policy, priceRevision: 'proof-r404' } }; } },
  }, pool, OWNER);
  const missingPriceReservation = await pool.query(`SELECT count(*)::int n FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key='cost:missing-price'`, [SCOPE]);
  A('不存在的指定价格 revision 在派发前拒绝，零外呼、零预留', 'error' in missingPriceResult && missingPriceResult.error === 'cost_price_missing'
    && missingPriceCalls.n === 0 && Number(missingPriceReservation.rows[0]?.n) === 0);

  const bindingFirst = await invoke({ idempotencyKey: 'cost:binding', schema: Schema, businessValidate: () => null, model: billable(Promise.resolve({ ok: true as const, raw: { answer: 'binding' }, usage: { inputTokens: 1, outputTokens: 1 } }), { n: 0 }) }, pool, OWNER);
  const changedBindingCalls = { n: 0 };
  const changedBinding = billable(Promise.resolve({ ok: true as const, raw: { answer: 'must-not-send' } }), changedBindingCalls);
  const bindingReplay = await invoke({ idempotencyKey: 'cost:binding', schema: Schema, businessValidate: () => null,
    model: { ...changedBinding, prepare() { return { ready: true as const, execute: () => changedBinding.call(1), cost: { ...policy, priceRevision: 'proof-r2' } }; } },
  }, pool, OWNER);
  A('同一逻辑 key 的价格 revision 改变时 durable claim 拒绝复用，零第二次外呼', 'value' in bindingFirst
    && 'error' in bindingReplay && bindingReplay.error === 'idempotency_key_payload_mismatch' && changedBindingCalls.n === 0);

  // Supplier may have accepted before the connection fails. The first request is
  // unknown; replay must read that terminal state and make zero second calls.
  const unknownCalls = { n: 0 };
  const unknown = billable(Promise.resolve({ ok: false as const, kind: 'transient', externalOutcome: 'unknown' }), unknownCalls);
  const firstUnknown = await invoke({ idempotencyKey: 'cost:unknown', schema: Schema, businessValidate: () => null, model: unknown }, pool, OWNER);
  const secondUnknown = await invoke({ idempotencyKey: 'cost:unknown', schema: Schema, businessValidate: () => null, model: unknown }, pool, OWNER);
  const unknownRow = await pool.query(`SELECT status FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key='cost:unknown'`, [SCOPE]);
  const invocationRow = await pool.query(`SELECT status FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key='cost:unknown'`, [OWNER]);
  A('结果不明冻结费用与调用意图，重放不产生第二次供应商派发', 'error' in firstUnknown && firstUnknown.error === 'external_outcome_unknown' && 'error' in secondUnknown && secondUnknown.error === 'external_outcome_unknown' && unknownCalls.n === 1 && unknownRow.rows[0]?.status === 'unknown' && invocationRow.rows[0]?.status === 'unknown');

  // A model execution deadline is post-dispatch: the supplier may have
  // accepted the request, therefore reservation and invocation must both be
  // unknown (not settled/released) and a replay must not call it again.
  let timeoutCalls = 0;
  let timeoutAborts = 0;
  const timeoutModel: Model = {
    requestDigest: 'c'.repeat(64),
    call(_attempt, signal) {
      timeoutCalls++;
      signal?.addEventListener('abort', () => { timeoutAborts++; }, { once: true });
      return new Promise(() => {});
    },
    prepare() { return { ready: true as const, execute: (signal?: AbortSignal) => this.call(1, signal), cost: policy }; },
  };
  const firstTimeout = await invoke({ idempotencyKey: 'cost:execution-timeout', schema: Schema, businessValidate: () => null, model: timeoutModel, executionTimeoutMs: 35 }, pool, OWNER);
  const replayTimeout = await invoke({ idempotencyKey: 'cost:execution-timeout', schema: Schema, businessValidate: () => null, model: timeoutModel, executionTimeoutMs: 35 }, pool, OWNER);
  const timeoutCostRow = await pool.query(`SELECT status,settled_micro_cny FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key='cost:execution-timeout'`, [SCOPE]);
  const timeoutInvocationRow = await pool.query(`SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key='cost:execution-timeout'`, [OWNER]);
  A('执行超时会 abort 传输并把费用/调用一同冻结为 unknown，既不结算也不重发',
    'error' in firstTimeout && firstTimeout.error === 'external_outcome_unknown'
      && 'error' in replayTimeout && replayTimeout.error === 'model_execution_timeout'
      && timeoutCalls === 1 && timeoutAborts === 1
      && timeoutCostRow.rows[0]?.status === 'unknown' && timeoutCostRow.rows[0]?.settled_micro_cny === null
      && timeoutInvocationRow.rows[0]?.status === 'unknown' && timeoutInvocationRow.rows[0]?.error_code === 'model_execution_timeout');

  // RPM admission is deliberately before cost/dispatch.  Establish one local
  // send slot, then a second distinct request times out while waiting for the
  // next slot: no provider call, no cost reservation, and a failed (known
  // not-sent) invocation are the only valid outcomes.
  let rateProviderCalls = 0;
  const rateLimitedClient: ModelClient = rateLimitedModel({
    costPolicy: policy,
    async complete() {
      rateProviderCalls++;
      return { ok: true, raw: { answer: 'rate-ok' }, usage: { inputTokens: 1, outputTokens: 1 } };
    },
  }, { maxConcurrent: 1, rpm: 60 });
  const rateFirst = await invoke({
    idempotencyKey: 'cost:rpm-first', schema: Schema, businessValidate: () => null,
    model: modelFor(rateLimitedClient, { service: 'proof.rate', system: 'trusted', userData: 'first' }),
  }, pool, OWNER);
  const rateSecond = await invoke({
    idempotencyKey: 'cost:rpm-admission-timeout', schema: Schema, businessValidate: () => null,
    model: modelFor(rateLimitedClient, { service: 'proof.rate', system: 'trusted', userData: 'second' }), executionTimeoutMs: 35,
  }, pool, OWNER);
  const rateCost = await pool.query(`SELECT count(*)::int n FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key='cost:rpm-admission-timeout'`, [SCOPE]);
  const rateInvocation = await pool.query(`SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key='cost:rpm-admission-timeout'`, [OWNER]);
  A('RPM 排队超时发生在派发前：第二请求零外呼、零费用预留且 durable claim=failed',
    'value' in rateFirst && 'error' in rateSecond && rateSecond.error === 'model_admission_timeout'
      && rateProviderCalls === 1 && Number(rateCost.rows[0]?.n) === 0
      && rateInvocation.rows[0]?.status === 'failed' && rateInvocation.rows[0]?.error_code === 'model_admission_timeout');

  // A non-cooperative admission adapter can resolve after the gateway timeout.
  // That late lease must release itself: the caller has already terminalized
  // the durable claim and must never execute a provider request or leak the
  // local capacity/probe forever.
  let lateAdmissionProviderCalls = 0;
  let lateAdmissionReleases = 0;
  const lateAdmissionModel: Model = {
    requestDigest: 'd'.repeat(64),
    async call() { lateAdmissionProviderCalls++; return { ok: true, raw: { answer: 'must-not-send' } }; },
    prepare() {
      return {
        ready: true as const,
        admit: async () => {
          await new Promise((resolve) => setTimeout(resolve, 60));
          return { release: () => { lateAdmissionReleases++; } };
        },
        execute: () => this.call(1),
      };
    },
  };
  const lateAdmission = await invoke({
    idempotencyKey: 'cost:late-admission', schema: Schema, businessValidate: () => null,
    model: lateAdmissionModel, executionTimeoutMs: 35,
  }, pool, OWNER);
  await new Promise((resolve) => setTimeout(resolve, 70));
  const lateAdmissionInvocation = await pool.query(
    `SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key='cost:late-admission'`, [OWNER],
  );
  A('准入超时后迟到取得的 lease 会自释放，零外呼且 durable claim=failed',
    'error' in lateAdmission && lateAdmission.error === 'model_admission_timeout'
      && lateAdmissionProviderCalls === 0 && lateAdmissionReleases === 1
      && lateAdmissionInvocation.rows[0]?.status === 'failed' && lateAdmissionInvocation.rows[0]?.error_code === 'model_admission_timeout');

  // A pre-dispatch database/ledger error must release local admission capacity.
  // NUL is rejected by PostgreSQL parameter encoding before any supplier send;
  // it is a deterministic fault injection, not user-controlled production data.
  let faultProviderCalls = 0;
  const faultPolicy: ModelCostPolicy = { ...policy, scopeId: `fault\u0000scope` };
  const faultGate = rateLimitedModel({
    costPolicy: faultPolicy,
    async complete() { faultProviderCalls++; return { ok: true, raw: { answer: 'must-not-send' } }; },
  }, { maxConcurrent: 1 });
  const dispatchFault = await invoke({
    idempotencyKey: 'cost:dispatch-preflight-fault', schema: Schema, businessValidate: () => null,
    model: modelFor(faultGate, { service: 'proof.fault', system: 'trusted', userData: 'fault' }),
  }, pool, OWNER);
  A('派发前畸形费用策略 fail-fast，不会取得 admission 槽位或外呼',
    'error' in dispatchFault && dispatchFault.error === 'model_cost_policy_invalid'
      && faultProviderCalls === 0 && faultGate.inflight() === 0 && faultGate.queued() === 0);

  // Concurrent identical requests get one durable claim and the second waits for
  // safe cached output instead of holding a transaction while the model sleeps.
  const concurrentCalls = { n: 0 };
  const slow: Model = {
    requestDigest: 'b'.repeat(64),
    async call() { concurrentCalls.n++; await new Promise((r) => setTimeout(r, 80)); return { ok: true, raw: { answer: 'one' }, usage: { inputTokens: 1, outputTokens: 1 } }; },
    prepare() { return { ready: true, execute: () => this.call(1), cost: policy }; },
  };
  const both = await Promise.all([
    invoke({ idempotencyKey: 'cost:concurrent', schema: Schema, businessValidate: () => null, model: slow }, pool, OWNER),
    invoke({ idempotencyKey: 'cost:concurrent', schema: Schema, businessValidate: () => null, model: slow }, pool, OWNER),
  ]);
  A('并发重放不占用长事务且只派发一次', concurrentCalls.n === 1 && both.every((x) => 'value' in x && x.value.answer === 'one'));

  // Two requests can both finish the pure half-open route selection before
  // either one acquires the single probe lease.  The follower must re-run
  // *pre-dispatch* selection and use backup, not permanently fail its durable
  // idempotency key.  This uses the actual invoke + failover contract and a
  // deterministic barrier rather than a timing-dependent unit race.
  let primaryProbeHeld = false;
  let primaryExternalCalls = 0;
  let backupExternalCalls = 0;
  let prepared = 0;
  let releaseInitialPlans!: () => void;
  const initialPlans = new Promise<void>((resolve) => { releaseInitialPlans = resolve; });
  let resolvePrimary!: (result: any) => void;
  const halfOpenPrimary: ModelClient = {
    async complete() { throw new Error('complete_should_not_bypass_prepare'); },
    async prepare() {
      prepared++;
      if (prepared <= 2) {
        if (prepared === 2) releaseInitialPlans();
        await initialPlans;
      }
      if (primaryProbeHeld) return { ready: false as const, error: 'model_circuit_half_open' };
      return {
        ready: true as const,
        admit: async () => {
          if (primaryProbeHeld) throw new Error('model_circuit_half_open');
          primaryProbeHeld = true;
          return { release: () => { primaryProbeHeld = false; } };
        },
        execute: async () => {
          primaryExternalCalls++;
          return new Promise((resolve) => { resolvePrimary = resolve; });
        },
      };
    },
  };
  const halfOpenBackup: ModelClient = {
    async complete() { backupExternalCalls++; return { ok: true as const, raw: { answer: 'backup' } }; },
  };
  const halfOpenChain = failoverModel([halfOpenPrimary, halfOpenBackup]);
  const halfA = invoke({ idempotencyKey: 'cost:half-open-a', schema: Schema, businessValidate: () => null,
    model: modelFor(halfOpenChain, { service: 'proof.half-open', system: 'trusted', userData: 'a' }) }, pool, OWNER);
  const halfB = invoke({ idempotencyKey: 'cost:half-open-b', schema: Schema, businessValidate: () => null,
    model: modelFor(halfOpenChain, { service: 'proof.half-open', system: 'trusted', userData: 'b' }) }, pool, OWNER);
  for (let i = 0; i < 50 && (primaryExternalCalls !== 1 || backupExternalCalls !== 1); i++)
    await new Promise((resolve) => setTimeout(resolve, 5));
  if (!resolvePrimary) throw new Error('half_open_backup_test_setup_timeout');
  resolvePrimary({ ok: true, raw: { answer: 'primary' } });
  const halfResults = await Promise.all([halfA, halfB]);
  A('半开探针竞争的 follower 在派发前重选 backup；两条 durable key 都成功且不重复外呼',
    primaryExternalCalls === 1 && backupExternalCalls === 1
      && halfResults.every((result) => 'value' in result)
      && halfResults.map((result) => 'value' in result ? result.value.answer : '').sort().join(',') === 'backup,primary');

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ 文本模型费用状态机全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
