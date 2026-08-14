-- 0023_qbank_cache_epoch_rls_reconcile.sql
-- 0022 的 epoch 表是只读公共元数据：app_role 必须能读 current epoch，写权限只留给 trigger 的 SECURITY DEFINER
-- 函数属主。此增量 reconcile 让已运行过早期 0022 草案的环境也得到同一 fail-closed 权限面；不改任何缓存数据。

GRANT SELECT ON qbank_cache_epoch TO app_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON qbank_cache_epoch FROM app_role;

ALTER TABLE qbank_cache_epoch ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_cache_epoch FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_cache_epoch_read ON qbank_cache_epoch;
CREATE POLICY p_qbank_cache_epoch_read ON qbank_cache_epoch FOR SELECT TO app_role USING (singleton);

-- FORCE RLS 也约束函数属主；public policy 不是 public 写权限（app_role 已被显式 REVOKE UPDATE），
-- 只让 qbank_bump_retrieval_cache_epoch 在触发器上下文中完成 epoch 原子自增。
DROP POLICY IF EXISTS p_qbank_cache_epoch_bump ON qbank_cache_epoch;
CREATE POLICY p_qbank_cache_epoch_bump ON qbank_cache_epoch FOR UPDATE TO PUBLIC
  USING (singleton) WITH CHECK (singleton);
