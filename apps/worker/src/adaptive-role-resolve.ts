/**
 * R1 / GAP-RAG-01 — adaptive interview role resolution.
 *
 * HARD:
 * - Default (flag off) preserves legacy「技术岗」fallback so production starts
 *   are not cut recklessly while R2 route snapshot write-path is still unwired.
 * - Flag on (`MEETWISE_TECH_ROLE_FAIL_CLOSED=1|true|on`): missing route snapshot
 *   / job route metadata → throw `adaptive_role_route_missing` (fail-closed;
 *   no silent 技术岗 guess-bucket).
 * - Does NOT claim R2 production wiring (application binding / snapshot write).
 * - Does NOT claim R4 topic isolation closed.
 */
export const MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV = 'MEETWISE_TECH_ROLE_FAIL_CLOSED';
/** Documented legacy default only — used when fail-closed flag is OFF. */
export const LEGACY_TECH_ROLE_DEFAULT = '技术岗';
export const ADAPTIVE_ROLE_ROUTE_MISSING = 'adaptive_role_route_missing';

export type AdaptiveRoleSources = {
  /** Primary leaf / role label from InterviewRouteSnapshot when a row exists. */
  roleFromRouteSnapshot?: string | null;
  /** Explicit role carried on job / route metadata when present. */
  roleFromJobRouteMetadata?: string | null;
  /**
   * Explicit deps injection (tests / rare overrides).
   * Under fail-closed this alone does NOT satisfy the gate — route snapshot or
   * job route metadata is required (prevents re-injecting silent 技术岗 via deps).
   */
  roleFromDeps?: string | null;
};

/** Default off. Only exact-ish truthy tokens enable fail-closed. */
export function isTechRoleFailClosedEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env[MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'on';
}

function nonBlank(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Resolve the role string passed into startAdaptiveInterview.
 * Prefer route snapshot → job route metadata → (legacy only) deps → legacy default.
 */
export function resolveAdaptiveInterviewRole(
  sources: AdaptiveRoleSources = {},
  env: NodeJS.ProcessEnv = process.env,
): string {
  const fromRoute =
    nonBlank(sources.roleFromRouteSnapshot) ?? nonBlank(sources.roleFromJobRouteMetadata);
  if (isTechRoleFailClosedEnabled(env)) {
    if (fromRoute) return fromRoute;
    throw Object.assign(new Error(ADAPTIVE_ROLE_ROUTE_MISSING), {
      code: ADAPTIVE_ROLE_ROUTE_MISSING,
    });
  }
  return fromRoute ?? nonBlank(sources.roleFromDeps) ?? LEGACY_TECH_ROLE_DEFAULT;
}
