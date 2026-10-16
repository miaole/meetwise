/**
 * G-R4-5 / FUNNEL coveredCount Batch3b（05/06 wire）— true-cover RAG-FUNNEL-05 + RAG-FUNNEL-06
 * under standing authorize (REQUEST tip 5c8f1ff · pre-exec dual BOTH PASS).
 *
 * Honest path:
 *   - Reuses Batch3 `assessFunnel05SameLeafLlmCleanMiss` /
 *     `assessFunnel06RouteScopeCacheProvenanceRevoke` (same pins).
 *   - Elevates matrix 05/06 → covered ONLY when `productionConsumerWired=true`
 *     and other module pins still hold (Ban invent).
 *   - Retains 02A/02B/03/04 covered · coveredCount honest (4→6 if both affirmed).
 *
 * HARD:
 *   - 本刀不翻 r4ProductClosed / funnelProductClosed / gR45Closed.
 *   - Ban wash Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 · Batch1 · product-close · EG3.
 *   - Ban MS3=R4 · Ban self-nail post_prove_dual_pass · releaseEvidence=false · ≠HA.
 *   - Ban elevating 07/08 · Status after emit = executed:awaiting_post_prove_dual.
 *   - Ban docs-only fake cover — wire must be real import+invoke like Batch2b.
 */
import {
  assessFunnel05SameLeafLlmCleanMiss,
  assessFunnel06RouteScopeCacheProvenanceRevoke,
  isFunnel05Covered,
  isFunnel06Covered,
  funnel05RefuseReason,
  funnel06RefuseReason,
  type Funnel05Assessor,
  type Funnel06Assessor,
} from './r4-funnel-covered-count-batch3.ts';

export const R4_FUNNEL_COVERED_COUNT_BATCH3B_05_06_WIRE_EVIDENCE_KIND =
  'FunnelCoveredCountBatch3b0506WireEvidence' as const;

export type FunnelCoveredCountBatch3b0506WireEvidence = {
  readonly kind: typeof R4_FUNNEL_COVERED_COUNT_BATCH3B_05_06_WIRE_EVIDENCE_KIND;
  readonly batch3bOnly: true;
  readonly funnel05Covered: boolean;
  readonly funnel06Covered: boolean;
  readonly coveredIds: readonly string[];
  /** Covered rows this knife may elevate (05/06 only); matrix coveredCount includes Batch1+Batch2/2b. */
  readonly batch3bCoveredCount: number;
  readonly coveredCountInvented: false;
  readonly funnel05ProductionConsumerWired: boolean;
  readonly funnel06ProductionConsumerWired: boolean;
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
  readonly note: 'G-R4-5 / FUNNEL coveredCount Batch3b 05/06 wire — true-cover 05+06 under authorize · honest assessor elevation only when productionConsumerWired · Ban invent · Ban docs-only fake cover · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch3 bd3a800/e468de9 · Ban wash Batch2b ddfb64d/824e072 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban elevating 07/08 · await post-prove dual';
};

/**
 * Emit Batch3b 05/06 wire evidence receipt. Always emits (honest partial ok).
 * Product flags stay false · coveredCountInvented=false · batch3bOnly=true.
 */
export function emitFunnelCoveredCountBatch3b0506WireEvidence(): FunnelCoveredCountBatch3b0506WireEvidence {
  const funnel05Assessor = assessFunnel05SameLeafLlmCleanMiss();
  const funnel06Assessor = assessFunnel06RouteScopeCacheProvenanceRevoke();
  const funnel05Covered = isFunnel05Covered();
  const funnel06Covered = isFunnel06Covered();
  const coveredIds = [
    ...(funnel05Covered ? (['RAG-FUNNEL-05'] as const) : []),
    ...(funnel06Covered ? (['RAG-FUNNEL-06'] as const) : []),
  ];

  return {
    kind: R4_FUNNEL_COVERED_COUNT_BATCH3B_05_06_WIRE_EVIDENCE_KIND,
    batch3bOnly: true,
    funnel05Covered,
    funnel06Covered,
    coveredIds,
    batch3bCoveredCount: coveredIds.length,
    coveredCountInvented: false,
    funnel05ProductionConsumerWired: funnel05Assessor.productionConsumerWired,
    funnel06ProductionConsumerWired: funnel06Assessor.productionConsumerWired,
    funnel05Assessor,
    funnel06Assessor,
    funnel05RefuseReason: funnel05RefuseReason(),
    funnel06RefuseReason: funnel06RefuseReason(),
    r4ProductClosed: false,
    funnelProductClosed: false,
    gR45Closed: false,
    ms3EqualsR4Closed: false,
    releaseEvidence: false,
    note: 'G-R4-5 / FUNNEL coveredCount Batch3b 05/06 wire — true-cover 05+06 under authorize · honest assessor elevation only when productionConsumerWired · Ban invent · Ban docs-only fake cover · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch3 bd3a800/e468de9 · Ban wash Batch2b ddfb64d/824e072 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban elevating 07/08 · await post-prove dual',
  };
}

/** Marker: Batch3b 05/06 wire emitter wired (≠ product close · ≠ gR45Closed). */
export const R4_FUNNEL_COVERED_COUNT_BATCH3B_05_06_WIRE_EMITTER_WIRED = true as const;
