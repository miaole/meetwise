/**
 * SSE-API 子刀件B prove（客户端空闲看门狗·#58 半开 TCP 挂死收敛·假 open 流零网络形·actualSpendCny=null）。
 * 形制沿 web-logic.proof 单元面（runInterviewStream 直驱+注入 open/sleep/resumeSignals）。
 *
 * 六臂（REQUEST §1-件B 判别臂·臂2 跨 WD-2/WD-3 两段）：
 *   臂1=WD-1 半开假流（一帧后半开永不 yield 不 error）+注入 idleTimeoutMs 小值 → 超时后驱动进既有失败
 *        预算路径重连（reconnecting 非 clean-end+重连 open 携 lastEventId 续读）。
 *   臂2=WD-2/WD-3 hidden 暂停护栏（onHidden 假件）：WD-2 hidden 下超时不触发重连（UC 验收
 *        :305:reconnect=0）+hidden→visible 转移拍·流仍开臂零重连（UC :306 前半·隐藏时长宽免）;
 *        WD-3 转移拍·流已关臂：visible 化时流已关 → 既有 doze 唤醒→携 Last-Event-ID 重连恰一次
 *        （UC :306 后半·非额外拨号）。
 *   臂3=WD-3P 正常 chunk 流（含 `: ping` 字节）零误断——空闲计时逐 chunk 重置生效。
 *   臂4=WD-4 opts.signal abort 恒优先（看门狗不抢卸载语义）：abort 立即收尾返回+零重连+转接链达底层。
 *   臂5=WD-5 超时后底层 connAc 已 abort（真流取消面·假流记录 signal+reason=sse_idle_watchdog）。
 *   臂6=WD-6 open 永不 resolve 假件 → 看门狗自**连接尝试起点**到点（rev2 P1-3 时钟锚盖 await opts.open
 *        挂死面）→ connAc.abort() → 驱动落既有重连路径（open 再拨）。
 *
 * 改前红=现码 for await 无出口（WD-1 永久挂死）+open pending 连迭代都进不去（WD-6 同样永久挂死）
 * → until 超时断言 FAIL；改后绿。看门狗时钟=performance.now 单调口径（UC :299 防御）。
 *
 * 运行：pnpm -C apps/web prove:sse-idle-watchdog。
 */
import { runInterviewStream, type ResumeSignals, type StreamOpener } from '../lib/stream/interview-stream.ts';
import type { InterviewView } from '../lib/stream/interview-state.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: unknown) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok && detail !== undefined) console.log(`      ↳ detail: ${JSON.stringify(detail)}`);
  if (!ok) failures++;
};
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const park = () => new Promise<void>(() => undefined);   // 退避停放:观测窗口内停在重连拍
async function until(cond: () => boolean, timeoutMs: number): Promise<boolean> {
  const t0 = Date.now();
  for (;;) {
    if (cond()) return true;
    if (Date.now() - t0 > timeoutMs) return false;
    await sleep(5);
  }
}

// ── 假件工装 ──
const PING = ': ping\n\n';
const sseFrame = (id: number) => `id: ${id}\nevent: progress\ndata: {}\n\n`;

function fakeResumeSignals(): { signals: ResumeSignals; setHidden: (hidden: boolean) => void } {
  const hiddenCbs: Array<(hidden: boolean) => void> = [];
  const signals: ResumeSignals = {
    onOnline: () => () => {},
    onVisible: () => () => {},
    onRetry: () => () => {},
    onHidden: (cb) => {   // 假件:cb 由测试手动驱动(真实现=useInterviewStream browserResumeSignals)
      hiddenCbs.push(cb);
      return () => { const i = hiddenCbs.indexOf(cb); if (i >= 0) hiddenCbs.splice(i, 1); };
    },
  };
  return { signals, setHidden: (hidden: boolean) => { for (const cb of [...hiddenCbs]) cb(hidden); } };
}

