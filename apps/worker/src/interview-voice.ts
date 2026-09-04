/**
 * Worker-side interview voice composition. Text and voice share the same
 * graph, checkpoint, entitlements and scoring path; this only supplies the
 * ASR/TTS edge. Missing Keys stay fail-closed.
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
    graph: deps.graph,
    cfg: deps.cfg,
  }, audioIn);
}
