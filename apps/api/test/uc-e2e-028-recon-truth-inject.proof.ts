/**
 * UC-E2E-028 · 一刀三 case isolated real-PG evidence（INJECT / RECON / TRUTH-BLOCK）
 * GAP-UC028-INJECT（case-① 注入面）· GAP-UC028-RECON e2e 断言半（case-②）·
 * GAP-UC028-TRUTH-BLOCK-E2E（case-③ 同 run 对照）· 零产品码（断言面刀·Ban 触码面）
 *
 * Spec anchor: ai-docs/requirements/use-cases/e2e-scenarios.md UC-E2E-028 三 TC —
 *   TC-trace-fail（A1）: trace 写失败**不回滚业务事务**（业务照常 completed + 额度 settle confirmed）·
 *   TC-recon（A2）: 事后对账：以真相面为差集补写缺失 trace（最终一致）·
 *   TC-truth-block（A3 反例守卫）: 业务真相（钱/状态）写失败**必须阻塞**（fail-closed 保持·
 *   Ban 泛化 fail-open）· 对照断言。REQUEST=ai-docs/delivery/harness/uc028-e2e-REQUEST.md
 *   （§1.2 三 case 定稿 + §9-rev2.1 R1 摘 trigger 前置 + §9-rev2.2 R2 非自建 seed 按臂切分）。
 *
 * case-① INJECT（TC-E2E-028-trace-fail e2e 断言）: DB 层 scoped trigger 三函数三表独立形
 *   （沿 NHP uc-e2e-028-nhp-fault :165-:193 逐形·trace BEFORE INSERT 必败 P0001/状态真相写必败/
 *   钱真相写必败·跨表共函数 42703 教训承登）·uc028-f1:% 键注入 trace 丢失态 → A1 fail-open：
 *   invoke 返回 value ∧ 业务终态 succeeded ∧ 额度 settled 恰一次 ∧ 失败被结构化观测
 *   （ai_trace_persist_failures_total 计数 + 单行 JSON 日志）·夹具自建（case-② 前自摘）。
 * case-② RECON（TC-E2E-028-recon e2e 断言）: 同 run 承接 case-① 丢失态（非自建 seed·R2 主臂）→
 *   摘 trg_uc028_trace_fail + uc028_trace_inject_fail（§9-rev2.1 R1：不摘则回补 INSERT 再 raise→
 *   owner 事务整体回滚→trace_recon_owner_failed 确定性全臂红；摘除生效由「回补恰 1」隐式正控；
 *   两 truth trigger 保持在位）→调真 traceReconTick（../../worker/src/trace-recon.ts 真符号·
 *   沿 uc-e2e-001 :47 跨 app 相对导入先例·不加 @meetwise/worker 依赖）→回补恰 1 + 九列逐列恒等
 *   （沿 worker proof :150 口径：output 含 redacted 标记位+estimate 同源直携）+幂等二次 tick 恰零
 *   零漂 + 水位 gauge 归零 + ai_trace_recon_backfilled_total 恰 +1 + 业务终态/额度面回补前后零漂
 *   +非 success 行不补（failed/unknown 真相行系 db 层独立造源行·沿 worker proof
 *   seedFailedTruth/seedUnknownTruth 形·不经业务 invoke·R2 按臂切分）。
 * case-③ TRUTH-BLOCK（TC-E2E-028-truth-block 对照）: 同注入函数族打真相面两臂（f2a 状态写必败/
 *   f2b 钱写必败）→阻塞断言=invoke 返回 external_outcome_unknown ∧ status=unknown ∧
 *   钱账 settled NULL ∧ 预算零 settled 净变 ∧ catch 族 settlement_or_record_failed 收口；
 *   对照臂（语义核）=同一 run 内聚合双侧事实成布尔对照并断：「trace 写失败 → 业务 completed ∧
 *   额度 confirmed」**且**「真相写失败 → 业务不 completed ∧ 钱账不 confirmed」同时成立
 *   （NHP F1/F2 顺序臂升格为对照结构·防混淆防 fail-open 泛化·反例守卫行逐字承载）。
 *
 * Isolation（三层隔离壳 · 同 uc028:nhp-fault 先例）:
 *   scripts/run-e2e-isolated.mjs → pnpm -C apps/api prove:uc028-recon-truth-inject → 本文件
 *   isolated 真 PG（assertIsolatedTestTarget 容器 nonce 实证 + 全量迁移链）·
 *   零 live 模型（fake provider 面 · MODEL_API_KEY/DASHSCOPE_API_KEY 防御性删除并断言缺席）·
 *   DB 层注入不触发任何模型调用 · Ban「不跑 trace」冒充「trace 失败」。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 ·
 * EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ 三 GAP 翻面（INJECT/RECON/TRUTH-BLOCK-E2E 翻面权
 * 归协调方）· UC-E2E-028 行保持 gap · attempts 全记录 · Ban retry-to-green · Ban 改断言迁就结果 ·
 * EXIT1 诚实保留 · Ban self-nail
 *
 *   pnpm uc028:recon-truth-inject:prove
 *   pnpm -C apps/api prove:uc028-recon-truth-inject   (raw; needs the isolated shell env)
 */
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  asPrincipal, assertIsolatedTestTarget, claimModelInvocation, completeModelInvocation,
  createPool, markModelInvocationDispatched, markModelInvocationUnknown,
} from '@meetwise/db';
import {
  invoke, createMetrics, setMetrics, getMetrics, METRIC,
  type Model, type ModelCostPolicy, type ModelResult,
} from '@meetwise/ai-runtime';
// 跨 app 相对导入先例：uc-e2e-001-nhp-fault.proof.ts:47（../../worker/src/*.ts）·
// 传递依赖已在 apps/api 树·不加 @meetwise/worker 依赖行（§9-rev2.4 R4）。
import { resolveTraceReconConfig, traceReconTick } from '../../worker/src/trace-recon.ts';

