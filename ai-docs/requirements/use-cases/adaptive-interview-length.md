---
id: requirements_use_cases_adaptive_interview_length
name: 用例 · 自适应面试动态长度（覆盖/证据驱动，软预算 + 平台杀开关）
description: 用确定性 decideNext 按覆盖、证据和会话信号决定继续、加深或收尾；软预算可上调，不是产品硬顶。绝对杀开关只防 runaway/成本滥用。不是 INT-LONG-INTERVIEW-01。
type: requirement
scope: shared
level: must
status: active
owner: product
version: 2
tags:
  - interview
  - graph
  - adaptive
related:
  - ./use-case-conventions.md
  - ../../testing/conventions/test-authoring.md
  - ../../rules/global/production-invariants.md
  - ../../architecture/current-runtime-truth.md
  - ./expert-long-interview-runtime.md
  - ./interview-control-signals.md
---

# 自适应面试动态长度

## 0. 生成前门禁

| 字段 | 内容 |
| --- | --- |
| 任务范围 | 废除产品硬顶（含已废除的 8 与不得再写的 16）。停续由 `decideNext` 按覆盖/证据/弱答下车/换题空转/加深信号决定。软预算可因证据加深上调；只有 `absoluteMaxTurns`（默认 120，长时面试档）是平台 runaway 杀开关，不是面试质量政策。决策带可审计出处（reason code + 覆盖计数 + 引用能力名 + 预算字段）。 |
| 来源证据 | 现码：`packages/domain/src/adaptive-interview.ts` 的 `decideNext` / `derivedSoftBudget` / `boundedSoftBudget` / `boundedAbsoluteMaxTurns` / `rememberDecision`；图 `plan` 把调用方软预算与绝对杀开关写入 mind，不再夹产品硬顶。生产 Worker 默认不传绝对杀开关（→120）。60/90/120 是**允许的杀开关档位**，不是已接线 blueprint/env。`INT-LONG-INTERVIEW-01` 仍要求 time+module blueprint，不以调高杀开关或软预算代替。 |
| 明确不做 | 不实现 `INT-LONG-INTERVIEW-01`（无 60/90/120 分钟 blueprint、无 module scheduler、无新表/迁移）。允许绝对杀开关配置 60/90/120 **档位**，不等于已接线 blueprint。不让模型输出决定停/续。不加 CI/CD。不写密钥。不把回答原文或证据全文写入出处。不把默认可变长称为一到两小时专家面试。 |
| 领域对象 | `InterviewMind`、`NextAction`、`DecisionProvenance`、`CoverageSnapshot`。不新增支付/权益对象。 |
| 状态机影响 | 图仍是 `plan→decide→…→conclude`。`concluded=true` 的触发是政策 reason，不是「轮数==N」；`Interview` 业务终态仍由现有 lifecycle 投影。 |
| 接口契约影响 | 无新 HTTP 契约。图状态可多 `concludeReason`（审计投影，不含原文）。 |
| 数据库影响 | 无迁移。checkpoint 多可选字段（`absoluteMaxTurns`、`budgetRaises`、`softBudget`），缺省：绝对杀开关按 120、软预算按 mind.maxTurns。 |
| 测试计划 | 域证明：早停 / 加深过原 8 / 软预算上调 / 16 不是墙 / 只有高位绝对杀开关硬收尾 / 出处 / 模型信号无效。图证明：`maxTurns=999` 夹到绝对 120（不是 16）；强+钩子路径 `turn>8` 且发生 raise；弱/跳过路径 `turn<8` 收尾且带 reason。 |
| 验证命令 | `pnpm adaptive:prove` · `pnpm adaptive-redesign:prove` · `pnpm adaptive-length:prove` · `pnpm adaptive-graph:prove` · `pnpm docs:check`。本切片 `releaseEvidence=false`（本地域/图证明，不是发布门）。 |

本页**不是** `UC-INT-LONG-INTERVIEW-01`。01 仍要求冻结 blueprint / time / module，且前置未闭合。本页只改当前短流程面试图的**长度政策**。把杀开关或软预算调到 16 或 120 **都不等于** 01 完成。

## 1. 横切定义

