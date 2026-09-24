/**
 * G-R4-3 / R1 product close — dedicated prove emitter
 * (fail-closed default flip + honest product flags · under standing authorize).
 *
 * Honest path:
 *   - Asserts MEETWISE_TECH_ROLE_FAIL_CLOSED product default flipped away from 0
 *     (empty env ON · worker.env.example=1 · failClosedDefaultStill0=false · defaultFlipped=true).
 *   - Retains live no-legacy / combo-root assessors still pass.
 *   - Emits gR43ProductClosed / r1ProductClosed=true only when flip + assessors +
 *     authorized SSOT pins honestly support THIS knife (Ban claim R4/FUNNEL/题域/G-R4-5/EG).
 *
 * HARD:
 *   - EXIT=0 under authorize ≠ auto lifecycle nail · Ban self-nail post_prove_dual_pass.
 *   - ≠ R4/FUNNEL/题域/G-R4-5/EG1–EG6 product closed · Ban invent coveredCount · Ban forge.
 *   - Ban wash EG6 9b1c83e/3e82f14 or PR1 77c83ce into R4 close.
 *   - releaseEvidence=false · ≠HA · ≠suite green.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADAPTIVE_ROLE_ROUTE_MISSING,
  isTechRoleFailClosedEnabled,
  LEGACY_TECH_ROLE_DEFAULT,
  resolveAdaptiveInterviewRole,
} from './adaptive-role-resolve.ts';
import { hasComboRootFlagOnProductionEvidence } from './r4-pr1b-combo-root-flag-on-evidence.ts';
import { hasDefaultOnNoLegacyPathEvidence } from './r4-pr1c-default-on-no-legacy-evidence.ts';

export const R4_PR1_PRODUCT_CLOSE_EVIDENCE_KIND =
  'GR43R1ProductCloseEvidence' as const;

export type GR43R1ProductCloseEvidence = {
  readonly kind: typeof R4_PR1_PRODUCT_CLOSE_EVIDENCE_KIND;
  readonly productCloseEvidence: true;
  readonly failClosedDefaultStill0: false;
  readonly defaultFlipped: true;
  readonly emptyEnvFailClosedOn: true;
  readonly workerEnvExampleNow1: true;
  readonly noLegacyUnderProductDefault: true;
  readonly legacyOptOutWhenExplicit0: true;
  readonly comboRootFlagOnEvidenceRetained: true;
  readonly defaultOnNoLegacyPathEvidenceRetained: true;
  readonly authorizedSsotPinsPresent: true;
  /** This knife only — under standing authorize + flip + prove. */
  readonly gR43ProductClosed: true;
  readonly r1ProductClosed: true;
  /** Explicit non-claims (Ban wash). */
  readonly r4ProductClosed: false;
  readonly funnelProductClosed: false;
  readonly domainIsolationClosed: false;
  readonly gR45Closed: false;
  readonly eg1ThroughEg6Closed: false;
  readonly releaseEvidence: false;
  readonly note: 'G-R4-3 / R1 product close — default flipped · gR43ProductClosed/r1ProductClosed under authorize · ≠ R4/FUNNEL/题域/G-R4-5/EG closed · Ban forge · Ban self-nail post_prove_dual_pass · await post-prove dual';
};

export type ProductCloseEvidenceFailure = {
  readonly kind: 'GR43R1ProductCloseEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'default_not_flipped'
    | 'empty_env_not_on'
    | 'worker_env_example_not_1'
    | 'no_legacy_under_default_missing'
    | 'legacy_opt_out_broken'
    | 'combo_root_evidence_missing'
    | 'pr1c_evidence_missing'
    | 'authorized_ssot_pins_missing'
    | 'would_forge_orthogonal_closed';
};

