import type { FastifyReply } from 'fastify';
import { getSseNotify, type SseNotifyService } from './sse-notify.service';
import { getSseRegistry, type SseRegistry } from './sse-registry';

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

/**
 * TOKSTREAM S4b：api→browser token delta 帧（worker §C-2 帧契约的 emit 面——剥 v/streamKey，
 * 流键已由 SSE 连接本身承载；**无 id 字段**=§C-4 光标防毒，`id: seq` 仅权威行）。
 */
export interface SseDeltaFrame {
  attemptKey: string;
  seq: number;
  text: string;
  coalesced?: boolean;
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
  /** HA-2 停机注册表(默认进程单例;proof 注入独立实例——沿 notify? 既有注入形制)。 */
  registry?: SseRegistry;
  /** 健康通道兜底毫秒(生产钉 30s;proof 缝)。 */
  fallbackMsHealthy?: number;
  /**
   * TOKSTREAM S4b delta 臂（纯增量·可选）：订阅本流 token delta 帧（广播复制·禁互偷帧）。
   * 缺席=纯行泵现状（裁决③ 三层回退第二层：delta 臂缺席/通道退化→行泵既有面）；interview 控制器
   * 接线，quiz/diagnosis 零触（裁决⑤）。
   */
  deltaSource?: (onFrame: (f: SseDeltaFrame) => void) => { dispose(): void };
}

const HEALTHY_FALLBACK_MS = 30_000;
const DEGRADED_POLL_MS = 2_000;

/** TOKSTREAM S4b：进程内 per-streamKey delta 环形缓冲上界（有界丢旧；帧 ≤10/s 时 ≈25s 腹地）。 */
const TOKEN_RING_MAX = 256;

