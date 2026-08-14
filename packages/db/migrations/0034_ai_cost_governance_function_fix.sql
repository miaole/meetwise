-- 0034_ai_cost_governance_function_fix.sql
-- 0033 已发布后发现 PL/pgSQL 的 RETURNS TABLE 输出列与月度账本字段同名，UPDATE 解析会歧义。
-- 增量替换函数，绝不改写已发布迁移；同时把 release 收紧为仅派发前可释放。

CREATE OR REPLACE FUNCTION ai_cost_reserve(
  p_scope_id text, p_request_owner text, p_idempotency_key text,
  p_provider text, p_model text, p_region text, p_input_tokens integer
)
RETURNS TABLE(decision text, reserved_micro_cny bigint, price_revision text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  policy ai_cost_budget_policy%ROWTYPE; budget ai_cost_budget_month%ROWTYPE;
  prior ai_cost_reservation%ROWTYPE; price ai_cost_price_book%ROWTYPE;
  period text := to_char(clock_timestamp() AT TIME ZONE 'UTC', 'YYYY-MM'); reserve_cost bigint;
BEGIN
  IF p_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$' OR p_request_owner IS NULL OR char_length(p_request_owner) NOT BETWEEN 1 AND 512
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_input_tokens IS NULL OR p_input_tokens < 1 OR p_input_tokens > 1000000 THEN
    RAISE EXCEPTION 'ai_cost_invalid_reservation_input' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO policy FROM ai_cost_budget_policy WHERE scope_id=p_scope_id FOR UPDATE;
  IF NOT FOUND OR NOT policy.enabled THEN RETURN QUERY SELECT 'policy_missing'::text,0::bigint,NULL::text; RETURN; END IF;
  SELECT * INTO prior FROM ai_cost_reservation WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key FOR UPDATE;
  IF FOUND THEN
    IF prior.request_owner_user_id <> p_request_owner THEN RAISE EXCEPTION 'ai_cost_reservation_owner_mismatch' USING ERRCODE='insufficient_privilege'; END IF;
    RETURN QUERY SELECT CASE prior.status WHEN 'reserved' THEN 'held' WHEN 'dispatching' THEN 'unknown' WHEN 'unknown' THEN 'unknown' WHEN 'settled' THEN 'settled' ELSE 'released' END, prior.reserved_micro_cny,prior.price_revision;
    RETURN;
  END IF;
  SELECT * INTO price FROM ai_cost_price_book WHERE provider=p_provider AND model=p_model AND region=p_region AND effective_at<=clock_timestamp() ORDER BY effective_at DESC,revision DESC LIMIT 1;
  IF NOT FOUND THEN RETURN QUERY SELECT 'price_missing'::text,0::bigint,NULL::text; RETURN; END IF;
  reserve_cost := CEIL(p_input_tokens::numeric*price.input_micro_cny_per_million::numeric/1000000::numeric)::bigint;
  INSERT INTO ai_cost_budget_month(scope_id,period_key,limit_micro_cny) VALUES(p_scope_id,period,policy.monthly_limit_micro_cny) ON CONFLICT(scope_id,period_key) DO NOTHING;
  SELECT * INTO budget FROM ai_cost_budget_month WHERE scope_id=p_scope_id AND period_key=period FOR UPDATE;
  IF budget.reserved_micro_cny+budget.settled_micro_cny+reserve_cost>budget.limit_micro_cny THEN RETURN QUERY SELECT 'budget_exhausted'::text,reserve_cost,price.revision; RETURN; END IF;
  UPDATE ai_cost_budget_month b SET reserved_micro_cny=b.reserved_micro_cny+reserve_cost,version=b.version+1,updated_at=clock_timestamp() WHERE b.scope_id=p_scope_id AND b.period_key=period;
  INSERT INTO ai_cost_reservation(scope_id,request_owner_user_id,idempotency_key,provider,model,region,price_revision,period_key,input_tokens_reserved,input_micro_cny_per_million,reserved_micro_cny,status)
  VALUES(p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,price.revision,period,p_input_tokens,price.input_micro_cny_per_million,reserve_cost,'reserved');
  RETURN QUERY SELECT 'reserved'::text,reserve_cost,price.revision;
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_settle(p_scope_id text,p_request_owner text,p_idempotency_key text,p_actual_input_tokens integer)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r ai_cost_reservation%ROWTYPE; actual_cost bigint;
BEGIN
  IF p_actual_input_tokens IS NULL OR p_actual_input_tokens<0 THEN RAISE EXCEPTION 'ai_cost_invalid_actual_tokens' USING ERRCODE='check_violation'; END IF;
  SELECT * INTO r FROM ai_cost_reservation WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ai_cost_reservation_missing' USING ERRCODE='no_data_found'; END IF;
  IF r.status='settled' THEN RETURN r.settled_micro_cny; END IF;
  IF r.status<>'dispatching' THEN RAISE EXCEPTION 'ai_cost_settle_invalid_state:%',r.status USING ERRCODE='check_violation'; END IF;
  actual_cost:=CEIL(p_actual_input_tokens::numeric*r.input_micro_cny_per_million::numeric/1000000::numeric)::bigint;
  IF actual_cost>r.reserved_micro_cny THEN RAISE EXCEPTION 'ai_cost_actual_exceeds_reservation' USING ERRCODE='check_violation'; END IF;
  UPDATE ai_cost_budget_month b SET reserved_micro_cny=b.reserved_micro_cny-r.reserved_micro_cny,settled_micro_cny=b.settled_micro_cny+actual_cost,version=b.version+1,updated_at=clock_timestamp() WHERE b.scope_id=r.scope_id AND b.period_key=r.period_key;
  UPDATE ai_cost_reservation SET status='settled',settled_micro_cny=actual_cost,settled_at=clock_timestamp(),updated_at=clock_timestamp() WHERE scope_id=r.scope_id AND idempotency_key=r.idempotency_key;
  RETURN actual_cost;
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_release(p_scope_id text,p_request_owner text,p_idempotency_key text,p_reason text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r ai_cost_reservation%ROWTYPE; updated_count integer;
BEGIN
  SELECT * INTO r FROM ai_cost_reservation WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner FOR UPDATE;
  -- 只能释放尚未派发的预留；派发后即使调用方自称失败，也属于可能已被供应商接受的未知结果，必须对账。
  IF NOT FOUND OR r.status<>'reserved' THEN RETURN false; END IF;
  UPDATE ai_cost_budget_month b SET reserved_micro_cny=b.reserved_micro_cny-r.reserved_micro_cny,version=b.version+1,updated_at=clock_timestamp() WHERE b.scope_id=r.scope_id AND b.period_key=r.period_key;
  UPDATE ai_cost_reservation SET status='released',reason_code=left(COALESCE(p_reason,'released'),120),updated_at=clock_timestamp() WHERE scope_id=r.scope_id AND idempotency_key=r.idempotency_key;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count=1;
END;
$$;
