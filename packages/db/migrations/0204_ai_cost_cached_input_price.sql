-- 0204_ai_cost_cached_input_price.sql — #48/#49：结算区分 cached_input 与普通 input 价（价格列熔单·expand-only）
--
-- @migration-mode multi-statement
--
-- #48/#49 语义权威=issues-final :550「输入缓存零收益、cached_tokens 不计量、价格本没有缓存价」。
-- 观测半 AG-COST1 已落（invoke.ts cachedInputTokens 三端点兼容读取+METRIC/Langfuse，只观测零计费）；
-- 本刀把结算面三处零字节翻成计量面：
--   缺口① 价格本零 cached 价列（0033:12 仅 input 单价列·0036:10-12 补 output 列先例）；
--   缺口② 预留零 cached 价捕获（0083:88-94 INSERT 仅捕 input/output 双价）；
--   缺口③ 结算公式 cached 全价整算（0188:323-325 CEIL(input×input价)+CEIL(output×output价)）。
--
-- 行为保持铁律（全件适用）：
--   ① 供应商未回报 cached 计量（调用方传 0）→结算与现行公式逐位恒等（保守多计方向不变；
--      parse 层「缺席≠零」三态铁律零触——缺席在 TS 侧归 0 后入参，本函数只收 integer）；
--   ② 价格行 cached 价为 NULL（未设缓存价·含全部存量行）→cached 部分按 input 价计：
--      CEIL 拆分对现行全价整算偏差 ≤+1 micro-CNY·恒保守多计向·cached=0 时逐位恒等；
--   ③ 存量已 settled 行不可变零触碰（幂等回读 settled_micro_cny 路径原样）；
--   ④ GREATEST 单调不缩史值与 header 冻结上限双守卫（0188:303-321/:335-341）零字节
--      （cached ≤ input 被新入参守卫封闭·input 上限守卫自然覆盖总量）。
--
-- expand-only：零新表零 DROP COLUMN 零 ALTER COLUMN TYPE 零 NOT NULL 回填零存量行触碰。
-- 两段式 ADD COLUMN+CHECK NOT VALID/VALIDATE 独立语句沿 0192 先例形（PG16 fast-default
-- 元数据形零全表 rewrite·VALIDATE 分语句不持长锁）。
--
-- 语句清单（14 语句）：两表各 3（ADD COLUMN / ADD CHECK NOT VALID / VALIDATE）+
-- reserve_text 九参 CREATE OR REPLACE 1（9 参签名+RETURNS TABLE 零变=REPLACE 合法零 DROP，
-- ACL 随 OR REPLACE 保留）+settle_text 六参 3（DROP+CREATE+REVOKE）+scoped 六参 4
-- （DROP+CREATE+REVOKE+GRANT）。
--
-- ACL 机制注记：settle_text 核心 ACL 原设于 0036:184（REVOKE ALL 五参 FROM PUBLIC,app_role）。
-- 函数身份变更（五参→六参）→恰一 DROP+CREATE（禁 overload 双存沿 0188 先例），DROP 湮灭原设
-- ACL，故 REVOKE 随发显式收敛。CREATE 复默认层面：0073:1342 `ALTER DEFAULT PRIVILEGES REVOKE
-- EXECUTE ON FUNCTIONS FROM PUBLIC` 已按创建角色收回默认 PUBLIC EXECUTE（迁移角色所建函数实际
-- 不获 PUBLIC），但默认特权按创建角色生效、非表级恒等——本语句仍为正确显式收敛（app_role 面
-- 与非迁移角色创建路径的显式 fail-closed 不依赖默认特权推导；scoped wrapper ACL 随发沿
-- 0188:371-372 先例形换六参）。

ALTER TABLE ai_cost_price_book
  ADD COLUMN IF NOT EXISTS cached_input_micro_cny_per_million bigint;

ALTER TABLE ai_cost_price_book
  ADD CONSTRAINT ai_cost_price_book_cached_input_check
  CHECK (cached_input_micro_cny_per_million IS NULL OR cached_input_micro_cny_per_million >= 0) NOT VALID;

ALTER TABLE ai_cost_price_book VALIDATE CONSTRAINT ai_cost_price_book_cached_input_check;

