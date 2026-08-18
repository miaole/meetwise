-- ═══════════════════════════════════════════════════════════════════════════════
-- 0116 MEM-03：多层会话摘要树（turn → segment → session episode）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 落地 register §MEM-03 / memory-context-design.md 的「摘要树而非滚动覆盖」原语。只扩 0112
-- 的 kind 枚举 + 加一列 child_summary_ids + 加四个树函数；**不就地改** 0112 已建对象：
--   - 树边：turn_summary（叶，child_summary_ids='{}'，引用事件范围）→ segment_summary（父，
--     引用已验证 turn 子）→ session_episode（根，引用已验证 segment 子）。父→子多引用用
--     `child_summary_ids uuid[]`（0112 的单 FK parent_summary_id 不足以表达 N 元聚合）。
--   - 父只引用 verified/active 子（draft → 拒）；子必须同 owner/thread、同 consent_revision +
--     privacy_epoch、kind 单层推进；单 live 父（可 supersede 同父）。父 status 仍走 0112
--     verify/activate 状态机（draft→verified→active），verify 的来源冻结复核在父身上重算
--     「子树范围 + 子 digest 聚合」——父一旦 activate 即表示其子树来源仍冻结。
--   - 仅追加不覆盖：父 version = MAX(version)+1（同 slot advisory 锁），supersede 走新版本；
--     超参 supersedes 目标已 retired → 响亮失败（根治 MEM-02 审计发现④ `v_version :=
--     v_supersedes_version+1` 与 UNIQUE(owner,thread,start,end,version) 23505 撞键：改 MAX+1，
--     且校验 supersedes 目标必须 'active' 否则 `memory_summary_supersedes_target_retired`）。
--   - 传播：`memory_summary_cascade_invalidate` / `memory_summary_fence_cascade` 把子失效/围栏
--     沿 `child_summary_ids @> ARRAY[child]` 精确级联到祖先（兄弟分支不失效）；只迁
--     verified/active（append-only，旧行保留）。
--   - 回溯：`memory_summary_traceback` 递归沿 child_summary_ids 下钻到 turn 叶 + 事件范围 +
--     各层 digest，供调用方逐字节复核「无断链、可回溯到完整来源」。
--   - 基数约束（fail-closed）：segment 必 ≥2 turn 子、episode 必 ≥2 segment 子；**单子父在 DB 层
--     拒**（`memory_summary_tree_children_cardinality`）。单子父的 slot [start,end] 与子相同 → 0112
--     `memory_summary_activate` 的「同 slot 自动 supersede」会把子 turn 顶成 superseded，父 activate
--     后引用已退休子（违反「父只引用 verified/active 子」），子静默失去 active——静默树损坏，故
--     宁可在 compose 输入契约层响亮拒绝，也不依赖调用方自律。
--   - 已知假设：摘要区间不重叠。事件源（0108/0111）是 append-only 追加模型，不产生重叠 turn；
--     但 DB **不强制**摘要区间不重叠——≥2 子但区间重叠仍可能 slot 撞键，此为已知假设，不属本项范围。
--   - `parent_summary_id` 现为死列：0112 L78 预留 FK 在 MEM-03 路径恒 NULL（compose INSERT 硬写
--     NULL、树遍历只用 child_summary_ids）。保留仅供 MEM-02 draft 的 `p_parent_summary_id` 参数兼容；
--     树逻辑统一走 `child_summary_ids`（单 FK 不足以表达 N 元聚合）。
--
-- 诚实标注（非目标）：不实现 MEM-04 长期事实 / MEM-05 向量 / MEM-06 snapshot / CTX-04
-- compression snapshot / MEM-14 memory_context_snapshot；不实现可递归 segment-of-segment
-- （本项严格 3 层）；不实现真实模型摘要（MODEL-OP）；summarizer 只写 draft 由 0112 角色承重。

