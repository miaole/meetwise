#!/usr/bin/env bash
# with-docker-session.sh — Line AC / G7 env-gap Path A session activation
#
# Purpose: run a command with the host docker socket reachable when the
# invoking uid is ALREADY a member of the docker group in /etc/group but the
# current shell session did not inherit that supplemental group.
#
# Honesty bounds (Ban list):
#   - Ban sudo / setfacl / chmod on /var/run/docker.sock
#   - Ban usermod / gpasswd / writing /etc/group (no self-grant)
#   - Ban interactive newgrp grant ceremony; only `sg docker` when membership
#     is already present (same pattern as NHP-001 / UC004 prove receipts)
#   - Ban loading MODEL_* / .env* / secrets; caller must strip keys
#   - Ban buy cloud · Ban Meridian
#   - Success of this wrapper ≠ suite green ≠ g7SuiteGreen=true
#
# Exit:
#   - 0/N = wrapped command exit (passthrough)
#   - 77 = impassable env-gap (no pre-existing docker membership; Path B)

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <command> [args...]" >&2
  exit 2
fi

can_docker() {
  docker info >/dev/null 2>&1
}

in_docker_group_db() {
  local user
  user="$(id -un)"
  getent group docker 2>/dev/null | awk -F: -v u="$user" '{
    n=split($4, a, ",");
    for (i=1;i<=n;i++) if (a[i]==u) exit 0;
    exit 1
  }'
}

if can_docker; then
  exec "$@"
fi

if in_docker_group_db; then
  # Pre-existing membership; session inheritance gap only.
  echo "with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)" >&2
  # sg -c takes a shell command string; quote argv safely.
  quoted=$(printf '%q ' "$@")
  exec sg docker -c "$quoted"
fi

echo "with-docker-session: IMPASSABLE env-gap — uid $(id -un) not in docker group (getent) and docker info failed; Path B blocker (Ban self-grant / Ban sudo / Ban chmod sock)" >&2
exit 77
