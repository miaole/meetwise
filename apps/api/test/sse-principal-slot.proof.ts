/**
 * HC-GAP-007: HTTP hijack proof that interview / quiz / diagnosis share
 * `sse:${principal}` cap=5. Sixth connection returns 429; rejected requests
 * do not enter the 2s poll loop.
 *
 * Real Fastify hijack on the production controllers and real `*.events()`.
 * `asPrincipal` is a **counting stub** (query always `{rowCount:1,rows:[]}`):
 * privacy / ownership / RLS SQL is short-circuited. This is not isolated
 * Postgres `DbService.asPrincipal`, not `api:validate`, not a cluster slot.
 * `pnpm sse-slot:prove`
 *
 * FIX-G3（P2-1 flaky 根因，已用时间线核实）：SSE 响应头要等泵第一次写（第一个 2s 周期后的
 * ping）才发出，所以 openSse 大约 2s 才 resolve。旧断言的窗口起点 = userB 那条连接打开之后
 * ≈ 4030ms，而 5 条 holder 的第 2 次轮询恰好落在 ≈ 4015–4020ms，只比窗口起点早 10–20ms。
 * 负载下这个先后一旦翻转，第 2、3 次轮询都落进 sleep(2100) 窗口，计数就变成 +6..+10，
 * 于是首跑红、单独重跑绿（时间线见 ai-docs/delivery/reviews/FIX-G3-ci-e2e-gate.md）。
 * 现改为：每条连接用独立 stream id 归因，轮询等待「每个 holder 至少完成 2 个轮询周期」
 * 这一条件，再同刻比对「counting stub 增量 = holder 轮询调用之和」，并断言被拒连接的
 * stream id 零调用。频率下界：观察窗为「各 holder ≥2 周期且自 t0 起不少于约 3500ms」，
 * 窗结束时每条 holder 轮询次数 ≤3（选次数上界，不受负载下计时拉长影响；间隔若退化为
 * 200ms 则会超 3 次）。不依赖固定窗口相位去数 +5，也没有加大 sleep。
 */
import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DiagnosisController } from '../src/modules/diagnosis/diagnosis.controller.ts';
import { DiagnosisService } from '../src/modules/diagnosis/diagnosis.service.ts';
import { InterviewController } from '../src/modules/interview/interview.controller.ts';
import { InterviewService } from '../src/modules/interview/interview.service.ts';
import { QuizController } from '../src/modules/quiz/quiz.controller.ts';
import { QuizService } from '../src/modules/quiz/quiz.service.ts';
import { AllExceptionsFilter } from '../src/platform/all-exceptions.filter.ts';
import { DbService } from '../src/platform/db.service.ts';
import { PrincipalGuard } from '../src/platform/principal.guard.ts';
import { RateLimitService } from '../src/platform/rate-limit.service.ts';
import { getSseNotify, type SseNotifyService } from '../src/platform/sse-notify.service.ts';
import { pumpSseEvents, type SsePumpOptions } from '../src/platform/sse-pump.ts';
import { createSseRegistry } from '../src/platform/sse-registry.ts';

process.env.AUTH_DEV_HEADER = '1';
// PR243 小门B：proof 自封闭（hermetic），不依赖「环境里的库是否可达」。
// SSE notify 单例在 import 期就可能被启动（principal.guard 模块加载时 onPrincipalEvict → whenHealthy → createPool），
// 早于本文件任何语句，所以剥库目标环境变量必须在进程入口做：`prove:sse-slot` 脚本用 `env -u DATABASE_URL -u PG*` 启动。
// 库可达时单例会建 LISTEN；空库 / 缺 0143 trigger 时降级退避重连并 wakeAllWaiters，holder 额外轮询，
// 触发「每 holder ≤3 次」下界（CI run 42947057277、本地可达空库 ×3 均 4 次）。这里 fail-loud：带库环境直接跑即红。
const DB_TARGET_ENV = ['DATABASE_URL', 'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'] as const;
const leakedDbEnv = DB_TARGET_ENV.filter((k) => (process.env[k] ?? '') !== '');
if (process.env.NODE_ENV === 'production') process.env.NODE_ENV = 'test';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 条件轮询（25ms 步长，超时返回最终判定）：替代「固定 sleep 后断言」的时序赌注。 */
async function waitUntil(cond: () => boolean, timeoutMs: number, stepMs = 25): Promise<boolean> {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (cond()) return true;
    await sleep(stepMs);
  }
  return cond();
}

