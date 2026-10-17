# SSE-API 子刀 REQUEST（批5 盘点 Top8 两件一卷·服务端 LISTEN 唤醒+客户端看门狗·零迁移·STOP=`executed:awaiting_post_prove_dual`）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落卷翻面·前值 `draft:awaiting_pre_exec_dual` 史录·本值为卷内三处锚定=①本卷头标题行+②本 Status 行+③§8 STOP 节·卷尾落款行不载 STOP 值防多锚漂移·沿 QUEUE-CLOSEOUT 先例「自述三处」形制·翻面行使=第三审 P2 复审 PASS×2 会签（席1 agent_870cfa7b+席2 agent_14342a4f）+协调方 EXEC 授权·post-prove 双审两独立外席待派·⛔push·⛔merge 主线·est live=0·`actualSpendCny=null`）。

**席位**：meetwise 战役「SSE-API 子刀」起草席（协调方派单令·批5 盘点席 Top8 两件一卷·同域两件=服务端唤醒+客户端看门狗·量级微·⛔push·⛔merge 主线）。

**立项出处（不自建 SSOT 行——行翻面权沿例归协调方）**：①批5 盘点席 Top8 派单令原文=「#139 健康通道下兜底 30s·LISTEN 掉线不唤醒·NOTIFY 丢失无补发」+「#58 web 客户端无心跳/空闲看门狗·半开 TCP 下 for await 永久挂起——同域两件（服务端唤醒+客户端看门狗）」（本席承令起草）；②issues-master #139/#58 行原文仓外（`issues-master.md` 本机外部件·不入仓·沿 SOP `:3` 基线注记与 QUEUE-CLOSEOUT #117 行同款登记·不阻起草）；③在树承引双锚=`harness/extreview-fix-campaign-SOP.md` `:40`「SSE-RESILIENCE：#53-56 重连/草稿/误降级/状态码分支/**#58 看门狗**/#127/**#139**/#184（与 TOKSTREAM S4d 面交叠——S4d 先行，本刀补 S4d 未覆盖面）」原文（本席亲读）+`harness/product-campaign-LEDGER.md` `:87` 5C 组行「**#139 多实例（留 5C-SSE-API 子刀）**」原文（本席亲读=本刀即被留之刃）；④目标规格=`requirements/use-cases/frontend-ux.md` `:282-305` UC-FE-BGTAB-001「后台标签页节流下的断线看门狗」（hidden 放宽阈值/暂停误判+单调时钟非 wall-clock+visible 不盲目重连·` :299` 刁钻项=时钟漂移/定时器节流致看门狗误判）；⑤机制蓝本=`apps/worker` job-wakeup-listener（`sse-notify.service.ts` `:19` docstring「生命周期蓝本 = apps/worker job-wakeup-listener(只复制不共享:**Ban 碰 worker wakeup 通道本体**)」原文）。

## §0 锚表（blob 级·对 base=origin/feat/mysql-schema-skeleton@`2c257eb0` 树亲 pin·**EXEC 届树重 pin=merge 782d37bb 并 origin/feat/mysql-schema-skeleton@23e80b40 后 16 锚逐一复验：15 锚 blob+行数恒等零漂·锚 13 LEDGER 漂移如实改登（ca8ab0d4/660L→7884c56a/665L·merge 携入翻面注记 +5 行·`:87` 5C 组行恒等亲证）**）

