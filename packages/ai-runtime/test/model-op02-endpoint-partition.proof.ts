/**
 * AG-08 成本轨⑤ — MODEL-OP-02 准入/熔断/并发分区键随实际端点 · 相位与对表 proof。
 *
 * §2-2 相位臂（scripted model · 零外呼）：plan.admissionEndpoint（prepare 从冻结
 * endpoint profile 注册表服务器派生）→ invoke admit 相位叠加（裁决①(a)）→ 共享准入
 * 分区=实际所选端点；vision / legacy / spec 透传三负臂零漂（registry 回退原值）。
 * §2-1⑧ 对表臂（静态遍历 · typecheck 级）：预绑定端点对 TS 常量对表基数=14 等式、
 * operationId 闭集=wired text 七 op 全覆盖、主备 profile 对唯一派生。
 *
 * G5 N-14 臂（备用端点接线·scripted 双端点 failover 链 · 零外呼）：主端点分区断路器打开 →
 * invoke 在 claim 前改选预绑定备端点并真派发；断路器闭合 → 主端点原值；同键已有备端点 claim
 * 行 → 粘住备端点（不撞 payload_mismatch）；无备用 → model_circuit_open 原值；0231 只读探查
 * 零写、app_role 可执行/PUBLIC 不可执行。修前（无接线）承重臂 EXIT 1，修后 EXIT 0。
 * N14-6（#255 follow-up）：粘性重试时对侧校准预算失败须报 model_context_budget_exceeded
 * （修前误报 idempotency_key_payload_mismatch；修前 EXIT 1 / 修后 EXIT 0 / 反证去掉预算回传 EXIT 1）。
 *
 * 运行方式：pnpm model-op02-endpoint-partition:prove（scripts/run-e2e-isolated.mjs
 * 一次性 pgvector 容器 + 全量迁移）。不 require 任何真实 provider；确定性 stub/seam。
 */
import { z } from 'zod';
import { asPrincipal, assertIsolatedTestTarget, createPool, insertUsageCalibrationFactor, peekModelAdmissionBreaker } from '@meetwise/db';
import {
  invoke, resolveModelAdmissionPartition, failoverModel, modelFor,
  type Model, type ModelClient, type ModelCostPolicy,
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
  process.env.MODEL_NAME = 'deepseek-v4-flash';
  process.env.MODEL_BACKUP_NAME = 'qwen-plus';
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

  await proveN14FailoverWiring();

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ AG-08 端点分域相位+对表 + G5 N-14 备用端点接线全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}
/**
 * G5 N-14：预绑定对表的生产消费方 = invoke claim 前路由。用真 failoverModel + modelFor（与
 * interview-service withFailover 同构），两端点为 scripted ModelClient（prepare 带冻结端点身份
 * 与各自 cost policy；execute 只计数）。断路器状态直写 ai_model_breaker_state（测试库管理连接）。
 */
