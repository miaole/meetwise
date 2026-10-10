/**
 * G-R4-5 / EG3 题域 isolation product close — dedicated prove emitter
 * (domainIsolationClosed / eg3ProductClosed under standing authorize).
 *
 * Honest path:
 *   - Retains live track-local / scoped-retrieve production path assessors.
 *   - Requires authorized SSOT pins (GAP-RAG-04 / m4 §R4 / w0-w8 / r4-domain /
 *     this knife harness) reflecting product-face close under authorize.
 *   - Emits domainIsolationClosed / eg3ProductClosed=true only when assessors +
 *     authorized SSOT honestly support THIS knife (Ban claim R4/FUNNEL/G-R4-5 all /
 *     Ban invent coveredCount / Ban MS3=R4 / Ban wash prior tips).
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - ≠ R4/FUNNEL product all closed · ≠ gR45Closed · ≠ invent coveredCount · Ban forge.
 *   - Ban wash EG3 evidence 62c0e2f/c18e28f or R1 9fec7c7/72233a0 into R4/FUNNEL/G-R4-5 all closed.
 *   - releaseEvidence=false · ≠HA · ≠suite green.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assessDomainIsolationProductEvidence,
  hasDomainIsolationProductEvidence,
} from './r4-eg3-domain-isolation-product-evidence.ts';

export const R4_EG3_DOMAIN_ISOLATION_PRODUCT_CLOSE_EVIDENCE_KIND =
  'Eg3DomainIsolationProductCloseEvidence' as const;

export type Eg3DomainIsolationProductCloseEvidence = {
  readonly kind: typeof R4_EG3_DOMAIN_ISOLATION_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseEvidence: true;
  readonly trackLocalRetrieveDispatchWired: true;
  readonly mainInjectsTrackLocal: true;
  readonly consumerConsumesTrackLocal: true;
  readonly retrieveScopeFailClosedMissingSnapshot: true;
  readonly priorEg3EvidenceRetained: true;
  readonly authorizedSsotPinsPresent: true;
  /** This knife only — under standing authorize + prove. */
  readonly domainIsolationClosed: true;
  readonly eg3ProductClosed: true;
  /** Explicit non-claims (Ban wash / Ban invent). */
  readonly gR45Closed: false;
  readonly r4ProductClosed: false;
  readonly funnelProductClosed: false;
  readonly funnelCoveredAllClosed: false;
  readonly coveredCountInvented: false;
  readonly ms3EqualsR4Closed: false;
  readonly wrongTrackZeroInvented: false;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / EG3 题域 isolation product close — domainIsolationClosed/eg3ProductClosed under authorize · ≠ R4/FUNNEL/G-R4-5 all closed · Ban invent coveredCount · Ban MS3=R4 · Ban wash 62c0e2f/c18e28f / 9fec7c7/72233a0 · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

export type Eg3ProductCloseEvidenceFailure = {
  readonly kind: 'Eg3DomainIsolationProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'prior_eg3_evidence_missing'
    | 'track_local_path_broken'
    | 'authorized_ssot_pins_missing'
    | 'would_forge_orthogonal_closed';
};

