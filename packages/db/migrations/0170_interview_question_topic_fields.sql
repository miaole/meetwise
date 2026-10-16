-- 0170_interview_question_topic_fields.sql
--
-- billing 战役 P1（BILL1-TOPIC-FIELDS）修法①：interview_question 补话题维度三列（纯加列 expand-only）。
-- REQUEST：ai-docs/delivery/harness/bill1-topic-fields-REQUEST.md（pre-exec 双审 BOTH PASS + 协调方常设 loop 授权）。
-- 蓝本：ai-docs/delivery/billing-redesign/README.md rev1 §6.1（:276-286 SQL 草案逐字为底）。
-- 编号=0170（LANDING-INDEX 第七节定谳 0170-0173 billing 战役自用；0174=刀 B 已并主线、0175=刀 C 已并
--   主线；本刀并线重 pin 时全树 0170/0171 零占双席亲证）。
-- 列语义（蓝本 §6.1 原文）：
--   topic_id：主问题（pivot）填自己的 question_id；追问（probe）和澄清（clarify）填主问题的 id。
--     旧行为空 = 不按话题计费（零回填，语义保留）。
--   ask_mode：来自决策 mode（domain adaptive-interview NextAction ask.mode 'probe'|'pivot'）或澄清分支 'clarify'。
--   clarify_cause：区分「用户答非所问」（non_answer）与「引文核验失败」（quote_unverifiable）——
--     assess 返回显式 cause 字段透传（纯附加，relevant/score/evidence/dispositions 既有值逐位不变）。
-- CHECK 形制沿 0174 对既有表加列的命名约束先例（DROP IF EXISTS + ADD CONSTRAINT·幂等重放零 diff）。
-- 索引=REQUEST §8 裁决项①按推荐行使：列序沿蓝本草案 (owner,interview,topic) + partial
--   WHERE topic_id IS NOT NULL——旧行为空不入索引，逐话题聚合/明细查询面覆盖。
-- 历史迁移 0001-0175 零字节改 + sql/ 影子面零改（新迁移铁律）——本文件为唯一新迁移之一。

ALTER TABLE interview_question ADD COLUMN IF NOT EXISTS topic_id text;
ALTER TABLE interview_question ADD COLUMN IF NOT EXISTS ask_mode text;
ALTER TABLE interview_question ADD COLUMN IF NOT EXISTS clarify_cause text;

ALTER TABLE interview_question DROP CONSTRAINT IF EXISTS ck_interview_question_ask_mode;
ALTER TABLE interview_question
  ADD CONSTRAINT ck_interview_question_ask_mode
  CHECK (ask_mode IS NULL OR ask_mode IN ('pivot','probe','clarify'));

ALTER TABLE interview_question DROP CONSTRAINT IF EXISTS ck_interview_question_clarify_cause;
ALTER TABLE interview_question
  ADD CONSTRAINT ck_interview_question_clarify_cause
  CHECK (clarify_cause IS NULL OR clarify_cause IN ('non_answer','quote_unverifiable'));

CREATE INDEX IF NOT EXISTS ix_iq_topic
  ON interview_question(owner_user_id, interview_id, topic_id) WHERE topic_id IS NOT NULL;
