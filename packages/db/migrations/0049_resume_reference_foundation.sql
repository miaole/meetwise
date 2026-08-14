-- 0049_resume_reference_foundation.sql
--
-- A resume erasure cannot discover C-side consumers by parsing mutable queue
-- JSON.  New C interviews bind one immutable, owner-checked resume reference
-- before their start job is enqueued.  This migration is deliberately only the
-- reference foundation: it does not claim to erase a resume or to change B
-- side retention/settlement semantics.

-- Application-bound interviews still require the complete application/job/
-- resume tuple.  A normal C interview may acquire its one resume reference at
-- begin time, but can never replace or clear it afterwards.
ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
  CHECK (
    (application_id IS NULL AND job_id IS NULL)
    OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
  );

ALTER TABLE interview DROP CONSTRAINT IF EXISTS fk_interview_resume_owner_binding;
ALTER TABLE interview ADD CONSTRAINT fk_interview_resume_owner_binding
  FOREIGN KEY (resume_id, owner_user_id)
  REFERENCES resume(id, owner_user_id)
  DEFERRABLE INITIALLY IMMEDIATE;

-- Start jobs use this column as their source locator.  `payload.resumeId` is
-- legacy-only compatibility data; new production writes populate this column
-- and do not put a resume locator in JSON.
ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS resume_id uuid;
ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS fk_interview_job_resume_owner_binding;
ALTER TABLE interview_job ADD CONSTRAINT fk_interview_job_resume_owner_binding
  FOREIGN KEY (resume_id, owner_user_id)
  REFERENCES resume(id, owner_user_id)
  DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS ix_interview_job_resume_reference
  ON interview_job(owner_user_id, resume_id)
  WHERE resume_id IS NOT NULL;

-- Backfill only values proven to be UUIDs that refer to an owned existing
-- resume.  Any other historical payload remains NULL and must be classified
-- explicitly by the future erasure migration; it must never be guessed.
UPDATE interview_job j
   SET resume_id = r.id
  FROM resume r
 WHERE j.kind='start'
   AND j.resume_id IS NULL
   AND j.payload ? 'resumeId'
   AND (j.payload->>'resumeId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
   AND r.id=(j.payload->>'resumeId')::uuid
   AND r.owner_user_id=j.owner_user_id;

CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.application_id IS DISTINCT FROM OLD.application_id
     OR NEW.job_id IS DISTINCT FROM OLD.job_id
     OR NEW.application_attempt IS DISTINCT FROM OLD.application_attempt THEN
    RAISE EXCEPTION 'interview_application_binding_immutable';
  END IF;

  IF NEW.resume_id IS DISTINCT FROM OLD.resume_id THEN
    -- Ordinary C interviews are created before `/begin` knows the selected
    -- resume.  Allow exactly one NULL -> owned/ingested resume assignment in
    -- the created state; every other mutation remains an immutable-binding
    -- violation, including all B-side application attempts.
    IF OLD.application_id IS NULL
       AND NEW.application_id IS NULL
       AND OLD.resume_id IS NULL
       AND NEW.resume_id IS NOT NULL
       AND OLD.status='created' THEN
      PERFORM 1 FROM resume r
       WHERE r.id=NEW.resume_id
         AND r.owner_user_id=NEW.owner_user_id
         AND r.status='ingested';
      IF NOT FOUND THEN
        RAISE EXCEPTION 'interview_resume_reference_requires_owned_ingested_resume';
      END IF;
    ELSE
      RAISE EXCEPTION 'interview_application_binding_immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_interview_application_binding_immutable ON interview;
CREATE TRIGGER trg_interview_application_binding_immutable
BEFORE UPDATE OF application_id,application_attempt,job_id,resume_id ON interview
FOR EACH ROW EXECUTE FUNCTION enforce_interview_application_binding_immutable();