export async function pumpSseEvents(o: SsePumpOptions): Promise<void> {
  const notify = o.notify ?? getSseNotify();
  const registry = o.registry ?? getSseRegistry();
  const { reply } = o;
  reply.hijack();                                   // Fastify:接管底层响应做 SSE
  reply.raw.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'x-accel-buffering': 'no' });
  let closed = false;
  let draining = false;                             // HA-2 停机排水旗(R1:registry 条目持旗·只停取不 end)
  let wakeOnClose: (() => void) | undefined;
  // R1(sse-registry.ts 口径注):排水后写侧即刻失效——safeWrite 与 while 条件同读同旗,
  // 杜绝 drain 后任何 write 触达 socket(degraded 态 write-after-end 封死)。
  const safeWrite = (s: string) => {
    if (draining) { closed = true; return false; }
    try { reply.raw.write(s); return true; } catch { closed = true; return false; }
  };
  // HA-2 C1 注册:停机链 drainAll() 同步置旗(禁 end)并唤醒本轮 race;泵自身在帧边界
  // 停取退出,raw.end() 仍由本函数收尾单点触发一次(恰一次,断言面见 ha-2-drain.proof)。
  const registryEntry = { requestDrain: () => { draining = true; wakeOnClose?.(); } };
  registry.register(o.streamKey, registryEntry);
  if (registry.isDraining()) draining = true;   // 晚到连接(drain 已开):即刻持旗,catch-up 跳过直接收尾
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
  o.reqRaw.on('close', () => { closed = true; wakeOnClose?.(); });   // 断开即醒:健康态兜底 30s 窗内不滞留 waiter/槽
  // ── TOKSTREAM S4b delta 臂（纯增量注入·行泵循环语义零改）────────────────────────────
  // 进程内 per-streamKey 环形缓冲：有界丢旧（丢旧发生即对入帧标 coalesced=有损标记，非 L1 语义）；
  // delta 帧与 notify wait 同 race 唤醒，delta-only 唤醒**免 fetchMore**（token 帧 ≤10/s，每帧一 SQL
  // 即破坏「无权威事件零 SQL」承诺）；取帧即 emit **无 id 帧**（§C-4：`id: seq` 仅权威行 :80 原值）；
  // 环空照旧走权威行路径（fetchMore/isTerminal/deadline/ping/单点 end 十锚零改）。
  // 丢帧语义=§C-3 不补发不重传（at-most-once·非权威）；断开（reqRaw close）→ 订阅 dispose 即停。
  // 唤醒源区分（R4「delta-only 唤醒免 fetchMore」的逆命题=权威行 notify 唤醒照旧 fetchMore·A10 零改）：
  // notify 唤醒（含与 delta 同刻共醒）恒走取数臂，delta 帧留环待下一 delta-only 唤醒（≤L1 窗≈100ms）——
  // 权威事件永不被连续 delta 流饿死。timer/close 唤醒同属取数臂（兜底+ping 语义原值）。
  const deltaRing: SseDeltaFrame[] = [];
  let notifyWoke = false;
  let wakeForDelta: (() => void) | undefined;
  const pushDeltaFrame = (f: SseDeltaFrame): void => {
    let admitted = f;
    if (deltaRing.length >= TOKEN_RING_MAX) {
      deltaRing.shift();                            // 有界丢旧
      admitted = { ...f, coalesced: true };         // 丢弃痕迹以 coalesced 标记随帧透出（有损标记）
    }
    deltaRing.push(admitted);
    wakeForDelta?.();
  };
  const deltaSub = o.deltaSource?.(pushDeltaFrame);
  const emitDeltaFrames = (frames: SseDeltaFrame[]): boolean => {
    for (const f of frames) {
      const payload = JSON.stringify({
        attemptKey: f.attemptKey, seq: f.seq, text: f.text,
        ...(f.coalesced ? { coalesced: true as const } : {}),
      });
      if (!safeWrite(`event: token_delta\ndata: ${payload}\n\n`)) return false;   // 无 id 帧（光标防毒）
    }
    return true;
  };
  let wait = notify.waitFor(o.streamKey);           // D5:先注册 waiter 再重放 catch-up
  if (!draining) emit(o.initial.rows);              // 1. 重放 catch-up(语义原值);排水已开 → 不写,凭账本重连重放
  while (!done && !closed && !draining && Date.now() < deadline) {
    const waitMs = notify.health().healthy
      ? (o.fallbackMsHealthy ?? HEALTHY_FALLBACK_MS)
      : DEGRADED_POLL_MS;
    let settle: () => void = () => {};
    const race = new Promise<void>((resolve) => { settle = resolve; });
    const timer = setTimeout(settle, waitMs);       // 兜底臂(listen 断连窗最终一致 + ping 载体)
    timer.unref?.();                                // 败者计时器纪律:不悬挂进程生命周期
    wakeOnClose = settle;
    wakeForDelta = settle;
    notifyWoke = false;                             // 本轮唤醒源旗标只归属本轮 waiter（逐轮重置）
    void wait.promise.then(() => { notifyWoke = true; settle(); });
    await race;
    wakeOnClose = undefined;
    wakeForDelta = undefined;
    clearTimeout(timer);                            // 无论胜败必清(败者不留悬挂句柄)
    wait.dispose();
    if (closed || done || draining) break;          // HA-2:drain 落在等待臂 → 帧边界退出
    wait = notify.waitFor(o.streamKey);             // 注册下一轮 waiter(消灭取数窗竞态;delta-only 臂同样持有,防 notify 窗丢失)
    if (deltaRing.length && !notifyWoke) {          // delta-only 唤醒:免 fetchMore(零 SQL·权威行路径不在本臂)
      const frames = deltaRing.splice(0);
      if (!emitDeltaFrames(frames)) break;          // 写失败即知断开(safeWrite 同旗)
      continue;
    }
    const more = await o.fetchMore(lastSeq).catch(() => null);
    if (more === null) break;                       // 取数失败 → 收尾(客户端会重连)
    if (draining) break;                            // HA-2:drain 落在取数窗 → 帧边界退出(禁 emit,R1 防写后关)
    if (more.rows.length) emit(more.rows);          // 2. notify/兜底唤醒后 tail 新事件
    else if (!safeWrite(': ping\n\n')) break;       // 心跳保活 + 写失败即知断开
  }
  wait.dispose();
  if (deltaSub) deltaSub.dispose();                 // TOKSTREAM S4b:delta 订阅随泵全退出路径注销(泄漏断言 tokenSubscriberCount()===0)
  // HA-2 C1 注销:断开/终态/取数失败/deadline/drain 全退出路径共用本单点(泄漏断言 count()===0)。
  registry.unregister(o.streamKey, registryEntry);
  // raw.end() 泵内单点(R1):全路径恰一次;排水路径同样走这里(客户端见干净 end,SSE-RESILIENCE
  // 不计失败→凭 Last-Event-ID 重连续推,由存活实例从账本重放)。
  if (!closed) { try { reply.raw.end(); } catch { /* 已断开 */ } }
}
