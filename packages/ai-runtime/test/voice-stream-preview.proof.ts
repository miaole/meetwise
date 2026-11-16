/**
 * PRD-TEST-006 honesty: stream ASR + stream TTS stay fail-closed unless exact
 * dual preview flags are set, production / enforce / public-preview stay
 * refuse-closed even with both flags. Both stream seams are honestly wired the
 * same way since their product slices: composition constructs the cosyvoice /
 * paraformer adapter when the per-capability stream Key exists and the
 * registry operation is wired, while the runtime dual-flag gate still refuses
 * inside `synthesizeStream` / `transcribeStream` — Key-only / production /
 * enforce / public-preview never invent audio or a transcript. Server
 * turn-taking is preview-composed since voice slice 3: `turnTakingConfigured`
 * flips true ONLY under the triple gate (both stream seams wired + exact dual
 * flags + not production-locked) and `createInterviewVoiceTurnRunner.runTurn`
 * re-asserts the same gate fail-closed before every turn — flags or Keys alone
 * still open zero WebSockets. Key-absent behaviour is unchanged (fail-closed).
 * Isolated fake proofs are not product E2E; the product-pipe receipts live in
 * the api live proofs. pnpm prove:voice-stream-preview
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createInterviewVoiceSeams,
  createInterviewVoiceTurnRunner,
  dashscopeStreamingAsr,
  dashscopeStreamingTts,
  isProductionVoiceStreamLocked,
  isVoiceStreamAsrPreviewEnabled,
  isVoiceStreamAsrPreviewRequested,
  refuseVoiceStreamAsrUnlessPreview,
  resolveModelOperation,
  VOICE_EGRESS_DISABLED_ID,
  VOICE_STREAM_ASR_UNCONFIGURED,
  VOICE_TURN_TAKING_NOT_CONFIGURED,
  VOICE_TURN_TAKING_UNCONFIGURED,
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
  'DASHSCOPE_STREAM_TTS_MODEL', 'DASHSCOPE_STREAM_TTS_VOICE',
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

    delete process.env.DASHSCOPE_STREAM_TTS_API_KEY;
    delete process.env.DASHSCOPE_STREAM_ASR_API_KEY;
    const closedSeams = createInterviewVoiceSeams();
    A('composition root without stream Keys stays fail-closed (Key-absent behaviour unchanged)',
      closedSeams.streamTtsConfigured === false
      && closedSeams.streamTts.id === VOICE_EGRESS_DISABLED_ID
      && await errorOf(() => closedSeams.streamTts.synthesizeStream('x')[Symbol.asyncIterator]().next()) === STREAMING_TTS_NOT_CONFIGURED
      && closedSeams.streamAsrConfigured === false
      && closedSeams.streamAsr.id === VOICE_EGRESS_DISABLED_ID
      && closedSeams.turnTakingConfigured === false
      && fetches === 0 && sockets === 0);
    process.env.DASHSCOPE_STREAM_TTS_API_KEY = 'preview-stream-tts-key';

    const seams = createInterviewVoiceSeams();
    A('composition root wires stream TTS with Key + wired registry; stream ASR without its Key stays disabled',
      seams.streamTtsConfigured === true
      && seams.streamTts.id === 'cosyvoice-v2'
      && seams.streamAsrConfigured === false
      && seams.turnTakingConfigured === false
      && seams.streamAsr.id === VOICE_EGRESS_DISABLED_ID
      && await errorOf(() => seams.streamAsr.transcribeStream(emptyChunks())[Symbol.asyncIterator]().next()) === STREAMING_ASR_NOT_CONFIGURED
      && fetches === 0 && sockets === 0);

    // 流式 ASR 产品接线（预览）honest 面：Key 在 + registry wired → 组合根构造 paraformer 缝（构造零外呼）；
    // 双旗门仍在 transcribeStream 内 → 撤旗照旧 streaming_asr_not_configured。构造时点双旗在场且双流缝齐
    // → turnTakingConfigured 如实为 true（三重门的「构造时点」事实）;撤旗后运行时门不松动。
    process.env.DASHSCOPE_STREAM_ASR_API_KEY = 'preview-stream-asr-key';
    const wiredAsr = createInterviewVoiceSeams();
    delete process.env.VOICE_STREAM_ASR_ENABLED;   // 先撤旗再调用：Key+wired 组合根上运行时双旗门仍在产品缝内（不触真实 WS）
    delete process.env.VOICE_STREAM_ASR_PREVIEW;
    A('stream ASR Key wires the composition root to the paraformer adapter (construction is transport-free; runtime flag gate still refuses inside the seam)',
      wiredAsr.streamAsrConfigured === true
      && wiredAsr.streamAsr.id === 'paraformer-realtime-v2'
      && await errorOf(() => wiredAsr.streamAsr.transcribeStream(emptyChunks())[Symbol.asyncIterator]().next()) === STREAMING_ASR_NOT_CONFIGURED
      && wiredAsr.turnTakingConfigured === true
      && fetches === 0 && sockets === 0);
    process.env.VOICE_STREAM_ASR_ENABLED = '1';
    process.env.VOICE_STREAM_ASR_PREVIEW = '1';

    delete process.env.VOICE_STREAM_ASR_ENABLED;
    delete process.env.VOICE_STREAM_ASR_PREVIEW;
    A('composed stream TTS + stream ASR still refuse through the runtime preview gate (Key + wired registry are not enough)',
      await errorOf(() => seams.streamTts.synthesizeStream('x')[Symbol.asyncIterator]().next()) === STREAMING_TTS_NOT_CONFIGURED
      && await errorOf(() => wiredAsr.streamAsr.transcribeStream(emptyChunks())[Symbol.asyncIterator]().next()) === STREAMING_ASR_NOT_CONFIGURED
      && fetches === 0 && sockets === 0);
    process.env.VOICE_STREAM_ASR_ENABLED = '1';
    process.env.VOICE_STREAM_ASR_PREVIEW = '1';
    A('fully unlocked composed stream seams reach exactly the transport layer; fabrication stub intercepts two sockets, no invented audio',
      await errorOf(() => seams.streamTts.synthesizeStream('x')[Symbol.asyncIterator]().next()) === 'unexpected_stream_websocket'
      && await errorOf(() => wiredAsr.streamAsr.transcribeStream(emptyChunks())[Symbol.asyncIterator]().next()) === 'unexpected_stream_websocket'
      && fetches === 0 && sockets === 2);

    // 服务端 turn-taking（第三刀·预览组合）honest 面：三重门齐（双流缝 wired ∧ 精确双旗 ∧ 非生产锁）
    // → turnTakingConfigured 如实翻 true、turn runner configured=true（构造零外呼零 socket）；
    // 撤旗/生产锁 → runTurn 在任何 WebSocket 之前 fail-closed 拒绝。
    const tripleSeams = createInterviewVoiceSeams();
    const openRunner = createInterviewVoiceTurnRunner();
    A('triple gate (both stream seams wired + dual flags + not locked) flips turnTakingConfigured true; runner construction stays transport-free',
      tripleSeams.turnTakingConfigured === true
      && openRunner.configured === true
      && openRunner.streamTts.id === 'cosyvoice-v2'
      && openRunner.streamAsr.id === 'paraformer-realtime-v2'
      && fetches === 0 && sockets === 2);
    delete process.env.VOICE_STREAM_ASR_PREVIEW;
    const halfSeams = createInterviewVoiceSeams();
    const halfRunner = createInterviewVoiceTurnRunner();
    A('ENABLED=1 without PREVIEW is an explicit misconfiguration: runTurn refuses voice_turn_taking_unconfigured before any socket',
      halfSeams.turnTakingConfigured === false
      && halfRunner.configured === false
      && await errorOf(() => halfRunner.runTurn('q', emptyChunks())) === VOICE_TURN_TAKING_UNCONFIGURED
      && fetches === 0 && sockets === 2);
    delete process.env.VOICE_STREAM_ASR_ENABLED;
    const closedRunner = createInterviewVoiceTurnRunner();
    A('runTurn without preview flags refuses voice_turn_taking_not_configured before any socket',
      closedRunner.configured === false
      && await errorOf(() => closedRunner.runTurn('q', emptyChunks())) === VOICE_TURN_TAKING_NOT_CONFIGURED
      && fetches === 0 && sockets === 2);
    process.env.VOICE_STREAM_ASR_ENABLED = '1';
    process.env.VOICE_STREAM_ASR_PREVIEW = '1';
    process.env.NODE_ENV = 'production';
    const lockedRunner = createInterviewVoiceTurnRunner();
    A('runTurn under production lock refuses voice_turn_taking_unconfigured even with flags and Keys',
      lockedRunner.configured === false
      && await errorOf(() => lockedRunner.runTurn('q', emptyChunks())) === VOICE_TURN_TAKING_UNCONFIGURED
      && fetches === 0 && sockets === 2);
    process.env.NODE_ENV = 'test';

    A('voice.asr-stream.v1 and voice.tts-stream.v1 are wired for the stream product slices',
      resolveModelOperation('voice.asr-stream.v1', 'interview-voice-preview').ok === true
      && resolveModelOperation('voice.tts-stream.v1', 'interview-voice-preview').ok === true
      && resolveModelOperation('voice.asr.v1', 'interview-voice-preview').ok === true);

    const workerMain = readFileSync(resolve(process.cwd(), '../../apps/worker/src/main.ts'), 'utf8');
    const interviewService = readFileSync(resolve(process.cwd(), '../../apps/api/src/modules/interview/interview.service.ts'), 'utf8');
    const interviewModule = readFileSync(resolve(process.cwd(), '../../apps/api/src/modules/interview/interview.module.ts'), 'utf8');
    A('product mains stay out of the turn loop: no ungated runVoiceAdaptiveInterview / turn-runner / live adapter imports in worker main, interview service or interview module DI',
      !workerMain.includes('runVoiceAdaptiveInterview')
      && !workerMain.includes('dashscopeStreamingAsr')
      && !workerMain.includes('streamingVoiceTurn')
      && !workerMain.includes('createInterviewVoiceTurnRunner')
      && !interviewService.includes('runVoiceAdaptiveInterview')
      && !interviewService.includes('dashscopeStreamingAsr')
      && !interviewModule.includes('createInterviewVoiceTurnRunner')
      && !interviewModule.includes('runVoiceAdaptiveInterview'));
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
