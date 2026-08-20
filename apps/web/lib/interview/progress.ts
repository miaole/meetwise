export interface InterviewProgress {
  status: string;
  issued_turns?: number;
  answered_turns?: number;
  current_turn?: number | null;
  processing_turn?: number | null;
}

export function interviewProgressLabel(interview: InterviewProgress): string {
  const issued = Math.max(0, interview.issued_turns ?? 0);
  const answered = Math.max(0, interview.answered_turns ?? 0);

  if (interview.status === 'completed') return `共 ${issued} 题`;
  if (interview.status === 'abandoned' || interview.status === 'failed') {
    if (answered > 0) return `已作答 ${answered} 题`;
    return issued > 0 ? `已出 ${issued} 题，未作答` : '尚未出题';
  }
  if (interview.processing_turn != null) return `第 ${interview.processing_turn + 1} 题处理中`;
  if (interview.current_turn != null) return `第 ${interview.current_turn + 1} 题待答`;
  if (answered > 0) return `已作答 ${answered} 题`;
  return '尚未出题';
}

export function interviewActionLabel(status: string): string {
  if (status === 'completed') return '查看报告 →';
  if (status === 'abandoned' || status === 'failed') return '已结束';
  return '继续作答 →';
}

export function interviewDisplayStatus(interview: InterviewProgress): string {
  if (!['completed', 'abandoned', 'failed'].includes(interview.status)
    && ((interview.issued_turns ?? 0) > 0 || interview.current_turn != null || interview.processing_turn != null)) return 'active';
  return interview.status;
}
