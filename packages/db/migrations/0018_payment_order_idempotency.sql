-- 0018_payment_order_idempotency.sql — 补 payment_order.idempotency_key(幂等,脏库可重跑)。
-- 漂移修复:该列 + UNIQUE(owner_user_id, idempotency_key) 已在 sql/11_commerce.sql,但 0001_baseline(冻结快照)
-- 里没有、且此前无配套迁移 → **fresh deploy(只跑迁移)建出的 payment_order 缺此列,createOrder INSERT 直接 500 下单全废**。
-- createOrder(packages/db/src/payment.ts)按 idempotency_key 做"网络重试不重复下单"的幂等,必须有此列。
ALTER TABLE payment_order ADD COLUMN IF NOT EXISTS idempotency_key text;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'payment_order'::regclass AND contype = 'u'
      AND conkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid='payment_order'::regclass AND attname='owner_user_id'),
        (SELECT attnum FROM pg_attribute WHERE attrelid='payment_order'::regclass AND attname='idempotency_key')
      ]::smallint[]
  ) THEN
    ALTER TABLE payment_order ADD CONSTRAINT uq_payment_order_idem UNIQUE (owner_user_id, idempotency_key);
  END IF;
END $$;
