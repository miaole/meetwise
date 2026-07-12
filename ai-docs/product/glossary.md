---
id: product_glossary
name: 统一术语 + serviceType 权威枚举
description: 产品/技术术语单一真相，含 serviceType↔graphName 权威映射，避免命名漂移。术语与 data-model/domain 对齐。
type: reference
scope: shared
level: guide
status: active
owner: product
version: 2
related:
  - ./domain-models/interview-career-domain.md
  - ../architecture/backend/data-model.md
  - ../requirements/use-cases/interview-modality.md
---

# 统一术语

> 修闭合验证 regression：删除已废术语（面试会话/面试结果/岗位画像），对齐 data-model 命名。

| 术语 | 英文 | 说明 |
| --- | --- | --- |
| 知面 | Meetwise | 产品名 |
| principal | Principal | 一次访问的安全主体：`user`(C 端) 或 `tenant`(B 端) |
| 机构 / 成员 | Tenant / Membership | B 端机构与其成员关系 |
| principalContext | Principal Context | 请求身份上下文(`personal`\|`tenant:<id>`)，RLS 据此判别 |
| 面试（聚合） | Interview | **唯一面试聚合根**(id=threadId，mode=self_practice\|candidate_evaluation)；取代旧 Session/Result 二分 |
| 问答 | InterviewQA | 单轮问答（Interview 强一致子实体） |
| 事件账本 | InterviewEvent | 单一 append-only 有序事件真相(单调 seq)，审计/重放/推断证据共用 |
| 简历 / 版本 | Resume / ResumeVersion | 简历聚合与版本 |
| 岗位 | Role | 岗位/JD/能力要求(owner+visibility)；取代旧 RoleProfile |
| 职业目标 | CareerProfile | 用户**声明**的职业意图(targetRoles/goals) |
| 成长档案 | GrowthProfile | 系统**推断**聚合(只读，汇总 SkillInference) |
| 技能推断 | SkillInference | 不可变推断条目(level/confidence/evidence/ttl) |
| 能力差距 | SkillGap | 当前与目标岗位的差，**派生不落表** |
| 押题 | Question Forecast | 据简历×JD 预测问题 |
| 复盘报告 | AssessmentReport | 结构化评估(独立聚合，经 interviewId 引用) |
| 学习计划 | LearningPlan | 据差距与目标生成的阶段计划 |
| 权益 / 消费 | Entitlement / ConsumptionRecord | 可用次数额度 / reserve-confirm-release 消费 |
| 可见性 / 归属 | visibility / owner | private\|org\|shared\|global / owner_user_id\|owner_tenant_id |
| AI 图 / 图运行 | AI Graph / AiGraphRun | LangGraph 状态图 / 一次执行(独立聚合) |
| checkpoint / thread_id | Checkpoint / Thread ID | LangGraph 线程状态快照 / 恢复同会话标识 |

# serviceType ↔ graphName 权威映射（单一真相）

> 修 open 桥：本表是 `serviceType`(计费/权益维度) 与 `graphName`(编排维度) 的**唯一真相**。domain/blueprint 不得内联私有枚举，一律引用此表。权威集源自 `use-cases/interview-modality.md §0.1`。

| serviceType（计费/权益） | graphName（编排） | 说明 |
| --- | --- | --- |
| `resume_quiz` | `resume-quiz` | 简历押题 |
| `special_interview` | `mock-interview` | 专项面试（载入专项 profile/rubric） |
| `behavior_interview` | `mock-interview` | 行为面试（载入行为 profile） |
| `mock_interview` | `mock-interview` | 通用模拟面试 |
| `career_path` | `career-path` | 职业路径分析；**消耗额度，入共享/主池**（与面试同口径 reserve→confirm，已签 open-decisions） |

- **`hr` / `system-design` 等是 `mock_interview` 的 profile 参数，不是独立 serviceType**（消除 domain 旧文 line 81 的游离值）。
- **`report` 不是 serviceType**：面试后自动生成、bundled 进面试，graphName=`report`（子图/后台）。
- **计费按 serviceType、路由按 graphName**，二者经本表显式桥接；落 `packages/contracts` 时以本表为 enum 真相。
- ✅ **已签**（open-decisions）：所有 serviceType 走**共享额度池**（FIFO 先到期先扣）；`career_path` 消耗额度入主池，非免费、非独立 SKU。

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 术语/映射为权威定义（canonical），本身无对错。落地校正：四图（resume-quiz / mock-interview / career-path / report）与 serviceType 路由**已接线并可跑**；`career_path`/report 为**确定性派生**。但出题接地当前仅命中**本地约 32 题种子库**，`GroundedQuestion` 的“联网找真题”来源（web-explore）**默认禁用**（allowlist 空）；`GrowthProfile`/`SkillInference` 的“系统推断”当前=**复用 assessment_report 的确定性派生**，跨会话记忆/belief 未建。
