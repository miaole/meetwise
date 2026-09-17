/**
 * Knife F5 — P-META **serving product remaining** classifiers (G-R4-5 / MS1–MS3).
 *
 * Inventory (r4-domain-isolation §2 / §6c.3 · G-R4-5 · RAG-FUNNEL-01):
 *   MS1 = independent routed MetadataReviewReceipt serving **product** consumer
 *   MS2 = full secondary facets served on that **product** path
 *   MS3 = standard deploy / combo-root **product** handoff receipt
 *
 * F5 named product contract / facet plan / deploy checklist (honest progress).
 * F6 wired the real MS1 product serving consumer →
 *   `routedServingProductConsumerWired=true` · contract.wired=true (honest).
 * F7 served required secondary facets on product path →
 *   `facetsServedOnProductPath` = required set (honest).
 * MS3 remain false · G-R4-5 / FUNNEL-01 STILL OPEN · Ban forge.
 *
 * HARD:
 *   - Ban forging MetadataReviewReceipt serving / claiming FUNNEL-01 closed.
 *   - 01A source seal ≠ 01 closed · MS1 alone ≠ 01 closed.
 *   - No P-R1 default flip · no invent MODEL_API_KEY · releaseEvidence=false.
 *   - ≠HA · sole 恰 5 · EXIT=0 ≠ R4 closed ≠ knife product-done.
 *   - G-R4-3 / P-R1 remains parallel open (not this F5/F6 scope).
 */
import {
  REQUIRED_SECONDARY_FACETS,
  classifyPMetaServingRemaining,
  isServing01ANotEqual01,
  isServingFunnel01Closed,
  type PMetaServingRemainingStatus,
  type RequiredSecondaryFacet,
} from './r4-p-meta-serving-remaining.ts';
import { MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED } from './r4-p-meta-ms1-product-wire.ts';
import {
  MS2_FACETS_SERVED_ON_PRODUCT_PATH,
  MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED,
} from './r4-p-meta-ms2-facets-product.ts';

/**
 * Named product contract for MetadataReviewReceipt serving.
 * F6: wired=true via real product consumer (≠ forge · MS2/MS3 still open).
 */
export type MetadataReviewReceiptServingProductContract = {
  readonly kind: 'MetadataReviewReceiptServingProductContract';
  readonly wired: boolean;
  readonly note: string;
};

export const METADATA_REVIEW_RECEIPT_SERVING_PRODUCT_CONTRACT: MetadataReviewReceiptServingProductContract =
  {
    kind: 'MetadataReviewReceiptServingProductContract',
    wired: MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED === true,
    note: MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED
      ? 'MS1 product consumer wired — MS3 still open · ≠ FUNNEL-01 closed · Ban forge'
      : 'Ban forge serving — contract named only; product consumer not wired',
  };

/** Product facet serving plan pinned to architecture secondary set (≠ served). */
export const PRODUCT_FACET_SERVING_PLAN: readonly RequiredSecondaryFacet[] =
  REQUIRED_SECONDARY_FACETS;

/** Standard deploy product handoff checklist ids (named · evidence still missing). */
export const PRODUCT_DEPLOY_HANDOFF_CHECKLIST = [
  'local_01A_handoff_prove',
  'combo_root_receipt',
  'standard_or_cloud_deploy_receipt',
] as const;

export type ProductDeployHandoffChecklistItem =
  (typeof PRODUCT_DEPLOY_HANDOFF_CHECKLIST)[number];

