/**
 * G-R4-5 / EG4 wrong-track product close — dedicated prove emitter
 * (eg4ProductClosed / wrongTrackProductClosed under standing authorize).
 *
 * Honest path:
 *   - Retains live wrong_track production-path assessors (EG4 evidence module).
 *   - Requires prior EG4 evidence retained OPEN (tip 3cefebf / dual ec90b6d · flags false).
 *   - Requires authorized SSOT pins (GAP-RAG-04 / m4 §R4 / w0-w8 / wrong-track / this knife)
 *     reflecting product-face close under authorize.
 *   - Emits eg4ProductClosed / wrongTrackProductClosed=true only when assessors +
 *     authorized SSOT honestly support THIS knife.
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - Ban flip gR45Closed / r4ProductClosed / funnelProductClosed this knife (retain).
 *   - Ban wash EG4 evidence 3cefebf/ec90b6d · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854.
 *   - Ban empty meta / idle re-run EG4 evidence alone as fake product close.
 *   - Ban MS3=R4 · Ban closing EG1/2/5/6 · releaseEvidence=false · ≠HA · ≠suite green.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assessWrongTrackProductEvidence,
  hasWrongTrackProductEvidence,
} from './r4-eg4-wrong-track-product-evidence.ts';

export const R4_EG4_WRONG_TRACK_PRODUCT_CLOSE_EVIDENCE_KIND =
  'Eg4WrongTrackProductCloseEvidence' as const;

export type Eg4WrongTrackProductCloseEvidence = {
  readonly kind: typeof R4_EG4_WRONG_TRACK_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseEvidence: true;
  readonly enforceWrongTrackZeroOnServedWired: true;
  readonly productionRequiresTrackLocalFailClosed: true;
  readonly observeTrackLocalWrongTrackOutcome: true;
  readonly priorEg4EvidenceRetained: true;
  readonly authorizedSsotPinsPresent: true;
  /** This knife only — under standing authorize + prove. */
  readonly eg4ProductClosed: true;
  readonly wrongTrackProductClosed: true;
  /** Explicit retain / non-claims (Ban flip / Ban wash). */
  readonly gR45Closed: false;
  readonly r4ProductClosed: true;
  readonly funnelProductClosed: true;
  readonly domainIsolationClosed: true;
  readonly eg3ProductClosed: true;
  readonly eg1ThroughEg2Eg5Eg6ClosedByThisKnife: false;
  readonly coveredCountInvented: false;
  readonly ms3EqualsR4Closed: false;
  readonly wrongTrackZeroInvented: false;
  readonly emptyMetaAloneDoesNotClose: true;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 / EG4 wrong-track product close — eg4ProductClosed/wrongTrackProductClosed under authorize · Ban flip gR45Closed/r4/funnel · retain EG3+r4/funnel · Ban wash 3cefebf/ec90b6d / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

export type Eg4ProductCloseEvidenceFailure = {
  readonly kind: 'Eg4WrongTrackProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'prior_eg4_evidence_missing'
    | 'wrong_track_path_broken'
    | 'authorized_ssot_pins_missing'
    | 'retained_flags_missing'
    | 'would_forge_orthogonal_closed';
};

