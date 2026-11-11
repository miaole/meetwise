-- 0231_g5_n14_admission_breaker_peek.sql
-- G5 N-14（备用端点接线）：只读断路器探查，供 invoke 在 durable claim 之前做纯路由选择。
--
-- 问题：AG-08 把共享准入/熔断按端点分域（0200 种子：deepseek-cn-public / dashscope-cn-beijing
-- 各 7 行），但 invoke 只在 claim 之后才 acquire。主端点熔断打开时 acquire 返回 breaker_open，
-- claim 被释放、重试仍落主端点——预绑定的备用端点（registry MODEL_COST_FAILOVER_PREBOUND_ENDPOINT_KEYS）
-- 永远选不到。claim 已冻结 cost 身份与 request digest，claim 之后换端点必然撞
-- model_failover_cost_policy_mismatch / idempotency_key_payload_mismatch，所以换轨只能发生在
-- claim 之前，而 claim 之前需要一个“不占槽、不占探针、不改相位”的只读探查。
--
-- 语义（与 0120 acquire 的断路器入场判定同口径，只读）：
--   breaker_open           phase='open' 且冷却未到期（acquire 会拒 breaker_open）；
--   breaker_half_open_busy phase='half_open' 且探针租约未过期（acquire 会拒 half_open_busy）；
--   available              其余（含行不存在、closed、open 已冷却待转 half_open、half_open 探针空闲/过期）。
-- 策略行不存在 / 非 allowed 也返回 available：本函数只回答“断路器是否挡路”，准入拒绝仍由
-- acquire 在 claim 之后给出原错误码（不改变任何既有拒绝语义）。
--
-- 只读：零 INSERT/UPDATE/FOR UPDATE；不写断路器行、不认领并发槽、不拿 half_open 探针。
-- 探查与随后 acquire 之间可能有竞态，这只影响“选主还是选备”，不影响正确性：
-- 选错的一侧仍由 acquire 以原错误码拒绝并释放 claim（AG-D 案A 可重领）。
CREATE OR REPLACE FUNCTION ai_model_admission_breaker_peek_scoped(
  p_owner_user_id text,
  p_provider_account text,
  p_region text,
  p_model_or_recipe text,
  p_operation_id text
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  policy_row ai_model_admission_policy%ROWTYPE;
  breaker ai_model_breaker_state%ROWTYPE;
BEGIN
  PERFORM ai_cost_require_request_owner(p_owner_user_id);
  IF p_owner_user_id IS NULL OR char_length(p_owner_user_id) NOT BETWEEN 1 AND 512
    OR p_provider_account IS NULL OR p_provider_account !~ '^[A-Za-z0-9._-]{1,80}$'
    OR p_region IS NULL OR p_region !~ '^[A-Za-z0-9._-]{1,80}$'
    OR p_model_or_recipe IS NULL OR p_model_or_recipe !~ '^[A-Za-z0-9._:-]{1,160}$'
    OR p_operation_id IS NULL OR p_operation_id !~ '^[A-Za-z0-9][A-Za-z0-9.-]{2,127}\.v[0-9]{1,3}$' THEN
    RAISE EXCEPTION 'ai_model_admission_peek_invalid_input' USING ERRCODE='check_violation';
  END IF;

  SELECT * INTO policy_row FROM ai_model_admission_policy
   WHERE provider_account=p_provider_account AND region=p_region
     AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id;
  IF NOT FOUND THEN
    RETURN 'available';
  END IF;

  SELECT * INTO breaker FROM ai_model_breaker_state
   WHERE provider_account=p_provider_account AND region=p_region
     AND model_or_recipe=p_model_or_recipe AND operation_id=p_operation_id;
  IF NOT FOUND THEN
    RETURN 'available';
  END IF;

  IF breaker.phase = 'open'
    AND breaker.opened_at IS NOT NULL
    AND (EXTRACT(EPOCH FROM (clock_timestamp() - breaker.opened_at)) * 1000)::bigint < policy_row.breaker_cooldown_ms THEN
    RETURN 'breaker_open';
  END IF;
  IF breaker.phase = 'half_open'
    AND breaker.half_open_probe_token IS NOT NULL
    AND breaker.half_open_probe_expires_at IS NOT NULL
    AND breaker.half_open_probe_expires_at > clock_timestamp() THEN
    RETURN 'breaker_half_open_busy';
  END IF;
  RETURN 'available';
END;
$$;

REVOKE ALL ON FUNCTION ai_model_admission_breaker_peek_scoped(text,text,text,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION ai_model_admission_breaker_peek_scoped(text,text,text,text,text) TO app_role;
