/**
 * ASR 质量申报结构化证明。`pnpm prove:asr-quality-declaration`（本地脚本 provider：仅
 * in-memory fetch mock，零真实外呼，est live=0）。
 *
 * 真断言（能失败的断言，非空泛分类）：
 *   形  Asr 接口返回结构化 AsrTranscription = { text, quality }，quality 三字段
 *       （confidence/duration/language）只收显式字面量申报——能力声明而非模型猜测；
 *   申报 qwen-audio 兼容端点响应面只有 content 一字段，适配器一律诚实申报
 *       unavailable，请求体零新增字段零 prompt 结构改动；
 *   关  fail-closed 组合根对非结构化返回/缺申报/申报形不符一律 asr_malformed，
 *       不猜值不补默认。
 */
import { dashscopeAsr, fakeAsr, ASR_QUALITY_UNAVAILABLE, type Asr, type AsrTranscription } from '../src/voice.ts';
import { failClosedAsr } from '../src/interview-voice-seams.ts';

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function errorOf(action: () => Promise<unknown>): Promise<string> {
  try { await action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

const ENV_NAMES = [
  'DASHSCOPE_ASR_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_ENDPOINT_PROFILE', 'DASHSCOPE_WORKSPACE_ID',
  'DASHSCOPE_COMPAT_BASE_URL', 'DASHSCOPE_ASR_MODEL', 'DASHSCOPE_TEST_TRANSPORT_OVERRIDES',
  'DASHSCOPE_ASR_API_KEY_FINGERPRINT', 'DASHSCOPE_REVOKED_KEY_FINGERPRINTS',
] as const;

function qualityDeclared(value: unknown): boolean {
  const q = value as AsrTranscription['quality'] | undefined;
  return q !== undefined && typeof q === 'object'
    && q.confidence === 'unavailable' && q.duration === 'unavailable' && q.language === 'unavailable';
}

async function main() {
  const saved = new Map(ENV_NAMES.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  try {
    for (const name of ENV_NAMES) delete process.env[name];
    process.env.DASHSCOPE_ASR_API_KEY = 'asr-quality-proof-key';
    process.env.DASHSCOPE_ENDPOINT_PROFILE = 'cn-beijing-public';

    // ── 接口形：fakeAsr 返回结构化 { text, quality }，申报三元恒 unavailable（fake 不伪造置信信号）。 ──
    const faked = await fakeAsr('用 Redis 计数器加滑动窗口').transcribe(new Uint8Array([1, 2, 3]), { format: 'wav' });
    check('fakeAsr 返回结构化 text+quality（判词载体非纯文本）',
      typeof faked.text === 'string' && faked.text === '用 Redis 计数器加滑动窗口' && qualityDeclared(faked.quality));
    check('申报常量三元全 unavailable 且冻结（唯一诚实申报形）',
      qualityDeclared(ASR_QUALITY_UNAVAILABLE) && Object.isFrozen(ASR_QUALITY_UNAVAILABLE));

    // ── 适配器：mocked in-memory transport 下成功路径。 ──
    const calls: Array<{ body?: unknown }> = [];
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      calls.push({ body: init?.body === undefined ? undefined : JSON.parse(String(init.body)) });
      return new Response(JSON.stringify({ choices: [{ message: { content: '转写文本' } }] }), {
        status: 200, headers: [['content-type', 'application/json']],
      });
    }) as typeof fetch;

    const adapter = await dashscopeAsr({ timeoutMs: 500 }).transcribe(new Uint8Array([1, 2, 3]), { format: 'wav' });
    check('适配器成功路径返回结构化结果且质量恒诚实申报 unavailable',
      adapter.text === '转写文本' && qualityDeclared(adapter.quality));

    const body = calls[0]?.body as { model?: unknown; messages?: unknown } | undefined;
    const message = (body?.messages as Array<{ role?: string; content?: Array<{ type?: string }> }> | undefined)?.[0];
    check('请求体零新增字段：顶层恰 model+messages，content 恰 input_audio+text 两段',
      body !== undefined
      && Object.keys(body).sort().join(',') === 'messages,model'
      && message?.role === 'user'
      && message?.content?.map((part) => part.type).join(',') === 'input_audio,text');

    // ── fail-closed 组合根：非结构化/缺申报/申报形不符一律 asr_malformed，不猜值不补默认。 ──
    const inner = (value: unknown): Asr => ({ transcribe: async () => value as AsrTranscription });
    check('旧串形返回被 fail-closed 拒绝（asr_malformed）',
      await errorOf(() => failClosedAsr(inner('纯文本转写')).transcribe(new Uint8Array([1]))) === 'asr_malformed');
    check('缺 quality 申报被拒绝',
      await errorOf(() => failClosedAsr(inner({ text: '转写文本' })).transcribe(new Uint8Array([1]))) === 'asr_malformed');
    check('空对象/残缺申报形被拒绝',
      await errorOf(() => failClosedAsr(inner({ text: '转写文本', quality: {} })).transcribe(new Uint8Array([1]))) === 'asr_malformed'
      && await errorOf(() => failClosedAsr(inner({ text: '转写文本', quality: { confidence: 'unavailable' } })).transcribe(new Uint8Array([1]))) === 'asr_malformed');
    check('null 返回被拒绝；合法结构化返回原样通过',
      await errorOf(() => failClosedAsr(inner(null)).transcribe(new Uint8Array([1]))) === 'asr_malformed'
      && (await failClosedAsr(inner({ text: '转写文本', quality: { ...ASR_QUALITY_UNAVAILABLE } })).transcribe(new Uint8Array([1]))).text === '转写文本');
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of ENV_NAMES) {
      const value = saved.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }

  console.log(`\n${failures === 0 ? '✓ ASR 质量申报结构化全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();