ALTER TABLE ai_cost_reservation
  ADD COLUMN IF NOT EXISTS cached_input_micro_cny_per_million bigint;

ALTER TABLE ai_cost_reservation
  ADD CONSTRAINT ai_cost_reservation_cached_input_check
  CHECK (cached_input_micro_cny_per_million IS NULL OR cached_input_micro_cny_per_million >= 0) NOT VALID;

ALTER TABLE ai_cost_reservation VALIDATE CONSTRAINT ai_cost_reservation_cached_input_check;

-- reserve_text 体逐字承载 0083 现行形·仅 INSERT 列集与 VALUES 增 cached_input_micro_cny_per_million
-- / price.cached_input_micro_cny_per_million 恰两处（SELECT * INTO price %ROWTYPE 自扩展零改；
-- 绑定谓词五键 provider/model/region/revision/effective_at 对 cached 列失明=设计恒等·零改）。
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
    cached_input_micro_cny_per_million,
    reserved_micro_cny,status
  ) VALUES (
    p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,p_price_revision,period,
    p_input_tokens,p_output_tokens,price.input_micro_cny_per_million,price.output_micro_cny_per_million,
    price.cached_input_micro_cny_per_million,
    reserve_cost,'reserved'
  );
  RETURN QUERY SELECT 'reserved'::text, reserve_cost, p_price_revision;
END;
$$;

-- settle_text 五参→六参：函数身份变更→恰一 DROP+CREATE（六参无 DEFAULT fail-closed：
-- 漏改调用点即 SQL 报错显形·禁 overload 双存沿 0188 先例）。体=0188:282-344 逐字承载+恰三处扩：
-- ①入参守卫段加 cached 三查（NULL/<0/>input → ai_cost_cached_exceeds_input·check_violation）；
-- ②公式改三段 CEIL（cached=0 逐位恒等现行值·NULL 缓存价 COALESCE 回 input 价）；
-- ③settle UPDATE 零加列（input_tokens_actual 存 input 全量语义维持·cached 实量 DB 持久化
-- 归观测数据窗后继刀）。header join/上限守卫/GREATEST 段零字节。
DROP FUNCTION ai_cost_settle_text(text,text,text,integer,integer);
CREATE FUNCTION ai_cost_settle_text(
  p_scope_id text,p_request_owner text,p_idempotency_key text,
  p_actual_input_tokens integer,p_actual_output_tokens integer,
  p_actual_cached_input_tokens integer
)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  r ai_cost_reservation%ROWTYPE;
  actual_cost bigint;
  v_header_max_input integer;
  v_header_max_output integer;
  v_overage boolean;
