/**
 * G-R4-5 / EG2 funnel-covered product close — dedicated prove emitter
 * (eg2ProductClosed under standing authorize · RAG-FUNNEL-01…08 covered matrix face).
 *
 * Honest path:
 *   - Retains prior EG2 OPEN evidence (tip 08f7499 / dual ffb2a9b · EG2 STILL OPEN)
 *     + Batch4b coveredCount=8 (tip f802f02 / prove 0e58386 · covering ≠ product closed).
 *   - Requires authorized SSOT pins (GAP-RAG-04 / m4 §R4 / w0-w8 / product-ssot /
 *     this knife) reflecting product-face close under authorize.
 *   - Emits eg2ProductClosed=true only when assessors + authorized SSOT honestly support THIS knife.
 *   - Ban invent coveredCount · retain coveredCount=8 · Ban flip gR45Closed · Ban flip eg1/dualClaim/r4/funnel/eg3–eg6/ms3EqualsR4Closed.
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - Ban flip gR45Closed / r4ProductClosed / funnelProductClosed / eg1 / eg3 / eg4 / eg5 / eg6 /
 *     gR45DualClaimClosed / ms3EqualsR4Closed this knife (retain).
 *   - Ban wash EG1 product 88277ee/4a0877d · EG1+EG2 evidence 08f7499/ffb2a9b · Batch4b f802f02/0e58386 ·
 *     EG6 315570d/757fbe1 · EG5 33f457b/7f59b95 · EG4 ce09850/0a34933 · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854.
 *   - Ban empty meta / idle re-run only pnpm r4-eg2-funnel-covered:prove as fake product close.
 *   - Ban invent coveredCount · Ban MS3=R4 · Ban auto-flip gR45Closed · releaseEvidence=false · ≠HA · ≠suite green.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_EG2_FUNNEL_COVERED_PRODUCT_CLOSE_EVIDENCE_KIND =
  'Eg2FunnelCoveredProductCloseEvidence' as const;

export type Eg2FunnelCoveredProductCloseEvidence = {
  readonly kind: typeof R4_EG2_FUNNEL_COVERED_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseEvidence: true;
  readonly priorEg2EvidenceRetained: true;
  readonly batch4bCoveredCountRetained: true;
  readonly authorizedSsotPinsPresent: true;
  /** This knife — under standing authorize + prove. RAG-FUNNEL-01…08 covered matrix face. */
  readonly eg2ProductClosed: true;
  /** Retained — Ban invent · Batch4b f802f02 · covering ≠ invent. */
  readonly coveredCount: 8;
  readonly coveredCountInvented: false;
  /** Explicit retain / non-claims (Ban flip / Ban wash). */
  readonly eg1ProductClosed: true;
  readonly gR45DualClaimClosed: true;
  readonly gR45Closed: false;
  readonly ms3EqualsR4Closed: false;
  readonly r4ProductClosed: true;
  readonly funnelProductClosed: true;
  readonly domainIsolationClosed: true;
  readonly eg3ProductClosed: true;
  readonly eg4ProductClosed: true;
  readonly wrongTrackProductClosed: true;
  readonly eg5ProductClosed: true;
  readonly productSsotFlipped: true;
  readonly eg6ProductClosed: true;
  readonly emptyMetaAloneDoesNotClose: true;
  readonly idleEg2EvidenceAloneDoesNotClose: true;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / EG2 funnel-covered product close — eg2ProductClosed under authorize · RAG-FUNNEL-01…08 covered matrix face · coveredCount=8 retained (Batch4b f802f02 · Ban invent) · Ban flip gR45Closed · retain eg1/dualClaim/r4/funnel/eg3–eg6 · ms3EqualsR4Closed=false · Ban wash 88277ee/4a0877d / 08f7499/ffb2a9b / f802f02/0e58386 / 315570d/757fbe1 / 33f457b/7f59b95 / ce09850/0a34933 / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban idle re-run only r4-eg2-funnel-covered:prove · Ban self-nail post_prove_dual_pass · Ban auto-flip gR45Closed · await post-prove dual';
};

