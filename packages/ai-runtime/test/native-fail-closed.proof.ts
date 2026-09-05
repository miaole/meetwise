/**
 * TC-MODEL-ROUTE-04-E6: DashScope native adapters fail-closed on missing keys,
 * timeouts and malformed bodies. They must not invent transcripts, vectors or ranks.
 *
 * Isolation: `pnpm regression` injects repo-root `.env`. Ambient
 * `DASHSCOPE_*_API_KEY_FINGERPRINT` / `DASHSCOPE_REVOKED_KEY_FINGERPRINTS` must
 * be cleared before proof keys are assigned, or `assertKeyFingerprint` turns
 * timeout/malformed cases into `*_fingerprint_mismatch`. Production/dev
 * fingerprint checks stay on; this is proof-process isolation only.
 * releaseEvidence=false.
 */
import { dashscopeEmbedder } from '../src/embedder.ts';
import { dashscopeReranker } from '../src/reranker.ts';
import { dashscopeAsr, dashscopeTts } from '../src/voice.ts';
import { resolveDashscopeNativeConfig } from '../src/dashscope-native-config.ts';
import { ExternalRequestTimeoutError } from '../src/timeout.ts';

process.env.NODE_ENV = 'test';
process.env.DASHSCOPE_TEST_TRANSPORT_OVERRIDES = '1';

let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };

