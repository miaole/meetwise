/**
 * AG-17 结构化输出观测诚实化 proof（span 档名 schema_retry → schema_invalid·零行为变更）。
 *
 * 判词：结构化输出校验失败是确定性失败（本层零自动重试·Billable external attempts are never
 * automatically retried），旧档名暗示「将重试」与实现矛盾。本刀纯改名观测标签：七值联合体
 * 五值→同名换一（零增零删），结算/熔断/账本/幂等链路零触（照常计费语义原样保留）。
 *
 * 注入点：本地 http 脚本 provider（NODE_ENV=test + MODEL_TEST_TRANSPORT_OVERRIDES=1·
 * ag-b-classify 同形制）+ 真实隔离 PG 全链 invoke。零真实 provider 外呼（est live=0）。
 *
 * 四臂：
 *  A（承重）：provider 返 HTTP 200+usage 但缺 schema 必填字段 → invoke 返 schema_validation_failed
 *    ·recording tracer 恰记 outcome='schema_invalid'（旧档名零命中）·fee ledger=settled 结算额>0。
 *  B：businessValidate 不过 → business_error 档名原值（三元臂回归）。
 *  C（机械钉）：静态读 trace.ts+invoke.ts 双文件源——旧档名双文件零命中+schema_invalid 于
 *    trace.ts 恰一命中+七值联合零增零删（六值原样）+invoke.ts 三落点（注释/known_executed 臂/
 *    三元臂）改名后零旧值。
 *  D：ok 路径 → ok 档名原值（正向回归）。
 */
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import { invoke, modelFor, openAICompatibleClient, recordingTracer, setTracer, type ModelCostPolicy } from '../src/index.ts';

process.env.NODE_ENV = 'test';
process.env.MODEL_TEST_TRANSPORT_OVERRIDES = '1';   // 本地 http loopback 脚本 provider 缝（context-stress 同源）

const pool = createPool();
const tracer = recordingTracer();
setTracer(tracer);
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const section = (title: string) => console.log(`\n──────── ${title} ────────`);
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `ag17-owner-${suffix}`;
const SCOPE = `ag17-scope-${suffix}`;
const PROVIDER = `ag17-provider-${suffix}`;
const MODEL = 'ag17-echo';
const REGION = 'cn-proof';
const REVISION = 'ag17-r1';
// 旧档名不落本文件词面（词面运行时组装）——改名后产品码面零旧值，proof 自身同守。
const priorOutcome = ['schema', 'retry'].join('_');
const answerSchema = z.object({ answer: z.string().min(1) });

const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: PROVIDER, model: MODEL, region: REGION, priceRevision: REVISION,
  maxInputTokens: 1000, maxOutputTokens: 500,
  contextWindowTokens: 2000, contextEstimator: 'utf8-bytes-v1', contextSafetyMarginTokens: 64,
};

/** 脚本 provider：按 mode 返回固定 200 形状（ag-b-classify startScriptedProvider 同形制·确定性零外呼）。
 *  供应商线格式字段名（snake_case）以原始 JSON 串承载——字面量串不属属性命名位（lint 零新增）。 */
type Mode = 'schemafieldmissing' | 'ok';
let mode: Mode = 'ok';
function startScriptedProvider(): Promise<{ port: number; close: () => Promise<void> }> {
  const server = http.createServer((_request, response) => {
    const body = mode === 'schemafieldmissing'
      // HTTP 200 + 完整 usage + 合法 JSON，但缺 schema 必填字段 answer（双校验 schema 阶段失败路径）。
      ? '{"choices":[{"message":{"content":"{\\"unrelated\\":\\"value\\"}"}}],"usage":{"prompt_tokens":101,"completion_tokens":37}}'
      : '{"choices":[{"message":{"content":"{\\"answer\\":\\"hello\\"}"}}],"usage":{"prompt_tokens":303,"completion_tokens":44}}';
    response.setHeader('content-type', 'application/json');
    response.writeHead(200);
    response.end(body);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
    port: (server.address() as { port: number }).port,
    close: () => new Promise<void>((done) => server.close(() => done())),
  })));
}

