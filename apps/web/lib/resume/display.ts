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
