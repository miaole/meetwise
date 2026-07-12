-- 04_report.sql — 报告子图**舱壁**：报告作为独立后台 job,与面试主链路解耦。接 01_schema 之后跑。
-- 失败隔离：报告失败绝不回滚/阻塞 interview（面试结果照样 completed）；报告自带状态机 + 租约 + 重试,可独立恢复。
DROP TABLE IF EXISTS ai_report CASCADE;

CREATE TABLE ai_report (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','ready','failed','quarantined')),
  content jsonb,                                              -- ready 时填
  attempts int NOT NULL DEFAULT 0,
  next_attempt_at timestamptz,                                -- 退避：failed 后到此刻才允许重排（防瞬时故障毫秒内烧光重试次数）
  last_error text,
  lease_owner text,                                           -- 哪个 worker 在跑（防并发双跑）
  lease_expires_at timestamptz,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_report_interview UNIQUE (owner_user_id, interview_id)  -- 一场面试一份报告（enqueue 幂等）
);
CREATE INDEX ix_report_claimable ON ai_report (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON ai_report TO app_role;

ALTER TABLE ai_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_report FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON ai_report
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
