-- 0109_scoring_evidence_conflict_uncertainty.sql
--
-- SCOR-03：评分证据、冲突与不确定性的写路径语义。
--
-- 这是在 SCOR-01（事实根 + 状态机）与 SCOR-02（确定性聚合 + writer + 消费迁移）之上的
-- 第三层：把「证据必须针对当前答案版本复验」「required coverage」「多来源 uncertainty 独立
-- 保存」「冲突 → review_required / unscored（非 0 分）」变成承重的写路径约束，而非事后补救。
--
-- 铁律（对齐 interview-scoring-measurement.md §2/§3/§5 + CLAUDE.md）：
--   1. span/digest 复验拆两层（答案正文是 ciphertext，DB 无明文）：domain 做文本级复验
--      （span 界内 + sha256(UTF-8 字节)==digest），DB 做绑定级复验（sourceAnswerId/answerVersion/
--      span 规范/offsetKind/digest 格式/成员）。domain 复验结果 `reverified` 由确定性 worker
--      代码产生（**不是模型输出字段**）；reverified=false → 冲突，写卡强制 review_required，
--      证据以固定码 conflict_reason='span_digest_mismatch' 落库（不落自由文字，防 PII 泄漏）。
--   2. required coverage：rubric 分项可标 `required`（默认 true，保持 SCOR-02「全分项必须有
--      证据」语义不变）。写卡只把 required 集纳入 coverage 与缺失判定；optional 分项可缺且
--      不触发 review，但一旦给出仍按确定性公式计分。缺任一 required → review_required +
--      记录缺失列表（missing_required_criteria，不是并入 uncertain 的单布尔）。
--   3. 多来源 uncertainty：8 个**独立列**（证据 coverage / 来源完整性 / 语音质量 / 模型分歧 /
--      适用语言 / rubric 难度 / calibration release / 人工复核状态）各自单独保存，禁布尔汤、
--      禁 JSON 合并。模型自报 confidence 不在本列集——它只作观察信号，绝不单独解锁用途。
--   4. 状态机：新增 review_required → unscored（与既有 review_required → b_review_eligible
--      并列）。unscored/review_required/calibration_blocked/evidence_invalid 非 0 分、不参与
--      聚合。本迁移不改 SCORE_CARD_NON_SCORING_STATUSES（SCOR-02 已含 4 态）。
--   5. 四原语不破坏：①CAS（score_request claimed/dispatched→scored 单 winner）②principal
--      作用域幂等（复用 SCOR-01 UNIQUE(owner,idempotency_key)，本域不新增请求创建路径）
--      ③RLS owner 隔离（不新增角色/不扩大 app_role 基表面）④事务内单调 eventSeq（写卡同事务
--      advisory lock + MAX(seq)+1 追加 score_card_written）。
--   6. 复用 0091 issuer + 0096 sink receipt + 0100 fence + 0103 score_evidence，不重实现删除根。

-- ── ① rubric 分项 `required`（默认 true；SCOR-02 全分项必须有证据的语义不变）────────

GRANT CREATE ON SCHEMA public TO scoring_definer_owner;
ALTER TABLE question_rubric_criterion ADD COLUMN IF NOT EXISTS
  required boolean NOT NULL DEFAULT true;
-- required 随 rubric 一起冻结：question_rubric_criterion 已有 BEFORE UPDATE OR DELETE 触发器
-- 拒改，`required` 天然不可原地改写（无需新增触发器）。

-- ── ①' 更新 publish：读取每分项的 required（缺省 true，兼容既有调用）────────────────
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
  v_required_count int;
