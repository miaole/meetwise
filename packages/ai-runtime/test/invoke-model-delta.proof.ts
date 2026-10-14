/**
 * TOKSTREAM S4b · R1/R1b invoke 观察缝 proof（门预申明①新 proof · fake transport + 隔离 PostgreSQL）。
 *
 * 全 fake seam 零模型外呼（globalThis.fetch mock 沿 model-client-stream.proof.ts 形制·actualSpendCny=null）。
 * R1 验收四臂（REQUEST §2 R1）：
 *   (i)   flag OFF 回退路径回调零调用（路由条件假 → complete 既有面·completeStream 不触）；
 *   (ii)  回调抛错 → 业务结果与基线一致（swallowObserverThrows 吞没·绝不影响结果面）；
 *   (iii) claim/usage 落账行数与基线相等（ai_model_invocation/ai_invocation_trace·第二账面禁）；
 *   (iv)  flag 双开+transport seam 注入 → invoke(spec{onModelDelta}) 回调实收 ≥1 delta 且序守恒
 *         （emit 顺序=到达顺序·拼接==raw 原文·正路端到端臂）。
 * 静态断言（R1b① 五处三层·随 proof 登记产出物）：
 *   - 可路由两臂（openAICompatibleClient prepare execute 臂/modelFor call 臂）flag-aware 路由在位
 *     （shouldRouteModelTextStream 单源·恰 2 调用位）；
 *   - 三结构性非流式落点（completeStream 自回退/modelFor prepare 缺省臂/failover prepare 缺省臂）零路由注记；
 *   - g7 freetier 例外在路由条件单源内（R8(a) 防线·恒走非流式）+行为臂（freetier ON → 回调零调用）；
 *   - R7(iv)「为补 delta 重跑模型调用」rg 断言：src 面 .completeStream( 恰 2 调用位（两路由臂）零新增。
 * 运行：pnpm s4b-invoke-delta:prove（经 scripts/run-e2e-isolated.mjs 隔离 PG）；裸跑需隔离 DATABASE_URL。
 */
import { readFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import {
  configureG7RuntimeInjection, resetG7RuntimeInjection,
  invoke, modelFor, openAICompatibleClient,
} from '../src/index.ts';
import type { ModelResult } from '../src/invoke.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean, detail?: unknown) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok && detail !== undefined) console.log(`      ↳ detail: ${JSON.stringify(detail)}`);
  if (!ok) failures++;
};

const MUTATED = [
  'NODE_ENV', 'MODEL_TEXT_STREAM_ENABLED', 'MODEL_TEXT_STREAM_PREVIEW',
  'MODEL_COST_ENFORCEMENT', 'MEETWISE_PUBLIC_PREVIEW', 'MODEL_EXECUTION_TIMEOUT_MS', 'MODEL_API_KEY',
  'G7_RUN_COST_LEDGER_PATH', 'G7_RUN_COST_CAP_CNY',
] as const;

const WIRE_LINES = [
  'data: {"choices":[{"delta":{"content":"{\\"ok\\":1}"},"finish_reason":"stop"}]}',
  'data: {"choices":[{"delta":{"content":""}}]}',
  'data: {"choices":[],"usage":{"prompt_tokens":32,"completion_tokens":9}}',
  'data: [DONE]',
];
const SSE_WIRE = WIRE_LINES.map((l) => `${l}\n\n`).join('');

function installFetchMock(calls: string[]): void {
  const bytes = new TextEncoder().encode(SSE_WIRE);
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push(String(input));
    void init;
    let offset = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= bytes.length) { controller.close(); return; }
        const cut = Math.min(7, bytes.length - offset);   // 按字节乱刀（含码点中断位·通道自码点安全）
        controller.enqueue(bytes.slice(offset, offset + cut));
        offset += cut;
      },
    });
    return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
  }) as typeof fetch;
}