export type Eg2ProductCloseEvidenceFailure = {
  readonly kind: 'Eg2FunnelCoveredProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'prior_eg2_evidence_missing'
    | 'batch4b_covered_count_missing'
    | 'authorized_ssot_pins_missing'
    | 'retained_flags_missing'
    | 'would_forge_orthogonal_closed';
};

export type Eg2ProductCloseEvidenceResult =
  | { readonly emitted: true; readonly evidence: Eg2FunnelCoveredProductCloseEvidence }
  | Eg2ProductCloseEvidenceFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export function assessEg2FunnelCoveredProductClose(): {
  priorEg2EvidenceRetained: boolean;
  batch4bCoveredCountRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  retainedFlagsHonest: boolean;
  orthogonalNotClaimedClosed: boolean;
} {
  const priorHarness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg1-eg2-true-evidence-impl.md',
  );
  const priorMatrix = readRepo(
    'ai-docs/delivery/receipts/2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json',
  );
  const batch4b = readRepo(
    'ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch4b-08-eval.md',
  );
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg2-funnel-covered-product-close.md',
  );
  const ssotBlob = gap + m4 + w0 + harness;

  // Retain prior EG2 OPEN evidence (tip nail 08f7499 / dual/prove ffb2a9b · EG2 STILL OPEN).
  const priorEg2EvidenceRetained =
    /post_prove_dual_pass/.test(priorHarness)
    && /ffb2a9b/.test(priorHarness)
    && (/08f7499/.test(w0 + harness + priorHarness) || /ffb2a9b/.test(priorHarness))
    && /EG2\s+\*\*STILL OPEN\*\*|EG2 STILL OPEN/.test(priorHarness)
    && /"kind":\s*"RagFunnel0108CoveredMatrix"/.test(priorMatrix)
    && /"coveredCount":\s*8/.test(priorMatrix)
    && /"inventCovered":\s*false/.test(priorMatrix)
    && /"releaseEvidence":\s*false/.test(priorMatrix);

  // Batch4b coveredCount=8 retained (tip f802f02 / prove 0e58386 · covering ≠ product closed).
  const batch4bCoveredCountRetained =
    /0e58386/.test(batch4b)
    && (/f802f02/.test(harness + w0 + batch4b) || /0e58386/.test(batch4b))
    && /coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount \*\*7→8\*\*/.test(
      batch4b,
    )
    && /covering 08 ≠ product closed|covering ≠ product closed/.test(batch4b)
    && /Ban invent/.test(batch4b);

  const authorizedSsotPinsPresent =
    /GAP-RAG-04/.test(gap)
    && /eg2ProductClosed=true|EG2 \/ funnel-covered product face closed under authorize|EG2 funnel-covered product face closed under authorize/i.test(
      ssotBlob,
    )
    && /eg2ProductClosed=true/.test(harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /gR45Closed=false/.test(harness)
    && /ms3EqualsR4Closed=false/.test(harness)
    && /eg1ProductClosed=true/.test(harness)
    && /gR45DualClaimClosed=true/.test(harness)
    && /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /eg5ProductClosed=true/.test(harness)
    && /productSsotFlipped=true/.test(harness)
    && /eg6ProductClosed=true/.test(harness)
    && /coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount=8/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /G-R4-5 STILL OPEN|≠ G-R4-5 all closed/i.test(harness)
    && /Ban invent coveredCount|coveredCount.*not invented|≠ invent coveredCount/i.test(harness);

  const retainedFlagsHonest =
    /eg1ProductClosed=true/.test(harness)
    && /gR45DualClaimClosed=true/.test(harness)
    && /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /eg5ProductClosed=true/.test(harness)
    && /productSsotFlipped=true/.test(harness)
    && /eg6ProductClosed=true/.test(harness)
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
    && /Ban idle re-run only.*r4-eg2-funnel-covered:prove|idleEg2EvidenceAloneDoesNotClose|Ban idle re-run only `pnpm r4-eg2-funnel-covered:prove`/i.test(
      harness,
    )
    && /Ban auto-flip `gR45Closed`|Ban auto-flip gR45Closed/i.test(harness);

  return {
    priorEg2EvidenceRetained,
    batch4bCoveredCountRetained,
    authorizedSsotPinsPresent,
    retainedFlagsHonest,
    orthogonalNotClaimedClosed,
  };
}

