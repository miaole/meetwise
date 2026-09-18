/**
 * App-level tenant enforcement prototype — ADDITIVE path for future MySQL.
 *
 * 应用层 tenant ≠ RLS
 * ---------------------------------------------------------------------------
 * This module demonstrates the *required owner filter* that a MySQL-era data
 * path must apply explicitly (fail-closed). It does **not** replace, weaken,
 * or bypass PostgreSQL RLS / `asPrincipal` / `set_config('app.principal_user')`
 * / FORCE ROW LEVEL SECURITY.
 *
 * HARD:
 * - Must not silently replace the auth root (principal GUC + RLS FORCE).
 * - Production PG paths must keep calling `asPrincipal` (see principal.ts).
 * - Wire nothing here that removes `set_config` from production request paths.
 * - Dual-write OR bypass prove only: prove the owner predicate is mandatory;
 *   do not claim cutover / releaseEvidence / HA / controlPlaneClosed.
 *
 * @see ai-docs/delivery/m2-tenant-authorization-model.md
 * @see ai-docs/delivery/m2-tenant-prototype-impl.md
 */

export type TenantEnforcementCode =
  | 'tenant_owner_user_id_required'
  | 'tenant_owner_mismatch'
  | 'tenant_predicate_invalid';

export class TenantEnforcementError extends Error {
  readonly code: TenantEnforcementCode;
  readonly context?: string;

  constructor(code: TenantEnforcementCode, message: string, context?: string) {
    super(context ? `${code}:${context}: ${message}` : `${code}: ${message}`);
    this.name = 'TenantEnforcementError';
    this.code = code;
    this.context = context;
  }
}

/**
 * Fail-closed: every app-level tenant query/write path must supply a non-blank
 * owner_user_id. Missing owner is a hard error — never an optional WHERE.
 *
 * 应用层 tenant ≠ RLS: this check is the MySQL-era *required owner filter*
 * prototype; it must not silently replace `asPrincipal` + RLS as auth root.
 */
export function requireOwnerUserId(ownerUserId: unknown, context?: string): string {
  if (typeof ownerUserId !== 'string') {
    throw new TenantEnforcementError(
      'tenant_owner_user_id_required',
      'owner_user_id must be a non-empty string (app-level tenant ≠ RLS; auth root must not silently degrade)',
      context,
    );
  }
  const trimmed = ownerUserId.trim();
  if (trimmed.length === 0) {
    throw new TenantEnforcementError(
      'tenant_owner_user_id_required',
      'owner_user_id must be a non-empty string (app-level tenant ≠ RLS; auth root must not silently degrade)',
      context,
    );
  }
  return trimmed;
}

/**
 * Assert that a row's owner matches the required tenant principal.
 * Cross-owner access is fail-closed (mismatch throws).
 *
 * Use on dual-write / MySQL bypass prove paths that re-check owner after read,
 * or before write. Does not substitute RLS FORCE on PG.
 */
export function assertTenantPredicate(
  rowOwnerUserId: unknown,
  requiredOwnerUserId: string,
  context?: string,
): void {
  const required = requireOwnerUserId(requiredOwnerUserId, context);
  if (typeof rowOwnerUserId !== 'string' || rowOwnerUserId.trim().length === 0) {
    throw new TenantEnforcementError(
      'tenant_predicate_invalid',
      'row owner_user_id missing; cannot assert tenant predicate',
      context,
    );
  }
  const actual = rowOwnerUserId.trim();
  if (actual !== required) {
    throw new TenantEnforcementError(
      'tenant_owner_mismatch',
      'row owner_user_id does not match required owner (cross-owner fail-closed)',
      context,
    );
  }
}

/**
 * Explicit owner filter shape for dual-write / future MySQL query builders.
 * Callers must bind `value` into WHERE/WITH CHECK equivalents — never omit.
 *
 * This is a required predicate object, not an optional filter hint.
 */
export function buildRequiredOwnerFilter(ownerUserId: unknown, context?: string): {
  column: 'owner_user_id';
  value: string;
} {
  return {
    column: 'owner_user_id',
    value: requireOwnerUserId(ownerUserId, context),
  };
}

/**
 * Narrow helper: apply requireOwnerUserId then assertTenantPredicate in one step.
 * Useful for "read then enforce" dual-write proves.
 */
export function enforceOwnerOnRow(
  row: { owner_user_id?: unknown } | null | undefined,
  requiredOwnerUserId: unknown,
  context?: string,
): string {
  const required = requireOwnerUserId(requiredOwnerUserId, context);
  if (row == null) {
    throw new TenantEnforcementError(
      'tenant_predicate_invalid',
      'row missing; cannot enforce owner',
      context,
    );
  }
  assertTenantPredicate(row.owner_user_id, required, context);
  return required;
}
