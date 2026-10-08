# Harness — **TOKSTREAM · 模型输出 token 流式透传设计刀**（进度事件 → 完整流式 → 报告同构 · 分阶段落地案 · docs REQUEST · `draft:awaiting_pre_exec_dual` · ≠ 已流式 ≠ 产品码已动）

**Status**: **`draft:awaiting_pre_exec_dual`**（**设计刀 · docs REQUEST only** · 本 turn **Ban 碰产品码**（apps/packages/scripts 零字节）· Ban prove 执行 · Ban live 调用 · Ban 改共享 SSOT（backlog/checklist/matrix/queue 零触碰）· Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何阶段落地效果）
**Pins（十值原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**
**Date**: 2026-10-07
**Line**: **TOKSTREAM**（模型输出 token 流式透传 · 用户直裁驱动：「大模型吐的 token 和思考过程是不是事实展现前端？让用户一直 loading 不好」）
**授权链**: 用户直裁（token/思考过程应事实展现前端 · 反对题间无进展 loading）→ 审计确认现状（invoke 非流式 · 前端只收离散成品事件 · 题间零进展反馈）→ **协调方立本设计刀（docs-only）** → 本 REQUEST → pre-exec 双审（**mw-model-op + mw-e2e-ha**）→ 裁定两案取舍与阶段1 EXEC 面 → 阶段1 另刀授权落地；**阶段2/3 均须另刀授权**（本刀只交设计）。
**Base**: `origin/feat/mysql-schema-skeleton` **`0fe96fca`**（full `0fe96fca007d1de740eb699eede94c28febfcaa2` · `git fetch origin` 后实测 `origin/feat/mysql-schema-skeleton`=`0fe96fca` 与预期 ≥`0fe96fca` 恰等 · 无 drift 无 rebase）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-tokenstream` · branch `line/model-token-stream`
**Experts**: `mw-model-op` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — 设计刀授权链如上；双审 PASS ≠ 阶段1 EXEC 授权 ≠ 阶段2/3 立项授权。

---

## 0. 本 turn 只读纪律声明（Ban coding 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 模型调用、零 Key 加载、零 DB 连接、零产品码改动**，证据全部来自只读源码亲读（行号一律 @`0fe96fca`）与在案 docs 引用（backlog `:74`/`:95` · `harness/redis-streams-wakeup.prototype.md` · `harness/gap-mop-01-wakeup-notify-rec.md`）。**供应商流式支持面（dashscope compatible-mode `stream:true` SSE）本刀只引用其 base URL 配置事实（`dashscope-native-config.ts:125`），实际行为核实属阶段2 EXEC 前置门**（§5.1），本刀零 live 验证、不预claim 供应商行为。

## 1. 现状锚（审计确认 · 行号 @`0fe96fca`）

### 1.1 生成侧（worker · 全部非流式单发）

| 调用面 | 位置 | 逻辑服务 / operation | 流式 |
|--------|------|----------------------|------|
| 押题生成 | `apps/worker/src/interview-service.ts:200-204` | `resume-quiz.generate` / `interview.quiz-generation.v1` | 否 |
| 简历诊断 | `apps/worker/src/interview-service.ts:231-248` | `resume-diagnosis.generate` / `resume.diagnosis.v1` | 否 |
| 一题一评 | `interview-service.ts:132-135`（`invokeEvaluationOnce` primary）→ `:261-278` `evaluateAnswer` | `mock-interview.evaluate` | 否 |
| **报告叙述** | `interview-service.ts:281-295`（**:283-284** `reportGenerator` 内 `await invoke`） | `report.generate` / **`report.narrative.v1`** | 否 |
| 面试规划 | `apps/worker/src/adaptive-interview-service.ts:48-52` | `planner.competencies` | 否 |
| **下一题生成** | `adaptive-interview-service.ts:143-154` | `interviewer.ask` | 否 |
| 路由分类 / OCR | `packages/ai-runtime/src/job-route-classify.ts:164` · `resume-ocr.ts:133` | 后台 · 无 SSE 面 | 否 |

### 1.2 网关与传输（invoke 单发契约）

- **invoke 关口**（`packages/ai-runtime/src/invoke.ts:403`）：`plan.execute(signal)` 返回**单个** `ModelResult`（`:635` 一次性 `await`）；durable claim → admission → 派发边界 → 双校验（`:707` doubleValidate）→ settle/complete，全链对「流中帧」零概念。执行/传输超时缺省 35s/30s（`:238-239`）。
- **模型适配器**（`packages/ai-runtime/src/model-client.ts:392` `chatUrl = ${baseUrl}/chat/completions` · `:400-419` `dispatchOnce = fetchJsonWithTimeout<…>` 一次性 JSON POST · `:412` `response_format:{type:'json_object'}`）——**非 stream**。
- **供应商端点**：`packages/ai-runtime/src/dashscope-native-config.ts:125` `compatibleBaseUrl = ${httpBase}/compatible-mode/v1`（OpenAI-compatible 面）。
- **流式先例（repo 内）**：`packages/ai-runtime/src/voice-stream.ts` —— 流式 ASR/TTS seam 以「fail-closed 缺省 + 预览双 flag + fake seam 供隔离 prove」形态存在，**产品组合从不 wired live**。本刀阶段2 的流式升级沿此纪律形制（flag 门 + fake seam prove + Ban 无门直开）。

### 1.3 事件通道（durable 事件表 → SSE 轮询 → 前端）

- **写入原语**：`packages/db/src/interview-event.ts:17` `appendEvent`（advisory 事务锁串行 + `INSERT…SELECT MAX+1` 原子分配 seq + `event_key` 幂等 + 0126 raw-answer 围栏）。
- **worker 写事件**：quiz 流 `apps/worker/src/quiz-lifecycle.ts:37`（`progress{stage:'generating'}` · **既有唯一进度形态**）→ `:42` 图单发 → `:62` 逐题 `question_ready` → `:63` `quiz_ready`；interview 流 `apps/worker/src/adaptive-lifecycle.ts:158`/`:295` `question_ready`（`:161`/`:298` event_key 幂等）· `:257`/`:291` `answer_evaluated` · `:278` `clarification_needed`；报告流 `apps/worker/src/report-worker.ts:46`（图单发）→ `:55` `report_ready`。
- **API SSE**（`apps/api/src/modules/interview/interview.controller.ts:250-286`）：**:259** `writeHead(200,{'content-type':'text/event-stream'…})` → catch-up 重放（Last-Event-ID）→ **`:276-283` hold + 每 2000ms 轮询 tail**（`:277` sleep 2000）+ 心跳 `: ping` · 每连接 per-principal 槽位 ≤5（`:256`）· 10min 封顶（`:275`）。读面 `apps/api/src/modules/interview/interview.service.ts:946-950`（`SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2`）。
- **前端消费**（`apps/web/lib/stream/interview-stream.ts:29` `runInterviewStream`）：decodeSSE → `toBusinessEvent` → `applyEvents` 归约 `InterviewView`；Last-Event-ID 重连续推（`:49`）· seq 水位去重（`:65`）· buffer 1MB 封顶（`:32`）。**事件目录白名单**在 `apps/web/lib/stream/business-events.ts:20-57`（zod discriminatedUnion，未知 kind 被静默丢弃）；`progress` kind 已存在但载荷为宽松 record，且 interview 视图**当前直接忽略**（`apps/web/lib/stream/interview-state.ts:128` `case 'progress': break`；对照 quiz 视图 `quiz-state.ts:45` 会置 `phase='generating'`）。
- **loading 现状**：题间（`answer_evaluated` → 下一 `question_ready`）与报告期（session 收尾 → `report_ready`）前端只有 phase 级 spinner（QuizPanel/DiagnosisPanel `generating` 文案），**零真实进展信号**——即用户直裁的「一直 loading 不好」。

### 1.4 与本刀接壤但不属本刀的面（SSE-PUSH 刀域）

worker→API 进程间通知 = **GAP-MOP-01 `:74` wakeup 工作面**（生产 LISTEN/NOTIFY `meetwise_worker_wakeup_v1` lossy · Redis Streams 仅 flag 关旁路原型）+ **BUG-NOTIFY-REC `:95`**（强制 periodic reconcile 未证）。本刀**只声明接口契约（§6）不实现、不改 wakeup、不改 SSE 轮询循环**。

## 2. 阶段总览（分阶段落地 · 每阶段独立授权边界）

| 阶段 | 内容 | 风险 | 授权 |
|------|------|------|------|
| **阶段1（先行独立刀）** | **生成进度事件**：worker 在模型调用各阶段写轻量进度事件（`generation_started`（含预估段）/ `model_first_token`（首 token 时刻）/ `generation_progress`（节流））→ 前端 loading 变真实进度（阶段名 + 首 token 延迟 + token 计数）。**不含生成内容帧**——invoke 契约、业务事件、题面语义零变。 | 低（additive 事件 + 前端归约；零 invoke 语义变） | **本刀裁定两案后另立 EXEC 刀** |
| **阶段2（完整流式）** | invoke 传输面升级 `stream:true`（供应商支持面核实为前置门）→ worker 增量帧 → **经阶段1 建立的推送通道** → 前端逐 token 渲染题干（打字机/即显 = UX 产品裁示面）；思考过程展示两案（§5.4）。 | 中（改 model-client 传输 + invoke 观察缝 + SSE 写频） | **另刀授权**（本刀只交设计） |
| **阶段3（报告同构）** | `report.narrative.v1`（`interview-service.ts:283-284` 调用面）走同一管道（阶段1 进度 → 阶段2 增量帧），report-worker 触发面同构接入。 | 低（复用已落管道） | **另刀授权** |

**顺序钉死**：阶段1 先行（独立刀）；阶段2 依赖阶段1 的推送通道与前端进度视图；阶段3 依赖阶段2 的增量帧管道。**任何阶段落地 ≠ 本设计被证明生产就绪**（prove 面见 §3.6/§5.6）。

## 3. 阶段1 设计 — 生成进度事件（低险高值 · 先行）

### 3.1 触发面（哪些模型调用写进度 · 分优先级）

| 优先级 | 触发面 | 事件流挂点 | 用户可见性 |
|--------|--------|-----------|-----------|
| P0（本题面） | 下一题生成 `interviewer.ask`（`adaptive-interview-service.ts:143`） | 图 generate 包装层 | 题间等待 spinner → 真实进度 |
| P0（本题面） | 押题生成 `resume-quiz.generate`（`interview-service.ts:200`） | `quizGenerator` 包装层 | quiz 首屏 `generating` → 进度 |
| P0（报告面） | `report.narrative.v1`（`:283-284`） | `reportGenerator` 包装层 | 报告期长等待 → 进度（阶段3 同挂点复用） |
| P1 | 一题一评 `mock-interview.evaluate`（`:135`） | `invokeEvaluationOnce` 包装层 | 评分等待（短）→ 可选轻进度 |
| P2（默认不接） | 规划/诊断/路由/OCR | —— | 后台或非交互面 · **默认不写**（防事件面泛化） |

触发面实现形态（EXEC 裁）：**包装层回调**（worker 侧在 `invoke` 外包一层 onProgress 回调，模型 seam 在可观测点回调）**不侵入 invoke 关口语义**——invoke 的 durable/计费/校验链零字节改动是阶段1 的「低险」根。

### 3.2 事件 schema（预注册 · 前端与后端双注册面）

三类新 kind（或复用宽松 `progress` kind 加严格子 payload——**命名面 EXEC 裁**，见 D-2）：

```
generation_started   { jobKind: 'quiz'|'next_question'|'evaluate'|'report'|'diagnosis',
                       operationId: 'interview.quiz-generation.v1'|'interviewer.ask.v1'|'report.narrative.v1'|…,
                       attemptKey: string(幂等键·同 businessRevision),
                       segments: string[]  // 预估段（如 ['queued','prepare','dispatch','generate','validate']）,
                       startedAt: ISO }
