/**
 * Knife F6 — MS1 **MetadataReviewReceipt product serving consumer** wire (G-R4-5 / MS1).
 *
 * After F5 named the product contract (`productServingContractNamed=true`) but left
 * `routedServingProductConsumerWired=false`, this module wires a **real** routed
 * product serving consumer: typed receipt → fail-closed validation → product
 * serving admission for the receipt's serving_scope leaf.
 *
 * HARD honesty:
 *   - Real wire ≠ forge serving (no invented DB receipt rows / no fake "served" facts).
 *   - MS1 alone ≠ FUNNEL-01 closed (MS2 full facets / MS3 standard deploy remain open).
 *   - ≠ R4 / R1 / 题域已隔离 closed · releaseEvidence=false · sole 恰 5 · no P-R1 flip.
 *   - Ban claiming G-R4-5 closed · Ban flip without authorize · ≠HA · ≠ suite green.
 */

/** Reviewed annotation sources accepted by qbank_metadata_review_receipt CHECK. */
export const MS1_ANNOTATION_SOURCES = ['curator_reviewed', 'seed_v1_reviewed'] as const;
export type Ms1AnnotationSource = (typeof MS1_ANNOTATION_SOURCES)[number];

/** Product-facing MetadataReviewReceipt shape (matches 01A table contract). */
export type MetadataReviewReceipt = {
  readonly receiptId: string;
  readonly refId: string;
  readonly sourceId: string;
  readonly taxonomyVersion: string;
  readonly servingScopeId: string;
  readonly competency?: string | null;
  readonly difficulty?: number | null;
  readonly annotationSource: Ms1AnnotationSource;
  readonly metadataHash: string;
  readonly reviewResult: 'approved' | 'rejected';
  readonly status: 'recorded' | 'voided';
  readonly reviewer: string;
};

/**
 * Product serving admission — MS1 only.
 * facetsServed always empty (MS2 open) · standardDeployHandoff always false (MS3 open).
 */
export type MetadataReviewReceiptProductServingAdmission = {
  readonly kind: 'MetadataReviewReceiptProductServingAdmission';
  readonly admitted: true;
  readonly receiptId: string;
  readonly refId: string;
  readonly servingScopeId: string;
  readonly taxonomyVersion: string;
  readonly annotationSource: Ms1AnnotationSource;
  /** MS2 not claimed on this knife. */
  readonly facetsServed: readonly [];
  /** MS3 not claimed on this knife. */
  readonly standardDeployHandoff: false;
  readonly note: 'MS1 product consumer wired — MS2/MS3 still open · ≠ FUNNEL-01 closed · Ban forge';
};

export type MetadataReviewReceiptProductServingRejection = {
  readonly kind: 'MetadataReviewReceiptProductServingRejection';
  readonly admitted: false;
  readonly reason:
    | 'receipt_shape_invalid'
    | 'receipt_not_recorded'
    | 'receipt_not_approved'
    | 'annotation_source_invalid'
    | 'metadata_hash_invalid'
    | 'serving_scope_invalid';
};

export type MetadataReviewReceiptProductServingResult =
  | MetadataReviewReceiptProductServingAdmission
  | MetadataReviewReceiptProductServingRejection;

const RECEIPT_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const SCOPE_OR_TAX = /^[A-Za-z0-9:_./-]{1,160}$/;
const HASH64 = /^[0-9a-f]{64}$/;

function isAnnotationSource(x: unknown): x is Ms1AnnotationSource {
  return x === 'curator_reviewed' || x === 'seed_v1_reviewed';
}

/**
 * Fail-closed shape check for a product MetadataReviewReceipt.
 * Does not talk to Postgres — Ban forge DB serving facts in this knife.
 */
