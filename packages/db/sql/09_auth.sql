-- 09_auth.sql — 用户账户(真鉴权)。接 01 后跑。password_hash 只存 scrypt 派生,绝不明文。
-- 仅 auth 服务访问;app_role 经服务读写(查 by email/id)。email 唯一。
DROP TABLE IF EXISTS user_account CASCADE;

CREATE TABLE user_account (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,                 -- scrypt$salt$dk,绝不明文
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  role text NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate','recruiter')),  -- 身份:C端求职者 / B端招聘方
  approval_status text NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending','approved','rejected')),  -- b110 审核制:recruiter 注册落 pending,admin approve 后过 B 端门;存量默认 approved(向后兼容,非合规声明)
  is_admin boolean NOT NULL DEFAULT false,     -- 运营 admin(特权:跨用户只读,经 AdminGuard 校验)
  preferences jsonb NOT NULL DEFAULT '{}',     -- 用户设置(语言/通知偏好等)
  pwd_epoch int NOT NULL DEFAULT 0,            -- 密码代次:改密自增 → 旧/被盗令牌(内嵌旧代次)立即失效(会话吊销,见迁移 0015)
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_user_email ON user_account (email);

GRANT SELECT, INSERT, UPDATE ON user_account TO app_role;

-- 账户资料同样属于租户数据；强制 RLS 后，app_role 即使已被错误授予表权限也只能看到
-- current principal 自己。注册、登录与跨用户运营操作必须走 23_api_gateway.sql 的固定函数。
ALTER TABLE user_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_account FORCE ROW LEVEL SECURITY;
CREATE POLICY p_user_account_self ON user_account
  FOR ALL TO app_role
  USING (id = current_setting('app.principal_user', true))
  WITH CHECK (id = current_setting('app.principal_user', true));

-- kid/jti 会话表（迁移 0169 AUTHZ-HARDEN 5A-1 簇③ + 0225 PRIV01 rev r3 owner RLS·sql/ 兼容镜像同步）。
-- jti 单独吊销与登出服务端化的持久真相源；user_id 归属用户。签发/吊销/校验三路径都在
-- db.asPrincipal(uid) 事务内（apps/api/src/platform/auth-session.ts）。retention_class 取值域恒
-- 'auth_session'，与 0112 memory retention_class 值域显式分离（R5 命名区分）。无 DELETE——吊销走
-- UPDATE revoked_at，行保留供审计。
DROP TABLE IF EXISTS auth_user_session CASCADE;

CREATE TABLE auth_user_session (
  jti text PRIMARY KEY,
  user_id text NOT NULL,
  pwd_epoch int NOT NULL DEFAULT 0,
  revoked_at timestamptz,
  retention_class text NOT NULL DEFAULT 'auth_session' CHECK (retention_class IN ('auth_session')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_auth_user_session_user ON auth_user_session (user_id);

GRANT SELECT, INSERT, UPDATE ON auth_user_session TO app_role;

ALTER TABLE auth_user_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_user_session FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON auth_user_session
  FOR ALL TO app_role
  USING (user_id = current_setting('app.principal_user', true))
  WITH CHECK (user_id = current_setting('app.principal_user', true));
