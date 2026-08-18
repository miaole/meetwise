-- ═══════════════════════════════════════════════════════════════════════════════
-- 0115 CTX-04：可验证压缩快照（verifiable compression snapshot）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 把「按 service 字符上限头部截断」升级为「可重放压缩边界」：每个 snapshot 固化
--   事件范围（source_event_seq_start/end）+ 原始 checksum（source_range_digest，SQL 重算）
--   + 策略/提示词/模型/tokenizer 版本 + 摘要 hash（summary_content_digest，服务端重算 sha256）
--   + claim→来源 span（summary_claims jsonb，每 claim 带 utf8_byte span）
--   + first_kept_event_id（DB 确定性派生 = source_event_seq_end+1 的 active 事件）+ 显式状态 enum。
--
-- 承重铁律（对齐 CLAUDE.md / memory-context-design.md §5）：
--   1. snapshot 是「压缩边界」对象，**不是**记忆召回快照——不复用 MEM-14 的
--      memory_context_snapshot（语义不同）。
--   2. 原事件不可改写：conversation_event append-only，本迁移**不含任何**对 conversation_event
--      的 UPDATE/DELETE 语句；app_role 对 conversation_event 无 UPDATE/DELETE（0108 已 REVOKE）。
--   3. claim 回溯校验：span 落在 source range 内（offsetKind=utf8_byte + start<end<=字节长）+
--      逐字节重算 digest 匹配（source_range_digest 由事件链重算；source_artifact_digest 字节级
--      由域层 traceCompressionSnapshotClaims 重算）。任一 claim 无法回溯 → 丢弃该摘要（snapshot
--      不 active），**绝不 call 模型补全**（本迁移零模型调用）。
--   4. firstKeptEventId 边界：source_event_seq_end < sequence(first_kept_event_id)，DB 派生
--      （= end+1 的 active 事件），同 source range 同 digest → 同 firstKeptEventId（重放一致性）。
--   5. 四原语复用不重实现：①CAS（cas_version+1 WHERE cas_version=expected）②幂等（partial
--      UNIQUE(owner,idempotency_key)）③RLS（FORCE owner=principal）④memory_append_audit 有序日志。
--   6. 显式状态机（禁布尔汤）：draft → active/superseded/fenced → purged，单向（回退被触发器拒）。
--
-- 诚实标注（非目标）：
--   · 本迁移**不接删除 resolver**（begin/claim/purge 归 CTX-06，fenced/purged 只声明状态 +
--     单向 guard）；不实现真实 tokenizer（MODEL-OP）；不实现 MEM-03 树 / MEM-14 快照；不改冻结
--     迁移 0108/0111/0112/0113。
--   · seam-before-wiring：`source_artifact_digest`/`source_utf8_byte_length` 在 DB 边界仅格式
--     校验、信任调用方入参（DB 无解密源文本、不可重算原文），claim span 上界比对用的是调用方
--     提供的 `p_source_utf8_byte_length`（非重算长度）；字节级重算由域原语
--     `traceCompressionSnapshotClaims` 承担，须由具备解密源文本的 worker 侧接线后调用，当前为
--     零生产调用方的 seam-before-wiring 原语。
--   · 删除未闭合：本表 owner 级、含明文 `summary_claims.text` 派生摘要 claim 文本（可含 PII），
--     `privacy_deletion_target.sink` 无本表、账户删除暂成孤儿（删除归 CTX-06）。
--   · supersede 匹配键是精确 (start,end)，**非重叠区间**；重叠不同 range 可并存多 active，重叠
--     区间协调归 CTX-05。
--   · replay 只 SELECT 读存储行回放、不重算 digest；重放一致性由 draft 时服务端确定性派生
--     （source_range_digest/summary_content_digest）承重，重放读回比对。

