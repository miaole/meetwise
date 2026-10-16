/**
 * Knife F7 — MS2 **required secondary facets on product path** (G-R4-5 / MS2).
 *
 * After F6 wired the MS1 MetadataReviewReceipt product serving consumer but left
 * `facetsServedOnProductPath=[]`, this module serves the architecture-required
 * secondary facets on that **product** path (honest · ≠ forge DB rows).
 *
 * HARD honesty:
 *   - Real facet serve ≠ forge serving (caller supplies facet payload · no invented DB facts).
 *   - MS1 pin stays true · MS3 standardDeployHandoff stays false.
 *   - MS2 alone ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ R4 closed (MS3 remain).
 *   - ≠ R1 / 题域已隔离 closed · releaseEvidence=false · sole 恰 5 · no P-R1 flip.
 *   - Ban claiming G-R4-5 closed · Ban flip without authorize · ≠HA · ≠ suite green.
 */
import {
  MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED,
  type MetadataReviewReceiptProductServingAdmission,
} from './r4-p-meta-ms1-product-wire.ts';

/**
 * Architecture-required secondary facets (must match F3 REQUIRED_SECONDARY_FACETS /
 * F5 PRODUCT_FACET_SERVING_PLAN · competency/technology/difficulty/seniority/kind/language).
 */
export const MS2_PRODUCT_PATH_FACETS = [
  'competency',
  'technology',
  'difficulty',
  'seniority',
  'kind',
  'language',
] as const;

export type Ms2ProductPathFacet = (typeof MS2_PRODUCT_PATH_FACETS)[number];

/** Typed secondary-facet payload required to serve on the product path. */
export type ProductSecondaryFacetPayload = {
  readonly competency: string;
  readonly technology: string;
  readonly difficulty: number;
  readonly seniority: string;
  readonly kind: string;
  readonly language: string;
};

/**
 * Product-path facet serving admission — MS2 only.
 * standardDeployHandoff always false (MS3 open).
 */
export type ProductFacetsServingAdmission = {
  readonly kind: 'ProductFacetsServingAdmission';
  readonly served: true;
  readonly receiptId: string;
  readonly refId: string;
  readonly servingScopeId: string;
  readonly taxonomyVersion: string;
  readonly facetsServed: readonly Ms2ProductPathFacet[];
  readonly facetValues: ProductSecondaryFacetPayload;
  /** MS3 not claimed on this knife. */
  readonly standardDeployHandoff: false;
  readonly note: 'MS2 product facets served — MS3 still open · ≠ FUNNEL-01 closed · Ban forge';
};

export type ProductFacetsServingRejection = {
  readonly kind: 'ProductFacetsServingRejection';
  readonly served: false;
  readonly reason:
    | 'ms1_not_wired'
    | 'admission_not_admitted'
    | 'facet_payload_invalid'
    | 'facet_plan_mismatch';
};

export type ProductFacetsServingResult =
  | ProductFacetsServingAdmission
  | ProductFacetsServingRejection;

const FACET_STR = /^[\p{L}\p{N}_:./-]{1,128}$/u;

function isNonEmptyFacetString(x: unknown): x is string {
  return typeof x === 'string' && x.length >= 1 && x.length <= 128 && FACET_STR.test(x);
}

/**
 * Fail-closed shape check for product secondary facet payload.
 * Does not talk to Postgres — Ban forge DB serving facts in this knife.
 */
export function isValidProductSecondaryFacetPayload(
  x: unknown,
): x is ProductSecondaryFacetPayload {
  if (!x || typeof x !== 'object') return false;
  const f = x as Record<string, unknown>;
  if (!isNonEmptyFacetString(f.competency)) return false;
  if (!isNonEmptyFacetString(f.technology)) return false;
  if (typeof f.difficulty !== 'number' || f.difficulty < 1 || f.difficulty > 5) return false;
  if (!isNonEmptyFacetString(f.seniority)) return false;
  if (!isNonEmptyFacetString(f.kind)) return false;
  if (!isNonEmptyFacetString(f.language)) return false;
  return true;
}

/**
 * **Real MS2 product-path facet serve** — attach required secondary facets to an
 * already-admitted MS1 MetadataReviewReceipt product serving admission.
 *
 * - Requires MS1 consumer wired + admitted receipt (fail-closed).
 * - Requires full required facet payload (fail-closed · ≠ partial forge).
 * - Serves exactly the architecture secondary set (plan = served).
 * - Does NOT emit deploy handoff (MS3) · does NOT invent/persist forged rows.
 * - Facet serve alone ≠ FUNNEL-01 / R4 / G-R4-5 closed.
 */
export function serveRequiredSecondaryFacetsOnProductPath(
  admission: MetadataReviewReceiptProductServingAdmission | { admitted: false } | unknown,
  facets: unknown,
): ProductFacetsServingResult {
  if (MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED !== true) {
    return { kind: 'ProductFacetsServingRejection', served: false, reason: 'ms1_not_wired' };
  }
  if (
    !admission
    || typeof admission !== 'object'
    || (admission as { admitted?: unknown }).admitted !== true
    || (admission as { kind?: unknown }).kind !== 'MetadataReviewReceiptProductServingAdmission'
  ) {
    return {
      kind: 'ProductFacetsServingRejection',
      served: false,
      reason: 'admission_not_admitted',
    };
  }
  const adm = admission as MetadataReviewReceiptProductServingAdmission;
  if (!isValidProductSecondaryFacetPayload(facets)) {
    return {
      kind: 'ProductFacetsServingRejection',
      served: false,
      reason: 'facet_payload_invalid',
    };
  }
  // Plan = served: every architecture-required facet must be present on payload keys.
  const payloadKeys = Object.keys(facets).sort();
  const planKeys = [...MS2_PRODUCT_PATH_FACETS].sort();
  if (
    payloadKeys.length !== planKeys.length
    || !planKeys.every((k, i) => payloadKeys[i] === k)
  ) {
    return {
      kind: 'ProductFacetsServingRejection',
      served: false,
      reason: 'facet_plan_mismatch',
    };
  }

  return {
    kind: 'ProductFacetsServingAdmission',
    served: true,
    receiptId: adm.receiptId,
    refId: adm.refId,
    servingScopeId: adm.servingScopeId,
    taxonomyVersion: adm.taxonomyVersion,
    facetsServed: MS2_PRODUCT_PATH_FACETS,
    facetValues: {
      competency: facets.competency,
      technology: facets.technology,
      difficulty: facets.difficulty,
      seniority: facets.seniority,
      kind: facets.kind,
      language: facets.language,
    },
    standardDeployHandoff: false,
    note: 'MS2 product facets served — MS3 still open · ≠ FUNNEL-01 closed · Ban forge',
  };
}

/**
 * Marker: this module **is** the wired MS2 product-path facet serve.
 * Classifiers (F2/F3/F5) read this so MS2 flags stay honest after the real wire.
 */
export const MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED = true as const;

/** Facets honestly served on product path once MS2 wired (plan = served). */
export const MS2_FACETS_SERVED_ON_PRODUCT_PATH: readonly Ms2ProductPathFacet[] =
  MS2_PRODUCT_PATH_FACETS;

/** Product facet serve id for inventory / prove anchors. */
export const MS2_PRODUCT_FACETS_SERVE_ID =
  'r4-p-meta-ms2-facets-product:serveRequiredSecondaryFacetsOnProductPath' as const;
