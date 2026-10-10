/**
 * G-R4-5 / R4·FUNNEL product close — dedicated prove emitter
 * (r4ProductClosed / funnelProductClosed under standing authorize).
 *
 * Reassess path (post Batch4b coveredCount=8 · tip REQUEST dc4180d):
 *   - Flip eligibility reads live matrix coveredCount=8 + FUNNEL-02A…08 covered.
 *   - If canHonestlyFlip → emit closed evidence (r4ProductClosed/funnelProductClosed=true).
 *   - gR45Closed remains false (default do NOT auto-flip).
 *   - ARCHIVE prior non-flip (da185d9/139dac9/1c2ed8c · coveredCount was 0) · Ban wash.
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - ≠ invent coveredCount · ≠ wash Batch4b f802f02/0e58386 · ≠ wash EG3 7be1a55/5b3c854
 *   - ≠ wash R1 9fec7c7/72233a0 · ≠ wash FUNNEL rem/SSOT/EXPLICIT · Ban MS3=R4.
 *   - releaseEvidence=false · ≠HA · ≠suite green · EG1/2/4/5/6 product not closed by this knife.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND =
  'R4FunnelProductCloseEvidence' as const;

const FUNNEL_IDS = ['02A', '02B', '03', '04', '05', '06', '07', '08'] as const;

/** Honest non-flip evidence (ARCHIVE path · coveredCount=0). */
export type R4FunnelProductCloseEvidence = {
  readonly kind: typeof R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND;
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
  readonly r4ProductClosed: false;
  readonly funnelProductClosed: false;
  readonly gR45Closed: false;
  readonly domainIsolationClosed: true;
  readonly eg3ProductClosed: true;
  readonly eg1ThroughEg6ProductClosedByThisKnife: false;
  readonly ms3EqualsR4Closed: false;
  readonly releaseEvidence: false;
  readonly note: string;
};

/** Honest flip evidence (reassess · coveredCount=8 · 02A…08 covered). */
export type R4FunnelProductCloseClosedEvidence = {
  readonly kind: typeof R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseAttemptedUnderAuthorize: true;
  readonly productCloseFlipped: true;
  readonly evidenceInsufficient: false;
  readonly coveredCount: 8;
  readonly coveredCountInvented: false;
  readonly funnel02Through08AllCovered: true;
  readonly matrixHonestyRetained: true;
  readonly eg3FlagsRetained: true;
  readonly authorizedSsotPinsPresent: true;
  readonly r4ProductClosed: true;
  readonly funnelProductClosed: true;
  readonly gR45Closed: false;
  readonly domainIsolationClosed: true;
  readonly eg3ProductClosed: true;
  readonly eg1ThroughEg6ProductClosedByThisKnife: false;
  readonly ms3EqualsR4Closed: false;
  readonly releaseEvidence: false;
  readonly archivePriorNonFlipRetained: true;
  readonly note: string;
};

