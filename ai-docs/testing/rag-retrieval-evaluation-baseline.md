---
id: testing_rag_retrieval_evaluation_baseline
name: RAG 当前发布集评测与发布边界
description: 保留当前 57-query 通用对抗集与新建 35-query 题库 artifact holdout 的真实 embedding 结果，并明确其统计和生产边界。
type: testing
scope: shared
level: guide
status: active
owner: qa
version: 3
tags:
  - rag
  - retrieval
  - evaluation
  - baseline
---

# RAG 当前发布集评测与发布边界

> 本文只保留当前两个新建评测集的结果：通用对抗集 **57 query = 45 条可回答 + 12 条无答案**，以及题库 artifact holdout **35 条自然语言 query**。先前的评测数据不再作为评测、比较或简历口径。以下数字只回答“候选证据是否被找回”，不等于最终答案准确、引用接地、全格式解析质量、企业权限合规或生产 SLA。

## 1. 当前数据集与运行命令

当前数据集为 24 条公开、人工可读的本地技术 chunk 与 57 条 query；不含真实简历、录音或企业资料。45 条可回答 query 包含多证据、指代、ASR/拼写扰动、中英混写、否定与错误前提、长噪声、注入尾巴、撤销冲突和多对象歧义；12 条无答案包含允许受限外查与必须拒绝/澄清的资金、歧视、隐私、破坏性操作。

```bash
pnpm rag:adversarial:fixture:prove
pnpm rag:adversarial:eval
pnpm rag:adversarial:pg-eval
pnpm research-policy:prove
pnpm adaptive-chaos:prove
```

每次 rerun 都应记录数据集 revision、embedding 模型 revision、语料/recipe、候选 K、运行时间、失败率和成本；不得复用本文数字给不同模型或不同语料。

## 2. 当前真实 embedding 结果

`pnpm rag:adversarial:eval` 使用真实 `text-embedding-v4` 1024-d embedding，对 45 条可回答 query 的 24-chunk 本地语料进行候选排序：

| 路径 | Hit@5 | Recall@5 | strict-all@5 | MRR | nDCG | MAP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| dense | 100.0% | 74.7% | 55.6%（25/45；Wilson 95% 下界 41.2%） | 0.893 | 0.770 | 0.698 |
| dense + BM25 + RRF（通用合成集的 top-24 候选消融） | 100.0% | 79.1% | 62.2%（28/45；Wilson 95% 下界 47.6%） | 0.871 | 0.779 | 0.707 |

同次离线，RRF 相对 dense 的变化是：Recall@5 `+4.4pp`、strict-all@5 `+6.6pp`、nDCG `+0.009`，同时 MRR `-0.022`。真实 `gte-rerank-v2` 在同一候选池反而退到 Recall@5 `74.7%`、strict-all@5 `55.6%`、nDCG `.733`，且 rerank 单 query 延迟 p50/p95 为 `889.1/1801.9ms`，因此当前版本不接入 reranker。正确结论是“RRF 在这个小型通用合成集增加多证据覆盖、该 reranker 不通过本轮门”，不是“混合检索已在生产提升”，更不是当前题库默认策略的依据。

### 指标含义

| 指标 | 定义 | 当前数值实际说明 |
| --- | --- | --- |
| Hit@5 | top-5 至少有一条必需证据的 query 占比 | `100%` 只说明每题碰到一点相关资料。 |
| Recall@5 | 找回的必需证据数 / 所有必需证据数 | hybrid 找回了更多多证据资料，但仍漏 `22%`。 |
| strict-all@5 | top-5 找全所有必需证据的 query 占比 | hybrid 仍有 `18/45` 道多证据题不完整，不能强答。 |
| MRR | 第一个相关证据的倒数排名均值 | hybrid 不是所有排序维度都更高。 |
| nDCG / MAP | 多相关证据的折损排序质量 / 平均精度 | 用于选择候选策略，不能替代 citation 或回答事实性。 |

### 分桶结果（只报当前发布集）

| 桶 | query 数 | hybrid Recall@5 | hybrid strict-all@5 | 直接暴露的缺口 |
| --- | ---: | ---: | ---: | --- |
| 改写 | 7 | 88.9% | 85.7% | 仍有近义表达漏证据。 |
| 多证据 | 9 | 77.8% | 44.4% | 最大的“命中一条但回答不完整”风险。 |
| 否定/取舍 | 8 | 84.6% | 75.0% | 错误前提与约束仍需答案层验证。 |
| 噪声/ASR/中英混写 | 10 | 72.7% | 50.0% | 拼写、长噪声和代码样式拉低完整证据覆盖。 |
| 指代/上下文 | 6 | 81.8% | 66.7% | 候选池扩大有帮助，但单 query 文本不能替代真正的多轮实体消解。 |
| 注入尾巴 | 5 | 77.8% | 60.0% | 检索到文本不等于可执行；必须继续走 data envelope 与 skill policy。 |

## 3. 当前题库 artifact holdout：决定实际默认检索策略的运行

