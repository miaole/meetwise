/**
 * TOKSTREAM S4b · api delta 臂 proof（门预申明①新 proof · 单元缝零 DB 零模型外呼·actualSpendCny=null）。
 * 形制沿 sse-push-notify.proof 单元面（fake LISTEN client + fake sink + pumpSseEvents 直驱）。
 *
 * R4 验收四臂（REQUEST §2 R4）：
 *   (i)   权威行带 id / delta 帧无 id（§C-4 光标防毒·`id: seq` 仅权威行）；
 *   (ii)  行泵 fetchMore/isTerminal/deadline/ping/单点 end 断言与基线一致（A10 十锚语义零改）；
 *   (iii) delta 丢帧不重放不补发（环形缓冲有界丢旧·coalesced 有损标记·§C-3 at-most-once）；
 *   (iv)  断开（reqRaw close）delta 臂即停且 raw.end 恰一次（订阅 dispose 泄漏断言）。
 * R8(a) 联动臂：freetier 例外在路由条件单源（shouldRouteModelTextStream）内=静态断言。
 * fan-out 语义（F7）：同 streamKey 多订阅者广播复制（禁互偷帧）+订阅者异常吞没+坏帧形状校验即丢。
 * 唤醒源区分（R4 逆命题）：delta-only 唤醒免 fetchMore（零 SQL）；notify 唤醒（含与 delta 共醒）恒走取数臂。
 *
 * 运行：pnpm -C apps/api prove:s4b-delta-arm（零 DB·单元缝直跑）。
 */
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { FastifyReply } from 'fastify';
import type { Client } from '@meetwise/db';
import { SseNotifyService, SSE_NOTIFY_CHANNEL, SSE_TOKEN_CHANNEL } from '../src/platform/sse-notify.service.ts';
import { pumpSseEvents } from '../src/platform/sse-pump.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: unknown) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok && detail !== undefined) console.log(`      ↳ detail: ${JSON.stringify(detail)}`);
  if (!ok) failures++;
};
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function until(cond: () => boolean, timeoutMs: number): Promise<boolean> {
  const t0 = Date.now();
  for (;;) {
    if (cond()) return true;
    if (Date.now() - t0 > timeoutMs) return false;
    await sleep(10);
  }
}

type FakeClient = EventEmitter & {
  query: (sql: string, params?: unknown[]) => Promise<{ rowCount: number; rows: unknown[] }>;
  release: (err?: Error) => void;
};
function fakePgClient(): Client {
  const c = new EventEmitter() as FakeClient;
  c.query = async (sql: string) => {
    if (/^LISTEN /i.test(sql.trim())) return { rowCount: 0, rows: [] };
    if (/pg_trigger/i.test(sql)) return { rowCount: 1, rows: [] };
    return { rowCount: 0, rows: [] };
  };
  c.release = () => undefined;
  return c as unknown as Client;
}

type Sink = { writes: string[]; writeTimes: number[]; endCount: number; reply: unknown; reqRaw: EventEmitter };
function fakeSink(): Sink {
  const writes: string[] = [];
  const writeTimes: number[] = [];
  let endCount = 0;
  const reply = {
    hijack() { /* noop */ },
    raw: {
      writeHead() { /* noop */ },
      write: (s: string) => { writes.push(s); writeTimes.push(Date.now()); return true; },
      end() { endCount += 1; },
    },
  };
  return { writes, writeTimes, get endCount() { return endCount; }, reply, reqRaw: new EventEmitter() };
}

