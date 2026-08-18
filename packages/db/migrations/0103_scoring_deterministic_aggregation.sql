-- 0103_scoring_deterministic_aggregation.sql
--
-- SCOR-02：确定性聚合 + 专用 score-writer + 消费迁移。
--
-- 这是「评分测量」的算分承重面：把 SCOR-01（事实根 + 状态机 + 幂等/并发/RLS）补上
-- ① append-only 的 ScoreEvidence（criterionId + canonical answer artifact + 规范化 span
--    + span digest + 判定档位）② 专用终态 score-writer（只写 practice_eligible /
--    b_review_eligible 卡，模型**不得**输出自由总分）③ C 端只读聚合（只消费可评分态卡，
--    legacy `answer_evaluated.score` 整数事件结构性不参与——聚合只读 score_card 表）。
--
-- 铁律（对齐 CLAUDE.md + interview-scoring-measurement.md §2/§5 + scoring-measurement-runtime.md）：
--   1. 模型不是总分权威：模型只输出 criterionId + span + digest + disposition，总分在**服务端**
--      （本迁移的 DB 函数）按确定性公式算。任何自由文字、自由总分都不进总分。
--   2. 确定性公式：band ∈ {below:0, meets:1, exceeds:2}；per-criterion score = 50×band；
--      总分 = round( Σ(weight×band×50) / Σ(weight) ) = round(100×Σ(weight×band)/(2×Σ(weight)))，
--      0..100 整数。coverage：SCOR-02 要求**全部** rubric 分项有证据（缺任一 = 证据不足 = 无分），
--      故可评分态卡 coverage 恒 1.0；uncertainty 归 SCOR-03，本域恒 `{}`。
--   3. 只写可评分终态卡：p_target_status 必须 ∈ {practice_eligible, b_review_eligible}
--      （isScoreCardScorable）。unscored/review_required/calibration_blocked/evidence_invalid
--      是**非 0 分**态（SCORE_CARD_NON_SCORING_STATUSES），writer 一律拒写、不聚合。
--   4. span 复验拆两层（答案正文是 ciphertext，DB 无明文）：domain 做文本级复验（span 在界内 +
--      sha256(span 覆盖的 UTF-8 字节) == digest）；DB 做绑定级复验（sourceAnswerId == 当前请求的
--      canonical artifact_id + answerVersion == request.answer_version + span 规范 + offsetKind
--      == 'utf8_byte' + digest 格式 + 重复 span）。两层都必须通过，自由文字不能代替 criterionId。
--   5. 四个原语不破坏：①CAS（score_request claimed/dispatched→scored 单 winner）②principal
--      作用域幂等（复用 SCOR-01 UNIQUE(owner,idempotency_key)，本域不新增请求创建路径）
--      ③RLS owner 隔离（score_evidence 复用 FORCE RLS + scoring_definer_owner/app_role policy）
--      ④事务内单调 eventSeq（写卡同事务 advisory lock + MAX(seq)+1 追加 score_card_written）。
--   6. 复用 0091 issuer + 0096 sink receipt + SCOR-01 fence/delete-first-wins，不重实现删除根。
--      score_evidence.source_answer_id 与 score_card.answer_id 同为 ON DELETE RESTRICT：
--      fail-closed——宁可物理 purge 被拦，也绝不静默孤立证据；评分 sink 的物理 purge 补齐归
--      SCOR-07/08（本域非目标）。

-- ── ① ScoreEvidence：append-only 证据（criterionId + canonical artifact + 规范化 span + digest）──
CREATE TABLE IF NOT EXISTS score_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  card_id uuid NOT NULL REFERENCES score_card(id) ON DELETE RESTRICT,
  criterion_id text NOT NULL CHECK (length(criterion_id) BETWEEN 1 AND 128),
  -- canonical answer artifact（source）：与 score_card.answer_id 同源；绑定级复验 target。
  source_answer_id uuid NOT NULL REFERENCES interview_answer_artifact(id) ON DELETE RESTRICT,
  -- 冻结的答案版本（与 score_request.answer_version 一致；写卡时重验，防陈旧证据）。
  answer_version bigint NOT NULL CHECK (answer_version >= 1),
  -- 规范化 span（单一坐标系 UTF-8 字节；offset_kind 固定 utf8_byte，与 octet_length 对齐）。
  span_offset_kind text NOT NULL DEFAULT 'utf8_byte' CHECK (span_offset_kind = 'utf8_byte'),
  span_start integer NOT NULL CHECK (span_start >= 0),
  span_end integer NOT NULL CHECK (span_end >= span_start),
  -- span digest = sha256(span 覆盖的 UTF-8 字节) hex；写卡前须在当前答案版本复验（domain 文本级）。
  span_digest text NOT NULL CHECK (span_digest ~ '^[a-f0-9]{64}$'),
  -- 判定档位（有限档；SCOR-02 只写 below/meets/exceeds）。
  disposition text NOT NULL CHECK (disposition IN ('below','meets','exceeds')),
  -- 缺失/冲突原因（SCOR-03 多来源语义；SCOR-02 恒 NULL——缺证据=拒写不落行，不写原因）。
  missing_reason text,
  conflict_reason text,
  version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- 每 criterion 至多一条证据（写卡循环 + schema 兜底）。
  UNIQUE (card_id, criterion_id),
  -- 同一卡内 span 不得被两条证据重复引用（写卡循环 + schema 兜底）。
  UNIQUE (card_id, span_start, span_end)
);

