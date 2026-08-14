-- 14_notification.sql — 站内通知(报告就绪/评估完成等)。接 01 后跑。RLS owner 隔离。
DROP TABLE IF EXISTS notification CASCADE;
CREATE TABLE notification (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  kind text NOT NULL,                  -- report_ready / assessment_ready / ...
  payload jsonb NOT NULL DEFAULT '{}',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_notif_owner ON notification (owner_user_id, read, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON notification TO app_role;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON notification
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
