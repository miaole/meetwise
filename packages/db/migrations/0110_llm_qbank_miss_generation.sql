-- 0110_llm_qbank_miss_generation.sql
--
-- RAG-FUNNEL-05 / LLM 同桶生成题：当 eligibility reader（RAG-04）对某已冻结 leaf 的终态是
-- `no_eligible_in_scope`（干净无合格题）时，由 LLM 在**同一 leaf** 生成**恰好一题**；绝不伪装成
-- QBank 证据、绝不写回 QBank/vector、绝不被评分/B 端聚合。
--
-- 本迁移只建数据面：immutable `question_plan`（输入快照 + 显式状态机）、`question_plan_event`
-- （事务 outbox + result outbox，承载 durable 生成结果）、`question_issue_provenance`
-- （origin=llm_qbank_miss，仅脱敏 digest，无用户正文/PII），以及
-- `interview_question.review_status` 枚举列（首期 generated fallback 必须 review_required）。
--
-- WHY 显式状态机（planned→dispatched→result_persisted→question_ready；终态 voided /
-- generation_unavailable），而不是布尔汤：
--  * dispatched 是「模型外发前的持久 claim」（对齐 RAG-03 job_semantic_revision.model_prepared
--    与 RAG-04 RetrievalPlan.dispatched）：CAS planned→dispatched 的唯一赢家才调模型，重放/并发
--    读取同一 outcome，绝不二次外发（E1/E2）。
--  * result_persisted 是「模型已成功、结果已 durable」的中间态（对齐 spec E4「result outbox +
--    exact-once projection」）：投影事务（interview_question + question_ready + provenance）失败
--    时，恢复读 durable 结果重投影，绝不重新生成不同题。
--  * voided / generation_unavailable 是 sticky 终态（E2 陈旧 plan 作废 / E5 已知失败不可用），
--    永不自动重试。
--
-- WHY 不建 SECURITY DEFINER 函数（对齐 0104/0106）：状态转移全部在
-- packages/db/src/qbank-miss.ts 的 asPrincipal 事务内以 CAS UPDATE 表达，不引入新的
-- SECURITY DEFINER 对象，principal.ts 的 sealed manifest 与 handoff-closure proof 保持不动。
--
-- WHY rubric_id 用 FK 而不单独查「是否 published」：question_rubric.status 在 0100 里是
-- CHECK (status='published') 的单一可达态（无 draft 列），FK 引用完整性 = 结构上保证
-- 「绑定的 rubric 必存在」，伪造 rubric_id → INSERT 直接 FK 违例拒绝（E3）。生成题**不**建
-- issued_question_contract（评分事实根不写），故 E6「无已批准 rubric/origin/score policy 的题
-- 不被评分/报告/B 端聚合」由「RAG-05 不触碰 SCOR-01 写路径 + review_status=review_required」承重。
--
-- 迁移号决议：任务预分配 0110。写前 tail-1 实测为 0108（非约定的 0109），因 SCOR-03（迁移 0109）
-- 当时正由并发 agent 构建中，故保留 0110 不抢占 0109，避免 duplicate-version 撞号（文件互覆不可恢复）。
-- 现 0109（SCOR-03）已落盘，manifest 恢复 0108→0109→0110 连续（见 .tmp/rag-05-pregen-gate.md）。

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- ────────────────────────────────────────────────────────────────────────────
-- 1) question_plan：immutable 输入快照 + 状态机。
--    「immutable」指输入快照列（snapshot/leaf/generation/…/policy 版本）写入后不可变；只有
--    status/updated_at 随状态机迁移。它**不保存** raw job 描述、简历事实、作答或检索正文
--    （结构上无这些列——spec 主流程 ① 的硬约束）。
--    plan_key 是 plan 内容的 canonical digest（principal 作用域幂等键）；同 plan 重放 = noop。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_plan (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  snapshot_id text NOT NULL,
  route_scope_digest text NOT NULL CHECK (route_scope_digest ~ '^[0-9a-f]{64}$'),
  leaf_track_id text NOT NULL CHECK (leaf_track_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  competency_id text NOT NULL CHECK (char_length(competency_id) BETWEEN 1 AND 64),
  difficulty integer NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  generation_id text NOT NULL CHECK (generation_id ~ '^qgen-[0-9a-f-]{36}$'),
  recipe_id text NOT NULL CHECK (recipe_id ~ '^qrecipe-[0-9a-f]{32}$'),
  no_eligible_verdict_digest text NOT NULL CHECK (no_eligible_verdict_digest ~ '^[0-9a-f]{64}$'),
  -- 已批准题面蓝图（focus + 可选 templateId）；只含已批准 shape，绝无用户正文。模型不得新建 track/rubric。
  question_blueprint jsonb NOT NULL CHECK (jsonb_typeof(question_blueprint) = 'object'),
  -- 绑定既有已发布 rubric（FK 兜底存在性；模型无写路径）。
  rubric_id uuid NOT NULL,
  score_policy_version text NOT NULL CHECK (char_length(score_policy_version) BETWEEN 1 AND 64),
  prompt_policy_version text NOT NULL CHECK (char_length(prompt_policy_version) BETWEEN 1 AND 64),
  schema_policy_version text NOT NULL CHECK (char_length(schema_policy_version) BETWEEN 1 AND 64),
  model_policy_version text NOT NULL CHECK (char_length(model_policy_version) BETWEEN 1 AND 64),
  -- privacy epoch fence（E2：删除/重发使 epoch 漂移 → 旧 plan void，模型=0）。0 = 无 resume 面试。
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 0),
  plan_key text NOT NULL CHECK (plan_key ~ '^[0-9a-f]{64}$'),
  status text NOT NULL CHECK (status IN ('planned','dispatched','result_persisted','question_ready','voided','generation_unavailable')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (owner_user_id, plan_key),
  FOREIGN KEY (snapshot_id) REFERENCES interview_route_snapshot(interview_id),
  FOREIGN KEY (rubric_id) REFERENCES question_rubric(id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2) question_plan_event：单 owner 单调事务 outbox + result outbox。
--    (owner_user_id, event_seq) 单调；event_seq 在同一事务内分配（对齐 0104/0106）。
--    `result` 列承载 result_persisted 转移时的 durable 生成结果（result outbox）：恢复据此
--    重投影而绝不重新生成（E4 exact-once）。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_plan_event (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  event_seq bigint NOT NULL CHECK (event_seq > 0),
  plan_id text NOT NULL,
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('planned','dispatched','result_persisted','question_ready','voided','generation_unavailable')),
  reason text,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, event_seq)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3) question_issue_provenance：生成题的精确 origin（llm_qbank_miss），仅脱敏 digest。
