# TOKSTREAM-S4B REQUEST（批2-C2 流式进度收口刀 · #160 残面+#163 残面 = S3 §I 切片 S4b/S4c/S4d 三行接线收口 · api delta 臂 + web 逐 token 渲染 + 断开取消语义生产化 + 双 flag 翻转策略 · 起草 docs-only 落卷即停）

**Status**: **`stopped:exec_red_gate_budget`**（EXEC 施工席重派席已落卷——pre-exec 双审 rev3 复审席1 PASS+席2 PASS·协调方授权开工·并线 `fc1964cf`=merge --no-ff 主线 `c4025186`·R1b+R1-R8 全量施工+新 proof 四门全绿+既有门零新红；**红承登=docs:check PTP_FILE_LIMIT 2077>2072（本刀 +7 受管新文件）+turbo lint 四预算超支（ai-runtime 628>621/web 581>579/worker 954>950/scripts 5213>5200·禁自调）+基线红双门 A/B 承登（tokenstream TS-P1 ask 臂/ha2-drain C4 臂·stash 同红同形非本刀回归）**——沿 AG38 `stopped:exec_red_docs_file_limit` 先例 **Status 不落 executed**·待协调方处置 cap（建议 MAX_FILES ≥2077/2080）与 lint 四值后翻面 `executed:awaiting_post_prove_dual`·全表与十偏离=§9 EXEC 附记+`receipts/tokstream-s4b/exec-receipt.md`）· **⛔push**（全程零 push）· est live=0 · markers=0 · pins 十一值照抄 · 门预申明=新 proof+SSE 契约面+typecheck+docs:check（§3）。
**Date**: 2026-10-13（rev1）· rev2 2026-10-14 · rev3 2026-10-14
**Base**: 主线 `feat/mysql-schema-skeleton` @`f0147886`（本地=origin 同点 · `git log -1` 亲证 · `git merge-base --is-ancestor 6aa83c48 HEAD` 亲证 S4a nail 在祖先链）· 分支 `line/tokstream-s4b` · 工作树 `meetwise-s4b`（主仓同级 · `git worktree add … -b line/tokstream-s4b f0147886` 本起草席立 · 建前无同名树同名分支亲证）。
**蓝本**: ①`ai-docs/delivery/harness/tokstream-s3-design.md`（S3 设计定稿已在主线 · §B/§C-1..5/§D-1..5/§E-⑤⑦/§F/§G/§I 为全部设计输入 · **禁自由发挥**）②issues-master 更正版 #160 `:342` / #163 `:413`（外部卷宗 `~/Documents/Meetwise产品审计-更正版/issues-master.md` · 本席 2026-10-13 亲读誊录 · batch5b-mig 同引形制）③派单口径=批2-C2 协调方简报四件（api SSE 泵接 completeStream+前端逐 token 渲染+断开取消语义生产化+双 flag 翻转策略）④形制=ag-d-admission-REQUEST（跨树 `meetwise-agd` · Ban/pins 同源誊录）。
**Honesty**: 本卷 §0 全部 file:line 在 `line/tokstream-s4b` @`f0147886` 实树亲读（rg/sed/Read 实测 · 行号错=审席 FAIL）；issues-master 两行原文亲读；S3 设计引文逐字对齐；战役刀名与 §I 行名错位如实钉死（§1.0-③）。

## §0 现状锚（起草席亲读 @`f0147886` · **EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚 · 结论不变则只更行号 · rev2 补登：主线 tip 已前移 f88f8956→d68ffe17 实测·本分支树锚值零漂移维持·见 §0.2-⑤）

### 0.0 防重双对表

- 建前 `git worktree list`（主仓侧）无 s4b 同名树；`git branch --list "line/tokstream-s4b"` 建前空输出（本席建树建分支）；`rg -l "tokstream-s4b" ai-docs/delivery/harness/` 建前零命中（本卷落卷后唯一同名卷=本卷）。
- 邻刀界碑亲证：`tokstream-s4a-REQUEST.md` 在树（S4a 已交 · 触发面/观察缝明示归后刀）；`resume-grounding-REQUEST.md:99`（rev2 勘正 B2：S4b 交叠声明实位第 99 行·`:7` 系 Honesty 行）与 `extrev-score-writer-REQUEST.md` 交叠声明引「S4b 的 token-stream 接线」系登记性引用非同名卷——防重过 · 停止条件未触发。

### 0.1 锚表（23 锚 · `f0147886` 实树亲证 · **EXEC 重 pin 只准更锚不准翻定性**）

| # | 面 | 锚（file:line @`f0147886`） | 亲证事实 |
|---|---|---|---|
| A1 | S4a completeStream 实现 | `packages/ai-runtime/src/model-client.ts:875`（impl 起）·`:883-884`（flag 门回退 `client.complete(req,1,opts.signal)` 非流式·rev2 勘正 B2）·`:901`（流式期限解析）·`:902-913`（`stream:true`+`stream_options.include_usage` body·rev2 复测勘正）·`:915-940`（ΣdeltaLen==accLen 守恒账面+assertConservation·rev2 勘正 E3）·`:925-937`（码点安全 pushDeltaText·rev2 复测勘正）·`:942-948`（三联终结+流中 error frame/idle 账面·rev2 复测勘正）·`:1063-1070`（usage 组装·`?? 0` 在 :1065-1066·F3 翻转前置修复项 rev2 增锚） | S4a 交付面在树 · recon 三锚（:352-355/:530/:543）同域零翻 |
| A2 | S4a 双 flag 门 | `model-client.ts:338`（`MODEL_TEXT_STREAM_UNCONFIGURED` 码）·`:341-345`（production/enforce/public-preview 三锁 refuse-closed）·`:348-350`（`ENABLED=1 ∧ PREVIEW=1` 请求面）·`:353-355`（isModelTextStreamPreviewEnabled fail-closed 缺省 OFF）·`:361-364`（单开 ENABLED 误配即抛） | 双 preview flag 面齐 · 全树引用 `rg -ln` 实测 8 文件=ai-runtime 4（src 1+test 3）+harness docs 3+归档收据 run-manifest.json 1（rev2 E1 补登 · env/部署零布线=翻转策略裁决空间） |
| A3 | S4a L1 合帧+拼接校验 declare | `model-client.ts:368`（idle 10s 钉值）·`:387`（窗口 100ms）·`:389`（帧上限 4KB）·`:412`（splitCodepointSafeByBytes）·`:446`（coalesceTokenDeltas）·`:489-490`（STITCH T1/T2 钉值）·`:493`（normalizeForStitchCompare）·`:509`（gradeStitchIdentity） | §D-3 L1 参数面/§E-⑦ 校验器 declare 在树 · `:442` 注释自证「生产接线=S4b worker TokenSink」（rev2 勘正 B2） |
| A4 | S4a 测试门（回归基线） | `packages/ai-runtime/package.json:48/:50/:51`（prove:model-client-stream / prove:stitch-validator / prove:token-coalesce） | 流式 prove 三门在位 |
| A5 | invoke 关口（D-2 落点·零改面） | `packages/ai-runtime/src/invoke.ts:167`（InvokeSpec）·`:488`（invoke）·`:912`（plan.execute 经 withAbortTimeout）·`:1048`（doubleValidate） | InvokeSpec 现**无** `onModelDelta` 字段（rg 亲证零命中）——D-2 纯观察缝=本刀新增；claim/幂等/计费/doubleValidate 链不动 |
| A6 | worker 观察缝缺位实证 | `rg "withTokenStream|TokenSink|interview_token_ch" apps/worker packages/ai-runtime` 实测 3 处命中=model-client 归属注释 :334/:442 + token-coalesce.proof.ts:11 注释（rev2 勘正 B2 · 三处全注释面·运行时声明零命中=缺位定性不变）；`apps/worker/src/` 无 token-stream.ts（ls 亲证） | §D-3 withTokenStream/TokenSink/pg_notify 通道=**全缺位**（本刀主战场·api 泵无 delta 源即因于此） |
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
5. **rev2 基线漂移补登（B3/F8 · 2026-10-14 勘误席亲测）**：主线 tip 已前移 `f0147886`→`f88f8956`（2026-10-14 13:14 SSOT 随翻）→`d68ffe17`（现测 tip·`git merge-base --is-ancestor f0147886 <tip>` 亲证在祖先链·**本分支树 `f0147886` 基准锚值零漂移维持**）——主线侧实测三处漂：**A21** 迁移链顶已至 **0187**（`0185_gateway_billing_ledger_payer`/`0186`+`0187_qbank_org_owner`·共 187 文件·0182/0183 空缺叙事随 AG-39 链改占失效）·**A4** 三门 `:48/:50/:51`→主线 `:49/:51/:52`·**A23** web:prove `:252`→主线 `:254`（docs:check `:8`/typecheck `:22`/turbo.json:7/api `:46/:65/:66`/worker `:10/:14` 实测零漂）——EXEC 立项对届时 tip（f88f8956+）**全量重 pin 义务**照 §0 头协议执行。

