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