export type ProductCloseEvidenceResult =
  | { readonly emitted: true; readonly evidence: GR43R1ProductCloseEvidence }
  | ProductCloseEvidenceFailure;

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export function assessGR43R1ProductClose(): {
  emptyEnvFailClosedOn: boolean;
  workerEnvExampleNow1: boolean;
  noLegacyUnderProductDefault: boolean;
  legacyOptOutWhenExplicit0: boolean;
  comboRootFlagOnEvidenceRetained: boolean;
  defaultOnNoLegacyPathEvidenceRetained: boolean;
  authorizedSsotPinsPresent: boolean;
  defaultFlipped: boolean;
  orthogonalNotClaimedClosed: boolean;
} {
  const emptyEnvFailClosedOn = isTechRoleFailClosedEnabled({}) === true;

  const envExample = readRepo('docker/env/worker.env.example');
  const workerEnvExampleNow1 =
    /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*1/.test(envExample)
    && !/MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample);

  let noLegacyUnderProductDefault = false;
  try {
    resolveAdaptiveInterviewRole({}, {});
    noLegacyUnderProductDefault = false;
  } catch (e) {
    noLegacyUnderProductDefault =
      (e as { code?: string }).code === ADAPTIVE_ROLE_ROUTE_MISSING
      && resolveAdaptiveInterviewRole(
        { roleFromRouteSnapshot: 'product-close-role' },
        {},
      ) === 'product-close-role';
  }

  const legacyOptOutWhenExplicit0 =
    resolveAdaptiveInterviewRole({}, { MEETWISE_TECH_ROLE_FAIL_CLOSED: '0' })
      === LEGACY_TECH_ROLE_DEFAULT;

  const comboRootFlagOnEvidenceRetained = hasComboRootFlagOnProductionEvidence();
  const defaultOnNoLegacyPathEvidenceRetained = hasDefaultOnNoLegacyPathEvidence();

  const gap = readRepo('ai-docs/delivery/gap-bug-backlog.md');
  const m4 = readRepo('ai-docs/delivery/m4-rag-hard-gates.md');
  const w0 = readRepo('ai-docs/delivery/w0-w8-workflow-status.md');
  const harness = readRepo('ai-docs/delivery/harness/g-r4-3-r1-product-close.md');

  // Authorized SSOT must reflect flip + this-knife product close under authorize,
  // while retaining Ban claim R4/FUNNEL/题域/G-R4-5/EG closed + Ban self-nail dual_pass.
  const authorizedSsotPinsPresent =
    /GAP-RAG-01/.test(gap)
    && /defaultFlipped=true|产品默认.*fail-closed|fail-closed.*产品默认|MEETWISE_TECH_ROLE_FAIL_CLOSED.*默认\s*1|default ON/i.test(gap + m4)
    && /gR43ProductClosed=true|r1ProductClosed=true|G-R4-3 \/ R1 product close/.test(w0 + harness)
    && /executed:awaiting_post_prove_dual/.test(harness)
    && /Ban self-nail|Ban自批|awaiting_post_prove_dual/.test(harness)
    && /R4\/FUNNEL|G-R4-5 STILL OPEN|题域 STILL OPEN|EG1–EG6 STILL OPEN/.test(harness)
    && /failClosedDefaultStill0=false/.test(harness)
    && /defaultFlipped=true/.test(harness);

  const defaultFlipped = emptyEnvFailClosedOn && workerEnvExampleNow1;

  // Fail if harness would claim orthogonal products closed.
  const orthogonalNotClaimedClosed =
    !/r4ProductClosed=true/.test(harness)
    && !/gR45Closed=true/.test(harness)
    && !/eg6ProductClosed=true/.test(harness)
    && /releaseEvidence=false/.test(harness);

  return {
    emptyEnvFailClosedOn,
    workerEnvExampleNow1,
    noLegacyUnderProductDefault,
    legacyOptOutWhenExplicit0,
    comboRootFlagOnEvidenceRetained,
    defaultOnNoLegacyPathEvidenceRetained,
    authorizedSsotPinsPresent,
    defaultFlipped,
    orthogonalNotClaimedClosed,
  };
}

export function hasGR43R1ProductCloseEvidence(): boolean {
  const a = assessGR43R1ProductClose();
  return (
    a.defaultFlipped
    && a.emptyEnvFailClosedOn
    && a.workerEnvExampleNow1
    && a.noLegacyUnderProductDefault
    && a.legacyOptOutWhenExplicit0
    && a.comboRootFlagOnEvidenceRetained
    && a.defaultOnNoLegacyPathEvidenceRetained
    && a.authorizedSsotPinsPresent
    && a.orthogonalNotClaimedClosed
  );
}

export function emitGR43R1ProductCloseEvidence(): ProductCloseEvidenceResult {
  const a = assessGR43R1ProductClose();
  if (!a.defaultFlipped) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'default_not_flipped' };
  }
  if (!a.emptyEnvFailClosedOn) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'empty_env_not_on' };
  }
  if (!a.workerEnvExampleNow1) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'worker_env_example_not_1' };
  }
  if (!a.noLegacyUnderProductDefault) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'no_legacy_under_default_missing' };
  }
  if (!a.legacyOptOutWhenExplicit0) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'legacy_opt_out_broken' };
  }
  if (!a.comboRootFlagOnEvidenceRetained) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'combo_root_evidence_missing' };
  }
  if (!a.defaultOnNoLegacyPathEvidenceRetained) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'pr1c_evidence_missing' };
  }
  if (!a.authorizedSsotPinsPresent) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'authorized_ssot_pins_missing' };
  }
  if (!a.orthogonalNotClaimedClosed) {
    return { kind: 'GR43R1ProductCloseEvidenceFailure', emitted: false, reason: 'would_forge_orthogonal_closed' };
  }

  const evidence: GR43R1ProductCloseEvidence = {
    kind: R4_PR1_PRODUCT_CLOSE_EVIDENCE_KIND,
    productCloseEvidence: true,
    failClosedDefaultStill0: false,
    defaultFlipped: true,
    emptyEnvFailClosedOn: true,
    workerEnvExampleNow1: true,
    noLegacyUnderProductDefault: true,
    legacyOptOutWhenExplicit0: true,
    comboRootFlagOnEvidenceRetained: true,
    defaultOnNoLegacyPathEvidenceRetained: true,
    authorizedSsotPinsPresent: true,
    gR43ProductClosed: true,
    r1ProductClosed: true,
    r4ProductClosed: false,
    funnelProductClosed: false,
    domainIsolationClosed: false,
    gR45Closed: false,
    eg1ThroughEg6Closed: false,
    releaseEvidence: false,
    note: 'G-R4-3 / R1 product close — default flipped · gR43ProductClosed/r1ProductClosed under authorize · ≠ R4/FUNNEL/题域/G-R4-5/EG closed · Ban forge · Ban self-nail post_prove_dual_pass · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const R4_PR1_PRODUCT_CLOSE_EMITTER_WIRED = true as const;
