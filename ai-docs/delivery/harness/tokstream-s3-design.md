# TOKSTREAM-S3 — 阶段2 完整流式实施设计刀（docs-only 设计定稿）

**状态**：`exec:awaiting_post_prove_dual`（REQUEST @`0a52d12c` · 协调方 EXEC 授权 · 席1 处方并入=§B 数据流图 worker→api 跨进程跳逐段钉死）· base = 主线 `c17804a5` · 分支 `line/tokstream-s3-design` · 蓝本 = TOKSTREAM-S2 nail 必备面清单（B_PASS 实测+S2 席2 开列）。

## 1. 设计范围（docs-only 设计定稿·零产品码）
**产线**：model-client 流式通道（`stream=true`+`stream_options.include_usage`·dashscope compatible-mode OpenAI wire delta.content 天然增量·finish_reason=stop+空 choices usage+[DONE] 三联终结）→ api SSE 泵（复用 `apps/api/src/platform/sse-pump.ts` 形态）→ 前端逐 token 渲染管线。
**S2 必备面全覆盖清单**：①流中 error frame 面（C 被 HTTP 前置拦截未实测——设计携带）②静默断流面 ③idle/总闸截断策略 ④跨 chunk 多字节 UTF-8 TextDecoder stream 解码纪律 ⑤并发/取消/断流续传与计费语义 ⑥长流 pacing（样本仅 72 字符）⑦**拼接校验=长度守恒（ΣdeltaLen==accLen）+归一化全等（+completion_tokens 量级对账）·明文禁裸前缀重叠启发式**（T3 误报实证会改坏正确输出）⑧非 200+JSON error body 一等错误路径（res.ok 先判·4xx 禁重试）。
**G7 车道**：g7_ 前缀族抛出语义 §2.2 冻结零触（流式通道并行面非错误分类面）。

## 2. 产出
设计文档 `ai-docs/delivery/harness/tokstream-s3-design.md` 扩写：数据流图/接口签名/错误矩阵/SSE 事件 schema（zod 双端注册·阶段1 惯例）/测试矩阵（S2 收据形态作 fixture）/分批实施切片（EXEC 刀拆分建议）。

## 3. Ban
零产品码（纯设计文档）·g7 车道零触·Key name-only·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 4. 验收
设计文档+必备面清单 ①-⑧ 逐面覆盖对照表+实施切片建议+收据 `ai-docs/delivery/receipts/tokstream-s3-design/`。

## 5. Non-claims
设计 ≠ 实施 ≠ 流式上线。

---

# 设计定稿正文（EXEC 扩写 · 以下全部为设计面·declare 不实现）

## §A 亲证锚点（行号 @本分支 tip `0a52d12c` · 本刀全数亲读）

