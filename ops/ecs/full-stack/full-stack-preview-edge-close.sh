#!/bin/bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
[[ "$EUID" -eq 0 ]] || { echo full_stack_edge_close_requires_root >&2; exit 2; }
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
failed=0
controller_tailscale_funnel --https=443 off >/dev/null 2>&1 &
funnel_pid=$!
timeout --kill-after=1s 15s systemctl stop meetwise-web.service >/dev/null 2>&1 &
web_pid=$!
web_load_state=''
if ! web_load_state="$(controller_unit_load_state meetwise-web.service)"; then failed=1; fi
if ! wait "$web_pid" && [[ "$web_load_state" == loaded ]]; then failed=1; fi
[[ "$web_load_state" != loaded ]] || controller_unit_is_inactive meetwise-web.service || failed=1
wait "$funnel_pid" || true
controller_funnel_status_is_closed || failed=1
exit "$failed"