const REQUEST = { service: 'ag17.proof', system: 'ag17 档名观测 proof（评估官）', userData: 'proof-payload' };

async function feeRow(key: string) {
  return pool.query<{ feeStatus: string; settledMicroCny: string | null; inputTokens: number | null; outputTokens: number | null }>(
    'SELECT fee_status AS "feeStatus",settled_micro_cny::text AS "settledMicroCny",input_tokens AS "inputTokens",output_tokens AS "outputTokens" FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, key],
  );
}
async function invocationRow(key: string) {
  return pool.query<{ status: string; errorCode: string | null }>(
    'SELECT status,error_code AS "errorCode" FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, key],
  );
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,$4,1000000,1000000,'https://example.test/ag17',clock_timestamp())`,
    [PROVIDER, MODEL, REGION, REVISION],
  );
  await pool.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1000000,true)', [SCOPE]);

  const echo = await startScriptedProvider();
  const client = openAICompatibleClient({ baseUrl: `http://127.0.0.1:${echo.port}`, apiKey: 'test', model: MODEL, costPolicy: policy });
  const arm = async (key: string) => invoke({
    idempotencyKey: key, operation: { id: 'interview.answer-scoring.v1', businessRevision: `ag17:${key}` },
    schema: answerSchema, businessValidate: () => null, model: modelFor(client, REQUEST),
  }, pool, OWNER);

  // ── A（承重）：HTTP 200+usage 但缺 schema 必填字段 → schema_validation_failed·恰记 schema_invalid·照常计费。 ──
  section('A. schema 校验失败 → 档名 schema_invalid（观测诚实化承重臂·计费语义原样）');
  mode = 'schemafieldmissing';
  tracer.spans.length = 0;
  const aKey = `ag17:a:${suffix}`;
  const aOutcome = await arm(aKey);
  const aFee = (await feeRow(aKey)).rows[0];
  const aInv = (await invocationRow(aKey)).rows[0];
  A('invoke 返回 schema_validation_failed（确定性失败码原值·非 unknown）',
    'error' in aOutcome && aOutcome.error === 'schema_validation_failed');
  A('recording tracer 恰记 1 条 span 且 outcome=schema_invalid（旧档名零命中）',
    tracer.spans.length === 1 && tracer.spans[0]?.outcome === ('schema_invalid' as const)
      && tracer.spans.every((s) => s.outcome !== (priorOutcome as never)));
  A('账本 fee ledger=settled·结算额>0·真实 token(101/37)入账（照常计费语义原样保留）',
    aFee?.feeStatus === 'settled' && aFee.settledMicroCny !== null && Number(aFee.settledMicroCny) > 0
      && aFee.inputTokens === 101 && aFee.outputTokens === 37);
  A('invocation=failed·error_code=schema_validation_failed（settled-failed 先例投影零漂）',
    aInv?.status === 'failed' && aInv?.errorCode === 'schema_validation_failed');

  // ── B：businessValidate 不过 → business_error 档名原值（三元臂回归）。 ──
  section('B. businessValidate 不过 → business_error 原值（:1203 三元臂回归）');
  mode = 'ok';
  tracer.spans.length = 0;
  const bKey = `ag17:b:${suffix}`;
  const bOutcome = await invoke({
    idempotencyKey: bKey, operation: { id: 'interview.answer-scoring.v1', businessRevision: `ag17:${bKey}` },
    schema: answerSchema, businessValidate: () => 'ag17-biz-reject', model: modelFor(client, REQUEST),
  }, pool, OWNER);
  A('invoke 返回 business:ag17-biz-reject（reason 可读性分离面原值）',
    'error' in bOutcome && bOutcome.error === 'business:ag17-biz-reject');
  A('恰记 1 条 span 且 outcome=business_error（同族其余档零触）',
    tracer.spans.length === 1 && tracer.spans[0]?.outcome === 'business_error');

  // ── C（机械钉）：静态读 trace.ts+invoke.ts 双文件源（§9-rev.7 双文件零命中断言）。 ──
  section('C. 静态机械钉：trace.ts+invoke.ts 双文件旧档名零命中·七值联合零增零删');
  const traceSrc = readFileSync(new URL('../src/trace.ts', import.meta.url), 'utf8');
  const invokeSrc = readFileSync(new URL('../src/invoke.ts', import.meta.url), 'utf8');
  const traceLines = traceSrc.split('\n');
  const invokeLines = invokeSrc.split('\n');
  const count = (src: string, needle: string) => src.split(needle).length - 1;
  A('trace.ts 联合体七成员逐行原样（:6 声明+:7-13 七值·六值枚举原样不变·schema 臂换名零增零删）',
    traceLines[5]?.trim() === 'export type ModelCallOutcome ='
    && traceLines[6]?.trim() === "| 'cached'                 // 幂等命中,未真打模型"
    && traceLines[7]?.trim() === "| 'ok'                     // 双校验通过"
    && traceLines[8]?.trim() === "| 'transient_retry'        // 瞬时失败,将重试"
    && traceLines[9]?.trim().startsWith("| 'schema_invalid'") === true && traceLines[9]?.includes('确定性失败') === true
    && traceLines[10]?.trim() === "| 'business_error'         // 业务校验失败(确定性错,不重试)"
    && traceLines[11]?.trim() === "| 'deterministic_refusal'  // 模型确定性拒绝(不重试)"
    && traceLines[12]?.trim() === "| 'exhausted';             // 重试封顶仍失败");
  A('trace.ts 旧档名零命中+schema_invalid 恰一命中（联合体唯一落点）',
    count(traceSrc, priorOutcome) === 0 && count(traceSrc, 'schema_invalid') === 1);
  A('invoke.ts 旧档名双文件零命中（注释/known_executed 臂/三元臂三落点全改·零消费方残留）',
    count(invokeSrc, priorOutcome) === 0);
  A('invoke.ts :1082 注释同步 schema_invalid 档（保留「允许换 revision 重试·不重试同 key」原语义句）',
    invokeLines[1081]?.includes('schema_invalid 档') === true
      && invokeLines[1081]?.includes('允许换 revision 重试') === true
      && invokeLines[1081]?.includes('不重试同 key') === true);
  A('invoke.ts :1083 known_executed 臂 span 字面量=schema_invalid 原行形',
    invokeLines[1082] === `      span(1, 'schema_invalid', latencyMs, settledUsage);`);
  A('invoke.ts :1203 三元臂 else 支=schema_invalid 原行形（business_error 支零触）',
    invokeLines[1202] === `    span(1, error.startsWith('business:') ? 'business_error' : 'schema_invalid', latencyMs, settledUsage);`);
  A('invoke.ts schema_invalid 计数恰 3（注释 1+字面量 2·恰等发射位）',
    count(invokeSrc, 'schema_invalid') === 3);

  // ── D：ok 路径 → ok 档名原值（正向回归）。 ──
  section('D. ok 路径 → ok 原值（正向回归）');
  tracer.spans.length = 0;
  const dKey = `ag17:d:${suffix}`;
  const dOutcome = await arm(dKey);
  A('invoke 成功返回 value·恰记 1 条 span 且 outcome=ok',
    'value' in dOutcome && dOutcome.value.answer === 'hello'
      && tracer.spans.length === 1 && tracer.spans[0]?.outcome === 'ok');

  await echo.close();
  console.log(failures === 0
    ? '\n✓ AG-17 观测诚实化：schema_invalid 档名四臂全部通过（隔离库真迁移链·零外呼）'
    : `\n✗ ${failures} 项失败`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'ag17_schema_span_proof_failed');
  await pool.end();
  process.exit(1);
});
