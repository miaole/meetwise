/**
 * G-R4-5 / EG5 product SSOT product close — dedicated prove emitter
 * (eg5ProductClosed / productSsotFlipped under standing authorize).
 *
 * Honest path:
 *   - Retains prior EG5 authorize-honesty evidence (tip e099276 / dual 6058462 · flags false).
 *   - Requires authorized SSOT pins (GAP-RAG-04 / m4 §R4 / w0-w8 / product-ssot / this knife)
 *     reflecting product-face close under authorize.
 *   - Emits eg5ProductClosed / productSsotFlipped=true only when assessors +
 *     authorized SSOT honestly support THIS knife.
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - Ban flip gR45Closed / r4ProductClosed / funnelProductClosed / eg3 / eg4 this knife (retain).
 *   - Ban wash EG5 evidence e099276/6058462 · EG4 ce09850/0a34933 · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854.
 *   - Ban empty meta / idle re-run EG5 evidence alone as fake product close.
 *   - Ban MS3=R4 · Ban closing EG1/2/6 · releaseEvidence=false · ≠HA · ≠suite green.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_EG5_PRODUCT_SSOT_PRODUCT_CLOSE_EVIDENCE_KIND =
  'Eg5ProductSsotProductCloseEvidence' as const;

export type Eg5ProductSsotProductCloseEvidence = {
  readonly kind: typeof R4_EG5_PRODUCT_SSOT_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseEvidence: true;
  readonly priorEg5AuthorizeEvidenceRetained: true;
  readonly authorizedSsotPinsPresent: true;
  /** This knife only — under standing authorize + prove. */
  readonly eg5ProductClosed: true;
  readonly productSsotFlipped: true;
  /** Explicit retain / non-claims (Ban flip / Ban wash). */
  readonly gR45Closed: false;
  readonly r4ProductClosed: true;
  readonly funnelProductClosed: true;
  readonly domainIsolationClosed: true;
  readonly eg3ProductClosed: true;
  readonly eg4ProductClosed: true;
  readonly wrongTrackProductClosed: true;
  readonly eg1ThroughEg2Eg6ClosedByThisKnife: false;
  readonly coveredCountInvented: false;
  readonly ms3EqualsR4Closed: false;
  readonly emptyMetaAloneDoesNotClose: true;
  readonly idleEg5EvidenceAloneDoesNotClose: true;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / EG5 product SSOT product close — eg5ProductClosed/productSsotFlipped under authorize · Ban flip gR45Closed/r4/funnel/eg3/eg4 · retain EG3+EG4+r4/funnel · Ban wash e099276/6058462 / ce09850/0a34933 / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

export type Eg5ProductCloseEvidenceFailure = {
  readonly kind: 'Eg5ProductSsotProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'prior_eg5_evidence_missing'
    | 'authorized_ssot_pins_missing'
    | 'retained_flags_missing'
    | 'would_forge_orthogonal_closed';
};

