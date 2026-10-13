# TOKSTREAM-S4B REQUEST（批2-C2 流式进度收口刀 · #160 残面+#163 残面 = S3 §I 切片 S4b/S4c/S4d 三行接线收口 · api delta 臂 + web 逐 token 渲染 + 断开取消语义生产化 + 双 flag 翻转策略 · 起草 docs-only 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（本卷只送审 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 自动开工 · 须 meetwise 明示授权才进 EXEC · 派单=主会话显式给本卷路径）· **⛔push**（全程零 push）· est live=0 · markers=0 · pins 十一值照抄 · 门预申明=新 proof+SSE 契约面+typecheck+docs:check（§3）。
**Date**: 2026-10-13
**Base**: 主线 `feat/mysql-schema-skeleton` @`f0147886`（本地=origin 同点 · `git log -1` 亲证 · `git merge-base --is-ancestor 6aa83c48 HEAD` 亲证 S4a nail 在祖先链）· 分支 `line/tokstream-s4b` · 工作树 `meetwise-s4b`（主仓同级 · `git worktree add … -b line/tokstream-s4b f0147886` 本起草席立 · 建前无同名树同名分支亲证）。
**蓝本**: ①`ai-docs/delivery/harness/tokstream-s3-design.md`（S3 设计定稿已在主线 · §B/§C-1..5/§D-1..5/§E-⑤⑦/§F/§G/§I 为全部设计输入 · **禁自由发挥**）②issues-master 更正版 #160 `:342` / #163 `:413`（外部卷宗 `~/Documents/Meetwise产品审计-更正版/issues-master.md` · 本席 2026-10-13 亲读誊录 · batch5b-mig 同引形制）③派单口径=批2-C2 协调方简报四件（api SSE 泵接 completeStream+前端逐 token 渲染+断开取消语义生产化+双 flag 翻转策略）④形制=ag-d-admission-REQUEST（跨树 `meetwise-agd` · Ban/pins 同源誊录）。
**Honesty**: 本卷 §0 全部 file:line 在 `line/tokstream-s4b` @`f0147886` 实树亲读（rg/sed/Read 实测 · 行号错=审席 FAIL）；issues-master 两行原文亲读；S3 设计引文逐字对齐；战役刀名与 §I 行名错位如实钉死（§1.0-③）。

## §0 现状锚（起草席亲读 @`f0147886` · **EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚 · 结论不变则只更行号）

### 0.0 防重双对表

- 建前 `git worktree list`（主仓侧）无 s4b 同名树；`git branch --list "line/tokstream-s4b"` 建前空输出（本席建树建分支）；`rg -l "tokstream-s4b" ai-docs/delivery/harness/` 建前零命中（本卷落卷后唯一同名卷=本卷）。
- 邻刀界碑亲证：`tokstream-s4a-REQUEST.md` 在树（S4a 已交 · 触发面/观察缝明示归后刀）；`resume-grounding-REQUEST.md:7` 与 `extrev-score-writer-REQUEST.md` 交叠声明引「S4b 的 token-stream 接线」系登记性引用非同名卷——防重过 · 停止条件未触发。

### 0.1 锚表（23 锚 · `f0147886` 实树亲证 · **EXEC 重 pin 只准更锚不准翻定性**）

