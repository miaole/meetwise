import { END, START, StateGraph, type BaseCheckpointSaver } from '@langchain/langgraph';
import { DEFAULT_ABSOLUTE_MAX_TURNS } from '@meetwise/domain';
import { awaitAnswerNode } from './nodes/await-answer.ts';
import { concludeNode } from './nodes/conclude.ts';
import { decideNode } from './nodes/decide.ts';
import { createEvaluateAnswerNode } from './nodes/evaluate-answer.ts';
import { createGenerateQuestionNode } from './nodes/generate-question.ts';
import { createPlanNode } from './nodes/plan.ts';
import { AdaptiveInterviewState, type AdaptiveDeps } from './state.ts';

/**
 * 可恢复自适应图的唯一装配点。
 *
 * 拓扑固定为 plan → decide → genQuestion → (pending ? awaitAnswer(interrupt) : conclude) → evalAnswer → decide*。
 * `interrupt()` 所在节点在 resume 时从第一行重放，因此模型调用被隔离在 genQuestion 节点。
 * 出题失败不写 pending、不发明题面，条件边直接 conclude（UC-MODEL-ROUTE-04）。
 */
export function buildAdaptiveInterviewGraph(checkpointer: BaseCheckpointSaver<number> | boolean | undefined, deps: AdaptiveDeps) {
  const observed = <T extends (state: any) => any>(node: 'plan' | 'decide' | 'genQuestion' | 'awaitAnswer' | 'evalAnswer' | 'conclude', execute: T) =>
    async (state: Parameters<T>[0]): Promise<Awaited<ReturnType<T>>> => {
      const run = () => execute(state) as Awaited<ReturnType<T>>;
      if (!deps.graphObserver) return run();
      return deps.graphObserver.runNode({
        graph: 'adaptive-interview', node,
        turn: state?.mind?.turn ?? 0,
        stateVersion: state?.stateVersion ?? 0,
        release: 'adaptive-interview/v1',
      }, run) as Promise<Awaited<ReturnType<T>>>;
    };
  return new StateGraph(AdaptiveInterviewState)
    .addNode('plan', observed('plan', createPlanNode(deps)))
    .addNode('decide', observed('decide', decideNode))
    .addNode('genQuestion', observed('genQuestion', createGenerateQuestionNode(deps)))
    .addNode('awaitAnswer', observed('awaitAnswer', awaitAnswerNode))
    .addNode('evalAnswer', observed('evalAnswer', createEvaluateAnswerNode(deps)))
    .addNode('conclude', observed('conclude', concludeNode))
    .addEdge(START, 'plan')
    .addEdge('plan', 'decide')
    .addConditionalEdges(
      'decide',
      (state) => (state.route === 'conclude' ? 'conclude' : 'genQuestion'),
      { genQuestion: 'genQuestion', conclude: 'conclude' },
    )
    .addConditionalEdges(
      'genQuestion',
      // AG-F(刀F·修法②):本边为「耗尽换 competency 继续」的路由回环——节点在族内失败且换序帽内
      // 返回「route 已顺延+pending=null+concluded 未置」时,本边回 genQuestion（新 route 重出题）
      // 而非 conclude;其余形状语义零位移:pending → awaitAnswer;concluded(真终场 failClosed)/
      // route 缺席或 'conclude' → conclude。回环受节点侧 MAX_COMPETENCY_EXHAUST_SWITCH 硬帽约束,
      // 叠加 compile recursionLimit（:57）双保险,无循环放大。
      (state) => (state.pending
        ? 'awaitAnswer'
        : !state.concluded && state.route && state.route !== 'conclude' ? 'genQuestion' : 'conclude'),
      { awaitAnswer: 'awaitAnswer', conclude: 'conclude', genQuestion: 'genQuestion' },
    )
    .addEdge('awaitAnswer', 'evalAnswer')
    .addConditionalEdges(
      'evalAnswer',
      (state) => (state.concluded ? 'conclude' : 'decide'),
      { decide: 'decide', conclude: 'conclude' },
    )
    .addEdge('conclude', END)
    // 单段 invoke 结构死循环阀；interrupt resume 会重置计数。整场长度由 soft/absolute 政策决定。
    .compile({ checkpointer, recursionLimit: Math.min(64, DEFAULT_ABSOLUTE_MAX_TURNS) });
}
