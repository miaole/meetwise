/**
 * AG-COST1 §1-② #48 cached_tokens 观测证明（fixture 三形·零模型外呼·零网络·零 DB）。
 *
 * 覆盖（REQUEST §2-2 观测三形）：
 *   ①字段在——三端点字段名各一 fixture：OpenAI 兼容 `cached_tokens` / DeepSeek
 *     `prompt_cache_hit_tokens` / 百炼 `prompt_tokens_details.cached_tokens`（官方文档已核实·
 *     review-log §四 :139-141）→ ModelUsage.cachedInputTokens 解析值正确 + presence=present_positive；
 *   ②字段缺席 → `undefined`（断言 ≠0·缺席≠零铁律）+ presence=absent；
 *   ③字段为 `0` → `0` + presence=present_zero——三态互斥。
 *   非流+流式两解析面各跑一遍；metrics registry render() 断言（沿 metrics.proof.ts 形制）；
 *   多字段并存取值序防御臂；usage 载荷整体缺席不打点（#48 面是载荷内字段在场性）；
 *   基线预注册形（registerBaselineMetrics·prompt 注册表 service 集）；
 *   只观测零计费负臂（invoke.ts 型面外零引用·usage-reconciliation 零引用·两解析面各恰一打点）。
 *
 * 全 fake seam（globalThis.fetch mock 沿 model-client-dispatch.proof.ts:55/:77 形制·受控注册表
 * 端点+mock 响应·非 override 缝）：无网络、无真实凭据、actualSpendCny=null、est live=0。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { openAICompatibleClient } from '../src/model-client.ts';
import { createMetrics, registerBaselineMetrics, setMetrics, METRIC } from '../src/index.ts';
import type { ModelResult } from '../src/invoke.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: unknown) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok && detail !== undefined) console.log(`      ↳ detail: ${JSON.stringify(detail)}`);
  if (!ok) failures++;
};

const MUTATED = [
  'NODE_ENV', 'MODEL_TEST_TRANSPORT_OVERRIDES', 'MODEL_COST_ENFORCEMENT', 'MEETWISE_PUBLIC_PREVIEW',
  'MODEL_TEXT_STREAM_ENABLED', 'MODEL_TEXT_STREAM_PREVIEW',
  'MODEL_API_KEY', 'MODEL_NAME', 'MODEL_ENDPOINT_PROFILE', 'MODEL_BACKUP_API_KEY',
] as const;
const initial = new Map<string, string | undefined>(MUTATED.map((name) => [name, process.env[name]]));
const originalFetch = globalThis.fetch;

const CONTENT = '{"status":"ok"}';
type UsagePayload = Record<string, unknown> & { prompt_tokens?: number; completion_tokens?: number };
const openaiUsage: UsagePayload = { prompt_tokens: 100, completion_tokens: 50, cached_tokens: 123 };
const deepseekUsage: UsagePayload = { prompt_tokens: 100, completion_tokens: 50, prompt_cache_hit_tokens: 456 };
const bailianUsage: UsagePayload = { prompt_tokens: 100, completion_tokens: 50, prompt_tokens_details: { cached_tokens: 789 } };
const absentUsage: UsagePayload = { prompt_tokens: 100, completion_tokens: 50 };
const zeroUsage: UsagePayload = { prompt_tokens: 100, completion_tokens: 50, cached_tokens: 0 };
const multiFieldUsage: UsagePayload = { prompt_tokens: 100, completion_tokens: 50, cached_tokens: 10, prompt_cache_hit_tokens: 20, prompt_tokens_details: { cached_tokens: 30 } };

function jsonResponse(usage: UsagePayload | undefined): Response {
  return new Response(
    JSON.stringify({ model: 'qwen-plus', choices: [{ message: { content: CONTENT } }], ...(usage === undefined ? {} : { usage }) }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

/** 三联齐 SSE wire：stop chunk + 空 choices usage chunk + [DONE]（§D-1 终结判定）。 */
function sseResponse(usage: UsagePayload): Response {
  const wire = [
    `data: ${JSON.stringify({ choices: [{ delta: { content: CONTENT }, finish_reason: null }] })}\n\n`,
    `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }] })}\n\n`,
    `data: ${JSON.stringify({ choices: [], usage })}\n\n`,
    'data: [DONE]\n\n',
  ].join('');
  return new Response(wire, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

type OnUsage = { completionTokens?: number; promptTokens?: number; cachedInputTokens?: number };

async function completeOnce(service: string, usage: UsagePayload | undefined): Promise<ModelResult> {
  globalThis.fetch = (async () => jsonResponse(usage)) as typeof fetch;
  return openAICompatibleClient().complete({ service, system: 'trusted system only', userData: 'ping' }, 1);
}

async function streamOnce(service: string, usage: UsagePayload): Promise<{ result: ModelResult; usages: OnUsage[] }> {
  globalThis.fetch = (async () => sseResponse(usage)) as typeof fetch;
  const usages: OnUsage[] = [];
  const result = await openAICompatibleClient().completeStream(
    { service, system: 'trusted system only', userData: 'ping' },
    { onDelta: () => {}, onUsage: (u) => { usages.push(u); } },
  );
  return { result, usages };
}

async function main() {
  process.env.NODE_ENV = 'test';
  for (const name of MUTATED) if (!['MODEL_API_KEY', 'MODEL_NAME'].includes(name)) delete process.env[name];
  process.env.MODEL_API_KEY = 'proof-text-key';
  process.env.MODEL_NAME = 'qwen-plus';
  setMetrics(createMetrics());   // 独立 registry：本证明计数从零起

  try {
    // ── 非流式面：三端点字段名 + 缺席 + 显式零 + 并存防御 ──────────────────────────────
    const nsOpenai = await completeOnce('proof.cache.openai', openaiUsage);
    A('非流① OpenAI 兼容 cached_tokens=123 → cachedInputTokens=123 + 既有两字段原值',
      nsOpenai.ok === true && nsOpenai.usage?.cachedInputTokens === 123 && nsOpenai.usage.inputTokens === 100 && nsOpenai.usage.outputTokens === 50);
    const nsDeepseek = await completeOnce('proof.cache.deepseek', deepseekUsage);
    A('非流① DeepSeek prompt_cache_hit_tokens=456 → cachedInputTokens=456', nsDeepseek.ok === true && nsDeepseek.usage?.cachedInputTokens === 456);
    const nsBailian = await completeOnce('proof.cache.bailian', bailianUsage);
    A('非流① 百炼 prompt_tokens_details.cached_tokens=789 → cachedInputTokens=789', nsBailian.ok === true && nsBailian.usage?.cachedInputTokens === 789);
    const nsAbsent = await completeOnce('proof.cache.absent', absentUsage);
    A('非流② 字段缺席 → undefined（缺席≠零·绝不静默归零）',
      nsAbsent.ok === true && nsAbsent.usage?.cachedInputTokens === undefined && nsAbsent.usage?.cachedInputTokens !== 0);
    const nsZero = await completeOnce('proof.cache.zero', zeroUsage);
    A('非流③ 字段显式为 0 → 0（供应商显式回报零·与缺席分开）', nsZero.ok === true && nsZero.usage?.cachedInputTokens === 0);
    const nsMulti = await completeOnce('proof.cache.multi', multiFieldUsage);
    A('非流防御臂 三字段并存 → 取值序 cached_tokens 优先（互斥为常态·并存仅防御）', nsMulti.ok === true && nsMulti.usage?.cachedInputTokens === 10);
    const nsNoUsage = await completeOnce('proof.cache.nousage', undefined);
    A('非流边界 usage 载荷整体缺席 → ModelUsage=undefined（既有语义原值）', nsNoUsage.ok === true && nsNoUsage.usage === undefined);

    // ── 流式面：同三形 + 缺席 + 显式零（双 preview flag 门·NODE_ENV=test） ──────────────
    process.env.MODEL_TEXT_STREAM_ENABLED = '1';
    process.env.MODEL_TEXT_STREAM_PREVIEW = '1';
    const stOpenai = await streamOnce('proof.stream.openai', openaiUsage);
    A('流式① OpenAI 兼容形 → 终局 usage.cachedInputTokens=123 + onUsage 回调透传 123',
      stOpenai.result.ok === true && stOpenai.result.usage?.cachedInputTokens === 123 && stOpenai.usages[0]?.cachedInputTokens === 123);
    const stDeepseek = await streamOnce('proof.stream.deepseek', deepseekUsage);
    A('流式① DeepSeek 形 → 456 + onUsage 透传', stDeepseek.result.ok === true && stDeepseek.result.usage?.cachedInputTokens === 456 && stDeepseek.usages[0]?.cachedInputTokens === 456);
    const stBailian = await streamOnce('proof.stream.bailian', bailianUsage);
    A('流式① 百炼形 → 789 + onUsage 透传', stBailian.result.ok === true && stBailian.result.usage?.cachedInputTokens === 789 && stBailian.usages[0]?.cachedInputTokens === 789);
    const stAbsent = await streamOnce('proof.stream.absent', absentUsage);
    A('流式② 字段缺席 → undefined（缺席≠零）+ onUsage 透传 undefined',
      stAbsent.result.ok === true && stAbsent.result.usage?.cachedInputTokens === undefined && stAbsent.result.usage?.cachedInputTokens !== 0 && stAbsent.usages[0]?.cachedInputTokens === undefined);
    const stZero = await streamOnce('proof.stream.zero', zeroUsage);
    A('流式③ 字段显式为 0 → 0 + onUsage 透传 0', stZero.result.ok === true && stZero.result.usage?.cachedInputTokens === 0 && stZero.usages[0]?.cachedInputTokens === 0);
    A('流式既有字段原值（promptTokens=100/completionTokens=50·onUsage 形）',
      stOpenai.usages[0]?.promptTokens === 100 && stOpenai.usages[0]?.completionTokens === 50 && stOpenai.result.usage?.inputTokens === 100 && stOpenai.result.usage?.outputTokens === 50);

    // ── metrics registry render()：三态互斥计数 + token 计数 + 缺席零计 Counter 形 ─────
    const out = (await import('../src/index.ts')).getMetrics().render();
    A('METRIC 常量名（单一真源防漂移）',
      METRIC.modelUsageCachedInputTokens === 'model_usage_cached_input_tokens_total' && METRIC.modelUsageCacheFieldPresence === 'model_usage_cache_field_presence_total');
    A('presence 三态互斥：present_positive 恰三端点（非流+流式各计数）',
      /model_usage_cache_field_presence_total\{service="proof\.cache\.openai",presence="present_positive"\} 1/.test(out)
      && /model_usage_cache_field_presence_total\{service="proof\.stream\.deepseek",presence="present_positive"\} 1/.test(out)
      && /model_usage_cache_field_presence_total\{service="proof\.stream\.bailian",presence="present_positive"\} 1/.test(out));
    A('presence：缺席=absent（非流+流式各 1）',
      /model_usage_cache_field_presence_total\{service="proof\.cache\.absent",presence="absent"\} 1/.test(out)
      && /model_usage_cache_field_presence_total\{service="proof\.stream\.absent",presence="absent"\} 1/.test(out));
    A('presence：显式零=present_zero（非流+流式各 1·与 absent 分开打点）',
      /model_usage_cache_field_presence_total\{service="proof\.cache\.zero",presence="present_zero"\} 1/.test(out)
      && /model_usage_cache_field_presence_total\{service="proof\.stream\.zero",presence="present_zero"\} 1/.test(out));
    A('cached token counter：按解析值累计（123/456/789·非流+流式各一系列）',
      /model_usage_cached_input_tokens_total\{service="proof\.cache\.openai"\} 123/.test(out)
      && /model_usage_cached_input_tokens_total\{service="proof\.stream\.deepseek"\} 456/.test(out)
      && /model_usage_cached_input_tokens_total\{service="proof\.stream\.bailian"\} 789/.test(out));
    A('显式零建序列不改值（inc(…,0) 只建序列·present_zero 面）',
      /model_usage_cached_input_tokens_total\{service="proof\.cache\.zero"\} 0/.test(out));
    A('字段缺席不建 token 序列（缺席≠零·无 0 假序列）',
      !/model_usage_cached_input_tokens_total\{service="proof\.cache\.absent"\}/.test(out)
      && !/model_usage_cached_input_tokens_total\{service="proof\.stream\.absent"\}/.test(out));
    A('usage 载荷整体缺席不打点（#48 面是载荷内字段在场性）',
      !/model_usage_cache_field_presence_total\{service="proof\.cache\.nousage"/.test(out));
    A('# TYPE 头合法（counter 族）', out.includes('# TYPE model_usage_cache_field_presence_total counter') && out.includes('# TYPE model_usage_cached_input_tokens_total counter'));

    // ── 基线预注册形（registerBaselineMetrics·service 集沿 prompt 注册表单一真源） ──────
    const baseline = createMetrics();
    registerBaselineMetrics(baseline);
    const base = baseline.render();
    A('基线预注册：注册表 service 全集 presence 三态 0 序列（开机即有序列）',
      /model_usage_cache_field_presence_total\{service="mock-interview\.evaluate",presence="absent"\} 0/.test(base)
      && /model_usage_cache_field_presence_total\{service="report\.generate",presence="present_zero"\} 0/.test(base)
      && /model_usage_cache_field_presence_total\{service="resume\.vision",presence="present_positive"\} 0/.test(base));
    A('基线预注册：token counter 0 序列', /model_usage_cached_input_tokens_total\{service="mock-interview\.evaluate"\} 0/.test(base));

    // ── 只观测零计费负臂（源级：观测字段不得渗入结算/对账/计费面） ──────────────────────
    const srcRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
    const invokeSrc = readFileSync(join(srcRoot, 'invoke.ts'), 'utf8');
    const usageReconSrc = readFileSync(join(srcRoot, 'usage-reconciliation.ts'), 'utf8');
    const modelClientSrc = readFileSync(join(srcRoot, 'model-client.ts'), 'utf8');
    A('零计费负臂：invoke.ts 中 cachedInputTokens 恰一处（ModelUsage 型面·settle/validUsage 零读）',
      (invokeSrc.match(/cachedInputTokens/g) ?? []).length === 1);
    A('零计费负臂：usage-reconciliation.ts（对账/refineEstimate 面）零引用',
      (usageReconSrc.match(/cachedInputTokens|cached_tokens/g) ?? []).length === 0);
    A('零计费负臂：打点恰两处（非流+流式各一 emit 点·无重复计数面）',
      (modelClientSrc.match(/emitUsageCacheObservation\(req\.service/g) ?? []).length === 2);
    A('零计费负臂：价格本零缓存价（价格治理面零 cached 引用·沿 rg 红事实复证形）',
      (readFileSync(join(srcRoot, '../../../apps/worker/src/model-cost-governance.ts'), 'utf8').match(/cached_tokens|prompt_cache_hit/g) ?? []).length === 0);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of MUTATED) {
      const value = initial.get(name);
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }

  console.log(`\n${failures === 0 ? '✓ #48 cached_tokens 观测三形证明全部通过' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
