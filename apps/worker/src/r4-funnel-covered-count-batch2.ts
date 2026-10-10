/**
 * G-R4-5 / FUNNEL coveredCount Batch2 — true-cover RAG-FUNNEL-02A + RAG-FUNNEL-02B
 * under standing authorize (REQUEST tip 21cf3cd · pre-exec dual BOTH PASS).
 *
 * Honest path:
 *   - Assesses live production-path source pins for FUNNEL-02A (immutable
 *     generation/projection + canonical embedding recipe: worker recipe receipt
 *     + ensureActiveQbankGeneration + db projection + main wiring + track-local
 *     projection consume) and FUNNEL-02B (durable embedding compute cache:
 *     HMAC cache identity + resolve/claim/validate + db export + production
 *     consumer wiring in worker main / qbank generation).
 *   - Elevates status=covered for 02A/02B ONLY when assessors affirm (Ban invent).
 *   - Retains Batch1 03/04 covered · Ban wash Batch1 5519078/bd15172.
 *
 * HARD:
 *   - 本刀不翻 r4ProductClosed / funnelProductClosed / gR45Closed.
 *   - Ban wash 5519078/bd15172 · 1c2ed8c/139dac9 · 7be1a55/5b3c854 · rem·SSOT·EXPLICIT · R1 · EG3 evidence.
 *   - Ban MS3=R4 · Ban self-nail post_prove_dual_pass · releaseEvidence=false · ≠HA.
 *   - EXIT=0 under authorize = honest emit (partial ok) · ≠ invent coveredCount.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_FUNNEL_COVERED_COUNT_BATCH2_EVIDENCE_KIND =
  'FunnelCoveredCountBatch2Evidence' as const;

export type Funnel02AAssessor = {
  readonly recipeCanonicalFieldsPresent: boolean;
  readonly immutableGenerationBuilderWired: boolean;
  readonly generationProjectionSurfacePresent: boolean;
  readonly mainImmutableGenerationPath: boolean;
  readonly projectionConsumedOnRetrievePath: boolean;
  readonly mainRecipeInQueryIdentity: boolean;
};

export type Funnel02BAssessor = {
  readonly hmacCacheIdentityPresent: boolean;
  readonly resolveDurableFillPresent: boolean;
  readonly claimFillAndValidatePresent: boolean;
  readonly distinctFromRetrievalCache: boolean;
  readonly dbExportsComputeCache: boolean;
  /** Fail-closed: durable compute cache must be consumed on worker/generation path (≠ invent from module alone). */
  readonly productionConsumerWired: boolean;
};