function createCountingDb() {
  const byPrincipal = new Map<string, number>();
  return {
    byPrincipal,
    calls(principal: string): number {
      return byPrincipal.get(principal) ?? 0;
    },
    asPrincipal: async <T>(user: string, fn: (c: { query: (...args: unknown[]) => Promise<{ rowCount: number; rows: unknown[] }> }) => Promise<T>): Promise<T> => {
      byPrincipal.set(user, (byPrincipal.get(user) ?? 0) + 1);
      return fn({
        query: async () => ({ rowCount: 1, rows: [] }),
      });
    },
  };
}

function slotCount(rl: RateLimitService, key: string): number {
  return (rl as unknown as { slots: Map<string, number> }).slots.get(key) ?? 0;
}

type HeldStream = {
  ac: AbortController;
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
};

async function openSse(base: string, path: string, user: string): Promise<{
  status: number;
  contentType: string;
  hold: HeldStream | undefined;
  body: unknown;
}> {
  const ac = new AbortController();
  const res = await fetch(base + path, { headers: { 'x-user-id': user }, signal: ac.signal });
  const contentType = res.headers.get('content-type') ?? '';
  if (res.status === 200 && contentType.includes('text/event-stream') && res.body) {
    const reader = res.body.getReader();
    void reader.read().catch(() => undefined); // drain first chunk so ping writes do not stall
    return { status: res.status, contentType, hold: { ac, reader }, body: undefined };
  }
  // Read the JSON envelope before aborting — aborting first yields {} and hides too_many_streams.
  const body = await res.json().catch(() => ({}));
  ac.abort();
  return { status: res.status, contentType, hold: undefined, body };
}

async function release(hold: HeldStream | undefined): Promise<void> {
  if (!hold) return;
  hold.ac.abort();
  try { await hold.reader?.cancel(); } catch { /* already closed */ }
}

/**
 * 空流 attach 头即时可见锁（HA 沙箱 V5 / sse-pump flushHeaders）。
 * 假 raw 复刻 Node 语义：writeHead 只入队，flushHeaders / 首次 write / end 才对客户端可见。
 * 去掉 flushHeaders 后本段必红（首事件/健康兜底 ping 之前客户端仍无 200 头）。
 */
