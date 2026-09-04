---
id: requirements_use_cases_interview_control_signals
name: 面试控制信号（弱/震荡）地基
description: INT-LEVEL 的控制流地基：从已持久化的 InterviewMind 算出 weak/thrashing 信号，供 decideNext 消费；不产出能力等级或 B 端 band。验收仅本地 prove（releaseEvidence=false）。
type: requirement
scope: shared
level: must
status: active
owner: product
version: 1
tags:
  - interview
  - adaptive
  - int-level
  - control-signal
related:
  - ./expert-long-interview-runtime.md
  - ../../architecture/current-runtime-truth.md
  - ../../architecture/ai/langgraph-blueprint.md
  - ../../rules/global/production-invariants.md
---

# 面试控制信号（弱/震荡）· UC-INT-LEVEL-SIGNAL-01

> **`INT-LEVEL-SIGNAL-01` ≠ `INT-LEVEL-01`。** 本页是控制流地基，不是能力等级校准本身。不产出 `InitialLevelHypothesis` / `CompetencyLevelAssessment` / B 端 band，也不关闭 `INT-P0-LEVEL-EVIDENCE`。信号兼容覆盖驱动时长（`UC-INT-LENGTH-01`）：`safety_ceiling` 先赢；本包不改写 `maxTurns`，也不把固定轮数写成产品硬顶。
>
> **状态：◐ 本地 prove only**（`releaseEvidence=false`）。不关闭 `EXEC-01A` / `INT-LEVEL-01` / `INT-LONG-INTERVIEW-01`。worker 事件 / SSE / report **不读** `concludeReason`。

## 任务范围（生成前门禁）

| 字段 | 内容 |
| --- | --- |
| 任务范围 | 纯域 `observeInterviewSignals` + `decideNext` 消费；图 `concludeReason` hook。 |
| 来源证据 | `expert-long-interview-runtime.md` UC-INT-LEVEL-01；`adaptive-interview-length.md`；`packages/domain/src/adaptive-interview.ts` 的 `decideNext`。 |
| 明确不做 | 完整 `INT-LEVEL-01`；ScoreCard/rubric evidence；冻结或改写产品轮次上限；SSE/UI 文案；B 端等级；简历年限/受保护属性入特征。worker / SSE / report 不消费 `concludeReason`。 |
| 领域对象 | `InterviewMind`（本包消费 `recentScores` / `pivotCount`；`recentDifficulties` 仅由 ingest 持久化，观察函数不读）、`InterviewControlSignal`、`InterviewConcludeReason`。 |
| 状态机影响 | 分数轨迹 `weak`/`thrashing` 映射为 `early_weak` / `thrashing`。判定序：`safety_ceiling` → 轨迹信号（同真时 weak 优先）→ 会话 abort-count `early_weak` → 连续无产出 pivot `thrashing` → probe/pivot（软预算触顶则 `raise_soft_budget`）→ 无可探时 `coverage_met`/`all_resolved`。`clarify` 续问不消费轨迹信号；仅绝对杀开关时经 `decideNext`。 |
| 接口契约影响 | 无 HTTP/zod 契约变更。 |
| 数据库影响 | 无迁移。checkpoint 新增可选字段，缺省 fail-closed 为无信号。 |
| 测试计划 | `pnpm adaptive-signals:prove`（七类）+ `pnpm adaptive-signals-graph:prove` + 既有 `adaptive:prove` / `adaptive-redesign:prove` / `adaptive-graph:prove`。 |
| 验证命令 | `pnpm adaptive-signals:prove`；`pnpm adaptive-signals-graph:prove`。`releaseEvidence=false`。 |

## 当前接线（与代码对齐，禁止夸大）

