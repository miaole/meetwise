/**
 * Model invocation gateway.
 *
 * The external request is deliberately outside every PostgreSQL transaction.
 * A durable claim records the request digest before dispatch; a short
 * transaction then crosses the dispatch boundary.  Once that boundary is
 * crossed, timeout/connection loss/5xx is `unknown`, never an automatic retry
 * or same-request failover.  This is the only defensible behaviour without a
 * verified supplier idempotency-and-reconciliation contract.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash, randomUUID } from 'node:crypto';
import type { z } from 'zod';
import {
  asPrincipal, isInterviewPrivacyActive, claimModelInvocation, completeModelInvocation, failModelInvocationClaim,
  markAiCostDispatched, markAiCostUnknown, markAiTextCostRejected, markModelInvocationDispatched,
  markModelInvocationUnknown, reserveAiTextCost, settleAiTextCost, type Client, type DbPool,
} from '@meetwise/db';
import { doubleValidate } from './validators/index.ts';
import { getTracer, type ModelCallOutcome } from './trace.ts';
import { getMetrics, METRIC } from './metrics.ts';
import { withAbortTimeout } from './timeout.ts';
import { resolveModelOperation } from './model-operation-registry.ts';
import {
  admitSharedModelOperation, recordSharedModelOperation, resolveModelAdmissionPartition,
  type SharedModelAdmissionLease, type SharedModelFeeRecord,
} from './model-admission.ts';

const REQID_ALS_KEY = Symbol.for('meetwise.ai-runtime.requestIdContext');
const COST_SCOPE_ID = /^[A-Za-z0-9._:-]{1,160}$/;
const COST_PRICE_REVISION = /^[A-Za-z0-9._:-]{1,80}$/;
const gref = globalThis as unknown as Record<symbol, AsyncLocalStorage<string> | undefined>;
const requestIdStore: AsyncLocalStorage<string> = (gref[REQID_ALS_KEY] ??= new AsyncLocalStorage<string>());

// request_id(迁移 0014)是唯一仍可选的 trace 列,故按需探测;estimate_input_tokens(迁移 0090)是必需列,
// persistTrace 无条件写入——若库缺它应让 INSERT 报错显式暴露迁移缺口,而非静默降级。
let traceHasRequestId: boolean | null = null;
async function hasRequestIdColumn(c: Client): Promise<boolean> {
  if (traceHasRequestId === null) {
    const r = await c.query("SELECT 1 FROM information_schema.columns WHERE table_name='ai_invocation_trace' AND column_name='request_id'");
    traceHasRequestId = (r.rowCount ?? 0) > 0;
  }
  return traceHasRequestId;
}

export type ModelUsage = {
  inputTokens: number;
  outputTokens: number;
  /**
   * 派发前保守估算的输入 token(utf8-bytes-v1 = UTF-8 字节数)。
   * 字节数是渲染**文本 token** 的上界;对供应商完整 `prompt_tokens`(含消息框架/特殊/schema token,不在被计字符串内)
   * 仅是保守估算,靠 contextSafetyMargin + 结构化输出 reserve + 对账记录误差兜底——provider > estimate 是"保守估算被击穿"
   * 的预期失效模式,必须标记(绝不静默),而非"数学不变量被击穿"。
   * 可选:未接预算器的旧 seam 无此值;缺省表示"本请求无对账证据",不参与低估判断。
   */
  estimateInputTokens?: number;
};
/** `known_not_executed` requires an explicit negative response from the endpoint. Omission means unknown. */
export type ModelResult =
  | { ok: true; raw: unknown; usage?: ModelUsage }
  | { ok: false; kind: 'transient' | 'deterministic'; externalOutcome?: 'known_not_executed' | 'unknown' };

/** Pricing and budget identity attached to a selected endpoint, never to a user supplied prompt. */
export interface ModelCostPolicy {
  scopeId: string;
  provider: string;
  model: string;
  region: string;
  /** Immutable row identity in `ai_cost_price_book`; never resolve “latest” at dispatch. */
  priceRevision: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  /**
   * A dispatch-time context window declaration.  It deliberately remains
   * optional on the base type while MODEL-OP-01 migrates every legacy adapter;
   * the OpenAI-compatible transport rejects a billable policy that omits it.
   */
  contextWindowTokens?: number;
  /** Conservative input estimator approved for this endpoint configuration. */
  contextEstimator?: 'utf8-bytes-v1';
  /** Tokens deliberately left unused for provider/template/tokenizer variance. */
  contextSafetyMarginTokens?: number;
  /**
   * Reserved for the tool-call envelope (工具信封), subtracted from the
   * available input budget before dispatch. 0 for the current tool-free text
   * path; non-zero once tools enter the rendered request. Mirrors the doc
   * formula `availableInput = contextWindow − maxOutput − toolReserve − safetyMargin`.
   */
  contextToolReserveTokens?: number;
  /** Required per-image reserve when a billable text/vision request carries images. */
  imageInputTokensPerImage?: number;
}

/** A pre-dispatch admission lease (for example, one rate-limit slot). */
export interface ModelAdmission { release(): void; }

