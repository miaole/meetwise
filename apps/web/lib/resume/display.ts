import type { ResumeRef } from '@meetwise/contracts';

const STATUS_LABEL: Record<string, string> = {
  uploaded: '已上传',
  ingesting: '解析中',
  ingested: '解析完成',
  failed: '解析失败',
  erasure_fenced: '删除处理中',
  erased: '已删除',
};

export function resumeStatusLabel(status: string): string {
  return STATUS_LABEL[status] ?? '状态未知';
}

export function resumeOptionLabel(resume: ResumeRef): string {
  return `${resume.display_name}（${resumeStatusLabel(resume.status)}）`;
}

/**
 * #260 简历下拉唯一可用谓词：与服务端 begin/bind 守卫同语义（interview/quiz/diagnosis service 均 status='ingested' 才放行）。
 * 禁自造第二谓词/白名单——UI 列表面只把下拉拉齐到服务端既有语义，选中即 409 的白点从源头移除。
 */
export function isEligibleResume(resume: ResumeRef): boolean {
  return resume.status === 'ingested';
}

/** 空态臂（#260 W1③）：null=有可用简历、照常渲染表单；否则三页共用同一文案单源。
 *  resumes=0 → 既有「还没有简历」逐字不变；resumes>0 且可用=0 → 新「暂不可用」臂（只述状态，不解释围栏细节）。 */
export interface ResumeEmptyState { text: string; linkHref: string; linkText: string }

export function resumeEmptyState(resumes: readonly ResumeRef[]): ResumeEmptyState | null {
  if (resumes.length === 0) {
    return { text: '还没有简历。', linkHref: '/resume', linkText: '先去上传简历 →' };
  }
  if (!resumes.some(isEligibleResume)) {
    return { text: '简历暂不可用（解析中/失败/删除处理中），先去简历页处理。', linkHref: '/resume', linkText: '去简历页 →' };
  }
  return null;
}
