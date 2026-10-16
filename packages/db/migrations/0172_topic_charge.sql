-- 0172_topic_charge.sql
--
-- billing 战役 P3（BILL3-SETTLEMENT）修法①：topic_charge 话题计费表 + interview 计费三列 + ck_interview_cap。
-- REQUEST：ai-docs/delivery/harness/bill3-settlement-REQUEST.md（pre-exec 双审 BOTH PASS + 协调方常设 loop 授权）。
-- 蓝本：billing-redesign README rev1 §6.3（:310-336 SQL 草案逐行为底·两更正在案：cap 非空 CHECK 承重
--   （LEAST(x,NULL) 忽略 NULL=封顶校验静默失效·§10-11 原文）/counted_capped·waived 恒 0 分表级 CHECK）。
-- 列语义（蓝本 §6.3 原文）：
--   billing_mode：'per_session'（NOT NULL DEFAULT=存量+新场全默认旧行为·零行为变更增补行①）/
--     'per_topic_capped'（列即开关载体·Ban 新 env 闸·flag 关回=行值改回 per_session）。
--   billing_cap_units：封顶（单位恒场单位·方案②零存量换算·裁决②；影子期复核改值零迁移=行值承载）。
--   billing_rule_version：计费规则版本行值（topic_charge.rule_version NOT NULL 的唯一行值源）。
--   ck_interview_cap 四谓词：per_session⇒cap NULL ∨ per_topic_capped⇒cap>0 且 rule_version 非空。
-- topic_charge（明细三账本之二·LANDING-INDEX 十三节）：恒 1 分/话题（Ban 话项粒度浮动定价·units<=3
--   保留备选方案默认不用）；status 三值 CHECK（counted/counted_capped/waived）——影子面 skipped/
--   failed_release 两观测值在结算面的落行形状=裁决项②按推荐行使：跳过话题落 waived 行 reason='skipped'
--   （明细可见·三值 CHECK 逐字容纳）；reason 可空（REQUEST §9 E4 勘误：仅 rule_version NOT NULL）；
--   PK(owner_user_id,interview_id,topic_id)=崩溃重放去重（0037 :26 同形·写入口 ON CONFLICT DO NOTHING）。
-- RLS 行权形状（裁决项①按推荐行使）：ENABLE+FORCE+p_owner 策略+只授 SELECT,INSERT（0171 :36-42 形制
--   范本逐字——计费事实表只增不改·更正走红冲/后行）。
-- 编号=0172（LANDING-INDEX 第七节定谳 0170-0173 billing 战役自用；0170/0171=P1 已落、0180=P2 已落占·
--   本刀恰占 0172+0173 零新增号诉求·落卷链 max=0180 亲证零撞）。
-- 历史迁移 0001-0180 零字节改 + sql/ 影子面零改（新迁移铁律）——本文件为本刀两新迁移之一。

ALTER TABLE interview ADD COLUMN IF NOT EXISTS billing_mode text NOT NULL DEFAULT 'per_session';
ALTER TABLE interview ADD COLUMN IF NOT EXISTS billing_cap_units numeric(12,2);
ALTER TABLE interview ADD COLUMN IF NOT EXISTS billing_rule_version text;

ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_billing_mode;
ALTER TABLE interview
  ADD CONSTRAINT ck_interview_billing_mode
  CHECK (billing_mode IN ('per_session','per_topic_capped'));

ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_cap;
ALTER TABLE interview
  ADD CONSTRAINT ck_interview_cap CHECK (
    (billing_mode = 'per_session' AND billing_cap_units IS NULL)
 OR (billing_mode = 'per_topic_capped' AND billing_cap_units > 0 AND billing_rule_version IS NOT NULL));

CREATE TABLE IF NOT EXISTS topic_charge (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  topic_id text NOT NULL,
  answers smallint NOT NULL CHECK (answers >= 0),
  units numeric(12,2) NOT NULL CHECK (units >= 0 AND units <= 3),
  status text NOT NULL CHECK (status IN ('counted','counted_capped','waived')),
  reason text,
  rule_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, interview_id, topic_id),
  CONSTRAINT ck_topic_charge_settled_units CHECK (status = 'counted' OR units = 0)
);

GRANT SELECT, INSERT ON topic_charge TO app_role;
ALTER TABLE topic_charge ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_charge FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_topic_charge_owner ON topic_charge;
CREATE POLICY p_topic_charge_owner ON topic_charge
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
