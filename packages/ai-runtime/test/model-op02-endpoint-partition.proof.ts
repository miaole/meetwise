/**
 * AG-08 成本轨⑤ — MODEL-OP-02 准入/熔断/并发分区键随实际端点 · 相位与对表 proof。
 *
 * §2-2 相位臂（scripted model · 零外呼）：plan.admissionEndpoint（prepare 从冻结
 * endpoint profile 注册表服务器派生）→ invoke admit 相位叠加（裁决①(a)）→ 共享准入
 * 分区=实际所选端点；vision / legacy / spec 透传三负臂零漂（registry 回退原值）。
 * §2-1⑧ 对表臂（静态遍历 · typecheck 级）：预绑定端点对 TS 常量对表基数=14 等式、
 * operationId 闭集=wired text 七 op 全覆盖、主备 profile 对唯一派生。
 *
 * 运行方式：pnpm model-op02-endpoint-partition:prove（scripts/run-e2e-isolated.mjs
 * 一次性 pgvector 容器 + 全量迁移）。不 require 任何真实 provider；确定性 stub/seam。
 */
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import {
  invoke, resolveModelAdmissionPartition,
  type Model, type ModelCostPolicy,
} from '../src/index.ts';
import { withAdmissionEndpointPartition } from '../src/model-admission.ts';
import {
  MODEL_COST_FAILOVER_PREBOUND_ENDPOINT_KEYS, MODEL_OPERATION_REGISTRY, preboundCostFailoverProfiles,
} from '../src/model-operation-registry.ts';
import { openAICompatibleClient } from '../src/model-client.ts';
import { resolveTextBackupEndpointConfig, resolveTextEndpointConfig } from '../src/text-endpoint-config.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const OWNER = 'ep-partition-owner';
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const SCOPE = `ep-scope-${suffix}`;
const PROVIDER = `ep-provider-${suffix}`;
const MODEL = `ep-model-${suffix}`;
const REGION = 'cn-proof';
const REVISION = 'ep-r1';
const ANSWER_SCHEMA = z.object({ answer: z.string().min(1) });

/** 计费策略（provider/model/region 进 ai_cost_price_book；scope 进 ai_cost_budget_policy）。 */
const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: PROVIDER, model: MODEL, region: REGION, priceRevision: REVISION,
  maxInputTokens: 1000, maxOutputTokens: 500,
};

/** 计费 Model：prepare 返回 cost policy（可选端点身份）+ 脚本化结果并计数（确定性 stub）。 */
function endpointBillable(
  result: ReturnType<Model['call']>, calls: { n: number },
  admissionEndpoint?: { providerAccount: string; region: string },
): Model {
  return {
    requestDigest: 'e'.repeat(64),
    async call() { calls.n++; return result; },
    prepare() { return { ready: true as const, execute: () => this.call(1), cost: policy, admissionEndpoint }; },
  };
}

