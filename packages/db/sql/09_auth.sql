-- 09_auth.sql — 用户账户(真鉴权)。接 01 后跑。password_hash 只存 scrypt 派生,绝不明文。
-- 仅 auth 服务访问;app_role 经服务读写(查 by email/id)。email 唯一。
DROP TABLE IF EXISTS user_account CASCADE;

CREATE TABLE user_account (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,                 -- scrypt$salt$dk,绝不明文
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  role text NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate','recruiter')),  -- 身份:C端求职者 / B端招聘方
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
