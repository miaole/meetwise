#!/usr/bin/env bash
# HA-4 retention rotation — BACKUP_RETAIN_COUNT FIFO over meetwise-*.dump
# (lexical filename order == UTC chronological order).
#
# Keeps the newest N dumps; deletes older ones; writes a rotation receipt
# (what was deleted, what remains, why) next to the dumps on the host volume.
# Called by scripts/backup/backup.sh after every beat; also runnable standalone
# for the V3 rotation assertion.
set -eu
umask 077

BACKUP_DIR="${BACKUP_DIR:?BACKUP_DIR required (volume mount point)}"
BACKUP_RETAIN_COUNT="${BACKUP_RETAIN_COUNT:-7}"

case "$BACKUP_RETAIN_COUNT" in
  '' | *[!0-9]* | 0) echo "ha4_backup_retain_invalid: BACKUP_RETAIN_COUNT must be a positive integer" >&2; exit 2 ;;
esac

mkdir -p "$BACKUP_DIR/receipts"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
kept=""
deleted=""

# Phase 1 — debris sweep FIRST (so the receipt's kept/deleted lists describe
# the post-sweep reality): a meetwise-*.dump without a matching ok-receipt can
# never become valid (beat receipts are written only after full validation,
# and the loop lock makes mid-write overlap impossible) — e.g. partial bytes
# left by a SIGKILLed container mid-beat.
# ROTATE_EXCLUDE_STAMP: the CURRENT beat's stamp — its receipt is written by
# backup.sh AFTER rotation returns, so it must never be swept.
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'meetwise-*.dump' 2>/dev/null | sort -r > /tmp/ha4-rotate-list.txt
while IFS= read -r f; do
  [ -n "$f" ] || continue
  dstamp="${f##*/}"; dstamp="${dstamp#meetwise-}"; dstamp="${dstamp%.dump}"
  [ "$dstamp" = "${ROTATE_EXCLUDE_STAMP:-}" ] && continue
  if ! grep -q '"ok": true' "$BACKUP_DIR/receipts/backup-$dstamp.json" 2>/dev/null; then
    rm -f -- "$f"
    name="$(basename "$f")"
    if [ -z "$deleted" ]; then deleted="$name"; else deleted="$(printf '%s\n%s' "$deleted" "$name")"; fi
  fi
done < /tmp/ha4-rotate-list.txt

# Phase 2 — RETAIN_COUNT FIFO over the surviving (receipted) dumps.
# Newest first (reverse lexical == reverse chronological for UTC stamps).
# POSIX-sh: no process substitution (container sh is dash) — temp file instead.
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'meetwise-*.dump' 2>/dev/null | sort -r > /tmp/ha4-rotate-list.txt
while IFS= read -r f; do
  [ -n "$f" ] || continue
  name="$(basename "$f")"
  count=$(printf '%s\n' "$kept" | grep -c . || true)
  if [ "$count" -lt "$BACKUP_RETAIN_COUNT" ]; then
    if [ -z "$kept" ]; then kept="$name"; else kept="$(printf '%s\n%s' "$kept" "$name")"; fi
  else
    rm -f -- "$f"
    if [ -z "$deleted" ]; then deleted="$name"; else deleted="$(printf '%s\n%s' "$deleted" "$name")"; fi
  fi
done < /tmp/ha4-rotate-list.txt
rm -f /tmp/ha4-rotate-list.txt

kept_count=$(printf '%s' "$kept" | grep -c . || true)
deleted_list=""
first=1
if [ -n "$deleted" ]; then
  while IFS= read -r n; do
    [ -n "$n" ] || continue
    if [ "$first" -eq 1 ]; then deleted_list="\"$n\""; first=0; else deleted_list="$deleted_list, \"$n\""; fi
  done <<EOF2
$deleted
EOF2
fi
kept_json=""
first=1
if [ -n "$kept" ]; then
  while IFS= read -r n; do
    [ -n "$n" ] || continue
    if [ "$first" -eq 1 ]; then kept_json="\"$n\""; first=0; else kept_json="$kept_json, \"$n\""; fi
  done <<EOF3
$kept
EOF3
fi

{
  printf '{\n'
  printf '  "kind": "ha4-rotation",\n'
  printf '  "stamp": "%s",\n' "$stamp"
  printf '  "retainCount": %s,\n' "$BACKUP_RETAIN_COUNT"
  printf '  "keptCount": %s,\n' "$kept_count"
  printf '  "kept": [%s],\n' "$kept_json"
  printf '  "deleted": [%s],\n' "$deleted_list"
  printf '  "reason": "BACKUP_RETAIN_COUNT FIFO: keep newest N dumps (disk budget tracked in exec receipt; never oversell host disk)"\n'
  printf '}\n'
} > "$BACKUP_DIR/receipts/rotation-$stamp.json"
chmod 0600 "$BACKUP_DIR/receipts/rotation-$stamp.json"

echo "ha4_rotation_ok retained=$kept_count deleted_count=$(printf '%s' "$deleted" | grep -c . || true)" >&2
# stdout = ONLY the deleted-names JSON array (possibly []), consumed verbatim by
# backup.sh's beat receipt. The human summary goes to stderr — command
# substitution strips trailing newlines, so any extra stdout line here would
# corrupt the receipt JSON (caught and fixed in the V-matrix run).
printf '[%s]\n' "$deleted_list"
