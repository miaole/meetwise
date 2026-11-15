---
id: architecture_backend_data_evolution
name: 数据演进（embedding 蓝绿 / 记忆和解 / prompt eval-gate · MVP 精简集）
description: 三类「可演进数据」的版本化与晋升契约：qbank 向量世代蓝绿、长期记忆冲突和解、prompt 版本注册与 invocation 台账。按当前实现写（每节带消费点），超出实现处显式标注「未实现·后续刀」，不把目标当现状。
type: reference
scope: shared
level: spec
status: active
owner: architecture
version: 1
tags:
  - data-evolution
  - blue-green
  - embedding
  - memory-reconciliation
  - prompt-versioning
related:
  - ../ai/rag-corpus-lifecycle.md
  - ../ai/memory-context-design.md
  - ../backend/api-versioning.md
  - ../../requirements/use-cases/model-invocation-reliability.md
  - ../../delivery/production-backlog.md
---

# 数据演进（embedding 蓝绿 / 记忆和解 / prompt eval-gate · MVP 精简集）

按**当前实现**写（0029+0065–0072 世代链 · 0093/0095/0099/0102/0105 记忆治理链 · 0119/0181 prompt 观测链），
每节带消费点；产品目标超出实现处显式标「未实现·后续刀」。Ban 把本文当任何 SSOT 翻行证据、
Ban 把 MVP 精简集说成运营规模能力。

## 0. 总纲：三类可演进数据的共同纪律

- **版本先行**：可演进数据（向量世代、长期记忆事实、prompt 模板）的每次演进都落**新版本**而非原地覆盖；
  旧行不删不改（append-only 或显式状态机迁移），演进可审计可回放。
- **晋升有闸**：新版本吃流量前必须过各自的闸（世代=完整性校验+原子翻针；记忆=和解状态机+治理门；
  prompt=注册表 version 提升+代码评审）。闸不存在的地方如实标「未实现」，不宣称有门。
- **回滚是常规操作**：蓝绿的意义=翻回去即可；记忆冲突永不静默覆盖（显式 `contradicts`/`supersedes` 关系）；
  prompt 回放靠台账里冻结的 `prompt_version`。

## 1. embedding 蓝绿（qbank 检索世代模型）

**已实现**。向量是可重建派生物；换代=新 generation 分区从零构建，不原地重嵌。

- **配方（recipe）**：`qbank_embedding_recipe`（model/revision/dim/chunker/normalization receipt）——
  换 embedding 模型=新 recipe（`packages/db/src/qbank/`，0029 引入）。检索侧 query recipe 不匹配
  active generation、向量维度不符 → fail-closed（不比较旧空间）。
- **世代（generation）**：每代一个 `qbank_generation_chunk` 分区 + partial HNSW；builder 从 approved
  source/pool/chunk 事实（正文摘要谓词冻结）构建；完整行数与 `qbank_corpus_epoch` 一致才可 validate。
- **原子翻针**：`qbank_activate_generation(text)`（0029:341 定义、0066 收权到 `qbank_control_executor`）
  翻 `qbank_active_generation` 单行指针；**回滚=翻回 retired generation，且仅当正文语料 epoch 未变**。
  九个 SECURITY DEFINER 函数在 FORCE RLS 下持有七张控制关系行可见性（0070–0072）。
- **消费点**：`qbank-generation-retrieval.ts`（active 元数据+检索+evidence 受限函数）；查询侧 revoke 后
  请求路径对原始题库表零读取（0067）；撤销/改版经 `visible=false` + 新 refId 新条目（append-only）。
- **证**：`pnpm rag-generation:prove`（28/28）`pnpm qbank-integrity-upgrade:prove`（18/18）
  `pnpm qbank-control-role:prove`（8/8）`pnpm qbank-corpus-version:prove`（20/20）——全部
  `releaseEvidence=false`。
- **未实现·后续刀**：通用/全格式 RAG 的 rebuild/outbox worker 与请求热路径接线（控制面与本地合同已在、
  见 `rag-corpus-lifecycle.md` 残余节）；生产 shadow/canary 指标采集；孤儿世代自动回收。

