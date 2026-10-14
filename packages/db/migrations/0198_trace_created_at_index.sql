-- 0198_trace_created_at_index.sql — #122 半 1：ai_invocation_trace 时间索引（保留期清理支撑·在线并发建）
--
-- @migration-mode concurrent-index
--
-- #122 修法半 1：trace 唯一索引=ix_trace_request_id（0014），created_at 无时间
-- 索引——保留期清理（按时间删旧 trace）全表扫。在线并发建（#115 纪律半：存量
-- 热表建索引一律 CONCURRENTLY·0014/0019 同族先例形·IF NOT EXISTS 幂等）。
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_trace_created_at
  ON ai_invocation_trace (created_at);
