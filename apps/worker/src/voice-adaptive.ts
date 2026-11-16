/**
 * Voice-adaptive turn loop over injected streaming seams. Isolated proofs may
 * inject fake streaming ASR/TTS after the OCR-style preview flags are set; the
 * composition-root entry for real seams is `createInterviewVoiceTurnRunner`
 * (`createInterviewVoiceSeams` wires the live adapters under the triple gate:
 * per-capability Keys + exact dual preview flags + not production-locked).
 * Product composition (API/worker main) still does not call this helper: the
 * preview turn loop is reachable only through explicitly gated callers
 * (`assertVoiceTurnTakingPreviewAllowed` re-checked per turn in the runner).
 * Server RMS endpointing (deterministic, zero model) closes each turn when
 * `endpointing` is passed; empty transcripts stay refuse-closed so a missing
 * final cannot be submitted as an invented answer or score (PRD-TEST-006).
 */
import {
  assertVoiceTurnTakingPreviewAllowed,
  streamingVoiceTurn,
  type EndOfTurnInfo,
  type RmsEndpointingConfig,
  type StreamingAsr,
  type StreamingTts,
} from '@meetwise/ai-runtime';

export interface VoiceAdaptiveDeps {
  asr: StreamingAsr; tts: StreamingTts;
  start: () => Promise<{ question?: string }>;                                   // = startAdaptiveInterview 包一层
  submit: (answer: string) => Promise<{ nextQuestion?: string; done: boolean }>; // = submitAdaptiveAnswer 包一层
  userAudioFor: (question: string) => AsyncIterable<Uint8Array>;                 // 用户对该题的语音(电话/麦克风流)
  onTtsChunk?: (c: Uint8Array) => void;                                          // 播给用户(低延迟边合成边播)
  /** 服务端 RMS 端点检测(第三刀):传入即每回合静音 N 帧确定性收流;不传保持旧行为(音频流自尽)。 */
  endpointing?: RmsEndpointingConfig;
  onEndOfTurn?: (info: EndOfTurnInfo) => void;                                   // 端点回执(帧数;无转写语义)
}

export async function runVoiceAdaptiveInterview(
  d: VoiceAdaptiveDeps,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ turns: { question: string; transcript: string; endedByEndpointing?: boolean; ttsInterrupted?: boolean }[]; concluded: boolean }> {
  assertVoiceTurnTakingPreviewAllowed(env);
  const turns: { question: string; transcript: string; endedByEndpointing?: boolean; ttsInterrupted?: boolean }[] = [];
  let question = (await d.start()).question;
  let guard = 0;
  while (question && guard++ < 50) {
    const { transcript, endedByEndpointing, ttsInterrupted } = await streamingVoiceTurn(
      { asr: d.asr, tts: d.tts, endpointing: d.endpointing }, question, d.userAudioFor(question),
      { onTtsChunk: d.onTtsChunk, onEndOfTurn: d.onEndOfTurn });
    if (typeof transcript !== 'string' || !transcript.trim()) {
      throw new Error('streaming_asr_malformed');
    }
    turns.push({ question, transcript, endedByEndpointing, ttsInterrupted });
    const r = await d.submit(transcript);
    if (r.done) return { turns, concluded: true };
    question = r.nextQuestion;
  }
  return { turns, concluded: false };
}
