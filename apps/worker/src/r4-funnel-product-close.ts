/**
 * G-R4-5 / R4·FUNNEL product close — dedicated prove emitter
 * (r4ProductClosed / funnelProductClosed under standing authorize).
 *
 * Honest path:
 *   - Attempts product-close emission ONLY when matrix/FUNNEL covered evidence
 *     honestly supports flip (Ban invent coveredCount · Ban假关).
 *   - With coveredCount=0 and FUNNEL-02A…08 not_covered, refuses closed=true
 *     and records authorized honest non-flip (evidence insufficient).
 *   - Retains EG3 domainIsolationClosed/eg3ProductClosed · keeps gR45Closed=false.
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - ≠ invent coveredCount · ≠ wash EG3 7be1a55/5b3c854 · ≠ wash R1 9fec7c7/72233a0
 *   - ≠ wash FUNNEL rem/SSOT/EXPLICIT dual_pass into product closed · Ban MS3=R4.
 *   - releaseEvidence=false · ≠HA · ≠suite green · EG1/2/4/5/6 product not closed by this knife.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND =
  'R4FunnelProductCloseEvidence' as const;

export type R4FunnelProductCloseEvidence = {
  readonly kind: typeof R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND;
  /** Authorized attempt ran; product flags NOT flipped (evidence insufficient). */
  readonly productCloseAttemptedUnderAuthorize: true;
  readonly productCloseFlipped: false;
  readonly evidenceInsufficient: true;
  readonly coveredCount: 0;
  readonly coveredCountInvented: false;
  readonly funnel02Through08NotCovered: true;
  readonly matrixHonestyRetained: true;
  readonly eg3FlagsRetained: true;
  readonly authorizedSsotPinsPresent: true;
  readonly orthogonalNotClaimedClosed: true;
  /** This knife outcome under authorize — honest non-flip. */
  readonly r4ProductClosed: false;
  readonly funnelProductClosed: false;
  readonly gR45Closed: false;
  readonly domainIsolationClosed: true;
  readonly eg3ProductClosed: true;
  readonly eg1ThroughEg6ProductClosedByThisKnife: false;
  readonly ms3EqualsR4Closed: false;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / R4·FUNNEL product close — authorized attempt · evidence insufficient (coveredCount=0 · FUNNEL-02A…08 not_covered) · r4ProductClosed/funnelProductClosed NOT flipped · Ban invent coveredCount · Ban假关 · Ban wash EG3/R1/FUNNEL rem·SSOT·EXPLICIT · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

export type R4FunnelProductCloseClosedEvidence = {
  readonly kind: typeof R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseAttemptedUnderAuthorize: true;
  readonly productCloseFlipped: true;
  readonly evidenceInsufficient: false;
  readonly coveredCount: number;
  readonly coveredCountInvented: false;
  readonly r4ProductClosed: true;
  readonly funnelProductClosed: true;
  readonly gR45Closed: false;
  readonly releaseEvidence: false;
};

export type R4FunnelProductCloseFailure = {
  readonly kind: 'R4FunnelProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'evidence_insufficient_coveredCount_zero'
    | 'funnel_items_not_covered'
    | 'would_invent_coveredCount'
    | 'would_forge_r4_funnel_closed'
    | 'authorized_ssot_pins_missing'
    | 'eg3_flags_not_retained'
    | 'orthogonal_claimed_closed'
    | 'harness_flags_falsely_flipped';
};

export type R4FunnelProductCloseResult =
  | { readonly emitted: true; readonly evidence: R4FunnelProductCloseEvidence }
  | { readonly emitted: true; readonly evidence: R4FunnelProductCloseClosedEvidence }
  | R4FunnelProductCloseFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
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

