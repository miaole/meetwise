-- ═══════════════════════════════════════════════════════════════════════════════
-- 0117 CTX-05：并发与故障恢复（compression dispatch + commit state machine）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 承接 CTX-03（0108 事件源）/ CTX-04（0115 压缩快照），把「压缩」从纯 draft/activate 升级为
-- 有 lease/CAS/unknown 冻结的**持久派发状态机** `context_compression_dispatch`。三条承重铁律
-- （对齐 register L77 / memory-context-design.md L124/L135/L136/L254/L255）：
--
--   1. 压缩边界保护（确定性，0 模型）：一个事件范围只有「稳定边界」才可压缩——保护系统快照 +
--      授权快照（system_note 头部）+ 最近完整 turn + 完整 (tool_call, tool_result) 对；只有
--      「中段」才可压缩。半个 turn、未完成工具、来源仍会变化、删除围栏已生效 → 拒压缩（不半写、
--      不派发）。判定在 `context_compression_dispatch_assert_boundary` 内以 SQL 服务端重算
--      （turn_start 切段 + 工具深度平衡 + 中段/最近 turn 保护），与 domain 的
--      `classifyCompressibleRange` 是同一模型的 TS 镜像（proof 交叉 pin）。零模型调用。
--   2. lease/CAS 提交：压缩写入以 (owner, thread, source-range, version) 提交。claim 抢租约
--      （advisory 锁串行 + lease_owner/lease_expires_at 过期可抢占，防重复模型外发）；commit
--      是 CAS（`WHERE version=expected` + version+1），CAS 失败 0 行 → 丢弃计算结果（不覆盖
--      别人已提交的 snapshot_id）。并发双压缩同范围 → 单赢家（权威 = 单行 UNIQUE(owner,thread,
--      start,end) + version）。
--   3. 派发后 unknown 不自动重发：dispatching 后结果 unknown → 冻结为终态 unknown，绝不自动
--      重发、绝不同键重试（幂等键只回放既有）、绝不自动替换模型（model_version/prompt_version/
--      policy_version 在 claim 时冻结，任何跃迁不再改写）。
--
-- 四原语复用不重实现：①CAS（`WHERE version=expected` + version+1，同 0115 cas_version）
--   ②幂等（partial UNIQUE(owner,idempotency_key)）③RLS（FORCE owner=principal）④持久有序
--   日志（复用 0093 `memory_append_audit`）。lease 复用 acquireLease 的「过期可抢占」模式
--   （`lease_owner IS NULL OR lease_expires_at < now()`），但绑定本表而非 ai_graph_run。
--
-- 诚实标注（非目标）：
--   · 本迁移**不接删除 resolver**（begin/claim/purge 归 CTX-06）。`context_compression_dispatch`
--     只存 range/digest/version/snapshot_id/版本串，**无任何 PII 正文**，账户删除暂成孤儿，
--     删除闭合留 CTX-06（对照 CTX-04「已知缺口如实登记」先例）。
--   · 不实现真实 tokenizer / 真实模型压缩调用（MODEL-OP）——本迁移零模型，model seam 由 worker
--     侧接线（seam-before-wiring）。
--   · 不改冻结迁移 0108/0115/0111/0112/0113；不实现 MEM-03 树 / MEM-14 快照；discarded/unknown
--     为终态（同 range 不再经本表重压，重试需新的边界/新决策，不在本迁移自动重发）。

