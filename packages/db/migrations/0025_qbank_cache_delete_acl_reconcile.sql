-- 0025_qbank_cache_delete_acl_reconcile.sql
-- lease 完成/异常后必须由 app_role 删除自己的 inflight row；TTL 行也需要按 owner 清理。
-- 显式重申最小表权限，修复早期部署中 ACL 只到 arw（缺 DELETE）的状态，不放开任何跨 owner 权限。

GRANT SELECT, INSERT, UPDATE, DELETE ON qbank_retrieval_cache, qbank_retrieval_inflight TO app_role;
