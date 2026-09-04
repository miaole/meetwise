---
id: requirements_uc_cend_mock_interview
name: 用例 · 模拟面试·中断恢复·语音·补偿
description: 模拟面试·中断恢复·语音·补偿 业务用例与测试用例（正常/异常/特殊/逃逸/并发/复杂/刁钻七类，26 UC / 96 TC）。
type: reference
scope: shared
level: spec
status: active
owner: product
related:
  - ./README.md
  - ../use-case-conventions.md
  - ../../testing/conventions/test-authoring.md
---

# cend-mock-interview · 最终用例 + 测试用例文档（评审收口版）

> **🔎 实现状态（对齐真实代码 · 2026-08）** — 本文是 TARGET 规格。**✅ 已实现+接线并可跑**：自适应模拟面试核心（真 agent + 确定性核 + 真百炼模型 + CRAG 检索 + 中断/恢复、interrupt/waiting_user 持久态、SSE 业务事件、报告舱壁隔离、commerce reserve→confirm→release 结算）；**人 ↔ AI 的本机双向语音为预览版接线**：浏览器单麦克风采集 + 批量 TTS/ASR（`voice.asr.v1` / `voice.tts.v1`，独立能力 Key 存在才外呼）；VAD 可中止本机播放；超时/畸形 fail-closed，不编造转写或音频；端点为 `/transcribe`·`/speak`（`/speak/stream` 仍关闭）。流式 ASR / 服务端 turn-taking 生产/默认 fail-closed，预览须精确 `VOICE_STREAM_ASR_ENABLED=1`+`VOICE_STREAM_ASR_PREVIEW=1` 且不得编造转写。ASR 失败可退回文字。**未实现**：PSTN（公共电话交换网）号码呼叫、远端媒体轨、双人录音、说话人分离、通话纪要及其保留/删除合规闭环；这些与人 ↔ AI 双向语音是不同产品能力。**🟠 校正/部分**：出题接地 CRAG = **本地约 32 题种子库 + 联网 web-explore（默认开启，`main.ts` 6 个官方文档源作 fallback 外呼；env 设空串才关）**，未建的是**策展题库源表/审核门/扩召回**；跨会话**已接**两件——精确 hash 题目去重（`wasAsked`/`recordAskedQuestions`）+ 历史弱项**软偏置能力选择**（`biasByPastWeakness`，只重排能力、**不动分数/难度/成长曲线**），**未接**语义记忆/信念画像（`rememberFact`/`recallMemories` 为死代码，审计否决 rich 个性化）。**⬜ 规格但未全建**：文内 `VoiceTurn`/`CompensationJob` 等承重对象的完整状态机为规格，语音已能跑但未落其全部细粒度状态机。

> 领域：C 端模拟面试。覆盖 启动/出题/作答/追问/评分/中断恢复/SSE 断线重连/语音(STT·TTS·turn-taking)/暂停/结束/超长会话恢复，并收口本轮对抗评审的全部缺口。
> 命名与机制以 canonical 为准：业务聚合 **`Interview`（id = `threadId`）**，运行时记录 `AiGraphRun` 分离；四承重原语＝CAS / 幂等键 / RLS principal 绑定 / 持久有序事件日志；调用 LangGraph 时 `threadId` 以 `thread_id` 传入 `configurable`。
> 七类覆盖标注图例：**正**=正常 · **异**=异常(回滚/退款) · **特**=特殊(边界/空/首次/i18n) · **逃**=逃逸通道(降级/fallback/kill-switch/人工/安全终止) · **并**=高并发(双击/并发resume/CAS·租约) · **复**=复杂(saga/跨聚合/长会话/部分失败) · **刁**=刁钻(注入/越狱/刷分/泄题/PII/畸形/时钟漂移/停3天resume/对抗)。
> 每条异常/刁钻流必须落到机制：①状态机迁移 或 ②四原语之一。验收均绑定 config key（见 openDecisions），不硬编码阈值。

---

## 0. 收口的横切定义（消除"不可测"）

这些定义是 17/23/25/02/13 验收得以可测的前提，所有 UC 引用本节。

### 0.1 计量单元与"实质消费"（修复 12/17/23/25/26/01）
- **计费项**：`scoredQa`＝一轮"已通过双校验并落分"的问答（`InterviewQA.status=evaluated`）。会话启动另收 `sessionStartFee`（最小消费单元 = `billing.minBillableUnit`，默认 = 1 个 sessionStartFee）。
- **实质消费 consumedUnits** = `count(scoredQa where status=evaluated AND degraded=false)` × 单价 + `voiceMinutesBilled × voice.rate`（仅语音会话）。
- **降级题计费**：`degraded=true` 的 scoredQa 计 `billing.degradedWeight`（默认 0，即降级题不计入消费）——保证公平。
- **部分退公式**：`refundUnits = reservedUnits − consumedUnits`（下取整到最小单元，`refundUnits<0` 视为 0 并告警）。
- 适用：会员按"次/时长"扣，退还同口径（见 UC-INT-15）。

### 0.2 状态机落点速查（含本轮新增，详见 openDecisions）
- `Interview`：`created·active·waiting_user·**waiting_system**(排队)·**paused**·completed·abandoned·failed·**safety_hold**(危机人工接管，不可resume)`。
- `ConsumptionRecord`：`reserved·confirmed·released·**refunded**(confirmed 后退款)`。
- `VoiceTurn`(**新承重对象**)：`bot_speaking·listening·processing·barge_in`，带 `version`。
- `CompensationJob`(**新**)：`pending·compensating·compensated·failed_manual`。
- 风控：`Interview.riskState`＝`none·risk_held`；`safety_flag` 计数器（CAS 自增）。

### 0.3 事件账本（原语4）
`InterviewEvent`：append-only，**逐 `threadId` 单调 `seq`**。业务事件类型：`progress·question_ready·waiting_user·answer_evaluated·report_ready·queued·paused·resumed·degraded·safety_triggered·session_aborted`。SSE 仅承载这些业务事件，**不承载模型 token**，无业务状态。

---

## UC-INT-01 · 启动模拟面试（权益 reserve / 付费 / 会员分支）
**七类：正·异·特·逃·并·复·刁**
- **角色**：求职者
- **前置**：已登录；选定 `RoleProfile` + `InterviewService`；持有有效权益或会员额度。
- **触发**：点"开始模拟面试"，带 `clientRequestId`（幂等键）。

**主流程 Main**
1. 鉴权解析 principal，`SET LOCAL app.principal`（RLS 生效）。
2. 幂等键 `clientRequestId` 占坑：`INSERT … ON CONFLICT DO NOTHING`；命中冲突→返回首次会话（不新建）。
3. 校验跨会话并发配额（UC-INT-19，`quota.concurrentSessions`）。
4. `ConsumptionRecord` reserve：可用额度 CAS 扣减 + `idempotency_key UNIQUE`（reservedUnits = 预估题量）。
5. 创建 `Interview(status=created)` 与 `AiGraphRun(created)`，抢 thread lease。
6. 启动图 → `created→active`，emit `progress`。

