---
id: requirements_agent_observability_evaluation
name: Agent 观测与评测闭环用例
description: 为 Agent 图运行、离线评测、在线抽样评审与问题回归建立隐私、成本和版本边界。
type: requirement
scope: shared
level: use-case
status: approved_to_implement
owner: product
version: 1
related:
  - ../../architecture/ai/agent-observability-evaluation-runtime.md
  - ../../architecture/ai/langgraph-blueprint.md
  - ../../architecture/ai/memory-context-design.md
  - ../../testing/strategy/test-strategy.md
  - ../../rules/ai/structured-output-and-safety.md
---

# Agent 观测与评测闭环用例

## 0. 范围与术语

本文的 Agent（智能体）使用 LangGraph（图编排框架）管理可恢复流程；Langfuse（模型可观测与评测平台）只承载脱敏的观测和评测工件，绝不成为业务事实或授权系统。Eval（评测）分成两条不可混写的链路：离线评测集全量运行；在线 LLM-as-a-Judge（大语言模型充当评审）最多抽取合格业务结果的 10%。Trace（链路追踪）趋势只产生待人工确认的问题，不会自动改 prompt（提示词）、业务分数、扣点、招聘排序、退款或录用结果。

本次只允许合成、公开许可或已同意且去标识化的材料进入评测工件。简历、答案、录音、评论、原始用户/会话/幂等标识、支付信息、密钥和完整提示词不得外送。

## 1. 领域对象与状态机

| 对象 | 状态 | 不变量 |
| --- | --- | --- |
| `EvaluationCase` | `draft → validated → regression_next → frozen_release → retired` | 冻结版本不可原地编辑；同一 source group 只能在一个数据划分中。 |
| `OnlineJudgePolicy` | `draft → triage_only | calibrated → retired` | `triage_only` 永远不产生发布阻断；`calibrated` 也不得改变用户业务结果。 |
| `OnlineJudgeCandidate` | `eligibility=(eligible | rejected_privacy | revoked)`；`selection=(pending | lot_closed_unsampled | selected | skipped_budget)`；`dispatch=(not_dispatched | claimed | dispatching | judged | failed | unknown)` | 三个正交状态维度，避免把“未被抽中”“预算不足”和“外部调用已未知”混写成一条线；每个 `attemptRefHmac + judgePolicyVersion` 最多一次。 |
| `OnlineJudgeLot` | `open → closed` | 每个 `(policy, stratum, lotNo)` 恰有 `slot 0..9`；关闭后 selected 精确为 1 或显式保持 `skipped_budget`，不能重开或补抽。 |
| `TraceFinding` | `observed → triage → dismissed | candidate → double_labeled → adjudicated → regression_next` | 未经脱敏、复现、审批的 trace 不能成为数据集样本。 |
| `GraphObservation` | `started → succeeded | failed` | 失败只能影响观测指标，不能改变图路由、账本或 SSE（服务器推送事件）。 |
| `OfflineEvaluationRun` | `planned → running → passed | failed | timed_out | inconclusive` | 每个 `caseId + caseVersion` 必有受限运行器、版本化 oracle（判定器）和结果；`skipped`、缺绑定、超时、分母不全都不能映射为 `passed`。本地回执永远不是发布证据。 |

## UC-AOE-001 · 全量离线回归评测

- 角色 Actor：持续集成（CI，持续集成）任务。
- 前置 Precondition：评测 manifest（清单）已校验来源、许可证、分组划分、版本和 SHA-256（安全散列）digest（摘要）。
- 触发 Trigger：合并请求或发布候选运行离线门。
- 主流程 Main：
  1. 读取不可变 `contract-regression` 和选定版本的离线数据集。
  2. 以确定性规则运行安全、配置、幂等、状态机、脱敏和图重放样本。
  3. 报告每个 case、版本、分子、分母、跳过和失败；任一硬不变量失败即非零退出。
- 备选流 Alternate：开发集仅用于调参；`release-holdout`（发布留出集）只用于发布候选且禁止反向调参。
- 异常流 Exception：
  - E1 重复请求：同 `caseId + caseVersion` 重跑结果 digest 相同，幂等键不产生重复副作用。
  - E2 并发冲突：同一图 resume（恢复）并发时，question/answer/event 的业务 ledger（账本）去重为 1。
  - E3 越权：跨 principal（当前身份）的 checkpoint（检查点）、检索、观测查找均返回 0 项。
  - E4 失败回滚：任何模型/网络依赖不可用时，离线确定性安全门不以“跳过”记为通过。
  - E5 降级：真实模型评测不可用时标 `inconclusive`（证据不足），不得输出质量通过。
  - E6 超时/断线：超时 case 有固定时间预算和结果码，不能无限重试。
