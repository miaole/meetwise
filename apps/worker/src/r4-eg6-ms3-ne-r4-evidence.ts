/**
 * G-R4-5 EG6 — MS3≠R4 pin retention / deferred-as-product **honesty** evidence emitter.
 *
 * Honest path (Ban forge · Ban claiming R4 closed from MS3 · Ban claim EG6/MS3=R4/R4 closed
 * from EG1–EG5 evidence / meta prove alone):
 *   - Assesses that EG1–EG5 true-evidence receipts exist (prior evidence inventory).
 *   - Assesses real docs/harness surfaces that MS3≠R4 pin language is retained
 *     and Ban claiming R4 closed from MS3 is retained (authorize framing ≠ close).
 *   - Requires harness honesty pins that EG6 / MS3=R4 / G-R4-5 / R4 / 题域 remain NOT closed.
 *   - Explicitly records that EG1–EG5 evidence / meta prove alone ≠ EG6 / R4 product close.
 *
 * HARD:
 *   - Evidence emit ≠ EG6 closed · ≠ MS3=R4 closed · ≠ R4 closed from MS3 · ≠ product SSOT flipped
 *     · ≠ G-R4-5 / R4/FUNNEL / 题域 closed.
 *   - Ban forge · Ban invent coveredCount · Ban claim closed from EXIT=0 · releaseEvidence=false · ≠HA.
 *   - Ban idle re-prove of EG1/EG2/EG3/EG4/EG5 CMDs / same 5×meta as fake EG6 close — this module is the
 *     EG6-specific MS3≠R4 pin retention honesty evidence path those CMDs never emitted.
 *   - Assessor MUST FAIL if harness/docs would claim MS3 closes R4 / eg6ProductClosed / ms3EqualsR4Closed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Canonical EG6 MS3≠R4 pin retention honesty evidence kind. */
export const EG6_MS3_NE_R4_EVIDENCE_KIND =
  'Ms3NeR4PinRetentionEvidence' as const;

/**
 * Honest MS3≠R4 pin retention / deferred-as-product honesty evidence inventory.
 * Does NOT elevate EG6 / MS3=R4 / G-R4-5 / R4 / 题域 to closed.
 */
export type Ms3NeR4PinRetentionEvidence = {
  readonly kind: typeof EG6_MS3_NE_R4_EVIDENCE_KIND;
  /** MS3≠R4 pin retention honesty inventory emitted (≠ EG6/MS3=R4/R4 close). */
  readonly ms3NeR4PinRetentionEvidence: true;
  readonly eg1ThroughEg5EvidencePresent: true;
  readonly ms3NeR4PinLanguageRetained: true;
  readonly banClaimR4ClosedFromMs3Retained: true;
  readonly eg6HarnessPinsStillOpen: true;
  readonly statusPinsProductNotClosed: true;
  readonly priorEgEvidenceAloneDoesNotClose: true;
  readonly metaProveAloneDoesNotClose: true;
  /** Explicit non-claims retained on the receipt itself. */
  readonly eg6ProductClosed: false;
  readonly ms3EqualsR4Closed: false;
  readonly productSsotFlipped: false;
  readonly gR45Closed: false;
  readonly r4ProductClosed: false;
  readonly domainIsolationClosed: false;
  readonly releaseEvidence: false;
  readonly note: 'EG6 MS3≠R4 pin retention honesty evidence — emitted · ≠ EG6/MS3=R4/R4/G-R4-5/题域 closed · Ban forge · Ban claim R4 closed from MS3 · Ban claim from EG1–EG5 / meta prove alone · await post-prove dual';
};

export type Eg6Ms3NeR4EvidenceFailure = {
  readonly kind: 'Eg6Ms3NeR4EvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'eg1_through_eg5_evidence_missing'
    | 'ms3_ne_r4_pin_language_missing_or_forged_closed'
    | 'eg6_harness_missing_still_open_pin'
    | 'status_missing_not_closed_pin'
    | 'would_forge_product_closed';
};

export type Eg6Ms3NeR4EvidenceResult =
  | { readonly emitted: true; readonly evidence: Ms3NeR4PinRetentionEvidence }
  | Eg6Ms3NeR4EvidenceFailure;

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
 * Assess whether honest EG6 MS3≠R4 pin retention honesty evidence can be emitted.
 * Fail-closed: every prior-evidence + pin-retention + honesty-pin check must pass (Ban forge).
 * Assessor MUST FAIL if harness/docs would claim MS3 closes R4 / EG6 closed / ms3EqualsR4Closed.
 */
