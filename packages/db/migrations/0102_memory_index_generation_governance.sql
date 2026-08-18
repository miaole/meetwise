-- ═══════════════════════════════════════════════════════════════════════════════
-- 0102 MEM-11：索引 generation 生命周期 + 缓存失效治理
-- ═══════════════════════════════════════════════════════════════════════════════
-- 承接 MEM-13（memory_fact_adjudication 的 active 事实），在 0093 既有 memory_index_generation
-- 之上**扩展**（不重造表），补齐：冻结 source manifest、shadow generation 独立构建、验证后 CAS
-- 切换、撤回/删除同步失效（fence generation + 失效检索/水合缓存 + 防旧内容复活）、显式状态机、
-- 并发不变量（删除先赢）。四承重原语：①CAS ②principal 幂等键 ③RLS owner 隔离 ④审计
-- memory_append_audit（复用 0093，不重实现删除根/issuer）。
--
-- 为何不在 0093 就地改、而是 0102 增量：
--   - 0093 的 status 枚举是 building/validated/shadow/active/deprecated/retired（MEM-00 六态），
--     MEM-11 需要 retiring/fenced 两态；但 MEM-00 的 52 断言里「旧 generation 被降为 deprecated」
--     承重，直接替换枚举会破坏。故此处 find+drop+re-add 扩成**超集**，保留 shadow/deprecated。
--   - 冻结 manifest / 独立向量 / 缓存条目是 MEM-11 新承重，必须新增 owner 作用域表（RLS FORCE）。
-- 为何 embedding 不落 0093 的 memory_index_generation 而单开 memory_index_generation_embedding：
--   - generation 是「哪一代在服务」的指针（单 active 偏唯一索引），向量是每 fact 的独立产物；
--     混合会破坏单 active 指针语义，且让「embedding 完整性」验证没有可计数的独立事实表。
--   - 向量行 owner 作用域 + RLS，与 generation 同 principal 绑定，跨 owner 绝不互见。
-- 为何冻结 manifest 单独成表（不把 fact 引用塞 generation）：
--   - manifest 是不可变快照（frozen），generation 是可演化状态机；一个 manifest 可被多个 shadow
--     generation 独立构建（重试），manifest 的 digest/计数是验证的权威参照，须独立可校验。
-- 为何缓存条目要绑 epoch/status 而不是只存值：
--   - 撤回/删除后「旧 cache 不得恢复已撤回内容」的承重：命中前必须重验绑定的 generation 仍 active
--     且 epoch/revision 匹配，否则陈旧 cache 会复活已撤回事实。这是 0093 评论「旧 generation 不可
--     复活已撤回」在缓存层的落地。

-- 角色兜底：memory_runtime 由 0093 创建（NOLOGIN NOINHERIT NOBYPASSRLS）；此处幂等兜底。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'memory_runtime') THEN
    CREATE ROLE memory_runtime NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  GRANT USAGE ON SCHEMA public TO memory_runtime;
END $$;

-- ── 扩展 0093 的 memory_index_generation status 枚举（超集，不破坏 MEM-00 六态）──────────
-- 找到 0093 内联写的 CHECK（自动命名 memory_index_generation_status_check），删后重加完整枚举。
DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname FROM pg_constraint
   WHERE conrelid = 'memory_index_generation'::regclass
     AND contype = 'c'
     AND pg_get_constraintdef(oid) LIKE '%building%'
     AND pg_get_constraintdef(oid) LIKE '%active%'
   LIMIT 1;
  IF cname IS NULL THEN
    RAISE EXCEPTION 'memory_index_generation_status_check_missing';
  END IF;
  EXECUTE format('ALTER TABLE memory_index_generation DROP CONSTRAINT %I', cname);
END $$;

GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER TABLE memory_index_generation ADD CONSTRAINT memory_index_generation_status_check
  CHECK (status IN ('building','validated','shadow','active','deprecated','retired','retiring','fenced'));

-- 新增列：manifest/recipe 钉住 + epoch/revision 缓存绑定锚 + 退役窗口/失效时间戳。
-- 防并发双构建只靠 UNIQUE(owner,generation_key) + ON CONFLICT DO NOTHING（幂等重放读真实 status），
-- 不设 generation lease：lease_owner/lease_expires_at 无任何读写 = 死列，删除以消除过度声明（MEDIUM-1）。
-- ADD COLUMN IF NOT EXISTS：幂等，绝不 DROP 丢数据。
ALTER TABLE memory_index_generation
  ADD COLUMN IF NOT EXISTS manifest_id uuid,
  ADD COLUMN IF NOT EXISTS manifest_digest text CHECK (manifest_digest IS NULL OR manifest_digest ~ '^[a-f0-9]{64}$'),
  ADD COLUMN IF NOT EXISTS embedding_recipe_digest text CHECK (embedding_recipe_digest IS NULL OR embedding_recipe_digest ~ '^[a-f0-9]{64}$'),
  ADD COLUMN IF NOT EXISTS generation_privacy_epoch bigint CHECK (generation_privacy_epoch IS NULL OR generation_privacy_epoch >= 1),
  ADD COLUMN IF NOT EXISTS generation_consent_revision bigint CHECK (generation_consent_revision IS NULL OR generation_consent_revision >= 1),
  ADD COLUMN IF NOT EXISTS retiring_at timestamptz,
  ADD COLUMN IF NOT EXISTS fenced_at timestamptz;

