-- 0190_outbox_consumption_unique_concurrent.sql — #25 半 1：commerce_outbox.consumption_id 唯一索引（在线并发建）
--
-- @migration-mode concurrent-index
--
-- #25 修法半 1（唯一约束形裁决=在线两段）：审计面=commerce_outbox.consumption_id
-- 既无 FK 也无唯一约束（对照 settlement_ledger uq_settlement_consumption 在位）。
-- 本迁移在线并发建唯一索引（#115 纪律半：本刀起一切新迁移在存量（热）表上建
-- 索引一律 CONCURRENTLY·commerce_outbox 为存量表）；下一迁移把索引收编为约束
-- 并补 FK（0148 UNIQUE USING INDEX 同族两段形）。
-- 语义锚：settleOutbox 以 ledger UNIQUE(consumption_id) 承 at-least-once→exactly-once；
-- outbox 同 consumption_id 双行=同结算意图重复投递，唯一索引在库面兜底拒绝。
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_outbox_consumption
  ON commerce_outbox (consumption_id);
