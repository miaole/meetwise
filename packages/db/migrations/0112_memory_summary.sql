-- ═══════════════════════════════════════════════════════════════════════════════
-- 0112 MEM-02：单轮与区间摘要（可废弃的摘要派生物）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 落地 memory-context-design.md L118/L161/L207-218 的「不可变 summary」原语：
--   - 不可变 summary 对象（turn_summary / segment_summary），append-only，表键
--     `(owner_user_id, thread_id, source_event_seq_start, source_event_seq_end, version)`。
--     禁原地 UPDATE content——supersede 走新版本（version+1）引用旧版本（supersedes_summary_id）。
--   - 每条 summary 绑定：连续来源事件范围（eventSeq range + SQL 重算 source_range_digest）、
--     原文 digest（source_artifact_digest，sha256 拼接正文）、source_utf8_byte_length、
--     content + content_digest（服务端重算 sha256）、结构化 claims（每 claim 带 spanLocator，
--     固定 UTF-8 字节偏移，沿用 0095 offsetKind='utf8_byte'）、prompt/model/tokenizer/policy
--     版本、父/子摘要版本引用 FK 列（parent_summary_id/supersedes_summary_id，树逻辑归 MEM-03，
--     本迁移不实现）、显式 status enum、CAS version（cas_version）。
--   - 状态机 `draft → verified → active → superseded/invalidated/fenced → purged`：
--     `memory_summarizer` 只写 draft（status 硬编码，绝非参数）；受控 verify 命令 draft→verified；
--     activate verified→active（并自动 supersede 同 slot 旧 active）。模型输出只能是 draft，
--     绝不 direct active（没有任何函数能把行直接写进 active）。
--   - 删除孤儿闭合（镜像 0111 / INT-TRANSCRIPT-01 ai_graph_run 先例）：sink 枚举
--     'memory_summary' 已在 0093/0111 内，本迁移不重复扩枚举；新增 begin/claim/purge 三 resolver，
--     使行真达 fenced→purged→物理 DELETE，删后 hydrate/replay/raw SELECT 三路径 read=0。
--   - 四原语复用不重实现：①CAS（cas_version+1 WHERE cas_version=expected，单赢家）②幂等键
--     （partial UNIQUE(owner, idempotency_key)）③RLS（FORCE + owner=principal + worker 的
--     privacy_target_id 谓词）④持久有序日志（复用 0093 memory_append_audit）。
--
-- 角色纪律：`memory_summarizer`（NOLOGIN NOINHERIT NOBYPASSRLS）最小化新建——只读冻结范围
-- 关系行（conversation_event，无正文）+ 写自己 owner 作用域的 draft 行；不读 user_account /
-- memory_fact / 其他数据面；不扩权任何既有角色（仅向该新角色授予调用 memory_append_audit 的
-- 最小 EXECUTE，审计写回 owner 作用域）。
--
-- 诚实标注（非目标）：不实现 MEM-03 树逻辑（parent/child 只留 FK 列）；不实现 CTX-04
-- compression snapshot；不实现真实 embedding / 真实模型摘要（MODEL-OP）；不碰 SCOR/RAG/qbank。

-- ═══════════════════════════════════════════════════════════════════════════════
-- A. 角色：memory_summarizer（服务端 summarizer seam，NOLOGIN NOBYPASSRLS）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 与 memory_admission_issuer / privacy_issuer 同纪律：draft 只能由这个「服务端 seam」写入，
-- runtime(app_role) 无 draft 写权（无 EXECUTE）。summarizer 是 NOLOGIN 固定 owner，其函数受
-- FORCE RLS 约束，不能借 owner 权绕过 RLS。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='memory_summarizer') THEN
    CREATE ROLE memory_summarizer NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO memory_summarizer;

-- ═══════════════════════════════════════════════════════════════════════════════
-- B. 不可变 summary 表（append-only 派生对象）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE memory_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  thread_id text NOT NULL,
  -- 摘要类别：单轮摘要 / 区间摘要
  kind text NOT NULL CHECK (kind IN ('turn_summary','segment_summary')),
  -- 摘要版本号（append-only 身份，键内）：同一 (owner,thread,range) slot 内单调 +1。
  version bigint NOT NULL CHECK (version >= 1),
  -- CAS 乐观并发版本（状态跃迁时 +1；与 append-only 身份 version 刻意分离）。
  cas_version bigint NOT NULL DEFAULT 1 CHECK (cas_version >= 1),
  -- 连续来源事件范围（eventSeq range）+ SQL 重算的冻结范围 digest。
  source_event_seq_start bigint NOT NULL CHECK (source_event_seq_start >= 1),
  source_event_seq_end bigint NOT NULL CHECK (source_event_seq_end >= source_event_seq_start),
  source_range_digest text NOT NULL CHECK (source_range_digest ~ '^[a-f0-9]{64}$'),
  -- 原文 digest（拼接正文 sha256）+ UTF-8 字节长度（span 上界校验用）。
  source_artifact_digest text NOT NULL CHECK (source_artifact_digest ~ '^[a-f0-9]{64}$'),
  source_utf8_byte_length bigint NOT NULL CHECK (source_utf8_byte_length >= 0),
  -- 摘要正文（派生内容 = 未受信输入 data fence）+ 服务端重算 content_digest。
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 20000),
  content_digest text NOT NULL CHECK (content_digest ~ '^[a-f0-9]{64}$'),
  -- 结构化 claims：每个 claim = {text, span:{offsetKind:'utf8_byte', start, end}}。
  claims jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- prompt/model/tokenizer/policy 版本。
  prompt_version text NOT NULL,
  model_version text NOT NULL,
  tokenizer_version text NOT NULL,
  policy_version text NOT NULL,
  -- 父/子摘要版本引用 FK 列（树逻辑 MEM-03 不实现，本迁移只留列）。
  parent_summary_id uuid REFERENCES memory_summary(id),
  supersedes_summary_id uuid REFERENCES memory_summary(id),
  -- 元标签（fail-closed：固定服务端派生，调用方不可伪造 controller_scope 等）。
  controller_scope text NOT NULL DEFAULT 'c_personal' CHECK (controller_scope = 'c_personal'),
  data_subject_type text NOT NULL DEFAULT 'c_personal_user' CHECK (data_subject_type = 'c_personal_user'),
  data_subject_id text NOT NULL,
  scope_kind text NOT NULL DEFAULT 'personal' CHECK (scope_kind = 'personal'),
  purpose text NOT NULL DEFAULT 'free_conversation' CHECK (purpose = 'free_conversation'),
  consent_revision bigint NOT NULL CHECK (consent_revision >= 1),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  retention_class text NOT NULL DEFAULT 'derived' CHECK (retention_class IN ('session','account','derived')),
  source_type text NOT NULL DEFAULT 'conversation_event' CHECK (source_type = 'conversation_event'),
  source_entity_id text NOT NULL,
  immutable_source_version text NOT NULL CHECK (char_length(immutable_source_version) BETWEEN 1 AND 64),
  normalization_recipe_version text NOT NULL,
  producer_class text NOT NULL DEFAULT 'summarizer' CHECK (producer_class = 'summarizer'),
  extraction_recipe_version text NOT NULL,
  verification_recipe_version text NOT NULL,
  language text NOT NULL DEFAULT 'zh' CHECK (language ~ '^[a-z]{2}(-[A-Za-z0-9]+)?$'),
  -- 显式 status enum（非布尔汤）：draft→verified→active→superseded/invalidated/fenced→purged。
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','verified','active','superseded','invalidated','fenced','purged')),
  -- 幂等键（principal 作用域；同键重放返回既有行）。
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- 表键：owner + thread + source_range + version（append-only 身份）。
  UNIQUE (owner_user_id, thread_id, source_event_seq_start, source_event_seq_end, version)
);

