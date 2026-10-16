-- 0168_gateway_auth_email_normalize.sql
-- AUTHZ-HARDEN 5A-1 · 簇①（#111+#131）归一的 SQL 层闸换体（R9 铁律：0041/0155 历史迁移零字节改——
-- 禁原地改 0041_api_runtime_least_privilege.sql；本迁移以 CREATE OR REPLACE 同签名换体）。
-- REQUEST：ai-docs/delivery/harness/authz-harden-REQUEST.md rev2（pre-exec 双审 BOTH PASS + 协调方派单开工）。
-- 换体并集义务（rev2 席1-①登记义务行）：gateway_auth_signup 体必携 0155 末位定义回填并集 = b110 审批分支
-- （recruiter→pending）+ 0154 落地 trial 桶同事务 INSERT（0155:53-57）——漏携即抹 #228 行为；本函数体含之。
-- 镜像承重墙：函数体+ACL 与住地 packages/db/sql/23_api_gateway.sql auth 族区（signup/login/active_candidate
-- 三函数+ACL 行）**逐字节同文**（0159 RX-3 判据·0165/0166 两函数区段同款先例·镜像写 sql/ 住地不另开编号）。
-- gateway_require_active_recruiter/gateway_payment_order_owner/gateway_admin_* 等其余函数零触
-- （0041 其余函数体零变·I4 0165/0166 两函数族零触·§3-1）。
-- expand-only：仅同签名 CREATE OR REPLACE（RETURNS 类型零改·无 42P13）；SECURITY DEFINER + SET search_path
-- 逐字重声明（0144 处方：省略即重置 prosecdef/proconfig）；ACL 显式重贴自包含（0041:139-154/0132 先例）。
-- 幂等：CREATE OR REPLACE 重放等价；归一为纯函数换体，对已归一库零数据 diff（存量归一在 0167）。

SET LOCAL lock_timeout = '2s';

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
  -- AUTHZ-HARDEN 5A-1 簇①（#111）：邮箱归一 SQL 侧兜底闸（应用层 signup 归一为主闸，双闸）——
  -- 校验先拒空白/空（btrim），入参归一 lower(btrim) 后落库，大小写/空白变体不产生第二账户。
  -- v_email 局部变量承接归一值（IN 参不回写，plpgsql 版本间行为零依赖）。
  IF p_id IS NULL OR p_id = '' OR p_email IS NULL OR btrim(p_email) = ''
    OR p_password_hash IS NULL OR p_password_hash = '' OR p_role NOT IN ('candidate', 'recruiter') THEN
    RAISE EXCEPTION 'gateway_auth_signup_invalid_input' USING ERRCODE = '22023';
  END IF;
  DECLARE
    v_email text := lower(btrim(p_email));
  BEGIN
  -- b110 审核制：recruiter 注册一律落审核队列（admin approve 后方过 B 端门）；candidate 走默认 approved。
  IF p_role = 'recruiter' THEN
    INSERT INTO public.user_account(id, email, password_hash, role, approval_status)
    VALUES (p_id, v_email, p_password_hash, p_role, 'pending');
  ELSE
    INSERT INTO public.user_account(id, email, password_hash, role)
    VALUES (p_id, v_email, p_password_hash, p_role);
  END IF;
  -- 注册赠送一次体验额度（#228 D1 已决）：signup+grant 同事务原子——注册 23505 回滚则桶不存在；
  -- 桶冲突 DO NOTHING 不拖垮注册。kind='trial'·units_total=1.00（1 次面试=1.00）·expires 同 paid 先例
  -- now()+interval '365 days'·source_order_id=NULL（无单）。幂等每用户一次由 partial unique index
  -- uq_bucket_trial_one_per_owner 兜底；ON CONFLICT 谓词与 index 定义逐字一致。
  -- （b110 回填并集注：trial 发放对 candidate/recruiter 两态注册同适用，与审核维度正交。
  --   AUTHZ-HARDEN 5A-1 换体必携此 0155 末位回填并集，漏携即抹 #228 行为。）
  INSERT INTO public.entitlement_bucket(owner_user_id, kind, units_total, expires_at)
  VALUES (p_id, 'trial', 1.00, now() + interval '365 days')
  ON CONFLICT (owner_user_id) WHERE kind = 'trial' DO NOTHING;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION gateway_auth_login(p_email text)
RETURNS TABLE(id text, password_hash text, status text, role text, pwd_epoch int)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  -- AUTHZ-HARDEN 5A-1 簇①（#111）：入参先归一（trim+lower）后与库精确比较（裁决项①附带·推荐形）——
  -- 大写/带空白登录命中同账户；0167 后库内 email 已全量归一，等值比较走既有 email 唯一索引。
  SELECT u.id, u.password_hash, u.status, u.role, u.pwd_epoch
  FROM public.user_account AS u
  WHERE u.email = lower(btrim(p_email))
  LIMIT 1
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
  -- AUTHZ-HARDEN 5A-1 簇①（#111/#131）：email 键入参归一（trim+lower）后精确比较——大写邮箱候选人邀得到（200 非 404）。
  RETURN QUERY
    SELECT u.id
    FROM public.user_account AS u
    WHERE u.status = 'active'
      AND u.role = 'candidate'
      AND ((p_candidate_id IS NOT NULL AND u.id = p_candidate_id)
        OR (p_candidate_email IS NOT NULL AND u.email = lower(btrim(p_candidate_email))))
    LIMIT 1;
END;
$$;

-- ── ACL 重贴（照 0041:139-154 先例·自包含不依赖跨迁移 ACL 记忆·与 23 auth 族区 ACL 行逐字节同文）──

REVOKE ALL ON FUNCTION gateway_auth_signup(text, text, text, text) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION gateway_auth_login(text) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION gateway_active_candidate(text, text) FROM PUBLIC, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_auth_signup(text, text, text, text) TO app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_auth_login(text) TO app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_active_candidate(text, text) TO app_role;
