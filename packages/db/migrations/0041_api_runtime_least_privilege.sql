-- 0041_api_runtime_least_privilege.sql
-- Gives user_account the same forced RLS boundary as other tenant tables, then
-- installs the reviewed fixed API gateway functions. Runtime logins use
-- app_role for principal-scoped work and app_gateway_role only for three
-- no-session functions; neither role receives business-table privileges here.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_gateway_role') THEN
    CREATE ROLE app_gateway_role NOLOGIN;
  END IF;
END $$;

ALTER TABLE user_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_account FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_user_account_self ON user_account;
CREATE POLICY p_user_account_self ON user_account
  FOR ALL TO app_role
  USING (id = current_setting('app.principal_user', true))
  WITH CHECK (id = current_setting('app.principal_user', true));

CREATE OR REPLACE FUNCTION gateway_auth_signup(p_id text, p_email text, p_password_hash text, p_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF p_id IS NULL OR p_id = '' OR p_email IS NULL OR p_email = '' OR p_password_hash IS NULL OR p_password_hash = '' OR p_role NOT IN ('candidate', 'recruiter') THEN
    RAISE EXCEPTION 'gateway_auth_signup_invalid_input' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.user_account(id, email, password_hash, role) VALUES (p_id, p_email, p_password_hash, p_role);
END;
$$;

CREATE OR REPLACE FUNCTION gateway_auth_login(p_email text)
RETURNS TABLE(id text, password_hash text, status text, role text, pwd_epoch int)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT u.id, u.password_hash, u.status, u.role, u.pwd_epoch FROM public.user_account AS u WHERE u.email = p_email LIMIT 1
$$;

CREATE OR REPLACE FUNCTION gateway_payment_order_owner(p_order_id text)
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT p.owner_user_id FROM public.payment_order AS p WHERE p.id = p_order_id
$$;

CREATE OR REPLACE FUNCTION gateway_require_active_recruiter()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE caller text := current_setting('app.principal_user', true);
BEGIN
  IF caller IS NULL OR NOT EXISTS (SELECT 1 FROM public.user_account WHERE id = caller AND role = 'recruiter' AND status = 'active') THEN
    RAISE EXCEPTION 'gateway_recruiter_required' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_active_candidate(p_candidate_id text, p_candidate_email text)
RETURNS TABLE(id text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.gateway_require_active_recruiter();
  IF (p_candidate_id IS NULL AND p_candidate_email IS NULL) OR (p_candidate_id IS NOT NULL AND p_candidate_email IS NOT NULL) THEN
    RAISE EXCEPTION 'gateway_candidate_lookup_requires_exactly_one_key' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY SELECT u.id FROM public.user_account AS u
    WHERE u.status = 'active' AND u.role = 'candidate'
      AND ((p_candidate_id IS NOT NULL AND u.id = p_candidate_id) OR (p_candidate_email IS NOT NULL AND u.email = p_candidate_email))
    LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_require_active_admin()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE caller text := current_setting('app.principal_user', true);
BEGIN
  IF caller IS NULL OR NOT EXISTS (SELECT 1 FROM public.user_account WHERE id = caller AND is_admin = true AND status = 'active') THEN
    RAISE EXCEPTION 'gateway_admin_required' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_users()
RETURNS TABLE(id text, email text, status text, is_admin boolean, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY SELECT u.id, u.email, u.status, u.is_admin, u.created_at FROM public.user_account AS u ORDER BY u.created_at DESC LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_orders()
RETURNS TABLE(id text, owner_user_id text, product_id text, amount_cents int, status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY SELECT p.id, p.owner_user_id, p.product_id, p.amount_cents, p.status FROM public.payment_order AS p ORDER BY p.created_at DESC LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_stats()
RETURNS TABLE(users bigint, orders bigint, paid_cents bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY SELECT count(*)::bigint,
    (SELECT count(*)::bigint FROM public.payment_order),
    (SELECT coalesce(sum(amount_cents) FILTER (WHERE status = 'paid'), 0)::bigint FROM public.payment_order)
  FROM public.user_account;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_disable(p_target_id text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE caller text := current_setting('app.principal_user', true);
DECLARE updated_rows integer := 0;
BEGIN
  PERFORM public.gateway_require_active_admin();
  UPDATE public.user_account SET status = 'disabled' WHERE id = p_target_id;
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows > 0 THEN
    INSERT INTO public.admin_audit(id, actor, action, target) VALUES ('audit-' || gen_random_uuid()::text, caller, 'disable_user', p_target_id);
  END IF;
  RETURN updated_rows > 0;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_audit()
RETURNS TABLE(id text, actor text, action text, target text, detail jsonb, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY SELECT a.id, a.actor, a.action, a.target, a.detail, a.created_at FROM public.admin_audit AS a ORDER BY a.created_at DESC LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_admin_feedback_summary()
RETURNS TABLE(up bigint, down bigint) LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY SELECT count(*) FILTER (WHERE rating = 'up')::bigint, count(*) FILTER (WHERE rating = 'down')::bigint FROM public.question_feedback;
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
