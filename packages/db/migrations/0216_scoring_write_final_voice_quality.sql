-- 终态写卡增加五参数重载。四参数函数保留，列默认值不改。
-- 第五参没有默认值，只允许 ok、low、unavailable，非法值抛错。
-- 插入时显式写入 uncertainty_voice_quality。CAS、总分、证据和事件与四参数函数一致。

CREATE OR REPLACE FUNCTION scoring_write_final_score_card(
  p_request_id uuid,
  p_lease_token uuid,
  p_evidence jsonb,
  p_target_status text,
  p_voice_quality text
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
     OR p_target_status IS NULL OR p_target_status NOT IN ('practice_eligible','b_review_eligible')
     OR p_voice_quality IS NULL OR p_voice_quality NOT IN ('ok','low','unavailable') THEN
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
    deterministic_total, coverage, uncertainty, status, provenance, uncertainty_voice_quality)
  SELECT principal, v_request.interview_id, v_contract.question_id, v_request.artifact_id, v_request.submission_id,
    p_request_id, v_request.issued_contract_id, v_contract.rubric_id, r.rubric_version, v_contract.measurement_version,
    v_total, 1.0, '{}'::jsonb, p_target_status,
    jsonb_build_object('writer','scoring_write_final_score_card','scor','SCOR-02'),
    p_voice_quality
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
ALTER FUNCTION scoring_write_final_score_card(uuid,uuid,jsonb,text,text) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_write_final_score_card(uuid,uuid,jsonb,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION scoring_write_final_score_card(uuid,uuid,jsonb,text,text) TO scoring_worker_executor;
