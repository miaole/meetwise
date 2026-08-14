-- 13_privacy.sql — PIPL 合规:同意记录 + 删除权(授 DELETE 给 PII 表)。接 01+03+09 后跑。
-- C 端处理简历 PII,上线硬门槛:可证同意、可导出、可删除。
DROP TABLE IF EXISTS consent_record CASCADE;

CREATE TABLE consent_record (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  purpose text NOT NULL,                         -- 采集目的(resume_processing / interview / ...)
  policy_version text NOT NULL,                  -- 同意时的隐私政策版本(可审计)
  granted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_consent_owner ON consent_record (owner_user_id, purpose);
GRANT SELECT, INSERT ON consent_record TO app_role;
ALTER TABLE consent_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_record FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON consent_record
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- 删除权:授 DELETE 给 PII 表(用户删除自己数据;RLS 限只删己)
GRANT DELETE ON resume_blob, resume_profile, resume TO app_role;
