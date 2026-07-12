-- 16_feedback.sql — 用户对 AI 生成面试题的反馈(赞/踩+评论)。喂 AI 质量闭环(eval/改进信号)。接 01 后跑。
-- 一人一题一反馈(可改);RLS owner 隔离。admin 可聚合看质量(经 AdminGuard,超级用户读)。
DROP TABLE IF EXISTS question_feedback CASCADE;
CREATE TABLE question_feedback (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_index int NOT NULL,
  rating text NOT NULL CHECK (rating IN ('up','down')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, interview_id, question_index)
);
CREATE INDEX ix_qfb_rating ON question_feedback (rating);
GRANT SELECT, INSERT, UPDATE ON question_feedback TO app_role;
ALTER TABLE question_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_feedback FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON question_feedback
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
