---
id: architecture_model_operation_routing
name: 模型操作路由、预算与降级架构
description: 将每一次供应商调用按业务操作、能力、数据级别、预算和失败语义治理；记录当前接线边界与目标态，不能以此文替代实际网关或发布证据。
type: architecture
scope: shared
level: must
status: target_with_current_boundary
owner: architecture
related:
  - ../../requirements/use-cases/model-operation-routing.md
  - ../../requirements/use-cases/model-invocation-reliability.md
  - ../../delivery/production-readiness-remediation-register.md
  - ./memory-context-design.md
---

# 模型操作路由、预算与降级架构

## 1. 当前事实与禁止夸大

当前自适应面试图不是“每个节点都调用模型”。`plan`、`decide`、`awaitAnswer`、`conclude` 是确定性状态机；首个 grounded 题由模板给出；空答、跳过和明显套话不进入模型评分。常规出题、正常作答评分、能力规划、报告、押题和诊断才会调用文本模型。记忆当前只做确定性题面判重和弱项投影，并没有长期摘要或语义召回写入。

但当前调用并未按下面的登记册统一执行。文本子路径已有受管局部实现：不可变成本策略会把 `maxOutputTokens` 下传为供应商 `max_tokens`，并在 claim、费用预留和 HTTP 前，以版本化保守估算拒绝超出已渲染 system/user、结构化输出 reserve 和图片 reserve 的请求；它不等同于全操作预算器或供应商 tokenizer。其余缺口如下：
- ASR、TTS、embedding 等仍可由 API 或 Worker 的组合根直接构造适配器，未共享同一成本、熔断、路由与调用账本。OCR 已有 `resume.ocr.v1` 身份封印 + 密封 provenance，但出站仍由注入 `ModelClient` 决定，生产组合根在 `OCR_ENABLED=1` 时拒绝装配。
- 当前 catalog 是未接入 `invoke()` 主链的骨架；真实选择主要依赖环境变量和调用方手工传入的 client。
- 默认模型与快模型各自建立进程内限流器；它们不是同一个账号、区域、模型维度的全局容量上限。

因此本文件是**目标契约和整改顺序**。在 operation registry、共享准入和网关完成前，不能声称已经具备统一模型路由、统一 Key 隔离、跨副本限流或真实成本上限。

## 2. 设计原则

1. **先确定性，后模型。** 授权、租户/项目边界、状态机、规则判断、记忆准入与冲突、过期、关键词检索、RRF、来源水合、账本、选择和预算都不得交给 LLM 决定。
2. **一项业务能力只允许一个显式操作标识。** 调用方不能传“任意模型名 + 任意 prompt”。所有供应商调用都从受版本控制的 `operationId` 解析能力、输入模式、数据分级、区域、模型候选、预算、计量与失败语义。
3. **把质量、成本和隐私一起选路。** 不能仅按“快/慢”二分；评分、视觉、嵌入和语音的正确性、可替换性、计量单位都不同。
4. **已派发不换模型。** 派发前才允许在同一能力契约内选健康备用；派发后超时、断线或回包丢失均为 `unknown`，不得自动重发到另一模型。
5. **一个逻辑节点一枚不可回收派发槽。** 首版每个模型逻辑节点固定 `maxDispatches=1`；服务端从稳定业务范围、节点类型、冻结 binding/version 与业务 revision 重算节点 digest 和 canonical invocation key。同一 revision 的 `LogicalNodeAttemptHeader` 只可创建一次：未派发终态是 `failed + deterministic pre-dispatch error_code`，业务投影才叫 `known_not_sent`；不得靠换 key 把同一节点重开。
6. **完整状态机必须由数据库而非应用版本执法。** 槽位、`dispatching` attempt 和费用预留必须同一短事务提交；任一前置检查失败均不占槽，已派发的 `unknown` 也不释放槽位。优先撤销 runtime role 对 invocation 表的直写，仅开放完成同一原子事务的受控 claim/dispatch/terminalize 过程；如保留直写，`BEFORE INSERT OR UPDATE` 围栏必须只允许受控 `claimed` 创建、冻结身份字段、拒绝非法 terminal transition，并验证每一条 `dispatching` 行有匹配 header/slot 及（存在 cost scope 时）reservation。只保护 `claimed → dispatching` 的 `BEFORE UPDATE` 不是状态机围栏。
7. **不能用“修复调用”绕过节点边界。** critique、判重补题、quote repair、resume、换 idempotency key、备用模型或旧 worker 都不能建立第二个派发。需要第二次外呼时，必须建新 operation 与显式业务 revision，并重新经过用例、成本和失败语义审查。
8. **降级必须保留业务含义。** 评分降为 `unscored/review_required`，TTS 降为文字展示，ASR 降为文字输入，RAG 降为无检索的受限题面；不得用另一个模型伪造“成功”。
9. **每次输入都先经预算器。** 总预算包含系统指令、授权/安全封套、结构化输出模式、工具、RAG、记忆 snapshot、最近 turn 与输出预留；不能只截断用户正文。