| # | 面 | 锚（file:line @`f0147886`） | 亲证事实 |
|---|---|---|---|
| A1 | S4a completeStream 实现 | `packages/ai-runtime/src/model-client.ts:875`（impl 起）·`:879-881`（flag 门回退 `client.complete(req,1,opts.signal)` 非流式）·`:901`（流式期限解析）·`:903-916`（`stream:true`+`stream_options.include_usage` body）·`:919-928`（ΣdeltaLen==accLen 守恒账面+assertConservation）·`:930-943`（码点安全 pushDeltaText）·`:945-947`（三联终结+流中 error frame/idle 账面） | S4a 交付面在树 · recon 三锚（:352-355/:530/:543）同域零翻 |
| A2 | S4a 双 flag 门 | `model-client.ts:338`（`MODEL_TEXT_STREAM_UNCONFIGURED` 码）·`:341-345`（production/enforce/public-preview 三锁 refuse-closed）·`:348-350`（`ENABLED=1 ∧ PREVIEW=1` 请求面）·`:353-355`（isModelTextStreamPreviewEnabled fail-closed 缺省 OFF）·`:361-364`（单开 ENABLED 误配即抛） | 双 preview flag 面齐 · 全树引用仅 ai-runtime+harness docs（rg 亲证 · env/部署零布线=翻转策略裁决空间） |
| A3 | S4a L1 合帧+拼接校验 declare | `model-client.ts:368`（idle 10s 钉值）·`:387`（窗口 100ms）·`:389`（帧上限 4KB）·`:412`（splitCodepointSafeByBytes）·`:446`（coalesceTokenDeltas）·`:489-490`（STITCH T1/T2 钉值）·`:493`（normalizeForStitchCompare）·`:509`（gradeStitchIdentity） | §D-3 L1 参数面/§E-⑦ 校验器 declare 在树 · `:440` 注释自证「生产接线=S4b worker TokenSink」 |
| A4 | S4a 测试门（回归基线） | `packages/ai-runtime/package.json:48/:50/:51`（prove:model-client-stream / prove:stitch-validator / prove:token-coalesce） | 流式 prove 三门在位 |
| A5 | invoke 关口（D-2 落点·零改面） | `packages/ai-runtime/src/invoke.ts:167`（InvokeSpec）·`:488`（invoke）·`:912`（plan.execute 经 withAbortTimeout）·`:1048`（doubleValidate） | InvokeSpec 现**无** `onModelDelta` 字段（rg 亲证零命中）——D-2 纯观察缝=本刀新增；claim/幂等/计费/doubleValidate 链不动 |
| A6 | worker 观察缝缺位实证 | `rg "withTokenStream|TokenSink|interview_token_ch" apps/worker packages/ai-runtime` 零命中（唯 model-client 归属注释 :334/:440）；`apps/worker/src/` 无 token-stream.ts（ls 亲证） | §D-3 withTokenStream/TokenSink/pg_notify 通道=**全缺位**（本刀主战场·api 泵无 delta 源即因于此） |
| A7 | 阶段1 粗进度面（零触参照） | `apps/worker/src/generation-progress.ts:23`（2s 节流）·`:29`（≤6 行上界）·`:107`（withGenerationProgress）·`:122`（writeProgressOnce）·`:143-151`（heartbeat）·三触发面 `interview-service.ts:253/:351` + `adaptive-interview-service.ts:460` | 2s 墙钟心跳形制在树（#160 红事实本体 · 本刀零触零回归） |
| A8 | 生成进程归属 | `apps/worker/src/interview-service.ts:2`（「把模型经 invoke 关口接进各图节点。worker 真跑、api 触发都用它」） | 生成进程=worker · SSE 消费进程=api · 跨进程跳必须显式（S3 §B 承重锚） |
| A9 | 权威终态面 | `apps/worker/src/adaptive-lifecycle.ts:265/:273/:449`（appendEvent `question_ready`） | 权威终态落点（delta 丢帧唯一兜底 · §B 铁律承接） |
| A10 | api 行泵（语义零改面） | `apps/api/src/platform/sse-pump.ts:33-51`（SsePumpOptions）·`:56`（pumpSseEvents）·`:67-70`（safeWrite · write() 返回值丢弃=审计 #132 现形 · 邻位登记）·`:78-84`（emit 权威行带 `id: seq`）·`:85`（10min deadline）·`:86`（reqRaw close 断开即醒）·`:87-104`（先注册 waiter 再取数）·`:105`（fetchMore）·`:109`（ping）·`:116`（单点 end） | 行泵单源化在树 · delta 臂=**纯增量** SsePumpOptions 可选注入（§D-4） |
| A11 | 通知单例 | `apps/api/src/platform/sse-notify.service.ts:28`（`SSE_NOTIFY_CHANNEL='interview_event_ch'`）·`:29`（trigger 名）·`:97`（waitFor）·`:181-183`（onNotification 按 channel 过滤）·`:227`（LISTEN）·`:256`（getSseNotify 单例） | 恰一条专用 LISTEN · 禁每 SSE 一连接纪律在树 · 第二通道=同连接增 LISTEN 命令（零新连接零迁移） |
| A12 | SSE 端点+槽（零触面） | `apps/api/src/modules/interview/interview.controller.ts:256`（@Get :id/events）·`:255→:262`（先取数后占槽=审计 #184 现形 · 零触）·`:265`（isTerminal 五 kind）·`:266-273`（pump 接线）·`:274`（releaseSlot）·quiz `quiz.controller.ts:53-70`（isTerminal :60）·diagnosis `diagnosis.controller.ts:51-68`（isTerminal :58） | 三控制器同形 · 槽 ≤5 零触 · quiz/diagnosis 本刀零触（§D-4 interview 先行） |
| A13 | 0143 触发器 | `packages/db/migrations/0143_sse_push_notify.sql:26`（`pg_notify('interview_event_ch', NEW.stream_key)`） | 既有权威通道载荷=仅 stream_key；token_delta 不落表不建触发器=**零迁移**根据 |
| A14 | web 解析层 | `apps/web/lib/stream/business-events.ts:21-77`（BusinessEvent 判别联合 · 各成员 id 必填 · **无 token_delta 成员**）·`:86-106`（decodeSSE 三分+sawTraffic）·`:109-114`（toBusinessEvent safeParse 不过即 null :112-113） | §F 双端注册面=本刀增成员（全表唯一 id optional）；decodeSSE/toBusinessEvent 零改 |
| A15 | web 归约层 | `apps/web/lib/stream/interview-state.ts:13`（ALL_PHASES）·`:88`（applyEvents）·`:164`（generationProgress 归约挂点）·`:177`（applyEvent）·`:188`（onStreamClosed） | delta 缓冲归约=本刀新增面（终态覆盖+清缓冲挂点邻位） |
| A16 | web 进度文案（#160 文案半现状） | `apps/web/lib/stream/generation-progress.ts:20-24`（段标签）·`:27-45`（generationProgressLabel「AI 生成中 · 已 N 秒」）·`:47-51`（maxDefined 幂等覆盖） | #160 修法第一半（文案去「流式」称谓）已由阶段1 刀 `3acc6fb5` 兑现；第二半「真实流式」=本刀 |
| A17 | web 驱动+桥+L3 | `apps/web/lib/hooks/useInterviewStream.ts:15-19`（openSse 同源代理 `/api/interview/:id/events`+last-event-id 头+AbortSignal）·`apps/web/lib/stream/frame-coalescer.ts:12`（makeFrameCoalescer offer/cancel）·`apps/web/lib/stream/interview-stream.ts:57`（runInterviewStream） | 渲染管线消费端齐备 · L3 rAF 合帧面既有可复用 |
| A18 | 既有 SSE proof（形制基线） | `apps/api/test/`：sse-principal-slot.proof.ts · sse-push-notify.proof.ts · uc-e2e-010-sse-resume.proof.ts · ha-2-drain.proof.ts（ls 亲证）；`apps/web/test/web-logic.proof.ts`；`apps/worker/test/tokenstream-progress.proof.ts` | SSE 契约面+阶段1 回归基线（本刀新 proof 沿此形制） |
| A19 | 收据 fixture 源（归档现位） | `receipts/archive/2026-09-batch23/receipts/tokstream-s2-probe/2026-10-07/`（probe-b.json / probe-b-sse-chunks.redacted.txt / stitch-compare.json / probe-c.json / run-manifest.json）·`…/tokstream-s4a/2026-10-07/`（gates.txt+三 prove out）·`…/2026-10-07-tokenstream-phase1-exec-prove.md` | S3 §G 所引 `receipts/tokstream-s2-probe/…` 已归档漂移——引用一律用归档现位（§0.2-②） |
| A20 | SSOT 目录句 | `CLAUDE.md:54`（「The frontend consumes business events over SSE, not model tokens」+事件目录括注） | S3 A13 归属：S4c/d 刀内事项=本刀裁决项④ |
| A21 | 迁移链顶 | `ls packages/db/migrations` 顶=0184（0182/0183 号空缺 · 共 184 文件） | 本刀预期零迁移；若推翻→起号 **0189 起**（0188=5B-MIG 拟占 · §4-③） |
| A22 | 双 preview flag 先例（零触） | `packages/ai-runtime/src/voice-stream.ts:5-6/:21/:29`（VOICE_STREAM_ASR 双 flag refuse 形制） | A2 形制来源（S3 A11 沿承 · 本刀零触） |
| A23 | 门命令源 | 根 `package.json:8`（docs:check）·`:22`（typecheck）·`:252`（web:prove）；`apps/api/package.json:46/:65/:66`（prove:ha2-drain / prove:sse-slot / prove:sse-push-notify）；`apps/worker/package.json:10/:14`（prove:tokenstream / prove:interview）；`turbo.json:7`（typecheck 门） | §3 验收命令逐条同源 |

