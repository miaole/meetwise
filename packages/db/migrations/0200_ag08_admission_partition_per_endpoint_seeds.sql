-- 0200_ag08_admission_partition_per_endpoint_seeds.sql
--
-- AG-08（成本轨⑤）：准入/熔断/并发分区键按端点分域——主备分别建种子
-- （issues-final AG-08 修法第一半后句「主备分别建种子」逐字兑现）。
--
-- 端点身份 = endpoint profile id（冻结注册表
-- packages/ai-runtime/src/text-endpoint-config.ts 的 TextEndpointProfile 闭集）：
--   provider_account = profile id（'deepseek-cn-public' / 'dashscope-cn-beijing'）
--   region           = 'cn'（TextEndpointConfig.region）
-- 0120 :29-30 CHECK 正则 ^[A-Za-z0-9._-]{1,80}$ 收纳亲证。并发/阈值/冷却沿 0120
-- :52-57 文本 6 op 原值（max_concurrency=4 / breaker_threshold=5 / cooldown=30000），
-- meter='text-tokens'，与 TS 侧 prepare 填充的 plan.admissionEndpoint 同源同值。
--
-- 既有行零字节：0120 :52-59（dashscope-main 六 text + dashscope-native vision）+
-- :61-68（八 unwired blocked）+ 0131 :14（classify 主端点行）原值不动。旧四字键
-- （dashscope-main/cn-beijing 族）自此为 legacy 回退集（registry admission 字段语义
-- 降级为 legacy 回退值；无端点身份路径仍落旧键分区）：容忍僵尸（无新流量旧键
-- breaker 行不清除）+ 并发 lease 过期自愈（0120 :120-130 原机制）+ 冷启动重检窗
-- ≤ breaker_threshold=5 + 部署顺序 = 本迁移先于 TS overlay（防 TS 先行写新键撞种子缺行）。
--
-- ≠ 网关：MODEL-OP-04 单一网关统一路由延后声明零改；≠ failover 语义翻面：0130
-- 墙一/半开 :806 全等门与 model_failover_cost_policy_mismatch 终态零改（预绑定对
-- 数据面=registry MODEL_COST_FAILOVER_PREBOUND_ENDPOINT_KEYS，消费判归 AG-09 联动刀）。
-- releaseEvidence=false · est live=0。
--
-- 备端点 classify 行与 0131 主端点 classify 行的关系：备行补齐属 14 行闭集内
-- （同 operation 主备各一行）；0131 原行零字节。

INSERT INTO ai_model_admission_policy
  (provider_account, region, model_or_recipe, operation_id, admission_status, meter, max_concurrency, breaker_threshold, breaker_cooldown_ms)
VALUES
  -- 主端点 profile 'deepseek-cn-public'（MODEL_ENDPOINT_PROFILE 缺省值）
  ('deepseek-cn-public','cn','planner',             'interview.competency-planning.v1','allowed','text-tokens',4,5,30000),
  ('deepseek-cn-public','cn','questioner',          'interview.question-generation.v1','allowed','text-tokens',4,5,30000),
  ('deepseek-cn-public','cn','scorer',              'interview.answer-scoring.v1',     'allowed','text-tokens',4,5,30000),
  ('deepseek-cn-public','cn','quiz',                'interview.quiz-generation.v1',    'allowed','text-tokens',4,5,30000),
  ('deepseek-cn-public','cn','diagnosis',           'resume.diagnosis.v1',             'allowed','text-tokens',4,5,30000),
  ('deepseek-cn-public','cn','report',              'report.narrative.v1',             'allowed','text-tokens',4,5,30000),
  ('deepseek-cn-public','cn','job-route-classifier','job.route-classify.v1',           'allowed','text-tokens',4,5,30000),
  -- 备端点 profile 'dashscope-cn-beijing'（MODEL_BACKUP_ENDPOINT_PROFILE 缺省值）
  ('dashscope-cn-beijing','cn','planner',             'interview.competency-planning.v1','allowed','text-tokens',4,5,30000),
  ('dashscope-cn-beijing','cn','questioner',          'interview.question-generation.v1','allowed','text-tokens',4,5,30000),
  ('dashscope-cn-beijing','cn','scorer',              'interview.answer-scoring.v1',     'allowed','text-tokens',4,5,30000),
  ('dashscope-cn-beijing','cn','quiz',                'interview.quiz-generation.v1',    'allowed','text-tokens',4,5,30000),
  ('dashscope-cn-beijing','cn','diagnosis',           'resume.diagnosis.v1',             'allowed','text-tokens',4,5,30000),
  ('dashscope-cn-beijing','cn','report',              'report.narrative.v1',             'allowed','text-tokens',4,5,30000),
  ('dashscope-cn-beijing','cn','job-route-classifier','job.route-classify.v1',           'allowed','text-tokens',4,5,30000)
ON CONFLICT (provider_account, region, model_or_recipe, operation_id) DO NOTHING;
