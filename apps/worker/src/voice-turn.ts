/**
 * 语音面试轮次：把 ASR/TTS 包在**同一**面试作答路径外圈。audio → ASR 转写 → 交给提交闭包 → 取下一题 → TTS 合成。
 * 提交闭包与文本作答**同一条路**（claim 写入答案 → 以 `{ answerId }` resume 推进图，AG-32）——
 * 本层零图直触，转写字符串绝不进 Command(resume)。graph/checkpointer/eval/factuality 与文本路径
 * 完全一致——语音只在 I/O 边缘。掉线凭 threadId 续会话同样成立。
 * 预览组合根见 `interview-voice.ts`（`createInterviewVoiceSeams`）；缺 Key 必须显式失败。
 */
import type { Asr, Tts } from '@meetwise/ai-runtime';

/** 与文本作答返回面同形（submitAdaptiveAnswer 投影子集）。 */
export interface VoiceSubmitResult { nextQuestion?: string; done: boolean; }

export interface VoiceTurnDeps { asr: Asr; tts: Tts; submit: (answer: string) => Promise<VoiceSubmitResult>; }

/** 跑一个语音轮次:转写当前答案 → 与文本同路提交(写答案→{answerId} resume) → 返回转写 + 下一题文本/音频(无下一题则 done)。 */
export async function voiceAnswerTurn(deps: VoiceTurnDeps, audioIn: Uint8Array): Promise<{ transcript: string; nextQuestion?: string; questionAudio?: Uint8Array; done: boolean }> {
  const transcript = (await deps.asr.transcribe(audioIn)).text;                // 语音 → 文本（此后与文本作答同一入口）
  const r = await deps.submit(transcript);                                     // 同一写入+恢复路径：claim → { answerId } resume → 投影
  const nextQuestion = r.nextQuestion;
  const questionAudio = nextQuestion ? await deps.tts.synthesize(nextQuestion) : undefined; // 文本 → 语音
  return { transcript, nextQuestion, questionAudio, done: r.done };
}
