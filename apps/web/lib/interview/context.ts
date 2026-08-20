export function interviewContextTitle(jobTitle: string | null | undefined): string {
  if (jobTitle === undefined) return '面试岗位信息同步中';
  return jobTitle?.trim() ? `面试岗位：${jobTitle.trim()}` : '通用模拟面试';
}

export function interviewResumeLabel(name: string | null | undefined): string {
  return name === undefined ? '简历信息同步中' : (name ?? '未绑定简历');
}

export function interviewTimeLabel(createdAt: string | null | undefined): string {
  if (!createdAt) return '时间待同步';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '时间待同步';
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date);
}
