---
id: architecture_backend_data_model
name: 多租户与两产品线数据模型
description: 定义 principal/租户、统一 Interview/Resume/Role 聚合、技能本体、记忆分层、RAG 语料与隔离规则。
type: reference
scope: shared
level: guide
status: active
owner: architecture
version: 1
tags:
  - architecture
  - data-model
  - multi-tenant
  - isolation
related:
  - ../../product/domain-models/interview-career-domain.md
  - ../system-blueprint.md
  - ../../requirements/use-cases/cend-overview-progress.md
---

# 多租户与两产品线数据模型

在领域模型（`product/domain-models/interview-career-domain.md`）之上，定义多租户隔离、两产品线的数据结构与统一聚合。**本文是逻辑数据模型**；物理 DDL/RLS SQL 见后续 DB 任务，隐私/同意细则见安全规则任务，状态机转换见状态机任务。

## 1. Principal（安全主体）+ 类型判别

- **principal** = 一次访问的安全主体：`user`（C 端个人）或 `tenant`（B 端机构）。`user_account.status`（`active` 等）是主体有效性真相：`PrincipalGuard` 验签后再查 `status='active'`（60s 缓存）实现**会话吊销**（禁用/改密即失效），见 `rls-isolation.md`。
- **所有受隔离表带类型判别**：`owner_user_id` 与 `owner_tenant_id` **恰有一个非空**（`CHECK num_nonnulls(owner_user_id, owner_tenant_id)=1`）。不允许裸 `owner_principal`——否则 RLS 无法判别、ID 会撞、级联删不安全。
- `Tenant`：id、name、type(enterprise)、status、plan。
- `Membership`：userId、tenantId、role(`org_admin`|`interviewer`|`member`)、status。一个 user 可属多 tenant。
- **混合身份隔离**：一个 user 可能既是 C 端求职者、又是某 tenant 的面试官。请求必须带 **`principalContext`**（`personal` | `tenant:<id>`），RLS 谓词据此判别。**个人数据(简历/记忆)对任何所属 tenant 永不可见**。

## 2. 两产品线 = 两套数据域，物理隔离（生死线）

| 域 | owner | 数据 |
| --- | --- | --- |
| C 端求职者 | user | 个人 Resume、自我练习 Interview、成长档案、个人记忆 |
| B 端企业招聘 | tenant | 人才库候选人、候选人 Interview、企业题库/岗位、评估 |
| 平台共享 | platform | 通用题库、知识点（visibility=shared/global，只读） |

**铁律**：C 端 user 数据与 B 端 tenant 数据永不互通；不得用求职者练习数据做企业筛人。

## 3. 统一聚合（评审关键决策：不做 C/B 双胞胎）

### 3.1 Interview（统一面试聚合）
同一引擎（简历×JD→出题+评估+报告）服务两类受众，**单一聚合**：
- `Interview`：id（**= threadId**，见 `CLAUDE.md` 的 `threadId = resultId` 约定）、`mode`(`self_practice`|`candidate_evaluation`)、`owner_user_id|owner_tenant_id`、serviceType、roleId、resumeId、status、reportStatus。
- **强一致边界仅含 `Interview` + 1—N `InterviewQA`**。`AssessmentReport`(1—1)、`AiGraphRun`(1—N 可重试，共享 threadId) 是**经 interviewId/threadId 引用的独立聚合**（各自独立 version+CAS+异步），**不是 Interview 的强一致子实体**（修审计 #12：1—1/1—N 是聚合间引用基数，非同事务子实体）。
- C 端 owner=user；B 端 owner=tenant + 关联 `candidateId`。**一条代码路径**。
- **实现现状（C 端进度，2026-09）**：物理题目账本是 `interview_question`（领域 `InterviewQA`）。`GET /interview` 投影 `issued_turns`=`status<>'cancelled'`、`answered_turns`=`status='answered'`；`GET /profile/overview.answered` 是同一已答 FILTER 的全局计数（均要求 privacy-active）。ScoreCard 只服务均分与成长档案可评分训练量，不是「已答题数」事实源，也不是测量质量根。详情见 [cend-overview-progress](../../requirements/use-cases/cend-overview-progress.md) 与 [运行时事实矩阵](../current-runtime-truth.md)。

### 3.2 Resume（统一简历聚合）
- `Resume`：id、`owner_user_id|owner_tenant_id`、title、sourceType(upload|ai_generated)、currentVersionId、visibility=private(永远私有)。
- `ResumeVersion`：resumeId、fileUrl、parsedText、structuredProfile、embeddingRef?、createdAt。
- 候选人简历 = `TalentCandidate.resumeId` 指向同一 `Resume` 聚合（owner=tenant），**不是字符串 ref**。一条解析/加密/删除路径。

### 3.3 Role（统一岗位）
- `Role`：id、`owner_user_id|owner_tenant_id|platform`、visibility(`global`平台|`org`机构私有)、title、level、jd、competencyMap、rubricRef。
- 不再分 RoleProfile/TenantRoleProfile；机构岗位 owner=tenant+visibility=org，平台岗位 visibility=global。tenant 岗位可引用平台岗位为模板。

## 4. 技能本体（评审：三者职责分清）

| 实体 | 含义 | 可变性 |
| --- | --- | --- |
| `SkillProfile` | 用户**声明/简历解析**的技能 | 用户可改 |
| `SkillInference` | 模型从面试**推断**的技能态：level、**confidence、evidence、ttlExpiresAt、version、status**(active\|expired\|superseded) | 不可变，只被新推断取代 |
| `SkillGap` | 当前(SkillInference) 与目标岗位要求的**差**：按需计算，**不落表** |

