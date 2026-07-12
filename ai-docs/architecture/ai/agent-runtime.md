---
id: architecture_ai_agent_runtime
name: Agent 运行时引擎（ai-runtime harness）
description: 所有图节点调用模型时穿过的唯一关口——上下文管理、模型路由、工具调用修复、双重校验、重试与降级、流式与终止、记忆快照。把"内存 session + 无状态机 + 裸 JSON.parse"逐项替换成可执行机制。
type: reference
scope: shared
level: spec
status: active
owner: architecture
version: 1
tags:
  - ai
  - agent-runtime
  - reliability
related:
  - ./langgraph-blueprint.md
  - ../../rules/ai/structured-output-and-safety.md
  - ../../rules/global/status-machine.md
---

# Agent 运行时引擎（ai-runtime harness）

> `langgraph-blueprint.md` 定义**图的拓扑**（4 个图、节点、checkpointer）。本文定义**图节点调用模型时穿过的那道唯一关口**——即每个节点里 `await runtime.invoke(...)` 背后发生的一切。两者职责互补：图管"走到哪一步"，运行时管"每一步怎么稳地调一次模型"。

## 1. 为什么需要一个独立的运行时关口

控制器和图节点**永远不直接调用模型 SDK**，只调用 `ai-runtime`。理由是单一收口点：校验、脱敏、重试、成本、路由、追踪、降级——这些横切关注点只有收敛到一个地方才能被强制，散落在每个节点里必然漂移。

这一层的设计目标是把本项目源头的三个病根，**逐项替换成可执行机制**（不是写一条"应该注意"的原则）：

| 源头病根（反面教材） | 暴露的故障 | 本运行时的强制机制 | 见 |
| --- | --- | --- | --- |
| 内存 `Map` 存会话 | 进程重启 / 多实例即丢会话；无法恢复 | 状态进 Postgres checkpointer；等待用户=持久 `waiting_user`，绝不靠内存连接 | §3 §9 |
| 状态靠布尔位拼凑 | 非法状态、并发覆盖、无法审计 | 显式 status 枚举 + version 乐观锁 + CAS 写 + 服务端再校验 | §7 |
| `JSON.parse(model_output)` 裸解析 | 模型多吐一句话/少个括号即崩；幻觉直接进库 | coerce → schema 校验 → 业务校验（双校验），失败走重试/降级/可解释错误 | §6 |
| 上下文无限拼接 | 超窗报错、首字延迟飙升、token 账单失控 | 溢出**前**主动压缩 + 预留 token + 稳定前缀缓存 | §4 |
| 模型硬编码在调用点 | 换模型/做合规出境/降级=改一堆代码 | 模型 catalog 单一真相 + router（按节点分层 + 区域路由 + fallback 链） | §5 |
| 工具调用全凭模型自觉 | 模型吐畸形 tool call 直接失败；失控循环 | tool-call-repair 提升 + allowlist + 终止判定 + 硬上限兜底 | §8 §10 |

> **接线状态总览**（避免把目标当已完工）：✅ **已接线运行**——双校验、重试分类+指数退避、idempotencyKey、checkpointer/`waiting_user`（无内存 Map）、成本 token 落 `ai_invocation_trace`；🟡 **机制已建、默认关闭/未接线**——跨供应商 failover（需 `MODEL_BACKUP_*`）、长期记忆（§9，仅测试路径调用）；⬜ **待建**——单一真相 catalog 表 + 按节点分层 router（§5 现为 `stub:deterministic` 骨架，`invoke` 不消费）。逐节的 ✅/🟡/⬜ 标注见对应小节。

## 2. 一次 `invoke` 的生命周期（有序管线）

`runtime.invoke(nodeCtx, request)` 内部是一条固定顺序的管线。每一阶段都有明确失败出口，**没有任何一步允许"裸调用 + 乐观假设成功"**。

