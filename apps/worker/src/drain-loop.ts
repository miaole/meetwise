/**
 * 可优雅排空的常驻循环（HA:滚动部署/重启不丢 job）。stop() **等当前 tick 跑完**再 resolve(排空),
 * 不在 job 半途砍进程。bootstrap 收到 SIGTERM → await stop() → 退出,在飞的 job 完整收尾。
 */
export interface DrainLoop {
  /** Coalesced edge trigger: never overlaps a tick and never carries job data. */
  wake(): void;
  stop(): Promise<void>;
  /** A live process with repeatedly failing or hung work must not be "ready". */
  ready(): boolean;
  snapshot(): { consecutiveFailures: number; lastSuccessAt: number };
}

export function runDrainLoop(tick: () => Promise<void>, intervalMs = 5000): DrainLoop {
  let stopped = false;
  let consecutiveFailures = 0;
  let lastSuccessAt = Date.now();
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
      // 3 consecutive failures is a deterministic failure signal. The stale
      // bound also catches a permanently hung tick that never rejects.
      return !stopped && consecutiveFailures < 3 && Date.now() - lastSuccessAt <= Math.max(intervalMs * 3, 5_000);
    },
    snapshot() { return { consecutiveFailures, lastSuccessAt }; },
  };
}

// ── HA-2 · worker 排水上限与信号同链(REQUEST §1 W3 · §3 C5)─────────────────────

/** 具名排水项:name 进 worker_drain_timeout 日志(在飞 loop 可辨);stop 拒绝不拖垮 race。 */
export interface NamedStop {
  name: string;
  stop: () => Promise<void> | void;
}

/**
 * W3①:排水与 deadline 竞速,胜者先行。全部 stop() 在 timeoutMs 内 settle → 'drained'
 * (在飞 tick 完整收尾);deadline 先到 → 'timeout',onTimeout 收**在飞未完**名单(结构化
 * 日志 worker_drain_timeout in_flight=…),调用方随即强退 exit 0——被弃 job 走租约过期
 * →reaper/sweep 重领(既有 crash-safe 语义,租约互斥保证不双跑)。纯时序件零 IO:proof
 * 注入 fake stop/短超时确定性读数,不真睡 30s(deadline 计时器不 unref——进程生命周期
 * 必须被排水上限钉住,与 runDrainLoop 内部兜底臂的败者纪律相反:一个等败者、一个钉胜者)。
 */
export async function drainWithDeadline(
  stops: NamedStop[],
  timeoutMs: number,
  onTimeout?: (inFlight: string[]) => void,
): Promise<'drained' | 'timeout'> {
  const pending = new Set(stops.map((s) => s.name));
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      timedOut = true;
      resolve();
    }, timeoutMs);
  });
  await Promise.race([
    Promise.allSettled(stops.map(async (s) => {
      try {
        await s.stop();
      } finally {
        pending.delete(s.name);   // settle(含 reject)即在飞结束;reject 不外抛(allSettled 语义)
      }
    })),
    deadline,
  ]);
  clearTimeout(timer);            // 败者计时器纪律:race 出结果必清,不留悬挂句柄
  if (timedOut) {
    onTimeout?.([...pending]);
    return 'timeout';
  }
  return 'drained';
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
