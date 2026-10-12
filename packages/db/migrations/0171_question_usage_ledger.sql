-- 0171_question_usage_ledger.sql
--
-- billing 战役 P1（BILL1-TOPIC-FIELDS）修法②：question_usage_ledger 消耗归集表（只做成本侧和审计，
-- 不参与默认方案定价；billing-redesign §3.13 积分明细列表数据源之一）。
-- REQUEST：ai-docs/delivery/harness/bill1-topic-fields-REQUEST.md（pre-exec 双审 BOTH PASS + 协调方常设 loop 授权）。
-- 蓝本：billing-redesign README rev1 §6.2（:288-309 SQL 草案为底·列集含相对原稿更正=删 attempt_no/
--   system_retry/replay/billable 四列）；PK(owner_user_id,invocation_key) 沿 0037 :26 同形=崩溃重放天然去重。
-- token 三列守卫（IS NULL OR >= 0）沿 0037 usage 列同形适配（§1.4 现 tip usage 面为基座）。
-- usage_source 四值 CHECK（蓝本草案）与 0174 打标短码映射如实登记：'missing' ↔ 上游 'usage_missing'
--   （REQUEST §1.4：同义·词汇差异非冲突；NULL=供应商真实 usage → 'provider'）。
-- RLS ENABLE+FORCE+owner 策略（0021 :27-32 形制范本）；只授 SELECT,INSERT（蓝本 §6.2 原文——
--   撤 UPDATE，归集表只增不改）。
-- 编号=0171（LANDING-INDEX 第七节定谳 0170-0173 billing 战役自用；本刀占用 0170+0171，
--   0172/0173 留 P3 结算刀·0176 起顺延·勿添重号）。
-- 历史迁移 0001-0175 零字节改 + sql/ 影子面零改（新迁移铁律）——本文件为唯一新迁移之一。

CREATE TABLE IF NOT EXISTS question_usage_ledger (
  owner_user_id text NOT NULL,
  invocation_key text NOT NULL,
  interview_id text NOT NULL,
  question_id text,
  topic_id text,
  operation_id text NOT NULL,
  cause text NOT NULL CHECK (cause IN ('system_ask','system_score','system_plan','retrieval','report',
                                       'generation_failed','unknown','admission_rejected','user_answer')),
  answer_len integer CHECK (answer_len IS NULL OR answer_len >= 0),
  meter_version text,
  input_tokens integer CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens integer CHECK (output_tokens IS NULL OR output_tokens >= 0),
  estimate_input_tokens integer CHECK (estimate_input_tokens IS NULL OR estimate_input_tokens >= 0),
  usage_source text NOT NULL CHECK (usage_source IN ('provider','estimate','missing','not_applicable')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, invocation_key)
);

GRANT SELECT, INSERT ON question_usage_ledger TO app_role;
ALTER TABLE question_usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_usage_ledger FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_question_usage_ledger_owner ON question_usage_ledger;
CREATE POLICY p_question_usage_ledger_owner ON question_usage_ledger
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