export type R4FunnelProductCloseFailure = {
  readonly kind: 'R4FunnelProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'evidence_insufficient_coveredCount_zero'
    | 'evidence_insufficient_coveredCount_below_8'
    | 'funnel_items_not_covered'
    | 'would_invent_coveredCount'
    | 'would_forge_r4_funnel_closed'
    | 'authorized_ssot_pins_missing'
    | 'eg3_flags_not_retained'
    | 'orthogonal_claimed_closed'
    | 'harness_flags_mismatch'
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

/** Canonical reassess harness (this knife). ARCHIVE harness retained separately. */
function reassessHarness(): string {
  return readRepo(
    'ai-docs/delivery/harness/g-r4-5-r4-funnel-product-close-reassess.md',
  );
}

/** Parse coveredCount from matrix markdown (honest · Ban invent). */
export function readMatrixCoveredCount(): number | null {
  const matrix = readRepo('ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
  const m = matrix.match(/\*\*coveredCount\*\*:\s*(\d+)/);
  if (!m) return null;
  return Number(m[1]);
}

export function funnelItemStatus(
  id: (typeof FUNNEL_IDS)[number],
): 'covered' | 'not_covered' | null {
  const matrix = readRepo('ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
  const m = matrix.match(
    new RegExp(`\\| \\\`RAG-FUNNEL-${id}\\\` \\| \\*\\*(covered|not_covered)\\*\\*`),
  );
  return m ? (m[1] as 'covered' | 'not_covered') : null;
}

export function funnel02Through08NotCovered(): boolean {
  return FUNNEL_IDS.every((id) => funnelItemStatus(id) === 'not_covered');
}

export function funnel02Through08AllCovered(): boolean {
  return FUNNEL_IDS.every((id) => funnelItemStatus(id) === 'covered');
}

/**
 * Assess whether r4ProductClosed/funnelProductClosed can honestly flip.
 * Reassess: require coveredCount===8 + FUNNEL-02A…08 all covered. Ban invent.
 */
export function assessR4FunnelProductCloseFlipEligibility(): {
  coveredCount: number | null;
  coveredCountHonestZero: boolean;
  funnelGapsRemain: boolean;
  funnelAllCovered: boolean;
  canHonestlyFlip: boolean;
  refuseReason:
    | null
    | 'evidence_insufficient_coveredCount_zero'
    | 'evidence_insufficient_coveredCount_below_8'
    | 'funnel_items_not_covered'
    | 'would_invent_coveredCount';
} {
  const coveredCount = readMatrixCoveredCount();
  const coveredCountHonestZero = coveredCount === 0;
  const funnelAllCovered = funnel02Through08AllCovered();
  const funnelGapsRemain = !funnelAllCovered;
  if (coveredCount === null) {
    return {
      coveredCount: null,
      coveredCountHonestZero: false,
      funnelGapsRemain,
      funnelAllCovered,
      canHonestlyFlip: false,
      refuseReason: 'would_invent_coveredCount',
    };
  }
  if (coveredCount === 0) {
    return {
      coveredCount: 0,
      coveredCountHonestZero: true,
      funnelGapsRemain,
      funnelAllCovered,
      canHonestlyFlip: false,
      refuseReason: 'evidence_insufficient_coveredCount_zero',
    };
  }
  if (!funnelAllCovered) {
    return {
      coveredCount,
      coveredCountHonestZero: false,
      funnelGapsRemain: true,
      funnelAllCovered: false,
      canHonestlyFlip: false,
      refuseReason: 'funnel_items_not_covered',
    };
  }
  if (coveredCount !== 8) {
    return {
      coveredCount,
      coveredCountHonestZero: false,
      funnelGapsRemain: false,
      funnelAllCovered: true,
      canHonestlyFlip: false,
      refuseReason: 'evidence_insufficient_coveredCount_below_8',
    };
  }
  return {
    coveredCount: 8,
    coveredCountHonestZero: false,
    funnelGapsRemain: false,
    funnelAllCovered: true,
    canHonestlyFlip: true,
    refuseReason: null,
  };
}

export function assessR4FunnelProductCloseHonestyPins(opts?: {
  expectFlipped?: boolean;
}): {
  eg3FlagsRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  orthogonalNotClaimedClosed: boolean;
  harnessFlagsMatchOutcome: boolean;
  matrixHonestyRetained: boolean;
  archivePriorNonFlipRetained: boolean;
} {
  const expectFlipped = opts?.expectFlipped === true;
  const harness = reassessHarness();
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const matrix = readRepo('ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
  const eg3Receipt = readJson(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg3-domain-isolation-product-close-evidence.json',
  );
  const archiveHarness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-r4-funnel-product-close.md',
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
    && /gR45Closed=false/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /Ban invent coveredCount|coveredCount.*8|≠ invent coveredCount/i.test(
      harness + matrix,
    )
    && /Ban MS3=R4|MS3 ≠ R4|ms3EqualsR4Closed=false/i.test(harness + w0 + m4 + gap)
    && /Ban wash Batch4b|f802f02|0e58386/.test(harness);

  const orthogonalNotClaimedClosed =
    /gR45Closed=false/.test(harness)
    && !/\bgR45Closed=true\b/.test(harness.replace(/`gR45Closed=true`/g, ''))
    && /releaseEvidence=false/.test(harness)
    && /Ban invent coveredCount|coveredCount.*8/i.test(harness);

  const harnessFlagsMatchOutcome = expectFlipped
    ? /r4ProductClosed=true/.test(harness)
      && /funnelProductClosed=true/.test(harness)
      && /gR45Closed=false/.test(harness)
      && /productCloseFlipped=true|honest(?:ly)? flip|SSOT flip/i.test(harness)
    : /r4ProductClosed=false/.test(harness)
      && /funnelProductClosed=false/.test(harness)
      && /gR45Closed=false/.test(harness);

  const matrixHonestyRetained = expectFlipped
    ? /\*\*coveredCount\*\*:\s*8/.test(matrix)
      && /Ban invent covered/.test(matrix)
      && funnel02Through08AllCovered()
    : /\*\*coveredCount\*\*:\s*0/.test(matrix)
      && /Ban invent covered/.test(matrix)
      && funnel02Through08NotCovered();

  const archivePriorNonFlipRetained =
    /post_prove_dual_pass/.test(archiveHarness)
    && /r4ProductClosed=false/.test(archiveHarness)
    && /evidence_insufficient_coveredCount_zero|coveredCount.*0/.test(archiveHarness)
    && /da185d9|139dac9|1c2ed8c/.test(harness);

  return {
    eg3FlagsRetained,
    authorizedSsotPinsPresent,
    orthogonalNotClaimedClosed,
    harnessFlagsMatchOutcome,
    matrixHonestyRetained,
    archivePriorNonFlipRetained,
  };
}

/**
 * Attempt to emit r4ProductClosed=true / funnelProductClosed=true.
 * Reassess: succeeds when coveredCount=8 + 02A…08 covered + honesty pins.
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
  const pins = assessR4FunnelProductCloseHonestyPins({ expectFlipped: true });
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
  if (!pins.harnessFlagsMatchOutcome) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: 'harness_flags_mismatch',
    };
  }
  if (!pins.matrixHonestyRetained || !pins.archivePriorNonFlipRetained) {
    return {
      kind: 'R4FunnelProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_invent_coveredCount',
    };
  }

  return {
    emitted: true,
    evidence: {
      kind: R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND,
      productCloseAttemptedUnderAuthorize: true,
      productCloseFlipped: true,
      evidenceInsufficient: false,
      coveredCount: 8,
      coveredCountInvented: false,
      funnel02Through08AllCovered: true,
      matrixHonestyRetained: true,
      eg3FlagsRetained: true,
      authorizedSsotPinsPresent: true,
      r4ProductClosed: true,
      funnelProductClosed: true,
      gR45Closed: false,
      domainIsolationClosed: true,
      eg3ProductClosed: true,
      eg1ThroughEg6ProductClosedByThisKnife: false,
      ms3EqualsR4Closed: false,
      releaseEvidence: false,
      archivePriorNonFlipRetained: true,
      note:
        'G-R4-5 / R4·FUNNEL product-close reassess — authorized honest flip · live matrix coveredCount=8 · FUNNEL-02A…08 covered · r4ProductClosed=true · funnelProductClosed=true · gR45Closed=false (default do NOT auto-flip) · retain EG3 domainIsolationClosed/eg3ProductClosed · ARCHIVE prior non-flip da185d9/139dac9/1c2ed8c retained · Ban invent coveredCount · Ban wash Batch4b f802f02/0e58386 · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual · releaseEvidence=false · ≠HA',
    },
  };
}

/**
 * Emit authorized honest non-flip receipt when closed emission is correctly refused
 * (ARCHIVE path · coveredCount=0). Reassess with coveredCount=8 must NOT use this.
 */
export function emitR4FunnelProductCloseHonestNonFlip(): R4FunnelProductCloseResult {
  const elig = assessR4FunnelProductCloseFlipEligibility();
  const pins = assessR4FunnelProductCloseHonestyPins({ expectFlipped: false });

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
  if (!pins.harnessFlagsMatchOutcome) {
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
    note:
      'G-R4-5 / R4·FUNNEL product close — authorized attempt · evidence insufficient (coveredCount=0 · FUNNEL-02A…08 not_covered) · r4ProductClosed/funnelProductClosed NOT flipped · Ban invent coveredCount · Ban假关 · Ban wash EG3/R1/FUNNEL rem·SSOT·EXPLICIT · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export function hasR4FunnelProductCloseHonestNonFlipEvidence(): boolean {
  const r = emitR4FunnelProductCloseHonestNonFlip();
  return r.emitted === true && r.evidence.productCloseFlipped === false;
}

export function hasR4FunnelProductCloseFlippedEvidence(): boolean {
  const r = attemptEmitR4FunnelProductCloseClosed();
  return r.emitted === true && r.evidence.productCloseFlipped === true;
}

export const R4_FUNNEL_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
