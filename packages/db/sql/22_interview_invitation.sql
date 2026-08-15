-- 0009_interview_invitation.sql — B 端企业纵深:招聘方邀请候选人面试 + 人才库聚合。
-- 复用既有 job_application(多方 RLS),不另起新表(候选人自投 / 招聘方邀请同一条申请的不同来源)。
-- 隐私边界不变:招聘方只见 application 缓存状态/分数;候选人面试 transcript(interview / interview_event)
--   仍为 owner-only FORCE RLS,招聘方(另一 principal)读 = 0 行。who-pays:候选人用自己的额度池跑面试(他们的练习),
--   招聘方邀请只建申请壳,不碰额度/权益(AI 图/招聘方均不直接动 entitlement)。
-- 增量、非破坏:ADD COLUMN IF NOT EXISTS / DROP+ADD 已命名 CHECK(旧 'interviewing' 从未被写入,安全替换)。

-- ① 申请来源:候选人自投(applied)/ 招聘方邀请(invited)。默认 applied(向后兼容既有行)。
ALTER TABLE job_application ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'applied'
  CHECK (source IN ('applied','invited'));

-- ② 状态机扩展:invited → in_progress(候选人开始面试)→ completed(回填分数);declined(候选人婉拒,终态,不死胡同)。
--    旧集合含 'interviewing'(代码从未写入,但已部署库无法离线断言)→ 先把任何残留行迁到 'in_progress',
--    再换约束,确保 ADD CONSTRAINT 校验存量行时不会因一行残留而整迁移 ROLLBACK(部署硬卡)。
UPDATE job_application SET status='in_progress' WHERE status='interviewing';
ALTER TABLE job_application DROP CONSTRAINT IF EXISTS job_application_status_check;
ALTER TABLE job_application ADD CONSTRAINT job_application_status_check
  CHECK (status IN ('invited','in_progress','completed','declined'));

-- ③ 招聘方 INSERT 策略(多方 RLS 增量):招聘方可为**自己拥有的岗位**插入邀请行。
--    RLS 内 EXISTS 自校验岗位归属 → 即便仓储逻辑写错也无法越权代他人岗位邀请(纵深防御,安全边界在 RLS 不在应用层)。
DROP POLICY IF EXISTS p_recruiter_insert ON job_application;
CREATE POLICY p_recruiter_insert ON job_application FOR INSERT
  WITH CHECK (
    recruiter_user_id = current_setting('app.principal_user', true)
    AND EXISTS (SELECT 1 FROM job_posting j
                WHERE j.id = job_id AND j.owner_user_id = current_setting('app.principal_user', true))
  );

-- 人才库聚合(招聘方跨自有岗位看所有候选人)走既有 p_party_read(recruiter_user_id = principal),无需新策略。

-- C→B P0 对齐（生产增量见 0028）：申请必须拥有一场唯一、岗位/简历/候选人一致的面试；
-- 禁止把候选人的任意历史训练会话作为岗位评分来源。此文件供裸 SQL test harness 重建时使用。
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

CREATE OR REPLACE FUNCTION finalize_bound_job_application_on_interview_completion()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE derived_score int;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' OR NEW.application_id IS NULL THEN RETURN NEW; END IF;
  SELECT round(avg((e.payload->>'score')::numeric))::int INTO derived_score
    FROM interview_event e
   WHERE e.owner_user_id=NEW.owner_user_id AND e.stream_key=NEW.id AND e.kind='answer_evaluated'
     AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'
     AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$';
  IF derived_score IS NULL THEN RETURN NEW; END IF;
  UPDATE job_application ja SET score=derived_score,status='completed',version=version+1
   WHERE ja.id=NEW.application_id AND ja.interview_id=NEW.id AND ja.job_id=NEW.job_id
     AND ja.resume_id=NEW.resume_id AND ja.candidate_user_id=NEW.owner_user_id AND ja.status='in_progress';
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_finalize_bound_job_application ON interview;
CREATE TRIGGER trg_finalize_bound_job_application
AFTER UPDATE OF status ON interview FOR EACH ROW EXECUTE FUNCTION finalize_bound_job_application_on_interview_completion();

CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.application_id IS DISTINCT FROM OLD.application_id OR NEW.job_id IS DISTINCT FROM OLD.job_id OR NEW.resume_id IS DISTINCT FROM OLD.resume_id THEN
    RAISE EXCEPTION 'interview_application_binding_immutable';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_interview_application_binding_immutable ON interview;
CREATE TRIGGER trg_interview_application_binding_immutable
BEFORE UPDATE OF application_id,job_id,resume_id ON interview FOR EACH ROW EXECUTE FUNCTION enforce_interview_application_binding_immutable();

CREATE OR REPLACE FUNCTION enforce_job_application_interview_binding()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE derived_score int;
BEGIN
  IF NEW.interview_id IS DISTINCT FROM OLD.interview_id THEN
    IF OLD.interview_id IS NOT NULL THEN RAISE EXCEPTION 'job_application_interview_binding_immutable'; END IF;
    PERFORM 1 FROM interview i WHERE i.id=NEW.interview_id AND i.application_id=NEW.id AND i.job_id=NEW.job_id AND i.resume_id=NEW.resume_id AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'job_application_interview_binding_invalid'; END IF;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT ((OLD.status='invited' AND NEW.status IN ('in_progress','declined')) OR (OLD.status='in_progress' AND NEW.status='completed')) THEN
      RAISE EXCEPTION 'job_application_status_transition_invalid';
    END IF;
  END IF;
  IF NEW.status='in_progress' THEN
    PERFORM 1 FROM interview i WHERE i.id=NEW.interview_id AND i.application_id=NEW.id AND i.job_id=NEW.job_id AND i.resume_id=NEW.resume_id AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'job_application_start_requires_bound_interview'; END IF;
  END IF;
  IF NEW.status='completed' AND OLD.status <> 'completed' THEN
    SELECT round(avg((e.payload->>'score')::numeric))::int INTO derived_score FROM interview_event e
     WHERE e.owner_user_id=NEW.candidate_user_id AND e.stream_key=NEW.interview_id AND e.kind='answer_evaluated'
       AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved' AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$';
    PERFORM 1 FROM interview i WHERE i.id=NEW.interview_id AND i.status='completed' AND i.application_id=NEW.id
      AND i.job_id=NEW.job_id AND i.resume_id=NEW.resume_id AND i.owner_user_id=NEW.candidate_user_id;
    IF NOT FOUND OR derived_score IS NULL OR NEW.score IS DISTINCT FROM derived_score THEN RAISE EXCEPTION 'job_application_finalize_requires_completed_bound_interview'; END IF;
  ELSIF NEW.score IS DISTINCT FROM OLD.score THEN
    RAISE EXCEPTION 'job_application_score_immutable_until_finalize';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_enforce_job_application_interview_binding ON job_application;
CREATE TRIGGER trg_enforce_job_application_interview_binding
BEFORE UPDATE ON job_application FOR EACH ROW EXECUTE FUNCTION enforce_job_application_interview_binding();
