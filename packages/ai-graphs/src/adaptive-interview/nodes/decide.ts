import { decideNext } from '@meetwise/domain';
import type { AdaptiveInterviewGraphState } from '../state.ts';

export function decideNode(state: AdaptiveInterviewGraphState) {
  if (state.clarify) {
    return state.mind.turn >= state.mind.maxTurns
      ? { route: 'conclude' as const }
      : {
          route: {
            competency: state.clarify.competency,
            difficulty: state.mind.difficulty,
            qkind: state.clarify.qkind,
          },
        };
  }
  const action = decideNext(state.mind);
  return {
    route:
      action.kind === 'conclude'
        ? ('conclude' as const)
        : { competency: action.competency, difficulty: action.difficulty, qkind: action.qkind },
  };
}
