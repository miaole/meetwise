/**
 * G-R4-5 / EG6 MS3≠R4 product close — dedicated prove emitter
 * (eg6ProductClosed under standing authorize · ms3EqualsR4Closed=false retained).
 *
 * Honest path:
 *   - Retains prior EG6 MS3≠R4 pin-retention OPEN evidence (tip 9b1c83e / dual 3e82f14 · flags false).
 *   - Requires authorized SSOT pins (GAP-RAG-04 / m4 §R4 / w0-w8 / product-ssot / this knife)
 *     reflecting product-face close under authorize.
 *   - Emits eg6ProductClosed=true only when assessors + authorized SSOT honestly support THIS knife.
 *   - NO invented twin flag · retain ms3EqualsR4Closed=false · Ban claim R4 closed from MS3.
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - Ban flip gR45Closed / r4ProductClosed / funnelProductClosed / eg3 / eg4 / eg5 this knife (retain).
 *   - Ban wash EG6 evidence 9b1c83e/3e82f14 · EG5 33f457b/7f59b95 · EG4 ce09850/0a34933 · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854.
 *   - Ban empty meta / idle re-run only pnpm r4-eg6-ms3-ne-r4:prove as fake product close.
 *   - Ban MS3=R4 · Ban closing EG1/2 · releaseEvidence=false · ≠HA · ≠suite green.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_EG6_MS3_NE_R4_PRODUCT_CLOSE_EVIDENCE_KIND =
  'Eg6Ms3NeR4ProductCloseEvidence' as const;

export type Eg6Ms3NeR4ProductCloseEvidence = {
  readonly kind: typeof R4_EG6_MS3_NE_R4_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseEvidence: true;
  readonly priorEg6EvidenceRetained: true;
  readonly authorizedSsotPinsPresent: true;
  /** This knife only — under standing authorize + prove. No invented twin. */
  readonly eg6ProductClosed: true;
  /** Explicit retain — Ban claim R4 closed from MS3. */
  readonly ms3EqualsR4Closed: false;
  /** Explicit retain / non-claims (Ban flip / Ban wash). */
  readonly gR45Closed: false;
  readonly r4ProductClosed: true;
  readonly funnelProductClosed: true;
  readonly domainIsolationClosed: true;
  readonly eg3ProductClosed: true;
  readonly eg4ProductClosed: true;
  readonly wrongTrackProductClosed: true;
  readonly eg5ProductClosed: true;
  readonly productSsotFlipped: true;
  readonly eg1ThroughEg2ClosedByThisKnife: false;
  readonly coveredCountInvented: false;
  readonly emptyMetaAloneDoesNotClose: true;
  readonly idleEg6EvidenceAloneDoesNotClose: true;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / EG6 MS3≠R4 product close — eg6ProductClosed under authorize · ms3EqualsR4Closed=false retained · Ban claim R4 closed from MS3 · Ban flip gR45Closed/r4/funnel/eg3/eg4/eg5 · retain EG3+EG4+EG5+r4/funnel · Ban wash 9b1c83e/3e82f14 / 33f457b/7f59b95 / ce09850/0a34933 / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban invent twin · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

export type Eg6ProductCloseEvidenceFailure = {
  readonly kind: 'Eg6Ms3NeR4ProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'prior_eg6_evidence_missing'
    | 'authorized_ssot_pins_missing'
    | 'retained_flags_missing'
    | 'would_forge_orthogonal_closed';
};