**备选流 Alternate**
- A1 **会员额度分支**：第 4 步走会员 reserve（次/时长，见 UC-INT-15）而非现金权益。
- A2 **首次用户**（特）：无历史会话，引导态正常；i18n 按 `locale` 渲染题面与提示（中/英）。

**异常流 Exception**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 双击/断线重发同 `clientRequestId`（并·刁） | 幂等键 UNIQUE + ON CONFLICT | 仅一个会话、仅一次 reserve |
| E2 | 额度不足（异·特） | reserve CAS 返回 0 行 | 拒绝启动、**0 扣费**、release 任何半占 hold |
| E3 | 越权用他人 RoleProfile/Resume（刁·IDOR） | RLS principal 绑定 fail-closed | 0 行→404，不泄露存在性 |
| E4 | reserve 成功但建会话/起图崩溃（复·异） | 事务性 outbox + reconciliation（UC-INT-14） | 悬挂 reserved 被 sweeper 释放，最终不漏占 |
| E5 | 并发开同岗位多会话刷免费额度（刁·并） | 全局配额 CAS + 反滥用（UC-INT-19） | 超额拒绝 |
| E6 | 模型/图依赖不可用（逃） | fallback 到降级出题或排队（UC-INT-02/26） | 入 `waiting_system` 或降级，不静默失败 |

**后置**：`Interview∈{active,waiting_system}`；账本：`consumption_record(reserved)`、`interview_event(progress,seq=1)`、`ai_invocation_trace`、`audit(start)`。
**验收**：①同 `clientRequestId` 两次→恰 1 会话、1 条 reserved；②额度不足→0 扣费且 reserved=0 行；③越权→404 且无账本写；④reserve 后崩溃→sweeper 在 `reconcile.slaMin` 内释放。
**关联**：契约 `POST /interview`；状态机 Interview·ConsumptionRecord·AiGraphRun；原语 1/2/3；安全：输入为不可信。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-01-main | 集成 | 启动后 Interview=active、reserved 1 行、event seq=1 |
| TC-INT-01-E1 | 集成 | 同键二发→1 会话、1 reserved（DB 计数） |
| TC-INT-01-E2 | 集成(Testcontainers) | 额度=0→拒绝、consumption_record 0 行、entitlement 未变（**纯集成，非单元**） |
| TC-INT-01-E3 | 集成 | userB 用 userA RoleProfile→404、0 行 |
| TC-INT-01-E4 | 集成+混沌 | reserve 后注入崩溃→sweeper 释放 hold |
| TC-INT-01-A1 | 集成 | 会员分支扣次而非现金权益 |
| TC-INT-01-contract | 契约 | 请求/响应 + 402/409 错误体 schema |

---

## UC-INT-02 · 出题（含系统排队 waiting_system 显性态）
**七类：正·异·特·逃·并·刁**
- **角色**：系统 / AI 图
- **前置**：`Interview=active`，上下文（简历/JD）就绪。
- **触发**：图进入出题节点。

**主流程**
1. 取 RAG 语料 + `promptVersion(generator)`，invoke 出题。
2. 输出双校验：schema → 业务校验（题量、题型枚举、**无幻觉简历事实**、无泄题）。
3. 持久化 `InterviewQA(status=asked)`；`active→waiting_user`；emit `question_ready`+`waiting_user`。

**简历事实接地补充契约（当前实现）**：`grounded`（基于简历的接地题）只能在解析后至少有一条可用事实时成立；事实集为空时，图必须在调用出题模型**之前**把该题改为 `fundamental`（通用原理题），事件中的 `qkind` 也必须是 `fundamental`。事实非空时，首题用确定性题框逐字引用一条已解析事实，其他措辞只要求候选人解释做法、取舍与验证；模型不能把“后端工程师/Redis”等技能补全为电商、增长、履约时效、百分比等项目经历。这个防线不把用户本人写入简历的错误当作模型事实，但阻止系统新增候选人经历。

**备选流**
- A1 **资源紧张排队**（逃·特）：模型并发超 `interview.queue.capacity` → `active→waiting_system`，emit `queued`，排队中可见。资源就绪后 `waiting_system→active` 继续出题；超 `interview.queue.maxWaitMs` → 降级出题（UC-INT-26）或可解释失败+退款。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | schema 失败/模型瞬时失败（异·逃） | 重试分类：transient 重试、确定性拒绝不重试 | 重试或降级题 |
| E2 | 出题含幻觉简历事实（刁） | 业务校验 factuality 门 | 不入库、重生成或降级 |
| E2a | `grounded` 但事实集为空（刁·逃） | 图节点先改 `grounded→fundamental`；服务工厂纵深拒绝模型个性化调用 | `question_ready.qkind=fundamental`；题面无“你简历中提到”的虚构前提 |
| E2b | `grounded` 且事实非空，模型试图补全项目细节（刁） | 确定性 fact-frame（事实题框），只逐字引用选中的已解析事实 | 题面只带原始事实与通用追问；模型调用数=0 |
| E3 | 排队期间用户重复点"开始"（并·刁） | 状态守卫：非 `active/waiting_user` 拒绝；幂等键 | 不重复排队、不重复扣费 |
| E4 | 排队超时（异·逃·刁·时钟漂移） | `waiting_system` 持久态 + 超时 CAS | 降级 或 `failed`+`reserved→released` 退款 |
| E5 | 出题节点诱导泄露标准解（刁·泄题） | 系统指令隔离 + 输出校验"不含 referenceAnswer" | 拦截、不下发答案 |

**后置**：`Interview∈{waiting_user,waiting_system,failed}`；账本：`interview_event(question_ready/queued/waiting_user,seq)`、trace（promptVersion）。
**验收**：①排队进入/退出有持久 `waiting_system` 行与 `queued` 事件（**不复用裸 ready**）；②超 `maxWaitMs`→降级或退款，二选一可断言；③出题 0 泄题（固定对抗集 `safety.adversarialSet.version`，泄题率=0）。
**关联**：契约 `GET /interview/:id/events`；状态机 Interview(新增 waiting_system)；原语 1/4；安全：结构化输出+双校验。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-02-main | graph-fake-model | 出题→waiting_user、question_ready 事件 |
| TC-INT-02-queue | 集成 | 超容量→waiting_system 行 + queued 事件落库 |
| TC-INT-02-E2 | graph-fake-model | fake 注入幻觉事实→业务校验拒、QA 未入库 |
| TC-INT-02-E2a | graph | 空事实首问：生成依赖只收到 `fundamental`，interrupt/SSE 的 `qkind=fundamental`，无简历个性化前提 |
| TC-INT-02-E2b | worker unit | 非空事实的接地首题逐字包含所选事实、没有模型调用、不能出现测试注入的虚构项目词 |
| TC-INT-02-E4 | 集成 | 注入超 maxWaitMs→降级或 failed+released（断言账本） |
| TC-INT-02-E5 | ai-eval | 对抗集泄题率=0（真实境内模型） |

