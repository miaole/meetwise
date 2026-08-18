#!/usr/bin/env bash
# Shared, root-only primitives for the installed preview controller.  This
# file is deliberately never sourced from a candidate release directory.

set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH

readonly MEETWISE_PREVIEW_CONTROLLER_ROOT=/usr/local/lib/meetwise-preview-controller
readonly MEETWISE_PREVIEW_CONTROLLER_STATE=/var/lib/meetwise-preview-controller/state.json
readonly MEETWISE_PREVIEW_SERVING_PERMIT=/var/lib/meetwise-preview-controller/serving-permit.json
readonly MEETWISE_PREVIEW_PENDING_MANIFEST=/var/lib/meetwise-preview-controller/pending-public-manifest.json
readonly MEETWISE_PREVIEW_EDGE_TIMEOUT_MARKER=/var/lib/meetwise-preview-controller/edge-probe-timeout.json
readonly MEETWISE_PREVIEW_EDGE_FENCE=/var/lib/meetwise-preview-controller/edge-probe-fence.json
readonly MEETWISE_PREVIEW_CONTROLLER_RUNTIME=/run/meetwise-preview-controller
readonly MEETWISE_PREVIEW_EDGE_TIMEOUT_RUNTIME_MARKER=/run/meetwise-preview-controller/edge-probe-timeout
readonly MEETWISE_PREVIEW_CONTROLLER_LOCK=/run/meetwise-preview-controller/controller.lock
readonly MEETWISE_PREVIEW_EDGE_FENCE_LOCK=/run/meetwise-preview-controller/edge-probe-fence.lock
readonly MEETWISE_PREVIEW_FULL_STACK_RETIRED_FENCE=/var/lib/meetwise-preview-controller/full-stack-writer-retired
readonly MEETWISE_PREVIEW_ROOT=/srv/meetwise-preview
readonly MEETWISE_PREVIEW_RELEASE_ROOT=/srv/meetwise-preview/releases
readonly MEETWISE_PREVIEW_CURRENT_LINK=/srv/meetwise-preview/current

controller_fail() {
  printf '%s\n' "$1" >&2
  exit "${2:-70}"
}

controller_entry_guard() {
  local expected="$1"
  local actual
  actual="$(readlink -f "$0")"
  [[ "$EUID" -eq 0 ]] || controller_fail 'preview controller requires root' 77
  [[ ! -e "$MEETWISE_PREVIEW_FULL_STACK_RETIRED_FENCE" ]] || controller_fail 'legacy preview controller is retired by the full-stack publisher' 69
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
  install -d -o root -g root -m 0700 "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME"
  [[ "$(stat -c '%U:%G:%a' "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME")" == root:root:700 && ! -L "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME" ]] \
    || controller_fail 'preview controller runtime directory is unsafe' 77
  [[ ! -L "$MEETWISE_PREVIEW_CONTROLLER_LOCK" && ( ! -e "$MEETWISE_PREVIEW_CONTROLLER_LOCK" || -f "$MEETWISE_PREVIEW_CONTROLLER_LOCK" ) ]] \
    || controller_fail 'preview controller lock file is unsafe' 77
  (umask 077; : >>"$MEETWISE_PREVIEW_CONTROLLER_LOCK")
  [[ "$(stat -c '%U:%G' "$MEETWISE_PREVIEW_CONTROLLER_LOCK")" == root:root ]] \
    || controller_fail 'preview controller lock ownership is unsafe' 77
  exec 9>>"$MEETWISE_PREVIEW_CONTROLLER_LOCK"
  flock -n 9 || controller_fail 'another preview release operation is active' 75
}

controller_try_lock() {
  install -d -o root -g root -m 0700 "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME"
  [[ "$(stat -c '%U:%G:%a' "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME")" == root:root:700 && ! -L "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME" ]] \
    || controller_fail 'preview controller runtime directory is unsafe' 77
  [[ ! -L "$MEETWISE_PREVIEW_CONTROLLER_LOCK" && ( ! -e "$MEETWISE_PREVIEW_CONTROLLER_LOCK" || -f "$MEETWISE_PREVIEW_CONTROLLER_LOCK" ) ]] \
    || controller_fail 'preview controller lock file is unsafe' 77
  (umask 077; : >>"$MEETWISE_PREVIEW_CONTROLLER_LOCK")
  [[ "$(stat -c '%U:%G' "$MEETWISE_PREVIEW_CONTROLLER_LOCK")" == root:root ]] \
    || controller_fail 'preview controller lock ownership is unsafe' 77
  exec 9>>"$MEETWISE_PREVIEW_CONTROLLER_LOCK"
  flock -n 9
}

