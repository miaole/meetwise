/**
 * 押题视图状态归约：业务事件序列 → 前端视图态。纯函数(可单测,无 React)。
 * 与 interview-state 同构,但押题更简(无 turns/answers):progress/question_ready(多)/quiz_ready(终)/quiz_unavailable(终降级)。
 * 不变量(无静默死胡同):任何情形都有出路——quiz_unavailable→degraded+重试;流断在非终态→reconnecting;重连耗尽→degraded/error。
 */
import { z } from 'zod';
import { applyGenerationProgress, generationProgressLabel, type GenerationProgressView } from './generation-progress';

/** 押题业务事件判别联合(event = SSE event 字段 = 后端 interview_event.kind,stream_key=quizId)。 */
export const QuizEvent = z.discriminatedUnion('event', [
  z.object({ event: z.literal('progress'), id: z.number().int(), data: z.record(z.string(), z.unknown()) }),
  // TOKSTREAM 阶段1 生成进度事件(D-2 新 kind;形状与 interview 流同构;.loose() 容阶段2 演进字段)。
  z.object({ event: z.literal('generation_started'), id: z.number().int(), data: z.object({
    attemptKey: z.string(), jobKind: z.string().optional(), operationId: z.string().optional(),
    segments: z.array(z.string()).optional(), startedAt: z.string().optional(),
  }).loose() }),
  z.object({ event: z.literal('model_first_token'), id: z.number().int(), data: z.object({
    attemptKey: z.string(), firstTokenMs: z.number().optional(), tokensSoFar: z.number().optional(),
  }).loose() }),
  z.object({ event: z.literal('generation_progress'), id: z.number().int(), data: z.object({
    attemptKey: z.string(), stage: z.string().optional(), tokensSoFar: z.number().optional(), elapsedMs: z.number().optional(),
  }).loose() }),
  z.object({ event: z.literal('question_ready'), id: z.number().int(), data: z.object({ question: z.string(), refs: z.array(z.string()).optional() }) }),
  // 专家审计:report 是装饰性的,绝不能因其字段漂移让**唯一成功终态**被 safeParse 丢弃 → 成功被误判成"出错"。
  // 故 data 用 .loose() + report 留 unknown,接地在 reducer 里防御性读取(字段不对就忽略 report,但终态照样到达 ready)。
  z.object({ event: z.literal('quiz_ready'), id: z.number().int(), data: z.object({ count: z.number().optional(), report: z.unknown().optional() }).loose() }),
  // 终态降级事件:押题生成失败 → 前端退出等待态、显示"押题暂不可用",绝不无限转圈
  z.object({ event: z.literal('quiz_unavailable'), id: z.number().int(), data: z.object({ reason: z.string() }).loose() }),
  z.object({ event: z.literal('error'), id: z.number().int(), data: z.record(z.string(), z.unknown()) }),
]);
export type QuizEvent = z.infer<typeof QuizEvent>;

export const ALL_QUIZ_PHASES = ['connecting', 'generating', 'ready', 'quiz_unavailable', 'error'] as const;
export type QuizPhase = typeof ALL_QUIZ_PHASES[number];
export type ConnectionState = 'live' | 'reconnecting' | 'closed';

export interface QuizQuestion { q: string; refs: string[] }
export interface QuizViewState {
  phase: QuizPhase;
  questions: QuizQuestion[];
  report?: { score: number; grounded: number; summary: string };
  /** quiz_ready 携带的题数(权威):用于区分"真 0 题"与"题目事件未重放",避免误显示"未提取到题目"。 */
  total?: number;
  degraded: boolean;
  connection: ConnectionState;
  lastEventId: number;
  /** TOKSTREAM 阶段1 生成进度态(非权威;幂等覆盖写;业务事件到达即清;缺帧回段级兜底不死等)。 */
  generationProgress?: GenerationProgressView;
}

export const initialQuizView: QuizViewState = { phase: 'connecting', questions: [], degraded: false, connection: 'live', lastEventId: 0 };

export const TERMINAL_QUIZ_PHASES: QuizPhase[] = ['ready', 'quiz_unavailable', 'error'];
export const isQuizTerminal = (p: QuizPhase): boolean => TERMINAL_QUIZ_PHASES.includes(p);

