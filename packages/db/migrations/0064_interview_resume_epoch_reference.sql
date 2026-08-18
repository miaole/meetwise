-- 0064_interview_resume_epoch_reference.sql
--
-- A typed resume id without its privacy epoch is not an authorization
-- snapshot: a later fence/tombstone cannot distinguish a stale queued job
-- from a current one.  v64 makes every new interview job bind to the parent
-- interview's immutable resume epoch.  Answers deliberately keep no
-- `resume_id` locator, but they still carry that authorization epoch.
--
-- This is an expand-only compatibility cutover.  Existing v49/v50/NULL rows
-- are intentionally not guessed or promoted; the worker terminalizes them
-- before reading a payload, enrolling a checkpoint, decrypting, or invoking
-- a model.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';

ALTER TABLE interview
  ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;

ALTER TABLE interview_job
  ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;

ALTER TABLE interview_job
  ALTER COLUMN reference_schema_version SET DEFAULT 64;

ALTER TABLE interview_job
  DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
ALTER TABLE interview_job
  ADD CONSTRAINT interview_job_reference_schema_version_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49,50,64))
  NOT VALID;

-- Keep the query planner on the bounded legacy-drain / v64 gate path without
-- claiming that historic rows are upgraded.  The partial predicate means a
-- large historical queue does not require a table rewrite at release time.
CREATE INDEX IF NOT EXISTS ix_interview_job_v64_resume_epoch
  ON interview_job(owner_user_id, interview_id, reference_schema_version, resume_privacy_epoch, created_at)
  WHERE reference_schema_version=64;

-- `resume_id + resume_privacy_epoch` is one immutable binding.  The C-side
-- endpoint may create it exactly once from an empty created interview; B-side
-- application creation must supply it atomically on INSERT.  Do not put this
-- in a table-wide NOT VALID CHECK: that would make any unrelated update to a
-- historical v50 row fail merely because it has no epoch.
CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    IF (NEW.resume_id IS NULL) <> (NEW.resume_privacy_epoch IS NULL) THEN
      RAISE EXCEPTION 'interview_resume_epoch_pair_required' USING ERRCODE='P0001';
    END IF;
    IF NEW.resume_id IS NOT NULL THEN
      PERFORM 1
        FROM resume r
       WHERE r.id=NEW.resume_id
         AND r.owner_user_id=NEW.owner_user_id
         AND r.status='ingested'
         AND r.privacy_epoch=NEW.resume_privacy_epoch;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'interview_resume_epoch_not_active_or_mismatched' USING ERRCODE='P0001';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.application_id IS DISTINCT FROM OLD.application_id
     OR NEW.job_id IS DISTINCT FROM OLD.job_id
     OR NEW.application_attempt IS DISTINCT FROM OLD.application_attempt THEN
    RAISE EXCEPTION 'interview_application_binding_immutable' USING ERRCODE='P0001';
  END IF;

  IF NEW.resume_id IS DISTINCT FROM OLD.resume_id
     OR NEW.resume_privacy_epoch IS DISTINCT FROM OLD.resume_privacy_epoch THEN
    IF NOT (
      OLD.application_id IS NULL
      AND NEW.application_id IS NULL
      AND OLD.resume_id IS NULL
      AND OLD.resume_privacy_epoch IS NULL
      AND NEW.resume_id IS NOT NULL
      AND NEW.resume_privacy_epoch IS NOT NULL
      AND OLD.status='created'
    ) THEN
      RAISE EXCEPTION 'interview_resume_binding_immutable' USING ERRCODE='P0001';
    END IF;
    PERFORM 1
      FROM resume r
     WHERE r.id=NEW.resume_id
       AND r.owner_user_id=NEW.owner_user_id
       AND r.status='ingested'
       AND r.privacy_epoch=NEW.resume_privacy_epoch;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'interview_resume_epoch_not_active_or_mismatched' USING ERRCODE='P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_interview_application_binding_immutable ON interview;
CREATE TRIGGER trg_interview_application_binding_immutable
  BEFORE INSERT OR UPDATE OF application_id,application_attempt,job_id,resume_id,resume_privacy_epoch
  ON interview
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_application_binding_immutable();

-- New inserts must use v64.  Historic `NULL -> 49` remains an intentionally
-- narrow maintenance classification only; neither it nor v50 can ever be
-- made runnable by changing a row in place.
CREATE OR REPLACE FUNCTION enforce_interview_job_resume_reference()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='INSERT' AND NEW.reference_schema_version IS DISTINCT FROM 64 THEN
    RAISE EXCEPTION 'interview_job_legacy_reference_insert_forbidden' USING ERRCODE='P0001';
  END IF;

  IF TG_OP='UPDATE' AND (
    NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
    OR NEW.interview_id IS DISTINCT FROM OLD.interview_id
    OR NEW.kind IS DISTINCT FROM OLD.kind
    OR NEW.resume_id IS DISTINCT FROM OLD.resume_id
    OR NEW.resume_privacy_epoch IS DISTINCT FROM OLD.resume_privacy_epoch
    OR (
      NEW.reference_schema_version IS DISTINCT FROM OLD.reference_schema_version
      AND NOT (OLD.reference_schema_version IS NULL AND NEW.reference_schema_version=49)
    )
  ) THEN
    RAISE EXCEPTION 'interview_job_reference_immutable' USING ERRCODE='P0001';
  END IF;

  IF NEW.reference_schema_version=64 THEN
    IF NEW.kind='start'
       AND (NEW.resume_id IS NULL OR NEW.resume_privacy_epoch IS NULL) THEN
      RAISE EXCEPTION 'interview_job_start_resume_epoch_required' USING ERRCODE='P0001';
    END IF;
    IF NEW.kind='answer'
       AND (NEW.resume_id IS NOT NULL OR NEW.resume_privacy_epoch IS NULL) THEN
      RAISE EXCEPTION 'interview_job_answer_resume_locator_or_epoch_invalid' USING ERRCODE='P0001';
    END IF;

    PERFORM 1
      FROM interview i
      JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
     WHERE i.id=NEW.interview_id
       AND i.owner_user_id=NEW.owner_user_id
       AND i.resume_id IS NOT NULL
       AND i.resume_privacy_epoch IS NOT NULL
       AND r.status='ingested'
       AND r.privacy_epoch=i.resume_privacy_epoch
       AND (
         (NEW.kind='start'
          AND NEW.resume_id=i.resume_id
          AND NEW.resume_privacy_epoch=i.resume_privacy_epoch)
         OR
         (NEW.kind='answer'
          AND NEW.resume_id IS NULL
          AND NEW.resume_privacy_epoch=i.resume_privacy_epoch
          AND EXISTS (
            SELECT 1
              FROM interview_job s
             WHERE s.owner_user_id=NEW.owner_user_id
               AND s.interview_id=NEW.interview_id
               AND s.kind='start'
               AND s.reference_schema_version=64
               AND s.resume_id=i.resume_id
               AND s.resume_privacy_epoch=i.resume_privacy_epoch
               AND s.status IN ('queued','running','done')
          ))
       );
    IF NOT FOUND THEN
      RAISE EXCEPTION 'interview_job_v64_parent_resume_mismatch' USING ERRCODE='P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_interview_job_resume_reference ON interview_job;
CREATE TRIGGER trg_interview_job_resume_reference
  BEFORE INSERT OR UPDATE OF reference_schema_version,owner_user_id,interview_id,kind,resume_id,resume_privacy_epoch
  ON interview_job
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_job_resume_reference();
