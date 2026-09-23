/**
 * G-R4-5 / FUNNEL coveredCount Batch4b（08 eval）— true-cover RAG-FUNNEL-08
 * under standing authorize (REQUEST tip 77b9d57 · pre-exec dual BOTH PASS).
 *
 * Honest path:
 *   - Reuses Batch4 `assessFunnel08ProductionEquivalentEval` / `isFunnel08Covered`
 *     (same pins).
 *   - Elevates matrix 08 → covered ONLY when production-equivalent receipts +
 *     thresholds + per-leaf Recall@K + wrong-track=0 + notLocalFakeAlone affirm
 *     (Ban invent coveredCount=8).
 *   - Retains 02A/02B/03/04/05/06/07 covered · coveredCount honest (7→8 if affirmed).
 *
 * HARD:
 *   - 本刀不翻 r4ProductClosed / funnelProductClosed / gR45Closed.
 *   - Ban wash Batch4 9b8b9a7/b0f5c50 · Batch3b 85be7ad/9aa1be4 · Batch3 · Batch2b · Batch2 · Batch1 · product-close · EG3.
 *   - Ban MS3=R4 · Ban self-nail post_prove_dual_pass · releaseEvidence=false · ≠HA.
 *   - Ban docs-only fake cover — eval wire must produce+bind receipts (real run).
 *   - Status after emit = executed:awaiting_post_prove_dual.
 *   - covering 08 ≠ product closed / ≠ G-R4-5 closed.
 */
import {
  assessFunnel08ProductionEquivalentEval,
  isFunnel08Covered,
  funnel08RefuseReason,
  type Funnel08Assessor,
} from './r4-funnel-covered-count-batch4.ts';
import {
  PRODUCTION_EQUIVALENT_FUNNEL_08_EVAL_WIRED,
  type Funnel08EvalRunResult,
} from './production-equivalent-funnel-08-eval.ts';

export const R4_FUNNEL_COVERED_COUNT_BATCH4B_08_EVAL_EVIDENCE_KIND =
  'FunnelCoveredCountBatch4b08EvalEvidence' as const;

export type FunnelCoveredCountBatch4b08EvalEvidence = {
  readonly kind: typeof R4_FUNNEL_COVERED_COUNT_BATCH4B_08_EVAL_EVIDENCE_KIND;
  readonly batch4bOnly: true;
  readonly funnel08Covered: boolean;
  readonly coveredIds: readonly string[];
  /** Covered rows this knife may elevate (08 only); matrix coveredCount includes priors. */
  readonly batch4bCoveredCount: number;
  readonly coveredCountInvented: false;
  readonly evalWirePresent: boolean;
  readonly funnel08Assessor: Funnel08Assessor;
  readonly funnel08RefuseReason: string | null;
  readonly evalRun: Funnel08EvalRunResult | null;
  /** 本刀不翻 — product close is a separate knife. */
  readonly r4ProductClosed: false;
  readonly funnelProductClosed: false;
  readonly gR45Closed: false;
  readonly ms3EqualsR4Closed: false;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / FUNNEL coveredCount Batch4b 08 eval — true-cover 08 under authorize · honest assessor elevation only when production-equivalent eval matrix evidenced · Ban invent coveredCount=8 · Ban docs-only fake cover · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch4 9b8b9a7/b0f5c50 · Ban wash Batch3b 85be7ad/9aa1be4 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · covering 08 ≠ product closed · await post-prove dual';
};

/**
 * Emit Batch4b 08 eval evidence receipt. Always emits (honest refuse ok).
 * Product flags stay false · coveredCountInvented=false · batch4bOnly=true.
 */
export function emitFunnelCoveredCountBatch4b08EvalEvidence(
  evalRun: Funnel08EvalRunResult | null = null,
): FunnelCoveredCountBatch4b08EvalEvidence {
  const funnel08Assessor = assessFunnel08ProductionEquivalentEval();
  const funnel08Covered = isFunnel08Covered();
  const coveredIds = funnel08Covered ? (['RAG-FUNNEL-08'] as const) : [];

  return {
    kind: R4_FUNNEL_COVERED_COUNT_BATCH4B_08_EVAL_EVIDENCE_KIND,
    batch4bOnly: true,
    funnel08Covered,
    coveredIds,
    batch4bCoveredCount: coveredIds.length,
    coveredCountInvented: false,
    evalWirePresent: PRODUCTION_EQUIVALENT_FUNNEL_08_EVAL_WIRED === true,
    funnel08Assessor,
    funnel08RefuseReason: funnel08RefuseReason(),
    evalRun,
    r4ProductClosed: false,
    funnelProductClosed: false,
    gR45Closed: false,
    ms3EqualsR4Closed: false,
    releaseEvidence: false,
    note: 'G-R4-5 / FUNNEL coveredCount Batch4b 08 eval — true-cover 08 under authorize · honest assessor elevation only when production-equivalent eval matrix evidenced · Ban invent coveredCount=8 · Ban docs-only fake cover · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban wash Batch4 9b8b9a7/b0f5c50 · Ban wash Batch3b 85be7ad/9aa1be4 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · covering 08 ≠ product closed · await post-prove dual',
  };
}

/** Marker: Batch4b 08 eval emitter wired (≠ product close · ≠ gR45Closed). */
export const R4_FUNNEL_COVERED_COUNT_BATCH4B_08_EVAL_EMITTER_WIRED = true as const;
