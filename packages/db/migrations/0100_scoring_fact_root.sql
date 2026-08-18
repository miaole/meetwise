-- 0100_scoring_fact_root.sql
--
-- SCOR-01：版本化 rubric 与两阶段评分事实根（评分测量的事实根，不是评分算法）。
--
-- 这是「评分测量」的承重数据面：版本化 QuestionRubric、issue 阶段 IssuedQuestionContract、
-- submission 阶段 ScoreRequest(AnswerVersion)、append-only ScoreCard，以及显式状态机
-- （禁布尔汤）。本迁移只建事实根 + 状态机 + 幂等 + 并发 + RLS，**不接任何生产写路径、
-- 不做确定性聚合、不调模型**（SCOR-02 的 score-writer / 消费迁移；SCOR-03 的证据/冲突/
-- uncertainty 语义；SCOR-04 的成本路由均不在此）。
--
-- 铁律（对齐 CLAUDE.md + interview-scoring-measurement.md）：
--   1. 发题时答案尚不存在 → IssuedQuestionContract 只冻题不冻答案；schema 层**不建**任何
--      answer_id/answer_hash/answer_version 列（铁律，不是靠触发器补）。submission 阶段
--      ScoreRequest 才以 canonical artifact + body HMAC + submission receipt 绑答案。
--   2. 两阶段与 ScoreCard 在**写卡事务**内受控绑定：写卡只校验 issue 的 question identity
--      + rubric + policy/cohort + epoch，submission 以 artifact + permit(lease_token) 绑答案。
--   3. 删除授权**复用冻结的 0091 issuer + 0096 sink receipt**，不重实现删除根。本域只做
--      「删除/撤权先赢」的 fence 重校验：写卡/claim 前重验 assert_interview_answer_fact_active
--      + assert_interview_privacy_active（同一把 advisory 锁），迟到 provider 结果不得写回。
--   4. 显式状态机（禁布尔汤）：
--      - ScoreRequest：pending→claimed→dispatched→scored；pending|claimed|dispatched→fenced
--        （删除/撤权/答案替换先赢）；scored/fenced 吸收态；claim 只接受 pending（单次 CAS），
--        dispatched 后 unknown 不自动重发。
--      - ScoreCard：pending_evidence→evidence_valid|evidence_invalid→…（见触发器的转移表）；
--        →superseded（更正）与 →fenced（删除）是生命周期转移，从任意非吸收态可达。
--        unscored/review_required/calibration_blocked/evidence_invalid 非 0 分、不参与聚合。
--   5. 四个生产原语：①CAS（version 条件更新，from→to）②principal 作用域幂等键
--      （UNIQUE(owner,idempotency_key) + ON CONFLICT）③RLS owner 隔离（FORCE RLS）④事务内
--      单调 eventSeq（写卡同事务向 interview_event 原子追加 score_card_written）。
--   6. 每个 ScoreRequest 至多一张终态卡：partial unique index
--      (score_request_id) WHERE status NOT IN ('superseded','fenced') 在 schema 层兜底。

-- ── 角色（NOLOGIN；与 privacy_worker_owner/executor 同构）──────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='scoring_definer_owner') THEN
    CREATE ROLE scoring_definer_owner NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='scoring_worker_executor') THEN
    CREATE ROLE scoring_worker_executor NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
-- schema 访问（public 的 USAGE 默认授 PUBLIC，此处显式补齐以对齐 0048/0091 的既定模式，幂等）。
GRANT USAGE ON SCHEMA public TO scoring_definer_owner, scoring_worker_executor;

-- ── ① QuestionRubric：版本化、发布后不可原地改写（append-only）─────────────────────
-- 题目、question_version、rubric_version、难度、语言适用范围、能力一起冻结。
-- 新版本以 supersedes_rubric_id 指向前版本（解析取 max(rubric_version)）；禁 UPDATE/DELETE。
-- rubric 是全局内容（非 owner 作用域），不启用 RLS；写只经下方 SECURITY DEFINER 函数。
CREATE TABLE IF NOT EXISTS question_rubric (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL CHECK (length(question_id) BETWEEN 1 AND 128),
  question_version bigint NOT NULL CHECK (question_version >= 1),
  rubric_version bigint NOT NULL CHECK (rubric_version >= 1),
  competency text NOT NULL CHECK (length(competency) BETWEEN 1 AND 128),
  -- 难度沿用既有 1..5 标度（qbank-ingest/adaptive-interview 同源），与版本一起冻结。
  difficulty smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  -- 语言适用范围（BCP-47 标签数组，如 ["zh","en"]）；issue 阶段校验 language ∈ scope。
  language_scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- 题目内容 hash（sha256 hex，64 位）。用于 issue 阶段核对「冻结的题面」未漂移。
  question_content_hash text NOT NULL CHECK (question_content_hash ~ '^[a-f0-9]{64}$'),
  -- 前版本指针（纯 provenance，append-only）；新版本以 max(rubric_version) 为当前。
  supersedes_rubric_id uuid NULL REFERENCES question_rubric(id) ON DELETE RESTRICT,
  -- 唯一可达态 published（draft/curation 流不在 SCOR-01 事实根；发布即不可变）。
  status text NOT NULL DEFAULT 'published' CHECK (status = 'published'),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, question_version, rubric_version)
);

-- rubric 的分项：criterionId + 权重 + 行为锚点 + 上限规则，随 rubric 一起冻结。
CREATE TABLE IF NOT EXISTS question_rubric_criterion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id uuid NOT NULL REFERENCES question_rubric(id) ON DELETE RESTRICT,
  criterion_id text NOT NULL CHECK (length(criterion_id) BETWEEN 1 AND 128),
  weight numeric NOT NULL CHECK (weight > 0),
  -- 行为锚点（分档→锚点描述，如 [{"band":"below","anchor":"..."}]），冻结。
  behavior_anchors jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- 上限规则（硬上限/上限档，如 {"maxScore":10,"cap":"meets"}），冻结。
  cap_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rubric_id, criterion_id)
);

-- ── ② IssuedQuestionContract：issue 阶段（发题时冻结，绝不含答案身份）───────────────
CREATE TABLE IF NOT EXISTS issued_question_contract (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_id text NOT NULL,
  state_version bigint NOT NULL CHECK (state_version >= 0),
  turn integer NOT NULL CHECK (turn >= 0),
  -- 发题时冻结的题面 hash；submission 阶段据此核对答案所属题目未漂移。
  question_content_hash text NOT NULL CHECK (question_content_hash ~ '^[a-f0-9]{64}$'),
  -- 冻结的已发布 rubric（rubric_id 同时钉住 criterion 集 + competency + language_scope）。
  rubric_id uuid NOT NULL REFERENCES question_rubric(id) ON DELETE RESTRICT,
  -- 难度从 rubric 冻结（发题后 rubric 若出新版本，本行难度不变）。
  difficulty smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  form text NOT NULL CHECK (length(form) BETWEEN 1 AND 64),
  language text NOT NULL CHECK (language ~ '^[a-z]{2}(-[A-Za-z0-9]+)?$'),
  route text NOT NULL CHECK (length(route) BETWEEN 1 AND 128),
  prompt_policy_version text NOT NULL CHECK (length(prompt_policy_version) BETWEEN 1 AND 64),
  measurement_version text NOT NULL CHECK (length(measurement_version) BETWEEN 1 AND 64),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  -- 契约发布后不可原地改写；删除/撤权由 fence 重校验表达，不改本行。
  status text NOT NULL DEFAULT 'issued' CHECK (status = 'issued'),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- 事实身份（interview-scoring-measurement.md §4）：(owner, interview, questionId,
  -- stateVersion, rubricVersion, measurementVersion)。
  UNIQUE (owner_user_id, interview_id, question_id, state_version, rubric_id, measurement_version)
);