BEGIN
  IF p_actual_input_tokens IS NULL OR p_actual_output_tokens IS NULL
    OR p_actual_input_tokens < 0 OR p_actual_output_tokens < 0 THEN
    RAISE EXCEPTION 'ai_cost_invalid_text_actual_tokens' USING ERRCODE='check_violation';
  END IF;
  IF p_actual_cached_input_tokens IS NULL OR p_actual_cached_input_tokens < 0
    OR p_actual_cached_input_tokens > p_actual_input_tokens THEN
    RAISE EXCEPTION 'ai_cost_cached_exceeds_input' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO r FROM ai_cost_reservation
   WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key AND request_owner_user_id=p_request_owner FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ai_cost_reservation_missing' USING ERRCODE='no_data_found'; END IF;
  IF r.status='settled' THEN RETURN r.settled_micro_cny; END IF;
  IF r.status <> 'dispatching' THEN RAISE EXCEPTION 'ai_cost_settle_invalid_state:%', r.status USING ERRCODE='check_violation'; END IF;
  -- header 冻结上限解析（join 链=预留→调用行→header；defensive：invocation/header 缺行或
  -- 计费上限列 NULL→COALESCE 退回预留自身值=现严格语义，fail-closed 不扩权）。
  SELECT COALESCE(h.max_input_tokens, r.input_tokens_reserved),
         COALESCE(h.max_output_tokens, r.output_tokens_reserved)
    INTO v_header_max_input, v_header_max_output
    FROM ai_model_invocation AS i
    JOIN ai_model_logical_node_header AS h
      ON h.owner_user_id=i.owner_user_id
     AND h.logical_node_key_digest=i.logical_node_key_digest
   WHERE i.owner_user_id=r.request_owner_user_id
     AND i.idempotency_key=r.idempotency_key
     AND i.cost_scope_id=r.scope_id;
  IF NOT FOUND THEN
    v_header_max_input := r.input_tokens_reserved;
    v_header_max_output := r.output_tokens_reserved;
  END IF;
  IF p_actual_input_tokens > v_header_max_input OR p_actual_output_tokens > v_header_max_output THEN
    RAISE EXCEPTION 'ai_cost_actual_exceeds_reservation' USING ERRCODE='check_violation';
  END IF;
  actual_cost :=
    CEIL((p_actual_input_tokens - p_actual_cached_input_tokens)::numeric * r.input_micro_cny_per_million::numeric / 1000000::numeric)::bigint
    + CEIL(p_actual_cached_input_tokens::numeric * COALESCE(r.cached_input_micro_cny_per_million, r.input_micro_cny_per_million)::numeric / 1000000::numeric)::bigint
    + CEIL(p_actual_output_tokens::numeric * r.output_micro_cny_per_million::numeric / 1000000::numeric)::bigint;
  -- 行内扩：仅 actual>reserved 侧单调扩（不缩史值）；overage 标记随同 UPDATE 落定。
  v_overage := p_actual_input_tokens > r.input_tokens_reserved
    OR p_actual_output_tokens > r.output_tokens_reserved
    OR actual_cost > r.reserved_micro_cny;
  UPDATE ai_cost_budget_month AS m
     SET reserved_micro_cny=m.reserved_micro_cny-r.reserved_micro_cny,
         settled_micro_cny=m.settled_micro_cny+actual_cost,version=m.version+1,updated_at=clock_timestamp()
   WHERE m.scope_id=r.scope_id AND m.period_key=r.period_key;
  UPDATE ai_cost_reservation
     SET status='settled',settled_micro_cny=actual_cost,
         input_tokens_reserved=GREATEST(r.input_tokens_reserved,p_actual_input_tokens),
         output_tokens_reserved=GREATEST(r.output_tokens_reserved,p_actual_output_tokens),
         reserved_micro_cny=GREATEST(r.reserved_micro_cny,actual_cost),
         input_tokens_actual=p_actual_input_tokens,
         output_tokens_actual=p_actual_output_tokens,
         overage=v_overage,
         settled_at=clock_timestamp(),updated_at=clock_timestamp()
   WHERE scope_id=r.scope_id AND idempotency_key=r.idempotency_key;
  RETURN actual_cost;
END;
$$;
-- ACL 显式收敛（DROP 湮灭 0036:184 原设 ACL·机制注记见文件头——SECURITY DEFINER 核心结算
-- 入口 fail-closed 面不依赖创建角色默认特权推导）。
REVOKE ALL ON FUNCTION ai_cost_settle_text(text,text,text,integer,integer,integer) FROM PUBLIC,app_role;

-- scoped settle wrapper 五参→六参：恰一 DROP+CREATE（禁 OUT overload）·体逐字承载 0188:354-368
-- 仅传参 +1·回读形零变。ACL 恰两行随发（0188:371-372 同形换六参签名）。
DROP FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer);
CREATE FUNCTION ai_cost_settle_text_scoped(
  p_scope_id text,p_request_owner text,p_idempotency_key text,p_actual_input_tokens integer,p_actual_output_tokens integer,
  p_actual_cached_input_tokens integer
)
RETURNS TABLE(micro_cny bigint, overage boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_micro bigint;
  v_overage boolean;
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  v_micro := ai_cost_settle_text(p_scope_id,p_request_owner,p_idempotency_key,p_actual_input_tokens,p_actual_output_tokens,p_actual_cached_input_tokens);
  SELECT r.overage INTO v_overage
    FROM ai_cost_reservation AS r
   WHERE r.scope_id=p_scope_id AND r.idempotency_key=r.idempotency_key AND r.request_owner_user_id=p_request_owner;
  RETURN QUERY SELECT v_micro, COALESCE(v_overage, false);
END;
$$;
REVOKE ALL ON FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_cost_settle_text_scoped(text,text,text,integer,integer,integer) TO app_role;
