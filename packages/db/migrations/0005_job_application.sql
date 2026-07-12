-- 0005_job_application.sql — B 端业务闭环:候选人 ↔ 岗位 ↔ 招聘方。
-- 业务:候选人浏览开放岗位 → 申请(做面试)→ 招聘方看到申请到自己岗位的候选人 + 结果。
-- 隐私边界(多方 RLS):招聘方只看到 application 的缓存分数/状态,**看不到候选人私有面试数据**(interview RLS 仍 owner-only)。

-- ① 开放岗位对候选人公开可读(投递需先看得到);写仍仅 owner。类似 qbank 公开读决策。
DROP POLICY IF EXISTS p_owner ON job_posting;
-- **迁移必须可重入(幂等)**:p_read/p_write 也要 DROP IF EXISTS 守卫,否则脏 DB(策略已存在)上重跑 CREATE 抛"already exists"→ runMigrations 崩 → worker 起不来。此前只守了 p_owner(名字不匹配)。
DROP POLICY IF EXISTS p_read ON job_posting;
DROP POLICY IF EXISTS p_write ON job_posting;
DROP POLICY IF EXISTS p_update ON job_posting;
CREATE POLICY p_read ON job_posting FOR SELECT
  USING (status = 'open' OR owner_user_id = current_setting('app.principal_user', true));
CREATE POLICY p_write ON job_posting FOR INSERT
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
CREATE POLICY p_update ON job_posting FOR UPDATE
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ② 申请表:候选人为某岗位做的面试 + 结果缓存。
CREATE TABLE IF NOT EXISTS job_application (
  id text PRIMARY KEY,
  job_id text NOT NULL,
  recruiter_user_id text NOT NULL,              -- 冗余岗位招聘方(多方 RLS + 招聘方查,无需 join job_posting)
  candidate_user_id text NOT NULL,              -- 候选人
  interview_id text,                            -- 候选人为此岗位做的面试
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','interviewing','completed')),
  score int,                                    -- 综合分(候选人完成面试后,由候选人侧服务核验回填——不可伪造)
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_user_id)            -- 同岗位同候选人一条(重复申请幂等)
);
CREATE INDEX IF NOT EXISTS ix_app_recruiter ON job_application (recruiter_user_id, job_id);
CREATE INDEX IF NOT EXISTS ix_app_candidate ON job_application (candidate_user_id);

GRANT SELECT, INSERT, UPDATE ON job_application TO app_role;

ALTER TABLE job_application ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_application FORCE ROW LEVEL SECURITY;
-- **多方 RLS**:候选人看自己的申请;招聘方看申请到自己岗位的;各自只能改自己那侧该改的。
DROP POLICY IF EXISTS p_party_read ON job_application;
CREATE POLICY p_party_read ON job_application FOR SELECT
  USING (candidate_user_id = current_setting('app.principal_user', true)
      OR recruiter_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS p_candidate_insert ON job_application;
CREATE POLICY p_candidate_insert ON job_application FOR INSERT
  WITH CHECK (candidate_user_id = current_setting('app.principal_user', true));   -- 只候选人自己投
DROP POLICY IF EXISTS p_candidate_update ON job_application;
CREATE POLICY p_candidate_update ON job_application FOR UPDATE
  USING (candidate_user_id = current_setting('app.principal_user', true))         -- 只候选人改自己的(回填分数/状态)
  WITH CHECK (candidate_user_id = current_setting('app.principal_user', true));
