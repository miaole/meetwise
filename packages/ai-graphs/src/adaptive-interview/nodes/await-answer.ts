import { interrupt } from '@langchain/langgraph';
import type { AdaptiveInterviewGraphState, SubmittedAnswerRef } from '../state.ts';

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
  const reference = submittedReference(interrupt({
    questionId: pending.questionId,
    stateVersion: pending.stateVersion,
    turn: pending.turn,
    question: pending.question,
    competency: pending.competency,
    kind: pending.kind,
    hint: pending.hint,
  }));
  // Raw strings and arbitrary resume objects must not have a compatibility
  // path: accepting either would serialize user input into the interrupt
  // checkpoint before a later node could clear it.
  if (!reference) {
    return {
      pending: null,
      submitted: null,
      concluded: true,
      degraded: { reason: 'answer_reference_invalid', turn: state.mind.turn },
    };
  }
  return { submitted: { questionId: pending.questionId, ...reference } };
}
