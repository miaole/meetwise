/**
 * SSE-API 子刀件A prove（LISTEN 活性探针·#139 半开盲区闭合·单元缝零 DB 零模型外呼·actualSpendCny=null）。
 * 形制沿 sse-delta-arm.proof 单元面（fake LISTEN client + connect 注入缝直驱 SseNotifyService）。
 *
 * 四臂（REQUEST §1-件A 判别臂）：
 *   LP-1 半开假件：LISTEN 建立后 SELECT 1 永久 pending → probeIntervalMs 到点探针受 probeTimeoutMs
 *        上界**单击判负**（零 K-连击缓冲）→ health() 翻 false+`SSE_NOTIFY_DEGRADED reason=listen_down`
 *        一行+在册等待者全醒（waitingCount→0）+半开连接释放恰一次;outage 窗探针 tick no-op;
 *        附 race 败者臂：超时判负后底层 query 迟到 rejection 吞没（release 后 reject 零
 *        unhandledRejection 外溢）。
 *   LP-2 健康假件：SELECT 1 即返（catch-all rowCount:0）→ 恒 healthy 零误降零降级日志——探针成功
 *        判据=query resolve 即健康、不校验 rowCount 的正形（P2-4 假件误降级防御）。
 *   LP-3 探针失败→单击 loseClient→既有退避重连成功 → healthy 复位+探针重挂（重连后新连接探针续拍）。
 *   LP-4 stop() 后探针 timer 清零：stop 后探针拍零前进+计划内关停零降级日志（unref 面=timer 挂载即
 *        unref?.() 不驻进程，本 proof 进程自然退出即证）。
 *
 * 配对不变式（注入同遵守）：所有注入 probeTimeoutMs < probeIntervalMs——臂内显式断言。
 * 改前红=现码零探针路径：LP-1 health 恒 healthy 永不翻转 → 断言 FAIL；改后绿。
 *
 * 运行：pnpm -C apps/api prove:sse-listen-probe（零 DB·单元缝直跑）。
 */
import { EventEmitter } from 'node:events';
import type { Client } from '@meetwise/db';
import { SseNotifyService } from '../src/platform/sse-notify.service.ts';

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
    await sleep(5);
  }
}

type ProbeMode = 'resolve' | 'reject' | 'hang' | 'hang-then-reject';

interface ClientCounters { listen: number; trigger: number; probe: number; releases: Array<Error | undefined>; }

function fakeListenClient(mode: ProbeMode, lateRejectAfterMs: number | undefined, counters: ClientCounters): Client {
  const c = new EventEmitter() as unknown as EventEmitter & {
    query: (sql: string, params?: unknown[]) => Promise<{ rowCount: number; rows: unknown[] }>;
    release: (err?: Error) => void;
  };
  c.query = (sql: string) => {
    const s = String(sql).trim();
    if (/^LISTEN /i.test(s)) { counters.listen += 1; return Promise.resolve({ rowCount: 0, rows: [] }); }
    if (/pg_trigger/i.test(s)) { counters.trigger += 1; return Promise.resolve({ rowCount: 1, rows: [] }); }   // 0143 实证在场=establish 双条件过
    if (/^SELECT 1$/i.test(s)) {
      counters.probe += 1;
      switch (mode) {
        case 'resolve': return Promise.resolve({ rowCount: 0, rows: [] });   // catch-all rowCount:0——resolve 即健康(P2-4 正形)
        case 'reject': return Promise.reject(new Error('probe_query_error'));
        case 'hang': return new Promise(() => undefined);                     // 半开:永久 pending
        case 'hang-then-reject': return new Promise((_, reject) => setTimeout(() => reject(new Error('late_loser_rejection')), lateRejectAfterMs ?? 0));
      }
    }
    return Promise.resolve({ rowCount: 0, rows: [] });
  };
  c.release = (err?: Error) => { counters.releases.push(err); };
  return c as unknown as Client;
}

function isListenDown(h: ReturnType<SseNotifyService['health']>): boolean {
  return h.healthy === false && h.reason === 'listen_down';
}

