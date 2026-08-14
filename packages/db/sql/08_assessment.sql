-- 08_assessment.sql — 能力评估报告(把面试 eval 结果 → 能力维度+差距)。接 01 后跑。
-- 状态机:pending→ready/failed(显式 enum,审计转移)。RLS owner 隔离。差距维度回写成长档案记忆(user_memory)。
DROP TABLE IF EXISTS assessment_report CASCADE;

CREATE TABLE assessment_report (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','failed')),
  dimensions jsonb NOT NULL DEFAULT '[]',      -- [{dimension, score, gap:bool, evidence:[]}]
  overall int,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, interview_id)
);
CREATE INDEX ix_assess_owner ON assessment_report (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON assessment_report TO app_role;

ALTER TABLE assessment_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_report FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON assessment_report
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
