-- 12_career.sql — 职业路径(成长链终点)。接 01 后跑。RLS owner 隔离。
DROP TABLE IF EXISTS career_path CASCADE;
CREATE TABLE career_path (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  readiness text NOT NULL,
  level text NOT NULL,
  milestones jsonb NOT NULL DEFAULT '[]',
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, interview_id)
);
GRANT SELECT, INSERT, UPDATE ON career_path TO app_role;
ALTER TABLE career_path ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_path FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON career_path
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