## 3. 节点与能力矩阵

| 业务操作 / 节点 | 默认实现 | 是否允许模型 | 目标能力档与数量上限 | 派发前备用 | 派发后 / 预算不足的业务结果 |
| --- | --- | --- | --- | --- | --- |
| 图状态转移、重试、幂等、权限、费用、记忆准入/冲突/过期、元标签筛选、BM25/FTS、RRF、来源水合 | 确定性函数/数据库 | 否 | 无 | 不适用 | 拒绝、等待或确定性状态；不以 LLM 猜测补洞。 |
| 能力规划、意图分类、候选摘要草稿 | 小文本模型；允许规则优先 | 是 | 小模型；每个逻辑节点至多一次 | 未派发时，同区域、同模式的小模型 | 使用保守默认计划、延迟草稿或不写入。 |
| 常规出题、押题、诊断、报告叙事 | 中等质量文本模型 | 是 | 中等模型；首版每个逻辑节点固定一次派发，不能由图内循环、repair 或换 key 扩大 | 仅未派发时同 schema/区域/数据级别的模型 | 题目用已批准模板；报告标示不可用；诊断任务失败并按业务规则退款。 |
| 回答评分 | 小模型优先；低置信、冲突或高风险招聘用途才进入质量档 | 是 | 小/中模型与独立评分 schema | 仅未派发时同评分契约的模型 | `unscored` 或 `review_required`；绝不填写默认数值。 |
| OCR | 视觉专用模型，异步作业 | 是 | 视觉模型；页面、像素、图像数与费用单位上限 | 仅未派发时兼容视觉模型 | 保留文件/文字输入路径；不把未识别内容当简历事实。 |
| embedding build/query | 专用 embedding 模型 | 是，但不是聊天 LLM | 固定 recipe/model/dimension；查询有缓存，构建按 generation | 只允许与同一已发布 recipe 兼容的热备 | 无 RAG；不得跨向量空间混接。 |
| rerank | 默认禁用，只有生产评测与 registry 通过后才启用 | 是 | 专用 rerank 模型；候选数、文档字符和预算上限 | 仅未派发时 | 维持已授权的原检索排序；不得把未知结果换模型重排。 |
| ASR / streaming ASR | 专用语音模型 | 是 | 音频秒数、帧数、并发和会话时长上限 | 仅首帧前同协议备用 | 文字输入；已发送流标 `unknown` 或供应商已确认的取消。 |
| TTS / streaming TTS | 专用语音模型 | 是 | 字符/秒数、并发、下载字节和总时限上限 | 仅首字节前同协议备用 | 文字展示；用户取消立即中止，不把远端中断误记为用户取消。 |
| 长期记忆候选摘要或事实抽取 | 异步小模型，且只处理完整、仍授权的来源范围 | 是 | 小模型；每个来源范围至多一次 attempt | 仅未派发时 | 不生成派生物；不得影响当前面试、授权、评分或删除。 |

### 3.1 记忆相关的额外约束

模型只能产出 `candidate` 摘要或事实。范围、用途、同意、来源 span/hash、保留期、冲突、确认、过期、撤回、两阶段检索、水合与派发前重验均是确定性门。语义检索分数、模型置信度和来源可信度是三条独立信号；任一模型输出都不能绕开它们成为 active 事实。

## 4. operation registry（目标对象）

每一个 `operationId` 至少冻结以下字段，并由唯一调用关口解析：

| 类别 | 必填字段wo |
| --- | --- |
| 身份与版本 | `operationId`、schema/prompt/renderer/policy 版本、owner、启停状态、允许的调用者类别。 |
| 输入边界 | 类型化对象/工件引用与 digest、允许的标量、输入 token/图片页数/音频秒数/候选数/下载字节上限；拒绝 raw prompt、供应商 URL 和未知字段。 |
| 数据与授权 | data class、region、subject/tenant/project/purpose、consent/grant 与 privacy epoch 谓词；未通过则供应商调用数为 0。 |
| 模型选择 | 能力类别、主模型、兼容备用、固定 recipe/dimension、供应商端点策略；模型名必须与实际请求和价格版本一致。 |
| 成本与容量 | meter type、价格版本、成本/权益 scope、输入/输出上限、共享账号/区域/模型/租户/项目/operation 准入键、并发/RPM/日或月预算。 |
| 可靠性 | 服务端重算的逻辑节点 digest 与 canonical invocation key、固定 `maxDispatches=1`、不可回收 slot、派发前/后状态机、circuit、超时、unknown 对账、允许的业务降级、结果投影目标。未派发语义以 `failed + deterministic pre-dispatch error_code` 表示；slot 必须与 `dispatching` attempt 和费用预留同一事务。数据库 `BEFORE UPDATE` 围栏或撤销直写后的受控过程必须拒绝没有有效 slot、或有 cost scope 却没有 matching reservation 的旧/新 worker。 |
| 审计与删除 | attempt、输入/派发/输出摘要、供应商定位器（若有）、payload key、删除 target、保留期和最小可公开观测字段。 |

