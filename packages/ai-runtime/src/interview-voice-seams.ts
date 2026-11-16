/**
 * Interview voice composition (preview).
 *
 * Batch ASR/TTS leave the process only after:
 *   1. `voice.asr.v1` / `voice.tts.v1` resolve as wired registry operations;
 *   2. a typed binding accepts the frozen input kind (no caller URL);
 *   3. the matching capability Key is present.
 *
 * Native host comes from the versioned DashScope Beijing profile (adapters
 * refuse caller key/URL overrides). Missing Key, unwired operation, malformed
 * provider output, or native-config rejection (legacy broad key / URL override)
 * → fail-closed (`*_not_configured` / `*_malformed`). A config throw must not
 * take down text-interview DI. Stream TTS is product-wired (preview): when the
 * per-capability `DASHSCOPE_STREAM_TTS_API_KEY` exists AND `voice.tts-stream.v1`
 * resolves wired, the composition root constructs `dashscopeStreamingTts` and
 * reports `streamTtsConfigured: true` — the runtime dual preview flags still
 * gate inside `synthesizeStream`, so a Key alone never opens a WebSocket.
 * Stream ASR is product-wired the same honest way since 2026-11-16: when the
 * per-capability `DASHSCOPE_STREAM_ASR_API_KEY` exists AND `voice.asr-stream.v1`
 * resolves wired, the composition root constructs `dashscopeStreamingAsr` and
 * reports `streamAsrConfigured: true` — the dual preview flags still gate inside
 * `transcribeStream` and the product `/interview/:id/listen/stream` pipe, so a
 * Key alone never opens a WebSocket. Server turn-taking is preview-composed
 * since 2026-11-16 (voice slice 3): `turnTakingConfigured` is true only under
 * the triple gate — both stream seams wired (per-capability Keys + registry
 * wired) AND the exact dual preview flags AND not production/enforce/
 * public-preview locked; `createInterviewVoiceTurnRunner` is the only turn-loop
 * entry and re-asserts the same gate fail-closed at every `runTurn` before any
 * WebSocket. RMS endpointing (`voice-endpointing.ts`) closes each turn
 * deterministically; no transcript is invented when a turn ends without an
 * ASR final. This is not MODEL-OP-02 shared admission, durable attempt/unknown,
 * real-device acoustics, or a production SLO.
 */
import { createHash } from 'node:crypto';
import { resolveDashscopeNativeConfig } from './dashscope-native-config.ts';
import { resolveModelOperation } from './model-operation-registry.ts';
import { resolveModelOperationBinding } from './operation-binding.ts';
import {
  assertVoiceTurnTakingPreviewAllowed, isVoiceStreamAsrPreviewEnabled,
  VOICE_TURN_TAKING_NOT_CONFIGURED,
} from './voice-stream-preview.ts';
import {
  dashscopeAsr, dashscopeTts, disabledAsr, disabledTts, type Asr, type AsrQualityDeclaration, type Tts,
} from './voice.ts';
import {
  dashscopeStreamingAsr, dashscopeStreamingTts, disabledStreamingAsr, disabledStreamingTts,
  streamingVoiceTurn, type StreamTurnHooks,
  type StreamingAsr, type StreamingTts, type VoiceTurnResult,
} from './voice-stream.ts';
import type { RmsEndpointingConfig } from './voice-endpointing.ts';

const COMPOSITION_REVISION = 'interview-voice-preview';
const EMPTY_DIGEST = createHash('sha256').update('meetwise.interview-voice.composition', 'utf8').digest('hex');

export interface InterviewVoiceSeams {
  readonly asr: Asr;
  readonly tts: Tts;
  readonly streamAsr: StreamingAsr;
  readonly streamTts: StreamingTts;
  readonly asrConfigured: boolean;
  readonly ttsConfigured: boolean;
  readonly streamTtsConfigured: boolean;
  readonly streamAsrConfigured: boolean;
  /** 三重门:双流缝 wired(各自能力 Key+registry wired) ∧ 精确双旗 ∧ 非生产锁。 */
  readonly turnTakingConfigured: boolean;
}

function asrBindingOk(): boolean {
  const resolved = resolveModelOperation('voice.asr.v1', COMPOSITION_REVISION);
  if (!resolved.ok) return false;
  const bound = resolveModelOperationBinding('voice.asr.v1', {
    inputKind: 'asr',
    mediaRef: { kind: 'audio', digest: EMPTY_DIGEST },
    maxAudioSeconds: 120,
    locale: 'zh-CN',
  });
  return bound.ok === true && bound.binding.wired === true;
}

