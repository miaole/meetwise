-- 0149_money_status_constraints.sql — DBM3-1 · GAP-DEBT-DB-MONEY3 清偿刀（harness rev2 @f5766102 裁定落卷）
-- 裁定：D1=案B（units CHECK-only · 零 ALTER TYPE/零 rewrite/零存量触碰）· D3=删 0027 表级唯一保 0021 partial
--       （ON CONFLICT arbiter 亲核 interview-event.ts:32 带谓词目标只能推断 partial index）· D4=settlement 入刀 ·
--       D6=ai_graph_run 11 值全收（枚举只增不改 · succeeded/completed 双终态并存保留 = Ban 业务语义变更）。
-- 摘除面：consumption_record 无 CHECK（rev2 裁定——DBHY-1 DROP 先行 · 表生死归该刀）。
-- 纪律：先检测后约束（fail-loud）——存量脏行具名上报不洗（Ban 洗存量数据）；
--       零 UPDATE/DELETE/INSERT/DROP COLUMN/ALTER COLUMN TYPE/CREATE INDEX/TRIGGER/RLS/GRANT（prove P6 静态门）。
-- 编号：0144–0148 由协调方让位序预留（DBTF-1=0144 · DBHY-1=0145+0146 · DBFK-1=0147+0148），
--       落号时亲核（2026-10-08 fetch 后全分支可见面无 0144–0148 实占文件）→ 0149 为 DBM3-1 落号。

-- ── 前置脏值检测（先于一切 ADD CONSTRAINT · 非 0 即炸 · 具名可行动） ──────────────────
DO $dbm3_detect$
DECLARE
  v_amount_cents integer;
  v_units integer;
  v_settled integer;
  v_run_status integer;
BEGIN
  SELECT count(*) INTO v_amount_cents FROM payment_order WHERE amount_cents <= 0;
  SELECT count(*) INTO v_units
    FROM payment_order
   WHERE NOT (units > 0 AND units <= 9999999999.99 AND units = round(units, 2));
  SELECT count(*) INTO v_settled FROM settlement_ledger WHERE units_settled < 0;
  SELECT count(*) INTO v_run_status
    FROM ai_graph_run
   WHERE status NOT IN ('created','active','waiting_user','migrating','paused','quarantined',
                        'safe_terminating','safely_terminated','succeeded','completed','failed');
  IF v_amount_cents + v_units + v_settled + v_run_status > 0 THEN
    RAISE EXCEPTION 'dbm3_dirty_rows: amount_cents_nonpositive=%, units_out_of_domain=%, settlement_units_settled_negative=%, ai_graph_run_status_off_vocabulary=% — 停部署上报 meetwise 裁决（修复刀 or 豁免登记），不洗存量数据',
      v_amount_cents, v_units, v_settled, v_run_status;
  END IF;
END $dbm3_detect$;

-- ── 轨1 法币：amount_cents 正数 CHECK（严格正——目录价均正；0 元权益走 gift/trial 桶不经 payment_order） ──
ALTER TABLE payment_order DROP CONSTRAINT IF EXISTS ck_payment_order_amount_cents_positive;
ALTER TABLE payment_order ADD CONSTRAINT ck_payment_order_amount_cents_positive
  CHECK (amount_cents > 0);

-- ── 轨2 权益：units 案B 护栏（与落点 entitlement_bucket numeric(12,2) 逻辑等价：>0 · ≤9999999999.99 · 2 位小数锚）
--    22003 炸点前移：脏 units 今日在回调入账（payment.ts:84 落 numeric(12,2)）才炸，此后在下单时即 23514 拒绝。
ALTER TABLE payment_order DROP CONSTRAINT IF EXISTS ck_payment_order_units_range;
ALTER TABLE payment_order ADD CONSTRAINT ck_payment_order_units_range
  CHECK (units > 0 AND units <= 9999999999.99 AND units = round(units, 2));

-- ── 轨2 权益：settlement_ledger 同族兜底（D4 入刀 · 一行成本） ─────────────────────────
ALTER TABLE settlement_ledger DROP CONSTRAINT IF EXISTS ck_settlement_units_settled_nonneg;
ALTER TABLE settlement_ledger ADD CONSTRAINT ck_settlement_units_settled_nonneg
  CHECK (units_settled >= 0);

-- ── status 枚举：ai_graph_run 11 值（D6 全收 · 词表亲核见 harness §1.3 逐值 file:line 溯源）
--    脏值此前静默绕过 uq_active_run partial unique 不变量（脏 status 落谓词之外 → 同 (graph,thread) 双活 run 无报错）。
ALTER TABLE ai_graph_run DROP CONSTRAINT IF EXISTS ck_ai_graph_run_status;
ALTER TABLE ai_graph_run ADD CONSTRAINT ck_ai_graph_run_status
  CHECK (status IN ('created','active','waiting_user','migrating','paused','quarantined',
                    'safe_terminating','safely_terminated','succeeded','completed','failed'));

-- ── D3：interview_event 双重唯一删一——删 0027 表级约束（全行背衬 btree = 每笔 INSERT 纯开销），
--    保 0021 partial index（ON CONFLICT (stream_key,event_key) WHERE event_key IS NOT NULL 的实际 arbiter）。
--    NULL 语义等价（partial 不收录 NULL 行 · 约束 NULLS DISTINCT 均允许多 NULL）→ 纯冗余消除。
--    联动：packages/db/sql/01_schema.sql fixture 同刀对齐（drift:prove 方向=sql/ 有迁移缺即红）。
ALTER TABLE interview_event DROP CONSTRAINT IF EXISTS uq_interview_event_key_constraint;