| # | 面 | 锚 | 亲证事实 |
|---|---|---|---|
| A1 | 模型 invoke 进程归属 | `apps/worker/src/interview-service.ts:2` | 「把模型经 invoke 关口接进各图节点。**worker 真跑**、api 触发都用它」——生成进程=worker，SSE 消费进程=api，**跨进程跳必须显式设计**（席1 处方承重锚） |
| A2 | 现行 text 调用=非流式 | `packages/ai-runtime/src/model-client.ts:395`（chatUrl）·`:403`（dispatchOnce 一次性 JSON POST） | body 零 `stream` 字段；S2 立项事实在本分支仍成立 |
| A3 | 供应商流式能力（S2 实测） | `receipts/tokstream-s2-probe/2026-10-07/probe-b.json` · `stitch-compare.json` | B_PASS：TTFT 274ms · 17 chunks/13 非空 delta · 间隔 1–153ms · stop+空 choices usage chunk+[DONE] 三联终结 · T0 归一化全等（A/B sha 同符）· pinnedParams temperature=0/seed=42 |
| A4 | 错误前置（S2 实测） | `.../probe-c.json` | 404 model_not_found **HTTP 前置** 225ms · 零流字节 · 生成前即拒零计费 |
| A5 | SSE 泵 | `apps/api/src/platform/sse-pump.ts:46`（pumpSseEvents）·`:66`（10min deadline）·`:87-90`（ping/取数失败收尾即断） | 行泵单源化（B5 四件套）·notify `waitFor(streamKey)` race 兜底 poll·emit=`id: seq / event: kind / data: JSON` |
| A6 | SSE 端点 | `apps/api/src/modules/interview/interview.controller.ts:253-272` | GET `:id/events` · `last-event-id` 头 · per-principal 槽 ≤5（`acquireSlot` 429 too_many_streams）·isTerminal=report_ready/report_unavailable/assessment_unavailable/interview_unavailable/error 五 kind |
| A7 | 通知通道 | `apps/api/src/platform/sse-notify.service.ts:28-29`（channel/trigger 名）·`packages/db/migrations/0143_sse_push_notify.sql:26`（`pg_notify('interview_event_ch', NEW.stream_key)`） | 现通道载荷=**仅 stream_key**（lossy hint·零内容）·单例 LISTEN 禁每 SSE 一连接（`:24`）·健康面=LISTEN 在位+trigger 在场 |
| A8 | 事件持久原语 | `packages/db/src/interview-event.ts:16`（appendEvent）·`:24-28`（0126 raw-answer 围栏） | seq=同 stream MAX+1 advisory 事务锁原子分配 · event_key 幂等（重复返回既有 seq） |
| A9 | 阶段1 进度惯例 | `apps/worker/src/generation-progress.ts:19`（kind 族）·`:26-35`（节流/行上界）·`:39-45`（载荷键白名单红线）·三触发面 `interview-service.ts:213/:307`+`adaptive-interview-service.ts:113` | wrapper 层回调·非权威非终态·best-effort 写·业务终态清除语义 |
| A10 | 前端消费 | `apps/web/lib/stream/business-events.ts:21-72`（zod discriminatedUnion·**各成员 id 必填**）·`:79`（decodeSSE 按 `/\r\n\r\n|\r\r|\n\n/` 三分）·`:101`（safeParse 不过即 null 丢弃）·`interview-stream.ts:14`（fetch + `last-event-id` 头）·`sse-cursor.ts`·`frame-coalescer.ts`（既有） | 双端注册面齐备；web 侧已有帧合并器与游标面可复用 |
| A11 | 流式 flag 门先例 | `packages/ai-runtime/src/voice-stream.ts:5-6`·`:21`·`:29` | 双 preview flag（`*_ENABLED=1`+`*_PREVIEW=1`）fail-closed 形制 |
| A12 | 关口不变面 | `packages/ai-runtime/src/invoke.ts:135`（idempotencyKey）·`:19`（doubleValidate）·`:346-390`（claim/usage 落账） | durable claim/计费/双校验链**不可旁路**（阶段0 Ban 8 承接） |
| A13 | 事件目录 SSOT | `CLAUDE.md:54` | 「frontend consumes business events over SSE, **not model tokens**」——阶段2 落地将改变该句语义；其更新登记为 S4c/d 实施刀内事项（本刀零触 SSOT） |
| A14 | 模型期限面 | `packages/ai-runtime/src/model-client.ts:422`（`resolveModelDeadlineConfig().transportTimeoutMs`） | 现行 35s/30s 级模型期限；流式通道期限设计见 §E-③ |
| A15 | Redis 存在性 | `apps/worker/package.json` / `apps/api/package.json`（grep ioredis/Redis 零命中） | api/worker 运行时**无 Redis 依赖**——传输面选型排除 Redis Streams 作批1方案（§C T-B 仅登记演进） |

## §B 数据流图（席1 处方：worker→api 跨进程跳逐段钉死）