export type FunnelCoveredCountBatch2Evidence = {
  readonly kind: typeof R4_FUNNEL_COVERED_COUNT_BATCH2_EVIDENCE_KIND;
  readonly batch2Only: true;
  readonly funnel02ACovered: boolean;
  readonly funnel02BCovered: boolean;
  readonly coveredIds: readonly string[];
  /** Covered rows this knife may elevate (02A/02B only); matrix coveredCount includes Batch1 03/04. */
  readonly batch2CoveredCount: number;
  readonly coveredCountInvented: false;
  readonly funnel02AAssessor: Funnel02AAssessor;
  readonly funnel02BAssessor: Funnel02BAssessor;
  readonly funnel02ARefuseReason: string | null;
  readonly funnel02BRefuseReason: string | null;
  /** 本刀不翻 — product close is a separate knife. */
  readonly r4ProductClosed: false;
  readonly funnelProductClosed: false;
  readonly gR45Closed: false;
  readonly ms3EqualsR4Closed: false;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / FUNNEL coveredCount Batch2 — true-cover 02A+02B under authorize · honest assessor elevation only · Ban invent · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual';
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

/**
 * Assess FUNNEL-02A immutable generation/projection + canonical embedding recipe.
 * Fail-closed: every seam must be present (Ban invent).
 */
export function assessFunnel02AImmutableGenerationProjectionRecipe(): Funnel02AAssessor {
  const gen = readSrc('qbank-generation.ts');
  const main = readSrc('main.ts');
  const projection = readRepo('packages/db/src/qbank-generation-projection.ts');
  const trackLocal = readRepo('packages/db/src/qbank-track-local-retrieval.ts');

  const recipeCanonicalFieldsPresent =
    /export function qbankEmbeddingRecipe\s*\(/.test(gen)
    && /providerRevision/.test(gen)
    && /dimensions/.test(gen)
    && /chunkerVersion/.test(gen)
    && /normalizationVersion/.test(gen)
    && /CHUNKER_VERSION|whole-qbank-item/.test(gen)
    && /NORMALIZATION_VERSION|utf8-nfc-trim/.test(gen);

  const immutableGenerationBuilderWired =
    /export async function ensureActiveQbankGeneration\s*\(/.test(gen)
    && /qbank_activate_generation/.test(gen)
    && (/never updates the current generation|immutable/.test(gen))
    && /qbank_vector_generation|qbank_prepare_generation_partition/.test(gen);

  const generationProjectionSurfacePresent =
    /export async function readGenerationQuestionChunkProjection\s*\(/.test(projection)
    && /GenerationQuestionChunkProjection/.test(projection)
    && (/servingScopeId|serving_scope_id/.test(projection));

  const mainImmutableGenerationPath =
    /qbankEmbeddingRecipe/.test(main)
    && /ensureActiveQbankGeneration/.test(main)
    && /immutable generation|promoted immutable generation|immutable receipt/.test(main);

  const projectionConsumedOnRetrievePath =
    /readGenerationQuestionChunkProjection\s*\(/.test(trackLocal)
    && (/artifact leaf|authoritative|权威/.test(trackLocal) || /servingScopeId/.test(trackLocal));

  const mainRecipeInQueryIdentity =
    /qbankRecipe\.id/.test(main)
    && /recipe=\$\{qbankRecipe\.id\}|qbankRecipeId:\s*qbankRecipe\.id/.test(main)
    && (/HMAC cache identity|immutable qbank recipe/.test(main));

  return {
    recipeCanonicalFieldsPresent,
    immutableGenerationBuilderWired,
    generationProjectionSurfacePresent,
    mainImmutableGenerationPath,
    projectionConsumedOnRetrievePath,
    mainRecipeInQueryIdentity,
  };
}

/** True iff every FUNNEL-02A production-path pin passes (Ban invent). */
export function isFunnel02ACovered(): boolean {
  const a = assessFunnel02AImmutableGenerationProjectionRecipe();
  return (
    a.recipeCanonicalFieldsPresent
    && a.immutableGenerationBuilderWired
    && a.generationProjectionSurfacePresent
    && a.mainImmutableGenerationPath
    && a.projectionConsumedOnRetrievePath
    && a.mainRecipeInQueryIdentity
  );
}

export function funnel02ARefuseReason(): string | null {
  if (isFunnel02ACovered()) return null;
  const a = assessFunnel02AImmutableGenerationProjectionRecipe();
  if (!a.recipeCanonicalFieldsPresent) return 'recipe_canonical_fields_missing';
  if (!a.immutableGenerationBuilderWired) return 'immutable_generation_builder_not_wired';
  if (!a.generationProjectionSurfacePresent) return 'generation_projection_surface_missing';
  if (!a.mainImmutableGenerationPath) return 'main_immutable_generation_path_missing';
  if (!a.projectionConsumedOnRetrievePath) return 'projection_not_consumed_on_retrieve_path';
  if (!a.mainRecipeInQueryIdentity) return 'main_recipe_query_identity_missing';
  return 'funnel02a_assessor_incomplete';
}

/**
 * Assess FUNNEL-02B durable embedding compute cache production path.
 * Fail-closed: module pins + production consumer wiring required (Ban invent
 * from packages/db module alone / process-local cachingEmbedder alone).
 */
export function assessFunnel02BDurableEmbeddingComputeCache(): Funnel02BAssessor {
  const compute = readRepo('packages/db/src/qbank-embedding-compute-cache.ts');
  const retrieval = readRepo('packages/db/src/qbank-retrieval-cache.ts');
  const dbIndex = readRepo('packages/db/src/index.ts');
  const main = readSrc('main.ts');
  const gen = readSrc('qbank-generation.ts');
  const memory = readRepo('packages/db/src/memory-index-generation.ts');

  const hmacCacheIdentityPresent =
    /export function embeddingComputeCacheKey\s*\(/.test(compute)
    && /createHmac/.test(compute)
    && /ExactEmbeddingRecipe|exactRecipeDigest/.test(compute)
    && /HMAC\(scope|embedding-compute-cache:v1/.test(compute);

  const resolveDurableFillPresent =
    /export async function resolveEmbeddingCompute\s*\(/.test(compute)
    && (/durable fill|fill intent|FillClaimResult|succeeded_uncached|unknown/.test(compute));

  const claimFillAndValidatePresent =
    /export async function claimFillIntent\s*\(/.test(compute)
    && /export function validateEmbeddingComputeValue\s*\(/.test(compute)
    && (/pollution|valueHmac|checksum/.test(compute));

  // Distinct module from retrieval-result cache (Ban conflating Redis retrieval hits with compute cache).
  const distinctFromRetrievalCache =
    /NOT the retrieval-hit cache|retrieval-result Redis cache|embedding \*compute\* cache|RAG-FUNNEL-02B/.test(compute)
    && /export async function cachedQbankSearch\s*\(/.test(retrieval)
    && !/resolveEmbeddingCompute/.test(retrieval);

  const dbExportsComputeCache =
    /resolveEmbeddingCompute/.test(dbIndex)
    && /embeddingComputeCacheKey/.test(dbIndex)
    && /qbank-embedding-compute-cache/.test(dbIndex);

  // Production consumer: worker main OR qbank generation OR memory sink must call resolveEmbeddingCompute.
  // Process-local cachingEmbedder / inMemoryEmbeddingStore alone ≠ durable compute cache (Ban invent).
  const productionConsumerWired =
    /resolveEmbeddingCompute\s*\(/.test(main + gen + memory)
    || (
      /from ['"]@meetwise\/db['"]/.test(main + gen)
      && /resolveEmbeddingCompute/.test(main + gen)
    );

  return {
    hmacCacheIdentityPresent,
    resolveDurableFillPresent,
    claimFillAndValidatePresent,
    distinctFromRetrievalCache,
    dbExportsComputeCache,
    productionConsumerWired,
  };
}

/** True iff every FUNNEL-02B production-path pin passes (Ban invent). */
export function isFunnel02BCovered(): boolean {
  const a = assessFunnel02BDurableEmbeddingComputeCache();
  return (
    a.hmacCacheIdentityPresent
    && a.resolveDurableFillPresent
    && a.claimFillAndValidatePresent
    && a.distinctFromRetrievalCache
    && a.dbExportsComputeCache
    && a.productionConsumerWired
  );
}

export function funnel02BRefuseReason(): string | null {
  if (isFunnel02BCovered()) return null;
  const a = assessFunnel02BDurableEmbeddingComputeCache();
  if (!a.hmacCacheIdentityPresent) return 'hmac_cache_identity_missing';
  if (!a.resolveDurableFillPresent) return 'resolve_durable_fill_missing';
  if (!a.claimFillAndValidatePresent) return 'claim_fill_validate_missing';
  if (!a.distinctFromRetrievalCache) return 'not_distinct_from_retrieval_cache';
  if (!a.dbExportsComputeCache) return 'db_exports_compute_cache_missing';
  if (!a.productionConsumerWired) {
    return 'production_consumer_not_wired_worker_or_generation';
  }
  return 'funnel02b_assessor_incomplete';
}

/**
 * Emit Batch2 evidence receipt. Always emits (honest partial ok).
 * Product flags stay false · coveredCountInvented=false · batch2Only=true.
 */
export function emitFunnelCoveredCountBatch2Evidence(): FunnelCoveredCountBatch2Evidence {
  const funnel02AAssessor = assessFunnel02AImmutableGenerationProjectionRecipe();
  const funnel02BAssessor = assessFunnel02BDurableEmbeddingComputeCache();
  const funnel02ACovered = isFunnel02ACovered();
  const funnel02BCovered = isFunnel02BCovered();
  const coveredIds = [
    ...(funnel02ACovered ? (['RAG-FUNNEL-02A'] as const) : []),
    ...(funnel02BCovered ? (['RAG-FUNNEL-02B'] as const) : []),
  ];

  return {
    kind: R4_FUNNEL_COVERED_COUNT_BATCH2_EVIDENCE_KIND,
    batch2Only: true,
    funnel02ACovered,
    funnel02BCovered,
    coveredIds,
    batch2CoveredCount: coveredIds.length,
    coveredCountInvented: false,
    funnel02AAssessor,
    funnel02BAssessor,
    funnel02ARefuseReason: funnel02ARefuseReason(),
    funnel02BRefuseReason: funnel02BRefuseReason(),
    r4ProductClosed: false,
    funnelProductClosed: false,
    gR45Closed: false,
    ms3EqualsR4Closed: false,
    releaseEvidence: false,
    note: 'G-R4-5 / FUNNEL coveredCount Batch2 — true-cover 02A+02B under authorize · honest assessor elevation only · Ban invent · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
}

/** Marker: Batch2 coveredCount emitter wired (≠ product close · ≠ gR45Closed). */
export const R4_FUNNEL_COVERED_COUNT_BATCH2_EMITTER_WIRED = true as const;
