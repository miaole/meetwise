-- ═══════════════════════════════════════════════════════════════════════════════
-- 0105 MEM-14：两阶段召回 + 派发前复核（ContextSnapshot 冻结）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 承接 MEM-11（0102 索引 generation 生命周期）、MEM-13（0099 长期事实裁决）、MEM-12（0095
-- 准入元标签）、MEM-00（0093 存储/同意/召回根），构建「第一段 DB 硬过滤候选召回 → 第二段
-- 水合来源重验 → 冻结 ContextSnapshot → 模型派发前复核」。本迁移在 0093/0095/0099/0102 之上
-- **叠加**，不重建、不回退它们的表与函数。
--
-- 为何新开表 memory_recall_context_snapshot 而非复用 0093 的 memory_context_snapshot：
--   - 0093 的 memory_context_snapshot 是 issued/consumed/expired/voided 四态（MEM-00 52 断言
--     承重），其 snapshot_digest 仅审计比对、**不承重内容完整性**（jsonb 无跨层唯一规范序列化，
--     见 0093:121-127）。MEM-14 的 ContextSnapshot 需要 published/consumed/voided 三态 + 承重的
--     authorization_version/render_digest + 派发复核锚（consent_revision/privacy_epoch/
--     generation_manifest_digest），语义不同，直接复用会破坏 MEM-00 断言。故新开独立表。
--
-- 为何「第一段必须在 DB 内硬过滤后才检索」是承重结构（而非约定）：
--   - 本函数用 CTE `filtered` 先把候选集按「active generation manifest 引用 + fact active 未过期
--     + purpose + consent granted + 数据分类允许 embedding」全部 WHERE 硬过滤，**过滤后的集合**
--     才 join embedding 算向量/关键词并 ORDER LIMIT。若写成「先全表 Top-K 再应用层 filter」，被
--     DB 硬过滤排除的样本会占用 K 个 slot，导致合法样本被挤出（见 proof 的对抗样本：career
--     purpose 的 fact 与 query 逐字相同 → 相似度恒 1.0，若全局 Top-K 必占第 1 slot；DB 先过滤则
--     结果数 = K 而非 K-1）。
--
-- 为何「命中后来源失效/撤回/删除/过期则模型输入=0」靠两处承重：
--   - 第一段：候选只来自 active generation manifest + fact active + consent granted（撤回/删除/
--     过期 → 不进候选）。
--   - 第二段 memory_hydrate_recall_facts：**逐条重验** digest（内容篡改=0）、status、valid_until、
--     consent（revision/epoch 匹配 live）、数据类别、冲突关系（MEM-13 边）、长度预算。任一失败 →
--     verdict='rejected' + reason_code，**绝不**用旧 cache/旧 summary/旧 index generation 回退补足。
--
-- 为何「派发前复核」是独立的 CAS（围栏先赢 / 派发先赢）：
--   - 冻结（freeze）与派发（dispatch）之间可能发生撤回/过期。dispatch 事务内**重新**读 live
--     consent（revision/epoch 必须仍与 snapshot 冻结值一致）+ snapshot.expires_at；不一致 →
--     published→voided（dispatch_decision=0，围栏先赢）。已 consumed → 幂等返回 dispatch=1（派发
--     先赢），绝不把过期/已撤回 memory 投影为业务事实（E6：仅按模型删除账本处理，不重开）。
--
-- 四承重原语：①CAS（freeze 的范围/版本 + generation manifest CAS；dispatch 的 published→
--   consumed/voided 条件更新）②principal 作用域幂等键（UNIQUE(owner,snapshot_key) + 重放返回
--   既有冻结选择）③RLS owner 隔离（FORCE RLS + owner=principal）④持久有序事件日志（复用 0093
--   memory_append_audit，单调 eventSeq）。复用 0093 memory_runtime 角色，不重实现删除根/issuer。
--
-- 诚实标注（LOW）：本表 memory_recall_context_snapshot 未纳入 0093 account erasure 的 3-sink 枚举
--   （memory_fact/memory_embedding/memory_context_snapshot）。物理 purge 属 MEM-00/PRD-TEST-013 的
--   sink registry 扩展（本任务不重实现删除根、不就地改冻结的 0093 删除函数）；其防复活由「派发前
--   复核重查 consent/epoch → 围栏先赢即 voided」承重，物理清除留待删除根闭合时一并扩 sink。