CREATE INDEX memory_summary_owner_thread_idx ON memory_summary (owner_user_id, thread_id);
CREATE UNIQUE INDEX memory_summary_idempotency_idx ON memory_summary (owner_user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- C. 单向状态机 guard（白名单：只允许正向/侧向跃迁，拒绝一切回退）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION assert_memory_summary_status_oneway() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  IF NOT (
    (OLD.status = 'draft'      AND NEW.status IN ('verified','invalidated','fenced'))
    OR (OLD.status = 'verified'  AND NEW.status IN ('active','invalidated','fenced'))
    OR (OLD.status = 'active'    AND NEW.status IN ('superseded','invalidated','fenced'))
    OR (OLD.status = 'superseded' AND NEW.status = 'fenced')
    OR (OLD.status = 'invalidated' AND NEW.status = 'fenced')
    OR (OLD.status = 'fenced'    AND NEW.status = 'purged')
  ) THEN
    RAISE EXCEPTION 'memory_summary_status_oneway' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;


GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER FUNCTION assert_memory_summary_status_oneway() OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION assert_memory_summary_status_oneway() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS memory_summary_status_oneway_guard ON memory_summary;
CREATE TRIGGER memory_summary_status_oneway_guard
  BEFORE UPDATE OF status ON memory_summary
  FOR EACH ROW EXECUTE FUNCTION assert_memory_summary_status_oneway();

-- ═══════════════════════════════════════════════════════════════════════════════
-- D. 表级 ACL + RLS（FORCE + owner=principal）
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE memory_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_summary FORCE ROW LEVEL SECURITY;
REVOKE ALL ON memory_summary FROM PUBLIC, app_role;

-- 数据面 owner：runtime 只读+跃迁（verify/activate/supersede/invalidate/hydrate/replay）。
GRANT SELECT, UPDATE ON memory_summary TO memory_runtime;
-- summarizer seam：只写 draft + 幂等重放读（draft 函数内部）。
GRANT SELECT, INSERT ON memory_summary TO memory_summarizer;
-- 隐私定义者：api_owner 只 fence（SELECT/UPDATE）；worker_owner 清除（SELECT/UPDATE/DELETE）。
GRANT SELECT, UPDATE ON memory_summary TO privacy_api_owner;
GRANT SELECT, UPDATE, DELETE ON memory_summary TO privacy_worker_owner;

DO $$
BEGIN
  -- memory_runtime：数据面 owner（owner 作用域全动作）。
  DROP POLICY IF EXISTS memory_summary_runtime ON memory_summary;
  CREATE POLICY memory_summary_runtime ON memory_summary
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  -- memory_summarizer：只读自己 owner 作用域的既有 summary（draft 函数内的幂等/supersedes 查找）。
  DROP POLICY IF EXISTS memory_summary_summarizer_select ON memory_summary;
  CREATE POLICY memory_summary_summarizer_select ON memory_summary
    FOR SELECT TO memory_summarizer
    USING (owner_user_id = current_setting('app.principal_user', true));

  -- memory_summarizer：只写 draft。INSERT 的 WITH CHECK 强制 status='draft'（哪怕绕过 draft 函数
  -- 直接 raw INSERT，也无法 forge active——「summarizer 只能 draft」由 DB 承重，非代码纪律）。
  DROP POLICY IF EXISTS memory_summary_summarizer_insert ON memory_summary;
  CREATE POLICY memory_summary_summarizer_insert ON memory_summary
    FOR INSERT TO memory_summarizer
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true) AND status = 'draft');

  -- privacy_api_owner：fence 定义者（owner 作用域全动作，fence 在 target 落账前执行）。
  DROP POLICY IF EXISTS memory_summary_api_owner ON memory_summary;
  CREATE POLICY memory_summary_api_owner ON memory_summary
    FOR ALL TO privacy_api_owner
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：SELECT owner 作用域（残留计数/联表锁）。
  DROP POLICY IF EXISTS memory_summary_privacy_worker_select ON memory_summary;
  CREATE POLICY memory_summary_privacy_worker_select ON memory_summary
    FOR SELECT TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：UPDATE（fenced→purged）需 privacy_target_id 就位。
  DROP POLICY IF EXISTS memory_summary_privacy_worker_update ON memory_summary;
  CREATE POLICY memory_summary_privacy_worker_update ON memory_summary
    FOR UPDATE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL)
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

  -- privacy_worker_owner：DELETE（物理删除）需 privacy_target_id 就位。
  DROP POLICY IF EXISTS memory_summary_privacy_worker_delete ON memory_summary;
  CREATE POLICY memory_summary_privacy_worker_delete ON memory_summary
    FOR DELETE TO privacy_worker_owner
    USING (owner_user_id = current_setting('app.principal_user', true)
       AND current_setting('app.privacy_target_id', true) IS NOT NULL);
END $$;

