/**
 * Fake-seam voice-adaptive helper. Isolated proofs may inject fake streaming
 * ASR/TTS after the OCR-style preview flags are set. Product composition
 * (API/worker main) must not call this: stream ASR and server turn-taking
 * are unverified (PRD-TEST-006). Empty transcripts are refuse-closed so a
 * missing final cannot be submitted as an invented answer or score.
 */
import {
  assertVoiceTurnTakingPreviewAllowed,
  streamingVoiceTurn,
  type StreamingAsr,
  type StreamingTts,
} from '@meetwise/ai-runtime';

export interface VoiceAdaptiveDeps {
  asr: StreamingAsr; tts: StreamingTts;
  start: () => Promise<{ question?: string }>;                                   // = startAdaptiveInterview 包一层
  submit: (answer: string) => Promise<{ nextQuestion?: string; done: boolean }>; // = submitAdaptiveAnswer 包一层
  userAudioFor: (question: string) => AsyncIterable<Uint8Array>;                 // 用户对该题的语音(电话/麦克风流)
  onTtsChunk?: (c: Uint8Array) => void;                                          // 播给用户(低延迟边合成边播)
}

export async function runVoiceAdaptiveInterview(
  d: VoiceAdaptiveDeps,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ turns: { question: string; transcript: string }[]; concluded: boolean }> {
  assertVoiceTurnTakingPreviewAllowed(env);
  const turns: { question: string; transcript: string }[] = [];
  let question = (await d.start()).question;
  let guard = 0;
  while (question && guard++ < 50) {
    const { transcript } = await streamingVoiceTurn(
      { asr: d.asr, tts: d.tts }, question, d.userAudioFor(question), { onTtsChunk: d.onTtsChunk });
    if (typeof transcript !== 'string' || !transcript.trim()) {
      throw new Error('streaming_asr_malformed');
    }
    turns.push({ question, transcript });
    const r = await d.submit(transcript);
    if (r.done) return { turns, concluded: true };
    question = r.nextQuestion;
  }
  return { turns, concluded: false };
}
