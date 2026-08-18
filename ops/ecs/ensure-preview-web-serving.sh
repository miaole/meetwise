#!/usr/bin/env bash
set -euo pipefail

# This root pre-start hook is intentionally read-only. A release operation
# holds the controller flock while it restarts systemd, so taking that lock
# here would deadlock deployment. Boot-time recovery owns mutation; this hook
# merely rejects any non-atomic or mismatched record set before Node can run.
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard ensure-preview-web-serving.sh

ledger="$(controller_ledger_read)"
current="$(controller_current_read)"
manifest_summary='null'
controller_root=/usr/local/lib/meetwise-preview-controller
state="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$ledger")"
if [[ "$state" == publishing || ( "$state" == verified && ! -e /usr/share/meetwise-preview/preview-release-manifest.json && -e "$MEETWISE_PREVIEW_PENDING_MANIFEST" ) ]]; then
  manifest_path="$MEETWISE_PREVIEW_PENDING_MANIFEST"
  manifest_mode=root:root:600
else
  manifest_path=/usr/share/meetwise-preview/preview-release-manifest.json
  manifest_mode=root:root:644
fi

if [[ -e "$manifest_path" ]]; then
  [[ -f "$manifest_path" && ! -L "$manifest_path" && "$(stat -c '%U:%G:%a' "$manifest_path")" == "$manifest_mode" ]] \
    || controller_fail 'public preview manifest metadata changed after reconciliation' 77
  manifest_summary="$(node --input-type=module - "$manifest_path" "$controller_root/preview-release-ed25519.pub.pem" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile } from 'node:fs/promises';
const [manifestPath, keyPath, modulePath] = process.argv.slice(2);
const [{ verifyManifest, manifestFingerprint }, manifest, publicKey] = await Promise.all([
  import(modulePath), readFile(manifestPath, 'utf8').then(JSON.parse), readFile(keyPath, 'utf8'),
]);
const signed = verifyManifest(manifest, publicKey, { allowExpired: true });
process.stdout.write(JSON.stringify({
  status: signed.status,
  releaseDigest: signed.releaseDigest,
  fingerprint: manifestFingerprint(signed),
  expired: Date.parse(signed.expiresAt) <= Date.now(),
}));
NODE
)"
fi

controller_validate_serving_permit "$ledger" "$current" "$manifest_summary"
