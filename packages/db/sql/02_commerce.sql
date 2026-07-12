-- 02_commerce.sql — 共享权益池 + reserve/confirm/release saga + outbox 对账（接 01_schema 之后跑，复用 app_role + RLS 规约）
-- 落已签业务口径（open-decisions / meetwise-pricing-model）：
--   * 共享池：所有 serviceType 同抽一池；池=各桶 available 之和（available = total - reserved - consumed，未过期）
--   * FIFO 先到期先扣：按 expires_at 升序跨桶贪心分配
--   * reserve→confirm→release saga；confirm 支持按比例（降级 1/2）；失败/中止 release 全退
--   * 不丢/不重扣：幂等键按 principal 作用域；桶容量 CHECK + 可用量 CAS 防超卖；confirm/release 幂等
--   * outbox：confirm 落账投 settlement_proposed，对账 sweeper 兜底
DROP TABLE IF EXISTS entitlement_bucket, entitlement_consumption, commerce_outbox, settlement_ledger CASCADE;

-- 共享池的一笔来源桶（gift/trial/paid）。numeric 单位：1 次面试=1.00，降级按比例可落 0.50。
CREATE TABLE entitlement_bucket (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('gift','trial','paid')),
  units_total numeric(12,2) NOT NULL CHECK (units_total >= 0),
  units_reserved numeric(12,2) NOT NULL DEFAULT 0 CHECK (units_reserved >= 0),
  units_consumed numeric(12,2) NOT NULL DEFAULT 0 CHECK (units_consumed >= 0),
  expires_at timestamptz NOT NULL,
  source_order_id text,
  version int NOT NULL DEFAULT 0,
  -- 核心不变量：预留+已耗 不得超过总额（防超卖，DB 层兜底，绕过应用也拦得住）
  CONSTRAINT ck_bucket_capacity CHECK (units_reserved + units_consumed <= units_total)
);
CREATE INDEX ix_bucket_fifo ON entitlement_bucket (owner_user_id, expires_at);

-- 一次消费的 saga 记录。幂等键按 (owner, key) 作用域——双击/重发只算一次。
CREATE TABLE entitlement_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  idempotency_key text NOT NULL,
  service_type text NOT NULL,
  units_requested numeric(12,2) NOT NULL CHECK (units_requested > 0),
  units_settled numeric(12,2),                              -- confirm 时按比例定
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved','confirmed','partial_confirmed','released')),
  allocations jsonb NOT NULL DEFAULT '[]',                  -- [{bucket_id, units}] 预留分布，confirm/release 据此回写
  lease_expires_at timestamptz,                             -- 预留租约：长会话靠心跳续约保住预留；租约过期(=进程崩了)才被对账回收
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_entitlement_consumption_idem UNIQUE (owner_user_id, idempotency_key)
);
-- 对账 sweep 索引:reconcile 每 ~30s 扫"租约过期的孤儿预留"(status='reserved' AND lease_expires_at<now())。
-- 部分索引只覆盖 reserved 行(活跃孤儿是极小子集)→ 免全表扫,10 年数据量下仍常数级。version 演进负债最低。
CREATE INDEX IF NOT EXISTS ix_consumption_stale_lease
  ON entitlement_consumption (lease_expires_at)
  WHERE status = 'reserved';

-- 结算 outbox：confirm 成功在同一事务投 settlement_proposed。relay 消费者投递下游后置 'relayed'。
-- 注：'relayed'=已交给结算消费者,**不等于业务结算完成**（真实下游结算尚是 STUB,见 commerce.ts reconcile 注释）。
CREATE TABLE commerce_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  kind text NOT NULL,
  consumption_id uuid NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','relayed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_outbox_pending ON commerce_outbox (owner_user_id, status);

-- 结算账本：outbox 消费者的**真实下游副作用**——每笔已 confirm 的消费在此入账一次（业务/营收承认）。
-- UNIQUE(consumption_id) 让 at-least-once outbox + 重跑 = exactly-once 入账（不是 relay 占位 stub）。
CREATE TABLE settlement_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  consumption_id uuid NOT NULL,
  units_settled numeric(12,2) NOT NULL,
  service_type text NOT NULL,
  settled_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_settlement_consumption UNIQUE (consumption_id)
);

-- 业务路径用非 owner app_role + principal 上下文（FORCE RLS 生效）。01_schema 的 GRANT ALL 不覆盖此后新建表，显式补。
GRANT SELECT, INSERT, UPDATE ON entitlement_bucket, entitlement_consumption, commerce_outbox, settlement_ledger TO app_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['entitlement_bucket','entitlement_consumption','commerce_outbox','settlement_ledger'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY p_owner ON %I '
      'USING (owner_user_id = current_setting(''app.principal_user'', true)) '
      'WITH CHECK (owner_user_id = current_setting(''app.principal_user'', true))', t);
  END LOOP;
END $$;
