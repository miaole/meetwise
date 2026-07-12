/**
 * mock-interview 图（纯拓扑）：interrupt 持久化等待用户。checkpointer 由调用方注入
 * （worker 注 PostgresSaver 真持久；测试注 MemorySaver/PostgresSaver）。图本身不引 checkpointer 实现，
 * 这正是"可中断可恢复、凭 threadId 从持久层续会话、无内存 session"的拆分点。
 */
import { StateGraph, Annotation, START, END, interrupt } from '@langchain/langgraph';

const State = Annotation.Root({
  questions: Annotation<string[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
  answers: Annotation<string[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
  idx: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),
});

/** checkpointer：@langchain/langgraph 的 BaseCheckpointSaver（PostgresSaver/MemorySaver 皆可），由调用方注入。 */
export function buildMockInterviewGraph(checkpointer: any, questions: string[]) {
  const ask = (state: typeof State.State) => {
    const i = state.idx;
    const question = questions[i];
    const answer = interrupt({ question });           // 持久化等待用户（真 interrupt）
    return { questions: [question], answers: [String(answer)], idx: i + 1 };
  };
  return new StateGraph(State)
    .addNode('ask', ask)
    .addEdge(START, 'ask')
    .addConditionalEdges('ask', (s) => (s.idx < questions.length ? 'more' : 'done'),
      { more: 'ask', done: END })
    .compile({ checkpointer });
}