### 0.2 漂移登记（S3/审计锚 → 本分支 tip `f0147886` · 结论零变 · EXEC 重 pin 同协议处理）

1. **S3 设计 A5/A6/A7/A10 锚行漂**：sse-pump `:53→:56`（pumpSseEvents）·`:69→:85`（10min deadline）·`:92-93→:109`（ping）；interview.controller `:253-272→:256-274`；business-events `:21-72→:21-77` · decodeSSE `:79→:86` · safeParse `:101→:112`——SSE-PUSH/HA-2/SSE-RESILIENCE 各刀并线所致 · 机制零变（现锚以 §0.1 A10-A12/A14 为准）。
2. **S2/S4a/阶段1 收据归档漂**：S3 §G 与 S4a REQUEST 所引 `receipts/tokstream-s2-probe/…`、`receipts/tokstream-s4a/…` 现位 `receipts/archive/2026-09-batch23/receipts/…`（git ls-files 亲证 · §0.1 A19）——fixture 内容零变 · 路径如实改引。
3. **issues-master 审计锚漂（登记不改判）**：#163 锚 `adaptive-interview-service.ts:156,163-193` 系审计时行号——现树该区已为 H2 #79 CRAG 段（:150-199 亲读）；#163 机制面主锚=S3 设计 §B/§C-3/§E（「设计未实现」状态零变 · A6 机证）。#160 锚 `generation-progress.ts:122-150`→现 `:107-151` 区段同物；web 半 `:27-42`→`:20-51` 区段同物（§0.1 A7/A16）。
4. **阶段1 刀（`3acc6fb5`）与本刀界碑**：阶段1=generation_* 持久粗进度（appendEvent 落表）；本刀=token_delta 传输态细流（pg_notify 不落表）——两通道正交 · 阶段1 面零触零回归（prove:tokenstream 门原值在 §3 门列）。

