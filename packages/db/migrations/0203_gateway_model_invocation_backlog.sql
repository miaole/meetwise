-- 0203_gateway_model_invocation_backlog.sql — RECONCILE-RETRY · model_invocation 积压水位只读 gateway 函数
--
-- @migration-mode multi-statement
--
-- #10（5C 批）翻案刀观测半：unknown 未决集（completed_at 恒 NULL·0088:672/:716）write-only
-- 积累而积压水位零观测（裁决=(c) 仅可观测化·零行为变更）。聚合只读·零 owner/PII/原文
-- （gateway-dispatch.ts:35-37 政策沿承）。dispatching_aged=超窗悬挂深度（稳态 0·>0=对账落后）；
-- unknown_unresolved=未决账单歧义存量。两谓词皆 0037:32-33 部分索引可服务·零新索引。
-- 窗口校验同 gateway_model_invocation_owners（0056:44 22023 形逐字）。

CREATE OR REPLACE FUNCTION gateway_model_invocation_backlog(p_older_than_ms integer)
RETURNS TABLE(dispatching_aged bigint, unknown_unresolved bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_older_than_ms IS NULL OR p_older_than_ms < 35000 OR p_older_than_ms > 3600000 THEN
    RAISE EXCEPTION 'gateway_model_invocation_reconcile_window_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT
      (SELECT count(*)::bigint FROM public.ai_model_invocation AS i
       WHERE i.status='dispatching'
         AND i.dispatched_at < clock_timestamp() - make_interval(secs => p_older_than_ms::double precision / 1000.0)),
      (SELECT count(*)::bigint FROM public.ai_model_invocation AS u
       WHERE u.status='unknown' AND u.completed_at IS NULL);
END;
$$;

REVOKE ALL ON FUNCTION gateway_model_invocation_backlog(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_model_invocation_backlog(integer) TO app_gateway_role;
