/**
 * G-R4-5 EG5 — product SSOT flip **authorize framing / honesty** evidence emitter.
 *
 * Honest path (Ban forge · Ban silent product SSOT flip · Ban claim EG5/product closed
 * from EG1–EG4 evidence / meta prove alone):
 *   - Assesses that EG1–EG4 true-evidence receipts exist (prior evidence inventory).
 *   - Assesses real docs/harness surfaces that product SSOT is still NOT flipped
 *     and EG5 / G-R4-5 / R4 / 题域 remain STILL OPEN (authorize framing ≠ flip).
 *   - Requires harness honesty pins that EG5 / product SSOT / G-R4-5 / R4 remain NOT closed.
 *   - Explicitly records that EG1–EG4 evidence / meta prove alone ≠ product SSOT flip authorize close.
 *
 * HARD:
 *   - Evidence emit ≠ EG5 closed · ≠ product SSOT flipped · ≠ G-R4-5 / R4/FUNNEL / 题域 closed.
 *   - Ban forge · Ban invent coveredCount · Ban claim closed from EXIT=0 · releaseEvidence=false · ≠HA.
 *   - Ban idle re-prove of EG1/EG2/EG3/EG4 CMDs / same 5×meta as fake EG5 close — this module is the
 *     EG5-specific product SSOT flip authorize honesty evidence path those CMDs never emitted.
 *   - Ban silent product SSOT flip — assessor MUST FAIL if harness/docs would claim flipped/closed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Canonical EG5 product SSOT flip authorize honesty evidence kind. */
export const EG5_PRODUCT_SSOT_EVIDENCE_KIND =
  'ProductSsotAuthorizeEvidence' as const;

/**
 * Honest product-SSOT flip authorize framing / honesty evidence inventory.
 * Does NOT elevate EG5 / product SSOT / G-R4-5 / R4 / 题域 to closed or flipped.
 */
export type ProductSsotAuthorizeEvidence = {
  readonly kind: typeof EG5_PRODUCT_SSOT_EVIDENCE_KIND;
  /** Authorize-framing honesty inventory emitted (≠ product close / ≠ SSOT flip). */
  readonly productSsotAuthorizeEvidence: true;
  readonly eg1ThroughEg4EvidencePresent: true;
  readonly productSsotSurfacesNotFlipped: true;
  readonly eg5HarnessPinsStillOpen: true;
  readonly statusPinsProductNotClosed: true;
  readonly priorEgEvidenceAloneDoesNotAuthorizeFlip: true;
  readonly metaProveAloneDoesNotClose: true;
  /** Explicit non-claims retained on the receipt itself. */
  readonly eg5ProductClosed: false;
  readonly productSsotFlipped: false;
  readonly gR45Closed: false;
  readonly r4ProductClosed: false;
  readonly domainIsolationClosed: false;
  readonly releaseEvidence: false;
  readonly note: 'EG5 product SSOT flip authorize honesty evidence — emitted · ≠ EG5/product SSOT flipped/G-R4-5/R4/题域 closed · Ban forge · Ban silent flip · Ban claim from EG1–EG4 / meta prove alone · await post-prove dual';
};

export type Eg5ProductSsotEvidenceFailure = {
  readonly kind: 'Eg5ProductSsotEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'eg1_through_eg4_evidence_missing'
    | 'product_ssot_surfaces_flipped_or_closed'
    | 'eg5_harness_missing_still_open_pin'
    | 'status_missing_not_closed_pin'
    | 'would_forge_product_closed';
};

export type Eg5ProductSsotEvidenceResult =
  | { readonly emitted: true; readonly evidence: ProductSsotAuthorizeEvidence }
  | Eg5ProductSsotEvidenceFailure;

function workerSrcDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)));
}