## §1 红事实与用户口径

### 1.0 用户口径钉死项（⛔ 不得更改）

1. **刀名与 STOP**：批2-C2 流式进度收口刀（TOKSTREAM S4b）· 本卷落卷即 STOP=`draft:awaiting_pre_exec_dual` · **⛔push** · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · est live=0 · markers=0 · pins 十一值零翻。
2. **范围四件**（派单口径原文）：api SSE 泵接 completeStream（含其唯一桥=worker 观察缝→`interview_token_ch`→api delta 臂全链——缺 worker 半则 api 无源 · §0.1 A6/A8 机证）+前端逐 token 渲染+断开取消语义生产化+双 flag 翻转策略。
3. **命名映射（防歧义钉死）**：战役刀名「S4b」=S3 §I 切片表 **S4b 行+S4c 行+S4d 行** 的接线收口；§I 行名 S4b（仅 worker 观察缝）⊂本刀 · 本刀≠§I 单行 S4b——EXEC/审席引用一律以本映射为准。
4. **计件定性**：#160 残面（真实流式半）+#163 残面（校验外发裁定+断开取消语义半）=本刀收口对象；#160 文案半已闭（A16）；#202 翻牌=docs-only 建议随卷（§9）· 翻面权归协调方 · 本卷不自翻不自建 SSOT 行。

### 1.1 红事实（残面机制链 · 现 tip 亲证）

1. **#160 残面**（issues-master `:342` 原文：「“生成进度”只是 2 秒墙钟心跳+手动阶段标记，不是模型真实进度（不应对外称流式）」·修法：「对外文案改为“生成中/已等待 N 秒”，真实流式另行设计（见 #163）」）：链=A7（2s 节流+≤6 行心跳在树）→前端只显文案（A16）→**模型真实 token 级进度零通路**（A6 缺位机证）。收口=§2 R1-R6。
2. **#163 残面**（issues-master `:413` 原文：「S3 流式设计风险（推断）：delta 先于校验外发，校验失败时用户看到题又变“不可用”；断开不取消生成」·修法：「S4 实施前裁定“校验后外发”或“校验前不外发”，并定义断开取消语义」）：S3 已设计裁定面=§C-3（终态权威兜底+明令禁止为补 delta 重跑模型调用）+§E-⑤（断开不取消生成·终态照落）+§E-⑦（归一化全等·不匹配=telemetry+仍用终态权威）——**本刀=把该裁定落成码面+proof+显式语义注记**（R7/R8+裁决项②③）· 非重新设计。
3. **计费语义**（S3 §E 计费纪律总则原文照录）：「流式与非流式同价同账（invoke 关口 usage 落账 A12 零改·delta 回调不产生第二账面）；任何流中失败不自动重invoke；重试=用户显式路径（attemptKey 幂等重放既有）」——本刀零改关口（A5）· 断开计费语义=裁决项②。

### 1.2 S3 §E-⑤⑦ 逐条落地映射（S3 原文语义 → 本刀落点）

| S3 语义 | S3 原文锚 | 本刀落点 |
|---|---|---|
| 并发 | §E-⑤「per-principal SSE 槽 ≤5（A6）不变·token 通道零新增连接」 | A12 槽面零触 + R4 单例 LISTEN 同连接第二通道（零新连接） |
| 取消 | §E-⑤「客户端断开**不取消** worker 生成（既有语义·终态照落·delta 无听众=廉价 no-op）」 | R7 语义生产化 + 裁决项② |
| 续传 | §E-⑤「Last-Event-ID 只重放权威行（delta 永不重放）」+ §C-4 光标防毒 | R4 delta 帧无 id + 行泵 `id: seq`（:80）零改 + R5 token_delta 全表唯一 id optional 成员 |
| 计费 | §E-⑤「流中失败禁自动重跑（Ban 双跑双扣）」+ §1.1-③ 总则 | R1 关口零改 + R7 禁重跑断言 + 裁决项②③ |
| ⑦ 长度守恒 | §E-⑦「ΣdeltaLen==accLen（D-1 通道自检+web 缓冲面）」 | 通道半=A3 已在树（:919-928）；worker 对账 telemetry 半=R2；web 缓冲面半=R5 断言 |
| ⑦ 归一化全等 | §E-⑦「终态到达时归一化全等对照（trim+折叠空白·不匹配=telemetry+仍用终态权威）」 | R6：终态覆盖时 gradeStitchIdentity（:509）对照 · telemetry 非门 |
| ⑦ tokens 对账 | §E-⑦「completion_tokens 量级对账=telemetry 非门（跨语言 tokens≠字符可比）」 | R2 endUsage 对账日志（仅日志·非门） |
| ⑦ 禁启发式 | §E-⑦「明文禁裸前缀重叠启发式（该启发式只许存在于离线诊断工具）」 | R1-R8 零引入 + §5 Ban 永钉 |