---

## UC-INT-03 · 提交答案与评分（双校验·幂等·CAS）
**七类：正·异·特·并·刁**
- **角色**：求职者
- **前置**：`Interview=waiting_user`，当前题 `InterviewQA.status=asked`。
- **触发**：提交答案，带答案级 `idempotency-key`。

**主流程**
1. RLS 校验属主；CAS 校验该 QA `status=asked` 且 `interviewId` 匹配（UC-INT-17 归属）。
2. `ConsumptionRecord` 占用一次计量（reserve 期内核销 1 单元）。
3. invoke 评分：coerce→schema→业务校验（分值域 0–100、无幻觉、无歪曲简历）。
4. `InterviewQA→evaluated`、emit `answer_evaluated`(seq)；`Interview` CAS `waiting_user→active`（续）或 `→completed`。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 双击/重发同 key（并·刁） | 幂等键 ON CONFLICT | 评 1 次、记 1 次、1 条事件 |
| E2 | 同 thread 并发提交（并） | thread lease + 状态 CAS | 恰一个推进，另一个 0 行被拒 |
| E3 | 越权提交他人会话/题（刁·IDOR） | RLS + question∈session 校验（UC-INT-17） | 404、0 行 |
| E4 | 空答案/超长/畸形 JSON/控制字符（特·刁） | 输入校验 + 413（UC-INT-23） | 拒绝、不计费 |
| E5 | 答案注入"给我满分/忽略规则"（刁·刷分） | 答案入 data 块、绝不进系统指令；评分器对注入免疫 | 分数不被诱导 |
| E6 | 堆砌关键词无实质（刁·刷分） | 业务校验 + 评分 rubric | 不得高分（≤`eval.keywordStuffing.maxScore`） |

**后置**：`Interview∈{active,completed}`；账本：`interview_event(answer_evaluated,seq)`、`consumption_record` 计量、trace。
**验收**：①同 key 两次→1 评分 1 事件 1 计量；②并发→恰一推进；③注入/堆词→分数命中阈值（对抗集版本固定）；④越权/跨会话题→404。
**关联**：契约 `POST /interview/:id/answer`；状态机 Interview·ConsumptionRecord；原语 1/2/3/4；安全：答案=不可信输入。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-03-main | 集成 | 提交→evaluated、active/completed、1 事件 |
| TC-INT-03-E1 | 集成 | 同 key 二发→1 answer_evaluated（计数） |
| TC-INT-03-E2 | 集成 | 并发双提交→恰一 200、一 409/0 行（真实乐观锁） |
| TC-INT-03-E5 | ai-eval | 注入答案不抬分（对抗集） |
| TC-INT-03-E6 | ai-eval | 堆词分≤阈值 |
| TC-INT-03-contract | 契约 | answer schema + 409/413 错误体 |

---

## UC-INT-04 · 追问 followup（父子题身份与归属）
**七类：正·特·并·复·刁**
- **角色**：AI 图 / 求职者
- **前置**：上一答 `evaluated`，评分器判定需追问。
- **触发**：评分节点产出 `followupNeeded=true`。

**主流程**
1. **新建** `InterviewQA(id=child, parentQaId=父, type=followup, status=asked)`（追问是新行，非复用），`followup_pending` 归属于父题。
2. `active→waiting_user`，emit `question_ready(parentQaId)`。
3. 用户作答→走 UC-INT-03，CAS 目标明确为该 child QA。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 并发：用户先答主题又触发追问竞态（并·复） | 父题 `followup_pending` CAS + 子题 lease | 不产生孤儿追问、推进唯一 |
| E2 | 追问无限递归刷题（刁） | `followupDepth ≤ interview.maxFollowupDepth` 守卫 | 超深→不再追问 |
| E3 | 用户拿 child questionId 跨会话越权答（刁·IDOR） | UC-INT-17 归属校验 | 404 |

**后置**：`InterviewQA(child,asked)`，父子关系持久化；事件 seq 连续。
**验收**：①追问产生独立 child 行且 `parentQaId` 正确；②深度超阈值不再追问；③child 题归属校验生效。
**关联**：契约 events(`question_ready.parentQaId`)；状态机 Interview·InterviewQA；原语 1/3。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-04-main | graph-fake-model | 追问→新 QA 行、parentQaId 链 |
| TC-INT-04-E1 | 集成 | 并发触发→无孤儿、恰一推进 |
| TC-INT-04-E2 | 单元 | depth>max→followupNeeded 被钳制 |
| TC-INT-04-E3 | 集成 | 跨会话 child id→404 |

---

## UC-INT-05 · 中断 interrupt 与同 thread resume
**七类：正·逃·并·复·刁**
- **角色**：求职者 / 系统
- **前置**：会话 `waiting_user`（持久 interrupt）。
- **触发**：用户离开后重新进入，或客户端重连请求 resume。

**主流程**
1. resume 用同 `threadId`（=resultId），LangGraph 从 **Postgres checkpointer** 恢复，不依赖内存。
2. 校验属主 + 抢 thread lease；回放快照 + 增量事件。
3. 继续等待作答或续图。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 并发双 resume（双标签页）（并·刁） | thread lease CAS | 仅一个持租、另一个被拒/只读 |
| E2 | checkpoint 缺失/损坏（异·逃） | 以业务事件账本对账重放（原语4） | 从账本重建，不双扣 |
| E3 | 内存 session 思维残留（刁） | **禁止内存 Map**；waiting 必持久态 | resume 不依赖活连接 |

**后置**：`Interview` 维持/推进；lease 归属唯一。
**验收**：①双 resume→恰一持租；②kill checkpointer 后仍能按账本恢复、事件不重不漏。
**关联**：状态机 Interview·AiGraphRun；原语 1/4；架构：waiting 持久化、Postgres checkpoint。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-05-main | graph-fake-model | resume 同 threadId 续接 |
| TC-INT-05-E1 | 集成 | 并发 resume→恰一 lease |
| TC-INT-05-E2 | 集成+混沌 | 损坏 checkpoint→账本重放、seq 连续 |

---

## UC-INT-06 · SSE 断线重连（Last-Event-ID 重放）
**七类：正·异·特·逃·并·刁**
- **角色**：求职者（前端）/ 系统
- **前置**：存在事件流。
- **触发**：网络抖动断开后重连，携 `Last-Event-ID=N`。

