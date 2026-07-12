/**
 * 出题反思/自检(Reflection 模式的确定性部分,纯逻辑可 gate)。agent 出完题先自我批评再问:
 *  - too_short:过短不成题。
 *  - duplicate:与已问过的题重复(同义归一)。
 *  - leading:诱导/泄答(把答案/判断塞进题面,面试无效)。
 *  - off_competency:跑题(不落在本轮目标能力 / 其关键词)。
 * 不过的题应被挡下重生成(graph 的 ask 节点用)。模型侧的"虚不虚"另由 critic invoke 补(本模块只做确定性门)。
 */
const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

export interface QuestionCritique { ok: boolean; issues: ('too_short' | 'duplicate' | 'leading' | 'off_competency')[] }

export function critiqueQuestion(
  q: string,
  competency: string,
  asked: string[],
  competencyKeywords: Record<string, string[]> = {},
): QuestionCritique {
  const issues: QuestionCritique['issues'] = [];
  const t = (q ?? '').trim();
  if (t.length < 8) issues.push('too_short');
  if (asked.some((a) => norm(a) === norm(t))) issues.push('duplicate');
  if (/对不对[?？]?$|是不是就是|答案就是|显然就是|不就是/.test(t)) issues.push('leading');   // 把答案/判断塞进题面
  const kws = competencyKeywords[competency];
  if (kws && kws.length > 0 && !t.includes(competency) && !kws.some((k) => t.includes(k))) issues.push('off_competency');
  return { ok: issues.length === 0, issues };
}