| 代码 | 职责 | 不是 |
| --- | --- | --- |
| `packages/domain/src/interview-control-signals.ts` | `observeInterviewSignals`：`none` / `weak` / `thrashing`。缺 `recentScores`（旧 checkpoint）→ 两类提前终止均为 `none`。weak：分数样本 `≥2`、`probed≥2`、`turn≥4`、已探 confidence 均 `<0.35`。thrashing：`recentScores.length≥4` 且高/低带（≥70/<40）翻转≥3 **且** `pivotCount≥3`（单能力 hasHook 深挖或平稳换题单独不够）。均要求无人 `confidence≥0.7`。同真时观察函数先返回 `weak`。`recentDifficulties` 只持久化，观察函数不读。本文件不 import `adaptive-interview.ts`（单向 DAG）。 | 不是 `CompetencyLevelAssessment`，不写 band。 |
| `packages/domain/src/adaptive-interview.ts` `decideNext` | 先 `safety_ceiling`；再 `observeInterviewSignals`；再 abort-count `early_weak`；再 consecutive-pivot `thrashing`；再 probe/pivot；最后覆盖收口。 | 不改写 `maxTurns`；软预算/绝对杀开关属 `UC-INT-LENGTH-01`。 |
| `packages/ai-graphs/src/adaptive-interview/nodes/decide.ts` | 把 `DecisionProvenance` 写入 `concludeReason`。`clarify` 续问不走信号；仅绝对杀开关时走 `decideNext`。 | worker / SSE / report **不读** `concludeReason`。 |
| `packages/ai-graphs/src/adaptive-interview/nodes/plan.ts` | `initMind(competencies, maxTurns, absoluteMaxTurns)`；无固定 8 轮产品硬顶。 | 时长数值属覆盖驱动策略；信号不得抬 `maxTurns`。 |
| `packages/ai-graphs/.../evaluate-answer.ts`（对照，非本包） | `unscored` / identity-mismatch 可直接 `concluded=true`，**不经** `decideNext`，**不写** `concludeReason`。 | 不是 `early_*`；本 UC 只对照列出，不改该通道。 |

本包关闭的是控制流 hook，**不关闭** `INT-LEVEL-01` / `INT-P0-LEVEL-EVIDENCE` / `INT-LONG-INTERVIEW-01`。

## UC-INT-LEVEL-SIGNAL-01 · 弱/震荡信号供 decideNext 消费

- **角色 Actor：** 自适应决策（纯域）、图 `decide` 节点、后续动态时长/报告 hook。
- **前置 Precondition：** `InterviewMind` 已由 `initMind` / `ingestAssessment` / `markUnresolved` / `withCurrent` 更新；评分只作 0..100 整数轨迹，不作 band。
- **触发 Trigger：** 每次 `decideNext(mind)`。
- **主流程 Main：**
  1. `observeInterviewSignals(mind)` 只读 mind 的 turn/confidence/depth/score 轨迹/pivotCount，产出显式 `kind ∈ {none, weak, thrashing}`。
  2. `decideNext` 先判 `turn >= absoluteMaxTurns` → `safety_ceiling`。
  3. 若观察为 `weak` → `early_weak`；否则若 `thrashing` → `thrashing`（双真时 weak 优先）。
  4. 否则 abort-count → `early_weak`；再否则 consecutive-pivot → `thrashing`。
  5. 否则 probe/pivot（`turn>=maxTurns` 则 `raise_soft_budget`）；无可探 → `coverage_met`/`all_resolved`。
  6. 图 `decide` 把 `DecisionProvenance` 写入 `concludeReason`（hook；worker/SSE/report 不读）。`clarify` 续问烧 turn、不消费 weak/thrashing；仅 `turn>=absoluteMaxTurns` 时经 `decideNext` → `safety_ceiling`。
- **备选流 Alternate：** 旧 checkpoint 缺 `recentScores` → 观察 `kind=none`（不按缺轨迹开火；会话 abort 仍可独立 `early_weak`）。分数样本 `<2`（仅 clarify/unresolved、未 ingest）→ 观察 `none`。单能力 off-ramp / 一次弱答 / 单能力 hasHook 深挖 / 平稳换题仍 probe 或 pivot，不因本观察 conclude。两门均已探尽且观察为 weak 时轨迹信号先于 `all_resolved` → `early_weak`。
- **异常流 Exception：**
  - **E1 重复：** 同一 mind 重放 `observeInterviewSignals` / `decideNext` 字节级相同（纯函数；缺幂等键会让“同输入不同输出”漏过）。
  - **E2 并发：** 本层无共享可变状态；20 次并行观察同一冻结 mind 结果全等。真实双 worker 仍靠 graph fence/CAS（本包不重实现）。
  - **E3 越权：** 函数签名只收 `InterviewMind`。注入 `observedBand` / 年限 / 性别 / 权重 / 学校不得改变信号。
  - **E4 失败回滚：** 本层不写账本；非法 mind（缺 competencies）fail-closed → `none`，不抛、不抬 maxTurns。
  - **E5 降级：** 缺轨迹字段、分数样本不足、或仅 clarify/unresolved 未 ingest → `none`。图级 `unscored`/identity-mismatch 走 `evaluate-answer` 直跳 conclude，不经本包 `ConcludeReason`。
  - **E6 超时/断线：** 本层无 IO。恢复后只对账 checkpoint 里的 mind，不补造分数。
