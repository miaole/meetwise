-- 0188_ag11_cost_reserve_least_and_settle_relax.sql
--
-- AG-COST4（成本轨④·AG-11 三件套+补收 EG-B2）：
-- 件① 双等值点 `≤` 镜像——reserve 传参已在调用方改 LEAST(max, estimate) 后，派发边界两道
-- 同值锁（状态机 trigger guard + transition 函数）必须同批把输入侧等值放宽为 `≤`，否则
-- 「估多少占多少」的新预留会在派发相位被判非法（单改 guard 则死在 transition——双点同批）。
-- 镜像底=现行体逐字节承继（guard=0184 版全量·含 0179/0181/0184 增量比较行；transition=0088 版
-- 全量·两查分立形原样），仅输入侧等值谓词一行改 `≤`；输出侧等值（= max_output_tokens）逐字
-- 保留：输出无派发前估算，不放松。签名零变→CREATE OR REPLACE 零 DROP 零 ACL 重发。
-- 件② settle 放宽+行内扩+overage 标记+月限表级 CHECK 松绑——预留改小后，供应商真实消耗超
-- 预留成为常态路径：actual ≤ header 冻结上限内放行结算（行内扩仅对 actual>reserved 侧单调
-- 扩·不缩史值），超额落 overage 标记列+月度表级 CHECK 松绑（钱已花不拒绝，只告警）；
-- actual 超 header 上限仍 raise 原码（封顶不破）；invocation/header 缺行 defensive 退回
-- 预留自值=现严格语义（fail-closed 不扩权）。scoped wrapper 返回形 bigint→TABLE 系函数身份
-- 变更→恰一 DROP+CREATE（禁 OUT 叠加 overload）+ACL 随发。reserve 期月限闸门零字节。