export type ModelCallPlan =
  | {
    ready: true;
    /**
     * Obtains cancellable local capacity before the durable external-send
     * boundary.  A timeout here is known-not-sent, never `unknown`.
     */
    admit?: (signal?: AbortSignal) => Promise<ModelAdmission>;
    execute: (signal?: AbortSignal) => Promise<ModelResult>;
    cost?: ModelCostPolicy;
    /**
     * 派发前保守估算的输入 token（utf8-bytes-v1 = UTF-8 字节上界，planContextBudget 算得）。
     * 在 claim 时落 ai_model_invocation.estimate_input_tokens（P1），覆盖全 outcome——
     * 不依赖输出校验通过才落（trace 只在 !error 时写，会偏置校准样本）。
     */
    estimateInputTokens?: number;
  }
  | { ready: false; error: string };
type ReadyModelCallPlan = Extract<ModelCallPlan, { ready: true }>;

export interface Model {
  call(attempt: number, signal?: AbortSignal): Promise<ModelResult>;
  /** Optional pre-dispatch routing seam. `prepare` must not make a network request. */
  prepare?(attempt: number, signal?: AbortSignal): Promise<ModelCallPlan> | ModelCallPlan;
  /** SHA-256 of the immutable prompt/model/input snapshot; normal production models provide it. */
  requestDigest?: string;
}

export interface InvokeSpec<T> {
  idempotencyKey: string;
  /**
   * Canonical, server-computed identity of the business node/revision that is
   * allowed to reach a provider once. It is deliberately separate from the
   * invocation key: adding a repair/critique key must not mint another slot.
   * Only a SHA-256 digest reaches the database. Production rejects omission;
   * local legacy seams derive a compatibility identity from idempotencyKey.
   */
  logicalNodeKey?: string;
  /**
   * Registry-resolved node identity (MODEL-OP-00): when present, the logical
   * node key is derived server-side from the frozen operation id and an
   * explicit business revision instead of caller key text. Mutually exclusive
   * with `logicalNodeKey`; unwired/unknown operations fail closed here.
   */
  operation?: { id: string; businessRevision: string };
  schema: z.ZodType<T>;
  businessValidate: (v: T) => string | null;
  model: Model;
  /** Retained for source compatibility. Billable external attempts are never automatically retried. */
  maxRetries?: number;
  service?: string;
  sources?: string[];
  threadId?: string;
  /**
   * Data-minimization fence for a model request whose input may contain
   * interview data.  It is checked in the same short transaction that marks
   * the durable provider-dispatch boundary.
   */
  privacyInterviewId?: string;
  retrieval?: { ref: string; score: number }[];
  redactOutput?: boolean;
  storeOutput?: (value: T) => unknown;
  /**
   * Optional durable side effect for validated sensitive output. It runs in the
   * same short principal transaction as `ai_model_invocation=succeeded`; use
   * it for an encrypted domain artifact, never for logs or a plaintext trace.
   */
  persistValidatedOutput?: (c: Client, value: T) => Promise<void>;
  requestId?: string;
  /** Required for custom production models; `modelFor` supplies it for all normal model clients. */
  requestDigest?: string;
  /** How long a concurrent duplicate may poll durable state without holding a DB transaction. */
  waitMs?: number;
  /**
   * A second, gateway-level deadline for one already-dispatched model attempt.
   *
   * Concrete HTTP adapters must still abort their transport themselves.  This
   * guard also protects the worker if an adapter, DNS stack, SDK or test seam
   * never settles its Promise.  Crossing this boundary is externally
   * indeterminate, so it is deliberately terminal for this idempotency key.
   * The tiny values used by deterministic tests are allowed only through this
   * explicit seam; environment configuration is validated separately below.
   */
  executionTimeoutMs?: number;
}
export type InvokeOutcome<T> = { value: T } | { error: string };

/**
 * This is the one admission error for which a route may safely be recomputed:
 * no provider request, cost reservation, or durable dispatch marker exists.
 * It is intentionally narrow—timeouts and provider failures never enter this
 * path because they may already be billable.
 */
function isHalfOpenFollower(error: unknown): boolean {
  return error instanceof Error && error.message === 'model_circuit_half_open';
}

/**
 * MODEL-OP-02 终态释放/记录：把断路器结果 + 钱账本（可选）落库，并释放并发槽/探针。
 * 独立 best-effort 事务（.catch 吞掉），与 cost/invocation 状态机解耦——即便本事务失败，
 * 槽/探针靠 lease 过期自愈、钱账本可从 ai_cost_reservation 对账（投影，非唯一真相）。
 * 幂等：fee PK(owner,idempotency) ON CONFLICT DO NOTHING；槽释放 match(owner,idempotency)。
 */
async function releaseSharedAdmissionBestEffort(
  pool: DbPool, owner: string, lease: SharedModelAdmissionLease | undefined,
  outcome: 'success' | 'failure' | 'no_signal', fee?: SharedModelFeeRecord,
): Promise<void> {
  if (!lease) return;
  await asPrincipal(pool, owner, async (c) => {
    await recordSharedModelOperation(c, owner, lease, outcome, fee);
  }).catch(() => undefined);
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
export interface ModelDeadlineConfig {
  executionTimeoutMs: number;
  transportTimeoutMs: number;
  invocationWaitMs: number;
}
function boundedEnvIntegerFrom(env: NodeJS.ProcessEnv, name: string, fallback: number, min: number, max: number): number {
  const raw = env[name] ?? String(fallback);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max)
    throw new Error(`model_deadline_config_invalid:${name}`);
  return value;
}
/**
 * One startup-validatable deadline contract. Transport may finish earlier,
 * but it cannot outlive the gateway deadline, which also aborts every
 * adapter and queue-admission wait.
 */