function ttsBindingOk(): boolean {
  const resolved = resolveModelOperation('voice.tts.v1', COMPOSITION_REVISION);
  if (!resolved.ok) return false;
  const bound = resolveModelOperationBinding('voice.tts.v1', {
    inputKind: 'tts',
    voiceContract: 'voice.standard.v1',
    textRef: { kind: 'tts-text', digest: EMPTY_DIGEST },
    maxCharacters: 2000,
  });
  return bound.ok === true && bound.binding.wired === true;
}

/** 流式 TTS 与批量 TTS 同门：registry wired 位 + typed binding 全过才允许构造 live 适配器。 */
function ttsStreamBindingOk(): boolean {
  const resolved = resolveModelOperation('voice.tts-stream.v1', COMPOSITION_REVISION);
  if (!resolved.ok) return false;
  const bound = resolveModelOperationBinding('voice.tts-stream.v1', {
    inputKind: 'tts-stream',
    voiceContract: 'voice.standard.v1',
    textRef: { kind: 'tts-text', digest: EMPTY_DIGEST },
    maxCharacters: 2000,
    sessionRef: { kind: 'session', digest: EMPTY_DIGEST },
  });
  return bound.ok === true && bound.binding.wired === true;
}

/** 流式 ASR 与流式 TTS 同门：registry wired 位 + typed binding 全过才允许构造 live 适配器。 */
function asrStreamBindingOk(): boolean {
  const resolved = resolveModelOperation('voice.asr-stream.v1', COMPOSITION_REVISION);
  if (!resolved.ok) return false;
  const bound = resolveModelOperationBinding('voice.asr-stream.v1', {
    inputKind: 'asr-stream',
    mediaRef: { kind: 'audio', digest: EMPTY_DIGEST },
    maxAudioSeconds: 120,
    sessionRef: { kind: 'session', digest: EMPTY_DIGEST },
  });
  return bound.ok === true && bound.binding.wired === true;
}

/** 结构化返回 fail-closed 形校验：text 是串 + quality 三字段为显式申报字面量（当前唯一申报形 unavailable）。 */
function asrTranscriptionDeclared(value: unknown): value is { text: string; quality: AsrQualityDeclaration } {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as { text?: unknown; quality?: unknown };
  if (typeof candidate.text !== 'string') return false;
  const quality = candidate.quality as AsrQualityDeclaration | undefined;
  return quality !== undefined && typeof quality === 'object'
    && quality.confidence === 'unavailable' && quality.duration === 'unavailable' && quality.language === 'unavailable';
}

/** fail-closed ASR：非结构化返回/缺申报一律 asr_malformed，不猜值不补默认。 */
export function failClosedAsr(inner: Asr): Asr {
  return Object.freeze({
    async transcribe(...args: Parameters<Asr['transcribe']>) {
      const result: unknown = await inner.transcribe(...args);
      if (!asrTranscriptionDeclared(result)) throw new Error('asr_malformed');
      return result;
    },
  });
}

function failClosedTts(inner: Tts): Tts {
  return Object.freeze({
    async synthesize(...args: Parameters<Tts['synthesize']>) {
      const audio = await inner.synthesize(...args);
      if (!(audio instanceof Uint8Array) || audio.byteLength === 0) throw new Error('tts_malformed');
      return audio;
    },
  });
}

function disabledSeams(): InterviewVoiceSeams {
  return Object.freeze({
    asr: disabledAsr(),
    tts: disabledTts(),
    streamAsr: disabledStreamingAsr(),
    streamTts: disabledStreamingTts(),
    asrConfigured: false,
    ttsConfigured: false,
    streamTtsConfigured: false,
    streamAsrConfigured: false,
    turnTakingConfigured: false,
  });
}

/**
 * Product composition root for interview voice. Tests may inject fake seams
 * directly; this factory is the only path that may construct native adapters.
 */