BEGIN
  IF p_question_id IS NULL OR length(p_question_id)=0 OR p_question_version IS NULL OR p_question_version < 1
     OR p_rubric_version IS NULL OR p_rubric_version < 1 OR p_competency IS NULL OR length(p_competency)=0
     OR p_difficulty IS NULL OR p_difficulty < 1 OR p_difficulty > 5
     OR p_question_content_hash IS NULL OR p_question_content_hash !~ '^[a-f0-9]{64}$'
     OR p_criteria IS NULL OR jsonb_typeof(p_criteria) <> 'array' THEN
    RAISE EXCEPTION 'scoring_rubric_invalid' USING ERRCODE='22023';
  END IF;

  SELECT count(*) INTO v_seen FROM jsonb_array_elements(p_criteria) j;
  SELECT count(DISTINCT (j.value->>'criterionId')) INTO v_distinct FROM jsonb_array_elements(p_criteria) j;
  IF v_seen = 0 OR v_seen <> v_distinct THEN
    RAISE EXCEPTION 'scoring_rubric_criteria_invalid' USING ERRCODE='23514';
  END IF;
  -- required 只接受 JSON 布尔；非布尔（含字符串 "true"）一律拒——显式 enum 铁律，不猜。
  SELECT count(*) INTO v_required_count FROM jsonb_array_elements(p_criteria) j
   WHERE j.value ? 'required' AND jsonb_typeof(j.value->'required') <> 'boolean';
  IF v_required_count > 0 THEN
    RAISE EXCEPTION 'scoring_rubric_required_invalid' USING ERRCODE='23514';
  END IF;
  FOR crit IN SELECT j.value->>'criterionId' AS criterion_id,
                     (j.value->>'weight')::numeric AS weight
              FROM jsonb_array_elements(p_criteria) j LOOP
    IF crit.criterion_id IS NULL OR length(crit.criterion_id)=0
       OR crit.weight IS NULL OR crit.weight <= 0 THEN
      RAISE EXCEPTION 'scoring_rubric_criteria_invalid' USING ERRCODE='23514';
    END IF;
  END LOOP;

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
                     COALESCE((j.value->>'position')::integer, 0) AS position,
                     COALESCE((j.value->>'required')::boolean, true) AS required
              FROM jsonb_array_elements(p_criteria) j LOOP
    INSERT INTO question_rubric_criterion(rubric_id, criterion_id, weight, behavior_anchors, cap_rules, position, required)
    VALUES (v_rubric_id, crit.criterion_id, crit.weight, crit.behavior_anchors, crit.cap_rules, crit.position, crit.required);
  END LOOP;
  RETURN v_rubric_id;
END $$;

