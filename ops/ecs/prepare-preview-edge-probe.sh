#!/usr/bin/env bash
set -euo pipefail

# This is the sole entrypoint that creates a temporary externally reachable
# probe. It runs under the release flock, Pages stays disabled, and a later
# boot reconciliation always aborts this state instead of reopening it.
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard prepare-preview-edge-probe.sh
controller_require_lock

if [[ $# -ne 1 ]]; then
  printf '%s\n' 'usage: internal prepare-preview-edge-probe.sh /srv/meetwise-preview/releases/<release-digest>' >&2
  exit 64
fi

release_dir="$(controller_release_dir "$1")"
release_id="$(basename "$release_dir")"
systemctl stop meetwise-preview-edge-probe-watchdog.service meetwise-preview-edge-probe-expiry.timer
# A static unit that has never been activated can make `reset-failed` return
# non-zero even though the next `start` is valid. Resetting is only cleanup of
# a previous failure, never an authorization to expose the edge; the required
# loaded, start and active checks remain the serving gate.
systemctl reset-failed meetwise-preview-edge-probe-watchdog.service meetwise-preview-edge-probe-expiry.service || true
controller_require_edge_probe_units_loaded
controller_clear_edge_probe_timeout
controller_clear_edge_probe_timeout_runtime
controller_clear_edge_fence
ledger="$(controller_ledger_read)"
current="$(controller_current_read)"
state="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$ledger")"
ledger_release="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).releaseDigest ?? "")' "$ledger")"
[[ "$state" == active_unpublished && "$ledger_release" == "$release_id" ]] \
  || controller_fail 'preview edge probe requires the active unpublished release' 70
[[ "$(node -e 'const value=JSON.parse(process.argv[1]); process.stdout.write(value.state === "present" ? value.releaseDigest : "")' "$current")" == "$release_id" ]] \
  || controller_fail 'preview edge probe current release mismatch' 70

public_manifest=/usr/share/meetwise-preview/preview-release-manifest.json
if [[ -e "$public_manifest" ]]; then
  controller_root=/usr/local/lib/meetwise-preview-controller
  [[ -f "$public_manifest" && ! -L "$public_manifest" && "$(stat -c '%U:%G:%a' "$public_manifest")" == root:root:644 ]] \
    || controller_fail 'preview edge probe public manifest metadata is invalid' 77
  node --input-type=module - "$public_manifest" "$controller_root/preview-release-ed25519.pub.pem" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile } from 'node:fs/promises';
const [manifestPath, keyPath, modulePath] = process.argv.slice(2);
const [{ verifyManifest }, manifest, publicKey] = await Promise.all([
  import(modulePath), readFile(manifestPath, 'utf8').then(JSON.parse), readFile(keyPath, 'utf8'),
]);
if (verifyManifest(manifest, publicKey, { allowExpired: true }).status !== 'revoked') {
  throw new Error('preview_edge_probe_requires_revoked_predecessor_manifest');
}
NODE
fi

controller_ledger_transition active_unpublished edge_probing "$release_id" '' '' disabled >/dev/null
controller_arm_edge_fence "$release_id"
ledger="$(controller_ledger_read)"
current="$(controller_current_read)"
controller_issue_serving_permit "$ledger" "$current" null
controller_validate_serving_permit "$ledger" "$current" null
systemctl restart meetwise-web-preview.service
systemctl is-active --quiet meetwise-web-preview.service
systemctl start meetwise-preview-edge-probe-watchdog.service
systemctl is-active --quiet meetwise-preview-edge-probe-watchdog.service
printf '%s\n' 'edge-probe permit issued; Pages remains disabled'
