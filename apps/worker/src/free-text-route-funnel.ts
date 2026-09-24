/**
 * RAG-FUNNEL-07 production consumer — free-text allowlisted scope funnel.
 *
 * UC-RAG-FUNNEL-07: rules → light model → clarification / typed JobRouteDecision-
 * equivalent. Classification **only suggests** an allowlisted track · **no**
 * read/tool grant · **no** retrieval dispatch · unresolved/unknown = 0 retrieval.
 *
 * Request-path (not background drain): goal plaintext is caller-supplied once and
 * never persisted (revision stores digest+HMAC only). Reuses UC-03 MODEL-OP
 * `job.route-classify.v1` via goal→title isomorphic adapt (domain rule path already
 * reuses classifyJobByRule the same way).
 *
 * HARD:
 *   - Ban docs-only fake cover — real import+invoke of createFreeTextScopeRevision
 *     + classifyFreeTextScope on the worker production surface.
 *   - Ban privilege expansion — this module must never call retrieve / bind /
 *     snapshot / dispatchTrackLocalRetrieval.
 *   - ≠ R4/FUNNEL/G-R4-5 product closed · releaseEvidence=false · ≠HA.
 */
import {
  asPrincipal,
  createFreeTextScopeRevision,
  classifyFreeTextScope,
  type DbPool,
  type FreeTextRouteModelClassify,
  type ClassifyFreeTextScopeResult,
} from '@meetwise/db';
import { createJobRouteModelClassify, type ModelClient } from '@meetwise/ai-runtime';

export type FreeTextAllowlistedScopeFunnelDeps = {
  pool: DbPool;
  model: ModelClient;
};

export type FreeTextAllowlistedScopeFunnelResult = {
  revision: number;
  classify: ClassifyFreeTextScopeResult;
  /** Always false — decision suggests allowlisted track only (UC-RAG-FUNNEL-07). */
  retrievalGranted: false;
  /** Always false — no tool/read grant from classification alone. */
  toolGrant: false;
};

/**
 * Adapt FreeTextRouteModelInput → JobRouteModelClassify (goal as title · empty
 * description/competencies). Idempotent key still scoped by scopeId:revision via
 * jobId slot (isomorphic to UC-03 binding; digest namespace remains free-text on
 * the db/domain side).
 */
export function createFreeTextRouteModelClassify(deps: {
  pool: DbPool;
  owner: string;
  model: ModelClient;
}): FreeTextRouteModelClassify {
  const jobClassify = createJobRouteModelClassify(deps);
  return async (input) =>
    jobClassify({
      jobId: input.scopeId,
      revision: input.revision,
      title: input.goal,
      description: '',
      competencies: [],
    });
}

/**
 * Production free-text allowlisted scope funnel (UC-RAG-FUNNEL-07).
 * Creates a scope revision then runs rules→model classify. Never grants retrieval.
 */
export async function runFreeTextAllowlistedScopeFunnel(
  d: FreeTextAllowlistedScopeFunnelDeps,
  owner: string,
  scopeId: string,
  goal: string,
): Promise<FreeTextAllowlistedScopeFunnelResult> {
  const revision = await asPrincipal(d.pool, owner, (c) =>
    createFreeTextScopeRevision(c, owner, scopeId, { goal }),
  );

  const modelClassify = createFreeTextRouteModelClassify({
    pool: d.pool,
    owner,
    model: d.model,
  });

  // Real import+invoke of classifyFreeTextScope on worker production path.
  const classify = await classifyFreeTextScope(
    d.pool,
    owner,
    scopeId,
    revision.revision,
    goal,
    { modelClassify },
  );

  // Structural: unresolved / unknown / noop never expand to retrieval.
  // route_decided only *suggests* allowlisted track — no read/tool grant here.
  return {
    revision: revision.revision,
    classify,
    retrievalGranted: false,
    toolGrant: false,
  };
}

/** Marker: free-text allowlisted scope funnel production consumer wired. */
export const FREE_TEXT_ALLOWLISTED_SCOPE_FUNNEL_WIRED = true as const;