export type Eg4ProductCloseEvidenceResult =
  | { readonly emitted: true; readonly evidence: Eg4WrongTrackProductCloseEvidence }
  | Eg4ProductCloseEvidenceFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export function assessEg4WrongTrackProductClose(): {
  wrongTrackPathHonest: boolean;
  priorEg4EvidenceRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  retainedFlagsHonest: boolean;
  orthogonalNotClaimedClosed: boolean;
} {
  const pathAssess = assessWrongTrackProductEvidence();
  const wrongTrackPathHonest =
    pathAssess.enforceWrongTrackZeroOnServedWired
    && pathAssess.productionRequiresTrackLocalFailClosed
    && pathAssess.observeTrackLocalWrongTrackOutcome
    && pathAssess.coveredPathAloneDoesNotClose
    && pathAssess.metaProveAloneDoesNotClose;

  const priorHarness = readRepo('ai-docs/delivery/harness/g-r4-5-eg4-true-evidence-impl.md');
  const priorReceipt = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg4-wrong-track-product-evidence.json',
  );
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const harness = readRepo(
    'ai-docs/delivery/harness/g-r4-5-eg4-wrong-track-product-close.md',
  );
  const ssotBlob = gap + m4 + w0 + harness;

  const priorEg4EvidenceRetained =
    hasWrongTrackProductEvidence()
    && /post_prove_dual_pass/.test(priorHarness)
    && (/ec90b6d/.test(priorHarness) || /3cefebf/.test(w0 + harness + priorHarness))
    && /eg4ProductClosed=false/.test(priorHarness)
    && /wrongTrackProductClosed=false/.test(priorHarness)
    && /"eg4ProductClosed": false/.test(priorReceipt)
    && /"wrongTrackProductClosed": false/.test(priorReceipt);

  const authorizedSsotPinsPresent =
    /GAP-RAG-04/.test(gap)
    && /eg4ProductClosed=true|wrongTrackProductClosed=true|EG4 \/ wrong-track product face closed under authorize|EG4 wrong-track product face closed under authorize/i.test(
      ssotBlob,
    )
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /gR45Closed=false/.test(harness)
    && /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /G-R4-5 STILL OPEN|≠ G-R4-5 all closed/i.test(harness);

  const retainedFlagsHonest =
    /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /gR45Closed=false/.test(harness)
    && /Ban flip.*gR45Closed|Ban flip `gR45Closed`|Ban.*flip `gR45Closed`|Ban flip gR45/i.test(
      harness,
    );

  // Ban-text may mention "`gR45Closed=true`" as forbidden — require positive false pin.
  const orthogonalNotClaimedClosed =
    /gR45Closed=false/.test(harness)
    && !/\bgR45Closed=true\b/.test(harness.replace(/`gR45Closed=true`/g, ''))
    && !/ms3EqualsR4Closed=true/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /Ban invent coveredCount|coveredCount.*not invented|≠ invent coveredCount/i.test(harness)
    && /Ban closing EG1|Ban closing EG1\/2\/5\/6|EG1\/2\/5\/6 product \*\*NOT\*\*|EG1\/2\/5\/6/.test(
      harness,
    );

  return {
    wrongTrackPathHonest,
    priorEg4EvidenceRetained,
    authorizedSsotPinsPresent,
    retainedFlagsHonest,
    orthogonalNotClaimedClosed,
  };
}

export function hasEg4WrongTrackProductCloseEvidence(): boolean {
  const a = assessEg4WrongTrackProductClose();
  return (
    a.wrongTrackPathHonest
    && a.priorEg4EvidenceRetained
    && a.authorizedSsotPinsPresent
    && a.retainedFlagsHonest
    && a.orthogonalNotClaimedClosed
  );
}

export function emitEg4WrongTrackProductCloseEvidence(): Eg4ProductCloseEvidenceResult {
  const a = assessEg4WrongTrackProductClose();
  if (!a.wrongTrackPathHonest) {
    return {
      kind: 'Eg4WrongTrackProductCloseEvidenceFailure',
      emitted: false,
      reason: 'wrong_track_path_broken',
    };
  }
  if (!a.priorEg4EvidenceRetained) {
    return {
      kind: 'Eg4WrongTrackProductCloseEvidenceFailure',
      emitted: false,
      reason: 'prior_eg4_evidence_missing',
    };
  }
  if (!a.authorizedSsotPinsPresent) {
    return {
      kind: 'Eg4WrongTrackProductCloseEvidenceFailure',
      emitted: false,
      reason: 'authorized_ssot_pins_missing',
    };
  }
  if (!a.retainedFlagsHonest) {
    return {
      kind: 'Eg4WrongTrackProductCloseEvidenceFailure',
      emitted: false,
      reason: 'retained_flags_missing',
    };
  }
  if (!a.orthogonalNotClaimedClosed) {
    return {
      kind: 'Eg4WrongTrackProductCloseEvidenceFailure',
      emitted: false,
      reason: 'would_forge_orthogonal_closed',
    };
  }

  const evidence: Eg4WrongTrackProductCloseEvidence = {
    kind: R4_EG4_WRONG_TRACK_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseEvidence: true,
    enforceWrongTrackZeroOnServedWired: true,
    productionRequiresTrackLocalFailClosed: true,
    observeTrackLocalWrongTrackOutcome: true,
    priorEg4EvidenceRetained: true,
    authorizedSsotPinsPresent: true,
    eg4ProductClosed: true,
    wrongTrackProductClosed: true,
    gR45Closed: false,
    r4ProductClosed: true,
    funnelProductClosed: true,
    domainIsolationClosed: true,
    eg3ProductClosed: true,
    eg1ThroughEg2Eg5Eg6ClosedByThisKnife: false,
    coveredCountInvented: false,
    ms3EqualsR4Closed: false,
    wrongTrackZeroInvented: false,
    emptyMetaAloneDoesNotClose: true,
    releaseEvidence: false,
    note: 'G-R4-5 / EG4 wrong-track product close — eg4ProductClosed/wrongTrackProductClosed under authorize · Ban flip gR45Closed/r4/funnel · retain EG3+r4/funnel · Ban wash 3cefebf/ec90b6d / 2b38e18/14e9e2c / 7be1a55/5b3c854 · Ban empty meta · Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const R4_EG4_WRONG_TRACK_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
