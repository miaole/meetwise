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
        // TOKSTREAM S4b（R1b① 层3 结构性非流式落点·注记零路由）：本 prepare 缺省 execute 臂仅
        // prepare-less 成员可达；生产 failover 链成员全 openAICompatibleClient（interview-service
        // endpoint()=openAICompatibleClient·prepare 恒在）→ 臂生产不可达，且 prepare-less ⇒ 无
        // completeStream 可路由=恒非流式 fail-safe。flag-aware 路由施为位=成员自身 prepare execute 臂
        // （failover 链经 failoverModel.prepare 逐成员转发同臂即达），本层零路由零改。
        const plan = client.prepare
          ? await client.prepare(req, attempt, signal)
          // 无 prepare 的客户端（scripted/legacy seam）：显式不带端点准入身份（AG-08 成本轨⑤）——
          // plan 原样穿透本链，身份面由有 prepare 的真实端点客户端填充；此处 undefined=准入分区
          // 维持 registry 派生原值（legacy 回退集零漂）。
          : {
            ready: true as const,
            execute: (executeSignal?: AbortSignal) => client.complete(req, attempt, executeSignal),
            cost: client.costPolicy,
            admissionEndpoint: undefined,
          };
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
