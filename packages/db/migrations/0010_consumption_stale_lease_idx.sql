-- 0010_consumption_stale_lease_idx.sql — 对账 sweep 索引(C1 可靠性/长寿硬化)。
-- commerce reconcile 每 ~30s 扫"租约过期的孤儿预留"(status='reserved' AND lease_expires_at<now())回收 → 防额度泄漏。
-- 无索引则每拍全表扫 entitlement_consumption(随交易量线性增长,10 年负债)。
-- **非破坏**:CREATE INDEX IF NOT EXISTS;部分索引只覆盖 reserved 行(活跃孤儿是极小子集)→ 常数级、体积小。
-- 与 sql/02_commerce.sql 的 ix_consumption_stale_lease 同形(单文件镜像供 proof 直跑)。

CREATE INDEX IF NOT EXISTS ix_consumption_stale_lease
  ON entitlement_consumption (lease_expires_at)
  WHERE status = 'reserved';
