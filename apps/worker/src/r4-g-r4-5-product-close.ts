/**
 * G-R4-5 aggregate product close — dedicated prove emitter
 * (`gR45Closed` under standing authorize · live aggregate evidence gate).
 *
 * Honest path:
 *   - Live `canHonestlyFlip` verifies EG1–EG6 + R4/FUNNEL product faces + coveredCount=8
 *     + ms3EqualsR4Closed=false retained — do NOT wash prior tips alone into closed.
 *   - Requires authorized SSOT pins (GAP-RAG-04 / m4 §R4 / w0-w8 / product-ssot /
 *     this knife) reflecting aggregate close under authorize when flipping.
 *   - Emits gR45Closed=true ONLY when canHonestlyFlip live; else NON-FLIP keep false + pin reason.
 *   - Ban假关 · Ban invent coveredCount · Ban MS3=R4 · Ban empty meta · Ban idle single-EG fake close.
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - Ban claim HA / suite / releaseEvidence=true · G-R4-5 closed ≠ HA/cutover/suite.
 *   - Ban wash EG1 88277ee/4a0877d · EG2 a34421a/2d3f055 · EG3 7be1a55/5b3c854 ·
 *     EG4 ce09850/0a34933 · EG5 33f457b/7f59b95 · EG6 315570d/757fbe1 · R4·FUNNEL 2b38e18/14e9e2c
 *     alone into gR45Closed without this dedicated prove + live gate.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const R4_G_R4_5_PRODUCT_CLOSE_EVIDENCE_KIND =
  'GR45AggregateProductCloseEvidence' as const;

export type GR45AggregateProductCloseEvidence = {
  readonly kind: typeof R4_G_R4_5_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseEvidence: true;
  readonly canHonestlyFlip: true;
  readonly authorizedSsotPinsPresent: true;
  /** This knife — under standing authorize + live aggregate gate. */
  readonly gR45Closed: true;
  readonly flipReason: 'live_aggregate_gate_canHonestlyFlip';
  /** Retained faces / pins. */
  readonly eg1ProductClosed: true;
  readonly gR45DualClaimClosed: true;
  readonly eg2ProductClosed: true;
  readonly coveredCount: 8;
  readonly coveredCountInvented: false;
  readonly eg3ProductClosed: true;
  readonly domainIsolationClosed: true;
  readonly eg4ProductClosed: true;
  readonly wrongTrackProductClosed: true;
  readonly eg5ProductClosed: true;
  readonly productSsotFlipped: true;
  readonly eg6ProductClosed: true;
  readonly ms3EqualsR4Closed: false;
  readonly r4ProductClosed: true;
  readonly funnelProductClosed: true;
  readonly emptyMetaAloneDoesNotClose: true;
  readonly idleSingleEgAloneDoesNotClose: true;
  readonly priorTipsAloneDoNotClose: true;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-5 aggregate product close — gR45Closed under authorize · canHonestlyFlip live · retain eg1–eg6 + r4/funnel · coveredCount=8 · ms3EqualsR4Closed=false · Ban wash prior tips alone · Ban invent coveredCount · Ban MS3=R4 · Ban empty meta · Ban idle single-EG fake close · Ban self-nail post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠suite · await post-prove dual';
};

export type GR45ProductCloseEvidenceFailure = {
  readonly kind: 'GR45AggregateProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly gR45Closed: false;
  readonly canHonestlyFlip: false;
  readonly nonFlipPin: string;
  readonly reason:
    | 'live_prereqs_missing'
    | 'authorized_ssot_pins_missing'
    | 'retained_flags_missing'
    | 'would_forge_orthogonal_closed'
    | 'canHonestlyFlip_false';
};

export type GR45ProductCloseEvidenceResult =
  | { readonly emitted: true; readonly evidence: GR45AggregateProductCloseEvidence }
  | GR45ProductCloseEvidenceFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export type GR45AggregateGateAssessment = {
  eg1Live: boolean;
  eg2Live: boolean;
  eg3Live: boolean;
  eg4Live: boolean;
  eg5Live: boolean;
  eg6Live: boolean;
  r4FunnelLive: boolean;
  coveredCountEight: boolean;
  ms3EqualsR4ClosedFalse: boolean;
  authorizedSsotPinsPresent: boolean;
  retainedFlagsHonest: boolean;
  orthogonalNotForged: boolean;
  canHonestlyFlip: boolean;
  nonFlipPin: string | null;
};