## §1 红事实与用户口径

### 1.0 用户口径钉死项（⛔ 不得更改）

1. **刀名与 STOP**：批2-C2 流式进度收口刀（TOKSTREAM S4b）· 本卷落卷即 STOP=`draft:awaiting_pre_exec_dual` · **⛔push** · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · est live=0 · markers=0 · pins 十一值零翻。
2. **范围四件**（派单口径原文）：api SSE 泵接 completeStream（含其唯一桥=worker 观察缝→`interview_token_ch`→api delta 臂全链——缺 worker 半则 api 无源 · §0.1 A6/A8 机证）+前端逐 token 渲染+断开取消语义生产化+双 flag 翻转策略。
3. **命名映射（防歧义钉死）**：战役刀名「S4b」=S3 §I 切片表 **S4b 行+S4c 行+S4d 行** 的接线收口；§I 行名 S4b（仅 worker 观察缝）⊂本刀 · 本刀≠§I 单行 S4b——EXEC/审席引用一律以本映射为准。
4. **计件定性**：#160 残面（真实流式半）+#163 残面（校验外发裁定+断开取消语义半）=本刀收口对象；#160 文案半已闭（A16）；#202 翻牌=docs-only 建议随卷（§9）· 翻面权归协调方 · 本卷不自翻不自建 SSOT 行。

### 1.1 红事实（残面机制链 · 现 tip 亲证）

1. **#160 残面**（issues-master `:342` 原文：「“生成进度”只是 2 秒墙钟心跳+手动阶段标记，不是模型真实进度（不应对外称流式）」·修法：「对外文案改为“生成中/已等待 N 秒”，真实流式另行设计（见 #163）」）：链=A7（2s 节流+≤6 行心跳在树）→前端只显文案（A16）→**模型真实 token 级进度零通路**（A6 缺位机证）。收口=§2 R1-R6。
2. **#163 残面**（issues-master `:413` 原文：「S3 流式设计风险（推断）：delta 先于校验外发，校验失败时用户看到题又变“不可用”；断开不取消生成」·修法：「S4 实施前裁定“校验后外发”或“校验前不外发”，并定义断开取消语义」）：S3 已设计裁定面=§C-3（终态权威兜底+明令禁止为补 delta 重跑模型调用）+§E-⑤（断开不取消生成·终态照落）+§E-⑦（归一化全等·不匹配=telemetry+仍用终态权威）——**本刀=把该裁定落成码面+proof+显式语义注记**（R7/R8+裁决项②③）· 非重新设计。
3. **计费语义**（S3 §E 计费纪律总则原文照录）：「流式与非流式同价同账（invoke 关口 usage 落账 A12 零改·delta 回调不产生第二账面）；任何流中失败不自动重invoke；重试=用户显式路径（attemptKey 幂等重放既有）」——本刀零改关口（A5）· 断开计费语义=裁决项②。**F3 勘补（rev2）**：completeStream 流式 usage 组装 `:1063-1070` 实测 `?? 0`（`:1065-1066`）违 AG-14 口径（complete 非流式 `:745-761` 缺失字段按 policy 上限补齐+`usage_missing` 打标·`?? 0` 形明废）——列为**翻转前置修复项**·推荐本刀顺手对齐（文件域在 R1/R1b 内·R1b-④ 已列）·不修则 R8 双 flag 翻转前置条件缺一。

### 1.2 S3 §E-⑤⑦ 逐条落地映射（S3 原文语义 → 本刀落点）

| S3 语义 | S3 原文锚 | 本刀落点 |
|---|---|---|
| 并发 | §E-⑤「per-principal SSE 槽 ≤5（A6）不变·token 通道零新增连接」 | A12 槽面零触 + R4 单例 LISTEN 同连接第二通道（零新连接） |
| 取消 | §E-⑤「客户端断开**不取消** worker 生成（既有语义·终态照落·delta 无听众=廉价 no-op）」 | R7 语义生产化 + 裁决项② |
| 续传 | §E-⑤「Last-Event-ID 只重放权威行（delta 永不重放）」+ §C-4 光标防毒 | R4 delta 帧无 id + 行泵 `id: seq`（:80）零改 + R5 token_delta 全表唯一 id optional 成员 |
| 计费 | §E-⑤「流中失败禁自动重跑（Ban 双跑双扣）」+ §1.1-③ 总则 | R1 关口零改 + R7 禁重跑断言 + 裁决项②③ |
| ⑦ 长度守恒 | §E-⑦「ΣdeltaLen==accLen（D-1 通道自检+web 缓冲面）」 | 通道半=A3 已在树（`:915-940`·rev2 勘正 E3 同源）；worker 对账 telemetry 半=R2；web 缓冲面半=R5 断言 |
| ⑦ 归一化全等 | §E-⑦「终态到达时归一化全等对照（trim+折叠空白·不匹配=telemetry+仍用终态权威）」 | R6：终态覆盖时 gradeStitchIdentity（:509）对照 · telemetry 非门 |
| ⑦ tokens 对账 | §E-⑦「completion_tokens 量级对账=telemetry 非门（跨语言 tokens≠字符可比）」 | R2 endUsage 对账日志（仅日志·非门） |
| ⑦ 禁启发式 | §E-⑦「明文禁裸前缀重叠启发式（该启发式只许存在于离线诊断工具）」 | R1-R8 零引入 + §5 Ban 永钉 |

## §2 修法（R1-R8 执行清单 · 每条含设计原文锚+验收断言 · EXEC 逐条对号施工禁增删）

**R1 worker invoke 观察缝（§D-2 逐字）**：`packages/ai-runtime/src/invoke.ts` InvokeSpec（:167）增可选 `onModelDelta?` 纯观察回调透传至 plan.execute（:912 执行面旁）——**关口零改动**：claim/幂等/计费/doubleValidate（:1048）不因回调存在而分叉；回调抛错一律吞为观察失败（绝不影响业务结果面）；G7 车道：flag 缺省 OFF=零触 · stream 通道不进 g7 预约/终结面（§D-2 原文「未来 ON 须另刀 g7 车道审批」）。验收：onModelDelta 注入 proof 断言（i）flag OFF 回退路径回调零调用（ii）回调抛错业务结果与基线一致（iii）claim/usage 落账行数与基线相等（第二账面禁）（iv）**flag 双开+transport seam 注入→`invoke(spec{onModelDelta})` 回调实收 ≥1 delta 且序守恒**（emit 顺序=到达顺序·正路端到端臂——rev2 F1 增·补 rev1 三负臂-only 缺口）。

