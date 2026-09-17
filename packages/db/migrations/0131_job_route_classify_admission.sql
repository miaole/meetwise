-- 0131_job_route_classify_admission.sql
--
-- MODEL-OP-01 / R2 P-MODEL：为 UC `job_route_classify`（registry id
-- `job.route-classify.v1`）写入共享准入种子。与
-- packages/ai-runtime/src/model-operation-registry.ts 对齐。
--
-- 本迁移只补 admission policy 行，使未来 sole 分类 Worker 经 invoke() 走 typed
-- binding 时不被「无策略行 → operation_unknown」挡住。≠ R2 关闭：apps 仍零
-- classifyJobRoute(；≠ 路由已生效；releaseEvidence=false。

INSERT INTO ai_model_admission_policy
  (provider_account, region, model_or_recipe, operation_id, admission_status, meter, max_concurrency, breaker_threshold, breaker_cooldown_ms)
VALUES
  ('dashscope-main','cn-beijing','job-route-classifier','job.route-classify.v1','allowed','text-tokens',4,5,30000)
ON CONFLICT (provider_account, region, model_or_recipe, operation_id) DO NOTHING;