**主流程**
1. 重连先取 snapshot 端点，再 `seq>N` 增量重放。
2. SSE 不承载业务状态，仅重放账本事件。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 重复重连重放（并·特） | `Last-Event-ID` + 单调 seq 去重 | 仅重放 seq>N |
| E2 | 中途 kill 后重连（异·逃） | 持久事件账本 | 不丢不重 |
| E3 | 海量并发订阅（并·刁） | 背压/限流（UC-INT-25） | 不击穿、降级为轮询快照 |
| E4 | 伪造他人 threadId 订阅（刁·IDOR） | RLS principal 绑定 | 0 行/403 |
| E5 | 非法 `Last-Event-ID` → HTTP 400（逃·刁） | 失败关闭：停转 / degraded，不得用同一游标重试 | 连接 `closed` + `degraded`；自动 `open`=1 |

**后置**：客户端最终一致；账本不变。
**验收**：①`Last-Event-ID=N`→仅 seq>N；②全量重放=快照+增量等价；③越权订阅 403；④非法游标 HTTP 400 → 前端停转 / degraded，不得用同一 `Last-Event-ID` 重试（`pnpm web:prove`）。
**关联**：契约 events SSE schema；原语 3/4。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-06-main | 集成 | Last-Event-ID=N→只重放 seq>N |
| TC-INT-06-E2 | 集成+混沌 | kill 重连→不丢不重 |
| TC-INT-06-E4 | 集成 | 他人 threadId 订阅→403 |
| TC-INT-06-E5 | 单元 (`web:prove`) | `400 invalid_last_event_id` → open=1、`connection=closed`、`degraded`、fail-closed 出口；不得用同一游标再 `open` |
| TC-INT-06-contract | 契约 | event schema + eventSeq 单调（**补足契约层**） |

---

## UC-INT-07 · 语音 STT/TTS/turn-taking 与 barge-in（VoiceTurn 状态机）
**七类：正·异·特·逃·并·复·刁**
- **角色**：求职者
- **前置**：语音会话；`VoiceTurn` 落库（新承重对象）。
- **触发**：开始语音作答 / 用户打断 TTS（barge-in）。

**主流程**
1. `VoiceTurn`: `bot_speaking`(TTS 播题)→用户开口→`barge_in`→停 TTS→`listening`(STT)→`processing`(评分)→下一 turn。每次迁移 CAS+审计。
2. 半双工：同一时刻仅一方持麦（lease）。
3. STT 文本走 UC-INT-03 评分；语音按 `voiceMinutesBilled` 附加计费（0.1 节）。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | turn 竞态：bot/用户同时（并·刁） | VoiceTurn CAS（拒旧版本） | 恰一方持麦 |
| E2 | turn 死锁（双方静默）（异·逃） | `voice.turn.deadlockTimeoutMs` 超时迁移 | 自动让麦/提示重试 |
| E3 | STT 失败/低置信（异·逃·特） | 降级文字输入 fallback | 不阻塞、可文字续答 |
| E4 | 录音/原文落库或入日志（刁·PII） | 录音不落业务库、不入日志，仅瞬态处理 | 存储与日志侧无原文 |
| E5 | barge-in 注入语音越狱（刁） | STT 文本=不可信 data 块 | 不影响系统指令 |
| E6 | i18n 语音（中/英 STT·TTS）（特） | locale 路由 | 正确语种 |

**后置**：`VoiceTurn` 审计链完整；`voiceMinutesBilled` 记账。
**验收**：①turn 状态落库且迁移审计可查；②barge-in 在 `barge.cutoffMs` 内停 TTS；③死锁超时确定触发；④录音不落库/不入日志（存储+日志双侧断言）。
**关联**：状态机 VoiceTurn（新增）；原语 1/2/3/4；安全：语音=不可信输入、PII 不落。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-07-main | 集成 | turn 状态迁移序列正确落库 |
| TC-INT-07-E1(turnrace) | 集成 | CAS 拒旧 turn（真实乐观锁，**非纯单元**） |
| TC-INT-07-E2 | 集成 | 超 deadlockTimeout→让麦迁移 |
| TC-INT-07-E4(privacy) | 集成 | 存储无录音行、日志无原文（**集成，非单元**） |
| TC-INT-07-E5 | ai-eval | 语音注入不越狱 |

---

## UC-INT-08 · 暂停 paused 显式态（与 waiting_user 区分）
**七类：正·特·逃·并·刁**
- **角色**：求职者
- **前置**：`Interview∈{active,waiting_user}`。
- **触发**：用户点"暂停"。

**主流程**
1. CAS `→paused` 且写 `pausedAt`、emit `paused`。
2. resume：`paused→waiting_user/active`（同 thread）。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 重复暂停（并·刁） | CAS `status=paused` 守卫 | 幂等，第二次 0 行 |
| E2 | GC 误回收"暂停"会话（刁·特） | GC 按 `paused` 态 + `pausedAt` vs `interview.pausedTtlHours` 区分于 waiting_user | 暂停不被普通 TTL 误清 |
| E3 | 暂停期被并发 resume + GC 竞态（并·复） | lease + CAS | 恰一胜出 |

**后置**：`Interview=paused`，`pausedAt` 持久。
**验收**：①暂停产生显式 `paused` 行（**不复用 waiting_user**）；②重复暂停幂等；③GC 用 `paused` 态判定，暂停态 TTL 独立可断言。
**关联**：状态机 Interview(新增 paused)；原语 1；与 UC-INT-25 GC 协同。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-08-main | 集成 | paused 行 + pausedAt + 事件 |
| TC-INT-08-E1 | 集成 | 二次暂停→0 行（幂等） |
| TC-INT-08-E2 | 集成 | GC 跳过 paused（按 pausedTtl） |

---

## UC-INT-09 · 正常结束与 report 子图入队（commit 权益）
**七类：正·异·特·逃·复**
- **角色**：系统
- **前置**：题量达标 / 用户结束。
- **触发**：`active→completed`。

**主流程**
1. CAS `active→completed`。
2. **跨聚合 saga（非同一事务）**：图 completed（运行态）→ 事务性 outbox 派生"结算指令"→ commerce 服务 `ConsumptionRecord reserved→confirmed`（按 0.1 实际 consumedUnits，多退少补部分退）→ 入队 `AssessmentReport(pending)`，emit `report_ready` 待生成。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | completed 后、confirm 前崩溃（复·异） | outbox + reconciliation（UC-INT-14） | 重放至 confirmed，不漏结算 |
| E2 | confirm 幂等（并·特） | confirm 幂等键 | 不重复 confirm |
| E3 | 报告独立计费时机错位（异） | 报告失败走 `confirmed→refunded` 部分退（UC-INT-18） | 退对应权益 |
| E4 | 报告生成失败（逃） | 子图舱壁：不阻塞面试 | 面试 completed 不回滚，报告 failed 可重试 |