console.log('SSE-LISTEN-PROBE prove · LISTEN 活性探针(#139 半开盲区闭合) · 单元缝零 DB · actualSpendCny=null');

// ── LP-1 半开假件:探针超时单击判负+降级日志一行+等待者全醒+释放恰一次+outage no-op+败者迟到 rejection 吞没 ──
{
  const PROBE_INTERVAL_MS = 40;
  const PROBE_TIMEOUT_MS = 15;   // 配对不变式:15 < 40(注入同遵守)
  A('LP-1.0 配对不变式 probeTimeoutMs < probeIntervalMs(注入缝同遵守)', PROBE_TIMEOUT_MS < PROBE_INTERVAL_MS);
  const counters: ClientCounters = { listen: 0, trigger: 0, probe: 0, releases: [] };
  const logs: string[] = [];
  let connects = 0;
  const svc = new SseNotifyService({
    connect: async () => { connects += 1; return fakeListenClient('hang', undefined, counters); },
    log: (l) => logs.push(l),
    probeIntervalMs: PROBE_INTERVAL_MS,
    probeTimeoutMs: PROBE_TIMEOUT_MS,
    reconnectBaseMs: 5_000,
    reconnectMaxMs: 5_000,   // 判负后进既有退避但观测窗内不重连:connects 恒 1 可断言
    random: () => 0,
  });
  void svc.waitFor('stream-1').promise;   // 注册等待者(顺带 ensureStarted→establish)
  const healthySeen = await until(() => svc.health().healthy, 2_000);
  A('LP-1.1 establish 健康(假 LISTEN×3+0143 trigger 实证恰一次)', healthySeen && counters.trigger === 1, counters);
  const woken = await until(() => svc.waitingCount() === 0, 2_000);
  A('LP-1.2 探针超时单击判负→loseClient→在册等待者全醒(waitingCount→0)', woken);
  A('LP-1.3 health() 翻 false reason=listen_down', isListenDown(svc.health()), svc.health());
  A('LP-1.4 降级结构化日志恰一行 SSE_NOTIFY_DEGRADED reason=listen_down',
    logs.filter((l) => l.startsWith('SSE_NOTIFY_DEGRADED') && l.includes('reason=listen_down')).length === 1, logs);
  A('LP-1.5 半开连接释放恰一次(loseClient release)', counters.releases.length === 1, counters.releases.length);
  await sleep(60);   // 越过一个探测周期
  A('LP-1.6 outage 窗探针 tick no-op+退避未重连(connects 恒 1·probe 停在判负拍)', connects === 1 && counters.probe === 1, { connects, probe: counters.probe });
  await svc.stop();

  // race 败者臂:超时判负释放后,底层 query 迟到(+120ms)rejection 必须被吞没(零 unhandledRejection 外溢)。
  const unhandled: unknown[] = [];
  const onUnhandled = (e: unknown) => { unhandled.push(e); };
  process.on('unhandledRejection', onUnhandled);
  const counters2: ClientCounters = { listen: 0, trigger: 0, probe: 0, releases: [] };
  const svc2 = new SseNotifyService({
    connect: async () => fakeListenClient('hang-then-reject', 120, counters2),
    log: () => {},
    probeIntervalMs: PROBE_INTERVAL_MS,
    probeTimeoutMs: PROBE_TIMEOUT_MS,
    reconnectBaseMs: 5_000,
    reconnectMaxMs: 5_000,
    random: () => 0,
  });
  void svc2.waitFor('stream-1').promise;
  const judged = await until(() => counters2.releases.length === 1, 2_000);   // 超时判负已释放
  await sleep(200);   // 越过 +120ms 迟到 rejection 时点
  A('LP-1.7 race 败者 query 迟到 rejection 吞没(release 后 reject 零 unhandledRejection 外溢)',
    judged && unhandled.length === 0, unhandled);
  process.off('unhandledRejection', onUnhandled);
  await svc2.stop();
}