ALTER FUNCTION scoring_publish_question_rubric(text,bigint,bigint,text,smallint,jsonb,text,uuid,jsonb) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_publish_question_rubric(text,bigint,bigint,text,smallint,jsonb,text,uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION scoring_publish_question_rubric(text,bigint,bigint,text,smallint,jsonb,text,uuid,jsonb) TO app_role;

-- ── ② score_card 多来源 uncertainty（8 个独立列）+ 缺失 required 列表 ────────────────
-- 8 个来源各自是独立 enum/boolean，禁布尔汤、禁 JSON 合并。缺省值 = 中性/OK（SCOR-02 既有
-- writer 不写这些列时落到中性值，不破坏既有语义）。
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  uncertainty_evidence_coverage text NOT NULL DEFAULT 'complete'
    CHECK (uncertainty_evidence_coverage IN ('complete','partial','missing'));
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  uncertainty_source_integrity text NOT NULL DEFAULT 'verified'
    CHECK (uncertainty_source_integrity IN ('verified','stale','mismatch'));
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  uncertainty_voice_quality text NOT NULL DEFAULT 'ok'
    CHECK (uncertainty_voice_quality IN ('ok','low','unavailable'));
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  uncertainty_model_disagreement boolean NOT NULL DEFAULT false;
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  uncertainty_language_applicable boolean NOT NULL DEFAULT true;
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  uncertainty_rubric_difficulty text NOT NULL DEFAULT 'unknown'
    CHECK (uncertainty_rubric_difficulty IN ('low','mid','high','unknown'));
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  uncertainty_calibration_release boolean NOT NULL DEFAULT false;
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  uncertainty_human_review text NOT NULL DEFAULT 'none'
    CHECK (uncertainty_human_review IN ('none','pending','resolved'));
-- 缺失的 required 分项列表（[{criterionId, reason}]）；reason 固定码 'missing_required'，
-- 不含答案正文/自由文字/PII。
ALTER TABLE score_card ADD COLUMN IF NOT EXISTS
  missing_required_criteria jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ── ③ 不可原地改写：把新列纳入既有 content-immutable 守卫 ───────────────────────────
DROP TRIGGER IF EXISTS score_card_content_immutable_guard ON score_card;
CREATE TRIGGER score_card_content_immutable_guard
  BEFORE UPDATE OF owner_user_id, interview_id, question_id, answer_id, submission_id,
    score_request_id, issued_contract_id, rubric_id, rubric_version, measurement_version,
    deterministic_total, coverage, uncertainty, provenance, supersedes_card_id, created_at,
    uncertainty_evidence_coverage, uncertainty_source_integrity, uncertainty_voice_quality,
    uncertainty_model_disagreement, uncertainty_language_applicable, uncertainty_rubric_difficulty,
    uncertainty_calibration_release, uncertainty_human_review, missing_required_criteria
  ON score_card FOR EACH ROW EXECUTE FUNCTION assert_score_card_content_immutable();

-- ── ④ 状态机：新增 review_required → unscored（与 b_review_eligible 并列）───────────
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
      -- SCOR-03 新增：独立复核裁决既可进入 B 端评审（b_review_eligible），也可判为无分
      -- （unscored）。两者都是 review_required 的合法出边。
      IF NEW.status NOT IN ('b_review_eligible','unscored') THEN
        RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514'; END IF;
    ELSE
      RAISE EXCEPTION 'score_card_status_transition' USING ERRCODE='23514';
  END CASE;
  RETURN NEW;
END $$;
ALTER FUNCTION assert_score_card_status_transition() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_score_card_status_transition() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS score_card_status_transition_guard ON score_card;
CREATE TRIGGER score_card_status_transition_guard
  BEFORE UPDATE OF status ON score_card FOR EACH ROW EXECUTE FUNCTION assert_score_card_status_transition();

-- ── ⑤ 证据裁决 writer：证据复验 + required coverage + 多来源 uncertainty + 冲突路由 ──
-- 与 scoring_write_final_score_card（SCOR-02）刻意分离：SCOR-02 只写「证据已确定性全量
-- 校验」的可评分态卡；本函数写「证据带 conflict/uncertainty 语义」的 practice_eligible /
-- review_required 卡。总分仍在服务端按确定性公式算（模型不输出自由总分）。
CREATE OR REPLACE FUNCTION scoring_adjudicate_score_card(
  p_request_id uuid,
  p_lease_token uuid,
  p_evidence jsonb,
  p_uncertainty jsonb,
  p_high_impact boolean
) RETURNS TABLE (card_id uuid, status text, deterministic_total numeric, coverage numeric, uncertainty jsonb, missing_required jsonb, recorded boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_request record;
  v_contract record;
  v_artifact record;
  v_submission record;
  v_card_id uuid;
  ev record;
  v_rubric_weight numeric;
  v_cap_rules jsonb;
  v_max_band text;
  v_band_rank int;
  v_max_rank int;
  v_band_value int;
  v_numerator numeric := 0;
  v_denominator numeric := 0;
  v_total numeric;
  v_seen int;
  v_distinct int;
  v_bad_reverified int;
  v_seen_spans text[] := '{}';
  -- required coverage：只统计 required 分项。
  v_required_count int;
  v_scored_required int;
  v_coverage numeric;
  v_has_conflict boolean := false;
  v_missing_required jsonb := '[]'::jsonb;
  miss record;
  -- uncertainty 8 来源（各自独立解析 + 校验）。
  u_evidence_coverage text;
  u_source_integrity text;
  u_voice_quality text;
  u_model_disagreement boolean;
  u_language_applicable boolean;
  u_rubric_difficulty text;
  u_calibration_release boolean;
  u_human_review text;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL OR p_lease_token IS NULL
     OR p_evidence IS NULL OR jsonb_typeof(p_evidence) <> 'array'
     OR p_uncertainty IS NULL OR jsonb_typeof(p_uncertainty) <> 'object'
     OR p_high_impact IS NULL THEN
    RAISE EXCEPTION 'scoring_adjudicate_invalid' USING ERRCODE='22023';
  END IF;

  -- ── uncertainty 8 来源独立解析（缺省=中性）；非法值 fail-closed，绝不静默吞掉 ──
  u_evidence_coverage := COALESCE(p_uncertainty->>'evidenceCoverage', 'complete');
  IF u_evidence_coverage NOT IN ('complete','partial','missing') THEN
    RAISE EXCEPTION 'scoring_adjudicate_uncertainty_invalid' USING ERRCODE='22023';
  END IF;
  u_source_integrity := COALESCE(p_uncertainty->>'sourceIntegrity', 'verified');
  IF u_source_integrity NOT IN ('verified','stale','mismatch') THEN
    RAISE EXCEPTION 'scoring_adjudicate_uncertainty_invalid' USING ERRCODE='22023';
  END IF;
  u_voice_quality := COALESCE(p_uncertainty->>'voiceQuality', 'ok');
  IF u_voice_quality NOT IN ('ok','low','unavailable') THEN
    RAISE EXCEPTION 'scoring_adjudicate_uncertainty_invalid' USING ERRCODE='22023';
  END IF;
  -- 布尔只接受 JSON 布尔（字符串 "true"/"false" 一律拒）。
  IF p_uncertainty ? 'modelDisagreement' THEN
    IF jsonb_typeof(p_uncertainty->'modelDisagreement') <> 'boolean' THEN
      RAISE EXCEPTION 'scoring_adjudicate_uncertainty_invalid' USING ERRCODE='22023';
    END IF;
    u_model_disagreement := p_uncertainty->>'modelDisagreement' = 'true';
  ELSE
    u_model_disagreement := false;
  END IF;
  IF p_uncertainty ? 'languageApplicable' THEN
    IF jsonb_typeof(p_uncertainty->'languageApplicable') <> 'boolean' THEN
      RAISE EXCEPTION 'scoring_adjudicate_uncertainty_invalid' USING ERRCODE='22023';
    END IF;
    u_language_applicable := p_uncertainty->>'languageApplicable' = 'true';
  ELSE
    u_language_applicable := true;
  END IF;
  u_rubric_difficulty := COALESCE(p_uncertainty->>'rubricDifficulty', 'unknown');
  IF u_rubric_difficulty NOT IN ('low','mid','high','unknown') THEN
    RAISE EXCEPTION 'scoring_adjudicate_uncertainty_invalid' USING ERRCODE='22023';
  END IF;
  IF p_uncertainty ? 'calibrationRelease' THEN
    IF jsonb_typeof(p_uncertainty->'calibrationRelease') <> 'boolean' THEN
      RAISE EXCEPTION 'scoring_adjudicate_uncertainty_invalid' USING ERRCODE='22023';
    END IF;
    u_calibration_release := p_uncertainty->>'calibrationRelease' = 'true';
  ELSE
    u_calibration_release := false;
  END IF;
  u_human_review := COALESCE(p_uncertainty->>'humanReview', 'none');
  IF u_human_review NOT IN ('none','pending','resolved') THEN
    RAISE EXCEPTION 'scoring_adjudicate_uncertainty_invalid' USING ERRCODE='22023';
  END IF;

  -- ── permit recheck（FOR UPDATE 行锁）：复用 SCOR-02 语义，请求须仍在 claimed/dispatched ──
  SELECT id, owner_user_id, interview_id, issued_contract_id, submission_id, artifact_id,
         answer_body_hmac, privacy_epoch, score_request.status, lease_token, answer_version
    INTO v_request FROM score_request WHERE id=p_request_id AND owner_user_id=principal FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'scoring_adjudicate_request_forbidden' USING ERRCODE='42501';
  END IF;
  IF v_request.status NOT IN ('claimed','dispatched') OR v_request.lease_token IS DISTINCT FROM p_lease_token THEN
    -- 迟到 provider 结果：permit 已失效（fenced/scored/token 错配），不得写回。
    RETURN QUERY SELECT NULL::uuid, v_request.status, NULL::numeric, NULL::numeric, NULL::jsonb, NULL::jsonb, false;
    RETURN;
  END IF;

  -- 删除/撤权 fence 重校验（删除先赢则抛错，card=0，事务整体回滚）。
  PERFORM assert_interview_answer_fact_active(v_request.interview_id);
  PERFORM assert_interview_privacy_active(v_request.interview_id);

  -- issue 阶段重校验：契约存在 + epoch 与 request 一致（epoch fence）。
  SELECT id, question_id, rubric_id, measurement_version, privacy_epoch
    INTO v_contract FROM issued_question_contract WHERE id=v_request.issued_contract_id;
  IF NOT FOUND OR v_contract.privacy_epoch <> v_request.privacy_epoch THEN
    RAISE EXCEPTION 'scoring_adjudicate_contract_stale' USING ERRCODE='23514';
  END IF;

  -- submission 阶段重校验：artifact 仍 active + body HMAC 未漂移 + submission accepted_unscored。
  SELECT id, body_hmac, interview_answer_artifact.status INTO v_artifact
    FROM interview_answer_artifact WHERE id=v_request.artifact_id AND owner_user_id=principal;
  IF NOT FOUND OR v_artifact.status <> 'active' OR v_artifact.body_hmac <> v_request.answer_body_hmac THEN
    RAISE EXCEPTION 'scoring_adjudicate_artifact_stale' USING ERRCODE='23514';
  END IF;
  SELECT id, interview_answer_submission.status INTO v_submission
    FROM interview_answer_submission WHERE id=v_request.submission_id AND owner_user_id=principal;
  IF NOT FOUND OR v_submission.status <> 'accepted_unscored' THEN
    RAISE EXCEPTION 'scoring_adjudicate_submission_stale' USING ERRCODE='23514';
  END IF;

  -- 证据非空 + criterionId 唯一。
  SELECT count(*) INTO v_seen FROM jsonb_array_elements(p_evidence) j;
  SELECT count(DISTINCT (j.value->>'criterionId')) INTO v_distinct FROM jsonb_array_elements(p_evidence) j;
  IF v_seen = 0 OR v_seen <> v_distinct THEN
    RAISE EXCEPTION 'scoring_adjudicate_evidence_invalid' USING ERRCODE='23514';
  END IF;

  -- reverified 只接受 JSON 布尔；非布尔（含字符串 "true"/"1"/"yes"/"on"/"t"/"y"）一律拒——显式 enum
  -- 铁律，不猜。必须在 ::boolean 转型之前拦截，否则裸转型会把 "yes"/"1" 等静默强转 true/false
  -- （绕过「未复验/复验失败 → 冲突」保证）。null/缺键不在此列——仍由下方 IS NULL 守卫判 missing。
  SELECT count(*) INTO v_bad_reverified FROM jsonb_array_elements(p_evidence) j
   WHERE jsonb_typeof(j.value->'reverified') NOT IN ('boolean','null');
  IF v_bad_reverified > 0 THEN
    RAISE EXCEPTION 'scoring_adjudicate_reverified_invalid' USING ERRCODE='22023';
  END IF;

  -- 证据循环：字段完整性 + 绑定级复验 + 成员 + 硬上限 + 重复 span + 确定性累加 + conflict 标记。
  FOR ev IN SELECT
        j.value->>'criterionId' AS criterion_id,
        (j.value->>'sourceAnswerId')::uuid AS source_answer_id,
        (j.value->>'answerVersion')::bigint AS answer_version,
        j.value->'span'->>'offsetKind' AS span_offset_kind,
        (j.value->'span'->>'start')::integer AS span_start,
        (j.value->'span'->>'end')::integer AS span_end,
        j.value->>'spanDigest' AS span_digest,
        j.value->>'disposition' AS disposition,
        (j.value->>'reverified')::boolean AS reverified
      FROM jsonb_array_elements(p_evidence) j LOOP
    IF ev.criterion_id IS NULL OR length(ev.criterion_id)=0
       OR ev.disposition IS NULL OR ev.disposition NOT IN ('below','meets','exceeds')
       OR ev.source_answer_id IS NULL OR ev.source_answer_id <> v_request.artifact_id
       OR ev.answer_version IS NULL OR ev.answer_version <> v_request.answer_version
       OR ev.span_offset_kind IS NULL OR ev.span_offset_kind <> 'utf8_byte'
       OR ev.span_start IS NULL OR ev.span_start < 0
       OR ev.span_end IS NULL OR ev.span_end < ev.span_start
       OR ev.span_digest IS NULL OR ev.span_digest !~ '^[a-f0-9]{64}$' THEN
      RAISE EXCEPTION 'scoring_adjudicate_evidence_invalid' USING ERRCODE='22023';
    END IF;

    -- reverified 是「span/digest 已针对当前答案版本复验」的唯一把守标志（答案正文是 ciphertext，
    -- DB 无法从 ciphertext 重算 digest）。缺字段/JSON null = 复验未发生——既不是 true（已复验通过）
    -- 也不是 false（复验失败 → conflict_reason=span_digest_mismatch），而是第三种「未知」态。
    -- fail-closed：直接拒写整卡，绝不把未复验证据静默当 verified=true 写成 practice_eligible
    -- （否则绕过 SCOR-03 的「冲突 → review_required」保证，把应 review 的证据写成可评分态）。
    IF ev.reverified IS NULL THEN
      RAISE EXCEPTION 'scoring_adjudicate_reverified_missing' USING ERRCODE='22023';
    END IF;

    SELECT c.weight, c.cap_rules INTO v_rubric_weight, v_cap_rules
      FROM question_rubric_criterion c
      WHERE c.rubric_id=v_contract.rubric_id AND c.criterion_id=ev.criterion_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'scoring_adjudicate_criterion_not_in_rubric' USING ERRCODE='23514';
    END IF;

    v_max_band := COALESCE(v_cap_rules->>'maxBand', NULL);
    IF v_max_band IS NOT NULL THEN
      v_band_rank := CASE ev.disposition WHEN 'below' THEN 0 WHEN 'meets' THEN 1 WHEN 'exceeds' THEN 2 END;
      v_max_rank := CASE v_max_band WHEN 'below' THEN 0 WHEN 'meets' THEN 1 WHEN 'exceeds' THEN 2 ELSE -1 END;
      IF v_max_rank < 0 THEN
        RAISE EXCEPTION 'scoring_adjudicate_cap_invalid' USING ERRCODE='23514';
      END IF;
      IF v_band_rank > v_max_rank THEN
        RAISE EXCEPTION 'scoring_adjudicate_cap_exceeded' USING ERRCODE='23514';
      END IF;
    END IF;

    IF v_seen_spans @> ARRAY[(ev.span_start::text || ':' || ev.span_end::text)] THEN
      RAISE EXCEPTION 'scoring_adjudicate_duplicate_span' USING ERRCODE='23514';
    END IF;
    v_seen_spans := array_append(v_seen_spans, ev.span_start::text || ':' || ev.span_end::text);

    -- 域级复验失败的证据：标记冲突（固定码），但仍在总分中按判定档位参与（review_required 卡
    -- 的总分只是信息性，不进入可评分聚合）。
    IF ev.reverified = false THEN
      v_has_conflict := true;
    END IF;

    v_band_value := CASE ev.disposition WHEN 'below' THEN 0 WHEN 'meets' THEN 1 ELSE 2 END;
    v_numerator := v_numerator + (v_rubric_weight * v_band_value * 50);
    v_denominator := v_denominator + v_rubric_weight;
  END LOOP;

  v_total := round(v_numerator / v_denominator);

  -- ── required coverage：只统计 required 分项；缺任一 → review_required + 记录缺失 ──
  SELECT count(*) INTO v_required_count FROM question_rubric_criterion c
   WHERE c.rubric_id=v_contract.rubric_id AND c.required = true;
  IF v_required_count = 0 THEN
    -- 全 optional 的 rubric 是畸形 rubric（无 required 门可判）；fail-closed 拒写。
    RAISE EXCEPTION 'scoring_adjudicate_no_required_criterion' USING ERRCODE='23514';
  END IF;
  SELECT count(*) INTO v_scored_required FROM question_rubric_criterion c
   WHERE c.rubric_id=v_contract.rubric_id AND c.required = true
     AND EXISTS (SELECT 1 FROM jsonb_array_elements(p_evidence) j
                  WHERE j.value->>'criterionId' = c.criterion_id);
  v_coverage := v_scored_required::numeric / v_required_count::numeric;

  -- 缺失 required 列表：criterionId + 固定 reason，不含正文/自由文字。
  FOR miss IN
    SELECT c.criterion_id FROM question_rubric_criterion c
     WHERE c.rubric_id=v_contract.rubric_id AND c.required = true
       AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_evidence) j
                        WHERE j.value->>'criterionId' = c.criterion_id)
     ORDER BY c.criterion_id
  LOOP
    v_missing_required := v_missing_required || jsonb_build_object('criterionId', miss.criterion_id, 'reason', 'missing_required');
  END LOOP;

  -- ── 冲突/低 coverage/低语音/分歧/来源不完整/语言不适用/高影响 → review_required ──
  -- （spec §83/§84：冲突、低 coverage、低语音质量、高影响用途或低置信分歧进入 review。）
  IF v_has_conflict
     OR jsonb_array_length(v_missing_required) > 0
     OR u_model_disagreement
     OR u_voice_quality = 'low'
     OR u_source_integrity <> 'verified'
     OR u_language_applicable = false
     OR p_high_impact THEN
    v_status := 'review_required';
  ELSE
    v_status := 'practice_eligible';
  END IF;

  -- ①CAS：claimed/dispatched → scored（单 winner；第二个 writer 在此落败）。
  UPDATE score_request SET status='scored', lease_owner=NULL, lease_token=NULL, version=version+1, updated_at=now()
   WHERE id=p_request_id AND score_request.status IN ('claimed','dispatched') AND lease_token=p_lease_token
   RETURNING id INTO v_card_id;
  IF v_card_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, v_request.status, NULL::numeric, NULL::numeric, NULL::jsonb, NULL::jsonb, false;
    RETURN;
  END IF;

  -- 直接落终态卡（不经过 pending_evidence 中转：证据已在写卡事务内确定性全量校验）。
  INSERT INTO score_card(owner_user_id, interview_id, question_id, answer_id, submission_id,
    score_request_id, issued_contract_id, rubric_id, rubric_version, measurement_version,
    deterministic_total, coverage, uncertainty, status, provenance,
    uncertainty_evidence_coverage, uncertainty_source_integrity, uncertainty_voice_quality,
    uncertainty_model_disagreement, uncertainty_language_applicable, uncertainty_rubric_difficulty,
    uncertainty_calibration_release, uncertainty_human_review, missing_required_criteria)
  SELECT principal, v_request.interview_id, v_contract.question_id, v_request.artifact_id, v_request.submission_id,
    p_request_id, v_request.issued_contract_id, v_contract.rubric_id, r.rubric_version, v_contract.measurement_version,
    v_total, v_coverage, '{}'::jsonb, v_status,
    jsonb_build_object('writer','scoring_adjudicate_score_card','scor','SCOR-03'),
    u_evidence_coverage, u_source_integrity, u_voice_quality,
    u_model_disagreement, u_language_applicable, u_rubric_difficulty,
    u_calibration_release, u_human_review, v_missing_required
  FROM question_rubric r WHERE r.id=v_contract.rubric_id
  RETURNING id INTO v_card_id;

  -- 落证据（append-only）+ 分项分（conflict 证据带固定码 conflict_reason）。
  FOR ev IN SELECT
        j.value->>'criterionId' AS criterion_id,
        (j.value->>'sourceAnswerId')::uuid AS source_answer_id,
        (j.value->>'answerVersion')::bigint AS answer_version,
        (j.value->'span'->>'start')::integer AS span_start,
        (j.value->'span'->>'end')::integer AS span_end,
        j.value->>'spanDigest' AS span_digest,
        j.value->>'disposition' AS disposition,
        (j.value->>'reverified')::boolean AS reverified
      FROM jsonb_array_elements(p_evidence) j LOOP
    INSERT INTO score_evidence(owner_user_id, card_id, criterion_id, source_answer_id, answer_version,
      span_offset_kind, span_start, span_end, span_digest, disposition, conflict_reason)
    VALUES (principal, v_card_id, ev.criterion_id, ev.source_answer_id, ev.answer_version,
      'utf8_byte', ev.span_start, ev.span_end, ev.span_digest, ev.disposition,
      CASE WHEN ev.reverified = false THEN 'span_digest_mismatch' ELSE NULL END);

    v_band_value := CASE ev.disposition WHEN 'below' THEN 0 WHEN 'meets' THEN 1 ELSE 2 END;
    INSERT INTO score_card_criterion(owner_user_id, card_id, criterion_id, disposition, score, weight)
    SELECT principal, v_card_id, ev.criterion_id, ev.disposition, 50 * v_band_value, c.weight
      FROM question_rubric_criterion c WHERE c.rubric_id=v_contract.rubric_id AND c.criterion_id=ev.criterion_id;
  END LOOP;

  -- ④事务内单调 eventSeq：同事务向 interview_event 原子追加 score_card_written。
  PERFORM pg_advisory_xact_lock(hashtext(v_request.interview_id));
  INSERT INTO interview_event(owner_user_id, stream_key, seq, kind, payload, event_key)
  SELECT principal, v_request.interview_id, COALESCE(MAX(seq),0)+1, 'score_card_written',
         jsonb_build_object('cardId', v_card_id, 'questionId', v_contract.question_id,
                            'rubricVersion', (SELECT r.rubric_version FROM question_rubric r WHERE r.id=v_contract.rubric_id),
                            'measurementVersion', v_contract.measurement_version, 'status', v_status,
                            'deterministicTotal', v_total),
         'score_card_written:' || v_card_id::text
    FROM interview_event WHERE stream_key=v_request.interview_id;

  RETURN QUERY SELECT v_card_id, v_status, v_total, v_coverage, '{}'::jsonb, v_missing_required, true;
END $$;
ALTER FUNCTION scoring_adjudicate_score_card(uuid,uuid,jsonb,jsonb,boolean) OWNER TO scoring_definer_owner;
REVOKE CREATE ON SCHEMA public FROM scoring_definer_owner;


REVOKE ALL ON FUNCTION scoring_adjudicate_score_card(uuid,uuid,jsonb,jsonb,boolean) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_adjudicate_score_card(uuid,uuid,jsonb,jsonb,boolean) TO scoring_worker_executor;
