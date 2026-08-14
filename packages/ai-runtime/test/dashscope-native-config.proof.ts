/**
 * TC-MODEL-ROUTE-03-E3 / BAILIAN-04: native endpoint selection is a local,
 * deterministic registry test. It makes no network request beyond a mocked
 * in-memory transport and never loads a Key from a file.
 */
import { dashscopeEmbedder } from '../src/embedder.ts';
import { dashscopeReranker } from '../src/reranker.ts';
import { dashscopeAsr, dashscopeTts } from '../src/voice.ts';
import { dashscopeStreamingAsr, dashscopeStreamingTts } from '../src/voice-stream.ts';
import {
  DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION,
  resolveDashscopeNativeConfig,
} from '../src/dashscope-native-config.ts';

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const names = [
  'NODE_ENV', 'DASHSCOPE_TEST_TRANSPORT_OVERRIDES',
  'MODEL_BASE_URL', 'MODEL_API_KEY', 'MODEL_NAME', 'MODEL_BACKUP_BASE_URL', 'MODEL_BACKUP_API_KEY',
  'DASHSCOPE_API_KEY', 'DASHSCOPE_ENDPOINT_PROFILE', 'DASHSCOPE_WORKSPACE_ID',
  'DASHSCOPE_COMPAT_BASE_URL', 'DASHSCOPE_RERANK_URL', 'DASHSCOPE_TTS_URL', 'DASHSCOPE_STREAM_URL',
  'DASHSCOPE_ASR_MODEL', 'DASHSCOPE_TTS_MODEL', 'DASHSCOPE_EMBED_MODEL',
  'DASHSCOPE_RERANK_MODEL', 'DASHSCOPE_STREAM_ASR_MODEL', 'DASHSCOPE_STREAM_TTS_MODEL',
] as const;
const initial = new Map(names.map((name) => [name, process.env[name]]));

