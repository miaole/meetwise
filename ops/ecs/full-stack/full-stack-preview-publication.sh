#!/bin/bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
[[ "$EUID" -eq 0 ]] || { echo full_stack_publication_requires_root >&2; exit 2; }
[[ "$#" -eq 1 && ( "$1" == stage || "$1" == publish || "$1" == activate || "$1" == confirm-public || "$1" == restore-confirmed-edge || "$1" == resume-revocation || "$1" == recover || "$1" == verify-public || "$1" == assert-web-start-permitted ) ]] || { echo 'usage: full-stack-preview-publication.sh stage|publish|activate|confirm-public|restore-confirmed-edge|resume-revocation|recover|verify-public|assert-web-start-permitted' >&2; exit 2; }
if [[ "$1" == assert-web-start-permitted ]]; then
  exec /usr/bin/node /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs "$1"
fi
# A reboot recovery is root-owned and has no GitHub token to present.  It uses
# the controller-only recovery authority to reconcile the durable transaction
# first; external forced commands remain token-bound.  With no transaction
# ledger (fresh/unclaimed host), this is a harmless no-op before publication
# recovery continues.
if [[ "$1" == recover ]]; then
  /usr/local/sbin/meetwise-cd-root transaction recover-system
fi
lock_dir=/run/meetwise-preview-controller
lock_path="$lock_dir/controller.lock"
if [[ -e "$lock_dir" || -L "$lock_dir" ]]; then
  [[ -d "$lock_dir" && ! -L "$lock_dir" ]] || { echo full_stack_controller_lock_directory_invalid >&2; exit 70; }
else
  install -d -o root -g root -m 0700 "$lock_dir"
fi
[[ "$(stat -c '%u:%g:%a' "$lock_dir" 2>/dev/null || true)" == '0:0:700' ]] || { echo full_stack_controller_lock_directory_invalid >&2; exit 70; }
if [[ -e "$lock_path" || -L "$lock_path" ]]; then
  [[ -f "$lock_path" && ! -L "$lock_path" ]] || { echo full_stack_controller_lock_invalid >&2; exit 70; }
else
  install -o root -g root -m 0600 /dev/null "$lock_path"
fi
[[ "$(stat -c '%u:%g:%a' "$lock_path" 2>/dev/null || true)" == '0:0:600' ]] || { echo full_stack_controller_lock_invalid >&2; exit 70; }
exec 9>>"$lock_path"
flock -n 9 || { echo full_stack_publication_busy >&2; exit 75; }
export MEETWISE_FULL_STACK_PUBLICATION_LOCK_FD=9
exec /usr/bin/node /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs "$1"
