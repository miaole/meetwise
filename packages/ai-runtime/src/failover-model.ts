/**
 * Model failover selects a healthy endpoint only before the durable dispatch
 * boundary. A primary timeout, 5xx or broken response is deliberately not
 * followed by a backup request for the same idempotency key: the primary may
 * already have accepted and billed it. The ledger records that result as
 * unknown and reconciliation decides the next action.
 */
import type { ModelClient } from './model-client.ts';
import type { ModelResult } from './invoke.ts';

export function failoverModel(clients: ModelClient[]): ModelClient {
  const chain = clients.filter(Boolean);
  const prepare = async (req: Parameters<ModelClient['complete']>[0], attempt: number, signal?: AbortSignal) => {
    let last = 'model_endpoint_unavailable';
    for (const client of chain) {
      try {
        const plan = client.prepare
          ? await client.prepare(req, attempt, signal)
          : { ready: true as const, execute: (executeSignal?: AbortSignal) => client.complete(req, attempt, executeSignal), cost: client.costPolicy };
        if (plan.ready === true) return plan;
        last = plan.error;
      } catch {
        // prepare 是纯预派发(契约要求不发网络请求),抛异常不会产生计费歧义,视同 not-ready 继续降级到 backup——
        // 与「主端点返回 not-ready → 选 backup」语义对齐。此前抛异常会直接冒出循环跳过 backup,造成不对称。
        last = 'model_endpoint_unavailable';
      }
    }
    return { ready: false as const, error: last };
  };
  return {
    prepare,
    async complete(req, attempt, signal) {
      const plan = await prepare(req, attempt, signal);
      if (!plan.ready) return { ok: false, kind: 'transient', externalOutcome: 'known_not_executed' } as ModelResult;
      const admission = plan.admit ? await plan.admit(signal) : undefined;
      try { return await plan.execute(signal); }
      finally { admission?.release(); }
    },
  };
}