--    绝无用户正文/PII/raw prompt；候选 API/SSE 也不返回此表（RLS owner 隔离）。
--    UNIQUE(owner, interview, question) = 一题一 provenance，投影幂等（ON CONFLICT DO NOTHING）。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_issue_provenance (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  interview_id text NOT NULL,
  question_id text NOT NULL,
  origin text NOT NULL CHECK (origin = 'llm_qbank_miss'),
  plan_id text NOT NULL,
  leaf_track_id text NOT NULL CHECK (leaf_track_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  generation_id text NOT NULL,
  recipe_id text NOT NULL,
  competency_id text NOT NULL,
  difficulty integer NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  no_eligible_verdict_digest text NOT NULL CHECK (no_eligible_verdict_digest ~ '^[0-9a-f]{64}$'),
  question_digest text NOT NULL CHECK (question_digest ~ '^[0-9a-f]{64}$'),
  rubric_id uuid NOT NULL,
  score_policy_version text NOT NULL,
  prompt_policy_version text NOT NULL,
  schema_policy_version text NOT NULL,
  model_policy_version text NOT NULL,
  model_attempt integer NOT NULL CHECK (model_attempt = 1),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (owner_user_id, interview_id, question_id),
  FOREIGN KEY (plan_id) REFERENCES question_plan(id),
  FOREIGN KEY (rubric_id) REFERENCES question_rubric(id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4) interview_question.review_status：显式 enum（非布尔汤）。首期 generated fallback 必须
--    review_required ⇒ score_excluded（不进入 B 端 overall/rank/offer/completion 门）。
--    'none' 是既有行的默认（DEFAULT），绝不回填历史语义。
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE interview_question
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'none' CHECK (review_status IN ('none','review_required'));

-- ────────────────────────────────────────────────────────────────────────────
-- 5) Grants + RLS。三张新表全部 candidate-owned；app_role 只获 principal 作用域读写
--    （question_plan 需 UPDATE 走 CAS；event/provenance 只 INSERT，append-only）。无 role 提升写路径。
-- ────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON question_plan FROM PUBLIC;
REVOKE ALL ON question_plan_event FROM PUBLIC;
REVOKE ALL ON question_issue_provenance FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON question_plan TO app_role;
GRANT SELECT, INSERT ON question_plan_event TO app_role;
GRANT SELECT, INSERT ON question_issue_provenance TO app_role;

ALTER TABLE question_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_plan FORCE ROW LEVEL SECURITY;
ALTER TABLE question_plan_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_plan_event FORCE ROW LEVEL SECURITY;
ALTER TABLE question_issue_provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_issue_provenance FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_question_plan_owner ON question_plan;
CREATE POLICY p_question_plan_owner ON question_plan
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_question_plan_event_owner ON question_plan_event;
CREATE POLICY p_question_plan_event_owner ON question_plan_event
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_question_issue_provenance_owner ON question_issue_provenance;
CREATE POLICY p_question_issue_provenance_owner ON question_issue_provenance
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