```
┌─────────────────────────── 浏览器（apps/web · 渲染进程） ───────────────────────────┐
│  interview-stream.ts:14  fetch GET /interviews/:id/events  headers:{last-event-id} │
│  decodeSSE(business-events.ts:79 CRLF 三分) → toBusinessEvent zod safeParse(:101)  │
│  interview-state 归约：业务终态=唯一权威（覆盖+清 delta 缓冲）· token_delta=非权威缓冲 │
│  渲染 pacing：frame-coalescer.ts + rAF 批量（coalesce 三层之 L3）                    │
└───────────────────────────────▲───────────────────────────────────────────────────┘
                                │ ⑥ SSE W3C 帧（权威行帧带 id=interview_event.seq；
                                │   token_delta 帧【不带 id】——防 Last-Event-ID 光标毒化 §C-4）
┌───────────────────────────────┴──────── api 进程（SSE 消费进程） ───────────────────┐
│  interview.controller.ts:253  GET :id/events（槽≤5·429·404 前置）                    │
│  pumpSseEvents(sse-pump.ts:46)                                                      │
│   ├ 行泵（既有·语义零改）：fetchMore(seq>) ← interview_event 权威行 → emit(id/kind/data) │
│   │   ·10min deadline(:66)·ping 保活·终态即收                                       │
│   └ delta 臂（S4c 新增）：interview_token_ch LISTEN（复用 sse-notify.ts:24 单例连接·   │
│       禁每 SSE 一连接不变）→ per-streamKey 进程内环形缓冲（有界·丢旧标记 coalesced）    │
│       → 插叙 emit(token_delta·无 id) —— 非权威·允许丢                               │
└───────────────────────────────▲───────────────────────────────────────────────────┘
                                │ ⑤ 跨进程跳（worker→api·唯一桥）：PG LISTEN/NOTIFY
                                │   专用通道 interview_token_ch·载荷=JSON delta 帧
                                │   （≤8KB/条·at-most-once·lossy·连接断窗内丢帧=允许）
┌───────────────────────────────┴──────── worker 进程（生成进程·模型 invoke 实际归属） ─┐
│  interview-service.ts:2 装配面 → invoke 关口（claim/计费/doubleValidate 原值·A12 零旁路）│
│   └ 流式观察缝（S4a）：model-client completeStream（stream=true+include_usage）        │
│       逐 delta → withTokenStream 包装层（generation-progress.ts 同位·三触发面同刀）     │
│       → L1 合帧（~100ms 窗/≤4KB·码点安全切分 §E-④）→ pg_notify(interview_token_ch)    │
│   ├ 阶段1 粗进度照旧：appendEvent(generation_*·节流落表·断线重放兜底)  ← A9 零改       │
│   └ 终态 appendEvent(question_ready/quiz_ready/report_ready ·**全文权威**)            │
│       = delta 丢帧/断流/出错时前端恢复的唯一兜底 ←←← 阶段0 铁律① 承接                  │
└───────────────────────────────▲───────────────────────────────────────────────────┘
                                │ ③ HTTPS SSE（stream_options.include_usage·
                                │   delta.content 天然增量·[DONE] 终结）—— S2 B_PASS 实测
                     ┌──────────┴──────────┐
                     │ dashscope compatible-mode │（dashscope.aliyuncs.com/compatible-mode/v1
                     └─────────────────────┘   · text-endpoint-config.ts:39 注册表值·S2 三元组钉死沿用）
```

**六段箭头语义表**：

| 段 | 边界 | 载荷 | 序/可靠性 | 权威性 |
|---|---|---|---|---|
| ③ | dashscope→worker | OpenAI wire chunk（delta.content/finish_reason/usage） | TCP 有序·S2 实测 1–153ms 间隔 | 原料（服务端再加工） |
| ④段内 | worker 观察缝内 | delta 文本 | 单飞（invoke 幂等 claim 保证 ≤1 执行） | 非权威 |
| ⑤ | worker→api（**跨进程跳**） | `interview_token_ch` JSON delta 帧 ≤8KB | at-most-once·lossy·FIFO per 连接 | **非权威·允许丢** |
| 行泵 | PG→api | interview_event 行（seq/kind/payload） | 持久·Last-Event-ID 可重放 | **权威**（终态+阶段1 进度） |
| ⑥ | api→浏览器 | SSE 帧 | HTTP chunked·断开重连 | 权威行帧可重放；delta 帧不可 |
| 渲染 | web 进程内 | 强类型 BusinessEvent | 归约纯函数 | 终态覆盖一切 |

## §C 传输面设计（增量内容帧不落持久表——阶段0 裁定承接）

**C-1 选型**：**T-A（primary）= PG LISTEN/NOTIFY 专用通道 `interview_token_ch`**。理由：api/worker 运行时零新基建（A15·Redis 不在依赖面）；复用 `sse-notify.service.ts` 单例 LISTEN 连接形态（同连接第二通道·`:24` 禁每 SSE 一连接纪律不破）；worker 侧本有 PG pool（appendEvent 同事务外旁路 `pg_notify`）。**T-B（仅登记演进）= Redis Streams 有界环**（XADD/MAXLEN/XREAD·跨 api 重启短暂回放）：批1 不选——新基建+新运维面，且非权威语义下回放价值低（终态兜底已足）。