-- ═══════════════════════════════════════════════════════════════════════════════
-- A. 表：context_compression_snapshot（压缩边界快照，append-only 派生对象）
-- ═══════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS context_compression_snapshot CASCADE;
CREATE TABLE context_compression_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  thread_id text NOT NULL,
  -- 事件范围（被摘要覆盖的连续来源事件范围，事件序）
  source_event_seq_start bigint NOT NULL CHECK (source_event_seq_start >= 1),
  source_event_seq_end bigint NOT NULL CHECK (source_event_seq_end >= source_event_seq_start),
  -- 原始范围 checksum（source_range_digest，SQL 重算：thread+from+to+逐事件 digest 聚合）。
  source_range_digest text NOT NULL CHECK (source_range_digest ~ '^[a-f0-9]{64}$'),
  -- 原文 digest（sha256 拼接正文）+ UTF-8 字节长（claim span 上界校验用）。
  source_artifact_digest text NOT NULL CHECK (source_artifact_digest ~ '^[a-f0-9]{64}$'),
  source_utf8_byte_length bigint NOT NULL CHECK (source_utf8_byte_length >= 0),
  -- 策略/提示词/模型/tokenizer 版本（重放/调参用，逐 snapshot 固化）。
  policy_version text NOT NULL,
  prompt_version text NOT NULL,
  model_version text NOT NULL,
  tokenizer_version text NOT NULL,
  -- 引用的 summary：摘要 hash（content_digest，服务端重算 sha256）+ claims（含 span）。
  -- 不存 summary 正文（正文留在 memory_summary）；不存 summary_id（引用按 hash，非 FK）。
  summary_content_digest text NOT NULL CHECK (summary_content_digest ~ '^[a-f0-9]{64}$'),
  summary_claims jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- 压缩边界：保留的最新完整 turn 从该事件起（DB 派生 = source_event_seq_end+1 的 active 事件）。
  -- 事件反向引用（无 FK，避免 RLS 下跨表 FK 校验读面放大，同 conversation_event_artifact）。
  first_kept_event_id uuid NOT NULL,
  -- 显式 status enum（非布尔汤）：draft→active→superseded/fenced→purged。
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','active','superseded','fenced','purged')),
  -- CAS 乐观并发版本（状态跃迁时 +1）。
  cas_version bigint NOT NULL DEFAULT 1 CHECK (cas_version >= 1),
  -- 幂等键（principal 作用域；同键重放返回既有行）。
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX context_compression_snapshot_owner_thread_idx
  ON context_compression_snapshot (owner_user_id, thread_id);
