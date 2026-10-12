-- 0169_auth_user_session.sql
-- AUTHZ-HARDEN 5A-1 · 簇③（#35/#112）：kid/jti 会话表——jti 单独吊销与登出服务端化的持久真相源。
-- REQUEST：ai-docs/delivery/harness/authz-harden-REQUEST.md rev2（pre-exec 双审 BOTH PASS + 协调方派单开工）。
-- DDL 白名单（§3-5）：本表=两件例外之簇③会话件；**零新 RLS 策略/零 BYPASSRLS/零角色授权变更**——
-- 表对象级 GRANT（SELECT/INSERT/UPDATE → app_role）沿 0001:150「GRANT ALL 不覆盖此后新建表，显式补」先例
-- 随建表 DDL 一体交付（非角色面变更；无 DELETE——吊销走 UPDATE revoked_at，行保留供审计）。
-- R5 命名区分（privacy 谱系零混用）：表名 auth_user_session ≠ 0091 privacy_authorization_snapshot
-- （其 jti UNIQUE 属隐私授权快照谱系）/ 0112 memory；retention_class 取值域恒 **'auth_session'**，
-- 与 0112 memory retention_class ('session','account','derived') 值域显式分离——隐私擦除链（0112:876-897
-- p_jti 系）按表名/值域两维均可与本表区分，互不误伤。
-- expand-only：IF NOT EXISTS；幂等重放零 diff。存量已发令牌无 jti 不建行 → guard 走 legacy 无态路径（R1·禁一刀切全拒）。

CREATE TABLE IF NOT EXISTS auth_user_session (
  jti text PRIMARY KEY,
  user_id text NOT NULL,
  pwd_epoch int NOT NULL DEFAULT 0,
  revoked_at timestamptz,
  retention_class text NOT NULL DEFAULT 'auth_session' CHECK (retention_class IN ('auth_session')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_auth_user_session_user ON auth_user_session (user_id);

GRANT SELECT, INSERT, UPDATE ON auth_user_session TO app_role;