**R1b delta 源重接线（rev2 F1·P1·rev3 普查勘正五处三层·S4b 正路缺臂补全·纯增量条）**：rev1 R1 只 declare InvokeSpec 回调缝——亲证正路 `invoke`(:912 `plan.execute`)←`client.prepare`(:641)→execute 臂 `:647`→`client.complete` 非流式，completeStream 在 invoke 链**零分派点**（delta 源断=rev1 P1 缺臂实锤）——本刀四件接通：①**分派点普查（rev3 勘正=五处三层·`rg "client\.complete" packages/ai-runtime/src` 实测恰 5 命中=model-client 4+failover-model 1·test/proof 消费面不计入）与 flag-aware 路由施为位**——**层1 可路由实臂=`:647`**（openAICompatibleClient prepare execute 臂·**唯一生产臂**：invoke `prepareModelPlan` invoke.ts:637 `spec.model.prepare`→modelFor prepare（:1108-1111 prepare 键无条件在位）→client.prepare `:641`→`:647` execute·failover 链经 failoverModel.prepare 逐成员转发同此臂）——**flag-aware 路由主施为位=此臂**；**层2 防御性同刀=`:1107`**（modelFor call 臂·**invoke 路径死码**：modelFor 返回 Model 的 prepare 键恒在→invoke.ts:637 三元恒走 prepare 分支·`:1107` 于 invoke 链不可达·存续理由=直调 parity（`.call()` 直调用户/测试面））——同刀 flag-aware 路由施为（直调面与生产面同刀防双标）；**层3 结构性非流式落点=三处·零路由**：`:884` completeStream 自回退（flag 门 fail-closed 恒非流式·本体即 fail-safe 非分派器·零改）·`:1110` modelFor prepare 缺省 execute 臂（仅 prepare-less client 可达·prepare-less⇒无 completeStream 可路由·恒非流式 fail-safe——处置二择一 EXEC 定谳随收据：改注记声明恒非流式不施工 / 显式 declare duck-type 守卫证其恒假）·`packages/ai-runtime/src/failover-model.ts:19` prepare 缺省 execute 臂（**rev2 漏列补登**·同构 prepare-less 臂·生产 failover 链成员全 openAICompatibleClient（interview-service.ts:208 `endpoint()=openAICompatibleClient(cfg)`/:227 `failoverModel([primary,backup])` 亲证·prepare 恒在）故生产不可达——注记声明不施工）。**g7 freetier 例外两层适用性（rev3 补一句）**：`:647` 层 g7 读取工厂闭包原生在位（`:636`/:665+`:257` planContextBudget 为 complete/completeStream 共享 preflight）；`:1107` 层 modelFor 本体零 g7 面（freetierReproveEnabled rg 实测全文件仅 :257/:636/:665·modelFor :1083-1111 零命中）——该层路由判断须显式自读 g7 注入施为例外·不得依赖被路由方内部面。**静态断言（任选登记·非门）**：「可路由两臂（`:647`/`:1107`）flag-aware 路由在位+三结构性落点（`:884`/`:1110`/failover:19）零二跳」——EXEC 可选 rg/AST 静态断言随 proof 登记为产出物（席1 P2 原提「三分派点路由在位」名随本分层勘正重瞄准）。路由条件=isModelTextStreamPreviewEnabled（:353-355）且 **g7 freetier 例外恒走非流式**（F4(a) 防线·R8 docs 增项）·completeStream 本体零改（A1 recon 三锚 :352-355/:530/:543 declare 原值）；②**invoke.ts:147（ModelCallPlan.execute）/`:160`（Model.call）增可选回调位**——additive：既有 prepare 实现/调用方 TS 兼容（可选参不破签名·`:162` prepare 可选方法形制同源）·回调纯观察不参与结算（关口链 :488/:912/:1048 零改亲证·A5 定性不变）；③**R3 三触发面 InvokeSpec 显式绑定 sink**：`interview-service.ts:253-254`（quiz）/`:351-352`（report）/`adaptive-interview-service.ts:460-462`（next_question）三处 spec 增 `onModelDelta`→TokenSink.pushDelta 绑定（spec 面显式绑定·非闭包隐式·=R3 验收断言对象）；④**顺手修（F3·翻转前置修复项·推荐行使）**：completeStream usage 组装 `:1063-1070` 对齐 complete AG-14 口径（`:745-761` 缺失字段按 policy 补齐+`usage_missing` 打标·废 `?? 0`）——**验收臂（rev3 增）**：`prove:model-client-stream`（door=natural home A4·`test/model-client-stream.proof.ts`）增臂断言「completeStream usage **字段缺失**→policy 上限补齐+`usageSource='usage_missing'`·**整体缺失**→undefined」（基准形=complete 非流式 `:745-761` 现行实现逐字对齐·§3-② 措辞已同步防误读）——文件域同 model-client.ts 在 R1/R1b 内·不行使则升格 R8 翻转前置修复项另刀。

**R2 worker token-stream.ts（§D-3 签名逐字）**：新增 `apps/worker/src/token-stream.ts`：`withTokenStream(pool, owner, streamKey, meta: { attemptKey, jobKind }, run: (t: TokenSink) => Promise<T>)`——TokenSink: pushDelta(text)/endUsage(u)/abortReason(r)；L1 合帧复用 A3 coalesceTokenDeltas（:446 · 100ms/4KB 原值）→ `pg_notify('interview_token_ch', JSON 帧)` best-effort（写败=丢帧 · §C-3 不补发）；帧契约=§C-2 逐字 `{v:1, streamKey, attemptKey, seq, text, coalesced?}` · seq 为 (streamKey, attemptKey) 内自 1 单调递增（worker 单写者·A5 claim 保证）——**单写者前提注记（rev2 F5）**：前提成立条件=MODEL_EXECUTION_TIMEOUT_MS ≤ lease 60s（`invoke.ts:319` 缺省 35s·上限 120_000 vs `:716-725` claim `leaseSeconds:60` 实测）·若部署配置 execution>lease 则二写者窗存在→seq 回归由 web max-seq 幂等吸收（R5 归约按 (attemptKey,seq) 去重·旧 seq 帧丢弃）——两择一 EXEC 立项声明（推荐=前者配置上界声明）。**attemptKey 重执行登记（rev2 F6）**：quiz/report attemptKey=idempotencyKey（`:254`/`:352` 实测）——同 attemptKey 幂等重试窗内重执行 seq 自 1 重启：环形缓冲/web 缓冲按 (attemptKey,seq) 键控·缓冲按 attemptKey 换代不互毒（场景登记·非新机制）；单帧 text ≤4KB（码点安全切分沿 :412 · NOTIFY 载荷 8KB 上限安全半幅）；结束面 telemetry：usage.completion_tokens vs Σdelta 字符数对账（仅日志·非门）。验收：proof 断言 seq 单调/超限切分/载荷上限/写败不阻断业务返回值四臂。

**R3 三触发面接线（A9 同位）**：`interview-service.ts:253`（quiz）·`:351`（report）·`adaptive-interview-service.ts:460`（next_question）三处 withGenerationProgress 旁同刀接线 withTokenStream 包裹（模型调用面经 R1 回调供 delta——rev2 R1b-③：三处 InvokeSpec 显式 `onModelDelta`→sink 绑定·spec 面显式非闭包隐式）——阶段1 progress 面（A7）零字节零回归。验收：三触发面各一臂断言 withTokenStream 在位且 generation_* 落表行为与基线一致（prove:tokenstream 全臂原值回归）。