-- ============================================================================
-- ① 状态机 trigger guard `≤` 镜像（底=0184 现行体逐字节·仅输入侧等值谓词一行改 ≤；
--    输出侧等值行/0179 claimed→claimed 释放守卫/0181 prompt_version/0184 两冻结列
--    identity-immutable 比较行全数原值——照抄 0088 原体会静默回退三刀交付，禁）。
--    触发器引用同名函数，OR REPLACE 自动生效。
-- ============================================================================
CREATE OR REPLACE FUNCTION ai_model_invocation_state_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  old_status text;
BEGIN
  old_status := CASE WHEN TG_OP='INSERT' THEN NULL ELSE OLD.status END;
  PERFORM ai_model_consume_transition_permit(
    NEW.owner_user_id, NEW.idempotency_key, old_status, NEW.status
  );

  IF TG_OP='INSERT' THEN
    IF NEW.status <> 'claimed'
      OR NEW.logical_node_key_digest IS NULL
      OR NEW.lease_token IS NULL OR NEW.lease_expires_at IS NULL
      OR NEW.error_code IS NOT NULL OR NEW.output IS NOT NULL
      OR NEW.dispatched_at IS NOT NULL OR NEW.completed_at IS NOT NULL
      OR NEW.input_tokens IS NOT NULL OR NEW.output_tokens IS NOT NULL OR NEW.latency_ms IS NOT NULL THEN
      RAISE EXCEPTION 'ai_model_invocation_claim_shape_invalid' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.owner_user_id IS DISTINCT FROM NEW.owner_user_id
    OR OLD.idempotency_key IS DISTINCT FROM NEW.idempotency_key
    OR OLD.logical_node_key_digest IS DISTINCT FROM NEW.logical_node_key_digest
    OR OLD.request_digest IS DISTINCT FROM NEW.request_digest
    OR OLD.service IS DISTINCT FROM NEW.service
    OR OLD.request_id IS DISTINCT FROM NEW.request_id
    OR OLD.cost_scope_id IS DISTINCT FROM NEW.cost_scope_id
    OR OLD.estimate_input_tokens IS DISTINCT FROM NEW.estimate_input_tokens
    OR OLD.prompt_version IS DISTINCT FROM NEW.prompt_version
    OR OLD.estimator_version IS DISTINCT FROM NEW.estimator_version
    OR OLD.calibration_factor_version IS DISTINCT FROM NEW.calibration_factor_version
    OR OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'ai_model_invocation_identity_immutable' USING ERRCODE='integrity_constraint_violation';
  END IF;

  IF OLD.status='claimed' AND NEW.status='claimed' THEN
    IF NEW.lease_token IS NULL OR NEW.lease_expires_at IS NULL
      OR NEW.error_code IS DISTINCT FROM OLD.error_code
      OR NEW.output IS DISTINCT FROM OLD.output
      OR NEW.replayable IS DISTINCT FROM OLD.replayable
      OR NEW.input_tokens IS DISTINCT FROM OLD.input_tokens
      OR NEW.output_tokens IS DISTINCT FROM OLD.output_tokens
      OR NEW.latency_ms IS DISTINCT FROM OLD.latency_ms
      OR NEW.dispatched_at IS DISTINCT FROM OLD.dispatched_at
      OR NEW.completed_at IS DISTINCT FROM OLD.completed_at THEN
      RAISE EXCEPTION 'ai_model_invocation_claim_renewal_invalid' USING ERRCODE='integrity_constraint_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status='claimed' AND NEW.status='failed' THEN
    -- A pre-dispatch failure must never have crossed the external-send
    -- boundary: neither side of the transition may carry a dispatch time.
    -- (Comparing NEW against OLD with IS NOT DISTINCT would reject every
    -- legitimate failure because both sides are NULL here.)
    IF NEW.lease_token IS NOT NULL OR NEW.lease_expires_at IS NOT NULL
      OR NEW.error_code IS NULL OR NEW.error_code !~ '^[A-Za-z0-9._:-]{1,120}$'
      OR NEW.output IS NOT NULL OR NEW.completed_at IS NULL
      OR OLD.dispatched_at IS NOT NULL OR NEW.dispatched_at IS NOT NULL
      OR NEW.input_tokens IS DISTINCT FROM OLD.input_tokens
      OR NEW.output_tokens IS DISTINCT FROM OLD.output_tokens
      OR NEW.latency_ms IS DISTINCT FROM OLD.latency_ms THEN
      RAISE EXCEPTION 'ai_model_invocation_pre_dispatch_failure_invalid' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status='claimed' AND NEW.status='dispatching' THEN
    IF NEW.logical_node_key_digest IS NULL
      OR NEW.lease_token IS NOT NULL OR NEW.lease_expires_at IS NOT NULL
      OR NEW.dispatched_at IS NULL
      OR NOT EXISTS (
        SELECT 1
          FROM ai_model_logical_node_header AS h
          JOIN ai_model_dispatch_slot AS s
            ON s.owner_user_id=h.owner_user_id
           AND s.logical_node_key_digest=h.logical_node_key_digest
         WHERE h.owner_user_id=NEW.owner_user_id
           AND h.logical_node_key_digest=NEW.logical_node_key_digest
           AND h.canonical_idempotency_key=NEW.idempotency_key
           AND h.request_digest=NEW.request_digest
           AND h.service IS NOT DISTINCT FROM NEW.service
           AND h.cost_scope_id IS NOT DISTINCT FROM NEW.cost_scope_id
           AND s.canonical_idempotency_key=NEW.idempotency_key
           AND s.cost_scope_id IS NOT DISTINCT FROM NEW.cost_scope_id
      ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_slot_required' USING ERRCODE='integrity_constraint_violation';
    END IF;
    -- Second line of defence: even a permit-minted writer cannot cross the
    -- dispatch boundary when the billed reservation is missing or does not
    -- exactly match the header's frozen provider/model/region/revision and
    -- token bounds (BINDING-001).
    IF NEW.cost_scope_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
          FROM ai_cost_reservation AS r
          JOIN ai_model_logical_node_header AS h
            ON h.owner_user_id=NEW.owner_user_id
           AND h.logical_node_key_digest=NEW.logical_node_key_digest
         WHERE r.scope_id=NEW.cost_scope_id
           AND r.request_owner_user_id=NEW.owner_user_id
           AND r.idempotency_key=NEW.idempotency_key
           AND r.status='reserved'
           AND r.provider=h.provider AND r.model=h.model
           AND r.region=h.region AND r.price_revision=h.price_revision
           AND r.input_tokens_reserved<=h.max_input_tokens
           AND r.output_tokens_reserved=h.max_output_tokens
      ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_cost_reservation_required' USING ERRCODE='integrity_constraint_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status='dispatching' AND NEW.status IN ('succeeded','failed','unknown') THEN
    IF NEW.lease_token IS NOT NULL OR NEW.lease_expires_at IS NOT NULL
      OR (NEW.status='succeeded' AND NEW.error_code IS NOT NULL)
      OR (NEW.status IN ('failed','unknown') AND (NEW.error_code IS NULL OR NEW.error_code !~ '^[A-Za-z0-9._:-]{1,120}$')) THEN
      RAISE EXCEPTION 'ai_model_invocation_terminal_shape_invalid' USING ERRCODE='integrity_constraint_violation';
    END IF;
    IF NEW.status='succeeded' AND (NEW.output IS NULL OR NEW.completed_at IS NULL) THEN
      RAISE EXCEPTION 'ai_model_invocation_success_shape_invalid' USING ERRCODE='integrity_constraint_violation';
    END IF;
    IF NEW.status IN ('failed','unknown') AND NEW.output IS NOT NULL THEN
      RAISE EXCEPTION 'ai_model_invocation_terminal_output_invalid' USING ERRCODE='integrity_constraint_violation';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'ai_model_invocation_state_transition_invalid' USING ERRCODE='integrity_constraint_violation';
END;
$$;

-- ============================================================================
-- ① 续 transition 函数 `≤` 镜像（底=0088 现行体逐字节·仅输入侧等值谓词一行改 ≤；
--    两查分立形（缺预留→_required / 绑定漂移→_binding_mismatch）与 provider/model/
--    region/price_revision 等值四行原值。派发相位 wrapper（model-invocation.ts）产线
--    在用——单改 guard 不改本函数则 LEAST 预留死在派发 raise。
-- ============================================================================
CREATE OR REPLACE FUNCTION ai_model_transition_dispatched_scoped(
  p_owner_user_id text,
  p_idempotency_key text,
  p_lease_token uuid,
  p_cost_scope_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invocation ai_model_invocation%ROWTYPE;
  header ai_model_logical_node_header%ROWTYPE;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_lease_token IS NULL
    OR (p_cost_scope_id IS NOT NULL AND p_cost_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$') THEN
    RAISE EXCEPTION 'ai_model_dispatch_slot_invalid_input' USING ERRCODE='check_violation';
  END IF;

  SELECT * INTO invocation
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF NOT FOUND OR invocation.status <> 'claimed' OR invocation.lease_token IS DISTINCT FROM p_lease_token
    OR invocation.lease_expires_at IS NULL OR invocation.lease_expires_at < clock_timestamp()
    OR invocation.cost_scope_id IS DISTINCT FROM p_cost_scope_id
    OR invocation.logical_node_key_digest IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO header
    FROM ai_model_logical_node_header
   WHERE owner_user_id=p_owner_user_id AND logical_node_key_digest=invocation.logical_node_key_digest
   FOR UPDATE;
  IF NOT FOUND OR header.canonical_idempotency_key <> p_idempotency_key
    OR header.request_digest <> invocation.request_digest
    OR header.service IS DISTINCT FROM invocation.service
    OR header.cost_scope_id IS DISTINCT FROM invocation.cost_scope_id THEN
    RAISE EXCEPTION 'ai_model_dispatch_slot_header_mismatch' USING ERRCODE='integrity_constraint_violation';
  END IF;

  -- BINDING-001: a billed dispatch may only pair with a reservation whose
  -- provider/model/region/price-revision and token bounds exactly match the
  -- header's frozen binding.  A same-scope/same-key row with drifted pricing
  -- identity is rejected before any slot or permit is minted.
  IF p_cost_scope_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM ai_cost_reservation
       WHERE scope_id=p_cost_scope_id
         AND request_owner_user_id=p_owner_user_id
         AND idempotency_key=p_idempotency_key
         AND status='reserved'
    ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_cost_reservation_required' USING ERRCODE='integrity_constraint_violation';
    END IF;
    IF NOT EXISTS (
      SELECT 1
        FROM ai_cost_reservation AS r
        JOIN ai_model_logical_node_header AS h
          ON h.owner_user_id=p_owner_user_id
         AND h.logical_node_key_digest=invocation.logical_node_key_digest
       WHERE r.scope_id=p_cost_scope_id
         AND r.request_owner_user_id=p_owner_user_id
         AND r.idempotency_key=p_idempotency_key
         AND r.status='reserved'
         AND r.provider=h.provider AND r.model=h.model
         AND r.region=h.region AND r.price_revision=h.price_revision
         AND r.input_tokens_reserved<=h.max_input_tokens
         AND r.output_tokens_reserved=h.max_output_tokens
    ) THEN
      RAISE EXCEPTION 'ai_model_dispatch_cost_reservation_binding_mismatch' USING ERRCODE='integrity_constraint_violation';
    END IF;
  END IF;

  INSERT INTO ai_model_dispatch_slot(
    owner_user_id,logical_node_key_digest,canonical_idempotency_key,cost_scope_id
  ) VALUES (
    p_owner_user_id,invocation.logical_node_key_digest,p_idempotency_key,p_cost_scope_id
  ) ON CONFLICT (owner_user_id,logical_node_key_digest) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO ai_model_invocation_transition_permit(
    owner_user_id,idempotency_key,expected_old_status,expected_new_status
  ) VALUES (p_owner_user_id,p_idempotency_key,'claimed','dispatching');
  UPDATE ai_model_invocation
     SET status='dispatching',lease_token=NULL,lease_expires_at=NULL,
         dispatched_at=clock_timestamp(),updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='claimed' AND lease_token=p_lease_token
     AND cost_scope_id IS NOT DISTINCT FROM p_cost_scope_id;
  IF FOUND THEN RETURN true; END IF;
  DELETE FROM ai_model_invocation_transition_permit
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND expected_old_status='claimed' AND expected_new_status='dispatching';
  RETURN false;
END;
$$;

-- ============================================================================
-- ② overage 标记列（additive·0036 加列同形先例；存量行 NOT NULL DEFAULT false 零回填）。
-- ============================================================================
ALTER TABLE ai_cost_reservation ADD COLUMN IF NOT EXISTS overage boolean NOT NULL DEFAULT false;

-- ============================================================================
-- ② ai_cost_settle_text 放宽形（5 参签名零变·RETURNS bigint 保持=零 DROP·REVOKE/GRANT
--    零重发）。保留原值：入参校验/找不到行 raise/已 settled 幂等返回/非 dispatching raise/
--    月度结转形/行终态 UPDATE 形。放宽形（恰两处 raise 的替形）：actual ≤ header 冻结上限
--    放行结算；行内扩仅对 actual>reserved 侧单调扩（不缩史值；actual_input=0 恒小于预留
--    ≥1 不触扩·不歪曲 0 消耗）；月度结转照原形（释放原预留/计入实结）；月限超额不拒绝
--    （钱已花·拒绝搁浅账本——overage 标记+上层 metric 告警承接）；actual 超 header 上限
--    仍 raise 原码（封顶语义·库级防线不撤）。
-- ============================================================================
CREATE OR REPLACE FUNCTION ai_cost_settle_text(
  p_scope_id text,p_request_owner text,p_idempotency_key text,
  p_actual_input_tokens integer,p_actual_output_tokens integer
)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  r ai_cost_reservation%ROWTYPE;
  actual_cost bigint;
  v_header_max_input integer;
  v_header_max_output integer;
  v_overage boolean;
BEGIN
  IF p_actual_input_tokens IS NULL OR p_actual_output_tokens IS NULL
    OR p_actual_input_tokens < 0 OR p_actual_output_tokens < 0 THEN
    RAISE EXCEPTION 'ai_cost_invalid_text_actual_tokens' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO r FROM ai_cost_reservation
   WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ai_cost_reservation_missing' USING ERRCODE='no_data_found'; END IF;
  IF r.status='settled' THEN RETURN r.settled_micro_cny; END IF;
  IF r.status <> 'dispatching' THEN RAISE EXCEPTION 'ai_cost_settle_invalid_state:%', r.status USING ERRCODE='check_violation'; END IF;
  -- header 冻结上限解析（join 链=预留→调用行→header；defensive：invocation/header 缺行或
  -- 计费上限列 NULL→COALESCE 退回预留自身值=现严格语义，fail-closed 不扩权）。
  SELECT COALESCE(h.max_input_tokens, r.input_tokens_reserved),
         COALESCE(h.max_output_tokens, r.output_tokens_reserved)
    INTO v_header_max_input, v_header_max_output
    FROM ai_model_invocation AS i
    JOIN ai_model_logical_node_header AS h
      ON h.owner_user_id=i.owner_user_id
     AND h.logical_node_key_digest=i.logical_node_key_digest
   WHERE i.owner_user_id=r.request_owner_user_id
     AND i.idempotency_key=r.idempotency_key
     AND i.cost_scope_id=r.scope_id;
  IF NOT FOUND THEN
    v_header_max_input := r.input_tokens_reserved;
    v_header_max_output := r.output_tokens_reserved;
  END IF;
  IF p_actual_input_tokens > v_header_max_input OR p_actual_output_tokens > v_header_max_output THEN
    RAISE EXCEPTION 'ai_cost_actual_exceeds_reservation' USING ERRCODE='check_violation';
  END IF;
  actual_cost :=
    CEIL(p_actual_input_tokens::numeric * r.input_micro_cny_per_million::numeric / 1000000::numeric)::bigint
    + CEIL(p_actual_output_tokens::numeric * r.output_micro_cny_per_million::numeric / 1000000::numeric)::bigint;
  -- 行内扩：仅 actual>reserved 侧单调扩（不缩史值）；overage 标记随同 UPDATE 落定。
  v_overage := p_actual_input_tokens > r.input_tokens_reserved
    OR p_actual_output_tokens > r.output_tokens_reserved
    OR actual_cost > r.reserved_micro_cny;
  UPDATE ai_cost_budget_month AS m
     SET reserved_micro_cny=m.reserved_micro_cny-r.reserved_micro_cny,
         settled_micro_cny=m.settled_micro_cny+actual_cost,version=m.version+1,updated_at=clock_timestamp()
   WHERE m.scope_id=r.scope_id AND m.period_key=r.period_key;
  UPDATE ai_cost_reservation
     SET status='settled',settled_micro_cny=actual_cost,
         input_tokens_reserved=GREATEST(r.input_tokens_reserved,p_actual_input_tokens),
         output_tokens_reserved=GREATEST(r.output_tokens_reserved,p_actual_output_tokens),
         reserved_micro_cny=GREATEST(r.reserved_micro_cny,actual_cost),
         input_tokens_actual=p_actual_input_tokens,
         output_tokens_actual=p_actual_output_tokens,
         overage=v_overage,
         settled_at=clock_timestamp(),updated_at=clock_timestamp()
   WHERE scope_id=r.scope_id AND idempotency_key=r.idempotency_key;
  RETURN actual_cost;
END;
$$;

-- ============================================================================
-- ② scoped settle wrapper 返回形 bigint→TABLE(micro_cny, overage)：函数身份变更→
--    恰一 DROP+CREATE（⛔ 禁 OUT 叠加 overload 形）；overage 取值路径写死=settle 后
--    回读 reservation 行。ACL 随发（0036 :187/:190 同形：REVOKE FROM PUBLIC+GRANT app_role）。
-- ============================================================================
DROP FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer);
CREATE FUNCTION ai_cost_settle_text_scoped(
  p_scope_id text,p_request_owner text,p_idempotency_key text,p_actual_input_tokens integer,p_actual_output_tokens integer
)
RETURNS TABLE(micro_cny bigint, overage boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_micro bigint;
  v_overage boolean;
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  v_micro := ai_cost_settle_text(p_scope_id,p_request_owner,p_idempotency_key,p_actual_input_tokens,p_actual_output_tokens);
  SELECT r.overage INTO v_overage
    FROM ai_cost_reservation AS r
   WHERE r.scope_id=p_scope_id AND r.idempotency_key=p_idempotency_key AND r.request_owner_user_id=p_request_owner;
  RETURN QUERY SELECT v_micro, COALESCE(v_overage, false);
END;
$$;
REVOKE ALL ON FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer) TO app_role;

-- ============================================================================
-- ② 月限表级 CHECK 松绑（settle 期「钱已花不拒」的承重前置：overage 路径月度结转净增
--    actual_cost−原预留>0，月剩余 slack 耗尽即撞本 CHECK→check_violation→EG-B2 幽灵预留
--    复发）。约束名=pg_constraint 实测（0033 无名表级 CHECK→ai_cost_budget_month_check，
--    定义 CHECK (((reserved_micro_cny + settled_micro_cny) <= limit_micro_cny))）；
--    同表列级 CHECK（period_key/limit>0/reserved>=0/settled>=0/version>=0）原值零触；
--    reserve 期月限闸门（budget_exhausted 程序闸）零字节原值。
-- ============================================================================
ALTER TABLE ai_cost_budget_month DROP CONSTRAINT ai_cost_budget_month_check;
