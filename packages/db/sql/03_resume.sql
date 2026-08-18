-- 03_resume.sql — S2 简历摄取：原文加密落库(与结构化分表) + 状态机 + 幂等去重 + RLS。接 01_schema 之后跑。
-- 隐私铁律落库：原文只进**加密 blob**(pgp_sym_encrypt),结构化 profile **永不含原文/PII 明文**,只存脱敏文本 + PII 计数摘要。
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- `resume_ocr_artifact` 在摄取成功前保存短暂的加密恢复材料。基础建库必须与
-- 迁移后的最小运行模式一致；否则隐私删除会在不存在的表上失败。
DROP TABLE IF EXISTS resume_ocr_artifact CASCADE;
DROP TABLE IF EXISTS resume, resume_blob, resume_profile CASCADE;

CREATE TABLE resume (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','ingesting','ingested','failed','erasure_fenced','erased')),
  content_sha text,                                            -- erased 墓碑清空；活跃行才参与去重
  source_kind text NOT NULL DEFAULT 'text',                    -- text|pdf|...（多模态抽取适配器层,本期 text）
  privacy_epoch bigint NOT NULL DEFAULT 1 CHECK (privacy_epoch >= 1),
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_resume_id_owner UNIQUE (id, owner_user_id)            -- 复合 FK 用：让子表 FK 强制同 owner
);
CREATE UNIQUE INDEX uq_resume_content_active
  ON resume(owner_user_id, content_sha)
  WHERE content_sha IS NOT NULL
    AND status IN ('uploaded','ingesting','ingested','failed');

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
  status text NOT NULL DEFAULT 'ok' CHECK (status IN ('ok','needs_review','rejected')),   -- 审阅态:OCR/图片源(尤其伪造证件)恒 needs_review,系统不冒充判真伪(见迁移 0012)
  confidence numeric,                                          -- 画像置信度(视觉抗注入 eval 后续按字段回写;现可空)
  created_at timestamptz NOT NULL DEFAULT now()
);

-- OCR 成功但尚未完成摄取时的短暂恢复材料。只保存加密文本，成功摄取或用户
-- 行使删除权后即删除；主键同时构成同一用户、同一图片请求的幂等锚。
CREATE TABLE resume_ocr_artifact (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 256),
  ciphertext bytea NOT NULL,
  key_version int NOT NULL CHECK (key_version > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, idempotency_key)
);

GRANT SELECT, INSERT, UPDATE ON resume, resume_blob, resume_profile, resume_ocr_artifact TO app_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['resume','resume_blob','resume_profile','resume_ocr_artifact'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;

-- Mirror migration 0063 in the SQL bootstrap path: an owned but fenced
-- resume must not expose its encrypted blob or profile through a stale query.
DROP POLICY IF EXISTS p_owner ON resume_blob;
DROP POLICY IF EXISTS p_owner ON resume_profile;
CREATE POLICY p_resume_blob_active_read ON resume_blob FOR SELECT TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true)
    AND EXISTS (SELECT 1 FROM resume r WHERE r.id=resume_blob.resume_id AND r.owner_user_id=resume_blob.owner_user_id AND r.status='ingested'));
CREATE POLICY p_resume_blob_owner_insert ON resume_blob FOR INSERT TO app_role
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
CREATE POLICY p_resume_blob_active_update ON resume_blob FOR UPDATE TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true)
    AND EXISTS (SELECT 1 FROM resume r WHERE r.id=resume_blob.resume_id AND r.owner_user_id=resume_blob.owner_user_id AND r.status='ingested'))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
CREATE POLICY p_resume_profile_active_read ON resume_profile FOR SELECT TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true)
    AND EXISTS (SELECT 1 FROM resume r WHERE r.id=resume_profile.resume_id AND r.owner_user_id=resume_profile.owner_user_id AND r.status='ingested'));
CREATE POLICY p_resume_profile_owner_insert ON resume_profile FOR INSERT TO app_role
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
CREATE POLICY p_resume_profile_active_update ON resume_profile FOR UPDATE TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true)
    AND EXISTS (SELECT 1 FROM resume r WHERE r.id=resume_profile.resume_id AND r.owner_user_id=resume_profile.owner_user_id AND r.status='ingested'))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
