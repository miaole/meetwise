-- 0144_db_trigfam_unify.sql
--
-- DBTF-1 · GAP-DEBT-DB-TRIGFAM（P0 · W2 首刀）· 触发器函数族收敛：公共函数库单一真相源。
-- REQUEST：ai-docs/delivery/harness/db-trigfam-unify.md（commit b80ec6a8）+ slice + 双 stub。
-- 双审 BOTH PASS（裁定经协调方带外转达）：D1=案B（public `tf_` 前缀库）· D2=U（状态机统一=0082
-- 终端语义 + 表驱动）· D4=保留（ai_cost 弃用旧签 7/4/8 参原样不动）· D5=改裁双参
-- `interview_derived_score(owner_user_id, stream_key)`（stream_key 无全局唯一 · 单参非等价）·
-- D6=引入规则表 · D7=P5 复跑清单足量 · D8=partial_confirmed 只保形。
--
-- 两席处方（EXEC 铁则，逐条落实）：
--   (1) 薄壳逐字重声明 SECURITY DEFINER + SET 子句 —— 实证（PG16 亲测 @ 2026-10-07）：
--       CREATE OR REPLACE 若省略 SECURITY/SET 子句会把 prosecdef 重置为 f、proconfig 清空；
--       owner 与 ACL 自动保留（不需重跑 GRANT/REVOKE）。
--   (2) 薄壳对库的调用一律 `public.tf_` 前缀限定，不依赖 search_path 解析。
--   (3) base 双 0143 排序（亲核 migrate.ts loadMigrations/canonicalMigrations ·
--       version=文件名 localeCompare）：0143_db_id_v7_unify → 0143_sse_push_notify → 本文件。
--   (4) N1 勘误（REQUEST §1.2-①/附录A）：enforce_interview_job_resume_reference 真链为
--       0054:16 → 0064:108（REQUEST 误记 0049·0064；0049 无此函数）；同名重贴多余份 78→77。
--
-- 收敛纪律（对表 GAP-DEBT-DB-TRIGFAM 目标「单一真相源+变更走 ALTER/版本化」）：
--   * 历史迁移 0001–0143 零字节改动（append-only；6 处 round(avg) 副本与既有重贴永久留档）。
--   * 100 个触发器挂接点零变：本文件零 CREATE/DROP TRIGGER；只对 12 个终端函数体换来源
--     （名/schema/签名/SECURITY DEFINER/proconfig/owner/ACL 全保形，prove P1 catalog 差分断言）。
--   * 0046:162-166 partial_confirmed 张力面（GAP-COMM-PARTIAL-PAIR 在册）逐字节保形，不裁决。
--   * 0082 校准冻结不解：数值完成仍被 DB 阻断；interview_derived_score 为休眠预注册件，不接线。
--
-- 库纪律：
--   * `tf_` = trigger-family 公共库（public 前缀命名约定 · 单一真相源；grep 'FUNCTION tf_' 即清单）。
--   * ACL 镜像终端函数（保形优先）：0073:1342 起 `ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON
--     FUNCTIONS FROM PUBLIC`（迁移角色）使新建函数默认 owner-only——簇① 终端为 INVOKER/PUBLIC
--     默认 ACL（0028/0046/0054/0064 时代早于 0073），故其库成员须显式 GRANT EXECUTE TO PUBLIC
--     才与终端可达面全等（N2 注记：REQUEST §2.1「库成员一律 REVOKE PUBLIC」按两席保形处方修正
--     为 ACL 镜像，否则 app_role 经触发器路径不可达库成员——亲测 permission denied 复现）；
--     SD 终端的库成员保持 owner-only（只在 SD 薄壳内以 definer=owner 身份被执行）。
--   * 唯一 SD 库成员：tf_assert_job_application_transition（读 owner-only 规则表，避免任何
--     新 GRANT —— N3 注记，P7 形状门在案）。
--   * 演进规则冻结（0144 起）：Ban 对既有函数名全量重贴体；演进走 ALTER FUNCTION（SET/OWNER，
--     0139 先例）或新名版本化（_v2）或本库内实现变更；新 sink/work/definer 成员改库内枚举，
--     不再复制宿主函数。

-- ═══════════════════════════════════════════════════════════════════════════
-- §1 状态机表驱动（D2=U · D6）：0082 终端合法迁移闭包 = 唯一真相源种子。
--    默认拒：表内无 (from,to) 行 ⇒ 非法迁移 ⇒ raise job_application_status_transition_invalid。
--    治理内部表：非 app API；无 RLS 面新增（仅经 SD 库成员读取）。
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.job_application_transition_rule (
  from_status text NOT NULL,
  to_status text NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  guard_kind text NOT NULL DEFAULT '',
  CONSTRAINT job_application_transition_rule_pk PRIMARY KEY (from_status, to_status),
  CONSTRAINT job_application_transition_rule_allowed_only CHECK (allowed)
);

INSERT INTO public.job_application_transition_rule(from_status, to_status, allowed, guard_kind) VALUES
  ('invited', 'in_progress', true, 'initial_start_requires_attempt_one'),
  ('invited', 'declined', true, 'candidate_decline'),
  ('in_progress', 'assessment_unavailable', true, 'terminal_hold_no_calibrated_score'),
  ('assessment_unavailable', 'in_progress', true, 'recovery_requires_next_bound_attempt'),
  ('completed', 'assessment_unavailable', true, 'historical_completion_quarantine')
