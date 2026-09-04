---
id: requirements_uc_bend_recruiter_architecture_surface
name: 用例 · 内部招聘骨架：架构笔记与申请状态消费
description: 内部预览骨架用人话记下承重设计，并打开岗位申请状态页；不是求职者/面试官两套对等产品，只消费已授权的最小状态，不恢复数值分或逐题原文。
type: use-case
scope: bend
level: spec
status: active
owner: product
version: 1
related:
  - ./application-assessment-terminal.md
  - ./interview-scoring-measurement.md
  - ./product-readiness-c-b-audit.md
  - ./bend-recruiting.md
  - ../../architecture/current-runtime-truth.md
  - ../../architecture/frontend/frontend-blueprint.md
  - ../../delivery/execution-master-checklist.md
---

# 内部招聘骨架 · 架构笔记与申请状态消费

> **实现状态（2026-09）** — 本切片只补内部骨架上的架构笔记与申请状态消费。知面不是「求职者 / 面试官」两套对等产品；招聘方产品没有上线。静态 Pages / 营销首页改写交给并行 PR，避免冲突。`releaseEvidence=false`：页面存在不等于企业招聘系统已发布，也不关闭 `SCOR-01…08` 或 `PENDING-PRD-REVIEW-01`。
>
> 生成前门禁：任务范围=B 端 `/recruiter/how-it-works` + `/recruiter/jobs/:id/applications/:applicationId` + 列表入口 + 申请分数消费止血；来源=`application-assessment-terminal.md`、`current-runtime-truth.md` B 端行、切片前岗位/人才库只有表格无状态页、C 端「我的投递」曾渲染 `application.score`；明确不做=Pages 重写、新迁移、新评分 API、人工复核工单、数值排序、自动录用、改 `listJobCandidates` 契约；领域对象=`JobPosting`/`JobApplication`（只读投影）；状态机影响=无；契约影响=无（复用既有 list）；数据库影响=无；验证=`pnpm web:prove`、`pnpm -C apps/web prove:public-copy`、`pnpm docs:check`。

## 落地范围

| 字段 | 结论 |
| --- | --- |
| 任务范围 | 内部预览登录后能读懂「下一题跟着答、进度在服务端、假分入口已关、两边记账分开、检索权限边界（生产接线未完成）」；并能打开某一申请的状态页，只见状态/来源/岗位能力，不见分数和面试原文。不把 B 端写成对等产品面。 |
| 来源证据 | `UC-ASSESSMENT-001` 已把 B 端收口为 `assessment_unavailable` + `score=NULL`；`listJobCandidates`/`listTalentPool` 查询边界置空 score。切片前招聘方列表行不可点、无状态页；C 端 `/jobs` 曾写 `评分 {app.score}`（本切片已用 `applicationScoreVisible` 关掉渲染）。 |
| 明确不做 | 不改 `docs/` Pages；不与营销文案 PR 抢同一套首页/features 重写；不加 0124–0128 迁移；不恢复 B 端数字分；不建 `ManualReview`/`DecisionRecord`；不宣称 worker 公平或 RAG ACL 已是生产 SLA。 |
| 领域对象 | `JobApplication`（只读最小投影）· `JobPosting`（招聘方自有）· 招聘方 principal |
| 状态机影响 | 无。只消费已有 `invited/in_progress/completed/assessment_unavailable/declined`。 |
| 接口契约影响 | 无新 endpoint。状态页并行读既有 `GET /recruiter/jobs/:id` 与 `GET /recruiter/jobs/:id/candidates`。 |
| 数据库影响 | 无迁移。 |
| 测试计划 | 纯函数：非法 `applicationId` 不得命中、score 恒不渲染、状态文案无死胡同。文案门：架构页用人话覆盖七项能力，禁止 Grok/自动录用/把本地门禁写成发布。浏览器层沿用既有 C→B 规格，并断言「查看状态」可见且无「综合评分/我的回答」。 |
| 验证命令 | `pnpm web:prove` · `pnpm -C apps/web prove:public-copy` · `pnpm docs:check` |

## 诚实剩余缺口（本切片不关闭）

