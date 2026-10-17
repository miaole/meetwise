/**
 * 可优雅排空的常驻循环（HA:滚动部署/重启不丢 job）。stop() **等当前 tick 跑完**再 resolve(排空),
 * 不在 job 半途砍进程。bootstrap 收到 SIGTERM → await stop() → 退出,在飞的 job 完整收尾。
 * tick 看门狗:tick 挂起（不 reject 不 resolve）到点被具名中断,loop 侧下一拍照跑——把
 * 「tick 挂=整个 loop 永久静默而进程健康」降为「单拍被弃+loop 全责复活」;合法长拍
 * （墙钟 ≤ 定值）零位移,stop 后看门狗不再触发（排水语义零触）。
 */
export interface DrainLoop {
  /** Coalesced edge trigger: never overlaps a tick and never carries job data. */
  wake(): void;
  stop(): Promise<void>;
  /** A live process with repeatedly failing, hung, or never-yet-succeeded work must not be "ready". */
  ready(): boolean;
  snapshot(): { consecutiveFailures: number; lastSuccessAt: number };
}

/**
 * tick 看门狗缺省定值（结构性有界 loop 组缺省）：真挂必触；合法深队列拍不误伤——
 * 该组单拍工作量受结构性深度护栏（enqueue 帽/退避节流/内部队列量级）界住，600s
 * 为运维网格基档。串行抽干 loop 组（quiz/diagnosis/report）经 opts.tickWatchdogMs
 * 显式改传 SERIAL_DRAIN_TICK_WATCHDOG_MS（深首 owner 占拍至 idle，深积压恢复窗单拍
 * 墙钟可达 30min 量级，600s 会误触）。
 */
export const TICK_WATCHDOG_DEFAULT_MS = 600_000;
/** 串行抽干 loop 组显式定值（30min）：代价=真挂检测时延上限 30min，远优于永久静默。 */
export const SERIAL_DRAIN_TICK_WATCHDOG_MS = 1_800_000;

/**
 * #158 ready() in-flight 陈旧豁免窗：拍在跑≠拍挂了——合法深拍墙钟可超 ready() 陈旧窗
 * （max(intervalMs*3, 5s)），在飞期间陈旧臂豁免，豁免时长以本窗为上界。取两组看门狗
 * 定值的 max（非独立 magic number）：豁免窗 ≥watchdog 对缺省组与串行抽干组均成立——
 * watchdog 到点中断→tick settle→标志复位→豁免终，真挂转 3 连败计数翻红（WHG 世界）；
 * 「no-WHG 世界」则挂死拍由本窗自限（30min）后陈旧臂复效翻红。WHG 调整任一定值时
 * 本窗自动跟随。
 */
export const INFLIGHT_READY_GRACE_MS = Math.max(TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS);

/** runDrainLoop 第三参：tick 看门狗墙钟（缺省 TICK_WATCHDOG_DEFAULT_MS）。 */
export interface DrainLoopOptions {
  tickWatchdogMs?: number;
}

/** 具名看门狗中断错（code=tick_watchdog_timeout·hungMs=定值墙钟）→流入既有 catch 臂。 */
function tickWatchdogTimeoutError(watchdogMs: number): Error & { code: string; hungMs: number } {
  return Object.assign(new Error(`worker tick hung: no settle within ${watchdogMs}ms (tick watchdog)`), {
    code: 'tick_watchdog_timeout',
    hungMs: watchdogMs,
  });
}

/**
 * tick 与看门狗竞速：tick 到点未 settle → 具名错 reject（既有 catch 臂承接=中断+计数，
 * 下一拍照跑=loop 自愈）。被弃 tick 迟 settle（resolve/reject 两形）由 Promise.race 对
 * 每个成员的内建 handler 吸收，不产生 unhandledRejection、其结果/异常一并弃置。
 */
async function raceWithTickWatchdog(
  tick: () => Promise<void>,
  watchdogMs: number,
  isStopped: () => boolean,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const watchdog = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      if (isStopped()) return;   // stop 短路：stop 后 watchdog 不再触发（排水语义零触）
      reject(tickWatchdogTimeoutError(watchdogMs));
    }, watchdogMs);
    (timer as { unref?: () => void }).unref?.();
  });
  try {
    await Promise.race([tick(), watchdog]);
  } finally {
    clearTimeout(timer);         // 败者计时器纪律：race 出结果必清，不留悬挂句柄
  }
}