GRANT CREATE ON SCHEMA public TO scoring_definer_owner;
ALTER TABLE score_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_evidence FORCE ROW LEVEL SECURITY;

-- ── 表级 grants + RLS policies（复用 SCOR-01 角色，不新增角色）───────────────────────
REVOKE ALL ON score_evidence FROM PUBLIC;
-- 评分事实表：definer 全权（SELECT/INSERT 供写卡循环与 FOR UPDATE 行锁；无 UPDATE/DELETE grant）。
GRANT SELECT, INSERT ON score_evidence TO scoring_definer_owner;
-- app_role（API 服务主体）只读评分结果：SELECT 走 owner 作用域 RLS，无写权（INSERT/UPDATE 拒）。
GRANT SELECT ON score_evidence TO app_role;

DROP POLICY IF EXISTS score_evidence_scoring_definer ON score_evidence;
CREATE POLICY score_evidence_scoring_definer ON score_evidence
  FOR ALL TO scoring_definer_owner
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
DROP POLICY IF EXISTS score_evidence_app_role ON score_evidence;
CREATE POLICY score_evidence_app_role ON score_evidence
  FOR SELECT TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true));

-- ── 不可原地改写（append-only 纵深：BEFORE UPDATE/DELETE 一律拒）────────────────────
CREATE OR REPLACE FUNCTION assert_score_evidence_immutable() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'score_evidence_immutable' USING ERRCODE='23514';
END $$;

ALTER FUNCTION assert_score_evidence_immutable() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_score_evidence_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS score_evidence_immutable_guard ON score_evidence;
CREATE TRIGGER score_evidence_immutable_guard
  BEFORE UPDATE OR DELETE ON score_evidence FOR EACH ROW EXECUTE FUNCTION assert_score_evidence_immutable();

-- ── ② 专用终态 score-writer（只写可评分态卡；模型不得输出自由总分）──────────────────
CREATE OR REPLACE FUNCTION scoring_write_final_score_card(
  p_request_id uuid,
  p_lease_token uuid,
  p_evidence jsonb,
  p_target_status text
) RETURNS TABLE (card_id uuid, status text, deterministic_total numeric, coverage numeric, uncertainty jsonb, recorded boolean)
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
  v_rubric_criterion_count int;
  v_seen_spans text[] := '{}';
