-- 0223_job_queue_report_status_lease_index.sql — ai_report 队列 status/lease 前导复合索引（全局枚举/gauge 支撑·在线并发建）
--
-- job-queue-index: ai_report
--
-- @migration-mode concurrent-index
--
-- 同 interview_job 形（0220）：report 臂全局枚举谓词为 status IN ('queued','failed')
-- OR running-expired、gauge 聚合含 quarantined 终态列，均不带 owner 谓词；既有
-- 索引全部 owner 前导（ix_report_claimable/uq_report_interview）。复合键序
-- (status, lease_expires_at) 覆盖等值/范围/多值三形态、无谓词。热表在线并发建
-- （0198/0211 同族先例形·IF NOT EXISTS 幂等）。
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_report_status_lease
  ON public.ai_report (status, lease_expires_at);
