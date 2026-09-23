/**
 * G-R4-3 PR1-C — default-on / **no-legacy** path evidence emitter (Ban silent flip).
 *
 * Honest path:
 *   - Documents + verifies the no-legacy (fail-closed ON) code path exists at the
 *     combo-root / resolver / consumer surfaces.
 *   - Proves empty-env + worker.env.example default remain **0** (Ban silent flip).
 *   - Exercises no-legacy behavior only under explicit runtime flag=1 (not product default).
 *
 * HARD:
 *   - Evidence emit ≠ PR1-C product closed · ≠ G-R4-3 closed · ≠ R1 product closed.
 *   - Ban silent flip MEETWISE_TECH_ROLE_FAIL_CLOSED default · Ban claim closed from EXIT=0.
 *   - Ban idle re-run of the same 3×prove as fake close — this is the PR1-C-specific path.
 *   - releaseEvidence=false · ≠HA.
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

/** Canonical PR1-C default-on / no-legacy path evidence kind. */
export const PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND =
  'DefaultOnNoLegacyPathEvidence' as const;

export type DefaultOnNoLegacyPathEvidence = {
  readonly kind: typeof PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND;
  /** No-legacy path exists (flag-on behavior) without flipping product default. */
  readonly defaultOnNoLegacyPathEvidence: true;
  readonly noLegacyPathUnderExplicitFlagOn: true;
  readonly legacyPathStillWhenFlagOff: true;
  /** Honesty: product default still 0 · not flipped. */
  readonly failClosedDefaultStill0: true;
  readonly defaultFlipped: false;
  readonly workerEnvExampleStill0: true;
  readonly emptyEnvFailClosedOff: true;
  /** Explicit non-claims. */
  readonly gR43Closed: false;
  readonly r1ProductClosed: false;
  readonly pr1CProductClosed: false;
  readonly releaseEvidence: false;
  readonly note: 'PR1-C default-on/no-legacy path evidence — default still 0 · ≠ flip · ≠ PR1-C/G-R4-3/R1 product closed · Ban forge · await post-prove dual';
};

export type Pr1cEvidenceFailure = {
  readonly kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'empty_env_not_off'
    | 'worker_env_example_not_0'
    | 'no_legacy_path_missing'
    | 'legacy_path_broken_when_flag_off'
    | 'default_appears_flipped';
};

export type Pr1cEvidenceResult =
  | { readonly emitted: true; readonly evidence: DefaultOnNoLegacyPathEvidence }
  | Pr1cEvidenceFailure;

function repoRootFromSrc(): string {
  // apps/worker/src → repo root
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readWorkerEnvExample(): string {
  const p = join(repoRootFromSrc(), 'docker/env/worker.env.example');
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

export function assessDefaultOnNoLegacyPathEvidence(): {
  emptyEnvFailClosedOff: boolean;
  workerEnvExampleStill0: boolean;
  noLegacyPathUnderExplicitFlagOn: boolean;
  legacyPathStillWhenFlagOff: boolean;
  defaultFlipped: boolean;
} {
  const emptyEnvFailClosedOff = isTechRoleFailClosedEnabled({}) === false;

  const envExample = readWorkerEnvExample();
  const workerEnvExampleStill0 =
    /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample)
    && !/MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*1/.test(envExample);

  let noLegacyPathUnderExplicitFlagOn = false;
  try {
    resolveAdaptiveInterviewRole({}, { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' });
    noLegacyPathUnderExplicitFlagOn = false;
  } catch (e) {
    const failClosed =
      (e as { code?: string }).code === ADAPTIVE_ROLE_ROUTE_MISSING;
    const withRoute =
      resolveAdaptiveInterviewRole(
        { roleFromRouteSnapshot: 'no-legacy-path' },
        { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' },
      ) === 'no-legacy-path';
    // no-legacy = no silent 技术岗 under flag-on; deps alone must NOT bypass
    let depsAloneFailClosed = false;
    try {
      resolveAdaptiveInterviewRole(
        { roleFromDeps: LEGACY_TECH_ROLE_DEFAULT },
        { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' },
      );
      depsAloneFailClosed = false;
    } catch (e2) {
      depsAloneFailClosed =
        (e2 as { code?: string }).code === ADAPTIVE_ROLE_ROUTE_MISSING;
    }
    noLegacyPathUnderExplicitFlagOn = failClosed && withRoute && depsAloneFailClosed;
  }

  const legacyPathStillWhenFlagOff =
    resolveAdaptiveInterviewRole({}, { MEETWISE_TECH_ROLE_FAIL_CLOSED: '0' })
      === LEGACY_TECH_ROLE_DEFAULT
    && resolveAdaptiveInterviewRole({}, {}) === LEGACY_TECH_ROLE_DEFAULT;

  // Default appears flipped only if empty-env enables fail-closed (Ban silent flip).
  const defaultFlipped = isTechRoleFailClosedEnabled({}) === true;

  return {
    emptyEnvFailClosedOff,
    workerEnvExampleStill0,
    noLegacyPathUnderExplicitFlagOn,
    legacyPathStillWhenFlagOff,
    defaultFlipped,
  };
}

/** True only when no-legacy path evidence is honest AND default still 0. */
export function hasDefaultOnNoLegacyPathEvidence(): boolean {
  const a = assessDefaultOnNoLegacyPathEvidence();
  return (
    a.emptyEnvFailClosedOff
    && a.workerEnvExampleStill0
    && a.noLegacyPathUnderExplicitFlagOn
    && a.legacyPathStillWhenFlagOff
    && a.defaultFlipped === false
  );
}

export function emitDefaultOnNoLegacyPathEvidence(): Pr1cEvidenceResult {
  const a = assessDefaultOnNoLegacyPathEvidence();
  if (!a.emptyEnvFailClosedOff || a.defaultFlipped) {
    return {
      kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure',
      emitted: false,
      reason: a.defaultFlipped ? 'default_appears_flipped' : 'empty_env_not_off',
    };
  }
  if (!a.workerEnvExampleStill0) {
    return {
      kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure',
      emitted: false,
      reason: 'worker_env_example_not_0',
    };
  }
  if (!a.noLegacyPathUnderExplicitFlagOn) {
    return {
      kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure',
      emitted: false,
      reason: 'no_legacy_path_missing',
    };
  }
  if (!a.legacyPathStillWhenFlagOff) {
    return {
      kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure',
      emitted: false,
      reason: 'legacy_path_broken_when_flag_off',
    };
  }

  const evidence: DefaultOnNoLegacyPathEvidence = {
    kind: PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND,
    defaultOnNoLegacyPathEvidence: true,
    noLegacyPathUnderExplicitFlagOn: true,
    legacyPathStillWhenFlagOff: true,
    failClosedDefaultStill0: true,
    defaultFlipped: false,
    workerEnvExampleStill0: true,
    emptyEnvFailClosedOff: true,
    gR43Closed: false,
    r1ProductClosed: false,
    pr1CProductClosed: false,
    releaseEvidence: false,
    note: 'PR1-C default-on/no-legacy path evidence — default still 0 · ≠ flip · ≠ PR1-C/G-R4-3/R1 product closed · Ban forge · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_EMITTER_WIRED = true as const;
