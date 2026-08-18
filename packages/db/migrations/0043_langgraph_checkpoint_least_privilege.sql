-- 0043_langgraph_checkpoint_least_privilege.sql
-- Mirrors @langchain/langgraph-checkpoint-postgres 1.0.4 migrations so the
-- worker never needs CREATE SCHEMA/TABLE at runtime. Package upgrades that
-- alter this schema require a new reviewed migration before deployment.

CREATE TABLE IF NOT EXISTS checkpoint_migrations (v integer PRIMARY KEY);
CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id text NOT NULL, checkpoint_ns text NOT NULL DEFAULT '', checkpoint_id text NOT NULL,
  parent_checkpoint_id text, type text, checkpoint jsonb NOT NULL, metadata jsonb NOT NULL DEFAULT '{}',
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);
CREATE TABLE IF NOT EXISTS checkpoint_blobs (
  thread_id text NOT NULL, checkpoint_ns text NOT NULL DEFAULT '', channel text NOT NULL,
  version text NOT NULL, type text NOT NULL, blob bytea,
  PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
);
CREATE TABLE IF NOT EXISTS checkpoint_writes (
  thread_id text NOT NULL, checkpoint_ns text NOT NULL DEFAULT '', checkpoint_id text NOT NULL,
  task_id text NOT NULL, idx integer NOT NULL, channel text NOT NULL, type text, blob bytea NOT NULL,
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);
ALTER TABLE checkpoint_blobs ALTER COLUMN blob DROP NOT NULL;
INSERT INTO checkpoint_migrations(v) VALUES (0), (1), (2), (3), (4) ON CONFLICT DO NOTHING;
GRANT SELECT, INSERT, UPDATE, DELETE ON checkpoint_migrations, checkpoints, checkpoint_blobs, checkpoint_writes TO app_role;
