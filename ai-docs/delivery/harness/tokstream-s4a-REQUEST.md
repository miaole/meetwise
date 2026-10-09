# TOKSTREAM-S4a — 流式通道切片（model-client completeStream 实现+fake seam 测试矩阵 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 REQUEST 只送审 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 自动开工 · 须 meetwise 明示授权才进 EXEC · EXEC 写完本档即停零码动）
**Status+（EXEC append-only · 2026-10-07 · 原行零改写）**: → **`exec:awaiting_post_prove_dual`**（S4a 七项+C1-C12 已实施 · prove 终态三卷 EXIT=0：stream 54/54·stitch 16/16·coalesce 13/13 · attempts 全账 8 次如实入收据（stream 4/stitch 2/coalesce 2·终态非一次过·红因全测试侧）· 收据 @ `ai-docs/delivery/receipts/tokstream-s4a/2026-10-07/` · apps/ 零字节 · est live=0 · 待 post-prove 双审）
**Date**: 2026-10-07
**Base**: 主线 `0aa1d503` · 分支 `line/tokstream-s4a-request`（工作树 `meetwise-line-tokstream-s4a`）
**蓝本**: `ai-docs/delivery/harness/tokstream-s3-design.md`（S3 设计定稿 @`0aa1d503` 已在主线）——**唯一蓝本**：§I 切片表 S4a 行+§C/§D-1/§E/§G 为全部设计输入，**禁自由发挥**，S4a 范围严格=§I 表 S4a 行，逐条誊录不增删。
**Honesty**: 本档全部 file:line 锚点在 `line/tokstream-s4a-request` @`0aa1d503` 实树亲读验证（apps/worker、packages/ai-runtime、packages/db、apps/api、CLAUDE.md、S2 收据卷·行号错=审席 FAIL）；设计原文引文逐字誊录字节一致；非 S4a 标注面的 worker/api/web 锚点为非范围引证（同样亲读）。

---

## ① 范围（§I 表 S4a 行逐条誊录）

设计 §I 切片表 S4a 行原文（逐字照抄）：

> | **S4a** 流式通道 | `packages/ai-runtime/src/model-client.ts`（+fake seam·+flag 门） | §D-1 completeStream+wire 三联/⑧/idle/守恒自检；零 live prove（合成+收据 fixture·§G） | 双 preview flag fail-closed·G7 零触·packages 面 tsc/arch 门绿 |

主战场=worker 侧 model-client completeStream 观察缝（设计 §④：declare 面 S3 已给签名，**S4a=实现+fake seam 测试矩阵，零真实模型外呼**）。S4a 范围七项（编号沿必备面 §E 矩阵·§G 测试矩阵 S4a 标注行）：

