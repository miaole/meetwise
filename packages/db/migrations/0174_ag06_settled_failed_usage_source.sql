-- 0174_ag06_settled_failed_usage_source.sql
--
-- AG 修复轨刀 B（AG-06 确定性失败结算分类 + AG-14 解析层折叠）的持久化面，三部分：
-- ① ai_model_invocation 补 `usage_source` 短码列（沿 0119 P1 estimate 列先例）：
--    usage 存在但字段缺失时按 policy 上限补齐结算的行打 `usage_missing` 标（AG-14 修法④·
--    EXPERT-REVIEWS §四 :37「绝不按 0」）；缺省 NULL = 供应商上报真实 usage。列在 terminalize
--    时写入（非 claim 时），不进 0088/0119 的 identity-immutable 检查（与 input_tokens 同位）。
-- ② ai_model_terminalize_scoped 逐字镜像 0088 :623-691 增 p_usage_source 参数（DEFAULT NULL·
--    既有 9 参调用形继续解析）——历史迁移零字节改铁律下的新迁移 DROP+CREATE 镜像形（AG-11 同法）。
-- ③ ai_usage_calibration_pairs_scoped 逐字镜像 0119 :438-475 仅 WHERE 增打标剔除谓词——
--    打标行（上限补齐的假 usage）被校准配对剔除，不再污染 AG-12 因子（=max/estimate 假样本）。
--
-- 失败码登记（ASCII·0088 `^[A-Za-z0-9._:-]{1,120}$` 约束·沿既有码族风格起新码）：
--   deterministic_output_invalid    HTTP 200+usage 在手·空 content 或坏 JSON（输出确定性不可用）
--   deterministic_output_truncated  HTTP 200+usage 在手·finish_reason='length' 截断
--
-- 迁移号登记：实测 tip 次空号=0170，但 0170-0173 已被协调方登记（刀 C 计划 0170+计费蓝本
-- 0170-0173），本刀按协调方指定用 0174 避撞（收据 ai-docs/delivery/receipts/ag-b-classify/）。

-- ============================================================================
-- ①：ai_model_invocation.usage_source 列 + CHECK（短码枚举·新码须再迁移扩枚举）
-- ============================================================================
ALTER TABLE ai_model_invocation
  ADD COLUMN IF NOT EXISTS usage_source text;
ALTER TABLE ai_model_invocation
  DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_usage_source;
ALTER TABLE ai_model_invocation
  ADD CONSTRAINT ck_ai_model_invocation_usage_source
  CHECK (usage_source IS NULL OR usage_source IN ('usage_missing'));

-- ============================================================================
-- ②：ai_model_terminalize_scoped 镜像 0088 增 p_usage_source（DROP+CREATE·10 参·末参 DEFAULT NULL）
-- body 与 0088 :623-691 逐字一致，仅三处增量：参数行、输入校验一行、UPDATE 一列。
-- ============================================================================
DROP FUNCTION IF EXISTS ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer);

CREATE FUNCTION ai_model_terminalize_scoped(
  p_owner_user_id text,
  p_idempotency_key text,
  p_status text,
  p_error_code text,
  p_output jsonb,
  p_replayable boolean,
  p_input_tokens integer,
  p_output_tokens integer,
  p_latency_ms integer,
  p_usage_source text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE completed integer;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_status IS NULL OR p_status NOT IN ('succeeded','failed','unknown')
    OR (p_error_code IS NOT NULL AND p_error_code !~ '^[A-Za-z0-9._:-]{1,120}$')
    OR (p_input_tokens IS NOT NULL AND p_input_tokens < 0)
    OR (p_output_tokens IS NOT NULL AND p_output_tokens < 0)
    OR (p_latency_ms IS NOT NULL AND p_latency_ms < 0)
    OR (p_usage_source IS NOT NULL AND p_usage_source NOT IN ('usage_missing')) THEN
    RAISE EXCEPTION 'ai_model_terminalize_invalid_input' USING ERRCODE='check_violation';
  END IF;
  IF p_status='succeeded' AND (p_error_code IS NOT NULL OR p_output IS NULL) THEN
    RAISE EXCEPTION 'ai_model_terminalize_success_invalid' USING ERRCODE='check_violation';
  END IF;
  IF p_status IN ('failed','unknown') AND (p_error_code IS NULL OR p_output IS NOT NULL) THEN
    RAISE EXCEPTION 'ai_model_terminalize_failure_invalid' USING ERRCODE='check_violation';
  END IF;
  -- Follow the same existing-row lock order as claim/dispatch/reconcile.
  PERFORM 1
    FROM ai_model_invocation
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
   FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO ai_model_invocation_transition_permit(
    owner_user_id,idempotency_key,expected_old_status,expected_new_status
  ) VALUES (p_owner_user_id,p_idempotency_key,'dispatching',p_status)
  ON CONFLICT (owner_user_id,idempotency_key) DO NOTHING;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE ai_model_invocation
     SET status=p_status,error_code=p_error_code,output=p_output,replayable=COALESCE(p_replayable,true),
         input_tokens=p_input_tokens,output_tokens=p_output_tokens,latency_ms=p_latency_ms,
         usage_source=p_usage_source,
         lease_token=NULL,lease_expires_at=NULL,
         completed_at=CASE WHEN p_status IN ('succeeded','failed') THEN clock_timestamp() ELSE NULL END,
         updated_at=clock_timestamp()
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND status='dispatching';
  GET DIAGNOSTICS completed = ROW_COUNT;
  IF completed=1 THEN RETURN true; END IF;
  DELETE FROM ai_model_invocation_transition_permit
   WHERE owner_user_id=p_owner_user_id AND idempotency_key=p_idempotency_key
     AND expected_old_status='dispatching' AND expected_new_status=p_status;
  RETURN false;
END;
$$;

-- 权限镜像 0088 :741/:745（DROP 后重授；既有 9 参调用形经 DEFAULT 继续解析）。
REVOKE ALL ON FUNCTION ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer,text) TO app_role;

-- ============================================================================
-- ③：ai_usage_calibration_pairs_scoped 镜像 0119 :438-475 仅 WHERE 增打标剔除谓词。
-- 只产出「estimate 与 provider usage 均可用且非打标」的配对：usage_missing 行的 input_tokens
-- 是上限补齐的假 usage（AG-14 口径 2 修复后的保守多记），进配对会把 AG-12 因子喂成
-- max/estimate 假样本（EXPERT-REVIEWS §四 :37）。
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
       AND i.usage_source IS DISTINCT FROM 'usage_missing'
       AND h.model IS NOT NULL
     ORDER BY i.completed_at, i.idempotency_key;
END;
$$;

REVOKE ALL ON FUNCTION ai_usage_calibration_pairs_scoped(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_usage_calibration_pairs_scoped(text) TO app_role;