| # | 文件 | blob（@2c257eb0） | 行数 | 挂点/判读 |
|---|------|------------------|------|----------|
| 1 | `apps/api/src/platform/sse-notify.service.ts` | `dfda3b82` | 420L | `:19-26` 蓝本注记+单例纪律（禁每 SSE 一条 LISTEN）；`:127-128` 退避钉值 base=100ms/max=5s；`:150/:162-164` `state`/`health()`（同步读·pump 每循环迭代读一次）；`:322-323` `onClientError`/`onClientEnd`（掉线侦测=**仅 error/end 两事件**）；`:325-332` `loseClient`（degrade+scheduleReconnect+wakeAllWaiters 三连）；`:335-337` `wakeAllWaiters`（掉线即跨流全醒）；`:354-403` `establish`（LISTEN×3 通道+0143 trigger 实证 `:382-390`+healthy 翻面 `:391`）——**establish 成功后零活性探针=件A 修法面**（半开 TCP 下 error/end 皆不触发·state 停留 healthy·NOTIFY 静默全丢零检测） |
| 2 | `apps/api/src/platform/sse-pump.ts` | `21f52b34` | 208L | `:70` `HEALTHY_FALLBACK_MS = 30_000`（**件A 现值锚**·派单令「健康通道下兜底 30s」现形）；`:71` `DEGRADED_POLL_MS = 2_000`；`:171-174` 每循环同步读 `health()` 选臂；`:177` 兜底 timer；`:195` `fetchMore(lastSeq)`（**NOTIFY 序号补发既有载体**·seq>lastSeq 权威取数）；`:199` `: ping\n\n` 心跳载体（健康 30s/退化 2s cadence·仅唤醒后无事件拍发）——本刀零触本文件 |
| 3 | `apps/api/test/sse-push-notify.proof.ts` | `c0be2680` | 792L | P-1..P-5+BP-1..4 判别面在树（`:30-38` P-2c LISTEN 断连退避重连 100ms→5s 读数臂·`:16-17` P-3 close 即醒「健康态不滞留 30s」）=件A 门矩阵主邻面+探针臂语义对照面（本刀零触·回归门） |
| 4 | `apps/web/lib/stream/interview-stream.ts` | `b7556220` | 210L | `:102` `opts.open(lastEventId, signal)`；`:105` `for await (const chunk of stream)`（**件B 挂起面锚**·半开 TCP 下永久 pending）；`:109-112` sawTraffic/traffic 面（任意字节含 `: ping` 即重置失败预算=看门狗逐 chunk 重置的既有缝）；`:87-92` doze（resume 唤醒只作用于退避等待·对 for await 挂死无效）；`:138-177` catch 分类链+`:196-205` 失败预算/退避/Last-Event-ID 重连（**看门狗超时落点=既有传输错路径零新重连语义**） |
| 5 | `apps/web/lib/stream/sse-cursor.ts` | `b7ffd40d` | 143L | `:114-125` `iterateSseBody`（`:117` `getReader`·`:120` `await reader.read()`=半开 TCP 永久 pending 的底层挂起点）；本刀零触（取消经 fetch signal 传播至 reader） |
| 6 | `apps/web/lib/stream/backoff.ts` | `6fc223b5` | 49L | `:17-23` `ResumeSignals` 接口（onOnline/onVisible/onRetry·三驱动共用单源）；`:31-35` 生产钉值族（CLEAN_END_RECONNECT_MS=1_000/SSE_BACKOFF_BASE_MS=500/SSE_BACKOFF_CAP_MS=30_000）=**件B 新钉值 `SSE_IDLE_WATCHDOG_MS` 单源落点**+`onHidden` 可选接口扩位 |
| 7 | `apps/web/lib/hooks/useInterviewStream.ts` | `337a5a16` | 82L | `:31-46` `browserResumeSignals`（visibilitychange 已监听 visible 面·SSR 守卫·「三 hooks 共用(同构面单源)」注记）=件B `onHidden` 浏览器实现落点（hidden 臂同监听器补半·quiz/diagnosis hooks 零触即得） |
| 8 | `apps/web/lib/stream/quiz-stream.ts` | `ea37ed8f` | 157L | `:87`/`:89` 同形 open/for await 挂起面（**§1.3 扩族否决锚**·登记归后继） |
| 9 | `apps/web/lib/stream/diagnosis-stream.ts` | `ad4a344d` | 157L | `:87`/`:89` 同形（**§1.3 扩族否决锚**·登记归后继） |
| 10 | `apps/web/test/web-logic.proof.ts` | `a1548212` | 1990L | web 驱动回归门面（`:1307` iterateInterviewSseBody 消费面在树）——本刀零触（看门狗判别臂落**新 proof 文件**·本文件只作回归门零 hunk 触） |
| 11 | `apps/worker/src/job-wakeup-listener.ts` | `fc18131d` | 157L | LISTEN 生命周期蓝本（`:28-29` 同款 100ms/5s 退避·`:92-122` establish 形）——本刀零触（**Ban 碰 worker wakeup 通道本体**·`sse-notify.service.ts:19` 原文） |
| 12 | `ai-docs/delivery/harness/extreview-fix-campaign-SOP.md` | `eae68fe2` | 99L | `:40` SSE-RESILIENCE 行（#58 看门狗/#139 原文承引·翻面行使同拍面·本刀零触） |
| 13 | `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `7884c56a`（EXEC 届树重 pin·前值 `ca8ab0d4`/660L 史录） | 665L | `:87` 5C 组行「#139 多实例（留 5C-SSE-API 子刀）」（本刀立项在册锚·翻面笔落点·**本刀零触**·merge 携入翻面注记 +5 行后 `:87` 行位恒等亲证） |
| 14 | `ai-docs/requirements/use-cases/frontend-ux.md` | `9a06b7b4` | 1038L | `:282-305` UC-FE-BGTAB-001 看门狗目标规格（`:288-289` 主流程 hidden 放宽/visible 校正续读·`:299` 刁钻=单调时钟非 wall-clock·`:305-306` 验收两臂）=件B 语义对表（第三审 P2-②五处行号实值化·引文零改·`:299`/`:305-306` 届树亲证恰等） |
| 15 | `apps/api/package.json` | `266e64b8` | 119L | `:72-74` prove:sse-slot/s4b-delta-arm 门脚本在树=件A 新门 `prove:sse-listen-probe` script 行落点 |
| 16 | `apps/web/package.json` | `30723cd4` | 67L | `:8` `prove` 门脚本在树=件B 新门 `prove:sse-idle-watchdog` script 行落点 |

## §0.0 在飞扫描（2026-10-16 起草时点·base `2c257eb0`）

全本地 `line/*`（**rev2 时点本席亲测 243 枝含本刀枝 `line/sse-api-sub`·对 base 异己扫描面 242 枝=rev2 P2-8 钉值·起草时点 240 枝如实存史**）对 base 触面扫描（`git diff --name-only 2c257eb0...line/<b>` 逐枝跑·锚文件族=sse-notify/sse-pump/sse-push-notify.proof/interview-stream/sse-cursor/backoff/useInterviewStream/quiz-stream/diagnosis-stream/web-logic.proof/job-wakeup-listener）：实触三枝——①`line/errmsg-map`、②`line/model-token-stream` 各触 `apps/web/test/web-logic.proof.ts`（proof 面邻接）——本刀对 web-logic.proof.ts **零 hunk 触**（判别臂落新文件 `apps/web/test/sse-idle-watchdog.proof.ts`）→ 零交叠；③`line/sse-notify-push` 触 sse-notify/sse-pump/sse-push-notify.proof 三锚——该枝 tip `49535514` 系 SSE-PUSH nail 波旧形（早 base 7 日·与主线落点 `5fad2bc6` 同题名姊妹形·互非祖先——**rev2 P2-8 证据语换 is-ancestor 形：`git merge-base --is-ancestor 5fad2bc6 2c257eb0` YES 本席亲证=base 已含该 nail 波落点·原 `git cherry` 判等语作废**·沿 uc184-slot-order EXEC bd107773 交叠重扫先例「纯落后零前瞻」登记）→ 零前瞻交叠。并线序自由先并则重 pin 非停（ag20/sse-api-family/QUEUE-CLOSEOUT 先例同形）——**在飞并线预算口径（rev2 P1-4）=EXEC 时点 2216=cap 2216 恰等零余量·他刀先并侵余量则 sanction 先行（cap-2232 步进已在飞·届 cap 届时如实重 pin）**。**EXEC 届值（第三审 P2-③）=cap 2232 已随 merge 782d37bb 落树·届实跑 scanned 2225≤2232 余 7·零 sanction 触发（rev2「2216 恰等零余量」读数史录不洗）**。

## §1 修法（两件一卷·量级微·零迁移）

**件A（服务端唤醒·#139·LISTEN 活性探针补半开盲区）**：`sse-notify.service.ts` 单文件加**连接级活性看门狗**——`establish` 成功（`:391` healthy 翻面）后挂周期探针 timer（options 增 `probeIntervalMs`+`probeTimeoutMs` 两注入缝·缺省常量 `LISTEN_PROBE_MS = 10_000`/`LISTEN_PROBE_TIMEOUT_MS = 5_000`（**探针超时上界钉 ≤5s（rev2 P1-2）**·在池级 driver `query_timeout` 15s 兜底之内=进程自持窗紧于驱动兜底——`packages/db/src/principal.ts:968` `query_timeout ?? 15000` 亲证）；proof 确定性注入小值），到期对 `active` client 发 `SELECT 1`（探针在 service 层 timer·**通知回调内零 SQL 纪律零破**——`:21`/:294 纪律管 notify 回调·探针非回调路径）；**探针成功判据=query resolve 即健康·不校验 rowCount（rev2 P2-4·防假件 catch-all 返 `rowCount:0` 误降级）**；探针失败/**超时（rev2 P1-2 裁决=单击即 loseClient·零 K-连击缓冲——半开窗最小化）** → 走**既有** `loseClient('listen_down')`（`:325-332`）——degrade 结构化日志+`scheduleReconnect` 退避（`:127-128` 钉值 100ms→5s cap **零改**·「掉线快速重连」现值亲证在树即满足）+`wakeAllWaiters`（`:335-337` 掉线即跨流全醒）三链全复用零新语义；**outage 窗（loseClient 置 `active=undefined`（`:327`）至重连 establish 前）探针 tick 一律 no-op 零空引（rev2 P1-2）**；探针 timer 生命周期三挂点（rev2 P1-2 解挂-重挂点）=loseClient 即解挂/重连 establish 成功重挂/`stop()`（`:223-238`）清。语义定谳（本席亲读三面）：⑴**半开盲区现形**——掉线侦测面=仅 `:322-323` error/end 两事件，半开 TCP（NAT 超时/拔线无 FIN/RST）下两事件皆不触发 → `state` 停留 healthy（`:391` 后无任何翻转路径）→ pump 每循环读 `health()===true`（sse-pump `:172`）恒走 30s 兜底臂 → NOTIFY 静默全丢且进程内零检测通道——**半开窗检测非无上界（rev2 P1-2 权威口径·原「零检测无上界/挂死至进程终」语作废）**：R-22 TCP keepalive 已硬钉（`packages/db/src/principal.ts:961-962` `keepAlive: true`/`keepAliveInitialDelayMillis` 亲证）·半开检测存在内核上界（分钟级·平台依赖——`principal.ts:955-960` honest-boundary 注记原文「not reachable from this process」）·**本刀价值=检测窗从内核上界收敛为进程自持确定性窗+不依赖内核调优**；探针补齐后检测窗 ≤10s+探针超时上界 ≤5s → health 翻 false → pump 即回落 2s cadence+补偿拉取高频化。⑵**NOTIFY 序号补发定谳=既有面零新码**——notify 系 lossy hint（`:21-22` docstring「误醒空手 ping、漏醒由兜底收」原文），补发载体=pump `:195` `fetchMore(lastSeq)`（seq>lastSeq 权威取数·Last-Event-ID 重放同形 sse-pump `:24-25`）+掉线即醒立即补偿（`wakeAllWaiters`→被醒泵循环头 fetchMore）——「沿 event seq 补发」**已由既有臂承担**，本刀不改 NOTIFY 载荷/零触 0143 trigger（迁移面 Ban）；探针的净效果=把「seq 补偿 cadence」从半开窗下退化 30s 收敛回 2s。⑶**「健康通道下兜底 30s」现值维持**——30s 系 SSE-PUSH nail 协调方钉值（sse-pump `:60`「fallbackMsHealthy(生产钉 30s)」+sse-push-notify.proof `:25`「healthy fallback = 30s pinned in source」），系 lossy-hint 最终一致窗非缺陷面；半开害处由探针闭合非由下调兜底值（§1.3-4）。**判别臂**（新 proof `apps/api/test/sse-listen-probe.proof.ts`·假 connect/query 缝零库形·沿 job-wakeup-listener.proof 测试缝同构）：臂1 半开假件（LISTEN 后 query 永久 pending）→ 断言 `probeIntervalMs` 到点后探针受 `probeTimeoutMs` 上界单击判负（P2-4 判据=query resolve 不校验 rowCount）→ `health()` 翻 false+降级日志一行（`SSE_NOTIFY_DEGRADED reason=listen_down`）+在册等待者全醒（`waitingCount()→0`）；臂2 健康假件（query 即返）→ 恒 healthy 零误降零降级日志；臂3 探针失败后按退避重连成功 → healthy 复位+探针重挂；臂4 `stop()` 后探针 timer 清零（unref 面）。改前红论证=现码对臂1 恒 healthy 永不翻转（零探针路径）→ 断言 FAIL；改后绿。

**件B（客户端看门狗·#58·空闲超时断开重连）**：`interview-stream.ts` 驱动内加**连接级空闲看门狗**（框架无关·可注入单测）——每连接建 connAc（AbortController·`opts.signal` abort 链入·**转接监听器随该连接 finally 移除（rev2 P2-5·每连接挂/每连接卸——防跨连接监听器累积泄漏）**·卸载语义原值 `:96`/`:106`）；`opts.open` 传 `connAc.signal`（`StreamOpener` 签名 `(lastEventId, signal)` **零改**——真 fetch 流 abort 即传播至 `sse-cursor.ts:120` `reader.read()` reject）；**看门狗时钟锚=连接尝试起点（rev2 P1-3 权威钉值）**——connAc 建立（首连与重连每连接尝试同形）即起表·**盖 `await opts.open`（`:102`）挂死面**（open 永不 resolve 时逐 chunk 计时无从起表——时钟锚从迭代面改钉连接尝试起点）；迭代面逐 chunk 空闲计时（race 形·每 chunk 含 `: ping` 即重置——复用 `:109-112` 既有 traffic 缝语义）；超时（钉值 `SSE_IDLE_WATCHDOG_MS = 45_000` 单源 `backoff.ts`·**> 服务端健康静默上界 30s**（sse-pump `:70`）+一拍 jitter 余量·`opts.idleTimeoutMs` 注入缝·**45s 贴边注记（rev2 P2-8）=恰 30s 兜底+driver `query_timeout` 15s（`principal.ts:968`）之和=服务端最坏静默窗贴边值——仅「30s 兜底拍+该拍 fetchMore 拖满 query_timeout」极端尾可贴边误拍·误触发代价与预算消耗两观察见 §9-rev2 OBS-1/OBS-2**）→ connAc.abort()+迭代以 `sse_idle_watchdog` 错抛出 → 落**既有**传输错失败预算路径（`:138` catch→`:196-205` 退避+Last-Event-ID 凭 seq>lastId 重连）——**零新重连语义**（半开挂死从「永久」收敛为「≤45s 一拍重连」）。**后台标签护栏**（UC-FE-BGTAB-001 `:288-289`/`:299` 刁钻面对表）：`ResumeSignals` 增**可选** `onHidden(cb): () => void`（`backoff.ts` 单源·缺省 no-op——quiz/diagnosis 驱动零触零破）；`browserResumeSignals`（useInterviewStream.ts `:31-46`）于既有 visibilitychange 监听器补 hidden 臂（三 hooks 共用面零扩连接）；驱动 hidden 态**暂停看门狗判定**（单调时钟 performance.now 口径非 wall-clock·`:297` 时钟漂移/节流误判防御）、visible 恢复+立即判定一次（`:289`「不盲目重连：先凭 Last-Event-ID 校正/续读」=重连仍走既有路径非额外拨号）。语义定谳（本席亲读两面）：⑴**心跳帧定谳=服务端半已在树**——`: ping` 载体 sse-pump `:199`（健康 30s/退化 2s cadence·客户端 `:111` 收到任意字节已重置失败预算）——缺的是客户端「静默判定+超时断开」看门狗半，本刀只补客户端，服务端心跳零改。⑵**resumeSignals 救不了挂死**——`:87-92` doze 唤醒柄只作用于退避等待（`:205`），for await 挂死中驱动到不了 doze → visible/online 信号空转 → 看门狗是挂死唯一出口（派单令「永久挂起」现形锚）。**判别臂**（新 proof `apps/web/test/sse-idle-watchdog.proof.ts`·假 open 流零网络形）：臂1 半开假流（永不 yield 不 error）+注入 `idleTimeoutMs` 小值 → 断言超时后驱动进入重连（attempts 前进+重连 open 携 lastEventId 续读）；臂2 `onHidden` 假件下超时**不**触发（hidden 暂停·断言 reconnect 调用次数=0=UC-FE-BGTAB-001 `:305` 验收臂）+**hidden→visible 转移拍臂（rev2 P2-6·UC 验收第二行 `:306`「visible 化且流仍开 → 不重连；流已关 → 携 Last-Event-ID 重连一次」）**：visible 转移后立即判定一次——流仍开臂断言零重连·流已关臂断言携 lastEventId 重连恰一次；臂3 正常 chunk 流（含 `: ping` 字节）零误断；臂4 `opts.signal` abort 恒优先（看门狗不抢卸载语义）；臂5 超时后底层 connAc 已 abort（真流取消面·假件记录 abort 调用）；**臂6（rev2 P1-3 时钟锚判别臂）`await opts.open` 永不 resolve 假件 → 看门狗自连接尝试起点到点 → connAc.abort() → 驱动落既有重连路径（attempts 前进·重连 open 再拨）**。改前红论证=现码对臂1 永久挂死（for await 无出口）+对臂6 同样永久挂死（open pending 连迭代都进不去）→ 断言超时 FAIL；改后绿。

## §1.3 否决（候选在卷）

1. **SSE 全面重构否决**（派单令点名）：EventSource 换轨/自研帧协议/服务端推全量重构超「同域两件微刀」量级——既有 SSE-RESILIENCE 四刀（#53-56 重连/草稿/误降级/状态码分支）+SSE-PUSH nail（LISTEN/NOTIFY 通道健康分级）+TOKSTREAM S4b delta 臂六刀面已落主线且 proof 矩阵成熟（sse-push **48 臂·对届时实跑亲证**——rev2 P1-1 勘正·「35 臂」系 batch23 旧档作废/delta 21 臂/uc010 13 臂在树），重构= wash 六刀既有面零净收益。
2. **WebSocket 改造否决**（派单令点名）：同上+三重改写面——Next 同源代理（`route.ts` force-dynamic 透传 ReadableStream 形已过审 P0 鉴权修）、Last-Event-ID 游标语义、10min deadline 轮换——WS 升级路径全数重写且丢 HTTP 语义天然穿透代理层；两件缺陷（半开盲区/客户端挂死）均可在现 SSE 形内以微刀闭合。
3. **扩族否决**：quiz-stream.ts `:89`/diagnosis-stream.ts `:89` 同形挂起面的看门狗补齐登记归后继（本刀只钉 interview 驱动——沿 SSE-RESILIENCE「#243 audit scope = interview stream」同口径·`sse-cursor.ts:130` 注记原文）；服务端件A 因三控制器共用 sse-pump/sse-notify 单例而天然全族覆盖，客户端件B 不随修（每件独立可停·单刀可裁不做）。
4. **30s 兜底值下调否决**：HEALTHY_FALLBACK_MS=30_000 系 SSE-PUSH nail 协调方生产钉值（sse-push-notify.proof `:25`「30s pinned in source」在卷）——每降一档=全量空闲流 fetchMore SQL 频次线性上涨，且半开害处真根=LISTEN 假健康非兜底值本身（探针闭合后 30s 窗回归「lossy-hint 最终一致窗」设计位）；下调归协调方另裁，本刀零触 sse-pump.ts。
5. **NOTIFY 载荷改形/0143 trigger 改否决**：沿 event seq 补发已由 pump `:195` fetchMore 既有臂承担（件A 定谳⑵）——改 NOTIFY 载荷携 seq/trigger 本体=迁移面+全族联动，零补发净收益（补发语义=重放取数非重推通知）。

## §2 门矩阵（EXEC 期逐门亲跑·红停）

| 门 | 门名 | 判据 |
|----|------|------|
| G1 | prove:sse-push-notify | `pnpm sse-push:notify:prove`（隔离 runner+收据·raw=`run-e2e-isolated.mjs sse-push:notify:prove:raw`）EXIT=0 恰等基线 **48 臂（对届时实跑亲证——rev2 P1-1 权威钉值·在册亲跑 48=sse-api-family-REQUEST `:70`/`:122` 亲证·「35 臂」系 batch23 旧档作废·臂数口径差 rev2 §9 如实登记）**（P-1..P-5+BP 族零翻——件A 探针为 additive·健康路径 establish 形零改则零波及） |
| G2 | prove:sse-listen-probe | `pnpm -C apps/api prove:sse-listen-probe` EXIT=0（本刀新门·§1-件A 判别臂 4 臂全 PASS；改前红取证=stash `sse-notify.service.ts` 单文件跑臂1 FAIL 后恢复复跑绿·沿 QUEUE-CLOSEOUT 判别臂双向先例） |
| G3 | prove:sse-slot | `pnpm -C apps/api prove:sse-slot` EXIT=0（退化面回归——sse-principal-slot 自建 module 零 provider 形零波及） |
| G4 | prove:s4b-delta-arm | `pnpm -C apps/api prove:s4b-delta-arm` EXIT=0 恰等基线 21 臂（delta 臂邻面零翻） |
| G5 | uc010:sse-resume:prove | `pnpm uc010:sse-resume:prove` EXIT=0 恰等基线 13 臂（Last-Event-ID resume 语义零改面亲证） |
| G6 | prove:sse-idle-watchdog | `pnpm -C apps/web prove:sse-idle-watchdog` EXIT=0（本刀新门·§1-件B 判别臂 **6 臂**全 PASS——臂6=open 永不 resolve 超时判别臂（rev2 P1-3）·臂2 含 hidden→visible 转移拍（rev2 P2-6）；改前红=stash `interview-stream.ts` 跑臂1 挂死/FAIL 取证） |
| G7 | web prove | `pnpm -C apps/web prove` EXIT=0（web-logic 既有臂零翻——interview-stream 驱动既有语义回归面·`:1307` 消费面在树） |
| G8 | neg:interview | `pnpm neg:interview` EXIT=0 恰等基线（本刀零控制器触·api 零语义外溢面对届时实跑值亲证） |
| G9 | typecheck | `pnpm turbo typecheck --force` EXIT=0 8/8 包全绿 |
| G10 | lint | 五值贴边恰等届时基线零新警告（参考值=uc184 EXEC bd107773 时点 root 5235/web 601/api 1421/worker 954/ai-runtime 628·EXEC 树亲测重 pin） |
| G11 | docs:check | `node scripts/ai-docs/check-docs.mjs` EXIT=0 且 scanned ≤届 cap——**EXEC 届值（第三审 P2-③届值化）=届 cap 2232（`public-text-policy.mjs` `MAX_FILES = 2_232` 届树亲证·cap-2232 步进已随 merge 落树）·预期 scanned 按届实跑如实 pin（届实跑=2225 亲证≤2232 余 7·谱系=rev2 时点 2214+merge 携入受管新件+两新 proof `.ts` 各计 1）**（rev2「2216=cap 恰等零余量」口径随 cap 步进落树作废·史录不洗） |
| G12 | markers | 改动集五类标记词+行首冲突标记零命中 **0/0**（词面运行时组装防自指·`scripts/i6-239-gates.proof.mjs:151-163` 同源） |
| G13 | diff 面 | 恰 9 tracked：`sse-notify.service.ts`（探针）+`interview-stream.ts`（看门狗）+`backoff.ts`（钉值+onHidden 接口）+`useInterviewStream.ts`（hidden 臂实现）+`apps/api/package.json`+`apps/web/package.json`（各 1 script 行）+两新 proof 文件+本卷 `.md`；零迁移·零 tsbuildinfo 入卷·web-logic.proof.ts/sse-push-notify.proof.ts/sse-pump.ts/sse-cursor.ts 零字节触 |

## §3 边界

触面=§1 两件恰 4 src/4 门装（package.json×2）+2 新 proof+本卷 1 `.md`；sse-pump.ts 零触（件A 只动 service 探针·health() 语义原值·pump/三控制器零改）·0143 trigger 与 migrations 全目录零触·worker 零触（job-wakeup-listener 蓝本只读 Ban 碰本体）·quiz/diagnosis 驱动零触（扩族否决 §1.3-3）·控制器零触·Next 代理 route.ts 零触；消费侧重连语义零新增（件B 超时落既有传输错路径）；每件独立可停（单件法则——件A/件B 机制正交：进程内 LISTEN 池 vs 浏览器驱动循环）。

## §5 pins 十一值（照抄承登·EXEC/post 零翻）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null。

**Ban**：Ban 碰 worker wakeup 通道本体（`sse-notify.service.ts:19` 原文）·Ban 触 SSOT 行本体（LEDGER/checklist/SOP/issues 零字节改·#139/#58 行翻面权归协调方）·Ban 触 0143 trigger/NOTIFY 载荷（迁移面）·Ban 触 sse-pump.ts/HEALTHY_FALLBACK_MS 钉值 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · Ban 预支裁决（本刀零新裁决项）·Ban 扩族（quiz/diagnosis 驱动）·Ban 迁移面 · ⛔push · ⛔merge 主线 · ⛔force push · ⛔pull --rebase。

## §7 起草自检回执（本席亲跑）

- markers：本卷改动集（本卷 1 `.md`）五类词面运行时组装直扫=0 命中+全树行首冲突标记零命中（回执随 commit 叙词）。
- docs:check：起草时点本席亲跑 EXIT=0，scanned 2213 ≤cap 2216（余 3）；落卷后预期 2214（+本卷 1·余 2）。
- 基线：base=origin/feat/mysql-schema-skeleton@`2c257eb0`（fetch 后亲证 origin tip=`2c257eb0`·**tip≥92086586 等号成立**（`92086586` 系该线下游 fixture 承诺·`merge-base --is-ancestor` EXIT=0 亲证））；支线 `line/sse-api-sub`·工作树 `meetwise-sse2`（主仓 `git worktree add ../meetwise-sse2 -b line/sse-api-sub origin/feat/mysql-schema-skeleton` 本席亲立·直接落 origin tip 零 reset·upstream 已 unset 防误推）。
- est live=0（起草 docs-only·零容器零外呼零模型调用）·actualSpendCny=null。

## §8 停止条件 + STOP

**停止条件四类**：①单件法则=件A（服务端探针）/件B（客户端看门狗）机制独立，单件机制不满足可停单件余件继续（两件同卷不同进程域·互不阻塞）；②卷级门红全卷停（§2 任一门 EXEC 期红且非基线既红）；③现场漂移（锚漂超 ±3 且结论受影响·LEDGER `:87`「留 5C-SSE-API 子刀」登记被他刀先行行使→本刀立项锚作废如实改登）停手上报；④STOP 状态翻面权=pre-exec 双审 BOTH PASS 后归协调方（EXEC 授权随派单令）。

**STOP · `executed:awaiting_post_prove_dual`**（三处锚定=①卷头标题行+②Status 行+③本节·前值 `draft:awaiting_pre_exec_dual` 史录·翻面行使=pre-exec 双审 FAIL 回炉 rev2→第三审 P2 复审 PASS×2 会签（席1 agent_870cfa7b+席2 agent_14342a4f）+协调方 EXEC 授权随派单令·沿 QUEUE-CLOSEOUT 三处锚定制·EXEC 卷尾 §9 落门矩阵全表）。开工三条款：①pre-exec 双审 BOTH PASS（两独立外席·Ban self-approve）②协调方 EXEC 授权③零裁决前置（本刀零新裁决项·#117 式翻面笔无）。**EXEC 翻面同步注记（第三审 P2-④·两处 noted 之一）**：本节 STOP 值已随 EXEC 落码卷与标题行/Status 行三处同值翻面（`draft:awaiting_pre_exec_dual`→`executed:awaiting_post_prove_dual`·§9-rev2 尾同步注记为两处之二）·第三审 P2 修订清单五条随 EXEC 落点见 §9-EXEC·post-prove 双审两独立外席待派·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push。

## §9-rev2 修订卷（pre-exec 双审双 FAIL 回炉·协调方裁决落卷·append 注记形不洗史·**文面修订零码面**）

**授权链**：pre-exec 双审两独立外席互盲评审 **双 FAIL**（P1-1/P1-2 两席同发现·P1-3/P1-4 各席独发·P2 批量两席并报）→ 协调方逐条裁决（裁决原文各条在卷）→ rev2 修订席落卷（本席·零码面——⛔改码面全程遵守·diff 面仍=本卷 1 `.md`）。复审待派：rev2 后 pre-exec 双审复审·翻面权仍归协调方·**STOP=`draft:awaiting_pre_exec_dual` 维持·三处锚定未动**。

**P1 裁决四条落点**（「（裁决）」后为落点）：

1. **P1-1 G1 臂数（两席同发现）**：原 §2-G1+§1.3-1「恰等基线 35 臂」错——35 系 batch23 旧档（safewrite-backpressure-REQUEST `:74`/`:79` 在卷）。**裁决=改 48+「对届时实跑亲证」逃逸语**。落点=§2-G1/§1.3-1 已改。臂数口径三读如实登记：**在册亲跑 48**（sse-api-family-REQUEST `:70`「48 臂全绿·隔离收据 2026-10-16T10-12-28」+`:122`「sse-push 既有臂=48（亲跑亲证）」=裁决门值）；静态断言调用 **57**（本席 `A(` rg 计数亲证·与 family EXEC `9af6bb99` 卷面「sse-push 57 臂」恰等=含 P-2d N1-N6 八臂+P-2a 拆双臂的在树静态·family-REQUEST `:166` pre48→post57 同证）；裁决席复核静态读 **50**（在卷）。**三读不另裁·逃逸语「对届时实跑亲证」收口=门权威**。
2. **P1-2 探针超时缝（两席同发现）**：裁决六点全落 §1-件A——①`probeTimeoutMs` 注入缝+缺省钉 `LISTEN_PROBE_TIMEOUT_MS=5_000`（≤5s·在池级 driver `query_timeout` 15s 兜底之内）②单击即 loseClient 零 K-连击缓冲（半开窗最小化）③outage 窗 `active=undefined`（`:327`）探针 tick no-op④探针 timer 三挂点=loseClient 解挂/重连 establish 重挂/stop() 清⑤「检测窗 ≤10s+探针超时上界」口径⑥生产面 driver `query_timeout` 15s 兜底注记（`packages/db/src/principal.ts:968` 亲证）。**P1-1 席1 判决性证据采纳**：删「零检测无上界/挂死至进程终」——改「R-22 keepalive 已硬钉（`principal.ts:961-962` 亲证）·半开检测存在内核上界（分钟级·平台依赖·`principal.ts:955-960` honest-boundary 注记原文）·本刀价值=检测窗从内核上界收敛为进程自持确定性窗+不依赖内核调优」。落点=§1-件A 两段+臂1。
3. **P1-3 看门狗时钟锚（席2）**：裁决=改钉「连接尝试起点」（connAc 建立即起表·盖 `await opts.open`（`:102`）挂死面）+判别臂增「open 永不 resolve→超时 abort→重连」一臂。落点=§1-件B 时钟锚段+臂6·§2-G6「5 臂→6 臂」。
4. **P1-4 cap 算术（席2）**：裁决=§2-G11+§0.0 改「**EXEC=2216=cap 恰等零余量（两 proof `.ts` 各计 1）+他刀先并需 sanction 先行**」（届时 cap-2232 已在飞·如实更新届 cap 口径）。落点=§2-G11/§0.0 已改——原「+本卷 1=2214 预期·余 2」算术漏计两新 proof 文件作废；rev2 时点实测 2214 本席亲跑+2 proof=2216=cap（`public-text-policy.mjs` `MAX_FILES = 2_216` 现值亲证·cap-sanction-2216 在树 executed 面）。

**P2 裁决五条落点**：

5. **P2-4 探针成功判据**：query resolve 即健康·不校验 rowCount（假件 catch-all 返 `rowCount:0` 误降级防御）——落 §1-件A 探针句+臂1。
6. **P2-5 abort 转接监听清理**：`opts.signal`→connAc 转接监听器随该连接 finally 移除（每连接挂/每连接卸防跨连接累积泄漏）——落 §1-件B connAc 句。
7. **P2-6 UC 验收第二行拍臂**：hidden→visible 转移拍臂（UC-FE-BGTAB-001 `:306`「visible 化且流仍开 → 不重连；流已关 → 携 Last-Event-ID 重连一次」）——落 §1-件B 臂2 扩。
8. **P2-7 行号四处实值化（届树实测·本席逐一亲证）**：①R-22 keepalive=`packages/db/src/principal.ts:961-962`②driver `query_timeout` 15s=`principal.ts:968`③④在册亲跑 48=sse-api-family-REQUEST `:70`/`:122`。
9. **P2-8 §0.0 证据语+枝数+45s 贴边**：①cherry 证据语换 is-ancestor 形——`git merge-base --is-ancestor 5fad2bc6 2c257eb0` **YES** 本席亲证（`5fad2bc6`=与枝 tip `49535514` 同题名 SSE-PUSH nail 主线落点·枝 tip 对 base is-ancestor **NO**=姊妹旧形·故证据锚换主线落点）②枝数=对 base 异己扫描面 **242 枝**（rev2 时点亲测 `git branch --list 'line/*'`=243 含本刀枝）③45s 贴边注记=30s 兜底+driver query_timeout 15s 恰和（§1-件B）。

**OBS×2 观察登记（沿 P2×2+OBS 先例形·登记不阻审）**：

- **OBS-1 误触发代价**：45s 贴边极端尾（30s 兜底拍+该拍 fetchMore 拖满 query_timeout 15s）看门狗误拍一次=一次既有路径重连——Last-Event-ID 凭 seq>lastId 续读·零业务丢失·零新重连语义；代价上界=一拍重连。
- **OBS-2 watchdog 预算消耗**：每次看门狗触发（含误拍）消耗一档既有失败预算（`:196-205`）·连续误拍可致预算耗尽走既有放弃路径——真断线出口语义不变·预算消耗面提请 post 审阅注视。

**rev2 自检回执（本席届树亲跑 2026-10-16）**：markers=本卷改动集（本卷 1 `.md`）五类标记词运行时组装直扫 **0 命中**+全树行首冲突标记零命中；docs:check=EXIT=0 **scanned 2214**（≤cap 2216·余 2·与本卷落卷后预期恰等）——EXEC 预期=2216=cap 恰等零余量（+两 proof 各计 1·G11 亲证）。§7 起草时点读数（2213）如实存史不洗。est live=0（rev2 文面修订·零容器零外呼零模型调用）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 全程未犯·STOP=`draft:awaiting_pre_exec_dual` 维持。

**EXEC 翻面同步注记（第三审 P2-④·两处 noted 之二）**：本卷 STOP 三处锚定已于 EXEC 落码卷（merge 782d37bb 并 origin tip 23e80b40 后）同值翻面=`executed:awaiting_post_prove_dual`（前值史录不洗·§8 为三处之三注记位）·第三审 P2 修订清单五条（①件A+臂1 配对不变式+败者吞没②UC 五处行号实值化③G11 cap 届值化④本两处 noted⑤服务端重连抖动 OBS-3）随 EXEC 落点全录 §9-EXEC·rev2 文面届值（cap 2216/scanned 2214 等）以 §9-EXEC 届值化读数为准。

## §9-EXEC EXEC 落卷记录（第三审 P2 复审 PASS×2 会签+协调方 EXEC 授权随令全序执行·2026-10-17 届树亲跑·七字段在卷）

**①授权链**：起草 `cb7d49f6` → pre-exec 双审两独立外席互盲双 FAIL（P1×4+P2×5）→ rev2 修订卷 `3c38c858`（文面零码面）→ 第三审 P2 复审会签 **PASS×2（席1 agent_870cfa7b+席2 agent_14342a4f）** → 协调方授权 EXEC（第三审 P2 修订清单五条随 EXEC 落）→ 本卷 EXEC 落码。

**序1 并线**：fetch 亲证 origin/feat/mysql-schema-skeleton=`23e80b40`（届 tip≥23e80b40 等号成立）·merge-tree --write-tree 预演 EXIT=0 零冲突 → `git merge --no-ff origin/feat/mysql-schema-skeleton`=**merge `782d37bb`**（ort 自动并零冲突·SSOT 无交叠面并集解未触发·⛔pull --rebase 未用·⛔force push 未用；remote `ccl` 本地路径 fetch 失败与派单无关如实记）。

**序2 §0 全量重 pin**：16 锚对届树逐一复验——**15 锚 blob+行数恒等零漂**（件A/件B 修法面挂点 :322-323/:325-332/:327/:391/:223-238/:127-128/:102/:109-112/:196-205/:114-125/:31-46 全数恒等亲证）；**锚 13 LEDGER 漂移如实改登**（`ca8ab0d4`/660L→`7884c56a`/665L·merge 携入翻面注记 +5 行·`:87` 5C 组行行位恒等亲证）。

**序3 落码落点（恰 9 tracked·零迁移零 DDL 零 env 闸）**：件A `apps/api/src/platform/sse-notify.service.ts`=LISTEN 活性探针 additive（`LISTEN_PROBE_MS=10_000`+`LISTEN_PROBE_TIMEOUT_MS=5_000` 缺省钉+`probeIntervalMs`/`probeTimeoutMs` 两注入缝+**配对不变式恒 timeout<interval**+探针 timer 三挂点=loseClient 解挂/establish 成功重挂/stop() 清+probeOnce outage 窗 no-op+失败/超时**单击 loseClient** 零 K-连击+probeWithTimeout race 超时上界**胜者唯一·败者迟到 resolve/reject 吞没**+成功判据=query resolve 即健康不校验 rowCount·探针系 service 层 timer 路径非通知回调=回调内零 SQL 纪律零破·既有 loseClient/degrade/scheduleReconnect/wakeAllWaiters 三链零改复用·sse-pump.ts 零触）；件B `apps/web/lib/stream/backoff.ts`=`SSE_IDLE_WATCHDOG_MS=45_000` 钉值（>30s 健康静默上界+一拍 jitter 余量=30s 兜底+driver query_timeout 15s 贴边和）+`ResumeSignals.onHidden?` 可选接口（cb(hidden:boolean)·缺省 no-op·quiz/diagnosis 零触零破）；件B `apps/web/lib/stream/interview-stream.ts`=连接级空闲看门狗（connAc 每连接一建+opts.signal abort 转接链入**随连接 finally 移除=每连接挂/每连接卸**+**时钟锚=连接尝试起点** connAc 建即起表盖 await opts.open 挂死面+judgeIdle=hidden 暂停判定/超时 connAc.abort(reason=`sse_idle_watchdog`)/未到点重挂剩余窗+逐 chunk traffic 缝 touchIdle 重置+performance.now 单调时钟+onHidden 驱动级注册=hidden 摘表/visible 重挂新窗零重连+wake 既有 doze 唤醒携 Last-Event-ID 重连恰一次·超时落既有传输错失败预算路径零新重连语义·sse-cursor.ts 零字节触）；件B `apps/web/lib/hooks/useInterviewStream.ts`=browserResumeSignals 补 onHidden 实现（visibilitychange hidden 臂同缝 SSR 守卫 dispose 解绑）；门装两 package.json 各恰 1 script 行；两新 proof=`apps/api/test/sse-listen-probe.proof.ts`+`apps/web/test/sse-idle-watchdog.proof.ts`；本卷 `.md`。

**②门矩阵 G1-G13 届实跑全表（本席亲跑全绿）**：G1 prove:sse-push-notify EXIT=0（隔离收据 2026-10-17T12-26-53Z·runner 计 **57** 断言全绿零 FAIL——臂数三读如实记：在册词面 48=family-REQUEST `:70` 旧 blob `1a5f5a6f` 时点读数/静态断言调用 57=rg `A(` 亲证恰等 family EXEC `9af6bb99` 卷面/届实跑 57 本席亲证——逃逸语「对届时实跑亲证」收口=门权威·48→57 漂移=family EXEC P-2d+P-2a 增臂史录非本刀触[本刀零字节触该文件]）；G2 prove:sse-listen-probe EXIT=0（四臂 17 断言全 PASS·改前红=stash `sse-notify.service.ts` 单文件跑 LP-1 六断言 FAIL[恒 healthy 零探针路径]后恢复复跑绿亲证）；G3 prove:sse-slot EXIT=0；G4 prove:s4b-delta-arm EXIT=0；G5 uc010:sse-resume:prove EXIT=0 恰等基线 13 臂（隔离收据）；G6 prove:sse-idle-watchdog EXIT=0（**六臂 19 断言全 PASS**·臂对表=臂1 WD-1/臂2 WD-2+WD-3[hidden 暂停+visible 转移拍两半]/臂3 WD-3P[`: ping` 心跳流零误断·**EXEC 期补落——首版 proof 漏装自检发现补齐如实记**]/臂4 WD-4/臂5 WD-5/臂6 WD-6[open 永不 resolve 时钟锚臂]·改前红=stash `interview-stream.ts` 跑 WD-1/WD-5/WD-6 挂死 FAIL 后恢复复跑绿亲证）；G7 web prove EXIT=0 全部通过（web-logic 既有臂零翻）；G8 neg:interview EXIT=0（**107** 条负路径用例全绿=届实跑值亲证·本刀零控制器触）；G9 typecheck --force 8/8 全绿 0 cached；G10 lint --force 12/12 全绿 0 cached 五值贴边恰等机证（root 5235/web 601/api 1421/worker 954/ai-runtime 628 全 0 errors·改面四 web 文件零警告亲证——EXEC 中途 web 601 破帽红自纠=新 proof unused import ×2 清除+臂3 补落归 601 恰等·沿 WHG EXEC 红自纠先例·601 不放宽 pin 兑现）；G11 docs:check EXIT=0 **scanned 2225≤届 cap 2232 余 7**（P2-③ 届值化·`MAX_FILES=2_232` 届树亲证）；G12 markers=改动集五类标记词运行时组装直扫 **0 命中**+全树行首冲突标记零命中；G13 diff 面=恰 9 tracked 零迁移零 tsbuildinfo 入卷（web-logic.proof/sse-push-notify.proof/sse-pump/sse-cursor 零字节触亲证）。

**③diff 面**：恰 9 tracked=`sse-notify.service.ts`+`interview-stream.ts`+`backoff.ts`+`useInterviewStream.ts`+`apps/api/package.json`+`apps/web/package.json`+两新 proof+本卷 `.md`。

**第三审 P2 修订清单五条落点**：①配对不变式落件A 常量/options doc+proof LP-1.0/LP-2.0 断言注入同遵守；race 败者吞没落件A probeWithTimeout+proof LP-1.7（迟到 120ms rejection 零 unhandledRejection 亲证）②UC 五处行号实值化落 §0 锚 14+§1-件B 三处（引文零改·届树亲证 `:299`/`:305`/`:305-306` 恰等；**`:288-289`/`:289` 两处贴边注记=visible 校正续读行与「不盲目重连」引文实位 `:290`·右端 +1 贴边如实记提请 post 注视**）③G11 cap 届值化（cap 2232+scanned 2225 届实跑）落 §2-G11+§0.0④§8/§9-rev2 两处 noted 同步注记已落⑤服务端重连抖动=OBS-3 见下。

**OBS-3 服务端重连抖动（提请 post 注视）**：探针判负走既有 `scheduleReconnect`——`delayFor` 抖动带=75%~100%×退避档（base 100ms→cap 5s）·探针判负后实际重连时刻有档内 ≤25% 抖动（多客户端同拍判负防惊群既有语义零改）·半开检测窗上限=probeIntervalMs 10s+probeTimeoutMs 5s+重连抖动 ≤1 档·纯时序面零语义影响·登记 post 审阅注视（与 rev2 OBS-1/OBS-2 并读）。

**④STOP**=`executed:awaiting_post_prove_dual` 三处同值翻面（标题行/Status 行/§8·前值 `draft:awaiting_pre_exec_dual` 史录不洗·post-prove 双审两独立外席待派·翻面权归协调方）。**⑤est live=0**（隔离 runner 容器随收据自清·零长驻进程零外呼零模型调用）。**⑥actualSpendCny=null**。**⑦Ban 纪律**=worker wakeup 通道本体零触/SSOT 行本体零触（LEDGER `:87` 翻面权归协调方）/0143 trigger 与 migrations 全目录零触/sse-pump.ts 与 HEALTHY_FALLBACK_MS 钉值零触/quiz+diagnosis 驱动零触/控制器零触/self-approve 无/alone≠dual 遵守/⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase 全程未犯。