controller_edge_fence_lock() {
  install -d -o root -g root -m 0700 "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME"
  [[ "$(stat -c '%U:%G:%a' "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME")" == root:root:700 && ! -L "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME" ]] \
    || controller_fail 'preview edge fence runtime directory is unsafe' 77
  [[ ! -L "$MEETWISE_PREVIEW_EDGE_FENCE_LOCK" && ( ! -e "$MEETWISE_PREVIEW_EDGE_FENCE_LOCK" || -f "$MEETWISE_PREVIEW_EDGE_FENCE_LOCK" ) ]] \
    || controller_fail 'preview edge fence lock file is unsafe' 77
  (umask 077; : >>"$MEETWISE_PREVIEW_EDGE_FENCE_LOCK")
  [[ "$(stat -c '%U:%G' "$MEETWISE_PREVIEW_EDGE_FENCE_LOCK")" == root:root ]] \
    || controller_fail 'preview edge fence lock ownership is unsafe' 77
  exec 8>>"$MEETWISE_PREVIEW_EDGE_FENCE_LOCK"
  flock 8
}

controller_edge_fence_unlock() {
  flock -u 8 || true
  exec 8>&-
}

controller_try_edge_fence_lock() {
  install -d -o root -g root -m 0700 "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME"
  [[ "$(stat -c '%U:%G:%a' "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME")" == root:root:700 && ! -L "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME" ]] \
    || controller_fail 'preview edge fence runtime directory is unsafe' 77
  [[ ! -L "$MEETWISE_PREVIEW_EDGE_FENCE_LOCK" && ( ! -e "$MEETWISE_PREVIEW_EDGE_FENCE_LOCK" || -f "$MEETWISE_PREVIEW_EDGE_FENCE_LOCK" ) ]] \
    || controller_fail 'preview edge fence lock file is unsafe' 77
  (umask 077; : >>"$MEETWISE_PREVIEW_EDGE_FENCE_LOCK")
  [[ "$(stat -c '%U:%G' "$MEETWISE_PREVIEW_EDGE_FENCE_LOCK")" == root:root ]] \
    || controller_fail 'preview edge fence lock ownership is unsafe' 77
  exec 8>>"$MEETWISE_PREVIEW_EDGE_FENCE_LOCK"
  flock -n 8
}

controller_require_lock() {
  [[ -e /proc/$$/fd/9 && "$(readlink -f /proc/$$/fd/9)" == "$MEETWISE_PREVIEW_CONTROLLER_LOCK" ]] \
    || controller_fail 'preview operation has no inherited controller lock file descriptor' 77
  flock -n 9 || controller_fail 'preview operation does not hold the controller lock' 75
}