**C-2 帧契约**：`{v:1, streamKey, attemptKey, seq, text, coalesced?}`。`seq` 为 (streamKey, attemptKey) 内自 1 单调递增（worker 单写者——invoke 幂等 claim 保证单飞；A12）。L1 合帧后单帧 `text` 字节 ≤4KB（NOTIFY 载荷上限 8KB 的安全半幅）；超长 delta 在观察缝内**码点安全切分**（沿 `model-client.ts:115` codepointSafeSlice 同型，绝不拆孤立代理项）。

**C-3 丢帧语义**：LISTEN 断连窗/缓冲弃旧/载荷超限 = delta 丢失，**一概不补发不重传**（at-most-once·非权威）。恢复路径唯一：worker 侧流结束照旧 appendEvent 权威终态（全文）→ 前端业务事件清除+权威覆盖（A9 语义沿用）。**明令禁止**：为补 delta 而重跑模型调用（双跑双扣·§E 计费纪律）。

**C-4 Last-Event-ID 光标防毒（关键 hazards）**：`sse-pump.ts:64` emit 权威行带 `id: seq`，客户端 `last-event-id` 回传按数值 seq 续推（`sse-cursor.ts`）。**token_delta 帧一律不带 id**：若 delta 帧携带任何数值 id，重连时将污染 interview_event seq 游标（跳行/重放错行）。落地三件套：①api emit 面 delta 帧无 id 字段；②web `business-events.ts` token_delta 成员为**唯一 id optional 成员**（A10 现各成员 id 必填——不改既有成员）；③`decodeSSE` 零改（`f.id === undefined` 本就合法·`:89` 条件写入）。

**C-5 红线（沿阶段0/阶段1 裁定）**：token_delta `text`=生成内容 → **仅传输态，Ban 落 interview_event**（0126 围栏精神+A8 持久面零扩）；思考原文维持 R-B 缺省不传输不落盘（R-A 解禁须产品裁示另刀）；delta/进度帧**永不承载权威语义**（缺帧不 degraded 不死等）。

## §D 接口签名（declare 不实现·实施刀按此对齐）

**D-1 ai-runtime 流式通道**（`packages/ai-runtime/src/model-client.ts` 新增面·不动 `:403` 既有 dispatchOnce）：
```ts
// openAICompatibleClient 增流式通道；flag 门沿 voice-stream.ts:5-6 双 preview 形制 fail-closed：
//   MODEL_TEXT_STREAM_ENABLED=1 且 MODEL_TEXT_STREAM_PREVIEW=1 才启用；否则 completeStream 恒走非流式（零回归）。
// 测试 transport seam 沿 MODEL_TEST_TRANSPORT_OVERRIDES 既有缝（rejectTextTransportOverride 语义原值）。
completeStream(req: CompletionRequest, opts: {
  signal?: AbortSignal;
  onDelta: (d: { text: string }) => void;          // 码点完整 JS 字符串；调用方不得假设分帧=token 边界
  onUsage?: (u: { completionTokens?: number; promptTokens?: number }) => void;
}): Promise<ModelResult>;                           // 返回值与非流式同型（raw=完整 JSON 解析·usage 面同）
```
wire 纪律（S2 实测承接）：`fetch` `res.body` ReadableStream + TextDecoder streaming（§E-④）；`res.ok` **先判**（⑧）非 200 读 JSON error body 走 `classifyProviderError` 既有分类面；终结三联判定=finish_reason=stop chunk + 空 choices usage chunk + `data:[DONE]`；EOF 无三联=静默断流（§E-②）。ΣdeltaLen==accLen **通道内自检断言**（⑦长度守恒）。

**D-2 invoke 观察缝**（`packages/ai-runtime/src/invoke.ts`）：`InvokeSpec` 增可选 `onModelDelta?` 纯观察回调，透传至 `plan.execute`；**关口零改动**——claim/幂等/计费/doubleValidate（A12）不因回调存在而分叉；回调抛错一律吞为观察失败（绝不影响业务结果面）。G7 车道：freetier 下 flag 缺省 OFF=零触；stream 通道不进 g7 预约/终结面；未来 ON 须另刀 g7 车道审批（本刀仅声明）。

