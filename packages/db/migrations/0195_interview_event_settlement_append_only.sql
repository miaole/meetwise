-- 0195_interview_event_settlement_append_only.sql — #15/#23：interview_event 与 settlement_ledger 追加不可变（REVOKE + 触发器）
--
-- executionMode = transactional（默认·REVOKE×2+函数×2+触发器×2 单事务原子）
--
-- #15/#23 修法合一：两表号称追加流/账本，app_role 仍有 UPDATE（0001:65
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES）。本迁移：
--   REVOKE UPDATE ON <表> FROM app_role（账本/事件流仅追加·INSERT/SELECT 不动）
--   + BEFORE UPDATE OR DELETE 触发器一律 RAISE 23514（纵深：拦一切角色原地改写，
--   形沿 0100 assert_*_immutable 先例）。
-- settlement_ledger 更正纪律 = 冲正行（DB 面拒原地 UPDATE·应用面零触）。
-- 执行前置硬门：rg 实测 `UPDATE interview_event` / `UPDATE settlement_ledger`
-- 在 packages/db/src + apps 零合法调用点（含跨行 -U 形）——非零即停手上报。
-- 触发器函数 INVOKER（只 RAISE 不读表·不新增 SECURITY DEFINER 对象——密封清单
-- 未知 SD fail-closed 目录门禁面零触）。

REVOKE UPDATE ON interview_event FROM app_role;
REVOKE UPDATE ON settlement_ledger FROM app_role;

CREATE OR REPLACE FUNCTION assert_interview_event_immutable() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'interview_event_immutable' USING ERRCODE = '23514';
END
$$;

CREATE TRIGGER interview_event_append_only_guard
  BEFORE UPDATE OR DELETE ON interview_event
  FOR EACH STATEMENT EXECUTE FUNCTION assert_interview_event_immutable();

CREATE OR REPLACE FUNCTION assert_settlement_ledger_immutable() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'settlement_ledger_immutable: 更正走冲正行' USING ERRCODE = '23514';
END
$$;

CREATE TRIGGER settlement_ledger_append_only_guard
  BEFORE UPDATE OR DELETE ON settlement_ledger
  FOR EACH STATEMENT EXECUTE FUNCTION assert_settlement_ledger_immutable();