**R4 api delta 臂（§C-2/3/4+§D-4 逐字）**：`sse-notify.service.ts` 单例 LISTEN 同连接增 `LISTEN interview_token_ch`（:227 邻位 · 禁每 SSE 一连接纪律零破 · :181-183 onNotification 增通道分流）；`sse-pump.ts` SsePumpOptions（:33-51）增可选 `deltaSource`——行泵循环语义零改（A10 全锚）：delta 臂与 notify wait 同 race · 取帧即 emit **无 id 帧**（§C-4 光标防毒：`id: seq` 仅权威行 :80 · delta 帧禁 id）· 进程内 per-streamKey 环形缓冲有界丢旧标记 coalesced · 环空照旧 ping；interview 控制器接线（:266-273 邻位）· quiz/diagnosis 零触（裁决项⑤）。**fan-out 语义钉死（rev2 F7）**：同 streamKey 多订阅者=各 pump 独立消费视图或单例广播复制（每 pump 独立环形缓冲视图或广播·**禁互偷帧**——A 帧被 pump₁ 消费不得致 pump₂ 丢帧·两形 EXEC 二选一并注记）；**delta-only 唤醒免 fetchMore**：泵循环现形=每次唤醒必经 `:105` fetchMore（`:104-108` 亲证）——delta 帧唤醒走独立支路**不触发取数 SQL**（token 帧 ≤10/s 若每帧一 SQL 即破坏「无权威事件零 SQL」承诺）·权威行 notify 唤醒照旧 fetchMore（A10 十锚语义零改）。验收：proof 断言（i）权威行带 id/delta 帧无 id（ii）行泵 fetchMore/isTerminal/deadline/ping/单点 end 断言与基线一致（iii）delta 丢帧不重放不补发（iv）断开（reqRaw close :86）delta 臂即停且 :116 恰一次。

**R5 web 逐 token 归约面（§F+§D-5 逐字）**：`business-events.ts` 判别联合（:21-77）增 `token_delta` 成员——**全表唯一 id optional 成员**（`id: z.number().int().optional()` · data=`{attemptKey, seq: int().positive(), text, coalesced?}.loose()` · §F 代码块逐字）；decodeSSE（:86）/toBusinessEvent（:109）零改（旧前端静默丢 delta=向后兼容免费获得 · §F 原文）；`interview-state.ts` 增 delta 缓冲归约（attemptKey 键控 · maxDefined 幂等精神沿 A16 :47 · 业务终态到达=覆盖+清缓冲）。**光标守卫（rev2 F2·P1）**：`interview-state.ts:93` `Math.max(next.lastEventId, e.id)` 对 optional id 不兼容（undefined→NaN→`sse-cursor.ts:63-64` `Number.isSafeInteger` 抛 InvalidLastEventIdError→重连永久 degraded——两处亲证）——delta 归约支路**跳过 id===undefined 帧的游标推进**（或 Number.isFinite 守卫·二选一 EXEC 定谳）·全表唯一 id optional 成员禁毒化 lastEventId。验收：proof 断言（i）token_delta 帧无 id 可解析·id 缺席合法（ii）unknown kind→null 丢弃回归（iii）终态到达清缓冲+权威覆盖（iv）seq gap 不死等（缺帧不 degraded 不死等 · §C-5）（v）**delta 帧后 lastEventId 原值不变·重连 last-event-id 头仍数值**（F2 守卫臂·rev2 增）（vi）**同 (attemptKey,seq) 重复 delta 帧不回退缓冲**（幂等覆盖臂·rev2 B1 增·承接 R2 F5/F6 max-seq 去重）。

**R6 web 渲染 pacing+拼接校验 web 半（§D-5/§E-⑥ L3/§E-⑦）**：渲染=UX-A 打字机（阶段0 UX 裁定倾向 · 终态权威覆盖）；L3 复用 frame-coalescer（A17 :12）rAF 批量；终态到达时 Σdelta 缓冲 vs 终态全文经 gradeStitchIdentity（:509）归一化全等对照——不匹配=telemetry+**仍用终态权威**（§E-⑦ 原文）。验收：proof 断言对照器三态（全等/失配 telemetry 不阻断/缓冲空跳过）+（iv）**probe-b.json 曲线 t=ms 重放→L3 rAF 批量 pacing 断言**（S3 §G :177 记名 `facts.curve`·实测 JSON 路径 `attempts[0].curve`·17 chunk tMs/dtMs 时间轴·A19 归档现位——S4d 指定行闭环·rev2 B1 增）。

**R7 断开取消语义生产化（#163 修法兑现 · §E-⑤ 落地）**：语义=§1.2 表钉死+worker/api 两侧注记随码落+proof 四断言：（i）客户端断开（pump :86 close）→delta 臂/行泵停止 · worker 生成**不取消**（R1 回调继续至终态 · 终态 appendEvent 照落 A9）（ii）usage 落账恰一次（断开不产生第二账面/退款面零触）（iii）流中失败（①②③路径）→error 终态 · **禁自动重 invoke**（iv）「为补 delta 重跑模型调用」rg 断言零新增（§C-3 明令禁止）。语义裁定本身=S3 §E-⑤ 既有裁定（推荐行使=裁决项②）。

**R8 双 flag 翻转策略（§I「全链 flag OFF 缺省=上线旗标另裁」承接）**：本刀**零翻 flag**（A2 缺省 OFF 维持 · rg MODEL_TEXT_STREAM 全树仅 ai-runtime+docs 与 A2 同态为验收产出物）· 《翻转策略》docs 件随 R8 附卷（内容=裁决项①裁定行使结果）：序列=先 PREVIEW=1 后 ENABLED=1（:361-364 误配语义：单开 ENABLED 即抛）；锁面=production/enforce/public-preview 三锁（:341-345）下永不启用；回滚=任一 flag 摘除即刻回非流式（`:883-884` 既有回退零回归·rev2 勘正 B2 同源）；g7 注记=未来 ON 须另刀 g7 车道审批（§D-2 原文·本刀仅声明）。**《翻转策略》docs 件增两条（rev2 F4）**：(a) **g7 freetier 恒不路由 completeStream**——`g7RuntimeInjection().freetierReproveEnabled()`（model-client `:257`/`:636`/`:665` 亲证）例外臂 refuse-closed+静态断言随 proof（R1b① 路由条件联动·g7 车道 stream 零触双保险）；(b) **NOTIFY 预算按 JSON.stringify 后载荷实算**（4KB text 最坏转义膨胀可破 NOTIFY 8000 字节 envelope——text 预算降至 ~3.5KB 或超限切分·二选一 EXEC 定谳·R2 帧契约联动）。**翻转前置修复项（rev2 F3）**：completeStream usage `?? 0`（`:1065-1066`·组装 `:1063-1070`）违 AG-14 口径（§1.1-③ 勘补）——R1b-④ 顺手对齐·不行使则本翻转策略缺前置。

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

断言候选（pre-exec 双审核对基面·断言力≥3）：①§2 各 R 条内嵌断言全绿（EXEC 收据逐条给臂电图）②既有门臂语义零变（A10 行泵/A7 progress/A14 解析回归原值 · prove:model-client-stream **既有臂逐臂语义零变禁改**——R1b-④ usage 缺失补齐臂=纯增量**新增臂**·属门预申明①新 proof 臂面·不属既有臂改形·防「增臂即违零变」两读误读——rev3 措辞同步）③SSOT 四件（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX）+历史迁移 0001-0184 零字节（git diff 亲证）④CLAUDE.md 触点=裁决项④行使范围内 :54 句+SSE 目录登记为唯一例外（其余零触）⑤markers 五类亲跑零新增。

## §4 依赖

