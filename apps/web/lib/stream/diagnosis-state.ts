/**
 * 简历诊断视图状态归约：业务事件序列 → 前端视图态。纯函数(可单测,无 React)。
 * 与 quiz-state 同构:progress / section_ready(多,逐维度) / diagnosis_ready(终,携 overall+summary+改写建议) / diagnosis_unavailable(终降级)。
 * 不变量(无静默死胡同):任何情形都有出路——diagnosis_unavailable→degraded+重试;流断在非终态→reconnecting;重连耗尽→degraded/error。
 */
import { z } from 'zod';

const Finding = z.object({ text: z.string(), refs: z.array(z.string()).optional() });
const Rewrite = z.object({ before: z.string(), after: z.string(), refs: z.array(z.string()).optional() });

/** 诊断业务事件判别联合(event = SSE event 字段 = 后端 interview_event.kind,stream_key=diagnosisId)。 */
export const DiagnosisEvent = z.discriminatedUnion('event', [
  z.object({ event: z.literal('progress'), id: z.number().int(), data: z.record(z.string(), z.unknown()) }),
  z.object({ event: z.literal('section_ready'), id: z.number().int(), data: z.object({
    kind: z.string(), title: z.string(), score: z.number().nullable().optional(), findings: z.array(Finding),
  }) }),
  // 改写建议逐条流式(每帧有界,避免大报告撑爆前端缓冲 → 假"暂不可用")。
  z.object({ event: z.literal('rewrite_ready'), id: z.number().int(), data: Rewrite }),
  // 终态:摘要字段装饰性,绝不能因字段漂移让**唯一成功终态**被 safeParse 丢弃 → 用 .loose() + 防御性读取。
  z.object({ event: z.literal('diagnosis_ready'), id: z.number().int(), data: z.object({
    overall: z.number().optional(), summary: z.string().optional(), sectionCount: z.number().optional(), rewriteCount: z.number().optional(),
  }).loose() }),
  // 终态降级事件:诊断生成失败 → 前端退出等待态、显示"诊断暂不可用",绝不无限转圈。
  z.object({ event: z.literal('diagnosis_unavailable'), id: z.number().int(), data: z.object({ reason: z.string() }).loose() }),
  z.object({ event: z.literal('error'), id: z.number().int(), data: z.record(z.string(), z.unknown()) }),
]);
export type DiagnosisEvent = z.infer<typeof DiagnosisEvent>;

export const ALL_DIAGNOSIS_PHASES = ['connecting', 'generating', 'ready', 'diagnosis_unavailable', 'error'] as const;
export type DiagnosisPhase = typeof ALL_DIAGNOSIS_PHASES[number];
export type ConnectionState = 'live' | 'reconnecting' | 'closed';

export interface DiagFinding { text: string; refs: string[] }
export interface DiagSection { kind: string; title: string; score: number | null; findings: DiagFinding[] }
export interface DiagRewrite { before: string; after: string; refs: string[] }
export interface DiagnosisViewState {
  phase: DiagnosisPhase;
  sections: DiagSection[];
  overall?: number;
  summary?: string;
  rewrites: DiagRewrite[];
  /** diagnosis_ready 携带的维度数(权威):区分"真 0 维"与"维度事件未重放",避免误显示"未生成诊断"。 */
  total?: number;
  degraded: boolean;
  connection: ConnectionState;
  lastEventId: number;
}

export const initialDiagnosisView: DiagnosisViewState = { phase: 'connecting', sections: [], rewrites: [], degraded: false, connection: 'live', lastEventId: 0 };

export const TERMINAL_DIAGNOSIS_PHASES: DiagnosisPhase[] = ['ready', 'diagnosis_unavailable', 'error'];
export const isDiagnosisTerminal = (p: DiagnosisPhase): boolean => TERMINAL_DIAGNOSIS_PHASES.includes(p);

