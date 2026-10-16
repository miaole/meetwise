#!/usr/bin/env bash
# HA-4 sandbox seed driver — brings up the throwaway seed Postgres
# (docker/compose.backup.sandbox.yml service `backup-seed-pg`, tmpfs lifetime),
# applies the REAL migration set (packages/db/migrations/*.sql, lexical order,
# ON_ERROR_STOP=1 — the full business + ciphertext + pgvector + LangGraph
# checkpoint-face schema, compose.ha.sandbox.yml precedent) and inserts
# sentinel rows: a pgp_sym_encrypt ciphertext artifact (resume_blob), a
# vector(512) HNSW row (vector_chunk) and PostgresSaver-face rows
# (checkpoints / checkpoint_blobs / checkpoint_writes, 0043 schema).
#
# est live=0: sandbox dummy materials only (dummy credentials follow the
# compose.ha.sandbox.yml precedent; the sentinel encryption key is a throwaway
# dummy, never the production RESUME_ENC_KEY). Never points at production.
#
# Gate (REQUEST §9-1): refuses to run unless MEETWISE_HA4_BACKUP_AUTHORIZED=1.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [ "${MEETWISE_HA4_BACKUP_AUTHORIZED:-}" != "1" ]; then
  echo "ha4_seed_not_authorized: MEETWISE_HA4_BACKUP_AUTHORIZED must be exactly 1 (coordinator gate; default refuse-to-run)" >&2
  exit 3
fi

BACKUP_ENV_DIR=.tmp/ha4-backup
mkdir -p "$BACKUP_ENV_DIR/backups" "$BACKUP_ENV_DIR/evidence"
chmod 0700 "$BACKUP_ENV_DIR" "$BACKUP_ENV_DIR/backups" "$BACKUP_ENV_DIR/evidence"
if [ ! -f "$BACKUP_ENV_DIR/dummy-rds-ca.pem" ]; then
  # Throwaway placeholder satisfying the secret file mount in the sandbox only
  # (sandbox connection uses sslmode=disable; this file is never read).
  printf -- '-----BEGIN CERTIFICATE-----\nHA4-SANDBOX-DUMMY-NOT-A-REAL-CA\n-----END CERTIFICATE-----\n' > "$BACKUP_ENV_DIR/dummy-rds-ca.pem"
  chmod 0600 "$BACKUP_ENV_DIR/dummy-rds-ca.pem"
fi

export BACKUP_DIR_HOST="$BACKUP_ENV_DIR/backups"
# compose interpolates each file BEFORE merging, so the base file's required
# variables must resolve in the driver shell even where the sandbox overlay
# overrides them (HA-2 §9-3② lesson: missing-value errors are not green stubs).
# Sandbox dummy values only — the seed PG connection uses sslmode=disable.
export RDS_CA_HOST_PATH="$PWD/$BACKUP_ENV_DIR/dummy-rds-ca.pem"
export BACKUP_DATABASE_URL="${BACKUP_DATABASE_URL:-postgres://meetwise:meetwise_ha4_sandbox_dummy@backup-seed-pg:5432/meetwise?sslmode=disable}"
COMPOSE="docker compose -f docker/compose.backup.yml -f docker/compose.backup.sandbox.yml --project-directory ."

$COMPOSE up -d backup-seed-pg

seed_ctr=""
for _ in $(seq 1 60); do
  seed_ctr="$($COMPOSE ps -q backup-seed-pg)"
  [ -n "$seed_ctr" ] && docker exec "$seed_ctr" pg_isready -U meetwise -d meetwise -q && break
  sleep 1
done
if [ -z "$seed_ctr" ]; then
  echo "ha4_seed_fail: seed pg never became ready" >&2
  exit 1
fi
docker exec "$seed_ctr" pg_isready -U meetwise -d meetwise