**后置**：`Interview=completed`；`ConsumptionRecord=confirmed`（部分退则配 refund 记录）；`AssessmentReport=pending`。
**验收**：①completed→confirmed 经 outbox 最终一致；②consumedUnits<reserved→自动部分退（公式 0.1）；③报告失败不回滚面试。
**关联**：状态机 Interview·ConsumptionRecord·AssessmentReport；原语 1/2/4；架构：报告子图解耦。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-09-main | 集成 | completed→confirmed、report=pending 入队 |
| TC-INT-09-E1 | 集成+混沌 | confirm 前崩溃→outbox 重放至 confirmed |
| TC-INT-09-E3 | 集成 | 少答→部分退 refundUnits 正确 |
| TC-INT-09-E4 | graph-fake-model | 报告失败→面试仍 completed |

---

## UC-INT-10 · 超长会话恢复（72h·停3天·re-auth·懒迁移）
**七类：正·异·特·逃·并·复·刁**
- **角色**：求职者
- **前置**：会话停滞 ≥3 天（>`interview.session.ttlHours=72`）。
- **触发**：用户回来 resume。

**主流程**
1. **先 re-auth**：长会话登录态必已过期 → 强制重新鉴权，刷新 principal。
2. resume 命中 prompt/schema 版本变更 → `AiGraphRun waiting_user→migrating`，懒迁移再双校验。
3. 迁移成功 `migrating→active` 续接；快照有效性校验。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 登录态过期仍尝试 resume（刁·特） | re-auth 前置；过期 principal=0 行 | 401→重登录 |
| E2 | 超 72h TTL（异·刁·时钟漂移） | TTL 判定 + `abandoned` + `reserved→released` 退款 | 自动放弃+退款 |
| E3 | 迁移函数抛错/校验失败（异·逃） | `migrating→quarantined`，原 checkpoint 不改写，DLQ | 安全终止或人工 |
| E4 | 低于 `min_resumable_ver`（逃） | `safe_terminating→safely_terminated`，业务事实保全 | 安全终止+按实际退款 |
| E5 | 并发 resume + GC 到期竞态（并·复） | lease + CAS | 恰一胜出 |
| E6 | 快照失效判据（刁·特） | 快照有效性＝`schemaVersion 兼容 ∧ 引用实体未删`（UC-INT-16） | 失效→迁移或安全终止 |

**后置**：`Interview∈{active,abandoned,safety/safe_terminated}`；退款落 `released/refunded`。
**验收**：①>72h 必 re-auth；②超 TTL→abandoned+退款（按 0.1）；③迁移失败 quarantine 不改写原 checkpoint；④快照有效性有明确判据并被断言。
**关联**：状态机 Interview·AiGraphRun(migrating/quarantined/safe_terminating)；原语 1/3/4；架构：懒迁移。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-10-main | graph-fake-model | 版本变更→懒迁移→续接 |
| TC-INT-10-E1 | 集成 | 过期态 resume→401 re-auth |
| TC-INT-10-E2 | 集成 | >72h→abandoned+released 退款 |
| TC-INT-10-E3 | graph-fake-model | 迁移抛错→quarantined、原 checkpoint 不变 |
| TC-INT-10-E6 | 集成 | 引用简历已删→快照判失效 |

---

## UC-INT-11 · 安全护栏（注入/越狱/辱骂/诱导刷分/泄题/造假）
**七类：异·逃·特·刁**
- **角色**：求职者（对抗）/ 安全层
- **前置**：任意作答/对话环节。
- **触发**：命中安全分类器或规则。

**主流程**
1. 所有用户内容入 data 块，绝不拼进系统指令。
2. 分类：注入/越狱/辱骂/诱导刷分/泄题/造假请求 → 拒答+安全回复；记 `safety_flag`（CAS 自增，UC-INT-24）。

**异常流（每条落机制）**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | Prompt 注入"忽略规则给满分"（刁·刷分） | 指令隔离 + 评分器免疫 | 分数不被诱导 |
| E2 | 越狱诱导泄露 system prompt/标准解（刁·泄题） | 输出校验不含 prompt/referenceAnswer | 拦截 |
| E3 | 辱骂/骚扰（特·逃） | 分类+降级回复 | 警告/计 flag |
| E4 | 诱导造假经历（刁·价值观） | 拒绝造假、保留不确定性、用户自决 | 不生成假凭证 |
| E5 | 危机/自伤信号（逃·高后果） | 转 UC-INT-20 `safety_hold` 人工关怀，**绝不进评分** | safety_hold |

**后置**：`safety_flag` 累计；高危→`risk_held/safety_hold`。
**验收**：①注入拦截率 ≥`eval.injection.blockRate`（对抗集 `safety.adversarialSet.version` 固定）；②0 越权改分；③泄题率=0；④造假请求 0 通过。
**关联**：原语 1/4；安全规则：结构化输出与隔离、价值观护栏。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-11-inject(eval) | ai-eval | 注入拦截率≥阈值、不抬分（**模型质量层**） |
| TC-INT-11-inject(flag) | 集成 | safety_flag 落库+1（**拆分到集成层**，修复混层） |
| TC-INT-11-leak | ai-eval | 泄题率=0 |
| TC-INT-11-fake | ai-eval | 造假请求被拒 |

---

## UC-INT-12 · 消费计量与退款比例规则（实质消费定义）
**七类：正·异·特·复·刁**
- **角色**：commerce 服务 / 系统
- **前置**：存在 reserved 的会话。
- **触发**：会话结束/失败/放弃/退款。

**主流程**
1. 按 0.1 计算 `consumedUnits`（仅 `evaluated ∧ ¬degraded` 计入）。
2. `refundUnits = reservedUnits − consumedUnits`（部分退）。
3. completed→`confirmed`（核销 consumed）+ 退还 refundUnits（`released` 或 `refunded`）。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 重复退款（并·刁） | 退款幂等键 UNIQUE | 不重复退 |
| E2 | consumedUnits 计算与 evaluated 计数漂移（刁） | 以事件账本 answer_evaluated 计数为准（原语4） | 一致 |
| E3 | 降级题被计费（异·公平） | degradedWeight=0 | 降级不扣 |
| E4 | 全未实质消费（特·首次崩溃） | refundUnits=reservedUnits 全退 | 全额退 |

**后置**：`ConsumptionRecord∈{confirmed,released,refunded}` + refund 记录。
**验收**：①公式可断言：reserved=5、evaluated=3、降级=1→consumed=2、refund=3；②重复退款幂等；③降级题 0 计费。
**关联**：状态机 ConsumptionRecord(新增 refunded)；原语 1/2/4。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-12-formula | 集成 | 多场景退款单元数=公式值 |
| TC-INT-12-E1 | 集成 | 二次退款→0 行（幂等键） |
| TC-INT-12-E3 | 集成 | 降级题不计 consumed |
| TC-INT-12-selfgrade | 单元/静态 | 断言生成器 promptVersion≠评分器 promptVersion 且 validator 独立模块（**禁 AI 自评，改静态，修复混层**） |

---

