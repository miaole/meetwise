---
id: uc_model_operation_routing
name: 模型操作路由、成本与降级
description: 为文本、视觉、语音、embedding、rerank 和记忆派生建立统一的操作登记、预算、故障语义与测试用例；当前为实现前契约。
type: requirement
scope: shared
level: must
status: blocked
owner: architecture
related:
  - ../../architecture/ai/model-operation-routing.md
  - ../../architecture/ai/bailian-nonproduction-rollout.md
  - ./model-invocation-reliability.md
  - ./memory-governance-and-recall.md
  - ../../delivery/production-readiness-remediation-register.md
---

# 模型操作路由、成本与降级

> **实现状态：** 当前文本 `invoke()` 具备部分持久调用与费用治理；OCR、ASR、TTS、embedding 和 rerank 尚未由统一 operation registry 接管，catalog 也未接入主链。候选 `0088` 已撤销 runtime role 对 invocation 的直写并改由受控过程处理，但尚无真实低权 PostgreSQL 组合根回执，因此 `MODEL-OP-00-DB-STATE-001` 仍阻断本用例。文本主链与 DashScope 原生能力必须使用不同的凭据变量：前者可选择 DeepSeek 主端点和 Qwen 备用端点，后者只认专用 DashScope 凭据，绝不从文本主 Key 隐式继承。原生 URL 已收敛为固定 Beijing endpoint profile 与受限 workspace id 的本地 registry，生产/开发适配器拒绝 key/endpoint override；这只是 `BAILIAN-04` 的静态传输止血，不等于 operation 级最小权限、secret isolation 或统一 registry。OCR 与批量/流式语音的 API 组合根和原始媒体 smoke 当前均 fail-closed；它们不得因为有 Key、模型名或适配器而重新启用。本文件通过后才可改调用入口或使用新的付费 Key 做受控验证。

## 领域对象与状态

- `ModelOperationBinding`：不可变的 `operationId + registryVersion + typedInputDigest`；不含原始 prompt 或供应商 URL。
- `OperationAdmission`：`admitted | rejected_budget | rejected_capacity | denied | known_not_sent`。
- `ModelAttempt`：复用当前持久状态 `claimed → dispatching → succeeded | failed | unknown`。`known_not_sent` 是业务/准入语义，首版必须落为**未派发的** `failed + deterministic pre-dispatch error_code`，而不是虚构尚不存在的数据库 status。
- `LogicalNodeAttemptHeader`：服务端由稳定业务范围、节点类型、冻结 binding/version 与业务 revision 重算的 canonical logical-node key；同一 revision 只允许一个 header，不能由调用方换 invocation key 重新开启。
- `LogicalNodeDispatchSlot`：附属于 header 的不可回收派发槽位；首版固定 `maxDispatches=1`，不含 prompt、调用方传入次数或可伪造的模型名。
- `ContextBudgetPlan`：本次系统指令、授权、schema、工具、记忆、RAG、最近 turn 和输出预留的 token 计划；失败不生成 attempt。
- `OperationResultProjection`：`applied | unscored | review_required | text_fallback | unavailable | voided_privacy_fenced`。

## UC-MODEL-ROUTE-01 · 受控操作在派发前被选择、预算并准入

