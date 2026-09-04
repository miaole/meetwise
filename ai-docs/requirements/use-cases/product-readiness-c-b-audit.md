---
id: requirements_product_readiness_c_b_audit
name: C/B 产品可上线性审查与门禁
description: 将 C 端训练与 B 端招聘的实现、目标规格和可运行证据拆开，定义可量化的发布阻断项与补测门禁。
type: assessment
scope: shared
level: release-gate
status: active
owner: product-architecture
version: 1
related:
  - ../../product/vision.md
  - ../../product/workflows/core-workflows.md
  - ./cend-mock-interview.md
  - ./bend-recruiting.md
  - ./e2e-scenarios.md
  - ./interview-question-bank-product-bend.md
---

# C/B 产品可上线性审查（代码与实测证据版）

> 审查日期：2026-08-02。本文不把 TARGET 规格、页面文案、前端按钮或 fake-model 测试记为生产闭环。这里的“已证实”仅指本次运行命令通过，或能够从调用链直接追到真实 HTTP/数据库副作用；它不等于可承诺“100% 高可用”。

## 0. 范围、对象与结论口径

| 范围 | 领域对象 | 本次不做 |
|---|---|---|
| C 端训练/求职 | `Resume`、`Interview`、`AssessmentReport`、`JobApplication` | 不评判模型回答本身的语义质量；该项应由真实模型冻结集另行给分。 |
| B 端招聘 | `JobPosting`、`JobApplication`、招聘方 principal | 不把现有 owner-user RLS 宣称为企业 tenant、席位、ATS 或物理数据隔离。 |
| C→B 边界 | 岗位快照、同意、岗位专属面试、招聘评分快照 | 不允许复用 C 端历史训练、成长档案或未授权的简历/面试正文。 |

### 本次可复现证据

| 命令/检查 | 层级 | 结果 | 可证明的范围 | 不可证明的范围 |
|---|---:|---:|---|---|
| `pnpm recruiter:prove` | 真实 PostgreSQL + RLS | **29 / 29** 断言通过 | 招聘邀请、申请状态 CAS、服务端从本人事件推导分数、招聘方看缓存分数而看不到 transcript、跨招聘方隔离、邀请幂等 | 浏览器能完成从投递到岗位专属面试再回填的全链路。 |
| `pnpm neg:bend` | 真实 HTTP + 数据库 | **109 / 109** 负向断言通过 | 未鉴权 401、角色越权 403、跨招聘方/跨候选人读写 0 副作用、输入校验、重复投递幂等 | 正常 B 端 UI 操作、业务转化、SLA、真实用户并发浏览。 |
| `pnpm openapi:prove` | 共享契约 | **67 / 67** 断言通过 | 6 个 recruiter 操作和 4 个 application 操作在契约目录中可发现 | 契约存在不代表消费者已接线。 |
| `rg` 浏览器测试目录 | E2E 覆盖盘点 | **0** 个 B 端路径引用；**2** 个浏览器 E2E 文件 | 当前浏览器黄金路径没有招聘方注册、发岗、邀请、投递、面试、回填或人才库断言 | 不能以现有 UI E2E 声称 B 端闭环已验。 |

### 当前可量化状态

| 指标 | 当前值 | 发布要求 |
|---|---:|---:|
| 招聘方 API 操作数（契约） | 6 | 不是发布指标；每个动作必须有正向 HTTP + UI E2E。 |
| 候选人申请 API 操作数（契约） | 4 | 同上。 |
| 已验证 B 端浏览器闭环 | **0 / 1** | **1 / 1**：招聘方发岗 → 候选人投递/接受 → 创建岗位绑定面试 → 完成 → 自动回填 → 招聘方仅见授权摘要。 |
| 已验证 C→B 同意/用途/撤回闭环 | **0 / 1** | **1 / 1**：最小化快照、期限、撤回、在途终止、缓存/向量/trace 清理均可观测。 |
| 目标企业能力（入驻、成员、席位、题库双签、DSAR、决策审计、招聘账单、岗位匹配）已实现 | **0 / 8** | 若以“企业招聘产品”销售，核心监管/租户能力不得为 0。 |

## 1. 已证实的产品能力与边界

### 1.1 C 端：可用的训练主线，不等于岗位招聘面试

