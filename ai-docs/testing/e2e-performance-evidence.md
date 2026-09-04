---
id: testing_e2e_performance_evidence
name: 全量 E2E 与性能门证据
description: 可重复的隔离 E2E、本地性能预算与当前 RAG 发布集实跑证据和结论边界。
type: testing
scope: shared
level: guide
status: active
owner: qa
version: 2
tags:
  - e2e
  - performance
  - evidence
related:
  - ./strategy/test-strategy.md
  - ./conventions/test-authoring.md
  - ../skills/testing/SKILL.md
---

# 全量 E2E 与性能门证据

## 1. 一条可重复的本地门

```bash
pnpm verify:e2e-performance
```

该命令先构建 production Next，再依次运行隔离 HTTP E2E、真实浏览器 E2E、API 并发回归、API 契约/负路径、幂等、长上下文、图延迟和 RAG/skills 策略门。所有会改变数据的命令都使用临时 PostgreSQL 或 proof 自建数据库；它不接触生产、真实用户、支付供应商或真实面试录音。

完整面试旅程的 E2E 存活预算固定为 **420 秒**：它覆盖多题、多次澄清、模型评分与报告后台任务的完整收口，不能被误当成接口或模型性能指标。HTTP 与浏览器的延迟、P95（第 95 百分位延迟）和失败率必须由独立性能门报告；若 420 秒内仍无终态，收据会记录事件序号、题数、作答数和报告状态后失败。

### 本地 HTTP E2E 回执契约

`pnpm e2e:isolated` 每次运行都在 `.tmp/e2e-receipts/` 原子写入一个仅本机可信的 JSON（JavaScript 对象表示法）回执。回执固定包含退出码、`passed/failed`、时长、最终断言数、HTTP 客户端（`e2e/full.e2e.ts`、`e2e/helpers/*`、`e2e/ocr-fixture.ts`）、`scripts/run-e2e.mjs`、`scripts/run-e2e-isolated.mjs` 的 SHA-256（安全散列算法）摘要，以及应用前 `packages/db/migrations/` 的数量、最新文件名和整个迁移清单摘要；失败时若 helpers/runner 写出了封闭分类，回执可带 `failureClass`（仅 `api` / `worker` / `db` / `provider` / `capability` / `data_or_permission` / `frontend`）。通过时必须带 `reviewLedger`（同一封闭 `{class,code}`，至少一条 AI/系统终态），缺摘要不得当 opaque pass。不保存 stdout（标准输出）、stderr（标准错误）、提示词、回答、令牌、端点或连接串。没有最终摘要或回执写入失败，一律以非零退出码收口。`pnpm e2e-static-guards:check` 静态核对 live runner 拒绝假服务开关，并对证据/日志 helper（固定清单 + `e2e/helpers/` 自动发现）做密钥扫描（失败即关，报告只含路径和规则名，不回显命中值）。同一守卫拒绝信任 unverified AI path；允许多轮核对（multi-round verify），不把对话摘要当成通过。变更后无 Key 回归入口是 `pnpm regression`；真供应商链路仍是 `pnpm e2e:isolated`，缺 Key 不得写成通过。

该回执的 `releaseEvidence=false` 是强制边界：它不具备 OIDC（开放式身份连接）运行器证明、不可变对象存储或独立验签，不能用于云端发布、简历或质量比较。它只修复“本地运行没有可核验终态”的问题；受信任发布证据仍须走 `quality-assurance-traceability.md` 规定的接收器设计。

**证据更正（2026-08-09）**：此前本页列出的 `79/79`、`1,248/1,248`、浏览器 SSE（服务端发送事件）和 C→B（用户端到企业端）量化结果没有对应的不可覆盖运行回执：`.tmp/e2e-live-current.log` 为 0 字节且没有退出码文件，不能作为发布、简历或横向比较证据。它们仍全部为 `not_run`（未取得可验证终态）。本轮仅重新取得下表第一行的**本地 HTTP**回执；其余项目不能借用这一结果。