async function errorOf(action: () => Promise<unknown>): Promise<string> {
  try { await action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

function syncErrorOf(action: () => unknown): string {
  try { action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

async function main() {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; authorization?: string; redirect?: string }> = [];
  try {
    Object.assign(process.env, {
      NODE_ENV: 'production',
      MODEL_BASE_URL: 'https://deepseek.text.invalid',
      MODEL_API_KEY: 'deepseek-text-key',
      MODEL_NAME: 'deepseek-v4-pro',
      MODEL_BACKUP_BASE_URL: 'https://qwen.backup.invalid/compatible-mode/v1',
      MODEL_BACKUP_API_KEY: 'qwen-text-key',
      DASHSCOPE_API_KEY: 'dashscope-native-key',
      DASHSCOPE_ENDPOINT_PROFILE: 'cn-beijing-public',
      DASHSCOPE_ASR_MODEL: 'dashscope-asr-proof',
      DASHSCOPE_TTS_MODEL: 'dashscope-tts-proof',
      DASHSCOPE_EMBED_MODEL: 'dashscope-embed-proof',
      DASHSCOPE_RERANK_MODEL: 'dashscope-rerank-proof',
      DASHSCOPE_STREAM_ASR_MODEL: 'dashscope-stream-asr-proof',
      DASHSCOPE_STREAM_TTS_MODEL: 'dashscope-stream-tts-proof',
    });
    for (const name of ['DASHSCOPE_TEST_TRANSPORT_OVERRIDES', 'DASHSCOPE_WORKSPACE_ID', 'DASHSCOPE_COMPAT_BASE_URL', 'DASHSCOPE_RERANK_URL', 'DASHSCOPE_TTS_URL', 'DASHSCOPE_STREAM_URL'] as const) delete process.env[name];

    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push({
        url,
        authorization: new Headers(init?.headers).get('authorization') ?? undefined,
        redirect: init?.redirect,
      });
      if (url.endsWith('/embeddings')) {
        return new Response(JSON.stringify({ data: [{ index: 0, embedding: [0.1, 0.2] }] }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      if (url.endsWith('/text-rerank')) {
        return new Response(JSON.stringify({ output: { results: [{ index: 0, relevance_score: 1 }] } }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      if (url.endsWith('/chat/completions')) {
        return new Response(JSON.stringify({ choices: [{ message: { content: '转写文本' } }] }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      throw new Error(`unexpected_native_url:${url}`);
    }) as typeof fetch;

    const config = resolveDashscopeNativeConfig();
    check('public profile resolves an immutable registry snapshot',
      Object.isFrozen(config)
      && config.registryVersion === DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION
      && config.profile === 'cn-beijing-public'
      && config.compatibleBaseUrl === 'https://dashscope.aliyuncs.com/compatible-mode/v1'
      && config.ttsUrl === 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
      && config.streamUrl === 'wss://dashscope.aliyuncs.com/api-ws/v1/inference'
      && config.rerankUrl === 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank');

    const vectors = await dashscopeEmbedder({ dim: 2 }).embed(['native fixture']);
    check('embedding uses the registry compatible endpoint and native credential',
      vectors.length === 1 && calls[0]?.url === 'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings'
      && calls[0]?.authorization === 'Bearer dashscope-native-key' && calls[0]?.redirect === 'error');

    const ranked = await dashscopeReranker().rerank('query', [{ id: 'one', text: 'doc' }], 1);
    check('reranking uses the registry native endpoint and native credential',
      ranked[0] === 'one' && calls[1]?.url === 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank'
      && calls[1]?.authorization === 'Bearer dashscope-native-key' && calls[1]?.redirect === 'error');

    const transcript = await dashscopeAsr({ timeoutMs: 500 }).transcribe(new Uint8Array([1, 2, 3]), { format: 'wav' });
    check('ASR uses the registry compatible endpoint and native credential',
      transcript === '转写文本' && calls[2]?.url === 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
      && calls[2]?.authorization === 'Bearer dashscope-native-key' && calls[2]?.redirect === 'error');

    check('TTS and streaming adapters take protocol endpoints from the same snapshot',
      dashscopeTts() && dashscopeStreamingAsr().id === 'dashscope-stream-asr-proof'
      && dashscopeStreamingTts().id === 'dashscope-stream-tts-proof');

    process.env.DASHSCOPE_ENDPOINT_PROFILE = 'cn-beijing-workspace';
    process.env.DASHSCOPE_WORKSPACE_ID = 'llm-proof-01';
    const workspaceConfig = resolveDashscopeNativeConfig();
    check('workspace profile only accepts a constrained id and constructs the documented host',
      workspaceConfig.compatibleBaseUrl === 'https://llm-proof-01.cn-beijing.maas.aliyuncs.com/compatible-mode/v1'
      && workspaceConfig.streamUrl === 'wss://llm-proof-01.cn-beijing.maas.aliyuncs.com/api-ws/v1/inference'
      && config.compatibleBaseUrl === 'https://dashscope.aliyuncs.com/compatible-mode/v1');

    process.env.DASHSCOPE_WORKSPACE_ID = 'llm-proof-01.evil.invalid';
    check('workspace host injection is rejected before transport',
      syncErrorOf(() => resolveDashscopeNativeConfig()) === 'dashscope_workspace_id_invalid');

    process.env.DASHSCOPE_ENDPOINT_PROFILE = 'cn-beijing-public';
    delete process.env.DASHSCOPE_WORKSPACE_ID;
    process.env.DASHSCOPE_COMPAT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1?host=evil.invalid#fragment';
    check('legacy URL environment variables are rejected instead of parsed',
      syncErrorOf(() => resolveDashscopeNativeConfig()) === 'dashscope_native_endpoint_env_forbidden');
    delete process.env.DASHSCOPE_COMPAT_BASE_URL;

    const beforeOverride = calls.length;
    process.env.DASHSCOPE_TEST_TRANSPORT_OVERRIDES = '1';
    check('production rejects endpoint/key overrides even if a test-only flag is injected',
      syncErrorOf(() => dashscopeAsr({ baseUrl: 'https://evil.invalid', apiKey: 'wrong-key' })) === 'dashscope_native_transport_override_forbidden'
      && syncErrorOf(() => dashscopeTts({ ttsUrl: 'https://evil.invalid', apiKey: 'wrong-key' })) === 'dashscope_native_transport_override_forbidden'
      && calls.length === beforeOverride);
    delete process.env.DASHSCOPE_TEST_TRANSPORT_OVERRIDES;

    for (const name of ['DASHSCOPE_API_KEY'] as const) delete process.env[name];
    check('ASR refuses a text-only environment instead of falling back to MODEL_*',
      await errorOf(() => dashscopeAsr().transcribe(new Uint8Array([1]), { format: 'wav' })) === 'asr_not_configured');
    check('embedding refuses a text-only environment instead of falling back to MODEL_*',
      await errorOf(() => dashscopeEmbedder().embed(['text-only'])) === 'embedder_not_configured');
    check('reranking refuses a text-only environment instead of falling back to MODEL_*',
      await errorOf(() => dashscopeReranker().rerank('query', [{ id: 'one', text: 'doc' }], 1)) === 'reranker_not_configured');
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      const value = initial.get(name);
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
  console.log(`\n${failures === 0 ? '✓ DashScope native endpoint boundary passed' : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