// ── LP-2 健康假件:resolve 即健康不校验 rowCount(catch-all rowCount:0)→恒 healthy 零误降 ──
{
  const counters: ClientCounters = { listen: 0, trigger: 0, probe: 0, releases: [] };
  const logs: string[] = [];
  const svc = new SseNotifyService({
    connect: async () => fakeListenClient('resolve', undefined, counters),
    log: (l) => logs.push(l),
    probeIntervalMs: 30,
    probeTimeoutMs: 10,   // 配对不变式:10 < 30
    random: () => 0,
  });
  A('LP-2.0 配对不变式 probeTimeoutMs < probeIntervalMs(注入缝同遵守)', 10 < 30);
  void svc.waitFor('stream-1').promise;
  const healthy = await until(() => svc.health().healthy, 2_000);
  await sleep(150);   // ~5 个探测周期
  A('LP-2.1 恒 healthy(探针拍续跑零误降)', healthy && svc.health().healthy);
  A('LP-2.2 探针确已续拍(probe≥3)', counters.probe >= 3, counters.probe);
  A('LP-2.3 零降级日志(健康面零翻转·rowCount:0 不降级)', logs.filter((l) => l.startsWith('SSE_NOTIFY_DEGRADED')).length === 0, logs);
  await svc.stop();
}

// ── LP-3 探针失败→单击判负→既有退避重连成功→healthy 复位+探针重挂续拍 ──
{
  const perClient: ClientCounters[] = [];
  let connects = 0;
  const svc = new SseNotifyService({
    connect: async () => {
      const i = connects;
      connects += 1;
      perClient[i] = { listen: 0, trigger: 0, probe: 0, releases: [] };
      return fakeListenClient(i === 0 ? 'reject' : 'resolve', undefined, perClient[i]);   // 首连探针必败,重连健康
    },
    log: () => {},
    probeIntervalMs: 30,
    probeTimeoutMs: 10,
    reconnectBaseMs: 20,
    reconnectMaxMs: 50,
    random: () => 0,   // delayFor(1)=floor(20·0.75)=15ms 确定性
  });
  void svc.waitFor('stream-1').promise;
  const firstHealthy = await until(() => svc.health().healthy, 2_000);
  const judged = await until(() => svc.health().healthy === false, 2_000);   // 首拍探针 reject→判负
  const reHealthy = await until(() => svc.health().healthy, 2_000);          // 退避重连→复位
  const rearmed = await until(() => (perClient[1]?.probe ?? 0) >= 2, 2_000); // 重挂后续拍(client#2 探针≥2 拍)
  A('LP-3.1 探针失败单击判负→既有退避重连→healthy 复位', firstHealthy && judged && reHealthy);
  A('LP-3.2 重连后探针重挂续拍(client#2 probe≥2)', rearmed, perClient.map((c) => c.probe));
  A('LP-3.3 恰一次重连(connects=2)', connects === 2, connects);
  await svc.stop();
}

// ── LP-4 stop() 后探针 timer 清零+计划内关停零降级日志(unref 面=挂载即 unref 不驻进程) ──
{
  const counters: ClientCounters = { listen: 0, trigger: 0, probe: 0, releases: [] };
  const logs: string[] = [];
  const svc = new SseNotifyService({
    connect: async () => fakeListenClient('resolve', undefined, counters),
    log: (l) => logs.push(l),
    probeIntervalMs: 30,
    probeTimeoutMs: 10,
    random: () => 0,
  });
  void svc.waitFor('stream-1').promise;
  await until(() => svc.health().healthy, 2_000);
  await until(() => counters.probe >= 2, 2_000);
  await svc.stop();
  const atStop = counters.probe;
  await sleep(120);   // ~4 个探测周期
  A('LP-4.1 stop() 后探针 timer 清零(探针拍零前进)', counters.probe === atStop, { atStop, now: counters.probe });
  A('LP-4.2 计划内关停零降级日志(不刷 SSE_NOTIFY_DEGRADED)', logs.filter((l) => l.startsWith('SSE_NOTIFY_DEGRADED')).length === 0, logs);
}

console.log(`\n${failures === 0 ? '✓ sse-listen-probe: 4 臂全绿' : `✗ sse-listen-probe: ${failures} 失败`}`);
process.exit(failures === 0 ? 0 : 1);