export function assessGR45AggregateProductClose(): GR45AggregateGateAssessment {
  const eg1 = readRepo('ai-docs/delivery/harness/g-r4-5-eg1-dual-claim-product-close.md');
  const eg2 = readRepo('ai-docs/delivery/harness/g-r4-5-eg2-funnel-covered-product-close.md');
  const eg3 = readRepo('ai-docs/delivery/harness/g-r4-5-eg3-domain-isolation-product-close.md');
  const eg4 = readRepo('ai-docs/delivery/harness/g-r4-5-eg4-wrong-track-product-close.md');
  const eg5 = readRepo('ai-docs/delivery/harness/g-r4-5-eg5-product-ssot-product-close.md');
  const eg6 = readRepo('ai-docs/delivery/harness/g-r4-5-eg6-ms3-ne-r4-product-close.md');
  const r4 = readRepo('ai-docs/delivery/harness/g-r4-5-r4-funnel-product-close-reassess.md');
  const harness = readRepo('ai-docs/delivery/harness/g-r4-5-product-close.md');
  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const eg1Ev = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg1-dual-claim-product-close-evidence.json',
  );
  const eg2Ev = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg2-funnel-covered-product-close-evidence.json',
  );
  const eg3Ev = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg3-domain-isolation-product-close-evidence.json',
  );
  const eg4Ev = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg4-wrong-track-product-close-evidence.json',
  );
  const eg5Ev = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg5-product-ssot-product-close-evidence.json',
  );
  const eg6Ev = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg6-ms3-ne-r4-product-close-evidence.json',
  );
  const r4Ev = readRepo(
    'ai-docs/delivery/receipts/2026-09-23-g-r4-5-r4-funnel-product-close-evidence.json',
  );
  const tipBlob = eg1 + eg2 + eg3 + eg4 + eg5 + eg6 + r4 + harness + w0 + gap + m4;
  const ssotBlob = gap + m4 + w0 + harness;

  // EG1 dual-claim · 88277ee/4a0877d — live flags + evidence + tip refs (Ban tip-alone wash).
  const eg1Live =
    /eg1ProductClosed=true/.test(eg1)
    && /gR45DualClaimClosed=true/.test(eg1)
    && /post_prove_dual_pass|executed:awaiting_post_prove_dual/.test(eg1)
    && /4a0877d/.test(eg1 + tipBlob)
    && /88277ee/.test(tipBlob)
    && /"eg1ProductClosed":\s*true/.test(eg1Ev)
    && /"gR45DualClaimClosed":\s*true/.test(eg1Ev)
    && /"gR45Closed":\s*false/.test(eg1Ev);

  // EG2 funnel-covered · a34421a/2d3f055 · coveredCount=8.
  const eg2Live =
    /eg2ProductClosed=true/.test(eg2)
    && /coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount=8/.test(eg2)
    && /post_prove_dual_pass|executed:awaiting_post_prove_dual/.test(eg2)
    && /2d3f055/.test(eg2 + tipBlob)
    && /a34421a/.test(tipBlob)
    && /"eg2ProductClosed":\s*true/.test(eg2Ev)
    && /"coveredCount":\s*8/.test(eg2Ev)
    && /"coveredCountInvented":\s*false/.test(eg2Ev);

  // EG3 domain-isolation · 7be1a55/5b3c854.
  const eg3Live =
    /eg3ProductClosed=true/.test(eg3)
    && /domainIsolationClosed=true/.test(eg3)
    && /post_prove_dual_pass|executed:awaiting_post_prove_dual/.test(eg3)
    && /5b3c854/.test(eg3 + tipBlob)
    && /7be1a55/.test(tipBlob)
    && /"eg3ProductClosed":\s*true/.test(eg3Ev)
    && /"domainIsolationClosed":\s*true/.test(eg3Ev);

  // EG4 wrong-track · ce09850/0a34933.
  const eg4Live =
    /eg4ProductClosed=true/.test(eg4)
    && /wrongTrackProductClosed=true/.test(eg4)
    && /post_prove_dual_pass|executed:awaiting_post_prove_dual/.test(eg4)
    && /0a34933/.test(eg4 + tipBlob)
    && /ce09850/.test(tipBlob)
    && /"eg4ProductClosed":\s*true/.test(eg4Ev)
    && /"wrongTrackProductClosed":\s*true/.test(eg4Ev);

  // EG5 product-SSOT · 33f457b/7f59b95.
  const eg5Live =
    /eg5ProductClosed=true/.test(eg5)
    && /productSsotFlipped=true/.test(eg5)
    && /post_prove_dual_pass|executed:awaiting_post_prove_dual/.test(eg5)
    && /7f59b95/.test(eg5 + tipBlob)
    && /33f457b/.test(tipBlob)
    && /"eg5ProductClosed":\s*true/.test(eg5Ev)
    && /"productSsotFlipped":\s*true/.test(eg5Ev);

  // EG6 MS3≠R4 · 315570d/757fbe1 · ms3EqualsR4Closed=false retained.
  const eg6Live =
    /eg6ProductClosed=true/.test(eg6)
    && /ms3EqualsR4Closed=false/.test(eg6)
    && /post_prove_dual_pass|executed:awaiting_post_prove_dual/.test(eg6)
    && /757fbe1/.test(eg6 + tipBlob)
    && /315570d/.test(tipBlob)
    && /"eg6ProductClosed":\s*true/.test(eg6Ev)
    && /"ms3EqualsR4Closed":\s*false/.test(eg6Ev);

  // R4 + funnel · 2b38e18/14e9e2c.
  const r4FunnelLive =
    /r4ProductClosed=true/.test(r4)
    && /funnelProductClosed=true/.test(r4)
    && /post_prove_dual_pass|executed:awaiting_post_prove_dual/.test(r4)
    && /14e9e2c/.test(r4 + tipBlob)
    && /2b38e18/.test(tipBlob)
    && (/\"r4ProductClosed\":\s*true/.test(r4Ev) || /r4ProductClosed=true/.test(r4))
    && (/\"funnelProductClosed\":\s*true/.test(r4Ev) || /funnelProductClosed=true/.test(r4));

  const coveredCountEight =
    (/coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount=8/.test(eg2)
      || /"coveredCount":\s*8/.test(eg2Ev))
    && /coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount=8/.test(harness)
    && /Ban invent coveredCount|coveredCount.*not invented|≠ invent coveredCount/i.test(harness);

  const ms3EqualsR4ClosedFalse =
    /ms3EqualsR4Closed=false/.test(eg6)
    && /ms3EqualsR4Closed=false/.test(harness)
    && !/ms3EqualsR4Closed=true/.test(harness)
    && /Ban flip.*ms3EqualsR4Closed|Ban claim R4 from MS3|MS3 ≠ R4|Ban MS3=R4/i.test(harness);

  const authorizedSsotPinsPresent =
    /GAP-RAG-04/.test(gap)
    && /gR45Closed=true|G-R4-5 aggregate product (face )?closed under authorize|aggregate product close under authorize/i.test(
      ssotBlob,
    )
    && /gR45Closed=true/.test(harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /canHonestlyFlip/.test(harness)
    && /eg1ProductClosed=true/.test(harness)
    && /gR45DualClaimClosed=true/.test(harness)
    && /eg2ProductClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /eg5ProductClosed=true/.test(harness)
    && /productSsotFlipped=true/.test(harness)
    && /eg6ProductClosed=true/.test(harness)
    && /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /ms3EqualsR4Closed=false/.test(harness)
    && /coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount=8/.test(harness)
    && /releaseEvidence=false/.test(harness)
    && /≠HA|≠ HA|Not HA/i.test(harness);

  const retainedFlagsHonest =
    /eg1ProductClosed=true/.test(harness)
    && /gR45DualClaimClosed=true/.test(harness)
    && /eg2ProductClosed=true/.test(harness)
    && /eg3ProductClosed=true/.test(harness)
    && /domainIsolationClosed=true/.test(harness)
    && /eg4ProductClosed=true/.test(harness)
    && /wrongTrackProductClosed=true/.test(harness)
    && /eg5ProductClosed=true/.test(harness)
    && /productSsotFlipped=true/.test(harness)
    && /eg6ProductClosed=true/.test(harness)
    && /r4ProductClosed=true/.test(harness)
    && /funnelProductClosed=true/.test(harness)
    && /ms3EqualsR4Closed=false/.test(harness)
    && /coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount=8/.test(harness)
    && /Ban invent coveredCount/i.test(harness)
    && /Ban.*MS3=R4|Ban flip.*ms3EqualsR4Closed|Ban claim R4 from MS3/i.test(harness);

  // Ban-text may mention "`releaseEvidence=true`" as a forbidden claim — strip backticks/Ban cites.
  const harnessSansBanReleaseTrue = harness
    .replace(/`releaseEvidence=true`/g, '')
    .replace(/Ban[^\n]{0,80}releaseEvidence=true/gi, '');
  const orthogonalNotForged =
    /releaseEvidence=false/.test(harness)
    && !/releaseEvidence=true/.test(harnessSansBanReleaseTrue)
    && /Ban invent coveredCount/i.test(harness)
    && /Ban idle re-run only single-EG|idleSingleEgAloneDoesNotClose|Ban idle re-run only single-EG proves/i.test(
      harness,
    )
    && /Ban wash|priorTipsAloneDoNotClose|≠ wash/i.test(harness)
    && /≠HA|≠ HA|Not HA|≠suite|≠ suite/i.test(harness)
    && /Ban self-nail|Ban自批/.test(harness);

  const livePrereqs =
    eg1Live
    && eg2Live
    && eg3Live
    && eg4Live
    && eg5Live
    && eg6Live
    && r4FunnelLive
    && coveredCountEight
    && ms3EqualsR4ClosedFalse;

  const canHonestlyFlip =
    livePrereqs
    && authorizedSsotPinsPresent
    && retainedFlagsHonest
    && orthogonalNotForged;

  let nonFlipPin: string | null = null;
  if (!canHonestlyFlip) {
    const missing: string[] = [];
    if (!eg1Live) missing.push('eg1Live');
    if (!eg2Live) missing.push('eg2Live');
    if (!eg3Live) missing.push('eg3Live');
    if (!eg4Live) missing.push('eg4Live');
    if (!eg5Live) missing.push('eg5Live');
    if (!eg6Live) missing.push('eg6Live');
    if (!r4FunnelLive) missing.push('r4FunnelLive');
    if (!coveredCountEight) missing.push('coveredCountEight');
    if (!ms3EqualsR4ClosedFalse) missing.push('ms3EqualsR4ClosedFalse');
    if (!authorizedSsotPinsPresent) missing.push('authorizedSsotPinsPresent');
    if (!retainedFlagsHonest) missing.push('retainedFlagsHonest');
    if (!orthogonalNotForged) missing.push('orthogonalNotForged');
    nonFlipPin = `canHonestlyFlip=false · missing=${missing.join(',')}`;
  }

  return {
    eg1Live,
    eg2Live,
    eg3Live,
    eg4Live,
    eg5Live,
    eg6Live,
    r4FunnelLive,
    coveredCountEight,
    ms3EqualsR4ClosedFalse,
    authorizedSsotPinsPresent,
    retainedFlagsHonest,
    orthogonalNotForged,
    canHonestlyFlip,
    nonFlipPin,
  };
}

export function hasGR45AggregateProductCloseEvidence(): boolean {
  return assessGR45AggregateProductClose().canHonestlyFlip;
}

export function emitGR45AggregateProductCloseEvidence(): GR45ProductCloseEvidenceResult {
  const a = assessGR45AggregateProductClose();
  if (!a.canHonestlyFlip) {
    return {
      kind: 'GR45AggregateProductCloseEvidenceFailure',
      emitted: false,
      gR45Closed: false,
      canHonestlyFlip: false,
      nonFlipPin: a.nonFlipPin ?? 'canHonestlyFlip=false',
      reason: !a.eg1Live || !a.eg2Live || !a.eg3Live || !a.eg4Live || !a.eg5Live || !a.eg6Live || !a.r4FunnelLive || !a.coveredCountEight || !a.ms3EqualsR4ClosedFalse
        ? 'live_prereqs_missing'
        : !a.authorizedSsotPinsPresent
          ? 'authorized_ssot_pins_missing'
          : !a.retainedFlagsHonest
            ? 'retained_flags_missing'
            : !a.orthogonalNotForged
              ? 'would_forge_orthogonal_closed'
              : 'canHonestlyFlip_false',
    };
  }

  const evidence: GR45AggregateProductCloseEvidence = {
    kind: R4_G_R4_5_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseEvidence: true,
    canHonestlyFlip: true,
    authorizedSsotPinsPresent: true,
    gR45Closed: true,
    flipReason: 'live_aggregate_gate_canHonestlyFlip',
    eg1ProductClosed: true,
    gR45DualClaimClosed: true,
    eg2ProductClosed: true,
    coveredCount: 8,
    coveredCountInvented: false,
    eg3ProductClosed: true,
    domainIsolationClosed: true,
    eg4ProductClosed: true,
    wrongTrackProductClosed: true,
    eg5ProductClosed: true,
    productSsotFlipped: true,
    eg6ProductClosed: true,
    ms3EqualsR4Closed: false,
    r4ProductClosed: true,
    funnelProductClosed: true,
    emptyMetaAloneDoesNotClose: true,
    idleSingleEgAloneDoesNotClose: true,
    priorTipsAloneDoNotClose: true,
    releaseEvidence: false,
    note: 'G-R4-5 aggregate product close — gR45Closed under authorize · canHonestlyFlip live · retain eg1–eg6 + r4/funnel · coveredCount=8 · ms3EqualsR4Closed=false · Ban wash prior tips alone · Ban invent coveredCount · Ban MS3=R4 · Ban empty meta · Ban idle single-EG fake close · Ban self-nail post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠suite · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const R4_G_R4_5_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