①**S4a 已并线=硬前置已满足**：nail `6aa83c48` 在主线祖先链（merge-base 亲证 · completeStream/flag 门/L1/校验器全在树 §0.1 A1-A4）。②**S3 设计定稿在主线=唯一蓝本**。③**迁移号结论（实证后定谳）**：预期**零迁移**——interview_token_ch=纯 NOTIFY 通道零表改零触发器（A13/A11）· token_delta 非持久 kind 零落 interview_event（§C-5 · 0126 围栏精神）；若 EXEC 实证推翻（须表/触发器面）→**停止条件②** · 届时起号 **0189 起**（0188=5B-MIG 拟占 · 跨树 `meetwise-b5m` `batch5b-mig-REQUEST.md:58` 亲证「本刀拟占 0188 起·窗 0188-0198」）并登记协调方分配（rev2 注：主线链顶实测已 0187·§0.2-⑤——0189 起号结论不变·EXEC 对届时 tip 复核 0188 占用现状）。**跨树引勘正（rev3·席1 P2 顺带）**：旧引 `:135/:177` 系 b5m **rev1**（`ee7bf9f9`·本卷起草同日）时点实位；「占号在飞→本刀 0188 起」句在 b5m **rev2**（`9aa51852`）实位 **`:139`**（席1 复审实测）·b5m 现 tip `7152cd3c`（2026-10-14 15:29 已 EXEC·19 触点施工）实测漂至 **`:141`**·footer 拟占句 :177→:288（rev3 亲测）——b5m EXEC 勘误注（现位 `:64`）亲证：实际 claim=**0190-0199 共 10 号**·**0188 已由 cost4 树实占**（`0188_ag11_cost_reserve_least_and_settle_relax.sql`）·0189 空置已登记「防复用」——0189 起号结论维持·EXEC 立项对届时链顶顺延取号+协调方分配义务加重（0189 与 b5m 防复用登记的调和、0190+ 在飞对表·随停止条件② 如实触发面呈报）。④同文件并发登记：S4a 已收官零在飞；resume-grounding（`:99` 自证 token-stream 接线零触碰·rev2 勘正 B2）/extrev-score-writer（触发面归 S4b 先立项=本刀）两卷界碑声明在案——EXEC 立项时对届时在飞树 `git worktree list` 复核一遍。**5C-SSE-API 界碑（rev2 F8/B3）**：LEDGER `:87`「5C 可靠性…分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）」亲证——SSE-API 子刀与本刀**同文件域**（sse-notify/sse-pump/interview.controller：槽位/loseClient/重连=既有面零触·本刀仅 additive LISTEN 第二通道+delta 臂）——EXEC 立项时该子刀立项/在飞状态一并对表登记。**届时 tip 全量重 pin 义务（rev2 B3/F8）**：rev2 实测主线已前移 f0147886→f88f8956→d68ffe17（§0.2-⑤）——EXEC 立项对届时 tip（f88f8956+）§0 全锚+A21/A4/A23 三处**全量重 pin**。⑤下游：本刀收口后批2 表行翻面权归协调方（LEDGER）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push；Ban self-approve（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（十一值含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（四件+INDEX · 翻面权归协调方；CLAUDE.md 仅裁决项④行使范围内 :54 句+SSE 目录登记为例外）；Ban 触其他工作树；Ban 伪造已读/已验来源；**Ban 关口语义变更**（A5 claim/幂等/计费/doubleValidate 链零改 · delta 回调不产生第二账面）；**Ban 补 delta 重跑模型调用**（§C-3 明令禁止 · 双跑双扣）；**Ban 自动重 invoke**（流中失败禁自动重跑 · §E-⑤）；**Ban token_delta 落持久表**（§C-5 · interview_event 持久面零扩）；**Ban 裸前缀重叠启发式入运行时**（§E-⑦ · T3 误报实证）；**Ban 行泵语义变更**（A10 十锚零改 · delta 臂纯增量注入）；**Ban 槽 ≤5/单例 LISTEN 纪律变更**（A11/A12）；**Ban flag 翻转**（A2 缺省 OFF 维持 · 翻转=上线旗标另裁）；**Ban g7 车道触**（§D-2 缺省 OFF=零触）；**Ban 历史迁移零字节改+影子 sql 面改**（0001-0184）；**Ban 阶段1 progress 面回归破坏**（A7 · prove:tokenstream 原值）；**Ban quiz/diagnosis delta 臂接线**（裁决项⑤行使前）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀全 proof 注入缝/合成 fixture 零模型真实外呼 · 零消耗）。

## §6 est live=0

本刀零模型真实外呼：全 proof=注入缝/合成 fixture（S2 收据卷归档现位 §0.1 A19）+确定性 stub；零生产操作 · 零密钥 · 零消耗（pins 脚注同源 · EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md=`ai-docs/delivery/harness/tokstream-s4b-REQUEST.md`·rev3 后仍恰 1 .md 零码动）五类标记词 grep 零命中（起草席亲跑 · 命令与回执沿 ttl-wire receipts/05-markers 形留执行席收据）。五类标记词不复抄卷内（避免自匹配 · 沿 ag 系卷 §7 同形制）。rev2/rev3 后复验五类零命中（勘误席 2026-10-14 亲跑·rev2/rev3 摘要系叙述层引用不落字面触发词）。**叙述引用豁免登记（rev2 E2）**：卷内「五类标记词/markers=0」等描述性提法与扫描形制引述属叙述层引用·不计命中（沿主线既存叙述引用 erratum 在案形制·`f0147886` 先例）。

## §8 STOP（开工三条款+停止条件四类+裁决项五项+交付报告格式）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀起草阶段恰 1 .md·rev3 后同）。rev2/rev3 系双审 FAIL 回炉载体（rev2 两席 FAIL+rev3 席2 FAIL 席1 P2×3 全数处置·卷尾各轮摘要）·落卷后**重呈双审**·条款②③不变。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（issues-master #160/#163 行与批2-C2 派单系登记出处 · 本卷非授权本身）；③EXEC 立项**不得改 §1.0 钉死项与 §5 Ban/pins**（改则回炉重审 · 立项时照 §0 逐条重 pin——含 §0.2 漂移登记如实在案）。

**停止条件（命中即停 · 四类全覆盖）**：
1. **现场漂移**：EXEC 立项时主线 tip 前进→照 §0 协议全量重 pin；若 A1-A3（completeStream/flag 门/L1 declare 面）或 A10（行泵）**机制面**被他刀并线改动→STOP 上报（不得以推测锚施工）。
2. **机制不满足**：零迁移预期被推翻（须表/触发器面）· pg_notify 载荷 8KB 上限下 R2 帧契约不可行 · 单例 LISTEN 同连接第二通道 LISTEN 失败——任一→STOP 回炉（若需迁移：**0189 起号**+登记协调方 · §4-③）。
3. **越界需要**：修法要求触 §5 Ban 面（g7 车道/计费关口/0126 围栏/quiz-diagnosis 臂/flag 翻转/SSOT 四件）→STOP 上报归协调方裁决 · 禁顺手扩权。
4. **验收红不可修**：§3 门两轮定向修复仍红→STOP 呈报红因（Ban retry-to-green）。

