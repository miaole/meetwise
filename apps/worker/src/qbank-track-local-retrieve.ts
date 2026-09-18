/**
 * R4 REAL-WIRE-IMPL — Worker retrieve main path:
 *   planInterviewTurn → validate → assemble RetrievalPlan (generationId+recipeId)
 *   → dispatchTrackLocalRetrieval → recheck.
 *
 * HARD honesty:
 * - Call site for `dispatchTrackLocalRetrieval(` lives here (consumed by interview-consumer).
 * - recheck_failed → fail-closed (no unscoped / sibling-leaf / question_ready).
 * - Missing/illegal snapshot → route_snapshot_missing (G-R2-5; no unscoped).
 * - P-FAKEPLAN banned: never stuff primary max-bps leaf without planner + generation/recipe.
 * - Wire green ≠ R4 closed ≠ wrong_track=0 (ADV separate; assert hooks below).
 * - F1 prod-surface: observe track-local outcomes (wrong_track / recheck / cache-replay /
 *   snapshot-missing) on the production call-path; observability ≠ R4 closed.
 * - releaseEvidence=false · Not HA.
 */
import {
  asPrincipal,
  activeQbankGeneration,
  dispatchTrackLocalRetrieval,
  type DbPool,
  type DispatchTrackLocalRetrievalDeps,
  type DispatchTrackLocalRetrievalResult,
  type InterviewRouteSnapshotView,
} from '@meetwise/db';
import { getMetrics, METRIC } from '@meetwise/ai-runtime';
import {
  assembleValidatedRetrievalPlan,
  assertWrongTrackZero,
  degradedRetrieval,
  isFailClosedWrongTrackRecheckReason,
  type ScoredRef,
  type WrongTrackHit,
} from '@meetwise/domain';

export type TrackLocalRetrieveDeps = Omit<DispatchTrackLocalRetrievalDeps, 'query'>;

/** Production injects a per-owner factory so budgeted embed closes over the job owner. */
export type TrackLocalRetrieveFactory = (owner: string) => TrackLocalRetrieveDeps;

/**
 * Parse CRAG query produced by adaptive-interview-service:
 *   `${competency} 难度${difficulty}`
 * Fail-closed on illegal competency/difficulty (no invented planner inputs).
 */
export function parseCragPlannerQuery(query: string): { competencyId: string; difficulty: number } | null {
  if (typeof query !== 'string') return null;
  const m = /^(.*)\s+难度([1-5])\s*$/u.exec(query.trim());
  if (!m) return null;
  const competencyId = m[1]!.trim();
  if (!competencyId || competencyId.length > 64 || /[\u0000-\u001f\u007f]/.test(competencyId)) return null;
  return { competencyId, difficulty: Number(m[2]) };
}

/**
 * Production wrong_track=0 enforcement when hits carry declared leaf/scope metadata.
 * Missing metadata counts as wrong (fail-closed). On failure → degraded; never sibling/unscoped.
 */
export function enforceWrongTrackZeroOnServed(
  allowedLeafTrackId: string,
  hits: readonly WrongTrackHit[],
): { ok: true; wrongTrack: 0 } | { ok: false; wrongTrack: number; refs: ScoredRef[] } {
  const a = assertWrongTrackZero(hits, allowedLeafTrackId);
  if (a.ok) return { ok: true, wrongTrack: 0 };
  return {
    ok: false,
    wrongTrack: a.wrongTrack,
    refs: [degradedRetrieval(`wrong_track:${a.wrongTrack}`)],
  };
}

/**
 * F1 production-surface — classify track-local ScoredRef[] into low-cardinality
 * observability outcomes (no owner/PII/query). Used by observeTrackLocalRetrieval.
 * EXIT/metric green ≠ R4 closed ≠ production wrong_track=0 fully closed.
 */
export const TRACK_LOCAL_OBS_OUTCOMES = [
  'ok',
  'route_snapshot_missing',
  'planner_query_invalid',
  'generation_unavailable',
  'wrong_track',
  'recheck_failed',
  'cache_replay_degraded',
  'cache_replay_empty',
  'track_local_required',
  'dispatch_rejected',
  'degraded',
] as const;
export type TrackLocalObsOutcome = (typeof TRACK_LOCAL_OBS_OUTCOMES)[number];

export function classifyTrackLocalOutcome(refs: readonly ScoredRef[]): TrackLocalObsOutcome {
  if (!Array.isArray(refs) || refs.length === 0) return 'cache_replay_empty';
  const first = refs[0]!;
  const tag = typeof first.ref === 'string' ? first.ref : '';
  const isDegraded = first.availability === 'degraded' || tag.startsWith('__rag_degraded__:');
  if (!isDegraded) return 'ok';
  const reason = tag.startsWith('__rag_degraded__:')
    ? tag.slice('__rag_degraded__:'.length)
    : tag;
  if (!reason) return 'degraded';
  if (reason === 'route_snapshot_missing' || reason.startsWith('route_snapshot_missing')) return 'route_snapshot_missing';
  if (reason === 'planner_query_invalid') return 'planner_query_invalid';
  if (reason === 'generation_unavailable') return 'generation_unavailable';
  if (reason === 'track_local_required') return 'track_local_required';
  if (reason.startsWith('wrong_track')) return 'wrong_track';
  if (reason === 'recheck_failed:replay' || /replay/i.test(reason)) return 'cache_replay_degraded';
  if (reason.startsWith('recheck_failed')) return 'recheck_failed';
  if (reason.startsWith('dispatch_rejected') || reason.startsWith('dispatch_replayed')) return 'dispatch_rejected';
  return 'degraded';
}