```text
1  build context        组装消息：冻结快照(系统) + 活状态 + 本轮输入
2  compact (if needed)  ctxTokens > window - reserve(16k) → 溢出前压缩，记 firstKeptEntryId
3  resolve model        catalog/router 选模型（节点分层 + PII 区域门 + fallback 链）
4  assemble prompt      三段式：稳定系统前缀 | 半稳定上下文 | 易变本轮 —— 利于 prompt 缓存
5  call provider        带 idempotencyKey + traceId + abort 信号；流式
6  coerce               先把类型归一（asRecord / readField），不让 null 检查掩盖契约违背
7  tool-call-repair     畸形 tool call 提升为原生（allowlist + 256KB 上限），记诊断
8  schema validate      Zod 校验输出结构
9  business validate    题数/分数区间/枚举合法/无幻觉简历事实/grounding 引用存在
10 on failure           分类：transient → 退避重试；deterministic-refusal → 不重试，降级/可解释错误
11 emit                 trace span + 成本记账 + 业务事件（非 token）入事件账本
```

阶段 6–9 的"先归一、再结构、再业务"三段分离是硬约束：**schema 通过 ≠ 业务合法**。一个 JSON 结构完全合法、但"声称候选人有他简历里没有的经历"，必须在第 9 步被业务校验器拦下（见 `structured-output-and-safety.md`）。

## 3. 状态边界：什么进 checkpoint，什么进业务表

| 数据性质 | 落点 | 原因 |
| --- | --- | --- |
| 图运行时状态（走到哪个节点、中间产物） | Postgres checkpointer | 可恢复、多实例安全 |
| 业务事实（面试结论、评分、权益扣减、订单） | 业务表（带 status 枚举 + version） | checkpoint 是运行时态，**不是事实源**；不能用它当业务真相 |
| 等待用户输入 | 持久 `waiting_user` 状态 + interrupt | 绝不靠内存连接；resume 用同一 `threadId` |
| 长期记忆 | 见 §9（快照 + 活状态分离） | 保前缀缓存 + 防并发覆盖 |

> **关键纠偏**（审计 P0-4）：checkpointer 不是"永远可靠的唯一真相"。它会有版本不兼容、会损坏。业务事实必须独立落在业务表；checkpoint 仅承载"重放到此处需要的运行时态"。checkpoint 损坏/不可迁移时，业务事实仍在，会话可安全终止并给可解释错误，**不丢数据**。

## 4. 上下文管理与主动压缩

反应式压缩（撞到超窗错误才压）会在生产暴露为间歇性 500 + 首字延迟尖刺。本运行时**溢出前**就压：

- 触发条件：`ctxTokens > contextWindow - reserve`，`reserve` 默认 16k（给输出 + 工具信封留余量）。
- token 预算**算整个 `tool_call` 信封**（工具名 + schema + 参数 + 结果），不只算 `arguments`——只算参数会低估 2–15×。
- 压缩策略：保护**头**（系统提示 + 冻结快照）+ **尾**（最近若干轮），摘要**中间**。
- 记录 `firstKeptEntryId` 作为恢复点：resume 时据此知道从哪条历史开始仍然有效。
- 落点：图调用模型前的 `transformContext` 钩子，对所有节点统一生效。
- 兜底：若仍触发 length 错误，压缩后**重试同一请求**（属 §7 transient 类）。

## 5. 模型 catalog 与 router

> **实现状态（对齐代码，勿当已完工）**：本节的 `ModelCatalogEntry` 全字段表 + region 门 + 多级 `fallbackChain` 是**目标设计**。当前代码里 `catalog/resolveBinding` 只是 `stub:deterministic` 的残留骨架（登记 2 个逻辑 key），**`invoke` 关口并不消费它**——现阶段模型由组合根按节点直接注入（生产质量 `defaultModelClient` / 快模型 `fastModelClient`）。
> - ✅ **已接线运行**：`invoke` 内瞬时错误（429/408/5xx/超时）判 transient + 指数退避重试；`failoverModel(clients)` 跨端点切换的**代码**已建并有 gate。
> - 🟡 **机制已建、默认关闭**：跨供应商 failover 受配置门控——仅当设置 `MODEL_BACKUP_BASE_URL` 才启用 backup 端点；**默认未设 ⇒ 等价单端点**（无多供应商冗余）。
> - ⬜ **待建**：单一真相 catalog 表、按节点分层选模型、PII 区域门的机制化 fail-closed（当前是原则，未由 catalog 强制）。下面表结构是这批能力落地时的目标形态。

