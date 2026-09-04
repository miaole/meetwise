import {
  critiqueQuestion,
  isQuestionGenerationFailure,
  normalizeQuestionGenerationResult,
  type QuestionGenerationProvenance,
  type QuestionKind,
} from '@meetwise/domain';
import type { AdaptiveDeps, AdaptiveInterviewGraphState } from '../state.ts';

function issueQuestionId(stateVersion: number, turn: number, clarifyAttempts: number): string {
  return `q-v${stateVersion}-t${turn}-c${clarifyAttempts}`;
}

function failClosed(
  state: AdaptiveInterviewGraphState,
  provenance: QuestionGenerationProvenance,
  reason: string,
) {
  return {
    stateVersion: state.stateVersion + 1,
    pending: null,
    concluded: true,
    degraded: { reason, turn: state.mind.turn },
    generationProvenance: provenance,
  };
}

/** 只生成/反思并 checkpoint pending question；失败不发明题面，resume 也不会重调模型。 */
export function createGenerateQuestionNode(deps: AdaptiveDeps) {
  return async (state: AdaptiveInterviewGraphState) => {
    const route = state.route as { competency: string; difficulty: number; qkind: QuestionKind };
    // Resume facts are sensitive business artifacts.  Even though dependencies
    // are runtime-only, a node result/question is checkpointed and replayed.
    // Therefore graph topology receives only an authorization bit and never
    // hands fact text to a generator/model seam that could echo it into
    // pending/transcript/interrupt/SSE/episode state.
    const resumeProfileAvailable = deps.resumeProfileAvailable === true
      || (deps.resumeFacts ?? []).some((fact) => fact.trim());
    // `grounded` means a candidate-specific claim is safe only when there is at
    // least one authorized parsed resume fact.  An empty profile is not permission for a
    // model to imagine a project; make the routing decision explicit before any
    // model dependency can see the request.
    const effectiveKind: QuestionKind = route.qkind === 'grounded' && !resumeProfileAvailable
      ? 'fundamental'
      : route.qkind;
    const turn = state.mind.turn;
    const clarifying = state.clarify;
    let question: string;
    let sources: string[];
    let critiqueIssues: string[];
    let hint: string | undefined;
    let provenance: QuestionGenerationProvenance = state.generationProvenance ?? { origin: 'model' };

    if (clarifying) {
      ({ question, sources } = clarifying);
      critiqueIssues = clarifying.critique;
      hint = clarifying.hint;
    } else {
      const asked = state.transcript.map((entry) => entry.q);
      // Pass no resume fact text into the graph-generation seam.  The concrete
      // grounded question may say "your resume mentions a relevant experience"
      // but must not repeat the fact itself; see worker buildAdaptiveDeps.
      const generated = normalizeQuestionGenerationResult(
        await deps.retrieveAndGenerate(route.competency, route.difficulty, 0, turn, [], effectiveKind),
      );
      if (isQuestionGenerationFailure(generated)) {
        return failClosed(state, generated.provenance, `generation_${generated.error}`);
      }
      const critique = critiqueQuestion(generated.question, route.competency, asked, deps.competencyKeywords ?? {});
      // A critique miss used to invent a same-competency shell and emit it as
      // question_ready.  That silently fabricates interview content after a
      // provider or quality failure.  Fail-closed: no pending, no invented stem.
      if (!critique.ok) {
        return failClosed(state, {
          origin: 'unavailable',
          errorCode: 'business_invalid',
          invokeError: 'question_critique_failed',
          operationId: generated.provenance.operationId,
          idempotencyKey: generated.provenance.idempotencyKey,
        }, 'generation_business_invalid');
      }
      question = generated.question;
      sources = generated.sources;
      critiqueIssues = critique.issues;
      provenance = generated.provenance;
    }

    const stateVersion = state.stateVersion + 1;
    return {
      stateVersion,
      pending: {
        questionId: issueQuestionId(stateVersion, turn, state.mind.clarifyAttempts),
        stateVersion,
        turn,
        question,
        competency: route.competency,
        difficulty: route.difficulty,
        kind: effectiveKind,
        sources,
        critique: critiqueIssues,
        hint,
      },
      generationProvenance: provenance,
      degraded: null,
    };
  };
}
