-- 0055_resume_reference_legacy_backfill_index.sql
-- @migration-mode concurrent-index
--
-- `0053` uses SKIP LOCKED but, without this partial index, each batch may
-- still scan the whole interview_job table while looking for NULL legacy rows.
-- The migration runner accepts this exact concurrent-index form only; it runs
-- outside a transaction because PostgreSQL requires that for online index
-- creation, then records the checksum in a separate short ledger transaction.

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_interview_job_reference_legacy_backfill
  ON interview_job (created_at, id)
  WHERE reference_schema_version IS NULL;
