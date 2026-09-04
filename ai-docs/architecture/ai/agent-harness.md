---
id: architecture_ai_agent_harness
name: LangGraph-native Agent Harness
description: 澄清"循环属于 LangGraph,harness 是三层纪律(节点内 invoke 唯一关口 + 图设计约定 + 包住 LangGraph 的 seam)";图原语映射、三种 agent 图形状、节点重放语义、invoke 两阶段 ledger、关口完整性、可替换 port。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ./agent-runtime.md
  - ./langgraph-blueprint.md
  - ./multi-agent-orchestration.md
  - ./runtime-migration.md
---

# LangGraph-Native Agent Harness Spec（知面 · 定稿可落地）

> 本文为 L2+ 架构定稿，已吸收六块设计（图约定 / invoke 关口 / 工具节点 / state / 控制失败 / seam）及其对抗评审的全部 P0/P1 必修项。所有命令式会话主循环、内存会话、手搓重试均被显式禁止。机制级具体，给伪代码 + LangGraph 落点，无外链。

> **实现状态（对齐代码，区分"已接线运行"vs"目标设计"）**：
> - ✅ **已接线运行**：面试图 ①（可恢复长会话，genQuestion/awaitAnswer 拆分、interrupt/resume、evalAnswer 双校验路由、degrade 边、report 走独立 run）；invoke 关口的两阶段 ledger 幂等、瞬时错误指数退避、schema+业务双校验；`OrchestrationPort`/`LangGraphAdapter`；事件账本 outbox + SSE。commerce 对账/回收已接进 worker tick。
> - 🟡 **机制已建、默认关闭/未接线**：跨供应商 failover（`failoverModel` 代码在，默认单端点，需 `MODEL_BACKUP_*`）；语义长期记忆（冻结 snapshot、向量召回、用户信念画像均未接线；跨会话 exact 题目去重与历史弱项软偏置已运行，见 [memory-context-design.md](./memory-context-design.md)）。
> - 🟠 **stub/骨架**：§3 的 `catalog/resolveBinding` 为 `stub:deterministic` 残留骨架，`invoke` 不消费（模型由组合根按节点直接注入）。
> - ⬜ **设计模式说明、未实例化**：§2.3 的自主研究图 ② 与 supervisor 扇出图 ③（下文已各自标注）。
> 下文其余机制描述均为该图/关口的**目标形态**；带 ✅/🟡/⬜ 处以标注为准。

---

## 1. 定位：循环属于 LangGraph，harness 是三层纪律

**一句话锁死**：控制流是图的形状，不是代码里的 `while`。我们从不写循环——我们画回边；从不写等待——我们埋 `interrupt`；从不写并发——我们发 `Send`；从不写子流程函数——我们挂 subgraph。**任何 `run(){ while(!done) step() }` 都是设计 bug**，它把 Pregel runtime 已拥有的循环手搓了一遍，且立刻丧失 durable / interrupt / multi-instance。

| 关注点 | 归属 | 机制 |
|---|---|---|
| 循环 / 分支 / 等待 / 扇出 / 子 agent | **LangGraph（引擎层）** | 条件边回边 / 条件边 / `interrupt` / `Send` / subgraph；Pregel 驱动 super-step，checkpointer 管 durable/resume |
| **harness ①：节点内纪律** | 我们写 | 每个调模型的节点穿过唯一关口 `invoke()`；每个调工具的节点穿过唯一关口 `toolExec()` |
| **harness ②：图设计约定** | 我们写 | 怎么用边/interrupt/Send/subgraph 表达 agent 控制流，且节点重放幂等 |
| **harness ③：包住 LangGraph 的 seam** | 我们写 | checkpointer wrapper、model router、事件账本接线、关口结构约束、`OrchestrationPort` |

**两层边界判据**：如果你写了一个数迭代次数的计数器来决定"下一步走哪个节点"，错了——方向盘是条件边 + checkpointer；计数器只能当**安全阀**。机械重排（超时/429/length）走 invoke 内部；**语义级重生成（业务校验失败要重出题）走图的条件边**。

---

## 2. 图设计约定（控制流 → 拓扑）

### 2.1 原语映射（禁止反例）

| agent 概念 | LangGraph 落点 | 反例（禁止） |
|---|---|---|
| 循环 / 多轮 | `addConditionalEdges` 返回上游节点名形成回边 | 节点内 `while` 连发模型 |
| 等待用户 | 节点内 `interrupt(payload)`，外部 `Command({resume})` 续 | 内存 hold SSE 连接 / `Map<sessionId,resolver>` |
| 分支 / 路由 | `addConditionalEdges(node, pureFn, mapping)` | 节点里 `await otherNode(state)` |
| 子 agent | 编译好的 subgraph 当 node 挂上 | 节点里 `new Graph().invoke()` 临时拼 |
| 扇出 | 路由函数返回 `[Send("worker", taskA), …]` | `Promise.all(tasks.map(callModel))` |
| 提前终止 | 条件边指向 `END` | 节点内 `throw` 当正常退出 |
| 可恢复长会话 | `compile({checkpointer})` + `thread_id` | 会话状态塞 Redis 自管恢复 |

### 2.2 State channel 底座

```ts
const BaseState = Annotation.Root({
  threadId: Annotation<string>(),            // = 业务主键(resultId)，camelCase；下沉时映射 thread_id
  status:   Annotation<RunStatus>(),         // 显式状态枚举，禁布尔汤（runOutcome 也只用枚举）
  // 追加型 channel 必配幂等 reducer
  events:  Annotation<BizEvent[]>({ reducer: dedupById, default: () => [] }),
  budget:  Annotation<Budget>({ reducer: mergeBudgetIdempotent }),
});
```