| # | 项 | 设计承载（原文誊录） | fixture |
|---|---|---|---|
| ① | 流中 error frame 合成 fixture+处理路径 | §E-①：「解析 `data:{error…}` 帧 → 即刻截断+error 终态+Σlen 封账（守恒账面到中断点）」（S2 未实测——C 被 HTTP 前置拦截，REQUEST 明示设计携带） | 合成卷①（§G） |
| ② | 静默断流三联终结判定+EofWithoutDone | §E-②：「EOF 且无 finish_reason/usage/[DONE] → `streamEndedByEofWithoutDone`（probe-b 已有键）→ error 终态」；三联判定=「finish_reason=stop chunk + 空 choices usage chunk + `data:[DONE]`」（§D-1） | 截断卷②：去 [DONE] 重放 |
| ③ | idle watchdog 测试面 | §E-③：「**idle watchdog**：无字节 >10s → 截断走①路径；**总闸**：流式 transport 期限沿 `resolveModelDeadlineConfig`（A14）另设流式值+泵侧 10min 帽（A5 `:69`）双层；任一触发=error 终态·禁自动重跑」。**分层裁定**：§I S4a 内容列明载「idle」→ **10s watchdog 本体在 S4a（model-client 通道内）**；双层期限的「泵侧 10min 帽」半层属 S4c（§H ③行实施刀=S4a/S4c）；S4a 面含本体+合成停滞卷断言 | 合成停滞卷③ |
| ④ | 跨 chunk 多字节 UTF-8 码点安全切分 | §E-④：「`TextDecoder({stream:true})`+末尾 `{stream:false}` 冲洗；**帧切分码点安全**（§C-2·孤立代理项禁）」；§D-1 wire 纪律：「`fetch` `res.body` ReadableStream + TextDecoder streaming（§E-④）」；§C-2：「沿 `model-client.ts:115` codepointSafeSlice 同型，绝不拆孤立代理项」 | 合成卷④（>4KB 码点中断切点）+ probe-b-sse-chunks 按字节切重放 |
| ⑦ | 拼接校验器单测 | §G：「S4a/S4d：拼接校验器单测（归一化全等/锚/长度带·**T3 定性器仅诊断工具不断言**——误报实证入 fixture 注记）」；§E-⑦：「**运行时**：长度守恒 ΣdeltaLen==accLen（D-1 通道自检+web 缓冲面）+终态到达时归一化全等对照（trim+折叠空白·不匹配=telemetry+仍用终态权威）；completion_tokens 量级对账=**telemetry 非门**（跨语言 tokens≠字符可比）；**明文禁裸前缀重叠启发式**（S2 T3 误报会改坏正确输出——该启发式只许存在于离线诊断工具）」。S4a 承担通道侧守恒自检+校验器单测；web 缓冲面半=S4d | stitch-compare.json `grading` |
| ⑧ | 非 200+JSON error body | §E-⑧：「`res.ok` 先判（D-1）→ 一等错误路径→worker 发 error 终态（`*_unavailable`/`error` kind 既有）·**4xx 禁重试**（S2 余量语义沿袭）」。S4a 承担通道面 res.ok 先判+`classifyProviderError` 既有分类（`g7-freetier-reprove-guard.ts:238`）+4xx 禁重试断言；worker 发 error 终态发射面属 worker 观察缝（S4b 触碰面） | probe-c.json（404 前置实测卷） |
| ⑨ | L1 合帧行为 | §G：「S4a：L1 合帧行为（重放→合帧后帧率/字节上界断言）」——probe-b.json `facts.curve`（17 chunk·间隔 1–153ms）t=ms 时间轴重放。参数沿 §C-2/§D-3：§C-2 原文「L1 合帧后单帧 `text` 字节 ≤4KB（NOTIFY 载荷上限 8KB 的安全半幅）」，~100ms 窗沿 §D-3。**落点收束（EXEC 审定）**：§G 明标该测试落 S4a，而 §I 将 worker TokenSink 生产合帧体归 S4b——S4a 在其触碰面（packages/ai-runtime）内 declare 合帧行为面使 §G 行 1 断言在零 worker 触碰下成立，worker 接线属 S4b | probe-b.json `facts.curve` 17 chunk 重放 |

附：§G 另两行 S4a 标注（并入上表 ④⑦⑧ 的驱动面）：「S4a：TextDecoder 按字节切重放（④ 含码点中断切点）+三联终结判定+ΣdeltaLen==accLen 守恒」（`probe-b-sse-chunks.redacted.txt`）·「S4a：usage 面解析→completion_tokens 量级对账 telemetry」（`probe-b.json` `facts.usage`+`usageChunkEmptyChoices`）。

**S4a 触碰面收束**（§I S4a 行）：`packages/ai-runtime/src/model-client.ts`（+fake seam·+flag 门）+ `packages/ai-runtime/test/*.proof.ts`（fake seam 测试矩阵）+ `packages/ai-runtime/package.json`（`prove:` script 槽）+ 收据 `ai-docs/delivery/receipts/tokstream-s4a/`（§G：「收据沿 `receipts/<knife>/` 惯例」）。apps/ 零字节。

## ② 非范围

