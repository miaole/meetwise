/**
 * estimate-threading-invoke.proof — 承重证明:派发前保守估算穿过 invoke 全链路落库 + 低估即时违约标记 + 非法估算 fail-closed。
 * 纯 fake transport + 隔离 PostgreSQL(真落库 ai_invocation_trace / ai_cost_reservation / ai_model_invocation)。
 *
 * 补齐审计 H1:此前 usage-estimate-threading.proof 只证到 `complete → usage.estimateInputTokens`,
 * 从 complete 之后穿过 invoke → validUsage → settle → persistTrace 落库、以及低估 flag 这条承重链零 proof 覆盖。
 * 本证明用带 costPolicy 的 fake model 跑真实 invoke,断言三条:
 *  (a) 成功调用:ai_invocation_trace.estimate_input_tokens 落库 = 估算值(且 input_tokens 落库 = 供应商上报,配对完整);
 *  (b) 低估:providerInputTokens > estimateInputTokens → model_estimate_underestimated_total 计数 +1(绝不静默);
 *  (c) 非法估算(0):validUsage fail-closed → 结果 external_outcome_unknown,不落 trace(不伪造对账证据)。
 *
 * 安全性:assertIsolatedTestTarget 证明容器 nonce 后才触碰任何表(绝不把 01_schema 的 DROP 施加到开发/生产库)。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import {
  invoke, createMetrics, setMetrics, getMetrics, METRIC,
  type Model, type ModelCostPolicy, type ModelResult, type ModelUsage,
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

// 每次运行唯一后缀,避免与同库其它 proof 的 owner/scope 冲突(同 failover-price-policy 手法)。
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `estimate-threading-${suffix}`;
const SCOPE = `scope-est-${suffix}`;

const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: 'p-est', model: 'm-est', region: 'cn-proof', priceRevision: 'est-r1',
  maxInputTokens: 1000, maxOutputTokens: 500,
};
const Schema = z.object({ answer: z.string().min(1) });

// fake model:execute 直接返回手工捏造的 usage(estimateInputTokens 为固定值),专测「估算值从 usage 穿过 invoke 落库/对账」,
// 不经过 openAICompatibleClient 的 planContextBudget 重算(那是 usage-estimate-threading.proof 的职责)。
const fakeModel = (digest: string, result: ModelResult): Model => ({
  requestDigest: digest,
  call: async () => result,
  prepare: () => ({ ready: true as const, cost: policy, execute: async () => result }),
});

async function main() {
  await assertIsolatedTestTarget(pool);

  // 隔离账本 bootstrap(同 failover-price-policy:01_schema + ai 成本/调用迁移)。
  await pool.query(sql('../../db/sql/01_schema.sql'));
  for (const f of ['0033_ai_cost_governance.sql', '0035_ai_cost_principal_scope.sql', '0036_ai_text_cost_governance.sql', '0037_ai_model_invocation_durable_claim.sql', '0056_model_invocation_reconcile.sql', '0057_model_invocation_cost_scope.sql', '0083_ai_text_cost_price_revision_binding.sql', '0085_ai_model_logical_node_dispatch_slot.sql', '0088_ai_model_invocation_controlled_state_machine.sql', '0119_usage_reconciliation_wiring.sql', '0130_model_invocation_same_key_claim_join.sql']) {
    await pool.query(sql(`../../db/migrations/${f}`));
  }
  // 价格书(provider/model/region/revision 主键)与预算策略;budget_month 由 reserve 按需建(同 failover-price-policy)。
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES('p-est','m-est','cn-proof','est-r1',1000000,2000000,'https://example.test/estimate-threading',clock_timestamp())`,
  );
  await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)`, [SCOPE]);

  // 独立、干净的指标实例:否则本进程单例里的计数器会受其它 proof / 之前断言污染,低估计数不可测。
  setMetrics(createMetrics());

  // (a) 成功调用:estimate=100,provider input=50 → 无低估;trace 落 estimate_input_tokens=100、input_tokens=50。
  {
    const okUsage: ModelUsage = { inputTokens: 50, outputTokens: 20, estimateInputTokens: 100 };
    const key = `estimate-ok:${suffix}`;
    const result = await invoke({
      idempotencyKey: key, schema: Schema, businessValidate: () => null,
      model: fakeModel('a'.repeat(64), { ok: true, raw: { answer: 'ok' }, usage: okUsage }),
    }, pool, OWNER);
    const trace = await pool.query(
      `SELECT estimate_input_tokens, input_tokens, output_tokens FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2`,
      [OWNER, key],
    );
    A('(a) 成功调用:estimate_input_tokens 落库 = 估算值(100)',
      'value' in result && trace.rows[0]?.estimate_input_tokens === 100);
    A('(a) 成功调用:input_tokens 落库 = 供应商上报(50),estimate↔usage 配对完整',
      'value' in result && trace.rows[0]?.input_tokens === 50 && trace.rows[0]?.output_tokens === 20);
  }

  // (b) 低估:provider input=150 > estimate=100 → 调用仍成功,但 model_estimate_underestimated_total 计数 +1(绝不静默)。
  {
    const underUsage: ModelUsage = { inputTokens: 150, outputTokens: 20, estimateInputTokens: 100 };
    const key = `estimate-under:${suffix}`;
    const result = await invoke({
      idempotencyKey: key, schema: Schema, businessValidate: () => null,
      model: fakeModel('b'.repeat(64), { ok: true, raw: { answer: 'ok' }, usage: underUsage }),
    }, pool, OWNER);
    const m = getMetrics().render().match(/model_estimate_underestimated_total\s+(\d+)/);
    A('(b) 低估(provider>estimate):调用仍成功 + model_estimate_underestimated_total 计数 +1',
      'value' in result && Number(m?.[1] ?? 0) === 1);
  }

  // (c) 非法估算(0):validUsage fail-closed → 结果 external_outcome_unknown,且不落 trace(不伪造对账证据)。
  {
    const badUsage: ModelUsage = { inputTokens: 50, outputTokens: 20, estimateInputTokens: 0 };
    const key = `estimate-bad:${suffix}`;
    const result = await invoke({
      idempotencyKey: key, schema: Schema, businessValidate: () => null,
      model: fakeModel('c'.repeat(64), { ok: true, raw: { answer: 'ok' }, usage: badUsage }),
    }, pool, OWNER);
    const trace = await pool.query(
      `SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2`,
      [OWNER, key],
    );
    A('(c) 非法估算(0):fail-closed → external_outcome_unknown 且不落 trace(不伪造对账证据)',
      'error' in result && result.error === 'external_outcome_unknown' && Number(trace.rows[0]?.n) === 0);
  }

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ estimate 穿线 invoke 全链路 + 低估标记 + fail-closed 全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'estimate_threading_invoke_proof_failed');
  await pool.end();
  process.exit(1);
});
