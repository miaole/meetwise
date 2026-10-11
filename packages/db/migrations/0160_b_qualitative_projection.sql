-- 0160_b_qualitative_projection.sql
--
-- I2 B-DELIVERABLE · W2（#218 B 端定性输出·修法三件之二）。
-- REQUEST：ai-docs/delivery/harness/i2-b-deliverable-REQUEST.md（§1 W2 裁定②形 A + 复审约束 E6）。
-- 形制：gateway_entpay_my_offline_orders（0159 首选形）同族受控 SECURITY DEFINER 读函数——
--       score_card 族 RLS=p_owner（0100:267-275·app_role owner 作用域策略键在 app.principal_user），
--       招聘方 principal 会话内物理不可读候选人评分事实（B 端定性投影读取路径此前不存在=真缺口）。
--       本函数以部署车属主角色（0041/0155/0159 gateway 受控函数族同形·迁移运行角色建表属主）为
--       definer 上下文，函数内**显式谓词**承重，Ban 无作用域全表读（0159 Ban-6 同条）。
-- 授权模型（E6 同意门嵌入 DEFINER 函数·Ban 旁路）：函数内自包含同意门——consent_record 按
--       (candidate_owner, purpose='b_qualitative_share') 查无同意行 → 未披露形状（恰一行
--       disclosed=false·Ban 空壳假数据）；有同意行 → 投影白名单。consent_record 建表与 GRANT
--       SELECT,INSERT 同出 0001 迁移运行角色（本函数 definer 同源属主，SELECT 随属主内含）；
--       本文件仍自包含重贴函数 EXECUTE ACL（0156:318-325 / 0041:139-161 纪律·不依赖跨迁移记忆）。
--       非属主部署变体（definer 非 consent_record 属主且 FORCE RLS 生效）下同意行不可读 →
--       门 fail-closed 落未披露形状（宁缺勿漏·零泄漏）。
-- 出参白名单（Ban 数字分列）：disclosed 标记 + terminal_kind（绑定面试两态信号 held/failed·
--       E3 同源口径——B 端状态文案分流承重：interview 为候选人私有（RLS p_owner·0005 by-design
--       隔离墙），招聘方会话内 join 不可达（i2b:prove attempt3 实证全 null），两态信号经本受控
--       函数承接·状态信号非评分非同意门内）+ competency（维度名，来自 question_rubric 冻结
--       rubric·0103:341-343 同源联表形）+ below/meets/exceeds 计数聚合（→强/中/弱·rubric
--       disposition 三值映射 Ban 自造档位·H3 五档零依赖零预支）+ 证据不足计数（非可评分态卡
--       或 coverage<1·可评分态卡 coverage 恒 1.0（0103 铁律2）故 <1 为防御分支）。
--       **无 deterministic_total/score/overall/coverage 数值列**（§5 Ban·结构性出参白名单）。
-- 语义红线（fix-roadmap:117）：仅单申请人自身事实投影——入参 (recruiter, application_id)，
--       owner 谓词 fail-closed（job_application.recruiter_user_id=$1 AND id=$2·0 行即空·
--       与不存在不可区分）；无排序出参无跨申请人面；superseded/fenced 卡不入投影
--       （0103 scoring_aggregate 同款排除）。
-- 投影范围：仅 status='assessment_unavailable' 终态申请（held/failed 两源·与 W1 E3 派生口径
--       同源）；进行中/受邀申请不投影（无既有可复核事实·Ban 部分信号泄漏）。
-- expand-only：仅 CREATE OR REPLACE FUNCTION（全新函数）+ 自包含 REVOKE/GRANT——零表零列
--       零触发器零策略（0100/0103/0158 评分面零字节改·0082 触发器零字节改）。
-- 禁顶层 BEGIN/COMMIT（migrate.ts 硬抛）·SET LOCAL lock_timeout（0156/0157/0159 先例）。
-- 镜像承重墙：packages/db/sql/23_api_gateway.sql 同位追加（函数体+ACL 与本文件逐字节同文·
--       0159 RX-3：23=受控函数族+ACL 镜像住地·i2b:prove 直载比对判据）。

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
