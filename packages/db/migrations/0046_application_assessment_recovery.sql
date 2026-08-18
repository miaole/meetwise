-- 0046_application_assessment_recovery.sql
-- A missing score is not a zero score and must not leave a B-side application
-- in progress forever.  Preserve every old interview attempt, keep only one
-- current binding on job_application, and fence late workers by attempt number.

ALTER TABLE interview ADD COLUMN IF NOT EXISTS application_attempt integer;
ALTER TABLE job_application ADD COLUMN IF NOT EXISTS interview_attempt integer NOT NULL DEFAULT 0;

-- Existing application-bound sessions predate attempt numbers.  They are the
-- first attempt; ordinary C-side interviews remain NULL.
UPDATE interview
   SET application_attempt=1
 WHERE application_id IS NOT NULL AND application_attempt IS NULL;

UPDATE job_application ja
   SET interview_attempt=i.application_attempt
  FROM interview i
 WHERE ja.interview_id=i.id
   AND i.application_id=ja.id
   AND ja.interview_attempt=0;

ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_attempt;
ALTER TABLE interview ADD CONSTRAINT ck_interview_application_attempt
  CHECK (
    (application_id IS NULL AND application_attempt IS NULL)
    OR (application_id IS NOT NULL AND application_attempt IS NOT NULL AND application_attempt >= 1)
  );

-- One historic attempt was previously enforced per application.  The current
-- application row is now the pointer to the active attempt; immutable attempt
-- numbers retain the historical sessions for audit and prevent a late worker
-- from finalizing a newer retry.
DROP INDEX IF EXISTS uq_interview_application_binding;
CREATE UNIQUE INDEX IF NOT EXISTS uq_interview_application_attempt
  ON interview(application_id, application_attempt)
  WHERE application_id IS NOT NULL;

ALTER TABLE job_application DROP CONSTRAINT IF EXISTS job_application_status_check;
ALTER TABLE job_application ADD CONSTRAINT job_application_status_check
  CHECK (status IN ('invited','in_progress','completed','declined','assessment_unavailable'));
ALTER TABLE job_application DROP CONSTRAINT IF EXISTS ck_job_application_score_range;
ALTER TABLE job_application ADD CONSTRAINT ck_job_application_score_range
  CHECK (score IS NULL OR score BETWEEN 0 AND 100);

-- `job_id` alone is globally unique today, but the redundant recruiter field
-- is an authorization boundary (RLS exposes rows to that recruiter).  Make
-- the relationship structural as well as application-validated: a candidate
-- can never point an application at somebody else's job while naming a victim
-- recruiter.
ALTER TABLE job_posting DROP CONSTRAINT IF EXISTS uq_job_posting_id_owner;
ALTER TABLE job_posting ADD CONSTRAINT uq_job_posting_id_owner UNIQUE (id, owner_user_id);
ALTER TABLE job_application DROP CONSTRAINT IF EXISTS fk_job_application_job_recruiter;
ALTER TABLE job_application ADD CONSTRAINT fk_job_application_job_recruiter
  FOREIGN KEY (job_id, recruiter_user_id)
  REFERENCES job_posting(id, owner_user_id)
  DEFERRABLE INITIALLY IMMEDIATE;

-- RLS establishes who may submit a row, but cannot express the complete
-- business invariant for a multi-party aggregate.  This trigger blocks a
-- candidate from inserting a pre-completed/high-score row and freezes the
-- tenant identity fields after creation.  Runtime writes execute as app_role
-- with app.principal_user; migrations/backup restore are the only privileged
-- paths outside that boundary.
CREATE OR REPLACE FUNCTION enforce_job_application_lineage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE principal text;
BEGIN
  principal := current_setting('app.principal_user', true);
  IF TG_OP='INSERT' THEN
    PERFORM 1 FROM job_posting j
      WHERE j.id=NEW.job_id AND j.owner_user_id=NEW.recruiter_user_id AND j.status='open';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'job_application_requires_open_owned_job';
    END IF;
    IF NEW.status <> 'invited' OR NEW.score IS NOT NULL OR NEW.interview_id IS NOT NULL
       OR NEW.resume_id IS NOT NULL OR NEW.interview_attempt <> 0 THEN
      RAISE EXCEPTION 'job_application_insert_must_be_scoreless_invited_shell';
    END IF;
    IF principal=NEW.candidate_user_id THEN
      IF NEW.source <> 'applied' THEN RAISE EXCEPTION 'job_application_candidate_source_invalid'; END IF;
    ELSIF principal=NEW.recruiter_user_id THEN
      IF NEW.source <> 'invited' THEN RAISE EXCEPTION 'job_application_recruiter_source_invalid'; END IF;
    ELSE
      RAISE EXCEPTION 'job_application_insert_principal_invalid';
    END IF;
  ELSE
    IF NEW.job_id IS DISTINCT FROM OLD.job_id
       OR NEW.recruiter_user_id IS DISTINCT FROM OLD.recruiter_user_id
       OR NEW.candidate_user_id IS DISTINCT FROM OLD.candidate_user_id
       OR NEW.source IS DISTINCT FROM OLD.source THEN
      RAISE EXCEPTION 'job_application_identity_immutable';
    END IF;
    IF principal IS DISTINCT FROM OLD.candidate_user_id THEN
      RAISE EXCEPTION 'job_application_update_principal_invalid';
    END IF;
    IF NEW.resume_id IS DISTINCT FROM OLD.resume_id
       AND NOT (
         (OLD.status='invited' AND NEW.status='in_progress')
         OR (OLD.status='assessment_unavailable' AND NEW.status='in_progress')
       ) THEN
      RAISE EXCEPTION 'job_application_resume_mutation_invalid';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_job_application_lineage ON job_application;
