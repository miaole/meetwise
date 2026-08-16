#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard release-preview-web.sh
# The recovery service owns the same flock, so establish it before this
# release obtains the lock. Its successful RemainAfterExit state prevents the
# Web unit's Requires= relation from lazily starting a competing writer.
systemctl restart meetwise-preview-recovery.service
systemctl is-active --quiet meetwise-preview-recovery.service
controller_lock

controller_root=/usr/local/lib/meetwise-preview-controller

if [[ $# -ne 2 || ! -f "$1" ]]; then
  printf '%s\n' 'usage: sudo /usr/local/lib/meetwise-preview-controller/release-preview-web.sh <attested-web-archive> <expires-at-iso>' >&2
  exit 64
fi

controller_reconcile_publication
ledger="$(controller_ledger_read)"
current_state="$(node -e 'console.log(JSON.parse(process.argv[1]).state)' "$ledger")"

rollback_release() {
  local code=$?
  set +e
  state="$(node -e 'console.log(JSON.parse(process.argv[1]).state)' "$(controller_ledger_read)")"
  # A verified public record must never outlive the release it identifies. If
  # revocation cannot be confirmed, retain the active release instead of
  # creating a stale Pages destination.
  if [[ "$state" == publishing || "$state" == verified ]]; then
    if [[ -f /usr/share/meetwise-preview/preview-release-manifest.json ]] && ! "$controller_root/revoke-preview-pages-link.sh"; then
      # If a crash occurred before any public manifest was durable, revocation
      # cannot manufacture a receipt. Disable the edge and stop the candidate
      # rather than leaving a guessed Funnel origin on an unverified release.
      tailscale funnel --https=443 off >/dev/null 2>&1 || true
      systemctl stop meetwise-web-preview.service >/dev/null 2>&1 || true
      printf '%s\n' 'release rollback deferred: Pages revocation is not confirmed; preview edge disabled' >&2
      exit "$code"
    fi
    if [[ -f /usr/share/meetwise-preview/preview-release-manifest.json ]]; then
      state="$(node -e 'console.log(JSON.parse(process.argv[1]).state)' "$(controller_ledger_read)")"
    else
      release_id="$(node -e 'console.log(JSON.parse(process.argv[1]).releaseDigest)' "$(controller_ledger_read)")"
      controller_disable_serving >/dev/null 2>&1 || true
      controller_ledger_transition "$state" failed "$release_id" '' '' disabled >/dev/null 2>&1 || true
      state=failed
    fi
  fi
  controller_disable_serving >/dev/null 2>&1 || true
  controller_clear_current >/dev/null 2>&1 || true
  if [[ "$state" == active_unpublished || "$state" == edge_probing ]]; then
    release_id="$(node -e 'console.log(JSON.parse(process.argv[1]).releaseDigest)' "$(controller_ledger_read)")"
    controller_ledger_transition "$state" failed "$release_id" '' '' disabled >/dev/null 2>&1 || true
  fi
  exit "$code"
}
trap rollback_release ERR
case "$current_state" in
  verified)
    "$controller_root/revoke-preview-pages-link.sh"
    ;;
  active_unpublished)
    release_id="$(node -e 'console.log(JSON.parse(process.argv[1]).releaseDigest)' "$ledger")"
    controller_disable_serving
    controller_ledger_transition active_unpublished revoked "$release_id" '' '' disabled >/dev/null
    ;;
  edge_probing)
    controller_disable_serving
    release_id="$(node -e 'console.log(JSON.parse(process.argv[1]).releaseDigest)' "$ledger")"
    controller_ledger_transition edge_probing failed "$release_id" '' '' disabled >/dev/null
    ;;
  idle|failed|revoked)
    ;;
  *)
    controller_fail 'preview release ledger is in an unrecoverable state' 70
    ;;
esac

release_dir="$("$controller_root/prepare-preview-web-release.sh" "$1")"
"$controller_root/deploy-preview-web.sh" "$release_dir"
"$controller_root/prepare-preview-edge-probe.sh" "$release_dir"
origin="$("$controller_root/enable-preview-funnel.sh")"
"$controller_root/verify-preview-web.sh" "$release_dir"
"$controller_root/finalize-preview-web-release.sh" "$release_dir" "$2"
trap - ERR
printf '%s\n' "preview release verified at $origin; Pages will enable only after its independent signed-manifest probe"
