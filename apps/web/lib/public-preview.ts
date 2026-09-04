/**
 * Shared fail-closed preview flag. Only exact '1' enables preview; unknown
 * values throw instead of silently opening the full write app.
 * Keep this aligned with apps/api/src/platform/public-preview.ts.
 */
export function resolvePublicPreview(raw: string | undefined): boolean {
  if (raw === undefined || raw === '0') return false;
  if (raw === '1') return true;
  throw new Error('invalid_meetwise_public_preview');
}
