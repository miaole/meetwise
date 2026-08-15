-- 成本源头真相:给 ai_invocation_trace 加 token/成本列(存量 DB 用;新库在 01_schema 已含)。幂等 IF NOT EXISTS。
ALTER TABLE ai_invocation_trace ADD COLUMN IF NOT EXISTS service text;
ALTER TABLE ai_invocation_trace ADD COLUMN IF NOT EXISTS input_tokens int;
ALTER TABLE ai_invocation_trace ADD COLUMN IF NOT EXISTS output_tokens int;
ALTER TABLE ai_invocation_trace ADD COLUMN IF NOT EXISTS latency_ms int;
