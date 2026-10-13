-- 0184_ag12_estimator_claim_freeze.sql
--
-- AG-12 成本轨③（CJK 加权估算器 + claim 冻结参数 + 配对 per-row 估算器归因）：
--   件② claim 冻结两观测列（沿 0181 prompt_version 四件套同形逐字先例）：
--     ① ai_model_invocation 加 `estimator_version text NULL`（CHECK：NULL 或 IN 已注册枚举两值——
--        0174 短码枚举 CHECK 形；新估算器须再迁移扩枚举）+ `calibration_factor_version text NULL`
--        （CHECK：NULL 或 ^[A-Za-z0-9.:_-]{1,160}$ 宽松形，容 <estimator>.<algo>.<64hex> 实形；
--        生产 policy.calibration 现无 setter，列落 NULL 缝至回灌刀接线）；
--     ② state guard identity-immutable 加两行比较（claim 后不可改=防重放漂移的库级承重；
--        只 additive 两行，其余比较零放松，0088 既有比较零放松）；
--     ③ claim 函数 17→19 参（CREATE OR REPLACE 不能改参数个数，故 DROP 旧 17 参签名再建 19 参；
--        body=0181 当前权威版逐字承继，仅 validation 两行 + INSERT 列集两处 additive）；
--        REVOKE/GRANT 签名行随 19 参同步重发（DROP 后 CREATE 落默认 PUBLIC EXECUTE，漏发=纪律倒退）；
--     ④ claim INSERT 列集扩两列。
--   件③ 配对函数 per-row 估算器归因：ai_usage_calibration_pairs_scoped / _v2 各 DROP+CREATE，
--     返回列集增 `estimator_version text`（值 = COALESCE(i.estimator_version,'utf8-bytes-v1')——
--     存量旧行 NULL 的真值 =「历史全部系 v1 字节估算」，COALESCE 使 v1/v2 双函数对存量行即出正确归因）。
--     v1 以 0174 :112-150 现行体为镜像底（usage_missing 剔除谓词逐字保留），v2 以 0177 :49-89
--     现行体为镜像底（p_since 窗谓词逐字保留）；返回表列集变更故必 DROP+CREATE；
--     REVOKE/GRANT 签名行随新签名同步重发（0174 :149-150 / 0177 :88-89 形）。
-- 全 outcome 落库不等成功（0119/0181 先例）：版本标签随 claim 冻结，覆盖 success / schema-失败 /
--   business-失败 / unknown 全 outcome——对账按行归因的真值来源。
-- 零语义改动：requestDigest 摘要集零变（版本是观测标签非语义输入，0181 先例；contextEstimator 本就
--   在 invoke costPolicyBinding 内零新增）；配对函数只增列不改滤（0174/0177 谓词逐字保留）；
--   0088/0119/0130/0174/0177/0181 既有比较零放松（identity-immutable 只 additive）。

-- ============================================================================
-- ① estimator_version / calibration_factor_version 两列 + CHECK（0181 :24-30 / 0174 :22-29 同形）
-- ============================================================================
ALTER TABLE ai_model_invocation
  ADD COLUMN IF NOT EXISTS estimator_version text;
ALTER TABLE ai_model_invocation
  DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_estimator_version;
ALTER TABLE ai_model_invocation
  ADD CONSTRAINT ck_ai_model_invocation_estimator_version
  CHECK (estimator_version IS NULL OR estimator_version IN ('utf8-bytes-v1', 'cjk-weighted-v1'));

ALTER TABLE ai_model_invocation
  ADD COLUMN IF NOT EXISTS calibration_factor_version text;
ALTER TABLE ai_model_invocation
  DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_calibration_factor_version;
ALTER TABLE ai_model_invocation
  ADD CONSTRAINT ck_ai_model_invocation_calibration_factor_version
  CHECK (calibration_factor_version IS NULL OR calibration_factor_version ~ '^[A-Za-z0-9.:_-]{1,160}$');