export type Eg3ProductCloseEvidenceResult =
  | { readonly emitted: true; readonly evidence: Eg3DomainIsolationProductCloseEvidence }
  | Eg3ProductCloseEvidenceFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export function assessEg3DomainIsolationProductClose(): {
  trackLocalPathHonest: boolean;
  priorEg3EvidenceRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  orthogonalNotClaimedClosed: boolean;
} {
  const pathAssess = assessDomainIsolationProductEvidence();
  const trackLocalPathHonest =
    pathAssess.trackLocalRetrieveDispatchWired
    && pathAssess.mainInjectsTrackLocal
    && pathAssess.consumerConsumesTrackLocal
    && pathAssess.retrieveScopeFailClosedMissingSnapshot
    && pathAssess.wrongTrackZeroProductProven === false;

  // Prior EG3 evidence: dual tip c18e28f · lifecycle nail 62c0e2f (cited in w0-w8 / this knife).
  const priorHarness = readRepo('ai-docs/delivery/harness/g-r4-5-eg3-true-evidence-impl.md');
  const priorReceipt = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg3-domain-isolation-product-evidence.json',
  );
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const r4Harness = readRepo('ai-docs/delivery/harness/r4-domain-isolation.md');
  const r4Status = readRepo('ai-docs/delivery/harness/r4-domain-isolation-status.md');
  const harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg3-domain-isolation-product-close.md',
  );

  const priorEg3EvidenceRetained =
    hasDomainIsolationProductEvidence()
    && /post_prove_dual_pass/.test(priorHarness)
    && (/c18e28f/.test(priorHarness) || /62c0e2f/.test(w0 + harness))
    && /eg3ProductClosed=false/.test(priorHarness)
    && /domainIsolationClosed=false/.test(priorHarness)
    && /"eg3ProductClosed": false/.test(priorReceipt)
    && /"domainIsolationClosed": false/.test(priorReceipt);

  const authorizedSsotPinsPresent =
    /GAP-RAG-04/.test(gap)
    && /domainIsolationClosed=true|eg3ProductClosed=true|题域 isolation product face closed under authorize|EG3 \/ 题域 isolation product face closed under authorize/i.test(
      gap + m4 + w0 + harness,
    )
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /gR45Closed=false/.test(harness)
    && /R4\/FUNNEL|G-R4-5 STILL OPEN|≠ R4\/FUNNEL/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /domainIsolationClosed=true|eg3ProductClosed=true|题域 isolation product face closed under authorize/i.test(
      r4Harness + r4Status + m4,
    )
    && /gR45Closed=false|G-R4-5 STILL OPEN|R4\/FUNNEL product STILL OPEN|≠ invent coveredCount/i.test(
      r4Harness + r4Status + m4 + harness,
    );

  // Ban-text may mention "`gR45Closed=true`" as a forbidden claim — require positive false pin instead.
  const orthogonalNotClaimedClosed =
    /gR45Closed=false/.test(harness)
    && !/\bgR45Closed=true\b/.test(harness.replace(/`gR45Closed=true`/g, ''))
    && !/r4ProductClosed=true/.test(harness)
    && !/funnelProductClosed=true/.test(harness)
    && !/funnelCoveredAllClosed=true/.test(harness)
    && !/ms3EqualsR4Closed=true/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /Ban invent coveredCount|coveredCount.*not invented|≠ invent coveredCount/i.test(harness);

  return {
    trackLocalPathHonest,
    priorEg3EvidenceRetained,
    authorizedSsotPinsPresent,
    orthogonalNotClaimedClosed,
  };
}

export function hasEg3DomainIsolationProductCloseEvidence(): boolean {
  const a = assessEg3DomainIsolationProductClose();
  return (
    a.trackLocalPathHonest
    && a.priorEg3EvidenceRetained
    && a.authorizedSsotPinsPresent
    && a.orthogonalNotClaimedClosed
  );
}

export function emitEg3DomainIsolationProductCloseEvidence(): Eg3ProductCloseEvidenceResult {
  const a = assessEg3DomainIsolationProductClose();
  if (!a.trackLocalPathHonest) {
    return {
      kind: 'Eg3DomainIsolationProductCloseEvidenceFailure',
      emitted: false,
      reason: 'track_local_path_broken',
    };
  }
  if (!a.priorEg3EvidenceRetained) {
    return {
      kind: 'Eg3DomainIsolationProductCloseEvidenceFailure',
      emitted: false,
      reason: 'prior_eg3_evidence_missing',
    };
  }
  if (!a.authorizedSsotPinsPresent) {
    return {
      kind: 'Eg3DomainIsolationProductCloseEvidenceFailure',
      emitted: false,
      reason: 'authorized_ssot_pins_missing',
    };
  }
  if (!a.orthogonalNotClaimedClosed) {
    return {
      kind: 'Eg3DomainIsolationProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_forge_orthogonal_closed',
    };
  }

  const evidence: Eg3DomainIsolationProductCloseEvidence = {
    kind: R4_EG3_DOMAIN_ISOLATION_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseEvidence: true,
    trackLocalRetrieveDispatchWired: true,
    mainInjectsTrackLocal: true,
    consumerConsumesTrackLocal: true,
    retrieveScopeFailClosedMissingSnapshot: true,
    priorEg3EvidenceRetained: true,
    authorizedSsotPinsPresent: true,
    domainIsolationClosed: true,
    eg3ProductClosed: true,
    gR45Closed: false,
    r4ProductClosed: false,
    funnelProductClosed: false,
    funnelCoveredAllClosed: false,
    coveredCountInvented: false,
    ms3EqualsR4Closed: false,
    wrongTrackZeroInvented: false,
    releaseEvidence: false,
    note: 'G-R4-5 / EG3 题域 isolation product close — domainIsolationClosed/eg3ProductClosed under authorize · ≠ R4/FUNNEL/G-R4-5 all closed · Ban invent coveredCount · Ban MS3=R4 · Ban wash 62c0e2f/c18e28f / 9fec7c7/72233a0 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const R4_EG3_DOMAIN_ISOLATION_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
