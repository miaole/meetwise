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
  refund_provider_txn text,                     -- 退款方流水号(退款回调幂等依据；与 provider_txn 分立)
  idempotency_key text,                         -- 创建幂等键(网络重试不重复下单)
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, idempotency_key)
);
-- 渠道流水是全局支付事实，不是「每个订单各自的字符串」。NULL 保留给尚未支付订单；一旦写入，
-- 同一流水绝不能关联第二张订单，否则两个 created→paid CAS 都会各自成功并双发权益。
CREATE UNIQUE INDEX uq_payment_order_provider_txn
  ON payment_order (provider_txn) WHERE provider_txn IS NOT NULL;
-- 退款流水同理：同一退款 txn 绝不能跨单双退（红冲 exactly-once）。
CREATE UNIQUE INDEX uq_payment_order_refund_provider_txn
  ON payment_order (refund_provider_txn) WHERE refund_provider_txn IS NOT NULL;
CREATE INDEX ix_order_owner ON payment_order (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON payment_order TO app_role;

ALTER TABLE payment_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_order FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON payment_order
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