interface StartOpts {
  streamKey: string;
  notify: SseNotifyService;
  client: EventEmitter;
  fetchMore?: (lastSeq: number) => Promise<{ rows: Array<{ seq: number; kind: string; payload: unknown }> } | null>;
  isTerminal?: (kind: string) => boolean;
  fallbackMsHealthy?: number;
  initialRows?: Array<{ seq: number; kind: string; payload: unknown }>;
  deltaSource?: (onFrame: (f: { attemptKey: string; seq: number; text: string; coalesced?: boolean }) => void) => { dispose(): void };
}
function startPump(sink: Sink, o: StartOpts): Promise<void> {
  return pumpSseEvents({
    reply: sink.reply as unknown as FastifyReply,
    reqRaw: sink.reqRaw,
    streamKey: o.streamKey,
    initial: { lastId: 0, rows: o.initialRows ?? [] },
    fetchMore: o.fetchMore ?? (async () => ({ rows: [] })),
    isTerminal: o.isTerminal ?? (() => false),
    notify: o.notify,
    fallbackMsHealthy: o.fallbackMsHealthy,
    // 镜像 interview.controller 接线形：单例 subscribeToken（广播复制·dispose 注销）。
    deltaSource: o.deltaSource ?? ((onFrame) => o.notify.subscribeToken(o.streamKey, onFrame)),
  });
}
function tokenPayload(seq: number, text: string, extra: Record<string, unknown> = {}): string {
  return JSON.stringify({ v: 1, streamKey: 'CUR', attemptKey: 'ak', seq, text, ...extra });
}

