import { critiqueQuestion, type QuestionKind } from '@meetwise/domain';
import type { AdaptiveDeps, AdaptiveInterviewGraphState } from '../state.ts';

function issueQuestionId(stateVersion: number, turn: number, clarifyAttempts: number): string {
  return `q-v${stateVersion}-t${turn}-c${clarifyAttempts}`;
}

/** 只生成/反思并 checkpoint pending question；这里没有 interrupt，因此 resume 不会重调模型。 */
export function createGenerateQuestionNode(deps: AdaptiveDeps) {
  return async (state: AdaptiveInterviewGraphState) => {
    const route = state.route as { competency: string; difficulty: number; qkind: QuestionKind };
    const turn = state.mind.turn;
    const clarifying = state.clarify;
    let question: string;
    let sources: string[];
    let critiqueIssues: string[];
    let hint: string | undefined;

    if (clarifying) {
      ({ question, sources } = clarifying);
      critiqueIssues = clarifying.critique;
      hint = clarifying.hint;
    } else {
      const asked = state.transcript.map((entry) => entry.q);
      let generated = await deps.retrieveAndGenerate(route.competency, route.difficulty, 0, turn, state.facts, route.qkind);
      let critique = critiqueQuestion(generated.question, route.competency, asked, deps.competencyKeywords ?? {});
      for (let attempt = 1; attempt < 3 && !critique.ok; attempt++) {
        generated = await deps.retrieveAndGenerate(route.competency, route.difficulty, attempt, turn, state.facts, route.qkind);
        critique = critiqueQuestion(generated.question, route.competency, asked, deps.competencyKeywords ?? {});
      }
      question = generated.question;
      sources = generated.sources;
      critiqueIssues = critique.issues;
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
        kind: route.qkind,
        sources,
        critique: critiqueIssues,
        hint,
      },
    };
  };
}
