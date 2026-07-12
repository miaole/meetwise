-- 06_retrieval.sql — 生产向量库(pgvector HNSW)。隐私:**只存向量+引用 id+hash,不存原文 PII**。接 01_schema 之后跑。dim=512(实测选定)。
-- 租户模型(决策 i):**qbank=策展共享知识 → 公共读**(系统 owner 灌一次,全用户可检索;非 PII,非多租户,无 membership 表);
--                    **memory=每用户成长档案 → owner 私有**(RLS 限己,不串户)。写都限己(qbank 由系统 owner 写)。
CREATE EXTENSION IF NOT EXISTS vector;
DROP TABLE IF EXISTS vector_chunk CASCADE;

CREATE TABLE vector_chunk (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,                 -- 用户隔离(RLS)
  kind text NOT NULL CHECK (kind IN ('qbank','memory')),
  ref_id text NOT NULL,                         -- 指回业务实体(题目id / 记忆id)——原文在业务表,这里不放
  content_hash text NOT NULL,                   -- 去重
  embedding vector(512) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, kind, content_hash)
);
CREATE INDEX ix_vchunk_hnsw ON vector_chunk USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ix_vchunk_owner ON vector_chunk (owner_user_id, kind);

GRANT SELECT, INSERT, UPDATE, DELETE ON vector_chunk TO app_role;

ALTER TABLE vector_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_chunk FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON vector_chunk
  USING (kind = 'qbank' OR owner_user_id = current_setting('app.principal_user', true))   -- qbank 公共读;memory 限己
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));               -- 写仍限己(qbank 由系统 owner 灌)