**D-3 worker 包装层**（`apps/worker/src/` 新增 `token-stream.ts`·与 `generation-progress.ts` 同位）：
```ts
withTokenStream(pool, owner, streamKey, meta: { attemptKey, jobKind }, run: (t: TokenSink) => Promise<T>)
// TokenSink: pushDelta(text) / endUsage(u) / abortReason(r)
// L1 合帧（~100ms 窗/≤4KB）→ pg_notify('interview_token_ch', JSON 帧)·best-effort（写败=丢帧·§C-3）
// seq 单调分配；结束面 telemetry：usage.completion_tokens vs Σdelta 字符数对账（仅日志·非门·§E-⑦）
```
三触发面同刀接线（A9 同位）：`interview-service.ts:213/:307` + `adaptive-interview-service.ts:113` 旁。

**D-4 api 泵臂**（`apps/api/src/platform/sse-pump.ts`）：`SsePumpOptions` 增可选 `deltaSource?: { waitFor(key): {promise,dispose}; fetch(): DeltaFrame[] }`——行泵循环语义零改（A5 单源化不破：delta 臂与 notify wait 同 race·取帧即 emit 无 id 帧·环空则照旧 ping）。三控制器按需接线（interview 先行·quiz/diagnosis 随 S4c 裁量）。

**D-5 web 面**：`business-events.ts` 增 token_delta 成员（§F）；`interview-state.ts` 增 delta 缓冲归约（attemptKey 键控·`maxDefined` 幂等精神沿 A9；终态到达=覆盖+清缓冲）；渲染=UX-A 打字机（阶段0 UX 裁定倾向）+终态权威覆盖。

## §E 错误矩阵（必备面 ①②③⑧ 承重·S2 实测态如实区分）

| # | 面 | S2 实测态 | 设计承载（落点） | fixture 测试 |
|---|---|---|---|---|
| ⑧ | 非 200+JSON error body | **C 实测**：404 model_not_found HTTP 前置 225ms 零流字节 | `res.ok` 先判（D-1）→ 一等错误路径→worker 发 error 终态（`*_unavailable`/`error` kind 既有）·**4xx 禁重试**（S2 余量语义沿袭） | probe-c.json |
| 鉴权 | 401/403（key-域错配） | 未实测（S2 以 pre-flight 同族断言防误判） | pre-flight 响应 `model` 同族断言沿 S2 三元组；stream flag OFF 缺省=失败面即非流式既有面 | 合成 fixture |
| ① | 流中 error frame | **未实测**（C 被 HTTP 前置拦截——REQUEST 明示设计携带） | 解析 `data:{error…}` 帧 → 即刻截断+error 终态+Σlen 封账（守恒账面到中断点） | 合成 fixture |
| ② | 静默断流（EOF 无三联） | 未实测（B 三联齐） | EOF 且无 finish_reason/usage/[DONE] → `streamEndedByEofWithoutDone`（probe-b 已有键）→ error 终态 | 截断 fixture（去 [DONE] 重放） |
| ③ | idle 停滞/总闸 | 未实测（样本间隔 ≤153ms） | **idle watchdog**：无字节 >10s → 截断走①路径；**总闸**：流式 transport 期限沿 `resolveModelDeadlineConfig`（A14）另设流式值+泵侧 10min 帽（A5 `:66`）双层；任一触发=error 终态·禁自动重跑 | 合成停滞 fixture |
| ⑤ | 并发/取消/断流续传/计费 | — | 并发：per-principal SSE 槽 ≤5（A6）不变·token 通道零新增连接；取消：客户端断开**不取消** worker 生成（既有语义·终态照落·delta 无听众=廉价 no-op）；续传：Last-Event-ID 只重放权威行（delta 永不重放·§C-4）；**计费：流中失败禁自动重跑**（Ban 双跑双扣）·重试=用户显式路径（attemptKey 幂等重放既有） | 槽/重连 fixture |
| ⑥ | 长流 pacing | **样本仅 72 字符**（S2 诚实边界） | L1 合帧（worker·§D-3）+L2 api 环有界（丢旧标记）+L3 渲染 rAF 批量（frame-coalescer 复用）——三层 coalesce 承接阶段0 裁定；真实长流曲线未测=如实登记，S4 prove 用合成长曲线重放 | 合成长曲线 fixture |
| ⑦ | 拼接校验 | T0 pass（逐字节全等）·T3 定性器 1 误报实证 | **运行时**：长度守恒 ΣdeltaLen==accLen（D-1 通道自检+web 缓冲面）+终态到达时归一化全等对照（trim+折叠空白·不匹配=telemetry+仍用终态权威）；completion_tokens 量级对账=**telemetry 非门**（跨语言 tokens≠字符可比）；**明文禁裸前缀重叠启发式**（S2 T3 误报会改坏正确输出——该启发式只许存在于离线诊断工具） | stitch-compare.json grading |
| ④ | 跨 chunk 多字节 UTF-8 | 未单测（S2 node 侧 TextDecoder 天然处理） | worker/api：`TextDecoder({stream:true})`+末尾 `{stream:false}` 冲洗；**帧切分码点安全**（§C-2·孤立代理项禁）；web：decodeSSE 输入已是字符串·按字节切的重放 fixture 驱动 | 按字节切 fixture（含码点中断） |

