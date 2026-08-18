-- 0119_usage_reconciliation_wiring.sql
--
-- MODEL-OP-00 收尾：tokenizer/usage 对账校准的持久化接线（三部分内聚，一次迁移完成）。
--
-- P1 — 全 outcome 的 estimate 证据（决策 a）：给 ai_model_invocation 补 `estimate_input_tokens`，
--   estimate 在 claim/dispatch 时落库（不等成功），覆盖 success / schema-失败 / business-失败 /
--   unknown 全 outcome。此前 estimate 只在输出校验通过的 ai_invocation_trace 落库，异步校准样本
--   偏向校验成功样本——本迁移把这个偏差修掉（见 invoke.ts persistTrace 的已知缺口注释）。
--   `estimate_input_tokens` 加入状态机 identity-immutable 检查：claim 后不可改（承重不变量，
--   对账证据一旦落库即为事实，绝不允许事后篡改）。
-- P2 — 异步 reconciler 的持久化目标：新增两张表
--   - ai_usage_calibration：版本化保守校准因子（insert-only、内容变则版本变、CAS）。
--   - ai_usage_calibration_observation：观测日志（幂等 PK + 低估显式落库，绝不静默）。
-- P3 — 因子读面：`ai_usage_calibration_pairs_scoped(owner)` SECURITY DEFINER 读函数，
--   JOIN ai_model_logical_node_header 取 frozen model（该表 REVOKE ALL from app_role），
--   产出 estimate↔provider usage 配对供域 reconciler 消费。
--
-- 四原语落地：幂等（观测日志 PK(owner,batch,invocation_idempotency_key) + 因子 PK 内容寻址）、
--   CAS（因子只 INSERT ON CONFLICT DO NOTHING，内容变则版本变，绝不覆盖）、RLS（两张新表 owner 绑定
--   FORCE RLS）、持久有序日志（观测落库可追溯）。显式 enum 非布尔汤：
--   reconciliation_status IN ('within_estimate','under_estimated')、
--   under_estimate_flag IN ('none','present')、estimator IN ('utf8-bytes-v1')。

-- ============================================================================
-- P1：ai_model_invocation.estimate_input_tokens 列 + CHECK
-- ============================================================================
ALTER TABLE ai_model_invocation
  ADD COLUMN IF NOT EXISTS estimate_input_tokens integer;
ALTER TABLE ai_model_invocation
  DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_estimate_input_tokens;
ALTER TABLE ai_model_invocation
  ADD CONSTRAINT ck_ai_model_invocation_estimate_input_tokens
  CHECK (estimate_input_tokens IS NULL OR estimate_input_tokens BETWEEN 1 AND 2000000);

