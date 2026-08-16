#!/bin/bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
[[ "$EUID" -eq 0 ]] || { echo full_stack_probe_expiry_requires_root >&2; exit 2; }
# Physical closure deliberately precedes the publication flock. A wedged lock
# holder must never extend public reachability beyond the probe deadline.
/usr/local/sbin/full-stack-preview-edge-close
install -d -o root -g root -m 0700 /run/meetwise-preview-controller
touch /run/meetwise-preview-controller/controller.lock
chown root:root /run/meetwise-preview-controller/controller.lock
chmod 0600 /run/meetwise-preview-controller/controller.lock
exec 9>/run/meetwise-preview-controller/controller.lock
flock 9
export MEETWISE_FULL_STACK_PUBLICATION_LOCK_FD=9
# The activator may have crossed the deadline and reopened Funnel while this
# service waited for the publication lock. Close a second time under the lock
# before repairing state, then restore only a durably confirmed final release.
/usr/local/sbin/full-stack-preview-edge-close
exec /usr/bin/node /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs expire-probe
