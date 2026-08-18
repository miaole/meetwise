/**
 * 面试视图模型（纯逻辑:InterviewView → 该显示什么）。把"每个状态显示什么、有什么操作"从 React 渲染里抽出来,
 * 这样**承重的 UX-HA 属性(任何状态都不死胡同、不无限转圈、永远有出路)可确定性 gate**,React 组件只是薄渲染器。
 */
import type { InterviewView } from './stream/interview-state';

export type ActionKind = 'answer' | 'retry' | 'view_report' | 'view_applications' | 'reconnecting' | 'none';
export interface Display {
  heading: string;
  message: string;
  /** 仅"服务端在推进、有明确进展预期"时转圈;degraded/终态/等用户/重连 都不是无出路的无限 spinner。 */
  spinner: boolean;
  action: { kind: ActionKind; label: string };
  report?: { overall: number };
  degraded: boolean;
}

export function interviewDisplay(v: InterviewView): Display {
  // 连接中断重连 → 永远显式告知"重连中"+可手动重试,绝不冻结
  if (v.connection === 'reconnecting') {
    return { heading: '网络中断', message: '正在用同一面试重连,已答内容不会丢失…', spinner: true, action: { kind: 'retry', label: '手动重试' }, degraded: v.degraded };
  }
  switch (v.phase) {
    case 'connecting':
      return { heading: '连接面试', message: '正在建立连接…', spinner: true, action: { kind: 'reconnecting', label: '取消' }, degraded: false };
    case 'question':
      // 引导态(回答没正面回应):显式提示 + 可重答/跳过(非死胡同),否则正常出题。
      return v.guidance
        ? { heading: '换个角度回答', message: v.guidance.hint, spinner: false, action: { kind: 'answer', label: '重新作答 / 回复「跳过」' }, degraded: false }
        : { heading: '面试进行中', message: v.question ?? '', spinner: false, action: { kind: 'answer', label: '作答(打字/语音)' }, degraded: false };
    case 'waiting_user':
      return { heading: '请作答', message: v.question ?? '请回答上一题', spinner: false, action: { kind: 'answer', label: '作答(打字/语音)' }, degraded: false };
    case 'answered':
      return { heading: '已作答', message: `本题得分 ${v.lastScore ?? '—'},正在出下一题…`, spinner: true, action: { kind: 'none', label: '' }, degraded: false };
    case 'report_ready':
      return { heading: '练习报告', message: `本次练习反馈 ${v.report?.overall ?? '—'}（仅供个人复盘）`, spinner: false, action: { kind: 'view_report', label: '查看完整报告' }, report: v.report, degraded: false };
    case 'report_unavailable':
      // 优雅降级:报告暂不可用 → 给出路(重试/联系),**绝不无限等 report_ready**
      return { heading: '报告暂不可用', message: '面试已完成,但报告暂时无法生成。可稍后重试或联系支持。', spinner: false, action: { kind: 'retry', label: '重试生成报告' }, degraded: true };
    case 'assessment_unavailable':
      return { heading: '本次评分暂不可用', message: '没有得到足够可信的评分证据，本次预留额度已释放。岗位面试可从“我的投递”重新开始；其他面试可新建一场。', spinner: false, action: { kind: 'view_applications', label: '前往我的投递' }, degraded: true };
    case 'interview_unavailable':
      return { heading: '面试暂不可用', message: '面试启动/处理遇到问题,已停止。可重试或联系支持——不会让你干等。', spinner: false, action: { kind: 'retry', label: '重新开始面试' }, degraded: true };
    case 'error':
      return { heading: '出错了', message: '面试遇到问题。你的进度已保存,可重试。', spinner: false, action: { kind: 'retry', label: '重试' }, degraded: true };
  }
}

/** 不变量:**没有任何状态是"转圈且无内容无操作"的死胡同**——要么有可读内容,要么有可点操作(spinner 也必有取消/重试出口)。 */
export function isDeadEnd(d: Display): boolean {
  const hasContent = d.message.trim().length > 0;
  const hasAction = d.action.kind !== 'none';
  return d.spinner && !hasContent && !hasAction;   // 无限转圈且既无内容又无操作 = 死胡同
}