model_first_token    { attemptKey, firstTokenMs: number /* 自 dispatch 时刻起算 */, tokensSoFar: 1 }
generation_progress  { attemptKey, stage: string /* 当前段名 */, tokensSoFar: number, elapsedMs: number }
```

- **终态不新增**：`question_ready`/`answer_evaluated`/`report_ready`/各 `*_unavailable`/`error` 仍是唯一权威终态；进度事件**全部非终态、非权威**。
- **载荷红线**：进度事件载荷**只含计数/时刻/段名/幂等键**，**Ban 出现生成内容原文、思考原文、prompt、答案文本**（0126 raw-answer 围栏 + 本刀隐私缺省双保险）。
- 前端注册面：`business-events.ts` 判别联合 + `interview-state.ts` 归约新增 `generationProgress` 视图字段（替换 `:128` 的 progress no-op）；`quiz-state.ts` 同步。**未知 kind 被前端静默丢弃的现状意味着两端必须同刀注册**（漏注册 = 前端零感知 = 白写）。

### 3.3 写入通道两案（交双审 · 本刀核心裁决点 D-1）

**案A（节流持久写 `interview_event`）**——进度事件按 §3.4 节流后经既有 `appendEvent` 落持久表，SSE 读面（controller `:276-283` 既有 2s 轮询）**零改动**自然带出。

| 维度 | 评价 |
|------|------|
| 传输改动 | **零**（读写两侧全走既有面——阶段1 当天可交付的根因） |
| 断线语义 | Last-Event-ID 重放天然覆盖进度行（seq 有序 · 幂等 event_key） |
| 膨胀面 | 表增长有界但非零：单次生成 ≤ 节流上限（§3.4 拟 ≤6 行）· 高频面试流需 vacuum/保留策略补丁（EXEC 面） |
| 争用面 | 进度行与业务行共抢同 stream advisory 锁 + seq 空间（业务 seq 单调性不受影响 · 但热流上锁持有次数上升） |
| 语义纯度 | `interview_event` 掺入非权威进度行——**业务事件表语义稀释**（可靠它 `event_key` 命名空间 `generation:*` 隔离，但物理同表） |

**案B（不入持久表 — 进程内通知 + 可选内存 ring buffer）**——协调方倾向案（REQUEST 原文「进度事件不入 interview_event 持久表」）。worker 进程内 ring buffer（定容 · drop-oldest · 只保 high-water 计数）+ 进程内通知；**跨进程到 API 的投递依赖 §6 SSE-PUSH 接口契约**（当前不存在该通道）。

| 维度 | 评价 |
|------|------|
| 传输改动 | **大**：worker 与 API 是分进程，ring buffer 内容无法经既有 SSE 读面带出——须 SSE-PUSH 刀域先建推送通道（LISTEN/NOTIFY 同形或 Redis Streams 后继），或 API 新拉取面（又是一个新 HTTP 面） |
| 断线语义 | 进度帧易逝（at-most-once · 允许丢）——Last-Event-ID **跳过策略天然成立**：重连不重放进度帧，前端回到段级 loading，业务终态仍由持久事件保证 |
| 膨胀面 | **零**持久增长（ring buffer 定容进程内存） |
| 顺序 | **依赖倒置**：阶段1 选案B ⇒ SSE-PUSH 先行或同刀 ⇒ 与「阶段1 低险先行独立刀」冲突 |
| 崩溃语义 | worker 重启 = 进度归零（前端回段级 loading，不死等——可接受但须写死） |

**实现方倾向（非绑定）**：**阶段1 走案A（节流上限收紧到 ≤6 行/生成）**，把案B 登记为 SSE-PUSH 落地后的**演进方向**（届时进度行迁移出持久表、前端断线语义从「重放」切「跳过」为一次兼容切换）。理由：案A 是唯一零传输依赖、可独立 prove 的路径；案B 的价值（表零增长）在节流上限 + vacuum 策略下收益有限，而其成本（跨进程通道依赖）恰好压在另一刀域上。**若双审裁案B，则阶段1 EXEC 顺位后置于 SSE-PUSH 刀授权之后，本刀如实登记该顺序变更。**

### 3.4 节流策略两案（嵌套裁决点 D-1b · 交双审）

- **T1（时间窗 · 倾向）**：每 `2000ms` 至多一帧 `generation_progress`（+首帧 `generation_started` +尾帧可省——终态由业务事件承担）。帧数上界 = `ceil(生成时长/2s)+1`（35s 执行超时缺省下 ≤18，实际押题/出题时长下个位数）。优点：帧率与生成长度/供应商速率解耦、上限确定性可断言。
- **T2（token 计数）**：每 N token（拟 N=64）一帧。优点：进度感知与真实生成线性；缺点：短生成（<N token）零中间帧、长生成帧数依赖 max_tokens 上限、计数源在阶段2 stream 观察前不可得（阶段1 非流式下 `tokensSoFar` 只能在终态后从 usage 回填——T2 在阶段1 是**空壳**）。
- **合取形态**（可作第三选项交双审微调）：`min(时间窗, 计数)` 先到者触发——阶段1 实际只有时间窗在承重；T2 分量在阶段2 stream 观察落地后才生效。**倾向：阶段1 钉 T1 纯时间窗，schema 预留 tokensSoFar 字段（阶段1 恒 undefined/终态回填）**。

### 3.5 断线语义（Last-Event-ID 对进度帧的跳过/重放策略 · 分案写死）

- **案A 下（重放策略）**：进度行有 seq、走 catch-up 重放。策略：前端归约 `generation_progress` 为**幂等覆盖写**（按 attemptKey 取最新，旧帧重复到达不回退计数）；收到权威业务终态（如 `question_ready`）即**清除该 attemptKey 进度态**——防止重放历史进度把已完成题重新显示「生成中」。
- **案B 下（跳过策略）**：进度帧不重放；重连窗口错过的帧**直接跳过**（进度是易逝态），前端凭下一帧或段级兜底文案恢复，不死等、不因缺帧判 degraded。
- **共同不变量**：进度帧缺失/乱序/重复**均不得**（a）触发 `reconnecting`/`degraded` 判定（进度不是健康信号——沿 `interview-stream.ts:52`「续连成功即回 live 独立于业务事件」的同构纪律）；（b）改变 phase 终态机；（c）产生死胡同。
- **进度静默兜底**：自 `generation_started` 起 >执行超时上界（35s 缺省 +ε）无终态无进度 → 前端回到现有 phase spinner 语义（既有 `*_unavailable`/`error` 事件仍是唯一失败宣告）。

### 3.6 backpressure（阶段1 面）

- **worker 写侧**：案A 每帧一小事务（appendEvent 原语既有形态），节流保证 ≤1 写/2s/生成 · 并发生成各自 attemptKey 不互锁（advisory 锁按 stream 串行——同 stream 同时至多一个在途生成，写放大天然有界）；案B ring buffer 定容（拟 64 帧/attempt）drop-oldest，仅保留 high-water 计数。
- **API→客户端**：进度帧写频 ≤ 既有 2s 轮询周期（案A 每轮至多一批）——SSE `safeWrite` 失败即关的既有语义不变；**不新增推送压力**（这是案A 低险的传输面根因）。
- **前端**：进度帧只更新单一 `generationProgress` 字段（幂等覆盖写），不入 turns 历史、不触发快照数组增长——`applyEvents` 每 chunk 一快照的既有 O(n) 保护不被破坏；`maxBufferBytes=1MB` 既有帽不变。

### 3.7 阶段1 Prove 拟案（落地后判定面 · 全部隔离/fake seam · Ban live）

前置：沿 `voice-stream.ts` fake seam 先例，为流式观察缝提供**受控 fake 流式模型**（确定性 token 序列 · 零外呼 · `env -u` 双键剥离）。

| # | 断言面 | 断言（预注册名 EXEC 定稿） |
|---|--------|--------------------------|
| TS-P1 | **首 token 事件延迟** | `generation_started`→`model_first_token` 事件链在 fake seam 下产生且 `firstTokenMs` 被记录；进度事件到达 SSE 面的端到端时延 ≤ 传输周期（案A：2s poll + ε，prove 内放宽上界并如实记录实测值） |
| TS-P2 | **节流正确性** | 受控长生成（fake 1000 token / 10s）下 `generation_progress` 行数 ≤ `ceil(elapsed/2s)+1`；`event_key` 幂等不产生重复行 |
| TS-P3 | **前端渲染断言** | web prove 面：`generationProgress` 视图字段由进度事件驱动（spinner 文案 → 段名/计数）；终态事件清除进度态；**进度帧全丢（模拟断线）不产生死胡同/degraded**（回到段级兜底） |
| TS-P4 | **膨胀上界**（案A） | 单 attempt 进度行 ≤ 节流上限常量；`interview_event` 业务行 seq 连续性不受进度行影响 |
| TS-P5 | **载荷红线** | 进度事件载荷 schema 钉死（无内容/思考/prompt 字段）——schema 层 + 采样断言双保险 |

EXIT 契约：EXIT0 = 上述断言全绿（**≠ 用户已见打字机 · ≠ 阶段2 落地**）；红仅限 fake seam 不可构造 / 节流失界 / 渲染死胡同 / 载荷红线破。零模型外呼 · `actualSpendCny=null`。

## 4. 阶段1 与 SSE-PUSH 刀的接口契约（declare · 不实现 · Ban 面）

**本刀不改**：worker wakeup（LISTEN/NOTIFY `meetwise_worker_wakeup_v1`）· SSE 轮询循环（controller `:276-283`）· 任何 Redis 面。**契约声明如下（供 SSE-PUSH 刀接收）**：

1. **通道语义需求**（若阶段1 后续迁案B / 阶段2 增量帧走高频通道）：worker→API 的进度/帧投递需 **at-most-once、允许丢、非权威** 通道；丢帧的前端兜底已在 §3.5/§5.5 写死（不死等）。**业务终态永远不走该通道**（只走持久 `interview_event`）。
2. **载荷形状**：`{ streamKey, attemptKey, kind, stage?, tokensSoFar?, ts }`——无内容原文（阶段2 内容帧契约见 §5.5，另议）。通道层**不承担** seq 分配/幂等/重放（那些属持久事件面）。
3. **消费端接口**：API SSE 面届时以「通知到达即触发一次 tail 读取」替代/补充 2s 轮询——**轮询语义与本刀进度事件的 seq/幂等设计解耦**，SSE-PUSH 落地不要求本刀改任何读写面。
4. **不越界声明**：本刀阶段1 案A 完全不依赖该通道；阶段2 若双审裁增量帧走持久表面外通道，则该通道实现归 SSE-PUSH 刀，本刀只消费。

## 5. 阶段2 设计 — 完整流式（另刀授权 · 本节为设计面）

### 5.1 invoke 升级面（供应商支持核实 = 前置门）

- **传输**：`model-client.ts:400-419` `dispatchOnce` 由一次性 JSON POST 升级为 `stream:true` SSE 读流（compatible-mode `/chat/completions`）——**EXEC 前置门：live 核实 dashscope compatible-mode 对 `stream:true` 的行为面**（SSE 帧格式 · usage 上报形态〔OpenAI-compatible 面通常需 `stream_options:{include_usage:true}` 才在末帧报 usage〕· json_object 与 stream 的组合行为 · reasoning 字段有无）。**核实刀零预claim，结果如实入卷后再定 EXEC 细目。**
- **invoke 关口**：durable claim/派发边界/计费/双校验链**语义零变**——流式只改「传输观察形态」：`Model.execute` 增流式观察缝（progress 回调或 async iterable），最终仍聚合为单 `ModelResult` 交 `:707` 双校验（阶段2 的增量帧透传**不绕过** schema/业务校验——校验失败时已渲染的增量内容以终态事件为准回滚视图，见 §5.5）。
- **usage/计费**：流末帧 usage 缺失/非法 → 沿既有 `provider_usage_invalid`→unknown 收口，**不为流式发明新计费路径**。
- **flag 门纪律**：沿 `voice-stream.ts` 形制——`MODEL_STREAM_ENABLED` 类 flag 缺省关 + 预览期双 flag + 生产禁直开；fail-closed 缺省（flag 关 = 完全走现状单发路径）。

### 5.2 worker 增量帧 → 前端

worker 在流观察缝收增量 → 经阶段1 通道（案A 持久表面：**增量内容帧不落持久表**——案A 只承载计数/段名进度；内容帧走内存 → §4 契约通道或案A 变体「仅当前进行段一行 coalesce 覆盖写」——**该形态属阶段2 裁决面，本刀列两案交双审**）→ SSE → 前端。

### 5.3 前端渲染（UX = 产品裁示面 · 两案）

- **UX-A 打字机**：按到达帧逐字追加（拟 rAF 批渲染——React bridge 既有 coalesce 面）。沉浸感强；帧丢失/校验失败回滚观感突兀。
- **UX-B 即显块**：按段（句子/行）到达即显。观感稳定、丢帧容错好；「流式感」弱。
- 实现方倾向（非绑定）：UX-A + 终态权威覆盖（`question_ready` 到达即整体替换为权威题面——增量渲染永远只是预览态）。**裁示归产品视角。**

### 5.4 思考过程（reasoning）两案（隐私/体验权衡 · 交双审 + 产品裁示）

前置：仅当供应商核实返回 reasoning 字段（§5.1 核实面）且产品显式决定展示，才进入实现；两案：

- **R-A 折叠区展示原文**：「模型思考中」折叠区流式展示 reasoning 原文。体验：对齐用户直裁「思考过程事实展现」；代价：reasoning 可能含 prompt 残影/内部推理（隐私面扩大）+ 带宽 + **强隐私红线：Ban reasoning 原文落任何持久表**（`interview_event`/`ai_invocation_trace`/任何落盘 ring buffer）——只在 SSE 传输态出现，断线即失，重连不补。
- **R-B 仅进度不展示原文**：折叠区只显示「思考中… 已 N 秒 / 已生成 M 字符」计数。隐私缺省、带宽零增、实现最薄；代价：与用户直裁的「事实展现」字面诉求有距离。
- 实现方倾向（非绑定）：**缺省 R-B**（隐私缺省），R-A 作为产品显式裁示后的增强位（届时须另立隐私面 prove 断言 reasoning 不落盘）。**本刀 Ban 思考原文落持久表为硬 Ban**（除非产品裁示显式解禁且经双审）。

### 5.5 阶段2 断线语义与 backpressure

- **断线**：增量帧非权威、at-most-once——重连不重放已过帧；`question_ready`（权威全量）到达即覆盖增量预览态；窗口内重连 = 预览从下一帧续（或回进度条态）。**前端永不因增量帧缺失判 degraded。**
- **backpressure**（三层）：
  1. worker←供应商：读循环逐帧 await 消费（无缓冲累积）；abort/超时沿既有 `withAbortTimeout` 语义。
  2. worker→SSE：帧写出慢/连接断 → **coalesce 合并**（pending 帧折叠为「当前累积串」单帧）而非无界排队——每个 attempt 至多保持 1 个待发聚合帧，计数 high-water 保真、字符流保终态。
  3. 客户端：渲染帧率由 rAF coalesce 封顶（不是每 SSE 帧一次 React 提交）；`maxBufferBytes` 既有帽不变。**用户离开页面/关 SSE ≠ 中止生成**（权威终态仍须落表——计费与图推进不因前端断开回滚）。

### 5.6 阶段2 Prove 拟案（另刀定稿 · 方向面）

fake 流式模型（受控帧序/帧距/丢帧注入）下：首 token 端到端时延断言 · coalesce 正确性（慢消费下无界排队不发生）· 终态覆盖（校验失败路径增量预览被正确回滚）· reasoning 不落盘断言（R-A 若裁示）· flag 关 = 现状路径字节等价回归。零 live。

## 6. 阶段3 设计 — 报告生成同构（另刀授权）

- 触发面：`report-worker.ts:46` 图内 generate → `reportGenerator`（`interview-service.ts:283-284`）。
- 同管道接入：阶段1 `jobKind:'report'` 进度事件（segments 拟 `['queued','claim','generate','persist']`——报告排队期〔claim 前〕的等待占用户感知大头，进度事件应覆盖 queue 段：`generation_started` 在 enqueue 时即可发〔`enqueueReport` 面〕，生成段开始再发 `generation_progress{stage:'generate'}`）；阶段2 裁示后报告叙述增量帧同构（UX 产品面：报告是否值得逐 token —— 倾向**报告只到进度不到帧**〔报告是终局产物、逐 token 观感价值低〕，交双审）。
- 断线/backpressure：同 §3.5/§5.5；报告流 streamKey 与面试流同 `interviewId`（既有面），无新流。

## 7. 边界（Ban 清单 · 硬 Ban 全录）

1. **Ban 本刀碰产品码**：设计刀 docs-only——apps/packages/scripts 零字节（`git diff --stat` 机检入收据）；全部改动恰本 harness + slice + 双 stub 四 md。
2. **Ban 思考原文落持久表**（隐私缺省）：reasoning 原文只允许 SSE 传输态（且仅 R-A 裁示后）；`interview_event`/`ai_invocation_trace`/任何落盘缓冲**零 reasoning 字节**；解禁须产品显式裁示 + 双审 + 隐私 prove 断言。
3. **Ban 碰 worker wakeup / SSE 轮询重构线**（SSE-PUSH 刀域）：`job-wakeup-listener.ts`、controller `:276-283` 轮询循环、Redis 面零触碰；§4 只声明接口契约。阶段1 案A 不得以此为由改任何传输面。
4. **Ban secrets**：Ban Key 值/fingerprint 入 docs/receipt/log/commit · Ban `.env*` · Ban live 调用（本刀零 live；供应商核实属阶段2 前置门另刀）。
5. **Ban 改共享 SSOT**：backlog/checklist/matrix/queue 零触碰 · Ban covered flip（coveredCount=8）。
6. **Ban 预claim**：本 commit 不预claim 任何阶段 EXIT/落地效果/供应商行为；Ban retry-to-green；Ban fake green。
7. **Ban self-approve / alone ≠ dual / Ban self-nail** · Ban force-push · Ban push 主线（本刀分支独立 push）。
8. **Ban 绕过 invoke 关口**：任何阶段的流式升级不得在 model-client/invoke 之外旁路 durable claim/计费/双校验链。
9. **Ban 进度/增量帧承载权威语义**：终态永远=既有业务事件；进度帧缺失/乱序不得触发 degraded/死胡同（§3.5 不变量）。
10. **Ban 阶段2/3 就地开工**：本刀只交设计；阶段1 EXEC、阶段2/3 立项均须另刀授权。

## 8. Non-claims

Not run（本 REQUEST 零实跑零 live）· not coding · not 已流式（现状仍非流式单发）· not 前端已见进度（现状 spinner 不变）· not 供应商 stream 行为已核实（阶段2 前置门未开）· not SSE-PUSH touched（wakeup/轮询零触碰）· not reasoning 展示已裁（两案待双审+产品）· not 阶段1/2/3 EXEC 授权 · not covered（coveredCount=8）· not `releaseEvidence=true` · not HA · not nail · not SSOT edit · alone ≠ dual · `g7SuiteGreen=false` · `actualSpendCny=null`

## 9. 流程（本刀全生命周期）

REQUEST（本 commit · docs-only 四文件）→ **预执行双审**（mw-model-op + mw-e2e-ha · stubs PENDING · 裁 D-1 写入通道两案 / D-1b 节流两案 / D-2 事件命名面 / R-A·R-B 与 UX 倾向转产品裁示）→ meetwise 授权 → **阶段1 另立 EXEC 刀**（按裁定落 additive 实现 + §3.7 prove）→ post-prove 双审 → nail；阶段2（含供应商核实前置门）/ 阶段3 各自另刀。

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · 现状 invoke 非流式 · 阶段2/3 未立项 · STOP

---

*Harness · TOKSTREAM 模型输出 token 流式透传设计刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 三阶段（1 生成进度事件〔先行独立刀〕→ 2 完整流式 stream:true〔另刀〕→ 3 报告同构〔另刀〕）· 两案交双审：写入通道案A 节流持久写 interview_event vs 案B 进程内通知+内存 ring buffer（SSE-PUSH 依赖）· 节流 T1 时间窗 vs T2 token 计数 · 思考过程 R-A 折叠区展示〔Ban 落盘〕vs R-B 仅进度 · 断线语义〔案A 重放幂等覆盖 / 案B 跳过〕· backpressure 三层 · 与 SSE-PUSH 刀只声明接口契约零实现 · 硬 Ban：碰产品码 / 思考原文落持久表 / 碰 wakeup 与 SSE 轮询 / secrets / 绕过 invoke 关口 · alone ≠ dual · STOP*
