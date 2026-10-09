/**
 * TOKSTREAM S4a 流式通道 fake seam 测试矩阵（唯一蓝本 tokstream-s3-design.md §I S4a 行 · REQUEST §1）。
 *
 * 全 fake seam 零模型外呼（globalThis.fetch mock 沿 test/model-client-dispatch.proof.ts:55/:77 形制），
 * 无网络、无真实凭据、actualSpendCny=null。fixture 全部出自 S2 收据卷
 * receipts/tokstream-s2-probe/2026-10-07/（probe-b.json / probe-b-sse-chunks.redacted.txt / probe-c.json）
 * + 合成卷（§G：手工构造·标注 synthetic）①流中 error frame ②EOF 去 [DONE] 截断 ③>10s 停滞 ④码点中断切点。
 *
 * 覆盖（REQUEST §1 七项 + §4 门清单）：
 *   ①流中 error frame → 即刻截断+error 终态+Σlen 封账守恒到中断点
 *   ②三联终结判定（stop chunk+空 choices usage chunk+[DONE]）+EOF 无三联=streamEndedByEofWithoutDone
 *   ③idle watchdog 10s（§E-③ 本体）+流式总闸（resolveModelStreamDeadlineConfig·泵侧 10min 帽=S4c）
 *   ④TextDecoder 按字节切重放（含码点中断切点）·零孤立代理项
 *   ⑦ΣdeltaLen==accLen 通道内守恒自检（T3 定性器禁断言——校验器单测见 stitch-validator.proof.ts）
 *   ⑧res.ok 先判→classifyProviderError 既有分类→4xx 禁重试（probe-c 404 前置实测卷）
 *   门清单：双 preview flag fail-closed（C3·沿 voice-stream-preview.ts 形制）·G7 零触静态断言·
 *           dispatchOnce(:403)/complete(:362) 零字节 pin·index.ts:32-33 导出面零改·非流式零回归。
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  assertModelTextStreamPreviewComposition,
  isModelTextStreamPreviewEnabled,
  isModelTextStreamPreviewRequested,
  isProductionModelTextStreamLocked,
  MODEL_STREAM_IDLE_WATCHDOG_MS,
  MODEL_TEXT_STREAM_UNCONFIGURED,
  openAICompatibleClient,
  resolveModelStreamDeadlineConfig,
} from '../src/model-client.ts';
import { resolveModelDeadlineConfig, type ModelResult } from '../src/invoke.ts';
import { classifyProviderError } from '../src/g7-freetier-reprove-guard.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: unknown) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok && detail !== undefined) console.log(`      ↳ detail: ${JSON.stringify(detail)}`);
  if (!ok) failures++;
};
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const hasLoneSurrogate = (s: string) => {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) { const n = s.charCodeAt(i + 1); if (!(n >= 0xdc00 && n <= 0xdfff)) return true; }
    if (c >= 0xdc00 && c <= 0xdfff) { const p = i > 0 ? s.charCodeAt(i - 1) : NaN; if (!(p >= 0xd800 && p <= 0xdbff)) return true; }
  }
  return false;
};

// === S2 收据 fixture（@receipts/tokstream-s2-probe/2026-10-07/ 全数亲读）===
const S2_DIR = '../../../ai-docs/delivery/receipts/tokstream-s2-probe/2026-10-07';
interface ProbeBShape {
  attempts: [{
    facts: {
      stitchedText: string;
      usage: { completion_tokens: number; prompt_tokens: number };
      usageChunkEmptyChoices: boolean;
      doneSeen: boolean;
      finishStopSeen: boolean;
    };
  }];
}
const probeB = JSON.parse(readFileSync(fileURLToPath(new URL(`${S2_DIR}/probe-b.json`, import.meta.url)), 'utf8')) as ProbeBShape;
const probeC = JSON.parse(readFileSync(fileURLToPath(new URL(`${S2_DIR}/probe-c.json`, import.meta.url)), 'utf8')) as {
  attempts: [{ status: number; errorSurface: string; totalMs: number; httpBodyRedacted: string }];
  note: string;
};
const sseLines = readFileSync(fileURLToPath(new URL(`${S2_DIR}/probe-b-sse-chunks.redacted.txt`, import.meta.url)), 'utf8')
  .split('\n').map((l) => l.trim()).filter(Boolean);
const wireFrames = sseLines.map((line) => {
  const m = /^t=\d+ms data: (.*)$/.exec(line);
  if (!m || !m[1]) throw new Error(`sse fixture line malformed: ${line}`);
  return `data: ${m[1]}`;
});
const stitchedText = probeB.attempts[0]!.facts.stitchedText;
const fullWire = wireFrames.map((f) => `${f}\n\n`).join('');

// === fake seam：SSE wire 逐字节切分 mock（④按字节切重放/③停滞卷共用）。signal 保真：abort 即
// error 流（真实 transport 断连语义——期限/watchdog abort 必须能打断停滞读取）；停滞卷靠不 enqueue 不 close 模拟。===
function wireResponse(wireText: string, opts: { cutBytes?: number; stallAfterBytes?: number; signal?: AbortSignal } = {}): Response {
  const bytes = new TextEncoder().encode(wireText);
  const cut = Math.max(1, opts.cutBytes ?? bytes.length);
  const limit = opts.stallAfterBytes ?? bytes.length;   // 停滞卷：只供到 limit 字节，之后既不 enqueue 也不 close
  let offset = 0;
  let stored: ReadableStreamDefaultController<Uint8Array> | undefined;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      stored = controller;
      while (offset < bytes.length && offset < limit) {
        const end = Math.min(offset + cut, bytes.length, limit);
        controller.enqueue(bytes.slice(offset, end));
        offset = end;
      }
      if (offset >= bytes.length) controller.close();
    },
  });
  opts.signal?.addEventListener('abort', () => {
    try { stored?.error(new Error('transport_aborted_by_signal')); } catch { /* 流已 close/error（清理面） */ }
  }, { once: true });
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}
const nonStreamResponse = () => new Response(
  JSON.stringify({ choices: [{ message: { content: '{"status":"ok"}' } }] }),
  { status: 200, headers: { 'content-type': 'application/json' } },
);

