-- 0202_interview_event_kind_score_card_written.sql — EVKIND-SCORECARD-FIX · ck_interview_event_kind 值域扩容 +1
--
-- @migration-mode multi-statement
--
-- 对撞修复（perf-prep 2026-10-14 nail-prep 收据首次曝光·主线 7152cd3c 落 0192 时值域溯源
-- 面仅 TS 写点、漏采 migrations 内 SECURITY DEFINER 函数三写点 0100:891/0103:286/0109:512）：
-- interview_event.kind 值域补 +1 'score_card_written'——权威评分事实事件（写卡同事务原子
-- 追加·生产链 interview-consumer.ts:463→adaptive-lifecycle.ts:493→score-writer.ts:102→
-- scoring-aggregation.ts:68 实触）。扩域 expand-only：0192 fail-loud DO 块已保零值域外存量，
-- 放宽对存量行不可能新增违约→零前置检测零洗数据。
-- 2 语句 = 1 熔单 ALTER（DROP+ADD NOT VALID 单语句原子无裸窗·0149:48-50 先例）+ 1 VALIDATE。
-- 19 值列表逐字承 0192:44-49·约束名不变。

ALTER TABLE interview_event
  DROP CONSTRAINT IF EXISTS ck_interview_event_kind,
  ADD CONSTRAINT ck_interview_event_kind
  CHECK (kind IN (
    'question_ready','answer_evaluated','answer_unscored','clarification_needed',
    'report_ready','report_unavailable','interview_unavailable','assessment_unavailable',
    'session_concluded','progress','section_ready','rewrite_ready','diagnosis_ready',
    'diagnosis_unavailable','quiz_ready','quiz_unavailable','generation_started',
    'model_first_token','generation_progress','score_card_written')) NOT VALID;

ALTER TABLE interview_event VALIDATE CONSTRAINT ck_interview_event_kind;
