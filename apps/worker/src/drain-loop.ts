/**
 * 可优雅排空的常驻循环（HA:滚动部署/重启不丢 job）。stop() **等当前 tick 跑完**再 resolve(排空),
 * 不在 job 半途砍进程。bootstrap 收到 SIGTERM → await stop() → 退出,在飞的 job 完整收尾。
 */
export interface DrainLoop {
  /** Coalesced edge trigger: never overlaps a tick and never carries job data. */
  wake(): void;
  stop(): Promise<void>;
  /** A live process with repeatedly failing, hung, or never-yet-succeeded work must not be "ready". */
  ready(): boolean;
  snapshot(): { consecutiveFailures: number; lastSuccessAt: number };
}

export function runDrainLoop(tick: () => Promise<void>, intervalMs = 5000): DrainLoop {
  let stopped = false;
  let consecutiveFailures = 0;
  let lastSuccessAt = Date.now();
  let everSucceeded = false;    // 审计 #92：首拍成功门——启动初期（首拍成功前）一律不就绪（禁 fail-open）。
  let wakePending = true; // initial reconciliation must run before the first notification.
  let settleWait: (() => void) | undefined;
  let stopPromise: Promise<void> | undefined;

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
        await tick();
        consecutiveFailures = 0;
        lastSuccessAt = Date.now();
        everSucceeded = true;
      } catch (e) {
        consecutiveFailures++;
        console.error('drain tick error', e);
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
      return !stopped && everSucceeded && consecutiveFailures < 3 && Date.now() - lastSuccessAt <= Math.max(intervalMs * 3, 5_000);
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
