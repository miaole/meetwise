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
 */
import 'reflect-metadata';
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

process.env.AUTH_DEV_HEADER = '1';
if (process.env.NODE_ENV === 'production') process.env.NODE_ENV = 'test';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function main() {
  const db = createCountingDb();
  const rl = new RateLimitService();
  const interviews = new InterviewService(db as unknown as DbService, rl, {} as never, {} as never, { id: 'disabled' } as never);
  const quizzes = new QuizService(db as unknown as DbService);
  const diagnoses = new DiagnosisService(db as unknown as DbService);

  // Catch-up = first events() (no Last-Event-ID). Poll = loop with String(lastSeq).
  // Holders polling must not increment catchUp, so overflow catch-up +2 is not racy.
  const catchUp = new Map<string, number>();
  const pollCalls = new Map<string, number>();
  const wrapEvents = (svc: { events: (principal: string, id: string, lastEventId?: string) => unknown }) => {
    const orig = svc.events.bind(svc);
    svc.events = (principal: string, id: string, lastEventId?: string) => {
      const bucket = lastEventId === undefined ? catchUp : pollCalls;
      bucket.set(principal, (bucket.get(principal) ?? 0) + 1);
      return orig(principal, id, lastEventId);
    };
  };
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
    const firstFive = await Promise.all([
      openSse(base, '/interview/iv-slot/events', 'userA'),
      openSse(base, '/interview/iv-slot/events', 'userA'),
      openSse(base, '/interview/iv-slot/events', 'userA'),
      openSse(base, '/quiz/qz-slot/events', 'userA'),
      openSse(base, '/quiz/qz-slot/events', 'userA'),
    ]);
    firstFive.forEach((r, i) => {
      const kind = i < 3 ? '面试' : '押题';
      A(`${kind} SSE 占槽 ${i < 3 ? i + 1 : i - 2}/5 → 200 text/event-stream`, r.status === 200 && r.contentType.includes('text/event-stream') && !!r.hold);
      if (r.hold) { userAHolds.push(r.hold); held.push(r.hold); }
    });
    A('打满 5 条后进程内槽计数 = 5', slotCount(rl, 'sse:userA') === 5);
    const [sixthIv, sixthQz, sixthDx] = await Promise.all([
      openSse(base, '/interview/iv-slot/events', 'userA'),
      openSse(base, '/quiz/qz-slot/events', 'userA'),
      openSse(base, '/diagnosis/dx-slot/events', 'userA'),
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
    A('overflow 各付 1 次 catch-up（counting stub；不入环 ≠ 零调用）', (catchUp.get('userA') ?? 0) === 8);

    const other = await openSse(base, '/interview/iv-slot/events', 'userB');
    A('异主体不受 userA 槽占用影响 → 200', other.status === 200 && !!other.hold);
    if (other.hold) held.push(other.hold);
    A('userB 自有槽 = 1', slotCount(rl, 'sse:userB') === 1);

    // Slot is acquired after the first events()/asPrincipal (documented; this slice does not move it).
    // Rejected requests do one catch-up asPrincipal then 429; they must not start a 2s loop.
    const afterReject = db.calls('userA');
    await sleep(2100);
    const polled = db.calls('userA') - afterReject;
    A('满额后一个 poll 周期 counting stub(userA) 只 +5（holders），被拒连接不入环', polled === 5);

    for (const h of userAHolds) await release(h);
    await sleep(2500);
    A('userA holders 断开后槽释放为 0', slotCount(rl, 'sse:userA') === 0);

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