const CMD = 'pnpm uc028:recon-truth-inject:prove';
const ATTEMPT_STARTED_AT = new Date().toISOString();
// apps/api/test → apps/api → apps → repo root（同 uc-e2e-001 先例的三级上溯·inline 无 __dirname 变量）。
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

type Cls = 'C1' | 'C2' | 'C3' | 'ISO' | 'PIN';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) { failures.push({ cls, name }); console.log(`FAIL  [${cls}] ${name}`); }
  else console.log(`PASS  [${cls}] ${name}`);
};

// 每次运行唯一后缀（同 nhp-fault / failover-price-policy 手法）。
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `uc028-owner-${suffix}`;
const SCOPE = `scope-uc028-${suffix}`;
const K = (k: string) => `uc028-${k}:${suffix}`;
const PROBE_SERVICE = 'uc028-recon-truth-probe';

const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: 'p-uc028', model: 'm-uc028', region: 'cn-proof', priceRevision: 'uc028-r1',
  maxInputTokens: 1000, maxOutputTokens: 500,
};
const schema = z.object({ answer: z.string().min(1) });
// 固定 usage → settle 金额可精确复核：input 50×1 micro + output 20×2 micro = 90 micro_cny。
const OK_RESULT: ModelResult = { ok: true, raw: { answer: 'uc028-ok' }, usage: { inputTokens: 50, outputTokens: 20 } };

// fake provider 面：零 live、零外呼、零模型调用被注入触发。prepare.execute 路由回 model.call
// （与生产 plan.execute→model.call 同构），使派发计数真实可断言。
const fakeModel = (result: ModelResult, counter: { n: number }): Model => {
  const model: Model = {
    requestDigest: 'a'.repeat(64),
    call: async () => { counter.n++; return result; },
    prepare: () => ({ ready: true as const, cost: policy, execute: (signal?: AbortSignal) => model.call(1, signal) }),
  };
  return model;
};

const pool = createPool();