function repoRoot(): string {
  return join(workerSrcDir(), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function readJson(rel: string): Record<string, unknown> | null {
  const p = join(repoRoot(), rel);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Assess whether honest EG5 product SSOT flip authorize honesty evidence can be emitted.
 * Fail-closed: every prior-evidence + not-flipped + honesty-pin check must pass (Ban forge).
 * Assessor MUST FAIL if harness/docs would claim product SSOT flipped / EG5 closed.
 */
export function assessProductSsotAuthorizeEvidence(): {
  eg1ThroughEg4EvidencePresent: boolean;
  productSsotSurfacesNotFlipped: boolean;
  eg5HarnessPinsStillOpen: boolean;
  statusPinsProductNotClosed: boolean;
  priorEgEvidenceAloneDoesNotAuthorizeFlip: boolean;
  metaProveAloneDoesNotClose: boolean;
} {
  const eg1 = readJson(
    'ai-docs/delivery/receipts/2026-09-17-g-r4-5-eg1-dual-claim-evidence.json',
  );
  const eg2 = readJson(
    'ai-docs/delivery/receipts/2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json',
  );
  const eg3 = readJson(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg3-domain-isolation-product-evidence.json',
  );
  const eg4 = readJson(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg4-wrong-track-product-evidence.json',
  );

  const eg5Harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg5-true-evidence-impl.md',
  );
  const status = readRepo(
    'ai-docs/delivery/harness/r4-domain-isolation-status.md',
  );
  const l4Harness = readRepo(
    'ai-docs/delivery/harness/r4-funnel-explicit-close-ssot-flip.md',
  );
  const eg4Harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg4-true-evidence-impl.md',
  );

  const eg1ThroughEg4EvidencePresent =
    eg1 != null
    && eg1.gR45DualClaimClosed === false
    && eg1.releaseEvidence === false
    && eg2 != null
    && eg2.coveredCount === 0
    && eg2.releaseEvidence === false
    && eg3 != null
    && eg3.eg3ProductClosed === false
    && eg3.domainIsolationClosed === false
    && eg3.releaseEvidence === false
    && eg4 != null
    && eg4.eg4ProductClosed === false
    && eg4.wrongTrackProductClosed === false
    && eg4.releaseEvidence === false;

  // Ban silent flip: product SSOT surfaces must still say NOT flipped / STILL OPEN.
  // Fail if EG5 harness would claim eg5ProductClosed / productSsotFlipped true.
  const eg5ClaimsFlippedOrClosed =
    /eg5ProductClosed\s*=\s*true/.test(eg5Harness)
    || /productSsotFlipped\s*=\s*true/.test(eg5Harness)
    || /EG5\s+(product\s+)?CLOSED/.test(eg5Harness) && !/EG5 STILL OPEN/.test(eg5Harness);

  const productSsotSurfacesNotFlipped =
    !eg5ClaimsFlippedOrClosed
    && /product SSOT\s+\*\*NOT\*\*\s+flipped|product SSOT NOT flipped|productSsotFlipped=false/.test(
      eg5Harness,
    )
    && (/product SSOT NOT flipped|product targets remain \*\*NOT flipped\*\*|Product SSOT flip this nail\?\*\* \| \*\*NO\*\*/.test(
      l4Harness,
    )
      || /product SSOT NOT flipped|SSOT NOT flipped/.test(l4Harness))
    && (/G-R4-5 STILL OPEN|题域隔离 NOT closed|题域 STILL OPEN/.test(status)
      || /G-R4-5\/FUNNEL dual-claim STILL OPEN/.test(status));

  const eg5HarnessPinsStillOpen =
    /EG5 STILL OPEN/.test(eg5Harness)
    && /G-R4-5 STILL OPEN/.test(eg5Harness)
    && /Ban silent (product )?SSOT flip|Ban silent flip/.test(eg5Harness)
    && /eg5ProductClosed=false/.test(eg5Harness)
    && /productSsotFlipped=false/.test(eg5Harness)
    && /releaseEvidence=false/.test(eg5Harness)
    && /Ban forge/.test(eg5Harness)
    && /Ban idle re-prove of EG1\/EG2\/EG3\/EG4 CMDs/.test(eg5Harness);

  const statusPinsProductNotClosed =
    (/G-R4-5 STILL OPEN|题域隔离 NOT closed|题域 STILL OPEN/.test(status)
      || /G-R4-5\/FUNNEL dual-claim STILL OPEN/.test(status))
    && /EG5 STILL OPEN/.test(eg5Harness)
    && /releaseEvidence=false/.test(eg5Harness)
    && (/EG4 STILL OPEN/.test(eg4Harness) || /eg4ProductClosed=false/.test(eg4Harness));

  // EG1–EG4 evidence alone ≠ EG5 / product SSOT flip authorize close.
  const priorEgEvidenceAloneDoesNotAuthorizeFlip =
    /Ban idle re-prove of EG1\/EG2\/EG3\/EG4 CMDs|Ban idle re-prove EG1\/EG2\/EG3\/EG4/.test(
      eg5Harness,
    )
    && /Ban silent (product )?SSOT flip|Ban silent flip|Ban假关/.test(eg5Harness)
    && (/EXIT=0 = evidence emitted ≠ EG5\/product closed|evidence emitted ≠ EG5 closed ≠ product SSOT flipped/.test(
      eg5Harness,
    )
      || /EXIT=0 ≠ authorize|≠ EG5\/product closed/.test(eg5Harness));

  // Meta prove is honesty/doc pin only — product evidence path documents that ceiling.
  const metaProveAloneDoesNotClose =
    (/mysql-stack:r4-domain-isolation:prove|r4-p-meta-ms3-deploy-product:prove|5×meta/.test(
      eg5Harness,
    )
      && /≠ EG5 close|Ban idle re-run of the same 5×meta|Ban claim closed from EXIT=0/.test(
        eg5Harness,
      ))
    || /Ban idle re-run of the same 5×meta prove as fake close/.test(eg5Harness);

  return {
    eg1ThroughEg4EvidencePresent,
    productSsotSurfacesNotFlipped,
    eg5HarnessPinsStillOpen,
    statusPinsProductNotClosed,
    priorEgEvidenceAloneDoesNotAuthorizeFlip,
    metaProveAloneDoesNotClose,
  };
}

/** True only when every prior-evidence + not-flipped + honesty-pin check passes (Ban forge hardcode). */
export function hasProductSsotAuthorizeEvidence(): boolean {
  const a = assessProductSsotAuthorizeEvidence();
  return (
    a.eg1ThroughEg4EvidencePresent
    && a.productSsotSurfacesNotFlipped
    && a.eg5HarnessPinsStillOpen
    && a.statusPinsProductNotClosed
    && a.priorEgEvidenceAloneDoesNotAuthorizeFlip
    && a.metaProveAloneDoesNotClose
  );
}

/**
 * Emit honest EG5 product SSOT flip authorize honesty evidence.
 * Fail-closed: refuse to emit if any required check is false (Ban forge · Ban silent flip).
 * Classifier product-closed / flipped flags stay false (there is no product close / flip).
 */
export function emitProductSsotAuthorizeEvidence(): Eg5ProductSsotEvidenceResult {
  const a = assessProductSsotAuthorizeEvidence();
  if (!a.eg1ThroughEg4EvidencePresent) {
    return {
      kind: 'Eg5ProductSsotEvidenceFailure',
      emitted: false,
      reason: 'eg1_through_eg4_evidence_missing',
    };
  }
  if (!a.productSsotSurfacesNotFlipped) {
    return {
      kind: 'Eg5ProductSsotEvidenceFailure',
      emitted: false,
      reason: 'product_ssot_surfaces_flipped_or_closed',
    };
  }
  if (!a.eg5HarnessPinsStillOpen) {
    return {
      kind: 'Eg5ProductSsotEvidenceFailure',
      emitted: false,
      reason: 'eg5_harness_missing_still_open_pin',
    };
  }
  if (!a.statusPinsProductNotClosed) {
    return {
      kind: 'Eg5ProductSsotEvidenceFailure',
      emitted: false,
      reason: 'status_missing_not_closed_pin',
    };
  }
  if (
    !a.priorEgEvidenceAloneDoesNotAuthorizeFlip
    || !a.metaProveAloneDoesNotClose
  ) {
    return {
      kind: 'Eg5ProductSsotEvidenceFailure',
      emitted: false,
      reason: 'would_forge_product_closed',
    };
  }

  const evidence: ProductSsotAuthorizeEvidence = {
    kind: EG5_PRODUCT_SSOT_EVIDENCE_KIND,
    productSsotAuthorizeEvidence: true,
    eg1ThroughEg4EvidencePresent: true,
    productSsotSurfacesNotFlipped: true,
    eg5HarnessPinsStillOpen: true,
    statusPinsProductNotClosed: true,
    priorEgEvidenceAloneDoesNotAuthorizeFlip: true,
    metaProveAloneDoesNotClose: true,
    eg5ProductClosed: false,
    productSsotFlipped: false,
    gR45Closed: false,
    r4ProductClosed: false,
    domainIsolationClosed: false,
    releaseEvidence: false,
    note: 'EG5 product SSOT flip authorize honesty evidence — emitted · ≠ EG5/product SSOT flipped/G-R4-5/R4/题域 closed · Ban forge · Ban silent flip · Ban claim from EG1–EG4 / meta prove alone · await post-prove dual',
  };
  return { emitted: true, evidence };
}

/** Marker: this module is the EG5 product SSOT authorize evidence emitter (≠ EG1–EG4 / 5×meta prove). */
export const EG5_PRODUCT_SSOT_EVIDENCE_EMITTER_WIRED = true as const;