三条铁律：
1. **business fact 不进 graph state 易失区**。分数、订单、扣费落业务表；state 只放 run-time 编排态（当前题、待评答案、预算、中断负载、引用 id）。
2. **凡并发写或重放重复写的 channel 必须配 reducer，且 reducer 幂等**（§5.3）。
3. `status`/`runOutcome` 是 channel 也是真相；节点只推进枚举，边只读枚举做路由。

### 2.3 三种 agent 图形状

**① 面试 agent — 可恢复长会话图（已实例化，MVP 主战场）**

评审 P0 修正后的拓扑：**出题与等答拆成两个节点**（interrupt 重放安全），**evalAnswer 直接条件边路由**（删空节点 decideNext），**补 degrade 边**，**report 不画进图**。

```
START → genQuestion ─persist→ awaitAnswer ──→ evalAnswer ──route──┐
        (调模型,幂等键)  (纯)   (仅interrupt,   (双校验)    continue│→ genQuestion (回边=循环)
                                interrupt前零副作用)        finish  │→ finalize → END
                                                            degrade │→ degrade → END
```

```ts
const interview = new StateGraph(InterviewState)
  .addNode("genQuestion", genQuestion)   // 调模型出题 → 幂等键持久化 → 不含 interrupt
  .addNode("persistQ",    persistQ,  { /* maxAttempts:1，副作用幂等 */ })
  .addNode("awaitAnswer", awaitAnswer)   // 仅 interrupt，无模型、无副作用
  .addNode("evalAnswer",  evalAnswer)
  .addNode("finalize",    finalize)      // 走 END，同时向外部队列投递 report job
  .addNode("degrade",     degrade)
  .addEdge(START, "genQuestion")
  .addEdge("genQuestion", "persistQ")
  .addEdge("persistQ", "awaitAnswer")
  .addEdge("awaitAnswer", "evalAnswer")
  .addConditionalEdges("evalAnswer", routeAfterEval, {
     continue: "genQuestion", finish: "finalize", degrade: "degrade",
  })
  .addEdge("finalize", END)
  .addEdge("degrade", END)
  .compile({ checkpointer });            // Postgres checkpointer

function routeAfterEval(state) {
  if (state.lastEval?.kind === "business_violation" && state.regenCount >= REGEN_CAP) return "degrade";
  if (state.lastEval?.kind === "business_violation") return "continue"; // 有界重出题（regenCount 派生自 superstep）
  if (state.askedCount >= state.plan.total) return "finish";
  if (state.budget.exhausted) return "finish";
  return "continue";
}
```

关键点：
- `threadId = resultId`；续跑 = 同 `thread_id` 发 `Command({resume})`，从 `awaitAnswer` 的 interrupt 点恢复。**进程可在等待期被杀/换实例**——等待用户由持久 `interrupt` 表达而非内存中的连接/`Map<sessionId,resolver>`，这是全套可恢复性的 #1 承重点。
- **report 走独立 run**（`threadId=reportId`），由 finalize 在出图后向队列投递 job 触发。**禁止用 `Send` 做后台报告**——`Send` 调度同 thread 下一个 super-step，`invoke()` 不会返回直到子图跑完，会把面试主路径拖住。report 也**不是 subgraph**（subgraph 在父 super-step 内同步跑、抛错传播父 run）。

**② 自主研究 agent — 有界预算图（设计模式说明，未进 MVP blueprint 前不实例化）**

ReAct = `agentStep` 与 `toolNode` 两节点 + 一条回边，预算是回边上的护栏。仅当四图正式纳入"自主研究图"后落地。

```ts
.addConditionalEdges("agentStep", routeAgent, {
   act: "toolNode", done: "synthesize", budget_exhausted: "synthesize",
})
.addEdge("toolNode", "agentStep")   // 回边 = ReAct 循环
function routeAgent(state) {
  if (state.budget.steps <= 0 || state.budget.tokens <= state.budget.floor) return "budget_exhausted";
  return state.lastDecision.kind === "tool_call" ? "act" : "done";
}
```
有界：模型说"我还要查"也要先过预算边，agent 不能自我授权无限循环；tool 结果回灌 `observations` channel（data block），**绝不拼进 system instruction**。

**③ supervisor agent — 主子扇出图（设计模式说明，零当前需求，未实例化）**

`Send` 扇出到 worker subgraph，结果用幂等 reducer 按 `taskId` 归并。仅作模式登记，不为它预建 channel/reducer。

### 2.4 节点重放语义（最易翻车，单列）

**铁律：节点函数会被重跑。** 来源有二：interrupt 续跑（含 `interrupt()` 的节点从第一行重新执行，到 `interrupt()` 才取 resume 值）、retryPolicy 重试（整段重跑）。硬约束：

- **(a) 副作用必须放在 interrupt 之后，或本身幂等。** `interrupt()` 之前零副作用——这也是把 genQuestion 与 awaitAnswer 拆开的根因：出题的模型调用不能落在会被 interrupt 重放的节点里。
- **(b) 一个节点只放一个 interrupt。** 多 interrupt 按索引顺序匹配 resume，重放路径分支变化即错位取错值。
- **(c) 不可逆外部副作用（扣费/下单/发消息）一律不放节点直调**，而是走业务服务带幂等键，或表达成"待执行意图"写 channel 由出图 sink 消费（§7.3）。满足"AI 图不直接改 payment/entitlement"。
- **(d) reducer 幂等 = 重放安全网。**
- **(e) 模型调用本身是副作用（花钱）。** invoke 关口按请求级幂等键 memoize 整个结果（§3.2），重放命中缓存不二次计费、**返回逐字节相同 value**（否则 resume 后题面发散）。

---

## 3. 节点内 invoke 唯一关口（harness ①）

### 3.1 节点唯一可见接口