## §2 修法（R1-R8 执行清单 · 每条含设计原文锚+验收断言 · EXEC 逐条对号施工禁增删）

**R1 worker invoke 观察缝（§D-2 逐字）**：`packages/ai-runtime/src/invoke.ts` InvokeSpec（:167）增可选 `onModelDelta?` 纯观察回调透传至 plan.execute（:912 执行面旁）——**关口零改动**：claim/幂等/计费/doubleValidate（:1048）不因回调存在而分叉；回调抛错一律吞为观察失败（绝不影响业务结果面）；G7 车道：flag 缺省 OFF=零触 · stream 通道不进 g7 预约/终结面（§D-2 原文「未来 ON 须另刀 g7 车道审批」）。验收：onModelDelta 注入 proof 断言（i）flag OFF 回退路径回调零调用（ii）回调抛错业务结果与基线一致（iii）claim/usage 落账行数与基线相等（第二账面禁）。

**R2 worker token-stream.ts（§D-3 签名逐字）**：新增 `apps/worker/src/token-stream.ts`：`withTokenStream(pool, owner, streamKey, meta: { attemptKey, jobKind }, run: (t: TokenSink) => Promise<T>)`——TokenSink: pushDelta(text)/endUsage(u)/abortReason(r)；L1 合帧复用 A3 coalesceTokenDeltas（:446 · 100ms/4KB 原值）→ `pg_notify('interview_token_ch', JSON 帧)` best-effort（写败=丢帧 · §C-3 不补发）；帧契约=§C-2 逐字 `{v:1, streamKey, attemptKey, seq, text, coalesced?}` · seq 为 (streamKey, attemptKey) 内自 1 单调递增（worker 单写者·A5 claim 保证）；单帧 text ≤4KB（码点安全切分沿 :412 · NOTIFY 载荷 8KB 上限安全半幅）；结束面 telemetry：usage.completion_tokens vs Σdelta 字符数对账（仅日志·非门）。验收：proof 断言 seq 单调/超限切分/载荷上限/写败不阻断业务返回值四臂。

**R3 三触发面接线（A9 同位）**：`interview-service.ts:253`（quiz）·`:351`（report）·`adaptive-interview-service.ts:460`（next_question）三处 withGenerationProgress 旁同刀接线 withTokenStream 包裹（模型调用面经 R1 回调供 delta）——阶段1 progress 面（A7）零字节零回归。验收：三触发面各一臂断言 withTokenStream 在位且 generation_* 落表行为与基线一致（prove:tokenstream 全臂原值回归）。

**R4 api delta 臂（§C-2/3/4+§D-4 逐字）**：`sse-notify.service.ts` 单例 LISTEN 同连接增 `LISTEN interview_token_ch`（:227 邻位 · 禁每 SSE 一连接纪律零破 · :181-183 onNotification 增通道分流）；`sse-pump.ts` SsePumpOptions（:33-51）增可选 `deltaSource`——行泵循环语义零改（A10 全锚）：delta 臂与 notify wait 同 race · 取帧即 emit **无 id 帧**（§C-4 光标防毒：`id: seq` 仅权威行 :80 · delta 帧禁 id）· 进程内 per-streamKey 环形缓冲有界丢旧标记 coalesced · 环空照旧 ping；interview 控制器接线（:266-273 邻位）· quiz/diagnosis 零触（裁决项⑤）。验收：proof 断言（i）权威行带 id/delta 帧无 id（ii）行泵 fetchMore/isTerminal/deadline/ping/单点 end 断言与基线一致（iii）delta 丢帧不重放不补发（iv）断开（reqRaw close :86）delta 臂即停且 :116 恰一次。