模型选择不写在调用点，而是一张**单一真相表** + 一个 router。这同时是"换模型/合规出境/降级"的落地机制和"模型迁移"的执行面（迁移=翻这张表的字段，见 §11）。

```ts
type ModelCatalogEntry = {
  id: string                 // 内部稳定 id
  provider: string           // 厂商
  region: 'cn' | 'oversea'   // PIPL 出境门控的关键字段
  capabilities: {            // 能力位：决定能不能承接某节点
    thinking: boolean
    promptCache: boolean
    toolSchema: 'json' | 'native' | 'none'
    jsonMode: boolean
  }
  contextWindow: number
  cost: { inPerMTok: number; outPerMTok: number } // 用于成本记账与预算门
  status: 'active' | 'deprecated' | 'disabled'
  replaces?: string          // 迁移血缘
  replacedBy?: string
  fallbackChain: string[]    // 本模型不可用时的降级序列
}
```

Router 选模型的策略：

- **按节点分层**：分类/路由类节点用便宜模型，出题/评分/报告等质量敏感节点用强模型——成本与质量在节点粒度权衡（典型成本结构见承重商业测算）。
- **PII 区域门（合规强制，非口号）**：请求若被标记含简历/PII，router **只能**选 `region: 'cn'` 的条目；命中 `oversea` 即 fail-closed 抛错并告警。这条把"简历只走境内模型"从政策变成机制（审计 P1-5）。
  - **审计 H6 修复——区域门必须传导到 fallback 每一跳**：不能只约束主选。`fallbackChain` 在 PII 请求下**先过滤为仅 `cn` 条目**，逐级降级也只在境内候选里走；过滤后为空 → **fail-closed**（排队/抛错/降级到非外呼路径），绝不"主模型挂了就降级到境外"导致 PII 出境。
  - **召回优先于精度**：机制正确性别全押在 NER 召回（漏标=请求不被判含 PII=区域门静默绕过）。**进简历域的流量默认按"含 PII"走境内**，NER/分类器只用于**放宽**（判定确无 PII 才允许境外候选），不用于"判定有 PII 才拦"。
- **fallback 链**：主模型熔断/超时/拒绝服务时，按 `fallbackChain` 逐级降级；降级深度作为健康指标上报（§12）。
- **每轮可切**：长会话里不同轮次可落在不同模型（如主模型抖动时本轮降级），由 router 每次解析，不缓存进会话。

## 6. 结构化输出双校验

详见 `structured-output-and-safety.md`，运行时侧的强制点：

1. **coerce**：`asOptionalRecord(raw)` → `readStringField/readNumberField` 把类型归一。两段分离——别让"字段为 null"的检查掩盖"模型违背了契约"这件事。
2. **schema validate**：Zod 校验结构；失败 → §7 分类处理，**绝不裸 parse 进业务逻辑**。
3. **business validate**：题目数量符合配额、分数在区间、枚举合法、**无幻觉简历事实**（不仅查"缺失"还查"歪曲"）、grounding/引用存在。
4. 失败动作：schema 失败 → 退避重试或降级；业务校验失败（如幻觉）→ 视为 deterministic，不盲目重试，走可解释错误或降级输出。

## 7. 重试分类、熔断与幂等

无界重试 = 烧钱 + thrash（审计 P0-4 点名 generate→validate 自环无上限）。重试必须**先分类**：

| 类别 | 例子 | 动作 |
| --- | --- | --- |
| transient（瞬时） | 超时、429、5xx、length 超窗 | 有界**抖动**退避重试（如 3 次，base 与 jitter 见配置）；length 类先压缩再重试 |
| deterministic-refusal（确定性拒绝） | 内容安全过滤、反复同样的 schema 违背、模型坚持拒答 | **不重试**（重试只是浪费 token）→ 降级或可解释错误 |

- **熔断**：按 provider 维度熔断器；打开即走 fallback 链。
- **幂等**：每次 `invoke` 携带 `idempotencyKey`（turn 级），重试/重放不会重复扣权益、不会重复落业务事件。事件账本侧 `seq` + `turnId` + `sessionKey` 保证一会话事件不串另一会话。
- **硬上限兜底**：每个图运行有 step 上限，防失控重放死循环（见 §10）。

