-- 20_resume_quiz.sql — 押题流程(resume-quiz 图)落库:押题结果 + 生成 job 队列。接 01_schema 之后跑。
-- 镜像 interview 形状:显式 status enum、owner RLS、version 乐观锁。押题=据简历×能力预测训练问题(每题带接地考察点 refs)。
-- 进程边界铁律:api 薄(只入队+返回),长编排(resume-quiz 图/模型)在 worker;job 带租约+attempts,崩溃可重领。
DROP TABLE IF EXISTS resume_quiz, quiz_job CASCADE;

CREATE TABLE resume_quiz (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','generating','ready','failed')),
  resume_id text,                                            -- 据哪份简历押题(begin 时定;PII 仍在加密 blob,这里只存引用)
  questions jsonb NOT NULL DEFAULT '[]',                     -- [{q, refs}] 已过 factuality 歪曲门的题目
  report jsonb,                                              -- {score, grounded, summary} 图 make_report 节点派生
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_quiz_owner ON resume_quiz (owner_user_id, status);

CREATE TABLE quiz_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  quiz_id text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',                       -- {resumeId}
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  lease_owner text,
  lease_expires_at timestamptz,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_quiz_job UNIQUE (owner_user_id, quiz_id)     -- 一押题一生成 job(begin 幂等,重复 begin 不双扣不双跑)
);
CREATE INDEX ix_quizjob_claim ON quiz_job (owner_user_id, status, created_at);

GRANT SELECT, INSERT, UPDATE ON resume_quiz, quiz_job TO app_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['resume_quiz','quiz_job'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;
