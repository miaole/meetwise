/**
 * 面试视图状态归约：业务事件序列 → 前端视图态。纯函数（可单测,无 React）。
 * 不变量(无静默死胡同):任何情形都有出路——report_unavailable→degraded;流断在非终态→reconnecting(自动重连+显式"重连中");
 * 重连耗尽或 HTTP 400 非法 Last-Event-ID→degraded/error（不得用同一游标重试）。绝不停在干等无出口的转圈。状态真相在服务端 checkpoint,断线用同一 resultId + Last-Event-ID 续。
 */
import type { InterviewSignalConcludeReason } from '@meetwise/contracts';
import type { BusinessEvent, QuestionKind } from './business-events';
import type { QuestionIdentity } from '../interview/turn-submission';
import { practiceHintScore } from './scoring-honesty';
import { applyGenerationProgress, type GenerationProgressView } from './generation-progress';

// 单一真相:所有 phase 列在此,类型从它派生(防止"加了 phase 但测试/类型漏掉"——见 web:prove 遍历 ALL_PHASES)。
export const ALL_PHASES = ['connecting', 'question', 'waiting_user', 'answered', 'report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable', 'error'] as const;
export type InterviewPhase = typeof ALL_PHASES[number];

/** 连接态：live 在线 / reconnecting 断后自动重连中(给用户"重连中"反馈,非干等) / closed 正常结束。 */
export type ConnectionState = 'live' | 'reconnecting' | 'closed';

/**
 * SSE-RESILIENCE #56(C5)：停转/降级原因分类（驱动按打开状态码与游标错误承载）。
 * auth=401 会话过期 · rate_limited=429 多标签 · server=5xx 服务端 · not_found=404 fail-closed · cursor=400 非法游标。
 */
export type StreamStopReason = 'auth' | 'rate_limited' | 'server' | 'not_found' | 'cursor';

/** 一轮对话:题(+所探能力)+ 答完的分。followUp=与上一题同能力(=追问 probe),否则换题(pivot)。
 *  skipped=该题被跳过/探尽未决(非作答)——**不是得 0 分**,前端按"未作答/已跳过"渲染,不展示惩罚分(对齐"跳过不罚"承诺)。 */
export interface InterviewTurn {
  q: string; competency?: string; score?: number; followUp: boolean; skipped?: boolean;
  questionIdentity?: QuestionIdentity;
  qkind?: QuestionKind;
}

export interface InterviewView {
  phase: InterviewPhase;
  question?: string;
  competency?: string;          // 当前题所探能力
  /** 仅由最新 question_ready 发放；缺失时 UI 不得提交旧 turn body。 */
  questionIdentity?: QuestionIdentity;
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
  /**
   * INT-LEVEL-SIGNAL-SSE-01 练习控制流收尾理由。只来自 session_concluded，不是分数、不是 phase、不是终态。
   */
  signalConcludeReason?: InterviewSignalConcludeReason;
  /** assessment_unavailable 事件的 reason 原样承载（'evaluation_unscored' | 'no_eligible_scored_answer' | 未知值）：
   *  同一 kind 两种钱面（释放补偿 vs 已扣费），view-model 按 reason 分臂渲染，未知值 fail-closed 中性、不冒认资金变动。 */
  assessmentUnavailableReason?: string;
  /** TOKSTREAM 阶段1 生成进度态：非权威、非终态；幂等覆盖写（同 attempt 取 max）；任何业务事件到达即清
   *  （断线重放防"已完成题重新显示生成中"）。进度帧不改 phase/不触发 degraded——缺帧回段级兜底,不死等。 */
  generationProgress?: GenerationProgressView;
  /** SSE-RESILIENCE #56(C5)：本次停转/降级/慢速重试的原因分类（401/429/5xx/404/400 游标）。
   *  缺省=普通传输断线（不透出状态码臂）。view-model 按它分臂透出真实原因，不止"网络中断"一句话。 */
  streamStopReason?: StreamStopReason;
  /** SSE-RESILIENCE #55(注记C)：reconnecting 来自**无错干净 end**（服务器 10min 轮换/正常收尾）——
   *  文案分臂给软措辞（"切换连接"而非"网络中断"）。只在 reconnecting 臂被消费。 */
  cleanEndReconnect?: boolean;
}

