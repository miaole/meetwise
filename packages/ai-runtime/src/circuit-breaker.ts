/**
 * 模型关口熔断器（北极星:优雅降级 + 快速恢复）。连续失败到阈值 → 打开 → **快速失败不打模型**(降级,不疯狂重试拖垮自己/供应商);
 * 冷却后 → 半开放一发试探 → 成功则关闭(恢复)、失败则重开。now 注入便于 gate 确定性。
 */
import type { ModelClient } from './model-client.ts';
import { getMetrics, METRIC } from './metrics.ts';

export interface BreakerOpts { threshold?: number; cooldownMs?: number; now?: () => number; onPhase?: (phase: BreakerPhase) => void; dep?: string }
export type BreakerPhase = 'closed' | 'open' | 'half_open';

export function circuitBreaker(inner: ModelClient, opts: BreakerOpts = {}): ModelClient & { phase: () => BreakerPhase } {
  const threshold = opts.threshold ?? 5;
  const cooldownMs = opts.cooldownMs ?? 30_000;
  const now = opts.now ?? (() => Date.now());
  const dep = opts.dep ?? 'model';   // 低基数标签,区分被熔断的依赖(默认模型关口)
  let failures = 0;
  let openedAt: number | null = null;
  const phase = (): BreakerPhase => openedAt === null ? 'closed' : (now() - openedAt >= cooldownMs ? 'half_open' : 'open');
  let lastNotified: BreakerPhase = 'closed';
  // 相位变了才回调(onPhase seam 保留)。**新增 emit(不改熔断逻辑)**:翻到 open 就 +1 熔断打开计数——
  //   告警数据源(ModelCircuitBreakerOpen)。半开试探再失败会重置 openedAt→再翻 open,亦计一次(每次打开都是真实降级事件)。
  const notify = () => {
    const p = phase();
    if (p !== lastNotified) {
      lastNotified = p;
      opts.onPhase?.(p);
      if (p === 'open') getMetrics().inc(METRIC.circuitBreakerOpen, { dep }, 1);
    }
  };
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
