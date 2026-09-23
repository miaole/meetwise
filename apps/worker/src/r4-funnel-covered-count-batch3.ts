/**
 * G-R4-5 / FUNNEL coveredCount Batch3 — true-cover RAG-FUNNEL-05 + RAG-FUNNEL-06
 * under standing authorize (REQUEST tip e3161b4 · pre-exec dual BOTH PASS).
 *
 * Honest path:
 *   - Assesses live production-path source pins for FUNNEL-05 (same-leaf LLM
 *     generation on clean miss: domain QuestionPlan + db dispatchQbankMissGeneration
 *     + clean no_eligible_in_scope gate + no QBank pollution + score-excluded until
 *     calibrated + production consumer on worker/interview path) and FUNNEL-06
 *     (route-scope cache/provenance/revoke: domain digest + retrieval/singleflight
 *     keys + durable negative cache + epoch CAS supersede + hit revalidate + db
 *     export + distinct from embedding compute cache + production consumer on
 *     retrieve path).
 *   - Elevates status=covered for 05/06 ONLY when assessors affirm (Ban invent).
 *   - Retains Batch1 03/04 + Batch2/2b 02A/02B covered · Ban wash.
 *
 * HARD:
 *   - 本刀不翻 r4ProductClosed / funnelProductClosed / gR45Closed.
 *   - Ban wash Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172
 *     · product-close 1c2ed8c · EG3 7be1a55 · rem·SSOT·EXPLICIT · R1 · EG3 evidence.
 *   - Ban MS3=R4 · Ban self-nail post_prove_dual_pass · releaseEvidence=false · ≠HA.
 *   - Ban elevating 07/08 · EXIT=0 under authorize = honest emit (partial ok) · ≠ invent coveredCount.
 *   - Prefer honest keep-4/5 over invent-6 · refuse if production consumer not wired.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_FUNNEL_COVERED_COUNT_BATCH3_EVIDENCE_KIND =
  'FunnelCoveredCountBatch3Evidence' as const;

export type Funnel05Assessor = {
  readonly domainQuestionPlanPresent: boolean;
  readonly dbDispatchMissGenerationPresent: boolean;
  readonly cleanMissGateOnly: boolean;
  readonly noQbankPollutionScoreExcluded: boolean;
  readonly dbExportsMissGeneration: boolean;
  /** Fail-closed: miss generation must be consumed on worker/interview path (≠ invent from db module alone). */
  readonly productionConsumerWired: boolean;
};

export type Funnel06Assessor = {
  readonly domainRouteScopeDigestPresent: boolean;
  readonly retrievalAndSingleflightKeysPresent: boolean;
  readonly durableNegativeCachePresent: boolean;
  readonly epochSupersedeAndHitRevalidatePresent: boolean;
  readonly distinctFromEmbeddingComputeCache: boolean;
  readonly dbExportsRouteScopeCache: boolean;
  /** Fail-closed: route-scope cache must be consumed on retrieve path (≠ invent from db module alone). */
  readonly productionConsumerWired: boolean;
};

export type FunnelCoveredCountBatch3Evidence = {
  readonly kind: typeof R4_FUNNEL_COVERED_COUNT_BATCH3_EVIDENCE_KIND;
  readonly batch3Only: true;
  readonly funnel05Covered: boolean;
  readonly funnel06Covered: boolean;
  readonly coveredIds: readonly string[];
  /** Covered rows this knife may elevate (05/06 only); matrix coveredCount includes Batch1+Batch2. */
  readonly batch3CoveredCount: number;
  readonly coveredCountInvented: false;
  readonly funnel05Assessor: Funnel05Assessor;
  readonly funnel06Assessor: Funnel06Assessor;
  readonly funnel05RefuseReason: string | null;
  readonly funnel06RefuseReason: string | null;
  /** 本刀不翻 — product close is a separate knife. */
  readonly r4ProductClosed: false;
  readonly funnelProductClosed: false;
  readonly gR45Closed: false;
  readonly ms3EqualsR4Closed: false;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / FUNNEL coveredCount Batch3 — true-cover 05+06 under authorize · honest assessor elevation only · Ban invent · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban elevating 07/08 · await post-prove dual';
};

function workerSrcDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)));
}

function repoRoot(): string {
  return join(workerSrcDir(), '..', '..', '..');
}

function readSrc(name: string): string {
  const p = join(workerSrcDir(), name);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  if (!existsSync(p)) return '';
  // Some sources may carry stray NULs; strip so assessors see text pins.
  return readFileSync(p, 'utf8').replace(/\0/g, '');
}

function readWorkerTree(): string {
  const names = [
    'main.ts',
    'interview-consumer.ts',
    'adaptive-interview-service.ts',
    'adaptive-lifecycle.ts',
    'interview-lifecycle.ts',
    'interview-service.ts',
    'qbank-track-local-retrieve.ts',
    'qbank-retrieve-scope.ts',
    'qbank-planner-retrieval-plan.ts',
    'qbank-generation.ts',
  ];
  return names.map(readSrc).join('\n');
}

/**
 * Assess FUNNEL-05 same-leaf LLM generation on clean miss.
 * Fail-closed: every seam must be present including production consumer (Ban invent).
 */
export function assessFunnel05SameLeafLlmCleanMiss(): Funnel05Assessor {
  const domain = readRepo('packages/domain/src/qbank-miss.ts');
  const miss = readRepo('packages/db/src/qbank-miss.ts');
  const dbIndex = readRepo('packages/db/src/index.ts');
  const worker = readWorkerTree();

  const domainQuestionPlanPresent =
    /export function validateQuestionPlan\s*\(/.test(domain)
    && /export function deriveQuestionPlanKey\s*\(/.test(domain)
    && /export function deriveNoEligibleVerdictDigest\s*\(/.test(domain)
    && /no_eligible_in_scope/.test(domain)
    && /export function validateGeneratedQuestion\s*\(/.test(domain);

  const dbDispatchMissGenerationPresent =
    /export async function dispatchQbankMissGeneration\s*\(/.test(miss)
    && /RAG-FUNNEL-05|LLM/.test(miss);

  const cleanMissGateOnly =
    /no_eligible_in_scope/.test(miss)
    && /eligibility !== ['"]no_eligible_in_scope['"]/.test(miss)
    && /no_model_fallback/.test(miss);

  const noQbankPollutionScoreExcluded =
    /review_required/.test(miss)
    && /score_excluded/.test(miss)
    && /issueQuestionContract/.test(miss)
    && !/await issueQuestionContract\s*\(/.test(miss);

  const dbExportsMissGeneration =
    /dispatchQbankMissGeneration/.test(dbIndex)
    && /qbank-miss/.test(dbIndex);

  // Production consumer: worker interview/adaptive/retrieve path must call dispatch.
  // packages/db module + package proof alone ≠ covered (Ban invent · Batch2b precedent).
  const productionConsumerWired =
    /dispatchQbankMissGeneration\s*\(/.test(worker)
    || (
      /from ['"]@meetwise\/db['"]/.test(worker)
      && /dispatchQbankMissGeneration/.test(worker)
    );

  return {
    domainQuestionPlanPresent,
    dbDispatchMissGenerationPresent,
    cleanMissGateOnly,
    noQbankPollutionScoreExcluded,
    dbExportsMissGeneration,
    productionConsumerWired,
  };
}

/** True iff every FUNNEL-05 production-path pin passes (Ban invent). */
export function isFunnel05Covered(): boolean {
  const a = assessFunnel05SameLeafLlmCleanMiss();
  return (
    a.domainQuestionPlanPresent
    && a.dbDispatchMissGenerationPresent
    && a.cleanMissGateOnly
    && a.noQbankPollutionScoreExcluded
    && a.dbExportsMissGeneration
    && a.productionConsumerWired
  );
}

export function funnel05RefuseReason(): string | null {
  if (isFunnel05Covered()) return null;
  const a = assessFunnel05SameLeafLlmCleanMiss();
  if (!a.domainQuestionPlanPresent) return 'domain_question_plan_pins_missing';
  if (!a.dbDispatchMissGenerationPresent) return 'db_dispatch_qbank_miss_generation_missing';
  if (!a.cleanMissGateOnly) return 'clean_miss_gate_no_eligible_in_scope_missing';
  if (!a.noQbankPollutionScoreExcluded) return 'qbank_pollution_or_score_exclusion_not_evidenced';
  if (!a.dbExportsMissGeneration) return 'db_exports_miss_generation_missing';
  if (!a.productionConsumerWired) {
    return 'production_path_not_wired_worker_or_interview_consumer';
  }
  return 'funnel05_assessor_incomplete';
}

/**
 * Assess FUNNEL-06 route-scope cache/provenance/revoke.
 * Fail-closed: every seam must be present including production consumer (Ban invent).
 * Ban wash Batch2b 02B embedding compute cache into 06 covered.
 */
export function assessFunnel06RouteScopeCacheProvenanceRevoke(): Funnel06Assessor {
  const domain = readRepo('packages/domain/src/qbank-route-scope-cache.ts');
  const rsc = readRepo('packages/db/src/qbank-route-scope-cache.ts');
  const dbIndex = readRepo('packages/db/src/index.ts');
  const compute = readRepo('packages/db/src/qbank-embedding-compute-cache.ts');
  const worker = readWorkerTree();
  const trackLocal = readRepo('packages/db/src/qbank-track-local-retrieval.ts');
  const retrieval = readRepo('packages/db/src/qbank-retrieval-cache.ts');

  const domainRouteScopeDigestPresent =
    /export function deriveRouteScopeCacheDigest\s*\(/.test(domain)
    && /export function validateRouteScopeCacheFacets\s*\(/.test(domain)
    && /no_eligible_in_scope/.test(domain);

  const retrievalAndSingleflightKeysPresent =
    /export function routeScopeRetrievalCacheKey\s*\(/.test(rsc)
    && /export function routeScopeSingleflightKey\s*\(/.test(rsc);

  const durableNegativeCachePresent =
    /export async function recordRouteScopeNegativeResult\s*\(/.test(rsc)
    && /export async function readRouteScopeNegativeResult\s*\(/.test(rsc)
    && /qbank_cache_epoch/.test(rsc);

  const epochSupersedeAndHitRevalidatePresent =
    /export async function supersedeRouteScopeNegativeResults\s*\(/.test(rsc)
    && /export async function revalidateRouteScopeCacheHit\s*\(/.test(rsc);

  // Distinct from embedding compute cache (Ban wash 02B into 06).
  const distinctFromEmbeddingComputeCache =
    /RAG-FUNNEL-06|route-scope|route_scope/.test(rsc)
    && /export async function resolveEmbeddingCompute\s*\(/.test(compute)
    && !/resolveEmbeddingCompute/.test(rsc)
    && !/routeScopeRetrievalCacheKey/.test(compute);

  const dbExportsRouteScopeCache =
    /routeScopeRetrievalCacheKey/.test(dbIndex)
    && /recordRouteScopeNegativeResult/.test(dbIndex)
    && /qbank-route-scope-cache/.test(dbIndex);

  // Production consumer: retrieve/track-local/worker must call route-scope cache APIs.
  const consumerSurfaces = `${worker}\n${trackLocal}\n${retrieval}`;
  const productionConsumerWired =
    /routeScopeRetrievalCacheKey\s*\(/.test(consumerSurfaces)
    || /recordRouteScopeNegativeResult\s*\(/.test(consumerSurfaces)
    || /readRouteScopeNegativeResult\s*\(/.test(consumerSurfaces)
    || /revalidateRouteScopeCacheHit\s*\(/.test(consumerSurfaces)
    || (
      /from ['"]@meetwise\/db['"]/.test(worker)
      && (/routeScopeRetrievalCacheKey|recordRouteScopeNegativeResult|readRouteScopeNegativeResult/.test(worker))
    );

  return {
    domainRouteScopeDigestPresent,
    retrievalAndSingleflightKeysPresent,
    durableNegativeCachePresent,
    epochSupersedeAndHitRevalidatePresent,
    distinctFromEmbeddingComputeCache,
    dbExportsRouteScopeCache,
    productionConsumerWired,
  };
}

/** True iff every FUNNEL-06 production-path pin passes (Ban invent). */
export function isFunnel06Covered(): boolean {
  const a = assessFunnel06RouteScopeCacheProvenanceRevoke();
  return (
    a.domainRouteScopeDigestPresent
    && a.retrievalAndSingleflightKeysPresent
    && a.durableNegativeCachePresent
    && a.epochSupersedeAndHitRevalidatePresent
    && a.distinctFromEmbeddingComputeCache
    && a.dbExportsRouteScopeCache
    && a.productionConsumerWired
  );
}

export function funnel06RefuseReason(): string | null {
  if (isFunnel06Covered()) return null;
  const a = assessFunnel06RouteScopeCacheProvenanceRevoke();
  if (!a.domainRouteScopeDigestPresent) return 'domain_route_scope_digest_pins_missing';
  if (!a.retrievalAndSingleflightKeysPresent) return 'route_scope_retrieval_or_singleflight_keys_missing';
  if (!a.durableNegativeCachePresent) return 'durable_negative_cache_record_read_missing';
  if (!a.epochSupersedeAndHitRevalidatePresent) return 'epoch_supersede_or_hit_revalidate_missing';
  if (!a.distinctFromEmbeddingComputeCache) return 'not_distinct_from_embedding_compute_cache';
  if (!a.dbExportsRouteScopeCache) return 'db_exports_route_scope_cache_missing';
  if (!a.productionConsumerWired) {
    return 'production_path_not_wired_retrieve_or_track_local_consumer';
  }
  return 'funnel06_assessor_incomplete';
}

/**
 * Emit Batch3 evidence receipt. Always emits (honest partial ok).
 * Product flags stay false · coveredCountInvented=false · batch3Only=true.
 */
export function emitFunnelCoveredCountBatch3Evidence(): FunnelCoveredCountBatch3Evidence {
  const funnel05Assessor = assessFunnel05SameLeafLlmCleanMiss();
  const funnel06Assessor = assessFunnel06RouteScopeCacheProvenanceRevoke();
  const funnel05Covered = isFunnel05Covered();
  const funnel06Covered = isFunnel06Covered();
  const coveredIds = [
    ...(funnel05Covered ? (['RAG-FUNNEL-05'] as const) : []),
    ...(funnel06Covered ? (['RAG-FUNNEL-06'] as const) : []),
  ];

  return {
    kind: R4_FUNNEL_COVERED_COUNT_BATCH3_EVIDENCE_KIND,
    batch3Only: true,
    funnel05Covered,
    funnel06Covered,
    coveredIds,
    batch3CoveredCount: coveredIds.length,
    coveredCountInvented: false,
    funnel05Assessor,
    funnel06Assessor,
    funnel05RefuseReason: funnel05RefuseReason(),
    funnel06RefuseReason: funnel06RefuseReason(),
    r4ProductClosed: false,
    funnelProductClosed: false,
    gR45Closed: false,
    ms3EqualsR4Closed: false,
    releaseEvidence: false,
    note: 'G-R4-5 / FUNNEL coveredCount Batch3 — true-cover 05+06 under authorize · honest assessor elevation only · Ban invent · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban elevating 07/08 · await post-prove dual',
  };
}

/** Marker: Batch3 coveredCount emitter wired (≠ product close · ≠ gR45Closed). */
export const R4_FUNNEL_COVERED_COUNT_BATCH3_EMITTER_WIRED = true as const;