**R5 web 逐 token 归约面（§F+§D-5 逐字）**：`business-events.ts` 判别联合（:21-77）增 `token_delta` 成员——**全表唯一 id optional 成员**（`id: z.number().int().optional()` · data=`{attemptKey, seq: int().positive(), text, coalesced?}.loose()` · §F 代码块逐字）；decodeSSE（:86）/toBusinessEvent（:109）零改（旧前端静默丢 delta=向后兼容免费获得 · §F 原文）；`interview-state.ts` 增 delta 缓冲归约（attemptKey 键控 · maxDefined 幂等精神沿 A16 :47 · 业务终态到达=覆盖+清缓冲）。验收：proof 断言（i）token_delta 帧无 id 可解析·id 缺席合法（ii）unknown kind→null 丢弃回归（iii）终态到达清缓冲+权威覆盖（iv）seq gap 不死等（缺帧不 degraded 不死等 · §C-5）。

**R6 web 渲染 pacing+拼接校验 web 半（§D-5/§E-⑥ L3/§E-⑦）**：渲染=UX-A 打字机（阶段0 UX 裁定倾向 · 终态权威覆盖）；L3 复用 frame-coalescer（A17 :12）rAF 批量；终态到达时 Σdelta 缓冲 vs 终态全文经 gradeStitchIdentity（:509）归一化全等对照——不匹配=telemetry+**仍用终态权威**（§E-⑦ 原文）。验收：proof 断言对照器三态（全等/失配 telemetry 不阻断/缓冲空跳过）。

**R7 断开取消语义生产化（#163 修法兑现 · §E-⑤ 落地）**：语义=§1.2 表钉死+worker/api 两侧注记随码落+proof 四断言：（i）客户端断开（pump :86 close）→delta 臂/行泵停止 · worker 生成**不取消**（R1 回调继续至终态 · 终态 appendEvent 照落 A9）（ii）usage 落账恰一次（断开不产生第二账面/退款面零触）（iii）流中失败（①②③路径）→error 终态 · **禁自动重 invoke**（iv）「为补 delta 重跑模型调用」rg 断言零新增（§C-3 明令禁止）。语义裁定本身=S3 §E-⑤ 既有裁定（推荐行使=裁决项②）。

**R8 双 flag 翻转策略（§I「全链 flag OFF 缺省=上线旗标另裁」承接）**：本刀**零翻 flag**（A2 缺省 OFF 维持 · rg MODEL_TEXT_STREAM 全树仅 ai-runtime+docs 与 A2 同态为验收产出物）· 《翻转策略》docs 件随 R8 附卷（内容=裁决项①裁定行使结果）：序列=先 PREVIEW=1 后 ENABLED=1（:361-364 误配语义：单开 ENABLED 即抛）；锁面=production/enforce/public-preview 三锁（:341-345）下永不启用；回滚=任一 flag 摘除即刻回非流式（:879-881 既有回退零回归）；g7 注记=未来 ON 须另刀 g7 车道审批（§D-2 原文·本刀仅声明）。

## §3 验收断言+门预申明（命令原样可复制）

**门预申明（派单钉死）**：①新 proof（ai-runtime onModelDelta 缝 proof + worker token-stream proof + api delta 臂 proof + web token-delta proof · 形制沿 A18）②SSE 契约面（api/web 双端 zod 注册同刀 · §F 注册纪律「禁半边注册」）③typecheck ④docs:check。既有回归门：

```
pnpm -C packages/ai-runtime prove:model-client-stream && pnpm -C packages/ai-runtime prove:stitch-validator && pnpm -C packages/ai-runtime prove:token-coalesce
pnpm -C apps/worker prove:tokenstream && pnpm -C apps/worker prove:interview
pnpm -C apps/api prove:sse-push-notify && pnpm -C apps/api prove:sse-slot && pnpm -C apps/api prove:ha2-drain
pnpm web:prove
turbo typecheck --force
pnpm typecheck
pnpm docs:check
```

断言候选（pre-exec 双审核对基面·断言力≥3）：①§2 各 R 条内嵌断言全绿（EXEC 收据逐条给臂电图）②既有门臂语义零变（A10 行泵/A7 progress/A14 解析回归原值）③SSOT 四件（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX）+历史迁移 0001-0184 零字节（git diff 亲证）④CLAUDE.md 触点=裁决项④行使范围内 :54 句+SSE 目录登记为唯一例外（其余零触）⑤markers 五类亲跑零新增。

## §4 依赖