- 后置 Postcondition：仅写入脱敏本地结果 artifact；不写生产账本、外部追踪或用户数据。
- 验收标准 Acceptance：离线 case 覆盖率为 100%；硬不变量失败数为 0；每条结果带 `caseId/caseVersion/codeSha/policyVersion`。
- 关联：`EvaluationCase`；幂等、行级安全（RLS）、比较并交换（CAS）和有序事件日志。

### UC-AOE-001 的执行回执契约与测试矩阵

目标受信任离线运行器只接受代码内的受限 `gateId`（门编号）和固定 profile（配置档），绝不接受 manifest（清单）中的 shell（命令行解释器）字符串、URL（统一资源定位符）或任意可执行路径。它在一个 case 开始前写 `running`，结束时写入 `passed | failed | timed_out | inconclusive` 之一；每个最小化回执必须含 `caseId`、`caseVersion`、catalog digest（目录摘要）、code SHA-256（代码安全散列）、gateId、profile、时长、结果码和 oracle digest（判定器摘要）。原始 prompt（提示词）、答案、简历、录音、身份标识和外部端点不进入回执。

当前 `offline-eval:contract` 是本地诊断运行器：它只接受代码内固定命令、以正向 allowlist（允许列表）启动子进程、截断并丢弃 child（子进程）标准输出/标准错误，且只在父运行器命中该 case 的固定 oracle 行时标 `passed`。它没有受信任身份、不可变工件、逐 case 的持久 `running` 事件或发布证据接收器；因此只产生 `untrusted_local_contract_receipt`（本地不受信合同回执），永远不能代替本段目标的 `OfflineEvaluationRun`。

| 类别 | 测试用例 | 断言与层级 |
| --- | --- | --- |
| 正常 | `TC-AOE-001-main` | 每个 `contract-regression`（合同回归）case 都精确绑定一个或多个允许的真实 gate，且必须命中自身版本化 oracle；gate 成功但未命中该 case oracle 只能为 `inconclusive`，集成测试。 |
| 异常 | `TC-AOE-001-E1` | 同一 run/case 重放只得到同一不可变结果，不增加外部副作用；幂等键，单元/集成。 |
| 特殊 | `TC-AOE-001-S1` | 非确定性真实模型 case 在无受保护模型凭据时为 `inconclusive`，绝不以 fake（替身）或 `passed` 代替；夜间运行器测试。 |
| 逃逸通道 | `TC-AOE-001-E3` | manifest 试图带 shell、外部路径、远程 URL、Langfuse（模型可观测与评测平台）/模型凭据时拒绝；allowlist（允许列表），单元。 |
| 高并发 | `TC-AOE-001-E2` | 同一 case 并发领取只能有一个执行 lease（租约），其他读取同一结果或得到明确冲突；CAS（比较并交换），集成。 |
| 复杂 | `TC-AOE-001-M1` | PR（合并请求）只跑确定性合同；夜间运行开发集真实模型；发布候选只跑冻结 holdout（留出集），三者 profile 混用即失败；集成。 |
| 刁钻 | `TC-AOE-001-E4`、`TC-AOE-001-E5`、`TC-AOE-001-E6` | gate 超时、child（子进程）伪造 stdout（标准输出）、缺 case/多余 case、oracle 版本漂移都不能洗掉失败或缩小分母；超时/签名回执/精确集合断言。 |

现阶段的 120 条 `v1` 合成目录只允许用于合同、隐私和数据集传输校验；它**不能**充当 120 条真实模型质量结论。所有 normal（正常）/abnormal（异常）/holdout（留出）case 必须补齐真实入口、隔离 fixture（测试夹具）、版本化 oracle、时延/引用/副作用断言后，才能进入相应 profile。缺任一项时发布候选必须以 `inconclusive` 失败。

## UC-AOE-002 · 在线评审抽样不超过 10%