-- ── A. 表：context_compression_dispatch（压缩派发/提交状态机，单范围单行）─────────────────
DROP TABLE IF EXISTS context_compression_dispatch CASCADE;
CREATE TABLE context_compression_dispatch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  thread_id text NOT NULL,
  -- 事件范围（被压缩覆盖的连续来源事件范围，事件序）
  source_event_seq_start bigint NOT NULL CHECK (source_event_seq_start >= 1),
  source_event_seq_end bigint NOT NULL CHECK (source_event_seq_end >= source_event_seq_start),
  -- 冻结范围 checksum（SQL 重算，复用 0115 公式：thread+from+to+逐事件 digest 聚合）。
  source_range_digest text NOT NULL CHECK (source_range_digest ~ '^[a-f0-9]{64}$'),
  -- CAS 提交版本（claim 时 =1，每次受控跃迁 +1；WHERE version=expected 承重单赢家）。
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  -- 显式 status enum（非布尔汤）：claimed→dispatching→committed/unknown/discarded，claimed→discarded。
  status text NOT NULL DEFAULT 'claimed'
    CHECK (status IN ('claimed','dispatching','committed','unknown','discarded')),
  -- 租约（防重复模型外发 + 崩溃恢复）：持有者 + 过期时间（过期可抢占）。
  lease_owner text,
  lease_expires_at timestamptz,
  -- 提交的压缩快照引用（commit 时落库；claim/dispatching 阶段为 NULL）。
  snapshot_id uuid,
  -- 派发前冻结的版本串（绝不自动替换模型：claim 后任何跃迁不再改写这三列）。
  policy_version text NOT NULL,
  prompt_version text NOT NULL,
  model_version text NOT NULL,
  -- 幂等键（principal 作用域；同键重放返回既有行，绝不重发）。
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- 单范围单赢家：权威在 PG 行（并发双压缩同范围只可能有一行）。
  UNIQUE (owner_user_id, thread_id, source_event_seq_start, source_event_seq_end)
);
CREATE INDEX context_compression_dispatch_owner_thread_idx
  ON context_compression_dispatch (owner_user_id, thread_id);