①**S4a 已并线=硬前置已满足**：nail `6aa83c48` 在主线祖先链（merge-base 亲证 · completeStream/flag 门/L1/校验器全在树 §0.1 A1-A4）。②**S3 设计定稿在主线=唯一蓝本**。③**迁移号结论（实证后定谳）**：预期**零迁移**——interview_token_ch=纯 NOTIFY 通道零表改零触发器（A13/A11）· token_delta 非持久 kind 零落 interview_event（§C-5 · 0126 围栏精神）；若 EXEC 实证推翻（须表/触发器面）→**停止条件②** · 届时起号 **0189 起**（0188=5B-MIG 拟占 · 跨树 `meetwise-b5m` `batch5b-mig-REQUEST.md:58/:135/:177` 亲证「本刀拟占 0188 起·窗 0188-0198」）并登记协调方分配。④同文件并发登记：S4a 已收官零在飞；resume-grounding（:7 自证 token-stream 接线零触碰）/extrev-score-writer（触发面归 S4b 先立项=本刀）两卷界碑声明在案——EXEC 立项时对届时在飞树 `git worktree list` 复核一遍。⑤下游：本刀收口后批2 表行翻面权归协调方（LEDGER）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push；Ban self-approve（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（十一值含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（四件+INDEX · 翻面权归协调方；CLAUDE.md 仅裁决项④行使范围内 :54 句+SSE 目录登记为例外）；Ban 触其他工作树；Ban 伪造已读/已验来源；**Ban 关口语义变更**（A5 claim/幂等/计费/doubleValidate 链零改 · delta 回调不产生第二账面）；**Ban 补 delta 重跑模型调用**（§C-3 明令禁止 · 双跑双扣）；**Ban 自动重 invoke**（流中失败禁自动重跑 · §E-⑤）；**Ban token_delta 落持久表**（§C-5 · interview_event 持久面零扩）；**Ban 裸前缀重叠启发式入运行时**（§E-⑦ · T3 误报实证）；**Ban 行泵语义变更**（A10 十锚零改 · delta 臂纯增量注入）；**Ban 槽 ≤5/单例 LISTEN 纪律变更**（A11/A12）；**Ban flag 翻转**（A2 缺省 OFF 维持 · 翻转=上线旗标另裁）；**Ban g7 车道触**（§D-2 缺省 OFF=零触）；**Ban 历史迁移零字节改+影子 sql 面改**（0001-0184）；**Ban 阶段1 progress 面回归破坏**（A7 · prove:tokenstream 原值）；**Ban quiz/diagnosis delta 臂接线**（裁决项⑤行使前）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀全 proof 注入缝/合成 fixture 零模型真实外呼 · 零消耗）。

## §6 est live=0

本刀零模型真实外呼：全 proof=注入缝/合成 fixture（S2 收据卷归档现位 §0.1 A19）+确定性 stub；零生产操作 · 零密钥 · 零消耗（pins 脚注同源 · EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md=`ai-docs/delivery/harness/tokstream-s4b-REQUEST.md`）五类标记词 grep 零命中（起草席亲跑 · 命令与回执沿 ttl-wire receipts/05-markers 形留执行席收据）。五类标记词不复抄卷内（避免自匹配 · 沿 ag 系卷 §7 同形制）。

## §8 STOP（开工三条款+停止条件四类+裁决项五项+交付报告格式）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀起草阶段恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（issues-master #160/#163 行与批2-C2 派单系登记出处 · 本卷非授权本身）；③EXEC 立项**不得改 §1.0 钉死项与 §5 Ban/pins**（改则回炉重审 · 立项时照 §0 逐条重 pin——含 §0.2 漂移登记如实在案）。

**停止条件（命中即停 · 四类全覆盖）**：
1. **现场漂移**：EXEC 立项时主线 tip 前进→照 §0 协议全量重 pin；若 A1-A3（completeStream/flag 门/L1 declare 面）或 A10（行泵）**机制面**被他刀并线改动→STOP 上报（不得以推测锚施工）。
2. **机制不满足**：零迁移预期被推翻（须表/触发器面）· pg_notify 载荷 8KB 上限下 R2 帧契约不可行 · 单例 LISTEN 同连接第二通道 LISTEN 失败——任一→STOP 回炉（若需迁移：**0189 起号**+登记协调方 · §4-③）。
3. **越界需要**：修法要求触 §5 Ban 面（g7 车道/计费关口/0126 围栏/quiz-diagnosis 臂/flag 翻转/SSOT 四件）→STOP 上报归协调方裁决 · 禁顺手扩权。
4. **验收红不可修**：§3 门两轮定向修复仍红→STOP 呈报红因（Ban retry-to-green）。