export function applyDiagnosisEvent(v: DiagnosisViewState, e: DiagnosisEvent): DiagnosisViewState {
  const next: DiagnosisViewState = { ...v, lastEventId: Math.max(v.lastEventId, e.id), connection: 'live' };
  switch (e.event) {
    case 'progress': next.phase = 'generating'; break;
    case 'section_ready':
      next.phase = 'generating';
      next.sections = [...next.sections, {
        kind: e.data.kind, title: e.data.title, score: e.data.score ?? null,
        findings: e.data.findings.map((f) => ({ text: f.text, refs: f.refs ?? [] })),
      }];
      break;
    case 'rewrite_ready':
      next.phase = 'generating';
      next.rewrites = [...next.rewrites, { before: e.data.before, after: e.data.after, refs: e.data.refs ?? [] }];
      break;
    case 'diagnosis_ready': {
      next.phase = 'ready';
      if (typeof e.data.overall === 'number') next.overall = e.data.overall;
      if (typeof e.data.summary === 'string') next.summary = e.data.summary;
      if (typeof e.data.sectionCount === 'number') next.total = e.data.sectionCount;
      break;
    }
    case 'diagnosis_unavailable': next.phase = 'diagnosis_unavailable'; next.degraded = true; break;  // 优雅降级
    case 'error': next.phase = 'error'; break;
  }
  return next;
}

/** 流关闭：非终态 → reconnecting(组件据此用同一 diagnosisId+Last-Event-ID 自动重连);终态 → closed(正常)。 */
export function onDiagnosisStreamClosed(v: DiagnosisViewState): DiagnosisViewState {
  return { ...v, connection: isDiagnosisTerminal(v.phase) ? 'closed' : 'reconnecting' };
}
/** 重连耗尽 → 给出口:degraded + 停止重连;若还卡在 connecting(从没拿到状态)则置 error。 */
export function onDiagnosisReconnectExhausted(v: DiagnosisViewState): DiagnosisViewState {
  return { ...v, connection: 'closed', degraded: true, phase: v.phase === 'connecting' ? 'error' : v.phase };
}

/* ── 视图模型(纯逻辑:状态 → 该显示什么。承重 UX-HA:任何状态不死胡同) ── */
export type DiagnosisActionKind = 'retry' | 'reconnecting' | 'none';
export interface DiagnosisDisplay {
  heading: string;
  message: string;
  spinner: boolean;
  action: { kind: DiagnosisActionKind; label: string };
  degraded: boolean;
}

export function diagnosisDisplay(v: DiagnosisViewState): DiagnosisDisplay {
  if (v.connection === 'reconnecting') {
    return { heading: '网络中断', message: '正在重连,已生成的诊断不会丢失…', spinner: true, action: { kind: 'retry', label: '手动重试' }, degraded: v.degraded };
  }
  switch (v.phase) {
    case 'connecting':
      return { heading: '连接诊断', message: '正在建立连接…', spinner: true, action: { kind: 'reconnecting', label: '取消' }, degraded: false };
    case 'generating':
      return { heading: '正在诊断', message: v.sections.length ? `已完成 ${v.sections.length} 个维度,正在继续…` : '正在依据你的简历逐维度诊断…', spinner: true, action: { kind: 'none', label: '' }, degraded: false };
    case 'ready': {
      const n = v.total ?? v.sections.length;   // total 权威(防维度事件未重放时误报 0)
      return { heading: '诊断完成', message: `综合评分 ${v.overall ?? '—'} 分,${n} 个维度,所有结论均已接地校验(不虚构经历)。`, spinner: false, action: { kind: 'none', label: '' }, degraded: false };
    }
    case 'diagnosis_unavailable':
      return { heading: '诊断暂不可用', message: '诊断生成遇到问题,已停止。可重试或联系支持——不会让你干等。', spinner: false, action: { kind: 'retry', label: '重新诊断' }, degraded: true };
    case 'error':
      return { heading: '出错了', message: '诊断遇到问题。可重试。', spinner: false, action: { kind: 'retry', label: '重试' }, degraded: true };
  }
}

/** 不变量:没有任何状态是"转圈且无内容无操作"的死胡同——要么有可读内容,要么有可点操作(spinner 也必有取消/重试出口)。 */
export function isDiagnosisDeadEnd(d: DiagnosisDisplay): boolean {
  const hasContent = d.message.trim().length > 0;
  const hasAction = d.action.kind !== 'none';
  return d.spinner && !hasContent && !hasAction;
}