export type Eg6ProductCloseEvidenceResult =
  | { readonly emitted: true; readonly evidence: Eg6Ms3NeR4ProductCloseEvidence }
  | Eg6ProductCloseEvidenceFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export function assessEg6Ms3NeR4ProductClose(): {
  priorEg6EvidenceRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  retainedFlagsHonest: boolean;
  orthogonalNotClaimedClosed: boolean;
} {
  const priorHarness = readRepo('ai-docs/delivery/harness/g-r4-5-eg6-true-evidence-impl.md');
  const priorReceipt = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg6-ms3-ne-r4-evidence.json',
  );
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg6-ms3-ne-r4-product-close.md',
  );
  const ssotBlob = gap + m4 + w0 + harness;

  // Retain prior EG6 MS3≠R4 pin-retention OPEN evidence (tip 9b1c83e / dual 3e82f14).
  const priorEg6EvidenceRetained =
    /post_prove_dual_pass/.test(priorHarness)
    && (/3e82f14/.test(priorHarness) || /9b1c83e/.test(w0 + harness + priorHarness))
    && /eg6ProductClosed=false/.test(priorHarness)
    && /ms3EqualsR4Closed=false/.test(priorHarness)
    && /"kind": "Ms3NeR4PinRetentionEvidence"/.test(priorReceipt)
    && /"ms3NeR4PinRetentionEvidence": true/.test(priorReceipt)
    && /"eg6ProductClosed": false/.test(priorReceipt)
    && /"ms3EqualsR4Closed": false/.test(priorReceipt)
    && /"releaseEvidence": false/.test(priorReceipt);

  const authorizedSsotPinsPresent =
    /GAP-RAG-04/.test(gap)
    && /eg6ProductClosed=true|EG6 \/ MS3≠R4 product face closed under authorize|EG6 MS3≠R4 product face closed under authorize/i.test(
      ssotBlob,
    )
    && /eg6ProductClosed=true/.test(harness)
    && /ms3EqualsR4Closed=false/.test(harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /gR45Closed=false/.test(harness)
    && /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /eg5ProductClosed=true/.test(harness)
    && /productSsotFlipped=true/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /G-R4-5 STILL OPEN|≠ G-R4-5 all closed/i.test(harness)
    && /Ban claim(ing)? R4 closed from MS3|Ban claim R4 closed from MS3/i.test(harness);

  const retainedFlagsHonest =
    /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /eg5ProductClosed=true/.test(harness)
    && /productSsotFlipped=true/.test(harness)
    && /ms3EqualsR4Closed=false/.test(harness)
    && /gR45Closed=false/.test(harness)
    && /Ban flip.*gR45Closed|Ban flip `gR45Closed`|Ban.*flip `gR45Closed`|Ban flip gR45/i.test(
      harness,
    );

  const orthogonalNotClaimedClosed =
    /gR45Closed=false/.test(harness)
    && !/\bgR45Closed=true\b/.test(harness.replace(/`gR45Closed=true`/g, ''))
    && !/ms3EqualsR4Closed=true/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /Ban invent coveredCount|coveredCount.*not invented|≠ invent coveredCount/i.test(harness)
    && /Ban closing EG1|Ban closing EG1\/2|EG1\/2 product \*\*NOT\*\*|EG1\/2/.test(harness)
    && /Ban invent twin|no invented twin|Ban invent.*twin/i.test(harness);

  return {
    priorEg6EvidenceRetained,
    authorizedSsotPinsPresent,
    retainedFlagsHonest,
    orthogonalNotClaimedClosed,
  };
}

export function hasEg6Ms3NeR4ProductCloseEvidence(): boolean {
  const a = assessEg6Ms3NeR4ProductClose();
  return (
    a.priorEg6EvidenceRetained
    && a.authorizedSsotPinsPresent
    && a.retainedFlagsHonest
    && a.orthogonalNotClaimedClosed
  );
}

export function emitEg6Ms3NeR4ProductCloseEvidence(): Eg6ProductCloseEvidenceResult {
  const a = assessEg6Ms3NeR4ProductClose();
  if (!a.priorEg6EvidenceRetained) {
    return {
      kind: 'Eg6Ms3NeR4ProductCloseEvidenceFailure',
      emitted: false,
      reason: 'prior_eg6_evidence_missing',
    };
  }
  if (!a.authorizedSsotPinsPresent) {
    return {
      kind: 'Eg6Ms3NeR4ProductCloseEvidenceFailure',
      emitted: false,
      reason: 'authorized_ssot_pins_missing',
    };
  }
  if (!a.retainedFlagsHonest) {
    return {
      kind: 'Eg6Ms3NeR4ProductCloseEvidenceFailure',
      emitted: false,
      reason: 'retained_flags_missing',
    };
  }
  if (!a.orthogonalNotClaimedClosed) {
    return {
      kind: 'Eg6Ms3NeR4ProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_forge_orthogonal_closed',
    };
  }

  const evidence: Eg6Ms3NeR4ProductCloseEvidence = {
    kind: R4_EG6_MS3_NE_R4_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseEvidence: true,
    priorEg6EvidenceRetained: true,
    authorizedSsotPinsPresent: true,
    eg6ProductClosed: true,
    ms3EqualsR4Closed: false,
    gR45Closed: false,
    r4ProductClosed: true,
    funnelProductClosed: true,
    domainIsolationClosed: true,
    eg3ProductClosed: true,
    eg4ProductClosed: true,
    wrongTrackProductClosed: true,
    eg5ProductClosed: true,
    productSsotFlipped: true,
    eg1ThroughEg2ClosedByThisKnife: false,
    coveredCountInvented: false,
    emptyMetaAloneDoesNotClose: true,
    idleEg6EvidenceAloneDoesNotClose: true,
    releaseEvidence: false,
    note: 'G-R4-5 / EG6 MS3≠R4 product close — eg6ProductClosed under authorize · ms3EqualsR4Closed=false retained · Ban claim R4 closed from MS3 · Ban flip gR45Closed/r4/funnel/eg3/eg4/eg5 · retain EG3+EG4+EG5+r4/funnel · Ban wash 9b1c83e/3e82f14 / 33f457b/7f59b95 / ce09850/0a34933 / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban invent twin · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const R4_EG6_MS3_NE_R4_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