```ts
interface NodeInvoke {
  invoke<T>(req: InvokeRequest<T>): Promise<InvokeResult<T>>;
  // 仅对话态/不承载事实可用；流式 chunk 仍经关口做 redact-at-sink + 带 invokeId，经 outbox 出口
  invokeStream(req: InvokeRequest<string>): AsyncIterable<Chunk>;
}
interface InvokeRequest<T> {
  node: NodeId;                 // 关口据此查 nodeRegistry：分层/PII区域/允许的契约集，不信节点自报
  idempotencyKey: string;       // = `${threadId}:${nodeId}:${turnId}`，turnId 确定性派生（§3.3-C1）
  purpose: 'route'|'dialog'|'fact_bearing';
  instruction: InstructionRef;  // 三段式稳定系统前缀的版本 id，非裸字符串
  dataBlocks: DataBlock[];      // 不可信用户内容只能进这里，带 sensitivity 标签，绝不 splice 进 instruction
  outputContractId: ContractId; // schema + businessValidator 由此查注册表，节点无法塞 no-op
  tools?: ToolName[];           // 仅纯函数/单跳/无副作用解析型工具的 allowlist（§3.6）
  signal: AbortSignal;
}
type InvokeResult<T> =
  | { ok: true;  value: T; meta: InvokeMeta }      // 已双校验、已记账、已脱敏
  | { ok: false; reason: InvokeFailure; explain: string; degraded?: T };
// InvokeFailure = 'schema'|'business_violation'|'deterministic_refusal'
//               |'budget_exceeded'|'pii_zone_blocked'|'exhausted'
```

**失败是返回值不是异常**——让图的条件边据此走 degrade，而非炸节点污染 state。

### 3.2 invoke 管线（单次，非循环）+ 两阶段 ledger

```ts
async function invoke(req, deps) {
  // 0 幂等短路：reserve/commit 两阶段（解 C2"已外呼未记账"窗口）
  const prior = await deps.ledger.lookup(req.idempotencyKey);
  if (prior?.state === 'committed') return prior.result;        // 重放返还逐字节同值
  if (prior?.state === 'in_flight')  return reconcile(prior, req, deps); // 对账，不盲目重呼
  await deps.ledger.reserve(req.idempotencyKey);                // 调 provider 前先占位

  // 1 契约绑定校验：req.outputContractId ∈ allowed(req.node)，越界 fail-closed（解 H2 后门）
  assertContractAllowed(req.node, req.outputContractId);

  // 2 PII 区域门：sens = max(域默认, 分类器, registry)；简历域/fact-bearing 硬钉境内（M1：无放宽路径）
  const sens  = effectiveSensitivity(req);
  let   model = deps.router.resolve(req.node, sens, deps.contracts.capabilityOf(req.outputContractId));
  //   sens=pii ⇒ 主选与整条 fallbackChain 先过滤 region='cn'；空 ⇒ fail-closed，绝不降级出境

  // 3 溢出前主动压缩（境内模型无权威分词器→best-effort 粗估，按整个 tool_call 信封估算预算+留误差带；真实 usage 调用后记账。压缩以 (tool_call,tool_result) 配对为原子）
  let messages = assemble(req.instruction, compactIfNeeded(buildContext(req), model), req.dataBlocks);

  // 4 调用 + 全局封顶的本地重试（§3.4）
  const raw = await callWithClassification(model, messages, req, deps);

  // 5 coerce → 6 tool-call-repair(allowlist外拒绝, 单参256KB截断) → 7 schema 校验
  const parsed = deps.contracts.schema(req.outputContractId).safeParse(repairToolCalls(coerce(raw), req.tools));
  if (!parsed.success) return classify(new SchemaViolation(parsed.error), req, deps);

  // 8 业务双校验（题数/分数区间/枚举/无幻觉简历事实/grounding）—— 注册表取出，无条件跑
  const v = deps.contracts.businessValidate(req.outputContractId, parsed.data);
  if (!v.ok) { await deps.ledger.fail(req.idempotencyKey, usage(raw));
               return { ok:false, reason:'business_violation', explain:v.reason, degraded:v.safeFallback }; }

  // 9 commit：成本 + 已校验结果原子写（commit 后才算 success），脱敏只在此 sink 边界做一次
  const meta = await deps.ledger.commit(req.idempotencyKey, { model, usage: usage(raw), value: parsed.data });
  return { ok:true, value: parsed.data, meta };
}
```

### 3.3 承重不变量（评审 C1/C2/H2）

- **C1 — turnId/sendIndex 确定性派生。** `turnId` 必须是 checkpoint 状态的确定性函数（如 `superstep + nodeId`，或写进 state 的单调 turn 计数，**在 interrupt 之前持久化**），**绝不在节点体内现 mint（uuid/Date.now/局部自增）**。`Send` 的 `sendIndex` 必须是负载携带的稳定下标。否则重放产生新 key → step-0 查不到 → 二次外呼/扣费/发事件。**这是全套幂等的唯一承重点，提升为文档最显眼不变量。**
- **C2 — 两阶段 ledger + provider 幂等为主保证。** ledger-after-commit 单独堵不住重复外呼；reserve（in_flight）+ provider 侧幂等键 + 重放对账三者共同给"至多一次"。本地 ledger 在数学上无法独立关掉"已外呼未记账"窗口。
- **H2 — nodeId→contractId 绑定。** 注册表存 `node → 允许的 contractId 集合`，越界 fail-closed。否则承载事实的评分节点可声明宽松对话态契约，跳过严格业务校验且开启流式绕过"先校验后渲染"。

### 3.4 本地重试 ≠ 图的条件边循环

