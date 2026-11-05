/**
 * Worker-side interview voice composition. Text and voice share the same
 * graph, checkpoint, entitlements and scoring path; this only supplies the
 * ASR/TTS edge. Missing Keys stay fail-closed.
 * AG-32: `submit` is the same text-answer seam (claim → `{ answerId }` resume,
 * i.e. submitAdaptiveAnswer wrapped); voice-turn never resumes the graph with
 * the raw transcript.
 */
import { createInterviewVoiceSeams, type InterviewVoiceSeams } from '@meetwise/ai-runtime';
import { voiceAnswerTurn, type VoiceTurnDeps } from './voice-turn.ts';

export function composeInterviewVoiceSeams(env: NodeJS.ProcessEnv = process.env): InterviewVoiceSeams {
  return createInterviewVoiceSeams(env);
}

export async function previewVoiceAnswerTurn(
  deps: Omit<VoiceTurnDeps, 'asr' | 'tts'> & Partial<Pick<VoiceTurnDeps, 'asr' | 'tts'>>,
  audioIn: Uint8Array,
) {
  const seams = (deps.asr && deps.tts) ? undefined : composeInterviewVoiceSeams();
  return voiceAnswerTurn({
    asr: deps.asr ?? seams!.asr,
    tts: deps.tts ?? seams!.tts,
    submit: deps.submit,
  }, audioIn);
}
