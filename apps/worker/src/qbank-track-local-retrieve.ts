/**
 * R4 REAL-WIRE-IMPL — Worker retrieve main path:
 *   planInterviewTurn → validate → assemble RetrievalPlan (generationId+recipeId)
 *   → dispatchTrackLocalRetrieval → recheck.
 *
 * Batch3b production consumers (G-R4-5 / FUNNEL coveredCount):
 * - RAG-FUNNEL-06: routeScopeRetrievalCacheKey / readRouteScopeNegativeResult /
 *   recordRouteScopeNegativeResult / revalidateRouteScopeCacheHit on this retrieve path.
 * - RAG-FUNNEL-05: dispatchQbankMissGeneration on clean empty serve when missGeneration
 *   seams are supplied (fail-closed absent seams — never invent a stem).
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
  dispatchQbankMissGeneration,
  routeScopeRetrievalCacheKey,
  recordRouteScopeNegativeResult,
  readRouteScopeNegativeResult,
  revalidateRouteScopeCacheHit,
  type DbPool,
  type DispatchTrackLocalRetrievalDeps,
  type DispatchTrackLocalRetrievalResult,
  type InterviewRouteSnapshotView,
  type QbankMissModelGenerate,
  type QbankRetrievalHit,
} from '@meetwise/db';
import { getMetrics, METRIC } from '@meetwise/ai-runtime';
import {
  assembleValidatedRetrievalPlan,
  assertWrongTrackZero,
  degradedRetrieval,
  isFailClosedWrongTrackRecheckReason,
  deriveNoEligibleVerdictDigest,
  deriveRouteScopeCacheDigest,
  deriveServingAclDigest,
  SERVING_PURPOSE,
  SERVING_CONSENT_REVISION,
  QBANK_MISS_POLICY_VERSION,
  QBANK_MISS_SCORE_POLICY_VERSION,
  QBANK_MISS_PROMPT_POLICY_VERSION,
  QBANK_MISS_SCHEMA_POLICY_VERSION,
  QBANK_MISS_MODEL_POLICY_VERSION,
  type ScoredRef,
  type WrongTrackHit,
  type QuestionPlan,
  type RouteScopeCacheFacets,
  type RetrievalPlan,
} from '@meetwise/domain';

/**
 * RAG-FUNNEL-05 optional seams: same-leaf LLM generation on clean miss.
 * Absent seams keep retrieve-only path (fail-closed — never invent a stem).
 */
export type TrackLocalMissGenerationSeams = {
  model: QbankMissModelGenerate;
  rubricId: string;
  blueprintFocus: string;
  language?: string;
  avoidDigests?: string[];
};

export type TrackLocalRetrieveDeps = Omit<DispatchTrackLocalRetrievalDeps, 'query'> & {
  /** RAG-FUNNEL-05: when present, empty served leaf may invoke dispatchQbankMissGeneration. */
  missGeneration?: TrackLocalMissGenerationSeams;
};

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


/** Load frozen interview resume privacy epoch (RAG-FUNNEL-06 facets / RAG-FUNNEL-05 plan). */
async function loadInterviewPrivacyEpoch(
  pool: DbPool,
  owner: string,
  interviewId: string,
): Promise<number | null> {
  try {
    return await asPrincipal(pool, owner, async (c) => {
      const r = await c.query(
        'SELECT COALESCE(resume_privacy_epoch, 0)::bigint AS e FROM interview WHERE id=$1',
        [interviewId],
      );
      if (r.rowCount !== 1) return null;
      return Number(r.rows[0]!.e);
    });
  } catch {
    return null;
  }
}

async function readQbankCacheEpoch(pool: DbPool, owner: string): Promise<string | null> {
  try {
    return await asPrincipal(pool, owner, async (c) => {
      const r = await c.query('SELECT epoch::text AS epoch FROM qbank_cache_epoch WHERE singleton=true');
      if (r.rowCount !== 1 || typeof r.rows[0]?.epoch !== 'string') return null;
      return r.rows[0].epoch as string;
    });
  } catch {
    return null;
  }
}

function buildRouteScopeFacets(plan: RetrievalPlan, privacyEpoch: number): RouteScopeCacheFacets {
  return {
    routeScopeDigest: plan.routeScopeDigest,
    leafTrackId: plan.leafTrackId,
    taxonomyVersion: plan.taxonomyVersion,
    generationId: plan.generationId,
    recipeId: plan.recipeId,
    privacyEpoch,
    aclDigest: deriveServingAclDigest({
      servingScopeId: plan.leafTrackId,
      taxonomyVersion: plan.taxonomyVersion,
      purpose: SERVING_PURPOSE,
      consentRevision: SERVING_CONSENT_REVISION,
    }),
  };
}

