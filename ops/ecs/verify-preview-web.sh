#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard verify-preview-web.sh
controller_require_lock

if [[ $# -ne 1 ]]; then
  printf '%s\n' 'usage: internal verify-preview-web.sh /srv/meetwise/releases/<release-digest>' >&2
  exit 64
fi

release_dir="$(controller_release_dir "$1")"
release_id="$(basename "$release_dir")"
[[ "$(readlink -f /srv/meetwise/current)" == "$release_dir" ]] || controller_fail 'candidate release is not active' 70
node /usr/local/lib/meetwise-preview-controller/preview-release-artifact.mjs verify "$release_dir" >/dev/null

scratch="$(mktemp -d)"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
tailscale status --json > "$scratch/tailnet.json"
preview_host="$(node /usr/local/lib/meetwise-preview-controller/preview-funnel-target.mjs host "$scratch/tailnet.json")"
tailscale funnel status --json > "$scratch/funnel.json"
origin="$(node /usr/local/lib/meetwise-preview-controller/preview-funnel-target.mjs assert "$scratch/funnel.json" "$preview_host")"
marker="<meta name=\"meetwise-preview-release\" content=\"$release_id\""

curl --fail --silent --show-error --proto '=https' --tlsv1.2 --max-time 20 "${origin}/" -o "$scratch/edge.html"
grep -Fq "$marker" "$scratch/edge.html" || controller_fail 'edge release marker mismatch' 70

for path in / /features /faq /legal; do
  safe_name="$(printf '%s' "$path" | tr '/' '_')"
  file="$scratch/${safe_name:-root}.html"
  [[ "$(curl --fail --silent --show-error --max-time 10 -H "Host: $preview_host" -H 'Cookie: mw_token=must_not_forward' -H 'Authorization: Bearer must_not_forward' --write-out '%{http_code}' -o "$file" "http://127.0.0.1:8080$path")" == 200 ]] || controller_fail "loopback allowed path failed: $path" 70
  grep -Fq "$marker" "$file" || controller_fail "release marker mismatch: $path" 70
done

[[ "$(curl --silent --output "$scratch/unsafe.json" --write-out '%{http_code}' --request POST "${origin}/" -H 'Cookie: mw_token=must_not_forward')" == 503 ]] || controller_fail 'edge write request was not rejected' 70
grep -Fqx '{"error":"public_preview_read_only"}' "$scratch/unsafe.json" || controller_fail 'edge write rejection body is invalid' 70
for path in /api/privacy/export /api/privacy/export?query=1 /login /dashboard /interviews; do
  [[ "$(curl --silent --output /dev/null --write-out '%{http_code}' -H 'Cookie: mw_token=must_not_forward' -H 'Authorization: Bearer must_not_forward' "${origin}${path}")" == 404 ]] || controller_fail "publicly blocked path escaped: $path" 70
done
[[ "$(curl --silent --output /dev/null --write-out '%{http_code}' --request OPTIONS "${origin}/")" == 204 ]] || controller_fail 'allowed options preflight failed' 70
[[ "$(curl --silent --output /dev/null --write-out '%{http_code}' --request OPTIONS "${origin}/api/privacy/export")" == 404 ]] || controller_fail 'blocked options path escaped' 70

for _ in {1..20}; do
  curl --silent --output /dev/null --write-out '%{http_code}\n' --request DELETE "${origin}/" &
done > "$scratch/concurrent.txt"
wait
[[ "$(sort -u "$scratch/concurrent.txt")" == 503 ]] || controller_fail 'concurrent write gate failed' 70

unknown_host_code="$(curl --silent --output /dev/null --write-out '%{http_code}' -H 'Host: invalid.example' http://127.0.0.1:8080/ || true)"
[[ "$unknown_host_code" != 200 ]] || controller_fail 'unknown host reached preview' 70
! ss -lnt | grep -Eq '(^|[[:space:]])(0\.0\.0\.0|\[::\]):(3000|8080)([[:space:]]|$)' || controller_fail 'preview process is bound beyond loopback' 70

allowed_digest="$(cat "$scratch"/*.html | sha256sum | awk '{print $1}')"
printf '{\n  "releaseDigest": "%s",\n  "origin": "%s",\n  "allowedPathDigest": "%s",\n  "writeGateDigest": "%s",\n  "edge": "%s"\n}\n' \
  "$release_id" "$origin" "$allowed_digest" "$(sha256sum "$scratch/unsafe.json" | awk '{print $1}')" "$(sha256sum "$scratch/edge.html" | awk '{print $1}')" > "$release_dir/.meetwise-preview-blackbox-receipt.json"
chown root:root "$release_dir/.meetwise-preview-blackbox-receipt.json"
chmod 0644 "$release_dir/.meetwise-preview-blackbox-receipt.json"
printf '%s\n' 'pre-signing preview Web black-box receipt created; releaseEvidence=false for full application/data plane'
