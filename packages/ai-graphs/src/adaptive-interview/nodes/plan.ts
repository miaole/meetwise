import { initMind } from '@meetwise/domain';
import type { AdaptiveDeps } from '../state.ts';

const DEFAULT_MAX_TURNS = 8;
/** The interview graph is deliberately a bounded workflow, not open chat. */
const HARD_MAX_TURNS = 8;

function boundedMaxTurns(value: number | undefined): number {
  if (!Number.isInteger(value) || value === undefined) return DEFAULT_MAX_TURNS;
  return Math.max(1, Math.min(value, HARD_MAX_TURNS));
}

export function createPlanNode(deps: AdaptiveDeps) {
  return () => ({
    mind: initMind(deps.competencies, boundedMaxTurns(deps.maxTurns)),
  });
}
