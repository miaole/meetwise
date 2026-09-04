---
id: delivery_resume_project_highlights
name: Meetwise 项目亮点与简历量化表述
description: 将已验证的 Agent、RAG、可靠性和前端性能证据转换为诚实、可追问的简历与面试表述。
type: guide
scope: shared
level: delivery
status: active
owner: product-architecture
related:
  - ../testing/rag-retrieval-evaluation-baseline.md
  - ../testing/e2e-performance-evidence.md
  - ../architecture/ai/rag-production-release-runbook.md
  - ../requirements/use-cases/expert-interview-coach-rag-runtime.md
---

# Meetwise 项目亮点与简历量化表述

## 使用原则：简历写“我做了什么 + 在什么条件下测得什么”，不要写脱离分母的百分数

一条能经得起追问的项目描述包含五件事：业务对象、技术决策、失败边界、指标的分子/分母、证据命令。比如“Recall@5 79.1%”不合格；它至少缺少语料、query 数、是否多证据、是否线上、是否有权限过滤。

本文件中的 **已验证** 只能按原句使用；**目标态** 只能写到方案/规划里；没有数据的内容不要塞进简历。所有百分数均为本仓库 2026-08-03 的本地可复现实验，不是生产 SLA。

## 1. RAG 指标地图：简历与面试分别该讲什么

| 层 | 指标 | 分子 / 分母 | 解决的误区 | 当前可写状态 |
| --- | --- | --- | --- | --- |
| 候选命中 | `Hit@k` | 至少命中 1 个相关 chunk 的 query / 可回答 query | “有没有找到一点相关内容” | 可报告，但不能单独代表 RAG 质量。 |
| 证据召回 | `Recall@k` 或 `EvidenceCoverage@k` | 已找回的必需证据数 / 全部必需证据数 | 一题需要 2–3 份材料时，Hit@k 会虚高 | 关键指标。 |
| 完整性 | `strict-all@k` | 必需证据全部在 top-k 的 query / 可回答 query | 只找到一份证据却强答 | 多证据 RAG 必报。 |
| 排序 | `MRR`、`nDCG@k`、`MAP` | 相关证据的位置折损聚合 | 相关证据排第 5 和排第 1 对生成成本不同 | 用于比较 dense / lexical / RRF / rerank。 |
| 无答案 | `local-suppression`、abstain/clarify precision & recall | 未把无答案当本地回答的样本 / 无答案样本；或正确拒答/澄清的比例 | “没有命中”不等于“能安全外搜” | 当前只对窄 policy 有合同级证明。 |
| 引用 | citation precision / completeness / locator resolve rate | 正确且支持主张的 citation / citation；已被引用的必需事实 / 必需事实；可回跳原件 / citation | 找到 chunk 不代表回答有依据 | 生产发布必须有；全格式真实数据尚未测。 |
| 安全 | cross-tenant / revoked / stale citation count | 越权、撤回资料、失效引用的返回数 | 高 Recall 不能覆盖数据泄露 | 这类确定性不变量目标为 `0`。 |
| 工程 | P50/P95/P99、error rate、cost/query、cache hit、duplicate embedding | 从入口到 evidence-ready 的延迟/失败/成本 | 平均延迟或单请求成功不能证明可规模化 | 必须按缓存冷热、tenant、generation 切片。 |

## 2. 当前已经实测、可写进简历的 RAG 证据

### 2.1 异常检索集：只使用当前 57-query 发布集

当前固定的本地合成对抗集共有 **57 条 query**：`45` 条可回答、`12` 条无答案。它覆盖多证据、指代、ASR/拼写扰动、中英混写、否定与错误前提、长噪声、注入尾巴、版本/撤销冲突、敏感资金/招聘/资料外泄请求。真实 `text-embedding-v4` 的最新离线候选排序结果为：

| 路径 | 可回答 query | Hit@5 | Recall@5 | strict-all@5 | MRR | nDCG | 可得结论 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| dense | 45 | 100.0% | 74.7% | 55.6%（25/45） | 0.893 | 0.770 | 存在“命中一条、漏掉必要证据”的明显缺口。 |
| dense + BM25 + RRF（通用合成集离线消融） | 45 | 100.0% | 79.1% | 62.2%（28/45） | 0.871 | 0.779 | 相对 dense：Recall `+4.4pp`、strict-all `+6.6pp`；这不是生产语料、线上提升或当前题库默认策略结论。 |

