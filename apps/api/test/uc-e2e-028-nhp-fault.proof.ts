/**
 * UC-E2E-028 · FAULT isolated real-PG evidence · NHP-028-FAULT-01 (Line X)
 * GAP-UC028-FAIL-OPEN · UC-028 FAULT trace-fail-open
 *
 * Spec anchor: ai-docs/requirements/use-cases/e2e-scenarios.md UC-E2E-028 —
 *   A1：trace 写失败**不回滚业务事务**（业务照常 completed + 额度 settle confirmed）·
 *   A3 反例守卫：业务真相（钱/状态）写失败**必须阻塞**（fail-closed 保持，Ban 泛化 fail-open）。
 *
 * F1–F5 injection contract（harness nhp-028-fault-01-trace-fail-open.md · 逐字实现）:
 *   F1  FAULT（A1 主证）: DB 层 BEFORE INSERT trigger 使 trace INSERT 必败（scoped · 零产品 seam
 *       冒充 · 不触发模型调用）→ ai-runtime invoke→settle→complete 业务事务不被 trace 失败回滚：
 *       业务终态 completed + 额度 settled 恰一次 + 非 trace 连坐 external_outcome_unknown +
 *       失败 trace 结构化观测（counter + 单行 JSON 日志），不得静默无痕。
 *   F2  NEG（反例守卫）: 同路径注入业务真相写失败（F2a 状态写必败 / F2b 钱写必败）→ 必须阻塞
 *       （fail-closed 保持）：业务不得 completed、钱账不得 confirmed · Ban 把 F2 失败洗成 flake。
 *   F3  positive control: 无注入同路径全绿（trace 成功写入 + 业务 completed + 额度 settled）
 *       → 证明 F1 的失败确由注入引起 · Ban 假绿对照缺失。
 *   F4  NEG（边界/幂等）: F1 注入路径下账面复核：无双扣/无重复入账；额度净变恰一次；同键 replay
 *       命中 cached 不再结算；trace 失败不产生任何替代性扣费。
 *   F5  边界声明: 失败 trace 仅被观测记录，不要求已补写；Ban 宣称 recon 闭环 ·
 *       GAP-UC028-RECON stays gap（A2 不在本刀）。
 *
 * Isolation（三层隔离壳 · 同 uc025:nhp-fault-isolated 先例）:
 *   scripts/run-e2e-isolated.mjs → pnpm -C apps/api prove:uc028-nhp-fault → 本文件
 *   isolated 真 PG（assertIsolatedTestTarget 容器 nonce 实证 + 01_schema + ai 迁移齐跑）·
 *   零 live 模型（fake provider 面 · MODEL_API_KEY/DASHSCOPE_API_KEY 防御性删除并断言缺席）·
 *   DB 层注入不触发任何模型调用 · Ban「不跑 trace」冒充「trace 失败」。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · interview DELETE closed(503)·resume/account DELETE=202 软删受理(purge_pending) ·
 * EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ A2/A3 闭合 · UC-E2E-028 行/FAULT 列保持 gap ·
 * attempts 全记录 · Ban retry-to-green · Ban 改断言迁就结果 · EXIT1 诚实保留 · Ban self-nail
 *
 *   pnpm uc028:nhp-fault:prove
 *   pnpm -C apps/api prove:uc028-nhp-fault   (raw; needs the isolated shell env)
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import {
  invoke, createMetrics, setMetrics, getMetrics, METRIC,
  type Model, type ModelCostPolicy, type ModelResult,
} from '@meetwise/ai-runtime';

const CMD = 'pnpm uc028:nhp-fault:prove';
const GAP_ID = 'GAP-UC028-FAIL-OPEN';
const ATTEMPT_STARTED_AT = new Date().toISOString();
const __dirname = dirname(fileURLToPath(import.meta.url));
// apps/api/test → apps/api → apps → repo root（同 uc-e2e-004 先例的三级上溯）。
const repoRoot = resolve(__dirname, '..', '..', '..');

type Cls = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'ISO' | 'PIN';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) { failures.push({ cls, name }); console.log(`FAIL  [${cls}] ${name}`); }
  else console.log(`PASS  [${cls}] ${name}`);
};

const sql = (rel: string) => readFileSync(resolve(repoRoot, rel), 'utf8');

// 每次运行唯一后缀（同 failover-price-policy / estimate-threading 手法）。
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `uc028-owner-${suffix}`;
const SCOPE = `scope-uc028-${suffix}`;
const K = (k: string) => `uc028-${k}:${suffix}`;

const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: 'p-uc028', model: 'm-uc028', region: 'cn-proof', priceRevision: 'uc028-r1',
  maxInputTokens: 1000, maxOutputTokens: 500,
};
const Schema = z.object({ answer: z.string().min(1) });
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
    'SELECT status, settled_micro_cny, reason_code FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2',
    [SCOPE, key],
  );
  return r.rows[0] as { status: string; settled_micro_cny: number | null; reason_code: string | null } | undefined;
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
    'SELECT status, error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, key],
  );
  return r.rows[0] as { status: string; error_code: string | null } | undefined;
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

(async () => {
  console.log(`UC-E2E-028 NHP-028-FAULT-01 isolated real-PG evidence (${GAP_ID} · Line X)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=202 软删受理(purge_pending)');
  console.log('EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ A2/A3 closed · UC-E2E-028 row/FAULT stay gap · Ban self-nail');
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

  // DBHY-1: sql/01_schema 兼容镜像退役——隔离 runner 预迁移(migrations 单真相,0033-0130 全链),原 bootstrap 重放块移除(断言面不变·同 estimate-threading-invoke 先例)。
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES('p-uc028','m-uc028','cn-proof','uc028-r1',1000000,2000000,'https://example.test/uc028-nhp-fault',clock_timestamp())`,
  );
  await pool.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)', [SCOPE]);

  // 独立、干净的指标实例：计数可测、不受进程内其它来源污染。
  setMetrics(createMetrics());

  // DB 层注入（scoped trigger · 零产品 seam 冒充 · 注入不触发模型调用）：
  //   F1  : ai_invocation_trace BEFORE INSERT —— f1 键 raise（trace INSERT 必败）
  //   F2a : ai_model_invocation BEFORE UPDATE status='succeeded' —— f2a 键 raise（状态真相写必败）
  //   F2b : ai_cost_reservation BEFORE UPDATE status='settled' —— f2b 键 raise（钱真相写必败）
  // 三张表各用独立 trigger 函数：plpgsql 对 NEW.<col> 的字段解析不随 IF 短路，跨表共用会以
  // 42703（record "new" has no field）污染非注入键的 INSERT——attempt-3 的实证教训。
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
  console.log('PIN   GAP-UC028-FAIL-OPEN injection = DB-layer scoped triggers (trace INSERT / model status / cost settle) · zero product seam · zero model call\n');

  // ── F1 FAULT（A1 主证）：trace INSERT 必败 → 业务事务不被回滚 + 失败被结构化观测 ──
  const f1Key = K('f1');
  const f1Calls = { n: 0 };
  const f1Model = fakeModel(OK_RESULT, f1Calls);
  const captured: string[] = [];
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => { captured.push(args.map((a) => (typeof a === 'string' ? a : '')).join('')); };
  let f1: { value?: { answer: string }; error?: string };
  try {
    f1 = await invoke({ idempotencyKey: f1Key, schema: Schema, businessValidate: () => null, model: f1Model, service: 'uc028-fault-probe' }, pool, OWNER);
  } finally {
    console.error = origConsoleError;
  }
  const f1Res = await reservationOf(f1Key);
  const f1Inv = await invocationOf(f1Key);
  const f1Budget = await budgetSettled();
  A('F1', 'trace INSERT 必败注入生效：ai_invocation_trace count=0（f1 键）', (await traceCount(f1Key)) === 0);
  A('F1', '业务事务不被 trace 失败回滚：invoke 返回 value（非 external_outcome_unknown）', 'value' in f1 && f1.value?.answer === 'uc028-ok');
  A('F1', '业务终态 completed：ai_model_invocation.status=succeeded', f1Inv?.status === 'succeeded');
  A('F1', '额度 settle 成功且净变恰一次：reservation settled_micro_cny=90', f1Res?.status === 'settled' && Number(f1Res?.settled_micro_cny) === 90);
  A('F1', '预算账本 settled_micro_cny=90（恰一次入账）', f1Budget === 90);
  A('F1', '模型仅派发一次（无自动重试）', f1Calls.n === 1);
  A('F1', '失败 trace 结构化观测（计数）：ai_trace_persist_failures_total=1（不得静默无痕）',
    metricValue(METRIC.aiTracePersistFailures) === 1);
  const f1LogLine = captured.map((l) => l.trim()).find((l) => l.startsWith('{') && l.includes('ai_trace_persist_failed'));
  let f1Log: Record<string, unknown> | null = null;
  try { f1Log = f1LogLine ? (JSON.parse(f1LogLine) as Record<string, unknown>) : null; } catch { f1Log = null; }
  A('F1', '失败 trace 结构化观测（单行 JSON 日志）：event=ai_trace_persist_failed · idempotencyKey 命中 · pgCode=P0001',
    !!f1Log && f1Log.event === 'ai_trace_persist_failed' && f1Log.idempotencyKey === f1Key
    && f1Log.pgCode === 'P0001' && typeof f1Log.errorName === 'string' && (f1Log.errorName as string).length > 0);
  console.log(`OBSERVATION_LOG_LINE  ${f1LogLine ?? '<missing>'}\n`);

  // ── F2 NEG（反例守卫 · A3 真相面）：业务真相写失败必须阻塞（fail-closed 保持）──
  const f2aKey = K('f2a');
  const f2aCalls = { n: 0 };
  const f2a = await invoke({ idempotencyKey: f2aKey, schema: Schema, businessValidate: () => null, model: fakeModel(OK_RESULT, f2aCalls), service: 'uc028-fault-probe' }, pool, OWNER);
  const f2aRes = await reservationOf(f2aKey);
  const f2aInv = await invocationOf(f2aKey);
  A('F2', 'F2a 状态写必败 → 必须阻塞：invoke 返回 external_outcome_unknown（fail-closed 保持）',
    'error' in f2a && f2a.error === 'external_outcome_unknown');
  A('F2', 'F2a 业务不得 completed：ai_model_invocation.status=unknown（非 succeeded）', f2aInv?.status === 'unknown');
  A('F2', 'F2a 钱账不得 confirmed：reservation status=unknown 且 settled_micro_cny IS NULL',
    f2aRes?.status === 'unknown' && f2aRes?.settled_micro_cny == null);
  A('F2', 'F2a 走原 catch 族收口（语义未动）：error_code=settlement_or_record_failed', f2aInv?.error_code === 'settlement_or_record_failed');
  A('F2', 'F2a 无 trace、无观测误触发（真相失败 ≠ trace 失败）：trace=0 · 计数仍=1',
    (await traceCount(f2aKey)) === 0 && metricValue(METRIC.aiTracePersistFailures) === 1);
  A('F2', 'F2a 无自动重试：模型仅派发一次', f2aCalls.n === 1);

  const f2bKey = K('f2b');
  const f2bCalls = { n: 0 };
  const f2b = await invoke({ idempotencyKey: f2bKey, schema: Schema, businessValidate: () => null, model: fakeModel(OK_RESULT, f2bCalls), service: 'uc028-fault-probe' }, pool, OWNER);
  const f2bRes = await reservationOf(f2bKey);
  const f2bInv = await invocationOf(f2bKey);
  A('F2', 'F2b 钱写必败 → 必须阻塞：invoke 返回 external_outcome_unknown（fail-closed 保持）',
    'error' in f2b && f2b.error === 'external_outcome_unknown');
  A('F2', 'F2b 业务不得 completed：ai_model_invocation.status=unknown（非 succeeded）', f2bInv?.status === 'unknown');
  A('F2', 'F2b 钱账不得 confirmed：reservation status=unknown 且 settled_micro_cny IS NULL',
    f2bRes?.status === 'unknown' && f2bRes?.settled_micro_cny == null);
  A('F2', 'F2b F2 面零 settled 净变：预算 settled 仍=90（Ban 把 fail-open 泛化到真相写）', (await budgetSettled()) === 90);
  A('F2', 'F2b 无 trace、无观测误触发：trace=0 · 计数仍=1',
    (await traceCount(f2bKey)) === 0 && metricValue(METRIC.aiTracePersistFailures) === 1);
  A('F2', 'F2b 无自动重试：模型仅派发一次', f2bCalls.n === 1);

  // ── F3 positive control：无注入同路径全绿 → F1 的失败确由注入引起 ──
  const f3Key = K('f3');
  const f3Calls = { n: 0 };
  const f3 = await invoke({ idempotencyKey: f3Key, schema: Schema, businessValidate: () => null, model: fakeModel(OK_RESULT, f3Calls), service: 'uc028-fault-probe' }, pool, OWNER);
  const f3Res = await reservationOf(f3Key);
  const f3Inv = await invocationOf(f3Key);
  const f3Trace = await pool.query(
    'SELECT input_tokens, output_tokens, service FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, f3Key],
  );
  const f3TraceRow = f3Trace.rows[0] as { input_tokens: number; output_tokens: number; service: string } | undefined;
  A('F3', 'positive control：invoke 成功返回 value', 'value' in f3 && f3.value?.answer === 'uc028-ok');
  A('F3', 'positive control：trace 成功写入（input_tokens=50 · output_tokens=20 · service 命中）',
    Number(f3TraceRow?.input_tokens) === 50 && Number(f3TraceRow?.output_tokens) === 20 && f3TraceRow?.service === 'uc028-fault-probe');
  A('F3', 'positive control：业务 completed（status=succeeded）+ 额度 settled=90',
    f3Inv?.status === 'succeeded' && f3Res?.status === 'settled' && Number(f3Res?.settled_micro_cny) === 90);
  A('F3', 'positive control：预算 settled 累计=180（F1+F3 恰各一次）', (await budgetSettled()) === 180);

  // ── F4 NEG（边界/幂等）：F1 注入路径下账面复核 —— 无双扣/无重复入账/无替代性扣费 ──
  const f4Replay = await invoke({ idempotencyKey: f1Key, schema: Schema, businessValidate: () => null, model: f1Model, service: 'uc028-fault-probe' }, pool, OWNER);
  const f4ResRows = await pool.query(
    'SELECT status, settled_micro_cny FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2',
    [SCOPE, f1Key],
  );
  A('F4', '同键 replay 命中 durable claim 缓存：返回同一 value（不再派发/结算）', 'value' in f4Replay && f4Replay.value?.answer === 'uc028-ok');
  A('F4', '无双扣：replay 后模型仍只真调一次', f1Calls.n === 1);
  A('F4', '无重复入账：f1 键 reservation 恰一行（settled · 90）',
    f4ResRows.rows.length === 1 && f4ResRows.rows[0]?.status === 'settled' && Number(f4ResRows.rows[0]?.settled_micro_cny) === 90);
  A('F4', '无双扣：f1 键 ai_model_invocation 恰一行', (await invocationCount(f1Key)) === 1);
  A('F4', '预算 settled 不变=180（replay 零净变）', (await budgetSettled()) === 180);
  A('F4', '无替代性扣费：trace 失败未转嫁任何 released/unknown 钱记录（f1 键唯一行为 settled）', f4ResRows.rows.length === 1 && f4ResRows.rows[0]?.status === 'settled');

  // ── F5 边界声明：失败 trace 仅被观测记录 · 不要求已补写 · GAP-UC028-RECON stays gap ──
  A('F5', '失败 trace 未被补写（A2 recon 不在本刀）：f1 键 trace 仍=0', (await traceCount(f1Key)) === 0);
  A('F5', '观测不丢失：ai_trace_persist_failures_total 仍=1（失败被持久观测记录）', metricValue(METRIC.aiTracePersistFailures) === 1);
  const invokeSrc = readFileSync(resolve(repoRoot, 'packages/ai-runtime/src/invoke.ts'), 'utf8');
  A('F5', 'A2 recon 不冒充：invoke.ts 无 missing-trace rewrite/backfill/recon 队列符号',
    !/\b(trace_rewrite|rewrite_trace|missing_trace|trace_backfill|trace_reconcil|补写.*trace|trace.*补写)\b/i.test(invokeSrc));
  console.log('PIN   GAP-UC028-RECON stays gap · GAP-UC028-TRUTH-BLOCK-E2E / GAP-UC028-INJECT 仍 open · Ban 宣称 A2 闭环\n');

  // ── PIN：产品 diff 边界机检（C-HA-1 · 供 POST dual 对照）──
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

  console.log('');
  console.log(`CHECKS=${total} FAIL=${failures.length} (${[...new Set(failures.map((f) => f.cls))].join(',') || 'none'})`);
  console.log('NOTE: EXIT0 = F1–F5 全绿（isolated 真 PG · 零 live 模型 · DB 层注入）= NHP-028-FAULT-01 具名真证据 ≠ covered ≠ e2e:isolated suite green ≠ A2/A3 闭合');
  console.log('NOTE: UC-E2E-028 行/FAULT 列保持 gap 措辞 · coveredCount=8 冻结 · GAP-UC028-RECON / TRUTH-BLOCK-E2E / INJECT 仍 open');
  console.log('NOTE: attempts 全记录 · Ban retry-to-green · Ban 改断言迁就结果 · EXIT1 = 诚实保留交协调方另裁');
  console.log(`CMD=${CMD} EXIT=${failures.length === 0 ? 0 : 1}`);
  await pool.end();
  process.exit(failures.length === 0 ? 0 : 1);
})().catch(async (e: unknown) => {
  console.error(e instanceof Error ? (e.stack ?? e.message) : 'uc028_nhp_fault_proof_failed');
  await pool.end().catch(() => undefined);
  process.exit(1);
});