1. **S4b 全部行**（§I 原文）：「**S4b** worker 观察缝 | `apps/worker/src/`（token-stream.ts+三触发面接线） | §D-3 withTokenStream+L1 合帧+pg_notify+seq 分配+对账 telemetry | 零 migration（NOTIFY 无表改）·0126/红线面零触·progress 面零回归」。含 §D-2 `invoke.ts` `onModelDelta` 观察缝（§I 未列于 S4a 触碰面）；A9 三触发面接线（亲读锚：`apps/worker/src/interview-service.ts:213`·`:307`·`apps/worker/src/adaptive-interview-service.ts:113`，均在 `withGenerationProgress` 调用行旁）；`interview_token_ch` pg_notify 通道面（`packages/db/migrations/0143_sse_push_notify.sql:26` 为 `interview_event_ch` 既有通道·零触）；generation-progress 全面零触（`apps/worker/src/generation-progress.ts:19/:26-35/:39-45`）。
2. **S4c 全部行**（§I 原文）：「**S4c** api delta 臂 | `apps/api/src/platform/sse-notify.service.ts`+`sse-pump.ts`+interview.controller | §C 通道/环/光标防毒+§D-4 deltaSource 注入 | 行泵语义零改·槽 ≤5 不变·单例 LISTEN 不变」。含 §E-③ 双层期限的**泵侧 10min 帽**半层（`apps/api/src/platform/sse-pump.ts:69`）；行泵单源化面零触（`:53` pumpSseEvents·`:92-93` ping/取数失败收尾即断）；单例 LISTEN 纪律零触（`apps/api/src/platform/sse-notify.service.ts:24`·通道/trigger 名 `:28-29`）；per-principal 槽 ≤5 零触（`apps/api/src/modules/interview/interview.controller.ts:253-272`）。
3. **S4d 全部行**（§I 原文）：「**S4d** web 渲染管线 | `apps/web/lib/stream/`（business-events/interview-state/interview-stream） | §F zod 成员+delta 归约+终态权威覆盖+UX-A 打字机 | 断线三语义（幂等覆盖/终态清除/缺帧不死等）沿阶段1 断言强度」。含 §F `token_delta` zod 成员注册（双端同刀纪律归 S4c/d）；L3 渲染 rAF pacing（§G 行 1 S4d 半）；web 缓冲面拼接校验半（⑦）。
4. **CLAUDE.md SSOT 零触**：`CLAUDE.md:54` 事件目录句「The frontend consumes business events over SSE, not model tokens」——设计 A13：「其更新登记为 S4c/d 实施刀内事项（本刀零触 SSOT）」；§F：「`CLAUDE.md:54` 事件目录句与 SSE 目录登记为 S4c/d 刀内事项（A13·本刀零触 SSOT）」。backlog/coverage matrix 同零触。
5. **flag 零开启**：`MODEL_TEXT_STREAM_ENABLED`/`MODEL_TEXT_STREAM_PREVIEW` 本刀 declare 门面但**均不设**——§I：「全链 flag OFF 缺省=上线旗标另裁」；§D-2 G7 车道注记：「freetier 下 flag 缺省 OFF=零触；stream 通道不进 g7 预约/终结面；未来 ON 须另刀 g7 车道审批」。
6. **api/worker 运行时行为零改=纯新增 declare+seam+测试**：apps/api、apps/worker 零字节；`model-client.ts:403` 既有 dispatchOnce 零改（§D-1：「不动 `:403` 既有 dispatchOnce」）；`:362` complete 非流式语义原值零回归；`packages/ai-runtime/src/index.ts:32-33` 导出面零改（S4a 测试沿 proof 惯例直 import 源文件，导出扩充属 S4b 接线面）；A12 关口不变面零触（`packages/ai-runtime/src/invoke.ts:19` doubleValidate·`:135` InvokeSpec.idempotencyKey——claim/幂等/计费/双校验链不可旁路）。
7. **零 migration·零持久面**：interview_event 0126 围栏零触（`packages/db/src/interview-event.ts:16` appendEvent·`:24-28` event_key 幂等）；§C-5 红线承继：token text「仅传输态，Ban 落 interview_event」。
8. **零 G7 面**：`g7_` 前缀族抛出语义 §2.2 冻结零触（设计 §1「G7 车道」行）；g7 预约/终结面（`reserveFor`/`finalizeG7ReservationOnSharedLedger`，`model-client.ts:424-438/:455-471`）零声明变更。

## ③ 逐条改动清单（file:line 现状→目标·全数亲读 @`0aa1d503`）

