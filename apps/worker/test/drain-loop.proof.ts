/** 优雅排空证明(确定性,无 IO):stop() 等当前 tick 跑完再 resolve;停后不起新 tick。 pnpm drain:prove */
import { runDrainLoop } from '../src/drain-loop.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function waitFor(predicate: () => boolean, timeoutMs = 500): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await sleep(2);
  }
  return predicate();
}

async function main() {
  let started = 0, finished = 0, inflight = false;
  const loop = runDrainLoop(async () => { started++; inflight = true; await sleep(60); inflight = false; finished++; }, 5);
  const isInflight = () => inflight;
  await sleep(20);                                   // 让一个 tick 进行中
  A('有 tick 在飞', isInflight() && started >= 1);
  const startedAtStop = started;
  await loop.stop();                                 // stop 应等在飞 tick 跑完
  A('stop() 等当前 tick 排空完成(finished 追上)', inflight === false && finished === started);
  const afterStop = started;
  await sleep(30);
  A('停后不再起新 tick', started === afterStop && started === startedAtStop);

  let failedTicks = 0;
  const failing = runDrainLoop(async () => { failedTicks++; throw new Error('injected_consumer_failure'); }, 5);
  await sleep(45);
  A('连续 3 次消费者失败时进程仍存活但 readiness（就绪检查）为 false', failedTicks >= 3 && !failing.ready() && failing.snapshot().consecutiveFailures >= 3);
  await failing.stop();

  let wakeTicks = 0;
  const wakeable = runDrainLoop(async () => { wakeTicks++; }, 1_000);
  A('初始 reconcile 会立刻执行', await waitFor(() => wakeTicks === 1));
  await sleep(15);
  const beforeWake = wakeTicks;
  const wakeStarted = Date.now();
  wakeable.wake();
  A('事件 wake 不等待 1 秒兜底扫描', await waitFor(() => wakeTicks === beforeWake + 1, 200) && Date.now() - wakeStarted < 200);
  await wakeable.stop();

  let coalescedTicks = 0;
  let releaseFirst!: () => void;
  const firstTick = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const coalesced = runDrainLoop(async () => {
    coalescedTicks++;
    if (coalescedTicks === 1) await firstTick;
  }, 1_000);
  A('合并测试首个 tick 已开始', await waitFor(() => coalescedTicks === 1));
  for (let i = 0; i < 20; i++) coalesced.wake();
  releaseFirst();
  A('同一在飞 tick 的重复 wake 只合并为一个后续 drain', await waitFor(() => coalescedTicks === 2));
  await sleep(30);
  A('合并 wake 不重叠或放大为多次 tick', coalescedTicks === 2);
  await coalesced.stop();

  let sleepingTicks = 0;
  const sleeping = runDrainLoop(async () => { sleepingTicks++; }, 1_000);
  A('stop 测试首个 tick 已完成', await waitFor(() => sleepingTicks === 1));
  await sleep(10);
  const stoppedAt = Date.now();
  await sleeping.stop();
  A('stop 会中断 fallback sleep，不等待完整扫描间隔', Date.now() - stoppedAt < 200);

  console.log(`\n${fail === 0 ? '✓ 优雅排空(滚动部署不丢在飞 job)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