**待双审/EXEC 裁决项（五项 · 各含推荐 · 行使记录随 EXEC 收据落卷）**：
①**flag 翻转时点**：推荐=本刀零翻 · 缺省 OFF 维持 · 《翻转策略》docs 件随 R8 落卷（序列/锁面/回滚/g7 注记如 R8）· 实际翻转=上线旗标另刀（§I 原文「全链 flag OFF 缺省=上线旗标另裁」）vs 本刀内直接翻（并陈 · 越生产门槛风险如实标注：A2 三锁面下 preview 环境可试 · production 恒锁）。②**断开计费语义**：推荐=断开不取消生成 · usage 照落恰一次 · 终态照落 · delta 无听众 no-op（S3 §E-⑤ 既有裁定行使 · R7 四断言钉死）vs 断开即取消生成（须 abort 贯通 worker+半成品计费裁定=新机制面 · 越本刀范围风险如实标注）。③**降级回退面**：推荐=三层回退既有形行使——flag 缺席/误配/锁面→completeStream `:883-884` 恒走非流式（rev2 勘正 B2 同源）；delta 臂缺席/通道退化→纯行泵现状（30s 兜底/2s 轮询既有 A10）；web 未升级→unknown kind null 丢弃+终态兜底（§F 向后兼容）——零新增回退机制 vs 显式 delta health 面新增（并陈）。④**CLAUDE.md:54 SSOT 更新归属**：推荐=随本刀落（token_delta 双端注册面在本刀 · S3 A13 归属 S4c/d=本刀）——:54 句扩注 token_delta 非权威传输态+SSE 事件目录登记 vs 留后刀并陈（留后则本卷 Ban CLAUDE.md 全零触）。⑤**quiz/diagnosis delta 臂接线深度**：推荐=interview 先行 · quiz/diagnosis 本刀零触（§D-4「三控制器按需接线（interview 先行）」原文）vs 三控制器同刀并接（放大回归面 · 如实标注）。

**交付报告格式（EXEC 收据必载 · `receipts/tokstream-s4b/` 惯例）**：①门 EXIT 全表（§3 命令逐条+新 proof 臂数）②§0 重 pin 勘误表（行号漂移逐条）③R1-R8 逐条做完判定位（含 rg 产出物路径）④五裁决项行使记录（推荐/改判+理由）⑤markers 五类亲跑回执 ⑥pins 自检十一值零翻+SSOT/历史迁移零字节 diff 证据 ⑦STOP 翻面（→`exec:awaiting_post_prove_dual`）。

## §9 附：#202 翻牌登记建议（docs-only · 归协调方 · 本卷不自翻）

issues-master 更正版 #202（外部卷宗 · 第2批）现载「C 端面试检索面仍直读旧 snapshot 表，候选人无快照 → route_snapshot_missing → CRAG deny_external」。本席现树实证：`apps/worker/src/interview-consumer.ts:383-391` 注释自证 candidate-route 读面已落（「G-R2-5: Absent/invalid snapshot → route_snapshot_missing…**C 端无岗位简历面试由此解锁题库检索(此前必 route_snapshot_missing)**」）+`:507`（双面零弱化注记）+`apps/worker/src/qbank-retrieve-scope.ts:10`（consumer turns the denial into degradedRetrieval('route_snapshot_missing')）。**建议**：#202 状态列具备翻面证据基础（候选=随 H2 #79 同簇核销或挂「部分面已闭」注记）· 核验与翻面权在协调方 · 本卷零改 SSOT。

---

*TOKSTREAM-S4B REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`f0147886`（本地=origin 同点 · 6aa83c48 祖先亲证）· 分支 `line/tokstream-s4b` · 工作树 `meetwise-s4b`（git worktree add 本起草席立 · 建前双查不存在）· 蓝本=tokstream-s3-design.md（S3 定稿在主线 · §B/§C-1..5/§D-1..5/§E-⑤⑦/§F/§G/§I 全输入）+issues-master 更正版 #160=:342/#163=:413（外部卷宗 ~/Documents/Meetwise产品审计-更正版/·原文亲读誊录）+批2-C2 派单四件+形制 ag-d-admission（跨树）· 防重双对表过（建前无同名树分支卷）· §0=23 锚亲证+漂移登记四条（S3 A5/A6/A7/A10 行漂·收据归档漂·审计锚漂·阶段1 界碑）· 红事实=#160 残面链（2s 心跳 A7→文案 A16→token 级零通路 A6）+#163 残面（S3 已裁 §C-3/§E-⑤/§E-⑦·本刀落码面+proof）· 用户口径钉死五项（范围四件/命名映射=战役 S4b=§I 三行收口/⛔不得更改）· 修法 R1-R8（invoke onModelDelta 关口零改/token-stream.ts+L1+pg_notify+seq/三触发面/api delta 臂无 id 帧行泵零改/web token_delta 唯一 id optional+归约清缓冲/UX-A+L3+归一化对照/断开取消语义生产化四断言/flag 翻转策略零翻附卷）· S3 ⑤⑦ 八行落地映射表 · 门预申明=新 proof+SSE 契约面+typecheck+docs:check（命令原样 §3）· 迁移号结论=预期零迁移实证定谳（A13/A11/§C-5）·推翻则 0189 起（0188=5B-MIG 拟占 batch5b-mig-REQUEST.md:58 跨树亲证）· 停止条件四类全覆盖 · 裁决项五项各含推荐（flag 时点/断开计费/降级回退三层/CLAUDE.md:54 归属/quiz-diagnosis 深度）· §9=#202 翻牌建议归协调方 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

## rev2 勘误席处置摘要（2026-10-14 · pre-exec 双审两席 FAIL 全数处置 · docs-only 恰 1 .md · 零码动 · STOP 维持）

**双审裁决**：席1 FAIL（B1 蓝本覆盖缺臂+B2 行 pin 错+B3 基线漂移+E1-E3）·席2 FAIL（F1/F2=P1+F3-F8）——13 簇全数处置（每处亲证后落笔·行号实测 @本分支树 `c9f89b23`（基 `f0147886`）·主线漂移对 `d68ffe17` 实测）：