| # | 码面 | 现状（亲读） | 目标（§D-1 誊录） |
|---|---|---|---|
| C1 | `packages/ai-runtime/src/model-client.ts:38-44` | `ModelClient` 接口仅 `complete/prepare/costPolicy` 成员，零流式成员 | 按 §D-1 注记「openAICompatibleClient 增流式通道」declare `completeStream`，签名逐字照抄 §D-1 代码块（全文誊录见本表下方）；接口归属沿该注记收束于 openAICompatibleClient 具体客户端，EXEC 按 tsc/arch 门收束 |
| C2 | `packages/ai-runtime/src/model-client.ts:362`（complete）·`:395`（chatUrl）·`:403-422`（dispatchOnce 一次性 JSON POST·请求体 `:412-421` 零 `stream` 字段） | 现行 text 调用=非流式（设计 A2 在本分支仍成立亲证） | 新增流式通道分支：flag 双开时 `stream=true`+`stream_options.include_usage` 走 `res.body` ReadableStream；**`:403` dispatchOnce 本体零字节零改**，非流式路径语义原值零回归 |
| C3 | `packages/ai-runtime/src/voice-stream.ts:5-6`（双 preview flags 注记）·`voice-stream-preview.ts:20-24`（production/enforce/public-preview 锁）·`:26-28`（`ENABLED=1 ∧ PREVIEW=1`）·`:49-57`（refuse fail-closed 先例） | OCR 式双 preview flag 形制先例 | flag 门 declare，§D-1 原文：「MODEL_TEXT_STREAM_ENABLED=1 且 MODEL_TEXT_STREAM_PREVIEW=1 才启用；否则 completeStream 恒走非流式（零回归）。」+ production/enforce/public-preview refuse-closed 沿 `:20-24` 形制——fail-closed 缺省 OFF |
| C4 | `packages/ai-runtime/src/model-client.ts:331`（`textOverrideAllowed = NODE_ENV==='test' && MODEL_TEST_TRANSPORT_OVERRIDES==='1'`）·`:321-322`（rejectTextTransportOverride 构造期拒绝，实现 `text-endpoint-config.ts:118`） | 既有测试 transport seam | 「测试 transport seam 沿 MODEL_TEST_TRANSPORT_OVERRIDES 既有缝（rejectTextTransportOverride 语义原值）」——流式通道零新增 env 注入面，fake 证明走 globalThis.fetch mock（沿 `test/model-client-dispatch.proof.ts:55` 替换/`:77` 还原形制） |
| C5 | `packages/ai-runtime/src/timeout.ts:203-212`（`if (!response.ok)` 先判→bodySnippet slice(0,512)→`ExternalHttpStatusError` `:80-82`）·`g7-freetier-reprove-guard.ts:238`（classifyProviderError） | 非 200 先判+错误分类既有面 | ⑧通道面：§D-1 wire 纪律全文逐字誊录——「wire 纪律（S2 实测承接）：`fetch` `res.body` ReadableStream + TextDecoder streaming（§E-④）；`res.ok` **先判**（⑧）非 200 读 JSON error body 走 `classifyProviderError` 既有分类面；终结三联判定=finish_reason=stop chunk + 空 choices usage chunk + `data:[DONE]`；EOF 无三联=静默断流（§E-②）。ΣdeltaLen==accLen **通道内自检断言**（⑦长度守恒）。」；**4xx 禁重试**断言（probe-c.json note 亲证：「probe C is never retried (REQUEST pin)」） |
| C6 | 三联终结判定（新面） | 无 | 三联判定（§D-1 wire 纪律内·见 C5 全文）；②静默断流：「EOF 无三联=静默断流（§E-②）」→ `streamEndedByEofWithoutDone`（probe-b.json `attempts[0].facts` 既有键亲证在场）→ error 结果·**禁自动重跑**（§E-⑤ 计费纪律原文：「**计费：流中失败禁自动重跑**（Ban 双跑双扣）·重试=用户显式路径（attemptKey 幂等重放既有）」） |
| C7 | idle watchdog+流式期限（新面） | `model-client.ts:422` 现行非流式期限 `resolveModelDeadlineConfig().transportTimeoutMs`（`invoke.ts:237-241`，`:239` 缺省 30s 级） | §E-③：10s idle watchdog（无字节 >10s → 截断走①路径）+流式 transport 期限沿 `resolveModelDeadlineConfig` 另设流式值（declare）；泵侧 10min 帽半层=S4c 非范围 |
| C8 | TextDecoder streaming+码点安全切分（新面） | `model-client.ts:115` `codepointSafeSlice`（高代理末位回退·亲读） | §E-④：`TextDecoder({stream:true})`+末尾 `{stream:false}` 冲洗；超长 delta 码点安全切分沿 `:115` 同型——「绝不拆孤立代理项」（§C-2） |
| C9 | ΣdeltaLen==accLen 守恒自检+拼接校验器（新面） | 无 | §D-1：「ΣdeltaLen==accLen **通道内自检断言**（⑦长度守恒）」；校验器单测三面=归一化全等（trim+折叠空白）/锚/长度带（`|Δ|/len ≤ 10%`，stitch-compare.json `grading.T2.band` 亲读）——**T3 定性器仅诊断禁断言**（`grading.T3` 亲读：`pass:false, overlapViolations:1, resendViolations:1` 误报实证入 fixture 注记） |
| C10 | L1 合帧行为面 declare（新面） | 无 | §G 行 1：「S4a：L1 合帧行为（重放→合帧后帧率/字节上界断言）」——~100ms 窗/≤4KB 码点安全切分参数面 declare 于 packages/ai-runtime 触碰面内；worker TokenSink 生产接线=S4b（§I）；帧率/字节上界断言=probe-b 17 chunk 重放后合帧率与单帧 ≤4KB 上界 |
| C11 | `packages/ai-runtime/test/`（新增 proof 文件·沿 `*.proof.ts` 惯例）+ `packages/ai-runtime/package.json:45` 形制（`"prove:model-client-dispatch": "tsx test/…"` script 槽先例） | 既有 43 个 proof+live .mjs | 新增 fake seam 测试矩阵 proof（命名 EXEC 定，建议 `model-client-stream.proof.ts`+`stitch-validator.proof.ts`+`token-coalesce.proof.ts`）+ 对应 `prove:` script 槽；fetch mock 沿 `model-client-dispatch.proof.ts:8-14` 形制（「无网络、无真实凭据」） |
| C12 | 收据 `ai-docs/delivery/receipts/tokstream-s4a/`（新增） | 无 | §G prove 纪律：「收据沿 `receipts/<knife>/` 惯例」；manifest 形态沿 `run-manifest.json` 亲读 schema（knife/requestBlueprint/runId/scriptSha256/guards/pins/attemptsLedger/verdicts/estimatedCostCny/receipts——本刀 estimatedCostCny=0·零外呼） |