| 缺口 | 为什么还在 |
| --- | --- |
| `SCOR-01…08` 测量根 / 校准 / B 端用途门 | 无 canonical answer artifact、无校准 release；本页只能解释「为什么没有数字」。 |
| `PENDING-PRD-REVIEW-01` 人工复核工单 | 无案件、领取、四眼、申诉；本切片是只读申请状态，不是审核后台。 |
| Worker 公平调度（`WORKER-DISPATCH-002`） | 面试队列已接线 owner 轮转（`0128`）；押题/诊断/报告仍抽干；进程内 cap 不是集群锁。文案必须写清「不是高峰容量保证」，不得写成招聘方产品 SLA。 |
| 完整 transcript / 删除回执 | `INT-TRANSCRIPT-00/01` 未关闭；`0126` 只是答题双写互斥，不是 01。`/turn` 仍可写明文 payload。状态页不得假装能回放逐题内容。 |
| 企业租户 / 席位 / ATS | 仍是个人招聘方账号骨架。 |
| `GET .../candidates` 不先校验岗位归属 | 他岗 URL 现由 `GET /recruiter/jobs/:id` 404 收口；candidates 单独调用仍可能 200+空列表。本切片不改 API。 |
| C 端 `listMyApplications` 仍 SELECT `a.score` | DOM 已用 `applicationScoreVisible` 关掉；查询列未删。 |
| 浏览器全链路发布证据 | 既有 `recruiting-bound` 规格含「查看状态」；本切片不把本地静态门禁标成已发布，也未在本环境跑浏览器。 |

## UC-recruiter-arch-01 · 内部预览页用人话看到承重设计

**七类**：正✔ 异✔ 特✔ 逃✔ 并✔ 复✔ 刁✔

- **角色 Actor**：持有 `role=recruiter` cookie 的内部预览账号（不是已上线招聘方产品角色）
- **前置 Precondition**：已登录且 cookie 为 recruiter；路由在 `/recruiter` 鉴权名单内。
- **触发 Trigger**：打开 `/recruiter/how-it-works`，或从岗位/人才库进入该说明。

**主流程 Main**

1. RSC 不调业务写接口；只渲染固定说明卡片。
2. 七项用人话写出，且每项带「现在能当什么用 / 还不能当什么用」：跟着问、服务端进度、可核对的保护、评分诚实、两边分开记账、排队公平的目标与现状、检索权限。
3. 页脚写明：内部架构笔记；知面不是求职者/面试官两套对等产品；招聘方产品没有上线；不构成能力认证；不能自动筛人、排名或决定录用。
4. 导航「怎么评估」与岗位/人才库互链，避免只有表格没有解释。

**备选流 Alternate**

- A1 未登录访问 `/recruiter/how-it-works` → middleware / 页内 token 门送到 `/login`。
- A2 候选人账号即使猜到 URL，后续业务读仍受 `RecruiterGuard`；本页无他人数据。

**异常流 Exception**

| flow | 场景 | 机制 | 后置 |
| --- | --- | --- | --- |
| E1 重复打开 | 刷新/多开同一说明页 | 只读、无写、无账本 | 零副作用 |
| E2 并发 | 两标签同时打开 | 无共享写；无 CAS 竞争 | 两页内容一致，无双写 |
| E3 越权 | 候选人打开招聘方说明或伪造角色 cookie | 路由鉴权 + 服务端 role；本页无跨租户数据 | 不泄露他人岗位/申请 |
| E4 失败回滚 | 无写路径 | 无预留/无分数/无申请变更 | 申请表增量 0 |
| E5 降级 | 文案不得把本地 prove 写成发布 | 固定诚实句；`releaseEvidence=false` | 不出现「生产级可靠 / 已发布评分」 |
| E6 断线 | 静态 RSC | 重开同一 URL | 不依赖浏览器内存 |

**后置 Postcondition**：不写 `JobApplication` / `Interview` / ScoreCard。招聘方能解释「为什么这里没有分数」。

**验收 Acceptance**

- 说明页含七项人话标题，且同时出现「内部架构笔记」「招聘方产品没有上线」「不提供自动筛选、排名、拒绝或录用决定」与「不构成能力认证」。
- 禁止：Grok、自动录用已开放、把 Pages 当应用运行时。
- 「排队」卡片必须写明面试队列已轮转（`0128`）、押题/诊断/报告仍抽干，且当前不是高峰容量保证。
- 「评分」卡片必须写明证据不够不给分、不用 0 分凑数。

**关联**：无新契约。对象只读。原语：鉴权门（无 RLS 数据面）。隐私：不展示简历/回答。

### 测试用例（不新增 traceability 叶子 ID）

| 证明 | 层 | 断言 |
| --- | --- | --- |
| Proof-recruiter-arch-main | 静态 UI（`public-copy.proof`） | how-it-works 源码含七项人话与诚实边界 |
| Proof-recruiter-arch-特 | 单元（`web:prove`） | 七项 id 固定为 adaptive/checkpoint/prove/scoring/fence/fairness/acl |
| Proof-recruiter-arch-逃 | 静态 UI | 禁止「生产级可靠」「自动录用已开放」；必须「不是高峰容量保证」 |
| Proof-recruiter-arch-刁 | 静态 UI | 禁止 Grok / 骗过面试官；招聘方页不含逐题原文入口 |

