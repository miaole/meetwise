/**
 * 面试 SSE 驱动（框架无关,可注入流 + 睡眠单测,不依赖浏览器/React）。
 * 把 decodeSSE + toBusinessEvent + applyEvent 串成"读流→续状态"的循环,并实现**断线自动重连(凭 Last-Event-ID)+ 重连耗尽降级**——
 * 这正是审计指出的"无静默死胡同只在驱动真调用这些纯函数时才成立"的那个驱动。React effect 只需调它并把 onView 渲染出来。
 *
 * 不变量:① 终态(report_ready/unavailable/error)→ 收尾返回,不再重连;② 非终态断流/传输错 → reconnecting,凭 lastEventId 续(seq>lastId 重放,不丢不重);
 *        ③ 重连耗尽 → degraded 出口,停止;④ 本次连接有进展(收到帧)→ 重置重试计数(健康的 flapping 不误判耗尽);
 *        ⑤ HTTP 400 invalid_last_event_id → 立即停转 / degraded,不得用同一游标重试(HC-GAP-014)。
 */
import { decodeSSE, toBusinessEvent, type BusinessEvent } from './business-events';
import { applyEvents, initialView, isTerminal, onStreamClosed, onReconnectExhausted, type InterviewView } from './interview-state';
import { isInvalidLastEventIdError } from './sse-cursor';

/** 打开 SSE 流：真实实现 fetch(url, {headers:{'last-event-id': String(lastEventId)}, signal}) 返回 res.body 的字符串分块异步迭代;
 *  此处注入便于确定性单测。lastEventId>0 时带 Last-Event-ID 头让服务端从 seq>lastEventId 重放;signal 用于卸载取消。 */
export type StreamOpener = (lastEventId: number, signal?: AbortSignal) => AsyncIterable<string> | Promise<AsyncIterable<string>>;

export interface RunStreamOpts {
  open: StreamOpener;
  onView: (v: InterviewView) => void;
  maxRetries?: number;            // 连续无进展重连上限 → degraded
  maxTotalReconnects?: number;    // **绝对**重连上限(即便每次都有进展也封顶,防 dribble-DoS,审计 A)
  maxBufferBytes?: number;        // 单连接 buffer 上限(防无分隔符流无限增长 OOM,审计 B)
  signal?: AbortSignal;           // 卸载/取消(审计 C)
  sleep?: (ms: number) => Promise<void>;
  backoffMs?: (attempt: number) => number;
}

export async function runInterviewStream(opts: RunStreamOpts): Promise<InterviewView> {
  const max = opts.maxRetries ?? 3;
  const maxTotal = opts.maxTotalReconnects ?? 100;
  const maxBuf = opts.maxBufferBytes ?? 1_000_000;
  // 默认退避睡眠**对 abort 敏感**：卸载时退避中也立即解除,不干等到下一拍(审计残留:prompt teardown)。注入的 sleep(测试)不受影响。
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => {
    if (opts.signal?.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    opts.signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  }));
  const backoff = opts.backoffMs ?? ((a: number) => Math.min(200 * 2 ** (a - 1), 5000));
  let view = initialView;
  let attempts = 0;
  let totalReconnects = 0;

  for (;;) {
    if (opts.signal?.aborted) return view;                             // 取消(卸载)→ 立即停,不再 onView
    let buffer = '';
    const startId = view.lastEventId;                                   // 本次连接前的进度水位
    try {
      const stream = await opts.open(view.lastEventId, opts.signal);    // 凭 lastEventId 续
      // **续连成功即回 live**(审计高):"还活着"的信号必须独立于"有没有新业务事件"——否则图在 interrupt 等用户作答(question/clarify/waiting)、
      // 服务端无 seq>lastId 新事件可推(只心跳,被 decodeSSE 过滤、不触 applyEvent),connection 会永卡 reconnecting → 作答框被"重连中"墙挡死=死胡同。
      if (view.connection !== 'live') { view = { ...view, connection: 'live' }; opts.onView(view); }
      for await (const chunk of stream) {
        if (opts.signal?.aborted) return view;
        buffer += chunk;
        if (buffer.length > maxBuf) throw new Error('sse_buffer_overflow'); // 防无分隔符流无限增长 → 当失败重连
        const { frames, rest } = decodeSSE(buffer);
        buffer = rest;
        const events: BusinessEvent[] = [];
        let highestId = view.lastEventId;
        for (const f of frames) {
          const ev = toBusinessEvent(f);
          // 服务器按 seq>Last-Event-ID 重放，但代理、切换网络或错误客户端仍可能投递重复帧。
          // 在归约前拒绝 <= 水位的帧，防止重复题目/重复区块/重复 React 更新。
          if (!ev || ev.id <= highestId) continue;
          events.push(ev);
          highestId = ev.id;
        }
        // One decoded network chunk now has one immutable view snapshot and one UI publication. This protects the
        // reducer itself from O(n²) history copies; the React bridge then further coalesces multiple chunks to rAF.
        if (events.length) {
          view = applyEvents(view, events);
          opts.onView(view);
          if (isTerminal(view.phase)) { view = { ...view, connection: 'closed' }; opts.onView(view); return view; } // 终态收尾
        }
      }
    } catch (err) {
      if (opts.signal?.aborted) return view;
      if (isInvalidLastEventIdError(err)) {
        view = onReconnectExhausted(view); // 非法游标:失败关闭,不重试同一 Last-Event-ID
        opts.onView(view);
        return view;
      }
      /* 传输错/溢出:当作断流,走重连 */
    }

    if (opts.signal?.aborted) return view;
    // **真进展(事件 id 推进)才重置连续重试计数**——否则重复重放同一事件的流会无限重连(redelivery≠progress)
    if (view.lastEventId > startId) attempts = 0;
    view = onStreamClosed(view);                                        // 非终态断流 → reconnecting
    opts.onView(view);
    attempts++;
    totalReconnects++;
    // 连续无进展耗尽 或 触绝对上限(即便有进展也封顶) → degraded 出口
    if (attempts > max || totalReconnects > maxTotal) { view = onReconnectExhausted(view); opts.onView(view); return view; }
    await sleep(backoff(attempts));
  }
}