§D-1 `completeStream` 签名块（设计原文逐字誊录）：

```ts
completeStream(req: CompletionRequest, opts: {
  signal?: AbortSignal;
  onDelta: (d: { text: string }) => void;          // 码点完整 JS 字符串；调用方不得假设分帧=token 边界
  onUsage?: (u: { completionTokens?: number; promptTokens?: number }) => void;
}): Promise<ModelResult>;                           // 返回值与非流式同型（raw=完整 JSON 解析·usage 面同）
```

## ④ prove 判据（全 fake seam · 零模型外呼）

设计 §G prove 纪律（逐字誊录）：「prove 纪律：全矩阵 fake seam 零模型外呼·`actualSpendCny=null`·Ban retry-to-green·收据沿 `receipts/<knife>/` 惯例。」

1. **全 fake seam 零模型外呼**：transport 恒经 fetch mock/override 缝（C4/C11），`est live=0`（零 Key 触碰·零网络·`actualSpendCny=null`）。
2. **合成 fixture 4 卷映射**（§G 原文：「合成 fixture（S2 未实测·本设计携带）：①流中 error frame 帧卷 ②EOF 去 [DONE] 截断卷 ③>10s 停滞卷 ④>4KB 码点安全切分卷 | 手工构造·标注 synthetic」）：

| 卷 | 驱动断言 | §E 行 |
|---|---|---|
| ① 流中 error frame 帧卷（synthetic） | `data:{error…}` 帧→即刻截断+error 结果+Σlen 封账守恒到中断点 | ① |
| ② EOF 去 [DONE] 截断卷（synthetic·由 probe-b 卷派生去 [DONE]） | 三联不齐→`streamEndedByEofWithoutDone`→error 结果·零自动重跑 | ② |
| ③ >10s 停滞卷（synthetic） | watchdog 截断走①路径·error 结果·禁自动重跑 | ③ |
| ④ >4KB 码点安全切分卷（synthetic·含 astral 码点中断切点） | 切点零孤立代理项+ΣdeltaLen==accLen 守恒 | ④ |