`operationId` 不是给业务方自由扩展的字符串。新增操作必须先增加用例、registry、输入 schema、计量和七类测试；未登记的 provider client/URL、模型 selector 或签名下载都应在生产启动前失败。

## 5. 预算、准入和故障语义

### 5.1 预算

预算器在 provider dispatch 前计算：

`inputBudget = contextWindow - maxOutput - toolReserve - safetyMargin`

再以供应商/模型的 tokenizer 计算不可删系统区、授权封套、输出 schema、工具、已验证记忆 snapshot、RAG 和最近完整 turn。无权威 tokenizer 时使用保守估算并记录误差；若不能满足预算，按 registry 的确定性策略缩短、选择已验证摘要、分段或拒绝。请求必须显式传供应商支持的输出上限；返回 usage 仅用于校准，不能代替派发前限制。

**当前局部实现（MODEL-OP-00-CONTEXT-001、MODEL-OP-00-PRICE-001）：** 已批准成本策略的 OpenAI-compatible 文本客户端会在 `prepare` 阶段，以 `utf8-bytes-v1` 对实际渲染的 system、数据围栏、user 内容、图片 descriptor、图片预留和结构化输出 reserve 作保守预算。缺少窗口/估算版本/安全余量、图片无显式 reserve，或超过 `maxInputTokens` / `contextWindow - maxOutput - toolReserve - safetyMargin` 时，在 durable claim、费用预留和 HTTP 请求前拒绝。受管文本策略还冻结 `provider/model/region/priceRevision`、输入/输出上限和当前上下文策略身份；请求摘要、启动时的低权价格行断言及费用 reserve 都使用同一 price revision，不能在派发时选择“当前最新”价格。它不把字节估算称为供应商 tokenizer；`planContextBudget`/`ContextBudgetPlan` 已把渲染输入按组件分账（system/数据围栏/schema reserve/tool reserve/RAG 独立分账，`toolReserve` 计入 `availableInput = contextWindow − maxOutput − toolReserve − safetyMargin`）。snapshot·recent·summary 属 L5 未接线，仍只要进入渲染字段即被总量覆盖。返回 usage 仍仅用于后续校准。

该局部实现不覆盖 ASR/TTS、embedding、rerank、流式和未带受管策略的遗留调用。`resume.ocr.v1` 已有 typed binding + 密封 provenance 缝（`bindResumeOcr` / `admitInterviewResume`）；封印记录的是冻结 identity，**不钉死出站 host**。production/enforce 仍在 transport 前拒绝未带受管策略的 OpenAI-compatible client，且 API OCR 在**所有环境**只能以 `OCR_ENABLED=0`（或未设）启动，设为 `1` 即在组合根拒绝（binding 存在也不开）。此止血加合同缝不等于生产视觉已启用：媒体预算、删除、脱敏视觉回执与真实验证仍开放。本项仍不完成逻辑节点派发配额与真实 tokenizer 校准（estimate 穿线 + 纯版本化校准模块 + 低估 flag 已建，但异步 reconciler 未接线、校验失败调用不落 estimate 证据，见 checklist 已知缺口）。因此 `MODEL-OP-00` 仍为部分实现，不能作为统一模型治理或发布证据。

### 5.2 准入

限流和费用预留的分区至少为 `providerAccount + region + modelOrRecipe + tenant/project + operation`。默认模型、快模型、OCR、ASR/TTS、embedding 和 rerank 不得各自悄悄创建独立的“总上限”。进程内舱壁可作为第一层，但只有共享、持久化或网关准入才能叫作跨副本总预算。

### 5.3 失败和替换

| 时点 | 允许动作 | 禁止动作 |
| --- | --- | --- |
| 认证、schema、预算、授权、容量失败 | 不派发；确定性拒绝或业务降级 | 用默认模型偷偷补发。 |
| 主端已知不健康、但尚未派发 | 选 registry 明确兼容的一个备用，并写新的预派发选择记录 | 跨区域、跨数据级别、跨 embedding recipe 替换。 |
| 已写 `dispatching` 后超时/5xx/断线/响应丢失 | 写 `unknown`，冻结费用，等待对账或用户/业务新 revision | 同键自动重发、切到 backup、把未知写成功。 |
| 模型返回不合 schema/业务校验 | `failed`，不投影领域结果 | 用原始文字或另一个模型自动补齐。 |

