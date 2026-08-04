import { interrupt } from '@langchain/langgraph';
import type { AdaptiveInterviewGraphState } from '../state.ts';

/** interrupt 前零副作用；重放仅重读 persistent pending state。 */
export function awaitAnswerNode(state: AdaptiveInterviewGraphState) {
  const pending = state.pending;
  if (!pending) {
    return {
      concluded: true,
      degraded: { reason: 'pending_question_missing', turn: state.mind.turn },
    };
  }
  const answer = String(
    interrupt({
      questionId: pending.questionId,
      stateVersion: pending.stateVersion,
      turn: pending.turn,
      question: pending.question,
      competency: pending.competency,
      kind: pending.kind,
      hint: pending.hint,
    }),
  );
  return { submitted: { questionId: pending.questionId, answer } };
}
