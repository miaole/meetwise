/**
 * CRAG 自纠检索(可靠"自己探索"的本体)。检索完**先给检索结果打分**,据置信度决定:
 *  - use_local(够好)  : 用本地真题,剥掉无关(只留 score≥keep 的)。
 *  - augment_web(模糊): 本地不够强 → 本地 + **自主 web 探索** 混合。
 *  - fallback_web(不行/空): 弃用本地 → **自主回退去 web 探索**(allowlist 抓取)。这就是"企业没维护题库就自己深探"的分支。
 * 决策纯函数(确定可 gate、可辩护);IO(本地检索 / web 探索)是注入 seam。失败模式可解释:阈值显式、reason 带出。
 * 对接:score 来自已建的 topScore 检索信号;web 探索接已建的 grounded-questions(标源+不照搬+校验)。
 */
/** `evidence` is an already authorized, bounded excerpt. It is model data—not an instruction—and may be absent
 * for compatibility seams/legacy fixtures that only assert provenance IDs. */
export interface ScoredRef {
  ref: string;
  score: number;
  evidence?: string;
  /** 内部可用性信号，不来自用户文本、不会进入 prompt 或引用列表。 */
  availability?: 'degraded';
}
export type CragAction = 'use_local' | 'augment_web' | 'fallback_web' | 'refuse' | 'deny_external';
export interface CragVerdict { action: CragAction; kept: ScoredRef[]; reason: string }

export interface CragThresholds { high?: number; low?: number; keep?: number }

/** 在保持数组检索契约兼容的前提下，传递“基础设施/预算拒绝”而不把它误判为语义空命中。 */
export function degradedRetrieval(reason: string): ScoredRef {
  return { ref: `__rag_degraded__:${reason.replace(/[^A-Za-z0-9._:-]/g, '_').slice(0, 80)}`, score: -1, availability: 'degraded' };
}

/** 给检索结果评级 → 自纠动作。top 高=用本地;top 低=弃用去探索;中间=混合。 */
export function gradeRetrieval(scored: ScoredRef[], t: CragThresholds = {}): CragVerdict {
  const high = t.high ?? 0.7, low = t.low ?? 0.3, keep = t.keep ?? 0.5;
  const degraded = scored.find((item) => item.availability === 'degraded');
  if (degraded) {
    // 成本/策略/供应商故障不是“题库没有相关内容”。继续 web/deep search 会掩盖 reason、制造第二条外发路径。
    return { action: 'deny_external', kept: [], reason: `local_retrieval_degraded:${degraded.ref.slice('__rag_degraded__:'.length)}` };
  }
  if (scored.length === 0) return { action: 'fallback_web', kept: [], reason: 'no_results → 回退 web 探索' };
  const top = Math.max(...scored.map((s) => s.score));
  if (top >= high) return { action: 'use_local', kept: scored.filter((s) => s.score >= keep), reason: `top=${top.toFixed(2)}≥${high}:用本地,剥无关` };
  if (top < low) return { action: 'fallback_web', kept: [], reason: `top=${top.toFixed(2)}<${low}:弃用,自主 web 探索` };
  return { action: 'augment_web', kept: scored.filter((s) => s.score >= keep), reason: `${low}≤top<${high}:本地+web 混合` };
}

import type { SourceDoc } from './grounded-questions.ts';
export interface CragDeps {
  localRetrieve: (query: string) => Promise<ScoredRef[]>;   // 本地题库检索(返回带分数)
  webExplore: (query: string) => Promise<SourceDoc[]>;      // 自主 web 探索(allowlist 抓取,接地核)
  /** 可选的有界多源深度取证。未注入时退回 webExplore，测试和旧调用保持兼容。 */
  deepResearch?: (query: string) => Promise<SourceDoc[]>;
  /** Narrow capability policy, evaluated before local retrieval or any egress. It is not a general intent router. */
  researchBoundary?: (query: string) => { action: 'allow' | 'refuse' | 'deny_external'; reason?: string };
}

/**
 * 自纠检索编排:本地检索 → 评级 → 仅在"本地不够好"时才**自主去 web 探索**(省钱+只在该探时探)。
 * 返回 { verdict, local(剥过的), web(探到的源) },供下游 grounded 出题。
 */
export async function cragRetrieve(
  query: string, deps: CragDeps, t: CragThresholds = {},
): Promise<{ verdict: CragVerdict; local: ScoredRef[]; web: SourceDoc[] }> {
  const boundary = deps.researchBoundary?.(query);
  if (boundary && boundary.action !== 'allow') {
    // Do not turn an explicit money/HR/privacy request into a search-engine query. `deny_external` is used for
    // prompt/tool escalation: the caller may produce a safe generic fallback, but no local evidence or web content
    // is treated as an instruction. Both paths have zero egress by construction.
    return {
      verdict: { action: boundary.action, kept: [], reason: `research_boundary:${boundary.reason ?? boundary.action}` },
      local: [], web: [],
    };
  }
  const retrieved = await deps.localRetrieve(query);
  const verdict = gradeRetrieval(retrieved, t);
  // 够好就不探；低置信才进入固定上限的 deepResearch。它不是模型自由工具调用：query 由
  // graph 的能力/难度决定、源由组合根 allowlist 决定、缺省退回原 webExplore seam。
  const explore = deps.deepResearch ?? deps.webExplore;
  const web = verdict.action === 'use_local' || verdict.action === 'deny_external' || verdict.action === 'refuse'
    ? []
    : await explore(query);
  return { verdict, local: verdict.kept, web };
}