| 门 | 样本与依赖 | 实测结果 | 可得结论 |
| --- | --- | --- | --- |
| 全链路 HTTP E2E（端到端） | 临时 pgvector（PostgreSQL 向量扩展）集群、真 API（应用程序接口）/worker（后台工作进程）、已配置真实模型；文本简历、交易、Agent（智能体）图、报告与 B 端收口 | 最近留存运行是 2026-08-09：`pnpm e2e:isolated` 退出码=0，**83** 断言，**296,716 毫秒**；回执 `2026-08-09T23-14-36-512Z-70464-7455e1c1-7453-4c2d-ac7f-bdcb0325cf3b.json` 记录 57 个迁移（最新 `0057_model_invocation_cost_scope.sql`）及 3 个源码 SHA-256（安全散列算法）摘要，`releaseEvidence=false`。当前数据库已经到 64 个迁移，故该回执是历史证据，**不能**写作当前版本通过；需要完整重跑。 | 仅证明当时这条隔离 HTTP 业务链到达终态；不覆盖当前版本、浏览器、OCR、ASR、TTS、真实语音通话、云端依赖、容量或发布。 |
| API 并发回归 | 隔离临时 PostgreSQL 集群 | `not_run`：历史 2xx 数、并发轮数和 P95（第 95 百分位延迟）没有可验证回执 | 不得作为性能预算或容量结论。 |
| 性能门隔离性 | 显式 API/worker metrics（工作进程指标）端口对 | `not_run`：历史并行运行记录不可复核 | 需重新执行并保存每轮目标、端口、退出码和结果哈希。 |
| 浏览器流式去重与窗口 | production Next、临时 PostgreSQL、Chromium（桌面浏览器内核）与 Pixel 5（移动视口） | `not_run`：历史 10,000 逻辑事件/80 节点结果没有可验证回执 | 不得作为前端性能或重放正确性发布证据。 |
| 浏览器 C→B（用户端到企业端）收口 | production Next、临时 PostgreSQL、真实 API/worker、真实模型 | `not_run`：历史 Playwright（浏览器自动化）通过状态不可复核 | 不得作为 B 端闭环、支付或评分质量证据。 |
| 完整浏览器 8 轮与双向语音组合 | production Next、真实 API/worker 与实时 Agent（智能体）流程 | 本轮未取得新的完整可复现终态；此前被测试控制器回收的未结束运行不计作结果 | `not_run`；不得把 8 轮浏览器闭环或双向语音写为已通过。 |
| RAG（检索增强生成）缓存配置 | 生产环境解析规则的 8 个负路径 | 本轮交互式重跑 `pnpm rag-redis-config:prove`：8/8 通过；尚无可归档 release receipt（发布回执） | 仅证明启动前故障关闭；没有受管 Tair（托管 Redis）真实端点、认证、DNS（域名解析）或故障注入证据。 |
| 检索质量、全格式摄取、云端迁移/灾备 | 本轮未取得新的完整可复现实跑结果 | `not_run` | 这些项目不得引用此前数字，也不得用于发布或简历。 |

## 2. RAG 质量与性能必须分开报告

`verify:e2e-performance` 不把外部 embedding（向量化）计入性能预算，因为模型网络、版本和计费都不是稳定的本地依赖。本轮没有形成带冻结数据集、完整请求日志、模型版本和费用账本的检索质量实跑；因此不记录任何外部检索失败或历史小样本。

因此，**当前没有可用于发布、简历或横向比较的新的 RAG 质量分数**。57 条 query 的 fixture 覆盖门仍须保留，但它不是 Recall（召回率）、Precision（精确率）、MRR（平均倒数排名）或 nDCG（归一化折损累计增益）。只有在新建、冻结、双人标注的 holdout（留出集）上取得一次有完整请求日志、模型 revision（版本修订）、费用和分子/分母的成功 rerun（重跑）后，才允许填入这些指标。

已废弃的历史小样本、旧外部基准结果和失败重跑记录不再被保留为项目评测证据，也不得用于比较、简历或发布结论。后续如引入公开或真实脱敏数据，必须新建冻结 dataset revision、记录来源/许可/qrels/模型 revision、完整 rerun 结果与成本，不能继承旧数字。

## 3. 发布边界

- 本文所有毫秒/RPS都是一台开发机单实例的回归预算，不是 P95/P99 线上 SLO（服务等级目标）、容量承诺或高可用证明。
- 当前浏览器语音验收是人↔AI 单麦克风回合；真实人↔人电话的说话人分离、DER（说话人错误率）、跨地域网络、支付供应商回调峰值、真实生产语料 10 万规模 HNSW、浏览器真机耗电/内存仍须独立压测。
- 检索质量需在新建、冻结且双标的真实 holdout 上比较 dense、hybrid、rerank；若非劣不成立，应回退或重调权重，不能只提高 topK。
- `packages/db`、`apps/api` 与 `apps/worker` 的静态类型门本轮已通过；它不替代生产环境依赖、漏洞扫描或容量验证。
- 0044 的 Redis（内存键值存储）热缓存实现已通过静态类型检查；尚未取得受管 Redis/Tair 的真实 endpoint（端点），因此 `RAG_REDIS_TEST_URL=rediss://... pnpm -C apps/worker prove:rag-redis-cache`、32 并发、旧 owner fencing（围栏令牌）、Redis 故障、PostgreSQL 扣费账本、Cluster（集群）与 Tair 故障注入矩阵均为**未证明**。不得以历史 PostgreSQL proof 替代它。
- 生产 Compose 仍以高权限 `meetwise` 数据库登录运行 API/worker；最小权限 runtime login 已有迁移与隔离 proof，但尚未完成全路径切换。单节点 PostgreSQL、备份恢复演练、跨可用区故障转移和告警接收方也未完成；任一项均阻止“100% 高可用”声明。