/** Emit rag_retrieval_total{mode=track_local,outcome=…} — production-surface observability (PS2). */
export function observeTrackLocalRetrieval(
  outcome: TrackLocalObsOutcome,
  latencyMs = 0,
  candidates = 0,
): void {
  const metrics = getMetrics();
  metrics.inc(METRIC.ragRetrievalTotal, { outcome, mode: 'track_local' });
  metrics.observe(METRIC.ragRetrievalLatencyMs, latencyMs, { outcome, mode: 'track_local' });
  metrics.observe(METRIC.ragRetrievalCandidates, candidates, { mode: 'track_local' });
}

/** Map recheck_failed reason → degraded ScoredRef (ADV catalog + unknown alike). */
export function mapRecheckFailedToRefs(reason: string): ScoredRef[] {
  const r = typeof reason === "string" && reason.length > 0 ? reason : "unknown";
  // Catalog pin keeps ADV wrong_track predicates named in the degraded tag.
  if (!isFailClosedWrongTrackRecheckReason(r)) {
    // Unknown recheck reasons still fail-closed (never unscoped / sibling / question_ready).
    return [degradedRetrieval(`recheck_failed:${r}`)];
  }
  return [degradedRetrieval(`recheck_failed:${r}`)];
}

/** Map dispatch result → ScoredRef[]; recheck_failed / rejected stay fail-closed. */
export function scoredRefsFromDispatch(result: DispatchTrackLocalRetrievalResult): ScoredRef[] {
  switch (result.status) {
    case 'served':
      return result.results.map((r) => ({ ref: r.ref, score: r.score, evidence: r.evidence }));
    case 'recheck_failed':
      // Fail-closed always (catalog + unknown). No sibling/unscoped/question_ready.
      return mapRecheckFailedToRefs(result.reason);
    case 'rejected': {
      const reason = result.reason === 'snapshot_missing' ? 'route_snapshot_missing' : `dispatch_rejected:${result.reason}`;
      return [degradedRetrieval(reason)];
    }
    case 'replayed':
      if (result.planStatus === 'recheck_failed') return [degradedRetrieval('recheck_failed:replay')];
      if (result.planStatus === 'served') return [];
      return [degradedRetrieval(`dispatch_replayed:${result.planStatus}`)];
    default:
      return [degradedRetrieval('dispatch_unknown_status')];
  }
}

/**
 * Production retrieve: assemble validated plan from true planner + active generation/recipe,
 * then dispatchTrackLocalRetrieval. Never hard-stuffs primary leaf (P-FAKEPLAN).
 */
export async function retrieveViaDispatchTrackLocal(input: {
  pool: DbPool;
  owner: string;
  snapshot: InterviewRouteSnapshotView | null | undefined;
  query: string;
  deficit: number[];
  deps: TrackLocalRetrieveDeps;
}): Promise<{ refs: ScoredRef[]; deficit: number[] }> {
  const started = performance.now();
  const finish = (refs: ScoredRef[], deficit: number[]) => {
    const outcome = classifyTrackLocalOutcome(refs);
    const candidates = outcome === 'ok' ? refs.length : 0;
    observeTrackLocalRetrieval(outcome, Math.round(performance.now() - started), candidates);
    return { refs, deficit };
  };

  const snap = input.snapshot;
  if (
    !snap
    || typeof snap !== 'object'
    || typeof snap.interviewId !== 'string'
    || snap.interviewId.length < 1
    || typeof snap.routeDigest !== 'string'
    || snap.routeDigest.length < 1
    || !Array.isArray(snap.allocations)
    || snap.allocations.length === 0
  ) {
    return finish([degradedRetrieval('route_snapshot_missing')], input.deficit);
  }

  const parsed = parseCragPlannerQuery(input.query);
  if (!parsed) {
    return finish([degradedRetrieval('planner_query_invalid')], input.deficit);
  }

  let active: { generationId: string; recipeId: string };
  try {
    active = await asPrincipal(input.pool, input.owner, (c) => activeQbankGeneration(c));
  } catch {
    return finish([degradedRetrieval('generation_unavailable')], input.deficit);
  }
  if (!active.generationId || !active.recipeId) {
    return finish([degradedRetrieval('generation_unavailable')], input.deficit);
  }

  const deficit = Array.isArray(input.deficit) && input.deficit.length === snap.allocations.length
    ? input.deficit
    : snap.allocations.map(() => 0);

  const assembled = assembleValidatedRetrievalPlan({
    snapshot: {
      interviewId: snap.interviewId,
      routeDigest: snap.routeDigest,
      allocations: snap.allocations,
    },
    deficit,
    competencyId: parsed.competencyId,
    difficulty: parsed.difficulty,
    generationId: active.generationId,
    recipeId: active.recipeId,
  });
  if (!assembled.ok) {
    return finish([degradedRetrieval(assembled.reason)], deficit);
  }

  // W4 — sole production call site for dispatchTrackLocalRetrieval in Worker retrieve.
  const dispatched = await dispatchTrackLocalRetrieval(
    input.pool,
    input.owner,
    assembled.plan,
    { ...input.deps, query: input.query },
  );

  // ADV: recheck_failed (wrong_track predicates) → fail-closed via scoredRefsFromDispatch.
  // Served path relies on db recheckHitsAtLeaf; enforceWrongTrackZeroOnServed is for
  // annotated hits (leaf/scope metadata) when callers have them — never unscoped fallback.
  // F1: every exit observes track_local outcome (PS2 observability).
  const refs = scoredRefsFromDispatch(dispatched);
  return finish(refs, assembled.deficit);
}