/**
 * Build QuestionPlan for RAG-FUNNEL-05 clean-miss dispatch from a frozen RetrievalPlan.
 * Rubric/blueprint/language come from production missGeneration seams (never invented).
 */
function questionPlanFromRetrievalPlan(
  plan: RetrievalPlan,
  privacyEpoch: number,
  seams: TrackLocalMissGenerationSeams,
): QuestionPlan {
  return {
    snapshotId: plan.snapshotId,
    routeScopeDigest: plan.routeScopeDigest,
    leafTrackId: plan.leafTrackId,
    taxonomyVersion: plan.taxonomyVersion,
    competencyId: plan.competencyId,
    difficulty: plan.difficulty,
    generationId: plan.generationId,
    recipeId: plan.recipeId,
    noEligibleVerdictDigest: deriveNoEligibleVerdictDigest({
      leafTrackId: plan.leafTrackId,
      taxonomyVersion: plan.taxonomyVersion,
      generationId: plan.generationId,
      recipeId: plan.recipeId,
    }),
    blueprint: { focus: seams.blueprintFocus },
    rubricId: seams.rubricId,
    scorePolicyVersion: QBANK_MISS_SCORE_POLICY_VERSION,
    promptPolicyVersion: QBANK_MISS_PROMPT_POLICY_VERSION,
    schemaPolicyVersion: QBANK_MISS_SCHEMA_POLICY_VERSION,
    modelPolicyVersion: QBANK_MISS_MODEL_POLICY_VERSION,
    privacyEpoch,
    policyVersion: QBANK_MISS_POLICY_VERSION,
    language: seams.language ?? 'en',
  };
}

/**
 * RAG-FUNNEL-06 production consumer: bind route-scope retrieval cache key + durable
 * negative-result read before dispatch. Fail-closed on missing HMAC / facets — never
 * invent a negative hit (caller proceeds to live retrieve).
 */
async function applyRouteScopeNegativeCacheRead(
  pool: DbPool,
  owner: string,
  plan: RetrievalPlan,
  query: string,
  embedderVersion: string,
  k: number,
  privacyEpoch: number,
): Promise<'proceed' | 'negative_hit'> {
  const facets = buildRouteScopeFacets(plan, privacyEpoch);
  const cacheDigest = deriveRouteScopeCacheDigest(facets);
  // Real import+invoke of routeScopeRetrievalCacheKey (HMAC bind seven facets).
  try {
    routeScopeRetrievalCacheKey({
      owner,
      routeScopeCacheDigest: cacheDigest,
      query,
      k,
      embedderVersion,
      retrievalMode: 'dense',
    });
  } catch {
    // Missing RAG_QBANK_CACHE_HASH_KEY → skip key bind; still try durable negative read.
  }
  const neg = await readRouteScopeNegativeResult(pool, owner, facets, { privacyEpoch });
  if (neg.status === 'hit' && neg.verdict === 'no_eligible_in_scope') {
    return 'negative_hit';
  }
  // stale/miss → proceed to live retrieve (never replay stale negative).
  return 'proceed';
}

/**
 * RAG-FUNNEL-06 production consumer: after empty serve, record durable negative;
 * after non-empty serve, revalidate hit hydration against PG epoch/generation.
 */
async function applyRouteScopeCacheAfterDispatch(
  pool: DbPool,
  owner: string,
  plan: RetrievalPlan,
  privacyEpoch: number,
  dispatched: DispatchTrackLocalRetrievalResult,
): Promise<void> {
  const facets = buildRouteScopeFacets(plan, privacyEpoch);
  if (dispatched.status === 'served' && dispatched.results.length === 0) {
    const verdictDigest = deriveNoEligibleVerdictDigest({
      leafTrackId: plan.leafTrackId,
      taxonomyVersion: plan.taxonomyVersion,
      generationId: plan.generationId,
      recipeId: plan.recipeId,
    });
    await recordRouteScopeNegativeResult(pool, owner, facets, {
      verdict: 'no_eligible_in_scope',
      verdictDigest,
    });
    return;
  }
  if (dispatched.status === 'served' && dispatched.results.length > 0) {
    const corpusEpoch = await readQbankCacheEpoch(pool, owner);
    if (!corpusEpoch) return;
    const hits: QbankRetrievalHit[] = dispatched.results.map((r) => ({
      refId: r.ref,
      distance: typeof r.score === 'number' ? Math.max(0, 1 - r.score) : 0,
    }));
    await revalidateRouteScopeCacheHit(
      pool,
      owner,
      {
        generationId: plan.generationId,
        recipeId: plan.recipeId,
        corpusEpoch,
      },
      hits,
      { taxonomyVersion: plan.taxonomyVersion, servingScopeId: plan.leafTrackId },
    );
  }
}

