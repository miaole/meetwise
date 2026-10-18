-- 0209_ag09_replay_first_claim.sql
--
-- AG-09 回放优先重放刀（issues-final AG-09 :148-156 修法第二肢最小收口：「或者对 succeeded 的
--   同逻辑节点优先回放已有结果，不再比较 digest」；ag-cost5 :99 裁决③(b) 承接登记「墙一归一化
--   改形判归 AG-09 联动刀」之待启刀·本迁移即该承接面）：
--   触发例=出题成功后、checkpoint 写入前 worker 被杀——模型调用已返、终态 claim 未提交，行留
--   非终态；同键重放的 request digest 因检索素材/prompt 文本/价版漂移（model-client.ts modelFor
--   digest 构成含 rag/system/costPolicy 十二字段·两 fence 注释在案=刻意不为）→ 撞 digest 墙 →
--   'failed' idempotency_key_payload_mismatch → invoke deterministic_refusal 终态 → 判死链
--   generation_unavailable 整场失败：可恢复的崩溃被误杀成不可恢复终态。
--   修法=**恰一序变更**：将 0184 体「succeeded ∧ replayable → cached（回放 invocation.output）」
--   臂（0184 :376-383 语义）上提至 digest 墙（0184 :368-371）之前——succeeded 可回放行先回放既有
--   结果（cached·零二次外呼·零新结算·invoke.ts :794 cached terminal 直返既有机制承重·零 TS 改动），
--   不再比较 digest；digest/cost_scope/logical_node 三墙与其余全臂对非 succeeded∧replayable 行
--   原位原值零字节（敏感面/非终态面/expired-claimed 重领面/created 建行路径零回归）。
--
-- 语义矩阵（0184 现行为 → 0209 后）：
--   succeeded ∧ replayable + digest 漂移       mismatch 终态（AG-09 误杀）→ **cached 回放**（零二次外呼零新结算）
--   succeeded ∧ replayable + logical_node 漂移  digest 漂移=mismatch → **cached**（上提臂先于两墙·logical_node 墙不可达）
--   succeeded ∧ replayable + cost_scope 漂移    cost_scope 墙 mismatch → **cached**（裁决① 追认上提形：已结算行回放
--                                              零新费用·bill 语义无新敞口；重放方零记账缝=cached 直返既有语义非新敞口）
--   succeeded ∧ NOT replayable（敏感）         原值零变（敏感 fence 零动·上提臂条件不含非回放行：漂移=墙一
--                                              mismatch·恒等=原位敏感臂 sensitive_result_replay_requires_artifact）
--   claimed(过期)/dispatching/failed/unknown   原值零变（墙一非终态面+expired-claimed 重领面维持=刀 D/⑤ 零回归）
--   created 建行路径                           原值零变
--
-- 函数身份=0184 现行权威 19 参签名（升参链=0088 原设→0119 15→16 参→0130 16 参同签名 REPLACE→
--   0181 16→17 参 DROP+CREATE（0181 :177 DROP/:178 CREATE 17 参+p_prompt_version）→0184 DROP 17 参
--   :218 CREATE 19 参 :219-240+p_estimator_version/p_calibration_factor_version 两冻结列；
--   0130 16 参系历史定义非现行·0184 后零迁移再触本函数）。
-- **同 19 参签名 CREATE OR REPLACE·零 DROP**：同签名 REPLACE 合法先例=0119→0130 十六参同签名
--   CREATE OR REPLACE（0130 对 0119 所建 16 参体零 DROP 直接 REPLACE）；ACL 论断=0204 :27
--   「RETURNS TABLE 零变=REPLACE 合法零 DROP·ACL 随 OR REPLACE 保留」。
-- **Ban 16 参 overload 双存**（0204 :33/:177/:258「禁 overload 双存沿 0188 先例」铁律）：照 16 参
--   旧体施工即与 live 19 参体双存=违铁律+修法 no-op（手术落 16 参死体·live 体墙序原样）+
--   ag12-estimator-freeze proof 恰一 overload pronargs=19 哨兵破损——三点即 P0 定谳，0209 一律同 19 参。
-- 回滚形状：0184 :244-430 体原样复原——对 0209 体 diff 恰=上提臂一块 additive（逐字 diff 机证），
--   回滚=以 0184 体对同 19 参签名 CREATE OR REPLACE 即原值复原（零数据迁移零列变更零 DROP）。
-- 零 TS 产品码·零历史迁移（0001-0208 零字节）·est live=0（proof=ag09-replay-first.proof 隔离库
--   真迁移链五臂·零模型外呼）。

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
  -- AG-09 上提臂（本迁移恰一序变更）：succeeded ∧ replayable 先回放既有结果（cached·零二次外呼
  -- 零新结算·invoke.ts cached terminal 直返）——先于 digest/logical_node/cost_scope 三墙；敏感行
  -- （NOT replayable）不进本臂=敏感 fence 原位原值（原 succeeded 臂位保留敏感半）。
  IF invocation.status='succeeded' AND invocation.replayable THEN
    RETURN QUERY SELECT 'cached'::text,NULL::uuid,invocation.output,NULL::text;
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

-- REVOKE/GRANT 镜像 0184 :434-435 十九参签名原文两行（同签名 REPLACE 下 ACL 本随 OR REPLACE
-- 保留=0204 :27 论断；仍随发原文为显式纪律·幂等零害·ag12-estimator-freeze proof GRANT 纪律零漂）。
REVOKE ALL ON FUNCTION ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer,text,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer,text,text,text) TO app_role;
