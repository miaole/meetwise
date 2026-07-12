/**
 * 模型 failover 链(生产高可用:单供应商=单点故障)。按序尝试各 ModelClient:
 *   - ok → 立即返回;
 *   - transient(含熔断打开的快速失败、429/5xx/超时)→ 换下一个 client(通常是不同 key/供应商的备用端点);
 *   - deterministic(4xx 内容被拒/越权)→ **不 failover**(换供应商也会拒),直接返回。
 * 全挂 → 返回最后一个 transient(交 invoke 重试/降级)。每个 client 各自带熔断,dead primary 秒级快速失败→切 backup。
 * 与 rateLimitedModel/circuitBreaker 正交组合:`failoverModel([circuitBreaker(rl(primary)), circuitBreaker(rl(backup))])`。
 */
import type { ModelClient } from './model-client.ts';
import type { ModelResult } from './invoke.ts';

export function failoverModel(clients: ModelClient[]): ModelClient {
  const chain = clients.filter(Boolean);
  return {
    async complete(req, attempt) {
      let last: ModelResult = { ok: false, kind: 'transient' };
      for (const c of chain) {
        const r = await c.complete(req, attempt);
        if (r.ok) return r;                          // 首个成功即返
        if (r.kind === 'deterministic') return r;    // 内容被拒(4xx),换供应商也拒 → 不 failover
        last = r;                                    // transient → 试下一个
      }
      return last;                                   // 全挂 → transient(上层重试/降级)
    },
  };
}
