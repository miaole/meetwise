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
CREATE INDEX ix_vchunk_ref ON vector_chunk (ref_id);   -- 支撑 annSearch(qbank) 与策展 approved 候选(qbank_retrieval_candidate.ref_id)求交

GRANT SELECT, INSERT, UPDATE, DELETE ON vector_chunk TO app_role;

ALTER TABLE vector_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_chunk FORCE ROW LEVEL SECURITY;
-- 跨租户投毒收口(决策 i):**按命令拆策略**,因为 qbank 需"公共读 + 仅系统写",单条 FOR ALL 的 USING 会把
--   'kind=qbank' 的公共读语义泄漏到 DELETE/UPDATE 的行选择上(DELETE/UPDATE 只看 USING),导致任何用户能删/劫持
--   全局共享题库。故读写分治:读=公共读 qbank;增/改/删=仅本人非 qbank 行,或系统灌库 principal 的 qbank 行。
--   系统灌库 principal('__system_qbank__',见 apps/worker qbank-ingest)由服务端可信绑定,绝不取自不可信输入。
--   读侧再由 annSearch 与"可信可见集"求交做第二道门(qbank_visible_ref + owner 过滤,见迁移 0016 / retrieval-store)。
CREATE POLICY p_vchunk_read ON vector_chunk FOR SELECT
  USING ((kind = 'qbank' AND owner_user_id = '__system_qbank__')                               -- 公共读只放行**系统 owner** 的 qbank
         OR owner_user_id = current_setting('app.principal_user', true));                      -- 其余(含残留投毒 qbank)仅本人可见 → 投毒在表层对所有读者隐身
CREATE POLICY p_vchunk_insert ON vector_chunk FOR INSERT
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true)
              AND (kind <> 'qbank' OR owner_user_id = '__system_qbank__'));                    -- 写限己;qbank 仅系统灌库 principal
CREATE POLICY p_vchunk_update ON vector_chunk FOR UPDATE
  USING (owner_user_id = current_setting('app.principal_user', true)                           -- 只能改自己的行(不能 target 别人/系统 qbank)
         AND (kind <> 'qbank' OR owner_user_id = '__system_qbank__'))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true)                      -- 改后仍限己;不能翻成 qbank 冒充
              AND (kind <> 'qbank' OR owner_user_id = '__system_qbank__'));
CREATE POLICY p_vchunk_delete ON vector_chunk FOR DELETE
  USING (owner_user_id = current_setting('app.principal_user', true)                           -- 只能删自己的行;qbank 仅系统灌库 principal(杜绝任意用户清空共享题库)
         AND (kind <> 'qbank' OR owner_user_id = '__system_qbank__'));
