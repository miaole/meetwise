/** 优雅排空证明(确定性,无 IO):stop() 等当前 tick 跑完再 resolve;停后不起新 tick。 pnpm drain:prove */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDrainLoop, TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS, INFLIGHT_READY_GRACE_MS } from '../src/drain-loop.ts';
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

  // 审计 #92：首拍成功门——启动初期（首拍成功前）不得宣称就绪（此前 lastSuccessAt 构造即置 now = fail-open）。
  let gatedTicks = 0;
  let releaseGated!: () => void;
  const gatedFirstTick = new Promise<void>((resolve) => { releaseGated = resolve; });
  const gated = runDrainLoop(async () => { gatedTicks++; await gatedFirstTick; }, 1_000);
  A('首拍门测试首个 tick 已开始且仍在飞（尚未成功）', await waitFor(() => gatedTicks === 1) && !gated.ready());
  A('#92 首拍成功前 ready()=false（启动窗 fail-closed）', gated.snapshot().consecutiveFailures === 0 && !gated.ready());
  releaseGated();
  A('#92 首拍成功后 ready()=true', await waitFor(() => gated.ready()));
  await gated.stop();

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

  // ── tick 看门狗臂组（挂起中断+自愈·正负双向·注入短值承载·零 env 零 IO） ────────────
  // 结构化 console.error 捕获（worker_tick_watchdog JSON 行）+ unhandledRejection 计数。
  const watchdogLogs: Array<{ event: string; hungMs: number; consecutiveFailures: number }> = [];
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const line = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    try {
      const parsed = JSON.parse(line) as { event: string; hungMs: number; consecutiveFailures: number };
      if (parsed?.event === 'worker_tick_watchdog') watchdogLogs.push(parsed);
    } catch { /* 非结构化行不计 */ }
    origConsoleError(...args);
  };
  let unhandledRejections = 0;
  const onUnhandledRejection = () => { unhandledRejections++; };
  process.on('unhandledRejection', onUnhandledRejection);

  // W1 定值 pin：缺省组与串行抽干组双常量落源（EXEC 定值机检）。
  A('watchdog 定值常量 pin（缺省组 600_000·串行抽干组 1_800_000）', TICK_WATCHDOG_DEFAULT_MS === 600_000 && SERIAL_DRAIN_TICK_WATCHDOG_MS === 1_800_000);

  // W2 正形：挂 tick 到点被具名中断→下一拍续跑（自愈）→计数经结构化日志在案。
  let hungCalls = 0;
  const hung = runDrainLoop(async () => { hungCalls++; if (hungCalls === 1) await new Promise<void>(() => {}); }, 5, { tickWatchdogMs: 40 });
  A('挂 tick 到点被看门狗中断且 loop 自愈（下一拍已续跑）', await waitFor(() => hungCalls >= 2, 1_000));
  A('挂死中断结构化日志字段在（event/hungMs=注入值/consecutiveFailures≥1）', watchdogLogs.length >= 1 && watchdogLogs[0]!.event === 'worker_tick_watchdog' && watchdogLogs[0]!.hungMs === 40 && watchdogLogs[0]!.consecutiveFailures >= 1);
  A('中断后自愈拍计数归零（既有成功臂承接·consecutiveFailures 回 0）', await waitFor(() => hung.snapshot().consecutiveFailures === 0, 500));
  A('自愈后 ready() 翻绿（挂死中断→下一拍成功→恢复就绪）', await waitFor(() => hung.ready(), 500));
  await hung.stop();

  // W3 正形：连续挂死 3 拍→既有 3 连败臂翻红（watchdog 供中断+计数增强·翻红由既有臂承载）。
  let redCalls = 0;
  const redFlow = runDrainLoop(async () => { redCalls++; await new Promise<void>(() => {}); }, 5, { tickWatchdogMs: 30 });
  A('连续挂死 3 拍 ready() 翻红（3 连败臂承接·watchdog 计数入臂）', await waitFor(() => !redFlow.ready() && redFlow.snapshot().consecutiveFailures >= 3, 1_000) && redCalls >= 3);
  void redFlow.stop().catch(() => {});   // 挂 tick 体 stop 等在飞——不 await（排水语义与改动前恒等）

  // W4 负形：正常短拍多拍稳态零误触发。
  let fastCalls = 0;
  const fastLogsBefore = watchdogLogs.length;
  const fast = runDrainLoop(async () => { fastCalls++; }, 5, { tickWatchdogMs: 40 });
  await sleep(200);   // ≈5× 注入 watchdog 窗口全为正常短拍
  A('正常短拍零误触发（多拍稳态 watchdog 触发计数 0·计时器清理无泄漏）', fastCalls >= 10 && watchdogLogs.length === fastLogsBefore);
  await fast.stop();

  // W5 负形：stop() 后挂 tick 零触发（排水路径零行为位移·stopped 短路在回调内查）。
  let stopHangCalls = 0;
  const stopHang = runDrainLoop(async () => { stopHangCalls++; await new Promise<void>(() => {}); }, 5, { tickWatchdogMs: 30 });
  await waitFor(() => stopHangCalls === 1);
  const stopHangLogsBefore = watchdogLogs.length;
  void stopHang.stop().catch(() => {});  // 不 await:排水等在飞 tick（永不 settle）语义与改动前恒等
  await sleep(120);                      // ≫ 注入 watchdog 30ms
  A('stop() 后挂 tick 零 watchdog 触发（排水路径零行为位移）', watchdogLogs.length === stopHangLogsBefore && stopHangCalls === 1);

  // W6 判别臂正形：超值长拍（慢 tick 墙钟>注入 watchdog）确被覆盖=误伤判别正向
  // +弃 tick 迟 settle（resolve 形）由 race 内建成员 handler 吸收=零 unhandledRejection。
  let slowCalls = 0;
  const slowStart = Date.now();
  const slow = runDrainLoop(async () => { slowCalls++; if (slowCalls === 1) await sleep(150); }, 5, { tickWatchdogMs: 40 });
  A('超值长拍正判别（慢 tick>watchdog 到点被中断·下一拍先行续跑）', await waitFor(() => slowCalls >= 2, 1_000));
  await sleep(Math.max(0, 250 - (Date.now() - slowStart)));   // 覆盖弃 tick 迟 resolve 点（≈起点+150ms）
  A('弃 tick 迟-RESOLVE 吸收形（race 成员内建 handler 吸收·零 unhandledRejection·loop 稳定）', slowCalls >= 2 && unhandledRejections === 0);
  await slow.stop();

  // W7 泄漏面披露臂：弃 tick 迟-REJECT 形（race 内建成员 handler 吸收=无 unhandledRejection）。
  let rejCalls = 0;
  const rejStart = Date.now();
  const rej = runDrainLoop(async () => { rejCalls++; if (rejCalls === 1) { await sleep(150); throw new Error('late_rejected_abandoned_tick'); } }, 5, { tickWatchdogMs: 40 });
  A('弃 tick 迟-REJECT 到达窗（watchdog 先中断·下一拍已续跑）', await waitFor(() => rejCalls >= 2, 1_000));
  await sleep(Math.max(0, 250 - (Date.now() - rejStart)));   // 覆盖迟 reject 点（≈起点+150ms）
  A('弃 tick 迟-REJECT 吸收形（race 成员内建 handler 吸收·零 unhandledRejection·loop 稳定）', rejCalls >= 2 && unhandledRejections === 0);
  await rej.stop();

  // W8 堆叠披露臂：连续慢拍→≥2 次具名中断（每触=+1 在飞弃 tick·loop 稳定续拍无崩溃）。
  let stackCalls = 0;
  const stackLogsBefore = watchdogLogs.length;
  const stack = runDrainLoop(async () => { stackCalls++; await sleep(120); }, 5, { tickWatchdogMs: 40 });
  await sleep(220);   // ≥2 个 watchdog 周期（40ms 中断+5ms 间隔/拍）
  const stackEvents = watchdogLogs.length - stackLogsBefore;
  A('重复触发堆叠披露（连续慢拍→≥2 具名中断·在飞弃 tick 随触累加·loop 稳定续拍）', stackEvents >= 2 && stackCalls >= stackEvents + 1);
  await stack.stop();

  // W9 日志逐事件字段完备（每触必登·非静默）。
  A('watchdog 结构化日志逐事件字段完备（event 恒名·hungMs 恒=注入定值·consecutiveFailures 恒≥1）', watchdogLogs.length >= 4 && watchdogLogs.every((l) => l.event === 'worker_tick_watchdog' && typeof l.hungMs === 'number' && l.hungMs > 0 && Number.isInteger(l.consecutiveFailures) && l.consecutiveFailures >= 1));

  // W10 B 组传参源级机检：三 runner 体内显式第三参（串行抽干组定值）恰等在源。
  const workerSrcRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
  const runnerSources = ['quiz-consumer.ts', 'diagnosis-consumer.ts', 'report-worker.ts'].map((f) => readFileSync(join(workerSrcRoot, f), 'utf8'));
  A('B 组三 runner 显式传参源级机检（SERIAL_DRAIN_TICK_WATCHDOG_MS 各恰 2 处=import+调用·tickWatchdogMs 传参形在源）', runnerSources.every((s) => (s.match(/SERIAL_DRAIN_TICK_WATCHDOG_MS/g) ?? []).length === 2 && /tickWatchdogMs:\s*SERIAL_DRAIN_TICK_WATCHDOG_MS/.test(s)));

  console.error = origConsoleError;
  process.off('unhandledRejection', onUnhandledRejection);
  A('watchdog 臂组全程零 unhandledRejection（race 成员内建 handler 吸收迟 settle 双形）', unhandledRejections === 0);

  // ── #158 ready() in-flight 陈旧豁免臂组（EXEC 定值·判别臂改前红·零 env 零 IO·墙钟 ~14-15s 登记在卷） ─────
  // 臂1 长拍豁免：首拍快成功（置 everSucceeded/lastSuccessAt）→第二拍合法长拍（~5.5s>
  // 陈旧窗 5s 下限·intervalMs=50 注入→窗=max(150, 5_000)=5s 下限）在飞越过陈旧点采样
  // ready()=true（在飞时长 ≤ INFLIGHT_READY_GRACE_MS=豁免）；改前（无豁免）陈旧臂直判
  // ready()=false=判别臂改前红。
  let longTicks = 0;
  let longTick2StartedAt = 0;
  const long = runDrainLoop(async () => {
    longTicks++;
    if (longTicks === 2) { longTick2StartedAt = Date.now(); await sleep(5_500); }
  }, 50);
  A('豁免臂1a 长拍已入飞（首拍成功+第二拍在飞·intervalMs=50→陈旧窗=5s 下限）', await waitFor(() => longTicks === 2, 1_000));
  await sleep(Math.max(0, longTick2StartedAt + 5_300 - Date.now()));   // 长拍内越过 5s 陈旧点（在飞第 ~5.3s）
  A('豁免臂1b 合法长拍在飞越过陈旧窗 ready() 恒绿（#158 在飞豁免·在飞时长 ≤ grace·改前陈旧臂直判 false=判别红）',
    long.ready() === true && long.snapshot().consecutiveFailures === 0);
  await long.stop();

  // 臂2 复红形（F2 定稿·独立 loop 实例）：首拍快成功 settle 后 tick 挂死（intervalMs=1000→
  // 窗=5s 下限·opts.tickWatchdogMs=3000 注入）——第 2/3 次看门狗中断间红隙采样：非在飞+
  // 陈旧（>5s）→ ready()=false 而 3 连败臂未满（cf<3）=闲置失联窗语义未废（豁免不外溢闲拍）。
  let hangSettleCalls = 0;
  let firstSettledAt = 0;
  const hangSettle = runDrainLoop(async () => {
    hangSettleCalls++;
    if (hangSettleCalls === 1) { firstSettledAt = Date.now(); return; }
    await new Promise<void>(() => {});
  }, 1_000, { tickWatchdogMs: 3_000 });
  A('豁免臂2a settle 后挂死进入第 2 次中断后红隙（cf≥2·距首拍成功 >5s 窗下限·墙钟 ~8-9s）',
    await waitFor(() => hangSettle.snapshot().consecutiveFailures >= 2, 15_000)
    && Date.now() - firstSettledAt > 5_000);
  A('豁免臂2b 中断间红隙采样：非在飞陈旧 ready()=false 且 cf<3（陈旧窗复效·窗语义未废）',
    !hangSettle.ready() && hangSettle.snapshot().consecutiveFailures < 3);
  void hangSettle.stop().catch(() => {});   // 挂 tick 体 stop 等在飞——不 await（排水语义与改动前恒等）

  // 臂3 grace 自限源级形：INFLIGHT_READY_GRACE_MS=Math.max(两组 watchdog 定值)=1_800_000
  // 在源（豁免窗 ≥watchdog 对缺省/串行两组建档·WHG 调值自动跟随）+ready() 豁免臂引用在
  // 源——运行时 1_800s 真睡不可行·Date 注入属签名面 Ban·如实披露源级形制。
  const drainLoopSrc = readFileSync(join(workerSrcRoot, 'drain-loop.ts'), 'utf8');
  A('豁免臂3 grace 常量源级形（=Math.max(DEFAULT,SERIAL)=1_800_000 在源+ready() 在飞豁免引用在源）',
    INFLIGHT_READY_GRACE_MS === Math.max(TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS)
    && INFLIGHT_READY_GRACE_MS === 1_800_000
    && /INFLIGHT_READY_GRACE_MS\s*=\s*Math\.max\(TICK_WATCHDOG_DEFAULT_MS,\s*SERIAL_DRAIN_TICK_WATCHDOG_MS\)/.test(drainLoopSrc)
    && /tickInFlight\s*&&\s*Date\.now\(\)\s*-\s*tickStartedAt\s*<=\s*INFLIGHT_READY_GRACE_MS/.test(drainLoopSrc));

  // 臂4 回归锚：三既存臂活体证——!stopped 臂（成功后 stop 即翻红·豁免不越停止臂）此处
  // 钉死；3 连败翻红/首拍门两臂同卷上方活跑（failing/gated 零改）。
  const anchor = runDrainLoop(async () => {}, 50);
  const anchorReady = await waitFor(() => anchor.ready(), 1_000);
  await anchor.stop();
  A('豁免臂4 回归锚（首拍成功 ready() 绿→stop 后 ready() 恒红=!stopped 臂活体证·3 连败/首拍门既有臂同卷零改活跑）',
    anchorReady && !anchor.ready());

  console.log(`\n${fail === 0 ? '✓ 优雅排空(滚动部署不丢在飞 job)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
