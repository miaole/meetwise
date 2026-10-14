-- 0191_outbox_consumption_fk.sql — #25 半 2：commerce_outbox.consumption_id FK + 唯一约束收编（在线两段式）
--
-- @migration-mode multi-statement
--
-- #25 修法半 2（引用列与 ON DELETE 行为=写入路径亲证后定）：
--   引用列 = entitlement_consumption(id)——commerce.ts 写入路径亲证：
--     INSERT INTO commerce_outbox(...consumption_id) 与 settleOutbox
--     `JOIN entitlement_consumption ec ON ec.id = o.consumption_id` 同一引用语义；
--   ON DELETE = NO ACTION（默认·保守）：saga 消费行（reserved→confirmed/released）
--     无删除路径（审计/对账面永存），FK 为兜底完整性门不参与级联；
--   唯一约束 = 收编 0190 并发建的 uq_outbox_consumption（UNIQUE USING INDEX·
--   0148 父侧同族形：索引已在线建好，约束化仅元数据短锁）。
-- 纪律：先检测后约束（fail-loud 沿 0149 首语句形）——存量孤儿行具名上报不洗。
-- 4 语句 = 1 DO 块孤儿预检 + 1 ADD FK NOT VALID + 1 VALIDATE + 1 UNIQUE USING INDEX。

DO $outbox_orphan_check$
DECLARE
  v_orphans integer;
BEGIN
  SELECT count(*) INTO v_orphans FROM commerce_outbox ch
    LEFT JOIN entitlement_consumption ec ON ec.id = ch.consumption_id
   WHERE ch.consumption_id IS NOT NULL AND ec.id IS NULL;
  IF v_orphans > 0 THEN
    RAISE EXCEPTION 'outbox_orphan_rows: commerce_outbox.consumption_id 无对应 entitlement_consumption 行计 % — 先对账清孤儿，不洗存量数据', v_orphans;
  END IF;
END
$outbox_orphan_check$;

ALTER TABLE commerce_outbox
  ADD CONSTRAINT fk_outbox_consumption FOREIGN KEY (consumption_id)
  REFERENCES entitlement_consumption (id) NOT VALID;

ALTER TABLE commerce_outbox VALIDATE CONSTRAINT fk_outbox_consumption;

ALTER TABLE commerce_outbox
  ADD CONSTRAINT uq_outbox_consumption UNIQUE USING INDEX uq_outbox_consumption;