ON CONFLICT (from_status, to_status) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- §2 簇①：job_app/interview 状态机族（0028→0046→0051→0082 · 4 代重抄收敛）
-- 终端语义=0082（数值完成禁止 · 历史完成隔离 · score 冻结 until_calibrated）。
-- ═══════════════════════════════════════════════════════════════════════════

-- §2.1 迁移合法性断言（表驱动）。SD 例外（N3）：读 owner-only 规则表且零新 GRANT。
CREATE FUNCTION public.tf_assert_job_application_transition(
  p_old_status text,
  p_new_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_new_status IS DISTINCT FROM p_old_status
     AND NOT EXISTS (
       SELECT 1 FROM public.job_application_transition_rule rule
        WHERE rule.from_status = p_old_status
          AND rule.to_status = p_new_status
     ) THEN
    RAISE EXCEPTION 'job_application_status_transition_invalid';
  END IF;
END;
$$;

-- §2.2 enforce_job_application_interview_binding 终端体（0082:29-117 逐字迁移 ·
--      仅 NEW/OLD→p_new/p_old 改名 + 状态迁移轴换表驱动 PERFORM）。
CREATE FUNCTION public.tf_enforce_job_application_binding(
  p_old public.job_application,
  p_new public.job_application
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_new.interview_id IS DISTINCT FROM p_old.interview_id THEN
    IF p_old.interview_id IS NOT NULL
       AND NOT (p_old.status='assessment_unavailable' AND p_new.status='in_progress') THEN
      RAISE EXCEPTION 'job_application_interview_binding_immutable';
    END IF;
    PERFORM 1 FROM interview i
      WHERE i.id=p_new.interview_id
        AND i.application_id=p_new.id
        AND i.application_attempt=p_new.interview_attempt
        AND i.job_id=p_new.job_id
        AND i.resume_id=p_new.resume_id
        AND i.owner_user_id=p_new.candidate_user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'job_application_interview_binding_invalid'; END IF;
  END IF;

  IF p_new.interview_attempt IS DISTINCT FROM p_old.interview_attempt
     AND NOT (
       (p_old.status='invited' AND p_new.status='in_progress'
        AND p_old.interview_id IS NULL AND p_new.interview_id IS NOT NULL
        AND p_new.interview_attempt=1)
       OR
       (p_old.status='assessment_unavailable' AND p_new.status='in_progress'
        AND p_new.interview_id IS DISTINCT FROM p_old.interview_id
        AND p_new.interview_attempt=p_old.interview_attempt+1)
     ) THEN
    RAISE EXCEPTION 'job_application_attempt_mutation_invalid';
  END IF;

  PERFORM public.tf_assert_job_application_transition(p_old.status, p_new.status);

  IF p_new.status='in_progress' THEN
    IF p_old.status='assessment_unavailable' AND (
      p_new.interview_id IS NOT DISTINCT FROM p_old.interview_id
      OR p_new.interview_attempt <> p_old.interview_attempt + 1
    ) THEN
      RAISE EXCEPTION 'job_application_recovery_requires_next_bound_attempt';
    END IF;
    IF p_old.status='invited' AND p_new.interview_attempt <> 1 THEN
      RAISE EXCEPTION 'job_application_initial_start_requires_attempt_one';
    END IF;
    PERFORM 1 FROM interview i
      WHERE i.id=p_new.interview_id
        AND i.application_id=p_new.id
        AND i.application_attempt=p_new.interview_attempt
        AND i.job_id=p_new.job_id
        AND i.resume_id=p_new.resume_id
        AND i.owner_user_id=p_new.candidate_user_id
        AND i.status IN ('created','active');
    IF NOT FOUND THEN RAISE EXCEPTION 'job_application_start_requires_bound_interview'; END IF;
  END IF;

  -- B-side numeric completion is deliberately unavailable until a calibrated
  -- ScoreCard contract exists.  This also blocks raw SQL from restoring the
  -- previous average-of-LLM-scores behaviour.
  IF p_new.status='completed' AND p_old.status <> 'completed' THEN
    RAISE EXCEPTION 'job_application_score_calibration_required';
  ELSIF p_new.status='assessment_unavailable' AND p_old.status <> 'assessment_unavailable' THEN
    PERFORM 1
      FROM interview i
     WHERE i.id=p_new.interview_id
       AND i.application_id=p_new.id
       AND i.application_attempt=p_new.interview_attempt
       AND i.job_id=p_new.job_id
       AND i.resume_id=p_new.resume_id
       AND i.owner_user_id=p_new.candidate_user_id
       AND i.status IN ('failed','completed');
    IF NOT FOUND OR p_new.score IS NOT NULL THEN
      RAISE EXCEPTION 'job_application_assessment_unavailable_requires_bound_interview';
    END IF;
  ELSIF p_new.score IS DISTINCT FROM p_old.score THEN
    RAISE EXCEPTION 'job_application_score_immutable_until_calibrated';
  END IF;
END;
$$;

-- 薄壳：体来源换库（触发器挂接点零变 · INVOKER/无 proconfig/PUBLIC ACL 保形）。
CREATE OR REPLACE FUNCTION enforce_job_application_interview_binding()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.tf_enforce_job_application_binding(OLD, NEW);
  RETURN NEW;
END;
$$;

-- §2.3 finalize_bound_job_application_on_interview_completion 终端体（0082:9-27 逐字）。
CREATE FUNCTION public.tf_finalize_bound_job_application(
  p_old public.interview,
  p_new public.interview
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_new.status <> 'completed' OR p_old.status = 'completed' OR p_new.application_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE job_application ja
     SET score=NULL, status='assessment_unavailable', version=version+1
   WHERE ja.id=p_new.application_id
     AND ja.interview_id=p_new.id
     AND ja.interview_attempt=p_new.application_attempt
     AND ja.job_id=p_new.job_id
     AND ja.resume_id=p_new.resume_id
     AND ja.candidate_user_id=p_new.owner_user_id
     AND ja.status='in_progress';
END;
$$;

CREATE OR REPLACE FUNCTION finalize_bound_job_application_on_interview_completion()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.tf_finalize_bound_job_application(OLD, NEW);
  RETURN NEW;
END;
$$;

-- §2.4 enforce_interview_application_binding_immutable 终端体（0064:45-99 逐字 ·
--      INSERT 分支保留 · OLD 在 INSERT 时为 NULL 复合值，分支不触）。
CREATE FUNCTION public.tf_interview_application_binding_immutable(
  p_op text,
  p_old public.interview,
  p_new public.interview
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_op='INSERT' THEN
    IF (p_new.resume_id IS NULL) <> (p_new.resume_privacy_epoch IS NULL) THEN
      RAISE EXCEPTION 'interview_resume_epoch_pair_required' USING ERRCODE='P0001';
    END IF;
    IF p_new.resume_id IS NOT NULL THEN
      PERFORM 1
        FROM resume r
       WHERE r.id=p_new.resume_id
         AND r.owner_user_id=p_new.owner_user_id
         AND r.status='ingested'
         AND r.privacy_epoch=p_new.resume_privacy_epoch;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'interview_resume_epoch_not_active_or_mismatched' USING ERRCODE='P0001';
      END IF;
    END IF;
    RETURN;
  END IF;

  IF p_new.application_id IS DISTINCT FROM p_old.application_id
     OR p_new.job_id IS DISTINCT FROM p_old.job_id
     OR p_new.application_attempt IS DISTINCT FROM p_old.application_attempt THEN
    RAISE EXCEPTION 'interview_application_binding_immutable' USING ERRCODE='P0001';
  END IF;

  IF p_new.resume_id IS DISTINCT FROM p_old.resume_id
     OR p_new.resume_privacy_epoch IS DISTINCT FROM p_old.resume_privacy_epoch THEN
    IF NOT (
      p_old.application_id IS NULL
      AND p_new.application_id IS NULL
      AND p_old.resume_id IS NULL
      AND p_old.resume_privacy_epoch IS NULL
      AND p_new.resume_id IS NOT NULL
      AND p_new.resume_privacy_epoch IS NOT NULL
      AND p_old.status='created'
    ) THEN
      RAISE EXCEPTION 'interview_resume_binding_immutable' USING ERRCODE='P0001';
    END IF;
    PERFORM 1
      FROM resume r
     WHERE r.id=p_new.resume_id
       AND r.owner_user_id=p_new.owner_user_id
       AND r.status='ingested'
       AND r.privacy_epoch=p_new.resume_privacy_epoch;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'interview_resume_epoch_not_active_or_mismatched' USING ERRCODE='P0001';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.tf_interview_application_binding_immutable(TG_OP, OLD, NEW);
  RETURN NEW;
END;
$$;

-- §2.5 enforce_interview_job_resume_reference 终端体（0064:108-172 逐字 · N1 勘误链 0054→0064）。
CREATE FUNCTION public.tf_interview_job_resume_reference(
  p_op text,
  p_old public.interview_job,
  p_new public.interview_job
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_op='INSERT' AND p_new.reference_schema_version IS DISTINCT FROM 64 THEN
    RAISE EXCEPTION 'interview_job_legacy_reference_insert_forbidden' USING ERRCODE='P0001';
  END IF;

  IF p_op='UPDATE' AND (
    p_new.owner_user_id IS DISTINCT FROM p_old.owner_user_id
    OR p_new.interview_id IS DISTINCT FROM p_old.interview_id
    OR p_new.kind IS DISTINCT FROM p_old.kind
    OR p_new.resume_id IS DISTINCT FROM p_old.resume_id
    OR p_new.resume_privacy_epoch IS DISTINCT FROM p_old.resume_privacy_epoch
    OR (
      p_new.reference_schema_version IS DISTINCT FROM p_old.reference_schema_version
      AND NOT (p_old.reference_schema_version IS NULL AND p_new.reference_schema_version=49)
    )
  ) THEN
    RAISE EXCEPTION 'interview_job_reference_immutable' USING ERRCODE='P0001';
  END IF;

  IF p_new.reference_schema_version=64 THEN
    IF p_new.kind='start'
       AND (p_new.resume_id IS NULL OR p_new.resume_privacy_epoch IS NULL) THEN
      RAISE EXCEPTION 'interview_job_start_resume_epoch_required' USING ERRCODE='P0001';
    END IF;
    IF p_new.kind='answer'
       AND (p_new.resume_id IS NOT NULL OR p_new.resume_privacy_epoch IS NULL) THEN
      RAISE EXCEPTION 'interview_job_answer_resume_locator_or_epoch_invalid' USING ERRCODE='P0001';
    END IF;

    PERFORM 1
      FROM interview i
      JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
     WHERE i.id=p_new.interview_id
       AND i.owner_user_id=p_new.owner_user_id
       AND i.resume_id IS NOT NULL
       AND i.resume_privacy_epoch IS NOT NULL
       AND r.status='ingested'
       AND r.privacy_epoch=i.resume_privacy_epoch
       AND (
         (p_new.kind='start'
          AND p_new.resume_id=i.resume_id
          AND p_new.resume_privacy_epoch=i.resume_privacy_epoch)
         OR
         (p_new.kind='answer'
          AND p_new.resume_id IS NULL
          AND p_new.resume_privacy_epoch=i.resume_privacy_epoch
          AND EXISTS (
            SELECT 1
              FROM interview_job s
             WHERE s.owner_user_id=p_new.owner_user_id
               AND s.interview_id=p_new.interview_id
               AND s.kind='start'
               AND s.reference_schema_version=64
               AND s.resume_id=i.resume_id
               AND s.resume_privacy_epoch=i.resume_privacy_epoch
               AND s.status IN ('queued','running','done')
          ))
       );
    IF NOT FOUND THEN
      RAISE EXCEPTION 'interview_job_v64_parent_resume_mismatch' USING ERRCODE='P0001';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_interview_job_resume_reference()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.tf_interview_job_resume_reference(TG_OP, OLD, NEW);
  RETURN NEW;
END;
$$;

-- §2.6 enforce_interview_consumption_terminal_pair 终端体（0046:144-173 逐字 ·
--      partial_confirmed 张力面保形：completed 只配 confirmed · GAP-COMM-PARTIAL-PAIR 在册另裁）。
CREATE FUNCTION public.tf_interview_consumption_terminal_pair(
  p_old public.interview,
  p_new public.interview
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  consumption_status text;
BEGIN
  IF p_new.status NOT IN ('completed', 'abandoned', 'failed') THEN
    RETURN;
  END IF;

  SELECT status INTO consumption_status
    FROM entitlement_consumption
   WHERE owner_user_id=p_new.owner_user_id AND idempotency_key=p_new.id
   LIMIT 1;
  IF consumption_status IS NULL THEN
    RETURN;
  END IF;

  IF p_new.status='completed' AND consumption_status <> 'confirmed' THEN
    RAISE EXCEPTION 'invalid_interview_consumption_pair: completed requires confirmed, got %', consumption_status
      USING ERRCODE='23514';
  END IF;
  IF p_new.status IN ('abandoned','failed') AND consumption_status <> 'released' THEN
    RAISE EXCEPTION 'invalid_interview_consumption_pair: % requires released, got %', p_new.status, consumption_status
      USING ERRCODE='23514';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_interview_consumption_terminal_pair()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.tf_interview_consumption_terminal_pair(OLD, NEW);
  RETURN NEW;
END;
$$;

-- 簇① 库成员可达面镜像（终端 PUBLIC 默认 ACL 的全等复刻；0073 默认 REVOKE 的显式反制）。
GRANT EXECUTE ON FUNCTION public.tf_assert_job_application_transition(text, text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_enforce_job_application_binding(public.job_application, public.job_application) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_finalize_bound_job_application(public.interview, public.interview) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_interview_application_binding_immutable(text, public.interview, public.interview) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_interview_job_resume_reference(text, public.interview_job, public.interview_job) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_interview_consumption_terminal_pair(public.interview, public.interview) TO PUBLIC;

-- ═══════════════════════════════════════════════════════════════════════════
-- §3 interview_derived_score（D5 双参 · 休眠预注册件 · 不接线任何触发器）
-- 体=0051 终代公式（含 BETWEEN 0 AND 100 资格线）· RLS 按 caller 生效（INVOKER）。
-- 0028/0046（无资格线变体）与 0051 的分歧点见 harness §2.3 差异表存档。
-- ═══════════════════════════════════════════════════════════════════════════
CREATE FUNCTION public.interview_derived_score(
  p_owner_user_id text,
  p_stream_key text
) RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT round(avg((e.payload->>'score')::numeric))::int
    FROM interview_event e
   WHERE e.owner_user_id=p_owner_user_id AND e.stream_key=p_stream_key AND e.kind='answer_evaluated'
     AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'
     AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\.[0-9]+)?$'
     AND (e.payload->>'score')::numeric BETWEEN 0 AND 100
$$;
REVOKE ALL ON FUNCTION public.interview_derived_score(text, text) FROM PUBLIC;

-- ═══════════════════════════════════════════════════════════════════════════
-- §4 簇②：ai_cost_reserve/settle 文本族（0033→0034→0035→0036→0083 · 4 代重抄收敛）
-- 只收敛活签面：9 参 reserve_text 链 + reconcile 标记；弃用旧签（7/4/8 参）按 D4 原样保留。
-- ═══════════════════════════════════════════════════════════════════════════

-- §4.1 9 参 reserve 主体（0083:8-127 逐字）。
CREATE FUNCTION public.tf_ai_cost_reserve_text(
  p_scope_id text, p_request_owner text, p_idempotency_key text,
  p_provider text, p_model text, p_region text, p_price_revision text,
  p_input_tokens integer, p_output_tokens integer
)
RETURNS TABLE(decision text, reserved_micro_cny bigint, price_revision text)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  policy ai_cost_budget_policy%ROWTYPE;
  budget ai_cost_budget_month%ROWTYPE;
  prior ai_cost_reservation%ROWTYPE;
  price ai_cost_price_book%ROWTYPE;
  period text := to_char(clock_timestamp() AT TIME ZONE 'UTC', 'YYYY-MM');
  reserve_cost bigint;
BEGIN
  IF p_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$' OR p_request_owner IS NULL OR char_length(p_request_owner) NOT BETWEEN 1 AND 512
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_provider IS NULL OR p_provider !~ '^[A-Za-z0-9._-]{1,80}$'
    OR p_model IS NULL OR p_model !~ '^[A-Za-z0-9._:-]{1,160}$'
    OR p_region IS NULL OR p_region !~ '^[A-Za-z0-9._-]{1,80}$'
    OR p_price_revision IS NULL OR p_price_revision !~ '^[A-Za-z0-9._:-]{1,80}$'
    OR p_input_tokens IS NULL OR p_output_tokens IS NULL
    OR p_input_tokens < 0 OR p_input_tokens > 1000000
    OR p_output_tokens < 0 OR p_output_tokens > 1000000
    OR p_input_tokens + p_output_tokens < 1 THEN
    RAISE EXCEPTION 'ai_cost_invalid_text_reservation_input' USING ERRCODE='check_violation';
  END IF;

  SELECT * INTO policy FROM ai_cost_budget_policy WHERE scope_id=p_scope_id FOR UPDATE;
  IF NOT FOUND OR NOT policy.enabled THEN
    RETURN QUERY SELECT 'policy_missing'::text, 0::bigint, NULL::text;
    RETURN;
  END IF;

  SELECT * INTO prior FROM ai_cost_reservation WHERE scope_id=p_scope_id AND idempotency_key=p_idempotency_key FOR UPDATE;
  IF FOUND THEN
    IF prior.request_owner_user_id <> p_request_owner THEN
      RAISE EXCEPTION 'ai_cost_reservation_owner_mismatch' USING ERRCODE='insufficient_privilege';
    END IF;
    -- A replay may observe the existing immutable reservation, but it must not
    -- present a newly configured model/rate/token envelope under the same key.
    IF prior.provider <> p_provider OR prior.model <> p_model OR prior.region <> p_region
      OR prior.price_revision <> p_price_revision
      OR prior.input_tokens_reserved <> p_input_tokens
      OR prior.output_tokens_reserved <> p_output_tokens THEN
      RETURN QUERY SELECT 'binding_mismatch'::text, 0::bigint, prior.price_revision;
      RETURN;
    END IF;
    RETURN QUERY SELECT
      CASE prior.status WHEN 'reserved' THEN 'held' WHEN 'dispatching' THEN 'unknown'
                        WHEN 'unknown' THEN 'unknown' WHEN 'settled' THEN 'settled' ELSE 'released' END,
      prior.reserved_micro_cny, prior.price_revision;
    RETURN;
  END IF;

  SELECT * INTO price FROM ai_cost_price_book
   WHERE provider=p_provider AND model=p_model AND region=p_region AND revision=p_price_revision
     AND effective_at <= clock_timestamp();
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'price_missing'::text, 0::bigint, NULL::text;
    RETURN;
  END IF;
  reserve_cost :=
    CEIL(p_input_tokens::numeric * price.input_micro_cny_per_million::numeric / 1000000::numeric)::bigint
    + CEIL(p_output_tokens::numeric * price.output_micro_cny_per_million::numeric / 1000000::numeric)::bigint;

  INSERT INTO ai_cost_budget_month(scope_id,period_key,limit_micro_cny)
  VALUES (p_scope_id,period,policy.monthly_limit_micro_cny)
  ON CONFLICT (scope_id,period_key) DO NOTHING;
  SELECT * INTO budget FROM ai_cost_budget_month WHERE scope_id=p_scope_id AND period_key=period FOR UPDATE;
  IF budget.reserved_micro_cny + budget.settled_micro_cny + reserve_cost > budget.limit_micro_cny THEN
    RETURN QUERY SELECT 'budget_exhausted'::text, reserve_cost, price.revision;
    RETURN;
  END IF;

  UPDATE ai_cost_budget_month AS m SET reserved_micro_cny=m.reserved_micro_cny+reserve_cost,version=m.version+1,updated_at=clock_timestamp()
   WHERE m.scope_id=p_scope_id AND m.period_key=period;
  INSERT INTO ai_cost_reservation(
    scope_id,request_owner_user_id,idempotency_key,provider,model,region,price_revision,period_key,
    input_tokens_reserved,output_tokens_reserved,input_micro_cny_per_million,output_micro_cny_per_million,
    reserved_micro_cny,status
  ) VALUES (
    p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,p_price_revision,period,
    p_input_tokens,p_output_tokens,price.input_micro_cny_per_million,price.output_micro_cny_per_million,
    reserve_cost,'reserved'
  );
  RETURN QUERY SELECT 'reserved'::text, reserve_cost, p_price_revision;
END;
$$;
REVOKE ALL ON FUNCTION public.tf_ai_cost_reserve_text(text,text,text,text,text,text,text,integer,integer) FROM PUBLIC;

-- 薄壳（逐字重声明 SD+SET · 防 proconfig/prosecdef 重置 · ACL/owner 自动保留）。
CREATE OR REPLACE FUNCTION ai_cost_reserve_text(
  p_scope_id text, p_request_owner text, p_idempotency_key text,
  p_provider text, p_model text, p_region text, p_price_revision text,
  p_input_tokens integer, p_output_tokens integer
)
RETURNS TABLE(decision text, reserved_micro_cny bigint, price_revision text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.tf_ai_cost_reserve_text(
    p_scope_id, p_request_owner, p_idempotency_key,
    p_provider, p_model, p_region, p_price_revision,
    p_input_tokens, p_output_tokens);
END;
$$;

-- §4.2 9 参 scoped 闸门（0083:134-143 逐字 · 保持 _scoped → reserve_text 委托链）。
CREATE OR REPLACE FUNCTION ai_cost_reserve_text_scoped(
  p_scope_id text,p_request_owner text,p_idempotency_key text,p_provider text,p_model text,p_region text,p_price_revision text,p_input_tokens integer,p_output_tokens integer
)
RETURNS TABLE(decision text,reserved_micro_cny bigint,price_revision text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  RETURN QUERY SELECT * FROM ai_cost_reserve_text(p_scope_id,p_request_owner,p_idempotency_key,p_provider,p_model,p_region,p_price_revision,p_input_tokens,p_output_tokens);
END;
$$;

-- §4.3 reconcile 标记（0057:43-80 逐字 · require_owner 闸门留壳内）。
CREATE FUNCTION public.tf_ai_cost_mark_unknown_for_model_reconcile(
  p_scope_id text,
  p_request_owner text,
  p_idempotency_key text,
  p_reason text
) RETURNS integer
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE changed integer;
BEGIN
  IF p_scope_id IS NULL OR p_scope_id !~ '^[A-Za-z0-9._:-]{1,160}$'
    OR p_idempotency_key IS NULL OR char_length(p_idempotency_key) NOT BETWEEN 1 AND 256
    OR p_reason IS NULL OR p_reason !~ '^[A-Za-z0-9._:-]{1,120}$' THEN
    RAISE EXCEPTION 'ai_cost_model_reconcile_invalid_input' USING ERRCODE='check_violation';
  END IF;
  UPDATE ai_cost_reservation
     SET status='unknown', reason_code=p_reason, updated_at=clock_timestamp()
   WHERE scope_id=p_scope_id
     AND request_owner_user_id=p_request_owner
     AND idempotency_key=p_idempotency_key
     AND status='dispatching';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'ai_cost_model_reconcile_state' USING ERRCODE='integrity_constraint_violation';
  END IF;
  RETURN changed;
END;
$$;
REVOKE ALL ON FUNCTION public.tf_ai_cost_mark_unknown_for_model_reconcile(text,text,text,text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION ai_cost_mark_unknown_for_model_reconcile_scoped(
  p_scope_id text,
  p_request_owner text,
  p_idempotency_key text,
  p_reason text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM ai_cost_require_request_owner(p_request_owner);
  RETURN public.tf_ai_cost_mark_unknown_for_model_reconcile(p_scope_id, p_request_owner, p_idempotency_key, p_reason);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- §5 簇③-a：qbank_generation_ann_search（0029→0067→0106→0138 四份 + 0139 ALTER）
-- 薄壳必须同时重声明两条 SET（search_path + hnsw.iterative_scan=strict_order，
-- 0139 的 proconfig 增项 · 逐字重声明防重置）。库成员同 pin 双 GUC（防御纵深）。
-- ═══════════════════════════════════════════════════════════════════════════
CREATE FUNCTION public.tf_qbank_generation_ann_search(p_generation text, p_embedding vector, p_k integer)
RETURNS TABLE(ref_id text, distance double precision)
  LANGUAGE sql
  STABLE
  SET search_path = public, pg_temp
  SET hnsw.iterative_scan = 'strict_order'
AS $$
  WITH requested AS (
    SELECT greatest(1, least(coalesce(p_k, 1), 50))::integer AS k
  ), active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), ann AS (
    SELECT g.ref_id, g.embedding <=> p_embedding AS dist
      FROM active a
      JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.visible
      JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id
     WHERE (
            (NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NULL
             AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NULL)
            OR (
              NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
              AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
              AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
              AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
            )
          )
     ORDER BY g.embedding <=> p_embedding
     LIMIT (SELECT greatest(k * 8, 40) FROM requested)
  )
  SELECT a.ref_id, a.dist::double precision
    FROM ann a
   ORDER BY a.dist
   LIMIT (SELECT k FROM requested)
$$;
REVOKE ALL ON FUNCTION public.tf_qbank_generation_ann_search(text, vector, integer) FROM PUBLIC;

CREATE OR REPLACE FUNCTION qbank_generation_ann_search(p_generation text, p_embedding vector, p_k integer)
RETURNS TABLE(ref_id text, distance double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
  SET hnsw.iterative_scan = 'strict_order'
AS $$
  SELECT * FROM public.tf_qbank_generation_ann_search(p_generation, p_embedding, p_k)
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- §5 簇③-b：qbank_is_generation_control_definer（0070→0071→0072→0087→0089 五份 ·
-- 白名单 4→15 单一真相源；后续新增 definer 成员=改本列表，不再复制宿主）。
-- ═══════════════════════════════════════════════════════════════════════════
CREATE FUNCTION public.tf_is_generation_control_definer()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT current_user IN (
    SELECT pg_get_userbyid(proowner)
      FROM pg_proc
     WHERE oid IN (
       'qbank_generation_chunk_only_building()'::regprocedure,
       'qbank_prepare_generation_partition(text)'::regprocedure,
       'qbank_validate_generation(text)'::regprocedure,
       'qbank_activate_generation(text)'::regprocedure,
       'qbank_mark_generation_failed(text,text)'::regprocedure,
       'qbank_pool_requires_approved()'::regprocedure,
       'qbank_chunk_requires_approved_pool()'::regprocedure,
       'qbank_question_chunk_requires_visible_source()'::regprocedure,
       'qbank_question_artifact_guard()'::regprocedure,
       'qbank_question_chunk_artifact_guard()'::regprocedure,
       'qbank_generation_question_evidence(text,text[],integer)'::regprocedure,
       'qbank_taxonomy_release_guard()'::regprocedure,
       'qbank_taxonomy_scope_guard()'::regprocedure,
       'qbank_taxonomy_manifest_hash(text)'::regprocedure,
       'qbank_chunk_serving_scope_guard()'::regprocedure
     )
  )
$$;
-- ACL 镜像终端（0089 收口面 · INVOKER 族直调者需要 EXECUTE；非新受者）。
-- qbank manifest 供给（principal.ts provisionQbankControlDefiner）会把控制面 SD 函数属主
-- 转给 qbank_control_definer（含 qbank_pool_visible_epoch_sync 内联求值本判定、ann_search
-- 薄壳 SD definer 上下文）——库成员须对该 definer 可达。角色在标准迁移路径不存在（manifest
-- 供给制），此处按供给同形态幂等确保存在（供给端 exists-check 兼容 · 后续 ALTER 硬化收口）。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='qbank_control_definer') THEN
    EXECUTE 'CREATE ROLE qbank_control_definer NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS';
  END IF;
END
$$;
REVOKE ALL ON FUNCTION public.tf_is_generation_control_definer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_is_generation_control_definer() TO app_role, qbank_control_executor, qbank_control_definer;
GRANT EXECUTE ON FUNCTION public.tf_qbank_generation_ann_search(text, vector, integer) TO qbank_control_definer;

CREATE OR REPLACE FUNCTION qbank_is_generation_control_definer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT public.tf_is_generation_control_definer()
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- §6 簇③-c：privacy_begin_checkpoint_erasure（0048→0058→0096 三份 · 擦除闭包单一真相源）
-- 库成员镜像 0096 尾部模式：OWNER TO privacy_api_owner + REVOKE PUBLIC
-- （只在 SD 薄壳内以 privacy_api_owner 身份执行 · forbidden 封印 principal.ts:1010 保形）。
-- ═══════════════════════════════════════════════════════════════════════════
CREATE FUNCTION public.tf_checkpoint_erasure(
  target_thread text,
  request_key_hash text
) RETURNS TABLE (
  request_id uuid,
  request_status text,
  checkpoint_target_id uuid,
  fence_epoch bigint,
  replayed boolean
)
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  existing privacy_erasure_request%ROWTYPE;
  created_request uuid;
  created_target uuid;
  queue_target uuid;
  new_epoch bigint;
  sink_name text;
  redacted_jobs bigint := 0;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_thread IS NULL OR length(target_thread)=0
     OR request_key_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'privacy_erasure_request_invalid' USING ERRCODE='22023';
  END IF;

  -- The same transaction advisory lock is held by
  -- assert_interview_privacy_active().  This closes the
  -- admission-vs-delete time-of-check/time-of-use race without expanding the
  -- privacy definer's business-table privilege.
  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || target_thread));
  PERFORM 1 FROM interview i
   WHERE i.id=target_thread AND i.owner_user_id=principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_erasure_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;

  SELECT * INTO existing FROM privacy_erasure_request r
   WHERE r.owner_user_id=principal AND r.idempotency_key_hash=request_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> 'interview_data' OR existing.subject_id <> target_thread THEN
      RAISE EXCEPTION 'privacy_idempotency_payload_conflict' USING ERRCODE='23505';
    END IF;
    SELECT pt.target_id,pt.fence_epoch INTO created_target,new_epoch
      FROM privacy_checkpoint_target pt WHERE pt.request_id=existing.id AND pt.thread_id=target_thread;
    RETURN QUERY SELECT existing.id,existing.status,created_target,new_epoch,true;
    RETURN;
  END IF;

  INSERT INTO privacy_erasure_request(owner_user_id,scope,subject_id,idempotency_key_hash,status)
    VALUES (principal,'interview_data',target_thread,request_key_hash,'requested')
    RETURNING id INTO created_request;

  UPDATE checkpoint_thread_enrollment
     SET access_state='revoked',fence_epoch=checkpoint_thread_enrollment.fence_epoch+1,revoked_at=now()
   WHERE thread_id=target_thread AND owner_user_id=principal AND access_state='active'
   RETURNING checkpoint_thread_enrollment.fence_epoch INTO new_epoch;

  -- Question identity is a business projection, not an answer store.  It
  -- must nevertheless be closed so a stale browser cannot reserve a new job.
  UPDATE interview_question
     SET status='cancelled'
   WHERE owner_user_id=principal AND interview_id=target_thread
     AND status IN ('issued','queued');

  -- INT-TRANSCRIPT-01（防御纵深）：清除低熵 SHA-256 answer_hash oracle（覆盖
  -- issued/queued/answered 全部状态）。它是原始答案的裸哈希、可被猜测确认，是 0092 bodyHmac
  -- 取代之前的残留关联预言机，绝不能在 fence 后留存。必须在建 privacy_checkpoint_target
  -- 之前执行——此刻 interview_question 写 guard 仍观察为 active，否则这内部 UPDATE 会被拒
  -- （与 0058「先清队列、后建 target」的时序同源）。
  -- 注意：本函数的 app_role EXECUTE 已被 0075 暂停，这是死代码路径；**主清除在活删除流
  -- interview_projection_begin_erasure（Section C）**，此处只是保留旧路径的防御纵深。
  UPDATE interview_question
     SET answer_hash=NULL
   WHERE owner_user_id=principal AND interview_id=target_thread
     AND answer_hash IS NOT NULL;

  -- Do not leave either modern answer text or a pre-v50 resumeRaw transport
  -- field behind.  `done` prevents a worker that already selected metadata
  -- from materializing it; load queries also carry the active predicate.
  UPDATE interview_job
     SET status='done',payload='{}'::jsonb,lease_owner=NULL,lease_expires_at=NULL,
         last_error='privacy_fenced',version=version+1
   WHERE owner_user_id=principal AND interview_id=target_thread
     AND status IN ('queued','running');
  GET DIAGNOSTICS redacted_jobs = ROW_COUNT;

  INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status,deleted_count,receipt_hash)
    VALUES (
      created_request,
      'interview_job_payload',
      encode(hmac(target_thread || ':interview_job_payload:' || created_request::text, request_key_hash, 'sha256'),'hex'),
      'erased',
      redacted_jobs,
      encode(digest(created_request::text || ':interview_job_payload:' || redacted_jobs::text, 'sha256'),'hex')
    ) RETURNING id INTO queue_target;

  INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status)
    VALUES (
      created_request,
      'checkpoint_rows',
      encode(hmac(target_thread || ':checkpoint_rows:' || created_request::text, request_key_hash, 'sha256'),'hex'),
      'pending'
    ) RETURNING id INTO created_target;
  INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch)
    VALUES (created_target,created_request,principal,target_thread,new_epoch);

  -- Each external data plane is explicit.  No missing executor is interpreted
  -- as a successful deletion: these rows retain the request in non-complete.
  FOREACH sink_name IN ARRAY ARRAY['oss','redis','langfuse'] LOOP
    INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac,status)
      VALUES (
        created_request,
        sink_name,
        encode(hmac(target_thread || ':' || sink_name || ':' || created_request::text, request_key_hash, 'sha256'),'hex'),
        'retention_pending'
      );
  END LOOP;
  UPDATE privacy_erasure_request
     SET status='fenced',updated_at=now(),version=version+1
   WHERE id=created_request AND status='requested';
  RETURN QUERY SELECT created_request,'fenced'::text,created_target,new_epoch,false;
END $$;

ALTER FUNCTION public.tf_checkpoint_erasure(text, text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION public.tf_checkpoint_erasure(text, text) FROM PUBLIC;

-- 薄壳（逐字重声明 SD + SET · owner=privacy_api_owner 与 ACL={privacy_api_owner} 自动保留）。
CREATE OR REPLACE FUNCTION privacy_begin_checkpoint_erasure(
  target_thread text,
  request_key_hash text
) RETURNS TABLE (
  request_id uuid,
  request_status text,
  checkpoint_target_id uuid,
  fence_epoch bigint,
  replayed boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.tf_checkpoint_erasure(target_thread, request_key_hash);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- §7 簇③-d：gateway_dispatch_owners（0040→0128→0132 三份 · 六 work 臂单一真相源）
-- 后续新增 work 臂=改本 CASE，不再复制宿主。
-- ═══════════════════════════════════════════════════════════════════════════
CREATE FUNCTION public.tf_gateway_dispatch_owners(p_work text)
RETURNS TABLE(owner_user_id text)
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  CASE p_work
    WHEN 'interview' THEN
      RETURN QUERY
        SELECT j.owner_user_id::text
        FROM public.interview_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp())
        GROUP BY j.owner_user_id
        ORDER BY min(j.created_at) ASC, j.owner_user_id ASC;
    WHEN 'quiz' THEN
      RETURN QUERY
        SELECT DISTINCT j.owner_user_id::text
        FROM public.quiz_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp());
    WHEN 'diagnosis' THEN
      RETURN QUERY
        SELECT DISTINCT j.owner_user_id::text
        FROM public.diagnosis_job AS j
        WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp());
    WHEN 'report' THEN
      RETURN QUERY
        SELECT DISTINCT r.owner_user_id::text
        FROM public.ai_report AS r
        WHERE r.status IN ('queued','failed') OR (r.status='running' AND r.lease_expires_at < clock_timestamp());
    WHEN 'commerce' THEN
      RETURN QUERY
        SELECT c.owner_user_id::text
        FROM public.entitlement_consumption AS c
        WHERE c.status='reserved' AND c.lease_expires_at < clock_timestamp()
      UNION
        SELECT o.owner_user_id::text
        FROM public.commerce_outbox AS o
        WHERE o.status='pending';
    WHEN 'job_route' THEN
      RETURN QUERY
        SELECT r.owner_user_id::text
        FROM public.job_semantic_revision AS r
        WHERE r.status = 'route_pending'
        GROUP BY r.owner_user_id
        ORDER BY r.owner_user_id ASC;
    ELSE
      RAISE EXCEPTION 'gateway_dispatch_unknown_work' USING ERRCODE = '22023';
  END CASE;
END;
$$;
REVOKE ALL ON FUNCTION public.tf_gateway_dispatch_owners(text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION gateway_dispatch_owners(p_work text)
RETURNS TABLE(owner_user_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.tf_gateway_dispatch_owners(p_work);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- §8 演进规则冻结（0144 起）：Ban 同名全量重贴；ALTER FUNCTION（SET/OWNER · 0139 先例）
--    或新名版本化（_v2）或 tf_ 库内实现变更。Tier-2 长尾（REQUEST 附录 A · 40 名）按此
--    规则立账，后续演进不得重抄。prove P7 形状门背书（薄壳/tf_/种子 INSERT 三类）。
-- ═══════════════════════════════════════════════════════════════════════════