- **角色 Actor：** 候选人或招聘方、API/Worker、模型路由器、费用账本、模型供应商。
- **前置 Precondition：** 调用方只持有已批准 `operationId` 和类型化业务对象引用；registry 有版本化主/备用候选、输入输出/媒体上限、价格版本、计量和降级语义；调用对象的 tenant/project、purpose、consent 与 privacy epoch 有效。
- **触发 Trigger：** 图节点、OCR 作业、语音请求、embedding 构建/查询或异步记忆候选请求能力。
- **主流程 Main：**
  1. 路由器从 registry 解析 binding，服务端重算输入 digest；未知字段、raw prompt、供应商 URL 或未登记 operation 立即拒绝。
  2. 预算器计入不可删系统区、授权封套、schema、工具、RAG、冻结 snapshot、最近完整 turn、图片 reserve 与 `maxOutput`；在 durable claim、费用预留和网络派发之前输出可执行 `ContextBudgetPlan`。无权威 tokenizer 时只能使用版本化保守估算，返回 usage 仅作校准，不能替代前置拒绝。
  3. 服务端重算 `logicalNodeKeyDigest` 与 canonical invocation key；同一业务 revision 的 `LogicalNodeAttemptHeader` 只能创建或读取一次。任何 accepted pre-dispatch 失败都以该 header 的既有 invocation 终结为 `failed + deterministic error_code` 并投影为 `known_not_sent`；不允许调用方换 key 重开，若业务要再试必须创建显式新 revision。
  4. 首版每个模型逻辑节点固定只有一个派发槽位。槽位、`ModelAttempt=dispatching` 与费用预留必须在同一短事务中原子提交；claim、预算、授权或容量任一失败均不占槽；提交后槽位永不释放。数据库必须实施**完整状态机**：优先撤销 runtime role 对 invocation 表的直接 `INSERT/UPDATE/DELETE`，仅开放审计过的 claim/dispatch/terminalize 过程；如保留写权，`BEFORE INSERT OR UPDATE` 围栏必须只允许受控 `claimed` 创建、冻结 owner/key/node/request/service/cost identity、拒绝 `claimed → succeeded|unknown`，并对每一条新建或保留的 `dispatching` 行强制匹配 header、slot 及（存在 cost scope 时）reservation；任何未来删除都必须是独立、受审计的隐私过程，不得授表级 `DELETE`。不得只覆盖 `claimed → dispatching` 的一种 `UPDATE`。
  5. 在同一授权/隐私检查下，按账号、区域、模型/recipe、tenant/project、operation 获取共享容量与费用准入；只有已原子取得槽位的调用才允许网络派发。header 必须冻结 provider、model、region、price revision 与预算边界，reservation 必须精确匹配这些冻结字段，不能仅按 owner/scope/idempotency key 关联。
  6. 未派发主候选已知不可用时，只能选择同能力契约、同数据级别与区域的一个备用，写明选择原因；一旦任何候选已进入 `dispatching`，不能换模型、换 key 或新增 repair 调用。
- **备选流 Alternate：** embedding 查询命中有效缓存时不调用供应商；确定性节点、模板题、关键词/FTS/RRF、记忆元标签筛选不创建 `ModelAttempt`。
- **异常流 Exception：**
  - **E1 重复：** 同 logical request key + input digest 只返回既有 admission/attempt；同一个逻辑节点的 critique、判重补题、quote repair、resume 和调用方伪造的不同 idempotency key 也只能读取既有 header/槽位/结果，供应商调用增量为 0。机制：服务端 canonical key、唯一 header 与原子 dispatch slot。
  - **E2 并发：** 并发请求竞争同一共享容量或费用范围，仅获得许可者可派发；其余拒绝或排队，不因 default/fast 客户端分裂扩大额度。机制：持久/共享 CAS 准入。
  - **E3 越权：** 伪造 operation、owner、tenant、project、purpose、price revision 或工件引用均无法取得 binding，供应商调用为 0。机制：RLS、授权快照与服务端 digest 重算。
  - **E4 失败回滚/退款：** 未派发的预算/容量/创建 attempt 失败不产生外呼、费用确认或槽位，并以 `failed + deterministic pre-dispatch error_code` 投影为 `known_not_sent`；已派发后的错误按 `unknown` 冻结，槽位不释放为“未花费”。机制：`UC-MODEL-001` 状态机、费用账本、header 与原子 slot。
  - **E5 降级：** 预算不足、未配置兼容模型、registry 禁用、输出无效或槽位已用尽时，执行该 operation 的确定性业务降级。首版不得通过 critique、repair 或新 key 再发一次。机制：registry `fallbackAction` 与业务投影状态。
  - **E6 超时/断线：** 派发前取消为 `failed + pre_dispatch_cancelled`，业务投影为 `known_not_sent`；派发后为 `unknown`，不得同键重发。机制：AbortSignal、持久 attempt 状态机。
- **后置 Postcondition：** 每次可外发操作有可审计 binding、预算和 attempt；确定性操作没有供应商调用账本；实际请求模型与 registry/价格版本一致。
- **验收 Acceptance：** 输入或输出超限、模型/价格错配、未登记 operation、越权对象均零外呼；并发总量不超共享许可；请求体含显式输出上限。有效 20 并发正例中同一逻辑节点的 header、slot、`dispatching` attempt、费用预留和供应商 sink 均**恰为 1**；每个拒绝/越权/无 slot 反例中 slot、费用预留和网络外呼均为 **0**。
- **关联：** `UC-MODEL-001`、`ModelOperationBinding`、`ContextBudgetPlan`、CAS/幂等键/RLS/账本。
- **七类覆盖：** 正常、异常、特殊（embedding cache/模板）、逃逸通道（备用和降级）、高并发、复杂（预算+费用+授权）、刁钻（派发边界取消）均覆盖。