async function proveN14FailoverWiring() {
  const OP = 'interview.quiz-generation.v1';
  const RECIPE = 'quiz';
  const MODEL_P = `n14-primary-${suffix}`;
  const MODEL_B = `n14-backup-${suffix}`;
  const policyFor = (model: string): ModelCostPolicy => ({ ...policy, model });
  for (const model of [MODEL_P, MODEL_B]) {
    await pool.query(
      `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
       VALUES($1,$2,$3,$4,1000000,2000000,'https://example.test/n14',clock_timestamp())`,
      [PROVIDER, model, REGION, REVISION],
    );
  }
  const calls = { primary: 0, backup: 0 };
  const scripted = (side: 'primary' | 'backup', profile: 'deepseek-cn-public' | 'dashscope-cn-beijing', model: string): ModelClient => {
    const cost = policyFor(model);
    const complete: ModelClient['complete'] = async () => {
      calls[side]++;
      return { ok: true as const, raw: { answer: side }, usage: { inputTokens: 100, outputTokens: 200 } };
    };
    return {
      complete,
      prepare: (req, attempt, signal) => ({
        ready: true as const, execute: (s2?: AbortSignal) => complete(req, attempt, s2 ?? signal), cost,
        admissionEndpoint: { providerAccount: profile, region: 'cn' },
      }),
    };
  };
  const chain = () => modelFor(
    failoverModel([scripted('primary', 'deepseek-cn-public', MODEL_P), scripted('backup', 'dashscope-cn-beijing', MODEL_B)]),
    { service: 'n14-proof', system: 's', userData: 'u' },
  );
  const primaryOnly = () => modelFor(
    failoverModel([scripted('primary', 'deepseek-cn-public', MODEL_P)]),
    { service: 'n14-proof', system: 's', userData: 'u' },
  );
  const setBreaker = async (providerAccount: string, phase: 'open' | 'closed') => {
    await pool.query(
      `INSERT INTO ai_model_breaker_state(provider_account,region,model_or_recipe,operation_id,phase,consecutive_failures,opened_at)
       VALUES($1,'cn',$2,$3,$4,$5,CASE WHEN $4='open' THEN clock_timestamp() END)
       ON CONFLICT (provider_account,region,model_or_recipe,operation_id) DO UPDATE
         SET phase=EXCLUDED.phase, consecutive_failures=EXCLUDED.consecutive_failures, opened_at=EXCLUDED.opened_at,
             half_open_probe_token=NULL, half_open_probe_expires_at=NULL, updated_at=clock_timestamp()`,
      [providerAccount, RECIPE, OP, phase, phase === 'open' ? 5 : 0],
    );
  };
  const run = (key: string, model: Model) => invoke({
    idempotencyKey: key, operation: { id: OP, businessRevision: key },
    schema: ANSWER_SCHEMA, businessValidate: () => null, model,
  }, pool, OWNER);
  const feeRow = async (key: string) => (await pool.query(
    `SELECT provider_account AS "providerAccount",region FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key=$2`, [OWNER, key],
  )).rows[0] as { providerAccount?: string; region?: string } | undefined;
  // claim 状态取 ai_model_invocation；cost 身份（实际所选端点的 model）取同键 ai_cost_reservation（reserve 后才有行）。
  const claimModel = async (key: string) => (await pool.query(
    `SELECT i.status, r.model FROM ai_model_invocation i
       LEFT JOIN ai_cost_reservation r ON r.request_owner_user_id=i.owner_user_id AND r.idempotency_key=i.idempotency_key
      WHERE i.owner_user_id=$1 AND i.idempotency_key=$2`, [OWNER, key],
  )).rows[0] as { model?: string | null; status?: string } | undefined;

  // N14-1（承重）：主端点分区断路器打开 → claim 前改选预绑定备端点并真派发（修前 model_circuit_open）。
  await setBreaker('deepseek-cn-public', 'open');
  const k1 = `n14:open-${suffix}`;
  const before1 = { ...calls };
  const r1 = await run(k1, chain());
  const fee1 = await feeRow(k1);
  const claim1 = await claimModel(k1);
  A('N14-1 主端点熔断打开 → 改选预绑定备端点派发成功（主 0 次·备 1 次·准入/账本分区=备端点·claim 冻结备 cost 身份）',
    'value' in r1 && (r1 as { value: { answer: string } }).value.answer === 'backup'
      && calls.primary === before1.primary && calls.backup === before1.backup + 1
      && fee1?.providerAccount === 'dashscope-cn-beijing' && fee1?.region === 'cn'
      && claim1?.model === MODEL_B && claim1?.status === 'succeeded');
  if (!('value' in r1)) console.log(`      N14-1 实际返回: ${JSON.stringify(r1)}`);

  // N14-2（零回归）：主端点断路器闭合 → 主端点原值（备 0 次）。
  await setBreaker('deepseek-cn-public', 'closed');
  const k2 = `n14:closed-${suffix}`;
  const before2 = { ...calls };
  const r2 = await run(k2, chain());
  const fee2 = await feeRow(k2);
  A('N14-2 主端点断路器闭合 → 仍走主端点（主 1 次·备 0 次·分区=主端点）',
    'value' in r2 && calls.primary === before2.primary + 1 && calls.backup === before2.backup
      && fee2?.providerAccount === 'deepseek-cn-public');

  // N14-3（端点粘性）：主挡路 → 选备 → 备也挡路 → 释放 claim（备 digest）；两侧恢复后同键重试
  // 主 digest 撞墙一 → 粘回备端点重领执行，而不是 idempotency_key_payload_mismatch 终态。
  await setBreaker('deepseek-cn-public', 'open');
  await setBreaker('dashscope-cn-beijing', 'open');
  const k3 = `n14:sticky-${suffix}`;
  const r3a = await run(k3, chain());
  const claim3a = await claimModel(k3);
  await setBreaker('deepseek-cn-public', 'closed');
  await setBreaker('dashscope-cn-beijing', 'closed');
  const before3 = { ...calls };
  const r3b = await run(k3, chain());
  const claim3b = await claimModel(k3);
  A('N14-3 同键已有备端点 claim 行 → 恢复后重试粘住备端点（首轮 model_circuit_open 已释放零预约·重试成功·主 0 次·备 1 次·cost 身份=备）',
    'error' in r3a && r3a.error === 'model_circuit_open' && claim3a?.status === 'claimed' && !claim3a?.model
      && 'value' in r3b && calls.primary === before3.primary && calls.backup === before3.backup + 1
      && claim3b?.model === MODEL_B && claim3b?.status === 'succeeded');
  if (!('value' in r3b)) console.log(`      N14-3 实际返回: a=${JSON.stringify(r3a)} b=${JSON.stringify(r3b)}`);

  // N14-4（fail-closed 原值）：未挂备用（单端点链）+ 主熔断 → model_circuit_open 原值，零外呼。
  await setBreaker('deepseek-cn-public', 'open');
  const k4 = `n14:nobackup-${suffix}`;
  const before4 = { ...calls };
  const r4 = await run(k4, primaryOnly());
  A('N14-4 未挂备用 + 主熔断 → model_circuit_open 原值（零外呼·不臆造备端点）',
    'error' in r4 && r4.error === 'model_circuit_open' && calls.primary === before4.primary && calls.backup === before4.backup);
  await setBreaker('deepseek-cn-public', 'closed');

  // N14-5（0231 只读）：已冷却的 open 行探查=available 且行不被改写（acquire 才会转 half_open）；
  // EXECUTE 面 app_role 可/PUBLIC 不可。
  await pool.query(
    `UPDATE ai_model_breaker_state SET phase='open', opened_at=clock_timestamp() - interval '1 hour'
      WHERE provider_account='deepseek-cn-public' AND region='cn' AND model_or_recipe=$1 AND operation_id=$2`, [RECIPE, OP],
  );
  const peek = await asPrincipal(pool, OWNER, (c) => peekModelAdmissionBreaker(c, OWNER, {
    providerAccount: 'deepseek-cn-public', region: 'cn', modelOrRecipe: RECIPE, operationId: OP,
  }));
  const after = (await pool.query(
    `SELECT phase,half_open_probe_token AS "probeToken" FROM ai_model_breaker_state
      WHERE provider_account='deepseek-cn-public' AND region='cn' AND model_or_recipe=$1 AND operation_id=$2`, [RECIPE, OP],
  )).rows[0] as { phase?: string; probeToken?: string | null } | undefined;
  const acl = (await pool.query(
    `SELECT has_function_privilege('app_role','ai_model_admission_breaker_peek_scoped(text,text,text,text,text)','EXECUTE') AS app,
            has_function_privilege('public','ai_model_admission_breaker_peek_scoped(text,text,text,text,text)','EXECUTE') AS pub`,
  )).rows[0] as { app?: boolean; pub?: boolean } | undefined;
  A('N14-5 0231 只读探查：冷却 open → available 且断路器行零改写（phase 仍 open·无探针）· app_role 可执行/PUBLIC 不可',
    peek === 'available' && after?.phase === 'open' && after?.probeToken === null
      && acl?.app === true && acl?.pub === false);
  await setBreaker('deepseek-cn-public', 'closed');

  // N14-6（#255 follow-up）：粘性重试时对侧校准预算失败，须回传 model_context_budget_exceeded，
  // 而不是原 digest 墙 idempotency_key_payload_mismatch。首轮无因子（fail-closed 放过）切备后
  // 双侧挡路释放 claim；随后只给备模型写入击穿因子，两侧恢复后同键重试：主侧无因子通过预算门，
  // 撞墙后粘回备端点，备侧精化估算击穿 maxInputTokens。
  const SERVICE_BUDGET = 'n14-sticky-budget';
  const ESTIMATE = 800; // policy.maxInputTokens=1000；factor=2 → refined=1600 击穿
  const scriptedEst = (side: 'primary' | 'backup', profile: 'deepseek-cn-public' | 'dashscope-cn-beijing', model: string): ModelClient => {
    const cost = policyFor(model);
    const complete: ModelClient['complete'] = async () => {
      calls[side]++;
      return { ok: true as const, raw: { answer: side }, usage: { inputTokens: 100, outputTokens: 200 } };
    };
    return {
      complete,
      prepare: (req, attempt, signal) => ({
        ready: true as const, execute: (s2?: AbortSignal) => complete(req, attempt, s2 ?? signal), cost,
        admissionEndpoint: { providerAccount: profile, region: 'cn' },
        estimateInputTokens: ESTIMATE,
      }),
    };
  };
  const chainEst = () => modelFor(
    failoverModel([scriptedEst('primary', 'deepseek-cn-public', MODEL_P), scriptedEst('backup', 'dashscope-cn-beijing', MODEL_B)]),
    { service: SERVICE_BUDGET, system: 's', userData: 'u' },
  );
  const runEst = (key: string) => invoke({
    idempotencyKey: key, operation: { id: OP, businessRevision: key },
    schema: ANSWER_SCHEMA, businessValidate: () => null, model: chainEst(),
    service: SERVICE_BUDGET,
  }, pool, OWNER);
  await setBreaker('deepseek-cn-public', 'open');
  await setBreaker('dashscope-cn-beijing', 'open');
  const k6 = `n14:sticky-budget-${suffix}`;
  const r6a = await runEst(k6);
  const claim6a = await claimModel(k6);
  const inserted = await asPrincipal(pool, OWNER, (c) => insertUsageCalibrationFactor(c, {
    owner: OWNER, service: SERVICE_BUDGET, model: MODEL_B, estimator: 'utf8-bytes-v1',
    factorVersion: `utf8-bytes-v1.calibration-v1.${'a'.repeat(64)}`,
    factor: 2, rawMaxRatio: 2, safetyMargin: 0, observationCount: 1, hasUnderEstimate: false,
  }));
  if (!inserted) throw new Error('n14-6 calibration factor insert failed');
  await setBreaker('deepseek-cn-public', 'closed');
  await setBreaker('dashscope-cn-beijing', 'closed');
  const before6 = { ...calls };
  const r6b = await runEst(k6);
  const claim6b = await claimModel(k6);
  A('N14-6 粘性重试对侧校准预算失败 → model_context_budget_exceeded（非 idempotency_key_payload_mismatch；零外呼；claim 仍为已释放零预约）',
    'error' in r6a && r6a.error === 'model_circuit_open' && claim6a?.status === 'claimed' && !claim6a?.model
      && 'error' in r6b && r6b.error === 'model_context_budget_exceeded'
      && calls.primary === before6.primary && calls.backup === before6.backup
      && claim6b?.status === 'claimed' && !claim6b?.model);
  if (!('error' in r6b) || r6b.error !== 'model_context_budget_exceeded') {
    console.log(`      N14-6 实际返回: a=${JSON.stringify(r6a)} b=${JSON.stringify(r6b)}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
