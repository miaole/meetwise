-- 全链路 request-id:给 ai_invocation_trace 加 request_id 列(存量 DB 用;新库在 01_schema 由集成者合入)。
-- 一根 reqId 贯穿 HTTP 请求 → worker job → 模型调用 trace,让"某次请求为什么失败"能一跳到底查,不用跨表拼 threadId/幂等键。
-- 幂等 IF NOT EXISTS;可空 → 不传/存量行为 NULL,向后兼容(现有 invoke 调用零改动)。
ALTER TABLE ai_invocation_trace ADD COLUMN IF NOT EXISTS request_id text;
-- 反查索引:给定一根 reqId 快速捞出本次请求触发的所有模型调用(RCA/审计:一跳到底)。
CREATE INDEX IF NOT EXISTS ix_trace_request_id ON ai_invocation_trace (request_id);
