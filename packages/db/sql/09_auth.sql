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
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_user_email ON user_account (email);

GRANT SELECT, INSERT, UPDATE ON user_account TO app_role;