export function assessMs3NeR4PinRetentionEvidence(): {
  eg1ThroughEg5EvidencePresent: boolean;
  ms3NeR4PinLanguageRetained: boolean;
  banClaimR4ClosedFromMs3Retained: boolean;
  eg6HarnessPinsStillOpen: boolean;
  statusPinsProductNotClosed: boolean;
  priorEgEvidenceAloneDoesNotClose: boolean;
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
  const eg5 = readJson(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg5-product-ssot-evidence.json',
  );

  const eg6Harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg6-true-evidence-impl.md',
  );
  const status = readRepo(
    'ai-docs/delivery/harness/r4-domain-isolation-status.md',
  );
  const l4Harness = readRepo(
    'ai-docs/delivery/harness/r4-funnel-explicit-close-ssot-flip.md',
  );
  const eg5Harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg5-true-evidence-impl.md',
  );

  const eg1ThroughEg5EvidencePresent =
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
    && eg4.releaseEvidence === false
    && eg5 != null
    && eg5.eg5ProductClosed === false
    && eg5.productSsotFlipped === false
    && eg5.releaseEvidence === false;

  // Ban claiming R4 closed from MS3: FAIL only on affirmative closed claims.
  // Honest pins use "≠ MS3=R4 closed" / "Ban claiming R4 closed from MS3" — those must PASS.
  const eg6ClaimsMs3EqualsR4OrClosed =
    /eg6ProductClosed\s*=\s*true/.test(eg6Harness)
    || /ms3EqualsR4Closed\s*=\s*true/.test(eg6Harness)
    || /EG6\s+CLOSED/.test(eg6Harness) && !/EG6 STILL OPEN/.test(eg6Harness)
    || /MS3\s*=\s*R4\s+closed\s*[·.]/.test(eg6Harness) // affirmative trailing claim
      && !/≠\s*MS3\s*=\s*R4\s+closed/.test(eg6Harness)
    || /productSsotFlipped\s*=\s*true/.test(eg6Harness);

  // Positive MS3≠R4 retention language must exist (harness + status/L4).
  const ms3NeR4PinLanguageRetained =
    !eg6ClaimsMs3EqualsR4OrClosed
    && /MS3 ≠ R4 closed|MS3≠R4|MS3\s*≠\s*R4/.test(eg6Harness)
    && (/MS3 ≠ R4 closed|MS3\s*≠\s*R4/.test(status)
      || /MS3 ≠ R4 closed|MS3\s*≠\s*R4/.test(l4Harness));

  const banClaimR4ClosedFromMs3Retained =
    /Ban claim(ing)? R4 closed from MS3|Ban claiming R4 closed from MS3/.test(
      eg6Harness,
    )
    && /ms3EqualsR4Closed=false/.test(eg6Harness)
    && /eg6ProductClosed=false/.test(eg6Harness);

  const eg6HarnessPinsStillOpen =
    /EG6 STILL OPEN/.test(eg6Harness)
    && /G-R4-5 STILL OPEN/.test(eg6Harness)
    && /Ban claim(ing)? R4 closed from MS3/.test(eg6Harness)
    && /eg6ProductClosed=false/.test(eg6Harness)
    && /ms3EqualsR4Closed=false/.test(eg6Harness)
    && /productSsotFlipped=false/.test(eg6Harness)
    && /releaseEvidence=false/.test(eg6Harness)
    && /Ban forge/.test(eg6Harness)
    && /Ban idle re-prove of EG1\/EG2\/EG3\/EG4\/EG5 CMDs/.test(eg6Harness);

  const statusPinsProductNotClosed =
    (/G-R4-5 STILL OPEN|题域隔离 NOT closed|题域 STILL OPEN/.test(status)
      || /G-R4-5\/FUNNEL dual-claim STILL OPEN/.test(status))
    && /EG6 STILL OPEN/.test(eg6Harness)
    && /releaseEvidence=false/.test(eg6Harness)
    && (/EG5 STILL OPEN/.test(eg5Harness) || /eg5ProductClosed=false/.test(eg5Harness))
    && /MS3 ≠ R4 closed|MS3\s*≠\s*R4/.test(eg6Harness);

  // EG1–EG5 evidence alone ≠ EG6 / MS3=R4 / R4 product close.
  const priorEgEvidenceAloneDoesNotClose =
    /Ban idle re-prove of EG1\/EG2\/EG3\/EG4\/EG5 CMDs|Ban idle re-prove EG1\/EG2\/EG3\/EG4\/EG5/.test(
      eg6Harness,
    )
    && /Ban claim(ing)? R4 closed from MS3|Ban假关/.test(eg6Harness)
    && (/EXIT=0 = evidence emitted ≠ EG6|evidence emitted ≠ EG6 closed|EXIT=0 ≠ .*EG6/.test(
      eg6Harness,
    )
      || /≠ EG6\/MS3=R4\/R4 closed|≠ EG6 closed ≠ MS3=R4 closed/.test(eg6Harness));

  // Meta prove is honesty/doc pin only — product evidence path documents that ceiling.
  const metaProveAloneDoesNotClose =
    (/mysql-stack:r4-domain-isolation:prove|r4-p-meta-ms3-deploy-product:prove|5×meta/.test(
      eg6Harness,
    )
      && /≠ EG6 close|Ban idle re-run of the same 5×meta|Ban claim closed from EXIT=0|Ban claim(ing)? R4 closed from MS3/.test(
        eg6Harness,
      ))
    || /Ban idle re-run of the same 5×meta prove as fake close/.test(eg6Harness);

  return {
    eg1ThroughEg5EvidencePresent,
    ms3NeR4PinLanguageRetained,
    banClaimR4ClosedFromMs3Retained,
    eg6HarnessPinsStillOpen,
    statusPinsProductNotClosed,
    priorEgEvidenceAloneDoesNotClose,
    metaProveAloneDoesNotClose,
  };
}

