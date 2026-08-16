#!/bin/bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
[[ "$EUID" -eq 0 ]] || { echo full_stack_funnel_close_requires_root >&2; exit 2; }
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_tailscale_funnel --https=443 off >/dev/null 2>&1 || true
controller_funnel_status_is_closed