3. **收据 fixture 卷映射**（S2 收据 @`ai-docs/delivery/receipts/tokstream-s2-probe/2026-10-07/`·全数亲读）：`probe-b.json` `facts.curve`（17 chunk·ttftMs=274·nonEmptyDeltas=13）→ ⑨ L1 合帧行为重放断言；`probe-b-sse-chunks.redacted.txt`（17 行 `t=<ms> data: <raw>`·尾三行=stop chunk+空 choices usage chunk+`[DONE]`）→ ④按字节切重放+三联终结判定+守恒；`stitch-compare.json` `grading`（T0 `definition:"normalized equality (trim + whitespace collapse)"`·T1 anchorLen 50·T2 band·T3 误报实证）→ ⑦校验器单测；`probe-b.json` `facts.usage`（completion_tokens=43）+`usageChunkEmptyChoices=true` → usage 面解析→completion_tokens 量级对账 telemetry（非门）；`probe-c.json`（status=404·errorSurface=http_status_first·totalMs=225·零流字节）→ §G 原文「S4a：⑧res.ok 先判→错误分类→禁重试断言」。
4. **门清单**：双 preview flag fail-closed 断言（双开才启用/单开或零开恒走非流式/production·enforce·public-preview 锁面沿 `voice-stream-preview.ts:20-24` 形制）·G7 零触断言（g7 预约/终结面零声明变更）·非流式零回归断言（`:403` dispatchOnce 零字节·`:362` complete 语义原值）·EXIT=0 **一次过**（attempts 全账·Ban retry-to-green）·packages 面 tsc/arch 门绿（`turbo.json:7` typecheck·`:10` arch）·收据落 `receipts/tokstream-s4a/`。

## ⑤ Ban（全列）

1. **Ban retry-to-green**：prove EXIT=0 须一次过，attempts 全账如实入收据（§G prove 纪律）。
2. **Ban 双跑双扣**：流中失败禁自动重 invoke（§E-⑤「计费：流中失败禁自动重跑（Ban 双跑双扣）」·§C-3「**明令禁止**：为补 delta 而重跑模型调用（双跑双扣·§E 计费纪律）」）；本刀零外呼，4xx 禁重试语义钉死入通道。
3. **Ban self-approve**：实现不自批·本 REQUEST 只送 pre-exec 双审·Dual PASS ≠ 开工·alone≠dual。
4. **Ban SSOT 触碰**：`CLAUDE.md:54` 事件目录句+SSE 目录零触（A13·登记 S4c/d 刀内事项）·backlog/coverage matrix 零改。
5. **Key name-only**：零 Key 触碰零 live（est live=0·无授权外呼面·零 secrets/.env 入库——staged 内容过 secret gate）。
6. **零 G7 面**：`g7_` 前缀族抛出语义 §2.2 冻结零触·stream 通道不进 g7 预约/终结面·flag 缺省 OFF=零触（§D-2）。
7. **刀专项硬 Ban**（蓝本承继）：明文禁裸前缀重叠启发式（§E-⑦「该启发式只许存在于离线诊断工具」）·Ban token text 落 interview_event（§C-5）·Ban 同刀注册 web 半边（§F「禁半边注册」——S4a 零触 `apps/web/`）·Ban 既有 dispatchOnce/complete/g7 卫兵面字节改动。

## ⑥ pins（十一值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗）

## ⑦ Non-claims

设计 ≠ 实施 ≠ 流式上线 ≠ flag 开启。本 REQUEST ≠ EXEC 编码授权；completeStream declare+实现 ≠ 任何生产调用方接线（三触发面接线属 S4b）≠ 流式通道可用性声明（全链 flag OFF 缺省）≠ 用户可见流式能力；T3 定性器禁断言 ≠ 拼接正确性弱化（T0 归一化全等+守恒自检承重）；telemetry 对账非门（§E-⑦）；`releaseEvidence=false`·`actualSpendCny=null`。

## ⑧ STOP

**STOP · `awaiting_pre_exec_dual` · alone≠dual。** REQUEST 写完即停零码动；EXEC 须双审 PASS + meetwise 明示授权；Ban self-approve；Ban retry-to-green。

---

*TOKSTREAM-S4a EXEC REQUEST · 2026-10-07 · draft:awaiting_pre_exec_dual · base 主线 `0aa1d503` · 分支 `line/tokstream-s4a-request` · 蓝本=tokstream-s3-design.md §I S4a 行 · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*