### 测试用例

- `TC-MODEL-ROUTE-01-main` · 集成：文本、视觉、语音、embedding 各从 binding 到受控 transport，实际模型/价格/输出上限精确一致。
- `TC-MODEL-ROUTE-01-E1` · PostgreSQL + transport：有效同 binding 20 并发，以及 critique、判重补题、quote repair、resume 与伪造 invocation key 的逃逸组合，header、slot、`dispatching` attempt、费用预留与供应商 sink 调用均恰为 1；20 个不同 invocation key 竞争同一 node 时，失败者均为确定性业务错误而非唯一键/500；每个预算/容量/授权/配额拒绝子例的 slot、费用预留与 sink 均为 0。
- `TC-MODEL-ROUTE-01-E2` · 集成：default/fast/API voice/OCR 并发共享一个账号容量，合计不超过限制。
- `TC-MODEL-ROUTE-01-E3` · PostgreSQL + transport：伪造 owner/tenant/project/purpose/operation/object 皆被拒绝，外呼=0；以真实低权 runtime login 直接 `INSERT dispatching`、`claimed → succeeded|unknown`、派发后篡改 request/service/cost/idempotency、以及有 slot 但 reservation 不匹配均被数据库拒绝，所有 ledger/sink 增量为 0。
- `TC-MODEL-ROUTE-01-E4` · 故障注入：费用或 attempt 写入失败、派发后终态失败分别落为零外呼或 unknown/frozen。
- `TC-MODEL-ROUTE-01-E5` · graph/API：每种注册 fallback 产生正确的模板题、`unscored`、文字模式或无 RAG，不伪造成功。
- `TC-MODEL-ROUTE-01-E6` · transport：派发前/后 abort 边界分别为 known-not-sent/unknown，后者重放外呼=0。

## UC-MODEL-ROUTE-02 · 节点按能力档运行而非默认模型二分

- **角色 Actor：** 面试图、报告/诊断/OCR/语音作业、记忆 summarizer、运营人员。
- **前置 Precondition：** `ModelOperationBinding` 已定义能力档、可替换性和业务 fallback；高影响评分和长期记忆有额外确认/复核规则。
- **触发 Trigger：** 业务编排器要执行一个图节点或异步模型任务。
- **主流程 Main：**
  1. 确定性节点执行状态机、授权、元标签、冲突/过期、关键词/向量候选筛选和结果聚合，不请求模型。
  2. 轻量分类、能力规划、候选摘要使用小模型；普通出题、报告、诊断使用质量档；评分仅在低置信或高风险时升级。首版派发槽覆盖的当前文本 `invoke()` 调用面必须逐一登记：能力规划、常规出题、回答评分（含 quote repair）、押题/quiz、简历诊断、报告；未登记的新文本调用不得宣称受本项配额保护。调用方不得自由提供模型、service 或 logical-node identity；operation resolver 以冻结 binding、授权对象和业务 revision 重算它们。
  3. OCR、ASR/TTS、embedding 和 rerank 使用对应专用能力，不能被文本模型或跨 recipe 模型替换。
  4. 记忆模型结果只写 `candidate`，仍由确定性来源/授权/冲突/时效/确认门决定是否 active。
- **备选流 Alternate：** 首个 grounded 题、模板题、文本展示、无 RAG、用户文字输入和人工复核均可不调用模型完成业务。
- **异常流 Exception：**
  - **E1 重复：** 同一出题或评分节点的 graph resume 复用既有 attempt/result；首版 binding 的 `maxDispatches=1`，图内 critique/补题/quote repair 不得建立第二个供应商调用。机制：graph fence + 服务端 node digest + 原子 dispatch slot。
  - **E2 并发：** 多 worker 对同一节点或记忆范围仅一个 attempt 可投影；其他读取既有结果。机制：lease/CAS。
  - **E3 越权：** 不同 tenant、C/B、project 或 purpose 的模型/记忆操作无法共用上下文、预算或来源。机制：RLS + binding predicate。
  - **E4 失败回滚/退款：** 报告、诊断、OCR、语音等已派发失败不伪造完成；按各自领域规则退款/冻结/人工处理。机制：attempt + 领域状态机。
  - **E5 降级：** 出题→批准模板或 `generation_unavailable`、评分→unscored/review_required、ASR→文字输入、TTS→文字展示、embedding→无 RAG、记忆→不写候选。无效输出或配额耗尽不触发 repair 外呼。机制：能力矩阵。
  - **E6 超时/断线：** 流式首帧前允许未派发降级，首帧/派发后 unknown；用户取消不得误计为供应商成功或自动换模型。机制：stream session/attempt 状态机。
