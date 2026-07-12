/**
 * 模型调用并发限流(北极星:对齐供应商 RPM/并发配额,防突发把百炼打到 429 → 熔断 → 大面积降级)。
 * 两道闸,**与 circuitBreaker 同层**包在 ModelClient 外:
 *   ① 并发信号量:同一时刻最多 maxConcurrent 个在途模型调用,多了排队等槽位(不丢、不并发轰炸)。
 *   ② RPM 间隔(可选):两次"开始调用"至少间隔 60000/rpm ms,把请求摊平到配额内。
 * 队列天然背压:job 多时模型调用排队而非并发暴涨;每槽位释放即唤醒下一个。确定性可测(注入 now/sleep)。
 */
import type { ModelClient, CompletionRequest } from './model-client.ts';
import type { ModelResult } from './invoke.ts';

export interface RateLimitOpts {
  maxConcurrent?: number;   // 并发上限(默认 env MODEL_MAX_CONCURRENT 或 4)
  rpm?: number;             // 每分钟请求上限(默认 env MODEL_RPM;0/未设 = 不限速,只限并发)
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

export interface RateLimitedClient extends ModelClient {
  inflight: () => number;   // 当前在途数(可观测 / 可 gate)
  queued: () => number;     // 当前排队数
}

export function rateLimitedModel(inner: ModelClient, opts: RateLimitOpts = {}): RateLimitedClient {
  const maxConcurrent = Math.max(1, opts.maxConcurrent ?? Number(process.env.MODEL_MAX_CONCURRENT ?? 4));
  const rpm = opts.rpm ?? Number(process.env.MODEL_RPM ?? 0);
  const minIntervalMs = rpm > 0 ? Math.ceil(60_000 / rpm) : 0;
  const now = opts.now ?? (() => Date.now());
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  let active = 0;
  let lastStart = 0;
  const waiters: Array<() => void> = [];

  function acquireSlot(): Promise<void> {
    if (active < maxConcurrent) { active++; return Promise.resolve(); }
    return new Promise<void>((resolve) => waiters.push(() => { active++; resolve(); }));
  }
  function releaseSlot(): void {
    active--;
    const next = waiters.shift();
    if (next) next();
  }

  return {
    inflight: () => active,
    queued: () => waiters.length,
    async complete(req: CompletionRequest, attempt: number): Promise<ModelResult> {
      await acquireSlot();
      try {
        if (minIntervalMs > 0) {
          const wait = lastStart + minIntervalMs - now();
          if (wait > 0) await sleep(wait);
          lastStart = now();
        }
        return await inner.complete(req, attempt);
      } finally {
        releaseSlot();
      }
    },
  };
}
