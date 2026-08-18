---
id: product_domain_interview_career
name: 面试与职业准备领域模型
description: 核心领域对象、聚合边界、状态——口径以 architecture/backend/data-model.md 为唯一源，本文与其对齐不平行重述。
type: requirement
scope: shared
level: epic
status: active
owner: product-architecture
version: 2
tags:
  - domain
  - interview
  - career
related:
  - ../../architecture/backend/data-model.md
  - ../../rules/global/status-machine.md
  - ../glossary.md
---

# 面试与职业准备领域模型

> **🔎 实现状态（对齐真实代码 · 2026-08-10）** — 领域对象/状态机为 canonical 定义，均已在代码建模并接线（Interview / InterviewQA / AssessmentReport / AiGraphRun / InterviewEvent / Entitlement / ConsumptionRecord 等）。落地校正：`GrowthProfile`/`SkillInference` 标注为“系统**推断**”，但当前实现是**确定性派生**（从面试后的 `assessment_report` 汇总），**未接入跨会话记忆/信念建模**（经审计判定为过度设计而暂缓，仅保留精确 hash 去重）；`ResumeVersion.structuredProfile` 支持文本/PDF 文本层，图片 OCR（光学字符识别）有受开关控制的代码路径和脚本模型回归，但尚无真视觉模型、扫描型 PDF 或完整删除的发布证据。

> **唯一事实源**：领域结构 / 聚合归属 / 状态枚举以 `architecture/backend/data-model.md` 与 `rules/global/status-machine.md` 为准。本文是面向产品的概览，**不得平行重述出分叉口径**（修架构审计致命 #1/#2 域口径双定义）。

## 领域分区

```text
Identity      用户、租户、Membership、principal、同意
Resume        简历、版本、结构化 ResumeProfile
Role          岗位、JD、能力要求（owner + visibility）
Career/Growth 职业目标(声明) + 成长档案(推断)
Assessment    能力评估、差距、报告、雷达
Interview     押题、模拟面试、问答、事件
Learning      学习计划、训练、复盘
Commerce      套餐、权益、订单、消费、退款
AI Runtime    Graph、Run、Checkpoint、Prompt、Trace、Eval
Admin / Observability  后台治理 / 日志·账本·可观测
```

## 核心对象（与 data-model 对齐）

| 对象 | 职责 | 关键字段 |
| --- | --- | --- |
| User / Tenant / Membership | principal 主体与归属 | id、principal 判别 |
| Resume | 简历聚合根 | owner_principal、currentVersionId |
| ResumeVersion | 简历版本 | resumeId、fileUrl、structuredProfile(ResumeProfile) |
| **Role** | 岗位画像（原 RoleProfile） | owner、visibility、title、level、jd、requiredSkills |
| CareerProfile | 职业目标（**声明**） | targetRoles、goals |
| GrowthProfile | 成长档案（**推断**汇总） | ownerPrincipal、曲线、最新 inference 引用 |
| SkillInference | 不可变推断条目 | skill、level、confidence、evidence、ttl |
| SkillGap | 能力差距（**派生不落表**，读模型） | roleId、skill、currentLevel、targetLevel、priority |
| **Interview** | **唯一面试聚合根**（id=threadId=resultId；mode∈{self_practice, candidate_evaluation}） | owner_principal、serviceType、status、version |
| InterviewQA | 单轮问答（Interview 强一致子实体） | question、answer、referenceAnswer、score、evidence |
| AssessmentReport | 复盘报告（**经 interviewId 引用的独立聚合**） | reportId、interviewId、overallScore、radar、strengths、risks、**summary** |
| AiGraphRun | AI 图运行（**独立聚合**，独立 version+CAS+异步） | graphName、threadId、status、manifestId、modelCost |
| InterviewEvent | 持久有序事件账本（单调 seq） | ownerPrincipal、streamKey、seq、kind、payload |
| LearningPlan | 学习计划 | duration、tasks、linkedGaps |
| Entitlement / ConsumptionRecord / PaymentOrder / RefundOrder | 权益与支付 | 见 commerce-saga + status-machine |

> **删除**：`InterviewSession`（会话态 `currentQuestionIndex` 并入 graph state）、独立 `InterviewResult` 实体、`RoleProfile` 命名、`SkillProfile` 作能力画像根（降为 CareerProfile 的声明属性）、`InterviewResult.summary`（归 AssessmentReport）。

## 关键聚合边界

| 聚合 | 强一致边界 | 说明 |
| --- | --- | --- |
| **Interview** | 仅含 Interview + InterviewQA | 唯一面试聚合根；会话运行态在 graph state（按引用） |
| AssessmentReport | 独立 | 经 `interviewId` 引用 Interview；异步生成、独立 status/CAS |
| AiGraphRun | 独立 | 经 `threadId` 关联；运行态 vs 业务事实分离 |
| Resume / Role | 各自独立 | owner + visibility |
| Commerce（Entitlement/Consumption/Payment/Refund） | 独立 | 跨模块结算走 [saga](../../architecture/backend/commerce-saga.md)，AI 图不碰 |

聚合**间**只用 id 引用（`1—1/1—N` 是聚合间引用基数，不是同事务子实体），跨聚合一致走事件 + 补偿。

## 状态（唯一面试状态机字段）

**只有 `Interview.status` 一个面试状态机字段**（删除原 Session.status / Result.status 并存的"状态汤"）。枚举与转换表以 [status-machine.md](../../rules/global/status-machine.md) 为准：`created · active · waiting_user · completed · abandoned · failed`（+ 增量 `waiting_system / paused / safety_hold / risk_held`）。`AssessmentReport.status`、`AiGraphRun.status`、`PaymentOrder.status`、`ConsumptionRecord.status` 同样以 status-machine 为准。

## serviceType ↔ graphName 桥（必须显式，否则扣费/路由错配）

- **计费/权益维度按 `serviceType`**；**编排维度按 `graphName`**。
- **权威映射表（`serviceType ↔ graphName`）在 [glossary](../glossary.md) 定死**（单一真相）：resume_quiz→resume-quiz；special/behavior/mock_interview→mock-interview；career_path→career-path。**hr/system-design 是 mock_interview 的 profile 参数非独立 serviceType；report 非 serviceType（bundled）。** 本文与 blueprint 一律引用，禁内联私有枚举。

## 领域规则

- 面试开始前检查并 **reserve** 权益；完成走 saga `reserve→confirm`，失败/中止 `release`（见 commerce-saga）。
- 一次用户请求带 `idempotencyKey`（按 principal 作用域），重复返回首次结果或明确冲突。
- 面试恢复基于持久 checkpoint，不依赖内存；等待用户由持久 `waiting_user` 表达。
- 报告与主面试流程解耦，可异步重试，报告失败不阻塞主链路。
- AI 输出保存 prompt version / model / schema version；进业务前双校验（schema + 业务，含真实性歪曲门）。
- 简历原文为敏感数据，默认不进日志/长期观测；PII 只走境内模型。
