/**
 * G-R4-5 / EG1 dual-claim product close — dedicated prove emitter
 * (eg1ProductClosed + gR45DualClaimClosed under standing authorize ·
 * MetadataReviewReceipt / RAG-FUNNEL-01 · 01A≡01 face).
 *
 * Honest path:
 *   - Retains prior EG1 dual-claim OPEN evidence (tip 08f7499 / dual ffb2a9b ·
 *     gR45DualClaimClosed=false · gap01AEquals01=true).
 *   - Requires authorized SSOT pins (GAP-RAG-04 / m4 §R4 / w0-w8 / product-ssot /
 *     this knife) reflecting product-face close under authorize.
 *   - Emits eg1ProductClosed=true + gR45DualClaimClosed=true only when assessors
 *     + authorized SSOT honestly support THIS knife.
 *   - Ban flip gR45Closed · Ban closing EG2 · Ban invent coveredCount · Ban MS3=R4.
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - Ban flip gR45Closed / r4ProductClosed / funnelProductClosed / eg3 / eg4 / eg5 / eg6 /
 *     ms3EqualsR4Closed this knife (retain).
 *   - Ban wash EG1 evidence 08f7499/ffb2a9b · EG6 315570d/757fbe1 · EG5 33f457b/7f59b95 ·
 *     EG4 ce09850/0a34933 · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854.
 *   - Ban empty meta / idle re-run only pnpm r4-eg1-dual-claim:prove as fake product close.
 *   - Ban closing EG2 · releaseEvidence=false · ≠HA · ≠suite green.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_EG1_DUAL_CLAIM_PRODUCT_CLOSE_EVIDENCE_KIND =
  'Eg1DualClaimProductCloseEvidence' as const;

export type Eg1DualClaimProductCloseEvidence = {
  readonly kind: typeof R4_EG1_DUAL_CLAIM_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseEvidence: true;
  readonly priorEg1EvidenceRetained: true;
  readonly authorizedSsotPinsPresent: true;
  /** This knife — under standing authorize + prove. MetadataReviewReceipt / RAG-FUNNEL-01 · 01A≡01. */
  readonly eg1ProductClosed: true;
  readonly gR45DualClaimClosed: true;
  /** Explicit retain / non-claims (Ban flip / Ban wash). */
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
  readonly eg2ClosedByThisKnife: false;
  readonly coveredCountInvented: false;
  readonly emptyMetaAloneDoesNotClose: true;
  readonly idleEg1EvidenceAloneDoesNotClose: true;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / EG1 dual-claim product close — eg1ProductClosed + gR45DualClaimClosed under authorize · MetadataReviewReceipt / RAG-FUNNEL-01 · 01A≡01 · Ban flip gR45Closed · Ban closing EG2 · retain eg3–eg6/r4/funnel · ms3EqualsR4Closed=false · Ban wash 08f7499/ffb2a9b / 315570d/757fbe1 / 33f457b/7f59b95 / ce09850/0a34933 / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban invent coveredCount · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

export type Eg1ProductCloseEvidenceFailure = {
  readonly kind: 'Eg1DualClaimProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'prior_eg1_evidence_missing'
    | 'authorized_ssot_pins_missing'
    | 'retained_flags_missing'
    | 'would_forge_orthogonal_closed';
};

