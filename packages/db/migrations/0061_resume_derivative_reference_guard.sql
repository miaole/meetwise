-- 0061_resume_derivative_reference_guard.sql
--
-- Resume quiz and diagnosis jobs used to carry their resume locator in JSON.
-- A worker therefore had to claim an unbounded, historical payload before it
-- could decide whether that payload was safe.  Expand the four tables with a
-- typed owner-bound reference and an epoch; new writes are version 61 only.
-- Historical JSON is deliberately retained only as an opaque legacy record:
-- the worker terminalizes it without selecting or parsing `payload`.

-- Preserve every historical text reference for a later, audited erasure
-- snapshot/backfill.  Never cast it in place: malformed or cross-owner text
-- must not become a guessed UUID reference.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema='public' AND table_name='resume_quiz'
       AND column_name='resume_id' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE resume_quiz RENAME COLUMN resume_id TO legacy_resume_id;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema='public' AND table_name='resume_diagnosis'
       AND column_name='resume_id' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE resume_diagnosis RENAME COLUMN resume_id TO legacy_resume_id;
  END IF;
END $$;

ALTER TABLE resume_quiz
  ADD COLUMN IF NOT EXISTS resume_id uuid,
  ADD COLUMN IF NOT EXISTS privacy_epoch bigint;
ALTER TABLE resume_diagnosis
  ADD COLUMN IF NOT EXISTS resume_id uuid,
  ADD COLUMN IF NOT EXISTS privacy_epoch bigint;
ALTER TABLE quiz_job
  ADD COLUMN IF NOT EXISTS resume_id uuid,
  ADD COLUMN IF NOT EXISTS privacy_epoch bigint,
  ADD COLUMN IF NOT EXISTS reference_schema_version smallint;
ALTER TABLE diagnosis_job
  ADD COLUMN IF NOT EXISTS resume_id uuid,
  ADD COLUMN IF NOT EXISTS privacy_epoch bigint,
  ADD COLUMN IF NOT EXISTS reference_schema_version smallint;

-- A default applies only to new rows.  Existing NULL rows remain explicitly
-- legacy and are failed before any decrypt, graph, checkpoint, or model call.
ALTER TABLE quiz_job ALTER COLUMN reference_schema_version SET DEFAULT 61;
ALTER TABLE diagnosis_job ALTER COLUMN reference_schema_version SET DEFAULT 61;

ALTER TABLE resume_quiz
  ADD CONSTRAINT fk_resume_quiz_resume_owner_reference
  FOREIGN KEY (resume_id, owner_user_id)
  REFERENCES resume(id, owner_user_id) NOT VALID;
ALTER TABLE resume_diagnosis
  ADD CONSTRAINT fk_resume_diagnosis_resume_owner_reference
  FOREIGN KEY (resume_id, owner_user_id)
  REFERENCES resume(id, owner_user_id) NOT VALID;
ALTER TABLE quiz_job
  ADD CONSTRAINT fk_quiz_job_resume_owner_reference
  FOREIGN KEY (resume_id, owner_user_id)
  REFERENCES resume(id, owner_user_id) NOT VALID;
ALTER TABLE diagnosis_job
  ADD CONSTRAINT fk_diagnosis_job_resume_owner_reference
  FOREIGN KEY (resume_id, owner_user_id)
  REFERENCES resume(id, owner_user_id) NOT VALID;

ALTER TABLE resume_quiz
  ADD CONSTRAINT resume_quiz_reference_pair_chk
  CHECK ((resume_id IS NULL) = (privacy_epoch IS NULL)) NOT VALID;
ALTER TABLE resume_diagnosis
  ADD CONSTRAINT resume_diagnosis_reference_pair_chk
  CHECK ((resume_id IS NULL) = (privacy_epoch IS NULL)) NOT VALID;
ALTER TABLE quiz_job
  ADD CONSTRAINT quiz_job_reference_schema_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version=61) NOT VALID,
  ADD CONSTRAINT quiz_job_reference_pair_chk
  CHECK ((resume_id IS NULL) = (privacy_epoch IS NULL)) NOT VALID;
ALTER TABLE diagnosis_job
  ADD CONSTRAINT diagnosis_job_reference_schema_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version=61) NOT VALID,
  ADD CONSTRAINT diagnosis_job_reference_pair_chk
  CHECK ((resume_id IS NULL) = (privacy_epoch IS NULL)) NOT VALID;

CREATE INDEX IF NOT EXISTS ix_resume_quiz_resume_reference
  ON resume_quiz(owner_user_id, resume_id) WHERE resume_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_resume_diagnosis_resume_reference
  ON resume_diagnosis(owner_user_id, resume_id) WHERE resume_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_quiz_job_typed_reference
  ON quiz_job(owner_user_id, reference_schema_version, resume_id, created_at)
  WHERE reference_schema_version=61;
CREATE INDEX IF NOT EXISTS ix_diagnosis_job_typed_reference
  ON diagnosis_job(owner_user_id, reference_schema_version, resume_id, created_at)
  WHERE reference_schema_version=61;