CREATE TRIGGER trg_job_application_lineage
BEFORE INSERT OR UPDATE ON job_application
FOR EACH ROW EXECUTE FUNCTION enforce_job_application_lineage();

-- Do not let a repair script or a future lifecycle accidentally bypass the
-- worker's `answer_unscored` branch and turn missing model evidence into a
-- paid, completed assessment.  This fires before the paired confirmation can
-- commit, so the caller's whole settlement transaction rolls back.
CREATE OR REPLACE FUNCTION enforce_interview_scoring_completion_integrity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status='completed' AND OLD.status <> 'completed'
     AND EXISTS (
       SELECT 1 FROM interview_event e
        WHERE e.owner_user_id=NEW.owner_user_id
          AND e.stream_key=NEW.id
          AND e.kind='answer_unscored'
     ) THEN
    RAISE EXCEPTION 'interview_completion_requires_all_answers_scored'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_interview_scoring_completion_integrity ON interview;
CREATE TRIGGER trg_interview_scoring_completion_integrity
BEFORE UPDATE OF status ON interview
FOR EACH ROW EXECUTE FUNCTION enforce_interview_scoring_completion_integrity();

-- 0020 guarded only completed/abandoned.  A scoreless or crashed assessment
-- must also be paired with a released reservation; otherwise a direct UPDATE
-- can commit the forbidden `(failed, reserved)` state.
CREATE OR REPLACE FUNCTION enforce_interview_consumption_terminal_pair()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  consumption_status text;
BEGIN
  IF NEW.status NOT IN ('completed', 'abandoned', 'failed') THEN
    RETURN NEW;
  END IF;

  SELECT status INTO consumption_status
    FROM entitlement_consumption
   WHERE owner_user_id=NEW.owner_user_id AND idempotency_key=NEW.id
   LIMIT 1;
  IF consumption_status IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status='completed' AND consumption_status <> 'confirmed' THEN
    RAISE EXCEPTION 'invalid_interview_consumption_pair: completed requires confirmed, got %', consumption_status
      USING ERRCODE='23514';
  END IF;
  IF NEW.status IN ('abandoned','failed') AND consumption_status <> 'released' THEN
    RAISE EXCEPTION 'invalid_interview_consumption_pair: % requires released, got %', NEW.status, consumption_status
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION finalize_bound_job_application_on_interview_completion()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE derived_score int;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' OR NEW.application_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT round(avg((e.payload->>'score')::numeric))::int INTO derived_score
    FROM interview_event e
   WHERE e.owner_user_id=NEW.owner_user_id AND e.stream_key=NEW.id AND e.kind='answer_evaluated'
     AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'
     AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\.[0-9]+)?$';
  IF derived_score IS NULL THEN RETURN NEW; END IF;

  UPDATE job_application ja
     SET score=derived_score, status='completed', version=version+1
   WHERE ja.id=NEW.application_id
     AND ja.interview_id=NEW.id
     AND ja.interview_attempt=NEW.application_attempt
     AND ja.job_id=NEW.job_id
     AND ja.resume_id=NEW.resume_id
     AND ja.candidate_user_id=NEW.owner_user_id
     AND ja.status='in_progress';
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.application_id IS DISTINCT FROM OLD.application_id
     OR NEW.job_id IS DISTINCT FROM OLD.job_id
     OR NEW.resume_id IS DISTINCT FROM OLD.resume_id
     OR NEW.application_attempt IS DISTINCT FROM OLD.application_attempt THEN
    RAISE EXCEPTION 'interview_application_binding_immutable';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_interview_application_binding_immutable ON interview;
CREATE TRIGGER trg_interview_application_binding_immutable
BEFORE UPDATE OF application_id,application_attempt,job_id,resume_id ON interview
FOR EACH ROW EXECUTE FUNCTION enforce_interview_application_binding_immutable();

