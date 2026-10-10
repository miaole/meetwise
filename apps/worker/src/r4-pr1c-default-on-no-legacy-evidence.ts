/**
 * G-R4-3 PR1-C — default-on / **no-legacy** path evidence emitter
 * (post G-R4-3 / R1 product-close flip · honest flags).
 *
 * Honest path AFTER authorized default flip:
 *   - Documents + verifies the no-legacy (fail-closed ON) code path exists at the
 *     combo-root / resolver / consumer surfaces.
 *   - Proves empty-env + worker.env.example default are **ON** (`failClosedDefaultStill0=false`
 *     · `defaultFlipped=true`) — Ban forge "still 0" after flip.
 *   - Exercises no-legacy behavior under product default (empty env) and explicit flag=1.
 *   - Legacy path retained only under explicit flag=0 opt-out.
 *
 * HARD:
 *   - Evidence emit ≠ invent R4/FUNNEL/题域/G-R4-5/EG closed.
 *   - Ban forge failClosedDefaultStill0=true after flip · Ban claim R4 closed from EXIT=0.
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
  /** No-legacy path exists under product default (fail-closed ON). */
  readonly defaultOnNoLegacyPathEvidence: true;
  readonly noLegacyPathUnderProductDefault: true;
  readonly noLegacyPathUnderExplicitFlagOn: true;
  readonly legacyPathStillWhenFlagExplicitOff: true;
  /** Honesty AFTER authorized flip. */
  readonly failClosedDefaultStill0: false;
  readonly defaultFlipped: true;
  readonly workerEnvExampleNow1: true;
  readonly emptyEnvFailClosedOn: true;
  /** Explicit non-claims (orthogonal products). */
  readonly r4ProductClosed: false;
  readonly gR45Closed: false;
  readonly domainIsolationClosed: false;
  readonly releaseEvidence: false;
  readonly note: 'PR1-C default-on/no-legacy path evidence — default flipped · failClosedDefaultStill0=false · ≠ R4/FUNNEL/题域/G-R4-5 closed · Ban forge · await post-prove dual';
};

export type Pr1cEvidenceFailure = {
  readonly kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure';
  readonly emitted: false;
  readonly reason:
    | 'empty_env_not_on'
    | 'worker_env_example_not_1'
    | 'no_legacy_path_missing'
    | 'legacy_path_broken_when_flag_explicit_off'
    | 'default_not_flipped';
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

function assertNoLegacyPath(env: NodeJS.ProcessEnv): boolean {
  try {
    resolveAdaptiveInterviewRole({}, env);
    return false;
  } catch (e) {
    const failClosed =
      (e as { code?: string }).code === ADAPTIVE_ROLE_ROUTE_MISSING;
    const withRoute =
      resolveAdaptiveInterviewRole(
        { roleFromRouteSnapshot: 'no-legacy-path' },
        env,
      ) === 'no-legacy-path';
    let depsAloneFailClosed = false;
    try {
      resolveAdaptiveInterviewRole(
        { roleFromDeps: LEGACY_TECH_ROLE_DEFAULT },
        env,
      );
      depsAloneFailClosed = false;
    } catch (e2) {
      depsAloneFailClosed =
        (e2 as { code?: string }).code === ADAPTIVE_ROLE_ROUTE_MISSING;
    }
    return failClosed && withRoute && depsAloneFailClosed;
  }
}

export function assessDefaultOnNoLegacyPathEvidence(): {
  emptyEnvFailClosedOn: boolean;
  workerEnvExampleNow1: boolean;
  noLegacyPathUnderProductDefault: boolean;
  noLegacyPathUnderExplicitFlagOn: boolean;
  legacyPathStillWhenFlagExplicitOff: boolean;
  defaultFlipped: boolean;
} {
  const emptyEnvFailClosedOn = isTechRoleFailClosedEnabled({}) === true;

  const envExample = readWorkerEnvExample();
  const workerEnvExampleNow1 =
    /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*1/.test(envExample)
    && !/MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample);

  const noLegacyPathUnderProductDefault = assertNoLegacyPath({});
  const noLegacyPathUnderExplicitFlagOn = assertNoLegacyPath({
    MEETWISE_TECH_ROLE_FAIL_CLOSED: '1',
  });

  const legacyPathStillWhenFlagExplicitOff =
    resolveAdaptiveInterviewRole({}, { MEETWISE_TECH_ROLE_FAIL_CLOSED: '0' })
      === LEGACY_TECH_ROLE_DEFAULT;

  const defaultFlipped = emptyEnvFailClosedOn && workerEnvExampleNow1;

  return {
    emptyEnvFailClosedOn,
    workerEnvExampleNow1,
    noLegacyPathUnderProductDefault,
    noLegacyPathUnderExplicitFlagOn,
    legacyPathStillWhenFlagExplicitOff,
    defaultFlipped,
  };
}

/** True only when no-legacy path evidence is honest AND default flipped. */
export function hasDefaultOnNoLegacyPathEvidence(): boolean {
  const a = assessDefaultOnNoLegacyPathEvidence();
  return (
    a.emptyEnvFailClosedOn
    && a.workerEnvExampleNow1
    && a.noLegacyPathUnderProductDefault
    && a.noLegacyPathUnderExplicitFlagOn
    && a.legacyPathStillWhenFlagExplicitOff
    && a.defaultFlipped === true
  );
}

export function emitDefaultOnNoLegacyPathEvidence(): Pr1cEvidenceResult {
  const a = assessDefaultOnNoLegacyPathEvidence();
  if (!a.emptyEnvFailClosedOn || !a.defaultFlipped) {
    return {
      kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure',
      emitted: false,
      reason: a.defaultFlipped ? 'empty_env_not_on' : 'default_not_flipped',
    };
  }
  if (!a.workerEnvExampleNow1) {
    return {
      kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure',
      emitted: false,
      reason: 'worker_env_example_not_1',
    };
  }
  if (!a.noLegacyPathUnderProductDefault || !a.noLegacyPathUnderExplicitFlagOn) {
    return {
      kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure',
      emitted: false,
      reason: 'no_legacy_path_missing',
    };
  }
  if (!a.legacyPathStillWhenFlagExplicitOff) {
    return {
      kind: 'Pr1cDefaultOnNoLegacyEvidenceFailure',
      emitted: false,
      reason: 'legacy_path_broken_when_flag_explicit_off',
    };
  }

  const evidence: DefaultOnNoLegacyPathEvidence = {
    kind: PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND,
    defaultOnNoLegacyPathEvidence: true,
    noLegacyPathUnderProductDefault: true,
    noLegacyPathUnderExplicitFlagOn: true,
    legacyPathStillWhenFlagExplicitOff: true,
    failClosedDefaultStill0: false,
    defaultFlipped: true,
    workerEnvExampleNow1: true,
    emptyEnvFailClosedOn: true,
    r4ProductClosed: false,
    gR45Closed: false,
    domainIsolationClosed: false,
    releaseEvidence: false,
    note: 'PR1-C default-on/no-legacy path evidence — default flipped · failClosedDefaultStill0=false · ≠ R4/FUNNEL/题域/G-R4-5 closed · Ban forge · await post-prove dual',
  };
  return { emitted: true, evidence };
}

export const PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_EMITTER_WIRED = true as const;
