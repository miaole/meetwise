import { boundedInterviewTurns, initMind } from '@meetwise/domain';
import type { AdaptiveDeps } from '../state.ts';

export function createPlanNode(deps: AdaptiveDeps) {
  return () => ({
    mind: initMind(deps.competencies, boundedInterviewTurns(deps.maxTurns)),
  });
}