- `CareerProfile`（用户**意图**）：targetRoles、goals、experiences、声明技能(引用 SkillProfile)。
- `GrowthProfile`（系统**推断聚合**，只读）：聚合 `SkillInference[]`、updatedAt。**两者严格分离**：意图归 CareerProfile，推断归 GrowthProfile。

## 5. 记忆分层（落表）

- **`InterviewEvent`（单一事件账本真相，修审计 #13）**：`ownerPrincipal`(owner_user_id|owner_tenant_id 恰一非空，**非 userId**——否则 B 端 candidate 无 userId 落不了事实)、streamKey、单调 `seq`、kind、payload——**append-only 不可变**；审计 / SSE 重放 / 推断证据**共用同一份**（统一为这一份，删除原先并存的第二套事件真相）。`Interview.status` 是会话态真相，InterviewEvent 是历史真相。B 端 candidate 的事件仅审计、不喂 C 端专属 SkillInference。
- `SkillInference`：见 §4（推断层）。
- 引导层=检索时算，不落表。
- `SkillInferenceEvidence`(junction)：inferenceId、interviewEventId、contribution——证据用关系表，不用 JSON 数组。

> **实现现状（诚实校准）**：`user_memory` 表、`insertMemory/episodeSeen` 和 worker `memory-service` 的 lean 路径已部分接线：面试完成后写**系统生成题面**为 `episode`，下一场通过 `wasAsked` 精确判重；历史弱项从 `assessment_report` 只读，用于能力排序软偏置。`pnpm memory:prove` 覆盖 RLS 与不存答案/PII。语义 `user_memory` 向量召回、冻结 snapshot、用户信念画像及其同意/删除闭环仍未接线，不能把本表称为生产语义记忆；见 `architecture/ai/memory-context-design.md`。

## 6. RAG 语料（统一存储，含企业自维护题库）

- `KnowledgeCorpus`：id、`owner_user_id|owner_tenant_id|platform`、**visibility**(`private`|`org`|`shared`|`global`)、type(题库|岗位|知识|历史)、embedding_model_version。
- `CorpusItem`：corpusId、sourceRef、text、embeddingRef、tags。
- **企业自维护题库 = `KnowledgeCorpus{type:题库, owner=tenant, visibility:org}`**（支持导入），不另设实体。
- 简历本身不入 RAG。检索按 `(owner=principal OR visibility∈shared,global)` + RLS。
- **visibility=org 语义**：owner=tenant 时对该 tenant 全体成员可见（Membership EXISTS 判定）；owner=user 不允许 org 级。（若 MVP 想简化，可先只 `private|shared|global`，org 留待租户跑稳。）

## 7. B 端候选人 + 同意（PIPL）

- `TalentCandidate`：tenantId、name(脱敏)、resumeId(→Resume)、source、status。**候选人不是平台 user**。
- `TalentCandidateConsent`：tenantId、candidateId、consentType、status、grantedAt、revokedAt、version。**无有效同意则不得存在该候选人记录**。
- `UserCandidateLink`：userId、tenantId、candidateId、linkedAt——候选人日后注册成 C 端 user 时关联；**关联不得让 tenant 看到该 user 的 C 端个人数据**。
- 角色：企业=controller、平台=processor（细则见安全规则任务）。

## 8. 关系与基数

- Resume 1—N ResumeVersion；Interview 1—N InterviewQA / 1—1 AssessmentReport / 1—N AiGraphRun。
- CareerProfile 1—1 User；GrowthProfile 1—1 User；GrowthProfile 1—N SkillInference；SkillInference N—N InterviewEvent（经 SkillInferenceEvidence）。
- Tenant 1—N Membership / TalentCandidate / KnowledgeCorpus(owner=tenant) / Role(owner=tenant)。
- KnowledgeCorpus 按 owner 归属 user / tenant / platform。

## 9. 隔离与删除规则

- 每受隔离表启用 **Postgres RLS**，谓词含 principalContext + 类型判别 + Membership EXISTS；GUC 用 `SET LOCAL` + 事务级连接池；缓存键含 principal。**SQL 见 DB/RLS 任务**。
- 级联删除（按实体明确）：
  - 销户(C)：Resume/ResumeVersion、Interview/InterviewEvent、SkillProfile/SkillInference/GrowthProfile/CareerProfile 硬删；Entitlement 留存(标记)供退款审计；AI trace 脱敏。
  - 删租户(B)：Membership、TalentCandidate、候选人 Interview、tenant 语料/岗位。
  - 退出机构(Membership)：删 Membership 行；候选人 Interview 作历史保留（标记）。

## 10. ADR（关键决策 / 取舍）

- **统一 Interview/Resume/Role 聚合（mode/owner 区分）**：取舍=查询带 mode/owner 判别稍复杂；收益=单一引擎/单一代码路径，避免 C/B 双胞胎与逻辑重复。
- **principal 类型判别列(双列恰一非空)**：取舍=多一列+CHECK；收益=RLS 可判别、无 ID 撞、级联安全。
- **技能三分 + 意图/推断分离**：取舍=多实体；收益=可回溯(事实不可变)、防过时锚定(推断带 TTL/置信度)、用户可改声明而不污染推断。
- **候选人非 user + 同意/链接实体**：取舍=多一套实体；收益=C/B 身份不混、PIPL 数据主体权可落地。
- **混合身份 principalContext**：取舍=每查询带上下文；收益=堵住"个人简历泄露给雇主"这条致命泄露。

## 11. 交接给后续任务（未在本文定）

- RLS 谓词 SQL + GUC + 多角色测试 → DB/DDL 任务。
- 状态机转换表（Interview/AssessmentReport/PaymentOrder/ConsumptionRecord/AiGraphRun）→ 状态机任务。
- 同意流/加密/留存 SLA 细则 → 安全/隐私规则任务。
- 契约（共享 zod4 schema）→ 契约任务。