```ts
async function callWithClassification(model, messages, req, deps) {
  let attempts = 0;                                   // 全局计数，fallback 切换不重置（解 H4）
  const deadline = Date.now() + WALL_BUDGET_MS;
  while (attempts++ < MAX_TOTAL_ATTEMPTS /* ≤5 */ && Date.now() < deadline) {
    try {
      return await deps.providers(model).call(messages, {
        idempotencyKey: req.idempotencyKey, signal: req.signal,
        stream: deps.contracts.isFactBearing(req.outputContractId) ? false : 'dialog-only',
      });
    } catch (e) {
      const cls = classifyError(e);
      if (cls === 'deterministic_refusal') throw e;   // 不重试，重试只烧 token
      if (cls === 'length') { messages = compactPairAtomic(messages); continue; }
      if (cls === 'transient') { await backoffJitter(attempts); continue; } // 同 candidate 退避（解 P0-1）
      const next = deps.router.nextFallback(model, req); // 换 candidate；区域门逐跳保持
      if (next) { model = next; continue; }            // 不重置 attempts
      throw e;                                          // 全链不可用 ⇒ 'exhausted'
    }
  }
  throw new InvokeError('exhausted');
}
```

边界判据：**机械重排走 invoke，语义级重生成走图。** schema 机械重排（≤1 次带"修正格式"提示）属"调对一次"留在 invoke——此为二选一**写死**：schema 失败由 invoke 自纠 ≤1，仍败交条件边；业务违规默认 deterministic，invoke 不重试，返回 `business_violation + degraded`，是否绕回重出由条件边（被 REGEN_CAP 封顶）。

### 3.5 retry / fallback / node-retryPolicy 三者对账（评审 P0-1）

- **瞬时退避重试**：invoke 内 per-candidate（同模型 N 次再 advance），**不是过早降级换小模型**。
- **fallback（换 candidate）**：router 链，对节点不可见。
- **LangGraph 节点 retryPolicy**：**默认关闭**，仅用于极少数节点级基础设施崩溃（worker OOM/被杀后 super-step 重放），`maxAttempts ≤ 2`。承载 invoke 的节点关图层重试——否则与 invoke 内重试叠乘 N×M 烧钱，且整节点重放又触发 §2.4 非确定性。

### 3.6 invoke 内 tools 的边界（评审 P0 seam）

`invoke().tools` **只允许纯函数、单跳、无副作用、有界耗时**的解析型工具（tool-call-repair 服务于"把一次模型输出修成合法 schema"）。**任何多跳/带副作用/需持久化中间态的 agentic 工具使用，必须表达为图里的 ToolNode + 条件边 cycle**（循环归 LangGraph），禁止埋进 invoke——否则中间轮次不进 checkpointer、不可 interrupt、崩溃全丢。

### 3.7 PII 区域门：只升不降

`effectiveSensitivity = max(域默认, 分类器, registry)`。简历域默认 `pii`（召回优先）。**删除 classifier 放宽路径（M1）**：简历域 + 任何 `isFactBearing` 契约硬钉境内，放宽只允许非简历、非承载事实场景。`pii` ⇒ 主选与整条 fallbackChain 先过滤 `region='cn'`，空 ⇒ fail-closed（排队/降级非外呼路径，且接有界并发 load-shedding，避免"排队"成新雪崩源）。

---

## 4. 工具节点执行模型（harness ①·工具侧）

> **实现状态**：本节 `gatedToolNode`/`toolExec` 全套门控工具执行仍是**目标设计**；当前面试图没有模型驱动的通用 ToolNode。已接线的是固定只读 research capability：owner-scoped local qbank RAG，低置信时最多 3 个 allowlist 源的有界 `deep.research`，以及兼容 `web.explore` seam；每个 job 的 RAG/深检索各最多一次，未知 skill fail-closed。它们不是模型可自由选名/选 URL 的 agentic tool loop。详情与真实边界见 [`research-capability-gate.md`](./research-capability-gate.md)。

### 4.1 门控工具节点（与 invoke 对称的唯一执行点）

每个图只有一个 `gatedToolNode`，复用预制 ToolNode 的解析/并行/`tool_call_id` 回填内核，但每个工具经 `ToolRegistry` 注册、经唯一关口 `toolExec()` 执行。**模型调用走 invoke，工具执行走 toolExec**。

```ts
interface ToolDescriptor<A, R> {
  name: string; argsSchema: ZodSchema<A>; resultSchema: ZodSchema<R>; // 结果是不可信输入，也校验
  sideEffect: 'pure'|'effectful'; idempotencyScope?: 'run';           // MVP 只留 'run'
  region: 'cn_only'|'any'; sandbox: 'none'|'egress_allowlist';        // 砍 isolated_exec（YAGNI）
  disclosure: 'inline'|'ref';                                          // 两档（砍三档）
  policyTags: string[]; budgetCost: { calls: 1; estCents: number };
  execute(args: A, ctx: ToolCallCtx): Promise<R>;                      // 调应用服务，不直连 DB/外网原语
}
```

### 4.2 toolExec 管线

```
1 allowlist + policyTags ⊆ run.policy → deterministic 拒绝(不重试)，回 ToolMessage(error) 让模型 re-plan
2 args coerce+校验失败 → ToolMessage(error,"修正参数")
3 PII 区域门：ctx.piiTainted && region!=='cn_only' ⇒ fail-closed（防简历 PII 随 query 出境）
4 幂等：effectful → 下游业务服务幂等键(引擎无关，先于副作用提交)；callId 仅 best-effort 优化层
5 预算门：call-count + ¥ 扣减；wallclock 仅用于有界短命图，禁用于可恢复面试图（评审 P1）
6 sandbox(egress_allowlist) + timeout + 输出上限
7 resultSchema 校验
8 elide：大结果落对象存储+域表(复用现有 S3/MinIO，不新造 store)，state 只留 {ref, summary, tag}
9 装 DATA 信封 + [UNTRUSTED] 标注；redact-at-sink
```

### 4.3 关键修正（评审）

