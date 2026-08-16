#!/bin/bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
[[ "$EUID" -eq 0 ]] || { echo full_stack_publication_requires_root >&2; exit 2; }
[[ "$#" -eq 1 && ( "$1" == stage || "$1" == publish || "$1" == activate || "$1" == confirm-public || "$1" == restore-confirmed-edge || "$1" == resume-revocation || "$1" == revoke || "$1" == recover || "$1" == verify-public || "$1" == assert-web-start-permitted ) ]] || { echo 'usage: full-stack-preview-publication.sh stage|publish|activate|confirm-public|restore-confirmed-edge|resume-revocation|revoke|recover|verify-public|assert-web-start-permitted' >&2; exit 2; }
if [[ "$1" == assert-web-start-permitted ]]; then
  exec /usr/bin/node /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs "$1"
fi
install -d -o root -g root -m 0700 /run/meetwise-preview-controller
touch /run/meetwise-preview-controller/controller.lock
chown root:root /run/meetwise-preview-controller/controller.lock
chmod 0600 /run/meetwise-preview-controller/controller.lock
exec 9>/run/meetwise-preview-controller/controller.lock
flock -n 9 || { echo full_stack_publication_busy >&2; exit 75; }
export MEETWISE_FULL_STACK_PUBLICATION_LOCK_FD=9
exec /usr/bin/node /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs "$1"
