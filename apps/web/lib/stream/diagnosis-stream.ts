/**
 * 简历诊断 SSE 驱动(框架无关,可注入流 + 睡眠单测,不依赖浏览器/React)。与 quiz-stream 同构:
 * decodeSSE(复用通用 SSE 解帧) + 解析 DiagnosisEvent + applyDiagnosisEvent 串成"读流→续状态",并实现断线自动重连(凭 Last-Event-ID)。
 *
 * SSE-RESILIENCE(#53/#55/#56)重连语义与 interview-stream 逐字同构（见其头注释）：
 * ① C1 full-jitter 指数退避;连续无进展耗尽→慢速永续(cap 档),degraded 只留给绝对上限/400 游标/fatal 状态码;
 * ② 无错干净 end 不计失败(短固定间隔重连)+补钉1 超宽限计入预算;sawTraffic 心跳重置;
 * ③ 401 停转/404 fail-closed/429 慢速重试/5xx 计失败;400 游标既有语义零改('cursor');
 * ④ resumeSignals 注入(online/visible/retry),全部退出路径 dispose。
 * 既有不变量:① 终态(ready/unavailable/error)→ 收尾返回,不再重连;② 非终态断流 → reconnecting,凭 lastEventId 续;
 *        ④ HTTP 400 invalid_last_event_id → 立即停转 / degraded,不得用同一游标重试(HC-GAP-014)。
 */
import { decodeSSE, type SSEFrame } from './business-events';
import { isInvalidLastEventIdError, isSseOpenStatusError, classifySseOpenStatus } from './sse-cursor';
import { jitteredBackoff, capJitterBackoff, noopResumeSignals, SSE_BACKOFF_BASE_MS, SSE_BACKOFF_CAP_MS, CLEAN_END_RECONNECT_MS, CLEAN_END_NO_PROGRESS_BUDGET, type JitteredBackoff, type ResumeSignals } from './backoff';
import {
  DiagnosisEvent, applyDiagnosisEvent, initialDiagnosisView, isDiagnosisTerminal,
  onDiagnosisStreamClosed, onDiagnosisReconnectExhausted, type DiagnosisViewState, type StreamStopReason,
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
  capBackoffMs?: (attempt: number) => number;
  resumeSignals?: ResumeSignals;
  cleanEndReconnectMs?: number;
  cleanEndNoProgressBudget?: number;
}