export function resolveModelDeadlineConfig(env: NodeJS.ProcessEnv = process.env): ModelDeadlineConfig {
  const executionTimeoutMs = boundedEnvIntegerFrom(env, 'MODEL_EXECUTION_TIMEOUT_MS', 35_000, 1_000, 120_000);
  const transportTimeoutMs = boundedEnvIntegerFrom(env, 'MODEL_TIMEOUT_MS', 30_000, 1_000, executionTimeoutMs);
  const invocationWaitMs = boundedEnvIntegerFrom(env, 'MODEL_INVOCATION_WAIT_MS', 35_000, 100, 120_000);
  return { executionTimeoutMs, transportTimeoutMs, invocationWaitMs };
}
function modelExecutionTimeoutMs<T>(spec: InvokeSpec<T>): number {
  if (spec.executionTimeoutMs !== undefined) {
    if (!Number.isSafeInteger(spec.executionTimeoutMs) || spec.executionTimeoutMs < 1 || spec.executionTimeoutMs > 120_000)
      throw new Error('model_execution_timeout_invalid');
    // Millisecond-sized deadlines are a deterministic test seam, not a
    // production knob: a real worker would self-inflict unknown outcomes.
    if (process.env.NODE_ENV === 'production' && spec.executionTimeoutMs < 1_000)
      throw new Error('model_execution_timeout_invalid');
    return spec.executionTimeoutMs;
  }
  try { return resolveModelDeadlineConfig().executionTimeoutMs; }
  catch { throw new Error('model_execution_timeout_invalid'); }
}
function modelInvocationWaitMs<T>(spec: InvokeSpec<T>): number {
  if (spec.waitMs === undefined) return resolveModelDeadlineConfig().invocationWaitMs;
  if (!Number.isSafeInteger(spec.waitMs) || spec.waitMs < 100 || spec.waitMs > 120_000)
    throw new Error('model_invocation_wait_invalid');
  return spec.waitMs;
}
/**
 * Canonical binding for the model/cost configuration selected before dispatch.
 * It is intentionally data-free: prompts stay in the first digest layer and
 * this layer only protects provider/accounting identity from silent drift.
 */
function costPolicyBinding(policy: ModelCostPolicy | undefined): Record<string, unknown> | undefined {
  if (!policy) return undefined;
  return {
    scopeId: policy.scopeId,
    provider: policy.provider,
    model: policy.model,
    region: policy.region,
    priceRevision: policy.priceRevision,
    maxInputTokens: policy.maxInputTokens,
    maxOutputTokens: policy.maxOutputTokens,
    contextWindowTokens: policy.contextWindowTokens ?? null,
    contextEstimator: policy.contextEstimator ?? null,
    contextSafetyMarginTokens: policy.contextSafetyMarginTokens ?? null,
    contextToolReserveTokens: policy.contextToolReserveTokens ?? null,
    imageInputTokensPerImage: policy.imageInputTokensPerImage ?? null,
  };
}

function costPolicyError(policy: ModelCostPolicy | undefined): string | undefined {
  if (!policy) return undefined;
  if (!COST_SCOPE_ID.test(policy.scopeId)) return 'model_cost_policy_invalid';
  if (!COST_PRICE_REVISION.test(policy.priceRevision)) return 'model_cost_price_revision_invalid';
  if (!policy.provider || !policy.model || !policy.region
    || !Number.isSafeInteger(policy.maxInputTokens) || policy.maxInputTokens < 1
    || !Number.isSafeInteger(policy.maxOutputTokens) || policy.maxOutputTokens < 1) {
    return 'model_cost_policy_invalid';
  }
  return undefined;
}

function sameCostPolicyBinding(left: ModelCostPolicy | undefined, right: ModelCostPolicy | undefined): boolean {
  return JSON.stringify(costPolicyBinding(left)) === JSON.stringify(costPolicyBinding(right));
}

function invocationDigest<T>(spec: InvokeSpec<T>, policy: ModelCostPolicy | undefined): string {
  const supplied = spec.requestDigest ?? spec.model.requestDigest;
  if (supplied && /^[0-9a-f]{64}$/.test(supplied)) {
    if (!policy) return supplied;
    return createHash('sha256').update(JSON.stringify({ requestDigest: supplied, costPolicy: costPolicyBinding(policy) })).digest('hex');
  }
  // Compatibility for local scripted models only. Production `modelFor` always provides a content digest.
  return createHash('sha256').update(JSON.stringify({ legacy: `${spec.service ?? ''}:${spec.idempotencyKey}`, costPolicy: costPolicyBinding(policy) })).digest('hex');
}

