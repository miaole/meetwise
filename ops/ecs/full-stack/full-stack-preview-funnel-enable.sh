#!/bin/bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
[[ "$EUID" -eq 0 ]] || { echo full_stack_funnel_enable_requires_root >&2; exit 2; }
[[ "$#" -ge 1 && "$#" -le 2 ]] || { echo 'usage: full-stack-preview-funnel-enable <expected-origin> [deadline-iso]' >&2; exit 2; }
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
deadline_ms=''
if [[ "$#" -eq 2 ]]; then
  deadline_ms="$(/usr/bin/node -e 'const value=Date.parse(process.argv[1]); if(!Number.isFinite(value)) process.exit(2); process.stdout.write(String(value))' "$2")"
  [[ "$(/usr/bin/date +%s%3N)" -lt "$deadline_ms" ]] || { echo full_stack_funnel_deadline_expired >&2; exit 75; }
fi
scratch="$(mktemp /run/meetwise-preview-controller/full-stack-funnel.XXXXXX)"
trap 'rm -f "$scratch"' EXIT
controller_tailscale_funnel --https=443 --yes --bg http://127.0.0.1:80 >/dev/null
controller_tailscale_funnel status --json > "$scratch"
/usr/bin/node /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-funnel-status.mjs "$scratch" "$1"
if [[ -n "$deadline_ms" && "$(/usr/bin/date +%s%3N)" -ge "$deadline_ms" ]]; then
  controller_tailscale_funnel --https=443 off >/dev/null 2>&1 || true
  controller_tailscale_funnel status --json > "$scratch"
  /usr/bin/node /usr/local/lib/meetwise-preview-controller/preview-funnel-status.mjs "$scratch"
  echo full_stack_funnel_deadline_expired >&2
  exit 75
fi
