/**
 * G-R4-3 PR1-B — combo-root / flag-on **production** evidence emitter.
 *
 * Honest path (Ban forge):
 *   - Anchors to real 组合根 production wiring (main.ts bootstrap + interview-consumer
 *     resolveAdaptiveInterviewRole under fail-closed=1 with route snapshot leaf).
 *   - Live resolveAdaptiveInterviewRole checks under MEETWISE_TECH_ROLE_FAIL_CLOSED=1.
 *   - Emits JSON receipt only when checks pass · classifier true only from this evidence.
 *
 * HARD:
 *   - Evidence emit ≠ PR1-B product closed · ≠ G-R4-3 closed · ≠ R1 product closed.
 *   - Ban forge · Ban silent flip default · Ban claim closed from EXIT=0 · releaseEvidence=false · ≠HA.
 *   - Ban idle re-run of the same 3×prove (r1/F4/m4) as fake close — this module is the
 *     PR1-B-specific evidence path those three CMDs never emitted.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADAPTIVE_ROLE_ROUTE_MISSING,
  resolveAdaptiveInterviewRole,
} from './adaptive-role-resolve.ts';

/** Canonical PR1-B combo-root / flag-on production evidence kind. */
export const PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_KIND =
  'ComboRootFlagOnProductionEvidence' as const;

export type ComboRootFlagOnProductionEvidence = {
  readonly kind: typeof PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_KIND;
  /** Live + source: combo-root production path under fail-closed=1. */
  readonly comboRootFlagOnEvidence: true;
  readonly comboRootMainWired: true;
  readonly interviewConsumerFlagOnRouteResolveWired: true;
  readonly flagOnWithRouteAccepted: true;
  readonly flagOnWithoutRouteFailClosed: true;
  readonly noSilentTechRoleInjectAtComboRoot: true;
  /** Explicit non-claims retained on the receipt itself. */
  readonly gR43Closed: false;
  readonly r1ProductClosed: false;
  readonly pr1BProductClosed: false;
  readonly releaseEvidence: false;
  readonly note: 'PR1-B combo-root/flag-on production evidence — emitted · ≠ PR1-B/G-R4-3/R1 product closed · Ban forge · await post-prove dual';
};

export type Pr1bEvidenceFailure = {
  readonly kind: 'Pr1bComboRootFlagOnEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'combo_root_main_not_wired'
    | 'interview_consumer_flag_on_not_wired'
    | 'flag_on_with_route_rejected'
    | 'flag_on_without_route_not_fail_closed'
    | 'silent_tech_role_inject_at_combo_root';
};

export type Pr1bEvidenceResult =
  | { readonly emitted: true; readonly evidence: ComboRootFlagOnProductionEvidence }
  | Pr1bEvidenceFailure;

function workerSrcDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)));
}

