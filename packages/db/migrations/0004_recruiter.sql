-- 0004_recruiter.sql — B 端(招聘方)岗位发布。多租户:RLS 按 owner(招聘方)隔离,只见自己的岗位。
-- 候选人接 C 端面试引擎;岗位的目标能力(competencies)驱动面试出题。
CREATE TABLE IF NOT EXISTS job_posting (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,                  -- 招聘方(租户)
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  competencies jsonb NOT NULL DEFAULT '[]',     -- 目标能力数组(面试引擎据此出题)
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_job_owner ON job_posting (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON job_posting TO app_role;

ALTER TABLE job_posting ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posting FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_owner ON job_posting;
CREATE POLICY p_owner ON job_posting
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
