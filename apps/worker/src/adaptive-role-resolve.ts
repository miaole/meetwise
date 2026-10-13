/**
 * R1 / GAP-RAG-01 — adaptive interview role resolution.
 *
 * HARD:
 * - Default ON after G-R4-3 / R1 product-close flip (`MEETWISE_TECH_ROLE_FAIL_CLOSED`
 *   unset/blank → fail-closed). Explicit `0|false|off` restores legacy「技术岗」opt-out.
 * - Flag on (default or `1|true|on`): missing route snapshot / job route metadata →
 *   throw `adaptive_role_route_missing` (fail-closed; no silent 技术岗 guess-bucket).
 * - Does NOT claim R2 production wiring (application binding / snapshot write) beyond
 *   prior structural CLOSED pins.
 * - Does NOT claim R4 topic isolation closed · releaseEvidence=false · ≠HA.
 */
export const MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV = 'MEETWISE_TECH_ROLE_FAIL_CLOSED';
/** Documented legacy default only — used when fail-closed flag is explicitly OFF. */
export const LEGACY_TECH_ROLE_DEFAULT = '技术岗';
export const ADAPTIVE_ROLE_ROUTE_MISSING = 'adaptive_role_route_missing';

export type AdaptiveRoleSources = {
  /**
   * #259 用户显式目标岗位（begin `target-role` 头 → job payload 标量）。
   * 最高优先：只覆写 role 值，不解锁 fail-closed 供给存在性门（见下）。
   */
  roleFromUserInput?: string | null;
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

/**
 * Product default ON (G-R4-3 / R1 product close).
 * Exact `0|false|off` disables to legacy path. Unset/blank/`1|true|on`/other → on.
 */
export function isTechRoleFailClosedEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env[MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]?.trim().toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'off') return false;
  return true;
}

function nonBlank(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Resolve the role string passed into startAdaptiveInterview.
 *
 * #259 priority: user input (begin `target-role`) → route snapshot → job route
 * metadata → (legacy only when flag off) deps → legacy default.
 *
 * Gate semantics UNCHANGED: under fail-closed (default ON), a missing route
 * snapshot still throws `adaptive_role_route_missing` even when
 * `roleFromUserInput` is present — user input overrides the role VALUE, never
 * the route-ledger existence gate. candidate_route decision/snapshot rows
 * remain the routing/audit truth; a user-supplied role never skips supply or
 * snapshot reads (并存优先序, Ban 供给链旁路).
 */
export function resolveAdaptiveInterviewRole(
  sources: AdaptiveRoleSources = {},
  env: NodeJS.ProcessEnv = process.env,
): string {
  const fromUser = nonBlank(sources.roleFromUserInput);
  const fromRoute =
    nonBlank(sources.roleFromRouteSnapshot) ?? nonBlank(sources.roleFromJobRouteMetadata);
  if (isTechRoleFailClosedEnabled(env)) {
    if (fromRoute) return fromUser ?? fromRoute;
    throw Object.assign(new Error(ADAPTIVE_ROLE_ROUTE_MISSING), {
      code: ADAPTIVE_ROLE_ROUTE_MISSING,
    });
  }
  return fromUser ?? fromRoute ?? nonBlank(sources.roleFromDeps) ?? LEGACY_TECH_ROLE_DEFAULT;
}