interface OpenRecord { lastEventId: number; signal: AbortSignal | undefined; }

/** 半开假流:可选首 chunk(帧/心跳)后永不 yield 不 error;signal abort 即以 reason reject(真流取消面)。 */
function hangingStream(signal: AbortSignal | undefined, firstChunk?: string): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator]: () => {
      let hasFirst = firstChunk !== undefined;
      return {
        next: () => {
          if (hasFirst) { hasFirst = false; return Promise.resolve({ done: false as const, value: firstChunk as string }); }
          return new Promise<IteratorResult<string>>((_, reject) => {
            if (signal?.aborted) return reject(signal.reason ?? new Error('stream_aborted'));
            signal?.addEventListener('abort', () => reject(signal.reason ?? new Error('stream_aborted')), { once: true });
          });
        },
      };
    },
  };
}

/** 有限假流:依次 yield 后干净 done(服务器轮换/收尾面)。 */
function finiteStream(chunks: string[]): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator]: () => {
      let i = 0;
      return {
        next: () => (i < chunks.length
          ? Promise.resolve({ done: false as const, value: chunks[i++] })
          : Promise.resolve({ done: true as const, value: undefined as never })),
      };
    },
  };
}

interface Harness { opens: OpenRecord[]; views: InterviewView[]; done: Promise<InterviewView>; abort: () => void; }

function drive(partial: { open: StreamOpener; idleTimeoutMs: number; resumeSignals?: ResumeSignals; cleanEndReconnectMs?: number; sleep?: (ms: number) => Promise<void> }): Harness {
  const ac = new AbortController();
  const opens: OpenRecord[] = [];
  const views: InterviewView[] = [];
  const done = runInterviewStream({
    open: (lastEventId, signal) => {
      const stream = partial.open(lastEventId, signal);   // 先取流后记账:选择器按「第几拨」判形时序才正确
      opens.push({ lastEventId, signal });
      return stream;
    },
    onView: (v) => views.push(v),
    signal: ac.signal,
    resumeSignals: partial.resumeSignals,
    idleTimeoutMs: partial.idleTimeoutMs,
    cleanEndReconnectMs: partial.cleanEndReconnectMs,
    sleep: partial.sleep ?? park,
  });
  return { opens, views, done, abort: () => ac.abort() };
}

function detach(h: Harness) { void h.done.catch(() => undefined); }   // 后台驱动收尾防未处理拒绝

console.log('SSE-IDLE-WATCHDOG prove · 客户端空闲看门狗(#58 半开挂死收敛) · 假 open 流零网络 · actualSpendCny=null');

// ── WD-1 半开假流:空闲超时→既有失败预算路径重连+携 lastEventId 续读 ──
{
  let firstDial = true;   // 选择器持旗标不持 h(h 在 drive() 返回前处 TDZ,首拨同步调 open 会 ReferenceError)
  const h = drive({
    open: (_id, signal) => {
      const stream = firstDial ? hangingStream(signal, sseFrame(1)) : hangingStream(signal);
      firstDial = false;
      return stream;
    },
    idleTimeoutMs: 60,
    sleep: (ms) => sleep(Math.min(ms, 5)),   // 退避快放:重连拍可见(观测毕即 abort 收敛)
  });
  detach(h);
  const redialed = await until(() => h.opens.length >= 2, 2_000);
  h.abort();   // 观测毕立即收口:open#2 纯挂流随 abort reject→驱动 return(断言期零额外拨号)
  A('WD-1.1 半开流空闲超时→驱动进入重连(第二拨发生)', redialed && h.opens.length === 2, h.opens.length);
  A('WD-1.2 重连 open 携 lastEventId 续读(open#2 lastEventId=1)', h.opens[1]?.lastEventId === 1, h.opens.map((o) => o.lastEventId));
  A('WD-1.3 落既有失败预算路径(reconnecting·非 clean-end 轮换)',
    h.views.some((v) => v.connection === 'reconnecting' && v.cleanEndReconnect === undefined));
}