### 7.1 模型稳定性 / HA 链（分层，由内到外）

单供应商 = 单点故障。运行时把稳定性做成一条**分层链**，每层职责单一、可独立配置、层层兜底（代码见 `apps/worker/src/interview-service.ts` 的 `endpoint`/`withFailover`，原语在 `packages/ai-runtime`）：

1. **限流**（`rateLimitedModel`，最内层）：并发上限（`MODEL_MAX_CONCURRENT`，默认 4）+ 可选 RPM（`MODEL_RPM`，默认 0=不限速只限并发），对齐供应商 RPM/并发，先排队摊平突发，防自己把自己打到 429。
2. **熔断**（`circuitBreaker`，包在限流外）：按端点维度熔断；连续失败即打开，快速失败 + 快速恢复（半开探测），不让请求持续撞一个已挂的端点。
3. **transient 分类 + 指数退避**（`invoke` 内）：429/408/5xx/超时归为 transient → 有界抖动退避重试（见 §7）；deterministic-refusal 不重试。
4. **跨供应商 failover**（`failoverModel([primary, backup])`，配置驱动）：primary 熔断打开 / 持续 429 / 超时 → **秒级切 backup**（另一 key 或另一供应商的 OpenAI 兼容端点）。这是唯一能扛「整个 primary 供应商故障」的层。
5. **全挂降级**（最外层，业务侧）：主备都不可用 → 走中性分 / 兜底题 / 可解释错误态，前端收到明确降级事件（如 `report_unavailable`），**无死胡同、不空转**（见 §12、langgraph-blueprint 的 SSE 终态事件）。

**启用 backup（第 4 层）**：在 worker 环境配置三个变量 `MODEL_BACKUP_BASE_URL` / `MODEL_BACKUP_API_KEY` / `MODEL_BACKUP_NAME`（`MODEL_BACKUP_NAME` 省略则复用 primary 模型名）。示例见 `docker/env/worker.env.example`。

> **诚实标注（勿把目标当已上线）**：🟡 **不配 `MODEL_BACKUP_BASE_URL` ⇒ 第 4 层 failover 不生效**，`withFailover` 返回单端点，等价「限流 + 熔断 + 退避 + 全挂降级」但**无多供应商冗余（仍是单供应商单点）**。第 1/2/3/5 层默认即在链上；第 4 层需显式配置 backup 才闭合。合规约束：backup 端点必须与 primary 同为境内，PII 请求的区域门在 failover 每一跳都生效（见 §5 审计 H6）。

## 8. 工具调用修复（tool-call-repair）

模型有时不吐合法的原生 tool call，而是吐纯文本里夹 JSON、XML、或括号语法。这是上线后、规模上来才暴露的隐性需求。运行时在 coerce 之后加一道**提升**预处理：

- 识别常见畸形语法，解析并**提升为原生 tool call**。
- **allowlist**：只接受已注册工具，未知工具名直接拒绝（防注入构造的伪工具）。
- **payload 上限**：单次 tool 参数 256KB，超限截断 + 记诊断。
- **诊断计数**：修复触发率作为模型健康信号上报（飙升往往意味着某模型在退化，§12）。

## 9. 记忆：冻结快照 vs 活状态

> **实现状态（承重纠偏，勿当已上线）**：本节描述的"成长档案/长期记忆 + 冻结快照/活状态 + 装载扫注入 + 写前漂移检测"是**目标设计**，非当前生产路径。代码现状：
> - 🟡 **机制已建、未接线**：`memory-service`（`rememberFact`/`recallMemories`/`wasAsked`/`episodeSeen`，复用 pgvector + embedder）**只被 `memory.proof.ts` 调用，零生产接线**——面试/出题/评估主循环都不读写它。组合根（`worker/main.ts`）里 embedder 只用于 qbank 检索，未装配记忆召回。
> - **设计决策（已过两轮专家审计）**：富记忆的"信念/成长/embedding 三层"个性化设计被**否决**（会摧毁引擎确定性、造出与 `assessment_report` 分叉的第二成长真相源、形成确认偏差回路）。**审定的 MVP** = 跨会话**精确哈希去重**（同一候选人不重复出同题）+ **复用 `assessment_report` 作为唯一成长真相源**；信念/个性化 store **暂缓（deferred）**。成长曲线只从 `assessment_report` 派生，不引入第二状态机。
> - 因此下述"冻结快照/漂移检测/字符上限"是记忆能力真正接线时才落地的目标形态，当前不代表运行行为。