-- summarizer 读冻结范围关系行（conversation_event 无正文，仅 digest/元数据）+ 最小审计写回。
GRANT SELECT ON conversation_event TO memory_summarizer;
DROP POLICY IF EXISTS conversation_event_memory_summarizer ON conversation_event;
CREATE POLICY conversation_event_memory_summarizer ON conversation_event
  FOR SELECT TO memory_summarizer
  USING (owner_user_id = current_setting('app.principal_user', true));
-- 最小 EXECUTE：summarizer 只借 memory_append_audit 写 owner 作用域审计（不扩任何既有角色权）。
GRANT EXECUTE ON FUNCTION memory_append_audit(text,text,jsonb,text) TO memory_summarizer;

-- ═══════════════════════════════════════════════════════════════════════════════
-- E. 结构化 claims + spanLocator 校验（内部 helper，fail-closed）
-- ═══════════════════════════════════════════════════════════════════════════════
-- spanLocator 单一坐标系固定 UTF-8 字节偏移（沿用 0095 offsetKind='utf8_byte'）：拒绝
-- code-point/UTF-16；start/end 非负整数且 0 <= start < end <= source_utf8_byte_length。
-- draft 与 verify 共用本 helper，避免两处校验漂移。
CREATE OR REPLACE FUNCTION memory_summary_assert_claims_valid(
  p_claims jsonb,
  p_source_utf8_byte_length bigint
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  claim jsonb;
  span jsonb;
  v_offset_kind text;
  v_span_start bigint;
  v_span_end bigint;
  v_text text;
  v_count integer := 0;
BEGIN
  IF p_claims IS NULL OR jsonb_typeof(p_claims) <> 'array' THEN
    RAISE EXCEPTION 'memory_summary_claims_invalid' USING ERRCODE='22023';
  END IF;
  FOR claim IN SELECT value FROM jsonb_array_elements(p_claims) LOOP
    v_count := v_count + 1;
    IF v_count > 200 THEN
      RAISE EXCEPTION 'memory_summary_claims_too_many' USING ERRCODE='22023';
    END IF;
    IF jsonb_typeof(claim) <> 'object' THEN
      RAISE EXCEPTION 'memory_summary_claim_invalid' USING ERRCODE='22023';
    END IF;
    v_text := claim->>'text';
    IF v_text IS NULL OR length(v_text)=0 OR char_length(v_text) > 2000 THEN
      RAISE EXCEPTION 'memory_summary_claim_text_invalid' USING ERRCODE='22023';
    END IF;
    span := claim->'span';
    IF span IS NULL OR jsonb_typeof(span) <> 'object' THEN
      RAISE EXCEPTION 'memory_summary_claim_span_invalid' USING ERRCODE='22023';
    END IF;
    v_offset_kind := span->>'offsetKind';
    IF v_offset_kind IS DISTINCT FROM 'utf8_byte' THEN
      RAISE EXCEPTION 'memory_summary_span_offset_kind_invalid' USING ERRCODE='22023';
    END IF;
    -- start/end 必须是整数字面量：非数值文本(22P02)/超 bigint(22003) 统一收敛为 22023。
    BEGIN
      v_span_start := (span->>'start')::bigint;
      v_span_end := (span->>'end')::bigint;
    EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
      RAISE EXCEPTION 'memory_summary_span_range_invalid' USING ERRCODE='22023';
    END;
    IF v_span_start IS NULL OR v_span_end IS NULL OR v_span_start < 0 OR v_span_end <= v_span_start THEN
      RAISE EXCEPTION 'memory_summary_span_range_invalid' USING ERRCODE='22023';
    END IF;
    IF v_span_end > p_source_utf8_byte_length THEN
      RAISE EXCEPTION 'memory_summary_span_out_of_bounds' USING ERRCODE='22023';
    END IF;
  END LOOP;
END $$;
ALTER FUNCTION memory_summary_assert_claims_valid(jsonb,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_assert_claims_valid(jsonb,bigint) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_summary_assert_claims_valid(jsonb,bigint) TO memory_summarizer;

-- ═══════════════════════════════════════════════════════════════════════════════
-- F. 写入 draft（OWNER memory_summarizer，EXECUTE 仅 summarizer）
-- ═══════════════════════════════════════════════════════════════════════════════
-- summarizer 只从冻结范围写 draft：服务端重算 source_range_digest（conversation_event 逐序
-- event_digest 聚合，与 conversation_event_range_ref 同公式）+ 校验范围连续/全 active/同
-- consent_revision+privacy_epoch+consent_purpose；content_digest 服务端重算 sha256；claims 逐
-- claim 校验 span。status 硬编码 'draft'（绝非参数），模型输出绝不 direct active。
CREATE OR REPLACE FUNCTION memory_summary_draft(
  p_thread_id text,
  p_kind text,
  p_source_event_seq_start bigint,
  p_source_event_seq_end bigint,
  p_source_artifact_digest text,
  p_source_utf8_byte_length bigint,
  p_content text,
  p_content_digest text,
  p_claims jsonb,
  p_prompt_version text,
  p_model_version text,
  p_tokenizer_version text,
  p_policy_version text,
  p_normalization_recipe_version text,
  p_extraction_recipe_version text,
  p_verification_recipe_version text,
  p_immutable_source_version text,
  p_language text,
  p_parent_summary_id uuid DEFAULT NULL,
  p_supersedes_summary_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
) RETURNS TABLE (id uuid, version bigint, status text, source_range_digest text, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_n bigint;
  v_distinct_rev bigint;
  v_distinct_epoch bigint;
  v_purpose_ok boolean;
  v_min_seq bigint;
  v_max_seq bigint;
  v_non_active bigint;
  v_agg text;
  v_consent_revision bigint;
  v_privacy_epoch bigint;
  v_range_digest text;
  v_version bigint;
  v_supersedes_version bigint;
  v_id uuid;
  v_existing_id uuid;
  v_existing_version bigint;
  v_existing_status text;
  v_existing_range_digest text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_kind NOT IN ('turn_summary','segment_summary')
     OR p_source_event_seq_start IS NULL OR p_source_event_seq_start < 1
     OR p_source_event_seq_end IS NULL OR p_source_event_seq_end < p_source_event_seq_start
     OR p_source_artifact_digest IS NULL OR p_source_artifact_digest !~ '^[a-f0-9]{64}$'
     OR p_source_utf8_byte_length IS NULL OR p_source_utf8_byte_length < 0
     OR p_source_utf8_byte_length > 10485760
     OR p_content IS NULL OR char_length(p_content) < 1 OR char_length(p_content) > 20000
     OR p_content_digest IS NULL OR p_content_digest !~ '^[a-f0-9]{64}$'
     OR p_claims IS NULL
     OR p_prompt_version IS NULL OR length(p_prompt_version)=0 OR char_length(p_prompt_version) > 128
     OR p_model_version IS NULL OR length(p_model_version)=0 OR char_length(p_model_version) > 128
     OR p_tokenizer_version IS NULL OR length(p_tokenizer_version)=0 OR char_length(p_tokenizer_version) > 128
     OR p_policy_version IS NULL OR length(p_policy_version)=0 OR char_length(p_policy_version) > 128
     OR p_normalization_recipe_version IS NULL OR length(p_normalization_recipe_version)=0 OR char_length(p_normalization_recipe_version) > 128
     OR p_extraction_recipe_version IS NULL OR length(p_extraction_recipe_version)=0 OR char_length(p_extraction_recipe_version) > 128
     OR p_verification_recipe_version IS NULL OR length(p_verification_recipe_version)=0 OR char_length(p_verification_recipe_version) > 128
     OR p_immutable_source_version IS NULL OR char_length(p_immutable_source_version) < 1 OR char_length(p_immutable_source_version) > 64
     OR p_language IS NULL OR p_language !~ '^[a-z]{2}(-[A-Za-z0-9]+)?$' THEN
    RAISE EXCEPTION 'memory_summary_draft_invalid' USING ERRCODE='22023';
  END IF;

  -- 摘要正文 digest 服务端重算（绝不采信调用方自报指纹）。
  IF p_content_digest IS DISTINCT FROM encode(digest(p_content, 'sha256'), 'hex') THEN
    RAISE EXCEPTION 'memory_summary_content_digest_mismatch' USING ERRCODE='22023';
  END IF;

  -- 结构化 claims + spanLocator 逐 claim 校验（fail-closed）。
  PERFORM memory_summary_assert_claims_valid(p_claims, p_source_utf8_byte_length);

  -- 冻结范围校验：范围必须连续、全 active、同 consent_revision/privacy_epoch/consent_purpose，
  -- 并服务端重算 source_range_digest（与 conversation_event_range_ref 同公式）。
  SELECT count(*),
         count(DISTINCT e.consent_revision),
         count(DISTINCT e.privacy_epoch),
         bool_and(e.consent_purpose = 'free_conversation'),
         min(e.sequence),
         max(e.sequence),
         count(*) FILTER (WHERE e.status <> 'active'),
         coalesce(string_agg(e.sequence::text || ':' || e.event_digest, E'\n' ORDER BY e.sequence), ''),
         min(e.consent_revision),
         min(e.privacy_epoch)
    INTO v_n, v_distinct_rev, v_distinct_epoch, v_purpose_ok, v_min_seq, v_max_seq, v_non_active,
         v_agg, v_consent_revision, v_privacy_epoch
    FROM conversation_event e
   WHERE e.owner_user_id = principal
     AND e.thread_id = p_thread_id
     AND e.sequence BETWEEN p_source_event_seq_start AND p_source_event_seq_end;

  IF v_n IS DISTINCT FROM (p_source_event_seq_end - p_source_event_seq_start + 1)
     OR v_min_seq IS DISTINCT FROM p_source_event_seq_start
     OR v_max_seq IS DISTINCT FROM p_source_event_seq_end
     OR v_non_active <> 0
     OR v_distinct_rev > 1 OR v_distinct_epoch > 1
     OR v_purpose_ok IS NOT TRUE
     OR v_consent_revision < 1 OR v_privacy_epoch < 1 THEN
    RAISE EXCEPTION 'memory_summary_source_range_not_frozen' USING ERRCODE='22023';
  END IF;

  v_range_digest := encode(digest(coalesce(v_agg, ''), 'sha256'), 'hex');
  v_range_digest := encode(digest(
    p_thread_id || ':' || p_source_event_seq_start::text || ':' || p_source_event_seq_end::text || ':' || v_range_digest,
    'sha256'), 'hex');

  -- slot 串行化：advisory 锁保证 version = MAX+1 无并发冲突。
  PERFORM pg_advisory_xact_lock(hashtext(
    'memory_summary:' || principal || ':' || p_thread_id || ':' ||
    p_source_event_seq_start::text || ':' || p_source_event_seq_end::text));

  -- 幂等重放：同 owner 同 idempotency_key 返回既有行（不双写）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT s.id, s.version, s.status, s.source_range_digest
      INTO v_existing_id, v_existing_version, v_existing_status, v_existing_range_digest
      FROM memory_summary s
     WHERE s.owner_user_id = principal AND s.idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN QUERY SELECT v_existing_id, v_existing_version, v_existing_status, v_existing_range_digest, true;
      RETURN;
    END IF;
  END IF;

  -- version：supersede 走旧版本 +1（须同 slot），否则 slot 内 MAX+1。
  IF p_supersedes_summary_id IS NOT NULL THEN
    SELECT s.version INTO v_supersedes_version
      FROM memory_summary s
     WHERE s.id = p_supersedes_summary_id AND s.owner_user_id = principal
       AND s.thread_id = p_thread_id
       AND s.source_event_seq_start = p_source_event_seq_start
       AND s.source_event_seq_end = p_source_event_seq_end;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'memory_summary_supersedes_not_found' USING ERRCODE='22023';
    END IF;
    v_version := v_supersedes_version + 1;
  ELSE
    SELECT COALESCE(MAX(s.version), 0) + 1 INTO v_version
      FROM memory_summary s
     WHERE s.owner_user_id = principal AND s.thread_id = p_thread_id
       AND s.source_event_seq_start = p_source_event_seq_start
       AND s.source_event_seq_end = p_source_event_seq_end;
  END IF;

  INSERT INTO memory_summary(
    owner_user_id, thread_id, kind, version, cas_version,
    source_event_seq_start, source_event_seq_end, source_range_digest,
    source_artifact_digest, source_utf8_byte_length,
    content, content_digest, claims,
    prompt_version, model_version, tokenizer_version, policy_version,
    parent_summary_id, supersedes_summary_id,
    controller_scope, data_subject_type, data_subject_id, scope_kind, purpose,
    consent_revision, privacy_epoch, retention_class,
    source_type, source_entity_id, immutable_source_version,
    normalization_recipe_version, producer_class, extraction_recipe_version,
    verification_recipe_version, language, status, idempotency_key
  ) VALUES (
    principal, p_thread_id, p_kind, v_version, 1,
    p_source_event_seq_start, p_source_event_seq_end, v_range_digest,
    p_source_artifact_digest, p_source_utf8_byte_length,
    p_content, p_content_digest, p_claims,
    p_prompt_version, p_model_version, p_tokenizer_version, p_policy_version,
    p_parent_summary_id, p_supersedes_summary_id,
    'c_personal', 'c_personal_user', principal, 'personal', 'free_conversation',
    v_consent_revision, v_privacy_epoch, 'derived',
    'conversation_event', p_thread_id, p_immutable_source_version,
    p_normalization_recipe_version, 'summarizer', p_extraction_recipe_version,
    p_verification_recipe_version, p_language, 'draft', p_idempotency_key
  ) RETURNING memory_summary.id INTO v_id;

  -- 复用 0093 memory_append_audit（持久有序日志，owner 作用域）。
  PERFORM memory_append_audit('memsummary:' || v_id::text, 'draft',
    jsonb_build_object('thread_id', p_thread_id, 'kind', p_kind, 'version', v_version,
      'source_seq_start', p_source_event_seq_start, 'source_seq_end', p_source_event_seq_end),
    p_idempotency_key);

  RETURN QUERY SELECT v_id, v_version, 'draft'::text, v_range_digest, false;
END $$;


GRANT CREATE ON SCHEMA public TO memory_summarizer;
ALTER FUNCTION memory_summary_draft(text,text,bigint,bigint,text,bigint,text,text,jsonb,text,text,text,text,text,text,text,text,text,uuid,uuid,text) OWNER TO memory_summarizer;
REVOKE CREATE ON SCHEMA public FROM memory_summarizer;


REVOKE ALL ON FUNCTION memory_summary_draft(text,text,bigint,bigint,text,bigint,text,text,jsonb,text,text,text,text,text,text,text,text,text,uuid,uuid,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_summary_draft(text,text,bigint,bigint,text,bigint,text,text,jsonb,text,text,text,text,text,text,text,text,text,uuid,uuid,text) TO memory_summarizer;

-- ═══════════════════════════════════════════════════════════════════════════════
-- G. 受控 verify：draft → verified（OWNER memory_runtime，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 摘要校验不通过不得成为上下文：content_digest 重算 + claims span 复核 + 来源范围仍冻结复核，
-- 全过才 CAS（cas_version+1 WHERE cas_version=expected）跃迁 draft→verified。
CREATE OR REPLACE FUNCTION memory_summary_verify(
  p_id uuid,
  p_expected_cas_version bigint
) RETURNS TABLE (id uuid, status text, cas_version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_content text;
  v_content_digest text;
  v_claims jsonb;
  v_byte_len bigint;
  v_thread text;
  v_start bigint;
  v_end bigint;
  v_active_count bigint;
  v_id uuid;
  v_status text;
  v_cas bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_expected_cas_version IS NULL OR p_expected_cas_version < 1 THEN
    RAISE EXCEPTION 'memory_summary_verify_invalid' USING ERRCODE='22023';
  END IF;

  SELECT s.content, s.content_digest, s.claims, s.source_utf8_byte_length,
         s.thread_id, s.source_event_seq_start, s.source_event_seq_end
    INTO v_content, v_content_digest, v_claims, v_byte_len, v_thread, v_start, v_end
    FROM memory_summary s
   WHERE s.id = p_id AND s.owner_user_id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_summary_verify_not_found' USING ERRCODE='42501';
  END IF;

  IF v_content_digest IS DISTINCT FROM encode(digest(v_content, 'sha256'), 'hex') THEN
    RAISE EXCEPTION 'memory_summary_content_digest_mismatch' USING ERRCODE='22023';
  END IF;
  PERFORM memory_summary_assert_claims_valid(v_claims, v_byte_len);

  -- 来源范围仍冻结（无 fence/删除漂移），否则校验不通过不得成为上下文。
  SELECT count(*) INTO v_active_count
    FROM conversation_event e
   WHERE e.owner_user_id = principal AND e.thread_id = v_thread
     AND e.sequence BETWEEN v_start AND v_end
     AND e.status = 'active';
  IF v_active_count IS DISTINCT FROM (v_end - v_start + 1) THEN
    RAISE EXCEPTION 'memory_summary_source_drifted' USING ERRCODE='22023';
  END IF;

  UPDATE memory_summary s
     SET status = 'verified', cas_version = s.cas_version + 1, updated_at = now()
   WHERE s.id = p_id AND s.owner_user_id = principal
     AND s.status = 'draft' AND s.cas_version = p_expected_cas_version
   RETURNING s.id, s.status, s.cas_version INTO v_id, v_status, v_cas;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  PERFORM memory_append_audit('memsummary:' || p_id::text, 'verify',
    jsonb_build_object('from','draft','to','verified'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_cas;
END $$;
ALTER FUNCTION memory_summary_verify(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_verify(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_verify(uuid,bigint) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- H. activate：verified → active + 自动 supersede 同 slot 旧 active
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION memory_summary_activate(
  p_id uuid,
  p_expected_cas_version bigint
) RETURNS TABLE (id uuid, status text, cas_version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_thread text;
  v_start bigint;
  v_end bigint;
  v_id uuid;
  v_status text;
  v_cas bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_expected_cas_version IS NULL OR p_expected_cas_version < 1 THEN
    RAISE EXCEPTION 'memory_summary_activate_invalid' USING ERRCODE='22023';
  END IF;

  SELECT s.thread_id, s.source_event_seq_start, s.source_event_seq_end
    INTO v_thread, v_start, v_end
    FROM memory_summary s
   WHERE s.id = p_id AND s.owner_user_id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_summary_activate_not_found' USING ERRCODE='42501';
  END IF;

  UPDATE memory_summary s
     SET status = 'active', cas_version = s.cas_version + 1, updated_at = now()
   WHERE s.id = p_id AND s.owner_user_id = principal
     AND s.status = 'verified' AND s.cas_version = p_expected_cas_version
   RETURNING s.id, s.status, s.cas_version INTO v_id, v_status, v_cas;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- 单 active 语义：同 slot 其它 active 自动 supersede（append-only，旧版本行保留，不覆盖）。
  UPDATE memory_summary s
     SET status = 'superseded', cas_version = s.cas_version + 1, updated_at = now()
   WHERE s.owner_user_id = principal AND s.thread_id = v_thread
     AND s.source_event_seq_start = v_start AND s.source_event_seq_end = v_end
     AND s.status = 'active' AND s.id <> p_id;
  PERFORM memory_append_audit('memsummary:' || p_id::text, 'activate',
    jsonb_build_object('from','verified','to','active'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_cas;
END $$;
ALTER FUNCTION memory_summary_activate(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_activate(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_activate(uuid,bigint) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- I. supersede / invalidate：显式退休（CAS 单赢家）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION memory_summary_supersede(
  p_id uuid,
  p_expected_cas_version bigint
) RETURNS TABLE (id uuid, status text, cas_version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
  v_cas bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_expected_cas_version IS NULL OR p_expected_cas_version < 1 THEN
    RAISE EXCEPTION 'memory_summary_supersede_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_summary s
     SET status = 'superseded', cas_version = s.cas_version + 1, updated_at = now()
   WHERE s.id = p_id AND s.owner_user_id = principal
     AND s.status = 'active' AND s.cas_version = p_expected_cas_version
   RETURNING s.id, s.status, s.cas_version INTO v_id, v_status, v_cas;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('memsummary:' || p_id::text, 'supersede',
    jsonb_build_object('from','active','to','superseded'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_cas;
END $$;
ALTER FUNCTION memory_summary_supersede(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_supersede(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_supersede(uuid,bigint) TO app_role;

CREATE OR REPLACE FUNCTION memory_summary_invalidate(
  p_id uuid,
  p_expected_cas_version bigint
) RETURNS TABLE (id uuid, status text, cas_version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
  v_cas bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_expected_cas_version IS NULL OR p_expected_cas_version < 1 THEN
    RAISE EXCEPTION 'memory_summary_invalidate_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE memory_summary s
     SET status = 'invalidated', cas_version = s.cas_version + 1, updated_at = now()
   WHERE s.id = p_id AND s.owner_user_id = principal
     AND s.status IN ('verified','active') AND s.cas_version = p_expected_cas_version
   RETURNING s.id, s.status, s.cas_version INTO v_id, v_status, v_cas;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('memsummary:' || p_id::text, 'invalidate',
    jsonb_build_object('to','invalidated'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_cas;
END $$;
ALTER FUNCTION memory_summary_invalidate(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_invalidate(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_invalidate(uuid,bigint) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- J. 读取面：hydrate（进上下文，仅 active）+ replay（恢复，非 fenced/purged）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION memory_summary_hydrate(
  p_thread_id text
) RETURNS TABLE (
  id uuid, kind text, version bigint, cas_version bigint,
  source_event_seq_start bigint, source_event_seq_end bigint, source_range_digest text,
  source_artifact_digest text, source_utf8_byte_length bigint,
  content text, content_digest text, claims jsonb,
  prompt_version text, model_version text, tokenizer_version text, policy_version text,
  parent_summary_id uuid, supersedes_summary_id uuid, status text, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_thread_id IS NULL OR length(p_thread_id)=0 THEN
    RAISE EXCEPTION 'memory_summary_hydrate_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT s.id, s.kind, s.version, s.cas_version,
           s.source_event_seq_start, s.source_event_seq_end, s.source_range_digest,
           s.source_artifact_digest, s.source_utf8_byte_length,
           s.content, s.content_digest, s.claims,
           s.prompt_version, s.model_version, s.tokenizer_version, s.policy_version,
           s.parent_summary_id, s.supersedes_summary_id, s.status, s.created_at
      FROM memory_summary s
     WHERE s.owner_user_id = principal AND s.thread_id = p_thread_id
       AND s.status = 'active'
     ORDER BY s.source_event_seq_start, s.source_event_seq_end, s.version;
END $$;
ALTER FUNCTION memory_summary_hydrate(text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_hydrate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_hydrate(text) TO app_role;

CREATE OR REPLACE FUNCTION memory_summary_replay(
  p_thread_id text
) RETURNS TABLE (
  id uuid, kind text, version bigint, cas_version bigint,
  source_event_seq_start bigint, source_event_seq_end bigint, source_range_digest text,
  source_artifact_digest text, source_utf8_byte_length bigint,
  content text, content_digest text, claims jsonb,
  prompt_version text, model_version text, tokenizer_version text, policy_version text,
  parent_summary_id uuid, supersedes_summary_id uuid, status text, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_thread_id IS NULL OR length(p_thread_id)=0 THEN
    RAISE EXCEPTION 'memory_summary_replay_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT s.id, s.kind, s.version, s.cas_version,
           s.source_event_seq_start, s.source_event_seq_end, s.source_range_digest,
           s.source_artifact_digest, s.source_utf8_byte_length,
           s.content, s.content_digest, s.claims,
           s.prompt_version, s.model_version, s.tokenizer_version, s.policy_version,
           s.parent_summary_id, s.supersedes_summary_id, s.status, s.created_at
      FROM memory_summary s
     WHERE s.owner_user_id = principal AND s.thread_id = p_thread_id
       AND s.status IN ('draft','verified','active','superseded','invalidated')
     ORDER BY s.source_event_seq_start, s.source_event_seq_end, s.version;
END $$;
ALTER FUNCTION memory_summary_replay(text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_replay(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_replay(text) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- K. 补偿控制：进上下文前复核 live 状态（围栏先赢 → voided，防复活）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION memory_summary_dispatch_hydrate(
  p_id uuid,
  p_observed_status text
) RETURNS TABLE (id uuid, status text, dispatch_decision integer, void_reason text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  row memory_summary%ROWTYPE;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_id IS NULL
     OR p_observed_status NOT IN ('draft','verified','active','superseded','invalidated','fenced','purged') THEN
    RAISE EXCEPTION 'memory_summary_dispatch_invalid' USING ERRCODE='22023';
  END IF;
  SELECT * INTO row FROM memory_summary s
   WHERE s.id = p_id AND s.owner_user_id = principal;
  IF NOT FOUND THEN
    RETURN QUERY SELECT p_id, 'purged'::text, 0, 'purged';
    RETURN;
  END IF;
  IF row.status = 'fenced' THEN
    RETURN QUERY SELECT row.id, row.status, 0, 'fence_first';
    RETURN;
  END IF;
  IF row.status <> p_observed_status THEN
    RETURN QUERY SELECT row.id, row.status, 0, 'status_drift';
    RETURN;
  END IF;
  RETURN QUERY SELECT row.id, row.status, 1, NULL::text;
END $$;
ALTER FUNCTION memory_summary_dispatch_hydrate(uuid,text) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION memory_summary_dispatch_hydrate(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_dispatch_hydrate(uuid,text) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- L. 账户删除等价 sweep（API 阶段，OWNER privacy_api_owner，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 镜像 0111 conversation_event_begin_erasure：同步 fence 全部 live summary → fenced（cas_version+1）
-- → 建 account_data request → 枚举 1 个 memory_summary sink target → 就地算 target_set_digest
-- → request→fenced。幂等：同 owner 同 idempotency_key_hash 重放返回既有 1 行。
CREATE OR REPLACE FUNCTION memory_summary_begin_erasure(
  p_idempotency_key_hash text
) RETURNS TABLE (
  request_id uuid, request_status text, privacy_epoch bigint, target_set_digest text,
  sink text, resource_hmac text, replayed boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  existing privacy_erasure_request%ROWTYPE;
  new_epoch bigint;
  v_request uuid;
  v_digest text;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_idempotency_key_hash IS NULL OR p_idempotency_key_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'memory_summary_erasure_invalid' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM user_account ua WHERE ua.id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_summary_erasure_account_not_found' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id = principal AND r.idempotency_key_hash = p_idempotency_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'account_data' OR existing.subject_id <> principal THEN
      RAISE EXCEPTION 'memory_summary_erasure_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY
      SELECT d.request_id, r2.status, r2.privacy_epoch, r2.target_set_digest, d.sink, d.resource_hmac, true
        FROM privacy_deletion_target d
        JOIN privacy_erasure_request r2 ON r2.id = d.request_id
       WHERE d.request_id = existing.id
       ORDER BY d.sink;
    RETURN;
  END IF;

  SELECT COALESCE(MAX(s.privacy_epoch), 0) + 1 INTO new_epoch
    FROM memory_summary s WHERE s.owner_user_id = principal;

  UPDATE memory_summary
     SET status='fenced', cas_version=cas_version+1, updated_at=now()
   WHERE owner_user_id = principal AND status IN ('draft','verified','active','superseded','invalidated');

  INSERT INTO privacy_erasure_request(owner_user_id, scope, subject_id, idempotency_key_hash, status, privacy_epoch)
    VALUES (principal, 'account_data', principal, p_idempotency_key_hash, 'requested', new_epoch)
    RETURNING id INTO v_request;

  INSERT INTO privacy_deletion_target(request_id, sink, resource_hmac, status)
    VALUES (v_request, 'memory_summary',
      encode(hmac(principal || ':' || 'memory_summary' || ':' || v_request::text, p_idempotency_key_hash, 'sha256'), 'hex'),
      'pending');

  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO v_digest FROM privacy_deletion_target d WHERE d.request_id = v_request;

  UPDATE privacy_erasure_request r
     SET status='fenced', target_set_digest=v_digest, updated_at=now(), version=r.version+1
   WHERE r.id=v_request AND r.status='requested'
   RETURNING r.status INTO v_status;

  RETURN QUERY
    SELECT d.request_id, v_status, new_epoch, v_digest, d.sink, d.resource_hmac, false
      FROM privacy_deletion_target d WHERE d.request_id = v_request ORDER BY d.sink;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_api_owner;
ALTER FUNCTION memory_summary_begin_erasure(text) OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION memory_summary_begin_erasure(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_begin_erasure(text) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- M. 删除侧受约束 claim（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 镜像 0111 privacy_authorization_claim_conversation_event_target 的活重验，sink 白名单换成
-- memory_summary：purpose=account_data_erasure + scope=account_data + sink='memory_summary'。
CREATE OR REPLACE FUNCTION privacy_authorization_claim_memory_summary_target(
  p_jti text,
  p_target uuid,
  p_worker text,
  p_lease_seconds integer DEFAULT 60
) RETURNS TABLE (target_id uuid, lease_token uuid, status text, attempt integer)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  snap privacy_authorization_snapshot%ROWTYPE;
  target_row record;
  live_digest text;
  token uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_jti IS NULL OR length(p_jti)=0 OR p_target IS NULL OR p_worker IS NULL OR length(p_worker)=0
     OR p_lease_seconds < 5 OR p_lease_seconds > 600 THEN
    RAISE EXCEPTION 'privacy_authorization_claim_invalid' USING ERRCODE='22023';
  END IF;

  SELECT * INTO snap FROM privacy_authorization_snapshot
   WHERE privacy_authorization_snapshot.jti = p_jti FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_found' USING ERRCODE='42501';
  END IF;
  IF snap.issuer_id <> 'meetwise-privacy-authz-v1' THEN
    RAISE EXCEPTION 'privacy_authorization_issuer_mismatch' USING ERRCODE='42501';
  END IF;
  IF snap.status <> 'consumed' THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_not_consumed' USING ERRCODE='42501';
  END IF;
  IF snap.expires_at <= now() THEN
    RAISE EXCEPTION 'privacy_authorization_snapshot_expired' USING ERRCODE='40901';
  END IF;
  IF snap.owner_user_id IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'privacy_authorization_owner_mismatch' USING ERRCODE='42501';
  END IF;

  SELECT t.*, r.owner_user_id AS request_owner, r.scope, r.subject_id,
         r.privacy_epoch AS request_epoch, r.target_set_digest AS request_digest,
         r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  IF target_row.request_owner IS DISTINCT FROM snap.owner_user_id
     OR target_row.request_owner IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'privacy_authorization_owner_mismatch' USING ERRCODE='42501';
  END IF;
  IF NOT (snap.purpose = 'account_data_erasure' AND target_row.scope = 'account_data') THEN
    RAISE EXCEPTION 'privacy_authorization_scope_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.sink <> 'memory_summary' THEN
    RAISE EXCEPTION 'privacy_authorization_sink_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.subject_id IS DISTINCT FROM snap.interview_id THEN
    RAISE EXCEPTION 'privacy_authorization_subject_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.request_epoch IS NULL OR target_row.request_epoch <> snap.privacy_epoch THEN
    RAISE EXCEPTION 'privacy_authorization_epoch_mismatch' USING ERRCODE='42501';
  END IF;
  IF target_row.request_digest IS NULL OR target_row.request_digest <> snap.target_set_digest THEN
    RAISE EXCEPTION 'privacy_authorization_digest_mismatch' USING ERRCODE='42501';
  END IF;

  SELECT encode(digest(string_agg(d.sink || ':' || d.resource_hmac, E'\n' ORDER BY d.sink, d.resource_hmac), 'sha256'), 'hex')
    INTO live_digest
    FROM privacy_deletion_target d
   WHERE d.request_id = target_row.request_id;
  IF live_digest IS DISTINCT FROM target_row.request_digest THEN
    RAISE EXCEPTION 'privacy_authorization_target_drift' USING ERRCODE='42501';
  END IF;

  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RETURN;
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, target_row.lease_token, target_row.status, target_row.attempts;
    RETURN;
  END IF;
  IF target_row.status = 'leased' AND target_row.lease_expires_at >= now() THEN
    RETURN;
  END IF;
  IF target_row.status NOT IN ('pending','leased','failed') THEN
    RETURN;
  END IF;

  token := gen_random_uuid();
  UPDATE privacy_deletion_target AS d
     SET status='leased', lease_owner=p_worker, lease_token=token,
         lease_expires_at=now()+(p_lease_seconds||' seconds')::interval,
         attempts=d.attempts+1, version=d.version+1, updated_at=now(), last_error_code=NULL
   WHERE d.id = target_row.id AND d.version = target_row.version
   RETURNING d.id, d.lease_token, d.status, d.attempts INTO target_id, lease_token, status, attempt;
  IF NOT FOUND THEN RETURN; END IF;
  RETURN NEXT;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_authorization_claim_memory_summary_target(text,uuid,text,integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_authorization_claim_memory_summary_target(text,uuid,text,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_authorization_claim_memory_summary_target(text,uuid,text,integer) TO privacy_worker_executor;

-- ═══════════════════════════════════════════════════════════════════════════════
-- N. 删除侧物理清除（OWNER privacy_worker_owner，EXECUTE privacy_worker_executor）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 先正向跃迁 fenced→purged（cas_version+1，使 purged 真可达），再物理 DELETE（删后 read=0），
-- 残留=0 校验 fail-closed。
CREATE OR REPLACE FUNCTION privacy_purge_memory_summary_target(
  p_target uuid,
  p_token uuid
) RETURNS TABLE (target_id uuid, status text, deleted_count bigint, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  target_row record;
  removed bigint := 0;
  remaining bigint := 0;
  final_request_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_token IS NULL THEN
    RAISE EXCEPTION 'memory_summary_purge_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.id, t.request_id, t.status, t.lease_token, t.lease_expires_at, t.version, t.sink,
         r.owner_user_id, r.status AS request_status
    INTO target_row
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target FOR UPDATE;
  IF NOT FOUND OR target_row.owner_user_id <> principal THEN
    RAISE EXCEPTION 'memory_summary_target_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF target_row.request_status NOT IN ('fenced','purging','pending_external') THEN
    RAISE EXCEPTION 'memory_summary_target_request_not_active' USING ERRCODE='42501';
  END IF;
  IF target_row.status = 'erased' THEN
    RETURN QUERY SELECT target_row.id, 'erased'::text, 0::bigint, target_row.request_status;
    RETURN;
  END IF;
  IF target_row.status <> 'leased' OR target_row.lease_token IS DISTINCT FROM p_token
     OR target_row.lease_expires_at < now() THEN
    RAISE EXCEPTION 'memory_summary_target_lease_lost' USING ERRCODE='42501';
  END IF;

  PERFORM set_config('app.privacy_target_id', target_row.id::text, true);
  PERFORM set_config('app.privacy_lease_token', p_token::text, true);

  IF target_row.sink = 'memory_summary' THEN
    UPDATE memory_summary AS s
       SET status='purged', cas_version=s.cas_version+1, updated_at=now()
     WHERE s.owner_user_id = principal AND s.status = 'fenced';
    DELETE FROM memory_summary WHERE owner_user_id = principal;
    GET DIAGNOSTICS removed = ROW_COUNT;
    SELECT count(*) INTO remaining FROM memory_summary WHERE owner_user_id = principal;
  ELSE
    RAISE EXCEPTION 'memory_summary_target_locator_unknown' USING ERRCODE='42501';
  END IF;
  IF remaining <> 0 THEN
    RAISE EXCEPTION 'memory_summary_target_residual_rows' USING ERRCODE='55000';
  END IF;

  UPDATE privacy_deletion_target AS d
     SET status='erased', deleted_count=removed,
         receipt_hash=encode(digest(d.id::text || ':' || p_token::text || ':' || removed::text, 'sha256'),'hex'),
         lease_owner=NULL, lease_token=NULL, lease_expires_at=NULL, version=d.version+1, updated_at=now()
   WHERE d.id = target_row.id AND d.status='leased' AND d.lease_token=p_token AND d.version=target_row.version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_summary_target_complete_cas_lost' USING ERRCODE='40001';
  END IF;

  UPDATE privacy_erasure_request AS r
     SET status=CASE
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status IN ('pending','leased')) THEN 'purging'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='external_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='retention_pending') THEN 'pending_external'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=r.id AND rc.receipt_kind='failed_cleanup') THEN 'partial_failed'
       WHEN EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=r.id AND t.status='failed') THEN 'partial_failed'
       ELSE 'completed' END,
       version=r.version+1, updated_at=now()
   WHERE r.id=target_row.request_id
   RETURNING r.status INTO final_request_status;
  RETURN QUERY SELECT target_row.id, 'erased'::text, removed, final_request_status;
END $$;
ALTER FUNCTION privacy_purge_memory_summary_target(uuid,uuid) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;


REVOKE ALL ON FUNCTION privacy_purge_memory_summary_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_memory_summary_target(uuid,uuid) TO privacy_worker_executor;

-- runtime login 永不通过 membership 漂移成为 summarizer（防漂移，镜像 0093/0096/0111）。
REVOKE memory_summarizer FROM app_role;