-- ═══════════════════════════════════════════════════════════════════════════════
-- A. 扩 kind CHECK（3 值）——按 pg_constraint 定位匿名约束再 DROP/ADD，绝不就地改 0112 文本
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_con text;
BEGIN
  SELECT conname INTO v_con
    FROM pg_constraint
   WHERE conrelid = 'memory_summary'::regclass
     AND contype = 'c'
     AND pg_get_constraintdef(oid) LIKE '%kind%turn_summary%';
  IF v_con IS NOT NULL THEN
    EXECUTE format('ALTER TABLE memory_summary DROP CONSTRAINT %I', v_con);
  END IF;
END $$;

GRANT CREATE ON SCHEMA public TO memory_summarizer;
ALTER TABLE memory_summary ADD CONSTRAINT memory_summary_kind_check
  CHECK (kind IN ('turn_summary','segment_summary','session_episode'));

-- ═══════════════════════════════════════════════════════════════════════════════
-- B. 父→子多引用边列（append-only，随父行 INSERT 落库，绝不 UPDATE 子行）
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE memory_summary ADD COLUMN child_summary_ids uuid[] NOT NULL DEFAULT '{}';
-- 传播用反查（child_summary_ids @> ARRAY[child]）+ traceback 用下钻（id = ANY(child_summary_ids)）。
CREATE INDEX memory_summary_child_summary_ids_gin_idx ON memory_summary USING GIN (child_summary_ids);
-- 叶约束（defense-in-depth）：turn_summary 叶 child_summary_ids 必须空。compose 已拒 turn 父，
-- 此处防 summarizer raw INSERT 带子的 turn（树边只允许 segment/episode 做父）。
ALTER TABLE memory_summary ADD CONSTRAINT memory_summary_turn_leaf_child_check
  CHECK (kind <> 'turn_summary' OR child_summary_ids IS NULL OR cardinality(child_summary_ids) = 0);

