/**
 * UC-028 A2 trace reconciliation backfill (trace 对账回补 sweep).
 *
 * The `ai_invocation_trace` write is a fail-open side channel: a lost trace
 * row never blocks or taints the business transaction, but until now it was
 * also lost forever.  The succeeded truth face (`ai_model_invocation` with
 * `error_code IS NULL`, output guaranteed non-null by its CHECK) is already a
 * durable zero-cost queue of exactly the invocations that should have a trace
 * row.  This loop re-inserts missing trace rows from that diff set — a verbatim
 * replay of the original INSERT semantics, idempotent on the 0001 PK arbiter.
 *
 * Discovery crosses owners through the gateway role (owner ids only); every
 * anti-join and backfill runs inside the owner's RLS `asPrincipal`
 * transaction.  Logs contain no owner, key, prompt, or provider payload.
 */
import {
  aiTraceBackfillScoped, asPrincipal, gatewayTraceReconMissingOwners, type DbPool,
} from '@meetwise/db';
import { getMetrics, METRIC } from '@meetwise/ai-runtime';
import { runDrainLoop } from './drain-loop.ts';

const DEFAULT_OWNER_LIMIT = 200;
const DEFAULT_KEY_LIMIT = 500;

export interface TraceReconConfig {
  /** Per-tick upper bound on owners taken from the gateway diff enumeration. */
  ownerLimit: number;
  /** Per-owner upper bound on missing keys backfilled in one transaction. */
  keyLimit: number;
}

function boundedInteger(raw: string | undefined, fallback: number, min: number, max: number, code: string): number {
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(code);
  return value;
}

/** Invalid backfill bounds are a startup error, not a silent policy change. */
export function resolveTraceReconConfig(env: NodeJS.ProcessEnv = process.env): TraceReconConfig {
  return {
    ownerLimit: boundedInteger(
      env.TRACE_RECON_OWNER_BATCH, DEFAULT_OWNER_LIMIT, 1, 10_000,
      'trace_recon_owner_batch_invalid',
    ),
    keyLimit: boundedInteger(
      env.TRACE_RECON_OWNER_KEY_BATCH, DEFAULT_KEY_LIMIT, 1, 10_000,
      'trace_recon_owner_key_batch_invalid',
    ),
  };
}

/**
 * One owner's transaction: keys still missing a trace row (succeeded and
 * error-free) are enumerated inside the principal scope and each is replayed
 * through the guarded backfill function.  A failure rolls the whole owner
 * transaction back; no half-backfilled owner can be committed.
 */
export async function traceReconOwner(pool: DbPool, owner: string, config: TraceReconConfig): Promise<number> {
  return asPrincipal(pool, owner, async (c) => {
    const missing = await c.query(
      `SELECT i.idempotency_key AS key
         FROM ai_model_invocation AS i
        WHERE i.status='succeeded' AND i.error_code IS NULL
          AND NOT EXISTS (
               SELECT 1 FROM ai_invocation_trace AS t
                WHERE t.owner_user_id = i.owner_user_id
                  AND t.idempotency_key = i.idempotency_key)
        LIMIT $1`,
      [config.keyLimit],
    );
    let backfilled = 0;
    for (const row of missing.rows) {
      if (await aiTraceBackfillScoped(c, owner, String(row.key))) backfilled++;
    }
    return backfilled;
  });
}

/**
 * Cross-owner dispatcher: the gateway role reveals only principals with
 * missing trace rows, then every mutation re-enters an RLS principal
 * transaction.  A malformed owner or database error cannot stop later owners;
 * however the tick *must* fail afterwards so its drain-loop readiness cannot
 * pretend that observability data loss is healthy.  The missing-owners water
 * level (diff owner count) is read after the owner loop — steady state 0,
 * >0 means backfilling lags behind.
 */
export async function traceReconTick(
  pool: DbPool, config: TraceReconConfig = resolveTraceReconConfig(),
): Promise<{ owners: number; backfilled: number }> {
  let candidates: string[];
  try {
    candidates = await gatewayTraceReconMissingOwners(pool, config.ownerLimit);
  } catch {
    console.error('trace reconciliation enumeration failed');
    throw new Error('trace_recon_enumeration_failed');
  }
  let owners = 0;
  let backfilled = 0;
  let ownerFailures = 0;
  for (const owner of candidates) {
    try {
      const inserted = await traceReconOwner(pool, owner, config);
      owners++;
      if (inserted > 0) getMetrics().inc(METRIC.aiTraceReconBackfilled, undefined, inserted);
      backfilled += inserted;
    } catch {
      ownerFailures++;
      console.error('trace reconciliation owner failed');
    }
  }
  try {
    const residual = await gatewayTraceReconMissingOwners(pool, config.ownerLimit);
    getMetrics().setGauge(METRIC.aiTraceReconMissing, residual.length);
  } catch {
    console.error('trace reconciliation water level failed');
    throw new Error('trace_recon_backlog_failed');
  }
  if (ownerFailures > 0) throw new Error('trace_recon_owner_failed');
  return { owners, backfilled };
}

/** A 30s cadence matches the reconcile loop family (drain-loop default). */
export function runTraceReconReconciler(
  pool: DbPool, config: TraceReconConfig = resolveTraceReconConfig(), intervalMs = 30_000,
) {
  return runDrainLoop(() => traceReconTick(pool, config).then(() => undefined), intervalMs);
}
