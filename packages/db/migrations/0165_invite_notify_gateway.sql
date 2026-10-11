-- 0165_invite_notify_gateway.sql
--
-- I4 INVITE-FACE · 簇①（#221 邀请站内通知写侧·裁决项①采 SECURITY DEFINER 函数形）。
-- REQUEST：ai-docs/delivery/harness/i4-invite-face-REQUEST.md（rev2 @080dc6a5·§0.3/§1-①/§2-1）。
-- 真缝：notification FORCE RLS + p_owner WITH CHECK(owner=app.principal_user)（14_notification.sql:14-17）
--       令邀请链（招聘方 principal 上下文）物理不可直插候选人 owned 通知行；worker lane（备选②）异步
--       延迟需新管道。本函数=受控写侧通道（0155 gateway_active_candidate / 0160 投影函数同族先例）：
--       零表结构变更·零队列基建·同步落库。
-- 授权模型：definer=迁移运行角色（建表属主同源）；函数内①PERFORM gateway_require_active_recruiter()
--       （0155·DB 纵深门：绕 API guard 的 app_role 直调对 pending/rejected recruiter 同拒）②owner 谓词
--       fail-closed（job_application.recruiter_user_id=p_recruiter·非自有/不存在→0 行 0 写·与 b110 恒定壳
--       「未命中零信号零写」同源）③owner 上下文满足 WITH CHECK（FORCE RLS 语义零动——写侧必经本通道，
--       以候选人 principal 插入；先存后还原招聘方上下文，防同事务后续 RLS 判定被改写）。
-- 窄接口（裁决项①）：入参恰 (p_recruiter, p_application_id)；kind 固定 'job_invited'；payload 固定最小集
--       {jobId, jobTitle}（零邮箱零 PII 扩散·候选人自有申请行可查详情）；id='ntf_'||application_id
--       （report-worker ntf_${reportId} 幂等同形·ON CONFLICT DO NOTHING——重邀请/幂等复用零堆积）。
-- expand-only：仅 CREATE OR REPLACE FUNCTION（全新函数）+ 自包含 REVOKE/GRANT——零表零列零触发器零策略
--       （14_notification.sql 零字节改·RLS 本体零触）。
-- 禁顶层 BEGIN/COMMIT（migrate.ts 硬抛）·SET LOCAL lock_timeout（0156/0157/0159 先例）。
-- 镜像承重墙：packages/db/sql/23_api_gateway.sql 末尾同位追加（函数体+ACL 与本文件逐字节同文·
--       0159 RX-3：23=受控函数族+ACL 镜像住地·0160 同款判据）。

SET LOCAL lock_timeout = '2s';

CREATE OR REPLACE FUNCTION gateway_notify_invited(
  p_recruiter text,
  p_application_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_app RECORD;
  v_prev text;
BEGIN
  -- ① DB 纵深门：函数内复核 active+approved recruiter（0155·gateway_active_candidate 同族）。
  PERFORM public.gateway_require_active_recruiter();
  -- ② owner 谓词 fail-closed：申请必须存在且属于该招聘方。不命中 → 零写零信号（b110 恒定壳红线：
  --    未命中/不存在不可区分·零副作用）。
  SELECT id, candidate_user_id, job_id, job_title_snapshot
    INTO v_app
    FROM public.job_application
   WHERE id = p_application_id
     AND recruiter_user_id = p_recruiter
   LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  -- ③ owner 上下文满足 WITH CHECK（14_notification.sql p_owner·FORCE RLS 零动）：以候选人 principal
  --    插入；事务局部生效，插入后还原招聘方上下文（防同事务后续 RLS 判定被改写）。
  v_prev := current_setting('app.principal_user', true);
  PERFORM set_config('app.principal_user', v_app.candidate_user_id, true);
  -- ④ 窄接口：kind/payload 固定（裁决项①）·id=ntf_<applicationId> 幂等形·payload 最小集零 PII。
  INSERT INTO public.notification(id, owner_user_id, kind, payload)
  VALUES ('ntf_' || v_app.id, v_app.candidate_user_id, 'job_invited',
          jsonb_build_object('jobId', v_app.job_id, 'jobTitle', v_app.job_title_snapshot))
  ON CONFLICT (id) DO NOTHING;
  PERFORM set_config('app.principal_user', COALESCE(v_prev, ''), true);
END;
$$;

REVOKE ALL ON FUNCTION gateway_notify_invited(text, text) FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_notify_invited(text, text) TO app_role;
