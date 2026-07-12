-- 03_resume.sql — S2 简历摄取：原文加密落库(与结构化分表) + 状态机 + 幂等去重 + RLS。接 01_schema 之后跑。
-- 隐私铁律落库：原文只进**加密 blob**(pgp_sym_encrypt),结构化 profile **永不含原文/PII 明文**,只存脱敏文本 + PII 计数摘要。
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS resume, resume_blob, resume_profile CASCADE;

CREATE TABLE resume (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','ingesting','ingested','failed')),
  content_sha text NOT NULL,                                   -- 原文 sha256,同人同原文去重
  source_kind text NOT NULL DEFAULT 'text',                    -- text|pdf|...（多模态抽取适配器层,本期 text）
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_resume_content UNIQUE (owner_user_id, content_sha),
  CONSTRAINT uq_resume_id_owner UNIQUE (id, owner_user_id)            -- 复合 FK 用：让子表 FK 强制同 owner
);

-- 加密原文：与 profile 物理分表。日志/profile/普通查询都拿不到明文；解密需 key（生产走 KMS）。
-- 复合 FK (resume_id, owner_user_id) → resume：DB 层强制子行 owner == 父行 owner（RI 绕 RLS,故须复合,审计 P1-5）。
CREATE TABLE resume_blob (
  resume_id uuid PRIMARY KEY,
  owner_user_id text NOT NULL,
  ciphertext bytea NOT NULL,
  key_version int NOT NULL DEFAULT 1,                                 -- 加密 key 版本（轮转用,审计 P1-7）
  FOREIGN KEY (resume_id, owner_user_id) REFERENCES resume(id, owner_user_id) ON DELETE CASCADE
);

-- 结构化 profile：脱敏后的 experience/skills/facts + PII 仅计数摘要（无任何明文/掩码值）。
CREATE TABLE resume_profile (
  resume_id uuid PRIMARY KEY,
  owner_user_id text NOT NULL,
  FOREIGN KEY (resume_id, owner_user_id) REFERENCES resume(id, owner_user_id) ON DELETE CASCADE,
  structured jsonb NOT NULL,                                   -- {experience, skills, facts}（已脱敏）
  pii_summary jsonb NOT NULL,                                  -- {phone:n,email:n,idcard:n} 仅计数
  blocked_count int NOT NULL DEFAULT 0,                        -- 被拦的注入行数
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON resume, resume_blob, resume_profile TO app_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['resume','resume_blob','resume_profile'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;
