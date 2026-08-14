-- 07_memory.sql — 长期/情景记忆(成长档案)。接 01+06 之后跑。
-- 三层记忆:工作记忆=LangGraph checkpointer;**长期语义记忆=本表(派生事实,向量化进 vector_chunk 语义召回)**;情景=kind='episode'。
-- 隐私:content 是**派生摘要**(如"分布式锁掌握较弱"),非简历原文/PII;RLS 按 owner 隔离。
DROP TABLE IF EXISTS user_memory CASCADE;

CREATE TABLE user_memory (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('skill','weakness','topic','preference','episode')),
  content text NOT NULL,                       -- 派生摘要(非原文 PII)
  salience real NOT NULL DEFAULT 1.0,          -- 重要度(可随时间衰减/强化)
  source_id text,                              -- 来源面试 id(可追溯)
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_umem_owner ON user_memory (owner_user_id, kind);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_memory TO app_role;

ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON user_memory
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
