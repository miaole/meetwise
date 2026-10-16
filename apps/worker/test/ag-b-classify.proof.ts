/**
 * AG 修复轨刀 B proof（AG-06 确定性失败结算分类 + AG-14 解析层折叠）。
 *
 * 注入点（§8 裁决①）：本地 http 脚本 provider（沿 context-stress.proof.ts :35/:146/:148 既有缝
 * NODE_ENV=test + MODEL_TEST_TRANSPORT_OVERRIDES=1）+ 真实隔离 PG 投影（model-op 系低权
 * principal 形）。零真实 provider 外呼（est live=0）。
 *
 * 断言族：
 *  A. 客户端级分类（修法①②③④·ModelResult 形状）：坏 JSON/空 content/截断/字段缺失/整体缺失。
 *  B. 全链 invoke ①（§2-①臂一）：坏 JSON+usage → known_executed → settled-failed 先例形
 *     （钱 settled 真实 token·invocation failed 确定性码·breaker success 不计熔断）。
 *  C. 全链 invoke ②（臂二）：finish_reason='length' 截断 → 同上+截断码。
 *  D. 全链 invoke ③（臂三·AG-14）：usage 缺字段 → 按上限补齐打标 usage_missing·绝不 0·配对剔除。
 *  E. 对照臂：好输出+真实 usage → settled 成功 + 配对在册（校准证据不受本刀影响）。
 *  F. 归并臂（修法④ Clause B）：usage 整体缺失+好输出 → 既有 provider_usage_invalid 臂
 *     （unknown+breaker success）不新造语义。
 *  G. 网络层反向臂（§2-①臂四）：5xx → 仍 unknown + breaker failure（状态机 :33 反向断言）。
 */
import http from 'node:http';
import { z } from 'zod';
import { asPrincipal, assertIsolatedTestTarget, createPool, listUsageCalibrationPairs } from '@meetwise/db';
import { invoke, modelFor, openAICompatibleClient, type ModelCostPolicy, type ModelResult } from '@meetwise/ai-runtime';

process.env.NODE_ENV = 'test';
process.env.MODEL_TEST_TRANSPORT_OVERRIDES = '1';   // 本地 http loopback 脚本 provider 缝（context-stress :146 同源）

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const section = (title: string) => console.log(`\n──────── ${title} ────────`);
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `ag-b-owner-${suffix}`;
const SCOPE = `ag-b-scope-${suffix}`;
const PROVIDER = `ag-b-provider-${suffix}`;
const MODEL = 'ag-b-echo';
const REGION = 'cn-proof';
const REVISION = 'ag-b-r1';
const Schema = z.object({ answer: z.string().min(1) });

const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: PROVIDER, model: MODEL, region: REGION, priceRevision: REVISION,
  maxInputTokens: 1000, maxOutputTokens: 500,
  contextWindowTokens: 2000, contextEstimator: 'utf8-bytes-v1', contextSafetyMarginTokens: 64,
};

/** 脚本 provider：按 mode 返回固定 200/500 形状（context-stress startEcho 同形制·确定性零外呼）。 */
type Mode = 'badjson' | 'empty' | 'truncated' | 'fieldmissing' | 'nousage_badjson' | 'nousage_ok' | 'ok' | 'fivehundred';
let mode: Mode = 'ok';
function startScriptedProvider(): Promise<{ port: number; close: () => Promise<void> }> {
  const server = http.createServer((_request, response) => {
    const usage = { prompt_tokens: 101, completion_tokens: 37 };
    const shape: Record<Mode, () => void> = {
      badjson: () => { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ choices: [{ message: { content: '{"broken"' } }], usage })); },
      empty: () => { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ choices: [{ message: { content: '' } }], usage: { prompt_tokens: 150, completion_tokens: 0 } })); },
      truncated: () => { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ choices: [{ message: { content: '{"partial": ' }, finish_reason: 'length' }], usage: { prompt_tokens: 202, completion_tokens: 88 } })); },
      fieldmissing: () => { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ answer: 'ok' }) } }], usage: { completion_tokens: 55 } })); },
      nousage_badjson: () => { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ choices: [{ message: { content: '{"no"' } }] })); },
      nousage_ok: () => { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ answer: 'fine' }) } }] })); },
      ok: () => { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ answer: 'hello' }) } }], usage: { prompt_tokens: 303, completion_tokens: 44 } })); },
      fivehundred: () => { response.writeHead(500, { 'content-type': 'application/json' }); response.end(JSON.stringify({ error: 'boom' })); },
    };
    shape[mode]();
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({
    port: (server.address() as { port: number }).port,
    close: () => new Promise<void>((done) => server.close(() => done())),
  })));
}

