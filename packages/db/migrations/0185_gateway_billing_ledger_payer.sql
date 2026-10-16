-- 0185_gateway_billing_ledger_payer.sql
--
-- 积分明细列表 B 端（企业维度）受控读函数（billing-redesign §3.13「企业维度（按 payer_user_id 过滤）·0157 已落列」）。
-- 形状甲（0157:6-14）：企业 consumption 行 owner=候选人+payer_user_id=招聘方（job_application.recruiter_user_id
-- 投递时刻固化·payer_user_id IS NULL=C 端本人）→ 招聘方 principal 会话直 SELECT 候选人行被 p_owner FORCE
-- RLS（0001:152-163）归零行。本函数为唯一受控跨行读通路：
--   SECURITY DEFINER + WHERE payer_user_id = current_setting('app.principal_user', true) 硬谓词
--   （单跳自证·零 payer 形参=入参伪造面在 API query 层即被本谓词遮蔽·0157:88-93 同源纪律）。
-- 授权模型：GUC 由 asPrincipal 会话内 set_config 注入（SET LOCAL ROLE app_role 同事务内可见·0159 同款）；
--   API 侧另挂 approved recruiter 门（应用层同谓词校验·与本 ACL 双层纵深）。零 admin 面。
-- expand-only：仅 CREATE OR REPLACE FUNCTION（全新函数·零换体）+ 自包含 REVOKE/GRANT（0159 同款·
--   CREATE 后显式最小 EXECUTE 面）——零表零列零触发器（23=受控函数族+ACL 镜像住地）。
-- 投影钉死：created_at/service_type/units_requested/units_settled/status/payer_user_id/idempotency_key
--   （idempotency_key 在 service_type='mock_interview' 时即场 id·兼作 interview_id 投影源）——
--   剔 allocations jsonb（内部 FIFO 分布）与 lease_expires_at（内部租约调度）=非用户口径。
-- 禁顶层 BEGIN/COMMIT（migrate.ts 硬抛）·SET LOCAL lock_timeout（0156/0157/0159 先例）。
-- 镜像承重墙：packages/db/sql/23_api_gateway.sql 同位追加（函数体+ACL 与本文件逐字节同文·
--   0159:17-18 头注同款纪律）。
-- 编号=0185（历史迁移 0001-0181 零字节改+sql/ 镜像历史面零字节改·新迁移铁律勿添重号·0182-0184 他刀拟占勿抢号）。

SET LOCAL lock_timeout = '2s';

CREATE OR REPLACE FUNCTION gateway_billing_ledger_payer()
RETURNS TABLE(created_at timestamptz, service_type text, units_requested numeric,
              units_settled numeric, status text, payer_user_id text, idempotency_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN QUERY
    SELECT ec.created_at, ec.service_type, ec.units_requested, ec.units_settled,
           ec.status, ec.payer_user_id, ec.idempotency_key
      FROM public.entitlement_consumption ec
     WHERE ec.payer_user_id = current_setting('app.principal_user', true)
     ORDER BY ec.created_at DESC
     LIMIT 100;
END;
$$;

REVOKE ALL ON FUNCTION gateway_billing_ledger_payer() FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_billing_ledger_payer() TO app_role;
