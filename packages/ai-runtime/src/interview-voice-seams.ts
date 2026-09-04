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
 * take down text-interview DI. Streaming ASR and server turn-taking stay
 * disabled even when `VOICE_STREAM_ASR_*` preview flags and stream Keys exist:
 * `voice.asr-stream.v1` is unwired and PRD-TEST-006 is not verified. This is
 * not MODEL-OP-02 shared admission, durable attempt/unknown, or a production SLO.
 */
import { createHash } from 'node:crypto';
import { resolveDashscopeNativeConfig } from './dashscope-native-config.ts';
import { resolveModelOperation } from './model-operation-registry.ts';
import { resolveModelOperationBinding } from './operation-binding.ts';
import {
  dashscopeAsr, dashscopeTts, disabledAsr, disabledTts, type Asr, type Tts,
} from './voice.ts';
import { disabledStreamingAsr, disabledStreamingTts, type StreamingAsr, type StreamingTts } from './voice-stream.ts';

const COMPOSITION_REVISION = 'interview-voice-preview';
const EMPTY_DIGEST = createHash('sha256').update('meetwise.interview-voice.composition', 'utf8').digest('hex');

export interface InterviewVoiceSeams {
  readonly asr: Asr;
  readonly tts: Tts;
  readonly streamAsr: StreamingAsr;
  readonly streamTts: StreamingTts;
  readonly asrConfigured: boolean;
  readonly ttsConfigured: boolean;
  readonly streamAsrConfigured: boolean;
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

function failClosedAsr(inner: Asr): Asr {
  return Object.freeze({
    async transcribe(audio, opts) {
      const text = await inner.transcribe(audio, opts);
      if (typeof text !== 'string') throw new Error('asr_malformed');
      return text;
    },
  });
}

function failClosedTts(inner: Tts): Tts {
  return Object.freeze({
    async synthesize(text, opts) {
      const audio = await inner.synthesize(text, opts);
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
  return Object.freeze({
    asr,
    tts,
    streamAsr: disabledStreamingAsr(),
    streamTts: disabledStreamingTts(),
    asrConfigured,
    ttsConfigured,
    streamAsrConfigured: false,
    turnTakingConfigured: false,
  });
}
