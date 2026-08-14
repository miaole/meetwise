-- 0082_b_side_score_calibration_hold.sql
--
-- The current adaptive evaluator is useful as candidate-facing practice
-- feedback, but it has no frozen job blueprint/rubric, difficulty-equating or
-- calibration release.  A numeric B-side application score would therefore
-- be an unvalidated employment-ranking signal.  Hold every bound completion
-- at the existing scoreless review terminal until SCOR-01..08 ship.

CREATE OR REPLACE FUNCTION finalize_bound_job_application_on_interview_completion()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' OR NEW.application_id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE job_application ja
     SET score=NULL, status='assessment_unavailable', version=version+1
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

CREATE OR REPLACE FUNCTION enforce_job_application_interview_binding()
RETURNS trigger LANGUAGE plpgsql AS $$
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
      OR (OLD.status='in_progress' AND NEW.status='assessment_unavailable')
      OR (OLD.status='assessment_unavailable' AND NEW.status='in_progress')
      -- 0082 only uses this transition to quarantine a historical completion;
      -- it remains bound and scoreless, never becomes a new ranking outcome.
      OR (OLD.status='completed' AND NEW.status='assessment_unavailable')
    ) THEN
      RAISE EXCEPTION 'job_application_status_transition_invalid';
    END IF;
  END IF;

  IF NEW.status='in_progress' THEN
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

  -- B-side numeric completion is deliberately unavailable until a calibrated
  -- ScoreCard contract exists.  This also blocks raw SQL from restoring the
  -- previous average-of-LLM-scores behaviour.
  IF NEW.status='completed' AND OLD.status <> 'completed' THEN
    RAISE EXCEPTION 'job_application_score_calibration_required';
  ELSIF NEW.status='assessment_unavailable' AND OLD.status <> 'assessment_unavailable' THEN
    PERFORM 1
      FROM interview i
     WHERE i.id=NEW.interview_id
       AND i.application_id=NEW.id
       AND i.application_attempt=NEW.interview_attempt
       AND i.job_id=NEW.job_id
       AND i.resume_id=NEW.resume_id
       AND i.owner_user_id=NEW.candidate_user_id
       AND i.status IN ('failed','completed');
    IF NOT FOUND OR NEW.score IS NOT NULL THEN
      RAISE EXCEPTION 'job_application_assessment_unavailable_requires_bound_interview';
    END IF;
  ELSIF NEW.score IS DISTINCT FROM OLD.score THEN
    RAISE EXCEPTION 'job_application_score_immutable_until_calibrated';
  END IF;
  RETURN NEW;
END;
$$;

-- Historical B-side scores have neither a frozen rubric nor a calibration
-- release.  Preserve the application/interview binding while removing the
-- numeric ranking value.  Unbound rows are intentionally untouched: they are
-- not proven to be an application-derived score and require manual repair.
UPDATE job_application
   SET status='assessment_unavailable', score=NULL, version=version+1
 WHERE status='completed'
   AND interview_id IS NOT NULL;
