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

const REQID_ALS_KEY = Symbol.for('meetwise.ai-runtime.requestIdContext');
const COST_SCOPE_ID = /^[A-Za-z0-9._:-]{1,160}$/;
const COST_PRICE_REVISION = /^[A-Za-z0-9._:-]{1,80}$/;
const gref = globalThis as unknown as Record<symbol, AsyncLocalStorage<string> | undefined>;
const requestIdStore: AsyncLocalStorage<string> = (gref[REQID_ALS_KEY] ??= new AsyncLocalStorage<string>());

let traceHasRequestId: boolean | null = null;
async function hasRequestIdColumn(c: Client): Promise<boolean> {
  if (traceHasRequestId === null) {
    const r = await c.query("SELECT 1 FROM information_schema.columns WHERE table_name='ai_invocation_trace' AND column_name='request_id'");
    traceHasRequestId = (r.rowCount ?? 0) > 0;
  }
  return traceHasRequestId;
}

export type ModelUsage = { inputTokens: number; outputTokens: number };
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
  return fallback;
}

async function persistTrace(
  c: Client, owner: string, spec: Pick<InvokeSpec<unknown>, 'idempotencyKey' | 'service'>,
  stored: unknown, usage: ModelUsage | undefined, latencyMs: number, requestId: string | null,
): Promise<void> {
  if (await hasRequestIdColumn(c)) {
    await c.query(
      `INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service,input_tokens,output_tokens,latency_ms,request_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(owner_user_id,idempotency_key) DO NOTHING`,
      [owner, spec.idempotencyKey, stored, spec.service, usage?.inputTokens ?? null, usage?.outputTokens ?? null, latencyMs, requestId],
    );
  } else {
    await c.query(
      `INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service,input_tokens,output_tokens,latency_ms)
       VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(owner_user_id,idempotency_key) DO NOTHING`,
      [owner, spec.idempotencyKey, stored, spec.service, usage?.inputTokens ?? null, usage?.outputTokens ?? null, latencyMs],
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
  if (!logicalNodeKey) return { error: 'model_logical_node_key_required' };
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
  for (;;) {
    const token = randomUUID();
    const claim = await asPrincipal(pool, owner, (c) => claimModelInvocation(c, {
      owner, idempotencyKey: spec.idempotencyKey, logicalNodeKey, requestDigest: digest, service: spec.service,
      requestId, leaseToken: token, leaseSeconds: 60, costScopeId: plan.cost?.scopeId,
    }));
    if (claim.action === 'execute') { leaseToken = claim.leaseToken; break; }
    if (claim.action === 'cached') { span(0, 'cached', 0); return { value: claim.output as T }; }
    if (claim.action === 'failed' || claim.action === 'unknown') { span(0, 'deterministic_refusal', 0); return { error: claim.error }; }
    if (Date.now() >= deadline) { span(0, 'exhausted', 0); return { error: 'model_invocation_wait_timeout' }; }
    await sleep(100);
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
    await asPrincipal(pool, owner, async (c) => {
      if (!await failModelInvocationClaim(c, owner, spec.idempotencyKey, leaseToken!, admissionTimedOut ? 'model_admission_timeout' : 'model_admission_failed'))
        throw new Error('model_invocation_admission_state');
    });
    span(0, admissionTimedOut ? 'exhausted' : 'deterministic_refusal', 0);
    return { error: admissionTimedOut ? 'model_admission_timeout' : 'model_admission_failed' };
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
    await asPrincipal(pool, owner, async (c) => {
      await failModelInvocationClaim(c, owner, spec.idempotencyKey, leaseToken!, 'model_dispatch_preflight_failed');
    }).catch(() => undefined);
    span(0, 'exhausted', 0);
    return { error: 'model_dispatch_preflight_failed' };
  }
  if (dispatch.ok === false) {
    admission?.release();
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

  if (result.ok === false) {
    const knownNotExecuted = result.externalOutcome === 'known_not_executed' || (result.externalOutcome === undefined && result.kind === 'deterministic');
    if (knownNotExecuted) {
      await asPrincipal(pool, owner, async (c) => {
        if (policy) await markAiTextCostRejected(c, policy.scopeId, owner, spec.idempotencyKey);
        await completeModelInvocation(c, { owner, idempotencyKey: spec.idempotencyKey, error: result.kind === 'deterministic' ? 'deterministic_refusal' : 'provider_rejected', latencyMs });
      });
      if (policy) getMetrics().inc(METRIC.modelCostDecisions, { decision: 'rejected' });
      span(1, 'deterministic_refusal', latencyMs);
      return { error: result.kind === 'deterministic' ? 'deterministic_refusal' : 'provider_rejected' };
    }
    await asPrincipal(pool, owner, async (c) => {
      const reason = executionTimedOut ? 'model_execution_timeout' : 'external_outcome_unknown';
      if (policy && !await markAiCostUnknown(c, policy.scopeId, owner, spec.idempotencyKey, reason))
        throw new Error('model_cost_unknown_state');
      if (!await markModelInvocationUnknown(c, owner, spec.idempotencyKey, reason))
        throw new Error('model_invocation_unknown_state');
    });
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
    getMetrics().inc(METRIC.modelCostDecisions, { decision: 'unknown' });
    span(1, 'exhausted', latencyMs, result.usage);
    return { error: 'external_outcome_unknown' };
  }

  const validated = doubleValidate(spec.schema, spec.businessValidate, result.raw);
  const error = validated.ok === true ? undefined : (validated.stage === 'schema' ? 'schema_validation_failed' : `business:${validated.reason}`);
  let stored: unknown;
  let value: T | undefined;
  let settledCost = 0;
  if (validated.ok === true) {
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
      if (validated.ok === true && spec.persistValidatedOutput) await spec.persistValidatedOutput(c, value!);
      const completed = await completeModelInvocation(c, {
        owner, idempotencyKey: spec.idempotencyKey, output: stored, replayable: !spec.redactOutput,
        error, inputTokens: settledUsage?.inputTokens, outputTokens: settledUsage?.outputTokens, latencyMs,
      });
      if (!completed) throw new Error('model_invocation_complete_state');
      if (!error) await persistTrace(c, owner, spec, stored, settledUsage, latencyMs, requestId);
    });
    if (policy) {
      getMetrics().inc(METRIC.modelCostDecisions, { decision: 'settled' });
      getMetrics().inc(METRIC.modelCostSettledMicroCny, undefined, settledCost);
    }
  } catch {
    // We received a billable response but could not durably settle/record it.
    // Preserve the reservation for reconciliation and refuse replay.
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
