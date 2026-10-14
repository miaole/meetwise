/**
 * 面试视图模型（纯逻辑:InterviewView → 该显示什么）。把"每个状态显示什么、有什么操作"从 React 渲染里抽出来,
 * 这样**承重的 UX-HA 属性(任何状态都不死胡同、不无限转圈、永远有出路)可确定性 gate**,React 组件只是薄渲染器。
 */
import type { InterviewSignalConcludeReason } from '@meetwise/contracts';
import { isTerminal, type InterviewView } from './stream/interview-state';
import { generationProgressLabel } from './stream/generation-progress';
import zhMessages from '../messages/zh.json';

// Copy labels: callers may pass a next-intl bound lookup; the default bundle reads the zh
// catalog verbatim, so the zh output stays byte-identical to the previous in-file literals.
export type CopyLabels = (key: string) => string;

const INTERVIEW_COPY_ZH = zhMessages.interview as unknown as Record<string, string>;

const defaultInterviewLabels: CopyLabels = (key) => INTERVIEW_COPY_ZH[key] ?? key;

export function signalConcludePracticeCopy(code: InterviewSignalConcludeReason['code'], labels: CopyLabels = defaultInterviewLabels): string {
  if (code === 'early_weak') {
    return labels('concludeEarlyWeak');
  }
  return labels('concludeSpin');
}

export type ActionKind = 'answer' | 'retry' | 'view_report' | 'view_applications' | 'reconnecting' | 'none';
export interface Display {
  heading: string;
  message: string;
  /** 仅"服务端在推进、有明确进展预期"时转圈;degraded/终态/等用户/重连 都不是无出路的无限 spinner。 */
  spinner: boolean;
  action: { kind: ActionKind; label: string };
  report?: { overall: number };
  degraded: boolean;
  /** 练习控制流说明；有也不改 report.overall / 不当 lastScore。 */
  signalConclude?: { code: InterviewSignalConcludeReason['code']; message: string };
}

