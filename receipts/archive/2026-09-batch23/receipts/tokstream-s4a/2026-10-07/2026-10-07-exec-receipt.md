# TOKSTREAM-S4a EXEC 收据（2026-10-07）

**knife**: tokstream-s4a · **seat**: EXEC（mw-core 北星 loop） · **分支**: `line/tokstream-s4a-request`
**唯一蓝本**: `ai-docs/delivery/harness/tokstream-s4a-REQUEST.md` @`3b84c6e0`（预执行双审 BOTH PASS · 协调方 EXEC 授权）· 蓝本依赖 `tokstream-s3-design.md` §I S4a 行+§C/§D-1/§E/§G
**Base**: 主线 `0aa1d503` · **工作树**: `meetwise-line-tokstream-s4a` · **零 live**: est live=0 · actualSpendCny=null
**Status 推进**: `draft:awaiting_pre_exec_dual` →（本刀完成）**`exec:awaiting_post_prove_dual`**（REQUEST 状态行 append-only）

---

## 1. 交付物与 diff numstat（逐文件）

| 文件 | 变更 | 分类 |
|---|---|---|
| `packages/ai-runtime/src/model-client.ts` | +422 −3 | **新增 declare 面**（§1 七项承载：双 preview flag 门+流式期限+L1 合帧行为面+拼接校验器+completeStream 实现）。−3=import 行扩 `combineAbortSignals,timeoutSignal`、`openAICompatibleClient` 返回注解 `ModelClient`→`OpenAICompatibleClient`、`const client` 类型注解同——三处均为声明面宽化，行为零变 |
| `packages/ai-runtime/test/model-client-stream.proof.ts` | 新增（422 行级） | **测试**：fake seam 测试矩阵 54 断言（flag 门/wire 纪律/①②③④⑧卷/守恒/g7 零触静态/零字节 pin/index.ts:32-33 pin） |
| `packages/ai-runtime/test/stitch-validator.proof.ts` | 新增 | **测试**：⑦校验器单测 16 断言（T0/T1/T2 收据复现+负例+T3 结构性禁入+误报实证 fixture 注记） |
| `packages/ai-runtime/test/token-coalesce.proof.ts` | 新增 | **测试**：⑨L1 合帧行为 13 断言（probe-b 重放+合成卷④>4KB 码点切分） |
| `packages/ai-runtime/package.json` | +3 −0 | **prove: 槽**（`prove:model-client-stream` / `prove:stitch-validator` / `prove:token-coalesce`，沿 `:45` 形制） |
| `ai-docs/delivery/receipts/tokstream-s4a/2026-10-07/*` | 新增 | **收据**（本卷） |
| **apps/** | **零字节** | git status 零 apps/ 条目（Ban 核查）·`src/index.ts` 零字节（导出面 :32-33 pin 断言 PASS） |

## 2. §1 七项 → 落点 → 判据（逐键 EXIT 原值）

| # | 项 | 落点（model-client.ts） | proof 判据（终态原值） |
|---|---|---|---|
| ① | 流中 error frame | `completeStream` handleFrame `error != null` → 即刻截断+error 终态+assertConservation 封账到中断点 | 合成卷①（synthetic）：`data:{error…}` 后 delta 不再发出（拼接='AB'）·ok:false/transient/unknown·单飞 ×2（整卷/切 7B）PASS |
| ② | 三联终结+EofWithoutDone | stop chunk+空 choices usage chunk+`[DONE]` 三账面；EOF 无三联→error（`streamEndedByEofWithoutDone` 语义·禁自动重跑） | probe-b 全卷重放三联 ok:true·usage 43/32 PASS；合成卷②去 [DONE]：error 终态·calls=1 PASS |
| ③ | idle watchdog 10s 半层 | `MODEL_STREAM_IDLE_WATCHDOG_MS=10_000`+`resolveModelStreamDeadlineConfig`（总闸=A14 execution 维度·零新增 env）；泵侧 10min 帽=S4c 非范围 | 合成卷③：watchdog 截断 error 终态·实测 **10001ms/10004ms**（两次运行）≥10s 钉值 PASS；总闸缝 1s：实测 **1024ms/1002ms** <10s 先触发 error·单飞 PASS |
| ④ | 跨 chunk 码点安全切分 | TextDecoder streaming+末尾 `{stream:false}` 冲洗；帧定界三分（decodeSSE 同族）；孤立高代理扣留前挂下一片；`splitCodepointSafeByBytes`（:115 同型换字节预算） | probe-b 按字节切 cut=13/cut=1：拼接全等 72 字符+零孤立代理项+三联 ok PASS；合成卷④ JSON `\ud83d`/`\udca4` 跨帧拆分→`a💤b`（U+1F4A4）PASS；合成卷④>4KB astral ≈14KB 单 delta 全帧 ≤4096B+切点零孤立代理项+守恒 PASS |
| ⑦ | 拼接校验器 T3 仅诊断禁断言 | `gradeStitchIdentity`（T0 归一化全等/T1 锚 50/T2 带 10%·定义与 band 逐字钉 stitch-compare.json）+`assertConservation` 通道内自检；T3 启发式零代码（结构断言） | 16/16 PASS：T0/T1/T2 收据复现（72/72/ratio 0·anchorLen=50·band 0.1）+负例×4+代码面零 T3 标识符+误报实证注记（'S'+'SE 是' 纯追加 vs 裸前缀启发式剥前缀改坏输出） |
| ⑧ | res.ok 先判+4xx 禁重试 | `!res.ok` 先判→bodySnippet slice(0,512)→`classifyProviderError` 既有分类面→status→kind 映射沿 ：517 同型；单飞零重试循环 | probe-c 404 重放：deterministic+known_not_executed·零 delta·恰一次 fetch PASS；`classifyProviderError(404 body)='capability_unsupported'` 亲证 PASS |
| ⑨ | L1 合帧 declare 面+probe-b 重放 | `coalesceTokenDeltas`+`MODEL_STREAM_L1_COALESCE_WINDOW_MS=100`（§D-3）+`MODEL_STREAM_FRAME_MAX_BYTES=4096`（§C-2=NOTIFY 8KB 半幅）；worker TokenSink 接线=S4b | 13 delta（12.5 fps）→**7 帧**（6.8 fps）·帧字节 [16,9,33,40,33,12,33] 全 ≤4096·拼接全等=收据 stitchedText 72 字符·coalesced 标记正确 PASS；两卷 17 行 cross-check（curve deltaLen↔delta 内容逐行相等）PASS |

**EXIT 原值**：`prove:model-client-stream` 终态 **0**（54/54）· `prove:stitch-validator` 终态 **0**（16/16）· `prove:token-coalesce` 终态 **0**（13/13）。attempts 全账（stream 4 次·stitch 2 次·coalesce 2 次·含每次红因）见 `run-manifest.json` attemptsLedger——**终态 EXIT=0 非一次过**，红因全部在测试侧（mock 保真度/期望字面量/解析缺陷），product 通道面 attempt 1 起零行为变更（仅一处注释补键名），未放松任何断言。如实披露，交 post-prove 双审判定。

## 3. C1-C12 落实对照

- **C1** `completeStream` 归属 `openAICompatibleClient` 具体客户端（`OpenAICompatibleClient = ModelClient & {completeStream…}`）；`ModelClient` 共享接口（:38-44）零改；签名逐字对齐 §D-1 代码块（含注释语义）。
- **C2** 流式分支：flag 双开时 `stream:true`+`stream_options.include_usage` 走 `res.body`；`:403` dispatchOnce sha256 pin 零字节（89c633f7…）·`:362` complete sha256 pin 零字节（3283dfcd…）·非流式行为断言（请求体零 stream 字段）PASS。
- **C3** 双 preview flag 门 fail-closed 缺省 OFF，沿 `voice-stream-preview.ts:20-24/:26-28/:49-57` 形制（三锁面+请求面+启用面+组合面四函数）；未双开恒走非流式（零回归）断言 ×6 例 PASS（零开/单开×2/public-preview 锁=非流式派发；production/enforce 锁=complete 既有 bound-operation fence 零外呼 deterministic 拒绝——原语义零回归）。
- **C4** 测试 transport 缝沿 `MODEL_TEST_TRANSPORT_OVERRIDES` 既有语义（rejectTextTransportOverride 原值零改）；流式通道零新增 env 注入面（总闸/idle 值由既有 A14 env 派生）；fake 证明走 globalThis.fetch mock（:55/:77 形制）。
- **C5** wire 纪律全文逐字落地（res.ok 先判→classifyProviderError→三联→EOF 无三联→ΣdeltaLen==accLen 通道自检）；`timeout.ts:203-212`/`g7-freetier-reprove-guard.ts:238` 既有面零改（未触碰）。
- **C6** 三联终结判定+EofWithoutDone→error 结果·禁自动重跑（单飞零重试循环，proof 断言 calls===1）。
- **C7** 10s watchdog 本体（10_001/10_004ms 实测触发）+流式总闸（`resolveModelStreamDeadlineConfig`=A14 execution 维度另设流式值·1s 缝实测 1024/1002ms 先于 watchdog）；泵侧 10min 帽=S4c 未触。
- **C8** TextDecoder streaming+末尾冲洗+超长 delta 码点安全切分（`splitCodepointSafeByBytes`，代理对永不拆）。
- **C9** 通道内 ΣdeltaLen==accLen 自检断言（`assertConservation`）+校验器三面单测（T0/T1/T2）；T3 定性器零代码（仅 fixture 注记+离线诊断归 S2 探针）。
- **C10** L1 合帧行为面 declare 于 packages/ai-runtime 触碰面内（~100ms 窗/≤4KB/码点安全）；probe-b 17 chunk 重放帧率/字节上界断言 PASS；worker 生产接线=S4b 未触。
- **C11** 三个 `*.proof.ts`+三个 `prove:` 槽（沿 ：45 形制）；fetch mock 沿 `model-client-dispatch.proof.ts:8-14`「无网络、无真实凭据」。
- **C12** 收据 `receipts/tokstream-s4a/2026-10-07/`（manifest 形态沿 `run-manifest.json` schema：knife/requestBlueprint/runId/scriptSha256/guards/pins/attemptsLedger/verdicts/estimatedCostCny/receipts·estimatedCostCny total=0·actualSpendCny=null）。

## 4. 勘误如实入账（双审清单转记）

- **E1**：`probe-b.json` curve 数据在 **`attempts[0].curve`** 非 REQUEST 所写 `facts.curve`（双审席1+席2 同证·本刀重放按 attempts[0].curve 实读，17 行与 sse-chunks 逐行 cross-check PASS）。
- **E2**：`generation-progress.ts` 行号蓝本偏差（`isGenerationProgressKind` @:19 对位；:26-35/:39-45 漂移——`GENERATION_PROGRESS_MAX_ROWS` 现约 :27、载荷白名单面约 :34 起）·本刀零触该文件，不受影响。
- **E3**：REQUEST C11「既有 43 个 proof」实为 **42 个 `*.proof.ts` + 3 个 live `.mjs`**（asr-stream-live/tts-stream-live/voice-turn-stream-live·`ls` 实数）；新增后 45 proof。
- **E4**：预执行双审勘误清单第 4 条，EXEC 授权面未载明细；本刀以行动覆盖——REQUEST §③ 全部 file:line 锚点在实树逐一亲读复核（C3 voice-stream-preview.ts:20-24/:26-28/:49-57、C4 :331/text-endpoint-config.ts:118、C5 timeout.ts:203-212/:80-82/g7-…:238、C7 :422/invoke.ts:237-241、C8 :115、C11 package.json:45、非范围6 index.ts:32-33 全部亲证在场一致），未发现残留偏差。

## 5. Ban 自检（§5 全列）

1. **Ban retry-to-green**：attempts 全账 8 次如实入 manifest（含终态非一次过披露）——见 §2。
2. **Ban 双跑双扣**：通道单飞零重试循环；4xx 禁重试断言 PASS；零外呼零消耗。
3. **Ban self-approve**：本收据交 post-prove 双审；EXEC 不自批。
4. **Ban SSOT 触碰**：CLAUDE.md/backlog/coverage matrix 零字节（git status 核查）。
5. **Key name-only**：零真实 Key（测试缝假值 `proof-text-key` 仅进程内·不入库）；零 secrets/.env 入库；零网络（fetch 全 mock）。
6. **零 G7 面**：g7 预约/终结面零声明变更（guard 源文件零字节）；completeStream 区域零 g7 标识符（静态断言 ×7 PASS）；flag 缺省 OFF=零触。
7. **刀专项硬 Ban**：裸前缀重叠启发式零代码（结构断言 PASS）；token text 零落 interview_event（零 db 面）；`apps/web` 零触；dispatchOnce/complete/g7 卫兵面 sha pin 零字节。

## 6. 停止条件核查（a-e）

- a) 实树与 REQUEST 锚点形状不符：**未命中**（全锚点亲读一致；E1/E2/E3 为行号/计数勘误已双审背书，形状相符）。
- b) 需触 apps/ 或既有行为路径字节：**未命中**（apps/ 零字节；既有行为路径仅 import 行与两处类型注解=声明面）。
- c) prove 判据非预存红原因红：**未命中**（红因全在测试侧，逐条入账）。
- d) 需真实模型外呼或 Key 值：**未命中**（est live=0）。
- e) 需改 §I 归 S4b/c/d 的面：**未命中**（worker/api/web 零字节；invoke.ts 零触；泵侧帽/pg_notify/token_delta 注册均未声明）。

## 7. EXEC 落点收束披露（post-prove 双审请重点复核三处）

1. **raw 非 JSON 兜底**：三联齐=成功终态；`raw` 优先 `JSON.parse(全文)`（与非流式同型），非 JSON 载荷（S2 probe-b prose 重放卷——json_object 未启用的 fixture 形态）按完整原文兜底零截断。理由：§E-② 对照面（三联齐≠error 终态）+重放卷权威性；生产行为面（json_object 启用）与非流式逐字同型。
2. **流式总闸取值**：`resolveModelStreamDeadlineConfig().transportTimeoutMs = resolveModelDeadlineConfig(env).executionTimeoutMs`（35s 级缺省·既有 `MODEL_EXECUTION_TIMEOUT_MS` 派生）——§E-③「沿 resolveModelDeadlineConfig 另设流式值」的 EXEC 收束：不新增 env 注入面（C4）且流式总时长天然长于非流式 30s 级 transport 窗；idle watchdog 10s 为 §E-③ 钉值。A14 既有约束 `transport ≤ execution` 在 1s 测试缝需两值同设（attempt 1 crash 即此约束的既有校验，非缺陷）。
3. **C3 三锁面在 production/enforce 下的行为**：未双开或被锁 → `completeStream` 恒走非流式 `complete` → production/enforce 下由既有 bound-operation fence 返回零外呼 `deterministic/known_not_executed`——这是 complete 原语义的零回归（比「非流式派发」更强的 fail-closed），proof 按此断言。

## 8. pins 十一值（零翻转声明）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗）——**十一值零翻转**。

## 9. Non-claims

S4a 实施 ≠ 流式上线 ≠ flag 开启（双 flag 缺省不设·零环境写入）；completeStream declare+实现 ≠ 任何生产调用方接线（三触发面=S4b）≠ 流式通道可用性声明；T3 禁断言 ≠ 拼接正确性弱化（T0+守恒承重）；telemetry 对账非门（S4b 面）；watchdog/总闸实测值为本机 fake seam 时钟实测，非生产 SLO；`releaseEvidence=false`。

---

*TOKSTREAM-S4a EXEC · 2026-10-07 · exec:awaiting_post_prove_dual · Ban self-approve · alone≠dual · pins 十一值零翻转 · actualSpendCny=null*
