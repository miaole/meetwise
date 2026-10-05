/**
 * career-path 图（纯拓扑 · GAP-UC004-FI3-GRAPH-WIRING Candidate A「图包装 derive」）。
 *
 * 单节点图：derive(注入)。dep = 组合根注入的 `deriveCareerPath`（@meetwise/domain 纯函数，本地计算、无 IO）。
 * 纯逻辑——不引 db/contracts 运行时、不碰模型 SDK、不写 ai_invocation_trace；零模型调用。
 * 薄包装 ≠ 完整图化（GAP-UC004-GRAPH / E2E-MAIN 等不因本文件关闭）。
 *
 * AiGraphRun 状态机经注入的 ledger 落库（真实 SQL 在 API 组合根 asPrincipal 内）：
 *   begin()          create/reuse → status='active'（create version=1；reuse version+1）——真实 active 阶段，先于图执行持久化
 *   commitSuccess()  业务落库（career_path upsert 原样）+ active→succeeded（version+1）同事务
 *   markFailed()     active→failed（version+1）——图/落库任一失败后执行，随后 rethrow 原错误（Ban 吞错 / Ban 假成功）
 * markFailed 自身失败（如连接断）时不伪装终态：原错误照常抛出，转换错误经 onTransitionError 观测，行如实停留 active。
 *
 * 注入 seam（C-HA-2）：selectCareerPathDerive 只在 failThreadId 与 threadId **精确相等**时把 dep 换成确定性抛错函数
 * （fail-only：不产出任何结果、不触网、不读凭据）；failThreadId 缺省/空 = 原 dep 原样返回（零行为差）。
 */
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import type { CareerPath } from '@meetwise/domain';

export const CAREER_PATH_GRAPH_NAME = 'career-path';
export const CAREER_PATH_INJECTED_FAILURE = 'career_path_graph_injected_failure';

/** 注入边界：与 @meetwise/domain deriveCareerPath 同签名（纯本地派生）。 */
export type DeriveCareerPath = (overall: number, weaknesses: string[]) => CareerPath;

export interface CareerPathRun { version: number }
/** AiGraphRun(career-path) 持久化边界（组合根以 asPrincipal SQL 实现；测试以内存实现）。 */
export interface CareerPathRunLedger<R extends CareerPathRun = CareerPathRun> {
  begin(): Promise<R>;
  commitSuccess(run: R, careerPath: CareerPath): Promise<void>;
  markFailed(run: R): Promise<void>;
}

const S = Annotation.Root({
  overall: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),
  weaknesses: Annotation<string[]>({ reducer: (_, b) => b, default: () => [] }),
  careerPath: Annotation<CareerPath | null>({ reducer: (_, b) => b, default: () => null }),
});

export function buildCareerPathGraph(deps: { derive: DeriveCareerPath }) {
  return new StateGraph(S)
    .addNode('derive', (s) => ({ careerPath: deps.derive(s.overall, s.weaknesses) }))
    .addEdge(START, 'derive').addEdge('derive', END)
    .compile();
}

/** thread-scoped fail-only seam：仅精确匹配的线程拿到抛错 dep；否则原 dep 原样（同一引用）。 */
export function selectCareerPathDerive(threadId: string, failThreadId: string | undefined | null, derive: DeriveCareerPath): DeriveCareerPath {
  const target = typeof failThreadId === 'string' ? failThreadId.trim() : '';
  if (target === '' || target !== threadId) return derive;
  return () => { throw Object.assign(new Error(CAREER_PATH_INJECTED_FAILURE), { code: CAREER_PATH_INJECTED_FAILURE }); };
}

/** 图执行 + AiGraphRun 状态机（active→succeeded | active→failed）。失败一律 rethrow 原错误。 */
export async function runCareerPathGraph<R extends CareerPathRun>(
  input: { overall: number; weaknesses: string[] },
  deps: { derive: DeriveCareerPath; ledger: CareerPathRunLedger<R>; onTransitionError?: (error: unknown) => void },
): Promise<CareerPath> {
  const run = await deps.ledger.begin();
  try {
    const out = await buildCareerPathGraph({ derive: deps.derive }).invoke({ overall: input.overall, weaknesses: input.weaknesses });
    if (!out.careerPath) throw new Error('career_path_graph_empty_output');
    await deps.ledger.commitSuccess(run, out.careerPath);
    return out.careerPath;
  } catch (error) {
    try { await deps.ledger.markFailed(run); }
    catch (transitionError) { deps.onTransitionError?.(transitionError); }
    throw error;
  }
}