applied=0
for f in packages/db/migrations/*.sql; do
  if ! docker exec -i "$seed_ctr" psql -U meetwise -d meetwise -v ON_ERROR_STOP=1 -q -f - < "$f"; then
    echo "ha4_seed_fail: migration application failed at $f" >&2
    exit 1
  fi
  applied=$((applied + 1))
done

# ---- sentinel rows (sandbox dummies; production keys never exist here) ----
# The checkpoint face sits behind the real product privacy fence
# (0047_checkpoint_privacy_fence.sql): a thread must be enrolled
# (access_state='active') and the session must carry app.checkpoint_thread_id /
# app.checkpoint_epoch matching the enrollment fence_epoch. We seed THROUGH the
# fence (SET LOCAL inside the transaction) — zero trigger/DDL modification.
docker exec -i "$seed_ctr" psql -U meetwise -d meetwise -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
-- Fence session binding for the sentinel thread (enrollment fence_epoch=1).
-- app.principal_user is checked by the fence trigger too (SECURITY DEFINER,
-- enforced even for the table owner).
SET LOCAL app.principal_user = 'ha4-seed-owner';
SET LOCAL app.checkpoint_thread_id = 'ha4-thread-1';
SET LOCAL app.checkpoint_epoch = '1';
INSERT INTO checkpoint_thread_enrollment (thread_id, owner_user_id, access_state, fence_epoch)
VALUES ('ha4-thread-1', 'ha4-seed-owner', 'active', 1)
ON CONFLICT DO NOTHING;
INSERT INTO resume (owner_user_id, content_sha, status)
VALUES ('ha4-seed-owner', 'ha4-seed-content-sha-1', 'ingested')
ON CONFLICT DO NOTHING;
INSERT INTO resume_blob (resume_id, owner_user_id, ciphertext, key_version)
SELECT id, owner_user_id, pgp_sym_encrypt('ha4-sentinel-cleartext-sandbox-only', 'ha4-sandbox-dummy-enc-key'), 1
FROM resume WHERE owner_user_id = 'ha4-seed-owner';
INSERT INTO vector_chunk (id, owner_user_id, kind, ref_id, content_hash, embedding)
VALUES ('ha4-seed-vector-1', 'ha4-seed-owner', 'qbank', 'ha4-seed-ref-1', 'ha4-seed-content-hash-1',
        ('[' || array_to_string(array_fill(0.05::float8, ARRAY[512]), ',') || ']')::vector)
ON CONFLICT DO NOTHING;
INSERT INTO checkpoints (thread_id, checkpoint_ns, checkpoint_id, type, checkpoint, metadata)
VALUES ('ha4-thread-1', '', 'ha4-checkpoint-1', 'json', '{"ha4":"seed"}'::jsonb, '{}'::jsonb)
ON CONFLICT DO NOTHING;
INSERT INTO checkpoint_blobs (thread_id, checkpoint_ns, channel, version, type, blob)
VALUES ('ha4-thread-1', '', 'ha4-channel-1', 'ha4-version-1', 'json', 'ha4-sentinel-blob-bytes'::bytea)
ON CONFLICT DO NOTHING;
INSERT INTO checkpoint_writes (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, type, blob)
VALUES ('ha4-thread-1', '', 'ha4-checkpoint-1', 'ha4-task-1', 0, 'ha4-channel-1', 'json', 'ha4-sentinel-write-bytes'::bytea)
ON CONFLICT DO NOTHING;
COMMIT;
SQL

counts="$(docker exec "$seed_ctr" psql -U meetwise -d meetwise -Atq -c "
  SELECT 'tables=' || count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');
  SELECT 'resume=' || count(*) FROM resume;
  SELECT 'resume_blob=' || count(*) FROM resume_blob;
  SELECT 'vector_chunk=' || count(*) FROM vector_chunk;
  SELECT 'checkpoints=' || count(*) FROM checkpoints;
  SELECT 'checkpoint_blobs=' || count(*) FROM checkpoint_blobs;
  SELECT 'checkpoint_writes=' || count(*) FROM checkpoint_writes;
  SELECT 'server_version_num=' || current_setting('server_version_num');
")"

{
  printf '{\n'
  printf '  "kind": "ha4-sandbox-seed",\n'
  printf '  "ok": true,\n'
  printf '  "migrationsApplied": %s,\n' "$applied"
  printf '  "sentinels": {"resume": 1, "resumeBlobCiphertext": 1, "vectorChunk512dim": 1, "checkpoints": 1, "checkpointBlobs": 1, "checkpointWrites": 1},\n'
  printf '  "counts": "%s",\n' "$(printf '%s' "$counts" | tr '\n' ' ' | sed 's/ *$//')"
  printf '  "encryption": {"plaintextInserted": true, "storedAs": "pgp_sym_encrypt bytes (never decrypted in this drill loop)"},\n'
  printf '  "lifetime": "tmpfs throwaway; compose down destroys"\n'
  printf '}\n'
} > "$BACKUP_ENV_DIR/evidence/seed.receipt.json"
chmod 0600 "$BACKUP_ENV_DIR/evidence/seed.receipt.json"

echo "ha4_seed_ok applied=$applied $counts"
