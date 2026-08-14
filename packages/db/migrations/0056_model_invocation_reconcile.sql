-- 0056_model_invocation_reconcile.sql
--
-- A process may lose its database connection after the external model send but
-- before it can terminalize `ai_model_invocation`/`ai_cost_reservation`.  Such
-- work is externally indeterminate: reconciliation may only freeze it as
-- unknown, never replay or release it.

CREATE OR REPLACE FUNCTION ai_cost_mark_unknown_for_model_reconcile_scoped(
  p_request_owner text,
  p_idempotency_key text,
  p_reason text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE changed integer;
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  IF p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_reason IS NULL OR p_reason !~ '^[A-Za-z0-9._:-]{1,120}$' THEN
    RAISE EXCEPTION 'ai_cost_model_reconcile_invalid_input' USING ERRCODE='check_violation';
  END IF;
  UPDATE ai_cost_reservation
     SET status='unknown', reason_code=p_reason, updated_at=clock_timestamp()
   WHERE request_owner_user_id=p_request_owner
     AND idempotency_key=p_idempotency_key
     AND status='dispatching';
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed;
END;
$$;

REVOKE ALL ON FUNCTION ai_cost_mark_unknown_for_model_reconcile_scoped(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_mark_unknown_for_model_reconcile_scoped(text,text,text) TO app_role;

-- This fixed gateway function exposes only principals with stale work.  The
-- gateway role cannot inspect prompts, invocation rows, costs, or payloads.
CREATE OR REPLACE FUNCTION gateway_model_invocation_owners(p_older_than_ms integer)
RETURNS TABLE(owner_user_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_older_than_ms IS NULL OR p_older_than_ms < 35000 OR p_older_than_ms > 3600000 THEN
    RAISE EXCEPTION 'gateway_model_invocation_reconcile_window_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT DISTINCT i.owner_user_id::text
      FROM public.ai_model_invocation AS i
     WHERE i.status='dispatching'
       AND i.dispatched_at < clock_timestamp() - make_interval(secs => p_older_than_ms::double precision / 1000.0);
END;
$$;

REVOKE ALL ON FUNCTION gateway_model_invocation_owners(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_model_invocation_owners(integer) TO app_gateway_role;
