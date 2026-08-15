import { randomUUID } from 'node:crypto';
import type { AdaptiveDeps, SubmittedAnswerRef } from './state.ts';

/**
 * Test and local-memory harness only.  It lets a MemorySaver graph exercise the
 * same reference-only resume contract as production without putting an answer
 * into the graph command/checkpoint.  The process-local map is intentionally
 * not durable; production must use the owner-scoped job artifact supplied by
 * the worker lifecycle.
 */
export function createEphemeralAnswerVault(): {
  issue(answer: string): Pick<SubmittedAnswerRef, 'answerId'>;
  loadAnswer: AdaptiveDeps['loadAnswer'];
} {
  const entries = new Map<string, string>();
  return {
    issue(answer) {
      const answerId = randomUUID();
      entries.set(answerId, answer);
      return { answerId };
    },
    async loadAnswer(reference) {
      const answer = entries.get(reference.answerId);
      if (answer === undefined) throw new Error('answer_artifact_unavailable');
      return answer;
    },
  };
}