| 能力 | 真实实现证据 | 本次可证明 | 使用边界 |
|---|---|---|---|
| 登录后简历/普通模拟面试入口 | `apps/web/app/{resume,interviews}/`、通用 `POST /interview` → `/begin` | C 端普通面试具有独立创建、启动和进入会话的调用链 | 调用体只有简历/请求身份；没有 `applicationId`、`jobId` 或岗位快照。 |
| 岗位浏览和投递 | `apps/web/app/jobs/page.tsx`、`POST /jobs/:id/apply` | 登录候选人可浏览 `open` 岗位并幂等创建一条 `JobApplication` | 页面仅显示标题和 competency 标签；未展示岗位 `description`、目的/数据用途、岗位快照版本。 |
| 受邀申请状态 | `POST /applications/:id/start`、`decline` | 实测状态机 `invited → in_progress`、`invited → declined` 均有 CAS，重复推进落败 | `start` 只更新 `job_application.status`，不创建 `Interview`、不 reserve 面试权益、也不返回可导航的 `interviewId`。 |
| 回填综合分 | `POST /applications/:id/finalize`、`finalizeApplication` | 分数不接收客户端数值，数据库从同一候选人 `interview_event.answer_evaluated` 平均推导；本次实测为 78 | 事件只按 `owner_user_id + interviewId` 绑定，**没有**约束该 interview 是这份 application/job 的专属会话。 |

**C 端产品结论**：独立训练产品可以继续作为 C 端主线验收；“投递后按岗位目标能力安排面试评估”当前不能声称已实现。`startApplicationAction` 仅 revalidate `/jobs`，不会创建或跳转面试；全仓运行时代码对 `/applications/:id/finalize` 的消费者数为 **0**，因此完成状态不能从真实用户面试自动抵达招聘方人才库。

### 1.2 B 端：基础招聘面板与逻辑隔离已证实

| 已实装部分 | 量化/安全证据 |
|---|---|
| 岗位创建、列表、详情 | 3 个 recruiter HTTP 操作，招聘方 guard 拒绝 candidate；跨招聘方读岗位返回 404。 |
| 候选人列表、人才库、邀请 | 另 3 个 recruiter HTTP 操作；真实 DB 测试验证状态筛选、分数 asc/desc 排序、同岗位候选人邀请幂等。 |
| 招聘方最小化视图 | 测试断言 recruiter 读取候选人 `interview` 和 `interview_event` 均为 **0 行**；列表只返回申请状态、分数、来源和候选人 ID 前缀。 |
| 跨主体隔离 | 真实 DB 测试和 HTTP 负向测试均断言：异租户人才库/岗位候选人 **0 行**，越权插入由 RLS 拒绝，越权尝试后申请分数仍为 `NULL`。 |
| 写入安全 | `JobApplication` 对重复申请有 `(job_id, candidate_user_id)` 唯一约束；邀请重复复用已有 application；开始/完成/婉拒 CAS 的重复副作用为 **0**。 |

**B 端产品结论**：现状是“个人招聘方账号 + 岗位 + 申请状态/分数摘要”的 alpha 骨架，不能称为可售企业招聘系统。产品愿景中企业是 tenant/controller、具有成员、席位、审核、合规和招聘专属评估；当前数据库里招聘方仍是单一 `owner_user_id`，不存在 `TenantEnrollment`、`Membership`、`Seat`、`CandidateEvaluation`、`DecisionRecord` 或 `ShareGrant` 的已接线路径。

## 2. P0 发布阻断项

### P0-CB-01：岗位申请与面试没有不可替代绑定

**现状证据**

1. `POST /applications/:id/start` 仅把申请 `invited → in_progress`。
2. 普通面试创建入口只接收简历，不接收 `applicationId/jobId`。
3. `finalizeApplication` 接受候选人任意本人 `interviewId`，只要存在已评估事件就会把其平均分写回该岗位申请。
4. 前端运行时代码没有调用 finalize；本次静态计数为 **0** 个消费者。

**风险**

- 候选人可把不相干的、历史上表现最好的 C 端练习会话提交给任意岗位；这不是客户端伪造分数，而是**业务关联伪造**。
- 招聘方看到的数字既不能证明该岗位 competency，也不能证明候选人接受了“为该企业/岗位评估”的处理目的。
- 产品主路径出现无出口状态：点击“开始面试”后只刷新当前申请状态，用户没有会话链接；最终不能自动完成申请。

**必须满足的修复验收**