## UC-INT-13 · 补偿失败二次兜底（compensating→failed→人工·DLQ）
**七类：异·逃·并·复·刁**
- **角色**：系统 / 运维
- **前置**：触发退款/补偿。
- **触发**：补偿动作执行失败。

**主流程**
1. `CompensationJob: pending→compensating`（带补偿幂等键）。
2. 成功→`compensated`；失败超重试→`failed_manual` 入 **DLQ**，告警人工兜底。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 补偿本身失败（异·逃） | `compensating→failed_manual`+DLQ | 人工接管，不静默丢 |
| E2 | 补偿重试重复退款（并·刁） | 补偿幂等键 | 至多退一次 |
| E3 | DLQ 重放与人工并发处理（并·复） | job lease CAS | 恰一处理 |

**后置**：`CompensationJob∈{compensated,failed_manual}`；DLQ 有记录。
**验收**：①补偿失败必落 `failed_manual`+DLQ+告警（**补足：不只测"触发退款"**）；②重试不重复退；③人工/重放恰一处理。
**关联**：状态机 CompensationJob(新增)；原语 1/2。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-13-main | 集成 | 补偿失败→failed_manual+DLQ 行+告警 |
| TC-INT-13-E2 | 集成 | 重试→1 次退款 |
| TC-INT-13-E3 | 集成 | 并发处理→恰一胜出 |

---

## UC-INT-14 · 悬挂 hold 对账清扫（orphaned reserved sweeper）
**七类：异·特·并·复·刁**
- **角色**：后台 reconciliation job
- **前置**：存在 `reserved` 但会话已终态/不存在。
- **触发**：周期 sweeper（带 principal 注入）。

**主流程**
1. 扫描 `reserved` 且 `createdAt > reserve.orphanTtlMin` 且无对应活跃会话。
2. CAS `reserved→released` 回补额度，记审计。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | reserve 后崩溃永不 commit（复·异） | sweeper 释放 | 最终不漏占 |
| E2 | sweeper 与正常 confirm 竞态（并） | CAS（confirm 已改态则 sweeper 0 行） | 不误退已结算 |
| E3 | sweeper 路径忘带 principal（刁·越权） | RLS 强制 principal | 不跨租户清扫 |

**后置**：孤儿 hold 归零。
**验收**：①孤儿 reserved 在 `reconcile.slaMin` 内释放；②不误退 confirmed；③sweeper 带 principal。
**关联**：原语 1/3；与 UC-INT-01-E4 闭环。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-14-main | 集成 | 孤儿 reserved→released |
| TC-INT-14-E2 | 集成 | 与 confirm 竞态→不误退 |
| TC-INT-14-E3 | 集成 | 无 principal sweep→0 行 |

---

## UC-INT-15 · 会员额度语义（reserve/commit/refund·期中过期·跨周期重置）
**七类：正·异·特·并·刁**
- **角色**：求职者（会员）
- **前置**：有效会员，周期额度（次/时长）。
- **触发**：会员会话启动/结束。

**主流程**
1. reserve 扣会员"次/时长"（CAS）。
2. completed→commit（核销实际 consumed，多退少补按次/时长）。
3. 跨周期：到期重置额度，未用不结转（或按策略结转，绑 config）。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 会话进行中会员期中过期（异·刁·时钟） | reserve 期内冻结已占；过期不追扣，未消费部分退 | 公平 |
| E2 | 跨周期重置与在途 reserve 竞态（并·复） | 额度版本 CAS | 不超发不丢额 |
| E3 | 退款退什么（次/时长）（特） | 按 reserve 口径退同单位 | 一致退还 |

**后置**：会员额度账本一致。
**验收**：①期中过期→已占冻结、未消费退；②重置不超发；③退按次/时长同口径。
**关联**：原语 1/2；与 UC-INT-12 部分退公式共用。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-15-main | 集成 | 会员 reserve/commit/refund 按次扣还 |
| TC-INT-15-E1 | 集成 | 期中过期→未消费退、不追扣 |
| TC-INT-15-E2 | 集成 | 重置×在途→额度守恒 |

---

## UC-INT-16 · 会话进行中数据生命周期（简历删/注销/岗位下架/删除权）
**七类：异·特·逃·并·复·刁**
- **角色**：求职者 / 系统
- **前置**：会话非 paused 的进行中态，引用简历/岗位/账号。
- **触发**：进行中简历被删 / 账号注销 / 岗位下架。

**主流程**
1. 引用实体删除时打 `referenceInvalid` 标记（软删/版本钉）。
2. 会话 resume/续图前校验引用有效性（UC-INT-10-E6）；失效→安全终止或降级。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 进行中简历被删（刁·复） | 快照引用版本钉 + 有效性校验 | 用快照续或安全终止 |
| E2 | 账号注销（GDPR/PIPL 删除权）（异·逃·刁） | 级联：终止会话+退款+PII 擦除（保留脱敏审计） | safety/abandoned + 删除合规 |
| E3 | 岗位下架（特） | 引用失效→降级/终止 | 可解释 |
| E4 | 删除与并发 resume 竞态（并） | CAS + RLS | 恰一胜出，不读已删 |

**后置**：会话安全收口；PII 合规擦除；退款落账。
**验收**：①注销→会话终止+退款+原文擦除（断言存储无原文）；②进行中删简历→快照判定有效性；③删除路径带 principal（RLS）。
**关联**：原语 1/3/4；隐私：删除权、PII 不留。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-16-E1 | 集成 | 删简历→快照失效路由 |
| TC-INT-16-E2 | 集成 | 注销→终止+退款+原文删除 |
| TC-INT-16-E4 | 集成 | 删除×resume→不读已删行 |

---

## UC-INT-17 · question∈session 归属校验（防 IDOR 越权）
**七类：异·并·刁**
- **角色**：求职者（对抗）
- **前置**：持有某 `questionId`。
- **触发**：对 `interviewId` 提交答案/读取，携跨会话 `questionId`。

**主流程**
1. 除 RLS owner 校验外，强制 `WHERE qa.id=$qid AND qa.interview_id=$iid AND qa.status=asked`（CAS）。
2. 不匹配→0 行→404。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 跨会话 questionId 越权答（刁·IDOR） | 归属谓词 + RLS | 404、0 行 |
| E2 | 并发改 QA 状态绕过（并） | CAS on `status=asked` | 恰一推进 |

**后置**：无越权写。
**验收**：①属 A 的 questionId 对 B 会话提交→404、A/B 账本不变；②并发→恰一。
**关联**：原语 1/3；修复 UC-INT-03 IDOR 缺口。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-17-idor | 集成 | 跨会话 qid→404、0 行 |
| TC-INT-17-cas | 集成 | 并发→恰一推进 |

---

## UC-INT-18 · report 子图幂等（防重复报告/重复退款）
**七类：异·并·复·刁**
- **角色**：报告子图
- **前置**：`AssessmentReport=pending`。
- **触发**：报告 job 领取（可能重复触发）。