export function interviewDisplay(v: InterviewView, labels: CopyLabels = defaultInterviewLabels): Display {
  const signalConclude = v.signalConcludeReason
    ? { code: v.signalConcludeReason.code, message: signalConcludePracticeCopy(v.signalConcludeReason.code, labels) }
    : undefined;
  // 连接中断重连 → 永远显式告知"重连中"+可手动重试,绝不冻结。
  // SSE-RESILIENCE #56(C5)：reconnecting 按 reason 分臂透出真实原因（429 多标签/5xx 服务端）;
  // 注记C：无错干净 end（服务器 10min 轮换）给软措辞——不是断网,是换一条连接无缝续传。
  if (v.connection === 'reconnecting') {
    if (v.streamStopReason === 'rate_limited') {
      return { heading: labels('rlHeading'), message: labels('rlMessage'), spinner: true, action: { kind: 'retry', label: labels('retryManual') }, degraded: v.degraded, signalConclude };
    }
    if (v.streamStopReason === 'server') {
      return { heading: labels('svHeading'), message: labels('svMessage'), spinner: true, action: { kind: 'retry', label: labels('retryManual') }, degraded: v.degraded, signalConclude };
    }
    if (v.cleanEndReconnect) {
      return { heading: labels('ceHeading'), message: labels('ceMessage'), spinner: true, action: { kind: 'retry', label: labels('retryManual') }, degraded: v.degraded, signalConclude };
    }
    return { heading: labels('dfHeading'), message: labels('dfMessage'), spinner: true, action: { kind: 'retry', label: labels('retryManual') }, degraded: v.degraded, signalConclude };
  }
  // 非法 Last-Event-ID / 重连耗尽 / 401 / 404：连接已关且非终态 → 失败关闭出口，不当成仍可作答。
  // SSE-RESILIENCE #56(C5)：按 reason 分臂（auth 引导重新登录/not_found fail-closed/server 暂停重连）;
  // 游标与绝对上限（缺省）保持原文案逐字（既有断言锚定）。
  // F6/#243 围栏出口（同一句话）：SSE 410 interview_privacy_fenced → 驱动停转不重连 → 复用 degraded
  // 出口形（heading/action/degraded 同形，:40 家族），message=「该面试已进入数据删除流程，请新建面试」逐字。
  if (v.privacyFenced && v.connection === 'closed') {
    return {
      heading: labels('fencedHeading'),
      message: labels('fencedMessage'),
      spinner: false, action: { kind: 'retry', label: labels('retry') }, degraded: true, signalConclude,
    };
  }
  if (v.degraded && v.connection === 'closed' && !isTerminal(v.phase)) {
    if (v.streamStopReason === 'auth') {
      return {
        heading: labels('authHeading'),
        message: labels('authMessage'),
        spinner: false, action: { kind: 'retry', label: labels('relogin') }, degraded: true, signalConclude,
      };
    }
    if (v.streamStopReason === 'not_found') {
      return {
        heading: labels('nfHeading'),
        message: labels('nfMessage'),
        spinner: false, action: { kind: 'retry', label: labels('retry') }, degraded: true, signalConclude,
      };
    }
    if (v.streamStopReason === 'server') {
      return {
        heading: labels('stopHeading'),
        message: labels('stopMessage'),
        spinner: false, action: { kind: 'retry', label: labels('retry') }, degraded: true, signalConclude,
      };
    }
    return {
      heading: labels('closedHeading'),
      message: labels('closedMessage'),
      spinner: false, action: { kind: 'retry', label: labels('retry') }, degraded: true, signalConclude,
    };
  }
  switch (v.phase) {
    case 'connecting': {
      // #161:connecting 期进度帧已到达（进度帧不改 phase=红线，generation-progress.ts:3-5）→ 静态文案拼真实进度
      //（沿 answered 臂 generationProgressLabel 同形：段名/时长/token 计数，R-B 零思考原文）;
      // 缺帧/未到首帧 → 既有静态文案逐字兜底（不空转不编造）。message 恒非空=isDeadEnd 不变量零破坏。
      const progress = generationProgressLabel(v.generationProgress);
      return { heading: '连接面试', message: progress ? `正在建立连接…（${progress}）` : '正在建立连接…', spinner: true, action: { kind: 'reconnecting', label: '取消' }, degraded: false, signalConclude };
    }
    case 'question':
      // 引导态(回答没正面回应):显式提示 + 可重答/跳过(非死胡同),否则正常出题。
      return v.guidance
        ? { heading: labels('guidanceHeading'), message: v.guidance.hint, spinner: false, action: { kind: 'answer', label: labels('guidanceAction') }, degraded: false, signalConclude }
        : { heading: labels('questionHeading'), message: v.question ?? '', spinner: false, action: { kind: 'answer', label: labels('answerAction') }, degraded: false, signalConclude };
    case 'waiting_user':
      return { heading: labels('waitingHeading'), message: v.question ?? labels('waitingFallback'), spinner: false, action: { kind: 'answer', label: labels('answerAction') }, degraded: false, signalConclude };
    case 'answered': {
      // TOKSTREAM 阶段1:题间/报告期等待有进度态时 loading 变真实进度(段名+时长/token 计数;R-B 无思考原文);
      // 无进度帧(断线跳过/未到首帧)回既有文案——缺帧兜底,不死等。
      const progress = generationProgressLabel(v.generationProgress);
      const base = v.signalConcludeReason
        ? labels('concludingMessage')
        : `本题得分 ${v.lastScore ?? '—'},正在出下一题…`;
      return {
        heading: labels('answeredHeading'),
        message: progress ? `${base}（${progress}）` : base,
        spinner: true, action: { kind: 'none', label: '' }, degraded: false, signalConclude,
      };
    }
    case 'report_ready':
      return { heading: '练习报告', message: `本次练习反馈 ${v.report?.overall ?? '—'}（仅供个人复盘）`, spinner: false, action: { kind: 'view_report', label: '查看完整报告' }, report: v.report, degraded: false, signalConclude };
    case 'report_unavailable':
      // 优雅降级:报告暂不可用 → 给出路(重试/联系),**绝不无限等 report_ready**
      return { heading: labels('reportUnavailableHeading'), message: labels('reportUnavailableMessage'), spinner: false, action: { kind: 'retry', label: labels('retryReport') }, degraded: true, signalConclude };
    case 'assessment_unavailable':
      // 同一 kind 两种钱面（adaptive-lifecycle 分派），文案按 reason 分臂、绝不谎报资金变动（GAP-G7V-THIRDARM-COPY-SETTLEMENT）：
      if (v.assessmentUnavailableReason === 'no_eligible_scored_answer') {
        // 第三臂：已 completeInterviewAndConfirm 扣费结算，且 bound 路径不生成报告（enqueueReport 仅 unbound 可达）——「本次不生成报告」如实，Ban 释放字样。
        return { heading: labels('assessHeading'), message: labels('assessSettledMessage'), spinner: false, action: { kind: 'view_applications', label: labels('toApplications') }, degraded: true, signalConclude };
      }
      if (v.assessmentUnavailableReason === 'evaluation_unscored') {
        // 释放臂：failInterviewAndRelease 补偿释放——「额度已释放」此时为真，文案逐字保留。
        return { heading: labels('assessHeading'), message: labels('assessReleasedMessage'), spinner: false, action: { kind: 'view_applications', label: labels('toApplications') }, degraded: true, signalConclude };
      }
      // 未知/缺失 reason：fail-closed 中性——既不称释放也不称扣费，不冒认任何资金变动。
      return { heading: labels('assessHeading'), message: labels('assessUnknownMessage'), spinner: false, action: { kind: 'view_applications', label: labels('toApplications') }, degraded: true, signalConclude };
    case 'interview_unavailable':
      return { heading: labels('unavailableHeading'), message: labels('unavailableMessage'), spinner: false, action: { kind: 'retry', label: labels('restartInterview') }, degraded: true, signalConclude };
    case 'error':
      return { heading: labels('errorHeading'), message: labels('errorMessage'), spinner: false, action: { kind: 'retry', label: labels('retry') }, degraded: true, signalConclude };
  }
}

/** 不变量:**没有任何状态是"转圈且无内容无操作"的死胡同**——要么有可读内容,要么有可点操作(spinner 也必有取消/重试出口)。 */
export function isDeadEnd(d: Display): boolean {
  const hasContent = d.message.trim().length > 0;
  const hasAction = d.action.kind !== 'none';
  return d.spinner && !hasContent && !hasAction;   // 无限转圈且既无内容又无操作 = 死胡同
}
