-- 0053_resume_reference_legacy_classification.sql
--
-- Online backfill primitive for 0052.  The migration itself changes no rows.
-- A release operator invokes this bounded command repeatedly between batches;
-- SKIP LOCKED prevents it from waiting behind a live queue worker.  Before
-- 0054 is installed, upgraded workers already treat every NULL-version job
-- (start and answer alike) as legacy/fail-closed.

CREATE OR REPLACE FUNCTION classify_legacy_interview_job_reference_batch(batch_size integer DEFAULT 1000)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public, pg_temp
SET statement_timeout = '2s'
AS $$
DECLARE changed integer;
BEGIN
  IF batch_size < 1 OR batch_size > 10000 THEN
    RAISE EXCEPTION 'legacy_interview_job_reference_batch_size_invalid';
  END IF;
  WITH candidates AS (
    SELECT ctid
      FROM interview_job
     WHERE reference_schema_version IS NULL
     ORDER BY created_at, id
     FOR UPDATE SKIP LOCKED
     LIMIT batch_size
  )
  UPDATE interview_job j
     SET reference_schema_version=49
    FROM candidates c
   WHERE j.ctid=c.ctid;
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed;
END;
$$;

REVOKE ALL ON FUNCTION classify_legacy_interview_job_reference_batch(integer) FROM PUBLIC, app_role;
