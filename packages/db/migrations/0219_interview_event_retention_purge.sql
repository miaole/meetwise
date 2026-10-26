-- 0219_interview_event_retention_purge.sql — interview_event 保留期清扫（progress-write 件③ TTL 留槽承接·event-ttl 刀）
--
-- executionMode = transactional（默认·角色/表权/RLS policy×2/函数×2/REVOKE·GRANT 单事务原子）
--
-- 现状（红事实承接）：interview_event 清理面=零——app_role 无 DELETE（0096:255 REVOKE）、0195
-- BEFORE UPDATE OR DELETE 语句级触发器恒 RAISE 23514、全表唯一生产 DELETE=0096:529 隐私擦除单目标臂。
-- 进度族 kind（progress/generation_started/model_first_token/generation_progress·0192:16-21 值域子集）
-- 行随生成频次 O(生成次数) 无界累积·无限期留存。本迁移给保留期清扫开唯一诚实通道：
--   专用 NOLOGIN definer 角色 + 专用事务局域 GUC + kind 恰 4 值 ephemeral 族收窄 + 龄窗 + 批上限，
--   以 0208 已裁定的同构仲裁形落 additive 释放臂（「两律撞碰非律废律：仲裁=开窄豁免，防篡改语义
--   对其余一切路径原样保留」0208:12-14）——既有臂逐字节保留·0195/0208 文件零字节零触。
--
-- 释放臂（恰一·四元合取缺一不可·与 0208 隐私臂谓词完全不相交——role/GUC 双异）：
--   TG_OP='DELETE'
--   AND current_user = 'event_retention_worker'    -- 键1：清扫走 SECURITY DEFINER（本迁移 OWNER）
--   AND current_setting('app.event_ttl_sweep', true) IS NOT NULL
--                                                  -- 键2：清扫函数事务内自置 GUC（is_local=true，
--                                                  --       事务外不存——函数即 GUC 唯一 setter）
--   AND session_user <> 'event_retention_worker'   -- 键3：session_user=runtime 登录；直连 definer 会话被拦回
--   → RETURN NULL 放行。kind 收窄/龄窗/批上限三界不在触发器层重复——它们由唯一合法 setter（清扫函数）
--   的界检查 fail-closed 承载；触发器层只认「definer+专用 GUC+非直连+DELETE」。
--
-- kind 收窄域裁决：恰 4 值 ephemeral 族（0192 值域子集）——generation_started / model_first_token /
-- generation_progress（#164 审计目标族）+ progress（diagnosis/quiz 进度行·同 ephemeral 语义）。
-- business 终态 kind（question_ready/answer_evaluated/report_ready 等 15 值）永久划出清扫域
-- （interview_event=SSE durable replay log·事件账本载体·tokstream D-1）。
--
-- SET ROLE 伪造上游防（0208:35-39 同构原文形·0060 law extension）：SET ROLE 改 current_user 不改
-- session_user，本判别器不被 SET ROLE 词面捕获——其防在 Upstream：event_retention_worker
-- NOLOGIN NOINHERIT（本迁移）且零角色被授予其成员资格（下方 REVOKE 显式随发），`SET ROLE
-- event_retention_worker` 对一切会话失败（42501）。对任何可登录角色授予 event_retention_worker
-- 成员资格即破本判别器与 kind/龄双界——SET ROLE 改 current_user 不改 session_user（NOINHERIT 不拦
-- SET ROLE）·成员角色可在 SD 函数外自置 `app.event_ttl_sweep` GUC（custom GUC 任意角色可置）直删
-- 任意 kind 任意龄·绕清扫函数界检查（龄窗 30..3650/kind 恰 4 值/批帽）——显式 Ban。
--
-- superuser 通路注记（0208:41-42 同构）：superuser 亦可 SET ROLE+置 GUC 入释放臂——无新增能力
-- （superuser 本可 session_replication_role 绕触发器）·契约不改。
--
-- 清扫函数形制（0212:6-36 全形制锚·0177:153-172 界先例）：SECURITY DEFINER+SET search_path =
-- public, pg_temp；界检查 fail-closed（p_keep_days 30..3650 收窄下界防误删近窗·p_batch_cap
-- 1..10000）；批 DELETE 子选 LIMIT（0212:19-28 同形）；GET DIAGNOSTICS；事务局域 GUC 幂等谓词键。
-- 索引面量化登记（如实）：interview_event 零 created_at/kind 索引（索引面仅 0001 PK id+
-- UNIQUE(stream_key,seq)+0021 uq_interview_event_key）→批 DELETE 单批=1 次全表 seq scan·调用方
-- 每拍批数帽 40（worker MAX_BATCHES_PER_TICK）→≤40 次全表扫/拍·单批代价 O(现役全表行数) 线性。
-- 缺省 ENABLED=false（worker env 门）下零发生。若后继刀为 created_at 补索引，沿 0190/0211
-- @migration-mode concurrent-index 先例以独立非事务迁移落——Ban 入本 transactional 迁移内建
-- 索引（executionMode=transactional 与 CONCURRENTLY 互斥）。
--
-- 回滚形状（两层）：
--   (a) 触发器函数：以 0208 体（blob 6f6b90e5）CREATE OR REPLACE
--       assert_interview_event_immutable() 复原（触发器对象零动）。
--   (b) 本卷新对象回滚序（后进先出·函数 owner=event_retention_worker 故 DROP FUNCTION 必先）：
--       DROP FUNCTION interview_event_retention_purge(integer,integer)
--       → DROP POLICY interview_event_retention_worker_delete ON interview_event
--       → DROP POLICY interview_event_retention_worker_select ON interview_event
--       → REVOKE ALL ON interview_event FROM event_retention_worker
--       → DROP ROLE event_retention_worker。
--   fail-closed 惰性化：GUC app.event_ttl_sweep 唯一 setter=清扫函数本体且事务局域——任一中途态
--   零放行窗；序末 DROP ROLE 后 current_user='event_retention_worker' 恒假——终态回 0195 恒 RAISE 基线。
--
-- RLS 依据：interview_event 现 FORCE RLS（0001:74）且现行仅 p_owner 一枚 `FOR ALL TO app_role`
-- （0062:59-62·0059:46-49 前手同形重建）——event_retention_worker 无适用 policy→默认拒绝零行。
-- 本迁移 additive 新增 TO event_retention_worker 双 policy（既有 p_owner 零字节零触·0045 additive
-- policy 形）：SELECT 全开（0096 worker_dispatch USING(true) 同构·跨 owner 枚举仅此角色可达）+
-- DELETE 需专用 GUC（0096:286-290 GUC 门同构·裸删在 policy 层即拒）。