export function runDrainLoop(tick: () => Promise<void>, intervalMs = 5000, opts?: DrainLoopOptions): DrainLoop {
  const watchdogMs = opts?.tickWatchdogMs ?? TICK_WATCHDOG_DEFAULT_MS;
  let stopped = false;
  let consecutiveFailures = 0;
  let lastSuccessAt = Date.now();
  let everSucceeded = false;    // 审计 #92：首拍成功门——启动初期（首拍成功前）一律不就绪（禁 fail-open）。
  let wakePending = true; // initial reconciliation must run before the first notification.
  let settleWait: (() => void) | undefined;
  let stopPromise: Promise<void> | undefined;
  // #158 in-flight 标志：await tick 前置位·同层 finally 复位（生命周期=迭代生命周期）——
  // ready() 陈旧臂据此豁免「拍在跑」；禁入 race 内部包 tick 成员（迟 settle 会跨迭代清标志）。
  let tickInFlight = false;
  let tickStartedAt = 0;

  const waitForWakeOrInterval = () => new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (settleWait === finish) settleWait = undefined;
      resolve();
    };
    const timer = setTimeout(finish, intervalMs);
    (timer as any).unref?.();
    settleWait = finish;
    // A wake/stop might land between the caller's condition and this handler
    // installation.  Consume it without waiting for the fallback interval.
    if (stopped || wakePending) finish();
  });

  const loop = (async () => {
    while (!stopped) {
      wakePending = false;
      // **tick 抛不停循环(可靠性硬化)**:未预期异常只记日志、下一拍重试,绝不让常驻循环静默死亡(=队列永久停滞却进程"健康")。
      // 各 tick 内部已尽量自吞按 owner 隔离;这里是最后一道兜底,契合北极星"快速恢复/优雅降级"。
      try {
        tickInFlight = true;      // #158：await 前置位（在飞豁免窗起点）
        tickStartedAt = Date.now();
        await raceWithTickWatchdog(tick, watchdogMs, () => stopped);
        consecutiveFailures = 0;
        lastSuccessAt = Date.now();
        everSucceeded = true;
      } catch (e) {
        consecutiveFailures++;
        if ((e as { code?: string } | null)?.code === 'tick_watchdog_timeout') {
          // 挂死中断结构化日志（每触必登·非静默）；hungMs=定值墙钟，consecutiveFailures 为本次计数后值。
          const hungMs = (e as { hungMs?: number }).hungMs ?? watchdogMs;
          console.error(JSON.stringify({ event: 'worker_tick_watchdog', hungMs, consecutiveFailures }));
        }
        console.error('drain tick error', e);
      } finally {
        tickInFlight = false;     // #158：同层 finally 复位——settle（成功/中断/抛错）即豁免窗终
      }
      if (!stopped && !wakePending) await waitForWakeOrInterval();
    }
  })();
  loop.catch((e) => console.error('drain loop error', e));
  return {
    wake() {
      if (stopped) return;
      wakePending = true;
      settleWait?.();
    },
    async stop() {
      if (!stopPromise) {
        stopped = true;
        settleWait?.(); // do not wait up to fallback reconciliation interval on SIGTERM.
        stopPromise = loop.catch(() => {});
      }
      await stopPromise;
    },   // 等循环(含在飞 tick)真正结束
    ready() {
      // 审计 #92：首拍成功门（everSucceeded）——此前 `lastSuccessAt` 构造时即置 now，
      // 启动初期零次成功也"就绪"（fail-open）。现在必须至少一拍真成功；其后 3 连败或
      // 陈旧窗（成功时刻距今 > max(intervalMs*3, 5s)）照旧判不就绪。
      // #158 in-flight 陈旧豁免：陈旧但拍在飞且在飞时长 ≤ INFLIGHT_READY_GRACE_MS →
      // 视为活动非失联（合法深拍墙钟可超窗）；settle 后照常落窗（闲置失联检测语义未废）。
      // 其余三臂（!stopped/首拍门/3 连败）零改。
      const stale = Date.now() - lastSuccessAt > Math.max(intervalMs * 3, 5_000);
      return !stopped && everSucceeded && consecutiveFailures < 3
        && (!stale || (tickInFlight && Date.now() - tickStartedAt <= INFLIGHT_READY_GRACE_MS));
    },
    snapshot() { return { consecutiveFailures, lastSuccessAt }; },
  };
}