// ── WD-2 hidden 暂停护栏:超时不触发+visible 转移拍流仍开零重连(UC :305/:306 前半) ──
{
  const { signals, setHidden } = fakeResumeSignals();
  const h = drive({ open: (_id, signal) => hangingStream(signal), idleTimeoutMs: 60, resumeSignals: signals });
  detach(h);
  await until(() => h.opens.length === 1, 2_000);
  setHidden(true);                       // 进入 hidden:暂停看门狗判定
  await sleep(180);                      // 3× 空闲窗:原 deadline 已远超
  A('WD-2.1 hidden 暂停:超时不触发重连(UC 验收:reconnect 调用次数=0)', h.opens.length === 1, h.opens.length);
  setHidden(false);                      // visible 转移拍:流仍开→隐藏时长宽免·重挂新窗
  await sleep(30);                       // 新窗(60ms)中段——原 deadline(+180ms)早已越过
  A('WD-2.2 visible 转移拍·流仍开→零重连(UC :306 前半·不盲目重连)', h.opens.length === 1, h.opens.length);
  h.abort();
}

// ── WD-3 转移拍流已关臂:visible 化→既有 doze 唤醒→携 Last-Event-ID 重连恰一次(UC :306 后半) ──
{
  const { signals, setHidden } = fakeResumeSignals();
  let firstDial = true;   // 同 WD-1:旗标解 TDZ(首拨=有限流,重拨=挂流)
  const h = drive({
    open: (_id, signal) => {
      const stream = firstDial ? finiteStream([sseFrame(1)]) : hangingStream(signal);
      firstDial = false;
      return stream;
    },
    idleTimeoutMs: 60,
    resumeSignals: signals,
    cleanEndReconnectMs: 30_000,   // clean-end doze 停放:只等 visible 转移拍唤醒
  });
  detach(h);
  const parked = await until(() => h.views.some((v) => v.connection === 'reconnecting' && v.cleanEndReconnect === true), 2_000);
  A('WD-3.0 流干净结束→clean-end 轮换拍进 doze 停放(既有路径)', parked);
  setHidden(true);
  await sleep(50);
  setHidden(false);                      // visible 转移拍:流已关→既有 doze 唤醒→既有路径重连(非额外拨号)
  const redialed = await until(() => h.opens.length >= 2, 2_000);
  A('WD-3.1 流已关→携 Last-Event-ID 重连恰一次(open#2 lastEventId=1)', redialed && h.opens.length === 2 && h.opens[1]?.lastEventId === 1, h.opens.map((o) => o.lastEventId));
  await sleep(40);                       // 新连接窗(60ms)内 abort 前无额外拨号
  A('WD-3.2 恰一次(零额外拨号)', h.opens.length === 2, h.opens.length);
  h.abort();
}

// ── WD-3P(臂3) 正常心跳流:每 chunk 含 `: ping` 即重置空闲计时→零误断(判别面=无重置看门狗会在
//    连接尝试起点+t0+60ms 误断,续拍心跳流下零重连即证重置缝生效) ──
{
  let sent = 0;
  const h = drive({
    open: (_id, signal) => {
      const sig = signal;
      return {
        [Symbol.asyncIterator]: () => ({
          next: () => new Promise<IteratorResult<string>>((resolve, reject) => {
            if (sent >= 10) {   // 心跳拍尽转挂死:收口交外层 abort(abort→reject→驱动 return·零额外拨号)
              if (sig?.aborted) return reject(sig.reason ?? new Error('stream_aborted'));
              sig?.addEventListener('abort', () => reject(sig.reason ?? new Error('stream_aborted')), { once: true });
              return;
            }
            sent += 1;
            setTimeout(() => resolve({ done: false as const, value: PING }), 20);   // 20ms < 60ms 窗:逐拍重置
          }),
        }),
      };
    },
    idleTimeoutMs: 60,
    sleep: (ms) => sleep(Math.min(ms, 5)),
  });
  detach(h);
  const survived = await until(() => sent >= 10, 3_000);   // 10 拍×20ms=200ms ≫ 60ms 窗:无重置者早已误断
  A('WD-3P.1 正常 chunk 流(含 `: ping` 字节)零误断——看门狗逐 chunk 重置生效(opens 恒 1)',
    survived && h.opens.length === 1, h.opens.length);
  h.abort();
}

