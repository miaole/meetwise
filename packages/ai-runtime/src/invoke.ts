/**
 * invoke — 模型调用关口（唯一公共出口）。把"重试分类 + 双校验 + 幂等 trace"封在一处，
 * 业务与图永远不直接碰模型 SDK。idempotencyKey 按 principal(owner) 作用域，exactly-once 落 ai_invocation_trace。
 */
import type { z } from 'zod';
import type { Client } from '@meetwise/db';
import { doubleValidate } from './validators/index.ts';
import { getTracer, type ModelCallOutcome } from './trace.ts';

export type ModelResult = { ok: true; raw: unknown; usage?: { inputTokens: number; outputTokens: number } } | { ok: false; kind: 'transient' | 'deterministic' };
export interface Model { call(attempt: number): Promise<ModelResult>; }

export interface InvokeSpec<T> {
  idempotencyKey: string;
  schema: z.ZodType<T>;
  businessValidate: (v: T) => string | null;
  model: Model;
  maxRetries?: number;
  service?: string;                 // 观测分组用(脱敏 span 的 service 标签);不影响业务
  sources?: string[];               // provenance:本次生成的检索来源 ref_ids,记入 trace 供审计/引用
  threadId?: string;                // 面试 id:Langfuse sessionId/traceId,**一场面试归一棵 trace 树**(跨调用关联,RCA 用)
  retrieval?: { ref: string; score: number }[];   // 检索质量信号:top-k 命中分数,分得清"没召到"(top 分低)vs"召到没用好"
}
export type InvokeOutcome<T> = { value: T } | { error: string };

/** 在 principal 上下文 client 上跑；trace 带 owner、按 principal 作用域。
 *  transient/schema 失败 → 重试（封顶）；deterministic 拒绝 → 不重试；业务校验失败 → 确定性错误。 */
export async function invoke<T>(spec: InvokeSpec<T>, c: Client, owner: string): Promise<InvokeOutcome<T>> {
  // **串行化同 (owner,key) 并发调用** → 真 exactly-once。否则两并发都 miss cache、都调模型=双花/双副作用,
  // ON CONFLICT DO NOTHING 只去重落库、却各自返回可能相异的值(审计 HIGH)。事务级 advisory 锁,随 asPrincipal 提交释放。
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [owner, spec.idempotencyKey]);
  // 本事务要握着 advisory 锁跨整个模型调用(~9-30s,exactly-once 必需),期间事务"空闲"是合法的。
  // 全局 idle_in_transaction_session_timeout(默认 15s,防真挂死)会误杀慢模型调用 → 25P03 FATAL 崩 worker。
  // SET LOCAL 只放宽本事务(提交即恢复全局紧值);并发上限改由连接池容量约束(慢模型握连接是已知取舍,见后端踩坑录 RPC-in-tx)。
  await c.query("SET LOCAL idle_in_transaction_session_timeout = '180000'");
  const cached = await c.query(
    'SELECT output FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, spec.idempotencyKey]);
  const tracer = getTracer();                                              // 关口唯一埋点位:每次模型调用出 span(只标量,脱敏)
  const span = (attempt: number, outcome: ModelCallOutcome, latencyMs: number, usage?: { inputTokens: number; outputTokens: number }) =>
    tracer.record({ owner, idempotencyKey: spec.idempotencyKey, threadId: spec.threadId, attempt, outcome, latencyMs, service: spec.service, sources: spec.sources ?? [], retrieval: spec.retrieval, inputTokens: usage?.inputTokens, outputTokens: usage?.outputTokens });
  if (cached.rowCount) { span(0, 'cached', 0); return { value: cached.rows[0].output as T }; } // 命中=未真打模型

  const max = spec.maxRetries ?? 3;
  for (let attempt = 1; attempt <= max; attempt++) {
    const t0 = performance.now();
    const r = await spec.model.call(attempt);
    const latency = Math.round(performance.now() - t0);
    if (!r.ok) {
      if (r.kind === 'deterministic') { span(attempt, 'deterministic_refusal', latency); return { error: 'deterministic_refusal' }; }
      span(attempt, 'transient_retry', latency);
      // **指数退避 + jitter**(修 B1:此前背靠背无延迟重试,会继续轰炸挣扎中的供应商/429)。有界(≤2s)——invoke 在事务内持 advisory 锁,不能久睡(已有 180s idle 超时兜底)。
      if (attempt < max) { const backoff = Math.min(2000, 150 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 100); await new Promise((res) => setTimeout(res, backoff)); }
      continue;                                                          // transient → 退避后重试
    }
    const v = doubleValidate(spec.schema, spec.businessValidate, r.raw);
    if (!v.ok) {
      if (v.stage === 'schema') { span(attempt, 'schema_retry', latency, r.usage); continue; }
      span(attempt, 'business_error', latency, r.usage); return { error: 'business:' + v.reason };     // 业务失败确定性错(模型已花 token)
    }
    span(attempt, 'ok', latency, r.usage);
    // **成本源头真相落库**(service + token + 延迟):不只依赖可选 Langfuse tracer;没配 Langfuse 也能从自己库对账/计费/预算告警。
    await c.query(
      'INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service,input_tokens,output_tokens,latency_ms) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING',
      [owner, spec.idempotencyKey, v.value, spec.service, r.usage?.inputTokens ?? null, r.usage?.outputTokens ?? null, latency]);
    return { value: v.value };
  }
  span(max, 'exhausted', 0);
  return { error: 'exhausted_retries' };
}