-- ── 冻结 source manifest（不可变快照，frozen→fenced）──────────────────────────────────
-- 只含「仍授权」事实：active + 未过期 + 目的 consent granted + 数据分类允许 embedding。manifest
-- 不存 content 明文（只存 digest + span_locator 溯源，不落 PII/原始简历）。digest 是权威参照。
DROP TABLE IF EXISTS memory_index_source_manifest CASCADE;
CREATE TABLE memory_index_source_manifest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  manifest_key text NOT NULL,                          -- 幂等键（owner 作用域）
  manifest_digest text NOT NULL CHECK (manifest_digest ~ '^[a-f0-9]{64}$'),
  fact_count bigint NOT NULL DEFAULT 0 CHECK (fact_count >= 0),
  policy_version text NOT NULL,
  consent_revision bigint NOT NULL CHECK (consent_revision >= 1),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  embedding_recipe_digest text NOT NULL CHECK (embedding_recipe_digest ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'frozen' CHECK (status IN ('frozen','fenced')),
  idempotency_key text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  frozen_at timestamptz NOT NULL DEFAULT now(),
  fenced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_index_source_manifest_owner_key_uq UNIQUE (owner_user_id, manifest_key),
  CONSTRAINT memory_index_source_manifest_owner_idem_uq UNIQUE (owner_user_id, idempotency_key)
);

DROP TABLE IF EXISTS memory_index_source_manifest_item CASCADE;
CREATE TABLE memory_index_source_manifest_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  manifest_id uuid NOT NULL,
  fact_id uuid NOT NULL,                               -- 引用 memory_fact_adjudication.id（只读，非 FK）
  fact_key text NOT NULL,
  content_digest text NOT NULL CHECK (content_digest ~ '^[a-f0-9]{64}$'),
  source_artifact_digest text CHECK (source_artifact_digest IS NULL OR source_artifact_digest ~ '^[a-f0-9]{64}$'),
  immutable_source_version text,
  fact_version bigint NOT NULL CHECK (fact_version >= 1),
  span_locator jsonb,                                  -- 溯源，不进 digest（jsonb 无跨层唯一规范序列化）
  position bigint NOT NULL CHECK (position >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_index_source_manifest_item_manifest_fact_uq UNIQUE (manifest_id, fact_id)
);

-- ── 独立向量行（owner 作用域；与 qbank 向量严格隔离，不交叉复用 RAG-02B compute cache）────
DROP TABLE IF EXISTS memory_index_generation_embedding CASCADE;
CREATE TABLE memory_index_generation_embedding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  generation_id uuid NOT NULL,
  fact_id uuid NOT NULL,
  embedding_recipe_digest text NOT NULL CHECK (embedding_recipe_digest ~ '^[a-f0-9]{64}$'),
  dimension integer NOT NULL CHECK (dimension >= 1),
  vector real[] NOT NULL,
  vector_checksum text NOT NULL CHECK (vector_checksum ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_index_generation_embedding_gen_fact_uq UNIQUE (generation_id, fact_id)
);

-- ── 缓存条目（检索缓存 + 来源水合缓存），绑 epoch/revision/status ──────────────────────
DROP TABLE IF EXISTS memory_index_generation_cache_entry CASCADE;
CREATE TABLE memory_index_generation_cache_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  generation_id uuid NOT NULL,
  cache_kind text NOT NULL CHECK (cache_kind IN ('retrieval','hydration')),
  cache_key text NOT NULL,
  bound_privacy_epoch bigint NOT NULL CHECK (bound_privacy_epoch >= 1),
  bound_consent_revision bigint NOT NULL CHECK (bound_consent_revision >= 1),
  status text NOT NULL DEFAULT 'live' CHECK (status IN ('live','invalidated')),
  value jsonb,
  invalidated_at timestamptz,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_index_generation_cache_entry_uq UNIQUE (owner_user_id, generation_id, cache_kind, cache_key)
);

-- ── 表级 ACL：runtime（app_role）无原始读/写；memory_runtime 持数据面读写（四原语之③）──
REVOKE ALL ON memory_index_source_manifest, memory_index_source_manifest_item,
  memory_index_generation_embedding, memory_index_generation_cache_entry FROM PUBLIC, app_role;
GRANT SELECT, INSERT, UPDATE ON memory_index_source_manifest, memory_index_source_manifest_item,
  memory_index_generation_embedding, memory_index_generation_cache_entry TO memory_runtime;

