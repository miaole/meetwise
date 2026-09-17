/**
 * Knife F2 — P-META · P-R1 **remaining** honesty classifiers.
 *
 * Inventory (r4-domain-isolation §2 / §6c.3 · G-R4-3 / G-R4-5):
 *   P-META = RAG-FUNNEL-01: independent MetadataReviewReceipt serving + full
 *            facets + standard deploy handoff. 01A source seal ≠ 01 closed.
 *   P-R1   = GAP-RAG-01: production must not depend on legacy「技术岗」default,
 *            and flag-on needs combo-root evidence. Contract prove ≠ R1 closed.
 *
 * F6 landed MS1 product consumer wire → `routedServingWired=true` (honest).
 * F7 landed MS2 product-path facets → `fullFacetsServed=true` (honest).
 * MS3 deploy remain false · FUNNEL-01 / G-R4-5 STILL OPEN.
 *
 * HARD:
 *   - These classifiers document **remaining** — they do NOT close R1 /
 *     RAG-FUNNEL-01 / R4 / 题域已隔离.
 *   - No flip of MEETWISE_TECH_ROLE_FAIL_CLOSED default.
 *   - No invent MODEL_API_KEY · releaseEvidence=false · ≠HA · sole 恰 5.
 *   - Ban forging MetadataReviewReceipt serving / claiming R1 closed.
 *   - MS1 alone ≠ FUNNEL-01 closed (MS2/MS3 remain).
 */
import {
  isTechRoleFailClosedEnabled,
  LEGACY_TECH_ROLE_DEFAULT,
} from './adaptive-role-resolve.ts';
import { MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED } from './r4-p-meta-ms1-product-wire.ts';
import { MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED } from './r4-p-meta-ms2-facets-product.ts';

/** P-META remaining surface (RAG-FUNNEL-01 vs 01A). */
export type PMetaRemainingStatus = {
  /** 01A: qbank_metadata_review_receipt + control-definer sealed in source. */
  sourceSealed01A: boolean;
  /**
   * 01/MS1: independent receipt enters routed serving.
   * F6: true via real product consumer wire (≠ forge · MS2/MS3 still open).
   */
  routedServingWired: boolean;
  /**
   * Full facets on serving path.
   * F7: true via real MS2 product-path facet serve (≠ forge · MS3 still open).
   */
  fullFacetsServed: boolean;
  /** Standard deploy / combo-root handoff receipt — still open (MS3). */
  standardDeployHandoff: boolean;
};

/** P-R1 remaining surface (GAP-RAG-01). */
export type PR1RemainingStatus = {
  /** Empty-env default of fail-closed flag (must stay false — no flip). */
  failClosedFlagDefaultOn: boolean;
  /** Legacy default string still documented for flag-off path. */
  legacyDefaultLabel: string;
  /** Contract harness + prove exists (旁证 ≠ closed). */
  contractHarnessExists: boolean;
  /** R1 closed claim — always false on this knife. */
  r1Closed: boolean;
};

/**
 * Honest P-META remaining snapshot.
 * sourceSealed01A asserted true by inventory (01A done).
 * MS1 routedServingWired follows F6 real product consumer marker.
 * MS2 fullFacetsServed follows F7 real product-path facet serve marker.
 * MS3 deploy stays false until a future knife lands it.
 */
export function classifyPMetaRemaining(): PMetaRemainingStatus {
  return {
    sourceSealed01A: true,
    routedServingWired: MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED === true,
    fullFacetsServed: MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED === true,
    standardDeployHandoff: false,
  };
}

/** RAG-FUNNEL-01 closed iff all three 01 surfaces are wired. 01A alone ≠ 01. MS1 alone ≠ 01. */
export function isRagFunnel01Closed(
  status: PMetaRemainingStatus = classifyPMetaRemaining(),
): boolean {
  return (
    status.routedServingWired
    && status.fullFacetsServed
    && status.standardDeployHandoff
  );
}

/** 01A ≠ 01 when seal present but FUNNEL-01 still open. */
export function is01ANotEqual01(
  status: PMetaRemainingStatus = classifyPMetaRemaining(),
): boolean {
  return status.sourceSealed01A && !isRagFunnel01Closed(status);
}

/**
 * Honest P-R1 remaining snapshot.
 * Uses empty env for default-flag check (must stay off).
 */
export function classifyPR1Remaining(
  env: NodeJS.ProcessEnv = {},
): PR1RemainingStatus {
  return {
    failClosedFlagDefaultOn: isTechRoleFailClosedEnabled(env),
    legacyDefaultLabel: LEGACY_TECH_ROLE_DEFAULT,
    contractHarnessExists: true,
    r1Closed: false,
  };
}

/** R1 closed only when default no longer legacy AND combo-root evidence — not this knife. */
export function isR1Closed(
  status: PR1RemainingStatus = classifyPR1Remaining(),
): boolean {
  return status.r1Closed === true && status.failClosedFlagDefaultOn === true;
}
