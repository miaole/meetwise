/**
 * G4 / GAP-RAG-04 — production-scoped retrieve (partial P-WIRE).
 *
 * Maps an InterviewRouteSnapshot primary leaf → QbankServingScopeInput so
 * Worker `localRetrieve` can forward `scope` into `cachedQbankSearch`.
 *
 * HARD honesty:
 * - Partial wire only: scope from snapshot leaf when a row exists.
 * - Missing / invalid snapshot is a retrieval denial, never an unscoped query.
 *   The consumer turns the denial into degradedRetrieval('route_snapshot_missing')
 *   so CRAG does not mistake it for an empty question bank or fall back to web.
 * - Scope helper itself does NOT call `dispatchTrackLocalRetrieval` (call lives in
 *   `qbank-track-local-retrieve.ts` / REAL-WIRE-IMPL). This module remains the G-R2-5
 *   decide gate + compat primary-leaf resolver.
 * - Does NOT prove wrong_track=0. Does NOT claim 题域已隔离 / R4 closed.
 * - Primary leaf resolver (max allocationBps) for compat; production per-turn leaf
 *   comes from planner via retrieveViaDispatchTrackLocal.
 * - releaseEvidence=false · Not HA · ≠ cutover · ≠ flip default.
 */
import {
  JOB_ROUTE_TAXONOMY_VERSION,
  type InterviewRouteSnapshotView,
  type QbankServingScopeInput,
} from '@meetwise/db';

/** Same leaf shape as packages/db serving-scope validator / taxonomy leaves. */
const SERVING_SCOPE_RE = /^[a-z][a-z0-9_]*(\/[a-z][a-z0-9_]*){0,3}$/;
const TAXONOMY_VERSION_RE = /^v[1-9][0-9]{0,15}$/;

export type RouteSnapshotScopeSource = Pick<InterviewRouteSnapshotView, 'allocations'> | null | undefined;

export type RouteSnapshotRetrieveDecision =
  | { allowed: true; scope: QbankServingScopeInput }
  | { allowed: false; reason: 'route_snapshot_missing' };

/**
 * Pick the highest-bps leaf as serving_scope_id (tie → first). Returns undefined
 * when there is no usable snapshot leaf — never invents a track.
 */
export function resolveServingScopeFromRouteSnapshot(
  snapshot: RouteSnapshotScopeSource,
  taxonomyVersion: string = JOB_ROUTE_TAXONOMY_VERSION,
): QbankServingScopeInput | undefined {
  if (!snapshot || !Array.isArray(snapshot.allocations) || snapshot.allocations.length === 0) {
    return undefined;
  }
  if (typeof taxonomyVersion !== 'string' || !TAXONOMY_VERSION_RE.test(taxonomyVersion)) {
    return undefined;
  }
  let best: { leafTrackId: string; allocationBps: number } | undefined;
  for (const raw of snapshot.allocations) {
    if (!raw || typeof raw !== 'object') continue;
    const leaf = typeof raw.leafTrackId === 'string' ? raw.leafTrackId.trim() : '';
    const bps = Number(raw.allocationBps);
    if (!leaf || !SERVING_SCOPE_RE.test(leaf) || !Number.isFinite(bps)) continue;
    if (!best || bps > best.allocationBps) best = { leafTrackId: leaf, allocationBps: bps };
  }
  if (!best) return undefined;
  return { taxonomyVersion, servingScopeId: best.leafTrackId };
}

/**
 * Convert the optional resolver result into an explicit retrieve decision.
 * Keeping this separate from the scope resolver makes the no-snapshot policy
 * testable without constructing a DB consumer and prevents callers from
 * treating `undefined` as permission to omit the serving filter.
 */
export function decideRouteSnapshotRetrieve(
  snapshot: RouteSnapshotScopeSource,
  taxonomyVersion: string = JOB_ROUTE_TAXONOMY_VERSION,
): RouteSnapshotRetrieveDecision {
  const scope = resolveServingScopeFromRouteSnapshot(snapshot, taxonomyVersion);
  return scope ? { allowed: true, scope } : { allowed: false, reason: 'route_snapshot_missing' };
}