| # | 席/项 | 处置（落点） |
|---|---|---|
| 1 | 席2 F1（P1） | 新增 **R1b**（§2·纯增量条）：①modelFor call `:1107` flag-aware 路由至 completeStream——亲证扩展=`client.complete` 分派点 rev2 时点口径记**三处**（`:647`/`:1107`/`:1110`·生产正路经 `:641` prepare→`:647`）三处同刀路由+g7 freetier 例外恒非流式（**rev3 勘正**：普查补全**五处三层**——`:1110` 误层改正为结构性非流式落点+`failover-model.ts:19` 漏列补登·现行口径=§2 R1b① rev3 清单·本行保留 rev2 时点原文）；②invoke.ts `:147`/`:160` 增可选回调位（additive·TS 兼容既有 prepare 实现）；③R3 三触发面 spec 显式绑定 sink（`:253-254`/`:351-352`/`:460-462` 实测）；④顺手修 F3。R1 验收增第 (iv) 臂=**正路端到端**（flag 双开+transport seam 注入→`invoke(spec{onModelDelta})` 回调实收 ≥1 delta 且序守恒·补 rev1 三负臂-only 缺口） |
| 2 | 席2 F2（P1） | R5 增**光标守卫**：`interview-state.ts:93` Math.max 对 optional id→NaN→`sse-cursor.ts:63-64` 抛 InvalidLastEventIdError→永久 degraded（两处亲证）——归约跳过 id===undefined（或 Number.isFinite 守卫·EXEC 二选一）；R5 验收增 (v) 臂「delta 帧后 lastEventId 原值·重连头仍数值」 |
| 3 | 席2 F3 | §1.1-③ 勘补+R1b-④ 顺手修（推荐行使）+R8 翻转前置修复项：completeStream usage `?? 0`（`:1065-1066`·组装 `:1063-1070`）违 AG-14（complete `:745-761` policy 补齐+usage_missing 打标·`?? 0` 形明废·亲证）——文件域在 R1/R1b 内 |
| 4 | 席2 F4 | R8《翻转策略》docs 增两条：(a) g7 freetier 恒不路由 completeStream（`freetierReproveEnabled` `:257`/`:636`/`:665` 亲证·refuse-closed+静态断言随 proof）；(b) NOTIFY 预算按 JSON.stringify **后**载荷实算（text 降至 ~3.5KB 或超限切分·EXEC 二选一） |
| 5 | 席2 F5 | R2 单写者前提注记：MODEL_EXECUTION_TIMEOUT_MS（`:319` 缺省 35s·上限 120_000）≤ lease 60s（`:716-725` `leaseSeconds:60` 实测）或声明 seq 回归由 web max-seq 幂等吸收——EXEC 二择一声明（推荐前者） |
| 6 | 席2 F6 | R2 attemptKey 重执行登记：quiz/report attemptKey=idempotencyKey（`:254`/`:352` 实测）·重执行 seq 自 1 重启·缓冲按 (attemptKey,seq) 键控+attemptKey 换代不互毒 |
| 7 | 席2 F7 | R4 钉两条：①fan-out=每 pump 独立视图或广播·**禁互偷帧**（EXEC 二选一注记）；②delta-only 唤醒免 fetchMore（泵循环 `:104-108` 每唤醒必取数亲证·token 帧 ≤10/s 若每帧一 SQL 破坏「无权威事件零 SQL」）·权威行路径 A10 十锚零改 |
| 8 | 席2 F8+席1 B3 | §4-④ 补 **5C-SSE-API 界碑**（LEDGER `:87` 四子刀亲证·同文件域 sse-notify/sse-pump/controller 槽位/loseClient/重连零触·本刀仅 additive）+**§0.2-⑤ 基线漂移补登**（主线 tip f0147886→f88f8956→d68ffe17 亲证·链顶 0187·A4 `:48/:50/:51`→`:49/:51/:52`·A23 web:prove `:252`→`:254` 均主线侧实测·本分支树零漂移维持）+EXEC 对届时 tip（f88f8956+）全量重 pin 义务 |
| 9 | 席1 B1 | R6 验收增第 (iv) 臂=probe-b 曲线（S3 §G `:177` S4d 指定行·实测 JSON 路径 `attempts[0].curve`·17 chunk tMs/dtMs）t=ms 重放→L3 rAF pacing 断言；R5 验收增 (vi) 幂等覆盖臂（同 (attemptKey,seq) 重复帧不回退缓冲） |
| 10 | 席1 B2 | 行 pin 勘正四处全落实：A1 `:879-881`→`:883-884`·A6/A3 `:440`→`:442`·A6 rg 主张改「3 处命中含 token-coalesce.proof.ts:11 注释」（实测 3 命中）·resume-grounding `:7`→`:99`（§0.0+§4-④ 两处）——同源旧 pin 连带勘正三处（§1.2 表 `:919-928`、R8 回滚与裁决项③ `:879-881` 引用） |
| 11 | 席1 E1 | A2 补登归档收据 1 处：全树引用 `rg -ln` 实测 8 文件=ai-runtime 4+harness docs 3+归档 run-manifest.json 1 |
| 12 | 席1 E2 | §7 叙述引用豁免登记+rev2 后五类复验零命中（勘误席亲跑） |
| 13 | 席1 E3 | A1 守恒账面区间勘正 `:919-928`→`:915-940`（亲证）·连带复测 `:902-913`/`:925-937`/`:942-948` 三子 pin 同步勘正 |

**rev2 亲证追加/连带勘正（超出两席清单·同协议如实登记）**：A1 三子 pin（`:902-913`/`:925-937`/`:942-948`）·F1① 分派点三处扩展（`:1107` 单点不足·生产正路经 `:647`）·probe-b 曲线实测 JSON 路径注记（`attempts[0].curve`）·0182/0183 空缺叙事失效（AG-39 链改占）·§4-③ 0189 起号对届时 tip 复核注记——共 6 处。**计数口径注（rev3 补·席1 P2）**：本节「分派点三处」系 rev2 时点口径——rev3 亲证普查实为**五处三层**（`:884` 同属结构性落点·`:1110` 误层改正·`failover-model.ts:19` 漏列补登），现行口径=§2 R1b① rev3 清单为唯一口径·本节 rev2 原文保留作历史不改写。**处置计数=13 簇全处置**（展开 25 叶：B2 四处/B1 两臂/F4 两条/F7 两条/F1 五件/R5 两臂）+连带 6 处。修法语义方向零变（R1-R8 面零删·R1b/R5 守卫/验收臂均纯增量）·STOP 维持 `draft:awaiting_pre_exec_dual`·落卷后重呈双审·⛔push。

*TOKSTREAM-S4B REQUEST **rev2** · 2026-10-14 · 双审席1（B1/B2/B3/E1-E3）+席2（F1-F8）两席 FAIL 回炉修订全数处置（docs-only 恰 1 .md·零码动·⛔push）· 核心勘补=R1b delta 源重接线（分派点 flag-aware 路由〔rev2 记三处·rev3 勘正五处三层〕+invoke `:147`/`:160` 回调位+三触发面 spec 绑定 sink+R1 正路端到端第 (iv) 臂·双 P1 之一）+R5 光标守卫（id optional→NaN→`:63-64` 抛→degraded 断链·双 P1 之二·附 (v)(vi) 两臂）+F3 usage AG-14 翻转前置修复（R1b-④ 顺手）+R8 docs 两条（g7 freetier 防线/NOTIFY stringify 后预算）+R2 单写者前提（35s/120s vs lease 60s）与 attemptKey 重启登记+R4 fan-out 禁偷帧与 delta-only 免 fetchMore+§4-④ 5C-SSE-API 界碑（LEDGER :87 四子刀）与届时 tip 全量重 pin（主线已前移 f88f8956→d68ffe17·链顶 0187·A4/A23 三处漂实测·§0.2-⑤）+R6 probe-b 曲线 L3 pacing 第 (iv) 臂+行 pin 七处勘正（`:883-884`/`:442`/`:99`/`:915-940`/`:902-913`/`:925-937`/`:942-948`）+A2 归档收据补登（rg 8 文件实数）+§7 叙述豁免登记+§8 rev2 重呈双审条款 · rev1→rev2 修法语义方向零变（纯增量）· STOP 维持 · 落卷后重呈双审 · pins 十一值零翻 · markers=0（rev2 后亲跑复验）· est live=0 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*

## rev3 勘误席处置摘要（2026-10-14 · rev2 复审席1 PASS（P2×3 顺带）+席2 FAIL（P1+P2）·窄修 docs-only 恰 1 .md·零码动·STOP 维持）

**rev2 复审裁决**：席1 PASS 附三件 P2 顺带·席2 FAIL 两件（P1=R1b① 分派点普查不 exhaust（`:1110` 误层入可路由集+`failover-model.ts:19` 漏列）/P2=R1b-④ 顺手修无验收臂）——3 簇全数处置（每处亲证后落笔·行号实测 @本分支树 `839eea59`（基 `f0147886`）·跨树 b5m 对现 tip `7152cd3c` 及 rev1/rev2 历史时点实测）：

