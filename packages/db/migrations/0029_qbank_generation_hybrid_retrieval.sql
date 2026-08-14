-- 0029_qbank_generation_hybrid_retrieval.sql
--
-- P0: qbank 不能在 vector_chunk 中原地重嵌。那里既没有模型/切分 recipe，也无法在重灌期间阻止
-- 新旧向量空间混用。本迁移把 qbank 迁到独立的、不可变 generation：新 generation 在独立分区完成
-- 全量写入和校验后，才以单行 active 指针原子发布；旧 generation 只用于同一语料 epoch 下的回滚。
--
-- 事实源 qbank_chunk 保存已审核题库的可重建正文（仅系统 curator 可直读）；向量、词法和缓存都只返回
-- ref_id。历史 vector_chunk 如没有对应 qbank_chunk，应用层必须拒绝 activation，不能猜原文重嵌。
--
-- 维度边界：本仓库当前 pgvector 基线是 vector(512)。本 generation schema 明确拒绝其它维度，避免
-- "同表混维度"。更换维度需要下一次受控 physical-schema migration，而不是运行期悄悄降维/截断。

-- `qbank_cache_epoch` 还会因 active pointer flip 变化，不能拿它判断 source snapshot 是否陈旧；否则一个
-- 完全未改语料的发布也会让旧 generation 永远无法回滚。此 epoch 只表示真正的可见语料版本。
CREATE TABLE IF NOT EXISTS qbank_corpus_epoch (
  singleton  boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  epoch      bigint NOT NULL DEFAULT 1 CHECK (epoch > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO qbank_corpus_epoch(singleton, epoch) VALUES (true, 1) ON CONFLICT (singleton) DO NOTHING;
GRANT SELECT ON qbank_corpus_epoch TO app_role;
ALTER TABLE qbank_corpus_epoch ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_corpus_epoch FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_corpus_epoch_read ON qbank_corpus_epoch;
CREATE POLICY p_qbank_corpus_epoch_read ON qbank_corpus_epoch FOR SELECT USING (singleton);
DROP POLICY IF EXISTS p_qbank_corpus_epoch_bump ON qbank_corpus_epoch;
CREATE POLICY p_qbank_corpus_epoch_bump ON qbank_corpus_epoch FOR UPDATE TO PUBLIC
  USING (singleton) WITH CHECK (singleton);

CREATE TABLE IF NOT EXISTS qbank_chunk (
  ref_id       text PRIMARY KEY CHECK (ref_id ~ '^[A-Za-z0-9:_-]{1,160}$'),
  source_id    text NOT NULL REFERENCES qbank_source(id),
  content_hash text NOT NULL CHECK (content_hash ~ '^[0-9a-f]{32,128}$'),
  content      text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 24000),
  created_at   timestamptz NOT NULL DEFAULT now()
);
-- hash 由应用层从正文计算；基线不保证 pgcrypto，故 schema 不依赖 digest()。下方 source/pool 对齐守卫
-- 仍确保 hash、source 和 ref 三者不能被替换。

CREATE INDEX IF NOT EXISTS ix_qbank_chunk_source ON qbank_chunk(source_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON qbank_chunk TO app_role;
ALTER TABLE qbank_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_chunk FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_chunk_read ON qbank_chunk;
CREATE POLICY p_qbank_chunk_read ON qbank_chunk FOR SELECT
  USING (qbank_is_curator());
DROP POLICY IF EXISTS p_qbank_chunk_insert ON qbank_chunk;
CREATE POLICY p_qbank_chunk_insert ON qbank_chunk FOR INSERT
  WITH CHECK (qbank_is_curator());
-- 题库事实是 append-only；内容改版必须新 ref_id + 撤销旧 source，不能把已有 generation 静默改指向。
DROP POLICY IF EXISTS p_qbank_chunk_update ON qbank_chunk;
CREATE POLICY p_qbank_chunk_update ON qbank_chunk FOR UPDATE USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS p_qbank_chunk_delete ON qbank_chunk;
CREATE POLICY p_qbank_chunk_delete ON qbank_chunk FOR DELETE USING (false);

CREATE OR REPLACE FUNCTION qbank_chunk_requires_approved_pool() RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM qbank_pool_entry p
    JOIN qbank_source s ON s.id=p.source_id
     WHERE p.ref_id=NEW.ref_id AND p.source_id=NEW.source_id AND p.content_hash=NEW.content_hash
       AND s.status='approved'
  ) THEN
    RAISE EXCEPTION 'qbank_chunk 必须先挂在 approved qbank_pool_entry 下' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_chunk_requires_approved_pool() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_chunk_requires_approved_pool ON qbank_chunk;
CREATE TRIGGER trg_qbank_chunk_requires_approved_pool
  BEFORE INSERT ON qbank_chunk FOR EACH ROW EXECUTE FUNCTION qbank_chunk_requires_approved_pool();

CREATE TABLE IF NOT EXISTS qbank_embedding_recipe (
  id              text PRIMARY KEY CHECK (id ~ '^qrecipe-[0-9a-f]{32}$'),
  recipe_hash     text NOT NULL UNIQUE CHECK (recipe_hash ~ '^[0-9a-f]{64}$'),
  provider        text NOT NULL CHECK (char_length(provider) BETWEEN 1 AND 128),
  model           text NOT NULL CHECK (char_length(model) BETWEEN 1 AND 256),
  provider_revision text NOT NULL CHECK (char_length(provider_revision) BETWEEN 1 AND 256),
  dimensions      integer NOT NULL CHECK (dimensions = 512),
  chunker_version text NOT NULL CHECK (char_length(chunker_version) BETWEEN 1 AND 256),
  normalization_version text NOT NULL CHECK (char_length(normalization_version) BETWEEN 1 AND 256),
  document_prefix_version text NOT NULL CHECK (char_length(document_prefix_version) BETWEEN 1 AND 256),
  query_prefix_version text NOT NULL CHECK (char_length(query_prefix_version) BETWEEN 1 AND 256),
  manifest        jsonb NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON qbank_embedding_recipe TO app_role;
ALTER TABLE qbank_embedding_recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_embedding_recipe FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_recipe_read ON qbank_embedding_recipe;
CREATE POLICY p_qbank_recipe_read ON qbank_embedding_recipe FOR SELECT USING (true);
DROP POLICY IF EXISTS p_qbank_recipe_insert ON qbank_embedding_recipe;
CREATE POLICY p_qbank_recipe_insert ON qbank_embedding_recipe FOR INSERT
  WITH CHECK (current_setting('app.principal_user', true)='__system_qbank__');

CREATE TABLE IF NOT EXISTS qbank_vector_generation (
  id                   text PRIMARY KEY CHECK (id ~ '^qgen-[0-9a-f-]{36}$'),
  recipe_id            text NOT NULL REFERENCES qbank_embedding_recipe(id),
  source_epoch         bigint NOT NULL CHECK (source_epoch > 0),
  expected_chunk_count integer NOT NULL CHECK (expected_chunk_count >= 0),
  state                text NOT NULL CHECK (state IN ('building','validated','active','retired','failed')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  validated_at         timestamptz,
  activated_at         timestamptz,
  failure_reason       text,
  CHECK ((state='failed') = (failure_reason IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_qbank_generation_active ON qbank_vector_generation(state) WHERE state='active';
CREATE INDEX IF NOT EXISTS ix_qbank_generation_recipe_state ON qbank_vector_generation(recipe_id,state);
GRANT SELECT, INSERT, UPDATE ON qbank_vector_generation TO app_role;
ALTER TABLE qbank_vector_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_vector_generation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_generation_read ON qbank_vector_generation;
CREATE POLICY p_qbank_generation_read ON qbank_vector_generation FOR SELECT USING (true);
DROP POLICY IF EXISTS p_qbank_generation_write ON qbank_vector_generation;
CREATE POLICY p_qbank_generation_write ON qbank_vector_generation FOR ALL
  USING (current_setting('app.principal_user', true)='__system_qbank__')
  WITH CHECK (current_setting('app.principal_user', true)='__system_qbank__');

CREATE TABLE IF NOT EXISTS qbank_active_generation (
  singleton      boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  generation_id  text NOT NULL REFERENCES qbank_vector_generation(id),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON qbank_active_generation TO app_role;
ALTER TABLE qbank_active_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_active_generation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_active_generation_read ON qbank_active_generation;
CREATE POLICY p_qbank_active_generation_read ON qbank_active_generation FOR SELECT USING (singleton);

-- 每个 generation 一个 LIST 分区和一个独立 HNSW。分区名仅由 DB 验证后的 UUID 派生，任何请求参数都不能
-- 成为 SQL identifier；这样既能 partition pruning，又没有 SQL 注入路径。
CREATE TABLE IF NOT EXISTS qbank_generation_chunk (
  generation_id text NOT NULL REFERENCES qbank_vector_generation(id),
  ref_id        text NOT NULL REFERENCES qbank_chunk(ref_id),
  content_hash  text NOT NULL,
  embedding     vector(512) NOT NULL,
  visible       boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (generation_id, ref_id)
) PARTITION BY LIST (generation_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON qbank_generation_chunk TO app_role;
ALTER TABLE qbank_generation_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_generation_chunk FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_generation_chunk_read ON qbank_generation_chunk;
CREATE POLICY p_qbank_generation_chunk_read ON qbank_generation_chunk FOR SELECT
  USING (qbank_is_curator());
DROP POLICY IF EXISTS p_qbank_generation_chunk_write ON qbank_generation_chunk;
CREATE POLICY p_qbank_generation_chunk_write ON qbank_generation_chunk FOR ALL
  USING (current_setting('app.principal_user', true)='__system_qbank__')
  WITH CHECK (current_setting('app.principal_user', true)='__system_qbank__');

CREATE OR REPLACE FUNCTION qbank_generation_chunk_only_building() RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE s text; generation text;
BEGIN
  IF TG_OP='UPDATE'
     AND NEW.generation_id=OLD.generation_id AND NEW.ref_id=OLD.ref_id
     AND NEW.content_hash=OLD.content_hash AND NEW.created_at=OLD.created_at
     AND (NEW.embedding <=> OLD.embedding)=0 THEN
    RETURN NEW;
  END IF;
  IF TG_OP='DELETE' THEN generation := OLD.generation_id; ELSE generation := NEW.generation_id; END IF;
  SELECT state INTO s FROM qbank_vector_generation WHERE id=generation;
  IF s IS DISTINCT FROM 'building' THEN
    RAISE EXCEPTION 'qbank_generation_chunk 只能写入 building generation' USING ERRCODE='check_violation';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_generation_chunk_only_building() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_generation_chunk_only_building ON qbank_generation_chunk;
CREATE TRIGGER trg_qbank_generation_chunk_only_building
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_generation_chunk
  FOR EACH ROW EXECUTE FUNCTION qbank_generation_chunk_only_building();

CREATE OR REPLACE FUNCTION qbank_prepare_generation_partition(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE suffix text; tab text; idx text;
BEGIN
  IF current_setting('app.principal_user', true) <> '__system_qbank__' THEN
    RAISE EXCEPTION 'only __system_qbank__ may prepare qbank generation' USING ERRCODE='insufficient_privilege';
  END IF;
  IF p_generation !~ '^qgen-[0-9a-f-]{36}$' OR NOT EXISTS (
    SELECT 1 FROM qbank_vector_generation WHERE id=p_generation AND state='building'
  ) THEN
    RAISE EXCEPTION 'invalid qbank building generation' USING ERRCODE='check_violation';
  END IF;
  suffix := replace(substr(p_generation, 6), '-', '');
  tab := 'qbank_generation_chunk_' || suffix;
  idx := 'qgc_hnsw_visible_' || suffix;
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF qbank_generation_chunk FOR VALUES IN (%L)', tab, p_generation);
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I USING hnsw (embedding vector_cosine_ops) WHERE visible', idx, tab);
END;
$$;
REVOKE ALL ON FUNCTION qbank_prepare_generation_partition(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_prepare_generation_partition(text) TO app_role;

-- 与 ai-runtime 的 tokenize 保持相同的最小中文 bigram / ASCII 词策略。它不是中文语言分词器；上线前仍需用
-- 真实标注集对分词器/pg_trgm/独立检索服务作选择。这里的目的，是让 exact API、缩写和错拼有可运行词法候选通道。
CREATE OR REPLACE FUNCTION qbank_search_terms(p_text text) RETURNS text
  LANGUAGE sql
  IMMUTABLE
  PARALLEL SAFE
AS $$
  WITH ascii_terms AS (
    SELECT lower(x) AS term
      FROM regexp_split_to_table(regexp_replace(coalesce(p_text,''), '[^A-Za-z0-9+#.]+', ' ', 'g'), E'\\s+') AS x
     WHERE x <> ''
  ), chinese AS (
    SELECT regexp_replace(coalesce(p_text,''), '[^一-龥]', '', 'g') AS chars
  ), chinese_bigrams AS (
    SELECT substr(chars, i, CASE WHEN char_length(chars)=1 THEN 1 ELSE 2 END) AS term
      FROM chinese, generate_series(1, greatest(1, char_length(chars)-1)) AS i
     WHERE chars <> ''
  )
  SELECT coalesce(string_agg(term, ' '), '') FROM (
    SELECT term FROM ascii_terms UNION ALL SELECT term FROM chinese_bigrams
  ) terms
$$;
REVOKE ALL ON FUNCTION qbank_search_terms(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_search_terms(text) TO app_role;
CREATE INDEX IF NOT EXISTS ix_qbank_chunk_terms ON qbank_chunk
  USING gin (to_tsvector('simple', qbank_search_terms(content)));

-- 对外只给已批准可见集的 ref + ranking；二次 JOIN qbank_retrieval_candidate 是撤销的最后防线。HNSW 首先由
-- partition + visible partial index 取过采样候选，避免旧实现 JOIN/DISTINCT 把向量排序退化成全表扫描。
CREATE OR REPLACE FUNCTION qbank_generation_ann_search(p_generation text, p_embedding vector, p_k integer)
RETURNS TABLE(ref_id text, distance double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH ann AS (
    SELECT g.ref_id, g.embedding <=> p_embedding AS dist
      FROM qbank_generation_chunk g
     WHERE g.generation_id=p_generation AND g.visible
     ORDER BY g.embedding <=> p_embedding
     LIMIT greatest(p_k * 8, 40)
  )
  SELECT a.ref_id, a.dist::double precision
    FROM ann a JOIN qbank_retrieval_candidate c ON c.ref_id=a.ref_id
   ORDER BY a.dist
   LIMIT greatest(1, least(p_k, 50))
$$;
REVOKE ALL ON FUNCTION qbank_generation_ann_search(text, vector, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_ann_search(text, vector, integer) TO app_role;

CREATE OR REPLACE FUNCTION qbank_generation_lexical_search(p_generation text, p_query text, p_k integer)
RETURNS TABLE(ref_id text, lexical_score double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH q AS (SELECT plainto_tsquery('simple', qbank_search_terms(left(p_query, 12000))) AS tsq)
  SELECT g.ref_id, ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq)::double precision
    FROM qbank_generation_chunk g
    JOIN qbank_chunk ch ON ch.ref_id=g.ref_id
    JOIN qbank_retrieval_candidate c ON c.ref_id=g.ref_id
    CROSS JOIN q
   WHERE g.generation_id=p_generation AND g.visible AND q.tsq <> ''::tsquery
     AND to_tsvector('simple', qbank_search_terms(ch.content)) @@ q.tsq
   ORDER BY ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq) DESC, g.ref_id
   LIMIT greatest(1, least(p_k, 200))
$$;
REVOKE ALL ON FUNCTION qbank_generation_lexical_search(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_lexical_search(text, text, integer) TO app_role;

CREATE OR REPLACE FUNCTION qbank_generation_distances(p_generation text, p_embedding vector, p_refs text[])
RETURNS TABLE(ref_id text, distance double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT g.ref_id, (g.embedding <=> p_embedding)::double precision
    FROM qbank_generation_chunk g
    JOIN qbank_retrieval_candidate c ON c.ref_id=g.ref_id
   WHERE g.generation_id=p_generation AND g.visible AND g.ref_id=ANY(p_refs)
$$;
REVOKE ALL ON FUNCTION qbank_generation_distances(text, vector, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_distances(text, vector, text[]) TO app_role;

-- Evidence leaves the database only after active-generation + visible + approved-source checks. It is bounded and
-- must still enter the model as data, never as a system/tool instruction. The function returns rows in caller rank
-- order and rechecks visibility, so a revoke between cached ranking and prompt construction cannot be resurrected.
CREATE OR REPLACE FUNCTION qbank_generation_evidence(p_generation text, p_refs text[], p_chars integer)
RETURNS TABLE(ref_id text, excerpt text)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT u.ref_id, left(ch.content, greatest(1, least(p_chars, 1200)))
    FROM unnest(p_refs) WITH ORDINALITY AS u(ref_id, ord)
    JOIN qbank_generation_chunk g ON g.generation_id=p_generation AND g.ref_id=u.ref_id AND g.visible
    JOIN qbank_chunk ch ON ch.ref_id=g.ref_id
    JOIN qbank_retrieval_candidate c ON c.ref_id=g.ref_id
   ORDER BY u.ord
$$;
REVOKE ALL ON FUNCTION qbank_generation_evidence(text, text[], integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_evidence(text, text[], integer) TO app_role;

CREATE OR REPLACE FUNCTION qbank_validate_generation(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE exp_count integer; actual_count integer; snapshot_epoch bigint; now_epoch bigint; st text;
BEGIN
  IF current_setting('app.principal_user', true) <> '__system_qbank__' THEN
    RAISE EXCEPTION 'only __system_qbank__ may validate qbank generation' USING ERRCODE='insufficient_privilege';
  END IF;
  SELECT expected_chunk_count, source_epoch, state INTO exp_count, snapshot_epoch, st
    FROM qbank_vector_generation WHERE id=p_generation FOR UPDATE;
  IF st IS DISTINCT FROM 'building' THEN RAISE EXCEPTION 'qbank generation is not building' USING ERRCODE='check_violation'; END IF;
  SELECT count(*)::integer INTO actual_count FROM qbank_generation_chunk WHERE generation_id=p_generation;
  SELECT epoch INTO now_epoch FROM qbank_corpus_epoch WHERE singleton FOR SHARE;
  IF actual_count <> exp_count THEN RAISE EXCEPTION 'qbank generation chunk count % != expected %', actual_count, exp_count USING ERRCODE='check_violation'; END IF;
  IF now_epoch <> snapshot_epoch THEN RAISE EXCEPTION 'qbank corpus changed during generation build (% -> %)', snapshot_epoch, now_epoch USING ERRCODE='serialization_failure'; END IF;
  UPDATE qbank_vector_generation SET state='validated', validated_at=clock_timestamp() WHERE id=p_generation;
END;
$$;
REVOKE ALL ON FUNCTION qbank_validate_generation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_validate_generation(text) TO app_role;

CREATE OR REPLACE FUNCTION qbank_activate_generation(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE snapshot_epoch bigint; now_epoch bigint; st text;
BEGIN
  IF current_setting('app.principal_user', true) <> '__system_qbank__' THEN
    RAISE EXCEPTION 'only __system_qbank__ may activate qbank generation' USING ERRCODE='insufficient_privilege';
  END IF;
  SELECT epoch INTO now_epoch FROM qbank_corpus_epoch WHERE singleton FOR UPDATE;
  SELECT source_epoch, state INTO snapshot_epoch, st FROM qbank_vector_generation WHERE id=p_generation FOR UPDATE;
  IF st NOT IN ('validated','retired') THEN RAISE EXCEPTION 'qbank generation must be validated or retired before activation' USING ERRCODE='check_violation'; END IF;
  IF snapshot_epoch <> now_epoch THEN RAISE EXCEPTION 'qbank corpus changed since generation build; rebuild required' USING ERRCODE='serialization_failure'; END IF;
  UPDATE qbank_vector_generation SET state='retired' WHERE state='active' AND id<>p_generation;
  UPDATE qbank_vector_generation SET state='active', activated_at=clock_timestamp(), failure_reason=NULL WHERE id=p_generation;
  INSERT INTO qbank_active_generation(singleton,generation_id,updated_at) VALUES (true,p_generation,clock_timestamp())
    ON CONFLICT(singleton) DO UPDATE SET generation_id=EXCLUDED.generation_id, updated_at=EXCLUDED.updated_at;
  -- 一次 active flip = 一次 global invalidation；backfill 中逐 chunk 写入不会碰 epoch。
  UPDATE qbank_cache_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
END;
$$;
REVOKE ALL ON FUNCTION qbank_activate_generation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_activate_generation(text) TO app_role;

CREATE OR REPLACE FUNCTION qbank_mark_generation_failed(p_generation text, p_reason text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_setting('app.principal_user', true) <> '__system_qbank__' THEN
    RAISE EXCEPTION 'only __system_qbank__ may fail qbank generation' USING ERRCODE='insufficient_privilege';
  END IF;
  UPDATE qbank_vector_generation SET state='failed', failure_reason=left(coalesce(p_reason,'build_failed'), 512)
   WHERE id=p_generation AND state IN ('building','validated');
END;
$$;
REVOKE ALL ON FUNCTION qbank_mark_generation_failed(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_mark_generation_failed(text, text) TO app_role;

-- 可见性变化才 bump cache epoch。旧 0022 对每个 pending proposal 都失效，攻击者可低成本制造全局 embedding/caching
-- 成本放大；generation backfill 也绝不能按行 bump。approved source 已有 pool 时的撤销、pool 变更和 active flip 才影响读集。
CREATE OR REPLACE FUNCTION qbank_source_visible_epoch_sync() RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE was_visible boolean := false; now_visible boolean := false;
BEGIN
  IF TG_OP='UPDATE' THEN
    SELECT EXISTS(SELECT 1 FROM qbank_pool_entry WHERE source_id=OLD.id) AND OLD.status='approved' INTO was_visible;
    SELECT EXISTS(SELECT 1 FROM qbank_pool_entry WHERE source_id=NEW.id) AND NEW.status='approved' INTO now_visible;
    IF was_visible OR now_visible THEN
      UPDATE qbank_generation_chunk g SET visible=now_visible
       FROM qbank_pool_entry p WHERE p.source_id=NEW.id AND p.ref_id=g.ref_id;
      UPDATE qbank_corpus_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
      UPDATE qbank_cache_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
    END IF;
  ELSIF TG_OP='DELETE' THEN
    SELECT EXISTS(SELECT 1 FROM qbank_pool_entry WHERE source_id=OLD.id) AND OLD.status='approved' INTO was_visible;
    IF was_visible THEN
      UPDATE qbank_corpus_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
      UPDATE qbank_cache_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
    END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_source_visible_epoch_sync() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_cache_epoch_source ON qbank_source;
CREATE TRIGGER trg_qbank_cache_epoch_source AFTER INSERT OR UPDATE OR DELETE ON qbank_source
  FOR EACH ROW EXECUTE FUNCTION qbank_source_visible_epoch_sync();

CREATE OR REPLACE FUNCTION qbank_pool_visible_epoch_sync() RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE visible_source boolean := false; source text;
BEGIN
  IF TG_OP='DELETE' THEN source := OLD.source_id; ELSE source := NEW.source_id; END IF;
  SELECT status='approved' INTO visible_source FROM qbank_source WHERE id=source;
  IF visible_source THEN
    UPDATE qbank_corpus_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
    UPDATE qbank_cache_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_pool_visible_epoch_sync() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_cache_epoch_pool ON qbank_pool_entry;
CREATE TRIGGER trg_qbank_cache_epoch_pool AFTER INSERT OR UPDATE OR DELETE ON qbank_pool_entry
  FOR EACH ROW EXECUTE FUNCTION qbank_pool_visible_epoch_sync();
