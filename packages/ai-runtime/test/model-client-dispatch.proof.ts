/**
 * H2 修复证明：文本主链路 SSRF 守卫的 dispatch 级 proof（此前是假绿）。
 *
 * 之前所有派发文本 client 的 proof 都走 NODE_ENV=test + MODEL_TEST_TRANSPORT_OVERRIDES=1 的
 * 测试 override 缝，三处承重守卫（构造期拒绝任意 baseUrl/apiKey、派发 redirect=error、
 * baseUrl 精确等于注册表 host/path）没有任何 dispatch 级证据。
 *
 * 本证明 mock 掉 fetch、关掉 override 缝，直接证明：
 *   ① 构造传 baseUrl / apiKey 即抛 text_transport_override_forbidden（生产或 override 关）；
 *   ② 正常派发时 fetch 收到 redirect='error'（3xx 即拒绝，防 SSRF 跳内网）；
 *   ③ 派发 URL 精确等于受控注册表 host/path（deepseek-cn-public → https://api.deepseek.com/chat/completions）。
 * 无网络、无真实凭据。
 */
import { openAICompatibleClient } from '../src/model-client.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const errorOf = (action: () => unknown): string => {
  try { action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
};

const MUTATED = [
  'NODE_ENV', 'MODEL_TEST_TRANSPORT_OVERRIDES', 'MODEL_COST_ENFORCEMENT',
  'MODEL_API_KEY', 'MODEL_NAME', 'MODEL_ENDPOINT_PROFILE',
  'MODEL_BACKUP_API_KEY', 'MODEL_BACKUP_ENDPOINT_PROFILE', 'MODEL_BACKUP_NAME',
] as const;

async function main() {
  const originalFetch = globalThis.fetch;
  const initial = new Map<string, string | undefined>(MUTATED.map((name) => [name, process.env[name]]));
  try {
    // ① 生产环境：构造期拒绝任意 endpoint/key 注入（transport override 缝关）。
    process.env.NODE_ENV = 'production';
    delete process.env.MODEL_TEST_TRANSPORT_OVERRIDES;
    delete process.env.MODEL_COST_ENFORCEMENT;
    A('生产构造传 baseUrl 即抛 text_transport_override_forbidden',
      errorOf(() => openAICompatibleClient({ baseUrl: 'https://evil.invalid' })) === 'text_transport_override_forbidden');
    A('生产构造传 apiKey 即抛 text_transport_override_forbidden',
      errorOf(() => openAICompatibleClient({ apiKey: 'injected-key' })) === 'text_transport_override_forbidden');

    // ② override 缝关（test 但未设 MODEL_TEST_TRANSPORT_OVERRIDES=1）：同样拒绝注入。
    process.env.NODE_ENV = 'test';
    delete process.env.MODEL_TEST_TRANSPORT_OVERRIDES;
    delete process.env.MODEL_COST_ENFORCEMENT;
    delete process.env.MODEL_ENDPOINT_PROFILE;
    delete process.env.MODEL_BACKUP_API_KEY;
    A('override 缝关时（test 且无 flag）构造传 baseUrl 仍被拒',
      errorOf(() => openAICompatibleClient({ baseUrl: 'https://evil.invalid' })) === 'text_transport_override_forbidden');

    // ③ 正常派发：受控注册表端点 + redirect=error + Bearer 文本 Key + POST JSON。
    process.env.MODEL_API_KEY = 'proof-text-key';
    process.env.MODEL_NAME = 'qwen-plus';
    const calls: Array<{ url: string; method?: string; redirect?: string; authorization?: string; contentType?: string | null }> = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({
        url: String(input),
        method: init?.method,
        redirect: init?.redirect,
        authorization: new Headers(init?.headers).get('authorization') ?? undefined,
        contentType: new Headers(init?.headers).get('content-type'),
      });
      return new Response(JSON.stringify({ choices: [{ message: { content: '{"status":"ok"}' } }] }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;

    const client = openAICompatibleClient();
    const res = await client.complete({ service: 'smoke', system: 'trusted system only', userData: 'ping' }, 1);
    A('正常派发恰一次并返回 ok（真实 dispatch，非 override 缝）', res.ok === true && calls.length === 1);
    A('派发 fetch 携带 redirect=error（3xx 即拒绝，防 SSRF 跳内网）', calls[0]?.redirect === 'error');
    A('派发 baseUrl 精确等于注册表 host/path（deepseek-cn-public → https://api.deepseek.com/chat/completions）',
      calls[0]?.url === 'https://api.deepseek.com/chat/completions');
    A('派发携带 Bearer 文本 Key（只读 MODEL_API_KEY）', calls[0]?.authorization === 'Bearer proof-text-key');
    A('派发为 POST + application/json', calls[0]?.method === 'POST' && calls[0]?.contentType === 'application/json');
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of MUTATED) {
      const value = initial.get(name);
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
  console.log(`\n${failures === 0 ? '✓ 文本主链路 dispatch 守卫证明全部通过' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
