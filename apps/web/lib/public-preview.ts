/**
 * Shared fail-closed preview flag. Only exact '1' enables preview; unknown
 * values throw instead of silently opening the full write app.
 * Strict three-state logic is single-sourced in
 * @meetwise/contracts/public-preview — this module is a pure delegation.
 */
export { resolvePublicPreview } from '@meetwise/contracts/public-preview';
