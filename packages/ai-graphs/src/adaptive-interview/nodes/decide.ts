import { absoluteMaxOf, decideNext, rememberDecision } from '@meetwise/domain';
import type { AdaptiveInterviewGraphState } from '../state.ts';

export function decideNode(state: AdaptiveInterviewGraphState) {
  // clarify 续问不走 observeInterviewSignals：保证每题至多一次引导重答（既有非作答合同）。
  // 绝对杀开关仍先赢。信号只在非 clarify 路径经 decideNext 消费。
  if (state.clarify) {
    if (state.mind.turn >= absoluteMaxOf(state.mind)) {
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
      concludeReason: null,
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