/**
 * RAG-FUNNEL-05 production consumer: on clean empty serve, dispatch same-leaf LLM
 * miss generation when seams are supplied. Absent seams → no model call (fail-closed).
 */
async function maybeDispatchMissGenerationOnCleanMiss(
  pool: DbPool,
  owner: string,
  plan: RetrievalPlan,
  privacyEpoch: number,
  seams: TrackLocalMissGenerationSeams | undefined,
  dispatched: DispatchTrackLocalRetrievalResult,
): Promise<ScoredRef[] | null> {
  if (!seams) return null;
  if (dispatched.status !== 'served' || dispatched.results.length !== 0) return null;
  const questionPlan = questionPlanFromRetrievalPlan(plan, privacyEpoch, seams);
  // Real import+invoke of dispatchQbankMissGeneration on worker retrieve path.
  const miss = await dispatchQbankMissGeneration(pool, owner, questionPlan, {
    eligibility: 'no_eligible_in_scope',
    model: seams.model,
    avoidDigests: seams.avoidDigests ?? [],
  });
  if (miss.status === 'question_ready') {
    // Miss generation projects interview_question; retrieve still returns empty
    // local refs (generated stem is not QBank evidence — Ban pollution).
    return [degradedRetrieval('llm_qbank_miss_question_ready')];
  }
  if (miss.status === 'no_model_fallback') {
    return [degradedRetrieval(`no_model_fallback:${miss.reason}`)];
  }
  if (miss.status === 'generation_unavailable') {
    return [degradedRetrieval(`generation_unavailable:${miss.reason}`)];
  }
  return [degradedRetrieval(`miss_generation:${miss.status}`)];
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

  const privacyEpoch = await loadInterviewPrivacyEpoch(
    input.pool,
    input.owner,
    assembled.plan.snapshotId,
  );

  // RAG-FUNNEL-06: route-scope negative cache read + retrieval cache key bind
  // before live dispatch (production retrieve/track-local consumer).
  if (privacyEpoch != null) {
    const neg = await applyRouteScopeNegativeCacheRead(
      input.pool,
      input.owner,
      assembled.plan,
      input.query,
      input.deps.embedderVersion,
      input.deps.k ?? 5,
      privacyEpoch,
    );
    if (neg === 'negative_hit') {
      return finish([degradedRetrieval('no_eligible_in_scope')], assembled.deficit);
    }
  }

  // W4 — sole production call site for dispatchTrackLocalRetrieval in Worker retrieve.
  const dispatched = await dispatchTrackLocalRetrieval(
    input.pool,
    input.owner,
    assembled.plan,
    { ...input.deps, query: input.query },
  );

  // RAG-FUNNEL-06: record durable negative on empty serve / revalidate on hits.
  if (privacyEpoch != null) {
    await applyRouteScopeCacheAfterDispatch(
      input.pool,
      input.owner,
      assembled.plan,
      privacyEpoch,
      dispatched,
    ).catch(() => undefined);
  }

  // RAG-FUNNEL-05: clean empty serve → optional same-leaf LLM miss generation.
  if (privacyEpoch != null) {
    const missRefs = await maybeDispatchMissGenerationOnCleanMiss(
      input.pool,
      input.owner,
      assembled.plan,
      privacyEpoch,
      input.deps.missGeneration,
      dispatched,
    ).catch(() => null);
    if (missRefs) {
      return finish(missRefs, assembled.deficit);
    }
  }

  // ADV: recheck_failed (wrong_track predicates) → fail-closed via scoredRefsFromDispatch.
  // Served path relies on db recheckHitsAtLeaf; enforceWrongTrackZeroOnServed is for
  // annotated hits (leaf/scope metadata) when callers have them — never unscoped fallback.
  // F1: every exit observes track_local outcome (PS2 observability).
  const refs = scoredRefsFromDispatch(dispatched);
  return finish(refs, assembled.deficit);
}
