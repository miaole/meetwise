/**
 * 押题 SSE 驱动(框架无关,可注入流 + 睡眠单测,不依赖浏览器/React)。与 interview-stream 同构:
 * decodeSSE(复用通用 SSE 解帧) + 解析 QuizEvent + applyQuizEvent 串成"读流→续状态",并实现断线自动重连(凭 Last-Event-ID)+ 重连耗尽降级。
 * 不变量:① 终态(ready/unavailable/error)→ 收尾返回,不再重连;② 非终态断流 → reconnecting,凭 lastEventId 续;③ 重连耗尽 → degraded 出口;
 *        ④ HTTP 400 invalid_last_event_id → 立即停转 / degraded,不得用同一游标重试(HC-GAP-014)。
 */
import { decodeSSE, type SSEFrame } from './business-events';
import { isInvalidLastEventIdError } from './sse-cursor';
import {
  QuizEvent, applyQuizEvent, initialQuizView, isQuizTerminal,
  onQuizStreamClosed, onQuizReconnectExhausted, type QuizViewState,
} from './quiz-state';

/** 帧 → 强类型押题事件。schema 不过(未知事件/坏 payload)返回 null(只信契约内事件)。 */
function toQuizEvent(f: SSEFrame): QuizEvent | null {
  let data: unknown = {};
  try { data = f.data ? JSON.parse(f.data) : {}; } catch { return null; }
  const parsed = QuizEvent.safeParse({ event: f.event, id: f.id, data });
  return parsed.success ? parsed.data : null;
}

export type QuizStreamOpener = (lastEventId: number, signal?: AbortSignal) => AsyncIterable<string> | Promise<AsyncIterable<string>>;

export interface RunQuizStreamOpts {
  open: QuizStreamOpener;
  onView: (v: QuizViewState) => void;
  maxRetries?: number;
  maxTotalReconnects?: number;
  maxBufferBytes?: number;
  signal?: AbortSignal;
  sleep?: (ms: number) => Promise<void>;
  backoffMs?: (attempt: number) => number;
}

export async function runQuizStream(opts: RunQuizStreamOpts): Promise<QuizViewState> {
  const max = opts.maxRetries ?? 3;
  const maxTotal = opts.maxTotalReconnects ?? 100;
  const maxBuf = opts.maxBufferBytes ?? 1_000_000;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => {
    if (opts.signal?.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    opts.signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  }));
  const backoff = opts.backoffMs ?? ((a: number) => Math.min(200 * 2 ** (a - 1), 5000));
  let view = initialQuizView;
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
          const ev = toQuizEvent(f);
          if (!ev || ev.id <= view.lastEventId) continue; // 客户端水位去重：重放不能重复追加题目。
          view = applyQuizEvent(view, ev);
          opts.onView(view);
          if (isQuizTerminal(view.phase)) { view = { ...view, connection: 'closed' }; opts.onView(view); return view; }
        }
      }
    } catch (err) {
      if (opts.signal?.aborted) return view;
      if (isInvalidLastEventIdError(err)) {
        view = onQuizReconnectExhausted(view);
        opts.onView(view);
        return view;
      }
      /* 传输错/溢出:当断流,走重连 */
    }

    if (opts.signal?.aborted) return view;
    if (view.lastEventId > startId) attempts = 0;     // 真进展才重置连续重试计数(redelivery≠progress)
    view = onQuizStreamClosed(view);
    opts.onView(view);
    attempts++;
    totalReconnects++;
    if (attempts > max || totalReconnects > maxTotal) { view = onQuizReconnectExhausted(view); opts.onView(view); return view; }
    await sleep(backoff(attempts));
  }
}