const reservationOf = async (key: string) => {
  const r = await pool.query(
    `SELECT status, settled_micro_cny AS "settledMicroCny", reason_code AS "reasonCode"
       FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2`,
    [SCOPE, key],
  );
  return r.rows[0] as { status: string; settledMicroCny: number | null; reasonCode: string | null } | undefined;
};
const budgetSettled = async () => {
  const r = await pool.query(
    'SELECT COALESCE(SUM(settled_micro_cny),0)::float8 s FROM ai_cost_budget_month WHERE scope_id=$1',
    [SCOPE],
  );
  return Number(r.rows[0]?.s ?? 0);
};
const invocationOf = async (key: string) => {
  const r = await pool.query(
    'SELECT status, error_code AS "errorCode" FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, key],
  );
  return r.rows[0] as { status: string; errorCode: string | null } | undefined;
};
const invocationCount = async (key: string) => {
  const r = await pool.query(
    'SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, key],
  );
  return Number(r.rows[0]?.n ?? 0);
};
const traceCount = async (key: string) => {
  const r = await pool.query(
    'SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, key],
  );
  return Number(r.rows[0]?.n ?? 0);
};
const metricValue = (name: string) => {
  const m = getMetrics().render().match(new RegExp(`${name}\\s+(\\d+)`));
  return Number(m?.[1] ?? 0);
};

// 九列恒等 oracle（沿 worker proof trace-recon.proof.ts :91-:116 口径）：回补 trace 行的九列
// 逐列等于真相面源列（owner/key/output 含标记位原样/service/input/output/estimate 同源直携/
// latency/request_id），一列不跳。
const nineColumnOracle = async (key: string) => {
  const r = await pool.query(
    `SELECT t.owner_user_id AS "ownerUserId", t.idempotency_key AS "idempotencyKey",
            t.output, t.service, t.input_tokens AS "inputTokens", t.output_tokens AS "outputTokens",
            t.estimate_input_tokens AS "estimateInputTokens", t.latency_ms AS "latencyMs",
            t.request_id AS "requestId",
            i.output AS "truthOutput", i.estimate_input_tokens AS "truthEstimate",
            i.service AS "truthService", i.latency_ms AS "truthLatencyMs", i.request_id AS "truthRequestId"
       FROM ai_invocation_trace t
       JOIN ai_model_invocation i
         ON i.owner_user_id = t.owner_user_id AND i.idempotency_key = t.idempotency_key
      WHERE t.owner_user_id=$1 AND t.idempotency_key=$2`,
    [OWNER, key],
  );
  const row = r.rows[0] as
    | {
      ownerUserId: string; idempotencyKey: string; output: unknown; service: string;
      inputTokens: number | null; outputTokens: number | null; estimateInputTokens: number | null;
      latencyMs: number | null; requestId: string | null;
      truthOutput: unknown; truthEstimate: number | null; truthService: string;
      truthLatencyMs: number | null; truthRequestId: string | null;
    }
    | undefined;
  if (!row) return false;
  return row.ownerUserId === OWNER
    && row.idempotencyKey === key
    && JSON.stringify(row.output) === JSON.stringify(row.truthOutput)
    && row.service === row.truthService && row.service === PROBE_SERVICE
    && Number(row.inputTokens) === 50 && Number(row.outputTokens) === 20
    && row.estimateInputTokens === row.truthEstimate
    && row.latencyMs === row.truthLatencyMs
    && row.requestId === row.truthRequestId && row.requestId === null;
};

// 「非 success 行不补」臂源行（R2：db 层独立造源·不经业务 invoke·沿 worker proof :64-:88 逐形
// =claim→dispatch→complete(error)/markUnknown 真状态机三步）。
const seedFailedTruth = async (key: string) => {
  await asPrincipal(pool, OWNER, async (c) => {
    const claim = await claimModelInvocation(c, {
      owner: OWNER, idempotencyKey: key, requestDigest: 'a'.repeat(64), service: PROBE_SERVICE,
      estimateInputTokens: 50, leaseToken: randomUUID(), leaseSeconds: 60,
    });
    if (claim.action !== 'execute') throw new Error(`test_claim_${claim.action}`);
    if (!await markModelInvocationDispatched(c, OWNER, key, claim.leaseToken)) throw new Error('test_dispatch_failed');
    if (!await completeModelInvocation(c, { owner: OWNER, idempotencyKey: key, error: 'schema_validation_failed' })) {
      throw new Error('test_fail_complete_failed');
    }
  });
};
const seedUnknownTruth = async (key: string) => {
  await asPrincipal(pool, OWNER, async (c) => {
    const claim = await claimModelInvocation(c, {
      owner: OWNER, idempotencyKey: key, requestDigest: 'a'.repeat(64), service: PROBE_SERVICE,
      estimateInputTokens: 50, leaseToken: randomUUID(), leaseSeconds: 60,
    });
    if (claim.action !== 'execute') throw new Error(`test_claim_${claim.action}`);
    if (!await markModelInvocationDispatched(c, OWNER, key, claim.leaseToken)) throw new Error('test_dispatch_failed');
    if (!await markModelInvocationUnknown(c, OWNER, key, 'external_outcome_unknown')) throw new Error('test_unknown_failed');
  });
};