/** 非流式 mock（flag OFF 回退路径臂用——complete 既有面·请求体零 stream 字段）。 */
function installNonStreamMock(calls: string[], opts: { model?: string } = {}): void {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push(String(init?.body === undefined ? String(input) : String(init?.body)));
    return new Response(JSON.stringify({
      // g7 臂携 model 回显：g7 finalize 面断言供应商响应 model 字段在场（缺席=g7_actual_model_missing
      // → transient unknown）——非 g7 臂缺省不回显=响应面原值零改。
      ...(opts.model ? { model: opts.model } : {}),
      choices: [{ message: { content: '{"ok":1}' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 32, completion_tokens: 9 },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
}

const Schema = z.object({ ok: z.number() });
const REQ = { service: 'smoke' as const, system: 'trusted system only', userData: 'ping' };
const s4bModel = () => modelFor(openAICompatibleClient(), REQ);

interface KeyCounters { invocation: number; trace: number }
async function ledgerRows(owner: string, key: string): Promise<KeyCounters> {
  const inv = await pool.query(
    'SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]);
  const trace = await pool.query(
    'SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]);
  return { invocation: Number(inv.rows[0]?.n ?? -1), trace: Number(trace.rows[0]?.n ?? -1) };
}

async function main() {
  await assertIsolatedTestTarget(pool);
  const originalFetch = globalThis.fetch;
  const initial = new Map<string, string | undefined>(MUTATED.map((name) => [name, process.env[name]]));
  // 端点面测试基座（沿 model-client-stream.proof :235-241 同形）：NODE_ENV=test + 文本主 Key 装载
  // （registry 解析 baseUrl/apiKey 需 Key 在场；值=proof 本地假 Key·零外呼，fetch 全程被 mock 拦截）。
  process.env.NODE_ENV = 'test';
  process.env.MODEL_API_KEY = 's4b-delta-proof-key';
  const OWNER = `s4b-delta-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  try {
    // ===== 静态断言（R1b① 五处三层 · 随 proof 登记产出物）=====
    const src = readFileSync(fileURLToPath(new URL('../src/model-client.ts', import.meta.url)), 'utf8');
    const invokeSrc = readFileSync(fileURLToPath(new URL('../src/invoke.ts', import.meta.url)), 'utf8');
    const failoverSrc = readFileSync(fileURLToPath(new URL('../src/failover-model.ts', import.meta.url)), 'utf8');
    const prepareArm = src.slice(src.indexOf('prepare(req, attempt, signal) {'), src.indexOf('async complete(req, _attempt, executionSignal) {'));
    const modelForBlock = src.slice(src.indexOf('export function modelFor('));
    const routerFn = src.slice(src.indexOf('export function shouldRouteModelTextStream()'), src.indexOf('export function shouldRouteModelTextStream()') + 400);
    A('静态：层1 唯一生产臂（prepare execute 臂）flag-aware 路由在位（shouldRouteModelTextStream+completeStream）',
      prepareArm.includes('shouldRouteModelTextStream()') && prepareArm.includes('client.completeStream(req, { signal: executionSignal ?? signal, onDelta: onDelta ?? noopOnModelDelta })'));
    A('静态：层2 防御性同刀（modelFor call 臂）flag-aware 路由在位（直调 parity·duck-type 收窄）',
      modelForBlock.includes('shouldRouteModelTextStream()') && modelForBlock.includes('streamClient.completeStream(req, { signal, onDelta: onDelta ?? noopOnModelDelta })'));
    A('静态：路由条件单源恰 2 调用位（两可路由臂）+ g7 freetier 例外在单源内（R8(a) 防线）',
      // 调用位计数=剔除单源定义行与全行注记后恰 2（防定义/注记稀释计数）。
      src.split('\n').filter((line) => line.includes('shouldRouteModelTextStream()')
        && !line.includes('export function shouldRouteModelTextStream()')
        && !line.trimStart().startsWith('//')).length === 2
      && /shouldRouteModelTextStream\(\)/g.test(prepareArm) && /shouldRouteModelTextStream\(\)/g.test(modelForBlock)
      && routerFn.includes('isModelTextStreamPreviewEnabled(process.env)') && routerFn.includes('!g7RuntimeInjection().freetierReproveEnabled()'));
    A('静态：层3 三结构性非流式落点零路由注记（completeStream 自回退/modelFor prepare 缺省臂/failover prepare 缺省臂）',
      /R1b① 层3 结构性非流式落点/.test(src) && /恒非流式 fail-safe，路由在此结构性不可达/.test(src)
      && failoverSrc.includes('R1b① 层3 结构性非流式落点'));
    A('静态：R7(iv)「为补 delta 重跑模型调用」零新增——src 面 .completeStream( 恰 2 调用位（两路由臂）',
      (src.match(/\.completeStream\(/g) ?? []).length === 2
        && (invokeSrc.match(/\.completeStream\(/g) ?? []).length === 0
        && (failoverSrc.match(/\.completeStream\(/g) ?? []).length === 0);
    A('静态：invoke 观察缝在位（InvokeSpec.onModelDelta+plan.execute 透传+swallowObserverThrows 吞没）',
      invokeSrc.includes('onModelDelta?: OnModelDelta') && invokeSrc.includes('plan.execute(signal, spec.onModelDelta ? swallowObserverThrows(spec.onModelDelta) : undefined)')
      && invokeSrc.includes('export function swallowObserverThrows'));
    A('静态：R1b② additive 可选回调位（ModelCallPlan.execute 第 2 参/Model.call 第 3 参）',
      invokeSrc.includes('execute: (signal?: AbortSignal, onDelta?: OnModelDelta) => Promise<ModelResult>;')
      && invokeSrc.includes('call(attempt: number, signal?: AbortSignal, onDelta?: OnModelDelta): Promise<ModelResult>;'));

    // ===== R1(i)：flag OFF 回退路径回调零调用 =====
    {
      const calls: string[] = [];
      installNonStreamMock(calls);
      const observed: string[] = [];
      const out = await invoke({
        idempotencyKey: `${OWNER}:off`, schema: Schema, businessValidate: () => null,
        model: s4bModel(),
        onModelDelta: (d) => { observed.push(d.text); },
      }, pool, OWNER);
      A('R1(i)：flag OFF → 回退路径回调零调用（complete 非流式既有面·零 delta 回调·业务照常 ok）',
        'value' in out && out.value.ok === 1 && observed.length === 0 && calls.length === 1,
        { observed: observed.length, calls: calls.length });
    }

    // ===== R1(iv)：flag 双开 → 正路端到端（回调实收 ≥1 delta 且序守恒·拼接==raw）=====
    process.env.NODE_ENV = 'test';
    process.env.MODEL_TEXT_STREAM_ENABLED = '1';
    process.env.MODEL_TEXT_STREAM_PREVIEW = '1';
    {
      const calls: string[] = [];
      installFetchMock(calls);
      const observed: string[] = [];
      const out = await invoke({
        idempotencyKey: `${OWNER}:on`, schema: Schema, businessValidate: () => null,
        model: s4bModel(),
        onModelDelta: (d) => { observed.push(d.text); },
      }, pool, OWNER);
      const stitched = observed.join('');
      const rawText = 'value' in out ? JSON.stringify(out.value) : '';
      A('R1(iv)：flag 双开+transport seam → invoke(spec{onModelDelta}) 回调实收 ≥1 delta 且序守恒（拼接==raw 原文）',
        'value' in out && observed.length >= 1 && stitched === '{"ok":1}' && rawText === '{"ok":1}',
        { deltas: observed.length, stitched, value: 'value' in out ? out.value : out.error });
    }

    // ===== R1(ii)：回调抛错 → 业务结果与基线一致（吞没·绝不影响结果面）=====
    {
      const calls: string[] = [];
      installFetchMock(calls);
      let throws = 0;
      const out = await invoke({
        idempotencyKey: `${OWNER}:throw`, schema: Schema, businessValidate: () => null,
        model: s4bModel(),
        onModelDelta: (d) => { void d; throws += 1; throw new Error('observer_boom'); },
      }, pool, OWNER);
      A('R1(ii)：回调抛错 → 吞没为观察失败·业务结果与基线一致（ok:{ok:1}·回调确被调用过）',
        'value' in out && out.value.ok === 1 && throws >= 1, { throws, out });
    }

    // ===== R1(iii)：claim/usage 落账行数与基线相等（第二账面禁）=====
    {
      const calls: string[] = [];
      installFetchMock(calls);
      const base = await invoke({
        idempotencyKey: `${OWNER}:base`, schema: Schema, businessValidate: () => null,
        model: s4bModel(),      // flag ON·无 onModelDelta（noop 观察位路由——落账面必须与 delta 臂全等）
      }, pool, OWNER);
      const deltaRows = await ledgerRows(OWNER, `${OWNER}:on`);
      const throwRows = await ledgerRows(OWNER, `${OWNER}:throw`);
      const baseRows = await ledgerRows(OWNER, `${OWNER}:base`);
      const offRows = await ledgerRows(OWNER, `${OWNER}:off`);
      A('R1(iii)：claim/usage 落账行数与基线相等（invocation/trace 两表·四键互等·第二账面禁）',
        'value' in base
        && deltaRows.invocation === baseRows.invocation && deltaRows.trace === baseRows.trace
        && throwRows.invocation === baseRows.invocation && throwRows.trace === baseRows.trace
        && offRows.invocation === baseRows.invocation && offRows.trace === baseRows.trace
        && baseRows.invocation === 1 && baseRows.trace === 1,
        { deltaRows, throwRows, baseRows, offRows });
    }

    // ===== R8(a)：g7 freetier 例外恒走非流式（行为臂·flags ON 仍不路由）=====
    {
      // g7 freetier 面测试基座：outbound 拦截器为 composition-root 注入缝（GODFN-1b），共享 ¥ cap 台账
      // 缺路径即 g7_cost_ledger_path_missing（resolveG7LedgerPath fail-closed）——proof 本地临时台账文件
      // （零外呼·fetch 全程 mock·台账仅本进程读写）。
      process.env.G7_RUN_COST_LEDGER_PATH = `${OWNER}-g7-ledger.ndjson`;
      process.env.G7_RUN_COST_CAP_CNY = '5';
      configureG7RuntimeInjection({
        freetierReproveEnabled: () => true,
        withOutboundAllow: (fn) => fn(),
      });
      try {
        const calls: string[] = [];
        installNonStreamMock(calls, { model: 'qwen-turbo' });
        process.env.MODEL_API_KEY = 's4b-g7-arm-test-key';   // g7 面 assertModelApiKeyPresent 前置（allowlist 模型 qwen-turbo）
        const observed: string[] = [];
        const out = await invoke({
          idempotencyKey: `${OWNER}:g7`, schema: Schema, businessValidate: () => null,
          model: modelFor(openAICompatibleClient({ model: 'qwen-turbo' }), REQ),
          onModelDelta: (d) => { observed.push(d.text); },
        }, pool, OWNER);
        A('R8(a)：g7 freetier ON → 恒走非流式（flags 双开仍不路由·回调零调用·业务照常）',
          'value' in out && out.value.ok === 1 && observed.length === 0, { observed: observed.length, calls: calls.length, out });
      } finally {
        resetG7RuntimeInjection();
        try { unlinkSync(process.env.G7_RUN_COST_LEDGER_PATH ?? ''); } catch { /* 台账为 proof 本地临时件·缺席不追 */ }
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of MUTATED) {
      const value = initial.get(name);
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    resetG7RuntimeInjection();
  }
  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ TOKSTREAM S4b invoke 观察缝矩阵全部通过（零模型外呼·actualSpendCny=null）');
  await pool.end();
  process.exit(failures ? 1 : 0);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'invoke_model_delta_proof_failed');
  await pool.end();
  process.exit(1);
});