成长档案/长期记忆若直接把"当前全量状态"塞进系统提示，会破坏前缀缓存、且并发写会互相覆盖。机制：

- **冻结快照**：会话开始时取一份快照注入系统提示，整个会话不变（保前缀缓存命中）。
- **活状态**：放业务表，可改，但**不动快照**——避免每改一次就让缓存失效。
- **装载时扫注入**：从存储读回时扫描注入特征，命中的条目标 `[BLOCKED]`，原文保留给用户自行删除（所有用户内容是不可信输入）。
- **写前漂移检测**：写之前 round-trip + checksum 比对，发现并发改动 → **拒写 + 备份**，而不是盲目覆盖。
- **字符上限**（模型无关），不用 token 上限——换模型不应改变记忆容量语义。

## 10. 终止判定

不靠硬编码 `maxIterations`（业务语义会变），而是三者结合 + 一个兜底：

- **per-tool `terminate` 标志**：某些工具（如"生成结束语"）执行后即应停。
- **`shouldStopAfterTurn` 业务回调**：由图的业务状态决定是否继续（如题目配额已满）。
- **abort 信号**：用户中止 / 会话超时 / kill-switch。
- **硬 step 上限兜底**：以上都不触发时的失控保护，防重放死循环。

## 11. 演进锚点：迁移不是另写一篇小作文

模型迁移与图/会话迁移的"执行面"就在本运行时的 primitive 上，对应详方案应锚定于此，而非各写一套：

- **模型迁移** = 对 catalog 翻 `status` / `replacedBy` + eval 门禁卡住切换；`fallbackChain` 本身已编码降级路径。无需新机制。
- **图/会话迁移** = checkpoint 信封带 `graphVersion`，恢复时跑 migration-on-read 函数链把旧状态升级到新结构；不可迁移 → 安全终止 + 业务事实仍在（§3），不丢数据。"会话停了 3 天再继续"与"并发改动"是同一类问题，用 §9 的漂移检测同款思路。
- **prompt 迁移** = `ai_prompt_versions` 按租户/百分比/影子灰度；运行中会话默认钉启动时版本，新会话用新版。

## 12. 健康指标：埋这一层的命脉，而非通用四黄金信号

通用的 rate/error/latency 谁都有。真正反映这个 agent 死活的是 primitive 级指标，应进监控与告警：

- **tool-call-repair 触发率**：飙升 = 某模型在退化或 prompt/工具 schema 漂移。
- **压缩触发距溢出的余量**：长期贴边 = reserve 设小了或上下文设计有问题。
- **fallback 链降级深度**：经常降到第 2、3 级 = 主模型不稳。（🟡 当前仅在配置了 `MODEL_BACKUP_*` 的双端点 failover 下有第 2 级；默认单端点无此深度。）
- **schema 失败率 / 业务校验失败率（幻觉、越权、分数越界）**：质量回归的先行指标。
- **deterministic-refusal 计数 / 熔断器状态 / catalog 流量分布**。
- **每次调用成本**（model、in/out tokens、¥）→ 聚合成 cost-per-interview，接预算门与 kill-switch。

trace 侧每次 `invoke` 是一个 span，`traceId` 贯穿 HTTP → 图 → provider，与 LLM 追踪打通；脱敏在 sink 边界统一做（token/key/secret/PII/简历全文/完整 prompt 一律剥离），不在业务代码里散落。**成本/token 真相落自己库**（✅ 已接线）：`ai_invocation_trace` 新增 `input_tokens`/`output_tokens`/`latency_ms` 列，成本源头真相直接落 Postgres——**不只依赖可选的 Langfuse**，没配 Langfuse 也能对账/计费/预算告警。

## 13. 失败模式表（节选）