async function main() {
  await assertIsolatedTestTarget(pool);

  // ── ⑧ 对表臂（静态遍历 · 先跑，零 DB 依赖）：预绑定端点对 TS 常量对表（裁决③(b)）。 ──
  const keys = MODEL_COST_FAILOVER_PREBOUND_ENDPOINT_KEYS;
  A('对表基数=14 等式（七 text op × 主/备两侧各一行）', keys.length === 14);
  const distinctOps = [...new Set(keys.map((k) => k.operationId))].sort();
  const wiredChatOps = MODEL_OPERATION_REGISTRY.filter((d) => d.wired && d.inputKind === 'chat')
    .map((d) => d.operationId).sort();
  A('对表 operationId 闭集=wired text 七 op 全覆盖（零缺零多）',
    distinctOps.length === 7 && wiredChatOps.length === 7 && distinctOps.join(',') === wiredChatOps.join(','));
  A('对表 profile 闭集=主备两 profile·(profile×operation_id) 全表唯一',
    keys.every((k) => k.profile === 'deepseek-cn-public' || k.profile === 'dashscope-cn-beijing')
      && new Set(keys.map((k) => `${k.profile}:${k.operationId}`)).size === 14);
  const sevenOps = ['interview.competency-planning.v1', 'interview.question-generation.v1', 'interview.answer-scoring.v1',
    'interview.quiz-generation.v1', 'resume.diagnosis.v1', 'report.narrative.v1', 'job.route-classify.v1'];
  A('preboundCostFailoverProfiles：七 op 主备对唯一派生 + vision/未知 op 不在对表（undefined）',
    sevenOps.every((id) => {
      const pair = preboundCostFailoverProfiles(id);
      return pair?.primary === 'deepseek-cn-public' && pair?.backup === 'dashscope-cn-beijing';
    })
      && preboundCostFailoverProfiles('resume.ocr.v1') === undefined
      && preboundCostFailoverProfiles('proof.unknown.v1') === undefined);
  const registryPartition = resolveModelAdmissionPartition({ operation: { id: 'interview.answer-scoring.v1', businessRevision: 'ep' } })!;
  A('叠加纯函数：undefined 身份 → 原分区零漂 + 端点身份 → 仅 providerAccount|region 两维改写',
    withAdmissionEndpointPartition(registryPartition, undefined) === registryPartition
      && JSON.stringify(withAdmissionEndpointPartition(registryPartition, { providerAccount: 'dashscope-cn-beijing', region: 'cn' }))
        === JSON.stringify({ ...registryPartition, providerAccount: 'dashscope-cn-beijing', region: 'cn' }));

  // ── 预置：计费价格表 + 项目预算（billed invoke 用）。 ──────────────────────────
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,$4,1000000,2000000,'https://example.test/ep-partition',clock_timestamp())`,
    [PROVIDER, MODEL, REGION, REVISION],
  );
  await pool.query(
    `INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1000000,true)`, [SCOPE],
  );

  // ── ⑧ 补臂：0200 种子 14 行在库（profile id×operation_id 闭集·allowed）。 ──────
  const seedRows = await pool.query(
    `SELECT count(*)::int n FROM ai_model_admission_policy
     WHERE region='cn' AND provider_account IN ('deepseek-cn-public','dashscope-cn-beijing') AND admission_status='allowed'`,
  );
  A('0200 主备端点种子 14 行 allowed 在库（并发 4/阈值 5/冷却 30000 原值）',
    Number(seedRows.rows[0]?.n) === 14
      && (await pool.query(
        `SELECT count(*)::int n FROM ai_model_admission_policy
         WHERE region='cn' AND provider_account IN ('deepseek-cn-public','dashscope-cn-beijing')
           AND admission_status='allowed' AND max_concurrency=4 AND breaker_threshold=5 AND breaker_cooldown_ms=30000`,
      )).rows[0]?.n === 14);

  // ── §2-2① 相位臂：operation-scoped + plan 端点身份=备 profile → 共享准入收到备分区。 ──
  // 观测点=ai_model_fee_ledger 四字段 partition（record 与 acquire 同一 lease.partition）。
  const backupCalls = { n: 0 };
  const backupResult = await invoke({
    idempotencyKey: `ep:backup-${suffix}`, operation: { id: 'interview.competency-planning.v1', businessRevision: `ep:backup-${suffix}` },
    schema: ANSWER_SCHEMA, businessValidate: () => null,
    model: endpointBillable(Promise.resolve({ ok: true as const, raw: { answer: 'ok' }, usage: { inputTokens: 100, outputTokens: 200 } }), backupCalls,
      { providerAccount: 'dashscope-cn-beijing', region: 'cn' }),
  }, pool, OWNER);
  const backupFee = await pool.query(
    `SELECT provider_account,region,model_or_recipe,operation_id FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key=$2`,
    [OWNER, `ep:backup-${suffix}`],
  );
  A('plan 端点身份=备 profile → 准入/账本分区=备端点（providerAccount|region 两维随端点）',
    'value' in backupResult && backupCalls.n === 1
      && backupFee.rows[0]?.provider_account === 'dashscope-cn-beijing' && backupFee.rows[0]?.region === 'cn'
      && backupFee.rows[0]?.model_or_recipe === 'planner' && backupFee.rows[0]?.operation_id === 'interview.competency-planning.v1');

  // ── §2-2② 相位臂：plan 无端点身份（legacy scripted）→ registry 回退值分区原行为。 ──
  const legacyCalls = { n: 0 };
  const legacyResult = await invoke({
    idempotencyKey: `ep:legacy-${suffix}`, operation: { id: 'interview.competency-planning.v1', businessRevision: `ep:legacy-${suffix}` },
    schema: ANSWER_SCHEMA, businessValidate: () => null,
    model: endpointBillable(Promise.resolve({ ok: true as const, raw: { answer: 'ok' }, usage: { inputTokens: 100, outputTokens: 200 } }), legacyCalls),
  }, pool, OWNER);
  const legacyFee = await pool.query(
    `SELECT provider_account,region FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key=$2`,
    [OWNER, `ep:legacy-${suffix}`],
  );
  A('plan 无端点身份 → registry 回退分区原值零漂（dashscope-main/cn-beijing）',
    'value' in legacyResult && legacyCalls.n === 1
      && legacyFee.rows[0]?.provider_account === 'dashscope-main' && legacyFee.rows[0]?.region === 'cn-beijing');

  // ── §2-2③ 相位负臂：spec 透传端点身份不达分区（分区派生仍服务器派生·绝不 caller 供）。 ──
  const smuggledCalls = { n: 0 };
  const smuggledSpec = {
    idempotencyKey: `ep:smuggled-${suffix}`, operation: { id: 'interview.competency-planning.v1', businessRevision: `ep:smuggled-${suffix}` },
    schema: ANSWER_SCHEMA, businessValidate: () => null,
    model: endpointBillable(Promise.resolve({ ok: true as const, raw: { answer: 'ok' }, usage: { inputTokens: 100, outputTokens: 200 } }), smuggledCalls),
    admissionEndpoint: { providerAccount: 'dashscope-cn-beijing', region: 'cn' },
  } as unknown as Parameters<typeof invoke>[0];
  const smuggledResult = await invoke(smuggledSpec, pool, OWNER);
  const smuggledFee = await pool.query(
    `SELECT provider_account,region FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key=$2`,
    [OWNER, `ep:smuggled-${suffix}`],
  );
  A('spec 透传端点身份不达分区（负臂）：分区仍 registry 回退原值',
    'value' in smuggledResult && smuggledCalls.n === 1
      && smuggledFee.rows[0]?.provider_account === 'dashscope-main' && smuggledFee.rows[0]?.region === 'cn-beijing');

  // ── §2-2④ vision 负臂（factory 级·零外呼）：cfg.vision===true 的 plan 不携带端点身份。 ──
  const primaryPlan = await Promise.resolve(openAICompatibleClient({ env: {} }).prepare!({ service: 'ep-proof', system: 's', userData: 'u' }, 1));
  const backupPlan = await Promise.resolve(openAICompatibleClient({ backup: true, env: {} }).prepare!({ service: 'ep-proof', system: 's', userData: 'u' }, 1));
  const visionPlan = await Promise.resolve(openAICompatibleClient({ vision: true, env: {} }).prepare!({ service: 'ep-proof', system: 's', userData: 'u' }, 1));
  A('vision===true plan 不携带端点身份（vision 先判·registry 派生分区零漂）',
    visionPlan.ready === true && visionPlan.admissionEndpoint === undefined);
  A('text 双 profile 族 plan 携带身份：主=resolveTextEndpointConfig().profile·备=resolveTextBackupEndpointConfig().profile·region=cn',
    primaryPlan.ready === true && primaryPlan.admissionEndpoint?.providerAccount === resolveTextEndpointConfig().profile
      && primaryPlan.admissionEndpoint?.region === 'cn'
      && backupPlan.ready === true && backupPlan.admissionEndpoint?.providerAccount === resolveTextBackupEndpointConfig().profile
      && backupPlan.admissionEndpoint?.region === 'cn'
      && primaryPlan.admissionEndpoint?.providerAccount !== backupPlan.admissionEndpoint?.providerAccount);

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ AG-08 端点分域相位+对表全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