/** True only when every prior-evidence + pin-retention + honesty-pin check passes (Ban forge hardcode). */
export function hasMs3NeR4PinRetentionEvidence(): boolean {
  const a = assessMs3NeR4PinRetentionEvidence();
  return (
    a.eg1ThroughEg5EvidencePresent
    && a.ms3NeR4PinLanguageRetained
    && a.banClaimR4ClosedFromMs3Retained
    && a.eg6HarnessPinsStillOpen
    && a.statusPinsProductNotClosed
    && a.priorEgEvidenceAloneDoesNotClose
    && a.metaProveAloneDoesNotClose
  );
}

/**
 * Emit honest EG6 MS3≠R4 pin retention honesty evidence.
 * Fail-closed: refuse to emit if any required check is false (Ban forge · Ban claim R4 from MS3).
 * Classifier product-closed / ms3EqualsR4 flags stay false (there is no product close).
 */
export function emitMs3NeR4PinRetentionEvidence(): Eg6Ms3NeR4EvidenceResult {
  const a = assessMs3NeR4PinRetentionEvidence();
  if (!a.eg1ThroughEg5EvidencePresent) {
    return {
      kind: 'Eg6Ms3NeR4EvidenceFailure',
      emitted: false,
      reason: 'eg1_through_eg5_evidence_missing',
    };
  }
  if (!a.ms3NeR4PinLanguageRetained || !a.banClaimR4ClosedFromMs3Retained) {
    return {
      kind: 'Eg6Ms3NeR4EvidenceFailure',
      emitted: false,
      reason: 'ms3_ne_r4_pin_language_missing_or_forged_closed',
    };
  }
  if (!a.eg6HarnessPinsStillOpen) {
    return {
      kind: 'Eg6Ms3NeR4EvidenceFailure',
      emitted: false,
      reason: 'eg6_harness_missing_still_open_pin',
    };
  }
  if (!a.statusPinsProductNotClosed) {
    return {
      kind: 'Eg6Ms3NeR4EvidenceFailure',
      emitted: false,
      reason: 'status_missing_not_closed_pin',
    };
  }
  if (
    !a.priorEgEvidenceAloneDoesNotClose
    || !a.metaProveAloneDoesNotClose
  ) {
    return {
      kind: 'Eg6Ms3NeR4EvidenceFailure',
      emitted: false,
      reason: 'would_forge_product_closed',
    };
  }

  const evidence: Ms3NeR4PinRetentionEvidence = {
    kind: EG6_MS3_NE_R4_EVIDENCE_KIND,
    ms3NeR4PinRetentionEvidence: true,
    eg1ThroughEg5EvidencePresent: true,
    ms3NeR4PinLanguageRetained: true,
    banClaimR4ClosedFromMs3Retained: true,
    eg6HarnessPinsStillOpen: true,
    statusPinsProductNotClosed: true,
    priorEgEvidenceAloneDoesNotClose: true,
    metaProveAloneDoesNotClose: true,
    eg6ProductClosed: false,
    ms3EqualsR4Closed: false,
    productSsotFlipped: false,
    gR45Closed: false,
    r4ProductClosed: false,
    domainIsolationClosed: false,
    releaseEvidence: false,
    note: 'EG6 MS3≠R4 pin retention honesty evidence — emitted · ≠ EG6/MS3=R4/R4/G-R4-5/题域 closed · Ban forge · Ban claim R4 closed from MS3 · Ban claim from EG1–EG5 / meta prove alone · await post-prove dual',
  };
  return { emitted: true, evidence };
}

/** Marker: this module is the EG6 MS3≠R4 pin retention evidence emitter (≠ EG1–EG5 / 5×meta prove). */
export const EG6_MS3_NE_R4_EVIDENCE_EMITTER_WIRED = true as const;