SET LOCAL lock_timeout = '2s';

-- 专用清扫 definer（0048 幂等形·0096 防漂移同族：不授予任何可登录角色成员资格）。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='event_retention_worker') THEN
    CREATE ROLE event_retention_worker NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

-- 防漂移显式随发（0096:597 同族）：runtime 登录永不经 membership 漂移成为清扫 definer。
REVOKE event_retention_worker FROM app_role;

-- 最小表权面（0096:256 同形）：只 SELECT+DELETE，绝不 UPDATE（0195 追加不可变立法面）。
GRANT SELECT, DELETE ON interview_event TO event_retention_worker;

-- RLS 双 policy（additive·既有 p_owner 零触）。
CREATE POLICY interview_event_retention_worker_select ON interview_event
  FOR SELECT TO event_retention_worker
  USING (true);
CREATE POLICY interview_event_retention_worker_delete ON interview_event
  FOR DELETE TO event_retention_worker
  USING (current_setting('app.event_ttl_sweep', true) IS NOT NULL);

-- 0208 体（blob 6f6b90e5 :50-59）逐字节保留+恰一 additive 臂（插于既有隐私臂 END IF 之后、RAISE 之前）。
-- 触发器对象本体（BEFORE UPDATE OR DELETE·FOR EACH STATEMENT）零动·0195/0208 文件零字节零触·
-- ACL/OWNER 由 CREATE OR REPLACE 保持（INVOKER 保持·不新增 SECURITY DEFINER 触发器函数）。
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
  IF TG_OP = 'DELETE'
     AND current_user = 'event_retention_worker'
     AND current_setting('app.event_ttl_sweep', true) IS NOT NULL
     AND session_user <> 'event_retention_worker' THEN
    RETURN NULL;  -- 0219 保留期清扫路径（专用 definer+专用 GUC+非直连+DELETE）放行·与隐私臂 role/GUC 双异不相交
  END IF;
  RAISE EXCEPTION 'interview_event_immutable' USING ERRCODE = '23514';
END
$$;

-- 清扫函数（0212:6-36 全形制锚）：界检查 fail-closed → 事务局域 GUC → 批 DELETE → GET DIAGNOSTICS。
CREATE OR REPLACE FUNCTION interview_event_retention_purge(p_keep_days integer, p_batch_cap integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  purged integer;
BEGIN
  IF p_keep_days IS NULL OR p_keep_days < 30 OR p_keep_days > 3650
     OR p_batch_cap IS NULL OR p_batch_cap < 1 OR p_batch_cap > 10000 THEN
    RAISE EXCEPTION 'interview_event_retention_invalid_input' USING ERRCODE = 'check_violation';
  END IF;
  -- 释放臂谓词键：事务局域（is_local=true）·函数即唯一 setter·幂等（重拍重置同键）。
  PERFORM set_config('app.event_ttl_sweep', clock_timestamp()::text, true);
  DELETE FROM interview_event
   WHERE created_at < clock_timestamp() - make_interval(days => p_keep_days)
     AND kind IN ('progress', 'generation_started', 'model_first_token', 'generation_progress')
     AND id IN (
       SELECT id
         FROM interview_event
        WHERE created_at < clock_timestamp() - make_interval(days => p_keep_days)
          AND kind IN ('progress', 'generation_started', 'model_first_token', 'generation_progress')
        LIMIT p_batch_cap
     );
  GET DIAGNOSTICS purged = ROW_COUNT;
  RETURN purged;
END;
$$;

ALTER FUNCTION interview_event_retention_purge(integer, integer) OWNER TO event_retention_worker;

-- 函数权（0177:171-172 同形）：worker 登录身份（app_role）直调·表权/行权/触发器全在 definer 侧收敛。
REVOKE ALL ON FUNCTION interview_event_retention_purge(integer, integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION interview_event_retention_purge(integer, integer) TO app_role;
