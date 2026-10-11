-- 23_api_gateway.sql — API 无主体/跨主体操作的受限数据库网关。
-- app_gateway_role 没有业务表权限；app_role 的跨用户入口也必须在函数内部再核验
-- current principal，避免把 HTTP 层 guard 当成唯一授权边界。

CREATE OR REPLACE FUNCTION gateway_auth_signup(
  p_id text,
  p_email text,
  p_password_hash text,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_id IS NULL OR p_id = '' OR p_email IS NULL OR p_email = ''
    OR p_password_hash IS NULL OR p_password_hash = '' OR p_role NOT IN ('candidate', 'recruiter') THEN
    RAISE EXCEPTION 'gateway_auth_signup_invalid_input' USING ERRCODE = '22023';
  END IF;
  -- b110 审核制：recruiter 注册一律落审核队列（admin approve 后方过 B 端门）；candidate 走默认 approved。
  IF p_role = 'recruiter' THEN
    INSERT INTO public.user_account(id, email, password_hash, role, approval_status)
    VALUES (p_id, p_email, p_password_hash, p_role, 'pending');
  ELSE
    INSERT INTO public.user_account(id, email, password_hash, role)
    VALUES (p_id, p_email, p_password_hash, p_role);
  END IF;
  -- 注册赠送一次体验额度（#228 D1 已决）：signup+grant 同事务原子——注册 23505 回滚则桶不存在；
  -- 桶冲突 DO NOTHING 不拖垮注册。kind='trial'·units_total=1.00（1 次面试=1.00）·expires 同 paid 先例
  -- now()+interval '365 days'·source_order_id=NULL（无单）。幂等每用户一次由 partial unique index
  -- uq_bucket_trial_one_per_owner 兜底；ON CONFLICT 谓词与 index 定义逐字一致。
  -- （b110 回填并集注：trial 发放对 candidate/recruiter 两态注册同适用，与审核维度正交。）
  INSERT INTO public.entitlement_bucket(owner_user_id, kind, units_total, expires_at)
  VALUES (p_id, 'trial', 1.00, now() + interval '365 days')
  ON CONFLICT (owner_user_id) WHERE kind = 'trial' DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_auth_login(p_email text)
RETURNS TABLE(id text, password_hash text, status text, role text, pwd_epoch int)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT u.id, u.password_hash, u.status, u.role, u.pwd_epoch
  FROM public.user_account AS u
  WHERE u.email = p_email
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION gateway_payment_order_owner(p_order_id text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT p.owner_user_id
  FROM public.payment_order AS p
  WHERE p.id = p_order_id
$$;

CREATE OR REPLACE FUNCTION gateway_require_active_recruiter()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE caller text := current_setting('app.principal_user', true);
BEGIN
  -- b110（R7）：在 role/status 之外加审批维度（fail-closed 只增不弱）。
  -- gateway_active_candidate PERFORM 本函数 = invite 的 DB 纵深门：绕 API guard 的
  -- app_role 直调路径对 pending/rejected recruiter 同样拒绝。
  IF caller IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_account
    WHERE id = caller AND role = 'recruiter' AND status = 'active' AND approval_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'gateway_recruiter_required' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_active_candidate(p_candidate_id text, p_candidate_email text)
RETURNS TABLE(id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.gateway_require_active_recruiter();
  IF (p_candidate_id IS NULL AND p_candidate_email IS NULL)
    OR (p_candidate_id IS NOT NULL AND p_candidate_email IS NOT NULL) THEN
    RAISE EXCEPTION 'gateway_candidate_lookup_requires_exactly_one_key' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT u.id
    FROM public.user_account AS u
    WHERE u.status = 'active'
      AND u.role = 'candidate'
      AND ((p_candidate_id IS NOT NULL AND u.id = p_candidate_id)
        OR (p_candidate_email IS NOT NULL AND u.email = p_candidate_email))
    LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_require_active_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE caller text := current_setting('app.principal_user', true);
BEGIN
  IF caller IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_account
    WHERE id = caller AND is_admin = true AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'gateway_admin_required' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_users()
RETURNS TABLE(id text, email text, status text, is_admin boolean, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY
    SELECT u.id, u.email, u.status, u.is_admin, u.created_at
    FROM public.user_account AS u
    ORDER BY u.created_at DESC
    LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_orders()
RETURNS TABLE(id text, owner_user_id text, product_id text, amount_cents int, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY
    SELECT p.id, p.owner_user_id, p.product_id, p.amount_cents, p.status
    FROM public.payment_order AS p
    ORDER BY p.created_at DESC
    LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_stats()
RETURNS TABLE(users bigint, orders bigint, paid_cents bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY
    SELECT count(*)::bigint,
           (SELECT count(*)::bigint FROM public.payment_order),
           (SELECT coalesce(sum(amount_cents) FILTER (WHERE status = 'paid'), 0)::bigint FROM public.payment_order)
    FROM public.user_account;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_disable(p_target_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE caller text := current_setting('app.principal_user', true);
DECLARE updated_rows integer := 0;
BEGIN
  PERFORM public.gateway_require_active_admin();
  UPDATE public.user_account SET status = 'disabled'
  WHERE id = p_target_id;
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows > 0 THEN
    INSERT INTO public.admin_audit(id, actor, action, target)
    VALUES ('audit-' || gen_random_uuid()::text, caller, 'disable_user', p_target_id);
  END IF;
  RETURN updated_rows > 0;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_audit()
RETURNS TABLE(id text, actor text, action text, target text, detail jsonb, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY
    SELECT a.id, a.actor, a.action, a.target, a.detail, a.created_at
    FROM public.admin_audit AS a
    ORDER BY a.created_at DESC
    LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_feedback_summary()
RETURNS TABLE(up bigint, down bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY
    SELECT count(*) FILTER (WHERE rating = 'up')::bigint,
           count(*) FILTER (WHERE rating = 'down')::bigint
    FROM public.question_feedback;
END;
$$;

-- b110：招聘方审核队列（pending 先到先审，其余为最近态）+ 审批裁决（admin_audit 留痕
-- 照 gateway_admin_disable 样板；approve = 企业付费主体诞生时刻，#271 挂点）。
CREATE OR REPLACE FUNCTION gateway_admin_recruiter_approvals()
RETURNS TABLE(id text, email text, approval_status text, status text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY
    SELECT u.id, u.email, u.approval_status, u.status, u.created_at
    FROM public.user_account AS u
    WHERE u.role = 'recruiter'
    ORDER BY (u.approval_status = 'pending') DESC,
             CASE WHEN u.approval_status = 'pending' THEN u.created_at END ASC,
             u.created_at DESC
    LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_recruiter_approval(p_target_id text, p_decision text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE caller text := current_setting('app.principal_user', true);
DECLARE updated_rows integer := 0;
BEGIN
  PERFORM public.gateway_require_active_admin();
  IF p_decision NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'gateway_admin_recruiter_approval_invalid_decision' USING ERRCODE = '22023';
  END IF;
  UPDATE public.user_account
  SET approval_status = CASE p_decision WHEN 'approve' THEN 'approved' ELSE 'rejected' END
  WHERE id = p_target_id AND role = 'recruiter';
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows > 0 THEN
    INSERT INTO public.admin_audit(id, actor, action, target)
    VALUES ('audit-' || gen_random_uuid()::text, caller,
            CASE p_decision WHEN 'approve' THEN 'approve_recruiter' ELSE 'reject_recruiter' END, p_target_id);
  END IF;
  RETURN updated_rows > 0;
END;
$$;


-- B271 片1：对公转账受控函数族（迁移 0156 同形·照 gateway_admin_disable 0041:107-120 样板：
-- require_active_admin + admin_audit INSERT）。入账复用同一 CAS 语义（created→paid WHERE NOT EXISTS
-- 同 provider_txn·bank_ref 作 provider_txn·uq_payment_order_provider_txn 防一笔流水入两单）；
-- 企业桶落位 kind='enterprise'。金额不符/录入人==确认人/流水冲突一律具名拒绝且不入账。
CREATE OR REPLACE FUNCTION gateway_admin_offline_remit_entry(p_order_id text, p_bank_ref text, p_amount_cents int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE caller text := current_setting('app.principal_user', true);
DECLARE v_channel text; v_status text;
BEGIN
  PERFORM public.gateway_require_active_admin();
  IF p_order_id IS NULL OR p_bank_ref IS NULL OR p_bank_ref = '' OR p_amount_cents IS NULL OR p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'offline_remit_entry_invalid_input';
  END IF;
  SELECT channel, status INTO v_channel, v_status FROM public.payment_order WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'offline_remit_order_not_found'; END IF;
  IF v_channel <> 'offline' THEN RAISE EXCEPTION 'offline_remit_order_not_offline'; END IF;
  IF v_status <> 'created' THEN RAISE EXCEPTION 'offline_remit_order_not_entrant'; END IF;
  INSERT INTO public.offline_remit_record(order_id, bank_ref, amount_cents, entered_by)
    VALUES (p_order_id, p_bank_ref, p_amount_cents, caller);
  INSERT INTO public.admin_audit(id, actor, action, target, detail)
    VALUES ('audit-' || gen_random_uuid()::text, caller, 'offline_remit_entry', p_order_id,
            jsonb_build_object('bank_ref', p_bank_ref, 'amount', p_amount_cents, 'actor', caller));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_offline_remit_confirm(p_order_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE caller text := current_setting('app.principal_user', true);
DECLARE r public.offline_remit_record%ROWTYPE;
DECLARE v_amount int; v_owner text; v_txn text; v_status text;
BEGIN
  PERFORM public.gateway_require_active_admin();
  IF p_order_id IS NULL THEN RAISE EXCEPTION 'offline_remit_confirm_invalid_input'; END IF;
  SELECT * INTO r FROM public.offline_remit_record WHERE order_id = p_order_id FOR UPDATE;
  IF NOT FOUND OR r.status <> 'entered' THEN RAISE EXCEPTION 'offline_remit_order_not_entrant'; END IF;
  IF r.entered_by = caller THEN
    RAISE EXCEPTION 'offline_remit_segregation_required';
  END IF;
  SELECT amount_cents, owner_user_id, status INTO v_amount, v_owner, v_status
    FROM public.payment_order WHERE id = p_order_id;
  IF NOT FOUND OR v_status <> 'created' THEN RAISE EXCEPTION 'offline_remit_order_not_entrant'; END IF;
  IF r.amount_cents <> v_amount THEN
    RAISE EXCEPTION 'offline_remit_amount_mismatch';
  END IF;
  BEGIN
    UPDATE public.payment_order
       SET status='paid', provider_txn=r.bank_ref, version=version+1
     WHERE id = p_order_id AND status='created'
       AND NOT EXISTS (SELECT 1 FROM public.payment_order claimed WHERE claimed.provider_txn = r.bank_ref)
    RETURNING owner_user_id INTO v_owner;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'offline_remit_provider_txn_conflict';
  END;
  IF NOT FOUND THEN
    -- 未改到 = 非 created。幂等重放通道：同单已 paid 且 provider_txn=本流水 → 台账补齐 confirmed 后 already；
    -- 同流水已被**其他**订单占用 → 具名 provider_txn_conflict（B271 §4.1-2「同一银行流水号确认第二单 → conflict」）。
    SELECT provider_txn, status INTO v_txn, v_status FROM public.payment_order WHERE id = p_order_id;
    IF EXISTS (SELECT 1 FROM public.payment_order claimed
                WHERE claimed.provider_txn = r.bank_ref AND claimed.id <> p_order_id) THEN
      RAISE EXCEPTION 'offline_remit_provider_txn_conflict';
    END IF;
    IF v_status = 'paid' AND v_txn = r.bank_ref THEN
      UPDATE public.offline_remit_record
         SET status='confirmed', confirmed_by=caller, confirmed_at=now()
       WHERE order_id = p_order_id AND status='entered' AND confirmed_by IS DISTINCT FROM caller;
      RETURN true;
    END IF;
    RAISE EXCEPTION 'offline_remit_order_not_entrant';
  END IF;
  UPDATE public.offline_remit_record
     SET status='confirmed', confirmed_by=caller, confirmed_at=now()
   WHERE order_id = p_order_id;
  INSERT INTO public.entitlement_bucket(owner_user_id, kind, units_total, expires_at, source_order_id)
    SELECT v_owner, 'enterprise', units, now() + interval '365 days', p_order_id
      FROM public.payment_order WHERE id = p_order_id;
  INSERT INTO public.admin_audit(id, actor, action, target, detail)
    VALUES ('audit-' || gen_random_uuid()::text, caller, 'offline_remit_confirm', p_order_id,
            jsonb_build_object('order', p_order_id, 'bank_ref', r.bank_ref, 'amount', r.amount_cents, 'actor', caller));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_offline_remit_fail(p_order_id text, p_reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE caller text := current_setting('app.principal_user', true);
DECLARE updated_rows integer := 0;
BEGIN
  PERFORM public.gateway_require_active_admin();
  IF p_order_id IS NULL THEN RAISE EXCEPTION 'offline_remit_fail_invalid_input'; END IF;
  UPDATE public.payment_order SET status='failed', version=version+1
   WHERE id = p_order_id AND status='created';
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows > 0 THEN
    UPDATE public.offline_remit_record
       SET status='failed', failed_by=caller, failed_at=now()
     WHERE order_id = p_order_id AND status='entered';
    INSERT INTO public.admin_audit(id, actor, action, target, detail)
      VALUES ('audit-' || gen_random_uuid()::text, caller, 'offline_remit_fail', p_order_id,
              jsonb_build_object('reason', coalesce(p_reason, ''), 'actor', caller));
  END IF;
  RETURN updated_rows > 0;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_offline_remit_queue()
RETURNS TABLE(order_id text, owner_user_id text, product_id text, amount_cents int, channel text,
              order_status text, bank_ref text, remit_amount_cents int, remit_status text,
              entered_by text, entered_at timestamptz, confirmed_by text, confirmed_at timestamptz,
              created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY
    SELECT p.id, p.owner_user_id, p.product_id, p.amount_cents, p.channel, p.status,
           r.bank_ref, r.amount_cents, r.status, r.entered_by, r.entered_at, r.confirmed_by, r.confirmed_at,
           p.created_at
      FROM public.payment_order p
      LEFT JOIN public.offline_remit_record r ON r.order_id = p.id
     WHERE p.channel = 'offline'
     ORDER BY p.created_at DESC
     LIMIT 100;
END;
$$;

REVOKE ALL ON FUNCTION gateway_auth_signup(text, text, text, text) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION gateway_auth_login(text) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION gateway_payment_order_owner(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_auth_signup(text, text, text, text) TO app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_auth_login(text) TO app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_payment_order_owner(text) TO app_gateway_role;

REVOKE ALL ON FUNCTION gateway_require_active_recruiter() FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_require_active_admin() FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_recruiter_approvals() FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_recruiter_approval(text, text) FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_active_candidate(text, text) FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_users() FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_orders() FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_stats() FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_disable(text) FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_audit() FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_feedback_summary() FROM PUBLIC, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_active_candidate(text, text) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_users() TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_orders() TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_stats() TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_disable(text) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_audit() TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_feedback_summary() TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_recruiter_approvals() TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_recruiter_approval(text, text) TO app_role;

REVOKE ALL ON FUNCTION gateway_admin_offline_remit_entry(text, text, int) FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_offline_remit_confirm(text) FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_offline_remit_fail(text, text) FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_offline_remit_queue() FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_admin_offline_remit_entry(text, text, int) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_offline_remit_confirm(text) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_offline_remit_fail(text, text) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_offline_remit_queue() TO app_role;

-- ── B271 片2 扣费路由受控函数（0157 镜像·SECURITY DEFINER·岗位面试企业桶扣费·D-1 裁决=形状甲）──
CREATE OR REPLACE FUNCTION gateway_entpay_reserve(
  p_application_id text, p_idempotency_key text, p_service_type text, p_units numeric, p_lease_seconds int
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_owner text := current_setting('app.principal_user', true);
  v_payer text;
  v_existing text;
  v_consumption uuid;
  b record;
  v_remaining numeric := p_units;
  v_alloc jsonb := '[]'::jsonb;
BEGIN
  IF v_owner IS NULL OR length(v_owner) = 0 THEN
    RAISE EXCEPTION 'entpay_principal_missing';
  END IF;
  IF p_application_id IS NULL OR p_idempotency_key IS NULL OR length(p_idempotency_key) = 0
     OR p_service_type IS NULL OR p_units IS NULL OR p_units <= 0 OR p_lease_seconds IS NULL THEN
    RAISE EXCEPTION 'entpay_reserve_invalid_input';
  END IF;
  SELECT recruiter_user_id INTO v_payer FROM job_application
   WHERE id = p_application_id AND candidate_user_id = v_owner;
  IF NOT FOUND OR v_payer IS NULL OR length(v_payer) = 0 THEN
    RAISE EXCEPTION 'entpay_application_not_found';
  END IF;
  INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, payer_user_id, lease_expires_at)
  VALUES (v_owner, p_idempotency_key, p_service_type, p_units, v_payer, now() + (p_lease_seconds || ' seconds')::interval)
  ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING
  RETURNING id INTO v_consumption;
  IF v_consumption IS NULL THEN
    SELECT id INTO v_existing FROM entitlement_consumption
     WHERE owner_user_id = v_owner AND idempotency_key = p_idempotency_key;
    RETURN 'duplicate:' || coalesce(v_existing, 'missing');
  END IF;
  FOR b IN
    SELECT id, (units_total - units_reserved - units_consumed) AS avail
      FROM entitlement_bucket
     WHERE owner_user_id = v_payer AND kind = 'enterprise' AND expires_at > now()
       AND (units_total - units_reserved - units_consumed) > 0
     ORDER BY expires_at ASC, id ASC
     FOR UPDATE
  LOOP
    EXIT WHEN v_remaining <= 0;
    IF b.avail > 0 THEN
      UPDATE entitlement_bucket SET units_reserved = units_reserved + least(b.avail, v_remaining), version = version + 1
       WHERE id = b.id AND (units_total - units_reserved - units_consumed) >= least(b.avail, v_remaining);
      IF FOUND THEN
        v_alloc := v_alloc || jsonb_build_array(jsonb_build_object('bucket_id', b.id, 'units', least(b.avail, v_remaining)));
        v_remaining := v_remaining - least(b.avail, v_remaining);
      END IF;
    END IF;
  END LOOP;
  IF v_remaining > 0 THEN
    RAISE EXCEPTION 'insufficient_entitlement' USING ERRCODE = 'P0001';
  END IF;
  UPDATE entitlement_consumption SET allocations = v_alloc WHERE id = v_consumption;
  RETURN 'reserved:' || v_consumption::text;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_entpay_apply_allocation(
  p_idempotency_key text, p_bucket_id text, p_reserved_delta numeric, p_consumed_delta numeric
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_owner text := current_setting('app.principal_user', true);
BEGIN
  IF v_owner IS NULL OR length(v_owner) = 0 THEN
    RAISE EXCEPTION 'entpay_apply_principal_missing';
  END IF;
  IF p_idempotency_key IS NULL OR length(p_idempotency_key) = 0 OR p_bucket_id IS NULL
     OR p_reserved_delta IS NULL OR p_consumed_delta IS NULL THEN
    RAISE EXCEPTION 'entpay_apply_invalid_input';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM entitlement_consumption
     WHERE owner_user_id = v_owner AND idempotency_key = p_idempotency_key
       AND allocations @> jsonb_build_array(jsonb_build_object('bucket_id', p_bucket_id::uuid))
  ) THEN
    RAISE EXCEPTION 'entpay_apply_scope_rejected';
  END IF;
  UPDATE entitlement_bucket
     SET units_reserved = units_reserved + p_reserved_delta,
         units_consumed = units_consumed + p_consumed_delta,
         version = version + 1
   WHERE id = p_bucket_id::uuid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'entpay_apply_bucket_missing';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION gateway_entpay_reserve(text, text, text, numeric, int) FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_entpay_apply_allocation(text, text, numeric, numeric) FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_entpay_reserve(text, text, text, numeric, int) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_entpay_apply_allocation(text, text, numeric, numeric) TO app_role;

-- ── B271 片3 招聘方自服对公订单读函数（0159 镜像·SECURITY DEFINER·本人行作用域=0156 queue 同形去 admin 门）──
CREATE OR REPLACE FUNCTION gateway_entpay_my_offline_orders()
RETURNS TABLE(order_id text, product_id text, amount_cents int, order_status text,
              remit_status text, entered_at timestamptz, confirmed_at timestamptz,
              created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN QUERY
    SELECT p.id, p.product_id, p.amount_cents, p.status,
           r.status, r.entered_at, r.confirmed_at, p.created_at
      FROM public.payment_order p
      LEFT JOIN public.offline_remit_record r ON r.order_id = p.id
     WHERE p.channel = 'offline'
       AND p.owner_user_id = current_setting('app.principal_user', true)
     ORDER BY p.created_at DESC
     LIMIT 100;
END;
$$;

REVOKE ALL ON FUNCTION gateway_entpay_my_offline_orders() FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_entpay_my_offline_orders() TO app_role;

-- ── I2 B-DELIVERABLE B 端最小定性投影读函数（0160 镜像·SECURITY DEFINER·0159 受控函数族同形·
--    E6 同意门函数内 fail-closed·出参白名单 Ban 数字分列）──

CREATE OR REPLACE FUNCTION gateway_b_qualitative_projection(
  p_recruiter text,
  p_application_id text
)
RETURNS TABLE(disclosed boolean, terminal_kind text, competency text, strong_count bigint,
              mid_count bigint, weak_count bigint, insufficient_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_owner text;
  v_interview_id text;
  v_kind text;
BEGIN
  -- ① owner 谓词 fail-closed：申请必须存在、属于该招聘方、处于 assessment_unavailable 终态
  --    且绑定面试为两源终态（completed/failed）。不命中 → 0 行返回（与不存在/越权不可区分·
  --    E5 单 id 0 行 fail-closed 同形）。terminal_kind 与 W1 E3 派生口径同源同式。
  SELECT a.candidate_user_id, a.interview_id,
         CASE WHEN i.status='completed' THEN 'held' WHEN i.status='failed' THEN 'failed' END
    INTO v_owner, v_interview_id, v_kind
    FROM public.job_application a
    LEFT JOIN public.interview i ON i.id = a.interview_id
   WHERE a.id = p_application_id
     AND a.recruiter_user_id = p_recruiter
     AND a.status = 'assessment_unavailable'
     AND a.interview_id IS NOT NULL
   LIMIT 1;
  IF NOT FOUND OR v_owner IS NULL OR v_interview_id IS NULL OR v_kind IS NULL THEN
    RETURN;
  END IF;

  -- ② E6 同意门（函数内承重·Ban 旁路）：无 b_qualitative_share 同意行 → disclosed=false（未披露
  --    形状·Ban 假定性输出）；有同意行 → disclosed=true 投影白名单。同意门只门定性投影——
  --    terminal_kind 两态状态信号在门内外恒可用（W3④ 状态分流承接·非评分非摘录）。
  disclosed := EXISTS (
    SELECT 1 FROM public.consent_record cr
     WHERE cr.owner_user_id = v_owner
       AND cr.purpose = 'b_qualitative_share'
  );
  -- ③ 投影白名单。首行恒为属主标记行（competency 恒 NULL·terminal_kind 恒两态信号；供调用方判定：
  --    0 行=非属主/非终态；disclosed=false=未同意；disclosed=true=已披露·维度行随后·仅标记行=暂无
  --    可复核评估记录）。维度行：rubric disposition 三值计数聚合（exceeds→强/meets→中/below→弱）
  --    + 证据不足计数（非可评分态卡或 coverage<1 的证据行·LEFT JOIN 使无分项的非可评分卡亦计 1）。
  --    superseded/fenced 卡整卡不入（0103 scoring_aggregate 排除同款）；Ban 数字分列：
  --    deterministic_total/score/overall/coverage 数值不出参。
  terminal_kind := v_kind;
  competency := NULL; strong_count := NULL; mid_count := NULL; weak_count := NULL; insufficient_count := NULL;
  RETURN NEXT;
  IF NOT disclosed THEN
    RETURN;
  END IF;
  RETURN QUERY
    WITH facts AS (
      SELECT r.competency AS comp,
             (cc.status IN ('practice_eligible','b_review_eligible') AND cc.coverage >= 1) AS scorable_ok,
             c.disposition AS disp
        FROM public.score_card cc
        JOIN public.question_rubric r ON r.id = cc.rubric_id
        LEFT JOIN public.score_card_criterion c ON c.card_id = cc.id
       WHERE cc.owner_user_id = v_owner
         AND cc.interview_id = v_interview_id
         AND cc.status NOT IN ('superseded','fenced')
    )
    SELECT true, v_kind, comp,
           count(*) FILTER (WHERE scorable_ok AND disp = 'exceeds'),
           count(*) FILTER (WHERE scorable_ok AND disp = 'meets'),
           count(*) FILTER (WHERE scorable_ok AND disp = 'below'),
           count(*) FILTER (WHERE NOT scorable_ok)
      FROM facts
     WHERE comp IS NOT NULL
     GROUP BY comp
     ORDER BY comp;
END;
$$;

REVOKE ALL ON FUNCTION gateway_b_qualitative_projection(text, text) FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_b_qualitative_projection(text, text) TO app_role;

-- ───────────── I4 INVITE-FACE 受控函数族（0165/0166 镜像住地·函数体+ACL 与迁移文件逐字节同文·0159 RX-3 同款判据）─────────────
CREATE OR REPLACE FUNCTION gateway_notify_invited(
  p_recruiter text,
  p_application_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_app RECORD;
  v_prev text;
BEGIN
  -- ① DB 纵深门：函数内复核 active+approved recruiter（0155·gateway_active_candidate 同族）。
  PERFORM public.gateway_require_active_recruiter();
  -- ② owner 谓词 fail-closed：申请必须存在且属于该招聘方。不命中 → 零写零信号（b110 恒定壳红线：
  --    未命中/不存在不可区分·零副作用）。
  SELECT id, candidate_user_id, job_id, job_title_snapshot
    INTO v_app
    FROM public.job_application
   WHERE id = p_application_id
     AND recruiter_user_id = p_recruiter
   LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  -- ③ owner 上下文满足 WITH CHECK（14_notification.sql p_owner·FORCE RLS 零动）：以候选人 principal
  --    插入；事务局部生效，插入后还原招聘方上下文（防同事务后续 RLS 判定被改写）。
  v_prev := current_setting('app.principal_user', true);
  PERFORM set_config('app.principal_user', v_app.candidate_user_id, true);
  -- ④ 窄接口：kind/payload 固定（裁决项①）·id=ntf_<applicationId> 幂等形·payload 最小集零 PII。
  INSERT INTO public.notification(id, owner_user_id, kind, payload)
  VALUES ('ntf_' || v_app.id, v_app.candidate_user_id, 'job_invited',
          jsonb_build_object('jobId', v_app.job_id, 'jobTitle', v_app.job_title_snapshot))
  ON CONFLICT (id) DO NOTHING;
  PERFORM set_config('app.principal_user', COALESCE(v_prev, ''), true);
END;
$$;

REVOKE ALL ON FUNCTION gateway_notify_invited(text, text) FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_notify_invited(text, text) TO app_role;

CREATE OR REPLACE FUNCTION gateway_recruiter_contact_share(
  p_recruiter text,
  p_application_ids text[]
)
RETURNS TABLE(application_id text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- ① DB 纵深门：函数内复核 active+approved recruiter（0155·gateway_active_candidate 同族）。
  PERFORM public.gateway_require_active_recruiter();
  -- ② owner 谓词 + 同意门（函数内承重·Ban 旁路）：申请须属于该招聘方，且候选人存在
  --    purpose='recruiter_contact_share' 同意行——无同意 → 该申请零出参（fail-closed·0160 同意门
  --    同形；撤回=删行随即停显）。出参恰 (application_id, email) 白名单两列。
  RETURN QUERY
    SELECT a.id, u.email
      FROM public.job_application a
      JOIN public.user_account u ON u.id = a.candidate_user_id
     WHERE a.id = ANY(p_application_ids)
       AND a.recruiter_user_id = p_recruiter
       AND EXISTS (
         SELECT 1 FROM public.consent_record cr
          WHERE cr.owner_user_id = a.candidate_user_id
            AND cr.purpose = 'recruiter_contact_share'
       );
END;
$$;

REVOKE ALL ON FUNCTION gateway_recruiter_contact_share(text, text[]) FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_recruiter_contact_share(text, text[]) TO app_role;