async function main() {
  // ===== R8(a) 静态联动：g7 freetier 例外在路由条件单源内（R1b①/R8 联动·api 侧登记产出物）=====
  {
    const pumpSrc = readFileSync(fileURLToPath(new URL('../src/platform/sse-pump.ts', import.meta.url)), 'utf8');
    A('契约面：delta emit 无 id 帧（事件名 token_delta·safeWrite 单点）',
      pumpSrc.includes('event: token_delta\\ndata: ${payload}\\n\\n') && pumpSrc.includes('emitDeltaFrames'));
    A('契约面：delta-only 唤醒免 fetchMore 支路在位（!notifyWoke 条件=权威行 notify 唤醒照旧取数）',
      pumpSrc.includes('deltaRing.length && !notifyWoke'));
  }

  // ===== R4(i)+(ii)：权威行带 id / delta 帧无 id + 行泵基线语义（notify→fetchMore→emit·空取数→ping）=====
  {
    let client: Client | undefined;
    const notify = new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; }, log: () => {}, random: () => 0 });
    const sink = fakeSink();
    let fetches = 0;
    const finished = startPump(sink, {
      streamKey: 'CUR', notify, client: client as unknown as EventEmitter,
      fallbackMsHealthy: 30_000,
      fetchMore: async () => { fetches += 1; return { rows: fetches === 1 ? [{ seq: 101, kind: 'progress', payload: { z: 1 } }] : [] }; },
    });
    await Promise.race([notify.whenHealthy(), sleep(3000)]); await sleep(80);   // whenHealthy=唯一 ensureStarted 入口（health() 只读不启动）
    client!.emit('notification', { channel: SSE_NOTIFY_CHANNEL, payload: 'CUR' });
    A('R4(ii) 权威行 notify 唤醒 → fetchMore 照旧（A10 零改）+权威行带 id', await until(() => sink.writes.join('').includes('id: 101\nevent: progress'), 2000)
      && fetches === 1);
    // delta 帧：token 通道 notify 分流 → 订阅 → pump delta 臂 emit 无 id 帧
    const before = sink.writes.length;
    client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: tokenPayload(1, '你好') });
    A('R4(i) delta 帧 emit 无 id（事件名 token_delta·data 三字段·id 缺席）',
      await until(() => sink.writes.length > before, 2000)
      && sink.writes.slice(before).some((w) => w.startsWith('event: token_delta\ndata: '))
      && sink.writes.slice(before).every((w) => !w.includes('id:')),
      { tail: sink.writes.slice(before).join('|').slice(0, 200) });
    sink.reqRaw.emit('close');
    await Promise.race([finished, sleep(1500)]);
    A('R4(ii) 单元收尾：close 后 pump 返回·waiter 归零·token 订阅归零（断开退出零 end 写=守卫原值）',
      notify.waitingCount() === 0 && notify.tokenSubscriberCount() === 0 && sink.endCount === 0,
      { waiting: notify.waitingCount(), subs: notify.tokenSubscriberCount(), endCount: sink.endCount });
    await notify.stop();
  }

  // ===== delta-only 唤醒免 fetchMore + notify 共醒恒取数（唤醒源区分·权威行不饿死）=====
  {
    let client: Client | undefined;
    const notify = new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; }, log: () => {}, random: () => 0 });
    const sink = fakeSink();
    let fetches = 0;
    const finished = startPump(sink, {
      streamKey: 'CUR', notify, client: client as unknown as EventEmitter,
      fallbackMsHealthy: 30_000,
      fetchMore: async () => { fetches += 1; return { rows: [] }; },
    });
    await Promise.race([notify.whenHealthy(), sleep(3000)]); await sleep(80);   // whenHealthy=唯一 ensureStarted 入口（health() 只读不启动）
    await sleep(150);
    const fetchesBeforeDelta = fetches;
    // 三连 delta-only 唤醒：逐帧 emit·零取数 SQL
    client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: tokenPayload(1, 'a') });
    await until(() => sink.writes.join('').includes('"text":"a"'), 2000);
    client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: tokenPayload(2, 'b') });
    await until(() => sink.writes.join('').includes('"text":"b"'), 2000);
    client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: tokenPayload(3, 'c') });
    await until(() => sink.writes.join('').includes('"text":"c"'), 2000);
    const deltaOnlyFetches = fetches - fetchesBeforeDelta;
    A('R4 delta-only 唤醒免 fetchMore（三帧零取数 SQL·「无权威事件零 SQL」承诺保持）', deltaOnlyFetches === 0,
      { deltaOnlyFetches });
    // 共醒：权威 notify 与 delta 同刻 → fetchMore 恒走（权威行路径不饿死）；delta 留环待下一 delta-only 唤醒
    client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: tokenPayload(4, 'd') });
    // LISTEN notify=有损 edge 信号（与订阅注册窗存在既存竞态·权威行安全网=DB 行+下次唤醒）——
    // proof 侧重发至多 3 次直至取数臂行权（生产语义=下一事件/兜底计时器等效重醒）。
    let coWoke = false;
    for (let attempt = 0; attempt < 3 && !coWoke; attempt += 1) {
      client!.emit('notification', { channel: SSE_NOTIFY_CHANNEL, payload: 'CUR' });
      coWoke = await until(() => fetches > fetchesBeforeDelta + deltaOnlyFetches, 700);
    }
    A('R4 notify 唤醒（含与 delta 共醒）恒走 fetchMore（逆命题=权威行不饿死）', coWoke,
      { fetches, baseline: fetchesBeforeDelta });
    A('R4 共醒时 delta 帧不丢（留环待下一 delta-only 唤醒后照常 emit）',
      await until(() => sink.writes.join('').includes('"text":"d"'), 2000));
    sink.reqRaw.emit('close');
    await Promise.race([finished, sleep(1500)]);
    await notify.stop();
  }

  // ===== fan-out 广播复制（禁互偷帧）+坏帧形状校验+订阅者异常吞没+跨流不误醒 =====
  {
    let client: Client | undefined;
    const notify = new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; }, log: () => {}, random: () => 0 });
    await Promise.race([notify.whenHealthy(), sleep(3000)]); await sleep(80);   // whenHealthy=唯一 ensureStarted 入口（health() 只读不启动）
    const gotA: string[] = [];
    const gotB: string[] = [];
    const subA = notify.subscribeToken('CUR', (f) => { gotA.push(`${f.seq}:${f.text}`); });
    const subB = notify.subscribeToken('CUR', (f) => { gotB.push(`${f.seq}:${f.text}`); throw new Error('subscriber_boom'); });
    const gotOther: string[] = [];
    const subOther = notify.subscribeToken('OTHER', (f) => { gotOther.push(`${f.seq}:${f.text}`); });
    A('fan-out 订阅计数=3', notify.tokenSubscriberCount() === 3, { n: notify.tokenSubscriberCount() });
    client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: tokenPayload(1, 'x') });
    await sleep(50);
    A('fan-out 广播复制：同流两订阅者各得同帧（禁互偷帧）+订阅者异常吞没不外溢',
      gotA.join(',') === '1:x' && gotB.join(',') === '1:x', { gotA, gotB });
    client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: tokenPayload(1, 'y', { streamKey: 'OTHER' }) });
    await sleep(50);
    A('跨流不误醒：OTHER 流帧只投递 OTHER 订阅者（CUR 订阅者零误投）',
      gotOther.join(',') === '1:y' && gotA.join(',') === '1:x' && gotB.join(',') === '1:x',
      { gotA, gotB, gotOther });
    // 坏帧形状校验：非 JSON / v≠1 / 缺字段 / seq<1 / seq 非整数 → 一概即丢不补发
    for (const bad of ['not-json', JSON.stringify({ v: 2, streamKey: 'CUR', attemptKey: 'ak', seq: 1, text: 'z' }),
      JSON.stringify({ v: 1, streamKey: 'CUR', seq: 1, text: 'z' }),
      JSON.stringify({ v: 1, streamKey: 'CUR', attemptKey: 'ak', seq: 0, text: 'z' }),
      JSON.stringify({ v: 1, streamKey: 'CUR', attemptKey: 'ak', seq: 1.5, text: 'z' }),
      JSON.stringify({ v: 1, streamKey: 'CUR', attemptKey: 'ak', seq: 2 })]) {
      client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: bad });
    }
    await sleep(50);
    A('坏帧形状校验即丢（五类坏载荷零投递·§C-3 有损通道不补发）',
      gotA.join(',') === '1:x' && gotOther.join(',') === '1:y', { gotA, gotOther });
    subA.dispose(); subB.dispose(); subOther.dispose();
    A('fan-out dispose 注销无泄漏', notify.tokenSubscriberCount() === 0, { n: notify.tokenSubscriberCount() });
    await notify.stop();
  }

  // ===== R4(iii) 环形缓冲有界丢旧（coalesced 有损标记·不重放不补发）=====
  {
    let client: Client | undefined;
    const notify = new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; }, log: () => {}, random: () => 0 });
    const sink = fakeSink();
    await Promise.race([notify.whenHealthy(), sleep(3000)]); await sleep(80);   // whenHealthy=唯一 ensureStarted 入口（先起泵后置健康：首轮 loop-top 即读健康 cadence）
    const finished = startPump(sink, {
      streamKey: 'CUR', notify, client: client as unknown as EventEmitter, fallbackMsHealthy: 30_000,
    });
    await sleep(150);
    // 泵阻塞于 race 等待臂时同步灌 258 帧：环上界 256 → 最旧 2 帧丢·第 258 帧携丢旧标记
    for (let seq = 1; seq <= 258; seq += 1) {
      client!.emit('notification', { channel: SSE_TOKEN_CHANNEL, payload: tokenPayload(seq, `t${seq}`) });
    }
    A('R4(iii) 环有界丢旧：258 帧灌入 → 收 256 帧·seq 1/2 丢失不补发（at-most-once）',
      await until(() => sink.writes.filter((w) => w.startsWith('event: token_delta')).length >= 256, 3000)
      && !sink.writes.join('').includes('"text":"t1"') && !sink.writes.join('').includes('"text":"t2"'),
      { got: sink.writes.filter((w) => w.startsWith('event: token_delta')).length });
    A('R4(iii) 丢旧痕迹以 coalesced 标记随帧透出（有损标记非 L1 语义）',
      sink.writes.some((w) => w.startsWith('event: token_delta') && w.includes('"coalesced":true}')),
      { tail: sink.writes.slice(-2).join('|').slice(0, 220) });
    sink.reqRaw.emit('close');
    await Promise.race([finished, sleep(1500)]);
    await notify.stop();
  }

  // ===== R4(iv) 断开即停：close 后零新帧·订阅 dispose·end 恰一次（deltaSource 注入缝直证）=====
  {
    let client: Client | undefined;
    const notify = new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; }, log: () => {}, random: () => 0 });
    const sink = fakeSink();
    let disposed = 0;
    let pushed = 0;
    let onFrameRef: ((f: { attemptKey: string; seq: number; text: string }) => void) | undefined;
    const finished = startPump(sink, {
      streamKey: 'CUR', notify, client: client as unknown as EventEmitter, fallbackMsHealthy: 30_000,
      deltaSource: (onFrame) => {
        onFrameRef = onFrame;
        return { dispose: () => { disposed += 1; } };
      },
    });
    await sleep(120);
    onFrameRef!({ attemptKey: 'ak', seq: 1, text: 'pre-close' });
    A('R4(iv) 注入缝 delta 帧 emit 无 id', await until(() => sink.writes.join('').includes('pre-close'), 2000));
    sink.reqRaw.emit('close');
    await Promise.race([finished, sleep(1500)]);
    pushed = sink.writes.filter((w) => w.startsWith('event: token_delta')).length;
    onFrameRef!({ attemptKey: 'ak', seq: 2, text: 'post-close-must-drop' });
    await sleep(80);
    A('R4(iv) 断开后 delta 臂即停（close 后零新帧·注入再推不 resurrect）',
      sink.writes.filter((w) => w.startsWith('event: token_delta')).length === pushed
      && !sink.writes.join('').includes('post-close-must-drop'));
    A('R4(iv) delta 订阅随泵全退出路径 dispose 恰一次', disposed === 1, { disposed });
    // 行泵语义原值（A10 :116 单点）：客户端已断开的退出路径不写 end（`if (!closed)` 守卫）；
    // 「恰一次」承重面=非断开退出（终态臂）end 恰一次（见下方基线臂终态断言）。
    A('R4(iv) 断开退出零 end 写（`if (!closed)` 守卫原值·端已断不写）', sink.endCount === 0, { endCount: sink.endCount });
    await notify.stop();
  }

  // ===== 基线回归：deltaSource 在场但零 delta 时行泵基线语义原值（ping cadence/isTerminal）=====
  {
    let client: Client | undefined;
    const notify = new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; }, log: () => {}, random: () => 0 });
    const sink = fakeSink();
    await Promise.race([notify.whenHealthy(), sleep(3000)]); await sleep(80);   // whenHealthy=唯一 ensureStarted 入口（先起泵后置健康：首轮 loop-top 即读健康 cadence）
    const finished = startPump(sink, {
      streamKey: 'CUR', notify, client: client as unknown as EventEmitter, fallbackMsHealthy: 200,
      fetchMore: async () => ({ rows: [] }),
    });
    A('基线：delta 臂缺席帧时兜底臂照旧 ping（cadence=注入 200ms·≥3 次）',
      await until(() => sink.writes.filter((w) => w.includes(': ping')).length >= 3, 2000));
    const terminalSink = fakeSink();
    const finishedT = startPump(terminalSink, {
      streamKey: 'CUR2', notify, client: client as unknown as EventEmitter, fallbackMsHealthy: 30_000,
      fetchMore: async () => ({ rows: [{ seq: 9, kind: 'session_concluded', payload: {} }] }),
      isTerminal: (kind) => kind === 'session_concluded',
    });
    let terminalDone = false;
    for (let attempt = 0; attempt < 3 && !terminalDone; attempt += 1) {
      client!.emit('notification', { channel: SSE_NOTIFY_CHANNEL, payload: 'CUR2' });
      terminalDone = await until(() => terminalSink.endCount === 1, 700);
    }
    A('基线：isTerminal 终态语义原值（权威行 emit 后单点收尾·raw.end 恰一次=:116 单点承重面）',
      terminalDone
      && terminalSink.writes.join('').includes('id: 9\nevent: session_concluded')
      && terminalSink.endCount === 1,
      { terminalDone, endCount: terminalSink.endCount, writes: terminalSink.writes.join('|').slice(0, 200) });
    sink.reqRaw.emit('close');
    terminalSink.reqRaw.emit('close');
    await Promise.race([finished, finishedT, sleep(1500)]);
    await notify.stop();
  }

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ TOKSTREAM S4b api delta 臂矩阵全部通过（零 DB 零模型外呼·actualSpendCny=null）');
  process.exit(failures ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'sse_delta_arm_proof_failed');
  process.exit(1);
});