export function applyQuizEvent(v: QuizViewState, e: QuizEvent): QuizViewState {
  const next: QuizViewState = { ...v, lastEventId: Math.max(v.lastEventId, e.id), connection: 'live' };
  // TOKSTREAM:业务事件(非进度家族)到达即清进度态(与 interview 流同构;防重放旧进度复活已完成段)。
  if (e.event !== 'generation_started' && e.event !== 'model_first_token' && e.event !== 'generation_progress') {
    next.generationProgress = undefined;
  }
  switch (e.event) {
    case 'progress': next.phase = 'generating'; break;
    // TOKSTREAM 阶段1:进度帧只更新进度态;started 同时把 phase 置 generating(与既有 progress kind 同语义:
    // 生成确实在跑;不改终态语义——quiz_ready/quiz_unavailable 仍唯一收口)。
    case 'generation_started':
      next.phase = 'generating';
      next.generationProgress = applyGenerationProgress(next.generationProgress, e);
      break;
    case 'model_first_token':
    case 'generation_progress':
      next.generationProgress = applyGenerationProgress(next.generationProgress, e);
      break;
    case 'question_ready':
      next.phase = 'generating';
      next.questions = [...next.questions, { q: e.data.question, refs: e.data.refs ?? [] }];
      break;
    case 'quiz_ready': {
      next.phase = 'ready';
      if (typeof e.data.count === 'number') next.total = e.data.count;
      const r = e.data.report as { score?: unknown; grounded?: unknown; summary?: unknown } | null | undefined;
      if (r && typeof r.score === 'number' && typeof r.grounded === 'number')   // 防御性读取:字段不对就忽略 report,终态照达
        next.report = { score: r.score, grounded: r.grounded, summary: String(r.summary ?? '') };
      break;
    }
    case 'quiz_unavailable': next.phase = 'quiz_unavailable'; next.degraded = true; break;  // 优雅降级
    case 'error': next.phase = 'error'; break;
  }
  return next;
}

/** 流关闭：非终态 → reconnecting(组件据此用同一 quizId+Last-Event-ID 自动重连);终态 → closed(正常)。 */
export function onQuizStreamClosed(v: QuizViewState): QuizViewState {
  return { ...v, connection: isQuizTerminal(v.phase) ? 'closed' : 'reconnecting' };
}
/** 重连耗尽 → 给出口:degraded + 停止重连;若还卡在 connecting(从没拿到状态)则置 error。 */
export function onQuizReconnectExhausted(v: QuizViewState): QuizViewState {
  return { ...v, connection: 'closed', degraded: true, phase: v.phase === 'connecting' ? 'error' : v.phase };
}

/* ── 视图模型(纯逻辑:状态 → 该显示什么。承重 UX-HA:任何状态不死胡同) ── */
export type QuizActionKind = 'retry' | 'reconnecting' | 'none';
export interface QuizDisplay {
  heading: string;
  message: string;
  spinner: boolean;
  action: { kind: QuizActionKind; label: string };
  degraded: boolean;
}

export function quizDisplay(v: QuizViewState): QuizDisplay {
  if (v.connection === 'reconnecting') {
    return { heading: '网络中断', message: '正在重连,已生成的押题不会丢失…', spinner: true, action: { kind: 'retry', label: '手动重试' }, degraded: v.degraded };
  }
  if (v.degraded && v.connection === 'closed' && !isQuizTerminal(v.phase)) {
    return { heading: '押题连接已停止', message: '押题连接已停止，不会再用同一续传编号自动重连。可重试或返回列表。', spinner: false, action: { kind: 'retry', label: '重试' }, degraded: true };
  }
  switch (v.phase) {
    case 'connecting':
      return { heading: '连接押题', message: '正在建立连接…', spinner: true, action: { kind: 'reconnecting', label: '取消' }, degraded: false };
    case 'generating': {
      // TOKSTREAM 阶段1:有进度态时 loading 变真实进度(段名+时长/token 计数;R-B 无思考原文);无进度回既有文案(缺帧兜底)。
      const progress = generationProgressLabel(v.generationProgress);
      const base = v.questions.length ? `已生成 ${v.questions.length} 道,正在继续…` : '正在依据你的简历预测训练问题…';
      return { heading: '正在押题', message: progress ? `${base}（${progress}）` : base, spinner: true, action: { kind: 'none', label: '' }, degraded: false };
    }
    case 'ready': {
      const n = v.total ?? v.questions.length;   // total 权威(防题目事件未重放时误报 0)
      return { heading: '押题完成', message: `共 ${n} 道预测训练问题,均已接地校验(过滤幻觉)。`, spinner: false, action: { kind: 'none', label: '' }, degraded: false };
    }
    case 'quiz_unavailable':
      return { heading: '押题暂不可用', message: '押题生成遇到问题,已停止。可重试或联系支持——不会让你干等。', spinner: false, action: { kind: 'retry', label: '重新押题' }, degraded: true };
    case 'error':
      return { heading: '出错了', message: '押题遇到问题。可重试。', spinner: false, action: { kind: 'retry', label: '重试' }, degraded: true };
  }
}

/** 不变量:没有任何状态是"转圈且无内容无操作"的死胡同——要么有可读内容,要么有可点操作(spinner 也必有取消/重试出口)。 */
export function isQuizDeadEnd(d: QuizDisplay): boolean {
  const hasContent = d.message.trim().length > 0;
  const hasAction = d.action.kind !== 'none';
  return d.spinner && !hasContent && !hasAction;
}
