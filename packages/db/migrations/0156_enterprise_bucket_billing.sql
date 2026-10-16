-- 0156_enterprise_bucket_billing.sql
--
-- B271 ENTERPRISE-PAY 片1 · #271 企业桶+充值刀（S5-Slice-1）。
-- REQUEST：ai-docs/delivery/harness/b271-entpay-REQUEST.md @6385804a（draft_rev3:pre_exec_dual · 片1 范围=§1.1 S1-C1~C8 · §4.1 五判据）。
-- 授权=pre-exec 双审收口（席1 PASS+席2 FAIL→rev2→rev3 会签 PASS 零缺口）+协调方 EXEC 授权 2026-10-10（本提交）。
-- 本文件为 EXEC 席全新书写（历史 wave1/wave3 隔离档头注「双审 PASS·EXEC 授权」皆虚称·已归档留证零恢复；
-- 归属裁定：0156 归 ENTPAY 片1（REQUEST rev3 §Post-dual 处方⑥回注·SOP:16 先登记者胜·SOP:13 P0 凌驾）。
--
-- 形态裁决（REQUEST §1.0 两处）：
--   (a) 企业桶形态 = entitlement_bucket kind CHECK 增 'enterprise'（同表·owner_user_id=审核通过招聘方·
--       到期沿 365 天惯例）；桶单表 gift/trial/paid 已同构，FIFO 预留/confirm/release/对账/容量约束
--       （0001:94-121）全复用；#228 trial（0154）已给「kind 扩值+同表」先例。
--   (b) 对公载体 = payment_order 增 channel 列（'online'|'offline'·DEFAULT 'online'·存量零回填）
--       + 侧表 offline_remit_record（order_id 唯一·bank_ref·amount_cents·entered_by/entered_at·
--       confirmed_by/confirmed_at）：录入/确认双记录天然支撑双人分离审计比对；bank_ref 确认时作
--       provider_txn 走既有 CAS（0020:20-21 uq_payment_order_provider_txn 全局唯一防一笔流水入两单）。
--
-- RLS 口径（REQUEST rev2 勘误 E1·rev3 沿用）：entitlement_bucket 自仓初档 9c92826e 即经
-- 0001_baseline.sql:152-163 DO 块四表 ENABLE+FORCE RLS+p_owner（owner_user_id=current_setting
-- ('app.principal_user',true)）在位——本迁移**不重建不重复建**（Ban 重复策略面），仅做在位
-- fail-closed 断言（任一要素缺失即硬炸停部署）。企业桶行 owner=招聘方，既有 p_owner 语义天然覆盖；
-- 跨主体（候选人会话）写入归片2 DEFINER 函数（§1.2 S2-C1·本片零触）。
--
-- 范围纪律：
--   * expand-only：仅 ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS / 具名约束换装
--     （0149 先例：DROP IF EXISTS + ADD 具名）/ CREATE OR REPLACE FUNCTION（全为新函数·零换体）。
--   * 历史迁移 0001-0155 零字节（migrate.ts checksum 守卫）。
--   * C 端零触：gift/trial/paid 个人桶语义零改（本文件对既有行仅换 CHECK 约束皮·枚举只增不改）。
--   * 禁顶层 BEGIN/COMMIT（migrate.ts containsTopLevelTransactionControl 硬抛）·SET LOCAL lock_timeout
--     （0101/0098/0104 先例·runner 每迁移 BEGIN..COMMIT 同事务）。
--   * REVOKE/GRANT 照 0041:139-161 纪律（CREATE 后显式最小 EXECUTE 面·自包含不依赖跨迁移 ACL 记忆）。
--   * SECURITY DEFINER + SET search_path 逐字声明（0155 先例·防省略重置 prosecdef/proconfig）。

SET LOCAL lock_timeout = '2s';

-- ── 0·脏值前置检测（0149 纪律·fail-loud·不洗存量）────────────────────────────────
DO $b271_detect$
DECLARE v_bad integer;
BEGIN
  SELECT count(*) INTO v_bad FROM entitlement_bucket WHERE kind NOT IN ('gift','trial','paid','enterprise');
  IF v_bad > 0 THEN
    RAISE EXCEPTION 'b271_bucket_kind_dirty_rows=% — 停部署上报 meetwise 裁决，不洗存量数据', v_bad;
  END IF;
END
$b271_detect$;