**计费纪律总则**：流式与非流式同价同账（invoke 关口 usage 落账 A12 零改·delta 回调不产生第二账面）；任何流中失败不自动重invoke；`estimatedCost` 口径沿 S2（qwen-plus 0.8/2 CNY 每 1M·console-reported）。

## §F SSE 事件 schema（zod 双端注册·阶段1 惯例）

**新 kind：`token_delta`（唯一新增·非持久 kind——无 interview_event 行·仅 SSE 传输态）**

```ts
// api/worker 共享语义（写侧·S4b/c）；web 读侧（S4d·business-events.ts 双端同刀注册沿 A9 惯例）：
z.object({
  event: z.literal('token_delta'),
  id: z.number().int().optional(),          // ← 全表唯一 optional 成员：delta 帧不带 id（§C-4 光标防毒）
  data: z.object({
    attemptKey: z.string(),
    seq: z.number().int().positive(),       // (streamKey, attemptKey) 内单调；gap=丢失标记（不死等）
    text: z.string(),                       // 生成内容·仅传输态·Ban 落持久表（§C-5）
    coalesced: z.boolean().optional(),      // L1 合帧标记（帧≠供应商 chunk 边界）
  }).loose(),                               // .loose() 容演进字段（沿 generation_* 成员惯例 A10）
})
```
注册纪律（双端同刀·沿阶段1 D-2 裁定）：web `business-events.ts` discriminatedUnion 增成员与 api emit 面同刀落地，禁半边注册；`decodeSSE`/`toBusinessEvent` 零改（unknown→null 丢弃面天然容未升级前端=旧前端静默丢 delta、终态兜底照常——向后兼容免费获得）。`CLAUDE.md:54` 事件目录句与 SSE 目录登记为 S4c/d 刀内事项（A13·本刀零触 SSOT）。

## §G 测试矩阵（S2 收据形态作 fixture·全部零 live·fake seam 沿 voice-stream 形制）

| fixture 来源（S2 收据 @`receipts/tokstream-s2-probe/2026-10-07/`） | 形态要点 | 驱动测试（落哪刀） |
|---|---|---|
| `probe-b.json` → `facts.curve`（17 chunk·间隔 1–153ms） | t=ms 时间轴重放 | S4a：L1 合帧行为（重放→合帧后帧率/字节上界断言）；S4d：L3 渲染 pacing |
| `probe-b-sse-chunks.redacted.txt`（`t=<ms> data: <raw>` 行态） | 原始 wire 帧序 | S4a：TextDecoder 按字节切重放（④ 含码点中断切点）+三联终结判定+ΣdeltaLen==accLen 守恒 |
| `stitch-compare.json` → `grading`（T0/T1/T2 定义与 band） | `{"T0":{pass,definition:"normalized equality (trim + whitespace collapse)"},…}` | S4a/S4d：拼接校验器单测（归一化全等/锚/长度带·**T3 定性器仅诊断工具不断言**——误报实证入 fixture 注记） |
| `probe-b.json` → `facts.usage` + `usageChunkEmptyChoices` | 空 choices usage chunk | S4a：usage 面解析→completion_tokens 量级对账 telemetry |
| `probe-c.json`（404 model_not_found 前置） | 零流字节 | S4a：⑧res.ok 先判→错误分类→禁重试断言 |
| `run-manifest.json`（knife/runId/scriptSha256/pins/verdicts） | 运行元数据 schema | 各 S4 刀收据形态惯例沿用 |
| 合成 fixture（S2 未实测·本设计携带）：①流中 error frame 帧卷 ②EOF 去 [DONE] 截断卷 ③>10s 停滞卷 ④>4KB 码点安全切分卷 | 手工构造·标注 synthetic | §E 矩阵 ①②③④ 各行对应断言 |

 prove 纪律：全矩阵 fake seam 零模型外呼·`actualSpendCny=null`·Ban retry-to-green·收据沿 `receipts/<knife>/` 惯例。