function resolvedLogicalNodeKey<T>(spec: InvokeSpec<T>): string | undefined {
  if (spec.operation) {
    // The registry is the only construction path for this shape: the caller
    // supplies an operation id plus an explicit business revision and can
    // never widen, reuse or forge node text.
    if (spec.logicalNodeKey?.trim()) return undefined;
    const resolved = resolveModelOperation(spec.operation.id, spec.operation.businessRevision);
    if (!resolved.ok) return undefined;
    return resolved.logicalNodeKey;
  }
  const explicit = spec.logicalNodeKey?.trim();
  if (explicit) {
    if (explicit.length > 512 || /[\u0000\r\n]/.test(explicit)) return undefined;
    return explicit;
  }
  // The production requirement prevents a new caller from accidentally using
  // every idempotency-key variant as an independent billable node. Keep local
  // scripted tests/source-compatibility on the legacy identity until MODEL-OP-01
  // has made the operation registry the sole construction path.
  const strict = process.env.NODE_ENV?.trim().toLowerCase() === 'production'
    || process.env.MODEL_COST_ENFORCEMENT?.trim().toLowerCase() === 'enforce';
  return strict ? undefined : `legacy:${spec.idempotencyKey}`;
}
function validUsage(usage: ModelUsage | undefined, policy: ModelCostPolicy): ModelUsage | undefined {
  const fallback = usage ?? { inputTokens: policy.maxInputTokens, outputTokens: policy.maxOutputTokens };
  if (!Number.isInteger(fallback.inputTokens) || !Number.isInteger(fallback.outputTokens)
    || fallback.inputTokens < 0 || fallback.outputTokens < 0
    || fallback.inputTokens > policy.maxInputTokens || fallback.outputTokens > policy.maxOutputTokens) return undefined;
  // 保守估算(若有)必须是非负安全整数;损坏的估算会让对账结论失效,故 fail-closed(走 unknown 收口)而非静默丢弃。
  if (fallback.estimateInputTokens !== undefined
    && (!Number.isSafeInteger(fallback.estimateInputTokens) || fallback.estimateInputTokens < 1)) return undefined;
  return fallback;
}

async function persistTrace(
  c: Client, owner: string, spec: Pick<InvokeSpec<unknown>, 'idempotencyKey' | 'service'>,
  stored: unknown, usage: ModelUsage | undefined, latencyMs: number, requestId: string | null,
): Promise<void> {
  // estimate_input_tokens = 派发前保守估算(byteEstimate 字节上界)。与 input_tokens(供应商上报 usage)配对,
  // 供异步 usage 对账判断"保守估算是否被击穿"。估算无法事后重算(原始 prompt 因隐私只落 digest),故必须此刻落库。
  // 已知缺口:本函数只在输出校验通过(`!error`)时调用——schema/业务校验失败的可计费调用虽仍 settle 成本、即时低估
  // metric 仍触发,但 estimate↔usage 配对不落 trace(output 列 NOT NULL 仅存成功输出),异步 reconciler 的校准样本
  // 会偏向校验成功样本。建造 reconciler 时需决定:给 ai_model_invocation 补 estimate 列(覆盖全 outcome),或显式
  // 声明"只校准校验成功样本"这一边界。
  if (await hasRequestIdColumn(c)) {
    await c.query(
      `INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service,input_tokens,output_tokens,estimate_input_tokens,latency_ms,request_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(owner_user_id,idempotency_key) DO NOTHING`,
      [owner, spec.idempotencyKey, stored, spec.service, usage?.inputTokens ?? null, usage?.outputTokens ?? null, usage?.estimateInputTokens ?? null, latencyMs, requestId],
    );
  } else {
    await c.query(
      `INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service,input_tokens,output_tokens,estimate_input_tokens,latency_ms)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(owner_user_id,idempotency_key) DO NOTHING`,
      [owner, spec.idempotencyKey, stored, spec.service, usage?.inputTokens ?? null, usage?.outputTokens ?? null, usage?.estimateInputTokens ?? null, latencyMs],
    );
  }
}

/**
 * Calls the model with a durable pre-dispatch claim.  `pool` (rather than a
 * transaction `Client`) is intentional: every DB interaction is a short,
 * principal-scoped transaction and the remote call holds neither a connection
 * nor an advisory lock.
 */
