-- 0221_job_queue_quiz_status_lease_index.sql — quiz_job 队列 status/lease 前导复合索引（全局枚举/gauge 支撑·在线并发建）
--
-- job-queue-index: quiz_job
--
-- @migration-mode concurrent-index
--
-- 同 interview_job 形（0220）：全局 owner 枚举与 gauge 聚合不带 owner 谓词，
-- 既有索引全部 owner 前导；复合键序 (status, lease_expires_at) 覆盖三形态、
-- 无谓词。热表在线并发建（0198/0211 同族先例形·IF NOT EXISTS 幂等）。
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_quizjob_status_lease
  ON public.quiz_job (status, lease_expires_at);
