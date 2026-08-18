-- 0083_ai_text_cost_price_revision_binding.sql
--
-- A text-model dispatch must reserve against the immutable price revision
-- selected by its policy.  The legacy eight-argument entry point used
-- `effective_at DESC` to silently select the then-latest price row, which
-- made a durable request's accounting identity drift during a rollout.

CREATE OR REPLACE FUNCTION ai_cost_reserve_text(
  p_scope_id text, p_request_owner text, p_idempotency_key text,
  p_provider text, p_model text, p_region text, p_price_revision text,
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
    OR p_provider IS NULL OR p_provider !~ '^[A-Za-z0-9._-]{1,80}$'
    OR p_model IS NULL OR p_model !~ '^[A-Za-z0-9._:-]{1,160}$'
    OR p_region IS NULL OR p_region !~ '^[A-Za-z0-9._-]{1,80}$'
    OR p_price_revision IS NULL OR p_price_revision !~ '^[A-Za-z0-9._:-]{1,80}$'
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
    -- A replay may observe the existing immutable reservation, but it must not
    -- present a newly configured model/rate/token envelope under the same key.
    IF prior.provider <> p_provider OR prior.model <> p_model OR prior.region <> p_region
      OR prior.price_revision <> p_price_revision
      OR prior.input_tokens_reserved <> p_input_tokens
      OR prior.output_tokens_reserved <> p_output_tokens THEN
      RETURN QUERY SELECT 'binding_mismatch'::text, 0::bigint, prior.price_revision;
      RETURN;
    END IF;
    RETURN QUERY SELECT
      CASE prior.status WHEN 'reserved' THEN 'held' WHEN 'dispatching' THEN 'unknown'
                        WHEN 'unknown' THEN 'unknown' WHEN 'settled' THEN 'settled' ELSE 'released' END,
      prior.reserved_micro_cny, prior.price_revision;
    RETURN;
  END IF;

  SELECT * INTO price FROM ai_cost_price_book
   WHERE provider=p_provider AND model=p_model AND region=p_region AND revision=p_price_revision
     AND effective_at <= clock_timestamp();
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
    p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,p_price_revision,period,
    p_input_tokens,p_output_tokens,price.input_micro_cny_per_million,price.output_micro_cny_per_million,
    reserve_cost,'reserved'
  );
  RETURN QUERY SELECT 'reserved'::text, reserve_cost, p_price_revision;
END;
$$;

-- Startup can prove that its immutable environment receipt still maps to the
-- exact price row without receiving raw table privileges or price-book reads.
CREATE OR REPLACE FUNCTION ai_cost_text_price_binding_matches_scoped(
  p_scope_id text,p_provider text,p_model text,p_region text,p_price_revision text,
  p_input_micro_cny_per_million bigint,p_output_micro_cny_per_million bigint,p_source_url text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM ai_cost_budget_policy AS b
      JOIN ai_cost_price_book AS p
        ON p.provider=$2 AND p.model=$3 AND p.region=$4 AND p.revision=$5
     WHERE b.scope_id=$1 AND b.enabled
       AND p.input_micro_cny_per_million=$6
       AND p.output_micro_cny_per_million=$7
       AND p.source_url=$8
       AND p.effective_at <= clock_timestamp()
  )
$$;

-- New callers can only reach the revision-bound procedure.  Retain the old
-- signature for historical migration compatibility but remove its runtime ACL
-- so an outdated worker fails closed instead of selecting a latest price.
REVOKE ALL ON FUNCTION ai_cost_reserve_text(text,text,text,text,text,text,integer,integer) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION ai_cost_reserve_text_scoped(text,text,text,text,text,text,integer,integer) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION ai_cost_reserve_text(text,text,text,text,text,text,text,integer,integer) FROM PUBLIC,app_role;
REVOKE ALL ON FUNCTION ai_cost_text_price_binding_matches_scoped(text,text,text,text,text,bigint,bigint,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_text_price_binding_matches_scoped(text,text,text,text,text,bigint,bigint,text) TO app_role;

CREATE OR REPLACE FUNCTION ai_cost_reserve_text_scoped(
  p_scope_id text,p_request_owner text,p_idempotency_key text,p_provider text,p_model text,p_region text,p_price_revision text,p_input_tokens integer,p_output_tokens integer
)
RETURNS TABLE(decision text,reserved_micro_cny bigint,price_revision text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  RETURN QUERY SELECT * FROM ai_cost_reserve_text(p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,p_price_revision,p_input_tokens,p_output_tokens);
END;
$$;

REVOKE ALL ON FUNCTION ai_cost_reserve_text_scoped(text,text,text,text,text,text,text,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_reserve_text_scoped(text,text,text,text,text,text,text,integer,integer) TO app_role;