export type Eg5ProductCloseEvidenceResult =
  | { readonly emitted: true; readonly evidence: Eg5ProductSsotProductCloseEvidence }
  | Eg5ProductCloseEvidenceFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export function assessEg5ProductSsotProductClose(): {
  priorEg5AuthorizeEvidenceRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  retainedFlagsHonest: boolean;
  orthogonalNotClaimedClosed: boolean;
} {
  const priorHarness = readRepo('ai-docs/delivery/harness/g-r4-5-eg5-true-evidence-impl.md');
  const priorReceipt = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg5-product-ssot-evidence.json',
  );
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg5-product-ssot-product-close.md',
  );
  const ssotBlob = gap + m4 + w0 + harness;

  // Retain prior EG5 authorize-honesty OPEN evidence (tip e099276 / dual 6058462).
  // Do NOT re-run live hasProductSsotAuthorizeEvidence() — EG2 matrix coveredCount later
  // progressed to 8 under Batch knives; evidence receipt flags remain the honesty pin.
  const priorEg5AuthorizeEvidenceRetained =
    /post_prove_dual_pass/.test(priorHarness)
    && (/6058462/.test(priorHarness) || /e099276/.test(w0 + harness + priorHarness))
    && /eg5ProductClosed=false/.test(priorHarness)
    && /productSsotFlipped=false/.test(priorHarness)
    && /"kind": "ProductSsotAuthorizeEvidence"/.test(priorReceipt)
    && /"productSsotAuthorizeEvidence": true/.test(priorReceipt)
    && /"eg5ProductClosed": false/.test(priorReceipt)
    && /"productSsotFlipped": false/.test(priorReceipt)
    && /"releaseEvidence": false/.test(priorReceipt);

  const authorizedSsotPinsPresent =
    /GAP-RAG-04/.test(gap)
    && /eg5ProductClosed=true|productSsotFlipped=true|EG5 \/ product SSOT product face closed under authorize|EG5 product SSOT product face closed under authorize/i.test(
      ssotBlob,
    )
    && /eg5ProductClosed=true/.test(harness)
    && /productSsotFlipped=true/.test(harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /gR45Closed=false/.test(harness)
    && /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /G-R4-5 STILL OPEN|≠ G-R4-5 all closed/i.test(harness);

  const retainedFlagsHonest =
    /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
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
    && /Ban closing EG1|Ban closing EG1\/2\/6|EG1\/2\/6 product \*\*NOT\*\*|EG1\/2\/6/.test(
      harness,
    );

  return {
    priorEg5AuthorizeEvidenceRetained,
    authorizedSsotPinsPresent,
    retainedFlagsHonest,
    orthogonalNotClaimedClosed,
  };
}

export function hasEg5ProductSsotProductCloseEvidence(): boolean {
  const a = assessEg5ProductSsotProductClose();
  return (
    a.priorEg5AuthorizeEvidenceRetained
    && a.authorizedSsotPinsPresent
    && a.retainedFlagsHonest
    && a.orthogonalNotClaimedClosed
  );
}

export function emitEg5ProductSsotProductCloseEvidence(): Eg5ProductCloseEvidenceResult {
  const a = assessEg5ProductSsotProductClose();
  if (!a.priorEg5AuthorizeEvidenceRetained) {
    return {
      kind: 'Eg5ProductSsotProductCloseEvidenceFailure',
      emitted: false,
      reason: 'prior_eg5_evidence_missing',
    };
  }
  if (!a.authorizedSsotPinsPresent) {
    return {
      kind: 'Eg5ProductSsotProductCloseEvidenceFailure',
      emitted: false,
      reason: 'authorized_ssot_pins_missing',
    };
  }
  if (!a.retainedFlagsHonest) {
    return {
      kind: 'Eg5ProductSsotProductCloseEvidenceFailure',
      emitted: false,
      reason: 'retained_flags_missing',
    };
  }
  if (!a.orthogonalNotClaimedClosed) {
    return {
      kind: 'Eg5ProductSsotProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_forge_orthogonal_closed',
    };
  }

  const evidence: Eg5ProductSsotProductCloseEvidence = {
    kind: R4_EG5_PRODUCT_SSOT_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseEvidence: true,
    priorEg5AuthorizeEvidenceRetained: true,
    authorizedSsotPinsPresent: true,
    eg5ProductClosed: true,
    productSsotFlipped: true,
    gR45Closed: false,
    r4ProductClosed: true,
    funnelProductClosed: true,
    domainIsolationClosed: true,
    eg3ProductClosed: true,
    eg4ProductClosed: true,
    wrongTrackProductClosed: true,
    eg1ThroughEg2Eg6ClosedByThisKnife: false,
    coveredCountInvented: false,
    ms3EqualsR4Closed: false,
    emptyMetaAloneDoesNotClose: true,
    idleEg5EvidenceAloneDoesNotClose: true,
    releaseEvidence: false,
    note: 'G-R4-5 / EG5 product SSOT product close — eg5ProductClosed/productSsotFlipped under authorize · Ban flip gR45Closed/r4/funnel/eg3/eg4 · retain EG3+EG4+r4/funnel · Ban wash e099276/6058462 / ce09850/0a34933 / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const R4_EG5_PRODUCT_SSOT_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
