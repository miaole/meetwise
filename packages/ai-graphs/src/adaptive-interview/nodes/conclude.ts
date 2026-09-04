import type { AdaptiveInterviewGraphState } from '../state.ts';

export function concludeNode(state: AdaptiveInterviewGraphState) {
  return {
    concluded: true,
    concludeReason: state.concludeReason ?? state.mind.lastDecision ?? null,
  };
}
