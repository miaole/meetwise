-- 0042_runtime_observability_gateway.sql
-- The runtime login sees only fixed aggregate operational metrics through
-- app_gateway_role. It never receives SELECT on queues or cost-ledger tables.

CREATE OR REPLACE FUNCTION gateway_job_gauges()
RETURNS TABLE(queue text, queued bigint, running_expired bigint, dead bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  RETURN QUERY
    SELECT 'interview_job'::text, count(*) FILTER (WHERE j.status = 'queued')::bigint,
           count(*) FILTER (WHERE j.status = 'running' AND j.lease_expires_at < clock_timestamp())::bigint,
           count(*) FILTER (WHERE j.status = 'failed')::bigint FROM public.interview_job AS j
    UNION ALL
    SELECT 'report'::text, count(*) FILTER (WHERE r.status = 'queued')::bigint,
           count(*) FILTER (WHERE r.status = 'running' AND r.lease_expires_at < clock_timestamp())::bigint,
           count(*) FILTER (WHERE r.status = 'quarantined')::bigint FROM public.ai_report AS r
    UNION ALL
    SELECT 'quiz_job'::text, count(*) FILTER (WHERE q.status = 'queued')::bigint,
           count(*) FILTER (WHERE q.status = 'running' AND q.lease_expires_at < clock_timestamp())::bigint,
           count(*) FILTER (WHERE q.status = 'failed')::bigint FROM public.quiz_job AS q
    UNION ALL
    SELECT 'diagnosis_job'::text, count(*) FILTER (WHERE d.status = 'queued')::bigint,
           count(*) FILTER (WHERE d.status = 'running' AND d.lease_expires_at < clock_timestamp())::bigint,
           count(*) FILTER (WHERE d.status = 'failed')::bigint FROM public.diagnosis_job AS d;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_cost_budget_snapshot(p_scope_id text)
RETURNS TABLE(monthly_limit_micro_cny bigint, used_micro_cny bigint, unknown_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF p_scope_id IS NULL OR p_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$' THEN
    RAISE EXCEPTION 'gateway_cost_budget_invalid_scope' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT p.monthly_limit_micro_cny, coalesce(m.reserved_micro_cny, 0) + coalesce(m.settled_micro_cny, 0),
           (SELECT count(*)::bigint FROM public.ai_cost_reservation AS x WHERE x.scope_id = p.scope_id AND x.status = 'unknown')
    FROM public.ai_cost_budget_policy AS p
    LEFT JOIN public.ai_cost_budget_month AS m ON m.scope_id = p.scope_id
      AND m.period_key = to_char(clock_timestamp() AT TIME ZONE 'UTC', 'YYYY-MM')
    WHERE p.scope_id = p_scope_id AND p.enabled = true;
END;
$$;

REVOKE ALL ON FUNCTION gateway_job_gauges() FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION gateway_cost_budget_snapshot(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_job_gauges() TO app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_cost_budget_snapshot(text) TO app_gateway_role;
