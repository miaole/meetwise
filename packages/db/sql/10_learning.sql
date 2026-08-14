-- 10_learning.sql — 学习计划(评估差距 → 学习项)。接 01 后跑。RLS owner 隔离。
DROP TABLE IF EXISTS learning_plan CASCADE;

CREATE TABLE learning_plan (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed')),
  items jsonb NOT NULL DEFAULT '[]',
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, interview_id)
);
CREATE INDEX ix_learn_owner ON learning_plan (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON learning_plan TO app_role;

ALTER TABLE learning_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plan FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON learning_plan
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- 学习进度(留存:标记学过的项)。topic 为键(对应 LearnItem.topic)。append/delete 即完成/取消。RLS owner。
DROP TABLE IF EXISTS learning_progress CASCADE;
CREATE TABLE learning_progress (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  topic text NOT NULL,
  done_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, interview_id, topic)
);
GRANT SELECT, INSERT, DELETE ON learning_progress TO app_role;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON learning_progress
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