**主流程**
1. report IDEM 键 =（`interviewId` + `reportAttemptKey`），领取用 lease CAS。
2. `pending→generating→completed`；幂等保证至多一份成功报告。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 重复触发 report（并·刁） | report IDEM 键 + lease CAS | 至多一份报告 |
| E2 | 报告失败重试重复退款（复·异） | 退款幂等键（UC-INT-13） | 至多退一次 |
| E3 | 生成校验失败（异·逃） | `generating→failed`，可重试 pending | 不阻塞面试 |

**后置**：`AssessmentReport∈{completed,failed}`，唯一报告。
**验收**：①重复触发→1 份报告（**补足主流程缺的 IDEM 键**）；②失败退款不重复；③报告失败不影响 Interview。
**关联**：状态机 AssessmentReport·ConsumptionRecord；原语 1/2；舱壁。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-18-idem | 集成 | 多次触发→1 completed 报告 |
| TC-INT-18-E2 | 集成 | 失败退款幂等 |

---

## UC-INT-19 · 跨会话并发权益与反滥用配额（多岗位叠加 hold）
**七类：异·并·复·刁**
- **角色**：求职者（薅）/ 系统
- **前置**：用户已有 N 个活跃 hold。
- **触发**：并发开多个不同岗位会话。

**主流程**
1. 启动前全局配额 CAS：`activeHolds < quota.concurrentSessions` 且 `freeQuotaUsed ≤ limit`。
2. 超额拒绝。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 并发多岗位叠加 hold 超发（并·刁） | 全局配额 CAS（用户级计数行） | 恰允许至上限 |
| E2 | 薅免费额度（刁·复） | 免费额度幂等+计数 CAS | 不超额 |

**后置**：配额守恒。
**验收**：①并发 N+1 启动→恰 N 成功、1 拒绝（断言计数）；②免费额度不超发。
**关联**：原语 1/2/3。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-19-quota | 集成 | 并发启动→恰至上限 |
| TC-INT-19-free | 集成 | 薅免费→超额拒绝 |

---

## UC-INT-20 · 危机/安全终止显式持久态 safety_hold（确定性路由）
**七类：逃·异·特·刁**
- **角色**：安全层 / 人工
- **前置**：命中危机/自伤分类。
- **触发**：分类器命中。

**主流程**
1. **确定性路由**：命中→必进关怀分支，**绝不进评分**；CAS `→safety_hold`，emit `safety_triggered`，暂停评分。
2. 切人工关怀；`safety_hold` 不可 resume（待人工处置/安全终止）。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 危机信号被当普通答案评分（刁·高后果） | 状态机路由前置于评分节点 | 必入 safety_hold |
| E2 | safety_hold 被 resume（刁） | 终态守卫，禁 resume | 拒绝 |
| E3 | 命中后计费（异·公平） | safety 终止→按 0.1 退未消费 | 退款 |

**后置**：`Interview=safety_hold`；退款落账；人工工单。
**验收**：①分类命中→100% 进关怀、0% 进评分（确定性集成断言，**不只靠概率 ai-eval**）；②safety_hold 拒 resume；③退未消费。
**关联**：状态机 Interview(新增 safety_hold)；原语 1/4；安全：危机护栏。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-20-route | 集成 | 命中→safety_hold、未调评分节点（确定性） |
| TC-INT-20-quality | ai-eval | 危机召回率≥阈值（对抗集） |
| TC-INT-20-resume | 集成 | safety_hold resume→拒绝 |

---

## UC-INT-21 · kill-switch 对在途 running 会话处置（冻结/降级）
**七类：逃·异·并·复·刁**
- **角色**：运维 / 系统
- **前置**：kill-switch flip。
- **触发**：某 graph/模型被紧急下线。

**主流程**
1. flip 不仅拦新会话；在途 `active` 会话经 `active→paused`（AiGraphRun paused）冻结或切降级模型（UC-INT-26）。
2. emit `paused`，可解释提示，恢复后续。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | flip 时在途会话无处置（逃·异） | 在途扫描 + CAS 冻结/降级 | 不悬挂、不静默错 |
| E2 | flip 与 resume 竞态（并·复） | lease + CAS | 恰一胜出 |
| E3 | 冻结期计费（公平） | 冻结不计 consumed | 公平 |

**后置**：在途会话 `paused`/降级，可恢复或安全终止。
**验收**：①flip→在途 running 全部冻结/降级（断言无遗留 active 调被禁图）；②竞态恰一；③冻结不计费。
**关联**：状态机 Interview·AiGraphRun(paused)；原语 1。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-21-flip | 集成 | flip→在途会话冻结/降级、无遗留 |
| TC-INT-21-E2 | 集成 | flip×resume→恰一 |

---

## UC-INT-22 · eventSeq 单调分配器（api+worker 多写者一致）
**七类：异·并·复·刁**
- **角色**：api / worker（双写者）
- **前置**：同 `threadId` 事件由 api 与 graph worker 都可写。
- **触发**：并发写事件。

**主流程**
1. 逐 `threadId` 单调 seq 分配：业务事务内 `SELECT max(seq)+1 … FOR UPDATE`（或序列），事件由事务性 outbox 派生，api/worker 共用同一写入器。
2. 唯一约束 `(threadId, seq)`。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 双写者并发抢同 seq（并·刁） | `(threadId,seq)` UNIQUE + 行锁/序列 | 无重号、无空洞 |
| E2 | 乱序到达（刁·时钟漂移） | seq 由 DB 分配非客户端时钟 | 单调 |
| E3 | outbox 重放重复事件（异） | 事件幂等键 | 不重发 |

**后置**：事件流单调连续。
**验收**：①api+worker 并发各写 100 事件→seq 连续无重无洞；②乱序不破坏单调。
**关联**：原语 1/4；支撑 UC-INT-06/18。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-22-mono | 集成 | 双写者并发→seq 无重无洞（真实 DB） |
| TC-INT-22-contract | 契约 | eventSeq 单调性 schema 约束 |

---

## UC-INT-23 · 错误响应契约（401/403/409/413/429 schema）
**七类：异·特·刁**
- **角色**：前端 / 契约
- **前置**：契约 `packages/contracts`。
- **触发**：各类失败响应。

**主流程**
1. 所有错误体遵循统一 `Problem` schema（code/message/traceId，**不含 PII/prompt**）。
2. 覆盖 401(未认证)、403(越权)、409(冲突/状态非法)、413(超长)、429(限流)。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 错误体漂移（异·刁） | 契约 schema-diff 门禁 | 前后端不漂移 |
| E2 | 错误体泄露 PII/prompt（刁·隐私） | 脱敏约束 + 契约断言 | 不泄露 |

