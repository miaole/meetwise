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