// ── HA-2 · worker 排水上限与信号同链(REQUEST §1 W3 · §3 C5)─────────────────────

/** 排水相位:loop 相(等在飞 tick·先行)/deps 相(依赖面收尾·后行)。 */
export type DrainPhase = 'loop' | 'deps';

/** 具名排水项:name 进 worker_drain_timeout 日志(在飞 loop 可辨);stop 拒绝不拖垮 race。 */
export interface NamedStop {
  name: string;
  stop: () => Promise<void> | void;
  /** 排水相位:缺省 'loop'(先行);'deps' 后行——依赖面不在在飞 tick 仍需其服务时被拆。 */
  phase?: DrainPhase;
}

/** 两相份额:loop 相(先行)占 70%(向上取整),deps 相(后行)拿余量——两相份额和恒等
 *  timeoutMs,全程排水上限与单相时代恒等(30s 默认 → loop 21s/deps 9s)。 */
const LOOP_PHASE_SHARE = 0.7;

/**
 * W3①:排水与 deadline 竞速,胜者先行——**两阶段顺序排空**:先 loop 相(等在飞 tick
 * 完整收尾)后 deps 相(依赖面收尾),deps 相任一 stop 不在 loop 相结束(全 settle 或到点)
 * 前起跑,依赖面不再被排水窗提前拆台(在飞 retrieval/erasure 路径拒绝、遥测尾迹丢失)。
 * 每相=单相体原样下沉:per-phase pending Set + allSettled×deadline race + 败者计时器
 * 纪律。任一相到点 → 'timeout',onTimeout 收**该相**在飞未完名单+相位标签(结构化日志
 * worker_drain_timeout signal=… phase=… in_flight=…),调用方随即强退 exit 0——被弃 job
 * 走租约过期→reaper/sweep 重领(既有 crash-safe 语义,租约互斥保证不双跑)。纯时序件零
 * IO:proof 注入 fake stop/短超时确定性读数,不真睡 30s(deadline 计时器不 unref——进程
 * 生命周期必须被排水上限钉住,与 runDrainLoop 内部兜底臂的败者纪律相反:一个等败者、
 * 一个钉胜者)。
 */
export async function drainWithDeadline(
  stops: NamedStop[],
  timeoutMs: number,
  onTimeout?: (inFlight: string[], phase: DrainPhase) => void,
): Promise<'drained' | 'timeout'> {
  const loopStops = stops.filter((s) => s.phase !== 'deps');
  const depsStops = stops.filter((s) => s.phase === 'deps');
  const loopShare = Math.ceil(timeoutMs * LOOP_PHASE_SHARE);
  const depsShare = timeoutMs - loopShare;
  let timedOut = false;

  // 单相体原样下沉:本相 pending Set + allSettled×deadline race + 败者计时器纪律。
  const runPhase = async (phase: DrainPhase, phaseStops: NamedStop[], share: number): Promise<void> => {
    const pending = new Set(phaseStops.map((s) => s.name));
    let phaseTimedOut = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<void>((resolve) => {
      timer = setTimeout(() => {
        phaseTimedOut = true;
        resolve();
      }, share);
    });
    await Promise.race([
      Promise.allSettled(phaseStops.map(async (s) => {
        try {
          await s.stop();
        } finally {
          pending.delete(s.name);   // settle(含 reject)即在飞结束;reject 不外抛(allSettled 语义)
        }
      })),
      deadline,
    ]);
    clearTimeout(timer);            // 败者计时器纪律:race 出结果必清,不留悬挂句柄
    if (phaseTimedOut) {
      timedOut = true;
      onTimeout?.([...pending], phase);
    }
  };

  // 严格两相顺序:loop 相(等在飞 tick)先行→deps 相(依赖面收尾)后行,不并行。
  await runPhase('loop', loopStops, loopShare);
  await runPhase('deps', depsStops, depsShare);
  return timedOut ? 'timeout' : 'drained';
}

/**
 * W3③:SIGTERM/SIGINT 同链——两信号注册**同一** handler(本地 Ctrl+C 与容器 stop 同
 * 语义)。on 注入(默认 process.on):proof 用假注册表断言两信号 handler 等价。
 */
export function wireSignalShutdown(
  signals: readonly string[],
  handler: () => void,
  on: (signal: string, handler: () => void) => unknown = (signal, h) => process.on(signal as NodeJS.Signals, h),
): void {
  for (const signal of signals) on(signal, handler);
}
