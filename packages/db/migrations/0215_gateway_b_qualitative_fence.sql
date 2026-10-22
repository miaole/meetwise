-- 撤权进入隐私围栏后，这场不再返回能力维度。
-- 未披露返回之后先记下招聘方，临时换成卡的 owner，只读围栏名单，再立刻还原。
-- 命中时标记行已经返回，跳过维度查询。调用出错时先还原，再把同一个错误抛出。
-- SECURITY DEFINER、search_path、lock_timeout 沿 0168。先收回执行权再授予 app_role。

SET LOCAL lock_timeout = '2s';

CREATE OR REPLACE FUNCTION gateway_b_qualitative_projection(
  p_recruiter text,
  p_application_id text
)
RETURNS TABLE(disclosed boolean, terminal_kind text, competency text, strong_count bigint,
              mid_count bigint, weak_count bigint, insufficient_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_owner text;
  v_interview_id text;
  v_kind text;
  v_prev text;
  v_fenced boolean := false;
BEGIN
  -- ① owner 谓词 fail-closed：申请必须存在、属于该招聘方、处于 assessment_unavailable 终态
  --    且绑定面试为两源终态（completed/failed）。不命中 → 0 行返回（与不存在/越权不可区分·
  --    E5 单 id 0 行 fail-closed 同形）。terminal_kind 与 W1 E3 派生口径同源同式。
  SELECT a.candidate_user_id, a.interview_id,
         CASE WHEN i.status='completed' THEN 'held' WHEN i.status='failed' THEN 'failed' END
    INTO v_owner, v_interview_id, v_kind
    FROM public.job_application a
    LEFT JOIN public.interview i ON i.id = a.interview_id
   WHERE a.id = p_application_id
     AND a.recruiter_user_id = p_recruiter
     AND a.status = 'assessment_unavailable'
     AND a.interview_id IS NOT NULL
   LIMIT 1;
  IF NOT FOUND OR v_owner IS NULL OR v_interview_id IS NULL OR v_kind IS NULL THEN
    RETURN;
  END IF;

  -- ② E6 同意门（函数内承重·Ban 旁路）：无 b_qualitative_share 同意行 → disclosed=false（未披露
  --    形状·Ban 假定性输出）；有同意行 → disclosed=true 投影白名单。同意门只门定性投影——
  --    terminal_kind 两态状态信号在门内外恒可用（W3④ 状态分流承接·非评分非摘录）。
  disclosed := EXISTS (
    SELECT 1 FROM public.consent_record cr
     WHERE cr.owner_user_id = v_owner
       AND cr.purpose = 'b_qualitative_share'
  );
  -- ③ 投影白名单。首行恒为属主标记行（competency 恒 NULL·terminal_kind 恒两态信号；供调用方判定：
  --    0 行=非属主/非终态；disclosed=false=未同意；disclosed=true=已披露·维度行随后·仅标记行=暂无
  --    可复核评估记录）。维度行：rubric disposition 三值计数聚合（exceeds→强/meets→中/below→弱）
  --    + 证据不足计数（非可评分态卡或 coverage<1 的证据行·LEFT JOIN 使无分项的非可评分卡亦计 1）。
  --    superseded/fenced 卡整卡不入（0103 scoring_aggregate 排除同款）；Ban 数字分列：
  --    deterministic_total/score/overall/coverage 数值不出参。
  terminal_kind := v_kind;
  competency := NULL; strong_count := NULL; mid_count := NULL; weak_count := NULL; insufficient_count := NULL;
  RETURN NEXT;
  IF NOT disclosed THEN
    RETURN;
  END IF;
  -- 未披露返回之后：记下招聘方，临时换成卡 owner，只读围栏名单，立刻还原。
  -- 出错时先还原成换身份之前的招聘方，再抛出同一个错误。命中则跳过维度查询，标记行已返回。
  v_prev := current_setting('app.principal_user', true);
  BEGIN
    PERFORM set_config('app.principal_user', v_owner, true);
    v_fenced := EXISTS (
      SELECT 1 FROM public.interview_privacy_fenced_targets() AS t
       WHERE t.thread_id = v_interview_id
    );
    PERFORM set_config('app.principal_user', COALESCE(v_prev, ''), true);
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM set_config('app.principal_user', COALESCE(v_prev, ''), true);
      RAISE;
  END;
  PERFORM set_config('app.principal_user', COALESCE(v_prev, ''), true);
  IF v_fenced THEN
    RETURN;
  END IF;
  RETURN QUERY
    WITH facts AS (
      SELECT r.competency AS comp,
             (cc.status IN ('practice_eligible','b_review_eligible') AND cc.coverage >= 1) AS scorable_ok,
             c.disposition AS disp
        FROM public.score_card cc
        JOIN public.question_rubric r ON r.id = cc.rubric_id
        LEFT JOIN public.score_card_criterion c ON c.card_id = cc.id
       WHERE cc.owner_user_id = v_owner
         AND cc.interview_id = v_interview_id
         AND cc.status NOT IN ('superseded','fenced')
    )
    SELECT true, v_kind, comp,
           count(*) FILTER (WHERE scorable_ok AND disp = 'exceeds'),
           count(*) FILTER (WHERE scorable_ok AND disp = 'meets'),
           count(*) FILTER (WHERE scorable_ok AND disp = 'below'),
           count(*) FILTER (WHERE NOT scorable_ok)
      FROM facts
     WHERE comp IS NOT NULL
     GROUP BY comp
     ORDER BY comp;
END;
$$;

REVOKE ALL ON FUNCTION gateway_b_qualitative_projection(text, text) FROM PUBLIC, app_role, app_gateway_role;
GRANT EXECUTE ON FUNCTION gateway_b_qualitative_projection(text, text) TO app_role;