GRANT CREATE ON SCHEMA public TO scoring_definer_owner;
ALTER TABLE issued_question_contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_question_contract FORCE ROW LEVEL SECURITY;

-- ── ③ ScoreRequest（submission 阶段：AnswerVersion/ScoreRequest）───────────────────
CREATE TABLE IF NOT EXISTS score_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  -- 绑定 issue 阶段契约（question identity + rubric + measurement + epoch）。
  issued_contract_id uuid NOT NULL REFERENCES issued_question_contract(id) ON DELETE RESTRICT,
  -- 绑定 canonical answer artifact（0092）：submission receipt + artifact ref + body HMAC。
  submission_id uuid NOT NULL REFERENCES interview_answer_submission(id) ON DELETE RESTRICT,
  artifact_id uuid NOT NULL REFERENCES interview_answer_artifact(id) ON DELETE RESTRICT,
  -- AnswerVersion：同一 issued contract 的答案版本号（答案替换 = 版本 +1，旧 request fenced）。
  answer_version bigint NOT NULL DEFAULT 1 CHECK (answer_version >= 1),
  -- 冻结的答案指纹（HMAC，非裸 sha256，与 0092 body_hmac 一致）；写卡时重验。
  answer_body_hmac text NOT NULL CHECK (answer_body_hmac ~ '^[a-f0-9]{64}$'),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 1),
  operation_policy_version text NOT NULL CHECK (length(operation_policy_version) BETWEEN 1 AND 64),
  -- principal 作用域幂等键：同 owner + 同 key 重放回既有 request（同键异体冲突）。
  idempotency_key text NOT NULL CHECK (length(idempotency_key) BETWEEN 1 AND 128),
  -- permit/fence 状态机（显式 enum，禁布尔汤）。
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','claimed','dispatched','scored','fenced')),
  -- permit：claim 时签发（bearer，单次）；写卡/派发必须回验 token。
  lease_owner text,
  lease_token uuid,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, idempotency_key),
  -- 同一 (contract, answer_version) 至多一个 request（不同幂等键重复创建被拒）。
  UNIQUE (issued_contract_id, answer_version)
);
ALTER TABLE score_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_request FORCE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS score_request_owner_interview_idx ON score_request (owner_user_id, interview_id);

-- ── ④ ScoreCard：append-only（更正以 supersedes 链，不覆盖历史）────────────────────
CREATE TABLE IF NOT EXISTS score_card (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_id text NOT NULL,
  -- 答案身份：canonical artifact + submission receipt（都冻结）。
  answer_id uuid NOT NULL REFERENCES interview_answer_artifact(id) ON DELETE RESTRICT,
  submission_id uuid NOT NULL REFERENCES interview_answer_submission(id) ON DELETE RESTRICT,
  -- 绑定 ScoreRequest + issued contract + rubric（都冻结）。
  score_request_id uuid NOT NULL REFERENCES score_request(id) ON DELETE RESTRICT,
  issued_contract_id uuid NOT NULL REFERENCES issued_question_contract(id) ON DELETE RESTRICT,
  rubric_id uuid NOT NULL REFERENCES question_rubric(id) ON DELETE RESTRICT,
  rubric_version bigint NOT NULL CHECK (rubric_version >= 1),
  measurement_version text NOT NULL CHECK (length(measurement_version) BETWEEN 1 AND 64),
  -- 确定性总分（SCOR-01 只落不算；SCOR-02 的 verifier/formula 计算）。范围在函数内校验。
  deterministic_total numeric NOT NULL CHECK (deterministic_total >= 0),
  -- coverage（0..1，证据覆盖；SCOR-03 填充语义，本域只落）。
  coverage numeric NOT NULL CHECK (coverage BETWEEN 0 AND 1),
  -- uncertainty（独立多来源字段；SCOR-03 填充语义，本域只落不解释）。
  uncertainty jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- 显式状态机（禁布尔汤）。
  status text NOT NULL DEFAULT 'pending_evidence' CHECK (status IN (
    'pending_evidence','evidence_valid','evidence_invalid','unscored','practice_eligible',
    'review_required','calibration_blocked','b_review_eligible','superseded','fenced')),
  -- provenance（谁/哪版 prompt/哪版 policy 产生；绝无用户正文，无 PII）。
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- 更正链：新卡指旧卡；旧卡状态转 superseded（内容永不覆盖）。
  supersedes_card_id uuid NULL REFERENCES score_card(id) ON DELETE RESTRICT,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE score_card ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_card FORCE ROW LEVEL SECURITY;
-- 每 request 至多一张终态（非 superseded/fenced）卡——schema 层兜底（承重）。
CREATE UNIQUE INDEX score_card_one_terminal_per_request
  ON score_card (score_request_id) WHERE status NOT IN ('superseded','fenced');
CREATE INDEX IF NOT EXISTS score_card_owner_interview_idx ON score_card (owner_user_id, interview_id);

-- 分项分：criterionId + disposition（有限档位）+ score + weight（从 rubric 冻结）。
CREATE TABLE IF NOT EXISTS score_card_criterion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  card_id uuid NOT NULL REFERENCES score_card(id) ON DELETE RESTRICT,
  criterion_id text NOT NULL CHECK (length(criterion_id) BETWEEN 1 AND 128),
  -- 有限档位判定（rubric 定义档；如 below/meets/exceeds）。SCOR-03 补 span/digest。
  disposition text NOT NULL CHECK (length(disposition) BETWEEN 1 AND 64),
  score numeric NOT NULL CHECK (score >= 0),
  weight numeric NOT NULL CHECK (weight > 0),
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (card_id, criterion_id)
);
ALTER TABLE score_card_criterion ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_card_criterion FORCE ROW LEVEL SECURITY;