BEGIN
  -- 只写可评分终态卡（isScoreCardScorable）：unscored/review_required/calibration_blocked/
  -- evidence_invalid 等非评分态一律拒写（fail-closed，不落卡、不聚合）。
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL OR p_lease_token IS NULL
     OR p_evidence IS NULL OR jsonb_typeof(p_evidence) <> 'array'
     OR p_target_status IS NULL OR p_target_status NOT IN ('practice_eligible','b_review_eligible') THEN
    RAISE EXCEPTION 'scoring_final_card_invalid' USING ERRCODE='22023';
  END IF;

  -- permit recheck（FOR UPDATE 行锁）：请求必须仍在 claimed/dispatched 且 token 匹配。
  SELECT id, owner_user_id, interview_id, issued_contract_id, submission_id, artifact_id,
         answer_body_hmac, privacy_epoch, score_request.status, lease_token, answer_version
    INTO v_request FROM score_request WHERE id=p_request_id AND owner_user_id=principal FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'scoring_final_card_request_forbidden' USING ERRCODE='42501';
  END IF;
  IF v_request.status NOT IN ('claimed','dispatched') OR v_request.lease_token IS DISTINCT FROM p_lease_token THEN
    -- 迟到 provider 结果：permit 已失效（fenced/scored/token 错配），不得写回。
    RETURN QUERY SELECT NULL::uuid, v_request.status, NULL::numeric, NULL::numeric, NULL::jsonb, false;
    RETURN;
  END IF;

  -- 删除/撤权 fence 重校验（删除先赢则此处抛错，card=0，事务整体回滚）。
  PERFORM assert_interview_answer_fact_active(v_request.interview_id);
  PERFORM assert_interview_privacy_active(v_request.interview_id);

  -- issue 阶段重校验：契约存在 + epoch 与 request 一致（epoch fence）。
  SELECT id, question_id, rubric_id, measurement_version, privacy_epoch
    INTO v_contract FROM issued_question_contract WHERE id=v_request.issued_contract_id;
  IF NOT FOUND OR v_contract.privacy_epoch <> v_request.privacy_epoch THEN
    RAISE EXCEPTION 'scoring_final_card_contract_stale' USING ERRCODE='23514';
  END IF;

  -- submission 阶段重校验：artifact 仍 active + body HMAC 未漂移 + submission accepted_unscored。
  SELECT id, body_hmac, interview_answer_artifact.status INTO v_artifact
    FROM interview_answer_artifact WHERE id=v_request.artifact_id AND owner_user_id=principal;
  IF NOT FOUND OR v_artifact.status <> 'active' OR v_artifact.body_hmac <> v_request.answer_body_hmac THEN
    RAISE EXCEPTION 'scoring_final_card_artifact_stale' USING ERRCODE='23514';
  END IF;
  SELECT id, interview_answer_submission.status INTO v_submission
    FROM interview_answer_submission WHERE id=v_request.submission_id AND owner_user_id=principal;
  IF NOT FOUND OR v_submission.status <> 'accepted_unscored' THEN
    RAISE EXCEPTION 'scoring_final_card_submission_stale' USING ERRCODE='23514';
  END IF;

  -- 证据非空 + criterionId 唯一（每 criterion 至多一条证据）。
  SELECT count(*) INTO v_seen FROM jsonb_array_elements(p_evidence) j;
  SELECT count(DISTINCT (j.value->>'criterionId')) INTO v_distinct FROM jsonb_array_elements(p_evidence) j;
  IF v_seen = 0 OR v_seen <> v_distinct THEN
    RAISE EXCEPTION 'scoring_final_evidence_invalid' USING ERRCODE='23514';
  END IF;

  -- required criterion：全部 rubric 分项必须有证据（缺任一 = 证据不足 = 无分）。
  SELECT count(*) INTO v_rubric_criterion_count FROM question_rubric_criterion c WHERE c.rubric_id=v_contract.rubric_id;
  IF v_rubric_criterion_count = 0 OR v_seen <> v_rubric_criterion_count THEN
    RAISE EXCEPTION 'scoring_final_required_criterion_missing' USING ERRCODE='23514';
  END IF;

  FOR ev IN SELECT
        j.value->>'criterionId' AS criterion_id,
        (j.value->>'sourceAnswerId')::uuid AS source_answer_id,
        (j.value->>'answerVersion')::bigint AS answer_version,
        j.value->'span'->>'offsetKind' AS span_offset_kind,
        (j.value->'span'->>'start')::integer AS span_start,
        (j.value->'span'->>'end')::integer AS span_end,
        j.value->>'spanDigest' AS span_digest,
        j.value->>'disposition' AS disposition
      FROM jsonb_array_elements(p_evidence) j LOOP
    -- 字段完整性 + 有限档 + span 规范 + digest 格式（fail-closed；自由文字不能代替 criterionId）。
    IF ev.criterion_id IS NULL OR length(ev.criterion_id)=0
       OR ev.disposition IS NULL OR ev.disposition NOT IN ('below','meets','exceeds')
       OR ev.source_answer_id IS NULL OR ev.source_answer_id <> v_request.artifact_id
       OR ev.answer_version IS NULL OR ev.answer_version <> v_request.answer_version
       OR ev.span_offset_kind IS NULL OR ev.span_offset_kind <> 'utf8_byte'
       OR ev.span_start IS NULL OR ev.span_start < 0
       OR ev.span_end IS NULL OR ev.span_end < ev.span_start
       OR ev.span_digest IS NULL OR ev.span_digest !~ '^[a-f0-9]{64}$' THEN
      RAISE EXCEPTION 'scoring_final_evidence_invalid' USING ERRCODE='22023';
    END IF;

    -- 成员校验：criterion 必须在冻结 rubric 且 weight 冻结（冻结值用于确定性聚合）。
    SELECT c.weight, c.cap_rules INTO v_rubric_weight, v_cap_rules
      FROM question_rubric_criterion c
      WHERE c.rubric_id=v_contract.rubric_id AND c.criterion_id=ev.criterion_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'scoring_final_criterion_not_in_rubric' USING ERRCODE='23514';
    END IF;

    -- 硬上限（capRules.maxBand）：disposition 档位 <= maxBand 档位，否则越上限拒。
    v_max_band := COALESCE(v_cap_rules->>'maxBand', NULL);
    IF v_max_band IS NOT NULL THEN
      v_band_rank := CASE ev.disposition WHEN 'below' THEN 0 WHEN 'meets' THEN 1 WHEN 'exceeds' THEN 2 END;
      v_max_rank := CASE v_max_band WHEN 'below' THEN 0 WHEN 'meets' THEN 1 WHEN 'exceeds' THEN 2 ELSE -1 END;
      IF v_max_rank < 0 THEN
        RAISE EXCEPTION 'scoring_final_cap_invalid' USING ERRCODE='23514';
      END IF;
      IF v_band_rank > v_max_rank THEN
        RAISE EXCEPTION 'scoring_final_cap_exceeded' USING ERRCODE='23514';
      END IF;
    END IF;

    -- 重复 span 检测（同一 span 不得被两条证据引用）。
    IF v_seen_spans @> ARRAY[(ev.span_start::text || ':' || ev.span_end::text)] THEN
      RAISE EXCEPTION 'scoring_final_duplicate_span' USING ERRCODE='23514';
    END IF;
    v_seen_spans := array_append(v_seen_spans, ev.span_start::text || ':' || ev.span_end::text);

    -- 确定性分量累加：score = 50×band；总分 = round(加权均值)。
    v_band_value := CASE ev.disposition WHEN 'below' THEN 0 WHEN 'meets' THEN 1 ELSE 2 END;
    v_numerator := v_numerator + (v_rubric_weight * v_band_value * 50);
    v_denominator := v_denominator + v_rubric_weight;
  END LOOP;

  v_total := round(v_numerator / v_denominator);

  -- ①CAS：claimed/dispatched → scored（单 winner；第二个 writer 在此落败）。
  UPDATE score_request SET status='scored', lease_owner=NULL, lease_token=NULL, version=version+1, updated_at=now()
   WHERE id=p_request_id AND score_request.status IN ('claimed','dispatched') AND lease_token=p_lease_token
   RETURNING id INTO v_card_id;
  IF v_card_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, v_request.status, NULL::numeric, NULL::numeric, NULL::jsonb, false;
    RETURN;
  END IF;

  -- 直接落终态可评分卡（不经过 pending_evidence 中转：证据已确定性全量校验）。
  INSERT INTO score_card(owner_user_id, interview_id, question_id, answer_id, submission_id,
    score_request_id, issued_contract_id, rubric_id, rubric_version, measurement_version,
    deterministic_total, coverage, uncertainty, status, provenance)
  SELECT principal, v_request.interview_id, v_contract.question_id, v_request.artifact_id, v_request.submission_id,
    p_request_id, v_request.issued_contract_id, v_contract.rubric_id, r.rubric_version, v_contract.measurement_version,
    v_total, 1.0, '{}'::jsonb, p_target_status,
    jsonb_build_object('writer','scoring_write_final_score_card','scor','SCOR-02')
  FROM question_rubric r WHERE r.id=v_contract.rubric_id
  RETURNING id INTO v_card_id;

  -- 落证据（append-only）+ 分项分（score_card_criterion，per-criterion score = 50×band）。
  FOR ev IN SELECT
        j.value->>'criterionId' AS criterion_id,
        (j.value->>'sourceAnswerId')::uuid AS source_answer_id,
        (j.value->>'answerVersion')::bigint AS answer_version,
        (j.value->'span'->>'start')::integer AS span_start,
        (j.value->'span'->>'end')::integer AS span_end,
        j.value->>'spanDigest' AS span_digest,
        j.value->>'disposition' AS disposition
      FROM jsonb_array_elements(p_evidence) j LOOP
    INSERT INTO score_evidence(owner_user_id, card_id, criterion_id, source_answer_id, answer_version,
      span_offset_kind, span_start, span_end, span_digest, disposition)
    VALUES (principal, v_card_id, ev.criterion_id, ev.source_answer_id, ev.answer_version,
      'utf8_byte', ev.span_start, ev.span_end, ev.span_digest, ev.disposition);

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
                            'measurementVersion', v_contract.measurement_version, 'status', p_target_status,
                            'deterministicTotal', v_total),
         'score_card_written:' || v_card_id::text
    FROM interview_event WHERE stream_key=v_request.interview_id;

  RETURN QUERY SELECT v_card_id, p_target_status::text, v_total, 1.0, '{}'::jsonb, true;
