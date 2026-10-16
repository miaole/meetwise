-- 0192_interview_event_created_at_kind_check.sql — #16：interview_event 墙钟列 + kind 值域封闭（在线两段式）
--
-- @migration-mode multi-statement
--
-- #16 修法：①created_at expand-only（timestamptz NOT NULL DEFAULT now()·PG16
-- fast-default 元数据形零全表 rewrite·现表零 created_at 列亲证 0001:38-46）；
-- ②kind CHECK NOT VALID→VALIDATE 分事务。
-- kind 值域 = 现役闭合 19 值（裁决③权威=domain-events-catalog.md + 生产写点全量
-- rg 实测，逐值溯源）：
--   interview 流：question_ready / answer_evaluated / answer_unscored /
--     clarification_needed / report_ready / report_unavailable /
--     interview_unavailable / assessment_unavailable / session_concluded
--     （interview-signal-conclude.ts:13 SESSION_CONCLUDED_KIND·catalog :59）
--   diagnosis 流：progress / section_ready / rewrite_ready / diagnosis_ready /
--     diagnosis_unavailable
--   quiz 流：progress / question_ready / quiz_ready / quiz_unavailable
--   generation 进度族（generation-progress.ts:14 GENERATION_PROGRESS_KINDS）：
--     generation_started / model_first_token / generation_progress
-- 前置存量检测（fail-loud 沿 0149 首语句形）：存量 kind 落值域外非 0 即拒跑不洗。
-- 4 语句 = 1 DO 块存量检测 + 1 ADD COLUMN + 1 ADD CHECK NOT VALID + 1 VALIDATE。

DO $event_kind_detect$
DECLARE
  v_off_vocabulary integer;
BEGIN
  SELECT count(*) INTO v_off_vocabulary FROM interview_event
   WHERE kind NOT IN (
    'question_ready','answer_evaluated','answer_unscored','clarification_needed',
    'report_ready','report_unavailable','interview_unavailable','assessment_unavailable',
    'session_concluded','progress','section_ready','rewrite_ready','diagnosis_ready',
    'diagnosis_unavailable','quiz_ready','quiz_unavailable','generation_started',
    'model_first_token','generation_progress');
  IF v_off_vocabulary > 0 THEN
    RAISE EXCEPTION 'event_kind_off_vocabulary: interview_event.kind 值域外行计 % — 停部署具名上报（SELECT DISTINCT kind 取证），不洗存量数据', v_off_vocabulary;
  END IF;
END
$event_kind_detect$;

ALTER TABLE interview_event
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE interview_event
  ADD CONSTRAINT ck_interview_event_kind
  CHECK (kind IN (
    'question_ready','answer_evaluated','answer_unscored','clarification_needed',
    'report_ready','report_unavailable','interview_unavailable','assessment_unavailable',
    'session_concluded','progress','section_ready','rewrite_ready','diagnosis_ready',
    'diagnosis_unavailable','quiz_ready','quiz_unavailable','generation_started',
    'model_first_token','generation_progress')) NOT VALID;

ALTER TABLE interview_event VALIDATE CONSTRAINT ck_interview_event_kind;