CREATE UNIQUE INDEX context_compression_dispatch_idempotency_idx
  ON context_compression_dispatch (owner_user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ── B. 单向状态机 guard（白名单：只允许正向跃迁，终态无出边）──────────────────────────
CREATE OR REPLACE FUNCTION assert_context_compression_dispatch_status_oneway() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  IF NOT (
    (OLD.status = 'claimed'      AND NEW.status IN ('dispatching','discarded'))
    OR (OLD.status = 'dispatching' AND NEW.status IN ('committed','unknown','discarded'))
  ) THEN
    RAISE EXCEPTION 'context_compression_dispatch_status_oneway' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;


GRANT CREATE ON SCHEMA public TO memory_runtime;
ALTER FUNCTION assert_context_compression_dispatch_status_oneway() OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION assert_context_compression_dispatch_status_oneway() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS context_compression_dispatch_status_oneway_guard ON context_compression_dispatch;
CREATE TRIGGER context_compression_dispatch_status_oneway_guard
  BEFORE UPDATE OF status ON context_compression_dispatch
  FOR EACH ROW EXECUTE FUNCTION assert_context_compression_dispatch_status_oneway();

-- ── C. 表级 ACL + RLS（FORCE + owner=principal）──────────────────────────────────────
ALTER TABLE context_compression_dispatch ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_compression_dispatch FORCE ROW LEVEL SECURITY;
REVOKE ALL ON context_compression_dispatch FROM PUBLIC, app_role;
GRANT SELECT, INSERT, UPDATE ON context_compression_dispatch TO memory_runtime;

DO $$
BEGIN
  DROP POLICY IF EXISTS context_compression_dispatch_runtime ON context_compression_dispatch;
  CREATE POLICY context_compression_dispatch_runtime ON context_compression_dispatch
    FOR ALL TO memory_runtime
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CTX-05 数据面函数（OWNER memory_runtime，EXECUTE 授 app_role）
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 压缩边界稳定判定（确定性，0 模型，fail-closed）────────────────────────────────
-- 服务端重算 turn 结构，只有「中段稳定边界」才放行；任一违例即抛 ctx05_* 错误，绝不半写/派发。
-- 与 domain `classifyCompressibleRange` 同模型（proof 交叉 pin）。principal 从 current_setting
-- 取（FORCE RLS 只看得见 owner=principal 的事件）。
CREATE OR REPLACE FUNCTION context_compression_dispatch_assert_boundary(
  p_thread_id text,
  p_start bigint,
  p_end bigint
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_bad bigint;
  v_recent_start bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_start IS NULL OR p_start < 1 OR p_end IS NULL OR p_end < p_start THEN
    RAISE EXCEPTION 'ctx05_range_invalid' USING ERRCODE='22023';
  END IF;

  -- 系统快照/授权快照保护：范围内不得含 system_note（头部受保护内容，绝不压缩）。
  SELECT count(*) INTO v_bad FROM conversation_event e
   WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id
     AND e.sequence BETWEEN p_start AND p_end AND e.category = 'system_note';
  IF v_bad > 0 THEN RAISE EXCEPTION 'ctx05_includes_system_snapshot' USING ERRCODE='22023'; END IF;

  -- 删除围栏保护：范围内不得含任何非 active（fenced/purged）事件。
  SELECT count(*) INTO v_bad FROM conversation_event e
   WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id
     AND e.sequence BETWEEN p_start AND p_end AND e.status <> 'active';
  IF v_bad > 0 THEN RAISE EXCEPTION 'ctx05_source_fenced' USING ERRCODE='22023'; END IF;

  -- 范围起始必须对齐 turn 边界（turn_start），否则是「半个 turn」的前半被切走。
  IF NOT EXISTS (SELECT 1 FROM conversation_event e
     WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id
       AND e.sequence = p_start AND e.status = 'active' AND e.category = 'turn_start') THEN
    RAISE EXCEPTION 'ctx05_start_not_turn_boundary' USING ERRCODE='22023';
  END IF;

  -- 范围结束必须对齐 turn 边界：end+1 必须是 turn_start（否则拦腰截断正在进行的 turn，
  -- 「来源仍会变化」）；end+1 不存在 = 直达流头，同样拒。
  IF NOT EXISTS (SELECT 1 FROM conversation_event e
     WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id
       AND e.sequence = p_end + 1 AND e.status = 'active' AND e.category = 'turn_start') THEN
    RAISE EXCEPTION 'ctx05_end_not_turn_boundary' USING ERRCODE='22023';
  END IF;

  -- turn 结构：turn_no = active 流上 turn_start 的运行计数（首条 turn_start 前的 system_note 记 0）。
  -- 一个 turn 完整 ⟺ 有 user_message + assistant_message + 工具深度 min>=0 且 final=0 +
  -- 尾事件 = assistant_message（模型最终回答）。范围内的每个 turn 都必须完整；否则半个 turn /
  --   未成对 tool（tool_call 无 result 或 tool_result 无 call）→ 拒。
  WITH active_events AS (
    SELECT e.sequence, e.category
      FROM conversation_event e
     WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id AND e.status = 'active'
  ),
  numbered AS (
    SELECT sequence, category,
           sum(CASE WHEN category = 'turn_start' THEN 1 ELSE 0 END) OVER (ORDER BY sequence) AS turn_no
      FROM active_events
  ),
  depth AS (
    SELECT sequence, category, turn_no,
           sum(CASE WHEN category = 'tool_call' THEN 1 WHEN category = 'tool_result' THEN -1 ELSE 0 END)
             OVER (PARTITION BY turn_no ORDER BY sequence) AS d
      FROM numbered
  ),
  turn_stats AS (
    SELECT turn_no,
           min(sequence) AS start_seq,
           max(sequence) AS end_seq,
           min(d) AS min_depth,
           (array_agg(d ORDER BY sequence DESC))[1] AS final_depth,
           bool_or(category = 'user_message') AS has_user,
           bool_or(category = 'assistant_message') AS has_assistant,
           (array_agg(category ORDER BY sequence DESC))[1] AS last_category
      FROM depth
     WHERE turn_no > 0
     GROUP BY turn_no
  )
  SELECT count(*) INTO v_bad FROM turn_stats
   WHERE start_seq >= p_start AND end_seq <= p_end
     AND NOT (has_user AND has_assistant AND min_depth >= 0 AND final_depth = 0 AND last_category = 'assistant_message');
  IF v_bad > 0 THEN RAISE EXCEPTION 'ctx05_incomplete_turn' USING ERRCODE='22023'; END IF;

  -- 最近完整 turn 保护：全流最后一个完整 turn 的起点必须 > p_end（防止把最新已确定事实压进摘要）。
  WITH active_events AS (
    SELECT e.sequence, e.category
      FROM conversation_event e
     WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id AND e.status = 'active'
  ),
  numbered AS (
    SELECT sequence, category,
           sum(CASE WHEN category = 'turn_start' THEN 1 ELSE 0 END) OVER (ORDER BY sequence) AS turn_no
      FROM active_events
  ),
  depth AS (
    SELECT sequence, category, turn_no,
           sum(CASE WHEN category = 'tool_call' THEN 1 WHEN category = 'tool_result' THEN -1 ELSE 0 END)
             OVER (PARTITION BY turn_no ORDER BY sequence) AS d
      FROM numbered
  ),
  turn_stats AS (
    SELECT turn_no,
           min(sequence) AS start_seq,
           max(sequence) AS end_seq,
           min(d) AS min_depth,
           (array_agg(d ORDER BY sequence DESC))[1] AS final_depth,
           bool_or(category = 'user_message') AS has_user,
           bool_or(category = 'assistant_message') AS has_assistant,
           (array_agg(category ORDER BY sequence DESC))[1] AS last_category
      FROM depth
     WHERE turn_no > 0
     GROUP BY turn_no
  )
  SELECT max(start_seq) INTO v_recent_start FROM turn_stats
   WHERE has_user AND has_assistant AND min_depth >= 0 AND final_depth = 0 AND last_category = 'assistant_message';
  IF v_recent_start IS NULL OR v_recent_start <= p_end THEN
    RAISE EXCEPTION 'ctx05_includes_recent_turn' USING ERRCODE='22023';
  END IF;
END $$;
ALTER FUNCTION context_compression_dispatch_assert_boundary(text,bigint,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_dispatch_assert_boundary(text,bigint,bigint) FROM PUBLIC, app_role;

-- ── claim：抢租约 + 边界重验 + 幂等 + 单范围单行（崩溃后可过期抢占）────────────────────
-- 返回该范围的 dispatch 行。已有 dispatching/committed/unknown/discarded → 返回既有（**不重发**、
-- **不同键重试**、**不替换模型**）；claimed 且租约未过期 → 返回既有（wait，不误杀 in-flight）；
-- claimed 且租约已过期/空 → 过期抢占（崩溃恢复）。幂等键重放 → replayed=true。
CREATE OR REPLACE FUNCTION context_compression_dispatch_claim(
  p_thread_id text,
  p_start bigint,
  p_end bigint,
  p_policy_version text,
  p_prompt_version text,
  p_model_version text,
  p_lease_owner text,
  p_lease_seconds bigint,
  p_idempotency_key text DEFAULT NULL
) RETURNS TABLE (
  id uuid, status text, version bigint, source_range_digest text,
  lease_owner text, lease_expires_at timestamptz, snapshot_id uuid, replayed boolean
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
  v_id uuid;
  v_existing context_compression_dispatch%ROWTYPE;
  v_existing_id uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_thread_id IS NULL OR length(p_thread_id)=0
     OR p_start IS NULL OR p_start < 1 OR p_end IS NULL OR p_end < p_start
     OR p_policy_version IS NULL OR length(p_policy_version)=0 OR char_length(p_policy_version) > 128
     OR p_prompt_version IS NULL OR length(p_prompt_version)=0 OR char_length(p_prompt_version) > 128
     OR p_model_version IS NULL OR length(p_model_version)=0 OR char_length(p_model_version) > 128
     OR p_lease_owner IS NULL OR length(p_lease_owner)=0 OR char_length(p_lease_owner) > 256
     OR p_lease_seconds IS NULL OR p_lease_seconds < 1 OR p_lease_seconds > 3600 THEN
    RAISE EXCEPTION 'ctx05_claim_invalid' USING ERRCODE='22023';
  END IF;

  -- ① 边界稳定重验（服务端权威，伪造边界在此被拒；零模型）。
  PERFORM context_compression_dispatch_assert_boundary(p_thread_id, p_start, p_end);

  -- ② 冻结范围校验 + source_range_digest 服务端重算（复用 0115 公式，绝不采信调用方自报指纹）。
  SELECT count(*), count(DISTINCT e.consent_revision), count(DISTINCT e.privacy_epoch),
         bool_and(e.consent_purpose = 'free_conversation'), min(e.sequence), max(e.sequence),
         count(*) FILTER (WHERE e.status <> 'active'),
         coalesce(string_agg(e.sequence::text || ':' || e.event_digest, E'\n' ORDER BY e.sequence), '')
    INTO v_n, v_distinct_rev, v_distinct_epoch, v_purpose_ok, v_min_seq, v_max_seq, v_non_active, v_agg
    FROM conversation_event e
   WHERE e.owner_user_id = principal AND e.thread_id = p_thread_id
     AND e.sequence BETWEEN p_start AND p_end;

  IF v_n IS DISTINCT FROM (p_end - p_start + 1)
     OR v_min_seq IS DISTINCT FROM p_start OR v_max_seq IS DISTINCT FROM p_end
     OR v_non_active <> 0 OR v_distinct_rev > 1 OR v_distinct_epoch > 1 OR v_purpose_ok IS NOT TRUE THEN
    RAISE EXCEPTION 'ctx05_source_range_not_frozen' USING ERRCODE='22023';
  END IF;
  v_range_digest := encode(digest(coalesce(v_agg, ''), 'sha256'), 'hex');
  v_range_digest := encode(digest(
    p_thread_id || ':' || p_start::text || ':' || p_end::text || ':' || v_range_digest, 'sha256'), 'hex');

  -- ③ 单范围串行化：advisory 锁（同 owner 同 thread 同范围互斥，不同范围互不阻塞）。
  PERFORM pg_advisory_xact_lock(hashtext(
    'ctx05_dispatch:' || principal || ':' || p_thread_id || ':' || p_start::text || ':' || p_end::text));

  -- ④ 幂等键重放：同 owner 同 idempotency_key 返回既有（不双写、不改冻结输入、绝不重发）。
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing FROM context_compression_dispatch d
     WHERE d.owner_user_id = principal AND d.idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN QUERY SELECT v_existing.id, v_existing.status, v_existing.version, v_existing.source_range_digest,
        v_existing.lease_owner, v_existing.lease_expires_at, v_existing.snapshot_id, true;
      RETURN;
    END IF;
  END IF;

  -- ⑤ 单范围单行：已有行则按状态裁决。
  SELECT * INTO v_existing FROM context_compression_dispatch d
   WHERE d.owner_user_id = principal AND d.thread_id = p_thread_id
     AND d.source_event_seq_start = p_start AND d.source_event_seq_end = p_end
   FOR UPDATE;
  IF FOUND THEN
    -- 已派发/已提交/unknown/丢弃 → 终态 sticky，返回既有，绝不重发、绝不替换模型。
    IF v_existing.status IN ('dispatching','committed','unknown','discarded') THEN
      RETURN QUERY SELECT v_existing.id, v_existing.status, v_existing.version, v_existing.source_range_digest,
        v_existing.lease_owner, v_existing.lease_expires_at, v_existing.snapshot_id, false;
      RETURN;
    END IF;
    -- claimed 且租约未过期 → wait（不误杀 in-flight）。
    IF v_existing.lease_owner IS NOT NULL AND v_existing.lease_expires_at IS NOT NULL
       AND v_existing.lease_expires_at >= now() THEN
      RETURN QUERY SELECT v_existing.id, v_existing.status, v_existing.version, v_existing.source_range_digest,
        v_existing.lease_owner, v_existing.lease_expires_at, v_existing.snapshot_id, false;
      RETURN;
    END IF;
    -- claimed 且租约已过期/空 → 过期抢占（崩溃恢复：真死才可被接管）。
    UPDATE context_compression_dispatch d
       SET lease_owner = p_lease_owner, lease_expires_at = now() + (p_lease_seconds || ' seconds')::interval,
           version = d.version + 1, updated_at = now()
     WHERE d.id = v_existing.id
     RETURNING d.id, d.status, d.version, d.source_range_digest,
       d.lease_owner, d.lease_expires_at, d.snapshot_id INTO v_id, v_existing.status, v_existing.version,
       v_existing.source_range_digest, v_existing.lease_owner, v_existing.lease_expires_at, v_existing.snapshot_id;
    PERFORM memory_append_audit('ctx05_dispatch:' || v_id::text, 'reclaim',
      jsonb_build_object('thread_id', p_thread_id, 'start', p_start, 'end', p_end, 'lease_owner', p_lease_owner), NULL);
    RETURN QUERY SELECT v_id, v_existing.status, v_existing.version, v_existing.source_range_digest,
      v_existing.lease_owner, v_existing.lease_expires_at, v_existing.snapshot_id, false;
    RETURN;
  END IF;

  -- ⑥ 首次 claim：INSERT 单行（claimed + 租约 + 冻结版本串 + 重算 digest）。
  INSERT INTO context_compression_dispatch(
    owner_user_id, thread_id, source_event_seq_start, source_event_seq_end, source_range_digest,
    version, status, lease_owner, lease_expires_at,
    policy_version, prompt_version, model_version, idempotency_key
  ) VALUES (
    principal, p_thread_id, p_start, p_end, v_range_digest,
    1, 'claimed', p_lease_owner, now() + (p_lease_seconds || ' seconds')::interval,
    p_policy_version, p_prompt_version, p_model_version, p_idempotency_key
  ) RETURNING context_compression_dispatch.id INTO v_id;

  PERFORM memory_append_audit('ctx05_dispatch:' || v_id::text, 'claim',
    jsonb_build_object('thread_id', p_thread_id, 'start', p_start, 'end', p_end,
      'model_version', p_model_version, 'lease_owner', p_lease_owner), p_idempotency_key);

  RETURN QUERY SELECT v_id, 'claimed'::text, 1::bigint, v_range_digest,
    p_lease_owner, now() + (p_lease_seconds || ' seconds')::interval, NULL::uuid, false;
END $$;
ALTER FUNCTION context_compression_dispatch_claim(text,bigint,bigint,text,text,text,text,bigint,text)
  OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_dispatch_claim(text,bigint,bigint,text,text,text,text,bigint,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION context_compression_dispatch_claim(text,bigint,bigint,text,text,text,text,bigint,text) TO app_role;

-- ── mark_dispatched：claimed→dispatching（派发后边界；仅租约持有者 + CAS）────────────────
-- 派发边界一旦建立，超时即「auditable unknown」而非「再发一次的邀请」（同 model-invocation）。
CREATE OR REPLACE FUNCTION context_compression_dispatch_mark_dispatched(
  p_id uuid,
  p_lease_owner text,
  p_expected_version bigint
) RETURNS TABLE (id uuid, status text, version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid; v_status text; v_version bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_lease_owner IS NULL OR length(p_lease_owner)=0
     OR p_expected_version IS NULL OR p_expected_version < 1 THEN
    RAISE EXCEPTION 'ctx05_dispatch_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE context_compression_dispatch d
     SET status = 'dispatching', version = d.version + 1, updated_at = now()
   WHERE d.id = p_id AND d.owner_user_id = principal
     AND d.status = 'claimed' AND d.lease_owner = p_lease_owner AND d.version = p_expected_version
   RETURNING d.id, d.status, d.version INTO v_id, v_status, v_version;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('ctx05_dispatch:' || p_id::text, 'mark_dispatched',
    jsonb_build_object('from','claimed','to','dispatching'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_version;
END $$;
ALTER FUNCTION context_compression_dispatch_mark_dispatched(uuid,text,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_dispatch_mark_dispatched(uuid,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_dispatch_mark_dispatched(uuid,text,bigint) TO app_role;

-- ── commit：dispatching→committed（CAS 单赢家，snapshot_id 落库）─────────────────────────
-- `WHERE version=expected` + version+1：并发双 commit 同版本只有一个赢家，落败方 0 行 → 丢弃
-- 计算结果（不覆盖赢家已提交的 snapshot_id）。权威在 PG 行。
CREATE OR REPLACE FUNCTION context_compression_dispatch_commit(
  p_id uuid,
  p_expected_version bigint,
  p_snapshot_id uuid
) RETURNS TABLE (id uuid, status text, version bigint, snapshot_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid; v_status text; v_version bigint; v_snapshot uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_expected_version IS NULL OR p_expected_version < 1
     OR p_snapshot_id IS NULL THEN
    RAISE EXCEPTION 'ctx05_commit_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE context_compression_dispatch d
     SET status = 'committed', snapshot_id = p_snapshot_id, lease_owner = NULL, lease_expires_at = NULL,
         version = d.version + 1, updated_at = now()
   WHERE d.id = p_id AND d.owner_user_id = principal
     AND d.status = 'dispatching' AND d.version = p_expected_version
   RETURNING d.id, d.status, d.version, d.snapshot_id INTO v_id, v_status, v_version, v_snapshot;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('ctx05_dispatch:' || p_id::text, 'commit',
    jsonb_build_object('from','dispatching','to','committed','snapshot_id', p_snapshot_id), NULL);
  RETURN QUERY SELECT v_id, v_status, v_version, v_snapshot;
END $$;
ALTER FUNCTION context_compression_dispatch_commit(uuid,bigint,uuid) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_dispatch_commit(uuid,bigint,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_dispatch_commit(uuid,bigint,uuid) TO app_role;

-- ── mark_unknown：dispatching→unknown（终态 sticky，绝不自动重发）──────────────────────
-- 派发后结果 unknown（provider 崩溃/无响应）→ 冻结为 unknown；此后 claim/重试/替换模型一律拒绝。
CREATE OR REPLACE FUNCTION context_compression_dispatch_mark_unknown(
  p_id uuid,
  p_expected_version bigint
) RETURNS TABLE (id uuid, status text, version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid; v_status text; v_version bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_expected_version IS NULL OR p_expected_version < 1 THEN
    RAISE EXCEPTION 'ctx05_unknown_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE context_compression_dispatch d
     SET status = 'unknown', lease_owner = NULL, lease_expires_at = NULL,
         version = d.version + 1, updated_at = now()
   WHERE d.id = p_id AND d.owner_user_id = principal
     AND d.status = 'dispatching' AND d.version = p_expected_version
   RETURNING d.id, d.status, d.version INTO v_id, v_status, v_version;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('ctx05_dispatch:' || p_id::text, 'mark_unknown',
    jsonb_build_object('from','dispatching','to','unknown'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_version;
END $$;
ALTER FUNCTION context_compression_dispatch_mark_unknown(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_dispatch_mark_unknown(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_dispatch_mark_unknown(uuid,bigint) TO app_role;

-- ── discard：claimed/dispatching→discarded（显式中止，CAS 终态）─────────────────────────
CREATE OR REPLACE FUNCTION context_compression_dispatch_discard(
  p_id uuid,
  p_expected_version bigint
) RETURNS TABLE (id uuid, status text, version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid; v_status text; v_version bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_expected_version IS NULL OR p_expected_version < 1 THEN
    RAISE EXCEPTION 'ctx05_discard_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE context_compression_dispatch d
     SET status = 'discarded', lease_owner = NULL, lease_expires_at = NULL,
         version = d.version + 1, updated_at = now()
   WHERE d.id = p_id AND d.owner_user_id = principal
     AND d.status IN ('claimed','dispatching') AND d.version = p_expected_version
   RETURNING d.id, d.status, d.version INTO v_id, v_status, v_version;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('ctx05_dispatch:' || p_id::text, 'discard',
    jsonb_build_object('to','discarded'), NULL);
  RETURN QUERY SELECT v_id, v_status, v_version;
END $$;
ALTER FUNCTION context_compression_dispatch_discard(uuid,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_dispatch_discard(uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_dispatch_discard(uuid,bigint) TO app_role;

-- ── recover：租约过期抢占（崩溃恢复；不误杀 in-flight，真死才可被接管）───────────────────
CREATE OR REPLACE FUNCTION context_compression_dispatch_recover(
  p_id uuid,
  p_lease_owner text,
  p_lease_seconds bigint
) RETURNS TABLE (id uuid, status text, version bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid; v_status text; v_version bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_id IS NULL OR p_lease_owner IS NULL OR length(p_lease_owner)=0
     OR p_lease_seconds IS NULL OR p_lease_seconds < 1 OR p_lease_seconds > 3600 THEN
    RAISE EXCEPTION 'ctx05_recover_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE context_compression_dispatch d
     SET lease_owner = p_lease_owner, lease_expires_at = now() + (p_lease_seconds || ' seconds')::interval,
         version = d.version + 1, updated_at = now()
   WHERE d.id = p_id AND d.owner_user_id = principal
     AND d.status IN ('claimed','dispatching')
     AND (d.lease_owner IS NULL OR d.lease_expires_at < now())
   RETURNING d.id, d.status, d.version INTO v_id, v_status, v_version;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  PERFORM memory_append_audit('ctx05_dispatch:' || p_id::text, 'recover',
    jsonb_build_object('lease_owner', p_lease_owner), NULL);
  RETURN QUERY SELECT v_id, v_status, v_version;
END $$;
ALTER FUNCTION context_compression_dispatch_recover(uuid,text,bigint) OWNER TO memory_runtime;
REVOKE ALL ON FUNCTION context_compression_dispatch_recover(uuid,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_dispatch_recover(uuid,text,bigint) TO app_role;

-- ── replay：读面（恢复路径，只 SELECT 存储行，不重算 digest）───────────────────────────
CREATE OR REPLACE FUNCTION context_compression_dispatch_replay(
  p_thread_id text
) RETURNS TABLE (
  id uuid, source_event_seq_start bigint, source_event_seq_end bigint, source_range_digest text,
  version bigint, status text, lease_owner text, lease_expires_at timestamptz, snapshot_id uuid,
  policy_version text, prompt_version text, model_version text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_thread_id IS NULL OR length(p_thread_id)=0 THEN
    RAISE EXCEPTION 'ctx05_replay_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT d.id, d.source_event_seq_start, d.source_event_seq_end, d.source_range_digest,
           d.version, d.status, d.lease_owner, d.lease_expires_at, d.snapshot_id,
           d.policy_version, d.prompt_version, d.model_version, d.created_at, d.updated_at
      FROM context_compression_dispatch d
     WHERE d.owner_user_id = principal AND d.thread_id = p_thread_id
     ORDER BY d.source_event_seq_start, d.source_event_seq_end, d.created_at;
END $$;
ALTER FUNCTION context_compression_dispatch_replay(text) OWNER TO memory_runtime;
REVOKE CREATE ON SCHEMA public FROM memory_runtime;


REVOKE ALL ON FUNCTION context_compression_dispatch_replay(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION context_compression_dispatch_replay(text) TO app_role;

-- runtime login 永不通过 membership 漂移成为 memory_runtime（防漂移，与 0108/0115 一致）。
REVOKE memory_runtime, memory_admission_issuer FROM app_role;
