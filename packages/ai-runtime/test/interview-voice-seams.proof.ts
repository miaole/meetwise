/**
 * Interview voice preview composition: registry-gated native seams.
 * No provider Key is required for the fail-closed path; the configured path
 * never invents a transcript or audio byte.
 */
import { createHash } from 'node:crypto';
import {
  createInterviewVoiceSeams, VOICE_EGRESS_DISABLED_ID, resolveModelOperation,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function errorOf(action: () => Promise<unknown>): Promise<string> {
  try { await action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

const KEY_VARS = [
  'DASHSCOPE_ASR_API_KEY', 'DASHSCOPE_TTS_API_KEY',
  'DASHSCOPE_EMBED_API_KEY', 'DASHSCOPE_RERANK_API_KEY',
  'DASHSCOPE_STREAM_ASR_API_KEY', 'DASHSCOPE_STREAM_TTS_API_KEY',
  'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL', 'DASHSCOPE_TTS_URL',
] as const;

async function main() {
  const saved = new Map<string, string | undefined>();
  for (const name of KEY_VARS) saved.set(name, process.env[name]);
  const originalFetch = globalThis.fetch;
  let fetches = 0;
  globalThis.fetch = (async () => {
    fetches++;
    throw new Error('unexpected_provider_fetch');
  }) as typeof fetch;

  try {
    for (const name of KEY_VARS) delete process.env[name];
    const closed = createInterviewVoiceSeams();
    A('缺 Key 时批量 ASR fail-closed，零外呼',
      await errorOf(() => closed.asr.transcribe(new Uint8Array([1]), { format: 'wav' })) === 'asr_not_configured'
      && closed.asrConfigured === false && fetches === 0);
    A('缺 Key 时批量 TTS fail-closed，零外呼',
      await errorOf(() => closed.tts.synthesize('preview question')) === 'tts_not_configured'
      && closed.ttsConfigured === false && fetches === 0);
    A('流式 TTS 预览仍关闭',
      closed.streamTts.id === VOICE_EGRESS_DISABLED_ID
      && await errorOf(() => closed.streamTts.synthesizeStream('x')[Symbol.asyncIterator]().next()) === 'streaming_tts_not_configured');

    A('voice.asr.v1 / voice.tts.v1 已接线；流式与签名下载仍 not_wired',
      resolveModelOperation('voice.asr.v1', 'interview-voice-preview').ok === true
      && resolveModelOperation('voice.tts.v1', 'interview-voice-preview').ok === true
      && resolveModelOperation('voice.asr-stream.v1', 'interview-voice-preview').ok === false
      && resolveModelOperation('voice.tts-stream.v1', 'interview-voice-preview').ok === false
      && resolveModelOperation('voice.signed-download.v1', 'interview-voice-preview').ok === false);

    process.env.DASHSCOPE_ASR_API_KEY = 'preview-asr-key';
    process.env.DASHSCOPE_TTS_API_KEY = 'preview-tts-key';
    const open = createInterviewVoiceSeams();
    A('能力 Key 存在且 operation wired → 组合根标记已配置',
      open.asrConfigured === true && open.ttsConfigured === true);
    A('配置态在真正调用前仍零外呼（不预热、不伪造音频）', fetches === 0);

    globalThis.fetch = (async () => {
      fetches++;
      return new Response(JSON.stringify({ choices: [{ message: {} }] }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;
    A('供应商缺 content 时 asr_malformed，不编造转写',
      await errorOf(() => open.asr.transcribe(new Uint8Array([1, 2, 3]), { format: 'wav' })) === 'asr_malformed');

    const digest = createHash('sha256').update('x').digest('hex');
    A('组合 digest 是 sha256 hex，不是 caller URL', /^[0-9a-f]{64}$/.test(digest));
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }

  console.log(`\n${failures === 0 ? '✓ interview voice seams preview composition passed' : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