- **悬空 tool_calls 必须应答（P0，provider 400）**：任何"绕过 tools 直达 finalize"的边（预算耗尽/terminate/硬上限），**必须先为所有悬空 `tool_call` 合成 error ToolMessage**（`"not executed: budget_exhausted/terminated"`），否则下次 provider 调用 100% 400。
- **压缩配对原子性（P0）**：压缩/elide 的最小单位是完整的 `(tool_call, tool_result)` 对，不可拆半——孤儿 `tool_use` 即 provider 400。
- **幂等主保证倒置（P1）**：承重不变量 = "effectful 工具副作用在下游业务服务以业务幂等键去重，幂等键先于副作用提交"（引擎无关）；`callId/super-step` 降为 best-effort 优化。同时解决十年换引擎问题。
- **fetch_artifact 加 authz（P0 安全）**：`artifactId = hash(runId,callId)` 是寻址不是授权；必须校验 ref 归属当前 `runId/userId`，artifact 按 run 隔离命名空间。
- **tools 节点禁挂 LangGraph retryPolicy**：整节点重放会把已成功的 effectful call 一起重放；重试是节点内 per-call + 幂等键。

### 4.4 tool 节点 vs 业务节点（最关键取舍）

**凡改用户钱/权益/永久记录的，是业务节点（工程师设计的 DAG 边、双校验后确定性执行），不是工具。** 凡读/搜/算/提议（可逆、幂等）才可做工具。理由：若"落结果/结算"是模型可调工具，模型能双调、跳校验、被注入诱导去调。灰区（发提醒邮件）：可做 effectful 工具（带幂等+outbox），但更推荐做"校验后触发的业务节点"。

---

## 5. graph state / 上下文（harness ②）

### 5.1 一条铁律：state 是"路由燃料"，不是数据库

字段进 state channel 过三道闸，**三条全真**才准进：① 有条件边/路由读它；② 标量或有界小数组；③ 丢了只赔一次 run（损坏只导致这场会话无法 resume，不丢业务事实）。不满足的进业务表/事件账本，state 只留**引用 id**。

### 5.2 三层分级

| 层 | 内容 | 落点 | state 形态 |
|---|---|---|---|
| A 标识 | userId/resultId/threadId/serviceType | state（init 写一次） | 标量 |
| B 控制态 | phase/questionIndex/quota/waitingFor/reportStatus | state（条件边读） | 标量/枚举 |
| C 内容 | 简历全文/答案全文/报告/题目正文/embedding/无界 messages | 业务表/对象存储（现行答案全文在 `interview_job.payload`；ledger artifact 仍非生产 HTTP）。**`interview_event` 禁止顶层 `answer`**，只可写 `answerId`/`answerHash` 等引用，见 [interview-answer-dual-write-cutover.md](../backend/interview-answer-dual-write-cutover.md) | **只放 ref，节点本地水合，绝不写回 state** |

**控制态是账本投影、checkpoint 是可丢缓存**（评审 ⑥ 收敛点）：`questionIndex` = 账本 question 事件计数，`phase/waitingFor` = 末条事件的函数。一旦控制态可从账本重建，迁移/裂脑/并发 resume/换引擎四件事被一个原则统一收掉。要的是"可重建"不变量，不教条式事件溯源。

### 5.3 channel reducer 选择

```ts
const cappedTurns = (max) => (p=[], n=[]) => [...p, ...n].slice(-max); // 纯函数、同步、无 IO
const mergeById   = (p=[], n=[]) => { const m=new Map(p.map(x=>[x.id,x])); for(const x of n) m.set(x.id,x); return [...m.values()]; };
// 计数器型(budget/cost)：写成带幂等键的条目，dedup(nodeName+superstep) 后再 sum——求和不幂等，重放会重复计
```

- **扇出 channel 必用合并 reducer**（mergeById），否则 last-value-wins 丢分 / `INVALID_CONCURRENT_GRAPH_UPDATE`。每个 Send 分支占不相交 id 空间。
- **reducer 严禁 IO/调模型**（破坏重放确定性）。durability 归节点（写穿账本），语义摘要归显式 compact 节点。

### 5.4 评审瘦身（反过度）

- **候选人答案 0 文本进 state**：`recentTurns` 候选人那条只存 `{seq, score, questionId}`。`answer.slice(0,120)` 是截断 PII 不是去标识化，违反"never log full user answers"。
- **`answerEvalRefs[]` 降为 `lastEval` 标量**（若路由只看最近一轮）。
- **砍 `runtime`/cost channel 出 state**（replay 重算不可当账，真相在 trace 表）。
- **砍面试图内 compact 语义摘要节点**：prompt 上下文 = 简历+岗位+`recentTurns(6)` 本就有界小，撞不到窗口；需全历史的报告直接读账本。面试图内 B 档语义压缩在解一个不存在的问题。
- **拆 generate/persist 节点 + 出题幂等键 `${resultId}:${questionIndex}:question`**，node 重放不产生 seq=N、N+1 两条问题。

### 5.5 长历史写穿事件账本

```
state.recentTurns  = 账本的有界缓存（可丢可重建）
interview_event 账本 = 长历史唯一真相（append-only，PK(result_id, seq)，带 turn_id 幂等键）
```
节点（有 IO）在返回 delta 前把**引用/状态**经事务性 outbox 写穿 `interview_event`；reducer（纯）只裁 state 窗口。**resume value（用户答案）只在 evalAnswer 消费→写入现行业务落点（`interview_job.payload` 明文，或未来未开放 HTTP 的 ledger artifact）→不进任何 channel，也不把原文写进 `interview_event`**；承认 checkpoint 路径需与业务落点同级脱敏，不宣称 checkpoint 里绝无答案。落点与互斥见 [interview-answer-dual-write-cutover.md](../backend/interview-answer-dual-write-cutover.md)。

### 5.6 state 膨胀护栏（评审 P1）

