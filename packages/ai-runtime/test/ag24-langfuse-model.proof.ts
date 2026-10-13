/**
 * AG-24 Langfuse 模型归因 + G7 回退估算修 + 进程内限流/熔断残留清理证明（fixture/源级·零模型外呼·零网络·零 DB）。
 *
 * 覆盖（REQUEST §2-1 断言面·span 三档真名/cached 在手/cost 对表臂在 runtime-kernel.proof.ts 可观测段——
 * 两面分工不双维护）：
 *   ① Langfuse 映射：model 真名归因（span.model ?? span.service·缺省降级=现状零回归）、
 *     usageDetails.input_cached 条件挂键（undefined=键不出现·0=挂 0·缺席≠零铁律）、
 *     metadata.settledCostMicroCny 两态（在手=逐字透传·缺省=null 占位）、
 *     span **名称** meetwise.model.<service> 分组键零字节、脱敏负证（model 不入 metadata 白名单）。
 *   ② G7 :650 回退估算数组形修（AC-F13）+ :710 第三消费点随动：带图请求 usage.prompt_tokens 缺席时
 *     usage.inputTokens=各段拼接字符量/4（≠数组元素数负证·≠64 塌缩负证）；无图字符串形与旧公式恒等（零位移）。
 *   ③ 残留清理六面源证：两残留件文件不在树 + index.ts 导出撤（failoverModel 活导出零字节保留在证）+
 *     metrics 键/基线序列零命中 + 告警与白名单行撤 + 门名两处撤（新门 prove:ag24-langfuse-model 在）+
 *     四处死 env 撤（worker.env.example :118 WORKER_INTERVIEW_GLOBAL_INFLIGHT 活键保留负证）。
 *
 * 全 fake seam（globalThis.fetch mock 沿 model-usage-cache-observe.proof.ts 形制·受控注册表端点+mock 响应）：
 * 无网络、无真实凭据、actualSpendCny=null、est live=0。
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { openAICompatibleClient, langfuseSafeModelMetadata, createMetrics, registerBaselineMetrics } from '../src/index.ts';
import type { ModelResult } from '../src/invoke.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: unknown) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok && detail !== undefined) console.log(`      ↳ detail: ${JSON.stringify(detail)}`);
  if (!ok) failures++;
};
const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '../src');
const read = (rel: string) => readFileSync(join(srcRoot, rel), 'utf8');
const repoRoot = join(srcRoot, '../../..');

const MUTATED = [
  'NODE_ENV', 'MODEL_TEST_TRANSPORT_OVERRIDES', 'MODEL_COST_ENFORCEMENT', 'MEETWISE_PUBLIC_PREVIEW',
  'MODEL_TEXT_STREAM_ENABLED', 'MODEL_TEXT_STREAM_PREVIEW',
  'MODEL_API_KEY', 'MODEL_NAME', 'MODEL_ENDPOINT_PROFILE', 'MODEL_BACKUP_API_KEY',
] as const;

type UsagePayload = Record<string, unknown> & { prompt_tokens?: number; completion_tokens?: number };

async function main() {
  const originalFetch = globalThis.fetch;
  const initial = new Map<string, string | undefined>(MUTATED.map((name) => [name, process.env[name]]));
  try {
    // ── ① Langfuse 映射面（langfuseSafeModelMetadata 纯函数 + 源钉）─────────────────────
    const langfuseSrc = read('langfuse-v5.ts');
    const metadataKeys = 'attempt,inputTokens,invocationRef,latencyMs,outcome,outputTokens,ownerRef,promptVersion,retrievalCount,settledCostMicroCny,sourceCount,threadRef,topRetrievalScore';
    const withCost = langfuseSafeModelMetadata({
      owner: 'ag24-user', idempotencyKey: 'LF:ag24:known', attempt: 1, outcome: 'ok', latencyMs: 10,
      service: 'ag24.service', model: 'qwen3.8-flash', cachedInputTokens: 77, settledCostMicroCny: 4567,
      inputTokens: 100, outputTokens: 20,
    }, 'fixture-correlation-secret');
    const withoutCost = langfuseSafeModelMetadata({
      owner: 'ag24-user', idempotencyKey: 'LF:ag24:known', attempt: 1, outcome: 'exhausted', latencyMs: 10,
      service: 'ag24.service', inputTokens: 5, outputTokens: 1,
    }, 'fixture-correlation-secret');
    A('AG-24① 成本标量两态：在手=逐字透传（4567），缺省=null 占位（缺省≠零·沿 promptVersion 同形）',
      withCost.settledCostMicroCny === 4567 && withoutCost.settledCostMicroCny === null
        && Object.keys(withoutCost).sort().join(',') === metadataKeys
        && Object.keys(withCost).sort().join(',') === metadataKeys);
    A('AG-24① 脱敏负证：model/cachedInputTokens 不入 metadata 白名单（真名走 generation 顶层字段·cached 走 usageDetails）',
      !('model' in withCost) && !('cachedInputTokens' in withCost)
        && !JSON.stringify(withCost).includes('qwen3.8-flash'));
    A('AG-24① 源钉：generation model 真名归因=span.model 优先·缺省降级 safeName(service)（现状降级路径零回归）',
      /model: safeName\(span\.model \?\? span\.service, 'unknown'\)/.test(langfuseSrc));
    A('AG-24① 源钉：usageDetails.input_cached 条件挂键（span.cachedInputTokens !== undefined 时挂·undefined=键不出现·显式 0=挂 0）',
      /\.\.\.\(span\.cachedInputTokens !== undefined \? \{ input_cached: span\.cachedInputTokens \} : \{\}\),/.test(langfuseSrc));
    A('AG-24① 源钉：span 名称分组键零字节（meetwise.model.<safeName(service)> 原样·Langfuse 看板分组稳定）',
      /startObservation\(`meetwise\.model\.\$\{safeName\(span\.service, 'unknown'\)\}`/.test(langfuseSrc));
    A('AG-24① 源钉：metadata 白名单形制 additive（settledCostMicroCny: span.settledCostMicroCny ?? null）',
      /settledCostMicroCny: span\.settledCostMicroCny \?\? null,/.test(langfuseSrc));
    A('AG-24① 源钉：invoke span 闭包三透传（model 源优先序 extra?.model ?? spanCostModel·cachedInputTokens·settledCostMicroCny）',
      /model: extra\?\.model \?\? spanCostModel/.test(read('invoke.ts'))
        && /cachedInputTokens: usage\?\.cachedInputTokens,/.test(read('invoke.ts'))
        && /settledCostMicroCny: extra\?\.settledCostMicroCny/.test(read('invoke.ts')));
    A('AG-24① 源钉：InvokeSpanFn 扩可选参（extra?: InvokeSpanExtra）+ 终局 ok 臂携带真名/成本（中间臂缺省不挂）',
      /type InvokeSpanFn = \(attempt: number, outcome: ModelCallOutcome, latencyMs: number, usage\?: ModelUsage, extra\?: InvokeSpanExtra\) => void;/.test(read('invoke.ts'))
        && /span\(1, 'ok', latencyMs, settledUsage, \{ model: result\.actualModel, settledCostMicroCny: policy \? settledCost : undefined \}\);/.test(read('invoke.ts')));

    // ── ② G7 :650 回退估算数组形修 + :710 第三消费点随动（fetch mock·零外呼）──────────────
    process.env.NODE_ENV = 'test';
    for (const name of MUTATED) if (!['MODEL_API_KEY', 'MODEL_NAME'].includes(name)) delete process.env[name];
    process.env.MODEL_API_KEY = 'ag24-proof-key';
    process.env.MODEL_NAME = 'qwen-plus';

    type WireBody = { messages: { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }[] };
    const bodies: WireBody[] = [];
    const usageResponse = (promptTokensAbsent: boolean): Response => new Response(
      JSON.stringify({
        model: 'qwen-plus',
        choices: [{ message: { content: '{"ok":true}' }, finish_reason: 'stop' }],
        usage: { ...(promptTokensAbsent ? {} : { prompt_tokens: 100 }), completion_tokens: 5 },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );

    const userData = 'x'.repeat(400);
    const images = ['https://img.invalid/aaaaaaaaaa.png', 'https://img.invalid/bbbbbbbbbb.png'];
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      bodies.push(JSON.parse(String(init?.body)) as WireBody);
      return usageResponse(true);   // prompt_tokens 缺席 → :710 fallback 到 estimatedInputTokens
    }) as typeof fetch;
    const withImages: ModelResult = await openAICompatibleClient().complete(
      { service: 'ag24.estimate', system: 'trusted system only', userData, images }, 1,
    );
    const imageBody = bodies[bodies.length - 1]!;
    const systemLen = (imageBody.messages[0]!.content as string).length;
    const segments = imageBody.messages[1]!.content as Array<{ type: string; text?: string; image_url?: { url: string } }>;
    const segmentChars = segments.reduce((sum, part) => sum + (part.type === 'text' ? part.text!.length : part.image_url!.url.length), 0);
    const expectedImageEstimate = Math.max(64, Math.ceil((systemLen + segmentChars) / 4));
    const collapsedElementFormula = Math.max(64, Math.ceil((systemLen + segments.length) / 4));
    A('AG-24② 带图数组形：:710 消费的 usage.inputTokens=各段拼接字符量/4（≠数组元素数旧公式·≠64 塌缩负证）',
      withImages.ok === true && withImages.usage?.inputTokens === expectedImageEstimate
        && expectedImageEstimate !== collapsedElementFormula && expectedImageEstimate > 64,
      { expectedImageEstimate, collapsedElementFormula, actual: withImages.ok === true ? withImages.usage?.inputTokens : withImages });

    const noImages: ModelResult = await openAICompatibleClient().complete(
      { service: 'ag24.estimate', system: 'trusted system only', userData }, 1,
    );
    const stringBody = bodies[bodies.length - 1]!;
    const stringSystemLen = (stringBody.messages[0]!.content as string).length;
    const userLen = (stringBody.messages[1]!.content as string).length;
    const expectedStringEstimate = Math.max(64, Math.ceil((stringSystemLen + userLen) / 4));
    A('AG-24② 无图字符串形：与旧公式恒等（零位移负证臂·.length 语义不变）',
      noImages.ok === true && noImages.usage?.inputTokens === expectedStringEstimate && expectedStringEstimate > 64);
    A('AG-24② 数组修与字符串修分离：带图估算 > 无图估算（图片段字符量计入·非塌缩同值）',
      expectedImageEstimate > expectedStringEstimate);

    // ── ③ 残留清理六面源证 ────────────────────────────────────────────────────────────────
    A('AG-24③ 两残留件整删（circuit-breaker.ts/rate-limit-model.ts/breaker.proof.ts 不在树）',
      !existsSync(join(srcRoot, 'circuit-breaker.ts')) && !existsSync(join(srcRoot, 'rate-limit-model.ts'))
        && !existsSync(join(dirname(fileURLToPath(import.meta.url)), 'breaker.proof.ts')));
    const indexSrc = read('index.ts');
    A('AG-24③ index.ts 导出撤五留一（breaker/limiter 导出面零命中·failoverModel 生产活导出零字节保留）',
      !indexSrc.includes("from './circuit-breaker.ts'") && !indexSrc.includes("from './rate-limit-model.ts'")
        && !indexSrc.includes('rateLimitedModel') && !indexSrc.includes('circuitBreaker')
        && !indexSrc.includes('resolveModelRateLimitConfig') && !indexSrc.includes('BreakerOpts')
        && /export \{ failoverModel \} from '\.\/failover-model\.ts';/.test(indexSrc));
    const metricsSrc = read('metrics.ts');
    A('AG-24③ metrics.ts breaker 键/注释/基线播种零命中',
      !metricsSrc.includes('circuitBreakerOpen') && !metricsSrc.includes('model_circuit_breaker_open_total'));
    const metricsRegistry = createMetrics();
    registerBaselineMetrics(metricsRegistry);
    const baselineRender = metricsRegistry.render();
    A('AG-24③ registerBaselineMetrics render() 无 model_circuit_breaker_open_total 序列（refund 0 基线在）',
      !baselineRender.includes('model_circuit_breaker_open_total') && /refund_failed_total 0/.test(baselineRender));
    const rootPkg = readFileSync(join(repoRoot, 'package.json'), 'utf8');
    const aiRuntimePkg = readFileSync(join(repoRoot, 'packages/ai-runtime/package.json'), 'utf8');
    A('AG-24③ 门名两处撤 + 新门在（根无 breaker:prove·ai-runtime 无 prove:breaker·prove:ag24-langfuse-model 注册且聚合 prove 首段 runtime-kernel 不变）',
      !rootPkg.includes('"breaker:prove"') && !aiRuntimePkg.includes('"prove:breaker"')
        && aiRuntimePkg.includes('"prove:ag24-langfuse-model": "tsx test/ag24-langfuse-model.proof.ts"')
        && /^    "prove": "tsx test\/runtime-kernel\.proof\.ts &&/m.test(aiRuntimePkg));
    const alertSrc = readFileSync(join(repoRoot, 'docker/monitoring/alert.rules.yml'), 'utf8');
    const lintSrc = readFileSync(join(repoRoot, 'scripts/alerts-lint.mjs'), 'utf8');
    A('AG-24③ 死告警与白名单行撤（alert.rules.yml 无该序列/规则名·alerts-lint 白名单无该行）',
      !alertSrc.includes('model_circuit_breaker_open_total') && !alertSrc.includes('ModelCircuitBreakerOpen')
        && !lintSrc.includes('model_circuit_breaker_open_total'));
    const prodEnv = readFileSync(join(repoRoot, 'docker/compose.prod.yml'), 'utf8');
    const haEnv = readFileSync(join(repoRoot, 'docker/compose.ha.yml'), 'utf8');
    const apiEnv = readFileSync(join(repoRoot, 'docker/env/api.env.example'), 'utf8');
    const workerEnv = readFileSync(join(repoRoot, 'docker/env/worker.env.example'), 'utf8');
    A('AG-24③ 四处死 env 撤（compose.prod/compose.ha/api.env.example 零命中）',
      !prodEnv.includes('MODEL_MAX_CONCURRENT') && !prodEnv.includes('MODEL_RPM')
        && !haEnv.includes('MODEL_MAX_CONCURRENT') && !haEnv.includes('MODEL_RPM')
        && !apiEnv.includes('MODEL_MAX_CONCURRENT') && !apiEnv.includes('MODEL_RPM'));
    A('AG-24③ worker.env.example 死键撤 + 活键保留负证（WORKER_INTERVIEW_GLOBAL_INFLIGHT 活旋钮勿删在证）',
      !workerEnv.includes('MODEL_MAX_CONCURRENT') && !workerEnv.includes('MODEL_RPM')
        && workerEnv.includes('WORKER_INTERVIEW_GLOBAL_INFLIGHT'));
    const invokeSrc = read('invoke.ts');
    A('AG-24③ 共享权威零触负证（invoke admit 相位/model_circuit 决策码零字节·残留删除只删残留）',
      invokeSrc.includes('admitSharedModelOperation') && invokeSrc.includes('model_circuit_half_open')
        && !invokeSrc.includes('circuit-breaker.ts') && !invokeSrc.includes('rate-limit-model.ts'));
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of MUTATED) {
      const value = initial.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }

  console.log(`\n${failures === 0 ? '✓ AG-24 Langfuse 模型归因+G7 估算修+残留清理全部通过' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => { console.error(error); process.exit(1); });
