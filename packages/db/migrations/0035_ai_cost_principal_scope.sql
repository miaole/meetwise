-- 0035_ai_cost_principal_scope.sql
-- app_role 可执行的费用过程必须把参数 owner 与 RLS principal 绑定；否则恶意内部调用可用他人 owner 消耗共享预算。

CREATE OR REPLACE FUNCTION ai_cost_require_request_owner(p_request_owner text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF current_setting('app.principal_user',true) IS DISTINCT FROM p_request_owner THEN
    RAISE EXCEPTION 'ai_cost_principal_mismatch' USING ERRCODE='insufficient_privilege';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_reserve_scoped(p_scope_id text,p_request_owner text,p_idempotency_key text,p_provider text,p_model text,p_region text,p_input_tokens integer)
RETURNS TABLE(decision text,reserved_micro_cny bigint,price_revision text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  RETURN QUERY SELECT * FROM ai_cost_reserve(p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,p_input_tokens);
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_mark_dispatched_scoped(p_scope_id text,p_request_owner text,p_idempotency_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN PERFORM ai_cost_require_request_owner(p_request_owner); RETURN ai_cost_mark_dispatched(p_scope_id,p_request_owner,p_idempotency_key); END; $$;

CREATE OR REPLACE FUNCTION ai_cost_settle_scoped(p_scope_id text,p_request_owner text,p_idempotency_key text,p_actual_input_tokens integer)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN PERFORM ai_cost_require_request_owner(p_request_owner); RETURN ai_cost_settle(p_scope_id,p_request_owner,p_idempotency_key,p_actual_input_tokens); END; $$;

CREATE OR REPLACE FUNCTION ai_cost_release_scoped(p_scope_id text,p_request_owner text,p_idempotency_key text,p_reason text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN PERFORM ai_cost_require_request_owner(p_request_owner); RETURN ai_cost_release(p_scope_id,p_request_owner,p_idempotency_key,p_reason); END; $$;

CREATE OR REPLACE FUNCTION ai_cost_mark_unknown_scoped(p_scope_id text,p_request_owner text,p_idempotency_key text,p_reason text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN PERFORM ai_cost_require_request_owner(p_request_owner); RETURN ai_cost_mark_unknown(p_scope_id,p_request_owner,p_idempotency_key,p_reason); END; $$;

REVOKE ALL ON FUNCTION ai_cost_reserve(text,text,text,text,text,text,integer) FROM app_role;
REVOKE ALL ON FUNCTION ai_cost_mark_dispatched(text,text,text) FROM app_role;
REVOKE ALL ON FUNCTION ai_cost_settle(text,text,text,integer) FROM app_role;
REVOKE ALL ON FUNCTION ai_cost_release(text,text,text,text) FROM app_role;
REVOKE ALL ON FUNCTION ai_cost_mark_unknown(text,text,text,text) FROM app_role;
REVOKE ALL ON FUNCTION ai_cost_require_request_owner(text) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION ai_cost_reserve_scoped(text,text,text,text,text,text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_mark_dispatched_scoped(text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_settle_scoped(text,text,text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_release_scoped(text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_mark_unknown_scoped(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_reserve_scoped(text,text,text,text,text,text,integer) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_mark_dispatched_scoped(text,text,text) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_settle_scoped(text,text,text,integer) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_release_scoped(text,text,text,text) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_mark_unknown_scoped(text,text,text,text) TO app_role;