const REQUEST = { service: 'ag-b.proof', system: 'ag-b 确定性分类 proof（评估官）', userData: 'proof-payload' };

async function invocationRow(key: string) {
  return pool.query<{ status: string; error_code: string | null; input_tokens: number | null; output_tokens: number | null; usage_source: string | null }>(
    'SELECT status,error_code,input_tokens,output_tokens,usage_source FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, key],
  );
}
async function costRow(key: string) {
  return pool.query<{ status: string; reason_code: string | null; input_tokens_actual: number | null; output_tokens_actual: number | null }>(
    'SELECT status,reason_code,input_tokens_actual,output_tokens_actual FROM ai_cost_reservation WHERE scope_id=$1 AND idempotency_key=$2', [SCOPE, key],
  );
}
async function feeRow(key: string) {
  return pool.query<{ fee_status: string; input_tokens: number | null; output_tokens: number | null; reason_code: string | null }>(
    'SELECT fee_status,input_tokens,output_tokens,reason_code FROM ai_model_fee_ledger WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, key],
  );
}
async function breakerRow() {
  return pool.query<{ phase: string; consecutive_failures: number }>(
    "SELECT phase,consecutive_failures FROM ai_model_breaker_state WHERE operation_id='interview.answer-scoring.v1'", [],
  );
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,$4,1000000,1000000,'https://example.test/ag-b',clock_timestamp())`,
    [PROVIDER, MODEL, REGION, REVISION],
  );
  await pool.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1000000,true)', [SCOPE]);

  const echo = await startScriptedProvider();
  const client = openAICompatibleClient({ baseUrl: `http://127.0.0.1:${echo.port}`, apiKey: 'test', model: MODEL, costPolicy: policy });

  // ── A. 客户端级分类（ModelResult 形状·修法①②③④）──────────────────────────────
  section('A. 客户端级分类（dispatchOnce 返回与 parse 之间的结构缝）');
  mode = 'badjson';
  const cBad = await client.complete(REQUEST, 1);
  A('坏 JSON+usage → known_executed·deterministic·码 deterministic_output_invalid·usage 带出(101/37)',
    !cBad.ok && cBad.kind === 'deterministic' && cBad.externalOutcome === 'known_executed'
      && cBad.errorCode === 'deterministic_output_invalid' && cBad.usage?.inputTokens === 101 && cBad.usage?.outputTokens === 37);
  mode = 'empty';
  const cEmpty = await client.complete(REQUEST, 1);
  A('空 content+usage → known_executed·码 deterministic_output_invalid·usage 带出(150/0)',
    !cEmpty.ok && cEmpty.kind === 'deterministic' && cEmpty.externalOutcome === 'known_executed'
      && cEmpty.errorCode === 'deterministic_output_invalid' && cEmpty.usage?.inputTokens === 150 && cEmpty.usage?.outputTokens === 0);
  mode = 'truncated';
  const cTrunc = await client.complete(REQUEST, 1);
  A("截断 finish_reason='length'+usage → known_executed·截断码 deterministic_output_truncated·finishReason 带出",
    !cTrunc.ok && cTrunc.kind === 'deterministic' && cTrunc.externalOutcome === 'known_executed'
      && cTrunc.errorCode === 'deterministic_output_truncated' && cTrunc.finishReason === 'length'
      && cTrunc.usage?.inputTokens === 202 && cTrunc.usage?.outputTokens === 88);
  mode = 'fieldmissing';
  const cField = await client.complete(REQUEST, 1);
  A('usage 缺 prompt_tokens → 按上限补齐(1000=policy max)打标 usage_missing·绝不 0',
    cField.ok && cField.usage?.inputTokens === 1000 && cField.usage?.outputTokens === 55 && cField.usage?.usageSource === 'usage_missing');
  mode = 'nousage_badjson';
  const cNoUsage = await client.complete(REQUEST, 1);
  A('坏 JSON+usage 整体缺失 → 维持既有 transient unknown（零回归·known_executed 以 usage 在手为界）',
    !cNoUsage.ok && cNoUsage.kind === 'transient' && cNoUsage.externalOutcome === 'unknown');
  mode = 'ok';
  const cOk = await client.complete(REQUEST, 1);
  A('好输出+完整 usage → ok:true·真实 usage 透传·无打标',
    cOk.ok && cOk.usage?.inputTokens === 303 && cOk.usage?.outputTokens === 44 && cOk.usage?.usageSource === undefined);

  // ── B-G. 全链 invoke（相位 5 路由·PG 投影断言）────────────────────────────────
  const model = () => modelFor(client, REQUEST);
  const arm = async (key: string) => invoke({
    idempotencyKey: key, operation: { id: 'interview.answer-scoring.v1', businessRevision: `ag-b:${key}` },
    schema: Schema, businessValidate: () => null, model: model(),
  }, pool, OWNER);

  section('B. 臂一：坏 JSON+usage → settled-failed 先例形（钱 settled·failed 码·breaker success）');
  mode = 'badjson';
  const bKey = `ag-b:badjson:${suffix}`;
  const bOutcome = await arm(bKey);
  const bInv = (await invocationRow(bKey)).rows[0];
  const bCost = (await costRow(bKey)).rows[0];
  const bFee = (await feeRow(bKey)).rows[0];
  const bBreaker = (await breakerRow()).rows[0];
  A('invoke 返回确定性失败码 deterministic_output_invalid（非 external_outcome_unknown）',
    'error' in bOutcome && bOutcome.error === 'deterministic_output_invalid');
  A('invocation=failed·error_code 落码·真实 token(101/37)落库·无 usage_source 打标',
    bInv?.status === 'failed' && bInv?.error_code === 'deterministic_output_invalid'
      && bInv?.input_tokens === 101 && bInv?.output_tokens === 37 && bInv?.usage_source === null);
  A('钱 settled 非 unknown（真实 token 101/37 结算·幽灵预留消除）',
    bCost?.status === 'settled' && bCost?.input_tokens_actual === 101 && bCost?.output_tokens_actual === 37);
  A('fee ledger=settled 真实 token（沿先例 :899-905 形）',
    bFee?.fee_status === 'settled' && bFee?.input_tokens === 101 && bFee?.output_tokens === 37);
  A('breaker success——格式失败不计熔断（consecutive_failures=0·切断 AG-01 链）',
    bBreaker?.phase === 'closed' && Number(bBreaker?.consecutive_failures) === 0);

  section('C. 臂二：截断 → 同上+截断码');
  mode = 'truncated';
  const cKey = `ag-b:truncated:${suffix}`;
  const cOutcome = await arm(cKey);
  const cInv = (await invocationRow(cKey)).rows[0];
  const cCost = (await costRow(cKey)).rows[0];
  A('invoke 返回 deterministic_output_truncated·invocation=failed 截断码·真实 token(202/88)',
    'error' in cOutcome && cOutcome.error === 'deterministic_output_truncated'
      && cInv?.status === 'failed' && cInv?.error_code === 'deterministic_output_truncated'
      && cInv?.input_tokens === 202 && cInv?.output_tokens === 88 && cInv?.usage_source === null);
  A('钱 settled(202/88)·breaker 不计熔断',
    cCost?.status === 'settled' && cCost?.input_tokens_actual === 202 && cCost?.output_tokens_actual === 88
      && Number((await breakerRow()).rows[0]?.consecutive_failures) === 0);

  section('D. 臂三：usage 缺字段 → 上限补齐打标·绝不 0·配对剔除（AG-14）');
  mode = 'fieldmissing';
  const dKey = `ag-b:fieldmissing:${suffix}`;
  const dOutcome = await arm(dKey);
  const dInv = (await invocationRow(dKey)).rows[0];
  const dCost = (await costRow(dKey)).rows[0];
  A('好输出成功返回 value（上限补齐不误伤成功终态）', 'value' in dOutcome && dOutcome.value.answer === 'ok');
  A('invocation=succeeded·input_tokens=1000(policy max)·usage_source=usage_missing（绝不 0）',
    dInv?.status === 'succeeded' && dInv?.input_tokens === 1000 && dInv?.output_tokens === 55 && dInv?.usage_source === 'usage_missing');
  A('钱 settled 按上限(1000/55)', dCost?.status === 'settled' && dCost?.input_tokens_actual === 1000 && dCost?.output_tokens_actual === 55);

  section('E. 对照臂：好输出+真实 usage → 成功+配对在册（真实 usage 行不受剔除影响）');
  mode = 'ok';
  const eKey = `ag-b:ok:${suffix}`;
  const eOutcome = await arm(eKey);
  const eInv = (await invocationRow(eKey)).rows[0];
  A('invoke 成功·invocation=succeeded·真实 token(303/44)·无打标',
    'value' in eOutcome && eInv?.status === 'succeeded' && eInv?.input_tokens === 303 && eInv?.output_tokens === 44 && eInv?.usage_source === null);

  section('F. 归并臂：usage 整体缺失+好输出 → 既有 provider_usage_invalid 臂（不新造语义）');
  mode = 'nousage_ok';
  const fKey = `ag-b:nousage:${suffix}`;
  const fOutcome = await arm(fKey);
  const fInv = (await invocationRow(fKey)).rows[0];
  const fCost = (await costRow(fKey)).rows[0];
  const fFee = (await feeRow(fKey)).rows[0];
  A('invoke 返回 external_outcome_unknown·invocation=unknown·error_code=provider_usage_invalid',
    'error' in fOutcome && fOutcome.error === 'external_outcome_unknown'
      && fInv?.status === 'unknown' && fInv?.error_code === 'provider_usage_invalid');
  A('钱 unknown 待对账（归并既有臂·breaker success 传输健康）',
    fCost?.status === 'unknown' && fCost?.reason_code === 'provider_usage_invalid'
      && fFee?.fee_status === 'unknown' && fFee?.reason_code === 'provider_usage_invalid'
      && Number((await breakerRow()).rows[0]?.consecutive_failures) === 0);

  section('G. 网络层反向臂：5xx → 仍 unknown+breaker failure（状态机 :33 只剩网络层不确定）');
  mode = 'fivehundred';
  const gKey = `ag-b:fivehundred:${suffix}`;
  const gOutcome = await arm(gKey);
  const gInv = (await invocationRow(gKey)).rows[0];
  const gCost = (await costRow(gKey)).rows[0];
  A('5xx → invoke external_outcome_unknown·invocation=unknown·钱 unknown（既有臂零回归）',
    'error' in gOutcome && gOutcome.error === 'external_outcome_unknown'
      && gInv?.status === 'unknown' && gCost?.status === 'unknown');
  A('breaker failure 计数 +1（网络层不确定仍计熔断）',
    (await breakerRow()).rows[0]?.phase === 'closed' && Number((await breakerRow()).rows[0]?.consecutive_failures) === 1);

  section('H. 校准配对剔除（0119 镜像迁移 0174 谓词·listUsageCalibrationPairs TS 消费面）');
  const pairs = await asPrincipal(pool, OWNER, (c) => listUsageCalibrationPairs(c, OWNER));
  const pairKeys = new Set(pairs.map((p) => p.idempotencyKey));
  const pairBy = (key: string) => pairs.find((p) => p.idempotencyKey === key);
  A('打标行（fieldmissing·上限补齐假 usage）被配对剔除——不污染 AG-12 因子', !pairKeys.has(dKey));
  A('真实 usage 行照常配对：成功(303)+settled-failed 坏 JSON(101)+截断(202)·provider_input_tokens=真实值',
    pairKeys.has(eKey) && pairBy(eKey)?.providerInputTokens === 303
      && pairKeys.has(bKey) && pairBy(bKey)?.providerInputTokens === 101
      && pairKeys.has(cKey) && pairBy(cKey)?.providerInputTokens === 202);
  A('unknown 行无 usage 不配对（既有行为）', !pairKeys.has(fKey) && !pairKeys.has(gKey));

  await echo.close();
  console.log(failures === 0
    ? '\n✓ AG-06/AG-14 刀 B：known_executed 分类+settled-failed 接线+usage_missing 打标配对剔除全部通过'
    : `\n✗ ${failures} 项失败`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'ag_b_classify_proof_failed');
  await pool.end();
  process.exit(1);
});