export type Eg1ProductCloseEvidenceResult =
  | { readonly emitted: true; readonly evidence: Eg1DualClaimProductCloseEvidence }
  | Eg1ProductCloseEvidenceFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export function assessEg1DualClaimProductClose(): {
  priorEg1EvidenceRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  retainedFlagsHonest: boolean;
  orthogonalNotClaimedClosed: boolean;
} {
  const priorHarness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg1-eg2-true-evidence-impl.md',
  );
  const priorReceipt = readRepo(
    'ai-docs/delivery/receipts/2026-09-17-g-r4-5-eg1-dual-claim-evidence.json',
  );
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg1-dual-claim-product-close.md',
  );
  const ssotBlob = gap + m4 + w0 + harness;

  // Retain prior EG1 dual-claim OPEN evidence (tip 08f7499 / dual ffb2a9b).
  const priorEg1EvidenceRetained =
    /post_prove_dual_pass/.test(priorHarness)
    && (/ffb2a9b/.test(priorHarness) || /08f7499/.test(w0 + harness + priorHarness))
    && /gR45DualClaimClosed=false/.test(priorHarness)
    && /EG1 STILL OPEN/.test(priorHarness)
    && /"kind": "MetadataReviewReceiptRagFunnel01DualClaimEvidence"/.test(priorReceipt)
    && /"gap01AEquals01": true/.test(priorReceipt)
    && /"gR45DualClaimClosed": false/.test(priorReceipt)
    && /"releaseEvidence": false/.test(priorReceipt);

  const authorizedSsotPinsPresent =
    /GAP-RAG-04/.test(gap)
    && /eg1ProductClosed=true|EG1 \/ dual-claim product face closed under authorize|EG1 dual-claim product face closed under authorize/i.test(
      ssotBlob,
    )
    && /eg1ProductClosed=true/.test(harness)
    && /gR45DualClaimClosed=true/.test(harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /gR45Closed=false/.test(harness)
    && /ms3EqualsR4Closed=false/.test(harness)
    && /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /eg5ProductClosed=true/.test(harness)
    && /productSsotFlipped=true/.test(harness)
    && /eg6ProductClosed=true/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /G-R4-5 STILL OPEN|≠ G-R4-5 all closed/i.test(harness)
    && /Ban closing EG2|EG2 STILL OPEN|Ban closing EG2 this knife/i.test(harness);

  const retainedFlagsHonest =
    /r4ProductClosed=true/.test(harness)
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
    && /Ban closing EG2|EG2 STILL OPEN|Ban closing EG2 this knife/i.test(harness)
    && /Ban idle re-run only.*r4-eg1-dual-claim:prove|idleEg1EvidenceAloneDoesNotClose|Ban idle re-run only `pnpm r4-eg1-dual-claim:prove`/i.test(
      harness,
    );

  return {
    priorEg1EvidenceRetained,
    authorizedSsotPinsPresent,
    retainedFlagsHonest,
    orthogonalNotClaimedClosed,
  };
}

export function hasEg1DualClaimProductCloseEvidence(): boolean {
  const a = assessEg1DualClaimProductClose();
  return (
    a.priorEg1EvidenceRetained
    && a.authorizedSsotPinsPresent
    && a.retainedFlagsHonest
    && a.orthogonalNotClaimedClosed
  );
}

export function emitEg1DualClaimProductCloseEvidence(): Eg1ProductCloseEvidenceResult {
  const a = assessEg1DualClaimProductClose();
  if (!a.priorEg1EvidenceRetained) {
    return {
      kind: 'Eg1DualClaimProductCloseEvidenceFailure',
      emitted: false,
      reason: 'prior_eg1_evidence_missing',
    };
  }
  if (!a.authorizedSsotPinsPresent) {
    return {
      kind: 'Eg1DualClaimProductCloseEvidenceFailure',
      emitted: false,
      reason: 'authorized_ssot_pins_missing',
    };
  }
  if (!a.retainedFlagsHonest) {
    return {
      kind: 'Eg1DualClaimProductCloseEvidenceFailure',
      emitted: false,
      reason: 'retained_flags_missing',
    };
  }
  if (!a.orthogonalNotClaimedClosed) {
    return {
      kind: 'Eg1DualClaimProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_forge_orthogonal_closed',
    };
  }

  const evidence: Eg1DualClaimProductCloseEvidence = {
    kind: R4_EG1_DUAL_CLAIM_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseEvidence: true,
    priorEg1EvidenceRetained: true,
    authorizedSsotPinsPresent: true,
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
    eg2ClosedByThisKnife: false,
    coveredCountInvented: false,
    emptyMetaAloneDoesNotClose: true,
    idleEg1EvidenceAloneDoesNotClose: true,
    releaseEvidence: false,
    note: 'G-R4-5 / EG1 dual-claim product close — eg1ProductClosed + gR45DualClaimClosed under authorize · MetadataReviewReceipt / RAG-FUNNEL-01 · 01A≡01 · Ban flip gR45Closed · Ban closing EG2 · retain eg3–eg6/r4/funnel · ms3EqualsR4Closed=false · Ban wash 08f7499/ffb2a9b / 315570d/757fbe1 / 33f457b/7f59b95 / ce09850/0a34933 / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban invent coveredCount · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const R4_EG1_DUAL_CLAIM_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
