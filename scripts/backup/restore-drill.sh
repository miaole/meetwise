#!/usr/bin/env bash
# HA-4 restore drill (REQUEST §2-W3 / §4-V2) — runs INSIDE the throwaway drill
# container (docker/compose.backup.sandbox.yml service `restore-drill`, profile
# ha4-drill, invoked via `docker compose run --rm`, so the container is
# destroyed when the drill exits).
#
# ACL DISPOSAL IS EXPLICIT (dual-review seat1 execution note — never silent):
# a database-level pg_dump never carries cluster-global role definitions, yet
# the dump replays GRANT/OWNER statements that reference them (app_role via
# 0001/0043/0121:15-17, memory_runtime via 0151:21-22, plus the migration-created
# control-plane roles). The drill therefore PRE-CREATES every source role as
# NOLOGIN in the throwaway target (role statements quoted server-side with
# quote_ident) and restores with ZERO statement filtering: --no-acl is NOT
# used, no --section cuts, no object exclusions. The disposal decision and the
# full pre-created role list are recorded in the drill receipt.
#
# Target cluster: the dedicated throwaway container `ha4-drill-pg`
# (docker/compose.backup.sandbox.yml, profile ha4-drill) — tmpfs lifetime,
# POSTGRES_HOST_AUTH_METHOD=trust = sandbox dummy auth on the compose-internal
# network only (zero published ports), never a production pattern. The driver
# container itself keeps the compose.prod.yml:124-131 security anchor shape as
# root: cap_drop ALL (no setuid gosu switch possible) — hence the target is a
# separate container and the restore flows over TCP, the real incident path.
#
# Assertions (all hard, fail-loud):
#   T1 table-set equality source<->restored, both directions (seat2-②实测裁决)
#   T2 per-table row counts equal for the full table set (single generated
#      UNION ALL query per side, outputs byte-compared)
#   T3 ciphertext column equality as BYTES (md5 of encoded bytea aggregates —
#      zero decryption; pgp_sym_decrypt is app_role-only, 0121:15-17)
#   T4 dump TOC TABLE entry count == source table count (completeness pre-check)
set -eu
umask 077

if [ "${MEETWISE_HA4_BACKUP_AUTHORIZED:-}" != "1" ]; then
  echo "ha4_drill_not_authorized: MEETWISE_HA4_BACKUP_AUTHORIZED must be exactly 1 (coordinator gate)" >&2
  exit 3
fi

SOURCE_DATABASE_URL="${SOURCE_DATABASE_URL:?SOURCE_DATABASE_URL required (value never echoed)}"
TARGET_CONN="${DRILL_TARGET_URL:?DRILL_TARGET_URL required (value never echoed)}"
DUMP_PATH="${DRILL_DUMP_PATH:?DRILL_DUMP_PATH required}"
EVIDENCE="${DRILL_EVIDENCE_DIR:-/evidence}"
mkdir -p "$EVIDENCE"

started_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
client_major="$(pg_dump --version | sed -n 's/^pg_dump.* \([0-9][0-9]*\)\..*/\1/p')"

note_fail() { # $1 stage, $2 detail
  printf '{"kind":"ha4-restore-drill","ok":false,"stage":"%s","detail":"%s","startedAt":"%s","finishedAt":"%s"}\n' \
    "$1" "$2" "$started_at" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$EVIDENCE/v2-restore-drill.receipt.json"
  chmod 0600 "$EVIDENCE/v2-restore-drill.receipt.json"
  echo "ha4_drill_fail stage=$1 detail=$2" >&2
}

# ---- throwaway target: wait healthy, reset to a clean database ----
ready=0
for _ in $(seq 1 60); do
  if pg_isready -d "$TARGET_CONN" -q; then ready=1; break; fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  note_fail "target_unready" "throwaway target never became ready"
  exit 1
