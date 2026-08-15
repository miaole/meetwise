-- 21_resume_diagnosis.sql — 简历诊断流程(resume-diagnosis 图)落库:诊断结果 + 生成 job 队列。接 01_schema 之后跑。
-- 镜像 resume_quiz(20_):显式 status enum、owner RLS、version 乐观锁、job 带租约+attempts(崩溃可重领,兼容 reaper)。
-- 诊断=据简历(×可选目标岗位)产出结构化诊断报告(结构/完整性/亮点/风险/匹配度 + 接地改写建议,绝不虚构经历)。
-- 进程边界铁律:api 薄(只入队+返回),长编排(resume-diagnosis 图/模型)在 worker。
DROP TABLE IF EXISTS resume_diagnosis, diagnosis_job CASCADE;

CREATE TABLE resume_diagnosis (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','generating','ready','failed')),
  legacy_resume_id text,                                    -- 历史 JSON/text 兼容位；运行时不得读取或回填猜测
  resume_id uuid,                                            -- 据哪份简历诊断(begin 时定;owner 复合 FK)
  privacy_epoch bigint,                                     -- 删除围栏世代；与 typed resume_id 成对写入
  target_role text,                                          -- 可选目标岗位(岗位匹配度维度据此评估)
  report jsonb,                                              -- DiagnosisReport {overall,summary,sections[],rewrites[],groundedCount,rejectedCount}
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_diagnosis_owner ON resume_diagnosis (owner_user_id, status);

CREATE TABLE diagnosis_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  diagnosis_id text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',                       -- 不含 resume locator/role；role 位于 parent row
  resume_id uuid,
  privacy_epoch bigint,
  reference_schema_version smallint,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  lease_owner text,
  lease_expires_at timestamptz,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_diagnosis_job UNIQUE (owner_user_id, diagnosis_id)   -- 一诊断一生成 job(begin 幂等,重复 begin 不双扣不双跑)
);
CREATE INDEX ix_diagnosisjob_claim ON diagnosis_job (owner_user_id, status, created_at);

GRANT SELECT, INSERT, UPDATE ON resume_diagnosis, diagnosis_job TO app_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['resume_diagnosis','diagnosis_job'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;
