/**
 * 语音驱动的自适应面试(把已建的真流式语音接上自适应 lifecycle)。一回合:
 *   lifecycle 给题(文本) → 流式 TTS 播给用户 → 用户语音流 → 流式 ASR 转写 → transcript 当"答案"喂 submit → 拿下一题。
 * **modality-agnostic 不破**:ASR 转写就是文本答案,自适应大脑/CRAG/评估全不变——语音只是边缘 I/O。
 * lifecycle 与 voice 都是注入 seam(本文件仅由 fake seam proof 覆盖;真实用户路径是 API 组合根的批量 ASR/流式 TTS,真流式全双工/抢话未接线,不得称生产语音)。
 */
import { streamingVoiceTurn, type StreamingAsr, type StreamingTts } from '@meetwise/ai-runtime';

export interface VoiceAdaptiveDeps {
  asr: StreamingAsr; tts: StreamingTts;
  start: () => Promise<{ question?: string }>;                                   // = startAdaptiveInterview 包一层
  submit: (answer: string) => Promise<{ nextQuestion?: string; done: boolean }>; // = submitAdaptiveAnswer 包一层
  userAudioFor: (question: string) => AsyncIterable<Uint8Array>;                 // 用户对该题的语音(电话/麦克风流)
  onTtsChunk?: (c: Uint8Array) => void;                                          // 播给用户(低延迟边合成边播)
}

export async function runVoiceAdaptiveInterview(d: VoiceAdaptiveDeps): Promise<{ turns: { question: string; transcript: string }[]; concluded: boolean }> {
  const turns: { question: string; transcript: string }[] = [];
  let question = (await d.start()).question;
  let guard = 0;
  while (question && guard++ < 50) {
    const { transcript } = await streamingVoiceTurn(                            // 真流式:TTS 问 + ASR 听
      { asr: d.asr, tts: d.tts }, question, d.userAudioFor(question), { onTtsChunk: d.onTtsChunk });
    turns.push({ question, transcript });
    const r = await d.submit(transcript);                                       // transcript == 文本答案(不破内核)
    if (r.done) return { turns, concluded: true };
    question = r.nextQuestion;
  }
  return { turns, concluded: false };
}