ALTER TABLE memory_index_source_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_index_source_manifest FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_index_source_manifest_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_index_source_manifest_item FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_index_generation_embedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_index_generation_embedding FORCE ROW LEVEL SECURITY;
ALTER TABLE memory_index_generation_cache_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_index_generation_cache_entry FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS memory_manifest_runtime ON memory_index_source_manifest;
  CREATE POLICY memory_manifest_runtime ON memory_index_source_manifest
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_manifest_item_runtime ON memory_index_source_manifest_item;
  CREATE POLICY memory_manifest_item_runtime ON memory_index_source_manifest_item
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_gen_embedding_runtime ON memory_index_generation_embedding;
  CREATE POLICY memory_gen_embedding_runtime ON memory_index_generation_embedding
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
  DROP POLICY IF EXISTS memory_gen_cache_runtime ON memory_index_generation_cache_entry;
  CREATE POLICY memory_gen_cache_runtime ON memory_index_generation_cache_entry
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MEM-11 数据面函数（OWNER memory_runtime，EXECUTE 授 app_role）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 冻结 source manifest：仅 active + 未过期 + consent granted + 允许 embedding 数据分类 ──
-- 「允许 embedding 数据分类」= derived_fact/topic/preference（dimension_label 是结构化标签非
-- 语义内容，不进语义向量）。「仍授权」= 冻结瞬间对 memory_consent 做 live granted 检查（MEM-13
-- 事实不落 consent_revision/privacy_epoch 列，故以 live granted 为授权判据）。
CREATE OR REPLACE FUNCTION memory_freeze_source_manifest(
  p_manifest_key text,
  p_embedding_recipe_digest text,
  p_policy_version text,
  p_idempotency_key text DEFAULT NULL
) RETURNS TABLE (manifest_id uuid, manifest_digest text, fact_count bigint,
                 privacy_epoch bigint, consent_revision bigint, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_manifest_id uuid;
  v_privacy_epoch bigint;
  v_consent_revision bigint;
  v_fact_count bigint;
  v_digest text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_manifest_key IS NULL OR length(p_manifest_key)=0
     OR p_embedding_recipe_digest IS NULL OR p_embedding_recipe_digest !~ '^[a-f0-9]{64}$'
     OR p_policy_version IS NULL OR length(p_policy_version)=0 THEN
    RAISE EXCEPTION 'memory_manifest_invalid' USING ERRCODE='22023';
  END IF;

  -- 幂等重放（principal 作用域幂等键，四原语之②）：命中即返回既有，不重复冻结。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT m.id, m.manifest_digest, m.fact_count, m.privacy_epoch, m.consent_revision
      INTO v_manifest_id, v_digest, v_fact_count, v_privacy_epoch, v_consent_revision
      FROM memory_index_source_manifest m
     WHERE m.owner_user_id = principal AND m.idempotency_key = p_idempotency_key
     LIMIT 1;
    IF v_manifest_id IS NOT NULL THEN
      RETURN QUERY SELECT v_manifest_id, v_digest, v_fact_count, v_privacy_epoch, v_consent_revision, true;
      RETURN;
    END IF;
  END IF;
  SELECT m.id, m.manifest_digest, m.fact_count, m.privacy_epoch, m.consent_revision
    INTO v_manifest_id, v_digest, v_fact_count, v_privacy_epoch, v_consent_revision
    FROM memory_index_source_manifest m
   WHERE m.owner_user_id = principal AND m.manifest_key = p_manifest_key
   LIMIT 1;
  IF v_manifest_id IS NOT NULL THEN
    RETURN QUERY SELECT v_manifest_id, v_digest, v_fact_count, v_privacy_epoch, v_consent_revision, true;
    RETURN;
  END IF;

  -- 当前 owner 记忆 fence 快照（全量 consent 的 MAX，作为缓存绑定锚；revoke/删除都会递增）
  SELECT COALESCE(MAX(c.privacy_epoch),1), COALESCE(MAX(c.consent_revision),1)
    INTO v_privacy_epoch, v_consent_revision
    FROM memory_consent c WHERE c.owner_user_id = principal;

  INSERT INTO memory_index_source_manifest(owner_user_id, manifest_key, manifest_digest, fact_count,
    policy_version, consent_revision, privacy_epoch, embedding_recipe_digest, status, idempotency_key)
  VALUES (principal, p_manifest_key, repeat('0',64), 0, p_policy_version, v_consent_revision, v_privacy_epoch,
    p_embedding_recipe_digest, 'frozen', p_idempotency_key)
  RETURNING id INTO v_manifest_id;

  INSERT INTO memory_index_source_manifest_item(owner_user_id, manifest_id, fact_id, fact_key,
    content_digest, source_artifact_digest, immutable_source_version, fact_version, span_locator, position)
  SELECT principal, v_manifest_id, f.id, f.fact_key, f.content_digest,
    r.source_artifact_digest, f.immutable_source_version, f.version, r.span_locator,
    row_number() OVER (ORDER BY f.id)
  FROM memory_fact_adjudication f
  JOIN memory_consent mc ON mc.owner_user_id = f.owner_user_id AND mc.purpose = f.purpose AND mc.status = 'granted'
  JOIN memory_admission_record r ON r.id = f.admission_record_id
     AND r.allowed_data_class IN ('derived_fact','topic','preference')
  WHERE f.owner_user_id = principal
    AND f.status = 'active'
    AND (f.valid_until IS NULL OR f.valid_until > now());

  -- 计数 + digest（canonical 项按 fact_id 排序，只含 text/int 列 → 跨层字节对齐可复算）
  SELECT count(*) INTO v_fact_count FROM memory_index_source_manifest_item mi WHERE mi.manifest_id = v_manifest_id;
  SELECT encode(digest(COALESCE(string_agg(
           mi.fact_id::text || ':' || mi.content_digest || ':'
           || COALESCE(mi.source_artifact_digest,'-') || ':'
           || COALESCE(mi.immutable_source_version,'-') || ':'
           || mi.fact_version::text, E'\n' ORDER BY mi.fact_id), ''), 'sha256'), 'hex')
    INTO v_digest
    FROM memory_index_source_manifest_item mi WHERE mi.manifest_id = v_manifest_id;

  UPDATE memory_index_source_manifest m SET fact_count=v_fact_count, manifest_digest=v_digest
   WHERE m.id = v_manifest_id;

  PERFORM memory_append_audit('memmanifest:'||p_manifest_key, 'freeze',
    jsonb_build_object('manifest_id', v_manifest_id, 'fact_count', v_fact_count,
      'privacy_epoch', v_privacy_epoch, 'embedding_recipe_digest', p_embedding_recipe_digest),
    'freeze:'||v_manifest_id);

  RETURN QUERY SELECT v_manifest_id, v_digest, v_fact_count, v_privacy_epoch, v_consent_revision, false;
END $$;

ALTER FUNCTION memory_freeze_source_manifest(text,text,text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_freeze_source_manifest(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_freeze_source_manifest(text,text,text,text) TO app_role;

-- ── 读 manifest 中「仍可嵌入」的事实（embedding seam 边界：content 从这里出库给 embedder）──
-- 重验 liveness：只在冻结后仍 active + consent granted + 未过期的事实返回。若返回数 < manifest
-- 计数，说明构建中途有撤回/删除 → 调用方必须失败不激活（删除先赢）。
CREATE OR REPLACE FUNCTION memory_read_embeddable_manifest_facts(p_manifest_id uuid)
RETURNS TABLE (fact_id uuid, fact_key text, content text, content_digest text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_manifest uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_manifest_id IS NULL THEN
    RAISE EXCEPTION 'memory_manifest_invalid' USING ERRCODE='22023';
  END IF;
  SELECT m.id INTO v_manifest FROM memory_index_source_manifest m
   WHERE m.id = p_manifest_id AND m.owner_user_id = principal AND m.status = 'frozen';
  IF v_manifest IS NULL THEN
    RAISE EXCEPTION 'memory_manifest_not_frozen' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT f.id, f.fact_key, f.content, f.content_digest
    FROM memory_index_source_manifest_item mi
    JOIN memory_fact_adjudication f ON f.id = mi.fact_id AND f.status = 'active'
      AND (f.valid_until IS NULL OR f.valid_until > now())
    JOIN memory_consent mc ON mc.owner_user_id = f.owner_user_id AND mc.purpose = f.purpose
      AND mc.status = 'granted'
    WHERE mi.manifest_id = p_manifest_id AND mi.owner_user_id = principal
    ORDER BY mi.fact_id;
END $$;
ALTER FUNCTION memory_read_embeddable_manifest_facts(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_read_embeddable_manifest_facts(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_read_embeddable_manifest_facts(uuid) TO app_role;

-- ── 独立构建 shadow generation（不激活；采集失败/污染 RAISE 回滚，绝不清旧 active）────────
CREATE OR REPLACE FUNCTION memory_build_shadow_generation(
  p_generation_key text,
  p_manifest_id uuid,
  p_embedding_recipe_digest text,
  p_dimension integer,
  p_embeddings jsonb
) RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_manifest_id uuid;
  v_manifest_digest text;
  v_manifest_count bigint;
  v_epoch bigint;
  v_rev bigint;
  v_gen_id uuid;
  v_fact_id uuid;
  v_dim integer;
  v_checksum text;
  v_vec real[];
  v_exists integer;
  v_status text;
  emb record;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_generation_key IS NULL OR length(p_generation_key)=0
     OR p_manifest_id IS NULL
     OR p_embedding_recipe_digest IS NULL OR p_embedding_recipe_digest !~ '^[a-f0-9]{64}$'
     OR p_dimension IS NULL OR p_dimension < 1
     OR p_embeddings IS NULL OR jsonb_typeof(p_embeddings) <> 'array' THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;

  SELECT m.id, m.manifest_digest, m.fact_count, m.privacy_epoch, m.consent_revision
    INTO v_manifest_id, v_manifest_digest, v_manifest_count, v_epoch, v_rev
    FROM memory_index_source_manifest m
   WHERE m.id = p_manifest_id AND m.owner_user_id = principal AND m.status = 'frozen';
  IF v_manifest_id IS NULL THEN
    RAISE EXCEPTION 'memory_manifest_not_frozen' USING ERRCODE='22023';
  END IF;
  IF (SELECT count(*) FROM jsonb_array_elements(p_embeddings)) <> v_manifest_count THEN
    RAISE EXCEPTION 'memory_generation_embedding_count_mismatch' USING ERRCODE='22023';
  END IF;

  -- 独立版本：新 generation（shadow 构建，非原地改 active）。generation_key 幂等（owner 作用域）。
  INSERT INTO memory_index_generation AS g(owner_user_id, generation_key, status, manifest_id,
    manifest_digest, embedding_recipe_digest, generation_privacy_epoch, generation_consent_revision)
  VALUES (principal, p_generation_key, 'building', v_manifest_id, v_manifest_digest,
    p_embedding_recipe_digest, v_epoch, v_rev)
  ON CONFLICT (owner_user_id, generation_key) DO NOTHING
  RETURNING g.id INTO v_gen_id;
  IF v_gen_id IS NULL THEN
    -- 幂等重放：读既有行**真实** status（可能 building/validated/active/fenced 等），不硬编码
    -- 'building'——否则重放会把已 validated/active 的 generation 谎报为 building（MEDIUM-2）。
    SELECT g.id, g.status INTO v_gen_id, v_status FROM memory_index_generation g
     WHERE g.owner_user_id = principal AND g.generation_key = p_generation_key;
    RETURN QUERY SELECT v_gen_id, v_status;
    RETURN;
  END IF;

  FOR emb IN SELECT * FROM jsonb_array_elements(p_embeddings) LOOP
    v_fact_id := (emb.value->>'factId')::uuid;
    v_dim := (emb.value->>'dimension')::integer;
    v_checksum := emb.value->>'checksum';
    v_vec := ARRAY(SELECT x::real FROM jsonb_array_elements_text(emb.value->'vector') x);
    IF v_fact_id IS NULL OR v_dim IS NULL OR v_dim <> p_dimension
       OR v_checksum IS NULL OR v_checksum !~ '^[a-f0-9]{64}$'
       OR v_vec IS NULL OR cardinality(v_vec) <> p_dimension THEN
      RAISE EXCEPTION 'memory_generation_embedding_invalid' USING ERRCODE='22023';
    END IF;
    -- 非有限 / NULL 元素一律拒（JSON 侧 Infinity/NaN 会序列化成 null，故必须同时挡 NULL）。
    IF EXISTS (SELECT 1 FROM unnest(v_vec) x WHERE x IS NULL OR x = 'Infinity'::real OR x = '-Infinity'::real OR x = 'NaN'::real) THEN
      RAISE EXCEPTION 'memory_generation_embedding_nonfinite' USING ERRCODE='22023';
    END IF;
    SELECT 1 INTO v_exists FROM memory_index_source_manifest_item mi
     WHERE mi.manifest_id = p_manifest_id AND mi.fact_id = v_fact_id;
    IF v_exists IS NULL THEN
      RAISE EXCEPTION 'memory_generation_embedding_unknown_fact' USING ERRCODE='22023';
    END IF;
    INSERT INTO memory_index_generation_embedding(owner_user_id, generation_id, fact_id,
      embedding_recipe_digest, dimension, vector, vector_checksum)
    VALUES (principal, v_gen_id, v_fact_id, p_embedding_recipe_digest, v_dim, v_vec, v_checksum);
  END LOOP;

  PERFORM memory_append_audit('memgen:'||v_gen_id, 'build',
    jsonb_build_object('generation_id', v_gen_id, 'manifest_id', v_manifest_id, 'dimension', p_dimension),
    'build:'||v_gen_id);

  RETURN QUERY SELECT v_gen_id, 'building'::text;
END $$;
ALTER FUNCTION memory_build_shadow_generation(text,uuid,text,integer,jsonb) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_build_shadow_generation(text,uuid,text,integer,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_build_shadow_generation(text,uuid,text,integer,jsonb) TO app_role;

-- ── 验证 generation：manifest digest/计数/embedding 完整性/recipe 一致 → building→validated ──
-- CAS：WHERE status='building'；验证不通过返回空（fail-closed）。
CREATE OR REPLACE FUNCTION memory_validate_generation(
  p_generation_id uuid,
  p_expected_manifest_digest text,
  p_expected_fact_count bigint,
  p_expected_embedding_recipe_digest text
) RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_manifest_id uuid;
  v_manifest_digest text;
  v_recipe text;
  v_embed_count bigint;
  v_embed_integrity bigint;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_generation_id IS NULL
     OR p_expected_manifest_digest IS NULL OR p_expected_manifest_digest !~ '^[a-f0-9]{64}$'
     OR p_expected_fact_count IS NULL OR p_expected_fact_count < 0
     OR p_expected_embedding_recipe_digest IS NULL OR p_expected_embedding_recipe_digest !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;

  SELECT g.id, g.manifest_id, g.manifest_digest, g.embedding_recipe_digest
    INTO v_id, v_manifest_id, v_manifest_digest, v_recipe
    FROM memory_index_generation g
   WHERE g.id = p_generation_id AND g.owner_user_id = principal AND g.status = 'building';
  IF v_id IS NULL THEN RETURN; END IF;

  -- 验证：digest 一致 + recipe 一致 + embedding 计数 = manifest 计数 + 每条 embedding 对应 manifest item
  IF v_manifest_digest IS DISTINCT FROM p_expected_manifest_digest
     OR v_recipe IS DISTINCT FROM p_expected_embedding_recipe_digest THEN
    RETURN;
  END IF;
  SELECT count(*) INTO v_embed_count FROM memory_index_generation_embedding e WHERE e.generation_id = v_id;
  IF v_embed_count <> p_expected_fact_count THEN RETURN; END IF;
  -- embedding 完整性：每个 manifest item 都有且仅有一条 embedding（行数与 fact 唯一约束保证一一对应）
  SELECT count(*) INTO v_embed_integrity
    FROM memory_index_source_manifest_item mi
    JOIN memory_index_generation_embedding e ON e.generation_id = v_id AND e.fact_id = mi.fact_id
   WHERE mi.manifest_id = v_manifest_id;
  IF v_embed_integrity <> v_embed_count THEN RETURN; END IF;

  UPDATE memory_index_generation g
     SET status='validated', version=g.version+1
   WHERE g.id = v_id AND g.owner_user_id = principal AND g.status = 'building'
   RETURNING g.id, g.status INTO v_id, v_status;
  IF v_id IS NULL THEN RETURN; END IF;

  PERFORM memory_append_audit('memgen:'||v_id, 'validate',
    jsonb_build_object('generation_id', v_id, 'fact_count', v_embed_count), 'validate:'||v_id);

  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_validate_generation(uuid,text,bigint,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_validate_generation(uuid,text,bigint,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_validate_generation(uuid,text,bigint,text) TO app_role;

-- ── CAS 切换 active：重验 liveness（删除/撤回先赢）→ 旧 active→retiring → validated→active ──
CREATE OR REPLACE FUNCTION memory_switch_active_generation(p_generation_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_manifest_id uuid;
  v_stale bigint;
  v_new_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_generation_id IS NULL THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;

  SELECT g.id, g.manifest_id INTO v_id, v_manifest_id
    FROM memory_index_generation g
   WHERE g.id = p_generation_id AND g.owner_user_id = principal AND g.status = 'validated';
  IF v_id IS NULL THEN RETURN; END IF;

  -- 重验 liveness：任一条 manifest fact 已非 active/consent 撤回/已过期 → 删除先赢，激活=0。
  SELECT count(*) INTO v_stale
    FROM memory_index_source_manifest_item mi
    LEFT JOIN memory_fact_adjudication f ON f.id = mi.fact_id AND f.owner_user_id = principal
      AND f.status = 'active' AND (f.valid_until IS NULL OR f.valid_until > now())
    LEFT JOIN memory_consent mc ON mc.owner_user_id = f.owner_user_id AND mc.purpose = f.purpose
      AND mc.status = 'granted'
   WHERE mi.manifest_id = v_manifest_id AND mi.owner_user_id = principal
     AND (f.id IS NULL OR mc.owner_user_id IS NULL);
  IF v_stale > 0 THEN RETURN; END IF;

  -- 先退役本 owner 当前 active（单 active 偏唯一索引兜底）；旧 generation 受控窗口 retiring。
  UPDATE memory_index_generation g
     SET status='retiring', retiring_at=now(), version=g.version+1
   WHERE g.owner_user_id = principal AND g.status = 'active' AND g.id <> v_id;

  UPDATE memory_index_generation g
     SET status='active', activated_at=now(), version=g.version+1
   WHERE g.id = v_id AND g.owner_user_id = principal AND g.status = 'validated'
   RETURNING g.id, g.status INTO v_new_id, v_status;
  IF v_new_id IS NULL THEN RETURN; END IF;

  PERFORM memory_append_audit('memgen:'||v_new_id, 'switch_active',
    jsonb_build_object('generation_id', v_new_id), 'switch:'||v_new_id);

  RETURN QUERY SELECT v_new_id, v_status;
EXCEPTION WHEN unique_violation THEN
  RETURN;
END $$;
ALTER FUNCTION memory_switch_active_generation(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_switch_active_generation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_switch_active_generation(uuid) TO app_role;

-- ── 退役窗口关闭：retiring→retired（窗口期结束，仍可被历史 snapshot 引用到退役为止）──────
CREATE OR REPLACE FUNCTION memory_retire_generation_window(p_generation_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_generation_id IS NULL THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_index_generation g
     SET status='retired', retired_at=now(), version=g.version+1
   WHERE g.id = p_generation_id AND g.owner_user_id = principal AND g.status = 'retiring'
   RETURNING g.id, g.status INTO v_id, v_status;
  IF v_id IS NULL THEN RETURN; END IF;
  PERFORM memory_append_audit('memgen:'||v_id, 'retire', jsonb_build_object('generation_id', v_id), 'retire:'||v_id);
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_retire_generation_window(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_retire_generation_window(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_retire_generation_window(uuid) TO app_role;

-- ── fence generation（撤回/删除）：CAS 任意非 fenced → fenced + 失效其缓存 ──────────────────
CREATE OR REPLACE FUNCTION memory_fence_generation(p_generation_id uuid)
RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_generation_id IS NULL THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_index_generation g
     SET status='fenced', fenced_at=now(), version=g.version+1
   WHERE g.id = p_generation_id AND g.owner_user_id = principal
     AND g.status IN ('building','validated','shadow','active','deprecated','retired','retiring')
   RETURNING g.id, g.status INTO v_id, v_status;
  IF v_id IS NULL THEN RETURN; END IF;
  -- 失效其缓存：旧 cache 不得恢复已撤回内容。
  UPDATE memory_index_generation_cache_entry ce
     SET status='invalidated', invalidated_at=now(), version=ce.version+1
   WHERE ce.generation_id = v_id AND ce.owner_user_id = principal AND ce.status = 'live';
  PERFORM memory_append_audit('memgen:'||v_id, 'fence', jsonb_build_object('generation_id', v_id), 'fence:'||v_id);
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_fence_generation(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_fence_generation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_fence_generation(uuid) TO app_role;

-- ── 撤回/删除同步：按 fact_ids fence 所有引用它们的 generation + 失效缓存 ──────────────────
-- MEDIUM-3：缓存失效与 fence **复用同一个 affected generation 集合**（embedding ∪ manifest_item）。
-- 旧实现缓存失效只 join embedding，会让「仅被 manifest_item 引用、尚无 embedding」的 generation
-- 缓存漏失效，撤回后旧 cache 复活已撤回内容。现将 affected 一次性物化成 uuid[] 数组复用。
CREATE OR REPLACE FUNCTION memory_fence_generations_for_facts(p_fact_ids uuid[])
RETURNS TABLE (fenced_count bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_gen_ids uuid[];
  v_count bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_fact_ids IS NULL OR cardinality(p_fact_ids) = 0 THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  -- 找到引用这些 fact 的 generation（embedding 或 manifest item 两条路径），物化成数组复用。
  SELECT array_agg(DISTINCT gen_id) INTO v_gen_ids
    FROM (
      SELECT e.generation_id AS gen_id
        FROM memory_index_generation_embedding e
       WHERE e.owner_user_id = principal AND e.fact_id = ANY(p_fact_ids)
      UNION
      SELECT g.id AS gen_id
        FROM memory_index_generation g
        JOIN memory_index_source_manifest_item mi ON mi.manifest_id = g.manifest_id
       WHERE g.owner_user_id = principal AND mi.owner_user_id = principal
         AND mi.fact_id = ANY(p_fact_ids)
    ) affected;
  -- fence 这些 generation（CAS 任意非 fenced → fenced）。
  UPDATE memory_index_generation g
     SET status='fenced', fenced_at=now(), version=g.version+1
   WHERE g.id = ANY(v_gen_ids)
     AND g.owner_user_id = principal
     AND g.status <> 'fenced';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  -- 失效这些 generation 的缓存（复用同一 v_gen_ids 集合，与 fence 目标严格一致）。
  UPDATE memory_index_generation_cache_entry ce
     SET status='invalidated', invalidated_at=now(), version=ce.version+1
   WHERE ce.owner_user_id = principal AND ce.status = 'live'
     AND ce.generation_id = ANY(v_gen_ids);
  PERFORM memory_append_audit('memgen:fence_for_facts', 'fence_for_facts',
    jsonb_build_object('fact_count', cardinality(p_fact_ids), 'fenced_count', v_count),
    'fence_facts:'||encode(digest(COALESCE(array_to_string(p_fact_ids, ','), ''), 'sha256'), 'hex'));
  RETURN QUERY SELECT v_count;
END $$;
ALTER FUNCTION memory_fence_generations_for_facts(uuid[]) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_fence_generations_for_facts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_fence_generations_for_facts(uuid[]) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- HIGH-1：把 fence 接入撤回/删除**生产事务**（触发器，非显式调用 / 非 outbox 消费者）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 为何选触发器而非显式调用 / outbox：
--   1. 撤回/删除函数（memory_adjudicate_revoke/confirm 的 supersede/expire/correct、memory_revoke_consent、
--      memory_begin_account_erasure 的 consent fence）都住在冻结的 0093/0099。就地改它们去调用本迁移
--      （0102）才定义的 memory_fence_generations_for_facts 会制造「前向引用」：0093/0099 跑时该函数
--      尚不存在（plpgsql 体不预解析，运行时才解析，故会静默通过但依赖 0102 恒在，破坏迁移排序卫生）。
--      触发器建在 0102（表 + fence 函数都已存在之后），自包含、无前向引用、不改冻结迁移。
--   2. outbox 消费者是异步的 → 不满足「撤回→generation fenced + cache invalidated **原子生效**」：
--      消费滞后窗口内旧 cache 仍可复活。触发器跑在撤回 UPDATE 的**同一事务**内，回滚即一并回滚，原子。
--   3. SECURITY DEFINER 权限面：撤回函数 OWNER memory_runtime；fence 目标表
--      memory_index_generation / memory_index_generation_cache_entry 也在 memory_runtime 权限面内
--      （本迁移 GRANT SELECT/INSERT/UPDATE TO memory_runtime）。触发器函数同样 OWNER memory_runtime
--      + NOBYPASSRLS → FORCE RLS 仍生效，RLS 用 current_setting('app.principal_user', true)
--      （set_config is_local=true 事务内可见）解析，故只能 fence **同一 principal** 的行，跨 owner 绝不误伤。
--   4. 防递归/重复失效：触发器只监听「离开 active/granted」的 status 转移；fence 函数只写
--      memory_index_generation / memory_index_generation_cache_entry，绝不回写
--      memory_fact_adjudication / memory_consent → 无递归。fence UPDATE 有 status<>'fenced' 守卫、
--      cache 失效有 status='live' 守卫 → 重复触发幂等（只首次真转移）。

-- ── 触发器①：fact 离开 active（revoke/supersede/expire/contradict）→ fence 引用它的 generation ──
CREATE OR REPLACE FUNCTION memory_fence_generations_on_fact_leave_active()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  -- 仅当 fact 离开 active 时 fence；candidate→active（confirm 激活）OLD.status<>'active' 不触发。
  IF OLD.status = 'active' AND NEW.status <> 'active' THEN
    PERFORM memory_fence_generations_for_facts(ARRAY[OLD.id]);
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION memory_fence_generations_on_fact_leave_active() OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_fence_generations_on_fact_leave_active() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS memory_fence_gen_on_fact_leave_active ON memory_fact_adjudication;
CREATE TRIGGER memory_fence_gen_on_fact_leave_active
  AFTER UPDATE OF status ON memory_fact_adjudication
  FOR EACH ROW EXECUTE FUNCTION memory_fence_generations_on_fact_leave_active();

-- ── 触发器②：consent 离开 granted（revoke/账户删除同步 fence）→ fence 该 owner 全部 generation ──
-- consent 是 embedding 授权根：generation 混合多 purpose，任一 purpose 撤回即令派生索引整体失效
-- （删除先赢、fail-closed）；re-grant 不复活旧 generation（仍需重新冻结/构建/切换）。
CREATE OR REPLACE FUNCTION memory_fence_generations_on_consent_revoke()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_fenced_ids uuid[];
  v_fenced_count bigint;
  v_invalidated_count bigint;
BEGIN
  IF OLD.status = 'granted' AND NEW.status <> 'granted' THEN
    -- 无 principal 无法判定 owner → 不动作（definer 撤回路径恒有 principal，此分支纯防御）。
    IF principal IS NULL OR length(principal) = 0 THEN
      RETURN NEW;
    END IF;
    -- LOW-1：consent 是 embedding 授权根，撤回即整体失效（删除先赢、fail-closed），且须与 fact-leave
    -- 路径（memory_fence_generations_for_facts 的 fence_for_facts）同等地留 per-fence 审计——
    -- 「谁在何时 fence 了哪些 generation / 失效了多少 cache」可追踪。先物化被 fence 的 generation
    -- id 集 + 计数，再复用 memory_append_audit 落一条有序事件（event_key 含 purpose+新 epoch，
    -- 单调唯一，重放幂等）。
    WITH fenced AS (
      UPDATE memory_index_generation g
         SET status='fenced', fenced_at=now(), version=g.version+1
       WHERE g.owner_user_id = principal AND g.status <> 'fenced'
       RETURNING g.id
    )
    SELECT array_agg(id), count(*) INTO v_fenced_ids, v_fenced_count FROM fenced;
    UPDATE memory_index_generation_cache_entry ce
       SET status='invalidated', invalidated_at=now(), version=ce.version+1
     WHERE ce.owner_user_id = principal AND ce.status = 'live';
    GET DIAGNOSTICS v_invalidated_count = ROW_COUNT;
    PERFORM memory_append_audit('memgen:fence_for_consent_revoke', 'fence_for_consent_revoke',
      jsonb_build_object(
        'purpose', NEW.purpose,
        'privacy_epoch', NEW.privacy_epoch,
        'fenced_count', COALESCE(v_fenced_count, 0),
        'fenced_generation_ids', to_jsonb(COALESCE(v_fenced_ids, ARRAY[]::uuid[])),
        'invalidated_count', COALESCE(v_invalidated_count, 0)),
      'fence_consent:'||NEW.purpose||':'||NEW.privacy_epoch);
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION memory_fence_generations_on_consent_revoke() OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_fence_generations_on_consent_revoke() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS memory_fence_gen_on_consent_revoke ON memory_consent;
CREATE TRIGGER memory_fence_gen_on_consent_revoke
  AFTER UPDATE OF status ON memory_consent
  FOR EACH ROW EXECUTE FUNCTION memory_fence_generations_on_consent_revoke();

-- ── 缓存写：绑当前 active generation 的 epoch/revision ──────────────────────────────────
CREATE OR REPLACE FUNCTION memory_put_generation_cache_entry(
  p_generation_id uuid,
  p_cache_kind text,
  p_cache_key text,
  p_value jsonb
) RETURNS TABLE (id uuid, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_epoch bigint;
  v_rev bigint;
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_generation_id IS NULL
     OR p_cache_kind NOT IN ('retrieval','hydration')
     OR p_cache_key IS NULL OR length(p_cache_key)=0 OR p_value IS NULL THEN
    RAISE EXCEPTION 'memory_cache_invalid' USING ERRCODE='22023';
  END IF;
  SELECT g.generation_privacy_epoch, g.generation_consent_revision
    INTO v_epoch, v_rev FROM memory_index_generation g
   WHERE g.id = p_generation_id AND g.owner_user_id = principal AND g.status = 'active';
  IF v_epoch IS NULL THEN
    RAISE EXCEPTION 'memory_cache_generation_not_active' USING ERRCODE='22023';
  END IF;
  INSERT INTO memory_index_generation_cache_entry AS ce(owner_user_id, generation_id, cache_kind,
    cache_key, bound_privacy_epoch, bound_consent_revision, status, value)
  VALUES (principal, p_generation_id, p_cache_kind, p_cache_key, v_epoch, v_rev, 'live', p_value)
  ON CONFLICT (owner_user_id, generation_id, cache_kind, cache_key) DO UPDATE
    SET value=EXCLUDED.value, bound_privacy_epoch=EXCLUDED.bound_privacy_epoch,
        bound_consent_revision=EXCLUDED.bound_consent_revision, status='live',
        invalidated_at=NULL, version=ce.version+1
  RETURNING ce.id, ce.status INTO v_id, v_status;
  RETURN QUERY SELECT v_id, v_status;
END $$;
ALTER FUNCTION memory_put_generation_cache_entry(uuid,text,text,jsonb) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_put_generation_cache_entry(uuid,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_put_generation_cache_entry(uuid,text,text,jsonb) TO app_role;

-- ── 缓存读：命中前重验绑定 generation 仍 active + epoch/revision 匹配（防旧内容复活）──────
CREATE OR REPLACE FUNCTION memory_lookup_generation_cache(p_cache_kind text, p_cache_key text)
RETURNS TABLE (cache_entry_id uuid, generation_id uuid, value jsonb, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_ce_id uuid;
  v_gen_id uuid;
  v_epoch bigint;
  v_rev bigint;
  v_value jsonb;
  v_active uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_cache_kind NOT IN ('retrieval','hydration')
     OR p_cache_key IS NULL OR length(p_cache_key)=0 THEN
    RAISE EXCEPTION 'memory_cache_invalid' USING ERRCODE='22023';
  END IF;
  SELECT ce.id, ce.generation_id, ce.bound_privacy_epoch, ce.bound_consent_revision, ce.value
    INTO v_ce_id, v_gen_id, v_epoch, v_rev, v_value
    FROM memory_index_generation_cache_entry ce
   WHERE ce.owner_user_id = principal AND ce.cache_kind = p_cache_kind
     AND ce.cache_key = p_cache_key AND ce.status = 'live'
   LIMIT 1;
  IF v_ce_id IS NULL THEN RETURN; END IF;
  -- 重验 epoch/status：绑定 generation 必须仍 active 且 epoch/revision 匹配。
  SELECT g.id INTO v_active FROM memory_index_generation g
   WHERE g.id = v_gen_id AND g.owner_user_id = principal AND g.status = 'active'
     AND g.generation_privacy_epoch = v_epoch AND g.generation_consent_revision = v_rev;
  IF v_active IS NULL THEN
    -- 陈旧：防御性失效（旧 generation/旧 cache 不得恢复已撤回内容）。
    UPDATE memory_index_generation_cache_entry ce
       SET status='invalidated', invalidated_at=now(), version=ce.version+1
     WHERE ce.id = v_ce_id AND ce.owner_user_id = principal AND ce.status = 'live';
    RETURN;
  END IF;
  RETURN QUERY SELECT v_ce_id, v_gen_id, v_value, 'live'::text;
END $$;
ALTER FUNCTION memory_lookup_generation_cache(text,text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_lookup_generation_cache(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_lookup_generation_cache(text,text) TO app_role;

-- ── 失效某 generation 的全部缓存 ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION memory_invalidate_generation_cache(p_generation_id uuid)
RETURNS TABLE (invalidated_count bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_count bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_generation_id IS NULL THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_index_generation_cache_entry ce
     SET status='invalidated', invalidated_at=now(), version=ce.version+1
   WHERE ce.generation_id = p_generation_id AND ce.owner_user_id = principal AND ce.status = 'live';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END $$;
ALTER FUNCTION memory_invalidate_generation_cache(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_invalidate_generation_cache(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_invalidate_generation_cache(uuid) TO app_role;

-- ── 读 active generation（recall 只读 active generation 的承重入口）────────────────────
CREATE OR REPLACE FUNCTION memory_active_generation()
RETURNS TABLE (id uuid, generation_key text, manifest_digest text,
               generation_privacy_epoch bigint, generation_consent_revision bigint, status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT g.id, g.generation_key, g.manifest_digest, g.generation_privacy_epoch,
           g.generation_consent_revision, g.status
    FROM memory_index_generation g
   WHERE g.owner_user_id = principal AND g.status = 'active'
   LIMIT 1;
END $$;
ALTER FUNCTION memory_active_generation() OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_active_generation() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_active_generation() TO app_role;

-- ── 最小 recall：只读 active generation 的 fact id，且重验 liveness（旧 generation/旧缓存
--    不得恢复已撤回内容）。完整两阶段召回是 MEM-14，本函数只承重「active-only + liveness」。
CREATE OR REPLACE FUNCTION memory_recall_active_generation_fact_ids()
RETURNS TABLE (fact_id uuid, fact_key text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 THEN
    RAISE EXCEPTION 'memory_generation_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT mi.fact_id, mi.fact_key
    FROM memory_index_generation g
    JOIN memory_index_source_manifest_item mi ON mi.manifest_id = g.manifest_id
    JOIN memory_fact_adjudication f ON f.id = mi.fact_id AND f.status = 'active'
      AND (f.valid_until IS NULL OR f.valid_until > now())
    JOIN memory_consent mc ON mc.owner_user_id = f.owner_user_id AND mc.purpose = f.purpose
      AND mc.status = 'granted'
   WHERE g.owner_user_id = principal AND g.status = 'active'
   ORDER BY mi.fact_id;
END $$;
ALTER FUNCTION memory_recall_active_generation_fact_ids() OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION memory_recall_active_generation_fact_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_recall_active_generation_fact_ids() TO app_role;