**待双审/EXEC 裁决项（五项 · 各含推荐 · 行使记录随 EXEC 收据落卷）**：
①**flag 翻转时点**：推荐=本刀零翻 · 缺省 OFF 维持 · 《翻转策略》docs 件随 R8 落卷（序列/锁面/回滚/g7 注记如 R8）· 实际翻转=上线旗标另刀（§I 原文「全链 flag OFF 缺省=上线旗标另裁」）vs 本刀内直接翻（并陈 · 越生产门槛风险如实标注：A2 三锁面下 preview 环境可试 · production 恒锁）。②**断开计费语义**：推荐=断开不取消生成 · usage 照落恰一次 · 终态照落 · delta 无听众 no-op（S3 §E-⑤ 既有裁定行使 · R7 四断言钉死）vs 断开即取消生成（须 abort 贯通 worker+半成品计费裁定=新机制面 · 越本刀范围风险如实标注）。③**降级回退面**：推荐=三层回退既有形行使——flag 缺席/误配/锁面→completeStream :879-881 恒走非流式；delta 臂缺席/通道退化→纯行泵现状（30s 兜底/2s 轮询既有 A10）；web 未升级→unknown kind null 丢弃+终态兜底（§F 向后兼容）——零新增回退机制 vs 显式 delta health 面新增（并陈）。④**CLAUDE.md:54 SSOT 更新归属**：推荐=随本刀落（token_delta 双端注册面在本刀 · S3 A13 归属 S4c/d=本刀）——:54 句扩注 token_delta 非权威传输态+SSE 事件目录登记 vs 留后刀并陈（留后则本卷 Ban CLAUDE.md 全零触）。⑤**quiz/diagnosis delta 臂接线深度**：推荐=interview 先行 · quiz/diagnosis 本刀零触（§D-4「三控制器按需接线（interview 先行）」原文）vs 三控制器同刀并接（放大回归面 · 如实标注）。

**交付报告格式（EXEC 收据必载 · `receipts/tokstream-s4b/` 惯例）**：①门 EXIT 全表（§3 命令逐条+新 proof 臂数）②§0 重 pin 勘误表（行号漂移逐条）③R1-R8 逐条做完判定位（含 rg 产出物路径）④五裁决项行使记录（推荐/改判+理由）⑤markers 五类亲跑回执 ⑥pins 自检十一值零翻+SSOT/历史迁移零字节 diff 证据 ⑦STOP 翻面（→`exec:awaiting_post_prove_dual`）。

## §9 附：#202 翻牌登记建议（docs-only · 归协调方 · 本卷不自翻）

issues-master 更正版 #202（外部卷宗 · 第2批）现载「C 端面试检索面仍直读旧 snapshot 表，候选人无快照 → route_snapshot_missing → CRAG deny_external」。本席现树实证：`apps/worker/src/interview-consumer.ts:383-391` 注释自证 candidate-route 读面已落（「G-R2-5: Absent/invalid snapshot → route_snapshot_missing…**C 端无岗位简历面试由此解锁题库检索(此前必 route_snapshot_missing)**」）+`:507`（双面零弱化注记）+`apps/worker/src/qbank-retrieve-scope.ts:10`（consumer turns the denial into degradedRetrieval('route_snapshot_missing')）。**建议**：#202 状态列具备翻面证据基础（候选=随 H2 #79 同簇核销或挂「部分面已闭」注记）· 核验与翻面权在协调方 · 本卷零改 SSOT。

---

*TOKSTREAM-S4B REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`f0147886`（本地=origin 同点 · 6aa83c48 祖先亲证）· 分支 `line/tokstream-s4b` · 工作树 `meetwise-s4b`（git worktree add 本起草席立 · 建前双查不存在）· 蓝本=tokstream-s3-design.md（S3 定稿在主线 · §B/§C-1..5/§D-1..5/§E-⑤⑦/§F/§G/§I 全输入）+issues-master 更正版 #160=:342/#163=:413（外部卷宗 ~/Documents/Meetwise产品审计-更正版/·原文亲读誊录）+批2-C2 派单四件+形制 ag-d-admission（跨树）· 防重双对表过（建前无同名树分支卷）· §0=23 锚亲证+漂移登记四条（S3 A5/A6/A7/A10 行漂·收据归档漂·审计锚漂·阶段1 界碑）· 红事实=#160 残面链（2s 心跳 A7→文案 A16→token 级零通路 A6）+#163 残面（S3 已裁 §C-3/§E-⑤/§E-⑦·本刀落码面+proof）· 用户口径钉死五项（范围四件/命名映射=战役 S4b=§I 三行收口/⛔不得更改）· 修法 R1-R8（invoke onModelDelta 关口零改/token-stream.ts+L1+pg_notify+seq/三触发面/api delta 臂无 id 帧行泵零改/web token_delta 唯一 id optional+归约清缓冲/UX-A+L3+归一化对照/断开取消语义生产化四断言/flag 翻转策略零翻附卷）· S3 ⑤⑦ 八行落地映射表 · 门预申明=新 proof+SSE 契约面+typecheck+docs:check（命令原样 §3）· 迁移号结论=预期零迁移实证定谳（A13/A11/§C-5）·推翻则 0189 起（0188=5B-MIG 拟占 batch5b-mig-REQUEST.md:58 跨树亲证）· 停止条件四类全覆盖 · 裁决项五项各含推荐（flag 时点/断开计费/降级回退三层/CLAUDE.md:54 归属/quiz-diagnosis 深度）· §9=#202 翻牌建议归协调方 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
