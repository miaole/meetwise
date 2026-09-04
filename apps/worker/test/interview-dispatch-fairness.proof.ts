/**
 * Deterministic fairness contract (no IO): owner quantum rotation, process-local
 * global cap, fail-closed budget, retry vs idle, isolated slice rejection.
 * pnpm interview-dispatch:unit:prove
 */
import {
  DEFAULT_INTERVIEW_DISPATCH_BUDGET, DEFAULT_INTERVIEW_OWNER_LAUNCH_CAP,
  assertInterviewDispatchRemotePostgres, fairDrainInterviewOwners, readInterviewDispatchBudget,
} from '../src/interview-dispatch-fairness.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function main() {
  const queues = new Map<string, string[]>([
    ['owner-a', ['a1', 'a2', 'a3']],
    ['owner-b', ['b1']],
  ]);
  const order: string[] = [];
  const drain = async (_deps: unknown, owner: string): Promise<string> => {
    const next = queues.get(owner)?.shift();
    if (!next) return 'idle';
    order.push(next);
    return next;
  };
  const result = await fairDrainInterviewOwners(
    {}, ['owner-a', 'owner-b'], { perOwnerInflight: 1, globalInflight: 1 }, drain, (value) => value === 'idle',
  );
  A('TC-WORKER-002-main 轮转是 A,B,A,A 而不是 A,A,A,B', order.join(',') === 'a1,b1,a2,a3');
  A('领取计数等于四条作业', result.claimed === 4 && result.idleRounds >= 1);

  let invalid = false;
  try { readInterviewDispatchBudget({ WORKER_INTERVIEW_PER_OWNER_INFLIGHT: '0' }); }
  catch (error: any) { invalid = error?.message === 'WORKER_INTERVIEW_PER_OWNER_INFLIGHT_invalid'; }
  A('TC-WORKER-002-E5 非法 per-owner 失败关闭', invalid);
  let inverted = false;
  try { readInterviewDispatchBudget({ WORKER_INTERVIEW_PER_OWNER_INFLIGHT: '8', WORKER_INTERVIEW_GLOBAL_INFLIGHT: '2' }); }
  catch (error: any) { inverted = error?.message === 'interview_dispatch_budget_invalid'; }
  A('per-owner 大于 global 失败关闭', inverted);
  let scientific = false;
  try { readInterviewDispatchBudget({ WORKER_INTERVIEW_GLOBAL_INFLIGHT: '1e1' }); }
  catch (error: any) { scientific = error?.message === 'WORKER_INTERVIEW_GLOBAL_INFLIGHT_invalid'; }
  let decimal = false;
  try { readInterviewDispatchBudget({ WORKER_INTERVIEW_PER_OWNER_INFLIGHT: '1.0' }); }
  catch (error: any) { decimal = error?.message === 'WORKER_INTERVIEW_PER_OWNER_INFLIGHT_invalid'; }
  A('科学计数法和小数预算失败关闭', scientific && decimal);
  A('缺省预算是 1/4', DEFAULT_INTERVIEW_DISPATCH_BUDGET.perOwnerInflight === 1 && DEFAULT_INTERVIEW_DISPATCH_BUDGET.globalInflight === 4);

  let dockerDb = false;
  try { assertInterviewDispatchRemotePostgres({ E2E_ISOLATED: '1', PGHOST: '127.0.0.1', E2E_TEST_CONTAINER: 'meetwise-e2e-x' }); }
  catch (error: any) { dockerDb = error?.message === 'interview_dispatch_prove_forbids_local_docker_db'; }
  let composeHost = false;
  try { assertInterviewDispatchRemotePostgres({ E2E_CLOUD_ISOLATED: '1', PGHOST: 'postgres' }); }
  catch (error: any) { composeHost = error?.message === 'interview_dispatch_prove_forbids_local_docker_db'; }
  let loopbackAlias = false;
  try { assertInterviewDispatchRemotePostgres({ E2E_CLOUD_ISOLATED: '1', PGHOST: '127.0.0.2' }); }
  catch (error: any) { loopbackAlias = error?.message === 'interview_dispatch_prove_forbids_local_docker_db'; }
  let databaseUrl = false;
  try { assertInterviewDispatchRemotePostgres({ E2E_CLOUD_ISOLATED: '1', PGHOST: '10.0.0.8', DATABASE_URL: 'postgresql://meetwise@10.0.0.8/meetwise' }); }
  catch (error: any) { databaseUrl = error?.message === 'interview_dispatch_prove_forbids_database_url'; }
  let missingRemote = false;
  try { assertInterviewDispatchRemotePostgres({}); }
  catch (error: any) { missingRemote = error?.message === 'interview_dispatch_prove_requires_remote_postgres'; }
  let flagWithoutHost = false;
  try { assertInterviewDispatchRemotePostgres({ E2E_CLOUD_ISOLATED: '1' }); }
  catch (error: any) { flagWithoutHost = error?.message === 'interview_dispatch_prove_requires_remote_postgres'; }
  let remoteOk = true;
  try { assertInterviewDispatchRemotePostgres({ E2E_CLOUD_ISOLATED: '1', PGHOST: '10.0.0.8' }); }
  catch { remoteOk = false; }
  A(
    '远程配置门拒绝本地 Docker/loopback/DATABASE_URL，只接受远程标记（无库）',
    dockerDb && composeHost && loopbackAlias && databaseUrl && missingRemote && flagWithoutHost && remoteOk,
  );

  const empty = await fairDrainInterviewOwners({}, [], DEFAULT_INTERVIEW_DISPATCH_BUDGET, async () => 'idle', (value) => value === 'idle');
  A('空 owner 列表不领取', empty.claimed === 0 && empty.idleRounds === 0);

  let peak = 0;
  let inflight = 0;
  const concurrentOwners = ['o1', 'o2', 'o3', 'o4'];
  const left = new Map(concurrentOwners.map((owner) => [owner, 1]));
  const hold = new Promise<void>((resolve) => { setTimeout(resolve, 40); });
  const capped = await fairDrainInterviewOwners(
    {}, concurrentOwners, { perOwnerInflight: 1, globalInflight: 2 },
    async (_deps, owner) => {
      if ((left.get(owner) ?? 0) <= 0) return 'idle';
      inflight += 1;
      peak = Math.max(peak, inflight);
      await hold;
      left.set(owner, 0);
      inflight -= 1;
      return 'start';
    },
    (value) => value === 'idle',
  );
  A('进程内 global cap 恰好重叠到 2', peak === 2 && capped.claimed === 4);

  const starved: string[] = [];
  const deep = new Map<string, number>([['deep-a', 5], ['late-b', 1]]);
  await fairDrainInterviewOwners(
    {}, ['deep-a', 'late-b'], { perOwnerInflight: 1, globalInflight: 1 },
    async (_deps, owner) => {
      const n = deep.get(owner) ?? 0;
      if (n <= 0) return 'idle';
      deep.set(owner, n - 1);
      starved.push(owner);
      return 'start';
    },
    (value) => value === 'idle',
  );
  A('深队列 owner 不能在另一 owner 前被抽干', starved[0] === 'deep-a' && starved[1] === 'late-b');

  const retryCalls = { sticky: 0, other: 0 };
  await fairDrainInterviewOwners(
    {}, ['sticky', 'other'], { perOwnerInflight: 1, globalInflight: 1 },
    async (_deps, owner) => {
      if (owner === 'sticky') {
        retryCalls.sticky += 1;
        return retryCalls.sticky < 3 ? 'retry' : 'idle';
      }
      retryCalls.other += 1;
      return retryCalls.other === 1 ? 'start' : 'idle';
    },
    (value) => value === 'idle',
    (value) => value === 'retry',
  );
  A('retry 不踢出 owner 且另一 owner 仍被服务', retryCalls.sticky === 3 && retryCalls.other >= 1);

  let launchCount = 0;
  const cappedRetry = await fairDrainInterviewOwners(
    {}, ['loop'], { perOwnerInflight: 1, globalInflight: 1 },
    async () => {
      launchCount += 1;
      return 'retry';
    },
    (value) => value === 'idle',
    (value) => value === 'retry',
  );
  A('每拍每 owner launch cap 截断 retry 活锁', launchCount === DEFAULT_INTERVIEW_OWNER_LAUNCH_CAP && cappedRetry.claimed === 0);

  const survivors: string[] = [];
  let isolatedThrow = false;
  try {
    await fairDrainInterviewOwners(
      {}, ['ok', 'bad'], { perOwnerInflight: 1, globalInflight: 2 },
      async (_deps, owner) => {
        if (owner === 'bad') {
          await sleep(5);
          throw new Error('slice_boom');
        }
        await sleep(20);
        survivors.push(owner);
        return 'idle';
      },
      (value) => value === 'idle',
    );
  } catch (error: any) {
    isolatedThrow = error?.message === 'slice_boom';
  }
  A('切片拒绝等其他 in-flight 完成后再抛出', isolatedThrow && survivors.includes('ok'));

  console.log(`\n${failures === 0 ? '✓ interview dispatch fairness unit proof passed' : `✗ ${failures} failures`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
