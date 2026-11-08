-- 0225_auth_user_session_owner_rls.sql
-- PRIV01 rev r3（post-prove 证伪报告 P1-1 修订 · 源=meetwise/.tmp/reviews/priv1-post-2.md）：auth_user_session
-- （0169）以 user_id 归属用户（jti/pwd_epoch 会话吊销真相源），但 0169 仅授对象级 GRANT（SELECT/INSERT/UPDATE
-- → app_role）零 RLS——DB 层无闸，app_role 携任意 principal GUC 可读/吊销他人会话行（证伪路活体实证）。
-- 本迁移开启 RLS（ENABLE+FORCE）并加 owner 策略，谓词与 0001 canonical p_owner 及 sql/09_auth.sql
-- p_user_account_self 同形。三条应用路径（apps/api/src/platform/auth-session.ts 的 INSERT 登录 /
-- UPDATE 吊销 / SELECT 校验）均已在 db.asPrincipal(uid) 事务内执行（SET LOCAL ROLE app_role +
-- set_config('app.principal_user', uid)），谓词恒自满足——认证/登出流程零变化（rev r3 隔离壳 neg:auth
-- 复跑亲证）。跨用户会话管理面（如管理员强制下线）今日不存在：全库无任何函数体引用本表（rev r3 活库
-- 普查）；未来若需要，必须走显式受控函数（入口 owner 绑定闸），禁直连表面。
-- 幂等：ENABLE/FORCE 重放零 diff；DROP POLICY IF EXISTS + CREATE（0016 先例形）。

ALTER TABLE auth_user_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_user_session FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_owner ON auth_user_session;
CREATE POLICY p_owner ON auth_user_session
  FOR ALL TO app_role
  USING (user_id = current_setting('app.principal_user', true))
  WITH CHECK (user_id = current_setting('app.principal_user', true));