- **软预算** `InterviewMind.maxTurns`：政策，不是墙。未指定时由覆盖计划派生（各能力 probeCap 之和：核心 3 / 其余 2）。调用方可显式给出初值。耗尽时若仍有正当 ask（覆盖缺口或加深），`decideNext` **上调**软预算（步长 4，夹到绝对杀开关）并标 `raise_soft_budget`；不得只因 `turn ≥ 软预算` 收尾。
- **绝对杀开关** `absoluteMaxTurns`：平台 runaway/成本护栏，**不是**面试质量政策。默认 `DEFAULT_ABSOLUTE_MAX_TURNS=120`（长时面试**轮次**档，不是 120 分钟 blueprint）。`boundedAbsoluteMaxTurns` 允许 60/90/120 档；再高夹到 `PLATFORM_ABSOLUTE_CEILING_TURNS=180`（杀开关自身的上限，防 `1e9`）。生产 Worker 未接线选档。外部 `maxTurns=999` 只能涨到该场绝对杀开关，不能无界。
- **覆盖**：核心能力已结算（`confidence≥0.7` 或已探到该能力追问上限）且带计分证据条数。
- **出处 / provenance**：`DecisionProvenance` 只含 reason code、turn、当前软预算、绝对杀开关、`budgetRaises`、覆盖计数、会话计数、引用能力名。禁止答案原文、证据全文、PII。
- **控制权**：停/续/加深/上调只由 `decideNext` 纯函数决定。`assess` 的分数/hasHook 是输入事实；任何 `shouldConclude` / 自然语言「可以结束了」都不得改变控制流。`relevant=false` 仍走既有非作答感知（澄清/未决），它加速烧覆盖，但不是 conclude 裁判。
- **隔离 E2E / chaos 成本锁**：测试可把软预算与绝对杀开关**同时**压到 1–8。那是控费夹具，不是生产长度政策。

长度政策优先级（先匹配先生效）：

1. `safety_ceiling`（`turn ≥ absoluteMaxTurns`）——唯一硬墙
2. 分数轨迹 `observeInterviewSignals`（`UC-INT-LEVEL-SIGNAL-01`）：`weak` → `early_weak`，`thrashing` → `thrashing`；同真时 weak 优先；不改写 `maxTurns`
3. 会话 abort `early_weak`（已问够最少轮、无强能力、弱答下车+未决次数达标）
4. 连续无产出换题 `thrashing`
5. 若将 ask：`probe_weak` / `probe_deepen_strong` / `pivot_coverage` / `pivot_offramp`；若此时 `turn ≥ 软预算` 则改为 `raise_soft_budget` 并写入新软预算
6. `coverage_met`（核心均已结算且有计分证据，且无可探）
7. `all_resolved`（无可探，但核心证据不足或无核心标记）

`budget_exhausted` 仍留在 reason 枚举（旧 checkpoint / 审计兼容），**不再**作为「软预算到点就停」的主路径。

## UC-INT-LENGTH-01 · 按覆盖与证据动态决定继续、加深、上调或收尾

- **角色 Actor：** 自适应图 / 确定性 `decideNext`（候选人只提供作答）
- **前置 Precondition：** `InterviewMind` 已由 `plan` 初始化；能力清单来自图外规划；本场软预算已派生或由调用方给出；绝对杀开关已夹紧。
- **触发 Trigger：** 每轮 `evalAnswer` 之后，或开局 `plan` 之后，进入 `decide`。

**主流程 Main**
1. `decideNext` 从 mind 计算 `CoverageSnapshot` 与会话信号（连续换题、未决、off-ramp），不读模型自由文本。
2. 若已触达绝对杀开关 → `conclude/safety_ceiling`。
3. 否则消费 `observeInterviewSignals`（分数轨迹；见 `UC-INT-LEVEL-SIGNAL-01`）：`weak` → `early_weak`，`thrashing` → `thrashing`。
4. 否则会话 abort / 连续无产出换题仍可 `early_weak` / `thrashing`（与轨迹信号独立）。
5. 若当前能力仍弱或被钩子封顶、且未满该能力 probeCap → `ask/probe`（`probe_weak` 或 `probe_deepen_strong`）。
6. 若仍有覆盖缺口 → `ask/pivot`（`pivot_coverage` / `pivot_offramp`）。
7. 若将 ask 且已达当前软预算 → 上调软预算并标 `raise_soft_budget`（仍出题，不收尾）。
8. 核心覆盖已满且无可探 → `conclude/coverage_met` 或 `all_resolved`。
9. 图把 `DecisionProvenance` 写入 `mind.lastDecision`；`rememberDecision` 落盘新软预算与 `budgetRaises`；收尾时写入 `concludeReason`；`conclude` 后不再 `genQuestion`。

**备选流 Alternate**
- A1 弱/跳过/连续低分下车：达到最少轮与中止阈值 → `early_weak`，即使未到软预算。分数轨迹 `weak` 也可独立 `early_weak`（见 `UC-INT-LEVEL-SIGNAL-01`）。
- A2 连续无产出换题 → `thrashing`。跨能力高/低分翻转 + `pivotCount` 的轨迹 `thrashing` 也可独立触发。
- A3 强+hasHook：仍走既有 HOOK_CAP 深挖；软预算 8 时可上调并 `turn>8` 继续。无钩子高分仍一次结算。
- A4 软预算触顶但仍可探：`raise_soft_budget`，不是 `safety_ceiling`，也不是 `budget_exhausted`。

