/**
 * 语音面试轮次：把 ASR/TTS 包在**同一**面试图外圈。audio → ASR 转写 → 喂图(resume) → 取下一题 → TTS 合成。
 * graph/checkpointer/eval/factuality 与文本路径**完全一致**——语音只在 I/O 边缘。掉线凭 threadId 续会话同样成立。
 * 预览组合根见 `interview-voice.ts`（`createInterviewVoiceSeams`）；缺 Key 必须显式失败。
 */
import { Command } from '@langchain/langgraph';
import type { Asr, Tts } from '@meetwise/ai-runtime';

export interface VoiceTurnDeps { asr: Asr; tts: Tts; graph: any; cfg: { configurable: { thread_id: string } }; }

const pendingQuestion = (snap: any) => snap.tasks?.[0]?.interrupts?.[0]?.value?.question as string | undefined;

/** 跑一个语音轮次:转写当前答案 → 推进图 → 返回转写 + 下一题文本/音频(无下一题则 done)。 */
export async function voiceAnswerTurn(deps: VoiceTurnDeps, audioIn: Uint8Array): Promise<{ transcript: string; nextQuestion?: string; questionAudio?: Uint8Array; done: boolean }> {
  const transcript = await deps.asr.transcribe(audioIn);                       // 语音 → 文本
  await deps.graph.invoke(new Command({ resume: transcript }), deps.cfg);      // 同一图、同一 resume 入口(文本路径也是它)
  const snap = await deps.graph.getState(deps.cfg);
  const nextQuestion = pendingQuestion(snap);
  const questionAudio = nextQuestion ? await deps.tts.synthesize(nextQuestion) : undefined; // 文本 → 语音
  return { transcript, nextQuestion, questionAudio, done: snap.next.length === 0 };
}
