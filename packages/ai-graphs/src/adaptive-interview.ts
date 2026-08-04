/**
 * 兼容入口：实现按状态、节点和构图层组织在 `adaptive-interview/` 中。
 * 保留此文件，避免包内或下游的既有深路径导入立即失效。
 */
export { buildAdaptiveInterviewGraph } from './adaptive-interview/graph.ts';
export type {
  AdaptiveDeps,
  AdaptiveInterviewGraphState,
  ClarifyDirective,
  PendingQuestion,
  Turn,
} from './adaptive-interview/state.ts';
