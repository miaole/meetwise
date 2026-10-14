-- 0189_api_harden_shared_state.sql
--
-- API-HARDEN（5C 子刀 · 进程内状态共享化 · #36/#37/#17/#129/#118 五件一迁移）：
-- 件② 限流共享桶表 platform_rl_bucket——全局桶/IP 桶（signup:global / login:global / *:ip:* 族）
--   从进程内 Map 迁 PG 单行原子 UPSERT（双实例合计消费=单实例，×2 稀释归零）；per-principal/per-email
--   桶维持进程内（攻击域天然单主体，容量上限在应用层 LRU 收口，#129）。令牌桶补充折算在 SQL 内
--   与应用层同式（(now-last)/1000*refill，负 delta 同式保留），桶参数仍全部由调用点传入零改。
-- 件③ 并发槽 lease 表 platform_slot_lease——acquire=单语句 INSERT … ON CONFLICT (slot_key) DO
--   UPDATE … WHERE n<max OR expired（消除双实例并发首占 INSERT 撞 unique violation 的竞争面）；
--   过期接管分支 n=CASE WHEN expired THEN 1 ELSE n+1 END（进程崩溃残留占用到期回收）；
--   slot_key 唯一索引=PRIMARY KEY 显式建（原子占的前提）。release 对称减、减到 0 删行（零减穿）。
-- 件④ 守卫列变更广播触发器——user_account 的 status/pwd_epoch/role/approval_status/is_admin 五列
--  任一 UPDATE 即 pg_notify('meetwise_principal_evict_v1', {t:'uid',k:NEW.id})，与状态 UPDATE 同事务
--   同连接随 commit 原子送达（禁先广播后提交：先广播则收播实例在 commit 前回读旧态回填，TOCTOU 复活）。
--   覆盖改密/注销（profile.service 直接 UPDATE）与审批态变更（gateway_admin_recruiter_approval 在
--   DB 函数内写、应用层无钩子——0143 同形以触发器补钩子）。吊销方向对称：审批拒绝/撤权同触发即时。
-- 通道与既有 interview_event_ch / meetwise_worker_wakeup_v1 零交叉；api 侧复用 sse-notify 既有
--   专用 LISTEN 连接挂第二通道（零新增连接预算，ha-6 帽后账 76/97 不变）。
-- 表对象级 GRANT 沿 0169/0001:150「GRANT ALL 不覆盖此后新建表，显式补」先例随 DDL 一体交付；
--   桶表/槽表无 RLS（非 owner 归属数据，键即租约名）；槽表 release 删行故带 DELETE。
-- expand-only：IF NOT EXISTS / DROP TRIGGER IF EXISTS+CREATE；幂等重放零 diff。
-- releaseEvidence=false · Not HA · ≠ cutover evidence · actualSpendCny=null。

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- ── 件② 共享限流桶（全局/IP 桶类；行数经应用层惰性 TTL 清理有界，#129 共享半）──
CREATE TABLE IF NOT EXISTS platform_rl_bucket (
  bucket_key text PRIMARY KEY,
  tokens double precision NOT NULL,
  last_ms double precision NOT NULL
);

GRANT SELECT, INSERT, UPDATE ON platform_rl_bucket TO app_role;

-- ── 件③ 并发槽 lease（SSE 三控制器共享 sse:${principal} cap=5 + resume-parse:global 同机制）──
CREATE TABLE IF NOT EXISTS platform_slot_lease (
  slot_key text PRIMARY KEY,
  n integer NOT NULL,
  held_until_ms double precision NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON platform_slot_lease TO app_role;

-- ── 件④ 守卫列变更广播（0143 同形；通知载荷只带 uid，不带任何行数据）──
CREATE OR REPLACE FUNCTION platform_principal_state_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM pg_notify('meetwise_principal_evict_v1', json_build_object('t', 'uid', 'k', NEW.id)::text);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION platform_principal_state_notify() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS platform_principal_state_notify ON user_account;
CREATE TRIGGER platform_principal_state_notify
  AFTER UPDATE OF status, pwd_epoch, role, approval_status, is_admin ON user_account
  FOR EACH ROW
  EXECUTE FUNCTION platform_principal_state_notify();
