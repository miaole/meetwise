import {
  clarifyHint,
  classifyTurn,
  ingestAssessment,
  isNonAnswer,
  isSkip,
  markClarify,
  markUnresolved,
  withCurrent,
} from '@meetwise/domain';
import type { AdaptiveDeps, AdaptiveInterviewGraphState } from '../state.ts';

/** interrupt 后评分；失败安全终止为 unscored，成功后清掉 pending/submitted 再进入下一次 decide。 */
export function createEvaluateAnswerNode(deps: AdaptiveDeps) {
  return async (state: AdaptiveInterviewGraphState) => {
    const pending = state.pending;
    const submitted = state.submitted;
    if (!pending || !submitted || pending.questionId !== submitted.questionId) {
      return {
        pending: null,
        submitted: null,
        concluded: true,
        degraded: { reason: 'question_answer_identity_mismatch', turn: state.mind.turn },
      };
    }

    const { question, competency, turn } = pending;
    const answer = submitted.answer;
    const mind = withCurrent(state.mind, competency);
    const skipped = isSkip(answer);
    const deterministicNonAnswer = isNonAnswer(answer);
    let score = 0;
    let evidence: string[] = ['未正面作答(空答/跳过/套话)'];
    let relevant = false;
    let hasHook = false;

    if (!deterministicNonAnswer) {
      const assessment = await deps.assess(question, answer, competency, turn, {
        questionId: pending.questionId,
        stateVersion: pending.stateVersion,
      });
      if (assessment.status === 'unscored') {
        return {
          pending: null,
          submitted: null,
          concluded: true,
          clarify: null,
          degraded: { reason: assessment.reason, turn },
          transcript: [
            {
              questionId: pending.questionId,
              stateVersion: pending.stateVersion,
              q: question,
              competency,
              score: null,
              sources: pending.sources,
              critique: pending.critique,
              outcome: 'unscored' as const,
              relevant: false,
              kind: pending.kind,
              reason: assessment.reason,
            },
          ],
        };
      }
      score = assessment.score;
      evidence = assessment.evidence;
      relevant = assessment.relevant;
      hasHook = assessment.hasHook === true;
    }

    const verdict = classifyTurn(mind, {
      skipped,
      nonAnswer: deterministicNonAnswer || relevant === false,
    });
    if (verdict === 'clarify') {
      const hint = clarifyHint(competency);
      return {
        mind: markClarify(mind),
        pending: null,
        submitted: null,
        clarify: {
          competency,
          question,
          hint,
          sources: pending.sources,
          critique: pending.critique,
          qkind: pending.kind,
        },
        transcript: [
          {
            questionId: pending.questionId,
            stateVersion: pending.stateVersion,
            q: question,
            competency,
            score: 0,
            sources: pending.sources,
            critique: pending.critique,
            outcome: 'clarify' as const,
            relevant: false,
            kind: pending.kind,
            hint,
          },
        ],
      };
    }
    if (verdict === 'unresolved') {
      return {
        mind: markUnresolved(mind, competency),
        pending: null,
        submitted: null,
        clarify: null,
        transcript: [
          {
            questionId: pending.questionId,
            stateVersion: pending.stateVersion,
            q: question,
            competency,
            score: 0,
            sources: pending.sources,
            critique: pending.critique,
            outcome: 'unresolved' as const,
            relevant: false,
            kind: pending.kind,
          },
        ],
      };
    }
    return {
      mind: ingestAssessment(mind, competency, score, evidence, hasHook),
      pending: null,
      submitted: null,
      clarify: null,
      transcript: [
        {
          questionId: pending.questionId,
          stateVersion: pending.stateVersion,
          q: question,
          competency,
          score,
          sources: pending.sources,
          critique: pending.critique,
          outcome: 'answered' as const,
          relevant: true,
          kind: pending.kind,
        },
      ],
    };
  };
}
