#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard release-preview-web.sh
controller_lock

controller_root=/usr/local/lib/meetwise-preview-controller

if [[ $# -ne 2 || ! -f "$1" ]]; then
  printf '%s\n' 'usage: sudo /usr/local/lib/meetwise-preview-controller/release-preview-web.sh <attested-web-archive> <expires-at-iso>' >&2
  exit 64
fi

controller_reconcile_publication
ledger="$(controller_ledger_read)"
current_state="$(node -e 'console.log(JSON.parse(process.argv[1]).state)' "$ledger")"
previous_target=''
if [[ -L /srv/meetwise/current ]]; then previous_target="$(readlink -f /srv/meetwise/current)"; fi
[[ -n "$previous_target" && "$(dirname "$previous_target")" == /srv/meetwise/releases ]] || previous_target=''
activated=0

rollback_release() {
  local code=$?
  set +e
  state="$(node -e 'console.log(JSON.parse(process.argv[1]).state)' "$(controller_ledger_read)")"
  # A verified public record must never outlive the release it identifies. If
  # revocation cannot be confirmed, retain the active release instead of
  # creating a stale Pages destination.
  if [[ "$state" == publishing || "$state" == verified ]]; then
    if ! MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$controller_root/revoke-preview-pages-link.sh"; then
      # If a crash occurred before any public manifest was durable, revocation
      # cannot manufacture a receipt. Disable the edge and stop the candidate
      # rather than leaving a guessed Funnel origin on an unverified release.
      tailscale funnel --https=443 off >/dev/null 2>&1 || true
      systemctl stop meetwise-web-preview.service >/dev/null 2>&1 || true
      printf '%s\n' 'release rollback deferred: Pages revocation is not confirmed; preview edge disabled' >&2
      exit "$code"
    fi
    state="$(node -e 'console.log(JSON.parse(process.argv[1]).state)' "$(controller_ledger_read)")"
  fi
  if [[ "$activated" == 1 ]]; then
    if [[ -n "$previous_target" ]]; then
      previous_id="$(basename "$previous_target")"
      ln -sfn "$previous_target" /srv/meetwise/current
      printf 'MEETWISE_PUBLIC_PREVIEW=1\nMEETWISE_PREVIEW_RELEASE_DIGEST=%s\n' "$previous_id" | install -o root -g root -m 0644 /dev/stdin /etc/meetwise/preview-web.env
      systemctl restart meetwise-web-preview.service
    else
      systemctl stop meetwise-web-preview.service
      rm -f /srv/meetwise/current
      tailscale funnel --https=443 off >/dev/null 2>&1 || true
    fi
  fi
  if [[ "$state" == active_unpublished ]]; then
    release_id="$(node -e 'console.log(JSON.parse(process.argv[1]).releaseDigest)' "$(controller_ledger_read)")"
    controller_ledger_transition "$state" failed "$release_id" '' '' disabled >/dev/null 2>&1 || true
  fi
  exit "$code"
}
trap rollback_release ERR
case "$current_state" in
  verified)
    MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$controller_root/revoke-preview-pages-link.sh"
    ;;
  active_unpublished)
    release_id="$(node -e 'console.log(JSON.parse(process.argv[1]).releaseDigest)' "$ledger")"
    controller_ledger_transition active_unpublished revoked "$release_id" '' '' disabled >/dev/null
    ;;
  idle|failed|revoked)
    ;;
  *)
    controller_fail 'preview release ledger is in an unrecoverable state' 70
    ;;
esac

release_dir="$(MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$controller_root/prepare-preview-web-release.sh" "$1")"
MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$controller_root/deploy-preview-web.sh" "$release_dir"
activated=1
origin="$(MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$controller_root/enable-preview-funnel.sh")"
MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$controller_root/verify-preview-web.sh" "$release_dir"
MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1 "$controller_root/finalize-preview-web-release.sh" "$release_dir" "$2"
trap - ERR
printf '%s\n' "preview release verified at $origin; Pages will enable only after its independent signed-manifest probe"