长会话 channel_values 每 super-step 全量重序列化 → 行膨胀 + replay 变慢 + OOM。硬规则：channel 只存引用/窗口；tool 大结果落对象存储留 ref；给 channel payload 设 `maxStateBytes`/`maxObservations` 护栏边；state 级也按 `firstKeptSeq` 裁剪历史，不能只裁 model-facing context。

---

## 6. 控制与失败（harness ②）

### 6.1 四种退出语义（显式枚举 runOutcome，砍 aborted 布尔）

| runOutcome | 含义 | 到 END | 出图业务回调 |
|---|---|---|---|
| `completed` | 业务自然收敛 | 是 | `status=completed`，投递 report 独立 job |
| `waiting_user` | interrupt 挂起 | 否（非终止） | 不落终态，前端收 `waiting_user` SSE |
| `budget_exhausted` | 命中硬上限安全阀 | 是 | `status=degraded`，保留部分结果，记可解释错误；触发 commerce 退款/部分完成裁决 |
| `aborted` | 整链死/不可重试拒答/校验永久失败 | 是 | `status=failed`，commerce 补偿 |

**`waiting_user` 不是终止**——内存挂起改成 `interrupt()` 持久化 checkpointer。

### 6.2 终止判定 = 纯路由函数；业务回调 = 出图 seam

```ts
function decideNext(state): "...continue"|"finish"|"safe_terminate"|typeof END {
  if (state.runOutcome === "aborted" || state.runOutcome === "budget_exhausted") return "safe_terminate";
  ...
}
// 业务回调不在图里，出图后做（保证图不直接动权益/支付）
const final = await orchestration.resume(threadId, cmd);   // port，不直接 import langgraph
await onGraphSettled(resultId, final.runOutcome, final);
```

### 6.3 两层硬上限（安全阀非主控）

1. **`recursionLimit`（LangGraph 原生）**：防结构性死循环；命中抛 `GraphRecursionError`，seam 捕获 → 归 `aborted`，**绝不裸抛炸链**。语义是**单次 invoke/resume 段的 super-step 上限**（每次 interrupt resume 是新 invoke，step 计数重置），按"单段最长步数 + 余量"设，不是整场会话。
2. **业务预算账本（state 内）**：`{llmCalls, tokens, toolCalls}`，幂等累加（§5.3），路由函数读它判 `budget_exhausted`。**wallclock 不走路由 guard**（路由只在节点间跑，挡不住单次 invoke 卡死）——墙钟兜底是每次 invoke 的 AbortSignal/timeout。可恢复面试图禁用日历墙钟预算（interrupt 可等三天）。

并行 Send 预算：**扇出前 reserve/commit 预扣额度**防非原子超额；失败 attempt 的真实成本在 candidate 层（不会被 state 回滚处）记账。

### 6.4 错误分类器（retryOn 唯一真相）

```ts
type FailureClass = 'transient'|'deterministic_refusal'|'schema_invalid'
                  |'business_invalid'|'budget'|'isolated'|'fatal';
function classify(err): FailureClass {
  if (isTimeout||isHttp5xx||isRateLimit) return 'transient';
  if (isProviderRefusal) return 'deterministic_refusal'; // 不重试
  return 'isolated';   // 未知错误不默认 fatal/退款（防错误退款），进隔离类有限重试
}
```
`deterministic_refusal` 永不重试，如实回传拒绝（不伪造答案）。**评分链禁 deterministic stub 末端**（编造分数踩幻觉红线）；stub 仅用于非评分过渡话术。

### 6.5 安全终止（整链死有序退化）

节点把穷尽 retry+fallback 后的失败转成 state 上的 `runOutcome`，路由到统一 `safe_terminate` 节点（只整理 state、salvage 部分结果、不做业务副作用），`addEdge("safe_terminate", END)`。**safe_terminate 必须把 partialResults/可恢复业务价值 flush 到业务表**，而非留在 LangGraph 私有 checkpoint 表里。出图后 `onGraphSettled` 按 runOutcome 幂等补偿。

### 6.6 poison pill / 孤儿会话

- **每 thread max-resume-attempts**：某 checkpoint 让节点确定性崩溃 → 每次 resume 重崩 → 达上限强制 safe_terminate + 诚实告知，业务事实已在业务表故无损。
- **`waiting_user` TTL**：interrupt 后用户永不回 → 超时迁移，并接 commerce 回收已扣权益。

---

## 7. 包住 LangGraph 的 seam（harness ③）

### 7.1 关口完整性 = 包边界结构约束（修审计 #6）

把 router / validators / catalog / coerce / tool-repair / retry / redact-sink / provider 句柄全收进封闭包，**只导出 `invoke()`/`toolExec()` + 纯类型**：

```
ai-runtime/  package.json exports 白名单：只暴露 "."（不含 internal/*，深 import 解析失败）
  src/index.ts            ← 唯一公共出口：{ createNodeInvoke, createToolExec, 类型 }
  src/internal/           ← 物理 private
    router/catalog/validators/coerce/tool-repair/retry/redact-sink/providers/
contracts/  Zod schema + businessValidator（纯函数/数据），按 contractId 注册进 ai-runtime
ai-graphs/  节点 + 拓扑 + LangGraph；deps 仅 ai-runtime(公共面) + langgraph；无 provider SDK
```

三道硬墙（按承重）：**①能力注入而非 import**（唯一 NodeInvoke 实例在 composition root 建好，经编译期工厂闭包绑定注入，**不走 `config.configurable`**——防原始 client 顺 RunnableConfig 泄漏）；**②provider SDK 不在 ai-graphs 依赖闭包**（构建期解析失败）；**③校验器=注册表查取**（节点只给 contractId，无法塞 no-op）。配 dependency-cruiser CI 红线：