/** Parse coveredCount from matrix markdown (honest · Ban invent). */
export function readMatrixCoveredCount(): number | null {
  const matrix = readRepo('ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
  const m = matrix.match(/\*\*coveredCount\*\*:\s*(\d+)/);
  if (!m) return null;
  return Number(m[1]);
}

export function funnel02Through08NotCovered(): boolean {
  const matrix = readRepo('ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
  const ids = ['02A', '02B', '03', '04', '05', '06', '07', '08'];
  return ids.every((id) =>
    new RegExp(`RAG-FUNNEL-${id}[\\s\\S]*?\\*\\*not_covered\\*\\*`).test(matrix),
  );
}

/**
 * Assess whether r4ProductClosed/funnelProductClosed can honestly flip.
 * Fail-closed: coveredCount must be reproducible non-zero from dedicated prove,
 * and FUNNEL-02A…08 must not remain not_covered. Ban invent.
 */
export function assessR4FunnelProductCloseFlipEligibility(): {
  coveredCount: number | null;
  coveredCountHonestZero: boolean;
  funnelGapsRemain: boolean;
  canHonestlyFlip: boolean;
  refuseReason:
    | null
    | 'evidence_insufficient_coveredCount_zero'
    | 'funnel_items_not_covered'
    | 'would_invent_coveredCount';
} {
  const coveredCount = readMatrixCoveredCount();
  const coveredCountHonestZero = coveredCount === 0;
  const funnelGapsRemain = funnel02Through08NotCovered();
  if (coveredCount === null) {
    return {
      coveredCount: null,
      coveredCountHonestZero: false,
      funnelGapsRemain,
      canHonestlyFlip: false,
      refuseReason: 'would_invent_coveredCount',
    };
  }
  if (coveredCount === 0) {
    return {
      coveredCount: 0,
      coveredCountHonestZero: true,
      funnelGapsRemain,
      canHonestlyFlip: false,
      refuseReason: 'evidence_insufficient_coveredCount_zero',
    };
  }
  if (funnelGapsRemain) {
    return {
      coveredCount,
      coveredCountHonestZero: false,
      funnelGapsRemain: true,
      canHonestlyFlip: false,
      refuseReason: 'funnel_items_not_covered',
    };
  }
  return {
    coveredCount,
    coveredCountHonestZero: false,
    funnelGapsRemain: false,
    canHonestlyFlip: true,
    refuseReason: null,
  };
}

export function assessR4FunnelProductCloseHonestyPins(): {
  eg3FlagsRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  orthogonalNotClaimedClosed: boolean;
  harnessFlagsNotFalselyFlipped: boolean;
  matrixHonestyRetained: boolean;
} {
  const harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-r4-funnel-product-close.md',
  );
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const matrix = readRepo('ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
  const eg3Receipt = readJson(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg3-domain-isolation-product-close-evidence.json',
  );

  const eg3FlagsRetained =
    /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && eg3Receipt?.domainIsolationClosed === true
    && eg3Receipt?.eg3ProductClosed === true;

  const authorizedSsotPinsPresent =
    /GAP-RAG-04/.test(gap + harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /evidence insufficient|honest(?:ly)? non-flip|NOT flipped|r4ProductClosed=false/.test(
      harness,
    )
    && /gR45Closed=false/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /Ban invent coveredCount|coveredCount.*0|≠ invent coveredCount/i.test(
      harness + matrix,
    )
    && /R4\/FUNNEL product STILL OPEN|r4ProductClosed=false|funnelProductClosed=false/i.test(
      harness + w0 + m4 + gap,
    );

  // Ban-text may mention "`r4ProductClosed=true`" as forbidden — strip backticks for check.
  const harnessBare = harness.replace(/`r4ProductClosed=true`/g, '').replace(
    /`funnelProductClosed=true`/g,
    '',
  );
  const orthogonalNotClaimedClosed =
    /gR45Closed=false/.test(harness)
    && !/\bgR45Closed=true\b/.test(harness.replace(/`gR45Closed=true`/g, ''))
    && !/\br4ProductClosed=true\b/.test(harnessBare)
    && !/\bfunnelProductClosed=true\b/.test(harnessBare)
    && /releaseEvidence=false/.test(harness)
    && /Ban invent coveredCount|coveredCount.*0/i.test(harness);

  const harnessFlagsNotFalselyFlipped =
    /r4ProductClosed=false/.test(harness)
    && /funnelProductClosed=false/.test(harness)
    && !/\*\*`?r4ProductClosed=true`?\*\*/.test(harness)
    && !/\*\*`?funnelProductClosed=true`?\*\*/.test(harness);

  const matrixHonestyRetained =
    /\*\*coveredCount\*\*:\s*0/.test(matrix)
    && /Ban invent covered/.test(matrix)
    && funnel02Through08NotCovered();

  return {
    eg3FlagsRetained,
    authorizedSsotPinsPresent,
    orthogonalNotClaimedClosed,
    harnessFlagsNotFalselyFlipped,
    matrixHonestyRetained,
  };
}

/**
 * Attempt to emit r4ProductClosed=true / funnelProductClosed=true.
 * Returns failure when evidence insufficient (expected today · Ban假关).
 */
export function attemptEmitR4FunnelProductCloseClosed(): R4FunnelProductCloseResult {
  const elig = assessR4FunnelProductCloseFlipEligibility();
  if (!elig.canHonestlyFlip) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: elig.refuseReason ?? 'evidence_insufficient_coveredCount_zero',
    };
  }
  // Reachable only when dedicated prove truly emits reproducible coveredCount > 0
  // and FUNNEL-02A…08 are no longer not_covered (not the case on this tip).
  return {
    emitted: true,
    evidence: {
      kind: R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND,
      productCloseAttemptedUnderAuthorize: true,
      productCloseFlipped: true,
      evidenceInsufficient: false,
      coveredCount: elig.coveredCount as number,
      coveredCountInvented: false,
      r4ProductClosed: true,
      funnelProductClosed: true,
      gR45Closed: false,
      releaseEvidence: false,
    },
  };
}

/**
 * Emit authorized honest non-flip receipt when closed emission is correctly refused.
 */
export function emitR4FunnelProductCloseHonestNonFlip(): R4FunnelProductCloseResult {
  const elig = assessR4FunnelProductCloseFlipEligibility();
  const pins = assessR4FunnelProductCloseHonestyPins();

  if (elig.canHonestlyFlip) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_forge_r4_funnel_closed',
    };
  }
  if (!pins.matrixHonestyRetained || elig.coveredCount !== 0) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_invent_coveredCount',
    };
  }
  if (!pins.eg3FlagsRetained) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: 'eg3_flags_not_retained',
    };
  }
  if (!pins.authorizedSsotPinsPresent) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: 'authorized_ssot_pins_missing',
    };
  }
  if (!pins.orthogonalNotClaimedClosed) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: 'orthogonal_claimed_closed',
    };
  }
  if (!pins.harnessFlagsNotFalselyFlipped) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: 'harness_flags_falsely_flipped',
    };
  }

  const evidence: R4FunnelProductCloseEvidence = {
    kind: R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseAttemptedUnderAuthorize: true,
    productCloseFlipped: false,
    evidenceInsufficient: true,
    coveredCount: 0,
    coveredCountInvented: false,
    funnel02Through08NotCovered: true,
    matrixHonestyRetained: true,
    eg3FlagsRetained: true,
    authorizedSsotPinsPresent: true,
    orthogonalNotClaimedClosed: true,
    r4ProductClosed: false,
    funnelProductClosed: false,
    gR45Closed: false,
    domainIsolationClosed: true,
    eg3ProductClosed: true,
    eg1ThroughEg6ProductClosedByThisKnife: false,
    ms3EqualsR4Closed: false,
    releaseEvidence: false,
    note: 'G-R4-5 / R4·FUNNEL product close — authorized attempt · evidence insufficient (coveredCount=0 · FUNNEL-02A…08 not_covered) · r4ProductClosed/funnelProductClosed NOT flipped · Ban invent coveredCount · Ban假关 · Ban wash EG3/R1/FUNNEL rem·SSOT·EXPLICIT · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export function hasR4FunnelProductCloseHonestNonFlipEvidence(): boolean {
  const r = emitR4FunnelProductCloseHonestNonFlip();
  return r.emitted === true && r.evidence.productCloseFlipped === false;
}

export const R4_FUNNEL_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