function readSrc(name: string): string {
  const p = join(workerSrcDir(), name);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

/**
 * Assess whether honest combo-root / flag-on production evidence can be emitted.
 * Fail-closed: every production-path check must pass (Ban forge).
 */
export function assessComboRootFlagOnProductionEvidence(): {
  comboRootMainWired: boolean;
  interviewConsumerFlagOnRouteResolveWired: boolean;
  flagOnWithRouteAccepted: boolean;
  flagOnWithoutRouteFailClosed: boolean;
  noSilentTechRoleInjectAtComboRoot: boolean;
} {
  const main = readSrc('main.ts');
  const consumer = readSrc('interview-consumer.ts');

  const comboRootMainWired =
    /组合根/.test(main)
    && /resolveAdaptiveInterviewRole/.test(main)
    && /MEETWISE_TECH_ROLE_FAIL_CLOSED/.test(main)
    && /runInterviewConsumer/.test(main);

  const interviewConsumerFlagOnRouteResolveWired =
    /isTechRoleFailClosedEnabled/.test(consumer)
    && /resolveAdaptiveInterviewRole/.test(consumer)
    && /roleFromRouteSnapshot/.test(consumer)
    && /leafTrackId/.test(consumer)
    && /adaptive_role_route_missing|fail-closed|R1 \/ GAP-RAG-01/.test(consumer);

  let flagOnWithRouteAccepted = false;
  try {
    const role = resolveAdaptiveInterviewRole(
      { roleFromRouteSnapshot: 'backend-combo-root' },
      { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' },
    );
    flagOnWithRouteAccepted = role === 'backend-combo-root';
  } catch {
    flagOnWithRouteAccepted = false;
  }

  let flagOnWithoutRouteFailClosed = false;
  try {
    resolveAdaptiveInterviewRole({}, { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' });
    flagOnWithoutRouteFailClosed = false;
  } catch (e) {
    flagOnWithoutRouteFailClosed =
      (e as { code?: string }).code === ADAPTIVE_ROLE_ROUTE_MISSING;
  }

  const noSilentTechRoleInjectAtComboRoot =
    !/role:\s*['"]技术岗['"]/.test(main)
    && !/\?\?\s*['"]技术岗['"]/.test(consumer)
    && /resolveAdaptiveInterviewRole/.test(consumer);

  return {
    comboRootMainWired,
    interviewConsumerFlagOnRouteResolveWired,
    flagOnWithRouteAccepted,
    flagOnWithoutRouteFailClosed,
    noSilentTechRoleInjectAtComboRoot,
  };
}

/** True only when every production-path check passes (Ban forge hardcode). */
export function hasComboRootFlagOnProductionEvidence(): boolean {
  const a = assessComboRootFlagOnProductionEvidence();
  return (
    a.comboRootMainWired
    && a.interviewConsumerFlagOnRouteResolveWired
    && a.flagOnWithRouteAccepted
    && a.flagOnWithoutRouteFailClosed
    && a.noSilentTechRoleInjectAtComboRoot
  );
}

/**
 * Emit honest PR1-B combo-root / flag-on production evidence.
 * Fail-closed: refuse to emit if any required check is false (Ban forge).
 */
export function emitComboRootFlagOnProductionEvidence(): Pr1bEvidenceResult {
  const a = assessComboRootFlagOnProductionEvidence();
  if (!a.comboRootMainWired) {
    return { kind: 'Pr1bComboRootFlagOnEvidenceFailure', emitted: false, reason: 'combo_root_main_not_wired' };
  }
  if (!a.interviewConsumerFlagOnRouteResolveWired) {
    return {
      kind: 'Pr1bComboRootFlagOnEvidenceFailure',
      emitted: false,
      reason: 'interview_consumer_flag_on_not_wired',
    };
  }
  if (!a.flagOnWithRouteAccepted) {
    return {
      kind: 'Pr1bComboRootFlagOnEvidenceFailure',
      emitted: false,
      reason: 'flag_on_with_route_rejected',
    };
  }
  if (!a.flagOnWithoutRouteFailClosed) {
    return {
      kind: 'Pr1bComboRootFlagOnEvidenceFailure',
      emitted: false,
      reason: 'flag_on_without_route_not_fail_closed',
    };
  }
  if (!a.noSilentTechRoleInjectAtComboRoot) {
    return {
      kind: 'Pr1bComboRootFlagOnEvidenceFailure',
      emitted: false,
      reason: 'silent_tech_role_inject_at_combo_root',
    };
  }

  const evidence: ComboRootFlagOnProductionEvidence = {
    kind: PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_KIND,
    comboRootFlagOnEvidence: true,
    comboRootMainWired: true,
    interviewConsumerFlagOnRouteResolveWired: true,
    flagOnWithRouteAccepted: true,
    flagOnWithoutRouteFailClosed: true,
    noSilentTechRoleInjectAtComboRoot: true,
    gR43Closed: false,
    r1ProductClosed: false,
    pr1BProductClosed: false,
    releaseEvidence: false,
    note: 'PR1-B combo-root/flag-on production evidence — emitted · ≠ PR1-B/G-R4-3/R1 product closed · Ban forge · await post-prove dual',
  };
  return { emitted: true, evidence };
}

/** Marker: this module is the PR1-B evidence emitter (≠ idle 3×prove). */
export const PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_EMITTER_WIRED = true as const;
