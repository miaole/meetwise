import { decideNext, rememberDecision, SAFETY_CEILING_TURNS } from '@meetwise/domain';
import type { AdaptiveInterviewGraphState } from '../state.ts';

export function decideNode(state: AdaptiveInterviewGraphState) {
  if (state.clarify) {
    const hitCeiling = state.mind.turn >= SAFETY_CEILING_TURNS || state.mind.turn >= state.mind.maxTurns;
    if (hitCeiling) {
      const action = decideNext(state.mind);
      const mind = rememberDecision(state.mind, action);
      return {
        mind,
        route: 'conclude' as const,
        concludeReason: action.kind === 'conclude' ? action.provenance : mind.lastDecision ?? null,
      };
    }
    return {
      route: {
        competency: state.clarify.competency,
        difficulty: state.mind.difficulty,
        qkind: state.clarify.qkind,
      },
    };
  }
  const action = decideNext(state.mind);
  const mind = rememberDecision(state.mind, action);
  return {
    mind,
    route:
      action.kind === 'conclude'
        ? ('conclude' as const)
        : { competency: action.competency, difficulty: action.difficulty, qkind: action.qkind },
    concludeReason: action.kind === 'conclude' ? action.provenance : null,
  };
}
