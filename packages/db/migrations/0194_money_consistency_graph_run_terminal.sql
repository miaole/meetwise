-- 0194_money_consistency_graph_run_terminal.sql — #152：结算金额一致性触发器 + ai_graph_run 终态冻结触发器
--
-- @migration-mode multi-statement
--
-- #152 修法两半（终态统一裁决=双终态并存保留·Ban 业务语义变更）：
-- ①金额一致性（settlement_ledger 形）：账本行 units_settled 不得大于对应
--   entitlement_consumption.units_settled（结算不超确认额·消费行不存在即拒）。
--   纯增量 DB 门（应用零触·confirm/settleOutbox 公式面零改）——0173 触发器比较式
--   同族先例（INVOKER 读 entitlement_consumption·写路径 owner-scoped 同构可达）。
--   触发器函数 INVOKER（不新增 SECURITY DEFINER 对象——密封清单未知 SD fail-closed
--   目录门禁面零触）。前置存量脏值检测（fail-loud·不洗存量）。
-- ②ai_graph_run 终态冻结（转移触发器·宽转移严终态形）：词表 11 值（0149 CHECK
--   在位零改）。写点实测：两处续约臂均无 status 过滤（interview.service.ts:827-836
--   career-path latest 行 FOR UPDATE 任意前态→active·interview-graph-lease.ts:42
--   adaptive-interview 同构）＝终态行复用重试槽——failed/succeeded/safely_terminated
--   三态皆有续约或重试语义（failed→active=uc004 FI3-RETRY-VERSION-INCREMENTS 契约
--   重试臂·succeeded→active=成功后重复 POST 同走续约臂·safely_terminated→active=
--   abandon 后 assessment 先行流续约臂仍可达），冻结任一即生产对应路径恒 23514→500，
--   皆不冻结。冻结集缩至真死终态='completed' 单值（零生产写点·kernel 纪元词表遗留·
--   双终态并存保留=Ban 业务语义变更）：
--   OLD.status='completed' 且 NEW.status≠OLD.status → RAISE。
-- 5 语句 = 1 DO 块 + 2 CREATE OR REPLACE FUNCTION + 2 CREATE TRIGGER。

DO $settlement_consistency_detect$
DECLARE
  v_inconsistent integer;
BEGIN
  SELECT count(*) INTO v_inconsistent FROM settlement_ledger l
    JOIN entitlement_consumption ec ON ec.id = l.consumption_id
   WHERE ec.units_settled IS NOT NULL AND l.units_settled > ec.units_settled;
  IF v_inconsistent > 0 THEN
    RAISE EXCEPTION 'settlement_units_inconsistent: ledger.units_settled 超 consumption 确认额行计 % — 停部署对账上报，不洗存量数据', v_inconsistent;
  END IF;
END
$settlement_consistency_detect$;

CREATE OR REPLACE FUNCTION enforce_settlement_units_consistent() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_consumed numeric(12,2);
BEGIN
  SELECT units_settled INTO v_consumed FROM public.entitlement_consumption WHERE id = NEW.consumption_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'settlement_consumption_missing: consumption_id % 无对应消费行', NEW.consumption_id USING ERRCODE = '23514';
  END IF;
  IF v_consumed IS NOT NULL AND NEW.units_settled > v_consumed THEN
    RAISE EXCEPTION 'settlement_units_exceed_consumption: ledger.units_settled=% > consumption.units_settled=%', NEW.units_settled, v_consumed USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER settlement_units_consistency_guard
  BEFORE INSERT OR UPDATE OF units_settled ON settlement_ledger
  FOR EACH ROW EXECUTE FUNCTION enforce_settlement_units_consistent();

CREATE OR REPLACE FUNCTION assert_ai_graph_run_terminal_frozen() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'ai_graph_run_terminal_frozen: 终态 % 不可迁移至 %', OLD.status, NEW.status USING ERRCODE = '23514';
END
$$;

CREATE TRIGGER ai_graph_run_terminal_guard
  BEFORE UPDATE OF status ON ai_graph_run
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status
        AND OLD.status = 'completed')
  EXECUTE FUNCTION assert_ai_graph_run_terminal_frozen();