**异常流 Exception**
| flow | 场景 | 机制 | 缺了会漏什么 |
| --- | --- | --- | --- |
| E1 重复 | 同一 checkpoint 再 `decide` | 纯函数：同 mind → 同 action + 同 provenance 字节级字段 | 重放会再出一题或改 reason |
| E2 并发 | 双 worker 同 thread resume | 既有 graph fence / lease CAS；政策层不新开写入 | 两路各出一题 |
| E3 越权 | 伪造他人物 mind / 改预算想无界 | 图只信本 thread checkpoint；软预算夹到绝对杀开关，绝对杀开关夹到 180 | 无界面谈或读到他人状态 |
| E4 回滚 | 收尾不得补写分数或伪造覆盖 | 只标 `concluded` + provenance；transcript 保持已有投影 | 用收尾理由造一个满分 |
| E5 降级 | 模型评分 `unscored` / 身份不匹配 | 既有 eval 安全终止，不进入「模型说继续」 | 故障被当成弱答加深 |
| E6 断线 | interrupt 后 resume | 重放 `awaitAnswer` 不出题；`decide` 读持久 mind（含已上调软预算） | 重连重置预算或再生成 |

**后置 Postcondition：** `concluded=true` 时必有 `ConcludeReason` 与出处计数；`turn ≤ absoluteMaxTurns`；无新消费账本（本 UC 不改扣费）。软预算可以大于开场值。

**验收 Acceptance**
1. `maxTurns=999` 的图 mind 软预算与绝对杀开关均为默认 120，且不能靠外部参数变成无界；**不是**落到 16。
2. 软预算 8 + 全程 hasHook 的多核心清单 `turn>8`，且发生 `raise_soft_budget` / `budgetRaises≥1`，收尾不是 `safety_ceiling`。
3. `turn=16` 且仍可探 → 上调软预算，不是 `safety_ceiling`。
4. 只有 `turn ≥ absoluteMaxTurns`（默认 120）才 `safety_ceiling`。
5. 连续跳过/弱答下车在 `turn<8` 时即可 `early_weak` 或 `thrashing`，且 provenance 引用真实能力名、证据条数为非负整数。
6. `assess` 附加 `shouldConclude=true` 不得单独结束面试。
7. 出处对象 JSON 不含答案原文、证据全文、邮箱/手机模式。

**关联：** 无新 endpoint。状态机：图 `concluded`。原语：E1 纯函数幂等、E2 既有 fence/lease CAS、E3 checkpoint RLS（本切片不改表）。隐私：出处最小化。

**七类覆盖：** 正 / 异 / 特 / 逃 / 并 / 复 / 刁

### 七类测试矩阵

| 类 | TC | 层 | 能失败的断言 |
| --- | --- | --- | --- |
| 正 | `TC-INT-LENGTH-01-main` | 域 | 核心强答+钩子 → `probe_deepen_strong`；无钩子高分一次结算，不额外死磕 |
| 特 | `TC-INT-LENGTH-01-S1` | 域；`999→120` 另有图证明 | 默认绝对=120；`999` 绝对夹到 180、软预算夹到该场绝对；显式软预算 8 不夹到 16；`boundedAbsoluteMaxTurns(60/90/120)` 可配（生产未接线选档） |
| 异 | `TC-INT-LENGTH-01-E4` | 图 | `adaptive-graph:prove` 深挖收尾：transcript 分数保持 95、无 `__interrupt__`（不再出题） |
| 逃 | `TC-INT-LENGTH-01-E5` | 域 | `turn=16` 仍可探 → raise；`turn≥120` 才 `safety_ceiling`；测试可将绝对压到 1 控费 |
| 并 | `TC-INT-LENGTH-01-E1` | 域 | 同 mind 连续两次 `decideNext` 的 kind/reason/provenance 字段全等 |
| 复 | `TC-INT-LENGTH-01-M1` | 域+图 | 早停路径 `turn<8`；深挖路径 `turn>8` 且 raise；二者 reason 不同且都带出处 |
| 刁 | `TC-INT-LENGTH-01-T1` | 域 | 模型 `shouldConclude` / 伪造 lastDecision / 超大 maxTurns 都不能越过政策与绝对杀开关；provenance 无原文 |

本切片不新增 HTTP 或钱包路径，故 并/逃/刁 落在域+图证明（与现有 `adaptive-graph:prove` 同层），不新开 Playwright。既有隔离 E2E 仍用 `E2E_ADAPTIVE_MAX_TURNS∈[1,8]` **同时**锁软预算与绝对杀开关控费，不构成本政策的生产长度证据，也不构成 `INT-LONG-INTERVIEW-01` 证据。
