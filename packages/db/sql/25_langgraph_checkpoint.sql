-- 25_langgraph_checkpoint.sql — @langchain/langgraph-checkpoint-postgres 1.0.4 的持久 checkpoint 表。
-- 建表必须在迁移阶段完成；worker 运行时只以 app_role 连接，不再调用 setup() 创建表。
-- 库不带 owner 列，访问授权由 worker 先从受 RLS 保护的 interview/job 恢复 principal 后完成。

CREATE TABLE IF NOT EXISTS checkpoint_migrations (v integer PRIMARY KEY);
CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT '',
  checkpoint_id text NOT NULL,
  parent_checkpoint_id text,
  type text,
  checkpoint jsonb NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);
CREATE TABLE IF NOT EXISTS checkpoint_blobs (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT '',
  channel text NOT NULL,
  version text NOT NULL,
  type text NOT NULL,
  blob bytea,
  PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
);
CREATE TABLE IF NOT EXISTS checkpoint_writes (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT '',
  checkpoint_id text NOT NULL,
  task_id text NOT NULL,
  idx integer NOT NULL,
  channel text NOT NULL,
  type text,
  blob bytea NOT NULL,
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);
ALTER TABLE checkpoint_blobs ALTER COLUMN blob DROP NOT NULL;
INSERT INTO checkpoint_migrations(v) VALUES (0), (1), (2), (3), (4) ON CONFLICT DO NOTHING;
GRANT SELECT, INSERT, UPDATE, DELETE ON checkpoint_migrations, checkpoints, checkpoint_blobs, checkpoint_writes TO app_role;
