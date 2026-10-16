/**
 * S3 — LIVE E2E target whitelist (thin module · mirrors code Set).
 *
 * Canonical runtime Set today still lives in scripts/run-e2e-isolated.mjs
 * (static guards / R5 scanners pin that path). This module is the clearer
 * documented source for LIVE vs secondary UI — do NOT shrink LIVE_E2E_TARGET_LIST
 * without dual approval (mw-e2e-ha + mw-rag-route). Prefer docs honesty over
 * silent Set edits.
 *
 * ADR D5 / e2e-live-targets-whitelist.md:
 *   - Live primary (HTTP/SSE) ⊆ {e2e:prove, performance:e2e}
 *   - e2e:ui = LIVE_OPTIONAL_UI / secondary (still in code Set; narrative ≠ primary)
 *
 * releaseEvidence=false · Not HA · 本绿≠已迁 · 静态绿≠live E2E
 */
export const LIVE_E2E_PRIMARY = Object.freeze(['e2e:prove', 'performance:e2e']);
export const LIVE_OPTIONAL_UI = Object.freeze(['e2e:ui']);

/** Full code Set members — MUST stay identical to run-e2e-isolated.mjs literal. */
export const LIVE_E2E_TARGET_LIST = Object.freeze([
  'e2e:prove',
  'e2e:ui',
  'performance:e2e',
]);

export const LIVE_E2E_TARGETS = new Set(LIVE_E2E_TARGET_LIST);

export function isLiveE2eTarget(target) {
  return LIVE_E2E_TARGETS.has(target);
}

export function isLivePrimary(target) {
  return LIVE_E2E_PRIMARY.includes(target);
}

export function isLiveOptionalUi(target) {
  return LIVE_OPTIONAL_UI.includes(target);
}