-- ── 1·kind CHECK 具名换装（裁决 (a)·枚举只增：gift/trial/paid + enterprise）───────
-- 0001:95 内联 CHECK 的自动名 = entitlement_bucket_kind_check；镜像 sql/02_commerce.sql 本刀起
-- 直接落同名具名约束（源=真源·迁移=部署车），故两名字先 DROP IF EXISTS 再 ADD，双向幂等。
ALTER TABLE entitlement_bucket DROP CONSTRAINT IF EXISTS entitlement_bucket_kind_check;
ALTER TABLE entitlement_bucket DROP CONSTRAINT IF EXISTS ck_bucket_kind;
ALTER TABLE entitlement_bucket ADD CONSTRAINT ck_bucket_kind
  CHECK (kind IN ('gift','trial','paid','enterprise'));

-- ── 2·企业桶 RLS 在位断言（E1 改判兑现·fail-closed 验证不重建）────────────────────
DO $b271_rls_assert$
DECLARE
  v_rel record;
  v_policy integer;
BEGIN
  SELECT relrowsecurity, relforcerowsecurity INTO v_rel FROM pg_class
    WHERE oid = 'entitlement_bucket'::regclass;
  IF NOT FOUND OR v_rel.relrowsecurity IS NOT TRUE OR v_rel.relforcerowsecurity IS NOT TRUE THEN
    RAISE EXCEPTION 'b271_bucket_rls_missing: entitlement_bucket 必须 ENABLE+FORCE RLS（0001:152-163 在位断言失败）';
  END IF;
  SELECT count(*) INTO v_policy FROM pg_policy
    WHERE polrelid = 'entitlement_bucket'::regclass AND polname = 'p_owner';
  IF v_policy <> 1 THEN
    RAISE EXCEPTION 'b271_bucket_rls_policy_missing: entitlement_bucket 必须恰有一个 p_owner 策略（owner=app.principal_user）';
  END IF;
END
$b271_rls_assert$;

-- ── 3·channel 列（裁决 (b) 前半·存量零回填：DEFAULT 'online' 即存量语义）────────────
ALTER TABLE payment_order ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'online';
ALTER TABLE payment_order DROP CONSTRAINT IF EXISTS ck_payment_order_channel;
ALTER TABLE payment_order ADD CONSTRAINT ck_payment_order_channel
  CHECK (channel IN ('online','offline'));

-- ── 4·offline_remit_record 侧表（裁决 (b) 后半·对公台账·双人分离载体）──────────────
-- 访问纪律：**不授 app_role 任何表权限**（比 admin_audit 更严）——全部读写只经下方受控
-- SECURITY DEFINER 函数（require_active_admin 双层之内）；表无 RLS 照 admin_audit 先例
-- （0041 gateway_admin_* 同一信任根）。status 机：entered→confirmed｜failed。
CREATE TABLE IF NOT EXISTS offline_remit_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  bank_ref text NOT NULL,                       -- 银行流水号（确认时作 provider_txn 入 CAS）
  amount_cents int NOT NULL CHECK (amount_cents > 0),
  entered_by text NOT NULL,
  entered_at timestamptz NOT NULL DEFAULT now(),
  confirmed_by text,
  confirmed_at timestamptz,
  failed_by text,
  failed_at timestamptz,
  status text NOT NULL DEFAULT 'entered' CHECK (status IN ('entered','confirmed','failed'))
);
CREATE INDEX IF NOT EXISTS ix_offline_remit_status ON offline_remit_record (status, entered_at DESC);

