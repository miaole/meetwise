-- 0028_application_bound_interview.sql
-- C→B P0:招聘申请不是“候选人的任意历史练习”。一个 application 只能绑定一场
-- 同候选人、同岗位、同简历快照的 interview；完成时由数据库回填，浏览器重放只会得到同一结果。
-- 旧 application 没有绑定时保持 fail-closed，绝不猜测把历史 C 端训练归属给企业岗位。

ALTER TABLE interview ADD COLUMN IF NOT EXISTS application_id text;
ALTER TABLE interview ADD COLUMN IF NOT EXISTS job_id text;
ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_id uuid;
ALTER TABLE job_application ADD COLUMN IF NOT EXISTS resume_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS uq_interview_application_binding
  ON interview(application_id) WHERE application_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_job_application_interview_binding
  ON job_application(interview_id) WHERE interview_id IS NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ck_interview_application_binding_complete') THEN
    ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
      CHECK ((application_id IS NULL AND job_id IS NULL AND resume_id IS NULL)
          OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_interview_application_binding') THEN
    ALTER TABLE interview ADD CONSTRAINT fk_interview_application_binding
      FOREIGN KEY (application_id) REFERENCES job_application(id) DEFERRABLE INITIALLY DEFERRED;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_interview_job_binding') THEN
    ALTER TABLE interview ADD CONSTRAINT fk_interview_job_binding
      FOREIGN KEY (job_id) REFERENCES job_posting(id) DEFERRABLE INITIALLY DEFERRED;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_interview_resume_binding') THEN
    ALTER TABLE interview ADD CONSTRAINT fk_interview_resume_binding
      FOREIGN KEY (resume_id) REFERENCES resume(id) DEFERRABLE INITIALLY DEFERRED;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_job_application_resume_binding') THEN
    ALTER TABLE job_application ADD CONSTRAINT fk_job_application_resume_binding
      FOREIGN KEY (resume_id) REFERENCES resume(id) DEFERRABLE INITIALLY DEFERRED;
  END IF;
END $$;

-- 完成收口由 worker 的同一事务触发；浏览器 /finalize 只是可重试的确认路径。
-- 所有映射条件均再次验证，避免 application_id 被错误写入时把分数跨岗位/跨人回填。
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
     AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$';

  IF derived_score IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE job_application ja
     SET score=derived_score, status='completed', version=version+1
   WHERE ja.id=NEW.application_id
     AND ja.interview_id=NEW.id
     AND ja.job_id=NEW.job_id
     AND ja.resume_id=NEW.resume_id
     AND ja.candidate_user_id=NEW.owner_user_id
     AND ja.status='in_progress';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_finalize_bound_job_application ON interview;
CREATE TRIGGER trg_finalize_bound_job_application
AFTER UPDATE OF status ON interview
FOR EACH ROW EXECUTE FUNCTION finalize_bound_job_application_on_interview_completion();

-- application 绑定只能在 INSERT interview 时写入，之后不可把一场普通历史训练“改绑”为招聘面试。
CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.application_id IS DISTINCT FROM OLD.application_id
     OR NEW.job_id IS DISTINCT FROM OLD.job_id
     OR NEW.resume_id IS DISTINCT FROM OLD.resume_id THEN
    RAISE EXCEPTION 'interview_application_binding_immutable';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_interview_application_binding_immutable ON interview;
CREATE TRIGGER trg_interview_application_binding_immutable
BEFORE UPDATE OF application_id,job_id,resume_id ON interview
FOR EACH ROW EXECUTE FUNCTION enforce_interview_application_binding_immutable();

-- application 表本身也不能被 app_role 直接伪造状态/分数/映射；所有合法路径都须满足同一四元组。
CREATE OR REPLACE FUNCTION enforce_job_application_interview_binding()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE derived_score int;
BEGIN
  IF NEW.interview_id IS DISTINCT FROM OLD.interview_id THEN
    IF OLD.interview_id IS NOT NULL THEN RAISE EXCEPTION 'job_application_interview_binding_immutable'; END IF;
    PERFORM 1 FROM interview i
      WHERE i.id=NEW.interview_id AND i.application_id=NEW.id AND i.job_id=NEW.job_id
        AND i.resume_id=NEW.resume_id AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'job_application_interview_binding_invalid'; END IF;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT ((OLD.status='invited' AND NEW.status IN ('in_progress','declined'))
         OR (OLD.status='in_progress' AND NEW.status='completed')) THEN
      RAISE EXCEPTION 'job_application_status_transition_invalid';
    END IF;
  END IF;

  IF NEW.status='in_progress' THEN
    PERFORM 1 FROM interview i
      WHERE i.id=NEW.interview_id AND i.application_id=NEW.id AND i.job_id=NEW.job_id
        AND i.resume_id=NEW.resume_id AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'job_application_start_requires_bound_interview'; END IF;
  END IF;

  IF NEW.status='completed' AND OLD.status <> 'completed' THEN
    SELECT round(avg((e.payload->>'score')::numeric))::int INTO derived_score
      FROM interview_event e
     WHERE e.owner_user_id=NEW.candidate_user_id AND e.stream_key=NEW.interview_id AND e.kind='answer_evaluated'
       AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'
       AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$';
    PERFORM 1 FROM interview i
      WHERE i.id=NEW.interview_id AND i.status='completed' AND i.application_id=NEW.id
        AND i.job_id=NEW.job_id AND i.resume_id=NEW.resume_id AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND OR derived_score IS NULL OR NEW.score IS DISTINCT FROM derived_score THEN
      RAISE EXCEPTION 'job_application_finalize_requires_completed_bound_interview';
    END IF;
  ELSIF NEW.score IS DISTINCT FROM OLD.score THEN
    RAISE EXCEPTION 'job_application_score_immutable_until_finalize';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_enforce_job_application_interview_binding ON job_application;
CREATE TRIGGER trg_enforce_job_application_interview_binding
BEFORE UPDATE ON job_application
FOR EACH ROW EXECUTE FUNCTION enforce_job_application_interview_binding();