// ── WD-4 opts.signal abort 恒优先(看门狗不抢卸载语义) ──
{
  const h = drive({ open: (_id, signal) => hangingStream(signal), idleTimeoutMs: 60 });
  await until(() => h.opens.length === 1, 2_000);
  h.abort();                             // 卸载(远早于空闲窗)
  const v = await Promise.race([h.done, sleep(2_000).then(() => null)]);
  A('WD-4.1 abort 恒优先:驱动立即收尾返回(不待看门狗)', v !== null, v);
  A('WD-4.2 abort 后零重连(opens 恒 1)', h.opens.length === 1, h.opens.length);
  A('WD-4.3 abort 转接链达底层连接(假流收到 connAc abort)', h.opens[0]?.signal?.aborted === true);
}

// ── WD-5 超时后底层 connAc 已 abort(真流取消面·reason=sse_idle_watchdog) ──
{
  const h = drive({ open: (_id, signal) => hangingStream(signal), idleTimeoutMs: 50, sleep: (ms) => sleep(Math.min(ms, 5)) });
  detach(h);
  const redialed = await until(() => h.opens.length >= 2, 2_000);
  h.abort();   // 收口:open#2 挂死随 abort reject→驱动 return
  A('WD-5.1 看门狗超时→底层连接信号已 abort(假流取消面)', redialed && h.opens[0]?.signal?.aborted === true);
  A('WD-5.2 abort 携看门狗标识(signal.reason=sse_idle_watchdog)',
    (h.opens[0]?.signal?.reason as Error | undefined)?.message === 'sse_idle_watchdog', String(h.opens[0]?.signal?.reason));
}

// ── WD-6 open 永不 resolve:看门狗自连接尝试起点到点(rev2 P1-3 时钟锚)→abort→既有重连路径 ──
{
  const opens: OpenRecord[] = [];
  const ac = new AbortController();
  const done = runInterviewStream({
    open: (lastEventId, signal) => new Promise<AsyncIterable<string>>((_, reject) => {
      opens.push({ lastEventId, signal });
      if (signal?.aborted) return reject(signal.reason ?? new Error('aborted'));
      signal?.addEventListener('abort', () => reject(signal.reason ?? new Error('aborted')), { once: true });
      // 永不 resolve:open 挂死面(逐 chunk 计时无从起表→时钟锚必须在连接尝试起点)
    }),
    onView: () => {},
    signal: ac.signal,
    idleTimeoutMs: 50,
    sleep: (ms) => sleep(Math.min(ms, 5)),   // 退避快放:open 再拨可见
  });
  void done.catch(() => undefined);
  const redialed = await until(() => opens.length >= 2, 2_000);
  A('WD-6.1 open 永不 resolve→看门狗自连接尝试起点到点→超时判负(时钟锚盖 await opts.open)', redialed);
  A('WD-6.2 超时 abort 传至 open 缝(signal.aborted)', opens[0]?.signal?.aborted === true);
  A('WD-6.3 驱动落既有重连路径(open 再拨)', opens.length >= 2, opens.length);
  ac.abort();   // 观测毕收尾:open#N pending 随 abort reject→驱动 return
}

console.log(`\n${failures === 0 ? '✓ sse-idle-watchdog: 6 臂全绿' : `✗ sse-idle-watchdog: ${failures} 失败`}`);
process.exit(failures === 0 ? 0 : 1);