```text
JobApplication + ApplicationSnapshot + CandidateEvaluationSession
  创建事务中绑定 job_id、candidate、resume_snapshot_version、competency_snapshot、consent_version。

start(applicationId, idempotencyKey)
  → 唯一创建/复用 application-scoped interviewId
  → 返回 interviewId
  → 浏览器跳转 /interview/:interviewId

完成事件
  → 仅由该 application-scoped interviewId 触发服务端 finalize
  → 写 immutable CandidateEvaluationSnapshot（score、rubric/model/prompt/qbank 版本、evidence hash）
  → B 端只读该 snapshot。
```

| 验收项 | 目标值 |
|---|---:|
| 同一 `applicationId + startIdempotencyKey` 并发 20 次 | 恰好 **1** 个 interview、**1** 次 reserve、所有成功响应返回同一 interviewId。 |
| 任意“本人但非该岗位”的 `interviewId` finalize | **409**，`JobApplication.score` 仍为 `NULL`。 |
| 同一岗位会话 completion 重放 | CandidateEvaluationSnapshot、人才库分数、消费确认各 **1** 次。 |
| 真实浏览器 C→B 全链路 | **1** 条必过 E2E，覆盖刷新、双击、断网后恢复及最终 B 端最小化展示。 |

### P0-CB-02：C 端训练数据与 B 端处理目的没有可执行同意边界

现有 RLS 已证明 recruiter 不能直接读取 C 端 transcript；这是重要的逻辑隔离基线。但是 B 端申请表中没有 purpose-bound `ShareGrant`、无可撤回的岗位快照、无 expiry/retention、无在途 agent/缓存/向量/checkpoint/trace 的撤回处理。因此目前不能作出“C/B 物理隔离、永不互通”或“企业处理有独立同意”的商业/合规承诺。

| 验收项 | 目标值 |
|---|---:|
| recruiter 对任意 C 端训练记录的 DB、缓存、向量、SSE、checkpoint、trace 读取 | 每一数据面 **0** 命中。 |
| `ShareGrant` 已撤回后的新读/新检索 | **0** 成功、**0** 新模型调用。 |
| 撤回与 worker resume 并发 20 次 | 最终 `terminated_consent` **20 / 20**；无新评分/报告事件。 |
| 已授权 B 端可见字段 | 只能来自 application snapshot；候选人 C 端历史面试原文/成长档案字段数 **0**。 |

### P0-CB-03：B 端没有可验证的浏览器闭环

当前 B 端相关 UI 有岗位、人才库、人话说明页 `/recruiter/how-it-works` 与申请状态页；浏览器黄金路径规格在 `e2e-ui/recruiting-bound.spec.ts`（含回填后必须见「评分暂不可用」、不见「已完成」/逐题内容、可见「查看状态」）。`recruiter:prove` 验证了数据库保护，`neg:bend` 验证了 HTTP 拒绝。本仓库仍不能把该规格或本地静态门禁当成已发布的浏览器闭环证据（`releaseEvidence=false`）。人工复核工单、企业租户和校准分数仍未接线。

**最低 E2E 合约（不得 mock 掉 API/DB）**：

1. 创建 recruiter 与 candidate 两个独立 browser context；recruiter 发岗位并邀请 candidate。
2. candidate 看到 purpose/范围/截止时间，明确同意或婉拒；婉拒后 B 端只见 `declined`，无面试/评分。
3. candidate 开始后取得同一个 application-bound `interviewId`；刷新、双击、重连不得再建会话或扣费。
4. 使用 fake model 只控制确定性评分 fixture，真实 API/DB/SSE/浏览器必须运行；完成后 B 端仅见 allow-list 摘要及评分版本。
5. 测试 B 端和第三个租户均不能读取 transcript、C 端练习、未授权候选人和撤回后结果。

## 3. P1/P2 产品与商业化缺口

