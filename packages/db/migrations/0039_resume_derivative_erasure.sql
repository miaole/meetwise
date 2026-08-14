-- 0039_resume_derivative_erasure.sql
--
-- 用户删除简历数据时，需同步删除可关联到其 OCR 的调用追踪与 durable invocation。
-- 费用账本不含 prompt/输出，且承担不可抵赖的供应商对账，故不在此迁移删除。

GRANT DELETE ON ai_invocation_trace, ai_model_invocation TO app_role;