export function hasEg2FunnelCoveredProductCloseEvidence(): boolean {
  const a = assessEg2FunnelCoveredProductClose();
  return (
    a.priorEg2EvidenceRetained
    && a.batch4bCoveredCountRetained
    && a.authorizedSsotPinsPresent
    && a.retainedFlagsHonest
    && a.orthogonalNotClaimedClosed
  );
}

export function emitEg2FunnelCoveredProductCloseEvidence(): Eg2ProductCloseEvidenceResult {
  const a = assessEg2FunnelCoveredProductClose();
  if (!a.priorEg2EvidenceRetained) {
    return {
      kind: 'Eg2FunnelCoveredProductCloseEvidenceFailure',
      emitted: false,
      reason: 'prior_eg2_evidence_missing',
    };
  }
  if (!a.batch4bCoveredCountRetained) {
    return {
      kind: 'Eg2FunnelCoveredProductCloseEvidenceFailure',
      emitted: false,
      reason: 'batch4b_covered_count_missing',
    };
  }
  if (!a.authorizedSsotPinsPresent) {
    return {
      kind: 'Eg2FunnelCoveredProductCloseEvidenceFailure',
      emitted: false,
      reason: 'authorized_ssot_pins_missing',
    };
  }
  if (!a.retainedFlagsHonest) {
    return {
      kind: 'Eg2FunnelCoveredProductCloseEvidenceFailure',
      emitted: false,
      reason: 'retained_flags_missing',
    };
  }
  if (!a.orthogonalNotClaimedClosed) {
    return {
      kind: 'Eg2FunnelCoveredProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_forge_orthogonal_closed',
    };
  }

  const evidence: Eg2FunnelCoveredProductCloseEvidence = {
    kind: R4_EG2_FUNNEL_COVERED_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseEvidence: true,
    priorEg2EvidenceRetained: true,
    batch4bCoveredCountRetained: true,
    authorizedSsotPinsPresent: true,
    eg2ProductClosed: true,
    coveredCount: 8,
    coveredCountInvented: false,
    eg1ProductClosed: true,
    gR45DualClaimClosed: true,
    gR45Closed: false,
    ms3EqualsR4Closed: false,
    r4ProductClosed: true,
    funnelProductClosed: true,
    domainIsolationClosed: true,
    eg3ProductClosed: true,
    eg4ProductClosed: true,
    wrongTrackProductClosed: true,
    eg5ProductClosed: true,
    productSsotFlipped: true,
    eg6ProductClosed: true,
    emptyMetaAloneDoesNotClose: true,
    idleEg2EvidenceAloneDoesNotClose: true,
    releaseEvidence: false,
    note: 'G-R4-5 / EG2 funnel-covered product close — eg2ProductClosed under authorize · RAG-FUNNEL-01…08 covered matrix face · coveredCount=8 retained (Batch4b f802f02 · Ban invent) · Ban flip gR45Closed · retain eg1/dualClaim/r4/funnel/eg3–eg6 · ms3EqualsR4Closed=false · Ban wash 88277ee/4a0877d / 08f7499/ffb2a9b / f802f02/0e58386 / 315570d/757fbe1 / 33f457b/7f59b95 / ce09850/0a34933 / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban idle re-run only r4-eg2-funnel-covered:prove · Ban self-nail post_prove_dual_pass · Ban auto-flip gR45Closed · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const R4_EG2_FUNNEL_COVERED_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