interface StreamRun {
  result: ModelResult;
  deltas: string[];
  usages: { completionTokens?: number; promptTokens?: number }[];
  calls: { url: string; method?: string; redirect?: string; body: Record<string, unknown> }[];
}
async function runStream(wire: string, opts: { cutBytes?: number; stallAfterBytes?: number } = {}): Promise<StreamRun> {
  const run: StreamRun = { result: null as unknown as ModelResult, deltas: [], usages: [], calls: [] };
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    run.calls.push({
      url: String(input),
      method: init?.method,
      redirect: init?.redirect,
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    return wireResponse(wire, { ...opts, signal: init?.signal ?? undefined });
  }) as typeof fetch;
  const client = openAICompatibleClient();
  run.result = await client.completeStream(
    { service: 'smoke', system: 'trusted system only', userData: 'ping' },
    { onDelta: (d) => { run.deltas.push(d.text); }, onUsage: (u) => { run.usages.push(u); } },
  );
  return run;
}
async function runFallback(flags: Record<string, string | undefined>): Promise<StreamRun> {
  const run: StreamRun = { result: null as unknown as ModelResult, deltas: [], usages: [], calls: [] };
  // 每例前清场：上一例残留的 flag/锁会使本例失真（fail-closed 断言必须逐例独立）。
  delete process.env.MODEL_TEXT_STREAM_ENABLED;
  delete process.env.MODEL_TEXT_STREAM_PREVIEW;
  delete process.env.MEETWISE_PUBLIC_PREVIEW;
  delete process.env.MODEL_COST_ENFORCEMENT;
  process.env.NODE_ENV = 'test';
  for (const [k, v] of Object.entries(flags)) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    run.calls.push({
      url: String(input),
      method: init?.method,
      redirect: init?.redirect,
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    return nonStreamResponse();
  }) as typeof fetch;
  const client = openAICompatibleClient();
  run.result = await client.completeStream(
    { service: 'smoke', system: 'trusted system only', userData: 'ping' },
    { onDelta: (d) => { run.deltas.push(d.text); }, onUsage: (u) => { run.usages.push(u); } },
  );
  return run;
}