fi
# Reset at DATABASE level (extensions are per-database — a schema-only drop
# leaves CREATE EXTENSION entries that break a second restore).
psql "${TARGET_CONN%/*}/postgres" -q -c "DROP DATABASE IF EXISTS ha4_drill WITH (FORCE)" >/dev/null
psql "${TARGET_CONN%/*}/postgres" -q -c "CREATE DATABASE ha4_drill" >/dev/null

source_server_major="$(psql "$SOURCE_DATABASE_URL" -Atq -c "SELECT current_setting('server_version_num')::int / 10000")"
target_server_major="$(psql "$TARGET_CONN" -Atq -c "SELECT current_setting('server_version_num')::int / 10000")"
if [ "$client_major" -lt "$source_server_major" ] 2>/dev/null || [ -z "$client_major" ]; then
  note_fail "version_check" "pg_dump major ${client_major:-unknown} < source server major $source_server_major"
  exit 1
fi

# ---- dump presence (container-local path; name only ever reaches receipts) ----
if [ ! -s "$DUMP_PATH" ]; then
  note_fail "dump_missing" "dump file missing or empty at the provided path"
  exit 1
fi

# ---- TOC completeness pre-check (T4) ----
# Anchored patterns: relation entries carry pg_class OID 1259; ACL lines
# ("ACL public TABLE ...") must not match. Partitioned parents carry a TABLE
# entry but no TABLE DATA entry (recorded, not asserted).
toc=/tmp/drill-toc.txt
pg_restore --list "$DUMP_PATH" > "$toc"
toc_table_entries="$(grep -cE '^[0-9]+; 1259 [0-9]+ TABLE ' "$toc" || true)"
toc_table_data_entries="$(grep -cE '^[0-9]+; 0 [0-9]+ TABLE DATA ' "$toc" || true)"
src_table_count="$(psql "$SOURCE_DATABASE_URL" -Atq -c "SELECT count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')")"
if [ "$toc_table_entries" -ne "$src_table_count" ]; then
  note_fail "toc_completeness" "TOC TABLE entries $toc_table_entries != source table count $src_table_count"
  exit 1
fi

# ---- ACL disposal step 1: enumerate source roles (cluster-global, not in dump) ----
psql "$SOURCE_DATABASE_URL" -Atq -c "SELECT quote_ident(rolname) FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%' AND rolname <> 'postgres'" | sort > /tmp/drill-src-roles.txt
# ACL disposal step 2: drop the ones the throwaway target already has (its own
# bootstrap role), keep the rest.
psql "$TARGET_CONN" -Atq -c "SELECT quote_ident(rolname) FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%'" | sort > /tmp/drill-dst-roles.txt
comm -23 /tmp/drill-src-roles.txt /tmp/drill-dst-roles.txt > /tmp/drill-roles-to-create.txt
roles_precreated="$(wc -l < /tmp/drill-roles-to-create.txt | tr -d '[:space:]')"
# ACL disposal step 3: apply — CREATE ROLE %s NOLOGIN, names already quoted by
# quote_ident server-side. This is the disposal decision: pre-create roles, so
# the restore can replay every GRANT/OWNER statement unfiltered.
sed 's/^/CREATE ROLE /; s/$/ NOLOGIN;/' /tmp/drill-roles-to-create.txt > /tmp/drill-create-roles.sql
psql "$TARGET_CONN" -q -v ON_ERROR_STOP=1 -f /tmp/drill-create-roles.sql
# ACL disposal step 4: assert closure — every source role must now exist.
psql "$TARGET_CONN" -Atq -c "SELECT quote_ident(rolname) FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%' AND rolname <> 'postgres'" | sort > /tmp/drill-dst-roles-after.txt
if ! comm -23 /tmp/drill-src-roles.txt /tmp/drill-dst-roles-after.txt | grep -q .; then
  roles_closure="true"
else
  note_fail "role_closure" "source roles still missing in target after pre-creation"
  exit 1
fi