-- ============================================================================
-- P1：状态机 trigger 把 estimate 加入 identity-immutable（claim 后不可改）
-- 只增一行检查；其余 body 与 0088 逐字节一致（CREATE OR REPLACE 保持同一 trigger 引用）。
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
           AND r.input_tokens_reserved=h.max_input_tokens
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
-- P1：claim 函数升级为 16 参（新增 p_estimate_input_tokens，写入 claim INSERT）。
-- CREATE OR REPLACE 不能改参数个数，故 DROP 旧 15 参签名再建 16 参。
-- ============================================================================
DROP FUNCTION IF EXISTS ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer);
CREATE OR REPLACE FUNCTION ai_model_claim_invocation_scoped(
  p_owner_user_id text,
  p_idempotency_key text,
  p_logical_node_key_digest text,
  p_request_digest text,
  p_service text,
  p_request_id text,
  p_cost_scope_id text,
  p_lease_token uuid,
  p_lease_seconds integer,
  p_provider text,
  p_model text,
  p_region text,
  p_price_revision text,
  p_max_input_tokens integer,
  p_max_output_tokens integer,
  p_estimate_input_tokens integer
)
RETURNS TABLE(action text, lease_token uuid, output jsonb, error_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invocation ai_model_invocation%ROWTYPE;
  header_decision text;
  created boolean := false;
  billed boolean := p_cost_scope_id IS NOT NULL;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_owner_user_id IS NULL OR char_length(p_owner_user_id) NOT BETWEEN 1 AND 512
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_logical_node_key_digest IS NULL OR p_logical_node_key_digest !~ '^[0-9a-f]{64}$'
    OR p_request_digest IS NULL OR p_request_digest !~ '^[0-9a-f]{64}$'
    OR p_lease_token IS NULL OR p_lease_seconds IS NULL OR p_lease_seconds NOT BETWEEN 1 AND 3600
    OR (p_service IS NOT NULL AND (char_length(p_service) NOT BETWEEN 1 AND 256 OR p_service ~ E'[\r\n]'))
    OR (p_request_id IS NOT NULL AND (char_length(p_request_id) NOT BETWEEN 1 AND 256 OR p_request_id ~ E'[\r\n]'))
    OR (p_cost_scope_id IS NOT NULL AND p_cost_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$')
    OR (p_estimate_input_tokens IS NOT NULL AND p_estimate_input_tokens NOT BETWEEN 1 AND 2000000)
    OR (billed AND (p_provider IS NULL OR p_provider !~ '^[A-Za-z0-9._-]{1,80}$'
                    OR p_model IS NULL OR p_model !~ '^[A-Za-z0-9._:-]{1,160}$'
                    OR p_region IS NULL OR p_region !~ '^[A-Za-z0-9._-]{1,80}$'
                    OR p_price_revision IS NULL OR p_price_revision !~ '^[A-Za-z0-9._:-]{1,80}$'
                    OR p_max_input_tokens IS NULL OR p_max_input_tokens NOT BETWEEN 1 AND 1000000
                    OR p_max_output_tokens IS NULL OR p_max_output_tokens NOT BETWEEN 1 AND 1000000))
    OR (NOT billed AND (p_provider IS NOT NULL OR p_model IS NOT NULL OR p_region IS NOT NULL
                        OR p_price_revision IS NOT NULL OR p_max_input_tokens IS NOT NULL
                        OR p_max_output_tokens IS NOT NULL)) THEN
    RAISE EXCEPTION 'ai_model_invocation_claim_invalid_input' USING ERRCODE='check_violation';
  END IF;

  -- Existing rows always take the invocation row lock before minting a
  -- one-use permit.  Dispatch and reconciliation have the same order, so
  -- concurrent claim/terminal paths cannot deadlock permit <-> invocation.
  SELECT * INTO invocation
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF FOUND THEN
    created := false;
  ELSE
    -- A first creator has no invocation row to lock.  The primary-key permit
    -- serializes that narrow creation race; a loser waits, then locks the
    -- winner's invocation row before taking any existing-row path.
    INSERT INTO ai_model_invocation_transition_permit(
      owner_user_id,idempotency_key,expected_old_status,expected_new_status
    ) VALUES (p_owner_user_id,p_idempotency_key,NULL,'claimed')
    ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING;
    IF NOT FOUND THEN
      SELECT * INTO invocation
        FROM ai_model_invocation
       WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
       FOR UPDATE;
    ELSE
    INSERT INTO ai_model_invocation(
      owner_user_id,idempotency_key,logical_node_key_digest,request_digest,
      lease_token,lease_expires_at,status,service,request_id,cost_scope_id,estimate_input_tokens
    ) VALUES (
      p_owner_user_id,p_idempotency_key,p_logical_node_key_digest,p_request_digest,
      p_lease_token,clock_timestamp()+make_interval(secs => p_lease_seconds),'claimed',p_service,p_request_id,p_cost_scope_id,
      p_estimate_input_tokens
    ) ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING
      RETURNING * INTO invocation;
    created := FOUND;
    IF NOT created THEN
      DELETE FROM ai_model_invocation_transition_permit
       WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
         AND expected_old_status IS NULL AND expected_new_status='claimed';
      SELECT * INTO invocation
        FROM ai_model_invocation
       WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
       FOR UPDATE;
    END IF;
    END IF;
  END IF;

  IF created THEN
    SELECT ai_model_register_logical_node_header_scoped(
      p_owner_user_id,p_logical_node_key_digest,p_idempotency_key,p_request_digest,p_service,p_cost_scope_id,
      p_provider,p_model,p_region,p_price_revision,p_max_input_tokens,p_max_output_tokens
    ) INTO header_decision;
    IF header_decision IN ('registered','held') THEN
      RETURN QUERY SELECT 'execute'::text,p_lease_token,NULL::jsonb,NULL::text;
      RETURN;
    END IF;
    INSERT INTO ai_model_invocation_transition_permit(
      owner_user_id,idempotency_key,expected_old_status,expected_new_status
    ) VALUES (p_owner_user_id,p_idempotency_key,'claimed','failed');
    -- The state guard requires a pre-dispatch failure to release its lease;
    -- a freshly created claim still holds the creation lease here, so the
    -- same UPDATE shape as ai_model_fail_claim_scoped must clear it.
    UPDATE ai_model_invocation
       SET status='failed',error_code='logical_node_' || header_decision,
           lease_token=NULL,lease_expires_at=NULL,completed_at=clock_timestamp(),updated_at=clock_timestamp()
      WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
        AND status='claimed' AND ai_model_invocation.lease_token=p_lease_token;
    IF FOUND THEN
      RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,('logical_node_' || header_decision)::text;
      RETURN;
    END IF;
    DELETE FROM ai_model_invocation_transition_permit
     WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
       AND expected_old_status='claimed' AND expected_new_status='failed';
    RAISE EXCEPTION 'ai_model_invocation_claim_fail_state' USING ERRCODE='integrity_constraint_violation';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ai_model_invocation_missing_after_conflict' USING ERRCODE='integrity_constraint_violation';
  END IF;
  IF invocation.request_digest <> p_request_digest THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,'idempotency_key_payload_mismatch'::text;
    RETURN;
  END IF;
  IF invocation.cost_scope_id IS DISTINCT FROM p_cost_scope_id THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,'idempotency_key_cost_scope_mismatch'::text;
    RETURN;
  END IF;
  IF invocation.status='succeeded' THEN
    IF invocation.replayable THEN
      RETURN QUERY SELECT 'cached'::text,NULL::uuid,invocation.output,NULL::text;
    ELSE
      RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,'sensitive_result_replay_requires_artifact'::text;
    END IF;
    RETURN;
  END IF;
  IF invocation.status='failed' THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,COALESCE(invocation.error_code,'model_invocation_failed')::text;
    RETURN;
  END IF;
  IF invocation.status='unknown' THEN
    RETURN QUERY SELECT 'unknown'::text,NULL::uuid,NULL::jsonb,COALESCE(invocation.error_code,'external_outcome_unknown')::text;
    RETURN;
  END IF;
  IF invocation.status='dispatching' THEN
    RETURN QUERY SELECT 'wait'::text,NULL::uuid,NULL::jsonb,NULL::text;
    RETURN;
  END IF;
  IF invocation.logical_node_key_digest IS DISTINCT FROM p_logical_node_key_digest THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,'idempotency_key_logical_node_mismatch'::text;
    RETURN;
  END IF;
  SELECT ai_model_register_logical_node_header_scoped(
    p_owner_user_id,p_logical_node_key_digest,p_idempotency_key,p_request_digest,p_service,p_cost_scope_id,
    p_provider,p_model,p_region,p_price_revision,p_max_input_tokens,p_max_output_tokens
  ) INTO header_decision;
  IF header_decision NOT IN ('registered','held') THEN
    RETURN QUERY SELECT 'failed'::text,NULL::uuid,NULL::jsonb,('logical_node_' || header_decision)::text;
    RETURN;
  END IF;
  IF invocation.lease_expires_at >= clock_timestamp() THEN
    RETURN QUERY SELECT 'wait'::text,NULL::uuid,NULL::jsonb,NULL::text;
    RETURN;
  END IF;
  INSERT INTO ai_model_invocation_transition_permit(
    owner_user_id,idempotency_key,expected_old_status,expected_new_status
  ) VALUES (p_owner_user_id,p_idempotency_key,'claimed','claimed');
  UPDATE ai_model_invocation
     SET lease_token=p_lease_token,
         lease_expires_at=clock_timestamp()+make_interval(secs => p_lease_seconds),
         updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='claimed' AND lease_expires_at < clock_timestamp();
  IF FOUND THEN
    RETURN QUERY SELECT 'execute'::text,p_lease_token,NULL::jsonb,NULL::text;
  ELSE
    DELETE FROM ai_model_invocation_transition_permit
     WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
       AND expected_old_status='claimed' AND expected_new_status='claimed';
    RETURN QUERY SELECT 'wait'::text,NULL::uuid,NULL::jsonb,NULL::text;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer) TO app_role;

-- ============================================================================
-- P2：版本化校准因子表（insert-only、内容寻址、CAS）+ 观测日志表（幂等 + 低估显式）
-- ============================================================================

-- 版本化保守校准因子：PK(owner,service,model,estimator,factor_version) 内容寻址。
-- factor_version = <estimator>.<calibration-algo>.<sha256>，内容变则版本变；ON CONFLICT DO NOTHING
-- 保证并发批幂等单份、绝不覆盖旧版本（单调历史只增不改）。
CREATE TABLE IF NOT EXISTS ai_usage_calibration (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  service text NOT NULL CHECK (char_length(service) BETWEEN 1 AND 256),
  model text NOT NULL CHECK (char_length(model) BETWEEN 1 AND 160),
  estimator text NOT NULL CHECK (estimator IN ('utf8-bytes-v1')),
  factor_version text NOT NULL CHECK (factor_version ~ '^utf8-bytes-v1\.calibration-v1\.[0-9a-f]{64}$'),
  factor double precision NOT NULL CHECK (factor > 0),
  raw_max_ratio double precision NOT NULL CHECK (raw_max_ratio >= 0),
  safety_margin double precision NOT NULL CHECK (safety_margin >= 0 AND safety_margin <= 1),
  observation_count integer NOT NULL CHECK (observation_count >= 1),
  under_estimate_flag text NOT NULL CHECK (under_estimate_flag IN ('none','present')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, service, model, estimator, factor_version)
);

-- 观测日志：幂等 PK(owner,batch,invocation_idempotency_key) + 显式 reconciliation_status。
-- 低估观测(reconciliation_status='under_estimated')显式落库，绝不静默吞掉。
CREATE TABLE IF NOT EXISTS ai_usage_calibration_observation (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  batch text NOT NULL CHECK (char_length(batch) BETWEEN 1 AND 256),
  invocation_idempotency_key text NOT NULL CHECK (char_length(invocation_idempotency_key) BETWEEN 1 AND 256),
  service text NOT NULL CHECK (char_length(service) BETWEEN 1 AND 256),
  model text NOT NULL CHECK (char_length(model) BETWEEN 1 AND 160),
  estimator text NOT NULL CHECK (estimator IN ('utf8-bytes-v1')),
  estimate_input_tokens integer NOT NULL CHECK (estimate_input_tokens >= 1),
  provider_input_tokens integer NOT NULL CHECK (provider_input_tokens >= 0),
  provider_output_tokens integer NOT NULL CHECK (provider_output_tokens >= 0),
  reconciliation_status text NOT NULL CHECK (reconciliation_status IN ('within_estimate','under_estimated')),
  observed_at_ms bigint NOT NULL CHECK (observed_at_ms >= 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, batch, invocation_idempotency_key)
);

ALTER TABLE ai_usage_calibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_calibration FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_ai_usage_calibration_owner ON ai_usage_calibration;
CREATE POLICY p_ai_usage_calibration_owner ON ai_usage_calibration
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

ALTER TABLE ai_usage_calibration_observation ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_calibration_observation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_ai_usage_calibration_observation_owner ON ai_usage_calibration_observation;
CREATE POLICY p_ai_usage_calibration_observation_owner ON ai_usage_calibration_observation
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- app_role 只经 RLS 读写自有行（insert-only；无 UPDATE/DELETE 写路径——因子只增不改、日志只追加）。
GRANT SELECT, INSERT ON ai_usage_calibration TO app_role;
GRANT SELECT, INSERT ON ai_usage_calibration_observation TO app_role;

-- ============================================================================
-- P3：因子读面——SECURITY DEFINER 配对读函数（JOIN header 取 frozen model）。
-- ai_model_logical_node_header 对 app_role REVOKE ALL（0085），故只能用 SECURITY DEFINER 读。
-- 只产出「estimate 与 provider usage 均可用」的配对（成功 + 校验失败；unknown 无 usage 不配对）。
-- ============================================================================
CREATE OR REPLACE FUNCTION ai_usage_calibration_pairs_scoped(
  p_owner_user_id text
)
RETURNS TABLE(
  idempotency_key text,
  service text,
  model text,
  estimate_input_tokens integer,
  provider_input_tokens integer,
  provider_output_tokens integer,
  observed_at_ms bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_owner_user_id IS NULL OR char_length(p_owner_user_id) NOT BETWEEN 1 AND 512 THEN
    RAISE EXCEPTION 'ai_usage_calibration_pairs_invalid_input' USING ERRCODE='check_violation';
  END IF;
  RETURN QUERY
    SELECT i.idempotency_key, i.service, h.model, i.estimate_input_tokens, i.input_tokens, i.output_tokens,
           (extract(epoch FROM i.completed_at) * 1000)::bigint AS observed_at_ms
      FROM ai_model_invocation AS i
      JOIN ai_model_logical_node_header AS h
        ON h.owner_user_id = i.owner_user_id
       AND h.logical_node_key_digest = i.logical_node_key_digest
     WHERE i.owner_user_id = p_owner_user_id
       AND i.estimate_input_tokens IS NOT NULL
       AND i.input_tokens IS NOT NULL
       AND h.model IS NOT NULL
     ORDER BY i.completed_at, i.idempotency_key;
END;
$$;

REVOKE ALL ON FUNCTION ai_usage_calibration_pairs_scoped(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_usage_calibration_pairs_scoped(text) TO app_role;