export async function runDiagnosisStream(opts: RunDiagnosisStreamOpts): Promise<DiagnosisViewState> {
  const max = opts.maxRetries ?? 3;
  const maxTotal = opts.maxTotalReconnects ?? 100;
  const maxBuf = opts.maxBufferBytes ?? 1_000_000;
  const cleanMs = opts.cleanEndReconnectMs ?? CLEAN_END_RECONNECT_MS;
  const cleanBudget = opts.cleanEndNoProgressBudget ?? CLEAN_END_NO_PROGRESS_BUDGET;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => {
    if (opts.signal?.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    opts.signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  }));
  const backoff: JitteredBackoff = opts.backoffMs ?? jitteredBackoff(SSE_BACKOFF_BASE_MS, 2, SSE_BACKOFF_CAP_MS);
  const capBackoff = opts.capBackoffMs ?? capJitterBackoff(SSE_BACKOFF_CAP_MS);
  let view = initialDiagnosisView;
  let attempts = 0;
  let totalReconnects = 0;
  let cleanNoProgress = 0;
  let perpetual = false;
  let lastFailureReason: StreamStopReason | undefined;   // 最近失败分类(5xx='server';传输=undefined):绝对上限 degraded 时承载,供文案按因分臂

  const signals = opts.resumeSignals ?? noopResumeSignals();
  const disposers: Array<() => void> = [];
  let wake: (() => void) | null = null;
  const fire = () => { attempts = 0; cleanNoProgress = 0; perpetual = false; wake?.(); };
  disposers.push(signals.onOnline(fire), signals.onVisible(fire), signals.onRetry(fire));

  const doze = (ms: number): Promise<void> => new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => { if (settled) return; settled = true; wake = null; resolve(); };
    wake = finish;
    void Promise.resolve(sleep(ms)).then(finish, finish);
  });

  try {
    for (;;) {
      if (opts.signal?.aborted) return view;
      let buffer = '';
      let sawTraffic = false;
      const startId = view.lastEventId;
      let cleanEnd = false;
      try {
        const stream = await opts.open(view.lastEventId, opts.signal);
        if (view.connection !== 'live') { view = { ...view, connection: 'live', streamStopReason: undefined, cleanEndReconnect: undefined }; opts.onView(view); }
        for await (const chunk of stream) {
          if (opts.signal?.aborted) return view;
          buffer += chunk;
          if (buffer.length > maxBuf) throw new Error('sse_buffer_overflow');
          const { frames, rest, sawTraffic: traffic } = decodeSSE(buffer);
          if (traffic) { attempts = 0; cleanNoProgress = 0; }   // 心跳/任何字节=活跃信号,重置失败预算(#55)
          sawTraffic = sawTraffic || traffic;
          buffer = rest;
          for (const f of frames) {
            const ev = toDiagnosisEvent(f);
            if (!ev || ev.id <= view.lastEventId) continue; // 客户端水位去重：重放不能重复追加诊断区块。
            view = applyDiagnosisEvent(view, ev);
            opts.onView(view);
            if (isDiagnosisTerminal(view.phase)) { view = { ...view, connection: 'closed' }; opts.onView(view); return view; }
          }
        }
        cleanEnd = true;
      } catch (err) {
        if (opts.signal?.aborted) return view;
        lastFailureReason = undefined;                            // 传输错(默认无分类),状态码分支命中再精化
        if (isInvalidLastEventIdError(err)) {
          view = onDiagnosisReconnectExhausted(view, 'cursor');
          opts.onView(view);
          return view;
        }
        if (isSseOpenStatusError(err)) {
          const cls = classifySseOpenStatus(err.status);
          if (cls === 'auth') { view = onDiagnosisReconnectExhausted(view, 'auth'); opts.onView(view); return view; }
          if (cls === 'not_found') { view = onDiagnosisReconnectExhausted(view, 'not_found'); opts.onView(view); return view; }
          if (cls === 'rate_limited') {
            view = { ...onDiagnosisStreamClosed(view), streamStopReason: 'rate_limited' as StreamStopReason, cleanEndReconnect: undefined };
            opts.onView(view);
            totalReconnects++;
            if (totalReconnects > maxTotal) { view = onDiagnosisReconnectExhausted(view, 'rate_limited'); opts.onView(view); return view; }
            await doze(capBackoff(attempts));
            continue;
          }
          /* 5xx('server')与其余 4xx/transport:计失败走退避;绝对上限 degraded 按因承载 */
          lastFailureReason = cls === 'server' ? 'server' : undefined;
        }
        /* 传输错/溢出/5xx:当断流,走重连(计失败预算) */
      }

      if (opts.signal?.aborted) return view;
      const progressed = view.lastEventId > startId;
      if (progressed) { attempts = 0; cleanNoProgress = 0; lastFailureReason = undefined; }     // 真进展才重置连续重试计数(redelivery≠progress)

      if (cleanEnd && !progressed && !sawTraffic) cleanNoProgress++;
      if (cleanEnd && cleanNoProgress <= cleanBudget) {
        lastFailureReason = undefined;                          // 服务端能干净收尾=可达,清陈旧失败分类
        view = onDiagnosisStreamClosed(view, { cleanEnd: true });
        opts.onView(view);
        totalReconnects++;
        if (totalReconnects > maxTotal) { view = onDiagnosisReconnectExhausted(view); opts.onView(view); return view; }
        await doze(cleanMs);
        continue;
      }
      view = onDiagnosisStreamClosed(view);
      opts.onView(view);
      attempts++;
      totalReconnects++;
      if (totalReconnects > maxTotal) { view = onDiagnosisReconnectExhausted(view, lastFailureReason); opts.onView(view); return view; }
      if (attempts > max) perpetual = true;
      await doze(perpetual ? capBackoff(attempts) : backoff(attempts));
    }
  } finally {
    for (const d of disposers) { try { d(); } catch { /* dispose 幂等 */ } }
  }
}
