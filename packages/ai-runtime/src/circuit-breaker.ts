/**
 * 模型关口熔断器（北极星:优雅降级 + 快速恢复）。连续失败到阈值 → 打开 → **快速失败不打模型**(降级,不疯狂重试拖垮自己/供应商);
 * 冷却后 → 半开放一发试探 → 成功则关闭(恢复)、失败则重开。now 注入便于 gate 确定性。
 */
import type { ModelClient } from './model-client.ts';

export interface BreakerOpts { threshold?: number; cooldownMs?: number; now?: () => number; onPhase?: (phase: BreakerPhase) => void }
export type BreakerPhase = 'closed' | 'open' | 'half_open';

export function circuitBreaker(inner: ModelClient, opts: BreakerOpts = {}): ModelClient & { phase: () => BreakerPhase } {
  const threshold = opts.threshold ?? 5;
  const cooldownMs = opts.cooldownMs ?? 30_000;
  const now = opts.now ?? (() => Date.now());
  let failures = 0;
  let openedAt: number | null = null;
  const phase = (): BreakerPhase => openedAt === null ? 'closed' : (now() - openedAt >= cooldownMs ? 'half_open' : 'open');
  let lastNotified: BreakerPhase = 'closed';
  const notify = () => { const p = phase(); if (p !== lastNotified) { lastNotified = p; opts.onPhase?.(p); } };   // 相位变了才回调(seam:接 gauge,熔断器本身不依赖 metrics)
  return {
    phase,
    async complete(req, attempt) {
      if (phase() === 'open') { notify(); return { ok: false, kind: 'transient' }; }   // 熔断:不打模型,快速降级
      const res = await inner.complete(req, attempt);                    // closed / half_open:放行
      if (res.ok) { failures = 0; openedAt = null; notify(); return res; }   // 成功 → 关闭(恢复)
      failures++;
      if (failures >= threshold) openedAt = now();                       // 连败到阈值 → 打开(半开试探失败也会重开)
      notify();
      return res;
    },
  };
}