`pnpm qbank:retrieval:eval` 使用真实 `text-embedding-v4` 的 `512` 维 query embedding，评测 33 个当前启动题库业务工件、132 个 role-labelled chunk 与**新建冻结的 35 条自然语言 holdout query**。query 不直接复用题目标题，覆盖改写 14 条、错别字 1 条、中英混写 22 条、多证据 11 条、约束条件 22 条和歧义 2 条；它只衡量“命中 chunk 后聚合为完整题目工件”的排序，不含无答案、真实简历、企业语料、组织 ACL 或全格式文档。

Worker 真实形状是：每个通道最多产生 96 个候选 chunk，策略返回前 12 个 chunk，随后数据库将其聚合为最多 5 个完整 question artifact。结果如下：

| 策略（均复现上述 Worker 形状） | Hit@5 | Recall@5 | strict-all@5 | MRR | nDCG | MAP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| dense（当前默认） | 100.0% | 100.0% | 100.0%（35/35） | 0.820 | 0.863 | 0.815 |
| lexical | 88.6% | 84.2% | 85.7%（30/35） | 0.728 | 0.760 | 0.720 |
| dense + BM25 + RRF | 94.3% | 89.5% | 91.4%（32/35） | 0.826 | 0.848 | 0.817 |

因此代码默认 `dense`，而 `rrf` 必须以显式 `RAG_QBANK_RETRIEVAL_MODE=rrf` 试验；策略也进入 HMAC cache identity，两个策略绝不共享陈旧排序。这个决定不是“dense 永远优于 RRF”：这个 holdout 与 33 个启动题同域、规模小，错别字仅 1 条、歧义仅 2 条，并且没有独立外部标注者。它是对当前自有题库更诚实的默认选择；脱敏双标真实语料的冻结 holdout 才能批准或否决下一次策略切换。

复现命令：

```bash
pnpm qbank:retrieval:fixture:prove
pnpm qbank:retrieval:eval
pnpm rag-generation:prove
pnpm rag-cache:prove
```

## 4. legacy PostgreSQL / RLS compatibility 路径

`pnpm rag:adversarial:pg-eval` 在临时独占 PostgreSQL 中实际走旧兼容结构：

```text
真实 embedding → pgvector → app_role/RLS → qbank_visible_ref → annSearch
```

本轮 57 条 query 完整运行 `71,327ms`；45 条可回答的 dense 结果为 Recall@5 `74.7%`、strict-all@5 `55.6%`、MRR `0.893`、nDCG `0.770`，与离线 dense 一致。12 条无答案 `use_local=0/12`。

这个实验只有 24 chunks，实际 query plan 为 `uses HNSW=no`。它只证明旧 `vector_chunk`/`annSearch` 兼容路径的 RLS、可见集和检索连接；它**不**证明当前 generation-aware `hybridQbankSearch`、artifact evidence、HNSW 在 10 万文档上的 P95、召回、索引大小或成本。真实 serving 路径仍须单列受治理验收。

## 5. 无答案、敏感输入与异常多轮状态

| 合同 | 当前结果 | 解释 |
| --- | ---: | --- |
| 无答案不直接当本地证据 | `12/12` | `use_local=0`；不等于所有请求都应拒绝。 |
| 明确高风险请求安全终态 | `8/8` | 资金、歧视招聘、隐私外泄、破坏性操作得到 `refuse` 或 `deny_external`，不发生 local/web/deep retrieval。 |
| 允许外查输入的误拒 | `1/3` | 当前窄策略偏保守；禁止写“安全/路由准确率 100%”。 |
| policy → CRAG 表驱动矩阵 | 32 条，其中 20 条零 egress | 覆盖零宽/全角、混合语言、引用攻击、工具升级、错误前提等明确规则合同。 |
| Agent 多轮 chaos | 96 固定 seed 序列 | 全部 <40 次 resume 收敛。夹具显式锁 `maxTurns=8` 且 `absoluteMaxTurns=8` 故出题 ≤8（控费）；生产默认是派生软预算 + 可上调 + 绝对杀开关 120。完成态不复制原始异常回答。 |

`researchBoundary` 是面试 research 的窄 egress policy，不是通用意图识别器，更不能作为所有 RAG 的授权器。

## 6. 当前可说与不可说

可以说：当前 57-query 通用对抗集在真实 embedding 与 RLS 路径均已实跑；其 RRF 消融在该集的多证据 Recall/strict-all 有 `+4.4pp/+6.6pp` 的离线增量；35-query 当前题库 artifact holdout 上 dense 为 `100.0%/100.0%` 而 RRF 为 `89.5%/91.4%`，因此当前默认 dense；同一通用集的真实 reranker 发生回退，因而没有接入；高风险样本的零 egress 合同、generation、CAS、tombstone 和缓存防击穿有独立证明。

不能说：生产 RAG 已达标、35/35 等于真实用户乱问已覆盖、全格式 RAG 可上线、ANN/HNSW 性能已验证、引用完全接地、无答案处理全正确、企业 org ACL 已完成、dense 永远优于 hybrid，或 hybrid 在真实生产语料上已提升。

发布前仍需：脱敏双标真实语料、独立 holdout、真实全格式解析与 citation 评测、组织级 ACL、production-sized ANN brute-force 对照、P95/P99/cost 以及 RTO/RPO 演练。
