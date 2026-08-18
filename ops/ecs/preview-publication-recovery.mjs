/**
 * Pure reconciliation policy for the root-owned preview controller.
 *
 * The local ledger is not enough to decide whether a release may serve: the
 * controller also receives a verified public manifest summary and the exact
 * effective `current` pointer. This module never repairs a mismatch by
 * guessing a previous release. It chooses an explicit revocation or a
 * fail-closed stop instead.
 */
const LEDGER_STATES = new Set(['idle', 'staged', 'active_unpublished', 'edge_probing', 'publishing', 'verified', 'revoked', 'failed']);
const DIGEST = /^[a-f0-9]{64}$/;

function invalid(reason) {
  return { action: 'block', reason };
}

function currentMatches(ledger, current) {
  return current?.state === 'present' && current.releaseDigest === ledger.releaseDigest;
}

function manifestValid(manifest) {
  return manifest && ['verified', 'revoked'].includes(manifest.status)
    && typeof manifest.releaseDigest === 'string'
    && DIGEST.test(manifest.fingerprint ?? '')
    && typeof manifest.expired === 'boolean';
}

export function decidePublicationReconciliation({ ledger, manifest, current }) {
  if (!ledger || !LEDGER_STATES.has(ledger.state)) return invalid('preview_reconcile_ledger_invalid');
  if (!current || !['present', 'absent', 'invalid'].includes(current.state)) return invalid('preview_reconcile_current_invalid');
  if (manifest !== null && !manifestValid(manifest)) return invalid('preview_reconcile_public_manifest_invalid');

  // A public probe is only safe in the originating release process. It is
  // never resumed after a reboot or controller reconciliation: the edge must
  // close before the record becomes terminally failed.
  if (ledger.state === 'edge_probing') {
    // A crash could have written a public manifest before preserving the next
    // ledger state. The actual public record takes precedence: revoke it and
    // wait for Pages before the probe is declared terminally failed.
    if (manifest?.status === 'verified') {
      return { action: 'revoke_public_manifest', releaseDigest: manifest.releaseDigest, fingerprint: manifest.fingerprint };
    }
    return { action: 'abort_edge_probe', releaseDigest: ledger.releaseDigest };
  }

  if (manifest?.status === 'revoked') {
    if (ledger.state === 'revoked'
      && ledger.releaseDigest === manifest.releaseDigest
      && ledger.fingerprint === manifest.fingerprint
      && ledger.pages === 'disabled') {
      return { action: 'disabled' };
    }
    // A previous, independently confirmed revocation is safe while a new
    // candidate is only running on loopback. Do not rewrite that candidate's
    // ledger with the predecessor's release identity.
    if (ledger.state === 'active_unpublished' && currentMatches(ledger, current)) {
      return { action: 'serve_loopback' };
    }
    if (ledger.state === 'staged' && current.state === 'absent') return { action: 'disabled' };
    return { action: 'confirm_revocation', releaseDigest: manifest.releaseDigest, fingerprint: manifest.fingerprint };
  }

  if (manifest?.status === 'verified') {
    // An expired signature remains authentic, but may no longer be used to
    // route visitors. Replace it with a signed revocation before any next
    // release is allowed.
    if (manifest.expired
      || ledger.state !== 'verified'
      || ledger.releaseDigest !== manifest.releaseDigest
      || ledger.fingerprint !== manifest.fingerprint
      || !currentMatches(ledger, current)) {
      return { action: 'revoke_public_manifest', releaseDigest: manifest.releaseDigest, fingerprint: manifest.fingerprint };
    }
    return { action: 'serve_public' };
  }

  // No public record is visible. It is safe to run a candidate only on its
  // loopback path while the ledger proves that it is activated but unpublished.
  if (ledger.state === 'active_unpublished' && currentMatches(ledger, current)) {
    return { action: 'serve_loopback' };
  }
  if (ledger.state === 'staged' && current.state === 'absent') return { action: 'disabled' };
  if (['idle', 'failed', 'revoked'].includes(ledger.state) && current.state !== 'invalid') return { action: 'disabled' };
  if (ledger.state === 'publishing' || ledger.state === 'verified') return invalid('preview_reconcile_public_manifest_missing');
  return invalid('preview_reconcile_current_or_state_mismatch');
}
