-- 未结算 outbox 行单独建索引。谓词只收录 status 为 pending 的行，入账后离开索引。
--
-- @migration-mode concurrent-index
--
-- 存量表上的新索引走并发通道：语句在事务外执行，建成后才单独记账。

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_outbox_unsettled
  ON commerce_outbox (owner_user_id)
  WHERE status = 'pending';
