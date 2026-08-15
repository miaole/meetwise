-- 0020_commerce_terminal_integrity.sql
-- P0 transaction integrity:
--   1) 一笔 PSP provider_txn 只能归属一张 payment_order；
--   2) 已预留额度的 interview 进入 completed/abandoned 时，必须与 consumption 的 confirmed/released 终态配对。
-- 本迁移刻意 fail-closed：历史若已经有同一流水绑定多订单，不能静默挑一个赢家或删除账，必须先人工对账。

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM payment_order
     WHERE provider_txn IS NOT NULL
     GROUP BY provider_txn
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'payment_provider_txn_duplicate: resolve historical duplicate provider_txn before applying 0020';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_order_provider_txn
  ON payment_order (provider_txn) WHERE provider_txn IS NOT NULL;

-- 跨表 CHECK 在 PostgreSQL 中不可用；用触发器把「收费面试」的终态配对下沉到数据库。
-- 无 consumption 的历史/未开始免费面试保持兼容；一旦存在以 interview_id 为幂等键的预留记录，
-- completed 只能配 confirmed，abandoned 只能配 released。
CREATE OR REPLACE FUNCTION enforce_interview_consumption_terminal_pair()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  consumption_status text;
BEGIN
  IF NEW.status NOT IN ('completed', 'abandoned') THEN
    RETURN NEW;
  END IF;

  SELECT status INTO consumption_status
    FROM entitlement_consumption
   WHERE owner_user_id=NEW.owner_user_id AND idempotency_key=NEW.id
   LIMIT 1;

  -- 未收费的 legacy/空壳面试没有配对对象，不在此触发器中拒绝。
  IF consumption_status IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status='completed' AND consumption_status <> 'confirmed' THEN
    RAISE EXCEPTION 'invalid_interview_consumption_pair: completed requires confirmed, got %', consumption_status
      USING ERRCODE='23514';
  END IF;

  IF NEW.status='abandoned' AND consumption_status <> 'released' THEN
    RAISE EXCEPTION 'invalid_interview_consumption_pair: abandoned requires released, got %', consumption_status
      USING ERRCODE='23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_interview_consumption_terminal_pair ON interview;
CREATE TRIGGER trg_interview_consumption_terminal_pair
  BEFORE INSERT OR UPDATE OF status ON interview
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_consumption_terminal_pair();
