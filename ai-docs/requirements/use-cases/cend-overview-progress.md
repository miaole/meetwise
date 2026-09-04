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
  - ../../architecture/current-runtime-truth.md
  - ../../architecture/frontend/frontend-blueprint.md
---

# C 端总览进度 · 题目账本对齐

> **实现状态（2026-09）** — 代码已接线：`GET /interview` 列表/详情用同一 LATERAL 投影 `issued_turns`（`status <> 'cancelled'`）/ `answered_turns`（`status='answered'`）/ `current_turn`（`issued`）/ `processing_turn`（`queued`）；`GET /profile/overview.answered` 是 privacy-active 场次上同一 `answered` FILTER 的全局计数。`avgScore` 与成长档案 `totals.answered` 仍只读可评分 ScoreCard。成长主页 `/dashboard`「已答题数」经 `Overview.safeParse` 后渲染该字段，取数失败为「—」。列表/最近场次文案走 `interviewProgressLabel`。题目账本不是测量质量、B 端排序或用途授权的事实根。

## 落地范围（生成门禁）

| 字段 | 结论 |
| --- | --- |
| 任务范围 | 把 `GET /profile/overview.answered` 改为 privacy-active 面试上 `interview_question.status='answered'` 的计数；列表继续用同一账本投影；成长主页「已答题数」只渲染该字段。 |
| 来源证据 | E0：`922bcc0` 已把 issued/answered turns 接到 InterviewView；主分支列表/详情已落地（`issued_turns`=`status<>'cancelled'`）。E0：改前 `overview.answered` 计数 ScoreCard，无卡时仪表盘为 0；现 `profile.service.ts` 与列表同一 `status='answered'` + `interview_privacy_active` 投影。E0：`interview_question.status` 枚举为 `issued/queued/answered/cancelled`。E0：`api:validate` 种子 userA=ASMT 2 答+卡 + RACE 1 答无卡 → 账本 3 ≠ 卡 2。 |
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
3. 成长主页 `/dashboard`「已答题数」只渲染经契约校验的 `Overview.answered`；overview 取数失败渲染「—」，不猜 0。面试场次在同一 `safeParse` 失败时为「—」，不用 `interviews.length` 顶替（实现于 `dashboard/page.tsx` 行内；`web:prove` 只钉已答题数标签，不把未抽函数的场次聚合标绿）。
4. 同主体 `GET /interview` 各场 `answered_turns`（同一 FILTER）在列表窗口覆盖的场次上可加总核对，不得另起 ScoreCard/事件计数。
5. `/interviews` 与成长主页「有进度的面试」用 `interviewProgressLabel` 渲染单场进度，不得另起客户端题数。

### 投影口径（与代码同谓词）

| 字段 | SQL FILTER（`interview_question`） | 用于 |
| --- | --- | --- |
| `issued_turns` | `status <> 'cancelled'` | 单场已出题数（含 issued/queued/answered） |
| `answered_turns` / `Overview.answered` | `status='answered'` | 单场已答 / 成长主页已答题数 |
| `current_turn` | `max(turn) FILTER (status='issued')` | 「第 N 题待答」（展示 +1） |
| `processing_turn` | `max(turn) FILTER (status='queued')` | 「第 N 题处理中」（展示 +1） |

列表/详情另要求 `interview_privacy_active(interview.id)`；总览对题目行用同一谓词。`cancelled` 既不计已出也不计已答。

### 单场进度文案（`apps/web/lib/interview/progress.ts`）

| 条件（先匹配先生效） | 文案 |
| --- | --- |
| `completed` | `共 ${issued_turns} 题` |
| `abandoned`/`failed` 且 `answered_turns>0` | `已作答 ${answered_turns} 题` |
| `abandoned`/`failed` 且 `issued_turns>0` | `已出 ${issued_turns} 题，未作答` |
| `abandoned`/`failed` 其余 | `尚未出题` |
| 非 `created/active/running/waiting_user` | `进度待同步` |
| `processing_turn != null` | `第 ${processing_turn+1} 题处理中` |
| `current_turn != null` | `第 ${current_turn+1} 题待答` |
| `answered_turns>0` | `已作答 ${answered_turns} 题` |
| 其余进行中 | `尚未出题` |

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

- userA：ASMT 2 答（有卡）+ RACE 1 答（无卡）→ `answered === 3`，且故意 `!==` 可评分卡数 2（精确相等，不是 `>=`）。
- userB：仅 2 条本主体已答、0 张卡 → `answered === 2` 且 `avgScore === null`，不含 userA。
- ledgerUser：3 条已答 + issued/queued/cancelled 各 1、0 张 ScoreCard → `answered === 3`、`avgScore === null`；LEDG `issued_turns === 4`（cancelled 不计已出）。
- 零账本行的 principal（`api:validate` 的 `userNoData`）→ `answered === 0`（真实零，不是 fail-closed「—」）。
- 同主体列表 `answered_turns` 合计（窗口覆盖全部场次时）=== `Overview.answered`。
- 越权主体看不到他人已答。
- overview 缺失/非法时前端标签是「—」而不是「0」；真实 0 渲染 `"0"`。

**关联**：契约 `GET /profile/overview`、`GET /interview`；对象 `interview_question`；原语 RLS + 隐私围栏谓词；隐私：不计擦除场次、不把评分卡空集当零进度。

### 测试用例

| TC | 层 | 断言 |
|---|---|---|
| TC-overview-001-main | 集成 (`api:validate`) | userA 账本 3（ASMT 2 + RACE 1）且 `!==` 可评分卡 2；另主体已答不计入 |
| TC-overview-001-A1 | 集成 | ledgerUser 无 ScoreCard 的 3 答 → `answered === 3` 且 `avgScore === null`；LEDG `issued_turns===4` |
| TC-overview-001-特 | 集成 | issued/queued/cancelled 不计已答；空用户 = 0 |
| TC-overview-001-复 | 集成 | 列表 `answered_turns` 合计 === overview.answered（窗口覆盖全部场次） |
| TC-overview-001-E3 | 集成 | userA `answered === 3` 且不含 userB 的 2；userB `answered === 2` |
| TC-overview-001-E4 | 机制同列表谓词；本 gate 不另造擦除 HTTP（避免伪验收） | `interview_privacy_active` 与 `GET /interview` 同一函数；围栏 HTTP 仍由既有 privacy-erasure proof 覆盖列表，不把未跑的 overview 围栏测标绿 |
| TC-overview-001-E5 | 集成 | userA 账本 3 ≠ 可评分卡 2；ledgerUser 无卡仍为 3 |
| TC-overview-001-E6 | 单元 (`web:prove`) | `overviewAnsweredLabel`：缺失/非法 →「—」，真实 0 →「0」；单场 `interviewProgressLabel` 见上表。面试场次「—」是 dashboard 行内实现，本 gate 不另抽 helper 冒充已测 |
