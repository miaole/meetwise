/**
 * Deterministic drain-order contract (no IO): quiz/diagnosis/report ticks
 * still drain one owner to idle before the next. This is not interview
 * quantum rotation. pnpm owner-drain-order:unit:prove
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { drainOwnersInListedOrder } from '../src/owner-queue-drain.ts';
import { fairDrainInterviewOwners } from '../src/interview-dispatch-fairness.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const readSrc = (rel: string) => readFileSync(
  fileURLToPath(new URL(rel, import.meta.url)), 'utf8',
);

async function drainRecord(
  queues: Map<string, string[]>,
  owners: readonly string[],
): Promise<{ order: string[]; claimed: number }> {
  const order: string[] = [];
  const result = await drainOwnersInListedOrder(
    {},
    owners,
    async (_deps, owner) => {
      const next = queues.get(owner)?.shift();
      if (!next) return 'idle';
      order.push(next);
      return next;
    },
    (value) => value === 'idle',
  );
  return { order, claimed: result.claimed };
}

async function main() {
  const sequential = await drainRecord(
    new Map([['owner-a', ['a1', 'a2', 'a3']], ['owner-b', ['b1']]]),
    ['owner-a', 'owner-b'],
  );
  A(
    'HC-GAP-002 当前领取顺序是 A,A,A,B（按 owner 抽干，不是轮转）',
    sequential.order.join(',') === 'a1,a2,a3,b1' && sequential.claimed === 4,
  );
  A(
    '当前顺序不是面试公平合同的 A,B,A,A',
    sequential.order.join(',') !== 'a1,b1,a2,a3',
  );

  const fairQueues = new Map([['owner-a', ['a1', 'a2', 'a3']], ['owner-b', ['b1']]]);
  const fairOrder: string[] = [];
  await fairDrainInterviewOwners(
    {},
    ['owner-a', 'owner-b'],
    { perOwnerInflight: 1, globalInflight: 1 },
    async (_deps, owner) => {
      const next = fairQueues.get(owner)?.shift();
      if (!next) return 'idle';
      fairOrder.push(next);
      return next;
    },
    (value) => value === 'idle',
  );
  A('对照：同一队列经 fairDrain 才是 A,B,A,A', fairOrder.join(',') === 'a1,b1,a2,a3');

  const empty = await drainOwnersInListedOrder({}, [], async () => 'idle', (value) => value === 'idle');
  A('空 owner 列表不领取', empty.claimed === 0);

  const single = await drainRecord(new Map([['only', ['x1', 'x2']]]), ['only']);
  A('单 owner 抽干到 idle，与“该 owner 排空”等价', single.order.join(',') === 'x1,x2' && single.claimed === 2);

  const listed = await drainRecord(
    new Map([['owner-a', ['a1', 'a2', 'a3']], ['owner-b', ['b1']]]),
    ['owner-b', 'owner-a'],
  );
  A('gateway 列出 [B,A] 时顺序是 B,A,A,A，不按插入改写', listed.order.join(',') === 'b1,a1,a2,a3');

  const afterFail: string[] = [];
  const remaining = new Map<string, number>([['owner-a', 2], ['owner-b', 1]]);
  await drainOwnersInListedOrder(
    {},
    ['owner-a', 'owner-b'],
    async (_deps, owner) => {
      const left = remaining.get(owner) ?? 0;
      if (left <= 0) return 'idle';
      remaining.set(owner, left - 1);
      afterFail.push(owner);
      return owner === 'owner-a' ? 'failed' : 'generate';
    },
    (value) => value === 'idle',
  );
  A(
    '非 idle（含 failed）仍留在当前 owner，不会提前轮到 B',
    afterFail.join(',') === 'owner-a,owner-a,owner-b',
  );

  let peak = 0;
  let inflight = 0;
  const left = new Map<string, number>([['o1', 1], ['o2', 1]]);
  const hold = new Promise<void>((resolve) => { setTimeout(resolve, 20); });
  await drainOwnersInListedOrder(
    {},
    ['o1', 'o2'],
    async (_deps, owner) => {
      if ((left.get(owner) ?? 0) <= 0) return 'idle';
      inflight += 1;
      peak = Math.max(peak, inflight);
      await hold;
      left.set(owner, 0);
      inflight -= 1;
      return 'done';
    },
    (value) => value === 'idle',
  );
  A('顺序抽干本拍不同时重叠两个 owner 的 drainOnce', peak === 1);

  const visits: string[] = [];
  await drainOwnersInListedOrder(
    {},
    ['owner-a', 'owner-b'],
    async (_deps, owner) => {
      visits.push(`drain:${owner}`);
      return 'idle';
    },
    (value) => value === 'idle',
    {
      beforeOwner: async (owner) => { visits.push(`before:${owner}`); },
      afterOwner: async (owner) => { visits.push(`after:${owner}`); },
    },
  );
  A(
    'before/after 仍夹在该 owner 抽干两侧（reap→drain→sweep 同形）',
    visits.join(',') === 'before:owner-a,drain:owner-a,after:owner-a,before:owner-b,drain:owner-b,after:owner-b',
  );

  let isolatedThrow = false;
  const survivors: string[] = [];
  try {
    await drainOwnersInListedOrder(
      {},
      ['bad', 'ok'],
      async (_deps, owner) => {
        if (owner === 'bad') throw new Error('owner_boom');
        survivors.push(owner);
        return 'idle';
      },
      (value) => value === 'idle',
    );
  } catch (error: any) {
    isolatedThrow = error?.message === 'owner_boom';
  }
  A('当前抽干遇拒绝即中断，后续 owner 本拍不 drain', isolatedThrow && survivors.length === 0);

  const quiz = readSrc('../src/quiz-consumer.ts');
  const diagnosis = readSrc('../src/diagnosis-consumer.ts');
  const report = readSrc('../src/report-worker.ts');
  const interview = readSrc('../src/interview-consumer.ts');
  A(
    '押题/诊断/报告生产 tick 走 drainOwnersInListedOrder',
    quiz.includes('drainOwnersInListedOrder')
      && diagnosis.includes('drainOwnersInListedOrder')
      && report.includes('drainOwnersInListedOrder'),
  );
  A(
    '押题/诊断/报告 tick 未接入 fairDrainInterviewOwners',
    !quiz.includes('fairDrainInterviewOwners')
      && !diagnosis.includes('fairDrainInterviewOwners')
      && !report.includes('fairDrainInterviewOwners'),
  );
  A('面试 tick 仍走 fairDrainInterviewOwners', interview.includes('fairDrainInterviewOwners'));

  const helper = readSrc('../src/owner-queue-drain.ts');
  A(
    '抽干实现声明自己不是面试量子轮转，也不写集群锁',
    helper.includes('not interview quantum rotation')
      && !helper.includes('cluster')
      && !/export async function fairDrain/.test(helper),
  );

  console.log(`\n${failures === 0 ? '✓ owner drain-order unit proof passed' : `✗ ${failures} failures`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
