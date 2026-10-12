-- 0179_topic_shadow_meter.sql
--
-- billing 战役 P2（BILL2-SHADOW-METER）修法①（REQUEST §8 裁决项①按推荐行使=形 A 独立影子表）：
-- topic_shadow_meter 影子计量表——「只算不扣」（billing-redesign README rev1 §7 上线序③ :411 原文
-- 「影子计量 2 周（只算不扣，看每场话题数分布、计费与成本相关性）」）。
-- REQUEST：ai-docs/delivery/harness/bill2-shadow-meter-REQUEST.md（pre-exec 双审 BOTH PASS + 协调方常设 loop 授权）。
-- 列形=蓝本 §6.3 topic_charge 草案（:310-336）mirror **降结算语义**（REQUEST §1-修法①）：
--   零 units 列、零 commerce/entitlement 列、零触发器（§1-修法③零扣费零积分零结算铁律——
--   0172/0173 结算面留 P3 零触零预写）；status 五值按现行收尾语义照实（REQUEST §1.3）：
--   counted/counted_capped（模拟计分）/waived（出题失败该话题 0 分）/skipped（跳过 0 分）/
--   failed_release（混合 unscored fail+release 现行语义照实——0046 触发器钉死面不做 P3 改写）。
-- 双行 kind：topic 行（逐话题·mirror §6.3 主键三元组 (owner,interview,topic)）+ session 行
--   （场级聚合观测：topics_total/五分类计数/sum_uncapped/cap_value=6/cap_hit + tokens 成本对）。
-- 幂等键 idem_key（topic 行=topic_id·session 行='session'）PK(owner_user_id,interview_id,idem_key)
--   沿 0171 :33 同形=崩溃重放天然去重（ON CONFLICT DO NOTHING 在写入口同形）。
-- 观测列（§1-修法①）：ask_mode/clarify_cause 摘要（DISTINCT 汇总 '+' 连接·源值受 0170 CHECK 约束）
--   + question_count/answers（话题内题数/有效作答数）。
-- meter_version NOT NULL（写入口恒 'shadow-v1'·§0.2-5 预留兑现；0171 meter_version 增量同值兑现·
--   存量 NULL 零回填——本迁移零 UPDATE 零回填语句）。
-- RLS ENABLE+FORCE+owner 策略（0171 :37-42 形制范本逐字）；只授 SELECT,INSERT（影子面只增不改·
--   0171 :36 同形）。
-- 编号=0179（落卷时链 max=0178 实测·0172/0173 留 P3 结算刀零触·0176 缺号已由主线
--   qbank-control-sec 补齐=REQUEST §0.2-4 勘误如实登记·0179 为链上首个空号）。
-- 历史迁移 0001-0178 零字节改 + sql/ 影子面零改（新迁移铁律）——本文件为本刀唯一新迁移。

CREATE TABLE IF NOT EXISTS topic_shadow_meter (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  row_kind text NOT NULL CHECK (row_kind IN ('topic','session')),
  topic_id text,
  idem_key text NOT NULL,
  answers smallint CHECK (answers IS NULL OR answers >= 0),
  question_count integer CHECK (question_count IS NULL OR question_count >= 0),
  ask_mode text,
  clarify_cause text,
  status text CHECK (status IS NULL OR status IN ('counted','counted_capped','waived','skipped','failed_release')),
  reason text,
  topics_total integer NOT NULL DEFAULT 0 CHECK (topics_total >= 0),
  topics_counted integer NOT NULL DEFAULT 0 CHECK (topics_counted >= 0),
  topics_capped integer NOT NULL DEFAULT 0 CHECK (topics_capped >= 0),
  topics_waived integer NOT NULL DEFAULT 0 CHECK (topics_waived >= 0),
  topics_skipped integer NOT NULL DEFAULT 0 CHECK (topics_skipped >= 0),
  topics_failed_release integer NOT NULL DEFAULT 0 CHECK (topics_failed_release >= 0),
  sum_uncapped integer NOT NULL DEFAULT 0 CHECK (sum_uncapped >= 0),
  cap_value integer NOT NULL DEFAULT 6 CHECK (cap_value > 0),
  cap_hit boolean NOT NULL DEFAULT false,
  input_tokens_sum bigint NOT NULL DEFAULT 0 CHECK (input_tokens_sum >= 0),
  output_tokens_sum bigint NOT NULL DEFAULT 0 CHECK (output_tokens_sum >= 0),
  meter_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, interview_id, idem_key),
  CONSTRAINT ck_tsm_topic_id_pair CHECK ((topic_id IS NULL) = (row_kind = 'session')),
  CONSTRAINT ck_tsm_topic_identity CHECK (row_kind = 'session' OR (topic_id IS NOT NULL AND topic_id = idem_key)),
  CONSTRAINT ck_tsm_topic_status_present CHECK (row_kind = 'session' OR status IS NOT NULL),
  CONSTRAINT ck_tsm_kind_columns CHECK (row_kind = 'topic' OR (answers IS NULL AND question_count IS NULL
    AND ask_mode IS NULL AND clarify_cause IS NULL AND reason IS NULL)),
  CONSTRAINT ck_tsm_session_conservation CHECK (row_kind <> 'session' OR topics_total =
    topics_counted + topics_capped + topics_waived + topics_skipped + topics_failed_release)
);

GRANT SELECT, INSERT ON topic_shadow_meter TO app_role;
ALTER TABLE topic_shadow_meter ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_shadow_meter FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_topic_shadow_meter_owner ON topic_shadow_meter;
CREATE POLICY p_topic_shadow_meter_owner ON topic_shadow_meter
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