-- ── 表级 grants（原始表访问权不落到 app_role/PUBLIC/scoring_worker_executor）────────
REVOKE ALL ON question_rubric, question_rubric_criterion FROM PUBLIC;
REVOKE ALL ON issued_question_contract, score_request, score_card, score_card_criterion FROM PUBLIC;
-- rubric 是全局内容：写只经 DEFINER 函数；definer 读 rubric 以在 issue/写卡时冻结难度/成员。
GRANT SELECT, INSERT ON question_rubric, question_rubric_criterion TO scoring_definer_owner;
-- 评分事实表：definer 全权（SELECT/INSERT/UPDATE 供 FOR UPDATE 行锁与 CAS）。
GRANT SELECT, INSERT, UPDATE ON issued_question_contract, score_request, score_card TO scoring_definer_owner;
GRANT SELECT, INSERT ON score_card_criterion TO scoring_definer_owner;
-- app_role（API 服务主体）只读评分结果：SELECT 走 owner 作用域 RLS（原语③），无写权（INSERT/UPDATE 拒）。
GRANT SELECT ON issued_question_contract, score_request, score_card, score_card_criterion TO app_role;
-- 绑定 canonical answer artifact 的只读授权（不删他人策略，只加 scoring 角色 SELECT）。
GRANT SELECT ON interview_answer_submission, interview_answer_artifact, interview_answer_job TO scoring_definer_owner;
-- 写卡同事务原子发事件（原语④）：definer 需 INSERT + SELECT（MAX(seq) 子查询）。
GRANT INSERT, SELECT ON interview_event TO scoring_definer_owner;
-- interview_event.id 是 bigserial：INSERT 的 nextval 需要 sequence USAGE（SELECT 供 currval/lastval）。
GRANT USAGE, SELECT ON SEQUENCE interview_event_id_seq TO scoring_definer_owner;
-- issue 阶段须核面试归属：scoring_definer_owner 只读 interview（RLS 走 0001 的 p_owner，PUBLIC 谓词）。
GRANT SELECT ON interview TO scoring_definer_owner;
-- 复用冻结删除 fence 断言（0092/0058 的 SECURITY DEFINER，EXECUTE 原仅授 app_role；本域只加 scoring 角色）。
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO scoring_definer_owner;
GRANT EXECUTE ON FUNCTION assert_interview_answer_fact_active(text) TO scoring_definer_owner;

-- ── RLS policies（owner 隔离；definer 角色经 FORCE RLS 也必须走 principal 作用域）────
DROP POLICY IF EXISTS issued_question_contract_scoring_definer ON issued_question_contract;
CREATE POLICY issued_question_contract_scoring_definer ON issued_question_contract
  FOR ALL TO scoring_definer_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS score_request_scoring_definer ON score_request;
CREATE POLICY score_request_scoring_definer ON score_request
  FOR ALL TO scoring_definer_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS score_card_scoring_definer ON score_card;
CREATE POLICY score_card_scoring_definer ON score_card
  FOR ALL TO scoring_definer_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS score_card_criterion_scoring_definer ON score_card_criterion;
CREATE POLICY score_card_criterion_scoring_definer ON score_card_criterion
  FOR ALL TO scoring_definer_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- app_role 只读（owner 作用域）策略：API 读评分结果走这里，跨 owner = 0 行。
DROP POLICY IF EXISTS issued_question_contract_app_role ON issued_question_contract;
CREATE POLICY issued_question_contract_app_role ON issued_question_contract
  FOR SELECT TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS score_request_app_role ON score_request;
CREATE POLICY score_request_app_role ON score_request
  FOR SELECT TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS score_card_app_role ON score_card;
CREATE POLICY score_card_app_role ON score_card
  FOR SELECT TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS score_card_criterion_app_role ON score_card_criterion;
CREATE POLICY score_card_criterion_app_role ON score_card_criterion
  FOR SELECT TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true));

-- 只读绑定策略（INT-TRANSCRIPT-00 三表，不删 privacy 既有策略）。
DROP POLICY IF EXISTS interview_answer_submission_scoring_definer ON interview_answer_submission;
CREATE POLICY interview_answer_submission_scoring_definer ON interview_answer_submission
  FOR SELECT TO scoring_definer_owner USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_artifact_scoring_definer ON interview_answer_artifact;
