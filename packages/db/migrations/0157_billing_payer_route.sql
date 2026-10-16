-- 0157 · B271 片2 扣费路由（S2-C1）——岗位面试企业桶扣费 · consumption payer 维度 + 受控 DEFINER 函数族
--
-- claim: B271 #271 片2 EXEC（entpay-slice2-exec 席·line/enterprise-pay 工作树·base 主线 6799544f）·
--        任务书 ai-docs/delivery/harness/entpay-slice2-REQUEST.md rev2（S2-C1~C9·0-c 六件前置闸已过）。
--
-- D-1 裁决（REQUEST §1.0·写死·0-c 隔离库「形状×判据」矩阵实测 2026-10-10）：
--   **形状甲** = consumption 行 owner_user_id=候选人（=interview/begin 会话主体·RLS 语境零改）+
--                payer_user_id=招聘方（=job_application.recruiter_user_id 投递时刻固化·0005:23）。
--   依据：形状甲 0-c①-⑥ 全六件 PASS（12 格矩阵·含 §9-1 reconcileOwner B 端支路扩面与 §9-2 第⑥件
--   租约续约探针）；形状乙 ⑤ FAIL（sweeper 判支 SELECT interview WHERE owner_user_id=行 owner 在招聘方
--   RLS 语境必 0 行 → B 端行静默误入 C 端 abandon 支）且 ⑥ FAIL（renewReservationLease 以 dispatch
--   owner=候选人语境续约 rowCount=0 → 活会话断供）。全量矩阵留痕：
--   ai-docs/delivery/receipts/enterprise-pay/slice2/preverify/。
--   C 端语义：payer_user_id IS NULL = C 端本人额度（reserveEntitlement 原路·零触·Ban 条款-3）。
--
-- 形制：0156 四样板逐条承袭——SET LOCAL lock_timeout（0156:34）·脏值前置检测（0156:34-45 形）·
--        RLS 在位 fail-closed 断言不重建（0156:55-72 形·断言对象扩 entitlement_consumption）·
--        REVOKE/GRANT 显式最小 EXECUTE（0156:318-326·照 0041:139-161 纪律）。
-- 镜像承重墙（REQUEST §0.3-3）：payer 列→sql/02_commerce.sql；gateway_ 函数族→sql/23_api_gateway.sql
--        （0156 先例即落 23 号镜像）。neg-harness 直载镜像，不落则片2 neg/prove 不可执行。
-- expand-only：存量行零回填（存量 job_application/interview 零回填·REQUEST §2-6）；本迁移零删改既有列。

SET LOCAL lock_timeout = '2s';

-- ── 1·consumption payer 维度（expand-only·先行落列）──────────────────────────────────
ALTER TABLE entitlement_consumption ADD COLUMN IF NOT EXISTS payer_user_id text;

-- ── 0·脏值前置检测（0149/0156 纪律·fail-loud·不洗存量）────────────────────────────────
-- payer 列 expand-only：落列后必须仍全 NULL（存量消费行=C 端本人语义·零回填·片2 起新行才落 payer）。
DO $b271s2_detect$
DECLARE v_bad integer;
BEGIN
  SELECT count(*) INTO v_bad FROM entitlement_consumption WHERE payer_user_id IS NOT NULL;
  IF v_bad > 0 THEN
    RAISE EXCEPTION 'b271s2_payer_dirty_rows=% — 停部署上报 meetwise 裁决，不洗存量数据', v_bad;
  END IF;
END
$b271s2_detect$;

-- ── 2·RLS 在位断言（E1 口径·fail-closed 验证不重建·0156:55-72 同形·对象=entitlement_consumption）──
DO $b271s2_rls_assert$
DECLARE
  v_rel record;
  v_policy integer;
BEGIN
  SELECT relrowsecurity, relforcerowsecurity INTO v_rel FROM pg_class
    WHERE oid = 'entitlement_consumption'::regclass;
  IF NOT FOUND OR v_rel.relrowsecurity IS NOT TRUE OR v_rel.relforcerowsecurity IS NOT TRUE THEN
    RAISE EXCEPTION 'b271s2_consumption_rls_missing: entitlement_consumption 必须 ENABLE+FORCE RLS（0001:150-163 在位断言失败）';
  END IF;
  SELECT count(*) INTO v_policy FROM pg_policy
    WHERE polrelid = 'entitlement_consumption'::regclass AND polname = 'p_owner';
  IF v_policy <> 1 THEN
    RAISE EXCEPTION 'b271s2_consumption_rls_policy_missing: entitlement_consumption 必须恰有一个 p_owner 策略（owner=app.principal_user）';
  END IF;
END
$b271s2_rls_assert$;

-- ── 3·受控 DEFINER 函数族（0156:174-198 形制·SECURITY DEFINER+SET search_path 逐字声明+具名拒绝）────
-- 3.1 企业路由预留：begin 在候选人 asPrincipal 事务内调用（总档修法②原文：候选人会话看不到企业桶，
--     需受控 SECURITY DEFINER）。owner=principal 派生（Ban 入参伪造）；payer=job_application
--     单跳派生（REQUEST §0.2 指向链·授权链=0155 审核制+0005:23 投递时刻固化）。幂等键 (owner,key)
--     uq（0001:122）背书重试收敛单行（S2-C5）。FIFO/CAS/全有全无与 reserveEntitlement（commerce.ts
--     :36 C 端保留·零触）同形；不足抛 insufficient_entitlement（P0001·402/分码映射源语义保留）。
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
  -- payer 单跳派生（授权链：application.candidate_user_id=principal ∧ recruiter_user_id 投递时刻固化）
  SELECT recruiter_user_id INTO v_payer FROM job_application
   WHERE id = p_application_id AND candidate_user_id = v_owner;
  IF NOT FOUND OR v_payer IS NULL OR length(v_payer) = 0 THEN
    RAISE EXCEPTION 'entpay_application_not_found';
  END IF;
  -- 幂等占坑（reserveEntitlement 同形：ON CONFLICT DO NOTHING → duplicate 收敛）
  INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, payer_user_id, lease_expires_at)
  VALUES (v_owner, p_idempotency_key, p_service_type, p_units, v_payer, now() + (p_lease_seconds || ' seconds')::interval)
  ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING
  RETURNING id INTO v_consumption;
  IF v_consumption IS NULL THEN
    SELECT id INTO v_existing FROM entitlement_consumption
     WHERE owner_user_id = v_owner AND idempotency_key = p_idempotency_key;
    RETURN 'duplicate:' || coalesce(v_existing, 'missing');
  END IF;
  -- FIFO 预留招聘方企业桶（0001 同形 CAS·不足抛 insufficient_entitlement → 外层事务整体回滚零悬账）
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

-- 3.2 allocation 作用域桶增量应用器：confirm/release/sweep 退还的 B 端路由对偶（RLS 下 consumption
--     owner=候选人会话不可直写招聘方企业桶 → 经本受控函数）。作用域守卫=调用方 principal 名下消费行
--     allocations 所列桶（Ban 任意桶挪账）；桶缺失 RAISE（fail-closed 不静默·commerce ⑤不静默同口径）。
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

-- ── 4·REVOKE/GRANT（0156:318-326 形·照 0041:139-161 纪律·REVOKE 先于 GRANT·FROM 全列）────────────
REVOKE ALL ON FUNCTION gateway_entpay_reserve(text, text, text, numeric, int) FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_entpay_apply_allocation(text, text, numeric, numeric) FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_entpay_reserve(text, text, text, numeric, int) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_entpay_apply_allocation(text, text, numeric, numeric) TO app_role;