/** MS1–MS3 serving **product** remaining surface (deepened vs F3 serving honesty). */
export type PMetaServingProductRemainingStatus = {
  /** F2/01A: qbank_metadata_review_receipt + control-definer sealed in source. */
  sourceSealed01A: boolean;
  /** Honest progress: product serving contract is named (≠ alone enough for FUNNEL). */
  productServingContractNamed: boolean;
  /**
   * MS1: product routed MetadataReviewReceipt serving consumer wired.
   * F6: true via real wire (≠ forge · MS2/MS3 still open · G-R4-5 STILL OPEN).
   */
  routedServingProductConsumerWired: boolean;
  /** Honest progress: product facet serving plan pinned to required set. */
  productFacetServingPlanPinned: boolean;
  /** Required secondary facets (architecture). */
  requiredFacets: readonly RequiredSecondaryFacet[];
  /**
   * MS2: facets actually served on product path.
   * F7: equals required set when MS2 product-path facet serve wired.
   */
  facetsServedOnProductPath: readonly RequiredSecondaryFacet[];
  /** Honest progress: standard deploy product handoff checklist named. */
  productDeployHandoffChecklistNamed: boolean;
  /** Checklist inventory (named · ≠ evidence). */
  productDeployHandoffChecklist: readonly ProductDeployHandoffChecklistItem[];
  /** MS3: standard deploy / combo-root product handoff evidence — still open. */
  standardDeployProductHandoff: boolean;
  /** Local 01A handoff-closure prove exists (旁证 ≠ 01 / ≠ standard deploy). */
  local01AHandoffProveExists: boolean;
  /** G-R4-3 / P-R1 remains parallel open (F4 honesty · not this F5/F6). */
  gR43PR1ParallelOpen: boolean;
};

/**
 * Honest P-META serving **product** remaining snapshot (MS1–MS3).
 * Product contract / facet plan / deploy checklist are named (F5 progress).
 * MS1 wired bit follows F6 real consumer · MS2 served follows F7 · MS3 stays false — Ban forge.
 */
export function classifyPMetaServingProductRemaining(
  serving: PMetaServingRemainingStatus = classifyPMetaServingRemaining(),
): PMetaServingProductRemainingStatus {
  const ms2 = MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED === true;
  return {
    sourceSealed01A: serving.sourceSealed01A,
    productServingContractNamed: true,
    routedServingProductConsumerWired: serving.routedServingConsumerWired,
    productFacetServingPlanPinned: true,
    requiredFacets: PRODUCT_FACET_SERVING_PLAN,
    facetsServedOnProductPath: ms2
      ? (MS2_FACETS_SERVED_ON_PRODUCT_PATH as readonly RequiredSecondaryFacet[])
      : [],
    productDeployHandoffChecklistNamed: true,
    productDeployHandoffChecklist: PRODUCT_DEPLOY_HANDOFF_CHECKLIST,
    standardDeployProductHandoff: serving.standardDeployHandoff,
    local01AHandoffProveExists: serving.local01AHandoffProveExists,
    gR43PR1ParallelOpen: true,
  };
}

/** FUNNEL-01 product closed iff MS1+MS2+MS3 product surfaces wired. 01A/MS1 alone ≠ 01. */
export function isProductFunnel01Closed(
  status: PMetaServingProductRemainingStatus = classifyPMetaServingProductRemaining(),
): boolean {
  return (
    status.routedServingProductConsumerWired
    && status.facetsServedOnProductPath.length === status.requiredFacets.length
    && status.requiredFacets.every((f, i) => status.facetsServedOnProductPath[i] === f)
    && status.standardDeployProductHandoff
  );
}

/** 01A ≠ 01 when seal present but product FUNNEL-01 still open. */
export function isProduct01ANotEqual01(
  status: PMetaServingProductRemainingStatus = classifyPMetaServingProductRemaining(),
): boolean {
  return status.sourceSealed01A && !isProductFunnel01Closed(status);
}

/** Consistency with F3 serving classifiers (must not diverge on MS bits). */
export function productAlignsWithF3Serving(
  product: PMetaServingProductRemainingStatus = classifyPMetaServingProductRemaining(),
  serving: PMetaServingRemainingStatus = classifyPMetaServingRemaining(),
): boolean {
  return (
    product.sourceSealed01A === serving.sourceSealed01A
    && product.routedServingProductConsumerWired === serving.routedServingConsumerWired
    && product.standardDeployProductHandoff === serving.standardDeployHandoff
    && product.local01AHandoffProveExists === serving.local01AHandoffProveExists
    && product.facetsServedOnProductPath.length === serving.facetsServedOnRoutedPath.length
    && product.requiredFacets.length === serving.requiredFacets.length
    && product.requiredFacets.every((f, i) => serving.requiredFacets[i] === f)
    && isProductFunnel01Closed(product) === isServingFunnel01Closed(serving)
    && isProduct01ANotEqual01(product) === isServing01ANotEqual01(serving)
    && METADATA_REVIEW_RECEIPT_SERVING_PRODUCT_CONTRACT.wired
      === product.routedServingProductConsumerWired
  );
}
