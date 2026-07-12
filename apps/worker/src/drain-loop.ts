/**
 * 可优雅排空的常驻循环（HA:滚动部署/重启不丢 job）。stop() **等当前 tick 跑完**再 resolve(排空),
 * 不在 job 半途砍进程。bootstrap 收到 SIGTERM → await stop() → 退出,在飞的 job 完整收尾。
 */
export interface DrainLoop { stop(): Promise<void> }

export function runDrainLoop(tick: () => Promise<void>, intervalMs = 1500): DrainLoop {
  let stopped = false;
  const sleep = (ms: number) => new Promise<void>((r) => { const t = setTimeout(r, ms); (t as any).unref?.(); });
  const loop = (async () => {
    while (!stopped) {
      // **tick 抛不停循环(可靠性硬化)**:未预期异常只记日志、下一拍重试,绝不让常驻循环静默死亡(=队列永久停滞却进程"健康")。
      // 各 tick 内部已尽量自吞按 owner 隔离;这里是最后一道兜底,契合北极星"快速恢复/优雅降级"。
      try { await tick(); } catch (e) { console.error('drain tick error', e); }
      if (!stopped) await sleep(intervalMs);
    }
  })();
  loop.catch((e) => console.error('drain loop error', e));
  return {
    async stop() { stopped = true; await loop.catch(() => {}); },   // 等循环(含在飞 tick)真正结束
  };
}