const MUTATED = [
  'NODE_ENV', 'MODEL_TEST_TRANSPORT_OVERRIDES', 'MODEL_COST_ENFORCEMENT', 'MEETWISE_PUBLIC_PREVIEW',
  'MODEL_TEXT_STREAM_ENABLED', 'MODEL_TEXT_STREAM_PREVIEW',
  'MODEL_API_KEY', 'MODEL_NAME', 'MODEL_ENDPOINT_PROFILE', 'MODEL_BACKUP_API_KEY',
  'MODEL_EXECUTION_TIMEOUT_MS', 'MODEL_TIMEOUT_MS',
] as const;

async function main() {
  const originalFetch = globalThis.fetch;
  const initial = new Map<string, string | undefined>(MUTATED.map((name) => [name, process.env[name]]));
  let watchdogElapsedMs = -1;
  let gateElapsedMs = -1;
  try {
    // ===== 静态门：dispatchOnce/complete 零字节 pin（REQUEST Ban 7）+ G7 零触 + index.ts:32-33 导出面零改 =====
    const src = readFileSync(fileURLToPath(new URL('../src/model-client.ts', import.meta.url)), 'utf8');
    const block = (start: string, end: string) => {
      const s = src.indexOf(start);
      const e = src.indexOf(end, s);
      if (s < 0 || e < 0) throw new Error(`pin marker missing: ${start.slice(0, 40)}`);
      return src.slice(s, e);
    };
    A('静态门：dispatchOnce 本体零字节零改（sha256 pin @HEAD 89c633f7…）',
      sha256(block('const dispatchOnce = async (dispatchModel: string) => fetchJsonWithTimeout<{', 'const reserveFor = (dispatchModel: string) => {'))
        === '89c633f7060da644ca3c3c7819c5f482c2be8637492351ee26a51001a0dddebc');
    A('静态门：complete 非流式语义原值零字节（sha256 pin @HEAD 3283dfcd…）',
      sha256(block('async complete(req, _attempt, executionSignal) {', '\n    },'))
        === '3283dfcd2739501876c5cea2bb8e46a74f5963929ac2abae2e93a7f0c6dc2127');
    const streamRegion = block('async completeStream(', '\n  };\n  return client;');
    for (const banned of ['g7RuntimeInjection', 'reserveG7CallOnSharedLedger', 'finalizeG7ReservationOnSharedLedger',
      'releaseG7ReservationOnSharedLedger', 'assertModelApiKeyPresent', 'assertModelAllowedForTest', 'reserveFor(']) {
      A(`静态门：completeStream 区域零 g7 面（${banned} 不在场）`, !streamRegion.includes(banned));
    }
    for (const required of ['stream: true', 'include_usage', "[DONE]", 'classifyProviderError', 'streamEndedByEofWithoutDone',
      'resolveModelStreamDeadlineConfig', 'TextDecoder', '码点安全', 'assertConservation']) {
      A(`静态门：completeStream 区域 wire 纪律锚（「${required}」在场）`, streamRegion.includes(required));
    }
    const indexLines = readFileSync(fileURLToPath(new URL('../src/index.ts', import.meta.url)), 'utf8').split('\n');
    A('静态门：index.ts:32 导出面零改',
      indexLines[31] === "export { scriptedModelClient, openAICompatibleClient, modelFor, promptedModel, capUserData, CONTEXT_TRUNCATION_MARKER, planContextBudget, requiresBoundModelOperation } from './model-client.ts';");
    A('静态门：index.ts:33 类型导出面零改',
      indexLines[32] === "export type { ModelClient, CompletionRequest, RenderedContextBudgetPlan, RenderedContextBudgetDecision } from './model-client.ts';");

    // ===== C3 双 preview flag 门（fail-closed 缺省 OFF·沿 voice-stream-preview.ts 形制）=====
    const envTable: NodeJS.ProcessEnv[] = [
      {}, { MODEL_TEXT_STREAM_ENABLED: '1' }, { MODEL_TEXT_STREAM_PREVIEW: '1' },
      { MODEL_TEXT_STREAM_ENABLED: '1', MODEL_TEXT_STREAM_PREVIEW: '1', NODE_ENV: 'production' },
      { MODEL_TEXT_STREAM_ENABLED: '1', MODEL_TEXT_STREAM_PREVIEW: '1', MODEL_COST_ENFORCEMENT: 'enforce' },
      { MODEL_TEXT_STREAM_ENABLED: '1', MODEL_TEXT_STREAM_PREVIEW: '1', MEETWISE_PUBLIC_PREVIEW: '1' },
    ];
    A('C3 纯面：零开/单开 → 未请求未启用；双开未锁 → 请求且启用；三锁面 → 拒绝关闭',
      envTable.every((env, i) => {
        const requested = isModelTextStreamPreviewRequested(env);
        const enabled = isModelTextStreamPreviewEnabled(env);
        const locked = isProductionModelTextStreamLocked(env);
        return i < 3 ? (!requested && !enabled && !locked)
          : (requested && locked && !enabled);
      }));
    let compositionThrew = '';
    try { assertModelTextStreamPreviewComposition({ MODEL_TEXT_STREAM_ENABLED: '1' }); } catch (e) { compositionThrew = e instanceof Error ? e.message : String(e); }
    A('C3 构造面：ENABLED=1 缺 PREVIEW → 显式 model_text_stream_unconfigured（OCR 式误配不得静默）',
      compositionThrew === MODEL_TEXT_STREAM_UNCONFIGURED);
    compositionThrew = '';
    try { assertModelTextStreamPreviewComposition({ MODEL_TEXT_STREAM_ENABLED: '1', MODEL_TEXT_STREAM_PREVIEW: '1', NODE_ENV: 'production' }); } catch (e) { compositionThrew = e instanceof Error ? e.message : String(e); }
    A('C3 构造面：双开+production 锁 → 同样显式拒绝', compositionThrew === MODEL_TEXT_STREAM_UNCONFIGURED);
    compositionThrew = '';
    try { assertModelTextStreamPreviewComposition({ MODEL_TEXT_STREAM_ENABLED: '1', MODEL_TEXT_STREAM_PREVIEW: '1' }); } catch (e) { compositionThrew = e instanceof Error ? e.message : String(e); }
    A('C3 构造面：双开未锁（test env）→ 不抛', compositionThrew === '');

    process.env.NODE_ENV = 'test';
    delete process.env.MODEL_TEST_TRANSPORT_OVERRIDES;
    delete process.env.MODEL_COST_ENFORCEMENT;
    delete process.env.MEETWISE_PUBLIC_PREVIEW;
    delete process.env.MODEL_ENDPOINT_PROFILE;
    delete process.env.MODEL_BACKUP_API_KEY;
    process.env.MODEL_API_KEY = 'proof-text-key';
    process.env.MODEL_NAME = 'qwen-plus';
    delete process.env.MODEL_TEXT_STREAM_ENABLED;
    delete process.env.MODEL_TEXT_STREAM_PREVIEW;

    // flag 未双开 → completeStream 恒走非流式（零回归）；production/enforce 锁面下 complete 既有
    // bound-operation fence 语义原值接管（零外呼 deterministic 拒绝=更强 fail-closed·零回归）。
    const c3Cases = [
      { label: '零开', flags: {} as Record<string, string>, expect: 'dispatch' },
      { label: '单开 ENABLED', flags: { MODEL_TEXT_STREAM_ENABLED: '1' }, expect: 'dispatch' },
      { label: '单开 PREVIEW', flags: { MODEL_TEXT_STREAM_PREVIEW: '1' }, expect: 'dispatch' },
      { label: '双开+production 锁', flags: { MODEL_TEXT_STREAM_ENABLED: '1', MODEL_TEXT_STREAM_PREVIEW: '1', NODE_ENV: 'production' }, expect: 'fence' },
      { label: '双开+enforce 锁', flags: { MODEL_TEXT_STREAM_ENABLED: '1', MODEL_TEXT_STREAM_PREVIEW: '1', MODEL_COST_ENFORCEMENT: 'enforce' }, expect: 'fence' },
      { label: '双开+public-preview 锁', flags: { MODEL_TEXT_STREAM_ENABLED: '1', MODEL_TEXT_STREAM_PREVIEW: '1', MEETWISE_PUBLIC_PREVIEW: '1' }, expect: 'dispatch' },
    ];
    for (const c of c3Cases) {
      const r = await runFallback({ ...c.flags });
      const body = r.calls[0]?.body ?? {};
      const okFlag = c.expect === 'fence'
        ? r.calls.length === 0 && r.deltas.length === 0
          && r.result.ok === false && r.result.kind === 'deterministic' && r.result.externalOutcome === 'known_not_executed'
        : r.calls.length === 1 && !('stream' in body) && !('stream_options' in body)
          && r.deltas.length === 0 && r.result.ok === true;
      A(`C3 fail-closed：${c.label} → 恒走非流式（${c.expect === 'fence' ? '零外呼·complete 既有 bound-operation fence 原语义拒绝' : '请求体零 stream 字段·与非流式同型'}·零 delta 回调）`,
        okFlag, { calls: r.calls.length, result: r.result });
      process.env.NODE_ENV = 'test';
      delete process.env.MODEL_COST_ENFORCEMENT;
      delete process.env.MEETWISE_PUBLIC_PREVIEW;
    }

    // ===== C2 wire 纪律 + probe-b 全卷重放（三联终结判定+⑦守恒+usage 面解析）=====
    process.env.MODEL_TEXT_STREAM_ENABLED = '1';
    process.env.MODEL_TEXT_STREAM_PREVIEW = '1';
    const full = await runStream(fullWire);
    const body0 = full.calls[0]?.body ?? {};
    A('C2 wire：stream=true + stream_options.include_usage=true',
      body0['stream'] === true && (body0['stream_options'] as Record<string, unknown> | undefined)?.['include_usage'] === true);
    A('C2 wire：redirect=error + POST + 注册表 host/path（https://api.deepseek.com/chat/completions）+ Bearer 文本 Key',
      full.calls[0]?.redirect === 'error' && full.calls[0]?.method === 'POST'
      && full.calls[0]?.url === 'https://api.deepseek.com/chat/completions');
    A('probe-b 重放：三联终结判定 → ok:true·单飞一次 fetch（禁自动重跑）',
      full.result.ok === true && full.calls.length === 1);
    A('probe-b 重放：ΣdeltaLen==accLen 守恒 + 拼接全等（=收据 stitchedText 72 字符）',
      full.deltas.reduce((n, d) => n + d.length, 0) === stitchedText.length
      && full.deltas.join('') === stitchedText);
    A('probe-b 重放：usage 面解析（空 choices usage chunk → completion_tokens=43/prompt_tokens=32·ModelResult usage 面同型）',
      full.usages.length === 1 && full.usages[0]?.completionTokens === 43 && full.usages[0]?.promptTokens === 32
      && full.result.ok === true && full.result.usage?.outputTokens === 43 && full.result.usage?.inputTokens === 32);
    A('probe-b 重放：raw=完整原文（prose fixture·json_object 未启重放卷按完整原文兜底零截断）',
      full.result.ok === true && full.result.raw === stitchedText);
    A('probe-b 重放：onDelta 每片码点完整（零孤立代理项）', full.deltas.every((d) => !hasLoneSurrogate(d)));

    // ④按字节切重放：切点穿多字节码点与帧定界（cut=13 与逐字节 cut=1）。
    for (const cut of [13, 1]) {
      const r = await runStream(fullWire, { cutBytes: cut });
      A(`④按字节切重放（每 ${cut} 字节一切）：码点安全+拼接全等+三联 ok+守恒`,
        r.result.ok === true && r.calls.length === 1 && r.deltas.join('') === stitchedText
        && r.deltas.every((d) => !hasLoneSurrogate(d)));
    }

    // ===== 合成卷①（synthetic）：流中 error frame → 即刻截断+error 终态+Σlen 封账到中断点 =====
    const vol1 = [
      'data: {"choices":[{"delta":{"content":"A"},"index":0,"finish_reason":null}]}\n\n',
      'data: {"choices":[{"delta":{"content":"B"},"index":0,"finish_reason":null}]}\n\n',
      'data: {"error":{"message":"midstream boom","code":"internal_error"}}\n\n',
      'data: {"choices":[{"delta":{"content":"C"},"index":0,"finish_reason":null}]}\n\n',
      'data: [DONE]\n\n',
    ].join('');
    for (const cut of [undefined, 7]) {
      const r = await runStream(vol1, cut === undefined ? {} : { cutBytes: cut });
      A(`合成卷①流中 error frame（synthetic${cut === undefined ? '' : '·cut=7'}）：即刻截断+error 终态+账面到中断点（AB）+单飞`,
        r.result.ok === false && r.result.kind === 'transient' && r.result.externalOutcome === 'unknown'
        && r.deltas.join('') === 'AB' && r.calls.length === 1);
    }

    // ===== 合成卷②（synthetic·由 probe-b 卷派生去 [DONE]）：EOF 无三联=静默断流 =====
    A('合成卷②前置：派生卷确为去 [DONE]（尾帧原为 data: [DONE]）', wireFrames[wireFrames.length - 1] === 'data: [DONE]');
    const truncatedWire = wireFrames.slice(0, -1).map((f) => `${f}\n\n`).join('');
    const vol2 = await runStream(truncatedWire);
    A('合成卷②EOF 去 [DONE]：三联不齐 → streamEndedByEofWithoutDone 语义 error 终态·零自动重跑',
      vol2.result.ok === false && vol2.result.kind === 'transient' && vol2.result.externalOutcome === 'unknown'
      && vol2.calls.length === 1);
    A('合成卷②：stop chunk+usage chunk 已见但 [DONE] 缺失 → 仍判三联不齐（delta 账面完整 72）',
      vol2.usages.length === 1 && vol2.deltas.join('') === stitchedText);

    // ===== 合成卷④（synthetic·码点中断切点）：JSON 转义代理对跨 chunk 拆分 → 零孤立代理项 =====
    const vol4 = [
      'data: {"choices":[{"delta":{"content":"a\\ud83d"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"\\udca4b"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":""},"index":0,"finish_reason":"stop"}]}\n\n',
      'data: {"choices":[],"usage":{"completion_tokens":4,"prompt_tokens":9}}\n\n',
      'data: [DONE]\n\n',
    ].join('');
    const r4 = await runStream(vol4, { cutBytes: 5 });
    A('合成卷④码点中断切点（synthetic）：\\ud83d/\\udca4 跨帧拆分 → 零孤立代理项+拼接 a💤b（U+1F4A4）+三联 ok',
      r4.result.ok === true && r4.deltas.join('') === 'a💤b'
      && r4.deltas.every((d) => !hasLoneSurrogate(d))
      && r4.usages.length === 1 && r4.usages[0]?.completionTokens === 4);

    // ===== 合成卷③（synthetic）：>10s 停滞 → idle watchdog 截断走①路径（§E-③ 本体）=====
    const stallWireHead = 'data: {"choices":[{"delta":{"content":"first"}}]}\n\n';
    const t0 = Date.now();
    const vol3 = await runStream(stallWireHead + 'data: [DONE]\n\n', { stallAfterBytes: Buffer.byteLength(stallWireHead, 'utf8') });
    watchdogElapsedMs = Date.now() - t0;
    A('合成卷③>10s 停滞（synthetic）：watchdog 截断 → error 终态·单飞禁自动重跑',
      vol3.result.ok === false && vol3.result.kind === 'transient' && vol3.result.externalOutcome === 'unknown'
      && vol3.calls.length === 1);
    A('合成卷③：截断发生在 idle watchdog 窗（实测 ≥10s 钉值·时钟粒度容差 1%）',
      watchdogElapsedMs >= Math.floor(MODEL_STREAM_IDLE_WATCHDOG_MS * 0.99));

    // ===== ③总闸：流式 transport 期限沿 resolveModelStreamDeadlineConfig（既有 MODEL_EXECUTION_TIMEOUT_MS 派生）=====
    // A14 既有契约 transport ≤ execution：总闸测试缝同时压两值到 1s 下界（既有 env·零新增注入面）。
    process.env.MODEL_EXECUTION_TIMEOUT_MS = '1000';
    process.env.MODEL_TIMEOUT_MS = '1000';
    const t1 = Date.now();
    const volGate = await runStream(stallWireHead + 'data: [DONE]\n\n', { stallAfterBytes: Buffer.byteLength(stallWireHead, 'utf8') });
    gateElapsedMs = Date.now() - t1;
    delete process.env.MODEL_EXECUTION_TIMEOUT_MS;
    delete process.env.MODEL_TIMEOUT_MS;
    A('③总闸：总闸期限 < watchdog 时先触发 → error 终态·单飞（双层期限在通道内成立·泵侧 10min 帽=S4c）',
      volGate.result.ok === false && volGate.calls.length === 1
      && gateElapsedMs >= 990 && gateElapsedMs < MODEL_STREAM_IDLE_WATCHDOG_MS,
      { calls: volGate.calls.length, result: volGate.result, gateElapsedMs });
    A('③期限面：resolveModelStreamDeadlineConfig 缺省=execution 维度+idle 10s 钉值',
      resolveModelStreamDeadlineConfig().transportTimeoutMs === resolveModelDeadlineConfig().executionTimeoutMs
      && resolveModelStreamDeadlineConfig().idleWatchdogMs === MODEL_STREAM_IDLE_WATCHDOG_MS
      && MODEL_STREAM_IDLE_WATCHDOG_MS === 10_000);
    process.env.MODEL_EXECUTION_TIMEOUT_MS = '1000';
    process.env.MODEL_TIMEOUT_MS = '1000';
    const gated = resolveModelStreamDeadlineConfig();
    delete process.env.MODEL_EXECUTION_TIMEOUT_MS;
    delete process.env.MODEL_TIMEOUT_MS;
    A('③期限面：env 另设流式值生效（MODEL_EXECUTION_TIMEOUT_MS=1000 → 总闸 1000·零新增 env 注入面）',
      gated.transportTimeoutMs === 1000);

    // ===== ⑧probe-c 重放：res.ok 先判 → classifyProviderError 既有分类 → 4xx 禁重试 =====
    const cBody = probeC.attempts[0]!.httpBodyRedacted;
    A('⑧前置：probe-c 收据锚（status=404·http_status_first·零流字节·「probe C is never retried」）',
      probeC.attempts[0]?.status === 404 && probeC.attempts[0]?.errorSurface === 'http_status_first'
      && probeC.note === 'probe C is never retried (REQUEST pin)');
    A('⑧分类面：classifyProviderError(404 body) → capability_unsupported（S2 亲证既有分类）',
      classifyProviderError(cBody) === 'capability_unsupported');
    let cCalls = 0;
    let cDeltas = 0;
    globalThis.fetch = (async () => {
      cCalls += 1;
      return new Response(cBody, { status: 404, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;
    const clientC = openAICompatibleClient();
    const resC = await clientC.completeStream(
      { service: 'smoke', system: 'trusted system only', userData: 'ping' },
      { onDelta: () => { cDeltas += 1; } },
    );
    A('⑧res.ok 先判：404 前置 → deterministic+known_not_executed·零 delta·4xx 禁重试（恰一次）',
      resC.ok === false && resC.kind === 'deterministic' && resC.externalOutcome === 'known_not_executed'
      && cCalls === 1 && cDeltas === 0);

    // ===== 非流式零回归（行为面）：flag 双开时 client.complete 请求体仍零 stream 字段 =====
    let plainCalls = 0;
    let plainBody: Record<string, unknown> = {};
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      plainCalls += 1;
      plainBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return nonStreamResponse();
    }) as typeof fetch;
    const plain = await openAICompatibleClient().complete({ service: 'smoke', system: 'trusted system only', userData: 'ping' }, 1);
    A('非流式零回归：complete 语义原值（单飞一次·请求体零 stream 字段·ok:true）',
      plain.ok === true && plainCalls === 1 && !('stream' in plainBody) && !('stream_options' in plainBody));
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of MUTATED) {
      const value = initial.get(name);
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
  console.log(`\n${failures === 0 ? '✓ TOKSTREAM S4a 流式通道 fake seam 矩阵全部通过（零模型外呼·actualSpendCny=null）' : `✗ ${failures} 项失败`}`);
  console.log(`watchdog 实测=${watchdogElapsedMs}ms 总闸实测=${gateElapsedMs}ms（EXIT 原值入收据）`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