**后置**：错误响应契约锁定。
**验收**：①401/403/409/413/429 各有 schema 契约测试（**补足：不只测 happy schema**）；②错误体无 PII/prompt。
**关联**：契约；隐私规则。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-23-errors | 契约 | 5 类错误体匹配 Problem schema |
| TC-INT-23-pii | 契约/单元 | 错误体无 PII/prompt 字段 |

---

## UC-INT-24 · 风控计数与会话级 risk_held（safety_flag CAS 计数）
**七类：异·逃·并·刁**
- **角色**：安全层
- **前置**：会话存在。
- **触发**：多次命中越界/辱骂/诱导。

**主流程**
1. 每次命中 `safety_flag += 1`（CAS 自增计数器）。
2. 累计 ≥`safety.session.maxFlags` → `riskState=risk_held`，会话降级/限制/转人工。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 并发命中计数丢失（并·刁） | CAS 自增（非 read-then-write） | 计数精确 |
| E2 | 累计触发会话风控（异·逃） | `→risk_held` 状态迁移 | 降级/人工 |
| E3 | 刷量绕过（刁） | 计数持久+阈值 config | 必触发 |

**后置**：`safety_flag` 计数持久；高危 `risk_held`。
**验收**：①并发命中→计数精确无丢（断言=N）；②达阈值→risk_held（**修复"风控无状态/无计数原语"**）。
**关联**：原语 1/4；安全。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-24-count | 集成 | 并发命中→safety_flag=N |
| TC-INT-24-held | 集成 | 达阈值→risk_held 迁移 |

---

## UC-INT-25 · 海量会话 TTL GC 批处理限流与 SSE 订阅背压
**七类：异·特·逃·并·复**
- **角色**：后台 GC / SSE 网关
- **前置**：大量会话同时 TTL 到期 / 海量并发订阅。
- **触发**：批量 GC 窗口 / 订阅峰值。

**主流程**
1. GC 批处理：分批 + 限流（`gc.batchSize`/`gc.rateLimit`），区分 `paused`(按 pausedTtl) 与 `waiting_user`(按 sessionTtl)，CAS `→abandoned`+退款。
2. SSE 背压：超 `sse.maxSubscribers` → 降级为快照轮询，限流保护。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 海量到期击穿 DB（异·并·复） | 分批限流 + lease | 平滑回收 |
| E2 | GC 误清暂停会话（刁·特） | 按 paused 态/pausedTtl 区分 | 暂停不误清 |
| E3 | SSE 海量订阅背压（并·逃） | 背压+降级轮询 | 不击穿 |

**后置**：到期会话 `abandoned`+退款；SSE 稳定。
**验收**：①万级到期→限流分批回收、无 DB 击穿；②paused 不被普通 TTL 清；③订阅超阈降级轮询。
**关联**：原语 1；与 UC-INT-08/06 协同。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-25-gc | 集成 | 批量到期→分批限流回收+退款 |
| TC-INT-25-paused | 集成 | paused 不被 GC |
| TC-INT-25-backpressure | 集成 | 超订阅→降级轮询 |

---

## UC-INT-26 · 降级题下游一致性（评分基线/报告标注/计费公平）
**七类：异·特·逃·复·刁**
- **角色**：AI 图 / 报告 / commerce
- **前置**：发生降级出题（依赖失效/超时/kill-switch）。
- **触发**：降级路径产生 `degraded=true` 题。

**主流程**
1. 降级题标 `degraded=true`，评分用降级基线 rubric。
2. 报告标注"含降级题"；计费 `degradedWeight=0`（不计 consumed，UC-INT-12）。

**异常流**
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 降级题按正常计费（异·公平·刁） | degradedWeight=0 | 不扣费 |
| E2 | 报告不标降级（特） | 报告必含 degraded 标注 | 可解释 |
| E3 | 降级与正常题评分基线混淆（复） | 评分 rubric 按 degraded 分支 | 基线一致 |

**后置**：降级题计费=0、报告标注、评分基线明确。
**验收**：①降级题 0 计费；②报告含降级标注；③降级评分走专用基线（断言 rubric 分支）。
**关联**：原语 1；与 UC-INT-02/12/21 协同。

**测试用例**
| TC | 层 | 断言 |
|---|---|---|
| TC-INT-26-bill | 集成 | 降级题不计 consumed |
| TC-INT-26-report | graph-fake-model | 报告含 degraded 标注 |
| TC-INT-26-rubric | 单元 | 降级走降级 rubric 分支 |

---

## 附录 A · 评审意见 → 用例映射（收口对照）
| 评审条目 | 收口位置 |
|---|---|
| 退款/补偿自身失败 | UC-INT-13 |
| 计费计量边界/实质消费 | §0.1 + UC-INT-12 |
| 会员额度语义 | UC-INT-15 |
| 跨聚合 saga 原子边界/outbox | UC-INT-09-E1 + §0.1 |
| 悬挂 hold 对账 | UC-INT-14 |
| 批量 TTL GC / SSE 背压 | UC-INT-25 |
| 进行中数据生命周期 | UC-INT-16 |
| 长会话 re-auth | UC-INT-10-E1 |
| waiting_system 排队显性态 | §0.2 + UC-INT-02-A1 |
| paused 显式态 | §0.2 + UC-INT-08 |
| 风控计数/会话风控态 | UC-INT-24 |
| 危机 safety_hold 终态+确定性路由 | UC-INT-20 |
| 语音 VoiceTurn 落库枚举 | §0.2 + UC-INT-07 |
| followup 身份/归属 | UC-INT-04 |
| confirmed→refunded 迁移 | §0.2 + UC-INT-12 |
| kill-switch 在途处置 | UC-INT-21 |
| question∈session IDOR | UC-INT-17 |
| report 子图幂等 | UC-INT-18 |
| 跨会话并发配额 | UC-INT-19 |
| eventSeq 多写者 | UC-INT-22 |
| 错误响应契约 | UC-INT-23 |
| 降级题下游 | UC-INT-26 |
| IDEM 键 TTL | §openDecisions(idem.ttlDays) + UC-INT-01-E1 |

## 附录 B · 测试层映射修正（采纳评审第五节）
- TC-INT-01-E2 释额：单元→**集成(Testcontainers)**。
- TC-INT-11-inject：拆 **ai-eval(不抬分)** + **集成(safety_flag 落库)** 两层。
- TC-INT-12-selfgrade：ai-eval→**单元/静态**（生成器≠评分器 promptVersion、validator 独立）。
- TC-INT-07-E4(privacy)：单元→**集成**（存储+日志双侧）。
- TC-INT-07-E1(turnrace)、TC-INT-22-mono、TC-INT-29-skew 类竞态：单元→**集成**（真实乐观锁）。
- UC-INT-06/18 补 **契约层** eventSeq 单调 + 错误体 schema。
- UC-INT-20/UC-INT-11 高后果：ai-eval **叠加确定性集成**路由断言。
- 双实例 failover（resume 多实例安全）：标 **混沌/双实例**，禁同进程假验收。
