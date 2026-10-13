-- 0161_practice_only_read_narrowing.sql — G5 SCOR-S3 · ADR-0020 :54 目标态落地：C 端只读面收窄为 practice_eligible 单态。
--
-- 收法形制（REQUEST g5-scor-s3 §1 行1 · D1 EXEC 落卷）：仅 CREATE OR REPLACE 重写 0103 的两个只读函数
--（scoring_aggregate_interview_scores / scoring_list_scorable_score_cards），list 与 aggregate 同刀同收
--（Ban 单函数收窄造成评估与逐题面资格口径分裂）。0103 原文为已落历史件零字节零触；已落迁移零重写铁律不破。
--
-- 语义（ADR-0020 :54 亲证原文）：「目标：只有 practice_eligible 可用于 C 端本轮练习反馈。」
-- b_review_eligible 是 B 端评审态（进入条件 = CalibrationRelease + 人工复核，ADR :57，本迁移零授权/零松动），
-- 自本迁移起不再进入 C 端读面与 C 端聚合；写路径/状态机/SCORE_CARD_STATUSES 十态枚举零触
--（scoring_write_final_score_card 仍可按原语义写双态，本迁移不改任何写函数）。
--
-- 非评分态口径（收窄后）：pending_evidence/evidence_valid/evidence_invalid/unscored/review_required/
-- calibration_blocked/b_review_eligible 均不计入 eligible_card_count / deterministic_overall，
-- 且（除 superseded/fenced 外）计入 non_scoring_card_count——无分 ≠ 0 分语义原值保持。
-- 权限四件套沿 0103 同族原值保持：OWNER scoring_definer_owner / REVOKE PUBLIC,scoring_worker_executor /
-- GRANT EXECUTE app_role（C 端只读，owner 作用域由 score_card FORCE RLS 兜底）。

-- ── ① C 端只读聚合（收窄：可评分态 = practice_eligible 单态）──────────────────────────
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
  -- 计入。可评分态 = practice_eligible（0161 收窄，ADR-0020 :54 目标态；b_review_eligible 归 B 端
  -- 评审面不入 C 端聚合）；非评分态只计数不聚合；无有效可评分卡 → overall = NULL（无分 ≠ 0 分）。
  RETURN QUERY
    SELECT count(*) FILTER (WHERE c.status = 'practice_eligible')::bigint AS eligible_card_count,
           CASE WHEN count(*) FILTER (WHERE c.status = 'practice_eligible') = 0
                THEN NULL::numeric
                ELSE round(avg(c.deterministic_total) FILTER (WHERE c.status = 'practice_eligible'))
           END AS deterministic_overall,
           count(*) FILTER (WHERE c.status <> 'practice_eligible')::bigint AS non_scoring_card_count
    FROM score_card c
    WHERE c.owner_user_id = principal AND c.interview_id = p_interview_id
      AND c.status NOT IN ('superseded','fenced');
END $$;
ALTER FUNCTION scoring_aggregate_interview_scores(text) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_aggregate_interview_scores(text) FROM PUBLIC, scoring_worker_executor;
GRANT EXECUTE ON FUNCTION scoring_aggregate_interview_scores(text) TO app_role;

-- ── ② C 端逐题读面（收窄：只返回 practice_eligible 卡）────────────────────────────────
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
  -- 0161 收窄：只返回 practice_eligible（ADR-0020 :54；b_review_eligible 不入 C 端逐题读面）。
  RETURN QUERY
    SELECT c.id, c.question_id, c.rubric_id, c.deterministic_total, c.coverage, c.status, r.competency
    FROM score_card c
    JOIN question_rubric r ON r.id = c.rubric_id
    WHERE c.owner_user_id = principal AND c.interview_id = p_interview_id
      AND c.status = 'practice_eligible';
END $$;
ALTER FUNCTION scoring_list_scorable_score_cards(text) OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION scoring_list_scorable_score_cards(text) FROM PUBLIC, scoring_worker_executor;
GRANT EXECUTE ON FUNCTION scoring_list_scorable_score_cards(text) TO app_role;
