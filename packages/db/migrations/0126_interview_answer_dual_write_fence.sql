-- 0126_interview_answer_dual_write_fence.sql
--
-- INT-P0-RAW-QUEUE 围栏（不是 INT-TRANSCRIPT-01）。
--
-- 现行生产 HTTP `/turn` 仍把明文 answer 写入 interview_job.payload；ledger
-- submitInterviewAnswer 仍不是生产 write route。本迁移只做机械互斥，防止两条
-- 正文家族对同一答题身份并行落库，并禁止 interview_event 顶层 `answer` 键。
-- 不得据此宣称 01 完成、plaintext queue 已停用、或删后 read=0 已闭合。
--
-- 铁律：
--   1. 有未物理删除的 interview_answer_artifact（任意 status，含 fenced/erased）
--      时，禁止同身份 interview_job 再带 payload.answer。不阻断无 answer 键的
--      job。kind 不豁免：start 带 answer 键也走同一断言。
--   2. 已有占用行时禁止再插 ledger artifact：kind=answer 的 interview_job
--      （含终态已剥明文、仍带 questionId 的行），或任意 kind 且 payload 含
--      answer 键。无 questionId（trim 后空）的占用行对整场面试 fail-closed。
--      有 questionId、无合法 stateVersion 的占用行对该题所有 version fail-closed。
--      不猜测、不回填原文。EXISTS 禁止加 status 谓词；只有物理 DELETE 解除。
--   3. interview_event 禁止顶层 answer 键；answerId / answerHash 仍合法。
--      嵌套 answer 不在本围栏范围。
--   4. 对向写入先拿同一把面试级 advisory 锁再 EXISTS。残缺身份与完整身份
--      必须同锁，禁止用三元组 hash 当唯一锁。触发器是安全边界；仓储层再调
--      同一函数。

GRANT CREATE ON SCHEMA public TO privacy_api_owner;

CREATE OR REPLACE FUNCTION assert_interview_answer_legacy_plaintext_allowed(
  p_interview text,
  p_question_id text,
  p_state_version bigint
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  v_question text := NULLIF(btrim(COALESCE(p_question_id, '')), '');
BEGIN
  IF p_interview IS NULL OR length(p_interview) = 0 THEN
    RAISE EXCEPTION 'interview_answer_legacy_plaintext_fenced' USING ERRCODE = 'P0001';
  END IF;

  -- 面试级锁：无 questionId / 无 stateVersion 的占用行与完整三元组必须同锁。
  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_answer_writer:' || p_interview));

  IF v_question IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM interview_answer_artifact a
       WHERE a.interview_id = p_interview
    ) THEN
      RAISE EXCEPTION 'interview_answer_legacy_plaintext_fenced' USING ERRCODE = 'P0001';
    END IF;
    RETURN;
  END IF;

  IF p_state_version IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM interview_answer_artifact a
       WHERE a.interview_id = p_interview
         AND a.question_id = v_question
    ) THEN
      RAISE EXCEPTION 'interview_answer_legacy_plaintext_fenced' USING ERRCODE = 'P0001';
    END IF;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM interview_answer_artifact a
     WHERE a.interview_id = p_interview
       AND a.question_id = v_question
       AND a.state_version = p_state_version
  ) THEN
    RAISE EXCEPTION 'interview_answer_legacy_plaintext_fenced' USING ERRCODE = 'P0001';
  END IF;
END $$;

