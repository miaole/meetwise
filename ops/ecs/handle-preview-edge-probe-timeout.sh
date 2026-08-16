#!/usr/bin/env bash
set -euo pipefail

# ExecStopPost for the separate watchdog service. It deliberately does not
# acquire the release flock: after the hard deadline it must remove public
# reachability even when the release process is live but stuck while holding
# that flock. The retry timer later serializes ledger repair.
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard handle-preview-edge-probe-timeout.sh

[[ "${SERVICE_RESULT:-}" == timeout ]] || exit 0
failed=0
# The first action removes real public serving. It deliberately precedes any
# marker/fence/permit fsync: a stalled state volume must not delay shutdown.
controller_force_edge_timeout_closure || failed=1
# Never wait for finalization's small fence section at the hard deadline. A
# runtime marker makes an in-flight finalizer reject its completion; the
# expiry unit later persists/reconciles under the ordinary release lock.
controller_try_timeout_edge_fence >/dev/null || failed=1
controller_mark_edge_probe_timeout_runtime || failed=1
controller_mark_edge_probe_timeout || failed=1
systemctl start meetwise-preview-edge-probe-expiry.timer || failed=1
if [[ "$failed" != 0 ]]; then
  printf '%s\n' 'edge-probe watchdog closure was incomplete; retry remains armed' >&2
  exit 70
fi
printf '%s\n' 'edge-probe watchdog deadline closed public serving; ledger recovery remains queued'
