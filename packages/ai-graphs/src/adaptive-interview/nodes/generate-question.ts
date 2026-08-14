import { critiqueQuestion, type QuestionKind } from '@meetwise/domain';
import type { AdaptiveDeps, AdaptiveInterviewGraphState } from '../state.ts';

function issueQuestionId(stateVersion: number, turn: number, clarifyAttempts: number): string {
  return `q-v${stateVersion}-t${turn}-c${clarifyAttempts}`;
}

/**
 * A post-dispatch critique failure is not a licence to send the same logical
 * node to a model again.  Keep the fallback local, scoped to the already
 * selected competency, and deliberately source-free: it is a question shell,
 * not evidence or a replacement QBank artifact.
 */
function deterministicQuestionFallback(competency: string, kind: QuestionKind): string {
  if (kind === 'behavioral') {
    return '请讲一段你与同事或上级在协作中发生分歧或遇到压力的经历：当时怎样沟通、如何推进，以及事后怎样复盘？';
  }
  return `请以一个具体的「${competency}」实践为例，说明目标、关键设计取舍、怎样验证结果，以及遇到问题时如何处理。`;
}

/** 只生成/反思并 checkpoint pending question；这里没有 interrupt，因此 resume 不会重调模型。 */
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

    if (clarifying) {
      ({ question, sources } = clarifying);
      critiqueIssues = clarifying.critique;
      hint = clarifying.hint;
    } else {
      const asked = state.transcript.map((entry) => entry.q);
      // Pass no resume fact text into the graph-generation seam.  The concrete
      // grounded question may say "your resume mentions a relevant experience"
      // but must not repeat the fact itself; see worker buildAdaptiveDeps.
      const generated = await deps.retrieveAndGenerate(route.competency, route.difficulty, 0, turn, [], effectiveKind);
      const critique = critiqueQuestion(generated.question, route.competency, asked, deps.competencyKeywords ?? {});
      // The model request has already crossed its billable boundary.  A graph
      // loop with :attempt=1/2 used to create new idempotency keys and could
      // turn one question node into three provider calls.  The durable slot is
      // enforced separately in MODEL-OP-00; this local fallback immediately
      // removes that source-level escape path.
      question = critique.ok ? generated.question : deterministicQuestionFallback(route.competency, effectiveKind);
      sources = critique.ok ? generated.sources : [];
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
        kind: effectiveKind,
        sources,
        critique: critiqueIssues,
        hint,
      },
    };
  };
}
