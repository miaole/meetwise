-- 0134_usage_calibration_gateway_owners.sql
--
-- MODEL-OP-wire：usage 校准 worker 调度的跨 owner 枚举缝。
-- gateway 只返回「有 estimate↔provider usage 配对」的 owner id；每 owner 的 reconcile
-- 仍在 RLS principal 事务内跑（与 gateway_model_invocation_owners / commerce 同构）。
-- 不暴露 invocation 内容、prompt、usage 明细。
--
-- Honesty: wiring the periodic reconciler ≠ MODEL-OP closed / ≠ SLO green /
-- ≠ Redis wake cutover / ≠ delete PG LISTEN. releaseEvidence=false.

CREATE OR REPLACE FUNCTION gateway_usage_calibration_owners()
RETURNS TABLE(owner_user_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT i.owner_user_id::text
      FROM public.ai_model_invocation AS i
     WHERE i.estimate_input_tokens IS NOT NULL
       AND i.input_tokens IS NOT NULL
       AND i.completed_at IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION gateway_usage_calibration_owners() FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_usage_calibration_owners() TO app_gateway_role;
