/**
 * PRD-TEST-006 honesty: stream ASR + server turn-taking stay fail-closed
 * unless exact dual preview flags are set, and even then product composition
 * never wires a live stream. Key-only / production / enforce / public-preview
 * must not invent a transcript. Isolated fake proofs are not product E2E.
 * pnpm prove:voice-stream-preview
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createInterviewVoiceSeams,
  dashscopeStreamingAsr,
  dashscopeStreamingTts,
  isProductionVoiceStreamLocked,
  isVoiceStreamAsrPreviewEnabled,
  isVoiceStreamAsrPreviewRequested,
  refuseVoiceStreamAsrUnlessPreview,
  resolveModelOperation,
  VOICE_EGRESS_DISABLED_ID,
  VOICE_STREAM_ASR_UNCONFIGURED,
  STREAMING_ASR_NOT_CONFIGURED,
  STREAMING_TTS_NOT_CONFIGURED,
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

function syncErrorOf(action: () => void): string {
  try { action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

async function* emptyChunks() { /* no audio */ }

const FLAG_AND_KEY_VARS = [
  'VOICE_STREAM_ASR_ENABLED', 'VOICE_STREAM_ASR_PREVIEW',
  'NODE_ENV', 'MODEL_COST_ENFORCEMENT', 'MEETWISE_PUBLIC_PREVIEW',
  'DASHSCOPE_STREAM_ASR_API_KEY', 'DASHSCOPE_STREAM_TTS_API_KEY',
  'DASHSCOPE_API_KEY',
] as const;

