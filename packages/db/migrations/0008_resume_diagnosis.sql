-- 0008_resume_diagnosis.sql — 简历诊断流程(resume-diagnosis 图)增量迁移:诊断结果表 + 生成 job 队列。
-- **非破坏**:CREATE TABLE/INDEX IF NOT EXISTS + 策略幂等守卫(重跑/已存在不报错,绝不 DROP 丢数据)。
-- 镜像 resume_quiz(0007):显式 status enum、owner FORCE RLS、version 乐观锁、job 带租约+attempts(兼容 reaper)。
-- sql/21_resume_diagnosis.sql 为同形单文件镜像(供 proof 直跑)。

CREATE TABLE IF NOT EXISTS resume_diagnosis (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','generating','ready','failed')),
  resume_id text,
  target_role text,
  report jsonb,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_diagnosis_owner ON resume_diagnosis (owner_user_id, status);

CREATE TABLE IF NOT EXISTS diagnosis_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  diagnosis_id text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  lease_owner text,
  lease_expires_at timestamptz,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_diagnosis_job UNIQUE (owner_user_id, diagnosis_id)
);
CREATE INDEX IF NOT EXISTS ix_diagnosisjob_claim ON diagnosis_job (owner_user_id, status, created_at);

GRANT SELECT, INSERT, UPDATE ON resume_diagnosis, diagnosis_job TO app_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['resume_diagnosis','diagnosis_job'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = t AND policyname = 'p_owner') THEN
      EXECUTE format(
        'CREATE POLICY p_owner ON %I '
        'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
        'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
    END IF;
  END LOOP;
END $$;
