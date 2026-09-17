/**
 * R2 P-WORKER + P-FAKE pin — sole classify Worker for job_semantic_revision.route_pending.
 *
 * claim/drain → classifyJobRoute({ modelClassify: createJobRouteModelClassify(...) })
 * via MODEL-OP `job.route-classify.v1` binding (honest, not fake rule-only).
 *
 * P-FAKE: forbidden to claim R2 closed / 路由已生效 via a rule-only Worker or any
 * apps path that calls classifyJobRoute without createJobRouteModelClassify.
 * Legitimate rule_unique_leaf (modelCalls=0) still runs inside classifyJobRoute
 * after this MODEL-OP-bound consumer supplies modelClassify — that is NOT P-FAKE.
 *
 * Closing P-WORKER / pinning P-FAKE ≠ R2 closed · ≠ 路由已生效 · ≠ R4 / HA.
 * releaseEvidence=false · Not HA · no flip default · no open DELETE.
 */
import {
  asPrincipal, gatewayDispatchOwners, classifyJobRoute, listNextJobRoutePending, type DbPool,
} from '@meetwise/db';
import { createJobRouteModelClassify, type ModelClient } from '@meetwise/ai-runtime';
import { runDrainLoop } from './drain-loop.ts';
import { drainOwnersInListedOrder } from './owner-queue-drain.ts';

export interface RouteClassifyConsumerDeps {
  pool: DbPool;
  model: ModelClient;
}

export type RouteClassifyDrainResult = 'classified' | 'idle' | 'noop' | 'failed';

/** Claim one route_pending revision and run classifyJobRoute with MODEL-OP modelClassify. */
export async function drainRouteClassifyOnce(
  d: RouteClassifyConsumerDeps,
  owner: string,
): Promise<RouteClassifyDrainResult> {
  const pending = await asPrincipal(d.pool, owner, (c) => listNextJobRoutePending(c));
  if (!pending) return 'idle';

  const modelClassify = createJobRouteModelClassify({ pool: d.pool, owner, model: d.model });
  try {
    const result = await classifyJobRoute(d.pool, owner, pending.jobId, pending.revision, { modelClassify });
    if (result.status === 'noop') return 'noop';
    return 'classified';
  } catch (e) {
    console.error('route-classify drain error', pending.jobId, pending.revision, e);
    return 'failed';
  }
}

export async function drainOwnerRouteClassify(d: RouteClassifyConsumerDeps, owner: string): Promise<void> {
  await drainOwnersInListedOrder(d, [owner], drainRouteClassifyOnce, (result) => result === 'idle');
}

/** One tick: gateway owner-id list → per-owner drain until idle. */
export async function routeClassifyDispatchTick(
  d: RouteClassifyConsumerDeps,
): Promise<{ owners: number }> {
  const owners = await gatewayDispatchOwners(d.pool, 'job_route');
  await drainOwnersInListedOrder(d, owners, drainRouteClassifyOnce, (result) => result === 'idle');
  return { owners: owners.length };
}

/** Resident drain loop (graceful stop waits for in-flight tick). */
export function runRouteClassifyConsumer(d: RouteClassifyConsumerDeps, intervalMs = 5000) {
  return runDrainLoop(async () => { await routeClassifyDispatchTick(d); }, intervalMs);
}
