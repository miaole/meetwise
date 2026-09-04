---
id: requirements_use_cases_adaptive_interview_length
name: 用例 · 自适应面试动态长度（覆盖/证据驱动，安全天花板）
description: 用确定性 decideNext 按覆盖、证据和会话信号决定提前收尾或加深，取代产品硬顶 HARD_MAX_TURNS=8；安全天花板防无界面谈。不是 INT-LONG-INTERVIEW-01。
type: requirement
scope: shared
level: must
status: active
owner: product
version: 1
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
---

# 自适应面试动态长度

## 0. 生成前门禁

| 字段 | 内容 |
| --- | --- |
| 任务范围 | 废除图 `plan` 节点的产品硬顶 `HARD_MAX_TURNS=8`。`decideNext` 按覆盖/证据/弱答下车/换题空转决定提前收尾或强答加深；`SAFETY_CEILING_TURNS=16` 仍硬截断。决策带可审计出处（reason code + 覆盖计数 + 引用能力名）。 |
| 来源证据 | 现码：`packages/domain/src/adaptive-interview.ts` 的 `decideNext` / `boundedInterviewTurns`；`packages/ai-graphs/src/adaptive-interview/nodes/plan.ts` 只夹安全天花板。`INT-LONG-INTERVIEW-01` 仍要求 time+module blueprint，不以加大固定轮数代替。 |
| 明确不做 | 不实现 `INT-LONG-INTERVIEW-01`（无 60/90/120 分钟 blueprint、无 module scheduler、无新表/迁移）。不让模型输出决定停/续。不加 CI/CD。不写密钥。不把回答原文或证据全文写入出处。不把默认变长称为一到两小时专家面试。 |
| 领域对象 | `InterviewMind`、`NextAction`、`DecisionProvenance`、`CoverageSnapshot`。不新增支付/权益对象。 |
| 状态机影响 | 图仍是 `plan→decide→…→conclude`。`concluded=true` 的触发从「轮数==8」改为政策 reason；`Interview` 业务终态仍由现有 lifecycle 投影。 |
| 接口契约影响 | 无新 HTTP 契约。图状态可多 `concludeReason`（审计投影，不含原文）。 |
| 数据库影响 | 无迁移。checkpoint 多可选字段，缺省当 0/null。 |
| 测试计划 | 域证明：早停/加深/天花板/出处/模型信号无效。图证明：`maxTurns=999→16`；强+钩子路径 `turn>8` 仍收尾；弱/跳过路径 `turn<8` 收尾且带 reason。 |
| 验证命令 | `pnpm adaptive:prove` · `pnpm adaptive-redesign:prove` · `pnpm adaptive-length:prove` · `pnpm adaptive-graph:prove` · `pnpm docs:check` |

本页**不是** `UC-INT-LONG-INTERVIEW-01`。01 仍要求冻结 blueprint / time / module，且前置未闭合。本页只改当前短流程面试图的**长度政策**。

## 1. 横切定义

- **安全天花板** `SAFETY_CEILING_TURNS=16`：结构硬顶。外部 `maxTurns=999` 必须落到 16。不是「默认总是问 16 题」。
- **产品预算** `maxTurns`：调用方或默认值，夹在 `[1, 16]`。耗尽 → `budget_exhausted`。
- **覆盖**：核心能力已结算（`confidence≥0.7` 或已探到该能力追问上限）且带计分证据条数。
- **出处 / provenance**：`DecisionProvenance` 只含 reason code、turn、预算、覆盖计数、会话计数、引用能力名。禁止答案原文、证据全文、PII。
- **控制权**：停/续/加深只由 `decideNext` 纯函数决定。`assess` 的分数/hasHook 是输入事实；任何 `shouldConclude` / 自然语言「可以结束了」都不得改变控制流。`relevant=false` 仍走既有非作答感知（澄清/未决），它加速烧预算，但不是 conclude 裁判。

长度政策优先级（先匹配先生效）：

1. `safety_ceiling`（`turn ≥ 16`）
2. `budget_exhausted`（`turn ≥ maxTurns`）
3. `early_weak`（已问够最少轮、无强能力、弱答下车+未决次数达标）
4. `thrashing`（连续无产出换题达标、无强能力）
5. 强答+钩子加深 → `probe_deepen_strong`（HOOK_CAP 把高分压在够强线下，沿既有 probeCap 追问；无钩子高分仍一次结算。不靠模型「再问一轮」）
6. 既有 probe/pivot（`probe_weak` / `pivot_coverage` / `pivot_offramp`）
7. `coverage_met`（核心均已结算且有计分证据，且无可探）
8. `all_resolved`（无可探，但核心证据不足或无核心标记）

## UC-INT-LENGTH-01 · 按覆盖与证据动态决定继续、加深或收尾

- **角色 Actor：** 自适应图 / 确定性 `decideNext`（候选人只提供作答）
- **前置 Precondition：** `InterviewMind` 已由 `plan` 初始化；能力清单来自图外规划；本场 `maxTurns` 已按安全天花板夹紧。
- **触发 Trigger：** 每轮 `evalAnswer` 之后，或开局 `plan` 之后，进入 `decide`。