ALTER FUNCTION assert_interview_answer_legacy_plaintext_allowed(text, text, bigint) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_interview_answer_legacy_plaintext_allowed(text, text, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION assert_interview_answer_legacy_plaintext_allowed(text, text, bigint) TO app_role;

CREATE OR REPLACE FUNCTION assert_interview_answer_ledger_write_allowed(
  p_interview text,
  p_question_id text,
  p_state_version bigint
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  v_question text := NULLIF(btrim(COALESCE(p_question_id, '')), '');
BEGIN
  IF p_interview IS NULL OR length(p_interview) = 0 OR v_question IS NULL THEN
    RAISE EXCEPTION 'interview_answer_ledger_dual_write_fenced' USING ERRCODE = 'P0001';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_answer_writer:' || p_interview));

  -- 占用行 = kind=answer（含剥明文）或任意 kind 且带 answer 键。
  -- 无 questionId：不猜测归属，整场面试拒 ledger。
  IF EXISTS (
    SELECT 1 FROM interview_job j
     WHERE j.interview_id = p_interview
       AND (j.kind = 'answer' OR j.payload ? 'answer')
       AND NULLIF(btrim(COALESCE(j.payload->>'questionId', '')), '') IS NULL
  ) THEN
    RAISE EXCEPTION 'interview_answer_ledger_dual_write_fenced' USING ERRCODE = 'P0001';
  END IF;

  -- 同题：缺合法 stateVersion 的占用行对该题所有 version fail-closed；
  -- 能规范成 bigint 则按数值比较（"01" 与 1 视为同一 version）。
  IF EXISTS (
    SELECT 1 FROM interview_job j
     WHERE j.interview_id = p_interview
       AND (j.kind = 'answer' OR j.payload ? 'answer')
       AND NULLIF(btrim(COALESCE(j.payload->>'questionId', '')), '') = v_question
       AND (
         p_state_version IS NULL
         OR NULLIF(btrim(COALESCE(j.payload->>'stateVersion', '')), '') IS NULL
         OR NOT (btrim(COALESCE(j.payload->>'stateVersion', '')) ~ '^[0-9]+$')
         OR btrim(j.payload->>'stateVersion')::bigint = p_state_version
       )
  ) THEN
    RAISE EXCEPTION 'interview_answer_ledger_dual_write_fenced' USING ERRCODE = 'P0001';
  END IF;
END $$;

ALTER FUNCTION assert_interview_answer_ledger_write_allowed(text, text, bigint) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_interview_answer_ledger_write_allowed(text, text, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION assert_interview_answer_ledger_write_allowed(text, text, bigint) TO app_role;

CREATE OR REPLACE FUNCTION enforce_interview_job_answer_dual_write()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  -- 互斥看的是顶层 answer 键，不是 kind。start 带 answer 不豁免。
  IF NEW.payload ? 'answer' THEN
    PERFORM assert_interview_answer_legacy_plaintext_allowed(
      NEW.interview_id,
      NULLIF(btrim(COALESCE(NEW.payload->>'questionId', '')), ''),
      CASE
        WHEN btrim(COALESCE(NEW.payload->>'stateVersion', '')) ~ '^[0-9]+$'
          THEN btrim(NEW.payload->>'stateVersion')::bigint
        ELSE NULL
      END
    );
  END IF;
  RETURN NEW;
END $$;

ALTER FUNCTION enforce_interview_job_answer_dual_write() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION enforce_interview_job_answer_dual_write() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS interview_job_answer_dual_write_guard ON interview_job;
CREATE TRIGGER interview_job_answer_dual_write_guard
  BEFORE INSERT OR UPDATE OF payload, kind, interview_id ON interview_job
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_job_answer_dual_write();

CREATE OR REPLACE FUNCTION enforce_interview_answer_artifact_dual_write()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  PERFORM assert_interview_answer_ledger_write_allowed(NEW.interview_id, NEW.question_id, NEW.state_version);
  RETURN NEW;
END $$;

ALTER FUNCTION enforce_interview_answer_artifact_dual_write() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION enforce_interview_answer_artifact_dual_write() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS interview_answer_artifact_dual_write_guard ON interview_answer_artifact;
CREATE TRIGGER interview_answer_artifact_dual_write_guard
  BEFORE INSERT OR UPDATE OF interview_id, question_id, state_version ON interview_answer_artifact
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_answer_artifact_dual_write();

-- 事件原文围栏不需要读他表，也不扩大 privacy_api_owner 权限面。
CREATE OR REPLACE FUNCTION enforce_interview_event_no_raw_answer()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NEW.payload ? 'answer' THEN
    RAISE EXCEPTION 'interview_event_raw_answer_fenced' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS interview_event_no_raw_answer_guard ON interview_event;
CREATE TRIGGER interview_event_no_raw_answer_guard
  BEFORE INSERT OR UPDATE OF payload ON interview_event
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_event_no_raw_answer();