-- ═══════════════════════════════════════════════════════════════════════════════
-- C. compose_draft（OWNER memory_summarizer，EXECUTE 仅 summarizer）——父节点只引用已验证子
-- ═══════════════════════════════════════════════════════════════════════════════
-- summarizer 只从已验证子节点聚合出父节点 draft：校验子全 verified/active（draft→拒）、同
-- owner/thread、kind 单层推进、单 live 父（可 supersede 同父）；服务端重算「子派生」范围 digest
-- 与原文 digest（TS↔SQL 逐字节一致）；version = MAX(version)+1（根治④）；超参 supersedes 目标
-- 已 retired → 响亮失败（23514，非 23505）。父 status 硬编码 'draft'，绝不 direct active。
CREATE OR REPLACE FUNCTION memory_summary_compose_draft(
  p_thread_id text,
  p_kind text,
  p_child_summary_ids uuid[],
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
  p_supersedes_summary_id uuid DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
) RETURNS TABLE (
  id uuid, version bigint, status text,
  source_range_digest text, source_artifact_digest text, replayed boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_n bigint;
  v_thread_ok boolean;
  v_distinct_rev bigint;
  v_distinct_epoch bigint;
  v_min_seq bigint;
  v_max_seq bigint;
  v_byte_len bigint;
  v_bad_status bigint;
  v_bad_kind bigint;
  v_consent_revision bigint;
  v_privacy_epoch bigint;
  v_agg_range text;
  v_agg_artifact text;
  v_range_digest text;
  v_artifact_digest text;
  v_already bigint;
  v_version bigint;
  v_supersedes_status text;
  v_id uuid;
  v_existing_id uuid;
  v_existing_version bigint;
  v_existing_status text;
  v_existing_range_digest text;
  v_existing_artifact_digest text;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_kind NOT IN ('segment_summary','session_episode')
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
    RAISE EXCEPTION 'memory_summary_compose_invalid' USING ERRCODE='22023';
  END IF;

  -- 单子父拒绝（fail-closed）：segment 必 ≥2 turn、episode 必 ≥2 segment。单子父的 slot [start,end]
  -- 与子相同 → 0112 activate 的「同 slot 自动 supersede」会把子 turn 顶成 superseded，父 activate 后
  -- 引用已退休子（违反「父只引用 verified/active 子」），子静默失去 active。故 DB 层硬拒单子父，
  -- 用独立错误码（区别于通用 compose_invalid），调用方与 proof 可精确断言。
  IF p_child_summary_ids IS NULL OR cardinality(p_child_summary_ids) < 2 THEN
    RAISE EXCEPTION 'memory_summary_tree_children_cardinality' USING ERRCODE='22023';
  END IF;

  -- 摘要正文 digest 服务端重算（绝不采信调用方自报指纹）。
  IF p_content_digest IS DISTINCT FROM encode(digest(p_content, 'sha256'), 'hex') THEN
    RAISE EXCEPTION 'memory_summary_content_digest_mismatch' USING ERRCODE='22023';
  END IF;

  -- 子节点聚合（RLS 已限 owner=principal，跨 owner 子自然不可见 → child_missing 响亮失败）。
  -- kind 兼容内联判定：segment 只引 turn、episode 只引 segment（无 void 函数入聚合）。
  SELECT count(*),
         bool_and(s.thread_id = p_thread_id),
         count(DISTINCT s.consent_revision),
         count(DISTINCT s.privacy_epoch),
         min(s.source_event_seq_start),
         max(s.source_event_seq_end),
         sum(s.source_utf8_byte_length),
         count(*) FILTER (WHERE s.status NOT IN ('verified','active')),
         count(*) FILTER (WHERE NOT (
             (p_kind = 'segment_summary' AND s.kind = 'turn_summary')
          OR (p_kind = 'session_episode' AND s.kind = 'segment_summary'))),
         min(s.consent_revision),
         min(s.privacy_epoch)
    INTO v_n, v_thread_ok, v_distinct_rev, v_distinct_epoch, v_min_seq, v_max_seq,
         v_byte_len, v_bad_status, v_bad_kind, v_consent_revision, v_privacy_epoch
    FROM memory_summary s
   WHERE s.id = ANY(p_child_summary_ids);

  IF v_n IS DISTINCT FROM cardinality(p_child_summary_ids) THEN
    RAISE EXCEPTION 'memory_summary_child_missing' USING ERRCODE='22023';
  END IF;
  IF v_thread_ok IS NOT TRUE THEN
    RAISE EXCEPTION 'memory_summary_child_thread_mismatch' USING ERRCODE='22023';
  END IF;
  IF v_distinct_rev > 1 OR v_distinct_epoch > 1 THEN
    RAISE EXCEPTION 'memory_summary_child_scope_mismatch' USING ERRCODE='22023';
  END IF;
  IF v_bad_status <> 0 THEN
    RAISE EXCEPTION 'memory_summary_child_not_verified_active' USING ERRCODE='22023';
  END IF;
  IF v_bad_kind <> 0 THEN
    RAISE EXCEPTION 'memory_summary_tree_child_kind_mismatch' USING ERRCODE='22023';
  END IF;
  IF v_min_seq IS NULL OR v_min_seq < 1 OR v_max_seq IS NULL OR v_max_seq < v_min_seq THEN
    RAISE EXCEPTION 'memory_summary_child_range_invalid' USING ERRCODE='22023';
  END IF;

  -- supersedes 目标必须同 slot 且仍 active，否则响亮失败（根治④：绝不 23505 撞键，绝不静默）。
  -- 先于单 live 父校验，使「重复 supersede 已退休父」给出清晰 retired 错误（非子已另父/撞键）。
  IF p_supersedes_summary_id IS NOT NULL THEN
    SELECT s.status INTO v_supersedes_status
      FROM memory_summary s
     WHERE s.id = p_supersedes_summary_id AND s.owner_user_id = principal
       AND s.thread_id = p_thread_id
       AND s.source_event_seq_start = v_min_seq AND s.source_event_seq_end = v_max_seq;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'memory_summary_supersedes_not_found' USING ERRCODE='22023';
    END IF;
    IF v_supersedes_status <> 'active' THEN
      RAISE EXCEPTION 'memory_summary_supersedes_target_retired' USING ERRCODE='23514';
    END IF;
  END IF;

  -- 单 live 父：任何其它 verified/active 父已引用这些子 → 拒（可 supersede 同父除外）。
  SELECT count(*) INTO v_already
    FROM memory_summary m
   WHERE m.owner_user_id = principal
     AND m.thread_id = p_thread_id
     AND m.child_summary_ids && p_child_summary_ids
     AND m.status IN ('verified','active')
     AND (p_supersedes_summary_id IS NULL OR m.id <> p_supersedes_summary_id);
  IF v_already > 0 THEN
    RAISE EXCEPTION 'memory_summary_child_already_parented' USING ERRCODE='23505';
  END IF;

  -- 子派生 digest（TS↔SQL 逐字节一致，按 child id 文本升序）。
  SELECT string_agg(s.id::text || ':' || s.source_range_digest, E'\n' ORDER BY s.id::text),
         string_agg(s.id::text || ':' || s.content_digest, E'\n' ORDER BY s.id::text)
    INTO v_agg_range, v_agg_artifact
    FROM memory_summary s
   WHERE s.id = ANY(p_child_summary_ids);
  v_range_digest := encode(digest(
    p_thread_id || ':' || v_min_seq::text || ':' || v_max_seq::text || ':' ||
    encode(digest(coalesce(v_agg_range, ''), 'sha256'), 'hex'), 'sha256'), 'hex');
  v_artifact_digest := encode(digest(coalesce(v_agg_artifact, ''), 'sha256'), 'hex');

  -- 结构化 claims + spanLocator 逐 claim 校验（复用 0112 helper，span 上界 = 子树总字节）。
  PERFORM memory_summary_assert_claims_valid(p_claims, v_byte_len);

  -- slot 串行化：advisory 锁保证 version = MAX+1 无并发冲突。
  PERFORM pg_advisory_xact_lock(hashtext(
    'memory_summary_compose:' || principal || ':' || p_thread_id || ':' ||
    v_min_seq::text || ':' || v_max_seq::text));

  -- 幂等重放：同 owner 同 idempotency_key 返回既有行（不双写）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT s.id, s.version, s.status, s.source_range_digest, s.source_artifact_digest
      INTO v_existing_id, v_existing_version, v_existing_status, v_existing_range_digest, v_existing_artifact_digest
      FROM memory_summary s
     WHERE s.owner_user_id = principal AND s.idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN QUERY SELECT v_existing_id, v_existing_version, v_existing_status, v_existing_range_digest, v_existing_artifact_digest, true;
      RETURN;
    END IF;
  END IF;

  -- version = slot 内 MAX+1（append-only 身份，绝不引用 supersedes 的 version 直接 +1）。
  SELECT COALESCE(MAX(s.version), 0) + 1 INTO v_version
    FROM memory_summary s
   WHERE s.owner_user_id = principal AND s.thread_id = p_thread_id
     AND s.source_event_seq_start = v_min_seq AND s.source_event_seq_end = v_max_seq;

  INSERT INTO memory_summary(
    owner_user_id, thread_id, kind, version, cas_version,
    source_event_seq_start, source_event_seq_end, source_range_digest,
    source_artifact_digest, source_utf8_byte_length,
    content, content_digest, claims,
    prompt_version, model_version, tokenizer_version, policy_version,
    parent_summary_id, supersedes_summary_id, child_summary_ids,
    controller_scope, data_subject_type, data_subject_id, scope_kind, purpose,
    consent_revision, privacy_epoch, retention_class,
    source_type, source_entity_id, immutable_source_version,
    normalization_recipe_version, producer_class, extraction_recipe_version,
    verification_recipe_version, language, status, idempotency_key
  ) VALUES (
    principal, p_thread_id, p_kind, v_version, 1,
    v_min_seq, v_max_seq, v_range_digest,
    v_artifact_digest, v_byte_len,
    p_content, p_content_digest, p_claims,
    p_prompt_version, p_model_version, p_tokenizer_version, p_policy_version,
    NULL, p_supersedes_summary_id, p_child_summary_ids,
    'c_personal', 'c_personal_user', principal, 'personal', 'free_conversation',
    v_consent_revision, v_privacy_epoch, 'derived',
    'conversation_event', p_thread_id, p_immutable_source_version,
    p_normalization_recipe_version, 'summarizer', p_extraction_recipe_version,
    p_verification_recipe_version, p_language, 'draft', p_idempotency_key
  ) RETURNING memory_summary.id INTO v_id;

  -- 复用 0093 memory_append_audit（持久有序日志，owner 作用域）。
  PERFORM memory_append_audit('memsummary:' || v_id::text, 'compose',
    jsonb_build_object('thread_id', p_thread_id, 'kind', p_kind, 'version', v_version,
      'child_count', cardinality(p_child_summary_ids),
      'source_seq_start', v_min_seq, 'source_seq_end', v_max_seq),
    p_idempotency_key);

  RETURN QUERY SELECT v_id, v_version, 'draft'::text, v_range_digest, v_artifact_digest, false;
END $$;

ALTER FUNCTION memory_summary_compose_draft(text,text,uuid[],text,text,jsonb,text,text,text,text,text,text,text,text,text,uuid,text) OWNER TO memory_summarizer;
REVOKE CREATE ON SCHEMA public FROM memory_summarizer;


REVOKE ALL ON FUNCTION memory_summary_compose_draft(text,text,uuid[],text,text,jsonb,text,text,text,text,text,text,text,text,text,uuid,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION memory_summary_compose_draft(text,text,uuid[],text,text,jsonb,text,text,text,text,text,text,text,text,text,uuid,text) TO memory_summarizer;

-- ═══════════════════════════════════════════════════════════════════════════════
-- E. traceback：递归沿 child_summary_ids 下钻到 turn 叶（OWNER memory_runtime，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 返回给定节点（含自身）的全部后代：kind/status/depth/path/子树范围/各层 digest/子 id 边。
-- 供调用方逐字节复核「任一摘要可沿父链回溯到 turn 叶事件范围，无断链」。跨 owner 只看得见
-- 自己作用域（RLS），非 owner 的 id 根不可见 → 0 行。
CREATE OR REPLACE FUNCTION memory_summary_traceback(
  p_id uuid
) RETURNS TABLE (
  id uuid, thread_id text, kind text, version bigint, cas_version bigint, status text,
  depth integer, path uuid[],
  source_event_seq_start bigint, source_event_seq_end bigint,
  source_range_digest text, source_artifact_digest text, source_utf8_byte_length bigint,
  content_digest text, child_summary_ids uuid[]
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_id IS NULL THEN
    RAISE EXCEPTION 'memory_summary_traceback_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
  WITH RECURSIVE tree(id, thread_id, kind, version, cas_version, status, depth, path,
                      source_event_seq_start, source_event_seq_end,
                      source_range_digest, source_artifact_digest, source_utf8_byte_length,
                      content_digest, child_summary_ids) AS (
    SELECT s.id, s.thread_id, s.kind, s.version, s.cas_version, s.status, 0, ARRAY[s.id],
           s.source_event_seq_start, s.source_event_seq_end,
           s.source_range_digest, s.source_artifact_digest, s.source_utf8_byte_length,
           s.content_digest, s.child_summary_ids
      FROM memory_summary s
     WHERE s.id = p_id AND s.owner_user_id = principal
    UNION ALL
    SELECT c.id, c.thread_id, c.kind, c.version, c.cas_version, c.status, t.depth + 1, t.path || c.id,
           c.source_event_seq_start, c.source_event_seq_end,
           c.source_range_digest, c.source_artifact_digest, c.source_utf8_byte_length,
           c.content_digest, c.child_summary_ids
      FROM memory_summary c
      JOIN tree t ON c.id = ANY(t.child_summary_ids)
     WHERE c.owner_user_id = principal AND NOT c.id = ANY(t.path)
  )
  SELECT tree.id, tree.thread_id, tree.kind, tree.version, tree.cas_version, tree.status,
         tree.depth, tree.path,
         tree.source_event_seq_start, tree.source_event_seq_end,
         tree.source_range_digest, tree.source_artifact_digest, tree.source_utf8_byte_length,
         tree.content_digest, tree.child_summary_ids
    FROM tree
   ORDER BY tree.depth, tree.id::text;
END $$;


GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER FUNCTION memory_summary_traceback(uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_traceback(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_traceback(uuid) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- F. cascade_invalidate：子失效 → 父精确级联（OWNER memory_runtime，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
-- CAS 失效节点自身（单赢家），随后沿 child_summary_ids 反查向上级联失效所有 verified/active
-- 祖先（兄弟分支不失效；append-only 旧行保留）。仅当节点自身 CAS 命中才级联（败者 0 行）。
CREATE OR REPLACE FUNCTION memory_summary_cascade_invalidate(
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
    RAISE EXCEPTION 'memory_summary_cascade_invalidate_invalid' USING ERRCODE='22023';
  END IF;

  UPDATE memory_summary s
     SET status='invalidated', cas_version=s.cas_version+1, updated_at=now()
   WHERE s.id = p_id AND s.owner_user_id = principal
     AND s.status IN ('verified','active') AND s.cas_version = p_expected_cas_version
   RETURNING s.id, s.status, s.cas_version INTO v_id, v_status, v_cas;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT v_id, v_status, v_cas;

  RETURN QUERY
  WITH RECURSIVE up(id, path) AS (
    SELECT p_id, ARRAY[p_id]
    UNION
    SELECT m.id, up.path || m.id FROM memory_summary m
      JOIN up ON m.child_summary_ids @> ARRAY[up.id]
     WHERE m.owner_user_id = principal
       AND NOT m.id = ANY(up.path)
  )
  UPDATE memory_summary s
     SET status='invalidated', cas_version=s.cas_version+1, updated_at=now()
   WHERE s.id IN (SELECT up.id FROM up)
     AND s.id <> p_id
     AND s.owner_user_id = principal
     AND s.status IN ('verified','active')
   RETURNING s.id, s.status, s.cas_version;
END $$;
ALTER FUNCTION memory_summary_cascade_invalidate(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION memory_summary_cascade_invalidate(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_cascade_invalidate(uuid,bigint) TO app_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- G. fence_cascade：子围栏 → 父精确级联（OWNER memory_runtime，EXECUTE app_role）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 镜像 cascade_invalidate 但迁 fenced：fence 子（verified/active）→ 级联 fence 祖先，使引用
-- 被 fence 子节点的父节点不可 hydrate（read=0，围栏先赢）。append-only，绝不物理删除。
CREATE OR REPLACE FUNCTION memory_summary_fence_cascade(
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
    RAISE EXCEPTION 'memory_summary_fence_cascade_invalid' USING ERRCODE='22023';
  END IF;

  UPDATE memory_summary s
     SET status='fenced', cas_version=s.cas_version+1, updated_at=now()
   WHERE s.id = p_id AND s.owner_user_id = principal
     AND s.status IN ('verified','active') AND s.cas_version = p_expected_cas_version
   RETURNING s.id, s.status, s.cas_version INTO v_id, v_status, v_cas;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT v_id, v_status, v_cas;

  RETURN QUERY
  WITH RECURSIVE up(id, path) AS (
    SELECT p_id, ARRAY[p_id]
    UNION
    SELECT m.id, up.path || m.id FROM memory_summary m
      JOIN up ON m.child_summary_ids @> ARRAY[up.id]
     WHERE m.owner_user_id = principal
       AND NOT m.id = ANY(up.path)
  )
  UPDATE memory_summary s
     SET status='fenced', cas_version=s.cas_version+1, updated_at=now()
   WHERE s.id IN (SELECT up.id FROM up)
     AND s.id <> p_id
     AND s.owner_user_id = principal
     AND s.status IN ('verified','active')
   RETURNING s.id, s.status, s.cas_version;
END $$;
ALTER FUNCTION memory_summary_fence_cascade(uuid,bigint) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION memory_summary_fence_cascade(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION memory_summary_fence_cascade(uuid,bigint) TO app_role;
