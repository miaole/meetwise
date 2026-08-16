#!/usr/bin/env bash
# Shared, root-only primitives for the installed preview controller.  This
# file is deliberately never sourced from a candidate release directory.

set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH

readonly MEETWISE_PREVIEW_CONTROLLER_ROOT=/usr/local/lib/meetwise-preview-controller
readonly MEETWISE_PREVIEW_CONTROLLER_STATE=/var/lib/meetwise-preview-controller/state.json
readonly MEETWISE_PREVIEW_CONTROLLER_LOCK=/run/lock/meetwise-preview-controller.lock

controller_fail() {
  printf '%s\n' "$1" >&2
  if [[ "${MEETWISE_PREVIEW_CONTROLLER_TRAP_ERRORS:-}" == 1 ]]; then
    return "${2:-70}"
  fi
  exit "${2:-70}"
}

controller_entry_guard() {
  local expected="$1"
  local actual
  actual="$(readlink -f "$0")"
  [[ "$EUID" -eq 0 ]] || controller_fail 'preview controller requires root' 77
  [[ "$actual" == "$MEETWISE_PREVIEW_CONTROLLER_ROOT/$expected" ]] || controller_fail 'preview controller must run from its installed root-owned path' 77
  [[ -d "$MEETWISE_PREVIEW_CONTROLLER_ROOT" && -f "$MEETWISE_PREVIEW_CONTROLLER_ROOT/controller.sha256" && -f "$MEETWISE_PREVIEW_CONTROLLER_ROOT/controller-version.json" ]] || controller_fail 'preview controller installation is incomplete' 69
  [[ "$(stat -c '%U:%G' "$MEETWISE_PREVIEW_CONTROLLER_ROOT")" == root:root ]] || controller_fail 'preview controller root ownership is invalid' 77
  ! find "$MEETWISE_PREVIEW_CONTROLLER_ROOT" -xdev -perm /022 -print -quit | grep -q . || controller_fail 'preview controller files are writable outside root' 77
  while read -r digest path; do
    [[ "$digest" =~ ^[a-f0-9]{64}$ && "$path" == ./* && "$path" != *'..'* ]] || controller_fail 'preview controller checksum map is invalid' 77
    local target="$MEETWISE_PREVIEW_CONTROLLER_ROOT/${path#./}"
    [[ -f "$target" && ! -L "$target" && "$(stat -c '%U:%G' "$target")" == root:root ]] || controller_fail 'preview controller file ownership is invalid' 77
    local mode
    mode="$(stat -c '%a' "$target")"
    (( (8#$mode & 0022) == 0 )) || controller_fail 'preview controller file mode is invalid' 77
  done < "$MEETWISE_PREVIEW_CONTROLLER_ROOT/controller.sha256"
  (
    cd "$MEETWISE_PREVIEW_CONTROLLER_ROOT"
    sha256sum --check --status controller.sha256
  ) || controller_fail 'preview controller checksum verification failed' 77
}

controller_lock() {
  install -d -o root -g root -m 0700 /run/lock
  exec 9>"$MEETWISE_PREVIEW_CONTROLLER_LOCK"
  flock -n 9 || controller_fail 'another preview release operation is active' 75
}

controller_require_lock() {
  [[ "${MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD:-}" == 1 ]] || controller_fail 'preview operation must run through release-preview-web.sh' 77
}

controller_release_dir() {
  local candidate="$1"
  local root=/srv/meetwise/releases
  local resolved id
  resolved="$(realpath -e "$candidate")"
  id="$(basename "$resolved")"
  [[ "$(dirname "$resolved")" == "$root" && "$id" =~ ^[a-f0-9]{7,64}$ ]] || controller_fail 'release path is invalid' 64
  printf '%s\n' "$resolved"
}

controller_tailnet_host() {
  local scratch host
  scratch="$(mktemp)"
  tailscale status --json > "$scratch"
  host="$(node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-funnel-target.mjs" host "$scratch")"
  rm -f "$scratch"
  printf '%s\n' "$host"
}

controller_ledger_transition() {
  local from="$1" to="$2" release="${3:-}" fingerprint="${4:-}" origin="${5:-}" page_state="${6:-}"
  install -d -o root -g root -m 0700 /var/lib/meetwise-preview-controller
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-release-ledger.mjs" transition \
    --path "$MEETWISE_PREVIEW_CONTROLLER_STATE" \
    --from "$from" --to "$to" --release "$release" --fingerprint "$fingerprint" --origin "$origin" --pages "$page_state"
}

controller_ledger_read() {
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-release-ledger.mjs" read --path "$MEETWISE_PREVIEW_CONTROLLER_STATE"
}

controller_publish_manifest() {
  local input="$1" output="$2"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-release-manifest.mjs" publish --input "$input" --output "$output"
}

controller_reconcile_publication() {
  MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$MEETWISE_PREVIEW_CONTROLLER_ROOT/reconcile-preview-publication.sh"
}
