-- 0054_resume_reference_write_gate.sql
--
-- The compatibility cutover is intentionally short-lock.  It never backfills
-- or validates a whole queue table in this transaction.  A lock conflict fails
-- within two seconds so a release can retry/drain rather than stall enqueue,
-- claim, heartbeat, or terminalization traffic indefinitely.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';

ALTER TABLE interview_job
  ADD CONSTRAINT interview_job_reference_schema_version_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49,50))
  NOT VALID;

CREATE OR REPLACE FUNCTION enforce_interview_job_resume_reference()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- v49 and NULL are migration-only historical classifications.  No new
  -- runtime caller may manufacture them after this write gate is installed.
  IF TG_OP='INSERT' AND NEW.reference_schema_version IS DISTINCT FROM 50 THEN
    RAISE EXCEPTION 'interview_job_legacy_reference_insert_forbidden';
  END IF;

  IF TG_OP='UPDATE' AND (
    NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
    OR NEW.interview_id IS DISTINCT FROM OLD.interview_id
    OR NEW.kind IS DISTINCT FROM OLD.kind
    OR NEW.resume_id IS DISTINCT FROM OLD.resume_id
    OR (
      NEW.reference_schema_version IS DISTINCT FROM OLD.reference_schema_version
      AND NOT (OLD.reference_schema_version IS NULL AND NEW.reference_schema_version=49)
    )
  ) THEN
    RAISE EXCEPTION 'interview_job_reference_immutable';
  END IF;

  IF NEW.kind='start' AND NEW.reference_schema_version=50 THEN
    IF NEW.resume_id IS NULL THEN
      RAISE EXCEPTION 'interview_job_start_resume_reference_required';
    END IF;
    PERFORM 1
      FROM interview i
      JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
     WHERE i.id=NEW.interview_id
       AND i.owner_user_id=NEW.owner_user_id
       AND i.resume_id=NEW.resume_id
       AND r.status='ingested';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'interview_job_start_resume_reference_mismatch';
    END IF;
  ELSIF NEW.kind='answer' AND NEW.resume_id IS NOT NULL THEN
    RAISE EXCEPTION 'interview_job_answer_must_not_carry_resume_reference';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_interview_job_resume_reference ON interview_job;
CREATE TRIGGER trg_interview_job_resume_reference
  BEFORE INSERT OR UPDATE OF reference_schema_version,owner_user_id,interview_id,kind,resume_id
  ON interview_job
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_job_resume_reference();
