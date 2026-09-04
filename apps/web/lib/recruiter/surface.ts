/**
 * B 端招聘方表面：状态文案、申请复核查找、架构说明卡片。
 * 评分校准完成前，任何 application.score 都不得变成可见数字。
 */

export const RECRUITER_APPLICATION_ID = /^app_[A-Za-z0-9-]+$/;

export const APPLICATION_STATUS_LABEL: Record<string, { text: string; variant: 'success' | 'outline' | 'destructive' }> = {
  invited: { text: '已邀请', variant: 'outline' },
  in_progress: { text: '面试中', variant: 'outline' },
  completed: { text: '已完成', variant: 'success' },
  assessment_unavailable: { text: '待人工复核', variant: 'outline' },
  declined: { text: '已婉拒', variant: 'destructive' },
};

export function applicationStatusLabel(status: string): { text: string; variant: 'success' | 'outline' | 'destructive' } {
  return APPLICATION_STATUS_LABEL[status] ?? { text: '状态未知', variant: 'outline' };
}

/** 招聘方评估栏：只解释流程，永不把 score 当数字。 */
export function recruiterAssessmentLabel(status: string, _score?: number | null): string {
  if (status === 'assessment_unavailable') return '待人工复核';
  if (status === 'completed') return '流程已结束 · 不提供数值评分';
  if (status === 'in_progress') return '面试进行中 · 尚无评估结论';
  if (status === 'invited') return '尚未开始岗位面试';
  if (status === 'declined') return '候选人已婉拒';
  return '不提供数值评分';
}

/** C/B 申请列表的分数消费门：校准完成前恒不可见。 */
export function applicationScoreVisible(_score: number | null | undefined): false {
  return false;
}

export function isRecruiterApplicationId(id: string): boolean {
  return RECRUITER_APPLICATION_ID.test(id);
}

export function findOwnedApplication<T extends { id: string }>(
  items: readonly T[] | null | undefined,
  applicationId: string,
): T | null {
  if (!items || !isRecruiterApplicationId(applicationId)) return null;
  return items.find((row) => row.id === applicationId) ?? null;
}

export type RecruiterArchitectureId =
  | 'adaptive'
  | 'checkpoint'
  | 'prove'
  | 'scoring'
  | 'fence'
  | 'fairness'
  | 'acl';

export interface RecruiterArchitectureCard {
  id: RecruiterArchitectureId;
  title: string;
  body: string;
}

export const RECRUITER_ARCHITECTURE_HIGHLIGHTS: readonly RecruiterArchitectureCard[] = [
  {
    id: 'adaptive',
    title: '下一题跟着回答走',
    body: '不是把题单走完。候选人答到哪，下一问就从哪起。你看到的是这场岗位面试有没有走完，不是一套固定卷面。',
  },
  {
    id: 'checkpoint',
    title: '进度写在服务端',
    body: '候选人关掉页面、换设备，还能接着这一场；不会因为某台机器重启就把面试弄丢。这还不是完整逐题回放，也不能当历史档案用。',
  },
  {
    id: 'prove',
    title: '关键保护可以核对',
    body: '隔离、假分入口关掉、状态收口，都能用仓库里的核对命令复查。核对通过只说明本地合同成立，不等于已经对外发布。',
  },
  {
    id: 'scoring',
    title: '证据不够就不给分',
    body: '不会用 0 分凑数，也不会拿练习反馈当录用依据。校准和人工复核做完之前，这里不提供可比较的数字。',
  },
  {
    id: 'fence',
    title: '两边分开记账',
    body: '面试进行中的运行记录，和岗位申请结果，分开写。一边写成功，另一边不会偷偷补一个假分数；旧的后台任务也不能把新一场盖掉。',
  },
  {
    id: 'fairness',
    title: '排队按申请分开领',
    body: '后台按申请领取，目标是不让一家岗位把别人一直压在队头。当前仍有按账号串行处理的限制，不是高峰容量保证。',
  },
  {
    id: 'acl',
    title: '检索只在授权范围内',
    body: '出题用到的材料有权限边界。你看不到候选人自己的练习原文，也看不到别人岗位的材料。',
  },
];

export const RECRUITER_ARCHITECTURE_IDS: readonly RecruiterArchitectureId[] = RECRUITER_ARCHITECTURE_HIGHLIGHTS.map((card) => card.id);
