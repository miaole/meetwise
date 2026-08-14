---
id: architecture_backend_module_boundaries
name: 后端模块边界与依赖规则
description: 模块职责/拥有聚合/pair 依赖矩阵(默认 deny)/模块公共面铁律/跨模块只走应用服务或领域事件/admin·commerce 事件断环/dependency-cruiser CI 强约束。模块职责与聚合归属的唯一事实源。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ../system-blueprint.md
  - ./domain-events-catalog.md
  - ./commerce-saga.md
  - ../../rules/global/production-invariants.md
---

# 后端模块边界与依赖规则

> 模块边界不是口头约定，是 **CI 强约束**（§4）。本文是**模块职责与聚合归属的唯一事实源**（system-blueprint 的模块表引用本文，不平行重述）。修架构审计 H16/#7-11。

## 1. 模块清单：职责 · 拥有聚合 · 公共面

| 模块 | 职责（单一） | 拥有聚合 | 公共面（index.ts 唯一出口） |
|---|---|---|---|
| `identity` | 认证、用户、租户、Membership、principal、同意 | User, Tenant, Membership, ConsentRecord | principal 解析、鉴权守卫、同意应用服务 |
| `resume` | 简历摄取清洗、结构化 ResumeProfile、版本 | Resume, ResumeVersion | 简历应用服务 |
| `role` | 岗位/JD、能力模型、岗位匹配 | Role, JD | 岗位应用服务 |
| `assessment` | 评分、报告、能力曲线、成长档案 | AssessmentReport, GrowthProfile, SkillInference | 报告应用服务 |
| `interview` | 面试编排(业务侧)、押题、事件账本 | Interview(=threadId), InterviewQA, InterviewEvent | 面试应用服务、SSE 网关 |
| `learning` | 学习计划、职业路径、复盘 | LearningPlan, CareerProfile | 学习应用服务 |
| `commerce` | 权益、消费、支付、退款 | Entitlement, ConsumptionRecord, PaymentOrder, RefundOrder | **唯一**能改权益/支付的模块 |
| `content` | **题库内容（独立只读内容域）** | QuestionBank | 题库只读查询应用服务 |
| `ai-runtime` | 模型调用唯一关口、catalog/router、双校验、压缩、repair | ai_invocation_traces, ai_prompt_versions, ai_release_manifest | **只导出 `invoke()`**（router/validators/catalog 封内部，§4） |
| `admin` | B 端控制台、题库治理动作、人审工单、运营 | ReviewTicket, 运营位 | 管理后台应用服务（不持 QuestionBank 内容） |
| `observability` | 日志/指标/审计账本/成本账本 | audit_event, cost ledger | 横切被调用，只收标量 |

> **QuestionBank 下沉到 `content`**（修 H16/#10 归属倒挂）：interview 押题读 `content`（向下依赖），不再 interview→admin 反向依赖 B 端；admin 只对题库做**治理动作/审核工单**，内容归 content。
>
> **实现现状（诚实校准）**：题库检索/接地出题机制（CRAG 从 `vector_chunk kind=qbank` 召回真题 → grounded-questions 出题门）已接线，但**语料本身仅 ~32 条自撰起步种子**（`apps/worker/src/qbank-seed.ts`，无版权）。**真正策展/授权题库 + 离线策展灌入管线（版本 pin/采纳双签/PII 泛化）尚未建**（见 production-backlog P1「题库生命周期」❌）——现为 toy corpus，非生产语料。

## 2. pair 依赖矩阵（默认 deny，只列 allow）

允许的有向边（源→目标，经对方**公共面**只读，绝不反向、不深链 repo）：

| 源 → 目标 | 用途 |
|---|---|
| interview/assessment/learning/**resume**/**role** → `ai-runtime` | 调 `invoke()`（修 #7：resume 简历结构化、role JD 结构化本质是 LLM 调用，必须在白名单内，否则 CI 误拦 → 关口失守） |
| interview → resume / role / **content** | 读简历/岗位/题库（只读应用服务） |
| **assessment → interview** | 读 InterviewQA 出报告（修 #8 缺边） |
| **learning → assessment** | 读 SkillInference/报告排学习（修 #8 缺边） |
| **role → resume** | 岗位匹配读简历（修 #8 缺边） |
| 所有模块 → `identity` | principal/鉴权/同意 |
| 所有模块 → `domain` / `contracts` | 共享类型，无副作用 |

**leaf 豁免（断环）**：`observability` 是底座，**只收标量 `principalId`，不 import identity 类型**——否则 identity↔observability 互依成环。identity 也不依赖 observability。

## 3. 禁止 / 回流走事件（断环）

- `ai-runtime` 不反向调用任何业务模块（底座不知道 interview/commerce 存在）。
- **AI 图绝不直接改 commerce**：图只发 outbox 事件 `settlement_proposed` → commerce 唯一落账（见 [commerce-saga](./commerce-saga.md)，删除一切"图/supervisor 落账"表述）。
- **三类回流一律走领域事件，禁同步互调**（修 #9 admin 环风险）：
  - **admin 人审**：业务发 `<domain>.needs_review` → 持久 `waiting_review` 状态 → admin 发 `admin.review.decided`。**admin/commerce 禁直接 import 业务模块**。
  - **commerce 权益**：`entitlement_reserved/confirmed/released/refund_uncollectible` 事件。
  - 所有跨聚合最终一致同理。
- 事件名/载荷/幂等键登记在 [领域事件目录](./domain-events-catalog.md)。

事务边界铁律：一个 DB 事务**不跨模块边界**；跨模块用事件 + 幂等 + saga 补偿。

## 4. 强约束（CI，dependency-cruiser + arch test）

- **模块公共面铁律**（修 #11）：每模块 `index.ts` 是唯一出口，只导出应用服务接口 + DTO，**禁导出 repository/entity**；dependency-cruiser 规则 = 「只许 import 他模块 `index`，禁深链 `internal/`、`*.repo`、`*.entity`」。
- **ai-runtime 关口结构约束**（修致命 #6）：`ai-runtime` 只导出 `invoke()`；router/validators/catalog 在内部不对外；arch test 断言无任何包 import ai-runtime 的 router/validator 内部模块——杜绝绕过 invoke 静默跳过 PII 门/双校验/成本记账。
- **包级 × 模块级两层矩阵**：dependency-cruiser 同时覆盖 `apps(web/api/worker) × packages` 与模块间 pair 矩阵；invoke 跨 api/worker 的形态（worker 内函数 vs 队列）显式声明。
- **三条 arch test 断言**：① admin 与业务模块无直接 import（只经事件）；② identity↔observability 不互 import；③ 全仓无深链 repo/entity import。
- **commerce 表写权限隔离**：只有 commerce 的 repo 能 import 权益/支付实体。
- **controller 不编排**：只解析请求、调一个应用服务、返回。

这些与 [生产不变量](../../rules/global/production-invariants.md) 配套——边界保证「谁能改什么」，四原语保证「怎么改才安全」。