async function main() {
  const saved = new Map<string, string | undefined>();
  for (const name of FLAG_AND_KEY_VARS) saved.set(name, process.env[name]);
  const originalFetch = globalThis.fetch;
  const originalWebSocket = (globalThis as { WebSocket?: unknown }).WebSocket;
  let fetches = 0;
  let sockets = 0;
  globalThis.fetch = (async () => {
    fetches++;
    throw new Error('unexpected_provider_fetch');
  }) as typeof fetch;
  (globalThis as { WebSocket?: unknown }).WebSocket = class {
    constructor() { sockets++; throw new Error('unexpected_stream_websocket'); }
  };

  try {
    for (const name of FLAG_AND_KEY_VARS) delete process.env[name];
    process.env.NODE_ENV = 'test';

    A('only exact VOICE_STREAM_ASR_ENABLED=1 AND VOICE_STREAM_ASR_PREVIEW=1 request preview',
      isVoiceStreamAsrPreviewRequested({ VOICE_STREAM_ASR_ENABLED: '1', VOICE_STREAM_ASR_PREVIEW: '1' })
      && !isVoiceStreamAsrPreviewRequested({ VOICE_STREAM_ASR_ENABLED: '1' })
      && !isVoiceStreamAsrPreviewRequested({ VOICE_STREAM_ASR_ENABLED: 'true', VOICE_STREAM_ASR_PREVIEW: '1' })
      && !isVoiceStreamAsrPreviewRequested({ VOICE_STREAM_ASR_ENABLED: '1', VOICE_STREAM_ASR_PREVIEW: 'true' })
      && !isVoiceStreamAsrPreviewRequested({}));

    A('production / enforce / public-preview lock even with dual flags',
      isProductionVoiceStreamLocked({ NODE_ENV: 'production' })
      && isProductionVoiceStreamLocked({ MODEL_COST_ENFORCEMENT: 'enforce' })
      && isProductionVoiceStreamLocked({ MEETWISE_PUBLIC_PREVIEW: '1' })
      && !isVoiceStreamAsrPreviewEnabled({
        VOICE_STREAM_ASR_ENABLED: '1', VOICE_STREAM_ASR_PREVIEW: '1', NODE_ENV: 'production',
      })
      && !isVoiceStreamAsrPreviewEnabled({
        VOICE_STREAM_ASR_ENABLED: '1', VOICE_STREAM_ASR_PREVIEW: '1', MODEL_COST_ENFORCEMENT: 'enforce',
      })
      && !isVoiceStreamAsrPreviewEnabled({
        VOICE_STREAM_ASR_ENABLED: '1', VOICE_STREAM_ASR_PREVIEW: '1', MEETWISE_PUBLIC_PREVIEW: '1',
      })
      && isVoiceStreamAsrPreviewEnabled({
        VOICE_STREAM_ASR_ENABLED: '1', VOICE_STREAM_ASR_PREVIEW: '1', NODE_ENV: 'development',
      }));

    process.env.DASHSCOPE_STREAM_ASR_API_KEY = 'preview-stream-asr-key';
    process.env.DASHSCOPE_STREAM_TTS_API_KEY = 'preview-stream-tts-key';
    A('Key alone does not request preview or unlock live stream',
      !isVoiceStreamAsrPreviewEnabled(process.env)
      && syncErrorOf(() => refuseVoiceStreamAsrUnlessPreview(process.env)) === STREAMING_ASR_NOT_CONFIGURED
      && await errorOf(() => dashscopeStreamingAsr().transcribeStream(emptyChunks())[Symbol.asyncIterator]().next()) === STREAMING_ASR_NOT_CONFIGURED
      && await errorOf(() => dashscopeStreamingTts().synthesizeStream('x')[Symbol.asyncIterator]().next()) === STREAMING_TTS_NOT_CONFIGURED
      && fetches === 0 && sockets === 0);

    process.env.VOICE_STREAM_ASR_ENABLED = '1';
    A('ENABLED=1 without PREVIEW is unconfigured, zero sockets, no invented transcript',
      syncErrorOf(() => refuseVoiceStreamAsrUnlessPreview(process.env)) === VOICE_STREAM_ASR_UNCONFIGURED
      && await errorOf(() => dashscopeStreamingAsr().transcribeStream(emptyChunks())[Symbol.asyncIterator]().next()) === VOICE_STREAM_ASR_UNCONFIGURED
      && fetches === 0 && sockets === 0);

    process.env.VOICE_STREAM_ASR_PREVIEW = '1';
    process.env.NODE_ENV = 'production';
    A('production + dual flags + Keys still refuse live stream',
      !isVoiceStreamAsrPreviewEnabled(process.env)
      && await errorOf(() => dashscopeStreamingAsr().transcribeStream(emptyChunks())[Symbol.asyncIterator]().next()) === VOICE_STREAM_ASR_UNCONFIGURED
      && fetches === 0 && sockets === 0);

    process.env.NODE_ENV = 'test';
    delete process.env.MODEL_COST_ENFORCEMENT;
    delete process.env.MEETWISE_PUBLIC_PREVIEW;
    const seams = createInterviewVoiceSeams();
    A('product composition never marks stream ASR / turn-taking configured',
      seams.streamAsrConfigured === false
      && seams.turnTakingConfigured === false
      && seams.streamAsr.id === VOICE_EGRESS_DISABLED_ID
      && seams.streamTts.id === VOICE_EGRESS_DISABLED_ID
      && await errorOf(() => seams.streamAsr.transcribeStream(emptyChunks())[Symbol.asyncIterator]().next()) === STREAMING_ASR_NOT_CONFIGURED
      && fetches === 0 && sockets === 0);

    A('voice.asr-stream.v1 / voice.tts-stream.v1 stay unwired',
      resolveModelOperation('voice.asr-stream.v1', 'interview-voice-preview').ok === false
      && resolveModelOperation('voice.tts-stream.v1', 'interview-voice-preview').ok === false
      && resolveModelOperation('voice.asr.v1', 'interview-voice-preview').ok === true);

    const workerMain = readFileSync(resolve(process.cwd(), '../../apps/worker/src/main.ts'), 'utf8');
    const interviewService = readFileSync(resolve(process.cwd(), '../../apps/api/src/modules/interview/interview.service.ts'), 'utf8');
    A('worker main and interview service do not import live stream ASR or adaptive turn-taking',
      !workerMain.includes('runVoiceAdaptiveInterview')
      && !workerMain.includes('dashscopeStreamingAsr')
      && !workerMain.includes('streamingVoiceTurn')
      && !interviewService.includes('runVoiceAdaptiveInterview')
      && !interviewService.includes('dashscopeStreamingAsr'));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWebSocket === undefined) delete (globalThis as { WebSocket?: unknown }).WebSocket;
    else (globalThis as { WebSocket?: unknown }).WebSocket = originalWebSocket;
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }

  console.log(`\n${failures === 0 ? '✓ voice stream ASR honesty gates passed (not product E2E)' : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
