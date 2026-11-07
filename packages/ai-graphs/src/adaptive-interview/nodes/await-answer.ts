import { interrupt } from '@langchain/langgraph';
import type { AdaptiveInterviewGraphState, SubmittedAnswerRef } from '../state.ts';

/**
 * AG-32: 非法 resume 输入的拒绝标记。经 interrupt value 的可选字段 `resumeError` 带出
 * （纯枚举标识符，与 qkind 同类，可入 checkpoint/interrupt），消费者可据以提示重答。
 */
export const ANSWER_REFERENCE_INVALID = 'answer_reference_invalid';

function submittedReference(value: unknown): Omit<SubmittedAnswerRef, 'questionId'> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as { answerId?: unknown };
  if (typeof candidate.answerId !== 'string' || candidate.answerId.length < 1 || candidate.answerId.length > 256) return null;
  return { answerId: candidate.answerId };
}

/** interrupt 前零副作用；重放仅重读 persistent pending state。 */
export function awaitAnswerNode(state: AdaptiveInterviewGraphState) {
  const pending = state.pending;
  if (!pending) {
    return {
      concluded: true,
      degraded: { reason: 'pending_question_missing', turn: state.mind.turn },
    };
  }
  const question = {
    questionId: pending.questionId,
    stateVersion: pending.stateVersion,
    turn: pending.turn,
    question: pending.question,
    competency: pending.competency,
    kind: pending.kind,
    hint: pending.hint,
  };
  // Raw strings and arbitrary resume objects must not have a compatibility
  // path: accepting either would serialize user input into the interrupt
  // checkpoint before a later node could clear it.
  //
  // AG-32: 非法输入不再 concluded——拒绝本次输入，原题原 identity 重新 interrupt（resumeError
  // 标记），pending/transcript/turn 零推进，用户可重答。LangGraph 多 interrupt 语义保证停在新
  // 下标：节点重放按调用序回放已持久化的 resume 数组（checkpoint pendingWrites 恢复），循环停在
  // 最早的未回放下标=最新一次拒绝；合法 { answerId } 到达即走出循环。concluded 臂只保留上方
  // pending 缺失的 fail-closed 面。
  let rejected = false;
  for (;;) {
    const value = interrupt(rejected ? { ...question, resumeError: ANSWER_REFERENCE_INVALID } : question);
    const reference = submittedReference(value);
    if (reference) return { submitted: { questionId: pending.questionId, ...reference } };
    rejected = true;
  }
}