# ---- restore: full dump, zero statement filtering ----
restore_exit=0
pg_restore --format=custom --dbname="$TARGET_CONN" "$DUMP_PATH" 2>/tmp/drill-restore-err.log || restore_exit=$?
if [ "$restore_exit" -ne 0 ]; then
  note_fail "pg_restore" "pg_restore exited $restore_exit"
  exit 1
fi

# ---- T1: table-set equality, both directions ----
psql "$SOURCE_DATABASE_URL" -Atq -c "SELECT schemaname||'.'||tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY 1" > /tmp/drill-src-tables.txt
psql "$TARGET_CONN" -Atq -c "SELECT schemaname||'.'||tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY 1" > /tmp/drill-dst-tables.txt
missing_in_target="$(comm -23 /tmp/drill-src-tables.txt /tmp/drill-dst-tables.txt | head -5)"
extra_in_target="$(comm -13 /tmp/drill-src-tables.txt /tmp/drill-dst-tables.txt | head -5)"
table_set_equal="true"
if [ -n "$missing_in_target" ] || [ -n "$extra_in_target" ]; then
  table_set_equal="false"
  note_fail "table_set_equality" "missing_in_target=[$(printf '%s' "$missing_in_target" | tr '\n' ',')] extra_in_target=[$(printf '%s' "$extra_in_target" | tr '\n' ',')]"
  exit 1
fi
table_count="$(wc -l < /tmp/drill-src-tables.txt | tr -d '[:space:]')"

# ---- T2: per-table row counts, single generated query per side ----
# Two explicit steps (container sh has no pipefail — never let a failed
# generator silently produce two empty files that compare equal).
gen_counts() { # $1 conn, $2 outfile
  # The generated statement wraps the UNION ALL chain in an outer ORDER BY 1:
  # without it the planner may reorder branches (no order guarantee for bare
  # UNION ALL), which byte-diff would misread as a count divergence.
  psql "$1" -Atq -v ON_ERROR_STOP=1 -c "SELECT '(' || string_agg(stmt, ' UNION ALL ' ORDER BY ord) || ') ORDER BY 1' FROM (SELECT row_number() OVER (ORDER BY schemaname, tablename) AS ord, format('SELECT %L AS t, count(*) AS n FROM %I.%I', schemaname||'.'||tablename, schemaname, tablename) AS stmt FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')) s" > "$2.gen"
  if [ ! -s "$2.gen" ]; then
    note_fail "row_count_generator" "count-query generator produced no rows for $2"
    exit 1
  fi
  psql "$1" -Atq -v ON_ERROR_STOP=1 -f "$2.gen" > "$2"
  if [ ! -s "$2" ]; then
    note_fail "row_count_query" "row-count query produced no output for $2"
    exit 1
  fi
}
gen_counts "$SOURCE_DATABASE_URL" /tmp/drill-src-counts.txt
gen_counts "$TARGET_CONN" /tmp/drill-dst-counts.txt
row_counts_equal="true"
if ! cmp -s /tmp/drill-src-counts.txt /tmp/drill-dst-counts.txt; then
  row_counts_equal="false"
  cp /tmp/drill-src-counts.txt /tmp/drill-dst-counts.txt "$EVIDENCE/" 2>/dev/null || true
  note_fail "row_count_equality" "per-table row counts differ; full diff: $(diff /tmp/drill-src-counts.txt /tmp/drill-dst-counts.txt | tr '\n' ';' | cut -c1-1200)"
  exit 1
fi
nonempty_tables="$(awk -F'|' '$2 != "0" {c++} END {print c+0}' /tmp/drill-src-counts.txt)"