- 角色 Actor：异步评测调度器。
- 前置 Precondition：业务 attempt（一次逻辑业务结果）已终态、去重、通过脱敏和用途/同意检查；评审策略已校准且有日/月成本上限。
- 触发 Trigger：产生符合资格的终态 attempt。
- 主流程 Main：
  1. 用 `feature × languageGroup × modality × riskBucket` 形成稳定 stratum（分层）；模型/提示词/语料版本仅作标签，不参与分层。
  2. 资格登记只接受 `synthetic`（合成）、`public_licensed`（公开许可）或 `consented_deidentified`（明确同意且去标识化）来源；保存用途、活动同意、去标识化 receipt（回执）摘要和不透明 attempt 引用。原始回答、音频、评论、简历、owner/thread/idempotency key（属主/线程/幂等键）及其裸 hash（散列）不得进入候选表或 packet（数据包）。
  3. 每个分层按到达顺序累计 10 个**已通过资格**的 attempt 为一个 lot（批次）；同一 `attemptRefHmac + judgePolicyVersion` 的重放只返回已有记录，不能占用第二个 slot（槽位）。
  4. lot 关闭与选择在一个数据库事务中完成：用专用私钥的 HMAC-SHA-256（带密钥哈希）在 lot 内决定唯一最低序的样本；其余 9 条固定为 `lot_closed_unsampled`，不得因模型重试、稀有分层或后续预算变化重新抽取。
  5. 仅当策略、用途/同意、去标识化 receipt 和成本预留仍有效时，异步发送最小、脱敏的 judge packet；所有网络 I/O（输入输出）发生在短事务 `dispatching` 边界之后。
  6. 写入 item score（条目评分）及 run score（运行评分），并保持与业务写入完全隔离。
- 备选流 Alternate：稀有高风险分层少于 10 条时不扩大抽样比例，转人工复核和离线合成样本补充。
- 异常流 Exception：
  - E1 重复请求：`attemptRefHmac + judgePolicyVersion` 唯一，SSE/队列/模型重试均不增加候选、slot 或抽样数（幂等唯一键）。
  - E2 并发冲突：lot 关闭与选择使用行锁、唯一 slot 和 CAS（比较并交换）条件写入；20 个并发调度最多关闭 1 次、选出 1 条。
  - E3 越权：撤回同意、脱敏失败、用途不匹配、来源不在 allowlist（允许列表）的 attempt 标为 `rejected_privacy | revoked`；外送数为 0，跨 owner（属主）读写行数为 0（RLS，行级安全）。
  - E4 失败回滚：judge 超时或写入失败不回滚、修改或延迟用户业务结果；业务 interview（面试）、score（分数）、consumption（消费账本）、权益和 SSE（服务器推送事件）变化数均为 0。
  - E5 降级：预算不足固定为 `skipped_budget`，不从同 lot 选择替补；judge 未校准只允许 `triage_only`，不得成为发布阻断依据。
  - E6 超时/断线：外部提交采用有界一次性 job；`dispatching → unknown` 后不盲重试，网络发送次数不增加，不得超过 10% 配额。
- 后置 Postcondition：每个分层、任意到达前缀满足 `selected ≤ floor(eligible / 10)`；业务账本、分数和权益不变。
- 验收标准 Acceptance：`duplicate_sampled_attempt_count=0`、`unredacted_judge_payload_count=0`、`judge_output_used_for_business_decision_count=0`、`unknown_dispatch_auto_retry_count=0`，并逐日逐层证明采样公式。
- 关联：`OnlineJudgePolicy/OnlineJudgeCandidate/OnlineJudgeLot/OnlineJudgeDispatch`；HMAC、CAS、幂等键、RLS、成本预留和数据最小化。

## UC-AOE-003 · Trace 趋势发现问题并冻结为回归样本

- 角色 Actor：质量运营人员、双盲标注人员、仲裁人员。
- 前置 Precondition：trace 已通过脱敏且仅含 pseudonym（伪名化标识）、版本、枚举、长度、token（词元）数、延迟和结果码。
- 触发 Trigger：安全失败、质量退化、漂移、用户反馈或人工复核发现异常签名。
- 主流程 Main：
  1. 趋势面板按 feature/model/prompt/rubric（评分规则）/language/modality/RAG（检索增强生成）generation（检索制品版本）展示分母和置信区间。
  2. 告警创建 `TraceFinding`，写最小复现、版本、风险和负责人；不自动改配置。
  3. 人工确认可复现、脱敏和处理依据后，生成候选 case。
  4. 主观问题由两名独立标注人员标注，分歧由第三人仲裁；确定性配置/泄露问题仍须 reviewer（复核人）确认。
  5. 通过后创建新 `caseVersion` 进入 `regression_next`，下一版才冻结为 `frozen_release`。
