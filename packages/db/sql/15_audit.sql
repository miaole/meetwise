-- 15_audit.sql — admin 操作审计(append-only 不可改,问责)。接 01 后跑。
-- 只授 INSERT+SELECT(无 UPDATE/DELETE)→ 审计记录写下即不可篡改。无 RLS(admin 端点经 AdminGuard 守,超级用户写读)。
DROP TABLE IF EXISTS admin_audit CASCADE;
CREATE TABLE admin_audit (
  id text PRIMARY KEY,
  actor text NOT NULL,                 -- 谁(admin 用户 id)
  action text NOT NULL,                -- 做了什么(disable_user / grant_entitlement)
  target text,                         -- 对谁/什么
  detail jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_audit_time ON admin_audit (created_at DESC);
GRANT SELECT, INSERT ON admin_audit TO app_role;   -- 故意不授 UPDATE/DELETE:审计不可篡改