END $$;
ALTER FUNCTION scoring_write_final_score_card(uuid,uuid,jsonb,text) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_write_final_score_card(uuid,uuid,jsonb,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_write_final_score_card(uuid,uuid,jsonb,text) TO scoring_worker_executor;

-- ── ③ C 端只读聚合（只消费可评分态卡；legacy answer_evaluated.score 结构性不参与）─────
CREATE OR REPLACE FUNCTION scoring_aggregate_interview_scores(
  p_interview_id text
) RETURNS TABLE (eligible_card_count bigint, deterministic_overall numeric, non_scoring_card_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_interview_id IS NULL OR length(p_interview_id)=0 THEN
    RAISE EXCEPTION 'scoring_aggregate_invalid' USING ERRCODE='22023';
  END IF;
  -- 只读 score_card（不读 interview_event）：legacy `answer_evaluated.score` 整数事件永远不会被
  -- 计入。可评分态 = practice_eligible/b_review_eligible；非评分态（pending/evidence_*/unscored/
  -- review_required/calibration_blocked）只计数不聚合；无有效可评分卡 → overall = NULL（无分 ≠ 0 分）。
  RETURN QUERY
    SELECT count(*) FILTER (WHERE c.status IN ('practice_eligible','b_review_eligible'))::bigint AS eligible_card_count,
           CASE WHEN count(*) FILTER (WHERE c.status IN ('practice_eligible','b_review_eligible')) = 0
                THEN NULL::numeric
                ELSE round(avg(c.deterministic_total) FILTER (WHERE c.status IN ('practice_eligible','b_review_eligible')))
           END AS deterministic_overall,
           count(*) FILTER (WHERE c.status NOT IN ('practice_eligible','b_review_eligible'))::bigint AS non_scoring_card_count
    FROM score_card c
    WHERE c.owner_user_id = principal AND c.interview_id = p_interview_id
      AND c.status NOT IN ('superseded','fenced');
END $$;
ALTER FUNCTION scoring_aggregate_interview_scores(text) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_aggregate_interview_scores(text) FROM PUBLIC, scoring_worker_executor;
GRANT EXECUTE ON FUNCTION scoring_aggregate_interview_scores(text) TO app_role;

-- C 端逐题读面：只返回可评分态卡（强制消费 isScoreCardScorable，不重实现判定）。
CREATE OR REPLACE FUNCTION scoring_list_scorable_score_cards(
  p_interview_id text
) RETURNS TABLE (card_id uuid, question_id text, rubric_id uuid, deterministic_total numeric, coverage numeric, status text, competency text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_interview_id IS NULL OR length(p_interview_id)=0 THEN
    RAISE EXCEPTION 'scoring_list_invalid' USING ERRCODE='22023';
  END IF;
  -- competency 从 question_rubric（经 rubric_id 钉住）联表带回：C 端逐题能力分组需要它，
  -- 但 question_rubric 是全局内容表未授 app_role，故只读函数在此 SECURITY DEFINER 内联表，
  -- 不扩大 app_role 的基表权限面（owner 作用域仍只由 score_card 的 FORCE RLS 兜底）。
  RETURN QUERY
    SELECT c.id, c.question_id, c.rubric_id, c.deterministic_total, c.coverage, c.status, r.competency
    FROM score_card c
    JOIN question_rubric r ON r.id = c.rubric_id
    WHERE c.owner_user_id = principal AND c.interview_id = p_interview_id
      AND c.status IN ('practice_eligible','b_review_eligible');
END $$;
ALTER FUNCTION scoring_list_scorable_score_cards(text) OWNER TO scoring_definer_owner;
REVOKE CREATE ON SCHEMA public FROM scoring_definer_owner;


REVOKE ALL ON FUNCTION scoring_list_scorable_score_cards(text) FROM PUBLIC, scoring_worker_executor;
GRANT EXECUTE ON FUNCTION scoring_list_scorable_score_cards(text) TO app_role;