### 5.4 逻辑节点派发槽（`MODEL-OP-00-NODE-QUOTA-001`，局部实现）

迁移 `0085_ai_model_logical_node_dispatch_slot.sql` 只围住既有 `claimed → dispatching` 更新，**它本身不是完整状态机**。工作树候选迁移 `0088_ai_model_invocation_controlled_state_machine.sql` 随后撤销 `app_role` 对 invocation 的 `INSERT/UPDATE/DELETE`，以固定的 principal-scoped `claim/dispatch/fail-claim/terminalize/reconcile` 过程写入私有一次性 permit，再由 `BEFORE INSERT OR UPDATE` trigger 消费 permit 并复验身份、slot 和 reservation。它同时将 header 的不同 key 冲突改成 deterministic upsert。该候选尚未取得真实低权 PostgreSQL 回执，不能把源码存在写成 P0 已关闭或发布证据；header 与 reservation 的 provider/model/region/price revision 精确绑定仍未实现。

因此历史 `pnpm model-invocation-reconcile:prove` 的 raw-SQL 回归仍只是一条局部、本地 `releaseEvidence=false` 证据；本机 Docker daemon 可用后，必须重跑新增的 direct ACL、ACL 漂移 permit、terminal、identity、reservation 与并发组合根。`MODEL-OP-00-DB-STATE-001`、`MODEL-OP-00-HEADER-001` 和 `MODEL-OP-00-BINDING-001` 在这些回归与独立复审前均不关闭。

六个文本调用面与 `resume.ocr.v1` 已由 registry 派生 node identity；OCR 另经 `bindResumeOcr` 封存 endpoint **identity**（profile id / admission key），出站仍由注入 client + 视觉 endpoint config 决定。尚未完成的是让 ASR、TTS、embedding、rerank 和所有遗留直连适配器都经过同一种 binding/共享准入，以及撤销 `invoke()` 对 legacy `logicalNodeKey` 的兼容入口。首版仍不允许可配置的“两三次 repair”：无效问题走批准模板或 `generation_unavailable`；评分证据不合格走 `unscored/review_required`。若以后确需第二次供应商调用，它必须是新的 operation 与业务 revision，不能作为本节点 retry。

## 6. 实施顺序与当前阻塞

1. **MODEL-OP-00：止血。** 先以完整数据库状态机消除 invocation 直写绕过，再将总上下文/输出上限真实下传，启动时断言实际模型、价格版本与成本策略一致；以原子 upsert 的 canonical header、固定单 slot、冻结 reservation binding 和数据库围栏把每个逻辑节点的派发上限、attempt 与费用预留原子化。
2. **MODEL-OP-01：统一入口。** OCR 窄切片已落地：`resume.ocr.v1` typed binding、密封 provenance（身份封印，非 host pin）、面试 fail-closed 授权门；生产 `OCR_ENABLED` 仍关。ASR、TTS、embedding 与其余直连适配器仍待同一 binding/账本/未知语义。此步骤不声称已经实现唯一网关出口。
3. **MODEL-OP-02：共享准入与观察。** 将所有能力接入按账号/区域/模型/租户/项目/操作的共享容量与费用视图，并暴露不含正文的观测。
4. **MODEL-OP-03：registry 取代手工环境路由。** `invoke()` 和所有直接适配器只能解析已批准的 registry binding；rerank 保持禁用直至真实生产路径评测通过。
5. **MODEL-OP-04：模型网关。** 仅在 `UC-MODEL-002` 的 outbox、授权快照、删除、流会话和网络隔离契约全部落地后，将供应商 Key 收敛为唯一网关持有者。

在 MODEL-OP-00 至 03 通过前，任何单一百炼 Key 只能用在隔离的非生产工作空间与小额度 smoke；不得把它当作生产网关密钥，也不得把 Key 写入仓库、日志、测试回执或聊天消息。

## 7. 验收指标

- 未登记操作的 provider 请求数为 0；实际请求模型、模型版本与价格版本逐条一致。
- 每种 operation 的 input/output/media 上限均在发送前拒绝；预算超窗次数为 0。
- 同一逻辑节点的已派发供应商调用数最多为 1；unknown 的自动重发数为 0。
- 默认/快/OCR/语音/embedding 的并发合计不超过共享准入许可；拒绝、熔断、unknown、降级与费用冻结可按 operation 观测。
- 评分降级不新增 score；记忆抽取失败不新增 active fact；撤回/删除后新派发和新召回均为 0。
- 生产等价验证必须使用受控 provider sink 或真实非敏感百炼工作空间回执；mock 只证明状态机，不证明实际计费、模型能力或云端网络隔离。
