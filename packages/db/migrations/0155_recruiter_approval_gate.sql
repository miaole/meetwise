-- 0155_recruiter_approval_gate.sql
--
-- B110 · #110 招聘方注册审核制刀（W4 B 端线首刀）。
-- 回填重编号 0152→0155（mw-core 协调方授权·2026-10-10）：线内 EXEC 编号 0152 与主线撞号
-- （主线 0152=consent_revoke_grant+resume_soft_delete_fence 并存·0153=account_deletion_column·
-- 0154=trial_bucket_grant 已占·亲跑 ls packages/db/migrations/ 确认后取最小未占号 0155·先例 c51c792d）。
-- 回填并集注（gateway_auth_signup 体）：本迁移 CREATE OR REPLACE 换体若照线内原样落主线，
-- 迁移序 0154(trial)→0155(b110) 末位定义胜出会把 #228 trial 同事务发放静默抹除——
-- 故函数体并集 = b110 审批分支（recruiter→pending）+ 0154 落地的 trial 桶 INSERT（两态注册同适用，
-- 与审核维度正交·ON CONFLICT 谓词与 0154 uq_bucket_trial_one_per_owner 逐字一致），
-- 与镜像 sql/23_api_gateway.sql 回填并集后定义一致（源=真源·迁移=部署车·0018 先例形）。
-- REQUEST：ai-docs/delivery/harness/b110-REQUEST.md @f0a8a8ee rev2（窄域双审 BOTH PASS · EXEC 授权）。
-- 形态裁决 = (a) 注册即审核队列：recruiter 注册落 approval_status='pending'，admin approve/reject 并
-- admin_audit 留痕（照 0041:107-120 disable 样板）。approve=企业付费主体诞生时刻（#271 硬依赖挂点；
-- 本迁移只交付审批轨道，entitlement/充值/开票/企业主体采集零字节——Ban §5.2 蔓延）。
-- invite 枚举面封堵与 IP 限流在 API 层（recruiter.service/auth.service），本文件只承载 DB 门。
--
-- 纪律（SOP:37 / Ban §5.1 / §5.6）：
--   * expand-only：仅 ADD COLUMN IF NOT EXISTS + CREATE OR REPLACE FUNCTION 同签名换体
--     （先例 0128/0132/0134/0144）；历史迁移 0001-0154 零字节改（migrate.ts checksum 守卫·
--     主线回填后历史区间含 0152/0153/0154）。
--   * gateway_auth_login 零字节（R1 撤销）：CREATE OR REPLACE 禁改返回类型（PG 42P13），且
--     runtime-role proof 硬断言其返回列集五键；感知改走双通道 = signup 响应体 approvalStatus（即时）
--     + B 端 API 403 分码（晚一跳 UX 让步）。
--   * gateway_require_active_recruiter 扩展（R7 必做）：同签名 RETURNS void 换体（无 42P13），
--     加 approval_status='approved' 维度（fail-closed 只增不弱）；gateway_active_candidate:56 PERFORM
--     它 = invite 的 DB 纵深门——不扩展则绕 API guard 的 app_role 直调路径对 pending 放行。
--   * 存量行零回填：DEFAULT 'approved' 使存量 recruiter 全数过门 = 向后兼容决定，
--     **非「历史注册已合规」声明**（批量复核未做，REQUEST §7 如实披露）。
--   * SECURITY DEFINER + SET search_path 逐字重声明（0144 处方：CREATE OR REPLACE 若省略
--     SECURITY/SET 子句会重置 prosecdef/proconfig；owner 与 ACL 自动保留，本文件仍按 0132 先例
--     对触碰函数显式重贴 REVOKE/GRANT，自包含不依赖跨迁移 ACL 记忆）。

SET LOCAL lock_timeout = '2s';

-- ── 审批列（存量语义：默认 approved）─────────────────────────────────────────
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved'
  CHECK (approval_status IN ('pending','approved','rejected'));

-- ── signup：recruiter 落 pending（candidate 走默认 approved）────────────────
CREATE OR REPLACE FUNCTION gateway_auth_signup(p_id text, p_email text, p_password_hash text, p_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF p_id IS NULL OR p_id = '' OR p_email IS NULL OR p_email = '' OR p_password_hash IS NULL OR p_password_hash = '' OR p_role NOT IN ('candidate', 'recruiter') THEN
    RAISE EXCEPTION 'gateway_auth_signup_invalid_input' USING ERRCODE = '22023';
  END IF;
  IF p_role = 'recruiter' THEN
    -- 审核制：招聘方注册一律进审核队列（admin approve 后方过 B 端门）。
    INSERT INTO public.user_account(id, email, password_hash, role, approval_status) VALUES (p_id, p_email, p_password_hash, p_role, 'pending');
  ELSE
    INSERT INTO public.user_account(id, email, password_hash, role) VALUES (p_id, p_email, p_password_hash, p_role);
  END IF;
  -- 回填并集：0154 trial 同事务发放照搬（末位 CREATE OR REPLACE 必须携带，否则抹除 #228 行为；
  -- 谓词与 0154 uq_bucket_trial_one_per_owner 逐字一致·两态注册同适用）。
  INSERT INTO public.entitlement_bucket(owner_user_id, kind, units_total, expires_at)
  VALUES (p_id, 'trial', 1.00, now() + interval '365 days')
  ON CONFLICT (owner_user_id) WHERE kind = 'trial' DO NOTHING;
END;
$$;

-- ── B 端门：role + status 之外加审批维度（同签名 RETURNS void 换体）──────────
CREATE OR REPLACE FUNCTION gateway_require_active_recruiter()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE caller text := current_setting('app.principal_user', true);
BEGIN
  IF caller IS NULL OR NOT EXISTS (SELECT 1 FROM public.user_account WHERE id = caller AND role = 'recruiter' AND status = 'active' AND approval_status = 'approved') THEN
    RAISE EXCEPTION 'gateway_recruiter_required' USING ERRCODE = '42501';
  END IF;
END;
$$;

-- ── admin 审批队列：pending 优先（先到先审），其余为最近态 ───────────────────
CREATE OR REPLACE FUNCTION gateway_admin_recruiter_approvals()
RETURNS TABLE(id text, email text, approval_status text, status text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  PERFORM public.gateway_require_active_admin();
  RETURN QUERY SELECT u.id, u.email, u.approval_status, u.status, u.created_at FROM public.user_account AS u
    WHERE u.role = 'recruiter'
    ORDER BY (u.approval_status = 'pending') DESC,
             CASE WHEN u.approval_status = 'pending' THEN u.created_at END ASC,
             u.created_at DESC
    LIMIT 100;
END;
$$;

-- ── admin 审批裁决：approve/reject + admin_audit 留痕（照 0041:107-120 样板）──
CREATE OR REPLACE FUNCTION gateway_admin_recruiter_approval(p_target_id text, p_decision text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
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

-- ── REVOKE/GRANT 纪律（照 0041:139-161 · 0132 重贴先例）──────────────────────
REVOKE ALL ON FUNCTION gateway_auth_signup(text, text, text, text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_auth_signup(text, text, text, text) TO app_gateway_role;

REVOKE ALL ON FUNCTION gateway_require_active_recruiter() FROM PUBLIC, app_role, app_gateway_role;

REVOKE ALL ON FUNCTION gateway_admin_recruiter_approvals() FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_recruiter_approval(text, text) FROM PUBLIC, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_admin_recruiter_approvals() TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_recruiter_approval(text, text) TO app_role;
