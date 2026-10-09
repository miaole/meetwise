-- 0152_trial_bucket_grant.sql — #228+#29 注册赠送体验额度刀：trial 桶每用户至多一桶 + signup 同事务发放。
-- 承重（蓝图 ai-docs/delivery/harness/trial-grant-REQUEST.md @4f8e5942 rev2 §1.1）：
--   ① partial unique index：trial 是结构性 once-per-user 赠送，DB 层兜底挡任何第二 trial 写入路径
--     （含未来 admin 发放面），不靠调用方自觉；拒绝幂等键列方案（0018 先例语义=每单幂等，不适用）。
--   ② gateway_auth_signup 扩展（位形 A）：user_account INSERT 后同函数内（=同事务）INSERT trial 桶，
--     ON CONFLICT DO NOTHING 收敛——禁 SELECT-then-INSERT（payment.ts:18-20 自认并发缺陷）；
--     signup 23505 回滚则桶不存在（原子），桶冲突 DO NOTHING 不拖垮注册。
-- 可重跑形制照 0018：IF NOT EXISTS 判存 + CREATE OR REPLACE + REVOKE/GRANT 重申；禁顶层 BEGIN/COMMIT
-- （migrate.ts containsTopLevelTransactionControl 硬抛；普通 CREATE UNIQUE INDEX 于 runner 事务内应用）。
-- ON CONFLICT 谓词 (owner_user_id) WHERE kind = 'trial' 与下方 index 定义逐字一致（arbiter 推断前提）。
-- REVOKE/GRANT 照 0041:139-142 原样重申（CREATE OR REPLACE 后重申最小 EXECUTE 面）。

CREATE UNIQUE INDEX IF NOT EXISTS uq_bucket_trial_one_per_owner
  ON entitlement_bucket (owner_user_id) WHERE kind = 'trial';

CREATE OR REPLACE FUNCTION gateway_auth_signup(
  p_id text,
  p_email text,
  p_password_hash text,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_id IS NULL OR p_id = '' OR p_email IS NULL OR p_email = ''
    OR p_password_hash IS NULL OR p_password_hash = '' OR p_role NOT IN ('candidate', 'recruiter') THEN
    RAISE EXCEPTION 'gateway_auth_signup_invalid_input' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.user_account(id, email, password_hash, role)
  VALUES (p_id, p_email, p_password_hash, p_role);
  -- 注册赠送一次体验额度（#228 D1 已决）：kind='trial'·units_total=1.00（1 次面试=1.00 口径，恰够一场）
  -- ·expires_at 同 paid 唯一先例 now()+interval '365 days'（payment.ts:85）·source_order_id=NULL（无单）。
  INSERT INTO public.entitlement_bucket(owner_user_id, kind, units_total, expires_at)
  VALUES (p_id, 'trial', 1.00, now() + interval '365 days')
  ON CONFLICT (owner_user_id) WHERE kind = 'trial' DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION gateway_auth_signup(text, text, text, text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_auth_signup(text, text, text, text) TO app_gateway_role;