export function createInterviewVoiceSeams(env: NodeJS.ProcessEnv = process.env): InterviewVoiceSeams {
  let native: ReturnType<typeof resolveDashscopeNativeConfig>;
  try {
    native = resolveDashscopeNativeConfig(env);
  } catch {
    return disabledSeams();
  }
  const wantAsr = Boolean(native.keys.asr) && asrBindingOk();
  const wantTts = Boolean(native.keys.tts) && ttsBindingOk();
  const wantStreamTts = Boolean(native.keys.streamTts) && ttsStreamBindingOk();
  const wantStreamAsr = Boolean(native.keys.streamAsr) && asrStreamBindingOk();
  let asr = disabledAsr();
  let tts = disabledTts();
  let asrConfigured = false;
  let ttsConfigured = false;
  if (wantAsr) {
    try {
      asr = failClosedAsr(dashscopeAsr());
      asrConfigured = true;
    } catch { /* keep disabled: construction must not take down InterviewModule */ }
  }
  if (wantTts) {
    try {
      tts = failClosedTts(dashscopeTts());
      ttsConfigured = true;
    } catch { /* keep disabled: construction must not take down InterviewModule */ }
  }
  // 流式 TTS 产品接线（预览）：Key + registry wired 双门齐才构造 live 适配器；
  // 运行时双旗门仍在 synthesizeStream 内，不在此处削弱。构造零外呼。
  let streamTts: StreamingTts = disabledStreamingTts();
  let streamTtsConfigured = false;
  if (wantStreamTts) {
    try {
      streamTts = dashscopeStreamingTts();
      streamTtsConfigured = true;
    } catch { /* keep disabled: construction must not take down InterviewModule */ }
  }
  // 流式 ASR 产品接线（预览，与流式 TTS 同形）：Key + registry wired 双门齐才构造 live 适配器；
  // 运行时双旗门仍在 transcribeStream 内，不在此处削弱。构造零外呼。
  let streamAsr: StreamingAsr = disabledStreamingAsr();
  let streamAsrConfigured = false;
  if (wantStreamAsr) {
    try {
      streamAsr = dashscopeStreamingAsr();
      streamAsrConfigured = true;
    } catch { /* keep disabled: construction must not take down InterviewModule */ }
  }
  // 服务端 turn-taking（预览·第三刀）：三重门齐（双流缝 wired ∧ 精确双旗 ∧ 非生产锁）才如实翻 true；
  // 这是组合位不是新模型操作——回合推进消费的仍是两条已 wired 流缝，无第三个供应商调用类型。
  const turnTakingConfigured = streamTtsConfigured && streamAsrConfigured && isVoiceStreamAsrPreviewEnabled(env);
  return Object.freeze({
    asr,
    tts,
    streamAsr,
    streamTts,
    asrConfigured,
    ttsConfigured,
    streamTtsConfigured,
    streamAsrConfigured,
    turnTakingConfigured,
  });
}

/** 真 seam 版一回合入口的只读面：configured 如实反映三重门；runTurn 每次调用前重新过门。 */
export interface InterviewVoiceTurnRunner {
  readonly configured: boolean;
  readonly streamTts: StreamingTts;
  readonly streamAsr: StreamingAsr;
  /**
   * Fail-closed turn: throws `voice_turn_taking_*` unless the triple gate
   * (both stream seams wired + exact dual preview flags + not production-
   * locked) passes; endpointing defaults to the deterministic RMS contract.
   */
  runTurn(question: string, userAudio: AsyncIterable<Uint8Array>, hooks?: StreamTurnHooks, endpointing?: RmsEndpointingConfig): Promise<VoiceTurnResult>;
}

/**
 * Composition-root turn-taking entry (preview, voice slice 3). Product mains
 * do not call this yet; isolated capability-gated proofs do. Every `runTurn`
 * re-asserts `assertVoiceTurnTakingPreviewAllowed` and the seam wiring before
 * any WebSocket — flags or Keys alone never run a turn. RMS endpointing
 * (deterministic, zero model) closes each turn by default; a turn that ends
 * without an ASR final still yields an empty transcript and is refused
 * downstream (no invented answer).
 */
export function createInterviewVoiceTurnRunner(env: NodeJS.ProcessEnv = process.env): InterviewVoiceTurnRunner {
  const seams = createInterviewVoiceSeams(env);
  const tripleGate = seams.streamTtsConfigured && seams.streamAsrConfigured;
  return Object.freeze({
    configured: tripleGate && isVoiceStreamAsrPreviewEnabled(env),
    streamTts: seams.streamTts,
    streamAsr: seams.streamAsr,
    async runTurn(question: string, userAudio: AsyncIterable<Uint8Array>, hooks: StreamTurnHooks = {}, endpointing?: RmsEndpointingConfig): Promise<VoiceTurnResult> {
      assertVoiceTurnTakingPreviewAllowed(env);                    // 门 1+2:双旗 + 非生产锁(fail-closed)
      if (!tripleGate) throw new Error(VOICE_TURN_TAKING_NOT_CONFIGURED);   // 门 3:双流缝 wired(构造期事实)
      return await streamingVoiceTurn(
        { asr: seams.streamAsr, tts: seams.streamTts, endpointing: endpointing ?? RMS_TURN_ENDPOINTING },
        question, userAudio, hooks);
    },
  });
}

/** 回合默认端点形:16k/30ms 帧·连续静音 ~510ms 切回合(纯确定性;调用方可覆盖)。 */
const RMS_TURN_ENDPOINTING: RmsEndpointingConfig = {};