- **后置 Postcondition：** 若经 `decideNext` conclude，reason 为 `ConcludeReason` 之一；`maxTurns` 未被信号改写；无 band/等级写入；`concludeReason` 未被 worker/SSE/report 消费。
- **验收 Acceptance：**
  - 多能力持续弱且已过最小轮次且分数样本≥2 → `early_weak`，且仍有未探能力时也会停（不再为凑满清单继续问）。
  - 跨能力高/低分翻转≥3 且 `pivotCount≥3` 且无人 `confidence≥0.7` → `thrashing`。
  - `weak` 与 `thrashing` 同真 → `early_weak`。
  - `turn>=absoluteMaxTurns` 即使信号为 weak/thrashing 仍是 `safety_ceiling`。
  - 已满足 weak 的 mind 在 `clarify` 续问时不 conclude（`concludeReason=null`）。
  - 单题高分、hasHook 深挖、单能力 off-ramp 不触发提前终止。
  - 受保护属性/客户端 band 不进入特征。
- **关联：** 无 HTTP。状态机对象 `NextAction`。原语：纯函数幂等（E1）；隔离靠不读外来字段（E3）。隐私：不读简历原文/PII。
- **七类覆盖标注：** 正/异/特/逃/并/复/刁

### 七类测试矩阵

| 类别 | TC | 必测断言 | 层 |
| --- | --- | --- | --- |
| 正 | `TC-INT-LEVEL-SIGNAL-01-main` | 两能力均弱且 `turn≥4` 且分数样本≥2 → `decideNext.reason=early_weak`；跨能力高/低翻转≥3 且 pivot≥3 且无人够强 → `thrashing`；双真 → `early_weak`。 | 单元+图（weak 装配图；thrashing 为 decideNode+域，自然满轮不作为装配图必达） |
| 特 | `TC-INT-LEVEL-SIGNAL-01-S1` | 空清单/`turn=0`/缺 `recentScores`（含 turn≥4 已弱的旧 checkpoint）/CJK 能力名 → `none`；不改 `maxTurns`。 | 单元 |
| 异 | `TC-INT-LEVEL-SIGNAL-01-E1` | 同一 mind 重放 3 次信号与 `decideNext` 结果 `JSON` 全等。 | 单元 |
| 逃 | `TC-INT-LEVEL-SIGNAL-01-E3` | `turn>=absoluteMaxTurns` 覆盖 weak/thrashing → 仍 `safety_ceiling`；信号不改写 `maxTurns`。 | 单元+图 |
| 并 | `TC-INT-LEVEL-SIGNAL-01-E2` | 20 次并行观察同一冻结 mind，结果全等。 | 单元 |
| 复 | `TC-INT-LEVEL-SIGNAL-01-M1` | 单能力连续低分仍 pivot（off-ramp），不 conclude；两门探尽且观察为 weak → `early_weak`（轨迹信号先于 `all_resolved`）；够强路径仍 `all_resolved`。 | 单元 |
| 刁 | `TC-INT-LEVEL-SIGNAL-01-T1` | 注入 `observedBand=senior`、年限、性别、学校、权重不改变信号；单能力 hasHook 深挖翻转不标 thrashing；平稳换题无翻转不标 thrashing；单题 100 分不单独终止；仅 clarify/unresolved 无 ingest → `none`；weak mind + clarify → 续问且 `concludeReason=null`。 | 单元+图 |