-- A result row acquires its reference exactly once, while still `created`.
-- It is impossible to change, clear, or forge an epoch after that point.
CREATE OR REPLACE FUNCTION enforce_resume_derivative_reference()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.resume_id IS DISTINCT FROM OLD.resume_id
     OR NEW.privacy_epoch IS DISTINCT FROM OLD.privacy_epoch THEN
    IF OLD.resume_id IS NOT NULL OR OLD.privacy_epoch IS NOT NULL
       OR NEW.resume_id IS NULL OR NEW.privacy_epoch IS NULL
       OR OLD.status <> 'created' THEN
      RAISE EXCEPTION 'resume_derivative_reference_immutable' USING ERRCODE='P0001';
    END IF;
    PERFORM 1 FROM resume r
      WHERE r.id=NEW.resume_id
        AND r.owner_user_id=NEW.owner_user_id
        AND r.status='ingested'
        AND r.privacy_epoch=NEW.privacy_epoch;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'resume_derivative_reference_requires_active_owned_resume' USING ERRCODE='P0001';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_resume_quiz_reference ON resume_quiz;
CREATE TRIGGER trg_resume_quiz_reference
  BEFORE UPDATE OF resume_id, privacy_epoch ON resume_quiz
  FOR EACH ROW EXECUTE FUNCTION enforce_resume_derivative_reference();
DROP TRIGGER IF EXISTS trg_resume_diagnosis_reference ON resume_diagnosis;
CREATE TRIGGER trg_resume_diagnosis_reference
  BEFORE UPDATE OF resume_id, privacy_epoch ON resume_diagnosis
  FOR EACH ROW EXECUTE FUNCTION enforce_resume_derivative_reference();

-- New queue rows must contain the exact typed reference of their parent
-- result.  Updating a historical row's status remains allowed so a worker can
-- terminalize it; no runtime caller can manufacture a legacy row.
CREATE OR REPLACE FUNCTION enforce_resume_derivative_job_reference()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE expected_id uuid;
DECLARE expected_epoch bigint;
BEGIN
  IF TG_OP='INSERT' AND NEW.reference_schema_version IS DISTINCT FROM 61 THEN
    RAISE EXCEPTION 'resume_derivative_legacy_reference_insert_forbidden' USING ERRCODE='P0001';
  END IF;
  IF TG_OP='UPDATE' AND (
    NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
    OR NEW.resume_id IS DISTINCT FROM OLD.resume_id
    OR NEW.privacy_epoch IS DISTINCT FROM OLD.privacy_epoch
    OR NEW.reference_schema_version IS DISTINCT FROM OLD.reference_schema_version
  ) THEN
    RAISE EXCEPTION 'resume_derivative_job_reference_immutable' USING ERRCODE='P0001';
  END IF;
  IF NEW.reference_schema_version=61 THEN
    IF NEW.resume_id IS NULL OR NEW.privacy_epoch IS NULL THEN
      RAISE EXCEPTION 'resume_derivative_job_reference_required' USING ERRCODE='P0001';
    END IF;
    PERFORM 1 FROM resume r
      WHERE r.id=NEW.resume_id
        AND r.owner_user_id=NEW.owner_user_id
        AND r.status='ingested'
        AND r.privacy_epoch=NEW.privacy_epoch;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'resume_derivative_job_reference_not_active_owned' USING ERRCODE='P0001';
    END IF;
    IF TG_TABLE_NAME='quiz_job' THEN
      SELECT resume_id, privacy_epoch INTO expected_id, expected_epoch
        FROM resume_quiz WHERE id=NEW.quiz_id AND owner_user_id=NEW.owner_user_id;
    ELSE
      SELECT resume_id, privacy_epoch INTO expected_id, expected_epoch
        FROM resume_diagnosis WHERE id=NEW.diagnosis_id AND owner_user_id=NEW.owner_user_id;
    END IF;
    IF expected_id IS DISTINCT FROM NEW.resume_id
       OR expected_epoch IS DISTINCT FROM NEW.privacy_epoch THEN
      RAISE EXCEPTION 'resume_derivative_job_reference_parent_mismatch' USING ERRCODE='P0001';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_quiz_job_reference ON quiz_job;
CREATE TRIGGER trg_quiz_job_reference
  BEFORE INSERT OR UPDATE OF owner_user_id, resume_id, privacy_epoch, reference_schema_version
  ON quiz_job FOR EACH ROW EXECUTE FUNCTION enforce_resume_derivative_job_reference();
DROP TRIGGER IF EXISTS trg_diagnosis_job_reference ON diagnosis_job;
CREATE TRIGGER trg_diagnosis_job_reference
  BEFORE INSERT OR UPDATE OF owner_user_id, resume_id, privacy_epoch, reference_schema_version
  ON diagnosis_job FOR EACH ROW EXECUTE FUNCTION enforce_resume_derivative_job_reference();