async function flushHeadersAttachProof(): Promise<void> {
  const queued: { status?: number; headers?: Record<string, string> } = {};
  let clientStatus = 0;
  let clientHeaders: Record<string, string> | null = null;
  let flushCalls = 0;
  const frames: string[] = [];
  const closeListeners: Array<() => void> = [];
  const flushToClient = () => {
    if (clientHeaders) return;
    clientStatus = queued.status ?? 0;
    clientHeaders = { ...(queued.headers ?? {}) };
  };
  const raw = {
    writeHead(code: number, h: Record<string, string>) {
      queued.status = code;
      queued.headers = h;
    },
    flushHeaders() {
      flushCalls += 1;
      flushToClient();
    },
    write(chunk: string) {
      flushToClient();
      frames.push(chunk);
      return true;
    },
    end() { flushToClient(); },
    on(_event: string, _listener: () => void) { /* drain 可选 */ },
  };
  const notify = {
    health: () => ({ healthy: true }),
    waitFor: () => ({ promise: new Promise<void>(() => { /* hang until close */ }), dispose() {} }),
  } as unknown as SseNotifyService;
  const registry = createSseRegistry();
  let fetchCalled = false;
  const done = pumpSseEvents({
    reply: { hijack() {}, raw } as never,
    reqRaw: { on(event: 'close', listener: () => void) { if (event === 'close') closeListeners.push(listener); } },
    streamKey: 'flush-headers-empty',
    initial: { lastId: 0, rows: [] },
    fetchMore: async () => { fetchCalled = true; return { rows: [] }; },
    isTerminal: () => false,
    notify,
    registry,
    fallbackMsHealthy: 30_000,
  } as SsePumpOptions);
  // writeHead + flushHeaders 在泵的第一处 await 之前同步执行，至此头必须已对客户端可见。
  A('空流 attach：flushHeaders 已调用', flushCalls >= 1);
  A('空流 attach：客户端在任何事件之前即收到 200', clientStatus === 200 && frames.length === 0 && fetchCalled === false);
  // 拷到新对象：clientHeaders 由闭包赋值，TS 控制流仍视为 null，直接 === 会报 TS2367。
  const visible: Record<string, string> = { ...(clientHeaders ?? {}) };
  A('空流 attach：响应头含 text/event-stream + cache-control + x-accel-buffering=no',
    clientHeaders !== null
    && (visible['content-type'] ?? '').includes('text/event-stream')
    && (visible['cache-control'] ?? '').includes('no-cache')
    && visible['x-accel-buffering'] === 'no');
  const pumpSrc = readFileSync(fileURLToPath(new URL('../src/platform/sse-pump.ts', import.meta.url)), 'utf8');
  A('源级：writeHead 之后显式 flushHeaders（删行/注释掉即本锁红）', /writeHead\([\s\S]{0,2000}?^\s*reply\.raw\.flushHeaders\?\.\(\);/m.test(pumpSrc));
  for (const listener of closeListeners) listener();
  await done;
  A('空流 attach：清理后 registry 归零', registry.count() === 0);
}

async function main() {
  await flushHeadersAttachProof();

  const db = createCountingDb();
  const rl = new RateLimitService();
  const interviews = new InterviewService(db as unknown as DbService, rl, {} as never, {} as never, { id: 'disabled' } as never);
  const quizzes = new QuizService(db as unknown as DbService);
  const diagnoses = new DiagnosisService(db as unknown as DbService);

  // Catch-up = first events() (no Last-Event-ID). Poll = loop with String(lastSeq).
  // Holders polling must not increment catchUp; UC184: rejected connections pay zero catch-up (拒连已零付), so the count is not racy.
  const catchUp = new Map<string, number>();
  const pollCalls = new Map<string, number>();
  // FIX-G3：按 `${principal}|${streamId}` 归因（每条连接独立 stream id），可逐连接判定谁在轮询。
  const catchUpByStream = new Map<string, number>();
  const pollByStream = new Map<string, number>();
  const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  const wrapEvents = (svc: { events: (principal: string, id: string, lastEventId?: string) => unknown }) => {
    const orig = svc.events.bind(svc);
    svc.events = (principal: string, id: string, lastEventId?: string) => {
      const isCatchUp = lastEventId === undefined;
      bump(isCatchUp ? catchUp : pollCalls, principal);
      bump(isCatchUp ? catchUpByStream : pollByStream, `${principal}|${id}`);
      return orig(principal, id, lastEventId);
    };
  };
  const streamCalls = (k: string) => (catchUpByStream.get(k) ?? 0) + (pollByStream.get(k) ?? 0);
  const pollSum = (principal: string) => [...pollByStream.entries()]
    .filter(([k]) => k.startsWith(`${principal}|`))
    .reduce((n, [, v]) => n + v, 0);
  wrapEvents(interviews);
  wrapEvents(quizzes);
  wrapEvents(diagnoses);

  @Module({
    controllers: [InterviewController, QuizController, DiagnosisController],
    providers: [
      PrincipalGuard,
      { provide: RateLimitService, useValue: rl },
      { provide: InterviewService, useValue: interviews },
      { provide: QuizService, useValue: quizzes },
      { provide: DiagnosisService, useValue: diagnoses },
      { provide: DbService, useValue: db },
    ],
  })
  class SseSlotProveModule {}

  const app = await NestFactory.create<NestFastifyApplication>(
    SseSlotProveModule,
    new FastifyAdapter(),
    { logger: false, abortOnError: false },
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const held: HeldStream[] = [];

  try {
    const userAHolds: HeldStream[] = [];
    // 每条连接独立 stream id（stub 对任意 id 都返回 rowCount=1，不改被测语义），便于逐连接归因。
    const holderStreams = ['iv-slot-1', 'iv-slot-2', 'iv-slot-3', 'qz-slot-1', 'qz-slot-2'];
    const rejectStreams = ['iv-reject', 'qz-reject', 'dx-reject'];
    const firstFive = await Promise.all([
      openSse(base, '/interview/iv-slot-1/events', 'userA'),
      openSse(base, '/interview/iv-slot-2/events', 'userA'),
      openSse(base, '/interview/iv-slot-3/events', 'userA'),
      openSse(base, '/quiz/qz-slot-1/events', 'userA'),
      openSse(base, '/quiz/qz-slot-2/events', 'userA'),
    ]);
    firstFive.forEach((r, i) => {
      const kind = i < 3 ? '面试' : '押题';
      A(`${kind} SSE 占槽 ${i < 3 ? i + 1 : i - 2}/5 → 200 text/event-stream`, r.status === 200 && r.contentType.includes('text/event-stream') && !!r.hold);
      if (r.hold) { userAHolds.push(r.hold); held.push(r.hold); }
    });
    A('打满 5 条后进程内槽计数 = 5', slotCount(rl, 'sse:userA') === 5);
    const [sixthIv, sixthQz, sixthDx] = await Promise.all([
      openSse(base, '/interview/iv-reject/events', 'userA'),
      openSse(base, '/quiz/qz-reject/events', 'userA'),
      openSse(base, '/diagnosis/dx-reject/events', 'userA'),
    ]);
    const sixthIvError = (sixthIv.body as { error?: string }).error;
    const sixthQzError = (sixthQz.body as { error?: string }).error;
    const sixthDxError = (sixthDx.body as { error?: string }).error;
    const isReject = (r: { status: number; contentType: string; hold: HeldStream | undefined }, error: string | undefined) =>
      r.status === 429 && error === 'too_many_streams' && !r.contentType.includes('text/event-stream') && !r.hold;
    A(`第 6 条同主体面试 → 429 too_many_streams（got ${sixthIv.status}/${sixthIvError ?? 'no-error'}）`, isReject(sixthIv, sixthIvError));
    A(`满额后再开押题（共享桶）→ 429 too_many_streams（got ${sixthQz.status}/${sixthQzError ?? 'no-error'}）`, isReject(sixthQz, sixthQzError));
    A(`满额后再开诊断（第三路共享桶）→ 429 too_many_streams（got ${sixthDx.status}/${sixthDxError ?? 'no-error'}）`, isReject(sixthDx, sixthDxError));
    A('三次拒绝后槽仍为 5（被拒连接未占槽）', slotCount(rl, 'sse:userA') === 5);
    A('溢出拒连零 catch-up（UC184 领槽先于取数·拒连不付取数副作用）', (catchUp.get('userA') ?? 0) === 5);

    const other = await openSse(base, '/interview/iv-slot/events', 'userB');
    A('异主体不受 userA 槽占用影响 → 200', other.status === 200 && !!other.hold);
    if (other.hold) held.push(other.hold);
    A('userB 自有槽 = 1', slotCount(rl, 'sse:userB') === 1);

    // Slot is acquired BEFORE the first events() (UC184): rejected requests pay zero catch-up then 429; they must not start a 2s loop.
    // FIX-G3：条件驱动替代「sleep(2100) 后恰 +5」。基线与终点都在同一同步段内取样
    // （events 包装器计数与 asPrincipal 计数在同一调用栈内递增），所以两者可精确对拍。
    const dbBase = db.calls('userA');
    const pollBase = pollSum('userA');
    const holderBase = new Map(holderStreams.map((s) => [s, pollByStream.get(`userA|${s}`) ?? 0]));
    const holderCycles = (s: string) => (pollByStream.get(`userA|${s}`) ?? 0) - (holderBase.get(s) ?? 0);
    // P2-1 频率下界：选「每 holder ≤3 次」（次数上界，不受机器负载下计时拉长影响）。
    // 观察窗必须同时满足 ≥2 周期且自 t0 起不少于约 3500ms——若只等 ≥2 就返回，200ms 间隔
    // 也会在约 400ms 时刚好各 +2，次数上界抓不到退化；3500ms 单独当退出条件又会因相位
    // （第一条周期可能在 t0 时已到期）在约 2000ms 就凑满 2 周期而误红。两者合用。
    const FREQ_WINDOW_MS = 3_500;
    const MAX_CYCLES_IN_WINDOW = 3;
    const t0 = Date.now();
    const everyHolderPolledTwice = await waitUntil(
      () => holderStreams.every((s) => holderCycles(s) >= 2) && Date.now() - t0 >= FREQ_WINDOW_MS,
      20_000,
    );
    const elapsedMs = Date.now() - t0;
    const dbDelta = db.calls('userA') - dbBase;
    const pollDelta = pollSum('userA') - pollBase;
    const holderDelta = holderStreams.reduce((n, s) => n + holderCycles(s), 0);
    const cycleSummary = holderStreams.map((s) => `${s}=${holderCycles(s)}`).join(',');
    A(`满额后 5 条 holder 各自完成 ≥2 个 poll 周期（${cycleSummary}）`, everyHolderPolledTwice);
    A(`counting stub(userA) 增量 = holder 轮询之和（stub +${dbDelta}，holders +${holderDelta}，userA 全部轮询 +${pollDelta}），无未归因轮询`, dbDelta === holderDelta && pollDelta === holderDelta && holderDelta >= 10);
    A(`每条 holder 在 ≥2 周期且 ≥${FREQ_WINDOW_MS}ms 观察窗结束时轮询 ≤${MAX_CYCLES_IN_WINDOW} 次（节律下界；间隔 200ms 会超；${cycleSummary}，elapsed=${elapsedMs}ms）`, everyHolderPolledTwice && holderStreams.every((s) => holderCycles(s) <= MAX_CYCLES_IN_WINDOW));
    const notifyHealth = getSseNotify().health();
    const notifyPool = (getSseNotify() as unknown as { pool?: unknown }).pool;
    A(`hermetic：进程无库目标环境变量（leaked=${leakedDbEnv.join(',') || 'none'}），SSE notify 未建 LISTEN 池、固定 listen_down 降级（health=${JSON.stringify(notifyHealth)}）`, leakedDbEnv.length === 0 && notifyPool === undefined && !notifyHealth.healthy && notifyHealth.reason === 'listen_down');
    A('被拒连接（iv/qz/dx-reject）零 catch-up、零轮询，不入环', rejectStreams.every((s) => streamCalls(`userA|${s}`) === 0));

    for (const h of userAHolds) await release(h);
    // FIX-G3：断开后等待条件（槽归零）而不是固定 sleep(2500)；槽在 pump 返回后的 finally 才释放，
    // 所以槽 = 0 即表示 userA 的全部轮询循环都已退出。
    const releasedToZero = await waitUntil(() => slotCount(rl, 'sse:userA') === 0, 10_000);
    A('userA holders 断开后槽释放为 0', releasedToZero && slotCount(rl, 'sse:userA') === 0);

    const afterRelease = db.calls('userA');
    await sleep(2100);
    A('释放后再等一个 poll 周期，counting stub(userA) 不再增加（拒连接未留下轮询）', db.calls('userA') === afterRelease);

    const reused = await openSse(base, '/diagnosis/dx-slot/events', 'userA');
    A('释放后诊断可再占槽 → 200', reused.status === 200 && !!reused.hold);
    if (reused.hold) held.push(reused.hold);
    A('释放后再占诊断，槽 = 1', slotCount(rl, 'sse:userA') === 1);

    await release(other.hold);
    await release(reused.hold);
  } finally {
    for (const h of held) await release(h);
    await app.close();
  }

  console.log(`\n${failures === 0 ? '✓ sse-slot 5+1 429 + shared principal bucket passed' : `✗ ${failures} failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
