-- 0033_ai_cost_governance.sql
--
-- 外部 AI 调用的费用护栏。这里不把“估算成本”当日志字段，而是做成调用前已提交的
-- 预留账本：预算不足在 HTTP 请求前拒绝；响应丢失则保留 unknown，禁止应用盲重试。
-- 金额单位为 micro-CNY（1 元 = 1,000,000 micro-CNY），避免浮点比较与超额。

CREATE TABLE IF NOT EXISTS ai_cost_price_book (
  provider text NOT NULL CHECK (provider ~ '^[A-Za-z0-9._-]{1,80}$'),
  model text NOT NULL CHECK (model ~ '^[A-Za-z0-9._:-]{1,160}$'),
  region text NOT NULL CHECK (region ~ '^[A-Za-z0-9._-]{1,80}$'),
  revision text NOT NULL CHECK (revision ~ '^[A-Za-z0-9._:-]{1,80}$'),
  input_micro_cny_per_million bigint NOT NULL CHECK (input_micro_cny_per_million >= 0),
  source_url text NOT NULL CHECK (char_length(source_url) BETWEEN 8 AND 2000),
  effective_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(provider, model, region, revision)
);

CREATE TABLE IF NOT EXISTS ai_cost_budget_policy (
  scope_id text PRIMARY KEY CHECK (scope_id ~ '^[A-Za-z0-9._:-]{1,160}$'),
  monthly_limit_micro_cny bigint NOT NULL CHECK (monthly_limit_micro_cny > 0),
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_cost_budget_month (
  scope_id text NOT NULL REFERENCES ai_cost_budget_policy(scope_id),
  period_key text NOT NULL CHECK (period_key ~ '^\d{4}-\d{2}$'),
  limit_micro_cny bigint NOT NULL CHECK (limit_micro_cny > 0),
  reserved_micro_cny bigint NOT NULL DEFAULT 0 CHECK (reserved_micro_cny >= 0),
  settled_micro_cny bigint NOT NULL DEFAULT 0 CHECK (settled_micro_cny >= 0),
  version bigint NOT NULL DEFAULT 0 CHECK (version >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(scope_id, period_key),
  CHECK (reserved_micro_cny + settled_micro_cny <= limit_micro_cny)
);

CREATE TABLE IF NOT EXISTS ai_cost_reservation (
  scope_id text NOT NULL REFERENCES ai_cost_budget_policy(scope_id),
  request_owner_user_id text NOT NULL CHECK (char_length(request_owner_user_id) BETWEEN 1 AND 512),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 256),
  provider text NOT NULL,
  model text NOT NULL,
  region text NOT NULL,
  price_revision text NOT NULL,
  period_key text NOT NULL CHECK (period_key ~ '^\d{4}-\d{2}$'),
  input_tokens_reserved integer NOT NULL CHECK (input_tokens_reserved > 0),
  input_micro_cny_per_million bigint NOT NULL CHECK (input_micro_cny_per_million >= 0),
  reserved_micro_cny bigint NOT NULL CHECK (reserved_micro_cny >= 0),
  settled_micro_cny bigint,
  status text NOT NULL CHECK (status IN ('reserved','dispatching','settled','released','unknown')),
  reason_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  dispatched_at timestamptz,
  settled_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(scope_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS ix_ai_cost_reservation_unknown
  ON ai_cost_reservation(scope_id, created_at) WHERE status='unknown';
CREATE INDEX IF NOT EXISTS ix_ai_cost_reservation_owner
  ON ai_cost_reservation(request_owner_user_id, created_at DESC);

-- 0022 已建的 claim 在外部结果未知时不能换一个新 token 后直接重发。应用的
-- claim upsert 只续期、不改 lease_token，因此会复用原 token；费用账本可识别为同一外部意图。
-- 成功/确定性失败仍会删除 claim，下一次正常 cache miss 才会得到新 token。

-- 调用方只经 SECURITY DEFINER 过程读写；表自身不向 app_role 开放，避免伪造预算、
-- 修改价格或窥探企业/全局总额。函数只返回 decision 和金额，不返回其他主体的账目。
REVOKE ALL ON ai_cost_price_book, ai_cost_budget_policy, ai_cost_budget_month, ai_cost_reservation FROM app_role;

CREATE OR REPLACE FUNCTION ai_cost_reserve(
  p_scope_id text, p_request_owner text, p_idempotency_key text,
  p_provider text, p_model text, p_region text, p_input_tokens integer
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
    OR p_input_tokens IS NULL OR p_input_tokens < 1 OR p_input_tokens > 1000000 THEN
    RAISE EXCEPTION 'ai_cost_invalid_reservation_input' USING ERRCODE='check_violation';
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
  reserve_cost := CEIL(p_input_tokens::numeric * price.input_micro_cny_per_million::numeric / 1000000::numeric)::bigint;

  INSERT INTO ai_cost_budget_month(scope_id,period_key,limit_micro_cny)
  VALUES (p_scope_id,period,policy.monthly_limit_micro_cny)
  ON CONFLICT (scope_id,period_key) DO NOTHING;
  SELECT * INTO budget FROM ai_cost_budget_month WHERE scope_id=p_scope_id AND period_key=period FOR UPDATE;
  IF budget.reserved_micro_cny + budget.settled_micro_cny + reserve_cost > budget.limit_micro_cny THEN
    RETURN QUERY SELECT 'budget_exhausted'::text, reserve_cost, price.revision;
    RETURN;
  END IF;

  UPDATE ai_cost_budget_month SET reserved_micro_cny=reserved_micro_cny+reserve_cost, version=version+1, updated_at=clock_timestamp()
   WHERE scope_id=p_scope_id AND period_key=period;
  INSERT INTO ai_cost_reservation(scope_id,request_owner_user_id,idempotency_key,provider,model,region,price_revision,period_key,input_tokens_reserved,input_micro_cny_per_million,reserved_micro_cny,status)
  VALUES (p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,price.revision,period,p_input_tokens,price.input_micro_cny_per_million,reserve_cost,'reserved');
  RETURN QUERY SELECT 'reserved'::text, reserve_cost, price.revision;
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_mark_dispatched(p_scope_id text,p_request_owner text,p_idempotency_key text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE updated_count integer;
BEGIN
  UPDATE ai_cost_reservation SET status='dispatching',dispatched_at=clock_timestamp(),updated_at=clock_timestamp()
   WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner AND status='reserved';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count=1;
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_settle(p_scope_id text,p_request_owner text,p_idempotency_key text,p_actual_input_tokens integer)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE r ai_cost_reservation%ROWTYPE; actual_cost bigint;
BEGIN
  IF p_actual_input_tokens IS NULL OR p_actual_input_tokens < 0 THEN RAISE EXCEPTION 'ai_cost_invalid_actual_tokens' USING ERRCODE='check_violation'; END IF;
  SELECT * INTO r FROM ai_cost_reservation WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ai_cost_reservation_missing' USING ERRCODE='no_data_found'; END IF;
  IF r.status='settled' THEN RETURN r.settled_micro_cny; END IF;
  IF r.status <> 'dispatching' THEN RAISE EXCEPTION 'ai_cost_settle_invalid_state:%', r.status USING ERRCODE='check_violation'; END IF;
  actual_cost := CEIL(p_actual_input_tokens::numeric * r.input_micro_cny_per_million::numeric / 1000000::numeric)::bigint;
  IF actual_cost > r.reserved_micro_cny THEN RAISE EXCEPTION 'ai_cost_actual_exceeds_reservation' USING ERRCODE='check_violation'; END IF;
  UPDATE ai_cost_budget_month
     SET reserved_micro_cny=reserved_micro_cny-r.reserved_micro_cny,
         settled_micro_cny=settled_micro_cny+actual_cost, version=version+1, updated_at=clock_timestamp()
   WHERE scope_id=r.scope_id AND period_key=r.period_key;
  UPDATE ai_cost_reservation SET status='settled',settled_micro_cny=actual_cost,settled_at=clock_timestamp(),updated_at=clock_timestamp()
   WHERE scope_id=r.scope_id AND idempotency_key=r.idempotency_key;
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
  IF NOT FOUND OR r.status <> 'reserved' THEN RETURN false; END IF;
  UPDATE ai_cost_budget_month SET reserved_micro_cny=reserved_micro_cny-r.reserved_micro_cny,version=version+1,updated_at=clock_timestamp()
   WHERE scope_id=r.scope_id AND period_key=r.period_key;
  UPDATE ai_cost_reservation SET status='released',reason_code=left(COALESCE(p_reason,'released'),120),updated_at=clock_timestamp()
   WHERE scope_id=r.scope_id AND idempotency_key=r.idempotency_key;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count=1;
END;
$$;

CREATE OR REPLACE FUNCTION ai_cost_mark_unknown(p_scope_id text,p_request_owner text,p_idempotency_key text,p_reason text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE updated_count integer;
BEGIN
  UPDATE ai_cost_reservation SET status='unknown',reason_code=left(COALESCE(p_reason,'external_outcome_unknown'),120),updated_at=clock_timestamp()
   WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner AND status='dispatching';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count=1;
END;
$$;

REVOKE ALL ON FUNCTION ai_cost_reserve(text,text,text,text,text,text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_mark_dispatched(text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_settle(text,text,text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_release(text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ai_cost_mark_unknown(text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_reserve(text,text,text,text,text,text,integer) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_mark_dispatched(text,text,text) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_settle(text,text,text,integer) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_release(text,text,text,text) TO app_role;
GRANT EXECUTE ON FUNCTION ai_cost_mark_unknown(text,text,text,text) TO app_role;