| 失败 | 机制 | 兜底 |
| --- | --- | --- |
| 模型超时 / 429 | transient 退避重试 | 超阈值 → fallback 链降级 |
| 模型持续拒答 | 判定 deterministic，不重试 | 降级输出 + 可解释错误 |
| 输出 schema 不合法 | 重试（带"修正你的格式"提示） | N 次后降级或 explainable error |
| 输出幻觉简历事实 | 业务校验拦截 | 标记 + 不入库 + 要求重生成 |
| 上下文超窗 | 溢出前压缩；length 错误压后重试 | 仍失败 → 截断中段 + 告警 |
| 畸形 tool call | tool-call-repair 提升 | allowlist 外直接拒绝 |
| checkpoint 不可迁移 | migration-on-read 升级 | 安全终止；业务事实独立保全 |
| provider 整体故障 | 熔断 + fallback 链（🟡 跨供应商切换需配 `MODEL_BACKUP_*`，默认单端点仅有熔断+退避） | 全链不可用 → `waiting`/排队 + 用户可见降级态 |

## 14. MVP 落地优先级

先做能让"单场面试端到端稳定可演示"的最小子集，其余按需补：

1. **双校验 + 重试分类 + idempotencyKey**（无此则裸 parse 病根没除，演示一崩就崩）。
2. **模型 catalog + router + PII 区域门**（合规底线 + 换模型能力）。
3. **主动压缩 + reserve**（长面试不超窗）。
4. **tool-call-repair + 终止兜底**（防生产隐性崩与失控循环）。
5. 记忆快照/漂移检测、健康指标全量、fallback 链多级——可随成长档案与监控建设逐步补齐。

## 15. 生产硬化：八个致命洞的解法

单图单 invoke 不够，下面八个是「上线第一天 100% 发生」的洞，逐个钉死：

| # | 洞 | 解法 |
|---|---|---|
| 1 | **checkpoint↔事件账本双写裂脑** | 业务表为唯一真相；事件由业务事务派生（事务性 outbox），不假设跨存储同事务；恢复以事件账本对账重放、副作用幂等。见 [生产不变量](../../rules/global/production-invariants.md) 原语 4 |
| 2 | **同 threadId 并发 resume 裂脑** | resume 先抢 thread 租约/`pg_advisory_xact_lock(resultId)` + resume 幂等键；抢不到返回"会话进行中"不排队重跑。见 `runtime-migration.md` §6 |
| 3 | **流式↔双校验冲突** | 承载事实的输出（评分/报告/评价）**先校验后渲染，不流式**；流式只用于不承载事实的对话态。SSE 只发已校验业务事件，不发裸 token |
| 4 | **图状态序列化炸弹** | state 只放引用（id），简历/报告等大件存域表按需加载；checkpointer 不每 super-step 重写大 blob。见 `ingestion-pipeline.md` |
| 5 | **interrupt 重放双副作用** | 副作用放在 interrupt 点**之后**，或做成幂等（turn 幂等键）；节点 resume 重跑不重发题/不重扣 |
| 6 | **token 计数虚构** | **区分两件事**（修审计 #22）：① 调用**前** best-effort 估算闸（含整个 tool_call 信封；境内模型无权威分词器→只能粗估，故 reserve 显式留误差带，不写"用真实分词器"的绝对话）；② 调用**后**以 provider 返回的**真实 usage 计费**（流完才记账、中途失败补记防泄漏）。预算决策用估算闸、账单用真实 usage，分开 |
| 7 | **无背压** | 运行时级有界并发 + 队列深度上限 + 过载主动拒绝（load shedding），防 provider 限流雪崩 + 成本爆炸 |
| 8 | **结构化输出降级未定** | 承载事实的节点是**硬路由约束**——只准落在 schema 能力达标的模型上（`toolSchema≠none`），与成本分层冲突时质量优先 |

---

**面试可辩护要点**：① 为什么要一个统一运行时关口（横切关注点不收口必漂移）；② 双校验里"schema 通过≠业务合法"的那个幻觉拦截例子；③ 主动压缩 vs 反应式压缩、token 预算为何要算整个信封；④ PII 区域门把合规从口号变成 fail-closed 机制；⑤ 重试为何必须先分类（deterministic 不重试）；⑥ 迁移为何不是另写机制、而是翻 catalog / checkpoint 信封字段。
