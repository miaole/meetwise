/**
 * CRAG 自纠检索(可靠"自己探索"的本体)。检索完**先给检索结果打分**,据置信度决定:
 *  - use_local(够好)  : 用本地真题,剥掉无关(只留 score≥keep 的)。
 *  - augment_web(模糊): 本地不够强 → 本地 + **自主 web 探索** 混合。
 *  - fallback_web(不行/空): 弃用本地 → **自主回退去 web 探索**(allowlist 抓取)。这就是"企业没维护题库就自己深探"的分支。
 * 决策纯函数(确定可 gate、可辩护);IO(本地检索 / web 探索)是注入 seam。失败模式可解释:阈值显式、reason 带出。
 * 对接:score 来自已建的 topScore 检索信号;web 探索接已建的 grounded-questions(标源+不照搬+校验)。
 */
export interface ScoredRef { ref: string; score: number }
export type CragAction = 'use_local' | 'augment_web' | 'fallback_web';
export interface CragVerdict { action: CragAction; kept: ScoredRef[]; reason: string }

export interface CragThresholds { high?: number; low?: number; keep?: number }

/** 给检索结果评级 → 自纠动作。top 高=用本地;top 低=弃用去探索;中间=混合。 */
export function gradeRetrieval(scored: ScoredRef[], t: CragThresholds = {}): CragVerdict {
  const high = t.high ?? 0.7, low = t.low ?? 0.3, keep = t.keep ?? 0.5;
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
}

/**
 * 自纠检索编排:本地检索 → 评级 → 仅在"本地不够好"时才**自主去 web 探索**(省钱+只在该探时探)。
 * 返回 { verdict, local(剥过的), web(探到的源) },供下游 grounded 出题。
 */
export async function cragRetrieve(
  query: string, deps: CragDeps, t: CragThresholds = {},
): Promise<{ verdict: CragVerdict; local: ScoredRef[]; web: SourceDoc[] }> {
  const retrieved = await deps.localRetrieve(query);
  const verdict = gradeRetrieval(retrieved, t);
  const web = verdict.action === 'use_local' ? [] : await deps.webExplore(query);   // 够好就不探(可靠且不浪费)
  return { verdict, local: verdict.kept, web };
}