-- ── 5·开票资料 + 开票申请（审计①「企业开票资料 RLS 仅招聘方本人可读写」+「开票申请仅 paid 订单」）
-- invoice_profile：一招聘方一份（PK=owner）；invoice_request：order_id 唯一（一单至多一张票申请），
-- 状态机 submitted→issued|rejected（片3 财务回填面，本片只建轨道不建回填端点=Ban §5 蔓延）。
CREATE TABLE IF NOT EXISTS invoice_profile (
  owner_user_id text PRIMARY KEY,
  title text NOT NULL,                          -- 抬头
  tax_id text NOT NULL,                         -- 税号
  address_phone text,                           -- 地址电话
  bank_account text,                            -- 开户行账号
  email text NOT NULL,                          -- 收票邮箱
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','issued','rejected')),
  invoice_no text,
  reject_reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  settled_by text,                              -- 片3 财务回填操作人（本片只占列）
  settled_at timestamptz
);
CREATE INDEX IF NOT EXISTS ix_invoice_request_owner ON invoice_request (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON invoice_profile TO app_role;
GRANT SELECT, INSERT ON invoice_request TO app_role;

ALTER TABLE invoice_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_profile FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON invoice_profile
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

ALTER TABLE invoice_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_request FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON invoice_request
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- 仅-paid 门（审计①「开票申请（仅 paid 订单）」·跨表 CHECK 不可用 → 触发器，0020 先例语句）：
-- owner 不符/订单不存在/非 paid 一律具名拒绝；触发器为 INVOKER 权限——FORCE RLS 生效，
-- 越权者对其他人订单本就不可见（第一道），此处是第二道具名门（S3-C1「禁半开门」的出厂形态）。
CREATE OR REPLACE FUNCTION enforce_invoice_request_paid_order()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
DECLARE o record;
BEGIN
  SELECT owner_user_id, status INTO o FROM payment_order WHERE id = NEW.order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice_request_order_not_found';
  END IF;
  IF o.owner_user_id <> NEW.owner_user_id THEN
    RAISE EXCEPTION 'invoice_request_owner_mismatch';
  END IF;
  IF o.status <> 'paid' THEN
    RAISE EXCEPTION 'invoice_request_order_not_paid';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_invoice_request_paid_order ON invoice_request;
CREATE TRIGGER trg_invoice_request_paid_order
BEFORE INSERT OR UPDATE OF order_id, owner_user_id ON invoice_request
FOR EACH ROW EXECUTE FUNCTION enforce_invoice_request_paid_order();
REVOKE ALL ON FUNCTION enforce_invoice_request_paid_order() FROM PUBLIC, app_role, app_gateway_role;

-- ── 6·对公三受控函数 + 台账队列（照 gateway_admin_disable 0041:107-120 样板：require_active_admin
--     + admin_audit INSERT 0019:7-16·SECURITY DEFINER）──────────────────────────────
-- 入账复用同一 CAS 语义（payment.ts:66-75 逐值同形：created→paid WHERE NOT EXISTS 同 provider_txn），
-- 以 bank_ref 作 provider_txn（0020:20-21 全局唯一=一笔流水防入两单）；企业桶落位 kind='enterprise'
-- + source_order_id=订单 id（provenance 与 payment.ts 入账 INSERT 同列同义）。金额不符/录入人==确认人/
-- 流水冲突一律具名拒绝且不入账。

-- 6a·录入：bank_ref + 到账金额暂存（「拒绝入账、转人工」的中间态载体·裁决 (b)）
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

-- 6b·确认：金额==订单 amount_cents 校验（不符拒且不入账）·录入人==确认人拒（双人分离）·
--     bank_ref 作 provider_txn 复用同一 CAS 入账企业桶·audit 四元（操作人/订单/流水号/金额）
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
  -- 同一 CAS（payment.ts:66-75 同形）：NOT EXISTS 前检 + uq_payment_order_provider_txn 兜底
  -- （并发竞态 23505 → 具名 conflict；串行同流水第二单 → 具名 provider_txn_conflict）。
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
    -- 同流水已被**其他**订单占用 → 具名 provider_txn_conflict（§4.1-2「同一银行流水号确认第二单 → conflict」）。
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
  -- 企业桶落位（payment.ts:85 入账 INSERT 镜像·kind='enterprise'·365 天惯例·source_order_id=订单；
  -- 幂等=订单唯一性由 CAS 保证：恰一次 UPDATE 成功才落桶）。
  INSERT INTO public.entitlement_bucket(owner_user_id, kind, units_total, expires_at, source_order_id)
    SELECT v_owner, 'enterprise', units, now() + interval '365 days', p_order_id
      FROM public.payment_order WHERE id = p_order_id;
  INSERT INTO public.admin_audit(id, actor, action, target, detail)
    VALUES ('audit-' || gen_random_uuid()::text, caller, 'offline_remit_confirm', p_order_id,
            jsonb_build_object('order', p_order_id, 'bank_ref', r.bank_ref, 'amount', r.amount_cents, 'actor', caller));
  RETURN true;
END;
$$;

-- 6c·置败：逾期未到账 → 订单 failed + 台账 failed + audit（CAS created→failed）
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

-- 6d·台账队列（admin 卡片只读·remit 队列+audit 留痕可见的读面）
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

-- ── 7·REVOKE/GRANT（照 0041:139-161 纪律·显式最小 EXECUTE 面）────────────────────
REVOKE ALL ON FUNCTION gateway_admin_offline_remit_entry(text, text, int) FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_offline_remit_confirm(text) FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_offline_remit_fail(text, text) FROM PUBLIC, app_role, app_gateway_role;
REVOKE ALL ON FUNCTION gateway_admin_offline_remit_queue() FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_admin_offline_remit_entry(text, text, int) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_offline_remit_confirm(text) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_offline_remit_fail(text, text) TO app_role;
GRANT EXECUTE ON FUNCTION gateway_admin_offline_remit_queue() TO app_role;
