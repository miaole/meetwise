-- 0022_qbank_retrieval_cache.sql
-- P0 RAG 读缓存：缓存的是 qbank ANN 的「引用 id + 距离」，绝不保存原始 query、简历或候选人答案。
--
-- 正确性：缓存行绑定 owner + SHA-256 cache_key + embedder version + k + corpus_epoch；读时必须与当前 epoch 相等
-- 才能命中。qbank 源审核、受审池或 qbank 向量一旦变化，触发器原子 bump epoch，所有旧行立即逻辑失效。
--
-- 击穿：qbank_retrieval_inflight 是 principal-scoped、带租约 token 的持久 claim；应用端用 advisory xact lock
-- 串行 claim 交接，但远程 embedding 不放在 DB 事务内。进程崩溃后 lease 到期可接管，不能永久卡住。
--
-- 迁移是增量/非破坏的：旧缓存不存在，历史 qbank 不需回填；epoch 初值 1 表示当前语料快照。

CREATE TABLE IF NOT EXISTS qbank_cache_epoch (
  singleton  boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  epoch      bigint NOT NULL DEFAULT 1 CHECK (epoch > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO qbank_cache_epoch(singleton, epoch) VALUES (true, 1)
  ON CONFLICT (singleton) DO NOTHING;

CREATE TABLE IF NOT EXISTS qbank_retrieval_cache (
  owner_user_id   text NOT NULL,
  cache_key       text NOT NULL CHECK (cache_key ~ '^[0-9a-f]{64}$'),
  embedder_version text NOT NULL CHECK (char_length(embedder_version) BETWEEN 1 AND 256),
  k               smallint NOT NULL CHECK (k BETWEEN 1 AND 50),
  corpus_epoch    bigint NOT NULL CHECK (corpus_epoch > 0),
  ref_ids         text[] NOT NULL DEFAULT '{}',
  distances       double precision[] NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL,
  PRIMARY KEY (owner_user_id, cache_key),
  CHECK (cardinality(ref_ids) = cardinality(distances)),
  CHECK (expires_at > created_at AND expires_at <= created_at + interval '1 hour')
);
CREATE INDEX IF NOT EXISTS ix_qbank_retrieval_cache_expiry ON qbank_retrieval_cache (expires_at);

-- 远程 embed 在 DB 事务外执行；所以用可接管的持久 claim，而非 session advisory lock 跨网络调用占一条连接。
CREATE TABLE IF NOT EXISTS qbank_retrieval_inflight (
  owner_user_id    text NOT NULL,
  cache_key        text NOT NULL CHECK (cache_key ~ '^[0-9a-f]{64}$'),
  lease_token      uuid NOT NULL,
  lease_expires_at timestamptz NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, cache_key),
  CHECK (lease_expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS ix_qbank_retrieval_inflight_expiry ON qbank_retrieval_inflight (lease_expires_at);

-- app_role 对 cache / inflight 只能操作自己的 key；无 GUC 时 current_setting(..., true) 为 NULL，RLS fail-closed。
GRANT SELECT ON qbank_cache_epoch TO app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON qbank_retrieval_cache, qbank_retrieval_inflight TO app_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON qbank_cache_epoch FROM app_role;

ALTER TABLE qbank_cache_epoch ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_cache_epoch FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_cache_epoch_read ON qbank_cache_epoch;
CREATE POLICY p_qbank_cache_epoch_read ON qbank_cache_epoch FOR SELECT TO app_role USING (singleton);
-- 函数属主在 FORCE RLS 下也要有行策略才可 bump；app_role 没有 UPDATE grant 且不能 EXECUTE 函数，不能借此改 epoch。
DROP POLICY IF EXISTS p_qbank_cache_epoch_bump ON qbank_cache_epoch;
CREATE POLICY p_qbank_cache_epoch_bump ON qbank_cache_epoch FOR UPDATE TO PUBLIC
  USING (singleton) WITH CHECK (singleton);

ALTER TABLE qbank_retrieval_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_retrieval_cache FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_retrieval_cache_owner ON qbank_retrieval_cache;
CREATE POLICY p_qbank_retrieval_cache_owner ON qbank_retrieval_cache
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

ALTER TABLE qbank_retrieval_inflight ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_retrieval_inflight FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_retrieval_inflight_owner ON qbank_retrieval_inflight;
CREATE POLICY p_qbank_retrieval_inflight_owner ON qbank_retrieval_inflight
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- 所有能改变 qbank 可见结果的表变更都 bump 同一 epoch。函数不向 app_role 暴露执行权，避免用户伪造失效风暴；
-- 触发器正常以表属主权限执行。vector_chunk 仅 kind='qbank' 才 bump，用户私有 memory 更新不扰动题库缓存。
CREATE OR REPLACE FUNCTION qbank_bump_retrieval_cache_epoch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_TABLE_NAME = 'vector_chunk' THEN
    IF TG_OP = 'INSERT' AND NEW.kind <> 'qbank' THEN RETURN NEW; END IF;
    IF TG_OP = 'DELETE' AND OLD.kind <> 'qbank' THEN RETURN OLD; END IF;
    IF TG_OP = 'UPDATE' AND OLD.kind <> 'qbank' AND NEW.kind <> 'qbank' THEN RETURN NEW; END IF;
  END IF;

  UPDATE qbank_cache_epoch
     SET epoch = epoch + 1, updated_at = clock_timestamp()
   WHERE singleton = true;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_bump_retrieval_cache_epoch() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS trg_qbank_cache_epoch_vector ON vector_chunk;
CREATE TRIGGER trg_qbank_cache_epoch_vector
  AFTER INSERT OR UPDATE OR DELETE ON vector_chunk
  FOR EACH ROW EXECUTE FUNCTION qbank_bump_retrieval_cache_epoch();

DROP TRIGGER IF EXISTS trg_qbank_cache_epoch_source ON qbank_source;
CREATE TRIGGER trg_qbank_cache_epoch_source
  AFTER INSERT OR UPDATE OR DELETE ON qbank_source
  FOR EACH ROW EXECUTE FUNCTION qbank_bump_retrieval_cache_epoch();

DROP TRIGGER IF EXISTS trg_qbank_cache_epoch_pool ON qbank_pool_entry;
CREATE TRIGGER trg_qbank_cache_epoch_pool
  AFTER INSERT OR UPDATE OR DELETE ON qbank_pool_entry
  FOR EACH ROW EXECUTE FUNCTION qbank_bump_retrieval_cache_epoch();