```js
forbidden: [
  // 图包禁碰任何模型 SDK（含绑 model 的 prebuilt：createReactAgent / ToolNode-with-model）
  { from:'^ai-graphs', to:'(@langchain/(openai|anthropic|community)|openai|@anthropic-ai|dashscope)' },
  { from:'^ai-graphs', to:'(createReactAgent|ToolNode)' },   // 防 prebuilt 自己调 model.invoke 绕关口
  // 全工程只有 ai-runtime/internal/providers 能碰 provider SDK
  { from:'(?!^ai-runtime/src/internal/providers)', to:'(openai|@anthropic-ai|dashscope|@langchain/(openai|anthropic))' },
  { from:'(?!^ai-runtime/src/internal)', to:'^ai-runtime/src/internal' }, // 禁深 import
  { from:'^ai-graphs', to:'^(db|domain)/src/(commerce|entitlement|payment)' }, // 图不直接写权益/支付
  { from:'^(api|domain)', to:'@langchain/langgraph' },       // 业务只走 OrchestrationPort
],
```

**真正的网络层 fail-closed = egress allowlist**（基础设施层 NetworkPolicy/出站防火墙）：ai-graphs 进程除 ai-runtime provider pool 外不允许解析任何 provider/工具 endpoint——堵住裸 `fetch()` 直打 API（不产 span、dep-cruiser 抓不到）。`provider span 无 invokeId 告警`作补充审计。

### 7.2 checkpointer wrapper（migration-on-read）

包装 `BaseCheckpointSaver`，只在 `getTuple`/`list` 注入懒迁移，**绝不旁路写 checkpoint 行**：

```ts
class MigratingCheckpointer extends BaseCheckpointSaver {
  async getTuple(cfg) {
    const t = await this.inner.getTuple(cfg); if (!t) return t;
    const from = t.checkpoint.metadata?.manifestId; // 放 metadata 而非 channel（缺失显式当 v0）
    const to = cfg.configurable.manifestId;
    if (from === to) return t;
    const v = this.chain.classify(from ?? 'v0', to);
    if (v.kind === 'none') return t;
    if (v.kind === 'lazy_payload') return { ...t, checkpoint: this.chain.apply(t.checkpoint, from, to) };
    throw new SafeTerminate(from, to, v); // topology_break/below_min → 安全终止，业务事实仍在业务表
  }
  // list() 同样覆盖；put/putWrites 透传——wrapper 只读侧变换
}
```
- 懒迁移只动既有 channel 内 payload 字段；**新增/删除/改名 channel 不靠懒迁移**（动 channel_versions/versions_seen 会炸路由），新增靠 Annotation 默认。
- `stateVersion` 缺失显式当 v0，**不信 Annotation 默认**（套默认会让迁移误判"已最新"跳过）。
- **Phase 0 只实现 `none`/`SafeTerminate` 两档，`apply()` 留空抛 SafeTerminate**；零生产数据期不建懒迁移框架（纯负债）。

### 7.3 事件账本接线（SSE 不拥有业务状态）

```
worker invoke 双校验通过 → 业务事实在业务事务内落表 + 同事务写 outbox(seq 单调)
relay 进程 poll/LISTEN outbox → Redis Stream(按 resultId 分区保序)
api SSE 端点 订阅 Stream，Last-Event-ID=seq 断点续传，出口再过一道脱敏 sink(防御纵深，非主校验)
前端 只见业务事件：progress/question_ready/waiting_user/answer_evaluated/report_ready
```
- 事件由业务事务派生（防 checkpoint↔账本双写裂脑），恢复以账本对账重放，副作用靠幂等键不重发。
- **承载事实输出先校验后整体下发，不流式裸 token**；流式只用于不承载事实的对话态 chunk，且仍经关口 `invokeStream()` 做 redact + invokeId + 经 outbox 出口（不存在绕关口的暗流式路径）。
- SSE 是纯投影、可丢可重建；relay 落后 → 有界队列 + load-shedding 背压。

### 7.4 图外幂等校验（评审 P0）

`Command({resume})` 按 thread 喂给当前 pending interrupt，**不认 questionId**。所以：
- **陈旧/重复 resume 去重在图外关口做**：controller/SSE 边界调 `resume` 前，用 questionId 比对当前 interrupt payload，stale/重复直接拒绝（防双击把 Q 的答案静默回答 Q+1）。
- **同 thread 并发 resume/invoke 取业务锁**：resume 前 `pg_advisory_xact_lock(resultId)` + resume 幂等键，抢不到返回"会话进行中"。LangGraph checkpointer 对同 thread_id 并发写不安全——"multi-instance safe"的前提是 per-thread 串行化。

---

## 8. 十年可替换 ADR

**决策**：LangGraph 藏在薄 `OrchestrationPort` 之后，业务侧（service/SSE/迁移）只依赖 port 类型。

```ts
interface OrchestrationPort {
  start(graph, threadId, input): Promise<RunHandle>;
  resume(threadId, command): Promise<RunHandle>;
  getState(threadId): Promise<RunSnapshot>;           // 只读投影，不暴露 checkpoint 内部
  streamEvents(threadId): AsyncIterable<BusinessEvent>; // 业务事件，非 token
}
// 唯一 import langgraph 的地方：LangGraphAdapter implements OrchestrationPort
```

**port 故意不暴露循环**——没有 `step()/next()`，循环/super-step/条件边全被罩死。这是"LangGraph 拥有循环"在架构边界上的兑现。

**可替换性的真正来源是状态边界，不是 port 抽象漂亮**：

| 性质 | 落点 | 换引擎时 |
|---|---|---|
| 图运行时态（走到哪节点、pending、channel_versions） | LangGraph checkpoint（引擎私有表） | **可整批丢弃** |
| 业务事实（结论/评分/权益/订单） | 业务表（status 枚举 + version） | **原样保留** |
| 已发生业务事件 | interview_event / outbox（有序持久） | **原样保留，可重投影** |

