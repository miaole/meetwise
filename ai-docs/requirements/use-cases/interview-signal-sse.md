---
id: requirements_use_cases_interview_signal_sse
name: 用例 · 控制信号收尾理由的 SSE 预览投影
description: INT-LEVEL-SIGNAL-01 的 early_weak / thrashing 经既有 interview_event / SSE 路径诚实露出（练习自适应控制流）。不是 INT-LEVEL-01 ScoreCard/B 端等级，不发明分数。releaseEvidence=false。
type: requirement
scope: shared
level: must
status: active
owner: product
version: 1
tags:
  - interview
  - sse
  - int-level-signal
  - preview
related:
  - ./use-case-conventions.md
  - ./adaptive-interview-length.md
  - ./expert-long-interview-runtime.md
  - ./interview-scoring-measurement.md
  - ../../architecture/current-runtime-truth.md
  - ../../architecture/backend/domain-events-catalog.md
  - ../../rules/global/production-invariants.md
  - ../../testing/conventions/test-authoring.md
---

# 控制信号收尾理由 · SSE 预览投影

> **`INT-LEVEL-SIGNAL-SSE-01` ≠ `INT-LEVEL-01`。** 本页只把图上已有的 `concludeReason.code ∈ {early_weak, thrashing}` 投影到既有 `GET /interview/:id/events` 流。这是面试**练习**的自适应控制流预览，不是招聘方产品、不是能力等级校准、不是 ScoreCard。
>
> **状态：◐ 本地 prove only**（`releaseEvidence=false`）。不关闭 `INT-LEVEL-01` / `INT-P0-LEVEL-EVIDENCE` / `INT-LONG-INTERVIEW-01`。不发明 overall / band / 0 分。

## 0. 生成前门禁

| 字段 | 内容 |
| --- | --- |
| 任务范围 | 图 `concludeReason` 经纯域投影后，由 worker 在既有 `interview_event` + SSE 路径追加 `session_concluded`；前端契约消费并展示练习控制流文案。 |
| 来源证据 | 图 state 已有 `concludeReason`（`packages/ai-graphs` `decide`/`conclude`）；`early_weak`/`thrashing` 已是 `ConcludeReason`。#72（`INT-LEVEL-SIGNAL-01`）已在 main：`observeInterviewSignals` 接到同一 reason。本切片不重做观察函数。现有 SSE：`GET /interview/:id/events`、`appendEvent`、web `BusinessEvent`。 |
| 明确不做 | 不实现 `INT-LEVEL-01` / ScoreCard / B 端 band / 招聘结论。不新开 HTTP 写面。不把 `session_concluded` 标成 SSE 终态。不把 reason 映射成分数或 `report_ready.overall`。不改支付/权益。不偷用迁移号：`0124`–`0130` 已在 main（#72 占用 `0130`）；本切片无迁移。不跑本地 Docker DB 作为证明。 |
| 领域对象 | `SignalConcludeProjection`（code/turn/citedCompetencies）。复用 `DecisionProvenance` 只作输入，输出是最小投影。 |
| 状态机影响 | 不改 `Interview` 业务终态。图 `concluded` 仍由既有 lifecycle 投影。`session_concluded` 是事件账本上的预览事实，不是新 status。 |
| 接口契约影响 | 无新 REST 路径。共享 zod：`InterviewSignalConcludeReason` / `SessionConcludedPayload`。SSE 增一种既有流上的 `kind=session_concluded`。 |
| 数据库影响 | 无迁移。`interview_event.kind` 本就是自由文本；新 kind 走既有 `appendEvent` + `event_key='session_concluded'`。 |
| 测试计划 | 域投影七类（无 IO）· 契约负向（分/band/strict）· web 归约（不改 phase、不发明分）· worker 只调用投影后 append。 |
| 验证命令 | `pnpm signal-sse:prove` · `pnpm signal-sse-contract:prove` · `pnpm signal-sse-worker:prove` · `pnpm web:prove` · `pnpm docs:check` · `pnpm arch`。`releaseEvidence=false`。 |

## 1. 横切定义

- **信号收尾码（本切片唯一投影集）：** `early_weak`、`thrashing`。`coverage_met` / `all_resolved` / `safety_ceiling` / `budget_exhausted` **不**经本切片投影（避免把覆盖政策或杀开关说成「弱/震荡信号」）。
- **投影：** `projectSignalConcludeReason` 只输出 `{ code, turn, citedCompetencies }`。剥掉 score / overall / band / 年限 / 答案原文 / 证据全文。缺 turn 或非法 code → `null`（fail-closed，不补造）。
- **既有路径：** worker `appendEvent` → `interview_event` → api `GET /interview/:id/events`。不新开 endpoint。
- **非终态：** SSE 终态仍是 `report_ready` / `report_unavailable` / `assessment_unavailable` / `interview_unavailable` / `error`。`session_concluded` 不得让前端停止等报告。
- **诚实：** 文案只说练习自适应控制流提前结束；禁止「等级 / 初级 / 招聘不通过 / 综合分」。reason 不得变成 `lastScore` 或 `report.overall`。
- **幂等：** `event_key='session_concluded'`，同场恰一条。重放/双 worker 不双写。

## UC-INT-LEVEL-SIGNAL-SSE-01 · 信号收尾理由经既有 SSE 诚实露出

- **角色 Actor：** 自适应 worker（投影+记账）、api SSE 网关（原样转发）、候选人练习 UI（消费，不裁判）。
- **前置 Precondition：** 图 checkpoint 已 `concluded`；`concludeReason` 可能存在（含旧 checkpoint 缺字段）。面试走既有 lifecycle 的 `done` 投影事务。
- **触发 Trigger：** `submitAdaptiveAnswer` 发现图 `done=true`。