-- 角色兜底：memory_runtime 由 0093 创建（NOLOGIN NOINHERIT NOBYPASSRLS）；此处幂等兜底。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'memory_runtime') THEN
    CREATE ROLE memory_runtime NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  GRANT USAGE ON SCHEMA public TO memory_runtime;
END $$;

-- ── memory_recall_context_snapshot：冻结上下文快照（published/consumed/voided）────────────
-- content jsonb 冻结「候选集 + 拒绝 reason code + 被选来源版本」；authorization_version 冻结
-- 授权/范围版本 digest；consent_revision/privacy_epoch/generation_manifest_digest 是派发复核锚
-- （冻结瞬间的 live 授权快照，dispatch 时重验是否仍一致）；render_digest 冻结渲染 digest（E1
-- 同 snapshot_key 幂等回放字节等价）。显式 enum 禁布尔汤。
DROP TABLE IF EXISTS memory_recall_context_snapshot CASCADE;
CREATE TABLE memory_recall_context_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  snapshot_key text NOT NULL,                          -- principal 作用域幂等键（同 turn 重放同选择）
  purpose text NOT NULL CHECK (purpose IN ('interview_prep','career','preference','self_improvement')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','consumed','voided')),
  authorization_version text NOT NULL CHECK (authorization_version ~ '^[a-f0-9]{64}$'),
  consent_revision bigint NOT NULL CHECK (consent_revision >= 1),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  generation_manifest_digest text CHECK (generation_manifest_digest IS NULL OR generation_manifest_digest ~ '^[a-f0-9]{64}$'),
  retrieval_policy_version text NOT NULL,
  budget integer NOT NULL CHECK (budget >= 0),
  renderer_version text NOT NULL,
  render_digest text NOT NULL CHECK (render_digest ~ '^[a-f0-9]{64}$'),
  content jsonb NOT NULL,                              -- 候选集 + 拒绝 reason code + 被选来源版本（无 PII 原文）
  void_reason text,                                    -- 围栏先赢 / 过期 / 陈旧授权 / 陈旧 generation
  expires_at timestamptz,                              -- 快照授权有效期（dispatch 重验）
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  published_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz,
  voided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_recall_context_snapshot_owner_key_uq UNIQUE (owner_user_id, snapshot_key)
);
CREATE INDEX memory_recall_context_snapshot_owner_idx ON memory_recall_context_snapshot (owner_user_id, status);

GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER TABLE memory_recall_context_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_recall_context_snapshot FORCE ROW LEVEL SECURITY;

-- ── 表级 ACL：runtime（app_role）无原始读/写（负路径承重）；memory_runtime 持数据面读写 ──
REVOKE ALL ON memory_recall_context_snapshot FROM PUBLIC, app_role;
GRANT SELECT, INSERT, UPDATE ON memory_recall_context_snapshot TO memory_runtime;

