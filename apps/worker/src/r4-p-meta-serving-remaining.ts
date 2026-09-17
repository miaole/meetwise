/**
 * Knife F3 — P-META **serving remaining** honesty classifiers (G-R4-5 / MS1–MS3).
 *
 * Inventory (r4-domain-isolation §2 / §6c.3 · G-R4-5 · RAG-FUNNEL-01):
 *   MS1 = independent routed MetadataReviewReceipt serving consumer
 *   MS2 = full secondary facets served on that path
 *   MS3 = standard deploy / combo-root handoff receipt
 *
 * Prior F2 sealed 01A honesty + remaining-gap classifiers.
 * F6 landed MS1 product consumer → `routedServingConsumerWired=true` (honest).
 * MS2/MS3 remain false · FUNNEL-01 / G-R4-5 STILL OPEN · Ban forge.
 *
 * HARD:
 *   - Ban forging MetadataReviewReceipt serving / claiming FUNNEL-01 closed.
 *   - 01A source seal ≠ 01 closed · MS1 alone ≠ 01 closed.
 *   - No P-R1 default flip · no invent MODEL_API_KEY · releaseEvidence=false.
 *   - ≠HA · sole 恰 5 · EXIT=0 ≠ R4 closed.
 */
import {
  classifyPMetaRemaining,
  is01ANotEqual01,
  isRagFunnel01Closed,
  type PMetaRemainingStatus,
} from './r4-p-meta-p-r1-remaining.ts';

/** Secondary facets required for RAG-FUNNEL-01 full facets (architecture). */
export const REQUIRED_SECONDARY_FACETS = [
  'competency',
  'technology',
  'difficulty',
  'seniority',
  'kind',
  'language',
] as const;

export type RequiredSecondaryFacet = (typeof REQUIRED_SECONDARY_FACETS)[number];

/** MS1–MS3 serving remaining surface (deepened vs F2 MR1). */
export type PMetaServingRemainingStatus = {
  /** F2/01A: qbank_metadata_review_receipt + control-definer sealed in source. */
  sourceSealed01A: boolean;
  /**
   * MS1: independent receipt enters routed serving consumer.
   * F6: true via real product consumer wire.
   */
  routedServingConsumerWired: boolean;
  /** MS2: all required secondary facets served on routed path — still open. */
  fullFacetsServed: boolean;
  /** Named required facets inventory (honesty). */
  requiredFacets: readonly RequiredSecondaryFacet[];
  /** Facets actually served on MetadataReviewReceipt routed path — empty while MS2 open. */
  facetsServedOnRoutedPath: readonly RequiredSecondaryFacet[];
  /** MS3: standard deploy / combo-root handoff receipt — still open. */
  standardDeployHandoff: boolean;
  /** Local 01A handoff-closure prove exists (旁证 ≠ 01 / ≠ standard deploy). */
  local01AHandoffProveExists: boolean;
};

/**
 * Honest P-META serving remaining snapshot (MS1–MS3).
 * Aligns with F2 classifyPMetaRemaining; MS1 follows F6 wire; MS2/MS3 stay false.
 */
export function classifyPMetaServingRemaining(
  base: PMetaRemainingStatus = classifyPMetaRemaining(),
): PMetaServingRemainingStatus {
  return {
    sourceSealed01A: base.sourceSealed01A,
    routedServingConsumerWired: base.routedServingWired,
    fullFacetsServed: base.fullFacetsServed,
    requiredFacets: REQUIRED_SECONDARY_FACETS,
    facetsServedOnRoutedPath: [],
    standardDeployHandoff: base.standardDeployHandoff,
    local01AHandoffProveExists: true,
  };
}

/** FUNNEL-01 closed iff MS1+MS2+MS3 wired. 01A alone ≠ 01 · MS1 alone ≠ 01. */
export function isServingFunnel01Closed(
  status: PMetaServingRemainingStatus = classifyPMetaServingRemaining(),
): boolean {
  return (
    status.routedServingConsumerWired
    && status.fullFacetsServed
    && status.standardDeployHandoff
  );
}

/** 01A ≠ 01 when seal present but serving FUNNEL-01 still open. */
export function isServing01ANotEqual01(
  status: PMetaServingRemainingStatus = classifyPMetaServingRemaining(),
): boolean {
  return status.sourceSealed01A && !isServingFunnel01Closed(status);
}

/** Consistency with F2 classifiers (must not diverge). */
export function servingAlignsWithF2Remaining(
  serving: PMetaServingRemainingStatus = classifyPMetaServingRemaining(),
  f2: PMetaRemainingStatus = classifyPMetaRemaining(),
): boolean {
  return (
    serving.sourceSealed01A === f2.sourceSealed01A
    && serving.routedServingConsumerWired === f2.routedServingWired
    && serving.fullFacetsServed === f2.fullFacetsServed
    && serving.standardDeployHandoff === f2.standardDeployHandoff
    && isServingFunnel01Closed(serving) === isRagFunnel01Closed(f2)
    && isServing01ANotEqual01(serving) === is01ANotEqual01(f2)
  );
}