CREATE OR REPLACE FUNCTION enforce_job_application_interview_binding()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE derived_score int;
BEGIN
  IF NEW.interview_id IS DISTINCT FROM OLD.interview_id THEN
    IF OLD.interview_id IS NOT NULL
       AND NOT (OLD.status='assessment_unavailable' AND NEW.status='in_progress') THEN
      RAISE EXCEPTION 'job_application_interview_binding_immutable';
    END IF;
    PERFORM 1 FROM interview i
      WHERE i.id=NEW.interview_id
        AND i.application_id=NEW.id
        AND i.application_attempt=NEW.interview_attempt
        AND i.job_id=NEW.job_id
        AND i.resume_id=NEW.resume_id
        AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'job_application_interview_binding_invalid'; END IF;
  END IF;

  -- Attempt is part of the immutable binding, not a mutable counter.  It may
  -- change only together with the one legal pointer transition; otherwise a
  -- candidate (or an accidental repair statement) can skip generations and
  -- defeat the late-worker fence without ever touching interview_id.
  IF NEW.interview_attempt IS DISTINCT FROM OLD.interview_attempt
     AND NOT (
       (OLD.status='invited' AND NEW.status='in_progress'
        AND OLD.interview_id IS NULL AND NEW.interview_id IS NOT NULL
        AND NEW.interview_attempt=1)
       OR
       (OLD.status='assessment_unavailable' AND NEW.status='in_progress'
        AND NEW.interview_id IS DISTINCT FROM OLD.interview_id
        AND NEW.interview_attempt=OLD.interview_attempt+1)
     ) THEN
    RAISE EXCEPTION 'job_application_attempt_mutation_invalid';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (OLD.status='invited' AND NEW.status IN ('in_progress','declined'))
      OR (OLD.status='in_progress' AND NEW.status IN ('completed','assessment_unavailable'))
      OR (OLD.status='assessment_unavailable' AND NEW.status='in_progress')
    ) THEN
      RAISE EXCEPTION 'job_application_status_transition_invalid';
    END IF;
  END IF;

  IF NEW.status='in_progress' THEN
    -- A recovery is never a resurrection.  It must atomically replace the
    -- failed pointer with the next immutable attempt; otherwise a direct SQL
    -- writer can make an application look startable while it still points at
    -- a failed interview that `begin` can never resume.
    IF OLD.status='assessment_unavailable' AND (
      NEW.interview_id IS NOT DISTINCT FROM OLD.interview_id
      OR NEW.interview_attempt <> OLD.interview_attempt + 1
    ) THEN
      RAISE EXCEPTION 'job_application_recovery_requires_next_bound_attempt';
    END IF;
    IF OLD.status='invited' AND NEW.interview_attempt <> 1 THEN
      RAISE EXCEPTION 'job_application_initial_start_requires_attempt_one';
    END IF;
    PERFORM 1 FROM interview i
      WHERE i.id=NEW.interview_id
        AND i.application_id=NEW.id
        AND i.application_attempt=NEW.interview_attempt
        AND i.job_id=NEW.job_id
        AND i.resume_id=NEW.resume_id
        AND i.owner_user_id=NEW.candidate_user_id
        AND i.status IN ('created','active');
    IF NOT FOUND THEN RAISE EXCEPTION 'job_application_start_requires_bound_interview'; END IF;
  END IF;

  IF NEW.status='completed' AND OLD.status <> 'completed' THEN
    SELECT round(avg((e.payload->>'score')::numeric))::int INTO derived_score
      FROM interview_event e
     WHERE e.owner_user_id=NEW.candidate_user_id AND e.stream_key=NEW.interview_id AND e.kind='answer_evaluated'
       AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'
       AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\.[0-9]+)?$';
    PERFORM 1 FROM interview i
      WHERE i.id=NEW.interview_id
        AND i.status='completed'
        AND i.application_id=NEW.id
        AND i.application_attempt=NEW.interview_attempt
        AND i.job_id=NEW.job_id
        AND i.resume_id=NEW.resume_id
        AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND OR derived_score IS NULL OR NEW.score IS DISTINCT FROM derived_score THEN
      RAISE EXCEPTION 'job_application_finalize_requires_completed_bound_interview';
    END IF;
  ELSIF NEW.status='assessment_unavailable' AND OLD.status <> 'assessment_unavailable' THEN
    PERFORM 1 FROM interview i
      WHERE i.id=NEW.interview_id
        AND i.status='failed'
        AND i.application_id=NEW.id
        AND i.application_attempt=NEW.interview_attempt
        AND i.job_id=NEW.job_id
        AND i.resume_id=NEW.resume_id
        AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND OR NEW.score IS NOT NULL THEN
      RAISE EXCEPTION 'job_application_assessment_unavailable_requires_failed_bound_interview';
    END IF;
  ELSIF NEW.score IS DISTINCT FROM OLD.score THEN
    RAISE EXCEPTION 'job_application_score_immutable_until_finalize';
  END IF;
  RETURN NEW;
END;
$$;
