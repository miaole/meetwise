-- 0051_application_no_eligible_score_terminal.sql
-- A completed B-side interview with no eligible scoring evidence must not leave
-- its application in_progress forever.  `unresolved` means the candidate did
-- not form an assessable answer; it is not a fabricated zero.  The interview
-- may still be a completed, confirmed C-side interaction, while its B-side
-- application becomes retryable assessment_unavailable with score NULL.

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
     AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\.[0-9]+)?$'
     AND (e.payload->>'score')::numeric BETWEEN 0 AND 100;
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
       AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\.[0-9]+)?$'
       AND (e.payload->>'score')::numeric BETWEEN 0 AND 100;
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
    PERFORM 1
      FROM interview i
     WHERE i.id=NEW.interview_id
       AND i.application_id=NEW.id
       AND i.application_attempt=NEW.interview_attempt
       AND i.job_id=NEW.job_id
       AND i.resume_id=NEW.resume_id
       AND i.owner_user_id=NEW.candidate_user_id
       AND (
         i.status='failed'
         OR (
           i.status='completed'
           AND NOT EXISTS (
             SELECT 1
               FROM interview_event e
              WHERE e.owner_user_id=i.owner_user_id
                AND e.stream_key=i.id
                AND e.kind='answer_evaluated'
                AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'
                AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\.[0-9]+)?$'
                AND (e.payload->>'score')::numeric BETWEEN 0 AND 100
           )
         )
       );
    IF NOT FOUND OR NEW.score IS NOT NULL THEN
      RAISE EXCEPTION 'job_application_assessment_unavailable_requires_failed_or_scoreless_bound_interview';
    END IF;
  ELSIF NEW.score IS DISTINCT FROM OLD.score THEN
    RAISE EXCEPTION 'job_application_score_immutable_until_finalize';
  END IF;
  RETURN NEW;
END;
$$;
