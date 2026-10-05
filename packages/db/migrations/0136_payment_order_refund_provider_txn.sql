-- 0136_payment_order_refund_provider_txn.sql
-- GAP-UC011-REFUND-CALLBACK：退款回调幂等键（支付单号+退款流水）exactly-once。
-- 与 provider_txn 分立：支付入账流水保留；退款另记 refund_provider_txn；partial UNIQUE 禁跨单双退。
-- 脏库可重跑：ADD COLUMN IF NOT EXISTS + 索引 IF NOT EXISTS。

ALTER TABLE payment_order ADD COLUMN IF NOT EXISTS refund_provider_txn text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
     WHERE schemaname = 'public'
       AND indexname = 'uq_payment_order_refund_provider_txn'
  ) THEN
    -- 历史重复（不应存在；有则显式失败，避免静默丢唯一性）
    IF EXISTS (
      SELECT 1 FROM (
        SELECT refund_provider_txn
          FROM payment_order
         WHERE refund_provider_txn IS NOT NULL
         GROUP BY refund_provider_txn
        HAVING count(*) > 1
      ) dups
    ) THEN
      RAISE EXCEPTION 'payment_refund_provider_txn_duplicate: resolve before applying 0136';
    END IF;
    CREATE UNIQUE INDEX uq_payment_order_refund_provider_txn
      ON payment_order (refund_provider_txn) WHERE refund_provider_txn IS NOT NULL;
  END IF;
END $$;