## 2. 记忆和解（长期记忆冲突状态机）

**已实现**。长期记忆不是「内容+embedding+score」的表——一切跨会话信息先经候选门，冲突永不静默覆盖。

- **状态机**：`candidate → awaiting_confirmation → active → superseded / disputed / expired / revoked /
  fenced → purged`（`memory-context-design.md:162`）；模型只可创建 `candidate`，用户确认或受信业务
  验证才可定 `active`/`superseded`/`disputed`。
- **和解（adjudication）**：新候选与旧事实写入显式 `contradicts` 或 `supersedes` 关系（单值 key 同时
  只有一个 active；多值 key 走 policy 并存规则）。确定性校验与边界 fail-closed 在
  `packages/domain/src/memory-fact-adjudication.ts`（subject/factKey/长度/控制字符闸）。
- **治理链（消费点）**：0093 记忆治理（RLS+owner 面）· 0095 admission 元数据门 · 0099 fact adjudication ·
  0102 index generation 治理 · 0105 两段 recall（粗排+复核，检索命中也只是候选材料）。运行时面
  `memory-governance.ts` / `memory-admission.ts` / `memory-two-stage-recall.ts`；会话开始冻结
  `snapshotId`，RLS 过滤后 Top-K 只作 hint。
- **证**：`pnpm memory-governance:prove` · `pnpm memory-admission:prove`（隔离真 PG，`releaseEvidence=false`）。
- **未实现·后续刀**：和解的自动仲裁（模型裁决冲突优先级）按设计**不建**（确定性优先，模型只提候选）；
  跨 owner 记忆合并、记忆膨胀的自动归档策略未实现。

## 3. prompt 版本注册与 eval-gate

**观测面已实现；自动评测门未实现（如实标注）。**

- **注册表（单一真相）**：`packages/ai-runtime/src/prompts.ts`——每 service 的 system 指令带 version
  常量（八值），`getPrompt`/`promptVersions()` 单一装配源；**改 prompt = 升 version**（调用方零改）。
  system 是稳定可缓存前缀（跨调用字节相同），不可信数据只在 user `<data>` 段——供应商 prompt cache
  命中的结构前提。prompts.ts 字节有 pin 面（ag19 proof git blob sha 对表）。
- **台账观测**：`ai_model_invocation.prompt_version`（0181，AG-19）+ usage reconciliation（0119）——
  claim 时冻结 prompt_version（identity-immutable，claim 后 UPDATE 拒）；四类 outcome 全落；metric
  版本标签有界负证（渲染值 ⊆ registry ∪ 'none'）；trace/Langfuse 附带 `promptVersion` 标量（脱敏：
  无 prompt 原文）。同内容不同 prompt_version → request_digest 恒等（版本非语义输入·幂等/缓存零位移）。
- **当前的 eval-gate = 什么在闸**：prompt 版本提升走**代码评审 + 字节 pin + invocation 台账回放**——
  台账让「新版本实际表现」可对比（回放同 request_digest 下新旧版本），但**没有**自动评测集
  （golden task 全量回归在 `pnpm regression`/e2e 层间接覆盖模型行为，不构成 prompt 级 eval 门）。
- **未实现·后续刀**：prompt 候选版本自动 eval 门（评测集打分 ≥ 基线才可晋升 registry）、金丝雀
  版本并行分流（同 request 双版本影子对比）、eval 结果落台账。这三件是「eval-gate」的自动化残面，
  MVP 不阻塞买云——现有闸（字节 pin+评审+台账）保证可审计可回放，不保证统计显著优于旧版。

## 4. Ban 清单（本文防自欺）

- Ban「prompt 已有自动 eval 门」（没有——只有注册表+台账）。
- Ban「通用 RAG 可蓝绿」（qbank 世代可；通用 RAG rebuild/outbox worker 未建）。
- Ban「记忆冲突可静默覆盖」（状态机+显式关系；模型只可提 candidate）。
- Ban 把 33 条种子语料/generation 合同说成运营规模向量运营。
- Ban 把本文名称当 covered flip 或生产宣称（`releaseEvidence=false` 全程）。
