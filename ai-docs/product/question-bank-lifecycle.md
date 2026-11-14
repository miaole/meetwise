---
id: product_question_bank_lifecycle
name: 题库生命周期（org 私有 / 富化 / 版本 pin / 采纳审核 / PII 泛化）
description: 题库条目从提议、审核、发布、检索服务到退休/擦除的全生命周期契约。按当前实现写（每节带消费点），设计扩展显式标注「未实现·后续刀」，不把目标当现状。
type: reference
scope: shared
level: spec
status: active
owner: product
version: 1
tags:
  - qbank
  - lifecycle
  - org-private
  - taxonomy
related:
  - ../architecture/backend/qbank-partition-lifecycle-ops.md
  - ../architecture/ai/research-capability-gate.md
  - ../rules/security/secrets-management.md
  - ../delivery/gap-bug-backlog.md
---

# 题库生命周期

按**当前实现**写（0140-0234 治理链 + 0201 服务过滤 + 0162 已出题台账），每节带消费点；产品目标超出实现处显式标「未实现·后续刀」。Ban 把本文当任何 SSOT 翻行证据。

## 1. 源状态机（propose → review → pool → artifact）

- **提议**：任何 principal 经 `proposeSource` 落 `pending`（`added_by`=提议者）；`content_hash` 去重幂等——同内容多 refId 共享一源（`qbank-curation.ts:68`，源 PK=sha(content_hash)）。
- **审核**：`approveSource` / 拒绝走 `ReviewDecision = 'approved' | 'rejected'`（`qbank-curation.ts:20`）；**审核人归因**（AG-43）：org 维护面通道传 `reviewerScope` 时 `reviewed_by`=服务端信任根派生的 reviewer（非 GUC 非系统账号兜底）；未传=既有链（系统 seed 自动审核臂 `__system_qbank__` 归因如实保留）。
- **AG39 org 信任根**（0186）：`qbank_org_curator`（org_id+user_id 二维白名单，沿 0013 `qbank_curator` 平台形）——org 私有源的审核人须 ∈ 该 org curator 或平台 curator（内容安全兜底审核/撤回权）。
- **拒绝尊重**：`rejected` 源重灌**不复活**（`qbank-ingest.ts:261`）；已有活跃源复用不重建。
- **未实现·后续刀**：「采纳双签」（双人独立 approve 才可发布）当前**不存在**——现形=单 curator 审核信任根 + 归因。org 规模化采纳前按本节目标补第二签位（登记面：本节即产品意图锚）。

## 2. 发布与内容不可变

- **refId 内容不可变守卫**：同一 refId 已有**不同 content_hash** 的治理块=「改版」→ 拒绝（DB 是 refId 键的 append-only 池；pool 条目 PK 随 ref_id 派生，source/chunk PK 随 content_hash——`qbank-ingest.ts:4-14` 头注）。改题=新 refId 新条目，旧条目不下架不覆盖。
- **published 完整性**：prompt+rubric 必备（`qbank-ingest.ts:87`）；发布 artifact 与 chunk 角色逐题绑定（禁共享题干预算 #76 病灶）。
- **PII 泛化**：入池即结构化（prompt/rubric/followUp/antiPattern 字段化，非整篇文本）；seed 通道 `annotationSource='seed_v1_reviewed'` 显式标记来源；跨 owner 相等性只走 digest（org dedup 见 §3），原文不进相等性判定。

## 3. 版本 pin 与检索服务面

- **taxonomy 版本**：v1 冻结（0086）；v2 draft→released 走 manifest hash 收据（0234 形：scope 全量写入→`SET CONSTRAINTS ALL IMMEDIATE`→`qbank_taxonomy_manifest_hash` 翻 released）。发布 artifact 携 `taxonomyVersion` + `servingScopeId`，服务端校验与检索计划一致（不一致 fail-closed `taxonomy_not_current`——`qbank-track-local-retrieval.ts`）。
- **org 私有与平台补足**：检索按 `app.qbank_serving_scope` / `app.qbank_taxonomy_version` GUC 过滤（0201 `:87-90` 空值不 match-all），org 私有池优先、platform 池补足（owner_rank org dedup）。
- **已出题台账**：0162 `qbank_served_question_ref` 同 interview 已出题不重现（按题粒度过滤，见 qbank-corpus.proof §5.5）。
- **generation**：服务面挂在 active generation + embedding recipe 上（`buildActiveGeneration` / `activeQbankGeneration`）——语料升级=新 generation，旧面试凭 snapshot 不漂移。

## 4. 退休与擦除边界

- 题目本体：append-only 池+拒绝尊重（§1）即事实退休；物理删除面走擦除 seam（worker `privacy_checkpoint_target` → 0232 投影 purge 形），qbank chunk 侧沿 GAP-PRIV-04 向量面收口（0141 fence·`memory_vector_chunk` DELETE 须 purge 事务 target+lease 绑定·42501 fail-closed）。
- **诚实边界**：本地行级擦除证据 ≠ 云端删除 ≠ DELETE 开放（`cloudVendorDeleted=false`）；UC-052 stays partial。

## 5. 治理证据（全部可本地复跑）

| 门 | 命令 |
|---|---|
| 静态治理门 | `pnpm qbank-corpus-gates:prove` |
| 语料/检索真 PG | `pnpm qbank-corpus:prove` / `pnpm qbank-corpus-retrieve:prove` |
| 角色门 | `pnpm qbank-control-role:prove`（nightly-ciw2） |
| 擦除 seam | `pnpm qdrant-store:g5-erasure:prove` / `pnpm memory-vector-chunk-erasure:prove` |

Pins：NOT_HA · releaseEvidence=false · 本文档=产品契约成文，不翻任何 gap/backlog 行（行翻面归各自 SSOT 刀）。
