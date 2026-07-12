/**
 * invoke — 模型调用关口（唯一公共出口）。把"重试分类 + 双校验 + 幂等 trace"封在一处，
 * 业务与图永远不直接碰模型 SDK。idempotencyKey 按 principal(owner) 作用域，exactly-once 落 ai_invocation_trace。
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import type { z } from 'zod';
import type { Client } from '@meetwise/db';
import { doubleValidate } from './validators/index.ts';
import { getTracer, type ModelCallOutcome } from './trace.ts';

// **全链路 request-id 的进程内传递通道**。invoke 埋在生命周期/服务深处(调用方构造 spec,不便逐层透传),
// 用 AsyncLocalStorage 让"出队处设的 reqId"沿 await 链自动流到每个 invoke——像分布式追踪的 trace context,是**易失的请求上下文**,
// 不是持久业务状态(reqId 的持久真相在 job.payload/Postgres;崩溃重投按 payload 重放同一 reqId,不依赖内存)。
// 存在 Symbol 全局注册表槽:出队处(worker)与本关口(ai-runtime)不互相 import 也共享同一实例(包边界/模块解析无关,单例安全)。
const REQID_ALS_KEY = Symbol.for('meetwise.ai-runtime.requestIdContext');
const gref = globalThis as unknown as Record<symbol, AsyncLocalStorage<string> | undefined>;
const requestIdStore: AsyncLocalStorage<string> = (gref[REQID_ALS_KEY] ??= new AsyncLocalStorage<string>());

// **向后兼容:trace.request_id 列可能尚未随迁移 0014 落地**(集成者把列合入 01_schema 前,存量/裸库无此列)。
// 首次调用探一次目录并进程内缓存:有列 → 落 request_id;无列 → 退回不含该列的 INSERT(现有调用/裸 schema 零破坏)。
// 迁移在应用启动前跑完,故运行期不会翻转;缓存一次即定。
let traceHasRequestId: boolean | null = null;
async function hasRequestIdColumn(c: Client): Promise<boolean> {
  if (traceHasRequestId === null) {
    const r = await c.query("SELECT 1 FROM information_schema.columns WHERE table_name='ai_invocation_trace' AND column_name='request_id'");
    traceHasRequestId = (r.rowCount ?? 0) > 0;
  }
  return traceHasRequestId;
}

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
  redactOutput?: boolean;           // 敏感输出(如 OCR 转写=简历原文/PII):trace.output 只存脱敏占位({redacted:true}),绝不落 PII;调用方仍拿到真值(修专家审计:PII 不入 trace + 不破坏被遗忘权)。
  requestId?: string;               // 全链路 reqId:一次 HTTP 请求触发的所有模型调用共享,落 trace.request_id → "某次请求为何失败"一跳到底查(不用跨表拼 threadId/幂等键)。不传则回退 ALS 环境值,仍无则 NULL(向后兼容,现有调用零改动)。
}
export type InvokeOutcome<T> = { value: T } | { error: string };

/** 在 principal 上下文 client 上跑；trace 带 owner、按 principal 作用域。
 *  transient/schema 失败 → 重试（封顶）；deterministic 拒绝 → 不重试；业务校验失败 → 确定性错误。 */
export async function invoke<T>(spec: InvokeSpec<T>, c: Client, owner: string): Promise<InvokeOutcome<T>> {
  // 全链路 reqId 解析:显式 spec 优先 → 出队处经 ALS 注入的环境值兜底 → 都无则 NULL(向后兼容)。
  const requestId = spec.requestId ?? requestIdStore.getStore() ?? null;
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
    // redactOutput:敏感输出(OCR 简历原文)只落脱敏占位——PII 绝不进 trace;真值仅回给调用方,由其加密落 resume_blob。
    const stored = spec.redactOutput ? { redacted: true } : v.value;
    // 有 request_id 列 → 一并落全链路 reqId;无列(迁移未落)→ 退回旧 INSERT,零破坏。
    if (await hasRequestIdColumn(c)) {
      await c.query(
        'INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service,input_tokens,output_tokens,latency_ms,request_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING',
        [owner, spec.idempotencyKey, stored, spec.service, r.usage?.inputTokens ?? null, r.usage?.outputTokens ?? null, latency, requestId]);
    } else {
      await c.query(
        'INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service,input_tokens,output_tokens,latency_ms) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING',
        [owner, spec.idempotencyKey, stored, spec.service, r.usage?.inputTokens ?? null, r.usage?.outputTokens ?? null, latency]);
    }
    return { value: v.value };
  }
  span(max, 'exhausted', 0);
  return { error: 'exhausted_retries' };
}