-- ── RLS 策略：FORCE + owner_user_id=principal 绑定（四原语之③）────────────────────────
DO $$
BEGIN
  DROP POLICY IF EXISTS memory_recall_snapshot_runtime ON memory_recall_context_snapshot;
  CREATE POLICY memory_recall_snapshot_runtime ON memory_recall_context_snapshot
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MEM-14 数据面函数（OWNER memory_runtime，EXECUTE 授 app_role）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 第一段：DB 内硬过滤候选召回（hybrid：向量 cosine + 关键词重叠）──────────────────
-- 硬过滤（全在 WHERE，先过滤再排序）：active generation manifest 引用 + fact active 未过期 +
-- purpose 匹配 + live consent granted 且 revision/epoch 与调用方观察值一致 + 数据分类允许
-- embedding。**绝无**「先全表 Top-K 再应用层过滤」。返回来源卡片（无 content、无裸 embedding）。
-- 检索权重（0.7 向量 / 0.3 关键词）由 retrieval_policy_version 钉住（硬编码于本 SQL，真实
-- rerank 归 MODEL-OP，本函数只承重「结构 + 过滤」机制）。
CREATE OR REPLACE FUNCTION memory_recall_hybrid_candidates(
  p_purpose text,
  p_consent_revision bigint,
  p_privacy_epoch bigint,
  p_generation_manifest_digest text,
  p_query_vector jsonb,
  p_query_text text,
  p_top_k integer
) RETURNS TABLE (
  fact_id uuid, fact_key text, retrieval_kind text, retrieval_score real,
  source_entity_id text, immutable_source_version text, source_artifact_digest text,
  span_locator jsonb, content_digest text, fact_version bigint, allowed_data_class text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_gen_id uuid;
  v_dim integer;
  v_qvec real[];
  v_qnorm real := 0;
  v_epoch bigint;
  v_rev bigint;
  v_manifest text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement')
     OR p_consent_revision IS NULL OR p_consent_revision < 1
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1
     OR p_top_k IS NULL OR p_top_k < 1 THEN
    RAISE EXCEPTION 'memory_recall_invalid' USING ERRCODE='22023';
  END IF;

  -- fence-first：live consent 必须 granted 且 revision/epoch 与观察值一致（陈旧/撤回 → 空）。
  SELECT mc.privacy_epoch, mc.consent_revision INTO v_epoch, v_rev
    FROM memory_consent mc
   WHERE mc.owner_user_id = principal AND mc.purpose = p_purpose AND mc.status = 'granted'
   FOR SHARE;
  IF v_epoch IS NULL OR v_epoch IS DISTINCT FROM p_privacy_epoch OR v_rev IS DISTINCT FROM p_consent_revision THEN
    RETURN;  -- 无记忆可用 / 陈旧授权（fail-closed，不扩大 scope 填充）
  END IF;

  -- active generation + 维度 + manifest digest（陈旧 generation 观察 → 空）。
  SELECT g.id, MIN(e.dimension)::integer, g.manifest_digest
    INTO v_gen_id, v_dim, v_manifest
    FROM memory_index_generation g
    LEFT JOIN memory_index_generation_embedding e ON e.generation_id = g.id
   WHERE g.owner_user_id = principal AND g.status = 'active'
   GROUP BY g.id, g.manifest_digest
   LIMIT 1;
  IF v_gen_id IS NULL THEN RETURN; END IF;
  IF p_generation_manifest_digest IS NOT NULL AND v_manifest IS DISTINCT FROM p_generation_manifest_digest THEN
    RETURN;
  END IF;

  -- 查询向量（JSON 数组 → real[]；维度/有限性校验 fail-closed）。
  IF p_query_vector IS NOT NULL AND jsonb_typeof(p_query_vector) = 'array' THEN
    v_qvec := ARRAY(SELECT x::real FROM jsonb_array_elements_text(p_query_vector) x);
    IF v_dim IS NOT NULL AND cardinality(v_qvec) <> v_dim THEN
      RAISE EXCEPTION 'memory_recall_vector_dimension_mismatch' USING ERRCODE='22023';
    END IF;
    IF EXISTS (SELECT 1 FROM unnest(v_qvec) x
               WHERE x IS NULL OR x = 'Infinity'::real OR x = '-Infinity'::real OR x = 'NaN'::real) THEN
      RAISE EXCEPTION 'memory_recall_vector_nonfinite' USING ERRCODE='22023';
    END IF;
    SELECT sqrt(sum(x*x)) INTO v_qnorm FROM unnest(v_qvec) x;
  ELSE
    v_qvec := NULL;
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT f.id AS fact_id, f.fact_key, f.content, f.content_digest, f.version AS fact_version,
           f.source_entity_id, f.immutable_source_version,
           r.source_artifact_digest, r.span_locator, r.allowed_data_class
      FROM memory_index_generation g
      JOIN memory_index_source_manifest_item mi ON mi.manifest_id = g.manifest_id
      JOIN memory_fact_adjudication f
        ON f.id = mi.fact_id AND f.owner_user_id = principal
       AND f.status = 'active' AND (f.valid_until IS NULL OR f.valid_until > now())
       AND f.purpose = p_purpose
      JOIN memory_admission_record r
        ON r.id = f.admission_record_id
       AND r.allowed_data_class IN ('derived_fact','topic','preference')
     WHERE g.id = v_gen_id AND g.owner_user_id = principal AND mi.owner_user_id = principal
  ),
  scored AS (
    SELECT f.*, e.vector AS vec,
      CASE WHEN e.vector IS NOT NULL AND v_qvec IS NOT NULL AND v_qnorm > 0 THEN
        (SELECT sum(q * v) FROM unnest(v_qvec, e.vector) AS t(q, v))
          / (v_qnorm * (SELECT sqrt(sum(x*x)) FROM unnest(e.vector) AS s(x)))
      ELSE 0::real END AS v_score,
      CASE WHEN p_query_text IS NOT NULL AND length(trim(p_query_text)) > 0 THEN
        (SELECT count(*) FILTER (WHERE f.content ILIKE '%' || tok || '%')::real
              / NULLIF(count(*), 0)
           FROM regexp_split_to_table(lower(trim(p_query_text)), '[^a-z0-9一-鿿]+') AS s(tok)
          WHERE length(tok) > 0)
      ELSE 0::real END AS k_score
      FROM filtered f
      LEFT JOIN memory_index_generation_embedding e
        ON e.generation_id = v_gen_id AND e.fact_id = f.fact_id
  )
  SELECT s.fact_id, s.fact_key,
    CASE WHEN s.v_score > 0 AND s.k_score > 0 THEN 'hybrid'
         WHEN s.v_score > 0 THEN 'vector'
         WHEN s.k_score > 0 THEN 'keyword'
         ELSE NULL END AS retrieval_kind,
    (0.7 * s.v_score + 0.3 * s.k_score)::real AS retrieval_score,
    s.source_entity_id, s.immutable_source_version, s.source_artifact_digest,
    s.span_locator, s.content_digest, s.fact_version, s.allowed_data_class
  FROM scored s
  WHERE (0.7 * s.v_score + 0.3 * s.k_score) > 0
  ORDER BY (0.7 * s.v_score + 0.3 * s.k_score) DESC, s.fact_id ASC
  LIMIT p_top_k;
