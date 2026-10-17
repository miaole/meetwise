/**
 * Single source for the strict three-state public-preview flag (fail-closed):
 * undefined/'0' → off, exact '1' → on, any other value — including '' and
 * whitespace forms — throws. The error word is frozen:
 * `invalid_meetwise_public_preview`. Apps delegate here; do not copy this
 * logic into per-app duplicates.
 */
export function resolvePublicPreview(raw: string | undefined): boolean {
  if (raw === undefined || raw === '0') return false;
  if (raw === '1') return true;
  throw new Error('invalid_meetwise_public_preview');
}
