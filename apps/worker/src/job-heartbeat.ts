/**
 * Job 租约心跳（HA:慢但活着的 job 不被 reaper 误判崩溃而重领/终结）。
 * 运行期间每 ~30s 续一次租（TTL 120s,4x 余量）。续租在独立短事务里跑(经 renew 闭包);
 * 续租返回 false(已被重领/已终态)→ 自动停心跳,绝不和重领者抢同一 job 的租约。
 * stop() 幂等且等在飞的一拍续租跑完,杜绝 markDone/markFailed 后心跳还在改租约的竞态。
 */
export interface Heartbeat { stop(): Promise<void> }

export function startHeartbeat(renew: () => Promise<boolean>, intervalMs = 30_000): Heartbeat {
  let stopped = false;
  let inflight: Promise<void> = Promise.resolve();
  const tick = async () => {
    if (stopped) return;
    try { const ok = await renew(); if (!ok) stopped = true; }   // 租约已不归我 → 停（别强续他人租约）
    catch { /* 续租瞬时失败当无事,下一拍再试;真过期由 reaper 兜底 */ }
  };
  const timer = setInterval(() => { inflight = tick(); }, intervalMs);
  (timer as any).unref?.();   // 不阻止进程退出
  return {
    async stop() { stopped = true; clearInterval(timer); await inflight.catch(() => {}); },
  };
}