| # | 席/级 | 处置（落点） |
|---|---|---|
| 1 | 席2 P1·R1b① | §2 R1b① 勘正**五处三层清单**：层1 可路由实臂=`:647`（唯一生产臂·invoke :637 prepare→:641→:647）·层2 防御性同刀=`:1107`（modelFor call 臂·invoke 路径死码·直调 parity）·层3 结构性非流式落点零路由=`:884` 自回退/`:1110`（改注记不施工或显式 declare duck-type 守卫其恒假·EXEC 二择一）/`failover-model.ts:19`（**rev2 漏列补登**·生产 failover 链成员全 openAICompatibleClient 故不可达·interview-service.ts:208/:227 亲证）——g7 freetier 例外该两层适用性各补一句（`:647` 层工厂闭包原生在位 :636/:665/:257/`:1107` 层 modelFor 零 g7 面须路由判断处显式自读）+「可路由臂路由在位」静态断言任选登记（席1 原提「三分派点路由在位」名随分层勘正重瞄准） |
| 2 | 席2 P2·R1b-④ | R1b④ 增验收臂落卷：prove:model-client-stream（door=natural home A4）增臂断言「completeStream usage 字段缺失→policy 上限补齐+usageSource='usage_missing'·整体缺失→undefined」（基准形=complete `:745-761` 现行实现）·§3-② 措辞同步防误读（既有臂语义禁改≠禁增臂·新臂属门预申明①新 proof 臂面） |
| 3 | 席1 P2·顺带三件 | ①跨树 b5m 引勘正（§4-③）：`:135/:177` 系 b5m rev1（`ee7bf9f9`）时点实位·0188 起号句 rev2（`9aa51852`）实位 `:139`（席1 测）·现 tip `7152cd3c` 实测 `:141`/footer :288——b5m 已 EXEC（勘误注现位 :64）实际 claim=0190-0199·0188 由 cost4 实占：0189 起号结论不变·EXEC 复核义务加重注记；②摘要层计数口径注一句（rev2 节末·「三处」系 rev2 时点口径·rev3 五处三层为唯一现行口径·rev2 原文保留作历史）；③静态断言任选登记（并抬头 1·落 §2 R1b①） |

**rev3 亲证追加（同协议如实登记）**：五分派点 `rg "client\.complete" packages/ai-runtime/src` 实测恰 5 命中（model-client :647/:884/:1107/:1110+failover-model :19·test/proof 消费面不计入）·invoke.ts:637-638 prepare 三元+modelFor prepare 键恒在（:1108-1111）=「:1107 invoke 路径死码」机证·failoverModel 生产消费=interview-service.ts:227+endpoint()=openAICompatibleClient（:208-209）·AG-14 基准面 `:745-761`（maxInputTokens 补齐 :753/usage_missing :758）·completeStream `?? 0` :1065-1066 复测维持·b5m 三时点行号亲证（rev1 :135/:177→rev2 :139→tip `7152cd3c` :141/:288）——共 7 处。修法语义方向零变（R1-R8+R1b 面零删·勘正均口径/注记/增臂纯增量）·STOP 维持 `draft:awaiting_pre_exec_dual`·落卷后重呈双审·⛔push。

*TOKSTREAM-S4B REQUEST **rev3** · 2026-10-14 · rev2 复审席2 FAIL（P1 R1b① 普查不 exhaust+P2 R1b-④ 无验收臂）+席1 PASS 三件 P2 顺带·窄修落卷（docs-only 恰 1 .md·零码动·⛔push）· 核心勘补=R1b① 分派点普查五处三层（`:647` 唯一生产可路由臂+`:1107` 防御性同刀 invoke 路径死码+`:884`/`:1110`/failover-model.ts:19 结构性非流式落点零路由·g7 freetier 两层适用性各一句·静态断言任选登记）+R1b④ prove:model-client-stream usage 缺失补齐验收臂（A4 natural home·§3-② 措辞同步防误读）+§4-③ 跨树 b5m 引三时点勘正（:135/:177@rev1→:139@rev2 `9aa51852`→:141@tip `7152cd3c`·b5m 已 EXEC 实占 0190-0199/0188 实占 cost4）+rev2 摘要表行 1 与卷尾 footer 同步勘正+摘要层计数口径注一句 · rev2→rev3 修法语义方向零变（纯口径/注记/增臂）· STOP 维持 `draft:awaiting_pre_exec_dual` · 落卷后重呈双审 · pins 十一值零翻 · markers=0（rev3 后亲跑复验）· est live=0 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*

## §9 EXEC 附记（2026-10-14 · 重派 EXEC 施工席落卷 · 并线 fc1964cf=merge --no-ff c4025186 · 全表=receipts/tokstream-s4b/exec-receipt.md）

**施工落点**：R1（invoke 观察缝 additive：`InvokeSpec.onModelDelta`+execute 第 2 参/call 第 3 参+`swallowObserverThrows`·关口零改）·R1b① 五处三层（层1 `:647` 唯一生产臂 flag-aware 路由=单源 `shouldRouteModelTextStream()`；层2 `:1107` duck-type 同刀；层3 `:884`/`:1110`/`failover-model.ts:19` 注记——**:1110 定谳=注记声明恒非流式不施工**）·R1b③ 三触发面 spec 显式绑定·R1b④ usage AG-14 对齐（`?? 0` 废→policy 补齐+`usage_missing`·验收双臂）·R2 token-stream.ts（L1 复用+pg_notify best-effort+seq 单调+**R8(b) 定谳=stringify 后实算 7500 超限切分**+单写者定谳=**配置上界声明**）·R3 三面外包裹（阶段1 面零回归）·R4 第二 LISTEN+广播复制（**fan-out 定谳=广播复制**）+delta 臂无 id 帧+环 256 丢旧+**delta-only 免 fetchMore/notify 恒取数（notifyWoke 唤醒源区分·上波缺逆命题半本席随补）**·R5 token_delta 唯一 id optional 成员+光标守卫（undefined 跳过=定谳窄守卫+interview-stream 上游半）+max-seq 幂等缓冲·R6 UX-A+L3+对照器 web 半+probe-b L3 pacing 臂·R7 断开不取消四断言+rg 零新增·R8 零翻 flag+《翻转策略》落 `receipts/tokstream-s4b/flip-policy.md`（R8(a)(b) 增条落卷）。

**门矩阵**：新 proof 四门全绿（invoke-model-delta 12 臂/token-stream 17 臂/s4b-delta-arm 21 臂/token-delta 19 臂）+model-client-stream 56 PASS（R1b④ 双新臂）+stitch/token-coalesce/interview/sse-push-notify（35）/sse-slot/web:prove/typecheck×2 全 EXIT=0；**红承登**=docs:check `PTP_FILE_LIMIT:2077>2072`（+7 受管新文件皆门预申明① mandated）+turbo lint 四预算（ai-runtime 628>621 +7 全归因 invoke-model-delta.proof.ts 同族/web 581>579/worker 954>950/scripts 5213>5200·禁自调）+基线红双门（tokenstream TS-P1 ask 臂·ha2-drain C4 臂·stash A/B 同红同形亲证非本刀回归）。**裁决落值**：①零翻推荐行使（策略件落 receipts）②推荐行使（断开不取消·usage 恰一次）③推荐行使（三层既有形）④**改判=收敛行使零触 CLAUDE.md**（零翻 flag 下 :54 句仍为真·目录登记留翻转刀）⑤推荐行使（interview 先行）。**§0 重 pin**：17 锚零漂（f0147886→fc1964cf blob 恒等）+A4/A7/A9/A21/A23 五锚漂移重锚+A6 缺位→实落+S2_DIR 三 proof 归档现位再锚（426e0b28 欠账）——逐值见收据 §0。**偏离十条**（cap/lint 红承登·基线红承登·S2_DIR 再锚·三静态 sha256/导出行再钉〔AG-COST2 臂自建再钉协议·rev3 基实测同值非本刀引入〕·runner 五触点注册·策略件落 receipts·sse-pump 唤醒源补全·新 proof 基座补齐·裁决④收敛）全数落收据 §4。**旧代码忽略恒正确**：interview_token_ch 双向共存零损害/token_delta 旧 web null 丢弃/onModelDelta additive TS 兼容/帧契约 v:1+loose/usage 数值面形不变——收据 §6 书面结论。**STOP=`stopped:exec_red_gate_budget`**（沿 AG38 先例·Status 不落 executed）·待协调方处置 cap+lint 预算后翻面 `executed:awaiting_post_prove_dual`·est live=0·markers 五类零命中·pins 十一值零翻·SSOT 四件+历史迁移零字节·⛔push。