## §H 必备面 ①-⑧ 覆盖对照表（REQUEST §1 清单逐面对账）

| 面 | S2 态 | 设计落点 | 实施刀 |
|---|---|---|---|
| ① 流中 error frame | 未实测（HTTP 前置拦截） | §E-① 矩阵行 + §G 合成 fixture | S4a |
| ② 静默断流 | 未实测（B 三联齐） | §E-②（三联终结判定+EofWithoutDone 键） | S4a |
| ③ idle/总闸截断 | 未实测（间隔 ≤153ms） | §E-③（10s watchdog+双层期限） | S4a/S4c |
| ④ 跨 chunk 多字节 UTF-8 | 未单测 | §E-④ + §C-2 码点安全切分 | S4a |
| ⑤ 并发/取消/续传/计费 | — | §E-⑤ + §C-3/C-4（槽/不取消/光标防毒/禁双跑） | S4b/c |
| ⑥ 长流 pacing | 样本 72 字符（如实登记） | §E-⑥ 三层 coalesce（L1 合帧/L2 有界环/L3 rAF） | S4b/c/d |
| ⑦ 拼接校验 | T0 pass·T3 误报实证 | §E-⑦（守恒+归一化全等·禁裸前缀启发式） | S4a/d |
| ⑧ 非 200+JSON error body | C 实测（404 前置） | §E-⑧（res.ok 先判·4xx 禁重试·一等路径） | S4a |

## §I 实施分批切片建议（EXEC 刀拆分·每片独立 REQUEST·序依赖 a→b→c→d）

| 切片 | 触碰面 | 内容 | 关键验收 |
|---|---|---|---|
| **S4a** 流式通道 | `packages/ai-runtime/src/model-client.ts`（+fake seam·+flag 门） | §D-1 completeStream+wire 三联/⑧/idle/守恒自检；零 live prove（合成+收据 fixture·§G） | 双 preview flag fail-closed·G7 零触·packages 面 tsc/arch 门绿 |
| **S4b** worker 观察缝 | `apps/worker/src/`（token-stream.ts+三触发面接线） | §D-3 withTokenStream+L1 合帧+pg_notify+seq 分配+对账 telemetry | 零 migration（NOTIFY 无表改）·0126/红线面零触·progress 面零回归 |
| **S4c** api delta 臂 | `apps/api/src/platform/sse-notify.service.ts`+`sse-pump.ts`+interview.controller | §C 通道/环/光标防毒+§D-4 deltaSource 注入 | 行泵语义零改·槽 ≤5 不变·单例 LISTEN 不变 |
| **S4d** web 渲染管线 | `apps/web/lib/stream/`（business-events/interview-state/interview-stream） | §F zod 成员+delta 归约+终态权威覆盖+UX-A 打字机 | 断线三语义（幂等覆盖/终态清除/缺帧不死等）沿阶段1 断言强度 |

每片自带： REQUEST（双审后 EXEC）·收据·`CLAUDE.md:54` 目录句与 SSE 目录更新随 S4c/d 落（A13）·全链 flag OFF 缺省=上线旗标另裁。

## §J Ban 合规自检（对 REQUEST §3）

零产品码：本文档+收据 docs-only，apps/packages/scripts 零字节 ✓ · g7 车道零触：§D-2 flag 缺省 OFF·预约/终结面零声明变更 ✓ · Key name-only：本刀零 Key 触碰零 live（est live=0）✓ · pins 十一值见 §3 ✓ · 实现不自批：本设计交 post-prove 双审·alone≠dual ✓ · SSOT（CLAUDE.md/backlog）零触 ✓。
