-- 0036_ai_text_cost_governance.sql
--
-- 0033 只覆盖 embedding 的输入 token。本迁移把同一个不可变价格账本扩展到
-- 文本/多模态模型的输入与输出 token；旧 RAG revision 的输出价格固定为 0，语义不变。
-- 新增过程与旧过程并存，避免把已验证的 RAG 状态机改写成另一套行为。

ALTER TABLE ai_cost_price_book
  ADD COLUMN IF NOT EXISTS output_micro_cny_per_million bigint NOT NULL DEFAULT 0
    CHECK (output_micro_cny_per_million >= 0);

ALTER TABLE ai_cost_reservation
  ADD COLUMN IF NOT EXISTS output_tokens_reserved integer NOT NULL DEFAULT 0
    CHECK (output_tokens_reserved >= 0),
  ADD COLUMN IF NOT EXISTS output_micro_cny_per_million bigint NOT NULL DEFAULT 0
    CHECK (output_micro_cny_per_million >= 0),
  ADD COLUMN IF NOT EXISTS input_tokens_actual integer
    CHECK (input_tokens_actual >= 0),
  ADD COLUMN IF NOT EXISTS output_tokens_actual integer
    CHECK (output_tokens_actual >= 0);

CREATE OR REPLACE FUNCTION ai_cost_reserve_text(
  p_scope_id text, p_request_owner text, p_idempotency_key text,
  p_provider text, p_model text, p_region text,
  p_input_tokens integer, p_output_tokens integer
)
RETURNS TABLE(decision text, reserved_micro_cny bigint, price_revision text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  policy ai_cost_budget_policy%ROWTYPE;
  budget ai_cost_budget_month%ROWTYPE;
  prior ai_cost_reservation%ROWTYPE;
  price ai_cost_price_book%ROWTYPE;
  period text := to_char(clock_timestamp() AT TIME ZONE 'UTC', 'YYYY-MM');
  reserve_cost bigint;
BEGIN
  IF p_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$' OR p_request_owner IS NULL OR char_length(p_request_owner) NOT BETWEEN 1 AND 512
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_input_tokens IS NULL OR p_output_tokens IS NULL
    OR p_input_tokens < 0 OR p_input_tokens > 1000000
    OR p_output_tokens < 0 OR p_output_tokens > 1000000
    OR p_input_tokens + p_output_tokens < 1 THEN
    RAISE EXCEPTION 'ai_cost_invalid_text_reservation_input' USING ERRCODE='check_violation';
  END IF;

  SELECT * INTO policy FROM ai_cost_budget_policy WHERE scope_id=p_scope_id FOR UPDATE;
  IF NOT FOUND OR NOT policy.enabled THEN
    RETURN QUERY SELECT 'policy_missing'::text, 0::bigint, NULL::text;
    RETURN;
  END IF;

  SELECT * INTO prior FROM ai_cost_reservation WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key FOR UPDATE;
  IF FOUND THEN
    IF prior.request_owner_user_id <> p_request_owner THEN
      RAISE EXCEPTION 'ai_cost_reservation_owner_mismatch' USING ERRCODE='insufficient_privilege';
    END IF;
    RETURN QUERY SELECT
      CASE prior.status WHEN 'reserved' THEN 'held' WHEN 'dispatching' THEN 'unknown'
                        WHEN 'unknown' THEN 'unknown' WHEN 'settled' THEN 'settled' ELSE 'released' END,
      prior.reserved_micro_cny, prior.price_revision;
    RETURN;
  END IF;

  SELECT * INTO price FROM ai_cost_price_book
   WHERE provider=p_provider AND model=p_model AND region=p_region AND effective_at <= clock_timestamp()
   ORDER BY effective_at DESC, revision DESC LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'price_missing'::text, 0::bigint, NULL::text;
    RETURN;
  END IF;
  reserve_cost :=
    CEIL(p_input_tokens::numeric * price.input_micro_cny_per_million::numeric / 1000000::numeric)::bigint
    + CEIL(p_output_tokens::numeric * price.output_micro_cny_per_million::numeric / 1000000::numeric)::bigint;

  INSERT INTO ai_cost_budget_month(scope_id,period_key,limit_micro_cny)
  VALUES (p_scope_id,period,policy.monthly_limit_micro_cny)
  ON CONFLICT (scope_id,period_key) DO NOTHING;
  SELECT * INTO budget FROM ai_cost_budget_month WHERE scope_id=p_scope_id AND period_key=period FOR UPDATE;
  IF budget.reserved_micro_cny + budget.settled_micro_cny + reserve_cost > budget.limit_micro_cny THEN
    RETURN QUERY SELECT 'budget_exhausted'::text, reserve_cost, price.revision;
    RETURN;
  END IF;

  UPDATE ai_cost_budget_month AS m SET reserved_micro_cny=m.reserved_micro_cny+reserve_cost,version=m.version+1,updated_at=clock_timestamp()
   WHERE m.scope_id=p_scope_id AND m.period_key=period;
  INSERT INTO ai_cost_reservation(
    scope_id,request_owner_user_id,idempotency_key,provider,model,region,price_revision,period_key,
    input_tokens_reserved,output_tokens_reserved,input_micro_cny_per_million,output_micro_cny_per_million,
    reserved_micro_cny,status
  ) VALUES (
    p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,price.revision,period,
    p_input_tokens,p_output_tokens,price.input_micro_cny_per_million,price.output_micro_cny_per_million,
    reserve_cost,'reserved'
  );
  RETURN QUERY SELECT 'reserved'::text, reserve_cost, price.revision;
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_settle_text(
  p_scope_id text,p_request_owner text,p_idempotency_key text,
  p_actual_input_tokens integer,p_actual_output_tokens integer
)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r ai_cost_reservation%ROWTYPE; actual_cost bigint;
BEGIN
  IF p_actual_input_tokens IS NULL OR p_actual_output_tokens IS NULL
    OR p_actual_input_tokens < 0 OR p_actual_output_tokens < 0 THEN
    RAISE EXCEPTION 'ai_cost_invalid_text_actual_tokens' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO r FROM ai_cost_reservation
   WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ai_cost_reservation_missing' USING ERRCODE='no_data_found'; END IF;
  IF r.status='settled' THEN RETURN r.settled_micro_cny; END IF;
  IF r.status <> 'dispatching' THEN RAISE EXCEPTION 'ai_cost_settle_invalid_state:%', r.status USING ERRCODE='check_violation'; END IF;
  IF p_actual_input_tokens > r.input_tokens_reserved OR p_actual_output_tokens > r.output_tokens_reserved THEN
    RAISE EXCEPTION 'ai_cost_actual_exceeds_reservation' USING ERRCODE='check_violation';
  END IF;
  actual_cost :=
    CEIL(p_actual_input_tokens::numeric * r.input_micro_cny_per_million::numeric / 1000000::numeric)::bigint
    + CEIL(p_actual_output_tokens::numeric * r.output_micro_cny_per_million::numeric / 1000000::numeric)::bigint;
  IF actual_cost > r.reserved_micro_cny THEN
    RAISE EXCEPTION 'ai_cost_actual_exceeds_reservation' USING ERRCODE='check_violation';
  END IF;
  UPDATE ai_cost_budget_month AS m
     SET reserved_micro_cny=m.reserved_micro_cny-r.reserved_micro_cny,
         settled_micro_cny=m.settled_micro_cny+actual_cost,version=m.version+1,updated_at=clock_timestamp()
   WHERE m.scope_id=r.scope_id AND m.period_key=r.period_key;
  UPDATE ai_cost_reservation
     SET status='settled',settled_micro_cny=actual_cost,input_tokens_actual=p_actual_input_tokens,
         output_tokens_actual=p_actual_output_tokens,settled_at=clock_timestamp(),updated_at=clock_timestamp()
   WHERE scope_id=r.scope_id AND idempotency_key=r.idempotency_key;
  RETURN actual_cost;
END;
$$;

-- 只有收到了供应商明确的“未执行/拒绝”响应，才允许把已经派发的预留退回。
-- 超时、断链、5xx、响应体损坏都不能调用本过程，应转 unknown 并人工对账。
CREATE OR REPLACE FUNCTION ai_cost_mark_rejected(
  p_scope_id text,p_request_owner text,p_idempotency_key text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r ai_cost_reservation%ROWTYPE; updated_count integer;
BEGIN
  SELECT * INTO r FROM ai_cost_reservation
   WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner FOR UPDATE;
  IF NOT FOUND OR r.status <> 'dispatching' THEN RETURN false; END IF;
  UPDATE ai_cost_budget_month AS m SET reserved_micro_cny=m.reserved_micro_cny-r.reserved_micro_cny,version=m.version+1,updated_at=clock_timestamp()
   WHERE m.scope_id=r.scope_id AND m.period_key=r.period_key;
  UPDATE ai_cost_reservation SET status='released',reason_code='provider_rejected_before_execution',updated_at=clock_timestamp()
   WHERE scope_id=r.scope_id AND idempotency_key=r.idempotency_key;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count=1;
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_reserve_text_scoped(
  p_scope_id text,p_request_owner text,p_idempotency_key text,p_provider text,p_model text,p_region text,p_input_tokens integer,p_output_tokens integer
)
RETURNS TABLE(decision text,reserved_micro_cny bigint,price_revision text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  RETURN QUERY SELECT * FROM ai_cost_reserve_text(p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,p_input_tokens,p_output_tokens);
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_settle_text_scoped(
  p_scope_id text,p_request_owner text,p_idempotency_key text,p_actual_input_tokens integer,p_actual_output_tokens integer
)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN PERFORM ai_cost_require_request_owner(p_request_owner); RETURN ai_cost_settle_text(p_scope_id,p_request_owner,p_idempotency_key,p_actual_input_tokens,p_actual_output_tokens); END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_mark_rejected_scoped(p_scope_id text,p_request_owner text,p_idempotency_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN PERFORM ai_cost_require_request_owner(p_request_owner); RETURN ai_cost_mark_rejected(p_scope_id,p_request_owner,p_idempotency_key); END;
$$;

REVOKE ALL ON FUNCTION ai_cost_reserve_text(text,text,text,text,text,text,integer,integer) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION ai_cost_settle_text(text,text,text,integer,integer) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION ai_cost_mark_rejected(text,text,text) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION ai_cost_reserve_text_scoped(text,text,text,text,text,text,integer,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_mark_rejected_scoped(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_reserve_text_scoped(text,text,text,text,text,text,integer,integer) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_mark_rejected_scoped(text,text,text) TO app_role;