-- ①+（件③ per-row 归因的落库前提）：ai_usage_calibration（因子表·0119 :386）与
-- ai_usage_calibration_observation（观测表·0119 :405）的 estimator 列 CHECK 原钉单值
-- ('utf8-bytes-v1')——本刀注册 cjk-weighted-v1 后，v2 组因子/观测须可落库（REQUEST §2-2⑤
-- 「两 estimator 各一条 factor 行」验收），沿 REQUEST 件②① 自述「新估算器须再迁移扩枚举」
-- 原则 + 0174 :22-29 短码枚举 CHECK 形先例 additive 扩枚举（历史迁移零字节，只在新迁移翻约束）。
ALTER TABLE ai_usage_calibration
  DROP CONSTRAINT IF EXISTS ai_usage_calibration_estimator_check;
ALTER TABLE ai_usage_calibration
  ADD CONSTRAINT ai_usage_calibration_estimator_check
  CHECK (estimator IN ('utf8-bytes-v1', 'cjk-weighted-v1'));
ALTER TABLE ai_usage_calibration_observation
  DROP CONSTRAINT IF EXISTS ai_usage_calibration_observation_estimator_check;
ALTER TABLE ai_usage_calibration_observation
  ADD CONSTRAINT ai_usage_calibration_observation_estimator_check
  CHECK (estimator IN ('utf8-bytes-v1', 'cjk-weighted-v1'));
-- ①+ 续：因子表 factor_version 形态 CHECK（0119 :387）原钉 `^utf8-bytes-v1\.calibration-v1\.[0-9a-f]{64}$`
-- 单前缀——同族扩为双枚举前缀（`<estimator>.<algo>.<64hex>` 实形不变·仅估算器前缀进枚举）。
ALTER TABLE ai_usage_calibration
  DROP CONSTRAINT IF EXISTS ai_usage_calibration_factor_version_check;
ALTER TABLE ai_usage_calibration
  ADD CONSTRAINT ai_usage_calibration_factor_version_check
  CHECK (factor_version ~ '^(utf8-bytes-v1|cjk-weighted-v1)\.calibration-v1\.[0-9a-f]{64}$');

-- ============================================================================
-- ② 状态机 trigger 把两冻结列加入 identity-immutable（claim 后不可改）
-- 只增两行比较；其余 body 与 0181 逐字节一致（CREATE OR REPLACE 保持同一 trigger 引用）。
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
-- ③ claim 函数升级为 19 参（新增 p_estimator_version + p_calibration_factor_version，写入 claim
-- INSERT）。CREATE OR REPLACE 不能改参数个数，故 DROP 旧 17 参签名再建 19 参（0181 :177-178
-- 先例同形；body=0181 当前权威版逐字承继，仅 validation 两行 + INSERT 列集一处 additive）。
-- 同键重放走既有行路径（cached/wait/failed/租约续期），冻结两列只随首 claim INSERT 落库，
-- 重放绝不覆盖（冻结语义的结构承载）。
-- ============================================================================
DROP FUNCTION IF EXISTS ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer,text);
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
  p_estimate_input_tokens integer,
  p_prompt_version text,
  p_estimator_version text,
  p_calibration_factor_version text
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
    OR (p_prompt_version IS NOT NULL AND (char_length(p_prompt_version) NOT BETWEEN 1 AND 64 OR p_prompt_version ~ E'[\r\n]'))
    OR (p_estimator_version IS NOT NULL AND p_estimator_version NOT IN ('utf8-bytes-v1','cjk-weighted-v1'))
    OR (p_calibration_factor_version IS NOT NULL AND p_calibration_factor_version !~ '^[A-Za-z0-9.:_-]{1,160}$')
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

  -- Short claim transaction only.  Distinct from 0126 interview-answer locks.
  PERFORM pg_advisory_xact_lock(
    hashtext('meetwise:model_invocation_claim:' || p_owner_user_id),
    hashtext(p_idempotency_key)
  );

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
      lease_token,lease_expires_at,status,service,request_id,cost_scope_id,estimate_input_tokens,prompt_version,
      estimator_version,calibration_factor_version
    ) VALUES (
      p_owner_user_id,p_idempotency_key,p_logical_node_key_digest,p_request_digest,
      p_lease_token,clock_timestamp()+make_interval(secs => p_lease_seconds),'claimed',p_service,p_request_id,p_cost_scope_id,
      p_estimate_input_tokens,p_prompt_version,
      p_estimator_version,p_calibration_factor_version
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
    -- No invocation row: any leftover permit for this key is orphan (01_schema
    -- dropped the table, or a creator rolled back after consuming the permit).
    -- Clear it under the advisory lock and ask the caller to join — never execute.
    DELETE FROM ai_model_invocation_transition_permit
     WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key;
    RETURN QUERY SELECT 'wait'::text,NULL::uuid,NULL::jsonb,NULL::text;
    RETURN;
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

-- REVOKE/GRANT 随 19 参新签名同步重发（0181 :385-386 形；DROP 后 CREATE 落默认 PUBLIC EXECUTE，
-- 漏发=纪律倒退；本迁移单事务执行，无 PUBLIC 窗口）。
REVOKE ALL ON FUNCTION ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer,text,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer,text,text,text) TO app_role;