换引擎 = drain 在途 run（自然完成）+ 过期走安全终止 + 新引擎只接新流量，**绝不迁老 checkpoint**。把"换框架"从"迁移所有历史会话"降级成"停止接新会话到旧引擎 + 排空"。

### 诚实账（评审 ⑥ overclaim 修正，对面试可辩护最值钱）

**带得走（port 真保住）**：节点=单步无控制流、双校验关口、副作用走业务服务 + 幂等键、`invoke`/`hydrate`/`toolExec` 契约、事件账本、业务表——引擎无关。

**带不走（必须诚实承认）**：
1. **爆炸半径分两个 scope**：LangGraph 小版本破坏性升级 → 半径 ≈ 适配器（+checkpointer wrapper）；**整体换引擎 → 半径 = 整个 ai-graphs 包**（所有节点 + 拓扑 + 条件边 + interrupt 调用点），**不是"一个文件"**。后者别当 demo 话术。
2. **节点体内 `interrupt()`/`Command(resume)`/`getCurrentTaskInput` 是 LangGraph 原语**，换引擎全要改。port 保护的是"业务编排层（controller/service/SSE/迁移）零改动"，**不是"图代码不重写"**。
3. **重放语义本身是隐式契约**：整套幂等/memo 正确性依赖"resume = 节点从头重放 + at-least-once + 幂等点"。候选引擎必须提供等价语义，否则不在候选集——与 interrupt/durable-waiting 并列写进 port 抽不掉清单。
4. **checkpoint 是私有快照格式不是 event-sourced log**，Send/super-step 扇出在别的引擎无干净对应物。

**架构判断（写进 ADR）**：面试涉及钱/权益，**durable-execution 引擎在 exactly-once/持久化上强于 LangGraph checkpointer（后者是快照不是日志）**。成熟分工 = **LangGraph 管 LLM 推理循环、durable 引擎/业务服务管钱那条线**。"图不碰 payment"已踩在这条线上——但应明说：扣费/订单不要指望 checkpointer 给 exactly-once，由业务幂等键 + outbox 兜底。

---

## 9. 面试可辩护要点

1. **为什么循环是 LangGraph 的、harness 不是循环**：循环=回边/`Send`/`interrupt`，由 Pregel super-step 驱动、checkpointer 管 durable/resume；harness 是叠在图之上的三层纪律（节点内 invoke/toolExec 关口、图设计约定、包住 LangGraph 的 seam）。判据：写计数器决定"走哪个节点"就错了——方向盘是条件边 + checkpointer，计数器只当安全阀。机械重排走 invoke，语义重生成走图边。

2. **为什么等待用户必须落持久状态而非内存连接**：等待用户=持久 `interrupt`，进程可在等待期被杀/换实例，按同 thread_id `Command(resume)` 恢复——内存 `Map<sessionId,resolver>` 式会话进程重启即丢、不可多实例，是可恢复面试不可接受的失败模式。

3. **关口完整性为什么是结构约束不是约定**：三道硬墙（能力注入 + SDK 不在闭包 + 校验器注册表查取）+ dep-cruiser CI + egress allowlist，让"绕过 invoke"从随手能写变成需同时改三个包元数据并过 review。约定会被"图省事"绕过，只有结构 + 编译期可证 + 网络 fail-closed 才匹配项目要求。

4. **interrupt 重放双副作用/双产出怎么防**：拆 genQuestion/awaitAnswer（interrupt 前零副作用）+ turnId 确定性派生 + invoke 两阶段 ledger memoize 整个结果（重放返逐字节同值）+ 不可逆副作用走业务服务幂等键。这是 LangGraph interrupt 头号坑。

5. **为什么 report 不画进面试图**：`Send` ≠ fire-and-forget（同 thread 下一 super-step，会阻塞 invoke 返回）；subgraph 同步跑且抛错传播父 run。report 必须是独立 run/队列 job，threadId=reportId，由出图 seam 投递。

6. **tool 节点 vs 业务节点**：改钱/权益/永久记录必须是双校验后确定性执行的业务节点，不是模型可调工具；悬空 tool_call 直达 finalize 前必须合成 error ToolMessage（防 provider 400）；压缩以 (tool_call,tool_result) 配对为原子。

7. **state 是路由燃料不是数据库**：三层分级、C 层只放 ref、控制态是账本投影 checkpoint 是可丢缓存——一个原则统一收掉迁移/裂脑/并发 resume/换引擎四件事。候选人答案 0 文本进 state。

8. **十年换引擎的诚实账**：带得走的是业务事实 + 关口契约（绝不迁老 checkpoint，drain + 接新流量）；带不走的是图拓扑 + 节点内 interrupt 原语 + 重放语义契约。不赌"LangGraph 永不出问题"，赌"业务事实独立于编排引擎"，由状态边界兜底。钱那条线交 durable 引擎/业务服务，不指望 checkpointer exactly-once。

---

## 落地优先级（walking-skeleton）

1. `ai-runtime` 拆包 + 只导 invoke/toolExec + dep-cruiser 四规则 + egress allowlist 进 CI（修审计 #6 本体）。
2. 面试图：genQuestion/persistQ/awaitAnswer/evalAnswer/finalize/degrade 拆分 + turnId 确定性派生 + 两阶段 ledger + 图外 resume 去重/advisory lock。
3. 三层 state 分级 + cappedTurns + interview_event 账本写穿 + 候选人答案 0 文本。
4. OrchestrationPort + LangGraphAdapter（业务从一开始不直依赖引擎）。
5. 事件账本 outbox + SSE relay + seq 续传。
6. checkpointer wrapper 先只 none/SafeTerminate 两档；懒迁移、自主研究图/supervisor 图随真实需求进 blueprint 论证后再落地（当前为设计模式说明，未实例化）。