export const initialView: InterviewView = { phase: 'connecting', degraded: false, connection: 'live', lastEventId: 0, turns: [] };

/** 终态：不需要再等任何事件（报告好/报告不可用/出错）。 */
export const TERMINAL_PHASES: InterviewPhase[] = ['report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable', 'error'];
export const isTerminal = (p: InterviewPhase): boolean => TERMINAL_PHASES.includes(p);

/**
 * Apply one network batch with one copy of the turn array. The previous implementation copied `turns` for every
 * `question_ready`; a 10k replay in one SSE chunk was therefore O(n²) CPU/allocation even though React commits
 * were frame-coalesced. `runInterviewStream` calls this for each decoded chunk and publishes once afterwards.
 */
export function applyEvents(v: InterviewView, events: readonly BusinessEvent[]): InterviewView {
  if (!events.length) return v;
  const turns = [...v.turns];
  const next: InterviewView = { ...v, turns, connection: 'live' };
  for (const e of events) {
    next.lastEventId = Math.max(next.lastEventId, e.id);
    // TOKSTREAM:业务事件(非进度家族)到达即清进度态——权威事件推进了流程,重放的旧进度不得把已完成段重新显示"生成中"。
    if (e.event !== 'generation_started' && e.event !== 'model_first_token' && e.event !== 'generation_progress') {
      next.generationProgress = undefined;
    }
    switch (e.event) {
    case 'question_ready': {
      const competency = (e.data as any).competency as string | undefined;
      const candidate = e.data as { questionId?: string; stateVersion?: number; turn?: number; qkind?: InterviewTurn['qkind'] };
      const questionIdentity = candidate.questionId !== undefined && candidate.stateVersion !== undefined && candidate.turn !== undefined
        ? { questionId: candidate.questionId, stateVersion: candidate.stateVersion, turn: candidate.turn }
        : undefined;
      const prev = turns[turns.length - 1];
      const followUp = !!competency && competency === prev?.competency;   // 同能力=追问(probe)
      next.phase = 'question'; next.question = e.data.question; next.competency = competency; next.questionIdentity = questionIdentity;
      turns.push({ q: e.data.question, competency, followUp, questionIdentity, qkind: candidate.qkind });
      next.guidance = undefined;                                     // 新题 → 清引导(已消解)
      break;
    }
    case 'clarification_needed': {
      // **非作答/答非所问**:不当弱答、不进 answered,回到可作答态 + 挂引导。
      // 后端为下一次作答发放了新 identity；绝不能沿用已经 consumed 的旧 identity，
      // 否则浏览器会稳定得到 stale_question。历史 turn 不新增，当前可提交令牌必须更新。
      const competency = (e.data as any).competency as string | undefined;
      const candidate = e.data as { questionId?: string; stateVersion?: number; turn?: number };
      const questionIdentity = candidate.questionId !== undefined && candidate.stateVersion !== undefined && candidate.turn !== undefined
        ? { questionId: candidate.questionId, stateVersion: candidate.stateVersion, turn: candidate.turn }
        : undefined;
      next.phase = 'question'; next.question = e.data.question; next.competency = competency ?? next.competency;
      next.questionIdentity = questionIdentity;
      next.guidance = { hint: e.data.hint, question: e.data.question, competency };
      break;
    }
    case 'waiting_user': next.phase = 'waiting_user'; break;
    case 'answer_evaluated': {
      next.phase = 'answered'; next.guidance = undefined;   // 已评完=settled,清引导,非"评估中"转圈
      const skipped = (e.data as { outcome?: string }).outcome === 'unresolved';   // 跳过/探尽未决:不当"得0分"
      let idx = -1;
      for (let i = turns.length - 1; i >= 0; i--) {
        if (turns[i].score === undefined && !turns[i].skipped) { idx = i; break; }
      }
      if (skipped) {
        next.lastScore = undefined;   // 不展示惩罚性分数(对齐"跳过不罚",报告侧亦剔除)
        if (idx >= 0) turns[idx] = { ...turns[idx], skipped: true };
      } else {
        const issued = idx >= 0 ? turns[idx].questionIdentity : next.questionIdentity;
        const hint = practiceHintScore(e.data, issued);
        next.lastScore = hint;
        if (idx >= 0 && hint !== undefined) turns[idx] = { ...turns[idx], score: hint };
      }
      break;
    }
    case 'report_ready': {
      next.phase = 'report_ready';
      const overall = e.data.overall;
      next.report = (typeof overall === 'number' && Number.isInteger(overall) && overall >= 0 && overall <= 100)
        ? { overall }
        : undefined;
      break;
    }
    case 'report_unavailable': next.phase = 'report_unavailable'; next.degraded = true; break; // 优雅降级
    case 'assessment_unavailable': next.phase = 'assessment_unavailable'; next.degraded = true; next.assessmentUnavailableReason = e.data.reason; break; // 无可信评分：文案按 reason 分臂（evaluation_unscored=已释放补偿 / no_eligible_scored_answer=已扣费且本次不生成报告）——「已释放」字样只在释放臂为真
    case 'interview_unavailable': next.phase = 'interview_unavailable'; next.degraded = true; break; // 面试 job 失败终态 → 降级,不死等
    case 'error': next.phase = 'error'; break;
    case 'progress': break;                                  // 仅进度,不改阶段
    // TOKSTREAM 阶段1:生成进度帧只更新进度态(幂等覆盖写),绝不改 phase/lastScore/report(不发明分也不挪阶段)。
    case 'generation_started':
    case 'model_first_token':
    case 'generation_progress':
      next.generationProgress = applyGenerationProgress(next.generationProgress, e);
      break;
    case 'session_concluded': {
      // 非终态：只记控制流理由。不得改 phase / lastScore / report（不发明分）。
      next.signalConcludeReason = e.data.concludeReason;
      break;
    }
    }
  }
  return next;
}

