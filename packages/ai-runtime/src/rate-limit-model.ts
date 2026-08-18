/**
 * Model concurrency/RPM admission.  Crucially, queue admission happens before
 * `invoke` crosses its durable provider-send boundary: an aborted waiter is
 * removed from this queue and has never been marked dispatched or billed.
 */
import type { ModelClient, CompletionRequest } from './model-client.ts';
import type { ModelAdmission, ModelCallPlan, ModelResult } from './invoke.ts';

export interface RateLimitOpts {
  maxConcurrent?: number;
  rpm?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

export interface RateLimitedClient extends ModelClient {
  inflight: () => number;
  queued: () => number;
}

export interface ModelRateLimitConfig { maxConcurrent: number; rpm: number; }
const MAX_CONCURRENT_LIMIT = 1_000;
const RPM_LIMIT = 1_000_000;
function boundedInteger(name: string, value: unknown, min: number, max: number): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max)
    throw new Error(`model_rate_limit_config_invalid:${name}`);
  return number;
}
/** Shared startup/parser contract; malformed rate limits must never create an unbounded queue. */
export function resolveModelRateLimitConfig(env: NodeJS.ProcessEnv = process.env): ModelRateLimitConfig {
  return {
    maxConcurrent: boundedInteger('MODEL_MAX_CONCURRENT', env.MODEL_MAX_CONCURRENT ?? 4, 1, MAX_CONCURRENT_LIMIT),
    rpm: boundedInteger('MODEL_RPM', env.MODEL_RPM ?? 0, 0, RPM_LIMIT),
  };
}

export function rateLimitedModel(inner: ModelClient, opts: RateLimitOpts = {}): RateLimitedClient {
  const envConfig = resolveModelRateLimitConfig();
  const maxConcurrent = opts.maxConcurrent === undefined
    ? envConfig.maxConcurrent
    : boundedInteger('maxConcurrent', opts.maxConcurrent, 1, MAX_CONCURRENT_LIMIT);
  const rpm = opts.rpm === undefined
    ? envConfig.rpm
    : boundedInteger('rpm', opts.rpm, 0, RPM_LIMIT);
  const minIntervalMs = rpm > 0 ? Math.ceil(60_000 / rpm) : 0;
  const now = opts.now ?? (() => Date.now());
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  let active = 0;
  let nextStartAt = 0;
  const waiters: Array<() => void> = [];

  const abortError = () => new Error('model_execution_aborted');
  const throwIfAborted = (signal?: AbortSignal) => { if (signal?.aborted) throw abortError(); };
  async function waitAbortably(ms: number, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    if (!signal) return sleep(ms);
    await Promise.race([
      sleep(ms),
      new Promise<never>((_resolve, reject) => signal.addEventListener('abort', () => reject(abortError()), { once: true })),
    ]);
    throwIfAborted(signal);
  }
  function acquireSlot(signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    if (active < maxConcurrent) { active++; return Promise.resolve(); }
    return new Promise<void>((resolve, reject) => {
      const grant = () => {
        signal?.removeEventListener('abort', onAbort);
        active++;
        resolve();
      };
      const onAbort = () => {
        const index = waiters.indexOf(grant);
        if (index >= 0) waiters.splice(index, 1);
        reject(abortError());
      };
      signal?.addEventListener('abort', onAbort, { once: true });
      if (signal?.aborted) { onAbort(); return; }
      waiters.push(grant);
    });
  }
  function releaseSlot(): void {
    active--;
    const next = waiters.shift();
    if (next) next();
  }
  async function awaitRatePermission(signal?: AbortSignal): Promise<void> {
    if (minIntervalMs === 0) return;
    // Reserve a unique start slot synchronously before yielding.  A cancelled
    // request may leave a conservative gap, but it can never let a later
    // request leapfrog the RPM budget or send after a cancelled admission.
    const current = now();
    const scheduled = Math.max(current, nextStartAt);
    nextStartAt = scheduled + minIntervalMs;
    const wait = scheduled - current;
    if (wait > 0) await waitAbortably(wait, signal);
    throwIfAborted(signal);
  }

  const wrap = async (plan: ModelCallPlan): Promise<ModelCallPlan> => {
    if (!plan.ready) return plan;
    let admission: ModelAdmission | undefined;
    const admit = async (signal?: AbortSignal): Promise<ModelAdmission> => {
      if (admission) throw new Error('model_admission_reused');
      const upstream = plan.admit ? await plan.admit(signal) : undefined;
      let slotHeld = false;
      try {
        // Both local RPM permission and concurrent capacity are obtained
        // before `invoke` writes dispatching/cost.  Timeout here is known
        // not sent and the durable claim can safely become failed.
        await awaitRatePermission(signal);
        await acquireSlot(signal);
        slotHeld = true;
      } catch (error) {
        if (slotHeld) releaseSlot();
        upstream?.release();
        throw error;
      }
      let released = false;
      admission = {
        release: () => {
          if (released) return;
          released = true;
          admission = undefined;
          releaseSlot();
          upstream?.release();
        },
      };
      return admission;
    };
    return {
      ready: true,
      cost: plan.cost,
      admit,
      execute: async (signal) => {
        if (!admission) throw new Error('model_admission_required');
        throwIfAborted(signal);
        return plan.execute(signal);
      },
    };
  };

  return {
    costPolicy: inner.costPolicy,
    inflight: () => active,
    queued: () => waiters.length,
    async prepare(req, attempt, signal) {
      const plan = inner.prepare
        ? await inner.prepare(req, attempt, signal)
        : { ready: true as const, execute: (executeSignal?: AbortSignal) => inner.complete(req, attempt, executeSignal), cost: inner.costPolicy };
      return wrap(plan);
    },
    async complete(req: CompletionRequest, attempt: number, signal?: AbortSignal): Promise<ModelResult> {
      const plan = await this.prepare!(req, attempt, signal);
      if (!plan.ready) return { ok: false, kind: 'transient', externalOutcome: 'known_not_executed' };
      const admission = plan.admit ? await plan.admit(signal) : undefined;
      try { return await plan.execute(signal); }
      finally { admission?.release(); }
    },
  };
}