**主流程 Main**
1. `decideNext` 从 mind 计算 `CoverageSnapshot` 与会话信号（连续换题、未决、off-ramp），不读模型自由文本。
2. 若当前能力仍弱或被钩子封顶、且未满该能力 probeCap → `ask/probe`（`probe_weak` 或 `probe_deepen_strong`）。
3. 若仍有覆盖缺口 → `ask/pivot`（`pivot_coverage` / `pivot_offramp`）。
4. 核心覆盖已满且无可探 → `conclude/coverage_met` 或 `all_resolved`。
5. 图把 `DecisionProvenance` 写入 `mind.lastDecision` 与 `concludeReason`；`conclude` 后不再 `genQuestion`。

**备选流 Alternate**
- A1 弱/跳过/连续低分下车：达到最少轮与中止阈值 → `early_weak`，即使 `turn<8` 且 `turn<maxTurns`。
- A2 连续无产出换题 → `thrashing`。
- A3 强+hasHook：仍走既有 HOOK_CAP 深挖，直到每能力 cap 或天花板；默认可超过 8 轮。

**异常流 Exception**
| flow | 场景 | 机制 | 缺了会漏什么 |
| --- | --- | --- | --- |
| E1 重复 | 同一 checkpoint 再 `decide` | 纯函数：同 mind → 同 action + 同 provenance 字节级字段 | 重放会再出一题或改 reason |
| E2 并发 | 双 worker 同 thread resume | 既有 graph fence / lease CAS；政策层不新开写入 | 两路各出一题 |
| E3 越权 | 伪造他人物 mind / 改 maxTurns 想无界 | 图只信本 thread checkpoint；`boundedInterviewTurns` 夹紧 | 无界面谈或读到他人状态 |
| E4 回滚 | 收尾不得补写分数或伪造覆盖 | 只标 `concluded` + provenance；transcript 保持已有投影 | 用收尾理由造一个满分 |
| E5 降级 | 模型评分 `unscored` / 身份不匹配 | 既有 eval 安全终止，不进入「模型说继续」 | 故障被当成弱答加深 |
| E6 断线 | interrupt 后 resume | 重放 `awaitAnswer` 不出题；`decide` 读持久 mind | 重连重置预算或再生成 |

**后置 Postcondition：** `concluded=true` 时必有 `ConcludeReason` 与出处计数；`turn ≤ min(maxTurns, 16)`；无新消费账本（本 UC 不改扣费）。

**验收 Acceptance**
1. `maxTurns=999` 的图 mind.`maxTurns===16`，且不能靠外部参数变成无界。
2. 全程 hasHook 的多核心清单在默认预算下 `turn>8` 仍能继续，并在 cap/天花板内 `conclude`。
3. 连续跳过/弱答下车在 `turn<8` 时即可 `early_weak` 或 `thrashing`，且 provenance 引用真实能力名、证据条数为非负整数。
4. `assess` 附加 `shouldConclude=true` 不得单独结束面试。
5. 出处对象 JSON 不含答案原文、证据全文、邮箱/手机模式。

**关联：** 无新 endpoint。状态机：图 `concluded`。原语：E1 纯函数幂等、E2 既有 fence/lease CAS、E3 checkpoint RLS（本切片不改表）。隐私：出处最小化。

**七类覆盖：** 正 / 异 / 特 / 逃 / 并 / 复 / 刁

### 七类测试矩阵

| 类 | TC | 层 | 能失败的断言 |
| --- | --- | --- | --- |
| 正 | `TC-INT-LENGTH-01-main` | 域 | 核心强答+钩子 → `probe_deepen_strong`；无钩子高分一次结算，不额外死磕 |
| 特 | `TC-INT-LENGTH-01-S1` | 域+图 | `undefined/NaN/-1/999` → 预算落在 `[1,16]`；`999` 图 mind=16 |
| 异 | `TC-INT-LENGTH-01-E4` | 图 | `adaptive-graph:prove` 深挖收尾：transcript 分数保持 95、无 `__interrupt__`（不再出题） |
| 逃 | `TC-INT-LENGTH-01-E5` | 域+图 | 全程 hasHook 在 16 轮内必 conclude；`safety_ceiling` 优先于「还可探」 |
| 并 | `TC-INT-LENGTH-01-E1` | 域 | 同 mind 连续两次 `decideNext` 的 kind/reason/provenance 字段全等 |
| 复 | `TC-INT-LENGTH-01-M1` | 域+图 | 早停路径 `turn<8`；深挖路径 `turn>8`；二者 reason 不同且都带出处 |
| 刁 | `TC-INT-LENGTH-01-T1` | 域 | 模型 `shouldConclude` / 伪造 lastDecision / 超大 maxTurns 都不能越过政策与天花板；provenance 无原文 |

本切片不新增 HTTP 或钱包路径，故 并/逃/刁 落在域+图证明（与现有 `adaptive-graph:prove` 同层），不新开 Playwright。既有隔离 E2E 仍用 `E2E_ADAPTIVE_MAX_TURNS∈[1,8]` 控费，不构成本政策的生产长度证据。
