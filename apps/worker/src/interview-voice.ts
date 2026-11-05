/**
 * Worker-side interview voice composition. Text and voice share the same
 * graph, checkpoint, entitlements and scoring path; this only supplies the
 * ASR/TTS edge. Missing Keys stay fail-closed.
 * AG-32: `submit` is the same text-answer seam (claim → `{ answerId }` resume,
 * i.e. submitAdaptiveAnswer wrapped); voice-turn never resumes the graph with
 * the raw transcript.
 * AG-32 rev r1（证伪外席2 P1 修复）：语音提交缝 `submitVoiceTranscriptAnswer` 是生产组合形——
 * 内容闸（judgeInterviewAnswerContent 单一真相·与文本入口逐值同码）先于 claim，拒收轮次
 * 题目保持 issued 可重答零副作用；之后与文本作答同一条写入+恢复路（claim → submitAdaptiveAnswer）。
 */
import { randomUUID } from 'node:crypto';
import { createInterviewVoiceSeams, type InterviewVoiceSeams } from '@meetwise/ai-runtime';
import { asPrincipal, answerHash, claimInterviewAnswer } from '@meetwise/db';
import { assertInterviewAnswerContentAcceptable } from '@meetwise/domain';
import { submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from './adaptive-lifecycle.ts';
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

/** 语音提交缝返回面（与文本作答 submitAdaptiveAnswer 投影子集同形）。 */
export interface VoiceTranscriptSubmitResult { nextQuestion?: string; done: boolean; }

interface IssuedQuestionIdentity { questionId: string; stateVersion: number; turn: number; }

/**
 * 语音提交缝（生产形）：转写文本 → 与文本作答同一入口。
 *
 * 1. 内容闸（先于 claim，零副作用）：空白/空转写 → `invalid_turn`、超长（>8000，与文本入口
 *    同一 INTERVIEW_ANSWER_MAX_LENGTH 上限）→ `answer_too_long`——错误码与文本路径逐值同码
 *    （judgeInterviewAnswerContent 单一真相）。拒收轮次不 claim、不推进图：题目保持 issued
 *    可重答，checkpoint/ledger/事件/计费零变更。
 * 2. 与文本同一条写入+恢复路：读 issued 题 identity（ledger）→ `claimInterviewAnswer`
 *    （answerId=服务端 UUID、answerHash 服务端重算）→ `submitAdaptiveAnswer`（`{ answerId }`
 *    resume 推进图+投影）——转写字符串绝不进 Command(resume)。
 */
export async function submitVoiceTranscriptAnswer(d: AdaptiveLifecycleDeps, answer: string): Promise<VoiceTranscriptSubmitResult> {
  assertInterviewAnswerContentAcceptable(answer);
  const issued = await asPrincipal(d.pool, d.owner, async (c): Promise<IssuedQuestionIdentity | undefined> => {
    const r = await c.query(
      `SELECT question_id, state_version, turn FROM interview_question
        WHERE owner_user_id=$1 AND interview_id=$2 AND status='issued'
        ORDER BY created_at, state_version LIMIT 1`, [d.owner, d.interviewId]);
    const row = (r.rows as Array<Record<string, unknown>>)[0];
    return row ? { questionId: String(row['question_id']), stateVersion: Number(row['state_version']), turn: Number(row['turn']) } : undefined;
  });
  if (!issued) throw Object.assign(new Error('voice_submit_no_issued_question'), { code: 'voice_submit_no_issued_question' });
  const input = { ...issued, answerId: randomUUID(), answerHash: answerHash(answer), answer };
  const claimed = await asPrincipal(d.pool, d.owner, (c) => claimInterviewAnswer(c, d.owner, d.interviewId, input));
  if (claimed.status !== 'accepted')
    throw Object.assign(new Error(`voice_submit_claim_${claimed.status}`), { code: `voice_submit_claim_${claimed.status}` });
  const r = await submitAdaptiveAnswer(d, input);
  return { nextQuestion: r.nextQuestion, done: r.done };
}