/** Kept as the single-event public seam for callers/tests; stream code should prefer `applyEvents`. */
export function applyEvent(v: InterviewView, e: BusinessEvent): InterviewView {
  return applyEvents(v, [e]);
}

export function reduceInterview(events: BusinessEvent[], init: InterviewView = initialView): InterviewView {
  return applyEvents(init, events);
}

/** 流关闭：非终态 → reconnecting(组件据此用同一 resultId+Last-Event-ID 自动重连,显示"重连中");终态 → closed(正常)。
 *  SSE-RESILIENCE(C5)：flags.stopReason 按打开状态码承载原因；flags.cleanEnd 标记"无错干净 end"轮换闪回（注记C 软措辞臂）；
 *  两旗缺省时**清除**陈旧旗（普通断线不得残留上一场连接的原因）。 */
export function onStreamClosed(v: InterviewView, flags?: { stopReason?: StreamStopReason; cleanEnd?: boolean }): InterviewView {
  const base = { ...v, connection: isTerminal(v.phase) ? 'closed' as const : 'reconnecting' as const };
  if (flags?.stopReason) return { ...base, streamStopReason: flags.stopReason, cleanEndReconnect: undefined };
  if (flags?.cleanEnd) return { ...base, cleanEndReconnect: true, streamStopReason: undefined };
  return { ...base, streamStopReason: undefined, cleanEndReconnect: undefined };
}

/** 重连耗尽(超过上限仍连不上）→ 给出口:degraded + 停止重连;若还卡在 connecting(从没拿到状态)则置 error。
 *  SSE-RESILIENCE(C5)：reason 可选承载停转原因（400 游标='cursor'、401='auth'、404='not_found'、绝对上限=缺省）。
 *  #53 W1②：连续无进展耗尽不再走此出口（驱动转慢速永续），degraded 只留给绝对上限/游标/致命状态码。 */
export function onReconnectExhausted(v: InterviewView, reason?: StreamStopReason): InterviewView {
  return { ...v, connection: 'closed', degraded: true, phase: v.phase === 'connecting' ? 'error' : v.phase, streamStopReason: reason };
}
