#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard enable-preview-funnel.sh
controller_require_lock

command -v tailscale >/dev/null || controller_fail 'tailscale is unavailable' 69
ledger="$(controller_ledger_read)"
current="$(controller_current_read)"
node - "$ledger" "$current" <<'NODE'
const [ledger, current] = process.argv.slice(2).map(JSON.parse);
if (ledger.state !== 'edge_probing' || current.state !== 'present' || current.releaseDigest !== ledger.releaseDigest) {
  throw new Error('preview_funnel_requires_edge_probe_permit');
}
NODE
controller_validate_serving_permit "$ledger" "$current" null
controller_assert_edge_probe_unexpired

scratch="$(mktemp -d)"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
tailscale status --json > "$scratch/tailnet.json"
preview_host="$(node /usr/local/lib/meetwise-preview-controller/preview-funnel-target.mjs host "$scratch/tailnet.json")"

# Never replace an existing Funnel mapping.  A previously configured mapping
# is accepted only when it is already the exact preview target.
tailscale funnel status --json > "$scratch/before.json"
before="$(node /usr/local/lib/meetwise-preview-controller/preview-funnel-target.mjs absent-or-assert "$scratch/before.json" "$preview_host")"
if [[ "$before" == absent ]]; then
  tailscale funnel --https=443 --yes --bg http://127.0.0.1:8080
fi
tailscale funnel status --json > "$scratch/after.json"
origin="$(node /usr/local/lib/meetwise-preview-controller/preview-funnel-target.mjs assert "$scratch/after.json" "$preview_host")"
body="$scratch/edge.html"
if ! curl --fail --silent --show-error --proto '=https' --tlsv1.2 --max-time 20 "$origin/" -o "$body" || ! grep -Fq '<meta name="meetwise-preview-release"' "$body"; then
  if [[ "$before" == absent ]]; then tailscale funnel --https=443 off || true; fi
  controller_fail 'funnel HTTPS probe did not reach preview release' 70
fi
printf '%s\n' "$origin"
