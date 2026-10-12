/**
 * G-R4-5 / FUNNEL coveredCount Batch2b（02B wire）— true-cover RAG-FUNNEL-02B
 * under standing authorize (REQUEST tip c6754f2 · pre-exec dual BOTH PASS).
 *
 * Honest path:
 *   - Reuses Batch2 `assessFunnel02BDurableEmbeddingComputeCache` (same pins).
 *   - Elevates matrix 02B → covered ONLY when `productionConsumerWired=true`
 *     and other 02B module pins still hold (Ban invent).
 *   - Retains 02A/03/04 covered · coveredCount honest (3→4 if 02B covered).
 *
 * HARD:
 *   - 本刀不翻 r4ProductClosed / funnelProductClosed / gR45Closed.
 *   - Ban wash Batch2 0a980e6/5593226 · Batch1 · product-close · EG3 · rem/SSOT/EXPLICIT.
 *   - Ban MS3=R4 · Ban self-nail post_prove_dual_pass · releaseEvidence=false · ≠HA.
 *   - Status after emit = executed:awaiting_post_prove_dual (Ban self-nail dual_pass).
 */
import {
  assessFunnel02AImmutableGenerationProjectionRecipe,
  assessFunnel02BDurableEmbeddingComputeCache,
  isFunnel02ACovered,
  isFunnel02BCovered,
  funnel02ARefuseReason,
  funnel02BRefuseReason,
  type Funnel02AAssessor,
  type Funnel02BAssessor,
} from './r4-funnel-covered-count-batch2.ts';

export const R4_FUNNEL_COVERED_COUNT_BATCH2B_02B_WIRE_EVIDENCE_KIND =
  'FunnelCoveredCountBatch2b02BWireEvidence' as const;

export type FunnelCoveredCountBatch2b02BWireEvidence = {
  readonly kind: typeof R4_FUNNEL_COVERED_COUNT_BATCH2B_02B_WIRE_EVIDENCE_KIND;
  readonly batch2bOnly: true;
  readonly funnel02ACovered: boolean;
  readonly funnel02BCovered: boolean;
  readonly coveredIds: readonly string[];
  /** Covered rows this knife may elevate (02B only); matrix coveredCount includes Batch1 03/04 + Batch2 02A. */
  readonly batch2bCoveredCount: number;
  readonly coveredCountInvented: false;
  readonly productionConsumerWired: boolean;
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
  readonly note: 'G-R4-5 / FUNNEL coveredCount Batch2b 02B wire — true-cover 02B under authorize · honest assessor elevation only when productionConsumerWired · Ban invent · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch2 0a980e6/5593226 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

/**
 * Emit Batch2b 02B wire evidence receipt. Always emits (honest partial ok).
 * Product flags stay false · coveredCountInvented=false · batch2bOnly=true.
 */
export function emitFunnelCoveredCountBatch2b02BWireEvidence(): FunnelCoveredCountBatch2b02BWireEvidence {
  const funnel02AAssessor = assessFunnel02AImmutableGenerationProjectionRecipe();
  const funnel02BAssessor = assessFunnel02BDurableEmbeddingComputeCache();
  const funnel02ACovered = isFunnel02ACovered();
  const funnel02BCovered = isFunnel02BCovered();
  const coveredIds = [
    ...(funnel02ACovered ? (['RAG-FUNNEL-02A'] as const) : []),
    ...(funnel02BCovered ? (['RAG-FUNNEL-02B'] as const) : []),
  ];

  return {
    kind: R4_FUNNEL_COVERED_COUNT_BATCH2B_02B_WIRE_EVIDENCE_KIND,
    batch2bOnly: true,
    funnel02ACovered,
    funnel02BCovered,
    coveredIds,
    batch2bCoveredCount: coveredIds.filter((id) => id === 'RAG-FUNNEL-02B').length,
    coveredCountInvented: false,
    productionConsumerWired: funnel02BAssessor.productionConsumerWired,
    funnel02AAssessor,
    funnel02BAssessor,
    funnel02ARefuseReason: funnel02ARefuseReason(),
    funnel02BRefuseReason: funnel02BRefuseReason(),
    r4ProductClosed: false,
    funnelProductClosed: false,
    gR45Closed: false,
    ms3EqualsR4Closed: false,
    releaseEvidence: false,
    note: 'G-R4-5 / FUNNEL coveredCount Batch2b 02B wire — true-cover 02B under authorize · honest assessor elevation only when productionConsumerWired · Ban invent · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch2 0a980e6/5593226 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
}

/** Marker: Batch2b 02B wire emitter wired (≠ product close · ≠ gR45Closed). */
export const R4_FUNNEL_COVERED_COUNT_BATCH2B_02B_WIRE_EMITTER_WIRED = true as const;
