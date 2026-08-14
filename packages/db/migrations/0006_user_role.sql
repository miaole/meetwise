-- 0006_user_role.sql — 区分 C 端(求职者)与 B 端(招聘方)账户。注册选身份,登录后按角色进不同首页。
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'candidate'
  CHECK (role IN ('candidate','recruiter'));
