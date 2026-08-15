---
id: adr_0016_rag_corpus_version_control
name: ADR-0016 全格式 RAG 版本控制面
description: 语料内容、切块、向量空间、评测、灰度、冻结读取、回滚和删除为何必须由同一可审计控制面约束。
type: reference
scope: shared
level: guide
status: accepted
owner: architecture
related:
  - ./README.md
  - ../ai/rag-corpus-lifecycle.md
  - ../../testing/full-format-rag-evaluation.md
---

# ADR-0016 全格式 RAG 版本控制面 · accepted

## 背景

“embedding model version”不是 RAG 版本。解析器、清洗规则、表格序列化、切块边界、document/query transform、模型 provider revision、向量维度、候选池、重排参数和语料内容任一项改变，都可能改变召回与引用。因此只在向量行上覆盖 embedding 会造成四类不可审计故障：

1. 新旧向量空间混算，距离失去语义；
2. 一次文档更新覆盖历史 citation，用户无法回看当时依据；
3. 迁移中的删除被异步回填复活；
4. 切换、回滚和灰度没有可比较的语料快照，事故时无法定位。

题库已有独立 generation 路径，但全格式语料不能借用“单题单向量”或“直接更新 active index”的模式。

## 决定

建立 PostgreSQL 内的通用 RAG 版本控制面，语料事实与向量派生物分离：

1. 文档每次变更创建不可变 `content_version` 与 chunk；chunk 保存 locator、内容 hash、解析/清洗/切块 receipt。
2. embedding recipe 必须记录 provider、model、revision、dimension、normalization、chunker hash、document/query transform 的完整 manifest，注册后不可修改。
3. generation 从一个 `corpus_epoch` 冻结成员清单开始，并写入独立、固定维度的物理 `rag_vector_*` 表；building 代际不参与服务。
4. 发布状态机固定为 `building → shadow → gated → active → deprecated → retired`。shadow 必须通过带样本量、Recall、P95 和成本的 release policy；灰度只能按 `1 → 10 → 50 → 100` 递进；最终切换用 active pointer CAS。
5. 每个请求/会话创建 `rag_query_binding`，记录稳定 key hash、generation、recipe 与到期时间。已经绑定的会话可以读 retained generation；新会话绝不在 corpus epoch 已漂移时悄悄读取旧代际。
6. delete/erasure 写 tombstone，遍历所有 retained physical generation 删除向量并 invalidates citation；任何新的 vector 写入先验证成员和 tombstone。
7. 运行态由 `rag_rebuild_run` 的租约、心跳和 cursor 管理，防止两个 worker 同时推进同一回填。

`qbank` 继续使用自己的专用 generation 和治理规则。通用控制面不反向修改 qbank 的 schema、缓存或撤销语义。

## 被否方案

| 方案 | 否决原因 |
| --- | --- |
| 仅给 `vector_chunk` 增加 `model_version` | 无法表示清洗/切块/transform 变化；无法阻止跨空间比较。 |
| 原地 UPDATE active 向量 | 读写竞态会覆盖在线更新、删除和 citation 历史，回滚需要重嵌。 |
| 只在应用内保存 active generation | 多实例切换会裂脑；数据库 CAS 才能给出单一线性化切点。 |
| 把全格式摄取和发布做成 LangGraph | 摄取/回填是 worker 数据管道，不是用户对话状态机；图 checkpoint 不能替代 DB generation/lease。 |
| 只有 shadow 分数、没有 frozen binding | 长会话会在中途换语料版本，评分、引用与追溯口径分裂。 |

## 后果与验证

实现始于 `0032_rag_corpus_version_control.sql`，并由 `0073_rag_control_plane_identity_isolation.sql`、`0074_rag_rebuild_request_fence.sql`、`0079_rag_control_acl_allowlist.sql`、`0080_rag_control_executor_membership_allowlist.sql` 与 `0081_rag_control_dispatch_concurrent_replay.sql` 将通用控制授权从可伪造会话变量迁至独立控制登录、双安全定义者、受信 schema（模式）、直接 ACL/成员闭包 allowlist、request-fenced（请求围栏）rebuild lease，以及单 attempt 的并发 dispatch 收敛。`pnpm rag-corpus-version:prove` 当前覆盖 **20 条**隔离 PostgreSQL（关系型数据库）断言；另有 `pnpm rag-control-role:prove`（19 条）、`pnpm rag-control-upgrade:prove`（4 条）和 `pnpm rag-control-dispatch:prove`（6 条）覆盖低权身份、0032 历史物理表隔离、请求绑定/并发派发/未知终态化。全部是本地回执，`release_evidence=false`。

这个结果仅证明控制面状态机。它不代表 Office/OCR/ASR 解析已接线，不代表 B 端组织 ACL 已接线，也不代表生产 10 万语料的 Recall、P95、成本、可用性或真实流量灰度已经达标。只有请求入口开始调用 binding API、生产规模标注集通过预注册门、发布/监控/回滚 runbook 演练完成后，才能把它称为线上全格式 RAG serving。
