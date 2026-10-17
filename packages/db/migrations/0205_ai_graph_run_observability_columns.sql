-- 0205_ai_graph_run_observability_columns.sql — AG-15 图运行时可观测三列 additive（issues-final :213/LG-20 修法半）。
--
-- REQUEST：ai-docs/delivery/harness/ag15-observability-REQUEST.md（pre-exec 双审+协调方开工授权后 EXEC）。
-- 列语义（§1.2 定稿）：current_node ∈ {'END'} ∪ {'interrupt:<node>'} ∪ {裸节点名} ∪ NULL（尚无观测）；
--   last_error=最近一次边界观测的错误标量（generation_* reason 族·无失败=NULL·interview_job.last_error
--   text 命名先例）；checkpoint_id=LangGraph StateSnapshot.config.configurable.checkpoint_id（0043
--   checkpoints.checkpoint_id text 同名同型先例·缺省 NULL）。
-- additive 形制（0186 :41/:48-49 幂等形先例）：三列全可空零 DEFAULT 零回填（存量行 NULL=「尚无观测」
--   诚实语义·缺席≠零）·零约束零索引零词表触（0149 十一值 CHECK 零改）·零 RLS/授权触（0059 p_owner
--   表级策略自然覆盖·写者=既有 owner principal 写路）·历史迁移 0001-0204 零字节（镜像纪律只加新迁移）。
-- @migration-mode multi-statement

ALTER TABLE ai_graph_run ADD COLUMN IF NOT EXISTS current_node text;
ALTER TABLE ai_graph_run ADD COLUMN IF NOT EXISTS last_error text;
ALTER TABLE ai_graph_run ADD COLUMN IF NOT EXISTS checkpoint_id text;