CREATE UNIQUE INDEX context_compression_snapshot_idempotency_idx
  ON context_compression_snapshot (owner_user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- B. 单向状态机 guard（白名单：只允许正向跃迁，拒绝一切回退）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION assert_context_compression_snapshot_status_oneway() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  IF NOT (
    (OLD.status = 'draft'      AND NEW.status IN ('active','fenced'))
    OR (OLD.status = 'active'    AND NEW.status IN ('superseded','fenced'))
    OR (OLD.status = 'superseded' AND NEW.status = 'fenced')
    OR (OLD.status = 'fenced'    AND NEW.status = 'purged')
  ) THEN
    RAISE EXCEPTION 'context_compression_snapshot_status_oneway' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;


GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER FUNCTION assert_context_compression_snapshot_status_oneway() OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION assert_context_compression_snapshot_status_oneway() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS context_compression_snapshot_status_oneway_guard ON context_compression_snapshot;
CREATE TRIGGER context_compression_snapshot_status_oneway_guard
  BEFORE UPDATE OF status ON context_compression_snapshot
  FOR EACH ROW EXECUTE FUNCTION assert_context_compression_snapshot_status_oneway();

-- ═══════════════════════════════════════════════════════════════════════════════
-- C. 表级 ACL + RLS（FORCE + owner=principal）
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE context_compression_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_compression_snapshot FORCE ROW LEVEL SECURITY;
REVOKE ALL ON context_compression_snapshot FROM PUBLIC, app_role;

-- 数据面 owner：memory_runtime 只读 + 跃迁（draft/activate/supersede/hydrate/replay）。
GRANT SELECT, INSERT, UPDATE ON context_compression_snapshot TO memory_runtime;

DO $$
BEGIN
  DROP POLICY IF EXISTS context_compression_snapshot_runtime ON context_compression_snapshot;
  CREATE POLICY context_compression_snapshot_runtime ON context_compression_snapshot
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- 读冻结范围关系行（conversation_event 无正文，仅 digest/元数据）供 draft 重算 range digest。
-- conversation_event 的 SELECT 已由 0108 授 memory_runtime，本迁移不重复授权。

-- ═══════════════════════════════════════════════════════════════════════════════
-- D. 结构化 claims + spanLocator 校验（内部 helper，fail-closed）
-- ═══════════════════════════════════════════════════════════════════════════════
-- spanLocator 单一坐标系固定 UTF-8 字节偏移（沿用 0095 offsetKind='utf8_byte'）：拒绝
-- code-point/UTF-16；start/end 非负整数且 0 <= start < end <= source_utf8_byte_length。
CREATE OR REPLACE FUNCTION context_compression_snapshot_assert_claims_valid(
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
    RAISE EXCEPTION 'ctx04_claims_invalid' USING ERRCODE='22023';
  END IF;
  FOR claim IN SELECT value FROM jsonb_array_elements(p_claims) LOOP
    v_count := v_count + 1;
    IF v_count > 200 THEN
      RAISE EXCEPTION 'ctx04_claims_too_many' USING ERRCODE='22023';
    END IF;
    IF jsonb_typeof(claim) <> 'object' THEN
      RAISE EXCEPTION 'ctx04_claim_invalid' USING ERRCODE='22023';
    END IF;
    v_text := claim->>'text';
    IF v_text IS NULL OR length(v_text)=0 OR char_length(v_text) > 2000 THEN
      RAISE EXCEPTION 'ctx04_claim_text_invalid' USING ERRCODE='22023';
    END IF;
    span := claim->'span';
    IF span IS NULL OR jsonb_typeof(span) <> 'object' THEN
      RAISE EXCEPTION 'ctx04_claim_span_invalid' USING ERRCODE='22023';
    END IF;
    v_offset_kind := span->>'offsetKind';
    IF v_offset_kind IS DISTINCT FROM 'utf8_byte' THEN
      RAISE EXCEPTION 'ctx04_span_offset_kind_invalid' USING ERRCODE='22023';
    END IF;
    BEGIN
      v_span_start := (span->>'start')::bigint;
      v_span_end := (span->>'end')::bigint;
    EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
      RAISE EXCEPTION 'ctx04_span_range_invalid' USING ERRCODE='22023';
    END;
    IF v_span_start IS NULL OR v_span_end IS NULL OR v_span_start < 0 OR v_span_end <= v_span_start THEN
      RAISE EXCEPTION 'ctx04_span_range_invalid' USING ERRCODE='22023';
    END IF;
    IF v_span_end > p_source_utf8_byte_length THEN
      RAISE EXCEPTION 'ctx04_span_out_of_bounds' USING ERRCODE='22023';
    END IF;
  END LOOP;
END $$;
ALTER FUNCTION context_compression_snapshot_assert_claims_valid(jsonb,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_snapshot_assert_claims_valid(jsonb,bigint) FROM PUBLIC, app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- E. 写入 draft（OWNER memory_runtime，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 从冻结范围写 draft：服务端重算 source_range_digest（与 conversation_event_range_ref 同公式）
-- + 校验范围连续/全 active/同 consent_revision+privacy_epoch+consent_purpose；summary_content_digest
-- 服务端重算 sha256（摘要 hash 不得采信自报指纹）；claims 逐 claim 校验 span；first_kept_event_id
-- 由 DB 确定性派生（= source_event_seq_end+1 的 active 事件）。status 硬编码 'draft'（绝非参数），
-- 模型输出绝不 direct active（activate 是分离命令，需重验 claim 回溯 + CAS）。
CREATE OR REPLACE FUNCTION context_compression_snapshot_draft(
  p_thread_id text,
  p_source_event_seq_start bigint,
  p_source_event_seq_end bigint,
  p_source_artifact_digest text,
  p_source_utf8_byte_length bigint,
  p_summary_content text,
  p_summary_content_digest text,
  p_summary_claims jsonb,
  p_policy_version text,
  p_prompt_version text,
  p_model_version text,
  p_tokenizer_version text,
  p_idempotency_key text DEFAULT NULL
) RETURNS TABLE (
  id uuid, status text, source_range_digest text, summary_content_digest text,
  first_kept_event_id uuid, cas_version bigint, replayed boolean
)
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
  v_range_digest text;
  v_content_digest text;
  v_first_kept uuid;
  v_existing_id uuid;
  v_existing_status text;
  v_existing_range_digest text;
  v_existing_summary_digest text;
  v_existing_first_kept uuid;
  v_existing_cas bigint;
  v_id uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_source_event_seq_start IS NULL OR p_source_event_seq_start < 1
     OR p_source_event_seq_end IS NULL OR p_source_event_seq_end < p_source_event_seq_start
     OR p_source_artifact_digest IS NULL OR p_source_artifact_digest !~ '^[a-f0-9]{64}$'
     OR p_source_utf8_byte_length IS NULL OR p_source_utf8_byte_length < 0
     OR p_source_utf8_byte_length > 10485760
     OR p_summary_content IS NULL OR char_length(p_summary_content) < 1 OR char_length(p_summary_content) > 20000
     OR p_summary_content_digest IS NULL OR p_summary_content_digest !~ '^[a-f0-9]{64}$'
     OR p_summary_claims IS NULL
     OR p_policy_version IS NULL OR length(p_policy_version)=0 OR char_length(p_policy_version) > 128
     OR p_prompt_version IS NULL OR length(p_prompt_version)=0 OR char_length(p_prompt_version) > 128
     OR p_model_version IS NULL OR length(p_model_version)=0 OR char_length(p_model_version) > 128
     OR p_tokenizer_version IS NULL OR length(p_tokenizer_version)=0 OR char_length(p_tokenizer_version) > 128 THEN
    RAISE EXCEPTION 'ctx04_draft_invalid' USING ERRCODE='22023';
  END IF;

  -- 摘要 hash 服务端重算（绝不采信调用方自报指纹）。
  v_content_digest := encode(digest(p_summary_content, 'sha256'), 'hex');
  IF p_summary_content_digest IS DISTINCT FROM v_content_digest THEN
    RAISE EXCEPTION 'ctx04_content_digest_mismatch' USING ERRCODE='22023';
  END IF;

  -- 结构化 claims + spanLocator 逐 claim 校验（fail-closed：span 越界 → 丢弃，绝不落半写）。
  PERFORM context_compression_snapshot_assert_claims_valid(p_summary_claims, p_source_utf8_byte_length);

  -- 冻结范围校验：范围必须连续、全 active、同 consent_revision/privacy_epoch/consent_purpose，
  -- 并服务端重算 source_range_digest（与 conversation_event_range_ref 同公式）。
  SELECT count(*),
         count(DISTINCT e.consent_revision),
         count(DISTINCT e.privacy_epoch),
         bool_and(e.consent_purpose = 'free_conversation'),
         min(e.sequence),
         max(e.sequence),
         count(*) FILTER (WHERE e.status <> 'active'),
         coalesce(string_agg(e.sequence::text || ':' || e.event_digest, E'\n' ORDER BY e.sequence), '')
    INTO v_n, v_distinct_rev, v_distinct_epoch, v_purpose_ok, v_min_seq, v_max_seq, v_non_active, v_agg
    FROM conversation_event e
   WHERE e.owner_user_id = principal
     AND e.thread_id = p_thread_id
     AND e.sequence BETWEEN p_source_event_seq_start AND p_source_event_seq_end;

  IF v_n IS DISTINCT FROM (p_source_event_seq_end - p_source_event_seq_start + 1)
     OR v_min_seq IS DISTINCT FROM p_source_event_seq_start
     OR v_max_seq IS DISTINCT FROM p_source_event_seq_end
     OR v_non_active <> 0
     OR v_distinct_rev > 1 OR v_distinct_epoch > 1
     OR v_purpose_ok IS NOT TRUE THEN
    RAISE EXCEPTION 'ctx04_source_range_not_frozen' USING ERRCODE='22023';
  END IF;

  v_range_digest := encode(digest(coalesce(v_agg, ''), 'sha256'), 'hex');
  v_range_digest := encode(digest(
    p_thread_id || ':' || p_source_event_seq_start::text || ':' || p_source_event_seq_end::text || ':' || v_range_digest,
    'sha256'), 'hex');

  -- firstKeptEventId 边界（DB 确定性派生）：压缩边界 = 摘要覆盖 [start..end]，保留的最新完整
  -- turn 从 source_event_seq_end+1 的 active 事件起。同 range 同 digest → 同 firstKeptEventId。
  SELECT e.id INTO v_first_kept
    FROM conversation_event e
   WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id
     AND e.sequence = p_source_event_seq_end + 1
     AND e.status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ctx04_no_kept_boundary' USING ERRCODE='22023';
  END IF;

  -- slot 串行化：advisory 锁保证幂等/并发安全。
  PERFORM pg_advisory_xact_lock(hashtext(
    'ctx04_snapshot:' || principal || ':' || p_thread_id || ':' ||
    p_source_event_seq_start::text || ':' || p_source_event_seq_end::text));

  -- 幂等重放：同 owner 同 idempotency_key 返回既有行（不双写）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT s.id, s.status, s.source_range_digest, s.summary_content_digest, s.first_kept_event_id, s.cas_version
      INTO v_existing_id, v_existing_status, v_existing_range_digest, v_existing_summary_digest, v_existing_first_kept, v_existing_cas
      FROM context_compression_snapshot s
     WHERE s.owner_user_id = principal AND s.idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN QUERY SELECT v_existing_id, v_existing_status, v_existing_range_digest,
        v_existing_summary_digest, v_existing_first_kept, v_existing_cas, true;
      RETURN;
    END IF;
  END IF;

  INSERT INTO context_compression_snapshot(
    owner_user_id, thread_id,
    source_event_seq_start, source_event_seq_end, source_range_digest,
    source_artifact_digest, source_utf8_byte_length,
    policy_version, prompt_version, model_version, tokenizer_version,
    summary_content_digest, summary_claims, first_kept_event_id,
    status, cas_version, idempotency_key
  ) VALUES (
    principal, p_thread_id,
    p_source_event_seq_start, p_source_event_seq_end, v_range_digest,
    p_source_artifact_digest, p_source_utf8_byte_length,
    p_policy_version, p_prompt_version, p_model_version, p_tokenizer_version,
    v_content_digest, p_summary_claims, v_first_kept,
    'draft', 1, p_idempotency_key
  ) RETURNING context_compression_snapshot.id INTO v_id;

  -- 复用 0093 memory_append_audit（持久有序日志，owner 作用域）。
  PERFORM memory_append_audit('ctx04_snapshot:' || v_id::text, 'draft',
    jsonb_build_object('thread_id', p_thread_id, 'source_seq_start', p_source_event_seq_start,
      'source_seq_end', p_source_event_seq_end, 'first_kept_event_id', v_first_kept),
    p_idempotency_key);

  RETURN QUERY SELECT v_id, 'draft'::text, v_range_digest, v_content_digest, v_first_kept, 1::bigint, false;
END $$;
ALTER FUNCTION context_compression_snapshot_draft(text,bigint,bigint,text,bigint,text,text,jsonb,text,text,text,text,text)
  OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_snapshot_draft(text,bigint,bigint,text,bigint,text,text,jsonb,text,text,text,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION context_compression_snapshot_draft(text,bigint,bigint,text,bigint,text,text,jsonb,text,text,text,text,text) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- F. 受控 activate：draft → active（重验 claim 回溯 + CAS 单赢家）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 摘要校验不通过不得成为上下文：激活前重验 summary_claims span 仍落在 source range 内 +
-- 来源范围仍冻结（source_range_digest 事件链重算一致），全过才 CAS 跃迁 draft→active，并自动
-- supersede 同 (thread, range) 旧 active。claim 无法回溯 → 丢弃（返回 null，不落半写），绝不
-- call 模型补全（本函数零模型调用）。
CREATE OR REPLACE FUNCTION context_compression_snapshot_activate(
  p_id uuid,
  p_expected_cas_version bigint
) RETURNS TABLE (id uuid, status text, cas_version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_claims jsonb;
  v_byte_len bigint;
  v_thread text;
  v_start bigint;
  v_end bigint;
  v_stored_digest text;
  v_live_digest text;
  v_agg text;
  v_n bigint;
  v_id uuid;
  v_status text;
  v_cas bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_expected_cas_version IS NULL OR p_expected_cas_version < 1 THEN
    RAISE EXCEPTION 'ctx04_activate_invalid' USING ERRCODE='22023';
  END IF;

  SELECT s.summary_claims, s.source_utf8_byte_length, s.thread_id,
         s.source_event_seq_start, s.source_event_seq_end, s.source_range_digest
    INTO v_claims, v_byte_len, v_thread, v_start, v_end, v_stored_digest
    FROM context_compression_snapshot s
   WHERE s.id = p_id AND s.owner_user_id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ctx04_activate_not_found' USING ERRCODE='42501';
  END IF;

  -- claim span 复核（offsetKind=utf8_byte + 0<=start<end<=字节长）。
  PERFORM context_compression_snapshot_assert_claims_valid(v_claims, v_byte_len);

  -- 来源范围仍冻结（事件链 digest 重算一致），否则丢弃（不落半写）。
  SELECT count(*), coalesce(string_agg(e.sequence::text || ':' || e.event_digest, E'\n' ORDER BY e.sequence), '')
    INTO v_n, v_agg
    FROM conversation_event e
   WHERE e.owner_user_id = principal AND e.thread_id = v_thread
     AND e.sequence BETWEEN v_start AND v_end
     AND e.status = 'active';
  IF v_n IS DISTINCT FROM (v_end - v_start + 1) THEN
    RETURN;
  END IF;
  v_live_digest := encode(digest(coalesce(v_agg, ''), 'sha256'), 'hex');
  v_live_digest := encode(digest(
    v_thread || ':' || v_start::text || ':' || v_end::text || ':' || v_live_digest, 'sha256'), 'hex');
  IF v_live_digest IS DISTINCT FROM v_stored_digest THEN
    RETURN;
  END IF;

  -- CAS 跃迁 draft→active（单赢家）。先 supersede 同 range 旧 active，再激活本行。
  UPDATE context_compression_snapshot s
     SET status = 'superseded', cas_version = s.cas_version + 1, updated_at = now()
   WHERE s.owner_user_id = principal AND s.thread_id = v_thread
     AND s.source_event_seq_start = v_start AND s.source_event_seq_end = v_end
     AND s.status = 'active' AND s.id <> p_id;

  UPDATE context_compression_snapshot s
     SET status = 'active', cas_version = s.cas_version + 1, updated_at = now()
   WHERE s.id = p_id AND s.owner_user_id = principal
     AND s.status = 'draft' AND s.cas_version = p_expected_cas_version
   RETURNING s.id, s.status, s.cas_version INTO v_id, v_status, v_cas;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  PERFORM memory_append_audit('ctx04_snapshot:' || p_id::text, 'activate',
    jsonb_build_object('from','draft','to','active'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_cas;
END $$;
ALTER FUNCTION context_compression_snapshot_activate(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_snapshot_activate(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_snapshot_activate(uuid,bigint) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- G. supersede：active → superseded（显式退休，CAS 单赢家）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION context_compression_snapshot_supersede(
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
    RAISE EXCEPTION 'ctx04_supersede_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE context_compression_snapshot s
     SET status = 'superseded', cas_version = s.cas_version + 1, updated_at = now()
   WHERE s.id = p_id AND s.owner_user_id = principal
     AND s.status = 'active' AND s.cas_version = p_expected_cas_version
   RETURNING s.id, s.status, s.cas_version INTO v_id, v_status, v_cas;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('ctx04_snapshot:' || p_id::text, 'supersede',
    jsonb_build_object('from','active','to','superseded'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_cas;
END $$;
ALTER FUNCTION context_compression_snapshot_supersede(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_snapshot_supersede(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_snapshot_supersede(uuid,bigint) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- H. 读取面：hydrate（进上下文，仅 active）+ replay（恢复，非 fenced/purged）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION context_compression_snapshot_hydrate(
  p_thread_id text
) RETURNS TABLE (
  id uuid, source_event_seq_start bigint, source_event_seq_end bigint, source_range_digest text,
  source_artifact_digest text, source_utf8_byte_length bigint,
  policy_version text, prompt_version text, model_version text, tokenizer_version text,
  summary_content_digest text, summary_claims jsonb, first_kept_event_id uuid,
  status text, cas_version bigint, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_thread_id IS NULL OR length(p_thread_id)=0 THEN
    RAISE EXCEPTION 'ctx04_hydrate_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT s.id, s.source_event_seq_start, s.source_event_seq_end, s.source_range_digest,
           s.source_artifact_digest, s.source_utf8_byte_length,
           s.policy_version, s.prompt_version, s.model_version, s.tokenizer_version,
           s.summary_content_digest, s.summary_claims, s.first_kept_event_id,
           s.status, s.cas_version, s.created_at
      FROM context_compression_snapshot s
     WHERE s.owner_user_id = principal AND s.thread_id = p_thread_id
       AND s.status = 'active'
     ORDER BY s.source_event_seq_start, s.source_event_seq_end, s.created_at;
END $$;
ALTER FUNCTION context_compression_snapshot_hydrate(text) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_snapshot_hydrate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_snapshot_hydrate(text) TO app_role;

CREATE OR REPLACE FUNCTION context_compression_snapshot_replay(
  p_thread_id text
) RETURNS TABLE (
  id uuid, source_event_seq_start bigint, source_event_seq_end bigint, source_range_digest text,
  source_artifact_digest text, source_utf8_byte_length bigint,
  policy_version text, prompt_version text, model_version text, tokenizer_version text,
  summary_content_digest text, summary_claims jsonb, first_kept_event_id uuid,
  status text, cas_version bigint, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_thread_id IS NULL OR length(p_thread_id)=0 THEN
    RAISE EXCEPTION 'ctx04_replay_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT s.id, s.source_event_seq_start, s.source_event_seq_end, s.source_range_digest,
           s.source_artifact_digest, s.source_utf8_byte_length,
           s.policy_version, s.prompt_version, s.model_version, s.tokenizer_version,
           s.summary_content_digest, s.summary_claims, s.first_kept_event_id,
           s.status, s.cas_version, s.created_at
      FROM context_compression_snapshot s
     WHERE s.owner_user_id = principal AND s.thread_id = p_thread_id
       AND s.status IN ('draft','active','superseded')
     ORDER BY s.source_event_seq_start, s.source_event_seq_end, s.created_at;
END $$;
ALTER FUNCTION context_compression_snapshot_replay(text) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION context_compression_snapshot_replay(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_snapshot_replay(text) TO app_role;