CREATE POLICY interview_answer_artifact_scoring_definer ON interview_answer_artifact
  FOR SELECT TO scoring_definer_owner USING (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS interview_answer_job_scoring_definer ON interview_answer_job;
CREATE POLICY interview_answer_job_scoring_definer ON interview_answer_job
  FOR SELECT TO scoring_definer_owner USING (owner_user_id = current_setting('app.principal_user', true));

-- 事件写策略（写卡同事务；privacy 门槛由 0059 的 BEFORE 触发器 + 本函数先验 fence 承担）。
DROP POLICY IF EXISTS interview_event_scoring_definer ON interview_event;
CREATE POLICY interview_event_scoring_definer ON interview_event
  FOR ALL TO scoring_definer_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

-- ── 不可原地改写（append-only 纵深：BEFORE UPDATE/DELETE 一律拒）────────────────────
CREATE OR REPLACE FUNCTION assert_question_rubric_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'question_rubric_immutable' USING ERRCODE='23514';
END $$;

ALTER FUNCTION assert_question_rubric_immutable() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_question_rubric_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS question_rubric_immutable_guard ON question_rubric;
CREATE TRIGGER question_rubric_immutable_guard
  BEFORE UPDATE OR DELETE ON question_rubric FOR EACH ROW EXECUTE FUNCTION assert_question_rubric_immutable();
DROP TRIGGER IF EXISTS question_rubric_criterion_immutable_guard ON question_rubric_criterion;
CREATE TRIGGER question_rubric_criterion_immutable_guard
  BEFORE UPDATE OR DELETE ON question_rubric_criterion FOR EACH ROW EXECUTE FUNCTION assert_question_rubric_immutable();

CREATE OR REPLACE FUNCTION assert_issued_question_contract_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'issued_question_contract_immutable' USING ERRCODE='23514';
END $$;
ALTER FUNCTION assert_issued_question_contract_immutable() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_issued_question_contract_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS issued_question_contract_immutable_guard ON issued_question_contract;
CREATE TRIGGER issued_question_contract_immutable_guard
  BEFORE UPDATE OR DELETE ON issued_question_contract FOR EACH ROW EXECUTE FUNCTION assert_issued_question_contract_immutable();

CREATE OR REPLACE FUNCTION assert_score_card_criterion_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'score_card_criterion_immutable' USING ERRCODE='23514';
END $$;
ALTER FUNCTION assert_score_card_criterion_immutable() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_score_card_criterion_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS score_card_criterion_immutable_guard ON score_card_criterion;
CREATE TRIGGER score_card_criterion_immutable_guard
  BEFORE UPDATE OR DELETE ON score_card_criterion FOR EACH ROW EXECUTE FUNCTION assert_score_card_criterion_immutable();

-- ScoreRequest：只允许 status/lease/version/updated_at 变，业务内容一律拒改。
CREATE OR REPLACE FUNCTION assert_score_request_content_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'score_request_content_immutable' USING ERRCODE='23514';
END $$;
ALTER FUNCTION assert_score_request_content_immutable() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_score_request_content_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS score_request_content_immutable_guard ON score_request;
CREATE TRIGGER score_request_content_immutable_guard
  BEFORE UPDATE OF owner_user_id, interview_id, issued_contract_id, submission_id, artifact_id,
    answer_version, answer_body_hmac, privacy_epoch, operation_policy_version, idempotency_key, created_at
  ON score_request FOR EACH ROW EXECUTE FUNCTION assert_score_request_content_immutable();

-- ScoreCard：只允许 status/version/updated_at 变，业务内容一律拒改。
CREATE OR REPLACE FUNCTION assert_score_card_content_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'score_card_content_immutable' USING ERRCODE='23514';
END $$;
ALTER FUNCTION assert_score_card_content_immutable() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_score_card_content_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS score_card_content_immutable_guard ON score_card;
CREATE TRIGGER score_card_content_immutable_guard
  BEFORE UPDATE OF owner_user_id, interview_id, question_id, answer_id, submission_id,
    score_request_id, issued_contract_id, rubric_id, rubric_version, measurement_version,
    deterministic_total, coverage, uncertainty, provenance, supersedes_card_id, created_at
  ON score_card FOR EACH ROW EXECUTE FUNCTION assert_score_card_content_immutable();

-- ── ScoreRequest 状态机（单向 guard，服务端重校验；非法转移被拒）────────────────────
CREATE OR REPLACE FUNCTION assert_score_request_status_oneway() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  -- 终态吸收：scored/fenced 不得再迁。
  IF OLD.status IN ('scored','fenced') THEN
    RAISE EXCEPTION 'score_request_status_oneway' USING ERRCODE='23514';
  END IF;
  -- 删除/撤权/答案替换先赢 → fenced（从任何非吸收态）。
  IF NEW.status = 'fenced' AND OLD.status IN ('pending','claimed','dispatched') THEN RETURN NEW; END IF;
  IF OLD.status = 'pending' AND NEW.status = 'claimed' THEN RETURN NEW; END IF;
  IF OLD.status = 'claimed' AND NEW.status = 'dispatched' THEN RETURN NEW; END IF;
  IF OLD.status = 'claimed' AND NEW.status = 'scored' THEN RETURN NEW; END IF;
  IF OLD.status = 'dispatched' AND NEW.status = 'scored' THEN RETURN NEW; END IF;
  RAISE EXCEPTION 'score_request_status_oneway' USING ERRCODE='23514';
END $$;
ALTER FUNCTION assert_score_request_status_oneway() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_score_request_status_oneway() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS score_request_status_oneway_guard ON score_request;
CREATE TRIGGER score_request_status_oneway_guard
  BEFORE UPDATE OF status ON score_request FOR EACH ROW EXECUTE FUNCTION assert_score_request_status_oneway();

-- ── ScoreCard 状态机（审计转移表；非法转移被拒；生命周期 →superseded/fenced 从非吸收态）─
CREATE OR REPLACE FUNCTION assert_score_card_status_transition() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  -- 吸收态：superseded/fenced 不得再迁。
  IF OLD.status IN ('superseded','fenced') THEN
    RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514';
  END IF;
  -- 生命周期转移（更正/删除）从任意非吸收态可达。
  IF NEW.status IN ('superseded','fenced') THEN RETURN NEW; END IF;
  -- 证据流转移表（interview-scoring-measurement.md §3 状态机）。
  CASE OLD.status
    WHEN 'pending_evidence' THEN
      IF NEW.status NOT IN ('evidence_valid','evidence_invalid') THEN
        RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514'; END IF;
    WHEN 'evidence_valid' THEN
      IF NEW.status NOT IN ('practice_eligible','review_required') THEN
        RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514'; END IF;
    WHEN 'evidence_invalid' THEN
      IF NEW.status <> 'unscored' THEN
        RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514'; END IF;
    WHEN 'practice_eligible' THEN
      IF NEW.status NOT IN ('calibration_blocked','b_review_eligible') THEN
        RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514'; END IF;
    WHEN 'review_required' THEN
      IF NEW.status <> 'b_review_eligible' THEN
        RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514'; END IF;
    ELSE
      -- unscored / calibration_blocked / b_review_eligible 是证据流终态。
      RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514';
  END CASE;
  RETURN NEW;
END $$;
ALTER FUNCTION assert_score_card_status_transition() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_score_card_status_transition() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS score_card_status_transition_guard ON score_card;
CREATE TRIGGER score_card_status_transition_guard
  BEFORE UPDATE OF status ON score_card FOR EACH ROW EXECUTE FUNCTION assert_score_card_status_transition();

-- ── ① publish rubric（DEFINER，EXECUTE 授 app_role 作服务主体）──────────────────────
CREATE OR REPLACE FUNCTION scoring_publish_question_rubric(
  p_question_id text,
  p_question_version bigint,
  p_rubric_version bigint,
  p_competency text,
  p_difficulty smallint,
  p_language_scope jsonb,
  p_question_content_hash text,
  p_supersedes_rubric_id uuid,
  p_criteria jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  v_rubric_id uuid;
  crit record;
  v_seen int;
  v_distinct int;
BEGIN
  IF p_question_id IS NULL OR length(p_question_id)=0 OR p_question_version IS NULL OR p_question_version < 1
     OR p_rubric_version IS NULL OR p_rubric_version < 1 OR p_competency IS NULL OR length(p_competency)=0
     OR p_difficulty IS NULL OR p_difficulty < 1 OR p_difficulty > 5
     OR p_question_content_hash IS NULL OR p_question_content_hash !~ '^[a-f0-9]{64}$'
     OR p_criteria IS NULL OR jsonb_typeof(p_criteria) <> 'array' THEN
    RAISE EXCEPTION 'scoring_rubric_invalid' USING ERRCODE='22023';
  END IF;

  -- 分项非空 + criterion_id 唯一 + 权重 > 0（否则 rubric 无有效分项，写卡时无 member 可判）。
  SELECT count(*) INTO v_seen FROM jsonb_array_elements(p_criteria) j;
  SELECT count(DISTINCT (j.value->>'criterionId')) INTO v_distinct FROM jsonb_array_elements(p_criteria) j;
  IF v_seen = 0 OR v_seen <> v_distinct THEN
    RAISE EXCEPTION 'scoring_rubric_criteria_invalid' USING ERRCODE='23514';
  END IF;
  FOR crit IN SELECT j.value->>'criterionId' AS criterion_id,
                     (j.value->>'weight')::numeric AS weight
              FROM jsonb_array_elements(p_criteria) j LOOP
    IF crit.criterion_id IS NULL OR length(crit.criterion_id)=0
       OR crit.weight IS NULL OR crit.weight <= 0 THEN
      RAISE EXCEPTION 'scoring_rubric_criteria_invalid' USING ERRCODE='23514';
    END IF;
  END LOOP;

  -- 幂等（同 (question_id,question_version,rubric_version) 重放返回既有 id，不重复插分项）。
  INSERT INTO question_rubric(question_id, question_version, rubric_version, competency, difficulty,
    language_scope, question_content_hash, supersedes_rubric_id, status)
  VALUES (p_question_id, p_question_version, p_rubric_version, p_competency, p_difficulty,
    COALESCE(p_language_scope, '[]'::jsonb), p_question_content_hash, p_supersedes_rubric_id, 'published')
  ON CONFLICT (question_id, question_version, rubric_version) DO NOTHING
  RETURNING id INTO v_rubric_id;
  IF v_rubric_id IS NULL THEN
    SELECT id INTO v_rubric_id FROM question_rubric
     WHERE question_id=p_question_id AND question_version=p_question_version AND rubric_version=p_rubric_version;
    RETURN v_rubric_id;
  END IF;

  FOR crit IN SELECT j.value->>'criterionId' AS criterion_id,
                     (j.value->>'weight')::numeric AS weight,
                     COALESCE(j.value->'behaviorAnchors', '[]'::jsonb) AS behavior_anchors,
                     COALESCE(j.value->'capRules', '{}'::jsonb) AS cap_rules,
                     COALESCE((j.value->>'position')::integer, 0) AS position
              FROM jsonb_array_elements(p_criteria) j LOOP
    INSERT INTO question_rubric_criterion(rubric_id, criterion_id, weight, behavior_anchors, cap_rules, position)
    VALUES (v_rubric_id, crit.criterion_id, crit.weight, crit.behavior_anchors, crit.cap_rules, crit.position);
  END LOOP;
  RETURN v_rubric_id;
END $$;
ALTER FUNCTION scoring_publish_question_rubric(text,bigint,bigint,text,smallint,jsonb,text,uuid,jsonb) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_publish_question_rubric(text,bigint,bigint,text,smallint,jsonb,text,uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION scoring_publish_question_rubric(text,bigint,bigint,text,smallint,jsonb,text,uuid,jsonb) TO app_role;

-- ── ② issue contract（DEFINER，EXECUTE 授 app_role）────────────────────────────────
CREATE OR REPLACE FUNCTION scoring_issue_question_contract(
  p_interview_id text,
  p_question_id text,
  p_state_version bigint,
  p_turn integer,
  p_question_content_hash text,
  p_rubric_id uuid,
  p_form text,
  p_language text,
  p_route text,
  p_prompt_policy_version text,
  p_measurement_version text,
  p_privacy_epoch bigint
) RETURNS TABLE (contract_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_rubric record;
  v_contract_id uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_interview_id IS NULL OR length(p_interview_id)=0
     OR p_question_id IS NULL OR length(p_question_id)=0 OR p_state_version IS NULL OR p_state_version < 0
     OR p_turn IS NULL OR p_turn < 0 OR p_question_content_hash IS NULL OR p_question_content_hash !~ '^[a-f0-9]{64}$'
     OR p_form IS NULL OR length(p_form)=0 OR p_language IS NULL OR p_language !~ '^[a-z]{2}(-[A-Za-z0-9]+)?$'
     OR p_route IS NULL OR length(p_route)=0 OR p_prompt_policy_version IS NULL OR length(p_prompt_policy_version)=0
     OR p_measurement_version IS NULL OR length(p_measurement_version)=0
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1 THEN
    RAISE EXCEPTION 'scoring_issue_contract_invalid' USING ERRCODE='22023';
  END IF;

  -- 面试存在 + owner = principal（发题者只能给自家面试发题）。
  PERFORM 1 FROM interview i WHERE i.id=p_interview_id AND i.owner_user_id=principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'scoring_issue_contract_forbidden' USING ERRCODE='42501';
  END IF;

  -- rubric 必须已发布 + 语言在适用范围（rubric 的 language_scope 门）。
  SELECT r.id, r.difficulty, r.language_scope INTO v_rubric FROM question_rubric r WHERE r.id=p_rubric_id AND r.status='published';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'scoring_issue_rubric_not_published' USING ERRCODE='42501';
  END IF;
  IF p_language IS NOT NULL AND jsonb_typeof(v_rubric.language_scope)='array'
     AND NOT (v_rubric.language_scope @> to_jsonb(p_language)) THEN
    RAISE EXCEPTION 'scoring_issue_language_out_of_scope' USING ERRCODE='23514';
  END IF;

  INSERT INTO issued_question_contract(owner_user_id, interview_id, question_id, state_version, turn,
    question_content_hash, rubric_id, difficulty, form, language, route, prompt_policy_version,
    measurement_version, privacy_epoch, status)
  VALUES (principal, p_interview_id, p_question_id, p_state_version, p_turn,
    p_question_content_hash, p_rubric_id, v_rubric.difficulty, p_form, p_language, p_route,
    p_prompt_policy_version, p_measurement_version, p_privacy_epoch, 'issued')
  ON CONFLICT (owner_user_id, interview_id, question_id, state_version, rubric_id, measurement_version)
  DO NOTHING
  RETURNING id INTO v_contract_id;
  IF v_contract_id IS NULL THEN
    SELECT id INTO v_contract_id FROM issued_question_contract
     WHERE owner_user_id=principal AND interview_id=p_interview_id AND question_id=p_question_id
       AND state_version=p_state_version AND rubric_id=p_rubric_id AND measurement_version=p_measurement_version;
    RETURN QUERY SELECT v_contract_id, true;
    RETURN;
  END IF;
  RETURN QUERY SELECT v_contract_id, false;
END $$;
ALTER FUNCTION scoring_issue_question_contract(text,text,bigint,integer,text,uuid,text,text,text,text,text,bigint) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_issue_question_contract(text,text,bigint,integer,text,uuid,text,text,text,text,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION scoring_issue_question_contract(text,text,bigint,integer,text,uuid,text,text,text,text,text,bigint) TO app_role;

-- ── ③ create ScoreRequest（submission 阶段；EXECUTE 授 app_role）───────────────────
CREATE OR REPLACE FUNCTION scoring_create_score_request(
  p_issued_contract_id uuid,
  p_submission_id uuid,
  p_artifact_id uuid,
  p_answer_body_hmac text,
  p_privacy_epoch bigint,
  p_operation_policy_version text,
  p_answer_version bigint,
  p_idempotency_key text
) RETURNS TABLE (request_id uuid, answer_version bigint, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_contract record;
  v_submission record;
  v_artifact record;
  v_request_id uuid;
  v_existing record;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_issued_contract_id IS NULL
     OR p_submission_id IS NULL OR p_artifact_id IS NULL
     OR p_answer_body_hmac IS NULL OR p_answer_body_hmac !~ '^[a-f0-9]{64}$'
     OR p_privacy_epoch IS NULL OR p_privacy_epoch < 1
     OR p_operation_policy_version IS NULL OR length(p_operation_policy_version)=0
     OR p_answer_version IS NULL OR p_answer_version < 1
     OR p_idempotency_key IS NULL OR length(p_idempotency_key)=0 THEN
    RAISE EXCEPTION 'scoring_score_request_invalid' USING ERRCODE='22023';
  END IF;

  -- 绑定 issue 契约（FOR UPDATE 行锁，防同请求并发）；owner 必须等于 principal。
  SELECT id, owner_user_id, interview_id, question_id, state_version, privacy_epoch
    INTO v_contract FROM issued_question_contract WHERE id=p_issued_contract_id FOR UPDATE;
  IF NOT FOUND OR v_contract.owner_user_id <> principal THEN
    RAISE EXCEPTION 'scoring_score_request_contract_forbidden' USING ERRCODE='42501';
  END IF;

  -- epoch fence：submission 的 epoch 必须等于契约冻结的 epoch（删除/重发即漂移）。
  IF p_privacy_epoch <> v_contract.privacy_epoch THEN
    RAISE EXCEPTION 'scoring_score_request_epoch_mismatch' USING ERRCODE='23514';
  END IF;

  -- 删除 fence 重校验（同一把 advisory 锁；删除已先赢则此处抛错，绝不绑已删答案）。
  PERFORM assert_interview_answer_fact_active(v_contract.interview_id);
  PERFORM assert_interview_privacy_active(v_contract.interview_id);

  -- 绑定 canonical submission receipt（owner/interview/question/state 一致 + 未被 fence）。
  SELECT id, owner_user_id, interview_id, question_id, state_version, status
    INTO v_submission FROM interview_answer_submission WHERE id=p_submission_id;
  IF NOT FOUND OR v_submission.owner_user_id <> principal
     OR v_submission.interview_id <> v_contract.interview_id
     OR v_submission.question_id <> v_contract.question_id
     OR v_submission.state_version <> v_contract.state_version
     OR v_submission.status <> 'accepted_unscored' THEN
    RAISE EXCEPTION 'scoring_score_request_submission_mismatch' USING ERRCODE='23514';
  END IF;

  -- 绑定 canonical artifact（submission 一致 + body HMAC 一致 + 未被 fence）。
  SELECT id, submission_id, body_hmac, status
    INTO v_artifact FROM interview_answer_artifact WHERE id=p_artifact_id;
  IF NOT FOUND OR v_artifact.submission_id <> p_submission_id
     OR v_artifact.body_hmac <> p_answer_body_hmac
     OR v_artifact.status <> 'active' THEN
    RAISE EXCEPTION 'scoring_score_request_artifact_mismatch' USING ERRCODE='23514';
  END IF;

  -- 答案版本替换：同一契约更低的答案版本若仍在途，一律 fence（新版本先赢）。
  UPDATE score_request SET status='fenced', lease_owner=NULL, lease_token=NULL, version=version+1, updated_at=now()
   WHERE issued_contract_id=p_issued_contract_id AND score_request.answer_version < p_answer_version
     AND status IN ('pending','claimed','dispatched');

  INSERT INTO score_request(owner_user_id, interview_id, issued_contract_id, submission_id, artifact_id,
    answer_version, answer_body_hmac, privacy_epoch, operation_policy_version, idempotency_key, status)
  VALUES (principal, v_contract.interview_id, p_issued_contract_id, p_submission_id, p_artifact_id,
    p_answer_version, p_answer_body_hmac, p_privacy_epoch, p_operation_policy_version, p_idempotency_key, 'pending')
  ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING
  RETURNING id INTO v_request_id;

  IF v_request_id IS NULL THEN
    -- 幂等重放：读既有，逐项核对，异体（同键不同契约/artifact/hmac/version）→ 冲突 fail-closed。
    SELECT id, score_request.answer_version, issued_contract_id, submission_id, artifact_id, answer_body_hmac, status
      INTO v_existing FROM score_request WHERE owner_user_id=principal AND idempotency_key=p_idempotency_key;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'scoring_score_request_replay_unavailable' USING ERRCODE='P0001';
    END IF;
    IF v_existing.issued_contract_id <> p_issued_contract_id
       OR v_existing.submission_id <> p_submission_id
       OR v_existing.artifact_id <> p_artifact_id
       OR v_existing.answer_body_hmac <> p_answer_body_hmac
       OR v_existing.answer_version <> p_answer_version THEN
      RAISE EXCEPTION 'scoring_score_request_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.answer_version, true;
    RETURN;
  END IF;
  RETURN QUERY SELECT v_request_id, p_answer_version, false;
END $$;
ALTER FUNCTION scoring_create_score_request(uuid,uuid,uuid,text,bigint,text,bigint,text) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_create_score_request(uuid,uuid,uuid,text,bigint,text,bigint,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION scoring_create_score_request(uuid,uuid,uuid,text,bigint,text,bigint,text) TO app_role;

-- ── ④ claim（permit：单次 CAS pending→claimed；EXECUTE 授 scoring_worker_executor）───
CREATE OR REPLACE FUNCTION scoring_claim_score_request(
  p_request_id uuid,
  p_lease_owner text,
  p_lease_token uuid
) RETURNS TABLE (request_id uuid, status text, lease_token uuid, claimed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
  v_token uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL
     OR p_lease_owner IS NULL OR length(p_lease_owner)=0 OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'scoring_claim_invalid' USING ERRCODE='22023';
  END IF;

  UPDATE score_request SET status='claimed', lease_owner=p_lease_owner, lease_token=p_lease_token,
    version=version+1, updated_at=now()
   WHERE id=p_request_id AND owner_user_id=principal AND score_request.status='pending'
   RETURNING id, score_request.status, score_request.lease_token INTO v_id, v_status, v_token;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_status, v_token, true;
    RETURN;
  END IF;

  -- 未 claim 成功：读当前态（已被 claim/scored/fenced 或 cross-owner 不可见）。
  SELECT id, score_request.status, score_request.lease_token INTO v_id, v_status, v_token
    FROM score_request WHERE id=p_request_id AND owner_user_id=principal;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_status, v_token, false;
  ELSE
    RETURN QUERY SELECT p_request_id, NULL::text, NULL::uuid, false;
  END IF;
END $$;
ALTER FUNCTION scoring_claim_score_request(uuid,text,uuid) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_claim_score_request(uuid,text,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_claim_score_request(uuid,text,uuid) TO scoring_worker_executor;

-- ── ⑤ dispatch（claimed→dispatched，token 匹配；EXECUTE 授 scoring_worker_executor）──
CREATE OR REPLACE FUNCTION scoring_mark_score_request_dispatched(
  p_request_id uuid,
  p_lease_token uuid
) RETURNS TABLE (request_id uuid, status text, dispatched boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL OR p_lease_token IS NULL THEN
    RAISE EXCEPTION 'scoring_dispatch_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE score_request SET status='dispatched', version=version+1, updated_at=now()
   WHERE id=p_request_id AND owner_user_id=principal AND score_request.status='claimed' AND lease_token=p_lease_token
   RETURNING id, score_request.status INTO v_id, v_status;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_status, true;
    RETURN;
  END IF;
  SELECT id, score_request.status INTO v_id, v_status FROM score_request WHERE id=p_request_id AND owner_user_id=principal;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_status, false;
  ELSE
    RETURN QUERY SELECT p_request_id, NULL::text, false;
  END IF;
END $$;
ALTER FUNCTION scoring_mark_score_request_dispatched(uuid,uuid) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_mark_score_request_dispatched(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_mark_score_request_dispatched(uuid,uuid) TO scoring_worker_executor;

-- ── ⑥ fence（删除/撤权/答案替换先赢；EXECUTE 授 scoring_worker_executor）────────────
CREATE OR REPLACE FUNCTION scoring_fence_score_request(
  p_request_id uuid
) RETURNS TABLE (request_id uuid, status text, fenced boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'scoring_fence_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE score_request SET status='fenced', lease_owner=NULL, lease_token=NULL, version=version+1, updated_at=now()
   WHERE id=p_request_id AND owner_user_id=principal AND score_request.status IN ('pending','claimed','dispatched')
   RETURNING id, score_request.status INTO v_id, v_status;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_status, true;
    RETURN;
  END IF;
  -- 已 scored（无法再 fence）或已 fenced（幂等）或 cross-owner。
  SELECT id, score_request.status INTO v_id, v_status FROM score_request WHERE id=p_request_id AND owner_user_id=principal;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, v_status, (v_status='fenced');
  ELSE
    RETURN QUERY SELECT p_request_id, NULL::text, false;
  END IF;
END $$;
ALTER FUNCTION scoring_fence_score_request(uuid) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_fence_score_request(uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_fence_score_request(uuid) TO scoring_worker_executor;

-- ── ⑦ record ScoreCard（写卡事务原子校验两阶段 + CAS + 同事务发事件）────────────────
CREATE OR REPLACE FUNCTION scoring_record_score_card(
  p_request_id uuid,
  p_lease_token uuid,
  p_criteria jsonb,
  p_deterministic_total numeric,
  p_coverage numeric,
  p_uncertainty jsonb,
  p_provenance jsonb
) RETURNS TABLE (card_id uuid, status text, recorded boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_request record;
  v_contract record;
  v_artifact record;
  v_submission record;
  v_card_id uuid;
  crit record;
  v_rubric_weight numeric;
  v_seen int;
  v_distinct int;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL OR p_lease_token IS NULL
     OR p_criteria IS NULL OR jsonb_typeof(p_criteria) <> 'array'
     OR p_deterministic_total IS NULL OR p_deterministic_total < 0
     OR p_coverage IS NULL OR p_coverage < 0 OR p_coverage > 1 THEN
    RAISE EXCEPTION 'scoring_record_invalid' USING ERRCODE='22023';
  END IF;

  -- permit recheck（FOR UPDATE 行锁）：请求必须仍在 claimed/dispatched 且 token 匹配。
  SELECT id, owner_user_id, interview_id, issued_contract_id, submission_id, artifact_id,
         answer_body_hmac, privacy_epoch, score_request.status, lease_token
    INTO v_request FROM score_request WHERE id=p_request_id AND owner_user_id=principal FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'scoring_record_request_forbidden' USING ERRCODE='42501';
  END IF;
  IF v_request.status NOT IN ('claimed','dispatched') OR v_request.lease_token IS DISTINCT FROM p_lease_token THEN
    -- 迟到 provider 结果：permit 已失效（fenced/scored/token 错配），不得写回。
    RETURN QUERY SELECT NULL::uuid, v_request.status, false;
    RETURN;
  END IF;

  -- 删除/撤权 fence 重校验（删除先赢则此处抛错，card=0，事务整体回滚）。
  PERFORM assert_interview_answer_fact_active(v_request.interview_id);
  PERFORM assert_interview_privacy_active(v_request.interview_id);

  -- issue 阶段重校验：契约存在 + owner 一致 + epoch 与 request 一致（epoch fence）。
  SELECT id, question_id, rubric_id, measurement_version, difficulty, privacy_epoch
    INTO v_contract FROM issued_question_contract WHERE id=v_request.issued_contract_id;
  IF NOT FOUND OR v_contract.privacy_epoch <> v_request.privacy_epoch THEN
    RAISE EXCEPTION 'scoring_record_contract_stale' USING ERRCODE='23514';
  END IF;

  -- submission 阶段重校验：artifact 仍 active + body HMAC 未漂移（答案替换/删除重校验）。
  SELECT id, body_hmac, interview_answer_artifact.status INTO v_artifact
    FROM interview_answer_artifact WHERE id=v_request.artifact_id AND owner_user_id=principal;
  IF NOT FOUND OR v_artifact.status <> 'active' OR v_artifact.body_hmac <> v_request.answer_body_hmac THEN
    RAISE EXCEPTION 'scoring_record_artifact_stale' USING ERRCODE='23514';
  END IF;
  SELECT id, interview_answer_submission.status INTO v_submission
    FROM interview_answer_submission WHERE id=v_request.submission_id AND owner_user_id=principal;
  IF NOT FOUND OR v_submission.status <> 'accepted_unscored' THEN
    RAISE EXCEPTION 'scoring_record_submission_stale' USING ERRCODE='23514';
  END IF;

  -- rubric 成员校验：每个分项 criterion 必须存在于冻结 rubric 且 weight 一致；criterion 不重复。
  SELECT count(*) INTO v_seen FROM jsonb_array_elements(p_criteria) j;
  SELECT count(DISTINCT (j.value->>'criterionId')) INTO v_distinct FROM jsonb_array_elements(p_criteria) j;
  IF v_seen = 0 OR v_seen <> v_distinct THEN
    RAISE EXCEPTION 'scoring_record_criteria_invalid' USING ERRCODE='23514';
  END IF;
  FOR crit IN SELECT j.value->>'criterionId' AS criterion_id,
                     j.value->>'disposition' AS disposition,
                     (j.value->>'score')::numeric AS score,
                     (j.value->>'weight')::numeric AS weight
              FROM jsonb_array_elements(p_criteria) j LOOP
    IF crit.criterion_id IS NULL OR length(crit.criterion_id)=0 OR crit.disposition IS NULL
       OR length(crit.disposition)=0 OR crit.score IS NULL OR crit.score < 0
       OR crit.weight IS NULL OR crit.weight <= 0 THEN
      RAISE EXCEPTION 'scoring_record_criteria_invalid' USING ERRCODE='23514';
    END IF;
    SELECT c.weight INTO v_rubric_weight FROM question_rubric_criterion c
     WHERE c.rubric_id=v_contract.rubric_id AND c.criterion_id=crit.criterion_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'scoring_record_criterion_not_in_rubric' USING ERRCODE='23514';
    END IF;
    IF crit.weight IS DISTINCT FROM v_rubric_weight THEN
      RAISE EXCEPTION 'scoring_record_criterion_weight_mismatch' USING ERRCODE='23514';
    END IF;
  END LOOP;

  -- CAS：claimed/dispatched → scored（单 winner；第二个 writer 在此落败）。
  UPDATE score_request SET status='scored', lease_owner=NULL, lease_token=NULL, version=version+1, updated_at=now()
   WHERE id=p_request_id AND score_request.status IN ('claimed','dispatched') AND lease_token=p_lease_token
   RETURNING id INTO v_card_id;
  IF v_card_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, v_request.status, false;
    RETURN;
  END IF;

  INSERT INTO score_card(owner_user_id, interview_id, question_id, answer_id, submission_id,
    score_request_id, issued_contract_id, rubric_id, rubric_version, measurement_version,
    deterministic_total, coverage, uncertainty, status, provenance)
  SELECT principal, v_request.interview_id, v_contract.question_id, v_request.artifact_id, v_request.submission_id,
    p_request_id, v_request.issued_contract_id, v_contract.rubric_id, r.rubric_version, v_contract.measurement_version,
    p_deterministic_total, p_coverage, COALESCE(p_uncertainty,'{}'::jsonb), 'pending_evidence',
    COALESCE(p_provenance,'{}'::jsonb)
  FROM question_rubric r WHERE r.id=v_contract.rubric_id
  RETURNING id INTO v_card_id;

  FOR crit IN SELECT j.value->>'criterionId' AS criterion_id,
                     j.value->>'disposition' AS disposition,
                     (j.value->>'score')::numeric AS score,
                     (j.value->>'weight')::numeric AS weight
              FROM jsonb_array_elements(p_criteria) j LOOP
    INSERT INTO score_card_criterion(owner_user_id, card_id, criterion_id, disposition, score, weight)
    VALUES (principal, v_card_id, crit.criterion_id, crit.disposition, crit.score, crit.weight);
  END LOOP;

  -- 原语④：同事务向 interview_event 原子追加 score_card_written（单调 seq；与 appendEvent 同锁）。
  PERFORM pg_advisory_xact_lock(hashtext(v_request.interview_id));
  INSERT INTO interview_event(owner_user_id, stream_key, seq, kind, payload, event_key)
  SELECT principal, v_request.interview_id, COALESCE(MAX(seq),0)+1, 'score_card_written',
         jsonb_build_object('cardId', v_card_id, 'questionId', v_contract.question_id,
                            'rubricVersion', (SELECT r.rubric_version FROM question_rubric r WHERE r.id=v_contract.rubric_id),
                            'measurementVersion', v_contract.measurement_version, 'status', 'pending_evidence'),
         'score_card_written:' || v_card_id::text
    FROM interview_event WHERE stream_key=v_request.interview_id;

  RETURN QUERY SELECT v_card_id, 'pending_evidence'::text, true;
END $$;
ALTER FUNCTION scoring_record_score_card(uuid,uuid,jsonb,numeric,numeric,jsonb,jsonb) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_record_score_card(uuid,uuid,jsonb,numeric,numeric,jsonb,jsonb) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_record_score_card(uuid,uuid,jsonb,numeric,numeric,jsonb,jsonb) TO scoring_worker_executor;

-- ── ⑧ transition（状态机 CAS；非法转移由触发器拒；EXECUTE 授 scoring_worker_executor）─
CREATE OR REPLACE FUNCTION scoring_transition_score_card(
  p_card_id uuid,
  p_from_status text,
  p_to_status text
) RETURNS TABLE (card_id uuid, status text, transitioned boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_id uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_card_id IS NULL
     OR p_from_status IS NULL OR p_to_status IS NULL THEN
    RAISE EXCEPTION 'scoring_transition_invalid' USING ERRCODE='22023';
  END IF;
  UPDATE score_card SET status=p_to_status, version=version+1, updated_at=now()
   WHERE id=p_card_id AND owner_user_id=principal AND score_card.status=p_from_status
   RETURNING id INTO v_id;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, p_to_status, true;
  ELSE
    RETURN QUERY SELECT p_card_id, p_from_status, false;
  END IF;
END $$;
ALTER FUNCTION scoring_transition_score_card(uuid,text,text) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_transition_score_card(uuid,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_transition_score_card(uuid,text,text) TO scoring_worker_executor;

-- ── ⑨ supersede（更正：旧卡转 superseded + 插新卡，不覆盖历史）─────────────────────
CREATE OR REPLACE FUNCTION scoring_supersede_score_card(
  p_old_card_id uuid,
  p_criteria jsonb,
  p_deterministic_total numeric,
  p_coverage numeric,
  p_uncertainty jsonb,
  p_provenance jsonb
) RETURNS TABLE (card_id uuid, superseded_card_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_old record;
  v_new_card_id uuid;
  crit record;
  v_seen int;
  v_distinct int;
  v_rubric_weight numeric;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_old_card_id IS NULL
     OR p_criteria IS NULL OR jsonb_typeof(p_criteria) <> 'array'
     OR p_deterministic_total IS NULL OR p_deterministic_total < 0
     OR p_coverage IS NULL OR p_coverage < 0 OR p_coverage > 1 THEN
    RAISE EXCEPTION 'scoring_supersede_invalid' USING ERRCODE='22023';
  END IF;

  SELECT id, owner_user_id, interview_id, question_id, answer_id, submission_id, score_request_id,
         issued_contract_id, rubric_id, rubric_version, measurement_version, status
    INTO v_old FROM score_card WHERE id=p_old_card_id AND owner_user_id=principal FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'scoring_supersede_forbidden' USING ERRCODE='42501';
  END IF;
  IF v_old.status IN ('superseded','fenced') THEN
    RAISE EXCEPTION 'scoring_supersede_already_inactive' USING ERRCODE='23514';
  END IF;

  -- 删除/撤权 fence 重校验（同 recordScoreCard 809-810 语义）：删除先赢则此处抛错、事务整体
  -- 回滚，绝不 supersede 出一张引用 fenced 答案的新卡（artifact 未物理 purge 前的删后 read=0 防线）。
  PERFORM assert_interview_answer_fact_active(v_old.interview_id);
  PERFORM assert_interview_privacy_active(v_old.interview_id);

  SELECT count(*) INTO v_seen FROM jsonb_array_elements(p_criteria) j;
  SELECT count(DISTINCT (j.value->>'criterionId')) INTO v_distinct FROM jsonb_array_elements(p_criteria) j;
  IF v_seen = 0 OR v_seen <> v_distinct THEN
    RAISE EXCEPTION 'scoring_supersede_criteria_invalid' USING ERRCODE='23514';
  END IF;

  -- rubric 成员 + weight 校验（镜像 recordScoreCard 831-855，rubric_id 取 v_old.rubric_id）：
  -- 每个分项 criterion 必须存在于旧卡冻结的 rubric 且 weight 一致，否则更正路径可写幻觉
  -- criterionId / 错误权重（双重校验铁律，supersede 与 recordScoreCard 逐条一致）。
  FOR crit IN SELECT j.value->>'criterionId' AS criterion_id,
                     j.value->>'disposition' AS disposition,
                     (j.value->>'score')::numeric AS score,
                     (j.value->>'weight')::numeric AS weight
              FROM jsonb_array_elements(p_criteria) j LOOP
    IF crit.criterion_id IS NULL OR length(crit.criterion_id)=0 OR crit.disposition IS NULL
       OR length(crit.disposition)=0 OR crit.score IS NULL OR crit.score < 0
       OR crit.weight IS NULL OR crit.weight <= 0 THEN
      RAISE EXCEPTION 'scoring_supersede_criteria_invalid' USING ERRCODE='23514';
    END IF;
    SELECT c.weight INTO v_rubric_weight FROM question_rubric_criterion c
     WHERE c.rubric_id=v_old.rubric_id AND c.criterion_id=crit.criterion_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'scoring_supersede_criterion_not_in_rubric' USING ERRCODE='23514';
    END IF;
    IF crit.weight IS DISTINCT FROM v_rubric_weight THEN
      RAISE EXCEPTION 'scoring_supersede_criterion_weight_mismatch' USING ERRCODE='23514';
    END IF;
  END LOOP;

  -- 旧卡转 superseded（内容不覆盖，历史保留）。
  UPDATE score_card SET status='superseded', version=version+1, updated_at=now()
   WHERE id=v_old.id AND status NOT IN ('superseded','fenced');

  INSERT INTO score_card(owner_user_id, interview_id, question_id, answer_id, submission_id,
    score_request_id, issued_contract_id, rubric_id, rubric_version, measurement_version,
    deterministic_total, coverage, uncertainty, status, provenance, supersedes_card_id)
  VALUES (principal, v_old.interview_id, v_old.question_id, v_old.answer_id, v_old.submission_id,
    v_old.score_request_id, v_old.issued_contract_id, v_old.rubric_id, v_old.rubric_version, v_old.measurement_version,
    p_deterministic_total, p_coverage, COALESCE(p_uncertainty,'{}'::jsonb), 'pending_evidence',
    COALESCE(p_provenance,'{}'::jsonb), v_old.id)
  RETURNING id INTO v_new_card_id;

  FOR crit IN SELECT j.value->>'criterionId' AS criterion_id,
                     j.value->>'disposition' AS disposition,
                     (j.value->>'score')::numeric AS score,
                     (j.value->>'weight')::numeric AS weight
              FROM jsonb_array_elements(p_criteria) j LOOP
    INSERT INTO score_card_criterion(owner_user_id, card_id, criterion_id, disposition, score, weight)
    VALUES (principal, v_new_card_id, crit.criterion_id, crit.disposition, crit.score, crit.weight);
  END LOOP;

  RETURN QUERY SELECT v_new_card_id, v_old.id;
END $$;
ALTER FUNCTION scoring_supersede_score_card(uuid,jsonb,numeric,numeric,jsonb,jsonb) OWNER TO scoring_definer_owner;
REVOKE CREATE ON SCHEMA public FROM scoring_definer_owner;


REVOKE ALL ON FUNCTION scoring_supersede_score_card(uuid,jsonb,numeric,numeric,jsonb,jsonb) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_supersede_score_card(uuid,jsonb,numeric,numeric,jsonb,jsonb) TO scoring_worker_executor;
