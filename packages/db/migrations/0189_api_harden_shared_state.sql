-- 0189_api_harden_shared_state.sql
--
-- API-HARDEN（5C 子刀 · 进程内状态共享化 · #36/#37/#17/#129/#118 五件一迁移）：
-- 件② 限流共享桶表 platform_rl_bucket——全局桶/IP 桶（signup:global / login:global / *:ip:* 族）
--   从进程内 Map 迁 PG 单行原子 UPSERT（双实例合计消费=单实例，×2 稀释归零）；per-principal/email 桶
--   维持进程内（攻击域天然单主体，容量上限在应用层 LRU 收口，#129）。令牌桶补充折算在 SQL 内
--   与应用层同式（(now-last)/1000*refill，负 delta 同式保留），桶参数仍全部由调用点传入零改。
-- 件③ 并发槽 lease 表 platform_slot_lease——acquire=单语句 INSERT … ON CONFLICT (slot_key) DO
--   UPDATE … WHERE n<max OR expired…RETURNING 原子占（消除双实例并发首占 INSERT 撞 unique violation
--   的竞争面）；过期接管分支 n=CASE WHEN expired THEN 1 ELSE n+1 END（进程崩溃残留占用到期回收）；
--   slot_key 唯一索引=PRIMARY KEY 显式建（原子占的前提）。release 对称减、减到 0 删行（零减穿）。
-- 件④ 守卫列变更广播触发器——user_account 的 status/pwd_epoch/role/approval_status/is_admin 五列
--  任一 UPDATE 即 pg_notify('meetwise_principal_evict_v1', {t:'uid',k:NEW.id})，与状态 UPDATE 同事务
--   同连接随 commit 原子送达（禁先广播后提交：先广播则收播实例在 commit 前回读旧态回填，TOCTOU 复活）。
--   覆盖改密/注销（profile.service 直接 UPDATE）与审批态变更（gateway_admin_recruiter_approval 在
--   DB 函数内写、应用层无钩子——0143 同形以触发器补钩子）。吊销方向对称：审批拒绝/撤权同触发即时。
-- 通道与既有 interview_event_ch / meetwise_worker_wakeup_v1 零交叉；api 侧复用 sse-notify 既有
--   专用 LISTEN 连接挂第二通道（零新增连接预算，ha-6 帽后账 76/97 不变）。
--
-- **共享桶/槽 DML 收口 SECURITY DEFINER 网关函数（gateway_* 形·0040/0041/0042 同制）**：canonical
-- 生产身份=provisionRuntimeLogin 建的 LOGIN NOINHERIT 运行时登录（principal.ts：「NOINHERIT forces
-- request code through asPrincipal() before it gains application-table privileges」）——NOINHERIT 下
-- 「GRANT 表权 TO app_role + 登录 ∈ app_role」不隐式带权，连接池（DATABASE_URL 直连、无连接级 SET ROLE）
-- 直连 DML 恒 42501。故桶/槽读写全部走下方网关函数：服务调用面经 asGateway（SET LOCAL ROLE
-- app_gateway_role→EXECUTE→definer 身份做表 DML），两角色对两表**零表权**（0041 同口径），清理
-- DELETE 一并入函数。函数固定 SQL/输出契约，search_path 钉死防 hijack。
-- expand-only：IF NOT EXISTS / DROP TRIGGER IF EXISTS+CREATE / CREATE OR REPLACE FUNCTION；幂等重放零 diff。
-- releaseEvidence=false · Not HA · ≠ cutover evidence · actualSpendCny=null。

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- ── 件② 共享限流桶（全局/IP 桶类；行数经惰性 TTL 清理有界，#129 共享半）──
CREATE TABLE IF NOT EXISTS platform_rl_bucket (
  bucket_key text PRIMARY KEY,
  tokens double precision NOT NULL,
  last_ms double precision NOT NULL
);

-- ── 件③ 并发槽 lease（SSE 三控制器共享 sse:${principal} cap=5 + resume-parse:global 同机制）──
CREATE TABLE IF NOT EXISTS platform_slot_lease (
  slot_key text PRIMARY KEY,
  n integer NOT NULL,
  held_until_ms double precision NOT NULL
);

-- 两表零 GRANT（gateway 形制：调用角色无表权，DML 只在下方 SECURITY DEFINER 函数内发生）。

