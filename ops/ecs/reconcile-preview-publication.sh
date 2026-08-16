#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard reconcile-preview-publication.sh
controller_require_lock

controller_root=/usr/local/lib/meetwise-preview-controller
public_manifest=/usr/share/meetwise-preview/preview-release-manifest.json
public_key="$controller_root/preview-release-ed25519.pub.pem"

ledger="$(controller_ledger_read)"
manifest_summary='null'
if [[ -e "$public_manifest" ]]; then
  [[ -f "$public_manifest" && ! -L "$public_manifest" && "$(stat -c '%U:%G:%a' "$public_manifest")" == root:root:644 ]] \
    || controller_fail 'public preview manifest type, ownership or mode is invalid' 77
  manifest_summary="$(node --input-type=module - "$public_manifest" "$public_key" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile } from 'node:fs/promises';
const [manifestPath, keyPath, modulePath] = process.argv.slice(2);
const [{ verifyManifest, manifestFingerprint }, manifest, publicKey] = await Promise.all([
  import(modulePath),
  readFile(manifestPath, 'utf8').then(JSON.parse),
  readFile(keyPath, 'utf8'),
]);
const verified = verifyManifest(manifest, publicKey, { allowExpired: true });
process.stdout.write(JSON.stringify({
  status: verified.status,
  releaseDigest: verified.releaseDigest,
  fingerprint: manifestFingerprint(verified),
}));
NODE
)"
fi

decision="$(node --input-type=module - "$ledger" "$manifest_summary" "$controller_root/preview-publication-recovery.mjs" <<'NODE'
const [ledgerJson, manifestJson, modulePath] = process.argv.slice(2);
const { decidePublicationReconciliation } = await import(modulePath);
process.stdout.write(JSON.stringify(decidePublicationReconciliation({
  ledger: JSON.parse(ledgerJson),
  manifest: JSON.parse(manifestJson),
})));
NODE
)"
action="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).action)' "$decision")"
case "$action" in
  stable)
    exit 0
    ;;
  confirm_revocation|revoke_public_manifest)
    MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$controller_root/revoke-preview-pages-link.sh"
    ;;
  block)
    reason="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).reason)' "$decision")"
    # A missing or unverifiable public record means we cannot prove that a
    # still-published Pages directory no longer targets this origin. Remove
    # the edge before failing; do not let a guessed Funnel URL expose an
    # unverified release while an operator investigates.
    tailscale funnel --https=443 off >/dev/null 2>&1 || controller_fail 'preview edge could not be disabled during reconciliation failure' 70
    controller_fail "preview publication reconciliation failed: $reason" 70
    ;;
  *)
    controller_fail 'preview publication reconciliation returned an invalid action' 70
    ;;
esac