export function isValidMetadataReviewReceiptShape(x: unknown): x is MetadataReviewReceipt {
  if (!x || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  if (typeof r.receiptId !== 'string' || !RECEIPT_ID.test(r.receiptId)) return false;
  if (typeof r.refId !== 'string' || r.refId.length < 1 || r.refId.length > 160) return false;
  if (typeof r.sourceId !== 'string' || r.sourceId.length < 1 || r.sourceId.length > 160) return false;
  if (typeof r.taxonomyVersion !== 'string' || !SCOPE_OR_TAX.test(r.taxonomyVersion)) return false;
  if (typeof r.servingScopeId !== 'string' || !SCOPE_OR_TAX.test(r.servingScopeId)) return false;
  if (!isAnnotationSource(r.annotationSource)) return false;
  if (typeof r.metadataHash !== 'string' || !HASH64.test(r.metadataHash)) return false;
  if (r.reviewResult !== 'approved' && r.reviewResult !== 'rejected') return false;
  if (r.status !== 'recorded' && r.status !== 'voided') return false;
  if (typeof r.reviewer !== 'string' || r.reviewer.length < 1 || r.reviewer.length > 128) return false;
  if (r.competency != null && (typeof r.competency !== 'string' || r.competency.length < 1 || r.competency.length > 128)) {
    return false;
  }
  if (r.difficulty != null && (typeof r.difficulty !== 'number' || r.difficulty < 1 || r.difficulty > 5)) {
    return false;
  }
  return true;
}

/**
 * **Real MS1 product serving consumer** — admit an approved, recorded
 * MetadataReviewReceipt into the routed product serving path for its leaf.
 *
 * - Rejects voided / rejected / invalid shapes (fail-closed).
 * - Does NOT serve secondary facets (MS2) · does NOT emit deploy handoff (MS3).
 * - Does NOT invent or persist forged receipt rows (caller supplies receipt).
 * - Admission alone ≠ FUNNEL-01 / R4 / G-R4-5 closed.
 */
export function admitMetadataReviewReceiptToProductServing(
  receipt: unknown,
): MetadataReviewReceiptProductServingResult {
  if (!isValidMetadataReviewReceiptShape(receipt)) {
    return { kind: 'MetadataReviewReceiptProductServingRejection', admitted: false, reason: 'receipt_shape_invalid' };
  }
  if (receipt.status !== 'recorded') {
    return { kind: 'MetadataReviewReceiptProductServingRejection', admitted: false, reason: 'receipt_not_recorded' };
  }
  if (receipt.reviewResult !== 'approved') {
    return { kind: 'MetadataReviewReceiptProductServingRejection', admitted: false, reason: 'receipt_not_approved' };
  }
  if (!isAnnotationSource(receipt.annotationSource)) {
    return { kind: 'MetadataReviewReceiptProductServingRejection', admitted: false, reason: 'annotation_source_invalid' };
  }
  if (!HASH64.test(receipt.metadataHash)) {
    return { kind: 'MetadataReviewReceiptProductServingRejection', admitted: false, reason: 'metadata_hash_invalid' };
  }
  if (!SCOPE_OR_TAX.test(receipt.servingScopeId) || !SCOPE_OR_TAX.test(receipt.taxonomyVersion)) {
    return { kind: 'MetadataReviewReceiptProductServingRejection', admitted: false, reason: 'serving_scope_invalid' };
  }

  return {
    kind: 'MetadataReviewReceiptProductServingAdmission',
    admitted: true,
    receiptId: receipt.receiptId,
    refId: receipt.refId,
    servingScopeId: receipt.servingScopeId,
    taxonomyVersion: receipt.taxonomyVersion,
    annotationSource: receipt.annotationSource,
    facetsServed: [],
    standardDeployHandoff: false,
    note: 'MS1 product consumer wired — MS2/MS3 still open · ≠ FUNNEL-01 closed · Ban forge',
  };
}

/**
 * Marker: this module **is** the wired MS1 MetadataReviewReceipt product serving consumer.
 * Classifiers (F2/F3/F5) read this so MS1 flags stay honest after the real wire.
 */
export const MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED = true as const;

/** Product consumer id for inventory / prove anchors. */
export const MS1_PRODUCT_SERVING_CONSUMER_ID =
  'r4-p-meta-ms1-product-wire:admitMetadataReviewReceiptToProductServing' as const;
