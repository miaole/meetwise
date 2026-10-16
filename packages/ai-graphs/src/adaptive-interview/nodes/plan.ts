import { initMind } from '@meetwise/domain';
import type { AdaptiveDeps } from '../state.ts';

export function createPlanNode(deps: AdaptiveDeps) {
  return () => ({
    // H4 R3(#252 专项面):focusWeaknesses 在场 → initMind 派生 5-8 题专项软预算;缺省 undefined=通用面逐字节原样。
    // focus 只进「考多久」软预算面;难度/信心隔离铁律在 initMind/decideNext 侧原样(零新分支)。
    mind: initMind(deps.competencies, deps.maxTurns, deps.absoluteMaxTurns, deps.focusWeaknesses),
  });
}