对 12 条无答案输入，`use_local=0/12`；其中 8 条要求拒绝/澄清的高风险请求，安全终态（`refuse` 或 `deny_external`）为 **8/8**。另有 3 条允许受限外查的输入中，1 条被错误拒绝，因此不能写“无答案处理 100% 准确”。

同一 57-query 集还真实走过临时 `pgvector → app_role/RLS → qbank_visible_ref → annSearch`，本轮完整运行总耗时 `71,327ms`，质量数字与 dense 一致。这个 fixture 只有 24 chunks，计划显示 `uses HNSW=no`；简历中只能将它表述为“检索/RLS 接线证明”，不能写成 ANN 吞吐或 10 万语料性能。

证据命令：

```bash
pnpm rag:adversarial:eval
pnpm rag:adversarial:fixture:prove
```

### 2.2 当前题库检索策略：只能写成“策略门禁”，不能包装成用户质量

新的题库 artifact holdout 固定为 **33 个启动题、132 个 role chunk、35 条自然语言 query**。它严格复现 Worker 的“每通道最多 96 个候选 chunk → 返回 12 个 chunk → 聚合最多 5 个完整题目”路径。真实 `text-embedding-v4` 512 维结果：dense 的 `Recall@5/strict-all@5 = 100.0%/100.0% (35/35)`，RRF 为 `89.5%/91.4% (32/35)`，所以当前默认 dense；cache key 也包含 retrieval policy，防止两种排序共享结果。

这不是一条可写成“RAG 召回 100%”的简历指标：语料与 query 同域、仅 35 条、错别字 1 条、歧义 2 条，没有企业语料、无答案、独立双标或线上用户。可写的事实是“用冻结 holdout 反驳了默认混合检索假设，并将策略切换与缓存隔离纳入发布门”；数值与边界必须能当场说明。

证据命令：

```bash
pnpm qbank:retrieval:fixture:prove
pnpm qbank:retrieval:eval
pnpm rag-generation:prove
pnpm rag-cache:prove
```

### 2.2 发布、撤销和并发不是语义指标，但能形成项目亮点

| 能力 | 已验证口径 | 证据 |
| --- | --- | --- |
| RAG generation 控制面 | **14 条**独立 PostgreSQL 状态机/RLS断言：不可变 recipe、快照、shadow gate、`1→10→50→100`、CAS、binding、citation、删除传播、rebuild lease | `pnpm rag-corpus-version:prove` |
| 题库 generation | **23 条**完整迁移 PostgreSQL 断言：recipe mismatch（配方不匹配）故障关闭、来源/池/正文哈希一致、已发布工件和映射不可原地改写、任一映射块撤销、cache（缓存）、active/rollback pointer（活动/回滚指针） | `pnpm rag-generation:prove` |
| 缓存防击穿 | `12` 并发 miss 每轮实际为 `1` 次 embedding + `11` 个等待命中；连续 `5` 轮通过 | `pnpm rag-cache:prove` |
| 异常输入 egress | **32 条**表驱动输入，其中 `20` 条高风险/注入/混淆输入在 CRAG 前零 local retrieval、零 web/deep egress | `pnpm research-policy:prove` |
| 多轮 Agent 收敛 | **96 条**固定 seed 异常回答序列；全部在 `<40` 次 resume 收敛。该夹具显式锁 `maxTurns=8` **且** `absoluteMaxTurns=8` 故出题 `≤8`（控费，不是生产长度）。生产默认：软预算按覆盖计划派生且可上调；绝对杀开关 120 只防 runaway。完成态不保留原始异常回答 | `pnpm adaptive-chaos:prove` |

这些是确定性合同，不是用户体验满意度、真实 ASR 质量或云上容量数据。

## 3. 可直接使用的简历版本

### 版本 A：偏 AI/RAG 工程师

