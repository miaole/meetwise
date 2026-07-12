/**
 * 面试视图状态归约：业务事件序列 → 前端视图态。纯函数（可单测,无 React）。
 * 不变量(无静默死胡同):任何情形都有出路——report_unavailable→degraded;流断在非终态→reconnecting(自动重连+显式"重连中");
 * 重连耗尽→degraded/error。绝不停在干等无出口的转圈。状态真相在服务端 checkpoint,断线用同一 resultId + Last-Event-ID 续。
 */
import type { BusinessEvent } from './business-events';

// 单一真相:所有 phase 列在此,类型从它派生(防止"加了 phase 但测试/类型漏掉"——见 web:prove 遍历 ALL_PHASES)。
export const ALL_PHASES = ['connecting', 'question', 'waiting_user', 'answered', 'report_ready', 'report_unavailable', 'interview_unavailable', 'error'] as const;
export type InterviewPhase = typeof ALL_PHASES[number];

/** 连接态：live 在线 / reconnecting 断后自动重连中(给用户"重连中"反馈,非干等) / closed 正常结束。 */
export type ConnectionState = 'live' | 'reconnecting' | 'closed';

/** 一轮对话:题(+所探能力)+ 答完的分。followUp=与上一题同能力(=追问 probe),否则换题(pivot)。
 *  skipped=该题被跳过/探尽未决(非作答)——**不是得 0 分**,前端按"未作答/已跳过"渲染,不展示惩罚分(对齐"跳过不罚"承诺)。 */
export interface InterviewTurn { q: string; competency?: string; score?: number; followUp: boolean; skipped?: boolean }

export interface InterviewView {
  phase: InterviewPhase;
  question?: string;
  competency?: string;          // 当前题所探能力
  lastScore?: number;
  report?: { overall: number };
  /** 对话历史:逐题(题+能力+分),供面板渲染会话流 + 追问标记。 */
  turns: InterviewTurn[];
  /** 引导态(非终态):回答没正面回应本题 → 展示引导 + 可重答/跳过。收到下一个 question_ready/answer_evaluated 即清(自动消解,无死胡同)。 */
  guidance?: { hint: string; question: string; competency?: string };
  /** 报告不可用(被隔离)或重连耗尽 → true：前端显示"暂不可用,可重试/联系支持",而不是永远等。 */
  degraded: boolean;
  connection: ConnectionState;
  /** 已消费的最大事件 id → 断线重连用 Last-Event-ID,不丢不重。 */
  lastEventId: number;
}

export const initialView: InterviewView = { phase: 'connecting', degraded: false, connection: 'live', lastEventId: 0, turns: [] };

/** 终态：不需要再等任何事件（报告好/报告不可用/出错）。 */
export const TERMINAL_PHASES: InterviewPhase[] = ['report_ready', 'report_unavailable', 'interview_unavailable', 'error'];
export const isTerminal = (p: InterviewPhase): boolean => TERMINAL_PHASES.includes(p);

export function applyEvent(v: InterviewView, e: BusinessEvent): InterviewView {
  const next: InterviewView = { ...v, lastEventId: Math.max(v.lastEventId, e.id), connection: 'live' };
  switch (e.event) {
    case 'question_ready': {
      const competency = (e.data as any).competency as string | undefined;
      const prev = next.turns[next.turns.length - 1];
      const followUp = !!competency && competency === prev?.competency;   // 同能力=追问(probe)
      next.phase = 'question'; next.question = e.data.question; next.competency = competency;
      next.turns = [...next.turns, { q: e.data.question, competency, followUp }];
      next.guidance = undefined;                                     // 新题 → 清引导(已消解)
      break;
    }
    case 'clarification_needed': {
      // **非作答/答非所问**:不当弱答、不进 answered,回到可作答态 + 挂引导(同一题,不新增 turn)。前端据 guidance 显示引导 + 重答/跳过。
      const competency = (e.data as any).competency as string | undefined;
      next.phase = 'question'; next.question = e.data.question; next.competency = competency ?? next.competency;
      next.guidance = { hint: e.data.hint, question: e.data.question, competency };
      break;
    }
    case 'waiting_user': next.phase = 'waiting_user'; break;
    case 'answer_evaluated': {
      next.phase = 'answered'; next.guidance = undefined;   // 已评完=settled,清引导,非"评估中"转圈
      const skipped = (e.data as { outcome?: string }).outcome === 'unresolved';   // 跳过/探尽未决:不当"得0分"
      const i = [...next.turns].reverse().findIndex((t) => t.score === undefined && !t.skipped);
      const idx = i >= 0 ? next.turns.length - 1 - i : -1;
      if (skipped) {
        next.lastScore = undefined;   // 不展示惩罚性分数(对齐"跳过不罚",报告侧亦剔除)
        if (idx >= 0) next.turns = next.turns.map((t, k) => k === idx ? { ...t, skipped: true } : t);
      } else {
        next.lastScore = e.data.score; // settled,显示分数
        if (idx >= 0) next.turns = next.turns.map((t, k) => k === idx ? { ...t, score: e.data.score } : t);
      }
      break;
    }
    case 'report_ready': next.phase = 'report_ready'; next.report = { overall: e.data.overall }; break;
    case 'report_unavailable': next.phase = 'report_unavailable'; next.degraded = true; break; // 优雅降级
    case 'interview_unavailable': next.phase = 'interview_unavailable'; next.degraded = true; break; // 面试 job 失败终态 → 降级,不死等
    case 'error': next.phase = 'error'; break;
    case 'progress': break;                                  // 仅进度,不改阶段
  }
  return next;
}

export function reduceInterview(events: BusinessEvent[], init: InterviewView = initialView): InterviewView {
  return events.reduce(applyEvent, init);
}

/** 流关闭：非终态 → reconnecting(组件据此用同一 resultId+Last-Event-ID 自动重连,显示"重连中");终态 → closed(正常)。 */
export function onStreamClosed(v: InterviewView): InterviewView {
  return { ...v, connection: isTerminal(v.phase) ? 'closed' : 'reconnecting' };
}

/** 重连耗尽(超过上限仍连不上）→ 给出口:degraded + 停止重连;若还卡在 connecting(从没拿到状态)则置 error。 */
export function onReconnectExhausted(v: InterviewView): InterviewView {
  return { ...v, connection: 'closed', degraded: true, phase: v.phase === 'connecting' ? 'error' : v.phase };
}