## UC-recruiter-review-01 · 打开岗位申请状态（只读最小投影）

**七类**：正✔ 异✔ 特✔ 逃✔ 并✔ 复✔ 刁✔

- **角色 Actor**：招聘方
- **前置 Precondition**：申请属于该招聘方自有岗位；列表 API 已在查询边界把 `score` 置 `NULL`。
- **触发 Trigger**：岗位候选人表或人才库点击「查看状态」。

**主流程 Main**

1. RSC `Promise.all` 读取岗位与候选人列表（既有契约，不发明 get-by-id）。
2. 用 `applicationId` 在**本岗位返回集**里查找；命中则渲染状态、来源、候选人 id 前缀、岗位能力。
3. 评估栏只走 `recruiterAssessmentLabel(status)`，**忽略**任何 `score` 字段。
4. 明确写：看不到面试原文、练习记录、模型思考；校准完成前不提供数值评分；不能自动拒绝或录用。
5. 每个状态都有出口：返回岗位 / 返回人才库 / 阅读「怎么评估」。

**备选流 Alternate**

- A1 人才库跨岗位跳进状态页：URL 带该行 `job_id` + `application.id`。
- A2 `assessment_unavailable`：文案「评分暂不可用」，不是 0 分，也不是已完成录用，也不是人工复核工单。

**异常流 Exception**

| flow | 场景 | 机制 | 后置 |
| --- | --- | --- | --- |
| E1 重复打开 | 刷新状态页 | 只读 GET | 申请状态/分数不变 |
| E2 并发 | 候选人正在面试、招聘方同时打开状态页 | 读投影；写仍只在候选人/worker CAS 路径 | 招聘方不能抢写分数 |
| E3 越权 | 改 URL 看他人申请，或把 C 端 `interviewId` 拼进状态页 | RLS 列表为空 → `notFound`；URL 非法 id 直接 `notFound` | 不渲染他人行，不读 transcript |
| E4 失败回滚 | 列表 API 失败 | `serverGet` 返 null →「暂不可用」，不当 404 猜资源 | 无写；不把失败伪装成「没有候选人」 |
| E5 降级 | 历史 `completed` 或残留 score | 评估文案仍「不提供数值评分」；辅助函数恒不渲染分 | 页面数字评分命中=0 |
| E6 断线 | 打开状态页后断网 | 重开同一 URL 再读服务端列表 | 不靠客户端缓存当真相 |

**后置 Postcondition**：`JobApplication` 不被本页更新。招聘方仍只见最小状态。

**验收 Acceptance**

- 合法自有申请：页面含状态中文、来源、能力标签，且含「看不到面试内容」。
- 非法 id / 未命中：走 `notFound`，不回显原始 id 当业务名。
- `score=68` 的输入不得出现在评估文案里。
- C 端「我的投递」不再渲染 `评分 {score}`。
- 岗位/人才库表格为每行提供「查看状态」链接。

**关联**：`GET /recruiter/jobs/{id}`、`GET /recruiter/jobs/{id}/candidates`、`GET /recruiter/talent`；状态机只读 `JobApplication`；原语 RLS（列表已隔离）+ 查询边界置空 score；隐私：只显示 user id 前缀。

### 测试用例（不新增 traceability 叶子 ID）

| 证明 | 层 | 断言 |
| --- | --- | --- |
| Proof-recruiter-review-main | 单元 | 自有 `app_` id 命中；评估文案按状态，不读 score |
| Proof-recruiter-review-E3 | 单元 | 他岗 id / 非 `app_` / 路径片段 → 不命中 |
| Proof-recruiter-review-E5 | 单元 + 静态 UI | `applicationScoreVisible()` 恒 false；jobs/recruiter 源码无「评分 {」 |
| Proof-recruiter-review-逃 | 静态 UI | 状态页含「评分暂不可用」与「不提供数值评分」；无「综合评分」 |
| Proof-recruiter-review-并复 | 浏览器规格（既有 recruiting-bound） | 回填后招聘方不见「综合评分\|我的回答」；可见「查看状态」 |
| Proof-recruiter-review-刁 | 单元 | 注入型 applicationId 不得 `findOwnedApplication` 命中 |

## 层映射

| 类 | 本切片落点 | 不假装的层 |
| --- | --- | --- |
| 正/特/逃/刁 | `web:prove` + `public-copy.proof`（UI 源码合同） | 不是云发布 |
| 并/复/越权数据面 | 既有 `recruiter:prove` / `neg:bend` / `recruiting-bound` | 本切片不重跑真库 |
| 校准/人工复核 | 文档诚实剩余缺口 | 未实现 |
