#!/usr/bin/env bash
set -euo pipefail

# Boot-time mutation entrypoint. The Web unit requires this successful
# one-shot before it can run; unlike ExecStartPre, this process owns the
# controller lock and may close Funnel, clear permits or confirm revocation.
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard recover-preview-publication.sh
controller_lock
controller_reconcile_publication