(async () => {
  console.log(`UC-E2E-028 一刀三 case isolated real-PG evidence (INJECT / RECON / TRUTH-BLOCK)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · 公开 DELETE=503');
  console.log('EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ 三 GAP 翻面 · UC-E2E-028 行保持 gap · 翻面权归协调方 · Ban self-nail');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · EXIT1 诚实保留\n`);

  // Ban live（防御性）：fake provider 面之外，删除并断言 live key 缺席（Ban 加载 MODEL_API_KEY）。
  delete process.env.MODEL_API_KEY;
  delete process.env.DASHSCOPE_API_KEY;

  await assertIsolatedTestTarget(pool);
  console.log(`ISO_SHELL  PGPORT=${String(process.env.PGPORT ?? '<unset>')} E2E_ISOLATED=${String(process.env.E2E_ISOLATED ?? '<unset>')} E2E_TEST_CONTAINER=${String(process.env.E2E_TEST_CONTAINER ?? '<unset>')}`);
  A('ISO', 'isolated-env-attested (E2E_ISOLATED=1 + container nonce 实证 + dynamic PGPORT)',
    String(process.env.E2E_ISOLATED) === '1' && String(process.env.PGPORT ?? '').length > 0);
  A('ISO', 'zero-live-model-key-absent (MODEL_API_KEY)', process.env.MODEL_API_KEY === undefined);
  A('ISO', 'zero-live-model-key-absent (DASHSCOPE_API_KEY)', process.env.DASHSCOPE_API_KEY === undefined);

  // 价格与预算夹具（沿 nhp-fault 形·isolated 真 PG·零共享库触）。
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES('p-uc028','m-uc028','cn-proof','uc028-r1',1000000,2000000,'https://example.test/uc028-recon-truth-inject',clock_timestamp())`,
  );
  await pool.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)', [SCOPE]);

  // 独立、干净的指标实例：计数可测、不受进程内其它来源污染（recon tick 经 getMetrics() 同源累加）。
  setMetrics(createMetrics());

  // case-①/③ 共用注入夹具（DB 层 scoped trigger · 零产品 seam 冒充 · 注入不触发模型调用）：
  //   trace : ai_invocation_trace BEFORE INSERT —— f1 键 raise（trace INSERT 必败·case-② 前自摘）
  //   truth : ai_model_invocation BEFORE UPDATE status='succeeded' —— f2a 键 raise（状态真相写必败）
  //   truth : ai_cost_reservation BEFORE UPDATE status='settled' —— f2b 键 raise（钱真相写必败）
  // 三张表各用独立 trigger 函数：plpgsql 对 NEW.<col> 的字段解析不随 IF 短路，跨表共用会以
  // 42703（record "new" has no field）污染非注入键的 INSERT——NHP attempt-3 实证教训承登。
  await pool.query(`
    CREATE OR REPLACE FUNCTION uc028_trace_inject_fail() RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      IF NEW.idempotency_key LIKE 'uc028-f1:%' THEN
        RAISE EXCEPTION 'uc028_injected_trace_insert_failure' USING ERRCODE = 'P0001';
      END IF;
      RETURN NEW;
    END $fn$;
    CREATE OR REPLACE FUNCTION uc028_status_inject_fail() RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      IF NEW.status = 'succeeded' AND NEW.idempotency_key LIKE 'uc028-f2a:%' THEN
        RAISE EXCEPTION 'uc028_injected_truth_status_write_failure' USING ERRCODE = 'P0001';
      END IF;
      RETURN NEW;
    END $fn$;
    CREATE OR REPLACE FUNCTION uc028_money_inject_fail() RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      IF NEW.status = 'settled' AND NEW.idempotency_key LIKE 'uc028-f2b:%' THEN
        RAISE EXCEPTION 'uc028_injected_truth_money_write_failure' USING ERRCODE = 'P0001';
      END IF;
      RETURN NEW;
    END $fn$;
    DROP TRIGGER IF EXISTS trg_uc028_trace_fail ON ai_invocation_trace;
    CREATE TRIGGER trg_uc028_trace_fail BEFORE INSERT ON ai_invocation_trace FOR EACH ROW EXECUTE FUNCTION uc028_trace_inject_fail();
    DROP TRIGGER IF EXISTS trg_uc028_truth_status ON ai_model_invocation;
    CREATE TRIGGER trg_uc028_truth_status BEFORE UPDATE ON ai_model_invocation FOR EACH ROW EXECUTE FUNCTION uc028_status_inject_fail();
    DROP TRIGGER IF EXISTS trg_uc028_truth_money ON ai_cost_reservation;
    CREATE TRIGGER trg_uc028_truth_money BEFORE UPDATE ON ai_cost_reservation FOR EACH ROW EXECUTE FUNCTION uc028_money_inject_fail();
  `);
  console.log('PIN   UC-028 injection fixture = DB-layer scoped triggers (trace INSERT / model status / cost settle) · zero product seam · zero model call\n');

  // ══ case-① INJECT（A1 主证）：trace INSERT 必败注入生效 → 业务事务不被回滚 + 失败被结构化观测 ══
  const f1Key = K('f1');
  const f1Calls = { n: 0 };
  const f1Model = fakeModel(OK_RESULT, f1Calls);
  const captured: string[] = [];
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => { captured.push(args.map((a) => (typeof a === 'string' ? a : '')).join('')); };
  let f1: { value?: { answer: string }; error?: string };
  try {
    f1 = await invoke({ idempotencyKey: f1Key, schema, businessValidate: () => null, model: f1Model, service: PROBE_SERVICE }, pool, OWNER);
  } finally {
    console.error = origConsoleError;
  }
  const f1Res = await reservationOf(f1Key);
  const f1Inv = await invocationOf(f1Key);
  const f1Budget = await budgetSettled();
  const f1TraceLost = (await traceCount(f1Key)) === 0;
  A('C1', '注入生效：ai_invocation_trace count=0（f1 键·trace INSERT 必败）', f1TraceLost);
  A('C1', 'A1 fail-open：invoke 返回 value（业务事务不被 trace 失败回滚·非 external_outcome_unknown）',
    'value' in f1 && f1.value?.answer === 'uc028-ok');
  A('C1', '业务终态 completed：ai_model_invocation.status=succeeded', f1Inv?.status === 'succeeded');
  A('C1', '额度 settle 确认：reservation settled_micro_cny=90（恰一次）',
    f1Res?.status === 'settled' && Number(f1Res?.settledMicroCny) === 90);
  A('C1', '预算账本 settled_micro_cny=90（恰一次入账）', f1Budget === 90);
  A('C1', '模型仅派发一次（注入不触发模型调用·无自动重试）', f1Calls.n === 1);
  A('C1', '失败 trace 结构化观测（计数）：ai_trace_persist_failures_total=1（不得静默无痕）',
    metricValue(METRIC.aiTracePersistFailures) === 1);
  const f1LogLine = captured.map((l) => l.trim()).find((l) => l.startsWith('{') && l.includes('ai_trace_persist_failed'));
  let f1Log: Record<string, unknown> | null = null;
  try { f1Log = f1LogLine ? (JSON.parse(f1LogLine) as Record<string, unknown>) : null; } catch { f1Log = null; }
  A('C1', '失败 trace 结构化观测（单行 JSON 日志不缺席）：event=ai_trace_persist_failed · idempotencyKey 命中 · pgCode=P0001',
    !!f1Log && f1Log.event === 'ai_trace_persist_failed' && f1Log.idempotencyKey === f1Key && f1Log.pgCode === 'P0001');
  console.log(`OBSERVATION_LOG_LINE  ${f1LogLine ?? '<missing>'}\n`);

  // ══ case-② RECON（A2 e2e 断言）：摘 trace 注入 trigger（R1 前置）→ 真 traceReconTick 回补 ══
  // 主臂丢失态承接 case-①（f1 键：succeeded 真相行在而 trace 行缺·业务 invoke+注入产生·非 proof
  // 直造）；「非 success 行不补」臂系 db 层独立造源行（R2 按臂切分）。
  const failedKey = K('failed');
  const unknownKey = K('unknown');
  await seedFailedTruth(failedKey);
  await seedUnknownTruth(unknownKey);

  // §9-rev2.1 R1 前置工序：tick 前摘 trace 注入 trigger（夹具自建自摘·零产品码）；
  // 两 truth trigger（trg_uc028_truth_status / trg_uc028_truth_money）保持在位（case-③ 对照臂依赖）。
  await pool.query(`
    DROP TRIGGER IF EXISTS trg_uc028_trace_fail ON ai_invocation_trace;
    DROP FUNCTION IF EXISTS uc028_trace_inject_fail();
  `);

  // 回补前后业务终态/额度面快照（零漂断言承载）。
  const preTickBudget = await budgetSettled();
  const preTickInvCount = await invocationCount(f1Key);
  const preTickRes = await reservationOf(f1Key);
  const config = resolveTraceReconConfig({});
  const tick1 = await traceReconTick(pool, config);
  A('C2', 'R1 摘除生效正控+回补：真 traceReconTick 恰 1 owner 恰 1 行回补（不摘则 owner 事务回滚→trace_recon_owner_failed 全臂红）',
    tick1.owners === 1 && tick1.backfilled === 1);
  A('C2', '九列逐列恒等：owner/key/output(真相面原样含标记位)/service/input=50/output=20/estimate(同源直携)/latency/request_id',
    await nineColumnOracle(f1Key));
  const postTick1 = {
    budget: await budgetSettled(),
    invCount: await invocationCount(f1Key),
    res: await reservationOf(f1Key),
    inv: await invocationOf(f1Key),
  };
  A('C2', '幂等重放：二次 tick 恰零（零 owner 零回补·行数恒 1）',
    (await (async () => {
      const tick2 = await traceReconTick(pool, config);
      return tick2.owners === 0 && tick2.backfilled === 0 && (await traceCount(f1Key)) === 1;
    })()));
  A('C2', '幂等零漂：二次 tick 后九列重对账仍恒等', await nineColumnOracle(f1Key));
  A('C2', '水位 gauge 归零：ai_trace_recon_missing=0（回补落后水位稳态 0）',
    metricValue(METRIC.aiTraceReconMissing) === 0);
  A('C2', '回补计数：ai_trace_recon_backfilled_total 恰 +1（counter 语义·二次 tick 零新增）',
    metricValue(METRIC.aiTraceReconBackfilled) === 1);
  A('C2', '业务终态回补前后零漂：invocation 恰一行且 status 仍=succeeded',
    postTick1.invCount === 1 && preTickInvCount === 1 && postTick1.inv?.status === 'succeeded');
  A('C2', '额度面回补前后零漂：预算 settled 恒 90 · reservation 恒 settled/90（trace 对账不动钱）',
    preTickBudget === 90 && postTick1.budget === 90
    && preTickRes?.status === 'settled' && Number(preTickRes?.settledMicroCny) === 90
    && postTick1.res?.status === 'settled' && Number(postTick1.res?.settledMicroCny) === 90);
  const nonSuccessAbsent = await pool.query(
    'SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key IN ($2,$3)',
    [OWNER, failedKey, unknownKey],
  );
  A('C2', '非 success 行不补（db 层独立造源 failed/unknown）：trace 恒 0 行·同 tick 主臂恰 1 未被污染',
    Number(nonSuccessAbsent.rows[0]?.n) === 0 && tick1.backfilled === 1);
  console.log('');

  // ══ case-③ TRUTH-BLOCK（A3 反例守卫）：真相写失败必阻塞 + 同 run 双侧布尔对照 ══
  const f2aKey = K('f2a');
  const f2aCalls = { n: 0 };
  const f2a = await invoke({ idempotencyKey: f2aKey, schema, businessValidate: () => null, model: fakeModel(OK_RESULT, f2aCalls), service: PROBE_SERVICE }, pool, OWNER);
  const f2aRes = await reservationOf(f2aKey);
  const f2aInv = await invocationOf(f2aKey);
  A('C3', 'F2a 状态写必败 → 必须阻塞：invoke 返回 external_outcome_unknown（fail-closed 保持）',
    'error' in f2a && f2a.error === 'external_outcome_unknown');
  A('C3', 'F2a 业务不得 completed：ai_model_invocation.status=unknown', f2aInv?.status === 'unknown');
  A('C3', 'F2a 钱账不得 confirmed：reservation status=unknown 且 settled_micro_cny IS NULL',
    f2aRes?.status === 'unknown' && f2aRes?.settledMicroCny == null);
  A('C3', 'F2a catch 族收口（语义未动）：error_code=settlement_or_record_failed', f2aInv?.errorCode === 'settlement_or_record_failed');
  A('C3', 'F2a 预算零 settled 净变：settled 仍=90', (await budgetSettled()) === 90);

  const f2bKey = K('f2b');
  const f2bCalls = { n: 0 };
  const f2b = await invoke({ idempotencyKey: f2bKey, schema, businessValidate: () => null, model: fakeModel(OK_RESULT, f2bCalls), service: PROBE_SERVICE }, pool, OWNER);
  const f2bRes = await reservationOf(f2bKey);
  const f2bInv = await invocationOf(f2bKey);
  A('C3', 'F2b 钱写必败 → 必须阻塞：invoke 返回 external_outcome_unknown（fail-closed 保持）',
    'error' in f2b && f2b.error === 'external_outcome_unknown');
  A('C3', 'F2b 业务不得 completed：ai_model_invocation.status=unknown', f2bInv?.status === 'unknown');
  A('C3', 'F2b 钱账不得 confirmed：reservation status=unknown 且 settled_micro_cny IS NULL',
    f2bRes?.status === 'unknown' && f2bRes?.settledMicroCny == null);
  A('C3', 'F2b 预算零 settled 净变：settled 仍=90（Ban 把 fail-open 泛化到真相写）', (await budgetSettled()) === 90);

  // 对照臂（case-③ 语义核）：同一 run 内聚合双侧事实成布尔对照并断——
  //   trace 写失败（case-① 承接事实）→ 业务 completed ∧ 额度 confirmed（不阻塞）·且·
  //   真相写失败（本 case 两臂）→ 业务不 completed ∧ 钱账不 confirmed（必阻塞）·同时成立。
  const traceFailNotBlocking = f1TraceLost
    && f1Inv?.status === 'succeeded'
    && f1Res?.status === 'settled' && Number(f1Res?.settledMicroCny) === 90;
  const truthFailBlocking = ('error' in f2a && f2a.error === 'external_outcome_unknown')
    && ('error' in f2b && f2b.error === 'external_outcome_unknown')
    && f2aInv?.status === 'unknown' && f2bInv?.status === 'unknown'
    && f2aRes?.settledMicroCny == null && f2bRes?.settledMicroCny == null
    && (await budgetSettled()) === 90;
  A('C3', '对照臂·trace 侧布尔：trace 写失败 → 业务 completed ∧ 额度 confirmed（不阻塞·case-① 事实承接）',
    traceFailNotBlocking);
  A('C3', '对照臂·真相侧布尔：真相写失败 → 业务不 completed ∧ 钱账不 confirmed（必阻塞·两臂合取）',
    truthFailBlocking);
  A('C3', '对照臂·双侧并断：旁路与真相不混淆（fail-open 不泛化·反例守卫同 run 同时成立）',
    traceFailNotBlocking && truthFailBlocking);
  console.log('');

  // ══ PIN：产品 diff 边界机检（C-HA-1 · 供 POST dual 对照·沿 nhp-fault :309-:319 形+recon 面承登）══
  const invokeSrc = readFileSync(resolve(repoRoot, 'packages/ai-runtime/src/invoke.ts'), 'utf8');
  A('PIN', '旁路已接线：if (!error) await persistTraceBestEffort( 在 settle/complete 事务之外',
    /if \(!error\) await persistTraceBestEffort\(/.test(invokeSrc)
    && !/if\s*\(\s*!error\s*\)\s*await\s+persistTrace\s*\(/.test(invokeSrc));
  A('PIN', 'settle 语义不变：await settleAiTextCost( 仍在 settle/complete 事务内', /await settleAiTextCost\(/.test(invokeSrc));
  A('PIN', 'complete 语义不变：completeModelInvocation( + model_invocation_complete_state 仍在',
    /const completed = await completeModelInvocation\(/.test(invokeSrc) && /model_invocation_complete_state/.test(invokeSrc));
  const settleIdx = invokeSrc.indexOf('await settleAiTextCost');
  const catchRegion = settleIdx >= 0 ? invokeSrc.slice(invokeSrc.lastIndexOf('try {', settleIdx), settleIdx + 4500) : '';
  A('PIN', 'catch 族语义不变：settle/complete catch 仍 return external_outcome_unknown（Line C 域未动）',
    /return\s*\{\s*error:\s*'external_outcome_unknown'\s*\}/.test(catchRegion));
  const reconSrc = readFileSync(resolve(repoRoot, 'apps/worker/src/trace-recon.ts'), 'utf8');
  A('PIN', 'recon 面零改承载：trace_recon_owner_failed 确定性抛出语义在位（R1 机理锚）',
    reconSrc.includes("throw new Error('trace_recon_owner_failed')"));
  A('PIN', 'recon 面零改承载：owner 事务整体回滚纪律在位（A failure rolls the whole owner transaction back）',
    /rolls\s+the\s+whole\s+owner\s+(?:\*\s+)?transaction\s+back/.test(reconSrc));
  const migSrc = readFileSync(resolve(repoRoot, 'packages/db/migrations/0207_ai_trace_backfill_scoped.sql'), 'utf8');
  A('PIN', '回补写面零改承载：0207 九列回补+ON CONFLICT DO NOTHING 幂等 arbiter（0001 PK）在位',
    migSrc.includes('ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING'));
  A('PIN', '枚举缝零改承载：22023 限值校验+gateway 函数双 ACL（REVOKE PUBLIC/app_role·GRANT app_gateway_role）在位',
    migSrc.includes('gateway_trace_recon_limit_invalid')
    && migSrc.includes('REVOKE ALL ON FUNCTION gateway_trace_recon_missing_owners(integer) FROM PUBLIC, app_role')
    && migSrc.includes('GRANT EXECUTE ON FUNCTION gateway_trace_recon_missing_owners(integer) TO app_gateway_role'));

  console.log('');
  console.log(`CHECKS=${total} FAIL=${failures.length} (${[...new Set(failures.map((f) => f.cls))].join(',') || 'none'})`);
  console.log('NOTE: EXIT0 = 三 case 全绿（isolated 真 PG · 零 live 模型 · DB 层注入+真 recon tick）≠ covered ≠ e2e:isolated suite green ≠ 三 GAP 翻面');
  console.log('NOTE: UC-E2E-028 行保持 gap 措辞 · coveredCount=8 冻结 · GAP-UC028-INJECT / RECON / TRUTH-BLOCK-E2E 翻面权归协调方');
  console.log('NOTE: attempts 全记录 · Ban retry-to-green · Ban 改断言迁就结果 · EXIT1 = 诚实保留交协调方另裁');
  console.log(`CMD=${CMD} EXIT=${failures.length === 0 ? 0 : 1}`);
  await pool.end();
  process.exit(failures.length === 0 ? 0 : 1);
})().catch(async (e: unknown) => {
  console.error(e instanceof Error ? (e.stack ?? e.message) : 'uc028_recon_truth_inject_proof_failed');
  await pool.end().catch(() => undefined);
  process.exit(1);
});
