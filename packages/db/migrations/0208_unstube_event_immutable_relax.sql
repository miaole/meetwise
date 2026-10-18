-- 0208_unstube_event_immutable_relax.sql — 0096 擦除投影写 vs 0195 结算防篡改触发器冲突消解
--
-- executionMode = transactional（默认·单语句 CREATE OR REPLACE FUNCTION 单事务原子）
--
-- 诊断定谳（UNSTUBE-ERASE 基线红诊断刀·REQUEST §1）：0195 落链后其 BEFORE UPDATE OR DELETE
-- 触发器（FOR EACH STATEMENT·INVOKER 仅 RAISE）把 0096 privacy_purge_interview_projection_target
-- 的 event 臂 `DELETE FROM interview_event`（0096:528-531）确定性拦死——语句级 BEFORE 触发器
-- 与行数无关（零行 DELETE 亦 RAISE）·崩点数据无关 100% 复现。定性=两律撞碰非律废律：
-- 0195 防原地改写/洗账（历史不可篡改），0096 强制经 0091 issuer/consume/claim/lease 全链授权的
-- 物理擦除（删后 read=0=真物理删除+receipt）——擦除完成后行不存在，无「历史被改」可言。
-- 仲裁=给擦除路径开窄豁免，防篡改语义对其余一切路径原样保留。
--
-- 本迁移仅 CREATE OR REPLACE FUNCTION assert_interview_event_immutable()：
--   同签名·保持 INVOKER（SECURITY 未写=INVOKER·不新增 SECURITY DEFINER 对象）·
--   触发器对象本体（BEFORE UPDATE OR DELETE·FOR EACH STATEMENT）零动·0195 文件零字节动·
--   ACL/OWNER 由 CREATE OR REPLACE 保持。
--   settlement_ledger 孪生触发器（assert_settlement_ledger_immutable）零触——无隐私擦除路径，
--   豁免零正当性。
--
-- 释放臂（恰一·四元合取缺一不可·0152 三态判别矩阵同构移植+TG_OP='DELETE' 收窄）：
--   TG_OP='DELETE'
--   AND current_user = 'privacy_worker_owner'      -- 键1：purge 走 SECURITY DEFINER（0096:589 OWNER）
--   AND current_setting('app.privacy_target_id', true) IS NOT NULL
--                                                  -- 键2：purge 事务内自置 GUC（0096:524·transaction-local，purge 外不存）
--   AND session_user <> 'privacy_worker_owner'     -- 键3：session_user=runtime 登录（经 privacy_worker_executor
--                                                  --       SET ROLE·0096:593-597 防漂移）；直连 definer 会话被此键拦回
--   → RETURN NULL 放行。
-- UPDATE 窗口内无正当用途（0195 立法靶=防原地改写），故 TG_OP='DELETE' 收窄——
-- UPDATE 面豁免零正当（0152 逐列精释同构度提升）。
--
-- 其余一切路径 → RAISE 'interview_event_immutable' ERRCODE 23514 原样（0195 原体·fail-closed）：
--   app_role 直写（current_user='app_role'）·直连 definer 会话（session_user 键3 拦回）·
--   无 GUC 的 definer 路径（键2 拦回）·UPDATE 任意路径（键4 拦回）。
--
-- SET ROLE 伪造上游防（0152 头注法·0060 law extension）：SET ROLE 改 current_user 不改
-- session_user，本判别器不被 SET ROLE 词面捕获——其防在 Upstream：privacy_worker_owner
-- NOLOGIN NOINHERIT（0048:16）且零角色被授予其成员资格，`SET ROLE privacy_worker_owner`
-- 对一切会话失败（42501）。对任何可登录角色授予 privacy_worker_owner 成员资格即破本判别器，
-- 显式 Ban（0060 law extension 同形）。
--
-- superuser 通路注记：本修落链后 superuser 亦可 SET ROLE+置 GUC 入释放臂——无新增能力
-- （superuser 本可 session_replication_role 绕触发器）·契约不改。
--
-- 回滚形状：本迁移无 down 面；回滚 = 以 0195 原体（blob d323706e2040）
-- CREATE OR REPLACE FUNCTION assert_interview_event_immutable() 复原（触发器对象零动）。

CREATE OR REPLACE FUNCTION assert_interview_event_immutable() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE'
     AND current_user = 'privacy_worker_owner'
     AND current_setting('app.privacy_target_id', true) IS NOT NULL
     AND session_user <> 'privacy_worker_owner' THEN
    RETURN NULL;  -- 0096 授权擦除路径（definer+GUC+非直连+DELETE）放行
  END IF;
  RAISE EXCEPTION 'interview_event_immutable' USING ERRCODE = '23514';
END
$$;
