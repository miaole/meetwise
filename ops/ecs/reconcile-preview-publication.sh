#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard reconcile-preview-publication.sh
controller_require_lock

controller_root=/usr/local/lib/meetwise-preview-controller
public_manifest=/usr/share/meetwise-preview/preview-release-manifest.json
public_key="$controller_root/preview-release-ed25519.pub.pem"

fail_closed() {
  local reason="$1"
  set +e
  controller_disable_serving
  local disable_status=$?
  set -e
  if [[ "$disable_status" != 0 ]]; then
    controller_fail "preview reconciliation failed and the edge could not be confirmed disabled: $reason" 70
  fi
  controller_fail "preview publication reconciliation failed: $reason" 70
}

if ! ledger="$(controller_ledger_read)"; then
  fail_closed 'preview_reconcile_ledger_unreadable'
fi
if ! current="$(controller_current_read)"; then
  fail_closed 'preview_reconcile_current_unreadable'
fi

manifest_summary='null'
if [[ -e "$public_manifest" ]]; then
  if [[ ! -f "$public_manifest" || -L "$public_manifest" || "$(stat -c '%U:%G:%a' "$public_manifest")" != root:root:644 ]]; then
    fail_closed 'preview_reconcile_public_manifest_metadata_invalid'
  fi
  if ! manifest_summary="$(node --input-type=module - "$public_manifest" "$public_key" "$controller_root/preview-release-manifest.mjs" <<'NODE'
import { readFile } from 'node:fs/promises';
const [manifestPath, keyPath, modulePath] = process.argv.slice(2);
const [{ verifyManifest, manifestFingerprint }, manifest, publicKey] = await Promise.all([
  import(modulePath),
  readFile(manifestPath, 'utf8').then(JSON.parse),
  readFile(keyPath, 'utf8'),
]);
const verified = verifyManifest(manifest, publicKey, { allowExpired: true });
const expiresAt = Date.parse(verified.expiresAt);
if (!Number.isFinite(expiresAt)) throw new Error('preview_reconcile_manifest_expiry_invalid');
process.stdout.write(JSON.stringify({
  status: verified.status,
  releaseDigest: verified.releaseDigest,
  fingerprint: manifestFingerprint(verified),
  expired: expiresAt <= Date.now(),
}));
NODE
)"; then
    fail_closed 'preview_reconcile_public_manifest_unverifiable'
  fi
fi

# A watchdog timeout—or an `armed` fence observed by a new reconciliation—is
# a durable negative authorization. The latter is non-resumable because its
# monotonic deadline belongs to an earlier process/boot. Neither case may
# recreate a public permit from otherwise matching ledger fields.
if ! edge_fence="$(controller_edge_fence_read)"; then
  fail_closed 'preview_reconcile_edge_fence_unreadable'
fi
edge_fence_state="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$edge_fence")"
if [[ "$edge_fence_state" == timed_out || "$edge_fence_state" == armed || -e "$MEETWISE_PREVIEW_EDGE_TIMEOUT_MARKER" || -e "$MEETWISE_PREVIEW_EDGE_TIMEOUT_RUNTIME_MARKER" ]]; then
  controller_force_edge_timeout_closure || fail_closed 'preview_reconcile_edge_timeout_closure_failed'
  ledger_state="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$ledger")"
  release_id="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).releaseDigest ?? "")' "$ledger")"
  if [[ "$manifest_summary" != null ]]; then
    manifest_status="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).status)' "$manifest_summary")"
    # `revoke-preview-pages-link.sh` records the terminal ledger state only
    # after Pages has published its disabled receipt. A crash after that
    # transition but before the stale deadline markers are cleared must be
    # idempotently retired here—not treated as a second revocation and left
    # unable to stage the next release.
    if [[ "$manifest_status" != revoked || "$ledger_state" != revoked ]]; then
      "$controller_root/revoke-preview-pages-link.sh" --single-check || fail_closed 'preview_reconcile_edge_timeout_revocation_failed'
    fi
  else
    case "$ledger_state" in
      staged|active_unpublished|edge_probing|publishing|verified)
        controller_ledger_transition "$ledger_state" failed "$release_id" '' '' disabled >/dev/null
        ;;
      idle|failed|revoked)
        ;;
      *)
        fail_closed 'preview_reconcile_edge_timeout_state_invalid'
        ;;
    esac
  fi
  controller_clear_edge_probe_timeout
  controller_clear_edge_probe_timeout_runtime
  controller_clear_edge_fence
  exit 0
fi

if ! decision="$(node --input-type=module - "$ledger" "$manifest_summary" "$current" "$controller_root/preview-publication-recovery.mjs" <<'NODE'
const [ledgerJson, manifestJson, currentJson, modulePath] = process.argv.slice(2);
const { decidePublicationReconciliation } = await import(modulePath);
process.stdout.write(JSON.stringify(decidePublicationReconciliation({
  ledger: JSON.parse(ledgerJson),
  manifest: JSON.parse(manifestJson),
  current: JSON.parse(currentJson),
})));
NODE
)"; then
  fail_closed 'preview_reconcile_decision_unreadable'
fi

action="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).action)' "$decision")"
case "$action" in
  serve_public)
    controller_issue_serving_permit "$ledger" "$current" "$manifest_summary"
    controller_validate_serving_permit "$ledger" "$current" "$manifest_summary"
    ;;
  serve_loopback)
    # An unpublished candidate may satisfy loopback checks, but it can never
    # inherit a public Funnel mapping left behind by a crashed predecessor.
    if ! tailscale funnel --https=443 off >/dev/null 2>&1; then
      fail_closed 'preview_reconcile_loopback_funnel_disable_failed'
    fi
    controller_issue_serving_permit "$ledger" "$current" "$manifest_summary"
    controller_validate_serving_permit "$ledger" "$current" "$manifest_summary"
    ;;
  abort_edge_probe)
    # A probe is intentionally non-resumable. A reboot, a controller restart,
    # or any separate reconciliation closes the edge before it marks this
    # particular attempt failed; a fresh release must begin again on loopback.
    release_id="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).releaseDigest)' "$ledger")"
    controller_disable_serving
    controller_ledger_transition edge_probing failed "$release_id" '' '' disabled >/dev/null
    ;;
  confirm_revocation|revoke_public_manifest)
    if ! "$controller_root/revoke-preview-pages-link.sh" --single-check; then
      fail_closed 'preview_reconcile_revocation_failed'
    fi
    # A confirmed revocation deliberately has no serving permit. The caller
    # may stage a new release only after this function returns.
    controller_disable_serving
    ;;
  disabled)
    controller_disable_serving
    ;;
  block)
    reason="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).reason)' "$decision")"
    state="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$ledger")"
    if [[ "$reason" == preview_reconcile_public_manifest_missing && ( "$state" == publishing || "$state" == verified ) ]]; then
      # A private staging/ledger crash never has a Pages-visible record to
      # revoke. Make that incomplete attempt terminal so a later controlled
      # release can start from `failed` instead of being permanently wedged.
      release_id="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).releaseDigest)' "$ledger")"
      controller_disable_serving
      controller_ledger_transition "$state" failed "$release_id" '' '' disabled >/dev/null
      exit 0
    fi
    fail_closed "$reason"
    ;;
  *)
    fail_closed 'preview_reconcile_action_invalid'
    ;;
esac
