/**
 * 模型关口熔断器（北极星:优雅降级 + 快速恢复）。连续失败到阈值 → 打开 → **快速失败不打模型**(降级,不疯狂重试拖垮自己/供应商);
 * 冷却后 → 半开放一发试探 → 成功则关闭(恢复)、失败则重开。now 注入便于 gate 确定性。
 */
import type { CompletionRequest, ModelClient } from './model-client.ts';
import type { ModelCallPlan } from './invoke.ts';
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
  // `half_open` is not merely a label: after cooldown exactly one request may
  // test the endpoint.  This lease is intentionally process-local, like this
  // breaker itself; it limits a recovery burst but is not a substitute for a
  // cross-replica supplier quota.
  let halfOpenProbeHeld = false;
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
  const prepare = async (req: CompletionRequest, attempt: number, signal?: AbortSignal): Promise<ModelCallPlan> => {
    const initialPhase = phase();
    if (initialPhase === 'open') { notify(); return { ready: false, error: 'model_circuit_open' }; }
    // A request which lost the half-open probe race is pre-dispatch known
    // unavailable.  Returning it from prepare lets a failover chain choose a
    // same-scope backup without first creating a terminal failed claim.
    if (initialPhase === 'half_open' && halfOpenProbeHeld)
      return { ready: false, error: 'model_circuit_half_open' };
    const isHalfOpenProbe = initialPhase === 'half_open';
    const plan = inner.prepare
      ? await inner.prepare(req, attempt, signal)
      : { ready: true as const, execute: (executeSignal?: AbortSignal) => inner.complete(req, attempt, executeSignal), cost: inner.costPolicy };
    if (!plan.ready) return plan;

    // `prepare` runs before the durable claim.  Taking the probe here would
    // leak it when this request turns out to be a duplicate/cached key.  The
    // gate therefore lives in `admit`, which invoke calls only after it owns
    // the durable claim and before it writes `dispatching`.
    const admit = !isHalfOpenProbe ? plan.admit : async (admitSignal?: AbortSignal) => {
      if (admitSignal?.aborted) throw new Error('model_execution_aborted');
      if (halfOpenProbeHeld) throw new Error('model_circuit_half_open');
      halfOpenProbeHeld = true;
      let upstream: { release(): void } | undefined;
      try {
        upstream = plan.admit ? await plan.admit(admitSignal) : undefined;
      } catch (error) {
        halfOpenProbeHeld = false;
        throw error;
      }
      let released = false;
      return {
        release: () => {
          if (released) return;
          released = true;
          upstream?.release();
          // A pre-dispatch failure releases the probe for another safe try.
          // Once execute has returned, it has already closed or re-opened the
          // breaker, so clearing this flag is harmless and idempotent.
          halfOpenProbeHeld = false;
        },
      };
    };
    return {
      ready: true,
      cost: plan.cost,
      admit,
      execute: async (executeSignal) => {
        // A half-open execution may only run after obtaining its probe lease.
        // This protects direct ModelClient users as well as invoke().
        if (isHalfOpenProbe && !halfOpenProbeHeld) throw new Error('model_circuit_half_open_admission_required');
        try {
          const res = await plan.execute(executeSignal);
          if (res.ok) {
            failures = 0;
            openedAt = null;
            halfOpenProbeHeld = false;
            notify();
            return res;
          }
          failures++;
          if (isHalfOpenProbe || failures >= threshold) openedAt = now();
          halfOpenProbeHeld = false;
          notify();
          return res;
        } catch (error) {
          // Adapters should normally return a structured unknown outcome, but
          // a throwing adapter must not strand the only half-open probe.
          failures++;
          if (isHalfOpenProbe || failures >= threshold) openedAt = now();
          halfOpenProbeHeld = false;
          notify();
          throw error;
        }
      },
    };
  };
  return {
    costPolicy: inner.costPolicy,
    phase,
    prepare,
    async complete(req, attempt, signal) {
      const p = await prepare(req, attempt, signal);
      if (!p.ready) return { ok: false, kind: 'transient', externalOutcome: 'known_not_executed' };
      let admission;
      try { admission = p.admit ? await p.admit(signal) : undefined; }
      catch (error: any) {
        if (error?.message === 'model_circuit_half_open')
          return { ok: false, kind: 'transient', externalOutcome: 'known_not_executed' };
        throw error;
      }
      try { return await p.execute(signal); }
      finally { admission?.release(); }
    },
  };
}