**主流程 Main**
1. Worker 读取 `snap.values.concludeReason`（只读 checkpoint，不改图）。
2. `projectSignalConcludeReason`：仅 `early_weak`/`thrashing` 且 `turn` 为非负整数才产出投影；能力名超长截断到 64；邮箱/手机形态与疑似答文丢弃。
3. 同一 `asPrincipal` 收尾事务里 `appendEvent(..., 'session_concluded', { concludeReason }, 'session_concluded')`。
4. 既有 `GET /interview/:id/events` 按 seq 重放/tail 该事件；**不是**终态。
5. 前端 `BusinessEvent` 校验通过后写入 `view.signalConcludeReason`；phase 不变；`practiceHintScore` / `report.overall` 不读该字段。
6. UI 展示练习控制流说明，不展示等级或新分数。

**备选流 Alternate**
- A1 `concludeReason` 为 `coverage_met` / `all_resolved` / `safety_ceiling` / `budget_exhausted` → 不追加 `session_concluded`。
- A2 旧 checkpoint 无 `concludeReason`，或 `evalAnswer` 的 `unscored`/identity-mismatch 直跳 conclude（不写 provenance）→ 不追加，不发明 `early_weak`。
- A3 同 identity 重放 / 已 applied 再进 `done` 块 → `event_key` 命中既有 seq，仍恰 1 条。
- A4 有合格计分事件时仍走既有 complete+enqueueReport；本事件不替代 `report_ready`，也不改 overall。

**异常流 Exception**
| flow | 场景 | 机制 | 缺了会漏什么 |
| --- | --- | --- | --- |
| E1 重复 | 同场 `done` 重放 | 投影纯函数稳定；账本层 `event_key='session_concluded'`（既有 `appendEvent`，本切片用假 append 模拟第二次返回既有 seq） | 双条理由或改 code |
| E2 并发 | 双 worker 同场收尾 | 既有 graph fence CAS + 同 key 事件锁（本切片不重跑隔离 DB） | 两条不同理由 |
| E3 越权 | 他人物读/写事件 | 既有 `asPrincipal` + `interview_event` RLS | 读到他人收尾理由 |
| E4 回滚 | 注入 overall/band/score 想当等级 | 投影剥字段；契约 `.strict()` 拒额外键；UI 不映射分 | 用 early_weak 造 0 分或 junior |
| E5 降级 | 缺 turn / 未知 code / 非对象 | 投影 `null`，不写事件 | 把杀开关或覆盖收口说成「持续偏弱」 |
| E6 断线 | SSE 中断后 Last-Event-ID 重连 | 事件在账本；重放 `seq>lastId`；非终态继续等报告 | 丢理由或把连接当终态 |

**后置 Postcondition：** 当且仅当投影非空时，该 `stream_key` 恰 0 或 1 条 `session_concluded`。无新消费账本。无 ScoreCard / application band 写入。`Interview` 终态仍由既有 complete/fail 路径决定。

**验收 Acceptance**
1. `early_weak` 或 `thrashing` + 合法 turn → 投影成功，payload 无 score/overall/band。
2. 其他 conclude code 或缺 provenance → 无 `session_concluded`。
3. 同 key 两次 append → 同一 seq。
4. 前端收到事件后 `phase` 不是新终态；`lastScore`/`report` 不因该事件出现。
5. 带 `overall`/`band`/`score` 的畸形 payload 契约失败，视图不采纳。
6. 展示文案含「练习」与「控制流」，不含等级/招聘结论。
7. `session_concluded` 不在 SSE `isTerminal` 集合。

**关联：** 契约 `SessionConcludedPayload`（不进 OpenAPI）。状态机对象：图 `concluded` + 事件账本。原语：E1 幂等键、E2 fence/CAS、E3 RLS、E6 持久事件日志。隐私：投影最小化，无答案原文。

**七类覆盖标注：** 正 / 异 / 特 / 逃 / 并 / 复 / 刁

### 七类测试矩阵

| 类 | TC | 层 | 能失败的断言 |
| --- | --- | --- | --- |
| 正 | `TC-INT-LEVEL-SIGNAL-SSE-01-main` | 域+契约+web | `early_weak`/`thrashing` 投影含 code+turn；web 写入 `signalConcludeReason` 且 phase 不变 |
| 特 | `TC-INT-LEVEL-SIGNAL-SSE-01-S1` | 域 | 空/缺 turn/CJK 能力名/超长名；旧 checkpoint `null` → 不投影 |
| 异 | `TC-INT-LEVEL-SIGNAL-SSE-01-E1` | 域+worker 假 append | 投影 JSON 全等；假 `appendEvent` 同 key 第二次不双写 |
| 逃 | `TC-INT-LEVEL-SIGNAL-SSE-01-E5` | 域+web | `safety_ceiling`/`coverage_met`/`unscored` 形状 → `null`；web 终态集合不含本 kind |
| 并 | `TC-INT-LEVEL-SIGNAL-SSE-01-E2` | 域 | 20 次重复投影同一冻结 provenance 全等（本层无共享可变状态） |
| 复 | `TC-INT-LEVEL-SIGNAL-SSE-01-M1` | web | 先理由后报告 / 先报告后理由：overall 只由报告事件写入；已有 hint 80 不被改成 0 |
| 刁 | `TC-INT-LEVEL-SIGNAL-SSE-01-T1` | 域+契约+web | 注入 band/年限/overall/score/答文 cited 被剥或拒；UI 不把 reason 当 lastScore |

本切片不新开钱包路径。账本幂等/RLS 沿用既有 `appendEvent` 原语证明，本包不把本地 Docker DB 当新证据。worker 接线用假 append（`pnpm signal-sse-worker:prove`）。`releaseEvidence=false`。