- 备选流 Alternate：重复、不可复现、无处理依据的问题进入 `dismissed`，保存最小审计记录但不保存用户原文。
- 异常流 Exception：
  - E1 重复发现：相同 failure signature（失败签名）合并到既有 `caseId`，不创建相互矛盾期望。
  - E2 并发仲裁：冻结转换需两人审批的 CAS，不能覆盖正在审阅的版本。
  - E3 越权：非授权人员读不到 `online-quarantine`（线上隔离候选区）和受控原始引用。
  - E4 失败回滚：脱敏、许可证或双盲标注失败时，不创建外部数据集条目。
  - E5 降级：样本量不足时显示 `inconclusive`，不把趋势均值写成质量结论。
  - E6 超时/断线：审核租约过期后回到 `triage`，无审批不冻结。
- 后置 Postcondition：每个已验证问题关联一个 `caseId` 或显式关联同类既有 case；原 trace 不进入 Git（代码仓库）或 Langfuse 数据集。
- 验收标准 Acceptance：未经 `double_labeled + adjudicated` 的主观 case 冻结数为 0；每个 finding 均可追溯到状态与审批记录。
- 关联：`TraceFinding/EvaluationCase`；RLS、CAS、审计事件和隐私删除。

## UC-AOE-004 · 图节点观测与外部后端故障隔离

- 角色 Actor：后台 worker（后台执行进程）、观测后端。
- 前置 Precondition：启用开关、公钥、私钥、HTTPS（安全超文本传输协议）地址和专用 correlation secret（关联哈希密钥）完整且一致。
- 触发 Trigger：图运行开始、每个节点开始/结束以及模型调用完成。
- 主流程 Main：
  1. 创建根 graph run span（跨度）和受控子节点 span；只带版本、状态枚举、长度/耗时/token 计数与 HMAC 伪名。
  2. 模型、检索和 tools（工具）以子 observation（观察项）表示，保留 parent-child（父子）关系。
  3. 结束时有界 flush（排空）并更新 `configured/connected/dropped/flush_failed` 指标。
- 备选流 Alternate：开关关闭时使用 no-op（空操作）观察器，业务流程正常运行且网络发送数为 0。
- 异常流 Exception：
  - E1 重放：同逻辑图运行的外送关联 ID 稳定但非原始 thread/idempotency key。
  - E2 并发：不同图运行不共享 active context（活动上下文）或父 span。
  - E3 越权：payload 不含 owner、raw thread、raw idempotency key、answer hash、prompt、PII（个人可识别信息）或密钥。
  - E4 失败回滚：观测写入失败只增加指标，不影响评分、扣点、报告或 SSE。
  - E5 降级：错误配置在启动前拒绝 attach（附着），而不是假装已连接；开关关闭时显式显示 disabled。
  - E6 超时/断线：flush 有硬时限，进程退出不无限等待；丢弃有计数和告警。
- 后置 Postcondition：业务状态机不受观测后端影响；失败可从指标和告警发现。
- 验收标准 Acceptance：10,000 个含已知敏感标记的 payload 中敏感命中数为 0；同一图运行存在 root→node→generation 层级；后端故障时业务断言完全不变。
- 关联：`GraphObservation`；fail-open（观测失败不阻断业务）、HMAC、数据最小化、指标告警。

## 七类覆盖矩阵

| 用例 | 正常 | 异常 | 特殊 | 逃逸通道 | 高并发 | 复杂 | 刁钻 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-AOE-001 | 全量离线集 | 依赖失败 | 留出集 | inconclusive | 重复运行 | 多版本 | 伪绿/跳过洗分母 |
| UC-AOE-002 | 10 条选 1 条 | judge 故障 | 稀有分层 | 预算跳过 | lot 竞争 | 多维分层 | 重试膨胀采样 |
| UC-AOE-003 | 审批入集 | 标注冲突 | 无许可来源 | dismissed | 冻结竞争 | 趋势到审批 | PII trace 自动入集 |
| UC-AOE-004 | 节点层级 | 后端断线 | 关闭开关 | no-op | 多 run 并发 | 根/子 observation | 原 hash/密钥泄露 |