- **后置 Postcondition：** 每个业务结果带 operation/attempt 或明确 `deterministic` 来源；模型结果不越过其能力和质量边界。
- **验收 Acceptance：** 确定性节点调用模型数=0；首版每个模型逻辑节点的调用数至多为 1；评分、OCR、语音、embedding 的降级语义分别可测；模型候选不能直接成为 active 长期事实。
- **关联：** 自适应图、记忆治理、`UC-MODEL-001`、CAS/幂等/RLS/事件账本。
- **七类覆盖：** 正常、异常、特殊（模板/缓存）、逃逸通道、并发、跨能力编排和流式取消均覆盖。

### 测试用例

- `TC-MODEL-ROUTE-02-main` · graph：节点矩阵的真实 binding/模型数/领域投影符合登记。
- `TC-MODEL-ROUTE-02-E1` · graph + PostgreSQL：上述六类当前文本调用分别证明 critic/retry/重放、dedup 与 quote repair 不能超过一个节点槽位；以正常 runtime role 执行 legacy `claimed → dispatching`、direct `INSERT dispatching`、非法 terminal transition 与 identity mutation，均在数据库层拒绝；所有拒绝路径的 slot/reservation/sink=0。
- `TC-MODEL-ROUTE-02-E2` · 集成：双 worker 对同一 question、report、summary 范围仅一条可投影。
- `TC-MODEL-ROUTE-02-E3` · 集成：跨 C/B/tenant/project/purpose 的上下文、费用和来源均为 0。
- `TC-MODEL-ROUTE-02-E4` · 集成：已派发失败不写 score/report/OCR/active fact，费用/权益终态可审计。
- `TC-MODEL-ROUTE-02-E5` · graph/API：六类降级不含伪造结果且对用户可解释。
- `TC-MODEL-ROUTE-02-E6` · 流式 component + 真 HTTP：不同取消边界不重发、不污染计量/状态。

## UC-MODEL-ROUTE-03 · 运营人员用非生产百炼工作空间进行有界验证

> **执行清单：** 工作空间、价格 revision、预算/告警、Key、endpoint、最小 smoke、能力扩展与轮换依次由 `architecture/ai/bailian-nonproduction-rollout.md` 的 `BAILIAN-00…07` 记录。它们与 `MODEL-OP-00…04` 分开勾选，不能以控制台配置绕过运行时整改。

- **角色 Actor：** 平台运营、开发/测试人员、模型供应商、成本/安全管理员。
- **前置 Precondition：** 已在独立非生产工作空间开通按量模型与消费提醒；Key 不进入仓库、日志、回执或聊天；文本主端点、文本备用端点和 DashScope 原生能力凭据按最小用途分别注入；只有通过 MODEL-OP-00/01 的受控小范围 smoke 可使用它。
- **触发 Trigger：** 运营人员要验证一个已登记 operation 的真实模型兼容性、质量或计量。
- **主流程 Main：**
  1. 运营人员在供应商控制台创建隔离工作空间，并在业务空间层限定模型范围和可信服务器出口；先配置消费提醒/额度边界。标准 API Key 的权限继承该业务空间，不能被当作 per-operation allowlist。文本主端点（例如 DeepSeek）只供 Worker 的 `MODEL_*` 路由；Qwen 文本备用端点只供 Worker 的 `MODEL_BACKUP_*` 路由；ASR、TTS、embedding、rerank 等 DashScope 原生适配器只从 `DASHSCOPE_*` 读取凭据，不能退回读取文本主 Key。任何 endpoint 必须从版本化 allowlist registry 解析（HTTPS/WSS、固定 region/host/path、无 userinfo/query/fragment）；生产构造器不得接受 key 或 endpoint override。
  2. 测试环境以 secret 注入该 Key；运行固定、非敏感、极小输入的单 operation smoke，记录 operation、模型/区域、输入输出长度、provider request locator（若提供）与费用类别的脱敏摘要。
  3. 不合 schema、超预算、跨区域、未经登记或不符合删除/隐私条件的 operation 不发请求。
  4. 结果仅标记为该 operation 的非生产验证；它不证明网关隔离、生产容量、真实用户数据处理或发布质量。