-- ── 件②/③ 网关函数族（固定 SQL 契约 · SECURITY DEFINER · search_path 钉死）──

-- 令牌桶单行原子 UPSERT（allow=消费形 p_consume=true；hasToken=非消费探针形 p_consume=false——
-- 两者仅「减 1 与否」一差，补充折算/拒绝分支 WHERE 语义逐式同前）。返回=是否放行。
CREATE OR REPLACE FUNCTION gateway_rl_bucket_take(
  p_bucket_key text,
  p_capacity float8,
  p_now_ms float8,
  p_refill_per_sec float8,
  p_consume boolean
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH up AS (
    INSERT INTO public.platform_rl_bucket AS b (bucket_key, tokens, last_ms)
    VALUES (p_bucket_key, p_capacity - (CASE WHEN p_consume THEN 1 ELSE 0 END)::float8, p_now_ms)
    ON CONFLICT (bucket_key) DO UPDATE SET
      tokens = LEAST(p_capacity, b.tokens + ((p_now_ms - b.last_ms) / 1000.0) * p_refill_per_sec)
               - (CASE WHEN p_consume THEN 1 ELSE 0 END)::float8,
      last_ms = p_now_ms
    WHERE LEAST(p_capacity, b.tokens + ((p_now_ms - b.last_ms) / 1000.0) * p_refill_per_sec) >= 1::float8
    RETURNING 1 AS ok
  )
  SELECT true FROM up
  UNION ALL
  SELECT false WHERE NOT EXISTS (SELECT 1 FROM up)
$$;

-- 槽原子占（INSERT…ON CONFLICT…WHERE n<max OR expired…RETURNING；过期判定恒对 p_now_ms 非
-- 刷新后 lease——自刷新会令容量形同虚设）。返回=是否占到。
CREATE OR REPLACE FUNCTION gateway_slot_lease_acquire(
  p_slot_key text,
  p_max integer,
  p_lease_until_ms float8,
  p_now_ms float8
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH up AS (
    INSERT INTO public.platform_slot_lease AS s (slot_key, n, held_until_ms)
    VALUES (p_slot_key, 1, p_lease_until_ms)
    ON CONFLICT (slot_key) DO UPDATE SET
      n = CASE WHEN s.held_until_ms < p_now_ms THEN 1 ELSE s.n + 1 END,
      held_until_ms = p_lease_until_ms
    WHERE s.n < p_max OR s.held_until_ms < p_now_ms
    RETURNING 1 AS ok
  )
  SELECT true FROM up
  UNION ALL
  SELECT false WHERE NOT EXISTS (SELECT 1 FROM up)
$$;

-- 槽对称减（幂等·零减穿）：n>1 减一；减不下去（n≤1）删行。双语句形保持（不用 CTE 同语句双写
-- 同一行——EPQ 重评会误删已减行）。
CREATE OR REPLACE FUNCTION gateway_slot_lease_release(p_slot_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  UPDATE public.platform_slot_lease SET n = n - 1 WHERE slot_key = p_slot_key AND n > 1;
  IF NOT FOUND THEN
    DELETE FROM public.platform_slot_lease WHERE slot_key = p_slot_key AND n <= 1;
  END IF;
END;
$$;

-- 共享桶惰性 TTL 清理（7 天未动=确定已补满，删除≡淘汰满额桶；调用面采样触发·尽力而为）。
CREATE OR REPLACE FUNCTION gateway_rl_bucket_cleanup(p_older_than_ms float8)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  DELETE FROM public.platform_rl_bucket WHERE last_ms < p_older_than_ms;
END;
$$;

REVOKE ALL ON FUNCTION gateway_rl_bucket_take(text, float8, float8, float8, boolean) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION gateway_slot_lease_acquire(text, integer, float8, float8) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION gateway_slot_lease_release(text) FROM PUBLIC, app_role;
REVOKE ALL ON FUNCTION gateway_rl_bucket_cleanup(float8) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_rl_bucket_take(text, float8, float8, float8, boolean) TO app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_slot_lease_acquire(text, integer, float8, float8) TO app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_slot_lease_release(text) TO app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_rl_bucket_cleanup(float8) TO app_gateway_role;

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
