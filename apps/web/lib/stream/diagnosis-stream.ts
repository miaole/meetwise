/**
 * 简历诊断 SSE 驱动(框架无关,可注入流 + 睡眠单测,不依赖浏览器/React)。与 quiz-stream 同构:
 * decodeSSE(复用通用 SSE 解帧) + 解析 DiagnosisEvent + applyDiagnosisEvent 串成"读流→续状态",并实现断线自动重连(凭 Last-Event-ID)+ 重连耗尽降级。
 * 不变量:① 终态(ready/unavailable/error)→ 收尾返回,不再重连;② 非终态断流 → reconnecting,凭 lastEventId 续;③ 重连耗尽 → degraded 出口。
 */
import { decodeSSE, type SSEFrame } from './business-events';
import {
  DiagnosisEvent, applyDiagnosisEvent, initialDiagnosisView, isDiagnosisTerminal,
  onDiagnosisStreamClosed, onDiagnosisReconnectExhausted, type DiagnosisViewState,
} from './diagnosis-state';

/** 帧 → 强类型诊断事件。schema 不过(未知事件/坏 payload)返回 null(只信契约内事件)。 */
function toDiagnosisEvent(f: SSEFrame): DiagnosisEvent | null {
  let data: unknown = {};
  try { data = f.data ? JSON.parse(f.data) : {}; } catch { return null; }
  const parsed = DiagnosisEvent.safeParse({ event: f.event, id: f.id, data });
  return parsed.success ? parsed.data : null;
}

export type DiagnosisStreamOpener = (lastEventId: number, signal?: AbortSignal) => AsyncIterable<string> | Promise<AsyncIterable<string>>;

export interface RunDiagnosisStreamOpts {
  open: DiagnosisStreamOpener;
  onView: (v: DiagnosisViewState) => void;
  maxRetries?: number;
  maxTotalReconnects?: number;
  maxBufferBytes?: number;
  signal?: AbortSignal;
  sleep?: (ms: number) => Promise<void>;
  backoffMs?: (attempt: number) => number;
}

export async function runDiagnosisStream(opts: RunDiagnosisStreamOpts): Promise<DiagnosisViewState> {
  const max = opts.maxRetries ?? 3;
  const maxTotal = opts.maxTotalReconnects ?? 100;
  const maxBuf = opts.maxBufferBytes ?? 1_000_000;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => {
    if (opts.signal?.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    opts.signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  }));
  const backoff = opts.backoffMs ?? ((a: number) => Math.min(200 * 2 ** (a - 1), 5000));
  let view = initialDiagnosisView;
  let attempts = 0;
  let totalReconnects = 0;

  for (;;) {
    if (opts.signal?.aborted) return view;
    let buffer = '';
    const startId = view.lastEventId;
    try {
      const stream = await opts.open(view.lastEventId, opts.signal);
      for await (const chunk of stream) {
        if (opts.signal?.aborted) return view;
        buffer += chunk;
        if (buffer.length > maxBuf) throw new Error('sse_buffer_overflow');
        const { frames, rest } = decodeSSE(buffer);
        buffer = rest;
        for (const f of frames) {
          const ev = toDiagnosisEvent(f);
          if (!ev) continue;
          view = applyDiagnosisEvent(view, ev);
          opts.onView(view);
          if (isDiagnosisTerminal(view.phase)) { view = { ...view, connection: 'closed' }; opts.onView(view); return view; }
        }
      }
    } catch { /* 传输错/溢出:当断流,走重连 */ }

    if (opts.signal?.aborted) return view;
    if (view.lastEventId > startId) attempts = 0;     // 真进展才重置连续重试计数(redelivery≠progress)
    view = onDiagnosisStreamClosed(view);
    opts.onView(view);
    attempts++;
    totalReconnects++;
    if (attempts > max || totalReconnects > maxTotal) { view = onDiagnosisReconnectExhausted(view); opts.onView(view); return view; }
    await sleep(backoff(attempts));
  }
}