| 优先级 | 缺口 | 当前量化状态 | 发布/销售口径 |
|---|---|---:|---|
| P1 | 企业 tenant、成员、owner 转移、席位与账单 | 目标对象 **0 / 4** 已接线 | 不可出售“团队席位/企业入驻/企业账单”。 |
| P1 | 申请状态与流程 | `JobApplication` 有 4 态：`invited/in_progress/completed/declined` | 无筛选、约面、人工复核、reject/hire、理由、申诉、审计决策；不可作为 ATS。 |
| P1 | 职位信息与候选人透明度 | C 端职位页显示字段 **2 类**（title、competencies），未显示 description/地点/薪资/处理目的 | 投递前信息不足；应引入 `JobSnapshot`、版本和候选人可见的 data-use notice。 |
| P1 | 邀请邮箱的隐私/滥用边界 | 招聘方邀请速率为 burst **12**、稳态约 **3/min**；非候选人/招聘账号 404 | 限速不能取代目的验证；需 invite token、候选人接受、审计和滥用监控。 |
| P1 | 评分可靠性与公平性 | 只有单一整型平均分，B 端没有 rubric/evidence/model version/置信区间/人工复核 | 不可用于自动淘汰或排名决策；只能显示为训练/评估辅助信号。 |
| P2 | 招聘题库治理 | 目标规格含 source、双签、PII、召回，生产 B 工作流接线 **0** | 不可宣称有企业专属题库、题目双签或可审计内容治理。 |
| P2 | DSAR、保留、导出/注销 | 实际端到端处理链 **0 / 1** | 不可承诺企业 DSAR/SLA；需在销售和隐私材料中明确未提供。 |

## 4. C/B 发布门与量化仪表盘

### 4.1 训练 C 端（非招聘决策）发布门

| 类别 | 硬门 |
|---|---:|
| 跨用户/跨租户访问 | 0 次越权读取或写入。 |
| 重复副作用 | 同一命令的评分、扣费、报告、事件各 1 次。 |
| 失败路径 | 额度不足、模型/worker 失败、SSE 重连、刷新恢复、取消均有可观察终态，且有真实 DB 断言。 |
| 模型质量 | 每个非 happy-path 桶分别报告：事实纠正错误前提、拒答/澄清精确率与召回、接地证据率、注入成功率、P50/P95、单场成本；不得用总均分替代。 |

### 4.2 B 招聘 beta 发布门（P0 全为零才允许外部候选人）

| 指标 | beta 阈值 |
|---|---:|
| `unbound_application_finalization` | **0**（任何非岗位绑定会话均不能回填）。 |
| `C_training_transcript_read_by_recruiter` | **0**。 |
| `cross_tenant_read/write` | **0**，覆盖 DB、缓存、向量、checkpoint、SSE、trace。 |
| `duplicate_application_interview / duplicate_charge` | **0**。 |
| application browser E2E | 正常、双击、刷新、断网恢复、拒绝、撤回、跨租户越权至少 **7** 条，全部通过。 |
| 决策解释完整性 | 每个 B 端非降级 score 都有 ≥**1** 条候选人答案 evidence span，绑定 question/rubric/model/prompt/snapshot 版本；否则 `inconclusive`。 |
| 人工最终决定 | 自动 `reject/hire` API 为 **0**；决策必须由授权人生成 append-only `DecisionRecord`。 |

## 5. 训练问题补充：产品闭环、同意与招聘评分

以下三题是对 `interview-question-bank-product-bend.md` 的补充。它们针对当前最容易被“RLS 已经做了 / 有个分数就可以”掩盖的断裂，不能用 happy-path 回答得分。

### EXP-C3-06：如何防止候选人把任意历史训练分数回填到一个招聘岗位？

**场景**：候选人申请了“高级后端工程师”，随后把三个月前的 C 端 Redis 练习会话作为 `interviewId` 提交。该会话本人所有、答案已评分，但不绑定这个岗位，也没有明确的招聘处理同意。设计完整的数据模型、命令、状态机和自动回填。

**10 分评分锚点**

| 分数 | 可观察条件 |
|---:|---|
| 0 | 只校验 `interview.owner_user_id === candidateId`。 |
| 4 | 前端隐藏 interviewId 输入框，后端仍可提交任意 ID。 |
| 7 | 创建 application-scoped interview，完成后由 worker 自动回填。 |
| 10 | 同时设计不可变岗位/简历/同意快照、`applicationId → interviewId` 唯一约束、幂等 completion、版本化评分证据与撤回终止。 |

**标准答案要点**

- `ApplicationEvaluationSession` 在同一事务绑定 `applicationId`、`jobSnapshotId`、`resumeSnapshotId`、`consentGrantId`、`interviewId`；`UNIQUE(application_id)` 与 `UNIQUE(interview_id)` 均成立。
- 客户端不能传可选择的 `interviewId` 给 finalize；最终任务只消费 session 已绑定的 ID，并将完整版本写进不可变 `CandidateEvaluationSnapshot`。
- `start` 使用 `applicationId + clientCommandId` 幂等；20 并发只有一场会话、一次 reserve 和同一个返回 ID。
- 同意撤回先于 worker resume；在途会话 `terminated_consent`，不得把新分数写给 recruiter。