# ---- T3: ciphertext bytes equality (zero decryption) ----
src_blob="$(psql "$SOURCE_DATABASE_URL" -Atq -c "SELECT count(*) || '|' || coalesce(md5(string_agg(encode(ciphertext,'hex'), '' ORDER BY resume_id, owner_user_id)), 'empty') FROM resume_blob")"
dst_blob="$(psql "$TARGET_CONN" -Atq -c "SELECT count(*) || '|' || coalesce(md5(string_agg(encode(ciphertext,'hex'), '' ORDER BY resume_id, owner_user_id)), 'empty') FROM resume_blob")"
resume_blob_equal="true"
[ "$src_blob" = "$dst_blob" ] || resume_blob_equal="false"
src_ckpt="$(psql "$SOURCE_DATABASE_URL" -Atq -c "SELECT count(*) || '|' || coalesce(md5(string_agg(encode(blob,'hex'), '' ORDER BY thread_id, checkpoint_ns, channel, version)), 'empty') FROM checkpoint_blobs")"
dst_ckpt="$(psql "$TARGET_CONN" -Atq -c "SELECT count(*) || '|' || coalesce(md5(string_agg(encode(blob,'hex'), '' ORDER BY thread_id, checkpoint_ns, channel, version)), 'empty') FROM checkpoint_blobs")"
checkpoint_blob_equal="true"
[ "$src_ckpt" = "$dst_ckpt" ] || checkpoint_blob_equal="false"
if [ "$resume_blob_equal" != "true" ] || [ "$checkpoint_blob_equal" != "true" ]; then
  note_fail "ciphertext_byte_equality" "resume_blob_equal=$resume_blob_equal checkpoint_blob_equal=$checkpoint_blob_equal"
  exit 1
fi

finished_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---- drill receipt (aggregate hashes only — no dump content, no credentials) ----
roles_json=""
first=1
while IFS= read -r r; do
  [ -n "$r" ] || continue
  if [ "$first" -eq 1 ]; then roles_json="\"$r\""; first=0; else roles_json="$roles_json, \"$r\""; fi
done < /tmp/drill-roles-to-create.txt

{
  printf '{\n'
  printf '  "kind": "ha4-restore-drill",\n'
  printf '  "ok": true,\n'
  printf '  "startedAt": "%s",\n' "$started_at"
  printf '  "finishedAt": "%s",\n' "$finished_at"
  printf '  "restoreExit": 0,\n'
  printf '  "statementFiltering": "none (no --no-acl, no --section cuts, no exclusions)",\n'
  printf '  "aclDisposal": "pre-created %s source roles as NOLOGIN in throwaway target before restore (dump cannot carry cluster-global roles)",\n' "$roles_precreated"
  printf '  "rolesPrecreated": [%s],\n' "$roles_json"
  printf '  "rolesClosureVerified": %s,\n' "$roles_closure"
  printf '  "asserts": {\n'
  printf '    "tableSetEqualBothDirections": %s,\n' "$table_set_equal"
  printf '    "tableCount": %s,\n' "$table_count"
  printf '    "rowCountsEqualAllTables": %s,\n' "$row_counts_equal"
  printf '    "nonEmptyTablesChecked": %s,\n' "$nonempty_tables"
  printf '    "resumeBlobCiphertextBytesEqual": %s,\n' "$resume_blob_equal"
  printf '    "checkpointBlobBytesEqual": %s,\n' "$checkpoint_blob_equal"
  printf '    "tocTableEntries": %s,\n' "$toc_table_entries"
  printf '    "tocTableDataEntries": %s,\n' "$toc_table_data_entries"
  printf '    "tocTableEntriesEqualsSourceTableCount": true\n'
  printf '  },\n'
  printf '  "versions": {"clientPgDumpMajor": %s, "sourceServerMajor": %s, "targetServerMajor": %s, "clientGteServer": true},\n' "$client_major" "$source_server_major" "$target_server_major"
  printf '  "drillContainerRemoved": "restore-drill via run --rm; ha4-drill-pg via profile down -v",\n'
  printf '  "decryptionPerformed": false\n'
  printf '}\n'
} > "$EVIDENCE/v2-restore-drill.receipt.json"
chmod 0600 "$EVIDENCE/v2-restore-drill.receipt.json"

echo "ha4_drill_ok restore_exit=0 tables=$table_count nonempty=$nonempty_tables roles_precreated=$roles_precreated ciphertext_bytes_equal=true"