export async function invoke<T>(spec: InvokeSpec<T>, pool: DbPool, owner: string): Promise<InvokeOutcome<T>> {
  const logicalNodeKey = resolvedLogicalNodeKey(spec);
  if (!logicalNodeKey) {
    if (spec.operation) {
      const resolved = resolveModelOperation(spec.operation.id, spec.operation.businessRevision);
      if (!resolved.ok) return { error: resolved.error };
      return { error: 'model_logical_node_key_conflict' };
    }
    return { error: 'model_logical_node_key_required' };
  }
  // MODEL-OP-02 准入分区（服务器派生，绝不 caller 供）。仅 operation-scoped 路径；
  // legacy cost-policy-only 调用返回 undefined（走 MODEL-OP-00 账本，不折入共享分区）。
  const admissionPartition = resolveModelAdmissionPartition(spec);
  const requestId = spec.requestId ?? requestIdStore.getStore() ?? null;
  const waitMs = modelInvocationWaitMs(spec);
  const executionTimeoutMs = modelExecutionTimeoutMs(spec);
  const deadline = Date.now() + waitMs;
  const tracer = getTracer();
  const span = (attempt: number, outcome: ModelCallOutcome, latencyMs: number, usage?: ModelUsage) =>
    tracer.record({ owner, idempotencyKey: spec.idempotencyKey, threadId: spec.threadId, attempt, outcome, latencyMs, service: spec.service, sources: spec.sources ?? [], retrieval: spec.retrieval, inputTokens: usage?.inputTokens, outputTokens: usage?.outputTokens });

  // Routing/breaker selection is pure pre-dispatch work. It can choose backup
  // only when primary is already unavailable; it must not send a request.
  const preparePlan = async (): Promise<{ plan?: ModelCallPlan; timedOut: boolean }> => {
    let timedOut = false;
    try {
      const plan = await withAbortTimeout(
        (signal) => spec.model.prepare
          ? Promise.resolve(spec.model.prepare(1, signal))
          : Promise.resolve({ ready: true as const, execute: (executeSignal?: AbortSignal) => spec.model.call(1, executeSignal), cost: undefined }),
        executionTimeoutMs,
        () => { timedOut = true; },
      );
      return { plan, timedOut };
    } catch { return { timedOut }; }
  };
  const initial = await preparePlan();
  if (!initial.plan) {
    // `prepare` is contractually pre-dispatch, so a deadline here creates no
    // billable ambiguity and must not leave an invocation claim behind.
    span(0, 'exhausted', 0);
    return { error: initial.timedOut ? 'model_prepare_timeout' : 'model_prepare_failed' };
  }
  if (initial.plan.ready === false) { span(0, 'deterministic_refusal', 0); return { error: initial.plan.error }; }
  let plan: ReadyModelCallPlan = initial.plan;
  // The scope becomes part of the durable claim before any local admission
  // lease is taken.  Reject malformed trusted configuration here so a database
  // encoding/constraint error cannot escape the claim loop or strand a caller.
  const initialCostPolicyError = costPolicyError(plan.cost);
  if (initialCostPolicyError) {
    span(0, 'deterministic_refusal', 0);
    return { error: initialCostPolicyError };
  }
  // Route selection is pure. Bind the actually selected endpoint policy only
  // after it is known, but still before the durable claim is created.
  const digest = invocationDigest(spec, plan.cost);

  let leaseToken: string | undefined;
  let sharedLease: SharedModelAdmissionLease | undefined;
  for (;;) {
    const token = randomUUID();
    const claim = await asPrincipal(pool, owner, (c) => claimModelInvocation(c, {
      owner, idempotencyKey: spec.idempotencyKey, logicalNodeKey, requestDigest: digest, service: spec.service,
      requestId, leaseToken: token, leaseSeconds: 60, costScopeId: plan.cost?.scopeId,
      provider: plan.cost?.provider, model: plan.cost?.model, region: plan.cost?.region,
      priceRevision: plan.cost?.priceRevision, maxInputTokens: plan.cost?.maxInputTokens,
      maxOutputTokens: plan.cost?.maxOutputTokens,
      estimateInputTokens: plan.estimateInputTokens,
    }));
    if (claim.action === 'execute') { leaseToken = claim.leaseToken; break; }
    if (claim.action === 'cached') { span(0, 'cached', 0); return { value: claim.output as T }; }
    if (claim.action === 'failed' || claim.action === 'unknown') { span(0, 'deterministic_refusal', 0); return { error: claim.error }; }
    if (Date.now() >= deadline) { span(0, 'exhausted', 0); return { error: 'model_invocation_wait_timeout' }; }
    // Followers must join, never execute.  20ms is still a real poll of durable
    // status (claimed/dispatching → succeeded), not an in-process single-flight.
    await sleep(20);
  }

  // MODEL-OP-02 共享准入 + 断路器入场 + 并发槽认领（单一权威，取代 per-adapter 限流）。
  // 在 durable claim 之后、派发边界之前执行：拒绝=known-not-sent，claim 可安全 failed。
  // 决策 fail-closed（unknown/blocked/breaker_open/concurrency_exhausted → 确定性拒绝，零外呼）。
  if (admissionPartition) {
    const shared = await admitSharedModelOperation(pool, owner, {
      partition: admissionPartition, scopeId: plan.cost?.scopeId, idempotencyKey: spec.idempotencyKey,
    });
    if (!shared.ok) {
      await asPrincipal(pool, owner, async (c) => {
        if (!await failModelInvocationClaim(c, owner, spec.idempotencyKey, leaseToken!, shared.error))
          throw new Error('model_invocation_admission_state');
      });
      span(0, 'deterministic_refusal', 0);
      return { error: shared.error };
    }
    sharedLease = shared.lease;
  }

  // Do not mark the logical request dispatched while it merely sits in a
  // local concurrency/RPM queue.  If admission cannot happen before this
  // deadline, its AbortSignal removes the waiter and the durable claim is
  // failed as known-not-sent; no cost reservation nor provider request exists.
  let admission: ModelAdmission | undefined;
  let admissionTimedOut = false;
  let admissionError: unknown;
  // A half-open follower learns that fact only while acquiring a local probe.
  // Re-run the *pure* route selection exactly once: failoverModel will now see
  // the held primary as pre-dispatch unavailable and may choose its backup.
  // All other admission errors are terminal before dispatch.
  for (let routeRetry = 0; routeRetry < 2; routeRetry++) {
    try {
      if (plan.admit) {
        admission = await withAbortTimeout(
          async (signal) => {
            const acquired = await plan!.admit!(signal);
            // A non-cooperative admission implementation can resolve after the
            // gateway deadline.  It must release itself immediately rather than
            // leak a local slot/probe that no caller can now reach.
            if (signal.aborted) {
              acquired.release();
              throw new Error('model_execution_aborted');
            }
            return acquired;
          },
          executionTimeoutMs,
          () => { admissionTimedOut = true; },
        );
      }
      admissionError = undefined;
      break;
    } catch (error) {
      admissionError = error;
      if (!isHalfOpenFollower(error) || routeRetry === 1) break;
      const replacement = await preparePlan();
      if (!replacement.plan) { admissionTimedOut = admissionTimedOut || replacement.timedOut; break; }
      if (replacement.plan.ready === false) { admissionError = new Error(replacement.plan.error); break; }
      // Cost scope is an idempotency boundary.  A route may fail over only
      // inside the same tenant budget; changing it after the durable claim
      // would make reconciliation ambiguous.
      if (!sameCostPolicyBinding(replacement.plan.cost, plan.cost)) {
        // The claim already freezes a request/cost identity. A late half-open
        // route change cannot switch models or price rows beneath it; callers
        // must create an explicit new business revision instead.
        admissionError = new Error('model_failover_cost_policy_mismatch');
        break;
      }
      plan = replacement.plan;
    }
  }
  if (admissionError) {
    // 只对已知的守卫消息放行具体错误码,不把任意 provider 抛错串进来当可观测语义。
    // 否则半开 route-retry 跨 cost policy 的确定性拒绝会被吞成通用 model_admission_failed,调用方与
    // durable claim 都看不到 model_failover_cost_policy_mismatch(可观测性缺口,非正确性:拒绝本身已发生)。
    const code = admissionError instanceof Error && admissionError.message === 'model_failover_cost_policy_mismatch'
      ? 'model_failover_cost_policy_mismatch'
      : (admissionTimedOut ? 'model_admission_timeout' : 'model_admission_failed');
    await asPrincipal(pool, owner, async (c) => {
      if (!await failModelInvocationClaim(c, owner, spec.idempotencyKey, leaseToken!, code))
        throw new Error('model_invocation_admission_state');
    });
    // MODEL-OP-02：本地 admission（plan.admit）失败仍必须释放已取得的共享槽/探针。
    // 当前生产 wiring 的 operation-scoped 模型已无本地 admit，故 sharedLease 通常 undefined（no-op）；
    // 此分支是防御性收口，防止未来有本地+共享双层 admission 的模型在此泄漏共享租约。
    await releaseSharedAdmissionBestEffort(pool, owner, sharedLease, 'no_signal');
    span(0, admissionTimedOut ? 'exhausted' : 'deterministic_refusal', 0);
    return { error: code };
  }

  const policy = plan.cost;
  let reservationDecision: string | undefined;
  let dispatch: { ok: true } | { ok: false; error: string };
  try {
    dispatch = await asPrincipal(pool, owner, async (c) => {
      if (spec.privacyInterviewId) {
        // This shares the deletion transaction's advisory lock. It must be a
        // boolean query rather than a throwing assertion: an SQL exception
        // aborts the transaction and would make the following durable
        // known-not-sent transition impossible.
        if (!await isInterviewPrivacyActive(c, spec.privacyInterviewId)) {
          if (!await failModelInvocationClaim(c, owner, spec.idempotencyKey, leaseToken!, 'privacy_fenced_pre_dispatch'))
            throw new Error('model_invocation_privacy_fence_state');
          return { ok: false as const, error: 'privacy_fenced_pre_dispatch' };
        }
      }
      if (policy) {
        const reserve = await reserveAiTextCost(c, {
          scopeId: policy.scopeId, requestOwner: owner, idempotencyKey: spec.idempotencyKey,
          provider: policy.provider, model: policy.model, region: policy.region, priceRevision: policy.priceRevision,
          maxInputTokens: policy.maxInputTokens, maxOutputTokens: policy.maxOutputTokens,
        });
        reservationDecision = reserve.decision;
        if (reserve.decision !== 'reserved' && reserve.decision !== 'held') {
          await failModelInvocationClaim(c, owner, spec.idempotencyKey, leaseToken!, `cost_${reserve.decision}`);
          return { ok: false as const, error: `cost_${reserve.decision}` };
        }
      }
      const marked = await markModelInvocationDispatched(c, owner, spec.idempotencyKey, leaseToken!, policy?.scopeId);
      if (!marked) throw new Error('model_invocation_dispatch_state');
      if (policy) {
        const costMarked = await markAiCostDispatched(c, policy.scopeId, owner, spec.idempotencyKey);
        if (!costMarked) throw new Error('model_cost_dispatch_state');
      }
      return { ok: true as const };
    });
  } catch {
    // No external request has started before this transaction commits. Release
    // local admission capacity on every database/pre-dispatch failure; best
    // effort closes the durable claim, while a DB outage remains safe to retry
    // after its claimed lease expires because no supplier call was made.
    admission?.release();
    // MODEL-OP-02 共享槽/探针释放（no_signal：相位不变，只还槽/探针；无 provider 外呼）。
    await releaseSharedAdmissionBestEffort(pool, owner, sharedLease, 'no_signal');
    await asPrincipal(pool, owner, async (c) => {
      await failModelInvocationClaim(c, owner, spec.idempotencyKey, leaseToken!, 'model_dispatch_preflight_failed');
    }).catch(() => undefined);
    span(0, 'exhausted', 0);
    return { error: 'model_dispatch_preflight_failed' };
  }
  if (!dispatch.ok) {
    admission?.release();
    // MODEL-OP-02 共享槽/探针释放（确定性拒绝：隐私围栏 / cost reserve 拒绝，未派发）。
    await releaseSharedAdmissionBestEffort(pool, owner, sharedLease, 'no_signal');
    span(0, 'deterministic_refusal', 0);
    return { error: dispatch.error };
  }
  if (policy && reservationDecision) getMetrics().inc(METRIC.modelCostDecisions, { decision: reservationDecision });

  const started = performance.now();
  let result: ModelResult;
  let executionTimedOut = false;
  try {
    result = await withAbortTimeout((signal) => plan.execute(signal), executionTimeoutMs, () => { executionTimedOut = true; });
  }
  catch { result = { ok: false, kind: 'transient', externalOutcome: 'unknown' }; }
  finally { admission?.release(); }
  const latencyMs = Math.round(performance.now() - started);

  if (!result.ok) {
    const knownNotExecuted = result.externalOutcome === 'known_not_executed' || (result.externalOutcome === undefined && result.kind === 'deterministic');
    if (knownNotExecuted) {
      await asPrincipal(pool, owner, async (c) => {
        if (policy) await markAiTextCostRejected(c, policy.scopeId, owner, spec.idempotencyKey);
        await completeModelInvocation(c, { owner, idempotencyKey: spec.idempotencyKey, error: result.kind === 'deterministic' ? 'deterministic_refusal' : 'provider_rejected', latencyMs });
      });
      // MODEL-OP-02：确定性拒绝（known-not-executed）无 provider 信号 → breaker no_signal；
      // 计费调用记 0 扣费的 rejected 钱记录。
      await releaseSharedAdmissionBestEffort(pool, owner, sharedLease, 'no_signal', policy ? {
        scopeId: policy.scopeId, priceRevision: policy.priceRevision,
        inputTokens: 0, outputTokens: 0, settledMicroCny: 0, feeStatus: 'rejected',
        reasonCode: result.kind === 'deterministic' ? 'deterministic_refusal' : 'provider_rejected',
      } : undefined);
      if (policy) getMetrics().inc(METRIC.modelCostDecisions, { decision: 'rejected' });
      span(1, 'deterministic_refusal', latencyMs);
      return { error: result.kind === 'deterministic' ? 'deterministic_refusal' : 'provider_rejected' };
    }
    const unknownReason = executionTimedOut ? 'model_execution_timeout' : 'external_outcome_unknown';
    await asPrincipal(pool, owner, async (c) => {
      if (policy && !await markAiCostUnknown(c, policy.scopeId, owner, spec.idempotencyKey, unknownReason))
        throw new Error('model_cost_unknown_state');
      if (!await markModelInvocationUnknown(c, owner, spec.idempotencyKey, unknownReason))
        throw new Error('model_invocation_unknown_state');
    });
    // MODEL-OP-02：provider 失败/超时 → breaker failure（可能开闸）；计费调用记 unknown 钱记录（待对账）。
    await releaseSharedAdmissionBestEffort(pool, owner, sharedLease, 'failure', policy ? {
      scopeId: policy.scopeId, priceRevision: policy.priceRevision,
      inputTokens: null, outputTokens: null, settledMicroCny: null, feeStatus: 'unknown', reasonCode: unknownReason,
    } : undefined);
    if (policy) getMetrics().inc(METRIC.modelCostDecisions, { decision: 'unknown' });
    span(1, 'exhausted', latencyMs);
    return { error: 'external_outcome_unknown' };
  }

  // A successful HTTP response proves that the supplier may have charged. Bad
  // JSON/schema/business output is therefore terminal for this logical key;
  // callers may explicitly create a new, versioned repair request if desired.
  const settledUsage = policy ? validUsage(result.usage, policy) : result.usage;
  if (policy && !settledUsage) {
    await asPrincipal(pool, owner, async (c) => {
      if (!await markAiCostUnknown(c, policy.scopeId, owner, spec.idempotencyKey, 'provider_usage_invalid'))
        throw new Error('model_cost_unknown_state');
      if (!await markModelInvocationUnknown(c, owner, spec.idempotencyKey, 'provider_usage_invalid'))
        throw new Error('model_invocation_unknown_state');
    });
    // MODEL-OP-02：provider 已响应（HTTP 200）但 usage 非法 → breaker success（传输健康），
    // 钱记 unknown 待对账（无法结算）。
    await releaseSharedAdmissionBestEffort(pool, owner, sharedLease, 'success', {
      scopeId: policy.scopeId, priceRevision: policy.priceRevision,
      inputTokens: null, outputTokens: null, settledMicroCny: null, feeStatus: 'unknown', reasonCode: 'provider_usage_invalid',
    });
    getMetrics().inc(METRIC.modelCostDecisions, { decision: 'unknown' });
    span(1, 'exhausted', latencyMs, result.usage);
    return { error: 'external_outcome_unknown' };
  }

  // 保守估算(byteEstimate 字节上界)vs 供应商上报 usage 的对账证据。provider > estimate 是"保守估算被击穿"的
  // 预期失效模式(供应商 prompt_tokens 含消息框架/特殊/schema token,byte 只支配渲染文本 token),绝不静默吞掉:
  // 显式落 metric 供告警。批量版本化校准(导出因子)由未来异步 reconciler 读 ai_invocation_trace 的 estimate/usage
  // 列、用 usage-reconciliation 完成——此处只做即时违约标记。
  if (policy && settledUsage && settledUsage.estimateInputTokens !== undefined
    && settledUsage.inputTokens > settledUsage.estimateInputTokens) {
    getMetrics().inc(METRIC.modelEstimateUnderestimated);
  }

  const validated = doubleValidate(spec.schema, spec.businessValidate, result.raw);
  // 返回给调用方的 error 保留业务 reason 可读性(`business:${reason}`)；落库的 error_code 必须是
  // 稳定 ASCII 机器码(0088 强约束 `^[A-Za-z0-9._:-]{1,120}$`，中文 reason 会触发
  // ai_model_terminalize_invalid_input、被 catch 误记为 unknown)。二者分离。
  const error = validated.ok ? undefined : (validated.stage === 'schema' ? 'schema_validation_failed' : `business:${validated.reason}`);
  const errorCode = validated.ok ? undefined : (validated.stage === 'schema' ? 'schema_validation_failed' : 'business_validation_failed');
  let stored: unknown;
  let value: T | undefined;
  let settledCost = 0;
  if (validated.ok) {
    value = validated.value;
    stored = spec.storeOutput ? spec.storeOutput(value) : (spec.redactOutput ? { redacted: true } : value);
  }
  try {
    await asPrincipal(pool, owner, async (c) => {
      if (policy) {
        settledCost = await settleAiTextCost(c, policy.scopeId, owner, spec.idempotencyKey, settledUsage!.inputTokens, settledUsage!.outputTokens);
      }
      // A redacted invocation result cannot be replayed. Persist its encrypted
      // domain artifact atomically with the durable success marker, otherwise a
      // crash in the tiny “model returned → domain save” window would make a
      // paid OCR result unrecoverable and tempt a duplicate provider request.
      if (validated.ok && spec.persistValidatedOutput) await spec.persistValidatedOutput(c, value!);
      const completed = await completeModelInvocation(c, {
        owner, idempotencyKey: spec.idempotencyKey, output: stored, replayable: !spec.redactOutput,
        error: errorCode, inputTokens: settledUsage?.inputTokens, outputTokens: settledUsage?.outputTokens, latencyMs,
      });
      if (!completed) throw new Error('model_invocation_complete_state');
      if (!error) await persistTrace(c, owner, spec, stored, settledUsage, latencyMs, requestId);
    });
    // MODEL-OP-02：provider 成功 + 结算成功 → breaker success（复位相位）；计费调用记 settled 钱记录
    // （真实扣费金额 + 版本化价格策略 + 双向 token），与 ai_cost_reservation 的钱账可对账。
    await releaseSharedAdmissionBestEffort(pool, owner, sharedLease, 'success', policy ? {
      scopeId: policy.scopeId, priceRevision: policy.priceRevision,
      inputTokens: settledUsage?.inputTokens ?? null, outputTokens: settledUsage?.outputTokens ?? null,
      settledMicroCny: settledCost, feeStatus: 'settled',
    } : undefined);
    if (policy) {
      getMetrics().inc(METRIC.modelCostDecisions, { decision: 'settled' });
      getMetrics().inc(METRIC.modelCostSettledMicroCny, undefined, settledCost);
    }
  } catch {
    // We received a billable response but could not durably settle/record it.
    // Preserve the reservation for reconciliation and refuse replay.
    // MODEL-OP-02：provider 已响应但结算/落账失败 → breaker success（传输健康，非 provider 故障），
    // 钱记 unknown 待对账（ai_cost_reservation 已保留 reservation，可后续 reconcile）。
    await releaseSharedAdmissionBestEffort(pool, owner, sharedLease, 'success', policy ? {
      scopeId: policy.scopeId, priceRevision: policy.priceRevision,
      inputTokens: null, outputTokens: null, settledMicroCny: null, feeStatus: 'unknown', reasonCode: 'settlement_or_record_failed',
    } : undefined);
    await asPrincipal(pool, owner, async (c) => {
      if (policy) await markAiCostUnknown(c, policy.scopeId, owner, spec.idempotencyKey, 'settlement_or_record_failed').catch(() => undefined);
      await markModelInvocationUnknown(c, owner, spec.idempotencyKey, 'settlement_or_record_failed').catch(() => undefined);
    }).catch(() => undefined);
    if (policy) getMetrics().inc(METRIC.modelCostDecisions, { decision: 'unknown' });
    span(1, 'exhausted', latencyMs, settledUsage);
    return { error: 'external_outcome_unknown' };
  }
  if (error) {
    span(1, error.startsWith('business:') ? 'business_error' : 'schema_retry', latencyMs, settledUsage);
    return { error };
  }
  span(1, 'ok', latencyMs, settledUsage);
  return { value: value! };
}
