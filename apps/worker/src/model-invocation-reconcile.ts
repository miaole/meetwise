/**
 * Post-dispatch model terminalization (模型派发后终态化).
 *
 * A database outage after the provider request leaves the outside world
 * indeterminate.  This worker never retries or releases that request: it
 * atomically changes the durable invocation and every matching cost
 * reservation from `dispatching` to `unknown`, so a later caller cannot send
 * the same idempotency key again.
 */
import {
  asPrincipal, gatewayModelInvocationOwners, markAiCostsUnknownForModelReconcile,
  reconcileStaleModelInvocations, type DbPool,
} from '@meetwise/db';
import { getMetrics, METRIC, resolveModelDeadlineConfig } from '@meetwise/ai-runtime';
import { runDrainLoop } from './drain-loop.ts';

const MIN_AGE_MS = 35_000;
const MAX_AGE_MS = 3_600_000;
const DEFAULT_AGE_MS = 120_000;
const DEFAULT_BATCH = 100;
// This is deliberately larger than an ordinary short transaction.  A model
// response may have reached the caller at the end of its deadline and still
// need to settle both the invocation and cost row.  Reconciliation must never
// declare that legitimate in-flight work ambiguous before this grace ends.
export const MODEL_INVOCATION_FINALIZATION_GRACE_MS = 30_000;

export interface ModelInvocationReconcileConfig {
  /** A request younger than this may still be returning from the provider. */
  olderThanMs: number;
  /** Per-owner upper bound; keeps one tenant from monopolising a worker tick. */
  limit: number;
}

function boundedInteger(raw: string | undefined, fallback: number, min: number, max: number, code: string): number {
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(code);
  return value;
}

/** Invalid reconciliation timing is a startup error, not a silent policy change. */
export function resolveModelInvocationReconcileConfig(env: NodeJS.ProcessEnv = process.env): ModelInvocationReconcileConfig {
  const olderThanMs = boundedInteger(
    env.MODEL_INVOCATION_RECONCILE_AFTER_MS, DEFAULT_AGE_MS, MIN_AGE_MS, MAX_AGE_MS,
    'model_invocation_reconcile_after_invalid',
  );
  const deadlines = resolveModelDeadlineConfig(env);
  if (olderThanMs <= deadlines.executionTimeoutMs + MODEL_INVOCATION_FINALIZATION_GRACE_MS)
    throw new Error('model_invocation_reconcile_after_before_execution_settlement');
  return {
    olderThanMs,
    limit: boundedInteger(
      env.MODEL_INVOCATION_RECONCILE_BATCH, DEFAULT_BATCH, 1, 1_000,
      'model_invocation_reconcile_batch_invalid',
    ),
  };
}

export interface ModelInvocationReconcileOutcome {
  invocations: number;
  frozenCosts: number;
}

/**
 * One owner's transaction.  If freezing a cost row fails, `asPrincipal`
 * rolls back the invocation transition too; no half-terminalized pair can be
 * committed.  `reconcileStaleModelInvocations` locks candidates with
 * `FOR UPDATE SKIP LOCKED`, so concurrent worker replicas divide the work.
 */
export async function reconcileModelInvocationOwner(
  pool: DbPool, owner: string, config: ModelInvocationReconcileConfig,
): Promise<ModelInvocationReconcileOutcome> {
  return asPrincipal(pool, owner, async (c) => {
    const invocations = await reconcileStaleModelInvocations(c, owner, config.olderThanMs, config.limit);
    let frozenCosts = 0;
    for (const invocation of invocations) {
      if (invocation.costScopeId)
        frozenCosts += await markAiCostsUnknownForModelReconcile(c, invocation.costScopeId, owner, invocation.idempotencyKey);
    }
    return { invocations: invocations.length, frozenCosts };
  });
}

/**
 * Cross-owner dispatcher: the gateway role reveals only principals with
 * stale dispatches, then every mutation re-enters an RLS principal
 * transaction.  A malformed owner or database error cannot stop later
 * owners; however the tick *must* fail afterwards so its drain-loop readiness
 * and critical alert cannot pretend that ambiguous billable work is healthy.
 * Logs contain no owner, key, prompt, or provider payload.
 */
export async function modelInvocationReconcileTick(
  pool: DbPool, config: ModelInvocationReconcileConfig = resolveModelInvocationReconcileConfig(),
): Promise<{ owners: number } & ModelInvocationReconcileOutcome> {
  let owners = 0;
  let invocations = 0;
  let frozenCosts = 0;
  let candidates: string[];
  try {
    candidates = await gatewayModelInvocationOwners(pool, config.olderThanMs);
  } catch {
    getMetrics().inc(METRIC.modelInvocationReconcileInvocations, { result: 'enumeration_failed' });
    console.error('model invocation reconciliation enumeration failed');
    throw new Error('model_invocation_reconcile_enumeration_failed');
  }
  let ownerFailures = 0;
  for (const owner of candidates) {
    try {
      const outcome = await reconcileModelInvocationOwner(pool, owner, config);
      owners++;
      invocations += outcome.invocations;
      frozenCosts += outcome.frozenCosts;
      if (outcome.invocations > 0)
        getMetrics().inc(METRIC.modelInvocationReconcileInvocations, { result: 'terminalized' }, outcome.invocations);
      if (outcome.frozenCosts > 0)
        getMetrics().inc(METRIC.modelInvocationReconcileFrozenCosts, undefined, outcome.frozenCosts);
    } catch {
      ownerFailures++;
      getMetrics().inc(METRIC.modelInvocationReconcileInvocations, { result: 'owner_failed' });
      console.error('model invocation reconciliation owner failed');
    }
  }
  if (ownerFailures > 0) throw new Error('model_invocation_reconcile_owner_failed');
  return { owners, invocations, frozenCosts };
}

/** A 30s cadence is below the minimum age and therefore cannot race a fresh send. */
export function runModelInvocationReconciler(
  pool: DbPool, config: ModelInvocationReconcileConfig = resolveModelInvocationReconcileConfig(), intervalMs = 30_000,
) {
  return runDrainLoop(() => modelInvocationReconcileTick(pool, config).then(() => undefined), intervalMs);
}
