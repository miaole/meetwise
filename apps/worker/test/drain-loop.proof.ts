/** 优雅排空证明(确定性,无 IO):stop() 等当前 tick 跑完再 resolve;停后不起新 tick。 pnpm drain:prove */
import { runDrainLoop } from '../src/drain-loop.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let started = 0, finished = 0, inflight = false;
  const loop = runDrainLoop(async () => { started++; inflight = true; await sleep(60); inflight = false; finished++; }, 5);
  await sleep(20);                                   // 让一个 tick 进行中
  A('有 tick 在飞', inflight === true && started >= 1);
  const startedAtStop = started;
  await loop.stop();                                 // stop 应等在飞 tick 跑完
  A('stop() 等当前 tick 排空完成(finished 追上)', inflight === false && finished === started);
  const afterStop = started;
  await sleep(30);
  A('停后不再起新 tick', started === afterStop && started === startedAtStop);

  console.log(`\n${fail === 0 ? '✓ 优雅排空(滚动部署不丢在飞 job)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
