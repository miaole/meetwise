-- 0019_schema_drift_reconcile.sql — 修复 sql/ 与迁移路径的 schema 漂移(幂等,脏库可重跑)。
-- 系统性 diff(sql/ 真相 vs 0001_baseline+迁移 重建)发现:sql/15_audit、sql/16_feedback 在 0001_baseline(只拼到 sql/14)之后新增、
-- learning_progress/user_account.is_admin 也漂移出基线,**均无配套迁移** → fresh deploy(只跑迁移)缺这些表/列 →
-- admin 审计/题目反馈/学习进度端点 500,is_admin 缺失致 admin 守卫查询报错。本迁移把它们补进迁移路径,与 sql/ 对齐。

-- admin_audit(append-only,无 RLS,只 INSERT/SELECT)
CREATE TABLE IF NOT EXISTS admin_audit (
  id text PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL,
  target text,
  detail jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_audit_time ON admin_audit (created_at DESC);
GRANT SELECT, INSERT ON admin_audit TO app_role;

-- question_feedback(RLS owner 隔离)
CREATE TABLE IF NOT EXISTS question_feedback (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_index int NOT NULL,
  rating text NOT NULL CHECK (rating IN ('up','down')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, interview_id, question_index)
);
CREATE INDEX IF NOT EXISTS ix_qfb_rating ON question_feedback (rating);
GRANT SELECT, INSERT, UPDATE ON question_feedback TO app_role;
ALTER TABLE question_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_feedback FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_owner ON question_feedback;
CREATE POLICY p_owner ON question_feedback
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- learning_progress(RLS owner 隔离)
CREATE TABLE IF NOT EXISTS learning_progress (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  topic text NOT NULL,
  done_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, interview_id, topic)
);
GRANT SELECT, INSERT, DELETE ON learning_progress TO app_role;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_owner ON learning_progress;
CREATE POLICY p_owner ON learning_progress
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- user_account.is_admin(运营 admin 标志;AdminGuard 查询依赖)
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- interview_job 防双提交唯一约束(**约束漂移·begin 致命**):sql/05 有 UNIQUE(owner_user_id,interview_id,kind,seq),
-- 0001_baseline 无 → enqueueInterviewJob 的 `ON CONFLICT (owner_user_id,interview_id,kind,seq)` 撞 42P10 → **fresh deploy 下每次 begin 500,面试根本开不了**。
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid='interview_job'::regclass AND contype='u'
      AND conkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid='interview_job'::regclass AND attname='owner_user_id'),
        (SELECT attnum FROM pg_attribute WHERE attrelid='interview_job'::regclass AND attname='interview_id'),
        (SELECT attnum FROM pg_attribute WHERE attrelid='interview_job'::regclass AND attname='kind'),
        (SELECT attnum FROM pg_attribute WHERE attrelid='interview_job'::regclass AND attname='seq')
      ]::smallint[]
  ) THEN
    ALTER TABLE interview_job ADD CONSTRAINT interview_job_owner_user_id_interview_id_kind_seq_key UNIQUE (owner_user_id, interview_id, kind, seq);
  END IF;
END $$;
