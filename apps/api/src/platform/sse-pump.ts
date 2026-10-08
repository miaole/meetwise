import type { FastifyReply } from 'fastify';
import { getSseNotify, type SseNotifyService } from './sse-notify.service';

/**
 * SSE 泵(B5 四件套单源化):hijack/writeHead/safeWrite/emit/hold 循环/deadline/
 * ping 全部收口于此,三控制器(interview/quiz/diagnosis)零复制粘贴;终态集合与
 * 取数函数由控制器注入(原值参数化,零合并)。并发槽 acquire/429 与 404 前置留
 * 在控制器(时序在 hijack 之前,语义原值)。
 *
 * SSE-PUSH Opt1(协调方裁决):循环等待臂 =
 *   await Promise.race([notifyWait, sleep(fallbackMs)])
 * - 通道健康(LISTEN 在位 + 0143 trigger 在场):notify 主推 + 30s 兜底
 *   (fallbackMsHealthy,生产钉值)——无事件时零 SQL(每循环迭代同步读一次
 *   health(),降级可即时回落);
 * - 退化(listen_down|trigger_missing):回落 legacy sleep(2000) 轮询
 *   (fail-open 回旧行为——两既有 proof 的退化环境按构造即此路径,B6 生产
 *   posture 由健康通道承担)。
 *
 * 败者计时器纪律(e2e-ha 处方):race 的 setTimeout 必须 unref 且无论胜败
 * clearTimeout,不留悬挂句柄;notify 等待者全路径 dispose(醒后/断开/退出)。
 *
 * 时序纪律(D5,worker listener :112 先例):每轮先注册 waiter 再取数,消灭
 * 注册窗竞态;notify 为 lossy hint,误醒空手 ping、漏醒由兜底收。Last-Event-ID
 * 重放语义零改(initial catch-up 与 tail 取数均为 seq>lastSeq 同一形状)。
 */
export interface SseEventRow {
  seq: number;
  kind: string;
  payload: unknown;
}

export interface SsePumpOptions {
  reply: FastifyReply;
  /** 请求原始流(客户端断开侦测:req.raw)。 */
  reqRaw: { on(event: 'close', listener: () => void): unknown };
  /** SSE 流键(= interview_event.stream_key = 路由 :id)。 */
  streamKey: string;
  /** 控制器前置取数结果(404 判空后传入):catch-up 行 + 游标。 */
  initial: { lastId: number; rows: SseEventRow[] };
  /** tail 取数(服务层既有 events 方法原样注入);null=取数失败→收尾重连。 */
  fetchMore: (lastSeq: number) => Promise<{ rows: SseEventRow[] } | null>;
  /** 终态集合(控制器原值注入,三处不同,零合并)。 */
  isTerminal: (kind: string) => boolean;
  /** 通知源(默认进程单例;proof 注入独立实例)。 */
  notify?: SseNotifyService;
  /** 健康通道兜底毫秒(生产钉 30s;proof 缝)。 */
  fallbackMsHealthy?: number;
}

const HEALTHY_FALLBACK_MS = 30_000;
const DEGRADED_POLL_MS = 2_000;

export async function pumpSseEvents(o: SsePumpOptions): Promise<void> {
  const notify = o.notify ?? getSseNotify();
  const { reply } = o;
  reply.hijack();                                   // Fastify:接管底层响应做 SSE
  reply.raw.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'x-accel-buffering': 'no' });
  let closed = false;
  const safeWrite = (s: string) => { try { reply.raw.write(s); return true; } catch { closed = true; return false; } };
  let lastSeq = o.initial.lastId;
  let done = false;
  const emit = (list: Array<SseEventRow>) => {
    for (const e of list) {
      if (!safeWrite(`id: ${e.seq}\nevent: ${e.kind}\ndata: ${JSON.stringify(e.payload)}\n\n`)) return;
      lastSeq = Math.max(lastSeq, e.seq);
      if (o.isTerminal(e.kind)) done = true;
    }
  };
  const deadline = Date.now() + 10 * 60_000;        // 封顶 10min(防僵尸连接;客户端凭 Last-Event-ID 重连续推)
  let wakeOnClose: (() => void) | undefined;
  o.reqRaw.on('close', () => { closed = true; wakeOnClose?.(); });   // 断开即醒:健康态兜底 30s 窗内不滞留 waiter/槽
  let wait = notify.waitFor(o.streamKey);           // D5:先注册 waiter 再重放 catch-up
  emit(o.initial.rows);                             // 1. 重放 catch-up(语义原值)
  while (!done && !closed && Date.now() < deadline) {
    const waitMs = notify.health().healthy
      ? (o.fallbackMsHealthy ?? HEALTHY_FALLBACK_MS)
      : DEGRADED_POLL_MS;
    let settle: () => void = () => {};
    const race = new Promise<void>((resolve) => { settle = resolve; });
    const timer = setTimeout(settle, waitMs);       // 兜底臂(listen 断连窗最终一致 + ping 载体)
    timer.unref?.();                                // 败者计时器纪律:不悬挂进程生命周期
    wakeOnClose = settle;
    void wait.promise.then(settle);
    await race;
    wakeOnClose = undefined;
    clearTimeout(timer);                            // 无论胜败必清(败者不留悬挂句柄)
    wait.dispose();
    if (closed || done) break;
    wait = notify.waitFor(o.streamKey);             // 取数前注册下一轮 waiter(消灭取数窗竞态)
    const more = await o.fetchMore(lastSeq).catch(() => null);
    if (more === null) break;                       // 取数失败 → 收尾(客户端会重连)
    if (more.rows.length) emit(more.rows);          // 2. notify/兜底唤醒后 tail 新事件
    else if (!safeWrite(': ping\n\n')) break;       // 心跳保活 + 写失败即知断开
  }
  wait.dispose();
  if (!closed) { try { reply.raw.end(); } catch { /* 已断开 */ } }
}
