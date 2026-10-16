#!/usr/bin/env bash
# HA-4 backup loop entrypoint — compose.backup.yml `backup` service command.
#
# Refuse-by-default gate (REQUEST §9-1, dual-review): without
# MEETWISE_HA4_BACKUP_AUTHORIZED=1 (coordinator authorization latch, provisioned
# in the machine .env) this service exits 3 — the container crash-loops loudly
# by design instead of silently running an unauthorized backup plane.
#
# Scheduled form A (dual-review seat2-①): strictly sequential interval loop.
# A beat that runs long only DELAYS the next beat, so a missed beat can never
# pile up into a concurrent double run; scripts/backup/backup.sh additionally
# holds an exclusive mkdir lock as a defense-in-depth latch (V4 probe).
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "${MEETWISE_HA4_BACKUP_AUTHORIZED:-}" != "1" ]; then
  echo "ha4_backup_not_authorized: MEETWISE_HA4_BACKUP_AUTHORIZED must be exactly 1 (coordinator gate; default refuse-to-run)" >&2
  exit 3
fi

interval="${BACKUP_INTERVAL_SECONDS:-21600}"
case "$interval" in
  '' | *[!0-9]*) echo "ha4_backup_interval_invalid: BACKUP_INTERVAL_SECONDS must be a positive integer number of seconds (got a non-numeric value)" >&2; exit 2 ;;
esac
if [ "$interval" -lt 1 ]; then
  echo "ha4_backup_interval_invalid: BACKUP_INTERVAL_SECONDS must be >= 1 second" >&2
  exit 2
fi

while :; do
  # The loop survives failed beats: the per-beat receipt on the volume records
  # the failure and the next beat retries. Alerts/monitoring are out of scope
  # (REQUEST §5-3) — this loop only produces receipts and exit codes.
  if ! sh "$SCRIPT_DIR/backup.sh"; then
    echo "ha4_backup_beat_failed: see the beat receipt on the backup volume; the loop continues and the next beat retries" >&2
  fi
  sleep "$interval"
done
