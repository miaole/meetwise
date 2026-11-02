-- 0220_job_queue_interview_status_lease_index.sql — interview_job 队列 status/lease 前导复合索引（全局枚举/gauge 支撑·在线并发建）
--
-- job-queue-index: interview_job
--
-- @migration-mode concurrent-index
--
-- 队列调度/gauge 的过滤条件（status/lease）没有以 status 开头的索引：owner 枚举
-- （每副本每 5s）与 gauge 聚合（每 15s）都不带 owner 谓词，而既有索引全部 owner
-- 前导（ix_ijob_claim 等），每条查询退化为对整张历史表顺序扫描。复合键序
-- (status, lease_expires_at) 覆盖等值/范围/多值三种形态；无谓词（runner 并发
-- 通道正则只收 IS NULL/单值等值谓词，且部分索引方案心跳面写放大不减）。热表
-- 在线并发建（0198/0211 同族先例形·IF NOT EXISTS 幂等）。
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_ijob_status_lease
  ON public.interview_job (status, lease_expires_at);