- **备选流 Alternate：** 没有 Key 或额度时只运行 fake/controlled transport 契约；保持 `not_run`，不以 mock 代替真实供应商验证。
- **异常流 Exception：**
  - **E1 重复：** 同测试 run ID/read-only receipt 重放不再次外呼。机制：测试 run 幂等键。
  - **E2 并发：** 测试 runner 受低并发和总费用上限约束；并发超限被拒绝。机制：共享准入。
  - **E3 越权：** Key 不授本地任意脚本、浏览器、公开 API 或常驻 API/Worker；错误工作空间/区域/模型拒绝。把 DeepSeek 文本 Key 注入到进程也不能让 DashScope 原生适配器认证，反之亦然。机制：业务空间模型许可、secret scope、显式 provider 变量、registry 和启动校验。
  - **E4 失败回滚/退款：** 网络或供应商失败记录 unknown/failed 与已知计量，禁止自动换 Key/模型重试。机制：attempt 状态机。
  - **E5 降级：** Key 缺失/额度耗尽时测试为 `not_run`，产品路径使用确定性降级。机制：环境 gate。
  - **E6 超时/断线：** 外发前取消零调用；外发后 unknown，非敏感测试 run 需新 revision 才可重试。机制：attempt 状态机。
- **后置 Postcondition：** 仅有最小脱敏验证回执；不会新增真实用户内容、生产 Key 或“已发布”声明。
- **验收 Acceptance：** Key 从未出现在工作树/日志；每次 smoke 费用和调用数有上限；未登记操作/越权输入=0 外呼；文本主/备用路由与 DashScope 原生适配器各自只使用允许的变量；非生产 OCR、语音和视觉 smoke 在对应 typed binding 前也必须零外呼；真实模型结果通过结构校验才生成 `nonproduction_verified` 回执。
- **关联：** `UC-MODEL-001/002`、operation registry、secret 管理、成本与隐私规则。
- **七类覆盖：** 正常、异常、特殊（无 Key）、逃逸通道（fake）、并发、密钥/工作空间隔离、断线 unknown 均覆盖。

### 测试用例

- `TC-MODEL-ROUTE-03-main` · 手动/受控云：非敏感单 operation 得到脱敏非生产回执，未超过单 run 上限。
- `TC-MODEL-ROUTE-03-E1` · 集成：相同 test run 重放外呼=0。
- `TC-MODEL-ROUTE-03-E2` · 集成：超出并发/总成本上限被拒绝。
- `TC-MODEL-ROUTE-03-E3` · secret/启动测试：浏览器、公开 API、错误工作空间和未登记模型无法取得或使用 Key；DeepSeek 文本 Key 与 DashScope 原生 Key 不能跨路由复用。
- `TC-MODEL-ROUTE-03-E4` · 受控 transport：错误/响应丢失保留 unknown，不自动换模型或 Key。
- `TC-MODEL-ROUTE-03-E5` · 环境测试：缺 Key/额度时只标 not-run，业务无付费外呼。
- `TC-MODEL-ROUTE-03-E6` · transport：超时边界产生正确 known-not-sent/unknown 与一次性计量。

## 实现门禁结论

**规格门仍存在 P0，`MODEL-OP-00` 不得关闭。** 文本子路径会将批准且不可变的 `maxOutputTokens` 下传为供应商 `max_tokens`、拒绝请求模型与策略模型错配，并在 claim/预留/HTTP 之前对已渲染文本、结构化输出 reserve 与图片 reserve 执行有版本的保守窗口预算。文本费用的 price revision 已与数据库价格行精确绑定。`0088` 是待验证候选：它撤销 invocation 直写、改由固定受控过程和私有 permit trigger 执法，并把 header 改为 deterministic upsert；但当前没有真实低权 PostgreSQL 组合根回执，不能说 direct `INSERT dispatching`、非法 terminal、identity tamper 或并发已被关闭。

必须先验证并独立复审：`MODEL-OP-00-DB-STATE-001`（受控 DB 状态机/直写撤权及低权 SQL 负测）、`MODEL-OP-00-HEADER-001`（不同 key 并发 deterministic upsert）和 `MODEL-OP-00-BINDING-001`（header 与 reservation 的 provider/model/region/price revision 精确绑定）。`MODEL-OP-01` 还被 typed registry、服务端 node identity、endpoint allowlist、operation-level secret isolation、OCR/voice/embed/rerank attempt/unknown 语义、共享准入和唯一网关阻断。任何真实百炼调用仍只允许在这些 P0 以外的、显式批准的非生产 text-only 非敏感 smoke；不得把一个标准 API Key、local proof 或环境变量路由当作统一模型治理或发布证据。
