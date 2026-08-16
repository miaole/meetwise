/**
 * Pure decision function for the root-owned preview controller.
 *
 * A signed public manifest is an independently visible statement: it must
 * never be ignored merely because a process lost or reverted its local
 * ledger.  Callers verify the manifest signature before passing its summary
 * here; this module only defines the fail-closed state relation.
 */
const LEDGER_STATES = new Set(['idle', 'staged', 'active_unpublished', 'publishing', 'verified', 'revoked', 'failed']);

function invalid(reason) {
  return { action: 'block', reason };
}

export function decidePublicationReconciliation({ ledger, manifest }) {
  if (!ledger || !LEDGER_STATES.has(ledger.state)) return invalid('preview_reconcile_ledger_invalid');

  // There is no externally visible signed release to reconcile. A pending
  // publish is ambiguous, however: absence cannot prove Pages disabled.
  if (manifest === null) {
    if (ledger.state === 'publishing' || ledger.state === 'verified') {
      return invalid('preview_reconcile_public_manifest_missing');
    }
    return { action: 'stable' };
  }

  if (!['verified', 'revoked'].includes(manifest.status)
    || typeof manifest.releaseDigest !== 'string'
    || !/^[a-f0-9]{64}$/.test(manifest.fingerprint ?? '')) {
    return invalid('preview_reconcile_public_manifest_invalid');
  }

  if (manifest.status === 'revoked') {
    // A revoked public record is safe even if an earlier crash lost the last
    // ledger detail. Do not rewrite a terminal ledger merely to repair
    // bookkeeping: a later release may proceed only from its revoked state.
    if (ledger.state === 'revoked') return { action: 'stable' };
    return { action: 'confirm_revocation', releaseDigest: manifest.releaseDigest, fingerprint: manifest.fingerprint };
  }

  if (ledger.state === 'verified'
    && ledger.releaseDigest === manifest.releaseDigest
    && ledger.fingerprint === manifest.fingerprint) {
    return { action: 'stable' };
  }

  // Covers a crash after manifest publication but before `verified`, an old
  // manifest paired with a reverted ledger, and any cross-release mismatch.
  return { action: 'revoke_public_manifest', releaseDigest: manifest.releaseDigest, fingerprint: manifest.fingerprint };
}
