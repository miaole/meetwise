#!/usr/bin/env bash
set -euo pipefail

# The watchdog removes public reachability at its hard deadline without a
# lock. This small repeating timer waits for the release lock to become free,
# then serializes only the durable ledger recovery for that timed-out attempt.
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard expire-preview-edge-probe.sh

# A timeout retry is a safety mechanism, so remove actual serving before any
# read from the persistent state volume. A stale timer that races a completed
# release may cause a brief fail-closed interruption; reconciliation below
# restores that verified release only after revalidating its complete chain.
# A hung or read-only `/var` must never postpone closing the Web/Funnel edge.
controller_force_edge_timeout_closure || exit 75

fence_readable=1
if fence="$(controller_edge_fence_read)"; then
  fence_state="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$fence")"
else
  fence_readable=0
  fence_state=unreadable
fi
[[ "$fence_readable" == 1 ]] || exit 75

if [[ "$fence_state" == completed ]]; then
  # The watchdog was stopped by a successful finalizer while this timer was
  # already queued. Reconcile the signed terminal chain before restoring the
  # permit, rather than trusting an old process or returning with Web down.
  controller_try_lock || exit 75
  controller_reconcile_publication
  systemctl stop --no-block meetwise-preview-edge-probe-expiry.timer
  exit 0
fi

if [[ "$fence_state" != timed_out ]]; then
  controller_try_timeout_edge_fence >/dev/null || exit 75
fi
controller_mark_edge_probe_timeout_runtime || exit 75
controller_mark_edge_probe_timeout || exit 75
if ! controller_try_lock; then exit 75; fi

controller_reconcile_publication
controller_clear_edge_probe_timeout
systemctl stop --no-block meetwise-preview-edge-probe-expiry.timer
printf '%s\n' 'timed-out edge probe reconciled under the controller lock'
