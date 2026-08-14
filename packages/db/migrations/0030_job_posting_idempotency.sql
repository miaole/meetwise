-- 0030_job_posting_idempotency.sql
-- A recruiter may retry after an uncertain client/server boundary. Reusing the same idempotency key must return
-- the original posting, while reusing it for different semantic payload must fail rather than silently create/edit.
ALTER TABLE job_posting ADD COLUMN IF NOT EXISTS idempotency_key text;
ALTER TABLE job_posting ADD COLUMN IF NOT EXISTS idempotency_payload_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS uq_job_posting_owner_idempotency
  ON job_posting(owner_user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE job_posting DROP CONSTRAINT IF EXISTS ck_job_posting_idempotency_pair;
ALTER TABLE job_posting ADD CONSTRAINT ck_job_posting_idempotency_pair
  CHECK ((idempotency_key IS NULL AND idempotency_payload_hash IS NULL)
      OR (idempotency_key IS NOT NULL AND idempotency_payload_hash IS NOT NULL));