controller_release_dir() {
  local candidate="$1"
  local root="$MEETWISE_PREVIEW_RELEASE_ROOT"
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

controller_assert_root_trust_ancestry() {
  local path="$1" ancestor mode index
  local -a ancestors=()
  [[ "$path" == /* ]] || controller_fail 'preview release trust path must be absolute' 77
  ancestor="$path"
  while :; do
    ancestors+=("$ancestor")
    [[ "$ancestor" == / ]] && break
    ancestor="$(dirname "$ancestor")"
  done
  for ((index=${#ancestors[@]} - 1; index >= 0; index--)); do
    ancestor="${ancestors[index]}"
    [[ -d "$ancestor" && ! -L "$ancestor" && "$(stat -c '%U:%G' "$ancestor")" == root:root ]] \
      || controller_fail 'preview release trust ancestor ownership is invalid' 77
    mode="$(stat -c '%a' "$ancestor")"
    (( (8#$mode & 0022) == 0 )) || controller_fail 'preview release trust ancestor is writable outside root' 77
  done
}

controller_assert_root_readonly_path() {
  local path="$1" mode
  [[ -e "$path" && ! -L "$path" && "$(stat -c '%U:%G' "$path")" == root:root ]] \
    || controller_fail 'preview release trust path ownership is invalid' 77
  mode="$(stat -c '%a' "$path")"
  (( (8#$mode & 0022) == 0 )) || controller_fail 'preview release trust path is writable outside root' 77
}

controller_assert_preview_trust_root() {
  controller_assert_root_trust_ancestry "$MEETWISE_PREVIEW_ROOT"
  [[ -d "$MEETWISE_PREVIEW_ROOT" && ! -L "$MEETWISE_PREVIEW_ROOT" && "$(stat -c '%U:%G:%a' "$MEETWISE_PREVIEW_ROOT")" == root:root:755 ]] \
    || controller_fail 'preview release root metadata is invalid' 77
  controller_assert_root_trust_ancestry "$MEETWISE_PREVIEW_RELEASE_ROOT"
  [[ -d "$MEETWISE_PREVIEW_RELEASE_ROOT" && ! -L "$MEETWISE_PREVIEW_RELEASE_ROOT" && "$(stat -c '%U:%G:%a' "$MEETWISE_PREVIEW_RELEASE_ROOT")" == root:root:755 ]] \
    || controller_fail 'preview release directory metadata is invalid' 77
}

controller_current_read() {
  controller_assert_preview_trust_root
  local current release_directory
  current="$(node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-current-pointer.mjs" inspect \
    --pointer "$MEETWISE_PREVIEW_CURRENT_LINK" --release-root "$MEETWISE_PREVIEW_RELEASE_ROOT")"
  release_directory="$(node -e 'const value=JSON.parse(process.argv[1]); if(value.state === "present") process.stdout.write(value.releaseDirectory)' "$current")"
  if [[ -n "$release_directory" ]]; then controller_assert_root_readonly_path "$release_directory"; fi
  printf '%s\n' "$current"
}

controller_current_switch() {
  local release_dir
  controller_assert_preview_trust_root
  release_dir="$(controller_release_dir "$1")"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-current-pointer.mjs" switch \
    --pointer "$MEETWISE_PREVIEW_CURRENT_LINK" --release-root "$MEETWISE_PREVIEW_RELEASE_ROOT" --release "$release_dir" >/dev/null
}

controller_clear_current() {
  controller_assert_preview_trust_root
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-current-pointer.mjs" clear --pointer "$MEETWISE_PREVIEW_CURRENT_LINK"
}

controller_issue_serving_permit() {
  local ledger="$1" current="$2" manifest="$3"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-serving-permit.mjs" issue --path "$MEETWISE_PREVIEW_SERVING_PERMIT" \
    --ledger "$ledger" --current "$current" --manifest "$manifest" >/dev/null
}

controller_validate_serving_permit() {
  local ledger="$1" current="$2" manifest="$3"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-serving-permit.mjs" validate --path "$MEETWISE_PREVIEW_SERVING_PERMIT" \
    --ledger "$ledger" --current "$current" --manifest "$manifest" >/dev/null
}

controller_clear_serving_permit() {
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-serving-permit.mjs" clear --path "$MEETWISE_PREVIEW_SERVING_PERMIT"
}

controller_monotonic_milliseconds() {
  awk '{ printf "%.0f\n", $1 * 1000 }' /proc/uptime
}

controller_edge_fence_read() {
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-edge-probe-fence.mjs" read --path "$MEETWISE_PREVIEW_EDGE_FENCE"
}

controller_clear_edge_fence() {
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-edge-probe-fence.mjs" clear --path "$MEETWISE_PREVIEW_EDGE_FENCE"
}

controller_arm_edge_fence() {
  local release_id="$1" now deadline
  controller_edge_fence_lock
  now="$(controller_monotonic_milliseconds)"
  deadline="$(( now + 60000 ))"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-edge-probe-fence.mjs" arm \
    --path "$MEETWISE_PREVIEW_EDGE_FENCE" --release "$release_id" --deadline-ms "$deadline" >/dev/null
  controller_edge_fence_unlock
}

controller_complete_edge_fence_held() {
  local release_id="$1" now
  now="$(controller_monotonic_milliseconds)"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-edge-probe-fence.mjs" complete \
    --path "$MEETWISE_PREVIEW_EDGE_FENCE" --release "$release_id" --now-ms "$now" >/dev/null
}

controller_timeout_edge_fence() {
  local now
  controller_edge_fence_lock
  now="$(controller_monotonic_milliseconds)"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-edge-probe-fence.mjs" timeout \
    --path "$MEETWISE_PREVIEW_EDGE_FENCE" --now-ms "$now"
  controller_edge_fence_unlock
}

controller_try_timeout_edge_fence() {
  local now
  controller_try_edge_fence_lock || return 75
  now="$(controller_monotonic_milliseconds)"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-edge-probe-fence.mjs" timeout \
    --path "$MEETWISE_PREVIEW_EDGE_FENCE" --now-ms "$now"
  controller_edge_fence_unlock
}

controller_mark_edge_probe_timeout() {
  install -d -o root -g root -m 0700 /var/lib/meetwise-preview-controller
  local temporary="${MEETWISE_PREVIEW_EDGE_TIMEOUT_MARKER}.$$.tmp"
  umask 077
  printf '{"schemaVersion":1,"timedOutAt":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$temporary"
  sync "$temporary"
  mv -f "$temporary" "$MEETWISE_PREVIEW_EDGE_TIMEOUT_MARKER"
  sync -d /var/lib/meetwise-preview-controller
}

controller_mark_edge_probe_timeout_runtime() {
  install -d -o root -g root -m 0700 "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME"
  local temporary="${MEETWISE_PREVIEW_EDGE_TIMEOUT_RUNTIME_MARKER}.$$.tmp"
  umask 077
  printf '%s\n' timeout > "$temporary"
  sync "$temporary"
  mv -f "$temporary" "$MEETWISE_PREVIEW_EDGE_TIMEOUT_RUNTIME_MARKER"
  sync -d "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME"
}

controller_clear_edge_probe_timeout() {
  rm -f "$MEETWISE_PREVIEW_EDGE_TIMEOUT_MARKER"
  sync -d /var/lib/meetwise-preview-controller
}

controller_clear_edge_probe_timeout_runtime() {
  rm -f "$MEETWISE_PREVIEW_EDGE_TIMEOUT_RUNTIME_MARKER"
  sync -d "$MEETWISE_PREVIEW_CONTROLLER_RUNTIME"
}

controller_edge_probe_timeout_fenced() {
  [[ -e "$MEETWISE_PREVIEW_EDGE_TIMEOUT_MARKER" || -e "$MEETWISE_PREVIEW_EDGE_TIMEOUT_RUNTIME_MARKER" ]] && return 0
  local state
  state="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$(controller_edge_fence_read)")"
  [[ "$state" == timed_out ]]
}

controller_assert_edge_probe_unexpired() {
  [[ ! -e "$MEETWISE_PREVIEW_EDGE_TIMEOUT_MARKER" && ! -e "$MEETWISE_PREVIEW_EDGE_TIMEOUT_RUNTIME_MARKER" ]] || controller_fail 'preview edge probe watchdog expired' 70
  local fence state deadline now
  fence="$(controller_edge_fence_read)"
  state="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$fence")"
  [[ "$state" == armed ]] || controller_fail 'preview edge probe fence is not armed' 70
  deadline="$(node -e 'process.stdout.write(String(JSON.parse(process.argv[1]).deadlineMonotonicMs))' "$fence")"
  now="$(controller_monotonic_milliseconds)"
  (( now < deadline )) || controller_fail 'preview edge probe deadline elapsed before watchdog closure' 70
}

controller_complete_edge_probe_fence_held() {
  [[ ! -e "$MEETWISE_PREVIEW_EDGE_TIMEOUT_MARKER" && ! -e "$MEETWISE_PREVIEW_EDGE_TIMEOUT_RUNTIME_MARKER" ]] \
    || controller_fail 'preview edge probe watchdog fenced publication' 70
  systemctl is-active --quiet meetwise-preview-edge-probe-watchdog.service \
    || controller_fail 'preview edge probe watchdog is no longer active' 70
  controller_complete_edge_fence_held "$1"
}

controller_funnel_status_is_closed() {
  # Tailscale reports a non-zero result for `funnel off` when Funnel has not
  # been enabled for the tailnet. That message is not evidence of a live
  # mapping. The status response is the authority: only an empty Web map can
  # let the caller treat the edge as closed.
  local status_file result
  status_file="$(mktemp)" || return 1
  if ! controller_tailscale_funnel status --json >"$status_file" 2>/dev/null; then
    rm -f "$status_file"
    return 1
  fi
  set +e
  /usr/bin/node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-funnel-status.mjs" "$status_file"
  result=$?
  set -e
  rm -f "$status_file"
  return "$result"
}

controller_tailscale_funnel() {
  # GNU timeout sends TERM first; Tailscale CLI can ignore or outlive that
  # signal while a control-plane request is wedged. A one-second KILL grace
  # makes the 15-second command budget real and lets the caller continue its
  # fail-closed recovery path.
  command -v tailscale >/dev/null || return 127
  timeout --kill-after=1s 15s tailscale funnel "$@"
}

controller_unit_load_state() {
  local unit="$1" state
  state="$(timeout 5s systemctl show --property=LoadState --value "$unit" 2>/dev/null)" || return 1
  case "$state" in
    loaded|not-found) printf '%s\n' "$state" ;;
    *) return 1 ;;
  esac
}

controller_require_edge_probe_units_loaded() {
  # `reset-failed` is allowed to be a no-op for a never-started static unit,
  # but it is never evidence that the timeout/retry chain exists. Verify the
  # complete recovery chain through PID 1 before any edge-probe state,
  # permit, Web restart or Funnel action becomes possible.
  local unit state
  for unit in \
    meetwise-preview-edge-probe-watchdog.service \
    meetwise-preview-edge-probe-expiry.service \
    meetwise-preview-edge-probe-expiry.timer; do
    state="$(timeout 5s systemctl show --property=LoadState --value "$unit" 2>/dev/null)" \
      || controller_fail 'preview edge probe recovery unit is unavailable' 70
    [[ "$state" == loaded ]] \
      || controller_fail 'preview edge probe recovery unit is unavailable' 70
  done
}

controller_unit_is_inactive() {
  local unit="$1" state
  state="$(timeout 5s systemctl show --property=ActiveState --value "$unit" 2>/dev/null)" || return 1
  [[ "$state" == inactive || "$state" == failed ]]
}

controller_close_public_preview_edge() {
  # Stop the local origin and withdraw the public Funnel concurrently. Each
  # command has its own fixed budget so a stalled D-Bus call cannot add a
  # second 15-second delay before Tailscale is asked to remove the mapping.
  # State writes deliberately happen only after both physical-close attempts.
  local web_pid funnel_pid failed=0
  # Launch Funnel withdrawal before any D-Bus query. A delayed or failed
  # systemd query must never postpone the only public-edge close operation.
  if command -v tailscale >/dev/null; then
    controller_tailscale_funnel --https=443 off >/dev/null 2>&1 &
    funnel_pid=$!
  else
    funnel_pid=''
    failed=1
  fi
  # Start the stop request in parallel with bounded discovery. A known missing
  # unit makes its non-zero stop result harmless; a loaded unit must finish
  # within its manager and client bounds. D-Bus/fragment errors are closure
  # failures, not absence.
  timeout 15s systemctl stop meetwise-web-preview.service >/dev/null 2>&1 &
  web_pid=$!
  local web_load_state=''
  if ! web_load_state="$(controller_unit_load_state meetwise-web-preview.service)"; then
    failed=1
  fi
  if ! wait "$web_pid" && [[ "$web_load_state" == loaded ]]; then
    failed=1
  fi
  # A timeout kills only the systemctl client, not PID 1's outstanding stop
  # job. The unit's own TimeoutStopSec is bounded too, and this immediate
  # state check prevents a still-running origin from being called closed.
  [[ "$web_load_state" != loaded ]] || controller_unit_is_inactive meetwise-web-preview.service || failed=1
  # A disabled Funnel feature may make `funnel off` return non-zero. Its
  # status must nevertheless be queried; status failure or a non-empty Web
  # map remains a fail-closed error.
  if [[ -n "$funnel_pid" ]]; then wait "$funnel_pid" || true; fi
  controller_funnel_status_is_closed || failed=1
  return "$failed"
}

controller_force_edge_timeout_closure() {
  local failed=0
  # The hard-deadline path must remove real serving before it touches `/var`.
  # A full, read-only or stalled state volume is not allowed to postpone the
  # Web/Funnel shutdown which protects the public edge.
  controller_close_public_preview_edge || failed=1
  controller_clear_serving_permit || failed=1
  return "$failed"
}

controller_stop_preview_candidates() {
  local listing unit failed=0
  if ! listing="$(timeout 5s systemctl list-units --all --no-legend --plain --no-pager 'meetwise-preview-candidate-*.service')"; then
    return 1
  fi
  while IFS= read -r unit; do
    [[ -n "$unit" ]] || continue
    unit="${unit%%[[:space:]]*}"
    [[ "$unit" =~ ^meetwise-preview-candidate-[a-z0-9-]+\.service$ ]] || return 1
    timeout 15s systemctl stop "$unit" >/dev/null 2>&1 || failed=1
    controller_unit_is_inactive "$unit" || failed=1
  done <<< "$listing"
  return "$failed"
}

controller_disable_serving() {
  local failed=0
  set +e
  # `controller_disable_serving` is also used when the persistent ledger,
  # permit or fence cannot be read. Never make those state-volume operations
  # a prerequisite for isolating the running edge.
  controller_close_public_preview_edge || failed=1
  controller_stop_preview_candidates || failed=1
  controller_clear_serving_permit || failed=1
  set -e
  [[ "$failed" == 0 ]] || controller_fail 'preview edge or serving permit could not be disabled' 70
}

controller_publish_manifest() {
  local input="$1" output="$2" mode="${3:-644}"
  node "$MEETWISE_PREVIEW_CONTROLLER_ROOT/preview-release-manifest.mjs" publish --input "$input" --output "$output" --mode "$mode"
}

controller_reconcile_publication() {
  "$MEETWISE_PREVIEW_CONTROLLER_ROOT/reconcile-preview-publication.sh"
}
