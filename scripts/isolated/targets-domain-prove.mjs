/**
 * S3 — prove-shell / domain-prove lane (thin module · naming honesty).
 *
 * Any target spawned via the isolated runner that is NOT in LIVE_E2E_TARGETS
 * and NOT conn-only is prove-shell: domain integration / negative-path / contract prove.
 * That is partial旁证 — NOT HTTP/SSE full-journey live E2E covered.
 *
 * S3 does NOT mass-move package.json *:prove wrappers (still call
 * scripts/run-e2e-isolated.mjs). Clearer naming starts here + docs.
 * Conn-only (mysql-stack:* / conn-stack:*) is NEVER prove-shell and NEVER LIVE — forever.
 * S4 relocates bodies under scripts/conn-stack/; legacy scripts/mysql-stack.* are thin forwarders.
 *
 * Callers MUST NOT treat isProveShellTarget(t)===true as "covered", and MUST NOT
 * treat isProveShellTarget green as evidence that conn-only mysql-stack is OK.
 *
 * releaseEvidence=false · Not HA · 本绿≠已迁 · prove EXIT=0 ≠ E2E covered
 */
import { isLiveE2eTarget } from './targets-live-e2e.mjs';

export const PROVE_SHELL_NOTE =
  'prove-shell via isolated runner ≠ LIVE E2E covered; see ai-docs/delivery/e2e-live-targets-whitelist.md §2';

export const CONN_ONLY_NOTE =
  'mysql-stack:* / conn-stack:* is conn-only forever — NEVER prove-shell, NEVER LIVE; isProveShellTarget must stay false';

/**
 * Conn-only scripts must never be classified as LIVE or prove-shell.
 * Documented forever: all `mysql-stack:*` and optional `conn-stack:*` aliases
 * (skeleton / ping / m2–m5 / r5-mark-red / …). Bodies live under scripts/conn-stack/.
 * @param {string} target
 * @returns {boolean}
 */
export function isConnOnlyTarget(target) {
  return typeof target === 'string'
    && (target.startsWith('mysql-stack:') || target.startsWith('conn-stack:'));
}

/**
 * @param {string} target pnpm script name passed to the isolated runner
 * @returns {boolean} true when target is prove-shell (not LIVE / not LIVE_OPTIONAL_UI / not conn-only)
 */
export function isProveShellTarget(target) {
  return (
    typeof target === 'string'
    && target.length > 0
    && !isLiveE2eTarget(target)
    && !isConnOnlyTarget(target)
  );
}
