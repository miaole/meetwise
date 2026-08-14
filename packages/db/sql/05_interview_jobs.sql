-- 05_interview_jobs.sql — 面试 job 队列：api 入队(start/answer),worker 消费循环 drain。接 01_schema 之后跑。
-- 进程边界:api 薄(只入队+返回),长编排(图/模型)在 worker(架构铁律)。job 带租约+attempts,崩溃可重领。
DROP TABLE IF EXISTS interview_job CASCADE;

CREATE TABLE interview_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('start','answer')),
  seq int NOT NULL DEFAULT 0,                                 -- 同面试内保序(答题按 seq 消费)
  payload jsonb NOT NULL DEFAULT '{}',                        -- start:{resumeRaw}; answer:{turn, answer}
  resume_id uuid,                                             -- 生产迁移 0049+：start 的稳定来源列
  reference_schema_version smallint NOT NULL DEFAULT 50 CHECK (reference_schema_version=50),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  lease_owner text,
  lease_expires_at timestamptz,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, interview_id, kind, seq)             -- 防双提交:同面试同题(seq=turn)只一个 job(否则第二个 resume 错位应用到下一题)
);
CREATE INDEX ix_ijob_claim ON interview_job (owner_user_id, status, seq, created_at);

GRANT SELECT, INSERT, UPDATE ON interview_job TO app_role;

ALTER TABLE interview_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_job FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON interview_job
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