async function errorOf(action: () => Promise<unknown>): Promise<string> {
  try { await action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

function syncErrorOf(action: () => unknown): string {
  try { action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

const FINGERPRINT_VARS = [
  'DASHSCOPE_EMBED_API_KEY_FINGERPRINT', 'DASHSCOPE_RERANK_API_KEY_FINGERPRINT',
  'DASHSCOPE_ASR_API_KEY_FINGERPRINT', 'DASHSCOPE_TTS_API_KEY_FINGERPRINT',
  'DASHSCOPE_STREAM_ASR_API_KEY_FINGERPRINT', 'DASHSCOPE_STREAM_TTS_API_KEY_FINGERPRINT',
  'DASHSCOPE_REVOKED_KEY_FINGERPRINTS',
] as const;

const names = [
  'DASHSCOPE_EMBED_API_KEY', 'DASHSCOPE_RERANK_API_KEY', 'DASHSCOPE_ASR_API_KEY', 'DASHSCOPE_TTS_API_KEY',
  'DASHSCOPE_STREAM_ASR_API_KEY', 'DASHSCOPE_STREAM_TTS_API_KEY', 'DASHSCOPE_API_KEY',
  'DASHSCOPE_ENDPOINT_PROFILE', 'DASHSCOPE_WORKSPACE_ID',
  ...FINGERPRINT_VARS,
] as const;
const initial = new Map(names.map((name) => [name, process.env[name]]));

async function main() {
  const originalFetch = globalThis.fetch;
  try {
    // Document why isolation is required: leftover dotenv fingerprints fail-closed
    // against proof keys. Fence stays on; we then delete the ambient vars.
    // Use an explicit env so other leftover `.env` keys (broad key / URL overrides)
    // cannot change the error code.
    process.env.DASHSCOPE_EMBED_API_KEY_FINGERPRINT = 'deadbeefdeadbeef';
    A('ambient fingerprint + mismatched proof key → dashscope_embed_api_key_fingerprint_mismatch',
      syncErrorOf(() => resolveDashscopeNativeConfig({
        DASHSCOPE_EMBED_API_KEY: 'proof-embed-key',
        DASHSCOPE_EMBED_API_KEY_FINGERPRINT: process.env.DASHSCOPE_EMBED_API_KEY_FINGERPRINT,
        DASHSCOPE_ENDPOINT_PROFILE: 'cn-beijing-public',
      })) === 'dashscope_embed_api_key_fingerprint_mismatch');

    for (const name of FINGERPRINT_VARS) delete process.env[name];

    Object.assign(process.env, {
      DASHSCOPE_EMBED_API_KEY: 'proof-embed-key',
      DASHSCOPE_RERANK_API_KEY: 'proof-rerank-key',
      DASHSCOPE_ASR_API_KEY: 'proof-asr-key',
      DASHSCOPE_TTS_API_KEY: 'proof-tts-key',
      DASHSCOPE_ENDPOINT_PROFILE: 'cn-beijing-public',
    });
    for (const name of ['DASHSCOPE_API_KEY', 'DASHSCOPE_WORKSPACE_ID'] as const) delete process.env[name];

    globalThis.fetch = (async () => {
      throw new ExternalRequestTimeoutError(50);
    }) as typeof fetch;
    A('after clearing ambient fingerprints, embedding timeout → embedder_timeout (not fingerprint_mismatch)',
      await errorOf(() => dashscopeEmbedder({ dim: 2, baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: 'proof-embed-key' }).embed(['x'])) === 'embedder_timeout');
    A('rerank timeout → reranker_timeout, no invented id',
      await errorOf(() => dashscopeReranker({ url: 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank', apiKey: 'proof-rerank-key' }).rerank('q', [{ id: 'one', text: 'doc' }], 1)) === 'reranker_timeout');
    A('ASR timeout → asr_timeout, no invented transcript',
      await errorOf(() => dashscopeAsr({ baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: 'proof-asr-key', timeoutMs: 50 }).transcribe(new Uint8Array([1]), { format: 'wav' })) === 'asr_timeout');

    globalThis.fetch = (async () => new Response('not-json{', {
      status: 200, headers: { 'content-type': 'application/json' },
    })) as typeof fetch;
    A('embedding non-JSON → embedder_malformed',
      await errorOf(() => dashscopeEmbedder({ dim: 2, baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: 'proof-embed-key' }).embed(['x'])) === 'embedder_malformed');
    A('ASR non-JSON → external_response_json_invalid (no invented transcript)',
      await errorOf(() => dashscopeAsr({ baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: 'proof-asr-key', timeoutMs: 200 }).transcribe(new Uint8Array([1]), { format: 'wav' })) === 'external_response_json_invalid');
    A('rerank non-JSON → reranker_malformed',
      await errorOf(() => dashscopeReranker({ url: 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank', apiKey: 'proof-rerank-key' }).rerank('q', [{ id: 'one', text: 'doc' }], 1)) === 'reranker_malformed');
    A('TTS non-JSON → external_response_json_invalid (no invented audio)',
      await errorOf(() => dashscopeTts({ ttsUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', apiKey: 'proof-tts-key', timeoutMs: 200 }).synthesize('hi')) === 'external_response_json_invalid');

    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith('/embeddings')) {
        return new Response(JSON.stringify({ data: [{ index: 0, embedding: [Number.NaN, 0.2] }] }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      if (url.endsWith('/chat/completions')) {
        return new Response(JSON.stringify({ choices: [{ message: { content: '   ' } }] }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('text-rerank')) {
        return new Response(JSON.stringify({ output: {} }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('multimodal-generation')) {
        return new Response(JSON.stringify({ output: { audio: {} } }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      throw new Error(`unexpected_url:${url}`);
    }) as typeof fetch;

    A('embedding NaN vector → embedder_malformed (does not return zeros)',
      await errorOf(() => dashscopeEmbedder({ dim: 2, baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: 'proof-embed-key' }).embed(['x'])) === 'embedder_malformed');

    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith('/embeddings')) {
        return new Response(JSON.stringify({ data: [{ index: 0, embedding: [0, 0] }] }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      if (url.includes('text-rerank')) {
        return new Response(JSON.stringify({ output: { results: [] } }), {
          status: 200, headers: { 'content-type': 'application/json' },
        });
      }
      throw new Error(`unexpected_url:${url}`);
    }) as typeof fetch;
    A('embedding all-zero vector → embedder_malformed',
      await errorOf(() => dashscopeEmbedder({ dim: 2, baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: 'proof-embed-key' }).embed(['x'])) === 'embedder_malformed');
    A('rerank empty results → reranker_malformed (does not return [])',
      await errorOf(() => dashscopeReranker({ url: 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank', apiKey: 'proof-rerank-key' }).rerank('q', [{ id: 'one', text: 'doc' }], 1)) === 'reranker_malformed');

    globalThis.fetch = (async () => new Response(JSON.stringify({ output: { results: [{ index: 99, relevance_score: 1 }] } }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })) as typeof fetch;
    A('rerank out-of-range index → reranker_malformed',
      await errorOf(() => dashscopeReranker({ url: 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank', apiKey: 'proof-rerank-key' }).rerank('q', [{ id: 'one', text: 'doc' }], 1)) === 'reranker_malformed');
    A('ASR empty content → asr_malformed (does not return empty transcript)',
      await errorOf(() => dashscopeAsr({ baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', apiKey: 'proof-asr-key', timeoutMs: 200 }).transcribe(new Uint8Array([1]), { format: 'wav' })) === 'asr_malformed');
    A('rerank missing results → reranker_malformed (does not invent ranked ids)',
      await errorOf(() => dashscopeReranker({ url: 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank', apiKey: 'proof-rerank-key' }).rerank('q', [{ id: 'one', text: 'doc' }], 1)) === 'reranker_malformed');
    A('TTS missing audio url → tts_malformed',
      await errorOf(() => dashscopeTts({ ttsUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', apiKey: 'proof-tts-key', timeoutMs: 200 }).synthesize('hi')) === 'tts_malformed');

    for (const name of ['DASHSCOPE_EMBED_API_KEY', 'DASHSCOPE_RERANK_API_KEY', 'DASHSCOPE_ASR_API_KEY', 'DASHSCOPE_TTS_API_KEY'] as const) {
      delete process.env[name];
    }
    A('missing embed key does not fall back or invent vectors',
      await errorOf(() => dashscopeEmbedder({ dim: 2 }).embed(['x'])) === 'embedder_not_configured');
    A('missing asr key does not invent a transcript',
      await errorOf(() => dashscopeAsr().transcribe(new Uint8Array([1]), { format: 'wav' })) === 'asr_not_configured');
    A('missing rerank key does not invent ranked ids',
      await errorOf(() => dashscopeReranker().rerank('q', [{ id: 'one', text: 'doc' }], 1)) === 'reranker_not_configured');
    A('missing tts key does not invent audio',
      await errorOf(() => dashscopeTts().synthesize('hi')) === 'tts_not_configured');

    Object.assign(process.env, { DASHSCOPE_TTS_API_KEY: 'proof-tts-key' });
    globalThis.fetch = (async () => {
      throw new ExternalRequestTimeoutError(50);
    }) as typeof fetch;
    A('TTS timeout → tts_download_deadline_exceeded, no invented audio',
      await errorOf(() => dashscopeTts({ ttsUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', apiKey: 'proof-tts-key', timeoutMs: 50 }).synthesize('hi')) === 'tts_download_deadline_exceeded');
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      const value = initial.get(name);
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
  console.log(`\n${failures === 0 ? '✓ native fail-closed (missing key / timeout / malformed) passed' : `✗ ${failures} failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