- 设计面试 Agent 的 generation 化 RAG：将语料快照、chunk recipe、embedding revision、索引、检索策略和 ACL 纳入不可变 artifact；实现数据库 CAS 切流、会话 binding、shadow gate、灰度与 citation/tombstone 回溯，覆盖 14 条 PostgreSQL 状态机与 RLS 不变量。
- 构建 57 条非 happy-path RAG 对抗集（45 可回答、12 无答案），用真实 embedding 做 dense 与 RRF 消融：`Recall@5 74.7% → 79.1%`、`strict-all@5 55.6% → 62.2%`；同时在另一个 35-query 当前题库 holdout 发现 RRF 退到 `89.5%/91.4%`，因此默认策略保持 dense；真实 reranker 在通用集回退，故未接入。所有结果限定为本地合成语料离线实验，不包装为生产提升。
- 实现 RAG cache 的 tenant/权限/epoch 隔离与 single-flight 防击穿；12 个并发 miss 实测每轮仅 1 次 embedding 调用，并验证撤销与 RLS 失效路径。
- 将 Web/deep research 约束为静态只读 skills；32 条高风险/注入/混淆输入中 20 条在检索与外呼前被阻断，避免把数据文本升级为工具权限。

### 版本 B：偏后端 / 分布式可靠性

- 为可恢复 LangGraph 面试流程构建 durable checkpoint、question identity、graph fence、幂等事件与租约恢复边界；96 条异常多轮序列全部在有限轮数收敛，完成态不保存原始回答。
- 将 RAG 索引发布实现为 generation + database CAS：构建 G2 不影响 G1，稳定 key 灰度，旧会话固定 generation；删除/撤销跨 retained generation 传播并使 citation 失效。
- 为检索缓存实现权限隔离、语料 epoch 失效和并发防击穿；以真实 PostgreSQL proof 验证 12 并发 miss 下 `1` 次 embedding 调用和 `11` 个等待命中。

### 版本 C：只有一行项目空间时

> 构建带版本控制与可恢复状态机的 AI 面试平台：以 generation/CAS/binding 管理 RAG 发布与回滚，设计 57 条非 happy-path 评测集并完成 dense/RRF 消融，同时用冻结的当前题库 holdout 阻止未经验证的检索策略切换，并以 RLS、撤销传播与受限 skills 防止越权检索和外呼。

这条只有在你能解释“离线、本地合成、45 条可回答 query、不是线上指标”时才建议使用。

## 4. 面试官追问时的回答卡

| 简历数字 | 面试官可能追问 | 必须回答 |
| --- | --- | --- |
| Recall@5 79.1% | 为什么不是 100%？ | 45 条多证据 query 共用 24 个 chunk；Hit@5=100% 但 strict-all 仅 62.2%，说明常找到一条却漏关键证据。 |
| `+4.4pp` | 是不是线上提升？ | 不是；这是通用本地合成语料上的离线 RRF ablation，而且另一套当前题库 holdout 反而选择 dense。生产发布必须用脱敏双标 holdout、真实可见集、延迟与成本门。 |
| 8/8 安全终态 | 能否证明所有攻击都拦住？ | 不能；它只证明 8 条明确高风险样本经窄 egress policy 不会检索或外呼。未知表达仍需要产品授权、澄清和人工流程。 |
| CAS 发版 | 怎么防并发发布覆盖？ | `UPDATE active_pointer ... WHERE generation_id=expected`；影响 0 行就停止并重读，不能盲写。 |
| 12 并发只调用一次 embedding | 上游很慢怎么办？ | lease 必须覆盖上游超时或有 heartbeat；否则 lease 过期仍可能重复调用，因此要监控 duplicate-work，不能把正常延迟测试当完整证明。 |

## 5. 禁止写法

- “RAG 召回率 97% / RAG 准确率 100%。”没有当前数据集版本、分子/分母和评测边界的单一数字，不能代表多证据、真实用户或回答准确性。
- “生产级 100% 高可用。”当前没有多区域、真实 RTO/RPO、生产规模语料与 DR 演练证据。
- “Hybrid/Rerank 线上提升 xx%。”当前 RRF 的 `+4.4pp/+6.6pp` 仅是一个通用本地离线合成集的结果；另一个当前题库 holdout 选择 dense，同集 rerank 实测回退，尚未形成真实语料上的线上提升结论。
- “覆盖所有 prompt injection。”目前是固定表驱动样本与明确 contract；攻击表达可无限变体。
- “语音双人通话已完成。”当前只证明单端语音路径，不包含真实电话双轨、diarization 或身份归因。

## 6. 下一版简历可以补齐的指标

在真实脱敏语料、双标 qrels、全格式摄取和线上 observability 完成前，下面只能列为待测：PDF/Excel/PPT/视频的 extraction F1、OCR/ASR WER、table linkage F1、citation precision/completeness、locator resolve rate、abstain/clarify precision/recall、ACL leak count、production P95/P99/cost/query、RTO/RPO、人工复核率与申诉后校准。
