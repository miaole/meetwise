#!/usr/bin/env bash
# HA-4 backup beat — pg_dump -Fc FULL database (zero table filters, dual-review
# seat2-② completeness hard criterion) + three-piece integrity validation
# (pg_restore --list EXIT=0 + sha256 + size>0) + RETAIN_COUNT FIFO rotation +
# a per-beat JSON receipt written next to the dumps on the host volume.
#
# Runtime receipts stay on the volume side and are never committed to git
# (REQUEST §2-W2). No DATABASE_URL value and no credential is ever echoed:
# error paths print labels, not connection strings.
#
# Runs INSIDE the backup container (pgvector/pgvector:pg16 — client major 16,
# dual-review seat1-② requires client major >= server major, enforced below).
set -eu
umask 077

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

BACKUP_DIR="${BACKUP_DIR:?BACKUP_DIR required (volume mount point)}"
BACKUP_DATABASE_URL="${BACKUP_DATABASE_URL:?BACKUP_DATABASE_URL required (value is never echoed)}"
BACKUP_RETAIN_COUNT="${BACKUP_RETAIN_COUNT:-7}"

case "$BACKUP_RETAIN_COUNT" in
  '' | *[!0-9]* | 0) echo "ha4_backup_retain_invalid: BACKUP_RETAIN_COUNT must be a positive integer" >&2; exit 2 ;;
esac

if [ ! -d "$BACKUP_DIR" ]; then
  echo "ha4_backup_dir_missing: the backup volume is not mounted" >&2
  exit 2
fi
mkdir -p "$BACKUP_DIR/receipts"
chmod 0700 "$BACKUP_DIR" 2>/dev/null || true

# ---- exclusive lock: a second concurrent invocation exits without running
#      (the demonstrable "no double run" latch; V4 probe holds this lock and
#      expects exit 4 + the skip line). Loop form A never overlaps by
#      construction; this is the belt-and-suspenders layer.
LOCK=/tmp/ha4-backup.lock
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "ha4_backup_already_running: another beat holds the lock; this invocation exits without double-running" >&2
  exit 4
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
started_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
dump="$BACKUP_DIR/meetwise-$stamp.dump"
receipt="$BACKUP_DIR/receipts/backup-$stamp.json"

# Ciphertext note: pgp_sym_decrypt is granted to app_role only
# (0121_resume_pgcrypto_runtime_acl.sql:15-17, 0151_pgp_sym_encrypt_grant.sql:21-22)
# and pg_dump never executes it — the dump captures ciphertext BYTES. The dump
# file is nonetheless PII-associated: 0600 file, 0700 dir, never in git.
pg_dump --format=custom --file="$dump" --dbname="$BACKUP_DATABASE_URL"
chmod 0600 "$dump"

# ---- W2 three-piece validation (fail-loud, receipt records EXIT) ----
toc="/tmp/ha4-toc-$stamp.txt"
pg_restore_exit=0
pg_restore --list "$dump" > "$toc" 2>/tmp/ha4-toc-err.txt || pg_restore_exit=$?
if [ "$pg_restore_exit" -ne 0 ]; then
  printf '{"kind":"ha4-backup-beat","ok":false,"stage":"pg_restore_list","pgRestoreExit":%s,"stamp":"%s","finishedAt":"%s"}\n' \
    "$pg_restore_exit" "$stamp" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$receipt"
  echo "ha4_backup_invalid_dump: pg_restore --list exited $pg_restore_exit (catalog invalid)" >&2
  exit 1
fi
# TOC entry shapes (pg_restore --list, space-separated after the "; " prefix):
#   "243; 1259 17095 TABLE public job_application meetwise"   (relation entry)
#   "219; 0     16385 TABLE DATA public interview meetwise"   (data entry)
# ACL lines like "ACL public TABLE ..." must not match — hence the anchors.
toc_table_entries="$(grep -cE '^[0-9]+; 1259 [0-9]+ TABLE ' "$toc" || true)"
toc_table_data_entries="$(grep -cE '^[0-9]+; 0 [0-9]+ TABLE DATA ' "$toc" || true)"
size_bytes="$(wc -c < "$dump" | tr -d '[:space:]')"
if [ "$size_bytes" -le 0 ]; then
  echo "ha4_backup_invalid_dump: size must be > 0" >&2
  exit 1
fi
sha="$(sha256sum "$dump" | cut -d' ' -f1)"

# ---- seat1-② client/server major check: fail-loud, recorded per beat ----
client_major="$(pg_dump --version | sed -n 's/^pg_dump.* \([0-9][0-9]*\)\..*/\1/p')"
server_major="$(psql --dbname="$BACKUP_DATABASE_URL" --tuples-only --no-align --command="SELECT current_setting('server_version_num')::int / 10000" | tr -d '[:space:]')"
client_major="${client_major:-0}"
client_gte_server="false"
if [ "$client_major" -ge "$server_major" ] 2>/dev/null; then
  client_gte_server="true"
else
  echo "ha4_backup_version_gap: pg_dump major $client_major < server major $server_major (seat1-② precondition violated)" >&2
  exit 1
fi

# ---- W4 retention rotation ----
# rotate.sh stdout = the deleted-names JSON array ("[]" when nothing rotated);
# its human summary goes to stderr (never captured here). The current beat's
# stamp is excluded from the receipt-less debris sweep (its receipt is written
# after rotation returns).
rotation_deleted_json="$(BACKUP_DIR="$BACKUP_DIR" BACKUP_RETAIN_COUNT="$BACKUP_RETAIN_COUNT" ROTATE_EXCLUDE_STAMP="$stamp" sh "$SCRIPT_DIR/rotate.sh")"
retained_count="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'meetwise-*.dump' | wc -l | tr -d '[:space:]')"

finished_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---- per-beat receipt (volume side; no URLs, no credentials, no dump content) ----
{
  printf '{\n'
  printf '  "kind": "ha4-backup-beat",\n'
  printf '  "ok": true,\n'
  printf '  "stamp": "%s",\n' "$stamp"
  printf '  "startedAt": "%s",\n' "$started_at"
  printf '  "finishedAt": "%s",\n' "$finished_at"
  printf '  "dump": {"name": "%s", "sizeBytes": %s, "sha256": "%s", "mode": "0600"},\n' "meetwise-$stamp.dump" "$size_bytes" "$sha"
  printf '  "validation": {"pgRestoreListExit": 0, "tocTableEntries": %s, "tocTableDataEntries": %s, "sizeAssertGtZero": true},\n' "$toc_table_entries" "$toc_table_data_entries"
  printf '  "versions": {"clientPgDumpMajor": %s, "serverMajor": %s, "clientGteServer": %s},\n' "$client_major" "$server_major" "$client_gte_server"
  printf '  "rotation": {"retainCount": %s, "retainedCount": %s, "deleted": %s}\n' "$BACKUP_RETAIN_COUNT" "$retained_count" "$rotation_deleted_json"
  printf '}\n'
} > "$receipt"
chmod 0600 "$receipt"

# One stdout summary line — no connection string, no secret material.
echo "ha4_backup_ok stamp=$stamp size=$size_bytes sha256=$sha toc_tables=$toc_table_entries retained=$retained_count"