END $$;

ALTER FUNCTION memory_recall_hybrid_candidates(text,bigint,bigint,text,jsonb,text,integer) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_recall_hybrid_candidates(text,bigint,bigint,text,jsonb,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_recall_hybrid_candidates(text,bigint,bigint,text,jsonb,text,integer) TO app_role;

-- ── 第二段：水合来源重验（逐条 verdict；任一失败 → rejected + reason_code，绝不回退旧缓存）─
-- 重验顺序（首个失败即拒绝）：scope（存在性/owner/purpose）→ status active → valid_until → live
-- consent（revision/epoch）→ 数据分类 → digest（内容篡改）→ 冲突关系（MEM-13 边）→ 长度预算。
-- 绝不吐 content 给 rejected；accepted 才吐 content + 来源卡片（含 span_locator provenance）。
CREATE OR REPLACE FUNCTION memory_hydrate_recall_facts(
  p_purpose text,
  p_consent_revision bigint,
  p_privacy_epoch bigint,
  p_content_budget integer,
  p_fact_ids uuid[]
) RETURNS TABLE (
  fact_id uuid, verdict text, reason_code text, fact_key text, content text,
  content_digest text, source_entity_id text, immutable_source_version text,
  source_artifact_digest text, span_locator jsonb, allowed_data_class text, fact_version bigint
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  fid uuid;
  frow record;
  v_reason text;
  v_consent_ok boolean;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement')
     OR p_consent_revision IS NULL OR p_consent_revision < 1
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1
     OR p_content_budget IS NULL OR p_content_budget < 1
     OR p_fact_ids IS NULL OR cardinality(p_fact_ids) = 0 THEN
    RAISE EXCEPTION 'memory_hydrate_invalid' USING ERRCODE='22023';
  END IF;

  -- live consent 单次读取（每 fact 的 verdict 在下方逐条复核 fact liveness + digest 等）。
  SELECT EXISTS (
    SELECT 1 FROM memory_consent mc
     WHERE mc.owner_user_id = principal AND mc.purpose = p_purpose
       AND mc.status = 'granted' AND mc.consent_revision = p_consent_revision
       AND mc.privacy_epoch = p_privacy_epoch
  ) INTO v_consent_ok;

  FOREACH fid IN ARRAY p_fact_ids LOOP
    v_reason := NULL;
    SELECT f.fact_key, f.content, f.content_digest, f.version, f.source_entity_id,
           f.immutable_source_version, r.source_artifact_digest, r.span_locator,
           r.allowed_data_class, f.status, f.valid_until
      INTO frow
      FROM memory_fact_adjudication f
      JOIN memory_admission_record r ON r.id = f.admission_record_id
     WHERE f.id = fid AND f.owner_user_id = principal AND f.purpose = p_purpose;
    IF NOT FOUND THEN
      v_reason := 'scope_forbidden';
    ELSIF frow.status <> 'active' THEN
      v_reason := 'status_not_active';
    ELSIF frow.valid_until IS NOT NULL AND frow.valid_until <= now() THEN
      v_reason := 'expired';
    ELSIF v_consent_ok IS NOT TRUE THEN
      v_reason := 'consent_revoked';
    ELSIF frow.allowed_data_class IS NULL OR frow.allowed_data_class NOT IN ('derived_fact','topic','preference') THEN
      v_reason := 'data_class_forbidden';
    ELSIF encode(digest(frow.content, 'sha256'), 'hex') IS DISTINCT FROM frow.content_digest THEN
      v_reason := 'digest_mismatch';
    ELSIF EXISTS (
      SELECT 1 FROM memory_fact_relationship rel
      JOIN memory_fact_adjudication src ON src.id = rel.from_fact_id AND src.status = 'active'
       WHERE rel.owner_user_id = principal AND rel.to_fact_id = fid
         AND rel.relationship IN ('supersedes','contradicts')
    ) THEN
      v_reason := 'conflict_superseded';
    ELSIF octet_length(frow.content) > p_content_budget THEN
      v_reason := 'budget_exceeded';
    END IF;

    -- RETURNS TABLE(...) 即 OUT 参数形式：PostgreSQL 禁止「RETURN NEXT (…带参)」，必须先给
    -- OUT 变量赋值再裸 RETURN NEXT（否则 migration apply 直接炸，阻塞整条 isolated prove gate）。
    IF v_reason IS NULL THEN
      fact_id := fid;
      verdict := 'accepted';
      reason_code := NULL;
      fact_key := frow.fact_key;
      content := frow.content;
      content_digest := frow.content_digest;
      source_entity_id := frow.source_entity_id;
      immutable_source_version := frow.immutable_source_version;
      source_artifact_digest := frow.source_artifact_digest;
      span_locator := frow.span_locator;
      allowed_data_class := frow.allowed_data_class;
      fact_version := frow.version;
      RETURN NEXT;
    ELSE
      fact_id := fid;
      verdict := 'rejected';
      reason_code := v_reason;
      fact_key := NULL;
      content := NULL;
      content_digest := NULL;
      source_entity_id := NULL;
      immutable_source_version := NULL;
      source_artifact_digest := NULL;
      span_locator := NULL;
      allowed_data_class := NULL;
      fact_version := NULL;
      RETURN NEXT;
    END IF;
  END LOOP;
  RETURN;
END $$;
ALTER FUNCTION memory_hydrate_recall_facts(text,bigint,bigint,integer,uuid[]) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_hydrate_recall_facts(text,bigint,bigint,integer,uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_hydrate_recall_facts(text,bigint,bigint,integer,uuid[]) TO app_role;

-- ── 冻结 ContextSnapshot（幂等 + 范围/版本 + generation manifest CAS 发布）──────────────
-- 同 snapshot_key 幂等回放返回既有冻结选择（E1）；否则 live CAS：consent revision/epoch +
-- generation manifest digest 与观察值一致 → published（唯一 winner）；不一致（撤回/删除/切换
-- 先赢）→ voided + void_reason（E2）。advisory 锁按 (principal,snapshot_key) 串行化并发 freeze。
CREATE OR REPLACE FUNCTION memory_freeze_recall_snapshot(
  p_snapshot_key text,
  p_purpose text,
  p_authorization_version text,
  p_consent_revision bigint,
  p_privacy_epoch bigint,
  p_generation_manifest_digest text,
  p_retrieval_policy_version text,
  p_budget integer,
  p_renderer_version text,
  p_render_digest text,
  p_content jsonb,
  p_expires_at timestamptz
) RETURNS TABLE (snapshot_id uuid, status text, void_reason text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
  v_void text;
  v_epoch bigint;
  v_rev bigint;
  v_manifest text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_snapshot_key IS NULL OR length(p_snapshot_key)=0
     OR p_purpose NOT IN ('interview_prep','career','preference','self_improvement')
     OR p_authorization_version IS NULL OR p_authorization_version !~ '^[a-f0-9]{64}$'
     OR p_consent_revision IS NULL OR p_consent_revision < 1
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1
     OR (p_generation_manifest_digest IS NOT NULL AND p_generation_manifest_digest !~ '^[a-f0-9]{64}$')
     OR p_retrieval_policy_version IS NULL OR length(p_retrieval_policy_version)=0
     OR p_budget IS NULL OR p_budget < 0
     OR p_renderer_version IS NULL OR length(p_renderer_version)=0
     OR p_render_digest IS NULL OR p_render_digest !~ '^[a-f0-9]{64}$'
     OR p_content IS NULL THEN
    RAISE EXCEPTION 'memory_snapshot_invalid' USING ERRCODE='22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('memrecallsnap:' || principal || ':' || p_snapshot_key));

  -- E1 幂等回放：同 owner 同 snapshot_key 返回既有冻结选择（不双写、不改冻结输入）。
  SELECT s.id, s.status, s.void_reason INTO v_id, v_status, v_void
    FROM memory_recall_context_snapshot s
   WHERE s.owner_user_id = principal AND s.snapshot_key = p_snapshot_key
   FOR UPDATE;
  IF FOUND THEN
    RETURN QUERY SELECT v_id, v_status, v_void, true;
    RETURN;
  END IF;

  -- E2 live CAS 门：consent revision/epoch + active generation manifest digest 与观察值一致。
  SELECT mc.privacy_epoch, mc.consent_revision INTO v_epoch, v_rev
    FROM memory_consent mc
   WHERE mc.owner_user_id = principal AND mc.purpose = p_purpose AND mc.status = 'granted'
   FOR SHARE;
  SELECT g.manifest_digest INTO v_manifest
    FROM memory_index_generation g
   WHERE g.owner_user_id = principal AND g.status = 'active'
   LIMIT 1;

  v_void := NULL;
  IF v_epoch IS NULL OR v_rev IS NULL
     OR v_epoch IS DISTINCT FROM p_privacy_epoch OR v_rev IS DISTINCT FROM p_consent_revision THEN
    v_void := 'stale_consent';
  ELSIF v_manifest IS DISTINCT FROM p_generation_manifest_digest THEN
    -- 两者皆 NULL = 「无 active generation」的 no-memory 冻结（合法）；否则陈旧。
    v_void := 'stale_generation';
  END IF;

  IF v_void IS NOT NULL THEN
    INSERT INTO memory_recall_context_snapshot(owner_user_id, snapshot_key, purpose, status,
      authorization_version, consent_revision, privacy_epoch, generation_manifest_digest,
      retrieval_policy_version, budget, renderer_version, render_digest, content, void_reason, expires_at)
    VALUES (principal, p_snapshot_key, p_purpose, 'voided',
      p_authorization_version, p_consent_revision, p_privacy_epoch, p_generation_manifest_digest,
      p_retrieval_policy_version, p_budget, p_renderer_version, p_render_digest, p_content, v_void, p_expires_at)
    RETURNING id INTO v_id;
    PERFORM memory_append_audit('memrecallsnap:'||p_snapshot_key, 'freeze_voided',
      jsonb_build_object('snapshot_id', v_id, 'void_reason', v_void), 'freeze:'||v_id);
    RETURN QUERY SELECT v_id, 'voided', v_void, false;
    RETURN;
  END IF;

  INSERT INTO memory_recall_context_snapshot(owner_user_id, snapshot_key, purpose, status,
    authorization_version, consent_revision, privacy_epoch, generation_manifest_digest,
    retrieval_policy_version, budget, renderer_version, render_digest, content, expires_at)
  VALUES (principal, p_snapshot_key, p_purpose, 'published',
    p_authorization_version, p_consent_revision, p_privacy_epoch, p_generation_manifest_digest,
    p_retrieval_policy_version, p_budget, p_renderer_version, p_render_digest, p_content, p_expires_at)
  RETURNING id INTO v_id;
  PERFORM memory_append_audit('memrecallsnap:'||p_snapshot_key, 'freeze_published',
    jsonb_build_object('snapshot_id', v_id), 'freeze:'||v_id);
  RETURN QUERY SELECT v_id, 'published', NULL, false;
END $$;
ALTER FUNCTION memory_freeze_recall_snapshot(text,text,text,bigint,bigint,text,text,integer,text,text,jsonb,timestamptz) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_freeze_recall_snapshot(text,text,text,bigint,bigint,text,text,integer,text,text,jsonb,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_freeze_recall_snapshot(text,text,text,bigint,bigint,text,text,integer,text,text,jsonb,timestamptz) TO app_role;

-- ── 派发前复核（围栏先赢 / 派发先赢，CAS）──────────────────────────────────────────────
-- published 且 live consent（revision/epoch 与冻结值一致）+ 未过期 → consumed（dispatch=1）；
-- 否则 published→voided（dispatch=0，围栏先赢）。consumed/voided 幂等回放同终态（consumed 绝不
-- 被后续撤回重新 void —— E6 派发先赢，仅按模型删除账本处理，不把过期/已撤回 memory 投影为事实）。
CREATE OR REPLACE FUNCTION memory_dispatch_recall_snapshot(p_snapshot_id uuid)
RETURNS TABLE (snapshot_id uuid, status text, dispatch_decision integer, void_reason text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  snap memory_recall_context_snapshot%ROWTYPE;
  v_epoch bigint;
  v_rev bigint;
  v_void text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_snapshot_id IS NULL THEN
    RAISE EXCEPTION 'memory_dispatch_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO snap FROM memory_recall_context_snapshot s
   WHERE s.id = p_snapshot_id AND s.owner_user_id = principal
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_dispatch_not_found' USING ERRCODE='42501';
  END IF;

  -- 已消费（派发先赢）：幂等回放同终态，绝不重新 void。
  IF snap.status = 'consumed' THEN
    RETURN QUERY SELECT snap.id, 'consumed', 1, NULL;
    RETURN;
  END IF;
  IF snap.status = 'voided' THEN
    RETURN QUERY SELECT snap.id, 'voided', 0, snap.void_reason;
    RETURN;
  END IF;
  IF snap.status <> 'published' THEN
    RETURN QUERY SELECT snap.id, snap.status, 0, NULL;
    RETURN;
  END IF;

  -- fence-first-wins 重验：live consent（revision/epoch 与冻结值一致）+ 快照未过期。
  SELECT mc.privacy_epoch, mc.consent_revision INTO v_epoch, v_rev
    FROM memory_consent mc
   WHERE mc.owner_user_id = principal AND mc.purpose = snap.purpose AND mc.status = 'granted'
   FOR SHARE;
  v_void := NULL;
  IF v_epoch IS NULL OR v_rev IS NULL
     OR v_epoch IS DISTINCT FROM snap.privacy_epoch OR v_rev IS DISTINCT FROM snap.consent_revision THEN
    v_void := 'fence_first';
  ELSIF snap.expires_at IS NOT NULL AND snap.expires_at <= now() THEN
    v_void := 'expired';
  END IF;

  IF v_void IS NOT NULL THEN
    UPDATE memory_recall_context_snapshot s
       SET status='voided', void_reason=v_void, voided_at=now(), version=s.version+1
     WHERE s.id = snap.id AND s.status = 'published'
     RETURNING s.id, s.status, s.void_reason INTO snap.id, snap.status, snap.void_reason;
    PERFORM memory_append_audit('memrecallsnap:'||snap.snapshot_key, 'dispatch_voided',
      jsonb_build_object('snapshot_id', snap.id, 'void_reason', v_void), 'dispatch:'||snap.id);
    RETURN QUERY SELECT snap.id, 'voided', 0, v_void;
    RETURN;
  END IF;

  UPDATE memory_recall_context_snapshot s
     SET status='consumed', consumed_at=now(), version=s.version+1
   WHERE s.id = snap.id AND s.status = 'published'
   RETURNING s.id, s.status INTO snap.id, snap.status;
  IF snap.id IS NULL THEN
    -- 并发派发已赢：重读终态。
    SELECT s.id, s.status, s.void_reason INTO snap.id, snap.status, snap.void_reason
      FROM memory_recall_context_snapshot s WHERE s.id = p_snapshot_id;
    IF snap.status = 'consumed' THEN
      RETURN QUERY SELECT snap.id, 'consumed', 1, NULL;
    ELSE
      RETURN QUERY SELECT snap.id, COALESCE(snap.status, 'voided'), 0, snap.void_reason;
    END IF;
    RETURN;
  END IF;
  PERFORM memory_append_audit('memrecallsnap:'||snap.snapshot_key, 'dispatch_consumed',
    jsonb_build_object('snapshot_id', snap.id), 'dispatch:'||snap.id);
  RETURN QUERY SELECT snap.id, 'consumed', 1, NULL;
END $$;
ALTER FUNCTION memory_dispatch_recall_snapshot(uuid) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION memory_dispatch_recall_snapshot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_dispatch_recall_snapshot(uuid) TO app_role;

-- runtime login 永不通过 membership 漂移成为 memory_runtime（防漂移，与 0093/0099/0102 一致）。
REVOKE memory_runtime, memory_admission_issuer FROM app_role;
