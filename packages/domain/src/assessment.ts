/**
 * 能力评估（纯逻辑,无 IO）：面试各题得分 → 能力维度 + 差距标记 + 弱项清单(喂成长档案)。
 * 达标线 GAP=60;gap 维度=弱项,回写 user_memory 形成成长闭环(由服务层做)。
 */
export interface AssessTurn { question: string; score: number; competency?: string }
export interface Dimension { dimension: string; score: number; gap: boolean; evidence: string }
export interface Assessment { overall: number; dimensions: Dimension[]; weaknesses: string[] }

const GAP = 60;

/**
 * 所有面试综合分的唯一聚合规则。报告、成长档案必须复用它，不能把一组逐题
 * 分数再交给模型"自由判断"一个总分。
 *
 * 空集合不是 0 分：它表示本场没有有效评分证据，调用方必须走 unavailable /
 * unscored 路径，不能把系统或供应商故障伪装为候选人的低分。
 */
export function aggregateScores(scores: readonly number[]): number {
  if (scores.length === 0) throw new Error('score_aggregate_empty');
  if (scores.some((score) => !Number.isInteger(score) || score < 0 || score > 100)) {
    throw new Error('score_aggregate_invalid_input');
  }
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

/**
 * 维度轴 = **稳定的 competency**(项目经验/系统设计…,图里本就带),而非"问题文本前40字"。
 * 这样:① 成长档案能按同一能力跨场追踪(画得出能力曲线)② 不把简历接地的问题文本当维度名外泄。
 * 同一能力多题取均分聚合;competency 缺失(老数据/非自适应)才回退问题文本。
 */
export function deriveAssessment(turns: AssessTurn[]): Assessment {
  if (!turns.length) return { overall: 0, dimensions: [], weaknesses: [] };
  const hasComp = turns.some((t) => t.competency?.trim());
  let rows: Array<{ dimension: string; score: number }>;
  if (hasComp) {
    // 按 competency 聚合(同能力多题取均分);无 competency 的题归入回退标签。
    const groups = new Map<string, number[]>();
    for (const t of turns) {
      const key = t.competency?.trim() || t.question.slice(0, 40);
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(t.score);
    }
    rows = [...groups].map(([dimension, ss]) => ({ dimension, score: Math.round(ss.reduce((a, s) => a + s, 0) / ss.length) }));
  } else {
    rows = turns.map((t) => ({ dimension: t.question.slice(0, 40), score: t.score }));
  }
  const dimensions: Dimension[] = rows.map((r) => ({
    dimension: r.dimension,
    score: r.score,
    gap: r.score < GAP,
    evidence: r.score < GAP ? '低于达标线，需加强' : '达标',
  }));
  const overall = aggregateScores(turns.map((turn) => turn.score));   // overall 仍按逐题均分(不受聚合影响)
  const weaknesses = dimensions.filter((d) => d.gap).map((d) => d.dimension);
  return { overall, dimensions, weaknesses };
}