**必测**：本人但非岗位 interview 回填返回 409；跨岗位重放/双击完成/worker lease 重领后分数快照均为 1；招聘方读取 C 历史训练正文为 0。

### EXP-C3-07：B 端招聘评分怎样能辅助决策而不成为不可解释的自动淘汰器？

**场景**：HR 要求按 `score desc` 自动筛掉低于 60 的候选人，并希望候选人看不到评分维度；候选人说“我这一题被系统理解错了”。设计 B 端评分、候选人说明、人工复核、申诉、版本重算和公平性门。

**10 分评分锚点**

| 分数 | 可观察条件 |
|---:|---|
| 0 | 只给一个 0–100 分，设置 SQL 条件自动拒绝。 |
| 4 | 给 HR 模型长推理或给候选人完整题库 rubric。 |
| 7 | 提供维度、证据片段、人工 review 与 score version。 |
| 10 | 有 `inconclusive`、最小 evidence、反事实公平集、模型/题库变更统一重算与 immutable `DecisionRecord`，并禁止自动 reject/hire。 |

**标准答案要点**

- 评分是辅助排序信号；最终 `DecisionRecord` 由有权限的人记录，自动雇佣/淘汰接口数必须为 0。
- 分数的每个可见维度有 ≥1 个答案 evidence span，保存 hash/offset、question/rubric/model/prompt/qbank 版本。无证据 = `inconclusive`，不是伪精确分。
- 候选人看到与自身答案有关的解释与申诉入口，不看到 hidden rubric/题库标准解/链式推理。
- 按受保护属性翻转的反事实对评估分组差；任何超过预设区间、证据完整率不足或误拒上升，都阻断模型变更。

### EXP-C3-08：从“招聘方个人账号”演进为企业多租户产品，如何避免错误共享？

**场景**：一个 recruiter 账号当前拥有所有岗位。客户要求“总部 owner、招聘经理、面试官、外包成员、10 个席位、随时撤权和离职交接”，并要求 C 端训练数据永不混进企业数据。画出聚合、状态机、授权及迁移顺序。

**10 分评分锚点**

| 分数 | 可观察条件 |
|---:|---|
| 0 | 给 `user.role = admin` 加更多枚举。 |
| 4 | 只有 `tenantId` 字段，没有 owner 转移、席位或撤权。 |
| 7 | 有 Tenant/Membership/Seat、RLS principal、角色权限和审计。 |
| 10 | 说明 C/B 独立数据平面或可验证迁移、连接池上下文、缓存/向量/checkpoint/trace、offboarding/DSAR 和并发不变量。 |

**必答不变量**

```text
active owner per tenant = 1
seatUsed <= seatQuota
revoked membership can create/read/export = 0
C-training resource visible to tenant = 0 unless purpose-bound grant snapshot exists
```

## 6. 实施顺序（只定义验收，不在本审查中改代码）

1. **先修 P0-CB-01**：引入 application-bound session/snapshot，删除任意 interview 回填入口，接自动 completion；添加 DB、HTTP、真实浏览器 E2E。
2. **再修 P0-CB-02**：目的限定同意/撤回、最小化数据快照、全部数据面的清理和审计；在进入 B beta 前做撤回与 resume 竞态压测。
3. **再修 P0-CB-03**：把三主体浏览器矩阵纳入 CI，保留当前 29/109/67 的数据/HTTP门作为底座，不能用新 E2E 取代。
4. **最后扩 B 商业能力**：tenant、成员、席位、招聘账单、题库治理、DSAR、人工决策和公平性评测。任何未完成项必须在产品页、销售材料与权限提示中标为“未提供”。

## 7. 证据定位

- B 端接口与 guard：`apps/api/src/modules/recruiter/recruiter.controller.ts`、`recruiter.service.ts`。
- C 端岗位与申请动作：`apps/web/app/jobs/page.tsx`、`apps/web/app/jobs/actions.ts`。
- 状态机、RLS 与现有回填查询：`packages/db/src/recruiter.ts`、`packages/db/migrations/0005_job_application.sql`、`0009_interview_invitation.sql`。
- 通用面试创建调用链（未绑定岗位）：`apps/web/app/interviews/actions.ts`、`apps/api/src/modules/interview/interview.service.ts`。
- B 端目标规格（多数仍是 TARGET）：`ai-docs/requirements/use-cases/bend-recruiting.md`。
