/**
 * G-R4-5 EG1 — MetadataReviewReceipt / RAG-FUNNEL-01 **dual-claim evidence** emitter.
 *
 * Honest path (Ban forge):
 *   - Anchors to real F6/F7/F8 MS1+MS2+MS3 product markers (already landed).
 *   - Emits a dual-claim evidence receipt documenting **01A ≡ 01** at product
 *     surfaces (closing the **01A ≠ 01** narrative gap that meta-only EXIT=0
 *     never produced as a dual-claim artifact).
 *
 * HARD:
 *   - Evidence emit ≠ EG1 closed · ≠ G-R4-5 dual-claim closed · ≠ R4/题域 closed.
 *   - Ban forge · Ban claim closed from EXIT=0 alone · releaseEvidence=false · ≠HA.
 *   - Ban idle re-run of the same 5×meta prove as fake close — this module is the
 *     EG1-specific evidence path those five CMDs never emitted.
 */
import {
  classifyPMetaRemaining,
  is01ANotEqual01,
  isRagFunnel01Closed,
  type PMetaRemainingStatus,
} from './r4-p-meta-p-r1-remaining.ts';
import {
  classifyPMetaServingProductRemaining,
  isProduct01ANotEqual01,
  isProductFunnel01Closed,
  type PMetaServingProductRemainingStatus,
} from './r4-p-meta-serving-product-remaining.ts';
import { MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED } from './r4-p-meta-ms1-product-wire.ts';
import { MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED } from './r4-p-meta-ms2-facets-product.ts';
import { MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_WIRED } from './r4-p-meta-ms3-deploy-product.ts';

/** Canonical EG1 dual-claim evidence kind. */
export const EG1_DUAL_CLAIM_EVIDENCE_KIND =
  'MetadataReviewReceiptRagFunnel01DualClaimEvidence' as const;

/**
 * Honest dual-claim evidence that 01A ≡ 01 at product surfaces.
 * Does NOT elevate G-R4-5 / R4 / 题域 to closed.
 */
export type MetadataReviewReceiptRagFunnel01DualClaimEvidence = {
  readonly kind: typeof EG1_DUAL_CLAIM_EVIDENCE_KIND;
  /** Product surfaces: 01A seal + MS1 + MS2 + MS3 → 01A ≡ 01. */
  readonly gap01AEquals01: true;
  readonly sourceSealed01A: true;
  readonly ms1ProductConsumerWired: true;
  readonly ms2ProductFacetsServed: true;
  readonly ms3StandardDeployHandoff: true;
  readonly ragFunnel01ProductClosed: true;
  readonly productFunnel01Closed: true;
  readonly is01ANotEqual01: false;
  readonly isProduct01ANotEqual01: false;
  /** Explicit non-claims retained on the receipt itself. */
  readonly gR45DualClaimClosed: false;
  readonly r4ProductClosed: false;
  readonly domainIsolationClosed: false;
  readonly releaseEvidence: false;
  readonly note: 'EG1 dual-claim evidence — 01A≡01 at product surfaces · ≠ G-R4-5/R4/题域 closed · Ban forge · await post-prove dual';
};

export type Eg1DualClaimEvidenceFailure = {
  readonly kind: 'Eg1DualClaimEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'ms1_not_wired'
    | 'ms2_not_served'
    | 'ms3_not_handoff'
    | 'classifier_01A_still_not_equal_01'
    | 'product_classifier_01A_still_not_equal_01'
    | 'funnel01_product_not_closed';
};

export type Eg1DualClaimEvidenceResult =
  | { readonly emitted: true; readonly evidence: MetadataReviewReceiptRagFunnel01DualClaimEvidence }
  | Eg1DualClaimEvidenceFailure;

/**
 * Emit honest EG1 dual-claim evidence from live MS1/MS2/MS3 classifiers.
 * Fail-closed: refuse to emit if any required marker is false (Ban forge).
 */
export function emitMetadataReviewReceiptRagFunnel01DualClaimEvidence(
  f2: PMetaRemainingStatus = classifyPMetaRemaining(),
  product: PMetaServingProductRemainingStatus = classifyPMetaServingProductRemaining(),
): Eg1DualClaimEvidenceResult {
  if (MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED !== true
    || f2.routedServingWired !== true
    || product.routedServingProductConsumerWired !== true) {
    return { kind: 'Eg1DualClaimEvidenceFailure', emitted: false, reason: 'ms1_not_wired' };
  }
  if (MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED !== true
    || f2.fullFacetsServed !== true) {
    return { kind: 'Eg1DualClaimEvidenceFailure', emitted: false, reason: 'ms2_not_served' };
  }
  if (MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_WIRED !== true
    || f2.standardDeployHandoff !== true
    || product.standardDeployProductHandoff !== true) {
    return { kind: 'Eg1DualClaimEvidenceFailure', emitted: false, reason: 'ms3_not_handoff' };
  }
  if (!isRagFunnel01Closed(f2) || !isProductFunnel01Closed(product)) {
    return {
      kind: 'Eg1DualClaimEvidenceFailure',
      emitted: false,
      reason: 'funnel01_product_not_closed',
    };
  }
  if (is01ANotEqual01(f2) !== false) {
    return {
      kind: 'Eg1DualClaimEvidenceFailure',
      emitted: false,
      reason: 'classifier_01A_still_not_equal_01',
    };
  }
  if (isProduct01ANotEqual01(product) !== false) {
    return {
      kind: 'Eg1DualClaimEvidenceFailure',
      emitted: false,
      reason: 'product_classifier_01A_still_not_equal_01',
    };
  }

  const evidence: MetadataReviewReceiptRagFunnel01DualClaimEvidence = {
    kind: EG1_DUAL_CLAIM_EVIDENCE_KIND,
    gap01AEquals01: true,
    sourceSealed01A: true,
    ms1ProductConsumerWired: true,
    ms2ProductFacetsServed: true,
    ms3StandardDeployHandoff: true,
    ragFunnel01ProductClosed: true,
    productFunnel01Closed: true,
    is01ANotEqual01: false,
    isProduct01ANotEqual01: false,
    gR45DualClaimClosed: false,
    r4ProductClosed: false,
    domainIsolationClosed: false,
    releaseEvidence: false,
    note: 'EG1 dual-claim evidence — 01A≡01 at product surfaces · ≠ G-R4-5/R4/题域 closed · Ban forge · await post-prove dual',
  };
  return { emitted: true, evidence };
}

/** Marker: this module is the EG1 dual-claim evidence emitter (≠ 5×meta prove). */
export const EG1_DUAL_CLAIM_EVIDENCE_EMITTER_WIRED = true as const;
