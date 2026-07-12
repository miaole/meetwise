-- 11_commerce.sql — 支付订单(下单→回调入账)。接 01+02 后跑。
-- 承重铁律:回调**幂等 exactly-once 入账**(CAS status created→paid,重复回调不双扣不双入)。RLS owner 隔离。
DROP TABLE IF EXISTS payment_order CASCADE;

CREATE TABLE payment_order (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  product_id text NOT NULL,
  amount_cents int NOT NULL,
  units numeric NOT NULL,                       -- 购买的额度
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed','refunded')),
  provider_txn text,                            -- 支付方流水号(回调幂等依据)
  idempotency_key text,                         -- 创建幂等键(网络重试不重复下单)
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, idempotency_key)
);
CREATE INDEX ix_order_owner ON payment_order (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON payment_order TO app_role;

ALTER TABLE payment_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_order FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON payment_order
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
