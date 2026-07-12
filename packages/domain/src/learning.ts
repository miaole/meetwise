/**
 * 学习计划（纯逻辑,无 IO）：评估的差距维度 → 学习项(按分数升序=最弱优先,<40 高优)。闭合"评估→成长"环。
 */
export interface LearnItem { topic: string; priority: 'high' | 'medium'; action: string }
export interface LearningPlan { items: LearnItem[] }

export function deriveLearningPlan(dims: { dimension: string; score: number; gap: boolean }[]): LearningPlan {
  const items: LearnItem[] = dims
    .filter((d) => d.gap)
    .sort((a, b) => a.score - b.score)
    .map((d) => ({
      topic: d.dimension,
      priority: d.score < 40 ? 'high' : 'medium',
      action: `针对「${d.dimension}」系统复习 + 练习,目标达到 70 分`,
    }));
  return { items };
}
