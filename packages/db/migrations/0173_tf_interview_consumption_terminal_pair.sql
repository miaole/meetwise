-- 0173_tf_interview_consumption_terminal_pair.sql
--
-- billing 战役 P3（BILL3-SETTLEMENT）修法②：tf_interview_consumption_terminal_pair 触发器函数整体改写
-- （CREATE OR REPLACE·0144 :365 签名原形——**非** 0020 旧函数体，蓝本 §6.4 头注原文）。
-- REQUEST：ai-docs/delivery/harness/bill3-settlement-REQUEST.md（pre-exec 双审 BOTH PASS + 协调方常设 loop 授权）。
-- 蓝本：billing-redesign README rev1 §6.4（:338-371 改写草案全文为底）。
-- 分支语义：
--   per_session 分支=0144 :386-393 两 RAISE 原逻辑**逐字保留**（默认即旧行为·回滚=恢复 0144 函数体·
--     REQUEST §5 增补行①原文）——completed 只配 confirmed·abandoned/failed 只配 released。
--   per_topic_capped 分支（方案②比较式·裁决②）：counted=SUM(units) FILTER (WHERE status='counted')
--     （同 owner+interview 的 topic_charge 已关闭话题合计）——
--     counted=0 且 cs≠released ⇒ zero_usage_requires_release 23514（全跳过/未关闭话题场必须全退）；
--     counted>0 且（cs∉(confirmed,partial_confirmed) 或 settled≠公式）⇒ topic_settled_mismatch 23514。
--   公式（方案②·与 confirmConsumptionUnits 应用侧同一公式否则误报·蓝本 §5 原文）：
--     settled = r2(requested × LEAST(counted, cap) / cap)
--     SQL 面 r2=round(x::numeric, 2) 同式（REQUEST §0.2-7：PG numeric round 与 JS
--     Math.round(n×100)/100 正数域同为 half-away-from-zero）。
--   failed/abandoned 只要有已计话题就要求已确认=裁决③「系统原因提前结束=已完成话题照收」的 DB 法面
--     （失败也收已完成话题·若日后改「failed 一律全退」在本分支开头加 status='failed'⇒released，蓝本 §6.4 注原文）。
-- 零触面：外层 enforce_interview_consumption_terminal_pair()（0144 :397-403）与触发器
--   （0020 :62-64 BEFORE INSERT OR UPDATE OF status）零改；0046 scoring 完整性触发器零放松
--   （REQUEST §1.4-② 定界）；GRANT EXECUTE … TO PUBLIC 语义 CREATE OR REPLACE 不动 ACL（0144 :411 亲证）。
-- 编号=0173（LANDING-INDEX 第七节定谳·本刀恰占 0172+0173·0184 起顺延勿添重号）。
-- 历史迁移 0001-0180 零字节改 + sql/ 影子面零改（新迁移铁律）——本文件为本刀两新迁移之一。

CREATE OR REPLACE FUNCTION public.tf_interview_consumption_terminal_pair(
  p_old public.interview,
  p_new public.interview
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  cs text;
  settled numeric;
  requested numeric;
  counted numeric;
BEGIN
  IF p_new.status NOT IN ('completed', 'abandoned', 'failed') THEN
    RETURN;
  END IF;

  SELECT status, units_settled, units_requested INTO cs, settled, requested
    FROM entitlement_consumption
   WHERE owner_user_id=p_new.owner_user_id AND idempotency_key=p_new.id
   LIMIT 1;
  IF cs IS NULL THEN
    RETURN;
  END IF;

  IF p_new.billing_mode = 'per_session' THEN            -- 0144 :386-393 原逻辑逐字保留（默认即旧行为）
    IF p_new.status='completed' AND cs <> 'confirmed' THEN
      RAISE EXCEPTION 'invalid_interview_consumption_pair: completed requires confirmed, got %', cs
        USING ERRCODE='23514';
    END IF;
    IF p_new.status IN ('abandoned','failed') AND cs <> 'released' THEN
      RAISE EXCEPTION 'invalid_interview_consumption_pair: % requires released, got %', p_new.status, cs
        USING ERRCODE='23514';
    END IF;
    RETURN;
  END IF;

  SELECT COALESCE(SUM(units) FILTER (WHERE status='counted'),0) INTO counted
    FROM topic_charge
   WHERE owner_user_id=p_new.owner_user_id AND interview_id=p_new.id;
  IF counted = 0 THEN
    IF cs <> 'released' THEN
      RAISE EXCEPTION 'zero_usage_requires_release' USING ERRCODE='23514';
    END IF;
  ELSIF cs NOT IN ('confirmed','partial_confirmed')
    OR settled <> round(requested * LEAST(counted, p_new.billing_cap_units) / p_new.billing_cap_units, 2) THEN
    RAISE EXCEPTION 'topic_settled_mismatch' USING ERRCODE='23514';
  END IF;
END;
$$;
