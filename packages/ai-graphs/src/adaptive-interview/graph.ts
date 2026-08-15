import { END, START, StateGraph, type BaseCheckpointSaver } from '@langchain/langgraph';
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
 * 拓扑固定为 plan → decide → genQuestion → awaitAnswer(interrupt) → evalAnswer → decide*。
 * `interrupt()` 所在节点在 resume 时从第一行重放，因此模型调用被隔离在 genQuestion 节点。
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
    .addEdge('genQuestion', 'awaitAnswer')
    .addEdge('awaitAnswer', 'evalAnswer')
    .addConditionalEdges(
      'evalAnswer',
      (state) => (state.concluded ? 'conclude' : 'decide'),
      { decide: 'decide', conclude: 'conclude' },
    )
    .addEdge('conclude', END)
    .compile({ checkpointer });
}
