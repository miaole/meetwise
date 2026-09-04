/**
 * 职业路径（纯逻辑,无 IO）：综合分 + 弱项 → 准备度/层级/里程碑。补全"评估→学习→职业路径"成长链。
 * 保留不确定性、不替用户做决定(里程碑是建议,非承诺)。
 */
export interface Milestone { stage: string; goal: string }
export interface CareerPath { readiness: string; level: 'junior' | 'mid' | 'senior'; milestones: Milestone[] }

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

export function deriveCareerPath(overall: number, weaknesses: string[]): CareerPath {
  if (!Number.isInteger(overall) || overall < 0 || overall > 100) fail('insufficient_evidence');
  const level = overall >= 75 ? 'senior' : overall >= 50 ? 'mid' : 'junior';
  const readiness = level === 'senior' ? '可冲刺目标岗位（建议保持手感）' : level === 'mid' ? '需补强后投递' : '基础夯实阶段';
  const milestones: Milestone[] = [];
  if (weaknesses.length) milestones.push({ stage: '补短板', goal: `优先攻克：${weaknesses.join('、')}` });
  milestones.push({ stage: '模拟实战', goal: '完成 3 场达标(≥70)模拟面试' });
  if (level !== 'senior') milestones.push({ stage: '进阶', goal: '系统项目沉淀 + 深度题复盘' });
  return { readiness, level, milestones };
}