-- ============================================================================
-- ④ 配对函数 v1 升级：返回列集增 estimator_version（per-row 归因）。
-- 返回表列集变更故 DROP+CREATE；body=0174 现行体逐字承继（usage_missing 剔除谓词逐字保留），
-- 仅 SELECT 列集增 COALESCE 一处 additive。
-- ============================================================================
DROP FUNCTION IF EXISTS ai_usage_calibration_pairs_scoped(text);
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
  observed_at_ms bigint,
  estimator_version text
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
           (extract(epoch FROM i.completed_at) * 1000)::bigint AS observed_at_ms,
           COALESCE(i.estimator_version, 'utf8-bytes-v1') AS estimator_version
      FROM ai_model_invocation AS i
      JOIN ai_model_logical_node_header AS h
        ON h.owner_user_id = i.owner_user_id
       AND h.logical_node_key_digest = i.logical_node_key_digest
     WHERE i.owner_user_id = p_owner_user_id
       AND i.estimate_input_tokens IS NOT NULL
       AND i.input_tokens IS NOT NULL
       AND i.usage_source IS DISTINCT FROM 'usage_missing'
       AND h.model IS NOT NULL
     ORDER BY i.completed_at, i.idempotency_key;
END;
$$;

REVOKE ALL ON FUNCTION ai_usage_calibration_pairs_scoped(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_usage_calibration_pairs_scoped(text) TO app_role;

-- ============================================================================
-- ⑤ 配对函数 v2 升级：返回列集增 estimator_version（per-row 归因）。
-- 返回表列集变更故 DROP+CREATE；body=0177 现行体逐字承继（p_since 窗谓词逐字保留），
-- 仅 SELECT 列集增 COALESCE 一处 additive。
-- ============================================================================
DROP FUNCTION IF EXISTS ai_usage_calibration_pairs_scoped_v2(text, timestamptz);
CREATE OR REPLACE FUNCTION ai_usage_calibration_pairs_scoped_v2(
  p_owner_user_id text,
  p_since timestamptz
)
RETURNS TABLE(
  idempotency_key text,
  service text,
  model text,
  estimate_input_tokens integer,
  provider_input_tokens integer,
  provider_output_tokens integer,
  observed_at_ms bigint,
  estimator_version text
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
           (extract(epoch FROM i.completed_at) * 1000)::bigint AS observed_at_ms,
           COALESCE(i.estimator_version, 'utf8-bytes-v1') AS estimator_version
      FROM ai_model_invocation AS i
      JOIN ai_model_logical_node_header AS h
        ON h.owner_user_id = i.owner_user_id
       AND h.logical_node_key_digest = i.logical_node_key_digest
     WHERE i.owner_user_id = p_owner_user_id
       AND i.estimate_input_tokens IS NOT NULL
       AND i.input_tokens IS NOT NULL
       AND i.usage_source IS DISTINCT FROM 'usage_missing'
       AND h.model IS NOT NULL
       AND i.completed_at > p_since
     ORDER BY i.completed_at, i.idempotency_key;
END;
$$;

REVOKE ALL ON FUNCTION ai_usage_calibration_pairs_scoped_v2(text, timestamptz) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_usage_calibration_pairs_scoped_v2(text, timestamptz) TO app_role;
