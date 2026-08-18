-- 成本/预算校准:给 ai_invocation_trace 加"派发前保守估算输入 token"列(存量 DB 用;新库在 01_schema 已含)。
-- 与 input_tokens(供应商上报 usage)配对,供异步 tokenizer 校准:判断保守估算(byteEstimate = UTF-8 字节上界)
-- 是否被真实 usage 击穿(低估)。估算无法事后重算(原始 prompt 因隐私只落 digest、不落原文),故必须在结算时持久化。
ALTER TABLE ai_invocation_trace ADD COLUMN IF NOT EXISTS estimate_input_tokens int;
