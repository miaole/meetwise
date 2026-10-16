-- 11_commerce.sql — 支付订单(下单→回调入账)。接 01+02 后跑。
-- 承重铁律:回调**幂等 exactly-once 入账**(CAS status created→paid,重复回调不双扣不双入)。RLS owner 隔离。
-- B271 片1(迁移 0156 同步·源=真源·迁移=部署车):channel 列('online'|'offline'·存量语义=online) +
-- offline_remit_record 对公台账(双人分离载体) + invoice_profile/invoice_request(仅-paid 触发器门)。
DROP TABLE IF EXISTS payment_order, offline_remit_record, invoice_profile, invoice_request CASCADE;

CREATE TABLE payment_order (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  product_id text NOT NULL,
  amount_cents int NOT NULL,
  units numeric NOT NULL,                       -- 购买的额度
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed','refunded')),
  channel text NOT NULL DEFAULT 'online' CONSTRAINT ck_payment_order_channel CHECK (channel IN ('online','offline')),
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

-- 对公转账台账(B271 片1·迁移 0156 同形):order_id 唯一·bank_ref 确认时作 provider_txn 走既有 CAS
-- (uq_payment_order_provider_txn 全局唯一防一笔流水入两单)。**不授 app_role 任何表权限**(比 admin_audit
-- 更严)——全部读写只经 gateway_admin_offline_remit_* 受控 SECURITY DEFINER 函数(23_api_gateway.sql)。
CREATE TABLE offline_remit_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  bank_ref text NOT NULL,                       -- 银行流水号(确认时作 provider_txn 入 CAS)
  amount_cents int NOT NULL CHECK (amount_cents > 0),
  entered_by text NOT NULL,
  entered_at timestamptz NOT NULL DEFAULT now(),
  confirmed_by text,
  confirmed_at timestamptz,
  failed_by text,
  failed_at timestamptz,
  status text NOT NULL DEFAULT 'entered' CHECK (status IN ('entered','confirmed','failed'))
);
CREATE INDEX ix_offline_remit_status ON offline_remit_record (status, entered_at DESC);

-- 开票资料+开票申请(B271 片1·RLS 仅本人;申请仅 paid 订单=触发器具名门,0020 跨表 CHECK 先例)。
CREATE TABLE invoice_profile (
  owner_user_id text PRIMARY KEY,
  title text NOT NULL,                          -- 抬头
  tax_id text NOT NULL,                         -- 税号
  address_phone text,                           -- 地址电话
  bank_account text,                            -- 开户行账号
  email text NOT NULL,                          -- 收票邮箱
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE invoice_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  owner_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','issued','rejected')),
  invoice_no text,
  reject_reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  settled_by text,                              -- 片3 财务回填操作人(本片只占列)
  settled_at timestamptz
);
CREATE INDEX ix_invoice_request_owner ON invoice_request (owner_user_id, status);

GRANT SELECT, INSERT, UPDATE ON invoice_profile TO app_role;
GRANT SELECT, INSERT ON invoice_request TO app_role;

ALTER TABLE invoice_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_profile FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON invoice_profile
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

ALTER TABLE invoice_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_request FORCE ROW LEVEL SECURITY;
CREATE POLICY p_owner ON invoice_request
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

CREATE OR REPLACE FUNCTION enforce_invoice_request_paid_order()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
DECLARE o record;
BEGIN
  SELECT owner_user_id, status INTO o FROM payment_order WHERE id = NEW.order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice_request_order_not_found';
  END IF;
  IF o.owner_user_id <> NEW.owner_user_id THEN
    RAISE EXCEPTION 'invoice_request_owner_mismatch';
  END IF;
  IF o.status <> 'paid' THEN
    RAISE EXCEPTION 'invoice_request_order_not_paid';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_invoice_request_paid_order ON invoice_request;
CREATE TRIGGER trg_invoice_request_paid_order
BEFORE INSERT OR UPDATE OF order_id, owner_user_id ON invoice_request
FOR EACH ROW EXECUTE FUNCTION enforce_invoice_request_paid_order();
REVOKE ALL ON FUNCTION enforce_invoice_request_paid_order() FROM PUBLIC, app_role, app_gateway_role;
