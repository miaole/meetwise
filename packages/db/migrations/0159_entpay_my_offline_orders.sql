-- 0159_entpay_my_offline_orders.sql
--
-- B271 ENTPAY 片3 · #271 打磨刀 P2（S5-Slice-3）。
-- REQUEST：ai-docs/delivery/harness/entpay-slice3-REQUEST.md rev2（§1 P2 首选形·§9-2 裁定①=0159 首选形落定）。
-- 形制：gateway_admin_offline_remit_queue（0156:295-315）同形**去 admin 门·改本人行作用域**——
--       offline_remit_record 全库零 GRANT（0156:80-83 访问纪律「不授 app_role 任何表权限」）→ 招聘方
--       principal 会话内物理不可直读，无法区分 created 与 entered（裁定①决定性实锚：备选形已录台账
--       显示 created 有重复打款风险）。本函数 LEFT JOIN 台账派生三态：无 remit 行=created·
--       remit entered=entered·confirmed=confirmed·failed=failed。
-- 授权模型：SECURITY DEFINER + WHERE p.owner_user_id = current_setting('app.principal_user', true)
--       （本人行作用域·Ban 无作用域全表读·Ban-6）——GUC 由 asPrincipal 会话内 set_config 注入
--       （principal.ts:949 SET LOCAL ROLE app_role 同事务内可见）。零 admin 面（admin 既有 queue 零触）。
-- expand-only：仅 CREATE OR REPLACE FUNCTION（全新函数·零换体）+ 自包含 REVOKE/GRANT（0156:318-325·
--       照 0041:139-161 纪律·CREATE 后显式最小 EXECUTE 面）——零表零列零触发器（11_commerce.sql 零改·
--       RX-3：23=受控函数族+ACL 镜像住地）。
-- 禁顶层 BEGIN/COMMIT（migrate.ts 硬抛）·SET LOCAL lock_timeout（0156/0157 先例）。
-- 镜像承重墙：packages/db/sql/23_api_gateway.sql 同位追加（函数体+ACL 与本文件逐字节同文·
--       entpay-s3.proof 直载比对判据）。

SET LOCAL lock_timeout = '2s';

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
