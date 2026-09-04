---
id: requirements_uc_cend_overview_progress
name: 用例 · C 端总览已答题数与题目账本对齐
description: 成长主页「已答题数」与面试列表进度必须投影自 interview_question 账本，禁止用 ScoreCard 空集把已作答伪装成 0。
type: use-case
scope: cend
level: spec
status: active
owner: product
related:
  - ./use-case-conventions.md
  - ./interview-history.md
  - ./cend-report-growth.md
  - ./UC-interview-submit-answer.md
  - ../../testing/conventions/test-authoring.md
  - ../../rules/global/production-invariants.md
---

# C 端总览进度 · 题目账本对齐

> **实现状态（2026-09）** — 代码已接线：`GET /interview` 列表/详情投影 `issued_turns` / `answered_turns`；`GET /profile/overview.answered` 与之同一题目账本（privacy-active 且 `status='answered'`）。`avgScore` 与成长档案 `totals.answered` 仍只读可评分 ScoreCard。成长主页「已答题数」经契约校验后渲染该字段，取数失败为「—」。题目账本不是测量质量、B 端排序或用途授权的事实根。

## 落地范围（生成门禁）

| 字段 | 结论 |
| --- | --- |
| 任务范围 | 把 `GET /profile/overview.answered` 改为 privacy-active 面试上 `interview_question.status='answered'` 的计数；列表继续用同一账本投影；成长主页「已答题数」只渲染该字段。 |
| 来源证据 | E0：`922bcc0` 已把 issued/answered turns 接到 InterviewView；主分支列表/详情已落地。E0：改前 `overview.answered` 计数 ScoreCard，无卡时仪表盘为 0；现 `profile.service.ts` 与列表同一 `interview_question.status='answered'` + `interview_privacy_active` 投影。E0：`interview_question.status` 枚举为 `issued/queued/answered/cancelled`。 |
| 明确不做 | 不复活 `feature/aliyun-acr-cd` 的 CD/预览工厂/ops；不改成长档案 `GrowthView.totals.answered`（仍为可评分卡数）；不改 `avgScore`/`reportsReady` 的 ScoreCard/报告权威；不写库、不迁状态机、不发明新契约字段、不伪造进度。 |
| 领域对象 | `Interview`（只读）· `interview_question`（题目账本，**进度**事实源，非评分/测量根）· `Overview`（只读投影）· `ScoreCard`（只服务均分与成长档案可评分训练量） |
| 状态机影响 | 无。不迁移 `Interview` / `interview_question` / `ScoreCard`。 |
| 接口契约影响 | `Overview.answered` 语义改为账本已答计数；zod 形状不变。 |
| 数据库影响 | 无迁移。只读聚合，走 `asPrincipal` + FORCE RLS + `interview_privacy_active`。 |
| 测试计划 | `TC-overview-001-*`：主流程精确相等、无卡仍计数、issued/queued/cancelled 不计、RLS 隔离、列表合计对齐、取数失败不渲染 0。 |
| 验证命令 | `pnpm api:validate` · `pnpm web:prove` · `pnpm docs:check` |

## UC-overview-001 · C 端总览已答题数对齐题目账本

**七类**：正✔ 异✔(E4 擦除后不计) 特✔(空用户/未答态) 逃✔(E5 无 ScoreCard 不得降级成 0) 并✔(E2 跨主体并发读隔离) 复✔(列表投影与总览同一事实源) 刁✔(E3 越权 / 取消题刷数)

- **角色 Actor**：求职者
- **前置 Precondition**：请求带 principal；题目身份只存在于 `interview_question`。
- **触发 Trigger**：打开成长主页，或直接 `GET /profile/overview`。

**主流程 Main**

1. API 在 `asPrincipal` 事务内计数：`interview_question.status='answered'` 且 `interview_privacy_active(interview_id)`。
2. 响应 `Overview.answered` 等于该计数；`avgScore` 仍只来自可评分 ScoreCard。
3. 成长主页「已答题数」渲染 `Overview.answered`；overview 取数失败渲染「—」，不猜 0。
4. 同主体 `GET /interview` 各场 `answered_turns`（同一 FILTER）在列表窗口覆盖的场次上可加总核对，不得另起 ScoreCard/事件计数。

**备选流 Alternate**

- A1 已作答但 0 张可评分卡：`answered` = 账本已答数，`avgScore=null`。
- A2 终态场次的已答行仍计入（进度是事实，不随 `Interview.status` 消失）。

**异常流 Exception**

| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 重复 GET | 只读幂等：无写入、无重复累加 | 两次响应同一账本快照 |
| E2 | 两主体并发读 | RLS principal 绑定 fail-closed | 各自只见自己的 answered 行 |
| E3 | 越权读他人进度 | RLS 0 行；不按 ScoreCard/事件补洞 | 他人 answered 不进入本主体总数 |
| E4 | 面试进入隐私围栏 | `interview_privacy_active=false` 与列表同一谓词 | 已擦除场次不贡献已答题数（禁止伪造残留进度） |
| E5 | ScoreCard 缺失/不可评分 | 逃逸：已答题数不降级到卡表 | 有答无卡 → 正数，不是 0 |
| E6 | 成长主页 overview 取数失败 | 前端 fail-closed 显示「—」 | 不把传输失败伪装成「已答 0」 |

**后置 Postcondition**：不写账本、不迁状态；`Overview.answered` 是题目账本只读投影。

**验收 Acceptance**

- 有 2 条本主体 `answered` 行、另主体也有已答行时，本主体 `answered === 2`（精确相等，不是 `>=`）。
- 3 条已答 + issued/queued/cancelled 各 1、0 张 ScoreCard → `answered === 3` 且 `avgScore === null`。
- 无数据主体 → `answered === 0`。
- 同主体列表 `answered_turns` 合计（窗口覆盖全部场次时）=== `Overview.answered`。
- 越权主体看不到他人已答。
- overview 缺失时前端标签是「—」而不是「0」。

**关联**：契约 `GET /profile/overview`、`GET /interview`；对象 `interview_question`；原语 RLS + 隐私围栏谓词；隐私：不计擦除场次、不把评分卡空集当零进度。

### 测试用例

| TC | 层 | 断言 |
|---|---|---|
| TC-overview-001-main | 集成 (`api:validate`) | userA 账本 2 答 + userB 另有已答 → userA `answered === 2` |
| TC-overview-001-A1 | 集成 | 无 ScoreCard 的 3 答 → `answered === 3` 且 `avgScore === null` |
| TC-overview-001-特 | 集成 | issued/queued/cancelled 不计；空用户 = 0 |
| TC-overview-001-复 | 集成 | 列表 `answered_turns` 合计 === overview.answered |
| TC-overview-001-E3 | 集成 | userA `answered === 3` 且不含 userB 的 2；userB `answered === 2` |
| TC-overview-001-E4 | 机制同列表谓词；本 gate 不另造擦除 HTTP（避免伪验收） | `interview_privacy_active` 与 `GET /interview` 同一函数；围栏 HTTP 仍由既有 privacy-erasure proof 覆盖列表，不把未跑的 overview 围栏测标绿 |
| TC-overview-001-E5 | 集成 | userA 账本 3 ≠ 可评分卡 2；ledgerUser 无卡仍为 3 |
| TC-overview-001-E6 | 单元 (`web:prove`) | overview 缺失/非法 answered →「—」，真实 0 →「0」 |
